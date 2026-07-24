import assert from 'node:assert/strict';
import { calculateLiveMatchInitiative, LiveMatchInitiativeInputs } from '../services/match/live/LiveMatchInitiative';

/**
 * Match engine migration test
 *
 * What this test protects:
 * LiveMatchInitiative is the first extracted decision point from the live minute loop. It decides
 * the HOME attack chance for a minute, which is upstream of attack ownership, zero-shot rescue,
 * counter-attacks, shot pressure, goals, cards, injuries, penalties, and AI reactions.
 *
 * Why exact equality is required:
 * This migration phase is ownership-only. The calculator must reproduce the old MatchLiveView inline
 * math exactly before any profile-based balancing is introduced. If this test fails, a refactor has
 * changed match behavior and the balance impact must be reviewed deliberately instead of being hidden
 * inside cleanup.
 *
 * How the legacy comparison works:
 * The helper below is a direct copy of the old inline formula: same clamps, same fatigue multiplier,
 * same pressure scaling, same quality curve, same shot dominance rubber-band, same goalkeeper crisis
 * direction, and same red-card direction. The test also verifies that team profile readiness is carried
 * as diagnostics without changing the probability.
 */

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const legacyQualityGapCurve = (gap: number): number => {
  const absGap = Math.abs(gap);
  if (absGap <= 2) return 0;
  const normalized = Math.min(1, (absGap - 2) / 18);
  return Math.sign(gap) * Math.pow(normalized, 1.35);
};

const legacyInlineHomeAttackChance = (inputs: LiveMatchInitiativeInputs): number => {
  const midfieldInitiativeMod =
    Math.abs(inputs.midfieldControlDiff) <= 2
      ? 0
      : Math.max(-0.026, Math.min(0.026, inputs.midfieldControlDiff * 0.0014));
  const qualityInitiativeMod = legacyQualityGapCurve(inputs.homeQualityGapLive) * 0.055;
  const shotDominanceInitiativeMod =
    inputs.minute < 25 || Math.abs(inputs.shotGapLive) < 8
      ? 0
      : -Math.sign(inputs.shotGapLive) *
        Math.min(0.055, (Math.abs(inputs.shotGapLive) - 7) * 0.006) *
        (Math.sign(inputs.shotGapLive) === Math.sign(inputs.homeQualityGapLive) && Math.abs(inputs.homeQualityGapLive) > 8 ? 0.45 : 1);
  const fatInitiativeMod = (inputs.homeFatPenalty - inputs.awayFatPenalty) * 3.0;
  const pressureInitiativeMod = ((inputs.homePressureInitiativeMultiplier - 1) - (inputs.awayPressureInitiativeMultiplier - 1)) * 0.42;
  const formInitiativeMod = (inputs.homeFormInitiativeModifier * inputs.homeFormStacking) - (inputs.awayFormInitiativeModifier * inputs.awayFormStacking);
  const playerFormInitiativeMod = clamp(
    (inputs.homePlayerFormGoalChanceMultiplier - inputs.awayPlayerFormGoalChanceMultiplier) * 0.055,
    -0.060,
    0.060
  );
  const goalkeeperCrisisInitiativeMod = inputs.awayGoalkeeperCrisisPenalty - inputs.homeGoalkeeperCrisisPenalty;
  const redCardInitiativeMod = (inputs.awaySentOffCount - inputs.homeSentOffCount) * 0.065;

  return Math.min(
    0.72,
    Math.max(
      0.28,
      0.5 +
        inputs.momentum / 340 +
        fatInitiativeMod +
        pressureInitiativeMod +
        formInitiativeMod +
        playerFormInitiativeMod +
        midfieldInitiativeMod +
        qualityInitiativeMod +
        shotDominanceInitiativeMod +
        goalkeeperCrisisInitiativeMod +
        redCardInitiativeMod
    )
  );
};

const scenarios: LiveMatchInitiativeInputs[] = [
  {
    momentum: 0,
    minute: 10,
    homeFatPenalty: 0,
    awayFatPenalty: 0,
    homePressureInitiativeMultiplier: 1,
    awayPressureInitiativeMultiplier: 1,
    homeFormInitiativeModifier: 0,
    awayFormInitiativeModifier: 0,
    homeFormStacking: 1,
    awayFormStacking: 1,
    homePlayerFormGoalChanceMultiplier: 1,
    awayPlayerFormGoalChanceMultiplier: 1,
    midfieldControlDiff: 0,
    homeQualityGapLive: 0,
    shotGapLive: 0,
    homeGoalkeeperCrisisPenalty: 0,
    awayGoalkeeperCrisisPenalty: 0,
    homeSentOffCount: 0,
    awaySentOffCount: 0,
    homeProfileReadiness: 70,
    awayProfileReadiness: 68,
  },
  {
    momentum: 38,
    minute: 66,
    homeFatPenalty: -0.018,
    awayFatPenalty: -0.064,
    homePressureInitiativeMultiplier: 1.08,
    awayPressureInitiativeMultiplier: 0.94,
    homeFormInitiativeModifier: 0.018,
    awayFormInitiativeModifier: -0.012,
    homeFormStacking: 0.82,
    awayFormStacking: 1,
    homePlayerFormGoalChanceMultiplier: 1.12,
    awayPlayerFormGoalChanceMultiplier: 0.91,
    midfieldControlDiff: 7.5,
    homeQualityGapLive: 9,
    shotGapLive: -10,
    homeGoalkeeperCrisisPenalty: 0,
    awayGoalkeeperCrisisPenalty: 0.031,
    homeSentOffCount: 0,
    awaySentOffCount: 1,
    homeProfileReadiness: 76,
    awayProfileReadiness: 62,
  },
  {
    momentum: -92,
    minute: 81,
    homeFatPenalty: -0.11,
    awayFatPenalty: -0.005,
    homePressureInitiativeMultiplier: 0.88,
    awayPressureInitiativeMultiplier: 1.16,
    homeFormInitiativeModifier: -0.020,
    awayFormInitiativeModifier: 0.024,
    homeFormStacking: 1,
    awayFormStacking: 0.78,
    homePlayerFormGoalChanceMultiplier: 0.72,
    awayPlayerFormGoalChanceMultiplier: 1.35,
    midfieldControlDiff: -16,
    homeQualityGapLive: -22,
    shotGapLive: 14,
    homeGoalkeeperCrisisPenalty: 0.040,
    awayGoalkeeperCrisisPenalty: 0,
    homeSentOffCount: 2,
    awaySentOffCount: 0,
    homeProfileReadiness: 48,
    awayProfileReadiness: 83,
  },
];

for (const scenario of scenarios) {
  const result = calculateLiveMatchInitiative(scenario);
  assert.equal(result.homeAttackChance, legacyInlineHomeAttackChance(scenario));
  assert.equal(result.profileReadinessGap, scenario.homeProfileReadiness! - scenario.awayProfileReadiness!);
}

const noProfileResult = calculateLiveMatchInitiative({
  ...scenarios[0],
  homeProfileReadiness: undefined,
  awayProfileReadiness: undefined,
});
assert.equal(noProfileResult.profileReadinessGap, null);

console.log('LiveMatchInitiativeTests: OK');
