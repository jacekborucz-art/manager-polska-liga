import { Club, Coach, ManagerEmploymentStatus, ManagerProfile } from '../types';

export interface ManagerJobEvaluation {
  requiredExp: number;
  chance: number;
  reason: string;
  pressureLabel: string;
  isVacant: boolean;
  isUnderReview: boolean;
}

const POLISH_LEAGUE_IDS = new Set(['L_PL_1', 'L_PL_2', 'L_PL_3']);

function getLeagueTier(club: Club): number {
  const tier = Number.parseInt(String(club.leagueId).split('_')[2] || '', 10);
  return Number.isFinite(tier) ? tier : club.tier ?? 4;
}

function getRequiredExp(club: Club): number {
  const tier = getLeagueTier(club);
  const reputation = club.reputation ?? 5;

  if (tier === 1) return Math.round(130 + reputation * 18);
  if (tier === 2) return Math.round(35 + reputation * 9);
  return Math.max(1, Math.round(reputation * 4));
}

function getStandingRank(club: Club, clubs: Club[]): number {
  const leagueClubs = clubs.filter(item => item.leagueId === club.leagueId);
  const sorted = [...leagueClubs].sort(
    (a, b) =>
      b.stats.points - a.stats.points ||
      b.stats.goalDifference - a.stats.goalDifference ||
      b.stats.goalsFor - a.stats.goalsFor
  );
  const rank = sorted.findIndex(item => item.id === club.id) + 1;
  return rank > 0 ? rank : Math.ceil(Math.max(1, leagueClubs.length) / 2);
}

function getReviewPressure(club: Club, clubs: Club[]): number {
  const rank = getStandingRank(club, clubs);
  const leagueClubs = clubs.filter(item => item.leagueId === club.leagueId);
  const teamCount = Math.max(1, leagueClubs.length);
  const boardConfidence = club.boardConfidence ?? 50;
  const bottomZone = rank / teamCount;
  const positionPressure = bottomZone >= 0.8 ? 34 : bottomZone >= 0.68 ? 20 : bottomZone >= 0.55 ? 10 : 0;
  const boardPressure = boardConfidence < 30 ? 24 : boardConfidence < 42 ? 12 : 0;
  return Math.max(0, Math.min(100, positionPressure + boardPressure));
}

export function isPolishManagerJobClub(club: Club): boolean {
  return POLISH_LEAGUE_IDS.has(String(club.leagueId)) && club.id !== 'UNEMPLOYED_MANAGER';
}

export function evaluateManagerJob(
  club: Club,
  clubs: Club[],
  coaches: Record<string, Coach>,
  profile: ManagerProfile | null,
  employmentStatus: ManagerEmploymentStatus,
): ManagerJobEvaluation {
  const requiredExp = getRequiredExp(club);
  const managerExp = Math.max(1, profile?.expPoints ?? 1);
  const isVacant = !club.coachId || coaches[club.coachId]?.currentClubId !== club.id;
  const reviewPressure = isVacant ? 100 : getReviewPressure(club, clubs);
  const isUnderReview = reviewPressure >= 28;
  const expGap = managerExp - requiredExp;
  const reputation = club.reputation ?? 5;
  const tier = getLeagueTier(club);

  const vacancyBonus = isVacant ? 22 : 0;
  const pressureBonus = Math.round(reviewPressure * 0.18);
  const firedPenalty = employmentStatus === 'FIRED' ? 12 : 0;
  const lowerLeagueOpenness = tier === 3 ? 10 : tier === 2 ? 4 : 0;
  const reputationSelectivity = Math.max(0, reputation - 5) * 2;

  const rawChance = 52 + expGap * 0.32 + vacancyBonus + pressureBonus + lowerLeagueOpenness - firedPenalty - reputationSelectivity;
  const chance = Math.max(isVacant ? 12 : 4, Math.min(92, Math.round(rawChance)));

  const reason = isVacant
    ? 'Wakat po odejściu trenera'
    : reviewPressure >= 45
      ? 'Zarząd rozważa zmianę trenera'
      : 'Słabe wyniki zwiększają presję na sztab';

  const pressureLabel = isVacant
    ? 'Wakat'
    : reviewPressure >= 45
      ? 'Wysoka presja'
      : 'Monitoring zarządu';

  return {
    requiredExp,
    chance,
    reason,
    pressureLabel,
    isVacant,
    isUnderReview,
  };
}

export function getManagerJobLeagueLabel(club: Club): string {
  const tier = getLeagueTier(club);
  if (tier === 1) return 'Ekstraklasa';
  if (tier === 2) return '1. Liga';
  if (tier === 3) return '2. Liga';
  return `${tier}. Liga`;
}

export const ManagerJobService = {
  evaluateManagerJob,
  getManagerJobLeagueLabel,
  isPolishManagerJobClub,
};
