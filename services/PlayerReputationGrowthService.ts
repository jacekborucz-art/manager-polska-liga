import { Club, MatchHistoryEntry, Player, PlayerStats } from '../types';

type StatKind = 'goals' | 'assists';
type EuropeanCompetitionGroup = 'CL' | 'EL' | 'CONF';

const EMPTY_STATS: PlayerStats = {
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: [],
};

const clampReputation = (value: number): number => Math.max(1, Math.min(99, Math.round(value)));

const getPlayerReputation = (player: Player): number => clampReputation(player.reputacja ?? 50);

const addDelta = (deltas: Map<string, number>, playerId: string | undefined, delta: number): void => {
  if (!playerId || delta <= 0) return;
  deltas.set(playerId, (deltas.get(playerId) ?? 0) + delta);
};

const getStats = (player: Player): PlayerStats => player.stats ?? EMPTY_STATS;

const getAverageRating = (player: Player): number | null => {
  const ratings = [
    ...(player.stats?.ratingHistory ?? []),
    ...(player.cupStats?.ratingHistory ?? []),
    ...(player.euroStats?.ratingHistory ?? []),
    ...(player.nationalStats?.ratingHistory ?? []),
  ];

  if (ratings.length === 0) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
};

const getLeagueTopDelta = (leagueId: string): number => {
  if (leagueId === 'L_PL_1') return 2;
  if (leagueId === 'L_PL_2' || leagueId === 'L_PL_3') return 1;
  return 0;
};

const getTopLeaguePlayers = (
  leagueId: string,
  clubs: Club[],
  playersMap: Record<string, Player[]>,
  statKind: StatKind
): Player[] => {
  return clubs
    .filter(club => club.leagueId === leagueId && club.isDefaultActive)
    .flatMap(club => playersMap[club.id] ?? [])
    .filter(player => getStats(player)[statKind] > 0)
    .sort((a, b) => {
      const aStats = getStats(a);
      const bStats = getStats(b);
      if (bStats[statKind] !== aStats[statKind]) return bStats[statKind] - aStats[statKind];

      const tieBreakKind: StatKind = statKind === 'goals' ? 'assists' : 'goals';
      if (bStats[tieBreakKind] !== aStats[tieBreakKind]) return bStats[tieBreakKind] - aStats[tieBreakKind];
      return aStats.matchesPlayed - bStats.matchesPlayed;
    })
    .slice(0, 3);
};

const getEuropeanGroup = (competition: string): EuropeanCompetitionGroup | null => {
  if (competition.startsWith('CL_')) return 'CL';
  if (competition.startsWith('EL_')) return 'EL';
  if (competition.startsWith('CONF_')) return 'CONF';
  return null;
};

const getEuropeanTopPlayers = (
  matchHistory: MatchHistoryEntry[],
  seasonNumber: number,
  group: EuropeanCompetitionGroup,
  statKind: StatKind
): string[] => {
  const totals = new Map<string, number>();

  matchHistory
    .filter(entry => entry.season === seasonNumber && getEuropeanGroup(entry.competition) === group)
    .forEach(entry => {
      entry.goals
        .filter(goal => !goal.varDisallowed && !goal.isMiss)
        .forEach(goal => {
          const playerId = statKind === 'goals' ? goal.playerId : goal.assistantId;
          if (!playerId) return;
          totals.set(playerId, (totals.get(playerId) ?? 0) + 1);
        });
    });

  return [...totals.entries()]
    .filter(([, total]) => total > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 1)
    .map(([playerId]) => playerId);
};

export const PlayerReputationGrowthService = {
  transferUpgradeDelta: (fromClubReputation: number, toClubReputation: number): number => {
    const jump = Math.max(0, toClubReputation - fromClubReputation);
    if (jump <= 0) return 0;
    return Math.min(5, Math.max(1, Math.ceil(jump / 2)));
  },

  applyTransferUpgrade: (player: Player, fromClubReputation: number, toClubReputation: number): Player => {
    const delta = PlayerReputationGrowthService.transferUpgradeDelta(fromClubReputation, toClubReputation);
    if (delta <= 0) return player;
    return {
      ...player,
      reputacja: clampReputation(getPlayerReputation(player) + delta),
    };
  },

  applySeasonEndGrowth: (
    playersMap: Record<string, Player[]>,
    clubs: Club[],
    matchHistory: MatchHistoryEntry[],
    seasonNumber: number
  ): Record<string, Player[]> => {
    const deltas = new Map<string, number>();

    (['L_PL_1', 'L_PL_2', 'L_PL_3'] as const).forEach(leagueId => {
      const delta = getLeagueTopDelta(leagueId);
      if (delta <= 0) return;

      getTopLeaguePlayers(leagueId, clubs, playersMap, 'goals').forEach(player => addDelta(deltas, player.id, delta));
      getTopLeaguePlayers(leagueId, clubs, playersMap, 'assists').forEach(player => addDelta(deltas, player.id, delta));
    });

    Object.values(playersMap).flat().forEach(player => {
      const averageRating = getAverageRating(player);
      if (averageRating !== null && averageRating > 7.5) {
        addDelta(deltas, player.id, 1);
      }
    });

    getEuropeanTopPlayers(matchHistory, seasonNumber, 'CL', 'goals')
      .forEach(playerId => addDelta(deltas, playerId, 3));
    getEuropeanTopPlayers(matchHistory, seasonNumber, 'EL', 'goals')
      .forEach(playerId => addDelta(deltas, playerId, 2));
    getEuropeanTopPlayers(matchHistory, seasonNumber, 'CONF', 'goals')
      .forEach(playerId => addDelta(deltas, playerId, 2));
    getEuropeanTopPlayers(matchHistory, seasonNumber, 'CL', 'assists')
      .forEach(playerId => addDelta(deltas, playerId, 2));
    getEuropeanTopPlayers(matchHistory, seasonNumber, 'EL', 'assists')
      .forEach(playerId => addDelta(deltas, playerId, 1));
    getEuropeanTopPlayers(matchHistory, seasonNumber, 'CONF', 'assists')
      .forEach(playerId => addDelta(deltas, playerId, 1));

    if (deltas.size === 0) return playersMap;

    return Object.fromEntries(
      Object.entries(playersMap).map(([clubId, squad]) => [
        clubId,
        squad.map(player => {
          const delta = deltas.get(player.id) ?? 0;
          if (delta <= 0) return player;
          return {
            ...player,
            reputacja: clampReputation(getPlayerReputation(player) + delta),
          };
        }),
      ])
    );
  },
};
