globalThis.window=globalThis.window||{addEventListener:()=>{}};globalThis.window.addEventListener=globalThis.window.addEventListener||(()=>{});globalThis.localStorage=globalThis.localStorage||{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};

// tests/RealSavePeriodicProfileTests.ts
var import_node_assert = require("node:assert");
var import_node_fs = require("node:fs");
var import_node_perf_hooks = require("node:perf_hooks");
var import_node_zlib = require("node:zlib");

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

// services/TrainingProgramRules.ts
var SPECIALIST_TRAINING_CYCLE_IDS = /* @__PURE__ */ new Set([
  "T_FINISHING",
  "T_MODERN_GK"
]);
var isTeamTrainingCycleId = (cycleId) => !!cycleId && !SPECIALIST_TRAINING_CYCLE_IDS.has(cycleId);
var getTeamTrainingCycles = () => TRAINING_CYCLES.filter((cycle) => isTeamTrainingCycleId(cycle.id));
var findTeamTrainingCycle = (cycleId) => TRAINING_CYCLES.find((cycle) => cycle.id === cycleId && isTeamTrainingCycleId(cycle.id)) ?? null;
var getDefaultTeamTrainingCycle = () => getTeamTrainingCycles()[0] ?? TRAINING_CYCLES[0];

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
  getSeasonalGrowthCap(player, environment = {}) {
    const talent = player.attributes.talent ?? 50;
    const rep = normalizeClubReputation(environment.clubReputation);
    const coach = normalizeCoachQuality(environment.coachQuality);
    const reserveMatches = player.reserveStats?.matches ?? 0;
    const minutes = (player.stats?.minutesPlayed ?? 0) + reserveMatches * 90;
    const ratingHistory = player.stats?.ratingHistory ?? [];
    const reserveAverageRating = reserveMatches > 0 ? (player.reserveStats?.totalRatingPoints ?? 0) / reserveMatches : null;
    const averageRating = environment.averageRating ?? (ratingHistory.length > 0 ? ratingHistory.reduce((sum, rating) => sum + rating, 0) / ratingHistory.length : reserveAverageRating);
    let score = 0;
    if (player.age <= 19) score += 0.32;
    else if (player.age <= 21) score += 0.25;
    else if (player.age <= 23) score += 0.16;
    else if (player.age <= 26) score += 0.06;
    else if (player.age >= 33) score -= 0.42;
    else if (player.age >= 30) score -= 0.24;
    else if (player.age >= 28) score -= 0.1;
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
    else if (minutes < 360 && player.age >= 22) score -= 0.12;
    if (averageRating !== null) {
      if (averageRating >= 7.45) score += 0.14;
      else if (averageRating >= 7.05) score += 0.07;
      else if (averageRating < 6.25) score -= 0.12;
    }
    const destiny = stableUnit(`${player.id}_${player.age}_season_destiny`);
    if (destiny >= 0.94) score += 0.18;
    else if (destiny <= 0.06) score -= 0.18;
    if (score >= 0.82) return 2;
    if (score >= 0.08) return 1;
    return 0;
  },
  canGrowThisSeason(player, seasonalChanges, environment = {}) {
    const used = PlayerDevelopmentService.getSeasonalGrowthUsed(
      seasonalChanges,
      player.stats?.seasonalGrowthPoints
    );
    return used < PlayerDevelopmentService.getSeasonalGrowthCap(player, environment);
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
var clamp2 = (value, min, max) => Math.max(min, Math.min(max, value));
var average2 = (values) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};
var averageAttribute = (players, attr) => average2(players.map((player) => player.attributes[attr] ?? 0));
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
  const outfieldPlayers = players.filter((player) => player.position !== "GK" /* GK */);
  const defenders = players.filter((player) => player.position === "DEF" /* DEF */);
  const midfielders = players.filter((player) => player.position === "MID" /* MID */);
  const forwards = players.filter((player) => player.position === "FWD" /* FWD */);
  const avgAge = average2(players.map((player) => player.age));
  const avgCondition = average2(players.map((player) => player.condition));
  const baseNeed = average2(cycle.primaryAttributes.map((attr) => clamp2(82 - averageAttribute(players, attr), 0, 35))) * 1.7 + average2(cycle.secondaryAttributes.map((attr) => clamp2(80 - averageAttribute(players, attr), 0, 25))) * 1.1;
  let score = 12 + baseNeed;
  switch (cycle.id) {
    case "T_TACTICAL_PERIOD":
      score += average2([
        clamp2(82 - averageAttribute(outfieldPlayers, "vision"), 0, 28),
        clamp2(82 - averageAttribute(outfieldPlayers, "positioning"), 0, 28),
        clamp2(80 - averageAttribute(outfieldPlayers, "passing"), 0, 24)
      ]);
      break;
    case "T_GEGENPRESSING":
      score += average2([
        clamp2(82 - averageAttribute(outfieldPlayers, "stamina"), 0, 32),
        clamp2(82 - averageAttribute(outfieldPlayers, "workRate"), 0, 30),
        clamp2(82 - averageAttribute(outfieldPlayers, "pace"), 0, 28),
        clamp2(80 - averageAttribute(outfieldPlayers, "aggression"), 0, 24)
      ]);
      score -= Math.max(0, 78 - avgCondition) * 0.8;
      score -= Math.max(0, avgAge - 29) * 4;
      break;
    case "T_TIKI_TAKA":
      score += average2([
        clamp2(84 - averageAttribute(outfieldPlayers, "passing"), 0, 34),
        clamp2(84 - averageAttribute(outfieldPlayers, "technique"), 0, 30),
        clamp2(82 - averageAttribute(outfieldPlayers, "vision"), 0, 28),
        clamp2(80 - averageAttribute(outfieldPlayers, "dribbling"), 0, 24)
      ]);
      score += midfielders.length * 0.9;
      break;
    case "T_CATENACCIO":
      score += average2([
        clamp2(84 - averageAttribute(defenders, "defending"), 0, 34),
        clamp2(82 - averageAttribute(defenders, "positioning"), 0, 28),
        clamp2(82 - averageAttribute(defenders, "strength"), 0, 28),
        clamp2(80 - averageAttribute(defenders, "heading"), 0, 22)
      ]);
      score += defenders.length * 1.1;
      break;
    case "T_FINISHING":
      score += average2([
        clamp2(84 - averageAttribute(forwards, "finishing"), 0, 34),
        clamp2(82 - averageAttribute(forwards, "attacking"), 0, 28),
        clamp2(80 - averageAttribute(forwards, "technique"), 0, 22)
      ]);
      score += forwards.length * 1.2;
      break;
    case "T_SAQ":
      score += average2([
        clamp2(84 - averageAttribute(outfieldPlayers, "pace"), 0, 34),
        clamp2(82 - averageAttribute(outfieldPlayers, "dribbling"), 0, 28),
        clamp2(80 - averageAttribute(outfieldPlayers, "stamina"), 0, 22)
      ]);
      score -= Math.max(0, 76 - avgCondition) * 0.6;
      break;
    case "T_AIR_DOM":
      score += average2([
        clamp2(84 - averageAttribute(defenders.concat(forwards), "heading"), 0, 34),
        clamp2(82 - averageAttribute(players, "strength"), 0, 28),
        clamp2(80 - averageAttribute(defenders, "defending"), 0, 24)
      ]);
      break;
    case "T_SET_PIECES":
      score += average2([
        clamp2(82 - averageAttribute(players, "freeKicks"), 0, 26),
        clamp2(82 - averageAttribute(players, "corners"), 0, 26),
        clamp2(80 - averageAttribute(players, "penalties"), 0, 20),
        clamp2(80 - averageAttribute(players, "passing"), 0, 20)
      ]);
      score -= 4;
      break;
    case "T_RECOVERY_YOGA":
      score += Math.max(0, 82 - avgCondition) * 2.2;
      score += Math.max(0, avgAge - 28) * 2.5;
      break;
    case "T_HIGH_PRESS":
      score += average2([
        clamp2(84 - averageAttribute(outfieldPlayers, "workRate"), 0, 34),
        clamp2(82 - averageAttribute(outfieldPlayers, "aggression"), 0, 28),
        clamp2(82 - averageAttribute(outfieldPlayers, "stamina"), 0, 28),
        clamp2(80 - averageAttribute(outfieldPlayers, "defending"), 0, 22)
      ]);
      score -= Math.max(0, 78 - avgCondition) * 0.7;
      score -= Math.max(0, avgAge - 30) * 4.5;
      break;
    case "T_COUNTER_ATTACK":
      score += average2([
        clamp2(84 - averageAttribute(players, "pace"), 0, 34),
        clamp2(82 - averageAttribute(forwards.concat(midfielders), "attacking"), 0, 28),
        clamp2(82 - averageAttribute(forwards, "finishing"), 0, 28),
        clamp2(80 - averageAttribute(outfieldPlayers, "workRate"), 0, 20)
      ]);
      score += forwards.length * 1.1;
      break;
    default:
      break;
  }
  score *= 0.88 + rng() * 0.24;
  return Math.max(1, score);
};
var chooseCycle = (players, rng) => {
  const cycleCandidates = getTeamTrainingCycles();
  const scored = cycleCandidates.map((cycle) => ({ cycle, score: getCycleScore(cycle, players, rng) })).sort((left, right) => right.score - left.score).slice(0, 4);
  return weightedPick(
    scored.map((entry) => ({
      item: entry.cycle,
      weight: entry.score
    })),
    rng
  );
};
var chooseFocus = (player, cycle, rng, assistantIndividualWork = 10) => {
  const pool = POSITION_FOCUS_POOLS[player.position];
  const scored = pool.map((attr) => {
    const attrValue = player.attributes[attr] ?? 0;
    const weakness = clamp2(82 - attrValue, 0, 38) * 1.35;
    const teamSync = cycle.primaryAttributes.includes(attr) ? 14 : cycle.secondaryAttributes.includes(attr) ? 8 : 0;
    const roleBonus = ROLE_BONUS[player.position][attr] ?? 0;
    const ageAdjustment = player.age >= 32 && ["pace", "stamina", "workRate"].includes(attr) ? -3 : 0;
    const elitePenalty = attrValue >= 88 ? 8 : attrValue >= 82 ? 4 : 0;
    const jitterMultiplier = assistantIndividualWork <= 7 ? 2.5 : assistantIndividualWork >= 15 ? 0.4 : 1;
    const jitter = rng() * 6 * jitterMultiplier;
    return {
      attr,
      score: Math.max(1, 8 + weakness + teamSync + roleBonus + ageAdjustment + jitter - elitePenalty)
    };
  }).sort((left, right) => right.score - left.score).slice(0, 4);
  return weightedPick(
    scored.map((entry) => ({
      item: entry.attr,
      weight: entry.score
    })),
    rng
  );
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
var POS_LABEL = {
  ["GK" /* GK */]: "bramkarz",
  ["DEF" /* DEF */]: "defensor",
  ["MID" /* MID */]: "pomocnik",
  ["FWD" /* FWD */]: "napastnik"
};
var POSITION_ALLOWED_CYCLES = {
  ["GK" /* GK */]: /* @__PURE__ */ new Set(["T_TACTICAL_PERIOD", "T_RECOVERY_YOGA", "T_SET_PIECES"]),
  ["DEF" /* DEF */]: /* @__PURE__ */ new Set(["T_CATENACCIO", "T_TACTICAL_PERIOD", "T_AIR_DOM", "T_RECOVERY_YOGA", "T_HIGH_PRESS", "T_GEGENPRESSING", "T_COUNTER_ATTACK"]),
  ["MID" /* MID */]: /* @__PURE__ */ new Set(["T_TIKI_TAKA", "T_TACTICAL_PERIOD", "T_GEGENPRESSING", "T_HIGH_PRESS", "T_COUNTER_ATTACK", "T_SAQ", "T_SET_PIECES"]),
  ["FWD" /* FWD */]: /* @__PURE__ */ new Set(["T_FINISHING", "T_COUNTER_ATTACK", "T_SAQ", "T_GEGENPRESSING", "T_HIGH_PRESS", "T_TIKI_TAKA"])
};
var TrainingAssistantService = {
  buildPlan(players, rng = Math.random, assistantIndividualWork = 10) {
    const cycle = chooseCycle(players, rng);
    const playerFocuses = players.reduce((acc, player) => {
      acc[player.id] = chooseFocus(player, cycle, rng, assistantIndividualWork);
      return acc;
    }, {});
    return {
      cycleId: cycle.id,
      playerFocuses
    };
  }
};

// services/PlayerAttributesGenerator.ts
var TIER_CONFIG = {
  1: { minBase: 58, maxBase: 71, hardCap: 77 },
  2: { minBase: 50, maxBase: 64, hardCap: 71 },
  3: { minBase: 42, maxBase: 56, hardCap: 66 },
  4: { minBase: 30, maxBase: 48, hardCap: 56 }
};
var EUROPEAN_TIER_CONFIG = {
  1: { minBase: 80, maxBase: 92, hardCap: 99 },
  2: { minBase: 60, maxBase: 76, hardCap: 87 },
  3: { minBase: 50, maxBase: 66, hardCap: 77 },
  4: { minBase: 38, maxBase: 54, hardCap: 67 },
  5: { minBase: 28, maxBase: 44, hardCap: 57 }
};
var POLISH_GK_ATTRIBUTE_CAPS = {
  goalkeeping: 87,
  defending: 87,
  positioning: 90,
  mentality: 90,
  talent: 99
};
var capInitialGoalkeeperAttributes = (attributes, position, isEuropean = false) => {
  if (position !== "GK" /* GK */ || isEuropean) return attributes;
  const capped = { ...attributes };
  Object.keys(capped).forEach((key) => {
    const cap = POLISH_GK_ATTRIBUTE_CAPS[key];
    if (cap !== void 0) {
      capped[key] = Math.max(1, Math.min(cap, capped[key]));
    }
  });
  return capped;
};
var REGION_PROFILE = {
  // Elite
  ["SPAIN" /* SPAIN */]: { baseOffset: 0, starChance: 0.1 },
  ["FRANCE" /* FRANCE */]: { baseOffset: 0, starChance: 0.1 },
  ["ENGLAND" /* ENGLAND */]: { baseOffset: 0, starChance: 0.1 },
  ["GERMANY" /* GERMANY */]: { baseOffset: 0, starChance: 0.1 },
  ["ITALY" /* ITALY */]: { baseOffset: 0, starChance: 0.1 },
  ["BRAZIL" /* BRAZIL */]: { baseOffset: 0, starChance: 0.1 },
  ["ARGENTINA" /* ARGENTINA */]: { baseOffset: 0, starChance: 0.1 },
  // Wysoki
  ["IBERIA" /* IBERIA */]: { baseOffset: -2, starChance: 0.06 },
  ["MEXICO" /* MEXICO */]: { baseOffset: -2, starChance: 0.06 },
  ["SWEDEN" /* SWEDEN */]: { baseOffset: -4, starChance: 0.04 },
  ["BENELUX" /* BENELUX */]: { baseOffset: 0, starChance: 0.1 },
  // Dobry
  ["SCANDINAVIA" /* SCANDINAVIA */]: { baseOffset: -4, starChance: 0.04 },
  ["CZ_SK" /* CZ_SK */]: { baseOffset: -4, starChance: 0.04 },
  ["SSA" /* SSA */]: { baseOffset: -4, starChance: 0.04 },
  ["KOREA" /* KOREA */]: { baseOffset: -4, starChance: 0.04 },
  ["NORTH_AMERICA" /* NORTH_AMERICA */]: { baseOffset: -5, starChance: 0.03 },
  // Średnio
  ["POLAND" /* POLAND */]: { baseOffset: -6, starChance: 0.03 },
  ["BALKANS" /* BALKANS */]: { baseOffset: -6, starChance: 0.03 },
  ["EX_USSR" /* EX_USSR */]: { baseOffset: -6, starChance: 0.03 },
  ["TURKEY" /* TURKEY */]: { baseOffset: -6, starChance: 0.03 },
  ["JAPAN" /* JAPAN */]: { baseOffset: -6, starChance: 0.03 },
  ["OCEANIA" /* OCEANIA */]: { baseOffset: -8, starChance: 0.02 },
  // Poniżej Średnio
  ["GREEK" /* GREEK */]: { baseOffset: -8, starChance: 0.02 },
  ["ROMANIA" /* ROMANIA */]: { baseOffset: -8, starChance: 0.02 },
  ["HUNGARIAN" /* HUNGARIAN */]: { baseOffset: -8, starChance: 0.02 },
  ["ISRAELI" /* ISRAELI */]: { baseOffset: -8, starChance: 0.02 },
  ["FINLAND" /* FINLAND */]: { baseOffset: -8, starChance: 0.02 },
  // Niski
  ["ARABIA" /* ARABIA */]: { baseOffset: -10, starChance: 0.015 },
  ["GEORGIA" /* GEORGIA */]: { baseOffset: -10, starChance: 0.015 },
  ["ALBANIA" /* ALBANIA */]: { baseOffset: -10, starChance: 0.015 },
  ["ARMENIA" /* ARMENIA */]: { baseOffset: -10, starChance: 0.015 },
  ["BALTIC" /* BALTIC */]: { baseOffset: -10, starChance: 0.015 },
  // Bardzo niski
  ["AZERBAIJANI" /* AZERBAIJANI */]: { baseOffset: -13, starChance: 0.01 },
  ["KAZAKH" /* KAZAKH */]: { baseOffset: -13, starChance: 0.01 },
  // Dno
  ["MALTESE" /* MALTESE */]: { baseOffset: -16, starChance: 5e-3 }
};
var PROFILES = {
  ["GK" /* GK */]: {
    goalkeeping: 1,
    positioning: 0.8,
    strength: 0.7,
    passing: 0.4,
    pace: 0.3,
    finishing: 0.1,
    attacking: 0.1,
    defending: 0.2,
    freeKicks: 0.1,
    talent: 0.5,
    penalties: 0.4,
    corners: 0.1,
    aggression: 0.5,
    crossing: 0.1,
    leadership: 0.5,
    mentality: 0.8,
    workRate: 0.7
  },
  ["DEF" /* DEF */]: {
    defending: 1,
    strength: 0.9,
    stamina: 0.8,
    positioning: 0.8,
    heading: 0.8,
    pace: 0.6,
    passing: 0.5,
    technique: 0.4,
    vision: 0.3,
    finishing: 0.15,
    attacking: 0.1,
    goalkeeping: 0.05,
    freeKicks: 0.45,
    talent: 0.5,
    penalties: 0.4,
    corners: 0.3,
    aggression: 0.8,
    crossing: 0.4,
    leadership: 0.6,
    mentality: 0.7,
    workRate: 0.8
  },
  ["MID" /* MID */]: {
    passing: 1,
    vision: 0.9,
    technique: 0.9,
    stamina: 0.9,
    dribbling: 0.8,
    positioning: 0.7,
    attacking: 0.7,
    pace: 0.6,
    defending: 0.5,
    finishing: 0.5,
    goalkeeping: 0.05,
    freeKicks: 0.7,
    talent: 0.7,
    penalties: 0.5,
    corners: 0.7,
    aggression: 0.6,
    crossing: 0.8,
    leadership: 0.7,
    mentality: 0.8,
    workRate: 0.9
  },
  ["FWD" /* FWD */]: {
    finishing: 1,
    attacking: 0.9,
    pace: 0.9,
    dribbling: 0.8,
    heading: 0.7,
    technique: 0.7,
    positioning: 0.8,
    stamina: 0.6,
    strength: 0.6,
    passing: 0.5,
    defending: 0.2,
    goalkeeping: 0.05,
    freeKicks: 0.6,
    talent: 0.8,
    penalties: 0.8,
    corners: 0.4,
    aggression: 0.7,
    crossing: 0.4,
    leadership: 0.5,
    mentality: 0.7,
    workRate: 0.7
  }
};
var OVR_WEIGHTS = {
  ["GK" /* GK */]: {
    goalkeeping: 0.5,
    positioning: 0.15,
    mentality: 0.15,
    strength: 0.15,
    passing: 0.04,
    workRate: 0.06,
    leadership: 5e-3,
    aggression: 0.02,
    pace: 0.04,
    stamina: 0.04,
    talent: 0.11,
    penalties: 1e-3,
    technique: 0.02,
    vision: 0.02,
    defending: 0.2
  },
  ["DEF" /* DEF */]: {
    defending: 0.5,
    positioning: 0.22,
    strength: 0.2,
    heading: 0.2,
    stamina: 0.2,
    workRate: 0.07,
    mentality: 0.11,
    aggression: 0.12,
    pace: 0.12,
    passing: 0.05,
    leadership: 1e-3,
    technique: 0.02,
    crossing: 0.01,
    vision: 0.01,
    freeKicks: 5e-3,
    talent: 0.02,
    corners: 1e-3,
    penalties: 1e-3,
    dribbling: 5e-3,
    attacking: 2e-3
  },
  ["MID" /* MID */]: {
    passing: 0.5,
    vision: 0.11,
    technique: 0.3,
    stamina: 0.09,
    dribbling: 0.2,
    mentality: 0.07,
    workRate: 0.07,
    attacking: 0.15,
    positioning: 0.05,
    crossing: 0.15,
    pace: 0.2,
    freeKicks: 0.15,
    corners: 0.15,
    leadership: 0.01,
    defending: 0.01,
    finishing: 0.05,
    talent: 0.02,
    strength: 0.01,
    heading: 0.01,
    aggression: 0.01,
    penalties: 0.01
  },
  ["FWD" /* FWD */]: {
    finishing: 0.3,
    attacking: 0.3,
    pace: 0.2,
    positioning: 0.1,
    mentality: 0.1,
    dribbling: 0.12,
    heading: 0.1,
    technique: 0.1,
    strength: 0.05,
    stamina: 0.04,
    workRate: 0.04,
    talent: 0.03,
    penalties: 0.07,
    freeKicks: 0.01,
    passing: 0.01,
    crossing: 2e-3,
    aggression: 2e-3,
    leadership: 2e-3,
    corners: 1e-3
  }
};
var PlayerAttributesGenerator = {
  capInitialGoalkeeperAttributes,
  generateAttributes: (position, leagueTier, clubReputation, age, isEuropean = false, talentConfig, regionProfile) => {
    const configTable = isEuropean ? EUROPEAN_TIER_CONFIG : TIER_CONFIG;
    const config = talentConfig ?? (configTable[leagueTier] || configTable[4]);
    const repBonus = Math.min(5, Math.max(0, clubReputation - 2));
    const tierBase = config.minBase + Math.random() * (config.maxBase - config.minBase) + repBonus + (regionProfile?.baseOffset ?? 0);
    const profile = PROFILES[position];
    const generated = {};
    const isDefFreeKickSpecialist = position === "DEF" /* DEF */ && Math.random() < 0.1;
    const isDefPenaltySpecialist = position === "DEF" /* DEF */ && Math.random() < 0.05;
    const allKeys = [
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
    allKeys.forEach((key) => {
      if (["pace", "strength", "stamina"].includes(key)) {
        let val = 45 + Math.floor(Math.random() * 55);
        const weight2 = profile[key] || 0.5;
        if (weight2 >= 0.8) val += 5;
        if (weight2 <= 0.3) val -= 10;
        if (age >= 35) val = Math.min(val, 80);
        else if (age > 33) val = Math.min(val, 87);
        else if (age > 30) val = Math.min(val, 91);
        const physicalCap = 99;
        generated[key] = Math.max(45, Math.min(physicalCap, val));
        return;
      }
      if (position === "GK" /* GK */ && ["dribbling", "heading", "attacking", "finishing"].includes(key)) {
        generated[key] = Math.floor(Math.random() * 32) + 1;
        return;
      }
      if (position === "GK" /* GK */ && key === "penalties") {
        generated[key] = Math.floor(Math.random() * 35) + 1;
        return;
      }
      if (key === "goalkeeping" && position !== "GK" /* GK */) {
        generated[key] = Math.floor(Math.random() * 15) + 1;
        return;
      }
      if (position === "DEF" /* DEF */ && key === "freeKicks" && isDefFreeKickSpecialist) {
        generated[key] = Math.floor(60 + Math.random() * 26);
        return;
      }
      if (position === "DEF" /* DEF */ && key === "penalties" && isDefPenaltySpecialist) {
        generated[key] = Math.floor(55 + Math.random() * 31);
        return;
      }
      const weight = profile[key] !== void 0 ? profile[key] : 0.5;
      let value = tierBase;
      if (weight >= 0.8) {
        value += Math.random() * 12;
      } else if (weight >= 0.5) {
        value += Math.random() * 8 - 4;
      } else if (weight >= 0.35) {
        value -= Math.random() * 15 + 5;
      } else {
        const multiplier = 0.4 + weight * 0.5;
        value = tierBase * multiplier + (Math.random() * 10 - 5);
      }
      const baseAttrCap = position === "DEF" /* DEF */ && (key === "freeKicks" || key === "penalties") ? 85 : config.hardCap;
      const attrCap = position === "GK" /* GK */ && !isEuropean ? POLISH_GK_ATTRIBUTE_CAPS[key] ?? baseAttrCap : baseAttrCap;
      value = Math.max(1, Math.min(Math.floor(value), attrCap));
      if (Math.random() < (regionProfile?.starChance ?? 0.04)) {
        value = Math.min(attrCap, value + Math.floor(Math.random() * 12) + 3);
      }
      generated[key] = value;
    });
    const finalAttributes = capInitialGoalkeeperAttributes(generated, position, isEuropean);
    const overall = PlayerAttributesGenerator.calculateOverall(finalAttributes, position);
    return { attributes: finalAttributes, overall };
  },
  calculateOverall: (attrs, position) => {
    const weights = OVR_WEIGHTS[position];
    let weightedSum = 0;
    let totalWeight = 0;
    Object.entries(weights).forEach(([key, w]) => {
      const k = key;
      const weightVal = w || 0;
      weightedSum += attrs[k] * weightVal;
      totalWeight += weightVal;
    });
    if (totalWeight === 0) return 50;
    return Math.round(weightedSum / totalWeight);
  }
};

// services/ManagerNegotiationInfluenceService.ts
var clamp3 = (value, min, max) => Math.min(max, Math.max(min, value));
var getExperience = (managerProfile) => {
  if (!managerProfile || !Number.isFinite(managerProfile.experience)) return 50;
  return clamp3(managerProfile.experience, 1, 99);
};
var ManagerNegotiationInfluenceService = {
  calculate(managerProfile) {
    const experience = getExperience(managerProfile);
    const normalized = clamp3((experience - 50) / 49, -1, 1);
    return {
      experience,
      normalized,
      scoreAdjustment: Math.round(normalized * 8),
      chanceAdjustment: normalized * 0.06,
      expectationMultiplier: clamp3(1 - normalized * 0.045, 0.955, 1.045),
      realisticCeilingBonus: normalized * 3.5
    };
  }
};

// services/FinanceService.ts
var MATCHDAY_ADDITIONAL_REVENUE_PARAMS = {
  //                             tier: [  0,    1,    2,    3,    4 ]
  cateringPerFan: [0, 4.5, 2, 0.8, 0.5],
  merchandisingPerFan: [0, 2, 0.8, 0.22, 0.15],
  programsPerFan: [0, 0.6, 0.3, 0.15, 0.07],
  parkingPerFan: [0, 0.7, 0.4, 0.16, 0.1]
};
var VIP_BOX_REVENUE_PARAMS = {
  base: 15e4,
  repScale: 2e5,
  // * (rep / 10)
  capacityScale: 6e4,
  // * (capacity / 40 000)
  minRevenue: 24e4,
  maxRevenue: 5e5
};
var MATCHDAY_COST_PARAMS = {
  home: {
    //                       tier: [  0,       1,       2,      3,     4  ]
    baseCost: [0, 5e4, 15e3, 5e3, 1500],
    perFanCost: [0, 9, 4.5, 2, 0.8],
    // PLN za kibica
    repScale: [0, 12e3, 4e3, 1200, 400],
    // PLN * reputacja
    minFloor: [0, 2e5, 4e4, 1e4, 3500],
    // minim. koszt meczu u siebie
    maxCap: [0, 7e5, 22e4, 7e4, 2e4]
    // maks. koszt meczu u siebie
  },
  away: {
    baseCost: [0, 35e3, 12e3, 5e3, 1500],
    // koszty bazy wyjazdu
    repScale: [0, 3500, 1500, 600, 150],
    // wkład reputacji w koszty
    maxCap: [0, 14e4, 55e3, 2e4, 7e3]
    // maks. koszt wyjazdu
  }
};
var EUR_TO_PLN_NBP_2026 = 4.271;
var eurMillionsToPln = (amount) => Math.round(amount * EUR_TO_PLN_NBP_2026 * 1e6);
var EUROPEAN_TIER_BASE_REVENUE_EUR_M = {
  1: 190,
  2: 90,
  3: 50,
  4: 8
};
var EUROPEAN_COUNTRY_FINANCE_FACTOR = {
  ENG: 2.4,
  ESP: 1.7,
  GER: 1.8,
  ITA: 1.45,
  FRA: 1.15,
  POR: 1,
  NED: 0.95,
  BEL: 0.75,
  SCO: 0.7,
  TUR: 0.8,
  AUT: 0.55,
  SUI: 0.6,
  CZE: 0.45,
  DEN: 0.45,
  GRE: 0.45,
  NOR: 0.35,
  CRO: 0.3,
  SRB: 0.3,
  UKR: 0.3,
  RUS: 0.45,
  SWE: 0.3,
  ISR: 0.28,
  CYP: 0.25,
  HUN: 0.2,
  AZE: 0.2,
  KAZ: 0.2,
  SVK: 0.18,
  SVN: 0.18,
  BUL: 0.18,
  BIH: 0.14,
  MNE: 0.12,
  MKD: 0.1,
  ALB: 0.1,
  ARM: 0.09,
  GEO: 0.09,
  BLR: 0.09,
  KOS: 0.09,
  MDA: 0.08,
  FIN: 0.14,
  LTU: 0.08,
  LAT: 0.08,
  EST: 0.08,
  IRL: 0.1,
  NIR: 0.08,
  WAL: 0.06,
  ISL: 0.08,
  FRO: 0.06,
  AND: 0.04,
  GIB: 0.05,
  LIE: 0.04,
  SMR: 0.04,
  MLT: 0.06,
  LUX: 0.07
};
var EUROPEAN_CLUB_REVENUE_OVERRIDE_PLN = {
  "Real Madryt": eurMillionsToPln(1161),
  "FC Barcelona": eurMillionsToPln(893),
  "Bayern Monachium": eurMillionsToPln(860.6),
  "Paris Saint-Germain": eurMillionsToPln(837),
  "Liverpool FC": eurMillionsToPln(836.1),
  "Manchester City": eurMillionsToPln(829.3),
  "Arsenal Londyn": eurMillionsToPln(821.7),
  "Manchester United": eurMillionsToPln(793.1),
  "Tottenham Hotspur": eurMillionsToPln(672.6),
  "Chelsea Londyn": eurMillionsToPln(584.1),
  "Borussia Dortmund": eurMillionsToPln(531.3),
  "Inter Mediolan": eurMillionsToPln(537.5),
  "Atl\xE9tico Madryt": eurMillionsToPln(454.5),
  "Milan AC": eurMillionsToPln(410.4),
  "Juventus Turyn": eurMillionsToPln(401.7),
  "Newcastle United": eurMillionsToPln(398.4),
  "Benfica Lizbona": eurMillionsToPln(283.4)
};
var EUROPEAN_COMMERCIAL_LEAGUES = /* @__PURE__ */ new Set(["L_CL", "L_EL", "L_CONF"]);
var isEuropeanCommercialClub = (club) => EUROPEAN_COMMERCIAL_LEAGUES.has(club.leagueId);
var clamp4 = (value, min, max) => Math.max(min, Math.min(max, value));
var POLISH_MARKET_CAP_BY_TIER = {
  1: 21e6,
  2: 65e5,
  3: 18e5,
  4: 35e4,
  5: 175e3
};
var getPolishAgeMarketCap = (player, tier) => {
  const tierScale = {
    1: 1,
    2: 0.34,
    3: 0.11,
    4: 0.035,
    5: 0.018
  }[tier] ?? 0.018;
  let ekstraklasaCap = 0;
  switch (player.position) {
    case "GK" /* GK */:
      if (player.age <= 23) ekstraklasaCap = 8e6;
      else if (player.age <= 29) ekstraklasaCap = 11e6;
      else if (player.age <= 32) ekstraklasaCap = 65e5;
      else if (player.age <= 34) ekstraklasaCap = 38e5;
      else ekstraklasaCap = 22e5;
      break;
    case "DEF" /* DEF */:
      if (player.age <= 21) ekstraklasaCap = 1e7;
      else if (player.age <= 24) ekstraklasaCap = 13e6;
      else if (player.age <= 29) ekstraklasaCap = 11e6;
      else if (player.age <= 32) ekstraklasaCap = 65e5;
      else if (player.age <= 34) ekstraklasaCap = 38e5;
      else ekstraklasaCap = 22e5;
      break;
    default:
      if (player.age <= 21) ekstraklasaCap = 16e6;
      else if (player.age <= 24) ekstraklasaCap = 18e6;
      else if (player.age <= 29) ekstraklasaCap = 14e6;
      else if (player.age <= 32) ekstraklasaCap = 55e5;
      else if (player.age <= 34) ekstraklasaCap = 28e5;
      else ekstraklasaCap = 17e5;
      break;
  }
  return ekstraklasaCap * tierScale;
};
var getRecentAverageRating = (player, sampleSize = 10) => {
  const history = player.stats?.ratingHistory?.slice(-sampleSize) ?? [];
  if (history.length === 0) return null;
  return history.reduce((sum, rating) => sum + rating, 0) / history.length;
};
var getCareerMatches = (player) => {
  const currentMatches = player.stats?.matchesPlayed || 0;
  const historicalMatches = (player.history || []).reduce(
    (sum, entry) => sum + (entry.statsSnapshot?.matchesPlayed || 0),
    0
  );
  return currentMatches + historicalMatches;
};
var getPolishBaseMarketValue = (ovr) => {
  if (ovr >= 82) return 125e5 + (ovr - 82) * 14e5;
  if (ovr >= 78) return 88e5 + (ovr - 78) * 9e5;
  if (ovr >= 74) return 58e5 + (ovr - 74) * 75e4;
  if (ovr >= 70) return 34e5 + (ovr - 70) * 6e5;
  if (ovr >= 65) return 17e5 + (ovr - 65) * 34e4;
  if (ovr >= 60) return 65e4 + (ovr - 60) * 21e4;
  return 1e5 + Math.max(0, ovr - 40) * 27500;
};
var getPolishAgeFactor = (player) => {
  switch (player.position) {
    case "DEF" /* DEF */:
      if (player.age <= 20) return 0.94;
      if (player.age <= 23) return 1;
      if (player.age <= 27) return 1.08;
      if (player.age <= 30) return 1.02;
      if (player.age === 31) return 0.92;
      if (player.age === 32) return 0.8;
      if (player.age === 33) return 0.68;
      if (player.age === 34) return 0.56;
      if (player.age === 35) return 0.46;
      if (player.age === 36) return 0.36;
      return 0.28;
    case "GK" /* GK */:
      if (player.age <= 21) return 0.96;
      if (player.age <= 25) return 1;
      if (player.age <= 30) return 1.06;
      if (player.age <= 32) return 1.02;
      if (player.age === 33) return 0.94;
      if (player.age === 34) return 0.84;
      if (player.age === 35) return 0.74;
      if (player.age === 36) return 0.62;
      if (player.age === 37) return 0.5;
      return 0.4;
    default:
      if (player.age <= 19) return 1.16;
      if (player.age <= 21) return 1.12;
      if (player.age <= 24) return 1.08;
      if (player.age <= 28) return 1;
      if (player.age === 29) return 0.94;
      if (player.age === 30) return 0.86;
      if (player.age === 31) return 0.74;
      if (player.age === 32) return 0.6;
      if (player.age === 33) return 0.48;
      if (player.age === 34) return 0.36;
      if (player.age === 35) return 0.27;
      if (player.age === 36) return 0.2;
      return 0.15;
  }
};
var getPolishExperienceFactor = (player) => {
  const careerMatches = getCareerMatches(player);
  switch (player.position) {
    case "DEF" /* DEF */:
      return 0.94 + clamp4(careerMatches / 260, 0, 1) * 0.2;
    case "GK" /* GK */:
      return 0.92 + clamp4(careerMatches / 240, 0, 1) * 0.24;
    default:
      return 0.94 + clamp4(careerMatches / 260, 0, 1) * 0.08;
  }
};
var getPolishVeteranUsageFactor = (player) => {
  const minutesPlayed = Math.max(0, player.stats?.minutesPlayed || 0);
  if (player.age <= 32) return 1;
  switch (player.position) {
    case "GK" /* GK */:
    case "DEF" /* DEF */:
      if (minutesPlayed >= 1800) return 1;
      if (minutesPlayed >= 900) return 0.9;
      if (minutesPlayed >= 450) return 0.78;
      return 0.64;
    default:
      if (minutesPlayed >= 1800) return 1;
      if (minutesPlayed >= 900) return 0.86;
      if (minutesPlayed >= 450) return 0.72;
      return 0.55;
  }
};
var getPolishPerformanceFactor = (player) => {
  const minutesPlayed = Math.max(0, player.stats?.minutesPlayed || 0);
  const matchesPlayed = Math.max(0, player.stats?.matchesPlayed || 0);
  const goals = Math.max(0, player.stats?.goals || 0);
  const assists = Math.max(0, player.stats?.assists || 0);
  const averageRating = getRecentAverageRating(player);
  const fullMatches = Math.max(1, minutesPlayed / 90);
  const sampleFactor = clamp4(minutesPlayed / 900, 0, 1);
  const ratingDelta = averageRating === null ? 0 : averageRating - 6.7;
  switch (player.position) {
    case "FWD" /* FWD */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const goalsBoost = clamp4(goals / 20, 0, 1) * 0.2 + clamp4(goalsPer90 / 0.75, 0, 1) * 0.18;
      const assistsBoost = clamp4(assists / 10, 0, 1) * 0.07 + clamp4(assistsPer90 / 0.35, 0, 1) * 0.05;
      const ratingBoost = clamp4(ratingDelta * 0.1, -0.08, 0.1);
      return 1 + clamp4(sampleFactor * (goalsBoost + assistsBoost + ratingBoost), -0.1, 0.52);
    }
    case "MID" /* MID */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const assistsBoost = clamp4(assists / 14, 0, 1) * 0.18 + clamp4(assistsPer90 / 0.45, 0, 1) * 0.15;
      const goalsBoost = clamp4(goals / 12, 0, 1) * 0.08 + clamp4(goalsPer90 / 0.35, 0, 1) * 0.06;
      const ratingBoost = clamp4(ratingDelta * 0.11, -0.08, 0.12);
      return 1 + clamp4(sampleFactor * (assistsBoost + goalsBoost + ratingBoost), -0.1, 0.46);
    }
    case "DEF" /* DEF */: {
      const matchFactor = clamp4(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp4(getCareerMatches(player) / 260, 0, 1) * 0.12;
      const ratingBoost = averageRating === null ? 0 : clamp4((averageRating - 6.6) * 0.18, -0.1, 0.22) * clamp4(matchesPlayed / 10, 0, 1);
      return 1 + clamp4(matchFactor + experienceBoost + ratingBoost, -0.1, 0.42);
    }
    case "GK" /* GK */: {
      const matchFactor = clamp4(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp4(getCareerMatches(player) / 240, 0, 1) * 0.14;
      const ratingBoost = averageRating === null ? 0 : clamp4((averageRating - 6.6) * 0.22, -0.1, 0.24) * clamp4(matchesPlayed / 8, 0, 1);
      return 1 + clamp4(matchFactor + experienceBoost + ratingBoost, -0.12, 0.46);
    }
    default:
      return 1;
  }
};
var calculatePolishMarketValue = (player, reputation, tier) => {
  const baseValue = getPolishBaseMarketValue(player.overallRating);
  const tierMultiplier = {
    1: 1,
    2: 0.38,
    3: 0.14,
    4: 0.05,
    5: 0.025
  }[tier] ?? 0.05;
  const reputationFactor = 0.88 + clamp4(reputation, 1, 10) * 0.025;
  const ageFactor = getPolishAgeFactor(player);
  const experienceFactor = getPolishExperienceFactor(player);
  const performanceFactor = getPolishPerformanceFactor(player);
  const veteranUsageFactor = getPolishVeteranUsageFactor(player);
  const randomFactor = 0.985 + Math.random() * 0.03;
  const tierCap = Math.min(
    POLISH_MARKET_CAP_BY_TIER[tier] ?? 175e3,
    getPolishAgeMarketCap(player, tier)
  );
  const rawValue = baseValue * tierMultiplier * reputationFactor * ageFactor * experienceFactor * performanceFactor * veteranUsageFactor * randomFactor;
  const cappedValue = Math.min(rawValue, tierCap);
  const step = cappedValue >= 1e7 ? 25e4 : cappedValue >= 1e6 ? 1e5 : cappedValue >= 1e5 ? 25e3 : 1e4;
  return Math.round(cappedValue / step) * step;
};
var getEuropeanCommercialIndex = (club) => {
  const countryFactorRaw = EUROPEAN_COUNTRY_FINANCE_FACTOR[club.country || ""] ?? 0.1;
  const countryFactor = 0.4 + Math.sqrt(Math.max(0.01, countryFactorRaw));
  const reputationFactor = 0.7 + Math.pow(Math.max(1, Math.min(20, club.reputation)) / 20, 1.2) * 0.9;
  const stadiumFactor = 0.78 + Math.pow(Math.max(2e3, Math.min(1e5, club.stadiumCapacity)) / 1e5, 0.8) * 0.42;
  const competitionFactor = club.leagueId === "L_CL" ? 1.12 : club.leagueId === "L_EL" ? 1 : 0.92;
  return clamp4(countryFactor * reputationFactor * stadiumFactor * competitionFactor / 1.45, 0.45, 2.6);
};
var INTERNATIONAL_DEFAULT_TIER_CAPS = {
  1: 9e7,
  2: 22e6,
  3: 6e6,
  4: 15e5,
  5: 5e5
};
var INTERNATIONAL_MARKET_PROFILE_BY_COUNTRY = {
  ENG: {
    marketFactor: 1.28,
    tierCaps: { 1: 22e7, 2: 7e7, 3: 18e6, 4: 4e6, 5: 12e5 }
  },
  ESP: {
    marketFactor: 1.18,
    tierCaps: { 1: 2e8, 2: 45e6, 3: 12e6, 4: 3e6, 5: 1e6 }
  },
  GER: {
    marketFactor: 1.08,
    tierCaps: { 1: 15e7, 2: 4e7, 3: 1e7, 4: 25e5, 5: 8e5 }
  },
  ITA: {
    marketFactor: 1,
    tierCaps: { 1: 11e7, 2: 28e6, 3: 8e6, 4: 2e6, 5: 7e5 }
  },
  FRA: {
    marketFactor: 0.97,
    tierCaps: { 1: 12e7, 2: 24e6, 3: 7e6, 4: 18e5, 5: 6e5 }
  },
  POR: {
    marketFactor: 0.78,
    tierCaps: { 1: 6e7, 2: 15e6, 3: 4e6, 4: 1e6, 5: 35e4 }
  },
  DEN: {
    marketFactor: 0.43,
    tierCaps: { 1: 22e6, 2: 1e7, 3: 35e5, 4: 1e6, 5: 325e3 }
  },
  NOR: {
    marketFactor: 0.3,
    tierCaps: { 1: 11e6, 2: 6e6, 3: 22e5, 4: 65e4, 5: 225e3 }
  },
  SWE: {
    marketFactor: 0.22,
    tierCaps: { 1: 65e5, 2: 35e5, 3: 13e5, 4: 4e5, 5: 15e4 }
  },
  FIN: {
    marketFactor: 0.07,
    tierCaps: { 1: 12e5, 2: 7e5, 3: 3e5, 4: 1e5, 5: 4e4 }
  },
  ISL: {
    marketFactor: 0.035,
    tierCaps: { 1: 6e5, 2: 35e4, 3: 15e4, 4: 5e4, 5: 2e4 }
  },
  GRE: {
    marketFactor: 0.52,
    tierCaps: { 1: 25e6, 2: 12e6, 3: 4e6, 4: 11e5, 5: 35e4 }
  },
  CRO: {
    marketFactor: 0.34,
    tierCaps: { 1: 15e6, 2: 8e6, 3: 3e6, 4: 85e4, 5: 275e3 }
  },
  SRB: {
    marketFactor: 0.32,
    tierCaps: { 1: 12e6, 2: 7e6, 3: 28e5, 4: 8e5, 5: 25e4 }
  },
  ROU: {
    marketFactor: 0.28,
    tierCaps: { 1: 1e7, 2: 6e6, 3: 24e5, 4: 7e5, 5: 225e3 }
  },
  BUL: {
    marketFactor: 0.22,
    tierCaps: { 1: 55e5, 2: 35e5, 3: 15e5, 4: 45e4, 5: 15e4 }
  },
  SVN: {
    marketFactor: 0.14,
    tierCaps: { 1: 28e5, 2: 18e5, 3: 8e5, 4: 25e4, 5: 9e4 }
  },
  BIH: {
    marketFactor: 0.11,
    tierCaps: { 1: 22e5, 2: 14e5, 3: 65e4, 4: 2e5, 5: 7e4 }
  },
  MNE: {
    marketFactor: 0.06,
    tierCaps: { 1: 1e6, 2: 65e4, 3: 3e5, 4: 1e5, 5: 4e4 }
  },
  MKD: {
    marketFactor: 0.07,
    tierCaps: { 1: 12e5, 2: 75e4, 3: 35e4, 4: 12e4, 5: 45e3 }
  },
  ALB: {
    marketFactor: 0.09,
    tierCaps: { 1: 16e5, 2: 1e6, 3: 45e4, 4: 15e4, 5: 55e3 }
  },
  BRA: {
    marketFactor: 0.72,
    tierCaps: { 1: 42e6, 2: 18e6, 3: 6e6, 4: 15e5, 5: 5e5 }
  },
  ARG: {
    marketFactor: 0.58,
    tierCaps: { 1: 28e6, 2: 12e6, 3: 4e6, 4: 11e5, 5: 35e4 }
  },
  URU: {
    marketFactor: 0.24,
    tierCaps: { 1: 8e6, 2: 5e6, 3: 18e5, 4: 5e5, 5: 175e3 }
  },
  COL: {
    marketFactor: 0.27,
    tierCaps: { 1: 9e6, 2: 55e5, 3: 18e5, 4: 5e5, 5: 175e3 }
  },
  ECU: {
    marketFactor: 0.3,
    tierCaps: { 1: 11e6, 2: 6e6, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  PAR: {
    marketFactor: 0.23,
    tierCaps: { 1: 7e6, 2: 4e6, 3: 14e5, 4: 4e5, 5: 15e4 }
  },
  CHI: {
    marketFactor: 0.26,
    tierCaps: { 1: 75e5, 2: 4e6, 3: 14e5, 4: 4e5, 5: 15e4 }
  },
  PER: {
    marketFactor: 0.18,
    tierCaps: { 1: 45e5, 2: 25e5, 3: 9e5, 4: 25e4, 5: 1e5 }
  },
  BOL: {
    marketFactor: 0.12,
    tierCaps: { 1: 25e5, 2: 15e5, 3: 5e5, 4: 15e4, 5: 6e4 }
  },
  KSA: {
    marketFactor: 1.2,
    tierCaps: { 1: 9e7, 2: 4e7, 3: 12e6, 4: 3e6, 5: 9e5 }
  },
  UAE: {
    marketFactor: 0.48,
    tierCaps: { 1: 18e6, 2: 12e6, 3: 4e6, 4: 11e5, 5: 35e4 }
  },
  QAT: {
    marketFactor: 0.64,
    tierCaps: { 1: 22e6, 2: 16e6, 3: 5e6, 4: 15e5, 5: 5e5 }
  },
  JPN: {
    marketFactor: 0.3,
    tierCaps: { 1: 1e7, 2: 6e6, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  KOR: {
    marketFactor: 0.22,
    tierCaps: { 1: 7e6, 2: 45e5, 3: 15e5, 4: 45e4, 5: 15e4 }
  },
  IRN: {
    marketFactor: 0.26,
    tierCaps: { 1: 8e6, 2: 5e6, 3: 18e5, 4: 5e5, 5: 175e3 }
  },
  CHN: {
    marketFactor: 0.28,
    tierCaps: { 1: 9e6, 2: 6e6, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  THA: {
    marketFactor: 0.17,
    tierCaps: { 1: 5e6, 2: 3e6, 3: 18e5, 4: 5e5, 5: 15e4 }
  },
  MAS: {
    marketFactor: 0.16,
    tierCaps: { 1: 45e5, 2: 28e5, 3: 16e5, 4: 45e4, 5: 15e4 }
  },
  AUS: {
    marketFactor: 0.2,
    tierCaps: { 1: 6e6, 2: 35e5, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  EGY: {
    marketFactor: 0.3,
    tierCaps: { 1: 1e7, 2: 6e6, 3: 2e6, 4: 6e5, 5: 2e5 }
  },
  RSA: {
    marketFactor: 0.21,
    tierCaps: { 1: 7e6, 2: 4e6, 3: 15e5, 4: 45e4, 5: 15e4 }
  },
  MAR: {
    marketFactor: 0.24,
    tierCaps: { 1: 8e6, 2: 5e6, 3: 18e5, 4: 5e5, 5: 175e3 }
  },
  TUN: {
    marketFactor: 0.15,
    tierCaps: { 1: 45e5, 2: 3e6, 3: 11e5, 4: 35e4, 5: 12e4 }
  },
  ALG: {
    marketFactor: 0.14,
    tierCaps: { 1: 4e6, 2: 28e5, 3: 1e6, 4: 3e5, 5: 1e5 }
  },
  TZA: {
    marketFactor: 0.1,
    tierCaps: { 1: 25e5, 2: 18e5, 3: 7e5, 4: 22e4, 5: 8e4 }
  },
  COD: {
    marketFactor: 0.09,
    tierCaps: { 1: 22e5, 2: 16e5, 3: 6e5, 4: 2e5, 5: 7e4 }
  }
};
var normalizeMarketCountry = (country) => {
  if (!country) return null;
  const normalized = country.trim().toUpperCase();
  return normalized.length >= 3 ? normalized.slice(0, 3) : normalized;
};
var getInternationalMarketProfile = (country) => {
  const normalizedCountry = normalizeMarketCountry(country);
  if (normalizedCountry && INTERNATIONAL_MARKET_PROFILE_BY_COUNTRY[normalizedCountry]) {
    return INTERNATIONAL_MARKET_PROFILE_BY_COUNTRY[normalizedCountry];
  }
  const financeFactor = EUROPEAN_COUNTRY_FINANCE_FACTOR[normalizedCountry || ""] ?? 0.25;
  const marketFactor = clamp4(0.5 + Math.sqrt(financeFactor / 1.45) * 0.55, 0.45, 1.1);
  const capScale = clamp4(marketFactor / 0.9, 0.55, 1.22);
  return {
    marketFactor,
    tierCaps: Object.fromEntries(
      Object.entries(INTERNATIONAL_DEFAULT_TIER_CAPS).map(([tierKey, value]) => [
        Number(tierKey),
        Math.round(value * capScale)
      ])
    )
  };
};
var getInternationalBaseMarketValue = (ovr) => {
  if (ovr >= 92) return 155e6 + (ovr - 92) * 15e6;
  if (ovr >= 89) return 105e6 + (ovr - 89) * 16e6;
  if (ovr >= 86) return 68e6 + (ovr - 86) * 12e6;
  if (ovr >= 83) return 4e7 + (ovr - 83) * 9e6;
  if (ovr >= 80) return 24e6 + (ovr - 80) * 5e6;
  if (ovr >= 76) return 11e6 + (ovr - 76) * 3e6;
  if (ovr >= 72) return 5e6 + (ovr - 72) * 15e5;
  if (ovr >= 68) return 18e5 + (ovr - 68) * 8e5;
  if (ovr >= 60) return 35e4 + (ovr - 60) * 18e4;
  return 5e4 + Math.max(0, ovr - 40) * 15e3;
};
var getInternationalAgeFactor = (player) => {
  switch (player.position) {
    case "DEF" /* DEF */:
      if (player.age <= 20) return 1.08;
      if (player.age <= 24) return 1.04;
      if (player.age <= 29) return 1;
      if (player.age <= 31) return 0.94;
      if (player.age <= 33) return 0.82;
      if (player.age <= 35) return 0.68;
      if (player.age <= 37) return 0.52;
      return 0.4;
    case "GK" /* GK */:
      if (player.age <= 21) return 1.02;
      if (player.age <= 25) return 1;
      if (player.age <= 31) return 1.05;
      if (player.age <= 34) return 0.96;
      if (player.age <= 36) return 0.82;
      if (player.age <= 38) return 0.66;
      return 0.52;
    default:
      if (player.age <= 20) return 1.18;
      if (player.age <= 23) return 1.1;
      if (player.age <= 27) return 1;
      if (player.age <= 29) return 0.94;
      if (player.age <= 31) return 0.82;
      if (player.age <= 33) return 0.68;
      if (player.age <= 35) return 0.54;
      if (player.age <= 37) return 0.4;
      return 0.28;
  }
};
var calculateInternationalMarketValue = (player, reputation, tier, country) => {
  const baseValue = getInternationalBaseMarketValue(player.overallRating);
  const tierMultiplier = {
    1: 1,
    2: 0.36,
    3: 0.16,
    4: 0.06,
    5: 0.03
  }[tier] ?? 0.08;
  const reputationFactor = 0.9 + clamp4(reputation, 1, 20) * 0.015;
  const ageFactor = getInternationalAgeFactor(player);
  const marketProfile = getInternationalMarketProfile(country);
  const randomFactor = 0.97 + Math.random() * 0.06;
  const tierCap = marketProfile.tierCaps[tier] ?? INTERNATIONAL_DEFAULT_TIER_CAPS[5];
  const rawValue = baseValue * tierMultiplier * marketProfile.marketFactor * reputationFactor * ageFactor * randomFactor;
  const cappedValue = Math.min(rawValue, tierCap);
  const step = cappedValue >= 1e8 ? 1e6 : cappedValue >= 25e6 ? 5e5 : cappedValue >= 1e7 ? 25e4 : cappedValue >= 1e6 ? 1e5 : cappedValue >= 1e5 ? 25e3 : 1e4;
  return Math.round(cappedValue / step) * step;
};
var FinanceService = {
  /**
   * Oblicza budżet początkowy na podstawie poziomu ligi i reputacji (1-10)
   */
  calculateInitialBudget: (tier, reputation) => {
    let min = 0;
    let max = 0;
    switch (tier) {
      case 1:
        min = 5e7;
        max = 217e6;
        break;
      case 2:
        min = 128e5;
        max = 448e5;
        break;
      case 3:
        min = 28e5;
        max = 128e5;
        break;
      case 4:
        min = 8e5;
        max = 1e7;
        break;
      default:
        min = 1e6;
        max = 5e6;
    }
    const reputationFactor = (Math.min(10, Math.max(1, reputation)) - 1) / 9;
    const baseBudget = min + (max - min) * reputationFactor;
    const variability = 0.95 + Math.random() * 0.1;
    return Math.floor(baseBudget * variability);
  },
  calculateTransferBudgetCap: (budget, reputation, wageBill = 0) => {
    if (!Number.isFinite(budget) || budget <= 0) return 0;
    const rep = Math.max(1, Math.min(20, reputation || 1));
    const wagePressure = wageBill > 0 ? wageBill / Math.max(1, budget) : 0;
    let ratio = 0.34 + Math.min(0.14, rep * 7e-3);
    if (wagePressure >= 0.85) ratio -= 0.14;
    else if (wagePressure >= 0.65) ratio -= 0.09;
    else if (wagePressure >= 0.45) ratio -= 0.04;
    const cappedRatio = Math.max(0.18, Math.min(0.52, ratio));
    return Math.floor(budget * cappedRatio);
  },
  calculateInitialTransferBudget: (budget, reputation) => {
    const cap = FinanceService.calculateTransferBudgetCap(budget, reputation);
    const rep = Math.max(1, Math.min(20, reputation || 1));
    const allocationRatio = 0.52 + Math.min(0.28, rep * 0.018) + Math.random() * 0.14;
    return Math.floor(cap * Math.min(0.95, allocationRatio));
  },
  calculateInitialReserveBudget: (budget, reputation) => {
    if (!Number.isFinite(budget) || budget <= 0) return 0;
    const rep = Math.max(1, Math.min(20, reputation || 1));
    const reserveRatio = 0.045 + Math.min(0.08, rep * 4e-3);
    return Math.floor(budget * reserveRatio);
  },
  normalizeTransferBudget: (budget, transferBudget, reputation, wageBill = 0) => {
    const cap = FinanceService.calculateTransferBudgetCap(budget, reputation, wageBill);
    return Math.max(0, Math.min(Math.floor(transferBudget || 0), cap));
  },
  getClubTier: (club) => {
    if (!club) return 4;
    if (typeof club.tier === "number" && Number.isFinite(club.tier)) {
      return club.tier;
    }
    const parsedTier = parseInt((club.leagueId || "").split("_")[2] || "4", 10);
    return Number.isFinite(parsedTier) ? parsedTier : 4;
  },
  calculateEuropeanInitialBudget: (tier, reputation, country, clubName, stadiumCapacity = 15e3) => {
    if (clubName && EUROPEAN_CLUB_REVENUE_OVERRIDE_PLN[clubName]) {
      return EUROPEAN_CLUB_REVENUE_OVERRIDE_PLN[clubName];
    }
    const baseRevenueEurM = EUROPEAN_TIER_BASE_REVENUE_EUR_M[tier] ?? EUROPEAN_TIER_BASE_REVENUE_EUR_M[4];
    const countryFactor = EUROPEAN_COUNTRY_FINANCE_FACTOR[country] ?? 0.1;
    const cappedReputation = Math.max(1, Math.min(20, reputation));
    const cappedCapacity = Math.max(2e3, Math.min(1e5, stadiumCapacity));
    const reputationFactor = 0.62 + Math.pow(cappedReputation / 20, 1.35) * 0.98;
    const stadiumFactor = 0.85 + (cappedCapacity - 2e3) / 98e3 * 0.3;
    const continentalPremium = tier === 1 ? 1.08 : tier === 2 ? 1 : tier === 3 ? 0.96 : 0.92;
    const variability = 0.97 + Math.random() * 0.06;
    const estimatedRevenueEurM = baseRevenueEurM * countryFactor * reputationFactor * stadiumFactor * continentalPremium * variability;
    return eurMillionsToPln(estimatedRevenueEurM);
  },
  getWagePool: (totalBudget) => {
    return totalBudget * 0.45;
  },
  calculatePolishLeagueSalaryCeiling: (tier, reputation) => {
    if (tier !== 2) return null;
    const reputationFactor = clamp4((Math.max(1, Math.min(10, reputation)) - 4) / 6, 0, 1);
    const ceiling = 12e4 + 24e4 * reputationFactor;
    return Math.round(ceiling / 1e4) * 1e4;
  },
  normalizePolishLeagueAnnualSalary: (rawSalary, tier, reputation) => {
    const salary = Math.max(0, Math.floor(rawSalary));
    const ceiling = FinanceService.calculatePolishLeagueSalaryCeiling(tier, reputation);
    return ceiling ? Math.min(salary, ceiling) : salary;
  },
  calculateTotalSalaries: (squad) => {
    return squad.reduce((sum, p) => sum + (p.annualSalary || 0), 0);
  },
  calculateAvailableFunds: (totalBudget, squad) => {
    const expenses = FinanceService.calculateTotalSalaries(squad);
    return totalBudget - expenses;
  },
  calculateSalaryWeight: (ovr, age) => {
    const baseWeight = Math.pow(Math.max(1, ovr - 35), 1.5);
    const ageMod = age < 20 ? 0.8 : 1;
    return baseWeight * ageMod;
  },
  calculateNewgenSalary: (clubBudget, overall, age) => {
    const wagePool = FinanceService.getWagePool(clubBudget);
    const avgSquadSalary = wagePool / 31;
    const youthDiscount = age <= 17 ? 0.38 : age <= 19 ? 0.46 : age <= 21 ? 0.58 : 0.72;
    const overallModifier = Math.min(1.2, Math.max(0.55, 0.55 + (overall - 45) * 0.03));
    let salary = avgSquadSalary * youthDiscount * overallModifier;
    if (overall >= 70) {
      const starBonus = 1.12 + Math.min(0.18, (overall - 70) * 0.02);
      salary *= starBonus;
    }
    const fairMarketSalary = FinanceService.getFairMarketSalary(overall);
    const fairMarketCapMultiplier = overall >= 70 ? 0.55 : 0.4;
    const cappedSalary = Math.min(salary, fairMarketSalary * fairMarketCapMultiplier);
    const salaryStep = cappedSalary >= 1e6 ? 1e5 : cappedSalary >= 1e5 ? 1e4 : 5e3;
    return Math.max(15e3, Math.round(cappedSalary / salaryStep) * salaryStep);
  },
  // Koszty organizacji meczu — progresywna formuła wg. ligi, reputacji i frekwencji
  // attendance (opcjonalne) — liczba kibiców na trybunach (dla meczów u siebie)
  calculateMatchdayExpenses: (club, isHome, attendance) => {
    const cfoFactor = 1.15 - (club.management?.cfo?.dyscyplinaFinansowa ?? 10) / 20 * 0.3;
    if (isEuropeanCommercialClub(club)) {
      const marketIndex = getEuropeanCommercialIndex(club);
      if (isHome) {
        const att = attendance ?? 0;
        const fillRate = club.stadiumCapacity > 0 ? att / club.stadiumCapacity : 0;
        const fillMultiplier = fillRate >= 0.95 ? 1.3 : fillRate >= 0.85 ? 1.18 : fillRate >= 0.7 ? 1.08 : 1;
        const rawCost2 = (18e4 + club.stadiumCapacity * (5.5 + marketIndex * 1.8) + att * (7 + marketIndex * 2.4) + club.reputation * (16e3 + marketIndex * 8e3)) * fillMultiplier * cfoFactor;
        const minFloor = 18e4 + club.stadiumCapacity * (2 + marketIndex * 0.8);
        const maxCap = 35e4 + club.stadiumCapacity * (14 + marketIndex * 4);
        return Math.round(clamp4(rawCost2, minFloor, maxCap));
      }
      const awayRaw = (12e4 + club.stadiumCapacity * (1 + marketIndex * 0.35) + club.reputation * (7e3 + marketIndex * 3e3)) * cfoFactor;
      const awayCap = 22e4 + club.stadiumCapacity * (3.5 + marketIndex);
      return Math.round(Math.min(awayRaw, awayCap));
    }
    const tier = Math.min(4, Math.max(1, parseInt(club.leagueId.split("_")[2] || "4")));
    const p = MATCHDAY_COST_PARAMS;
    if (isHome) {
      const att = attendance ?? 0;
      const fillRate = club.stadiumCapacity > 0 ? att / club.stadiumCapacity : 0;
      const fillMultiplier = fillRate >= 0.95 ? 1.5 : fillRate >= 0.85 ? 1.3 : fillRate >= 0.7 ? 1.1 : 1;
      const rawCost2 = (p.home.baseCost[tier] + att * p.home.perFanCost[tier] + club.reputation * p.home.repScale[tier]) * fillMultiplier * cfoFactor;
      return Math.min(
        p.home.maxCap[tier],
        Math.max(p.home.minFloor[tier], Math.floor(rawCost2))
      );
    }
    const rawCost = (p.away.baseCost[tier] + club.reputation * p.away.repScale[tier]) * cfoFactor;
    return Math.min(p.away.maxCap[tier], Math.floor(rawCost));
  },
  calculateManagementMonthlySalary: (club) => {
    if (!club.management) return 0;
    const { owner, ceo, cfo, coo, marketingDirector, academyDirector } = club.management;
    return owner.monthlySalary + (ceo?.monthlySalary ?? 0) + cfo.monthlySalary + coo.monthlySalary + marketingDirector.monthlySalary + (academyDirector?.monthlySalary ?? 0);
  },
  calculateMonthlyOperationalCosts: (club) => {
    const KOMPETENCJA_MULTIPLIER = {
      bardzo_niska: 1.35,
      niska: 1.2,
      przecietna: 1.05,
      wysoka: 0.95,
      bardzo_wysoka: 0.85
    };
    const kompetencja = club.board?.kompetencja ?? "przecietna";
    const kompetencjaFactor = KOMPETENCJA_MULTIPLIER[kompetencja] ?? 1.05;
    const cfoFactor = 1.15 - (club.management?.cfo?.dyscyplinaFinansowa ?? 10) / 20 * 0.3;
    if (isEuropeanCommercialClub(club)) {
      const tier2 = Math.min(4, Math.max(1, club.tier ?? 1));
      const monthlyFactor = { 1: 0.015, 2: 0.012, 3: 0.01, 4: 8e-3 }[tier2] ?? 0.01;
      const rawCost2 = club.budget * monthlyFactor * kompetencjaFactor * cfoFactor;
      return Math.round(clamp4(rawCost2, 5e4, 8e7) / 1e3) * 1e3;
    }
    const tier = Math.min(4, Math.max(1, parseInt(club.leagueId.split("_")[2] || "4")));
    const cappedCapacity = Math.max(500, Math.min(8e4, club.stadiumCapacity));
    const cappedRep = Math.max(1, Math.min(10, club.reputation));
    const costPerSeat = { 1: 18, 2: 9, 3: 4.5, 4: 2 }[tier] ?? 2;
    const opsBase = { 1: 35e4, 2: 65e3, 3: 16e3, 4: 5e3 }[tier] ?? 5e3;
    const opsPerRep = { 1: 65e3, 2: 16e3, 3: 4500, 4: 1500 }[tier] ?? 1500;
    const tierMin = { 1: 35e4, 2: 7e4, 3: 18e3, 4: 5e3 }[tier] ?? 5e3;
    const tierMax = { 1: 3e6, 2: 9e5, 3: 18e4, 4: 55e3 }[tier] ?? 55e3;
    const stadiumCost = cappedCapacity * costPerSeat;
    const opsCost = opsBase + cappedRep * opsPerRep;
    const rawCost = (stadiumCost + opsCost) * 1.3 * kompetencjaFactor * cfoFactor;
    return Math.round(clamp4(rawCost, tierMin, tierMax) / 1e3) * 1e3;
  },
  calculateSeasonalIncome: (tier, reputation, rank, sponsorshipMult = 1) => {
    const cappedReputation = Math.max(1, Math.min(10, reputation));
    if (tier === 3) {
      const tvRights2 = 2e6;
      const sponsorship2 = cappedReputation * 5e5 * sponsorshipMult;
      const prizeMoney2 = Math.max(0, (19 - rank) * 15e4);
      return Math.floor(tvRights2 + sponsorship2 + prizeMoney2);
    }
    if (tier === 4) {
      const tvRights2 = 75e4;
      const sponsorship2 = cappedReputation * 15e4 * sponsorshipMult;
      const prizeMoney2 = Math.max(0, (20 - rank) * 4e4);
      return Math.floor(tvRights2 + sponsorship2 + prizeMoney2);
    }
    const tvRights = [0, 35e6, 15e6, 6e6, 2e6][tier] || 1e6;
    const sponsorship = cappedReputation * 4e6 * sponsorshipMult;
    const prizeMoney = Math.max(0, (19 - rank) * 15e5);
    return Math.floor(tvRights + sponsorship + prizeMoney);
  },
  calculateMarketValue: (player, reputation, tier, clubCountry) => {
    const playerClubId = player.clubId ?? "";
    if (playerClubId === "FREE_AGENTS") return 0;
    const ovr = player.overallRating;
    const normalizedCountry = normalizeMarketCountry(clubCountry);
    const isPolishClub = playerClubId.startsWith("PL_") || normalizedCountry === "POL";
    if (isPolishClub) {
      return calculatePolishMarketValue(player, reputation, tier);
    }
    return calculateInternationalMarketValue(player, reputation, tier, normalizedCountry);
  },
  /**
   * Board Intervention Engine (BIE)
   * Oblicza WOZ (Wskaźnik Oporu Zarządu)
   */
  evaluateReleaseRequest: (player, club, squad) => {
    const penalty = Math.floor(player.annualSalary * 0.4);
    const budget = club.budget;
    const financialPain = penalty / budget * 100;
    let financialScore = financialPain * 4;
    if (financialPain > 20) financialScore += 50;
    const avgOvr = squad.reduce((acc, p) => acc + p.overallRating, 0) / squad.length;
    const starGap = player.overallRating - avgOvr;
    let sportScore = 0;
    if (starGap > 10) sportScore = 95;
    else if (starGap > 5) sportScore = 50;
    else if (starGap < -5) sportScore = -20;
    const strictnessScore = (club.boardStrictness - 5) * 10;
    const chaosScore = Math.random() * 20 - 10;
    let woz = Math.max(0, Math.min(100, financialScore * 0.45 + sportScore * 0.4 + strictnessScore * 0.1 + chaosScore));
    const top11Ids = [...squad].sort((a, b) => b.overallRating - a.overallRating).slice(0, 11).map((p) => p.id);
    const isPillar = top11Ids.includes(player.id);
    if (isPillar && Math.random() > 0.05) {
      woz = Math.max(woz, 90);
    }
    if (player.isUntouchable && Math.random() > 0.01) {
      woz = 100;
    }
    if (woz < 30) return { status: "APPROVED", woz, reason: "Zarz\u0105d akceptuje Pana decyzj\u0119. Koszty s\u0105 akceptowalne, a zawodnik nie jest kluczowy dla wizerunku klubu." };
    if (woz < 60) return { status: "WARNING", woz, reason: "Zarz\u0105d ma pewne w\u0105tpliwo\u015Bci co do op\u0142acalno\u015Bci tego ruchu. Ostatecznie ufa Pana os\u0105dowi, ale oczekuje wynik\xF3w." };
    if (woz < 85) return { status: "SOFT_BLOCK", woz, reason: "Wniosek odrzucony. Obecnie nie mo\u017Cemy sobie pozwoli\u0107 na tak\u0105 strat\u0119 finansow\u0105. Prosz\u0119 spr\xF3bowa\u0107 za 3 miesi\u0105ce." };
    return { status: "VETO", woz, reason: "ABSOLUTNE VETO! Ten zawodnik jest ikon\u0105 klubu, a koszty jego zwolnienia zrujnowa\u0142yby nasz bud\u017Cet transferowy!" };
  },
  /**
   * Oblicza ile klub ma w puli na bonusy za podpis (5-10% budżetu)
   */
  calculateInitialSigningPool: (budget, reputation) => {
    const repFactor = reputation / 10 * 0.05;
    const finalPercent = 0.05 + repFactor;
    return Math.floor(budget * finalPercent);
  },
  /**
   * Oblicza ile zawodnik żąda za sam podpis (25-100% pensji)
   */
  calculatePlayerBonusDemand: (player, proposedSalary, clubReputation) => {
    const salaryBase = player.annualSalary > 0 ? player.annualSalary : proposedSalary;
    const ovr = player.overallRating;
    let baseMultiplier;
    if (ovr >= 90) baseMultiplier = 2.1;
    else if (ovr >= 85) baseMultiplier = 1.7;
    else if (ovr >= 80) baseMultiplier = 1.4;
    else if (ovr >= 75) baseMultiplier = 1.15;
    else if (ovr >= 70) baseMultiplier = 0.95;
    else if (ovr >= 65) baseMultiplier = 0.8;
    else baseMultiplier = 0.6;
    const age = player.age;
    let ageModifier;
    if (age >= 34) ageModifier = 1.35;
    else if (age >= 30) ageModifier = 1.15;
    else if (age <= 22) ageModifier = 0.75;
    else ageModifier = 1;
    const personality = player.moralePersonality;
    let personalityModifier = 1;
    if (personality === "EGOIST") personalityModifier = 1.35;
    else if (personality === "AMBITIOUS") personalityModifier = 1.2;
    else if (personality === "CONFIDENT") personalityModifier = 1.1;
    else if (personality === "LOYAL") personalityModifier = 0.7;
    else if (personality === "PROFESSIONAL") personalityModifier = 0.85;
    else if (personality === "CALM") personalityModifier = 0.9;
    const repModifier = clubReputation > 8 ? 1.15 : clubReputation < 5 ? 0.9 : 1;
    const variation = 0.85 + Math.random() * 0.3;
    const demand = salaryBase * baseMultiplier * ageModifier * personalityModifier * repModifier * variation;
    const step = demand >= 5e5 ? 25e3 : demand >= 1e5 ? 1e4 : demand >= 2e4 ? 5e3 : 1e3;
    return Math.round(demand / step) * step;
  },
  /**
   * Sprawdza czy oferta nie jest "manipulacją" (poniżej 40% żądań)
   */
  isOfferInsulting: (proposedBonus, demand) => {
    return proposedBonus < demand * 0.4;
  },
  /**
   * Główny silnik prawdopodobieństwa akceptacji (FM HARDCORE MODE)
   */
  evaluateContractLogic: (player, newSalary, newBonus, newEndDate, currentDate, clubReputation, clubTier, managerProfile) => {
    const now = currentDate.getTime();
    const currentEnd = new Date(player.contractEndDate).getTime();
    const newEnd = new Date(newEndDate).getTime();
    const rawExpectedSalary = player.annualSalary > 0 ? player.annualSalary : FinanceService.getFairMarketSalary(player.overallRating);
    const salaryCeiling = clubTier ? FinanceService.calculatePolishLeagueSalaryCeiling(clubTier, clubReputation) : null;
    const managerInfluence = ManagerNegotiationInfluenceService.calculate(managerProfile);
    const managerExpectationMultiplier = managerProfile ? managerInfluence.expectationMultiplier : 1;
    const expectedSalaryBase = salaryCeiling ? Math.min(rawExpectedSalary, salaryCeiling) : rawExpectedSalary;
    const expectedSalary = Math.max(5e4, Math.round(expectedSalaryBase * managerExpectationMultiplier / 5e3) * 5e3);
    const expectedBonus = Math.max(0, Math.round(FinanceService.calculatePlayerBonusDemand(player, expectedSalary, clubReputation) * managerExpectationMultiplier / 5e3) * 5e3);
    const isSalaryWithin15Percent = newSalary >= expectedSalary * 0.85;
    const isBonusWithin15Percent = newBonus >= expectedBonus * 0.85;
    if (isSalaryWithin15Percent && isBonusWithin15Percent && Math.random() < 0.1) {
      return {
        accepted: true,
        reason: "M\xF3j klient liczy\u0142 na nieco lepsze warunki, ale po namy\u015Ble uznali\u015Bmy, \u017Ce ten zesp\xF3\u0142 jest wart pewnych ust\u0119pstw finansowych. Podpisujemy!",
        demands: null
      };
    }
    const salaryScore = newSalary / expectedSalary;
    const bonusScore = expectedBonus > 0 ? newBonus / expectedBonus : 1.1;
    const salarySurplus = Math.max(0, salaryScore - 1);
    const effectiveBonusScore = bonusScore + salarySurplus * 2.5;
    const bonusSurplus = Math.max(0, bonusScore - 1);
    const effectiveSalaryScore = salaryScore + bonusSurplus * 0.12;
    if (effectiveSalaryScore < 0.65) {
      return {
        accepted: false,
        reason: "Nie traktujecie mnie powaznie wiec nie b\u0119dziemy o niczym rozmawiac. Do widzenia!",
        demands: null
      };
    }
    if (newBonus < expectedBonus * 0.2 && effectiveSalaryScore < 1.15) {
      return {
        accepted: false,
        reason: "M\xF3j agent uwa\u017Ca, \u017Ce kwota za sam podpis jest zdecydowanie za niska. Prosz\u0119 o przedstawienie nowej oferty uwzgl\u0119dniaj\u0105cej godny bonus.",
        demands: { salary: Math.ceil(expectedSalary * 1.05), bonus: expectedBonus }
      };
    }
    let wSal = 0.6, wBon = 0.3, wLen = 0.1;
    if (player.age >= 32) {
      wSal = 0.4;
      wBon = 0.5;
      wLen = 0.1;
    } else if (player.age <= 23) {
      wSal = 0.7;
      wBon = 0.1;
      wLen = 0.2;
    }
    const proposedYears = (newEnd - now) / (365 * 24 * 60 * 60 * 1e3);
    const remainingYears = (currentEnd - now) / (365 * 24 * 60 * 60 * 1e3);
    let lengthScore = 1;
    if (proposedYears < remainingYears) lengthScore = 0.5;
    if (player.age > 33 && proposedYears >= 2) lengthScore = 1.3;
    const finalScore = effectiveSalaryScore * wSal + effectiveBonusScore * wBon + lengthScore * wLen;
    const isDemandingHigher = Math.random() < 0.9;
    let demandSalary = expectedSalary;
    let demandBonus = expectedBonus;
    if (isDemandingHigher) {
      const multiplier = 1.05 + Math.random() * 0.15;
      demandSalary = Math.ceil(expectedSalary * multiplier);
      demandBonus = Math.ceil(expectedBonus * multiplier);
    } else {
      demandSalary = expectedSalary;
      demandBonus = expectedBonus;
    }
    if (salaryCeiling) {
      demandSalary = Math.min(demandSalary, salaryCeiling);
    }
    const demands = {
      salary: demandSalary,
      bonus: demandBonus
    };
    if (finalScore >= 0.98) {
      return { accepted: true, reason: "Zgadzam si\u0119 na te warunki.", demands: null };
    }
    if (finalScore >= 0.7) {
      return {
        accepted: false,
        reason: "Jeste\u015Bmy blisko porozumienia, ale m\xF3j klient oczekuje lepszych kwot, bior\u0105c pod uwag\u0119 jego status w zespole. Oto nasze oczekiwania.",
        demands
      };
    }
    return {
      accepted: false,
      reason: "Z ca\u0142ym szacunkiem, ale te warunki s\u0105 nieakceptowalne. Prosz\u0119 o przedstawienie oferty godnej zawodnika tej klasy.",
      demands: finalScore > 0.4 ? demands : null
    };
  },
  // Oblicza sumę wszystkich pensji w drużynie
  calculateCurrentWageBill: (squad) => {
    return squad.reduce((sum, p) => sum + (p.annualSalary || 0), 0);
  },
  /**
   * Full guaranteed value used to compare the offer with the agent's expectations.
   * Contract length belongs here because a longer deal is genuinely worth more to
   * the player, even though the club does not prepay every future season at signing.
   */
  calculateFreeAgentContractCommitment: (annualSalary, years, signingBonus) => Math.max(0, annualSalary) * Math.max(1, years) + Math.max(0, signingBonus),
  /**
   * Immediate charge against the current season's transfer/contract budget.
   * Future annual salaries are funded from future season budgets, so only the first
   * annual salary and the one-time signing bonus are reserved when the deal is signed.
   */
  calculateFreeAgentCurrentSeasonCost: (annualSalary, signingBonus) => Math.max(0, annualSalary) + Math.max(0, signingBonus),
  calculateRemainingContractBudget: (availableBudget, annualSalary, _years, signingBonus) => Math.max(0, availableBudget - FinanceService.calculateFreeAgentCurrentSeasonCost(annualSalary, signingBonus)),
  // Orientacyjna wartość używana przez agentów i symulację rynku; nie jest limitem zarządu.
  getFairMarketSalary: (ovr) => {
    const base = Math.pow(ovr / 50, 4) * 125e3;
    const step = base >= 1e6 ? 1e5 : base >= 1e5 ? 1e4 : 5e3;
    return Math.round(base / step) * step;
  },
  calculateFAExpectations: (player, clubReputation, avgSquadSalary) => {
    const base = Math.pow(player.overallRating, 2.9) * 0.45;
    const repTax = (10 - clubReputation) * 0.05;
    const anchor = avgSquadSalary * 0.3 + base * 0.7;
    const chaos = 0.85 + Math.random() * 0.3;
    return Math.floor(anchor * (1 + repTax) * chaos);
  },
  evaluateFASigningBoardDecision: (player, proposedSalary, proposedBonus, squad, club) => {
    const tier = FinanceService.getClubTier(club);
    const wageBill = FinanceService.calculateTotalSalaries(squad);
    const projectedWageBill = wageBill + Math.max(0, proposedSalary);
    const liquiditySalaryCap = club.budget * (tier >= 3 ? 0.35 : 0.3);
    const projectedWagePressure = projectedWageBill / Math.max(1, club.budget);
    if (proposedSalary > liquiditySalaryCap || projectedWagePressure > 0.82) {
      return {
        approved: false,
        reason: "Dyrektor finansowy ocenia, \u017Ce ten kontrakt zbyt mocno obci\u0105\u017Cy roczne finanse klubu i ograniczy mo\u017Cliwo\u015B\u0107 wykonania kolejnych ruch\xF3w kadrowych.",
        reasonCode: "LIQUIDITY",
        appealable: true
      };
    }
    const highestSalary = squad.length > 0 ? Math.max(...squad.map((p) => p.annualSalary)) : 0;
    const averageOverall = squad.length > 0 ? squad.reduce((sum, squadPlayer) => sum + squadPlayer.overallRating, 0) / squad.length : player.overallRating;
    const bestSamePositionOverall = squad.filter((squadPlayer) => squadPlayer.position === player.position).reduce((best, squadPlayer) => Math.max(best, squadPlayer.overallRating), 0);
    const isClearSportingUpgrade = player.overallRating >= averageOverall + 4 || player.overallRating >= bestSamePositionOverall + 2;
    const hierarchyMultiplier = isClearSportingUpgrade ? tier >= 3 ? 3.5 : 3.1 : player.overallRating >= averageOverall ? tier >= 3 ? 2.75 : 2.55 : tier >= 3 ? 2.4 : 2.25;
    const financialStructureFloor = club.budget * (tier === 1 ? 0.045 : tier === 2 ? 0.035 : tier === 3 ? 0.025 : 0.02);
    const hierarchySalaryCap = Math.max(highestSalary * hierarchyMultiplier, financialStructureFloor);
    if (highestSalary > 0 && proposedSalary > hierarchySalaryCap) {
      return {
        approved: false,
        reason: `Prezes uwa\u017Ca, \u017Ce proponowana pensja zbyt gwa\u0142townie zmieni obecn\u0105 hierarchi\u0119 wynagrodze\u0144. Najwy\u017Csza pensja w kadrze wynosi obecnie ${highestSalary.toLocaleString("pl-PL")} PLN, dlatego zarz\u0105d oczekuje dodatkowego uzasadnienia dla ustanowienia nowego poziomu p\u0142ac.`,
        reasonCode: "WAGE_STRUCTURE",
        appealable: true
      };
    }
    if (proposedBonus > club.budget * 0.5) {
      return {
        approved: false,
        reason: "Zarz\u0105d uwa\u017Ca, \u017Ce jednorazowy bonus za podpis jest zbyt wysoki w stosunku do wolnych \u015Brodk\xF3w klubu.",
        reasonCode: "SIGNING_BONUS",
        appealable: true
      };
    }
    return { approved: true, reason: "" };
  },
  evaluateRenewalBoardDecision: (player, proposedSalary, proposedBonus, squad, club) => {
    if (Math.random() < 1 / 365) {
      return { approved: true, reason: "PREZES: Wiecie co, id\u0119 na ca\u0142o\u015B\u0107. Podpisujemy!" };
    }
    const currentWageBill = FinanceService.calculateCurrentWageBill(squad);
    const wageBillAfter = currentWageBill - player.annualSalary + proposedSalary;
    if (wageBillAfter > club.budget * 0.65) {
      return {
        approved: false,
        reason: "DYREKTOR FINANSOWY: \u0141\u0105czny fundusz p\u0142ac po tej podwy\u017Cce przekroczy\u0142by nasze mo\u017Cliwo\u015Bci bud\u017Cetowe."
      };
    }
    if (proposedSalary > player.annualSalary * 2 && player.annualSalary > 0) {
      return {
        approved: false,
        reason: `PREZES: Podwojenie pensji to za du\u017Cy skok naraz. Zawodnik zarabia teraz ${player.annualSalary.toLocaleString()} PLN \u2014 wr\xF3\u0107cie z rozs\u0105dniejsz\u0105 propozycj\u0105.`
      };
    }
    const highestSalary = squad.length > 0 ? Math.max(...squad.map((p) => p.annualSalary)) : 0;
    if (proposedSalary > highestSalary * 1.5 && highestSalary > 0 && player.overallRating < 80) {
      return {
        approved: false,
        reason: `PREZES: Ten zawodnik zarabia\u0142by wi\u0119cej ni\u017C 1.5x tyle co najlepiej op\u0142acany gracz w zespole (${highestSalary.toLocaleString()} PLN). Szatnia tego nie zaakceptuje.`
      };
    }
    if (proposedBonus > club.budget * 0.3) {
      return {
        approved: false,
        reason: "DYREKTOR FINANSOWY: Bonus za podpis jest zbyt wysoki wobec aktualnych rezerw got\xF3wkowych klubu."
      };
    }
    return { approved: true, reason: "" };
  },
  classifyFAOffer: (proposed, expected) => {
    const ratio = proposed / expected;
    if (ratio >= 1.1) return "IDEAL";
    if (ratio >= 0.9) return "ATTRACTIVE";
    if (ratio >= 0.7) return "AVERAGE";
    if (ratio >= 0.45) return "WEAK";
    return "INSULT";
  },
  compareMultipleOffers: (offers, clubs) => {
    return [...offers].sort((a, b) => {
      const clubA = clubs.find((c) => c.id === a.clubId);
      const clubB = clubs.find((c) => c.id === b.clubId);
      const repA = clubA ? clubA.reputation : 1;
      const repB = clubB ? clubB.reputation : 1;
      const scoreA = a.salary + a.bonus / 2 + repA * 5e4;
      const scoreB = b.salary + b.bonus / 2 + repB * 5e4;
      return scoreB - scoreA;
    })[0];
  },
  evaluateReleaseVsList: (player) => {
    const marketValue = player.marketValue || 0;
    const releaseCost = player.annualSalary * 0.4;
    if (marketValue > player.annualSalary * 0.5) {
      return "TRANSFER_LIST";
    }
    return "RELEASE";
  },
  // Funkcja zwraca cenę biletu jednorazowego w zależności od ligi i reputacji
  calculateTicketPrice: (tier, reputation) => {
    let basePrice = 0;
    switch (tier) {
      case 1:
        basePrice = 20 + reputation / 10 * 160;
        break;
      case 2:
        const ekstraPrice = 20 + reputation / 10 * 160;
        basePrice = ekstraPrice * (0.4 + reputation / 10 * 0.2);
        break;
      case 3:
        const refPrice = 20 + reputation / 10 * 160;
        basePrice = refPrice * (0.15 + reputation / 10 * 0.25);
        break;
      case 4:
        basePrice = 8 + reputation / 10 * 16;
        break;
      default:
        basePrice = 12;
    }
    if (tier === 3) {
      basePrice = 8 + reputation / 10 * 18;
    }
    return Math.floor(basePrice);
  },
  calculateTicketPriceForClub: (club) => {
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      return FinanceService.calculateTicketPrice(tier, club.reputation);
    }
    const marketIndex = getEuropeanCommercialIndex(club);
    const maxPrice = 18 + marketIndex * 110 + club.reputation / 20 * 85;
    return Math.round(clamp4(maxPrice, 45, 420));
  },
  // Przychód z biletów jednorazowych
  calculateMatchTicketRevenue: (attendance, tier, reputation) => {
    const maxPrice = FinanceService.calculateTicketPrice(tier, reputation);
    const minPrice = maxPrice <= 20 ? Math.max(5, Math.floor(maxPrice * 0.65)) : 20;
    const avgPrice = maxPrice <= minPrice ? maxPrice : Math.floor(minPrice + Math.random() * (maxPrice - minPrice));
    return { revenue: Math.floor(attendance * avgPrice), avgPrice };
  },
  calculateMatchTicketRevenueForClub: (attendance, club) => {
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      return FinanceService.calculateMatchTicketRevenue(attendance, tier, club.reputation);
    }
    const maxPrice = FinanceService.calculateTicketPriceForClub(club);
    const avgPrice = Math.round(maxPrice * (0.58 + Math.random() * 0.2));
    return { revenue: Math.floor(attendance * avgPrice), avgPrice };
  },
  // Przychód z karnetów na sezon (tylko dla gospodarza)
  calculateSeasonTicketRevenue: (stadiumCapacity, reputation, tier) => {
    let percentageOfCapacity = 0.1 + reputation / 10 * 0.2;
    const singlePrice = FinanceService.calculateTicketPrice(tier, reputation);
    const matchesPerSeason = 19;
    const seasonTicketPrice = singlePrice * matchesPerSeason;
    const minSeasonPrice = 200;
    const maxSeasonPrice = 1300;
    const finalSeasonPrice = Math.max(minSeasonPrice, Math.min(maxSeasonPrice, seasonTicketPrice));
    const seasonTicketsSold = Math.floor(stadiumCapacity * percentageOfCapacity);
    return Math.floor(seasonTicketsSold * finalSeasonPrice);
  },
  calculateSeasonTicketPackageForClub: (club) => {
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      const revenue = FinanceService.calculateSeasonTicketRevenue(club.stadiumCapacity, club.reputation, tier);
      const ticketsSold2 = Math.floor(club.stadiumCapacity * (0.1 + club.reputation / 10 * 0.2));
      const ticketPrice = FinanceService.calculateTicketPrice(tier, club.reputation);
      const seasonTicketPrice2 = Math.max(200, Math.min(1300, ticketPrice * 19));
      return { revenue, ticketsSold: ticketsSold2, seasonTicketPrice: seasonTicketPrice2 };
    }
    const marketIndex = getEuropeanCommercialIndex(club);
    const seasonTicketShare = clamp4(0.14 + marketIndex * 0.1 + club.reputation / 20 * 0.18, 0.16, 0.65);
    const ticketsSold = Math.floor(club.stadiumCapacity * seasonTicketShare);
    const singleMatchPrice = FinanceService.calculateTicketPriceForClub(club);
    const seasonDiscount = clamp4(0.68 + marketIndex * 0.05, 0.7, 0.82);
    const seasonTicketPrice = Math.round(clamp4(singleMatchPrice * 19 * seasonDiscount, 900, 8500));
    return {
      revenue: ticketsSold * seasonTicketPrice,
      ticketsSold,
      seasonTicketPrice
    };
  },
  // Dodatkowe przychody dnia meczowego per mecz domowy:
  // catering, merchandising, programy/LED, parkingi — proporcjonalne do frekwencji
  calculateMatchdayAdditionalRevenues: (attendance, tier, reputation) => {
    const t = Math.min(4, Math.max(1, tier));
    const p = MATCHDAY_ADDITIONAL_REVENUE_PARAMS;
    const repMultiplier = 0.8 + reputation / 10 * 0.4;
    const rand = () => 0.8 + Math.random() * 0.4;
    const catering = Math.floor(attendance * p.cateringPerFan[t] * repMultiplier * rand());
    const merchandising = Math.floor(attendance * p.merchandisingPerFan[t] * repMultiplier * rand());
    const programs = Math.floor(attendance * p.programsPerFan[t] * repMultiplier * rand());
    const parking = Math.floor(attendance * p.parkingPerFan[t] * repMultiplier * rand());
    return { catering, merchandising, programs, parking };
  },
  calculateMatchdayAdditionalRevenuesForClub: (attendance, club) => {
    const mktFactor = 0.85 + (club.management?.marketingDirector?.zdolnosciMarketingowe ?? 10) / 20 * 0.3;
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      const base = FinanceService.calculateMatchdayAdditionalRevenues(attendance, tier, club.reputation);
      return {
        catering: Math.floor(base.catering * mktFactor),
        merchandising: Math.floor(base.merchandising * mktFactor),
        programs: Math.floor(base.programs * mktFactor),
        parking: Math.floor(base.parking * mktFactor)
      };
    }
    const marketIndex = getEuropeanCommercialIndex(club);
    const repMultiplier = 0.9 + club.reputation / 20 * 0.45;
    const rand = () => 0.82 + Math.random() * 0.36;
    const catering = Math.floor(attendance * (2.5 + marketIndex * 2.6) * repMultiplier * rand() * mktFactor);
    const merchandising = Math.floor(attendance * (0.9 + marketIndex * 1.4) * repMultiplier * rand() * mktFactor);
    const programs = Math.floor(attendance * (0.3 + marketIndex * 0.45) * repMultiplier * rand() * mktFactor);
    const parking = Math.floor(attendance * (0.4 + marketIndex * 0.65) * repMultiplier * rand() * mktFactor);
    return { catering, merchandising, programs, parking };
  },
  // Roczny przychód z wynajmu stref VIP i lóż (Skybox).
  // Warunki: tier === 1 (Ekstraklasa) ORAZ stadiumCapacity > 15 000
  calculateVIPBoxRevenue: (stadiumCapacity, reputation) => {
    const p = VIP_BOX_REVENUE_PARAMS;
    const raw = p.base + reputation / 10 * p.repScale + stadiumCapacity / 4e4 * p.capacityScale;
    const jitter = 0.85 + Math.random() * 0.3;
    return Math.min(p.maxRevenue, Math.max(p.minRevenue, Math.floor(raw * jitter)));
  },
  calculateVIPBoxRevenueForClub: (club) => {
    const mktFactor = 0.85 + (club.management?.marketingDirector?.zdolnosciMarketingowe ?? 10) / 20 * 0.3;
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      if (tier !== 1 || club.stadiumCapacity <= 15e3) return 0;
      return Math.floor(FinanceService.calculateVIPBoxRevenue(club.stadiumCapacity, club.reputation) * mktFactor);
    }
    if (club.stadiumCapacity < 4e3) return 0;
    const marketIndex = getEuropeanCommercialIndex(club);
    const suitesSold = Math.max(4, Math.round(club.stadiumCapacity / 2200));
    const avgSuitePrice = 25e3 + marketIndex * 12e4 + club.reputation / 20 * 1e5;
    const occupancyFactor = club.leagueId === "L_CL" ? 1 : club.leagueId === "L_EL" ? 0.92 : 0.86;
    const jitter = 0.9 + Math.random() * 0.2;
    return Math.round(suitesSold * avgSuitePrice * occupancyFactor * jitter * mktFactor);
  },
  // Bonusy za pozycję końcową w lidze (Ekstraklasa)
  calculateLeagueFinishBonus: (position, tier) => {
    if (tier !== 1) return 0;
    const bonuses = {
      1: 35e6 + Math.random() * 3e6,
      // 35-38 mln
      2: 28e6 + Math.random() * 4e6,
      // 28-32 mln
      3: 24e6 + Math.random() * 4e6,
      // 24-28 mln
      4: 2e7 + Math.random() * 5e6
      // 20-25 mln
    };
    if (bonuses[position]) return Math.floor(bonuses[position]);
    if (position > 4) {
      const baseBonus = 1e7;
      const decrement = 5e5 * (position - 4);
      return Math.max(0, Math.floor(baseBonus - decrement));
    }
    return 0;
  },
  // Bonusy za Puchar Polski
  calculatePolishCupBonus: (cupPosition) => {
    const bonuses = {
      "WINNER": 5e6,
      "FINALIST": 1e6,
      "SEMIFINALIST": 38e4,
      "QUARTERFINALIST": 19e4,
      "ROUND_8": 9e4,
      "ROUND_16": 45e3,
      "ROUND_32": 2e4,
      "ROUND_64": 1e4
    };
    return bonuses[cupPosition] || 0;
  },
  // Bonus za Superpuchar Polski
  calculateSuperCupBonus: (isWinner) => {
    return isWinner ? 2e5 : 1e5;
  },
  // Premie UEFA za Puchary Europejskie (sezon 2025/26, przeliczone na PLN wg kursu 4,25 EUR/PLN)
  calculateEuropeanPrizeMoney: (competition, event) => {
    const EUR_PLN = 4.25;
    const prizes = {
      CL: {
        Q1_ADVANCE: Math.round(4e5 * EUR_PLN),
        //   1 700 000
        Q2_ADVANCE: Math.round(1e6 * EUR_PLN),
        //   4 250 000
        GROUP_STAGE_ENTRY: Math.round(1862e4 * EUR_PLN),
        //  79 135 000
        WIN: Math.round(21e5 * EUR_PLN),
        //   8 925 000
        DRAW: Math.round(7e5 * EUR_PLN),
        //   2 975 000
        KO_PLAYOFF: Math.round(11e5 * EUR_PLN),
        //   4 675 000
        R16: Math.round(11e6 * EUR_PLN),
        //  46 750 000
        QF: Math.round(125e5 * EUR_PLN),
        //  53 125 000
        SF: Math.round(15e6 * EUR_PLN),
        //  63 750 000
        FINALIST: Math.round(185e5 * EUR_PLN),
        //  78 625 000
        WINNER: Math.round(25e6 * EUR_PLN)
        // 106 250 000
      },
      EL: {
        Q1_ADVANCE: Math.round(1e5 * EUR_PLN),
        //     425 000
        Q2_ADVANCE: Math.round(25e4 * EUR_PLN),
        //   1 062 500
        GROUP_STAGE_ENTRY: Math.round(431e4 * EUR_PLN),
        //  18 317 500
        WIN: Math.round(63e4 * EUR_PLN),
        //   2 677 500
        DRAW: Math.round(21e4 * EUR_PLN),
        //     892 500
        KO_PLAYOFF: Math.round(5e5 * EUR_PLN),
        //   2 125 000
        R16: Math.round(15e5 * EUR_PLN),
        //   6 375 000
        QF: Math.round(22e5 * EUR_PLN),
        //   9 350 000
        SF: Math.round(39e5 * EUR_PLN),
        //  16 575 000
        FINALIST: Math.round(61e5 * EUR_PLN),
        //  25 925 000
        WINNER: Math.round(52e5 * EUR_PLN)
        //  22 100 000
      },
      CONF: {
        Q1_ADVANCE: Math.round(75e3 * EUR_PLN),
        //     318 750
        Q2_ADVANCE: Math.round(15e4 * EUR_PLN),
        //     637 500
        GROUP_STAGE_ENTRY: Math.round(317e4 * EUR_PLN),
        //  13 472 500
        WIN: Math.round(4e5 * EUR_PLN),
        //   1 700 000
        DRAW: Math.round(133e3 * EUR_PLN),
        //     565 250
        KO_PLAYOFF: Math.round(2e5 * EUR_PLN),
        //     850 000
        R16: Math.round(8e5 * EUR_PLN),
        //   3 400 000
        QF: Math.round(13e5 * EUR_PLN),
        //   5 525 000
        SF: Math.round(25e5 * EUR_PLN),
        //  10 625 000
        FINALIST: Math.round(4e6 * EUR_PLN),
        //  17 000 000
        WINNER: Math.round(3e6 * EUR_PLN)
        //  12 750 000
      }
    };
    return prizes[competition]?.[event] ?? 0;
  },
  // Premie dla zawodników i sztabu za osiągnięcia — wypłacane z budżetu klubu
  calculateAchievementBonus: (achievement, reputation, hojnosc) => {
    const BASE_RANGES = {
      CHAMPION: [15e5, 25e5],
      RUNNER_UP: [8e5, 14e5],
      THIRD: [5e5, 9e5],
      FOURTH: [2e5, 5e5],
      PROMOTE_L2_L1: [6e5, 1e6],
      PROMOTE_L3_L2: [2e5, 4e5],
      CUP_WINNER: [7e5, 12e5],
      CUP_FINALIST: [2e5, 5e5],
      CUP_SEMI: [5e4, 15e4]
    };
    const REP_MULTIPLIER = reputation >= 7 ? 3 : reputation >= 4 ? 1.5 : 1;
    const HOJNOSC_MULTIPLIER = {
      bardzo_wysoka: 2,
      wysoka: 1.5,
      przecietna: 1,
      niska: 0.6,
      bardzo_niska: 0.3
    };
    const [min, max] = BASE_RANGES[achievement] ?? [0, 0];
    const base = min + Math.random() * (max - min);
    const hMult = HOJNOSC_MULTIPLIER[hojnosc] ?? 1;
    return Math.floor(base * REP_MULTIPLIER * hMult);
  },
  getSponsorCheckProbability: (avg) => {
    const f = Math.floor(Math.max(1, Math.min(20, avg)));
    if (f >= 20) return 0.5;
    if (f === 19) return 0.4;
    if (f === 18) return 0.35;
    if (f === 17) return 0.3;
    if (f === 16) return 0.25;
    if (f === 15) return 0.2;
    if (f === 14) return 0.15;
    if (f === 13) return 0.1;
    if (f === 12) return 0.05;
    if (f === 11) return 0.035;
    if (f === 10) return 0.025;
    if (f === 9) return 0.018;
    if (f === 8) return 0.012;
    if (f === 7) return 8e-3;
    if (f === 6) return 5e-3;
    if (f === 5) return 3e-3;
    if (f === 4) return 2e-3;
    if (f === 3) return 1e-3;
    if (f === 2) return 5e-4;
    return 2e-4;
  },
  getSponsorAmount: (avg) => {
    const MIN = 1e5;
    const MAX = 1e8;
    const clamped = Math.max(1, Math.min(20, avg));
    const exponent = 0.5 + (20 - clamped) * 0.175;
    const biasedR = Math.pow(Math.random(), exponent);
    const raw = MIN + (MAX - MIN) * biasedR;
    return Math.round(raw / 1e5) * 1e5;
  },
  getOwnerRescueProbability: (hojnosc) => {
    const h = Math.floor(Math.max(1, Math.min(20, hojnosc)));
    if (h >= 18) return 0.9;
    if (h >= 16) return 0.75;
    if (h >= 14) return 0.6;
    if (h >= 12) return 0.45;
    if (h >= 10) return 0.3;
    if (h >= 8) return 0.18;
    if (h >= 6) return 0.1;
    if (h >= 4) return 0.05;
    if (h >= 2) return 0.02;
    return 0.01;
  },
  getOwnerRescueBonus: (hojnosc) => {
    const h = Math.max(1, Math.min(20, hojnosc));
    if (Math.random() >= h / 20) return 0;
    const raw = 1e5 + Math.random() * h * 25e4;
    return Math.round(raw / 1e5) * 1e5;
  }
};

// services/TrainingAttributeRules.ts
var TRAINABLE_PLAYER_ATTRS = [
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
var getTrainableAttributesForPosition = (position) => position === "GK" /* GK */ ? TRAINABLE_PLAYER_ATTRS : TRAINABLE_PLAYER_ATTRS.filter((attr) => attr !== "goalkeeping");

// services/AiWeeklyTrainingService.ts
var DAY_MS = 864e5;
var clamp5 = (value, min, max) => Math.max(min, Math.min(max, value));
var average3 = (values) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};
var dateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
var seededRng = (seed, offset) => {
  const x = Math.sin(seed + offset) * 1e4;
  return x - Math.floor(x);
};
var getAiCoachGrowthMult = (q) => {
  if (q >= 17) return 1.3 + (q - 17) / 3 * 0.2;
  if (q >= 14) return 1 + (q - 14) / 3 * 0.3;
  if (q >= 10) return 0.15 + (q - 10) / 4 * 0.85;
  if (q >= 5) return 0.08 + (q - 5) / 5 * 0.07;
  return Math.max(0.05, 0.05 + (q - 1) / 4 * 0.03);
};
var getAiCoachRegressMult = (q) => {
  if (q >= 14) return Math.max(0.65, 1 - (q - 14) / 6 * 0.35);
  if (q >= 10) return 1 + (14 - q) / 4 * 0.5;
  if (q >= 5) return 1.5 + (10 - q) / 5 * 0.3;
  return Math.min(2.2, 1.8 + (5 - q) / 4 * 0.4);
};
var getWeekKey = (date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const day = Math.floor((dateOnly(date) - dateOnly(start)) / DAY_MS);
  return `${date.getFullYear()}-${Math.floor(day / 7)}`;
};
var getNextFixture = (clubId, currentDate, fixtures2) => {
  const today = dateOnly(currentDate);
  return fixtures2.filter((fixture) => {
    if (fixture.status !== "SCHEDULED" /* SCHEDULED */) return false;
    if (fixture.homeTeamId !== clubId && fixture.awayTeamId !== clubId) return false;
    return dateOnly(new Date(fixture.date)) > today;
  }).sort((left, right) => dateOnly(new Date(left.date)) - dateOnly(new Date(right.date)))[0] ?? null;
};
var isWinterHoliday = (date) => {
  const month = date.getMonth();
  const day = date.getDate();
  return month === 11 && day >= 17 || month === 0 && day <= 2;
};
var isSummerHolidayForClub = (date, clubId, fixtures2) => {
  const month = date.getMonth();
  const day = date.getDate();
  const inSummerVacationWindow = month === 4 || month === 5 && day <= 18;
  if (!inSummerVacationWindow) return false;
  const today = dateOnly(date);
  const vacationEnd = new Date(date.getFullYear(), 5, 18).getTime();
  return !fixtures2.some((fixture) => {
    const fixtureTime = dateOnly(new Date(fixture.date));
    return fixture.status === "SCHEDULED" /* SCHEDULED */ && fixtureTime > today && fixtureTime <= vacationEnd && (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId);
  });
};
var isTrainingHoliday = (date, clubId, fixtures2) => isWinterHoliday(date) || isSummerHolidayForClub(date, clubId, fixtures2);
var pickIntensity = (coach, squad, daysUntilNextMatch, rng) => {
  const avgCondition = average3(squad.map((player) => player.condition));
  const avgFatigueDebt = average3(squad.map((player) => player.fatigueDebt ?? 0));
  const training = coach?.attributes.training ?? 50;
  const discipline = coach?.attributes.decisionMaking ?? 50;
  const experience = coach?.attributes.experience ?? 50;
  const motivation = coach?.attributes.motivation ?? 50;
  if (avgCondition < 74 || avgFatigueDebt > 28 || daysUntilNextMatch !== null && daysUntilNextMatch <= 2) {
    return "LIGHT" /* LIGHT */;
  }
  const recklessPush = clamp5((motivation + training - discipline - experience) / 120, 0, 0.28);
  const heavyChance = clamp5(0.1 + (training - 60) / 160 + recklessPush, 0.04, 0.42);
  if (avgCondition > 82 && avgFatigueDebt < 22 && rng() < heavyChance) {
    return "HEAVY" /* HEAVY */;
  }
  return "NORMAL" /* NORMAL */;
};
var getValidUntil = (currentDate, nextFixture) => {
  const fallback = new Date(dateOnly(currentDate) + 7 * DAY_MS);
  if (!nextFixture) return fallback.toISOString().split("T")[0];
  const nextDate = new Date(nextFixture.date);
  const daysUntil = Math.round((dateOnly(nextDate) - dateOnly(currentDate)) / DAY_MS);
  return (daysUntil <= 10 ? nextDate : fallback).toISOString().split("T")[0];
};
var AiWeeklyTrainingService = {
  processWeeklyTraining: (playersMap, clubs, coaches, userTeamId, currentDate, fixtures2, sessionSeed = 0, staffMembers = {}) => {
    const weekKey = getWeekKey(currentDate);
    const updatedPlayers = { ...playersMap };
    const updatedClubs = clubs.map((club, clubIndex) => {
      if (club.id === userTeamId) return club;
      if (club.aiWeeklyTraining?.weekKey === weekKey) return club;
      const squad = updatedPlayers[club.id] || [];
      if (squad.length === 0 || isTrainingHoliday(currentDate, club.id, fixtures2)) return club;
      const coach = club.coachId ? coaches[club.coachId] ?? null : null;
      const nextFixture = getNextFixture(club.id, currentDate, fixtures2);
      const daysUntilNextMatch = nextFixture ? Math.round((dateOnly(new Date(nextFixture.date)) - dateOnly(currentDate)) / DAY_MS) : null;
      const seed = sessionSeed + currentDate.getTime() / 1e5 + clubIndex * 97 + club.id.length * 13;
      let rngOffset = 1;
      const rng = () => seededRng(seed, rngOffset++);
      const aiStaffMembers = (club.staffIds ?? []).map((id) => staffMembers[id]).filter((s) => !!s);
      const baseStaffQuality = aiStaffMembers.length > 0 ? Math.round(
        aiStaffMembers.reduce((sum, s) => {
          const vals = Object.values(s.attributes);
          return sum + vals.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        }, 0) / aiStaffMembers.length
      ) : 10;
      const noise = Math.round((rng() - 0.5) * 10);
      const aiStaffQ = Math.max(1, Math.min(20, baseStaffQuality + noise));
      const plan = TrainingAssistantService.buildPlan(squad, rng);
      const cycle = findTeamTrainingCycle(plan.cycleId) || getDefaultTeamTrainingCycle();
      const intensity = plan.cycleId === "T_RECOVERY_YOGA" ? "LIGHT" /* LIGHT */ : pickIntensity(coach, squad, daysUntilNextMatch, rng);
      const training = coach?.attributes.training ?? 50;
      const discipline = coach?.attributes.decisionMaking ?? 50;
      const experience = coach?.attributes.experience ?? 50;
      const quality = clamp5((training * 0.42 + discipline * 0.33 + experience * 0.25) / 100, 0.1, 0.99);
      const avgCondition = average3(squad.map((player) => player.condition));
      const avgFatigueDebt = average3(squad.map((player) => player.fatigueDebt ?? 0));
      const overworkRisk = intensity === "HEAVY" /* HEAVY */ ? clamp5(0.62 - quality + (avgFatigueDebt - 20) / 70 + (78 - avgCondition) / 80, 0, 0.4) : 0;
      const overworked = intensity === "HEAVY" /* HEAVY */ && rng() < overworkRisk;
      const fatigueLoad = intensity === "HEAVY" /* HEAVY */ ? overworked ? 10 : 6 : intensity === "LIGHT" /* LIGHT */ ? -7 : 2;
      const conditionDelta = intensity === "HEAVY" /* HEAVY */ ? overworked ? -5 : -2 : intensity === "LIGHT" /* LIGHT */ ? 3 : 0;
      const intensityPrep = intensity === "HEAVY" /* HEAVY */ ? overworked ? -0.01 : 7e-3 : intensity === "LIGHT" /* LIGHT */ ? -2e-3 : 4e-3;
      const freshnessPenalty = avgCondition < 70 || avgFatigueDebt > 34 ? -8e-3 : 0;
      const matchModifier = clamp5(1 + (quality - 0.5) * 0.03 + intensityPrep + freshnessPenalty, 0.97, 1.025);
      const leagueTier = parseInt(club.leagueId?.split("_")[2] || "1") || 1;
      const aiGrowthMult = getAiCoachGrowthMult(aiStaffQ);
      const aiRegressMult = getAiCoachRegressMult(aiStaffQ);
      updatedPlayers[club.id] = squad.map((player) => {
        if (player.health.status === "INJURED" /* INJURED */) return player;
        const playerLoad = fatigueLoad + Math.round((rng() - 0.5) * 2);
        const nextDebt = clamp5((player.fatigueDebt ?? 0) + playerLoad, 0, 100);
        const nextCondition = clamp5(player.condition + conditionDelta - Math.max(0, nextDebt - 75) * 0.05, 1, 100 - nextDebt * 0.15);
        const attributes = { ...player.attributes };
        const stats = { ...player.stats };
        const seasonalChanges = { ...stats.seasonalChanges || {} };
        let seasonalGrowthPoints = PlayerDevelopmentService.getSeasonalGrowthUsed(
          seasonalChanges,
          stats.seasonalGrowthPoints
        );
        const playerTalent = player.attributes.talent;
        getTrainableAttributesForPosition(player.position).forEach((key) => {
          let pGrowth = 4e-3;
          if (cycle.primaryAttributes.includes(key)) pGrowth += 0.035;
          if (cycle.secondaryAttributes.includes(key)) pGrowth += 0.018;
          if (player.age < 21) pGrowth *= 1.5;
          else if (player.age > 32) pGrowth *= 0.3;
          pGrowth *= 0.7 + playerTalent / 100 * 0.6;
          pGrowth *= aiGrowthMult;
          if (rng() < pGrowth) {
            const currentChange = seasonalChanges[key] || 0;
            const growthCap = PlayerDevelopmentService.getSeasonalGrowthCap(player, {
              clubReputation: club.reputation,
              coachQuality: aiStaffQ
            });
            if (seasonalGrowthPoints < growthCap && currentChange < 2 && attributes[key] < 99) {
              attributes[key] += 1;
              seasonalChanges[key] = currentChange + 1;
              seasonalGrowthPoints += 1;
            }
          }
          let pRegress = 3e-3;
          const age = player.age;
          if (age >= 36) pRegress += 0.1;
          else if (age >= 35) pRegress += 0.075;
          else if (age >= 34) pRegress += 0.055;
          else if (age >= 33) pRegress += 0.035;
          else if (age >= 32) pRegress += 0.022;
          else if (age >= 31) pRegress += 0.012;
          else if (age >= 30) pRegress += 6e-3;
          if (["pace", "stamina", "strength"].includes(key)) pRegress *= 1.5;
          if (["vision", "leadership", "mentality", "workRate", "positioning"].includes(key)) pRegress *= 0.55;
          pRegress *= aiRegressMult;
          if (rng() < pRegress) {
            const currentChange = seasonalChanges[key] || 0;
            if (currentChange > -3 && attributes[key] > 10) {
              attributes[key] -= 1;
              seasonalChanges[key] = currentChange - 1;
            }
          }
        });
        const newOvr = PlayerAttributesGenerator.calculateOverall(attributes, player.position);
        const updatedMarketValue = FinanceService.calculateMarketValue(
          { ...player, attributes, overallRating: newOvr },
          club.reputation,
          leagueTier,
          club.country
        );
        return {
          ...player,
          attributes,
          overallRating: newOvr,
          fatigueDebt: Math.round(nextDebt),
          condition: Math.round(nextCondition),
          marketValue: updatedMarketValue,
          stats: { ...player.stats, ratingHistory: player.stats.ratingHistory || [], seasonalChanges, seasonalGrowthPoints }
        };
      });
      return {
        ...club,
        aiWeeklyTraining: {
          weekKey,
          cycleId: plan.cycleId,
          intensity,
          matchModifier,
          fatigueLoad,
          quality: Number(quality.toFixed(3)),
          validUntil: getValidUntil(currentDate, nextFixture)
        }
      };
    });
    return { updatedPlayers, updatedClubs };
  }
};

// services/EuropeanPlayerStatsService.ts
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
var BACKGROUND_STATS_BALANCE_VERSION = 2;
var getPlayedIds = (lineup, history) => {
  const currentOnPitch = lineup.startingXI.filter((id) => !!id);
  const subbedOut = history.map((sub) => sub.playerOutId).filter((id) => !!id && id !== "NONE" && id !== "??");
  return /* @__PURE__ */ new Set([...currentOnPitch, ...subbedOut]);
};
var goalBelongsToPlayer = (goal, player) => {
  const displayName = `${player.firstName.charAt(0)}. ${player.lastName}`;
  return goal.scorerId === player.id || goal.playerId === player.id || goal.playerName === player.lastName || goal.playerName === displayName;
};
var assistBelongsToPlayer = (goal, player) => {
  const displayName = `${player.firstName.charAt(0)}. ${player.lastName}`;
  return goal.assistantId === player.id || goal.assistId === player.id || goal.assistantName === player.lastName || goal.assistantName === displayName;
};
var updateSquadEuroStats = (squad, referenceSquad, playedIds, goalsFor, goalsAgainst, yellowCards, redIds, ratings = {}) => {
  return squad.map((player) => {
    const referencePlayer = referenceSquad.find((p) => p.id === player.id) ?? player;
    const euroStats = { ...player.euroStats ?? emptyStats2() };
    let euroSuspensionMatches = Math.max(0, (player.euroSuspensionMatches ?? 0) - 1);
    if (playedIds.has(player.id)) {
      euroStats.matchesPlayed += 1;
      euroStats.minutesPlayed += 90;
      const rating = ratings[player.id];
      if (typeof rating === "number" && Number.isFinite(rating)) {
        euroStats.ratingHistory = [...euroStats.ratingHistory ?? [], rating];
      }
      if (goalsAgainst === 0 && referencePlayer.position === "GK" /* GK */) {
        euroStats.cleanSheets += 1;
      }
    }
    goalsFor.filter((goal) => !goal.varDisallowed && !goal.isMiss).forEach((goal) => {
      if (goalBelongsToPlayer(goal, referencePlayer)) euroStats.goals += 1;
      if (assistBelongsToPlayer(goal, referencePlayer)) euroStats.assists += 1;
    });
    const yellows = yellowCards[player.id] ?? 0;
    for (let i = 0; i < yellows; i += 1) {
      euroStats.yellowCards += 1;
      if (euroStats.yellowCards % 4 === 0) euroSuspensionMatches += 1;
    }
    if (redIds.includes(player.id)) {
      euroStats.redCards += 1;
      euroSuspensionMatches += 2;
    }
    return { ...player, euroStats, euroSuspensionMatches };
  });
};
var clamp6 = (value, min, max) => Math.max(min, Math.min(max, value));
var hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
};
var rngFromSeed = (seed) => {
  let state2 = seed >>> 0;
  return () => {
    state2 = state2 * 1664525 + 1013904223 >>> 0;
    return state2 / 4294967296;
  };
};
var getBackgroundTargetRounds = (date) => {
  const seasonStartYear = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
  const monthIndex = (date.getFullYear() - seasonStartYear) * 12 + date.getMonth() - 6;
  if (monthIndex < 0) return 0;
  return clamp6(monthIndex * 2 + (date.getDate() >= 15 ? 2 : 1), 0, 34);
};
var getSeasonStartYear = (date) => date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
var getBackgroundProgressKey = (clubId, seasonStartYear) => `europeanLeagueBackground:${clubId}:${seasonStartYear}`;
var getBackgroundCalibrationKey = (clubId, seasonStartYear) => `${getBackgroundProgressKey(clubId, seasonStartYear)}:v${BACKGROUND_STATS_BALANCE_VERSION}`;
var getCurrentBackgroundAppearances = (player, progressKey) => {
  const savedProgress = player.stats?.backgroundLeagueProgress?.[progressKey];
  if (typeof savedProgress === "number" && Number.isFinite(savedProgress)) {
    return Math.max(0, savedProgress);
  }
  return (player.history?.length ?? 0) > 0 ? 0 : Math.max(0, player.stats?.matchesPlayed ?? 0);
};
var getPlayerTargetAppearances = (targetRounds, rank, player) => {
  const ageRotation = player.age <= 21 ? 0.08 : player.age >= 33 ? -0.08 : 0;
  const roleFactor = rank < 11 ? 0.92 : rank < 16 ? 0.68 : rank < 21 ? 0.38 : 0.16;
  return Math.max(0, Math.round(targetRounds * clamp6(roleFactor + ageRotation, 0.08, 0.98)));
};
var getQualityFactor = (player) => clamp6(((player.overallRating ?? 62) - 60) / 30, 0, 1);
var getAttributeEdge = (value) => clamp6((value - 60) / 30, -0.45, 0.9);
var getNormalizedClubReputation = (club) => {
  const reputation = club.reputation ?? 60;
  return reputation <= 25 ? reputation * 5 : reputation;
};
var getReputationFactor = (club) => clamp6((getNormalizedClubReputation(club) - 60) / 45, -0.45, 0.55);
var getMinutesFactor = (minutes) => clamp6(minutes / 90, 0.38, 1);
var getRateControlMultiplier = (currentCount, appearances, targetRate) => {
  if (appearances < 4 || targetRate <= 0) return 1;
  const currentRate = currentCount / appearances;
  if (currentRate <= targetRate * 0.72) return 1.12;
  if (currentRate <= targetRate * 1.12) return 1;
  if (currentRate <= targetRate * 1.42) return 0.65;
  return 0.35;
};
var getGoalTargetRate = (player, club) => {
  const quality = getQualityFactor(player);
  const finishingEdge = getAttributeEdge(((player.attributes.attacking ?? 50) + (player.attributes.finishing ?? 50)) / 2);
  const reputation = getReputationFactor(club);
  if (player.position === "FWD" /* FWD */) {
    return clamp6(0.18 + quality * 0.16 + finishingEdge * 0.1 + reputation * 0.04, 0.14, 0.52);
  }
  if (player.position === "MID" /* MID */) {
    return clamp6(0.045 + quality * 0.045 + finishingEdge * 0.045 + reputation * 0.012, 0.025, 0.16);
  }
  if (player.position === "DEF" /* DEF */) {
    const headingEdge = getAttributeEdge(player.attributes.heading ?? 50);
    return clamp6(0.012 + quality * 0.014 + headingEdge * 0.018 + reputation * 6e-3, 4e-3, 0.065);
  }
  return 15e-4;
};
var getAssistTargetRate = (player, club) => {
  const quality = getQualityFactor(player);
  const creationEdge = getAttributeEdge(
    ((player.attributes.passing ?? 50) + (player.attributes.vision ?? 50) + (player.attributes.crossing ?? 50)) / 3
  );
  const reputation = getReputationFactor(club);
  if (player.position === "MID" /* MID */) {
    return clamp6(0.085 + quality * 0.075 + creationEdge * 0.075 + reputation * 0.025, 0.045, 0.27);
  }
  if (player.position === "FWD" /* FWD */) {
    return clamp6(0.055 + quality * 0.045 + creationEdge * 0.055 + reputation * 0.016, 0.03, 0.18);
  }
  if (player.position === "DEF" /* DEF */) {
    return clamp6(0.025 + quality * 0.025 + creationEdge * 0.025 + reputation * 0.01, 0.012, 0.09);
  }
  return 15e-4;
};
var getBackgroundRating = (player, club, round, seedBase, outcome) => {
  const rng = rngFromSeed(hashString(`${club.id}_${player.id}_${round}_${seedBase}_rating`));
  const quality = ((player.overallRating ?? 62) - 62) * 0.024;
  const reputation = (getNormalizedClubReputation(club) - 60) * 6e-3;
  const morale = ((player.morale ?? 50) - 50) * 7e-3;
  const noise = (rng() - 0.5) * 0.72;
  const minutesAdjustment = outcome.minutes >= 75 ? 0 : outcome.minutes >= 45 ? -0.08 : -0.18;
  const goalBonus = player.position === "FWD" /* FWD */ ? 0.44 : player.position === "MID" /* MID */ ? 0.52 : player.position === "DEF" /* DEF */ ? 0.66 : 0.3;
  const assistBonus = player.position === "FWD" /* FWD */ ? 0.28 : player.position === "MID" /* MID */ ? 0.36 : player.position === "DEF" /* DEF */ ? 0.42 : 0.18;
  const defensiveBonus = outcome.cleanSheet ? player.position === "GK" /* GK */ ? 0.38 : player.position === "DEF" /* DEF */ ? 0.24 : 0.04 : 0;
  const disciplinePenalty = (outcome.yellowCard ? 0.18 : 0) + (outcome.redCard ? 1.25 : 0);
  return Number(clamp6(
    6.55 + quality + reputation + morale + noise + minutesAdjustment + (outcome.scored ? goalBonus : 0) + (outcome.assisted ? assistBonus : 0) + defensiveBonus - disciplinePenalty,
    5.4,
    8.8
  ).toFixed(1));
};
var generateBackgroundAppearanceOutcome = (player, club, round, seedBase, statsBeforeAppearance) => {
  const rng = rngFromSeed(hashString(`${club.id}_${player.id}_${round}_${seedBase}_league`));
  const minutes = player.position === "GK" /* GK */ || rng() > 0.22 ? 90 : 25 + Math.floor(rng() * 35);
  const minutesFactor = getMinutesFactor(minutes);
  const goalTargetRate = getGoalTargetRate(player, club);
  const assistTargetRate = getAssistTargetRate(player, club);
  const goalChance = clamp6(
    goalTargetRate * minutesFactor * getRateControlMultiplier(statsBeforeAppearance.goals, statsBeforeAppearance.matchesPlayed, goalTargetRate),
    0,
    0.56
  );
  const assistChance = clamp6(
    assistTargetRate * minutesFactor * getRateControlMultiplier(statsBeforeAppearance.assists, statsBeforeAppearance.matchesPlayed, assistTargetRate),
    0,
    0.32
  );
  return {
    minutes,
    scored: rng() < goalChance,
    assisted: rng() < assistChance,
    yellowCard: rng() < 0.09,
    redCard: rng() < 5e-3,
    cleanSheet: player.position === "GK" /* GK */ && rng() < clamp6(0.16 + getNormalizedClubReputation(club) / 520, 0.16, 0.35)
  };
};
var addBackgroundAppearance = (player, club, round, seedBase) => {
  if (player.health?.status === "INJURED" /* INJURED */) return player;
  const stats = { ...player.stats ?? emptyStats2(), ratingHistory: [...player.stats?.ratingHistory ?? []] };
  const outcome = generateBackgroundAppearanceOutcome(player, club, round, seedBase, stats);
  stats.matchesPlayed += 1;
  stats.minutesPlayed += outcome.minutes;
  if (outcome.scored) stats.goals += 1;
  if (outcome.assisted) stats.assists += 1;
  if (outcome.yellowCard) stats.yellowCards += 1;
  if (outcome.redCard) stats.redCards += 1;
  if (outcome.cleanSheet) stats.cleanSheets += 1;
  stats.ratingHistory.push(getBackgroundRating(player, club, round, seedBase, outcome));
  return { ...player, stats };
};
var rebalanceExistingBackgroundStats = (player, club, appearances, seasonStartYear, seedBase) => {
  const calibrationKey = getBackgroundCalibrationKey(club.id, seasonStartYear);
  const currentCalibrationVersion = player.stats?.backgroundLeagueCalibration?.[calibrationKey];
  if (currentCalibrationVersion === BACKGROUND_STATS_BALANCE_VERSION || appearances <= 0) {
    return player;
  }
  let calibratedStats = {
    ...player.stats ?? emptyStats2(),
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 0,
    minutesPlayed: 0,
    ratingHistory: []
  };
  for (let round = 0; round < appearances; round += 1) {
    const outcome = generateBackgroundAppearanceOutcome(player, club, round, seedBase, calibratedStats);
    calibratedStats.matchesPlayed += 1;
    calibratedStats.minutesPlayed += outcome.minutes;
    if (outcome.scored) calibratedStats.goals += 1;
    if (outcome.assisted) calibratedStats.assists += 1;
    if (outcome.yellowCard) calibratedStats.yellowCards += 1;
    if (outcome.redCard) calibratedStats.redCards += 1;
    if (outcome.cleanSheet) calibratedStats.cleanSheets += 1;
    calibratedStats.ratingHistory.push(getBackgroundRating(player, club, round, seedBase, outcome));
  }
  calibratedStats = {
    ...calibratedStats,
    backgroundLeagueProgress: {
      ...player.stats?.backgroundLeagueProgress ?? {},
      [getBackgroundProgressKey(club.id, seasonStartYear)]: appearances
    },
    backgroundLeagueCalibration: {
      ...player.stats?.backgroundLeagueCalibration ?? {},
      [calibrationKey]: BACKGROUND_STATS_BALANCE_VERSION
    }
  };
  return { ...player, stats: calibratedStats };
};
var applyBackgroundLeagueStatsToSquad = (squad, club, date, seedBase) => {
  const targetRounds = getBackgroundTargetRounds(date);
  if (targetRounds <= 0) return squad.map((player) => PlayerFormService.withUpdatedForm(player));
  const seasonStartYear = getSeasonStartYear(date);
  const progressKey = getBackgroundProgressKey(club.id, seasonStartYear);
  const rankByPlayerId = new Map(
    [...squad].sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0)).map((player, rank) => [player.id, rank])
  );
  return squad.map((player) => {
    const rank = rankByPlayerId.get(player.id) ?? 0;
    const targetAppearances = getPlayerTargetAppearances(targetRounds, rank, player);
    const currentAppearances = getCurrentBackgroundAppearances(player, progressKey);
    let updated = rebalanceExistingBackgroundStats(player, club, currentAppearances, seasonStartYear, seedBase);
    for (let round = currentAppearances; round < targetAppearances; round += 1) {
      updated = addBackgroundAppearance(updated, club, round, seedBase);
    }
    if (targetAppearances > currentAppearances) {
      updated = {
        ...updated,
        stats: {
          ...updated.stats,
          backgroundLeagueProgress: {
            ...updated.stats?.backgroundLeagueProgress ?? {},
            [progressKey]: targetAppearances
          },
          backgroundLeagueCalibration: {
            ...updated.stats?.backgroundLeagueCalibration ?? {},
            [getBackgroundCalibrationKey(club.id, seasonStartYear)]: BACKGROUND_STATS_BALANCE_VERSION
          }
        }
      };
    }
    return PlayerFormService.withUpdatedForm(updated);
  });
};
var EuropeanPlayerStatsService = {
  applyBackgroundLeagueStatsToDate: (squad, club, date, seedBase = 0) => applyBackgroundLeagueStatsToSquad(squad, club, date, seedBase),
  applyMatchStats: (players, matchState, homeClubId, awayClubId, homePlayers, awayPlayers, ratings = {}) => {
    const playedIdsHome = getPlayedIds(matchState.homeLineup, matchState.homeSubsHistory);
    const playedIdsAway = getPlayedIds(matchState.awayLineup, matchState.awaySubsHistory);
    return {
      ...players,
      [homeClubId]: updateSquadEuroStats(
        players[homeClubId] ?? [],
        homePlayers,
        playedIdsHome,
        matchState.homeGoals,
        matchState.awayScore,
        matchState.playerYellowCards,
        matchState.sentOffIds,
        ratings
      ),
      [awayClubId]: updateSquadEuroStats(
        players[awayClubId] ?? [],
        awayPlayers,
        playedIdsAway,
        matchState.awayGoals,
        matchState.homeScore,
        matchState.playerYellowCards,
        matchState.sentOffIds,
        ratings
      )
    };
  }
};

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

// services/ManagerExperienceService.ts
var MIN_EXP_POINTS = 1;
function dateKey(date) {
  const parsed2 = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed2.getTime())) return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return parsed2.toISOString().split("T")[0];
}
function getExperienceRating(expPoints) {
  const safePoints = Math.max(MIN_EXP_POINTS, expPoints);
  const rating = 1 + 98 * (1 - Math.exp(-safePoints / 1500));
  return Math.max(1, Math.min(99, Math.round(rating)));
}
function getPointsForRoundedRatingBoundary(ratingBoundary) {
  const raw = Math.max(1, Math.min(98.99, ratingBoundary));
  return Math.ceil(-1500 * Math.log(1 - (raw - 1) / 98));
}
function getExperienceProgress(expPoints) {
  const currentPoints = Math.max(MIN_EXP_POINTS, expPoints);
  const rating = getExperienceRating(currentPoints);
  if (rating >= 99) {
    return {
      rating,
      currentPoints,
      nextRating: null,
      nextRatingPoints: null,
      pointsToNext: 0,
      progressPercent: 100
    };
  }
  const currentRatingStart = getPointsForRoundedRatingBoundary(Math.max(1, rating - 0.5));
  const nextRatingPoints = getPointsForRoundedRatingBoundary(rating + 0.5);
  const span = Math.max(1, nextRatingPoints - currentRatingStart);
  const progressPercent = Math.max(0, Math.min(100, (currentPoints - currentRatingStart) / span * 100));
  return {
    rating,
    currentPoints,
    nextRating: rating + 1,
    nextRatingPoints,
    pointsToNext: Math.max(0, nextRatingPoints - currentPoints),
    progressPercent
  };
}
function buildPromotionAchievementFromExp(entry) {
  if (!entry.sourceKey.startsWith("season:") || !entry.sourceKey.includes(":promotion:")) return null;
  if (entry.label !== "Awans do Ekstraklasy" && entry.label !== "Awans do 1. Ligi") return null;
  const parts = entry.sourceKey.split(":");
  const seasonLabel = parts[1] || String(entry.season);
  const clubId = parts[3] || "club";
  const promotedToEkstraklasa = entry.label === "Awans do Ekstraklasy";
  return {
    id: `achievement:${seasonLabel}:promotion-${promotedToEkstraklasa ? "ekstraklasa" : "1liga"}:${clubId}`,
    seasonLabel,
    title: `${entry.label} ${seasonLabel}`,
    competition: "Liga Polska"
  };
}
function backfillAchievementsFromExpHistory(profile) {
  const existingIds = new Set(profile.achievements.map((entry) => entry.id));
  const backfilled = [];
  profile.expHistory.forEach((entry) => {
    const achievement = buildPromotionAchievementFromExp(entry);
    if (!achievement || existingIds.has(achievement.id)) return;
    existingIds.add(achievement.id);
    backfilled.push(achievement);
  });
  return backfilled.length > 0 ? [...backfilled, ...profile.achievements] : profile.achievements;
}
function ensureManagerExperience(profile) {
  if (!profile) return null;
  const expPoints = Math.max(MIN_EXP_POINTS, Number.isFinite(profile.expPoints) ? profile.expPoints : MIN_EXP_POINTS);
  const safeProfile = {
    ...profile,
    expPoints,
    experience: Number.isFinite(profile.experience) ? profile.experience : getExperienceRating(expPoints),
    expHistory: Array.isArray(profile.expHistory) ? profile.expHistory : [],
    careerHistory: Array.isArray(profile.careerHistory) ? profile.careerHistory : [],
    achievements: Array.isArray(profile.achievements) ? profile.achievements : []
  };
  return {
    ...safeProfile,
    achievements: backfillAchievementsFromExpHistory(safeProfile)
  };
}
function applyExpAwards(profile, awards) {
  const safeProfile = ensureManagerExperience(profile);
  if (!safeProfile || awards.length === 0) return safeProfile;
  const existingKeys = new Set(safeProfile.expHistory.map((entry) => entry.sourceKey));
  let expPoints = safeProfile.expPoints;
  const newEntries = [];
  awards.forEach((award) => {
    if (existingKeys.has(award.sourceKey) || award.delta === 0) return;
    existingKeys.add(award.sourceKey);
    expPoints = Math.max(MIN_EXP_POINTS, expPoints + award.delta);
    newEntries.push({
      id: `${award.sourceKey}_${dateKey(award.date)}`,
      sourceKey: award.sourceKey,
      date: dateKey(award.date),
      season: award.season,
      delta: award.delta,
      totalAfter: expPoints,
      competition: award.competition,
      label: award.label
    });
  });
  if (newEntries.length === 0) return safeProfile;
  return {
    ...safeProfile,
    expPoints,
    experience: getExperienceRating(expPoints),
    expHistory: [...newEntries, ...safeProfile.expHistory].slice(0, 250)
  };
}
function addCareerSeason(profile, season) {
  const safeProfile = ensureManagerExperience(profile);
  if (!safeProfile) return null;
  if (safeProfile.careerHistory.some((entry) => entry.id === season.id)) return safeProfile;
  return {
    ...safeProfile,
    careerHistory: [season, ...safeProfile.careerHistory].slice(0, 50)
  };
}
function addAchievements(profile, achievements) {
  const safeProfile = ensureManagerExperience(profile);
  if (!safeProfile || achievements.length === 0) return safeProfile;
  const existingIds = new Set(safeProfile.achievements.map((entry) => entry.id));
  const unique = achievements.filter((achievement) => {
    if (existingIds.has(achievement.id)) return false;
    existingIds.add(achievement.id);
    return true;
  });
  if (unique.length === 0) return safeProfile;
  return {
    ...safeProfile,
    achievements: [...unique, ...safeProfile.achievements].slice(0, 100)
  };
}
function winnerFromFixture(fixture) {
  const homeScore = fixture.homeScore ?? 0;
  const awayScore = fixture.awayScore ?? 0;
  if (homeScore > awayScore) return fixture.homeTeamId;
  if (awayScore > homeScore) return fixture.awayTeamId;
  if (fixture.homePenaltyScore !== void 0 || fixture.awayPenaltyScore !== void 0) {
    const homePens = fixture.homePenaltyScore ?? 0;
    const awayPens = fixture.awayPenaltyScore ?? 0;
    if (homePens > awayPens) return fixture.homeTeamId;
    if (awayPens > homePens) return fixture.awayTeamId;
  }
  return null;
}
function getPolishLeagueResultExp(competitionId, winnerId, userTeamId) {
  if (winnerId && winnerId !== userTeamId) return -1;
  const isDraw = winnerId === null;
  if (competitionId === "L_PL_1") return isDraw ? 2.5 : 3.5;
  if (competitionId === "L_PL_2") return isDraw ? 1.5 : 2.5;
  if (competitionId === "L_PL_3") return isDraw ? 0.5 : 1.5;
  return isDraw ? 0.5 : 1;
}
function buildDomesticMatchAward(fixture, userTeamId, currentDate, season) {
  if (fixture.status !== "FINISHED" /* FINISHED */) return null;
  if (fixture.homeTeamId !== userTeamId && fixture.awayTeamId !== userTeamId) return null;
  const competitionId = String(fixture.leagueId);
  const isPolishLeague = competitionId.startsWith("L_PL_");
  const isPolishCup = fixture.leagueId === "POLISH_CUP" /* POLISH_CUP */;
  if (!isPolishLeague && !isPolishCup) return null;
  const winnerId = winnerFromFixture(fixture);
  const delta = isPolishLeague ? getPolishLeagueResultExp(competitionId, winnerId, userTeamId) : winnerId === userTeamId ? 2 : winnerId === null ? 1 : -1;
  const resultLabel = winnerId === userTeamId ? "Zwyci\u0119stwo" : winnerId === null ? "Remis" : "Pora\u017Cka";
  const competition = isPolishCup ? "Puchar Polski" : "Liga Polska";
  return {
    sourceKey: `match:${fixture.id}`,
    date: currentDate,
    season,
    delta,
    competition,
    label: `${resultLabel} - ${competition}`
  };
}
function promotionExpForReputation(reputation) {
  const normalized = Math.max(0, Math.min(1, (reputation - 1) / 9));
  return Math.round(20 - normalized * 10);
}
function getEuropeanCompetitionCode(leagueId) {
  if (leagueId.startsWith("CL_")) return "CL";
  if (leagueId.startsWith("EL_")) return "EL";
  if (leagueId.startsWith("CONF_")) return "CONF";
  return null;
}
function reputationScaledPoints(reputation, min, max) {
  const normalized = Math.max(0, Math.min(1, (reputation - 1) / 9));
  return Math.round(min + normalized * (max - min));
}
function getEuropeanCompetitionName(comp) {
  if (comp === "CL") return "Liga Mistrz\xF3w";
  if (comp === "EL") return "Liga Europy";
  return "Liga Konferencji";
}
function buildEuropeanMatchAward(fixture, userTeamId, currentDate, season, clubs) {
  if (fixture.status !== "FINISHED" /* FINISHED */) return null;
  if (fixture.homeTeamId !== userTeamId && fixture.awayTeamId !== userTeamId) return null;
  const comp = getEuropeanCompetitionCode(String(fixture.leagueId));
  if (!comp) return null;
  const userIsHome = fixture.homeTeamId === userTeamId;
  const userScore = userIsHome ? fixture.homeScore ?? 0 : fixture.awayScore ?? 0;
  const opponentScore = userIsHome ? fixture.awayScore ?? 0 : fixture.homeScore ?? 0;
  if (userScore < opponentScore) return null;
  const opponentId = userIsHome ? fixture.awayTeamId : fixture.homeTeamId;
  const opponentReputation = clubs.find((club) => club.id === opponentId)?.reputation ?? 5;
  const delta = (() => {
    if (comp === "CL") {
      return userScore > opponentScore ? reputationScaledPoints(opponentReputation, 5, 10) : reputationScaledPoints(opponentReputation, 3, 5);
    }
    if (comp === "EL") return userScore > opponentScore ? 4 : 2;
    return userScore > opponentScore ? 3 : 1;
  })();
  return {
    sourceKey: `euro-match:${fixture.id}`,
    date: currentDate,
    season,
    delta,
    competition: getEuropeanCompetitionName(comp),
    label: `${userScore > opponentScore ? "Zwyci\u0119stwo" : "Remis"} - ${getEuropeanCompetitionName(comp)}`
  };
}
function buildEuropeanProgressAward(sourceKey, comp, stage, date, season) {
  const deltaByComp = {
    CL: { GROUP_ENTRY: 15, GROUP_EXIT: 30, NEXT_ROUND: 25, FINAL: 50, WINNER: 200 },
    EL: { GROUP_ENTRY: 10, GROUP_EXIT: 20, NEXT_ROUND: 15, FINAL: 35, WINNER: 120 },
    CONF: { GROUP_ENTRY: 8, GROUP_EXIT: 18, NEXT_ROUND: 13, FINAL: 33, WINNER: 100 }
  };
  const stageLabel = {
    GROUP_ENTRY: "Awans do fazy grupowej",
    GROUP_EXIT: "Wyj\u015Bcie z grupy",
    NEXT_ROUND: "Awans do kolejnej rundy",
    FINAL: "Awans do fina\u0142u",
    WINNER: "Zwyci\u0119stwo w finale"
  };
  return {
    sourceKey,
    date,
    season,
    delta: deltaByComp[comp][stage],
    competition: getEuropeanCompetitionName(comp),
    label: `${stageLabel[stage]} - ${getEuropeanCompetitionName(comp)}`
  };
}
var ManagerExperienceService = {
  addAchievements,
  addCareerSeason,
  applyExpAwards,
  buildDomesticMatchAward,
  buildEuropeanMatchAward,
  buildEuropeanProgressAward,
  ensureManagerExperience,
  getExperienceProgress,
  getEuropeanCompetitionCode,
  getEuropeanCompetitionName,
  getExperienceRating,
  promotionExpForReputation
};

// services/SaveGameService.ts
var SAVE_VERSION = "4.0";
var DEFAULT_START_DATE = /* @__PURE__ */ new Date("2025-07-01");
function asArray(value) {
  return Array.isArray(value) ? value : [];
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function asDate(value, fallback = DEFAULT_START_DATE) {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value === "string") {
    const parsed2 = new Date(value);
    if (!isNaN(parsed2.getTime())) return parsed2;
  }
  return fallback;
}
function asDateString(value, fallback = "") {
  if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString();
  if (typeof value === "string") return value;
  return fallback;
}
function asDateOnlyString(value, fallback = "") {
  if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString().split("T")[0];
  if (typeof value === "string") return value.includes("T") ? value.split("T")[0] : value;
  return fallback;
}
function asPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function asClampedRating(value) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.min(99, value)) : void 0;
}
function normalizePlayerClubAdaptation(value, playerClubId) {
  if (value === void 0) return void 0;
  if (value === null || !value || typeof value !== "object") return null;
  const adaptation = value;
  const clubId = typeof adaptation.clubId === "string" ? adaptation.clubId : "";
  const startedAt = asDateOnlyString(adaptation.startedAt);
  const lastUpdatedAt = asDateOnlyString(adaptation.lastUpdatedAt, startedAt);
  const durationDays = typeof adaptation.durationDays === "number" ? adaptation.durationDays : Number.NaN;
  const initialLevel = typeof adaptation.initialLevel === "number" ? adaptation.initialLevel : Number.NaN;
  const level = typeof adaptation.level === "number" ? adaptation.level : Number.NaN;
  if (!clubId || clubId !== playerClubId || !startedAt || !lastUpdatedAt || !/^\d{4}-\d{2}-\d{2}$/.test(startedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(lastUpdatedAt) || !Number.isFinite(durationDays) || !Number.isFinite(initialLevel) || !Number.isFinite(level)) {
    return null;
  }
  return {
    clubId,
    startedAt,
    lastUpdatedAt,
    durationDays: Math.max(1, Math.round(durationDays)),
    initialLevel: Math.max(0, Math.min(100, initialLevel)),
    level: Math.max(0, Math.min(100, level))
  };
}
function normalizeFixture(fixture) {
  if (!fixture || typeof fixture !== "object") return fixture;
  return {
    ...fixture,
    date: asDate(fixture.date)
  };
}
function normalizeDraw(draw) {
  if (!draw || typeof draw !== "object") return draw ?? null;
  return {
    ...draw,
    date: asDate(draw.date),
    pairs: Array.isArray(draw.pairs) ? draw.pairs.map(normalizeFixture) : draw.pairs
  };
}
function normalizeNationsLeagueState(state2) {
  if (!state2 || typeof state2 !== "object") return null;
  return {
    ...state2,
    groups: asArray(state2.groups).map((group) => ({
      ...group,
      teams: asArray(group?.teams),
      standings: asArray(group?.standings)
    })),
    fixtures: asArray(state2.fixtures),
    playoffs: asArray(state2.playoffs),
    quarterFinalists: asArray(state2.quarterFinalists),
    semiFinalists: asArray(state2.semiFinalists),
    finals: state2.finals ? {
      ...state2.finals,
      semiFinalists: asArray(state2.finals.semiFinalists),
      finalists: asArray(state2.finals.finalists),
      thirdPlaceTeams: asArray(state2.finals.thirdPlaceTeams)
    } : null,
    completed: state2.completed ?? false
  };
}
function normalizeEuroQualifiersState(state2) {
  if (!state2 || typeof state2 !== "object") return null;
  return {
    ...state2,
    groups: asArray(state2.groups).map((group) => ({
      ...group,
      teams: asArray(group?.teams),
      hostTeams: asArray(group?.hostTeams),
      standings: asArray(group?.standings)
    })),
    fixtures: asArray(state2.fixtures),
    playoffPaths: asArray(state2.playoffPaths).map((path) => ({
      ...path,
      teams: asArray(path?.teams),
      semiFinalFixtureIds: asArray(path?.semiFinalFixtureIds),
      tieFixtureIds: path?.tieFixtureIds ? asArray(path.tieFixtureIds) : void 0
    })),
    hostTeams: asArray(state2.hostTeams),
    qualifiedTeams: asArray(state2.qualifiedTeams),
    directQualifiers: asArray(state2.directQualifiers),
    hostReservedQualifiers: asArray(state2.hostReservedQualifiers),
    playoffTeams: asArray(state2.playoffTeams),
    drawCompleted: state2.drawCompleted ?? false,
    completed: state2.completed ?? false
  };
}
function normalizeTournamentState(state2) {
  if (!state2 || typeof state2 !== "object") return null;
  return {
    ...state2,
    teams: asArray(state2.teams),
    groups: asArray(state2.groups).map((group) => ({
      ...group,
      teams: asArray(group?.teams),
      matches: asArray(group?.matches)
    })),
    knockoutMatches: asArray(state2.knockoutMatches),
    playerEffects: asArray(state2.playerEffects),
    groupStageComplete: state2.groupStageComplete ?? false,
    knockoutComplete: state2.knockoutComplete ?? false
  };
}
function normalizeNTMatchResults(results) {
  return results == null ? null : asArray(results);
}
function normalizeSeasonTemplate(template) {
  if (!template || typeof template !== "object") return null;
  return {
    ...template,
    careerStartDate: asDate(template.careerStartDate),
    slots: asArray(template.slots).map((slot) => ({
      ...slot,
      start: asDate(slot.start),
      end: asDate(slot.end)
    }))
  };
}
function normalizeLeagueSchedules(schedules) {
  return Object.fromEntries(
    Object.entries(asRecord(schedules)).map(([key, schedule]) => [
      key,
      {
        ...schedule,
        matchdays: asArray(schedule?.matchdays).map((matchday) => ({
          ...matchday,
          start: asDate(matchday.start),
          end: asDate(matchday.end),
          fixtures: asArray(matchday.fixtures).map(normalizeFixture)
        }))
      }
    ])
  );
}
function normalizeMessages(messages) {
  return asArray(messages).map((message) => ({
    ...message,
    date: asDate(message?.date)
  }));
}
function normalizeAcademyState(academy, currentDate) {
  if (!academy || typeof academy !== "object") return null;
  const dateOnly2 = currentDate.toISOString().split("T")[0];
  const legacyCandidates = asArray(academy.youthPlayers).filter((player) => player?.contractSigned === false);
  const existingCandidates = asArray(academy.scoutingCandidates);
  const candidateIds = new Set(existingCandidates.map((candidate) => candidate?.id));
  const migratedCandidates = legacyCandidates.filter((candidate) => !candidateIds.has(candidate?.id)).map((candidate) => {
    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 14);
    const attributeEstimates = Object.fromEntries(
      Object.entries(candidate.attributes ?? {}).map(([key, value]) => {
        const rating = typeof value === "number" ? value : 1;
        return [key, { min: Math.max(1, rating - 8), max: Math.min(100, rating + 8) }];
      })
    );
    return {
      ...candidate,
      sourceMissionId: `LEGACY_${candidate.id}`,
      scoutId: "LEGACY_SCOUT",
      discoveredDate: dateOnly2,
      decisionDeadline: deadline.toISOString().split("T")[0],
      scoutReport: {
        scoutName: "Archiwalny raport",
        confidence: "LOW",
        talentRating: candidate.revealedTalentRating,
        attributeEstimates,
        recommendation: "OBSERVE"
      }
    };
  });
  const activeMissions = asArray(academy.activeMissions).map((mission) => ({
    ...mission,
    startedDate: asDateOnlyString(mission.startedDate, dateOnly2)
  }));
  const currentYear = currentDate.getFullYear();
  const annualIntakeAvailableYear = academy.annualIntakeAvailableYear ?? (currentDate.getMonth() >= 7 && (academy.lastIntakeYear ?? 0) < currentYear && !activeMissions.some((mission) => mission?.isAnnualIntake) ? currentYear : void 0);
  return {
    ...academy,
    youthPlayers: asArray(academy.youthPlayers).filter((player) => player?.contractSigned !== false),
    scoutingCandidates: [...existingCandidates, ...migratedCandidates],
    scoutingHistory: asArray(academy.scoutingHistory),
    activeMissions,
    annualIntakeAvailableYear
  };
}
function normalizeClubManagementSource(club) {
  const management = club?.management;
  if (!management || typeof management !== "object" || Array.isArray(management)) return club;
  const { sportingDirector: legacySportingDirector, ...managementWithoutSportingDirector } = management;
  return {
    ...club,
    sportingDirector: club.sportingDirector ?? legacySportingDirector,
    management: managementWithoutSportingDirector
  };
}
function getBoardSignatoryForRole(club, templateRole) {
  const formatName = (person) => person?.firstName && person?.lastName ? `${person.firstName} ${person.lastName}` : null;
  if (templateRole === "Prezes Zarz\u0105du") {
    const ceoName = formatName(club?.management?.ceo);
    if (ceoName) return { name: ceoName, role: "Prezes Zarz\u0105du" };
    const ownerName = formatName(club?.management?.owner);
    if (ownerName) return { name: ownerName, role: "W\u0142a\u015Bciciel" };
  }
  if (templateRole === "Dyrektor Sportowy") {
    const sportingDirectorName = formatName(club?.sportingDirector);
    if (sportingDirectorName) return { name: sportingDirectorName, role: "Dyrektor Sportowy" };
  }
  if (templateRole === "W\u0142a\u015Bciciel Klubu") {
    const ownerName = formatName(club?.management?.owner);
    if (ownerName) return { name: ownerName, role: "W\u0142a\u015Bciciel" };
  }
  return null;
}
function migrateWelcomeMailSignatories(messages, clubs, userTeamId) {
  const userClub = clubs.find((club) => club?.id === userTeamId);
  if (!userClub?.name) return messages;
  const escapedClubName = String(userClub.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const legacySignatures = [
    { name: "Wojciech Marcin Jankowski", role: "Prezes Zarz\u0105du" },
    { name: "Marcin Wi\u015Bniewski", role: "Prezes Zarz\u0105du" },
    { name: "Tomasz Adamski", role: "Prezes Zarz\u0105du" },
    { name: "Pawe\u0142 Nowak", role: "Dyrektor Sportowy" },
    { name: "Krzysztof Mazurek", role: "Dyrektor Sportowy" },
    { name: "Andrzej Karpowicz", role: "W\u0142a\u015Bciciel" }
  ];
  return messages.map((message) => {
    if (!String(message?.id ?? "").startsWith("WELCOME_MAIL_") || typeof message?.body !== "string") {
      return message;
    }
    const legacy = legacySignatures.find(
      (signature) => message.body.includes(`${signature.name}
${signature.role}, ${userClub.name}`)
    );
    const signatory = getBoardSignatoryForRole(userClub, message.role) ?? (legacy ? getBoardSignatoryForRole(userClub, legacy.role) : null);
    if (!signatory) return message;
    const body = message.body.replace(
      new RegExp(`Z powa\u017Caniem,\\n[^\\n]+\\n[^\\n]+, ${escapedClubName}`),
      `Z powa\u017Caniem,
${signatory.name}
${signatory.role}, ${userClub.name}`
    );
    if (body === message.body && message.role === signatory.role) return message;
    return {
      ...message,
      role: signatory.role,
      body
    };
  });
}
function normalizeMatchHistory(matchHistory) {
  return asArray(matchHistory).map((match) => ({
    ...match,
    date: asDateString(match?.date),
    goals: asArray(match?.goals),
    cards: asArray(match?.cards)
  }));
}
function reconcileCupStatsFromHistory(players, matchHistory) {
  const cupCompetitions = /* @__PURE__ */ new Set(["POLISH_CUP", "SUPER_CUP"]);
  const playerCupTotals = /* @__PURE__ */ new Map();
  const ensureTotals = (playerId) => {
    if (!playerCupTotals.has(playerId)) playerCupTotals.set(playerId, { goals: 0, assists: 0 });
    return playerCupTotals.get(playerId);
  };
  (matchHistory || []).forEach((match) => {
    if (!cupCompetitions.has(String(match?.competition || ""))) return;
    (match.goals || []).forEach((goal) => {
      const scorerId = goal.playerId || goal.scorerId;
      if (scorerId) ensureTotals(scorerId).goals += 1;
      if (goal.assistantId) ensureTotals(goal.assistantId).assists += 1;
    });
  });
  if (playerCupTotals.size === 0) return players;
  return Object.fromEntries(
    Object.entries(players).map(([clubId, squad]) => [
      clubId,
      (squad || []).map((player) => {
        const totals = playerCupTotals.get(player.id);
        if (!totals) return player;
        const currentCup = player.cupStats ?? {
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          cleanSheets: 0,
          matchesPlayed: 0,
          minutesPlayed: 0,
          seasonalChanges: {},
          ratingHistory: []
        };
        return {
          ...player,
          cupStats: {
            ...currentCup,
            goals: Math.max(currentCup.goals ?? 0, totals.goals),
            assists: Math.max(currentCup.assists ?? 0, totals.assists)
          }
        };
      })
    ])
  );
}
var emptyPlayerStats = () => ({
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
function reconcileFriendlyStatsFromHistory(players, matchHistory, seasonNumber) {
  const playerFriendlyTotals = /* @__PURE__ */ new Map();
  const ensureTotals = (playerId) => {
    if (!playerFriendlyTotals.has(playerId)) playerFriendlyTotals.set(playerId, emptyPlayerStats());
    return playerFriendlyTotals.get(playerId);
  };
  (matchHistory || []).forEach((match) => {
    if (String(match?.competition || "") !== "FRIENDLY") return;
    if (Number(match?.season) !== seasonNumber) return;
    const homePlayedIds = /* @__PURE__ */ new Set([
      ...asArray(match.homeLineup).filter(Boolean),
      ...asArray(match.substitutions).filter((sub) => sub?.teamId === match.homeTeamId).map((sub) => sub.playerInId).filter(Boolean)
    ]);
    const awayPlayedIds = /* @__PURE__ */ new Set([
      ...asArray(match.awayLineup).filter(Boolean),
      ...asArray(match.substitutions).filter((sub) => sub?.teamId === match.awayTeamId).map((sub) => sub.playerInId).filter(Boolean)
    ]);
    const applyPlayed = (playerId) => {
      const totals = ensureTotals(playerId);
      totals.matchesPlayed += 1;
      totals.minutesPlayed += 90;
      const rating = match.ratings?.[playerId];
      if (typeof rating === "number") totals.ratingHistory.push(rating);
    };
    homePlayedIds.forEach(applyPlayed);
    awayPlayedIds.forEach(applyPlayed);
    asArray(match.goals).forEach((goal) => {
      if (goal?.isMiss) return;
      const scorerId = goal.playerId || goal.scorerId;
      if (scorerId) ensureTotals(scorerId).goals += 1;
      if (goal.assistantId) ensureTotals(goal.assistantId).assists += 1;
    });
    asArray(match.cards).forEach((card) => {
      if (!card?.playerId) return;
      const totals = ensureTotals(card.playerId);
      if (card.type === "RED" || card.type === "RED_CARD") totals.redCards += 1;
      if (card.type === "YELLOW" || card.type === "YELLOW_CARD" || card.type === "SECOND_YELLOW") totals.yellowCards += 1;
    });
  });
  if (playerFriendlyTotals.size === 0) return players;
  return Object.fromEntries(
    Object.entries(players).map(([clubId, squad]) => [
      clubId,
      (squad || []).map((player) => {
        const totals = playerFriendlyTotals.get(player.id);
        if (!totals) return player;
        const currentFriendly = player.friendlyStats ?? emptyPlayerStats();
        if ((currentFriendly.matchesPlayed ?? 0) >= totals.matchesPlayed) return player;
        return {
          ...player,
          friendlyStats: {
            ...currentFriendly,
            matchesPlayed: totals.matchesPlayed,
            minutesPlayed: totals.minutesPlayed,
            goals: totals.goals,
            assists: totals.assists,
            yellowCards: totals.yellowCards,
            redCards: totals.redCards,
            cleanSheets: Math.max(currentFriendly.cleanSheets ?? 0, totals.cleanSheets),
            ratingHistory: totals.ratingHistory
          }
        };
      })
    ])
  );
}
function isEuropeanCupCompetition(competition) {
  const value = String(competition || "");
  return value === "UEFA_SUPER_CUP" || value.startsWith("CL_") || value.startsWith("EL_") || value.startsWith("CONF_");
}
function reconcileEuroRatingHistoryFromHistory(players, matchHistory, seasonNumber) {
  const playerRatings = /* @__PURE__ */ new Map();
  (matchHistory || []).forEach((match) => {
    if (!isEuropeanCupCompetition(match?.competition)) return;
    if (Number(match?.season) !== seasonNumber) return;
    const playedIds = /* @__PURE__ */ new Set([
      ...asArray(match.homeLineup).filter(Boolean),
      ...asArray(match.awayLineup).filter(Boolean),
      ...asArray(match.substitutions).map((sub) => sub?.playerInId).filter(Boolean),
      ...asArray(match.substitutions).map((sub) => sub?.playerOutId).filter(Boolean),
      ...Object.keys(asRecord(match.ratings))
    ]);
    playedIds.forEach((playerId) => {
      const rating = match.ratings?.[playerId];
      if (typeof rating !== "number" || !Number.isFinite(rating)) return;
      if (!playerRatings.has(playerId)) playerRatings.set(playerId, []);
      playerRatings.get(playerId).push(rating);
    });
  });
  if (playerRatings.size === 0) return players;
  return Object.fromEntries(
    Object.entries(players).map(([clubId, squad]) => [
      clubId,
      (squad || []).map((player) => {
        const ratings = playerRatings.get(player.id);
        if (!ratings || ratings.length === 0) return player;
        const currentEuro = player.euroStats ?? emptyPlayerStats();
        const currentHistory = asArray(currentEuro.ratingHistory).filter((rating) => typeof rating === "number" && Number.isFinite(rating));
        if (currentHistory.length >= ratings.length) return player;
        return {
          ...player,
          euroStats: {
            ...currentEuro,
            ratingHistory: ratings
          }
        };
      })
    ])
  );
}
function normalizeSaveState(data) {
  const normalizedMatchHistory = normalizeMatchHistory(data.matchHistory);
  const normalizedClubs = (data.clubs || []).map((rawClub) => {
    const club = normalizeClubManagementSource(rawClub);
    return {
      ...club,
      rosterIds: asArray(club.rosterIds),
      stats: club.stats ?? { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
      budget: Number.isFinite(club.budget) ? club.budget : 0,
      transferBudget: Number.isFinite(club.transferBudget) ? Math.max(0, club.transferBudget) : 0,
      reserveBudget: Number.isFinite(club.reserveBudget) ? Math.max(0, club.reserveBudget) : FinanceService.calculateInitialReserveBudget(club.budget || 0, club.reputation || 1),
      reserveTeamSeasonGrant: Number.isFinite(club.reserveTeamSeasonGrant) ? Math.max(0, club.reserveTeamSeasonGrant) : void 0,
      reserveTeamSeasonGrantRate: Number.isFinite(club.reserveTeamSeasonGrantRate) ? Math.max(0, club.reserveTeamSeasonGrantRate) : void 0,
      reserveTeamSeasonGrantYear: Number.isFinite(club.reserveTeamSeasonGrantYear) ? club.reserveTeamSeasonGrantYear : void 0,
      reserveTeamEmergencySupportYear: Number.isFinite(club.reserveTeamEmergencySupportYear) ? club.reserveTeamEmergencySupportYear : void 0,
      // Parent/reserve squad integration is idempotent only when its monthly
      // review and emergency-call-up timestamps survive SAVE/LOAD. Old saves
      // omit these optional fields and safely begin with no completed review.
      reserveSquadLastReviewMonth: typeof club.reserveSquadLastReviewMonth === "string" ? club.reserveSquadLastReviewMonth : void 0,
      reserveSquadLastEmergencyMoveDate: typeof club.reserveSquadLastEmergencyMoveDate === "string" ? club.reserveSquadLastEmergencyMoveDate : void 0,
      boardBudgetRequestsThisSeason: club.boardBudgetRequestsThisSeason ?? 0,
      boardExceptionalContractApprovals: club.boardExceptionalContractApprovals ?? 0,
      boardApprovedFreeAgentContract: club.boardApprovedFreeAgentContract ?? null,
      boardBudgetMonitorState: club.boardBudgetMonitorState ?? "NORMAL",
      signingBonusPool: club.signingBonusPool ?? 0,
      financeHistory: asArray(club.financeHistory),
      stadiumExpansionProjects: asArray(club.stadiumExpansionProjects),
      trainingFacilityLevel: Math.max(1, Math.min(10, Math.round(Number.isFinite(club.trainingFacilityLevel) ? club.trainingFacilityLevel : 1))),
      trainingFacilityUpgradeProjects: asArray(club.trainingFacilityUpgradeProjects)
    };
  });
  const normalizedPlayersBase = Object.fromEntries(
    Object.entries(asRecord(data.players)).map(([clubId, squad]) => [
      clubId,
      asArray(squad).map((player) => {
        const playerClubId = typeof player.clubId === "string" && player.clubId.length > 0 ? player.clubId : clubId;
        const secondaryPosition = typeof player.secondaryPosition === "string" && player.secondaryPosition !== player.position ? player.secondaryPosition : null;
        const hasPendingTransfer = typeof player.transferPendingClubId === "string" && player.transferPendingClubId.length > 0;
        const normalizedPlayer = {
          ...player,
          clubId: playerClubId,
          clubAdaptation: normalizePlayerClubAdaptation(player.clubAdaptation, playerClubId),
          secondaryPosition,
          secondaryPositionRating: secondaryPosition ? asClampedRating(player.secondaryPositionRating) : void 0,
          // Save files keep the complete per-competition map. Normalizing every
          // bucket here prevents malformed optional arrays from breaking the III
          // liga ranking screen after a mid-season save/load cycle.
          competitionStats: Object.fromEntries(
            Object.entries(asRecord(player.competitionStats)).map(([competitionId, rawStats]) => [
              competitionId,
              {
                ...emptyPlayerStats(),
                ...asRecord(rawStats),
                seasonalChanges: asRecord(asRecord(rawStats).seasonalChanges),
                ratingHistory: asArray(asRecord(rawStats).ratingHistory)
              }
            ])
          ),
          friendlyStats: player.friendlyStats ?? {
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
          history: asArray(player.history),
          boardLockoutUntil: player.boardLockoutUntil ?? null,
          isUntouchable: player.isUntouchable ?? false,
          negotiationStep: player.negotiationStep ?? 0,
          negotiationLockoutUntil: player.negotiationLockoutUntil ?? null,
          contractLockoutUntil: player.contractLockoutUntil ?? null,
          moraleDemandLockoutUntil: player.moraleDemandLockoutUntil ?? null,
          transferListRemovalPromiseDeadline: player.transferListRemovalPromiseDeadline ?? null,
          fatigueDebt: player.fatigueDebt ?? 0,
          isNegotiationPermanentBlocked: player.isNegotiationPermanentBlocked ?? false,
          transferLockoutUntil: player.transferLockoutUntil ?? null,
          transferClubLockouts: player.transferClubLockouts ?? {},
          transferPendingSalary: hasPendingTransfer ? asPositiveNumber(player.transferPendingSalary) : void 0,
          transferPendingBonus: hasPendingTransfer ? asPositiveNumber(player.transferPendingBonus) : void 0,
          transferPendingContractYears: hasPendingTransfer ? asPositiveNumber(player.transferPendingContractYears) : void 0,
          // Internal-movement state is deliberately optional for backward
          // compatibility. Invalid legacy values are discarded so cooldown and
          // surplus-age calculations never operate on malformed dates/flags.
          lastInternalSquadMoveDate: typeof player.lastInternalSquadMoveDate === "string" ? player.lastInternalSquadMoveDate : null,
          lastInternalSquadMoveDirection: player.lastInternalSquadMoveDirection === "TO_FIRST_TEAM" || player.lastInternalSquadMoveDirection === "TO_RESERVES" ? player.lastInternalSquadMoveDirection : null,
          firstTeamSurplusSince: typeof player.firstTeamSurplusSince === "string" ? player.firstTeamSurplusSince : null,
          freeAgentLockoutUntil: player.freeAgentLockoutUntil ?? null,
          freeAgentClubLockouts: player.freeAgentClubLockouts ?? {},
          reputacja: player.reputacja ?? 50,
          lojalnosc: typeof player.lojalnosc === "number" && player.lojalnosc >= 1 ? player.lojalnosc : Math.floor(Math.random() * 99) + 1
        };
        return PlayerFormService.withUpdatedForm(normalizedPlayer);
      })
    ])
  );
  const normalizedPlayersWithCup = reconcileCupStatsFromHistory(
    normalizedPlayersBase,
    normalizedMatchHistory
  );
  const normalizedPlayersWithFriendlies = reconcileFriendlyStatsFromHistory(
    normalizedPlayersWithCup,
    normalizedMatchHistory,
    Number.isFinite(data.seasonNumber) ? data.seasonNumber : 1
  );
  const normalizedPlayers = reconcileEuroRatingHistoryFromHistory(
    normalizedPlayersWithFriendlies,
    normalizedMatchHistory,
    Number.isFinite(data.seasonNumber) ? data.seasonNumber : 1
  );
  return {
    ...data,
    version: SAVE_VERSION,
    savedAt: asDateString(data.savedAt, (/* @__PURE__ */ new Date()).toISOString()),
    currentDate: asDate(data.currentDate),
    sessionSeed: Number.isFinite(data.sessionSeed) ? data.sessionSeed : Date.now(),
    datapackCareerStartYear: Number.isInteger(data.datapackCareerStartYear) ? data.datapackCareerStartYear : null,
    clubs: normalizedClubs,
    leagues: asArray(data.leagues),
    players: normalizedPlayers,
    reserves: asArray(data.reserves),
    reserveCoachId: data.reserveCoachId ?? null,
    academy: normalizeAcademyState(data.academy, asDate(data.currentDate)),
    reserveReleaseDirective: data.reserveReleaseDirective ?? null,
    scoutPool: asArray(data.scoutPool),
    scoutMarket: asArray(data.scoutMarket),
    scoutMarketRefreshDate: asDateOnlyString(data.scoutMarketRefreshDate),
    scoutMarketManualRefreshCount: data.scoutMarketManualRefreshCount ?? 0,
    scoutMarketPeriodStart: asDateOnlyString(data.scoutMarketPeriodStart),
    transferScoutPool: asArray(data.transferScoutPool),
    transferScoutingAssignments: asArray(data.transferScoutingAssignments),
    transferScoutingReports: asArray(data.transferScoutingReports),
    discoveredTransferPlayerIds: asArray(data.discoveredTransferPlayerIds).filter((id) => typeof id === "string"),
    mysteryAgentOffer: data.mysteryAgentOffer ?? null,
    lineups: asRecord(data.lineups),
    seasonTemplate: normalizeSeasonTemplate(data.seasonTemplate),
    leagueSchedules: normalizeLeagueSchedules(data.leagueSchedules),
    fourthLeagueState: data.fourthLeagueState ?? null,
    lastRecoveryDate: asDate(data.lastRecoveryDate),
    coaches: asRecord(data.coaches),
    staffMembers: asRecord(data.staffMembers),
    roundResults: asRecord(data.roundResults),
    managerProfile: ManagerExperienceService.ensureManagerExperience(data.managerProfile),
    managerJobOffers: asArray(data.managerJobOffers),
    activeManagerContract: data.activeManagerContract ?? null,
    managerContractNegotiation: data.managerContractNegotiation ?? null,
    seasonNumber: Number.isFinite(data.seasonNumber) ? data.seasonNumber : 1,
    messages: migrateWelcomeMailSignatories(normalizeMessages(data.messages), normalizedClubs, data.userTeamId ?? null),
    activeTrainingId: typeof data.activeTrainingId === "string" ? data.activeTrainingId : null,
    activeIntensity: data.activeIntensity ?? "NORMAL",
    trainingProgressHistory: asArray(data.trainingProgressHistory),
    reserveProgressHistory: asArray(data.reserveProgressHistory),
    pendingNegotiations: data.pendingNegotiations || [],
    pendingFriendlyRequests: data.pendingFriendlyRequests || [],
    activeFriendlyFixtureId: data.activeFriendlyFixtureId ?? null,
    activeFriendlyConditions: data.activeFriendlyConditions ?? null,
    transferOffers: data.transferOffers || [],
    incomingOffers: data.incomingOffers || [],
    aiTransferLog: data.aiTransferLog || [],
    europeanStatus: asRecord(data.europeanStatus),
    nationalTeams: asArray(data.nationalTeams),
    nationsLeagueState: normalizeNationsLeagueState(data.nationsLeagueState),
    nationsLeagueArchive: asArray(data.nationsLeagueArchive).map(normalizeNationsLeagueState).filter(Boolean),
    euroHostAnnouncements: asArray(data.euroHostAnnouncements),
    euroQualifiersState: normalizeEuroQualifiersState(data.euroQualifiersState),
    worldCupQualifiersState: normalizeEuroQualifiersState(data.worldCupQualifiersState),
    uefaNationalRankingState: data.uefaNationalRankingState ?? null,
    wcqPlayoffState: data.wcqPlayoffState ?? null,
    wcState: normalizeTournamentState(data.wcState),
    euroState: normalizeTournamentState(data.euroState),
    cupParticipants: asArray(data.cupParticipants),
    activeCupDraw: normalizeDraw(data.activeCupDraw),
    activeGroupDraw: normalizeDraw(data.activeGroupDraw),
    activePlayoffDraw: data.activePlayoffDraw ?? null,
    relegationPlayoffFirstLegResults: data.relegationPlayoffFirstLegResults ?? null,
    relegationPlayoffFinalResult: data.relegationPlayoffFinalResult ?? null,
    promotionPlayoffSemiResults: data.promotionPlayoffSemiResults ?? null,
    promotionPlayoffFinalResults: data.promotionPlayoffFinalResults ?? null,
    activePlayoffMatch: data.activePlayoffMatch ?? null,
    clGroups: data.clGroups ?? null,
    activeELGroupDraw: normalizeDraw(data.activeELGroupDraw),
    elGroups: data.elGroups ?? null,
    activeConfGroupDraw: normalizeDraw(data.activeConfGroupDraw),
    confGroups: data.confGroups ?? null,
    elHistoryInitialRound: data.elHistoryInitialRound ?? null,
    confHistoryInitialRound: data.confHistoryInitialRound ?? null,
    processedDrawIds: asArray(data.processedDrawIds),
    globalFixtures: asArray(data.globalFixtures).map(normalizeFixture),
    isResigned: data.isResigned ?? false,
    managerEmploymentStatus: data.managerEmploymentStatus === "FIRED" || data.managerEmploymentStatus === "RESIGNED" || data.managerEmploymentStatus === "EMPLOYED" ? data.managerEmploymentStatus : data.isResigned ? "RESIGNED" : "EMPLOYED",
    reserveFixtures: asArray(data.reserveFixtures),
    reserveMatchResults: asArray(data.reserveMatchResults),
    supercupWinners: asArray(data.supercupWinners),
    matchHistory: normalizedMatchHistory,
    championshipHistory: asArray(data.championshipHistory),
    confR1QPolishTeamIds: asArray(data.confR1QPolishTeamIds),
    confR2QPolishTeamIds: data.confR2QPolishTeamIds ?? ["PL_JAGIELLONIA_BIALYSTOK", "PL_POGON_SZCZECIN"],
    lastUEFASuperCupResult: data.lastUEFASuperCupResult ?? null,
    currentPolishChampionId: data.currentPolishChampionId ?? "PL_LECH_POZNAN",
    currentPolishViceChampionId: data.currentPolishViceChampionId ?? null,
    currentPolishCupWinnerId: data.currentPolishCupWinnerId ?? "PL_LEGIA_WARSZAWA",
    currentCLWinnerId: data.currentCLWinnerId ?? "EU_CL_PARIS_SAINT_GERMAIN",
    currentELWinnerId: data.currentELWinnerId ?? "EU_CL_TOTTENHAM_HOTSPUR",
    winterCampInvitePending: data.winterCampInvitePending ?? false,
    winterCampProgramPending: data.winterCampProgramPending ?? false,
    summerCampInvitePending: data.summerCampInvitePending ?? false,
    summerCampProgramPending: data.summerCampProgramPending ?? false,
    lastNTMatchResults: normalizeNTMatchResults(data.lastNTMatchResults),
    aiFriendlyPairs: asArray(data.aiFriendlyPairs),
    aiFriendlyReports: asArray(data.aiFriendlyReports),
    pzpnDisciplinaryEvents: asArray(data.pzpnDisciplinaryEvents),
    sentMailIds: asArray(data.sentMailIds),
    lastProcessedLeagueDate: data.lastProcessedLeagueDate ?? null,
    mediaRelationships: asRecord(data.mediaRelationships),
    sentUnfriendlyPressMonths: asArray(data.sentUnfriendlyPressMonths),
    sentFriendlyPressMonths: asArray(data.sentFriendlyPressMonths),
    pendingPressArticles: asArray(data.pendingPressArticles),
    completedPressConferenceFixtureIds: asArray(data.completedPressConferenceFixtureIds),
    pressConferenceEffects: asRecord(data.pressConferenceEffects)
  };
}

// tests/RealSavePeriodicProfileTests.ts
var savePath = process.env.FM_REAL_SAVE_PATH;
import_node_assert.strict.ok(savePath, "ustaw FM_REAL_SAVE_PATH na analizowany plik zapisu");
var reviveIsoDates = (_key, value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
};
var parsed = JSON.parse((0, import_node_zlib.gunzipSync)((0, import_node_fs.readFileSync)(savePath)).toString("utf8"), reviveIsoDates);
var state = normalizeSaveState(parsed);
var savedDate = state.currentDate instanceof Date ? state.currentDate : new Date(state.currentDate);
var profileDate = new Date(savedDate);
profileDate.setFullYear(2026, 7, 15);
var fixtures = [
  ...Object.values(state.leagueSchedules ?? {}).flatMap(
    (schedule) => (schedule?.matchdays ?? []).flatMap((matchday) => matchday?.fixtures ?? [])
  ),
  ...state.globalFixtures ?? []
];
var time = (work) => {
  const startedAt = import_node_perf_hooks.performance.now();
  const result = work();
  return { result, ms: import_node_perf_hooks.performance.now() - startedAt };
};
var recovery = time(() => RecoveryService.applyDailyRecovery(
  state.players,
  profileDate,
  "NORMAL" /* NORMAL */,
  1,
  1,
  void 0,
  state.userTeamId ?? void 0
));
var foreignLeagueIds = /* @__PURE__ */ new Set(["L_CL", "L_EL", "L_CONF", "L_SA", "L_ASIA", "L_AFRICA", "L_NA"]);
var foreignClubCount = 0;
var foreignPlayerCount = 0;
var foreignStats = time(() => {
  const nextPlayers = { ...recovery.result };
  state.clubs.forEach((club) => {
    if (!foreignLeagueIds.has(String(club.leagueId)) || club.country === "POL") return;
    const squad = nextPlayers[club.id];
    if (!squad?.length) return;
    foreignClubCount += 1;
    foreignPlayerCount += squad.length;
    nextPlayers[club.id] = EuropeanPlayerStatsService.applyBackgroundLeagueStatsToDate(
      squad,
      club,
      profileDate,
      profileDate.getFullYear()
    );
  });
  return nextPlayers;
});
var weeklyTraining = time(() => AiWeeklyTrainingService.processWeeklyTraining(
  foreignStats.result,
  state.clubs,
  state.coaches,
  state.userTeamId,
  profileDate,
  fixtures,
  state.sessionSeed,
  state.staffMembers ?? {}
));
var totalPlayersAfter = Object.values(weeklyTraining.result.updatedPlayers).reduce((total, squad) => total + squad.length, 0);
var totalPlayersBefore = Object.values(state.players).reduce((total, squad) => total + squad.length, 0);
import_node_assert.strict.equal(totalPlayersAfter, totalPlayersBefore, "profil okresowych etap\xF3w nie mo\u017Ce zmieni\u0107 liczby zawodnik\xF3w");
console.log(JSON.stringify({
  date: profileDate.toISOString(),
  totalPlayers: totalPlayersBefore,
  foreignClubCount,
  foreignPlayerCount,
  recoveryMs: +recovery.ms.toFixed(1),
  foreignBackgroundStatsMs: +foreignStats.ms.toFixed(1),
  aiWeeklyTrainingMs: +weeklyTraining.ms.toFixed(1)
}, null, 2));
console.log("RealSavePeriodicProfileTests: OK");
