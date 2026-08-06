import {
  ActiveUserCoachShout,
  Player,
  PlayerMoralePersonality,
  UserCoachShoutContextCategory,
  UserCoachShoutId,
  UserCoachShoutMemory,
  UserCoachShoutMentalState,
  UserCoachShoutRngState,
} from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const USER_COACH_SHOUT_OPTIONS: Array<{ id: UserCoachShoutId | null; label: string }> = [
  { id: null, label: 'BRAK POLECENIA' },
  { id: 'MOTIVATE', label: 'ZMOTYWUJ' },
  { id: 'PRAISE', label: 'POCHWAL' },
  { id: 'FOCUS', label: 'SKUPCIE SIĘ' },
  { id: 'NO_PANIC', label: 'BEZ PANIKI' },
  { id: 'MORE_EFFORT', label: 'WIĘCEJ ZAANGAŻOWANIA' },
  { id: 'CALM_EMOTIONS', label: 'OPANUJCIE EMOCJE' },
  { id: 'DO_BETTER', label: 'STAĆ WAS NA WIĘCEJ' },
  { id: 'DONT_GIVE_UP', label: 'NIE ODPUSZCZAJCIE' },
];

export const getUserCoachShoutLabel = (id: UserCoachShoutId | null | undefined): string =>
  USER_COACH_SHOUT_OPTIONS.find(option => option.id === (id ?? null))?.label ?? 'BRAK POLECENIA';

/**
 * USER COACH SHOUT MATRIX AND INDEPENDENT EMOTIONAL RNG
 * =====================================================
 *
 * Design boundary
 * ---------------
 * Shouts are short psychological interventions, not tactical instructions. They never change the
 * selected formation, tempo, passing style, marking, pressing or mentality setting. Their output is
 * deliberately smaller than the tactical instruction output. The historical `User` name is retained
 * for save compatibility, but both coaches use this pure matrix evaluator with completely separate
 * active state, memory and entropy. AiCoachCommandService owns AI selection; MatchLiveView supplies only
 * the owning side's data and applies every result behind an explicit side guard. Consequently the AI
 * never reads or reuses the human shout state or its RNG stream.
 *
 * Two-layer matrix
 * ----------------
 * Every shout is evaluated twice. CONTEXT_MATRIX measures whether it makes sense for the scoreboard
 * and recent match story. MENTAL_MATRIX measures whether it suits the team's dominant emotional state.
 * Both matrices use the same scale: +2 is a strong fit, +1 is helpful, 0 is neutral, -1 is risky and
 * -2 is actively inappropriate. Context contributes 55% and mental state contributes 45% to the base
 * alignment. This keeps a shout situational: praising a comfortable lead is useful, praising a team
 * that is playing badly while losing is not, and demanding more from an exhausted or nervous team can
 * backfire even when the score alone appears to justify it.
 *
 * Independent RNG
 * ---------------
 * This service never receives or imports the main match seed. `createRngState` obtains hidden entropy
 * from `crypto.getRandomValues` and creates a dedicated stateful xorshift stream. Issuing a shout
 * advances that stream and stores only two opaque response seeds in the active shout. Therefore minute,
 * score and shout ID are insufficient to predict a reaction. Saving the three-number RNG state prevents
 * reloads from rerolling an already issued shout while keeping the result unknowable beforehand.
 *
 * Player-level variation and the "bad day" effect
 * -----------------------------------------------
 * A stable match-day bias is derived from the private emotional entropy and player ID. Most players are
 * close to neutral, but small tails represent unusually good or bad mental days. A separate per-shout
 * roll is mixed with personality, morale, mentality, fatigue, cards and current contribution. Finally,
 * a rare unexpected-reaction roll can invert an otherwise logical response. High mentality and suitable
 * personalities reduce this probability; fatigue, low morale, nervousness and frustration increase it.
 * The same player can consequently react differently from teammates without the engine storing an array
 * of response history.
 *
 * Fixed-size save state
 * ---------------------
 * Only one active shout, a compact repetition memory and the RNG state are stored. Per-player match-day
 * disposition and response are recomputed from opaque seeds, so save size does not grow with minutes,
 * players, seasons or the number of past shouts.
 */

const CONTEXT_MATRIX: Record<UserCoachShoutId, Record<UserCoachShoutContextCategory, number>> = {
  MOTIVATE:       { LOSING_POORLY: 2, LOSING_WELL: 1, EVEN_MATCH: 1, LEADING_NARROWLY: 0, LEADING_COMFORTABLY: -1, JUST_CONCEDED: 1, JUST_SCORED: 0 },
  PRAISE:         { LOSING_POORLY: -2, LOSING_WELL: 1, EVEN_MATCH: 0, LEADING_NARROWLY: 1, LEADING_COMFORTABLY: 2, JUST_CONCEDED: -1, JUST_SCORED: 2 },
  FOCUS:          { LOSING_POORLY: 1, LOSING_WELL: 0, EVEN_MATCH: 1, LEADING_NARROWLY: 2, LEADING_COMFORTABLY: 1, JUST_CONCEDED: 2, JUST_SCORED: 1 },
  NO_PANIC:       { LOSING_POORLY: 1, LOSING_WELL: 2, EVEN_MATCH: 1, LEADING_NARROWLY: 2, LEADING_COMFORTABLY: 0, JUST_CONCEDED: 2, JUST_SCORED: 0 },
  MORE_EFFORT:    { LOSING_POORLY: 2, LOSING_WELL: 0, EVEN_MATCH: 1, LEADING_NARROWLY: 0, LEADING_COMFORTABLY: -1, JUST_CONCEDED: 1, JUST_SCORED: -1 },
  CALM_EMOTIONS:  { LOSING_POORLY: 0, LOSING_WELL: 0, EVEN_MATCH: 0, LEADING_NARROWLY: 1, LEADING_COMFORTABLY: 0, JUST_CONCEDED: 1, JUST_SCORED: 0 },
  DO_BETTER:      { LOSING_POORLY: 2, LOSING_WELL: -1, EVEN_MATCH: 1, LEADING_NARROWLY: -1, LEADING_COMFORTABLY: -2, JUST_CONCEDED: 1, JUST_SCORED: -1 },
  DONT_GIVE_UP:   { LOSING_POORLY: 2, LOSING_WELL: 2, EVEN_MATCH: 1, LEADING_NARROWLY: 1, LEADING_COMFORTABLY: -1, JUST_CONCEDED: 2, JUST_SCORED: 1 },
};

const MENTAL_MATRIX: Record<UserCoachShoutId, Record<UserCoachShoutMentalState, number>> = {
  MOTIVATE:       { FLAT: 2, NERVOUS: 1, FRUSTRATED: 1, FOCUSED: 0, CONFIDENT: 0, COMPLACENT: 1, EXHAUSTED: -1 },
  PRAISE:         { FLAT: 1, NERVOUS: 1, FRUSTRATED: -1, FOCUSED: 1, CONFIDENT: 2, COMPLACENT: -2, EXHAUSTED: 0 },
  FOCUS:          { FLAT: 1, NERVOUS: 1, FRUSTRATED: 1, FOCUSED: 0, CONFIDENT: 0, COMPLACENT: 2, EXHAUSTED: -1 },
  NO_PANIC:       { FLAT: 0, NERVOUS: 2, FRUSTRATED: 1, FOCUSED: 0, CONFIDENT: -1, COMPLACENT: -1, EXHAUSTED: 1 },
  MORE_EFFORT:    { FLAT: 2, NERVOUS: -1, FRUSTRATED: 1, FOCUSED: 1, CONFIDENT: 0, COMPLACENT: 2, EXHAUSTED: -2 },
  CALM_EMOTIONS:  { FLAT: -1, NERVOUS: 2, FRUSTRATED: 2, FOCUSED: 0, CONFIDENT: -1, COMPLACENT: -1, EXHAUSTED: 0 },
  DO_BETTER:      { FLAT: 2, NERVOUS: -2, FRUSTRATED: -1, FOCUSED: -1, CONFIDENT: 0, COMPLACENT: 2, EXHAUSTED: -2 },
  DONT_GIVE_UP:   { FLAT: 2, NERVOUS: 1, FRUSTRATED: 2, FOCUSED: 1, CONFIDENT: 0, COMPLACENT: 1, EXHAUSTED: -1 },
};

type ShoutBaseEffect = {
  initiativeModifier: number;
  userShotModifier: number;
  opponentShotModifier: number;
  turnoverRiskModifier: number;
  fatigueExtra: number;
  foulMultiplier: number;
  injuryMultiplier: number;
};

const BASE_EFFECTS: Record<UserCoachShoutId, ShoutBaseEffect> = {
  MOTIVATE:      { initiativeModifier: 0.012, userShotModifier: 0.003, opponentShotModifier: 0.001, turnoverRiskModifier: -0.008, fatigueExtra: 0.005, foulMultiplier: 1.01, injuryMultiplier: 1.01 },
  PRAISE:        { initiativeModifier: 0.008, userShotModifier: 0.004, opponentShotModifier: 0.001, turnoverRiskModifier: -0.012, fatigueExtra: 0.001, foulMultiplier: 0.98, injuryMultiplier: 1.00 },
  FOCUS:         { initiativeModifier: 0.003, userShotModifier: 0.002, opponentShotModifier: -0.004, turnoverRiskModifier: -0.035, fatigueExtra: 0.001, foulMultiplier: 0.96, injuryMultiplier: 0.99 },
  NO_PANIC:      { initiativeModifier: -0.002, userShotModifier: 0.001, opponentShotModifier: -0.003, turnoverRiskModifier: -0.045, fatigueExtra: -0.004, foulMultiplier: 0.94, injuryMultiplier: 0.97 },
  MORE_EFFORT:   { initiativeModifier: 0.020, userShotModifier: 0.005, opponentShotModifier: -0.002, turnoverRiskModifier: 0.012, fatigueExtra: 0.018, foulMultiplier: 1.10, injuryMultiplier: 1.06 },
  CALM_EMOTIONS: { initiativeModifier: -0.005, userShotModifier: 0.001, opponentShotModifier: -0.002, turnoverRiskModifier: -0.025, fatigueExtra: -0.004, foulMultiplier: 0.88, injuryMultiplier: 0.98 },
  DO_BETTER:     { initiativeModifier: 0.016, userShotModifier: 0.005, opponentShotModifier: 0.003, turnoverRiskModifier: 0.018, fatigueExtra: 0.010, foulMultiplier: 1.04, injuryMultiplier: 1.03 },
  DONT_GIVE_UP:  { initiativeModifier: 0.021, userShotModifier: 0.006, opponentShotModifier: 0.004, turnoverRiskModifier: 0.020, fatigueExtra: 0.016, foulMultiplier: 1.06, injuryMultiplier: 1.05 },
};

const mix32 = (value: number): number => {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x45d9f3b);
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x45d9f3b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
};

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const unitFrom = (value: number): number => mix32(value) / 4294967296;

const nextStreamValue = (state: UserCoachShoutRngState): { value: number; state: UserCoachShoutRngState } => {
  let next = state.streamState >>> 0;
  if (next === 0) next = 0x6d2b79f5;
  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  next >>>= 0;
  return {
    value: next / 4294967296,
    state: { ...state, streamState: next, drawCount: state.drawCount + 1 },
  };
};

const secureUint32 = (): number => {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] >>> 0;
  }
  return mix32((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
};

export type UserCoachShoutSituation = {
  scoreDiff: number;
  shotDiff: number;
  shotsOnTargetDiff: number;
  userMomentum: number;
  recentlyScored: boolean;
  recentlyConceded: boolean;
  averageFatigue: number;
  averageMorale: number;
  yellowCardCount: number;
};

const getContextCategory = (situation: UserCoachShoutSituation): UserCoachShoutContextCategory => {
  if (situation.recentlyConceded) return 'JUST_CONCEDED';
  if (situation.recentlyScored) return 'JUST_SCORED';
  if (situation.scoreDiff < 0) {
    const performance = situation.shotDiff * 0.30 + situation.shotsOnTargetDiff * 0.55 + situation.userMomentum / 35;
    return performance >= 0 ? 'LOSING_WELL' : 'LOSING_POORLY';
  }
  if (situation.scoreDiff === 0) return 'EVEN_MATCH';
  return situation.scoreDiff === 1 ? 'LEADING_NARROWLY' : 'LEADING_COMFORTABLY';
};

const getMentalState = (situation: UserCoachShoutSituation): UserCoachShoutMentalState => {
  if (situation.averageFatigue < 64) return 'EXHAUSTED';
  if (situation.scoreDiff >= 2 && situation.shotDiff >= 4 && situation.userMomentum >= 22) return 'COMPLACENT';
  if (situation.recentlyScored || situation.userMomentum >= 32) return 'CONFIDENT';
  if (situation.recentlyConceded || (situation.scoreDiff <= 0 && situation.userMomentum <= -28)) return 'NERVOUS';
  if (situation.yellowCardCount >= 3 || (situation.scoreDiff < 0 && situation.shotDiff >= 3)) return 'FRUSTRATED';
  if (situation.userMomentum <= -18 || situation.averageMorale < 38) return 'FLAT';
  return 'FOCUSED';
};

const getPersonalityAdjustment = (id: UserCoachShoutId, personality: PlayerMoralePersonality): number => {
  const adjustments: Partial<Record<UserCoachShoutId, Partial<Record<PlayerMoralePersonality, number>>>> = {
    MOTIVATE: { AMBITIOUS: 0.25, CONFIDENT: 0.18, PROFESSIONAL: 0.12, NERVOUS: -0.12 },
    PRAISE: { CONFIDENT: 0.24, EGOIST: 0.22, SENSITIVE: 0.15, AMBITIOUS: -0.08 },
    FOCUS: { PROFESSIONAL: 0.24, CALM: 0.18, EGOIST: -0.16 },
    NO_PANIC: { NERVOUS: 0.25, SENSITIVE: 0.22, CALM: 0.14, EGOIST: -0.12 },
    MORE_EFFORT: { AMBITIOUS: 0.28, PROFESSIONAL: 0.24, NERVOUS: -0.24, SENSITIVE: -0.16 },
    CALM_EMOTIONS: { CALM: 0.24, PROFESSIONAL: 0.15, EGOIST: -0.18, AMBITIOUS: -0.10 },
    DO_BETTER: { AMBITIOUS: 0.30, PROFESSIONAL: 0.25, SENSITIVE: -0.35, NERVOUS: -0.38, EGOIST: -0.20 },
    DONT_GIVE_UP: { AMBITIOUS: 0.28, LOYAL: 0.22, PROFESSIONAL: 0.14, EGOIST: -0.08 },
  };
  return adjustments[id]?.[personality] ?? 0;
};

const getPlayerMatchDayBias = (entropySeed: number, playerId: string): number => {
  const roll = unitFrom(entropySeed ^ hashString(playerId) ^ 0x9e3779b9);
  if (roll < 0.08) return -0.72 - unitFrom(hashString(playerId) ^ entropySeed ^ 0xa341316c) * 0.30;
  if (roll > 0.94) return 0.55 + unitFrom(hashString(playerId) ^ entropySeed ^ 0xc8013ea4) * 0.25;
  return (roll - 0.51) * 0.62;
};

export interface UserCoachShoutEffects extends ShoutBaseEffect {
  active: boolean;
  alignment: number;
  averageResponse: number;
  positiveShare: number;
  negativeShare: number;
  unexpectedShare: number;
  label: string;
}

const INACTIVE_EFFECTS: UserCoachShoutEffects = {
  active: false,
  alignment: 0,
  averageResponse: 0,
  positiveShare: 0,
  negativeShare: 0,
  unexpectedShare: 0,
  label: 'BRAK POLECENIA',
  initiativeModifier: 0,
  userShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 1,
  injuryMultiplier: 1,
};

export const UserCoachShoutService = {
  createRngState: (fixedEntropySeed?: number): UserCoachShoutRngState => {
    const entropySeed = (fixedEntropySeed ?? secureUint32()) >>> 0 || 0x9e3779b9;
    const streamSalt = fixedEntropySeed === undefined ? secureUint32() : 0x243f6a88;
    const streamState = mix32(entropySeed ^ streamSalt) || 0x6d2b79f5;
    return { entropySeed, streamState, drawCount: 0 };
  },

  issue: ({
    id,
    minute,
    rngState,
    situation,
    previousActive,
    memory,
  }: {
    id: UserCoachShoutId;
    minute: number;
    rngState: UserCoachShoutRngState;
    situation: UserCoachShoutSituation;
    previousActive?: ActiveUserCoachShout | null;
    memory?: UserCoachShoutMemory;
  }): { active: ActiveUserCoachShout; memory: UserCoachShoutMemory; rngState: UserCoachShoutRngState } => {
    let stream = rngState;
    const delayRoll = nextStreamValue(stream); stream = delayRoll.state;
    const durationRoll = nextStreamValue(stream); stream = durationRoll.state;
    const responseRoll = nextStreamValue(stream); stream = responseRoll.state;
    const unexpectedRoll = nextStreamValue(stream); stream = unexpectedRoll.state;

    const contextCategory = getContextCategory(situation);
    const mentalState = getMentalState(situation);
    const recentRepeat = memory?.lastId === id && minute - memory.lastIssuedMinute <= 12;
    const repeatCount = recentRepeat ? Math.min(3, (memory?.repeatCount ?? 0) + 1) : 0;
    const rapidChange = Boolean(previousActive && previousActive.id !== id && minute - previousActive.issuedMinute < 3);
    const startsMinute = minute + 1 + (delayRoll.value < 0.22 ? 1 : 0);
    const duration = 5 + Math.floor(durationRoll.value * 4);
    const issueCount = (memory?.issueCount ?? 0) + 1;

    return {
      active: {
        id,
        issuedMinute: minute,
        startsMinute,
        expiryMinute: startsMinute + duration - 1,
        responseSeed: Math.floor(responseRoll.value * 0xffffffff) >>> 0,
        unexpectedSeed: Math.floor(unexpectedRoll.value * 0xffffffff) >>> 0,
        repeatCount,
        confusionUntilMinute: rapidChange ? minute + 2 : -1,
        contextCategory,
        mentalState,
        contextFit: CONTEXT_MATRIX[id][contextCategory],
        mentalFit: MENTAL_MATRIX[id][mentalState],
      },
      memory: { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount },
      rngState: stream,
    };
  },

  getEffects: ({
    active,
    minute,
    rngState,
    players,
    startingXI,
    fatigueMap,
    yellowCards,
    actionContributions = {},
  }: {
    active?: ActiveUserCoachShout | null;
    minute: number;
    rngState?: UserCoachShoutRngState;
    players: Player[];
    startingXI: (string | null)[];
    fatigueMap: Record<string, number>;
    yellowCards: Record<string, number>;
    actionContributions?: Record<string, number>;
  }): UserCoachShoutEffects => {
    if (!active || !rngState || minute < active.startsMinute || minute > active.expiryMinute) return INACTIVE_EFFECTS;
    const ids = new Set(startingXI.filter((id): id is string => id !== null));
    const activePlayers = players.filter(player => ids.has(player.id));
    if (activePlayers.length === 0) return INACTIVE_EFFECTS;

    const alignment = clamp(active.contextFit * 0.55 + active.mentalFit * 0.45, -2, 2);
    let positive = 0;
    let negative = 0;
    let unexpected = 0;
    let responseSum = 0;

    activePlayers.forEach(player => {
      const personality = player.moralePersonality ?? 'CALM';
      const morale = player.morale ?? 50;
      const fatigue = fatigueMap[player.id] ?? 100;
      const mentality = player.attributes.mentality ?? 50;
      const contribution = actionContributions[player.id] ?? 0;
      const playerHash = hashString(player.id);
      const dayBias = getPlayerMatchDayBias(rngState.entropySeed, player.id);
      const responseNoise = (unitFrom(active.responseSeed ^ playerHash) + unitFrom(active.responseSeed ^ playerHash ^ 0x85ebca6b) - 1) * 0.72;
      const mentalityStability = (mentality - 50) / 180;
      const moraleAdjustment = morale < 35 ? -0.24 : morale > 75 ? 0.12 : 0;
      const fatigueAdjustment = fatigue < 62 ? -0.32 : fatigue < 75 ? -0.12 : 0;
      const cardAdjustment = (yellowCards[player.id] ?? 0) > 0 && ['MORE_EFFORT', 'DONT_GIVE_UP'].includes(active.id) ? -0.15 : 0;
      const performanceAdjustment = clamp(contribution * 0.08, -0.12, 0.18);
      const repeatAdjustment = active.repeatCount * -0.22;
      const confusionAdjustment = minute <= active.confusionUntilMinute ? -0.55 : 0;
      let responseScore = alignment + getPersonalityAdjustment(active.id, personality) + dayBias + responseNoise +
        mentalityStability + moraleAdjustment + fatigueAdjustment + cardAdjustment + performanceAdjustment +
        repeatAdjustment + confusionAdjustment;

      const instability = clamp((55 - mentality) / 260 + (45 - morale) / 300 + (70 - fatigue) / 350, -0.02, 0.10);
      const unexpectedChance = clamp(0.035 + instability + (active.mentalState === 'NERVOUS' || active.mentalState === 'FRUSTRATED' ? 0.025 : 0), 0.02, 0.15);
      const unexpectedRoll = unitFrom(active.unexpectedSeed ^ playerHash ^ 0x27d4eb2f);
      if (unexpectedRoll < unexpectedChance) {
        unexpected += 1;
        const inversionStrength = 0.70 + unitFrom(active.unexpectedSeed ^ playerHash ^ 0x165667b1) * 0.85;
        responseScore = responseScore >= 0 ? -inversionStrength : inversionStrength;
      }

      let response = 0;
      if (responseScore >= 1.25) response = 1.15;
      else if (responseScore >= 0.35) response = 0.76;
      else if (responseScore > -0.35) response = 0.20;
      else if (responseScore > -1.15) response = -0.45;
      else response = -0.82;
      if (response > 0.25) positive += 1;
      if (response < 0) negative += 1;
      responseSum += response;
    });

    const count = activePlayers.length;
    const averageResponse = clamp(responseSum / count, -0.82, 1.15);
    const base = BASE_EFFECTS[active.id];
    return {
      active: true,
      alignment,
      averageResponse,
      positiveShare: positive / count,
      negativeShare: negative / count,
      unexpectedShare: unexpected / count,
      label: getUserCoachShoutLabel(active.id),
      initiativeModifier: clamp(base.initiativeModifier * averageResponse, -0.026, 0.026),
      userShotModifier: clamp(base.userShotModifier * averageResponse, -0.008, 0.008),
      opponentShotModifier: clamp(base.opponentShotModifier * averageResponse, -0.008, 0.009),
      turnoverRiskModifier: clamp(base.turnoverRiskModifier * averageResponse, -0.050, 0.050),
      fatigueExtra: clamp(base.fatigueExtra * averageResponse, -0.009, 0.022),
      foulMultiplier: clamp(1 + (base.foulMultiplier - 1) * averageResponse, 0.88, 1.18),
      injuryMultiplier: clamp(1 + (base.injuryMultiplier - 1) * averageResponse, 0.94, 1.12),
    };
  },

  getContextCategory,
  getMentalState,
  getPlayerMatchDayBias,
  getSelectionFit: (id: UserCoachShoutId, situation: UserCoachShoutSituation) => {
    const contextCategory = getContextCategory(situation);
    const mentalState = getMentalState(situation);
    const contextFit = CONTEXT_MATRIX[id][contextCategory];
    const mentalFit = MENTAL_MATRIX[id][mentalState];
    return {
      contextCategory,
      mentalState,
      contextFit,
      mentalFit,
      alignment: clamp(contextFit * 0.55 + mentalFit * 0.45, -2, 2),
    };
  },
};
