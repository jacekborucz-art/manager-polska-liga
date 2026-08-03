import assert from 'node:assert/strict';
import { HealthStatus, InjurySeverity, MatchEventType, Player, PlayerPosition } from '../types';
import { PlayerClubAdaptationService } from '../services/PlayerClubAdaptationService';

const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'ADAPT_TEST_PLAYER',
  firstName: 'Jan',
  lastName: 'Testowy',
  age: 24,
  clubId: 'CLUB_A',
  nationality: 'POL' as Player['nationality'],
  position: PlayerPosition.MID,
  overallRating: 84,
  attributes: {} as Player['attributes'],
  stats: {} as Player['stats'],
  health: { status: HealthStatus.HEALTHY },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: '2030-06-30',
  annualSalary: 1,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  morale: 50,
  ...overrides,
});

const started = PlayerClubAdaptationService.beginForClub(makePlayer(), 'CLUB_A', '2026-07-01');
const repeated = PlayerClubAdaptationService.beginForClub(makePlayer(), 'CLUB_A', '2026-07-01');
assert.deepEqual(started.clubAdaptation, repeated.clubAdaptation, 'losowanie przyjścia musi być deterministyczne');
assert.ok((started.clubAdaptation?.durationDays ?? 0) >= 14 && (started.clubAdaptation?.durationDays ?? 0) <= 365);
assert.ok((started.clubAdaptation?.initialLevel ?? 0) >= 10 && (started.clubAdaptation?.initialLevel ?? 0) <= 55);
assert.equal(
  PlayerClubAdaptationService.beginForClub(makePlayer(), 'CLUB_A', new Date(2026, 6, 1)).clubAdaptation?.startedAt,
  '2026-07-01'
);

const thirtyPercent = makePlayer({
  clubAdaptation: {
    clubId: 'CLUB_A',
    startedAt: '2026-07-01',
    lastUpdatedAt: '2026-07-01',
    durationDays: 180,
    initialLevel: 30,
    level: 30,
  },
});
assert.equal(Math.round(PlayerClubAdaptationService.getEffectiveOverall(thirtyPercent, 84)), 72);

const healthyProgress = PlayerClubAdaptationService.advanceDaily(thirtyPercent, '2026-07-08');
const lowMoraleProgress = PlayerClubAdaptationService.advanceDaily(
  makePlayer({ ...thirtyPercent, morale: 10 }),
  '2026-07-08'
);
const injuredProgress = PlayerClubAdaptationService.advanceDaily(
  makePlayer({
    ...thirtyPercent,
    health: {
      status: HealthStatus.INJURED,
      injury: {
        type: 'Test',
        daysRemaining: 20,
        totalDays: 20,
        injuryDate: '2026-07-01',
        severity: InjurySeverity.SEVERE,
      },
    },
  }),
  '2026-07-08'
);
assert.ok((healthyProgress.clubAdaptation?.level ?? 0) > (lowMoraleProgress.clubAdaptation?.level ?? 0));
assert.ok((healthyProgress.clubAdaptation?.level ?? 0) > (injuredProgress.clubAdaptation?.level ?? 0));

const competitiveMatch = PlayerClubAdaptationService.applyMatchMinutes(thirtyPercent, 90, 'LEAGUE', '2026-07-01');
const friendlyMatch = PlayerClubAdaptationService.applyMatchMinutes(thirtyPercent, 90, 'FRIENDLY', '2026-07-01');
assert.ok((competitiveMatch.clubAdaptation?.level ?? 0) > (friendlyMatch.clubAdaptation?.level ?? 0));

const minutes = PlayerClubAdaptationService.buildMinutesByPlayerId(
  ['SUB_IN', 'STARTER_FULL'],
  [{ playerOutId: 'STARTER_OUT', playerInId: 'SUB_IN', minute: 60, isHome: true }],
  90
);
assert.equal(minutes.STARTER_OUT, 60);
assert.equal(minutes.SUB_IN, 30);
assert.equal(minutes.STARTER_FULL, 90);

const sentOffPlayer = makePlayer({ id: 'SENT_OFF', lastName: 'Kartkowy' });
const sentOffExits = PlayerClubAdaptationService.buildSentOffExitMinutes(
  [sentOffPlayer.id],
  [{
    id: 'RED_67',
    minute: 67,
    text: 'Czerwona kartka',
    type: MatchEventType.RED_CARD,
    teamSide: 'HOME',
    playerName: sentOffPlayer.lastName,
  }],
  [sentOffPlayer],
  'HOME'
);
const redCardMinutes = PlayerClubAdaptationService.buildMinutesByPlayerId([], [], 90, sentOffExits);
assert.equal(redCardMinutes.SENT_OFF, 67);

console.log('PlayerClubAdaptationTests: OK');
