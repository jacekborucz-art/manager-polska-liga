import assert from 'node:assert/strict';
import { HealthStatus, Player, PlayerPosition, Region } from '../types';
import { PlayerTransferRequestDialogService } from '../services/PlayerTransferRequestDialogService';

const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'PLAYER_TRANSFER_REQUEST_TEST',
  firstName: 'Jan',
  lastName: 'Testowy',
  age: 25,
  clubId: 'CLUB_TEST',
  nationality: Region.POLAND,
  position: PlayerPosition.MID,
  overallRating: 65,
  attributes: {
    strength: 50,
    stamina: 50,
    pace: 50,
    defending: 50,
    passing: 50,
    attacking: 50,
    finishing: 50,
    technique: 50,
    vision: 50,
    dribbling: 50,
    heading: 50,
    positioning: 50,
    goalkeeping: 1,
    freeKicks: 50,
    talent: 50,
    penalties: 50,
    corners: 50,
    aggression: 50,
    crossing: 50,
    leadership: 50,
    mentality: 50,
    workRate: 50,
  },
  stats: {
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 0,
    minutesPlayed: 0,
    seasonalChanges: {},
    ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: '2028-06-30T00:00:00.000Z',
  annualSalary: 500_000,
  marketValue: 1_500_000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: true,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  morale: 50,
  lojalnosc: 50,
  moralePersonality: 'CALM',
  playerMindset: {
    coachTrust: 50,
    clubHappiness: 50,
    squadBelonging: 50,
    roleClarity: 50,
    playingTimeSatisfaction: 50,
    developmentSatisfaction: 50,
    transferOpenness: 50,
    conflictLevel: 50,
  },
  ...overrides,
});

const currentDate = new Date('2026-08-17T12:00:00.000Z');
const seasonEnd = new Date('2027-06-30T12:00:00.000Z');

const immediate = PlayerTransferRequestDialogService.finish(
  null,
  makePlayer(),
  'LIST_IMMEDIATELY',
  currentDate,
  seasonEnd,
  1,
);

assert.equal(immediate.reaction, 'AGREED');
assert.equal(immediate.listImmediatelyFlag, true);
assert.equal(immediate.responseDelayDays, null);
assert.equal(immediate.pendingResponse, null);
assert.equal(immediate.allowAfterSeasonFlag, false);
assert.equal(immediate.promiseMade, null);

const eagerPlayer = makePlayer({
  lojalnosc: 10,
  moralePersonality: 'AMBITIOUS',
  playerMindset: {
    ...makePlayer().playerMindset!,
    transferOpenness: 90,
    conflictLevel: 80,
  },
});
const reluctantPlayer = makePlayer({
  lojalnosc: 90,
  moralePersonality: 'LOYAL',
  playerMindset: {
    ...makePlayer().playerMindset!,
    transferOpenness: 10,
    conflictLevel: 20,
  },
});

const eagerResult = PlayerTransferRequestDialogService.finish(
  null,
  eagerPlayer,
  'LIST_IMMEDIATELY',
  currentDate,
  seasonEnd,
  11,
);
const reluctantResult = PlayerTransferRequestDialogService.finish(
  null,
  reluctantPlayer,
  'LIST_IMMEDIATELY',
  currentDate,
  seasonEnd,
  11,
);

assert.ok(eagerResult.moraleDelta > 0, 'zawodnik nastawiony na transfer powinien móc zareagować ulgą');
assert.ok(reluctantResult.moraleDelta < 0, 'lojalny zawodnik może odczuć niepewność mimo spełnienia prośby');

const neutralMoraleResults = Array.from({ length: 80 }, (_, seed) =>
  PlayerTransferRequestDialogService.finish(
    null,
    makePlayer(),
    'LIST_IMMEDIATELY',
    currentDate,
    seasonEnd,
    seed + 1,
  ).moraleDelta
);

assert.ok(neutralMoraleResults.some(delta => delta > 0), 'RNG powinno dopuszczać wzrost morale');
assert.ok(neutralMoraleResults.some(delta => delta < 0), 'RNG powinno dopuszczać spadek morale');

console.log('PlayerTransferRequestDialogServiceTests: OK');
