import {
  HealthStatus,
  MatchEventType,
  type GoalTickerInfo,
  type MatchContext,
  type MatchSummary,
  type MatchSummaryEvent,
  type MatchSummaryTeamStats,
  type Player,
  type PlayerPerformance,
} from '../../../../types';
import type {
  CupMatchEvent,
  CupMatchInput,
  CupMatchResult,
  CupPlayerMatchStats,
  CupTeamSide,
} from '../../engines/cupV2';

export type CupMatchReportAdapterOptions = {
  userTeamId?: string;
};

const GOAL_TYPES = new Set<MatchEventType>([
  MatchEventType.GOAL,
  MatchEventType.ONE_ON_ONE_GOAL,
  MatchEventType.PENALTY_SCORED,
]);

const IMPORTANT_TIMELINE_TYPES = new Set<MatchEventType>([
  MatchEventType.GOAL,
  MatchEventType.ONE_ON_ONE_GOAL,
  MatchEventType.PENALTY_SCORED,
  MatchEventType.PENALTY_MISSED,
  MatchEventType.SHOT_POST,
  MatchEventType.SHOT_BAR,
  MatchEventType.SAVE,
  MatchEventType.ONE_ON_ONE_SAVE,
  MatchEventType.YELLOW_CARD,
  MatchEventType.RED_CARD,
  MatchEventType.INJURY_LIGHT,
  MatchEventType.INJURY_SEVERE,
  MatchEventType.SUBSTITUTION,
  MatchEventType.PENALTY_AWARDED,
]);

const pctPossession = (sideTicks: number, totalTicks: number): number =>
  totalTicks > 0 ? Math.round((sideTicks / totalTicks) * 100) : 50;

const teamStats = (
  result: CupMatchResult,
  side: CupTeamSide,
): MatchSummaryTeamStats => {
  const homeTicks = result.stats.HOME.possessionTicks;
  const awayTicks = result.stats.AWAY.possessionTicks;
  const totalTicks = homeTicks + awayTicks;
  const source = result.stats[side];

  return {
    shots: source.shots,
    shotsOnTarget: source.shotsOnTarget,
    corners: source.corners,
    fouls: source.fouls,
    offsides: source.offsides,
    yellowCards: source.yellowCards,
    redCards: source.redCards,
    possession: pctPossession(source.possessionTicks, totalTicks),
  };
};

const playerLookup = (input: CupMatchInput): Map<string, Player> => {
  const lookup = new Map<string, Player>();
  input.home.players.forEach(player => lookup.set(player.id, player));
  input.away.players.forEach(player => lookup.set(player.id, player));
  return lookup;
};

const playerName = (
  players: Map<string, Player>,
  statsById: Map<string, CupPlayerMatchStats>,
  playerId?: string,
): string => {
  if (!playerId) return '';
  const player = players.get(playerId);
  if (player) return `${player.firstName} ${player.lastName}`.trim();
  return statsById.get(playerId)?.name ?? '';
};

const flattenPlayerStats = (result: CupMatchResult, side: CupTeamSide): CupPlayerMatchStats[] =>
  Object.values(result.playerStats[side])
    .filter(player => player.minutesPlayed > 0)
    .sort((a, b) => b.minutesPlayed - a.minutesPlayed || b.rating - a.rating);

const toPerformance = (
  player: CupPlayerMatchStats,
  result: CupMatchResult,
): PlayerPerformance => ({
  playerId: player.playerId,
  name: player.name,
  position: player.position,
  goals: player.goals,
  assists: player.assists,
  yellowCards: player.yellowCards,
  redCards: player.redCards,
  missedPenalties: player.penaltiesMissed,
  savedPenalties: player.penaltiesSaved,
  healthStatus: player.injuriesLight > 0 || player.injuriesSevere > 0 ? HealthStatus.INJURED : HealthStatus.HEALTHY,
  injuryDays: player.injuriesSevere > 0 ? 28 : player.injuriesLight > 0 ? 7 : undefined,
  fatigue: Math.round(result.finalState.fatigue[player.playerId] ?? 75),
  rating: player.rating,
});

const detailBool = (event: CupMatchEvent, key: string): boolean =>
  event.detail?.[key] === true;

const detailString = (event: CupMatchEvent, key: string): string | undefined => {
  const value = event.detail?.[key];
  return typeof value === 'string' ? value : undefined;
};

const isOwnGoal = (event: CupMatchEvent): boolean => detailBool(event, 'isOwnGoal');

const isShootoutPenalty = (event: CupMatchEvent): boolean => detailBool(event, 'isShootout');

const buildGoalTicker = (
  event: CupMatchEvent,
  players: Map<string, Player>,
  statsById: Map<string, CupPlayerMatchStats>,
): GoalTickerInfo => {
  const ownGoalPlayerId = detailString(event, 'ownGoalPlayerId') ?? (isOwnGoal(event) ? event.playerId : undefined);

  return {
    playerName: playerName(players, statsById, event.playerId) || event.text,
    scorerId: isOwnGoal(event) ? undefined : event.playerId,
    minute: event.minute,
    isPenalty: event.type === MatchEventType.PENALTY_SCORED,
    assistantName: event.secondaryPlayerId ? playerName(players, statsById, event.secondaryPlayerId) : undefined,
    assistantId: event.secondaryPlayerId,
    isOwnGoal: isOwnGoal(event),
    ownGoalPlayerId,
    ownGoalPlayerName: ownGoalPlayerId ? playerName(players, statsById, ownGoalPlayerId) : undefined,
  };
};

const buildGoals = (
  result: CupMatchResult,
  players: Map<string, Player>,
  statsById: Map<string, CupPlayerMatchStats>,
  side: CupTeamSide,
): GoalTickerInfo[] =>
  result.events
    .filter(event => event.side === side && GOAL_TYPES.has(event.type) && !isShootoutPenalty(event))
    .map(event => buildGoalTicker(event, players, statsById));

const buildTimeline = (
  result: CupMatchResult,
  players: Map<string, Player>,
  statsById: Map<string, CupPlayerMatchStats>,
): MatchSummaryEvent[] => {
  let homeScore = 0;
  let awayScore = 0;

  return result.events
    .filter(event => event.side && (IMPORTANT_TIMELINE_TYPES.has(event.type) || GOAL_TYPES.has(event.type)))
    .sort((a, b) => a.second - b.second)
    .map(event => {
      const shootoutPenalty = isShootoutPenalty(event);
      if (GOAL_TYPES.has(event.type) && !shootoutPenalty) {
        if (event.side === 'HOME') homeScore += 1;
        if (event.side === 'AWAY') awayScore += 1;
      }

      const ownGoalPlayerId = detailString(event, 'ownGoalPlayerId') ?? (isOwnGoal(event) ? event.playerId : undefined);

      return {
        minute: event.minute,
        type: event.type,
        playerName: playerName(players, statsById, event.playerId) || event.text,
        assistantName: event.secondaryPlayerId && !shootoutPenalty ? playerName(players, statsById, event.secondaryPlayerId) : undefined,
        teamSide: event.side!,
        text: event.text,
        scoreAtMoment: shootoutPenalty
          ? detailString(event, 'penaltyScore')
          : GOAL_TYPES.has(event.type) ? `${homeScore}:${awayScore}` : undefined,
        isOwnGoal: isOwnGoal(event),
        ownGoalPlayerName: ownGoalPlayerId ? playerName(players, statsById, ownGoalPlayerId) : undefined,
      };
    });
};

const playerStatsById = (result: CupMatchResult): Map<string, CupPlayerMatchStats> =>
  new Map([
    ...Object.values(result.playerStats.HOME),
    ...Object.values(result.playerStats.AWAY),
  ].map(player => [player.playerId, player]));

export const CupMatchReportAdapter = {
  fromMatchContext: (
    ctx: MatchContext,
    input: CupMatchInput,
    result: CupMatchResult,
    options: CupMatchReportAdapterOptions = {},
  ): MatchSummary => {
    const players = playerLookup(input);
    const statsById = playerStatsById(result);

    return {
      matchId: ctx.fixture.id,
      userTeamId: options.userTeamId ?? ctx.homeClub.id,
      homeClub: ctx.homeClub,
      awayClub: ctx.awayClub,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      homeGoals: buildGoals(result, players, statsById, 'HOME'),
      awayGoals: buildGoals(result, players, statsById, 'AWAY'),
      homeStats: teamStats(result, 'HOME'),
      awayStats: teamStats(result, 'AWAY'),
      homePlayers: flattenPlayerStats(result, 'HOME').map(player => toPerformance(player, result)),
      awayPlayers: flattenPlayerStats(result, 'AWAY').map(player => toPerformance(player, result)),
      timeline: buildTimeline(result, players, statsById),
      refereeId: input.environment.referee.id,
      refereeName: `${input.environment.referee.firstName} ${input.environment.referee.lastName}`,
      attendance: input.environment.attendance,
      homePenaltyScore: result.penaltyScore?.home,
      awayPenaltyScore: result.penaltyScore?.away,
      isExtraTime: result.finalState.second > 90 * 60,
    };
  },
};
