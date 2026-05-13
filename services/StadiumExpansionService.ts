
import { BoardAttributeLevel, Club, StadiumExpansionPhase, StadiumExpansionProject, StadiumStand } from '../types';

export interface ExpansionEligibility {
  eligible: boolean;
  reasons: string[];
}

export interface StadiumPhaseAdvanceEvent {
  projectId: string;
  stand: StadiumStand;
  newPhase: StadiumExpansionPhase;
  subject: string;
  body: string;
  isGoodNews: boolean;
  capacityAdded?: number;
  costDeducted?: number;
}

export interface StadiumAdvanceDayResult {
  updatedClub: Club;
  events: StadiumPhaseAdvanceEvent[];
}

const MIN_REPUTATION: Record<StadiumStand, number> = {
  MAIN_STAND:     3,
  OPPOSITE_STAND: 5,
  NORTH_END:      4,
  SOUTH_END:      4,
  LIGHTING:       3,
  VIP_BOXES:      8,
};

const COST_PER_SEAT: Record<StadiumStand, number> = {
  MAIN_STAND:     4500,
  OPPOSITE_STAND: 3200,
  NORTH_END:      2800,
  SOUTH_END:      2800,
  LIGHTING:       600000,
  VIP_BOXES:      12000,
};

const DEFAULT_INCREASE: Record<StadiumStand, number> = {
  MAIN_STAND:     1500,
  OPPOSITE_STAND: 1000,
  NORTH_END:      800,
  SOUTH_END:      800,
  LIGHTING:       0,
  VIP_BOXES:      200,
};

export const STAND_OPTIONS: { stand: StadiumStand }[] = [
  { stand: 'MAIN_STAND' },
  { stand: 'OPPOSITE_STAND' },
  { stand: 'NORTH_END' },
  { stand: 'SOUTH_END' },
  { stand: 'LIGHTING' },
  { stand: 'VIP_BOXES' },
];

const hashSeed = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(Math.sin(h) * 10000) % 1;
};

const levelToScore = (level?: BoardAttributeLevel): number => {
  const scores: Record<BoardAttributeLevel, number> = {
    bardzo_niska: 1, niska: 2, przecietna: 3, wysoka: 4, bardzo_wysoka: 5,
  };
  return level ? (scores[level] ?? 3) : 3;
};

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const getConstructionDays = (stand: StadiumStand, increase: number, seed: number): number => {
  if (stand === 'LIGHTING' || stand === 'VIP_BOXES') return 60 + Math.floor(seed * 30);
  if (increase <= 500)  return 120 + Math.floor(seed * 60);
  if (increase <= 1500) return 180 + Math.floor(seed * 90);
  if (increase <= 3000) return 270 + Math.floor(seed * 150);
  return 420 + Math.floor(seed * 120);
};

const advancePhase = (
  club: Club,
  project: StadiumExpansionProject,
  currentDate: string,
): { updatedProject: StadiumExpansionProject; updatedClub: Club; event: StadiumPhaseAdvanceEvent } | null => {
  const s1 = hashSeed(project.id + project.phase + 'outcome');
  const s2 = hashSeed(project.id + project.phase + 'duration');
  const standLabel = StadiumExpansionService.getStandLabel(project.stand);

  switch (project.phase) {
    case 'BOARD_REVIEW': {
      const boardScore = levelToScore(club.board?.hojnosc) + levelToScore(club.board?.ambicja);
      const approvalChance = 0.55 + boardScore * 0.04;
      const approved = s1 < approvalChance;

      if (!approved) {
        const updatedProject: StadiumExpansionProject = {
          ...project,
          phase: 'REJECTED',
          phaseEndDate: currentDate,
          log: [...project.log, { date: currentDate, message: 'Zarząd odrzucił wniosek o rozbudowę.', type: 'WARNING' }],
        };
        return {
          updatedProject,
          updatedClub: {
            ...club,
            stadiumExpansionProjects: (club.stadiumExpansionProjects ?? []).map(p =>
              p.id === project.id ? updatedProject : p
            ),
          },
          event: {
            projectId: project.id, stand: project.stand, newPhase: 'REJECTED',
            subject: `Zarząd odrzucił wniosek — ${standLabel}`,
            body: `Szanowny Panie Menedżerze,\n\nPo analizie sytuacji sportowej i finansowej klubu, zarząd podjął decyzję o odrzuceniu wniosku o rozbudowę (${standLabel}).\n\nPodstawowe przyczyny: niewystarczający potencjał finansowy lub zbyt niska reputacja w stosunku do planowanej inwestycji. Prosimy o ponowne złożenie wniosku w stosownym czasie.\n\nZ poważaniem,\nZarząd Klubu`,
            isGoodNews: false,
          },
        };
      }

      const feasDays = 42 + Math.floor(s2 * 28);
      const updatedProject: StadiumExpansionProject = {
        ...project,
        phase: 'FEASIBILITY_STUDY',
        phaseEndDate: addDays(currentDate, feasDays),
        log: [...project.log, { date: currentDate, message: 'Zarząd zaakceptował wniosek. Zlecono analizę wykonalności.', type: 'SUCCESS' }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          stadiumExpansionProjects: (club.stadiumExpansionProjects ?? []).map(p =>
            p.id === project.id ? updatedProject : p
          ),
        },
        event: {
          projectId: project.id, stand: project.stand, newPhase: 'FEASIBILITY_STUDY',
          subject: `Zarząd zaakceptował wniosek — ${standLabel}`,
          body: `Szanowny Panie Menedżerze,\n\nZarząd po rozpatrzeniu wniosku wyraża zgodę na zlecenie analizy wykonalności rozbudowy (${standLabel}).\n\nAnaliza potrwa około ${Math.round(feasDays / 7)} tygodni. Po jej zakończeniu zostanie Pan poinformowany o wynikach i kosztach wstępnych.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
        },
      };
    }

    case 'FEASIBILITY_STUDY': {
      const feasCost = Math.round(50000 + s1 * 200000);
      const permDays = 56 + Math.floor(s2 * 84);
      const updatedProject: StadiumExpansionProject = {
        ...project,
        phase: 'PLANNING_PERMISSION',
        phaseEndDate: addDays(currentDate, permDays),
        feasibilityCost: feasCost,
        log: [...project.log, {
          date: currentDate,
          message: `Analiza wykonalności zakończona. Koszt: ${feasCost.toLocaleString('pl-PL')} PLN. Składamy wniosek o pozwolenie na budowę.`,
          type: 'COST',
        }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          budget: club.budget - feasCost,
          stadiumExpansionProjects: (club.stadiumExpansionProjects ?? []).map(p =>
            p.id === project.id ? updatedProject : p
          ),
        },
        event: {
          projectId: project.id, stand: project.stand, newPhase: 'PLANNING_PERMISSION',
          subject: `Analiza wykonalności gotowa — ${standLabel}`,
          body: `Szanowny Panie Menedżerze,\n\nAnaliza wykonalności rozbudowy (${standLabel}) została zakończona.\n\nKoszt analizy: ${feasCost.toLocaleString('pl-PL')} PLN (pobrany z budżetu klubu).\n\nWniosek o pozwolenie na budowę został złożony do urzędu miejskiego. Oczekiwany czas rozpatrzenia: ${Math.round(permDays / 7)} tygodni.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
          costDeducted: feasCost,
        },
      };
    }

    case 'PLANNING_PERMISSION': {
      const outcome = s1 < 0.70 ? 'APPROVED' : s1 < 0.85 ? 'REJECTED' : 'CONDITIONAL';
      const tenderDays = 21 + Math.floor(s2 * 14);

      if (outcome === 'REJECTED') {
        const updatedProject: StadiumExpansionProject = {
          ...project,
          phase: 'REJECTED',
          phaseEndDate: currentDate,
          log: [...project.log, { date: currentDate, message: 'Urząd miejski odmówił wydania pozwolenia na budowę.', type: 'WARNING' }],
        };
        return {
          updatedProject,
          updatedClub: {
            ...club,
            stadiumExpansionProjects: (club.stadiumExpansionProjects ?? []).map(p =>
              p.id === project.id ? updatedProject : p
            ),
          },
          event: {
            projectId: project.id, stand: project.stand, newPhase: 'REJECTED',
            subject: `Odmowa pozwolenia na budowę — ${standLabel}`,
            body: `Szanowny Panie Menedżerze,\n\nUrząd miejski odmówił wydania pozwolenia na budowę dla inwestycji (${standLabel}).\n\nPodstawą decyzji są zastrzeżenia dotyczące zgodności z miejscowym planem zagospodarowania przestrzennego. Mogą Państwo złożyć nowy wniosek po upływie 6 miesięcy.\n\nZ poważaniem,\nZarząd Klubu`,
            isGoodNews: false,
          },
        };
      }

      const conditionalSeed = hashSeed(project.id + 'conditional_reduction');
      const approvedIncrease = outcome === 'CONDITIONAL'
        ? Math.round(project.requestedCapacityIncrease * (0.55 + conditionalSeed * 0.3))
        : project.requestedCapacityIncrease;

      const updatedProject: StadiumExpansionProject = {
        ...project,
        phase: 'TENDER',
        phaseEndDate: addDays(currentDate, tenderDays),
        approvedCapacityIncrease: approvedIncrease,
        log: [...project.log, {
          date: currentDate,
          message: outcome === 'CONDITIONAL'
            ? `Pozwolenie wydane z warunkami. Zatwierdzona pojemność: +${approvedIncrease} miejsc (ograniczona z ${project.requestedCapacityIncrease}). Przetarg w toku.`
            : `Pozwolenie na budowę uzyskane. Ogłaszamy przetarg na wykonawcę.`,
          type: 'SUCCESS',
        }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          stadiumExpansionProjects: (club.stadiumExpansionProjects ?? []).map(p =>
            p.id === project.id ? updatedProject : p
          ),
        },
        event: {
          projectId: project.id, stand: project.stand, newPhase: 'TENDER',
          subject: outcome === 'CONDITIONAL'
            ? `Pozwolenie warunkowe — ${standLabel}`
            : `Pozwolenie na budowę uzyskane — ${standLabel}`,
          body: outcome === 'CONDITIONAL'
            ? `Szanowny Panie Menedżerze,\n\nUrząd miejski wydał pozwolenie na budowę z warunkami. Ze względu na ograniczenia infrastruktury technicznej, zatwierdzona pojemność to +${approvedIncrease} miejsc (zamiast planowanych ${project.requestedCapacityIncrease}).\n\nRozpoczynamy przetarg na wybór wykonawcy budowy.\n\nZ poważaniem,\nZarząd Klubu`
            : `Szanowny Panie Menedżerze,\n\nUrząd miejski wydał pozwolenie na budowę dla inwestycji (${standLabel}).\n\nPozwolenie obejmuje powiększenie pojemności o +${approvedIncrease} miejsc. Ogłaszamy przetarg na wykonawcę — wybór nastąpi w ciągu ${Math.round(tenderDays / 7)} tygodni.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
        },
      };
    }

    case 'TENDER': {
      const finalIncrease = project.approvedCapacityIncrease ?? project.requestedCapacityIncrease;
      const baseCost = StadiumExpansionService.estimateCost(project.stand, finalIncrease);
      const totalCost = Math.round(baseCost * (0.88 + s1 * 0.24));
      const constructDays = getConstructionDays(project.stand, finalIncrease, s2);
      const updatedProject: StadiumExpansionProject = {
        ...project,
        phase: 'CONSTRUCTION',
        phaseEndDate: addDays(currentDate, constructDays),
        totalCost,
        contractorTier: 'BALANCED',
        log: [...project.log, {
          date: currentDate,
          message: `Wyłoniono wykonawcę. Koszt inwestycji: ${totalCost.toLocaleString('pl-PL')} PLN. Czas budowy: ok. ${Math.round(constructDays / 30)} mies.`,
          type: 'INFO',
        }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          stadiumExpansionProjects: (club.stadiumExpansionProjects ?? []).map(p =>
            p.id === project.id ? updatedProject : p
          ),
        },
        event: {
          projectId: project.id, stand: project.stand, newPhase: 'CONSTRUCTION',
          subject: `Budowa rozpoczęta — ${standLabel}`,
          body: `Szanowny Panie Menedżerze,\n\nWyłoniono wykonawcę rozbudowy stadionu (${standLabel}).\n\nCalkowity koszt inwestycji: ${totalCost.toLocaleString('pl-PL')} PLN.\nSzacowany czas budowy: ok. ${Math.round(constructDays / 30)} miesięcy.\n\nFinansowanie zostanie omówione przez zarząd przed wystawieniem pierwszej faktury.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
        },
      };
    }

    case 'CONSTRUCTION': {
      const delayChance = 0.12;
      const constructionSeed = hashSeed(project.id + 'CONSTRUCTION' + currentDate);
      const hasDelay = constructionSeed < delayChance;
      if (hasDelay) {
        const delayDays = 14 + Math.floor(hashSeed(project.id + 'CONSTRUCTION_DELAY' + currentDate) * 28);
        const updatedProject: StadiumExpansionProject = {
          ...project,
          phaseEndDate: addDays(project.phaseEndDate, delayDays),
          log: [...project.log, {
            date: currentDate,
            message: `Opóźnienie budowy o ${delayDays} dni — problemy techniczne z wykonawcą.`,
            type: 'DELAY',
          }],
        };
        return {
          updatedProject,
          updatedClub: {
            ...club,
            stadiumExpansionProjects: (club.stadiumExpansionProjects ?? []).map(p =>
              p.id === project.id ? updatedProject : p
            ),
          },
          event: {
            projectId: project.id, stand: project.stand, newPhase: 'CONSTRUCTION',
            subject: `Opóźnienie budowy — ${standLabel}`,
            body: `Szanowny Panie Menedżerze,\n\nWykonawca zgłosił problemy techniczne na placu budowy (${standLabel}). Termin zakończenia prac przesuwa się o ${delayDays} dni.\n\nNadzorujemy sytuację i będziemy Pana na bieżąco informować.\n\nZ poważaniem,\nZarząd Klubu`,
            isGoodNews: false,
          },
        };
      }

      const inspDays = 14;
      const updatedProject: StadiumExpansionProject = {
        ...project,
        phase: 'SAFETY_INSPECTION',
        phaseEndDate: addDays(currentDate, inspDays),
        log: [...project.log, { date: currentDate, message: 'Budowa zakończona. Zlecono odbiór techniczny.', type: 'SUCCESS' }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          stadiumExpansionProjects: (club.stadiumExpansionProjects ?? []).map(p =>
            p.id === project.id ? updatedProject : p
          ),
        },
        event: {
          projectId: project.id, stand: project.stand, newPhase: 'SAFETY_INSPECTION',
          subject: `Budowa zakończona, odbiór techniczny — ${standLabel}`,
          body: `Szanowny Panie Menedżerze,\n\nWykonawca zakończył prace budowlane (${standLabel}). Zlecono odbiór techniczny obiektu przez nadzór budowlany.\n\nObiór zajmie ok. 2 tygodnie. Po pozytywnym wyniku trybuna zostanie oficjalnie otwarta.\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
        },
      };
    }

    case 'SAFETY_INSPECTION': {
      const finalIncrease = project.approvedCapacityIncrease ?? project.requestedCapacityIncrease;
      const updatedProject: StadiumExpansionProject = {
        ...project,
        phase: 'COMPLETED',
        phaseEndDate: currentDate,
        log: [...project.log, {
          date: currentDate,
          message: `Odbiór techniczny pozytywny. Pojemność stadionu wzrosła o +${finalIncrease} miejsc.`,
          type: 'SUCCESS',
        }],
      };
      return {
        updatedProject,
        updatedClub: {
          ...club,
          stadiumCapacity: club.stadiumCapacity + finalIncrease,
          stadiumExpansionProjects: (club.stadiumExpansionProjects ?? []).map(p =>
            p.id === project.id ? updatedProject : p
          ),
        },
        event: {
          projectId: project.id, stand: project.stand, newPhase: 'COMPLETED',
          subject: `Rozbudowa zakończona! ${standLabel} gotowa`,
          body: `Szanowny Panie Menedżerze,\n\nZ radością informujemy, że rozbudowa ${standLabel.toLowerCase()} stadionu ${club.stadiumName} została pomyślnie zakończona i odebrana przez nadzór budowlany.\n\nPojemność stadionu wzrosła o +${finalIncrease} miejsc.\nNowa pojemność: ${(club.stadiumCapacity + finalIncrease).toLocaleString('pl-PL')} miejsc.\n\nKibice z niecierpliwością czekają na nowe trybuny!\n\nZ poważaniem,\nZarząd Klubu`,
          isGoodNews: true,
          capacityAdded: finalIncrease,
        },
      };
    }

    default:
      return null;
  }
};

export class StadiumExpansionService {
  static getStandLabel(stand: StadiumStand): string {
    const labels: Record<StadiumStand, string> = {
      MAIN_STAND:     'Trybuna Główna',
      OPPOSITE_STAND: 'Trybuna Naprzeciwko',
      NORTH_END:      'Trybuna Północna',
      SOUTH_END:      'Trybuna Południowa',
      LIGHTING:       'Oświetlenie',
      VIP_BOXES:      'Loże VIP',
    };
    return labels[stand];
  }

  static getPhaseLabel(phase: StadiumExpansionPhase): string {
    const labels: Record<StadiumExpansionPhase, string> = {
      BOARD_REVIEW:       'Rozpatrzenie przez zarząd',
      FEASIBILITY_STUDY:  'Analiza wykonalności',
      PLANNING_PERMISSION:'Pozwolenie na budowę',
      TENDER:             'Przetarg wykonawcy',
      CONSTRUCTION:       'Budowa',
      SAFETY_INSPECTION:  'Odbiór techniczny',
      COMPLETED:          'Zakończone',
      REJECTED:           'Odrzucone',
    };
    return labels[phase];
  }

  static estimateCost(stand: StadiumStand, requestedIncrease: number): number {
    if (stand === 'LIGHTING') return COST_PER_SEAT.LIGHTING;
    return Math.round(requestedIncrease * COST_PER_SEAT[stand]);
  }

  static getDefaultIncrease(stand: StadiumStand): number {
    return DEFAULT_INCREASE[stand];
  }

  static checkEligibility(club: Club, stand: StadiumStand, attendanceHistory: number[]): ExpansionEligibility {
    const reasons: string[] = [];

    if (club.reputation < MIN_REPUTATION[stand]) {
      reasons.push(`Reputacja (${club.reputation}) zbyt niska — wymagana: ${MIN_REPUTATION[stand]}`);
    }

    const BIG_STADIUM_THRESHOLD = 30_000;
    const ABSOLUTE_CAP          = 45_000;

    if (club.stadiumCapacity >= ABSOLUTE_CAP) {
      reasons.push('Zarząd odmawia dalszej rozbudowy — obiekt osiągnął rozmiar areny narodowej');
    }

    if (attendanceHistory.length >= 5) {
      const avg      = attendanceHistory.reduce((a, b) => a + b, 0) / attendanceHistory.length;
      const fillRate = avg / club.stadiumCapacity;

      if (club.stadiumCapacity >= BIG_STADIUM_THRESHOLD && club.stadiumCapacity < ABSOLUTE_CAP) {
        const requiredFill = club.reputation >= 9 ? 0.75 : 0.80;
        if (fillRate < requiredFill) {
          reasons.push(
            `Zarząd uważa, że stadion (${club.stadiumCapacity.toLocaleString('pl-PL')} miejsc) jest na chwilę obecną wystarczający` +
            ` — wymagana frekwencja ${Math.round(requiredFill * 100)}% (obecna: ${Math.round(fillRate * 100)}%)`
          );
        }
      } else if (fillRate < 0.65) {
        reasons.push(`Średnia frekwencja (${Math.round(fillRate * 100)}%) poniżej 65% pojemności`);
      }
    }

    const active = club.stadiumExpansionProjects ?? [];
    if (active.some(p => p.stand === stand && p.phase !== 'COMPLETED' && p.phase !== 'REJECTED')) {
      reasons.push('Rozbudowa tej trybuny już jest w toku');
    }

    if (club.budget < StadiumExpansionService.estimateCost(stand, DEFAULT_INCREASE[stand]) * 0.2) {
      reasons.push('Niewystarczający budżet klubu');
    }

    return { eligible: reasons.length === 0, reasons };
  }

  static createRequest(
    clubId: string,
    stand: StadiumStand,
    requestedIncrease: number,
    currentDate: string,
  ): StadiumExpansionProject {
    const id = `exp_${clubId}_${stand}_${Date.now()}`;
    const end = addDays(currentDate, 14 + Math.floor(hashSeed(id) * 14));
    return {
      id,
      stand,
      phase: 'BOARD_REVIEW',
      startDate: currentDate,
      phaseEndDate: end,
      requestedCapacityIncrease: requestedIncrease,
      log: [{ date: currentDate, message: 'Wniosek o rozbudowę złożony do zarządu.', type: 'INFO' }],
    };
  }

  static advanceDay(club: Club, currentDate: string): StadiumAdvanceDayResult {
    const projects = club.stadiumExpansionProjects;
    if (!projects || projects.length === 0) return { updatedClub: club, events: [] };

    const active = projects.filter(p => p.phase !== 'COMPLETED' && p.phase !== 'REJECTED');
    if (active.length === 0) return { updatedClub: club, events: [] };

    let updatedClub = { ...club };
    const events: StadiumPhaseAdvanceEvent[] = [];

    for (const project of active) {
      if (currentDate < project.phaseEndDate) continue;
      const result = advancePhase(updatedClub, project, currentDate);
      if (result) {
        updatedClub = result.updatedClub;
        events.push(result.event);
      }
    }

    return { updatedClub, events };
  }
}
