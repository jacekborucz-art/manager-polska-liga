import assert from 'node:assert/strict';
import { MatchEventType } from '../types';
import {
  calculateLiveFoulThreshold,
  calculateLivePenaltyIncidentChance,
  calculateLivePenaltyVarOverturnChance,
  chooseLivePenaltyReviewReason,
  resolveLiveHandballBaseCard,
  resolveLivePenaltyReviewCard,
  resolveLivePenaltyReviewVerdict,
  shouldTriggerLiveFoul,
} from '../services/match/live/LiveMatchDiscipline';

/**
 * Match engine migration test
 *
 * What this test protects:
 * LiveMatchDiscipline owns the pure foul and penalty-review arithmetic extracted from MatchLiveView.
 * It does not decide which player receives a card and does not mutate match state; it only preserves
 * the legacy probability gates that feed those stateful systems.
 *
 * Why this matters:
 * Discipline has high match impact. A small change can create too many penalties, too few fouls, or
 * unrealistic VAR reversals. These tests lock the extracted formulas before later profile-aware tuning
 * introduces player aggression, referee personality, pressure, weather, and fatigue in a controlled way.
 */

assert.equal(
  calculateLiveFoulThreshold({
    intensityFoulMultiplier: 1.25,
    pressureCardMultiplier: 1.1,
    rivalryMultiplier: 1.2,
  }),
  0.043 * 1.25 * 1.1 * 1.2
);

assert.equal(shouldTriggerLiveFoul({ forceZeroShotChance: true, eventRoll: 0.001, foulThreshold: 0.2 }), false);
assert.equal(shouldTriggerLiveFoul({ forceZeroShotChance: false, eventRoll: 0.04, foulThreshold: 0.05 }), true);
assert.equal(shouldTriggerLiveFoul({ forceZeroShotChance: false, eventRoll: 0.06, foulThreshold: 0.05 }), false);

assert.equal(
  calculateLivePenaltyIncidentChance({
    intensityPenaltyMultiplier: 1.3,
    pressurePenaltyMultiplier: 0.8,
  }),
  0.0956 * 1.3 * 0.8
);

assert.equal(chooseLivePenaltyReviewReason(0.41), 'HAND_BALL');
assert.equal(chooseLivePenaltyReviewReason(0.42), 'FOUL');
assert.equal(calculateLivePenaltyVarOverturnChance(50), 0.18);
assert.equal(calculateLivePenaltyVarOverturnChance(200), 0.08);
assert.equal(calculateLivePenaltyVarOverturnChance(-100), 0.28);

assert.equal(resolveLivePenaltyReviewVerdict({ usesVar: false, varRoll: 0, varOverturnChance: 1 }), 'PENALTY');
assert.equal(resolveLivePenaltyReviewVerdict({ usesVar: true, varRoll: 0.10, varOverturnChance: 0.18 }), 'NO_PENALTY');
assert.equal(resolveLivePenaltyReviewVerdict({ usesVar: true, varRoll: 0.20, varOverturnChance: 0.18 }), 'PENALTY');

assert.equal(resolveLivePenaltyReviewCard({ verdict: 'NO_PENALTY', baseCard: MatchEventType.YELLOW_CARD }), MatchEventType.FOUL);
assert.equal(resolveLivePenaltyReviewCard({ verdict: 'PENALTY', baseCard: MatchEventType.YELLOW_CARD }), MatchEventType.YELLOW_CARD);
assert.equal(resolveLiveHandballBaseCard(0.21), MatchEventType.YELLOW_CARD);
assert.equal(resolveLiveHandballBaseCard(0.22), MatchEventType.FOUL);

console.log('LiveMatchDisciplineTests: OK');
