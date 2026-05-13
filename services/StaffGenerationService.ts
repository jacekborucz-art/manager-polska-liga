import { Club, Region, StaffMember, StaffRole, StaffHistoryEntry } from '../types';
import { NameGeneratorService } from './NameGeneratorService';

const EUROPEAN_REGIONS: Region[] = [
  Region.ENGLAND,
  Region.GERMANY,
  Region.FRANCE,
  Region.SPAIN,
  Region.ITALY,
  Region.BALKANS,
  Region.CZ_SK,
  Region.SCANDINAVIA,
  Region.EX_USSR,
  Region.BALTIC,
  Region.ROMANIA,
];

export const STAFF_ROLE_ATTRS: Record<StaffRole, { key: string; label: string }[]> = {
  [StaffRole.ASSISTANT_COACH]: [
    { key: 'offensiveTactics',  label: 'Taktyka ofensywna' },
    { key: 'defensiveTactics',  label: 'Taktyka defensywna' },
    { key: 'motivation',        label: 'Motywacja zawodników' },
    { key: 'communication',     label: 'Komunikacja' },
    { key: 'opponentAnalysis',  label: 'Analiza przeciwnika' },
    { key: 'individualWork',    label: 'Praca indywidualna' },
    { key: 'dressingRoom',      label: 'Zarządzanie szatnią' },
    { key: 'experience',        label: 'Doświadczenie' },
  ],
  [StaffRole.GOALKEEPER_COACH]: [
    { key: 'gkTechnique',       label: 'Technika bramkarska' },
    { key: 'positioning',       label: 'Ustawianie się w bramce' },
    { key: 'footwork',          label: 'Gra nogami' },
    { key: 'reflexes',          label: 'Refleks i reakcja' },
    { key: 'mentalTraining',    label: 'Trening mentalny' },
    { key: 'defenseComm',       label: 'Komunikacja z obroną' },
    { key: 'penaltyAnalysis',   label: 'Analiza rzutów karnych' },
    { key: 'experience',        label: 'Doświadczenie' },
  ],
  [StaffRole.FITNESS_COACH]: [
    { key: 'periodization',     label: 'Periodyzacja treningowa' },
    { key: 'fitnessTests',      label: 'Testy wydolnościowe' },
    { key: 'nutrition',         label: 'Dietetyka' },
    { key: 'injuryPrevention',  label: 'Prewencja kontuzji' },
    { key: 'recovery',          label: 'Regeneracja' },
    { key: 'strengthTraining',  label: 'Trening siłowy' },
    { key: 'speedTraining',     label: 'Trening szybkościowy' },
    { key: 'experience',        label: 'Doświadczenie' },
  ],
  [StaffRole.VIDEO_ANALYST]: [
    { key: 'videoAnalysis',     label: 'Analiza video' },
    { key: 'tactics',           label: 'Taktyka' },
    { key: 'statsAnalysis',     label: 'Analiza danych statystycznych' },
    { key: 'scouting',          label: 'Skautowanie' },
    { key: 'reporting',         label: 'Tworzenie raportów' },
    { key: 'software',          label: 'Oprogramowanie analityczne' },
    { key: 'setPieces',         label: 'Analiza stałych fragmentów gry' },
    { key: 'experience',        label: 'Doświadczenie' },
  ],
  [StaffRole.PHYSIOTHERAPIST]: [
    { key: 'sportsMassage',     label: 'Masaż sportowy' },
    { key: 'rehabilitation',    label: 'Rehabilitacja' },
    { key: 'muscleInjuries',    label: 'Leczenie kontuzji mięśniowych' },
    { key: 'injuryPrevention',  label: 'Prewencja kontuzji' },
    { key: 'taping',            label: 'Taping i bandażowanie' },
    { key: 'manualTherapy',     label: 'Terapia manualna' },
    { key: 'matchRecovery',     label: 'Regeneracja po meczu' },
    { key: 'experience',        label: 'Doświadczenie' },
  ],
  [StaffRole.CLUB_DOCTOR]: [
    { key: 'diagnostics',       label: 'Diagnostyka' },
    { key: 'sportsSurgery',     label: 'Chirurgia sportowa' },
    { key: 'pharmacology',      label: 'Farmakologia' },
    { key: 'cardiology',        label: 'Kardiologia sportowa' },
    { key: 'injuryTreatment',   label: 'Leczenie kontuzji' },
    { key: 'medicalTests',      label: 'Badania medyczne' },
    { key: 'healthManagement',  label: 'Zarządzanie zdrowiem zawodnika' },
    { key: 'experience',        label: 'Doświadczenie' },
  ],
};

function rnd(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildAttributes(role: StaffRole, quality: number): Record<string, number> {
  const attrs = STAFF_ROLE_ATTRS[role];
  const result: Record<string, number> = {};
  attrs.forEach(({ key }, i) => {
    if (i < 3) {
      result[key] = Math.max(1, Math.min(20, quality + rnd(-2, 2)));
    } else if (i < 6) {
      result[key] = Math.max(1, Math.min(20, Math.round(quality * 0.65) + rnd(-2, 2)));
    } else {
      result[key] = Math.max(1, Math.min(20, Math.round(quality * 0.45) + rnd(-1, 2)));
    }
  });
  return result;
}

function ageForRole(role: StaffRole): number {
  switch (role) {
    case StaffRole.ASSISTANT_COACH:   return rnd(30, 60);
    case StaffRole.GOALKEEPER_COACH:  return rnd(32, 62);
    case StaffRole.FITNESS_COACH:     return rnd(26, 55);
    case StaffRole.VIDEO_ANALYST:     return rnd(23, 45);
    case StaffRole.PHYSIOTHERAPIST:   return rnd(26, 52);
    case StaffRole.CLUB_DOCTOR:       return rnd(30, 60);
  }
}

function salaryForReputation(reputation: number): number {
  let base: number;
  if (reputation <= 3)       base = rnd(24_000, 80_000);
  else if (reputation <= 6)  base = rnd(60_000, 150_000);
  else if (reputation <= 9)  base = rnd(100_000, 250_000);
  else if (reputation <= 14) base = rnd(200_000, 500_000);
  else                       base = rnd(400_000, 1_200_000);
  return Math.round(base / 1_000) * 1_000;
}

function qualityForReputation(reputation: number): number {
  if (reputation <= 3)       return rnd(2, 7);
  if (reputation <= 6)       return rnd(5, 11);
  if (reputation <= 9)       return rnd(8, 14);
  if (reputation <= 14)      return rnd(11, 17);
  return rnd(14, 20);
}

function contractEnd(yearsAhead: number): string {
  const d = new Date(2025, 6, 1); // 1 lipca 2025
  d.setFullYear(d.getFullYear() + yearsAhead);
  return d.toISOString();
}

function createStaffMember(
  role: StaffRole,
  reputation: number,
  isPolish: boolean,
  clubId: string | null,
  clubName: string | null
): StaffMember {
  const region = isPolish ? Region.POLAND : pickFrom(EUROPEAN_REGIONS);
  const namePair = NameGeneratorService.getRandomName(region);
  const quality = qualityForReputation(reputation);
  const history: StaffHistoryEntry[] = clubId && clubName
    ? [{ clubId, clubName, fromYear: 2025, fromMonth: 7, toYear: null, toMonth: null }]
    : [];

  return {
    id: `STAFF_${Math.random().toString(36).substr(2, 9)}`,
    firstName: namePair.firstName,
    lastName: namePair.lastName,
    age: ageForRole(role),
    nationality: region,
    nationalityFlag: isPolish ? '🇵🇱' : '🌍',
    role,
    attributes: buildAttributes(role, quality),
    currentClubId: clubId,
    hiredDate: new Date(2025, 6, 1).toISOString(),
    contractEndDate: contractEnd(rnd(1, 3)),
    salary: salaryForReputation(reputation),
    history,
  };
}

type StaffCount = {
  assistants: number;
  gkCoaches: number;
  fitnessCoaches: number;
  analysts: number;
  physios: number;
  doctors: number;
};

function staffCountForReputation(reputation: number): StaffCount {
  if (reputation <= 3) {
    return {
      assistants: 1,
      gkCoaches: 1,
      fitnessCoaches: rnd(0, 1),
      analysts: 0,
      physios: rnd(1, 2),
      doctors: rnd(0, 1),
    };
  }
  if (reputation <= 6) {
    return {
      assistants: 1,
      gkCoaches: 1,
      fitnessCoaches: 1,
      analysts: rnd(0, 1),
      physios: 2,
      doctors: 1,
    };
  }
  if (reputation <= 9) {
    return {
      assistants: rnd(1, 2),
      gkCoaches: 1,
      fitnessCoaches: 1,
      analysts: 1,
      physios: rnd(2, 3),
      doctors: 1,
    };
  }
  if (reputation <= 14) {
    return {
      assistants: 2,
      gkCoaches: rnd(1, 2),
      fitnessCoaches: 2,
      analysts: rnd(1, 2),
      physios: rnd(3, 4),
      doctors: 1,
    };
  }
  return {
    assistants: rnd(2, 3),
    gkCoaches: 2,
    fitnessCoaches: rnd(2, 3),
    analysts: 2,
    physios: rnd(4, 5),
    doctors: rnd(1, 2),
  };
}

function generateForClub(club: Club): StaffMember[] {
  const counts = staffCountForReputation(club.reputation);
  const isPolishClub = club.leagueId !== 'L_CL' && club.leagueId !== 'L_EL' && club.leagueId !== 'L_CONF';
  const result: StaffMember[] = [];

  const add = (role: StaffRole, n: number) => {
    for (let i = 0; i < n; i++) {
      const polish = isPolishClub ? Math.random() < 0.85 : false;
      result.push(createStaffMember(role, club.reputation, polish, club.id, club.name));
    }
  };

  add(StaffRole.ASSISTANT_COACH, counts.assistants);
  add(StaffRole.GOALKEEPER_COACH, counts.gkCoaches);
  add(StaffRole.FITNESS_COACH, counts.fitnessCoaches);
  add(StaffRole.VIDEO_ANALYST, counts.analysts);
  add(StaffRole.PHYSIOTHERAPIST, counts.physios);
  add(StaffRole.CLUB_DOCTOR, counts.doctors);

  return result;
}

const FREE_AGENT_ROLES: StaffRole[] = [
  StaffRole.ASSISTANT_COACH,
  StaffRole.GOALKEEPER_COACH,
  StaffRole.FITNESS_COACH,
  StaffRole.VIDEO_ANALYST,
  StaffRole.PHYSIOTHERAPIST,
  StaffRole.CLUB_DOCTOR,
];

function generateFreeAgents(count: number): StaffMember[] {
  const result: StaffMember[] = [];
  for (let i = 0; i < count; i++) {
    const isPolish = Math.random() < 0.90;
    const role = FREE_AGENT_ROLES[i % FREE_AGENT_ROLES.length];
    const reputation = rnd(1, 10);
    result.push(createStaffMember(role, reputation, isPolish, null, null));
  }
  return result;
}

export const StaffGenerationService = {
  generateInitialStaff(clubs: Club[]): { staffMembers: Record<string, StaffMember>; updatedClubs: Club[] } {
    const staffMembers: Record<string, StaffMember> = {};

    clubs.forEach(club => {
      const staff = generateForClub(club);
      club.staffIds = staff.map(s => s.id);
      staff.forEach(s => { staffMembers[s.id] = s; });
    });

    const freeAgents = generateFreeAgents(400);
    freeAgents.forEach(s => { staffMembers[s.id] = s; });

    return { staffMembers, updatedClubs: clubs };
  },
};
