import {
  BoardAttributeLevel,
  Club,
  Fixture,
  ManagerContract,
  ManagerContractDurationYears,
  ManagerContractNegotiation,
  ManagerContractSource,
  ManagerContractTarget,
  ManagerContractTerms,
  ManagerProfile,
  MatchStatus,
  CompetitionType,
} from '../types';

const DAY_MS = 86_400_000;

const BOARD_LEVEL: Record<BoardAttributeLevel, number> = {
  bardzo_niska: 1,
  niska: 2,
  przecietna: 3,
  wysoka: 4,
  bardzo_wysoka: 5,
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const SALARY_MODEL_VERSION = 2;
const SALARY_STEP = 500_000;

const roundSalary = (value: number): number =>
  Math.max(SALARY_STEP, Math.round(value / SALARY_STEP) * SALARY_STEP);

const getTier = (club: Club): number => {
  const parsed = Number.parseInt(String(club.leagueId).split('_')[2] || '', 10);
  return Number.isFinite(parsed) ? parsed : Math.max(1, club.tier ?? 3);
};

const getLeagueSize = (club: Club, clubs: Club[]): number =>
  Math.max(16, clubs.filter(candidate => candidate.leagueId === club.leagueId).length);

const getSeasonEnd = (startDate: Date, durationYears: ManagerContractDurationYears): Date => {
  // Kontrakty kończą się 30 czerwca, ale rok podpisania nie może zostać
  // policzony jako pełny sezon przy rozmowach prowadzonych zimą lub wiosną.
  return new Date(startDate.getFullYear() + durationYears, 5, 30, 12, 0, 0, 0);
};

const target = (
  club: Club,
  clubs: Club[],
  type: ManagerContractTarget['type'],
  label: string,
  description: string,
  ambitionLevel: number,
  leagueMaxRank: number,
  requiresPolishCup = false,
): ManagerContractTarget => ({
  id: `${club.leagueId}:${type}:${leagueMaxRank}:${requiresPolishCup ? 'CUP' : 'LEAGUE'}`,
  type,
  label,
  description,
  ambitionLevel,
  leagueMaxRank: clamp(leagueMaxRank, 1, getLeagueSize(club, clubs)),
  requiresPolishCup,
});

export function getAvailableTargets(club: Club, clubs: Club[]): ManagerContractTarget[] {
  const tier = getTier(club);
  const leagueSize = getLeagueSize(club, clubs);
  const survivalRank = Math.max(10, leagueSize - 3);
  const middleRank = Math.max(8, Math.ceil(leagueSize * 0.58));

  if (tier >= 2) {
    return [
      target(club, clubs, 'SURVIVAL', 'Utrzymanie w lidze', `Zespół ma zakończyć sezon poza strefą spadkową, na miejscu ${survivalRank}. lub wyższym.`, 1, survivalRank),
      target(club, clubs, 'MID_TABLE', 'Bezpieczny środek tabeli', `Celem jest spokojne miejsce w środku tabeli — maksymalnie ${middleRank}. pozycja.`, 2, middleRank),
      target(club, clubs, 'PROMOTION_PLAYOFFS', 'Miejsce barażowe', 'Drużyna ma zakończyć sezon w TOP 6 i zakwalifikować się co najmniej do baraży o awans.', 3, 6),
      target(club, clubs, 'PROMOTION', 'Bezpośredni awans', 'Zespół ma zakończyć ligę w TOP 2 i wywalczyć bezpośredni awans.', 4, 2),
      target(club, clubs, 'CHAMPION', 'Mistrzostwo ligi', 'Celem jest pierwsze miejsce i zdobycie mistrzostwa ligi.', 5, 1),
      target(club, clubs, 'POLISH_CUP', 'Zdobycie Pucharu Polski', `Zespół ma utrzymać bezpieczną pozycję ligową i zdobyć Puchar Polski.`, 5, middleRank, true),
      target(club, clubs, 'LEAGUE_AND_CUP', 'Mistrzostwo i Puchar Polski', 'Celem jest mistrzostwo ligi oraz zdobycie Pucharu Polski w tym samym sezonie.', 7, 1, true),
    ];
  }

  return [
    target(club, clubs, 'SURVIVAL', 'Utrzymanie w Ekstraklasie', `Zespół ma uniknąć spadku i zakończyć sezon co najmniej na ${survivalRank}. miejscu.`, 1, survivalRank),
    target(club, clubs, 'MID_TABLE', 'Środek tabeli', `Celem jest stabilna pozycja w środku tabeli — maksymalnie ${middleRank}. miejsce.`, 2, middleRank),
    target(club, clubs, 'TOP_SIX', 'Górna szóstka', 'Drużyna ma zakończyć sezon w TOP 6.', 3, 6),
    target(club, clubs, 'TOP_THREE', 'Podium', 'Zespół ma zakończyć sezon w pierwszej trójce i walczyć o europejskie puchary.', 4, 3),
    target(club, clubs, 'CHAMPION', 'Mistrzostwo Polski', 'Celem jest pierwsze miejsce i zdobycie Mistrzostwa Polski.', 5, 1),
    target(club, clubs, 'POLISH_CUP', 'Zdobycie Pucharu Polski', `Zespół ma zająć co najmniej ${middleRank}. miejsce i zdobyć Puchar Polski.`, 5, middleRank, true),
    target(club, clubs, 'LEAGUE_AND_CUP', 'Mistrzostwo i Puchar Polski', 'Celem jest zdobycie Mistrzostwa Polski oraz Pucharu Polski w tym samym sezonie.', 7, 1, true),
  ];
}

export function getBoardPreferredTarget(club: Club, clubs: Club[]): ManagerContractTarget {
  const options = getAvailableTargets(club, clubs);
  const expectation = BOARD_LEVEL[club.board?.oczekiwania ?? 'przecietna'];
  const ambition = BOARD_LEVEL[club.board?.ambicja ?? 'przecietna'];
  const reputationBoost = (club.reputation ?? 5) >= 9 ? 1 : 0;
  const preferredAmbition = clamp(Math.round((expectation * 0.65) + (ambition * 0.35) + reputationBoost), 1, 5);
  return [...options]
    .filter(option => option.type !== 'POLISH_CUP' && option.type !== 'LEAGUE_AND_CUP')
    .sort((a, b) => Math.abs(a.ambitionLevel - preferredAmbition) - Math.abs(b.ambitionLevel - preferredAmbition))[0];
}

export function getBoardMinimumTarget(club: Club, clubs: Club[]): ManagerContractTarget {
  const preferred = getBoardPreferredTarget(club, clubs);
  const minimumAmbition = Math.max(1, preferred.ambitionLevel - 1);
  const leagueTargets = getAvailableTargets(club, clubs)
    .filter(option => !option.requiresPolishCup)
    .sort((a, b) => a.ambitionLevel - b.ambitionLevel);
  return leagueTargets.find(option => option.ambitionLevel >= minimumAmbition) ?? preferred;
}

export function calculateBaseSalary(club: Club, profile: ManagerProfile | null): number {
  const tier = getTier(club);
  const tierBase = tier === 1
    ? 3_000_000
    : tier === 2
      ? 1_000_000
      : tier === 3
        ? 550_000
        : 300_000;
  const reputationMultiplier = 0.72 + clamp(club.reputation ?? 5, 1, 20) * 0.075;
  const expPoints = Math.max(1, profile?.expPoints ?? 1);
  const experienceMultiplier = 0.90 + Math.min(0.50, Math.log10(expPoints + 9) * 0.16);
  return roundSalary(tierBase * reputationMultiplier * experienceMultiplier);
}

export function calculateSalaryForTarget(
  club: Club,
  clubs: Club[],
  profile: ManagerProfile | null,
  selectedTarget: ManagerContractTarget,
): number {
  const preferred = getBoardPreferredTarget(club, clubs);
  const ambitionDelta = selectedTarget.ambitionLevel - preferred.ambitionLevel;
  const multiplier = ambitionDelta >= 0
    ? 1 + ambitionDelta * 0.13
    : 1 + ambitionDelta * 0.09;
  return roundSalary(calculateBaseSalary(club, profile) * clamp(multiplier, 0.72, 1.85));
}

export function createTerms(
  club: Club,
  clubs: Club[],
  profile: ManagerProfile | null,
  startDate: Date,
  selectedTarget = getBoardPreferredTarget(club, clubs),
  durationYears: ManagerContractDurationYears = 2,
): ManagerContractTerms {
  return {
    startDate: startDate.toISOString(),
    endDate: getSeasonEnd(startDate, durationYears).toISOString(),
    durationYears,
    annualSalary: calculateSalaryForTarget(club, clubs, profile, selectedTarget),
    target: selectedTarget,
    salaryModelVersion: SALARY_MODEL_VERSION,
  };
}

export function createNegotiation(
  club: Club,
  clubs: Club[],
  profile: ManagerProfile | null,
  startDate: Date,
  source: ManagerContractSource,
  jobOfferId?: string,
  proposedTerms?: ManagerContractTerms,
): ManagerContractNegotiation {
  const availableTargets = getAvailableTargets(club, clubs);
  const clubTerms = proposedTerms?.salaryModelVersion === SALARY_MODEL_VERSION
    ? proposedTerms
    : createTerms(club, clubs, profile, startDate);
  return {
    id: `MANAGER_CONTRACT_NEGOTIATION_${club.id}_${startDate.toISOString()}_${Math.random().toString(36).slice(2, 8)}`,
    clubId: club.id,
    source,
    jobOfferId,
    status: 'NEGOTIATING',
    roundsUsed: 0,
    maxRounds: 4 + Math.floor(Math.random() * 4),
    availableTargets,
    clubTerms,
    message: source === 'RENEWAL'
      ? 'Zarząd chce omówić warunki dalszej współpracy.'
      : 'Zarząd przedstawił warunki objęcia pierwszego zespołu.',
    lastResponseType: 'INFO',
    startedAt: startDate.toISOString(),
  };
}

const getNegotiationAcceptanceChance = (
  negotiation: ManagerContractNegotiation,
  club: Club,
  proposedTerms: ManagerContractTerms,
  profile: ManagerProfile | null,
): number => {
  const currentAmbition = negotiation.clubTerms.target.ambitionLevel;
  const requestedAmbition = proposedTerms.target.ambitionLevel;
  const delta = requestedAmbition - currentAmbition;
  const board = club.board;
  const ambition = BOARD_LEVEL[board?.ambicja ?? 'przecietna'];
  const generosity = BOARD_LEVEL[board?.hojnosc ?? 'przecietna'];
  const greed = BOARD_LEVEL[board?.chciwosc ?? 'przecietna'];
  const patience = BOARD_LEVEL[board?.cierpliwosc ?? 'przecietna'];
  const competence = BOARD_LEVEL[board?.kompetencja ?? 'przecietna'];
  const expBonus = Math.min(12, Math.log10(Math.max(1, profile?.expPoints ?? 1) + 9) * 4);
  const salaryPremium = Math.max(0, proposedTerms.annualSalary / Math.max(1, negotiation.clubTerms.annualSalary) - 1);

  let chance = 82 + expBonus;
  if (delta > 0) {
    chance = 44 + ambition * 7 + generosity * 5 - greed * 4 - delta * 10 - salaryPremium * 28 + expBonus;
  } else if (delta < 0) {
    chance = 48 + patience * 5 + greed * 3 - ambition * 8 - Math.abs(delta) * 9 + expBonus;
  }

  if (proposedTerms.durationYears === 3) chance += patience * 2 - greed * 2;
  if (proposedTerms.durationYears === 1) chance += greed * 2 - patience;
  chance += competence * 1.5;
  return clamp(Math.round(chance), 8, 94);
};

const counterTarget = (
  negotiation: ManagerContractNegotiation,
  requestedTarget: ManagerContractTarget,
): ManagerContractTarget => {
  const ordered = [...negotiation.availableTargets].sort((a, b) => a.ambitionLevel - b.ambitionLevel);
  const currentIndex = ordered.findIndex(option => option.id === negotiation.clubTerms.target.id);
  const requestedIndex = ordered.findIndex(option => option.id === requestedTarget.id);
  if (currentIndex < 0 || requestedIndex < 0 || currentIndex === requestedIndex) return negotiation.clubTerms.target;
  const step = requestedIndex > currentIndex ? 1 : -1;
  return ordered[clamp(currentIndex + step, 0, ordered.length - 1)];
};

export function negotiate(
  negotiation: ManagerContractNegotiation,
  club: Club,
  clubs: Club[],
  profile: ManagerProfile | null,
  targetId: string,
  durationYears: ManagerContractDurationYears,
): ManagerContractNegotiation {
  if (negotiation.status !== 'NEGOTIATING') return negotiation;
  const selectedTarget = negotiation.availableTargets.find(option => option.id === targetId) ?? negotiation.clubTerms.target;
  const startDate = new Date(negotiation.clubTerms.startDate);
  const requestedTerms = createTerms(club, clubs, profile, startDate, selectedTarget, durationYears);
  const roundsUsed = negotiation.roundsUsed + 1;
  const preferredTarget = getBoardPreferredTarget(club, clubs);
  const minimumTarget = getBoardMinimumTarget(club, clubs);
  const hardVeto = selectedTarget.ambitionLevel < minimumTarget.ambitionLevel;

  if (hardVeto) {
    const vetoMessage = `Veto zarządu: cel „${selectedTarget.label}” jest nie do przyjęcia. Ambicją klubu jest „${preferredTarget.label}”, a najniższy cel, o którym zarząd może rozmawiać, to „${minimumTarget.label}”. Klub podtrzymuje swoją propozycję i oczekuje wyraźnie ambitniejszego planu.`;
    if (roundsUsed >= negotiation.maxRounds) {
      return {
        ...negotiation,
        roundsUsed,
        status: 'FAILED',
        lastResponseType: 'FAILED',
        message: `${vetoMessage} Zarząd zakończył negocjacje z powodu zbyt dużej różnicy w ocenie potencjału drużyny.`,
      };
    }

    return {
      ...negotiation,
      roundsUsed,
      clubTerms: createTerms(club, clubs, profile, startDate, preferredTarget, negotiation.clubTerms.durationYears),
      lastResponseType: 'VETO',
      message: vetoMessage,
    };
  }

  const proposalDiffersFromClubTerms = selectedTarget.id !== negotiation.clubTerms.target.id ||
    durationYears !== negotiation.clubTerms.durationYears;
  const requiresOpeningCounter = negotiation.roundsUsed === 0 && proposalDiffersFromClubTerms;
  const accepted = !requiresOpeningCounter &&
    Math.random() * 100 <= getNegotiationAcceptanceChance(negotiation, club, requestedTerms, profile);

  if (accepted) {
    return {
      ...negotiation,
      roundsUsed,
      status: 'AGREED',
      agreedTerms: requestedTerms,
      lastResponseType: 'ACCEPTED',
      message: 'Zarząd zaakceptował proponowane warunki. Kontrakt jest gotowy do podpisania.',
    };
  }

  if (roundsUsed >= negotiation.maxRounds) {
    return {
      ...negotiation,
      roundsUsed,
      status: 'FAILED',
      lastResponseType: 'FAILED',
      message: 'Zarząd zakończył rozmowy. Nie udało się osiągnąć porozumienia.',
    };
  }

  const proposedCounterTarget = counterTarget(negotiation, selectedTarget);
  const nextTarget = proposedCounterTarget.ambitionLevel < minimumTarget.ambitionLevel
    ? minimumTarget
    : proposedCounterTarget;
  const counterDuration = Math.random() < 0.55 ? durationYears : negotiation.clubTerms.durationYears;
  const baseCounter = createTerms(club, clubs, profile, startDate, nextTarget, counterDuration);
  const salaryBlend = roundSalary((baseCounter.annualSalary * 0.72) + (requestedTerms.annualSalary * 0.28));
  const clubTerms = { ...baseCounter, annualSalary: salaryBlend };

  return {
    ...negotiation,
    roundsUsed,
    clubTerms,
    lastResponseType: 'COUNTER',
    message: requiresOpeningCounter
      ? `Zarząd nie podpisze zmienionych warunków bez negocjacji. Klub przedstawia kontrofertę: cel „${clubTerms.target.label}”, umowa na ${clubTerms.durationYears} ${clubTerms.durationYears === 1 ? 'rok' : 'lata'} i wynagrodzenie ${clubTerms.annualSalary.toLocaleString('pl-PL')} PLN rocznie.`
      : selectedTarget.ambitionLevel > negotiation.clubTerms.target.ambitionLevel
      ? 'Zarząd docenia ambicję, ale proponuje ostrożniejszy cel i skorygowaną stawkę.'
      : selectedTarget.ambitionLevel < negotiation.clubTerms.target.ambitionLevel
        ? `Zarząd uważa cel „${selectedTarget.label}” za zbyt zachowawczy. Klub przedstawia kontrofertę opartą na celu „${clubTerms.target.label}”.`
        : 'Zarząd nie zaakceptował wszystkich warunków i przedstawił nową ofertę.',
  };
}

export function createSignedContract(
  negotiation: ManagerContractNegotiation,
  signedAt: Date,
): ManagerContract | null {
  if (negotiation.status !== 'AGREED' || !negotiation.agreedTerms) return null;
  return {
    id: `MANAGER_CONTRACT_${negotiation.clubId}_${signedAt.toISOString()}_${Math.random().toString(36).slice(2, 7)}`,
    clubId: negotiation.clubId,
    signedAt: signedAt.toISOString(),
    source: negotiation.source,
    status: 'ACTIVE',
    terms: negotiation.agreedTerms,
    standardRenewalMonths: 3 + Math.floor(Math.random() * 4),
    earlyRenewalChecked: false,
  };
}

export function createLegacyContract(
  club: Club,
  clubs: Club[],
  profile: ManagerProfile | null,
  seasonStartDate: Date,
): ManagerContract {
  const stableSeed = `${club.id}:${seasonStartDate.getFullYear()}`
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const terms = createTerms(club, clubs, profile, seasonStartDate, undefined, 2);

  return {
    id: `MANAGER_CONTRACT_LEGACY_${club.id}_${seasonStartDate.getFullYear()}`,
    clubId: club.id,
    signedAt: seasonStartDate.toISOString(),
    source: 'CAREER_START',
    status: 'ACTIVE',
    terms,
    standardRenewalMonths: 3 + (stableSeed % 4),
    earlyRenewalChecked: false,
  };
}

export function getLeagueRank(club: Club, clubs: Club[]): number {
  const leagueClubs = clubs.filter(candidate => candidate.leagueId === club.leagueId);
  const sorted = [...leagueClubs].sort((a, b) =>
    b.stats.points - a.stats.points ||
    b.stats.goalDifference - a.stats.goalDifference ||
    b.stats.goalsFor - a.stats.goalsFor
  );
  const rank = sorted.findIndex(candidate => candidate.id === club.id) + 1;
  return rank > 0 ? rank : getLeagueSize(club, clubs);
}

const getPolishCupState = (clubId: string, fixtures: Fixture[]): 'WON' | 'ALIVE' | 'OUT' | 'NOT_STARTED' => {
  const cupFixtures = fixtures.filter(fixture => fixture.leagueId === CompetitionType.POLISH_CUP);
  if (cupFixtures.length === 0) return 'NOT_STARTED';
  const final = cupFixtures.find(fixture => fixture.status === MatchStatus.FINISHED && /FINAŁ|FINAL/i.test(fixture.id));
  if (final) {
    const winnerId = (final.homeScore ?? 0) !== (final.awayScore ?? 0)
      ? ((final.homeScore ?? 0) > (final.awayScore ?? 0) ? final.homeTeamId : final.awayTeamId)
      : ((final.homePenaltyScore ?? 0) > (final.awayPenaltyScore ?? 0) ? final.homeTeamId : final.awayTeamId);
    return winnerId === clubId ? 'WON' : 'OUT';
  }
  if (cupFixtures.some(fixture => fixture.status === MatchStatus.SCHEDULED && (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId))) return 'ALIVE';
  if (cupFixtures.some(fixture => fixture.status === MatchStatus.FINISHED && (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId))) return 'OUT';
  return 'NOT_STARTED';
};

export function evaluateContractPerformance(
  contract: ManagerContract,
  club: Club,
  clubs: Club[],
  fixtures: Fixture[],
): { score: number; rank: number; cupState: ReturnType<typeof getPolishCupState>; targetMet: boolean; summary: string } {
  const rank = getLeagueRank(club, clubs);
  const target = contract.terms.target;
  const played = Math.max(0, club.stats.played);
  const rankGap = rank - target.leagueMaxRank;
  const leagueScore = played < 3 ? 55 : clamp(88 - rankGap * 10 + Math.max(0, -rankGap) * 3, 5, 100);
  const cupState = getPolishCupState(club.id, fixtures);
  const cupScore = !target.requiresPolishCup
    ? 100
    : cupState === 'WON' ? 100 : cupState === 'ALIVE' ? 68 : cupState === 'NOT_STARTED' ? 55 : 15;
  const score = target.requiresPolishCup
    ? Math.round(leagueScore * 0.58 + cupScore * 0.42)
    : Math.round(leagueScore);
  const targetMet = rank <= target.leagueMaxRank && (!target.requiresPolishCup || cupState === 'WON');
  return {
    score,
    rank,
    cupState,
    targetMet,
    summary: `Aktualna pozycja: ${rank}. Cel kontraktowy: ${target.label}.`,
  };
}

export function shouldOfferRenewal(
  contract: ManagerContract,
  club: Club,
  clubs: Club[],
  fixtures: Fixture[],
  early: boolean,
): boolean {
  const performance = evaluateContractPerformance(contract, club, clubs, fixtures);
  const patience = BOARD_LEVEL[club.board?.cierpliwosc ?? 'przecietna'];
  const ambition = BOARD_LEVEL[club.board?.ambicja ?? 'przecietna'];
  const competence = BOARD_LEVEL[club.board?.kompetencja ?? 'przecietna'];
  const threshold = early ? 78 : 48 + ambition * 4 - patience * 2;
  const rngChance = clamp(28 + performance.score * 0.58 + patience * 4 + competence * 3 - ambition * 3, 8, 96);
  return performance.score >= threshold && Math.random() * 100 <= rngChance;
}

export function daysUntilContractEnd(contract: ManagerContract, date: Date): number {
  return Math.ceil((new Date(contract.terms.endDate).getTime() - date.getTime()) / DAY_MS);
}

export const ManagerContractService = {
  SALARY_MODEL_VERSION,
  getAvailableTargets,
  getBoardPreferredTarget,
  getBoardMinimumTarget,
  calculateBaseSalary,
  calculateSalaryForTarget,
  createTerms,
  createNegotiation,
  negotiate,
  createSignedContract,
  createLegacyContract,
  getLeagueRank,
  evaluateContractPerformance,
  shouldOfferRenewal,
  daysUntilContractEnd,
};
