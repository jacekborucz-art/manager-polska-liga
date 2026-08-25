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

// tests/LiveMatchGoalCommitTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);
var import_node_fs = require("node:fs");

// services/match/live/LiveMatchGoalCommit.ts
var isCountedGoal = (goal2) => !goal2.isMiss && !goal2.varDisallowed;
var observeCommittedLiveGoal = (previous, current) => {
  const observation = {
    sessionSeed: current.sessionSeed,
    homeScore: current.homeScore,
    awayScore: current.awayScore,
    homeEntries: current.homeGoals.length,
    awayEntries: current.awayGoals.length
  };
  if (!previous || previous.sessionSeed !== current.sessionSeed) {
    return { observation, committedGoal: null };
  }
  const newHomeGoal = current.homeScore > previous.homeScore ? current.homeGoals.slice(previous.homeEntries).filter(isCountedGoal).at(-1) : void 0;
  const newAwayGoal = current.awayScore > previous.awayScore ? current.awayGoals.slice(previous.awayEntries).filter(isCountedGoal).at(-1) : void 0;
  if (newHomeGoal && newAwayGoal) {
    return newHomeGoal.minute >= newAwayGoal.minute ? { observation, committedGoal: { side: "HOME", goal: newHomeGoal } } : { observation, committedGoal: { side: "AWAY", goal: newAwayGoal } };
  }
  if (newHomeGoal) return { observation, committedGoal: { side: "HOME", goal: newHomeGoal } };
  if (newAwayGoal) return { observation, committedGoal: { side: "AWAY", goal: newAwayGoal } };
  return { observation, committedGoal: null };
};

// tests/LiveMatchGoalCommitTests.ts
var goal = (playerName, minute, extra = {}) => ({
  playerName,
  minute,
  isPenalty: false,
  ...extra
});
var baselineState = {
  sessionSeed: 123,
  homeScore: 0,
  awayScore: 0,
  homeGoals: [],
  awayGoals: []
};
var baseline = observeCommittedLiveGoal(null, baselineState);
import_strict.default.equal(baseline.committedGoal, null);
var committedHome = observeCommittedLiveGoal(baseline.observation, {
  ...baselineState,
  homeScore: 1,
  homeGoals: [goal("Kowalski", 12, { scorerId: "home-9" })]
});
import_strict.default.equal(committedHome.committedGoal?.side, "HOME");
import_strict.default.equal(committedHome.committedGoal?.goal.scorerId, "home-9");
var ghostGoalEntryOnly = observeCommittedLiveGoal(baseline.observation, {
  ...baselineState,
  homeGoals: [goal("Kowalski", 12, { scorerId: "home-9" })]
});
import_strict.default.equal(ghostGoalEntryOnly.committedGoal, null);
var ghostScoreOnly = observeCommittedLiveGoal(baseline.observation, {
  ...baselineState,
  homeScore: 1
});
import_strict.default.equal(ghostScoreOnly.committedGoal, null);
var missedPenalty = observeCommittedLiveGoal(baseline.observation, {
  ...baselineState,
  homeGoals: [goal("Kowalski", 18, { isPenalty: true, isMiss: true })]
});
import_strict.default.equal(missedPenalty.committedGoal, null);
var previousAway = {
  ...baseline.observation,
  homeEntries: 1
};
var committedAway = observeCommittedLiveGoal(previousAway, {
  ...baselineState,
  homeGoals: [goal("Kowalski", 12, { scorerId: "home-9" })],
  awayScore: 1,
  awayGoals: [goal("Nowak", 31, { scorerId: "away-10" })]
});
import_strict.default.equal(committedAway.committedGoal?.side, "AWAY");
import_strict.default.equal(committedAway.committedGoal?.goal.playerName, "Nowak");
var resumedMatch = observeCommittedLiveGoal(null, {
  ...baselineState,
  homeScore: 1,
  homeGoals: [goal("Kowalski", 12)]
});
import_strict.default.equal(resumedMatch.committedGoal, null);
var activeLiveViews = [
  "components/views/MatchLiveView.tsx",
  "components/views/FriendlyMatchLiveView.tsx",
  "CLEngine/CLMatchLiveView.tsx",
  "LECupEngine/ELMatchLiveView.tsx",
  "LECupEngine/CONFMatchLiveView.tsx",
  "LECupEngine/LEMatchLiveView.tsx",
  "PolishCupEngine/MatchLiveViewPolishCupV2.tsx"
];
activeLiveViews.forEach((file) => {
  const source = (0, import_node_fs.readFileSync)(file, "utf8");
  (0, import_strict.default)(source.includes("observeCommittedLiveGoal"), `${file}: missing committed-goal observer`);
  (0, import_strict.default)(source.includes("if (!goalTriggered)"), `${file}: goal log can still be overwritten by flavor commentary`);
  (0, import_strict.default)(!source.includes("varDataRef"), `${file}: legacy pre-commit VAR/celebration ref is still present`);
  import_strict.default.equal(
    source.match(/setIsCelebratingGoal\(true\)/g)?.length,
    1,
    `${file}: goal celebration must have one committed-state trigger`
  );
});
console.log("LiveMatchGoalCommitTests: OK");
