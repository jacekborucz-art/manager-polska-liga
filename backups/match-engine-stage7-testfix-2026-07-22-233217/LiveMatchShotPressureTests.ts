import assert from 'node:assert/strict';
import { Lineup, Player, PlayerAttributes, PlayerPosition, WeatherSnapshot } from '../types';
import {
  adjustLiveShotThresholdForRainTechnique,
  calculateLiveDefendingBiasShotPenalty,
  calculateLiveIndividualFatigueShotImpact,
  calculateLiveMoraleShotMultiplier,
  calculateLiveNoGoalkeeperShotBonus,
  calculateLiveRelativeFreshnessShotSwing,
  calculateLiveShotSatiety,
  calculateLiveTopStrikerShotBonus,
  getLiveEmergencyKeeperRead,
  getLiveLineupAttributeAverage,
} from '../services/match/live/LiveMatchShotPressure';
import { PlayerMoraleService } from '../services/PlayerMoraleService';

/**
 * Match engine migration test
 *
 * What this test protects:
 * LiveMatchShotPressure extracts the first group of shot-creation formulas from MatchLiveView. These
 * helpers cover the parts that strongly affect shot volume: large-lead satiety, defensive bias,
 * emergency goalkeeper exposure, striker quality, low morale, relative freshness, individual fatigue,
 * and rain against technically weaker attackers.
 *
 * Why this matters:
 * The match engine can feel wrong very quickly if shot thresholds drift by only a few hundredths. A
 * small hidden change can produce too many highlights, too many goals, or make fatigue and morale feel
 * invisible. These tests lock the extracted helpers to the legacy arithmetic before later stages start
 * tuning the engine with the richer LiveMatchTeamProfile inputs.
 *
 * How it verifies safety:
 * Each assertion compares a helper result with the exact old inline formula or with the expected
 * football direction. The morale test injects deterministic noise so the old Math.random shape remains
 * testable without making the unit test flaky.
 */

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
  attributes: Partial<PlayerAttributes> = {},
  morale = 50
): Player => ({
  id,
  firstName: id,
  lastName: id,
  position,
  overallRating: 65,
  morale,
  condition: 100,
  attributes: makeAttributes(60, attributes),
} as Player);

const lineup: Lineup = {
  clubId: 'TEST',
  tacticId: '4-4-2',
  startingXI: ['gk', 'def', 'mid', 'fwd', null, null, null, null, null, null, null],
  bench: [],
  reserves: [],
};

const gk = makePlayer('gk', PlayerPosition.GK, { goalkeeping: 74, positioning: 68, mentality: 65, strength: 61 });
const emergencyKeeper = makePlayer('def', PlayerPosition.DEF, { goalkeeping: 20, positioning: 56, mentality: 58, strength: 63 });
const midfielder = makePlayer('mid', PlayerPosition.MID, { technique: 54, mentality: 80 }, 18);
const striker = makePlayer('fwd', PlayerPosition.FWD, { finishing: 72, technique: 55, mentality: 55 }, 65);
const players = [gk, emergencyKeeper, midfielder, striker];

const satiety = calculateLiveShotSatiety({
  baseShotThreshold: 0.11,
  leads: true,
  goalDiff: 4,
  satietyRoll: 0.5,
});
assert.equal(satiety.satietyFactor, 1 + (4 - 1) * (0.3 + 0.5 * 0.3));
assert.equal(satiety.threshold, 0.11 / satiety.satietyFactor);

assert.equal(calculateLiveDefendingBiasShotPenalty(80), 0.036);
assert.equal(calculateLiveNoGoalkeeperShotBonus([null], null), 0.055);
assert.equal(calculateLiveNoGoalkeeperShotBonus(['gk'], gk), 0);

const emergencyRead = getLiveEmergencyKeeperRead(emergencyKeeper);
assert.equal(
  emergencyRead,
  emergencyKeeper.attributes.goalkeeping * 0.35 +
    emergencyKeeper.attributes.positioning * 0.25 +
    emergencyKeeper.attributes.mentality * 0.22 +
    emergencyKeeper.attributes.strength * 0.18
);
assert.equal(
  calculateLiveNoGoalkeeperShotBonus(['def'], emergencyKeeper),
  0.031 + Math.max(0, Math.min(1, (62 - emergencyRead) / 45)) * 0.017
);

assert.equal(
  calculateLiveTopStrikerShotBonus(players, lineup.startingXI),
  Math.max(0, ((striker.attributes.finishing * PlayerMoraleService.getMatchMultiplier(striker)) - 55) / (77 - 55)) * 0.012
);

const moraleMultiplier = calculateLiveMoraleShotMultiplier({
  attackingPlayers: players,
  attackingLineup: lineup.startingXI,
  moraleNoise: () => 0.5,
});
const expectedMoralePenalty = 0.097 * (1 - midfielder.attributes.mentality / 100 * 0.6);
assert.equal(moraleMultiplier, Math.max(0.15, 1 - expectedMoralePenalty));

assert.equal(calculateLiveRelativeFreshnessShotSwing(95, 75), 0.026);
assert.equal(calculateLiveRelativeFreshnessShotSwing(70, 95), -0.026);

const fatigueImpact = calculateLiveIndividualFatigueShotImpact({
  minute: 75,
  attackingLineup: lineup.startingXI,
  defendingLineup: lineup.startingXI,
  attackingFatigue: { gk: 90, def: 81, mid: 69, fwd: 77 },
  defendingFatigue: { gk: 91, def: 88, mid: 86, fwd: 70 },
  attackingSubsUsed: 0,
  defendingSubsUsed: 2,
});
assert.equal(fatigueImpact.tiredAttackers, 3);
assert.equal(fatigueImpact.exhaustedAttackers, 1);
assert.equal(fatigueImpact.freshDefenders, 3);
assert.equal(fatigueImpact.criticalFatPenalty, Math.min(0.060, 3 * 0.006 + 1 * 0.010));
assert.equal(fatigueImpact.freshDefBonus, Math.min(0.040, 3 * 0.006));
assert.equal(
  fatigueImpact.noRotationShotPenalty,
  Math.min(0.035, (2 - 0) * 0.006 + 3 * 0.004 + Math.max(0, 2 - 0) * 0.004) * Math.min(1, (75 - 60) / 30)
);

assert.equal(getLiveLineupAttributeAverage(players, lineup.startingXI, 'technique'), (60 + 60 + 54 + 55) / 4);

const rainy: WeatherSnapshot = {
  tempC: 12,
  precipitationChance: 70,
  windKmh: 10,
  description: 'rain',
  weatherIntensity: 0.5,
};
const rainAdjusted = adjustLiveShotThresholdForRainTechnique({
  shotThreshold: 0.12,
  weather: rainy,
  attackingTechniqueAverage: 55,
  defendingTechniqueAverage: 66,
});
assert.equal(rainAdjusted.modifier, -(0.010 * 0.5));
assert.equal(rainAdjusted.threshold, 0.115);

console.log('LiveMatchShotPressureTests: OK');
