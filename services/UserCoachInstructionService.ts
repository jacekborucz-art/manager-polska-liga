import {
  ActiveUserCoachInstruction,
  InstructionCounterAttack,
  InstructionIntensity,
  InstructionMarking,
  InstructionMindset,
  InstructionPassing,
  InstructionPressing,
  InstructionTempo,
  Player,
  Tactic,
  TacticalInstructions,
  UserCoachInstructionId,
  UserCoachInstructionMemory,
} from '../types';
import { getLegacyMinuteSeededValue } from './match/live/LiveMatchRandom';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const USER_COACH_INSTRUCTION_OPTIONS: Array<{ id: UserCoachInstructionId | null; label: string }> = [
  { id: null, label: 'BRAK POLECENIA' },
  { id: 'NARROW', label: 'ZAWĘŹCIE POLE' },
  { id: 'WIDE', label: 'GRAJCIE SZEROKO' },
  { id: 'CALM_DOWN', label: 'USPOKÓJCIE GRĘ' },
  { id: 'SPEED_UP', label: 'PRZYSPIESZCIE GRĘ' },
  { id: 'KEEP_BALL', label: 'SZANUJCIE PIŁKĘ' },
  { id: 'TAKE_RISKS', label: 'WIĘCEJ RYZYKA' },
  { id: 'CLOSE_DOWN', label: 'DOSKOCZCIE DO NICH' },
  { id: 'DROP_BACK', label: 'COFNIJCIE SIĘ' },
  { id: 'ALL_FORWARD', label: 'WSZYSCY DO PRZODU' },
  { id: 'TIME_WASTE', label: 'GRAJCIE NA CZAS' },
];

export const getUserCoachInstructionLabel = (id: UserCoachInstructionId | null | undefined): string =>
  USER_COACH_INSTRUCTION_OPTIONS.find(option => option.id === (id ?? null))?.label ?? 'BRAK POLECENIA';

type TacticalDimension =
  | 'mindset'
  | 'tempo'
  | 'intensity'
  | 'passing'
  | 'pressing'
  | 'counterAttack'
  | 'marking';

type CompatibilityRow = {
  mindset: Record<InstructionMindset, number>;
  tempo: Record<InstructionTempo, number>;
  intensity: Record<InstructionIntensity, number>;
  passing: Record<InstructionPassing, number>;
  pressing: Record<InstructionPressing, number>;
  counterAttack: Record<InstructionCounterAttack, number>;
  marking: Record<InstructionMarking, number>;
  weights?: Partial<Record<TacticalDimension, number>>;
};

/**
 * USER COACH INSTRUCTION COMPATIBILITY MATRIX
 * ===========================================
 *
 * Purpose
 * -------
 * A touchline instruction is not a second tactical system and must not override the tactical panel.
 * It is a short-lived request made inside the tactical framework already chosen by the player. This
 * matrix describes whether the request reinforces that framework or contradicts it. For example,
 * DROP_BACK works naturally with a defensive mindset, cautious intensity and zonal marking, while
 * the same instruction conflicts with an offensive mindset, aggressive intensity and man marking.
 * A conflict does not merely remove a bonus: it can actively help the opponent by disrupting the
 * player's structure, increasing turnovers, or surrendering initiative.
 *
 * Matrix values
 * -------------
 * Each instruction is evaluated against seven tactical dimensions:
 *
 *   mindset, tempo, intensity, passing, pressing, counterAttack and marking.
 *
 * Values normally range from -2 to +2:
 *
 *   +2  strong tactical synergy
 *   +1  useful compatibility
 *    0  mostly neutral relationship
 *   -1  noticeable contradiction
 *   -2  severe contradiction
 *
 * The optional `weights` object marks the dimensions that define the instruction most strongly.
 * TIME_WASTE therefore cares more about tempo, mindset and intensity than marking, while CLOSE_DOWN
 * is driven primarily by pressing and intensity. The weighted average is then adjusted by properties
 * of the selected formation, such as attack bias, defence bias, pressing intensity and effective
 * width. The final matrix score is clamped to [-2, 2].
 *
 * Match context
 * -------------
 * Matrix compatibility is only the tactical half of the decision. `getContextCompatibility` adds the
 * score and match-minute context as well as selected opponent characteristics. ALL_FORWARD is more
 * sensible when losing late and dangerous while protecting a lead; TIME_WASTE follows the opposite
 * pattern. Width and pressing commands also inspect the opponent's shape and build-up preferences.
 * Matrix and context are combined into `alignment`, which determines both the strength of a correctly
 * executed instruction and the probability of a misunderstanding.
 *
 * RNG and execution quality
 * -------------------------
 * Issuing a command uses deterministic match RNG. The match seed, minute, instruction and issue count
 * generate response strength, a zero-or-one-minute reaction delay, a five-to-nine-minute lifetime and
 * a misunderstanding roll. Deterministic RNG keeps replays and debugging reproducible while ensuring
 * that the same command is not equally effective every time. Execution is then scaled by relevant
 * attributes of the player's current XI and their fatigue. Repeating the same command within twelve
 * minutes has diminishing returns. Replacing an active command too quickly causes a short confusion
 * window. Only the current instruction and a small fixed-size memory are stored; no growing history is
 * added to the save or live-match state.
 *
 * Runtime effects
 * ---------------
 * `BASE_EFFECTS` defines the intended football trade-off before compatibility is applied. The final
 * output can modify initiative, the player's shot creation, the opponent's shot creation, player-team
 * turnover risk, fatigue, fouls and injuries. Negative alignment and misunderstanding add explicit
 * conflict penalties. Every output is capped so a touchline instruction remains a temporary influence
 * and can never dominate player quality, the main tactic or the rest of the match engine.
 *
 * Runtime ownership
 * -----------------
 * The historical `User` name is retained for save compatibility, but the matrix and effect evaluator
 * are now shared by both coaches. Human commands are issued by the panel handler, while AI selection is
 * owned by AiCoachCommandService. Each coach receives only its own lineup, players, fatigue, tactics and
 * private active-command state. MatchLiveView then applies the result behind an explicit side guard, so
 * the AI can never read, reuse or amplify the human command state. Emotional shouts remain a separate
 * matrix and lifecycle even though they follow the same ownership rule.
 */
const COMPATIBILITY_MATRIX: Record<UserCoachInstructionId, CompatibilityRow> = {
  NARROW: {
    mindset: { DEFENSIVE: 1, NEUTRAL: 1, OFFENSIVE: -1 },
    tempo: { SLOW: 1, NORMAL: 0, FAST: -1 },
    intensity: { CAUTIOUS: 1, NORMAL: 0, AGGRESSIVE: 0 },
    passing: { SHORT: 1, MIXED: 0, LONG: -1 },
    pressing: { NORMAL: 0, PRESSING: 1 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 2, MAN: -1 },
    weights: { marking: 1.6, mindset: 1.2 },
  },
  WIDE: {
    mindset: { DEFENSIVE: 0, NEUTRAL: 1, OFFENSIVE: 1 },
    tempo: { SLOW: 0, NORMAL: 1, FAST: 1 },
    intensity: { CAUTIOUS: 0, NORMAL: 1, AGGRESSIVE: 1 },
    passing: { SHORT: 0, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: 0, PRESSING: 0 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { passing: 1.4, mindset: 1.2 },
  },
  CALM_DOWN: {
    mindset: { DEFENSIVE: 1, NEUTRAL: 2, OFFENSIVE: -1 },
    tempo: { SLOW: 2, NORMAL: 1, FAST: -2 },
    intensity: { CAUTIOUS: 2, NORMAL: 1, AGGRESSIVE: -2 },
    passing: { SHORT: 2, MIXED: 1, LONG: -1 },
    pressing: { NORMAL: 1, PRESSING: -2 },
    counterAttack: { NORMAL: 1, COUNTER: -1 },
    marking: { NONE: 0, ZONE: 1, MAN: -1 },
    weights: { tempo: 2, intensity: 1.6, passing: 1.3 },
  },
  SPEED_UP: {
    mindset: { DEFENSIVE: -1, NEUTRAL: 1, OFFENSIVE: 2 },
    tempo: { SLOW: -2, NORMAL: 1, FAST: 2 },
    intensity: { CAUTIOUS: -1, NORMAL: 1, AGGRESSIVE: 1 },
    passing: { SHORT: 0, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: 0, PRESSING: 1 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { tempo: 2, mindset: 1.4 },
  },
  KEEP_BALL: {
    mindset: { DEFENSIVE: 1, NEUTRAL: 2, OFFENSIVE: 0 },
    tempo: { SLOW: 1, NORMAL: 1, FAST: -2 },
    intensity: { CAUTIOUS: 1, NORMAL: 1, AGGRESSIVE: -1 },
    passing: { SHORT: 2, MIXED: 1, LONG: -2 },
    pressing: { NORMAL: 0, PRESSING: 0 },
    counterAttack: { NORMAL: 1, COUNTER: -2 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { passing: 2, tempo: 1.5, counterAttack: 1.4 },
  },
  TAKE_RISKS: {
    mindset: { DEFENSIVE: -2, NEUTRAL: 1, OFFENSIVE: 2 },
    tempo: { SLOW: -1, NORMAL: 1, FAST: 1 },
    intensity: { CAUTIOUS: -2, NORMAL: 1, AGGRESSIVE: 2 },
    passing: { SHORT: 0, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: 0, PRESSING: 1 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { mindset: 1.8, intensity: 1.5 },
  },
  CLOSE_DOWN: {
    mindset: { DEFENSIVE: -1, NEUTRAL: 1, OFFENSIVE: 1 },
    tempo: { SLOW: -1, NORMAL: 0, FAST: 1 },
    intensity: { CAUTIOUS: -2, NORMAL: 0, AGGRESSIVE: 2 },
    passing: { SHORT: 0, MIXED: 0, LONG: 0 },
    pressing: { NORMAL: -2, PRESSING: 2 },
    counterAttack: { NORMAL: 0, COUNTER: -2 },
    marking: { NONE: 0, ZONE: 0, MAN: 1 },
    weights: { pressing: 2, intensity: 1.6, counterAttack: 1.5 },
  },
  DROP_BACK: {
    mindset: { DEFENSIVE: 2, NEUTRAL: 1, OFFENSIVE: -2 },
    tempo: { SLOW: 1, NORMAL: 0, FAST: -1 },
    intensity: { CAUTIOUS: 1, NORMAL: 0, AGGRESSIVE: -2 },
    passing: { SHORT: -1, MIXED: 0, LONG: 1 },
    pressing: { NORMAL: 1, PRESSING: -2 },
    counterAttack: { NORMAL: 0, COUNTER: 2 },
    marking: { NONE: 0, ZONE: 2, MAN: -2 },
    weights: { mindset: 2, pressing: 1.6, counterAttack: 1.5, marking: 1.4 },
  },
  ALL_FORWARD: {
    mindset: { DEFENSIVE: -2, NEUTRAL: -1, OFFENSIVE: 2 },
    tempo: { SLOW: -2, NORMAL: 1, FAST: 2 },
    intensity: { CAUTIOUS: -2, NORMAL: 1, AGGRESSIVE: 2 },
    passing: { SHORT: -1, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: -1, PRESSING: 1 },
    counterAttack: { NORMAL: 1, COUNTER: -2 },
    marking: { NONE: 0, ZONE: -1, MAN: -1 },
    weights: { mindset: 2, tempo: 1.6, intensity: 1.4 },
  },
  TIME_WASTE: {
    mindset: { DEFENSIVE: 2, NEUTRAL: 1, OFFENSIVE: -2 },
    tempo: { SLOW: 2, NORMAL: -1, FAST: -2 },
    intensity: { CAUTIOUS: 2, NORMAL: 0, AGGRESSIVE: -2 },
    passing: { SHORT: 1, MIXED: 0, LONG: -1 },
    pressing: { NORMAL: 1, PRESSING: -2 },
    counterAttack: { NORMAL: 1, COUNTER: -1 },
    marking: { NONE: 0, ZONE: 1, MAN: -1 },
    weights: { tempo: 2, mindset: 1.7, intensity: 1.5, pressing: 1.5 },
  },
};

type BaseEffect = {
  initiativeModifier: number;
  userShotModifier: number;
  opponentShotModifier: number;
  turnoverRiskModifier: number;
  fatigueExtra: number;
  foulMultiplier: number;
  injuryMultiplier: number;
};

const BASE_EFFECTS: Record<UserCoachInstructionId, BaseEffect> = {
  NARROW:      { initiativeModifier: -0.003, userShotModifier: -0.001, opponentShotModifier: -0.0045, turnoverRiskModifier: -0.005, fatigueExtra: 0.003, foulMultiplier: 1.01, injuryMultiplier: 1.00 },
  WIDE:        { initiativeModifier:  0.009, userShotModifier:  0.004, opponentShotModifier:  0.0020, turnoverRiskModifier:  0.018, fatigueExtra: 0.005, foulMultiplier: 1.00, injuryMultiplier: 1.01 },
  CALM_DOWN:   { initiativeModifier: -0.012, userShotModifier: -0.003, opponentShotModifier: -0.0020, turnoverRiskModifier: -0.055, fatigueExtra: -0.010, foulMultiplier: 0.94, injuryMultiplier: 0.96 },
  SPEED_UP:    { initiativeModifier:  0.016, userShotModifier:  0.005, opponentShotModifier:  0.0030, turnoverRiskModifier:  0.050, fatigueExtra: 0.018, foulMultiplier: 1.02, injuryMultiplier: 1.04 },
  KEEP_BALL:   { initiativeModifier:  0.004, userShotModifier: -0.002, opponentShotModifier: -0.0030, turnoverRiskModifier: -0.070, fatigueExtra: -0.004, foulMultiplier: 0.98, injuryMultiplier: 0.98 },
  TAKE_RISKS:  { initiativeModifier:  0.018, userShotModifier:  0.007, opponentShotModifier:  0.0060, turnoverRiskModifier:  0.075, fatigueExtra: 0.009, foulMultiplier: 1.04, injuryMultiplier: 1.03 },
  CLOSE_DOWN:  { initiativeModifier:  0.017, userShotModifier:  0.004, opponentShotModifier: -0.0030, turnoverRiskModifier:  0.010, fatigueExtra: 0.027, foulMultiplier: 1.12, injuryMultiplier: 1.08 },
  DROP_BACK:   { initiativeModifier: -0.026, userShotModifier: -0.005, opponentShotModifier: -0.0065, turnoverRiskModifier:  0.005, fatigueExtra: -0.006, foulMultiplier: 0.96, injuryMultiplier: 0.98 },
  ALL_FORWARD: { initiativeModifier:  0.036, userShotModifier:  0.009, opponentShotModifier:  0.0150, turnoverRiskModifier:  0.085, fatigueExtra: 0.026, foulMultiplier: 1.06, injuryMultiplier: 1.09 },
  TIME_WASTE:  { initiativeModifier: -0.027, userShotModifier: -0.006, opponentShotModifier: -0.0040, turnoverRiskModifier: -0.035, fatigueExtra: -0.009, foulMultiplier: 1.06, injuryMultiplier: 0.97 },
};

const getTacticWidth = (tactic: Tactic): number => {
  const advancedSlots = tactic.slots.filter(slot => slot.role !== 'GK' && slot.y <= 0.65);
  if (advancedSlots.length === 0) return 0.5;
  return advancedSlots.reduce((sum, slot) => sum + Math.abs(slot.x - 0.5) * 2, 0) / advancedSlots.length;
};

const getMatrixCompatibility = (
  id: UserCoachInstructionId,
  instructions: TacticalInstructions,
  tactic: Tactic
): number => {
  const row = COMPATIBILITY_MATRIX[id];
  const values: Array<[TacticalDimension, number]> = [
    ['mindset', row.mindset[instructions.mindset]],
    ['tempo', row.tempo[instructions.tempo]],
    ['intensity', row.intensity[instructions.intensity]],
    ['passing', row.passing[instructions.passing]],
    ['pressing', row.pressing[instructions.pressing]],
    ['counterAttack', row.counterAttack[instructions.counterAttack ?? 'NORMAL']],
    ['marking', row.marking[instructions.marking ?? 'NONE']],
  ];
  let weightedScore = 0;
  let totalWeight = 0;
  values.forEach(([dimension, value]) => {
    const weight = row.weights?.[dimension] ?? 1;
    weightedScore += value * weight;
    totalWeight += weight;
  });

  let formationAdjustment = 0;
  if (['DROP_BACK', 'TIME_WASTE', 'NARROW'].includes(id) && tactic.attackBias >= 72) formationAdjustment -= 0.45;
  if (['ALL_FORWARD', 'TAKE_RISKS', 'SPEED_UP'].includes(id) && tactic.defenseBias >= 75) formationAdjustment -= 0.50;
  if (id === 'CLOSE_DOWN' && tactic.pressingIntensity >= 70) formationAdjustment += 0.30;
  if (id === 'CLOSE_DOWN' && tactic.pressingIntensity <= 35) formationAdjustment -= 0.35;
  if (id === 'WIDE') formationAdjustment += getTacticWidth(tactic) >= 0.58 ? 0.30 : -0.30;
  if (id === 'NARROW') formationAdjustment += getTacticWidth(tactic) <= 0.46 ? 0.25 : 0;

  return clamp(weightedScore / Math.max(1, totalWeight) + formationAdjustment, -2, 2);
};

const getContextCompatibility = ({
  id,
  minute,
  scoreDiff,
  opponentTactic,
  opponentTempo,
  opponentPassing,
}: {
  id: UserCoachInstructionId;
  minute: number;
  scoreDiff: number;
  opponentTactic: Tactic;
  opponentTempo: InstructionTempo;
  opponentPassing: InstructionPassing;
}): number => {
  let score = 0;
  const late = minute >= 70;
  const veryLate = minute >= 80;

  if (id === 'ALL_FORWARD') {
    if (scoreDiff < 0 && late) score += veryLate ? 1.25 : 0.85;
    if (scoreDiff === 0) score -= veryLate ? 0.25 : 0.65;
    if (scoreDiff > 0) score -= late ? 1.50 : 1.00;
  }
  if (id === 'TIME_WASTE') {
    if (scoreDiff > 0 && minute >= 65) score += veryLate ? 1.25 : 0.80;
    if (scoreDiff <= 0) score -= scoreDiff < 0 ? 1.50 : 0.65;
    if (minute < 55) score -= 0.45;
  }
  if (id === 'DROP_BACK') {
    if (scoreDiff > 0 && minute >= 60) score += 0.75;
    if (scoreDiff < 0 && late) score -= 1.10;
  }
  if (id === 'CALM_DOWN' || id === 'KEEP_BALL') {
    if (scoreDiff > 0 && minute >= 55) score += 0.55;
    if (scoreDiff < 0 && veryLate) score -= 0.75;
  }
  if (id === 'SPEED_UP' || id === 'TAKE_RISKS') {
    if (scoreDiff < 0 && minute >= 55) score += 0.65;
    if (scoreDiff > 0 && late) score -= 0.70;
  }
  if (id === 'WIDE') {
    if (opponentTactic.defenseBias >= 72) score += 0.45;
    if (getTacticWidth(opponentTactic) >= 0.62) score -= 0.25;
  }
  if (id === 'NARROW') {
    if (getTacticWidth(opponentTactic) <= 0.46 || opponentPassing === 'SHORT') score += 0.35;
    if (getTacticWidth(opponentTactic) >= 0.62 || opponentPassing === 'LONG') score -= 0.45;
  }
  if (id === 'CLOSE_DOWN') {
    if (opponentTempo === 'SLOW' || opponentPassing === 'SHORT') score += 0.35;
    if (opponentTempo === 'FAST' && opponentPassing === 'LONG') score -= 0.35;
  }

  return clamp(score, -1.5, 1.25);
};

const getActivePlayers = (players: Player[], startingXI: (string | null)[]) => {
  const ids = new Set(startingXI.filter((id): id is string => id !== null));
  return players.filter(player => ids.has(player.id));
};

const getExecutionFactor = (
  id: UserCoachInstructionId,
  players: Player[],
  startingXI: (string | null)[],
  fatigueMap: Record<string, number>
): { factor: number; averageFatigue: number } => {
  const activePlayers = getActivePlayers(players, startingXI);
  if (activePlayers.length === 0) return { factor: 0.82, averageFatigue: 55 };

  const attributeWeights: Record<UserCoachInstructionId, Partial<Record<keyof Player['attributes'], number>>> = {
    NARROW: { positioning: 0.38, mentality: 0.32, workRate: 0.30 },
    WIDE: { pace: 0.30, workRate: 0.24, passing: 0.22, vision: 0.14, mentality: 0.10 },
    CALM_DOWN: { mentality: 0.32, passing: 0.26, technique: 0.24, vision: 0.18 },
    SPEED_UP: { technique: 0.28, mentality: 0.24, pace: 0.20, workRate: 0.16, stamina: 0.12 },
    KEEP_BALL: { passing: 0.32, technique: 0.28, vision: 0.24, mentality: 0.16 },
    TAKE_RISKS: { vision: 0.30, technique: 0.25, mentality: 0.25, passing: 0.20 },
    CLOSE_DOWN: { workRate: 0.30, stamina: 0.26, aggression: 0.18, pace: 0.16, mentality: 0.10 },
    DROP_BACK: { positioning: 0.38, defending: 0.28, mentality: 0.22, workRate: 0.12 },
    ALL_FORWARD: { attacking: 0.30, stamina: 0.24, workRate: 0.22, mentality: 0.14, pace: 0.10 },
    TIME_WASTE: { mentality: 0.36, passing: 0.26, technique: 0.22, vision: 0.16 },
  };
  const entries = Object.entries(attributeWeights[id]) as Array<[keyof Player['attributes'], number]>;
  const quality = activePlayers.reduce((teamSum, player) => (
    teamSum + entries.reduce((sum, [key, weight]) => sum + player.attributes[key] * weight, 0)
  ), 0) / activePlayers.length;
  const averageFatigue = activePlayers.reduce((sum, player) => sum + (fatigueMap[player.id] ?? 100), 0) / activePlayers.length;
  let factor = clamp(0.82 + ((quality - 50) / 50) * 0.28, 0.74, 1.16);
  if (['SPEED_UP', 'CLOSE_DOWN', 'TAKE_RISKS', 'ALL_FORWARD'].includes(id) && averageFatigue < 68) {
    factor *= clamp(0.72 + averageFatigue / 240, 0.72, 1);
  }
  return { factor: clamp(factor, 0.68, 1.16), averageFatigue };
};

export interface UserCoachInstructionEffects extends BaseEffect {
  active: boolean;
  alignment: number;
  misunderstood: boolean;
  label: string;
}

const INACTIVE_EFFECTS: UserCoachInstructionEffects = {
  active: false,
  alignment: 0,
  misunderstood: false,
  label: 'BRAK POLECENIA',
  initiativeModifier: 0,
  userShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 1,
  injuryMultiplier: 1,
};

/**
 * Public lifecycle used by the live match:
 *
 * 1. `issue` converts a menu selection into a compact active command. It decides when the players
 *    react, when the command expires, how strongly they respond, and whether recent commands create
 *    repetition or confusion penalties.
 * 2. `getEffects` is called once per simulated minute. It returns neutral multipliers before the
 *    reaction minute and after expiry. During the active window it combines the matrix, match context,
 *    seeded RNG, XI attributes, fatigue, repetition and confusion.
 * 3. MatchLiveView applies each result only to the side that owns the supplied command state. For the
 *    human side, selecting BRAK POLECENIA clears the active command immediately; natural expiry clears
 *    either coach's command on the next minute tick.
 */
export const UserCoachInstructionService = {
  issue: ({
    id,
    minute,
    sessionSeed,
    previousActive,
    memory,
  }: {
    id: UserCoachInstructionId;
    minute: number;
    sessionSeed: number;
    previousActive?: ActiveUserCoachInstruction | null;
    memory?: UserCoachInstructionMemory;
  }): { active: ActiveUserCoachInstruction; memory: UserCoachInstructionMemory } => {
    const issueCount = (memory?.issueCount ?? 0) + 1;
    const optionIndex = Math.max(0, USER_COACH_INSTRUCTION_OPTIONS.findIndex(option => option.id === id));
    const streamOffset = 12100 + optionIndex * 41 + issueCount * 7;
    const responseFactor = Number((0.70 + getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset) * 0.55).toFixed(3));
    const delay = getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset + 1) < 0.25 ? 1 : 0;
    const duration = 5 + Math.floor(getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset + 2) * 5);
    const recentRepeat = memory?.lastId === id && minute - memory.lastIssuedMinute <= 12;
    const repeatCount = recentRepeat ? Math.min(3, (memory?.repeatCount ?? 0) + 1) : 0;
    const rapidOppositeChange = Boolean(
      previousActive && previousActive.id !== id && minute - previousActive.issuedMinute < 3
    );
    const startsMinute = minute + 1 + delay;
    const active: ActiveUserCoachInstruction = {
      id,
      issuedMinute: minute,
      startsMinute,
      expiryMinute: startsMinute + duration - 1,
      responseFactor,
      misunderstandingRoll: getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset + 3),
      repeatCount,
      confusionUntilMinute: rapidOppositeChange ? minute + 2 : -1,
    };
    return {
      active,
      memory: { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount },
    };
  },

  getEffects: ({
    active,
    minute,
    instructions,
    tactic,
    opponentTactic,
    players,
    startingXI,
    fatigueMap,
    scoreDiff,
    opponentTempo = 'NORMAL',
    opponentPassing = 'MIXED',
  }: {
    active?: ActiveUserCoachInstruction | null;
    minute: number;
    instructions: TacticalInstructions;
    tactic: Tactic;
    opponentTactic: Tactic;
    players: Player[];
    startingXI: (string | null)[];
    fatigueMap: Record<string, number>;
    scoreDiff: number;
    opponentTempo?: InstructionTempo;
    opponentPassing?: InstructionPassing;
  }): UserCoachInstructionEffects => {
    if (!active || minute < active.startsMinute || minute > active.expiryMinute) return INACTIVE_EFFECTS;

    const matrixCompatibility = getMatrixCompatibility(active.id, instructions, tactic);
    const contextCompatibility = getContextCompatibility({
      id: active.id,
      minute,
      scoreDiff,
      opponentTactic,
      opponentTempo,
      opponentPassing,
    });
    const alignment = clamp(matrixCompatibility * 0.72 + contextCompatibility * 0.62, -2, 2);
    const { factor: executionFactor, averageFatigue } = getExecutionFactor(
      active.id, players, startingXI, fatigueMap
    );
    const misunderstandingChance = clamp(0.08 - alignment * 0.10, 0.03, 0.34);
    const isConfused = minute <= active.confusionUntilMinute;
    const misunderstood = isConfused || active.misunderstandingRoll < misunderstandingChance;
    const repeatFactor = Math.max(0.55, 1 - active.repeatCount * 0.15);
    let strength = active.responseFactor * executionFactor * repeatFactor * (
      0.72 + Math.max(0, alignment) * 0.18 - Math.max(0, -alignment) * 0.20
    );
    if (misunderstood) strength *= 0.30;
    strength = clamp(strength, 0.18, 1.45);

    const conflict = Math.max(0, -alignment) + (misunderstood ? 0.75 : 0) + (isConfused ? 0.35 : 0);
    const base = BASE_EFFECTS[active.id];
    const fatigueFailure = ['SPEED_UP', 'CLOSE_DOWN', 'TAKE_RISKS', 'ALL_FORWARD'].includes(active.id)
      ? clamp((65 - averageFatigue) / 35, 0, 1)
      : 0;

    return {
      active: true,
      alignment,
      misunderstood,
      label: getUserCoachInstructionLabel(active.id),
      initiativeModifier: clamp(base.initiativeModifier * strength - conflict * 0.014, -0.055, 0.050),
      userShotModifier: clamp(base.userShotModifier * strength - conflict * 0.0025, -0.014, 0.012),
      opponentShotModifier: clamp(base.opponentShotModifier * strength + conflict * 0.004 + fatigueFailure * 0.003, -0.010, 0.022),
      turnoverRiskModifier: clamp(base.turnoverRiskModifier * strength + conflict * 0.030 + fatigueFailure * 0.020, -0.10, 0.16),
      fatigueExtra: clamp(base.fatigueExtra * strength + conflict * 0.006 + fatigueFailure * 0.010, -0.014, 0.055),
      foulMultiplier: clamp(1 + (base.foulMultiplier - 1) * strength + conflict * 0.04, 0.90, 1.35),
      injuryMultiplier: clamp(1 + (base.injuryMultiplier - 1) * strength + conflict * 0.025 + fatigueFailure * 0.04, 0.92, 1.30),
    };
  },

  getMatrixCompatibility,
  getSelectionAlignment: ({
    id,
    instructions,
    tactic,
    opponentTactic,
    minute,
    scoreDiff,
    opponentTempo = 'NORMAL',
    opponentPassing = 'MIXED',
  }: {
    id: UserCoachInstructionId;
    instructions: TacticalInstructions;
    tactic: Tactic;
    opponentTactic: Tactic;
    minute: number;
    scoreDiff: number;
    opponentTempo?: InstructionTempo;
    opponentPassing?: InstructionPassing;
  }): number => clamp(
    getMatrixCompatibility(id, instructions, tactic) * 0.72 +
      getContextCompatibility({ id, minute, scoreDiff, opponentTactic, opponentTempo, opponentPassing }) * 0.62,
    -2,
    2
  ),
};
