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

// tests/UserCoachShoutServiceTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/UserCoachShoutService.ts
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
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
var BASE_EFFECTS = {
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
var INACTIVE_EFFECTS = {
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
    players: players2,
    startingXI: startingXI2,
    fatigueMap: fatigueMap2,
    yellowCards,
    actionContributions = {}
  }) => {
    if (!active || !rngState || minute < active.startsMinute || minute > active.expiryMinute) return INACTIVE_EFFECTS;
    const ids = new Set(startingXI2.filter((id) => id !== null));
    const activePlayers = players2.filter((player) => ids.has(player.id));
    if (activePlayers.length === 0) return INACTIVE_EFFECTS;
    const alignment = clamp(active.contextFit * 0.55 + active.mentalFit * 0.45, -2, 2);
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
      const performanceAdjustment = clamp(contribution * 0.08, -0.12, 0.18);
      const repeatAdjustment = active.repeatCount * -0.22;
      const confusionAdjustment = minute <= active.confusionUntilMinute ? -0.55 : 0;
      let responseScore = alignment + getPersonalityAdjustment(active.id, personality) + dayBias + responseNoise + mentalityStability + moraleAdjustment + fatigueAdjustment + cardAdjustment + performanceAdjustment + repeatAdjustment + confusionAdjustment;
      const instability = clamp((55 - mentality) / 260 + (45 - morale) / 300 + (70 - fatigue) / 350, -0.02, 0.1);
      const unexpectedChance = clamp(0.035 + instability + (active.mentalState === "NERVOUS" || active.mentalState === "FRUSTRATED" ? 0.025 : 0), 0.02, 0.15);
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
      userShotModifier: clamp(base.userShotModifier * averageResponse, -8e-3, 8e-3),
      opponentShotModifier: clamp(base.opponentShotModifier * averageResponse, -8e-3, 9e-3),
      turnoverRiskModifier: clamp(base.turnoverRiskModifier * averageResponse, -0.05, 0.05),
      fatigueExtra: clamp(base.fatigueExtra * averageResponse, -9e-3, 0.022),
      foulMultiplier: clamp(1 + (base.foulMultiplier - 1) * averageResponse, 0.88, 1.18),
      injuryMultiplier: clamp(1 + (base.injuryMultiplier - 1) * averageResponse, 0.94, 1.12)
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
      alignment: clamp(contextFit * 0.55 + mentalFit * 0.45, -2, 2)
    };
  }
};

// tests/UserCoachShoutServiceTests.ts
var makePlayer = (index, overrides = {}) => ({
  id: `shout-player-${index}`,
  firstName: "Test",
  lastName: `Player ${index}`,
  age: 25,
  clubId: "user-club",
  nationality: "POLAND" /* POLAND */,
  position: index === 0 ? "GK" /* GK */ : "MID" /* MID */,
  overallRating: 68,
  attributes: {
    strength: 65,
    stamina: 70,
    pace: 65,
    defending: 65,
    passing: 68,
    attacking: 65,
    finishing: 62,
    technique: 67,
    vision: 66,
    dribbling: 64,
    heading: 64,
    positioning: 68,
    goalkeeping: index === 0 ? 70 : 10,
    freeKicks: 55,
    talent: 65,
    penalties: 55,
    corners: 55,
    aggression: 58,
    crossing: 62,
    leadership: 64,
    mentality: 78,
    workRate: 72
  },
  stats: {
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 0,
    minutesPlayed: 0,
    seasonalChanges: {},
    ratingHistory: []
  },
  health: { status: "HEALTHY" /* HEALTHY */ },
  condition: 95,
  suspensionMatches: 0,
  contractEndDate: "2030-06-30",
  annualSalary: 1e5,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  morale: 62,
  moralePersonality: "PROFESSIONAL",
  ...overrides
});
var players = Array.from({ length: 11 }, (_, index) => makePlayer(index));
var startingXI = players.map((player) => player.id);
var fatigueMap = Object.fromEntries(startingXI.map((id) => [id, 92]));
var losingPoorly = {
  scoreDiff: -2,
  shotDiff: -6,
  shotsOnTargetDiff: -3,
  userMomentum: -24,
  recentlyScored: false,
  recentlyConceded: false,
  averageFatigue: 84,
  averageMorale: 45,
  yellowCardCount: 1
};
var leadingComfortably = {
  scoreDiff: 3,
  shotDiff: 7,
  shotsOnTargetDiff: 4,
  userMomentum: 38,
  recentlyScored: false,
  recentlyConceded: false,
  averageFatigue: 82,
  averageMorale: 72,
  yellowCardCount: 0
};
var fixedRngA = UserCoachShoutService.createRngState(123456789);
var fixedRngB = UserCoachShoutService.createRngState(123456789);
import_strict.default.deepEqual(fixedRngA, fixedRngB, "Sta\u0142e prywatne entropy powinno dawa\u0107 odtwarzalny stan wy\u0142\u0105cznie w testach.");
var firstIssue = UserCoachShoutService.issue({
  id: "MOTIVATE",
  minute: 20,
  rngState: fixedRngA,
  situation: losingPoorly
});
var replayedIssue = UserCoachShoutService.issue({
  id: "MOTIVATE",
  minute: 20,
  rngState: fixedRngB,
  situation: losingPoorly
});
import_strict.default.deepEqual(firstIssue, replayedIssue, "Ten sam zapis stanu emocjonalnego musi odtwarza\u0107 wydany ju\u017C okrzyk.");
import_strict.default.equal(firstIssue.rngState.drawCount, 4, "Ka\u017Cdy okrzyk powinien przesuwa\u0107 osobny strumie\u0144 RNG.");
var secondIssue = UserCoachShoutService.issue({
  id: "MOTIVATE",
  minute: 25,
  rngState: firstIssue.rngState,
  situation: losingPoorly,
  previousActive: firstIssue.active,
  memory: firstIssue.memory
});
import_strict.default.equal(secondIssue.rngState.drawCount, 8, "Kolejny okrzyk musi kontynuowa\u0107 strumie\u0144 zamiast wraca\u0107 do seeda meczu.");
import_strict.default.notEqual(secondIssue.active.responseSeed, firstIssue.active.responseSeed, "Kolejne okrzyki musz\u0105 otrzymywa\u0107 \u015Bwie\u017Ce losowanie.");
import_strict.default.equal(secondIssue.active.repeatCount, 1, "Spamowanie tym samym okrzykiem powinno mie\u0107 malej\u0105c\u0105 skuteczno\u015B\u0107.");
import_strict.default.equal(
  UserCoachShoutService.getContextCategory({ ...losingPoorly, recentlyConceded: true }),
  "JUST_CONCEDED",
  "\u015Awie\u017Co stracony gol powinien mie\u0107 pierwsze\u0144stwo w kontek\u015Bcie okrzyku."
);
import_strict.default.equal(
  UserCoachShoutService.getContextCategory({ ...losingPoorly, shotDiff: 5, shotsOnTargetDiff: 3, userMomentum: 20 }),
  "LOSING_WELL",
  "Silny wyst\u0119p mimo niekorzystnego wyniku nie mo\u017Ce by\u0107 oceniany jak s\u0142aba gra."
);
import_strict.default.equal(UserCoachShoutService.getMentalState(leadingComfortably), "COMPLACENT");
import_strict.default.equal(UserCoachShoutService.getMentalState({ ...losingPoorly, averageFatigue: 58 }), "EXHAUSTED");
var activeMinute = firstIssue.active.startsMinute;
var positiveEffects = UserCoachShoutService.getEffects({
  active: firstIssue.active,
  minute: activeMinute,
  rngState: firstIssue.rngState,
  players,
  startingXI,
  fatigueMap,
  yellowCards: {}
});
import_strict.default.equal(positiveEffects.active, true);
import_strict.default.ok(positiveEffects.averageResponse > 0, "Logiczny okrzyk powinien przeci\u0119tnie pomaga\u0107 stabilnej dru\u017Cynie.");
import_strict.default.ok(positiveEffects.positiveShare > 0.5, "Wi\u0119kszo\u015B\u0107 stabilnego zespo\u0142u powinna zareagowa\u0107 pozytywnie.");
var beforeReaction = UserCoachShoutService.getEffects({
  active: firstIssue.active,
  minute: firstIssue.active.startsMinute - 1,
  rngState: firstIssue.rngState,
  players,
  startingXI,
  fatigueMap,
  yellowCards: {}
});
var afterExpiry = UserCoachShoutService.getEffects({
  active: firstIssue.active,
  minute: firstIssue.active.expiryMinute + 1,
  rngState: firstIssue.rngState,
  players,
  startingXI,
  fatigueMap,
  yellowCards: {}
});
import_strict.default.equal(beforeReaction.active, false, "Okrzyk nie mo\u017Ce dzia\u0142a\u0107 przed reakcj\u0105 zawodnik\xF3w.");
import_strict.default.equal(afterExpiry.active, false, "Okrzyk musi wygasa\u0107 automatycznie.");
var stableBias = UserCoachShoutService.getPlayerMatchDayBias(firstIssue.rngState.entropySeed, players[3].id);
import_strict.default.equal(
  stableBias,
  UserCoachShoutService.getPlayerMatchDayBias(firstIssue.rngState.entropySeed, players[3].id),
  "Dyspozycja dnia zawodnika powinna pozosta\u0107 sta\u0142a przez ca\u0142y mecz."
);
var foundUnexpectedReaction = false;
for (let entropy = 1; entropy <= 400 && !foundUnexpectedReaction; entropy += 1) {
  const rng = UserCoachShoutService.createRngState(entropy);
  const issued = UserCoachShoutService.issue({ id: "MOTIVATE", minute: 20, rngState: rng, situation: losingPoorly });
  const effects = UserCoachShoutService.getEffects({
    active: issued.active,
    minute: issued.active.startsMinute,
    rngState: issued.rngState,
    players,
    startingXI,
    fatigueMap,
    yellowCards: {}
  });
  foundUnexpectedReaction = effects.unexpectedShare > 0;
}
import_strict.default.equal(foundUnexpectedReaction, true, "Rzadkie reakcje wbrew logice musz\u0105 by\u0107 realnie osi\u0105galne.");
import_strict.default.equal(Array.isArray(firstIssue.active), false, "Aktywny okrzyk nie mo\u017Ce przechowywa\u0107 rosn\u0105cej historii.");
import_strict.default.equal("playerResponses" in firstIssue.active, false, "Reakcje zawodnik\xF3w powinny by\u0107 odtwarzane z ma\u0142ych seed\xF3w, nie zapisywane jako tablica.");
console.log("UserCoachShoutService tests passed.");
