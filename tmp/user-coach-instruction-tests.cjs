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

// tests/UserCoachInstructionServiceTests.ts
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
  let weightedScore = 0;
  let totalWeight = 0;
  values.forEach(([dimension, value]) => {
    const weight = row.weights?.[dimension] ?? 1;
    weightedScore += value * weight;
    totalWeight += weight;
  });
  let formationAdjustment = 0;
  if (["DROP_BACK", "TIME_WASTE", "NARROW"].includes(id) && tactic.attackBias >= 72) formationAdjustment -= 0.45;
  if (["ALL_FORWARD", "TAKE_RISKS", "SPEED_UP"].includes(id) && tactic.defenseBias >= 75) formationAdjustment -= 0.5;
  if (id === "CLOSE_DOWN" && tactic.pressingIntensity >= 70) formationAdjustment += 0.3;
  if (id === "CLOSE_DOWN" && tactic.pressingIntensity <= 35) formationAdjustment -= 0.35;
  if (id === "WIDE") formationAdjustment += getTacticWidth(tactic) >= 0.58 ? 0.3 : -0.3;
  if (id === "NARROW") formationAdjustment += getTacticWidth(tactic) <= 0.46 ? 0.25 : 0;
  return clamp(weightedScore / Math.max(1, totalWeight) + formationAdjustment, -2, 2);
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
var getActivePlayers = (players, startingXI) => {
  const ids = new Set(startingXI.filter((id) => id !== null));
  return players.filter((player) => ids.has(player.id));
};
var getExecutionFactor = (id, players, startingXI, fatigueMap) => {
  const activePlayers = getActivePlayers(players, startingXI);
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
  const averageFatigue = activePlayers.reduce((sum, player) => sum + (fatigueMap[player.id] ?? 100), 0) / activePlayers.length;
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
    startingXI,
    fatigueMap,
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
      startingXI,
      fatigueMap
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

// tests/UserCoachInstructionServiceTests.ts
var makeTactic = ({
  attackBias = 50,
  defenseBias = 50,
  pressingIntensity = 50,
  width = 0.5
} = {}) => ({
  id: `test-${attackBias}-${defenseBias}-${pressingIntensity}-${width}`,
  name: "Test",
  category: "TEST",
  attackBias,
  defenseBias,
  pressingIntensity,
  slots: [
    { index: 0, role: "GK" /* GK */, x: 0.5, y: 0.9 },
    { index: 1, role: "MID" /* MID */, x: 0.5 - width / 2, y: 0.5 },
    { index: 2, role: "MID" /* MID */, x: 0.5 + width / 2, y: 0.5 }
  ]
});
var makeInstructions = (overrides = {}) => ({
  tempo: "NORMAL",
  mindset: "NEUTRAL",
  intensity: "NORMAL",
  passing: "MIXED",
  pressing: "NORMAL",
  counterAttack: "NORMAL",
  marking: "NONE",
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
  ...overrides
});
var defensiveInstructions = makeInstructions({
  mindset: "DEFENSIVE",
  tempo: "SLOW",
  intensity: "CAUTIOUS",
  passing: "SHORT",
  pressing: "NORMAL",
  counterAttack: "COUNTER",
  marking: "ZONE"
});
var offensiveInstructions = makeInstructions({
  mindset: "OFFENSIVE",
  tempo: "FAST",
  intensity: "AGGRESSIVE",
  passing: "LONG",
  pressing: "PRESSING",
  counterAttack: "NORMAL",
  marking: "MAN"
});
var defensiveTactic = makeTactic({ attackBias: 35, defenseBias: 80, pressingIntensity: 35, width: 0.4 });
var offensiveTactic = makeTactic({ attackBias: 82, defenseBias: 38, pressingIntensity: 82, width: 0.66 });
import_strict.default.ok(
  UserCoachInstructionService.getMatrixCompatibility("DROP_BACK", defensiveInstructions, defensiveTactic) > 0,
  "Cofni\u0119cie powinno wsp\xF3\u0142gra\u0107 z defensywn\u0105 taktyk\u0105."
);
import_strict.default.ok(
  UserCoachInstructionService.getMatrixCompatibility("DROP_BACK", offensiveInstructions, offensiveTactic) < 0,
  "Cofni\u0119cie powinno kolidowa\u0107 z ofensywn\u0105 taktyk\u0105."
);
import_strict.default.ok(
  UserCoachInstructionService.getMatrixCompatibility("TIME_WASTE", defensiveInstructions, defensiveTactic) > UserCoachInstructionService.getMatrixCompatibility("TIME_WASTE", offensiveInstructions, offensiveTactic),
  "Gra na czas musi by\u0107 znacznie lepiej zgodna z woln\u0105 i defensywn\u0105 gr\u0105."
);
import_strict.default.ok(
  UserCoachInstructionService.getMatrixCompatibility("CLOSE_DOWN", offensiveInstructions, offensiveTactic) > 0,
  "Doskok powinien wsp\xF3\u0142gra\u0107 z pressingiem i agresywn\u0105 intensywno\u015Bci\u0105."
);
var firstIssue = UserCoachInstructionService.issue({
  id: "KEEP_BALL",
  minute: 20,
  sessionSeed: 12345
});
var repeatedIssue = UserCoachInstructionService.issue({
  id: "KEEP_BALL",
  minute: 24,
  sessionSeed: 12345,
  previousActive: firstIssue.active,
  memory: firstIssue.memory
});
import_strict.default.deepEqual(
  firstIssue,
  UserCoachInstructionService.issue({ id: "KEEP_BALL", minute: 20, sessionSeed: 12345 }),
  "RNG polecenia musi by\u0107 deterministyczne dla tego samego meczu i minuty."
);
import_strict.default.equal(repeatedIssue.active.repeatCount, 1, "Powtarzanie polecenia powinno obni\u017Ca\u0107 jego skuteczno\u015B\u0107.");
var rapidChange = UserCoachInstructionService.issue({
  id: "TAKE_RISKS",
  minute: 21,
  sessionSeed: 12345,
  previousActive: firstIssue.active,
  memory: firstIssue.memory
});
import_strict.default.equal(rapidChange.active.confusionUntilMinute, 23, "Szybka zmiana polecenia powinna wywo\u0142ywa\u0107 kr\xF3tkie zamieszanie.");
var activeInstruction = (id) => ({
  id,
  issuedMinute: 70,
  startsMinute: 71,
  expiryMinute: 78,
  responseFactor: 1,
  misunderstandingRoll: 1,
  repeatCount: 0,
  confusionUntilMinute: -1
});
var effectsAt = (active, minute, instructions, tactic, scoreDiff) => UserCoachInstructionService.getEffects({
  active,
  minute,
  instructions,
  tactic,
  opponentTactic: makeTactic(),
  players: [],
  startingXI: [],
  fatigueMap: {},
  scoreDiff
});
var inactiveBeforeStart = effectsAt(activeInstruction("ALL_FORWARD"), 70, offensiveInstructions, offensiveTactic, -1);
var activeDuringWindow = effectsAt(activeInstruction("ALL_FORWARD"), 75, offensiveInstructions, offensiveTactic, -1);
var inactiveAfterExpiry = effectsAt(activeInstruction("ALL_FORWARD"), 79, offensiveInstructions, offensiveTactic, -1);
import_strict.default.equal(inactiveBeforeStart.active, false, "Polecenie nie mo\u017Ce dzia\u0142a\u0107 przed reakcj\u0105 zawodnik\xF3w.");
import_strict.default.equal(activeDuringWindow.active, true, "Polecenie powinno dzia\u0142a\u0107 w swoim oknie czasowym.");
import_strict.default.equal(inactiveAfterExpiry.active, false, "Polecenie musi wygasa\u0107 bez rozrostu historii stanu.");
var coherentDropBack = effectsAt(activeInstruction("DROP_BACK"), 75, defensiveInstructions, defensiveTactic, 1);
var conflictingDropBack = effectsAt(activeInstruction("DROP_BACK"), 75, offensiveInstructions, offensiveTactic, 1);
import_strict.default.ok(
  conflictingDropBack.initiativeModifier < coherentDropBack.initiativeModifier,
  "Sprzeczne cofni\u0119cie przy ofensywnej grze powinno mocniej oddawa\u0107 inicjatyw\u0119 rywalowi."
);
import_strict.default.ok(
  conflictingDropBack.opponentShotModifier > coherentDropBack.opponentShotModifier,
  "Konflikt instrukcji powinien zwi\u0119ksza\u0107 szans\u0119 sytuacji przeciwnika."
);
var latePushWhileLosing = effectsAt(activeInstruction("ALL_FORWARD"), 75, offensiveInstructions, offensiveTactic, -1);
var latePushWhileLeading = effectsAt(activeInstruction("ALL_FORWARD"), 75, offensiveInstructions, offensiveTactic, 1);
import_strict.default.ok(
  latePushWhileLosing.initiativeModifier > latePushWhileLeading.initiativeModifier,
  "Wszyscy do przodu powinno by\u0107 korzystniejsze przy przegrywaniu ni\u017C przy prowadzeniu."
);
console.log("UserCoachInstructionService tests passed.");
