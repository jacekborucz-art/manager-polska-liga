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

// tests/AssistantPlayerReportTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// types.ts
var TrainingIntensity = /* @__PURE__ */ ((TrainingIntensity2) => {
  TrainingIntensity2["LIGHT"] = "LIGHT";
  TrainingIntensity2["NORMAL"] = "NORMAL";
  TrainingIntensity2["HEAVY"] = "HEAVY";
  return TrainingIntensity2;
})(TrainingIntensity || {});

// data/training_definitions_pl.ts
var TRAINING_CYCLES = [
  {
    id: "T_TACTICAL_PERIOD",
    name: "Periodyzacja Taktyczna",
    description: "Skupienie na inteligencji boiskowej. G\u0142\xF3wne wzrosty: Wizja i Ustawianie si\u0119. Wsparcie: Podania i Technika. Program o niskim obci\u0105\u017Ceniu, idealny do stabilizacji formy.",
    icon: "\u{1F9E0}",
    primaryAttributes: ["vision", "positioning"],
    secondaryAttributes: ["passing", "technique", "mentality"],
    fatigueRisk: 0.3
  },
  {
    id: "T_GEGENPRESSING",
    name: "Gegenpressing",
    description: "Ekstremalny nacisk na fizyczno\u015B\u0107. G\u0142\xF3wne wzrosty: Kondycja i Szybko\u015B\u0107. Wsparcie: Obrona i Si\u0142a. UWAGA: Bardzo wysokie ryzyko kontuzji i drena\u017C energii zawodnik\xF3w.",
    icon: "\u26A1",
    primaryAttributes: ["stamina", "pace"],
    secondaryAttributes: ["defending", "strength", "workRate", "aggression"],
    fatigueRisk: 0.9
  },
  {
    id: "T_TIKI_TAKA",
    name: "Szko\u0142a Techniczna (Tiki-Taka)",
    description: "Trening operowania pi\u0142k\u0105. G\u0142\xF3wne wzrosty: Podania i Technika. Wsparcie: Drybling i Wizja. Rozwija kreatywno\u015B\u0107 kosztem braku nacisku na parametry si\u0142owe.",
    icon: "\u{1F45F}",
    primaryAttributes: ["passing", "technique"],
    secondaryAttributes: ["dribbling", "vision", "crossing"],
    fatigueRisk: 0.4
  },
  {
    id: "T_CATENACCIO",
    name: "Blok Defensywny (Catenaccio)",
    description: "W\u0142oska szko\u0142a rygoru. G\u0142\xF3wne wzrosty: Obrona i Si\u0142a. Wsparcie: Ustawianie si\u0119 i Gra g\u0142ow\u0105. Buduje tward\u0105 defensyw\u0119, zaniedbuj\u0105c rozw\xF3j ataku.",
    icon: "\u{1F6E1}\uFE0F",
    primaryAttributes: ["defending", "strength"],
    secondaryAttributes: ["positioning", "heading"],
    fatigueRisk: 0.5
  },
  {
    id: "T_FINISHING",
    name: "Instynkt Snajperski",
    description: "Szlifowanie wyko\u0144czenia akcji. G\u0142\xF3wne wzrosty: Wyko\u0144czenie i Atakowanie. Wsparcie: Technika i Gra g\u0142ow\u0105. Maksymalizuje skuteczno\u015B\u0107 napastnik\xF3w.",
    icon: "\u{1F3AF}",
    primaryAttributes: ["finishing", "attacking"],
    secondaryAttributes: ["technique", "heading"],
    fatigueRisk: 0.4
  },
  {
    id: "T_SAQ",
    name: "Szybko\u015B\u0107 i Zwinno\u015B\u0107 (SAQ)",
    description: "Program Speed, Agility, Quickness. G\u0142\xF3wne wzrosty: Szybko\u015B\u0107 i Drybling. Wsparcie: Technika i Kondycja. Kluczowy dla dynamicznych skrzyd\u0142owych.",
    icon: "\u{1F680}",
    primaryAttributes: ["pace", "dribbling"],
    secondaryAttributes: ["technique", "stamina"],
    fatigueRisk: 0.7
  },
  {
    id: "T_AIR_DOM",
    name: "Dominacja w Powietrzu",
    description: "Trening walki o g\xF3rne pi\u0142ki. G\u0142\xF3wne wzrosty: Gra g\u0142ow\u0105 i Si\u0142a. Wsparcie: Ustawianie si\u0119 i Obrona. Niezb\u0119dny przy taktyce opartej na do\u015Brodkowaniach.",
    icon: "\u{1FA82}",
    primaryAttributes: ["heading", "strength"],
    secondaryAttributes: ["positioning", "defending"],
    fatigueRisk: 0.6
  },
  {
    id: "T_MODERN_GK",
    name: "Nowoczesny Bramkarz",
    description: "Specjalistyczny cykl dla golkiper\xF3w. G\u0142\xF3wne wzrosty: Bramkarstwo i Ustawianie si\u0119. Wsparcie: Podania i Wizja (wyprowadzanie pi\u0142ki).",
    icon: "\u{1F9E4}",
    primaryAttributes: ["goalkeeping", "positioning"],
    secondaryAttributes: ["passing", "vision"],
    fatigueRisk: 0.3
  },
  {
    id: "T_SET_PIECES",
    name: "Sta\u0142e Fragmenty Gry",
    description: "Trening rzut\xF3w wolnych, ro\u017Cnych i jedenastek. G\u0142\xF3wne wzrosty: Rzuty Wolne i Ro\u017Cne. Wsparcie: Jedenastki i Podania. Poprawia skuteczno\u015B\u0107 sta\u0142ych fragment\xF3w gry.",
    icon: "\u{1F6A9}",
    primaryAttributes: ["freeKicks", "corners"],
    secondaryAttributes: ["penalties", "passing"],
    fatigueRisk: 0.2
  },
  {
    id: "T_RECOVERY_YOGA",
    name: "Odnowa Biologiczna i Joga",
    description: "Program regeneracyjny. G\u0142\xF3wne wzrosty: Kondycja (lekko). Wsparcie: Technika. Bonus: Gwarantuje +50% do szybko\u015Bci regeneracji energii po meczu.",
    icon: "\u{1F9D8}",
    primaryAttributes: ["stamina"],
    secondaryAttributes: ["technique"],
    fatigueRisk: 0,
    recoveryBonus: 0.5
  },
  {
    id: "T_HIGH_PRESS",
    name: "Wysoki Pressing",
    description: "Intensywny pressing wysoko na boisku. G\u0142\xF3wne wzrosty: Pracowito\u015B\u0107 i Agresja. Wsparcie: Obrona i Kondycja. Wymaga maksymalnej pracy n\xF3g ka\u017Cdego zawodnika przez ca\u0142e 90 minut.",
    icon: "\u{1F525}",
    primaryAttributes: ["workRate", "aggression"],
    secondaryAttributes: ["defending", "stamina"],
    fatigueRisk: 0.85
  },
  {
    id: "T_COUNTER_ATTACK",
    name: "Kontratak",
    description: "B\u0142yskawiczne przej\u015Bcie do ataku po odbiorze pi\u0142ki. G\u0142\xF3wne wzrosty: Szybko\u015B\u0107 i Atak. Wsparcie: Wyko\u0144czenie i Pracowito\u015B\u0107. Idea\u0142 dla dru\u017Cyn preferuj\u0105cych szybkie przej\u015Bcie z obrony.",
    icon: "\u{1F4A8}",
    primaryAttributes: ["pace", "attacking"],
    secondaryAttributes: ["finishing", "workRate"],
    fatigueRisk: 0.65
  }
];

// services/PlayerDevelopmentService.ts
var TRAINABLE_ATTRS = [
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
  "penalties",
  "corners",
  "aggression",
  "crossing",
  "leadership",
  "mentality",
  "workRate"
];
var stableUnit = (seed) => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const x = Math.sin(hash) * 1e4;
  return x - Math.floor(x);
};
var normalizeClubReputation = (reputation) => {
  if (reputation === void 0 || Number.isNaN(reputation)) return 5;
  return reputation > 20 ? reputation / 10 : reputation;
};
var normalizeCoachQuality = (quality) => {
  if (quality === void 0 || Number.isNaN(quality)) return 10;
  return quality > 20 ? quality / 5 : quality;
};
var PlayerDevelopmentService = {
  getSeasonalGrowthUsed(seasonalChanges = {}, explicitUsed) {
    if (explicitUsed !== void 0) return Math.max(0, explicitUsed);
    return TRAINABLE_ATTRS.reduce((sum, key) => sum + Math.max(0, seasonalChanges[key] || 0), 0);
  },
  getSeasonalGrowthCap(player2, environment = {}) {
    const talent = player2.attributes.talent ?? 50;
    const rep = normalizeClubReputation(environment.clubReputation);
    const coach = normalizeCoachQuality(environment.coachQuality);
    const reserveMatches = player2.reserveStats?.matches ?? 0;
    const minutes = (player2.stats?.minutesPlayed ?? 0) + reserveMatches * 90;
    const ratingHistory = player2.stats?.ratingHistory ?? [];
    const reserveAverageRating = reserveMatches > 0 ? (player2.reserveStats?.totalRatingPoints ?? 0) / reserveMatches : null;
    const averageRating = environment.averageRating ?? (ratingHistory.length > 0 ? ratingHistory.reduce((sum, rating) => sum + rating, 0) / ratingHistory.length : reserveAverageRating);
    let score = 0;
    if (player2.age <= 19) score += 0.32;
    else if (player2.age <= 21) score += 0.25;
    else if (player2.age <= 23) score += 0.16;
    else if (player2.age <= 26) score += 0.06;
    else if (player2.age >= 33) score -= 0.42;
    else if (player2.age >= 30) score -= 0.24;
    else if (player2.age >= 28) score -= 0.1;
    if (talent >= 90) score += 0.38;
    else if (talent >= 82) score += 0.28;
    else if (talent >= 74) score += 0.18;
    else if (talent >= 65) score += 0.08;
    else if (talent < 52) score -= 0.16;
    if (rep >= 8.5) score += 0.18;
    else if (rep >= 7) score += 0.1;
    else if (rep <= 3) score -= 0.08;
    if (coach >= 17) score += 0.26;
    else if (coach >= 14) score += 0.16;
    else if (coach >= 11) score += 0.06;
    else if (coach <= 6) score -= 0.12;
    if (minutes >= 2200) score += 0.14;
    else if (minutes >= 1200) score += 0.08;
    else if (minutes < 360 && player2.age >= 22) score -= 0.12;
    if (averageRating !== null) {
      if (averageRating >= 7.45) score += 0.14;
      else if (averageRating >= 7.05) score += 0.07;
      else if (averageRating < 6.25) score -= 0.12;
    }
    const destiny = stableUnit(`${player2.id}_${player2.age}_season_destiny`);
    if (destiny >= 0.94) score += 0.18;
    else if (destiny <= 0.06) score -= 0.18;
    if (score >= 0.82) return 2;
    if (score >= 0.08) return 1;
    return 0;
  },
  canGrowThisSeason(player2, seasonalChanges, environment = {}) {
    const used = PlayerDevelopmentService.getSeasonalGrowthUsed(
      seasonalChanges,
      player2.stats?.seasonalGrowthPoints
    );
    return used < PlayerDevelopmentService.getSeasonalGrowthCap(player2, environment);
  },
  recordGrowth(seasonalChanges, key, used) {
    const currentUsed = used ?? PlayerDevelopmentService.getSeasonalGrowthUsed(seasonalChanges);
    const nextChanges = {
      ...seasonalChanges,
      [key]: (seasonalChanges[key] || 0) + 1
    };
    return {
      seasonalChanges: nextChanges,
      seasonalGrowthPoints: currentUsed + 1
    };
  },
  recordRegression(seasonalChanges, key) {
    return {
      ...seasonalChanges,
      [key]: (seasonalChanges[key] || 0) - 1
    };
  }
};

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
var getInjuryMultiplier = (player2) => {
  if (!player2.health?.injury) return 1;
  if (player2.health.injury.severity === "SEVERE" /* SEVERE */) return 0.35;
  if (player2.health.injury.severity === "LIGHT" /* LIGHT */) return 0.7;
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
  beginForClub(player2, clubId, date) {
    if (!clubId || clubId === "FREE_AGENTS") {
      return { ...player2, clubAdaptation: null };
    }
    const dateKey = toDateKey(date);
    const seed = `${player2.id}:${clubId}:${dateKey}`;
    const initialLevel = rollInteger(`${seed}:initial-level`, 10, 55);
    const adaptation = {
      clubId,
      startedAt: dateKey,
      lastUpdatedAt: dateKey,
      durationDays: rollDurationDays(seed),
      initialLevel,
      level: initialLevel
    };
    return { ...player2, clubAdaptation: adaptation };
  },
  advanceDaily(player2, date) {
    const adaptation = player2.clubAdaptation;
    if (!adaptation || adaptation.clubId !== player2.clubId || adaptation.level >= 100) return player2;
    const dateKey = toDateKey(date);
    const elapsedDays = getDayDifference(adaptation.lastUpdatedAt, dateKey);
    if (elapsedDays <= 0) return player2;
    const gain = getBaseDailyGain(adaptation) * elapsedDays * getMoraleMultiplier(player2.morale) * getInjuryMultiplier(player2);
    return {
      ...player2,
      clubAdaptation: {
        ...adaptation,
        level: clamp(adaptation.level + gain, 0, 100),
        lastUpdatedAt: dateKey
      }
    };
  },
  applyMatchMinutes(player2, minutesPlayed, competition, date) {
    const dailyUpdated = this.advanceDaily(player2, date);
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
      nextPlayers[clubId] = squad.map((player2) => {
        const minutes = minutesByPlayerId[player2.id] ?? 0;
        return minutes > 0 ? this.applyMatchMinutes(player2, minutes, competition, date) : player2;
      });
    });
    return nextPlayers;
  },
  getLevel(player2) {
    const adaptation = player2.clubAdaptation;
    if (!adaptation || adaptation.clubId !== player2.clubId) return 100;
    return clamp(adaptation.level, 0, 100);
  },
  getEffectiveOverall(player2, roleOverall) {
    const level = this.getLevel(player2);
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
      const player2 = players.find((candidate) => candidate.id === playerId);
      if (!player2) return;
      const exitMinute = logs.filter(
        (log) => log.type === "RED_CARD" /* RED_CARD */ && log.teamSide === teamSide && (log.playerId === playerId || !log.playerId && log.playerName === player2.lastName)
      ).reduce((earliest, log) => Math.min(earliest, log.minute), Number.POSITIVE_INFINITY);
      if (Number.isFinite(exitMinute)) exitMinutes[playerId] = exitMinute;
    });
    return exitMinutes;
  }
};

// services/PlayerFormService.ts
var clamp2 = (value, min, max) => Math.max(min, Math.min(max, value));
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
var combineStats = (player2) => {
  const groups = [player2.stats, player2.cupStats, player2.euroStats, player2.friendlyStats, player2.nationalStats].filter(Boolean);
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
var getOutputBonus = (player2, stats) => {
  const matches = Math.max(1, stats.matchesPlayed || 0);
  const goalsPerMatch = (stats.goals ?? 0) / matches;
  const assistsPerMatch = (stats.assists ?? 0) / matches;
  const contributionsPerMatch = ((stats.goals ?? 0) + (stats.assists ?? 0)) / matches;
  const cleanSheetRate = (stats.cleanSheets ?? 0) / matches;
  if ((stats.matchesPlayed ?? 0) < 3) return 0;
  if (player2.position === "FWD" /* FWD */) {
    return clamp2(goalsPerMatch * 20 + assistsPerMatch * 8 - (goalsPerMatch === 0 ? 8 : 0), -10, 14);
  }
  if (player2.position === "MID" /* MID */) {
    return clamp2(contributionsPerMatch * 18, -4, 12);
  }
  if (player2.position === "GK" /* GK */) {
    return clamp2(cleanSheetRate * 18 - (cleanSheetRate === 0 ? 4 : 0), -8, 14);
  }
  return clamp2(contributionsPerMatch * 10, -4, 8);
};
var PlayerFormService = {
  calculate(player2) {
    const stats = combineStats(player2);
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
      score += clamp2((seasonAverage - 6.5) * 10, -18, 22);
    }
    if (recent10Average !== null) {
      score += clamp2((recent10Average - 6.5) * 14, -22, 28);
    }
    if (recentAverage !== null) {
      score += clamp2((recentAverage - 6.5) * 8, -12, 16);
    }
    if (recentAverage !== null && previousAverage !== null) {
      score += clamp2((recentAverage - previousAverage) * 10, -10, 10);
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
    score += getOutputBonus(player2, stats);
    score += clamp2(((player2.morale ?? 50) - 50) * 0.1, -5, 5);
    if (matches > 0 || recentAverage !== null) score += player2.trainingFocus ? 2 : 0;
    if (player2.health?.status === "INJURED" /* INJURED */) score -= 18;
    if ((player2.condition ?? 100) < 60) score -= 8;
    if ((player2.fatigueDebt ?? 0) > 55) score -= 6;
    return PlayerFormService.getInfo(Math.round(clamp2(score, 0, 100)));
  },
  getTrainingIntensityAdjustment(player2, intensity) {
    const attributes2 = player2.attributes;
    const responseScore = (attributes2.workRate ?? 50) * 0.45 + (attributes2.mentality ?? 50) * 0.35 + (attributes2.stamina ?? 50) * 0.2;
    const fatigueDebt = player2.fatigueDebt ?? 0;
    const condition = player2.condition ?? 100;
    const strainPenalty = (fatigueDebt >= 70 ? 5 : fatigueDebt >= 55 ? 3 : fatigueDebt >= 40 ? 1 : 0) + (condition < 55 ? 5 : condition < 68 ? 3 : condition < 78 ? 1 : 0);
    if (intensity === "HEAVY" /* HEAVY */) {
      let adjustment = 0;
      if (responseScore >= 82) adjustment = 6;
      else if (responseScore >= 72) adjustment = 4;
      else if (responseScore >= 62) adjustment = 2;
      else if (responseScore < 45) adjustment = -6;
      else if (responseScore < 55) adjustment = -3;
      return clamp2(adjustment - strainPenalty, -9, 7);
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
  withUpdatedForm(player2, adjustment = 0) {
    return {
      ...player2,
      form: PlayerFormService.getInfo(PlayerFormService.calculate(player2).score + adjustment).score
    };
  },
  getInfo(score = 50) {
    const safeScore = Math.round(clamp2(score, 0, 100));
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

// services/TrainingAssistantService.ts
var POSITION_FOCUS_POOLS = {
  ["GK" /* GK */]: ["goalkeeping", "positioning", "passing", "vision", "stamina", "mentality", "leadership"],
  ["DEF" /* DEF */]: ["defending", "strength", "positioning", "heading", "pace", "passing", "workRate", "aggression", "crossing"],
  ["MID" /* MID */]: ["passing", "technique", "vision", "dribbling", "stamina", "workRate", "mentality", "defending", "pace", "crossing", "attacking", "freeKicks"],
  ["FWD" /* FWD */]: ["finishing", "attacking", "pace", "dribbling", "technique", "heading", "positioning", "workRate", "strength", "penalties"]
};
var ROLE_BONUS = {
  ["GK" /* GK */]: {
    goalkeeping: 20,
    positioning: 12,
    passing: 8,
    vision: 5,
    mentality: 6
  },
  ["DEF" /* DEF */]: {
    defending: 20,
    strength: 12,
    positioning: 13,
    heading: 10,
    pace: 6,
    workRate: 5
  },
  ["MID" /* MID */]: {
    passing: 18,
    technique: 15,
    vision: 16,
    dribbling: 10,
    stamina: 8,
    mentality: 6,
    attacking: 5,
    defending: 5
  },
  ["FWD" /* FWD */]: {
    finishing: 20,
    attacking: 16,
    pace: 10,
    dribbling: 9,
    technique: 7,
    heading: 7,
    penalties: 4,
    positioning: 8
  }
};
var clamp3 = (value, min, max) => Math.max(min, Math.min(max, value));
var average2 = (values) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};
var averageAttribute = (players, attr) => average2(players.map((player2) => player2.attributes[attr] ?? 0));
var weightedPick = (items, rng) => {
  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return items[0].item;
  }
  let roll = rng() * totalWeight;
  for (const entry of items) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.item;
    }
  }
  return items[items.length - 1].item;
};
var getCycleScore = (cycle, players, rng) => {
  const outfieldPlayers = players.filter((player2) => player2.position !== "GK" /* GK */);
  const defenders = players.filter((player2) => player2.position === "DEF" /* DEF */);
  const midfielders = players.filter((player2) => player2.position === "MID" /* MID */);
  const forwards = players.filter((player2) => player2.position === "FWD" /* FWD */);
  const avgAge = average2(players.map((player2) => player2.age));
  const avgCondition = average2(players.map((player2) => player2.condition));
  const baseNeed = average2(cycle.primaryAttributes.map((attr) => clamp3(82 - averageAttribute(players, attr), 0, 35))) * 1.7 + average2(cycle.secondaryAttributes.map((attr) => clamp3(80 - averageAttribute(players, attr), 0, 25))) * 1.1;
  let score = 12 + baseNeed;
  switch (cycle.id) {
    case "T_TACTICAL_PERIOD":
      score += average2([
        clamp3(82 - averageAttribute(outfieldPlayers, "vision"), 0, 28),
        clamp3(82 - averageAttribute(outfieldPlayers, "positioning"), 0, 28),
        clamp3(80 - averageAttribute(outfieldPlayers, "passing"), 0, 24)
      ]);
      break;
    case "T_GEGENPRESSING":
      score += average2([
        clamp3(82 - averageAttribute(outfieldPlayers, "stamina"), 0, 32),
        clamp3(82 - averageAttribute(outfieldPlayers, "workRate"), 0, 30),
        clamp3(82 - averageAttribute(outfieldPlayers, "pace"), 0, 28),
        clamp3(80 - averageAttribute(outfieldPlayers, "aggression"), 0, 24)
      ]);
      score -= Math.max(0, 78 - avgCondition) * 0.8;
      score -= Math.max(0, avgAge - 29) * 4;
      break;
    case "T_TIKI_TAKA":
      score += average2([
        clamp3(84 - averageAttribute(outfieldPlayers, "passing"), 0, 34),
        clamp3(84 - averageAttribute(outfieldPlayers, "technique"), 0, 30),
        clamp3(82 - averageAttribute(outfieldPlayers, "vision"), 0, 28),
        clamp3(80 - averageAttribute(outfieldPlayers, "dribbling"), 0, 24)
      ]);
      score += midfielders.length * 0.9;
      break;
    case "T_CATENACCIO":
      score += average2([
        clamp3(84 - averageAttribute(defenders, "defending"), 0, 34),
        clamp3(82 - averageAttribute(defenders, "positioning"), 0, 28),
        clamp3(82 - averageAttribute(defenders, "strength"), 0, 28),
        clamp3(80 - averageAttribute(defenders, "heading"), 0, 22)
      ]);
      score += defenders.length * 1.1;
      break;
    case "T_FINISHING":
      score += average2([
        clamp3(84 - averageAttribute(forwards, "finishing"), 0, 34),
        clamp3(82 - averageAttribute(forwards, "attacking"), 0, 28),
        clamp3(80 - averageAttribute(forwards, "technique"), 0, 22)
      ]);
      score += forwards.length * 1.2;
      break;
    case "T_SAQ":
      score += average2([
        clamp3(84 - averageAttribute(outfieldPlayers, "pace"), 0, 34),
        clamp3(82 - averageAttribute(outfieldPlayers, "dribbling"), 0, 28),
        clamp3(80 - averageAttribute(outfieldPlayers, "stamina"), 0, 22)
      ]);
      score -= Math.max(0, 76 - avgCondition) * 0.6;
      break;
    case "T_AIR_DOM":
      score += average2([
        clamp3(84 - averageAttribute(defenders.concat(forwards), "heading"), 0, 34),
        clamp3(82 - averageAttribute(players, "strength"), 0, 28),
        clamp3(80 - averageAttribute(defenders, "defending"), 0, 24)
      ]);
      break;
    case "T_SET_PIECES":
      score += average2([
        clamp3(82 - averageAttribute(players, "freeKicks"), 0, 26),
        clamp3(82 - averageAttribute(players, "corners"), 0, 26),
        clamp3(80 - averageAttribute(players, "penalties"), 0, 20),
        clamp3(80 - averageAttribute(players, "passing"), 0, 20)
      ]);
      score -= 4;
      break;
    case "T_RECOVERY_YOGA":
      score += Math.max(0, 82 - avgCondition) * 2.2;
      score += Math.max(0, avgAge - 28) * 2.5;
      break;
    case "T_HIGH_PRESS":
      score += average2([
        clamp3(84 - averageAttribute(outfieldPlayers, "workRate"), 0, 34),
        clamp3(82 - averageAttribute(outfieldPlayers, "aggression"), 0, 28),
        clamp3(82 - averageAttribute(outfieldPlayers, "stamina"), 0, 28),
        clamp3(80 - averageAttribute(outfieldPlayers, "defending"), 0, 22)
      ]);
      score -= Math.max(0, 78 - avgCondition) * 0.7;
      score -= Math.max(0, avgAge - 30) * 4.5;
      break;
    case "T_COUNTER_ATTACK":
      score += average2([
        clamp3(84 - averageAttribute(players, "pace"), 0, 34),
        clamp3(82 - averageAttribute(forwards.concat(midfielders), "attacking"), 0, 28),
        clamp3(82 - averageAttribute(forwards, "finishing"), 0, 28),
        clamp3(80 - averageAttribute(outfieldPlayers, "workRate"), 0, 20)
      ]);
      score += forwards.length * 1.1;
      break;
    default:
      break;
  }
  score *= 0.88 + rng() * 0.24;
  return Math.max(1, score);
};
var POSITION_KEY_ATTRS = {
  ["GK" /* GK */]: ["goalkeeping", "positioning", "passing", "vision", "stamina"],
  ["DEF" /* DEF */]: ["defending", "strength", "positioning", "heading", "pace"],
  ["MID" /* MID */]: ["passing", "technique", "vision", "stamina", "dribbling"],
  ["FWD" /* FWD */]: ["finishing", "attacking", "pace", "dribbling", "technique"]
};
var POSITION_IMPORTANCE = {
  ["GK" /* GK */]: { goalkeeping: 3, positioning: 2.5, vision: 1.5, stamina: 1.2, passing: 0.6 },
  ["DEF" /* DEF */]: { defending: 3, positioning: 2.5, strength: 2, heading: 1.8, pace: 1.5 },
  ["MID" /* MID */]: { passing: 2.8, vision: 2.8, technique: 2.5, stamina: 2, dribbling: 1.8 },
  ["FWD" /* FWD */]: { finishing: 3, attacking: 2.5, pace: 2, dribbling: 2, technique: 1.8 }
};
var ATTR_LABELS_REP = {
  strength: "Si\u0142a",
  stamina: "Kondycja",
  pace: "Szybko\u015B\u0107",
  defending: "Obrona",
  passing: "Podania",
  attacking: "Atak",
  finishing: "Wyko\u0144czenie",
  technique: "Technika",
  vision: "Wizja",
  dribbling: "Drybling",
  heading: "Gra g\u0142ow\u0105",
  positioning: "Ustawianie",
  goalkeeping: "Bramkarstwo",
  freeKicks: "Rzuty wolne",
  penalties: "Jedenastki",
  corners: "Ro\u017Cne",
  aggression: "Agresja",
  crossing: "Do\u015Brodkowania",
  leadership: "Przyw\xF3dztwo",
  mentality: "Mentalno\u015B\u0107",
  workRate: "Pracowito\u015B\u0107"
};
var TRAIT_DESCRIPTORS = [
  { attr: "leadership", label: "Materia\u0142 na kapitana dru\u017Cyny", isWarning: false, leagueBonus: 5 },
  { attr: "penalties", label: "Gro\u017Any wykonawca rzut\xF3w karnych", isWarning: false, leagueBonus: 5 },
  { attr: "freeKicks", label: "Gro\u017Any wykonawca rzut\xF3w wolnych", isWarning: false, leagueBonus: 5 },
  { attr: "corners", label: "Precyzyjny wykonawca rzut\xF3w ro\u017Cnych", isWarning: false, leagueBonus: 5 },
  { attr: "crossing", label: "Ponadprzeci\u0119tne do\u015Brodkowania", isWarning: false, leagueBonus: 5 },
  { attr: "heading", label: "Gro\u017Any w grze g\u0142ow\u0105", isWarning: false, leagueBonus: 5 },
  { attr: "pace", label: "Ponadprzeci\u0119tna szybko\u015B\u0107", isWarning: false, leagueBonus: 5 },
  { attr: "finishing", label: "Wyj\u0105tkowo skuteczne wyko\u0144czenie", isWarning: false, leagueBonus: 5 },
  { attr: "passing", label: "Wysokiej jako\u015Bci podania", isWarning: false, leagueBonus: 5 },
  { attr: "dribbling", label: "Wyr\xF3\u017Cniaj\u0105cy si\u0119 drybling", isWarning: false, leagueBonus: 5 },
  { attr: "technique", label: "Wyj\u0105tkowa technika indywidualna", isWarning: false, leagueBonus: 5 },
  { attr: "vision", label: "Doskona\u0142e czytanie gry i wizja", isWarning: false, leagueBonus: 5 },
  { attr: "mentality", label: "Silna mentalno\u015B\u0107, odporno\u015B\u0107 na presj\u0119", isWarning: false, leagueBonus: 5 },
  { attr: "workRate", label: "Wyj\u0105tkowa pracowito\u015B\u0107 i zaanga\u017Cowanie", isWarning: false, leagueBonus: 5 },
  { attr: "strength", label: "Wyr\xF3\u017Cniaj\u0105ca si\u0119 si\u0142a fizyczna", isWarning: false, leagueBonus: 5 },
  { attr: "stamina", label: "Ponadprzeci\u0119tna wytrzyma\u0142o\u015B\u0107", isWarning: false, leagueBonus: 5 },
  { attr: "defending", label: "Wyr\xF3\u017Cniaj\u0105ce si\u0119 umiej\u0119tno\u015Bci defensywne", isWarning: false, leagueBonus: 5 },
  { attr: "attacking", label: "Wysokie zaanga\u017Cowanie ofensywne", isWarning: false, leagueBonus: 5 },
  { attr: "positioning", label: "Doskona\u0142e ustawianie i inteligencja pozycyjna", isWarning: false, leagueBonus: 5 },
  { attr: "goalkeeping", label: "Wyr\xF3\u017Cniaj\u0105ce si\u0119 umiej\u0119tno\u015Bci bramkarskie", isWarning: false, leagueBonus: 5 },
  { attr: "aggression", label: "Wysoka agresja, ryzyko fauli i \u017C\xF3\u0142tych kartek", isWarning: true, leagueBonus: 8 }
];
var POSITION_TRAIT_WHITELIST = {
  GK: /* @__PURE__ */ new Set(["leadership", "pace", "passing", "technique", "vision", "mentality", "workRate", "strength", "stamina", "defending", "positioning", "goalkeeping", "aggression"]),
  DEF: /* @__PURE__ */ new Set(["leadership", "freeKicks", "crossing", "heading", "pace", "passing", "technique", "vision", "mentality", "workRate", "strength", "stamina", "defending", "positioning", "aggression"]),
  MID: /* @__PURE__ */ new Set(["leadership", "penalties", "freeKicks", "corners", "crossing", "heading", "pace", "finishing", "passing", "dribbling", "technique", "vision", "mentality", "workRate", "strength", "stamina", "defending", "attacking", "positioning", "aggression"]),
  FWD: /* @__PURE__ */ new Set(["leadership", "penalties", "freeKicks", "heading", "pace", "finishing", "passing", "dribbling", "technique", "vision", "mentality", "workRate", "strength", "stamina", "attacking", "positioning", "aggression"])
};
var POSITION_NARRATIVES = {
  goalkeeping: {
    ["GK" /* GK */]: "Trenerze, to jest ten obszar, na kt\xF3ry zwr\xF3ci\u0142bym uwag\u0119 w pierwszej kolejno\u015Bci. Braki w bramkarstwie bezpo\u015Brednio kosztuj\u0105 nas bramki.i to w sytuacjach, kt\xF3re powinni\u015Bmy kontrolowa\u0107. Dop\xF3ki ta cecha nie osi\u0105gnie przyzwoitego poziomu, wszystko inne schodzi na dalszy plan."
  },
  positioning: {
    ["GK" /* GK */]: "Moim zdaniem kluczowym problemem jest ustawianie. Widz\u0119, \u017Ce zawodnik reaguje za p\xF3\u017Ano, bo nie zajmuje w\u0142a\u015Bciwej pozycji przed strza\u0142em. To co\u015B, co mo\u017Cna poprawi\u0107.i co prze\u0142o\u017Cy si\u0119 na wyniki szybciej ni\u017C inne cechy.",
    ["DEF" /* DEF */]: "Polecam skupi\u0107 si\u0119 na ustawianiu.widz\u0119, \u017Ce zawodnik za cz\u0119sto daje si\u0119 zaskoczy\u0107 za plecami. Dobra pozycja wyj\u015Bciowa to podstawa skutecznej obrony i eliminuje wiele zb\u0119dnych pojedynk\xF3w.",
    ["FWD" /* FWD */]: "Napastnik, kt\xF3ry jest we w\u0142a\u015Bciwym miejscu we w\u0142a\u015Bciwym czasie, potrzebuje mniej umiej\u0119tno\u015Bci do zdobycia bramki. Moim zdaniem to w\u0142a\u015Bnie ustawianie ogranicza go najbardziej.warto to przepracowa\u0107."
  },
  defending: {
    ["DEF" /* DEF */]: "Nie ma co owija\u0107 w bawe\u0142n\u0119.ten zawodnik ma wyra\u017Ane problemy z kryciem rywali. Polecam priorytetowo zaadresowa\u0107 umiej\u0119tno\u015Bci defensywne, bo to bezpo\u015Brednio wp\u0142ywa na szczelno\u015B\u0107 ca\u0142ej naszej formacji.",
    ["MID" /* MID */]: "Widz\u0119, \u017Ce przy stratach pi\u0142ki ten pomocnik zostawia za du\u017Co przestrzeni. Dzi\u015B pi\u0142ka wymaga defensywnego zaanga\u017Cowania od wszystkich.polecam po\u015Bwi\u0119ci\u0107 temu uwag\u0119 w planie treningowym."
  },
  finishing: {
    ["FWD" /* FWD */]: "Szczerze m\xF3wi\u0105c, to jest dla mnie priorytet numer jeden. Napastnik, kt\xF3ry nie potrafi wyka\u0144cza\u0107 akcji, marnuje prac\u0119 ca\u0142ej dru\u017Cyny. Ka\u017Cdy trening powinien zawiera\u0107 elementy finalizacji, dop\xF3ki ta cecha nie osi\u0105gnie odpowiedniego poziomu."
  },
  passing: {
    ["MID" /* MID */]: "Polecam skupi\u0107 si\u0119 na podaniach.to serce gry pomocnika. Widz\u0119, \u017Ce zawodnik traci pi\u0142k\u0119 w momentach, gdy powinien utrzyma\u0107 tempo akcji. Pewne podanie to podstawa dominacji w \u015Brodku pola.",
    ["DEF" /* DEF */]: "Moim zdaniem warto popracowa\u0107 nad podaniami.defensor bez pewnego wyprowadzenia skazuje dru\u017Cyn\u0119 na gr\u0119 d\u0142ugimi pi\u0142kami. To ogranicza nasze mo\u017Cliwo\u015Bci taktyczne od pierwszej minuty.",
    ["GK" /* GK */]: "Przy okazji.warto zwr\xF3ci\u0107 uwag\u0119 na wyprowadzanie pi\u0142ki. To nie jest priorytet, ale b\u0142\u0119dy przy kr\xF3tkich podaniach zdarzaj\u0105 si\u0119 w newralgicznych momentach i warto je wyeliminowa\u0107."
  },
  pace: {
    ["FWD" /* FWD */]: "Widz\u0119, \u017Ce rywale coraz lepiej radz\u0105 sobie z tym zawodnikiem w\u0142a\u015Bnie dlatego, \u017Ce nie jest zaskoczeniem szybko\u015Bciowym. Polecam trening szybko\u015Bci.w nowoczesnej pi\u0142ce ta cecha to przewaga, kt\xF3rej nie mo\u017Cna zignorowa\u0107.",
    ["DEF" /* DEF */]: "Zwr\xF3ci\u0142bym uwag\u0119 na szybko\u015B\u0107.przy dzisiejszym tempie gry defensor bez odpowiedniej pr\u0119dko\u015Bci jest regularnie wystawiany za plecy. To ryzyko, kt\xF3re warto zminimalizowa\u0107."
  },
  vision: {
    ["MID" /* MID */]: "Moim zdaniem wizja gry to w\u0142a\u015Bnie to, co oddziela dobrego pomocnika od bardzo dobrego. Widz\u0119, \u017Ce zawodnik gra zbyt przewidywalnie.przy lepszej wizji zacznie kreowa\u0107 akcje zamiast tylko je wykonywa\u0107.",
    ["GK" /* GK */]: "Warto popracowa\u0107 nad wizj\u0105 gry.bramkarz, kt\xF3ry potrafi czyta\u0107 sytuacj\u0119 przed wyprowadzeniem, staje si\u0119 pierwszym rozgrywaj\u0105cym. To daje nam realn\u0105 przewag\u0119 przy budowaniu akcji."
  },
  stamina: {
    ["MID" /* MID */]: "Widz\u0119 wyra\u017Any spadek zaanga\u017Cowania w ko\u0144cowych minutach. Polecam priorytetowo zaadresowa\u0107 kondycj\u0119.pomocnik, kt\xF3ry odpada fizycznie w drugiej po\u0142owie, traci wp\u0142yw na gr\u0119 dok\u0142adnie wtedy, gdy najbardziej go potrzebujemy.",
    ["FWD" /* FWD */]: "Szczerze.ten zawodnik znika z gry w ko\u0144c\xF3wkach. A to w\u0142a\u015Bnie wtedy pojawiaj\u0105 si\u0119 najwi\u0119ksze szanse. Polecam skupi\u0107 si\u0119 na kondycji, \u017Ceby utrzyma\u0142 intensywno\u015B\u0107 przez pe\u0142ne 90 minut."
  },
  strength: {
    ["DEF" /* DEF */]: "Polecam zainwestowa\u0107 w si\u0142\u0119 fizyczn\u0105.ten defensor przegrywa za du\u017Co duel\xF3w bezpo\u015Brednich. Przy wrzutkach i pressingu rywala ta s\u0142abo\u015B\u0107 jest regularnie wykorzystywana.",
    ["FWD" /* FWD */]: "Moim zdaniem si\u0142a to brakuj\u0105cy element u tego zawodnika. Napastnik, kt\xF3ry potrafi utrzyma\u0107 pi\u0142k\u0119 plecami do bramki i wygra\u0107 starcie fizyczne, otwiera przestrze\u0144 dla ca\u0142ego zespo\u0142u."
  },
  heading: {
    ["DEF" /* DEF */]: "Zwr\xF3ci\u0142bym uwag\u0119 na gr\u0119 g\u0142ow\u0105.przy sta\u0142ych fragmentach ten defensor jest regularnie pokonywany w powietrzu. To bezpo\u015Brednie zagro\u017Cenie, kt\xF3re warto wyeliminowa\u0107 jak najszybciej.",
    ["FWD" /* FWD */]: "Warto po\u0107wiczy\u0107 gr\u0119 g\u0142ow\u0105.napastnik, kt\xF3ry stanowi zagro\u017Cenie przy do\u015Brodkowaniach, zmusza obron\u0119 do znacznie trudniejszych wybor\xF3w taktycznych."
  },
  technique: {
    ["MID" /* MID */]: "Moim zdaniem technika to ten fundament, kt\xF3rego temu zawodnikowi brakuje. Bez niej nawet dobra pozycja i szybko\u015B\u0107 nie wystarcz\u0105.traci pi\u0142k\u0119 w miejscach, gdzie nie powinien.",
    ["FWD" /* FWD */]: "Polecam skupi\u0107 si\u0119 na technice.widz\u0119, \u017Ce zawodnik marnuje szanse nie dlatego, \u017Ce jest w z\u0142ej pozycji, ale dlatego, \u017Ce pierwsze przyj\u0119cie go zawodzi. To naprawialne."
  },
  dribbling: {
    ["FWD" /* FWD */]: "Moim zdaniem drybling to w\u0142a\u015Bnie to, czego temu napastnikowi brakuje do bycia gro\u017Anym jeden na jeden. Przy lepszym dryblu otworzy przestrze\u0144 tam, gdzie obrona jest najszczelniejsza.",
    ["MID" /* MID */]: "Polecam po\u0107wiczy\u0107 drybling.pomocnik, kt\xF3ry potrafi wyj\u015B\u0107 z pressingu z pi\u0142k\u0105 przy nodze, daje dru\u017Cynie czas i przestrze\u0144 w trudnych momentach."
  },
  attacking: {
    ["FWD" /* FWD */]: "Widz\u0119, \u017Ce ten zawodnik zbyt rzadko anga\u017Cuje si\u0119 w akcje ofensywne w kluczowych strefach. Polecam popracowa\u0107 nad aktywno\u015Bci\u0105 ofensywn\u0105.napastnik musi by\u0107 tam, gdzie dzieje si\u0119 gra.",
    ["MID" /* MID */]: "Moim zdaniem ten pomocnik zostawia za du\u017Co potencja\u0142u ofensywnego niewykorzystanego. Przy wi\u0119kszym zaanga\u017Cowaniu w akcje ataku sta\u0142by si\u0119 realnym zagro\u017Ceniem dla rywali."
  }
};
var buildAgeExperienceIntro = (player2) => {
  const { age } = player2;
  const matches = player2.stats.matchesPlayed;
  const talent = player2.attributes.talent;
  if (age <= 19 && matches < 15)
    return `Trenerze, pami\u0119tajmy \u017Ce m\xF3wimy o zawodniku z minimalnym do\u015Bwiadczeniem meczowym. Jest na samym pocz\u0105tku drogi.`;
  if (age <= 19)
    return `Mamy tu m\u0142odego zawodnika, kt\xF3ry jak na sw\xF3j wiek zebra\u0142 ju\u017C ca\u0142kiem przyzwoite do\u015Bwiadczenie. To dopiero pocz\u0105tek kariery, b\u0142\u0119dy s\u0105 naturaln\u0105 cz\u0119\u015Bci\u0105 procesu.`;
  if (age <= 22 && talent >= 72)
    return `To m\u0142ody, perspektywiczny zawodnik z du\u017Cym talentem. W\u0142a\u015Bnie teraz, w tym oknie, mo\u017Cemy go ukszta\u0142towa\u0107 na miar\u0119 jego mo\u017Cliwo\u015Bci.`;
  if (age <= 22)
    return `Zawodnik wci\u0105\u017C jest w fazie kszta\u0142towania si\u0119. Mamy czas, ale warto ju\u017C teraz nada\u0107 odpowiedni kierunek.`;
  if (age <= 26 && matches >= 60)
    return `M\xF3wimy o zawodniku z solidnym do\u015Bwiadczeniem (${matches} mecz\xF3w) w kwiecie wieku. To idealny moment na wyci\u0105ganie maksimum.`;
  if (age <= 26)
    return `Rozwijaj\u0105ca si\u0119 kariera. Zawodnik jest na etapie, gdzie konsekwentny trening przynosi najwi\u0119ksze efekty.`;
  if (age <= 30 && matches >= 100)
    return `To do\u015Bwiadczony zawodnik, ${matches} mecz\xF3w robi swoje. Jest jeszcze w stanie si\u0119 rozwija\u0107, ale wymaga przemy\u015Blanego podej\u015Bcia.`;
  if (age <= 30)
    return `Zawodnik jest w szczytowym okresie kariery. Poprawy ju\u017C nie przyjd\u0105 same, wymagaj\u0105 ukierunkowanej pracy.`;
  if (age <= 33 && matches >= 120)
    return `M\xF3wimy o weteranie z bogatym do\u015Bwiadczeniem (${matches} mecz\xF3w). Nie oczekuj\u0119 skok\xF3w, ale do\u015Bwiadczenie rekompensuje wiele brak\xF3w.`;
  if (age <= 33)
    return `Zawodnik zbli\u017Ca si\u0119 do ko\u0144ca szczytowego okresu. To moment, gdy ka\u017Cdy sezon treningowy liczy si\u0119 podw\xF3jnie.`;
  return `Przy ${matches} meczach na karku mamy do czynienia z prawdziwym weteranem. Progres b\u0119dzie ograniczony, priorytetem jest utrzymanie poziomu.`;
};
var buildTrainingRecommendationText = (player2, priorityAttr) => {
  const pos = player2.position;
  const label = ATTR_LABELS_REP[priorityAttr] || priorityAttr;
  const intro = buildAgeExperienceIntro(player2);
  const narrative = POSITION_NARRATIVES[priorityAttr]?.[pos] || `Polecam skupi\u0107 uwag\u0119 na cesze ${label.toLowerCase()}.w mojej ocenie to w\u0142a\u015Bnie tutaj jest najwi\u0119kszy potencja\u0142 do poprawy. Odpowiedni program treningowy powinien przynie\u015B\u0107 wymierne efekty.`;
  return `${intro} ${narrative}`;
};
var buildInvestmentText = (player2) => {
  const { age, overallRating } = player2;
  const talent = player2.attributes.talent;
  if (age <= 20 && talent >= 75 && overallRating >= 68) return "Wyj\u0105tkowy talent. Priorytet inwestycyjny.mo\u017Ce sta\u0107 si\u0119 gwiazd\u0105 dru\u017Cyny.";
  if (age <= 23 && talent >= 70) return "Obiecuj\u0105cy m\u0142ody zawodnik z wysokim potencja\u0142em wzrostu. Zdecydowanie warto inwestowa\u0107.";
  if (age <= 23 && talent >= 60) return "M\u0142ody gracz z solidnym potencja\u0142em. Regularny trening przyniesie wymierne efekty.";
  if (age <= 27 && overallRating >= 78) return "Zawodnik w kwiecie wieku, wysoka forma. Solidna inwestycja d\u0142ugoterminowa.";
  if (age <= 27 && overallRating >= 65) return "Dobry wiek i zadowalaj\u0105cy poziom. Wart kontynuowania rozwoju.";
  if (age <= 30 && overallRating >= 75) return "Do\u015Bwiadczony gracz w szczytowej formie. Warto\u015Bciowy, cho\u0107 wzrost ograniczony.";
  if (age <= 30 && overallRating >= 65) return "Solidny zawodnik z niewielkim potencja\u0142em wzrostu. Utrzymanie formy jako cel.";
  if (age > 32 && overallRating >= 74) return "Do\u015Bwiadczony weteran wysokiej klasy. Kr\xF3tkoterminowy atut dru\u017Cyny.";
  if (age > 32) return "Zawodnik u zmierzchu kariery. Inwestycja nieop\u0142acalna.rozwa\u017C planowanie zmiany.";
  return "Przeci\u0119tny poziom i ograniczony potencja\u0142. Warto rozwa\u017Cy\u0107 sprzeda\u017C lub znalezienie zast\u0119pstwa.";
};
var buildDevelopmentAdvice = (player2, recommendedFocus, recommendedFocusLabel, recommendedCycleName, context, staffQuality) => {
  const changes = player2.stats.seasonalChanges ?? {};
  const keyAttrs = POSITION_KEY_ATTRS[player2.position] ?? [];
  const fallingKeyAttr = keyAttrs.find((attr) => (changes[attr] ?? 0) < 0);
  const fallingPhysical = PHYSICAL_ATTRS_RPT.find((attr) => (changes[attr] ?? 0) < 0);
  const minutes = player2.stats.minutesPlayed ?? 0;
  const fatigueDebt = player2.fatigueDebt ?? 0;
  const condition = player2.condition ?? 100;
  const assistantQuality = staffQuality?.assistantAvg ?? 0;
  const canNameCause = !staffQuality?.assistantExists || assistantQuality >= 55;
  const canBePrecise = staffQuality?.assistantExists && assistantQuality >= 70;
  const currentFocusLabel = player2.trainingFocus ? ATTR_LABELS_REP[player2.trainingFocus] || player2.trainingFocus : null;
  const seasonalGrowthUsed = PlayerDevelopmentService.getSeasonalGrowthUsed(
    changes,
    player2.stats.seasonalGrowthPoints
  );
  const seasonalGrowthCap = PlayerDevelopmentService.getSeasonalGrowthCap(player2, {
    coachQuality: Math.max(staffQuality?.assistantAvg ?? 10, staffQuality?.fitnessAvg ?? 10, staffQuality?.goalkeeperAvg ?? 10)
  });
  const items = [];
  const pushUnique = (item) => {
    if (!items.some((existing) => existing.title === item.title)) items.push(item);
  };
  if (fallingKeyAttr) {
    const label = ATTR_LABELS_REP[fallingKeyAttr] || fallingKeyAttr;
    pushUnique({
      priority: "WYSOKI",
      title: `Zatrzymaj spadek: ${label}`,
      action: player2.trainingFocus === fallingKeyAttr ? `Zostaw fokus ${label}, ale daj zawodnikowi 2-3 kolejki regularnej pracy i minut.` : `Ustaw fokus indywidualny na ${label}.`,
      reason: canNameCause ? `${label} spada, a to jeden z kluczowych atrybut\xF3w dla tej pozycji. Bez reakcji zawodnik b\u0119dzie s\u0142abiej pasowa\u0142 do roli.` : "Wida\u0107 spadek w obszarze wa\u017Cnym dla pozycji, cho\u0107 diagnoza szczeg\xF3\u0142owa wymaga lepszego asystenta."
    });
  }
  if (!player2.trainingFocus) {
    pushUnique({
      priority: fallingKeyAttr ? "SREDNI" : "WYSOKI",
      title: "Brak fokusu indywidualnego",
      action: `Ustaw fokus na ${recommendedFocusLabel}.`,
      reason: canBePrecise ? "Brak fokusu obni\u017Ca efektywno\u015B\u0107 rozwoju i lekko zwi\u0119ksza ryzyko regresu w silniku treningu." : "Zawodnik pracuje zbyt og\xF3lnie, wi\u0119c trudniej popchn\u0105\u0107 konkretny atrybut do g\xF3ry."
    });
  }
  if (player2.age <= 23 && minutes < 270 || player2.age >= 22 && minutes < 360) {
    pushUnique({
      priority: player2.age <= 23 ? "WYSOKI" : "SREDNI",
      title: "Za ma\u0142o minut meczowych",
      action: player2.age <= 23 ? "Dawaj mu regularne wej\u015Bcia z \u0142awki albo wyst\u0119py w \u0142atwiejszych meczach." : "Wprowad\u017A go do rotacji, je\u015Bli chcesz utrzyma\u0107 rozw\xF3j i form\u0119.",
      reason: canBePrecise ? `Ma tylko ${minutes} minut w sezonie. Poni\u017Cej oko\u0142o 360 minut trudniej o wzrost i \u0142atwiej o stagnacj\u0119.` : "Bez gry trening s\u0142abiej przek\u0142ada si\u0119 na rozw\xF3j."
    });
  }
  if (fallingPhysical || condition < 74 || fatigueDebt > 30) {
    const label = fallingPhysical ? ATTR_LABELS_REP[fallingPhysical] || fallingPhysical : "parametry fizyczne";
    pushUnique({
      priority: condition < 70 || fatigueDebt > 40 ? "WYSOKI" : "SREDNI",
      title: `Kontrola obci\u0105\u017Cenia: ${label}`,
      action: context?.intensity === "HEAVY" /* HEAVY */ || condition < 74 || fatigueDebt > 30 ? "Zejd\u017A na lekki/normalny trening przez najbli\u017Cszy cykl i unikaj ci\u0119\u017Ckich program\xF3w pressingowych." : "Nie zwi\u0119kszaj obci\u0105\u017Cenia, dop\xF3ki trend fizyczny si\u0119 nie ustabilizuje.",
      reason: canNameCause ? `Kondycja ${condition}, d\u0142ug zm\u0119czeniowy ${fatigueDebt}. Przy takim profilu przeci\u0105\u017Cenie mo\u017Ce pog\u0142\u0119bia\u0107 spadki.` : "Parametry fizyczne wygl\u0105daj\u0105 na os\u0142abione, wi\u0119c najpierw ustabilizuj cia\u0142o."
    });
  } else if (player2.age <= 23 && player2.attributes.talent >= 70 && seasonalGrowthUsed < seasonalGrowthCap && context?.intensity === "LIGHT" /* LIGHT */) {
    pushUnique({
      priority: "SREDNI",
      title: "Mo\u017Cesz mocniej bod\u017Acowa\u0107 rozw\xF3j",
      action: "Przejd\u017A z lekkiego na normalny trening, je\u015Bli terminarz i kondycja dru\u017Cyny pozwalaj\u0105.",
      reason: "M\u0142ody zawodnik z talentem potrzebuje regularnego bod\u017Aca treningowego, a nie tylko podtrzymania."
    });
  }
  if (seasonalGrowthUsed >= seasonalGrowthCap) {
    pushUnique({
      priority: "NISKI",
      title: "Limit wzrostu w tym sezonie",
      action: "Nie oczekuj ju\u017C du\u017Cych skok\xF3w atrybut\xF3w; skup si\u0119 na formie, minutach i utrzymaniu zdrowia.",
      reason: canBePrecise ? `Wykorzystany wzrost sezonowy: ${seasonalGrowthUsed}/${seasonalGrowthCap}.` : "Profil sezonowy wygl\u0105da na nasycony, wi\u0119c dalszy progres mo\u017Ce by\u0107 ograniczony."
    });
  }
  if (context?.activeTrainingName && context.activeTrainingName !== recommendedCycleName && items.length < 4) {
    pushUnique({
      priority: "NISKI",
      title: "Dopasuj program dru\u017Cynowy",
      action: `Rozwa\u017C program ${recommendedCycleName}, je\u015Bli chcesz rozwija\u0107 tego zawodnika szybciej.`,
      reason: `Obecny plan: ${context.activeTrainingName}. Rekomendacja dla profilu zawodnika: ${recommendedCycleName}.`
    });
  }
  if (items.length === 0) {
    pushUnique({
      priority: "NISKI",
      title: "Plan jest stabilny",
      action: `Utrzymaj fokus ${currentFocusLabel ?? recommendedFocusLabel} i obecny rytm gry.`,
      reason: "Nie wida\u0107 silnych sygna\u0142\xF3w regresu ani przeci\u0105\u017Cenia. Najwa\u017Cniejsza jest konsekwencja."
    });
  }
  const ordered = items.sort((left, right) => {
    const order = { WYSOKI: 0, SREDNI: 1, NISKI: 2 };
    return order[left.priority] - order[right.priority];
  }).slice(0, 4);
  const summary = ordered[0]?.priority === "WYSOKI" ? "Najpierw wykonaj najwy\u017Cszy priorytet. Dopiero potem oceniaj, czy atrybut zaczyna wraca\u0107." : ordered[0]?.priority === "SREDNI" ? "Nie ma alarmu, ale jedna korekta powinna przyspieszy\u0107 rozw\xF3j." : "Plan nie wymaga gwa\u0142townych zmian. Pilnuj regularno\u015Bci.";
  return { summary, items: ordered };
};
var POS_LABEL = {
  ["GK" /* GK */]: "bramkarz",
  ["DEF" /* DEF */]: "defensor",
  ["MID" /* MID */]: "pomocnik",
  ["FWD" /* FWD */]: "napastnik"
};
var buildOverallAssessment = (player2, relToPos, relToTeam, posAvgOvr, samePosCount, isTeamTopOvr, isTopGoalscorer, isTopAssist, seed, traitsText, weakText) => {
  const pos = POS_LABEL[player2.position];
  const { age } = player2;
  const talent = player2.attributes.talent;
  const alone = samePosCount === 0;
  const t = traitsText ? ` ${traitsText}` : "";
  const w = weakText ? ` ${weakText}` : "";
  const v = seed % 3;
  if (isTeamTopOvr && player2.position === "FWD" /* FWD */ && isTopGoalscorer) return [
    `Trenerze, to nasz najlepszy zawodnik. Napastnik z najwy\u017Csz\u0105 ocen\u0105 w sk\u0142adzie i jednocze\u015Bnie czo\u0142owy strzelec.${t} Bez niego jeste\u015Bmy o klas\u0119 s\u0142absi.`,
    `Najlepsza karta w naszej talii. Ten napastnik wyra\u017Anie przewy\u017Csza reszt\u0119 sk\u0142adu, a jego skuteczno\u015B\u0107 przed bramk\u0105 m\xF3wi sama za siebie.${t} To fundament naszego ataku.`,
    `M\xF3wi\u0119 wprost: bez tego zawodnika jeste\u015Bmy s\u0142absi o klas\u0119. Najlepszy gracz w dru\u017Cynie i nasz czo\u0142owy strzelec.${t}`
  ][v];
  if (isTeamTopOvr && player2.position === "FWD" /* FWD */) return [
    `Trenerze, to nasz najlepszy zawodnik. Napastnik kluczowy dla ofensywy, wok\xF3\u0142 kt\xF3rego budowana jest gra ataku.${t}`,
    `Najwy\u017Cej oceniany zawodnik w sk\u0142adzie. Ten napastnik daje nam jako\u015B\u0107 w ataku, kt\xF3rej nie ma nikt inny w dru\u017Cynie.${t}`,
    `To lider naszej ofensywy i najlepszy zawodnik w dru\u017Cynie.${t} Ka\u017Cda decyzja taktyczna powinna uwzgl\u0119dnia\u0107 jego rol\u0119 w grze.`
  ][v];
  if (isTeamTopOvr && player2.position === "MID" /* MID */ && isTopAssist) return [
    `Trenerze, to silnik naszego \u015Brodka pola. Najlepszy zawodnik w dru\u017Cynie i lider asyst, kt\xF3ry dyktuje tempo gry w ka\u017Cdym meczu.${t}`,
    `Ci\u0119\u017Cko znale\u017A\u0107 kogo\u015B lepszego w sk\u0142adzie. Ten pomocnik dominuje w \u015Brodku pola, a liczba asyst \u015Bwiadczy, \u017Ce kreuje gr\u0119 na najwy\u017Cszym poziomie.${t}`,
    `To m\xF3zg naszej dru\u017Cyny. Najwy\u017Cszy poziom w sk\u0142adzie, przy tym doskona\u0142e kreowanie akcji.${t} Wszystkie kluczowe decyzje taktyczne musz\u0105 uwzgl\u0119dnia\u0107 jego rol\u0119.`
  ][v];
  if (isTeamTopOvr && player2.position === "MID" /* MID */) return [
    `Trenerze, to kluczowe ogniwo \u015Brodka pola i najlepszy zawodnik w dru\u017Cynie. Jego wp\u0142yw na gr\u0119 jest wyra\u017Anie odczuwalny.${t}`,
    `Najlepszy zawodnik w naszym sk\u0142adzie. Ten pomocnik nadaje rytm ca\u0142ej dru\u017Cynie i jest punktem odniesienia dla reszty.${t}`,
    `Kreator gry i nasz najcenniejszy zawodnik. Bez niego \u015Brodek pola traci na jako\u015Bci i tempo akcji spada.${t}`
  ][v];
  if (isTeamTopOvr && player2.position === "GK" /* GK */) return [
    `Trenerze, mamy szcz\u0119\u015Bcie \u017Ce ten bramkarz stoi mi\u0119dzy s\u0142upkami. Najlepszy zawodnik w dru\u017Cynie.${t} Jego pewno\u015B\u0107 udziela si\u0119 ca\u0142ej defensywie.`,
    `To fundament naszej obrony. Najwy\u017Cej oceniany zawodnik w sk\u0142adzie, a w bramce daje ca\u0142emu zespo\u0142owi poczucie bezpiecze\u0144stwa.${t}`,
    `M\xF3wi\u0119 to rzadko, ale ten bramkarz to klasa sama w sobie. Najlepszy w naszym sk\u0142adzie i wida\u0107 to na boisku.${t}`
  ][v];
  if (isTeamTopOvr) return [
    `Trenerze, to nasz najlepszy zawodnik na tej pozycji. Wyr\xF3\u017Cnia si\u0119 poziomem na tle ca\u0142ego sk\u0142adu.${t} Kluczowy dla stabilno\u015Bci formacji.`,
    `Gwiazda dru\u017Cyny na swojej pozycji. \u017Baden inny zawodnik w sk\u0142adzie nie osi\u0105ga takiego poziomu.${t} To gracz, wok\xF3\u0142 kt\xF3rego warto budowa\u0107 taktyk\u0119.`,
    `Fundament formacji i najlepszy zawodnik w dru\u017Cynie.${t} Jego brak by\u0142by odczuwalny zar\xF3wno jako\u015Bciowo jak i mentalnie dla reszty sk\u0142adu.`
  ][v];
  if (!alone && relToPos > 10) return [
    `Trenerze, ten ${pos} zdecydowanie wyr\xF3\u017Cnia si\u0119 na tle pozosta\u0142ych na tej pozycji.${t} Trudno by\u0142oby go zast\u0105pi\u0107 bez wyra\u017Anego spadku jako\u015Bci formacji.`,
    `To nasz kluczowy ${pos}. Wyra\u017Ana r\xF3\u017Cnica jako\u015Bciowa w stosunku do reszty na tej pozycji jest widoczna od pierwszych minut.${t}`,
    `Najlepszy ${pos} w dru\u017Cynie z du\u017C\u0105 przewag\u0105.${t} Taki zawodnik podnosi standardy ca\u0142ej formacji.`
  ][v];
  if (!alone && relToPos > 5) return [
    `Ten ${pos} plasuje si\u0119 wyra\u017Anie powy\u017Cej dru\u017Cynowej normy na tej pozycji.${t} Solidna inwestycja, kt\xF3ra zwraca si\u0119 na boisku.`,
    `Trenerze, warto doceni\u0107 tego zawodnika. Regularnie prezentuje poziom powy\u017Cej reszty ${pos}\xF3w w dru\u017Cynie.${t}`,
    `Wida\u0107 wyra\u017An\u0105 r\xF3\u017Cnic\u0119 jako\u015Bciow\u0105 mi\u0119dzy tym ${pos}em a pozosta\u0142ymi.${t} Zawodnik, kt\xF3ry podnosi standardy ca\u0142ej linii.`
  ][v];
  if (!alone && relToPos > 0 && age < 23 && talent >= 68) return [
    `Trenerze, to obiecuj\u0105cy m\u0142ody zawodnik. Nieco powy\u017Cej dru\u017Cynowej normy, ale jego potencja\u0142 to w\u0142a\u015Bnie to, co mnie tu interesuje.${t} Przy odpowiednim prowadzeniu mo\u017Ce sta\u0107 si\u0119 kluczowym graczem.`,
    `Nieznacznie powy\u017Cej \u015Bredniej dru\u017Cynowej, ale nie to jest najwa\u017Cniejsze. Ten m\u0142ody zawodnik ma predyspozycje do dalszego rozwoju.${t} Teraz jest idealny moment na ukszta\u0142towanie go.`,
    `Na razie solidny poziom, ale przysz\u0142o\u015B\u0107 tego zawodnika wygl\u0105da obiecuj\u0105co.${t} To w\u0142a\u015Bnie teraz jest moment, \u017Ceby nada\u0107 w\u0142a\u015Bciwy kierunek jego karierze.`
  ][v];
  if (!alone && relToPos > -3) return [
    `Trenerze, ten zawodnik plasuje si\u0119 w granicach dru\u017Cynowej normy dla swojej pozycji.${t} Solidny element sk\u0142adu, cho\u0107 trudno m\xF3wi\u0107 o wyj\u0105tkowo\u015Bci.`,
    `Ani wybitny lider, ani s\u0142abe ogniwo. Ten ${pos} prezentuje poziom zbli\u017Cony do dru\u017Cynowej przeci\u0119tnej.${t}`,
    `Zawodnik dru\u017Cynowej normy. Na tle koleg\xF3w z pozycji nie wyr\xF3\u017Cnia si\u0119 ani pozytywnie, ani negatywnie.${t} Cenny, ale nie kto\u015B, na kim powinni\u015Bmy budowa\u0107 taktyk\u0119.`
  ][v];
  if (!alone && relToPos > -8) return [
    `Trenerze, musz\u0119 powiedzie\u0107 wprost: ten zawodnik jest nieznacznie poni\u017Cej dru\u017Cynowego standardu na tej pozycji.${w} Wymagana poprawa lub przemy\u015Blane wzmocnienie sk\u0142adu.`,
    `Widz\u0119, \u017Ce ten ${pos} ma pewne trudno\u015Bci z osi\u0105ganiem poziomu reszty formacji.${w} Nie jest to dramatyczna sytuacja, ale warto j\u0105 zaadresowa\u0107.`,
    `Poziom poni\u017Cej dru\u017Cynowej normy na tej pozycji.${w} Nie jest to jeszcze kryzys, ale bez interwencji mo\u017Ce si\u0119 pog\u0142\u0119bi\u0107.`
  ][v];
  if (!alone && relToPos <= -8) return [
    `Trenerze, b\u0119d\u0119 szczery: ten zawodnik wyra\u017Anie odstaje od reszty ${pos}\xF3w w dru\u017Cynie.${w} To s\u0142abe ogniwo formacji, kt\xF3re rywale b\u0119d\u0105 wykorzystywa\u0107.`,
    `Musz\u0119 zwr\xF3ci\u0107 uwag\u0119 na ten problem. Ten ${pos} prezentuje poziom znacznie poni\u017Cej dru\u017Cynowego standardu.${w} Konieczna jest pilna interwencja.`,
    `To jest dla mnie priorytet. Ten zawodnik wyra\u017Anie obni\u017Ca jako\u015B\u0107 ca\u0142ej formacji.${w} Trzeba to rozwi\u0105za\u0107, czy przez intensywny trening, czy przez zmian\u0119 w sk\u0142adzie.`
  ][v];
  if (relToTeam > 5) return [
    `Jeden z mocniejszych zawodnik\xF3w w dru\u017Cynie. Jego wk\u0142ad przekracza dru\u017Cynow\u0105 \u015Bredni\u0105 i jest odczuwalny na boisku.${t}`,
    `Ten zawodnik wyr\xF3\u017Cnia si\u0119 poziomem na tle ca\u0142ego sk\u0142adu.${t} Jego jako\u015B\u0107 jest zauwa\u017Calna i warta podkre\u015Blenia.`,
    `Powy\u017Cej dru\u017Cynowej przeci\u0119tnej i to wida\u0107 w grze.${t} Solidny zawodnik, na kt\xF3rym mo\u017Cna polega\u0107.`
  ][v];
  return [
    `Prezentuje poziom zbli\u017Cony do dru\u017Cynowej \u015Bredniej.${t} Solidny zawodnik bez wyra\u017Anych odchyle\u0144 in plus ani in minus.`,
    `Poziom dru\u017Cynowej normy. Na tle sk\u0142adu nie wyr\xF3\u017Cnia si\u0119 szczeg\xF3lnie, ale robi swoj\u0105 robot\u0119.${t}`,
    `Zawodnik w granicach dru\u017Cynowej przeci\u0119tnej.${t} Nie jest liderem, ale nie jest te\u017C s\u0142abym ogniwem.`
  ][v];
};
var buildPositionEffectivenessText = (posEffRelative, posEff, position, samePosCount) => {
  const pos = POS_LABEL[position];
  if (samePosCount === 0) {
    if (posEff >= 75) return `Kluczowe atrybuty na tej pozycji prezentuj\u0105 si\u0119 na wysokim poziomie.skuteczno\u015B\u0107 na boisku jest wyra\u017Ana.`;
    if (posEff >= 65) return `Kluczowe atrybuty na zadowalaj\u0105cym poziomie, cho\u0107 kilka obszar\xF3w wymaga dalszej pracy.`;
    return `Kluczowe atrybuty wymagaj\u0105 intensywnej pracy.skuteczno\u015B\u0107 na tej pozycji jest ograniczona.`;
  }
  if (posEffRelative > 8) return `Przewy\u017Csza pozosta\u0142ych ${pos}\xF3w w dru\u017Cynie pod wzgl\u0119dem kluczowych atrybut\xF3w.to widoczna r\xF3\u017Cnica jako\u015Bciowa.`;
  if (posEffRelative > 3) return `Nieznacznie powy\u017Cej dru\u017Cynowej \u015Bredniej dla tej pozycji w kluczowych atrybutach. Solidna skuteczno\u015B\u0107.`;
  if (posEffRelative > -4) return `Kluczowe atrybuty zbli\u017Cone do pozosta\u0142ych ${pos}\xF3w w dru\u017Cynie.\u017Cadnych wyra\u017Anych odchyle\u0144.`;
  if (posEffRelative > -9) return `Nieznacznie poni\u017Cej dru\u017Cynowego standardu w kluczowych atrybutach. Kilka obszar\xF3w wymaga poprawy.`;
  return `Kluczowe atrybuty wyra\u017Anie odbiegaj\u0105 od standard\xF3w pozosta\u0142ych ${pos}\xF3w w dru\u017Cynie. Poprawa jest priorytetem.`;
};
var POSITION_ALLOWED_CYCLES = {
  ["GK" /* GK */]: /* @__PURE__ */ new Set(["T_TACTICAL_PERIOD", "T_RECOVERY_YOGA", "T_SET_PIECES"]),
  ["DEF" /* DEF */]: /* @__PURE__ */ new Set(["T_CATENACCIO", "T_TACTICAL_PERIOD", "T_AIR_DOM", "T_RECOVERY_YOGA", "T_HIGH_PRESS", "T_GEGENPRESSING", "T_COUNTER_ATTACK"]),
  ["MID" /* MID */]: /* @__PURE__ */ new Set(["T_TIKI_TAKA", "T_TACTICAL_PERIOD", "T_GEGENPRESSING", "T_HIGH_PRESS", "T_COUNTER_ATTACK", "T_SAQ", "T_SET_PIECES"]),
  ["FWD" /* FWD */]: /* @__PURE__ */ new Set(["T_FINISHING", "T_COUNTER_ATTACK", "T_SAQ", "T_GEGENPRESSING", "T_HIGH_PRESS", "T_TIKI_TAKA"])
};
var chooseCycleForPosition = (player2, rng) => {
  const allowed = POSITION_ALLOWED_CYCLES[player2.position];
  const cycleCandidates = TRAINING_CYCLES.filter((cycle) => allowed.has(cycle.id));
  const scored = cycleCandidates.map((cycle) => ({ cycle, score: getCycleScore(cycle, [player2], rng) })).sort((left, right) => right.score - left.score).slice(0, 4);
  return weightedPick(
    scored.map((entry) => ({
      item: entry.cycle,
      weight: entry.score
    })),
    rng
  );
};
var buildNotableTraitsNarrative = (traits) => {
  const positives = traits.filter((t) => !t.isWarning).map((t) => t.label.toLowerCase());
  const warnings = traits.filter((t) => t.isWarning).map((t) => t.label.toLowerCase());
  const parts = [];
  if (positives.length === 1)
    parts.push(`Warto podkre\u015Bli\u0107 jego ${positives[0]}.`);
  else if (positives.length === 2)
    parts.push(`Warto podkre\u015Bli\u0107 jego ${positives[0]} oraz ${positives[1]}.`);
  else if (positives.length >= 3)
    parts.push(`Warto podkre\u015Bli\u0107 jego ${positives.slice(0, -1).join(", ")} oraz ${positives[positives.length - 1]}.`);
  if (warnings.length > 0)
    parts.push(`Uwaga na ${warnings.join(", ")} warto mie\u0107 to na uwadze przy ustawianiu sk\u0142adu.`);
  return parts.join(" ");
};
var PHYSICAL_ATTRS_RPT = ["stamina", "strength", "pace"];
var GK_ATTRS_RPT = ["goalkeeping", "positioning", "heading"];
var CAUSE_DESCRIPTIONS = {
  // Wiek 33+ → liniowy decay w TrainingService.ts linie 293-299; fizyczne atrybuty 1.3× szybciej (linia 301)
  AGE_DECLINE: "naturalny regres wynikaj\u0105cy z wieku zawodnika \u2014 statystycznie nieunikniony powy\u017Cej 33. roku \u017Cycia",
  // Brak trainingFocus → +0.002 regression/round (linia 290) + -10/18% wzrostu (linia 232)
  NO_FOCUS: "brak zdefiniowanego indywidualnego fokusu treningowego \u2014 obni\u017Ca efektywno\u015B\u0107 pracy o 18\u201328% i zwi\u0119ksza prawdopodobie\u0144stwo regresu",
  // minutesPlayed < 360 w wieku >= 22 → gorszy seasonal growth cap (PlayerDevelopmentService) + +0.005 decay/round (linia 291)
  LOW_MINUTES: "niewystarczaj\u0105cy czas meczowy w bie\u017C\u0105cym sezonie (poni\u017Cej 360 minut) \u2014 brak regularnej gry bezpo\u015Brednio ogranicza mo\u017Cliwo\u015Bci rozwoju"
};
var diagnoseCauses = (player2, hasFallingAttrs) => {
  const causes = [];
  if (player2.age >= 33) causes.push("AGE_DECLINE");
  if (!player2.trainingFocus && hasFallingAttrs) causes.push("NO_FOCUS");
  if ((player2.stats.minutesPlayed ?? 0) < 360 && player2.age >= 22) causes.push("LOW_MINUTES");
  return causes;
};
var getFormTrend = (player2) => {
  const ratings = player2.stats.ratingHistory ?? [];
  const recent5 = ratings.slice(-5);
  const older5 = ratings.slice(-10, -5);
  const recentAvg = recent5.length > 0 ? recent5.reduce((a, b) => a + b, 0) / recent5.length : 0;
  const olderAvg = older5.length > 0 ? older5.reduce((a, b) => a + b, 0) / older5.length : 0;
  const diff = recentAvg > 0 && olderAvg > 0 ? recentAvg - olderAvg : 0;
  return {
    label: diff > 0.3 ? "rosn\u0105ca" : diff < -0.3 ? "malej\u0105ca" : "stabilna",
    diff,
    avgStr: recent5.length > 0 ? recentAvg.toFixed(1) : null
  };
};
var buildAssistantProgressReport = (player2, exists, quality) => {
  if (!exists) {
    return { observations: "Brak asystenta trenera w sztabie szkoleniowym.", formAssessment: "", recommendations: "" };
  }
  const changes = player2.stats.seasonalChanges ?? {};
  const toLabel = (k) => ATTR_LABELS_REP[k] || k;
  const keyAttrs = POSITION_KEY_ATTRS[player2.position] ?? [];
  const form = getFormTrend(player2);
  const formLine = form.avgStr ? `Forma meczowa ${form.label} \u2014 \u015Brednia ${form.avgStr} pkt.` : "Brak wystarczaj\u0105cych danych meczowych.";
  const fallingKeyAttrs = keyAttrs.filter((a) => (changes[a] ?? 0) < 0);
  const growingKeyAttrs = keyAttrs.filter((a) => (changes[a] ?? 0) > 0);
  const allFalling = Object.entries(changes).filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]);
  const allGrowing = Object.entries(changes).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const noChanges = allFalling.length === 0 && allGrowing.length === 0;
  if (quality < 50) {
    if (noChanges) return { observations: "Profil treningowy bez istotnych zmian sezonowych.", formAssessment: formLine, recommendations: "Utrzyma\u0107 obecny plan treningowy." };
    if (allFalling.length > allGrowing.length) return { observations: "Analiza og\xF3lna wskazuje na tendencj\u0119 spadkow\u0105 w profilu treningowym.", formAssessment: formLine, recommendations: "Wskazana wzmo\u017Cona obserwacja zawodnika na treningach." };
    return { observations: "Og\xF3lny obraz treningowy jest pozytywny. Odnotowywane s\u0105 post\u0119py w profilu atrybut\xF3w.", formAssessment: formLine, recommendations: "Utrzyma\u0107 obecny plan treningowy." };
  }
  const visibleCount = quality >= 70 ? 3 : 2;
  const hasFalling = fallingKeyAttrs.length > 0 || allFalling.length > 0;
  const causes = diagnoseCauses(player2, hasFalling);
  const visibleCauses = causes.slice(0, quality >= 70 ? 3 : 1);
  if (noChanges) {
    return {
      observations: "Analiza profilu sezonowego nie wykazuje istotnych zmian w atrybutach zawodnika.",
      formAssessment: formLine,
      recommendations: !player2.trainingFocus ? "Zdefiniowanie indywidualnego fokusu treningowego pobudzi dalszy rozw\xF3j \u2014 brak fokusu obni\u017Ca efektywno\u015B\u0107 pracy o 18\u201328%." : "Utrzyma\u0107 regularno\u015B\u0107 treningow\u0105 z zachowaniem obecnego fokusu indywidualnego."
    };
  }
  if (fallingKeyAttrs.length > 0) {
    const fallingLabels = fallingKeyAttrs.slice(0, visibleCount).map((a) => toLabel(String(a))).join(", ");
    const growingLabels2 = growingKeyAttrs.slice(0, visibleCount).map((a) => toLabel(String(a))).join(", ");
    const causeText = visibleCauses.length > 0 ? ` Zidentyfikowane przyczyny: ${visibleCauses.map((c, i) => `(${i + 1}) ${CAUSE_DESCRIPTIONS[c]}`).join("; ")}.` : "";
    const planAttr = toLabel(String(fallingKeyAttrs[0]));
    const planSuffix = causes.includes("NO_FOCUS") ? `Natychmiastowe zdefiniowanie fokusu indywidualnego na ${planAttr} jest kluczowe \u2014 bez tego efektywno\u015B\u0107 pracy nad tym obszarem jest ograniczona o 18\u201328%.` : causes.includes("AGE_DECLINE") ? `Przy zawodniku powy\u017Cej 33. roku \u017Cycia regularno\u015B\u0107 treningu jest wa\u017Cniejsza od intensywno\u015Bci. Zalecamy cykl Odnowa Biologiczna przeplatany prac\u0105 techniczn\u0105.` : `Zwi\u0119kszenie czasu meczowego prze\u0142o\u017Cy si\u0119 na stabilizacj\u0119 parametr\xF3w kluczowych.`;
    return {
      observations: `Analiza profilu treningowego wskazuje na regres w obszarach kluczowych dla tej pozycji: ${fallingLabels}.${growingLabels2 ? ` Jednocze\u015Bnie odnotowywany jest wzrost: ${growingLabels2}.` : ""}`,
      formAssessment: formLine + (form.diff < -0.3 ? " Spadek formy koreluje z regresem atrybut\xF3w kluczowych." : ""),
      recommendations: `${causeText} Priorytet interwencji: ${planAttr}. ${planSuffix}`
    };
  }
  if (allFalling.length > allGrowing.length) {
    const fallingLabels = allFalling.slice(0, visibleCount).map(([k]) => toLabel(k)).join(", ");
    const growingLabels2 = allGrowing.slice(0, visibleCount).map(([k]) => toLabel(k)).join(", ");
    const causeText = visibleCauses.length > 0 ? `Czynniki wp\u0142ywaj\u0105ce na regres: ${visibleCauses.map((c, i) => `(${i + 1}) ${CAUSE_DESCRIPTIONS[c]}`).join("; ")}.` : "Przyczyny wymagaj\u0105 dalszej obserwacji.";
    return {
      observations: `Odnotowywane s\u0105 spadki w pobocznych obszarach profilu atrybut\xF3w: ${fallingLabels}.${growingLabels2 ? ` Wzrost: ${growingLabels2}.` : ""}`,
      formAssessment: formLine,
      recommendations: `${causeText} Zalecamy korekt\u0119 planu treningowego w nadchodz\u0105cym cyklu.`
    };
  }
  const growingLabels = allGrowing.slice(0, visibleCount).map(([k]) => toLabel(k)).join(", ");
  const fallingNote = allFalling.length > 0 ? ` Uwaga na obszary wymagaj\u0105ce monitorowania: ${allFalling.slice(0, visibleCount).map(([k]) => toLabel(k)).join(", ")}.` : "";
  return {
    observations: `Analiza sezonowego profilu wskazuje na pozytywny rozw\xF3j. Wzrost odnotowano w: ${growingLabels}.${fallingNote}`,
    formAssessment: formLine,
    recommendations: !player2.trainingFocus ? `Obecny plan przynosi efekty. Zdefiniowanie fokusu indywidualnego wzmocni dalszy post\u0119p \u2014 bez niego wzrost jest o 18\u201328% mniej efektywny.` : `Obecny plan treningowy przynosi widoczne efekty. Utrzyma\u0107 obecny fokus indywidualny.`
  };
};
var buildFitnessProgressReport = (player2, exists, quality) => {
  const changes = player2.stats.seasonalChanges ?? {};
  const physicalMetrics = PHYSICAL_ATTRS_RPT.map((attr) => ({
    label: ATTR_LABELS_REP[attr] || attr,
    change: changes[attr] ?? 0
  }));
  if (!exists) {
    return { physicalMetrics, assessment: "Brak trenera przygotowania motorycznego w sztabie.", recommendations: "" };
  }
  const falling = physicalMetrics.filter((m) => m.change < 0);
  const growing = physicalMetrics.filter((m) => m.change > 0);
  const fallingLabels = falling.map((m) => m.label).join(", ");
  const growingLabels = growing.map((m) => m.label).join(", ");
  const hasAgeDecay = player2.age >= 33;
  const hasLowMinutes = (player2.stats.minutesPlayed ?? 0) < 360 && player2.age >= 22;
  if (quality < 50) {
    if (falling.length === 0 && growing.length === 0) return { physicalMetrics, assessment: "Parametry motoryczne na stabilnym poziomie.", recommendations: "Utrzyma\u0107 obecny plan." };
    if (falling.length > 0) return { physicalMetrics, assessment: "Parametry motoryczne zawodnika wykazuj\u0105 oznaki os\u0142abienia.", recommendations: "Zalecana rewizja planu przygotowania fizycznego." };
    return { physicalMetrics, assessment: "Parametry motoryczne rozwijaj\u0105 si\u0119 poprawnie.", recommendations: "Utrzyma\u0107 obecny plan." };
  }
  if (falling.length === 0 && growing.length === 0) {
    return {
      physicalMetrics,
      assessment: "Parametry motoryczne (kondycja, si\u0142a, szybko\u015B\u0107) pozostaj\u0105 na stabilnym poziomie \u2014 brak istotnych zmian sezonowych.",
      recommendations: hasAgeDecay ? "Przy zawodniku powy\u017Cej 33. roku \u017Cycia stabilizacja parametr\xF3w fizycznych jest warto\u015Bciowym wynikiem. Utrzyma\u0107 plan periodyzacji z naciskiem na regeneracj\u0119." : "Kontynuowa\u0107 obecny plan periodyzacji. Monitorowa\u0107 parametry w drugiej po\u0142owie sezonu."
    };
  }
  if (falling.length > 0) {
    const causeParts = [];
    if (quality >= 70) {
      if (hasAgeDecay) causeParts.push("wiek zawodnika powoduje 30-procentowe przyspieszenie regresu parametr\xF3w motorycznych (TrainingService \u2014 mno\u017Cnik 1.3\xD7 dla fizycznych atrybut\xF3w po 33. roku \u017Cycia)");
      if (hasLowMinutes) causeParts.push("niewystarczaj\u0105cy czas meczowy (poni\u017Cej 360 minut) ogranicza fizyczn\u0105 adaptacj\u0119 do wymaga\u0144 meczowych");
    }
    const causeText = causeParts.length > 0 ? ` Zidentyfikowane przyczyny: ${causeParts.join("; ")}.` : "";
    return {
      physicalMetrics,
      assessment: `Odnotowano spadek parametr\xF3w motorycznych: ${fallingLabels}.${growing.length > 0 ? ` Wzrost: ${growingLabels}.` : ""}${causeText}`,
      recommendations: hasAgeDecay && quality >= 70 ? `Przy zawodniku powy\u017Cej 33. roku \u017Cycia priorytetem jest regeneracja nad rozwojem fizycznym. Zalecamy cykl Odnowa Biologiczna i redukcj\u0119 obci\u0105\u017Ce\u0144 w jednostkach z wysokim Fatigue Risk (Gegenpressing, Wysoki Pressing).` : `Wskazane wprowadzenie cyklu regeneracyjnego. Po stabilizacji parametr\xF3w powr\xF3t do treningu mocy z fokusem na: ${falling[0]?.label ?? fallingLabels}.`
    };
  }
  return {
    physicalMetrics,
    assessment: `Parametry motoryczne rozwijaj\u0105 si\u0119 pozytywnie \u2014 wzrost: ${growingLabels}.${falling.length > 0 ? ` Obserwowa\u0107: ${fallingLabels}.` : ""}`,
    recommendations: falling.length > 0 ? `Utrzyma\u0107 plan periodyzacji. Dodatkowa praca nad: ${fallingLabels}.` : `Plan periodyzacji przynosi wymierne efekty. Mo\u017Cliwe delikatne zwi\u0119kszenie obci\u0105\u017Ce\u0144 treningowych.`
  };
};
var buildGoalkeeperProgressReport = (player2, exists, quality) => {
  const changes = player2.stats.seasonalChanges ?? {};
  if (!exists) {
    return { observations: "Brak trenera bramkarzy w sztabie szkoleniowym.", assessment: "", recommendations: "" };
  }
  const toLabel = (k) => ATTR_LABELS_REP[k] || k;
  const falling = GK_ATTRS_RPT.filter((a) => (changes[a] ?? 0) < 0).map((a) => toLabel(a));
  const growing = GK_ATTRS_RPT.filter((a) => (changes[a] ?? 0) > 0).map((a) => toLabel(a));
  const gkGrowthBlocked = player2.attributes.talent < 72;
  const hasAgeDecay = player2.age >= 33;
  if (quality < 50) {
    if (falling.length === 0 && growing.length === 0) return { observations: "Brak istotnych zmian w profilu atrybut\xF3w bramkarskich.", assessment: "Stabilna postawa treningowa.", recommendations: "Utrzyma\u0107 obecny program specjalistyczny." };
    if (falling.length > 0) return { observations: "Analiza wskazuje na trudno\u015Bci w obszarze technicznym bramkarstwa.", assessment: "Szczeg\xF3\u0142owa diagnoza wymaga dodatkowych danych.", recommendations: "Zalecam zwi\u0119kszenie liczby dedykowanych jednostek treningowych." };
    return { observations: "Bramkarz wykazuje progres w kluczowych parametrach.", assessment: "Postawa treningowa pozytywna.", recommendations: "Utrzyma\u0107 obecny program specjalistyczny." };
  }
  if (falling.length === 0 && growing.length === 0) {
    const talentNote = gkGrowthBlocked && quality >= 70 ? `Brak wzrostu wynika z profilu talentu zawodnika (talent ${player2.attributes.talent} \u2014 poni\u017Cej progu 72 wymaganego do sezonowego wzrostu atrybut\xF3w bramkarskich).` : "Stabilna postawa treningowa bez wyra\u017Anych skok\xF3w ani regres\xF3w.";
    return {
      observations: "Analiza profilu sezonowego nie wykazuje zmian w monitorowanych atrybutach bramkarskich.",
      assessment: talentNote,
      recommendations: gkGrowthBlocked && quality >= 70 ? "Przy obecnym profilu talentu priorytetem jest utrzymanie poziomu. Zalecamy fokus na stabilizacj\u0119 pozycjonowania i komunikacj\u0119 z obro\u0144cami." : "Kontynuowa\u0107 obecny program specjalistyczny. Rozwa\u017Cy\u0107 zwi\u0119kszenie intensywno\u015Bci pracy technicznej."
    };
  }
  if (falling.length > 0) {
    const causeParts = [];
    if (quality >= 70) {
      if (hasAgeDecay) causeParts.push("naturalny regres powy\u017Cej 33. roku \u017Cycia");
      if (!player2.trainingFocus) causeParts.push("brak fokusu indywidualnego na atrybutach bramkarskich \u2014 obni\u017Ca szans\u0119 wzrostu o 18\u201328%");
    }
    const causeText = causeParts.length > 0 ? ` Prawdopodobne przyczyny: ${causeParts.join("; ")}.` : "";
    return {
      observations: `Analiza wskazuje na regres w obszarze: ${falling.join(", ")}.${growing.length > 0 ? ` Wzrost: ${growing.join(", ")}.` : ""}${causeText}`,
      assessment: `Odnotowane braki mog\u0105 bezpo\u015Brednio przek\u0142ada\u0107 si\u0119 na wyniki meczowe.${hasAgeDecay && quality >= 70 ? " Przy zawodniku powy\u017Cej 33. roku \u017Cycia regres parametr\xF3w bramkarskich jest trudniejszy do zatrzymania." : ""}`,
      recommendations: quality >= 70 ? `Priorytet: ${falling[0]}. Dodatkowe jednostki specjalistyczne z naciskiem na technik\u0119 interwencji. ${!player2.trainingFocus ? `Zdefiniowanie fokusu indywidualnego na ${falling[0]} jest kluczowe.` : "Utrzyma\u0107 obecny fokus indywidualny."}` : `Zalecam intensyfikacj\u0119 pracy specjalistycznej w obszarze: ${falling[0]}.`
    };
  }
  return {
    observations: `Analiza wykazuje pozytywny progres w obszarze: ${growing.join(", ")}.`,
    assessment: "Bramkarz rozwija si\u0119 zgodnie z planem szkoleniowym. Post\u0119p widoczny w kluczowych parametrach specjalistycznych.",
    recommendations: "Utrzyma\u0107 specjalistyczny program treningowy. Kontynuowa\u0107 rozwijanie mocnych stron pozycji."
  };
};
var normalizeReportStaffQuality = (value, exists) => {
  if (!exists) return 0;
  const safeValue = Number.isFinite(value) ? Number(value) : 10;
  return clamp3(Math.round(safeValue <= 20 ? safeValue * 5 : safeValue), 0, 100);
};
var reportHashUnit = (seed) => {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
};
var buildAssistantPerception = (playerId, assistantQuality) => {
  const uncertaintyPercent = Math.round(clamp3(25 - assistantQuality * 0.2, 5, 25));
  let sequence = 0;
  return {
    uncertaintyPercent,
    perceive: (value, channel, min = 0, max = 100) => {
      const swing = reportHashUnit(`${playerId}:${assistantQuality}:${channel}`) * 2 - 1;
      return clamp3(value * (1 + swing * uncertaintyPercent / 100), min, max);
    },
    rng: () => {
      sequence += 1;
      return reportHashUnit(`${playerId}:${assistantQuality}:cycle:${sequence}`);
    }
  };
};
var combinedPlayerStats = (player2) => {
  const sources = [player2.stats, player2.cupStats, player2.euroStats, player2.friendlyStats, player2.nationalStats].filter((stats) => !!stats);
  return sources.reduce((total, stats) => ({
    goals: total.goals + (stats.goals ?? 0),
    assists: total.assists + (stats.assists ?? 0),
    yellowCards: total.yellowCards + (stats.yellowCards ?? 0),
    redCards: total.redCards + (stats.redCards ?? 0),
    cleanSheets: total.cleanSheets + (stats.cleanSheets ?? 0),
    matchesPlayed: total.matchesPlayed + (stats.matchesPlayed ?? 0),
    minutesPlayed: total.minutesPlayed + (stats.minutesPlayed ?? 0),
    seasonalChanges: player2.stats.seasonalChanges ?? {},
    seasonalGrowthPoints: player2.stats.seasonalGrowthPoints,
    ratingHistory: [...total.ratingHistory, ...stats.ratingHistory ?? []]
  }), {
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
};
var buildFormAnalysis = (player2, perception) => {
  const form = PlayerFormService.calculate(player2);
  const stats = combinedPlayerStats(player2);
  const recent = stats.ratingHistory.slice(-5);
  const previous = stats.ratingHistory.slice(-10, -5);
  const recentAverage = recent.length > 0 ? average2(recent) : null;
  const previousAverage = previous.length > 0 ? average2(previous) : null;
  const trendDifference = recentAverage !== null && previousAverage !== null ? recentAverage - previousAverage : 0;
  const trend = recentAverage === null ? "BRAK DANYCH" : trendDifference > 0.3 ? "ROSN\u0104CA" : trendDifference < -0.3 ? "SPADAJ\u0104CA" : "STABILNA";
  const perceivedScore = Math.round(perception.perceive(form.score, "form"));
  const perceivedLabel = PlayerFormService.getInfo(perceivedScore).label;
  return {
    score: perceivedScore,
    label: perceivedLabel,
    recentAverage,
    trend,
    assessment: recentAverage === null ? "Brakuje ocen meczowych, dlatego wnioski opieraj\u0105 si\u0119 g\u0142\xF3wnie na treningu, kondycji i morale." : `Ostatnie wyst\u0119py daj\u0105 \u015Bredni\u0105 ${recentAverage.toFixed(2)}, a trend formy jest ${trend.toLowerCase()}.`,
    recommendation: perceivedScore < 40 ? "Ograniczy\u0107 presj\u0119, sprawdzi\u0107 obci\u0105\u017Cenie i odbudowa\u0107 zawodnika minutami dopasowanymi do jego gotowo\u015Bci." : trend === "SPADAJ\u0104CA" ? "Obserwowa\u0107 kolejne dwa wyst\u0119py i rozwa\u017Cy\u0107 l\u017Cejszy tydzie\u0144 lub zmian\u0119 roli meczowej." : "Utrzyma\u0107 rytm meczowy i obecny kierunek pracy."
  };
};
var buildMatchBehaviorAnalysis = (player2, perception) => {
  const stats = combinedPlayerStats(player2);
  const minutes = Math.max(1, stats.minutesPlayed);
  const cardsPer90 = ((stats.yellowCards ?? 0) + (stats.redCards ?? 0) * 2) * 90 / minutes;
  const contributionsPer90 = ((stats.goals ?? 0) + (stats.assists ?? 0)) * 90 / minutes;
  const disciplineBase = clamp3(
    100 - cardsPer90 * 75 - (stats.redCards ?? 0) * 7 - Math.max(0, (player2.attributes.aggression ?? 50) - 70) * 0.45,
    0,
    100
  );
  const behaviorBase = average2([
    disciplineBase,
    player2.attributes.workRate ?? 50,
    player2.attributes.mentality ?? 50,
    player2.attributes.leadership ?? 50
  ]);
  const score = Math.round(perception.perceive(behaviorBase, "match-behavior"));
  const label = score >= 75 ? "DOJRZA\u0141E" : score >= 55 ? "STABILNE" : score >= 35 ? "RYZYKOWNE" : "PROBLEMATYCZNE";
  const cardText = stats.minutesPlayed <= 0 ? "Nie rozegra\u0142 jeszcze minut pozwalaj\u0105cych oceni\u0107 dyscyplin\u0119 meczow\u0105." : `Wska\u017Anik kartek wynosi ${cardsPer90.toFixed(2)} na 90 minut, a udzia\u0142 przy golach ${contributionsPer90.toFixed(2)} na 90 minut.`;
  return {
    score,
    label,
    cardsPer90,
    contributionsPer90,
    assessment: `${cardText} Profil zachowania uwzgl\u0119dnia agresj\u0119, pracowito\u015B\u0107, mentalno\u015B\u0107 i przyw\xF3dztwo.`,
    recommendation: disciplineBase < 55 ? "Pracowa\u0107 nad ustawianiem i kontrol\u0105 agresji; przy wysokim ryzyku kartek unika\u0107 roli wymagaj\u0105cej ci\u0105g\u0142ych sp\xF3\u017Anionych pojedynk\xF3w." : (player2.attributes.workRate ?? 50) < 55 ? "Zwi\u0119ksza\u0107 wymagania dotycz\u0105ce pracy bez pi\u0142ki i konsekwencji w realizacji zada\u0144." : "Nie ma potrzeby zmiany podej\u015Bcia; zachowanie na boisku wspiera zesp\xF3\u0142."
  };
};
var buildAdaptationAnalysis = (player2, perception) => {
  const active = !!player2.clubAdaptation && player2.clubAdaptation.clubId === player2.clubId && player2.clubAdaptation.level < 100;
  const adaptationLevel = Math.round(PlayerClubAdaptationService.getLevel(player2));
  const defaultMindset = active ? 55 : 82;
  const belonging = player2.playerMindset?.squadBelonging ?? defaultMindset;
  const happiness = player2.playerMindset?.clubHappiness ?? (player2.morale ?? defaultMindset);
  const trust = player2.playerMindset?.coachTrust ?? defaultMindset;
  const conflict = player2.playerMindset?.conflictLevel ?? 0;
  const integrationBase = adaptationLevel * 0.48 + belonging * 0.22 + happiness * 0.16 + trust * 0.14 - conflict * 0.18;
  const score = Math.round(perception.perceive(clamp3(integrationBase, 0, 100), "adaptation"));
  const label = score >= 82 ? "PE\u0141NA" : score >= 65 ? "DOBRA" : score >= 45 ? "W TOKU" : "TRUDNA";
  return {
    score,
    label,
    active,
    adaptationLevel,
    assessment: active ? `Adaptacja klubowa wynosi ${adaptationLevel}%. Poczucie przynale\u017Cno\u015Bci: ${Math.round(belonging)}, zadowolenie w klubie: ${Math.round(happiness)}, zaufanie do trenera: ${Math.round(trust)}.` : `Zawodnik zako\u0144czy\u0142 formalny okres adaptacji. Poczucie przynale\u017Cno\u015Bci: ${Math.round(belonging)}, zadowolenie w klubie: ${Math.round(happiness)}, poziom konfliktu: ${Math.round(conflict)}.`,
    recommendation: score < 45 ? "Zapewni\u0107 jasn\u0105 rol\u0119, regularny kontakt i rozs\u0105dne minuty; sprawdzi\u0107 obietnice oraz nastroje w szatni." : score < 65 ? "Kontynuowa\u0107 wprowadzanie do zespo\u0142u i unika\u0107 gwa\u0142townych zmian roli lub obci\u0105\u017Cenia." : "Aklimatyzacja nie wymaga szczeg\xF3lnej interwencji."
  };
};
var buildReadinessAnalysis = (player2, perception) => {
  const condition = clamp3(player2.condition ?? 100, 0, 100);
  const fatigueDebt = clamp3(player2.fatigueDebt ?? 0, 0, 100);
  const morale = clamp3(player2.morale ?? 50, 0, 100);
  const injuryPenalty = player2.health.status === "HEALTHY" /* HEALTHY */ ? 0 : 45;
  const readinessBase = clamp3(condition * 0.58 + (100 - fatigueDebt) * 0.27 + morale * 0.15 - injuryPenalty, 0, 100);
  const score = Math.round(perception.perceive(readinessBase, "readiness"));
  const label = score >= 80 ? "GOTOWY" : score >= 62 ? "DOBRA" : score >= 42 ? "OSTRO\u017BNIE" : "NIEGOTOWY";
  return {
    score,
    label,
    assessment: `Kondycja ${Math.round(condition)}, d\u0142ug zm\u0119czeniowy ${Math.round(fatigueDebt)}, morale ${Math.round(morale)}${player2.health.status === "HEALTHY" /* HEALTHY */ ? "." : ", dodatkowo zawodnik pozostaje poza pe\u0142n\u0105 dyspozycj\u0105 zdrowotn\u0105."}`,
    recommendation: player2.health.status !== "HEALTHY" /* HEALTHY */ ? "Najpierw zako\u0144czy\u0107 leczenie i stopniowo odbudowa\u0107 obci\u0105\u017Cenie treningowe." : fatigueDebt > 55 || condition < 65 ? "Zmniejszy\u0107 obci\u0105\u017Cenie, zaplanowa\u0107 regeneracj\u0119 i ograniczy\u0107 pe\u0142ne wyst\u0119py do czasu poprawy parametr\xF3w." : "Mo\u017Ce realizowa\u0107 normalny plan treningowy i meczowy."
  };
};
var buildCareerPlan = (player2, valueForTeam, developmentPotential, formAnalysis, readinessAnalysis, recommendedFocusLabel, recommendedCycleName, context) => {
  const minutes = combinedPlayerStats(player2).minutesPlayed;
  const talentGap = (player2.attributes.talent ?? player2.overallRating) - player2.overallRating;
  const netSeasonChange = Object.values(player2.stats.seasonalChanges ?? {}).reduce((sum, change) => sum + change, 0);
  let decision;
  let horizon;
  if (readinessAnalysis.score < 40 || player2.health.status !== "HEALTHY" /* HEALTHY */) {
    decision = "REGENEROWA\u0106";
    horizon = "najbli\u017Csze 2\u20134 tygodnie";
  } else if (player2.age <= 22 && talentGap >= 10 && minutes < 450 && valueForTeam !== "WYSOKA") {
    decision = "WYPO\u017BYCZY\u0106";
    horizon = "najbli\u017Csze okno transferowe";
  } else if (developmentPotential === "WYSOKI" || player2.age <= 25 && talentGap >= 7) {
    decision = "ROZWIJA\u0106";
    horizon = "6\u201318 miesi\u0119cy";
  } else if (player2.age >= 31 && netSeasonChange < 0 && valueForTeam === "NISKA") {
    decision = "ROZWA\u017BY\u0106 SPRZEDA\u017B";
    horizon = "do ko\u0144ca sezonu";
  } else if (formAnalysis.score < 42 || valueForTeam === "NISKA") {
    decision = "ROTOWA\u0106";
    horizon = "najbli\u017Csze 4\u20136 spotka\u0144";
  } else {
    decision = "UTRZYMA\u0106";
    horizon = "bie\u017C\u0105cy sezon";
  }
  const nextSteps = [
    `Ustawi\u0107 lub utrzyma\u0107 fokus indywidualny: ${recommendedFocusLabel}.`,
    context?.activeTrainingName ? `Por\xF3wna\u0107 aktywny program \u201E${context.activeTrainingName}\u201D z rekomendowanym \u201E${recommendedCycleName}\u201D.` : `Rozwa\u017Cy\u0107 program dru\u017Cynowy \u201E${recommendedCycleName}\u201D.`
  ];
  if (decision === "WYPO\u017BYCZY\u0106") nextSteps.push("Szuka\u0107 klubu gwarantuj\u0105cego regularne minuty na odpowiednim poziomie.");
  else if (decision === "REGENEROWA\u0106") nextSteps.push("Wr\xF3ci\u0107 do pe\u0142nych minut dopiero po odbudowaniu kondycji i ograniczeniu zm\u0119czenia.");
  else if (decision === "ROTOWA\u0106") nextSteps.push("Da\u0107 seri\u0119 kontrolowanych wyst\u0119p\xF3w i ponownie oceni\u0107 form\u0119 po 4\u20136 meczach.");
  else nextSteps.push("Zweryfikowa\u0107 post\u0119p po kolejnych czterech tygodniach treningu.");
  return {
    decision,
    horizon,
    assessment: `Rekomendacja \u0142\u0105czy wiek, talent, poziom sportowy, minuty, trend atrybut\xF3w, form\u0119 i aktualn\u0105 gotowo\u015B\u0107 zawodnika.`,
    nextSteps
  };
};
var generatePlayerReport = (player2, teamPlayers, leaguePlayers, staffQuality, context) => {
  const keyAttrs = POSITION_KEY_ATTRS[player2.position];
  const talent = player2.attributes.talent;
  const reportStaffQuality = {
    assistantExists: staffQuality?.assistantExists ?? false,
    assistantAvg: normalizeReportStaffQuality(staffQuality?.assistantAvg, staffQuality?.assistantExists ?? false),
    fitnessExists: staffQuality?.fitnessExists ?? false,
    fitnessAvg: normalizeReportStaffQuality(staffQuality?.fitnessAvg, staffQuality?.fitnessExists ?? false),
    goalkeeperExists: staffQuality?.goalkeeperExists ?? false,
    goalkeeperAvg: normalizeReportStaffQuality(staffQuality?.goalkeeperAvg, staffQuality?.goalkeeperExists ?? false)
  };
  const perception = buildAssistantPerception(player2.id, reportStaffQuality.assistantAvg);
  const seed = player2.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const noise = Math.round(perception.perceive(70, "general-observation", 35, 105) - 70);
  const samePos = teamPlayers.filter((p) => p.position === player2.position && p.id !== player2.id);
  const posAvgOvr = samePos.length > 0 ? average2(samePos.map((p) => p.overallRating)) : player2.overallRating;
  const teamAvgOvr = teamPlayers.length > 0 ? average2(teamPlayers.map((p) => p.overallRating)) : player2.overallRating;
  const posAvgKeyAttrs = samePos.length > 0 ? average2(keyAttrs.map((attr) => average2(samePos.map((p) => p.attributes[attr] ?? 0)))) : average2(keyAttrs.map((attr) => player2.attributes[attr] ?? 0));
  const effectiveOvr = perception.perceive(player2.overallRating, "overall-rating", 1, 99);
  const relToPos = effectiveOvr - posAvgOvr;
  const relToTeam = effectiveOvr - teamAvgOvr;
  const importanceMap = POSITION_IMPORTANCE[player2.position];
  const scored = keyAttrs.map((attr) => ({
    attr,
    label: ATTR_LABELS_REP[attr] || attr,
    value: player2.attributes[attr] ?? 0,
    perceivedValue: perception.perceive(player2.attributes[attr] ?? 0, `attribute:${attr}`),
    need: Math.max(0, 80 - perception.perceive(player2.attributes[attr] ?? 0, `attribute:${attr}`)) * (importanceMap[attr] ?? 1),
    strength: perception.perceive(player2.attributes[attr] ?? 0, `attribute:${attr}`) * (importanceMap[attr] ?? 1)
  })).sort((a, b) => b.need - a.need);
  const leaguePosPeers = leaguePlayers.filter((p) => p.position === player2.position && p.id !== player2.id);
  const leagueAttrAvg = (attr) => leaguePosPeers.length > 0 ? average2(leaguePosPeers.map((p) => p.attributes[attr] ?? 0)) : 70;
  const weakAttributes = scored.filter((a) => a.perceivedValue < leagueAttrAvg(a.attr) + noise - 2).slice(0, 3).map(({ attr, label, value }) => ({ attr, label, value }));
  const weakAttrsSet = new Set(weakAttributes.map((a) => a.attr));
  const strongAttributes = [...scored].filter((a) => a.perceivedValue > leagueAttrAvg(a.attr) + noise + 2 && !weakAttrsSet.has(a.attr)).sort((a, b) => b.strength - a.strength).slice(0, 3).map(({ attr, label, value }) => ({ attr, label, value }));
  const posEff = average2(keyAttrs.map((a) => player2.attributes[a] ?? 0));
  const posEffRelative = posEff - posAvgKeyAttrs;
  const positionEffectivenessScore = Math.round(perception.perceive(posEff, "position-effectiveness"));
  const positionEffectivenessText = buildPositionEffectivenessText(posEffRelative, posEff, player2.position, samePos.length);
  const isTeamTopOvr = !teamPlayers.find((p) => p.id !== player2.id && p.overallRating > player2.overallRating);
  const isTopGoalscorer = player2.position === "FWD" /* FWD */ && !teamPlayers.find((p) => p.id !== player2.id && p.position === "FWD" /* FWD */ && (p.stats.goals ?? 0) > (player2.stats.goals ?? 0));
  const isTopAssist = player2.position === "MID" /* MID */ && !teamPlayers.find((p) => p.id !== player2.id && p.position === "MID" /* MID */ && (p.stats.assists ?? 0) > (player2.stats.assists ?? 0));
  const recommendedFocus = scored[0].attr;
  const recommendedFocusLabel = scored[0].label;
  const bestCycle = chooseCycleForPosition(player2, perception.rng);
  const developmentAdvice = buildDevelopmentAdvice(
    player2,
    recommendedFocus,
    recommendedFocusLabel,
    bestCycle.name,
    context,
    reportStaffQuality
  );
  const valueForTeam = relToPos > 7 ? "WYSOKA" : relToPos > -5 ? "SREDNIA" : "NISKA";
  const valueColor = valueForTeam === "WYSOKA" ? "text-emerald-400" : valueForTeam === "SREDNIA" ? "text-amber-400" : "text-rose-400";
  const developmentPotential = player2.age < 21 && talent >= 70 || player2.age < 24 && talent >= 75 ? "WYSOKI" : player2.age < 27 && talent >= 65 || player2.age < 30 && talent >= 72 ? "SREDNI" : "NISKI";
  const potentialColor = developmentPotential === "WYSOKI" ? "text-emerald-400" : developmentPotential === "SREDNI" ? "text-amber-400" : "text-rose-400";
  const notableTraits = TRAIT_DESCRIPTORS.filter((t) => {
    const val = player2.attributes[t.attr] ?? 0;
    const avg = leagueAttrAvg(t.attr);
    const positionRelevant = POSITION_TRAIT_WHITELIST[player2.position]?.has(t.attr) ?? true;
    return positionRelevant && val > avg + t.leagueBonus + noise;
  }).map((t) => ({ label: t.label, isWarning: t.isWarning }));
  const traitsNarrative = buildNotableTraitsNarrative(notableTraits);
  const weakText = weakAttributes.length > 0 ? `Zwr\xF3ci\u0142bym uwag\u0119 na ${weakAttributes.slice(0, 2).map((a) => a.label.toLowerCase()).join(" i ")}, kt\xF3re odstaj\u0105 od ligowej normy na tej pozycji.` : "";
  const overallAssessment = buildOverallAssessment(
    player2,
    relToPos,
    relToTeam,
    posAvgOvr,
    samePos.length,
    isTeamTopOvr,
    isTopGoalscorer,
    isTopAssist,
    seed,
    traitsNarrative,
    weakText
  );
  const formAnalysis = buildFormAnalysis(player2, perception);
  const matchBehavior = buildMatchBehaviorAnalysis(player2, perception);
  const adaptationAnalysis = buildAdaptationAnalysis(player2, perception);
  const readinessAnalysis = buildReadinessAnalysis(player2, perception);
  const careerPlan = buildCareerPlan(
    player2,
    valueForTeam,
    developmentPotential,
    formAnalysis,
    readinessAnalysis,
    recommendedFocusLabel,
    bestCycle.name,
    context
  );
  const confidenceLabel = reportStaffQuality.assistantAvg >= 85 ? "BARDZO WYSOKA" : reportStaffQuality.assistantAvg >= 65 ? "WYSOKA" : reportStaffQuality.assistantAvg >= 40 ? "UMIARKOWANA" : "NISKA";
  return {
    overallAssessment,
    valueForTeam,
    valueColor,
    weakAttributes,
    strongAttributes,
    notableTraits,
    recommendedFocus,
    recommendedFocusLabel,
    recommendedCycleName: bestCycle.name,
    developmentPotential,
    potentialColor,
    investmentText: buildInvestmentText(player2),
    trainingRecommendationText: buildTrainingRecommendationText(player2, scored[0].attr),
    positionEffectivenessText,
    positionEffectivenessScore,
    developmentAdvice,
    analysisMeta: {
      assistantQuality: reportStaffQuality.assistantAvg,
      uncertaintyPercent: perception.uncertaintyPercent,
      confidenceLabel,
      note: `Ocena asystenta zawiera ${perception.uncertaintyPercent}% marginesu obserwacyjnego. Nawet najlepszy asystent zachowuje minimum 5% niepewno\u015Bci.`
    },
    formAnalysis,
    matchBehavior,
    adaptationAnalysis,
    readinessAnalysis,
    careerPlan,
    staffProgressReport: {
      assistantCoach: { hasCoach: reportStaffQuality.assistantExists, quality: reportStaffQuality.assistantAvg, ...buildAssistantProgressReport(player2, reportStaffQuality.assistantExists, reportStaffQuality.assistantAvg) },
      fitnessCoach: { hasCoach: reportStaffQuality.fitnessExists, quality: reportStaffQuality.fitnessAvg, ...buildFitnessProgressReport(player2, reportStaffQuality.fitnessExists, reportStaffQuality.fitnessAvg) },
      goalkeeperCoach: { hasCoach: reportStaffQuality.goalkeeperExists, quality: reportStaffQuality.goalkeeperAvg, ...buildGoalkeeperProgressReport(player2, reportStaffQuality.goalkeeperExists, reportStaffQuality.goalkeeperAvg) }
    }
  };
};

// tests/AssistantPlayerReportTests.ts
var attributes = {
  pace: 67,
  strength: 55,
  stamina: 62,
  defending: 50,
  passing: 66,
  attacking: 63,
  finishing: 58,
  technique: 68,
  vision: 70,
  dribbling: 64,
  heading: 48,
  positioning: 60,
  goalkeeping: 8,
  freeKicks: 57,
  talent: 88,
  penalties: 55,
  corners: 61,
  aggression: 78,
  crossing: 62,
  leadership: 58,
  mentality: 69,
  workRate: 73
};
var makePlayer = (overrides = {}) => ({
  id: "ASSISTANT_REPORT_PLAYER",
  firstName: "Jan",
  lastName: "Raportowy",
  age: 20,
  clubId: "CLUB_A",
  nationality: "POL",
  position: "MID" /* MID */,
  overallRating: 63,
  attributes: { ...attributes },
  stats: {
    goals: 2,
    assists: 3,
    yellowCards: 2,
    redCards: 1,
    cleanSheets: 0,
    matchesPlayed: 6,
    minutesPlayed: 360,
    seasonalChanges: { passing: 1, stamina: -1 },
    ratingHistory: [6, 6.2, 6.3, 6.4, 6.5, 6.9, 7, 7.2, 7.4, 7.6]
  },
  health: { status: "HEALTHY" /* HEALTHY */ },
  condition: 82,
  suspensionMatches: 0,
  contractEndDate: "2030-06-30",
  annualSalary: 1e5,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 18,
  morale: 68,
  moralePersonality: "PROFESSIONAL",
  clubAdaptation: {
    clubId: "CLUB_A",
    startedAt: "2026-07-01",
    lastUpdatedAt: "2026-08-20",
    durationDays: 120,
    initialLevel: 30,
    level: 64
  },
  playerMindset: {
    coachTrust: 72,
    clubHappiness: 67,
    squadBelonging: 61,
    roleClarity: 66,
    playingTimeSatisfaction: 58,
    developmentSatisfaction: 73,
    transferOpenness: 32,
    conflictLevel: 8
  },
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  ...overrides
});
var player = makePlayer();
var strongerPeer = makePlayer({
  id: "STRONGER_PEER",
  age: 27,
  overallRating: 78,
  attributes: { ...attributes, talent: 72, passing: 81, technique: 80, vision: 80 }
});
var staffBase = {
  assistantExists: true,
  fitnessExists: true,
  goalkeeperExists: true
};
var eliteReport = generatePlayerReport(
  player,
  [player, strongerPeer],
  [player, strongerPeer],
  { ...staffBase, assistantAvg: 20, fitnessAvg: 20, goalkeeperAvg: 20 },
  { activeTrainingName: "Gra kombinacyjna", intensity: TrainingIntensity.MEDIUM }
);
var repeatedEliteReport = generatePlayerReport(
  player,
  [player, strongerPeer],
  [player, strongerPeer],
  { ...staffBase, assistantAvg: 20, fitnessAvg: 20, goalkeeperAvg: 20 },
  { activeTrainingName: "Gra kombinacyjna", intensity: TrainingIntensity.MEDIUM }
);
var weakReport = generatePlayerReport(
  player,
  [player, strongerPeer],
  [player, strongerPeer],
  { ...staffBase, assistantAvg: 1, fitnessAvg: 1, goalkeeperAvg: 1 }
);
import_strict.default.deepEqual(eliteReport, repeatedEliteReport, "raport powinien by\u0107 stabilny po ponownym otwarciu");
import_strict.default.equal(eliteReport.analysisMeta.assistantQuality, 100, "atrybut sztabu 20 powinien oznacza\u0107 jako\u015B\u0107 100%");
import_strict.default.equal(eliteReport.analysisMeta.uncertaintyPercent, 5, "najlepszy asystent nadal musi mie\u0107 minimum 5% RNG");
import_strict.default.ok(weakReport.analysisMeta.uncertaintyPercent > eliteReport.analysisMeta.uncertaintyPercent, "s\u0142abszy asystent powinien mie\u0107 wi\u0119kszy margines b\u0142\u0119du");
import_strict.default.equal(eliteReport.formAnalysis.trend, "ROSN\u0104CA");
import_strict.default.equal(eliteReport.formAnalysis.recentAverage?.toFixed(2), "7.22");
import_strict.default.equal(eliteReport.adaptationAnalysis.active, true);
import_strict.default.equal(eliteReport.adaptationAnalysis.adaptationLevel, 64);
import_strict.default.ok(eliteReport.matchBehavior.cardsPer90 > 0);
import_strict.default.ok(eliteReport.matchBehavior.assessment.includes("agresj\u0119"));
import_strict.default.ok(eliteReport.careerPlan.nextSteps.some((step) => step.includes("Gra kombinacyjna")));
import_strict.default.ok(eliteReport.careerPlan.decision === "WYPO\u017BYCZY\u0106" || eliteReport.careerPlan.decision === "ROZWIJA\u0106");
console.log("AssistantPlayerReportTests: OK");
