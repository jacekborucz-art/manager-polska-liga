import assert from 'node:assert/strict';
import {
  createRuntimeSessionSeed,
  getLegacyMinuteSeededValue,
  getLegacyOffsetSeededValue,
  getLegacySpreadOffsetSeededValue,
} from '../services/match/live/LiveMatchRandom';

/**
 * Match engine migration test
 *
 * What this test protects:
 * The first refactor phase moves duplicated RNG helpers out of MatchLiveView and AI services.
 * These helpers influence event timing, tactical AI decisions, scouting uncertainty, penalties,
 * cards, injuries, and match-stat presentation. A tiny numeric drift here would silently change
 * match balance across the whole engine, so this test locks the extracted helpers to the exact
 * legacy formulas that existed before the migration.
 *
 * Why the test is intentionally simple:
 * The current goal is not to prove that the legacy sine-based RNG is ideal. It is not. The goal
 * is to make the extraction behavior-preserving, then create enough safety to replace the RNG
 * later with a stronger deterministic stream. That later replacement should happen behind new
 * golden-match simulations rather than as a hidden side effect of cleanup.
 *
 * How it verifies the migration:
 * Each exported helper is compared against the old inline formula over multiple seeds, minutes,
 * and offsets. The session seed helper is checked only for shape because it deliberately preserves
 * the existing Date.now() * Math.random() behavior and therefore cannot be asserted to a fixed value.
 */

const legacyOffsetFormula = (seed: number, offset: number = 0): number => {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
};

const legacyMinuteFormula = (seed: number, minute: number, offset: number = 0): number => {
  const x = Math.sin(seed + minute + offset) * 10000;
  return x - Math.floor(x);
};

const legacySpreadOffsetFormula = (seed: number, offset: number = 0): number => {
  const x = Math.sin(seed + offset * 9973) * 10000;
  return x - Math.floor(x);
};

for (const seed of [1, 77, 172339, 987654321]) {
  for (const offset of [0, 1, 13, 412, 9901]) {
    assert.equal(getLegacyOffsetSeededValue(seed, offset), legacyOffsetFormula(seed, offset));
    assert.equal(getLegacySpreadOffsetSeededValue(seed, offset), legacySpreadOffsetFormula(seed, offset));
  }

  for (const minute of [0, 1, 45, 60, 90, 120]) {
    for (const offset of [0, 77, 500, 1718, 6201]) {
      assert.equal(getLegacyMinuteSeededValue(seed, minute, offset), legacyMinuteFormula(seed, minute, offset));
    }
  }
}

const sessionSeed = createRuntimeSessionSeed();
assert.equal(Number.isInteger(sessionSeed), true);
assert.equal(sessionSeed >= 0, true);

console.log('LiveMatchRandomTests: OK');
