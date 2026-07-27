import assert from 'node:assert/strict';
import {
  HealthStatus,
  MatchEventType,
  PlayerPosition,
  type Club,
  type MatchSummary,
  type MatchSummaryTeamStats,
  type PlayerPerformance,
} from '../types';
import {
  CUP_V2_FINAL_REPORT_MODE_KEY,
  CupV2FinalReportSelectionService,
} from '../services/match/adapters/cupV2';

const makeClub = (id: string, name: string): Club => ({
  id,
  name,
  shortName: name,
  leagueId: 'POLISH_CUP_TEST',
  tier: 1,
  colorsHex: ['#111827', '#f8fafc'],
  stadiumName: `${name} Arena`,
  stadiumCapacity: 12000,
  reputation: 55,
  country: 'POL',
  isDefaultActive: false,
  rosterIds: [],
  stats: {} as Club['stats'],
  budget: 0,
  transferBudget: 0,
  boardStrictness: 5,
  signingBonusPool: 0,
  morale: 60,
}) as Club;

const homeClub = makeClub('HOME_TEST', 'Home Test');
const awayClub = makeClub('AWAY_TEST', 'Away Test');

const makeStats = (overrides: Partial<MatchSummaryTeamStats> = {}): MatchSummaryTeamStats => ({
  shots: 11,
  shotsOnTarget: 4,
  corners: 5,
  fouls: 10,
  offsides: 2,
  yellowCards: 2,
  redCards: 0,
  possession: 50,
  ...overrides,
});

const makePlayer = (prefix: string, index: number): PlayerPerformance => ({
  playerId: `${prefix}_${index}`,
  name: `${prefix} Player ${index}`,
  position: index === 0 ? PlayerPosition.GK : index < 5 ? PlayerPosition.DEF : index < 9 ? PlayerPosition.MID : PlayerPosition.FWD,
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  missedPenalties: 0,
  savedPenalties: 0,
  healthStatus: HealthStatus.HEALTHY,
  fatigue: 74,
  rating: 6.7,
});

const makePlayers = (prefix: string): PlayerPerformance[] =>
  Array.from({ length: 11 }, (_, index) => makePlayer(prefix, index));

const makeSummary = (overrides: Partial<MatchSummary> = {}): MatchSummary => ({
  matchId: 'PP_FINAL_REPORT_TEST',
  userTeamId: homeClub.id,
  homeClub,
  awayClub,
  homeScore: 1,
  awayScore: 1,
  homePenaltyScore: 4,
  awayPenaltyScore: 3,
  homeGoals: [],
  awayGoals: [],
  homeStats: makeStats({ possession: 51 }),
  awayStats: makeStats({ possession: 49 }),
  homePlayers: makePlayers('H'),
  awayPlayers: makePlayers('A'),
  timeline: [
    {
      minute: 12,
      type: MatchEventType.GOAL,
      playerName: 'H Player 9',
      teamSide: 'HOME',
      scoreAtMoment: '1:0',
    },
  ],
  ...overrides,
});

const legacy = makeSummary();

const safeSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary(),
  mode: 'safe',
});

assert.equal(safeSelection.source, 'cupV2');
assert.equal(safeSelection.summary.homeStats.shots, 11);
assert.deepEqual(safeSelection.warnings, []);

const statMismatchSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary({
    homeStats: makeStats({ shots: 14, shotsOnTarget: 5, possession: 53 }),
    awayStats: makeStats({ shots: 8, shotsOnTarget: 3, possession: 47 }),
  }),
  mode: 'safe',
});

assert.equal(statMismatchSelection.source, 'legacy');
assert.ok(statMismatchSelection.warnings.includes('home stats differ from live legacy match'));
assert.ok(statMismatchSelection.warnings.includes('away stats differ from live legacy match'));

const mismatchSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary({ homeScore: 2, awayScore: 1 }),
  mode: 'safe',
});

assert.equal(mismatchSelection.source, 'legacy');
assert.equal(mismatchSelection.summary, legacy);
assert.ok(mismatchSelection.warnings.includes('score differs from live legacy match'));

const forcedSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary({ homeScore: 2, awayScore: 1 }),
  mode: 'force',
});

assert.equal(forcedSelection.source, 'cupV2');
assert.equal(forcedSelection.summary.homeScore, 2);
assert.ok(forcedSelection.warnings.includes('score differs from live legacy match'));

const invalidSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary({
    homeStats: makeStats({ shots: 3, shotsOnTarget: 6 }),
  }),
  mode: 'force',
});

assert.equal(invalidSelection.source, 'legacy');
assert.ok(invalidSelection.warnings.includes('home.shotsOnTarget exceeds shots'));

const disabledSelection = CupV2FinalReportSelectionService.selectFinalReport({
  legacySummary: legacy,
  v2Summary: makeSummary(),
  mode: 'off',
});

assert.equal(disabledSelection.source, 'legacy');
assert.equal(disabledSelection.warnings.length, 0);

assert.equal(
  CupV2FinalReportSelectionService.resolveMode({
    getItem: key => key === CUP_V2_FINAL_REPORT_MODE_KEY ? 'force' : null,
  }),
  'force',
);
assert.equal(
  CupV2FinalReportSelectionService.resolveMode({
    getItem: key => key === CUP_V2_FINAL_REPORT_MODE_KEY ? '0' : null,
  }),
  'off',
);
assert.equal(CupV2FinalReportSelectionService.resolveMode(null), 'safe');

console.log('Cup V2 final report selection tests passed.');
