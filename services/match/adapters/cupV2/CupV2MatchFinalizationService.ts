import {
  CompetitionType,
  HealthStatus,
  InjurySeverity,
  MatchEventType,
  MatchStatus,
  PlayerPosition,
  type Club,
  type Fixture,
  type Lineup,
  type MatchCardEntry,
  type MatchContext,
  type MatchGoalEntry,
  type MatchHistoryEntry,
  type MatchInjuryEntry,
  type MatchSubstitutionEntry,
  type Player,
  type PlayerStats,
} from '../../../../types';
import type { KitSelection } from '../../../KitSelectionService';
import { PlayerCareerService } from '../../../PlayerCareerService';
import { RefereeService } from '../../../RefereeService';
import type { CupShadowSimulationReport } from './CupShadowSimulationService';
import type { CupMatchEvent, CupPlayerMatchStats, CupTeamSide } from '../../engines/cupV2';

type CupV2SimulationOutput = {
  updatedFixtures: Fixture[];
  updatedClubs: Club[];
  updatedPlayers: Record<string, Player[]>;
  updatedLineups: Record<string, Lineup>;
  newOffers: [];
  ratings?: Record<string, number>;
  seasonNumber: number;
  roundResults: null;
};

export type CupV2MatchFinalizationInput = {
  report: CupShadowSimulationReport;
  ctx: MatchContext;
  fixtures: Fixture[];
  clubs: Club[];
  players: Record<string, Player[]>;
  lineups: Record<string, Lineup>;
  currentDate: Date;
  seasonNumber: number;
  kits: KitSelection;
};

export type CupV2MatchFinalizationResult = {
  summary: CupShadowSimulationReport['matchSummary'];
  simulationOutput: CupV2SimulationOutput;
  historyEntry: MatchHistoryEntry;
  winnerSide: CupTeamSide;
  winnerClubId: string;
  refereeRating: number;
};

const GOAL_TYPES = new Set<MatchEventType>([
  MatchEventType.GOAL,
  MatchEventType.ONE_ON_ONE_GOAL,
  MatchEventType.PENALTY_SCORED,
]);

const isShootoutPenalty = (event: CupMatchEvent): boolean => event.detail?.isShootout === true;

const detailString = (event: CupMatchEvent, key: string): string | undefined => {
  const value = event.detail?.[key];
  return typeof value === 'string' ? value : undefined;
};

const detailBool = (event: CupMatchEvent, key: string): boolean => event.detail?.[key] === true;

const getPlayerReportName = (player?: Pick<Player, 'firstName' | 'lastName'> | null): string =>
  player ? `${player.firstName.charAt(0)}. ${player.lastName}`.trim() : '';

const sideClubId = (ctx: MatchContext, side: CupTeamSide): string =>
  side === 'HOME' ? ctx.homeClub.id : ctx.awayClub.id;

const buildPlayerLookup = (ctx: MatchContext): Map<string, Player> =>
  new Map([...ctx.homePlayers, ...ctx.awayPlayers].map(player => [player.id, player]));

const cloneStats = (stats?: PlayerStats): PlayerStats => ({
  ...(stats ?? PlayerCareerService.emptyStats()),
  seasonalChanges: { ...(stats?.seasonalChanges ?? {}) },
  ratingHistory: [...(stats?.ratingHistory ?? [])],
});

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const winnerFromReport = (report: CupShadowSimulationReport): CupTeamSide => {
  if (report.result.winner) return report.result.winner;
  if (report.result.homeScore !== report.result.awayScore) {
    return report.result.homeScore > report.result.awayScore ? 'HOME' : 'AWAY';
  }
  if ((report.result.penaltyScore?.home ?? 0) !== (report.result.penaltyScore?.away ?? 0)) {
    return (report.result.penaltyScore?.home ?? 0) > (report.result.penaltyScore?.away ?? 0) ? 'HOME' : 'AWAY';
  }
  return 'HOME';
};

const buildUpdatedFixtures = (
  fixtures: Fixture[],
  ctx: MatchContext,
  report: CupShadowSimulationReport,
): Fixture[] =>
  fixtures.map(fixture => fixture.id === ctx.fixture.id
    ? {
        ...fixture,
        status: MatchStatus.FINISHED,
        homeScore: report.result.homeScore,
        awayScore: report.result.awayScore,
        homePenaltyScore: report.result.penaltyScore?.home,
        awayPenaltyScore: report.result.penaltyScore?.away,
        attendance: report.input.environment.attendance ?? fixture.attendance,
      }
    : fixture);

const buildUpdatedClubs = (
  clubs: Club[],
  ctx: MatchContext,
  winnerSide: CupTeamSide,
): Club[] => {
  const isCup = ctx.fixture.leagueId === CompetitionType.POLISH_CUP || String(ctx.fixture.leagueId).includes('POLISH_CUP');
  const winnerId = sideClubId(ctx, winnerSide);

  return clubs.map(club => {
    if (club.id !== ctx.homeClub.id && club.id !== ctx.awayClub.id) return club;
    const ctxClub = club.id === ctx.homeClub.id ? ctx.homeClub : ctx.awayClub;
    const withLiveRoles = {
      ...club,
      captainId: ctxClub.captainId,
      penaltyTakerId: ctxClub.penaltyTakerId,
      freeKickTakerId: ctxClub.freeKickTakerId,
    };
    if (!isCup) return withLiveRoles;
    return { ...withLiveRoles, isInPolishCup: club.id === winnerId };
  });
};

const injuryEventByPlayer = (report: CupShadowSimulationReport): Map<string, CupMatchEvent> => {
  const map = new Map<string, CupMatchEvent>();
  report.result.events
    .filter(event => event.playerId && (event.type === MatchEventType.INJURY_LIGHT || event.type === MatchEventType.INJURY_SEVERE))
    .sort((a, b) => a.second - b.second)
    .forEach(event => {
      if (event.playerId && !map.has(event.playerId)) map.set(event.playerId, event);
    });
  return map;
};

const injuryDaysFor = (player: Player, severity: InjurySeverity): number => {
  const resiliencePenalty = Math.round(Math.max(0, 60 - player.attributes.strength) * (severity === InjurySeverity.SEVERE ? 0.22 : 0.08));
  return severity === InjurySeverity.SEVERE ? 24 + resiliencePenalty : 5 + resiliencePenalty;
};

const updatePlayerCupState = (
  player: Player,
  matchStats: CupPlayerMatchStats | undefined,
  report: CupShadowSimulationReport,
  goalsAgainst: number,
  injuryEvent: CupMatchEvent | undefined,
  currentDate: Date,
): Player => {
  if (!matchStats || matchStats.minutesPlayed <= 0) {
    return {
      ...player,
      cupSuspensionMatches: Math.max(0, (player.cupSuspensionMatches ?? 0) - 1),
    };
  }

  const cupStats = cloneStats(player.cupStats);
  let cupSuspensionMatches = Math.max(0, (player.cupSuspensionMatches ?? 0) - 1);

  cupStats.matchesPlayed += 1;
  cupStats.minutesPlayed += Math.round(matchStats.minutesPlayed);
  cupStats.goals += matchStats.goals;
  cupStats.assists += matchStats.assists;
  if (goalsAgainst === 0 && player.position === PlayerPosition.GK) cupStats.cleanSheets += 1;

  for (let index = 0; index < matchStats.yellowCards; index += 1) {
    cupStats.yellowCards += 1;
    if (cupStats.yellowCards % 4 === 0) cupSuspensionMatches += 1;
  }
  for (let index = 0; index < matchStats.redCards; index += 1) {
    cupStats.redCards += 1;
    cupSuspensionMatches += 3;
  }

  if (typeof matchStats.rating === 'number' && matchStats.rating > 0) {
    cupStats.ratingHistory.push(matchStats.rating);
  }

  const finalFatigue = report.result.finalState.fatigue[player.id];
  const baseCondition = typeof finalFatigue === 'number' ? finalFatigue : player.condition;
  const playedAfterInjury = Boolean(injuryEvent && (matchStats.endedSecond === undefined || matchStats.endedSecond > injuryEvent.second + 60));
  const injuryConditionPenalty = playedAfterInjury
    ? injuryEvent?.type === MatchEventType.INJURY_SEVERE ? 18 : 8
    : 0;

  const stamina = player.attributes.stamina || 50;
  const minutesFactor = clamp(matchStats.minutesPlayed / 90, 0.08, 1.45);
  const goalkeeperDebtFactor = player.position === PlayerPosition.GK
    ? clamp(0.75 + Math.max(0, player.age - 27) * 0.004 - (stamina / 100) * 0.05, 0.70, 0.90)
    : 1;
  const injuryDebt = playedAfterInjury ? injuryEvent?.type === MatchEventType.INJURY_SEVERE ? 18 : 8 : 0;
  const matchDebt = (10 + (100 - stamina) * 0.2) * goalkeeperDebtFactor * minutesFactor + injuryDebt;

  let health = player.health;
  if (injuryEvent) {
    const severity = injuryEvent.type === MatchEventType.INJURY_SEVERE ? InjurySeverity.SEVERE : InjurySeverity.LIGHT;
    const days = injuryDaysFor(player, severity);
    health = {
      status: HealthStatus.INJURED,
      injury: {
        type: severity === InjurySeverity.SEVERE ? 'Uraz meczowy' : 'Stłuczenie meczowe',
        daysRemaining: days,
        severity,
        injuryDate: currentDate.toISOString(),
        totalDays: days,
        conditionAtInjury: player.condition,
      },
    };
  }

  return {
    ...player,
    cupStats,
    cupSuspensionMatches,
    condition: Math.round(clamp(baseCondition + 5 - injuryConditionPenalty, 1, 100)),
    fatigueDebt: Math.round(clamp((player.fatigueDebt ?? 0) + matchDebt, 0, 100)),
    health,
  };
};

const buildUpdatedPlayers = (
  sourcePlayers: Record<string, Player[]>,
  ctx: MatchContext,
  report: CupShadowSimulationReport,
  currentDate: Date,
): Record<string, Player[]> => {
  const injuries = injuryEventByPlayer(report);
  const updatedPlayers = { ...sourcePlayers };

  (['HOME', 'AWAY'] as CupTeamSide[]).forEach(side => {
    const clubId = sideClubId(ctx, side);
    const goalsAgainst = side === 'HOME' ? report.result.awayScore : report.result.homeScore;
    const statsById = report.result.playerStats[side];

    updatedPlayers[clubId] = (sourcePlayers[clubId] ?? []).map(player =>
      updatePlayerCupState(player, statsById[player.id], report, goalsAgainst, injuries.get(player.id), currentDate)
    );
  });

  return updatedPlayers;
};

const buildGoals = (
  ctx: MatchContext,
  report: CupShadowSimulationReport,
  players: Map<string, Player>,
): MatchGoalEntry[] =>
  report.result.events
    .filter(event => event.side && GOAL_TYPES.has(event.type) && !isShootoutPenalty(event))
    .sort((a, b) => a.second - b.second)
    .map(event => {
      const ownGoalPlayerId = detailString(event, 'ownGoalPlayerId') ?? (detailBool(event, 'isOwnGoal') ? event.playerId : undefined);
      const scorer = event.playerId ? players.get(event.playerId) : undefined;
      const assistant = event.secondaryPlayerId ? players.get(event.secondaryPlayerId) : undefined;
      const ownGoalPlayer = ownGoalPlayerId ? players.get(ownGoalPlayerId) : undefined;

      return {
        playerId: detailBool(event, 'isOwnGoal') ? undefined : event.playerId,
        playerName: getPlayerReportName(scorer) || event.text,
        minute: event.minute,
        teamId: sideClubId(ctx, event.side!),
        isPenalty: event.type === MatchEventType.PENALTY_SCORED,
        assistantId: detailBool(event, 'assistEligible') === false || detailBool(event, 'isOwnGoal') ? undefined : event.secondaryPlayerId,
        assistantName: detailBool(event, 'assistEligible') === false || detailBool(event, 'isOwnGoal') ? undefined : getPlayerReportName(assistant) || undefined,
        isOwnGoal: detailBool(event, 'isOwnGoal'),
        ownGoalPlayerId,
        ownGoalPlayerName: getPlayerReportName(ownGoalPlayer) || undefined,
      };
    });

const buildCards = (
  ctx: MatchContext,
  report: CupShadowSimulationReport,
  players: Map<string, Player>,
): MatchCardEntry[] => {
  const yellowCounts: Record<string, number> = {};

  return report.result.events
    .filter(event => event.side && event.playerId && (event.type === MatchEventType.YELLOW_CARD || event.type === MatchEventType.RED_CARD))
    .sort((a, b) => a.second - b.second)
    .map(event => {
      let type: MatchCardEntry['type'] = event.type === MatchEventType.RED_CARD ? 'RED' : 'YELLOW';
      if (event.type === MatchEventType.YELLOW_CARD && event.playerId) {
        yellowCounts[event.playerId] = (yellowCounts[event.playerId] ?? 0) + 1;
        if (yellowCounts[event.playerId] >= 2) type = 'SECOND_YELLOW';
      }

      return {
        playerId: event.playerId,
        playerName: getPlayerReportName(players.get(event.playerId!)) || event.text,
        minute: event.minute,
        teamId: sideClubId(ctx, event.side!),
        type,
      };
    });
};

const buildSubstitutions = (
  ctx: MatchContext,
  report: CupShadowSimulationReport,
  players: Map<string, Player>,
): MatchSubstitutionEntry[] =>
  report.result.events
    .filter(event => event.side && event.type === MatchEventType.SUBSTITUTION)
    .sort((a, b) => a.second - b.second)
    .map(event => ({
      playerOutId: event.secondaryPlayerId,
      playerOutName: getPlayerReportName(event.secondaryPlayerId ? players.get(event.secondaryPlayerId) : undefined),
      playerInId: event.playerId,
      playerInName: getPlayerReportName(event.playerId ? players.get(event.playerId) : undefined),
      minute: event.minute,
      teamId: sideClubId(ctx, event.side!),
    }));

const buildInjuries = (
  ctx: MatchContext,
  report: CupShadowSimulationReport,
  players: Map<string, Player>,
): MatchInjuryEntry[] =>
  report.result.events
    .filter(event => event.side && event.playerId && (event.type === MatchEventType.INJURY_LIGHT || event.type === MatchEventType.INJURY_SEVERE))
    .sort((a, b) => a.second - b.second)
    .map(event => {
      const player = players.get(event.playerId!);
      const severity = event.type === MatchEventType.INJURY_SEVERE ? InjurySeverity.SEVERE : InjurySeverity.LIGHT;
      return {
        playerId: event.playerId,
        playerName: getPlayerReportName(player) || event.text,
        minute: event.minute,
        teamId: sideClubId(ctx, event.side!),
        severity,
        days: player ? injuryDaysFor(player, severity) : severity === InjurySeverity.SEVERE ? 24 : 5,
        type: severity === InjurySeverity.SEVERE ? 'Uraz meczowy' : 'Stłuczenie meczowe',
      };
    });

const buildRatings = (report: CupShadowSimulationReport): Record<string, number> =>
  Object.fromEntries(
    (['HOME', 'AWAY'] as CupTeamSide[])
      .flatMap(side => Object.values(report.result.playerStats[side]))
      .filter(player => player.minutesPlayed > 0 && player.rating > 0)
      .map(player => [player.playerId, player.rating])
  );

const startingLineupIds = (lineup: Lineup): string[] =>
  lineup.startingXI.filter((id): id is string => Boolean(id));

const buildHistoryEntry = (
  input: CupV2MatchFinalizationInput,
  refereeRating: number,
  ratings: Record<string, number>,
): MatchHistoryEntry => {
  const { report, ctx, currentDate, seasonNumber, kits } = input;
  const players = buildPlayerLookup(ctx);

  return {
    matchId: ctx.fixture.id,
    date: currentDate.toDateString(),
    season: seasonNumber,
    competition: String(ctx.fixture.leagueId),
    homeTeamId: ctx.homeClub.id,
    awayTeamId: ctx.awayClub.id,
    homeScore: report.result.homeScore,
    awayScore: report.result.awayScore,
    homePenaltyScore: report.result.penaltyScore?.home,
    awayPenaltyScore: report.result.penaltyScore?.away,
    isExtraTime: report.result.finalState.second > 90 * 60,
    attendance: report.input.environment.attendance,
    venue: report.diagnostics.venueName,
    weather: report.input.environment.weather,
    addedTime: Math.round((report.result.finalState.addedTimeSeconds ?? 0) / 60),
    goals: buildGoals(ctx, report, players),
    cards: buildCards(ctx, report, players),
    substitutions: buildSubstitutions(ctx, report, players),
    injuries: buildInjuries(ctx, report, players),
    timeline: report.matchSummary.timeline,
    refereeId: report.input.environment.referee.id,
    refereeName: `${report.input.environment.referee.firstName} ${report.input.environment.referee.lastName}`,
    refereeRating,
    homeLineup: startingLineupIds(report.input.home.lineup),
    awayLineup: startingLineupIds(report.input.away.lineup),
    ratings,
    homeStartingTacticId: report.input.home.lineup.tacticId,
    awayStartingTacticId: report.input.away.lineup.tacticId,
    homeTacticId: report.input.home.lineup.tacticId,
    awayTacticId: report.input.away.lineup.tacticId,
    kits,
  };
};

export const CupV2MatchFinalizationService = {
  build(input: CupV2MatchFinalizationInput): CupV2MatchFinalizationResult {
    const { report, ctx, fixtures, clubs, players, lineups, currentDate, seasonNumber } = input;
    const winnerSide = winnerFromReport(report);
    const ratings = buildRatings(report);
    const refereeRating = RefereeService.generateLiveMatchRating({
      referee: report.input.environment.referee,
      homeScore: report.result.homeScore,
      awayScore: report.result.awayScore,
      homeStats: report.matchSummary.homeStats,
      awayStats: report.matchSummary.awayStats,
      timeline: report.matchSummary.timeline,
      seed: Number.parseInt(report.input.seed.replace(/\D/g, '').slice(0, 8), 10) || currentDate.getTime(),
    });

    const summary = {
      ...report.matchSummary,
      kits: input.kits,
      refereeRating,
    };

    const simulationOutput: CupV2SimulationOutput = {
      updatedFixtures: buildUpdatedFixtures(fixtures, ctx, report),
      updatedClubs: buildUpdatedClubs(clubs, ctx, winnerSide),
      updatedPlayers: buildUpdatedPlayers(players, ctx, report, currentDate),
      updatedLineups: {
        ...lineups,
        [ctx.homeClub.id]: report.input.home.lineup,
        [ctx.awayClub.id]: report.input.away.lineup,
      },
      newOffers: [],
      ratings,
      seasonNumber,
      roundResults: null,
    };

    return {
      summary,
      simulationOutput,
      historyEntry: buildHistoryEntry({ ...input, report: { ...report, matchSummary: summary } }, refereeRating, ratings),
      winnerSide,
      winnerClubId: sideClubId(ctx, winnerSide),
      refereeRating,
    };
  },
};
