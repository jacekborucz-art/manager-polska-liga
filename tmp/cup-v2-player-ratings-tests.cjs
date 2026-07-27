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

// tests/CupPlayerRatingServiceTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

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
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// services/match/engines/cupV2/CupPlayerRatingService.ts
var resultImpact = (sideScore, opponentScore) => {
  if (sideScore > opponentScore) return 0.22;
  if (sideScore === opponentScore) return 0.04;
  return -0.16;
};
var minutesImpact = (minutesPlayed) => {
  if (minutesPlayed <= 0) return -6;
  if (minutesPlayed < 15) return -0.22;
  if (minutesPlayed < 30) return -0.08;
  if (minutesPlayed >= 90) return 0.04;
  return 0;
};
var teamControlImpact = (teamStats2, opponentStats2) => {
  if (!teamStats2 || !opponentStats2) return 0;
  return clamp(
    (teamStats2.xG - opponentStats2.xG) * 0.055 + (teamStats2.shotsOnTarget - opponentStats2.shotsOnTarget) * 0.018 + (teamStats2.corners - opponentStats2.corners) * 0.01 - teamStats2.redCards * 0.035,
    -0.22,
    0.22
  );
};
var fatigueImpact = (minutesPlayed, finalFatigue) => {
  if (finalFatigue === void 0 || minutesPlayed < 45) return 0;
  if (finalFatigue < 25) return -0.14;
  if (finalFatigue < 38) return -0.07;
  if (finalFatigue > 72 && minutesPlayed >= 85) return 0.05;
  return 0;
};
var goalWeight = (entry) => {
  if (entry.position === "FWD" /* FWD */) return 0.92;
  if (entry.position === "MID" /* MID */) return 1.05;
  if (entry.position === "DEF" /* DEF */) return 1.2;
  return 1.28;
};
var assistWeight = (entry) => {
  if (entry.position === "MID" /* MID */) return 0.62;
  if (entry.position === "FWD" /* FWD */) return 0.48;
  if (entry.position === "DEF" /* DEF */) return 0.58;
  return 0.45;
};
var attackingImpact = (entry) => {
  const conversionImpact = clamp((entry.goals - entry.xG) * 0.3, -0.45, 0.55);
  const wastePenalty = entry.goals === 0 && entry.xG >= 0.7 ? clamp((entry.xG - 0.55) * 0.22, 0, 0.22) : 0;
  const shotSelectionPenalty = entry.shots >= 4 && entry.shotsOnTarget === 0 ? 0.12 : 0;
  return entry.goals * goalWeight(entry) + entry.assists * assistWeight(entry) + entry.shotsOnTarget * 0.075 - entry.shotsOffTarget * 0.035 + Math.min(0.34, entry.xG * 0.14) + conversionImpact - wastePenalty - shotSelectionPenalty + entry.posts * 0.05 + entry.bars * 0.05;
};
var creationImpact = (entry) => entry.chancesCreated * (entry.position === "MID" /* MID */ ? 0.095 : 0.075) + entry.keyPasses * (entry.position === "MID" /* MID */ ? 0.075 : 0.055) + entry.foulsWon * 0.035 - entry.offsides * 0.055;
var goalkeeperImpact = (entry, opponentScore) => {
  if (entry.position !== "GK" /* GK */) return 0;
  const shotsFaced = entry.saves + entry.goalsConceded;
  const saveRate = shotsFaced > 0 ? entry.saves / shotsFaced : 1;
  const cleanSheet = entry.minutesPlayed >= 60 && opponentScore === 0 ? 0.38 : 0;
  return entry.saves * 0.17 + clamp((saveRate - 0.68) * 0.55, -0.22, 0.28) + cleanSheet - entry.goalsConceded * 0.22 + entry.penaltiesSaved * 0.72;
};
var defensiveImpact = (entry, opponentScore) => {
  if (entry.position === "GK" /* GK */) return 0;
  const cleanSheet = opponentScore === 0 && entry.minutesPlayed >= 60 ? entry.position === "DEF" /* DEF */ ? 0.22 : entry.position === "MID" /* MID */ ? 0.08 : 0.02 : 0;
  const concessionPenalty = opponentScore >= 4 && entry.minutesPlayed >= 60 ? entry.position === "DEF" /* DEF */ ? 0.16 : entry.position === "MID" /* MID */ ? 0.08 : 0.03 : 0;
  return cleanSheet - concessionPenalty;
};
var disciplineImpact = (entry) => -entry.foulsCommitted * 0.045 - entry.yellowCards * 0.32 - entry.redCards * 1.22 - entry.ownGoals * 0.95 - entry.penaltiesMissed * 0.52 + entry.penaltiesScored * 0.08;
var healthImpact = (entry) => -entry.injuriesLight * 0.04 - entry.injuriesSevere * 0.12;
var CupPlayerRatingService = {
  /**
   * Ocena zawodnika jest modelem raportowym, nie generatorem meczu. Korzysta z
   * wyniku, roli, minut, statystyk indywidualnych, jakości okazji, bramkarza,
   * dyscypliny i zmęczenia po meczu.
   */
  calculate: ({
    entry,
    sideScore,
    opponentScore,
    teamStats: teamStats2,
    opponentStats: opponentStats2,
    finalFatigue
  }) => {
    if (entry.minutesPlayed <= 0) return 0;
    const rating = 6 + resultImpact(sideScore, opponentScore) + minutesImpact(entry.minutesPlayed) + teamControlImpact(teamStats2, opponentStats2) + fatigueImpact(entry.minutesPlayed, finalFatigue) + attackingImpact(entry) + creationImpact(entry) + goalkeeperImpact(entry, opponentScore) + defensiveImpact(entry, opponentScore) + disciplineImpact(entry) + healthImpact(entry);
    return Number(clamp(rating, 1, 10).toFixed(1));
  }
};

// services/match/engines/cupV2/CupPlayerStatsAggregator.ts
var SHOT_TYPES = /* @__PURE__ */ new Set([
  "SHOT" /* SHOT */,
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

// services/match/engines/cupV2/CupSampleMatchFactory.ts
var positionBoosts = {
  ["GK" /* GK */]: { goalkeeping: 14, positioning: 8, mentality: 5, passing: 2 },
  ["DEF" /* DEF */]: { defending: 11, positioning: 8, heading: 6, strength: 5, aggression: 3 },
  ["MID" /* MID */]: { passing: 9, vision: 7, technique: 7, stamina: 5, workRate: 5 },
  ["FWD" /* FWD */]: { finishing: 11, attacking: 9, pace: 5, dribbling: 4, technique: 4 }
};

// tests/CupPlayerRatingServiceTests.ts
var emptyTeamStats = (overrides = {}) => ({
  possessionTicks: 50,
  shots: 10,
  shotsOnTarget: 4,
  goals: 1,
  xG: 1.2,
  corners: 4,
  fouls: 3,
  offsides: 1,
  yellowCards: 1,
  redCards: 0,
  injuries: 0,
  freeKicks: 2,
  penalties: 0,
  posts: 0,
  bars: 0,
  saves: 3,
  ...overrides
});
var playerStats = (overrides) => ({
  playerId: "p1",
  name: "Test Player",
  side: "HOME",
  clubId: "club",
  position: "MID" /* MID */,
  starter: true,
  startedSecond: 0,
  endedSecond: void 0,
  minutesPlayed: 90,
  goals: 0,
  ownGoals: 0,
  assists: 0,
  shots: 0,
  shotsOnTarget: 0,
  shotsOffTarget: 0,
  posts: 0,
  bars: 0,
  xG: 0,
  chancesCreated: 0,
  keyPasses: 0,
  foulsCommitted: 0,
  foulsWon: 0,
  offsides: 0,
  yellowCards: 0,
  redCards: 0,
  injuriesLight: 0,
  injuriesSevere: 0,
  substitutionsOn: 0,
  substitutionsOff: 0,
  saves: 0,
  goalsConceded: 0,
  penaltiesTaken: 0,
  penaltiesScored: 0,
  penaltiesMissed: 0,
  penaltiesSaved: 0,
  rating: 6,
  ...overrides
});
var teamStats = emptyTeamStats({ shots: 15, shotsOnTarget: 7, goals: 2, xG: 2.1, corners: 6 });
var opponentStats = emptyTeamStats({ shots: 7, shotsOnTarget: 2, goals: 0, xG: 0.6, corners: 2 });
var scorer = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: "FWD" /* FWD */,
    goals: 2,
    shots: 4,
    shotsOnTarget: 3,
    shotsOffTarget: 1,
    xG: 0.9
  }),
  sideScore: 2,
  opponentScore: 0,
  teamStats,
  opponentStats,
  finalFatigue: 66
});
var creator = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: "MID" /* MID */,
    assists: 1,
    chancesCreated: 4,
    keyPasses: 3,
    foulsWon: 2
  }),
  sideScore: 2,
  opponentScore: 0,
  teamStats,
  opponentStats,
  finalFatigue: 70
});
var cleanSheetKeeper = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: "GK" /* GK */,
    saves: 5,
    goalsConceded: 0,
    penaltiesSaved: 1
  }),
  sideScore: 1,
  opponentScore: 0,
  teamStats,
  opponentStats,
  finalFatigue: 78
});
var punishedDefender = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: "DEF" /* DEF */,
    ownGoals: 1,
    redCards: 1,
    foulsCommitted: 3,
    yellowCards: 1
  }),
  sideScore: 0,
  opponentScore: 2,
  teamStats: opponentStats,
  opponentStats: teamStats,
  finalFatigue: 44
});
var wastefulForward = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: "FWD" /* FWD */,
    shots: 5,
    shotsOnTarget: 0,
    shotsOffTarget: 5,
    xG: 0.9,
    penaltiesTaken: 1,
    penaltiesMissed: 1
  }),
  sideScore: 0,
  opponentScore: 1,
  teamStats: emptyTeamStats({ shots: 16, shotsOnTarget: 2, goals: 0, xG: 1.7 }),
  opponentStats: emptyTeamStats({ shots: 8, shotsOnTarget: 3, goals: 1, xG: 0.9 }),
  finalFatigue: 33
});
var unusedSub = CupPlayerRatingService.calculate({
  entry: playerStats({ minutesPlayed: 0, startedSecond: void 0, starter: false }),
  sideScore: 1,
  opponentScore: 1
});
import_strict.default.ok(scorer >= 8, `Two-goal scorer rating too low: ${scorer}`);
import_strict.default.ok(creator >= 6.9 && creator < scorer, `Creator rating should be good but below two-goal scorer: ${creator}`);
import_strict.default.ok(cleanSheetKeeper >= 7.4, `Clean-sheet keeper with penalty save rating too low: ${cleanSheetKeeper}`);
import_strict.default.ok(punishedDefender <= 4.2, `Own goal and red card should be heavily punished: ${punishedDefender}`);
import_strict.default.ok(wastefulForward < 5.8, `Wasteful forward should be below average: ${wastefulForward}`);
import_strict.default.equal(unusedSub, 0);
console.table([{
  scorer,
  creator,
  cleanSheetKeeper,
  punishedDefender,
  wastefulForward,
  unusedSub
}]);
console.log("CupPlayerRatingServiceTests: OK");
