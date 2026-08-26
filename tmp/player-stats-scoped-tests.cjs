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

// tests/PlayerStatsScopedUpdateTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/PlayerFormService.ts
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var average = (values) => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
var emptyStats = () => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: []
});
var combineStats = (player) => {
  const groups = [player.stats, player.cupStats, player.euroStats, player.friendlyStats, player.nationalStats].filter(Boolean);
  return groups.reduce((acc, stats) => ({
    ...acc,
    goals: acc.goals + (stats.goals ?? 0),
    assists: acc.assists + (stats.assists ?? 0),
    yellowCards: acc.yellowCards + (stats.yellowCards ?? 0),
    redCards: acc.redCards + (stats.redCards ?? 0),
    cleanSheets: acc.cleanSheets + (stats.cleanSheets ?? 0),
    matchesPlayed: acc.matchesPlayed + (stats.matchesPlayed ?? 0),
    minutesPlayed: acc.minutesPlayed + (stats.minutesPlayed ?? 0),
    ratingHistory: [...acc.ratingHistory, ...stats.ratingHistory ?? []]
  }), emptyStats());
};
var getOutputBonus = (player, stats) => {
  const matches = Math.max(1, stats.matchesPlayed || 0);
  const goalsPerMatch = (stats.goals ?? 0) / matches;
  const assistsPerMatch = (stats.assists ?? 0) / matches;
  const contributionsPerMatch = ((stats.goals ?? 0) + (stats.assists ?? 0)) / matches;
  const cleanSheetRate = (stats.cleanSheets ?? 0) / matches;
  if ((stats.matchesPlayed ?? 0) < 3) return 0;
  if (player.position === "FWD" /* FWD */) {
    return clamp(goalsPerMatch * 20 + assistsPerMatch * 8 - (goalsPerMatch === 0 ? 8 : 0), -10, 14);
  }
  if (player.position === "MID" /* MID */) {
    return clamp(contributionsPerMatch * 18, -4, 12);
  }
  if (player.position === "GK" /* GK */) {
    return clamp(cleanSheetRate * 18 - (cleanSheetRate === 0 ? 4 : 0), -8, 14);
  }
  return clamp(contributionsPerMatch * 10, -4, 8);
};
var PlayerFormService = {
  calculate(player) {
    const stats = combineStats(player);
    const ratings = stats.ratingHistory.filter((rating) => typeof rating === "number" && Number.isFinite(rating));
    const seasonAverage = average(ratings);
    const recent10Ratings = ratings.slice(-10);
    const recentRatings = ratings.slice(-5);
    const recent10Average = average(recent10Ratings);
    const previousRatings = ratings.slice(-10, -5);
    const recentAverage = average(recentRatings);
    const previousAverage = average(previousRatings);
    const goodRatingCount = ratings.filter((rating) => rating >= 7).length;
    let score = 50;
    if (seasonAverage !== null) {
      score += clamp((seasonAverage - 6.5) * 10, -18, 22);
    }
    if (recent10Average !== null) {
      score += clamp((recent10Average - 6.5) * 14, -22, 28);
    }
    if (recentAverage !== null) {
      score += clamp((recentAverage - 6.5) * 8, -12, 16);
    }
    if (recentAverage !== null && previousAverage !== null) {
      score += clamp((recentAverage - previousAverage) * 10, -10, 10);
    }
    const matches = stats.matchesPlayed ?? 0;
    const minutes = stats.minutesPlayed ?? 0;
    if (matches >= 6) score += 6;
    else if (matches >= 3) score += 3;
    else if (matches === 0) score += 0;
    else score -= 4;
    if (matches > 0) {
      const averageMinutes = minutes / matches;
      if (averageMinutes >= 70 && matches >= 10) score += 6;
      else if (averageMinutes >= 75) score += 5;
      else if (averageMinutes < 35) score -= 6;
      if (matches >= 10 && averageMinutes >= 70 && goodRatingCount >= 10 && (recent10Average ?? seasonAverage ?? 0) >= 7) {
        score += 6;
      }
    }
    score += getOutputBonus(player, stats);
    score += clamp(((player.morale ?? 50) - 50) * 0.1, -5, 5);
    if (matches > 0 || recentAverage !== null) score += player.trainingFocus ? 2 : 0;
    if (player.health?.status === "INJURED" /* INJURED */) score -= 18;
    if ((player.condition ?? 100) < 60) score -= 8;
    if ((player.fatigueDebt ?? 0) > 55) score -= 6;
    return PlayerFormService.getInfo(Math.round(clamp(score, 0, 100)));
  },
  getTrainingIntensityAdjustment(player, intensity) {
    const attributes = player.attributes;
    const responseScore = (attributes.workRate ?? 50) * 0.45 + (attributes.mentality ?? 50) * 0.35 + (attributes.stamina ?? 50) * 0.2;
    const fatigueDebt = player.fatigueDebt ?? 0;
    const condition = player.condition ?? 100;
    const strainPenalty = (fatigueDebt >= 70 ? 5 : fatigueDebt >= 55 ? 3 : fatigueDebt >= 40 ? 1 : 0) + (condition < 55 ? 5 : condition < 68 ? 3 : condition < 78 ? 1 : 0);
    if (intensity === "HEAVY" /* HEAVY */) {
      let adjustment = 0;
      if (responseScore >= 82) adjustment = 6;
      else if (responseScore >= 72) adjustment = 4;
      else if (responseScore >= 62) adjustment = 2;
      else if (responseScore < 45) adjustment = -6;
      else if (responseScore < 55) adjustment = -3;
      return clamp(adjustment - strainPenalty, -9, 7);
    }
    if (intensity === "LIGHT" /* LIGHT */) {
      if (fatigueDebt >= 55 || condition < 68) return 4;
      if (responseScore >= 78 && condition >= 82) return -1;
      return 0;
    }
    if (responseScore >= 76 && condition >= 75 && fatigueDebt <= 45) return 1;
    if (condition < 60 || fatigueDebt >= 70) return -2;
    return 0;
  },
  withUpdatedForm(player, adjustment = 0) {
    return {
      ...player,
      form: PlayerFormService.getInfo(PlayerFormService.calculate(player).score + adjustment).score
    };
  },
  getInfo(score = 50) {
    const safeScore = Math.round(clamp(score, 0, 100));
    if (safeScore >= 90) {
      return {
        score: safeScore,
        level: "VERY_HIGH",
        label: "Bardzo wysoka",
        colorClass: "text-emerald-300",
        borderClass: "border-emerald-400/35",
        bgClass: "bg-emerald-500/12"
      };
    }
    if (safeScore >= 75) {
      return {
        score: safeScore,
        level: "HIGH",
        label: "Wysoka",
        colorClass: "text-lime-300",
        borderClass: "border-lime-400/35",
        bgClass: "bg-lime-500/12"
      };
    }
    if (safeScore >= 51) {
      return {
        score: safeScore,
        level: "RISING",
        label: "Wzrastaj\u0105ca",
        colorClass: "text-lime-300",
        borderClass: "border-lime-400/35",
        bgClass: "bg-lime-500/12"
      };
    }
    if (safeScore >= 40) {
      return {
        score: safeScore,
        level: "STABLE",
        label: "Stabilna",
        colorClass: "text-slate-200",
        borderClass: "border-slate-300/25",
        bgClass: "bg-slate-400/10"
      };
    }
    if (safeScore >= 11) {
      return {
        score: safeScore,
        level: "FALLING",
        label: "Spadaj\u0105ca",
        colorClass: "text-orange-300",
        borderClass: "border-orange-400/35",
        bgClass: "bg-orange-500/12"
      };
    }
    return {
      score: safeScore,
      level: "VERY_LOW",
      label: "Bardzo niska",
      colorClass: "text-red-300",
      borderClass: "border-red-400/35",
      bgClass: "bg-red-500/12"
    };
  }
};

// services/PlayerStatsService.ts
var emptyStats2 = () => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: []
});
var withCompetitionStats = (player, competitionId, update) => {
  if (!competitionId) return player;
  const current = player.competitionStats?.[competitionId] ?? emptyStats2();
  return {
    ...player,
    competitionStats: {
      ...player.competitionStats ?? {},
      [competitionId]: update(current)
    }
  };
};
var getEventSearchClubIds = (players, scopedClubIds) => {
  if (!scopedClubIds || scopedClubIds.length === 0) return Object.keys(players);
  return Array.from(new Set(scopedClubIds)).filter((clubId) => Array.isArray(players[clubId]));
};
var PlayerStatsService = {
  applyGoal: (players, scorerId, assistId, competitionId, scopedClubIds) => {
    let newPlayers = players;
    const foundPlayerIds = /* @__PURE__ */ new Set();
    const updateClub = (clubId) => {
      const squad = newPlayers[clubId];
      if (!squad) return;
      let changed = false;
      const updatedSquad = squad.map((p) => {
        if (p.id === scorerId) {
          foundPlayerIds.add(scorerId);
          changed = true;
          const aggregated = {
            ...p,
            stats: { ...p.stats, goals: p.stats.goals + 1 }
          };
          return PlayerFormService.withUpdatedForm(withCompetitionStats(
            aggregated,
            competitionId,
            (stats) => ({ ...stats, goals: stats.goals + 1 })
          ));
        }
        if (assistId && p.id === assistId) {
          foundPlayerIds.add(assistId);
          changed = true;
          const aggregated = {
            ...p,
            stats: { ...p.stats, assists: p.stats.assists + 1 }
          };
          return PlayerFormService.withUpdatedForm(withCompetitionStats(
            aggregated,
            competitionId,
            (stats) => ({ ...stats, assists: stats.assists + 1 })
          ));
        }
        return p;
      });
      if (changed) {
        if (newPlayers === players) newPlayers = { ...players };
        newPlayers[clubId] = updatedSquad;
      }
    };
    const primaryClubIds = getEventSearchClubIds(players, scopedClubIds);
    primaryClubIds.forEach(updateClub);
    const requiredPlayerIds = /* @__PURE__ */ new Set([scorerId, ...assistId ? [assistId] : []]);
    if (scopedClubIds && [...requiredPlayerIds].some((id) => !foundPlayerIds.has(id))) {
      const primarySet = new Set(primaryClubIds);
      for (const clubId of Object.keys(players)) {
        if (primarySet.has(clubId)) continue;
        updateClub(clubId);
        if ([...requiredPlayerIds].every((id) => foundPlayerIds.has(id))) break;
      }
    }
    return newPlayers;
  },
  applyCard: (players, playerId, type, competitionId, scopedClubIds) => {
    let newPlayers = players;
    let playerFound = false;
    const updateClub = (clubId) => {
      const squad = newPlayers[clubId];
      if (!squad) return;
      let changed = false;
      const updatedSquad = squad.map((p) => {
        if (p.id === playerId) {
          playerFound = true;
          changed = true;
          let yellowCards = p.stats.yellowCards;
          let redCards = p.stats.redCards;
          let suspensionMatches = p.suspensionMatches;
          if (type === "YELLOW_CARD" /* YELLOW_CARD */) {
            yellowCards += 1;
            if (yellowCards % 4 === 0) {
              suspensionMatches += 1;
            }
          }
          if (type === "RED_CARD" /* RED_CARD */) {
            redCards += 1;
            suspensionMatches += 2;
          }
          const aggregated = {
            ...p,
            stats: { ...p.stats, yellowCards, redCards },
            suspensionMatches
          };
          return PlayerFormService.withUpdatedForm(withCompetitionStats(
            aggregated,
            competitionId,
            (stats) => ({
              ...stats,
              yellowCards: stats.yellowCards + (type === "YELLOW_CARD" /* YELLOW_CARD */ ? 1 : 0),
              redCards: stats.redCards + (type === "RED_CARD" /* RED_CARD */ ? 1 : 0)
            })
          ));
        }
        return p;
      });
      if (changed) {
        if (newPlayers === players) newPlayers = { ...players };
        newPlayers[clubId] = updatedSquad;
      }
    };
    const primaryClubIds = getEventSearchClubIds(players, scopedClubIds);
    primaryClubIds.forEach(updateClub);
    if (scopedClubIds && !playerFound) {
      const primarySet = new Set(primaryClubIds);
      for (const clubId of Object.keys(players)) {
        if (primarySet.has(clubId)) continue;
        updateClub(clubId);
        if (playerFound) break;
      }
    }
    return newPlayers;
  },
  /**
   * Wywoływane po zakończeniu meczu dla każdego klubu.
   * Redukuje kary zawieszenia i zwiększa licznik rozegranych meczów oraz minut.
   * Regeneracja odbywa się wyłącznie w RecoveryService.
   */
  processMatchDayEndForClub: (players, clubId, participatingIds, competitionId, minutesByPlayer = {}) => {
    const newPlayers = { ...players };
    const idSet = new Set(participatingIds);
    if (newPlayers[clubId]) {
      newPlayers[clubId] = newPlayers[clubId].map((p) => {
        let updated = { ...p };
        if (idSet.has(p.id)) {
          const playedMinutes = Math.max(1, Math.min(120, Math.round(minutesByPlayer[p.id] ?? 90)));
          updated.stats = {
            ...updated.stats,
            matchesPlayed: updated.stats.matchesPlayed + 1,
            minutesPlayed: updated.stats.minutesPlayed + playedMinutes
          };
          updated = withCompetitionStats(updated, competitionId, (stats) => ({
            ...stats,
            matchesPlayed: stats.matchesPlayed + 1,
            minutesPlayed: stats.minutesPlayed + playedMinutes
          }));
          updated = PlayerFormService.withUpdatedForm(updated);
        }
        if (updated.suspensionMatches > 0) {
          updated.suspensionMatches = Math.max(0, updated.suspensionMatches - 1);
        }
        return updated;
      });
    }
    return newPlayers;
  },
  applyCleanSheet: (players, clubId, gkIds, competitionId) => {
    const newPlayers = { ...players };
    if (newPlayers[clubId]) {
      newPlayers[clubId] = newPlayers[clubId].map((p) => {
        if (gkIds.includes(p.id)) {
          const aggregated = { ...p, stats: { ...p.stats, cleanSheets: (p.stats.cleanSheets || 0) + 1 } };
          return PlayerFormService.withUpdatedForm(withCompetitionStats(
            aggregated,
            competitionId,
            (stats) => ({ ...stats, cleanSheets: stats.cleanSheets + 1 })
          ));
        }
        return p;
      });
    }
    return newPlayers;
  },
  incrementMatchesPlayed: (players, playerIds) => {
    const newPlayers = { ...players };
    const idSet = new Set(playerIds);
    for (const clubId in newPlayers) {
      newPlayers[clubId] = newPlayers[clubId].map((p) => {
        if (idSet.has(p.id)) {
          return PlayerFormService.withUpdatedForm({
            ...p,
            stats: { ...p.stats, matchesPlayed: p.stats.matchesPlayed + 1 }
          });
        }
        return p;
      });
    }
    return newPlayers;
  }
};

// tests/PlayerStatsScopedUpdateTests.ts
var makePlayer = (id, clubId, position = "MID" /* MID */) => ({
  id,
  firstName: id,
  lastName: "Test",
  clubId,
  position,
  nationality: "POLAND" /* POLAND */,
  nationalityCountry: "Polska",
  age: 24,
  overallRating: 70,
  reputacja: 60,
  lojalnosc: 60,
  attributes: {
    pace: 70,
    acceleration: 70,
    strength: 70,
    stamina: 70,
    finishing: 70,
    passing: 70,
    vision: 70,
    technique: 70,
    dribbling: 70,
    crossing: 70,
    defending: 70,
    positioning: 70,
    attacking: 70,
    mentality: 70,
    workRate: 70,
    aggression: 70,
    leadership: 70,
    goalkeeping: 5,
    reflexes: 5,
    handling: 5,
    aerial: 70,
    talent: 75,
    freeKicks: 70,
    penalties: 70,
    corners: 70
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
  condition: 99,
  fatigueDebt: 0,
  suspensionMatches: 0,
  annualSalary: 1e5,
  marketValue: 1e6,
  contractEndDate: "2028-06-30T00:00:00.000Z",
  history: []
});
var homeScorer = makePlayer("HOME_SCORER", "HOME", "FWD" /* FWD */);
var homeAssistant = makePlayer("HOME_ASSISTANT", "HOME");
var awayBooked = makePlayer("AWAY_BOOKED", "AWAY", "DEF" /* DEF */);
var unrelated = makePlayer("UNRELATED", "OTHER");
var freeAgent = makePlayer("FREE_AGENT", "FREE_AGENTS");
var source = {
  HOME: [homeScorer, homeAssistant],
  AWAY: [awayBooked],
  OTHER: [unrelated],
  FREE_AGENTS: [freeAgent]
};
var legacyGoalResult = PlayerStatsService.applyGoal(
  source,
  homeScorer.id,
  homeAssistant.id,
  "L_TEST"
);
var scopedGoalResult = PlayerStatsService.applyGoal(
  source,
  homeScorer.id,
  homeAssistant.id,
  "L_TEST",
  ["HOME", "AWAY"]
);
import_strict.default.deepEqual(scopedGoalResult, legacyGoalResult, "scoped goal update must preserve the legacy statistic result");
import_strict.default.equal(scopedGoalResult.OTHER, source.OTHER, "an unrelated club squad must keep its array reference");
import_strict.default.equal(scopedGoalResult.FREE_AGENTS, source.FREE_AGENTS, "FREE_AGENTS must keep its array reference");
import_strict.default.equal(scopedGoalResult.HOME[0].stats.goals, 1, "the scorer must receive one goal");
import_strict.default.equal(scopedGoalResult.HOME[1].stats.assists, 1, "the assistant must receive one assist");
import_strict.default.equal(scopedGoalResult.HOME[0].competitionStats?.L_TEST?.goals, 1, "competition goals must remain synchronized");
var legacyCardResult = PlayerStatsService.applyCard(
  source,
  awayBooked.id,
  "YELLOW_CARD" /* YELLOW_CARD */,
  "L_TEST"
);
var scopedCardResult = PlayerStatsService.applyCard(
  source,
  awayBooked.id,
  "YELLOW_CARD" /* YELLOW_CARD */,
  "L_TEST",
  ["HOME", "AWAY"]
);
import_strict.default.deepEqual(scopedCardResult, legacyCardResult, "scoped card update must preserve the legacy statistic result");
import_strict.default.equal(scopedCardResult.OTHER, source.OTHER, "card update must not copy an unrelated squad");
import_strict.default.equal(scopedCardResult.FREE_AGENTS, source.FREE_AGENTS, "card update must not copy FREE_AGENTS");
import_strict.default.equal(scopedCardResult.AWAY[0].stats.yellowCards, 1, "the booked player must receive one yellow card");
var fallbackResult = PlayerStatsService.applyCard(
  source,
  unrelated.id,
  "RED_CARD" /* RED_CARD */,
  "L_TEST",
  ["HOME", "AWAY"]
);
import_strict.default.equal(fallbackResult.OTHER[0].stats.redCards, 1, "fallback search must preserve old-save compatibility");
import_strict.default.equal(fallbackResult.OTHER[0].suspensionMatches, 2, "red-card suspension logic must remain unchanged");
import_strict.default.equal(fallbackResult.FREE_AGENTS, source.FREE_AGENTS, "fallback must stop before touching later unrelated buckets");
var missingResult = PlayerStatsService.applyGoal(
  source,
  "MISSING_PLAYER",
  void 0,
  "L_TEST",
  ["HOME", "AWAY"]
);
import_strict.default.equal(missingResult, source, "a missing player event must preserve the original world record");
var scopedMapCalls = 0;
var trackedSquad = (squad) => new Proxy(squad, {
  get(target, property, receiver) {
    if (property === "map") {
      return (...args) => {
        scopedMapCalls += 1;
        return target.map(...args);
      };
    }
    return Reflect.get(target, property, receiver);
  }
});
var largeWorld = {
  HOME: trackedSquad([makePlayer("PERF_SCORER", "HOME", "FWD" /* FWD */)]),
  AWAY: trackedSquad([makePlayer("PERF_AWAY", "AWAY")]),
  FREE_AGENTS: trackedSquad(Array.from(
    { length: 15e3 },
    (_, index) => makePlayer(`PERF_FA_${index}`, "FREE_AGENTS")
  ))
};
for (let index = 0; index < 600; index++) {
  largeWorld[`AI_${index}`] = trackedSquad([makePlayer(`PERF_AI_${index}`, `AI_${index}`)]);
}
var largeWorldFreeAgents = largeWorld.FREE_AGENTS;
PlayerStatsService.applyGoal(
  largeWorld,
  "PERF_SCORER",
  void 0,
  "L_PERF",
  ["HOME", "AWAY"]
);
import_strict.default.equal(scopedMapCalls, 2, "one scoped event must traverse only the two fixture squads");
import_strict.default.equal(largeWorld.FREE_AGENTS, largeWorldFreeAgents, "the large free-agent pool must remain untouched");
console.log("PlayerStatsScopedUpdateTests: OK");
