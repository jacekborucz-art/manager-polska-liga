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

// tests/LiveMatchOwnGoalTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/ManagerNegotiationInfluenceService.ts
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var getExperience = (managerProfile) => {
  if (!managerProfile || !Number.isFinite(managerProfile.experience)) return 50;
  return clamp(managerProfile.experience, 1, 99);
};
var ManagerNegotiationInfluenceService = {
  calculate(managerProfile) {
    const experience = getExperience(managerProfile);
    const normalized = clamp((experience - 50) / 49, -1, 1);
    return {
      experience,
      normalized,
      scoreAdjustment: Math.round(normalized * 8),
      chanceAdjustment: normalized * 0.06,
      expectationMultiplier: clamp(1 - normalized * 0.045, 0.955, 1.045),
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
var clamp2 = (value, min, max) => Math.max(min, Math.min(max, value));
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
      return 0.94 + clamp2(careerMatches / 260, 0, 1) * 0.2;
    case "GK" /* GK */:
      return 0.92 + clamp2(careerMatches / 240, 0, 1) * 0.24;
    default:
      return 0.94 + clamp2(careerMatches / 260, 0, 1) * 0.08;
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
  const sampleFactor = clamp2(minutesPlayed / 900, 0, 1);
  const ratingDelta = averageRating === null ? 0 : averageRating - 6.7;
  switch (player.position) {
    case "FWD" /* FWD */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const goalsBoost = clamp2(goals / 20, 0, 1) * 0.2 + clamp2(goalsPer90 / 0.75, 0, 1) * 0.18;
      const assistsBoost = clamp2(assists / 10, 0, 1) * 0.07 + clamp2(assistsPer90 / 0.35, 0, 1) * 0.05;
      const ratingBoost = clamp2(ratingDelta * 0.1, -0.08, 0.1);
      return 1 + clamp2(sampleFactor * (goalsBoost + assistsBoost + ratingBoost), -0.1, 0.52);
    }
    case "MID" /* MID */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const assistsBoost = clamp2(assists / 14, 0, 1) * 0.18 + clamp2(assistsPer90 / 0.45, 0, 1) * 0.15;
      const goalsBoost = clamp2(goals / 12, 0, 1) * 0.08 + clamp2(goalsPer90 / 0.35, 0, 1) * 0.06;
      const ratingBoost = clamp2(ratingDelta * 0.11, -0.08, 0.12);
      return 1 + clamp2(sampleFactor * (assistsBoost + goalsBoost + ratingBoost), -0.1, 0.46);
    }
    case "DEF" /* DEF */: {
      const matchFactor = clamp2(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp2(getCareerMatches(player) / 260, 0, 1) * 0.12;
      const ratingBoost = averageRating === null ? 0 : clamp2((averageRating - 6.6) * 0.18, -0.1, 0.22) * clamp2(matchesPlayed / 10, 0, 1);
      return 1 + clamp2(matchFactor + experienceBoost + ratingBoost, -0.1, 0.42);
    }
    case "GK" /* GK */: {
      const matchFactor = clamp2(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp2(getCareerMatches(player) / 240, 0, 1) * 0.14;
      const ratingBoost = averageRating === null ? 0 : clamp2((averageRating - 6.6) * 0.22, -0.1, 0.24) * clamp2(matchesPlayed / 8, 0, 1);
      return 1 + clamp2(matchFactor + experienceBoost + ratingBoost, -0.12, 0.46);
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
  const reputationFactor = 0.88 + clamp2(reputation, 1, 10) * 0.025;
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
  return clamp2(countryFactor * reputationFactor * stadiumFactor * competitionFactor / 1.45, 0.45, 2.6);
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
  const marketFactor = clamp2(0.5 + Math.sqrt(financeFactor / 1.45) * 0.55, 0.45, 1.1);
  const capScale = clamp2(marketFactor / 0.9, 0.55, 1.22);
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
  const reputationFactor = 0.9 + clamp2(reputation, 1, 20) * 0.015;
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
    const reputationFactor = clamp2((Math.max(1, Math.min(10, reputation)) - 4) / 6, 0, 1);
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
        return Math.round(clamp2(rawCost2, minFloor, maxCap));
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
      return Math.round(clamp2(rawCost2, 5e4, 8e7) / 1e3) * 1e3;
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
    return Math.round(clamp2(rawCost, tierMin, tierMax) / 1e3) * 1e3;
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
  // Oblicza rynkową wartość pensji dla danego OVR (punkt odniesienia dla Zarządu)
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
    const salaryCap = club.budget * 0.25;
    if (proposedSalary > salaryCap) {
      return { approved: false, reason: `DYREKTOR FINANSOWY: Proponowana pensja przekracza 25% naszego bud\u017Cetu transferowego (limit: ${Math.floor(salaryCap).toLocaleString()} PLN).` };
    }
    const highestSalary = squad.length > 0 ? Math.max(...squad.map((p) => p.annualSalary)) : 0;
    if (proposedSalary > highestSalary * 2 && highestSalary > 0 && player.overallRating < 82) {
      return {
        approved: false,
        reason: `PREZES: Ta oferta zniszczy nasz\u0105 hierarchi\u0119 w szatni! Nie damy nowemu graczowi dwa razy wi\u0119cej ni\u017C zarabia nasz najlepszy zawodnik (${highestSalary.toLocaleString()} PLN).`
      };
    }
    const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
    const overpayRatio = proposedSalary / fairSalary;
    const allowedOverpay = 1.2 + (10 - club.boardStrictness) / 10;
    if (overpayRatio > allowedOverpay) {
      return {
        approved: false,
        reason: `ZARZ\u0104D: Ta kwota to absurd! Sugerowana pensja rynkowa dla OVR ${player.overallRating} to ok. ${fairSalary.toLocaleString()} PLN. Nie pozwolimy na tak\u0105 niegospodarno\u015B\u0107.`
      };
    }
    if (proposedBonus > club.budget * 0.5) {
      return { approved: false, reason: "ZARZ\u0104D: Bonus za podpis jest zbyt wysoki w stosunku do wolnej got\xF3wki w klubie." };
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
    return Math.round(clamp2(maxPrice, 45, 420));
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
    const seasonTicketShare = clamp2(0.14 + marketIndex * 0.1 + club.reputation / 20 * 0.18, 0.16, 0.65);
    const ticketsSold = Math.floor(club.stadiumCapacity * seasonTicketShare);
    const singleMatchPrice = FinanceService.calculateTicketPriceForClub(club);
    const seasonDiscount = clamp2(0.68 + marketIndex * 0.05, 0.7, 0.82);
    const seasonTicketPrice = Math.round(clamp2(singleMatchPrice * 19 * seasonDiscount, 900, 8500));
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

// services/PlayerFormService.ts
var clamp3 = (value, min, max) => Math.max(min, Math.min(max, value));
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
    return clamp3(goalsPerMatch * 20 + assistsPerMatch * 8 - (goalsPerMatch === 0 ? 8 : 0), -10, 14);
  }
  if (player.position === "MID" /* MID */) {
    return clamp3(contributionsPerMatch * 18, -4, 12);
  }
  if (player.position === "GK" /* GK */) {
    return clamp3(cleanSheetRate * 18 - (cleanSheetRate === 0 ? 4 : 0), -8, 14);
  }
  return clamp3(contributionsPerMatch * 10, -4, 8);
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
      score += clamp3((seasonAverage - 6.5) * 10, -18, 22);
    }
    if (recent10Average !== null) {
      score += clamp3((recent10Average - 6.5) * 14, -22, 28);
    }
    if (recentAverage !== null) {
      score += clamp3((recentAverage - 6.5) * 8, -12, 16);
    }
    if (recentAverage !== null && previousAverage !== null) {
      score += clamp3((recentAverage - previousAverage) * 10, -10, 10);
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
    score += clamp3(((player.morale ?? 50) - 50) * 0.1, -5, 5);
    if (matches > 0 || recentAverage !== null) score += player.trainingFocus ? 2 : 0;
    if (player.health?.status === "INJURED" /* INJURED */) score -= 18;
    if ((player.condition ?? 100) < 60) score -= 8;
    if ((player.fatigueDebt ?? 0) > 55) score -= 6;
    return PlayerFormService.getInfo(Math.round(clamp3(score, 0, 100)));
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
      return clamp3(adjustment - strainPenalty, -9, 7);
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
    const safeScore = Math.round(clamp3(score, 0, 100));
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

// services/PlayerMoraleService.ts
var DAY_MS = 24 * 60 * 60 * 1e3;
var PERSONALITIES = [
  "PROFESSIONAL",
  "AMBITIOUS",
  "SENSITIVE",
  "CONFIDENT",
  "NERVOUS",
  "LOYAL",
  "EGOIST",
  "CALM"
];
var seededRng = (seed, offset) => {
  const x = Math.sin(seed + offset * 9973) * 1e4;
  return x - Math.floor(x);
};
var dateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
var dayDiff = (from, to) => Math.floor((dateOnly(to).getTime() - dateOnly(from).getTime()) / DAY_MS);
var stableHash = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
};
var toDateKey = (date) => date.toISOString().split("T")[0];
var roleLabel = (role) => {
  if (role === "KEY_PLAYER") return "kluczowy zawodnik";
  if (role === "STARTER") return "podstawowa jedenastka";
  return "bez okre\u015Blonego statusu";
};
var boardAttributeScore = (level) => {
  if (level === "bardzo_wysoka") return 4;
  if (level === "wysoka") return 3;
  if (level === "przecietna") return 2;
  if (level === "niska") return 1;
  if (level === "bardzo_niska") return 0;
  return 2;
};
var roundTransferPrice = (value) => {
  const step = value >= 1e7 ? 5e5 : value >= 1e6 ? 1e5 : 25e3;
  return Math.max(step, Math.ceil(value / step) * step);
};
var roundContractMoney = (value) => {
  const step = value >= 1e6 ? 1e5 : value >= 1e5 ? 1e4 : 5e3;
  return Math.max(5e4, Math.ceil(value / step) * step);
};
var buildRaiseRequest = (player, club, squadAverage, rank) => {
  const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
  const currentSalary = Math.max(5e4, player.annualSalary || 0);
  const qualityPremium = Math.max(0, player.overallRating - squadAverage) * 0.025;
  const rolePremium = rank <= 3 ? 0.22 : rank <= 6 ? 0.14 : 0.08;
  const personalityPremium = player.moralePersonality === "EGOIST" ? 0.14 : player.moralePersonality === "AMBITIOUS" ? 0.1 : player.moralePersonality === "LOYAL" ? -0.05 : 0;
  const reputationPremium = club.reputation >= 10 ? 0.08 : club.reputation <= 5 ? -0.04 : 0;
  const expectedSalary = roundContractMoney(
    Math.max(fairSalary, currentSalary * 1.18) * (1.04 + qualityPremium + rolePremium + personalityPremium + reputationPremium)
  );
  const years = player.age <= 23 ? 4 : player.age <= 28 ? 4 : player.age <= 32 ? 3 : player.age <= 34 ? 2 : 1;
  const bonusMultiplier = player.age >= 33 ? 0.7 : player.age >= 28 ? 0.58 : player.age >= 24 ? 0.46 : 0.32;
  const bonus = roundContractMoney(expectedSalary * bonusMultiplier);
  return {
    salary: expectedSalary,
    bonus,
    years
  };
};
var getLastSeasonMatches = (player) => {
  const history = player.seasonHistory || [];
  if (history.length === 0) return getSeasonOutputProfile(player).matches;
  return history[history.length - 1]?.matchesPlayed ?? 0;
};
var getPromotionRaiseRequest = (player, club, squadAverage) => {
  const currentSalary = Math.max(5e4, player.annualSalary || 0);
  const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
  const matches = getLastSeasonMatches(player);
  const underpayPressure = Math.max(0, 1 - currentSalary / Math.max(1, fairSalary));
  const qualityPremium = Math.max(0, player.overallRating - squadAverage) * 0.015;
  const rolePremium = player.isUntouchable || player.squadRole === "KEY_PLAYER" ? 0.08 : player.squadRole === "STARTER" ? 0.05 : 0.02;
  const regularityPremium = matches >= 30 ? 0.06 : matches >= 24 ? 0.04 : matches >= 18 ? 0.02 : 0;
  const personalityPremium = player.moralePersonality === "EGOIST" ? 0.07 : player.moralePersonality === "AMBITIOUS" ? 0.06 : player.moralePersonality === "CONFIDENT" ? 0.04 : player.moralePersonality === "LOYAL" ? -0.03 : player.moralePersonality === "PROFESSIONAL" ? -0.01 : 0;
  const clubStepPremium = club.leagueId === "L_PL_1" ? 0.04 : club.leagueId === "L_PL_2" ? 0.03 : 0.02;
  const seed = stableHash(`${player.id}_${player.contractEndDate}_PROMOTION_RAISE`);
  const randomPremium = seededRng(seed, 29) * 0.05;
  const raisePct = Math.max(
    0.1,
    Math.min(
      0.5,
      0.1 + Math.min(0.16, underpayPressure * 0.42) + Math.min(0.1, qualityPremium) + rolePremium + regularityPremium + personalityPremium + clubStepPremium + randomPremium
    )
  );
  const salary = roundContractMoney(currentSalary * (1 + raisePct));
  const years = player.age <= 23 ? 4 : player.age <= 28 ? 4 : player.age <= 32 ? 3 : player.age <= 34 ? 2 : 1;
  const bonusMultiplier = player.age >= 33 ? 0.62 : player.age >= 28 ? 0.52 : player.age >= 24 ? 0.42 : 0.3;
  return {
    salary,
    bonus: roundContractMoney(salary * bonusMultiplier),
    years,
    reason: "PROMOTION_RAISE",
    raisePct: Math.round(raisePct * 100),
    matches
  };
};
var shouldRequestPromotionRaise = (player, club, squadAverage, currentDate) => {
  const currentSalary = player.annualSalary || 0;
  if (currentSalary <= 0) return false;
  if (PlayerMoraleService.isMoraleDemandLocked(player, currentDate) || PlayerMoraleService.hasActiveMoraleDemand(player)) return false;
  if (player.transferPendingClubId || player.contractRaiseRequest || player.contractRaiseDemandUntil) return false;
  const matches = getLastSeasonMatches(player);
  const playedRegularly = matches >= 18 || (player.squadRole === "STARTER" || player.squadRole === "KEY_PLAYER" || player.isUntouchable) && matches >= 12;
  if (!playedRegularly) return false;
  const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
  const financialRespectRatio = currentSalary / Math.max(1, fairSalary);
  const hasSportingArgument = player.overallRating >= squadAverage - 1 || player.squadRole === "STARTER" || player.squadRole === "KEY_PLAYER" || player.isUntouchable;
  return hasSportingArgument && (financialRespectRatio < 0.94 || player.overallRating >= squadAverage + 3);
};
var estimateProtectedExitPrice = (player, club, squadAverage) => {
  const marketValue = player.marketValue ?? Math.max(15e4, Math.round(player.overallRating * player.overallRating * 4200));
  const squadPremium = Math.max(0, player.overallRating - squadAverage) * 0.035;
  const clubPremium = Math.max(0, club.reputation - 7) * 0.025;
  const untouchablePremium = player.isUntouchable ? 0.28 : 0.12;
  return roundTransferPrice(marketValue * (1.15 + untouchablePremium + squadPremium + clubPremium));
};
var shouldBoardSupportProtectedExit = (player, club, squadAverage, transferRandomFactor) => {
  const marketValue = player.marketValue ?? 0;
  const annualSalary = player.annualSalary ?? 0;
  const saleLooksValuable = marketValue >= Math.max(5e5, annualSalary * 3) || player.overallRating >= squadAverage + 9;
  if (!saleLooksValuable) return false;
  const greedScore = boardAttributeScore(club.board?.chciwosc);
  const ambitionScore = boardAttributeScore(club.board?.ambicja);
  const financialPressure = club.transferBudget < marketValue * 0.35 ? 4 : club.budget < marketValue * 0.2 ? 3 : 0;
  const confidencePressure = (club.boardConfidence ?? 70) < 55 ? 3 : 0;
  const sportingResistance = ambitionScore >= 3 && player.overallRating >= squadAverage + 10 ? 3 : 0;
  return greedScore * 2 + financialPressure + confidencePressure + transferRandomFactor - sportingResistance >= 5;
};
var getSeasonOutputProfile = (player) => {
  const statGroups = [player.stats, player.cupStats, player.euroStats].filter(Boolean);
  const goals = statGroups.reduce((sum, stats) => sum + (stats?.goals ?? 0), 0);
  const assists = statGroups.reduce((sum, stats) => sum + (stats?.assists ?? 0), 0);
  const cleanSheets = statGroups.reduce((sum, stats) => sum + (stats?.cleanSheets ?? 0), 0);
  const matches = statGroups.reduce((sum, stats) => sum + (stats?.matchesPlayed ?? 0), 0);
  const ratings = statGroups.flatMap((stats) => stats?.ratingHistory ?? []);
  const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;
  return {
    goals,
    assists,
    cleanSheets,
    goalContributions: goals + assists,
    matches,
    averageRating
  };
};
var roundOneTimeBonusAmount = (value) => Math.max(2e4, Math.min(1e5, Math.round(value / 5e3) * 5e3));
var getOneTimeBonusPerformanceScore = (player, profile) => {
  if (profile.matches < 20) return 0;
  const matchScore = Math.min(24, (profile.matches - 20) * 1.2);
  const ratingScore = profile.averageRating !== null ? Math.max(-8, Math.min(24, (profile.averageRating - 6.55) * 28)) : 0;
  if (player.position === "FWD" /* FWD */) {
    const goalsPerMatch = profile.goals / Math.max(1, profile.matches);
    return Math.max(0, Math.min(100, 38 + matchScore + ratingScore + goalsPerMatch * 70 + profile.assists / Math.max(1, profile.matches) * 18));
  }
  if (player.position === "MID" /* MID */) {
    const assistsPerMatch = profile.assists / Math.max(1, profile.matches);
    return Math.max(0, Math.min(100, 36 + matchScore + ratingScore + assistsPerMatch * 78 + profile.goals / Math.max(1, profile.matches) * 18));
  }
  if (player.position === "DEF" /* DEF */) {
    return Math.max(0, Math.min(100, 34 + matchScore + ratingScore * 1.25 + profile.goalContributions / Math.max(1, profile.matches) * 24));
  }
  const cleanSheetRate = profile.cleanSheets / Math.max(1, profile.matches);
  return Math.max(0, Math.min(100, 34 + matchScore + ratingScore + cleanSheetRate * 70));
};
var getOneTimeBonusStatsLine = (player, profile) => {
  const ratingPart = profile.averageRating !== null ? `, \u015Brednia ocen ${profile.averageRating.toFixed(2).replace(".", ",")}` : "";
  if (player.position === "GK" /* GK */) {
    return `${profile.matches} mecz\xF3w, ${profile.cleanSheets} czystych kont${ratingPart}`;
  }
  if (player.position === "FWD" /* FWD */) {
    return `${profile.matches} mecz\xF3w, ${profile.goals} goli${ratingPart}`;
  }
  if (player.position === "MID" /* MID */) {
    return `${profile.matches} mecz\xF3w, ${profile.assists} asyst${ratingPart}`;
  }
  return `${profile.matches} mecz\xF3w, \u015Brednia ocen ${profile.averageRating !== null ? profile.averageRating.toFixed(2).replace(".", ",") : "brak"}, ${profile.cleanSheets} czystych kont zespo\u0142u`;
};
var hasStandoutSeasonOutput = (player, profile) => {
  if (profile.matches < 10) return false;
  const excellentRatings = profile.matches >= 14 && (profile.averageRating ?? 0) >= 7.22;
  if (player.position === "FWD") {
    return profile.goals >= 14 || profile.goalContributions >= 20 || excellentRatings && profile.goalContributions >= 12;
  }
  if (player.position === "MID") {
    return profile.assists >= 10 || profile.goalContributions >= 16 || excellentRatings && profile.goalContributions >= 8;
  }
  if (player.position === "DEF") {
    return profile.goalContributions >= 8 || profile.matches >= 16 && (profile.averageRating ?? 0) >= 7.1;
  }
  return (player.stats.cleanSheets ?? 0) >= 10 || profile.matches >= 16 && (profile.averageRating ?? 0) >= 7.05;
};
var formatSeasonOutputSummary = (profile) => {
  const ratingPart = profile.averageRating !== null ? `, \u015Brednia ocen ${profile.averageRating.toFixed(2).replace(".", ",")}` : "";
  return `${profile.goals} goli, ${profile.assists} asyst${ratingPart}`;
};
var isAvailableForMinutesDemand = (player) => player.health.status === "HEALTHY" /* HEALTHY */ && player.condition >= 75 && (player.fatigueDebt ?? 0) <= 55;
var getContractDaysLeft = (player, currentDate) => {
  if (!player.contractEndDate) return 9999;
  const contractEnd = new Date(player.contractEndDate);
  if (Number.isNaN(contractEnd.getTime())) return 9999;
  return Math.floor((contractEnd.getTime() - currentDate.getTime()) / DAY_MS);
};
var getAgeTransferStabilityBias = (player) => {
  const isEliteLatePrime = player.age >= 26 && player.overallRating >= 85;
  if (player.age < 26) return 0;
  if (player.age <= 28) return isEliteLatePrime ? -1 : -4;
  if (player.age <= 31) return isEliteLatePrime ? -3 : -8;
  if (player.age <= 34) return isEliteLatePrime ? -8 : -14;
  return isEliteLatePrime ? -12 : -20;
};
var hasRealisticCareerStepUpside = (player, personality, hasHighReputationInterest) => {
  if (hasHighReputationInterest) return true;
  if (player.age <= 24) return true;
  if (player.age <= 27 && player.overallRating >= 72) return true;
  if (player.overallRating >= 78) return true;
  const hasUnrealisticAmbition = personality === "EGOIST" || personality === "AMBITIOUS";
  return hasUnrealisticAmbition && player.age <= 30 && player.overallRating >= 72;
};
var getMinutesDemandMindset = (personality) => {
  const mindsets = {
    PROFESSIONAL: { approach: "CALM", selfBeliefBias: 0, minimumMinutesGap: 0.18, readinessThreshold: 64, priority: 3, moraleDrop: -1 },
    AMBITIOUS: { approach: "ASSERTIVE", selfBeliefBias: 8, minimumMinutesGap: 0.12, readinessThreshold: 53, priority: 4, moraleDrop: -2 },
    SENSITIVE: { approach: "PATIENT", selfBeliefBias: -2, minimumMinutesGap: 0.22, readinessThreshold: 66, priority: 3, moraleDrop: -2 },
    CONFIDENT: { approach: "ASSERTIVE", selfBeliefBias: 7, minimumMinutesGap: 0.14, readinessThreshold: 55, priority: 4, moraleDrop: -2 },
    NERVOUS: { approach: "PATIENT", selfBeliefBias: -5, minimumMinutesGap: 0.25, readinessThreshold: 70, priority: 3, moraleDrop: -2 },
    LOYAL: { approach: "PATIENT", selfBeliefBias: -6, minimumMinutesGap: 0.24, readinessThreshold: 72, priority: 2, moraleDrop: -1 },
    EGOIST: { approach: "BRAZEN", selfBeliefBias: 12, minimumMinutesGap: 0.08, readinessThreshold: 46, priority: 5, moraleDrop: -3 },
    CALM: { approach: "PATIENT", selfBeliefBias: -4, minimumMinutesGap: 0.22, readinessThreshold: 69, priority: 2, moraleDrop: -1 }
  };
  return mindsets[personality];
};
var getMinutesDemandCopy = (player, approach, recentAverageRating) => {
  const formSentence = recentAverageRating !== null && recentAverageRating >= 7 ? `Moje ostatnie wyst\u0119py te\u017C daj\u0105 mi argumenty. \u015Arednia ocen z ostatnich mecz\xF3w to ${recentAverageRating.toFixed(1).replace(".", ",")}.` : "Czuj\u0119 si\u0119 gotowy, \u017Ceby da\u0107 dru\u017Cynie wi\u0119cej na boisku.";
  if (approach === "BRAZEN") {
    return {
      subject: `\u017B\u0105danie wi\u0119kszej liczby minut: ${player.lastName}`,
      body: `Trenerze,

Powiem wprost: przy mojej jako\u015Bci obecna liczba minut jest nie do zaakceptowania. Widz\u0119 zawodnik\xF3w, kt\xF3rzy dostaj\u0105 wi\u0119cej szans, cho\u0107 nie daj\u0105 dru\u017Cynie wi\u0119cej ode mnie. ${formSentence}

Oczekuj\u0119 realnej zmiany w najbli\u017Cszych tygodniach. Nie zamierzam bez ko\u0144ca czeka\u0107 na \u0142awce, gdy wiem, \u017Ce zas\u0142uguj\u0119 na gr\u0119.

${player.firstName} ${player.lastName}`
    };
  }
  if (approach === "ASSERTIVE") {
    return {
      subject: `Rozmowa o wi\u0119kszej liczbie minut: ${player.lastName}`,
      body: `Trenerze,

Chcia\u0142bym jasno porozmawia\u0107 o swojej sytuacji. Uwa\u017Cam, \u017Ce jestem gotowy na wi\u0119ksz\u0105 odpowiedzialno\u015B\u0107, a obecna liczba minut nie odpowiada mojej pozycji w kadrze. ${formSentence}

Prosz\u0119 o realn\u0105 szans\u0119 w najbli\u017Cszych tygodniach. Chc\u0119 udowodni\u0107 swoj\u0105 warto\u015B\u0107 na boisku, ale potrzebuj\u0119 do tego uczciwej okazji.

${player.firstName} ${player.lastName}`
    };
  }
  if (approach === "CALM") {
    return {
      subject: `Pro\u015Bba o wi\u0119cej wyst\u0119p\xF3w: ${player.lastName}`,
      body: `Trenerze,

Chcia\u0142bym spokojnie porozmawia\u0107 o swojej roli. Szanuj\u0119 decyzje sztabu, ale czuj\u0119, \u017Ce mog\u0119 da\u0107 dru\u017Cynie wi\u0119cej. ${formSentence}

Nie oczekuj\u0119 gwarancji miejsca w sk\u0142adzie. Prosz\u0119 jedynie o realn\u0105 mo\u017Cliwo\u015B\u0107 pokazania, \u017Ce zas\u0142uguj\u0119 na wi\u0119cej minut.

${player.firstName} ${player.lastName}`
    };
  }
  return {
    subject: `Pro\u015Bba o szans\u0119: ${player.lastName}`,
    body: `Trenerze,

Wiem, \u017Ce o miejsce w sk\u0142adzie trzeba cierpliwie walczy\u0107 i nie chc\u0119 stawia\u0107 sprawy na ostrzu no\u017Ca. Czuj\u0119 jednak, \u017Ce jestem gotowy, by pom\xF3c dru\u017Cynie cz\u0119\u015Bciej. ${formSentence}

Je\u015Bli pojawi si\u0119 okazja, prosz\u0119 da\u0107 mi szans\u0119. Chcia\u0142bym odpowiedzie\u0107 na boisku i pokaza\u0107, \u017Ce mo\u017Cna na mnie liczy\u0107.

${player.firstName} ${player.lastName}`
  };
};
var getDevelopmentExitDemandCopy = (player, personality, totalMinutes) => {
  const minutesLine = totalMinutes > 0 ? `W tym sezonie mam tylko ${totalMinutes} minut i to nie wystarcza, \u017Ceby si\u0119 rozwija\u0107.` : "W tym sezonie praktycznie nie dostaj\u0119 minut i nie mog\u0119 si\u0119 rozwija\u0107 bez gry.";
  const exitLine = player.age <= 23 ? "Jestem w wieku, w kt\xF3rym potrzebuj\u0119 regularnych wyst\u0119p\xF3w, a nie samego czekania na \u0142awce." : "Potrzebuj\u0119 regularnej gry, \u017Ceby utrzyma\u0107 rytm i swoj\u0105 pozycj\u0119 sportow\u0105.";
  if (personality === "EGOIST" || personality === "AMBITIOUS") {
    return {
      subject: `Pro\u015Bba o odej\u015Bcie albo wypo\u017Cyczenie: ${player.lastName}`,
      body: `Trenerze,

Rozmawiali\u015Bmy ju\u017C o minutach, ale moja sytuacja si\u0119 nie zmieni\u0142a. ${minutesLine} ${exitLine}

Je\u015Bli nie ma dla mnie realnego miejsca w zespole, prosz\u0119 o wystawienie mnie na list\u0119 transferow\u0105 albo zgod\u0119 na wypo\u017Cyczenie. Chc\u0119 gra\u0107, rozwija\u0107 si\u0119 i mie\u0107 jasn\u0105 drog\u0119 do kolejnego kroku.

Nie chc\u0119 przeci\u0105ga\u0107 tej sytuacji. Potrzebuj\u0119 konkretnej decyzji klubu.

${player.firstName} ${player.lastName}`,
      priority: 5,
      moraleDrop: -5
    };
  }
  if (personality === "LOYAL" || personality === "PROFESSIONAL" || personality === "CALM") {
    return {
      subject: `Pro\u015Bba o rozwi\u0105zanie sytuacji z minutami: ${player.lastName}`,
      body: `Trenerze,

Szanuj\u0119 decyzje sztabu, ale po mojej pro\u015Bbie o wi\u0119cej minut dalej nie dosta\u0142em realnej szansy. ${minutesLine} ${exitLine}

Je\u015Bli w najbli\u017Cszym czasie nie ma dla mnie miejsca w dru\u017Cynie, prosz\u0119 o zgod\u0119 na wypo\u017Cyczenie, a je\u015Bli to nie b\u0119dzie mo\u017Cliwe, o rozwa\u017Cenie transferu. Chc\u0119 zachowa\u0107 profesjonalizm, ale potrzebuj\u0119 gry.

${player.firstName} ${player.lastName}`,
      priority: 4,
      moraleDrop: -3
    };
  }
  return {
    subject: `Rozmowa o przysz\u0142o\u015Bci po braku minut: ${player.lastName}`,
    body: `Trenerze,

Po mojej pro\u015Bbie o wi\u0119cej wyst\u0119p\xF3w sytuacja si\u0119 nie zmieni\u0142a. ${minutesLine} ${exitLine}

Chcia\u0142bym porozmawia\u0107 o rozwi\u0105zaniu: albo dostan\u0119 realn\u0105 \u015Bcie\u017Ck\u0119 do gry tutaj, albo klub pozwoli mi odej\u015B\u0107 b\u0105d\u017A p\xF3j\u015B\u0107 na wypo\u017Cyczenie. Dla mojego rozwoju najwa\u017Cniejsze s\u0105 teraz regularne minuty.

${player.firstName} ${player.lastName}`,
    priority: 4,
    moraleDrop: -4
  };
};
var getTransferListDemandCopy = (player, personality, trigger, seasonOutputSummary) => {
  if (trigger === "STANDOUT_SEASON") {
    const outputSentence = seasonOutputSummary ? `Ten sezon daje mi konkretne argumenty: ${seasonOutputSummary}.` : "Ten sezon daje mi konkretne argumenty sportowe.";
    return {
      subject: `Pro\u015Bba po mocnym sezonie: ${player.lastName}`,
      body: `Trenerze,

Czuj\u0119, \u017Ce po takim sezonie powinienem zrobi\u0107 kolejny krok w karierze. ${outputSentence} Uwa\u017Cam, \u017Ce moja forma mo\u017Ce zainteresowa\u0107 mocniejsze kluby i nie chc\u0119 przegapi\u0107 tego momentu.

Prosz\u0119 o wystawienie mnie na list\u0119 transferow\u0105 albo jasn\u0105 deklaracj\u0119, \u017Ce klub b\u0119dzie got\xF3w rozmawia\u0107, je\u015Bli pojawi si\u0119 odpowiednia oferta. Chc\u0119 zachowa\u0107 profesjonalizm, ale potrzebuj\u0119 uczciwej drogi do rozwoju.

${player.firstName} ${player.lastName}`
    };
  }
  if (trigger === "STRONG_INTEREST") {
    return {
      subject: `Pro\u015Bba o zgod\u0119 na rozmowy: ${player.lastName}`,
      body: `Trenerze,

Wiem, \u017Ce interesuj\u0105 si\u0119 mn\u0105 kluby o wy\u017Cszej reputacji. Dla mnie to jasny sygna\u0142, \u017Ce mog\u0119 spr\xF3bowa\u0107 gry na wy\u017Cszym poziomie i chcia\u0142bym potraktowa\u0107 t\u0119 szans\u0119 powa\u017Cnie.

Prosz\u0119 o wystawienie mnie na list\u0119 transferow\u0105 albo zgod\u0119 na rozmowy przy odpowiedniej ofercie. Nie chc\u0119 odchodzi\u0107 w konflikcie, ale czuj\u0119, \u017Ce ten moment mo\u017Ce by\u0107 wa\u017Cny dla mojej kariery.

${player.firstName} ${player.lastName}`
    };
  }
  if (trigger === "HIGHER_REPUTATION") {
    return {
      subject: `Rozmowa o kolejnym kroku w karierze: ${player.lastName}`,
      body: `Trenerze,

Czuj\u0119, \u017Ce sportowo jestem gotowy na kolejny krok. Moja forma i poziom, kt\xF3ry pokazuj\u0119 na boisku, daj\u0105 mi przekonanie, \u017Ce powinienem spr\xF3bowa\u0107 gry w klubie o wy\u017Cszej reputacji i wi\u0119kszych ambicjach.

Szanuj\u0119 dru\u017Cyn\u0119 i nie chc\u0119 odchodzi\u0107 za wszelk\u0105 cen\u0119. Prosz\u0119 jednak o zgod\u0119 na odej\u015Bcie, je\u015Bli pojawi si\u0119 odpowiednia oferta z mocniejszego klubu. Chcia\u0142bym, \u017Ceby\u015Bmy uczciwie porozmawiali o mojej przysz\u0142o\u015Bci.

${player.firstName} ${player.lastName}`
    };
  }
  if (player.isUntouchable) {
    if (personality === "EGOIST" || personality === "AMBITIOUS" || personality === "CONFIDENT") {
      return {
        subject: `Rozmowa o mojej przysz\u0142o\u015Bci: ${player.lastName}`,
        body: `Trenerze,

Chcia\u0142bym porozmawia\u0107 o swojej przysz\u0142o\u015Bci. Wiem, \u017Ce klub oznaczy\u0142 mnie jako zawodnika \u201Enie na sprzeda\u017C\u201D, ale nie chc\u0119, \u017Ceby ten status zamkn\u0105\u0142 mi drog\u0119 do kolejnego kroku w karierze.

Czuj\u0119, \u017Ce jestem gotowy na nowe wyzwanie. Nie oczekuj\u0119 zgody na pierwszy przypadkowy transfer, ale chc\u0119 jasnej deklaracji, \u017Ce przy naprawd\u0119 dobrej ofercie klub b\u0119dzie gotowy usi\u0105\u015B\u0107 do rozm\xF3w.

${player.firstName} ${player.lastName}`
      };
    }
    return {
      subject: `Pro\u015Bba o rozmow\u0119 o przysz\u0142o\u015Bci: ${player.lastName}`,
      body: `Trenerze,

Doceniam, \u017Ce klub uwa\u017Ca mnie za wa\u017Cnego zawodnika. Chcia\u0142bym jednak spokojnie porozmawia\u0107 o statusie \u201Enie na sprzeda\u017C\u201D. W d\u0142u\u017Cszej perspektywie chcia\u0142bym mie\u0107 mo\u017Cliwo\u015B\u0107 zrobienia kolejnego kroku w karierze.

Nie zale\u017Cy mi na konflikcie ani odej\u015Bciu do przypadkowego zespo\u0142u. Prosz\u0119 tylko, aby klub pozosta\u0142 otwarty na naprawd\u0119 dobr\u0105 ofert\u0119 i potraktowa\u0142 moje ambicje powa\u017Cnie.

${player.firstName} ${player.lastName}`
    };
  }
  return {
    subject: `Pro\u015Bba o list\u0119 transferow\u0105: ${player.lastName}`,
    body: `Trenerze,

Nie czuj\u0119 si\u0119 ju\u017C dobrze w tej dru\u017Cynie. Mam poczucie, \u017Ce m\xF3j poziom sportowy i ambicje rozchodz\u0105 si\u0119 z miejscem, w kt\xF3rym obecnie jeste\u015Bmy jako zesp\xF3\u0142.

Prosz\u0119 o zgod\u0119 na wystawienie mnie na list\u0119 transferow\u0105. Chc\u0119 zachowa\u0107 profesjonalizm, ale potrzebuj\u0119 jasnej drogi do zmiany otoczenia.

${player.firstName} ${player.lastName}`
  };
};
var getPlayerTalkResponse = (talkType, isPositive) => {
  const responses = {
    PRAISE: {
      positive: "Dzi\u0119kuj\u0119, trenerze. Dobrze to s\u0142ysze\u0107. Postaram si\u0119 utrzyma\u0107 ten poziom.",
      negative: "Doceniam s\u0142owa, ale czuj\u0119, \u017Ce mog\u0142em da\u0107 dru\u017Cynie jeszcze wi\u0119cej."
    },
    MOTIVATE: {
      positive: "Jestem gotowy. Wyjd\u0119 na boisko z pe\u0142nym zaanga\u017Cowaniem.",
      negative: "Rozumiem, trenerze, ale potrzebuj\u0119 jeszcze chwili, \u017Ceby z\u0142apa\u0107 pewno\u015B\u0107."
    },
    SUPPORT: {
      positive: "Dzi\u0119ki za wsparcie. To dla mnie wa\u017Cne. Odpowiem na boisku.",
      negative: "Wiem, \u017Ce chcia\u0142 pan dobrze, ale dalej siedzi mi to w g\u0142owie."
    },
    CRITICIZE: {
      positive: "Przyjmuj\u0119 to. Wiem, \u017Ce musz\u0119 da\u0107 wi\u0119cej i popracuj\u0119 nad tym.",
      negative: "Rozumiem uwagi, ale czuj\u0119, \u017Ce ocena by\u0142a zbyt surowa."
    },
    PROMISE_MINUTES: {
      positive: "Dobrze, trenerze. B\u0119d\u0119 gotowy, kiedy dostan\u0119 swoj\u0105 szans\u0119.",
      negative: "Chc\u0119 w to wierzy\u0107, ale musz\u0119 zobaczy\u0107, \u017Ce naprawd\u0119 dostan\u0119 okazj\u0119."
    },
    PROMISE_ONE_TIME_BONUS: {
      positive: "Doceniam to, trenerze. Poczekam na decyzj\u0119 zarz\u0105du.",
      negative: "Rozumiem, ale sama rozmowa z zarz\u0105dem jeszcze niczego nie rozwi\u0105zuje."
    },
    DEMAND_WORK: {
      positive: "Ma pan racj\u0119. Podkr\u0119c\u0119 tempo na treningach.",
      negative: "Pracuj\u0119 ci\u0119\u017Cko, trenerze. Mam nadziej\u0119, \u017Ce te\u017C pan to zauwa\u017Cy."
    }
  };
  const response = responses[talkType];
  return isPositive ? response.positive : response.negative;
};
var isSameOrHigherRole = (currentRole, requestedRole) => {
  if (!requestedRole) return true;
  if (requestedRole === "STARTER") return currentRole === "STARTER" || currentRole === "KEY_PLAYER";
  return currentRole === "KEY_PLAYER";
};
var hasBrokenContractPromise = (player) => !!player.transferContractPromise?.broken;
var CLINCHED_CHAMPIONSHIP_MORALE_REASON = "Matematycznie zapewnione mistrzostwo kraju";
var CLINCHED_PROMOTION_MORALE_REASON = "Matematycznie zapewniony awans do wy\u017Cszej ligi";
var MORALE_BAND_FLOORS = [0, 25, 45, 60, 80, 100];
var getMoraleBandIndex = (morale) => {
  if (morale <= 19) return 0;
  if (morale <= 39) return 1;
  if (morale <= 59) return 2;
  if (morale <= 79) return 3;
  if (morale < 100) return 4;
  return 5;
};
var getMoraleFloorAfterBandSteps = (morale, steps) => {
  const targetIndex = Math.min(MORALE_BAND_FLOORS.length - 1, getMoraleBandIndex(morale) + Math.max(0, steps));
  return MORALE_BAND_FLOORS[targetIndex] ?? 100;
};
var getSeasonSuccessMoraleBoost = (currentMorale, baseBoost, levelUpSteps) => {
  if (levelUpSteps <= 0) return baseBoost;
  const targetMorale = getMoraleFloorAfterBandSteps(currentMorale, levelUpSteps);
  return Math.max(baseBoost, targetMorale - currentMorale);
};
var getRandomSeasonSuccessLevelUpSteps = (seed, offset) => seededRng(seed, offset) < 0.5 ? 1 : 2;
var getClinchedSeasonAchievementReason = (achievement) => achievement === "championship" ? CLINCHED_CHAMPIONSHIP_MORALE_REASON : CLINCHED_PROMOTION_MORALE_REASON;
var hasClinchedSeasonAchievementMorale = (player, achievement) => {
  const reason = getClinchedSeasonAchievementReason(achievement);
  return (player.moraleHistory ?? []).some((entry) => entry.reason === reason);
};
var PlayerMoraleService = {
  clamp: (morale) => Math.max(0, Math.min(100, Math.round(morale))),
  getInitialMorale: (player) => {
    const seed = stableHash(player.id);
    const mentality = player.attributes.mentality ?? 50;
    const ageBias = player.age <= 21 ? 0.04 : player.age >= 31 ? 0.02 : 0;
    const mentalityBias = (mentality - 50) / 500;
    const roll = Math.max(0, Math.min(0.999, seededRng(seed, 3) + ageBias + mentalityBias));
    const stars = roll < 0.16 ? 1 : roll < 0.36 ? 2 : roll < 0.66 ? 3 : roll < 0.88 ? 4 : 5;
    const ranges = {
      1: [10, 20],
      2: [25, 35],
      3: [45, 64],
      4: [68, 79],
      5: [84, 95]
    };
    const [min, max] = ranges[stars] ?? ranges[3];
    const variation = Math.floor(seededRng(seed, 11) * (max - min + 1));
    return PlayerMoraleService.clamp(min + variation);
  },
  getInitialPersonality: (player) => {
    const attrs = player.attributes;
    if ((attrs.workRate ?? 50) >= 75 && (attrs.mentality ?? 50) >= 68) return "PROFESSIONAL";
    if ((attrs.talent ?? 50) >= 78 || (attrs.attacking ?? 50) >= 76) return "AMBITIOUS";
    if ((attrs.leadership ?? 50) >= 76) return "CONFIDENT";
    if ((attrs.aggression ?? 50) >= 76) return "EGOIST";
    const index = Math.floor(seededRng(stableHash(player.id), 7) * PERSONALITIES.length);
    return PERSONALITIES[index] ?? "CALM";
  },
  getInitialMindset: (player) => {
    const morale = player.morale ?? PlayerMoraleService.getInitialMorale(player);
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const professionalBonus = personality === "PROFESSIONAL" ? 6 : personality === "LOYAL" ? 8 : personality === "EGOIST" ? -8 : 0;
    const ambitionPressure = personality === "AMBITIOUS" || personality === "EGOIST" ? 8 : personality === "CALM" ? -4 : 0;
    const hasRole = player.squadRole === "STARTER" || player.squadRole === "KEY_PLAYER";
    const youngDevelopmentNeed = player.age <= 23 ? 5 : 0;
    const ageStability = player.age >= 35 ? 16 : player.age >= 32 ? 11 : player.age >= 29 ? 7 : player.age >= 26 ? 3 : 0;
    return {
      coachTrust: PlayerMoraleService.clamp(morale + professionalBonus),
      clubHappiness: PlayerMoraleService.clamp(morale + Math.round(professionalBonus * 0.5)),
      squadBelonging: PlayerMoraleService.clamp(morale + (personality === "LOYAL" ? 10 : 0) - (player.isOnTransferList ? 18 : 0)),
      roleClarity: PlayerMoraleService.clamp(55 + (hasRole ? 12 : -4) + professionalBonus),
      playingTimeSatisfaction: PlayerMoraleService.clamp(morale + (hasRole ? 5 : -4)),
      developmentSatisfaction: PlayerMoraleService.clamp(morale - youngDevelopmentNeed + (player.trainingFocus ? 4 : 0)),
      transferOpenness: PlayerMoraleService.clamp(45 - morale + ambitionPressure - ageStability + (player.isOnTransferList ? 35 : 0) + (player.interestedClubs?.length ?? 0) * 5),
      conflictLevel: PlayerMoraleService.clamp(55 - morale + Math.max(0, ambitionPressure)),
      lastUpdatedAt: void 0,
      history: []
    };
  },
  normalizeMindset: (player) => {
    const initial = PlayerMoraleService.getInitialMindset(player);
    const existing = player.playerMindset;
    if (!existing) return initial;
    return {
      coachTrust: PlayerMoraleService.clamp(existing.coachTrust ?? initial.coachTrust),
      clubHappiness: PlayerMoraleService.clamp(existing.clubHappiness ?? initial.clubHappiness),
      squadBelonging: PlayerMoraleService.clamp(existing.squadBelonging ?? initial.squadBelonging),
      roleClarity: PlayerMoraleService.clamp(existing.roleClarity ?? initial.roleClarity),
      playingTimeSatisfaction: PlayerMoraleService.clamp(existing.playingTimeSatisfaction ?? initial.playingTimeSatisfaction),
      developmentSatisfaction: PlayerMoraleService.clamp(existing.developmentSatisfaction ?? initial.developmentSatisfaction),
      transferOpenness: PlayerMoraleService.clamp(existing.transferOpenness ?? initial.transferOpenness),
      conflictLevel: PlayerMoraleService.clamp(existing.conflictLevel ?? initial.conflictLevel),
      lastUpdatedAt: existing.lastUpdatedAt,
      history: existing.history ?? []
    };
  },
  inferMindsetDelta: (reason, moraleDelta) => {
    const text = reason.toLowerCase();
    const impact = Math.max(1, Math.min(10, Math.abs(moraleDelta)));
    const sign = moraleDelta >= 0 ? 1 : -1;
    const deltas = {
      clubHappiness: sign * Math.max(1, Math.round(impact * 0.7)),
      conflictLevel: sign > 0 ? -Math.max(1, Math.round(impact * 0.6)) : Math.max(1, Math.round(impact * 0.8))
    };
    const add = (key, value) => {
      deltas[key] = (deltas[key] ?? 0) + value;
    };
    if (text.includes("rozmow") || text.includes("trener") || text.includes("obietnic")) {
      add("coachTrust", sign * Math.max(1, Math.round(impact * 0.9)));
    }
    if (text.includes("minut") || text.includes("wyst\u0119p") || text.includes("gry w nast\u0119pnym meczu")) {
      add("playingTimeSatisfaction", sign * Math.max(2, impact));
      add("coachTrust", sign * Math.max(1, Math.round(impact * 0.5)));
    }
    if (text.includes("rola") || text.includes("status") || text.includes("podstawowa") || text.includes("kluczowy")) {
      add("roleClarity", sign * Math.max(2, impact));
      add("coachTrust", sign * Math.max(1, Math.round(impact * 0.5)));
    }
    if (text.includes("rozw") || text.includes("wypo\u017Cyczenie") || text.includes("braku minut")) {
      add("developmentSatisfaction", sign * Math.max(2, impact));
    }
    if (text.includes("transfer") || text.includes("odej") || text.includes("sprzeda") || text.includes("ofert")) {
      add("transferOpenness", sign > 0 ? -Math.max(1, Math.round(impact * 0.7)) : Math.max(2, impact));
      add("coachTrust", sign * Math.max(1, Math.round(impact * 0.4)));
    }
    if (text.includes("rezerw")) {
      add("squadBelonging", sign * Math.max(2, impact));
      add("roleClarity", sign * Math.max(1, Math.round(impact * 0.6)));
    }
    if (text.includes("konflikt") || text.includes("zignorowan") || text.includes("odrzucon") || text.includes("niespe\u0142nion")) {
      add("conflictLevel", Math.max(2, impact));
      add("coachTrust", -Math.max(2, impact));
    }
    if (text.includes("naturalna stabilizacja")) {
      return {
        clubHappiness: sign,
        conflictLevel: sign > 0 ? -1 : 1
      };
    }
    return deltas;
  },
  withMindsetChange: (player, deltas, reason, date) => {
    const current = PlayerMoraleService.normalizeMindset(player);
    const next = { ...current };
    let changed = false;
    Object.entries(deltas).forEach(([key, delta]) => {
      if (!delta) return;
      const previousValue = next[key];
      const nextValue = PlayerMoraleService.clamp(previousValue + delta);
      if (nextValue === previousValue) return;
      next[key] = nextValue;
      changed = true;
    });
    if (!changed) return { ...player, playerMindset: current };
    const entry = {
      id: `MINDSET_${player.id}_${date.getTime()}_${stableHash(reason)}`,
      date: toDateKey(date),
      reason,
      deltas
    };
    return {
      ...player,
      playerMindset: {
        ...next,
        lastUpdatedAt: toDateKey(date),
        history: [entry, ...current.history ?? []].slice(0, 16)
      }
    };
  },
  ensurePlayerState: (player) => ({
    ...player,
    form: typeof player.form === "number" ? player.form : PlayerFormService.calculate(player).score,
    morale: player.morale ?? PlayerMoraleService.getInitialMorale(player),
    moralePersonality: player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player),
    moraleHistory: player.moraleHistory ?? [],
    playerMindset: PlayerMoraleService.normalizeMindset(player),
    lastIndividualTalkDate: player.lastIndividualTalkDate ?? null,
    promisedMinutesUntil: player.promisedMinutesUntil ?? null,
    promisedMinutesBaseline: player.promisedMinutesBaseline ?? null,
    promisedRoleNextMatchFixtureId: player.promisedRoleNextMatchFixtureId ?? null,
    lastMoraleDemandDate: player.lastMoraleDemandDate ?? null,
    minutesDemandUntil: player.minutesDemandUntil ?? null,
    minutesDemandBaseline: player.minutesDemandBaseline ?? null,
    unresolvedMinutesDemandDate: player.unresolvedMinutesDemandDate ?? null,
    unresolvedMinutesDemandBaseline: player.unresolvedMinutesDemandBaseline ?? null,
    developmentExitDemandUntil: player.developmentExitDemandUntil ?? null,
    developmentExitDemandBaseline: player.developmentExitDemandBaseline ?? null,
    lastTemptingOfferConflictDate: player.lastTemptingOfferConflictDate ?? null,
    roleDemandUntil: player.roleDemandUntil ?? null,
    requestedSquadRole: player.requestedSquadRole ?? null,
    squadRoleMindsetLockUntil: player.squadRoleMindsetLockUntil ?? null,
    transferListDemandUntil: player.transferListDemandUntil ?? null,
    oneTimeBonusPromise: player.oneTimeBonusPromise ?? null,
    oneTimeBonusAwardedSeason: player.oneTimeBonusAwardedSeason ?? null,
    contractRaiseDemandUntil: player.contractRaiseDemandUntil ?? null,
    contractRaiseRequest: player.contractRaiseRequest ?? null,
    contractRaiseReminderUntil: player.contractRaiseReminderUntil ?? null,
    contractRaiseTeamMoraleDelta: player.contractRaiseTeamMoraleDelta ?? null,
    contractRaiseTeamMoraleReason: player.contractRaiseTeamMoraleReason ?? null,
    reserveProtestUntil: player.reserveProtestUntil ?? null,
    moraleDemandLockoutUntil: player.moraleDemandLockoutUntil ?? null,
    // ── Transfer Request Dialog (PlayerTransferRequestDialogService) ──────────
    transferContractPromise: player.transferContractPromise ?? null,
    transferAllowAfterSeason: player.transferAllowAfterSeason ?? false,
    transferAllowAfterSeasonDeadline: player.transferAllowAfterSeasonDeadline ?? null,
    transferRequestPendingResponse: player.transferRequestPendingResponse ?? null
  }),
  getMoraleDemandLockoutUntil: (currentDate) => {
    const lockoutUntil = new Date(currentDate);
    lockoutUntil.setFullYear(lockoutUntil.getFullYear() + 1);
    return lockoutUntil.toISOString();
  },
  isMoraleDemandLocked: (player, currentDate) => {
    if (!player.moraleDemandLockoutUntil) return false;
    const lockoutUntil = new Date(player.moraleDemandLockoutUntil);
    return !Number.isNaN(lockoutUntil.getTime()) && dateOnly(currentDate).getTime() < dateOnly(lockoutUntil).getTime();
  },
  hasActiveMoraleDemand: (player) => !!player.minutesDemandUntil || !!player.roleDemandUntil || !!player.transferListDemandUntil || !!player.developmentExitDemandUntil || !!player.contractRaiseDemandUntil || !!player.reserveProtestUntil || !!player.boardAppealDeadline,
  applyClinchedSeasonAchievementMorale: (player, achievement, currentDate) => {
    let withMorale = PlayerMoraleService.ensurePlayerState(player);
    if (hasClinchedSeasonAchievementMorale(withMorale, achievement)) return withMorale;
    const baseBoost = achievement === "championship" ? 8 : 7;
    const reason = getClinchedSeasonAchievementReason(achievement);
    const currentMorale = withMorale.morale ?? 50;
    const seed = stableHash(`${withMorale.id}_${toDateKey(currentDate)}_${achievement}_CLINCHED`);
    const achievementBoost = getSeasonSuccessMoraleBoost(
      currentMorale,
      baseBoost,
      getRandomSeasonSuccessLevelUpSteps(seed, 41)
    );
    const effectiveMoraleBoost = hasBrokenContractPromise(withMorale) ? Math.max(1, Math.round(achievementBoost * 0.35)) : achievementBoost;
    withMorale = PlayerMoraleService.withMoraleChange(withMorale, effectiveMoraleBoost, reason, currentDate);
    return PlayerMoraleService.withMindsetChange(
      withMorale,
      {
        clubHappiness: achievement === "championship" ? 10 : 8,
        squadBelonging: achievement === "championship" ? 9 : 7,
        developmentSatisfaction: achievement === "promotion" ? 7 : 4,
        transferOpenness: achievement === "championship" ? -16 : -14,
        conflictLevel: hasBrokenContractPromise(withMorale) ? 0 : -7
      },
      reason,
      currentDate
    );
  },
  applyPresidentTeamBonusMorale: (player, totalBonusAmount, squadSize, currentDate) => {
    let withMorale = PlayerMoraleService.ensurePlayerState(player);
    const mindset = PlayerMoraleService.normalizeMindset(withMorale);
    const personality = withMorale.moralePersonality ?? "CALM";
    const seed = stableHash(`${withMorale.id}_${toDateKey(currentDate)}_${totalBonusAmount}_PRESIDENT_TEAM_BONUS`);
    const shareValue = totalBonusAmount / Math.max(1, squadSize);
    const amountBonus = shareValue >= 1e5 ? 2 : shareValue >= 5e4 ? 1 : 0;
    const gratitudeScore = (withMorale.morale ?? 50) * 0.14 + mindset.clubHappiness * 0.24 + mindset.squadBelonging * 0.18 + mindset.coachTrust * 0.1 - mindset.conflictLevel * 0.18 + (personality === "LOYAL" || personality === "PROFESSIONAL" ? 10 : 0) + (personality === "EGOIST" || personality === "AMBITIOUS" ? -4 : 0) + seededRng(seed, 31) * 24;
    const moraleDelta = gratitudeScore >= 66 ? Math.min(6, 4 + amountBonus) : gratitudeScore >= 50 ? Math.min(4, 2 + amountBonus) : gratitudeScore >= 36 ? 1 : 0;
    const reason = moraleDelta > 0 ? "Premia dru\u017Cynowa prezesa poprawi\u0142a morale" : "Premia dru\u017Cynowa prezesa przyj\u0119ta neutralnie";
    if (moraleDelta > 0) {
      withMorale = PlayerMoraleService.withMoraleChange(withMorale, moraleDelta, reason, currentDate);
    }
    return PlayerMoraleService.withMindsetChange(
      withMorale,
      moraleDelta > 0 ? { clubHappiness: 4 + moraleDelta, squadBelonging: 2 + Math.ceil(moraleDelta / 2), conflictLevel: -2 } : { clubHappiness: 1, squadBelonging: 1 },
      reason,
      currentDate
    );
  },
  applyContractSigningMindflowReset: (player, currentDate) => ({
    ...player,
    playerMindset: PlayerMoraleService.withMindsetChange(
      PlayerMoraleService.ensurePlayerState(player),
      {
        coachTrust: 8,
        clubHappiness: 6,
        roleClarity: 4,
        transferOpenness: -12,
        conflictLevel: -12
      },
      "Podpisanie kontraktu i wyciszenie \u017C\u0105da\u0144",
      currentDate
    ).playerMindset,
    moraleDemandLockoutUntil: PlayerMoraleService.getMoraleDemandLockoutUntil(currentDate),
    lastMoraleDemandDate: null,
    promisedMinutesUntil: null,
    minutesDemandUntil: null,
    minutesDemandBaseline: null,
    unresolvedMinutesDemandDate: null,
    unresolvedMinutesDemandBaseline: null,
    developmentExitDemandUntil: null,
    developmentExitDemandBaseline: null,
    lastTemptingOfferConflictDate: null,
    promisedRoleNextMatchFixtureId: null,
    roleDemandUntil: null,
    requestedSquadRole: null,
    transferListDemandUntil: null,
    contractRaiseDemandUntil: null,
    contractRaiseRequest: null,
    contractRaiseReminderUntil: null,
    contractRaiseTeamMoraleDelta: null,
    contractRaiseTeamMoraleReason: null,
    reserveProtestUntil: null,
    // ── Transfer Request Dialog — czyść po podpisaniu kontraktu ──────────────
    // Podpisanie kontraktu = obietnica A została spełniona (lub nieaktualna)
    // PlayerTransferRequestDialogService zarządza tymi polami
    transferContractPromise: null,
    transferAllowAfterSeason: false,
    transferAllowAfterSeasonDeadline: null,
    transferRequestPendingResponse: null
  }),
  applySeasonOutcomeMindflow: (player, input) => {
    const { club, currentDate, squadAverage } = input;
    let withMorale = PlayerMoraleService.ensurePlayerState(player);
    const dateKey = toDateKey(currentDate);
    const personality = withMorale.moralePersonality ?? "CALM";
    const seed = stableHash(`${withMorale.id}_${dateKey}_SEASON_OUTCOME`);
    const roll = seededRng(seed, 71);
    const stayReasonParts = [
      input.isChampion ? "mistrzostwo kraju" : null,
      input.isPromoted ? "awans do wy\u017Cszej ligi" : null,
      input.qualifiedForEurope ? "gra w europejskich pucharach" : null,
      input.wonCup ? "zdobycie pucharu" : null
    ].filter(Boolean);
    if (stayReasonParts.length > 0) {
      const alreadyAppliedChampionshipMorale = input.isChampion && hasClinchedSeasonAchievementMorale(withMorale, "championship");
      const alreadyAppliedPromotionMorale = input.isPromoted && hasClinchedSeasonAchievementMorale(withMorale, "promotion");
      const alreadyAppliedMainAchievementMorale = !!alreadyAppliedChampionshipMorale || !!alreadyAppliedPromotionMorale;
      const personalityStayBias = personality === "LOYAL" ? 0.18 : personality === "PROFESSIONAL" ? 0.12 : personality === "CALM" ? 0.08 : personality === "AMBITIOUS" ? -0.02 : personality === "EGOIST" ? -0.1 : 0;
      const loyalty2 = Math.max(1, Math.min(99, Math.round(withMorale.lojalnosc ?? 50)));
      const loyaltyStayModifier = (loyalty2 - 50) / 49 * 0.16;
      const hadExitIntent = !!withMorale.isOnTransferList || !!withMorale.transferListDemandUntil || !!withMorale.developmentExitDemandUntil || !!withMorale.transferAllowAfterSeason;
      const successScore = (input.isChampion ? 0.24 : 0) + (input.isPromoted ? 0.2 : 0) + (input.qualifiedForEurope ? 0.22 : 0) + (input.wonCup ? 0.16 : 0);
      const roleBonus = withMorale.squadRole === "KEY_PLAYER" || withMorale.isUntouchable ? 0.08 : withMorale.squadRole === "STARTER" ? 0.04 : 0;
      const promotionReconsiderBonus = input.isPromoted && hadExitIntent ? 0.18 : 0;
      const stayChance = Math.max(0.18, Math.min(0.84, 0.24 + successScore + personalityStayBias + loyaltyStayModifier + roleBonus + promotionReconsiderBonus));
      const moraleBoost = alreadyAppliedMainAchievementMorale ? input.wonCup ? 5 : 0 : input.isChampion ? 8 : input.isPromoted ? 7 : input.qualifiedForEurope ? 6 : 5;
      const reason = `Sukces klubu zmienia nastawienie: ${stayReasonParts.join(", ")}`;
      const isContractPromiseConflict = hasBrokenContractPromise(withMorale);
      const currentMorale = withMorale.morale ?? 50;
      const shouldApplyMainAchievementMorale = !!input.isChampion && !alreadyAppliedChampionshipMorale || !!input.isPromoted && !alreadyAppliedPromotionMorale;
      const seasonAchievementBoost = getSeasonSuccessMoraleBoost(
        currentMorale,
        moraleBoost,
        shouldApplyMainAchievementMorale ? getRandomSeasonSuccessLevelUpSteps(seed, 83) : 0
      );
      const effectiveMoraleBoost = seasonAchievementBoost <= 0 ? 0 : isContractPromiseConflict ? Math.max(1, Math.round(seasonAchievementBoost * 0.35)) : seasonAchievementBoost;
      if (effectiveMoraleBoost > 0) {
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, effectiveMoraleBoost, reason, currentDate);
      }
      withMorale = PlayerMoraleService.withMindsetChange(
        withMorale,
        {
          clubHappiness: 8,
          squadBelonging: 7,
          developmentSatisfaction: input.qualifiedForEurope || input.isPromoted ? 6 : 3,
          transferOpenness: -Math.round(10 + successScore * 20),
          conflictLevel: isContractPromiseConflict ? 0 : -6
        },
        reason,
        currentDate
      );
      if (roll < stayChance) {
        const shouldWithdrawTransferIntent = input.isPromoted && hadExitIntent ? true : withMorale.isOnTransferList && roll < stayChance * 0.35;
        const nextIsOnTransferList = shouldWithdrawTransferIntent ? false : withMorale.isOnTransferList;
        withMorale = {
          ...withMorale,
          transferListDemandUntil: null,
          developmentExitDemandUntil: null,
          transferAllowAfterSeason: shouldWithdrawTransferIntent ? false : withMorale.transferAllowAfterSeason,
          transferAllowAfterSeasonDeadline: shouldWithdrawTransferIntent ? null : withMorale.transferAllowAfterSeasonDeadline,
          lastTemptingOfferConflictDate: null,
          isOnTransferList: nextIsOnTransferList,
          transferListPrice: nextIsOnTransferList ? withMorale.transferListPrice : void 0
        };
      }
      if (input.isPromoted && shouldRequestPromotionRaise(withMorale, club, squadAverage, currentDate)) {
        const deadline2 = new Date(currentDate);
        deadline2.setDate(deadline2.getDate() + 21);
        const deadlineKey2 = toDateKey(deadline2);
        const raiseRequest = getPromotionRaiseRequest(withMorale, club, squadAverage);
        const playerName2 = `${withMorale.firstName} ${withMorale.lastName}`;
        const mail2 = input.createMail ? {
          id: `PLAYER_PROMOTION_RAISE_REQUEST_${withMorale.id}_${dateKey}`,
          sender: playerName2,
          role: "Zawodnik",
          subject: `Pro\u015Bba po awansie: ${withMorale.lastName}`,
          body: [
            "Trenerze,",
            "",
            "Awans do wy\u017Cszej ligi to du\u017Cy krok dla klubu i ciesz\u0119 si\u0119, \u017Ce by\u0142em cz\u0119\u015Bci\u0105 tego sezonu.",
            `Rozegra\u0142em ${raiseRequest.matches} mecz\xF3w i czuj\u0119, \u017Ce moja rola w dru\u017Cynie powinna znale\u017A\u0107 odbicie w kontrakcie po wej\u015Bciu na wy\u017Cszy poziom.`,
            "",
            `Oczekuj\u0119 podwy\u017Cki o ${raiseRequest.raisePct}%: kontraktu na ${raiseRequest.years} ${raiseRequest.years === 1 ? "rok" : "lata"}, pensji ${raiseRequest.salary.toLocaleString("pl-PL")} PLN rocznie oraz ${raiseRequest.bonus.toLocaleString("pl-PL")} PLN za podpis.`,
            "",
            `Prosz\u0119 o odpowied\u017A do ${deadline2.toLocaleDateString("pl-PL")}. Chc\u0119 dalej i\u015B\u0107 z klubem, ale po awansie potrzebuj\u0119 jasnego sygna\u0142u, \u017Ce m\xF3j wk\u0142ad jest doceniany.`,
            "",
            playerName2
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: withMorale.squadRole === "KEY_PLAYER" || withMorale.isUntouchable ? 6 : 5,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "RAISE",
            requestedSalary: raiseRequest.salary,
            requestedBonus: raiseRequest.bonus,
            requestedYears: raiseRequest.years,
            responseDeadline: deadlineKey2
          }
        } : null;
        return {
          player: {
            ...PlayerMoraleService.withMoraleChange(withMorale, -1, "Zawodnik oczekuje podwy\u017Cki po awansie", currentDate),
            lastMoraleDemandDate: dateKey,
            contractRaiseDemandUntil: deadlineKey2,
            contractRaiseRequest: {
              salary: raiseRequest.salary,
              bonus: raiseRequest.bonus,
              years: raiseRequest.years,
              requestedAt: dateKey,
              deadline: deadlineKey2,
              reason: raiseRequest.reason,
              raisePct: raiseRequest.raisePct
            }
          },
          mail: mail2
        };
      }
      return { player: withMorale, mail: null };
    }
    if (!input.isRelegated) return { player: withMorale, mail: null };
    const contractDaysLeft = getContractDaysLeft(withMorale, currentDate);
    const isGoodEnoughForBetterClub = withMorale.overallRating >= Math.max(62, squadAverage + 5) && (withMorale.overallRating >= 68 || withMorale.marketValue >= Math.max(4e5, (withMorale.annualSalary ?? 0) * 3) || hasStandoutSeasonOutput(withMorale, getSeasonOutputProfile(withMorale)));
    const careerStageCanMove = withMorale.age <= 32 || withMorale.overallRating >= squadAverage + 9;
    const reputationCeilingPressure = Math.max(0, (withMorale.overallRating - 58) / 5 - club.reputation);
    const personalityExitBias = personality === "EGOIST" ? 0.18 : personality === "AMBITIOUS" ? 0.14 : personality === "CONFIDENT" ? 0.08 : personality === "LOYAL" ? -0.18 : personality === "PROFESSIONAL" ? -0.06 : 0;
    const loyalty = Math.max(1, Math.min(99, Math.round(withMorale.lojalnosc ?? 50)));
    const loyaltyExitModifier = (50 - loyalty) / 49 * 0.24;
    const exitChance = Math.max(
      0.08,
      Math.min(
        0.76,
        0.16 + personalityExitBias + loyaltyExitModifier + Math.max(0, withMorale.overallRating - squadAverage) * 0.025 + Math.min(0.16, reputationCeilingPressure * 0.04) + (contractDaysLeft > 365 ? 0.06 : -0.08)
      )
    );
    const relegationReason = "Spadek dru\u017Cyny zwi\u0119ksza presj\u0119 na odej\u015Bcie";
    withMorale = PlayerMoraleService.withMoraleChange(withMorale, -4, relegationReason, currentDate);
    withMorale = PlayerMoraleService.withMindsetChange(
      withMorale,
      {
        clubHappiness: -9,
        squadBelonging: -6,
        developmentSatisfaction: -8,
        transferOpenness: isGoodEnoughForBetterClub ? 18 : 7,
        conflictLevel: isGoodEnoughForBetterClub ? 7 : 3
      },
      relegationReason,
      currentDate
    );
    if (!isGoodEnoughForBetterClub || !careerStageCanMove || withMorale.isOnTransferList || withMorale.transferPendingClubId || PlayerMoraleService.isMoraleDemandLocked(withMorale, currentDate) || roll >= exitChance) {
      return { player: withMorale, mail: null };
    }
    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 45);
    const deadlineKey = toDateKey(deadline);
    const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
    const mail = input.createMail ? {
      id: `PLAYER_RELEGATION_EXIT_REQUEST_${withMorale.id}_${dateKey}`,
      sender: playerName,
      role: "Zawodnik",
      subject: `Pro\u015Bba po spadku: ${withMorale.lastName}`,
      body: [
        "Trenerze,",
        "",
        "Po spadku dru\u017Cyny musz\u0119 uczciwie spojrze\u0107 na swoj\u0105 przysz\u0142o\u015B\u0107. Szanuj\u0119 klub, ale czuj\u0119, \u017Ce m\xF3j poziom sportowy pozwala mi dalej gra\u0107 wy\u017Cej.",
        "",
        "Nie chc\u0119 odchodzi\u0107 w konflikcie ani za wszelk\u0105 cen\u0119. Prosz\u0119 jednak, \u017Ceby klub by\u0142 gotowy rozmawia\u0107 przy odpowiedniej ofercie i nie blokowa\u0142 mi wcze\u015Bniejszego odej\u015Bcia, je\u015Bli pojawi si\u0119 rozs\u0105dna propozycja.",
        "",
        playerName
      ].join("\n"),
      date: new Date(currentDate),
      isRead: false,
      type: "STAFF" /* STAFF */,
      priority: 5,
      metadata: {
        type: "PLAYER_MORALE_REQUEST",
        playerId: withMorale.id,
        requestType: "TRANSFER_LIST",
        responseDeadline: deadlineKey
      }
    } : null;
    return {
      player: {
        ...withMorale,
        isOnTransferList: true,
        isUntouchable: false,
        transferListPrice: withMorale.transferListPrice ?? void 0,
        transferLockoutUntil: null,
        transferOfferBanUntil: null,
        lastMoraleDemandDate: dateKey,
        transferListDemandUntil: deadlineKey
      },
      mail
    };
  },
  withMoraleChange: (player, delta, reason, date) => {
    const withMorale = PlayerMoraleService.ensurePlayerState(player);
    const previousMorale = withMorale.morale ?? 50;
    const rawNextMorale = PlayerMoraleService.clamp(previousMorale + delta);
    const nextMorale = hasBrokenContractPromise(withMorale) ? Math.min(rawNextMorale, 59) : rawNextMorale;
    if (delta === 0 || nextMorale === previousMorale) return withMorale;
    const entry = {
      id: `MORALE_${withMorale.id}_${date.getTime()}_${Math.abs(delta)}_${stableHash(reason)}`,
      date: toDateKey(date),
      delta: nextMorale - previousMorale,
      reason,
      moraleAfter: nextMorale
    };
    const withUpdatedMindset = PlayerMoraleService.withMindsetChange(
      withMorale,
      PlayerMoraleService.inferMindsetDelta(reason, nextMorale - previousMorale),
      reason,
      date
    );
    return PlayerFormService.withUpdatedForm({
      ...withMorale,
      playerMindset: withUpdatedMindset.playerMindset,
      morale: nextMorale,
      moraleHistory: [entry, ...withMorale.moraleHistory ?? []].slice(0, 12)
    });
  },
  getInfo: (morale = 50) => {
    if (morale <= 19) {
      return { label: "Bardzo s\u0142abe", colorClass: "text-red-500", barClass: "bg-red-500", description: "Zawodnik gra spi\u0119ty i \u0142atwiej traci pewno\u015B\u0107 po b\u0142\u0119dzie." };
    }
    if (morale <= 39) {
      return { label: "S\u0142abe", colorClass: "text-orange-400", barClass: "bg-orange-500", description: "Potrzebuje dobrego wyst\u0119pu albo rozmowy, \u017Ceby wr\xF3ci\u0107 do rytmu." };
    }
    if (morale <= 59) {
      return { label: "Normalne", colorClass: "text-slate-200", barClass: "bg-slate-400", description: "Stabilne nastawienie bez wyra\u017Anych odchyle\u0144." };
    }
    if (morale <= 79) {
      return { label: "Wysokie", colorClass: "text-emerald-400", barClass: "bg-emerald-500", description: "Zawodnik jest pewniejszy w decyzjach i aktywniejszy w meczu." };
    }
    return { label: "Bardzo wysokie", colorClass: "text-yellow-400", barClass: "bg-yellow-400", description: "Zawodnik jest w \u015Bwietnym nastawieniu i mo\u017Ce gra\u0107 powy\u017Cej bazowej oceny." };
  },
  getPersonalityLabel: (personality = "CALM") => {
    const labels = {
      PROFESSIONAL: "Profesjonalista",
      AMBITIOUS: "Ambitny",
      SENSITIVE: "Wra\u017Cliwy",
      CONFIDENT: "Pewny siebie",
      NERVOUS: "Nerwowy",
      LOYAL: "Lojalny",
      EGOIST: "Egoista",
      CALM: "Spokojny"
    };
    return labels[personality];
  },
  canTalk: (player, currentDate) => {
    if (!player.lastIndividualTalkDate) return true;
    const last = new Date(player.lastIndividualTalkDate);
    if (Number.isNaN(last.getTime())) return true;
    return dayDiff(last, currentDate) >= 7;
  },
  getNextTalkDate: (player) => {
    if (!player.lastIndividualTalkDate) return null;
    const last = new Date(player.lastIndividualTalkDate);
    if (Number.isNaN(last.getTime())) return null;
    const next = new Date(last);
    next.setDate(next.getDate() + 7);
    return next;
  },
  calculateTalkResult: (player, talkType, currentDate, seed) => {
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const morale = player.morale ?? PlayerMoraleService.getInitialMorale(player);
    const recentRating = player.stats.ratingHistory?.at(-1) ?? 6.5;
    const rng = seededRng(seed + stableHash(player.id) + currentDate.getTime(), talkType.length);
    let base = 3;
    let successChance = 0.58;
    if (talkType === "PRAISE") {
      base = recentRating >= 7.2 ? 7 : 3;
      successChance = recentRating >= 7.2 ? 0.78 : 0.45;
      if (personality === "CONFIDENT" || personality === "EGOIST") successChance += 0.08;
    }
    if (talkType === "MOTIVATE") {
      base = 5;
      if (personality === "AMBITIOUS" || personality === "CONFIDENT") successChance += 0.12;
      if (personality === "CALM") successChance += 0.04;
    }
    if (talkType === "SUPPORT") {
      base = morale < 45 ? 7 : 4;
      successChance = 0.7;
      if (personality === "SENSITIVE" || personality === "NERVOUS") successChance += 0.12;
      if (personality === "EGOIST") successChance -= 0.08;
    }
    if (talkType === "CRITICIZE") {
      base = recentRating < 6.3 ? 6 : 2;
      successChance = recentRating < 6.3 ? 0.52 : 0.34;
      if (personality === "PROFESSIONAL" || personality === "AMBITIOUS") successChance += 0.18;
      if (personality === "SENSITIVE" || personality === "NERVOUS") successChance -= 0.22;
      if (personality === "EGOIST") successChance -= 0.15;
    }
    if (talkType === "PROMISE_MINUTES") {
      base = player.squadRole === "KEY_PLAYER" ? 2 : 6;
      successChance = 0.68;
      if (personality === "AMBITIOUS" || personality === "EGOIST") successChance += 0.08;
      if (personality === "LOYAL") successChance -= 0.05;
    }
    if (talkType === "PROMISE_ONE_TIME_BONUS") {
      base = 1;
      successChance = 0.72;
      if (personality === "LOYAL" || personality === "PROFESSIONAL") successChance += 0.08;
      if (personality === "EGOIST" || personality === "AMBITIOUS") successChance -= 0.08;
    }
    if (talkType === "DEMAND_WORK") {
      base = 4;
      successChance = 0.5;
      if (personality === "PROFESSIONAL" || personality === "AMBITIOUS") successChance += 0.18;
      if (personality === "SENSITIVE") successChance -= 0.16;
    }
    successChance = Math.max(0.12, Math.min(0.88, successChance));
    const isPositive = rng < successChance;
    const swing = 1 + Math.floor(seededRng(seed, talkType.charCodeAt(0)) * 3);
    const backfireRisk = 0.22 + (talkType === "CRITICIZE" || talkType === "DEMAND_WORK" ? 0.18 : 0) + (talkType === "PROMISE_MINUTES" ? 0.1 : 0) + (personality === "SENSITIVE" || personality === "NERVOUS" ? 0.18 : 0) + (personality === "EGOIST" ? 0.1 : 0);
    const backfireRoll = seededRng(seed + stableHash(player.id), talkType.charCodeAt(0) + 31);
    const severeBackfire = !isPositive && backfireRoll < Math.min(0.72, backfireRisk);
    const negativeDrop = 10 + base + swing * 3 + (severeBackfire ? 16 + Math.round(morale * 0.12) : 0);
    const rawMoraleDelta = isPositive ? base + swing : -negativeDrop;
    const rawNewMorale = PlayerMoraleService.clamp(morale + rawMoraleDelta);
    const newMorale = !isPositive && talkType === "CRITICIZE" ? Math.min(rawNewMorale, 39) : rawNewMorale;
    const moraleDelta = newMorale - morale;
    const reactionText = getPlayerTalkResponse(talkType, isPositive);
    return { moraleDelta, newMorale, isPositive, reactionText };
  },
  applyTrainingMood: (player, intensity) => {
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const fatigue = player.fatigueDebt ?? 0;
    let delta = 0;
    if (intensity === "HEAVY" /* HEAVY */) {
      delta = personality === "PROFESSIONAL" || personality === "AMBITIOUS" ? 1 : -1;
      if (fatigue > 45) delta -= 2;
      if (player.condition < 65) delta -= 1;
    } else if (intensity === "LIGHT" /* LIGHT */) {
      delta = fatigue > 35 || player.condition < 70 ? 2 : 0;
      if (personality === "AMBITIOUS" && fatigue < 20) delta -= 1;
    }
    return delta;
  },
  getMatchMultiplier: (player) => {
    const morale = player.morale ?? 50;
    if (morale <= 19) return 0.95;
    if (morale <= 39) return 0.98;
    if (morale <= 59) return 1;
    if (morale <= 79) return 1.015;
    return 1.03;
  },
  getMatchContributionMultiplier: (player) => {
    const morale = player.morale ?? 50;
    if (morale <= 19) return 0.78;
    if (morale <= 39) return 0.9;
    if (morale <= 59) return 1;
    if (morale <= 79) return 1.06;
    return 1.12;
  },
  getLineupReadinessMultiplier: (player) => {
    const morale = player.morale ?? 50;
    if (morale <= 19) return 0.8;
    if (morale <= 39) return 0.92;
    if (morale <= 59) return 1;
    if (morale <= 79) return 1.06;
    return 1.12;
  },
  getEffectiveOverall: (player) => Math.round(player.overallRating * PlayerMoraleService.getLineupReadinessMultiplier(player)),
  applyNaturalDrift: (player) => {
    const morale = player.morale ?? PlayerMoraleService.getInitialMorale(player);
    const drift = morale > 60 ? -1 : morale < 40 ? 1 : 0;
    return { ...player, morale: PlayerMoraleService.clamp(morale + drift) };
  },
  getMindsetMoraleFeedback: (player) => {
    const mindset = PlayerMoraleService.normalizeMindset(player);
    const morale = player.morale ?? 50;
    const low = (value, threshold, weight) => Math.max(0, threshold - value) * weight;
    const high = (value, threshold, weight) => Math.max(0, value - threshold) * weight;
    const pressure = low(mindset.coachTrust, 45, 0.05) + low(mindset.clubHappiness, 42, 0.04) + low(mindset.roleClarity, 40, 0.035) + low(mindset.playingTimeSatisfaction, 42, 0.045) + low(mindset.developmentSatisfaction, 42, 0.035) + high(mindset.transferOpenness, 60, 0.04) + high(mindset.conflictLevel, 55, 0.06);
    const comfort = high(mindset.coachTrust, 70, 0.035) + high(mindset.clubHappiness, 68, 0.04) + high(mindset.roleClarity, 65, 0.025) + high(mindset.playingTimeSatisfaction, 65, 0.03) + high(mindset.developmentSatisfaction, 68, 0.03) + low(mindset.transferOpenness, 35, 0.025) + low(mindset.conflictLevel, 30, 0.035);
    const personality = player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player);
    const negativePersonalityMod = personality === "SENSITIVE" || personality === "NERVOUS" ? 1.18 : personality === "EGOIST" || personality === "AMBITIOUS" ? 1.1 : personality === "PROFESSIONAL" || personality === "LOYAL" ? 0.86 : 1;
    const positivePersonalityMod = personality === "PROFESSIONAL" || personality === "LOYAL" || personality === "CALM" ? 1.12 : personality === "EGOIST" ? 0.88 : 1;
    const raw = comfort * positivePersonalityMod - pressure * negativePersonalityMod;
    const damped = raw > 0 && morale >= 80 ? raw * 0.6 : raw < 0 && morale <= 19 ? raw * 0.7 : raw;
    const delta = damped >= 2.2 ? 2 : damped >= 1.05 ? 1 : damped <= -3.2 ? -3 : damped <= -2 ? -2 : damped <= -0.9 ? -1 : 0;
    if (delta === 0) return null;
    return {
      delta,
      reason: delta > 0 ? "Pozytywny mindset stabilizuje morale" : "Negatywny mindset obni\u017Ca morale"
    };
  },
  getTotalMinutesPlayed: (player) => (player.stats?.minutesPlayed ?? 0) + (player.reserveStats?.matches ?? 0) * 90,
  reviewMinutePromise: (player, currentDate) => {
    const withMorale = PlayerMoraleService.ensurePlayerState(player);
    if (!withMorale.promisedMinutesUntil) {
      return { player: withMorale, fulfilled: false, expired: false, moraleDelta: 0 };
    }
    const baseline = withMorale.promisedMinutesBaseline ?? PlayerMoraleService.getTotalMinutesPlayed(withMorale);
    const currentMinutes = PlayerMoraleService.getTotalMinutesPlayed(withMorale);
    const deadline = new Date(withMorale.promisedMinutesUntil);
    const fulfilled = currentMinutes > baseline;
    const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
    if (fulfilled) {
      const moraleDelta = 3;
      return {
        player: {
          ...withMorale,
          ...PlayerMoraleService.withMoraleChange(withMorale, moraleDelta, "Obietnica minut spe\u0142niona", currentDate),
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
          promisedRoleNextMatchFixtureId: null
        },
        fulfilled: true,
        expired: false,
        moraleDelta
      };
    }
    if (expired && !isAvailableForMinutesDemand(withMorale)) {
      return {
        player: {
          ...withMorale,
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
          promisedRoleNextMatchFixtureId: null
        },
        fulfilled: false,
        expired: true,
        moraleDelta: 0
      };
    }
    if (expired) {
      const personality = withMorale.moralePersonality ?? "CALM";
      const isRoleNextMatchPromise = !!withMorale.promisedRoleNextMatchFixtureId;
      const moraleDelta = isRoleNextMatchPromise ? personality === "LOYAL" || personality === "CALM" ? -8 : personality === "AMBITIOUS" || personality === "EGOIST" ? -16 : -12 : personality === "LOYAL" || personality === "CALM" ? -6 : personality === "AMBITIOUS" || personality === "EGOIST" ? -12 : -9;
      return {
        player: {
          ...withMorale,
          ...PlayerMoraleService.withMoraleChange(
            withMorale,
            moraleDelta,
            isRoleNextMatchPromise ? "Niespe\u0142niona obietnica gry w nast\u0119pnym meczu" : "Niespe\u0142niona obietnica minut",
            currentDate
          ),
          promisedMinutesUntil: null,
          promisedMinutesBaseline: null,
          promisedRoleNextMatchFixtureId: null
        },
        fulfilled: false,
        expired: true,
        moraleDelta
      };
    }
    return { player: withMorale, fulfilled: false, expired: false, moraleDelta: 0 };
  },
  processPeriodicReview: (players, currentDate) => {
    const reviewedPlayers = players.map((player) => {
      const demandReview = PlayerMoraleService.reviewPlayerDemands(player, currentDate);
      const promiseReview = PlayerMoraleService.reviewMinutePromise(demandReview, currentDate);
      const mindsetFeedback = currentDate.getDay() === 1 ? PlayerMoraleService.getMindsetMoraleFeedback(promiseReview.player) : null;
      const afterMindsetFeedback = mindsetFeedback ? PlayerMoraleService.withMoraleChange(promiseReview.player, mindsetFeedback.delta, mindsetFeedback.reason, currentDate) : promiseReview.player;
      const drifted = PlayerMoraleService.applyNaturalDrift(afterMindsetFeedback);
      if ((drifted.morale ?? 50) !== (afterMindsetFeedback.morale ?? 50)) {
        return PlayerMoraleService.withMoraleChange(afterMindsetFeedback, (drifted.morale ?? 50) - (afterMindsetFeedback.morale ?? 50), "Naturalna stabilizacja morale", currentDate);
      }
      return drifted;
    });
    const teamMoraleEvents = reviewedPlayers.filter((player) => (player.contractRaiseTeamMoraleDelta ?? 0) < 0).map((player) => ({
      playerId: player.id,
      delta: player.contractRaiseTeamMoraleDelta ?? 0,
      reason: player.contractRaiseTeamMoraleReason ?? "Napi\u0119cie w szatni po odrzuconej podwy\u017Cce lidera"
    }));
    if (teamMoraleEvents.length === 0) return reviewedPlayers;
    return reviewedPlayers.map((player) => {
      let nextPlayer = player;
      for (const event of teamMoraleEvents) {
        if (event.playerId === nextPlayer.id) continue;
        nextPlayer = PlayerMoraleService.withMoraleChange(nextPlayer, event.delta, event.reason, currentDate);
      }
      if ((nextPlayer.contractRaiseTeamMoraleDelta ?? 0) < 0) {
        return {
          ...nextPlayer,
          contractRaiseTeamMoraleDelta: null,
          contractRaiseTeamMoraleReason: null
        };
      }
      return nextPlayer;
    });
  },
  processReserveProtestReviews: (players, currentDate, existingMessages = []) => {
    const mails = [];
    const dateKey = toDateKey(currentDate);
    const transferDeadline = new Date(currentDate);
    transferDeadline.setDate(transferDeadline.getDate() + 14);
    const transferDeadlineKey = toDateKey(transferDeadline);
    const reviewedPlayers = players.map((player) => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      if (!withMorale.reserveProtestUntil) return withMorale;
      const protestDeadline = new Date(withMorale.reserveProtestUntil);
      const expired = !Number.isNaN(protestDeadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(protestDeadline).getTime();
      if (withMorale.isOnTransferList) {
        return {
          ...PlayerMoraleService.withMoraleChange(
            withMorale,
            4,
            "Trener otworzy\u0142 drog\u0119 do transferu po prote\u015Bcie rezerw",
            currentDate
          ),
          reserveProtestUntil: null
        };
      }
      if (!expired) return withMorale;
      const contractDaysLeft = getContractDaysLeft(withMorale, currentDate);
      if (contractDaysLeft <= 365) {
        return { ...withMorale, reserveProtestUntil: null };
      }
      const personality = withMorale.moralePersonality ?? "CALM";
      const penalty = personality === "EGOIST" || personality === "AMBITIOUS" ? -14 : personality === "CONFIDENT" || personality === "NERVOUS" ? -11 : personality === "LOYAL" || personality === "PROFESSIONAL" ? -7 : -9;
      withMorale = PlayerMoraleService.withMoraleChange(
        withMorale,
        penalty,
        "Zignorowany protest po zes\u0142aniu do rezerw",
        currentDate
      );
      if (PlayerMoraleService.isMoraleDemandLocked(withMorale, currentDate)) {
        return {
          ...withMorale,
          reserveProtestUntil: null,
          lastMoraleDemandDate: dateKey
        };
      }
      const mailId = `PLAYER_RESERVE_PROTEST_ESCALATION_${withMorale.id}_${dateKey}`;
      const hasDuplicateMail = existingMessages.some((mail) => mail.id === mailId) || mails.some((mail) => mail.id === mailId);
      if (!hasDuplicateMail) {
        const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
        mails.push({
          id: mailId,
          sender: playerName,
          role: "Zawodnik",
          subject: `\u017B\u0105danie po braku reakcji: ${withMorale.lastName}`,
          body: [
            "Trenerze,",
            "",
            "Nie dosta\u0142em jasnej odpowiedzi po przesuni\u0119ciu mnie do rezerw. Odbieram to jako sygna\u0142, \u017Ce klub nie widzi mnie ju\u017C realnie w pierwszym zespole.",
            "",
            "W tej sytuacji prosz\u0119 o wystawienie mnie na list\u0119 transferow\u0105. Chc\u0119 mie\u0107 mo\u017Cliwo\u015B\u0107 znalezienia klubu, w kt\xF3rym b\u0119d\u0119 traktowany zgodnie z moim poziomem sportowym.",
            "",
            `Prosz\u0119 o decyzj\u0119 do ${transferDeadline.toLocaleDateString("pl-PL")}.`,
            "",
            playerName
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: 5,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "TRANSFER_LIST",
            responseDeadline: transferDeadlineKey
          }
        });
      }
      return {
        ...withMorale,
        reserveProtestUntil: null,
        transferListDemandUntil: withMorale.transferListDemandUntil ?? transferDeadlineKey,
        lastMoraleDemandDate: dateKey
      };
    });
    return { players: reviewedPlayers, mails };
  },
  processPlayerDemands: (club, squad, currentDate, existingMessages = [], fixtures, allClubs = []) => {
    if (squad.length === 0 || club.stats.played < 4 || currentDate.getDay() !== 1) {
      return { players: squad.map(PlayerMoraleService.ensurePlayerState), mails: [] };
    }
    const dateKey = toDateKey(currentDate);
    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 14);
    const deadlineKey = toDateKey(deadline);
    const sortedByQuality = [...squad].sort((a, b) => b.overallRating - a.overallRating);
    const squadAverage = squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length;
    const rankById = new Map(sortedByQuality.map((player, index) => [player.id, index + 1]));
    const byPosition = /* @__PURE__ */ new Map();
    squad.forEach((player) => {
      byPosition.set(player.position, [...byPosition.get(player.position) ?? [], player]);
    });
    byPosition.forEach((playersForPosition, position) => {
      byPosition.set(position, [...playersForPosition].sort((a, b) => b.overallRating - a.overallRating));
    });
    const hasRecentMail = (player, requestType) => existingMessages.some(
      (mail) => mail.metadata?.type === "PLAYER_MORALE_REQUEST" && mail.metadata.playerId === player.id && mail.metadata.requestType === requestType && new Date(mail.date).getTime() >= currentDate.getTime() - 21 * DAY_MS
    );
    const nextLeagueFixtureDuringDemandWindow = (fixtures ?? []).filter(
      (f) => f.status === "SCHEDULED" /* SCHEDULED */ && f.leagueId === club.leagueId && (f.homeTeamId === club.id || f.awayTeamId === club.id) && f.date.getTime() >= currentDate.getTime() && f.date.getTime() <= deadline.getTime()
    ).sort((a, b) => fDate(a).getTime() - fDate(b).getTime())[0] ?? null;
    const hasLeagueFixtureDuringDemandWindow = !!nextLeagueFixtureDuringDemandWindow;
    function fDate(fixture) {
      return fixture.date instanceof Date ? fixture.date : new Date(fixture.date);
    }
    const createdMails = [];
    const nextPlayers = squad.map((player) => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      const rank = rankById.get(player.id) ?? squad.length;
      const positionRank = (byPosition.get(player.position) ?? []).findIndex((posPlayer) => posPlayer.id === player.id) + 1 || 99;
      const totalMinutes = PlayerMoraleService.getTotalMinutesPlayed(withMorale);
      const possibleMinutes = Math.max(1, club.stats.played * 90);
      const minutesShare = totalMinutes / possibleMinutes;
      const personality = withMorale.moralePersonality ?? "CALM";
      const lastDemand = withMorale.lastMoraleDemandDate ? new Date(withMorale.lastMoraleDemandDate) : null;
      const demandCooldown = lastDemand && !Number.isNaN(lastDemand.getTime()) && dayDiff(lastDemand, currentDate) < 21;
      const isDemandLockedAfterContract = PlayerMoraleService.isMoraleDemandLocked(withMorale, currentDate);
      const hasActiveDemand = PlayerMoraleService.hasActiveMoraleDemand(withMorale);
      const isHealthyEnough = withMorale.health.status === "HEALTHY" /* HEALTHY */ || (withMorale.health.injury?.daysRemaining ?? 0) <= 3;
      const hasSportingArgument = withMorale.overallRating >= squadAverage - 1 && (rank <= Math.max(8, Math.ceil(squad.length * 0.35)) || positionRank <= 2);
      const pressureBonus = personality === "AMBITIOUS" || personality === "EGOIST" || personality === "CONFIDENT" ? 1 : 0;
      const ignoresStatusNoise = personality === "LOYAL" || personality === "CALM" || personality === "PROFESSIONAL";
      const contractDaysLeft = getContractDaysLeft(withMorale, currentDate);
      const isContractEndingSoon = contractDaysLeft <= 365;
      const fairSalary = FinanceService.getFairMarketSalary(withMorale.overallRating);
      const financialRespectRatio = (withMorale.annualSalary || 0) / Math.max(1, fairSalary);
      const salaryUnderpaid = financialRespectRatio < 0.86 || rank <= 5 && financialRespectRatio < 1.02;
      const contractRaiseRequest = buildRaiseRequest(withMorale, club, squadAverage, rank);
      const reminderDate = withMorale.contractRaiseReminderUntil ? new Date(withMorale.contractRaiseReminderUntil) : null;
      const raiseReminderCooldown = reminderDate && !Number.isNaN(reminderDate.getTime()) && dateOnly(currentDate).getTime() < dateOnly(reminderDate).getTime();
      const roleExpectation = rank <= 3 || positionRank === 1 && withMorale.overallRating >= squadAverage + 3 ? "KEY_PLAYER" : rank <= 8 || positionRank <= 2 ? "STARTER" : null;
      const shouldRequestRole = !!roleExpectation && !isSameOrHigherRole(withMorale.squadRole, roleExpectation) && hasSportingArgument && isHealthyEnough && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !withMorale.transferPendingClubId && hasLeagueFixtureDuringDemandWindow && !hasRecentMail(withMorale, "ROLE") && (withMorale.morale ?? 50) <= (ignoresStatusNoise ? 34 : 48 + pressureBonus * 6);
      const expectedShare = withMorale.squadRole === "KEY_PLAYER" || roleExpectation === "KEY_PLAYER" ? 0.68 : withMorale.squadRole === "STARTER" || roleExpectation === "STARTER" ? 0.48 : 0.35;
      const minutesMindset = getMinutesDemandMindset(personality);
      const recentRatings = (withMorale.stats.ratingHistory ?? []).slice(-3);
      const recentAverageRating = recentRatings.length > 0 ? recentRatings.reduce((sum, rating) => sum + rating, 0) / recentRatings.length : null;
      const formArgument = recentAverageRating === null ? 0 : recentAverageRating >= 7.2 ? 12 : recentAverageRating >= 6.8 ? 7 : recentAverageRating < 6.2 ? -8 : 0;
      const positionOpportunity = positionRank === 1 ? 20 : positionRank === 2 ? 12 : positionRank === 3 ? 3 : -10;
      const squadOpportunity = rank <= 3 ? 14 : rank <= 8 ? 8 : rank <= Math.ceil(squad.length * 0.5) ? 2 : -8;
      const roleConfidence = withMorale.squadRole === "KEY_PLAYER" ? 12 : withMorale.squadRole === "STARTER" ? 7 : 0;
      const moraleUrgency = (withMorale.morale ?? 50) <= 25 ? 14 : (withMorale.morale ?? 50) <= 40 ? 8 : (withMorale.morale ?? 50) <= 55 ? 3 : 0;
      const perceivedReadiness = 38 + Math.round((withMorale.overallRating - squadAverage) * 3) + positionOpportunity + squadOpportunity + roleConfidence + formArgument + moraleUrgency + minutesMindset.selfBeliefBias;
      const minutesGap = expectedShare - minutesShare;
      const hasPerceivedSportingArgument = hasSportingArgument || (minutesMindset.approach === "ASSERTIVE" || minutesMindset.approach === "BRAZEN") && withMorale.overallRating >= squadAverage - 4 && positionRank <= 3;
      const shouldRequestMinutes = hasPerceivedSportingArgument && isAvailableForMinutesDemand(withMorale) && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !withMorale.transferPendingClubId && hasLeagueFixtureDuringDemandWindow && !withMorale.minutesDemandUntil && !hasRecentMail(withMorale, "MINUTES") && minutesGap >= minutesMindset.minimumMinutesGap && perceivedReadiness >= minutesMindset.readinessThreshold;
      const shouldRequestDevelopmentExit = !!withMorale.unresolvedMinutesDemandDate && isAvailableForMinutesDemand(withMorale) && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !withMorale.isOnTransferList && !withMorale.isAvailableForLoan && !withMorale.loan && !withMorale.transferPendingClubId && !withMorale.developmentExitDemandUntil && !hasRecentMail(withMorale, "DEVELOPMENT_EXIT") && (totalMinutes <= (withMorale.unresolvedMinutesDemandBaseline ?? totalMinutes) || minutesShare < Math.max(0.12, expectedShare * 0.45));
      const shouldRequestRaise = isHealthyEnough && hasSportingArgument && salaryUnderpaid && rank <= Math.max(8, Math.ceil(squad.length * 0.32)) && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !raiseReminderCooldown && !withMorale.transferPendingClubId && !withMorale.contractRaiseDemandUntil && !withMorale.contractRaiseRequest && !hasRecentMail(withMorale, "RAISE") && contractRaiseRequest.salary >= (withMorale.annualSalary || 0) * 1.12 && ((withMorale.morale ?? 50) <= 62 || recentAverageRating !== null && recentAverageRating >= 6.95 || rank <= 4 || withMorale.squadRole === "KEY_PLAYER");
      const prominentRoleWithoutMinutes = (withMorale.squadRole === "KEY_PLAYER" || withMorale.squadRole === "STARTER") && isAvailableForMinutesDemand(withMorale) && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !withMorale.transferPendingClubId && hasLeagueFixtureDuringDemandWindow && !hasRecentMail(withMorale, "ROLE_PLAYTIME") && totalMinutes === 0;
      const isClearlyAboveSquadLevel = withMorale.overallRating >= squadAverage + 7 && rank <= Math.max(3, Math.ceil(squad.length * 0.12));
      const transferAmbitionBias = personality === "EGOIST" ? 12 : personality === "AMBITIOUS" ? 9 : personality === "CONFIDENT" ? 6 : personality === "PROFESSIONAL" ? -2 : personality === "LOYAL" ? -9 : personality === "CALM" ? -6 : -3;
      const ageTransferStabilityBias = getAgeTransferStabilityBias(withMorale);
      const eliteLatePrimeMoveBoost = withMorale.age >= 26 && withMorale.overallRating >= 85 && club.reputation < 16 ? 7 : 0;
      const transferMoodPressure = (withMorale.morale ?? 50) <= 24 ? 12 : (withMorale.morale ?? 50) <= 39 ? 7 : (withMorale.morale ?? 50) <= 54 ? 3 : 0;
      const transferRandomFactor = Math.floor(seededRng(stableHash(`${withMorale.id}_${dateKey}`), 43) * 13) - 6;
      const hasExcellentForm = recentAverageRating !== null && recentAverageRating >= 7;
      const seasonOutput = getSeasonOutputProfile(withMorale);
      const hasStandoutSeason = hasStandoutSeasonOutput(withMorale, seasonOutput);
      const interestedClubs = (withMorale.interestedClubs ?? []).map((clubId) => allClubs.find((candidateClub) => candidateClub.id === clubId)).filter((candidateClub) => !!candidateClub && candidateClub.id !== club.id);
      const highestInterestedClubReputation = interestedClubs.reduce(
        (maxReputation, interestedClub) => Math.max(maxReputation, interestedClub.reputation),
        0
      );
      const highReputationInterestDelta = highestInterestedClubReputation - club.reputation;
      const hasHighReputationInterest = highReputationInterestDelta >= 3;
      const hasCareerStepUpside = hasRealisticCareerStepUpside(withMorale, personality, hasHighReputationInterest);
      const reputationStepUpPressure = Math.max(0, 12 - club.reputation) * 2;
      const wantsHigherReputationMove = hasCareerStepUpside && isClearlyAboveSquadLevel && hasExcellentForm && club.reputation < 12 && reputationStepUpPressure + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferRandomFactor >= 13;
      const wantsBreakoutSeasonMove = hasCareerStepUpside && hasStandoutSeason && club.reputation < 14 && (withMorale.overallRating >= squadAverage + 2 || rank <= Math.max(8, Math.ceil(squad.length * 0.35))) && reputationStepUpPressure + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferRandomFactor + (hasHighReputationInterest ? 9 : 0) >= 10;
      const wantsHighReputationInterestMove = hasHighReputationInterest && (isClearlyAboveSquadLevel || hasStandoutSeason || withMorale.overallRating >= squadAverage + 3) && highReputationInterestDelta * 3 + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferRandomFactor >= (personality === "LOYAL" ? 13 : 9);
      const protectedExitPressure = Math.round((withMorale.overallRating - squadAverage) * 2) + (rank <= 3 ? 10 : 4) + reputationStepUpPressure + transferAmbitionBias + ageTransferStabilityBias + eliteLatePrimeMoveBoost + transferMoodPressure + transferRandomFactor;
      const wantsProtectedExitConversation = !!withMorale.isUntouchable && protectedExitPressure >= 22;
      const boardSupportsProtectedExit = wantsProtectedExitConversation && (wantsHigherReputationMove || wantsBreakoutSeasonMove || wantsHighReputationInterestMove) && shouldBoardSupportProtectedExit(withMorale, club, squadAverage, transferRandomFactor);
      const protectedExitPrice = boardSupportsProtectedExit ? estimateProtectedExitPrice(withMorale, club, squadAverage) : void 0;
      const transferListMoraleThreshold = personality === "LOYAL" ? 28 : personality === "PROFESSIONAL" ? 34 : 44 + pressureBonus * 6;
      const wantsExitBecauseUnhappy = (withMorale.morale ?? 50) <= transferListMoraleThreshold && (personality !== "LOYAL" || (withMorale.morale ?? 50) <= 24 || transferMoodPressure + transferRandomFactor >= 10);
      const shouldRequestTransferList = (isClearlyAboveSquadLevel || wantsExitBecauseUnhappy || wantsBreakoutSeasonMove || wantsHighReputationInterestMove) && isHealthyEnough && !demandCooldown && !isDemandLockedAfterContract && !hasActiveDemand && !isContractEndingSoon && !withMorale.isOnTransferList && !withMorale.transferPendingClubId && !withMorale.transferListDemandUntil && !hasRecentMail(withMorale, "TRANSFER_LIST") && (wantsProtectedExitConversation || wantsHigherReputationMove || wantsBreakoutSeasonMove || wantsHighReputationInterestMove || wantsExitBecauseUnhappy);
      if (createdMails.length >= 2) return withMorale;
      if (prominentRoleWithoutMinutes) {
        const mailId = `PLAYER_ROLE_PLAYTIME_REQUEST_${withMorale.id}_${dateKey}`;
        const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
        const currentRoleLabel = roleLabel(withMorale.squadRole);
        createdMails.push({
          id: mailId,
          sender: playerName,
          role: "Zawodnik",
          subject: `ZAWODNIK ${playerName} prosi o rozmow\u0119 w sprawie jego roli w zespole`,
          body: [
            "Trenerze,",
            "",
            `Chcia\u0142bym porozmawia\u0107 o mojej roli w zespole. Jestem oznaczony jako ${currentRoleLabel}, jestem zdrowy i gotowy do gry, ale mimo to nie dostaj\u0119 minut.`,
            "",
            "Potrzebuj\u0119 jasnej informacji, czy nadal widzi mnie Pan w tej roli. Chc\u0119 gra\u0107 wi\u0119cej i pokaza\u0107 na boisku, \u017Ce mog\u0119 pom\xF3c dru\u017Cynie.",
            "",
            "Nie chc\u0119 robi\u0107 konfliktu, ale ta sytuacja zaczyna wp\u0142ywa\u0107 na moje nastawienie.",
            "",
            playerName
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: withMorale.squadRole === "KEY_PLAYER" ? 5 : 4,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "ROLE_PLAYTIME",
            requestedRole: withMorale.squadRole,
            nextFixtureId: nextLeagueFixtureDuringDemandWindow?.id,
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, -2, "Wa\u017Cny zawodnik prosi o rozmow\u0119 po braku minut", currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          minutesDemandUntil: deadlineKey,
          minutesDemandBaseline: totalMinutes
        };
      }
      if (shouldRequestDevelopmentExit) {
        const mailId = `PLAYER_DEVELOPMENT_EXIT_REQUEST_${withMorale.id}_${dateKey}`;
        const demandCopy = getDevelopmentExitDemandCopy(withMorale, personality, totalMinutes);
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: "Zawodnik",
          subject: demandCopy.subject,
          body: demandCopy.body,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: demandCopy.priority,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "DEVELOPMENT_EXIT",
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, demandCopy.moraleDrop, "Brak minut eskaluje do pro\u015Bby o odej\u015Bcie lub wypo\u017Cyczenie", currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null,
          developmentExitDemandUntil: deadlineKey,
          developmentExitDemandBaseline: totalMinutes
        };
      }
      if (shouldRequestRaise) {
        const mailId = `PLAYER_RAISE_REQUEST_${withMorale.id}_${dateKey}`;
        const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
        createdMails.push({
          id: mailId,
          sender: playerName,
          role: "Zawodnik",
          subject: `Pro\u015Bba o podwy\u017Ck\u0119: ${withMorale.lastName}`,
          body: [
            "Trenerze,",
            "",
            "Chcia\u0142bym porozmawia\u0107 o nowym kontrakcie. Moja pozycja w dru\u017Cynie i obecna forma daj\u0105 mi podstawy, \u017Ceby oczekiwa\u0107 lepszych warunk\xF3w.",
            "",
            `Oczekuj\u0119 kontraktu na ${contractRaiseRequest.years} ${contractRaiseRequest.years === 1 ? "rok" : "lata"}: pensja ${contractRaiseRequest.salary.toLocaleString("pl-PL")} PLN rocznie oraz ${contractRaiseRequest.bonus.toLocaleString("pl-PL")} PLN za podpis.`,
            "",
            `Prosz\u0119 o odpowied\u017A do ${deadline.toLocaleDateString("pl-PL")}. Je\u015Bli klub nie widzi tematu teraz, b\u0119d\u0119 musia\u0142 przemy\u015Ble\u0107 swoje nastawienie i przysz\u0142o\u015B\u0107.`,
            "",
            playerName
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: rank <= 5 ? 5 : 4,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "RAISE",
            requestedSalary: contractRaiseRequest.salary,
            requestedBonus: contractRaiseRequest.bonus,
            requestedYears: contractRaiseRequest.years,
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, -1, "Zawodnik oczekuje podwy\u017Cki", currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          contractRaiseDemandUntil: deadlineKey,
          contractRaiseRequest: {
            ...contractRaiseRequest,
            requestedAt: dateKey,
            deadline: deadlineKey
          }
        };
      }
      if (shouldRequestTransferList) {
        const mailId = `PLAYER_TRANSFER_LIST_REQUEST_${withMorale.id}_${dateKey}`;
        const transferDemandTrigger = wantsHighReputationInterestMove ? "STRONG_INTEREST" : wantsBreakoutSeasonMove ? "STANDOUT_SEASON" : wantsHigherReputationMove ? "HIGHER_REPUTATION" : "DEFAULT";
        const demandCopy = getTransferListDemandCopy(
          withMorale,
          personality,
          transferDemandTrigger,
          hasStandoutSeason ? formatSeasonOutputSummary(seasonOutput) : void 0
        );
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: "Zawodnik",
          subject: demandCopy.subject,
          body: demandCopy.body,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: 4,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "TRANSFER_LIST",
            responseDeadline: deadlineKey
          }
        });
        if (boardSupportsProtectedExit && protectedExitPrice && createdMails.length < 2) {
          createdMails.push({
            id: `BOARD_PROTECTED_EXIT_SUPPORT_${withMorale.id}_${dateKey}`,
            sender: "Zarz\u0105d Klubu",
            role: "Zarz\u0105d",
            subject: `Zarz\u0105d jest got\xF3w rozwa\u017Cy\u0107 sprzeda\u017C: ${withMorale.lastName}`,
            body: [
              "Trenerze,",
              "",
              `${withMorale.firstName} ${withMorale.lastName} zg\u0142osi\u0142 sprzeciw wobec statusu \u201Enie na sprzeda\u017C\u201D i uwa\u017Ca, \u017Ce jest gotowy na gr\u0119 w klubie o wy\u017Cszej reputacji.`,
              "",
              `Po analizie sytuacji zarz\u0105d uwa\u017Ca, \u017Ce przy odpowiednio wysokiej ofercie sprzeda\u017C mo\u017Ce by\u0107 korzystna dla klubu. Dlatego zdejmujemy status \u201Enie na sprzeda\u017C\u201D i dopuszczamy rozmowy od kwoty oko\u0142o ${protectedExitPrice.toLocaleString("pl-PL")} PLN.`,
              "",
              "To nie oznacza zgody na dowoln\u0105 ofert\u0119, ale chcemy zostawi\u0107 klubowi realn\u0105 drog\u0119 do dobrej transakcji i jednocze\u015Bnie ograniczy\u0107 konflikt z zawodnikiem."
            ].join("\n"),
            date: new Date(currentDate),
            isRead: false,
            type: "BOARD" /* BOARD */,
            priority: 5
          });
        }
        withMorale = PlayerMoraleService.withMoraleChange(
          withMorale,
          boardSupportsProtectedExit ? 1 : -3,
          boardSupportsProtectedExit ? "Zarz\u0105d otwiera drog\u0119 do sprzeda\u017Cy po sprzeciwie zawodnika" : "Zawodnik prosi o wystawienie na list\u0119 transferow\u0105",
          currentDate
        );
        if (boardSupportsProtectedExit && protectedExitPrice) {
          return {
            ...withMorale,
            lastMoraleDemandDate: dateKey,
            transferListDemandUntil: null,
            isUntouchable: false,
            isOnTransferList: true,
            transferListPrice: protectedExitPrice,
            squadRole: null,
            isAvailableForLoan: false
          };
        }
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          transferListDemandUntil: deadlineKey
        };
      }
      if (shouldRequestRole && roleExpectation) {
        const mailId = `PLAYER_ROLE_REQUEST_${withMorale.id}_${dateKey}`;
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: "Zawodnik",
          subject: `Rozmowa o statusie: ${withMorale.lastName}`,
          body: `Trenerze,

Chcia\u0142bym porozmawia\u0107 o mojej roli w dru\u017Cynie. Patrz\u0105c na moj\u0105 pozycj\u0119 w kadrze i poziom sportowy, uwa\u017Cam, \u017Ce powinienem mie\u0107 status: ${roleLabel(roleExpectation)}.

Nie chodzi mi o konflikt, ale o jasny sygna\u0142, \u017Ce klub widzi mnie zgodnie z moj\u0105 warto\u015Bci\u0105 dla zespo\u0142u. Je\u015Bli sytuacja si\u0119 nie zmieni, trudno b\u0119dzie mi utrzyma\u0107 pe\u0142ne zaanga\u017Cowanie.

${withMorale.firstName} ${withMorale.lastName}`,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: roleExpectation === "KEY_PLAYER" ? 4 : 3,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "ROLE",
            requestedRole: roleExpectation,
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, -2, `Zawodnik domaga si\u0119 statusu: ${roleLabel(roleExpectation)}`, currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          roleDemandUntil: deadlineKey,
          requestedSquadRole: roleExpectation
        };
      }
      if (shouldRequestMinutes) {
        const mailId = `PLAYER_MINUTES_REQUEST_${withMorale.id}_${dateKey}`;
        const demandCopy = getMinutesDemandCopy(withMorale, minutesMindset.approach, recentAverageRating);
        createdMails.push({
          id: mailId,
          sender: `${withMorale.firstName} ${withMorale.lastName}`,
          role: "Zawodnik",
          subject: demandCopy.subject,
          body: demandCopy.body,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: minutesMindset.priority,
          metadata: {
            type: "PLAYER_MORALE_REQUEST",
            playerId: withMorale.id,
            requestType: "MINUTES",
            responseDeadline: deadlineKey
          }
        });
        withMorale = PlayerMoraleService.withMoraleChange(withMorale, minutesMindset.moraleDrop, "Zawodnik domaga si\u0119 wi\u0119kszej liczby wyst\u0119p\xF3w", currentDate);
        return {
          ...withMorale,
          lastMoraleDemandDate: dateKey,
          minutesDemandUntil: deadlineKey,
          minutesDemandBaseline: totalMinutes
        };
      }
      return withMorale;
    });
    return { players: nextPlayers, mails: createdMails };
  },
  reviewPlayerDemands: (player, currentDate) => {
    let withMorale = PlayerMoraleService.ensurePlayerState(player);
    if (withMorale.contractRaiseDemandUntil && withMorale.contractRaiseRequest) {
      const deadline = new Date(withMorale.contractRaiseDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const request = withMorale.contractRaiseRequest;
      const isPromotionRaiseRequest = request.reason === "PROMOTION_RAISE";
      const fulfilled = (withMorale.annualSalary || 0) >= request.salary && getContractDaysLeft(withMorale, currentDate) > 365;
      if (fulfilled) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(
            withMorale,
            isPromotionRaiseRequest ? 9 : 7,
            isPromotionRaiseRequest ? "Klub spe\u0142ni\u0142 pro\u015Bb\u0119 o podwy\u017Ck\u0119 po awansie" : "Klub spe\u0142ni\u0142 pro\u015Bb\u0119 o podwy\u017Ck\u0119",
            currentDate
          ),
          contractRaiseDemandUntil: null,
          contractRaiseRequest: null,
          contractRaiseTeamMoraleDelta: null,
          contractRaiseTeamMoraleReason: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const leadership = withMorale.attributes?.leadership ?? 50;
        const seed = stableHash(`${withMorale.id}_${toDateKey(currentDate)}_RAISE_REJECTED`);
        const roll = seededRng(seed, 19);
        const frustrationScore = (personality === "EGOIST" ? 28 : personality === "AMBITIOUS" ? 22 : personality === "CONFIDENT" ? 15 : personality === "LOYAL" ? -10 : personality === "PROFESSIONAL" ? -4 : 0) + Math.max(0, withMorale.overallRating - 66) + Math.max(0, request.salary / Math.max(1, withMorale.annualSalary || 1) - 1) * 18 + ((withMorale.morale ?? 50) <= 45 ? 8 : 0) + (isPromotionRaiseRequest ? 8 : 0) + roll * 18;
        if (frustrationScore >= 34 && getContractDaysLeft(withMorale, currentDate) > 365) {
          const boardLockoutActive = !!withMorale.boardLockoutUntil && dateOnly(currentDate).getTime() < dateOnly(new Date(withMorale.boardLockoutUntil)).getTime();
          const appealCooldownOk = !withMorale.boardAppealSentAt || dayDiff(new Date(withMorale.boardAppealSentAt), currentDate) > 180;
          if (boardLockoutActive && appealCooldownOk && !withMorale.boardAppealDeadline) {
            const appealDeadline = new Date(currentDate);
            appealDeadline.setDate(appealDeadline.getDate() + 14);
            withMorale = {
              ...PlayerMoraleService.withMoraleChange(
                withMorale,
                isPromotionRaiseRequest ? -8 : -6,
                isPromotionRaiseRequest ? "Zablokowana podwy\u017Cka po awansie przez dyrektora \u2014 zawodnik apeluje do zarz\u0105du" : "Zablokowana podwy\u017Cka przez dyrektora \u2014 zawodnik apeluje do zarz\u0105du",
                currentDate
              ),
              contractRaiseDemandUntil: null,
              contractRaiseRequest: null,
              boardAppealSentAt: toDateKey(currentDate),
              boardAppealType: "RAISE",
              boardAppealDeadline: toDateKey(appealDeadline)
            };
          } else {
            const transferDeadline = new Date(currentDate);
            transferDeadline.setDate(transferDeadline.getDate() + 14);
            withMorale = {
              ...PlayerMoraleService.withMoraleChange(
                withMorale,
                isPromotionRaiseRequest ? -15 : -12,
                isPromotionRaiseRequest ? "Odrzucona podwy\u017Cka po awansie eskaluje do \u017C\u0105dania listy transferowej" : "Odrzucona podwy\u017Cka eskaluje do \u017C\u0105dania listy transferowej",
                currentDate
              ),
              contractRaiseDemandUntil: null,
              contractRaiseRequest: null,
              transferListDemandUntil: toDateKey(transferDeadline),
              isUntouchable: false
            };
          }
        } else if (frustrationScore >= 18 || personality === "SENSITIVE" || personality === "NERVOUS") {
          const ownPenalty = (personality === "LOYAL" || personality === "PROFESSIONAL" ? -5 : personality === "EGOIST" || personality === "AMBITIOUS" ? -12 : -8) - (isPromotionRaiseRequest ? 2 : 0);
          const teamDelta = (leadership >= 82 ? -4 : leadership >= 72 ? -3 : leadership >= 62 ? -2 : leadership >= 52 ? -1 : 0) - (isPromotionRaiseRequest && leadership >= 62 ? 1 : 0);
          withMorale = {
            ...PlayerMoraleService.withMoraleChange(
              withMorale,
              ownPenalty,
              isPromotionRaiseRequest ? "Odrzucona pro\u015Bba o podwy\u017Ck\u0119 po awansie" : "Odrzucona pro\u015Bba o podwy\u017Ck\u0119",
              currentDate
            ),
            contractRaiseDemandUntil: null,
            contractRaiseRequest: null,
            contractRaiseTeamMoraleDelta: teamDelta,
            contractRaiseTeamMoraleReason: teamDelta < 0 ? isPromotionRaiseRequest ? `Wp\u0142yw lidera po odrzuconej podwy\u017Cce po awansie: ${withMorale.firstName} ${withMorale.lastName}` : `Wp\u0142yw lidera po odrzuconej podwy\u017Cce: ${withMorale.firstName} ${withMorale.lastName}` : null
          };
        } else {
          const reminderUntil = new Date(currentDate);
          reminderUntil.setMonth(reminderUntil.getMonth() + 3);
          withMorale = {
            ...withMorale,
            contractRaiseDemandUntil: null,
            contractRaiseRequest: null,
            contractRaiseReminderUntil: toDateKey(reminderUntil),
            lastMoraleDemandDate: toDateKey(currentDate)
          };
        }
      }
    }
    if (withMorale.transferListDemandUntil) {
      const deadline = new Date(withMorale.transferListDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      if (withMorale.isOnTransferList) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 8, "Trener zgodzi\u0142 si\u0119 na list\u0119 transferow\u0105", currentDate),
          transferListDemandUntil: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const penalty = personality === "LOYAL" || personality === "PROFESSIONAL" ? -8 : personality === "EGOIST" || personality === "AMBITIOUS" ? -16 : -12;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, "Odrzucona pro\u015Bba o list\u0119 transferow\u0105", currentDate),
          transferListDemandUntil: null
        };
      }
    }
    if (withMorale.minutesDemandUntil) {
      const deadline = new Date(withMorale.minutesDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const baseline = withMorale.minutesDemandBaseline ?? PlayerMoraleService.getTotalMinutesPlayed(withMorale);
      const hasPlayed = PlayerMoraleService.getTotalMinutesPlayed(withMorale) > baseline;
      if (hasPlayed) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 4, "Dosta\u0142 szans\u0119 po pro\u015Bbie o minuty", currentDate),
          minutesDemandUntil: null,
          minutesDemandBaseline: null,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null
        };
      } else if (expired && !isAvailableForMinutesDemand(withMorale)) {
        withMorale = {
          ...withMorale,
          minutesDemandUntil: null,
          minutesDemandBaseline: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const penalty = personality === "LOYAL" || personality === "CALM" ? -6 : personality === "EGOIST" || personality === "AMBITIOUS" ? -12 : -9;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, "Zignorowana pro\u015Bba o wi\u0119cej wyst\u0119p\xF3w", currentDate),
          minutesDemandUntil: null,
          minutesDemandBaseline: null,
          unresolvedMinutesDemandDate: toDateKey(currentDate),
          unresolvedMinutesDemandBaseline: PlayerMoraleService.getTotalMinutesPlayed(withMorale)
        };
      }
    }
    if (withMorale.developmentExitDemandUntil) {
      const deadline = new Date(withMorale.developmentExitDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const fulfilled = !!withMorale.isOnTransferList || !!withMorale.isAvailableForLoan || !!withMorale.loan;
      if (fulfilled) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 6, "Klub zgodzi\u0142 si\u0119 na transfer lub wypo\u017Cyczenie po braku minut", currentDate),
          developmentExitDemandUntil: null,
          developmentExitDemandBaseline: null,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const penalty = personality === "LOYAL" || personality === "PROFESSIONAL" ? -10 : personality === "EGOIST" || personality === "AMBITIOUS" ? -18 : -14;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, "Zignorowana pro\u015Bba o odej\u015Bcie lub wypo\u017Cyczenie po braku minut", currentDate),
          developmentExitDemandUntil: null,
          developmentExitDemandBaseline: null,
          unresolvedMinutesDemandDate: null,
          unresolvedMinutesDemandBaseline: null
        };
      }
    }
    if (withMorale.roleDemandUntil && withMorale.requestedSquadRole) {
      const deadline = new Date(withMorale.roleDemandUntil);
      const expired = !Number.isNaN(deadline.getTime()) && dateOnly(currentDate).getTime() > dateOnly(deadline).getTime();
      const fulfilled = isSameOrHigherRole(withMorale.squadRole, withMorale.requestedSquadRole);
      if (fulfilled) {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, withMorale.requestedSquadRole === "KEY_PLAYER" ? 6 : 4, "Otrzyma\u0142 oczekiwany status w dru\u017Cynie", currentDate),
          roleDemandUntil: null,
          requestedSquadRole: null
        };
      } else if (expired) {
        const personality = withMorale.moralePersonality ?? "CALM";
        const penalty = personality === "PROFESSIONAL" || personality === "LOYAL" ? -5 : personality === "EGOIST" || personality === "AMBITIOUS" ? -13 : -9;
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, penalty, "Zignorowana pro\u015Bba o wy\u017Cszy status", currentDate),
          roleDemandUntil: null,
          requestedSquadRole: null
        };
      }
    }
    return withMorale;
  },
  getOneTimeBonusRequestBlockReason: (player, club, seasonNumber) => {
    const withMorale = PlayerMoraleService.ensurePlayerState(player);
    const profile = getSeasonOutputProfile(withMorale);
    if (profile.matches < 20) {
      return `Zawodnik musi rozegra\u0107 co najmniej 20 mecz\xF3w w sezonie. Teraz ma ${profile.matches}.`;
    }
    if (withMorale.oneTimeBonusAwardedSeason === seasonNumber) {
      return "Ten zawodnik dosta\u0142 ju\u017C jednorazow\u0105 premi\u0119 w tym sezonie.";
    }
    if (withMorale.oneTimeBonusPromise?.seasonNumber === seasonNumber) {
      return "Wniosek o premi\u0119 dla tego zawodnika jest ju\u017C u zarz\u0105du.";
    }
    if ((club.oneTimePlayerBonusesThisSeason ?? 0) >= 11) {
      return "Zarz\u0105d wykorzysta\u0142 ju\u017C limit 11 jednorazowych premii dla zawodnik\xF3w w tym sezonie.";
    }
    return null;
  },
  createOneTimeBonusPromise: (player, currentDate, seasonNumber) => {
    const decisionDueAt = new Date(currentDate);
    decisionDueAt.setDate(decisionDueAt.getDate() + 3);
    const withMorale = PlayerMoraleService.withMoraleChange(
      PlayerMoraleService.ensurePlayerState(player),
      1,
      "Trener obieca\u0142 rozmow\u0119 z zarz\u0105dem o jednorazowej premii",
      currentDate
    );
    return PlayerMoraleService.withMindsetChange(
      {
        ...withMorale,
        oneTimeBonusPromise: {
          requestedAt: toDateKey(currentDate),
          decisionDueAt: toDateKey(decisionDueAt),
          seasonNumber
        }
      },
      { coachTrust: 2, clubHappiness: 1 },
      "Obietnica rozmowy z zarz\u0105dem o premii",
      currentDate
    );
  },
  reviewOneTimeBonusPromises: (club, squad, currentDate, seasonNumber, seed) => {
    const dateKey = toDateKey(currentDate);
    let nextClub = club;
    const mails = [];
    const nextPlayers = squad.map((player) => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      const promise = withMorale.oneTimeBonusPromise;
      if (!promise || promise.seasonNumber !== seasonNumber) return withMorale;
      const decisionDate = new Date(promise.decisionDueAt);
      const decisionDue = !Number.isNaN(decisionDate.getTime()) && dateOnly(currentDate).getTime() >= dateOnly(decisionDate).getTime();
      if (!decisionDue) return withMorale;
      const profile = getSeasonOutputProfile(withMorale);
      const performanceScore = getOneTimeBonusPerformanceScore(withMorale, profile);
      const boardCompetence = boardAttributeScore(nextClub.board?.kompetencja);
      const generosity = boardAttributeScore(nextClub.board?.hojnosc);
      const ambition = boardAttributeScore(nextClub.board?.ambicja);
      const greed = boardAttributeScore(nextClub.board?.chciwosc);
      const localSeed = seed + stableHash(`${withMorale.id}_${dateKey}_ONE_TIME_BONUS`);
      const accuracy = 0.58 + boardCompetence * 0.09;
      const budgetNoise = (seededRng(localSeed, 11) - 0.5) * 0.2 * (1.25 - accuracy);
      const perceivedBudget = Math.max(0, nextClub.budget * (1 + budgetNoise));
      const rawAmount = 2e4 + performanceScore * 650 + generosity * 5e3 + (seededRng(localSeed, 17) - 0.5) * 2e4;
      const amount = roundOneTimeBonusAmount(rawAmount);
      const budgetScore = Math.max(0, Math.min(100, perceivedBudget / Math.max(1, amount) * 42));
      const rngScore = (seededRng(localSeed, 23) - 0.5) * 20;
      const decisionScore = performanceScore * 0.55 + budgetScore * 0.25 + generosity * 6 + ambition * 4 - greed * 6 + rngScore;
      const seasonLimitReached = (nextClub.oneTimePlayerBonusesThisSeason ?? 0) >= 11;
      const alreadyAwarded = withMorale.oneTimeBonusAwardedSeason === seasonNumber;
      const hasEnoughBudget = nextClub.budget >= amount;
      const approved = !seasonLimitReached && !alreadyAwarded && hasEnoughBudget && performanceScore >= 48 && decisionScore >= 62;
      const ceoName = nextClub.management?.ceo ? `${nextClub.management.ceo.firstName} ${nextClub.management.ceo.lastName}` : "Zarz\u0105d Klubu";
      const statsLine = getOneTimeBonusStatsLine(withMorale, profile);
      const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
      if (approved) {
        const reactionRoll = seededRng(localSeed, 37);
        const mindset = PlayerMoraleService.normalizeMindset(withMorale);
        const personality = withMorale.moralePersonality ?? "CALM";
        const gratitudeScore = (withMorale.morale ?? 50) * 0.22 + mindset.coachTrust * 0.22 + mindset.clubHappiness * 0.24 - mindset.conflictLevel * 0.18 + (personality === "LOYAL" || personality === "PROFESSIONAL" ? 12 : 0) + (personality === "EGOIST" || personality === "AMBITIOUS" ? -6 : 0) + reactionRoll * 18;
        const delighted = gratitudeScore >= 58;
        const pleased = gratitudeScore >= 44;
        const moraleDelta = delighted ? 6 : pleased ? 3 : 0;
        const bonusReactionReason = delighted ? "Zawodnik zadowolony z jednorazowej premii" : pleased ? "Zawodnik pozytywnie przyj\u0105\u0142 jednorazow\u0105 premi\u0119" : "Zawodnik neutralnie przyj\u0105\u0142 jednorazow\u0105 premi\u0119";
        withMorale = PlayerMoraleService.withMindsetChange(
          PlayerMoraleService.withMoraleChange(
            {
              ...withMorale,
              oneTimeBonusPromise: null,
              oneTimeBonusAwardedSeason: seasonNumber
            },
            moraleDelta,
            bonusReactionReason,
            currentDate
          ),
          delighted ? { clubHappiness: 8, coachTrust: 5, conflictLevel: -4, transferOpenness: -3 } : pleased ? { clubHappiness: 5, coachTrust: 3, conflictLevel: -2, transferOpenness: -1 } : { clubHappiness: 1, coachTrust: 1 },
          "Decyzja zarz\u0105du o jednorazowej premii",
          currentDate
        );
        nextClub = {
          ...nextClub,
          budget: nextClub.budget - amount,
          oneTimePlayerBonusesThisSeason: (nextClub.oneTimePlayerBonusesThisSeason ?? 0) + 1,
          financeHistory: [{
            id: `ONE_TIME_BONUS_${withMorale.id}_${dateKey}`,
            date: dateKey,
            amount: -amount,
            type: "EXPENSE",
            description: `Jednorazowa premia dla zawodnika: ${playerName}`,
            previousBalance: nextClub.budget
          }, ...nextClub.financeHistory || []].slice(0, 50)
        };
      } else {
        const reason = alreadyAwarded ? "zawodnik otrzyma\u0142 ju\u017C premi\u0119 w tym sezonie" : seasonLimitReached ? "klub wykorzysta\u0142 limit 11 premii w sezonie" : !hasEnoughBudget ? "zarz\u0105d uzna\u0142, \u017Ce bud\u017Cet nie pozwala na dodatkowy wydatek" : performanceScore < 48 ? "zarz\u0105d uzna\u0142, \u017Ce wk\u0142ad sportowy nie uzasadnia premii" : "zarz\u0105d nie zatwierdzi\u0142 wniosku po analizie sportowej i finansowej";
        const personality = withMorale.moralePersonality ?? "CALM";
        const moralePenalty = personality === "EGOIST" || personality === "AMBITIOUS" ? -5 : personality === "SENSITIVE" || personality === "NERVOUS" ? -4 : -2;
        withMorale = PlayerMoraleService.withMindsetChange(
          PlayerMoraleService.withMoraleChange(
            {
              ...withMorale,
              oneTimeBonusPromise: null
            },
            moralePenalty,
            "Zarz\u0105d odrzuci\u0142 pro\u015Bb\u0119 o jednorazow\u0105 premi\u0119",
            currentDate
          ),
          { clubHappiness: -7, coachTrust: -2, conflictLevel: 4 },
          "Odrzucona pro\u015Bba o jednorazow\u0105 premi\u0119",
          currentDate
        );
        mails.push({
          id: `ONE_TIME_BONUS_REJECTED_${withMorale.id}_${dateKey}`,
          sender: ceoName,
          role: "Zarz\u0105d",
          subject: `PREMIA ODRZUCONA: ${withMorale.lastName}`,
          body: [
            "Trenerze,",
            "",
            `Przeanalizowali\u015Bmy wniosek o jednorazow\u0105 premi\u0119 dla zawodnika ${playerName}.`,
            `Liczby zawodnika: ${statsLine}.`,
            "",
            `Decyzja: odmowa, poniewa\u017C ${reason}.`,
            "",
            ceoName,
            `Zarz\u0105d ${nextClub.name}`
          ].join("\n"),
          date: new Date(currentDate),
          isRead: false,
          type: "BOARD" /* BOARD */,
          priority: 6,
          metadata: {
            type: "ONE_TIME_BONUS_DECISION",
            playerId: withMorale.id,
            approved: false,
            amount: 0,
            seasonNumber
          }
        });
        return withMorale;
      }
      mails.push({
        id: `ONE_TIME_BONUS_APPROVED_${withMorale.id}_${dateKey}`,
        sender: ceoName,
        role: "Zarz\u0105d",
        subject: `PREMIA ZATWIERDZONA: ${withMorale.lastName}`,
        body: [
          "Trenerze,",
          "",
          `Przeanalizowali\u015Bmy wniosek o jednorazow\u0105 premi\u0119 dla zawodnika ${playerName}.`,
          `Liczby zawodnika: ${statsLine}.`,
          "",
          `Decyzja: zgoda na premi\u0119 w wysoko\u015Bci ${amount.toLocaleString("pl-PL")} PLN.`,
          "Kwota zosta\u0142a odj\u0119ta z bud\u017Cetu klubu.",
          "",
          ceoName,
          `Zarz\u0105d ${nextClub.name}`
        ].join("\n"),
        date: new Date(currentDate),
        isRead: false,
        type: "BOARD" /* BOARD */,
        priority: 7,
        metadata: {
          type: "ONE_TIME_BONUS_DECISION",
          playerId: withMorale.id,
          approved: true,
          amount,
          seasonNumber
        }
      });
      return withMorale;
    });
    return { club: nextClub, players: nextPlayers, mails };
  },
  processBoardAppeals: (club, squad, currentDate, existingMessages = []) => {
    if (squad.length === 0 || club.stats.played < 4 || currentDate.getDay() !== 1) {
      return { players: squad, mails: [] };
    }
    const dateKey = toDateKey(currentDate);
    const mails = [];
    const squadAverage = squad.reduce((sum, p) => sum + p.overallRating, 0) / squad.length;
    const sortedByQuality = [...squad].sort((a, b) => b.overallRating - a.overallRating);
    const rankById = new Map(sortedByQuality.map((p, i) => [p.id, i + 1]));
    const hasBoardAppealMail = (player) => existingMessages.some(
      (m) => m.metadata?.type === "PLAYER_BOARD_APPEAL" && m.metadata.playerId === player.id
    );
    const hasBoardDecisionMail = (player) => existingMessages.some(
      (m) => m.metadata?.type === "BOARD_APPEAL_DECISION" && m.metadata.playerId === player.id && new Date(m.date).getTime() >= currentDate.getTime() - 60 * DAY_MS
    );
    const nextPlayers = squad.map((player) => {
      let withMorale = PlayerMoraleService.ensurePlayerState(player);
      if (!withMorale.boardAppealSentAt || !withMorale.boardAppealDeadline) return withMorale;
      const appealType = withMorale.boardAppealType ?? "RAISE";
      const playerName = `${withMorale.firstName} ${withMorale.lastName}`;
      if (!hasBoardAppealMail(withMorale)) {
        const subjectSuffix = appealType === "RAISE" ? "PODWY\u017BKA" : "ZGODA NA ODEJ\u015ACIE";
        const bodyRaise = [
          "Trenerze,",
          "",
          "Dyrektor sportowy zablokowa\u0142 negocjacje dotycz\u0105ce mojego kontraktu.",
          "Rozumiem struktur\u0119 decyzji w klubie, ale moje oczekiwania s\u0105 uzasadnione",
          "na tle mojego wk\u0142adu w gr\u0119 zespo\u0142u.",
          "",
          "Zwr\xF3ci\u0142em si\u0119 bezpo\u015Brednio do zarz\u0105du z pro\u015Bb\u0105 o ponowne rozpatrzenie tej sprawy.",
          "Poinformuj\u0119 Pana o ich decyzji.",
          "",
          playerName
        ].join("\n");
        const bodyTransfer = [
          "Trenerze,",
          "",
          "Dyrektor sportowy nie pozwala mi odej\u015B\u0107 mimo moich wyra\u017Anych oczekiwa\u0144.",
          "Czuj\u0119, \u017Ce moja przysz\u0142o\u015B\u0107 w tym klubie jest zablokowana decyzj\u0105 jednej osoby.",
          "",
          "Postanowi\u0142em zwr\xF3ci\u0107 si\u0119 bezpo\u015Brednio do zarz\u0105du z pro\u015Bb\u0105 o zgod\u0119 na odej\u015Bcie.",
          "Poinformuj\u0119 Pana o ich odpowiedzi.",
          "",
          playerName
        ].join("\n");
        mails.push({
          id: `PLAYER_BOARD_APPEAL_${withMorale.id}_${dateKey}`,
          sender: playerName,
          role: "Zawodnik",
          subject: `APEL DO ZARZ\u0104DU: ${withMorale.lastName} \u2014 ${subjectSuffix}`,
          body: appealType === "RAISE" ? bodyRaise : bodyTransfer,
          date: new Date(currentDate),
          isRead: false,
          type: "STAFF" /* STAFF */,
          priority: 6,
          metadata: {
            type: "PLAYER_BOARD_APPEAL",
            playerId: withMorale.id,
            appealType,
            decisionDeadline: withMorale.boardAppealDeadline
          }
        });
      }
      const decisionDeadlineDate = new Date(withMorale.boardAppealDeadline);
      const decisionDue = !Number.isNaN(decisionDeadlineDate.getTime()) && dateOnly(currentDate).getTime() > dateOnly(decisionDeadlineDate).getTime();
      if (!decisionDue || hasBoardDecisionMail(withMorale)) return withMorale;
      const seed = stableHash(`${withMorale.id}_${dateKey}_BOARD_APPEAL`);
      const rank = rankById.get(withMorale.id) ?? squad.length;
      const marketValue = withMorale.marketValue ?? 0;
      const annualSalary = withMorale.annualSalary ?? 0;
      const raiseRequest = withMorale.contractRaiseRequest;
      const sellScore = boardAttributeScore(club.board?.chciwosc) * 2.5 + (club.transferBudget < marketValue * 0.35 ? 4 : 0) + (club.budget < marketValue * 0.2 ? 3 : 0) + Math.min(4, marketValue / Math.max(1, annualSalary * 3)) + seededRng(seed, 17) * 9 - 4.5;
      const budgetCoversRaise = raiseRequest ? club.budget >= raiseRequest.salary * 0.5 : club.budget >= annualSalary * 1.3;
      const boardConfidence = club.boardConfidence ?? 60;
      const managerBonus = boardConfidence / 100 * seededRng(seed, 7) * 5;
      const poorRelationBoost = boardConfidence < 40 ? (1 - boardConfidence / 100) * seededRng(seed, 89) * 4 : 0;
      const raiseScore = boardAttributeScore(club.board?.hojnosc) * 2.2 + (budgetCoversRaise ? 3.5 : -2) + (rank <= 3 ? 2.5 : rank <= 6 ? 1.5 : 0) + managerBonus + seededRng(seed, 31) * 7 - 3.5;
      const directorPersonalityMod = (() => {
        const p = club.sportingDirector?.personality;
        if (p === "CONTROLLER") return 3;
        if (p === "POLITICIAN") return 2;
        if (p === "ACCOUNTANT") return 1;
        if (p === "PARTNER") return -2;
        if (p === "TALENT_HUNTER") return -2;
        return 0;
      })();
      const vetoScore = boardAttributeScore(club.board?.cierpliwosc) * 2 + (club.sportingDirectorBoardInfluence ?? 50) / 100 * 6 + (boardConfidence > 70 ? 2 : boardConfidence > 50 ? 0 : -2) + directorPersonalityMod + poorRelationBoost + seededRng(seed, 53) * 6 - 3;
      const decision = sellScore > raiseScore && sellScore > vetoScore ? "SELL" : raiseScore > vetoScore ? "RAISE" : "VETO";
      const ceoName = club.management?.ceo ? `${club.management.ceo.firstName} ${club.management.ceo.lastName}` : "Zarz\u0105d Klubu";
      const bodyDecision = (() => {
        if (decision === "SELL") {
          const price = estimateProtectedExitPrice(withMorale, club, squadAverage);
          return [
            "Trenerze,",
            "",
            `Po analizie sytuacji zawodnika ${playerName}`,
            `zarz\u0105d postanowi\u0142 umie\u015Bci\u0107 go na li\u015Bcie transferowej z cen\u0105 wywo\u0142awcz\u0105 ${price.toLocaleString("pl-PL")} PLN.`,
            "",
            "Decyzja dyrektora sportowego zosta\u0142a w tym przypadku nadpisana przez zarz\u0105d.",
            "",
            ceoName,
            `Zarz\u0105d ${club.name}`
          ].join("\n");
        }
        if (decision === "RAISE") {
          return [
            "Trenerze,",
            "",
            `Po przeanalizowaniu sprawy ${playerName}`,
            "zarz\u0105d zdecydowa\u0142 si\u0119 odblokowa\u0107 negocjacje kontraktowe.",
            "",
            "Mo\u017Ce Pan ponownie przes\u0142a\u0107 ofert\u0119 kontraktow\u0105 temu zawodnikowi.",
            "",
            ceoName,
            `Zarz\u0105d ${club.name}`
          ].join("\n");
        }
        return [
          "Trenerze,",
          "",
          `Po przeanalizowaniu sprawy zarz\u0105d podtrzymuje stanowisko dyrektora sportowego`,
          `w kwestii ${playerName}.`,
          "",
          "Apel zawodnika zosta\u0142 odrzucony.",
          "",
          ceoName,
          `Zarz\u0105d ${club.name}`
        ].join("\n");
      })();
      const subjectDecision = decision === "SELL" ? `ZARZ\u0104D WYRAZI\u0141 ZGOD\u0118 NA SPRZEDA\u017B: ${withMorale.lastName}` : decision === "RAISE" ? `ZARZ\u0104D ODBLOKOWA\u0141 NEGOCJACJE KONTRAKTU: ${withMorale.lastName}` : `ZARZ\u0104D PODTRZYMA\u0141 DECYZJ\u0118 DYREKTORA: ${withMorale.lastName}`;
      mails.push({
        id: `BOARD_APPEAL_DECISION_${withMorale.id}_${dateKey}`,
        sender: ceoName,
        role: "Zarz\u0105d",
        subject: subjectDecision,
        body: bodyDecision,
        date: new Date(currentDate),
        isRead: false,
        type: "BOARD" /* BOARD */,
        priority: 7,
        metadata: {
          type: "BOARD_APPEAL_DECISION",
          playerId: withMorale.id,
          decision,
          appealType
        }
      });
      if (decision === "SELL") {
        const askingPrice = estimateProtectedExitPrice(withMorale, club, squadAverage);
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 6, "Zarz\u0105d wyrazi\u0142 zgod\u0119 na sprzeda\u017C po apelu zawodnika", currentDate),
          isOnTransferList: true,
          transferListPrice: askingPrice,
          boardLockoutUntil: null,
          boardAppealSentAt: null,
          boardAppealType: null,
          boardAppealDeadline: null
        };
      } else if (decision === "RAISE") {
        withMorale = {
          ...PlayerMoraleService.withMoraleChange(withMorale, 4, "Zarz\u0105d odblokowa\u0142 negocjacje kontraktu po apelu zawodnika", currentDate),
          boardLockoutUntil: null,
          boardAppealSentAt: null,
          boardAppealType: null,
          boardAppealDeadline: null
        };
      } else {
        withMorale = {
          ...PlayerMoraleService.withMindsetChange(
            PlayerMoraleService.withMoraleChange(withMorale, -12, "Zarz\u0105d podtrzyma\u0142 decyzj\u0119 dyrektora \u2014 apel odrzucony", currentDate),
            { conflictLevel: 20, clubHappiness: -15 },
            "Apel do zarz\u0105du odrzucony",
            currentDate
          ),
          boardAppealSentAt: null,
          boardAppealType: null,
          boardAppealDeadline: null
        };
      }
      return withMorale;
    });
    return { players: nextPlayers, mails };
  }
};

// services/match/live/LiveMatchOwnGoal.ts
var clamp4 = (value, min, max) => Math.max(min, Math.min(max, value));
var getContextBaseChance = (context) => {
  if (context === "corner") return 0.026;
  if (context === "chaos") return 0.022;
  return 0.012;
};
var getPlayerRiskWeight = (player, slotIndex, fatigue) => {
  const attributes = player.attributes;
  const roleWeight = player.position === "DEF" /* DEF */ ? 1.25 : player.position === "GK" /* GK */ ? 0.78 : player.position === "MID" /* MID */ ? 0.82 : 0.48;
  const slotWeight = slotIndex === 0 ? 0.72 : slotIndex >= 1 && slotIndex <= 5 ? 1.18 : 0.62;
  const fatigueWeight = fatigue < 60 ? 1.45 : fatigue < 75 ? 1.22 : fatigue < 85 ? 1.1 : 1;
  const defensiveRead = attributes.defending * 0.3 + attributes.positioning * 0.24 + attributes.technique * 0.16 + attributes.mentality * 0.16 + attributes.strength * 0.08 + attributes.workRate * 0.06;
  const weaknessWeight = 1 + clamp4((68 - defensiveRead) / 52, -0.18, 0.55);
  return roleWeight * slotWeight * fatigueWeight * weaknessWeight;
};
var chooseWeightedPlayer = (candidates, rng) => {
  const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  if (totalWeight <= 0) return null;
  let roll = clamp4(rng(), 0, 1) * totalWeight;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate.player;
  }
  return candidates[candidates.length - 1]?.player ?? null;
};
var calculateLiveOwnGoalChance = ({
  context,
  defendingPlayers,
  defendingLineup,
  defendingFatigue,
  weather,
  pressureMultiplier = 1
}) => {
  const activeIds = defendingLineup.filter((id) => id !== null);
  if (activeIds.length === 0) return 0;
  const activeDefenders = defendingPlayers.filter((player) => activeIds.includes(player.id));
  if (activeDefenders.length === 0) return 0;
  const averageDefensiveRead = activeDefenders.reduce((sum, player) => {
    const attributes = player.attributes;
    return sum + (attributes.defending * 0.3 + attributes.positioning * 0.24 + attributes.technique * 0.16 + attributes.mentality * 0.16 + attributes.strength * 0.08 + attributes.workRate * 0.06);
  }, 0) / activeDefenders.length;
  const redZoneCount = activeIds.filter((id) => (defendingFatigue[id] ?? 100) < 60).length;
  const tiredCount = activeIds.filter((id) => (defendingFatigue[id] ?? 100) < 75).length;
  const moralePenalty = activeDefenders.reduce((sum, player) => {
    const morale = player.morale ?? 50;
    return sum + (morale < 40 ? (40 - morale) / 900 : 0);
  }, 0);
  const rainPressure = weather && weather.precipitationChance > 55 ? clamp4((weather.precipitationChance - 55) / 90, 0, 0.22) : 0;
  const qualityPressure = clamp4((66 - averageDefensiveRead) / 90, -0.1, 0.24);
  const fatiguePressure = clamp4(tiredCount * 0.045 + redZoneCount * 0.055, 0, 0.34);
  const teamMoraleMultiplier = activeDefenders.reduce(
    (sum, player) => sum + PlayerMoraleService.getMatchMultiplier(player),
    0
  ) / activeDefenders.length;
  const moraleMultiplierPressure = clamp4((1 - teamMoraleMultiplier) * 0.28, -0.06, 0.12);
  const contextBase = getContextBaseChance(context);
  return clamp4(
    contextBase * (1 + qualityPressure + fatiguePressure + moralePenalty + moraleMultiplierPressure + rainPressure) * clamp4(pressureMultiplier, 0.75, 1.45),
    4e-3,
    0.052
  );
};
var buildLiveOwnGoalCommentary = (context, ownGoalPlayerName, rng) => {
  const variants = context === "corner" ? [
    `Gol samob\xF3jczy! ${ownGoalPlayerName} niefortunnie przecina do\u015Brodkowanie z rzutu ro\u017Cnego i kieruje pi\u0142k\u0119 do w\u0142asnej bramki!`,
    `Ale pech! Po ro\u017Cnym ${ownGoalPlayerName} pr\xF3buje wybija\u0107, pi\u0142ka odbija si\u0119 od niego i wpada do siatki!`,
    `Samob\xF3j po sta\u0142ym fragmencie! ${ownGoalPlayerName} \u017Ale uk\u0142ada cia\u0142o i zaskakuje w\u0142asnego bramkarza!`
  ] : context === "chaos" ? [
    `Gol samob\xF3jczy! W ogromnym zamieszaniu ${ownGoalPlayerName} dotyka pi\u0142ki jako ostatni i ta wpada do bramki!`,
    `Chaos w polu karnym ko\u0144czy si\u0119 samob\xF3jem! ${ownGoalPlayerName} interweniuje rozpaczliwie, ale pakuje pi\u0142k\u0119 do w\u0142asnej siatki!`,
    `Niefortunna interwencja! ${ownGoalPlayerName} pr\xF3buje ratowa\u0107 sytuacj\u0119 i pokonuje w\u0142asnego bramkarza!`
  ] : [
    `Gol samob\xF3jczy! ${ownGoalPlayerName} przecina gro\u017Ane podanie, ale kieruje pi\u0142k\u0119 do w\u0142asnej bramki!`,
    `Fatalny pech obro\u0144cy! ${ownGoalPlayerName} pr\xF3buje zatrzyma\u0107 akcj\u0119 i zaskakuje w\u0142asnego bramkarza!`,
    `Samob\xF3j! Pod presj\u0105 ${ownGoalPlayerName} interweniuje nieczysto i pi\u0142ka wpada do siatki!`
  ];
  const index = Math.floor(clamp4(rng(), 0, 0.999999) * variants.length);
  return variants[index];
};
var resolveLiveOwnGoal = ({
  context,
  defendingPlayers,
  defendingLineup,
  defendingFatigue,
  weather,
  pressureMultiplier = 1,
  rng
}) => {
  const chance = calculateLiveOwnGoalChance({
    context,
    defendingPlayers,
    defendingLineup,
    defendingFatigue,
    weather,
    pressureMultiplier
  });
  if (rng() >= chance) return null;
  const candidates = defendingLineup.map((id, slotIndex) => {
    if (!id) return null;
    const player2 = defendingPlayers.find((candidate) => candidate.id === id);
    if (!player2) return null;
    return {
      player: player2,
      weight: getPlayerRiskWeight(player2, slotIndex, defendingFatigue[player2.id] ?? 100)
    };
  }).filter((candidate) => candidate !== null);
  const player = chooseWeightedPlayer(candidates, rng);
  if (!player) return null;
  return {
    player,
    chance,
    commentary: buildLiveOwnGoalCommentary(context, player.lastName, rng)
  };
};

// tests/LiveMatchOwnGoalTests.ts
var baseAttributes = {
  strength: 70,
  stamina: 70,
  pace: 70,
  defending: 70,
  passing: 70,
  attacking: 55,
  finishing: 45,
  technique: 70,
  vision: 60,
  dribbling: 55,
  heading: 70,
  positioning: 70,
  goalkeeping: 25,
  freeKicks: 40,
  talent: 70,
  penalties: 40,
  corners: 40,
  aggression: 55,
  crossing: 45,
  leadership: 55,
  mentality: 70,
  workRate: 70,
  promisedRaisePct: null
};
var makePlayer = (id, position, overrides = {}, morale = 55) => ({
  id,
  firstName: id.toUpperCase(),
  lastName: `Player${id}`,
  position,
  overallRating: 70,
  attributes: { ...baseAttributes, ...overrides },
  morale
});
var defenders = [
  makePlayer("gk", "GK" /* GK */, { goalkeeping: 72 }),
  makePlayer("d1", "DEF" /* DEF */),
  makePlayer("d2", "DEF" /* DEF */),
  makePlayer("d3", "DEF" /* DEF */),
  makePlayer("d4", "DEF" /* DEF */),
  makePlayer("d5", "DEF" /* DEF */),
  makePlayer("m1", "MID" /* MID */),
  makePlayer("m2", "MID" /* MID */),
  makePlayer("m3", "MID" /* MID */),
  makePlayer("f1", "FWD" /* FWD */),
  makePlayer("f2", "FWD" /* FWD */)
];
var lineup = defenders.map((player) => player.id);
var calmOpenPlayChance = calculateLiveOwnGoalChance({
  context: "openPlay",
  defendingPlayers: defenders,
  defendingLineup: lineup,
  defendingFatigue: Object.fromEntries(lineup.map((id) => [id, 92])),
  weather: { precipitationChance: 0 }
});
(0, import_strict.default)(calmOpenPlayChance >= 4e-3);
(0, import_strict.default)(calmOpenPlayChance <= 0.018);
var exhaustedRainCornerChance = calculateLiveOwnGoalChance({
  context: "corner",
  defendingPlayers: defenders.map((player) => makePlayer(
    player.id,
    player.position,
    { defending: 42, positioning: 42, technique: 42, mentality: 42, workRate: 42 },
    22
  )),
  defendingLineup: lineup,
  defendingFatigue: Object.fromEntries(lineup.map((id) => [id, 48])),
  weather: { precipitationChance: 95 },
  pressureMultiplier: 1.45
});
(0, import_strict.default)(exhaustedRainCornerChance > calmOpenPlayChance);
(0, import_strict.default)(exhaustedRainCornerChance <= 0.052);
var forcedOwnGoal = resolveLiveOwnGoal({
  context: "chaos",
  defendingPlayers: defenders,
  defendingLineup: lineup,
  defendingFatigue: Object.fromEntries(lineup.map((id) => [id, 58])),
  weather: { precipitationChance: 80 },
  rng: () => 0
});
(0, import_strict.default)(forcedOwnGoal);
(0, import_strict.default)(lineup.includes(forcedOwnGoal.player.id));
(0, import_strict.default)(forcedOwnGoal.commentary.toLowerCase().includes("samob"));
var blockedOwnGoal = resolveLiveOwnGoal({
  context: "chaos",
  defendingPlayers: defenders,
  defendingLineup: lineup,
  defendingFatigue: Object.fromEntries(lineup.map((id) => [id, 58])),
  weather: { precipitationChance: 80 },
  rng: () => 0.999
});
import_strict.default.equal(blockedOwnGoal, null);
(0, import_strict.default)(buildLiveOwnGoalCommentary("openPlay", "Kowalski", () => 0.1).includes("Kowalski"));
(0, import_strict.default)(buildLiveOwnGoalCommentary("corner", "Nowak", () => 0.9).includes("Nowak"));
console.log("LiveMatchOwnGoalTests: OK");
