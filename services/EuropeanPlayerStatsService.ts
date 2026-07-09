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

const getPlayerTargetAppearances = (targetRounds: number, rank: number, player: Player): number => {
  const ageRotation = player.age <= 21 ? 0.08 : player.age >= 33 ? -0.08 : 0;
  const roleFactor = rank < 11 ? 0.92 : rank < 16 ? 0.68 : rank < 21 ? 0.38 : 0.16;
  return Math.max(0, Math.round(targetRounds * clamp(roleFactor + ageRotation, 0.08, 0.98)));
};

const getBackgroundRating = (player: Player, club: Club, round: number, seedBase: number): number => {
  const rng = rngFromSeed(hashString(`${club.id}_${player.id}_${round}_${seedBase}_rating`));
  const quality = ((player.overallRating ?? 62) - 62) * 0.035;
  const reputation = ((club.reputation ?? 60) - 60) * 0.012;
  const morale = ((player.morale ?? 50) - 50) * 0.01;
  const noise = (rng() - 0.5) * 1.15;
  return Number(clamp(6.45 + quality + reputation + morale + noise, 5.4, 8.6).toFixed(1));
};

const addBackgroundAppearance = (player: Player, club: Club, round: number, seedBase: number): Player => {
  if (player.health?.status === HealthStatus.INJURED) return player;

  const rng = rngFromSeed(hashString(`${club.id}_${player.id}_${round}_${seedBase}_league`));
  const stats = { ...(player.stats ?? emptyStats()), ratingHistory: [...(player.stats?.ratingHistory ?? [])] };
  const minutes = player.position === PlayerPosition.GK || rng() > 0.22 ? 90 : 25 + Math.floor(rng() * 35);
  const attackingScore = (player.attributes.attacking ?? 50) + (player.attributes.finishing ?? 50) + (player.overallRating ?? 60);
  const creationScore = (player.attributes.passing ?? 50) + (player.attributes.vision ?? 50) + (player.attributes.crossing ?? 50);
  const goalChance =
    player.position === PlayerPosition.FWD ? 0.28 + attackingScore / 900 :
    player.position === PlayerPosition.MID ? 0.09 + attackingScore / 1800 :
    player.position === PlayerPosition.DEF ? 0.025 + (player.attributes.heading ?? 50) / 3500 :
    0.003;
  const assistChance =
    player.position === PlayerPosition.MID ? 0.16 + creationScore / 1500 :
    player.position === PlayerPosition.FWD ? 0.09 + creationScore / 2200 :
    player.position === PlayerPosition.DEF ? 0.045 + creationScore / 3000 :
    0.002;

  stats.matchesPlayed += 1;
  stats.minutesPlayed += minutes;
  if (rng() < goalChance) stats.goals += 1;
  if (rng() < assistChance) stats.assists += 1;
  if (rng() < 0.11) stats.yellowCards += 1;
  if (rng() < 0.008) stats.redCards += 1;
  if (player.position === PlayerPosition.GK && rng() < clamp(0.18 + (club.reputation ?? 60) / 400, 0.18, 0.42)) {
    stats.cleanSheets += 1;
  }
  stats.ratingHistory.push(getBackgroundRating(player, club, round, seedBase));

  return PlayerFormService.withUpdatedForm({ ...player, stats });
};

const applyBackgroundLeagueStatsToSquad = (
  squad: Player[],
  club: Club,
  date: Date,
  seedBase: number
): Player[] => {
  const targetRounds = getBackgroundTargetRounds(date);
  if (targetRounds <= 0) return squad.map(player => PlayerFormService.withUpdatedForm(player));

  const rankedIds = [...squad]
    .sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0))
    .map(player => player.id);

  return squad.map(player => {
    const rank = Math.max(0, rankedIds.indexOf(player.id));
    const targetAppearances = getPlayerTargetAppearances(targetRounds, rank, player);
    let updated = player;
    const currentAppearances = player.stats?.matchesPlayed ?? 0;
    for (let round = currentAppearances; round < targetAppearances; round += 1) {
      updated = addBackgroundAppearance(updated, club, round, seedBase);
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
