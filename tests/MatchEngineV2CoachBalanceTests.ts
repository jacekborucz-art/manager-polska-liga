import assert from 'node:assert/strict';
import type {
  TacticalInstructions,
  UserCoachInstructionId,
  UserCoachShoutId,
} from '../types';
import { UserCoachInstructionService } from '../services/UserCoachInstructionService';
import {
  UserCoachShoutService,
  type UserCoachShoutSituation,
} from '../services/UserCoachShoutService';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';

type EffectTotals = {
  initiativeModifier: number;
  userShotModifier: number;
  opponentShotModifier: number;
  turnoverRiskModifier: number;
  fatigueExtra: number;
  foulMultiplier: number;
  injuryMultiplier: number;
};

const emptyTotals = (): EffectTotals => ({
  initiativeModifier: 0,
  userShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 0,
  injuryMultiplier: 0,
});

const addEffect = (totals: EffectTotals, effect: EffectTotals): void => {
  (Object.keys(totals) as Array<keyof EffectTotals>).forEach(key => {
    totals[key] += effect[key];
  });
};

const averageEffect = (totals: EffectTotals, count: number): EffectTotals =>
  Object.fromEntries(
    (Object.keys(totals) as Array<keyof EffectTotals>).map(key => [key, totals[key] / count]),
  ) as EffectTotals;

const assertFiniteAndBounded = (effect: EffectTotals, kind: 'instruction' | 'shout'): void => {
  (Object.keys(emptyTotals()) as Array<keyof EffectTotals>).forEach(key => {
    assert.ok(Number.isFinite(effect[key]), `${kind}: ${key} musi być skończoną liczbą.`);
  });
  const bounds = kind === 'instruction'
    ? {
        initiativeModifier: [-0.055, 0.050],
        userShotModifier: [-0.014, 0.012],
        opponentShotModifier: [-0.010, 0.022],
        turnoverRiskModifier: [-0.10, 0.16],
        fatigueExtra: [-0.014, 0.055],
        foulMultiplier: [0.90, 1.35],
        injuryMultiplier: [0.92, 1.30],
      }
    : {
        initiativeModifier: [-0.026, 0.026],
        userShotModifier: [-0.008, 0.008],
        opponentShotModifier: [-0.008, 0.009],
        turnoverRiskModifier: [-0.050, 0.050],
        fatigueExtra: [-0.009, 0.022],
        foulMultiplier: [0.88, 1.18],
        injuryMultiplier: [0.94, 1.12],
      };
  (Object.keys(bounds) as Array<keyof EffectTotals>).forEach(key => {
    const [minimum, maximum] = bounds[key];
    assert.ok(effect[key] >= minimum - 1e-9 && effect[key] <= maximum + 1e-9,
      `${kind}: ${key}=${effect[key]} przekracza zakres ${minimum}..${maximum}.`);
  });
};

/**
 * A positive football value is not the same mathematical sign for every field.
 * More initiative and own shots help, while fewer opponent shots, turnovers,
 * fatigue, fouls and injuries help. Requiring both a benefit and a cost prevents
 * any command from becoming an automatic button that is correct in every match.
 */
const assertHasBenefitAndCost = (id: string, effect: EffectTotals): void => {
  const footballValues = [
    effect.initiativeModifier,
    effect.userShotModifier,
    -effect.opponentShotModifier,
    -effect.turnoverRiskModifier,
    -effect.fatigueExtra,
    1 - effect.foulMultiplier,
    1 - effect.injuryMultiplier,
  ];
  assert.ok(footballValues.some(value => value > 0.00005), `${id} nie ma wykrywalnej korzyści.`);
  assert.ok(footballValues.some(value => value < -0.00005), `${id} nie ma wykrywalnego kosztu.`);
};

const instructionIds: UserCoachInstructionId[] = [
  'NARROW', 'WIDE', 'CALM_DOWN', 'SPEED_UP', 'KEEP_BALL',
  'TAKE_RISKS', 'CLOSE_DOWN', 'DROP_BACK', 'ALL_FORWARD', 'TIME_WASTE',
];

const sample = CupSampleMatchFactory.makeInput(731, 'EQUAL');
const home = sample.home;
const away = sample.away;
const startingXI = home.lineup.startingXI;
const fatigueMap = Object.fromEntries(startingXI.filter(Boolean).map(id => [id!, 88]));

const defensiveInstructions: TacticalInstructions = {
  ...home.instructions,
  mindset: 'DEFENSIVE',
  tempo: 'SLOW',
  intensity: 'CAUTIOUS',
  passing: 'SHORT',
  pressing: 'NORMAL',
  counterAttack: 'COUNTER',
  marking: 'ZONE',
};
const offensiveInstructions: TacticalInstructions = {
  ...home.instructions,
  mindset: 'OFFENSIVE',
  tempo: 'FAST',
  intensity: 'AGGRESSIVE',
  passing: 'LONG',
  pressing: 'PRESSING',
  counterAttack: 'NORMAL',
  marking: 'MAN',
};
const balancedInstructions: TacticalInstructions = {
  ...home.instructions,
  mindset: 'NEUTRAL',
  tempo: 'NORMAL',
  intensity: 'NORMAL',
  passing: 'MIXED',
  pressing: 'NORMAL',
  counterAttack: 'NORMAL',
  marking: 'NONE',
};

const defensiveTactic = { ...home.tactic, attackBias: 36, defenseBias: 82, pressingIntensity: 38 };
const offensiveTactic = { ...home.tactic, attackBias: 82, defenseBias: 38, pressingIntensity: 82 };
const balancedTactic = { ...home.tactic, attackBias: 55, defenseBias: 55, pressingIntensity: 55 };

const instructionScenario = (id: UserCoachInstructionId) => {
  if (['NARROW', 'CALM_DOWN', 'KEEP_BALL', 'DROP_BACK', 'TIME_WASTE'].includes(id)) {
    return { instructions: defensiveInstructions, tactic: defensiveTactic, scoreDiff: 1 };
  }
  if (['SPEED_UP', 'TAKE_RISKS', 'CLOSE_DOWN', 'ALL_FORWARD'].includes(id)) {
    return { instructions: offensiveInstructions, tactic: offensiveTactic, scoreDiff: -1 };
  }
  return { instructions: balancedInstructions, tactic: balancedTactic, scoreDiff: 0 };
};

const instructionAverages: Record<string, EffectTotals> = {};
instructionIds.forEach((id, optionIndex) => {
  const totals = emptyTotals();
  const scenario = instructionScenario(id);
  for (let seed = 1; seed <= 120; seed += 1) {
    const issued = UserCoachInstructionService.issue({
      id,
      minute: 70,
      sessionSeed: seed * 1009 + optionIndex * 37,
    });
    const effect = UserCoachInstructionService.getEffects({
      active: issued.active,
      minute: issued.active.startsMinute,
      instructions: scenario.instructions,
      tactic: scenario.tactic,
      opponentTactic: away.tactic,
      players: home.players,
      startingXI,
      fatigueMap,
      scoreDiff: scenario.scoreDiff,
      opponentTempo: away.instructions.tempo,
      opponentPassing: away.instructions.passing,
    });
    assert.equal(effect.active, true);
    assertFiniteAndBounded(effect, 'instruction');
    addEffect(totals, effect);
  }
  const average = averageEffect(totals, 120);
  assertHasBenefitAndCost(id, average);
  instructionAverages[id] = average;
});

// These directional checks describe the intended identity of every command.
assert.ok(instructionAverages.NARROW.opponentShotModifier < 0 && instructionAverages.NARROW.initiativeModifier < 0);
assert.ok(instructionAverages.WIDE.initiativeModifier > 0 && instructionAverages.WIDE.turnoverRiskModifier > 0);
assert.ok(instructionAverages.CALM_DOWN.turnoverRiskModifier < 0 && instructionAverages.CALM_DOWN.initiativeModifier < 0);
assert.ok(instructionAverages.SPEED_UP.initiativeModifier > 0 && instructionAverages.SPEED_UP.fatigueExtra > 0);
assert.ok(instructionAverages.KEEP_BALL.turnoverRiskModifier < 0 && instructionAverages.KEEP_BALL.userShotModifier < 0);
assert.ok(instructionAverages.TAKE_RISKS.userShotModifier > 0 && instructionAverages.TAKE_RISKS.turnoverRiskModifier > 0);
assert.ok(instructionAverages.CLOSE_DOWN.initiativeModifier > 0 && instructionAverages.CLOSE_DOWN.foulMultiplier > 1);
assert.ok(instructionAverages.DROP_BACK.opponentShotModifier < 0 && instructionAverages.DROP_BACK.initiativeModifier < 0);
assert.ok(instructionAverages.ALL_FORWARD.userShotModifier > 0 && instructionAverages.ALL_FORWARD.opponentShotModifier > 0);
assert.ok(instructionAverages.TIME_WASTE.turnoverRiskModifier < 0 && instructionAverages.TIME_WASTE.userShotModifier < 0);

const baseSituation: UserCoachShoutSituation = {
  scoreDiff: 0,
  shotDiff: 0,
  shotsOnTargetDiff: 0,
  userMomentum: 0,
  recentlyScored: false,
  recentlyConceded: false,
  averageFatigue: 86,
  averageMorale: 62,
  yellowCardCount: 0,
};
const shoutSituations: Record<UserCoachShoutId, UserCoachShoutSituation> = {
  MOTIVATE: { ...baseSituation, scoreDiff: -2, shotDiff: -5, userMomentum: -24, averageMorale: 42 },
  PRAISE: { ...baseSituation, scoreDiff: 3, shotDiff: 6, shotsOnTargetDiff: 4, userMomentum: 38, recentlyScored: true },
  FOCUS: { ...baseSituation, scoreDiff: 1, userMomentum: 8 },
  NO_PANIC: { ...baseSituation, scoreDiff: -1, recentlyConceded: true, userMomentum: -34 },
  MORE_EFFORT: { ...baseSituation, scoreDiff: -1, shotDiff: -4, userMomentum: -22, averageMorale: 38 },
  CALM_EMOTIONS: { ...baseSituation, scoreDiff: -1, shotDiff: 3, yellowCardCount: 4 },
  DO_BETTER: { ...baseSituation, scoreDiff: -2, shotDiff: -6, userMomentum: -24, averageMorale: 35 },
  DONT_GIVE_UP: { ...baseSituation, scoreDiff: -1, recentlyConceded: true, userMomentum: -30 },
};
const shoutIds = Object.keys(shoutSituations) as UserCoachShoutId[];
const shoutAverages: Record<string, EffectTotals> = {};

shoutIds.forEach((id, optionIndex) => {
  const totals = emptyTotals();
  let responseTotal = 0;
  for (let seed = 1; seed <= 120; seed += 1) {
    const rng = UserCoachShoutService.createRngState(seed * 2017 + optionIndex * 53);
    const issued = UserCoachShoutService.issue({
      id,
      minute: 70,
      rngState: rng,
      situation: shoutSituations[id],
    });
    const effect = UserCoachShoutService.getEffects({
      active: issued.active,
      minute: issued.active.startsMinute,
      rngState: issued.rngState,
      players: home.players,
      startingXI,
      fatigueMap,
      yellowCards: {},
    });
    assert.equal(effect.active, true);
    assertFiniteAndBounded(effect, 'shout');
    responseTotal += effect.averageResponse;
    addEffect(totals, effect);
  }
  const average = averageEffect(totals, 120);
  assert.ok(responseTotal / 120 > 0.10, `${id} powinien pomagać w dopasowanym kontekście.`);
  assertHasBenefitAndCost(id, average);
  shoutAverages[id] = average;
});

assert.ok(shoutAverages.MOTIVATE.initiativeModifier > 0 && shoutAverages.MOTIVATE.fatigueExtra > 0);
assert.ok(shoutAverages.PRAISE.userShotModifier > 0 && shoutAverages.PRAISE.opponentShotModifier > 0);
assert.ok(shoutAverages.FOCUS.turnoverRiskModifier < 0 && shoutAverages.FOCUS.fatigueExtra > 0);
assert.ok(shoutAverages.NO_PANIC.turnoverRiskModifier < 0 && shoutAverages.NO_PANIC.initiativeModifier < 0);
assert.ok(shoutAverages.MORE_EFFORT.initiativeModifier > 0 && shoutAverages.MORE_EFFORT.foulMultiplier > 1);
assert.ok(shoutAverages.CALM_EMOTIONS.foulMultiplier < 1 && shoutAverages.CALM_EMOTIONS.initiativeModifier < 0);
assert.ok(shoutAverages.DO_BETTER.userShotModifier > 0 && shoutAverages.DO_BETTER.turnoverRiskModifier > 0);
assert.ok(shoutAverages.DONT_GIVE_UP.initiativeModifier > 0 && shoutAverages.DONT_GIVE_UP.injuryMultiplier > 1);

console.log('MatchEngineV2CoachBalanceTests: OK', {
  instructions: instructionIds.length,
  shouts: shoutIds.length,
  seedsPerOption: 120,
});
