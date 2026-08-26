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

// tests/RecoveryIdentityTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/RecoveryService.ts
var seededRange = (seed, min, max) => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const normalized = (hash >>> 0) / 4294967295;
  return min + (max - min) * normalized;
};
var getPlayerHealingDelayFactor = (player) => {
  const strength = Math.max(1, Math.min(99, player.attributes.strength || 1));
  const injurySeed = `${player.id}_${player.health.injury?.injuryDate ?? ""}_${player.health.injury?.type ?? ""}`;
  const strengthRandomTolerance = seededRange(`${injurySeed}_strength`, 5e-3, 0.01);
  const strengthDeficitSteps = Math.max(0, (99 - strength) / 9);
  const strengthDelay = Math.pow(strengthDeficitSteps, 1.22) * strengthRandomTolerance;
  const ageRandomTolerance = seededRange(`${injurySeed}_age`, 6e-3, 0.012);
  const agePenaltySteps = Math.max(0, (player.age - 30) / 4);
  const ageDelay = Math.pow(agePenaltySteps, 1.18) * ageRandomTolerance;
  return 1 + strengthDelay + ageDelay;
};
var FREE_AGENT_BUCKET_ID = "FREE_AGENTS";
var settledFreeAgentPools = /* @__PURE__ */ new WeakMap();
var getRecoveryCacheSignature = (intensity, recoveryMult) => `${intensity}:${recoveryMult.toFixed(6)}`;
var hasSameStringEntries = (left, right) => {
  if (left === right) return true;
  const leftEntries = Object.entries(left ?? {});
  const rightEntries = Object.entries(right ?? {});
  if (leftEntries.length !== rightEntries.length) return false;
  return leftEntries.every(([key, value]) => right?.[key] === value);
};
var hasSameHealth = (left, right) => {
  if (left.status !== right.status) return false;
  if (!left.injury || !right.injury) return left.injury === right.injury;
  return left.injury.type === right.injury.type && left.injury.daysRemaining === right.injury.daysRemaining && left.injury.severity === right.injury.severity && left.injury.injuryDate === right.injury.injuryDate && left.injury.totalDays === right.injury.totalDays && left.injury.conditionAtInjury === right.injury.conditionAtInjury;
};
var isRecoverySettled = (player) => player.health.status !== "INJURED" /* INJURED */ && (player.fatigueDebt ?? 0) <= 0 && player.condition >= 100 && !player.nationalTeamRecoveryUntil && !player.nationalTeamMajorTournamentRecoveryUntil && !player.negotiationLockoutUntil && Object.keys(player.freeAgentClubLockouts ?? {}).length === 0;
var RecoveryService = {
  /**
   * Wykonuje dobową regenerację dla wszystkich zawodników.
   * daysCount: pozwala na precyzyjne odliczanie czasu.
   */
  applyDailyRecovery: (playersMap, currentDate, intensity, daysCount = 1, recoveryMult = 1, medicalQuality, userTeamId) => {
    let updatedMap = playersMap;
    const recoveryCacheSignature = getRecoveryCacheSignature(intensity, recoveryMult);
    for (const clubId in playersMap) {
      const sourceSquad = playersMap[clubId];
      if (clubId === FREE_AGENT_BUCKET_ID && settledFreeAgentPools.get(sourceSquad) === recoveryCacheSignature) {
        continue;
      }
      const effectiveMedicalQuality = userTeamId && clubId === userTeamId ? medicalQuality : void 0;
      const medicalSpeedFactor = (() => {
        if (!effectiveMedicalQuality) return 1;
        const q = effectiveMedicalQuality;
        if (q >= 17) return 1.2 + (q - 17) / 3 * 0.1;
        if (q >= 14) return 1.12 + (q - 14) / 3 * 0.08;
        if (q >= 10) return 1.05 + (q - 10) / 4 * 0.07;
        return 1 + (q - 1) / 9 * 0.05;
      })();
      let updatedSquad = null;
      for (let playerIndex = 0; playerIndex < sourceSquad.length; playerIndex++) {
        const player = sourceSquad[playerIndex];
        const updated = {
          ...player,
          health: player.health.injury ? { ...player.health, injury: { ...player.health.injury } } : player.health
        };
        const recoveryUntil = player.nationalTeamRecoveryUntil ? new Date(player.nationalTeamRecoveryUntil).setHours(23, 59, 59, 999) : 0;
        const majorTournamentRecoveryUntil = player.nationalTeamMajorTournamentRecoveryUntil ? new Date(player.nationalTeamMajorTournamentRecoveryUntil).setHours(23, 59, 59, 999) : 0;
        const currentRecoveryDay = new Date(currentDate).setHours(0, 0, 0, 0);
        const isInjured = player.health.status === "INJURED" /* INJURED */;
        const hasNationalTeamRecovery = !isInjured && recoveryUntil >= currentRecoveryDay;
        const hasMajorTournamentRecovery = !isInjured && majorTournamentRecoveryUntil >= currentRecoveryDay;
        const nationalTeamDebtRecoveryMult = hasMajorTournamentRecovery ? 3 : hasNationalTeamRecovery ? 2 : 1;
        const nationalTeamConditionRecoveryMult = hasMajorTournamentRecovery ? 1.85 : hasNationalTeamRecovery ? 1.35 : 1;
        if (player.nationalTeamRecoveryUntil && !hasNationalTeamRecovery) {
          updated.nationalTeamRecoveryUntil = null;
        }
        if (player.nationalTeamMajorTournamentRecoveryUntil && !hasMajorTournamentRecovery) {
          updated.nationalTeamMajorTournamentRecoveryUntil = null;
        }
        let ageModifier = 1;
        if (player.age <= 24) ageModifier = 0.8;
        else if (player.age <= 29) ageModifier = 0.6;
        else {
          const normalizedCond = Math.max(0, Math.min(1, (player.condition - 50) / 49));
          const normalizedStr = Math.max(0, Math.min(1, (player.attributes.strength - 50) / 49));
          const physicalFactor = (normalizedCond + normalizedStr) / 2;
          ageModifier = 0.3 + 0.3 * physicalFactor;
        }
        const injuryModifier = isInjured ? 0.5 : 1;
        const debtRecoveryBase = 1.5 + player.attributes.strength * 0.02;
        const totalDebtRecovered = debtRecoveryBase * ageModifier * injuryModifier * daysCount * nationalTeamDebtRecoveryMult;
        updated.fatigueDebt = Math.max(0, (updated.fatigueDebt || 0) - totalDebtRecovered);
        const maxConditionCap = 100 - updated.fatigueDebt;
        const strengthFactor = player.attributes.strength / 100;
        const staminaFactor = player.attributes.stamina / 100;
        let dailyRate = (2.45 + strengthFactor * 1.5 + staminaFactor * 1.5) * recoveryMult * nationalTeamConditionRecoveryMult;
        if (intensity === "LIGHT" /* LIGHT */) {
          dailyRate += 0.5;
        } else if (intensity === "HEAVY" /* HEAVY */) {
          dailyRate -= 2;
        }
        if (updated.condition < 60) {
          dailyRate *= 0.5;
        }
        if (updated.health.status === "INJURED" /* INJURED */ && updated.health.injury?.injuryDate && (updated.health.injury.totalDays || 0) > 1) {
          const condAtInjury = updated.health.injury.conditionAtInjury ?? updated.condition;
          const injStart = new Date(updated.health.injury.injuryDate).setHours(0, 0, 0, 0);
          const simDay = new Date(currentDate).setHours(0, 0, 0, 0);
          const daysPassed = Math.max(0, Math.floor((simDay - injStart) / (1e3 * 60 * 60 * 24)));
          const healingDelayFactor = getPlayerHealingDelayFactor(updated);
          const effTotalDays = Math.max(2, Math.round((updated.health.injury.totalDays || 1) * healingDelayFactor / medicalSpeedFactor));
          const targetCond = condAtInjury + (99 - condAtInjury) * (daysPassed / (effTotalDays - 1));
          updated.condition = Math.min(99, Math.max(condAtInjury, targetCond));
        } else {
          const totalConditionChange = dailyRate * ageModifier * injuryModifier * daysCount;
          updated.condition = Math.max(0, Math.min(maxConditionCap, updated.condition + totalConditionChange * 0.88));
        }
        if (updated.health.status === "INJURED" /* INJURED */ && updated.health.injury?.injuryDate) {
          const injuryStart = new Date(updated.health.injury.injuryDate).setHours(0, 0, 0, 0);
          const currentSimDate = new Date(currentDate).setHours(0, 0, 0, 0);
          const diffMs = currentSimDate - injuryStart;
          const totalDaysPassed = Math.max(0, Math.floor(diffMs / (1e3 * 60 * 60 * 24)));
          const rawTotalDays = updated.health.injury.totalDays || updated.health.injury.daysRemaining;
          const healingDelayFactor = getPlayerHealingDelayFactor(updated);
          const effTotalDays2 = Math.max(1, Math.round(rawTotalDays * healingDelayFactor / medicalSpeedFactor));
          const actualRemaining = effTotalDays2 - totalDaysPassed;
          if (actualRemaining <= 0) {
            updated.health = { status: "HEALTHY" /* HEALTHY */ };
          } else {
            updated.health.injury.daysRemaining = actualRemaining;
            updated.fatigueDebt = Math.min(90, Math.round(actualRemaining * 20 / 7));
            if (updated.health.injury.severity === "LIGHT" /* LIGHT */ && actualRemaining > 14) {
              updated.health.injury.severity = "SEVERE" /* SEVERE */;
            }
          }
        }
        if (updated.negotiationLockoutUntil) {
          const lockoutDate = new Date(updated.negotiationLockoutUntil).setHours(0, 0, 0, 0);
          const currentSimDate = new Date(currentDate).setHours(0, 0, 0, 0);
          if (currentSimDate >= lockoutDate) {
            updated.negotiationLockoutUntil = null;
          }
        }
        if (updated.freeAgentClubLockouts) {
          const currentSimDate = new Date(currentDate).setHours(0, 0, 0, 0);
          const activeClubLockouts = Object.fromEntries(
            Object.entries(updated.freeAgentClubLockouts).filter(
              ([, lockoutUntil]) => new Date(lockoutUntil).setHours(0, 0, 0, 0) > currentSimDate
            )
          );
          if (!hasSameStringEntries(updated.freeAgentClubLockouts, activeClubLockouts)) {
            updated.freeAgentClubLockouts = activeClubLockouts;
          }
        }
        const playerChanged = updated.fatigueDebt !== player.fatigueDebt || updated.condition !== player.condition || !hasSameHealth(updated.health, player.health) || updated.nationalTeamRecoveryUntil !== player.nationalTeamRecoveryUntil || updated.nationalTeamMajorTournamentRecoveryUntil !== player.nationalTeamMajorTournamentRecoveryUntil || updated.negotiationLockoutUntil !== player.negotiationLockoutUntil || !hasSameStringEntries(updated.freeAgentClubLockouts, player.freeAgentClubLockouts);
        const nextPlayer = playerChanged ? updated : player;
        if (nextPlayer !== player && !updatedSquad) {
          updatedSquad = sourceSquad.slice(0, playerIndex);
        }
        if (updatedSquad) updatedSquad.push(nextPlayer);
      }
      const finalSquad = updatedSquad ?? sourceSquad;
      if (finalSquad !== sourceSquad) {
        if (updatedMap === playersMap) updatedMap = { ...playersMap };
        updatedMap[clubId] = finalSquad;
      }
      if (clubId === FREE_AGENT_BUCKET_ID && finalSquad.every(isRecoverySettled)) {
        settledFreeAgentPools.set(finalSquad, recoveryCacheSignature);
      }
    }
    return updatedMap;
  }
};

// tests/RecoveryIdentityTests.ts
var makePlayer = (id, clubId, condition = 100) => ({
  id,
  firstName: id,
  lastName: "Recovery",
  clubId,
  position: "MID" /* MID */,
  nationality: "POLAND" /* POLAND */,
  nationalityCountry: "Polska",
  age: 25,
  overallRating: 65,
  attributes: {
    pace: 65,
    acceleration: 65,
    strength: 65,
    stamina: 65,
    finishing: 65,
    passing: 65,
    vision: 65,
    technique: 65,
    dribbling: 65,
    crossing: 65,
    defending: 65,
    positioning: 65,
    attacking: 65,
    mentality: 65,
    workRate: 65,
    aggression: 65,
    leadership: 65,
    goalkeeping: 5,
    reflexes: 5,
    handling: 5,
    aerial: 65,
    talent: 70,
    freeKicks: 65,
    penalties: 65,
    corners: 65
  },
  stats: {
    matchesPlayed: 0,
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    seasonalChanges: {},
    ratingHistory: []
  },
  health: { status: "HEALTHY" /* HEALTHY */ },
  condition,
  fatigueDebt: 0,
  suspensionMatches: 0,
  contractEndDate: "",
  annualSalary: 0,
  marketValue: 0,
  history: []
});
var stableClubPlayer = makePlayer("CLUB_STABLE", "CLUB");
var stableFreeAgent = makePlayer("FA_STABLE", "FREE_AGENTS");
var stableWorld = {
  CLUB: [stableClubPlayer],
  FREE_AGENTS: [stableFreeAgent]
};
var firstStablePass = RecoveryService.applyDailyRecovery(
  stableWorld,
  /* @__PURE__ */ new Date("2026-08-01T00:00:00.000Z"),
  "NORMAL" /* NORMAL */
);
import_strict.default.equal(firstStablePass, stableWorld, "a fully settled world must preserve the top-level record");
import_strict.default.equal(firstStablePass.CLUB, stableWorld.CLUB, "a settled club squad must preserve its array");
import_strict.default.equal(firstStablePass.FREE_AGENTS, stableWorld.FREE_AGENTS, "a settled free-agent pool must preserve its array");
import_strict.default.equal(firstStablePass.FREE_AGENTS[0], stableFreeAgent, "a settled free agent must preserve its object");
var freeAgentArrayReads = 0;
var trackedFreeAgentPool = new Proxy(
  Array.from({ length: 15e3 }, (_, index) => makePlayer(`FA_PERF_${index}`, "FREE_AGENTS")),
  {
    get(target, property, receiver) {
      if (property === "length" || typeof property === "string" && /^\d+$/.test(property)) {
        freeAgentArrayReads += 1;
      }
      return Reflect.get(target, property, receiver);
    }
  }
);
var largeWorld = { FREE_AGENTS: trackedFreeAgentPool };
var primedLargeWorld = RecoveryService.applyDailyRecovery(
  largeWorld,
  /* @__PURE__ */ new Date("2026-08-01T00:00:00.000Z"),
  "NORMAL" /* NORMAL */
);
import_strict.default.equal(primedLargeWorld, largeWorld, "priming a settled pool must not create a new world record");
freeAgentArrayReads = 0;
var cachedLargeWorld = RecoveryService.applyDailyRecovery(
  largeWorld,
  /* @__PURE__ */ new Date("2026-08-02T00:00:00.000Z"),
  "NORMAL" /* NORMAL */
);
import_strict.default.equal(cachedLargeWorld, largeWorld, "cached recovery must preserve the world record");
import_strict.default.equal(freeAgentArrayReads, 0, "cached recovery must not visit any of the 15,000 dormant free agents");
var tiredFreeAgent = makePlayer("FA_TIRED", "FREE_AGENTS", 80);
var changedPoolWorld = {
  FREE_AGENTS: [...trackedFreeAgentPool, tiredFreeAgent]
};
var recoveredChangedPool = RecoveryService.applyDailyRecovery(
  changedPoolWorld,
  /* @__PURE__ */ new Date("2026-08-03T00:00:00.000Z"),
  "NORMAL" /* NORMAL */
);
import_strict.default.notEqual(recoveredChangedPool, changedPoolWorld, "a changed pool must invalidate the settled cache");
import_strict.default.ok(recoveredChangedPool.FREE_AGENTS.at(-1).condition > 80, "a newly added tired player must recover normally");
import_strict.default.equal(recoveredChangedPool.FREE_AGENTS[0], trackedFreeAgentPool[0], "unchanged free agents must preserve object identity");
var futureLockoutPlayer = {
  ...makePlayer("FA_LOCKOUT", "FREE_AGENTS"),
  negotiationLockoutUntil: "2026-08-10T00:00:00.000Z"
};
var futureLockoutWorld = { FREE_AGENTS: [futureLockoutPlayer] };
var beforeLockoutExpiry = RecoveryService.applyDailyRecovery(
  futureLockoutWorld,
  /* @__PURE__ */ new Date("2026-08-05T00:00:00.000Z"),
  "NORMAL" /* NORMAL */
);
import_strict.default.equal(beforeLockoutExpiry, futureLockoutWorld, "an unchanged future lockout must not force a copy");
var afterLockoutExpiry = RecoveryService.applyDailyRecovery(
  futureLockoutWorld,
  /* @__PURE__ */ new Date("2026-08-11T00:00:00.000Z"),
  "NORMAL" /* NORMAL */
);
import_strict.default.equal(afterLockoutExpiry.FREE_AGENTS[0].negotiationLockoutUntil, null, "an expired lockout must still be cleared");
var injuredPlayer = {
  ...makePlayer("FA_INJURED", "FREE_AGENTS", 45),
  health: {
    status: "INJURED" /* INJURED */,
    injury: {
      type: "Test injury",
      daysRemaining: 10,
      severity: "LIGHT" /* LIGHT */,
      injuryDate: "2026-08-01T00:00:00.000Z",
      totalDays: 10,
      conditionAtInjury: 45
    }
  }
};
var originalDaysRemaining = injuredPlayer.health.injury.daysRemaining;
var injuredWorld = { FREE_AGENTS: [injuredPlayer] };
var recoveredInjury = RecoveryService.applyDailyRecovery(
  injuredWorld,
  /* @__PURE__ */ new Date("2026-08-05T00:00:00.000Z"),
  "NORMAL" /* NORMAL */
);
import_strict.default.equal(
  injuredPlayer.health.injury.daysRemaining,
  originalDaysRemaining,
  "daily recovery must not mutate the source save injury object"
);
import_strict.default.notEqual(recoveredInjury.FREE_AGENTS[0], injuredPlayer, "an injured player update must create a new player object");
console.log("RecoveryIdentityTests: OK");
