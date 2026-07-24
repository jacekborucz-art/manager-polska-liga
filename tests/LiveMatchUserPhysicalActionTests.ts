import assert from 'node:assert/strict';
import { InjurySeverity } from '../types';
import {
  calculateLiveCriticalExhaustionActionCap,
  calculateLiveInjuredPlayerActionPenalty,
  calculateLiveTiredPlayerActionPenalty,
  calculateLiveUnusedSubstitutionActionPenalty,
  calculateLiveUserPhysicalActionSuppression,
} from '../services/match/live/LiveMatchUserPhysicalAction';

/**
 * Match engine user-physical action tests
 *
 * What these tests protect:
 * The player-controlled team now has an explicit live action-creation penalty for three management
 * failures: starting or continuing with tired players below 85 condition, leaving injured players on
 * the pitch, and delaying substitutions after minute 60. These tests verify the numeric ranges and the
 * aggregation rules directly, without needing to watch a full UI match.
 *
 * Why this matters:
 * Similar fatigue and injury logic already existed in the live engine. The new calculator therefore
 * must not blindly add another full penalty on top of legacy average fatigue, individual fatigue,
 * late-rotation, and injury-drag systems. The creditedExistingPenalty assertions below make sure the
 * calculator returns only the incremental suppression still needed to reach the explicit user-team
 * design rule.
 *
 * How this should be read:
 * The helper receives deterministic RNG in tests. A constant 0.5 represents the middle of every design
 * range, while 0 and 1 verify the minimum and maximum requested penalties. MatchLiveView passes seeded
 * minute RNG, so real matches remain reproducible.
 */

const lineup = [
  'p1',
  'p2',
  'p3',
  'p4',
  'p5',
  'p6',
  'p7',
  'p8',
  'p9',
  'p10',
  'p11',
];

assert.equal(calculateLiveTiredPlayerActionPenalty(85, () => 0.5), 0);
assert.equal(calculateLiveTiredPlayerActionPenalty(84, () => 0), 0.01);
assert.equal(calculateLiveTiredPlayerActionPenalty(40, () => 1), 0.05);

assert.equal(calculateLiveInjuredPlayerActionPenalty(InjurySeverity.LIGHT, () => 0), 0.05);
assert.equal(calculateLiveInjuredPlayerActionPenalty(InjurySeverity.SEVERE, () => 1), 0.1);
assert.equal(calculateLiveUnusedSubstitutionActionPenalty(() => 0), 0.02);
assert.equal(calculateLiveUnusedSubstitutionActionPenalty(() => 1), 0.05);
assert.equal(calculateLiveCriticalExhaustionActionCap(4), null);
assert.equal(calculateLiveCriticalExhaustionActionCap(5), 0.036);
assert.equal(calculateLiveCriticalExhaustionActionCap(7), 0.026);
assert.equal(calculateLiveCriticalExhaustionActionCap(9), 0.018);
assert.equal(calculateLiveCriticalExhaustionActionCap(11), 0.012);

const freshBeforeSixty = calculateLiveUserPhysicalActionSuppression({
  minute: 59,
  lineup,
  fatigueMap: Object.fromEntries(lineup.map(id => [id, 100])),
  matchInjuries: {},
  substitutionsUsed: 0,
  rng: () => 0.5,
});
assert.equal(freshBeforeSixty.rawPenalty, 0);
assert.equal(freshBeforeSixty.incrementalPenalty, 0);
assert.equal(freshBeforeSixty.unusedSubstitutions, 0);

const fatigueOnly = calculateLiveUserPhysicalActionSuppression({
  minute: 45,
  lineup,
  fatigueMap: {
    p1: 84,
    p2: 70,
    p3: 40,
  },
  matchInjuries: {},
  substitutionsUsed: 0,
  rng: () => 0.5,
});
assert.equal(fatigueOnly.tiredPlayerCount, 3);
assert(fatigueOnly.fatiguePenalty >= 0.03);
assert(fatigueOnly.fatiguePenalty <= 0.15);
assert.equal(fatigueOnly.injuryPenalty, 0);
assert.equal(fatigueOnly.substitutionPenalty, 0);

const injuriesAndChanges = calculateLiveUserPhysicalActionSuppression({
  minute: 70,
  lineup,
  fatigueMap: Object.fromEntries(lineup.map(id => [id, 100])),
  matchInjuries: {
    p4: InjurySeverity.LIGHT,
    p9: InjurySeverity.SEVERE,
  },
  substitutionsUsed: 2,
  rng: () => 0.5,
});
assert.equal(injuriesAndChanges.injuredPlayerCount, 2);
assert.equal(injuriesAndChanges.unusedSubstitutions, 3);
assert.equal(injuriesAndChanges.injuryPenalty, 0.0625 + 0.0875);
assert.equal(injuriesAndChanges.substitutionPenalty, 3 * 0.035);

const credited = calculateLiveUserPhysicalActionSuppression({
  minute: 70,
  lineup,
  fatigueMap: Object.fromEntries(lineup.map(id => [id, 100])),
  matchInjuries: {},
  substitutionsUsed: 0,
  existingPhysicalActionPenalty: 0.10,
  rng: () => 0.5,
});
assert.equal(credited.unusedSubstitutions, 5);
assert.equal(credited.substitutionPenalty, 5 * 0.035);
assert.equal(credited.creditedExistingPenalty, 0.10);
assert.equal(credited.incrementalPenalty, credited.rawPenalty - 0.10);

const exhaustedWholeTeam = calculateLiveUserPhysicalActionSuppression({
  minute: 80,
  lineup,
  fatigueMap: Object.fromEntries(lineup.map(id => [id, 40])),
  matchInjuries: {},
  substitutionsUsed: 5,
  rng: () => 1,
});
assert.equal(exhaustedWholeTeam.tiredPlayerCount, 11);
assert.equal(exhaustedWholeTeam.redZonePlayerCount, 11);
assert.equal(exhaustedWholeTeam.criticalExhaustionActionCap, 0.012);
assert(Math.abs(exhaustedWholeTeam.fatiguePenalty - 11 * 0.05) < 0.0000001);
assert.equal(exhaustedWholeTeam.incrementalPenalty, 0.42);

const halfRedTeam = calculateLiveUserPhysicalActionSuppression({
  minute: 80,
  lineup,
  fatigueMap: {
    ...Object.fromEntries(lineup.map(id => [id, 90])),
    p1: 59,
    p2: 58,
    p3: 57,
    p4: 56,
    p5: 55,
  },
  matchInjuries: {},
  substitutionsUsed: 5,
  rng: () => 0.5,
});
assert.equal(halfRedTeam.redZonePlayerCount, 5);
assert.equal(halfRedTeam.criticalExhaustionActionCap, 0.036);

console.log('LiveMatchUserPhysicalActionTests: OK');
