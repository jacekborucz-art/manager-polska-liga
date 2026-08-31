import type { Lineup, MatchContext, MatchSummary, TacticalInstructions } from '../../../../types';
import {
  CupMatchEngineV2,
  type CupLiveMatch,
  type CupMatchInput,
  type CupPlayerMatchStats,
  type CupMatchResult,
  type CupTeamSide,
} from '../../engines/cupV2';
import {
  CupMatchInputAdapter,
  type CupMatchInputAdapterDiagnostics,
  type CupMatchInputAdapterOptions,
} from './CupMatchInputAdapter';
import { CupMatchReportAdapter } from './CupMatchReportAdapter';

export type CupLegacyComparableStats = {
  homeScore: number;
  awayScore: number;
  decidedByPenalties?: boolean;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  home: {
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    offsides: number;
    yellowCards?: number;
    redCards?: number;
  };
  away: {
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    offsides: number;
    yellowCards?: number;
    redCards?: number;
  };
};

export type CupShadowSimulationSummary = {
  seed: string;
  score: string;
  winner?: CupTeamSide;
  decidedByPenalties: boolean;
  penaltyScore?: string;
  totalShots: number;
  totalShotsOnTarget: number;
  totalGoals: number;
  totalXg: number;
  totalCorners: number;
  totalOffsides: number;
  totalYellowCards: number;
  totalRedCards: number;
  eventCount: number;
  topPerformers: CupShadowPlayerSummary[];
  scorers: CupShadowPlayerSummary[];
  assistants: CupShadowPlayerSummary[];
  shotLeaders: CupShadowPlayerSummary[];
  keeperReports: CupShadowPlayerSummary[];
  ratings: Record<string, number>;
};

export type CupShadowPlayerSummary = {
  playerId: string;
  name: string;
  side: CupTeamSide;
  position: string;
  minutesPlayed: number;
  goals: number;
  ownGoals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  xG: number;
  chancesCreated: number;
  saves: number;
  goalsConceded: number;
  yellowCards: number;
  redCards: number;
  rating: number;
};

export type CupShadowSimulationDiff = {
  scoreDiff: string;
  totalShotsDiff: number;
  totalShotsOnTargetDiff: number;
  totalGoalsDiff: number;
  totalCornersDiff: number;
  totalOffsidesDiff: number;
  totalCardsDiff: number;
};

export type CupShadowSimulationReport = {
  input: CupMatchInput;
  result: CupMatchResult;
  matchSummary: MatchSummary;
  diagnostics: CupMatchInputAdapterDiagnostics;
  summary: CupShadowSimulationSummary;
  legacy?: CupLegacyComparableStats;
  diff?: CupShadowSimulationDiff;
  initialLineup: Record<CupTeamSide, Lineup>;
};

export type CupShadowSimulationOptions = Omit<CupMatchInputAdapterOptions, 'homeLineup' | 'awayLineup'> & {
  homeLineup: Lineup;
  awayLineup: Lineup;
  homeInstructions?: Partial<TacticalInstructions>;
  awayInstructions?: Partial<TacticalInstructions>;
  legacy?: CupLegacyComparableStats;
  /** Side controlled manually by the live UI; retained for adapter diagnostics. */
  manualSubstitutionSide?: CupTeamSide;
};

export type CupLiveMatchHandle = {
  ctx: MatchContext;
  options: CupShadowSimulationOptions;
  live: CupLiveMatch;
  diagnostics: CupMatchInputAdapterDiagnostics;
};

const summarizeResult = (input: CupMatchInput, result: CupMatchResult): CupShadowSimulationSummary => {
  const home = result.stats.HOME;
  const away = result.stats.AWAY;
  const playerSummaries = flattenPlayerStats(result);
  return {
    seed: input.seed,
    score: `${result.homeScore}:${result.awayScore}`,
    winner: result.winner,
    decidedByPenalties: result.decidedByPenalties,
    penaltyScore: result.penaltyScore ? `${result.penaltyScore.home}:${result.penaltyScore.away}` : undefined,
    totalShots: home.shots + away.shots,
    totalShotsOnTarget: home.shotsOnTarget + away.shotsOnTarget,
    totalGoals: result.homeScore + result.awayScore,
    totalXg: Math.round((home.xG + away.xG) * 100) / 100,
    totalCorners: home.corners + away.corners,
    totalOffsides: home.offsides + away.offsides,
    totalYellowCards: home.yellowCards + away.yellowCards,
    totalRedCards: home.redCards + away.redCards,
    eventCount: result.events.length,
    topPerformers: topBy(playerSummaries, player => player.rating, 5),
    scorers: topBy(playerSummaries.filter(player => player.goals > 0 || player.ownGoals > 0), player => player.goals * 10 + player.ownGoals * 4 + player.rating, 8),
    assistants: topBy(playerSummaries.filter(player => player.assists > 0 || player.chancesCreated > 0), player => player.assists * 10 + player.chancesCreated + player.rating * 0.1, 8),
    shotLeaders: topBy(playerSummaries.filter(player => player.shots > 0), player => player.shots * 10 + player.shotsOnTarget * 2 + player.xG, 8),
    keeperReports: topBy(playerSummaries.filter(player => player.saves > 0 || player.goalsConceded > 0), player => player.saves * 2 - player.goalsConceded + player.rating * 0.1, 4),
    ratings: Object.fromEntries(playerSummaries.map(player => [player.playerId, player.rating])),
  };
};

const toPlayerSummary = (player: CupPlayerMatchStats): CupShadowPlayerSummary => ({
  playerId: player.playerId,
  name: player.name,
  side: player.side,
  position: player.position,
  minutesPlayed: player.minutesPlayed,
  goals: player.goals,
  ownGoals: player.ownGoals,
  assists: player.assists,
  shots: player.shots,
  shotsOnTarget: player.shotsOnTarget,
  xG: player.xG,
  chancesCreated: player.chancesCreated,
  saves: player.saves,
  goalsConceded: player.goalsConceded,
  yellowCards: player.yellowCards,
  redCards: player.redCards,
  rating: player.rating,
});

const flattenPlayerStats = (result: CupMatchResult): CupShadowPlayerSummary[] => [
  ...Object.values(result.playerStats.HOME),
  ...Object.values(result.playerStats.AWAY),
]
  .map(toPlayerSummary)
  .filter(player => player.minutesPlayed > 0);

const topBy = (
  players: CupShadowPlayerSummary[],
  score: (player: CupShadowPlayerSummary) => number,
  limit: number,
): CupShadowPlayerSummary[] =>
  [...players]
    .sort((a, b) => score(b) - score(a) || b.rating - a.rating || b.minutesPlayed - a.minutesPlayed)
    .slice(0, limit);

const compareWithLegacy = (
  summary: CupShadowSimulationSummary,
  legacy: CupLegacyComparableStats,
): CupShadowSimulationDiff => {
  const legacyTotalShots = legacy.home.shots + legacy.away.shots;
  const legacyTotalShotsOnTarget = legacy.home.shotsOnTarget + legacy.away.shotsOnTarget;
  const legacyTotalGoals = legacy.homeScore + legacy.awayScore;
  const legacyTotalCorners = legacy.home.corners + legacy.away.corners;
  const legacyTotalOffsides = legacy.home.offsides + legacy.away.offsides;
  const legacyTotalCards =
    (legacy.home.yellowCards ?? 0) +
    (legacy.away.yellowCards ?? 0) +
    (legacy.home.redCards ?? 0) +
    (legacy.away.redCards ?? 0);

  return {
    scoreDiff: `${summary.score} vs ${legacy.homeScore}:${legacy.awayScore}`,
    totalShotsDiff: summary.totalShots - legacyTotalShots,
    totalShotsOnTargetDiff: summary.totalShotsOnTarget - legacyTotalShotsOnTarget,
    totalGoalsDiff: summary.totalGoals - legacyTotalGoals,
    totalCornersDiff: summary.totalCorners - legacyTotalCorners,
    totalOffsidesDiff: summary.totalOffsides - legacyTotalOffsides,
    totalCardsDiff: summary.totalYellowCards + summary.totalRedCards - legacyTotalCards,
  };
};

export const CupShadowSimulationService = {
  simulateFromMatchContext: (ctx: MatchContext, options: CupShadowSimulationOptions): CupShadowSimulationReport => {
    const adapted = CupMatchInputAdapter.fromMatchContext(ctx, options);
    const result = CupMatchEngineV2.simulate(adapted.input);
    const matchSummary = CupMatchReportAdapter.fromMatchContext(ctx, adapted.input, result, {
      userTeamId: options.userSide === 'AWAY' ? ctx.awayClub.id : ctx.homeClub.id,
    });
    const summary = summarizeResult(adapted.input, result);

    return {
      input: adapted.input,
      result,
      matchSummary,
      diagnostics: adapted.diagnostics,
      summary,
      legacy: options.legacy,
      diff: options.legacy ? compareWithLegacy(summary, options.legacy) : undefined,
      initialLineup: {
        HOME: {
          ...adapted.input.home.lineup,
          startingXI: [...adapted.input.home.lineup.startingXI],
          bench: [...adapted.input.home.lineup.bench],
          reserves: [...adapted.input.home.lineup.reserves],
        },
        AWAY: {
          ...adapted.input.away.lineup,
          startingXI: [...adapted.input.away.lineup.startingXI],
          bench: [...adapted.input.away.lineup.bench],
          reserves: [...adapted.input.away.lineup.reserves],
        },
      },
    };
  },

  /**
   * Builds a live handle without simulating a single tick. The adapter runs
   * once, so later tactical commands mutate only the future runtime input and
   * never reconstruct the match from the beginning.
   */
  createLiveMatch: (ctx: MatchContext, options: CupShadowSimulationOptions): CupLiveMatchHandle => {
    const adapted = CupMatchInputAdapter.fromMatchContext(ctx, options);
    return {
      ctx,
      options,
      diagnostics: adapted.diagnostics,
      live: CupMatchEngineV2.createLiveMatch(adapted.input),
    };
  },

  /** Advances the live engine and maps only the elapsed state to the current UI contract. */
  tickLiveMatch: (handle: CupLiveMatchHandle, targetSecond: number): CupShadowSimulationReport => {
    CupMatchEngineV2.advanceLiveMatch(handle.live, targetSecond);
    const result = CupMatchEngineV2.snapshotLiveMatch(handle.live);
    const matchSummary = CupMatchReportAdapter.fromMatchContext(handle.ctx, handle.live.input, result, {
      userTeamId: handle.options.userSide === 'AWAY' ? handle.ctx.awayClub.id : handle.ctx.homeClub.id,
    });
    const summary = summarizeResult(handle.live.input, result);

    return {
      input: handle.live.input,
      result,
      matchSummary,
      diagnostics: handle.diagnostics,
      summary,
      legacy: handle.options.legacy,
      diff: handle.options.legacy ? compareWithLegacy(summary, handle.options.legacy) : undefined,
      initialLineup: handle.live.initialLineup,
    };
  },
};
