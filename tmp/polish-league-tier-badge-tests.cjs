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

// tests/PolishLeagueTierBadgeTests.ts
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

// resources/static_db/clubs/pl_clubs.ts
var generateClubId = (name) => {
  const slug = name.replace(/ł/g, "l").replace(/Ł/g, "L").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return `PL_${slug}`;
};

// resources/static_db/clubs/pl_fourth_league_2026.ts
var POLISH_FOURTH_LEAGUE_2026 = {
  "dolno\u015Bl\u0105skie": [
    "Cement Raciborowice",
    "Piast \u017Bmigr\xF3d",
    "Moto-Jelcz O\u0142awa",
    "AKS Strzegom",
    "Iskra Ksi\u0119ginice",
    "Polonia Bielany Wroc\u0142awskie",
    "WKS Wierzbice",
    "GKS Mirk\xF3w/D\u0142ugo\u0142\u0119ka",
    "G\xF3rnik Z\u0142otoryja",
    "Chrobry II G\u0142og\xF3w",
    "Lechia Dzier\u017Coni\xF3w",
    "Piast Nowa Ruda",
    "B\u0142yskawica Ga\u0107",
    "Orze\u0142 Z\u0105bkowice \u015Al\u0105skie",
    "Polonia \u015Aroda \u015Al\u0105ska",
    "Odra \u015Acinawa",
    "Polonia-Stal \u015Awidnica",
    "Prochowiczanka Prochowice"
  ],
  "kujawsko-pomorskie": [
    "Pogo\u0144 Mogilno",
    "T\u0142uchowia T\u0142uchowo",
    "Unia Solec Kujawski",
    "Pomorzanin Toru\u0144",
    "Unia W\u0105brze\u017Ano",
    "Mustang Ostaszewo",
    "Victoria Czernikowo",
    "Kujawiak Kowal",
    "Wis\u0142a Dobrzy\u0144 nad Wis\u0142\u0105",
    "Lech Rypin",
    "Sparta Brodnica",
    "Skrwa Skrwilno",
    "Rawys Raci\u0105\u017C",
    "Start Pruszcz",
    "Orl\u0119ta Aleksandr\xF3w Kujawski",
    "Note\u0107 G\u0119bice",
    "Cuiavia Inowroc\u0142aw",
    "\u0141okietek Brze\u015B\u0107 Kujawski"
  ],
  "lubelskie": [
    "Lublinianka Lublin",
    "Avia II \u015Awidnik",
    "\u0141ada Bi\u0142goraj",
    "Orl\u0119ta Radzy\u0144 Podlaski",
    "Victoria \u0141ukowa",
    "Tur Milej\xF3w",
    "Granit Bychawa",
    "Tomasovia Tomasz\xF3w Lubelski",
    "Powi\u015Blak Ko\u0144skowola",
    "Bug Hanna",
    "MKS Ryki",
    "Lewart Lubart\xF3w",
    "Orl\u0119ta \u0141uk\xF3w",
    "Janowianka Jan\xF3w Lubelski",
    "\u015Awidniczanka \u015Awidnik",
    "G\xF3rnik II \u0141\u0119czna"
  ],
  "lubuskie": [
    "Victoria Szczaniec",
    "Korona Ko\u017Cuch\xF3w",
    "Czarni \u017Baga\u0144",
    "Polonia S\u0142ubice",
    "Ilanka Rzepin",
    "Odra Nietk\xF3w",
    "Piast Karnin",
    "Celuloza Kostrzyn",
    "R\xF3\u017Ca R\xF3\u017Canki",
    "Pogo\u0144 Skwierzyna",
    "Pogo\u0144 \u015Awiebodzin",
    "Piast I\u0142owa",
    "\u0141ucznik Strzelce Kraje\u0144skie",
    "Promie\u0144 \u017Bary",
    "Sprotavia Szprotawa",
    "Lechia II Zielona G\xF3ra",
    "Dozamet Nowa S\xF3l",
    "Stal Sul\u0119cin"
  ],
  "\u0142\xF3dzkie": [
    "RKS Radomsko",
    "Zjednoczeni Stryk\xF3w",
    "Polonia Piotrk\xF3w Trybunalski",
    "Boruta Zgierz",
    "Orkan Buczek",
    "AKS SMS \u0141\xF3d\u017A",
    "Ceramika Opoczno",
    "Stal G\u0142owno",
    "W\u0142\xF3kniarz Pabianice",
    "GKS Be\u0142chat\xF3w",
    "Sok\xF3\u0142 Aleksandr\xF3w \u0141\xF3dzki",
    "Zryw Wygoda",
    "KS Kutno",
    "Orze\u0142 Parz\u0119czew",
    "\u0141KS III \u0141\xF3d\u017A",
    "Concordia Piotrk\xF3w Trybunalski",
    "Ekolog Wojs\u0142awice",
    "LZS Justyn\xF3w"
  ],
  "ma\u0142opolskie": [
    "Cracovia II",
    "Unia Tarn\xF3w",
    "Boche\u0144ski KS",
    "Victoria Jaworzno",
    "Wolania Wola Rz\u0119dzi\u0144ska",
    "Poprad Muszyna",
    "Glinik Gorlice",
    "Beskid Andrych\xF3w",
    "Kalwarianka Kalwaria Zebrzydowska",
    "Termalica II Nieciecza",
    "Pcimianka Pcim",
    "B\u0142\u0119kitni Modlnica",
    "Luba\u0144 Maniowy",
    "Dalin My\u015Blenice",
    "Orze\u0142 Rycz\xF3w",
    "Hutnik II Krak\xF3w",
    "Limanovia Limanowa",
    "Watra Bia\u0142ka Tatrza\u0144ska"
  ],
  "mazowieckie": [
    "Hutnik Warszawa",
    "Legionovia Legionowo",
    "Podlasie Soko\u0142\xF3w Podlaski",
    "Polonia II Warszawa",
    "Bro\u0144 Radom",
    "Makowianka Mak\xF3w Mazowiecki",
    "Mazur Karczew",
    "Ursus Warszawa",
    "Mszczonowianka Mszczon\xF3w",
    "MKS Piaseczno",
    "Energia Kozienice",
    "Talent Warszawa",
    "B\u0142onianka B\u0142onie",
    "KS \u0141omianki",
    "Victoria Sulej\xF3wek",
    "Oskar Przysucha",
    "Nadnarwianka Pu\u0142tusk",
    "MKS Przasnysz"
  ],
  "opolskie": [
    "Odra II Opole",
    "Ruch Zdzieszowice",
    "LZS Domaszkowice",
    "LZS Staro\u015Bcin",
    "LZS Starowice Dolne",
    "Start Namys\u0142\xF3w",
    "Victoria \u017Byrowa",
    "\u015Al\u0105sk \u0141ubniany",
    "Ma\u0142apanew Ozimek",
    "LKS Kad\u0142ub",
    "MKS Gogolin",
    "Stal Zawadzkie",
    "Fortuna G\u0142og\xF3wek",
    "Porawie Wi\u0119kszyce"
  ],
  "podkarpackie": [
    "Igloopol D\u0119bica",
    "KS Wi\u0105zownica",
    "Ekoball Sanok",
    "Izolator Boguchwa\u0142a",
    "B\u0142\u0119kitni Ropczyce",
    "Sok\xF3\u0142 Nisko",
    "Polonia Przemy\u015Bl",
    "Stal II Rzesz\xF3w",
    "Legion Pilzno",
    "Czarni Jas\u0142o",
    "Sok\xF3\u0142 Sieniawa",
    "Pogo\u0144-Sok\xF3\u0142 II Lubacz\xF3w",
    "G\xF3rnik Strachocina",
    "Wis\u0142ok Wi\u015Bniowa",
    "Radomy\u015Blanka Radomy\u015Bl",
    "Pogo\u0144 Le\u017Cajsk",
    "Strug Tyczyn",
    "Stal \u0141a\u0144cut"
  ],
  "podlaskie": [
    "Warmia Grajewo",
    "KS Wasilk\xF3w",
    "Promie\u0144 Mo\u0144ki",
    "Wissa Szczuczyn",
    "\u0141KS II \u0141om\u017Ca",
    "KS Micha\u0142owo",
    "Hetman Tykocin",
    "Pionier Bra\u0144sk",
    "Tur Bielsk Podlaski",
    "Czarni Czarna Bia\u0142ostocka",
    "Supra\u015Blanka Supra\u015Bl",
    "Krypnianka Krypno",
    "KS \u015Aniadowo",
    "Ruch Wysokie Mazowieckie",
    "Pomorzanka Sejny",
    "LZS Krynki"
  ],
  "pomorskie": [
    "Arka II Gdynia",
    "Pogo\u0144 L\u0119bork",
    "Czarni Pruszcz Gda\u0144ski",
    "Sok\xF3\u0142 Bo\u017Cepole Wielkie",
    "Gryf Wejherowo",
    "Jaguar Gda\u0144sk",
    "Cartusia Kartuzy",
    "KP Starogard Gda\u0144ski",
    "Gryf S\u0142upsk",
    "Wierzyca Pelplin",
    "Radunia St\u0119\u017Cyca",
    "Stoczniowiec Gda\u0144sk",
    "Anio\u0142y Garczegorze",
    "Powi\u015Ble Dzierzgo\u0144",
    "Stolem Gniewino",
    "Dolina Speranda Niepogl\u0119dzie",
    "Chojniczanka II Chojnice",
    "Sparta Sycewice"
  ],
  "\u015Bl\u0105skie": [
    "GKS II Katowice",
    "MRKS Czechowice-Dziedzice",
    "Przemsza Siewierz",
    "Ruch Radzionk\xF3w",
    "Ruch II Chorz\xF3w",
    "Unia Turza \u015Al\u0105ska",
    "Podlesianka Katowice",
    "Szombierki Bytom",
    "Sp\xF3jnia Landek",
    "Podbeskidzie II",
    "Polonia \u0141aziska G\xF3rne",
    "Drama Zbros\u0142awice",
    "Rozw\xF3j Katowice",
    "Ku\u017Ania Ustro\u0144",
    "Piast II Gliwice",
    "LKS Be\u0142k",
    "Gwarek Tarnowskie G\xF3ry",
    "Victoria Cz\u0119stochowa"
  ],
  "\u015Bwi\u0119tokrzyskie": [
    "Victoria Skalbmierz",
    "Orl\u0119ta Kielce",
    "Arka Paw\u0142\xF3w",
    "Sparta Kazimierza Wielka",
    "Neptun Ko\u0144skie",
    "Korona III Kielce",
    "KKP Korona Kielce",
    "Spartakus Daleszyce",
    "GKS Rudki",
    "Wicher Miedziana G\xF3ra",
    "OKS Opat\xF3w",
    "Klimontowianka Klimont\xF3w",
    "Granat Skar\u017Cysko-Kamienna",
    "GKS Nowiny",
    "Hetman W\u0142oszczowa",
    "Alit O\u017Car\xF3w",
    "Wierna Ma\u0142ogoszcz",
    "Orlicz Suchedni\xF3w"
  ],
  "warmi\u0144sko-mazurskie": [
    "Stomil Olsztyn",
    "Granica K\u0119trzyn",
    "Rominta Go\u0142dap",
    "Concordia Elbl\u0105g",
    "Znicz Bia\u0142a Piska",
    "Pisa Barczewo",
    "T\u0119cza Biskupiec",
    "Mazur E\u0142k",
    "GKS Wikielec",
    "Start Nidzica",
    "Sok\xF3\u0142 Ostr\xF3da",
    "Mamry Gi\u017Cycko",
    "Naki Olsztyn",
    "DKS Dobre Miasto",
    "Zatoka Braniewo",
    "Polonia Pas\u0142\u0119k"
  ],
  "wielkopolskie": [
    "Polonia Golina",
    "Piast Kobylnica",
    "Pogo\u0144 Nowe Skalmierzyce",
    "Obra Ko\u015Bcian",
    "Polonia Leszno",
    "Kania Gosty\u0144",
    "LKS Go\u0142uch\xF3w",
    "Nielba W\u0105growiec",
    "Polonia Chodzie\u017C",
    "G\xF3rnik Konin",
    "Astra Krotoszyn",
    "Warta \u015Arem",
    "Mieszko Gniezno",
    "Avia Kamionki",
    "Ostrovia Ostr\xF3w Wlkp.",
    "K\u0142os Budzy\u0144",
    "Meblorz Swarz\u0119dz",
    "Huragan Pobiedziska"
  ],
  "zachodniopomorskie": [
    "Pogo\u0144 II Szczecin",
    "Kotwica Ko\u0142obrzeg",
    "Biali S\u0105d\xF3w",
    "D\u0105b D\u0119bno",
    "Arkonia Szczecin",
    "\u015Awit II Szczecin",
    "Astra Ustronie Morskie",
    "Chemik Police",
    "Iskierka Szczecin",
    "Wybrze\u017Ce Rewalskie Rewal",
    "Gwardia Koszalin",
    "CRS Barlinek",
    "Sparta Gryfice",
    "GKS Manowo",
    "Ina I\u0144sko",
    "Orze\u0142 Wa\u0142cz"
  ]
};

// services/PolishFourthLeagueService.ts
var FOURTH_LEAGUE_IDS = [
  "L_PL_5_DS",
  "L_PL_5_KP",
  "L_PL_5_LU",
  "L_PL_5_LB",
  "L_PL_5_LD",
  "L_PL_5_MA",
  "L_PL_5_MZ",
  "L_PL_5_OP",
  "L_PL_5_PK",
  "L_PL_5_PD",
  "L_PL_5_PM",
  "L_PL_5_SL",
  "L_PL_5_SK",
  "L_PL_5_WM",
  "L_PL_5_WP",
  "L_PL_5_ZP"
];
var FOURTH_LEAGUE_FEEDER_IDS = [
  "L_PL_6_DS",
  "L_PL_6_KP",
  "L_PL_6_LU",
  "L_PL_6_LB",
  "L_PL_6_LD",
  "L_PL_6_MA",
  "L_PL_6_MZ",
  "L_PL_6_OP",
  "L_PL_6_PK",
  "L_PL_6_PD",
  "L_PL_6_PM",
  "L_PL_6_SL",
  "L_PL_6_SK",
  "L_PL_6_WM",
  "L_PL_6_WP",
  "L_PL_6_ZP"
];
var FOURTH_LEAGUE_BY_VOIVODESHIP = {
  "dolno\u015Bl\u0105skie": "L_PL_5_DS",
  "kujawsko-pomorskie": "L_PL_5_KP",
  "lubelskie": "L_PL_5_LU",
  "lubuskie": "L_PL_5_LB",
  "\u0142\xF3dzkie": "L_PL_5_LD",
  "ma\u0142opolskie": "L_PL_5_MA",
  "mazowieckie": "L_PL_5_MZ",
  "opolskie": "L_PL_5_OP",
  "podkarpackie": "L_PL_5_PK",
  "podlaskie": "L_PL_5_PD",
  "pomorskie": "L_PL_5_PM",
  "\u015Bl\u0105skie": "L_PL_5_SL",
  "\u015Bwi\u0119tokrzyskie": "L_PL_5_SK",
  "warmi\u0144sko-mazurskie": "L_PL_5_WM",
  "wielkopolskie": "L_PL_5_WP",
  "zachodniopomorskie": "L_PL_5_ZP"
};
var FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP = {
  "dolno\u015Bl\u0105skie": "L_PL_6_DS",
  "kujawsko-pomorskie": "L_PL_6_KP",
  "lubelskie": "L_PL_6_LU",
  "lubuskie": "L_PL_6_LB",
  "\u0142\xF3dzkie": "L_PL_6_LD",
  "ma\u0142opolskie": "L_PL_6_MA",
  "mazowieckie": "L_PL_6_MZ",
  "opolskie": "L_PL_6_OP",
  "podkarpackie": "L_PL_6_PK",
  "podlaskie": "L_PL_6_PD",
  "pomorskie": "L_PL_6_PM",
  "\u015Bl\u0105skie": "L_PL_6_SL",
  "\u015Bwi\u0119tokrzyskie": "L_PL_6_SK",
  "warmi\u0144sko-mazurskie": "L_PL_6_WM",
  "wielkopolskie": "L_PL_6_WP",
  "zachodniopomorskie": "L_PL_6_ZP"
};
var EMPTY_STATS = () => ({
  points: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  played: 0,
  form: []
});
var hash = (value) => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};
var rngFor = (seed, key) => {
  let state = (seed ^ hash(key)) >>> 0;
  return () => {
    state = state * 1664525 + 1013904223 >>> 0;
    return state / 4294967296;
  };
};
var shuffled = (values, seed, key) => {
  const result = [...values];
  const rng = rngFor(seed, key);
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(rng() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};
var poisson = (expected, rng) => {
  const limit = Math.exp(-expected);
  let product = 1;
  let count = 0;
  do {
    count++;
    product *= rng();
  } while (product > limit && count < 9);
  return count - 1;
};
var FIRST_NAMES = ["Jakub", "Kacper", "Mateusz", "Micha\u0142", "Bartosz", "Patryk", "Szymon", "Dawid", "Pawe\u0142", "Piotr", "Tomasz"];
var LAST_NAMES = ["Kowalski", "Nowak", "Wi\u015Bniewski", "W\xF3jcik", "Kami\u0144ski", "Lewandowski", "Zieli\u0144ski", "Szyma\u0144ski", "Wo\u017Aniak", "D\u0105browski", "Koz\u0142owski"];
var makePlayerStats = (leagueId, clubs) => clubs.flatMap((club) => Array.from({ length: 11 }, (_, index) => {
  const nameSeed = hash(`${club.id}|${index}`);
  return {
    id: `IV_STAT_${club.id}_${index}`,
    clubId: club.id,
    name: `${FIRST_NAMES[(nameSeed + index) % FIRST_NAMES.length]} ${LAST_NAMES[(nameSeed >>> 5) % LAST_NAMES.length]}`,
    appearances: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    ratingTotal: 0
  };
}));
var createSchedule = (leagueId, clubIds, template, seed) => {
  const ids = shuffled(clubIds, seed, leagueId);
  const fixed = ids[0];
  let rotating = ids.slice(1);
  const firstHalf = [];
  for (let round = 0; round < ids.length - 1; round++) {
    const pairs = [];
    const fixedOpponent = rotating[rotating.length - 1];
    pairs.push(round % 2 === 0 ? { home: fixed, away: fixedOpponent } : { home: fixedOpponent, away: fixed });
    for (let index = 0; index < ids.length / 2 - 1; index++) {
      const left = rotating[index];
      const right = rotating[rotating.length - 2 - index];
      pairs.push(round % 2 === 0 ? { home: left, away: right } : { home: right, away: left });
    }
    firstHalf.push(pairs);
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }
  const leagueSlots = template.slots.filter((slot) => String(slot.competition) === "LEAGUE").sort((left, right) => left.start.getTime() - right.start.getTime());
  const roundCount = (ids.length - 1) * 2;
  if (leagueSlots.length < roundCount) {
    throw new Error(`${leagueId} requires ${roundCount} league dates; only ${leagueSlots.length} are available.`);
  }
  const lastSlotExclusive = ids.length < 18 ? 33 : 34;
  const firstSlotIndex = lastSlotExclusive - roundCount;
  const scheduledLeagueSlots = leagueSlots.slice(firstSlotIndex, lastSlotExclusive);
  return Array.from({ length: roundCount }, (_, roundIndex) => {
    const secondHalf = roundIndex >= ids.length - 1;
    const base = firstHalf[roundIndex % (ids.length - 1)];
    return base.map((pair, matchIndex) => ({
      id: `IV_${template.seasonStartYear}_${leagueId}_R${roundIndex + 1}_M${matchIndex + 1}`,
      leagueId,
      round: roundIndex + 1,
      date: scheduledLeagueSlots[roundIndex].start.toISOString(),
      homeClubId: secondHalf ? pair.away : pair.home,
      awayClubId: secondHalf ? pair.home : pair.away,
      homeGoals: null,
      awayGoals: null,
      status: "SCHEDULED"
    }));
  }).flat();
};
var updateTable = (club, goalsFor, goalsAgainst) => {
  const win = goalsFor > goalsAgainst;
  const draw = goalsFor === goalsAgainst;
  const form = win ? "W" : draw ? "R" : "P";
  return {
    ...club,
    stats: {
      ...club.stats,
      played: club.stats.played + 1,
      wins: club.stats.wins + (win ? 1 : 0),
      draws: club.stats.draws + (draw ? 1 : 0),
      losses: club.stats.losses + (!win && !draw ? 1 : 0),
      goalsFor: club.stats.goalsFor + goalsFor,
      goalsAgainst: club.stats.goalsAgainst + goalsAgainst,
      goalDifference: club.stats.goalDifference + goalsFor - goalsAgainst,
      points: club.stats.points + (win ? 3 : draw ? 1 : 0),
      form: [...club.stats.form ?? [], form].slice(-5)
    }
  };
};
var applyPlayerStats = (rows, clubId, goals, conceded, rng) => {
  const clubRows = rows.filter((row) => row.clubId === clubId);
  const changed = new Map(clubRows.map((row) => [row.id, {
    ...row,
    appearances: row.appearances + 1,
    ratingTotal: row.ratingTotal + Math.max(5.2, Math.min(8.8, 6.45 + goals * 0.18 - conceded * 0.1 + (rng() - 0.5) * 0.8))
  }]));
  for (let goal = 0; goal < goals; goal++) {
    const scorer = clubRows[Math.floor(rng() * Math.min(8, clubRows.length))];
    const assist = clubRows[Math.floor(rng() * clubRows.length)];
    changed.get(scorer.id).goals += 1;
    if (assist.id !== scorer.id && rng() > 0.14) changed.get(assist.id).assists += 1;
  }
  const yellowCount = rng() < 0.72 ? 1 + Math.floor(rng() * 3) : 0;
  for (let card = 0; card < yellowCount; card++) {
    changed.get(clubRows[Math.floor(rng() * clubRows.length)].id).yellowCards += 1;
  }
  if (rng() < 0.055) changed.get(clubRows[Math.floor(rng() * clubRows.length)].id).redCards += 1;
  return rows.map((row) => changed.get(row.id) ?? row);
};
var reserveParentName = (name) => {
  const stripped = name.replace(/\s+(II|III)$/i, "").replace(/^(.+?)\s+(?:II|III)\s+(.+)$/i, "$1 $2").trim();
  return stripped === name ? null : stripped;
};
var createRegionalPoolClub = (voivodeship, poolId, seasonStartYear, number, occupiedIds) => {
  let ordinal = number;
  let id = `PL_DISTRICT_${poolId}_${seasonStartYear}_${ordinal}`;
  while (occupiedIds.has(id)) {
    ordinal++;
    id = `PL_DISTRICT_${poolId}_${seasonStartYear}_${ordinal}`;
  }
  occupiedIds.add(id);
  const name = `Klub okr\u0119gowy ${voivodeship} ${ordinal}`;
  const reputation = 1 + hash(id) % 3;
  const budget = FinanceService.calculateInitialBudget(6, reputation);
  return {
    id,
    name,
    shortName: `KO${ordinal}`,
    leagueId: poolId,
    tier: 6,
    colorsHex: ["#183a5a", "#ffffff"],
    colorPrimary: "#183a5a",
    colorSecondary: "#ffffff",
    stadiumName: `Stadion okr\u0119gowy ${ordinal}`,
    stadiumCapacity: 500 + hash(`${id}|stadium`) % 1001,
    reputation,
    country: "Polska",
    polishVoivodeship: voivodeship,
    isDefaultActive: false,
    rosterIds: [],
    stats: EMPTY_STATS(),
    budget,
    transferBudget: 0,
    reserveBudget: 0,
    boardStrictness: 5,
    signingBonusPool: 0,
    boardConfidence: 70
  };
};
var PolishFourthLeagueService = {
  isFourthLeagueId(value) {
    return FOURTH_LEAGUE_IDS.includes(value);
  },
  isFourthLeagueFeederId(value) {
    return FOURTH_LEAGUE_FEEDER_IDS.includes(value);
  },
  isLightweightRegionalLeagueId(value) {
    return this.isFourthLeagueId(value) || this.isFourthLeagueFeederId(value);
  },
  getLeagueForVoivodeship(voivodeship) {
    return FOURTH_LEAGUE_BY_VOIVODESHIP[voivodeship];
  },
  getFeederLeagueForVoivodeship(voivodeship) {
    return FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP[voivodeship];
  },
  getVoivodeshipForFeederLeague(leagueId) {
    const match = Object.entries(FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP).find(([, candidateLeagueId]) => candidateLeagueId === leagueId);
    if (!match) throw new Error(`Unknown Polish district-pool id: ${leagueId}.`);
    return match[0];
  },
  getVoivodeshipForLeague(leagueId) {
    const match = Object.entries(FOURTH_LEAGUE_BY_VOIVODESHIP).find(([, candidateLeagueId]) => candidateLeagueId === leagueId);
    if (!match) throw new Error(`Unknown Polish IV-liga id: ${leagueId}.`);
    return match[0];
  },
  /**
   * Merges the researched 2026/27 membership with existing database/datapack
   * clubs. Existing ids win, so a datapack can improve a club's crest, stadium
   * or strength without breaking the regional competition. Missing teams are
   * represented by deliberately inactive lightweight Club records.
   */
  mergeCareerClubs(sourceClubs, startYear) {
    if (startYear !== 2026) return sourceClubs;
    const result = sourceClubs.map((club) => ({ ...club }));
    const byId = new Map(result.map((club) => [club.id, club]));
    const byName = new Map(result.map((club) => [club.name.toLocaleLowerCase("pl-PL"), club]));
    Object.entries(POLISH_FOURTH_LEAGUE_2026).forEach(([voivodeship, names]) => {
      const leagueId = FOURTH_LEAGUE_BY_VOIVODESHIP[voivodeship];
      names.forEach((name, index) => {
        const generatedId = generateClubId(name);
        const existing = byId.get(generatedId) ?? byName.get(name.toLocaleLowerCase("pl-PL"));
        if (existing) {
          existing.leagueId = leagueId;
          existing.tier = 5;
          existing.polishVoivodeship = voivodeship;
          existing.isDefaultActive = false;
          existing.stats = EMPTY_STATS();
          return;
        }
        const reputation = 1 + hash(`${voivodeship}|${name}`) % 3;
        const budget = FinanceService.calculateInitialBudget(5, reputation);
        const club = {
          id: generatedId,
          name,
          shortName: name.replace(/[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, "").slice(0, 4).toUpperCase(),
          leagueId,
          tier: 5,
          colorsHex: ["#17345f", "#ffffff", "#d9273e"],
          colorPrimary: "#17345f",
          colorSecondary: "#ffffff",
          stadiumName: `Stadion ${name}`,
          stadiumCapacity: 800 + hash(name) % 2201,
          reputation,
          country: "Polska",
          polishVoivodeship: voivodeship,
          // Inactive here means "not part of the full playable-world engine".
          // The dedicated IV-liga service still simulates and displays the club.
          isDefaultActive: false,
          rosterIds: [],
          stats: EMPTY_STATS(),
          budget,
          transferBudget: 0,
          reserveBudget: 0,
          boardStrictness: 5,
          signingBonusPool: 0,
          boardConfidence: 70
        };
        result.push(club);
        byId.set(club.id, club);
        byName.set(name.toLocaleLowerCase("pl-PL"), club);
      });
    });
    return result;
  },
  /**
   * Creates one private, 18-club promotion pool for every voivodeship. Existing
   * database or datapack clubs are preferred whenever their regional metadata
   * is available; deterministic placeholders only fill genuine database gaps.
   * The pool has no fixtures of its own and exists solely to provide stable,
   * region-correct candidates for promotion to the appropriate IV liga.
   */
  ensureRegionalFeederPools(clubs, seasonStartYear) {
    let result = clubs.map((club) => ({ ...club }));
    const occupiedIds = new Set(result.map((club) => club.id));
    Object.keys(FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP).forEach((voivodeship) => {
      const poolId = FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP[voivodeship];
      let poolSize = result.filter((club) => club.leagueId === poolId).length;
      if (poolSize < 18) {
        const candidates = result.filter((club) => club.leagueId === "L_PL_5" && club.polishVoivodeship === voivodeship).sort(
          (left, right) => right.reputation - left.reputation || hash(`${seasonStartYear}|${voivodeship}|${left.id}`) - hash(`${seasonStartYear}|${voivodeship}|${right.id}`)
        ).slice(0, 18 - poolSize);
        const selectedIds = new Set(candidates.map((club) => club.id));
        result = result.map((club) => selectedIds.has(club.id) ? { ...club, leagueId: poolId, tier: 6, isDefaultActive: false, stats: EMPTY_STATS() } : club);
        poolSize += candidates.length;
      }
      while (poolSize < 18) {
        result.push(createRegionalPoolClub(voivodeship, poolId, seasonStartYear, poolSize + 1, occupiedIds));
        poolSize++;
      }
    });
    return result;
  },
  createSeason(clubs, template, seed) {
    const resetClubs = clubs.map((club) => this.isFourthLeagueId(club.leagueId) ? { ...club, tier: 5, isDefaultActive: false, stats: EMPTY_STATS() } : club);
    const fixtures = {};
    const playerStats = {};
    FOURTH_LEAGUE_IDS.forEach((leagueId, index) => {
      const leagueClubs = resetClubs.filter((club) => club.leagueId === leagueId);
      if (![14, 16, 18].includes(leagueClubs.length)) {
        throw new Error(`${leagueId} must contain 14, 16 or 18 clubs; received ${leagueClubs.length}.`);
      }
      fixtures[leagueId] = createSchedule(leagueId, leagueClubs.map((club) => club.id), template, seed + 500 + index);
      playerStats[leagueId] = makePlayerStats(leagueId, leagueClubs);
    });
    return { state: { seasonStartYear: template.seasonStartYear, fixtures, playerStats }, clubs: resetClubs };
  },
  rebalanceForNextSeason(clubs, seasonStartYear, seed) {
    let result = this.ensureRegionalFeederPools(clubs, seasonStartYear);
    const reserveConflictIds = new Set(result.filter((club) => this.isFourthLeagueId(club.leagueId)).filter((club) => {
      const parentName = reserveParentName(club.name);
      if (!parentName) return false;
      const normalizedParentName = parentName.toLocaleLowerCase("pl-PL");
      return result.some(
        (candidate) => candidate.id !== club.id && this.isFourthLeagueId(candidate.leagueId) && (candidate.name.toLocaleLowerCase("pl-PL") === normalizedParentName || normalizedParentName.length >= 5 && candidate.name.toLocaleLowerCase("pl-PL").includes(normalizedParentName))
      );
    }).map((club) => club.id));
    if (reserveConflictIds.size > 0) {
      result = result.map((club) => {
        if (!reserveConflictIds.has(club.id)) return club;
        const voivodeship = club.polishVoivodeship ?? this.getVoivodeshipForLeague(club.leagueId);
        return {
          ...club,
          leagueId: FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP[voivodeship],
          tier: 6,
          isDefaultActive: false,
          stats: EMPTY_STATS()
        };
      });
    }
    Object.entries(POLISH_FOURTH_LEAGUE_2026).forEach(([voivodeship, baseline]) => {
      const leagueId = FOURTH_LEAGUE_BY_VOIVODESHIP[voivodeship];
      const poolId = FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP[voivodeship];
      const targetSize = baseline.length;
      const current = this.getTable(result, leagueId);
      const promotionCandidates = result.filter((club) => club.leagueId === poolId && !reserveConflictIds.has(club.id)).filter((club) => this.canReserveEnterFourthLeague(club, result)).map((club) => {
        const rng = rngFor(seed, `IV_POOL_DRAW|${seasonStartYear}|${poolId}|${club.id}`);
        const strength = Math.max(0, Math.min(1, (club.reputation - 1) / 19));
        return { club, score: rng() * 0.7 + strength * 0.3 };
      }).sort((left, right) => right.score - left.score || left.club.id.localeCompare(right.club.id));
      if (promotionCandidates.length < 4) {
        throw new Error(`${poolId} has fewer than four eligible promotion candidates.`);
      }
      const promotedIds = new Set(promotionCandidates.slice(0, 4).map((candidate) => candidate.club.id));
      const relegationCount = Math.max(0, current.length + promotedIds.size - targetSize);
      const relegatedIds = new Set(current.slice(Math.max(0, current.length - relegationCount)).map((club) => club.id));
      result = result.map((club) => {
        if (promotedIds.has(club.id)) {
          return { ...club, leagueId, tier: 5, isDefaultActive: false, stats: EMPTY_STATS() };
        }
        if (relegatedIds.has(club.id)) {
          return { ...club, leagueId: poolId, tier: 6, isDefaultActive: false, stats: EMPTY_STATS() };
        }
        return club;
      });
      let poolClubs = result.filter((club) => club.leagueId === poolId);
      if (poolClubs.length > 18) {
        const surplusCount = poolClubs.length - 18;
        const surplusIds = new Set(poolClubs.filter((club) => !relegatedIds.has(club.id)).sort(
          (left, right) => left.reputation - right.reputation || hash(`${seed}|POOL_SURPLUS|${left.id}`) - hash(`${seed}|POOL_SURPLUS|${right.id}`)
        ).slice(0, surplusCount).map((club) => club.id));
        result = result.map((club) => surplusIds.has(club.id) ? { ...club, leagueId: "L_PL_5", tier: 6, isDefaultActive: false, stats: EMPTY_STATS() } : club);
      }
      poolClubs = result.filter((club) => club.leagueId === poolId);
      if (poolClubs.length < 18) {
        const replacements = result.filter((club) => club.leagueId === "L_PL_5" && club.polishVoivodeship === voivodeship).sort(
          (left, right) => right.reputation - left.reputation || hash(`${seed}|POOL_REFILL|${left.id}`) - hash(`${seed}|POOL_REFILL|${right.id}`)
        ).slice(0, 18 - poolClubs.length);
        const replacementIds = new Set(replacements.map((club) => club.id));
        result = result.map((club) => replacementIds.has(club.id) ? { ...club, leagueId: poolId, tier: 6, isDefaultActive: false, stats: EMPTY_STATS() } : club);
      }
      const occupiedIds = new Set(result.map((club) => club.id));
      let missing = 18 - result.filter((club) => club.leagueId === poolId).length;
      while (missing > 0) {
        const ordinal = 19 - missing;
        result.push(createRegionalPoolClub(voivodeship, poolId, seasonStartYear, ordinal, occupiedIds));
        missing--;
      }
    });
    return result;
  },
  processDate(state, clubs, date, seed) {
    if (!state) return { state, clubs, played: 0 };
    const cutoff = date.getTime();
    const clubById = new Map(clubs.map((club) => [club.id, club]));
    const nextFixtures = { ...state.fixtures };
    const nextPlayerStats = { ...state.playerStats };
    let played = 0;
    FOURTH_LEAGUE_IDS.forEach((leagueId) => {
      let statsRows = nextPlayerStats[leagueId];
      nextFixtures[leagueId] = state.fixtures[leagueId].map((fixture) => {
        if (fixture.status === "FINISHED" || new Date(fixture.date).getTime() > cutoff) return fixture;
        const home = clubById.get(fixture.homeClubId);
        const away = clubById.get(fixture.awayClubId);
        if (!home || !away) return fixture;
        const rng = rngFor(seed, fixture.id);
        const strengthDifference = (home.reputation - away.reputation) * 2.2;
        const homeGoals = poisson(Math.max(0.25, Math.min(3.25, 1.48 + strengthDifference / 10)), rng);
        const awayGoals = poisson(Math.max(0.2, Math.min(3, 1.14 - strengthDifference / 10)), rng);
        clubById.set(home.id, updateTable(home, homeGoals, awayGoals));
        clubById.set(away.id, updateTable(away, awayGoals, homeGoals));
        statsRows = applyPlayerStats(statsRows, home.id, homeGoals, awayGoals, rng);
        statsRows = applyPlayerStats(statsRows, away.id, awayGoals, homeGoals, rng);
        played++;
        return { ...fixture, homeGoals, awayGoals, status: "FINISHED" };
      });
      nextPlayerStats[leagueId] = statsRows;
    });
    if (played === 0) return { state, clubs, played: 0 };
    return {
      state: { ...state, fixtures: nextFixtures, playerStats: nextPlayerStats },
      clubs: clubs.map((club) => clubById.get(club.id) ?? club),
      played
    };
  },
  getTable(clubs, leagueId) {
    return clubs.filter((club) => club.leagueId === leagueId).sort(
      (left, right) => right.stats.points - left.stats.points || right.stats.goalDifference - left.stats.goalDifference || right.stats.goalsFor - left.stats.goalsFor || left.name.localeCompare(right.name, "pl")
    );
  },
  canReserveEnterThirdLeague(club, clubs) {
    const parentName = reserveParentName(club.name);
    if (!parentName) return true;
    const normalizedParentName = parentName.toLocaleLowerCase("pl-PL");
    const parent = clubs.find((candidate) => {
      const candidateName = candidate.name.toLocaleLowerCase("pl-PL");
      return candidateName === normalizedParentName || normalizedParentName.length >= 5 && candidateName.includes(normalizedParentName);
    });
    return !parent || !/^L_PL_4(?:_|$)/.test(parent.leagueId);
  },
  canReserveEnterFourthLeague(club, clubs) {
    const parentName = reserveParentName(club.name);
    if (!parentName) return true;
    const normalizedParentName = parentName.toLocaleLowerCase("pl-PL");
    const parent = clubs.find((candidate) => {
      if (candidate.id === club.id) return false;
      const candidateName = candidate.name.toLocaleLowerCase("pl-PL");
      return candidateName === normalizedParentName || normalizedParentName.length >= 5 && candidateName.includes(normalizedParentName);
    });
    return !parent || !this.isFourthLeagueId(parent.leagueId);
  }
};

// services/PolishThirdLeagueService.ts
var THIRD_LEAGUE_GROUP_IDS = [
  "L_PL_4_G1",
  "L_PL_4_G2",
  "L_PL_4_G3",
  "L_PL_4_G4"
];
var GROUP_BY_VOIVODESHIP = {
  "\u0142\xF3dzkie": "L_PL_4_G1",
  "mazowieckie": "L_PL_4_G1",
  "podlaskie": "L_PL_4_G1",
  "warmi\u0144sko-mazurskie": "L_PL_4_G1",
  "kujawsko-pomorskie": "L_PL_4_G2",
  "pomorskie": "L_PL_4_G2",
  "wielkopolskie": "L_PL_4_G2",
  "zachodniopomorskie": "L_PL_4_G2",
  "dolno\u015Bl\u0105skie": "L_PL_4_G3",
  "lubuskie": "L_PL_4_G3",
  "opolskie": "L_PL_4_G3",
  "\u015Bl\u0105skie": "L_PL_4_G3",
  "lubelskie": "L_PL_4_G4",
  "ma\u0142opolskie": "L_PL_4_G4",
  "podkarpackie": "L_PL_4_G4",
  "\u015Bwi\u0119tokrzyskie": "L_PL_4_G4"
};
var PolishThirdLeagueService = {
  isThirdLeagueId(leagueId) {
    return THIRD_LEAGUE_GROUP_IDS.includes(leagueId);
  },
  isThirdLeagueClub(club) {
    return this.isThirdLeagueId(club.leagueId);
  },
  getGroupForVoivodeship(voivodeship) {
    return GROUP_BY_VOIVODESHIP[voivodeship];
  },
  getGroupForClub(club) {
    if (!club.polishVoivodeship) {
      throw new Error(`Club ${club.id} cannot be routed to III liga: polishVoivodeship is missing.`);
    }
    return GROUP_BY_VOIVODESHIP[club.polishVoivodeship];
  },
  getPolishTier(leagueId) {
    if (this.isThirdLeagueId(leagueId) || leagueId === "L_PL_4") return 4;
    if (leagueId === "L_PL_5" || /^L_PL_5_/.test(leagueId ?? "")) return 5;
    if (/^L_PL_6_/.test(leagueId ?? "")) return 6;
    const match = /^L_PL_([1-3])$/.exec(leagueId ?? "");
    return match ? Number(match[1]) : null;
  }
};

// services/PolishLeagueTierBadgeService.ts
var getPolishLeagueTierBadge = (leagueId) => {
  if (PolishThirdLeagueService.isThirdLeagueId(leagueId) || leagueId === "L_PL_4") {
    return { label: "3L", color: "#94a3b8" };
  }
  if (PolishFourthLeagueService.isFourthLeagueId(leagueId)) {
    return { label: "4L", color: "#22d3ee" };
  }
  switch (leagueId) {
    case "L_PL_1":
      return { label: "EKS", color: "#f59e0b" };
    case "L_PL_2":
      return { label: "1L", color: "#60a5fa" };
    case "L_PL_3":
      return { label: "2L", color: "#a3e635" };
    default:
      return { label: "?", color: "#64748b" };
  }
};

// tests/PolishLeagueTierBadgeTests.ts
import_strict.default.equal(getPolishLeagueTierBadge("L_PL_1").label, "EKS");
import_strict.default.equal(getPolishLeagueTierBadge("L_PL_2").label, "1L");
import_strict.default.equal(getPolishLeagueTierBadge("L_PL_3").label, "2L");
THIRD_LEAGUE_GROUP_IDS.forEach((leagueId) => {
  import_strict.default.equal(getPolishLeagueTierBadge(leagueId).label, "3L", leagueId);
});
FOURTH_LEAGUE_IDS.forEach((leagueId) => {
  import_strict.default.equal(getPolishLeagueTierBadge(leagueId).label, "4L", leagueId);
});
import_strict.default.equal(getPolishLeagueTierBadge("UNKNOWN_LEAGUE").label, "?");
console.log(`Polish league tier badges: ${THIRD_LEAGUE_GROUP_IDS.length} III liga groups and ${FOURTH_LEAGUE_IDS.length} IV liga regions passed.`);
