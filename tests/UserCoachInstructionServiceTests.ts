import assert from 'node:assert/strict';
import {
  PlayerPosition,
  type ActiveUserCoachInstruction,
  type Tactic,
  type TacticalInstructions,
  type UserCoachInstructionId,
} from '../types';
import { UserCoachInstructionService } from '../services/UserCoachInstructionService';

const makeTactic = ({
  attackBias = 50,
  defenseBias = 50,
  pressingIntensity = 50,
  width = 0.5,
}: Partial<Pick<Tactic, 'attackBias' | 'defenseBias' | 'pressingIntensity'>> & { width?: number } = {}): Tactic => ({
  id: `test-${attackBias}-${defenseBias}-${pressingIntensity}-${width}`,
  name: 'Test',
  category: 'TEST',
  attackBias,
  defenseBias,
  pressingIntensity,
  slots: [
    { index: 0, role: PlayerPosition.GK, x: 0.5, y: 0.9 },
    { index: 1, role: PlayerPosition.MID, x: 0.5 - width / 2, y: 0.5 },
    { index: 2, role: PlayerPosition.MID, x: 0.5 + width / 2, y: 0.5 },
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

const defensiveInstructions = makeInstructions({
  mindset: 'DEFENSIVE',
  tempo: 'SLOW',
  intensity: 'CAUTIOUS',
  passing: 'SHORT',
  pressing: 'NORMAL',
  counterAttack: 'COUNTER',
  marking: 'ZONE',
});
const offensiveInstructions = makeInstructions({
  mindset: 'OFFENSIVE',
  tempo: 'FAST',
  intensity: 'AGGRESSIVE',
  passing: 'LONG',
  pressing: 'PRESSING',
  counterAttack: 'NORMAL',
  marking: 'MAN',
});

const defensiveTactic = makeTactic({ attackBias: 35, defenseBias: 80, pressingIntensity: 35, width: 0.4 });
const offensiveTactic = makeTactic({ attackBias: 82, defenseBias: 38, pressingIntensity: 82, width: 0.66 });

assert.ok(
  UserCoachInstructionService.getMatrixCompatibility('DROP_BACK', defensiveInstructions, defensiveTactic) > 0,
  'Cofnięcie powinno współgrać z defensywną taktyką.'
);
assert.ok(
  UserCoachInstructionService.getMatrixCompatibility('DROP_BACK', offensiveInstructions, offensiveTactic) < 0,
  'Cofnięcie powinno kolidować z ofensywną taktyką.'
);
assert.ok(
  UserCoachInstructionService.getMatrixCompatibility('TIME_WASTE', defensiveInstructions, defensiveTactic) >
    UserCoachInstructionService.getMatrixCompatibility('TIME_WASTE', offensiveInstructions, offensiveTactic),
  'Gra na czas musi być znacznie lepiej zgodna z wolną i defensywną grą.'
);
assert.ok(
  UserCoachInstructionService.getMatrixCompatibility('CLOSE_DOWN', offensiveInstructions, offensiveTactic) > 0,
  'Doskok powinien współgrać z pressingiem i agresywną intensywnością.'
);

const firstIssue = UserCoachInstructionService.issue({
  id: 'KEEP_BALL',
  minute: 20,
  sessionSeed: 12345,
});
const repeatedIssue = UserCoachInstructionService.issue({
  id: 'KEEP_BALL',
  minute: 24,
  sessionSeed: 12345,
  previousActive: firstIssue.active,
  memory: firstIssue.memory,
});
assert.deepEqual(
  firstIssue,
  UserCoachInstructionService.issue({ id: 'KEEP_BALL', minute: 20, sessionSeed: 12345 }),
  'RNG polecenia musi być deterministyczne dla tego samego meczu i minuty.'
);
assert.equal(repeatedIssue.active.repeatCount, 1, 'Powtarzanie polecenia powinno obniżać jego skuteczność.');

const rapidChange = UserCoachInstructionService.issue({
  id: 'TAKE_RISKS',
  minute: 21,
  sessionSeed: 12345,
  previousActive: firstIssue.active,
  memory: firstIssue.memory,
});
assert.equal(rapidChange.active.confusionUntilMinute, 23, 'Szybka zmiana polecenia powinna wywoływać krótkie zamieszanie.');

const activeInstruction = (id: UserCoachInstructionId): ActiveUserCoachInstruction => ({
  id,
  issuedMinute: 70,
  startsMinute: 71,
  expiryMinute: 78,
  responseFactor: 1,
  misunderstandingRoll: 1,
  repeatCount: 0,
  confusionUntilMinute: -1,
});

const effectsAt = (
  active: ActiveUserCoachInstruction,
  minute: number,
  instructions: TacticalInstructions,
  tactic: Tactic,
  scoreDiff: number
) => UserCoachInstructionService.getEffects({
  active,
  minute,
  instructions,
  tactic,
  opponentTactic: makeTactic(),
  players: [],
  startingXI: [],
  fatigueMap: {},
  scoreDiff,
});

const inactiveBeforeStart = effectsAt(activeInstruction('ALL_FORWARD'), 70, offensiveInstructions, offensiveTactic, -1);
const activeDuringWindow = effectsAt(activeInstruction('ALL_FORWARD'), 75, offensiveInstructions, offensiveTactic, -1);
const inactiveAfterExpiry = effectsAt(activeInstruction('ALL_FORWARD'), 79, offensiveInstructions, offensiveTactic, -1);
assert.equal(inactiveBeforeStart.active, false, 'Polecenie nie może działać przed reakcją zawodników.');
assert.equal(activeDuringWindow.active, true, 'Polecenie powinno działać w swoim oknie czasowym.');
assert.equal(inactiveAfterExpiry.active, false, 'Polecenie musi wygasać bez rozrostu historii stanu.');

const coherentDropBack = effectsAt(activeInstruction('DROP_BACK'), 75, defensiveInstructions, defensiveTactic, 1);
const conflictingDropBack = effectsAt(activeInstruction('DROP_BACK'), 75, offensiveInstructions, offensiveTactic, 1);
assert.ok(
  conflictingDropBack.initiativeModifier < coherentDropBack.initiativeModifier,
  'Sprzeczne cofnięcie przy ofensywnej grze powinno mocniej oddawać inicjatywę rywalowi.'
);
assert.ok(
  conflictingDropBack.opponentShotModifier > coherentDropBack.opponentShotModifier,
  'Konflikt instrukcji powinien zwiększać szansę sytuacji przeciwnika.'
);

const latePushWhileLosing = effectsAt(activeInstruction('ALL_FORWARD'), 75, offensiveInstructions, offensiveTactic, -1);
const latePushWhileLeading = effectsAt(activeInstruction('ALL_FORWARD'), 75, offensiveInstructions, offensiveTactic, 1);
assert.ok(
  latePushWhileLosing.initiativeModifier > latePushWhileLeading.initiativeModifier,
  'Wszyscy do przodu powinno być korzystniejsze przy przegrywaniu niż przy prowadzeniu.'
);

console.log('UserCoachInstructionService tests passed.');
