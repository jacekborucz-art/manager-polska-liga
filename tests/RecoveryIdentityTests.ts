import assert from 'node:assert/strict';
import { HealthStatus, InjurySeverity, Player, PlayerPosition, Region, TrainingIntensity } from '../types';
import { RecoveryService } from '../services/RecoveryService';

const makePlayer = (id: string, clubId: string, condition = 100): Player => ({
  id,
  firstName: id,
  lastName: 'Recovery',
  clubId,
  position: PlayerPosition.MID,
  nationality: Region.POLAND,
  nationalityCountry: 'Polska',
  age: 25,
  overallRating: 65,
  attributes: {
    pace: 65,
    acceleration: 65,
    strength: 65,
    stamina: 65,
    finishing: 65,
    passing: 65,
    vision: 65,
    technique: 65,
    dribbling: 65,
    crossing: 65,
    defending: 65,
    positioning: 65,
    attacking: 65,
    mentality: 65,
    workRate: 65,
    aggression: 65,
    leadership: 65,
    goalkeeping: 5,
    reflexes: 5,
    handling: 5,
    aerial: 65,
    talent: 70,
    freeKicks: 65,
    penalties: 65,
    corners: 65,
  },
  stats: {
    matchesPlayed: 0,
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    seasonalChanges: {},
    ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition,
  fatigueDebt: 0,
  suspensionMatches: 0,
  contractEndDate: '',
  annualSalary: 0,
  marketValue: 0,
  history: [],
} as Player);

const stableClubPlayer = makePlayer('CLUB_STABLE', 'CLUB');
const stableFreeAgent = makePlayer('FA_STABLE', 'FREE_AGENTS');
const stableWorld = {
  CLUB: [stableClubPlayer],
  FREE_AGENTS: [stableFreeAgent],
};

const firstStablePass = RecoveryService.applyDailyRecovery(
  stableWorld,
  new Date('2026-08-01T00:00:00.000Z'),
  TrainingIntensity.NORMAL
);
assert.equal(firstStablePass, stableWorld, 'a fully settled world must preserve the top-level record');
assert.equal(firstStablePass.CLUB, stableWorld.CLUB, 'a settled club squad must preserve its array');
assert.equal(firstStablePass.FREE_AGENTS, stableWorld.FREE_AGENTS, 'a settled free-agent pool must preserve its array');
assert.equal(firstStablePass.FREE_AGENTS[0], stableFreeAgent, 'a settled free agent must preserve its object');

// After the first pass proves that the pool is settled, the exact array is kept
// in a WeakMap. The second day must not even read its elements.
let freeAgentArrayReads = 0;
const trackedFreeAgentPool = new Proxy(
  Array.from({ length: 15_000 }, (_, index) => makePlayer(`FA_PERF_${index}`, 'FREE_AGENTS')),
  {
    get(target, property, receiver) {
      if (property === 'length' || (typeof property === 'string' && /^\d+$/.test(property))) {
        freeAgentArrayReads += 1;
      }
      return Reflect.get(target, property, receiver);
    },
  }
) as Player[];
const largeWorld = { FREE_AGENTS: trackedFreeAgentPool };
const primedLargeWorld = RecoveryService.applyDailyRecovery(
  largeWorld,
  new Date('2026-08-01T00:00:00.000Z'),
  TrainingIntensity.NORMAL
);
assert.equal(primedLargeWorld, largeWorld, 'priming a settled pool must not create a new world record');
freeAgentArrayReads = 0;
const cachedLargeWorld = RecoveryService.applyDailyRecovery(
  largeWorld,
  new Date('2026-08-02T00:00:00.000Z'),
  TrainingIntensity.NORMAL
);
assert.equal(cachedLargeWorld, largeWorld, 'cached recovery must preserve the world record');
assert.equal(freeAgentArrayReads, 0, 'cached recovery must not visit any of the 15,000 dormant free agents');

// Replacing the pool reference automatically invalidates the cache and causes
// the newly added, tired free agent to be processed immediately.
const tiredFreeAgent = makePlayer('FA_TIRED', 'FREE_AGENTS', 80);
const changedPoolWorld = {
  FREE_AGENTS: [...trackedFreeAgentPool, tiredFreeAgent],
};
const recoveredChangedPool = RecoveryService.applyDailyRecovery(
  changedPoolWorld,
  new Date('2026-08-03T00:00:00.000Z'),
  TrainingIntensity.NORMAL
);
assert.notEqual(recoveredChangedPool, changedPoolWorld, 'a changed pool must invalidate the settled cache');
assert.ok(recoveredChangedPool.FREE_AGENTS.at(-1)!.condition > 80, 'a newly added tired player must recover normally');
assert.equal(recoveredChangedPool.FREE_AGENTS[0], trackedFreeAgentPool[0], 'unchanged free agents must preserve object identity');

const futureLockoutPlayer = {
  ...makePlayer('FA_LOCKOUT', 'FREE_AGENTS'),
  negotiationLockoutUntil: '2026-08-10T00:00:00.000Z',
};
const futureLockoutWorld = { FREE_AGENTS: [futureLockoutPlayer] };
const beforeLockoutExpiry = RecoveryService.applyDailyRecovery(
  futureLockoutWorld,
  new Date('2026-08-05T00:00:00.000Z'),
  TrainingIntensity.NORMAL
);
assert.equal(beforeLockoutExpiry, futureLockoutWorld, 'an unchanged future lockout must not force a copy');
const afterLockoutExpiry = RecoveryService.applyDailyRecovery(
  futureLockoutWorld,
  new Date('2026-08-11T00:00:00.000Z'),
  TrainingIntensity.NORMAL
);
assert.equal(afterLockoutExpiry.FREE_AGENTS[0].negotiationLockoutUntil, null, 'an expired lockout must still be cleared');

const injuredPlayer: Player = {
  ...makePlayer('FA_INJURED', 'FREE_AGENTS', 45),
  health: {
    status: HealthStatus.INJURED,
    injury: {
      type: 'Test injury',
      daysRemaining: 10,
      severity: InjurySeverity.LIGHT,
      injuryDate: '2026-08-01T00:00:00.000Z',
      totalDays: 10,
      conditionAtInjury: 45,
    },
  },
};
const originalDaysRemaining = injuredPlayer.health.injury!.daysRemaining;
const injuredWorld = { FREE_AGENTS: [injuredPlayer] };
const recoveredInjury = RecoveryService.applyDailyRecovery(
  injuredWorld,
  new Date('2026-08-05T00:00:00.000Z'),
  TrainingIntensity.NORMAL
);
assert.equal(
  injuredPlayer.health.injury!.daysRemaining,
  originalDaysRemaining,
  'daily recovery must not mutate the source save injury object'
);
assert.notEqual(recoveredInjury.FREE_AGENTS[0], injuredPlayer, 'an injured player update must create a new player object');

console.log('RecoveryIdentityTests: OK');
