import {
  YouthPlayer, ClubAcademy, AcademyScoutMission, AcademyPromotedEntry,
  Player, PlayerPosition, PlayerAttributes, Region, HealthStatus, InjurySeverity
} from '../types';
import { NameGeneratorService } from './NameGeneratorService';
import { FinanceService } from './FinanceService';
import { pickNationalityForRegion } from './NationalityService';

// ── Stałe konfiguracyjne ─────────────────────────────────────────────────────

export const ACADEMY_UPGRADE_COSTS: Record<number, number> = {
  1: 2_500_000,
  2: 25_000_000,
  3: 40_000_000,
  4: 80_000_000,
};

export const ACADEMY_UPGRADE_DAYS: Record<number, number> = {
  1: 90,
  2: 120,
  3: 240,
  4: 365,
};

const REPUTATION_COST_MULTIPLIERS: { minRep: number; maxRep: number; multiplier: number }[] = [
  { minRep: 1,  maxRep: 2,  multiplier: 0.40 },
  { minRep: 3,  maxRep: 4,  multiplier: 0.60 },
  { minRep: 5,  maxRep: 6,  multiplier: 1.00 },
  { minRep: 7,  maxRep: 8,  multiplier: 1.50 },
  { minRep: 9,  maxRep: 10, multiplier: 2.50 },
];
const MIN_UPGRADE_COST = 1_000_000;

export const CLUBS_WITH_PRESET_ACADEMY: Record<string, ClubAcademy['level']> = {
  'PL_LEGIA_WARSZAWA':        3,
  'PL_LECH_POZNAN':           3,
  'PL_JAGIELLONIA_BIALYSTOK': 2,
  'PL_GORNIK_ZABRZE':         2,
  'PL_ZAGLEBIE_LUBIN':        1,
  'PL_WIDZEW_LODZ':           1,
  'PL_LKS_LODZ':              1,
  'PL_POLONIA_WARSZAWA':      1,
  'PL_ARKA_GDYNIA':           1,
  'PL_POGON_SZCZECIN':        1,
  'PL_WISLA_KRAKOW':          1,
  'PL_CRACOVIA':              1,
  'PL_KORONA_KIELCE':         1,
  'PL_RUCH_CHORZOW':          1,
};

export const ACADEMY_MAX_SLOTS: Record<number, number> = {
  1: 4,
  2: 6,
  3: 8,
  4: 10,
  5: 12,
};

// Maks talent (hiddenTalent) generowany per poziom akademii
const INTAKE_TALENT_CAP: Record<number, number> = {
  1: 68,
  2: 76,
  3: 84,
  4: 90,
  5: 95,
};

// Liczba przyjmowanych wychowanków per poziom (min, max)
const INTAKE_COUNT: Record<number, [number, number]> = {
  1: [3, 4],
  2: [4, 5],
  3: [4, 6],
  4: [5, 7],
  5: [6, 8],
};

// Próg gotowości do awansu (readinessScore)
const READINESS_THRESHOLD = 70;

// Tygodniowy przyrost readinessScore (base)
const BASE_WEEKLY_READINESS_GAIN = 1.4;

// Mnożniki budżetu operacyjnego
const BUDGET_MULTIPLIERS: { min: number; max: number; multiplier: number }[] = [
  { min: 0,       max: 30_000,  multiplier: 0.50 },
  { min: 30_000,  max: 70_000,  multiplier: 0.80 },
  { min: 70_000,  max: 150_000, multiplier: 1.00 },
  { min: 150_000, max: 300_000, multiplier: 1.20 },
  { min: 300_000, max: Infinity, multiplier: 1.40 },
];

// ── Pomocnicze losowanie ──────────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed | 0;
  return (): number => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ── Generowanie atrybutów wychowanka ─────────────────────────────────────────

const ATTR_PROFILES: Record<PlayerPosition, Partial<Record<keyof PlayerAttributes, number>>> = {
  [PlayerPosition.GK]: {
    goalkeeping: 0.80, positioning: 0.65, strength: 0.55, passing: 0.30,
    stamina: 0.50, technique: 0.40, vision: 0.35, mentality: 0.60, workRate: 0.55,
    pace: 0.25, defending: 0.20, attacking: 0.10, finishing: 0.05,
    freeKicks: 0.10, penalties: 0.35, corners: 0.05, aggression: 0.45,
    crossing: 0.05, leadership: 0.40, heading: 0.35, dribbling: 0.25,
  },
  [PlayerPosition.DEF]: {
    defending: 0.80, heading: 0.70, strength: 0.75, positioning: 0.70,
    stamina: 0.65, pace: 0.55, technique: 0.45, aggression: 0.60,
    passing: 0.40, leadership: 0.50, mentality: 0.70, workRate: 0.65,
    vision: 0.30, dribbling: 0.30, attacking: 0.20, finishing: 0.10,
    freeKicks: 0.15, penalties: 0.15, corners: 0.15, crossing: 0.25, goalkeeping: 0.02,
  },
  [PlayerPosition.MID]: {
    passing: 0.80, vision: 0.75, technique: 0.75, stamina: 0.80,
    workRate: 0.75, dribbling: 0.60, defending: 0.45, pace: 0.55,
    finishing: 0.35, attacking: 0.55, strength: 0.45, mentality: 0.65,
    leadership: 0.45, freeKicks: 0.30, penalties: 0.20, corners: 0.30,
    aggression: 0.40, crossing: 0.50, heading: 0.35, positioning: 0.55, goalkeeping: 0.02,
  },
  [PlayerPosition.FWD]: {
    finishing: 0.80, pace: 0.80, attacking: 0.80, dribbling: 0.70,
    technique: 0.65, positioning: 0.70, strength: 0.50, heading: 0.55,
    vision: 0.55, stamina: 0.60, workRate: 0.60, aggression: 0.45,
    mentality: 0.65, passing: 0.40, crossing: 0.30, freeKicks: 0.25,
    penalties: 0.35, corners: 0.15, leadership: 0.35, defending: 0.20, goalkeeping: 0.02,
  },
};

function generateYouthAttributes(
  position: PlayerPosition,
  hiddenTalent: number,
  rng: () => number
): PlayerAttributes {
  const profile = ATTR_PROFILES[position];
  const talentMod = 0.3 + (hiddenTalent / 100) * 0.5; // 0.30 – 0.80
  const allKeys: (keyof PlayerAttributes)[] = [
    'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking', 'finishing',
    'technique', 'vision', 'dribbling', 'heading', 'positioning', 'goalkeeping',
    'freeKicks', 'talent', 'penalties', 'corners', 'aggression', 'crossing',
    'leadership', 'mentality', 'workRate',
  ];
  const attrs: Partial<PlayerAttributes> = {};
  allKeys.forEach(key => {
    if (key === 'talent') {
      attrs[key] = hiddenTalent;
      return;
    }
    const weight = profile[key] ?? 0.15;
    const base = 12 + talentMod * 25 * weight + rng() * 12;
    attrs[key] = Math.round(clamp(base, 8, 45));
  });
  return attrs as PlayerAttributes;
}

// ── Region wychowanka (z uwzględnieniem regionFocus akademii) ─────────────────

const REGION_WEIGHTS: { region: Region; weight: number }[] = [
  { region: Region.POLAND,    weight: 55 },
  { region: Region.BALKANS,   weight: 5 },
  { region: Region.CZ_SK,     weight: 4 },
  { region: Region.SSA,       weight: 6 },
  { region: Region.IBERIA,    weight: 3 },
  { region: Region.GERMANY,   weight: 4 },
  { region: Region.BRAZIL,    weight: 5 },
  { region: Region.ARGENTINA, weight: 4 },
  { region: Region.FRANCE,    weight: 4 },
  { region: Region.HUNGARIAN, weight: 3 },
  { region: Region.EX_USSR,   weight: 3 },
  { region: Region.ROMANIA,   weight: 4 },
];

function pickRegion(regionFocus: Region | undefined, rng: () => number): Region {
  if (regionFocus && rng() < 0.40) return regionFocus;
  const total = REGION_WEIGHTS.reduce((s, r) => s + r.weight, 0);
  let r = rng() * total;
  for (const rw of REGION_WEIGHTS) {
    r -= rw.weight;
    if (r <= 0) return rw.region;
  }
  return Region.POLAND;
}

// ── Koszty i czas misji skautingowych (zewnętrznych) ─────────────────────────

const SCOUT_REGION_BASE_COST: Partial<Record<Region, number>> = {
  [Region.POLAND]:    5_000,
  [Region.CZ_SK]:     8_000,
  [Region.HUNGARIAN]: 8_000,
  [Region.BALKANS]:   12_000,
  [Region.GERMANY]:   15_000,
  [Region.ROMANIA]:   12_000,
  [Region.EX_USSR]:   18_000,
  [Region.IBERIA]:    25_000,
  [Region.FRANCE]:    25_000,
  [Region.SSA]:       35_000,
  [Region.BRAZIL]:    50_000,
  [Region.ARGENTINA]: 50_000,
};
const SCOUT_REGION_BASE_COST_GLOBAL = 30_000;

const SCOUT_REGION_BASE_DAYS: Partial<Record<Region, number>> = {
  [Region.POLAND]:    30,
  [Region.CZ_SK]:     35,
  [Region.HUNGARIAN]: 35,
  [Region.BALKANS]:   40,
  [Region.GERMANY]:   42,
  [Region.ROMANIA]:   40,
  [Region.EX_USSR]:   45,
  [Region.IBERIA]:    52,
  [Region.FRANCE]:    52,
  [Region.SSA]:       60,
  [Region.BRAZIL]:    65,
  [Region.ARGENTINA]: 65,
};
const SCOUT_REGION_BASE_DAYS_GLOBAL = 50;

const SCOUT_LEVEL_COST_MULT: Record<number, number> = { 1: 1.0, 2: 1.0, 3: 0.80, 4: 0.65, 5: 0.50 };
const SCOUT_LEVEL_DAYS_MULT: Record<number, number> = { 1: 1.0, 2: 1.0, 3: 0.85, 4: 0.70, 5: 0.55 };

function calcScoutCost(regionFocus: Region | undefined, level: ClubAcademy['level']): number {
  const base = regionFocus ? (SCOUT_REGION_BASE_COST[regionFocus] ?? SCOUT_REGION_BASE_COST_GLOBAL) : SCOUT_REGION_BASE_COST_GLOBAL;
  return Math.round(base * (SCOUT_LEVEL_COST_MULT[level] ?? 1.0));
}

function calcScoutDays(regionFocus: Region | undefined, level: ClubAcademy['level']): number {
  const base = regionFocus ? (SCOUT_REGION_BASE_DAYS[regionFocus] ?? SCOUT_REGION_BASE_DAYS_GLOBAL) : SCOUT_REGION_BASE_DAYS_GLOBAL;
  return Math.round(base * (SCOUT_LEVEL_DAYS_MULT[level] ?? 1.0));
}

// ── Publiczne API serwisu ─────────────────────────────────────────────────────

export const AcademyService = {

  // Generuje partię wychowanków (raz na rok – 1 Sierpnia)
  generateYouthIntake(
    level: ClubAcademy['level'],
    regionFocus: Region | undefined,
    season: number,
    existingCount: number
  ): YouthPlayer[] {
    const seed = season * 7919 + level * 131 + Date.now() % 9999;
    const rng = seededRng(seed);
    const [minC, maxC] = INTAKE_COUNT[level];
    const slotsLeft = ACADEMY_MAX_SLOTS[level] - existingCount;
    const count = Math.min(slotsLeft, minC + Math.floor(rng() * (maxC - minC + 1)));
    if (count <= 0) return [];

    const talentCap = INTAKE_TALENT_CAP[level];
    const positions = [
      PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.DEF, PlayerPosition.DEF,
      PlayerPosition.MID, PlayerPosition.MID, PlayerPosition.MID,
      PlayerPosition.FWD, PlayerPosition.FWD,
    ];

    const result: YouthPlayer[] = [];
    const contractEnd = new Date();
    contractEnd.setFullYear(contractEnd.getFullYear() + 3);

    for (let i = 0; i < count; i++) {
      const pos = pick(positions, rng);
      const region = pickRegion(regionFocus, rng);
      const name = NameGeneratorService.getRandomName(region);
      const hiddenTalent = Math.round(20 + rng() * talentCap);
      const age = 14 + Math.floor(rng() * 4); // 14–17
      const attrs = generateYouthAttributes(pos, hiddenTalent, rng);
      result.push({
        id: `YOUTH_${season}_${i}_${Math.floor(rng() * 99999)}`,
        firstName: name.firstName,
        lastName: name.lastName,
        age,
        position: pos,
        nationality: region,
        nationalityCountry: pickNationalityForRegion(region),
        attributes: attrs,
        hiddenTalent,
        revealedTalentRating: undefined,
        developmentFocus: undefined,
        readinessScore: Math.round(rng() * 12), // startowe 0–12
        monthsInAcademy: 0,
        contractEndDate: contractEnd.toISOString().split('T')[0],
      });
    }
    return result;
  },

  // Tygodniowy tick rozwoju (wywoływany co poniedziałek w advanceDay)
  processWeeklyDevelopment(
    youthPlayers: YouthPlayer[],
    level: ClubAcademy['level'],
    operationalBudgetWeekly: number
  ): YouthPlayer[] {
    const budgetEntry = BUDGET_MULTIPLIERS.find(
      b => operationalBudgetWeekly >= b.min && operationalBudgetWeekly < b.max
    ) ?? BUDGET_MULTIPLIERS[2];
    const budgetMult = budgetEntry.multiplier;
    const levelMult = 0.7 + (level - 1) * 0.15; // 0.70 – 1.30

    return youthPlayers.map(youth => {
      if (youth.contractSigned === false) return youth;
      const talentMod = 0.6 + (youth.hiddenTalent / 100) * 0.8;
      const focusBonus = youth.developmentFocus ? 0.5 : 0;
      const rawGain = BASE_WEEKLY_READINESS_GAIN * talentMod * budgetMult * levelMult + focusBonus;
      const newReadiness = Math.min(100, youth.readinessScore + rawGain);

      // Mały przyrost atrybutów co tydzień
      const updatedAttrs = { ...youth.attributes };
      const allKeys: (keyof PlayerAttributes)[] = [
        'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking', 'finishing',
        'technique', 'vision', 'dribbling', 'heading', 'positioning',
        'freeKicks', 'penalties', 'aggression', 'crossing', 'leadership', 'mentality', 'workRate',
      ];
      allKeys.forEach(key => {
        if (Math.random() < 0.04 + (youth.developmentFocus === key ? 0.05 : 0)) {
          updatedAttrs[key] = Math.min(55, updatedAttrs[key] + 1);
        }
      });

      return {
        ...youth,
        readinessScore: newReadiness,
        monthsInAcademy: youth.monthsInAcademy + 0.25,
        attributes: updatedAttrs,
      };
    });
  },

  // Konwertuje YouthPlayer na pełnoprawnego Player (awans)
  promoteToPlayer(
    youth: YouthPlayer,
    clubId: string,
    currentDate: Date,
    clubReputation: number = 5,
    clubTier: number = 1,
    clubCountry?: string
  ): Player {
    const contractEnd = new Date(currentDate);
    contractEnd.setFullYear(contractEnd.getFullYear() + 2);
    const overallKeys: (keyof PlayerAttributes)[] = [
      'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
      'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
      'goalkeeping', 'freeKicks', 'penalties', 'aggression', 'crossing', 'leadership', 'mentality', 'workRate',
    ];
    const overallRating = Math.round(
      overallKeys.reduce((s, k) => s + youth.attributes[k], 0) / overallKeys.length
    );
    const promotedPlayer = {
      id: `PROMOTED_${youth.id}`,
      firstName: youth.firstName,
      lastName: youth.lastName,
      age: youth.age,
      clubId,
      nationality: youth.nationality,
      nationalityCountry: youth.nationalityCountry,
      position: youth.position,
      overallRating,
      attributes: { ...youth.attributes },
      stats: {
        goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0,
        matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [],
      },
      health: { status: HealthStatus.HEALTHY },
      condition: 100,
      suspensionMatches: 0,
      contractEndDate: contractEnd.toISOString().split('T')[0],
      annualSalary: 30_000 + Math.round(youth.hiddenTalent * 500),
      isOnTransferList: false,
      marketValue: 0,
      history: [
        {
          clubName: 'Akademia',
          clubId: 'ACADEMY',
          fromYear: currentDate.getFullYear() - Math.round(youth.monthsInAcademy / 12),
          fromMonth: currentDate.getMonth() + 1,
          toYear: null,
          toMonth: null,
        },
      ],
      boardLockoutUntil: null,
      isUntouchable: false,
      negotiationStep: 0,
      negotiationLockoutUntil: null,
      contractLockoutUntil: null,
      fatigueDebt: 0,
      isNegotiationPermanentBlocked: false,
      transferLockoutUntil: null,
      freeAgentLockoutUntil: null,
    };

    return {
      ...promotedPlayer,
      marketValue: FinanceService.calculateMarketValue(promotedPlayer, clubReputation, clubTier, clubCountry)
    };
  },

  // Tworzy raport skautingowy (ujawnia talent)
  revealTalentRating(
    hiddenTalent: number,
    level: ClubAcademy['level']
  ): YouthPlayer['revealedTalentRating'] {
    // Wyższy poziom akademii = dokładniejsza ocena
    // Niższy poziom = może przeszacować lub niedoszacować
    const noise = (level === 1 ? 20 : level === 2 ? 12 : level === 3 ? 6 : 3);
    const perceived = clamp(hiddenTalent + (Math.random() - 0.5) * noise, 0, 100);
    if (perceived >= 78) return 'EXCEPTIONAL';
    if (perceived >= 62) return 'HIGH';
    if (perceived >= 44) return 'AVERAGE';
    return 'LOW';
  },

  // Koszt zewnętrznej misji skautingowej zależny od regionu i poziomu akademii
  getScoutMissionCost: calcScoutCost,
  // Czas misji (dni) zależny od regionu i poziomu akademii
  getScoutMissionDays: calcScoutDays,

  // Buduje misję skautingową
  buildScoutMission(
    targetYouthPlayerId: string | undefined,
    regionFocus: Region | undefined,
    level: ClubAcademy['level'],
    currentDate: Date,
    positionFilter?: import('../types').PlayerPosition,
    ageMin?: number,
    ageMax?: number,
  ): AcademyScoutMission {
    const daysNeeded = targetYouthPlayerId
      ? (level <= 2 ? 14 : level <= 3 ? 10 : 7)
      : calcScoutDays(regionFocus, level);
    const cost = targetYouthPlayerId ? 0 : calcScoutCost(regionFocus, level);
    const completion = new Date(currentDate);
    completion.setDate(completion.getDate() + daysNeeded);
    return {
      id: `SCOUT_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      targetYouthPlayerId,
      regionFocus,
      completionDate: completion.toISOString().split('T')[0],
      isRegionScouting: !targetYouthPlayerId,
      cost,
      positionFilter,
      ageMin,
      ageMax,
    };
  },

  // Ocena propozycji rozbudowy przez właściciela
  evaluateUpgradeProposal(academy: ClubAcademy, reputation: number): 'APPROVED' | 'REJECTED' {
    const cost = ACADEMY_UPGRADE_COSTS[academy.level];
    const entry = REPUTATION_COST_MULTIPLIERS.find(r => reputation >= r.minRep && reputation <= r.maxRep)
      ?? REPUTATION_COST_MULTIPLIERS[2];
    const realCost = Math.max(MIN_UPGRADE_COST, Math.round((cost ?? 0) * entry.multiplier));
    // Szansa bazowa zależna od stosunku budżetu do kosztu
    let chance: number;
    // Uwaga: budżet sprawdzamy w GameContext (tu nie mamy dostępu), więc przekazujemy szansę wg reputacji
    // Właściciel ocenia: wysoka reputacja = większe ambicje = chętniej inwestuje
    if (reputation >= 9) chance = 0.80;
    else if (reputation >= 7) chance = 0.65;
    else if (reputation >= 5) chance = 0.50;
    else if (reputation >= 3) chance = 0.35;
    else chance = 0.20;
    return Math.random() < chance ? 'APPROVED' : 'REJECTED';
  },

  // Losuje datę decyzji właściciela na podstawie poziomu rozbudowy
  getProposalDecisionDate(currentLevel: ClubAcademy['level'], fromDate: Date): string {
    const ranges: Record<number, [number, number]> = {
      1: [7,   14],
      2: [30,  60],
      3: [60,  90],
      4: [90, 150],
    };
    const [minD, maxD] = ranges[currentLevel] ?? [30, 60];
    const days = minD + Math.floor(Math.random() * (maxD - minD + 1));
    const d = new Date(fromDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  },

  // Koszt ulepszenia do następnego poziomu (bazowy, niezależny od reputacji)
  getUpgradeCost(currentLevel: ClubAcademy['level']): number | null {
    return ACADEMY_UPGRADE_COSTS[currentLevel] ?? null;
  },

  // Koszt ulepszenia uwzględniający reputację klubu (min. 1 000 000 PLN)
  getUpgradeCostForClub(currentLevel: ClubAcademy['level'], reputation: number): number | null {
    const base = ACADEMY_UPGRADE_COSTS[currentLevel];
    if (!base) return null;
    const entry = REPUTATION_COST_MULTIPLIERS.find(r => reputation >= r.minRep && reputation <= r.maxRep)
      ?? REPUTATION_COST_MULTIPLIERS[2];
    return Math.max(MIN_UPGRADE_COST, Math.round(base * entry.multiplier));
  },

  // Czas (dni) ulepszenia do następnego poziomu
  getUpgradeDays(currentLevel: ClubAcademy['level']): number | null {
    return ACADEMY_UPGRADE_DAYS[currentLevel] ?? null;
  },

  // Maks liczba wychowanków dla poziomu
  getMaxSlots(level: ClubAcademy['level']): number {
    return ACADEMY_MAX_SLOTS[level];
  },

  // Próg gotowości do awansu
  getReadinessThreshold(): number {
    return READINESS_THRESHOLD;
  },

  // Domyślny budżet operacyjny przy inicjalizacji (zależny od poziomu)
  getDefaultOperationalBudget(level: ClubAcademy['level']): number {
    const base: Record<number, number> = { 1: 40_000, 2: 80_000, 3: 150_000, 4: 250_000, 5: 400_000 };
    return base[level];
  },

  // Czy przyszło dzisiaj zakończenie upgrade'u?
  checkUpgradeCompletion(
    academy: ClubAcademy,
    currentDate: Date
  ): { completed: boolean; newLevel: ClubAcademy['level'] | null } {
    if (!academy.upgradeInProgress || !academy.upgradeCompletionDate) {
      return { completed: false, newLevel: null };
    }
    const completionDate = new Date(academy.upgradeCompletionDate);
    if (currentDate >= completionDate) {
      const newLevel = (academy.level + 1) as ClubAcademy['level'];
      return { completed: true, newLevel };
    }
    return { completed: false, newLevel: null };
  },

  // Sprawdza i przetwarza zakończone misje skautingowe
  processCompletedMissions(
    academy: ClubAcademy,
    currentDate: Date
  ): { updatedMissions: AcademyScoutMission[]; completedMissions: AcademyScoutMission[]; updatedYouthPlayers: YouthPlayer[] } {
    const dateStr = currentDate.toISOString().split('T')[0];
    const completedMissions: AcademyScoutMission[] = [];
    const updatedMissions: AcademyScoutMission[] = [];
    let updatedYouthPlayers = [...academy.youthPlayers];

    academy.activeMissions.forEach(mission => {
      if (mission.completionDate <= dateStr) {
        completedMissions.push(mission);
        // Jeśli to misja dla konkretnego zawodnika — ujawnij talent
        if (mission.targetYouthPlayerId) {
          updatedYouthPlayers = updatedYouthPlayers.map(yp => {
            if (yp.id !== mission.targetYouthPlayerId) return yp;
            return {
              ...yp,
              revealedTalentRating: AcademyService.revealTalentRating(yp.hiddenTalent, academy.level),
            };
          });
        }
      } else {
        updatedMissions.push(mission);
      }
    });

    return { updatedMissions, completedMissions, updatedYouthPlayers };
  },

  // Generuje losowy event akademii (wywoływany raz na miesiąc, ~30% szans)
  tryGenerateEvent(
    academy: ClubAcademy,
    currentDate: Date,
    clubName: string
  ): string | null {
    if (Math.random() > 0.30) return null;
    if (academy.youthPlayers.length === 0) return null;

    const events = [
      () => {
        const star = academy.youthPlayers.find(yp => yp.hiddenTalent >= 75);
        if (!star) return null;
        return `Twój wychowanek ${star.firstName} ${star.lastName} olśnił trenerów na turnieju U-19. Jego pewność siebie rośnie!`;
      },
      () => {
        const any = academy.youthPlayers[Math.floor(Math.random() * academy.youthPlayers.length)];
        return `Skaut rywala obserwował ${any.firstName} ${any.lastName} podczas ostatniego turnieju. Bądź czujny!`;
      },
      () => {
        const youngest = academy.youthPlayers.filter(yp => yp.age === 16)[0];
        if (!youngest) return null;
        return `${youngest.firstName} ${youngest.lastName} (${youngest.age}) zagrał znakomity turniej. Media piszą o pierwszym talencie akademii.`;
      },
      () => {
        return `Akademia ${clubName} zorganizowała obóz sparingowy. Wychowankowie wrócili z nowym nastawieniem.`;
      },
      () => {
        const ready = academy.youthPlayers.find(yp => yp.readinessScore >= 60);
        if (!ready) return null;
        return `Trener rezerw pyta o ${ready.firstName} ${ready.lastName} — rozważ awans do rezerw.`;
      },
    ];

    for (let i = 0; i < 5; i++) {
      const fn = events[Math.floor(Math.random() * events.length)];
      const msg = fn();
      if (msg) return msg;
    }
    return null;
  },

  // Rozstrzyga wynik misji regionalnej — skaut może wrócić z pustymi rękami
  resolveRegionalScoutingResult(
    mission: AcademyScoutMission,
    academyLevel: ClubAcademy['level'],
    slotsAvailable: number,
    networkDepth: number = 10,
    completionDate: Date,
  ): YouthPlayer[] {
    if (!mission.isRegionScouting || slotsAvailable <= 0) return [];

    // Szansa sukcesu: 45% (poziom 1) do 75% (poziom 5), +/-1% za punkt networkDepth względem 10
    const baseChance: Record<number, number> = { 1: 0.45, 2: 0.52, 3: 0.60, 4: 0.68, 5: 0.75 };
    const networkBonus = (networkDepth - 10) * 0.01;
    const successChance = clamp((baseChance[academyLevel] ?? 0.50) + networkBonus, 0.20, 0.90);

    if (Math.random() > successChance) return [];

    const maxFind = academyLevel <= 2 ? 2 : 3;
    const count = Math.min(slotsAvailable, 1 + Math.floor(Math.random() * maxFind));

    const seed = completionDate.getTime() + Math.floor(Math.random() * 9999);
    const rng = seededRng(seed);
    const talentCap = INTAKE_TALENT_CAP[academyLevel];
    const positionPool = [
      PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.DEF, PlayerPosition.DEF,
      PlayerPosition.MID, PlayerPosition.MID, PlayerPosition.MID,
      PlayerPosition.FWD, PlayerPosition.FWD,
    ];
    const contractEnd = new Date(completionDate);
    contractEnd.setFullYear(contractEnd.getFullYear() + 3);

    const result: YouthPlayer[] = [];
    for (let i = 0; i < count; i++) {
      const pos = mission.positionFilter ?? pick(positionPool, rng);
      const region = mission.regionFocus ?? pickRegion(undefined, rng);
      const name = NameGeneratorService.getRandomName(region);
      const ageMin = mission.ageMin ?? 15;
      const ageMax = mission.ageMax ?? 21;
      const age = ageMin + Math.floor(rng() * (ageMax - ageMin + 1));
      const hiddenTalent = Math.round(20 + rng() * talentCap);
      const attrs = generateYouthAttributes(pos, hiddenTalent, rng);
      result.push({
        id: `YOUTH_SCOUT_${completionDate.getTime()}_${i}_${Math.floor(rng() * 99999)}`,
        firstName: name.firstName,
        lastName: name.lastName,
        age,
        position: pos,
        nationality: region,
        nationalityCountry: pickNationalityForRegion(region),
        attributes: attrs,
        hiddenTalent,
        revealedTalentRating: undefined,
        developmentFocus: undefined,
        readinessScore: Math.round(rng() * 12),
        monthsInAcademy: 0,
        contractEndDate: contractEnd.toISOString().split('T')[0],
        weeklyMaintenanceCost: Math.max(300, Math.round((age - 10) / 2) * 100),
        contractSigned: false,
      });
    }
    return result;
  },
};
