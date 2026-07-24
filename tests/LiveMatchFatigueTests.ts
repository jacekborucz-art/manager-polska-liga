import assert from 'node:assert/strict';
import {
  calculateLiveFatiguePenalty,
  calculateLiveMatchFatigueImpact,
  calculateLiveRotationPenalty,
  getAverageLiveFatigue,
} from '../services/match/live/LiveMatchFatigue';

/**
 * Match engine migration test
 *
 * What this test protects:
 * LiveMatchFatigue owns the extracted fatigue and rotation-pressure calculations from the live
 * match loop. These values feed initiative, shot pressure, late-game balance, and injury risk, so
 * even a small drift would change match behavior.
 *
 * Why exact equality is required:
 * This phase is a behavior-preserving extraction. The old formulas from MatchLiveView are copied
 * below as legacy helpers and compared directly against the new module. Balance tuning can happen
 * later, but not as a hidden side effect of moving code out of the React view.
 *
 * How it verifies the migration:
 * The test covers empty lineups, missing fatigue values, the nonlinear fatigue penalty curve, the
 * late substitution/rotation penalty, and the combined totalPenalty returned by the public builder.
 */

const legacyAverageFatigue = (lineup: (string | null)[], fatigueMap: Record<string, number>): number => {
  const ids = lineup.filter((id): id is string => id !== null);
  if (ids.length === 0) return 100;
  return ids.reduce((acc, id) => acc + (fatigueMap[id] ?? 100), 0) / ids.length;
};

const legacyFatiguePenalty = (averageFatigue: number): number => {
  if (averageFatigue >= 94) return 0;
  const depth = (94 - averageFatigue) / 94;
  return -(Math.pow(depth, 1.25) * 0.42);
};

const legacyRotationPenalty = (
  minute: number,
  lineup: (string | null)[],
  fatigueMap: Record<string, number>,
  ownSubs: number,
  opponentSubs: number
): number => {
  if (minute < 60 || ownSubs >= 2) return 0;
  const ids = lineup.filter((id): id is string => id !== null);
  if (ids.length === 0) return 0;
  const tiredShare = ids.filter(id => (fatigueMap[id] ?? 100) < 84).length / ids.length;
  const lateFactor = Math.min(1, (minute - 60) / 30);
  const rotationGap = Math.max(0, opponentSubs - ownSubs);
  const pressure = ((2 - ownSubs) * 0.012) + tiredShare * 0.052 + rotationGap * 0.010;
  return -Math.min(0.085, pressure * lateFactor);
};

const lineup = ['p1', 'p2', 'p3', null, 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];
const fatigueMap = {
  p1: 100,
  p2: 92,
  p3: 88,
  p4: 82,
  p5: 79,
  p6: 76,
  p7: 74,
  p8: 70,
  p9: 65,
  p10: 60,
};

assert.equal(getAverageLiveFatigue([], {}), 100);
assert.equal(getAverageLiveFatigue(lineup, fatigueMap), legacyAverageFatigue(lineup, fatigueMap));

for (const averageFatigue of [100, 94, 90, 85, 80, 75, 70, 60]) {
  assert.equal(calculateLiveFatiguePenalty(averageFatigue), legacyFatiguePenalty(averageFatigue));
}

for (const scenario of [
  { minute: 45, ownSubs: 0, opponentSubs: 3 },
  { minute: 60, ownSubs: 0, opponentSubs: 0 },
  { minute: 75, ownSubs: 0, opponentSubs: 3 },
  { minute: 90, ownSubs: 1, opponentSubs: 4 },
  { minute: 90, ownSubs: 2, opponentSubs: 4 },
]) {
  assert.equal(
    calculateLiveRotationPenalty({ ...scenario, lineup, fatigueMap }),
    legacyRotationPenalty(scenario.minute, lineup, fatigueMap, scenario.ownSubs, scenario.opponentSubs)
  );
}

const impact = calculateLiveMatchFatigueImpact({
  minute: 84,
  lineup,
  fatigueMap,
  ownSubs: 0,
  opponentSubs: 3,
});

assert.equal(impact.averageFatigue, legacyAverageFatigue(lineup, fatigueMap));
assert.equal(impact.fatiguePenalty, legacyFatiguePenalty(impact.averageFatigue));
assert.equal(impact.rotationPenalty, legacyRotationPenalty(84, lineup, fatigueMap, 0, 3));
assert.equal(impact.totalPenalty, impact.fatiguePenalty + impact.rotationPenalty);

console.log('LiveMatchFatigueTests: OK');
