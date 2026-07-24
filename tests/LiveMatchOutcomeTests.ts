import assert from 'node:assert/strict';
import { MatchEventType } from '../types';
import {
  isLiveShotOnTargetEvent,
  resolveLiveMissedShotOutcome,
  shouldAttemptLiveOpenPlayShot,
} from '../services/match/live/LiveMatchOutcome';

/**
 * Match engine migration test
 *
 * What this test protects:
 * LiveMatchOutcome owns the pure open-play gate and the non-goal shot classifier. MatchLiveView still
 * owns state updates, commentary, VAR, goals, penalties, injuries, and live stats, but these helpers
 * make the most important outcome thresholds explicit and independently testable.
 *
 * Why this matters:
 * A small mistake in this resolver changes the visual rhythm of the match: too many off-target shots,
 * too many saves, too many one-on-ones, or incorrect shots-on-target stats. The test keeps the legacy
 * thresholds stable while later stages can safely tune the football model with more context.
 */

assert.deepEqual(
  shouldAttemptLiveOpenPlayShot({ forceZeroShotChance: true, eventRoll: 0.99, shotThreshold: 0.01 }),
  { shouldAttempt: true, reason: 'FORCED_ZERO_SHOT_RESCUE' }
);
assert.deepEqual(
  shouldAttemptLiveOpenPlayShot({ forceZeroShotChance: false, eventRoll: 0.10, shotThreshold: 0.11 }),
  { shouldAttempt: true, reason: 'THRESHOLD_ROLL' }
);
assert.deepEqual(
  shouldAttemptLiveOpenPlayShot({ forceZeroShotChance: false, eventRoll: 0.12, shotThreshold: 0.11 }),
  { shouldAttempt: false, reason: 'NO_ATTEMPT' }
);

assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.01, shotAccuracyRoll: 0.99, dangerLabel: 'normal', shotOnTargetBoost: 0 }), MatchEventType.SHOT_POST);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.10, shotAccuracyRoll: 0.99, dangerLabel: 'normal', shotOnTargetBoost: 0 }), MatchEventType.SHOT_BAR);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.20, shotAccuracyRoll: 0.99, dangerLabel: 'normal', shotOnTargetBoost: 0 }), MatchEventType.ONE_ON_ONE_SAVE);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.30, shotAccuracyRoll: 0.99, dangerLabel: 'normal', shotOnTargetBoost: 0 }), MatchEventType.ONE_ON_ONE_MISS);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.40, shotAccuracyRoll: 0.99, dangerLabel: 'normal', shotOnTargetBoost: 0 }), MatchEventType.SAVE);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.50, shotAccuracyRoll: 0.99, dangerLabel: 'normal', shotOnTargetBoost: 0 }), MatchEventType.WINGER_STOPPED);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.90, shotAccuracyRoll: 0.99, dangerLabel: 'normal', shotOnTargetBoost: 0 }), MatchEventType.SHOT);

assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.90, shotAccuracyRoll: 0.99, dangerLabel: 'big', shotOnTargetBoost: 0 }), MatchEventType.ONE_ON_ONE_MISS);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.50, shotAccuracyRoll: 0.99, dangerLabel: 'clear', shotOnTargetBoost: 0 }), MatchEventType.SHOT_ON_TARGET);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.60, shotAccuracyRoll: 0.99, dangerLabel: 'chaotic', shotOnTargetBoost: 0 }), MatchEventType.SHOT);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.90, shotAccuracyRoll: 0.10, dangerLabel: 'normal', shotOnTargetBoost: 0.10 }), MatchEventType.SHOT_ON_TARGET);
assert.equal(resolveLiveMissedShotOutcome({ failRoll: 0.40, shotAccuracyRoll: 0.10, dangerLabel: 'normal', shotOnTargetBoost: -0.10 }), MatchEventType.SHOT);

assert.equal(isLiveShotOnTargetEvent(MatchEventType.SHOT), false);
assert.equal(isLiveShotOnTargetEvent(MatchEventType.SAVE), true);
assert.equal(isLiveShotOnTargetEvent(MatchEventType.SHOT_ON_TARGET), true);

console.log('LiveMatchOutcomeTests: OK');
