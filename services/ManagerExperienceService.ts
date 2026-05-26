import {
  Club,
  CompetitionType,
  Fixture,
  ManagerAchievement,
  ManagerCareerSeason,
  ManagerExpEntry,
  ManagerProfile,
  MatchStatus,
} from '../types';

export interface ManagerExpAwardInput {
  sourceKey: string;
  date: Date | string;
  season: number;
  delta: number;
  competition: string;
  label: string;
}

export interface ManagerExperienceProgress {
  rating: number;
  currentPoints: number;
  nextRating: number | null;
  nextRatingPoints: number | null;
  pointsToNext: number;
  progressPercent: number;
}

const MIN_EXP_POINTS = 1;
export type EuropeanCompetitionCode = 'CL' | 'EL' | 'CONF';

function dateKey(date: Date | string): string {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().split('T')[0];
  return parsed.toISOString().split('T')[0];
}

export function getExperienceRating(expPoints: number): number {
  const safePoints = Math.max(MIN_EXP_POINTS, expPoints);
  const rating = 1 + 98 * (1 - Math.exp(-safePoints / 1500));
  return Math.max(1, Math.min(99, Math.round(rating)));
}

function getPointsForRoundedRatingBoundary(ratingBoundary: number): number {
  const raw = Math.max(1, Math.min(98.99, ratingBoundary));
  return Math.ceil(-1500 * Math.log(1 - ((raw - 1) / 98)));
}

export function getExperienceProgress(expPoints: number): ManagerExperienceProgress {
  const currentPoints = Math.max(MIN_EXP_POINTS, expPoints);
  const rating = getExperienceRating(currentPoints);
  if (rating >= 99) {
    return {
      rating,
      currentPoints,
      nextRating: null,
      nextRatingPoints: null,
      pointsToNext: 0,
      progressPercent: 100,
    };
  }

  const currentRatingStart = getPointsForRoundedRatingBoundary(Math.max(1, rating - 0.5));
  const nextRatingPoints = getPointsForRoundedRatingBoundary(rating + 0.5);
  const span = Math.max(1, nextRatingPoints - currentRatingStart);
  const progressPercent = Math.max(0, Math.min(100, ((currentPoints - currentRatingStart) / span) * 100));

  return {
    rating,
    currentPoints,
    nextRating: rating + 1,
    nextRatingPoints,
    pointsToNext: Math.max(0, nextRatingPoints - currentPoints),
    progressPercent,
  };
}

export function ensureManagerExperience(profile: ManagerProfile | null): ManagerProfile | null {
  if (!profile) return null;
  const expPoints = Math.max(MIN_EXP_POINTS, Number.isFinite(profile.expPoints) ? profile.expPoints : MIN_EXP_POINTS);
  return {
    ...profile,
    expPoints,
    experience: Number.isFinite(profile.experience) ? profile.experience : getExperienceRating(expPoints),
    expHistory: Array.isArray(profile.expHistory) ? profile.expHistory : [],
    careerHistory: Array.isArray(profile.careerHistory) ? profile.careerHistory : [],
    achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
  };
}

export function applyExpAwards(profile: ManagerProfile | null, awards: ManagerExpAwardInput[]): ManagerProfile | null {
  const safeProfile = ensureManagerExperience(profile);
  if (!safeProfile || awards.length === 0) return safeProfile;

  const existingKeys = new Set(safeProfile.expHistory.map(entry => entry.sourceKey));
  let expPoints = safeProfile.expPoints;
  const newEntries: ManagerExpEntry[] = [];

  awards.forEach(award => {
    if (existingKeys.has(award.sourceKey) || award.delta === 0) return;
    existingKeys.add(award.sourceKey);
    expPoints = Math.max(MIN_EXP_POINTS, expPoints + award.delta);
    newEntries.push({
      id: `${award.sourceKey}_${dateKey(award.date)}`,
      sourceKey: award.sourceKey,
      date: dateKey(award.date),
      season: award.season,
      delta: award.delta,
      totalAfter: expPoints,
      competition: award.competition,
      label: award.label,
    });
  });

  if (newEntries.length === 0) return safeProfile;

  return {
    ...safeProfile,
    expPoints,
    experience: getExperienceRating(expPoints),
    expHistory: [...newEntries, ...safeProfile.expHistory].slice(0, 250),
  };
}

export function addCareerSeason(profile: ManagerProfile | null, season: ManagerCareerSeason): ManagerProfile | null {
  const safeProfile = ensureManagerExperience(profile);
  if (!safeProfile) return null;
  if (safeProfile.careerHistory.some(entry => entry.id === season.id)) return safeProfile;
  return {
    ...safeProfile,
    careerHistory: [season, ...safeProfile.careerHistory].slice(0, 50),
  };
}

export function addAchievements(profile: ManagerProfile | null, achievements: ManagerAchievement[]): ManagerProfile | null {
  const safeProfile = ensureManagerExperience(profile);
  if (!safeProfile || achievements.length === 0) return safeProfile;

  const existingIds = new Set(safeProfile.achievements.map(entry => entry.id));
  const unique = achievements.filter(achievement => {
    if (existingIds.has(achievement.id)) return false;
    existingIds.add(achievement.id);
    return true;
  });

  if (unique.length === 0) return safeProfile;

  return {
    ...safeProfile,
    achievements: [...unique, ...safeProfile.achievements].slice(0, 100),
  };
}

function winnerFromFixture(fixture: Fixture): string | null {
  const homeScore = fixture.homeScore ?? 0;
  const awayScore = fixture.awayScore ?? 0;
  if (homeScore > awayScore) return fixture.homeTeamId;
  if (awayScore > homeScore) return fixture.awayTeamId;
  if (fixture.homePenaltyScore !== undefined || fixture.awayPenaltyScore !== undefined) {
    const homePens = fixture.homePenaltyScore ?? 0;
    const awayPens = fixture.awayPenaltyScore ?? 0;
    if (homePens > awayPens) return fixture.homeTeamId;
    if (awayPens > homePens) return fixture.awayTeamId;
  }
  return null;
}

function getPolishLeagueResultExp(competitionId: string, winnerId: string | null, userTeamId: string): number {
  if (winnerId && winnerId !== userTeamId) return -1;
  const isDraw = winnerId === null;

  if (competitionId === 'L_PL_1') return isDraw ? 2.5 : 3.5;
  if (competitionId === 'L_PL_2') return isDraw ? 1.5 : 2.5;
  if (competitionId === 'L_PL_3') return isDraw ? 0.5 : 1.5;
  return isDraw ? 0.5 : 1;
}

export function buildDomesticMatchAward(
  fixture: Fixture,
  userTeamId: string,
  currentDate: Date,
  season: number,
): ManagerExpAwardInput | null {
  if (fixture.status !== MatchStatus.FINISHED) return null;
  if (fixture.homeTeamId !== userTeamId && fixture.awayTeamId !== userTeamId) return null;

  const competitionId = String(fixture.leagueId);
  const isPolishLeague = competitionId.startsWith('L_PL_');
  const isPolishCup = fixture.leagueId === CompetitionType.POLISH_CUP;
  if (!isPolishLeague && !isPolishCup) return null;

  const winnerId = winnerFromFixture(fixture);
  const delta = isPolishLeague
    ? getPolishLeagueResultExp(competitionId, winnerId, userTeamId)
    : winnerId === userTeamId ? 2 : winnerId === null ? 1 : -1;
  const resultLabel = winnerId === userTeamId ? 'Zwycięstwo' : winnerId === null ? 'Remis' : 'Porażka';
  const competition = isPolishCup ? 'Puchar Polski' : 'Liga Polska';

  return {
    sourceKey: `match:${fixture.id}`,
    date: currentDate,
    season,
    delta,
    competition,
    label: `${resultLabel} - ${competition}`,
  };
}

export function promotionExpForReputation(reputation: number): number {
  const normalized = Math.max(0, Math.min(1, (reputation - 1) / 9));
  return Math.round(20 - normalized * 10);
}

export function getEuropeanCompetitionCode(leagueId: string): EuropeanCompetitionCode | null {
  if (leagueId.startsWith('CL_')) return 'CL';
  if (leagueId.startsWith('EL_')) return 'EL';
  if (leagueId.startsWith('CONF_')) return 'CONF';
  return null;
}

function reputationScaledPoints(reputation: number, min: number, max: number): number {
  const normalized = Math.max(0, Math.min(1, (reputation - 1) / 9));
  return Math.round(min + normalized * (max - min));
}

export function getEuropeanCompetitionName(comp: EuropeanCompetitionCode): string {
  if (comp === 'CL') return 'Liga Mistrzów';
  if (comp === 'EL') return 'Liga Europy';
  return 'Liga Konferencji';
}

export function buildEuropeanMatchAward(
  fixture: Fixture,
  userTeamId: string,
  currentDate: Date,
  season: number,
  clubs: Club[],
): ManagerExpAwardInput | null {
  if (fixture.status !== MatchStatus.FINISHED) return null;
  if (fixture.homeTeamId !== userTeamId && fixture.awayTeamId !== userTeamId) return null;

  const comp = getEuropeanCompetitionCode(String(fixture.leagueId));
  if (!comp) return null;

  const userIsHome = fixture.homeTeamId === userTeamId;
  const userScore = userIsHome ? (fixture.homeScore ?? 0) : (fixture.awayScore ?? 0);
  const opponentScore = userIsHome ? (fixture.awayScore ?? 0) : (fixture.homeScore ?? 0);
  if (userScore < opponentScore) return null;

  const opponentId = userIsHome ? fixture.awayTeamId : fixture.homeTeamId;
  const opponentReputation = clubs.find(club => club.id === opponentId)?.reputation ?? 5;
  const delta = (() => {
    if (comp === 'CL') {
      return userScore > opponentScore
        ? reputationScaledPoints(opponentReputation, 5, 10)
        : reputationScaledPoints(opponentReputation, 3, 5);
    }
    if (comp === 'EL') return userScore > opponentScore ? 4 : 2;
    return userScore > opponentScore ? 3 : 1;
  })();

  return {
    sourceKey: `euro-match:${fixture.id}`,
    date: currentDate,
    season,
    delta,
    competition: getEuropeanCompetitionName(comp),
    label: `${userScore > opponentScore ? 'Zwycięstwo' : 'Remis'} - ${getEuropeanCompetitionName(comp)}`,
  };
}

export function buildEuropeanProgressAward(
  sourceKey: string,
  comp: EuropeanCompetitionCode,
  stage: 'GROUP_ENTRY' | 'GROUP_EXIT' | 'NEXT_ROUND' | 'FINAL' | 'WINNER',
  date: Date | string,
  season: number,
): ManagerExpAwardInput {
  const deltaByComp: Record<EuropeanCompetitionCode, Record<typeof stage, number>> = {
    CL: { GROUP_ENTRY: 15, GROUP_EXIT: 30, NEXT_ROUND: 25, FINAL: 50, WINNER: 200 },
    EL: { GROUP_ENTRY: 10, GROUP_EXIT: 20, NEXT_ROUND: 15, FINAL: 35, WINNER: 120 },
    CONF: { GROUP_ENTRY: 8, GROUP_EXIT: 18, NEXT_ROUND: 13, FINAL: 33, WINNER: 100 },
  };
  const stageLabel: Record<typeof stage, string> = {
    GROUP_ENTRY: 'Awans do fazy grupowej',
    GROUP_EXIT: 'Wyjście z grupy',
    NEXT_ROUND: 'Awans do kolejnej rundy',
    FINAL: 'Awans do finału',
    WINNER: 'Zwycięstwo w finale',
  };

  return {
    sourceKey,
    date,
    season,
    delta: deltaByComp[comp][stage],
    competition: getEuropeanCompetitionName(comp),
    label: `${stageLabel[stage]} - ${getEuropeanCompetitionName(comp)}`,
  };
}

export const ManagerExperienceService = {
  addAchievements,
  addCareerSeason,
  applyExpAwards,
  buildDomesticMatchAward,
  buildEuropeanMatchAward,
  buildEuropeanProgressAward,
  ensureManagerExperience,
  getExperienceProgress,
  getEuropeanCompetitionCode,
  getEuropeanCompetitionName,
  getExperienceRating,
  promotionExpForReputation,
};
