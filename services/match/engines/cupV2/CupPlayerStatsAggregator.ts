import { MatchEventType, PlayerPosition, type Player } from '../../../../types';
import type {
  CupMatchEvent,
  CupMatchInput,
  CupPlayerMatchStats,
  CupPlayerStatsMap,
  CupTeamStatsMap,
  CupTeamSide,
} from './CupMatchTypes';
import { CupPlayerRatingService } from './CupPlayerRatingService';

type AggregationInput = {
  match: CupMatchInput;
  events: CupMatchEvent[];
  finalSecond: number;
  homeScore: number;
  awayScore: number;
  initialLineups?: Record<CupTeamSide, (string | null)[]>;
  finalFatigue?: Record<string, number>;
  teamStats?: CupTeamStatsMap;
};

const SHOT_TYPES = new Set<MatchEventType>([
  MatchEventType.SHOT,
  MatchEventType.SHOT_ON_TARGET,
  MatchEventType.SAVE,
  MatchEventType.SHOT_POST,
  MatchEventType.SHOT_BAR,
  MatchEventType.GOAL,
  MatchEventType.ONE_ON_ONE_GOAL,
  MatchEventType.ONE_ON_ONE_MISS,
  MatchEventType.ONE_ON_ONE_SAVE,
  MatchEventType.PENALTY_SCORED,
  MatchEventType.PENALTY_MISSED,
]);

const ON_TARGET_TYPES = new Set<MatchEventType>([
  MatchEventType.SHOT_ON_TARGET,
  MatchEventType.SAVE,
  MatchEventType.GOAL,
  MatchEventType.ONE_ON_ONE_GOAL,
  MatchEventType.ONE_ON_ONE_SAVE,
  MatchEventType.PENALTY_SCORED,
]);

const GOAL_TYPES = new Set<MatchEventType>([
  MatchEventType.GOAL,
  MatchEventType.ONE_ON_ONE_GOAL,
  MatchEventType.PENALTY_SCORED,
]);

const SAVE_TYPES = new Set<MatchEventType>([
  MatchEventType.SAVE,
  MatchEventType.ONE_ON_ONE_SAVE,
]);

const formatName = (player: Player): string => `${player.firstName} ${player.lastName}`.trim();

const emptyTeamStats = (): Record<string, CupPlayerMatchStats> => ({});

const playerById = (match: CupMatchInput): Map<string, { player: Player; side: CupTeamSide }> => {
  const players = new Map<string, { player: Player; side: CupTeamSide }>();
  match.home.players.forEach(player => players.set(player.id, { player, side: 'HOME' }));
  match.away.players.forEach(player => players.set(player.id, { player, side: 'AWAY' }));
  return players;
};

const activeLineups = (match: CupMatchInput, initialLineups?: Record<CupTeamSide, (string | null)[]>) => ({
  HOME: initialLineups?.HOME ?? match.home.lineup.startingXI,
  AWAY: initialLineups?.AWAY ?? match.away.lineup.startingXI,
});

const createPlayerStats = (player: Player, side: CupTeamSide, starter: boolean): CupPlayerMatchStats => ({
  playerId: player.id,
  name: formatName(player),
  side,
  clubId: player.clubId,
  position: player.position,
  starter,
  startedSecond: starter ? 0 : undefined,
  endedSecond: undefined,
  minutesPlayed: 0,
  goals: 0,
  ownGoals: 0,
  assists: 0,
  shots: 0,
  shotsOnTarget: 0,
  shotsOffTarget: 0,
  posts: 0,
  bars: 0,
  xG: 0,
  chancesCreated: 0,
  keyPasses: 0,
  foulsCommitted: 0,
  foulsWon: 0,
  offsides: 0,
  yellowCards: 0,
  redCards: 0,
  injuriesLight: 0,
  injuriesSevere: 0,
  substitutionsOn: starter ? 0 : 0,
  substitutionsOff: 0,
  saves: 0,
  goalsConceded: 0,
  penaltiesTaken: 0,
  penaltiesScored: 0,
  penaltiesMissed: 0,
  penaltiesSaved: 0,
  rating: 6,
});

const ensureStats = (
  stats: CupPlayerStatsMap,
  lookup: Map<string, { player: Player; side: CupTeamSide }>,
  playerId: string,
  fallbackSide?: CupTeamSide,
): CupPlayerMatchStats | undefined => {
  const found = lookup.get(playerId);
  if (!found && !fallbackSide) return undefined;
  const side = found?.side ?? fallbackSide!;
  const player = found?.player;
  if (!player) return undefined;

  if (!stats[side][playerId]) {
    stats[side][playerId] = createPlayerStats(player, side, false);
  }

  return stats[side][playerId];
};

const opponentSide = (side: CupTeamSide): CupTeamSide => side === 'HOME' ? 'AWAY' : 'HOME';

const goalkeeperIdForSide = (match: CupMatchInput, side: CupTeamSide, lineups: Record<CupTeamSide, (string | null)[]>): string | undefined => {
  const team = side === 'HOME' ? match.home : match.away;
  const byId = new Map(team.players.map(player => [player.id, player]));
  return lineups[side]
    .map(id => id ? byId.get(id) : undefined)
    .find(player => player?.position === PlayerPosition.GK)
    ?.id;
};

const activeGoalkeeperAtSecond = (
  match: CupMatchInput,
  events: CupMatchEvent[],
  side: CupTeamSide,
  lineups: Record<CupTeamSide, (string | null)[]>,
  second: number,
): string | undefined => {
  let keeperId = goalkeeperIdForSide(match, side, lineups);
  const team = side === 'HOME' ? match.home : match.away;
  const players = new Map(team.players.map(player => [player.id, player]));

  events
    .filter(event => event.type === MatchEventType.SUBSTITUTION && event.side === side && event.second <= second)
    .sort((a, b) => a.second - b.second)
    .forEach(event => {
      const playerIn = event.playerId ? players.get(event.playerId) : undefined;
      if (event.secondaryPlayerId === keeperId && playerIn) {
        keeperId = playerIn.id;
      }
    });

  return keeperId;
};

const markMinutes = (
  stats: CupPlayerStatsMap,
  lookup: Map<string, { player: Player; side: CupTeamSide }>,
  match: CupMatchInput,
  events: CupMatchEvent[],
  finalSecond: number,
  lineups: Record<CupTeamSide, (string | null)[]>,
): void => {
  (['HOME', 'AWAY'] as CupTeamSide[]).forEach(side => {
    lineups[side].forEach(id => {
      if (!id) return;
      const entry = ensureStats(stats, lookup, id, side);
      if (!entry) return;
      entry.starter = true;
      entry.startedSecond = 0;
    });
  });

  events
    .filter(event => event.type === MatchEventType.SUBSTITUTION)
    .sort((a, b) => a.second - b.second)
    .forEach(event => {
      if (!event.side) return;
      const playerIn = event.playerId ? ensureStats(stats, lookup, event.playerId, event.side) : undefined;
      const playerOut = event.secondaryPlayerId ? ensureStats(stats, lookup, event.secondaryPlayerId, event.side) : undefined;

      if (playerIn) {
        playerIn.substitutionsOn += 1;
        if (playerIn.startedSecond === undefined) playerIn.startedSecond = event.second;
      }
      if (playerOut) {
        playerOut.substitutionsOff += 1;
        playerOut.endedSecond = Math.min(playerOut.endedSecond ?? event.second, event.second);
      }
    });

  Object.values(stats).forEach(teamStats => {
    Object.values(teamStats).forEach(entry => {
      if (entry.startedSecond === undefined) return;
      const end = entry.endedSecond ?? finalSecond;
      entry.minutesPlayed = Math.max(0, Math.ceil((end - entry.startedSecond) / 60));
    });
  });
};

const detailBool = (event: CupMatchEvent, key: string): boolean =>
  event.detail?.[key] === true;

const detailString = (event: CupMatchEvent, key: string): string | undefined => {
  const value = event.detail?.[key];
  return typeof value === 'string' ? value : undefined;
};

const isOwnGoalEvent = (event: CupMatchEvent): boolean => detailBool(event, 'isOwnGoal');

const isShootoutPenalty = (event: CupMatchEvent): boolean => detailBool(event, 'isShootout');

const ownGoalPlayerId = (event: CupMatchEvent): string | undefined =>
  detailString(event, 'ownGoalPlayerId') ?? (isOwnGoalEvent(event) ? event.playerId : undefined);

const shouldCountAssist = (event: CupMatchEvent): boolean =>
  GOAL_TYPES.has(event.type) &&
  !isOwnGoalEvent(event) &&
  event.type !== MatchEventType.PENALTY_SCORED &&
  event.detail?.assistEligible !== false &&
  Boolean(event.secondaryPlayerId) &&
  event.secondaryPlayerId !== event.playerId;

export const CupPlayerStatsAggregator = {
  /**
   * Zamienia surowe zdarzenia V2 na statystyki indywidualne. Ten moduł nie
   * generuje nowych akcji, tylko księguje to, co wydarzyło się w symulacji:
   * strzały, gole, asysty, zmiany, urazy, kartki, pracę bramkarza i rating.
   */
  aggregate: ({
    match,
    events,
    finalSecond,
    homeScore,
    awayScore,
    initialLineups,
    finalFatigue,
    teamStats,
  }: AggregationInput): CupPlayerStatsMap => {
    const stats: CupPlayerStatsMap = {
      HOME: emptyTeamStats(),
      AWAY: emptyTeamStats(),
    };
    const lookup = playerById(match);
    const lineups = activeLineups(match, initialLineups);

    markMinutes(stats, lookup, match, events, finalSecond, lineups);

    events.forEach(event => {
      const side = event.side;

      if (isShootoutPenalty(event)) {
        if (event.playerId && (event.type === MatchEventType.PENALTY_SCORED || event.type === MatchEventType.PENALTY_MISSED)) {
          const taker = ensureStats(stats, lookup, event.playerId, side);
          if (taker) {
            taker.penaltiesTaken += 1;
            if (event.type === MatchEventType.PENALTY_SCORED) taker.penaltiesScored += 1;
            if (event.type === MatchEventType.PENALTY_MISSED) taker.penaltiesMissed += 1;
          }
        }

        if (event.type === MatchEventType.PENALTY_MISSED && detailBool(event, 'saved')) {
          const keeperId = detailString(event, 'goalkeeperId') ?? event.secondaryPlayerId;
          const keeper = keeperId ? ensureStats(stats, lookup, keeperId) : undefined;
          if (keeper) keeper.penaltiesSaved += 1;
        }

        return;
      }

      if (SHOT_TYPES.has(event.type) && event.playerId) {
        const ownGoal = isOwnGoalEvent(event);
        const shooter = ownGoal ? undefined : ensureStats(stats, lookup, event.playerId, side);
        if (shooter) {
          shooter.shots += 1;
          shooter.xG += event.xG ?? 0;
          if (ON_TARGET_TYPES.has(event.type)) shooter.shotsOnTarget += 1;
          else shooter.shotsOffTarget += 1;
          if (event.type === MatchEventType.SHOT_POST) shooter.posts += 1;
          if (event.type === MatchEventType.SHOT_BAR) shooter.bars += 1;
          if (event.type === MatchEventType.PENALTY_SCORED || event.type === MatchEventType.PENALTY_MISSED) {
            shooter.penaltiesTaken += 1;
          }
          if (event.type === MatchEventType.PENALTY_SCORED) shooter.penaltiesScored += 1;
          if (event.type === MatchEventType.PENALTY_MISSED) shooter.penaltiesMissed += 1;
        }

        if (event.secondaryPlayerId && !ownGoal && event.secondaryPlayerId !== event.playerId) {
          const creator = ensureStats(stats, lookup, event.secondaryPlayerId, side);
          if (creator) {
            creator.chancesCreated += 1;
            if ((event.xG ?? 0) >= 0.08 || ON_TARGET_TYPES.has(event.type)) creator.keyPasses += 1;
          }
        }
      }

      if (GOAL_TYPES.has(event.type)) {
        if (isOwnGoalEvent(event)) {
          const ownPlayerId = ownGoalPlayerId(event);
          const ownPlayer = ownPlayerId ? ensureStats(stats, lookup, ownPlayerId) : undefined;
          if (ownPlayer) ownPlayer.ownGoals += 1;
        } else if (event.playerId) {
          const scorer = ensureStats(stats, lookup, event.playerId, side);
          if (scorer) scorer.goals += 1;
        }

        if (shouldCountAssist(event) && event.secondaryPlayerId) {
          const assistant = ensureStats(stats, lookup, event.secondaryPlayerId, side);
          if (assistant) assistant.assists += 1;
        }

        if (side) {
          const concedingSide = opponentSide(side);
          const keeperId = activeGoalkeeperAtSecond(match, events, concedingSide, lineups, event.second);
          const keeper = keeperId ? ensureStats(stats, lookup, keeperId, concedingSide) : undefined;
          if (keeper) keeper.goalsConceded += 1;
        }
      }

      if (SAVE_TYPES.has(event.type) && side) {
        const keeperSide = opponentSide(side);
        const keeperId = activeGoalkeeperAtSecond(match, events, keeperSide, lineups, event.second);
        const keeper = keeperId ? ensureStats(stats, lookup, keeperId, keeperSide) : undefined;
        if (keeper) keeper.saves += 1;
      }

      if (event.type === MatchEventType.PENALTY_MISSED && side) {
        const keeperSide = opponentSide(side);
        const keeperId = activeGoalkeeperAtSecond(match, events, keeperSide, lineups, event.second);
        const keeper = keeperId ? ensureStats(stats, lookup, keeperId, keeperSide) : undefined;
        if (keeper && detailBool(event, 'saved')) keeper.penaltiesSaved += 1;
      }

      if (event.playerId) {
        const entry = ensureStats(stats, lookup, event.playerId, side);
        if (entry) {
          if (event.type === MatchEventType.FOUL || event.type === MatchEventType.YELLOW_CARD || event.type === MatchEventType.RED_CARD) {
            entry.foulsCommitted += 1;
          }
          if (event.type === MatchEventType.OFFSIDE) entry.offsides += 1;
          if (event.type === MatchEventType.YELLOW_CARD) entry.yellowCards += 1;
          if (event.type === MatchEventType.RED_CARD) {
            entry.redCards += 1;
            entry.endedSecond = Math.min(entry.endedSecond ?? event.second, event.second);
          }
          if (event.type === MatchEventType.INJURY_LIGHT) entry.injuriesLight += 1;
          if (event.type === MatchEventType.INJURY_SEVERE) entry.injuriesSevere += 1;
        }
      }

      if (
        event.secondaryPlayerId &&
        (event.type === MatchEventType.FOUL || event.type === MatchEventType.YELLOW_CARD || event.type === MatchEventType.RED_CARD)
      ) {
        const fouled = ensureStats(stats, lookup, event.secondaryPlayerId);
        if (fouled) fouled.foulsWon += 1;
      }
    });

    Object.values(stats).forEach(teamStats => {
      Object.values(teamStats).forEach(entry => {
        if (entry.startedSecond !== undefined) {
          const end = entry.endedSecond ?? finalSecond;
          entry.minutesPlayed = Math.max(0, Math.ceil((end - entry.startedSecond) / 60));
        }
        entry.xG = Number(entry.xG.toFixed(2));
        entry.shotsOffTarget = Math.max(0, entry.shots - entry.shotsOnTarget);
        entry.rating = CupPlayerRatingService.calculate({
          entry,
          sideScore: entry.side === 'HOME' ? homeScore : awayScore,
          opponentScore: entry.side === 'HOME' ? awayScore : homeScore,
          teamStats: teamStats?.[entry.side],
          opponentStats: teamStats?.[opponentSide(entry.side)],
          finalFatigue: finalFatigue?.[entry.playerId],
        });
      });
    });

    return stats;
  },
};
