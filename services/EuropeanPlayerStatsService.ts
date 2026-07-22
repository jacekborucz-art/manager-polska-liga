import {
  Club,
  HealthStatus,
  MatchLiveState,
  Player,
  PlayerPosition,
  PlayerStats,
  SubstitutionRecord
} from '../types';
import { PlayerFormService } from './PlayerFormService';

const emptyStats = (): PlayerStats => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: []
});

const BACKGROUND_STATS_BALANCE_VERSION = 2;

const getPlayedIds = (lineup: MatchLiveState['homeLineup'], history: SubstitutionRecord[]) => {
  const currentOnPitch = lineup.startingXI.filter((id): id is string => !!id);
  const subbedOut = history
    .map(sub => sub.playerOutId)
    .filter((id): id is string => !!id && id !== 'NONE' && id !== '??');

  return new Set([...currentOnPitch, ...subbedOut]);
};

const goalBelongsToPlayer = (goal: any, player: Player) => {
  const displayName = `${player.firstName.charAt(0)}. ${player.lastName}`;
  return goal.scorerId === player.id ||
    goal.playerId === player.id ||
    goal.playerName === player.lastName ||
    goal.playerName === displayName;
};

const assistBelongsToPlayer = (goal: any, player: Player) => {
  const displayName = `${player.firstName.charAt(0)}. ${player.lastName}`;
  return goal.assistantId === player.id ||
    goal.assistId === player.id ||
    goal.assistantName === player.lastName ||
    goal.assistantName === displayName;
};

const updateSquadEuroStats = (
  squad: Player[],
  referenceSquad: Player[],
  playedIds: Set<string>,
  goalsFor: MatchLiveState['homeGoals'],
  goalsAgainst: number,
  yellowCards: Record<string, number>,
  redIds: string[],
  ratings: Record<string, number> = {}
) => {
  return squad.map(player => {
    const referencePlayer = referenceSquad.find(p => p.id === player.id) ?? player;
    const euroStats = { ...(player.euroStats ?? emptyStats()) };
    let euroSuspensionMatches = Math.max(0, (player.euroSuspensionMatches ?? 0) - 1);

    if (playedIds.has(player.id)) {
      euroStats.matchesPlayed += 1;
      euroStats.minutesPlayed += 90;
      const rating = ratings[player.id];
      if (typeof rating === 'number' && Number.isFinite(rating)) {
        euroStats.ratingHistory = [...(euroStats.ratingHistory ?? []), rating];
      }
      if (goalsAgainst === 0 && referencePlayer.position === PlayerPosition.GK) {
        euroStats.cleanSheets += 1;
      }
    }

    goalsFor
      .filter(goal => !goal.varDisallowed && !goal.isMiss)
      .forEach(goal => {
        if (goalBelongsToPlayer(goal, referencePlayer)) euroStats.goals += 1;
        if (assistBelongsToPlayer(goal, referencePlayer)) euroStats.assists += 1;
      });

    const yellows = yellowCards[player.id] ?? 0;
    for (let i = 0; i < yellows; i += 1) {
      euroStats.yellowCards += 1;
      if (euroStats.yellowCards % 4 === 0) euroSuspensionMatches += 1;
    }

    if (redIds.includes(player.id)) {
      euroStats.redCards += 1;
      euroSuspensionMatches += 2;
    }

    return { ...player, euroStats, euroSuspensionMatches };
  });
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const rngFromSeed = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const getBackgroundTargetRounds = (date: Date): number => {
  const seasonStartYear = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
  const monthIndex = (date.getFullYear() - seasonStartYear) * 12 + date.getMonth() - 6;
  if (monthIndex < 0) return 0;
  return clamp(monthIndex * 2 + (date.getDate() >= 15 ? 2 : 1), 0, 34);
};

const getSeasonStartYear = (date: Date): number =>
  date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;

const getBackgroundProgressKey = (clubId: string, seasonStartYear: number): string =>
  `europeanLeagueBackground:${clubId}:${seasonStartYear}`;

const getBackgroundCalibrationKey = (clubId: string, seasonStartYear: number): string =>
  `${getBackgroundProgressKey(clubId, seasonStartYear)}:v${BACKGROUND_STATS_BALANCE_VERSION}`;

const getCurrentBackgroundAppearances = (player: Player, progressKey: string): number => {
  const savedProgress = player.stats?.backgroundLeagueProgress?.[progressKey];
  if (typeof savedProgress === 'number' && Number.isFinite(savedProgress)) {
    return Math.max(0, savedProgress);
  }

  return (player.history?.length ?? 0) > 0 ? 0 : Math.max(0, player.stats?.matchesPlayed ?? 0);
};

const getPlayerTargetAppearances = (targetRounds: number, rank: number, player: Player): number => {
  const ageRotation = player.age <= 21 ? 0.08 : player.age >= 33 ? -0.08 : 0;
  const roleFactor = rank < 11 ? 0.92 : rank < 16 ? 0.68 : rank < 21 ? 0.38 : 0.16;
  return Math.max(0, Math.round(targetRounds * clamp(roleFactor + ageRotation, 0.08, 0.98)));
};

const getQualityFactor = (player: Player): number =>
  clamp(((player.overallRating ?? 62) - 60) / 30, 0, 1);

const getAttributeEdge = (value: number): number =>
  clamp((value - 60) / 30, -0.45, 0.9);

const getNormalizedClubReputation = (club: Club): number => {
  const reputation = club.reputation ?? 60;
  return reputation <= 25 ? reputation * 5 : reputation;
};

const getReputationFactor = (club: Club): number =>
  clamp((getNormalizedClubReputation(club) - 60) / 45, -0.45, 0.55);

const getMinutesFactor = (minutes: number): number =>
  clamp(minutes / 90, 0.38, 1);

const getRateControlMultiplier = (currentCount: number, appearances: number, targetRate: number): number => {
  if (appearances < 4 || targetRate <= 0) return 1;

  const currentRate = currentCount / appearances;
  if (currentRate <= targetRate * 0.72) return 1.12;
  if (currentRate <= targetRate * 1.12) return 1;
  if (currentRate <= targetRate * 1.42) return 0.65;
  return 0.35;
};

const getGoalTargetRate = (player: Player, club: Club): number => {
  const quality = getQualityFactor(player);
  const finishingEdge = getAttributeEdge(((player.attributes.attacking ?? 50) + (player.attributes.finishing ?? 50)) / 2);
  const reputation = getReputationFactor(club);

  if (player.position === PlayerPosition.FWD) {
    return clamp(0.18 + quality * 0.16 + finishingEdge * 0.10 + reputation * 0.04, 0.14, 0.52);
  }
  if (player.position === PlayerPosition.MID) {
    return clamp(0.045 + quality * 0.045 + finishingEdge * 0.045 + reputation * 0.012, 0.025, 0.16);
  }
  if (player.position === PlayerPosition.DEF) {
    const headingEdge = getAttributeEdge(player.attributes.heading ?? 50);
    return clamp(0.012 + quality * 0.014 + headingEdge * 0.018 + reputation * 0.006, 0.004, 0.065);
  }
  return 0.0015;
};

const getAssistTargetRate = (player: Player, club: Club): number => {
  const quality = getQualityFactor(player);
  const creationEdge = getAttributeEdge(
    ((player.attributes.passing ?? 50) + (player.attributes.vision ?? 50) + (player.attributes.crossing ?? 50)) / 3
  );
  const reputation = getReputationFactor(club);

  if (player.position === PlayerPosition.MID) {
    return clamp(0.085 + quality * 0.075 + creationEdge * 0.075 + reputation * 0.025, 0.045, 0.27);
  }
  if (player.position === PlayerPosition.FWD) {
    return clamp(0.055 + quality * 0.045 + creationEdge * 0.055 + reputation * 0.016, 0.03, 0.18);
  }
  if (player.position === PlayerPosition.DEF) {
    return clamp(0.025 + quality * 0.025 + creationEdge * 0.025 + reputation * 0.01, 0.012, 0.09);
  }
  return 0.0015;
};

type BackgroundAppearanceOutcome = {
  minutes: number;
  scored: boolean;
  assisted: boolean;
  yellowCard: boolean;
  redCard: boolean;
  cleanSheet: boolean;
};

const getBackgroundRating = (
  player: Player,
  club: Club,
  round: number,
  seedBase: number,
  outcome: BackgroundAppearanceOutcome
): number => {
  const rng = rngFromSeed(hashString(`${club.id}_${player.id}_${round}_${seedBase}_rating`));
  const quality = ((player.overallRating ?? 62) - 62) * 0.024;
  const reputation = (getNormalizedClubReputation(club) - 60) * 0.006;
  const morale = ((player.morale ?? 50) - 50) * 0.007;
  const noise = (rng() - 0.5) * 0.72;
  const minutesAdjustment = outcome.minutes >= 75 ? 0 : outcome.minutes >= 45 ? -0.08 : -0.18;
  const goalBonus =
    player.position === PlayerPosition.FWD ? 0.44 :
    player.position === PlayerPosition.MID ? 0.52 :
    player.position === PlayerPosition.DEF ? 0.66 :
    0.30;
  const assistBonus =
    player.position === PlayerPosition.FWD ? 0.28 :
    player.position === PlayerPosition.MID ? 0.36 :
    player.position === PlayerPosition.DEF ? 0.42 :
    0.18;
  const defensiveBonus = outcome.cleanSheet
    ? player.position === PlayerPosition.GK ? 0.38 : player.position === PlayerPosition.DEF ? 0.24 : 0.04
    : 0;
  const disciplinePenalty = (outcome.yellowCard ? 0.18 : 0) + (outcome.redCard ? 1.25 : 0);

  return Number(clamp(
    6.55 + quality + reputation + morale + noise + minutesAdjustment +
      (outcome.scored ? goalBonus : 0) +
      (outcome.assisted ? assistBonus : 0) +
      defensiveBonus -
      disciplinePenalty,
    5.4,
    8.8
  ).toFixed(1));
};

const generateBackgroundAppearanceOutcome = (
  player: Player,
  club: Club,
  round: number,
  seedBase: number,
  statsBeforeAppearance: Pick<PlayerStats, 'matchesPlayed' | 'goals' | 'assists'>
): BackgroundAppearanceOutcome => {
  const rng = rngFromSeed(hashString(`${club.id}_${player.id}_${round}_${seedBase}_league`));
  const minutes = player.position === PlayerPosition.GK || rng() > 0.22 ? 90 : 25 + Math.floor(rng() * 35);
  const minutesFactor = getMinutesFactor(minutes);
  const goalTargetRate = getGoalTargetRate(player, club);
  const assistTargetRate = getAssistTargetRate(player, club);
  const goalChance = clamp(
    goalTargetRate * minutesFactor * getRateControlMultiplier(statsBeforeAppearance.goals, statsBeforeAppearance.matchesPlayed, goalTargetRate),
    0,
    0.56
  );
  const assistChance = clamp(
    assistTargetRate * minutesFactor * getRateControlMultiplier(statsBeforeAppearance.assists, statsBeforeAppearance.matchesPlayed, assistTargetRate),
    0,
    0.32
  );

  return {
    minutes,
    scored: rng() < goalChance,
    assisted: rng() < assistChance,
    yellowCard: rng() < 0.09,
    redCard: rng() < 0.005,
    cleanSheet: player.position === PlayerPosition.GK && rng() < clamp(0.16 + getNormalizedClubReputation(club) / 520, 0.16, 0.35),
  };
};

const addBackgroundAppearance = (player: Player, club: Club, round: number, seedBase: number): Player => {
  if (player.health?.status === HealthStatus.INJURED) return player;

  const stats = { ...(player.stats ?? emptyStats()), ratingHistory: [...(player.stats?.ratingHistory ?? [])] };
  const outcome = generateBackgroundAppearanceOutcome(player, club, round, seedBase, stats);

  stats.matchesPlayed += 1;
  stats.minutesPlayed += outcome.minutes;
  if (outcome.scored) stats.goals += 1;
  if (outcome.assisted) stats.assists += 1;
  if (outcome.yellowCard) stats.yellowCards += 1;
  if (outcome.redCard) stats.redCards += 1;
  if (outcome.cleanSheet) stats.cleanSheets += 1;
  stats.ratingHistory.push(getBackgroundRating(player, club, round, seedBase, outcome));

  return PlayerFormService.withUpdatedForm({ ...player, stats });
};

const rebalanceExistingBackgroundStats = (
  player: Player,
  club: Club,
  appearances: number,
  seasonStartYear: number,
  seedBase: number
): Player => {
  const calibrationKey = getBackgroundCalibrationKey(club.id, seasonStartYear);
  const currentCalibrationVersion = player.stats?.backgroundLeagueCalibration?.[calibrationKey];
  if (currentCalibrationVersion === BACKGROUND_STATS_BALANCE_VERSION || appearances <= 0) {
    return player;
  }

  let calibratedStats: PlayerStats = {
    ...(player.stats ?? emptyStats()),
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 0,
    minutesPlayed: 0,
    ratingHistory: [],
  };

  for (let round = 0; round < appearances; round += 1) {
    const outcome = generateBackgroundAppearanceOutcome(player, club, round, seedBase, calibratedStats);
    calibratedStats.matchesPlayed += 1;
    calibratedStats.minutesPlayed += outcome.minutes;
    if (outcome.scored) calibratedStats.goals += 1;
    if (outcome.assisted) calibratedStats.assists += 1;
    if (outcome.yellowCard) calibratedStats.yellowCards += 1;
    if (outcome.redCard) calibratedStats.redCards += 1;
    if (outcome.cleanSheet) calibratedStats.cleanSheets += 1;
    calibratedStats.ratingHistory.push(getBackgroundRating(player, club, round, seedBase, outcome));
  }

  calibratedStats = {
    ...calibratedStats,
    backgroundLeagueProgress: {
      ...(player.stats?.backgroundLeagueProgress ?? {}),
      [getBackgroundProgressKey(club.id, seasonStartYear)]: appearances,
    },
    backgroundLeagueCalibration: {
      ...(player.stats?.backgroundLeagueCalibration ?? {}),
      [calibrationKey]: BACKGROUND_STATS_BALANCE_VERSION,
    },
  };

  return PlayerFormService.withUpdatedForm({ ...player, stats: calibratedStats });
};

const applyBackgroundLeagueStatsToSquad = (
  squad: Player[],
  club: Club,
  date: Date,
  seedBase: number
): Player[] => {
  const targetRounds = getBackgroundTargetRounds(date);
  if (targetRounds <= 0) return squad.map(player => PlayerFormService.withUpdatedForm(player));
  const seasonStartYear = getSeasonStartYear(date);
  const progressKey = getBackgroundProgressKey(club.id, seasonStartYear);

  const rankedIds = [...squad]
    .sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0))
    .map(player => player.id);

  return squad.map(player => {
    const rank = Math.max(0, rankedIds.indexOf(player.id));
    const targetAppearances = getPlayerTargetAppearances(targetRounds, rank, player);
    const currentAppearances = getCurrentBackgroundAppearances(player, progressKey);
    let updated = rebalanceExistingBackgroundStats(player, club, currentAppearances, seasonStartYear, seedBase);
    for (let round = currentAppearances; round < targetAppearances; round += 1) {
      updated = addBackgroundAppearance(updated, club, round, seedBase);
    }
    if (targetAppearances > currentAppearances) {
      updated = {
        ...updated,
        stats: {
          ...updated.stats,
          backgroundLeagueProgress: {
            ...(updated.stats?.backgroundLeagueProgress ?? {}),
            [progressKey]: targetAppearances,
          },
          backgroundLeagueCalibration: {
            ...(updated.stats?.backgroundLeagueCalibration ?? {}),
            [getBackgroundCalibrationKey(club.id, seasonStartYear)]: BACKGROUND_STATS_BALANCE_VERSION,
          },
        },
      };
    }
    return PlayerFormService.withUpdatedForm(updated);
  });
};

export const EuropeanPlayerStatsService = {
  applyBackgroundLeagueStatsToDate: (
    squad: Player[],
    club: Club,
    date: Date,
    seedBase: number = 0
  ): Player[] => applyBackgroundLeagueStatsToSquad(squad, club, date, seedBase),

  applyMatchStats: (
    players: Record<string, Player[]>,
    matchState: MatchLiveState,
    homeClubId: string,
    awayClubId: string,
    homePlayers: Player[],
    awayPlayers: Player[],
    ratings: Record<string, number> = {}
  ): Record<string, Player[]> => {
    const playedIdsHome = getPlayedIds(matchState.homeLineup, matchState.homeSubsHistory);
    const playedIdsAway = getPlayedIds(matchState.awayLineup, matchState.awaySubsHistory);

    return {
      ...players,
      [homeClubId]: updateSquadEuroStats(
        players[homeClubId] ?? [],
        homePlayers,
        playedIdsHome,
        matchState.homeGoals,
        matchState.awayScore,
        matchState.playerYellowCards,
        matchState.sentOffIds,
        ratings
      ),
      [awayClubId]: updateSquadEuroStats(
        players[awayClubId] ?? [],
        awayPlayers,
        playedIdsAway,
        matchState.awayGoals,
        matchState.homeScore,
        matchState.playerYellowCards,
        matchState.sentOffIds,
        ratings
      )
    };
  }
};
