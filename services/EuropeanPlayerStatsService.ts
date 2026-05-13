import {
  MatchLiveState,
  Player,
  PlayerPosition,
  PlayerStats,
  SubstitutionRecord
} from '../types';

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
  redIds: string[]
) => {
  return squad.map(player => {
    const referencePlayer = referenceSquad.find(p => p.id === player.id) ?? player;
    const euroStats = { ...(player.euroStats ?? emptyStats()) };
    let euroSuspensionMatches = Math.max(0, (player.euroSuspensionMatches ?? 0) - 1);

    if (playedIds.has(player.id)) {
      euroStats.matchesPlayed += 1;
      euroStats.minutesPlayed += 90;
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

export const EuropeanPlayerStatsService = {
  applyMatchStats: (
    players: Record<string, Player[]>,
    matchState: MatchLiveState,
    homeClubId: string,
    awayClubId: string,
    homePlayers: Player[],
    awayPlayers: Player[]
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
        matchState.sentOffIds
      ),
      [awayClubId]: updateSquadEuroStats(
        players[awayClubId] ?? [],
        awayPlayers,
        playedIdsAway,
        matchState.awayGoals,
        matchState.homeScore,
        matchState.playerYellowCards,
        matchState.sentOffIds
      )
    };
  }
};
