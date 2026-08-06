import assert from 'node:assert/strict';
import { PlayerPosition, type CoachAttributes, type Tactic, type TacticalInstructions } from '../types';
import { AiCoachCommandService } from '../services/AiCoachCommandService';
import { UserCoachInstructionService } from '../services/UserCoachInstructionService';
import { UserCoachShoutService, type UserCoachShoutSituation } from '../services/UserCoachShoutService';

const makeTactic = ({
  id,
  attackBias,
  defenseBias,
  pressingIntensity,
}: {
  id: string;
  attackBias: number;
  defenseBias: number;
  pressingIntensity: number;
}): Tactic => ({
  id,
  name: id,
  category: 'TEST',
  attackBias,
  defenseBias,
  pressingIntensity,
  slots: [
    { index: 0, role: PlayerPosition.GK, x: 0.5, y: 0.9 },
    { index: 1, role: PlayerPosition.MID, x: 0.25, y: 0.5 },
    { index: 2, role: PlayerPosition.MID, x: 0.75, y: 0.5 },
  ],
});

const makeInstructions = (overrides: Partial<TacticalInstructions> = {}): TacticalInstructions => ({
  tempo: 'NORMAL',
  mindset: 'NEUTRAL',
  intensity: 'NORMAL',
  passing: 'MIXED',
  pressing: 'NORMAL',
  counterAttack: 'NORMAL',
  marking: 'NONE',
  lastChangeMinute: -5,
  expiryMinute: -1,
  tempoExpiry: -1,
  mindsetExpiry: -1,
  intensityExpiry: -1,
  tempoCooldown: 0,
  mindsetCooldown: 0,
  intensityCooldown: 0,
  passingCooldown: 0,
  pressingCooldown: 0,
  counterAttackCooldown: 0,
  markingCooldown: 0,
  tempoResponseFactor: 1,
  mindsetResponseFactor: 1,
  intensityResponseFactor: 1,
  passingResponseFactor: 1,
  pressingResponseFactor: 1,
  counterAttackResponseFactor: 1,
  markingResponseFactor: 1,
  ...overrides,
});

const weakCoach: CoachAttributes = { decisionMaking: 25, experience: 28, motivation: 32, training: 40 };
const eliteCoach: CoachAttributes = { decisionMaking: 92, experience: 90, motivation: 88, training: 85 };
const offensiveTactic = makeTactic({ id: 'offensive', attackBias: 82, defenseBias: 40, pressingIntensity: 78 });
const defensiveTactic = makeTactic({ id: 'defensive', attackBias: 38, defenseBias: 82, pressingIntensity: 42 });
const balancedTactic = makeTactic({ id: 'balanced', attackBias: 55, defenseBias: 55, pressingIntensity: 55 });
const offensiveInstructions = makeInstructions({
  mindset: 'OFFENSIVE',
  tempo: 'FAST',
  intensity: 'AGGRESSIVE',
  pressing: 'PRESSING',
  passing: 'LONG',
});

const losingLate: UserCoachShoutSituation = {
  scoreDiff: -1,
  shotDiff: -3,
  shotsOnTargetDiff: -2,
  userMomentum: -24,
  recentlyScored: false,
  recentlyConceded: true,
  averageFatigue: 74,
  averageMorale: 48,
  yellowCardCount: 1,
};
const leadingLate: UserCoachShoutSituation = {
  scoreDiff: 1,
  shotDiff: 2,
  shotsOnTargetDiff: 1,
  userMomentum: 14,
  recentlyScored: false,
  recentlyConceded: false,
  averageFatigue: 76,
  averageMorale: 64,
  yellowCardCount: 1,
};

assert.equal(AiCoachCommandService.isLogicalInstruction({
  id: 'TIME_WASTE', alignment: 2, minute: 82, scoreDiff: -1, averageFatigue: 75,
}), false, 'AI nie może grać na czas podczas przegrywania.');
assert.equal(AiCoachCommandService.isLogicalInstruction({
  id: 'ALL_FORWARD', alignment: 2, minute: 82, scoreDiff: 1, averageFatigue: 75,
}), false, 'AI nie może wysłać wszystkich do przodu podczas prowadzenia.');
assert.equal(AiCoachCommandService.isLogicalInstruction({
  id: 'TIME_WASTE', alignment: 1, minute: 82, scoreDiff: 1, averageFatigue: 75,
}), true, 'Logiczna gra na czas przy późnym prowadzeniu powinna pozostać dostępna.');
assert.equal(AiCoachCommandService.isLogicalInstruction({
  id: 'ALL_FORWARD', alignment: 2, minute: 82, scoreDiff: -1, averageFatigue: 54,
}), false, 'Skrajnie wyczerpany zespół nie powinien otrzymać niewykonalnego polecenia.');

const praiseFitAfterConceding = UserCoachShoutService.getSelectionFit('PRAISE', losingLate);
assert.equal(AiCoachCommandService.isLogicalShout({
  id: 'PRAISE', alignment: praiseFitAfterConceding.alignment, situation: losingLate,
}), false, 'AI nie może chwalić drużyny bezpośrednio po złej stracie gola.');

const decide = (entropy: number, coachAttributes: CoachAttributes, situation = losingLate) =>
  AiCoachCommandService.decide({
    minute: 82,
    coachAttributes,
    rngState: AiCoachCommandService.createRngState(entropy),
    aiInstructions: offensiveInstructions,
    aiTactic: offensiveTactic,
    userTactic: defensiveTactic,
    aiScoreDiff: situation.scoreDiff,
    userTempo: 'NORMAL',
    userPassing: 'MIXED',
    situation,
  });

let weakEffectivenessTotal = 0;
let weakInstructionCount = 0;
let eliteEffectivenessTotal = 0;
let eliteInstructionCount = 0;
let announcementFound = false;

for (let entropy = 1; entropy <= 180; entropy += 1) {
  const weakDecision = decide(entropy, weakCoach);
  const eliteDecision = decide(entropy, eliteCoach);
  if (weakDecision.instruction) {
    weakInstructionCount += 1;
    weakEffectivenessTotal += weakDecision.instruction.coachEffectiveness;
    assert.ok(weakDecision.instruction.advantageMultiplier >= 1.01 && weakDecision.instruction.advantageMultiplier < 1.10);
    assert.notEqual(weakDecision.instruction.id, 'TIME_WASTE', 'Niski poziom trenera nie może ominąć filtra logiki.');
    assert.notEqual(weakDecision.instruction.id, 'DROP_BACK', 'Słaby trener nie może cofnąć przegrywającego zespołu w końcówce.');
  }
  if (eliteDecision.instruction) {
    eliteInstructionCount += 1;
    eliteEffectivenessTotal += eliteDecision.instruction.coachEffectiveness;
    assert.ok(eliteDecision.instruction.advantageMultiplier >= 1.01 && eliteDecision.instruction.advantageMultiplier < 1.10);
  }
  if (weakDecision.shout) {
    assert.notEqual(weakDecision.shout.id, 'PRAISE', 'Losowość słabego trenera nie może przywrócić odrzuconego okrzyku.');
    assert.ok(weakDecision.shout.advantageMultiplier >= 1.01 && weakDecision.shout.advantageMultiplier < 1.10);
  }
  if (eliteDecision.shoutAnnouncement) {
    announcementFound = true;
    assert.ok(eliteDecision.shoutAnnouncement.text.length > 0);
  }
  assert.ok(weakDecision.rngState.drawCount > 0, 'AI musi przesuwać własny strumień RNG.');
}

assert.ok(weakInstructionCount > 30 && eliteInstructionCount > 30, 'Próba musi zawierać reprezentatywną liczbę decyzji.');
assert.ok(
  eliteEffectivenessTotal / eliteInstructionCount > weakEffectivenessTotal / weakInstructionCount,
  'Atrybuty elitarnego trenera powinny dawać silniejszy średni efekt niż u słabego trenera.'
);
assert.equal(announcementFound, true, 'Wydany okrzyk AI powinien tworzyć komunikat dla chmurki.');

for (let entropy = 1; entropy <= 60; entropy += 1) {
  const openingDecision = AiCoachCommandService.decide({
    minute: 7,
    coachAttributes: weakCoach,
    rngState: AiCoachCommandService.createRngState(entropy),
    aiInstructions: makeInstructions(),
    aiTactic: balancedTactic,
    userTactic: balancedTactic,
    aiScoreDiff: 0,
    situation: { ...leadingLate, scoreDiff: 0, recentlyConceded: false },
  });
  assert.ok(openingDecision.shout, 'Pierwszy logiczny okrzyk AI nie może zostać pominięty przez RNG.');
  assert.ok(openingDecision.shoutAnnouncement, 'Pierwszy okrzyk powinien od razu utworzyć chmurkę.');
  assert.ok(openingDecision.nextDecisionMinute <= 21, 'AI nie może zaplanować ciszy dłuższej niż 14 minut.');
}

for (let entropy = 1; entropy <= 80; entropy += 1) {
  const decision = AiCoachCommandService.decide({
    minute: 82,
    coachAttributes: weakCoach,
    rngState: AiCoachCommandService.createRngState(entropy),
    aiInstructions: makeInstructions({ mindset: 'DEFENSIVE', tempo: 'SLOW', intensity: 'CAUTIOUS', marking: 'ZONE' }),
    aiTactic: defensiveTactic,
    userTactic: balancedTactic,
    aiScoreDiff: 1,
    situation: leadingLate,
  });
  assert.notEqual(decision.instruction?.id, 'ALL_FORWARD', 'Prowadzący AI nigdy nie może wybrać absurdalnego pełnego ataku.');
  assert.notEqual(decision.shout?.id, 'DONT_GIVE_UP', 'Prowadzący AI nie powinien wydawać nielogicznego okrzyku o niepoddawaniu się.');
}

const allForwardAlignment = UserCoachInstructionService.getSelectionAlignment({
  id: 'ALL_FORWARD',
  instructions: offensiveInstructions,
  tactic: offensiveTactic,
  opponentTactic: defensiveTactic,
  minute: 82,
  scoreDiff: -1,
});
assert.ok(allForwardAlignment > 0, 'Testowa sytuacja musi faktycznie dopuszczać logiczny pełny atak.');

console.log('AiCoachCommandService tests passed.');
