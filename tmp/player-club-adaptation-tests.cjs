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

// tests/PlayerClubAdaptationTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/PlayerClubAdaptationService.ts
var DAY_MS = 864e5;
var MAX_ADAPTATION_PENALTY = 0.2;
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var formatLocalDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
var toDateKey = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return formatLocalDateKey(/* @__PURE__ */ new Date());
  return formatLocalDateKey(date);
};
var hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
var seededUnit = (seed) => hashString(seed) / 4294967296;
var rollInteger = (seed, min, max) => min + Math.floor(seededUnit(seed) * (max - min + 1));
var rollDurationDays = (seed) => {
  const bucket = seededUnit(`${seed}:duration-bucket`);
  if (bucket < 0.2) return rollInteger(`${seed}:duration-value`, 14, 30);
  if (bucket < 0.55) return rollInteger(`${seed}:duration-value`, 31, 90);
  if (bucket < 0.83) return rollInteger(`${seed}:duration-value`, 91, 180);
  if (bucket < 0.95) return rollInteger(`${seed}:duration-value`, 181, 270);
  return rollInteger(`${seed}:duration-value`, 271, 365);
};
var getMoraleMultiplier = (morale = 50) => {
  if (morale >= 70) return 1.1;
  if (morale >= 45) return 1;
  if (morale >= 25) return 0.8;
  return 0.6;
};
var getInjuryMultiplier = (player) => {
  if (!player.health?.injury) return 1;
  if (player.health.injury.severity === "SEVERE" /* SEVERE */) return 0.35;
  if (player.health.injury.severity === "LIGHT" /* LIGHT */) return 0.7;
  return 0.5;
};
var getCompetitionMultiplier = (competition) => competition === "FRIENDLY" ? 0.7 : 1;
var getBaseDailyGain = (adaptation) => (100 - adaptation.initialLevel) / Math.max(1, adaptation.durationDays);
var getDayDifference = (from, to) => {
  const parseDayNumber = (dateKey) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateKey);
    if (!match) return null;
    return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  };
  const fromDay = parseDayNumber(from);
  const toDay = parseDayNumber(to);
  if (fromDay === null || toDay === null) return 0;
  return Math.max(0, Math.floor((toDay - fromDay) / DAY_MS));
};
var PlayerClubAdaptationService = {
  beginForClub(player, clubId, date) {
    if (!clubId || clubId === "FREE_AGENTS") {
      return { ...player, clubAdaptation: null };
    }
    const dateKey = toDateKey(date);
    const seed = `${player.id}:${clubId}:${dateKey}`;
    const initialLevel = rollInteger(`${seed}:initial-level`, 10, 55);
    const adaptation = {
      clubId,
      startedAt: dateKey,
      lastUpdatedAt: dateKey,
      durationDays: rollDurationDays(seed),
      initialLevel,
      level: initialLevel
    };
    return { ...player, clubAdaptation: adaptation };
  },
  advanceDaily(player, date) {
    const adaptation = player.clubAdaptation;
    if (!adaptation || adaptation.clubId !== player.clubId || adaptation.level >= 100) return player;
    const dateKey = toDateKey(date);
    const elapsedDays = getDayDifference(adaptation.lastUpdatedAt, dateKey);
    if (elapsedDays <= 0) return player;
    const gain = getBaseDailyGain(adaptation) * elapsedDays * getMoraleMultiplier(player.morale) * getInjuryMultiplier(player);
    return {
      ...player,
      clubAdaptation: {
        ...adaptation,
        level: clamp(adaptation.level + gain, 0, 100),
        lastUpdatedAt: dateKey
      }
    };
  },
  applyMatchMinutes(player, minutesPlayed, competition, date) {
    const dailyUpdated = this.advanceDaily(player, date);
    const adaptation = dailyUpdated.clubAdaptation;
    if (!adaptation || adaptation.clubId !== dailyUpdated.clubId || adaptation.level >= 100 || minutesPlayed <= 0) {
      return dailyUpdated;
    }
    const matchGain = getBaseDailyGain(adaptation) * (clamp(minutesPlayed, 0, 120) / 90) * getCompetitionMultiplier(competition) * getMoraleMultiplier(dailyUpdated.morale);
    return {
      ...dailyUpdated,
      clubAdaptation: {
        ...adaptation,
        level: clamp(adaptation.level + matchGain, 0, 100)
      }
    };
  },
  applyMatchToPlayers(players, minutesByPlayerId, competition, date) {
    const nextPlayers = {};
    Object.entries(players).forEach(([clubId, squad]) => {
      nextPlayers[clubId] = squad.map((player) => {
        const minutes2 = minutesByPlayerId[player.id] ?? 0;
        return minutes2 > 0 ? this.applyMatchMinutes(player, minutes2, competition, date) : player;
      });
    });
    return nextPlayers;
  },
  getLevel(player) {
    const adaptation = player.clubAdaptation;
    if (!adaptation || adaptation.clubId !== player.clubId) return 100;
    return clamp(adaptation.level, 0, 100);
  },
  getEffectiveOverall(player, roleOverall) {
    const level = this.getLevel(player);
    const multiplier = 1 - MAX_ADAPTATION_PENALTY + MAX_ADAPTATION_PENALTY * (level / 100);
    return clamp(roleOverall * multiplier, 1, 99);
  },
  buildMinutesByPlayerId(finalStartingXI, substitutions, totalMinutes, forcedExitMinutes = {}) {
    const safeTotal = clamp(totalMinutes, 1, 120);
    const participantIds = /* @__PURE__ */ new Set();
    finalStartingXI.forEach((id) => {
      if (id) participantIds.add(id);
    });
    substitutions.forEach((substitution) => {
      if (substitution.playerOutId) participantIds.add(substitution.playerOutId);
      if (substitution.playerInId) participantIds.add(substitution.playerInId);
    });
    Object.keys(forcedExitMinutes).forEach((playerId) => participantIds.add(playerId));
    const minutesByPlayerId = {};
    participantIds.forEach((playerId) => {
      const entryMinute = substitutions.filter((substitution) => substitution.playerInId === playerId).reduce((earliest, substitution) => Math.min(earliest, substitution.minute), safeTotal);
      const enteredFromBench = entryMinute < safeTotal;
      const startMinute = enteredFromBench ? entryMinute : 0;
      const substitutionExitMinute = substitutions.filter((substitution) => substitution.playerOutId === playerId && substitution.minute >= startMinute).reduce((earliest, substitution) => Math.min(earliest, substitution.minute), safeTotal);
      const exitMinute = Math.min(
        substitutionExitMinute,
        clamp(forcedExitMinutes[playerId] ?? safeTotal, startMinute, safeTotal)
      );
      minutesByPlayerId[playerId] = clamp(exitMinute - startMinute, 0, safeTotal);
    });
    return minutesByPlayerId;
  },
  buildSentOffExitMinutes(sentOffIds, logs, players, teamSide) {
    const exitMinutes = {};
    sentOffIds.forEach((playerId) => {
      const player = players.find((candidate) => candidate.id === playerId);
      if (!player) return;
      const exitMinute = logs.filter(
        (log) => log.type === "RED_CARD" /* RED_CARD */ && log.teamSide === teamSide && (log.playerId === playerId || !log.playerId && log.playerName === player.lastName)
      ).reduce((earliest, log) => Math.min(earliest, log.minute), Number.POSITIVE_INFINITY);
      if (Number.isFinite(exitMinute)) exitMinutes[playerId] = exitMinute;
    });
    return exitMinutes;
  }
};

// tests/PlayerClubAdaptationTests.ts
var makePlayer = (overrides = {}) => ({
  id: "ADAPT_TEST_PLAYER",
  firstName: "Jan",
  lastName: "Testowy",
  age: 24,
  clubId: "CLUB_A",
  nationality: "POL",
  position: "MID" /* MID */,
  overallRating: 84,
  attributes: {},
  stats: {},
  health: { status: "HEALTHY" /* HEALTHY */ },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: "2030-06-30",
  annualSalary: 1,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  morale: 50,
  ...overrides
});
var started = PlayerClubAdaptationService.beginForClub(makePlayer(), "CLUB_A", "2026-07-01");
var repeated = PlayerClubAdaptationService.beginForClub(makePlayer(), "CLUB_A", "2026-07-01");
import_strict.default.deepEqual(started.clubAdaptation, repeated.clubAdaptation, "losowanie przyj\u015Bcia musi by\u0107 deterministyczne");
import_strict.default.ok((started.clubAdaptation?.durationDays ?? 0) >= 14 && (started.clubAdaptation?.durationDays ?? 0) <= 365);
import_strict.default.ok((started.clubAdaptation?.initialLevel ?? 0) >= 10 && (started.clubAdaptation?.initialLevel ?? 0) <= 55);
import_strict.default.equal(
  PlayerClubAdaptationService.beginForClub(makePlayer(), "CLUB_A", new Date(2026, 6, 1)).clubAdaptation?.startedAt,
  "2026-07-01"
);
var thirtyPercent = makePlayer({
  clubAdaptation: {
    clubId: "CLUB_A",
    startedAt: "2026-07-01",
    lastUpdatedAt: "2026-07-01",
    durationDays: 180,
    initialLevel: 30,
    level: 30
  }
});
import_strict.default.equal(Math.round(PlayerClubAdaptationService.getEffectiveOverall(thirtyPercent, 84)), 72);
var healthyProgress = PlayerClubAdaptationService.advanceDaily(thirtyPercent, "2026-07-08");
var lowMoraleProgress = PlayerClubAdaptationService.advanceDaily(
  makePlayer({ ...thirtyPercent, morale: 10 }),
  "2026-07-08"
);
var injuredProgress = PlayerClubAdaptationService.advanceDaily(
  makePlayer({
    ...thirtyPercent,
    health: {
      status: "INJURED" /* INJURED */,
      injury: {
        type: "Test",
        daysRemaining: 20,
        totalDays: 20,
        injuryDate: "2026-07-01",
        severity: "SEVERE" /* SEVERE */
      }
    }
  }),
  "2026-07-08"
);
import_strict.default.ok((healthyProgress.clubAdaptation?.level ?? 0) > (lowMoraleProgress.clubAdaptation?.level ?? 0));
import_strict.default.ok((healthyProgress.clubAdaptation?.level ?? 0) > (injuredProgress.clubAdaptation?.level ?? 0));
var competitiveMatch = PlayerClubAdaptationService.applyMatchMinutes(thirtyPercent, 90, "LEAGUE", "2026-07-01");
var friendlyMatch = PlayerClubAdaptationService.applyMatchMinutes(thirtyPercent, 90, "FRIENDLY", "2026-07-01");
import_strict.default.ok((competitiveMatch.clubAdaptation?.level ?? 0) > (friendlyMatch.clubAdaptation?.level ?? 0));
var minutes = PlayerClubAdaptationService.buildMinutesByPlayerId(
  ["SUB_IN", "STARTER_FULL"],
  [{ playerOutId: "STARTER_OUT", playerInId: "SUB_IN", minute: 60, isHome: true }],
  90
);
import_strict.default.equal(minutes.STARTER_OUT, 60);
import_strict.default.equal(minutes.SUB_IN, 30);
import_strict.default.equal(minutes.STARTER_FULL, 90);
var sentOffPlayer = makePlayer({ id: "SENT_OFF", lastName: "Kartkowy" });
var sentOffExits = PlayerClubAdaptationService.buildSentOffExitMinutes(
  [sentOffPlayer.id],
  [{
    id: "RED_67",
    minute: 67,
    text: "Czerwona kartka",
    type: "RED_CARD" /* RED_CARD */,
    teamSide: "HOME",
    playerName: sentOffPlayer.lastName
  }],
  [sentOffPlayer],
  "HOME"
);
var redCardMinutes = PlayerClubAdaptationService.buildMinutesByPlayerId([], [], 90, sentOffExits);
import_strict.default.equal(redCardMinutes.SENT_OFF, 67);
console.log("PlayerClubAdaptationTests: OK");
