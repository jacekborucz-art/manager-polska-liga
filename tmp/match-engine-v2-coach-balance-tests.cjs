var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// tests/MatchEngineV2CoachBalanceTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/match/live/LiveMatchRandom.ts
var getLegacyMinuteSeededValue = (seed, minute, offset = 0) => {
  const x = Math.sin(seed + minute + offset) * 1e4;
  return x - Math.floor(x);
};

// services/UserCoachInstructionService.ts
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var USER_COACH_INSTRUCTION_OPTIONS = [
  { id: null, label: "BRAK POLECENIA" },
  { id: "NARROW", label: "ZAW\u0118\u0179CIE POLE" },
  { id: "WIDE", label: "GRAJCIE SZEROKO" },
  { id: "CALM_DOWN", label: "USPOK\xD3JCIE GR\u0118" },
  { id: "SPEED_UP", label: "PRZYSPIESZCIE GR\u0118" },
  { id: "KEEP_BALL", label: "SZANUJCIE PI\u0141K\u0118" },
  { id: "TAKE_RISKS", label: "WI\u0118CEJ RYZYKA" },
  { id: "CLOSE_DOWN", label: "DOSKOCZCIE DO NICH" },
  { id: "DROP_BACK", label: "COFNIJCIE SI\u0118" },
  { id: "ALL_FORWARD", label: "WSZYSCY DO PRZODU" },
  { id: "TIME_WASTE", label: "GRAJCIE NA CZAS" }
];
var getUserCoachInstructionLabel = (id) => USER_COACH_INSTRUCTION_OPTIONS.find((option) => option.id === (id ?? null))?.label ?? "BRAK POLECENIA";
var COMPATIBILITY_MATRIX = {
  NARROW: {
    mindset: { DEFENSIVE: 1, NEUTRAL: 1, OFFENSIVE: -1 },
    tempo: { SLOW: 1, NORMAL: 0, FAST: -1 },
    intensity: { CAUTIOUS: 1, NORMAL: 0, AGGRESSIVE: 0 },
    passing: { SHORT: 1, MIXED: 0, LONG: -1 },
    pressing: { NORMAL: 0, PRESSING: 1 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 2, MAN: -1 },
    weights: { marking: 1.6, mindset: 1.2 }
  },
  WIDE: {
    mindset: { DEFENSIVE: 0, NEUTRAL: 1, OFFENSIVE: 1 },
    tempo: { SLOW: 0, NORMAL: 1, FAST: 1 },
    intensity: { CAUTIOUS: 0, NORMAL: 1, AGGRESSIVE: 1 },
    passing: { SHORT: 0, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: 0, PRESSING: 0 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { passing: 1.4, mindset: 1.2 }
  },
  CALM_DOWN: {
    mindset: { DEFENSIVE: 1, NEUTRAL: 2, OFFENSIVE: -1 },
    tempo: { SLOW: 2, NORMAL: 1, FAST: -2 },
    intensity: { CAUTIOUS: 2, NORMAL: 1, AGGRESSIVE: -2 },
    passing: { SHORT: 2, MIXED: 1, LONG: -1 },
    pressing: { NORMAL: 1, PRESSING: -2 },
    counterAttack: { NORMAL: 1, COUNTER: -1 },
    marking: { NONE: 0, ZONE: 1, MAN: -1 },
    weights: { tempo: 2, intensity: 1.6, passing: 1.3 }
  },
  SPEED_UP: {
    mindset: { DEFENSIVE: -1, NEUTRAL: 1, OFFENSIVE: 2 },
    tempo: { SLOW: -2, NORMAL: 1, FAST: 2 },
    intensity: { CAUTIOUS: -1, NORMAL: 1, AGGRESSIVE: 1 },
    passing: { SHORT: 0, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: 0, PRESSING: 1 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { tempo: 2, mindset: 1.4 }
  },
  KEEP_BALL: {
    mindset: { DEFENSIVE: 1, NEUTRAL: 2, OFFENSIVE: 0 },
    tempo: { SLOW: 1, NORMAL: 1, FAST: -2 },
    intensity: { CAUTIOUS: 1, NORMAL: 1, AGGRESSIVE: -1 },
    passing: { SHORT: 2, MIXED: 1, LONG: -2 },
    pressing: { NORMAL: 0, PRESSING: 0 },
    counterAttack: { NORMAL: 1, COUNTER: -2 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { passing: 2, tempo: 1.5, counterAttack: 1.4 }
  },
  TAKE_RISKS: {
    mindset: { DEFENSIVE: -2, NEUTRAL: 1, OFFENSIVE: 2 },
    tempo: { SLOW: -1, NORMAL: 1, FAST: 1 },
    intensity: { CAUTIOUS: -2, NORMAL: 1, AGGRESSIVE: 2 },
    passing: { SHORT: 0, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: 0, PRESSING: 1 },
    counterAttack: { NORMAL: 0, COUNTER: 1 },
    marking: { NONE: 0, ZONE: 0, MAN: 0 },
    weights: { mindset: 1.8, intensity: 1.5 }
  },
  CLOSE_DOWN: {
    mindset: { DEFENSIVE: -1, NEUTRAL: 1, OFFENSIVE: 1 },
    tempo: { SLOW: -1, NORMAL: 0, FAST: 1 },
    intensity: { CAUTIOUS: -2, NORMAL: 0, AGGRESSIVE: 2 },
    passing: { SHORT: 0, MIXED: 0, LONG: 0 },
    pressing: { NORMAL: -2, PRESSING: 2 },
    counterAttack: { NORMAL: 0, COUNTER: -2 },
    marking: { NONE: 0, ZONE: 0, MAN: 1 },
    weights: { pressing: 2, intensity: 1.6, counterAttack: 1.5 }
  },
  DROP_BACK: {
    mindset: { DEFENSIVE: 2, NEUTRAL: 1, OFFENSIVE: -2 },
    tempo: { SLOW: 1, NORMAL: 0, FAST: -1 },
    intensity: { CAUTIOUS: 1, NORMAL: 0, AGGRESSIVE: -2 },
    passing: { SHORT: -1, MIXED: 0, LONG: 1 },
    pressing: { NORMAL: 1, PRESSING: -2 },
    counterAttack: { NORMAL: 0, COUNTER: 2 },
    marking: { NONE: 0, ZONE: 2, MAN: -2 },
    weights: { mindset: 2, pressing: 1.6, counterAttack: 1.5, marking: 1.4 }
  },
  ALL_FORWARD: {
    mindset: { DEFENSIVE: -2, NEUTRAL: -1, OFFENSIVE: 2 },
    tempo: { SLOW: -2, NORMAL: 1, FAST: 2 },
    intensity: { CAUTIOUS: -2, NORMAL: 1, AGGRESSIVE: 2 },
    passing: { SHORT: -1, MIXED: 1, LONG: 1 },
    pressing: { NORMAL: -1, PRESSING: 1 },
    counterAttack: { NORMAL: 1, COUNTER: -2 },
    marking: { NONE: 0, ZONE: -1, MAN: -1 },
    weights: { mindset: 2, tempo: 1.6, intensity: 1.4 }
  },
  TIME_WASTE: {
    mindset: { DEFENSIVE: 2, NEUTRAL: 1, OFFENSIVE: -2 },
    tempo: { SLOW: 2, NORMAL: -1, FAST: -2 },
    intensity: { CAUTIOUS: 2, NORMAL: 0, AGGRESSIVE: -2 },
    passing: { SHORT: 1, MIXED: 0, LONG: -1 },
    pressing: { NORMAL: 1, PRESSING: -2 },
    counterAttack: { NORMAL: 1, COUNTER: -1 },
    marking: { NONE: 0, ZONE: 1, MAN: -1 },
    weights: { tempo: 2, mindset: 1.7, intensity: 1.5, pressing: 1.5 }
  }
};
var BASE_EFFECTS = {
  NARROW: { initiativeModifier: -3e-3, userShotModifier: -1e-3, opponentShotModifier: -45e-4, turnoverRiskModifier: -5e-3, fatigueExtra: 3e-3, foulMultiplier: 1.01, injuryMultiplier: 1 },
  WIDE: { initiativeModifier: 9e-3, userShotModifier: 4e-3, opponentShotModifier: 2e-3, turnoverRiskModifier: 0.018, fatigueExtra: 5e-3, foulMultiplier: 1, injuryMultiplier: 1.01 },
  CALM_DOWN: { initiativeModifier: -0.012, userShotModifier: -3e-3, opponentShotModifier: -2e-3, turnoverRiskModifier: -0.055, fatigueExtra: -0.01, foulMultiplier: 0.94, injuryMultiplier: 0.96 },
  SPEED_UP: { initiativeModifier: 0.016, userShotModifier: 5e-3, opponentShotModifier: 3e-3, turnoverRiskModifier: 0.05, fatigueExtra: 0.018, foulMultiplier: 1.02, injuryMultiplier: 1.04 },
  KEEP_BALL: { initiativeModifier: 4e-3, userShotModifier: -2e-3, opponentShotModifier: -3e-3, turnoverRiskModifier: -0.07, fatigueExtra: -4e-3, foulMultiplier: 0.98, injuryMultiplier: 0.98 },
  TAKE_RISKS: { initiativeModifier: 0.018, userShotModifier: 7e-3, opponentShotModifier: 6e-3, turnoverRiskModifier: 0.075, fatigueExtra: 9e-3, foulMultiplier: 1.04, injuryMultiplier: 1.03 },
  CLOSE_DOWN: { initiativeModifier: 0.017, userShotModifier: 4e-3, opponentShotModifier: -3e-3, turnoverRiskModifier: 0.01, fatigueExtra: 0.027, foulMultiplier: 1.12, injuryMultiplier: 1.08 },
  DROP_BACK: { initiativeModifier: -0.026, userShotModifier: -5e-3, opponentShotModifier: -65e-4, turnoverRiskModifier: 5e-3, fatigueExtra: -6e-3, foulMultiplier: 0.96, injuryMultiplier: 0.98 },
  ALL_FORWARD: { initiativeModifier: 0.036, userShotModifier: 9e-3, opponentShotModifier: 0.015, turnoverRiskModifier: 0.085, fatigueExtra: 0.026, foulMultiplier: 1.06, injuryMultiplier: 1.09 },
  TIME_WASTE: { initiativeModifier: -0.027, userShotModifier: -6e-3, opponentShotModifier: -4e-3, turnoverRiskModifier: -0.035, fatigueExtra: -9e-3, foulMultiplier: 1.06, injuryMultiplier: 0.97 }
};
var getTacticWidth = (tactic) => {
  const advancedSlots = tactic.slots.filter((slot) => slot.role !== "GK" && slot.y <= 0.65);
  if (advancedSlots.length === 0) return 0.5;
  return advancedSlots.reduce((sum, slot) => sum + Math.abs(slot.x - 0.5) * 2, 0) / advancedSlots.length;
};
var getMatrixCompatibility = (id, instructions, tactic) => {
  const row = COMPATIBILITY_MATRIX[id];
  const values = [
    ["mindset", row.mindset[instructions.mindset]],
    ["tempo", row.tempo[instructions.tempo]],
    ["intensity", row.intensity[instructions.intensity]],
    ["passing", row.passing[instructions.passing]],
    ["pressing", row.pressing[instructions.pressing]],
    ["counterAttack", row.counterAttack[instructions.counterAttack ?? "NORMAL"]],
    ["marking", row.marking[instructions.marking ?? "NONE"]]
  ];
  let weightedScore2 = 0;
  let totalWeight = 0;
  values.forEach(([dimension, value]) => {
    const weight = row.weights?.[dimension] ?? 1;
    weightedScore2 += value * weight;
    totalWeight += weight;
  });
  let formationAdjustment = 0;
  if (["DROP_BACK", "TIME_WASTE", "NARROW"].includes(id) && tactic.attackBias >= 72) formationAdjustment -= 0.45;
  if (["ALL_FORWARD", "TAKE_RISKS", "SPEED_UP"].includes(id) && tactic.defenseBias >= 75) formationAdjustment -= 0.5;
  if (id === "CLOSE_DOWN" && tactic.pressingIntensity >= 70) formationAdjustment += 0.3;
  if (id === "CLOSE_DOWN" && tactic.pressingIntensity <= 35) formationAdjustment -= 0.35;
  if (id === "WIDE") formationAdjustment += getTacticWidth(tactic) >= 0.58 ? 0.3 : -0.3;
  if (id === "NARROW") formationAdjustment += getTacticWidth(tactic) <= 0.46 ? 0.25 : 0;
  return clamp(weightedScore2 / Math.max(1, totalWeight) + formationAdjustment, -2, 2);
};
var getContextCompatibility = ({
  id,
  minute,
  scoreDiff,
  opponentTactic,
  opponentTempo,
  opponentPassing
}) => {
  let score = 0;
  const late = minute >= 70;
  const veryLate = minute >= 80;
  if (id === "ALL_FORWARD") {
    if (scoreDiff < 0 && late) score += veryLate ? 1.25 : 0.85;
    if (scoreDiff === 0) score -= veryLate ? 0.25 : 0.65;
    if (scoreDiff > 0) score -= late ? 1.5 : 1;
  }
  if (id === "TIME_WASTE") {
    if (scoreDiff > 0 && minute >= 65) score += veryLate ? 1.25 : 0.8;
    if (scoreDiff <= 0) score -= scoreDiff < 0 ? 1.5 : 0.65;
    if (minute < 55) score -= 0.45;
  }
  if (id === "DROP_BACK") {
    if (scoreDiff > 0 && minute >= 60) score += 0.75;
    if (scoreDiff < 0 && late) score -= 1.1;
  }
  if (id === "CALM_DOWN" || id === "KEEP_BALL") {
    if (scoreDiff > 0 && minute >= 55) score += 0.55;
    if (scoreDiff < 0 && veryLate) score -= 0.75;
  }
  if (id === "SPEED_UP" || id === "TAKE_RISKS") {
    if (scoreDiff < 0 && minute >= 55) score += 0.65;
    if (scoreDiff > 0 && late) score -= 0.7;
  }
  if (id === "WIDE") {
    if (opponentTactic.defenseBias >= 72) score += 0.45;
    if (getTacticWidth(opponentTactic) >= 0.62) score -= 0.25;
  }
  if (id === "NARROW") {
    if (getTacticWidth(opponentTactic) <= 0.46 || opponentPassing === "SHORT") score += 0.35;
    if (getTacticWidth(opponentTactic) >= 0.62 || opponentPassing === "LONG") score -= 0.45;
  }
  if (id === "CLOSE_DOWN") {
    if (opponentTempo === "SLOW" || opponentPassing === "SHORT") score += 0.35;
    if (opponentTempo === "FAST" && opponentPassing === "LONG") score -= 0.35;
  }
  return clamp(score, -1.5, 1.25);
};
var getActivePlayers = (players, startingXI2) => {
  const ids = new Set(startingXI2.filter((id) => id !== null));
  return players.filter((player) => ids.has(player.id));
};
var getExecutionFactor = (id, players, startingXI2, fatigueMap2) => {
  const activePlayers = getActivePlayers(players, startingXI2);
  if (activePlayers.length === 0) return { factor: 0.82, averageFatigue: 55 };
  const attributeWeights = {
    NARROW: { positioning: 0.38, mentality: 0.32, workRate: 0.3 },
    WIDE: { pace: 0.3, workRate: 0.24, passing: 0.22, vision: 0.14, mentality: 0.1 },
    CALM_DOWN: { mentality: 0.32, passing: 0.26, technique: 0.24, vision: 0.18 },
    SPEED_UP: { technique: 0.28, mentality: 0.24, pace: 0.2, workRate: 0.16, stamina: 0.12 },
    KEEP_BALL: { passing: 0.32, technique: 0.28, vision: 0.24, mentality: 0.16 },
    TAKE_RISKS: { vision: 0.3, technique: 0.25, mentality: 0.25, passing: 0.2 },
    CLOSE_DOWN: { workRate: 0.3, stamina: 0.26, aggression: 0.18, pace: 0.16, mentality: 0.1 },
    DROP_BACK: { positioning: 0.38, defending: 0.28, mentality: 0.22, workRate: 0.12 },
    ALL_FORWARD: { attacking: 0.3, stamina: 0.24, workRate: 0.22, mentality: 0.14, pace: 0.1 },
    TIME_WASTE: { mentality: 0.36, passing: 0.26, technique: 0.22, vision: 0.16 }
  };
  const entries = Object.entries(attributeWeights[id]);
  const quality = activePlayers.reduce((teamSum, player) => teamSum + entries.reduce((sum, [key, weight]) => sum + player.attributes[key] * weight, 0), 0) / activePlayers.length;
  const averageFatigue = activePlayers.reduce((sum, player) => sum + (fatigueMap2[player.id] ?? 100), 0) / activePlayers.length;
  let factor = clamp(0.82 + (quality - 50) / 50 * 0.28, 0.74, 1.16);
  if (["SPEED_UP", "CLOSE_DOWN", "TAKE_RISKS", "ALL_FORWARD"].includes(id) && averageFatigue < 68) {
    factor *= clamp(0.72 + averageFatigue / 240, 0.72, 1);
  }
  return { factor: clamp(factor, 0.68, 1.16), averageFatigue };
};
var INACTIVE_EFFECTS = {
  active: false,
  alignment: 0,
  misunderstood: false,
  label: "BRAK POLECENIA",
  initiativeModifier: 0,
  userShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 1,
  injuryMultiplier: 1
};
var UserCoachInstructionService = {
  issue: ({
    id,
    minute,
    sessionSeed,
    previousActive,
    memory
  }) => {
    const issueCount = (memory?.issueCount ?? 0) + 1;
    const optionIndex = Math.max(0, USER_COACH_INSTRUCTION_OPTIONS.findIndex((option) => option.id === id));
    const streamOffset = 12100 + optionIndex * 41 + issueCount * 7;
    const responseFactor = Number((0.7 + getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset) * 0.55).toFixed(3));
    const delay = getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset + 1) < 0.25 ? 1 : 0;
    const duration = 5 + Math.floor(getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset + 2) * 5);
    const recentRepeat = memory?.lastId === id && minute - memory.lastIssuedMinute <= 12;
    const repeatCount = recentRepeat ? Math.min(3, (memory?.repeatCount ?? 0) + 1) : 0;
    const rapidOppositeChange = Boolean(
      previousActive && previousActive.id !== id && minute - previousActive.issuedMinute < 3
    );
    const startsMinute = minute + 1 + delay;
    const active = {
      id,
      issuedMinute: minute,
      startsMinute,
      expiryMinute: startsMinute + duration - 1,
      responseFactor,
      misunderstandingRoll: getLegacyMinuteSeededValue(sessionSeed, minute, streamOffset + 3),
      repeatCount,
      confusionUntilMinute: rapidOppositeChange ? minute + 2 : -1
    };
    return {
      active,
      memory: { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount }
    };
  },
  getEffects: ({
    active,
    minute,
    instructions,
    tactic,
    opponentTactic,
    players,
    startingXI: startingXI2,
    fatigueMap: fatigueMap2,
    scoreDiff,
    opponentTempo = "NORMAL",
    opponentPassing = "MIXED"
  }) => {
    if (!active || minute < active.startsMinute || minute > active.expiryMinute) return INACTIVE_EFFECTS;
    const matrixCompatibility = getMatrixCompatibility(active.id, instructions, tactic);
    const contextCompatibility = getContextCompatibility({
      id: active.id,
      minute,
      scoreDiff,
      opponentTactic,
      opponentTempo,
      opponentPassing
    });
    const alignment = clamp(matrixCompatibility * 0.72 + contextCompatibility * 0.62, -2, 2);
    const { factor: executionFactor, averageFatigue } = getExecutionFactor(
      active.id,
      players,
      startingXI2,
      fatigueMap2
    );
    const misunderstandingChance = clamp(0.08 - alignment * 0.1, 0.03, 0.34);
    const isConfused = minute <= active.confusionUntilMinute;
    const misunderstood = isConfused || active.misunderstandingRoll < misunderstandingChance;
    const repeatFactor = Math.max(0.55, 1 - active.repeatCount * 0.15);
    let strength = active.responseFactor * executionFactor * repeatFactor * (0.72 + Math.max(0, alignment) * 0.18 - Math.max(0, -alignment) * 0.2);
    if (misunderstood) strength *= 0.3;
    strength = clamp(strength, 0.18, 1.45);
    const conflict = Math.max(0, -alignment) + (misunderstood ? 0.75 : 0) + (isConfused ? 0.35 : 0);
    const base = BASE_EFFECTS[active.id];
    const fatigueFailure = ["SPEED_UP", "CLOSE_DOWN", "TAKE_RISKS", "ALL_FORWARD"].includes(active.id) ? clamp((65 - averageFatigue) / 35, 0, 1) : 0;
    return {
      active: true,
      alignment,
      misunderstood,
      label: getUserCoachInstructionLabel(active.id),
      initiativeModifier: clamp(base.initiativeModifier * strength - conflict * 0.014, -0.055, 0.05),
      userShotModifier: clamp(base.userShotModifier * strength - conflict * 25e-4, -0.014, 0.012),
      opponentShotModifier: clamp(base.opponentShotModifier * strength + conflict * 4e-3 + fatigueFailure * 3e-3, -0.01, 0.022),
      turnoverRiskModifier: clamp(base.turnoverRiskModifier * strength + conflict * 0.03 + fatigueFailure * 0.02, -0.1, 0.16),
      fatigueExtra: clamp(base.fatigueExtra * strength + conflict * 6e-3 + fatigueFailure * 0.01, -0.014, 0.055),
      foulMultiplier: clamp(1 + (base.foulMultiplier - 1) * strength + conflict * 0.04, 0.9, 1.35),
      injuryMultiplier: clamp(1 + (base.injuryMultiplier - 1) * strength + conflict * 0.025 + fatigueFailure * 0.04, 0.92, 1.3)
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
    opponentTempo = "NORMAL",
    opponentPassing = "MIXED"
  }) => clamp(
    getMatrixCompatibility(id, instructions, tactic) * 0.72 + getContextCompatibility({ id, minute, scoreDiff, opponentTactic, opponentTempo, opponentPassing }) * 0.62,
    -2,
    2
  )
};

// services/UserCoachShoutService.ts
var clamp2 = (value, min, max) => Math.min(max, Math.max(min, value));
var USER_COACH_SHOUT_OPTIONS = [
  { id: null, label: "BRAK POLECENIA" },
  { id: "MOTIVATE", label: "ZMOTYWUJ" },
  { id: "PRAISE", label: "POCHWAL" },
  { id: "FOCUS", label: "SKUPCIE SI\u0118" },
  { id: "NO_PANIC", label: "BEZ PANIKI" },
  { id: "MORE_EFFORT", label: "WI\u0118CEJ ZAANGA\u017BOWANIA" },
  { id: "CALM_EMOTIONS", label: "OPANUJCIE EMOCJE" },
  { id: "DO_BETTER", label: "STA\u0106 WAS NA WI\u0118CEJ" },
  { id: "DONT_GIVE_UP", label: "NIE ODPUSZCZAJCIE" }
];
var getUserCoachShoutLabel = (id) => USER_COACH_SHOUT_OPTIONS.find((option) => option.id === (id ?? null))?.label ?? "BRAK POLECENIA";
var CONTEXT_MATRIX = {
  MOTIVATE: { LOSING_POORLY: 2, LOSING_WELL: 1, EVEN_MATCH: 1, LEADING_NARROWLY: 0, LEADING_COMFORTABLY: -1, JUST_CONCEDED: 1, JUST_SCORED: 0 },
  PRAISE: { LOSING_POORLY: -2, LOSING_WELL: 1, EVEN_MATCH: 0, LEADING_NARROWLY: 1, LEADING_COMFORTABLY: 2, JUST_CONCEDED: -1, JUST_SCORED: 2 },
  FOCUS: { LOSING_POORLY: 1, LOSING_WELL: 0, EVEN_MATCH: 1, LEADING_NARROWLY: 2, LEADING_COMFORTABLY: 1, JUST_CONCEDED: 2, JUST_SCORED: 1 },
  NO_PANIC: { LOSING_POORLY: 1, LOSING_WELL: 2, EVEN_MATCH: 1, LEADING_NARROWLY: 2, LEADING_COMFORTABLY: 0, JUST_CONCEDED: 2, JUST_SCORED: 0 },
  MORE_EFFORT: { LOSING_POORLY: 2, LOSING_WELL: 0, EVEN_MATCH: 1, LEADING_NARROWLY: 0, LEADING_COMFORTABLY: -1, JUST_CONCEDED: 1, JUST_SCORED: -1 },
  CALM_EMOTIONS: { LOSING_POORLY: 0, LOSING_WELL: 0, EVEN_MATCH: 0, LEADING_NARROWLY: 1, LEADING_COMFORTABLY: 0, JUST_CONCEDED: 1, JUST_SCORED: 0 },
  DO_BETTER: { LOSING_POORLY: 2, LOSING_WELL: -1, EVEN_MATCH: 1, LEADING_NARROWLY: -1, LEADING_COMFORTABLY: -2, JUST_CONCEDED: 1, JUST_SCORED: -1 },
  DONT_GIVE_UP: { LOSING_POORLY: 2, LOSING_WELL: 2, EVEN_MATCH: 1, LEADING_NARROWLY: 1, LEADING_COMFORTABLY: -1, JUST_CONCEDED: 2, JUST_SCORED: 1 }
};
var MENTAL_MATRIX = {
  MOTIVATE: { FLAT: 2, NERVOUS: 1, FRUSTRATED: 1, FOCUSED: 0, CONFIDENT: 0, COMPLACENT: 1, EXHAUSTED: -1 },
  PRAISE: { FLAT: 1, NERVOUS: 1, FRUSTRATED: -1, FOCUSED: 1, CONFIDENT: 2, COMPLACENT: -2, EXHAUSTED: 0 },
  FOCUS: { FLAT: 1, NERVOUS: 1, FRUSTRATED: 1, FOCUSED: 0, CONFIDENT: 0, COMPLACENT: 2, EXHAUSTED: -1 },
  NO_PANIC: { FLAT: 0, NERVOUS: 2, FRUSTRATED: 1, FOCUSED: 0, CONFIDENT: -1, COMPLACENT: -1, EXHAUSTED: 1 },
  MORE_EFFORT: { FLAT: 2, NERVOUS: -1, FRUSTRATED: 1, FOCUSED: 1, CONFIDENT: 0, COMPLACENT: 2, EXHAUSTED: -2 },
  CALM_EMOTIONS: { FLAT: -1, NERVOUS: 2, FRUSTRATED: 2, FOCUSED: 0, CONFIDENT: -1, COMPLACENT: -1, EXHAUSTED: 0 },
  DO_BETTER: { FLAT: 2, NERVOUS: -2, FRUSTRATED: -1, FOCUSED: -1, CONFIDENT: 0, COMPLACENT: 2, EXHAUSTED: -2 },
  DONT_GIVE_UP: { FLAT: 2, NERVOUS: 1, FRUSTRATED: 2, FOCUSED: 1, CONFIDENT: 0, COMPLACENT: 1, EXHAUSTED: -1 }
};
var BASE_EFFECTS2 = {
  MOTIVATE: { initiativeModifier: 0.012, userShotModifier: 3e-3, opponentShotModifier: 1e-3, turnoverRiskModifier: -8e-3, fatigueExtra: 5e-3, foulMultiplier: 1.01, injuryMultiplier: 1.01 },
  PRAISE: { initiativeModifier: 8e-3, userShotModifier: 4e-3, opponentShotModifier: 1e-3, turnoverRiskModifier: -0.012, fatigueExtra: 1e-3, foulMultiplier: 0.98, injuryMultiplier: 1 },
  FOCUS: { initiativeModifier: 3e-3, userShotModifier: 2e-3, opponentShotModifier: -4e-3, turnoverRiskModifier: -0.035, fatigueExtra: 1e-3, foulMultiplier: 0.96, injuryMultiplier: 0.99 },
  NO_PANIC: { initiativeModifier: -2e-3, userShotModifier: 1e-3, opponentShotModifier: -3e-3, turnoverRiskModifier: -0.045, fatigueExtra: -4e-3, foulMultiplier: 0.94, injuryMultiplier: 0.97 },
  MORE_EFFORT: { initiativeModifier: 0.02, userShotModifier: 5e-3, opponentShotModifier: -2e-3, turnoverRiskModifier: 0.012, fatigueExtra: 0.018, foulMultiplier: 1.1, injuryMultiplier: 1.06 },
  CALM_EMOTIONS: { initiativeModifier: -5e-3, userShotModifier: 1e-3, opponentShotModifier: -2e-3, turnoverRiskModifier: -0.025, fatigueExtra: -4e-3, foulMultiplier: 0.88, injuryMultiplier: 0.98 },
  DO_BETTER: { initiativeModifier: 0.016, userShotModifier: 5e-3, opponentShotModifier: 3e-3, turnoverRiskModifier: 0.018, fatigueExtra: 0.01, foulMultiplier: 1.04, injuryMultiplier: 1.03 },
  DONT_GIVE_UP: { initiativeModifier: 0.021, userShotModifier: 6e-3, opponentShotModifier: 4e-3, turnoverRiskModifier: 0.02, fatigueExtra: 0.016, foulMultiplier: 1.06, injuryMultiplier: 1.05 }
};
var mix32 = (value) => {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ mixed >>> 16, 73244475);
  mixed = Math.imul(mixed ^ mixed >>> 16, 73244475);
  return (mixed ^ mixed >>> 16) >>> 0;
};
var hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
var unitFrom = (value) => mix32(value) / 4294967296;
var nextStreamValue = (state) => {
  let next = state.streamState >>> 0;
  if (next === 0) next = 1831565813;
  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  next >>>= 0;
  return {
    value: next / 4294967296,
    state: { ...state, streamState: next, drawCount: state.drawCount + 1 }
  };
};
var secureUint32 = () => {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] >>> 0;
  }
  return mix32((Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0);
};
var getContextCategory = (situation) => {
  if (situation.recentlyConceded) return "JUST_CONCEDED";
  if (situation.recentlyScored) return "JUST_SCORED";
  if (situation.scoreDiff < 0) {
    const performance = situation.shotDiff * 0.3 + situation.shotsOnTargetDiff * 0.55 + situation.userMomentum / 35;
    return performance >= 0 ? "LOSING_WELL" : "LOSING_POORLY";
  }
  if (situation.scoreDiff === 0) return "EVEN_MATCH";
  return situation.scoreDiff === 1 ? "LEADING_NARROWLY" : "LEADING_COMFORTABLY";
};
var getMentalState = (situation) => {
  if (situation.averageFatigue < 64) return "EXHAUSTED";
  if (situation.scoreDiff >= 2 && situation.shotDiff >= 4 && situation.userMomentum >= 22) return "COMPLACENT";
  if (situation.recentlyScored || situation.userMomentum >= 32) return "CONFIDENT";
  if (situation.recentlyConceded || situation.scoreDiff <= 0 && situation.userMomentum <= -28) return "NERVOUS";
  if (situation.yellowCardCount >= 3 || situation.scoreDiff < 0 && situation.shotDiff >= 3) return "FRUSTRATED";
  if (situation.userMomentum <= -18 || situation.averageMorale < 38) return "FLAT";
  return "FOCUSED";
};
var getPersonalityAdjustment = (id, personality) => {
  const adjustments = {
    MOTIVATE: { AMBITIOUS: 0.25, CONFIDENT: 0.18, PROFESSIONAL: 0.12, NERVOUS: -0.12 },
    PRAISE: { CONFIDENT: 0.24, EGOIST: 0.22, SENSITIVE: 0.15, AMBITIOUS: -0.08 },
    FOCUS: { PROFESSIONAL: 0.24, CALM: 0.18, EGOIST: -0.16 },
    NO_PANIC: { NERVOUS: 0.25, SENSITIVE: 0.22, CALM: 0.14, EGOIST: -0.12 },
    MORE_EFFORT: { AMBITIOUS: 0.28, PROFESSIONAL: 0.24, NERVOUS: -0.24, SENSITIVE: -0.16 },
    CALM_EMOTIONS: { CALM: 0.24, PROFESSIONAL: 0.15, EGOIST: -0.18, AMBITIOUS: -0.1 },
    DO_BETTER: { AMBITIOUS: 0.3, PROFESSIONAL: 0.25, SENSITIVE: -0.35, NERVOUS: -0.38, EGOIST: -0.2 },
    DONT_GIVE_UP: { AMBITIOUS: 0.28, LOYAL: 0.22, PROFESSIONAL: 0.14, EGOIST: -0.08 }
  };
  return adjustments[id]?.[personality] ?? 0;
};
var getPlayerMatchDayBias = (entropySeed, playerId) => {
  const roll = unitFrom(entropySeed ^ hashString(playerId) ^ 2654435769);
  if (roll < 0.08) return -0.72 - unitFrom(hashString(playerId) ^ entropySeed ^ 2738958700) * 0.3;
  if (roll > 0.94) return 0.55 + unitFrom(hashString(playerId) ^ entropySeed ^ 3355524772) * 0.25;
  return (roll - 0.51) * 0.62;
};
var INACTIVE_EFFECTS2 = {
  active: false,
  alignment: 0,
  averageResponse: 0,
  positiveShare: 0,
  negativeShare: 0,
  unexpectedShare: 0,
  label: "BRAK POLECENIA",
  initiativeModifier: 0,
  userShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 1,
  injuryMultiplier: 1
};
var UserCoachShoutService = {
  createRngState: (fixedEntropySeed) => {
    const entropySeed = (fixedEntropySeed ?? secureUint32()) >>> 0 || 2654435769;
    const streamSalt = fixedEntropySeed === void 0 ? secureUint32() : 608135816;
    const streamState = mix32(entropySeed ^ streamSalt) || 1831565813;
    return { entropySeed, streamState, drawCount: 0 };
  },
  issue: ({
    id,
    minute,
    rngState,
    situation,
    previousActive,
    memory
  }) => {
    let stream = rngState;
    const delayRoll = nextStreamValue(stream);
    stream = delayRoll.state;
    const durationRoll = nextStreamValue(stream);
    stream = durationRoll.state;
    const responseRoll = nextStreamValue(stream);
    stream = responseRoll.state;
    const unexpectedRoll = nextStreamValue(stream);
    stream = unexpectedRoll.state;
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
        responseSeed: Math.floor(responseRoll.value * 4294967295) >>> 0,
        unexpectedSeed: Math.floor(unexpectedRoll.value * 4294967295) >>> 0,
        repeatCount,
        confusionUntilMinute: rapidChange ? minute + 2 : -1,
        contextCategory,
        mentalState,
        contextFit: CONTEXT_MATRIX[id][contextCategory],
        mentalFit: MENTAL_MATRIX[id][mentalState]
      },
      memory: { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount },
      rngState: stream
    };
  },
  getEffects: ({
    active,
    minute,
    rngState,
    players,
    startingXI: startingXI2,
    fatigueMap: fatigueMap2,
    yellowCards,
    actionContributions = {}
  }) => {
    if (!active || !rngState || minute < active.startsMinute || minute > active.expiryMinute) return INACTIVE_EFFECTS2;
    const ids = new Set(startingXI2.filter((id) => id !== null));
    const activePlayers = players.filter((player) => ids.has(player.id));
    if (activePlayers.length === 0) return INACTIVE_EFFECTS2;
    const alignment = clamp2(active.contextFit * 0.55 + active.mentalFit * 0.45, -2, 2);
    let positive = 0;
    let negative = 0;
    let unexpected = 0;
    let responseSum = 0;
    activePlayers.forEach((player) => {
      const personality = player.moralePersonality ?? "CALM";
      const morale = player.morale ?? 50;
      const fatigue = fatigueMap2[player.id] ?? 100;
      const mentality = player.attributes.mentality ?? 50;
      const contribution = actionContributions[player.id] ?? 0;
      const playerHash = hashString(player.id);
      const dayBias = getPlayerMatchDayBias(rngState.entropySeed, player.id);
      const responseNoise = (unitFrom(active.responseSeed ^ playerHash) + unitFrom(active.responseSeed ^ playerHash ^ 2246822507) - 1) * 0.72;
      const mentalityStability = (mentality - 50) / 180;
      const moraleAdjustment = morale < 35 ? -0.24 : morale > 75 ? 0.12 : 0;
      const fatigueAdjustment = fatigue < 62 ? -0.32 : fatigue < 75 ? -0.12 : 0;
      const cardAdjustment = (yellowCards[player.id] ?? 0) > 0 && ["MORE_EFFORT", "DONT_GIVE_UP"].includes(active.id) ? -0.15 : 0;
      const performanceAdjustment = clamp2(contribution * 0.08, -0.12, 0.18);
      const repeatAdjustment = active.repeatCount * -0.22;
      const confusionAdjustment = minute <= active.confusionUntilMinute ? -0.55 : 0;
      let responseScore = alignment + getPersonalityAdjustment(active.id, personality) + dayBias + responseNoise + mentalityStability + moraleAdjustment + fatigueAdjustment + cardAdjustment + performanceAdjustment + repeatAdjustment + confusionAdjustment;
      const instability = clamp2((55 - mentality) / 260 + (45 - morale) / 300 + (70 - fatigue) / 350, -0.02, 0.1);
      const unexpectedChance = clamp2(0.035 + instability + (active.mentalState === "NERVOUS" || active.mentalState === "FRUSTRATED" ? 0.025 : 0), 0.02, 0.15);
      const unexpectedRoll = unitFrom(active.unexpectedSeed ^ playerHash ^ 668265263);
      if (unexpectedRoll < unexpectedChance) {
        unexpected += 1;
        const inversionStrength = 0.7 + unitFrom(active.unexpectedSeed ^ playerHash ^ 374761393) * 0.85;
        responseScore = responseScore >= 0 ? -inversionStrength : inversionStrength;
      }
      let response = 0;
      if (responseScore >= 1.25) response = 1.15;
      else if (responseScore >= 0.35) response = 0.76;
      else if (responseScore > -0.35) response = 0.2;
      else if (responseScore > -1.15) response = -0.45;
      else response = -0.82;
      if (response > 0.25) positive += 1;
      if (response < 0) negative += 1;
      responseSum += response;
    });
    const count = activePlayers.length;
    const averageResponse = clamp2(responseSum / count, -0.82, 1.15);
    const base = BASE_EFFECTS2[active.id];
    return {
      active: true,
      alignment,
      averageResponse,
      positiveShare: positive / count,
      negativeShare: negative / count,
      unexpectedShare: unexpected / count,
      label: getUserCoachShoutLabel(active.id),
      initiativeModifier: clamp2(base.initiativeModifier * averageResponse, -0.026, 0.026),
      userShotModifier: clamp2(base.userShotModifier * averageResponse, -8e-3, 8e-3),
      opponentShotModifier: clamp2(base.opponentShotModifier * averageResponse, -8e-3, 9e-3),
      turnoverRiskModifier: clamp2(base.turnoverRiskModifier * averageResponse, -0.05, 0.05),
      fatigueExtra: clamp2(base.fatigueExtra * averageResponse, -9e-3, 0.022),
      foulMultiplier: clamp2(1 + (base.foulMultiplier - 1) * averageResponse, 0.88, 1.18),
      injuryMultiplier: clamp2(1 + (base.injuryMultiplier - 1) * averageResponse, 0.94, 1.12)
    };
  },
  getContextCategory,
  getMentalState,
  getPlayerMatchDayBias,
  getSelectionFit: (id, situation) => {
    const contextCategory = getContextCategory(situation);
    const mentalState = getMentalState(situation);
    const contextFit = CONTEXT_MATRIX[id][contextCategory];
    const mentalFit = MENTAL_MATRIX[id][mentalState];
    return {
      contextCategory,
      mentalState,
      contextFit,
      mentalFit,
      alignment: clamp2(contextFit * 0.55 + mentalFit * 0.45, -2, 2)
    };
  }
};

// services/match/engines/cupV2/CupMatchTypes.ts
var DEFAULT_CUP_ENGINE_CONFIG = {
  tickSeconds: 5,
  normalTimeSeconds: 90 * 60,
  extraTimeSeconds: 30 * 60,
  maxSubstitutions: 5,
  enableExtraTime: true,
  enablePenaltyShootout: true,
  calibrationMode: false
};

// services/match/engines/cupV2/CupMath.ts
var clamp3 = (value, min, max) => Math.max(min, Math.min(max, value));
var stableHash = (seed) => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
var seededRandom = (seed, second, salt) => {
  let value = stableHash(`${seed}:${second}:${salt}`) + 1831565813;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
};

// services/match/engines/cupV2/CupPlayerStatsAggregator.ts
var SHOT_TYPES = /* @__PURE__ */ new Set([
  "SHOT" /* SHOT */,
  "SHOT_BLOCKED" /* SHOT_BLOCKED */,
  "SHOT_ON_TARGET" /* SHOT_ON_TARGET */,
  "SAVE" /* SAVE */,
  "SHOT_POST" /* SHOT_POST */,
  "SHOT_BAR" /* SHOT_BAR */,
  "GOAL" /* GOAL */,
  "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */,
  "ONE_ON_ONE_MISS" /* ONE_ON_ONE_MISS */,
  "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */,
  "PENALTY_SCORED" /* PENALTY_SCORED */,
  "PENALTY_MISSED" /* PENALTY_MISSED */
]);
var ON_TARGET_TYPES = /* @__PURE__ */ new Set([
  "SHOT_ON_TARGET" /* SHOT_ON_TARGET */,
  "SAVE" /* SAVE */,
  "GOAL" /* GOAL */,
  "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */,
  "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */,
  "PENALTY_SCORED" /* PENALTY_SCORED */
]);
var GOAL_TYPES = /* @__PURE__ */ new Set([
  "GOAL" /* GOAL */,
  "ONE_ON_ONE_GOAL" /* ONE_ON_ONE_GOAL */,
  "PENALTY_SCORED" /* PENALTY_SCORED */
]);
var SAVE_TYPES = /* @__PURE__ */ new Set([
  "SAVE" /* SAVE */,
  "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */
]);

// services/match/engines/cupV2/CupMatchLoop.ts
var RECEIVER_CARRIER_EVENTS = /* @__PURE__ */ new Set([
  "PASS_COMPLETED" /* PASS_COMPLETED */,
  "CROSS_NEAR_POST" /* CROSS_NEAR_POST */,
  "CROSS_FAR_POST" /* CROSS_FAR_POST */
]);
var ACTOR_CARRIER_EVENTS = /* @__PURE__ */ new Set([
  "BALL_CONTROL" /* BALL_CONTROL */,
  "DRIBBLING" /* DRIBBLING */,
  "TACKLE_WON" /* TACKLE_WON */,
  "MISPLACED_PASS" /* MISPLACED_PASS */,
  "REBOUND_WON" /* REBOUND_WON */,
  "SAVE" /* SAVE */,
  "ONE_ON_ONE_SAVE" /* ONE_ON_ONE_SAVE */,
  "GK_LONG_THROW" /* GK_LONG_THROW */,
  "GOAL_KICK" /* GOAL_KICK */,
  "KICK_OFF" /* KICK_OFF */
]);

// services/match/engines/cupV2/CupSampleMatchFactory.ts
var ATTRIBUTE_KEYS = [
  "strength",
  "stamina",
  "pace",
  "defending",
  "passing",
  "attacking",
  "finishing",
  "technique",
  "vision",
  "dribbling",
  "heading",
  "positioning",
  "goalkeeping",
  "freeKicks",
  "talent",
  "penalties",
  "corners",
  "aggression",
  "crossing",
  "leadership",
  "mentality",
  "workRate"
];
var DEFAULT_INSTRUCTIONS = {
  tempo: "NORMAL",
  mindset: "NEUTRAL",
  intensity: "NORMAL",
  passing: "MIXED",
  pressing: "NORMAL",
  counterAttack: "NORMAL",
  marking: "ZONE",
  lastChangeMinute: 0,
  expiryMinute: -1,
  tempoExpiry: -1,
  mindsetExpiry: -1,
  intensityExpiry: -1,
  tempoCooldown: -1,
  mindsetCooldown: -1,
  intensityCooldown: -1,
  passingCooldown: -1,
  pressingCooldown: -1,
  counterAttackCooldown: -1,
  markingCooldown: -1,
  tempoResponseFactor: 1,
  mindsetResponseFactor: 1,
  intensityResponseFactor: 1,
  passingResponseFactor: 1,
  pressingResponseFactor: 1,
  counterAttackResponseFactor: 1,
  markingResponseFactor: 1
};
var makeTactic = (id, style) => {
  const attackBias = style === "ATTACK" ? 68 : style === "DEFENSE" ? 42 : style === "DIRECT" ? 58 : 54;
  const defenseBias = style === "DEFENSE" ? 70 : style === "ATTACK" ? 44 : style === "DIRECT" ? 50 : 56;
  const pressingIntensity = style === "ATTACK" ? 66 : style === "DEFENSE" ? 42 : style === "DIRECT" ? 55 : 52;
  return {
    id,
    name: `Cup V2 ${style}`,
    category: "cupV2-calibration",
    attackBias,
    defenseBias,
    pressingIntensity,
    slots: [
      { index: 0, role: "GK" /* GK */, x: 50, y: 8 },
      { index: 1, role: "DEF" /* DEF */, x: 18, y: 28 },
      { index: 2, role: "DEF" /* DEF */, x: 38, y: 25 },
      { index: 3, role: "DEF" /* DEF */, x: 62, y: 25 },
      { index: 4, role: "DEF" /* DEF */, x: 82, y: 28 },
      { index: 5, role: "MID" /* MID */, x: 34, y: 50 },
      { index: 6, role: "MID" /* MID */, x: 66, y: 50 },
      { index: 7, role: "MID" /* MID */, x: 22, y: 66 },
      { index: 8, role: "MID" /* MID */, x: 78, y: 66 },
      { index: 9, role: "FWD" /* FWD */, x: 42, y: 82 },
      { index: 10, role: "FWD" /* FWD */, x: 58, y: 84 }
    ]
  };
};
var positionBoosts = {
  ["GK" /* GK */]: { goalkeeping: 14, positioning: 8, mentality: 5, passing: 2 },
  ["DEF" /* DEF */]: { defending: 11, positioning: 8, heading: 6, strength: 5, aggression: 3 },
  ["MID" /* MID */]: { passing: 9, vision: 7, technique: 7, stamina: 5, workRate: 5 },
  ["FWD" /* FWD */]: { finishing: 11, attacking: 9, pace: 5, dribbling: 4, technique: 4 }
};
var makeAttributes = (seed, position, quality) => {
  const attrs = {};
  ATTRIBUTE_KEYS.forEach((key, index) => {
    const spread = (seededRandom(seed, index, 4) - 0.5) * 16;
    const positional = positionBoosts[position][key] ?? 0;
    attrs[key] = Math.round(clamp3(quality + spread + positional, 18, 95));
  });
  if (position !== "GK" /* GK */) {
    attrs.goalkeeping = Math.round(12 + seededRandom(seed, 44, 7) * 20);
  }
  return attrs;
};
var calculateOverall = (position, attrs) => {
  const keysByPosition = {
    ["GK" /* GK */]: ["goalkeeping", "positioning", "mentality", "strength"],
    ["DEF" /* DEF */]: ["defending", "positioning", "heading", "strength", "pace"],
    ["MID" /* MID */]: ["passing", "vision", "technique", "stamina", "workRate"],
    ["FWD" /* FWD */]: ["finishing", "attacking", "pace", "technique", "positioning"]
  };
  const keys = keysByPosition[position];
  return Math.round(keys.reduce((sum, key) => sum + attrs[key], 0) / keys.length);
};
var makePlayer = (prefix, index, position, quality) => {
  const id = `${prefix}_${position}_${index}`;
  const attrs = makeAttributes(id, position, quality.base);
  const overallRating = calculateOverall(position, attrs);
  return {
    id,
    firstName: "Test",
    lastName: `${prefix}${index}`,
    age: 20 + Math.floor(seededRandom(id, 9, 9) * 15),
    clubId: prefix,
    nationality: "POLAND" /* POLAND */,
    position,
    overallRating,
    attributes: attrs,
    stats: {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      matchesPlayed: 12,
      minutesPlayed: 820,
      seasonalChanges: {},
      ratingHistory: [6.4, 6.6, 6.7, 6.5, 6.8]
    },
    health: { status: "HEALTHY" /* HEALTHY */ },
    condition: Math.round(clamp3(quality.condition + (seededRandom(id, 10, 10) - 0.5) * 9, 55, 100)),
    suspensionMatches: 0,
    contractEndDate: "2028-06-30",
    annualSalary: 12e4,
    history: [],
    boardLockoutUntil: null,
    isUntouchable: false,
    negotiationStep: 0,
    negotiationLockoutUntil: null,
    contractLockoutUntil: null,
    fatigueDebt: 0,
    form: Math.round(clamp3(50 + (seededRandom(id, 11, 11) - 0.5) * 24, 25, 85)),
    morale: quality.morale,
    isNegotiationPermanentBlocked: false,
    transferLockoutUntil: null,
    freeAgentLockoutUntil: null
  };
};
var makeSquad = (prefix, quality) => {
  const positions = [
    "GK" /* GK */,
    "GK" /* GK */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "MID" /* MID */,
    "MID" /* MID */,
    "MID" /* MID */,
    "MID" /* MID */,
    "MID" /* MID */,
    "FWD" /* FWD */,
    "FWD" /* FWD */,
    "FWD" /* FWD */,
    "FWD" /* FWD */
  ];
  return positions.map((position, index) => makePlayer(prefix, index, position, quality));
};
var buildLineup = (players, clubId, tacticId) => {
  const used = /* @__PURE__ */ new Set();
  const take = (position) => {
    const player = players.filter((candidate) => candidate.position === position && !used.has(candidate.id)).sort((a, b) => b.overallRating - a.overallRating)[0];
    if (!player) return null;
    used.add(player.id);
    return player.id;
  };
  const startingXI2 = [
    take("GK" /* GK */),
    take("DEF" /* DEF */),
    take("DEF" /* DEF */),
    take("DEF" /* DEF */),
    take("DEF" /* DEF */),
    take("MID" /* MID */),
    take("MID" /* MID */),
    take("MID" /* MID */),
    take("MID" /* MID */),
    take("FWD" /* FWD */),
    take("FWD" /* FWD */)
  ];
  return {
    clubId,
    tacticId,
    startingXI: startingXI2,
    bench: players.filter((player) => !used.has(player.id)).map((player) => player.id),
    reserves: []
  };
};
var makeReferee = (seed) => ({
  id: `cupv2_ref_${seed}`,
  firstName: "Arbiter",
  lastName: seed,
  age: 38,
  nationality: "POLAND" /* POLAND */,
  strictness: Math.round(35 + seededRandom(seed, 1, 40) * 45),
  consistency: Math.round(50 + seededRandom(seed, 2, 41) * 40),
  advantageTendency: Math.round(25 + seededRandom(seed, 3, 42) * 55),
  matchRatings: [],
  totalYellowCardsShown: 0,
  totalRedCardsShown: 0,
  experience: Math.round(45 + seededRandom(seed, 4, 43) * 45),
  isInternational: false
});
var makeTeam = ({
  side,
  prefix,
  name,
  quality,
  tactic,
  instructions,
  stadiumSupport
}) => {
  const players = makeSquad(prefix, quality);
  return {
    side,
    clubId: prefix,
    name,
    players,
    lineup: buildLineup(players, prefix, tactic.id),
    tactic,
    instructions,
    morale: quality.morale,
    preMatchMotivation: quality.motivation,
    stadiumSupport
  };
};
var scenarioQuality = (scenario, index) => {
  const smallSwing = (seededRandom(scenario, index, 88) - 0.5) * 3;
  if (scenario === "HOME_FAVORITE") {
    return {
      home: { base: 70 + smallSwing, morale: 62, condition: 93, motivation: 63 },
      away: { base: 65.5 - smallSwing, morale: 52, condition: 90, motivation: 58 }
    };
  }
  if (scenario === "AWAY_FAVORITE") {
    return {
      home: { base: 65.5 + smallSwing, morale: 55, condition: 91, motivation: 62 },
      away: { base: 70 - smallSwing, morale: 61, condition: 92, motivation: 60 }
    };
  }
  if (scenario === "LOWER_LEAGUE_HOME") {
    return {
      home: { base: 62.5 + smallSwing, morale: 68, condition: 94, motivation: 74 },
      away: { base: 67.5 - smallSwing, morale: 58, condition: 90, motivation: 56 }
    };
  }
  if (scenario === "FINAL_NEUTRAL") {
    return {
      home: { base: 72 + smallSwing, morale: 60, condition: 91, motivation: 68 },
      away: { base: 71 - smallSwing, morale: 60, condition: 91, motivation: 68 }
    };
  }
  return {
    home: { base: 67 + smallSwing, morale: 58, condition: 92, motivation: 60 },
    away: { base: 67 - smallSwing, morale: 58, condition: 92, motivation: 60 }
  };
};
var expectedFavoriteForScenario = (scenario) => {
  if (scenario === "HOME_FAVORITE") return "HOME";
  if (scenario === "AWAY_FAVORITE" || scenario === "LOWER_LEAGUE_HOME") return "AWAY";
  return void 0;
};
var scenarioInstructions = (scenario) => {
  if (scenario === "LOWER_LEAGUE_HOME") {
    return {
      home: { ...DEFAULT_INSTRUCTIONS, mindset: "DEFENSIVE", passing: "LONG", counterAttack: "COUNTER" },
      away: { ...DEFAULT_INSTRUCTIONS, mindset: "OFFENSIVE", tempo: "FAST", pressing: "PRESSING" },
      homeStyle: "DIRECT",
      awayStyle: "ATTACK"
    };
  }
  if (scenario === "HOME_FAVORITE") {
    return {
      home: { ...DEFAULT_INSTRUCTIONS, mindset: "OFFENSIVE", tempo: "FAST", pressing: "PRESSING" },
      away: { ...DEFAULT_INSTRUCTIONS, mindset: "DEFENSIVE", counterAttack: "COUNTER" },
      homeStyle: "ATTACK",
      awayStyle: "DEFENSE"
    };
  }
  if (scenario === "AWAY_FAVORITE") {
    return {
      home: { ...DEFAULT_INSTRUCTIONS, mindset: "DEFENSIVE", counterAttack: "COUNTER" },
      away: { ...DEFAULT_INSTRUCTIONS, mindset: "OFFENSIVE", tempo: "FAST", pressing: "PRESSING" },
      homeStyle: "DEFENSE",
      awayStyle: "ATTACK"
    };
  }
  return {
    home: DEFAULT_INSTRUCTIONS,
    away: DEFAULT_INSTRUCTIONS,
    homeStyle: "BALANCED",
    awayStyle: "BALANCED"
  };
};
var stadiumSupportForScenario = (scenario) => {
  if (scenario === "FINAL_NEUTRAL") return { home: 50, away: 50 };
  if (scenario === "LOWER_LEAGUE_HOME") return { home: 61, away: 39 };
  return { home: 52, away: 48 };
};
var CupSampleMatchFactory = {
  scenarios: ["EQUAL", "HOME_FAVORITE", "AWAY_FAVORITE", "LOWER_LEAGUE_HOME", "FINAL_NEUTRAL"],
  makeInput: (index, scenario) => {
    const seed = `cupv2_balance_${scenario}_${index}`;
    const quality = scenarioQuality(scenario, index);
    const instructions = scenarioInstructions(scenario);
    const stadiumSupport = stadiumSupportForScenario(scenario);
    return {
      seed,
      home: makeTeam({
        side: "HOME",
        prefix: `HOME_${scenario}_${index}`,
        name: `Gospodarze ${scenario}`,
        quality: quality.home,
        tactic: makeTactic(`home_${scenario}_${index}`, instructions.homeStyle),
        instructions: instructions.home,
        stadiumSupport: stadiumSupport.home
      }),
      away: makeTeam({
        side: "AWAY",
        prefix: `AWAY_${scenario}_${index}`,
        name: `Go\u015Bcie ${scenario}`,
        quality: quality.away,
        tactic: makeTactic(`away_${scenario}_${index}`, instructions.awayStyle),
        instructions: instructions.away,
        stadiumSupport: stadiumSupport.away
      }),
      environment: {
        pitchQuality: Math.round(68 + seededRandom(seed, 7, 90) * 28),
        stadiumCapacity: scenario === "FINAL_NEUTRAL" ? 56e3 : 9e3 + Math.round(seededRandom(seed, 8, 91) * 23e3),
        attendance: scenario === "FINAL_NEUTRAL" ? 48e3 : 5e3 + Math.round(seededRandom(seed, 9, 92) * 18e3),
        referee: makeReferee(seed),
        weather: {
          tempC: Math.round(4 + seededRandom(seed, 10, 93) * 20),
          precipitationChance: Math.round(seededRandom(seed, 11, 94) * 70),
          windKmh: Math.round(seededRandom(seed, 12, 95) * 32),
          description: "Warunki testowe",
          weatherIntensity: seededRandom(seed, 13, 96) * 0.65
        }
      },
      config: {
        calibrationMode: true,
        enableExtraTime: true,
        enablePenaltyShootout: true
      },
      calibration: {
        scenario,
        homeQuality: quality.home.base,
        awayQuality: quality.away.base,
        expectedFavorite: expectedFavoriteForScenario(scenario)
      }
    };
  },
  makeBatch: (matchesPerScenario) => CupSampleMatchFactory.scenarios.flatMap(
    (scenario) => Array.from(
      { length: matchesPerScenario },
      (_, index) => CupSampleMatchFactory.makeInput(index, scenario)
    )
  )
};

// tests/MatchEngineV2CoachBalanceTests.ts
var emptyTotals = () => ({
  initiativeModifier: 0,
  userShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 0,
  injuryMultiplier: 0
});
var addEffect = (totals, effect) => {
  Object.keys(totals).forEach((key) => {
    totals[key] += effect[key];
  });
};
var averageEffect = (totals, count) => Object.fromEntries(
  Object.keys(totals).map((key) => [key, totals[key] / count])
);
var assertFiniteAndBounded = (effect, kind) => {
  Object.keys(emptyTotals()).forEach((key) => {
    import_strict.default.ok(Number.isFinite(effect[key]), `${kind}: ${key} musi by\u0107 sko\u0144czon\u0105 liczb\u0105.`);
  });
  const bounds = kind === "instruction" ? {
    initiativeModifier: [-0.055, 0.05],
    userShotModifier: [-0.014, 0.012],
    opponentShotModifier: [-0.01, 0.022],
    turnoverRiskModifier: [-0.1, 0.16],
    fatigueExtra: [-0.014, 0.055],
    foulMultiplier: [0.9, 1.35],
    injuryMultiplier: [0.92, 1.3]
  } : {
    initiativeModifier: [-0.026, 0.026],
    userShotModifier: [-8e-3, 8e-3],
    opponentShotModifier: [-8e-3, 9e-3],
    turnoverRiskModifier: [-0.05, 0.05],
    fatigueExtra: [-9e-3, 0.022],
    foulMultiplier: [0.88, 1.18],
    injuryMultiplier: [0.94, 1.12]
  };
  Object.keys(bounds).forEach((key) => {
    const [minimum, maximum] = bounds[key];
    import_strict.default.ok(
      effect[key] >= minimum - 1e-9 && effect[key] <= maximum + 1e-9,
      `${kind}: ${key}=${effect[key]} przekracza zakres ${minimum}..${maximum}.`
    );
  });
};
var assertHasBenefitAndCost = (id, effect) => {
  const footballValues = [
    effect.initiativeModifier,
    effect.userShotModifier,
    -effect.opponentShotModifier,
    -effect.turnoverRiskModifier,
    -effect.fatigueExtra,
    1 - effect.foulMultiplier,
    1 - effect.injuryMultiplier
  ];
  import_strict.default.ok(footballValues.some((value) => value > 5e-5), `${id} nie ma wykrywalnej korzy\u015Bci.`);
  import_strict.default.ok(footballValues.some((value) => value < -5e-5), `${id} nie ma wykrywalnego kosztu.`);
};
var instructionIds = [
  "NARROW",
  "WIDE",
  "CALM_DOWN",
  "SPEED_UP",
  "KEEP_BALL",
  "TAKE_RISKS",
  "CLOSE_DOWN",
  "DROP_BACK",
  "ALL_FORWARD",
  "TIME_WASTE"
];
var sample = CupSampleMatchFactory.makeInput(731, "EQUAL");
var home = sample.home;
var away = sample.away;
var startingXI = home.lineup.startingXI;
var fatigueMap = Object.fromEntries(startingXI.filter(Boolean).map((id) => [id, 88]));
var defensiveInstructions = {
  ...home.instructions,
  mindset: "DEFENSIVE",
  tempo: "SLOW",
  intensity: "CAUTIOUS",
  passing: "SHORT",
  pressing: "NORMAL",
  counterAttack: "COUNTER",
  marking: "ZONE"
};
var offensiveInstructions = {
  ...home.instructions,
  mindset: "OFFENSIVE",
  tempo: "FAST",
  intensity: "AGGRESSIVE",
  passing: "LONG",
  pressing: "PRESSING",
  counterAttack: "NORMAL",
  marking: "MAN"
};
var balancedInstructions = {
  ...home.instructions,
  mindset: "NEUTRAL",
  tempo: "NORMAL",
  intensity: "NORMAL",
  passing: "MIXED",
  pressing: "NORMAL",
  counterAttack: "NORMAL",
  marking: "NONE"
};
var defensiveTactic = { ...home.tactic, attackBias: 36, defenseBias: 82, pressingIntensity: 38 };
var offensiveTactic = { ...home.tactic, attackBias: 82, defenseBias: 38, pressingIntensity: 82 };
var balancedTactic = { ...home.tactic, attackBias: 55, defenseBias: 55, pressingIntensity: 55 };
var instructionScenario = (id) => {
  if (["NARROW", "CALM_DOWN", "KEEP_BALL", "DROP_BACK", "TIME_WASTE"].includes(id)) {
    return { instructions: defensiveInstructions, tactic: defensiveTactic, scoreDiff: 1 };
  }
  if (["SPEED_UP", "TAKE_RISKS", "CLOSE_DOWN", "ALL_FORWARD"].includes(id)) {
    return { instructions: offensiveInstructions, tactic: offensiveTactic, scoreDiff: -1 };
  }
  return { instructions: balancedInstructions, tactic: balancedTactic, scoreDiff: 0 };
};
var instructionAverages = {};
instructionIds.forEach((id, optionIndex) => {
  const totals = emptyTotals();
  const scenario = instructionScenario(id);
  for (let seed = 1; seed <= 120; seed += 1) {
    const issued = UserCoachInstructionService.issue({
      id,
      minute: 70,
      sessionSeed: seed * 1009 + optionIndex * 37
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
      opponentPassing: away.instructions.passing
    });
    import_strict.default.equal(effect.active, true);
    assertFiniteAndBounded(effect, "instruction");
    addEffect(totals, effect);
  }
  const average2 = averageEffect(totals, 120);
  assertHasBenefitAndCost(id, average2);
  instructionAverages[id] = average2;
});
import_strict.default.ok(instructionAverages.NARROW.opponentShotModifier < 0 && instructionAverages.NARROW.initiativeModifier < 0);
import_strict.default.ok(instructionAverages.WIDE.initiativeModifier > 0 && instructionAverages.WIDE.turnoverRiskModifier > 0);
import_strict.default.ok(instructionAverages.CALM_DOWN.turnoverRiskModifier < 0 && instructionAverages.CALM_DOWN.initiativeModifier < 0);
import_strict.default.ok(instructionAverages.SPEED_UP.initiativeModifier > 0 && instructionAverages.SPEED_UP.fatigueExtra > 0);
import_strict.default.ok(instructionAverages.KEEP_BALL.turnoverRiskModifier < 0 && instructionAverages.KEEP_BALL.userShotModifier < 0);
import_strict.default.ok(instructionAverages.TAKE_RISKS.userShotModifier > 0 && instructionAverages.TAKE_RISKS.turnoverRiskModifier > 0);
import_strict.default.ok(instructionAverages.CLOSE_DOWN.initiativeModifier > 0 && instructionAverages.CLOSE_DOWN.foulMultiplier > 1);
import_strict.default.ok(instructionAverages.DROP_BACK.opponentShotModifier < 0 && instructionAverages.DROP_BACK.initiativeModifier < 0);
import_strict.default.ok(instructionAverages.ALL_FORWARD.userShotModifier > 0 && instructionAverages.ALL_FORWARD.opponentShotModifier > 0);
import_strict.default.ok(instructionAverages.TIME_WASTE.turnoverRiskModifier < 0 && instructionAverages.TIME_WASTE.userShotModifier < 0);
var baseSituation = {
  scoreDiff: 0,
  shotDiff: 0,
  shotsOnTargetDiff: 0,
  userMomentum: 0,
  recentlyScored: false,
  recentlyConceded: false,
  averageFatigue: 86,
  averageMorale: 62,
  yellowCardCount: 0
};
var shoutSituations = {
  MOTIVATE: { ...baseSituation, scoreDiff: -2, shotDiff: -5, userMomentum: -24, averageMorale: 42 },
  PRAISE: { ...baseSituation, scoreDiff: 3, shotDiff: 6, shotsOnTargetDiff: 4, userMomentum: 38, recentlyScored: true },
  FOCUS: { ...baseSituation, scoreDiff: 1, userMomentum: 8 },
  NO_PANIC: { ...baseSituation, scoreDiff: -1, recentlyConceded: true, userMomentum: -34 },
  MORE_EFFORT: { ...baseSituation, scoreDiff: -1, shotDiff: -4, userMomentum: -22, averageMorale: 38 },
  CALM_EMOTIONS: { ...baseSituation, scoreDiff: -1, shotDiff: 3, yellowCardCount: 4 },
  DO_BETTER: { ...baseSituation, scoreDiff: -2, shotDiff: -6, userMomentum: -24, averageMorale: 35 },
  DONT_GIVE_UP: { ...baseSituation, scoreDiff: -1, recentlyConceded: true, userMomentum: -30 }
};
var shoutIds = Object.keys(shoutSituations);
var shoutAverages = {};
shoutIds.forEach((id, optionIndex) => {
  const totals = emptyTotals();
  let responseTotal = 0;
  for (let seed = 1; seed <= 120; seed += 1) {
    const rng = UserCoachShoutService.createRngState(seed * 2017 + optionIndex * 53);
    const issued = UserCoachShoutService.issue({
      id,
      minute: 70,
      rngState: rng,
      situation: shoutSituations[id]
    });
    const effect = UserCoachShoutService.getEffects({
      active: issued.active,
      minute: issued.active.startsMinute,
      rngState: issued.rngState,
      players: home.players,
      startingXI,
      fatigueMap,
      yellowCards: {}
    });
    import_strict.default.equal(effect.active, true);
    assertFiniteAndBounded(effect, "shout");
    responseTotal += effect.averageResponse;
    addEffect(totals, effect);
  }
  const average2 = averageEffect(totals, 120);
  import_strict.default.ok(responseTotal / 120 > 0.1, `${id} powinien pomaga\u0107 w dopasowanym kontek\u015Bcie.`);
  assertHasBenefitAndCost(id, average2);
  shoutAverages[id] = average2;
});
import_strict.default.ok(shoutAverages.MOTIVATE.initiativeModifier > 0 && shoutAverages.MOTIVATE.fatigueExtra > 0);
import_strict.default.ok(shoutAverages.PRAISE.userShotModifier > 0 && shoutAverages.PRAISE.opponentShotModifier > 0);
import_strict.default.ok(shoutAverages.FOCUS.turnoverRiskModifier < 0 && shoutAverages.FOCUS.fatigueExtra > 0);
import_strict.default.ok(shoutAverages.NO_PANIC.turnoverRiskModifier < 0 && shoutAverages.NO_PANIC.initiativeModifier < 0);
import_strict.default.ok(shoutAverages.MORE_EFFORT.initiativeModifier > 0 && shoutAverages.MORE_EFFORT.foulMultiplier > 1);
import_strict.default.ok(shoutAverages.CALM_EMOTIONS.foulMultiplier < 1 && shoutAverages.CALM_EMOTIONS.initiativeModifier < 0);
import_strict.default.ok(shoutAverages.DO_BETTER.userShotModifier > 0 && shoutAverages.DO_BETTER.turnoverRiskModifier > 0);
import_strict.default.ok(shoutAverages.DONT_GIVE_UP.initiativeModifier > 0 && shoutAverages.DONT_GIVE_UP.injuryMultiplier > 1);
console.log("MatchEngineV2CoachBalanceTests: OK", {
  instructions: instructionIds.length,
  shouts: shoutIds.length,
  seedsPerOption: 120
});
