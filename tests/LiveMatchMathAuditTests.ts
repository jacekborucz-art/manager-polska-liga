import assert from 'node:assert/strict';
import { Lineup, MatchEventType, Player, PlayerAttributes, PlayerPosition, WeatherSnapshot } from '../types';
import {
  calculateLiveFatiguePenalty,
  calculateLiveMatchFatigueImpact,
} from '../services/match/live/LiveMatchFatigue';
import {
  calculateLiveMatchInitiative,
  getLegacyQualityGapCurve,
  LiveMatchInitiativeInputs,
} from '../services/match/live/LiveMatchInitiative';
import {
  adjustLiveShotThresholdForRainTechnique,
  calculateLiveIndividualFatigueShotImpact,
  calculateLiveMoraleShotMultiplier,
  calculateLiveNoGoalkeeperShotBonus,
  calculateLiveRelativeFreshnessShotSwing,
  calculateLiveTopStrikerShotBonus,
} from '../services/match/live/LiveMatchShotPressure';
import {
  calculateLiveFoulThreshold,
  calculateLivePenaltyIncidentChance,
} from '../services/match/live/LiveMatchDiscipline';
import {
  isLiveShotOnTargetEvent,
  resolveLiveMissedShotOutcome,
} from '../services/match/live/LiveMatchOutcome';

/**
 * Match engine mathematical audit
 *
 * What this file does:
 * It is not a gameplay script and it does not change match balance. It runs sanity checks over the
 * extracted live-match calculators to verify that the formulas move in the expected football direction:
 * fatigue hurts, red cards hurt the punished side, stronger quality improves initiative, morale affects
 * shot creation, rain hurts the technically weaker attack, and discipline multipliers scale probabilities.
 *
 * Why this is needed:
 * Manual match testing is good at spotting "this felt wrong", but it is weak at catching hidden algebra
 * mistakes. A pure mathematical audit can scan monotonicity, clamps, and edge cases faster than playing
 * dozens of matches. These checks are intentionally conservative: they validate structural consistency,
 * not subjective fun or final balance.
 *
 * How to interpret failures:
 * A failure means a formula contradicted an expected invariant, for example a more tired team gaining
 * initiative. Passing does not prove final realism; it proves the extracted algorithms are internally
 * consistent enough to justify user-facing test matches.
 */

const nearlyEqual = (a: number, b: number, epsilon = 0.0000001): boolean => Math.abs(a - b) <= epsilon;

const makeAttributes = (base: number, overrides: Partial<PlayerAttributes> = {}): PlayerAttributes => ({
  strength: base,
  stamina: base,
  pace: base,
  defending: base,
  passing: base,
  attacking: base,
  finishing: base,
  technique: base,
  vision: base,
  dribbling: base,
  heading: base,
  positioning: base,
  goalkeeping: base,
  freeKicks: base,
  talent: base,
  penalties: base,
  corners: base,
  aggression: base,
  crossing: base,
  leadership: base,
  mentality: base,
  workRate: base,
  ...overrides,
});

const makePlayer = (
  id: string,
  position: PlayerPosition,
  morale: number,
  overrides: Partial<PlayerAttributes> = {}
): Player => ({
  id,
  firstName: id,
  lastName: id,
  position,
  overallRating: 65,
  condition: 100,
  morale,
  attributes: makeAttributes(60, overrides),
} as Player);

const lineup: Lineup = {
  clubId: 'AUDIT',
  tacticId: '4-4-2',
  startingXI: ['gk', 'd1', 'd2', 'm1', 'm2', 'm3', 'm4', 'f1', 'f2', 'f3', 'f4'],
  bench: [],
  reserves: [],
};

const auditPlayers: Player[] = [
  makePlayer('gk', PlayerPosition.GK, 55, { goalkeeping: 72, positioning: 70 }),
  makePlayer('d1', PlayerPosition.DEF, 55, { goalkeeping: 20, defending: 66 }),
  makePlayer('d2', PlayerPosition.DEF, 55, { defending: 66 }),
  makePlayer('m1', PlayerPosition.MID, 55, { technique: 64, passing: 66 }),
  makePlayer('m2', PlayerPosition.MID, 55, { technique: 64, passing: 66 }),
  makePlayer('m3', PlayerPosition.MID, 55, { technique: 64, passing: 66 }),
  makePlayer('m4', PlayerPosition.MID, 55, { technique: 64, passing: 66 }),
  makePlayer('f1', PlayerPosition.FWD, 85, { finishing: 76, mentality: 68 }),
  makePlayer('f2', PlayerPosition.FWD, 55, { finishing: 66 }),
  makePlayer('f3', PlayerPosition.FWD, 35, { finishing: 58 }),
  makePlayer('f4', PlayerPosition.FWD, 18, { finishing: 55, mentality: 50 }),
];

const neutralInitiativeInputs: LiveMatchInitiativeInputs = {
  momentum: 0,
  minute: 30,
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
};

const neutralInitiative = calculateLiveMatchInitiative(neutralInitiativeInputs);
assert.equal(neutralInitiative.homeAttackChance, 0.5);
assert.equal(neutralInitiative.profileReadinessGap, null);

let previousMomentumChance = 0;
for (const momentum of [-160, -80, 0, 80, 160]) {
  const chance = calculateLiveMatchInitiative({ ...neutralInitiativeInputs, momentum }).homeAttackChance;
  assert(chance >= 0.28 && chance <= 0.72);
  assert(chance >= previousMomentumChance);
  previousMomentumChance = chance;
}

assert.equal(getLegacyQualityGapCurve(2), 0);
assert(nearlyEqual(getLegacyQualityGapCurve(12), -getLegacyQualityGapCurve(-12)));
assert(calculateLiveMatchInitiative({ ...neutralInitiativeInputs, homeQualityGapLive: 14 }).homeAttackChance > 0.5);
assert(calculateLiveMatchInitiative({ ...neutralInitiativeInputs, homeQualityGapLive: -14 }).homeAttackChance < 0.5);
assert(calculateLiveMatchInitiative({ ...neutralInitiativeInputs, homeSentOffCount: 1 }).homeAttackChance < 0.5);
assert(calculateLiveMatchInitiative({ ...neutralInitiativeInputs, awaySentOffCount: 1 }).homeAttackChance > 0.5);

assert.equal(calculateLiveFatiguePenalty(100), 0);
assert.equal(calculateLiveFatiguePenalty(94), 0);
assert(calculateLiveFatiguePenalty(80) < calculateLiveFatiguePenalty(88));
assert(calculateLiveFatiguePenalty(65) < calculateLiveFatiguePenalty(80));

const freshFatigue = Object.fromEntries(lineup.startingXI.filter(Boolean).map(id => [id, 96])) as Record<string, number>;
const tiredFatigue = Object.fromEntries(lineup.startingXI.filter(Boolean).map(id => [id, 78])) as Record<string, number>;
const exhaustedFatigue = Object.fromEntries(lineup.startingXI.filter(Boolean).map(id => [id, 66])) as Record<string, number>;
assert.equal(calculateLiveMatchFatigueImpact({ minute: 45, lineup: lineup.startingXI, fatigueMap: freshFatigue, ownSubs: 0, opponentSubs: 0 }).rotationPenalty, 0);
assert(calculateLiveMatchFatigueImpact({ minute: 75, lineup: lineup.startingXI, fatigueMap: tiredFatigue, ownSubs: 0, opponentSubs: 2 }).rotationPenalty < 0);
assert.equal(calculateLiveMatchFatigueImpact({ minute: 75, lineup: lineup.startingXI, fatigueMap: tiredFatigue, ownSubs: 2, opponentSubs: 0 }).rotationPenalty, 0);

const homeFreshAwayTired = calculateLiveMatchInitiative({
  ...neutralInitiativeInputs,
  homeFatPenalty: calculateLiveFatiguePenalty(96),
  awayFatPenalty: calculateLiveFatiguePenalty(78),
}).homeAttackChance;
const homeTiredAwayFresh = calculateLiveMatchInitiative({
  ...neutralInitiativeInputs,
  homeFatPenalty: calculateLiveFatiguePenalty(78),
  awayFatPenalty: calculateLiveFatiguePenalty(96),
}).homeAttackChance;
assert(homeFreshAwayTired > 0.5);
assert(homeTiredAwayFresh < 0.5);
assert(homeFreshAwayTired > homeTiredAwayFresh);

const realGoalkeeper = auditPlayers.find(player => player.id === 'gk')!;
const fieldEmergencyKeeper = auditPlayers.find(player => player.id === 'd1')!;
assert.equal(calculateLiveNoGoalkeeperShotBonus(['gk'], realGoalkeeper), 0);
assert(calculateLiveNoGoalkeeperShotBonus(['d1'], fieldEmergencyKeeper) > calculateLiveNoGoalkeeperShotBonus(['gk'], realGoalkeeper));
assert(calculateLiveNoGoalkeeperShotBonus([null], null) > calculateLiveNoGoalkeeperShotBonus(['d1'], fieldEmergencyKeeper));

const highStrikerBonus = calculateLiveTopStrikerShotBonus(auditPlayers, lineup.startingXI);
const lowStrikerBonus = calculateLiveTopStrikerShotBonus(
  [makePlayer('weak', PlayerPosition.FWD, 50, { finishing: 52 })],
  ['weak']
);
assert(highStrikerBonus > lowStrikerBonus);

const highMoraleMultiplier = calculateLiveMoraleShotMultiplier({
  attackingPlayers: [makePlayer('calm', PlayerPosition.FWD, 85, { mentality: 60 })],
  attackingLineup: ['calm'],
  moraleNoise: () => 0.5,
});
const lowMoraleMultiplier = calculateLiveMoraleShotMultiplier({
  attackingPlayers: [makePlayer('nervous', PlayerPosition.FWD, 18, { mentality: 60 })],
  attackingLineup: ['nervous'],
  moraleNoise: () => 0.5,
});
assert(highMoraleMultiplier > lowMoraleMultiplier);
assert(lowMoraleMultiplier >= 0.15);

assert.equal(calculateLiveRelativeFreshnessShotSwing(100, 100), 0);
assert(calculateLiveRelativeFreshnessShotSwing(95, 75) > 0);
assert(calculateLiveRelativeFreshnessShotSwing(75, 95) < 0);

const tiredShotFatigue = calculateLiveIndividualFatigueShotImpact({
  minute: 75,
  attackingLineup: lineup.startingXI,
  defendingLineup: lineup.startingXI,
  attackingFatigue: exhaustedFatigue,
  defendingFatigue: freshFatigue,
  attackingSubsUsed: 0,
  defendingSubsUsed: 3,
});
const freshShotFatigue = calculateLiveIndividualFatigueShotImpact({
  minute: 75,
  attackingLineup: lineup.startingXI,
  defendingLineup: lineup.startingXI,
  attackingFatigue: freshFatigue,
  defendingFatigue: exhaustedFatigue,
  attackingSubsUsed: 3,
  defendingSubsUsed: 0,
});
assert(tiredShotFatigue.criticalFatPenalty > freshShotFatigue.criticalFatPenalty);
assert(tiredShotFatigue.freshDefBonus > freshShotFatigue.freshDefBonus);
assert(tiredShotFatigue.noRotationShotPenalty > freshShotFatigue.noRotationShotPenalty);

const rain: WeatherSnapshot = {
  tempC: 12,
  precipitationChance: 88,
  windKmh: 14,
  description: 'rain',
  weatherIntensity: 0.7,
};
const weakTechniqueRain = adjustLiveShotThresholdForRainTechnique({
  shotThreshold: 0.12,
  weather: rain,
  attackingTechniqueAverage: 55,
  defendingTechniqueAverage: 68,
});
const strongTechniqueRain = adjustLiveShotThresholdForRainTechnique({
  shotThreshold: 0.12,
  weather: rain,
  attackingTechniqueAverage: 70,
  defendingTechniqueAverage: 60,
});
assert(weakTechniqueRain.threshold < 0.12);
assert.equal(strongTechniqueRain.threshold, 0.12);

assert.equal(calculateLiveFoulThreshold({ intensityFoulMultiplier: 1, pressureCardMultiplier: 1, rivalryMultiplier: 1 }), 0.043);
assert(calculateLiveFoulThreshold({ intensityFoulMultiplier: 1.5, pressureCardMultiplier: 1.3, rivalryMultiplier: 1.2 }) > 0.043);
assert.equal(calculateLivePenaltyIncidentChance({ intensityPenaltyMultiplier: 1, pressurePenaltyMultiplier: 1 }), 0.0956);
assert(calculateLivePenaltyIncidentChance({ intensityPenaltyMultiplier: 1.4, pressurePenaltyMultiplier: 1.2 }) > 0.0956);

const nonGoalEvents = Array.from({ length: 1000 }, (_, index) =>
  resolveLiveMissedShotOutcome({
    failRoll: (index + 0.5) / 1000,
    shotAccuracyRoll: 0.99,
    dangerLabel: 'normal',
    shotOnTargetBoost: 0,
  })
);
const onTargetShare = nonGoalEvents.filter(isLiveShotOnTargetEvent).length / nonGoalEvents.length;
assert(onTargetShare >= 0.84 && onTargetShare <= 0.86);
assert(nonGoalEvents.includes(MatchEventType.SHOT_POST));
assert(nonGoalEvents.includes(MatchEventType.SHOT_BAR));
assert(nonGoalEvents.includes(MatchEventType.ONE_ON_ONE_SAVE));
assert(nonGoalEvents.includes(MatchEventType.ONE_ON_ONE_MISS));
assert(nonGoalEvents.includes(MatchEventType.SAVE));
assert(nonGoalEvents.includes(MatchEventType.WINGER_STOPPED));
assert(nonGoalEvents.includes(MatchEventType.SHOT));

console.log('LiveMatchMathAuditTests: OK');
console.log(`MathAudit summary: initiative neutral=${neutralInitiative.homeAttackChance.toFixed(3)}, fresh-vs-tired=${homeFreshAwayTired.toFixed(3)}, tired-vs-fresh=${homeTiredAwayFresh.toFixed(3)}, non-goal on-target share=${onTargetShare.toFixed(3)}`);
