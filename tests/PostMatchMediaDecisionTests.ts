import assert from 'node:assert/strict';
import {
  HealthStatus,
  MailType,
  Player,
  PlayerPosition,
  StaffMember,
  StaffRole,
} from '../types';
import { PostMatchMediaDecisionService } from '../services/PostMatchMediaDecisionService';

const makePlayer = (id: string, mentality: number, leadership = 50): Player => ({
  id,
  firstName: 'Jan',
  lastName: id,
  age: 25,
  clubId: 'USER',
  nationality: 'POL' as Player['nationality'],
  position: PlayerPosition.MID,
  overallRating: 65,
  attributes: {
    pace: 60, strength: 60, stamina: 60, defending: 60, passing: 60,
    attacking: 60, finishing: 60, technique: 60, vision: 60, dribbling: 60,
    heading: 60, positioning: 60, goalkeeping: 10, freeKicks: 60, talent: 60,
    penalties: 60, corners: 60, aggression: 60, crossing: 60, leadership,
    mentality, workRate: 60,
  },
  stats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, matchesPlayed: 1, minutesPlayed: 90, seasonalChanges: {}, ratingHistory: [] },
  health: { status: HealthStatus.HEALTHY },
  condition: 90,
  fatigueDebt: 0,
  suspensionMatches: 0,
  contractEndDate: '2029-06-30',
  annualSalary: 100_000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  morale: 60,
});

const club = {
  id: 'USER',
  name: 'Klub Testowy',
  captainId: 'P1',
  boardConfidence: 60,
  stats: {
    played: 5, wins: 1, draws: 1, losses: 3, goalsFor: 5, goalsAgainst: 8,
    goalDifference: -3, points: 4, form: ['P', 'P', 'R', 'P', 'W'],
  },
} as any;

const opponent = { id: 'OPP', name: 'Rywal' } as any;
const squad = [
  makePlayer('P1', 76, 82),
  makePlayer('P2', 68),
  makePlayer('P3', 42),
  makePlayer('P4', 58),
];

const makeSummary = (matchId: string, userScore: number, opponentScore: number) => ({
  matchId,
  userTeamId: 'USER',
  homeClub: club,
  awayClub: opponent,
  homeScore: userScore,
  awayScore: opponentScore,
  homePlayers: squad.map(player => ({ playerId: player.id })),
  awayPlayers: [],
  homeGoals: [],
  awayGoals: [],
  timeline: [],
  homeStats: {},
  awayStats: {},
} as any);

const makeAssistant = (quality: number): StaffMember => ({
  id: `ASSISTANT_${quality}`,
  firstName: 'Adam',
  lastName: 'Asystent',
  age: 42,
  nationality: 'POL',
  nationalityFlag: '🇵🇱',
  role: StaffRole.ASSISTANT_COACH,
  attributes: {
    communication: quality,
    motivation: quality,
    dressingRoom: quality,
    experience: quality,
  },
  currentClubId: 'USER',
  hiredDate: '2026-07-01',
  contractEndDate: '2028-06-30',
  salary: 100_000,
  history: [],
});

const baseInput = {
  userClub: club,
  squad,
  startingXIIds: ['P1', 'P2', 'P3'],
  managerName: 'Jan Kowalski',
  currentDate: new Date('2026-08-26T12:00:00.000Z'),
  recentAbsenceCount: 0,
};

const ignoredLoss = PostMatchMediaDecisionService.resolveNonAttendance({
  ...baseInput,
  decision: 'IGNORE',
  summary: makeSummary('LOSS_1', 0, 3),
});
const repeatedIgnoredLoss = PostMatchMediaDecisionService.resolveNonAttendance({
  ...baseInput,
  decision: 'IGNORE',
  summary: makeSummary('LOSS_1', 0, 3),
});

assert.deepEqual(ignoredLoss, repeatedIgnoredLoss, 'The same match must never reroll after reload.');
assert.equal(ignoredLoss.resultType, 'LOSS');
assert.equal(ignoredLoss.article.type, MailType.PRESS);
assert.equal(ignoredLoss.deliveryDate, '2026-08-26');
assert.equal(ignoredLoss.article.date.toISOString().split('T')[0], '2026-08-27');
assert.match(ignoredLoss.article.id, /^POST_MATCH_MEDIA_IGNORE_/);
assert.ok(ignoredLoss.clubMoraleDelta <= 0 && ignoredLoss.clubMoraleDelta >= -4);
assert.ok(ignoredLoss.mediaRelationshipDelta <= -4);
assert.ok(Object.keys(ignoredLoss.playerMoraleDeltas).length === squad.length);

const eliteAssistant = makeAssistant(20);
const delegatedLoss = PostMatchMediaDecisionService.resolveNonAttendance({
  ...baseInput,
  decision: 'DELEGATE',
  summary: makeSummary('LOSS_2', 1, 2),
  assistant: eliteAssistant,
});
assert.equal(delegatedLoss.assistantQuality, 100);
assert.match(delegatedLoss.article.body, /Adam Asystent/);
assert.ok(delegatedLoss.mediaRelationshipDelta >= -5 && delegatedLoss.mediaRelationshipDelta <= 0);

(['WIN', 'DRAW', 'LOSS'] as const).forEach((result, index) => {
  const scores = result === 'WIN' ? [2, 0] : result === 'DRAW' ? [1, 1] : [0, 1];
  const resolution = PostMatchMediaDecisionService.resolveNonAttendance({
    ...baseInput,
    decision: 'DELEGATE',
    summary: makeSummary(`DELEGATE_${result}_${index}`, scores[0], scores[1]),
    assistant: eliteAssistant,
  });
  assert.equal(resolution.resultType, result);
  assert.match(resolution.article.body, /Jan Kowalski/);
  assert.match(resolution.article.body, /Adam Asystent/);
});

assert.throws(() => PostMatchMediaDecisionService.resolveNonAttendance({
  ...baseInput,
  decision: 'DELEGATE',
  summary: makeSummary('NO_ASSISTANT', 1, 1),
  assistant: null,
}), /without an assistant coach/);

const withUnusedPlayers = PostMatchMediaDecisionService.resolveNonAttendance({
  ...baseInput,
  decision: 'IGNORE',
  summary: makeSummary('SQUAD_SIZE', 0, 1),
  squad: [...squad, makePlayer('UNUSED_LOW', 1), makePlayer('UNUSED_HIGH', 100)],
});
const withoutUnusedPlayers = PostMatchMediaDecisionService.resolveNonAttendance({
  ...baseInput,
  decision: 'IGNORE',
  summary: makeSummary('SQUAD_SIZE', 0, 1),
});
assert.equal(withUnusedPlayers.clubMoraleDelta, withoutUnusedPlayers.clubMoraleDelta, 'Unused squad size must not bias mentality.');

const recentCount = PostMatchMediaDecisionService.countRecentAbsences([
  { ...ignoredLoss.article, id: 'POST_MATCH_MEDIA_IGNORE_RECENT', date: new Date('2026-08-20') },
  { ...ignoredLoss.article, id: 'POST_MATCH_MEDIA_DELEGATE_OLD', date: new Date('2026-06-01') },
], new Date('2026-08-26'));
assert.equal(recentCount, 1);

console.log('Post-match media decisions: deterministic articles, all results, assistant gating and morale bounds passed.');
