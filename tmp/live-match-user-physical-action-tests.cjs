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

// tests/LiveMatchUserPhysicalActionTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/match/live/LiveMatchUserPhysicalAction.ts
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var getActiveUserIds = (lineup2) => lineup2.filter((id) => id !== null);
var calculateLiveTiredPlayerActionPenalty = (fatigue, rng) => {
  if (fatigue >= 85) return 0;
  const depth = clamp((85 - fatigue) / 45, 0, 1);
  const deterministicNoise = 0.85 + clamp(rng(), 0, 1) * 0.3;
  return clamp((0.01 + depth * 0.04) * deterministicNoise, 0.01, 0.05);
};
var calculateLiveInjuredPlayerActionPenalty = (severity, rng) => {
  const roll = clamp(rng(), 0, 1);
  return severity === "SEVERE" /* SEVERE */ ? 0.075 + roll * 0.025 : 0.05 + roll * 0.025;
};
var calculateLiveUnusedSubstitutionActionPenalty = (rng) => 0.02 + clamp(rng(), 0, 1) * 0.03;
var calculateLiveCriticalExhaustionActionCap = (redZonePlayerCount) => {
  if (redZonePlayerCount >= 11) return 0.012;
  if (redZonePlayerCount >= 9) return 0.018;
  if (redZonePlayerCount >= 7) return 0.026;
  if (redZonePlayerCount >= 5) return 0.036;
  return null;
};
var calculateLiveUserPhysicalActionSuppression = ({
  minute,
  lineup: lineup2,
  fatigueMap,
  matchInjuries,
  substitutionsUsed,
  maxSubstitutions = 5,
  existingPhysicalActionPenalty = 0,
  rng
}) => {
  const activeIds = getActiveUserIds(lineup2);
  const redZonePlayerCount = activeIds.filter((id) => (fatigueMap[id] ?? 100) < 60).length;
  const tiredPlayerPenalties = activeIds.map((id) => calculateLiveTiredPlayerActionPenalty(fatigueMap[id] ?? 100, rng)).filter((value) => value > 0);
  const injuredPlayerPenalties = activeIds.map((id) => matchInjuries[id]).filter((severity) => severity !== void 0).map((severity) => calculateLiveInjuredPlayerActionPenalty(severity, rng));
  const unusedSubstitutions = minute >= 60 ? clamp(Math.floor(maxSubstitutions - substitutionsUsed), 0, maxSubstitutions) : 0;
  const substitutionPenalties = Array.from(
    { length: unusedSubstitutions },
    () => calculateLiveUnusedSubstitutionActionPenalty(rng)
  );
  const fatiguePenalty = tiredPlayerPenalties.reduce((sum, value) => sum + value, 0);
  const injuryPenalty = injuredPlayerPenalties.reduce((sum, value) => sum + value, 0);
  const substitutionPenalty = substitutionPenalties.reduce((sum, value) => sum + value, 0);
  const rawPenalty = fatiguePenalty + injuryPenalty + substitutionPenalty;
  const creditedExistingPenalty = clamp(existingPhysicalActionPenalty, 0, 0.6);
  return {
    tiredPlayerCount: tiredPlayerPenalties.length,
    redZonePlayerCount,
    criticalExhaustionActionCap: calculateLiveCriticalExhaustionActionCap(redZonePlayerCount),
    injuredPlayerCount: injuredPlayerPenalties.length,
    unusedSubstitutions,
    fatiguePenalty,
    injuryPenalty,
    substitutionPenalty,
    rawPenalty,
    creditedExistingPenalty,
    incrementalPenalty: clamp(rawPenalty - creditedExistingPenalty, 0, 0.42)
  };
};

// tests/LiveMatchUserPhysicalActionTests.ts
var lineup = [
  "p1",
  "p2",
  "p3",
  "p4",
  "p5",
  "p6",
  "p7",
  "p8",
  "p9",
  "p10",
  "p11"
];
import_strict.default.equal(calculateLiveTiredPlayerActionPenalty(85, () => 0.5), 0);
import_strict.default.equal(calculateLiveTiredPlayerActionPenalty(84, () => 0), 0.01);
import_strict.default.equal(calculateLiveTiredPlayerActionPenalty(40, () => 1), 0.05);
import_strict.default.equal(calculateLiveInjuredPlayerActionPenalty("LIGHT" /* LIGHT */, () => 0), 0.05);
import_strict.default.equal(calculateLiveInjuredPlayerActionPenalty("SEVERE" /* SEVERE */, () => 1), 0.1);
import_strict.default.equal(calculateLiveUnusedSubstitutionActionPenalty(() => 0), 0.02);
import_strict.default.equal(calculateLiveUnusedSubstitutionActionPenalty(() => 1), 0.05);
import_strict.default.equal(calculateLiveCriticalExhaustionActionCap(4), null);
import_strict.default.equal(calculateLiveCriticalExhaustionActionCap(5), 0.036);
import_strict.default.equal(calculateLiveCriticalExhaustionActionCap(7), 0.026);
import_strict.default.equal(calculateLiveCriticalExhaustionActionCap(9), 0.018);
import_strict.default.equal(calculateLiveCriticalExhaustionActionCap(11), 0.012);
var freshBeforeSixty = calculateLiveUserPhysicalActionSuppression({
  minute: 59,
  lineup,
  fatigueMap: Object.fromEntries(lineup.map((id) => [id, 100])),
  matchInjuries: {},
  substitutionsUsed: 0,
  rng: () => 0.5
});
import_strict.default.equal(freshBeforeSixty.rawPenalty, 0);
import_strict.default.equal(freshBeforeSixty.incrementalPenalty, 0);
import_strict.default.equal(freshBeforeSixty.unusedSubstitutions, 0);
var fatigueOnly = calculateLiveUserPhysicalActionSuppression({
  minute: 45,
  lineup,
  fatigueMap: {
    p1: 84,
    p2: 70,
    p3: 40
  },
  matchInjuries: {},
  substitutionsUsed: 0,
  rng: () => 0.5
});
import_strict.default.equal(fatigueOnly.tiredPlayerCount, 3);
(0, import_strict.default)(fatigueOnly.fatiguePenalty >= 0.03);
(0, import_strict.default)(fatigueOnly.fatiguePenalty <= 0.15);
import_strict.default.equal(fatigueOnly.injuryPenalty, 0);
import_strict.default.equal(fatigueOnly.substitutionPenalty, 0);
var injuriesAndChanges = calculateLiveUserPhysicalActionSuppression({
  minute: 70,
  lineup,
  fatigueMap: Object.fromEntries(lineup.map((id) => [id, 100])),
  matchInjuries: {
    p4: "LIGHT" /* LIGHT */,
    p9: "SEVERE" /* SEVERE */
  },
  substitutionsUsed: 2,
  rng: () => 0.5
});
import_strict.default.equal(injuriesAndChanges.injuredPlayerCount, 2);
import_strict.default.equal(injuriesAndChanges.unusedSubstitutions, 3);
import_strict.default.equal(injuriesAndChanges.injuryPenalty, 0.0625 + 0.0875);
import_strict.default.equal(injuriesAndChanges.substitutionPenalty, 3 * 0.035);
var credited = calculateLiveUserPhysicalActionSuppression({
  minute: 70,
  lineup,
  fatigueMap: Object.fromEntries(lineup.map((id) => [id, 100])),
  matchInjuries: {},
  substitutionsUsed: 0,
  existingPhysicalActionPenalty: 0.1,
  rng: () => 0.5
});
import_strict.default.equal(credited.unusedSubstitutions, 5);
import_strict.default.equal(credited.substitutionPenalty, 5 * 0.035);
import_strict.default.equal(credited.creditedExistingPenalty, 0.1);
import_strict.default.equal(credited.incrementalPenalty, credited.rawPenalty - 0.1);
var exhaustedWholeTeam = calculateLiveUserPhysicalActionSuppression({
  minute: 80,
  lineup,
  fatigueMap: Object.fromEntries(lineup.map((id) => [id, 40])),
  matchInjuries: {},
  substitutionsUsed: 5,
  rng: () => 1
});
import_strict.default.equal(exhaustedWholeTeam.tiredPlayerCount, 11);
import_strict.default.equal(exhaustedWholeTeam.redZonePlayerCount, 11);
import_strict.default.equal(exhaustedWholeTeam.criticalExhaustionActionCap, 0.012);
(0, import_strict.default)(Math.abs(exhaustedWholeTeam.fatiguePenalty - 11 * 0.05) < 1e-7);
import_strict.default.equal(exhaustedWholeTeam.incrementalPenalty, 0.42);
var halfRedTeam = calculateLiveUserPhysicalActionSuppression({
  minute: 80,
  lineup,
  fatigueMap: {
    ...Object.fromEntries(lineup.map((id) => [id, 90])),
    p1: 59,
    p2: 58,
    p3: 57,
    p4: 56,
    p5: 55
  },
  matchInjuries: {},
  substitutionsUsed: 5,
  rng: () => 0.5
});
import_strict.default.equal(halfRedTeam.redZonePlayerCount, 5);
import_strict.default.equal(halfRedTeam.criticalExhaustionActionCap, 0.036);
console.log("LiveMatchUserPhysicalActionTests: OK");
