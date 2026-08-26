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

// tests/PendingFreeAgentTransferTests.ts
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
    const isPolishClub2 = playerClubId.startsWith("PL_") || normalizedCountry === "POL";
    if (isPolishClub2) {
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

// services/TransferSellerLogicService.ts
var MIN_POSITION_DEPTH = {
  GK: 2,
  DEF: 5,
  MID: 4,
  FWD: 3
};
var POLISH_TRANSFER_CAP_BY_TIER = {
  1: 235e5,
  2: 7e6,
  3: 2e6,
  4: 45e4,
  5: 225e3
};
var getPolishAgeTransferCap = (player, tier) => {
  const tierScale = {
    1: 1,
    2: 0.36,
    3: 0.12,
    4: 0.04,
    5: 0.02
  }[tier] ?? 0.02;
  let ekstraklasaCap = 0;
  switch (player.position) {
    case "GK" /* GK */:
      if (player.age <= 23) ekstraklasaCap = 1e7;
      else if (player.age <= 29) ekstraklasaCap = 13e6;
      else if (player.age <= 32) ekstraklasaCap = 8e6;
      else if (player.age <= 34) ekstraklasaCap = 48e5;
      else ekstraklasaCap = 28e5;
      break;
    case "DEF" /* DEF */:
      if (player.age <= 21) ekstraklasaCap = 12e6;
      else if (player.age <= 24) ekstraklasaCap = 15e6;
      else if (player.age <= 29) ekstraklasaCap = 135e5;
      else if (player.age <= 32) ekstraklasaCap = 8e6;
      else if (player.age <= 34) ekstraklasaCap = 48e5;
      else ekstraklasaCap = 28e5;
      break;
    default:
      if (player.age <= 21) ekstraklasaCap = 235e5;
      else if (player.age <= 24) ekstraklasaCap = 2e7;
      else if (player.age <= 29) ekstraklasaCap = 16e6;
      else if (player.age <= 32) ekstraklasaCap = 85e5;
      else if (player.age <= 34) ekstraklasaCap = 45e5;
      else ekstraklasaCap = 26e5;
      break;
  }
  return ekstraklasaCap * tierScale;
};
var roundToNearest50k = (value) => Math.round(Math.max(1e5, value) / 5e4) * 5e4;
var isPolishClub = (club) => club.id.startsWith("PL_") || club.leagueId.startsWith("PL_");
var applyInternationalAskingGuardrail = (value, baseValue, player, contractDaysLeft, club) => {
  if (isPolishClub(club)) return value;
  let maxMarkup = player.isUntouchable ? 1.38 : 1.3;
  if (player.isOnTransferList) maxMarkup = Math.min(maxMarkup, 1.05);
  else if (contractDaysLeft > 0 && contractDaysLeft < PRE_CONTRACT_PRIORITY_DAYS) maxMarkup = Math.min(maxMarkup, 1.15);
  if (player.age >= 32) maxMarkup -= 0.05;
  else if (player.age >= 29) maxMarkup -= 0.02;
  return Math.min(value, baseValue * Math.max(1.02, maxMarkup));
};
var applyTransferCap = (value, club, player) => {
  if (!isPolishClub(club)) return roundToNearest50k(value);
  const tierCap = player ? Math.min(
    POLISH_TRANSFER_CAP_BY_TIER[club.tier] ?? 225e3,
    getPolishAgeTransferCap(player, club.tier)
  ) : POLISH_TRANSFER_CAP_BY_TIER[club.tier] ?? 225e3;
  return roundToNearest50k(Math.min(value, tierCap));
};
var getTimingPriceMultiplier = (timing) => {
  switch (timing) {
    case "IN_SIX_MONTHS" /* IN_SIX_MONTHS */:
      return 1.08;
    case "IN_TWELVE_MONTHS" /* IN_TWELVE_MONTHS */:
      return 1.2;
    case "CONTRACT_END" /* CONTRACT_END */:
      return 0;
    default:
      return 1;
  }
};
var getTimingLabel = (timing) => {
  switch (timing) {
    case "IN_SIX_MONTHS" /* IN_SIX_MONTHS */:
      return "za 6 miesiecy";
    case "IN_TWELVE_MONTHS" /* IN_TWELVE_MONTHS */:
      return "za 12 miesiecy";
    case "CONTRACT_END" /* CONTRACT_END */:
      return "po wygasnieciu obecnej umowy";
    default:
      return "natychmiast";
  }
};
var PRE_CONTRACT_PRIORITY_DAYS = 330;
var ELITE_CLUB_REPUTATION_MIN = 18;
var SUPER_CLUB_REPUTATION_MIN = 19;
var ABSOLUTE_TOP_CLUB_REPUTATION = 20;
var YOUNG_CORE_AGE_MAX = 23;
var VETERAN_SALE_AGE_MIN = 29;
var hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash << 5) - hash + value.charCodeAt(i) | 0;
  return Math.abs(hash);
};
var seededChance = (seed) => {
  const hash = hashString(seed);
  return hash % 1e4 / 1e4;
};
var isYoungHighOverallCore = (player, sellerClub, sellerSquad) => {
  if (sellerClub.reputation < ELITE_CLUB_REPUTATION_MIN || player.age > YOUNG_CORE_AGE_MAX) return false;
  const eliteOverallThreshold = Math.max(74, sellerClub.reputation + 55);
  if (player.overallRating < eliteOverallThreshold) return false;
  const squadRank = [...sellerSquad].sort((a, b) => b.overallRating - a.overallRating).findIndex((item) => item.id === player.id);
  return squadRank >= 0 && squadRank <= 10;
};
var isSuperClubHighOverallPlayer = (player, sellerClub) => {
  if (sellerClub.reputation < SUPER_CLUB_REPUTATION_MIN) return false;
  const highOverallThreshold = Math.max(78, sellerClub.reputation + 59);
  return player.overallRating >= highOverallThreshold;
};
var isSuperVeteranExceptionPosition = (position) => position === "GK" /* GK */ || position === "MID" /* MID */ || position === "FWD" /* FWD */;
var isSuperVeteranStillProtected = (player, sellerClub) => {
  if (player.age < VETERAN_SALE_AGE_MIN || !isSuperVeteranExceptionPosition(player.position)) return false;
  const superVeteranThreshold = Math.max(83, sellerClub.reputation + 63);
  return player.overallRating >= superVeteranThreshold;
};
var hasSeriousFinancialPressure = (club, askingPrice) => club.budget < Math.max(askingPrice * 0.7, 4e6);
var canEliteClubConsiderYoungCoreSale = (player, sellerClub, buyerClub, currentDate) => {
  if (buyerClub.reputation < ABSOLUTE_TOP_CLUB_REPUTATION) return false;
  if (sellerClub.reputation >= ABSOLUTE_TOP_CLUB_REPUTATION) return false;
  const reputationJump = buyerClub.reputation - sellerClub.reputation;
  if (reputationJump <= 0 || reputationJump > 2) return false;
  const monthlySeed = `${sellerClub.id}_${buyerClub.id}_${player.id}_${currentDate.getFullYear()}_${currentDate.getMonth()}`;
  const chance = sellerClub.reputation === 18 ? 0.28 : 0.16;
  return seededChance(monthlySeed) < chance;
};
var TransferSellerLogicService = {
  generateNegotiationAttemptLimit: () => Math.floor(Math.random() * 7) + 1,
  getNegotiationStance: (player, sellerClub, buyerClub, sellerSquad, currentDate, timing = "IMMEDIATE" /* IMMEDIATE */, boardKompetencja, coachFavoriteIds) => {
    const baseAskingPrice = TransferSellerLogicService.estimateAskingPrice(
      player,
      sellerClub,
      sellerSquad,
      currentDate,
      boardKompetencja
    );
    const askingPrice = applyTransferCap(baseAskingPrice * getTimingPriceMultiplier(timing), sellerClub, player);
    if (!player.isUntouchable && !player.isOnTransferList && coachFavoriteIds && coachFavoriteIds.includes(player.id) && Math.random() < 0.12) {
      return {
        allowTalks: false,
        askingPrice,
        reason: `Zarz\u0105d odrzuci\u0142 zapytanie. Trener uznaje tego zawodnika za kluczow\u0105 posta\u0107 sk\u0142adu i nie zgadza si\u0119 na jego odej\u015Bcie.`
      };
    }
    const sortedSquad = [...sellerSquad].sort((a, b) => b.overallRating - a.overallRating);
    const playerRank = Math.max(0, sortedSquad.findIndex((item) => item.id === player.id));
    const isBestPlayer = playerRank === 0;
    const isTopThree = playerRank <= 2;
    const isTopEleven = playerRank <= 10;
    const sameLeague = sellerClub.leagueId === buyerClub.leagueId;
    const reputationGap = buyerClub.reputation - sellerClub.reputation;
    const daysLeft = Math.floor(
      (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5
    );
    const sellerNeedsCash = hasSeriousFinancialPressure(sellerClub, askingPrice);
    const buyerAvailableCash = Math.max(buyerClub.budget || 0, buyerClub.transferBudget || 0);
    const getExceptionalAskingPrice = (multiplier) => Math.max(
      askingPrice,
      applyTransferCap(Math.max(askingPrice, baseAskingPrice) * multiplier, sellerClub, player)
    );
    if (timing !== "CONTRACT_END" /* CONTRACT_END */ && daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS) {
      return {
        allowTalks: false,
        askingPrice: 0,
        reason: `Kontrakt zawodnika wygasa za ${daysLeft} dni. Klub kupuj\u0105cy powinien rozmawia\u0107 z zawodnikiem o wolnym transferze po wyga\u015Bni\u0119ciu umowy.`
      };
    }
    if (timing === "CONTRACT_END" /* CONTRACT_END */ && player.isNegotiationPermanentBlocked && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS) {
      return {
        allowTalks: true,
        askingPrice: 0,
        reason: `Zawodnik odmowil przedluzenia umowy. Klub nie zada odstepnego za transfer po wygasnieciu kontraktu.`
      };
    }
    const blocksShortDelaySale = timing === "IMMEDIATE" /* IMMEDIATE */ || timing === "IN_SIX_MONTHS" /* IN_SIX_MONTHS */;
    const protectedEliteYoungCore = !player.isOnTransferList && isYoungHighOverallCore(player, sellerClub, sellerSquad) && daysLeft > PRE_CONTRACT_PRIORITY_DAYS && blocksShortDelaySale;
    if (protectedEliteYoungCore && !sellerNeedsCash) {
      const eliteJumpAllowed = canEliteClubConsiderYoungCoreSale(player, sellerClub, buyerClub, currentDate);
      const eliteAskingPrice = getExceptionalAskingPrice(eliteJumpAllowed ? 3.15 : 3.5);
      if (eliteJumpAllowed && buyerAvailableCash >= eliteAskingPrice * 0.92) {
        return {
          allowTalks: true,
          askingPrice: eliteAskingPrice,
          reason: `Zarzad chroni mlody rdzen skladu, ale wyjatkowy awans sportowy do klubu o reputacji 20 otwiera rozmowy. Cena wyjsciowa wynosi ${eliteAskingPrice.toLocaleString()} PLN.`
        };
      }
      return {
        allowTalks: false,
        askingPrice,
        reason: `Zarzad odrzucil zapytanie. Klub o reputacji ${sellerClub.reputation} nie sprzedaje mlodego zawodnika z wysokim overall bez powaznej presji finansowej.`
      };
    }
    const protectedSuperClubHighOverall = !player.isOnTransferList && isSuperClubHighOverallPlayer(player, sellerClub) && daysLeft > PRE_CONTRACT_PRIORITY_DAYS && blocksShortDelaySale && (player.age < VETERAN_SALE_AGE_MIN || isSuperVeteranStillProtected(player, sellerClub));
    if (protectedSuperClubHighOverall && !sellerNeedsCash) {
      const superClubAskingPrice = getExceptionalAskingPrice(isSuperVeteranStillProtected(player, sellerClub) ? 3.2 : 3.75);
      const monthlySeed = `${sellerClub.id}_${buyerClub.id}_${player.id}_super_core_${currentDate.getFullYear()}_${currentDate.getMonth()}`;
      const rareBoardApproval = buyerClub.reputation > sellerClub.reputation && buyerClub.reputation >= ABSOLUTE_TOP_CLUB_REPUTATION && seededChance(monthlySeed) < 0.08;
      if (rareBoardApproval && buyerAvailableCash >= superClubAskingPrice * 0.95) {
        return {
          allowTalks: true,
          askingPrice: superClubAskingPrice,
          reason: `Zarzad bardzo niechetnie dopuszcza rozmowy o zawodniku z wysokim overall, ale wyjatkowy ruch do klubu o reputacji 20 moze przejsc. Cena wyjsciowa wynosi ${superClubAskingPrice.toLocaleString()} PLN.`
        };
      }
      return {
        allowTalks: false,
        askingPrice,
        reason: `Zarzad odrzucil zapytanie. Klub o reputacji ${sellerClub.reputation} nie oddaje zawodnika z wysokim overall bez tarapatu finansowego albo bardzo szczegolnego ukladu sportowego.`
      };
    }
    const protectedByCorePlan = !!player.isUntouchable;
    const coachSeesAsImportant = !!coachFavoriteIds?.includes(player.id);
    if (protectedByCorePlan && !player.isOnTransferList && !sellerNeedsCash && daysLeft > PRE_CONTRACT_PRIORITY_DAYS && blocksShortDelaySale && reputationGap < 5) {
      const exceptionalAskingPrice = getExceptionalAskingPrice(coachSeesAsImportant ? 2.35 : 2.1);
      if (buyerAvailableCash >= exceptionalAskingPrice * 0.85) {
        return {
          allowTalks: true,
          askingPrice: exceptionalAskingPrice,
          reason: coachSeesAsImportant ? `Zarzad nie chce sprzedawac ulubienca trenera, ale przy bardzo wysokiej ofercie dopusci rozmowy. Cena wyjsciowa wynosi ${exceptionalAskingPrice.toLocaleString()} PLN.` : `Klub traktuje zawodnika jako czesc rdzenia skladu, ale przy bardzo wysokiej ofercie dopusci rozmowy. Cena wyjsciowa wynosi ${exceptionalAskingPrice.toLocaleString()} PLN.`
        };
      }
      return {
        allowTalks: false,
        askingPrice,
        reason: coachSeesAsImportant ? `Zarzad odrzucil zapytanie. Trener i klub uznaja tego zawodnika za kluczowa postac skladu.` : `Zarzad odrzucil zapytanie. Klub traktuje tego zawodnika jako czesc rdzenia skladu.`
      };
    }
    if (protectedByCorePlan && !player.isOnTransferList && daysLeft > PRE_CONTRACT_PRIORITY_DAYS) {
      const coreAskingPrice = applyTransferCap(askingPrice * (sellerNeedsCash ? 1.15 : 1.35), sellerClub, player);
      return {
        allowTalks: true,
        askingPrice: coreAskingPrice,
        reason: `Klub nie planuje sprzedazy kluczowego zawodnika, ale dopusci rozmowy tylko przy wyjatkowej ofercie. Cena wyjsciowa wynosi ${coreAskingPrice.toLocaleString()} PLN.`
      };
    }
    const protectedRivalSale = sameLeague && !player.isOnTransferList && !sellerNeedsCash && (player.isUntouchable || isBestPlayer) && reputationGap <= 1 && daysLeft > PRE_CONTRACT_PRIORITY_DAYS;
    if (protectedRivalSale && blocksShortDelaySale) {
      const rivalAskingPrice = getExceptionalAskingPrice(2.45);
      if (buyerAvailableCash >= rivalAskingPrice * 0.9) {
        return {
          allowTalks: true,
          askingPrice: rivalAskingPrice,
          reason: `Klub nie chce wzmacniac ligowego rywala, ale bardzo wysoka oferta moze przelamac opor. Cena wyjsciowa wynosi ${rivalAskingPrice.toLocaleString()} PLN.`
        };
      }
      return {
        allowTalks: false,
        askingPrice,
        reason: `Klub nie podejmie rozmow. ${sellerClub.name} nie zamierza sprzedawac kluczowego zawodnika bezposredniemu rywalowi z ligi w tym terminie.`
      };
    }
    const protectedTopElevenSale = sameLeague && !player.isOnTransferList && !sellerNeedsCash && isTopEleven && reputationGap <= 0 && daysLeft > PRE_CONTRACT_PRIORITY_DAYS;
    if (protectedTopElevenSale && blocksShortDelaySale) {
      const protectedAskingPrice = getExceptionalAskingPrice(1.85);
      if (buyerAvailableCash >= protectedAskingPrice * 0.9) {
        return {
          allowTalks: true,
          askingPrice: protectedAskingPrice,
          reason: `Klub nie planuje sprzedazy waznego zawodnika, ale przy wyraznej nadplacie dopusci rozmowy. Cena wyjsciowa wynosi ${protectedAskingPrice.toLocaleString()} PLN.`
        };
      }
      return {
        allowTalks: false,
        askingPrice,
        reason: `Klub nie jest sklonny sprzedac waznego zawodnika do ligowego rywala w tym terminie.`
      };
    }
    if ((protectedRivalSale || protectedTopElevenSale) && timing === "IN_TWELVE_MONTHS" /* IN_TWELVE_MONTHS */) {
      const delayedAskingPrice = applyTransferCap(askingPrice * 1.2, sellerClub, player);
      return {
        allowTalks: true,
        askingPrice: delayedAskingPrice,
        reason: `Klub nie chce sprzedawac tego zawodnika od razu, ale dopuszcza transfer ${getTimingLabel(timing)}. Cena wyjsciowa wynosi ${delayedAskingPrice.toLocaleString()} PLN.`
      };
    }
    if (sameLeague && isTopThree && !player.isOnTransferList && reputationGap <= 1) {
      return {
        allowTalks: true,
        askingPrice,
        reason: `Klub dopuszcza rozmowy o transferze ${getTimingLabel(timing)}, ale tylko przy ofercie wyjatkowej. Cena wyjsciowa wynosi ${askingPrice.toLocaleString()} PLN.`
      };
    }
    return {
      allowTalks: true,
      askingPrice,
      reason: `Klub jest gotow rozmawiac o transferze ${getTimingLabel(timing)}. Cena wyjsciowa wynosi ${askingPrice.toLocaleString()} PLN.`
    };
  },
  estimateAskingPrice: (player, sellerClub, sellerSquad, currentDate, boardKompetencja) => {
    const tier = FinanceService.getClubTier(sellerClub);
    const rawBaseValue = player.transferListPrice ? player.transferListPrice : FinanceService.calculateMarketValue(player, sellerClub.reputation, tier, sellerClub.country);
    const KOMPETENCJA_SELL_MULTIPLIER = {
      bardzo_wysoka: 1.15,
      wysoka: 1.07,
      przecietna: 1,
      niska: 0.95,
      bardzo_niska: 0.88
    };
    const kompMult = boardKompetencja ? KOMPETENCJA_SELL_MULTIPLIER[boardKompetencja] : 1;
    const baseValue = rawBaseValue * kompMult;
    let multiplier = 1;
    const daysLeft = Math.floor(
      (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5
    );
    if (player.isOnTransferList && !player.transferListPrice) multiplier -= 0.18;
    if (daysLeft > 0 && daysLeft < 180) multiplier -= 0.22;
    else if (daysLeft > 0 && daysLeft < PRE_CONTRACT_PRIORITY_DAYS) multiplier -= 0.12;
    else if (daysLeft >= PRE_CONTRACT_PRIORITY_DAYS && daysLeft < 730) multiplier += 0.04;
    else if (daysLeft >= 730) multiplier += 0.1;
    if (player.age <= 21) multiplier += 0.12;
    else if (player.age <= 24) multiplier += 0.06;
    else if (player.age >= 34) multiplier -= 0.18;
    else if (player.age >= 31) multiplier -= 0.1;
    if (player.isUntouchable) multiplier += 0.3;
    if (player.squadRole === "KEY_PLAYER") multiplier += 0.18;
    else if (player.squadRole === "STARTER") multiplier += 0.08;
    if (!player.isOnTransferList && isYoungHighOverallCore(player, sellerClub, sellerSquad)) {
      multiplier += 0.45;
    }
    if (!player.isOnTransferList && isSuperClubHighOverallPlayer(player, sellerClub)) {
      multiplier += isSuperVeteranStillProtected(player, sellerClub) ? 0.55 : 0.32;
    }
    const sortedSquad = [...sellerSquad].sort((a, b) => b.overallRating - a.overallRating);
    const top11Ids = sortedSquad.slice(0, 11).map((p) => p.id);
    if (top11Ids.includes(player.id)) multiplier += 0.14;
    if (sortedSquad.slice(0, 3).some((p) => p.id === player.id)) multiplier += 0.08;
    if (sortedSquad[0]?.id === player.id) multiplier += 0.1;
    const samePosition = sellerSquad.filter((p) => p.position === player.position && p.id !== player.id);
    const bestReplacement = samePosition.sort((a, b) => b.overallRating - a.overallRating)[0];
    const minimumDepth = MIN_POSITION_DEPTH[player.position];
    if (samePosition.length < minimumDepth) multiplier += 0.18;
    if (!bestReplacement) multiplier += 0.12;
    if (bestReplacement && player.overallRating - bestReplacement.overallRating >= 6) multiplier += 0.1;
    const financialPressure = sellerClub.budget < Math.max(baseValue * 0.75, 3e6);
    if (financialPressure) multiplier -= 0.1;
    let minimumMultiplier = player.isOnTransferList ? 0.75 : 1;
    if (daysLeft > PRE_CONTRACT_PRIORITY_DAYS && !player.isOnTransferList) {
      minimumMultiplier = Math.max(minimumMultiplier, 1.02);
    }
    if (top11Ids.includes(player.id)) minimumMultiplier = Math.max(minimumMultiplier, 1.08);
    if (sortedSquad.slice(0, 3).some((p) => p.id === player.id)) minimumMultiplier = Math.max(minimumMultiplier, 1.15);
    if (player.isUntouchable || sortedSquad[0]?.id === player.id) minimumMultiplier = Math.max(minimumMultiplier, 1.25);
    if (player.squadRole === "KEY_PLAYER") minimumMultiplier = Math.max(minimumMultiplier, 1.2);
    else if (player.squadRole === "STARTER") minimumMultiplier = Math.max(minimumMultiplier, 1.1);
    if (daysLeft >= 730 && !player.isOnTransferList) minimumMultiplier = Math.max(minimumMultiplier, 1.1);
    if (!player.isOnTransferList && isYoungHighOverallCore(player, sellerClub, sellerSquad)) {
      minimumMultiplier = Math.max(minimumMultiplier, 1.65);
    }
    if (!player.isOnTransferList && isSuperClubHighOverallPlayer(player, sellerClub)) {
      minimumMultiplier = Math.max(minimumMultiplier, isSuperVeteranStillProtected(player, sellerClub) ? 1.75 : 1.45);
    }
    const rawPrice = Math.max(1e5, baseValue * Math.max(multiplier, minimumMultiplier));
    const guardedPrice = applyInternationalAskingGuardrail(rawPrice, baseValue, player, daysLeft, sellerClub);
    return applyTransferCap(guardedPrice, sellerClub, player);
  },
  evaluateSellerDecision: (offer, player, sellerClub, buyerClub, sellerSquad, currentDate, negotiationContext, coachFavoriteIds) => {
    const openingStance = TransferSellerLogicService.getNegotiationStance(
      player,
      sellerClub,
      buyerClub,
      sellerSquad,
      currentDate,
      offer.timing,
      void 0,
      coachFavoriteIds
    );
    if (!openingStance.allowTalks) {
      return {
        verdict: "REJECT",
        askingPrice: openingStance.askingPrice,
        reason: openingStance.reason
      };
    }
    const askingPrice = roundToNearest50k(
      negotiationContext?.currentAskingPrice || openingStance.askingPrice
    );
    const attemptNumber = Math.max(1, negotiationContext?.attemptNumber || 1);
    const maxAttempts = Math.max(1, negotiationContext?.maxAttempts || 3);
    const ratio = offer.fee / Math.max(askingPrice, 1);
    if (offer.fee >= askingPrice) {
      return {
        verdict: "ACCEPT",
        askingPrice,
        reason: `Klub zaakceptowal warunki odstepnego. Ustalona cena: ${offer.fee.toLocaleString()} PLN.`
      };
    }
    if (ratio < 0.6) {
      return {
        verdict: "REJECT",
        askingPrice,
        reason: `Oferta zostala odebrana jako niepowazna. Klub oczekuje minimum ${askingPrice.toLocaleString()} PLN.`
      };
    }
    if (attemptNumber >= maxAttempts) {
      return {
        verdict: "REJECT",
        askingPrice,
        reason: `Klub uznal, ze stanowiska obu stron sa zbyt odlegle i konczy rozmowy. Oczekiwana cena nie spadla ponizej ${askingPrice.toLocaleString()} PLN.`
      };
    }
    const negotiationVariance = 1 + (Math.random() * 0.04 - 0.02);
    const counterPrice = roundToNearest50k(askingPrice * negotiationVariance);
    const normalizedCounterPrice = Math.max(
      roundToNearest50k(askingPrice * 0.97),
      Math.min(roundToNearest50k(askingPrice * 1.03), counterPrice)
    );
    return {
      verdict: "COUNTER",
      askingPrice: normalizedCounterPrice,
      reason: `Klub nie zaakceptuje ${offer.fee.toLocaleString()} PLN. Oczekiwana cena to ${normalizedCounterPrice.toLocaleString()} PLN.`
    };
  }
};

// services/ClubStrengthService.ts
var CLUB_REPUTATION_MIN = 1;
var CLUB_REPUTATION_DOMESTIC_CEILING = 10;
var CLUB_REPUTATION_MAX = 20;
var clamp3 = (value, min, max) => Math.min(max, Math.max(min, value));
var ClubStrengthService = {
  getLevel(reputation) {
    const normalizedReputation = clamp3(
      Number.isFinite(reputation) ? reputation : CLUB_REPUTATION_MIN,
      CLUB_REPUTATION_MIN,
      CLUB_REPUTATION_MAX
    );
    if (normalizedReputation <= CLUB_REPUTATION_DOMESTIC_CEILING) {
      return 34 + normalizedReputation * 4.2;
    }
    return 76 + (normalizedReputation - CLUB_REPUTATION_DOMESTIC_CEILING) * 2;
  },
  getExposure(reputation) {
    const minimumLevel = 34 + CLUB_REPUTATION_MIN * 4.2;
    const maximumLevel = 96;
    return clamp3(
      (ClubStrengthService.getLevel(reputation) - minimumLevel) / (maximumLevel - minimumLevel),
      0,
      1
    );
  }
};

// services/PlayerPrestigeService.ts
var PLAYER_REPUTATION_MIN = 1;
var PLAYER_REPUTATION_MAX = 99;
var clamp4 = (value, min, max) => Math.min(max, Math.max(min, value));
var normalizeOverall = (overall) => clamp4((clamp4(overall, 1, 99) - 35) / 64, 0, 1);
var PlayerPrestigeService = {
  /** Docelowa reputacja wynikająca z poziomu sportowego i ekspozycji klubu. */
  getReputationTarget(overall, clubReputation) {
    const sportingRecognition = 5 + Math.pow(normalizeOverall(overall), 1.15) * 76;
    const clubExposure = ClubStrengthService.getExposure(clubReputation) * 18;
    return clamp4(sportingRecognition + clubExposure, PLAYER_REPUTATION_MIN, PLAYER_REPUTATION_MAX);
  },
  /** Reputacja startowa bez progów i podłóg; mały rozrzut zachowuje różnorodność świata. */
  calculateGeneratedReputation(overall, clubReputation, random = Math.random) {
    const variation = (clamp4(random(), 0, 1) - 0.5) * 4;
    return Math.round(clamp4(
      PlayerPrestigeService.getReputationTarget(overall, clubReputation) + variation,
      PLAYER_REPUTATION_MIN,
      PLAYER_REPUTATION_MAX
    ));
  },
  /** Jeden płynny prestiż używany przy ocenie realności transferu. */
  getTransferPrestige(player) {
    const overall = clamp4(player.overallRating, 1, 99);
    const reputation = clamp4(player.reputacja ?? overall, PLAYER_REPUTATION_MIN, PLAYER_REPUTATION_MAX);
    return clamp4(overall * 0.72 + reputation * 0.28, PLAYER_REPUTATION_MIN, PLAYER_REPUTATION_MAX);
  },
  isGlobalIcon(player) {
    const overall = clamp4(player.overallRating, 1, 99);
    const reputation = clamp4(player.reputacja ?? overall, PLAYER_REPUTATION_MIN, PLAYER_REPUTATION_MAX);
    const prestige = PlayerPrestigeService.getTransferPrestige(player);
    return prestige >= 94 || reputation >= 97 && overall >= 85 || overall >= 97 && reputation >= 85;
  }
};

// services/PrestigeTransferGuardService.ts
var HIGH_PLAYER_PRESTIGE_THRESHOLD = 90;
var LOW_PRESTIGE_CLUB_REPUTATION_LIMIT = 17;
var YOUTH_TALENT_EXCEPTION_MIN_AGE = 16;
var YOUTH_TALENT_EXCEPTION_MAX_AGE = 18;
var YOUTH_TALENT_EXCEPTION_MIN_PRESTIGE = 72;
var GULF_EXCEPTION_COUNTRIES = /* @__PURE__ */ new Set(["KSA", "UAE", "QAT"]);
var getClubReputation = (club) => club.reputation ?? 0;
var clamp5 = (value, min, max) => Math.min(max, Math.max(min, value));
var getExpectationForPrestige = (prestige) => {
  const normalized = clamp5((prestige - 58) / 32, 0, 1);
  const preferredMinReputation = Math.round(4 + normalized * 15);
  const expectationGap = Math.round(3 + normalized * 2);
  const chanceBase = 1 - normalized;
  return {
    preferredMinReputation,
    acceptableMinReputation: Math.max(1, preferredMinReputation - expectationGap),
    longShotMinReputation: Math.max(0, preferredMinReputation - expectationGap * 2),
    stretchChance: clamp5(0.8 - normalized * 0.64, 0.16, 0.8),
    longShotChance: clamp5(0.36 * Math.pow(chanceBase, 2.2), 0, 0.36),
    extremeChance: clamp5(0.12 * Math.pow(chanceBase, 3), 0, 0.12)
  };
};
var getBandForClub = (clubReputation, expectation) => {
  if (clubReputation >= expectation.preferredMinReputation) return "NATURAL";
  if (clubReputation >= expectation.acceptableMinReputation) return "STRETCH";
  if (clubReputation >= expectation.longShotMinReputation) return "LONG_SHOT";
  return expectation.extremeChance > 0 ? "EXTREME" : "BLOCKED";
};
var getReasonForBand = (band, player, targetClub, expectation) => {
  const clubReputation = getClubReputation(targetClub);
  if (band === "BLOCKED") {
    return "M\xF3j klient traktuje taki kierunek jako nierealny sportowo. R\xF3\u017Cnica mi\u0119dzy jego poziomem a presti\u017Cem klubu jest zbyt du\u017Ca, \u017Ceby rozpocz\u0105\u0107 rozmowy.";
  }
  if (band === "EXTREME") {
    return `M\xF3j klient celuje du\u017Co wy\u017Cej. Klub o reputacji ${clubReputation} jest daleko poni\u017Cej jego naturalnego rynku i taki ruch wymaga\u0142by wyj\u0105tkowych okoliczno\u015Bci.`;
  }
  if (band === "LONG_SHOT") {
    return `M\xF3j klient zwykle szuka klub\xF3w o reputacji co najmniej ${expectation.acceptableMinReputation}. Ten kierunek jest bardzo ma\u0142o prawdopodobny bez ogromnej roli i wyj\u0105tkowego kontraktu.`;
  }
  if (band === "STRETCH") {
    return `M\xF3j klient najch\u0119tniej rozmawia z klubami o reputacji ${expectation.preferredMinReputation}+. Wasz klub jest mo\u017Cliwym, ale mniej naturalnym kierunkiem.`;
  }
  return "";
};
var getYouthTalentDiscoveryChance = (assessment) => {
  const clubFactor = clamp5(0.45 + assessment.clubReputation / 20, 0.45, 1.15);
  const baseChance = assessment.effectivePrestige >= 90 ? 4e-3 : assessment.effectivePrestige >= 85 ? 0.012 : assessment.effectivePrestige >= 80 ? 0.022 : assessment.effectivePrestige >= 76 ? 0.035 : 0.05;
  return clamp5(baseChance * clubFactor, 15e-4, 0.055);
};
var applyYouthTalentDiscoveryException = (assessment, player) => {
  if (player.age < YOUTH_TALENT_EXCEPTION_MIN_AGE || player.age > YOUTH_TALENT_EXCEPTION_MAX_AGE || assessment.effectivePrestige < YOUTH_TALENT_EXCEPTION_MIN_PRESTIGE || assessment.band === "NATURAL") {
    return assessment;
  }
  const youthChance = getYouthTalentDiscoveryChance(assessment);
  return {
    ...assessment,
    band: assessment.band === "BLOCKED" ? "EXTREME" : assessment.band,
    chanceCap: Math.max(assessment.chanceCap, youthChance),
    salaryPremium: Math.min(Math.max(assessment.salaryPremium, 0.08), 0.22),
    bonusPremium: Math.min(Math.max(assessment.bonusPremium, 0.16), 0.35),
    scorePenalty: Math.min(assessment.scorePenalty, assessment.effectivePrestige >= 85 ? 26 : 18),
    blocksNegotiation: false,
    reason: "M\xF3j klient jest bardzo m\u0142ody, wi\u0119c taki ruch m\xF3g\u0142by mie\u0107 sens jako wyj\u0105tkowy projekt rozwojowy po wcze\u015Bniejszym wy\u0142owieniu talentu. To nadal rzadki scenariusz i klub musi zagwarantowa\u0107 jasn\u0105 \u015Bcie\u017Ck\u0119 gry."
  };
};
var applyGulfException = (assessment, player, targetClub) => {
  if (!PrestigeTransferGuardService.isGulfExceptionClub(targetClub) || assessment.band === "NATURAL") {
    return assessment;
  }
  if (player.age >= 35) {
    return {
      ...assessment,
      band: assessment.band === "BLOCKED" ? "LONG_SHOT" : assessment.band,
      chanceCap: Math.max(assessment.chanceCap, 0.72),
      salaryPremium: Math.max(assessment.salaryPremium, 0.2),
      bonusPremium: Math.max(assessment.bonusPremium, 0.35),
      scorePenalty: Math.max(0, assessment.scorePenalty - 18),
      blocksNegotiation: false,
      reason: "M\xF3j klient mo\u017Ce potraktowa\u0107 ten kierunek jako emerytalny mega-kontrakt, ale oferta musi jasno rekompensowa\u0107 ni\u017Cszy presti\u017C sportowy."
    };
  }
  if (player.age >= 30) {
    return {
      ...assessment,
      band: assessment.band === "BLOCKED" ? "EXTREME" : assessment.band,
      chanceCap: Math.max(assessment.chanceCap, assessment.effectivePrestige >= 90 ? 0.035 : 0.08),
      salaryPremium: Math.max(assessment.salaryPremium, 0.38),
      bonusPremium: Math.max(assessment.bonusPremium, 0.75),
      scorePenalty: Math.max(assessment.scorePenalty, 24),
      blocksNegotiation: false,
      reason: "M\xF3j klient jest jeszcze przed ko\u0144c\xF3wk\u0105 kariery, wi\u0119c taki kierunek jest rzadki. Realny by\u0142by tylko przy bardzo bogatym, wyj\u0105tkowo przekonuj\u0105cym kontrakcie."
    };
  }
  return {
    ...assessment,
    band: assessment.band === "BLOCKED" ? "EXTREME" : assessment.band,
    chanceCap: Math.max(assessment.chanceCap, assessment.effectivePrestige >= 90 ? 6e-3 : 0.018),
    salaryPremium: Math.max(assessment.salaryPremium, 0.55),
    bonusPremium: Math.max(assessment.bonusPremium, 1),
    scorePenalty: Math.max(assessment.scorePenalty, 34),
    blocksNegotiation: false,
    reason: "Bogaty klub z regionu mo\u017Ce czasem skusi\u0107 m\u0142odszego zawodnika, ale to wyj\u0105tkowo rzadki scenariusz i wymaga\u0142by finansowej oferty poza normalnym rynkiem."
  };
};
var getChanceWithManagerInfluence = (assessment, managerChanceAdjustment = 0) => {
  if (assessment.blocksNegotiation) return 0;
  if (assessment.band === "NATURAL") return 1;
  const positiveInfluence = Math.max(0, managerChanceAdjustment);
  const boost = assessment.band === "STRETCH" ? positiveInfluence * 0.45 : assessment.band === "LONG_SHOT" ? positiveInfluence * 0.12 : positiveInfluence * 0.03;
  return clamp5(assessment.chanceCap + boost, 0, assessment.band === "STRETCH" ? 0.65 : assessment.chanceCap + 0.015);
};
var PrestigeTransferGuardService = {
  getPlayerPrestige: (player) => PlayerPrestigeService.getTransferPrestige(player),
  isHighPrestigePlayer: (player) => PrestigeTransferGuardService.getPlayerPrestige(player) >= HIGH_PLAYER_PRESTIGE_THRESHOLD,
  isLowPrestigeDestination: (club) => getClubReputation(club) <= LOW_PRESTIGE_CLUB_REPUTATION_LIMIT,
  isGulfExceptionClub: (club) => GULF_EXCEPTION_COUNTRIES.has(club.country || "") && getClubReputation(club) >= 8,
  evaluateDestination: (player, targetClub) => {
    const effectivePrestige = PlayerPrestigeService.getTransferPrestige(player);
    const expectation = getExpectationForPrestige(effectivePrestige);
    const clubReputation = getClubReputation(targetClub);
    const band = getBandForClub(clubReputation, expectation);
    const chanceCap = band === "NATURAL" ? 1 : band === "STRETCH" ? expectation.stretchChance : band === "LONG_SHOT" ? expectation.longShotChance : band === "EXTREME" ? expectation.extremeChance : 0;
    const salaryPremium = band === "NATURAL" ? 0 : band === "STRETCH" ? 0.1 : band === "LONG_SHOT" ? 0.26 : band === "EXTREME" ? 0.46 : 0.7;
    const bonusPremium = band === "NATURAL" ? 0 : band === "STRETCH" ? 0.18 : band === "LONG_SHOT" ? 0.5 : band === "EXTREME" ? 0.9 : 1.25;
    const scorePenalty = band === "NATURAL" ? 0 : band === "STRETCH" ? 8 : band === "LONG_SHOT" ? 24 : band === "EXTREME" ? 38 : 55;
    const assessment = {
      band,
      clubReputation,
      effectivePrestige,
      preferredMinReputation: expectation.preferredMinReputation,
      acceptableMinReputation: expectation.acceptableMinReputation,
      longShotMinReputation: expectation.longShotMinReputation,
      chanceCap,
      salaryPremium,
      bonusPremium,
      scorePenalty,
      blocksNegotiation: band === "BLOCKED",
      reason: getReasonForBand(band, player, targetClub, expectation)
    };
    return applyGulfException(
      applyYouthTalentDiscoveryException(assessment, player),
      player,
      targetClub
    );
  },
  isAllowedDestinationForHighPrestigePlayer: (player, targetClub) => {
    return !PrestigeTransferGuardService.evaluateDestination(player, targetClub).blocksNegotiation;
  },
  shouldConsiderDestination: (player, targetClub, managerChanceAdjustment = 0, randomRoll) => {
    const assessment = PrestigeTransferGuardService.evaluateDestination(player, targetClub);
    const chance = getChanceWithManagerInfluence(assessment, managerChanceAdjustment);
    return (randomRoll ?? Math.random()) <= chance;
  },
  getAcceptanceChanceCap: (player, targetClub) => {
    const assessment = PrestigeTransferGuardService.evaluateDestination(player, targetClub);
    return assessment.blocksNegotiation ? 0 : assessment.chanceCap;
  },
  getBlockedReason: (player, targetClub) => {
    const assessment = PrestigeTransferGuardService.evaluateDestination(player, targetClub);
    return assessment.blocksNegotiation ? assessment.reason : null;
  },
  getRejectionReason: (player, targetClub) => {
    const assessment = PrestigeTransferGuardService.evaluateDestination(player, targetClub);
    return assessment.reason || "M\xF3j klient szuka projektu lepiej dopasowanego do jego aktualnego poziomu sportowego.";
  }
};

// services/TransferPlayerDecisionService.ts
var roundMoney = (value) => Math.max(5e4, Math.round(value / 5e3) * 5e3);
var clamp6 = (value, min, max) => Math.min(max, Math.max(min, value));
var stableUnit = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};
var TOP_MARKET_COUNTRIES = /* @__PURE__ */ new Set(["ENG", "FRA", "GER", "ESP", "POR"]);
var GLOBAL_ICON_POLAND_CHANCE_CAP = 1e-6;
var TOP_MARKET_REGIONS = /* @__PURE__ */ new Set([
  "ENGLAND" /* ENGLAND */,
  "FRANCE" /* FRANCE */,
  "GERMANY" /* GERMANY */,
  "SPAIN" /* SPAIN */,
  "IBERIA" /* IBERIA */
]);
var getScoutNegotiationPower = (scout) => {
  if (!scout) return 0;
  const reputation = (clamp6(Math.round(scout.reputation), 1, 5) - 1) / 4;
  const experience = (clamp6(scout.experience, 1, 20) - 1) / 19;
  const judgment = (clamp6(scout.judgment, 1, 20) - 1) / 19;
  return clamp6(reputation * 0.55 + experience * 0.3 + judgment * 0.15, 0, 1);
};
var getPolishLeagueTier = (club) => {
  if (club.leagueId === "L_PL_1") return 1;
  if (club.leagueId === "L_PL_2") return 2;
  if (club.leagueId === "L_PL_3") return 3;
  if (club.leagueId === "L_PL_4" || club.leagueId?.startsWith("L_PL_4_G")) return 4;
  return null;
};
var getPolishSportingUpgradeStrength = (currentClub, targetClub) => {
  const currentTier = getPolishLeagueTier(currentClub);
  const targetTier = getPolishLeagueTier(targetClub);
  if (currentTier === null || targetTier === null) return 0;
  const leagueStep = Math.max(0, currentTier - targetTier);
  const reputationStep = Math.max(0, targetClub.reputation - currentClub.reputation);
  if (leagueStep === 0 && reputationStep === 0) return 0;
  return leagueStep * 2 + reputationStep;
};
var getContextualPrestigeAssessment = (player, currentClub, targetClub) => {
  const assessment = PrestigeTransferGuardService.evaluateDestination(player, targetClub);
  if (!currentClub) return assessment;
  const upgradeStrength = getPolishSportingUpgradeStrength(currentClub, targetClub);
  if (upgradeStrength <= 0) return assessment;
  const chanceCap = clamp6(0.8 + upgradeStrength * 0.035, 0.8, 0.97);
  return {
    ...assessment,
    band: "NATURAL",
    chanceCap,
    salaryPremium: 0,
    bonusPremium: 0,
    scorePenalty: 0,
    blocksNegotiation: false,
    reason: "M\xF3j klient postrzega ten kierunek jako awans sportowy w ramach polskich rozgrywek i jest gotowy rozpocz\u0105\u0107 rozmowy."
  };
};
var getPolishClubPrestigeProgression = (club) => {
  const reputation = clamp6(club.reputation ?? 0, 0, 20);
  if (reputation >= 20) return { topPlayerMultiplier: 5, globalIconCap: 0.03 };
  if (reputation >= 19) return { topPlayerMultiplier: 3.5, globalIconCap: 0.01 };
  if (reputation >= 18) return { topPlayerMultiplier: 2.25, globalIconCap: 25e-4 };
  if (reputation >= 17) return { topPlayerMultiplier: 1.5, globalIconCap: 5e-4 };
  return { topPlayerMultiplier: 1, globalIconCap: GLOBAL_ICON_POLAND_CHANCE_CAP };
};
var isRenownedTopMarketMoveToPoland = (player, currentClub, targetClub) => {
  const tier = getPolishLeagueTier(targetClub);
  if (!tier) return false;
  const prestige = PrestigeTransferGuardService.evaluateDestination(player, targetClub).effectivePrestige;
  const comesFromTopMarket = currentClub ? TOP_MARKET_COUNTRIES.has(currentClub.country || "") : TOP_MARKET_REGIONS.has(player.nationality);
  return prestige >= 78 && comesFromTopMarket;
};
var getTopMarketPolandChanceCap = (player, currentClub, targetClub, scoutPower) => {
  const polishTier = getPolishLeagueTier(targetClub);
  if (!polishTier) return null;
  const prestigeProgression = getPolishClubPrestigeProgression(targetClub);
  if (PlayerPrestigeService.isGlobalIcon(player)) {
    return prestigeProgression.globalIconCap;
  }
  if (!isRenownedTopMarketMoveToPoland(player, currentClub, targetClub)) return null;
  const prestige = PrestigeTransferGuardService.evaluateDestination(player, targetClub).effectivePrestige;
  const prestigeBand = prestige >= 90 ? 3 : prestige >= 85 ? 2 : prestige >= 80 ? 1 : 0;
  const maximumCaps = {
    1: [0.12, 0.08, 0.045, 0.02],
    2: [0.055, 0.035, 0.018, 7e-3],
    3: [0.022, 0.014, 6e-3, 2e-3],
    4: [8e-3, 4e-3, 15e-4, 5e-4]
  };
  const eliteScoutCap = maximumCaps[polishTier][prestigeBand] * prestigeProgression.topPlayerMultiplier;
  const scoutFactor = 0.18 + Math.pow(scoutPower, 1.45) * 0.82;
  const availabilitySoftener = player.isOnTransferList || player.clubId === "FREE_AGENTS" ? 1.25 : 1;
  const veteranSoftener = player.age >= 33 ? 1.35 : player.age >= 30 ? 1.15 : 1;
  return clamp6(eliteScoutCap * scoutFactor * availabilitySoftener * veteranSoftener, 1e-4, eliteScoutCap * 1.45);
};
var getScoutTalkOpeningChance = (player, currentClub, targetClub, scout) => {
  const scoutPower = getScoutNegotiationPower(scout);
  if (scoutPower <= 0) return 0;
  const band = getContextualPrestigeAssessment(player, currentClub, targetClub).band;
  const eliteChance = band === "NATURAL" ? 0.45 : band === "STRETCH" ? 0.64 : band === "LONG_SHOT" ? 0.56 : band === "EXTREME" ? 0.46 : 0.36;
  const chance = 0.01 + (eliteChance - 0.01) * Math.pow(scoutPower, 1.65);
  const topMarketCap = getTopMarketPolandChanceCap(player, currentClub, targetClub, scoutPower);
  const talkCap = topMarketCap === GLOBAL_ICON_POLAND_CHANCE_CAP ? GLOBAL_ICON_POLAND_CHANCE_CAP : topMarketCap === null ? null : topMarketCap * 1.35;
  return talkCap === null ? chance : Math.min(chance, talkCap);
};
var getScoutAdjustedAcceptanceChanceCap = (player, currentClub, targetClub, scout) => {
  const assessment = getContextualPrestigeAssessment(player, currentClub, targetClub);
  const scoutPower = getScoutNegotiationPower(scout);
  const scoutLift = assessment.band === "NATURAL" ? 0 : assessment.band === "STRETCH" ? 0.36 * Math.pow(scoutPower, 1.45) : assessment.band === "LONG_SHOT" ? 0.42 * Math.pow(scoutPower, 1.45) : assessment.band === "EXTREME" ? 0.38 * Math.pow(scoutPower, 1.65) : 0.3 * Math.pow(scoutPower, 1.8);
  const generalCap = assessment.band === "BLOCKED" ? scoutLift : clamp6(assessment.chanceCap + scoutLift, 0, assessment.band === "STRETCH" ? 0.72 : 1);
  const topMarketCap = getTopMarketPolandChanceCap(player, currentClub, targetClub, scoutPower);
  return topMarketCap === null ? generalCap : Math.min(generalCap, topMarketCap);
};
var PRE_CONTRACT_PRIORITY_DAYS2 = 330;
var HIGH_OVERALL_EUROPEAN_TRANSFER_THRESHOLD = 76;
var EUROPEAN_PLAYER_REGIONS = /* @__PURE__ */ new Set([
  "POLAND" /* POLAND */,
  "BALKANS" /* BALKANS */,
  "CZ_SK" /* CZ_SK */,
  "IBERIA" /* IBERIA */,
  "SWEDEN" /* SWEDEN */,
  "SCANDINAVIA" /* SCANDINAVIA */,
  "EX_USSR" /* EX_USSR */,
  "SPAIN" /* SPAIN */,
  "ENGLAND" /* ENGLAND */,
  "GERMANY" /* GERMANY */,
  "ITALY" /* ITALY */,
  "FRANCE" /* FRANCE */,
  "TURKEY" /* TURKEY */,
  "FINLAND" /* FINLAND */,
  "GEORGIA" /* GEORGIA */,
  "ARMENIA" /* ARMENIA */,
  "ALBANIA" /* ALBANIA */,
  "ROMANIA" /* ROMANIA */,
  "BALTIC" /* BALTIC */,
  "BENELUX" /* BENELUX */,
  "HUNGARIAN" /* HUNGARIAN */,
  "MALTESE" /* MALTESE */,
  "ISRAELI" /* ISRAELI */,
  "GREEK" /* GREEK */,
  "AZERBAIJANI" /* AZERBAIJANI */,
  "KAZAKH" /* KAZAKH */
]);
var SOUTH_AMERICAN_COUNTRIES = /* @__PURE__ */ new Set(["ARG", "BRA", "URU", "COL", "ECU", "PAR", "CHI", "PER", "BOL"]);
var AFRICAN_COUNTRIES = /* @__PURE__ */ new Set(["EGY", "RSA", "MAR", "TUN", "ALG", "TZA", "COD"]);
var LOW_APPEAL_DESTINATION_COUNTRIES = /* @__PURE__ */ new Set([
  ...SOUTH_AMERICAN_COUNTRIES,
  ...AFRICAN_COUNTRIES,
  "CHN"
]);
var getReputationDrop = (currentClub, targetClub) => Math.max(0, currentClub.reputation - targetClub.reputation);
var getBaseMoveAcceptanceChance = (currentClub, targetClub) => {
  const reputationDrop = getReputationDrop(currentClub, targetClub);
  if (reputationDrop === 0) return 0.999;
  if (reputationDrop === 1) return 0.96;
  if (reputationDrop === 2) return 0.93;
  if (reputationDrop === 3) return 0.88;
  if (reputationDrop === 4) return 0.7;
  if (reputationDrop === 5) return 0.6;
  return clamp6(0.6 * Math.pow(0.82, reputationDrop - 5), 0.02, 0.6);
};
var getPlayerLoyalty = (player) => clamp6(Math.round(player.lojalnosc ?? 50), 1, 99);
var isLoyaltySoftenedForTransfer = (player) => !!player.isOnTransferList || !player.squadRole;
var isMajorReputationStepUp = (currentClub, targetClub) => targetClub.reputation >= currentClub.reputation + 5;
var isLowAppealDestinationForHighOverallEuropean = (player, targetClub) => player.overallRating >= HIGH_OVERALL_EUROPEAN_TRANSFER_THRESHOLD && EUROPEAN_PLAYER_REGIONS.has(player.nationality) && LOW_APPEAL_DESTINATION_COUNTRIES.has(targetClub.country || "");
var getLowAppealDestinationPenalty = (player, targetClub) => {
  if (!isLowAppealDestinationForHighOverallEuropean(player, targetClub)) return 0;
  if (player.overallRating >= 86) return 34;
  if (player.overallRating >= 82) return 26;
  if (player.overallRating >= 79) return 19;
  return 13;
};
var getLowAppealAcceptanceCap = (player, targetClub) => {
  if (!isLowAppealDestinationForHighOverallEuropean(player, targetClub)) return null;
  const veteranSoftener = player.age >= 33 ? 0.025 : player.age >= 30 ? 0.012 : 0;
  if (player.overallRating >= 86) return 6e-3 + veteranSoftener;
  if (player.overallRating >= 82) return 0.012 + veteranSoftener;
  if (player.overallRating >= 79) return 0.022 + veteranSoftener;
  return 0.04 + veteranSoftener;
};
var getLoyaltyResistance = (player, currentClub, targetClub) => {
  if (isLoyaltySoftenedForTransfer(player) || isMajorReputationStepUp(currentClub, targetClub) || getPolishSportingUpgradeStrength(currentClub, targetClub) > 0) {
    return 0;
  }
  return clamp6((getPlayerLoyalty(player) - 50) / 49, 0, 1);
};
var roleScore = (role) => {
  switch (role) {
    case "STAR":
      return 18;
    case "FIRST_TEAM":
      return 12;
    case "ROTATION":
      return 5;
    default:
      return -8;
  }
};
var roleLevel = (role) => {
  switch (role) {
    case "STAR":
      return 4;
    case "FIRST_TEAM":
      return 3;
    case "ROTATION":
      return 2;
    default:
      return 1;
  }
};
var contractScore = (years) => {
  if (years >= 4) return 8;
  if (years === 3) return 6;
  if (years === 2) return 4;
  return 1;
};
var getAgeFinancialWeights = (age) => {
  if (age <= 23) {
    return { salary: 0.38, bonus: 0.12, years: 0.25, total: 0.25 };
  }
  if (age <= 29) {
    return { salary: 0.32, bonus: 0.18, years: 0.2, total: 0.3 };
  }
  return { salary: 0.22, bonus: 0.28, years: 0.22, total: 0.28 };
};
var getAgeStayScore = (player) => {
  if (player.age < 26) return 0;
  const isEliteLatePrime = player.age >= 26 && player.overallRating >= 85;
  if (player.age <= 28) return isEliteLatePrime ? 0 : 3;
  if (player.age <= 31) return isEliteLatePrime ? 2 : 7;
  if (player.age <= 34) return isEliteLatePrime ? 7 : 12;
  return isEliteLatePrime ? 11 : 18;
};
var TransferPlayerDecisionService = {
  buildNegotiationPlan: (player, currentClub, targetClub, currentSquad, targetSquad, currentDate, managerProfile) => {
    const currentRole = TransferPlayerDecisionService.estimateRole(player, currentSquad);
    const targetRole = TransferPlayerDecisionService.estimateRole(player, targetSquad);
    const currentSalaryBase = Math.max(player.annualSalary, 1);
    const currentRoleLevel = roleLevel(currentRole);
    const targetRoleLevel = roleLevel(targetRole);
    const reputationDelta = targetClub.reputation - currentClub.reputation;
    const reputationDrop = getReputationDrop(currentClub, targetClub);
    const isForeignMove = !!currentClub.country && !!targetClub.country && currentClub.country !== targetClub.country;
    const isNotFirstTeamPlayer = currentRole === "ROTATION" || currentRole === "BACKUP";
    const hasMoveSoftener = !!player.isOnTransferList || isNotFirstTeamPlayer;
    const ageStayScore = getAgeStayScore(player);
    const ageMovePremium = ageStayScore / 100;
    const managerInfluence = ManagerNegotiationInfluenceService.calculate(managerProfile);
    const lowAppealDestination = isLowAppealDestinationForHighOverallEuropean(player, targetClub);
    const daysLeft = Math.floor(
      (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5
    );
    const loyaltyResistance = getLoyaltyResistance(player, currentClub, targetClub);
    const prestigeAssessment = getContextualPrestigeAssessment(player, currentClub, targetClub);
    if (prestigeAssessment.blocksNegotiation) {
      return {
        willingToTalk: false,
        reason: prestigeAssessment.reason,
        targetRole,
        desiredSalary: roundMoney(currentSalaryBase * 1.4),
        desiredBonus: roundMoney(currentSalaryBase),
        desiredYears: 2
      };
    }
    if (getPlayerLoyalty(player) >= 88 && loyaltyResistance >= 0.72 && daysLeft > PRE_CONTRACT_PRIORITY_DAYS2) {
      return {
        willingToTalk: false,
        reason: "Moj klient jest mocno zwiazany z obecnym klubem i nie traktuje tego transferu jako realnej mozliwosci. Rozmowy moglyby miec sens tylko przy jasnym sygnale ze strony klubu albo przy wyraznym awansie sportowym.",
        targetRole,
        desiredSalary: roundMoney(currentSalaryBase * 1.25),
        desiredBonus: roundMoney(currentSalaryBase * 0.75),
        desiredYears: 3
      };
    }
    let desiredYears = 3;
    if (player.age <= 22) desiredYears = 5;
    else if (player.age <= 27) desiredYears = 4;
    else if (player.age <= 30) desiredYears = 3;
    else if (player.age <= 34) desiredYears = 2;
    else desiredYears = 1;
    if (daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS2) {
      desiredYears = Math.max(2, desiredYears - 1);
    }
    let salaryMultiplier = 1.1;
    if (player.age <= 24 && reputationDelta >= 2) salaryMultiplier -= 0.08;
    if (player.age <= 24 && reputationDrop > 0) salaryMultiplier += Math.min(0.18, reputationDrop * 0.03);
    if (reputationDelta > 0) salaryMultiplier += 0.08;
    if (reputationDelta === 0 && isForeignMove) salaryMultiplier += 0.12;
    if (reputationDrop > 0) salaryMultiplier += Math.min(0.42, reputationDrop * 0.06);
    if (reputationDrop >= 4 && !hasMoveSoftener) salaryMultiplier += 0.1;
    if (lowAppealDestination) salaryMultiplier += player.overallRating >= 82 ? 0.34 : 0.24;
    if (player.isOnTransferList) salaryMultiplier -= 0.08;
    if (isNotFirstTeamPlayer) salaryMultiplier -= 0.06;
    if (targetRoleLevel > currentRoleLevel) salaryMultiplier -= 0.06;
    if (targetRoleLevel < currentRoleLevel) salaryMultiplier += 0.1;
    salaryMultiplier += loyaltyResistance * 0.14;
    salaryMultiplier += ageMovePremium * 0.45;
    salaryMultiplier += prestigeAssessment.salaryPremium;
    salaryMultiplier *= managerInfluence.expectationMultiplier;
    let bonusMultiplier = 0.35;
    if (player.age >= 24 && player.age <= 29) bonusMultiplier = 0.55;
    else if (player.age >= 30 && player.age <= 33) bonusMultiplier = 0.9;
    else if (player.age >= 34) bonusMultiplier = 1.2;
    if (reputationDrop > 0) bonusMultiplier += Math.min(0.45, reputationDrop * 0.07);
    else if (reputationDelta === 0 && isForeignMove) bonusMultiplier += 0.14;
    else if (reputationDelta === 0) bonusMultiplier += 0.08;
    if (lowAppealDestination) bonusMultiplier += player.overallRating >= 82 ? 0.42 : 0.3;
    bonusMultiplier += loyaltyResistance * 0.18;
    bonusMultiplier += ageMovePremium;
    bonusMultiplier += prestigeAssessment.bonusPremium;
    bonusMultiplier *= managerInfluence.expectationMultiplier;
    const desiredSalary = roundMoney(currentSalaryBase * salaryMultiplier);
    const desiredBonus = roundMoney(currentSalaryBase * bonusMultiplier);
    let negotiationReason = `Moj klient jest gotow rozmawiac. Oczekuje kontraktu na ${desiredYears} ${desiredYears === 1 ? "rok" : "lata"}.`;
    if (reputationDrop > 0) {
      negotiationReason = "Moj klient jest gotow rozmawiac, ale nizsza reputacja nowego klubu podnosi jego oczekiwania finansowe. Im wiekszy spadek reputacji, tym mocniejszy kontrakt bedzie potrzebny.";
    } else if (lowAppealDestination) {
      negotiationReason = "Moj klient traktuje ten kierunek jako malo atrakcyjny sportowo. Rozmowy maja sens tylko przy wyjatkowo mocnych warunkach i jasnej roli w projekcie.";
    } else if (reputationDelta === 0 && isForeignMove) {
      negotiationReason = "Moj klient jest zainteresowany tym kierunkiem. Przy klubie o podobnej reputacji oczekuje solidnych, ale realistycznych warunkow.";
    } else if (reputationDelta === 0) {
      negotiationReason = `Moj klient traktuje ten ruch jako sportowo porownywalny i oczekuje kontraktu na ${desiredYears} ${desiredYears === 1 ? "rok" : "lata"}.`;
    } else if (reputationDelta > 0) {
      negotiationReason = `M\xF3j klient jest zainteresowany przej\u015Bciem do Waszego klubu i oczekuje kontraktu na ${desiredYears} ${desiredYears === 1 ? "rok" : "lata"} i warunkow adekwatnych do tego kroku.`;
    }
    if (prestigeAssessment.reason) {
      negotiationReason = prestigeAssessment.reason;
    }
    return {
      willingToTalk: true,
      reason: negotiationReason,
      targetRole,
      desiredSalary,
      desiredBonus,
      desiredYears
    };
  },
  evaluateMove: (offer, player, currentClub, targetClub, currentSquad, targetSquad, currentDate, managerProfile, scoutInfluence) => {
    const negotiationPlan = TransferPlayerDecisionService.buildNegotiationPlan(
      player,
      currentClub,
      targetClub,
      currentSquad,
      targetSquad,
      currentDate,
      managerProfile
    );
    const scoutPower = getScoutNegotiationPower(scoutInfluence);
    const scoutPersuasionChance = getScoutTalkOpeningChance(player, currentClub, targetClub, scoutInfluence);
    const scoutPersuasionRoll = stableUnit(`${player.id}|${targetClub.id}|${currentDate.getFullYear()}|scout-persuasion`);
    const scoutOpenedTalks = !negotiationPlan.willingToTalk && scoutPersuasionRoll <= scoutPersuasionChance;
    if (!negotiationPlan.willingToTalk && !scoutOpenedTalks) {
      return {
        accepted: false,
        reason: negotiationPlan.reason,
        stayScore: 0,
        offerScore: 0,
        targetRole: negotiationPlan.targetRole
      };
    }
    const currentRole = TransferPlayerDecisionService.estimateRole(player, currentSquad);
    const currentSalaryBase = Math.max(player.annualSalary, 1);
    const reputationDelta = targetClub.reputation - currentClub.reputation;
    const reputationDrop = getReputationDrop(currentClub, targetClub);
    const isForeignMove = !!currentClub.country && !!targetClub.country && currentClub.country !== targetClub.country;
    const managerInfluence = ManagerNegotiationInfluenceService.calculate(managerProfile);
    const loyaltyResistance = getLoyaltyResistance(player, currentClub, targetClub);
    const lowAppealDestinationPenalty = getLowAppealDestinationPenalty(player, targetClub);
    const lowAppealAcceptanceCap = getLowAppealAcceptanceCap(player, targetClub);
    const prestigeAssessment = getContextualPrestigeAssessment(player, currentClub, targetClub);
    let effectiveDesiredSalary = negotiationPlan.desiredSalary;
    let transferListSalaryDiscountApplied = false;
    if (player.isOnTransferList && offer.salary < currentSalaryBase * 0.9) {
      const interestedCount = player.interestedClubs?.length ?? 0;
      let acceptChance;
      if (interestedCount === 0) acceptChance = 0.7;
      else if (interestedCount === 1) acceptChance = 0.5;
      else if (interestedCount <= 3) acceptChance = 0.3;
      else acceptChance = 0.1;
      if (Math.random() < acceptChance) {
        const discount = Math.random() * 0.2;
        effectiveDesiredSalary = Math.max(5e4, roundMoney(currentSalaryBase * (1 - discount)));
        transferListSalaryDiscountApplied = true;
      } else {
        return {
          accepted: false,
          reason: "Zawodnik oczekuje lepszych warunk\xF3w finansowych. Oferta jest zbyt niska wzgledem obecnej pensji.",
          stayScore: 0,
          offerScore: 0,
          targetRole: negotiationPlan.targetRole
        };
      }
    }
    const salaryFit = clamp6(offer.salary / Math.max(effectiveDesiredSalary, 1), 0, 1.3);
    const bonusFit = clamp6((offer.bonus ?? 0) / Math.max(negotiationPlan.desiredBonus, 1), 0, 1.35);
    const yearsFit = clamp6(offer.years / Math.max(negotiationPlan.desiredYears, 1), 0.5, 1.2);
    const financialWeights = getAgeFinancialWeights(player.age);
    const financialFit = salaryFit * financialWeights.salary + bonusFit * financialWeights.bonus + yearsFit * (financialWeights.years + financialWeights.total);
    let salaryScore = 0;
    if (salaryFit >= 1.12) salaryScore = 18;
    else if (salaryFit >= 1) salaryScore = 12;
    else if (salaryFit >= 0.92) salaryScore = 5;
    else salaryScore = -10;
    let bonusScore = 0;
    if (bonusFit >= 1.15) bonusScore = 12;
    else if (bonusFit >= 1) bonusScore = 8;
    else if (bonusFit >= 0.85) bonusScore = 3;
    else bonusScore = -6;
    let yearsScore = 0;
    if (yearsFit >= 1) yearsScore = 8;
    else if (yearsFit >= 0.85) yearsScore = 3;
    else yearsScore = -8;
    const daysLeft = Math.floor(
      (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5
    );
    const contractPressure = daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS2 ? 7 : 0;
    const contractBreakdownPressure = player.isNegotiationPermanentBlocked && daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS2 ? 24 : 0;
    const transferListPressure = player.isOnTransferList ? 10 : 0;
    const loyaltyStayBonus = Math.round(loyaltyResistance * 24);
    const reputationScore = reputationDelta > 0 ? Math.min(22, reputationDelta * 7) : 0;
    const foreignBonus = reputationDelta === 0 && isForeignMove ? 6 : 0;
    const estimatedMarketSalary = 5e4 + player.overallRating * 8e3;
    const salaryOverMarket = currentSalaryBase / Math.max(estimatedMarketSalary, 1);
    const salarySatisfactionBonus = salaryOverMarket >= 1.4 ? 10 : salaryOverMarket >= 1.2 ? 5 : 0;
    const roleUpgradeBonus = currentRole === "BACKUP" && roleLevel(negotiationPlan.targetRole) >= 3 ? 12 : currentRole === "ROTATION" && roleLevel(negotiationPlan.targetRole) >= 4 ? 8 : 0;
    const ageStayScore = getAgeStayScore(player);
    const stayScore = currentClub.reputation * 7 + roleScore(currentRole) + ageStayScore + loyaltyStayBonus + Math.min(16, Math.round(currentSalaryBase / 11e4)) + salarySatisfactionBonus - contractPressure - contractBreakdownPressure - transferListPressure;
    const offerScore = targetClub.reputation * 7 + roleScore(negotiationPlan.targetRole) + salaryScore + bonusScore + yearsScore + contractScore(offer.years) + reputationScore + foreignBonus + roleUpgradeBonus + managerInfluence.scoreAdjustment + Math.round((financialFit - 1) * 35) - lowAppealDestinationPenalty - prestigeAssessment.scorePenalty;
    const margin = offerScore - stayScore;
    const requiredFinancialFit = player.age >= 30 ? 0.98 : 0.92;
    const lowerClubMoveWithoutPremium = reputationDrop >= 4 && financialFit < 0.98 && !transferListSalaryDiscountApplied;
    const flatForeignMoveWithoutUpgrade = reputationDelta === 0 && isForeignMove && financialFit < 0.96;
    const lowAppealMoveWithoutExceptionalPremium = lowAppealDestinationPenalty > 0 && financialFit < 1.12;
    const prestigeMoveWithoutExceptionalPremium = prestigeAssessment.scorePenalty >= 24 && financialFit < 1.18;
    const allowedNegativeMargin = reputationDrop === 0 ? -8 : reputationDrop <= 5 ? -35 : -24;
    if (financialFit < requiredFinancialFit || lowerClubMoveWithoutPremium || flatForeignMoveWithoutUpgrade || lowAppealMoveWithoutExceptionalPremium || prestigeMoveWithoutExceptionalPremium || margin < allowedNegativeMargin) {
      let reason = "Zawodnik uznal, ze warunki kontraktu i projekt sportowy nie sa dla niego wystarczajaco korzystne.";
      if (prestigeMoveWithoutExceptionalPremium) {
        reason = "Presti\u017C klubu jest wyra\u017Anie poni\u017Cej naturalnych oczekiwa\u0144 zawodnika. Przy takim ruchu potrzebny by\u0142by wyj\u0105tkowo mocny kontrakt i bardzo jasna rola w projekcie.";
      } else if (lowAppealMoveWithoutExceptionalPremium) {
        reason = "Zawodnik nie traktuje tego kierunku jako atrakcyjnego sportowo. Przy takim profilu kariery potrzebowalby wyjatkowej premii finansowej i bardzo mocnej roli.";
      } else if (lowerClubMoveWithoutPremium) {
        reason = "Przy tak duzym spadku reputacji zawodnik oczekuje mocniejszej rekompensaty finansowej i stabilnego kontraktu.";
      } else if (player.age >= 30 && yearsFit < 1) {
        reason = "Na tym etapie kariery zawodnik oczekuje mocniejszego zabezpieczenia gwarantowanego okresu kontraktu.";
      } else if (bonusFit < 0.9 && player.age >= 29) {
        reason = "Dla starszego zawodnika bonus za podpis jest zbyt niski wzgledem ryzyka zmiany klubu.";
      } else if (salaryFit < 0.95) {
        reason = "Roczna pensja jest zbyt daleka od finansowych oczekiwan zawodnika.";
      }
      return {
        accepted: false,
        reason,
        stayScore,
        offerScore,
        targetRole: negotiationPlan.targetRole
      };
    }
    const roleChanceAdjustment = clamp6((roleLevel(negotiationPlan.targetRole) - roleLevel(currentRole)) * 0.05, -0.12, 0.12);
    const financialChanceAdjustment = clamp6((financialFit - 1) * 0.25, -0.22, 0.16);
    const situationChanceAdjustment = (player.isOnTransferList ? 0.08 : 0) + (contractPressure > 0 ? 0.04 : 0) + (contractBreakdownPressure > 0 ? 0.12 : 0) - loyaltyResistance * 0.34;
    const rawAcceptanceChance = clamp6(
      getBaseMoveAcceptanceChance(currentClub, targetClub) + roleChanceAdjustment + financialChanceAdjustment + situationChanceAdjustment + managerInfluence.chanceAdjustment + scoutPower * 0.18,
      0.01,
      0.999
    );
    const prestigeAcceptanceCap = getScoutAdjustedAcceptanceChanceCap(player, currentClub, targetClub, scoutInfluence);
    const finalAcceptanceChance = Math.min(
      rawAcceptanceChance,
      lowAppealAcceptanceCap ?? rawAcceptanceChance,
      prestigeAcceptanceCap
    );
    if (Math.random() > finalAcceptanceChance) {
      const reason = prestigeAssessment.scorePenalty > 0 ? PrestigeTransferGuardService.getRejectionReason(player, targetClub) : lowAppealDestinationPenalty > 0 ? "Zawodnik po analizie odrzucil kierunek transferu. Przy jego poziomie sportowym liga docelowa nie jest dla niego wystarczajaco atrakcyjna poza wyjatkowymi okolicznosciami." : loyaltyResistance >= 0.45 ? "Zawodnik docenia oferte, ale jego przywiazanie do obecnego klubu przewazylo. Bez statusu zawodnika przeznaczonego do odejscia lub bardzo duzego kroku sportowego nie chce zmieniac klubu." : reputationDrop > 0 ? "Zawodnik byl gotow rozmawiac, ale po analizie uznal, ze spadek reputacji klubu jest dla niego zbyt duzym ryzykiem sportowym przy tej ofercie." : "Zawodnik byl blisko akceptacji, ale po namysle uznal, ze pozostanie w obecnym klubie jest dla niego minimalnie lepszym wyborem.";
      return {
        accepted: false,
        reason,
        stayScore,
        offerScore,
        targetRole: negotiationPlan.targetRole
      };
    }
    return {
      accepted: true,
      reason: scoutOpenedTalks ? `Skaut o reputacji ${scoutInfluence?.reputation ?? 1}/5 i do\u015Bwiadczeniu ${Math.round(scoutInfluence?.experience ?? 1)}/20 przekona\u0142 zawodnika do podj\u0119cia rozm\xF3w, a przedstawiona oferta spe\u0142ni\u0142a jego oczekiwania.` : `Zawodnik zaakceptowal warunki. Oferta spelnia jego oczekiwania finansowe i daje realna perspektywe roli ${negotiationPlan.targetRole.toLowerCase()}.`,
      stayScore,
      offerScore,
      targetRole: negotiationPlan.targetRole
    };
  },
  estimateRole: (player, squad) => {
    const samePosition = squad.filter((p) => p.position === player.position && p.id !== player.id).sort((a, b) => b.overallRating - a.overallRating);
    const betterPlayers = samePosition.filter((p) => p.overallRating > player.overallRating).length;
    if (betterPlayers === 0) return "STAR";
    if (betterPlayers <= 1) return "FIRST_TEAM";
    if (betterPlayers <= 3) return "ROTATION";
    return "BACKUP";
  }
};

// services/FreeAgentNegotiationService.tsx
var clamp7 = (value, min, max) => Math.max(min, Math.min(max, value));
var stableUnit2 = (key, salt) => {
  const source = `${key}|${salt}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash += hash << 13;
  hash ^= hash >>> 7;
  hash += hash << 3;
  hash ^= hash >>> 17;
  hash += hash << 5;
  return (hash >>> 0) / 4294967296;
};
var getPersonalityAcceptanceModifier = (player, club) => {
  const personality = player.moralePersonality;
  if (personality === "LOYAL") return 0.03;
  if (personality === "PROFESSIONAL") return 0.02;
  if (personality === "CALM") return 0.01;
  if (personality === "EGOIST") return -0.04;
  if (personality === "CONFIDENT") return -0.01;
  if (personality === "AMBITIOUS") {
    const playerReputation = player.reputacja ?? clamp7(Math.round((player.overallRating - 38) / 3), 1, 20);
    return (club?.reputation ?? playerReputation) >= playerReputation ? 0.01 : -0.04;
  }
  return 0;
};
var median = (values) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};
var roundAnnualMoney = (value) => Math.max(2e4, Math.round(value / 1e4) * 1e4);
var roundSigningMoney = (value) => Math.max(0, Math.round(value / 1e4) * 1e4);
var roundPerformanceMoney = (value) => {
  const step = value >= 1e5 ? 5e3 : value >= 2e4 ? 1e3 : 500;
  return Math.max(500, Math.round(value / step) * step);
};
var getFallbackLeagueFactor = (club) => {
  const tier = FinanceService.getClubTier(club);
  const reputation = clamp7(club.reputation || 1, 1, 20);
  if (tier <= 1) return clamp7(0.68 + reputation * 0.035, 0.72, 1.38);
  if (tier === 2) return clamp7(0.42 + reputation * 0.028, 0.48, 0.88);
  if (tier === 3) return clamp7(0.28 + reputation * 0.022, 0.32, 0.68);
  return clamp7(0.2 + reputation * 0.017, 0.24, 0.52);
};
var getAgeSalaryMultiplier = (age) => {
  if (age <= 18) return 0.7;
  if (age <= 21) return 0.82;
  if (age <= 24) return 0.93;
  if (age <= 29) return 1;
  if (age <= 32) return 0.96;
  if (age <= 35) return 0.86;
  return 0.72;
};
var getPersonalitySalaryMultiplier = (player) => {
  if (player.moralePersonality === "EGOIST") return 1.1;
  if (player.moralePersonality === "AMBITIOUS") return 1.06;
  if (player.moralePersonality === "CONFIDENT") return 1.03;
  if (player.moralePersonality === "LOYAL") return 0.95;
  if (player.moralePersonality === "PROFESSIONAL") return 0.98;
  if (player.moralePersonality === "CALM") return 0.97;
  return 1;
};
var getPositionGuaranteeMultiplier = (position) => {
  if (position === "DEF" /* DEF */) return 1.1;
  if (position === "GK" /* GK */) return 1.03;
  if (position === "MID" /* MID */) return 1.02;
  return 1;
};
var normalizeCountryKey = (country) => (country ?? "").trim().toLocaleLowerCase("pl-PL").normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]/g, "");
var playerCountryKey = (player) => normalizeCountryKey(player.nationalityCountry) || player.nationality.toLocaleLowerCase("pl-PL");
var DISTANT_ORIGIN_REGIONS = /* @__PURE__ */ new Set([
  "SSA",
  "NORTH_AMERICA",
  "MEXICO",
  "OCEANIA",
  "JAPAN",
  "KOREA",
  "ARGENTINA",
  "BRAZIL",
  "ARABIA",
  "SOUTH_AMERICAN"
]);
var getRelocationIntensity = (player, club) => {
  const playerCountry = normalizeCountryKey(player.nationalityCountry);
  const clubCountry = normalizeCountryKey(club.country);
  if (playerCountry && clubCountry && playerCountry === clubCountry) return 0;
  if (!playerCountry || !clubCountry) return 0.025;
  return DISTANT_ORIGIN_REGIONS.has(player.nationality) ? 0.09 : 0.05;
};
var getDemandRngProfile = (player, club, seedKey) => {
  const relocationIntensity = getRelocationIntensity(player, club);
  const ageVolatility = player.age <= 21 ? 0.075 : player.age <= 24 ? 0.045 : player.age <= 30 ? 0.02 : player.age <= 34 ? 0.045 : 0.075;
  const overallVolatility = player.overallRating >= 82 ? 0.08 : player.overallRating >= 72 ? 0.055 : player.overallRating >= 62 ? 0.03 : 0.045;
  const profileSeedKey = [
    seedKey,
    `wiek:${player.age}`,
    `kraj:${playerCountryKey(player)}`,
    `region:${player.nationality}`,
    `ovr:${Math.round(player.overallRating)}`
  ].join("|");
  const relocationSalaryPremium = relocationIntensity > 0 ? relocationIntensity * (0.45 + stableUnit2(profileSeedKey, "relocation-premium") * 0.75) : (stableUnit2(profileSeedKey, "domestic-preference") - 0.5) * 0.02;
  const eliteLeverage = clamp7((player.overallRating - 68) / 140, 0, 0.13);
  const ageLeverage = player.age <= 21 ? 8e-3 : player.age >= 35 ? 4e-3 : 0;
  return {
    seedKey: profileSeedKey,
    normalVolatility: clamp7(0.09 + ageVolatility + overallVolatility + relocationIntensity * 0.7, 0.14, 0.31),
    relocationIntensity,
    salaryCenter: 1 + relocationSalaryPremium,
    toughChance: clamp7(0.03 + eliteLeverage * 0.28 + relocationIntensity * 0.24 + ageLeverage, 0.03, 0.085),
    veryHighChance: clamp7(9e-3 + eliteLeverage * 0.075 + relocationIntensity * 0.055, 9e-3, 0.026),
    extremeChance: clamp7(1e-3 + eliteLeverage * 0.012 + relocationIntensity * 0.01, 1e-3, 45e-4)
  };
};
var getPreferredContractYears = (player, club, profile) => {
  const { seedKey } = profile;
  const roll = stableUnit2(seedKey, "contract-years");
  let years;
  if (player.age <= 18) years = roll < 0.65 ? 5 : 4;
  else if (player.age <= 21) years = roll < 0.55 ? 4 : roll < 0.88 ? 5 : 3;
  else if (player.age <= 24) years = roll < 0.55 ? 4 : 3;
  else if (player.age <= 29) years = roll < 0.68 ? 3 : 4;
  else if (player.age <= 32) years = roll < 0.58 ? 3 : 2;
  else if (player.age <= 35) years = roll < 0.72 ? 2 : 1;
  else years = roll < 0.15 ? 2 : 1;
  const playerReputation = player.reputacja ?? clamp7(Math.round((player.overallRating - 38) / 3), 1, 20);
  if (player.age <= 30 && playerReputation - club.reputation >= 5) years = Math.max(1, years - 1);
  if (player.age <= 32 && profile.relocationIntensity >= 0.05 && stableUnit2(seedKey, "relocation-security") < 0.32) {
    years = Math.min(5, years + 1);
  }
  return years;
};
var getDemandRng = (profile) => {
  const { seedKey } = profile;
  const bandRoll = stableUnit2(seedKey, "demand-band");
  const valueRoll = stableUnit2(seedKey, "demand-value");
  const extremeLimit = profile.extremeChance;
  const veryHighLimit = extremeLimit + profile.veryHighChance;
  const toughLimit = veryHighLimit + profile.toughChance;
  if (bandRoll < extremeLimit) {
    return { band: "EXTREME", multiplier: 2 + valueRoll * (1 + profile.relocationIntensity) };
  }
  if (bandRoll < veryHighLimit) {
    return { band: "VERY_HIGH", multiplier: 1.45 + valueRoll * 0.38 + profile.relocationIntensity * 0.35 };
  }
  if (bandRoll < toughLimit) {
    return { band: "TOUGH", multiplier: 1.18 + valueRoll * 0.3 + profile.relocationIntensity * 0.25 };
  }
  const centeredVariation = (valueRoll - 0.5) * 2 * profile.normalVolatility;
  return {
    band: "NORMAL",
    multiplier: clamp7(profile.salaryCenter + centeredVariation, 0.7, 1.42)
  };
};
var getPerformanceBonusVariation = (profile, player, bonusType) => {
  const agePreference = player.age <= 23 ? 0.06 : player.age >= 34 ? -0.05 : 0;
  const overallPreference = clamp7((player.overallRating - 65) / 250, -0.04, 0.08);
  const spread = clamp7(0.18 + profile.normalVolatility * 0.45, 0.22, 0.32);
  return clamp7(
    1 + agePreference + overallPreference + (stableUnit2(profile.seedKey, `performance-${bonusType}`) - 0.5) * 2 * spread,
    0.68,
    1.38
  );
};
var getClubTier = (club) => {
  if (typeof club.tier === "number" && Number.isFinite(club.tier)) {
    return club.tier;
  }
  const parsedTier = Number((club.leagueId || "").split("_")[2]);
  return Number.isFinite(parsedTier) && parsedTier > 0 ? parsedTier : 4;
};
var getSquadAverageOverall = (squad) => squad.length > 0 ? squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length : 0;
var getSquadTopOverall = (squad) => squad.length > 0 ? squad.reduce((best, player) => Math.max(best, player.overallRating), 0) : 0;
var getRealisticClubCeiling = (club, player, squad) => {
  const tier = getClubTier(club);
  const samePosition = squad.filter((squadPlayer) => squadPlayer.position === player.position).sort((a, b) => b.overallRating - a.overallRating);
  const squadAverage = getSquadAverageOverall(squad);
  const squadTop = getSquadTopOverall(squad);
  const bestSamePosition = samePosition[0]?.overallRating ?? 0;
  const fallbackSquadBase = 41 + club.reputation * 2.6 - (tier - 1) * 4.2;
  const stadiumBoost = clamp7((Math.log10(Math.max(club.stadiumCapacity, 1e3)) - 3) * 4.2, 0, 6.5);
  const prestigeCeiling = 44 + club.reputation * 2.15 + stadiumBoost - (tier - 1) * 5.6;
  const squadCeiling = Math.max(
    squadAverage > 0 ? squadAverage + 8 : fallbackSquadBase,
    bestSamePosition > 0 ? bestSamePosition + 4 : fallbackSquadBase,
    squadTop > 0 ? squadTop + 1 : fallbackSquadBase
  );
  let realisticCeiling = Math.max(prestigeCeiling, squadCeiling);
  if (tier === 1) realisticCeiling += 1.5;
  if (club.reputation >= 9) realisticCeiling += 1.5;
  if (player.age >= 30) realisticCeiling += 2;
  if (player.age >= 33) realisticCeiling += 2;
  if (player.age >= 36) realisticCeiling += 2;
  return realisticCeiling;
};
var FreeAgentNegotiationService = {
  /** Public deterministic roll helper used by save-compatible negotiation gates. */
  getStableDecisionRoll: (key, salt) => stableUnit2(key, salt),
  getClubLockoutUntil: (player, clubId, currentDate) => {
    if (!clubId) return null;
    const lockoutUntil = player.freeAgentClubLockouts?.[clubId];
    if (!lockoutUntil) return null;
    const today = new Date(currentDate).setHours(0, 0, 0, 0);
    const lockoutDate = new Date(lockoutUntil).setHours(0, 0, 0, 0);
    return today < lockoutDate ? lockoutUntil : null;
  },
  isClubLockedOut: (player, clubId, currentDate) => {
    return !!FreeAgentNegotiationService.getClubLockoutUntil(player, clubId, currentDate);
  },
  buildClubLockouts: (currentLockouts, clubId, lockoutUntil) => {
    return {
      ...currentLockouts || {},
      [clubId]: lockoutUntil
    };
  },
  evaluateInitialInterest: (player, club, squad = [], managerProfile) => {
    const tier = getClubTier(club);
    const managerInfluence = ManagerNegotiationInfluenceService.calculate(managerProfile);
    const prestigeAssessment = PrestigeTransferGuardService.evaluateDestination(player, club);
    if (prestigeAssessment.blocksNegotiation || !PrestigeTransferGuardService.shouldConsiderDestination(player, club, managerInfluence.chanceAdjustment)) {
      return {
        interested: false,
        message: PrestigeTransferGuardService.getRejectionReason(player, club)
      };
    }
    if (player.overallRating > 69 && club.reputation < 5) {
      const reputationGateChance = clamp7(0.01 + Math.max(0, managerInfluence.chanceAdjustment) * 0.5, 0.01, 0.04);
      if (Math.random() > reputationGateChance) {
        return {
          interested: false,
          message: "Moj klient nie jest zainteresowany gra na tym poziomie rozgrywkowym. Szukamy klubu o wiekszej renomie."
        };
      }
    }
    const realisticCeiling = getRealisticClubCeiling(club, player, squad) + managerInfluence.realisticCeilingBonus;
    const excessOverCeiling = player.overallRating - realisticCeiling;
    if (tier >= 2 && player.overallRating >= 82 && player.age <= 32 && excessOverCeiling >= 4) {
      return {
        interested: false,
        message: "Moj klient uwaza, ze ten ruch bylby zbyt duzym krokiem w dol pod wzgledem poziomu ligi i projektu sportowego."
      };
    }
    if (excessOverCeiling >= 9 && player.age <= 32) {
      return {
        interested: false,
        message: "Moj klient szuka projektu sportowego blizszego jego obecnym ambicjom. Na ten moment roznica poziomu jest zbyt duza."
      };
    }
    if (excessOverCeiling > 0) {
      const chance = clamp7(
        0.72 - excessOverCeiling * 0.1 + (tier === 1 ? 0.08 : 0) + (club.reputation >= 8 ? 0.05 : 0) + (player.age >= 33 ? 0.12 : player.age >= 30 ? 0.06 : 0) - (tier >= 3 ? 0.1 : 0) + managerInfluence.chanceAdjustment,
        0.01,
        0.7
      );
      if (Math.random() > chance) {
        return {
          interested: false,
          message: player.age >= 33 ? "Moj klient rozwazy jeszcze podobne kierunki, ale oczekuje klubu z mocniejszym argumentem sportowym." : "Moj klient celuje w klub, w ktorym poziom ligi i jakosc kadry beda blizsze jego aktualnej klasie."
        };
      }
    }
    const isPolishClub2 = club.leagueId?.startsWith("L_PL_");
    if (isPolishClub2 && player.overallRating > 82) {
      const chance = clamp7(
        0.5 - (player.overallRating - 83) * (0.49 / 16) + managerInfluence.chanceAdjustment * 0.5,
        0.01,
        0.55
      );
      if (Math.random() > chance) {
        return {
          interested: false,
          message: "Moj klient rozwaza wylacznie oferty z silniejszych lig. Poziom rozgrywkowy jest dla niego niewystarczajacy."
        };
      }
    }
    return { interested: true, message: "" };
  },
  calculateContractDemands: (player, club, squad, leaguePlayers, currentDate, managerProfile) => {
    const seedKey = `${player.id}|${club.id}|${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
    const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
    const fallbackMarketSalary = fairSalary * getFallbackLeagueFactor(club);
    const normalizeComparableSalary = (comparable) => {
      const comparableFairSalary = FinanceService.getFairMarketSalary(comparable.overallRating);
      const overallCorrection = comparableFairSalary > 0 ? Math.pow(fairSalary / comparableFairSalary, 0.72) : 1;
      return comparable.annualSalary * overallCorrection;
    };
    const exactComparables = leaguePlayers.filter(
      (comparable) => comparable.id !== player.id && comparable.annualSalary > 0 && comparable.position === player.position && Math.abs(comparable.overallRating - player.overallRating) <= 4 && Math.abs(comparable.age - player.age) <= 6
    );
    const widerComparables = exactComparables.length >= 5 ? exactComparables : leaguePlayers.filter(
      (comparable) => comparable.id !== player.id && comparable.annualSalary > 0 && comparable.position === player.position && Math.abs(comparable.overallRating - player.overallRating) <= 7
    );
    const comparablePool = widerComparables.length >= 4 ? widerComparables : leaguePlayers.filter(
      (comparable) => comparable.id !== player.id && comparable.annualSalary > 0 && comparable.position === player.position
    );
    const normalizedComparableMedian = median(comparablePool.map(normalizeComparableSalary));
    const squadPositionMedian = median(
      squad.filter((squadPlayer) => squadPlayer.annualSalary > 0 && squadPlayer.position === player.position).map((squadPlayer) => normalizeComparableSalary(squadPlayer))
    );
    let marketSalary = fallbackMarketSalary;
    if (normalizedComparableMedian > 0) {
      marketSalary = normalizedComparableMedian * 0.78 + fallbackMarketSalary * 0.22;
    }
    if (squadPositionMedian > 0) {
      marketSalary = marketSalary * 0.88 + squadPositionMedian * 0.12;
    }
    marketSalary = clamp7(marketSalary, fallbackMarketSalary * 0.55, fallbackMarketSalary * 1.8);
    const playerReputation = player.reputacja ?? clamp7(Math.round((player.overallRating - 38) / 3), 1, 20);
    const reputationMultiplier = clamp7(1 + (playerReputation - 10) * 0.025, 0.82, 1.3);
    const prestigeCompensation = clamp7(1 + Math.max(0, playerReputation - club.reputation) * 0.025, 1, 1.3);
    const demandRngProfile = getDemandRngProfile(player, club, seedKey);
    const demandRng = getDemandRng(demandRngProfile);
    const managerExpectationMultiplier = ManagerNegotiationInfluenceService.calculate(managerProfile).expectationMultiplier;
    const salaryBeforeRng = marketSalary * getAgeSalaryMultiplier(player.age) * reputationMultiplier * prestigeCompensation * getPositionGuaranteeMultiplier(player.position) * getPersonalitySalaryMultiplier(player) * managerExpectationMultiplier;
    const salary = roundAnnualMoney(salaryBeforeRng * demandRng.multiplier);
    const signingAgeRatio = player.age <= 22 ? 0.16 : player.age <= 29 ? 0.26 : player.age <= 33 ? 0.34 : 0.44;
    const signingReputationPremium = 1 + Math.max(0, playerReputation - 10) * 0.025;
    const signingVariation = 0.78 + stableUnit2(demandRngProfile.seedKey, "signing-bonus") * 0.44;
    const relocationSigningPremium = 1 + demandRngProfile.relocationIntensity * (0.4 + stableUnit2(demandRngProfile.seedKey, "signing-relocation") * 0.8);
    const bonus = roundSigningMoney(
      salary * signingAgeRatio * signingReputationPremium * signingVariation * relocationSigningPremium
    );
    const years = getPreferredContractYears(player, club, demandRngProfile);
    const finishingQuality = (player.attributes.finishing + player.attributes.attacking) / 2;
    const creativeQuality = (player.attributes.passing + player.attributes.vision) / 2;
    let goalBonus;
    let assistBonus;
    let cleanSheetBonus;
    if (player.position === "GK" /* GK */) {
      const goalkeeperQuality = (player.attributes.goalkeeping + player.attributes.positioning + player.attributes.technique) / 3;
      cleanSheetBonus = roundPerformanceMoney(
        salary * 32e-4 * clamp7(0.65 + goalkeeperQuality / 160, 0.75, 1.28) * getPerformanceBonusVariation(demandRngProfile, player, "clean-sheet")
      );
    } else if (player.position === "MID" /* MID */) {
      if (finishingQuality >= 62) {
        goalBonus = roundPerformanceMoney(
          salary * 38e-4 * clamp7(0.62 + finishingQuality / 170, 0.72, 1.24) * getPerformanceBonusVariation(demandRngProfile, player, "goal")
        );
      }
      if (creativeQuality >= 55) {
        assistBonus = roundPerformanceMoney(
          salary * 32e-4 * clamp7(0.65 + creativeQuality / 165, 0.74, 1.25) * getPerformanceBonusVariation(demandRngProfile, player, "assist")
        );
      }
    } else if (player.position === "FWD" /* FWD */) {
      goalBonus = roundPerformanceMoney(
        salary * 45e-4 * clamp7(0.65 + finishingQuality / 155, 0.78, 1.32) * getPerformanceBonusVariation(demandRngProfile, player, "goal")
      );
      if (creativeQuality >= 68) {
        assistBonus = roundPerformanceMoney(
          salary * 28e-4 * clamp7(0.65 + creativeQuality / 175, 0.74, 1.2) * getPerformanceBonusVariation(demandRngProfile, player, "assist")
        );
      }
    }
    return {
      salary,
      bonus,
      years,
      goalBonus,
      assistBonus,
      cleanSheetBonus,
      marketSalary: roundAnnualMoney(marketSalary),
      comparablePlayers: comparablePool.length,
      rngBand: demandRng.band
    };
  },
  evaluateOfferAgainstDemands: (player, offer, demands, decisionContext = {}) => {
    const salaryFit = offer.salary / Math.max(1, demands.salary);
    const expectedGuaranteedTotal = demands.salary * demands.years + demands.bonus;
    const offeredGuaranteedTotal = offer.salary * offer.years + offer.bonus;
    const guaranteedFit = offeredGuaranteedTotal / Math.max(1, expectedGuaranteedTotal);
    const expectedPerformanceTotal = (demands.goalBonus ?? 0) + (demands.assistBonus ?? 0) + (demands.cleanSheetBonus ?? 0);
    const offeredPerformanceTotal = (offer.goalBonus ?? 0) + (offer.assistBonus ?? 0) + (offer.cleanSheetBonus ?? 0);
    const performanceFit = expectedPerformanceTotal > 0 ? offeredPerformanceTotal / expectedPerformanceTotal : 1;
    const yearsGap = Math.abs(offer.years - demands.years);
    const yearsFit = yearsGap === 0 ? 1 : yearsGap === 1 ? 0.88 : 0.68;
    const performanceWeight = expectedPerformanceTotal > 0 ? 0.1 : 0;
    const yearsWeight = 0.12;
    const guaranteedWeight = 1 - performanceWeight - yearsWeight;
    const offerScore = clamp7(guaranteedFit, 0, 1.2) * guaranteedWeight + yearsFit * yearsWeight + clamp7(performanceFit, 0, 1.2) * performanceWeight;
    const counterDemands = {
      salary: demands.salary,
      bonus: demands.bonus,
      years: demands.years,
      goalBonus: demands.goalBonus,
      assistBonus: demands.assistBonus,
      cleanSheetBonus: demands.cleanSheetBonus
    };
    if (guaranteedFit < 0.45 || salaryFit < 0.35 && guaranteedFit < 0.95) {
      return {
        accepted: false,
        reason: "Oferta jest tak niska, \u017Ce m\xF3j klient nie widzi podstaw do dalszych rozm\xF3w.",
        demands: null,
        acceptanceChance: 0,
        decisionRoll: decisionContext.decisionRoll ?? 0
      };
    }
    if (offerScore >= 0.68 && salaryFit >= 0.35) {
      const curveChance = 1 / (1 + Math.exp(-14 * (offerScore - 0.86)));
      const exactTermsBonus = guaranteedFit >= 0.99 && yearsGap === 0 && performanceFit >= 0.9 ? 0.055 : 0;
      const managerModifier = ManagerNegotiationInfluenceService.calculate(
        decisionContext.managerProfile
      ).chanceAdjustment;
      const playerReputation = player.reputacja ?? clamp7(Math.round((player.overallRating - 38) / 3), 1, 20);
      const clubReputationModifier = decisionContext.club ? clamp7(((decisionContext.club.reputation ?? 1) - playerReputation) * 0.012, -0.12, 0.08) : 0;
      const personalityModifier = getPersonalityAcceptanceModifier(player, decisionContext.club);
      const scoutModifier = getScoutNegotiationPower(decisionContext.scout) * 0.06;
      const uncappedChance = clamp7(
        curveChance + exactTermsBonus + managerModifier + clubReputationModifier + personalityModifier + scoutModifier,
        0.01,
        0.99
      );
      const acceptanceChance = typeof decisionContext.acceptanceChanceCap === "number" ? Math.min(uncappedChance, clamp7(decisionContext.acceptanceChanceCap, 1e-6, 1)) : uncappedChance;
      const decisionRoll = clamp7(
        decisionContext.decisionRoll ?? stableUnit2(
          `${player.id}|${offer.salary}|${offer.bonus}|${offer.years}|${offer.goalBonus ?? 0}|${offer.assistBonus ?? 0}|${offer.cleanSheetBonus ?? 0}`,
          "fallback-final-offer"
        ),
        0,
        0.999999999
      );
      if (decisionRoll < acceptanceChance) {
        return {
          accepted: true,
          reason: "Zgadzamy si\u0119 na przedstawione warunki.",
          demands: null,
          acceptanceChance,
          decisionRoll
        };
      }
      const prestigeCapBlocked = typeof decisionContext.acceptanceChanceCap === "number" && acceptanceChance < uncappedChance && decisionRoll < uncappedChance;
      if (prestigeCapBlocked && decisionContext.club) {
        return {
          accepted: false,
          reason: PrestigeTransferGuardService.getRejectionReason(player, decisionContext.club),
          demands: null,
          acceptanceChance,
          decisionRoll
        };
      }
      return {
        accepted: false,
        reason: offerScore >= 0.96 ? "Warunki s\u0105 bardzo bliskie porozumienia, ale m\xF3j klient nie jest jeszcze gotowy ich zaakceptowa\u0107. Oczekujemy ostatniej poprawy oferty." : "Jeste\u015Bmy gotowi kontynuowa\u0107 rozmowy, ale oferta musi by\u0107 bli\u017Csza oczekiwaniom mojego klienta.",
        demands: counterDemands,
        acceptanceChance,
        decisionRoll
      };
    }
    return {
      accepted: false,
      reason: "Warunki s\u0105 zbyt dalekie od reali\xF3w kontraktowych mojego klienta.",
      demands: guaranteedFit >= 0.55 ? counterDemands : null,
      acceptanceChance: 0,
      decisionRoll: decisionContext.decisionRoll ?? 0
    };
  },
  createNegotiationEntry: (player, club, salary, bonus, years, currentDate, squad, goalBonus, assistBonus, cleanSheetBonus, agentDemands) => {
    const avgSalary = squad.length > 0 ? squad.reduce((sum, currentPlayer) => sum + currentPlayer.annualSalary, 0) / squad.length : 12e4;
    const fallbackExpectedSalary = player.overallRating * 2e3;
    const expectedGuaranteedTotal = agentDemands ? agentDemands.salary * agentDemands.years + agentDemands.bonus : fallbackExpectedSalary * years;
    const offeredGuaranteedTotal = salary * years + bonus;
    const rating = offeredGuaranteedTotal / Math.max(1, expectedGuaranteedTotal);
    let daysToWait = 2;
    if (rating < 0.5) daysToWait = 1;
    else if (rating < 0.9) daysToWait = 7 + Math.floor(Math.random() * 7);
    else daysToWait = 3 + Math.floor(Math.random() * 3);
    const responseDate = new Date(currentDate);
    responseDate.setDate(responseDate.getDate() + daysToWait);
    const negotiationId = `NEG_${Date.now()}_${player.id}`;
    const decisionSeed = `${negotiationId}|${club.id}|${salary}|${bonus}|${years}|${goalBonus ?? 0}|${assistBonus ?? 0}|${cleanSheetBonus ?? 0}`;
    return {
      id: negotiationId,
      playerId: player.id,
      clubId: club.id,
      salary,
      bonus,
      years,
      goalBonus,
      assistBonus,
      cleanSheetBonus,
      agentDemands,
      decisionSeed,
      decisionRoll: stableUnit2(decisionSeed, "final-player-decision"),
      responseDate: responseDate.toISOString(),
      status: "PENDING" /* PENDING */
    };
  }
};

// services/PlayerCareerService.ts
var PlayerCareerService = {
  emptyStats() {
    return {
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
  },
  resetClubStatsForNewEntry(player) {
    return {
      ...player,
      stats: this.emptyStats(),
      cupStats: this.emptyStats(),
      euroStats: this.emptyStats(),
      friendlyStats: this.emptyStats(),
      reserveStats: void 0
    };
  },
  buildStatsSnapshot(player) {
    const matchesPlayed = (player.stats?.matchesPlayed || 0) + (player.cupStats?.matchesPlayed || 0) + (player.euroStats?.matchesPlayed || 0);
    const ratingHistory = [
      ...player.stats?.ratingHistory || [],
      ...player.cupStats?.ratingHistory || [],
      ...player.euroStats?.ratingHistory || []
    ].slice(-(matchesPlayed || 0));
    const averageRating = matchesPlayed > 0 && ratingHistory.length > 0 ? parseFloat((ratingHistory.reduce((sum, rating) => sum + rating, 0) / ratingHistory.length).toFixed(1)) : null;
    return {
      matchesPlayed,
      goals: (player.stats?.goals || 0) + (player.cupStats?.goals || 0) + (player.euroStats?.goals || 0),
      assists: (player.stats?.assists || 0) + (player.cupStats?.assists || 0) + (player.euroStats?.assists || 0),
      yellowCards: (player.stats?.yellowCards || 0) + (player.cupStats?.yellowCards || 0) + (player.euroStats?.yellowCards || 0),
      redCards: (player.stats?.redCards || 0) + (player.cupStats?.redCards || 0) + (player.euroStats?.redCards || 0),
      averageRating
    };
  },
  buildLoanStatsSnapshot(player) {
    const loan = player.loan;
    const ratingHistory = player.stats?.ratingHistory || [];
    const baselineRatingCount = loan?.reportBaselineRatingCount ?? 0;
    const loanRatings = ratingHistory.slice(baselineRatingCount);
    const averageRating = loanRatings.length > 0 ? parseFloat((loanRatings.reduce((sum, rating) => sum + rating, 0) / loanRatings.length).toFixed(1)) : null;
    return {
      matchesPlayed: Math.max(0, (player.stats?.matchesPlayed || 0) - (loan?.reportBaselineMatches ?? 0)),
      goals: Math.max(0, (player.stats?.goals || 0) - (loan?.reportBaselineGoals ?? 0)),
      assists: Math.max(0, (player.stats?.assists || 0) - (loan?.reportBaselineAssists ?? 0)),
      yellowCards: Math.max(0, (player.stats?.yellowCards || 0) - (loan?.reportBaselineYellowCards ?? 0)),
      redCards: Math.max(0, (player.stats?.redCards || 0) - (loan?.reportBaselineRedCards ?? 0)),
      averageRating
    };
  },
  closeCurrentEntry(history, player, year, month) {
    if (history.length === 0) return [];
    const updatedHistory = [...history];
    const lastEntry = updatedHistory[updatedHistory.length - 1];
    updatedHistory[updatedHistory.length - 1] = {
      ...lastEntry,
      toYear: year,
      toMonth: month,
      statsSnapshot: lastEntry.statsSnapshot ?? this.buildStatsSnapshot(player)
    };
    return updatedHistory;
  },
  startNewEntry(history, target, year, month, transferFee) {
    return [
      ...history,
      {
        clubName: target.clubName,
        clubId: target.clubId,
        fromYear: year,
        fromMonth: month,
        toYear: null,
        toMonth: null,
        ...transferFee !== void 0 && { transferFee }
      }
    ];
  },
  startLoanEntry(history, loan, year, month, loanFee) {
    return [
      ...history,
      {
        clubName: loan.destinationClubName,
        clubId: loan.destinationClubId,
        fromYear: year,
        fromMonth: month,
        toYear: null,
        toMonth: null,
        isLoan: true,
        parentClubId: loan.parentClubId,
        parentClubName: loan.parentClubName,
        loanEndDate: loan.endDate,
        ...loanFee !== void 0 && { transferFee: loanFee }
      }
    ];
  },
  closeLoanEntry(history, player, year, month) {
    if (!player.loan) return history;
    const loanIndex = [...history].reverse().findIndex(
      (entry) => entry.isLoan && entry.toYear === null && entry.clubId === player.loan?.destinationClubId && entry.parentClubId === player.loan?.parentClubId
    );
    if (loanIndex < 0) return history;
    const actualIndex = history.length - 1 - loanIndex;
    return history.map((entry, index) => index === actualIndex ? {
      ...entry,
      toYear: year,
      toMonth: month,
      statsSnapshot: this.buildLoanStatsSnapshot(player)
    } : entry);
  },
  reopenOrCreateEntry(history, player, target, year, month) {
    const closeIdx = history.findIndex((e) => e.clubId !== target.clubId && e.toYear === null);
    let closed = closeIdx >= 0 ? history.map((e, i) => i === closeIdx ? { ...e, toYear: year, toMonth: month, statsSnapshot: e.statsSnapshot ?? this.buildStatsSnapshot(player) } : e) : [...history];
    const existingIdx = closed.findIndex((e) => e.clubId === target.clubId && e.clubName === target.clubName);
    if (existingIdx >= 0) {
      return closed.map((e, i) => i === existingIdx ? { ...e, toYear: null, toMonth: null, statsSnapshot: void 0 } : e);
    }
    return this.startNewEntry(closed, target, year, month);
  },
  movePlayer(player, target, year, month, currentClubInfo, transferFee) {
    let history = player.history || [];
    if (history.length === 0 && currentClubInfo) {
      history = [{
        clubName: currentClubInfo.clubName,
        clubId: currentClubInfo.clubId,
        fromYear: year - 1,
        fromMonth: 7,
        toYear: null,
        toMonth: null
      }];
    }
    const closedHistory = this.closeCurrentEntry(history, player, year, month);
    return this.startNewEntry(closedHistory, target, year, month, transferFee);
  }
};

// services/PlayerContractMindflowService.ts
var clamp8 = (value, min, max) => Math.max(min, Math.min(max, value));
var roundMoney2 = (value) => {
  const step = value >= 1e6 ? 1e5 : value >= 1e5 ? 1e4 : 5e3;
  return Math.max(5e4, Math.round(value / step) * step);
};
var roundPerformanceBonus = (value) => Math.max(0, Math.round(value / 500) * 500);
var seededUnit = (seed) => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};
var getContractDaysLeft = (player, currentDate) => {
  if (!player.contractEndDate) return 9999;
  return Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5);
};
var getPlayerLoyalty2 = (player) => clamp8(Math.round(player.lojalnosc ?? 50), 1, 99);
var hasActiveExitSignal = (player) => !!player.transferListDemandUntil || !!player.developmentExitDemandUntil || !!player.isOnTransferList || !!player.isNegotiationPermanentBlocked;
var getLoyaltyResistance2 = (player, contractDaysLeft, bestSportingUpgrade = 0) => {
  const baseResistance = clamp8((getPlayerLoyalty2(player) - 50) / 49, 0, 1);
  if (baseResistance <= 0) return 0;
  if (hasActiveExitSignal(player)) return baseResistance * 0.22;
  if (bestSportingUpgrade >= 5) return baseResistance * 0.08;
  if (bestSportingUpgrade >= 3) return baseResistance * 0.4;
  if (contractDaysLeft <= 90) return baseResistance * 0.35;
  if (contractDaysLeft <= 330) return baseResistance * 0.55;
  return baseResistance;
};
var getLowLoyaltyInstability = (player) => clamp8((50 - getPlayerLoyalty2(player)) / 49, 0, 1);
var getCombinedMatches = (player) => (player.stats?.matchesPlayed || 0) + (player.cupStats?.matchesPlayed || 0) + (player.euroStats?.matchesPlayed || 0);
var getCombinedMinutes = (player) => (player.stats?.minutesPlayed || 0) + (player.cupStats?.minutesPlayed || 0) + (player.euroStats?.minutesPlayed || 0);
var getCombinedGoals = (player) => (player.stats?.goals || 0) + (player.cupStats?.goals || 0) + (player.euroStats?.goals || 0);
var getCombinedAssists = (player) => (player.stats?.assists || 0) + (player.cupStats?.assists || 0) + (player.euroStats?.assists || 0);
var getCombinedCleanSheets = (player) => (player.stats?.cleanSheets || 0) + (player.cupStats?.cleanSheets || 0) + (player.euroStats?.cleanSheets || 0);
var getAverageRating = (player) => {
  const ratings = [
    ...player.stats?.ratingHistory || [],
    ...player.cupStats?.ratingHistory || [],
    ...player.euroStats?.ratingHistory || []
  ].slice(-15);
  return ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;
};
var getSquadAverage = (squad) => squad.length > 0 ? squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length : 0;
var getPositionAverage = (squad, position) => {
  const samePosition = squad.filter((player) => player.position === position);
  return samePosition.length > 0 ? getSquadAverage(samePosition) : getSquadAverage(squad);
};
var getDevelopmentSignal = (player) => {
  const changes = player.stats?.seasonalChanges || {};
  const values = Object.values(changes).filter((value) => Number.isFinite(value));
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0);
};
var getAgeGroup = (age) => {
  if (age <= 23) return "YOUNG";
  if (age <= 29) return "PRIME";
  if (age <= 33) return "EXPERIENCED";
  return "VETERAN";
};
var buildProfile = (player, squadAverage, positionAverage) => {
  const ageGroup = getAgeGroup(player.age);
  const talentGap = (player.attributes?.talent ?? player.overallRating) - player.overallRating;
  const careerStage = player.age <= 21 ? "DEVELOPMENT" : player.age <= 24 && talentGap >= 5 ? "BREAKTHROUGH" : player.age <= 30 ? "PEAK" : player.age <= 34 ? "SECURITY" : "DECLINE";
  const qualityDelta = Math.max(player.overallRating - squadAverage, player.overallRating - positionAverage);
  const qualityLevel = qualityDelta >= 6 ? "STAR_LEVEL" : qualityDelta >= 2 ? "STARTER_LEVEL" : qualityDelta >= -3 ? "SQUAD_PLAYER" : "BELOW_SQUAD";
  const potentialStatus = talentGap >= 12 ? "ELITE_UPSIDE" : talentGap >= 7 ? "HIGH_UPSIDE" : talentGap >= 2 ? "NORMAL" : "LOW_UPSIDE";
  return { ageGroup, careerStage, qualityLevel, potentialStatus };
};
var getTeamAmbitionFit = (club) => {
  const played = club.stats?.played || 0;
  if (played < 5) return 60;
  const pointsPerMatch = (club.stats?.points || 0) / Math.max(1, played);
  const form = club.stats?.form || [];
  const recentScore = form.slice(-5).reduce((sum, result) => {
    if (result === "W") return sum + 3;
    if (result === "R") return sum + 1;
    return sum;
  }, 0);
  return clamp8(38 + pointsPerMatch * 18 + recentScore * 2.2, 20, 95);
};
var getRoleFit = (player, profile) => {
  if (player.isUntouchable || player.squadRole === "KEY_PLAYER") return 96;
  if (player.squadRole === "STARTER") return 82;
  if (profile.qualityLevel === "STAR_LEVEL") return 42;
  if (profile.qualityLevel === "STARTER_LEVEL") return 56;
  return 68;
};
var getPlayingTimeFit = (player, club, profile) => {
  const matches = getCombinedMatches(player);
  const minutes = getCombinedMinutes(player);
  const teamMatches = Math.max(1, club.stats?.played || matches || 1);
  if (matches < 5 && club.stats?.played < 8) return 62;
  const minutesShare = clamp8(minutes / Math.max(1, teamMatches * 90), 0, 1);
  const base = minutesShare * 100;
  if (profile.qualityLevel === "STAR_LEVEL") return clamp8(base - 8, 0, 100);
  if (profile.qualityLevel === "STARTER_LEVEL") return clamp8(base + 4, 0, 100);
  if (profile.careerStage === "DEVELOPMENT") return clamp8(base + 18, 0, 100);
  return clamp8(base + 12, 0, 100);
};
var getPerformanceFit = (player) => {
  const matches = Math.max(1, getCombinedMatches(player));
  const averageRating = getAverageRating(player);
  if (matches >= 15 && averageRating !== null) {
    return clamp8(50 + (averageRating - 6.5) * 18, 15, 95);
  }
  const goals = getCombinedGoals(player);
  const assists = getCombinedAssists(player);
  if (player.position === "FWD" /* FWD */) return clamp8(48 + goals / matches * 55 + assists / matches * 20, 20, 90);
  if (player.position === "MID" /* MID */) return clamp8(48 + (goals + assists) / matches * 38, 20, 90);
  return 58;
};
var getClubReputationFit = (player, club) => {
  const expectedReputation = clamp8((player.overallRating - 34) / 4.3, 1, 20);
  const delta = club.reputation - expectedReputation;
  if (delta >= 1) return 88;
  if (delta >= -1) return 74;
  if (delta >= -3) return 58;
  if (delta >= -5) return 42;
  return 28;
};
var getSeasonPerformanceRaiseBonus = (player) => {
  const matches = getCombinedMatches(player);
  if (matches < 20) return 0;
  let bonus = 0;
  const averageRating = getAverageRating(player);
  if (averageRating !== null) {
    if (averageRating >= 7.35) bonus += 0.24;
    else if (averageRating >= 7.1) bonus += 0.16;
    else if (averageRating >= 6.9) bonus += 0.08;
  }
  const goalAssistRate = (getCombinedGoals(player) + getCombinedAssists(player)) / Math.max(1, matches);
  if (player.position === "FWD" /* FWD */) {
    if (goalAssistRate >= 0.75) bonus += 0.24;
    else if (goalAssistRate >= 0.5) bonus += 0.15;
    else if (goalAssistRate >= 0.32) bonus += 0.07;
  } else if (player.position === "MID" /* MID */) {
    if (goalAssistRate >= 0.45) bonus += 0.2;
    else if (goalAssistRate >= 0.3) bonus += 0.12;
    else if (goalAssistRate >= 0.18) bonus += 0.06;
  } else if (player.position === "DEF" /* DEF */ || player.position === "GK" /* GK */) {
    if (averageRating !== null && averageRating >= 7.15) bonus += 0.14;
    else if (averageRating !== null && averageRating >= 6.95) bonus += 0.07;
  }
  return clamp8(bonus, 0, 0.38);
};
var getRenewalRaiseLimit = (player, currentClub, profile, currentClubSituation) => {
  if (!player.annualSalary || player.annualSalary <= 0) return null;
  let multiplier = 1.3;
  if (player.overallRating >= 78) multiplier += 0.38;
  else if (player.overallRating >= 74) multiplier += 0.28;
  else if (player.overallRating >= 70) multiplier += 0.18;
  else if (player.overallRating >= 66) multiplier += 0.1;
  if (profile.qualityLevel === "STAR_LEVEL") multiplier += 0.24;
  else if (profile.qualityLevel === "STARTER_LEVEL") multiplier += 0.12;
  if (player.isUntouchable || player.squadRole === "KEY_PLAYER") multiplier += 0.16;
  else if (player.squadRole === "STARTER") multiplier += 0.07;
  if (profile.potentialStatus === "ELITE_UPSIDE") multiplier += 0.16;
  else if (profile.potentialStatus === "HIGH_UPSIDE") multiplier += 0.07;
  if (currentClubSituation.clubReputationFit < 48) multiplier += 0.12;
  else if (currentClub.reputation >= 8) multiplier += 0.05;
  if (currentClubSituation.financialRespectFit < 45) multiplier += 0.14;
  if (currentClubSituation.totalStayComfort < 50) multiplier += 0.08;
  if (profile.ageGroup === "PRIME") multiplier += 0.06;
  if (player.moralePersonality === "AMBITIOUS" || player.moralePersonality === "EGOIST") multiplier += 0.07;
  const performanceRaiseBonus = getSeasonPerformanceRaiseBonus(player);
  multiplier += performanceRaiseBonus;
  multiplier = clamp8(multiplier, 1.3, 2.5);
  const rareRaiseCandidate = profile.qualityLevel === "STAR_LEVEL" || profile.potentialStatus === "ELITE_UPSIDE" || player.isUntouchable || player.squadRole === "KEY_PLAYER" || performanceRaiseBonus >= 0.24 || profile.qualityLevel === "STARTER_LEVEL" && currentClubSituation.financialRespectFit < 40;
  const rareChance = profile.qualityLevel === "STAR_LEVEL" || profile.potentialStatus === "ELITE_UPSIDE" ? 0.12 : rareRaiseCandidate ? 0.07 : 0.02;
  const rareRoll = seededUnit(`${player.id}_${player.contractEndDate}_renewal_raise`);
  if (rareRoll < rareChance) {
    const rareStrength = 0.35 + (1 - rareRoll / rareChance) * 0.55;
    multiplier += rareRaiseCandidate ? rareStrength : rareStrength * 0.55;
  }
  return roundMoney2(player.annualSalary * clamp8(multiplier, 1.3, 3.05));
};
var buildPerformanceBonusExpectations = (player, expectedSalary, profile) => {
  const ratingFactor = clamp8((player.overallRating - 55) / 35, 0.25, 1.55);
  const starFactor = profile.qualityLevel === "STAR_LEVEL" ? 1.18 : profile.qualityLevel === "STARTER_LEVEL" ? 1.08 : 0.92;
  const salaryFactor = clamp8(expectedSalary / 65e4, 0.55, 2.35);
  const matches = Math.max(1, getCombinedMatches(player));
  const goalsPerMatch = getCombinedGoals(player) / matches;
  const assistsPerMatch = getCombinedAssists(player) / matches;
  const cleanSheetsPerMatch = getCombinedCleanSheets(player) / matches;
  const base = clamp8(expectedSalary * 0.014, 3e3, 22e3) * ratingFactor * starFactor * salaryFactor;
  if (player.position === "GK" /* GK */) {
    const cleanSheetFactor = clamp8(0.85 + cleanSheetsPerMatch * 1.6, 0.85, 1.45);
    return {
      expectedGoalBonus: 0,
      expectedAssistBonus: 0,
      expectedCleanSheetBonus: roundPerformanceBonus(base * 0.82 * cleanSheetFactor)
    };
  }
  if (player.position === "DEF" /* DEF */) {
    return {
      expectedGoalBonus: 0,
      expectedAssistBonus: 0,
      expectedCleanSheetBonus: 0
    };
  }
  const goalPositionFactor = player.position === "FWD" /* FWD */ ? 1.15 : 0.55;
  const assistPositionFactor = player.position === "MID" /* MID */ ? 1.05 : 0.62;
  const goalProductionFactor = clamp8(0.8 + goalsPerMatch * 1.7, 0.75, 1.55);
  const assistProductionFactor = clamp8(0.82 + assistsPerMatch * 1.8, 0.75, 1.55);
  return {
    expectedGoalBonus: roundPerformanceBonus(base * goalPositionFactor * goalProductionFactor),
    expectedAssistBonus: roundPerformanceBonus(base * assistPositionFactor * assistProductionFactor),
    expectedCleanSheetBonus: 0
  };
};
var buildExpectations = (player, currentClub, profile, currentClubSituation) => {
  const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
  const currentSalary = Math.max(player.annualSalary || 0, fairSalary * 0.72);
  let salaryMultiplier = 1.05;
  if (profile.qualityLevel === "STAR_LEVEL") salaryMultiplier += 0.22;
  else if (profile.qualityLevel === "STARTER_LEVEL") salaryMultiplier += 0.12;
  if (currentClubSituation.financialRespectFit < 72) salaryMultiplier += 0.12;
  if (currentClubSituation.totalStayComfort >= 82) salaryMultiplier -= 0.07;
  if (currentClubSituation.totalStayComfort < 55) salaryMultiplier += 0.1;
  if (profile.ageGroup === "VETERAN") salaryMultiplier -= 0.04;
  if (profile.potentialStatus === "ELITE_UPSIDE") salaryMultiplier += 0.1;
  if (currentClubSituation.loyaltyFit >= 82 && currentClubSituation.totalStayComfort >= 72) salaryMultiplier -= 0.04;
  if (currentClubSituation.loyaltyFit <= 32) salaryMultiplier += 0.05;
  const salaryCeiling = FinanceService.calculatePolishLeagueSalaryCeiling(
    FinanceService.getClubTier(currentClub),
    currentClub.reputation
  );
  const rawExpectedSalary = roundMoney2(Math.max(fairSalary, currentSalary) * salaryMultiplier);
  const renewalRaiseLimit = getRenewalRaiseLimit(player, currentClub, profile, currentClubSituation);
  const cappedExpectedSalary = salaryCeiling ? Math.min(rawExpectedSalary, salaryCeiling) : rawExpectedSalary;
  const expectedSalary = renewalRaiseLimit ? Math.min(cappedExpectedSalary, renewalRaiseLimit) : cappedExpectedSalary;
  const minimumSalary = roundMoney2(expectedSalary * (currentClubSituation.totalStayComfort >= 78 ? 0.88 : 0.95));
  const rawPremiumSalary = roundMoney2(expectedSalary * (currentClubSituation.totalStayComfort < 55 ? 1.28 : 1.18));
  const cappedPremiumSalary = salaryCeiling ? Math.min(rawPremiumSalary, salaryCeiling) : rawPremiumSalary;
  const premiumSalary = renewalRaiseLimit ? Math.min(cappedPremiumSalary, renewalRaiseLimit) : cappedPremiumSalary;
  const bonusMultiplier = profile.ageGroup === "VETERAN" ? 0.92 : profile.ageGroup === "EXPERIENCED" ? 0.72 : profile.ageGroup === "PRIME" ? 0.56 : 0.38;
  const reputationBonus = currentClub.reputation >= 10 ? 1.1 : currentClub.reputation >= 7 ? 1.02 : 0.94;
  const qualityBonus = profile.qualityLevel === "STAR_LEVEL" ? 1.18 : profile.qualityLevel === "STARTER_LEVEL" ? 1.08 : 1;
  const baseBonus = expectedSalary * bonusMultiplier * reputationBonus * qualityBonus;
  const expectedBonus = roundMoney2(baseBonus * (profile.ageGroup === "VETERAN" ? 1.1 : profile.ageGroup === "YOUNG" ? 0.72 : 0.92));
  const minimumBonus = roundMoney2(expectedBonus * (profile.ageGroup === "VETERAN" ? 0.82 : 0.65));
  const performanceBonuses = buildPerformanceBonusExpectations(player, expectedSalary, profile);
  const preferredYears = player.age <= 22 ? 4 : player.age <= 27 ? 4 : player.age <= 31 ? 3 : player.age <= 34 ? 2 : 1;
  const expectedRole = profile.qualityLevel === "STAR_LEVEL" ? "KEY_PLAYER" : profile.qualityLevel === "STARTER_LEVEL" ? "STARTER" : "NONE";
  const priorities = profile.ageGroup === "YOUNG" ? { salary: 18, bonus: 8, years: 18, role: 16, playingTime: 24, ambition: 12, development: 24 } : profile.ageGroup === "PRIME" ? { salary: 24, bonus: 14, years: 14, role: 20, playingTime: 18, ambition: 22, development: 10 } : profile.ageGroup === "EXPERIENCED" ? { salary: 24, bonus: 20, years: 18, role: 16, playingTime: 12, ambition: 18, development: 5 } : { salary: 18, bonus: 26, years: 24, role: 10, playingTime: 8, ambition: 10, development: 2 };
  const rememberedRaise = player.contractRaiseRequest;
  const finalExpectedSalary = rememberedRaise ? Math.max(expectedSalary, rememberedRaise.salary) : expectedSalary;
  const finalMinimumSalary = rememberedRaise ? Math.max(minimumSalary, rememberedRaise.salary) : minimumSalary;
  const finalPremiumSalary = rememberedRaise ? Math.max(premiumSalary, roundMoney2(rememberedRaise.salary * 1.08)) : premiumSalary;
  const finalExpectedBonus = rememberedRaise ? Math.max(expectedBonus, rememberedRaise.bonus) : expectedBonus;
  const finalMinimumBonus = rememberedRaise ? Math.max(minimumBonus, rememberedRaise.bonus) : minimumBonus;
  const finalMinimumYears = rememberedRaise ? Math.max(player.age >= 34 ? 1 : 2, rememberedRaise.years) : player.age >= 34 ? 1 : 2;
  const finalPreferredYears = rememberedRaise ? Math.max(preferredYears, rememberedRaise.years) : preferredYears;
  return {
    minimumSalary: finalMinimumSalary,
    expectedSalary: finalExpectedSalary,
    premiumSalary: finalPremiumSalary,
    minimumBonus: finalMinimumBonus,
    expectedBonus: finalExpectedBonus,
    ...performanceBonuses,
    minimumYears: finalMinimumYears,
    preferredYears: finalPreferredYears,
    maximumYears: player.age >= 34 ? 2 : 5,
    expectedRole,
    priorities
  };
};
var getMarketSituation = (player, currentClub, interestedClubs = []) => {
  const validInterest = interestedClubs.filter((club) => club.id !== currentClub.id);
  const bestReputation = validInterest.length > 0 ? Math.max(...validInterest.map((club) => club.reputation)) : null;
  const bestSportingUpgrade = bestReputation === null ? 0 : bestReputation - currentClub.reputation;
  const bestFinancialPotential = validInterest.length > 0 ? Math.max(...validInterest.map((club) => Math.max(0.75, club.reputation / Math.max(1, currentClub.reputation)))) : 0;
  const playerLevelBoost = player.overallRating >= 75 ? 10 : player.overallRating >= 68 ? 5 : 0;
  const marketConfidence = clamp8(
    validInterest.length * 16 + Math.max(0, bestSportingUpgrade) * 10 + playerLevelBoost,
    0,
    100
  );
  return {
    hasInterest: validInterest.length > 0,
    interestedClubCount: validInterest.length,
    bestInterestedClubReputation: bestReputation,
    bestSportingUpgrade,
    bestFinancialPotential,
    marketConfidence
  };
};
var getNegotiationMemory = (player, currentDate, currentClubSituation) => {
  const rejectedOffers = player.negotiationStep || 0;
  const isLocked = !!player.negotiationLockoutUntil && currentDate < new Date(player.negotiationLockoutUntil);
  const permanentBreakdown = !!player.isNegotiationPermanentBlocked;
  let frustration = rejectedOffers * 16 + (isLocked ? 10 : 0) + (permanentBreakdown ? 38 : 0) + (currentClubSituation.financialRespectFit < 60 ? 14 : 0) + (currentClubSituation.squadRoleFit < 55 ? 10 : 0);
  const loyaltyResistance = getLoyaltyResistance2(player, currentClubSituation.contractDaysLeft, 0);
  const lowLoyaltyInstability = getLowLoyaltyInstability(player);
  if ((player.morale ?? 55) >= 78) frustration -= 10;
  if (player.moralePersonality === "LOYAL") frustration -= 8;
  if (player.moralePersonality === "EGOIST") frustration += 8;
  if (player.moralePersonality === "AMBITIOUS" && currentClubSituation.clubReputationFit < 58) frustration += 8;
  frustration -= loyaltyResistance * 12;
  frustration += lowLoyaltyInstability * 8;
  frustration = clamp8(frustration, 0, 100);
  const lastOfferQuality = rejectedOffers <= 0 ? "NONE" : permanentBreakdown ? "INSULTING" : rejectedOffers >= 3 ? "WEAK" : currentClubSituation.financialRespectFit >= 86 ? "FAIR" : "WEAK";
  const patience = clamp8(
    72 + (player.moralePersonality === "LOYAL" ? 14 : 0) + (player.moralePersonality === "CALM" ? 8 : 0) - (player.moralePersonality === "EGOIST" ? 12 : 0) - lowLoyaltyInstability * 10 + loyaltyResistance * 18 - rejectedOffers * 12 - (permanentBreakdown ? 30 : 0),
    0,
    100
  );
  const trustInClub = clamp8(100 - frustration + (currentClubSituation.totalStayComfort - 60) * 0.35, 0, 100);
  return {
    rejectedOffers,
    lastOfferQuality,
    trustInClub,
    frustration,
    patience,
    permanentBreakdown
  };
};
var getTimePressure = (daysLeft) => {
  if (daysLeft <= 0) return 100;
  if (daysLeft <= 30) return 78;
  if (daysLeft <= 90) return 55;
  if (daysLeft <= 180) return 32;
  if (daysLeft <= 330) return 16;
  return 0;
};
var getMindset = (player, currentClubSituation, negotiationMemory, marketSituation) => {
  const timePressure = getTimePressure(currentClubSituation.contractDaysLeft);
  const stayComfort = currentClubSituation.totalStayComfort;
  const frustration = negotiationMemory.frustration;
  const trust = negotiationMemory.trustInClub;
  const marketConfidence = marketSituation.marketConfidence;
  const activeExitDemand = !!player.transferListDemandUntil || !!player.developmentExitDemandUntil || !!player.isOnTransferList || player.isNegotiationPermanentBlocked;
  const loyaltyResistance = getLoyaltyResistance2(
    player,
    currentClubSituation.contractDaysLeft,
    marketSituation.bestSportingUpgrade
  );
  const lowLoyaltyInstability = getLowLoyaltyInstability(player);
  const ageStayBias = player.age >= 35 ? 18 : player.age >= 32 ? 12 : player.age >= 29 ? 7 : player.age >= 26 && player.overallRating < 85 ? 3 : 0;
  const eliteLatePrimeAmbition = player.age >= 26 && player.overallRating >= 85 ? 8 : 0;
  const marketOpenness = clamp8(
    18 + timePressure * 0.45 + frustration * 0.62 + marketConfidence * 0.4 - ageStayBias + eliteLatePrimeAmbition + lowLoyaltyInstability * 18 - loyaltyResistance * 28 + (activeExitDemand ? 34 : 0) - stayComfort * 0.42 - trust * 0.2,
    0,
    100
  );
  const preContractReadiness = clamp8(
    marketOpenness + timePressure * 0.42 + (negotiationMemory.permanentBreakdown ? 25 : 0) + (activeExitDemand ? 24 : 0) + Math.max(0, marketSituation.bestSportingUpgrade) * 8 - loyaltyResistance * 22 + lowLoyaltyInstability * 10 - (stayComfort >= 82 ? 22 : stayComfort >= 72 ? 12 : 0),
    0,
    100
  );
  const renewalPriority = clamp8(
    stayComfort * 0.75 + trust * 0.35 - frustration * 0.28 - (activeExitDemand ? 38 : 0) + ageStayBias * 0.35 - lowLoyaltyInstability * 12 + loyaltyResistance * 16 - timePressure * 0.12,
    0,
    100
  );
  let state;
  if (stayComfort >= 86 && frustration <= 18 && marketOpenness <= 24) state = "SUPER_HAPPY";
  else if (stayComfort >= 76 && frustration <= 28 && marketOpenness <= 38) state = "HAPPY_TO_STAY";
  else if (frustration <= 32 && renewalPriority >= 58) state = "OPEN_TO_RENEWAL";
  else if (currentClubSituation.financialRespectFit < 68 && frustration < 58) state = "EXPECTING_BETTER_TERMS";
  else if (activeExitDemand) state = preContractReadiness >= 72 ? "PRECONTRACT_READY" : "READY_TO_LEAVE";
  else if (frustration >= 72 || negotiationMemory.permanentBreakdown) state = preContractReadiness >= 70 ? "PRECONTRACT_READY" : "READY_TO_LEAVE";
  else if (marketOpenness >= 68) state = preContractReadiness >= 72 ? "PRECONTRACT_READY" : "TESTING_MARKET";
  else if (frustration >= 48 || timePressure >= 55) state = "LOSING_PATIENCE";
  else state = "OPEN_TO_RENEWAL";
  const explanation = [
    stayComfort >= 80 ? "Zawodnik dobrze czuje si\u0119 w obecnym klubie." : null,
    currentClubSituation.financialRespectFit < 68 ? "Oczekuje lepszego finansowego uznania swojej pozycji." : null,
    negotiationMemory.rejectedOffers > 0 ? `Historia rozm\xF3w obni\u017Ca zaufanie: ${negotiationMemory.rejectedOffers} odrzucone pr\xF3by.` : null,
    marketSituation.hasInterest ? `Rynek jest aktywny: ${marketSituation.interestedClubCount} klub(y) obserwuj\u0105 sytuacj\u0119.` : null,
    currentClubSituation.contractDaysLeft <= 180 ? "Ko\u0144c\xF3wka kontraktu zwi\u0119ksza presj\u0119 decyzyjn\u0105." : null,
    player.squadRole === "KEY_PLAYER" || player.isUntouchable ? "Status w dru\u017Cynie dzia\u0142a na korzy\u015B\u0107 obecnego klubu." : null,
    loyaltyResistance >= 0.45 ? "Silne przywi\u0105zanie do klubu obni\u017Ca gotowo\u015B\u0107 do zwyk\u0142ego ruchu na rynku." : null,
    lowLoyaltyInstability >= 0.35 ? "Niska lojalno\u015B\u0107 zwi\u0119ksza podatno\u015B\u0107 na propozycje zewn\u0119trzne." : null,
    activeExitDemand ? "Zawodnik aktywnie sygnalizuje ch\u0119\u0107 odej\u015Bcia, wi\u0119c zwyk\u0142e przed\u0142u\u017Cenie kontraktu b\u0119dzie bardzo trudne." : null,
    ageStayBias > 0 && !activeExitDemand ? "Wiek i stabilizacja kariery dzia\u0142aj\u0105 na korzy\u015B\u0107 pozostania w klubie." : null,
    eliteLatePrimeAmbition > 0 ? "Elitarny poziom sportowy utrzymuje realn\u0105 ambicj\u0119 du\u017Cego ruchu mimo wieku." : null
  ].filter(Boolean);
  return {
    state,
    renewalPriority,
    marketOpenness,
    preContractReadiness,
    clubTrust: trust,
    activeExitDemand,
    explanation
  };
};
var getExternalOfferGate = (player, currentClub, targetClub, mindset, currentClubSituation, negotiationMemory) => {
  const reputationUpgrade = targetClub ? targetClub.reputation - currentClub.reputation : 0;
  const isMajorSportingUpgrade = reputationUpgrade >= 3;
  const isClearSportingUpgrade = reputationUpgrade >= 1;
  const isLowerStep = reputationUpgrade < 0;
  const isSuperHappy = mindset.state === "SUPER_HAPPY";
  const loyaltyResistance = getLoyaltyResistance2(
    player,
    currentClubSituation.contractDaysLeft,
    reputationUpgrade
  );
  const requiresMajorUpgrade = isSuperHappy || loyaltyResistance >= 0.72 && currentClubSituation.contractDaysLeft > 330 && !negotiationMemory.permanentBreakdown || mindset.state === "HAPPY_TO_STAY" && currentClubSituation.contractDaysLeft > 90;
  let willingnessToListen = mindset.marketOpenness + Math.max(0, reputationUpgrade) * 10;
  if (isLowerStep) willingnessToListen -= 18;
  if (isSuperHappy) willingnessToListen -= 26;
  willingnessToListen -= loyaltyResistance * 18;
  if (negotiationMemory.permanentBreakdown) willingnessToListen += 28;
  willingnessToListen = clamp8(willingnessToListen, 0, 100);
  const autoRejectThreshold = clamp8(
    (requiresMajorUpgrade ? 72 : mindset.state === "OPEN_TO_RENEWAL" ? 54 : 42) + loyaltyResistance * 16,
    42,
    88
  );
  const willListen = negotiationMemory.permanentBreakdown || mindset.state === "READY_TO_LEAVE" || mindset.state === "PRECONTRACT_READY" || (requiresMajorUpgrade ? isMajorSportingUpgrade && willingnessToListen >= 46 : willingnessToListen >= autoRejectThreshold) || isClearSportingUpgrade && currentClubSituation.contractDaysLeft <= 60 && willingnessToListen >= 40;
  const canSignPreContract = willListen && currentClubSituation.contractDaysLeft > 0 && currentClubSituation.contractDaysLeft <= 330 && (mindset.state === "PRECONTRACT_READY" || negotiationMemory.permanentBreakdown || mindset.state === "READY_TO_LEAVE" && currentClubSituation.contractDaysLeft <= 180 || mindset.state === "TESTING_MARKET" && currentClubSituation.contractDaysLeft <= 90 && isClearSportingUpgrade || currentClubSituation.contractDaysLeft <= 30 && mindset.preContractReadiness >= 58);
  const preContractChanceMultiplier = clamp8(
    0.25 + mindset.preContractReadiness / 72 + Math.max(0, reputationUpgrade) * 0.12 - loyaltyResistance * 0.45 - (isSuperHappy ? 0.55 : 0),
    0.08,
    2.2
  );
  const reason = !willListen ? loyaltyResistance >= 0.55 ? "Zawodnik jest mocno przywi\u0105zany do obecnego klubu i nie chce s\u0142ucha\u0107 zwyk\u0142ej oferty na tym etapie." : "Zawodnik nie chce s\u0142ucha\u0107 tej oferty na obecnym etapie." : canSignPreContract ? "Zawodnik jest got\xF3w realnie rozwa\u017Cy\u0107 prekontrakt." : "Zawodnik mo\u017Ce wys\u0142ucha\u0107 rynku, ale nie jest got\xF3w podpisa\u0107 prekontraktu.";
  return {
    willListen,
    requiresMajorUpgrade,
    canSignPreContract,
    preContractChanceMultiplier,
    willingnessToListen,
    autoRejectThreshold,
    reason
  };
};
var evaluateRenewalOffer = (mindflow, offer) => {
  const expectations = mindflow.contractExpectations;
  const priorities = expectations.priorities;
  const prioritySum = Math.max(1, priorities.salary + priorities.bonus + priorities.years);
  const salaryWeight = priorities.salary / prioritySum;
  const bonusWeight = priorities.bonus / prioritySum;
  const yearsWeight = priorities.years / prioritySum;
  const salaryFit = offer.salary / Math.max(1, expectations.expectedSalary);
  const bonusFit = expectations.expectedBonus > 0 ? offer.bonus / Math.max(1, expectations.expectedBonus) : 1;
  const yearsFit = offer.years / Math.max(1, expectations.preferredYears);
  const bonusToSalaryCompensationRate = mindflow.profile.ageGroup === "YOUNG" ? 0.7 : mindflow.profile.ageGroup === "PRIME" ? 0.82 : mindflow.profile.ageGroup === "EXPERIENCED" ? 0.92 : 1;
  const bonusSurplusValue = Math.max(0, offer.bonus - expectations.expectedBonus);
  const annualizedBonusCompensation = bonusSurplusValue * bonusToSalaryCompensationRate / Math.max(1, offer.years);
  const bonusSurplus = Math.max(0, bonusFit - 1);
  const salarySurplus = Math.max(0, salaryFit - 1);
  const packageAdjustedSalaryFit = (offer.salary + annualizedBonusCompensation) / Math.max(1, expectations.expectedSalary);
  const effectiveSalaryFit = Math.max(salaryFit + bonusSurplus * 0.08, packageAdjustedSalaryFit);
  const effectiveBonusFit = bonusFit + salarySurplus * (mindflow.profile.ageGroup === "YOUNG" ? 0.75 : 1.15);
  const expectedPerformanceBonusTotal = expectations.expectedGoalBonus + expectations.expectedAssistBonus + expectations.expectedCleanSheetBonus;
  const offeredPerformanceBonusTotal = (offer.goalBonus ?? 0) + (offer.assistBonus ?? 0) + (offer.cleanSheetBonus ?? 0);
  const performanceBonusFit = expectedPerformanceBonusTotal > 0 ? offeredPerformanceBonusTotal / Math.max(1, expectedPerformanceBonusTotal) : 1;
  const performanceWeight = expectedPerformanceBonusTotal > 0 ? 0.08 : 0;
  const offerScore = clamp8(effectiveSalaryFit, 0, 1.25) * salaryWeight + clamp8(effectiveBonusFit, 0, 1.25) * bonusWeight + clamp8(yearsFit, 0.55, 1.15) * yearsWeight + clamp8(performanceBonusFit, 0, 1.2) * performanceWeight;
  let requiredScore = mindflow.mindset.state === "SUPER_HAPPY" ? 0.88 : mindflow.mindset.state === "HAPPY_TO_STAY" ? 0.91 : mindflow.mindset.state === "OPEN_TO_RENEWAL" ? 0.95 : mindflow.mindset.state === "EXPECTING_BETTER_TERMS" ? 0.99 : mindflow.mindset.state === "LOSING_PATIENCE" ? 1.02 : mindflow.mindset.state === "TESTING_MARKET" ? 1.05 : mindflow.mindset.state === "READY_TO_LEAVE" ? 1.08 : 1.12;
  if (mindflow.marketSituation.marketConfidence >= 55) requiredScore += 0.03;
  if (mindflow.currentClubSituation.totalStayComfort >= 82) requiredScore -= 0.04;
  if (mindflow.negotiationMemory.rejectedOffers > 0) requiredScore += Math.min(0.06, mindflow.negotiationMemory.rejectedOffers * 0.02);
  if (mindflow.mindset.activeExitDemand) requiredScore += 0.08;
  requiredScore = clamp8(requiredScore, 0.86, 1.14);
  const salaryFloor = mindflow.mindset.state === "TESTING_MARKET" || mindflow.mindset.state === "READY_TO_LEAVE" || mindflow.mindset.state === "PRECONTRACT_READY" ? expectations.minimumSalary : expectations.minimumSalary * 0.94;
  const bonusFloor = expectations.minimumBonus * (mindflow.profile.ageGroup === "YOUNG" ? 0.45 : mindflow.profile.ageGroup === "PRIME" ? 0.55 : 0.68);
  const demandPressure = mindflow.mindset.state === "TESTING_MARKET" || mindflow.mindset.state === "READY_TO_LEAVE" || mindflow.mindset.state === "PRECONTRACT_READY" || mindflow.negotiationMemory.frustration >= 55;
  const demandedSalary = demandPressure ? Math.max(expectations.expectedSalary, Math.round(expectations.premiumSalary / 1e4) * 1e4) : Math.max(expectations.minimumSalary, expectations.expectedSalary);
  const demandedBonus = demandPressure ? Math.max(expectations.expectedBonus, Math.round(expectations.minimumBonus * 1.15 / 5e3) * 5e3) : expectations.expectedBonus;
  const demands = {
    salary: roundMoney2(demandedSalary),
    bonus: roundMoney2(demandedBonus),
    goalBonus: expectations.expectedGoalBonus || void 0,
    assistBonus: expectations.expectedAssistBonus || void 0,
    cleanSheetBonus: expectations.expectedCleanSheetBonus || void 0
  };
  if (mindflow.mindset.activeExitDemand) {
    const exitDemands = {
      salary: roundMoney2(Math.max(expectations.premiumSalary, expectations.expectedSalary * 1.18)),
      bonus: roundMoney2(Math.max(expectations.expectedBonus * 2.5, expectations.premiumSalary * 1.15, offer.salary * 1.5)),
      goalBonus: expectations.expectedGoalBonus || void 0,
      assistBonus: expectations.expectedAssistBonus || void 0,
      cleanSheetBonus: expectations.expectedCleanSheetBonus || void 0
    };
    const goldenHandcuffsMet = offer.salary >= exitDemands.salary && offer.bonus >= exitDemands.bonus && offer.years >= expectations.minimumYears;
    if (!goldenHandcuffsMet) {
      return {
        accepted: false,
        reason: "Zawodnik naprawd\u0119 chce odej\u015B\u0107 i nie traktuje zwyk\u0142ego przed\u0142u\u017Cenia jako rozwi\u0105zania. Mo\u017Ce wr\xF3ci\u0107 do rozm\xF3w tylko przy wyj\u0105tkowej premii za podpis i pensji pokazuj\u0105cej, \u017Ce klub bierze ten konflikt powa\u017Cnie.",
        demands: exitDemands,
        offerQuality: "WEAK"
      };
    }
  }
  const salaryFloorGap = Math.max(0, salaryFloor - offer.salary);
  const isSalaryGapCompensatedByBonus = salaryFloorGap > 0 && annualizedBonusCompensation >= salaryFloorGap;
  const isSalaryDisrespectful = offer.salary < salaryFloor && !isSalaryGapCompensatedByBonus;
  const isBonusDisrespectful = offer.bonus < bonusFloor && offer.salary < expectations.expectedSalary * 1.12;
  const performanceGap = Math.max(0, expectedPerformanceBonusTotal - offeredPerformanceBonusTotal);
  const isPerformanceBonusDisrespectful = expectedPerformanceBonusTotal > 0 && performanceGap > expectedPerformanceBonusTotal * 0.72 && offer.salary < expectations.expectedSalary * 1.08 && offer.bonus < expectations.expectedBonus * 1.35;
  const isTooShort = offer.years < expectations.minimumYears;
  if (offer.salary < expectations.minimumSalary * 0.72 || offer.bonus < expectations.minimumBonus * 0.18 && offer.salary < expectations.minimumSalary) {
    return {
      accepted: false,
      reason: "M\xF3j klient uzna\u0142 t\u0119 propozycj\u0119 za niepowa\u017Cn\u0105. Przy jego pozycji, wieku i perspektywach oczekujemy zupe\u0142nie innego poziomu oferty.",
      demands,
      offerQuality: "INSULTING"
    };
  }
  if (isSalaryDisrespectful || isBonusDisrespectful || isPerformanceBonusDisrespectful || isTooShort) {
    const reasonParts = [
      isSalaryDisrespectful ? "pensja jest poni\u017Cej minimalnego poziomu, jaki zawodnik uwa\u017Ca za uczciwy" : null,
      isBonusDisrespectful ? "bonus za podpis nie rekompensuje ryzyka podpisania nowej umowy" : null,
      isPerformanceBonusDisrespectful ? "premie za wyniki s\u0105 zbyt niskie wzgl\u0119dem roli zawodnika" : null,
      isTooShort ? "d\u0142ugo\u015B\u0107 kontraktu nie daje mu oczekiwanej stabilizacji" : null
    ].filter(Boolean);
    return {
      accepted: false,
      reason: `Nie podpiszemy tego kontraktu. ${reasonParts.join(", ")}. Je\u015Bli klub naprawd\u0119 widzi w nim wa\u017Cnego zawodnika, oczekujemy warunk\xF3w bli\u017Cszych jego obecnej warto\u015Bci rynkowej.`,
      demands,
      offerQuality: "WEAK"
    };
  }
  if (offerScore >= requiredScore) {
    return {
      accepted: true,
      reason: "",
      demands: null,
      offerQuality: offerScore >= requiredScore + 0.14 ? "STRONG" : "FAIR"
    };
  }
  return {
    accepted: false,
    reason: "Jeste\u015Bmy w stanie rozmawia\u0107, ale ta oferta nadal nie odpowiada temu, jak zawodnik ocenia swoj\u0105 pozycj\u0119 w dru\u017Cynie i mo\u017Cliwe opcje na rynku.",
    demands,
    offerQuality: offerScore >= requiredScore * 0.86 ? "WEAK" : "INSULTING"
  };
};
var PlayerContractMindflowService = {
  evaluate: (params) => {
    const { player, currentClub, currentSquad, currentDate, interestedClubs, targetClub } = params;
    const squadAverage = getSquadAverage(currentSquad);
    const positionAverage = getPositionAverage(currentSquad, player.position);
    const profile = buildProfile(player, squadAverage, positionAverage);
    const contractDaysLeft = getContractDaysLeft(player, currentDate);
    const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
    const financialRespectFit = clamp8((player.annualSalary || 0) / Math.max(1, fairSalary) * 78, 18, 105);
    const developmentSignal = getDevelopmentSignal(player);
    const performanceFit = getPerformanceFit(player);
    const currentClubSituation = {
      contractDaysLeft,
      clubReputationFit: getClubReputationFit(player, currentClub),
      teamAmbitionFit: getTeamAmbitionFit(currentClub),
      squadRoleFit: getRoleFit(player, profile),
      playingTimeFit: getPlayingTimeFit(player, currentClub, profile),
      moraleFit: clamp8(player.morale ?? 55, 0, 100),
      loyaltyFit: clamp8(
        getPlayerLoyalty2(player) + (player.moralePersonality === "LOYAL" ? 8 : 0) + (player.moralePersonality === "PROFESSIONAL" ? 5 : 0) - (player.moralePersonality === "EGOIST" ? 8 : 0) - (player.moralePersonality === "AMBITIOUS" ? 4 : 0) - (player.isOnTransferList ? 25 : 0) - (player.isNegotiationPermanentBlocked ? 30 : 0),
        0,
        100
      ),
      developmentFit: clamp8(58 + developmentSignal * 8 + (profile.careerStage === "DEVELOPMENT" ? performanceFit * 0.08 : 0), 15, 95),
      financialRespectFit,
      totalStayComfort: 0
    };
    currentClubSituation.totalStayComfort = clamp8(
      currentClubSituation.clubReputationFit * 0.16 + currentClubSituation.teamAmbitionFit * 0.12 + currentClubSituation.squadRoleFit * 0.18 + currentClubSituation.playingTimeFit * 0.15 + currentClubSituation.moraleFit * 0.15 + currentClubSituation.loyaltyFit * 0.1 + currentClubSituation.developmentFit * 0.08 + currentClubSituation.financialRespectFit * 0.12,
      0,
      100
    );
    const contractExpectations = buildExpectations(player, currentClub, profile, currentClubSituation);
    const negotiationMemory = getNegotiationMemory(player, currentDate, currentClubSituation);
    const marketSituation = getMarketSituation(player, currentClub, interestedClubs);
    const mindset = getMindset(player, currentClubSituation, negotiationMemory, marketSituation);
    const externalOfferGate = getExternalOfferGate(player, currentClub, targetClub, mindset, currentClubSituation, negotiationMemory);
    return {
      profile,
      currentClubSituation,
      contractExpectations,
      negotiationMemory,
      marketSituation,
      externalOfferGate,
      mindset
    };
  },
  evaluateRenewalOffer
};

// services/PlayerFormService.ts
var clamp9 = (value, min, max) => Math.max(min, Math.min(max, value));
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
    return clamp9(goalsPerMatch * 20 + assistsPerMatch * 8 - (goalsPerMatch === 0 ? 8 : 0), -10, 14);
  }
  if (player.position === "MID" /* MID */) {
    return clamp9(contributionsPerMatch * 18, -4, 12);
  }
  if (player.position === "GK" /* GK */) {
    return clamp9(cleanSheetRate * 18 - (cleanSheetRate === 0 ? 4 : 0), -8, 14);
  }
  return clamp9(contributionsPerMatch * 10, -4, 8);
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
      score += clamp9((seasonAverage - 6.5) * 10, -18, 22);
    }
    if (recent10Average !== null) {
      score += clamp9((recent10Average - 6.5) * 14, -22, 28);
    }
    if (recentAverage !== null) {
      score += clamp9((recentAverage - 6.5) * 8, -12, 16);
    }
    if (recentAverage !== null && previousAverage !== null) {
      score += clamp9((recentAverage - previousAverage) * 10, -10, 10);
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
    score += clamp9(((player.morale ?? 50) - 50) * 0.1, -5, 5);
    if (matches > 0 || recentAverage !== null) score += player.trainingFocus ? 2 : 0;
    if (player.health?.status === "INJURED" /* INJURED */) score -= 18;
    if ((player.condition ?? 100) < 60) score -= 8;
    if ((player.fatigueDebt ?? 0) > 55) score -= 6;
    return PlayerFormService.getInfo(Math.round(clamp9(score, 0, 100)));
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
      return clamp9(adjustment - strainPenalty, -9, 7);
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
    const safeScore = Math.round(clamp9(score, 0, 100));
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
var getContractDaysLeft2 = (player, currentDate) => {
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
var MAX_RECENT_MORALE_HISTORY_ENTRIES = 4;
var MAX_PROTECTED_MORALE_HISTORY_ENTRIES = 2;
var MAX_MINDSET_HISTORY_ENTRIES = 2;
var isProtectedMoraleHistoryEntry = (entry) => entry.reason === CLINCHED_CHAMPIONSHIP_MORALE_REASON || entry.reason === CLINCHED_PROMOTION_MORALE_REASON;
var compactMoraleHistory = (entries) => {
  const recent = entries.slice(0, MAX_RECENT_MORALE_HISTORY_ENTRIES);
  const recentIds = new Set(recent.map((entry) => entry.id));
  const protectedEntries = entries.filter((entry) => isProtectedMoraleHistoryEntry(entry) && !recentIds.has(entry.id)).slice(0, MAX_PROTECTED_MORALE_HISTORY_ENTRIES);
  return [...recent, ...protectedEntries];
};
var compactMindsetHistory = (entries) => entries.slice(0, MAX_MINDSET_HISTORY_ENTRIES);
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
      history: compactMindsetHistory(existing.history ?? [])
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
        history: compactMindsetHistory([entry, ...current.history ?? []])
      }
    };
  },
  ensurePlayerState: (player) => ({
    ...player,
    form: typeof player.form === "number" ? player.form : PlayerFormService.calculate(player).score,
    morale: player.morale ?? PlayerMoraleService.getInitialMorale(player),
    moralePersonality: player.moralePersonality ?? PlayerMoraleService.getInitialPersonality(player),
    moraleHistory: compactMoraleHistory(player.moraleHistory ?? []),
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
    const contractDaysLeft = getContractDaysLeft2(withMorale, currentDate);
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
      moraleHistory: compactMoraleHistory([entry, ...withMorale.moraleHistory ?? []])
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
      const contractDaysLeft = getContractDaysLeft2(withMorale, currentDate);
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
      const contractDaysLeft = getContractDaysLeft2(withMorale, currentDate);
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
      const fulfilled = (withMorale.annualSalary || 0) >= request.salary && getContractDaysLeft2(withMorale, currentDate) > 365;
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
        if (frustrationScore >= 34 && getContractDaysLeft2(withMorale, currentDate) > 365) {
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

// services/PlayerReputationGrowthService.ts
var EMPTY_STATS = {
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
var clampReputation = (value) => Math.max(1, Math.min(99, Math.round(value)));
var getPlayerReputation = (player) => clampReputation(player.reputacja ?? 50);
var addDelta = (deltas, playerId, delta) => {
  if (!playerId || delta === 0) return;
  deltas.set(playerId, (deltas.get(playerId) ?? 0) + delta);
};
var getStats = (player) => player.stats ?? EMPTY_STATS;
var getAverageRating2 = (player) => {
  const ratings = [
    ...player.stats?.ratingHistory ?? [],
    ...player.cupStats?.ratingHistory ?? [],
    ...player.euroStats?.ratingHistory ?? [],
    ...player.nationalStats?.ratingHistory ?? []
  ];
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
};
var getSeasonUsage = (player) => {
  const stats = [player.stats, player.cupStats, player.euroStats, player.nationalStats].filter((entry) => !!entry);
  const matches = stats.reduce((sum, entry) => sum + (entry.matchesPlayed ?? 0), 0);
  const recordedMinutes = stats.reduce((sum, entry) => sum + (entry.minutesPlayed ?? 0), 0);
  return {
    matches,
    // Część starszych silników zapisuje występ bez minut. Szacunek chroni
    // regularnie grających zawodników przed fałszywą karą za brak gry.
    effectiveMinutes: Math.max(recordedMinutes, matches * 60)
  };
};
var getInactivityDecay = (effectiveMinutes) => {
  if (effectiveMinutes === 0) return 4;
  if (effectiveMinutes < 450) return 3;
  if (effectiveMinutes < 900) return 2;
  if (effectiveMinutes < 1350) return 1;
  return 0;
};
var getWeakSeasonDecay = (averageRating, matches) => {
  if (averageRating === null || matches < 6) return 0;
  if (averageRating < 6.2) return 2;
  if (averageRating < 6.5) return 1;
  return 0;
};
var getAgeDecay = (player, averageRating, effectiveMinutes) => {
  const strongSeason = effectiveMinutes >= 1350 && averageRating !== null && averageRating >= 7;
  if (strongSeason) return 0;
  if (player.age >= 38) return 2;
  if (player.age >= 34) return 1;
  return 0;
};
var getExposureGrowth = (player, clubReputation) => {
  const currentReputation = getPlayerReputation(player);
  const target = PlayerPrestigeService.getReputationTarget(player.overallRating, clubReputation);
  const gap = target - currentReputation;
  if (gap >= 15) return 2;
  if (gap >= 6) return 1;
  return 0;
};
var getLeagueTopDelta = (leagueId) => {
  if (leagueId === "L_PL_1") return 2;
  if (leagueId === "L_PL_2" || leagueId === "L_PL_3") return 1;
  return 0;
};
var getTopLeaguePlayers = (leagueId, clubs, playersMap, statKind) => {
  return clubs.filter((club) => club.leagueId === leagueId && club.isDefaultActive).flatMap((club) => playersMap[club.id] ?? []).filter((player) => getStats(player)[statKind] > 0).sort((a, b) => {
    const aStats = getStats(a);
    const bStats = getStats(b);
    if (bStats[statKind] !== aStats[statKind]) return bStats[statKind] - aStats[statKind];
    const tieBreakKind = statKind === "goals" ? "assists" : "goals";
    if (bStats[tieBreakKind] !== aStats[tieBreakKind]) return bStats[tieBreakKind] - aStats[tieBreakKind];
    return aStats.matchesPlayed - bStats.matchesPlayed;
  }).slice(0, 3);
};
var getEuropeanGroup = (competition) => {
  if (competition.startsWith("CL_")) return "CL";
  if (competition.startsWith("EL_")) return "EL";
  if (competition.startsWith("CONF_")) return "CONF";
  return null;
};
var getEuropeanTopPlayers = (matchHistory, seasonNumber, group, statKind) => {
  const totals = /* @__PURE__ */ new Map();
  matchHistory.filter((entry) => entry.season === seasonNumber && getEuropeanGroup(entry.competition) === group).forEach((entry) => {
    entry.goals.filter((goal) => !goal.varDisallowed && !goal.isMiss).forEach((goal) => {
      const playerId = statKind === "goals" ? goal.playerId : goal.assistantId;
      if (!playerId) return;
      totals.set(playerId, (totals.get(playerId) ?? 0) + 1);
    });
  });
  return [...totals.entries()].filter(([, total]) => total > 0).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 1).map(([playerId]) => playerId);
};
var PlayerReputationGrowthService = {
  transferUpgradeDelta: (fromClubReputation, toClubReputation) => {
    const jump = Math.max(0, toClubReputation - fromClubReputation);
    if (jump <= 0) return 0;
    return Math.min(5, Math.max(1, Math.ceil(jump / 2)));
  },
  applyTransferUpgrade: (player, fromClubReputation, toClubReputation) => {
    const delta = PlayerReputationGrowthService.transferUpgradeDelta(fromClubReputation, toClubReputation);
    if (delta <= 0) return player;
    return {
      ...player,
      reputacja: clampReputation(getPlayerReputation(player) + delta)
    };
  },
  applySeasonEndUpdate: (playersMap, clubs, matchHistory, seasonNumber) => {
    const deltas = /* @__PURE__ */ new Map();
    const clubReputationById = new Map(clubs.map((club) => [club.id, club.reputation]));
    const fullyTrackedClubIds = new Set(
      clubs.filter((club) => ["L_PL_1", "L_PL_2", "L_PL_3"].includes(club.leagueId)).map((club) => club.id)
    );
    ["L_PL_1", "L_PL_2", "L_PL_3"].forEach((leagueId) => {
      const delta = getLeagueTopDelta(leagueId);
      if (delta <= 0) return;
      getTopLeaguePlayers(leagueId, clubs, playersMap, "goals").forEach((player) => addDelta(deltas, player.id, delta));
      getTopLeaguePlayers(leagueId, clubs, playersMap, "assists").forEach((player) => addDelta(deltas, player.id, delta));
    });
    Object.values(playersMap).flat().forEach((player) => {
      const averageRating = getAverageRating2(player);
      if (averageRating !== null && averageRating > 7.5) {
        addDelta(deltas, player.id, 1);
      }
    });
    getEuropeanTopPlayers(matchHistory, seasonNumber, "CL", "goals").forEach((playerId) => addDelta(deltas, playerId, 3));
    getEuropeanTopPlayers(matchHistory, seasonNumber, "EL", "goals").forEach((playerId) => addDelta(deltas, playerId, 2));
    getEuropeanTopPlayers(matchHistory, seasonNumber, "CONF", "goals").forEach((playerId) => addDelta(deltas, playerId, 2));
    getEuropeanTopPlayers(matchHistory, seasonNumber, "CL", "assists").forEach((playerId) => addDelta(deltas, playerId, 2));
    getEuropeanTopPlayers(matchHistory, seasonNumber, "EL", "assists").forEach((playerId) => addDelta(deltas, playerId, 1));
    getEuropeanTopPlayers(matchHistory, seasonNumber, "CONF", "assists").forEach((playerId) => addDelta(deltas, playerId, 1));
    return Object.fromEntries(
      Object.entries(playersMap).map(([clubId, squad]) => [
        clubId,
        squad.map((player) => {
          const averageRating = getAverageRating2(player);
          const usage = getSeasonUsage(player);
          const achievementGrowth = deltas.get(player.id) ?? 0;
          const exposureGrowth = getExposureGrowth(
            player,
            clubReputationById.get(clubId) ?? 1
          );
          const hasFullSeasonUsage = clubId === "FREE_AGENTS" || fullyTrackedClubIds.has(clubId);
          const decay = (hasFullSeasonUsage ? getInactivityDecay(usage.effectiveMinutes) : 0) + getWeakSeasonDecay(averageRating, usage.matches) + getAgeDecay(player, averageRating, usage.effectiveMinutes);
          const delta = Math.max(-6, Math.min(6, achievementGrowth + exposureGrowth - decay));
          if (delta === 0) return player;
          return {
            ...player,
            reputacja: clampReputation(getPlayerReputation(player) + delta)
          };
        })
      ])
    );
  }
};

// services/PlayerClubAdaptationService.ts
var DAY_MS2 = 864e5;
var MAX_ADAPTATION_PENALTY = 0.2;
var clamp10 = (value, min, max) => Math.max(min, Math.min(max, value));
var formatLocalDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
var toDateKey2 = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return formatLocalDateKey(/* @__PURE__ */ new Date());
  return formatLocalDateKey(date);
};
var hashString2 = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
var seededUnit2 = (seed) => hashString2(seed) / 4294967296;
var rollInteger = (seed, min, max) => min + Math.floor(seededUnit2(seed) * (max - min + 1));
var rollDurationDays = (seed) => {
  const bucket = seededUnit2(`${seed}:duration-bucket`);
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
  return Math.max(0, Math.floor((toDay - fromDay) / DAY_MS2));
};
var PlayerClubAdaptationService = {
  beginForClub(player, clubId, date) {
    if (!clubId || clubId === "FREE_AGENTS") {
      return { ...player, clubAdaptation: null };
    }
    const dateKey = toDateKey2(date);
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
    const dateKey = toDateKey2(date);
    const elapsedDays = getDayDifference(adaptation.lastUpdatedAt, dateKey);
    if (elapsedDays <= 0) return player;
    const gain = getBaseDailyGain(adaptation) * elapsedDays * getMoraleMultiplier(player.morale) * getInjuryMultiplier(player);
    return {
      ...player,
      clubAdaptation: {
        ...adaptation,
        level: clamp10(adaptation.level + gain, 0, 100),
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
    const matchGain = getBaseDailyGain(adaptation) * (clamp10(minutesPlayed, 0, 120) / 90) * getCompetitionMultiplier(competition) * getMoraleMultiplier(dailyUpdated.morale);
    return {
      ...dailyUpdated,
      clubAdaptation: {
        ...adaptation,
        level: clamp10(adaptation.level + matchGain, 0, 100)
      }
    };
  },
  applyMatchToPlayers(players, minutesByPlayerId, competition, date) {
    const nextPlayers = {};
    Object.entries(players).forEach(([clubId, squad]) => {
      nextPlayers[clubId] = squad.map((player) => {
        const minutes = minutesByPlayerId[player.id] ?? 0;
        return minutes > 0 ? this.applyMatchMinutes(player, minutes, competition, date) : player;
      });
    });
    return nextPlayers;
  },
  getLevel(player) {
    const adaptation = player.clubAdaptation;
    if (!adaptation || adaptation.clubId !== player.clubId) return 100;
    return clamp10(adaptation.level, 0, 100);
  },
  getEffectiveOverall(player, roleOverall) {
    const level = this.getLevel(player);
    const multiplier = 1 - MAX_ADAPTATION_PENALTY + MAX_ADAPTATION_PENALTY * (level / 100);
    return clamp10(roleOverall * multiplier, 1, 99);
  },
  buildMinutesByPlayerId(finalStartingXI, substitutions, totalMinutes, forcedExitMinutes = {}) {
    const safeTotal = clamp10(totalMinutes, 1, 120);
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
        clamp10(forcedExitMinutes[playerId] ?? safeTotal, startMinute, safeTotal)
      );
      minutesByPlayerId[playerId] = clamp10(exitMinute - startMinute, 0, safeTotal);
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

// services/AiClubTransferStrategyService.ts
var clamp11 = (value, min, max) => Math.min(max, Math.max(min, value));
var levelScore = {
  bardzo_niska: 3,
  niska: 6,
  przecietna: 10,
  wysoka: 14,
  bardzo_wysoka: 18
};
var getDirector = (club) => club.sportingDirector;
var getOwner = (club) => club.management?.owner;
var getCfo = (club) => club.management?.cfo;
var AiClubTransferStrategyService = {
  buildStrategy(club) {
    const director = getDirector(club);
    const owner = getOwner(club);
    const cfo = getCfo(club);
    const board = club.board;
    const ambition = director?.ambition ?? owner?.ambicja ?? levelScore[board?.ambicja ?? "przecietna"];
    const flexibility = director?.flexibility ?? 10;
    const financialDisciplineRaw = Math.max(
      director?.financialDiscipline ?? 10,
      cfo?.dyscyplinaFinansowa ?? 10,
      21 - levelScore[board?.chciwosc ?? "przecietna"]
    );
    const developmentVision = director?.developmentVision ?? 10;
    const footballKnowledge = director?.footballKnowledge ?? 10;
    const negotiation = director?.negotiation ?? 10;
    const generosity = owner?.hojnosc ?? levelScore[board?.hojnosc ?? "przecietna"];
    const ownerAmbition = owner?.ambicja ?? ambition;
    const patienceRaw = Math.max(owner?.cierpliwosc ?? 10, levelScore[board?.cierpliwosc ?? "przecietna"]);
    const financialDiscipline = clamp11(financialDisciplineRaw / 20, 0.2, 1);
    const ambitionScore = clamp11((ambition + ownerAmbition) / 40, 0.15, 1);
    const generosityScore = clamp11(generosity / 20, 0.1, 1);
    const knowledgeScore = clamp11(footballKnowledge / 20, 0.15, 1);
    const negotiationScore = clamp11(negotiation / 20, 0.15, 1);
    const patience = clamp11(patienceRaw / 20, 0.1, 1);
    const personality = director?.personality;
    let ageProfile = "BALANCED";
    if (personality === "TALENT_HUNTER" || developmentVision >= 15) ageProfile = "YOUTH";
    else if (personality === "ACCOUNTANT" || financialDisciplineRaw >= 16) ageProfile = "PRIME";
    else if (personality === "CONTROLLER" && ambition >= 14) ageProfile = "EXPERIENCED";
    const budgetAggression = clamp11(
      0.85 + ambitionScore * 0.22 + generosityScore * 0.16 + negotiationScore * 0.1 - financialDiscipline * 0.18,
      0.75,
      1.32
    );
    return {
      ageProfile,
      budgetAggression,
      maxOverpayMultiplier: clamp11(1.04 + ambitionScore * 0.22 + negotiationScore * 0.14 - financialDiscipline * 0.16, 0.95, 1.35),
      patience,
      panicBuyChance: clamp11(0.14 + ambitionScore * 0.16 - patience * 0.18, 0.02, 0.24),
      youthPreference: clamp11(developmentVision / 20 + (personality === "TALENT_HUNTER" ? 0.25 : 0), 0.15, 1.25),
      primePreference: clamp11(0.55 + knowledgeScore * 0.35 + financialDiscipline * 0.15, 0.2, 1.1),
      experiencePreference: clamp11(0.35 + ambitionScore * 0.3 + (personality === "CONTROLLER" ? 0.16 : 0), 0.1, 1),
      reputationPreference: clamp11(0.25 + ambitionScore * 0.4 + generosityScore * 0.15, 0.05, 1.05),
      financialDiscipline,
      protectYouth: developmentVision >= 14 || personality === "TALENT_HUNTER",
      sellVeterans: financialDisciplineRaw >= 14 || personality === "ACCOUNTANT"
    };
  },
  candidateScore(player, club, strategy, context = {}) {
    const talentGap = Math.max(0, (player.attributes?.talent ?? player.overallRating) - player.overallRating);
    const reputation = player.reputacja ?? 50;
    const ageScore = player.age <= 22 ? strategy.youthPreference * 8 : player.age <= 26 ? strategy.primePreference * 6 : player.age <= 30 ? strategy.primePreference * 4 : player.age <= 33 ? strategy.experiencePreference * 3 : -strategy.financialDiscipline * 5;
    const profileBonus = strategy.ageProfile === "YOUTH" && player.age <= 23 ? 5 : strategy.ageProfile === "PRIME" && player.age >= 24 && player.age <= 29 ? 4 : strategy.ageProfile === "EXPERIENCED" && player.age >= 29 && player.age <= 33 ? 3 : 0;
    const urgencyBonus = context.needUrgency === "CRITICAL" ? 5 : context.needUrgency === "HIGH" ? 3 : context.needUrgency === "LOW" ? -1 : 0;
    const bargainBonus = context.isTransferListed ? 3 * (1 - strategy.financialDiscipline * 0.25) : 0;
    const pricePenalty = context.askingPrice ? Math.max(0, context.askingPrice / Math.max(1, club.budget) - 0.25) * 18 * strategy.financialDiscipline : 0;
    return player.overallRating + talentGap * strategy.youthPreference * 0.35 + (reputation - 50) / 10 * strategy.reputationPreference + ageScore + profileBonus + urgencyBonus + bargainBonus - pricePenalty;
  },
  budgetCap(baseCap, strategy, context = {}) {
    const urgencyBoost = context.needUrgency === "CRITICAL" || context.isShortage ? 0.1 : context.needUrgency === "HIGH" ? 0.05 : 0;
    return clamp11(baseCap * strategy.budgetAggression + urgencyBoost, 0.2, 0.94);
  },
  shouldRelaxForPanic(strategy, seed, needUrgency) {
    if (needUrgency !== "HIGH" && needUrgency !== "CRITICAL") return false;
    const x = Math.sin(seed + 17) * 1e4;
    const roll = x - Math.floor(x);
    return roll < strategy.panicBuyChance;
  },
  outgoingScore(player, club, strategy) {
    const salaryPressure = player.annualSalary / Math.max(1, FinanceService.getFairMarketSalary(player.overallRating));
    const talentGap = Math.max(0, (player.attributes?.talent ?? player.overallRating) - player.overallRating);
    const youthProtection = strategy.protectYouth && player.age <= 23 ? talentGap * 0.55 + 5 : 0;
    const veteranPressure = strategy.sellVeterans && player.age >= 31 ? (player.age - 30) * 1.5 : 0;
    const reputationProtection = Math.max(0, (player.reputacja ?? 50) - 60) * strategy.reputationPreference * 0.12;
    return salaryPressure * 2.5 + veteranPressure + (player.age >= 30 ? strategy.financialDiscipline * 2 : 0) - youthProtection - reputationProtection - (club.sportingDirectorPolicy?.protectedPlayers.some((item) => item.playerId === player.id) ? 8 : 0) + (club.sportingDirectorPolicy?.sellCandidates.some((item) => item.playerId === player.id) ? 8 : 0);
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

// resources/static_db/names/pl_data.ts
var PL_MALE_FIRSTNAMES = [
  "Adam",
  "Adrian",
  "Alan",
  "Albert",
  "Aleks",
  "Aleksander",
  "Aleksy",
  "Amadeusz",
  "Andrzej",
  "Antoni",
  "Arkadiusz",
  "Artur",
  "Augustyn",
  "Bartek",
  "Bart\u0142omiej",
  "Bartosz",
  "Bazyli",
  "Beniamin",
  "B\u0142a\u017Cej",
  "Bogdan",
  "Boles\u0142aw",
  "Bonifacy",
  "Borys",
  "Bronis\u0142aw",
  "Bruno",
  "Cezary",
  "Cyprian",
  "Czes\u0142aw",
  "Damian",
  "Daniel",
  "Dariusz",
  "Dawid",
  "Denis",
  "Dionizy",
  "Dobromi\u0142",
  "Dominik",
  "Emil",
  "Eryk",
  "Euzebiusz",
  "Fabian",
  "Feliks",
  "Filip",
  "Florian",
  "Franciszek",
  "Fryderyk",
  "Gabriel",
  "Gerard",
  "Grzegorz",
  "Gustaw",
  "Henryk",
  "Hubert",
  "Hugo",
  "Igor",
  "Ignacy",
  "Ireneusz",
  "Iwo",
  "Izaak",
  "Jacek",
  "Jakub",
  "Jan",
  "Janusz",
  "Jaromir",
  "Jaros\u0142aw",
  "Jeremi",
  "Jerzy",
  "J\u0119drzej",
  "Joachim",
  "Jonasz",
  "J\xF3zef",
  "Julian",
  "Juliusz",
  "Justyn",
  "Kacper",
  "Kajetan",
  "Kamil",
  "Karol",
  "Kasper",
  "Klemens",
  "Konrad",
  "Kornel",
  "Korneliusz",
  "Krystian",
  "Krzysztof",
  "Ksawery",
  "Kuba",
  "Lech",
  "Leon",
  "Leonard",
  "Leszek",
  "Lucjan",
  "Ludwik",
  "\u0141ukasz",
  "Maciej",
  "Maksym",
  "Maksymilian",
  "Marcel",
  "Marceli",
  "Marcin",
  "Marek",
  "Mariusz",
  "Mateusz",
  "Maurycy",
  "Micha\u0142",
  "Mieczys\u0142aw",
  "Mieszko",
  "Miko\u0142aj",
  "Mi\u0142osz",
  "Natan",
  "Nataniel",
  "Nikodem",
  "Norbert",
  "Olaf",
  "Olgierd",
  "Oliwier",
  "Oskar",
  "Patryk",
  "Pawe\u0142",
  "Piotr",
  "Przemys\u0142aw",
  "Rados\u0142aw",
  "Radomi\u0142",
  "Rafa\u0142",
  "Remigiusz",
  "Robert",
  "Roch",
  "Roman",
  "Ryszard",
  "Sebastian",
  "Sergiusz",
  "Seweryn",
  "S\u0142awomir",
  "Stanis\u0142aw",
  "Stefan",
  "Sylwester",
  "Szymon",
  "Tadeusz",
  "Teodor",
  "Tobiasz",
  "Tomasz",
  "Tymon",
  "Tymoteusz",
  "Tytus",
  "Wac\u0142aw",
  "Waldemar",
  "Wawrzyniec",
  "Wiktor",
  "Wit",
  "Witold",
  "W\u0142adys\u0142aw",
  "W\u0142odzimierz",
  "Wojciech",
  "Zbigniew",
  "Zbyszko",
  "Zdzis\u0142aw",
  "Zenon",
  "Zygfryd",
  "Zygmunt",
  "\u017Belis\u0142aw"
];
var PL_MALE_LASTNAMES = [
  "Nowak",
  "Kowalski",
  "Wi\u015Bniewski",
  "W\xF3jcik",
  "Kowalczyk",
  "Kami\u0144ski",
  "Lewandowski",
  "Zieli\u0144ski",
  "Szyma\u0144ski",
  "Wo\u017Aniak",
  "D\u0105browski",
  "Koz\u0142owski",
  "Jankowski",
  "Mazur",
  "Wojciechowski",
  "Kwiatkowski",
  "Krawczyk",
  "Kaczmarek",
  "Piotrowski",
  "Grabowski",
  "Nowakowski",
  "Paw\u0142owski",
  "Michalski",
  "Kr\xF3l",
  "Wr\xF3bel",
  "Jab\u0142o\u0144ski",
  "Majewski",
  "Olszewski",
  "Jaworski",
  "Malinowski",
  "Pawlak",
  "Witkowski",
  "Walczak",
  "St\u0119pie\u0144",
  "G\xF3rski",
  "Rutkowski",
  "Michalak",
  "Sikora",
  "Baran",
  "Szewczyk",
  "Ostrowski",
  "Tomaszewski",
  "Pietrzak",
  "Marciniak",
  "Wr\xF3blewski",
  "Zalewski",
  "Jakubowski",
  "Jasi\u0144ski",
  "Zawadzki",
  "Sadowski",
  "B\u0105k",
  "Chmielewski",
  "W\u0142odarczyk",
  "Borkowski",
  "Czarnecki",
  "Sawicki",
  "Soko\u0142owski",
  "Urba\u0144ski",
  "Kubiak",
  "Maciejewski",
  "Szczepa\u0144ski",
  "Kucharski",
  "Wilk",
  "Kali\u0144ski",
  "Wysocki",
  "Adamski",
  "Sobczak",
  "Czerwi\u0144ski",
  "Andrzejewski",
  "Cie\u015Blak",
  "G\u0142owacki",
  "Zakrzewski",
  "Ko\u0142odziej",
  "Sikorski",
  "Krajewski",
  "Zaj\u0105c",
  "Szulc",
  "Baranowski",
  "Laskowski",
  "Brzezi\u0144ski",
  "Makowski",
  "Przybylski",
  "Duda",
  "Pawlik",
  "Kruk",
  "J\xF3\u017Awiak",
  "Kurek",
  "Olszak",
  "Mr\xF3z",
  "Ka\u017Amierczak",
  "Sobolewski",
  "Kaczmarczyk",
  "Zi\xF3\u0142kowski",
  "Markowski",
  "Tomczak",
  "Weso\u0142owski",
  "Kurowski",
  "Krupa",
  "Lis",
  "Mazurek",
  "Klimczak",
  "Wasilewski",
  "Zawistowski",
  "Konieczny",
  "Fr\u0105ckowiak",
  "\u017Bukowski",
  "Doma\u0144ski",
  "Or\u0142owski",
  "Wieczorek",
  "M\u0142ynarczyk",
  "Bednarek",
  "Bielecki",
  "Rogowski",
  "Kowalewski",
  "Sowa",
  "Czajkowski",
  "Gajewski",
  "Lipski",
  "Zarzycki",
  "Szymczak",
  "Cichy",
  "Janicki",
  "Leszczy\u0144ski",
  "Kowal",
  "Paj\u0105k",
  "Wojtas",
  "Kozak",
  "Piotrowicz",
  "Stankiewicz",
  "K\u0119dzierski",
  "Dziedzic",
  "Kuczy\u0144ski",
  "B\u0142aszczyk",
  "Ratajczak",
  "Chojnacki",
  "K\u0142os",
  "Kubicki",
  "Wojtkowiak",
  "Romanowski",
  "Kowalik",
  "Kaczy\u0144ski",
  "Witek",
  "Kozio\u0142",
  "Pietrzyk",
  "Janik",
  "Cie\u015Blik",
  "Dudek",
  "Koprowski",
  "Grzelak",
  "Nowicki",
  "Mroczek",
  "Sroka",
  "Wojtczak",
  "Kozakiewicz",
  "Wierzbicki",
  "Kaczor",
  "Banach",
  "Bara\u0144ski",
  "Bielecki",
  "B\u0142aszczak",
  "Bobrowski",
  "Borowski",
  "Brzozowski",
  "Budzy\u0144ski",
  "Cebula",
  "Chmura",
  "Cicho\u0144",
  "Ciesielski",
  "Cybulski",
  "Dobrowolski",
  "Domaga\u0142a",
  "Dudek",
  "Fabisiak",
  "Falkowski",
  "G\u0105sior",
  "Gajewski",
  "Graczyk",
  "Gruszczy\u0144ski",
  "Grzyb",
  "Guzik",
  "Hajduk",
  "J\u0119drzejczak",
  "J\u0119drzejewski",
  "Jurkiewicz",
  "Kaleta",
  "Karpi\u0144ski",
  "Kasprzak",
  "Kaszuba",
  "Kawecki",
  "K\u0119dziora",
  "Kie\u0142basa",
  "Kmiecik",
  "Ko\u0142akowski",
  "Komorowski",
  "Kopczy\u0144ski",
  "Korzeniowski",
  "Kosowski",
  "Kostrzewa",
  "Kot",
  "Kotowski",
  "Krawiec",
  "Krzemi\u0144ski",
  "Kujawa",
  "Kujawski",
  "Kulig",
  "Lach",
  "Lenart",
  "Lisiak",
  "Lisiecki",
  "\u0141api\u0144ski",
  "\u0141uczak",
  "\u0141ukasiewicz",
  "Madej",
  "Madejski",
  "Majchrzak",
  "Marczak",
  "Markiewicz",
  "Marsza\u0142ek",
  "Marzec",
  "Mas\u0142owski",
  "Matusiak",
  "Matuszewski",
  "Matysiak",
  "Mazurkiewicz",
  "Michalik",
  "Mierzejewski",
  "Mika",
  "Miko\u0142ajczak",
  "Miko\u0142ajczyk",
  "Milewski",
  "Mi\u0142ek",
  "Modzelewski",
  "Morawski",
  "Murawski",
  "Musia\u0142",
  "Muszy\u0144ski",
  "Nadolski",
  "Noga",
  "Olejniczak",
  "Olejnik",
  "Orzechowski",
  "Owczarek",
  "Paciorek",
  "Panek",
  "Paszkiewicz",
  "Pawlicki",
  "Pawlikowski",
  "P\u0119kala",
  "Pi\u0105tek",
  "Piekarski",
  "Pieczy\u0144ski",
  "Pietras",
  "Pilch",
  "Piwowarczyk",
  "Podg\xF3rski",
  "Polak",
  "Pola\u0144ski",
  "Pop\u0142awski",
  "Por\u0119bski",
  "Prus",
  "Przyby\u0142a",
  "Pucha\u0142a",
  "Pyka",
  "Raczy\u0144ski",
  "Radomski",
  "Rakowski",
  "Rataj",
  "Reczek",
  "Rogala",
  "Rogalski",
  "Rojek",
  "Roszak",
  "Rudnicki",
  "Rybak",
  "Rybarczyk",
  "Rybi\u0144ski",
  "Rzepka",
  "Sajdak",
  "Salamon",
  "Sasin",
  "Serafin",
  "Sidor",
  "Sienkiewicz",
  "Skiba",
  "Skowron",
  "Skrzypczak",
  "Skrzypek",
  "S\u0142awik",
  "S\u0142o\u0144ski",
  "Smoli\u0144ski",
  "Sobczyk",
  "Sobiech",
  "Sochacki",
  "Solecki",
  "Sowi\u0144ski",
  "Stachowiak",
  "Stachura",
  "Stanek",
  "Staszewski",
  "Sta\u0144czyk",
  "Stolarski",
  "Strzelecki",
  "Strzelczyk",
  "Suchodolski",
  "Surma",
  "Szablewski",
  "Szadkowski",
  "Szarek",
  "Szcze\u015Bniak",
  "Szczotka",
  "Szczygie\u0142",
  "Szpak",
  "Szuba",
  "Szyd\u0142owski",
  "\u015Aliwa",
  "\u015Aliwi\u0144ski",
  "\u015Awi\u0105tek",
  "\u015Awiderski",
  "Taras",
  "Tatarek",
  "Tokarski",
  "Tomczyk",
  "Tracz",
  "Trzci\u0144ski",
  "Turowski",
  "Twardowski",
  "Urbanek",
  "Walkowiak",
  "Wcis\u0142o",
  "Wicher",
  "Wilczek",
  "Wilczy\u0144ski",
  "Wnuk",
  "W\xF3jcicki",
  "Wrzesi\u0144ski",
  "Zaborowski",
  "Zag\xF3rski",
  "Zaremba",
  "Zborowski",
  "Zi\u0119ba",
  "Zi\u0119tek",
  "Zych",
  "\u017Bak",
  "\u017Bbikowski",
  "\u017Bebrowski",
  "\u017Belazny",
  "\u017Bmuda",
  "\u017Buk",
  "\u017Burawski",
  "\u017Burek"
];

// resources/static_db/names/balkan_data.ts
var BALKAN_MALE_FIRSTNAMES = [
  "Luka",
  "Marko",
  "Ivan",
  "Nikola",
  "Milo\u0161",
  "Dragan",
  "Stefan",
  "Damir",
  "Zoran",
  "Darko",
  "Vedran",
  "Ante",
  "Josip",
  "Tomislav",
  "Filip",
  "Mateo",
  "Dominik",
  "Petar",
  "Aleksandar",
  "Dejan",
  "Mirko",
  "Slobodan",
  "Goran",
  "Nenad",
  "Bojan",
  "Milan",
  "Viktor",
  "Kristijan",
  "Andrej",
  "Mihael",
  "Alen",
  "Emir",
  "Amar",
  "Haris",
  "Armin",
  "Edin",
  "Admir",
  "Besmir",
  "Ilir",
  "Arben",
  "Sokol",
  "Valon",
  "Liridon",
  "Mergim",
  "Faton",
  "Blendi",
  "Elvin",
  "Arijan",
  "Ezgjan",
  "Visar",
  "Ahmed",
  "Daris",
  "Davud",
  "Adin",
  "Hamza",
  "Ali",
  "Harun",
  "Eman",
  "Ajnur",
  "Imran",
  "Tarik",
  "Emin",
  "D\u017Ean",
  "Omar",
  "Ajdin",
  "Muhamed",
  "Vedad",
  "Bilal",
  "Benjamin",
  "Arslan",
  "Mak",
  "Faris",
  "Danin",
  "Kerim",
  "Jusuf",
  "Mahir",
  "Rejjan",
  "Fatih",
  "Mirza",
  "Rocco",
  "Simon",
  "Joseph",
  "David",
  "Jakov",
  "Toma",
  "Niko",
  "Vasilije",
  "Vuka\u0161in",
  "Vuk",
  "Vukan",
  "Bogdan",
  "Lazar",
  "Aleksa",
  "Strahinja",
  "Uro\u0161",
  "Andrija",
  "Jovan",
  "\u0110or\u0111e",
  "Kosta",
  "Sava",
  "Teodor",
  "Vojin"
];
var BALKAN_MALE_LASTNAMES = [
  "Kova\u010Di\u0107",
  "Petrovi\u0107",
  "Jovanovi\u0107",
  "Popovi\u0107",
  "Horvat",
  "Babi\u0107",
  "Vukovi\u0107",
  "Radi\u0107",
  "\u0160ari\u0107",
  "Peri\u0107",
  "Mati\u0107",
  "Pavlovi\u0107",
  "Markovi\u0107",
  "Ili\u0107",
  "\u0110uri\u0107",
  "Kova\u010Devi\u0107",
  "Nikoli\u0107",
  "Stojanovi\u0107",
  "Milo\u0161evi\u0107",
  "Luki\u0107",
  "Tomi\u0107",
  "Bla\u017Eevi\u0107",
  "\u010Covi\u0107",
  "Hod\u017Ei\u0107",
  "Halilovi\u0107",
  "Ahmetovi\u0107",
  "Muji\u0107",
  "Deli\u0107",
  "\u0160i\u0161i\u0107",
  "Berisha",
  "Krasniqi",
  "Gashi",
  "Tahiri",
  "Hyseni",
  "Rexhepi",
  "Jashari",
  "Aliu",
  "Veliu",
  "Demiri",
  "Osmani",
  "Ristovski",
  "Trajkovski",
  "Pandevski",
  "Spirovski",
  "Stojkovi\u0107",
  "Marjanovi\u0107",
  "Dragi\u0107",
  "Vuli\u0107",
  "Zori\u0107",
  "\u0110or\u0111evi\u0107",
  "Stankovi\u0107",
  "Ivanovi\u0107",
  "Kne\u017Eevi\u0107",
  "Filipovi\u0107",
  "Juri\u0107",
  "Anti\u0107",
  "Bojani\u0107",
  "Cvetkovi\u0107",
  "Dimitrijevi\u0107",
  "Grgi\u0107",
  "Had\u017Ei\u0107",
  "Ibrahimovi\u0107",
  "Hasanovi\u0107",
  "Mehmedovi\u0107",
  "Kelmendi",
  "Shkreli",
  "Mustafa",
  "Hoxha",
  "Prifti",
  "Dervishi",
  "Ivanov",
  "Georgiev",
  "Dimitrov",
  "Popov",
  "Hristov",
  "Angelov",
  "Vasilev",
  "Petrov",
  "Iliev",
  "Todorov",
  "Marinov",
  "Popescu",
  "Ionescu",
  "Constantinescu",
  "Georgescu",
  "Radu",
  "Dumitrescu",
  "Novak",
  "Kova\u010D",
  "Zupan",
  "Krajnc",
  "Ho\u010Devar",
  "Begi\u0107",
  "Suba\u0161i\u0107",
  "Zlatar",
  "Kolar",
  "Vlah",
  "Mirkovi\u0107"
];

// resources/static_db/names/czsk_data.ts
var CZSK_MALE_FIRSTNAMES = [
  "Tom\xE1\u0161",
  "Jakub",
  "Jan",
  "Luk\xE1\u0161",
  "Ond\u0159ej",
  "Adam",
  "Mat\u011Bj",
  "Filip",
  "Petr",
  "Ji\u0159\xED",
  "Martin",
  "David",
  "Michal",
  "Pavel",
  "Marek",
  "V\xE1clav",
  "Josef",
  "Daniel",
  "Patrik",
  "Dominik",
  "\u0160t\u011Bp\xE1n",
  "Roman",
  "Milan",
  "Franti\u0161ek",
  "Karel",
  "Vojt\u011Bch",
  "Radim",
  "Zden\u011Bk",
  "Miroslav",
  "Jaroslav",
  "Lubo\u0161",
  "Radek",
  "Ale\u0161",
  "Vladim\xEDr",
  "Richard",
  "Samuel",
  "Kristi\xE1n",
  "Erik",
  "Denis",
  "Peter",
  "Juraj",
  "Branislav",
  "Matej",
  "Stanislav",
  "Jozef",
  "Ladislav",
  "Du\u0161an",
  "Ivan",
  "Tibor",
  "Oliver",
  "Mat\xFA\u0161",
  "Samuel",
  "Michal",
  "Tom\xE1\u0161",
  "Jakub",
  "Adam",
  "Martin",
  "Luk\xE1\u0161",
  "Filip",
  "Matej",
  "Dominik",
  "Richard",
  "Nikolas",
  "Tom\xE1\u0161",
  "Alex",
  "Marko",
  "Timotej",
  "J\xE1n",
  "Miroslav",
  "Jozef",
  "Vladim\xEDr",
  "Milan",
  "Peter",
  "Andrej",
  "Marek",
  "Daniel",
  "R\xF3bert",
  "Patrik",
  "Martin",
  "Michal",
  "Luk\xE1\u0161",
  "Tom\xE1\u0161",
  "Jakub",
  "Adam",
  "Mat\u011Bj",
  "Filip",
  "Ond\u0159ej",
  "Vojt\u011Bch",
  "Ji\u0159\xED",
  "Petr",
  "Josef",
  "David",
  "Michal",
  "Pavel",
  "V\xE1clav",
  "Roman",
  "Milan",
  "Franti\u0161ek",
  "Karel",
  "Radim",
  "Zden\u011Bk",
  "Miroslav",
  "Jaroslav",
  "Lubo\u0161"
];
var CZSK_MALE_LASTNAMES = [
  "Nov\xE1k",
  "Svoboda",
  "Novotn\xFD",
  "Dvo\u0159\xE1k",
  "\u010Cern\xFD",
  "Proch\xE1zka",
  "Ku\u010Dera",
  "Vesel\xFD",
  "Horv\xE1th",
  "Kov\xE1\u010D",
  "N\u011Bmec",
  "Pokorn\xFD",
  "H\xE1jek",
  "Jel\xEDnek",
  "Kr\xE1l",
  "R\u016F\u017Ei\u010Dka",
  "Bene\u0161",
  "Fiala",
  "Sedl\xE1\u010Dek",
  "Dole\u017Eal",
  "Zeman",
  "Kol\xE1\u0159",
  "Navr\xE1til",
  "\u010Cerm\xE1k",
  "Va\u0161\xED\u010Dek",
  "Urban",
  "Van\u011Bk",
  "Barto\u0161",
  "Posp\xED\u0161il",
  "Kopeck\xFD",
  "Mal\xFD",
  "\u0158\xEDha",
  "Bla\u017Eek",
  "K\u0159\xED\u017E",
  "Toman",
  "M\xE1lek",
  "Pol\xE1k",
  "\u0160imek",
  "Bar\xE1k",
  "Soukup",
  "Vacek",
  "Hru\u0161ka",
  "Strnad",
  "Moravec",
  "Valenta",
  "Varga",
  "Bal\xE1\u017E",
  "Moln\xE1r",
  "Hrn\u010D\xE1r",
  "Kov\xE1\u010Dik",
  "Szab\xF3",
  "Oravec",
  "Hud\xE1k",
  "Kov\xE1\u010D",
  "Hal\xE1sz",
  "T\xF3th",
  "Nagy",
  "Kiss",
  "Szabo",
  "Horv\xE1th",
  "Varga",
  "Bal\xE1\u017E",
  "Moln\xE1r",
  "Kov\xE1\u010Dik",
  "Kov\xE1\u010D",
  "Farkas",
  "Luk\xE1\u010D",
  "Hlav\xE1\u010D",
  "Kopeck\xFD",
  "\u0160vec",
  "Kov\xE1\u0159",
  "Zahradn\xEDk",
  "\u0160t\u011Bp\xE1nek",
  "Vl\u010Dek",
  "Kadlec",
  "\u0160ulc",
  "Musil",
  "\u0160im\xE1nek",
  "Hru\u0161ka",
  "Dudek",
  "S\xFDkora",
  "Havel",
  "Hol\xEDk",
  "\u0160pa\u010Dek",
  "Dvo\u0159\xE1\u010Dek",
  "V\xE1vra",
  "Kub\xED\u010Dek",
  "Pavl\xED\u010Dek",
  "\u0160t\u011Bp\xE1n",
  "\u010Cech",
  "Vondr\xE1\u010Dek",
  "Bure\u0161",
  "Mach",
  "\u010C\xED\u017Eek",
  "B\xEDlek",
  "Kov\xE1\u0159\xEDk",
  "\u0160t\u011Bp\xE1nek",
  "Vl\u010Dek",
  "Kadlec",
  "\u0160vec",
  "Kov\xE1\u0159"
];

// resources/static_db/names/ssa_data.ts
var SSA_MALE_FIRSTNAMES = [
  "Kwame",
  "Kofi",
  "Yao",
  "Ibrahim",
  "Mohammed",
  "Abdoulaye",
  "Moussa",
  "Amadou",
  "Sekou",
  "Ousmane",
  "Chukwuemeka",
  "Olumide",
  "Tunde",
  "Adebayo",
  "Chidera",
  "Siphiwe",
  "Thabo",
  "Lerato",
  "Katlego",
  "Themba",
  "Bongani",
  "Sibusiso",
  "Mpho",
  "Tumelo",
  "Ayanda",
  "Njabulo",
  "Khalid",
  "Youssef",
  "Jean-Pierre",
  "Kalusha",
  "Mohamed",
  "Ahmed",
  "Jean",
  "Joseph",
  "David",
  "John",
  "Michael",
  "Samuel",
  "Daniel",
  "Emmanuel",
  "Paul",
  "Peter",
  "James",
  "Isaac",
  "Abraham",
  "Jacob",
  "Joshua",
  "Benjamin",
  "Matthew",
  "Mark",
  "Luke",
  "Thomas",
  "Simon",
  "Andrew",
  "Philip",
  "Stephen",
  "Francis",
  "Patrick",
  "Anthony",
  "Charles",
  "George",
  "William",
  "Henry",
  "Edward",
  "Victor",
  "Felix",
  "Bernard",
  "Christopher",
  "Nicholas",
  "Raphael",
  "Gabriel",
  "Michael",
  "Omar",
  "Ali",
  "Hassan",
  "Yusuf",
  "Abubakar",
  "Haruna",
  "Sani",
  "Musa",
  "Adamu",
  "Bello",
  "Usman",
  "Idris",
  "Suleiman",
  "Aminu",
  "Chinedu",
  "Chukwudi",
  "Obinna",
  "Emeka",
  "Oluwaseun",
  "Babatunde",
  "Taiwo",
  "Keita",
  "Diallo",
  "Camara",
  "Ndiaye",
  "Mensah",
  "Osei"
];
var SSA_MALE_LASTNAMES = [
  "Traor\xE9",
  "Konat\xE9",
  "Diarra",
  "Coulibaly",
  "Camara",
  "Tour\xE9",
  "Keita",
  "Diallo",
  "Bah",
  "Sow",
  "Ndiaye",
  "Adeyemi",
  "Okafor",
  "Eze",
  "Chukwuebuka",
  "Mokoena",
  "Zungu",
  "Zwane",
  "Shabangu",
  "Nkosi",
  "Dlamini",
  "Mahlangu",
  "Ndlovu",
  "Khoza",
  "Buthelezi",
  "Mensah",
  "Boateng",
  "Appiah",
  "Ayew",
  "Banda",
  "Mwangi",
  "Ochieng",
  "Otieno",
  "Kiprop",
  "Mutai",
  "Kimani",
  "Omondi",
  "Wanjala",
  "Ibrahim",
  "Mohamed",
  "Musa",
  "Abdi",
  "Hassan",
  "Ali",
  "Ahmed",
  "Tesfaye",
  "Kebede",
  "Alemu",
  "Getachew",
  "Yohannes",
  "Bekele",
  "Assefa",
  "Mensah",
  "Osei",
  "Acheampong",
  "Owusu",
  "Agyemang",
  "Asante",
  "Yeboah",
  "Adjei",
  "Opoku",
  "Amoah",
  "Nkrumah",
  "Okonkwo",
  "Okafor",
  "Eze",
  "Adebayo",
  "Afolabi",
  "Obi",
  "Ibrahim",
  "Sani",
  "Yusuf",
  "Abubakar",
  "Lawal",
  "Bello",
  "Usman",
  "Mohammed",
  "Adamu",
  "Rakotomalala",
  "Randriamanantsoa",
  "Andriantsitohaina",
  "Rakotoarivony",
  "Rakoto",
  "Nkurunziza",
  "Manirakiza",
  "Habimana",
  "Uwimana",
  "Ndayishimiye",
  "Moyo",
  "Sibanda",
  "Ncube",
  "Maphosa",
  "Mudzonga",
  "Chigumbura"
];

// resources/static_db/names/iberia_data.ts
var IBERIA_MALE_FIRSTNAMES = [
  "Hugo",
  "Mateo",
  "Mart\xEDn",
  "Leo",
  "Lucas",
  "Manuel",
  "Alejandro",
  "Pablo",
  "Daniel",
  "\xC1lvaro",
  "Enzo",
  "Mario",
  "Adri\xE1n",
  "Diego",
  "Thiago",
  "Bruno",
  "Oliver",
  "David",
  "Alex",
  "Marco",
  "Gonzalo",
  "Marcos",
  "Nicol\xE1s",
  "Antonio",
  "Izan",
  "Miguel",
  "Javier",
  "Luca",
  "Liam",
  "Gael",
  "Marc",
  "Dylan",
  "Juan",
  "\xC1ngel",
  "Carlos",
  "Jos\xE9",
  "Gabriel",
  "Sergio",
  "Eric",
  "Jorge",
  "Dar\xEDo",
  "Adam",
  "Samuel",
  "H\xE9ctor",
  "Rodrigo",
  "Iker",
  "Pau",
  "Jes\xFAs",
  "Guillermo",
  "Jaime",
  "Luis",
  "Ian",
  "Francisco",
  "Noah",
  "Aaron",
  "V\xEDctor",
  "Mohamed",
  "Rafael",
  "Francisco",
  "Louren\xE7o",
  "Tom\xE1s",
  "Vicente",
  "Jo\xE3o",
  "Duarte",
  "Afonso",
  "Gabriel",
  "Miguel",
  "Santiago",
  "Rodrigo",
  "Martim",
  "Gon\xE7alo",
  "Pedro",
  "Diogo",
  "Rafael",
  "Tom\xE1s",
  "Afonso",
  "Rodrigo",
  "Jo\xE3o",
  "Miguel",
  "Gon\xE7alo",
  "Bernardo",
  "Salvador",
  "Teodoro",
  "Vicente",
  "Andr\xE9",
  "Tiago",
  "Henrique",
  "Leonardo",
  "Guilherme",
  "Mateus",
  "Daniel",
  "David",
  "Ant\xF3nio",
  "Eduardo",
  "Filipe",
  "Jorge",
  "Lu\xEDs",
  "Nuno",
  "Rui",
  "V\xEDtor"
];
var IBERIA_MALE_LASTNAMES = [
  "Garc\xEDa",
  "Rodr\xEDguez",
  "Gonz\xE1lez",
  "Fern\xE1ndez",
  "L\xF3pez",
  "Mart\xEDnez",
  "S\xE1nchez",
  "P\xE9rez",
  "G\xF3mez",
  "Jim\xE9nez",
  "Ruiz",
  "Hern\xE1ndez",
  "D\xEDaz",
  "Moreno",
  "\xC1lvarez",
  "Mu\xF1oz",
  "Romero",
  "Alonso",
  "Guti\xE9rrez",
  "Navarro",
  "Torres",
  "Dom\xEDnguez",
  "V\xE1zquez",
  "Ramos",
  "Gil",
  "Ram\xEDrez",
  "Serrano",
  "Blanco",
  "Molina",
  "Morales",
  "Su\xE1rez",
  "Ortega",
  "Delgado",
  "Castro",
  "Ortiz",
  "Rubio",
  "Mar\xEDn",
  "N\xFA\xF1ez",
  "Medina",
  "Iglesias",
  "Cortes",
  "Castillo",
  "Santos",
  "Silva",
  "Ferreira",
  "Pereira",
  "Costa",
  "Rodrigues",
  "Oliveira",
  "Alves",
  "Moreira",
  "Sousa",
  "Carvalho",
  "Mendes",
  "Nogueira",
  "Vieira",
  "Lopes",
  "Soares",
  "Fernandes",
  "Martins",
  "Gon\xE7alves",
  "Ribeiro",
  "Dias",
  "Rocha",
  "Pinto",
  "Cardoso",
  "Teixeira",
  "Correia",
  "Monteiro",
  "Ara\xFAjo",
  "Cunha",
  "Barbosa",
  "Tavares",
  "Freitas",
  "Melo",
  "Coelho",
  "Pires",
  "Cruz",
  "Nunes",
  "Macedo",
  "Magalh\xE3es",
  "Reis",
  "Figueiredo",
  "Campos",
  "Andrade",
  "Fonseca",
  "Marques",
  "Miranda",
  "Vaz",
  "Leite",
  "Batista",
  "Faria",
  "Henriques",
  "Machado",
  "Antunes",
  "Baptista",
  "Coutinho",
  "Gomes",
  "Moura"
];

// resources/static_db/names/scandinavia_data.ts
var SCANDINAVIA_MALE_LASTNAMES = [
  "Hansen",
  "Johansen",
  "Olsen",
  "Larsen",
  "Andersen",
  "Nielsen",
  "Pedersen",
  "Nilsson",
  "Eriksson",
  "Karlsson",
  "Larsson",
  "Olsson",
  "Persson",
  "Svensson",
  "Gustafsson",
  "Berg",
  "J\xF8rgensen",
  "Kristiansen",
  "Jensen",
  "Mogensen",
  "Poulsen",
  "Mortensen",
  "Christiansen",
  "Thomsen",
  "Kj\xE6r",
  "Dahl",
  "Holm",
  "Vestergaard",
  "M\xF8ller",
  "Jakobsen",
  "Petersen",
  "Johansson",
  "Andersson",
  "Lindberg",
  "Lindstr\xF6m",
  "Lindgren",
  "Lund",
  "Hansson",
  "Forsberg",
  "Danielsson",
  "Jonsson",
  "H\xE5kansson",
  "Fredriksson",
  "Bj\xF6rk",
  "Nystr\xF6m",
  "Olofsson",
  "Samuelsson",
  "Bengtsson",
  "Axelsson",
  "Wikstr\xF6m",
  "Haaland",
  "\xD8degaard",
  "Solberg",
  "Haugen",
  "Johnsen",
  "Karlsen",
  "Eide",
  "Bakken",
  "Halvorsen",
  "Eriksen",
  "Henriksen",
  "Mathisen",
  "Andreassen",
  "Paulsen",
  "Moen",
  "Gundersen",
  "Evensen",
  "Str\xF8m",
  "Lie",
  "Thorsen",
  "Rasmussen",
  "Jenssen",
  "Nilsen",
  "S\xF8rensen",
  "Jeppesen",
  "Villadsen",
  "Lauridsen",
  "Dinesen",
  "Br\xF8ndum",
  "Kjeldsen",
  "Toft",
  "Bjerregaard",
  "Fisker",
  "Dam",
  "Skov",
  "Krag",
  "Frost",
  "Vinther",
  "Thygesen",
  "Busk",
  "Lassen",
  "Hedegaard",
  "Gregersen",
  "Bay",
  "Due",
  "Elkj\xE6r",
  "H\xF8j",
  "Lundgaard",
  "Rosendal",
  "Skaarup",
  "Wulff"
];
var SCANDINAVIA_MALE_FIRSTNAMES = [
  "Emil",
  "Lucas",
  "William",
  "Oliver",
  "Noah",
  "Elias",
  "Oscar",
  "Victor",
  "Alexander",
  "Magnus",
  "Erik",
  "Rasmus",
  "Kasper",
  "Jakob",
  "Mads",
  "Jonas",
  "Martin",
  "Andreas",
  "Frederik",
  "Isak",
  "Liam",
  "Matheo",
  "Theodor",
  "Hugo",
  "Adam",
  "August",
  "Nils",
  "Leo",
  "Otto",
  "Alfred",
  "Carl",
  "Axel",
  "Arvid",
  "Malte",
  "Olle",
  "Sigge",
  "Hjalmar",
  "Noah",
  "Liam",
  "Johannes",
  "Filip",
  "Anton",
  "Elliot",
  "Arthur",
  "Ludvig",
  "Felix",
  "Vincent",
  "Benjamin",
  "Matias",
  "Oskar",
  "Theo",
  "Mohammad",
  "Harald",
  "Henrik",
  "Sander",
  "Olav",
  "Tor",
  "Bj\xF8rn",
  "Per",
  "Jan",
  "Lars",
  "Anders",
  "Johan",
  "Peter",
  "Daniel",
  "Mikael",
  "Thomas",
  "Christian",
  "S\xF8ren",
  "Jens",
  "Niels",
  "Morten",
  "Henning",
  "Kjeld",
  "Bent",
  "Leif",
  "Gunnar",
  "Sigurd",
  "Einar",
  "Knut",
  "Arne",
  "Sven",
  "Ingvar",
  "Rune",
  "Vidar",
  "Thor",
  "H\xE5kon",
  "Trygve",
  "Roar",
  "Geir",
  "Stian",
  "Espen",
  "J\xF8rgen",
  "Kristian",
  "Petter",
  "Ivar",
  "Dag",
  "Even",
  "Joakim",
  "Nikolai",
  "Sebastian",
  "Tobias",
  "Valdemar"
];

// resources/static_db/names/swedish_data.ts
var SWEDISH_MALE_FIRSTNAMES = [
  "Noah",
  "William",
  "Hugo",
  "Liam",
  "Adam",
  "August",
  "Nils",
  "Leo",
  "Oliver",
  "Otto",
  "Sam",
  "Alfred",
  "Elias",
  "Lucas",
  "Alexander",
  "Emil",
  "Oscar",
  "Filip",
  "Axel",
  "Benjamin",
  "Theo",
  "Charlie",
  "Max",
  "Gabriel",
  "Isaac",
  "Leon",
  "Arvid",
  "Viggo",
  "Sebastian",
  "Milton",
  "Casper",
  "Viktor",
  "Henry",
  "Elliot",
  "Alvin",
  "Samuel",
  "Adrian",
  "Ludvig",
  "Erik",
  "Anton",
  "Felix",
  "Linus",
  "Simon",
  "Theodor",
  "Malte",
  "Gustav",
  "Oskar",
  "Albin",
  "Sixten",
  "Ebbe",
  "Frans",
  "Hjalmar",
  "Ivar",
  "Kasper",
  "Loke",
  "Melker",
  "Rasmus",
  "Sigge",
  "Tor",
  "Wilmer",
  "Anders",
  "Johan",
  "Lars",
  "Mikael",
  "Peter",
  "Daniel",
  "Jan",
  "Per",
  "Fredrik",
  "Henrik",
  "Magnus",
  "Bj\xF6rn",
  "Karl",
  "Stefan",
  "Thomas",
  "Andreas",
  "Jonas",
  "Mattias",
  "Niklas",
  "Patrik",
  "Robin",
  "Tobias",
  "Christian",
  "David",
  "Jonathan",
  "Marcus",
  "Martin",
  "Robert",
  "Sebastian",
  "Victor",
  "Emmanuel",
  "Isak",
  "Jakob",
  "Joel",
  "Kevin",
  "Liam",
  "Lucas",
  "Matteo",
  "Noah",
  "Oliver",
  "Philip",
  "Rasmus",
  "Samuel",
  "Tim",
  "Vincent",
  "Wilhelm",
  "\xC5ke",
  "Arne",
  "Bengt",
  "Bo",
  "Claes",
  "Elof",
  "Gunnar",
  "Hannes",
  "Ingvar",
  "Jesper",
  "Kjell",
  "Leif",
  "Mats",
  "Nils",
  "Olof",
  "Pelle",
  "Quintus",
  "Ragnar",
  "Staffan",
  "Tomas",
  "Ulf",
  "Valdemar",
  "Xavier",
  "Yngve",
  "Zacharias",
  "Algot",
  "Birger",
  "Dag",
  "Edvin",
  "Folke",
  "Greger",
  "Harald",
  "Ivar",
  "Joakim",
  "Kristian",
  "Lennart",
  "Morgan",
  "Nicklas",
  "Oskar",
  "Pontus",
  "Rikard",
  "Stig",
  "Torbj\xF6rn",
  "Urban",
  "Ville",
  "Wilfred",
  "Xander",
  "Yngvar",
  "Zlatan"
];
var SWEDISH_MALE_LASTNAMES = [
  "Andersson",
  "Johansson",
  "Karlsson",
  "Nilsson",
  "Eriksson",
  "Larsson",
  "Olsson",
  "Persson",
  "Svensson",
  "Gustafsson",
  "Pettersson",
  "Jonsson",
  "Jansson",
  "Hansson",
  "Bengtsson",
  "Carlsson",
  "Lindberg",
  "Magnusson",
  "Lindstr\xF6m",
  "Berg",
  "Axelsson",
  "Bergstr\xF6m",
  "Nilsson",
  "Fredriksson",
  "Sandberg",
  "Sj\xF6berg",
  "Lindgren",
  "Eriksson",
  "Forsberg",
  "Bergman",
  "Holm",
  "Lundberg",
  "Engstr\xF6m",
  "Lindqvist",
  "H\xE5kansson",
  "Danielsson",
  "Eklund",
  "Lundgren",
  "Bj\xF6rk",
  "Bergqvist",
  "Fransson",
  "Nystr\xF6m",
  "Isaksson",
  "Arvidsson",
  "S\xF6derberg",
  "Blom",
  "Ekstr\xF6m",
  "Martinsson",
  "Str\xF6m",
  "Wikstr\xF6m",
  "M\xE5nsson",
  "\xC5berg",
  "Wallin",
  "Samuelsson",
  "Bj\xF6rklund",
  "Norberg",
  "Mattsson",
  "Gunnarsson",
  "Nordstr\xF6m",
  "Holmberg",
  "Eliasson",
  "Viklund",
  "Sundberg",
  "Claesson",
  "L\xF6fgren",
  "Hedlund",
  "Jakobsson",
  "Andreasson",
  "Palm",
  "M\xE5rtensson",
  "Sandstr\xF6m",
  "Olofsson",
  "Hellstr\xF6m",
  "\xC5kesson",
  "Blomberg",
  "Lundqvist",
  "Ek",
  "S\xF6derstr\xF6m",
  "Nordin",
  "Hansson",
  "Dahl",
  "Falk",
  "Gr\xF6nberg",
  "Hedberg",
  "Ingvarsson",
  "J\xF6nsson",
  "Karlsson",
  "Lind",
  "Malm",
  "Nord",
  "Olsson",
  "P\xE5lsson",
  "Qvist",
  "Rydberg",
  "Sj\xF6gren",
  "T\xF6rnqvist",
  "Ullman",
  "Vallin",
  "Wahlberg",
  "Zetterberg",
  "Alm",
  "Backman",
  "Cederberg",
  "Dahlberg",
  "Edstr\xF6m",
  "Fagerstr\xF6m",
  "Granberg",
  "Hagberg",
  "Ivarsson",
  "Johansson",
  "Karlsson",
  "Lagerberg",
  "Malmberg",
  "Nor\xE9n",
  "Oskarsson",
  "Persson",
  "Qvarnstr\xF6m",
  "Ros\xE9n",
  "Sundstr\xF6m",
  "Tengberg",
  "Ulfsson",
  "Vik",
  "Westerberg",
  "Ylven",
  "Zander",
  "\xC5str\xF6m",
  "\xD6berg",
  "\xD6stberg",
  "\xD6sterberg",
  "Abrahamsson",
  "Beckman",
  "Cedervall",
  "Dahlgren",
  "Ekman",
  "Falkenberg",
  "Granath",
  "Hult",
  "Isaksson",
  "Jansson",
  "Kling",
  "Ljung",
  "Melin",
  "Nyman",
  "Olausson",
  "Pettersson",
  "Qvist",
  "Rasmusson",
  "Svensson",
  "Thulin",
  "Ullberg",
  "Vester",
  "Wahlgren",
  "Xenon",
  "Ytterberg",
  "Zetterlund"
];

// resources/static_db/names/exussr_data.ts
var EXUSSR_MALE_FIRSTNAMES = [
  "Aleksandr",
  "Artem",
  "Maksim",
  "Dmitrij",
  "Ivan",
  "Michai\u0142",
  "Nikita",
  "Ilja",
  "Kiry\u0142",
  "W\u0142adis\u0142aw",
  "Danii\u0142",
  "Andriej",
  "Roman",
  "Siergiej",
  "W\u0142adimir",
  "Jewgienij",
  "Pawie\u0142",
  "Anton",
  "Denis",
  "Igor",
  "Wiktor",
  "Jurij",
  "Wasilij",
  "Oleg",
  "Stanis\u0142aw",
  "Bohdan",
  "Wo\u0142odymyr",
  "O\u0142eksandr",
  "Witalij",
  "Myko\u0142a",
  "Jaros\u0142aw",
  "Taras",
  "Rus\u0142an",
  "Andrij",
  "Nazar",
  "Matviy",
  "Lev",
  "Mark",
  "Matvey",
  "Timofey",
  "Miron",
  "Makar",
  "Danylo",
  "Tymofiy",
  "Mukhammad",
  "Alikhan",
  "Aisultan",
  "Omar",
  "Aldiyar",
  "Amir",
  "Islam",
  "Arsen",
  "Alan",
  "Miras",
  "Rasul",
  "Nurislam",
  "Alinur",
  "Erasyl",
  "Sanzhar",
  "Ibrahim",
  "J\u0101nis",
  "Roberts",
  "Arturs",
  "Kristaps",
  "Edgars",
  "M\u0101ris",
  "Aivars",
  "Jurijs",
  "Andris",
  "Kaspars",
  "Rihards",
  "Dainis",
  "Gatis",
  "Martins",
  "Markuss",
  "Rokas",
  "Domantas",
  "Matas",
  "Lukas",
  "Dovydas",
  "Art\u016Bras",
  "Jonas",
  "Tadas",
  "Vytautas",
  "Mindaugas",
  "Petras",
  "Algirdas",
  "Saulius",
  "Darius",
  "Mantas",
  "Aurimas",
  "Deividas",
  "Paulius",
  "Tomas",
  "Karolis",
  "Ar\u016Bnas",
  "Giedrius",
  "\u017Dilvinas",
  "Eimantas"
];
var EXUSSR_MALE_LASTNAMES = [
  "Ivanov",
  "Smirnov",
  "Kuzniecow",
  "Popow",
  "Wasiljew",
  "Pietrow",
  "Sidorow",
  "Michaj\u0142ow",
  "Fiodorow",
  "Soko\u0142ow",
  "Jakowlew",
  "Paw\u0142ow",
  "Aleksiejew",
  "Morozow",
  "Nowikow",
  "Wo\u0142kow",
  "Romanow",
  "Sawicki",
  "Bielski",
  "Kuznetsov",
  "Shevchenko",
  "Bondarenko",
  "Melnyk",
  "Kovalenko",
  "Boyko",
  "Tkachenko",
  "Kravchenko",
  "Lysenko",
  "Marchenko",
  "Kovalchuk",
  "Novak",
  "Koval",
  "Ivanov",
  "Petrov",
  "Novikov",
  "Volkov",
  "Kozlov",
  "Moroz",
  "Lebedev",
  "Zhukov",
  "Kovalev",
  "Novik",
  "Zhuk",
  "Kotov",
  "Kovalevich",
  "Melnik",
  "Petrovich",
  "Ivanovich",
  "Smirnov",
  "Kuznetsov",
  "Popovich",
  "Petrauskas",
  "Jankauskas",
  "Kazlauskas",
  "Vasiliauskas",
  "Butkus",
  "B\u0113rzi\u0146\u0161",
  "Ozoli\u0146\u0161",
  "Kalni\u0146\u0161",
  "Jansons",
  "P\u0113tersons",
  "Ivanovs",
  "Ozols",
  "Liepi\u0146\u0161",
  "Kask",
  "Tamm",
  "M\xE4gi",
  "Sepp",
  "Karimov",
  "Abdullaev",
  "Rahmonov",
  "Sharipov",
  "Ismailov",
  "Aliev",
  "Mukhammadiev",
  "Bekov",
  "Yusupov",
  "Saidov",
  "Tojiboev",
  "Abdugafforov",
  "Rustamov",
  "Kurbanov",
  "Nazarov",
  "Ergashev",
  "Mirzayev",
  "Tursunov",
  "Umarov",
  "Hasanov",
  "Sattorov",
  "Rakhimov",
  "Akhmedov",
  "Jumayev",
  "Sobirov",
  "Mamatov"
];

// resources/static_db/names/es_data.ts
var ES_MALE_FIRSTNAMES = [
  "Carlos",
  "Sergio",
  "Alejandro",
  "Pablo",
  "David",
  "Daniel",
  "Diego",
  "Adrian",
  "Alvaro",
  "Javier",
  "Antonio",
  "Miguel",
  "Marcos",
  "Gonzalo",
  "Raul",
  "Inigo",
  "Iker",
  "Fernando",
  "Borja",
  "Mikel",
  "Jon",
  "Unai",
  "Aitor",
  "Asier",
  "Ruben",
  "Victor",
  "Roberto",
  "Cristian",
  "Rodrigo",
  "Jesus",
  "Andres",
  "Hector",
  "Oscar",
  "Manuel",
  "Alberto",
  "Juanmi",
  "Gerard",
  "Marc",
  "Jordi",
  "Sergi",
  "Juan",
  "Jose",
  "Francisco",
  "Luis",
  "Mario",
  "Jorge",
  "Rafael",
  "Pedro",
  "Alfonso",
  "Eduardo",
  "Ricardo",
  "Ramon",
  "Enrique",
  "Felipe",
  "Alvaro",
  "Ivan",
  "Angel",
  "Julio",
  "Santiago",
  "Hugo",
  "Nacho",
  "Ismael",
  "Victor",
  "Emilio",
  "Tomas",
  "Martin",
  "Mateo",
  "Nicolas",
  "Samuel",
  "Lucas",
  "Bruno",
  "Gabriel",
  "Adan",
  "Joel",
  "Izan",
  "Pol",
  "Oriol",
  "Xavi",
  "Xavier",
  "Pau",
  "Marcelo",
  "Cesar",
  "Hernan",
  "Octavio",
  "Sebastian",
  "Agustin",
  "Alvaro",
  "Guillermo",
  "Rogelio",
  "Elias",
  "Nestor",
  "Fermin",
  "Carmelo",
  "Salvador",
  "Vicente",
  "Arturo",
  "Humberto",
  "Leandro",
  "Fabian",
  "Cristobal"
];
var ES_MALE_LASTNAMES = [
  "Garcia",
  "Martinez",
  "Lopez",
  "Sanchez",
  "Gonzalez",
  "Rodriguez",
  "Fernandez",
  "Perez",
  "Gomez",
  "Martin",
  "Jimenez",
  "Ruiz",
  "Hernandez",
  "Diaz",
  "Moreno",
  "Alvarez",
  "Munoz",
  "Romero",
  "Alonso",
  "Gutierrez",
  "Navarro",
  "Torres",
  "Dominguez",
  "Vazquez",
  "Ramos",
  "Gil",
  "Serrano",
  "Molina",
  "Blanco",
  "Morales",
  "Suarez",
  "Ortega",
  "Delgado",
  "Castro",
  "Ortiz",
  "Rubio",
  "Marin",
  "Sanz",
  "Iglesias",
  "Medina",
  "Herrera",
  "Vega",
  "Cruz",
  "Flores",
  "Reyes",
  "Aguilar",
  "Campos",
  "Carrasco",
  "Mendez",
  "Fuentes",
  "Cortes",
  "Calvo",
  "Rojas",
  "Pascual",
  "Guerrero",
  "Cano",
  "Santos",
  "Nunez",
  "Prieto",
  "Soler",
  "Vidal",
  "Mora",
  "Santana",
  "Cabrera",
  "Arias",
  "Pardo",
  "Bravo",
  "Ferrer",
  "Moya",
  "Carmona",
  "Ibarra",
  "Soria",
  "Marquez",
  "Lorenzo",
  "Valencia",
  "Duran",
  "Montes",
  "Pena",
  "Rios",
  "Caceres",
  "Benitez",
  "Nieto",
  "Padilla",
  "Vargas",
  "Crespo",
  "Maldonado",
  "Esteban",
  "Pineda",
  "Rosales",
  "Montoya",
  "Avila",
  "Escudero",
  "Villanueva",
  "Cuevas",
  "Bautista",
  "Pacheco",
  "Salas",
  "Cordero",
  "Cifuentes",
  "Aranda"
];

// resources/static_db/names/en_data.ts
var EN_MALE_FIRSTNAMES = [
  "Noah",
  "Theo",
  "Freddie",
  "Leo",
  "Luca",
  "Archie",
  "Arthur",
  "Oliver",
  "Oscar",
  "Arlo",
  "George",
  "Alfie",
  "Charlie",
  "Elijah",
  "Jude",
  "Henry",
  "Teddy",
  "Albie",
  "Reggie",
  "Oakley",
  "Lucas",
  "Harry",
  "Jack",
  "Tommy",
  "Roman",
  "Rory",
  "Finley",
  "Theodore",
  "Ezra",
  "Isaac",
  "Rowan",
  "Ronnie",
  "Reuben",
  "Jacob",
  "Hudson",
  "Ethan",
  "Louie",
  "Max",
  "Vinnie",
  "Thomas",
  "James",
  "Alexander",
  "Hugo",
  "Sonny",
  "Kai",
  "Adam",
  "Mason",
  "Frankie",
  "Hunter",
  "Harrison",
  "Logan",
  "Finn",
  "Miles",
  "Yusuf",
  "Louis",
  "Riley",
  "Edward",
  "Jaxon",
  "Nathan",
  "Musa",
  "William",
  "Harley",
  "Jasper",
  "Ruben",
  "Yahya",
  "Toby",
  "Alex",
  "Elias",
  "Brody",
  "Enzo",
  "Grayson",
  "Elliot",
  "Billy",
  "Ollie",
  "Stanley",
  "Otis",
  "Levi",
  "Liam",
  "Jesse",
  "Michael",
  "Muhammad",
  "Austin",
  "Albert",
  "Sebastian",
  "Joshua",
  "Jax",
  "Caleb",
  "Daniel",
  "Zachary",
  "Milo",
  "Bobby",
  "Gabriel",
  "Jenson",
  "Samuel",
  "Hamza",
  "Carter",
  "Cooper",
  "Ibrahim",
  "Lenny",
  "Dylan"
];
var EN_MALE_LASTNAMES = [
  "Smith",
  "Jones",
  "Williams",
  "Taylor",
  "Brown",
  "Davies",
  "Evans",
  "Thomas",
  "Wilson",
  "Johnson",
  "Roberts",
  "Robinson",
  "Thompson",
  "Wright",
  "Walker",
  "White",
  "Edwards",
  "Hughes",
  "Green",
  "Hall",
  "Lewis",
  "Harris",
  "Clarke",
  "Patel",
  "Jackson",
  "Wood",
  "Turner",
  "Martin",
  "Cooper",
  "Hill",
  "Morris",
  "Ward",
  "Moore",
  "Clark",
  "Baker",
  "Harrison",
  "King",
  "Morgan",
  "Lee",
  "Allen",
  "James",
  "Phillips",
  "Scott",
  "Watson",
  "Davis",
  "Parker",
  "Bennett",
  "Price",
  "Griffiths",
  "Young",
  "Khan",
  "Mitchell",
  "Cook",
  "Bailey",
  "Carter",
  "Richardson",
  "Shaw",
  "Kelly",
  "Collins",
  "Bell",
  "Hussain",
  "Richards",
  "Cox",
  "Miller",
  "Begum",
  "Murphy",
  "Ali",
  "Marshall",
  "Simpson",
  "Anderson",
  "Ellis",
  "Adams",
  "Wilkinson",
  "Ahmed",
  "Foster",
  "Powell",
  "Chapman",
  "Singh",
  "Webb",
  "Rogers",
  "Mason",
  "Gray",
  "Hunt",
  "Owen",
  "Matthews",
  "Palmer",
  "Holmes",
  "Mills",
  "Campbell",
  "Lloyd",
  "Barnes",
  "Knight",
  "Butler",
  "Russell",
  "Barker",
  "Stevens",
  "Jenkins",
  "Dixon",
  "Fisher",
  "Harvey"
];

// resources/static_db/names/de_data.ts
var DE_MALE_FIRSTNAMES = [
  "Felix",
  "August",
  "Emmerich",
  "Friedrich",
  "Anselm",
  "Leopold",
  "Heinrich",
  "Matteo",
  "Carl",
  "Louis",
  "Theodor",
  "Reinhard",
  "Fritz",
  "Wolfgang",
  "Lenz",
  "Isidor",
  "Hans",
  "Rafael",
  "Noah",
  "Dieter",
  "Siegfried",
  "Johann",
  "Adam",
  "Andreas",
  "Arnold",
  "Bruno",
  "Hartwin",
  "Albert",
  "Alexander",
  "Gregor",
  "Wolf",
  "Marcel",
  "Armin",
  "Dennis",
  "Christoph",
  "Volker",
  "Rudolf",
  "Werner",
  "Dietrich",
  "Christian",
  "Anton",
  "Cornelius",
  "Walter",
  "Niko",
  "Daniel",
  "Emil",
  "Aaron",
  "Edgar",
  "Hermann",
  "Wilhelm",
  "Archibald",
  "Oswald",
  "Alois",
  "Franz",
  "Karl",
  "Siegmund",
  "Arend",
  "Engelbert",
  "Ludolf",
  "Rainer",
  "Josef",
  "Otto",
  "Arne",
  "Clemens",
  "Klaus",
  "Maximilian",
  "Oskar",
  "Frank",
  "Gunter",
  "Ben",
  "Ansgar",
  "Lennart",
  "Konrad",
  "Alwin",
  "Elias",
  "Severin",
  "Erwin",
  "Rolf",
  "Ignaz",
  "Eckhart",
  "Aldo",
  "Hans",
  "Friedemann",
  "Sascha",
  "Claus",
  "Ulrich",
  "Robert",
  "Leo",
  "Alwin",
  "Gustav",
  "Hermann",
  "Sigmar",
  "Luther",
  "Philipp",
  "Norbert",
  "Ludwig",
  "Paul",
  "Rupert",
  "Hagen",
  "Moritz"
];
var DE_MALE_LASTNAMES = [
  // Twoja oryginalna lista (bez zmian)
  "Muller",
  "Schmidt",
  "Schneider",
  "Fischer",
  "Weber",
  "Schaefer",
  "Meyer",
  "Wagner",
  "Becker",
  "Bauer",
  "Hoffmann",
  "Schulz",
  "Koch",
  "Richter",
  "Klein",
  "Wolf",
  "Schroeder",
  "Neumann",
  "Braun",
  "Werner",
  "Schwarz",
  "Hofmann",
  "Zimmermann",
  "Schmitt",
  "Hartmann",
  "Schmid",
  "Weiss",
  "Schmitz",
  "Krueger",
  "Lange",
  "Meier",
  "Walter",
  "Koehler",
  "Maier",
  "Beck",
  "Koenig",
  "Krause",
  "Schulze",
  "Huber",
  "Mayer",
  "Frank",
  "Lehmann",
  "Kaiser",
  "Fuchs",
  "Herrmann",
  "Lang",
  "Thomas",
  "Peters",
  "Stein",
  "Jung",
  "Moeller",
  "Berger",
  "Martin",
  "Friedrich",
  "Scholz",
  "Keller",
  "Gross",
  "Hahn",
  "Roth",
  "Guenther",
  "Vogel",
  "Schubert",
  "Winkler",
  "Schuster",
  "Lorenz",
  "Ludwig",
  "Baumann",
  "Heinrich",
  "Otto",
  "Simon",
  "Graf",
  "Kraus",
  "Kraemer",
  "Boehm",
  "Schulte",
  "Albrecht",
  "Franke",
  "Winter",
  "Schumacher",
  "Vogt",
  "Haas",
  "Sommer",
  "Schreiber",
  "Engel",
  "Ziegler",
  "Dietrich",
  "Brandt",
  "Seidel",
  "Kuhn",
  "Busch",
  "Horn",
  "Arnold",
  "Kuehn",
  "Bergmann",
  "Pohl",
  "Pfeiffer",
  "Wolff",
  "Voigt",
  "Sauer",
  "Goldschmidt",
  // Nowo dodane – popularne i typowo niemieckie (kolejność mniej więcej od częstszych)
  "Mueller",
  "Schafer",
  "Schroder",
  "Krueger",
  "Kruger",
  "Schmitz",
  "Hartmann",
  "Hofmann",
  "Schmitt",
  "Schmid",
  "Lange",
  "Meier",
  "Maier",
  "Mayer",
  "Koehler",
  "Schulze",
  "Huber",
  "Lehmann",
  "Herrmann",
  "Friedrich",
  "Scholz",
  "Gross",
  "Guenther",
  "Schubert",
  "Winkler",
  "Schuster",
  "Lorenz",
  "Ludwig",
  "Baumann",
  "Heinrich",
  "Kraus",
  "Kraemer",
  "Boehm",
  "Schulte",
  "Albrecht",
  "Franke",
  "Schumacher",
  "Haas",
  "Sommer",
  "Schreiber",
  "Ziegler",
  "Dietrich",
  "Brandt",
  "Seidel",
  "Kuhn",
  "Kuehn",
  "Busch",
  "Horn",
  "Arnold",
  "Bergmann",
  "Pfeiffer",
  "Voigt",
  "Sauer",
  // Kolejne popularne niemieckie nazwiska
  "Schafers",
  "Bauer",
  "Hoffman",
  "Schultze",
  "Koch",
  "Richter",
  "Wolf",
  "Neumann",
  "Braun",
  "Werner",
  "Schwarz",
  "Zimmermann",
  "Weiss",
  "Krueger",
  "Lange",
  "Walter",
  "Beck",
  "Koenig",
  "Krause",
  "Mayer",
  "Frank",
  "Kaiser",
  "Fuchs",
  "Lang",
  "Thomas",
  "Peters",
  "Stein",
  "Jung",
  "Moeller",
  "Berger",
  "Martin",
  "Keller",
  "Hahn",
  "Roth",
  "Vogel",
  "Baumann",
  "Heinrich",
  "Otto",
  "Simon",
  "Graf",
  "Kraus",
  "Kraemer",
  "Boehm",
  "Albrecht",
  "Franke",
  "Winter",
  "Vogt",
  "Haas",
  "Sommer",
  "Engel",
  "Ziegler",
  "Dietrich",
  "Seidel",
  "Kuhn",
  "Busch",
  "Horn",
  "Arnold",
  "Bergmann",
  "Pohl",
  "Pfeiffer",
  "Wolff",
  "Sauer",
  "Goldschmidt",
  // Rozszerzenie – kolejne typowo niemieckie (z różnych regionów)
  "Ackermann",
  "Adam",
  "Adler",
  "Bach",
  "Bachmann",
  "Baer",
  "Barth",
  "Bauer",
  "Baum",
  "Bayer",
  "Behr",
  "Behrens",
  "Bender",
  "Berg",
  "Betz",
  "Bischoff",
  "Bock",
  "Bode",
  "Boerner",
  "Bohn",
  "Brand",
  "Braun",
  "Breuer",
  "Brinkmann",
  "Brock",
  "Bruns",
  "Buchholz",
  "Buck",
  "Buehler",
  "Buehner",
  "Burkhardt",
  "Busch",
  "Christ",
  "Conrad",
  "Dahl",
  "Damm",
  "Daniel",
  "Decker",
  "Diehl",
  "Dittmann",
  "Dorn",
  "Drescher",
  "Ebert",
  "Eckert",
  "Ehlers",
  "Ehrlich",
  "Eichler",
  "Eilers",
  "Ernst",
  "Fahr",
  "Feldmann",
  "Fiedler",
  "Fink",
  "Fischer",
  "Fleischer",
  "Foerster",
  "Frank",
  "Freund",
  "Frey",
  "Friedrich",
  "Fritz",
  "Froehlich",
  "Fuchs",
  "Fuhr",
  "Gebhardt",
  "Geiger",
  "Gerber",
  "Gerlach",
  "Geyer",
  "Glaser",
  "Goetz",
  "Graf",
  "Grimm",
  "Grosse",
  "Grunwald",
  "Haag",
  "Haas",
  "Hahn",
  "Haller",
  "Hamm",
  "Hammer",
  "Hansen",
  "Hartwig",
  "Hase",
  "Hass",
  "Haupt",
  "Hecht",
  "Heil",
  "Hein",
  "Heinemann",
  "Heinrich",
  "Heinz",
  "Heller",
  "Hennig",
  "Henning",
  "Hentschel",
  "Herbst",
  "Hermann",
  "Herzog",
  "Hess",
  "Hildebrandt",
  "Hinrichs",
  "Hofer",
  "Hoffmann",
  "Hofmann",
  "Hohmann",
  "Holz",
  "Holzapfel",
  "Horn",
  "Huber",
  "Hummel",
  "Jager",
  "Jahn",
  "Jakob",
  "Jansen",
  "Jensen",
  "Jung",
  "Kaiser",
  "Kalb",
  "Kapp",
  "Kaufmann",
  "Keller",
  "Kern",
  "Kessler",
  "Kirchhoff",
  "Kirchner",
  "Klaus",
  "Klein",
  "Kling",
  "Klotz",
  "Koch",
  "Koeppen",
  "Kohl",
  "Kohler",
  "Konig",
  "Kopp",
  "Korte",
  "Kramer",
  "Krause",
  "Krebs",
  "Kretschmer",
  "Kreuzer",
  "Kroll",
  "Krone",
  "Krug",
  "Kruger",
  "Kuhlmann",
  "Kuhn",
  "Kunze",
  "Kurz",
  "Lamm",
  "Lang",
  "Lange",
  "Lehmann",
  "Lehr",
  "Leicht",
  "Leistner",
  "Lemke",
  "Lenz",
  "Lindemann",
  "Link",
  "Loch",
  "Loeffler",
  "Lohmann",
  "Lorenz",
  "Ludwig",
  "Maier",
  "Mann",
  "Marek",
  "Marx",
  "Mayer",
  "Meier",
  "Meissner",
  "Menzel",
  "Merkel",
  "Mertens",
  "Metzger",
  "Meyer",
  "Michael",
  "Michels",
  "Mielke",
  "Miller",
  "Moebius",
  "Moeller",
  "Mohr",
  "Morgenstern",
  "Moser",
  "Mueller",
  "Muller",
  "Nagel",
  "Neubauer",
  "Neumann",
  "Niemann",
  "Noll",
  "Nowak",
  "Ober",
  "Ochs",
  "Otto",
  "Papke",
  "Paul",
  "Peters",
  "Pfeifer",
  "Pfeiffer",
  "Pfister",
  "Pohl",
  "Poll",
  "Preuss",
  "Probst",
  "Rabe",
  "Rauch",
  "Reich",
  "Reichel",
  "Reichert",
  "Reimann",
  "Reinhardt",
  "Reiter",
  "Renz",
  "Richter",
  "Riedel",
  "Ritter",
  "Roehm",
  "Roth",
  "Rott",
  "Rupp",
  "Sander",
  "Sauer",
  "Schaaf",
  "Schaefer",
  "Schaper",
  "Scheffler",
  "Schenk",
  "Schilling",
  "Schindler",
  "Schirmer",
  "Schlegel",
  "Schlicht",
  "Schlosser",
  "Schmid",
  "Schmidt",
  "Schmitt",
  "Schmitz",
  "Schneider",
  "Schnell",
  "Schoen",
  "Scholz",
  "Schott",
  "Schreiber",
  "Schroeder",
  "Schubert",
  "Schulz",
  "Schulze",
  "Schumacher",
  "Schuster",
  "Schwarz",
  "Seidel",
  "Seifert",
  "Seitz",
  "Siebert",
  "Simon",
  "Singer",
  "Sommer",
  "Sorg",
  "Specht",
  "Stark",
  "Stein",
  "Steiner",
  "Stoll",
  "Strauss",
  "Strobel",
  "Sturm",
  "Suss",
  "Thiel",
  "Thomas",
  "Thomsen",
  "Timm",
  "Ulrich",
  "Urban",
  "Vetter",
  "Vogel",
  "Vogt",
  "Voigt",
  "Volk",
  "Wagner",
  "Walter",
  "Weber",
  "Weidner",
  "Weiss",
  "Wenzel",
  "Werner",
  "Westermann",
  "Wiedemann",
  "Wiese",
  "Wild",
  "Wilhelm",
  "Winkler",
  "Winter",
  "Witt",
  "Witte",
  "Wolf",
  "Wolff",
  "Wulff",
  "Zander",
  "Ziegler",
  "Zimmermann"
];

// resources/static_db/names/it_data.ts
var IT_MALE_FIRSTNAMES = [
  "Lorenzo",
  "Francesco",
  "Alessandro",
  "Andrea",
  "Matteo",
  "Marco",
  "Luca",
  "Davide",
  "Federico",
  "Nicolo",
  "Simone",
  "Antonio",
  "Giuseppe",
  "Giovanni",
  "Roberto",
  "Stefano",
  "Riccardo",
  "Fabio",
  "Daniele",
  "Emanuele",
  "Filippo",
  "Giacomo",
  "Leonardo",
  "Edoardo",
  "Gabriele",
  "Mattia",
  "Diego",
  "Manuel",
  "Christian",
  "Salvatore",
  "Angelo",
  "Vincenzo",
  "Dario",
  "Claudio",
  "Paolo",
  "Giorgio",
  "Massimo",
  "Gianluca",
  "Sergio",
  "Alberto",
  "Pietro",
  "Enrico",
  "Michele",
  "Cristiano",
  "Tommaso",
  "Guglielmo",
  "Umberto",
  "Raffaele",
  "Cesare",
  "Giulio",
  "Alessio",
  "Samuele",
  "Edoardo",
  "Elia",
  "Noah",
  "Enea",
  "Nicola",
  "Saverio",
  "Ruggero",
  "Amedeo",
  "Bruno",
  "Igor",
  "Ivan",
  "Mauro",
  "Carmine",
  "Gaetano",
  "Domenico",
  "Pasquale",
  "Ciro",
  "Rocco",
  "Pio",
  "Emilio",
  "Alfonso",
  "Gennaro",
  "Luigi",
  "Mario",
  "Pierluigi",
  "Gianmarco",
  "Gianfranco",
  "Gianpiero",
  "Giancarlo",
  "Vittorio",
  "Valerio",
  "Franco",
  "Sandro",
  "Renato",
  "Piero",
  "Simeone",
  "Tiziano",
  "Leandro",
  "Mirko",
  "Eros",
  "Nerio",
  "Loris",
  "Gioele",
  "Matias"
];
var IT_MALE_LASTNAMES = [
  "Rossi",
  "Ferrari",
  "Esposito",
  "Bianchi",
  "Romano",
  "Colombo",
  "Ricci",
  "Marino",
  "Greco",
  "Bruno",
  "Gallo",
  "Conti",
  "Mancini",
  "Costa",
  "Giordano",
  "Rizzo",
  "Lombardi",
  "Moretti",
  "Barbieri",
  "Fontana",
  "Santoro",
  "Marini",
  "Rinaldi",
  "Caruso",
  "Ferrara",
  "Galli",
  "Martini",
  "Leone",
  "Longo",
  "Gentile",
  "Palumbo",
  "Martinelli",
  "Valenti",
  "Russo",
  "De Luca",
  "Ferretti",
  "Sorrentino",
  "Sala",
  "Fabbri",
  "Villa",
  "De Santis",
  "Vitale",
  "Serra",
  "D Angelo",
  "Riva",
  "Palmieri",
  "Monti",
  "Testa",
  "Grassi",
  "Ferraro",
  "Fiore",
  "Messina",
  "Lombardo",
  "Parisi",
  "Amato",
  "Sanna",
  "Fusco",
  "Coppola",
  "Ruggiero",
  "De Rosa",
  "Marchetti",
  "Pellegrini",
  "Bianco",
  "Bernardi",
  "Orlando",
  "Costanzo",
  "Piras",
  "Mazza",
  "Puglisi",
  "Battaglia",
  "Farina",
  "Basile",
  "Ferri",
  "Cattaneo",
  "Pagano",
  "Neri",
  "Graziani",
  "Guidi",
  "Pace",
  "Milani",
  "Benedetti",
  "Rossetti",
  "Caputo",
  "Sartori",
  "Gatti",
  "Gatti",
  "De Angelis",
  "La Rosa",
  "Mariani",
  "Ramosi",
  "Donati",
  "Rossiello",
  "Bernasconi",
  "Moro",
  "De Maio",
  "Pastore",
  "Bellini",
  "Fiorentino",
  "Negri",
  "Corsi",
  "Raimondi",
  "Pini",
  "Morelli",
  "Napoletano"
];

// resources/static_db/names/fr_data.ts
var FR_MALE_FIRSTNAMES = [
  "Lucas",
  "Hugo",
  "Mathis",
  "Nathan",
  "Tom",
  "Baptiste",
  "Theo",
  "Alexis",
  "Arthur",
  "Leo",
  "Jules",
  "Timeo",
  "Quentin",
  "Romain",
  "Antoine",
  "Pierre",
  "Louis",
  "Clement",
  "Maxime",
  "Nicolas",
  "Julien",
  "Sebastien",
  "Kylian",
  "Karim",
  "Moussa",
  "Ousmane",
  "Youssef",
  "Mehdi",
  "Amine",
  "Samir",
  "Kevin",
  "Jordan",
  "Olivier",
  "Vincent",
  "Damien",
  "Gauthier",
  "Florian",
  "Adrien",
  "Benoit",
  "Guillaume",
  "Jean",
  "Paul",
  "Marc",
  "Thomas",
  "Benjamin",
  "Alexandre",
  "Samuel",
  "Ethan",
  "Enzo",
  "Noah",
  "Gabriel",
  "Raphael",
  "Maxence",
  "Corentin",
  "Matteo",
  "Sacha",
  "Axel",
  "Valentin",
  "Dylan",
  "Yanis",
  "Ilyes",
  "Anis",
  "Rayan",
  "Yassine",
  "Mohamed",
  "Ibrahim",
  "Idris",
  "Nassim",
  "Bilal",
  "Walid",
  "Farid",
  "Tariq",
  "Rachid",
  "Mustapha",
  "Alain",
  "Patrick",
  "Christophe",
  "Frederic",
  "Jerome",
  "Laurent",
  "Philippe",
  "Stephane",
  "Gerard",
  "Bernard",
  "Michel",
  "Jacques",
  "Daniel",
  "Eric",
  "Franck",
  "Cedric",
  "Remy",
  "Loic",
  "Mickael",
  "Jonathan",
  "Yohan",
  "Gael",
  "Bruno",
  "Lionel",
  "Bastien",
  "Tristan"
];
var FR_MALE_LASTNAMES = [
  "Martin",
  "Bernard",
  "Dubois",
  "Thomas",
  "Robert",
  "Richard",
  "Petit",
  "Durand",
  "Leroy",
  "Moreau",
  "Simon",
  "Laurent",
  "Lefebvre",
  "Michel",
  "Garcia",
  "David",
  "Bertrand",
  "Roux",
  "Vincent",
  "Fournier",
  "Morel",
  "Girard",
  "Andre",
  "Lefevre",
  "Mercier",
  "Dupont",
  "Lambert",
  "Bonnet",
  "Francois",
  "Martinez",
  "Legrand",
  "Garnier",
  "Faure",
  "Rousseau",
  "Blanc",
  "Guerin",
  "Muller",
  "Henry",
  "Roussel",
  "Nicolas",
  "Mathieu",
  "Boyer",
  "Lemaire",
  "Lopez",
  "Meunier",
  "Gauthier",
  "Chevalier",
  "Pereira",
  "Robin",
  "Leclerc",
  "Leroux",
  "Barbier",
  "Vidal",
  "Caron",
  "Picard",
  "Roger",
  "Renard",
  "Schmitt",
  "Lefort",
  "Boucher",
  "Lecomte",
  "Giraud",
  "Colin",
  "Perrin",
  "Masson",
  "Dufour",
  "Fernandez",
  "Morin",
  "Girault",
  "Dumont",
  "Marie",
  "Noel",
  "Clement",
  "Benoit",
  "Gilles",
  "Bourgeois",
  "Delattre",
  "Marchand",
  "Deschamps",
  "Charpentier",
  "Hubert",
  "Brun",
  "Rey",
  "Riviere",
  "Delaunay",
  "Pasquier",
  "Paul",
  "Leger",
  "Leveque",
  "Guillot",
  "Payet",
  "Adam",
  "Pichon",
  "Cousin",
  "Pelletier",
  "Remy",
  "Aubert",
  "Lemoine",
  "Rolland",
  "Olivier"
];

// resources/static_db/names/Japanese_data.ts
var JAPANESE_MALE_FIRSTNAMES = [
  "Haruto",
  "Minato",
  "Yuma",
  "Sota",
  "Hiroto",
  "Ren",
  "Itsuki",
  "Riku",
  "Haruki",
  "Yuto",
  "Kaito",
  "Daiki",
  "Takumi",
  "Ryusei",
  "Shota",
  "Kenta",
  "Yuki",
  "Ryota",
  "Taiga",
  "Soma",
  "Aoi",
  "Hinata",
  "Asahi",
  "Yuito",
  "Ritsu",
  "Kai",
  "Sho",
  "Kenji",
  "Kenzo",
  "Akira",
  "Hiroshi",
  "Takashi",
  "Satoshi",
  "Tatsuya",
  "Kazuki",
  "Masato",
  "Naoki",
  "Shinji",
  "Daisuke",
  "Koji",
  "Yoshiki",
  "Tsubasa",
  "Hayato",
  "Rei",
  "Sora",
  "Koki",
  "Arata",
  "Kei",
  "Ryo",
  "Tomoya",
  "Shun",
  "Yuya",
  "Seiji",
  "Hikaru",
  "Makoto",
  "Takeshi",
  "Jun",
  "Kiyoshi",
  "Noboru",
  "Osamu",
  "Susumu",
  "Tsuyoshi",
  "Yasuo",
  "Akihiko",
  "Kazuhiro",
  "Masahiro",
  "Toshiro",
  "Yoshio",
  "Goro",
  "Hachiro",
  "Jiro",
  "Saburo",
  "Ichiro",
  "Daichi",
  "Haruma",
  "Kota",
  "Nagi",
  "Ryoma",
  "So",
  "Toma",
  "Yusei",
  "Ayato",
  "Eita",
  "Fuma",
  "Gaku",
  "Hiroki",
  "Iori",
  "Kairi",
  "Mao",
  "Nao",
  "Raito",
  "Shion",
  "Taichi",
  "Yuichi",
  "Yuma",
  "Zen",
  "Aoto",
  "Haru",
  "Kazu",
  "Rui",
  "Takeru"
];
var JAPANESE_MALE_SURNAMES = [
  "Sato",
  "Suzuki",
  "Takahashi",
  "Tanaka",
  "Watanabe",
  "Ito",
  "Yamamoto",
  "Nakamura",
  "Kobayashi",
  "Kato",
  "Yoshida",
  "Yamada",
  "Sasaki",
  "Yamaguchi",
  "Matsumoto",
  "Saito",
  "Inoue",
  "Kimura",
  "Hayashi",
  "Shimizu",
  "Yamazaki",
  "Ikeda",
  "Abe",
  "Hashimoto",
  "Yamashita",
  "Mori",
  "Ishikawa",
  "Nakajima",
  "Maeda",
  "Ogawa",
  "Fujita",
  "Okada",
  "Goto",
  "Hasegawa",
  "Murakami",
  "Ishii",
  "Kondo",
  "Sakamoto",
  "Endo",
  "Aoki",
  "Fujii",
  "Nishimura",
  "Fukuda",
  "Ota",
  "Miura",
  "Fujiwara",
  "Okamoto",
  "Matsuda",
  "Nakagawa",
  "Nakano",
  "Harada",
  "Ono",
  "Saito",
  "Takeuchi",
  "Tamura",
  "Kaneko",
  "Wada",
  "Nakayama",
  "Ishida",
  "Ueda",
  "Morita",
  "Shibata",
  "Hara",
  "Sakai",
  "Kudo",
  "Miyazaki",
  "Yokoyama",
  "Miyamoto",
  "Uchida",
  "Takagi",
  "Ando",
  "Taniguchi",
  "Ono",
  "Maruyama",
  "Takada",
  "Imai",
  "Kawano",
  "Kojima",
  "Fujimoto",
  "Takeda",
  "Murata",
  "Ueno",
  "Sugiyama",
  "Masuda",
  "Koyama",
  "Sugawara",
  "Hirano",
  "Otsuka",
  "Kubo",
  "Chiba",
  "Matsui",
  "Iwasaki",
  "Noguchi",
  "Kinoshita",
  "Matsuo",
  "Kikuchi",
  "Nomura",
  "Sano",
  "Watabe",
  "Arai"
];

// resources/static_db/names/korean_data.ts
var KOREAN_MALE_FIRSTNAMES = [
  "Min-jun",
  "Seo-jun",
  "Ha-jun",
  "Do-yun",
  "Eun-woo",
  "Si-woo",
  "Ji-ho",
  "Ye-jun",
  "Yu-jun",
  "Joo-won",
  "Su-ho",
  "Ji-hu",
  "Jun-seo",
  "Do-hyun",
  "Tae-o",
  "Seon-woo",
  "I-jun",
  "Ha-yoon",
  "Ji-woo",
  "Min-ho",
  "Hyun-woo",
  "Tae-joon",
  "Seung-ho",
  "Jae-min",
  "Dong-hyun",
  "Sang-hoon",
  "Woo-jin",
  "Jin-woo",
  "Hyeon-jun",
  "Jun-ho",
  "Sung-min",
  "Young-ho",
  "Jae-hyuk",
  "Min-seok",
  "Tae-min",
  "Hyun-seok",
  "Seung-min",
  "Ji-yong",
  "Chang-ho",
  "Kyung-ho",
  "Beom-seok",
  "Dae-hyun",
  "Kang-min",
  "Ho-jun",
  "Seok-jin",
  "Jin-hyuk",
  "Yong-jun",
  "Hoon",
  "Jae-joon",
  "Min-kyu",
  "Seung-jun",
  "Tae-hyung",
  "Ji-seok",
  "Hyun-tae",
  "Woo-seok",
  "Sang-min",
  "Dong-woo",
  "Joon-hyuk",
  "Seung-hyun",
  "Young-min",
  "Jae-won",
  "Min-woo",
  "Hyun-jin",
  "Do-won",
  "Eun-ho",
  "Si-on",
  "Ha-min",
  "Jun-young",
  "Tae-woo",
  "Seo-ho",
  "Ji-an",
  "Yu-han",
  "Seon-min",
  "Hyeon-woo",
  "Kang-woo",
  "Jin-seok",
  "Min-seong",
  "Woo-bin",
  "Jae-sung",
  "Dong-jun",
  "Sung-hoon",
  "Tae-sik",
  "Hyun-soo",
  "Seung-woo",
  "Young-joon",
  "Jae-beom",
  "Min-tae",
  "Ho-young",
  "Chang-min",
  "Kyung-min",
  "Beom-jun",
  "Dae-jun",
  "Sang-woo",
  "Jin-ho",
  "Seok-min",
  "Woo-jun",
  "Ji-hyeon",
  "Min-sik",
  "Tae-sung",
  "Hyun-min"
];
var KOREAN_MALE_SURNAMES = [
  "Kim",
  "Lee",
  "Park",
  "Choi",
  "Jung",
  "Kang",
  "Jo",
  "Yoon",
  "Jang",
  "Lim",
  "Han",
  "Oh",
  "Shin",
  "Seo",
  "Kwon",
  "Hwang",
  "Ahn",
  "Song",
  "Ryu",
  "Hong",
  "Jeon",
  "Yang",
  "Bae",
  "Son",
  "Baek",
  "Go",
  "Moon",
  "Yoo",
  "Cha",
  "Jeong",
  "Nam",
  "Sim",
  "Yeo",
  "Kwak",
  "Seong",
  "Ha",
  "Woo",
  "Im",
  "Byun",
  "Heo",
  "Yun",
  "Na",
  "Min",
  "Ji",
  "Um",
  "Jin",
  "Jwa",
  "Chae",
  "Ma",
  "Bang",
  "Ko",
  "Lee",
  "Park",
  "Kim",
  "Choi",
  "Jung",
  "Kang",
  "Yoon",
  "Jang",
  "Lim",
  "Han",
  "Oh",
  "Shin",
  "Seo",
  "Kwon",
  "Hwang",
  "Ahn",
  "Song",
  "Ryu",
  "Hong",
  "Jeon",
  "Yang",
  "Bae",
  "Son",
  "Baek",
  "Go",
  "Moon",
  "Yoo",
  "Cha",
  "Jeong",
  "Nam",
  "Sim",
  "Yeo",
  "Kwak",
  "Seong",
  "Ha",
  "Woo",
  "Im",
  "Byun",
  "Heo",
  "Yun",
  "Na",
  "Min",
  "Ji",
  "Um",
  "Jin",
  "Jwa",
  "Chae",
  "Ma",
  "Bang"
];

// resources/static_db/names/argentinian_data.ts
var ARGENTINIAN_MALE_FIRSTNAMES = [
  "Juan",
  "Carlos",
  "Luis",
  "Jorge",
  "Miguel",
  "Roberto",
  "Pedro",
  "Jos\xE9",
  "Antonio",
  "Francisco",
  "Diego",
  "Fernando",
  "Ricardo",
  "Pablo",
  "Andr\xE9s",
  "Nicol\xE1s",
  "Santiago",
  "Mat\xEDas",
  "Tom\xE1s",
  "Lucas",
  "Facundo",
  "Gonzalo",
  "Emiliano",
  "Javier",
  "Mart\xEDn",
  "Alejandro",
  "Leonardo",
  "Sebasti\xE1n",
  "Gabriel",
  "Manuel",
  "Agust\xEDn",
  "Federico",
  "Hern\xE1n",
  "Ignacio",
  "Eduardo",
  "Marcelo",
  "Ra\xFAl",
  "Hugo",
  "Oscar",
  "Daniel",
  "Adri\xE1n",
  "Gustavo",
  "Sergio",
  "Ram\xF3n",
  "Esteban",
  "Mariano",
  "Claudio",
  "V\xEDctor",
  "Enrique",
  "Alberto",
  "Mauricio",
  "Rub\xE9n",
  "Patricio",
  "Cristian",
  "David",
  "Maximiliano",
  "Benjam\xEDn",
  "Joaqu\xEDn",
  "Thiago",
  "Mateo",
  "Valent\xEDn",
  "Lautaro",
  "Franco",
  "Bruno",
  "Nicol\xE1s",
  "Santino",
  "Liam",
  "Thiago",
  "Felipe",
  "Matteo",
  "Noah",
  "Dante",
  "Jer\xF3nimo",
  "Tob\xEDas",
  "Ramiro",
  "Ezequiel",
  "Leandro",
  "Nahuel",
  "Facundo",
  "Gonzalo",
  "Emiliano",
  "Javier",
  "Mart\xEDn",
  "Alejandro",
  "Leonardo",
  "Sebasti\xE1n",
  "Gabriel",
  "Manuel",
  "Agust\xEDn",
  "Federico",
  "Hern\xE1n",
  "Ignacio",
  "Eduardo",
  "Marcelo",
  "Ra\xFAl",
  "Hugo",
  "Oscar",
  "Daniel",
  "Adri\xE1n",
  "Gustavo",
  "Sergio",
  "Ram\xF3n",
  "Esteban",
  "Mariano",
  "Claudio",
  "V\xEDctor",
  "Enrique",
  "Alberto",
  "Mauricio",
  "Rub\xE9n",
  "Patricio",
  "Cristian",
  "David",
  "Maximiliano",
  "Benjam\xEDn",
  "Joaqu\xEDn",
  "Thiago",
  "Mateo",
  "Valent\xEDn",
  "Lautaro",
  "Franco",
  "Bruno",
  "Santino",
  "Liam",
  "Felipe",
  "Matteo",
  "Noah",
  "Dante",
  "Jer\xF3nimo",
  "Tob\xEDas",
  "Ramiro",
  "Ezequiel",
  "Leandro",
  "Nahuel",
  "Alexis",
  "Brian",
  "C\xE9sar",
  "Dami\xE1n",
  "El\xEDas",
  "Fabio",
  "Gast\xF3n",
  "H\xE9ctor",
  "Iv\xE1n",
  "Julio",
  "Kevin",
  "Luciano",
  "Mat\xEDas",
  "Nicol\xE1s",
  "Octavio",
  "Pablo",
  "Quint\xEDn",
  "Rodrigo",
  "Santiago",
  "Tom\xE1s",
  "Ulises",
  "V\xEDctor",
  "Walter",
  "Xavier",
  "Yago",
  "Zacar\xEDas",
  "Abel",
  "Adolfo",
  "\xC1lvaro",
  "Amado",
  "An\xEDbal",
  "Armando",
  "Arturo",
  "Atilio",
  "Augusto",
  "Bartolom\xE9",
  "Benjam\xEDn",
  "Bernardo",
  "Blas",
  "Braulio",
  "Camilo",
  "C\xE1ndido",
  "C\xE9sar",
  "Crist\xF3bal",
  "Dami\xE1n",
  "Dar\xEDo",
  "Domingo",
  "Donato",
  "Edgardo",
  "Eduardo",
  "Elio",
  "Emilio",
  "Enrique",
  "Ernesto",
  "Eugenio",
  "Fabian",
  "Fausto",
  "Felipe",
  "Ferm\xEDn",
  "Fernando",
  "Fidel",
  "Francisco",
  "Franco",
  "Gabriel",
  "Gast\xF3n",
  "Gerardo",
  "Germ\xE1n",
  "Gilberto",
  "Gonzalo",
  "Gregorio",
  "Guillermo",
  "Gustavo",
  "H\xE9ctor",
  "Hern\xE1n",
  "Horacio",
  "Hugo",
  "Humberto",
  "Ignacio",
  "Ildefonso",
  "Ismael",
  "Jacinto",
  "Jaime",
  "Javier",
  "Jes\xFAs",
  "Jorge",
  "Jos\xE9",
  "Juan",
  "Julio",
  "Justo",
  "Lautaro",
  "Leandro",
  "Leonardo",
  "Leopoldo",
  "Lino",
  "Lorenzo",
  "Lucas",
  "Luciano",
  "Luis",
  "Manuel",
  "Marcelo",
  "Marco",
  "Marcos",
  "Mariano",
  "Mario",
  "Mart\xEDn",
  "Mateo",
  "Mat\xEDas",
  "Mauricio",
  "M\xE1ximo",
  "Miguel",
  "Milton",
  "Mois\xE9s",
  "Nahuel",
  "N\xE9stor",
  "Nicol\xE1s",
  "Norberto",
  "Octavio",
  "Omar",
  "Oscar",
  "Pablo",
  "Patricio",
  "Pedro",
  "Rafael",
  "Ram\xF3n",
  "Ra\xFAl",
  "Ren\xE9",
  "Ricardo",
  "Roberto",
  "Rodrigo",
  "Rom\xE1n",
  "Rub\xE9n",
  "Rufino",
  "Salvador",
  "Santiago",
  "Sebasti\xE1n",
  "Sergio",
  "Sim\xF3n",
  "Teodoro",
  "Tom\xE1s",
  "Ulises",
  "Uriel",
  "Valent\xEDn",
  "Vicente",
  "V\xEDctor",
  "Walter",
  "Xavier",
  "Yago",
  "Zacar\xEDas",
  "Abelardo",
  "Adalberto",
  "Ad\xE1n",
  "Agust\xEDn",
  "Albano",
  "Alejandro",
  "Alfonso",
  "Alfredo",
  "Alonso",
  "\xC1lvaro",
  "Amancio",
  "Anselmo",
  "Antonio",
  "Ariel",
  "Armando",
  "Arturo",
  "Augusto",
  "Aurelio",
  "Baltasar",
  "Bartolom\xE9",
  "Basilio",
  "Benito",
  "Bernardo",
  "Blas",
  "Bonifacio",
  "Bruno",
  "Camilo",
  "Carlos",
  "C\xE9sar",
  "Cristian",
  "Crist\xF3bal",
  "Dami\xE1n",
  "Daniel",
  "Dar\xEDo",
  "David",
  "Diego",
  "Domingo",
  "Donato",
  "Edgardo",
  "Eduardo",
  "El\xEDas",
  "Emiliano",
  "Emilio",
  "Enrique",
  "Ernesto",
  "Esteban",
  "Eugenio",
  "Fabio",
  "Facundo",
  "Federico",
  "Felipe",
  "Fernando",
  "Francisco",
  "Franco",
  "Gabriel",
  "Gast\xF3n",
  "Gerardo",
  "Germ\xE1n",
  "Gonzalo",
  "Gregorio",
  "Guillermo",
  "Gustavo",
  "H\xE9ctor",
  "Hern\xE1n",
  "Horacio",
  "Hugo",
  "Ignacio",
  "Ismael",
  "Iv\xE1n",
  "Jacinto",
  "Jaime",
  "Javier",
  "Jer\xF3nimo",
  "Jes\xFAs",
  "Joaqu\xEDn",
  "Jorge",
  "Jos\xE9",
  "Juan",
  "Julio",
  "Lautaro",
  "Leandro",
  "Leonardo",
  "Lucas",
  "Luciano",
  "Luis",
  "Manuel",
  "Marcelo",
  "Marco",
  "Mariano",
  "Mario",
  "Mart\xEDn",
  "Mateo",
  "Mat\xEDas",
  "Mauricio",
  "Maximiliano",
  "Miguel",
  "Nahuel",
  "Nicol\xE1s",
  "Octavio",
  "Oscar",
  "Pablo",
  "Patricio",
  "Pedro",
  "Rafael",
  "Ram\xF3n",
  "Ra\xFAl",
  "Ricardo",
  "Roberto",
  "Rodrigo",
  "Rom\xE1n",
  "Rub\xE9n",
  "Salvador",
  "Santiago",
  "Sebasti\xE1n",
  "Sergio",
  "Sim\xF3n",
  "Tom\xE1s",
  "Ulises",
  "Valent\xEDn",
  "V\xEDctor",
  "Walter",
  "Xavier"
];
var ARGENTINIAN_MALE_LASTNAMES = [
  "Garc\xEDa",
  "Rodr\xEDguez",
  "L\xF3pez",
  "Mart\xEDnez",
  "P\xE9rez",
  "Gonz\xE1lez",
  "S\xE1nchez",
  "Romero",
  "Fern\xE1ndez",
  "D\xEDaz",
  "Moreno",
  "\xC1lvarez",
  "Torres",
  "Ruiz",
  "Ram\xEDrez",
  "Flores",
  "Acosta",
  "Molina",
  "Su\xE1rez",
  "Castro",
  "Rojas",
  "Ortiz",
  "Silva",
  "Navarro",
  "Vargas",
  "Morales",
  "Herrera",
  "Medina",
  "Aguirre",
  "Guti\xE9rrez",
  "Ramos",
  "Jim\xE9nez",
  "Mendoza",
  "Delgado",
  "V\xE1zquez",
  "Cruz",
  "Castillo",
  "Sosa",
  "Alvarez",
  "Vega",
  "Pereyra",
  "R\xEDos",
  "Luna",
  "Mu\xF1oz",
  "Blanco",
  "Soto",
  "Campos",
  "Ibarra",
  "Peralta",
  "Ben\xEDtez",
  "M\xE9ndez",
  "Ferrari",
  "Paz",
  "Godoy",
  "Carrizo",
  "Quiroga",
  "Rivera",
  "Cort\xE9s",
  "Cabrera",
  "Vera",
  "C\xE1ceres",
  "Figueroa",
  "Dom\xEDnguez",
  "Reyes",
  "Guerrero",
  "Montes",
  "Santana",
  "Maldonado",
  "Correa",
  "Valdez",
  "Espinoza",
  "M\xE1rquez",
  "Santos",
  "Ponce",
  "Villalba",
  "Arias",
  "Ojeda",
  "Salazar",
  "Miranda",
  "Leiva",
  "Barrios",
  "Galv\xE1n",
  "Aguilera",
  "P\xE1ez",
  "Escobar",
  "Montero",
  "Alonso",
  "Contreras",
  "Barreto",
  "Duarte",
  "Palacios",
  "Serrano",
  "Pe\xF1a",
  "Carrasco",
  "Gallardo",
  "Rueda",
  "Vidal",
  "Arce",
  "Guzm\xE1n",
  "Fuentes",
  "Salas",
  "Vallejos",
  "Coronel",
  "Bustos",
  "Ledesma",
  "Franco",
  "Cardozo",
  "Lucero",
  "Nieto",
  "Rold\xE1n",
  "Villanueva",
  "Sandoval",
  "Z\xE1rate",
  "Bianchi",
  "Morel",
  "Lombardi",
  "Russo",
  "Ferrari",
  "Romano",
  "Marino",
  "Conte",
  "Bruno",
  "Rossi",
  "Bianchi",
  "Moretti",
  "Esp\xF3sito",
  "De Luca",
  "Rizzo",
  "Barbieri",
  "Colombo",
  "Gallo",
  "Gentile",
  "Greco",
  "Lombardi",
  "Marchetti",
  "Martini",
  "Mazza",
  "Monti",
  "Neri",
  "Orlando",
  "Pellegrini",
  "Ricci",
  "Rinaldi",
  "Rossi",
  "Russo",
  "Santoro",
  "Serra",
  "Sorrentino",
  "Valentini",
  "Vitale",
  "Abad",
  "Acosta",
  "Aguilar",
  "Alonso",
  "\xC1lvarez",
  "Andrade",
  "Arias",
  "Arrieta",
  "B\xE1ez",
  "Barrios",
  "Ben\xEDtez",
  "Blanco",
  "Bustos",
  "Cabrera",
  "Campos",
  "C\xE1ceres",
  "Carrizo",
  "Castillo",
  "Castro",
  "Correa",
  "Cort\xE9s",
  "Cruz",
  "Delgado",
  "D\xEDaz",
  "Dom\xEDnguez",
  "Duarte",
  "Escobar",
  "Espinoza",
  "Fern\xE1ndez",
  "Figueroa",
  "Flores",
  "Franco",
  "Fuentes",
  "Galv\xE1n",
  "Garc\xEDa",
  "Godoy",
  "G\xF3mez",
  "Gonz\xE1lez",
  "Guerrero",
  "Guti\xE9rrez",
  "Herrera",
  "Ibarra",
  "Jim\xE9nez",
  "Ledesma",
  "Leiva",
  "L\xF3pez",
  "Luna",
  "Maldonado",
  "M\xE1rquez",
  "Mart\xEDnez",
  "Medina",
  "M\xE9ndez",
  "Mendoza",
  "Miranda",
  "Molina",
  "Montero",
  "Montes",
  "Morales",
  "Moreno",
  "Mu\xF1oz",
  "Navarro",
  "Nieto",
  "Ojeda",
  "Ortiz",
  "P\xE1ez",
  "Palacios",
  "Paz",
  "Pe\xF1a",
  "Peralta",
  "P\xE9rez",
  "Ponce",
  "Quiroga",
  "Ram\xEDrez",
  "Ramos",
  "Reyes",
  "R\xEDos",
  "Rivera",
  "Rojas",
  "Rold\xE1n",
  "Romero",
  "Ruiz",
  "Salas",
  "Salazar",
  "S\xE1nchez",
  "Sandoval",
  "Santana",
  "Santos",
  "Serrano",
  "Silva",
  "Sosa",
  "Soto",
  "Su\xE1rez",
  "Torres",
  "Valdez",
  "Vallejos",
  "Vargas",
  "V\xE1zquez",
  "Vega",
  "Vera",
  "Villalba",
  "Villanueva",
  "Z\xE1rate",
  "Acu\xF1a",
  "Alarc\xF3n",
  "Almada",
  "Almir\xF3n",
  "Altamirano",
  "Amaya",
  "Arce",
  "Ardiles",
  "Arellano",
  "Ayala",
  "B\xE1ez",
  "Barreto",
  "Basualdo",
  "Battaglia",
  "Beltr\xE1n",
  "Berm\xFAdez",
  "Bogado",
  "Bonifacio",
  "Bord\xF3n",
  "Brizuela",
  "Bustos",
  "C\xE1ceres",
  "Calder\xF3n",
  "C\xE1mera",
  "Cantero",
  "Cardozo",
  "Carrizo",
  "Casco",
  "Cejas",
  "Centuri\xF3n",
  "Ch\xE1vez",
  "Coronel",
  "Corval\xE1n",
  "Crespo",
  "De la Cruz",
  "Dom\xEDnguez",
  "Duarte",
  "Encina",
  "Escobar",
  "Esp\xEDnola",
  "Falc\xF3n",
  "Far\xEDas",
  "Ferreira",
  "Flores",
  "Franco",
  "Galarza",
  "Gallardo",
  "Gim\xE9nez",
  "G\xF3mez",
  "Gonz\xE1lez",
  "Guerra",
  "Guerrero",
  "Guzm\xE1n",
  "Heredia",
  "Hern\xE1ndez",
  "Ibarra",
  "Insfr\xE1n",
  "Jara",
  "Ledesma",
  "Leiva",
  "Lencina",
  "L\xF3pez",
  "Lozano",
  "Lucero",
  "Lugo",
  "Maldonado",
  "Mar\xEDn",
  "Mart\xEDnez",
  "M\xE9ndez",
  "Mendoza",
  "Merlo",
  "Miranda",
  "Montiel",
  "Morales",
  "Moreno",
  "N\xFA\xF1ez",
  "Ojeda",
  "Oliva",
  "Ortiz",
  "Oviedo",
  "P\xE1ez",
  "Palacios",
  "Paredes",
  "Paz",
  "Pe\xF1a",
  "Peralta",
  "P\xE9rez",
  "Ponce",
  "Portillo",
  "Qui\xF1ones",
  "Quiroga",
  "Ram\xEDrez",
  "Ramos",
  "Reyes",
  "R\xEDos",
  "Rivero",
  "Rojas",
  "Romero",
  "Ruiz",
  "Salas",
  "Salazar",
  "S\xE1nchez",
  "Sandoval",
  "Santos",
  "Serrano",
  "Sosa",
  "Soto",
  "Su\xE1rez",
  "Tapia",
  "Torres",
  "Valdez",
  "Vallejos",
  "Vargas",
  "V\xE1zquez",
  "Vega",
  "Vera",
  "Villalba",
  "Villanueva",
  "Z\xE1rate",
  "Zelaya"
];

// resources/static_db/names/brazilian_data.ts
var BRAZILIAN_MALE_FIRSTNAMES = [
  "Jos\xE9",
  "Jo\xE3o",
  "Antonio",
  "Francisco",
  "Carlos",
  "Paulo",
  "Pedro",
  "Lucas",
  "Luiz",
  "Marcos",
  "Miguel",
  "Gabriel",
  "Arthur",
  "Heitor",
  "Davi",
  "Bernardo",
  "Jo\xE3o Miguel",
  "Jo\xE3o Pedro",
  "Enzo",
  "Enzo Gabriel",
  "Rafael",
  "Felipe",
  "Rodrigo",
  "Mateus",
  "Matheus",
  "Gustavo",
  "Bruno",
  "Eduardo",
  "Daniel",
  "Marcelo",
  "Thiago",
  "Tiago",
  "Andr\xE9",
  "Fernando",
  "Ricardo",
  "Roberto",
  "Jorge",
  "Alexandre",
  "Vinicius",
  "Leonardo",
  "Henrique",
  "Caio",
  "Cau\xE3",
  "Cau\xEA",
  "Kaique",
  "Kauan",
  "Luan",
  "Ryan",
  "Samuel",
  "Theo",
  "Noah",
  "Ben\xEDcio",
  "Levi",
  "Ravi",
  "Gael",
  "Matteo",
  "Bento",
  "Est\xEAv\xE3o",
  "Felipe",
  "Francisco",
  "Afonso",
  "Alejandro",
  "Alvaro",
  "Amarildo",
  "Anderson",
  "\xC2ngelo",
  "Ant\xF4nio",
  "Arnaldo",
  "Augusto",
  "Breno",
  "Caetano",
  "C\xE9sar",
  "Cl\xE1udio",
  "Cristiano",
  "Davi Lucas",
  "Diego",
  "Diogo",
  "Dion\xEDsio",
  "Douglas",
  "Edson",
  "Eduardo",
  "Elton",
  "Emerson",
  "Enrico",
  "Eric",
  "Erik",
  "F\xE1bio",
  "Fabr\xEDcio",
  "Fausto",
  "Filipe",
  "Fl\xE1vio",
  "Frederico",
  "Gabriel",
  "Gilberto",
  "Giovanni",
  "Guilherme",
  "H\xE9lio",
  "Hugo",
  "Igor",
  "\xCDtalo",
  "Ivan",
  "Jair",
  "Jo\xE3o Lucas",
  "Jo\xE3o Vitor",
  "Jonas",
  "J\xFAlio",
  "J\xFAnior",
  "Ladislau",
  "Lauro",
  "Leandro",
  "Le\xF4nidas",
  "L\xE9o",
  "Louren\xE7o",
  "Luciano",
  "Lu\xEDs",
  "Manoel",
  "Manuel",
  "Marcel",
  "M\xE1rcio",
  "Marco",
  "M\xE1rio",
  "Maur\xEDcio",
  "Murilo",
  "Natan",
  "Nelson",
  "Nicolas",
  "N\xEDcolas",
  "Ot\xE1vio",
  "Pablo",
  "Patrick",
  "Paulo Henrique",
  "Pedro Henrique",
  "Philippe",
  "Raimundo",
  "Raul",
  "Renan",
  "Renato",
  "Rian",
  "Richard",
  "Roberto",
  "Robson",
  "Rodrigo",
  "Rog\xE9rio",
  "Rom\xE1rio",
  "R\xF4mulo",
  "Ronaldo",
  "R\xFAben",
  "Sandro",
  "Sebasti\xE3o",
  "S\xE9rgio",
  "Silas",
  "Sim\xE3o",
  "Tadeu",
  "Tarc\xEDsio",
  "Thales",
  "Th\xE9o",
  "Thiago",
  "Thomas",
  "Tom\xE1s",
  "Valdir",
  "Valter",
  "Vanderlei",
  "Vitor",
  "Vit\xF3ria",
  "Wagner",
  "Waldir",
  "Washington",
  "Wesley",
  "William",
  "Xavier",
  "Yago",
  "Yuri",
  "Z\xE9",
  "Zeca",
  "Abel",
  "Adalberto",
  "Ad\xE3o",
  "Ademir",
  "Adriano",
  "A\xE9cio",
  "Ailton",
  "Airton",
  "Alan",
  "Alberto",
  "Alcides",
  "Aldo",
  "Alex",
  "Allan",
  "Alo\xEDsio",
  "Alu\xEDsio",
  "Amadeu",
  "Am\xE9rico",
  "Anselmo",
  "Antenor",
  "Aparecido",
  "Arlindo",
  "Armando",
  "Arnaldo",
  "Artur",
  "Ata\xEDde",
  "Aureliano",
  "Aur\xE9lio",
  "Baltazar",
  "Bartolomeu",
  "Bas\xEDlio",
  "Batista",
  "Belmiro",
  "Benedito",
  "Benjamim",
  "Bento",
  "Bernardo",
  "Boanerges",
  "Bonif\xE1cio",
  "Breno",
  "Caetano",
  "C\xE2ndido",
  "C\xE1ssio",
  "Celso",
  "C\xEDcero",
  "Cl\xE1udio",
  "Clodomiro",
  "Cl\xF3vis",
  "Constantino",
  "Cristiano",
  "Crist\xF3v\xE3o",
  "Dami\xE3o",
  "Dante",
  "D\xE1rio",
  "Davi",
  "D\xE9cio",
  "Dem\xE9trio",
  "Denis",
  "Deusdedit",
  "Djalma",
  "Domingos",
  "Donato",
  "Dorival",
  "Du\xEDlio",
  "Durval",
  "Edilson",
  "Edmar",
  "Edmilson",
  "Edson",
  "Eduardo",
  "El\xE1dio",
  "Elias",
  "El\xEDsio",
  "Elton",
  "Emanuel",
  "Em\xEDlio",
  "En\xE9as",
  "Ernesto",
  "Est\xE1cio",
  "Eug\xEAnio",
  "Eurico",
  "Evaristo",
  "Everaldo",
  "Expedito",
  "F\xE1bio",
  "Fabricio",
  "Faustino",
  "Fausto",
  "Feliciano",
  "F\xE9lix",
  "Fernandes",
  "Firmino",
  "Fl\xE1vio",
  "Flor\xEAncio",
  "Fortunato",
  "Francisco",
  "Franco",
  "Frederico",
  "Gabriel",
  "Geraldo",
  "Germano",
  "Get\xFAlio",
  "Gide\xE3o",
  "Gil",
  "Gilberto",
  "Glauber",
  "Glauco",
  "Gon\xE7alo",
  "Greg\xF3rio",
  "Guilherme",
  "Gustavo",
  "Hamilton",
  "Haroldo",
  "H\xE9lio",
  "Henrique",
  "Hermes",
  "Hil\xE1rio",
  "Humberto",
  "Ibrahim",
  "Idal\xEDcio",
  "In\xE1cio",
  "Irineu",
  "Isa\xEDas",
  "Ismael",
  "Israel",
  "Ivan",
  "Ivo",
  "Jacinto",
  "Jackson",
  "Jaime",
  "Jair",
  "Jairo",
  "James",
  "J\xE2nio",
  "Jardel",
  "Jarbas",
  "Jeferson",
  "Jer\xF4nimo",
  "Jesu\xEDno",
  "Jo\xE3o",
  "Joaquim",
  "Joel",
  "Jonas",
  "Jorge",
  "Jos\xE9",
  "Josu\xE9",
  "Joviano",
  "Juarez",
  "J\xFAlio",
  "J\xFAnior",
  "Juraci",
  "Justiniano",
  "Juvenal",
  "Kl\xE9ber",
  "Laerte",
  "Lauro",
  "Leandro",
  "Le\xF4ncio",
  "Leopoldo",
  "L\xEDdio",
  "Lino",
  "Louren\xE7o",
  "Lucas",
  "Luciano",
  "Lu\xEDs",
  "Maciel",
  "Manoel",
  "Manuel",
  "Marcelo",
  "M\xE1rcio",
  "Marco",
  "Marcos",
  "M\xE1rio",
  "Martinho",
  "Mateus",
  "Matheus",
  "Maur\xEDcio",
  "Mauro",
  "M\xE1ximo",
  "Melqu\xEDades",
  "Micael",
  "Miguel",
  "Milton",
  "Moacir",
  "Moises",
  "Murilo",
  "Nabor",
  "Nataniel",
  "N\xE9lio",
  "Nelson",
  "Nestor",
  "Newton",
  "Nicolau",
  "Nilo",
  "Nilton",
  "Nivaldo",
  "Norberto",
  "Olavo",
  "Ol\xEDmpio",
  "Onofre",
  "Oriovaldo",
  "Oscar",
  "Osman",
  "Osmar",
  "Osvaldo",
  "Otac\xEDlio",
  "Ot\xE1vio",
  "Otoniel",
  "Ovaldo",
  "Ozeias",
  "Pablo",
  "Pascoal",
  "Patr\xEDcio",
  "Paulo",
  "Pedro",
  "Pel\xE9",
  "Percival",
  "P\xE9ricles",
  "Pierre",
  "Pl\xEDnio",
  "Policarpo",
  "Prudente",
  "Quintino",
  "Rafael",
  "Raimundo",
  "Ramiro",
  "Ra\xFAl",
  "Reginaldo",
  "Reinaldo",
  "Renan",
  "Renato",
  "Ricardo",
  "Roberto",
  "Robson",
  "Rodolfo",
  "Rodrigo",
  "Rog\xE9rio",
  "Rom\xE1rio",
  "R\xF4mulo",
  "Ronald",
  "Ronaldo",
  "Roque",
  "Rui",
  "Ruy",
  "S\xE1lvio",
  "Samuel",
  "Sandoval",
  "Sandro",
  "Santiago",
  "Saulo",
  "Sebasti\xE3o",
  "S\xE9rgio",
  "Severino",
  "Sidney",
  "Silas",
  "Silvestre",
  "Sim\xE3o",
  "Sime\xE3o",
  "S\xEDlvio",
  "Sim\xE3o",
  "Sotero",
  "Stanislau",
  "Tadeu",
  "Tarc\xEDsio",
  "Tasso",
  "Teodoro",
  "Te\xF3filo",
  "Ter\xEAncio",
  "Thales",
  "Th\xE9o",
  "Thiago",
  "Thomas",
  "Thomaz",
  "Tib\xE9rio",
  "Tim\xF3teo",
  "Tobias",
  "Tom\xE1s",
  "Trist\xE3o",
  "Ubirajara",
  "Ubiratan",
  "Ulisses",
  "Urbano",
  "Valdemar",
  "Valdir",
  "Valter",
  "Vanderlei",
  "Vasco",
  "Ven\xE2ncio",
  "Venceslau",
  "Vicente",
  "Victor",
  "Vidal",
  "Vin\xEDcius",
  "Virg\xEDlio",
  "V\xEDtor",
  "Wagner",
  "Waldemar",
  "Waldir",
  "Washington",
  "Wellington",
  "Wesley",
  "William",
  "Wilson",
  "Xavier",
  "Yago",
  "Yuri",
  "Zacarias",
  "Zeno",
  "Z\xE9",
  "Zeca"
];
var BRAZILIAN_MALE_LASTNAMES = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Pereira",
  "Ferreira",
  "Lima",
  "Alves",
  "Rodrigues",
  "Costa",
  "Sousa",
  "Gomes",
  "Nascimento",
  "Araujo",
  "Ribeiro",
  "Almeida",
  "Jesus",
  "Barbosa",
  "Soares",
  "Carvalho",
  "Martins",
  "Rocha",
  "Dias",
  "Nunes",
  "Freitas",
  "Conceicao",
  "Melo",
  "Moreira",
  "Cardoso",
  "Reis",
  "Cruz",
  "Goncalves",
  "Andrade",
  "Mendes",
  "Teixeira",
  "Vieira",
  "Machado",
  "Marques",
  "Fernandes",
  "Lopes",
  "Santana",
  "Bezerra",
  "Campos",
  "Moraes",
  "Borges",
  "Monteiro",
  "Moura",
  "Miranda",
  "Castro",
  "Sampaio",
  "Siqueira",
  "Azevedo",
  "Cavalcante",
  "Coelho",
  "Correia",
  "Duarte",
  "Figueiredo",
  "Fonseca",
  "Garcia",
  "Leite",
  "Macedo",
  "Medeiros",
  "Moraes",
  "Morais",
  "Neves",
  "Pinto",
  "Queiroz",
  "Ramos",
  "Santos",
  "Silveira",
  "Torres",
  "Vargas",
  "Vieira",
  "Xavier",
  "Abreu",
  "Aguiar",
  "Amaral",
  "Amorim",
  "Andrade",
  "Anjos",
  "Antunes",
  "Aparecido",
  "Araujo",
  "Assis",
  "Azevedo",
  "Baptista",
  "Barreto",
  "Batista",
  "Borges",
  "Brandao",
  "Brito",
  "Bueno",
  "Cabral",
  "Caldas",
  "Caldeira",
  "Camargo",
  "Campos",
  "Cardoso",
  "Carneiro",
  "Carvalho",
  "Castilho",
  "Castro",
  "Cavalcanti",
  "Chaves",
  "Clemente",
  "Coelho",
  "Conceicao",
  "Correa",
  "Costa",
  "Coutinho",
  "Cruz",
  "Cunha",
  "Dantas",
  "Dias",
  "Diniz",
  "Domingues",
  "Duarte",
  "Farias",
  "Fernandes",
  "Ferreira",
  "Figueira",
  "Figueiredo",
  "Fonseca",
  "Franco",
  "Freitas",
  "Furtado",
  "Gama",
  "Garcia",
  "Gomes",
  "Goncalves",
  "Guerra",
  "Guimaraes",
  "Henrique",
  "Jesus",
  "Leal",
  "Leite",
  "Lima",
  "Lopes",
  "Loureiro",
  "Luz",
  "Macedo",
  "Machado",
  "Magalhaes",
  "Marques",
  "Martins",
  "Medeiros",
  "Melo",
  "Mendes",
  "Mendonca",
  "Miranda",
  "Monteiro",
  "Montes",
  "Moraes",
  "Morais",
  "Moreira",
  "Moura",
  "Muniz",
  "Nascimento",
  "Neves",
  "Nogueira",
  "Nunes",
  "Oliveira",
  "Pacheco",
  "Paiva",
  "Peixoto",
  "Pereira",
  "Pimentel",
  "Pinheiro",
  "Pinto",
  "Pires",
  "Queiroz",
  "Ramos",
  "Reis",
  "Rezende",
  "Ribeiro",
  "Rocha",
  "Rodrigues",
  "Romao",
  "Sampaio",
  "Santana",
  "Santiago",
  "Santos",
  "Saraiva",
  "Silva",
  "Silveira",
  "Siqueira",
  "Soares",
  "Sobrinho",
  "Sousa",
  "Souza",
  "Tavares",
  "Teixeira",
  "Torres",
  "Valente",
  "Valeriano",
  "Vargas",
  "Vasconcelos",
  "Ventura",
  "Vieira",
  "Xavier",
  "Afonso",
  "Aguiar",
  "Albuquerque",
  "Alencar",
  "Almeida",
  "Alves",
  "Amaral",
  "Andrade",
  "Antunes",
  "Araujo",
  "Assuncao",
  "Azevedo",
  "Barbosa",
  "Barros",
  "Batista",
  "Bezerra",
  "Bittencourt",
  "Borges",
  "Brandao",
  "Brito",
  "Bueno",
  "Cabral",
  "Caldas",
  "Camargo",
  "Campos",
  "Cardoso",
  "Carneiro",
  "Carvalho",
  "Castro",
  "Cavalcanti",
  "Chaves",
  "Clemente",
  "Coelho",
  "Conceicao",
  "Correa",
  "Costa",
  "Couto",
  "Cruz",
  "Cunha",
  "Dantas",
  "Dias",
  "Diniz",
  "Domingues",
  "Duarte",
  "Farias",
  "Fernandes",
  "Ferreira",
  "Figueiredo",
  "Fonseca",
  "Franco",
  "Freitas",
  "Furtado",
  "Gama",
  "Garcia",
  "Gomes",
  "Goncalves",
  "Guimaraes",
  "Henriques",
  "Jesus",
  "Leal",
  "Leite",
  "Lima",
  "Lopes",
  "Loureiro",
  "Machado",
  "Magalhaes",
  "Marques",
  "Martins",
  "Medeiros",
  "Melo",
  "Mendes",
  "Mendonca",
  "Miranda",
  "Monteiro",
  "Moraes",
  "Moreira",
  "Moura",
  "Nascimento",
  "Neves",
  "Nogueira",
  "Nunes",
  "Oliveira",
  "Pacheco",
  "Paiva",
  "Peixoto",
  "Pereira",
  "Pimentel",
  "Pinheiro",
  "Pinto",
  "Pires",
  "Queiroz",
  "Ramos",
  "Reis",
  "Ribeiro",
  "Rocha",
  "Rodrigues",
  "Sampaio",
  "Santana",
  "Santos",
  "Silva",
  "Silveira",
  "Soares",
  "Sousa",
  "Souza",
  "Tavares",
  "Teixeira",
  "Torres",
  "Valente",
  "Vieira",
  "Xavier",
  "Abreu",
  "Aguiar",
  "Alencar",
  "Almeida",
  "Alves",
  "Amaral",
  "Andrade",
  "Araujo",
  "Azevedo",
  "Barbosa",
  "Barros",
  "Batista",
  "Bezerra",
  "Borges",
  "Brandao",
  "Brito",
  "Cabral",
  "Campos",
  "Cardoso",
  "Carvalho",
  "Castro",
  "Cavalcanti",
  "Coelho",
  "Correa",
  "Costa",
  "Cruz",
  "Cunha",
  "Dias",
  "Duarte",
  "Fernandes",
  "Ferreira",
  "Fonseca",
  "Freitas",
  "Garcia",
  "Gomes",
  "Goncalves",
  "Guimaraes",
  "Jesus",
  "Leite",
  "Lima",
  "Lopes",
  "Machado",
  "Marques",
  "Martins",
  "Medeiros",
  "Melo",
  "Mendes",
  "Miranda",
  "Monteiro",
  "Moraes",
  "Moreira",
  "Moura",
  "Nascimento",
  "Neves",
  "Nogueira",
  "Nunes",
  "Oliveira",
  "Pereira",
  "Pinheiro",
  "Pinto",
  "Ramos",
  "Reis",
  "Ribeiro",
  "Rocha",
  "Rodrigues",
  "Santos",
  "Silva",
  "Silveira",
  "Soares",
  "Souza",
  "Teixeira",
  "Torres",
  "Vieira",
  "Xavier"
];

// resources/static_db/names/turkish_data.ts
var TURKISH_MALE_FIRSTNAMES = [
  "Ahmet",
  "Mehmet",
  "Mustafa",
  "Ali",
  "Huseyin",
  "Hasan",
  "Ibrahim",
  "Yusuf",
  "Osman",
  "Omer",
  "Emre",
  "Burak",
  "Furkan",
  "Murat",
  "Kaan",
  "Can",
  "Eren",
  "Baris",
  "Deniz",
  "Onur",
  "Serkan",
  "Tolga",
  "Umut",
  "Yasin",
  "Batuhan",
  "Berat",
  "Cagan",
  "Dogan",
  "Efe",
  "Fatih",
  "Gokhan",
  "Halil",
  "Ismail",
  "Kerem",
  "Levent",
  "Mert",
  "Nihat",
  "Okan",
  "Polat",
  "Riza",
  "Selim",
  "Taha",
  "Ugur",
  "Volkan",
  "Yilmaz",
  "Zafer",
  "Adem",
  "Berk",
  "Cem",
  "Derya",
  "Ege",
  "Ferhat",
  "Gokce",
  "Hakan",
  "Ilker",
  "Kemal",
  "Lutfi",
  "Muhammed",
  "Necati",
  "Orhan",
  "Poyraz",
  "Recep",
  "Salih",
  "Tuncay",
  "Ufuk",
  "Vedat",
  "Yusuf",
  "Ziya",
  "Arda",
  "Bora",
  "Cihan",
  "Doruk",
  "Efe",
  "Firat",
  "Gokturk",
  "Harun",
  "Ilhan",
  "Kadir",
  "Levent",
  "Mete",
  "Nihat",
  "Oguz",
  "Pelin",
  "Rauf",
  "Sefa",
  "Tayfun",
  "Ulas",
  "Veli",
  "Yalcin",
  "Zeki",
  "Alp",
  "Baran",
  "Cemil",
  "Davut",
  "Ekin",
  "Fikret",
  "Gurkan",
  "Hamza",
  "Isik",
  "Jan",
  "Kaan",
  "Lale",
  "Murat",
  "Nazim",
  "Ozan",
  "Pinar",
  "Rasim",
  "Serdar",
  "Tamer",
  "Ugur",
  "Veysel",
  "Yavuz",
  "Zeynel",
  "Ahmet",
  "Mehmet",
  "Mustafa",
  "Ali",
  "Huseyin",
  "Hasan",
  "Ibrahim",
  "Yusuf",
  "Osman",
  "Omer",
  "Emre",
  "Burak",
  "Furkan",
  "Murat",
  "Kaan",
  "Can",
  "Eren",
  "Baris",
  "Deniz",
  "Onur",
  "Serkan",
  "Tolga",
  "Umut",
  "Yasin",
  "Batuhan",
  "Berat",
  "Cagan",
  "Dogan",
  "Efe",
  "Fatih",
  "Gokhan",
  "Halil",
  "Ismail",
  "Kerem",
  "Levent",
  "Mert",
  "Nihat",
  "Okan",
  "Polat",
  "Riza",
  "Selim",
  "Taha",
  "Ugur",
  "Volkan",
  "Yilmaz",
  "Zafer",
  "Adem",
  "Berk",
  "Cem",
  "Derya",
  "Ege",
  "Ferhat",
  "Gokce",
  "Hakan",
  "Ilker",
  "Kemal",
  "Lutfi",
  "Muhammed",
  "Necati",
  "Orhan",
  "Poyraz",
  "Recep",
  "Salih",
  "Tuncay",
  "Ufuk",
  "Vedat",
  "Yusuf",
  "Ziya",
  "Arda",
  "Bora",
  "Cihan",
  "Doruk",
  "Efe",
  "Firat",
  "Gokturk",
  "Harun",
  "Ilhan",
  "Kadir",
  "Levent",
  "Mete",
  "Nihat",
  "Oguz",
  "Rauf",
  "Sefa",
  "Tayfun",
  "Ulas",
  "Veli",
  "Yalcin",
  "Zeki",
  "Alp",
  "Baran",
  "Cemil",
  "Davut",
  "Ekin",
  "Fikret",
  "Gurkan",
  "Hamza",
  "Isik",
  "Jan",
  "Kaan",
  "Lale",
  "Murat",
  "Nazim",
  "Ozan",
  "Rasim",
  "Serdar",
  "Tamer",
  "Ugur",
  "Veysel",
  "Yavuz",
  "Zeynel",
  "Abdullah",
  "Bilal",
  "Cahit",
  "Demir",
  "Enes",
  "Feyyaz",
  "Guven",
  "Hayri",
  "Idris",
  "Kivanc",
  "Latif",
  "Metehan",
  "Nurettin",
  "Oktay",
  "Peker",
  "Ramazan",
  "Savas",
  "Tarkan",
  "Utku",
  "Vural",
  "Yasin",
  "Zulfikar",
  "Akin",
  "Bulent",
  "Cengiz",
  "Dursun",
  "Ekrem",
  "Fikri",
  "Gokalp",
  "Huda",
  "Izzet",
  "Korkut",
  "Mahmut",
  "Naci",
  "Ozgur",
  "Ridvan",
  "Suleyman",
  "Talat",
  "Umit",
  "Vedat",
  "Yener",
  "Zekeriya",
  "Alper",
  "Baris",
  "Caner",
  "Deniz",
  "Eray",
  "Fatih",
  "Gursel",
  "Hakan",
  "Ismail",
  "Kaan",
  "Levent",
  "Mert",
  "Nihat",
  "Okan",
  "Polat",
  "Riza",
  "Selim",
  "Taha",
  "Ugur",
  "Volkan",
  "Yilmaz",
  "Zafer",
  "Adem"
];
var TURKISH_MALE_LASTNAMES = [
  "Yilmaz",
  "Kaya",
  "Demir",
  "Sahin",
  "Celik",
  "Ozturk",
  "Aydin",
  "Ozdemir",
  "Arslan",
  "Dogan",
  "Kilic",
  "Aslan",
  "Tas",
  "Kaplan",
  "Cetin",
  "Koc",
  "Kurt",
  "Polat",
  "Ozkan",
  "Simsek",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Ozkan",
  "Demirel",
  "Karakas",
  "Kilic",
  "Sahin",
  "Koc",
  "Yilmaz",
  "Demir",
  "Kaya",
  "Arslan",
  "Aydin",
  "Ozturk",
  "Ozdemir",
  "Celik",
  "Dogan",
  "Kaplan",
  "Tas",
  "Polat",
  "Kurt",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Demirel",
  "Karakas",
  "Kilic",
  "Sahin",
  "Koc",
  "Yilmaz",
  "Demir",
  "Kaya",
  "Arslan",
  "Aydin",
  "Ozturk",
  "Ozdemir",
  "Celik",
  "Dogan",
  "Kaplan",
  "Tas",
  "Polat",
  "Kurt",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Demirel",
  "Karakas",
  "Kilic",
  "Sahin",
  "Koc",
  "Yilmaz",
  "Demir",
  "Kaya",
  "Arslan",
  "Aydin",
  "Ozturk",
  "Ozdemir",
  "Celik",
  "Dogan",
  "Kaplan",
  "Tas",
  "Polat",
  "Kurt",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Demirel",
  "Karakas",
  "Kilic",
  "Sahin",
  "Koc",
  "Yilmaz",
  "Demir",
  "Kaya",
  "Arslan",
  "Aydin",
  "Ozturk",
  "Ozdemir",
  "Celik",
  "Dogan",
  "Kaplan",
  "Tas",
  "Polat",
  "Kurt",
  "Erdogan",
  "Aksoy",
  "Bulut",
  "Gunes",
  "Yildiz",
  "Tekin",
  "Guler",
  "Aktas",
  "Kara",
  "Yalcin",
  "Er",
  "Sari",
  "Keskin",
  "Ozer",
  "Turk",
  "Ucar",
  "Acar",
  "Korkmaz",
  "Sen",
  "Yildirim",
  "Boz",
  "Oz",
  "Ak",
  "Gok",
  "Deniz",
  "Eren",
  "Yavuz",
  "Sonmez",
  "Cakir",
  "Ozcelik",
  "Karaca",
  "Turan",
  "Gunduz",
  "Akgun",
  "Colak",
  "Sert",
  "Bayraktar",
  "Karahan",
  "Demirel"
];

// resources/static_db/names/arabic_data.ts
var ARABIC_MALE_FIRSTNAMES = [
  "Ahmed",
  "Mohammed",
  "Ali",
  "Omar",
  "Abdullah",
  "Hassan",
  "Hussein",
  "Ibrahim",
  "Yusuf",
  "Hamza",
  "Amir",
  "Khalid",
  "Faisal",
  "Zayd",
  "Bilal",
  "Anas",
  "Adam",
  "Yahya",
  "Zakariya",
  "Imran",
  "Musa",
  "Isa",
  "Dawoud",
  "Sulaiman",
  "Harun",
  "Idris",
  "Ayman",
  "Karim",
  "Malik",
  "Nasser",
  "Rashid",
  "Saif",
  "Tariq",
  "Zain",
  "Farhan",
  "Jamal",
  "Khalil",
  "Mahmoud",
  "Mustafa",
  "Nabil",
  "Qasim",
  "Rami",
  "Sami",
  "Tamer",
  "Waleed",
  "Yasser",
  "Zaki",
  "Abbas",
  "Adel",
  "Akram",
  "Amin",
  "Ashraf",
  "Basil",
  "Daniyal",
  "Ehsan",
  "Fahad",
  "Ghaith",
  "Hadi",
  "Ihsan",
  "Jabir",
  "Kamil",
  "Latif",
  "Mansur",
  "Nadeem",
  "Osman",
  "Qadir",
  "Rafiq",
  "Saber",
  "Talib",
  "Umar",
  "Waqas",
  "Younus",
  "Zahir",
  "Abdulaziz",
  "Abdulrahman",
  "Abdulhamid",
  "Abdurrahman",
  "Ahmad",
  "Ameer",
  "Ammar",
  "Arif",
  "Asad",
  "Ayyub",
  "Badr",
  "Bakr",
  "Bassam",
  "Bilal",
  "Daoud",
  "Fadi",
  "Firas",
  "Ghassan",
  "Habib",
  "Hakim",
  "Hani",
  "Harith",
  "Haytham",
  "Hilal",
  "Hisham",
  "Ilyas",
  "Ismail",
  "Jafar",
  "Jalal",
  "Jasim",
  "Jawad",
  "Kareem",
  "Kays",
  "Khaled",
  "Luay",
  "Maher",
  "Majid",
  "Marwan",
  "Mazen",
  "Mikhail",
  "Mubarak",
  "Muhammed",
  "Munir",
  "Murad",
  "Nader",
  "Naeem",
  "Najib",
  "Nasir",
  "Nawaf",
  "Nizar",
  "Othman",
  "Qais",
  "Raed",
  "Raheem",
  "Rahim",
  "Rayan",
  "Riyad",
  "Saad",
  "Saber",
  "Sadiq",
  "Saeed",
  "Salah",
  "Saleh",
  "Salim",
  "Samir",
  "Saud",
  "Shadi",
  "Shakir",
  "Sherif",
  "Sufyan",
  "Taha",
  "Tawfiq",
  "Tayyib",
  "Uthman",
  "Wael",
  "Yacoub",
  "Yasin",
  "Yazid",
  "Zafar",
  "Ziad",
  "Ziyad",
  "Abdul",
  "Abdulkarim",
  "Abdulqadir",
  "Abdurrahim",
  "Adnan",
  "Aftab",
  "Ahab",
  "Akil",
  "Alaa",
  "Alim",
  "Amjad",
  "Anwar",
  "Aqeel",
  "Arslan",
  "Asim",
  "Ata",
  "Atef",
  "Aziz",
  "Bahir",
  "Baha",
  "Barak",
  "Bashir",
  "Bassem",
  "Bayram",
  "Burhan",
  "Dahir",
  "Daud",
  "Dhia",
  "Diyar",
  "Emad",
  "Fadel",
  "Fahd",
  "Farid",
  "Fathi",
  "Fawzi",
  "Fayez",
  "Fayyad",
  "Fuad",
  "Gamal",
  "Ghazi",
  "Hafez",
  "Hafiz",
  "Hajjaj",
  "Halim",
  "Hamid",
  "Hamza",
  "Hanif",
  "Haqqi",
  "Harbi",
  "Hashem",
  "Hatim",
  "Hayder",
  "Hazem",
  "Husam",
  "Hussam",
  "Ihab",
  "Ilyan",
  "Imad",
  "Irfan",
  "Iskandar",
  "Izz",
  "Jabbar",
  "Jaber",
  "Jibril",
  "Juma",
  "Kadar",
  "Kadir",
  "Kais",
  "Kamran",
  "Kasim",
  "Kassim",
  "Kayyum",
  "Khair",
  "Khalaf",
  "Khayyam",
  "Lutfi",
  "Madi",
  "Mahdi",
  "Mahir",
  "Mahmud",
  "Mansoor",
  "Maruf",
  "Masoud",
  "Mazin",
  "Mehdi",
  "Mishal",
  "Mokhtar",
  "Momin",
  "Mubashir",
  "Muhamad",
  "Muhib",
  "Muin",
  "Mujtaba",
  "Mukhtar",
  "Munther",
  "Musab",
  "Musharraf",
  "Mutasim",
  "Nabil",
  "Nadir",
  "Nafi",
  "Najm",
  "Nasim",
  "Nassim",
  "Nawaz",
  "Nazir",
  "Nihad",
  "Noman",
  "Nur",
  "Nuri",
  "Omar",
  "Qamar",
  "Qasim",
  "Qusay",
  "Rachid",
  "Radwan",
  "Rafat",
  "Rahman",
  "Raihan",
  "Rais",
  "Rajab",
  "Ramadan",
  "Ramez",
  "Rami",
  "Ramzi",
  "Rani",
  "Raouf",
  "Rauf",
  "Rayan",
  "Reda",
  "Riad",
  "Riyadh",
  "Rizwan",
  "Rohan",
  "Saad",
  "Sabbah",
  "Sabir",
  "Sabri",
  "Saeed",
  "Safwan",
  "Sahil",
  "Sahir",
  "Sajid",
  "Sajjad",
  "Sakib",
  "Salahuddin",
  "Salam",
  "Salem",
  "Sami",
  "Samir",
  "Sana",
  "Saud",
  "Sayeed",
  "Shaban",
  "Shafiq",
  "Shahid",
  "Shamil",
  "Sharif",
  "Shayan",
  "Sherif",
  "Shuaib",
  "Siddiq",
  "Siraj",
  "Sohail",
  "Sufian",
  "Suhail",
  "Suleiman",
  "Tahir",
  "Taimur",
  "Talal",
  "Talha",
  "Tamim",
  "Taqi",
  "Tarik",
  "Tawfik",
  "Tayeb",
  "Taysir",
  "Thabit",
  "Thamer",
  "Ubaid",
  "Umar",
  "Usama",
  "Usman",
  "Wadud",
  "Wafi",
  "Wahab",
  "Wahid",
  "Wajdi",
  "Wajih",
  "Walid",
  "Waqar",
  "Wasim",
  "Yahia",
  "Yakub",
  "Yaman",
  "Yamin",
  "Yasir",
  "Yassin",
  "Younis",
  "Yunis",
  "Yusri",
  "Zafir",
  "Zahid",
  "Zaid",
  "Zain",
  "Zaki",
  "Zaman",
  "Zameer",
  "Ziyad",
  "Zubair",
  "Zuhair"
];
var ARABIC_MALE_LASTNAMES = [
  "Ahmed",
  "Mohammed",
  "Ali",
  "Hassan",
  "Hussein",
  "Ibrahim",
  "Abdullah",
  "Khan",
  "Al-Ahmad",
  "Al-Ali",
  "Al-Masri",
  "Al-Saud",
  "Abdul",
  "Abdullah",
  "Ahmad",
  "Al-Farsi",
  "Al-Haddad",
  "Al-Hussein",
  "Al-Masri",
  "Al-Qadi",
  "Al-Saadi",
  "Al-Tamimi",
  "Abbas",
  "Abboud",
  "Abadi",
  "Abd al-Rashid",
  "Abdelhamid",
  "Abdelkrim",
  "Abdellatif",
  "Abdelrahman",
  "Abdulaziz",
  "Abdulkarim",
  "Abdulrahman",
  "Ahmad",
  "Akram",
  "Al-Amin",
  "Al-Aziz",
  "Al-Baghdadi",
  "Al-Bakri",
  "Al-Dawoodi",
  "Al-Fayed",
  "Al-Ghamdi",
  "Al-Hakim",
  "Al-Harbi",
  "Al-Jabari",
  "Al-Juhani",
  "Al-Khatib",
  "Al-Mahmoud",
  "Al-Najjar",
  "Al-Naimi",
  "Al-Qasimi",
  "Al-Rashid",
  "Al-Sayed",
  "Al-Sharif",
  "Al-Shehri",
  "Al-Zahrani",
  "Ansari",
  "Awad",
  "Ayad",
  "Aziz",
  "Badawi",
  "Bakir",
  "Bishara",
  "Darwish",
  "El-Sayed",
  "Fahmy",
  "Farouk",
  "Ghanem",
  "Habib",
  "Haddad",
  "Hakim",
  "Hamdan",
  "Hamid",
  "Hanna",
  "Hashem",
  "Hassan",
  "Husseini",
  "Ibrahim",
  "Isa",
  "Jabbar",
  "Jaber",
  "Jalil",
  "Jamal",
  "Karam",
  "Khalaf",
  "Khalid",
  "Khalil",
  "Khoury",
  "Mahmoud",
  "Malik",
  "Mansour",
  "Marwan",
  "Masri",
  "Matta",
  "Moussa",
  "Mustafa",
  "Nader",
  "Najjar",
  "Nasr",
  "Nassar",
  "Nawaf",
  "Nazari",
  "Omar",
  "Osman",
  "Qasim",
  "Qureshi",
  "Rahman",
  "Rashid",
  "Rizk",
  "Saad",
  "Sabri",
  "Saeed",
  "Said",
  "Salah",
  "Saleh",
  "Salim",
  "Samir",
  "Sayed",
  "Shaaban",
  "Shafiq",
  "Shah",
  "Sharif",
  "Sheikh",
  "Suleiman",
  "Taha",
  "Tawfik",
  "Yassin",
  "Younes",
  "Zaid",
  "Zaki",
  "Zaman",
  "Zayed",
  "Zubair",
  "Abaza",
  "Abbas",
  "Abdallah",
  "Abdelnour",
  "Abdelqader",
  "Abdi",
  "Abdo",
  "Abdulhamid",
  "Abdulqadir",
  "Abdurrahim",
  "Adel",
  "Adnan",
  "Afif",
  "Agha",
  "Ahmad",
  "Akel",
  "Alam",
  "Alami",
  "Alawi",
  "Alayyan",
  "Alfarsi",
  "Alhassan",
  "Alkhatib",
  "Allam",
  "Almasri",
  "Alqadi",
  "Alsaadi",
  "Altamimi",
  "Amin",
  "Amir",
  "Ammar",
  "Ansari",
  "Antar",
  "Arafat",
  "Arabi",
  "Arif",
  "Asfour",
  "Ashour",
  "Aslan",
  "Assaf",
  "Atiyeh",
  "Attar",
  "Awad",
  "Ayoub",
  "Azar",
  "Aziz",
  "Badr",
  "Bahri",
  "Bakri",
  "Barakat",
  "Bassam",
  "Baydoun",
  "Bazzi",
  "Bechara",
  "Bishara",
  "Bitar",
  "Boulos",
  "Chahine",
  "Daher",
  "Dahman",
  "Darwish",
  "Dawood",
  "Deeb",
  "Diab",
  "Dib",
  "Eid",
  "Elhage",
  "Elkhoury",
  "Essa",
  "Fadel",
  "Fahad",
  "Fakhry",
  "Faraj",
  "Farhat",
  "Faris",
  "Fawaz",
  "Fayad",
  "Fayyad",
  "Fekry",
  "Fouad",
  "Gaber",
  "Gad",
  "Gamal",
  "Ghaleb",
  "Ghanem",
  "Ghazi",
  "Habashi",
  "Haddad",
  "Hajjar",
  "Hakim",
  "Halabi",
  "Hamed",
  "Hamid",
  "Hamza",
  "Hanna",
  "Harb",
  "Hassan",
  "Hatem",
  "Hayek",
  "Hazan",
  "Hindi",
  "Hossain",
  "Hussein",
  "Ibrahim",
  "Idris",
  "Isa",
  "Ismail",
  "Jabour",
  "Jadallah",
  "Jafar",
  "Jalil",
  "Jamal",
  "Jamil",
  "Jawad",
  "Kadi",
  "Kahil",
  "Kanaan",
  "Karim",
  "Kassab",
  "Kattan",
  "Kawash",
  "Khalaf",
  "Khalid",
  "Khalife",
  "Khalil",
  "Khatib",
  "Khayat",
  "Khoury",
  "Kobrosly",
  "Lahoud",
  "Latif",
  "Louca",
  "Maalouf",
  "Madi",
  "Mahfouz",
  "Mahmoud",
  "Makhoul",
  "Malek",
  "Mansour",
  "Maroun",
  "Masri",
  "Matta",
  "Melhem",
  "Mikhail",
  "Mokbel",
  "Moussa",
  "Mukhtar",
  "Musa",
  "Mustafa",
  "Nabil",
  "Nader",
  "Naeem",
  "Najjar",
  "Nasr",
  "Nassar",
  "Nawfal",
  "Nazarian",
  "Nour",
  "Obeid",
  "Omar",
  "Osman",
  "Othman",
  "Qadri",
  "Qasim",
  "Qureshi",
  "Raad",
  "Rachid",
  "Radwan",
  "Rahal",
  "Rahman",
  "Raji",
  "Ramadan",
  "Rami",
  "Rashed",
  "Rashid",
  "Rizk",
  "Saab",
  "Saad",
  "Sabbagh",
  "Sabri",
  "Sadek",
  "Saeed",
  "Safadi",
  "Said",
  "Sakr",
  "Salama",
  "Saleh",
  "Salim",
  "Sami",
  "Samman",
  "Sarkis",
  "Semaan",
  "Shaar",
  "Shaban",
  "Shadi",
  "Shafik",
  "Shahid",
  "Shahin",
  "Shalhoub",
  "Shamoun",
  "Sharaf",
  "Sharif",
  "Shatila",
  "Shawky",
  "Shehadeh",
  "Sheikh",
  "Shoukry",
  "Sleiman",
  "Suleiman",
  "Taha",
  "Tamer",
  "Tamim",
  "Tarazi",
  "Tawil",
  "Tayyar",
  "Touma",
  "Wahba",
  "Wahid",
  "Yacoub",
  "Yaghi",
  "Yahya",
  "Yakoub",
  "Yassin",
  "Younes",
  "Youssef",
  "Zaatari",
  "Zahran",
  "Zaid",
  "Zain",
  "Zakar",
  "Zaki",
  "Zaman",
  "Zammar",
  "Zoghbi",
  "Zoubi",
  "Zubair",
  "Zureikat"
];

// resources/static_db/names/finnish_data.ts
var FINNISH_MALE_FIRSTNAMES = [
  "Oliver",
  "Eino",
  "V\xE4in\xF6",
  "Leo",
  "Elias",
  "Onni",
  "Toivo",
  "Oiva",
  "Olavi",
  "Juhani",
  "Johannes",
  "Mikael",
  "Antero",
  "Tapani",
  "Kalevi",
  "Tapio",
  "Ilmari",
  "Matias",
  "Eeli",
  "Emil",
  "Aapo",
  "Aarne",
  "Akseli",
  "Aleksi",
  "Antti",
  "Armas",
  "Arttu",
  "Aukusti",
  "Eero",
  "Eetu",
  "Elias",
  "Erkki",
  "Esa",
  "Hannes",
  "Harri",
  "Heikki",
  "Henrik",
  "Ilkka",
  "Iiro",
  "Jaakko",
  "Jalmari",
  "Jani",
  "Janne",
  "Jari",
  "Jere",
  "Jesse",
  "Joakim",
  "Joel",
  "Joni",
  "Juha",
  "Juhani",
  "Jukka",
  "Juuso",
  "Kalle",
  "Kari",
  "Kasper",
  "Kimmo",
  "Lauri",
  "Leevi",
  "Lukas",
  "Marko",
  "Markus",
  "Martti",
  "Matti",
  "Mikko",
  "Niklas",
  "Niko",
  "Olli",
  "Oskari",
  "Otto",
  "Paavo",
  "Panu",
  "Pekka",
  "Pentti",
  "Petri",
  "Raimo",
  "Rami",
  "Risto",
  "Sakari",
  "Sami",
  "Samu",
  "Samuli",
  "Sampo",
  "Seppo",
  "Simo",
  "Teemu",
  "Tero",
  "Timo",
  "Tomi",
  "Tommi",
  "Tuomas",
  "Tuomo",
  "Tuukka",
  "Urho",
  "Veikko",
  "Veli",
  "Ville",
  "Vilho",
  "Viljami",
  "Yrj\xF6",
  "Aatu",
  "Ahti",
  "Aimo",
  "Aki",
  "Anto",
  "Arto",
  "Atte",
  "Aulis",
  "Eemeli",
  "Eino",
  "Eliel",
  "Elmo",
  "Ensio",
  "Erik",
  "Hannu",
  "Heimo",
  "Helmer",
  "Iisakki",
  "Ilpo",
  "Immo",
  "Isto",
  "Jarkko",
  "Jarmo",
  "Jouni",
  "Kauko",
  "Keijo",
  "Kosti",
  "Lasse",
  "Lauri",
  "Lempi"
];
var FINNISH_MALE_LASTNAMES = [
  "Korhonen",
  "Virtanen",
  "M\xE4kinen",
  "Nieminen",
  "M\xE4kel\xE4",
  "Laine",
  "H\xE4m\xE4l\xE4inen",
  "Koskinen",
  "Heikkinen",
  "J\xE4rvinen",
  "Lehtonen",
  "Lehtinen",
  "Saarinen",
  "Salminen",
  "Heinonen",
  "Niemi",
  "Kallio",
  "Salonen",
  "Tuominen",
  "Laitinen",
  "Rantanen",
  "Turunen",
  "Kinnunen",
  "Karjalainen",
  "Mattila",
  "Pulkkinen",
  "Ojala",
  "Hakala",
  "Laaksonen",
  "Lindholm",
  "Jokinen",
  "Aalto",
  "Miettinen",
  "Mustonen",
  "Lahtinen",
  "Peltonen",
  "R\xE4is\xE4nen",
  "Ahonen",
  "Kangas",
  "V\xE4is\xE4nen",
  "Toivonen",
  "Keto",
  "Pekkanen",
  "Anttila",
  "Salo",
  "Savolainen",
  "Koivisto",
  "Nurmi",
  "Rossi",
  "Huttunen",
  "Kekkonen",
  "Pesonen",
  "Huhtala",
  "Autio",
  "Halonen",
  "Kivinen",
  "Partanen",
  "Paananen",
  "Rissanen",
  "Sallinen",
  "Sepp\xE4l\xE4",
  "Soininen",
  "Suominen",
  "Tikka",
  "Tolonen",
  "Uusitalo",
  "Vanhanen",
  "Vehvil\xE4inen",
  "Viitanen",
  "Vuori",
  "Yl\xF6nen",
  "Aaltonen",
  "Ahola",
  "Ahtisaari",
  "Alatalo",
  "Asikainen",
  "Eskola",
  "Forsman",
  "Haapala",
  "Hakkarainen",
  "Hannula",
  "Harju",
  "Heino",
  "Helminen",
  "Hietanen",
  "Hirvonen",
  "Huovinen",
  "Jokela",
  "Jussila",
  "Kankaanp\xE4\xE4",
  "Kari",
  "Karppinen",
  "Kauppinen",
  "Kemppainen",
  "Kettunen",
  "Kivim\xE4ki",
  "Koponen",
  "Korpi",
  "Koskela",
  "Kukkonen"
];

// resources/static_db/names/georgian_data.ts
var GEORGIAN_MALE_FIRSTNAMES = [
  "Giorgi",
  "Davit",
  "Aleksandre",
  "Demetre",
  "Noe",
  "Luka",
  "Toma",
  "Dachi",
  "Ioane",
  "Vache",
  "Zurab",
  "Levan",
  "Irakli",
  "Nika",
  "Saba",
  "Archil",
  "Vakhtang",
  "Guram",
  "Tamaz",
  "Zaza",
  "Gvantsa",
  "Mate",
  "Lazare",
  "Giorgi",
  "Andria",
  "Daniel",
  "Gabriel",
  "Mikheil",
  "Nikoloz",
  "Tengiz",
  "Bakur",
  "Beka",
  "Giga",
  "Givi",
  "Gocha",
  "Kakha",
  "Koba",
  "Lasha",
  "Merab",
  "Nugzar",
  "Otar",
  "Paata",
  "Ramaz",
  "Rezo",
  "Roin",
  "Shalva",
  "Tedo",
  "Tornike",
  "Ushangi",
  "Vano",
  "Akaki",
  "Avtandil",
  "Baadur",
  "Bagrat",
  "Besik",
  "Elguja",
  "Gela",
  "Giuli",
  "Ioseb",
  "Jemal",
  "Kakhaber",
  "Levan",
  "Mamuka",
  "Malkhaz",
  "Nodar",
  "Oleg",
  "Petre",
  "Rati",
  "Revaz",
  "Roman",
  "Sandro",
  "Sergo",
  "Shota",
  "Soso",
  "Temur",
  "Teimuraz",
  "Tite",
  "Ucha",
  "Vakhtang",
  "Vano",
  "Vazha",
  "Vladimer",
  "Zviad",
  "Abesalom",
  "Adam",
  "Aleksandre",
  "Anzor",
  "Arsen",
  "Badri",
  "Besiki",
  "Dato",
  "Dato",
  "Edisher",
  "Erekle",
  "Gia",
  "Giorgi",
  "Guram",
  "Iakob",
  "Ilia",
  "Irine",
  "Kakhi",
  "Kote",
  "Lado",
  "Levan",
  "Mamuka",
  "Merab",
  "Mikheil",
  "Nika",
  "Nugzar",
  "Otar",
  "Paata",
  "Ramaz",
  "Revaz",
  "Roin",
  "Shalva",
  "Tamaz",
  "Tedo",
  "Temur",
  "Tornike",
  "Zurab"
];
var GEORGIAN_MALE_LASTNAMES = [
  "Beridze",
  "Kapanadze",
  "Gelashvili",
  "Maisuradze",
  "Giorgadze",
  "Lomidze",
  "Tsiklauri",
  "Bolkvadze",
  "Nozadze",
  "Chikhladze",
  "Kvaratskhelia",
  "Abashidze",
  "Dadeshkeliani",
  "Japaridze",
  "Machabeli",
  "Orbeliani",
  "Bagrationi",
  "Dadiani",
  "Tarkhan-Mouravi",
  "Chavchavadze",
  "Tsereteli",
  "Eristavi",
  "Mukhranbatoni",
  "Amirejibi",
  "Andronikashvili",
  "Abuladze",
  "Adamia",
  "Akhvlediani",
  "Batiashvili",
  "Chubinidze",
  "Davitashvili",
  "Gagoshidze",
  "Gogoberidze",
  "Gogitidze",
  "Iashvili",
  "Javakhishvili",
  "Kiknadze",
  "Kobalia",
  "Kochakidze",
  "Kutateladze",
  "Liparteliani",
  "Maghalashvili",
  "Makharadze",
  "Mchedlishvili",
  "Melikishvili",
  "Metreveli",
  "Mikadze",
  "Nadareishvili",
  "Nakashidze",
  "Narimanidze",
  "Papashvili",
  "Petriashvili",
  "Pipia",
  "Razmadze",
  "Rukhadze",
  "Saginashvili",
  "Shengelia",
  "Shubitidze",
  "Sikharulidze",
  "Tabagari",
  "Tavadze",
  "Tskitishvili",
  "Tskhvediani",
  "Tumanishvili",
  "Vachnadze",
  "Vardanidze",
  "Zhvania",
  "Zoidze",
  "Zukakishvili",
  "Abesadze",
  "Akobia",
  "Alavidze",
  "Aptsiauri",
  "Arveladze",
  "Avalishvili",
  "Bakradze",
  "Baramidze",
  "Basilaia",
  "Begiashvili",
  "Berdzenishvili",
  "Bezhanidze",
  "Chachanidze",
  "Chanturia",
  "Charkviani",
  "Chkhaidze",
  "Chkheidze",
  "Dvali",
  "Dzidziguri",
  "Gachechiladze",
  "Gagnidze",
  "Gakhokidze",
  "Gamkrelidze",
  "Gaprindashvili",
  "Gedenidze",
  "Ghviniashvili",
  "Gogoladze",
  "Gogua",
  "Gulua",
  "Iakobidze",
  "Iremashvili",
  "Jishkariani",
  "Kalandadze",
  "Kapanadze",
  "Kavtaradze",
  "Kereselidze",
  "Khachidze",
  "Khatiskatsi",
  "Khmaladze",
  "Khomeriki",
  "Kikabidze",
  "Kikaleishvili",
  "Kobakhidze",
  "Kobuladze",
  "Kochladze",
  "Kvaratskhelia",
  "Labadze",
  "Lomidze",
  "Maisuradze",
  "Mamidze",
  "Manchkhashvili"
];

// resources/static_db/names/armenian_data.ts
var ARMENIAN_MALE_FIRSTNAMES = [
  "Davit",
  "Narek",
  "Hayk",
  "Tigran",
  "Areg",
  "Mark",
  "Armen",
  "Aram",
  "Levon",
  "Gevorg",
  "Hakob",
  "Grigor",
  "Sargis",
  "Hovhannes",
  "Karen",
  "Vardan",
  "Arsen",
  "Gagik",
  "Vahe",
  "Samvel",
  "Andranik",
  "Ashot",
  "Artur",
  "Gor",
  "Mher",
  "Harutyun",
  "Vahan",
  "Edgar",
  "Ruben",
  "Alex",
  "Aren",
  "Monte",
  "Robert",
  "Daniel",
  "Leo",
  "Erik",
  "Artiom",
  "Albert",
  "Van",
  "Suren",
  "Raphael",
  "Max",
  "Henry",
  "Noy",
  "Menua",
  "Ara",
  "Arakel",
  "Ararat",
  "Arman",
  "Avet",
  "Bedros",
  "Garnik",
  "Hrant",
  "Ishkhan",
  "Jirair",
  "Kamo",
  "Krikor",
  "Levon",
  "Manvel",
  "Mesrop",
  "Mikael",
  "Nerses",
  "Norayr",
  "Petros",
  "Rafael",
  "Raffi",
  "Ruben",
  "Sevan",
  "Stepan",
  "Taron",
  "Vache",
  "Vigen",
  "Yervand",
  "Zaven",
  "Zareh",
  "Abgar",
  "Aghvan",
  "Antranig",
  "Aramayis",
  "Arshak",
  "Artashes",
  "Artavazd",
  "Avedis",
  "Bagrat",
  "Barsegh",
  "Derenik",
  "Garegin",
  "Gurgen",
  "Hamazasp",
  "Hovsep",
  "Karapet",
  "Mkrtich",
  "Poghos",
  "Smbat",
  "Tatev",
  "Toros",
  "Vazgen",
  "Yeghishe",
  "Zhirayr",
  "Zoravar"
];
var ARMENIAN_MALE_LASTNAMES = [
  "Grigoryan",
  "Sargsyan",
  "Harutyunyan",
  "Hovhannisyan",
  "Khachatryan",
  "Hakobyan",
  "Petrosyan",
  "Vardanyan",
  "Gevorgyan",
  "Karapetyan",
  "Stepanyan",
  "Abrahamyan",
  "Manukyan",
  "Davtyan",
  "Mkrtchyan",
  "Poghosyan",
  "Martirosyan",
  "Sahakyan",
  "Minasyan",
  "Avagyan",
  "Arakelyan",
  "Baghdasaryan",
  "Barseghyan",
  "Danielyan",
  "Ghazaryan",
  "Hambardzumyan",
  "Hayrapetyan",
  "Kocharyan",
  "Melikyan",
  "Nazaryan",
  "Ohanyan",
  "Papikyan",
  "Simonyan",
  "Tadevosyan",
  "Voskanyan",
  "Yeritsyan",
  "Zakaryan",
  "Abajian",
  "Adamyan",
  "Agopian",
  "Alexanian",
  "Andonian",
  "Aprahamian",
  "Arsenyan",
  "Artinian",
  "Asatryan",
  "Avedisian",
  "Babayan",
  "Bagratuni",
  "Balian",
  "Boghossian",
  "Boyajian",
  "Chahinian",
  "Darbinyan",
  "Demirchyan",
  "DerBedrosian",
  "Djanbazian",
  "Epremian",
  "Gasparyan",
  "Gulian",
  "Hakopian",
  "Hovsepian",
  "Ishkhanian",
  "Jamgochian",
  "Kantardjian",
  "Kevorkian",
  "Krikorian",
  "Levoniyan",
  "Mardoyan",
  "Markarian",
  "Matossian",
  "Mikaelian",
  "Mirakyan",
  "Mouradian",
  "Nalbandian",
  "Nersesian",
  "Oganesian",
  "Ohanessian",
  "Parseghian",
  "Patrikian",
  "Piloyan",
  "Rafaelian",
  "Sarkisian",
  "Soghomonian",
  "Tashjian",
  "Terzian",
  "Tovmasyan",
  "Vartanian",
  "Yaghoubian",
  "Zadikian",
  "Zarehian",
  "Zartarian",
  "Abelyan",
  "Aghajanian",
  "Aramian",
  "Aroyan",
  "Aslanian",
  "Avoyan",
  "Babajanyan",
  "Baghdassarian"
];

// resources/static_db/names/albanian_data.ts
var ALBANIAN_MALE_FIRSTNAMES = [
  "Arben",
  "Ilir",
  "Agim",
  "Fatmir",
  "Besnik",
  "Altin",
  "Dritan",
  "Ardit",
  "Erion",
  "Klodian",
  "Gentian",
  "Endrit",
  "Fatlum",
  "Bujar",
  "Burim",
  "Dardan",
  "Afrim",
  "Agron",
  "Alban",
  "Arber",
  "Arlind",
  "Armend",
  "Artan",
  "Artur",
  "Besart",
  "Besian",
  "Besmir",
  "Bledar",
  "Blendi",
  "Bora",
  "Dashamir",
  "Dashnor",
  "Defrim",
  "Dhimiter",
  "Drilon",
  "Edon",
  "Edvin",
  "Elton",
  "Endi",
  "Engjell",
  "Enver",
  "Ergest",
  "Ervin",
  "Fation",
  "Fisnik",
  "Flamur",
  "Florian",
  "Genc",
  "Gent",
  "G\xEBzim",
  "Gjergj",
  "Gjon",
  "Haki",
  "Ilirian",
  "Ismail",
  "Jetmir",
  "Jon",
  "Julian",
  "Kastriot",
  "Kreshnik",
  "Kujtim",
  "Ledion",
  "Leotrim",
  "Liridon",
  "Lorik",
  "Luan",
  "Lumturi",
  "Mariglen",
  "Mirlind",
  "Mufit",
  "Muhamet",
  "Nderim",
  "Noel",
  "Oltion",
  "Orges",
  "Petrit",
  "Qemal",
  "Redon",
  "Rezart",
  "Rilind",
  "Rinor",
  "Rrezon",
  "Shk\xEBlzen",
  "Shp\xEBtim",
  "Sokol",
  "Taulant",
  "Valon",
  "Veton",
  "Visar",
  "Vjollca",
  "Xhavit",
  "Ylli",
  "Zamir",
  "Zef",
  "Zgjim",
  "Zoran",
  "Adem",
  "Adrian",
  "Arian",
  "Arjan",
  "Arsen",
  "Artin",
  "Bajram",
  "Bardhyl",
  "Bashkim",
  "Behar",
  "Bekim",
  "Blerim",
  "Dalmat",
  "Dren",
  "Edi",
  "Eduart",
  "Ermir",
  "Fitore",
  "Gjergji",
  "Jonuz",
  "Klevis",
  "Kliton",
  "Kristaq",
  "Kujtim",
  "Laz\xEBr",
  "Leandro",
  "Leke",
  "Lind",
  "Lindor",
  "Llesh",
  "Lorenc",
  "Luan",
  "Lulzim",
  "Mikel",
  "Milot",
  "Naim",
  "Ndue",
  "Pjet\xEBr",
  "Preng",
  "Ramiz",
  "Rei",
  "Renis",
  "Roland",
  "Saimir",
  "Sazan",
  "Shaban",
  "Shpend",
  "Sk\xEBnder",
  "Sokol",
  "Tahir",
  "Toni",
  "Trim",
  "Valdet",
  "Valmir",
  "Vangjel",
  "Viktor",
  "Vllaznim",
  "Xhelal",
  "Ylber",
  "Zef",
  "Zoti"
];
var ALBANIAN_MALE_LASTNAMES = [
  "Hoxha",
  "\xC7ela",
  "Kurti",
  "Marku",
  "Mu\xE7a",
  "Shehu",
  "Dervishi",
  "Kola",
  "Prifti",
  "Elezi",
  "Leka",
  "Gjoni",
  "Sula",
  "Basha",
  "Krasniqi",
  "Mehmeti",
  "Aliu",
  "Brahimi",
  "Ismaili",
  "Osmani",
  "Abazi",
  "Ademi",
  "Agolli",
  "Ahmeti",
  "Alia",
  "Arifi",
  "Bajrami",
  "Balliu",
  "Begaj",
  "Berisha",
  "Bytyqi",
  "Caka",
  "Cela",
  "Deda",
  "Demiri",
  "Duka",
  "Durmishi",
  "Fazliu",
  "Gashi",
  "Gega",
  "Hajdari",
  "Halili",
  "Hasani",
  "Hyseni",
  "Ibrahimi",
  "Jashari",
  "Jusufi",
  "Kadriu",
  "Kaleci",
  "Kamberi",
  "Kastrati",
  "Koci",
  "Kodra",
  "Krasniqi",
  "Kryeziu",
  "Lala",
  "Lleshi",
  "Lulaj",
  "Lusha",
  "Mala",
  "Mati",
  "Mehmeti",
  "Mema",
  "Mesi",
  "Meta",
  "Mucaj",
  "Murati",
  "Mustafa",
  "Myftiu",
  "Nallbani",
  "Neziri",
  "Nikolli",
  "Osmani",
  "Palaj",
  "Papa",
  "Pasha",
  "Peci",
  "P\xEBrnaska",
  "Petro",
  "Prifti",
  "Qorri",
  "Rama",
  "Rexhepi",
  "Rrahmani",
  "Rugova",
  "Rushiti",
  "Saliu",
  "Selimi",
  "Shala",
  "Shatri",
  "Shehu",
  "Shkreli",
  "Shyti",
  "Sina",
  "Sokolaj",
  "Spahiu",
  "Syla",
  "Tafa",
  "Tahiraj",
  "Tola",
  "Topi",
  "Toska",
  "Uka",
  "Vata",
  "Veliu",
  "Veseli",
  "Xhaferi",
  "Xhemali",
  "Ylli",
  "Zeqiri",
  "Zogu",
  "Zymberi",
  "Abdullahu",
  "Agalliu",
  "Ahmetaj",
  "Alban",
  "Arditi",
  "Bajraktari",
  "Balluku",
  "Bardhi",
  "Begolli",
  "Bektashi",
  "Biba",
  "Brahimi",
  "Cakaj",
  "\xC7ipi",
  "Dauti",
  "Demaj",
  "Dervishi",
  "Dibra",
  "Domi",
  "Dragusha",
  "Dreshaj",
  "Dukagjini",
  "Duraku",
  "Durr\xEBs",
  "Fazli",
  "Gegaj",
  "Gjonaj",
  "Gjoka",
  "Gjonbalaj",
  "Hoxhaj",
  "Hysenaj",
  "Imeri",
  "Isufaj",
  "Jasharaj",
  "Kadri",
  "Kajtazi",
  "Kallaba",
  "Kameri",
  "Kapllani",
  "Kastrati",
  "Kelmendi",
  "Koci",
  "Kola",
  "Krasniqi",
  "Kryeziu",
  "Laj\xE7i",
  "Leka",
  "Lleshi",
  "Lulaj",
  "Lushaj",
  "Maliqi",
  "Markaj",
  "Mehmetaj",
  "Mema",
  "Mhillaj",
  "Miftari",
  "Molla",
  "Morina",
  "Muci"
];

// resources/static_db/names/romanian_data.ts
var ROMANIAN_MALE_FIRSTNAMES = [
  "Andrei",
  "Alexandru",
  "David",
  "Matei",
  "\u0218tefan",
  "Gabriel",
  "Mihai",
  "Ion",
  "George",
  "Cristian",
  "Daniel",
  "Florin",
  "Adrian",
  "Bogdan",
  "C\u0103t\u0103lin",
  "Darius",
  "Emil",
  "Filip",
  "Gheorghe",
  "Horia",
  "Ionu\u021B",
  "Iulian",
  "Lauren\u021Biu",
  "Lucian",
  "Marius",
  "Nicolae",
  "Ovidiu",
  "Paul",
  "Radu",
  "Robert",
  "Sebastian",
  "Tudor",
  "Valentin",
  "Victor",
  "Vlad",
  "Alex",
  "Anton",
  "Beniamin",
  "Ciprian",
  "Claudiu",
  "Constantin",
  "Cornel",
  "Cosmin",
  "Dorin",
  "Drago\u0219",
  "Dumitru",
  "Eduard",
  "Eugen",
  "Flavius",
  "Gelu",
  "Hora\u021Biu",
  "Ilie",
  "Ionel",
  "Iosif",
  "Iustin",
  "Ladislau",
  "Liviu",
  "Luca",
  "Marcel",
  "Marian",
  "Marin",
  "Mircea",
  "Octavian",
  "Petru",
  "Rare\u0219",
  "R\u0103zvan",
  "Romeo",
  "Sabin",
  "Sorin",
  "Teodor",
  "Traian",
  "Valeriu",
  "Vasile",
  "Viorel",
  "Vladimir",
  "Zoltan",
  "Adi",
  "Albert",
  "Alexe",
  "Alin",
  "Amariei",
  "Aurel",
  "B\u0103nel",
  "Barbu",
  "Cezar",
  "Codru\u021B",
  "Corneliu",
  "Costel",
  "Cristi",
  "Dan",
  "D\u0103nu\u021B",
  "Dinu",
  "Dorel",
  "Doru",
  "Drago",
  "Elvis",
  "Emanoil",
  "Emanuel",
  "Eric",
  "Eusebiu",
  "F\u0103nel",
  "Felix",
  "Florentin",
  "Francisc",
  "Gabi",
  "Gheorghi\u021B\u0103",
  "Grigore",
  "Haralamb",
  "Iancu",
  "Ieronim",
  "Igor",
  "Ioan",
  "Ionu\u021B",
  "Irimia",
  "Iuliu",
  "Jean",
  "Lauren\u021Biu",
  "Laz\u0103r",
  "Leonard",
  "Lic\u0103",
  "Lorin",
  "M\u0103d\u0103lin",
  "Manole",
  "Mihail",
  "Miron",
  "Mitic\u0103",
  "Mitic\u0103",
  "Mugur",
  "Nae",
  "Nelu",
  "Nicu",
  "Nicu\u0219or",
  "Octav",
  "Pavel",
  "Petre",
  "Petric\u0103",
  "Radu",
  "Rare\u0219",
  "Raul",
  "Remus",
  "Romeo",
  "Sandu",
  "Sergiu",
  "Silviu",
  "Simion",
  "Stelian",
  "Tiberiu",
  "Titu",
  "Toma",
  "Valer",
  "Vasile",
  "Vasilica",
  "Victor",
  "Viorel",
  "Virgil",
  "Vlad",
  "Vladu",
  "Zaharia",
  "Zamfir",
  "Zeno"
];
var ROMANIAN_MALE_LASTNAMES = [
  "Popescu",
  "Pop",
  "Ionescu",
  "Dumitrescu",
  "Georgescu",
  "Stan",
  "Constantinescu",
  "Stoica",
  "Nicolae",
  "Mihai",
  "Cristea",
  "Marin",
  "Toma",
  "Munteanu",
  "Dinu",
  "Dobre",
  "Preda",
  "Radu",
  "Florea",
  "Vasilescu",
  "B\u0103lan",
  "Barbu",
  "C\xEErstea",
  "Diaconu",
  "Enache",
  "Florescu",
  "Gheorghe",
  "Hanganu",
  "Ilie",
  "Iordache",
  "Jianu",
  "Lungu",
  "Manea",
  "Neagu",
  "Oprea",
  "P\u0103un",
  "Petrescu",
  "Rusu",
  "Sava",
  "Tudor",
  "Ursu",
  "Voicu",
  "Zaharia",
  "Alexandrescu",
  "Andreescu",
  "Antonescu",
  "Ardelean",
  "Badea",
  "B\u0103descu",
  "B\u0103nic\u0103",
  "Bercea",
  "B\xEErl\u0103deanu",
  "Blaga",
  "Boboc",
  "Bogdan",
  "Botezatu",
  "Br\u0103nescu",
  "Bratu",
  "Bucur",
  "Bunea",
  "Cazacu",
  "Cercel",
  "Chiriac",
  "Ciobanu",
  "Cojocaru",
  "Coman",
  "Constantin",
  "Cornea",
  "Costache",
  "Costea",
  "Cre\u021Bu",
  "Cristescu",
  "Danciu",
  "Dasc\u0103lu",
  "David",
  "Dinu",
  "Dobre",
  "Dobrescu",
  "Dr\u0103gan",
  "Dr\u0103ghici",
  "Dumitru",
  "Ene",
  "Faur",
  "Filip",
  "Ganea",
  "Gheorghiu",
  "Grigorescu",
  "Grigore",
  "Groza",
  "Hristea",
  "Iancu",
  "Iftimie",
  "Ion",
  "Ionescu",
  "Ioni\u021B\u0103",
  "Iordache",
  "Iorga",
  "Istrate",
  "Ivan",
  "Laz\u0103r",
  "Luca",
  "Lupu",
  "M\u0103nescu",
  "Manole",
  "Marcu",
  "Matei",
  "Mih\u0103ilescu",
  "Mih\u0103il\u0103",
  "Miron",
  "Mocanu",
  "Moldovan",
  "Moraru",
  "Muntean",
  "Mu\u0219at",
  "Neac\u0219u",
  "Necula",
  "Negoescu",
  "Nistor",
  "Olteanu",
  "Onea",
  "Panaite",
  "Pascu",
  "P\u0103tra\u0219cu",
  "Pavel",
  "Petre",
  "Petrov",
  "Pintilie",
  "Popa",
  "Popovici",
  "Predoiu",
  "Prodan",
  "Puiu",
  "R\u0103ducanu",
  "Roman",
  "Rotaru",
  "Sabin",
  "S\xE2rbu",
  "Sava",
  "Simionescu",
  "S\xEErbu",
  "\u0218erban",
  "\u0218tefan",
  "\u0218tef\u0103nescu",
  "T\u0103nase",
  "T\u0103n\u0103sescu",
  "Toma",
  "Tudose",
  "Ungureanu",
  "V\u0103duva",
  "Varga",
  "Vasile",
  "Vasiliu",
  "Vintil\u0103",
  "Vlad",
  "Voinea",
  "Z\u0103bav\u0103",
  "Zamfir",
  "Z\u0103rnescu",
  "Zavala",
  "Zlate"
];

// resources/static_db/names/baltic_data.ts
var BALTIC_MALE_FIRSTNAMES = [
  "Markas",
  "Benas",
  "Jonas",
  "Motiejus",
  "Matas",
  "Nojus",
  "Lukas",
  "Jok\u016Bbas",
  "Leonas",
  "Adomas",
  "Herkus",
  "Dominykas",
  "Augustas",
  "Dovydas",
  "Kajus",
  "Mantas",
  "Vytautas",
  "Algirdas",
  "Gediminas",
  "Mindaugas",
  "Tomas",
  "Paulius",
  "Andrius",
  "Marius",
  "Ar\u016Bnas",
  "Darius",
  "Gintaras",
  "K\u0119stutis",
  "Rimas",
  "Saulius",
  "Tauras",
  "Vilius",
  "\u017Dygimantas",
  "Aivaras",
  "Antanas",
  "Art\u016Bras",
  "Edvinas",
  "Eimantas",
  "Ignas",
  "Justinas",
  "Karolis",
  "Linas",
  "Naglis",
  "Oskaras",
  "Povilas",
  "Raimundas",
  "Rolandas",
  "Simonas",
  "Tadas",
  "Vaidas",
  "Vaidotas",
  "Valdas",
  "Vygantas",
  "\u017Dilvinas",
  "\u0104\u017Euolas",
  "Rytis",
  "Vytis",
  "Girius",
  "Rokas",
  "Deividas",
  "Olivers",
  "Roberts",
  "Marks",
  "Gustavs",
  "Em\u012Bls",
  "Daniels",
  "Markuss",
  "Adri\u0101ns",
  "K\u0101rlis",
  "Aleksandrs",
  "J\u0113kabs",
  "Ernests",
  "Ralfs",
  "Dominiks",
  "Tomass",
  "Art\u016Brs",
  "Ri\u010Dards",
  "Maksims",
  "Toms",
  "Teodors",
  "J\u0101nis",
  "Reinis",
  "Kristers",
  "L\u016Bkass",
  "Edgars",
  "M\u0101ris",
  "Aivars",
  "Andris",
  "Juris",
  "Artjoms",
  "Nikolajs",
  "Oskars",
  "Pauls",
  "Rihards",
  "Valters",
  "Viktors",
  "Zigurds",
  "Dainis",
  "Gatis",
  "Ivars",
  "Kaspars",
  "M\u0101rti\u0146\u0161",
  "P\u0113teris",
  "Raitis",
  "Sandis",
  "Uldis",
  "Viesturs",
  "Ziedonis",
  "Edijs",
  "\u0122irts",
  "Ingus",
  "Kri\u0161j\u0101nis",
  "Lauris",
  "Mihails",
  "Niks",
  "R\u016Bdolfs",
  "T\u0101lis",
  "Agnis",
  "Aigars",
  "Ain\u0101rs",
  "Aivis",
  "Alberts",
  "Andrejs",
  "Georgs",
  "Mark",
  "Hugo",
  "Robin",
  "Miron",
  "Lucas",
  "Karl",
  "Aron",
  "Mattias",
  "Sebastian",
  "Oskar",
  "Artur",
  "Leon",
  "Oliver",
  "Rasmus",
  "Kristofer",
  "Henri",
  "Nikita",
  "Jakob",
  "Martin",
  "Aleksandr",
  "Sergei",
  "Vladimir",
  "Andrei",
  "Andres",
  "Toomas",
  "Margus",
  "Indrek",
  "Peeter",
  "Priit",
  "Marko",
  "Jaan",
  "J\xFCri",
  "Mihkel",
  "Mati",
  "Ivo",
  "Ott",
  "Otto",
  "Hendrik",
  "Erik",
  "Felix",
  "Gregor",
  "Johannes",
  "Kaspar",
  "Timur",
  "Romet",
  "Jasper",
  "Joosep",
  "Konrad",
  "Mikk",
  "Kristjan",
  "Taavi",
  "Siim",
  "Rauno",
  "Mart",
  "Tanel",
  "Kevin",
  "Maksim",
  "Dmitri",
  "Igor",
  "Anton",
  "Deniss",
  "Bruno",
  "Feliks",
  "Osvald",
  "Aivar",
  "Ain",
  "Aleksei",
  "Vlad",
  "Yegor",
  "Antero",
  "Kaarel",
  "Silvar",
  "Ken",
  "Paul",
  "Jakob",
  "Matilde"
];
var BALTIC_MALE_LASTNAMES = [
  "Jankauskas",
  "Kazlauskas",
  "Petrauskas",
  "Stankevi\u010Dius",
  "Vasiliauskas",
  "Butkus",
  "Urbonas",
  "Kavaliauskas",
  "\u017Dukauskas",
  "Bal\u010Di\u016Bnas",
  "\u010Cerniauskas",
  "Grigali\u016Bnas",
  "Kairys",
  "Paulauskas",
  "Ramanauskas",
  "Sakalauskas",
  "Vaitkus",
  "Zinkevi\u010Dius",
  "Adomaitis",
  "Baranauskas",
  "Daug\u0117la",
  "Gedvilas",
  "Ivanauskas",
  "Jonaitis",
  "Klimas",
  "Laurinavi\u010Dius",
  "Ma\u017Eeika",
  "Navickas",
  "Petkevi\u010Dius",
  "Rimkus",
  "Simutis",
  "Tamulevi\u010Dius",
  "Valaitis",
  "Venckus",
  "\u017Demaitis",
  "B\u0113rzi\u0146\u0161",
  "Kalni\u0146\u0161",
  "Ozoli\u0146\u0161",
  "Jansons",
  "Ozols",
  "Liepi\u0146\u0161",
  "Kr\u016Bmi\u0146\u0161",
  "Balodis",
  "Egl\u012Btis",
  "Sili\u0146\u0161",
  "Skuja",
  "Strazdi\u0146\u0161",
  "Rieksti\u0146\u0161",
  "Saul\u012Btis",
  "Priede",
  "Vanags",
  "Vilci\u0146\u0161",
  "Za\u0137is",
  "Puri\u0146\u0161",
  "K\u013Cavi\u0146\u0161",
  "\u0100boli\u0146\u0161",
  "Kalni\u0146\u0161",
  "Berzins",
  "Ivanovs",
  "Kalnins",
  "Tamm",
  "Saar",
  "Sepp",
  "Kask",
  "M\xE4gi",
  "Kukk",
  "Rebane",
  "Koppel",
  "Karu",
  "Ilves",
  "Lepik",
  "P\xE4rn",
  "Kivi",
  "Kuusk",
  "J\xE4rv",
  "P\xF5der",
  "Lepp",
  "Laas",
  "Oja",
  "Kangur",
  "Raid",
  "Roots",
  "Sild",
  "Toom",
  "Vare",
  "Aasm\xE4e",
  "Allik",
  "Eesti",
  "Haas",
  "J\xF5gi",
  "Kallas",
  "K\xF5iv",
  "Lille",
  "Mets",
  "N\xF5mm",
  "Puu",
  "Raud",
  "Soo",
  "Tammik",
  "Vesi",
  "Aleksejev",
  "Ivanov",
  "Petrov",
  "Smirnov",
  "Popov",
  "Sokolov",
  "Morozov",
  "Volkov",
  "Lebedev",
  "Kuznetsov",
  "Novikov",
  "Mihhailov",
  "Fedorov",
  "Stepanov",
  "Nikolaev",
  "Andreev",
  "Petrenko",
  "Kovalenko",
  "Bondarenko",
  "Tkachenko",
  "Shevchenko",
  "Kovalchuk",
  "Melnyk",
  "Kravchenko",
  "Savchenko",
  "Boyko",
  "Marchenko",
  "Lysenko",
  "Koval",
  "Pavlenko",
  "Litvin",
  "Zaitsev",
  "Orlov",
  "Kozlov",
  "Novak",
  "Kovalyov",
  "Moroz",
  "Pavlov",
  "Semenov",
  "Ermakov",
  "Dmitriev",
  "Antonov",
  "Gusev",
  "Tikhonov",
  "Frolov",
  "Sergeev",
  "Romanov",
  "Zaharov",
  "Borisov",
  "Maksimov",
  "Sidorov",
  "Osipov",
  "Belov",
  "Vorobyov",
  "Solovyov",
  "Kolesnikov",
  "Karpov",
  "Afanasiev",
  "Vlasov",
  "Maslov",
  "Isakov",
  "Tarasov",
  "Martynov",
  "Sviridov",
  "Yakovlev",
  "Polyakov",
  "Ponomarev",
  "Gorbunov",
  "Kudryavtsev",
  "Krylov",
  "Belyaev",
  "Bogdanov",
  "Voronin",
  "Vinogradov",
  "Medvedev",
  "Abramov",
  "Krasnov",
  "Sobolev",
  "Titov",
  "Makarov",
  "Gavrilov",
  "Antipov",
  "Filippov",
  "Grigoriev",
  "Kuzmin",
  "Davydov",
  "Melnikov",
  "Denisov",
  "Gromov",
  "Fomin",
  "Klimov",
  "Petukhov",
  "Kochetkov",
  "Gorbachev",
  "Kryukov",
  "Belyakov",
  "Alekseev",
  "Savin",
  "Rybakov",
  "Suvorov"
];

// resources/static_db/names/benelux_data.ts
var BENELUX_MALE_FIRSTNAMES = [
  "Lucas",
  "Liam",
  "Noah",
  "Finn",
  "Milan",
  "Daan",
  "Levi",
  "Sem",
  "Bram",
  "Jesse",
  "Thomas",
  "Thijs",
  "Jayden",
  "Tim",
  "Max",
  "Ruben",
  "Stijn",
  "Seppe",
  "Lars",
  "Jasper",
  "Mathias",
  "Arthur",
  "Vince",
  "Quinten",
  "Wout",
  "Louis",
  "Victor",
  "Alexander",
  "Elias",
  "Hugo",
  "Jack",
  "James",
  "Oliver",
  "Benjamin",
  "Henry",
  "William",
  "Samuel",
  "Daniel",
  "Matthew",
  "Joseph",
  "David",
  "Michael",
  "Andrew",
  "Charles",
  "Edward",
  "George",
  "Robert",
  "John",
  "Peter",
  "Paul",
  "Mark",
  "Simon",
  "Adam",
  "Nathan",
  "Ryan",
  "Jake",
  "Luke",
  "Ethan",
  "Oscar",
  "Theo",
  "Felix",
  "Gabriel",
  "Julian",
  "Leo",
  "Mason",
  "Logan",
  "Aiden",
  "Jackson",
  "Mateo",
  "Luca",
  "Jules",
  "Louis",
  "Victor",
  "Emile",
  "Gustave",
  "Henri",
  "Antoine",
  "Nicolas",
  "Pierre",
  "Jean",
  "Fran\xE7ois",
  "Philippe",
  "Laurent",
  "Mathieu",
  "Alexandre",
  "S\xE9bastien",
  "Baptiste",
  "Cl\xE9ment",
  "Th\xE9o",
  "Rapha\xEBl",
  "Hugo",
  "L\xE9on",
  "Marius",
  "\xC9tienne",
  "Charles",
  "Auguste",
  "Marcel",
  "Ren\xE9",
  "Georges",
  "Albert",
  "Maurice",
  "\xC9mile",
  "Jules",
  "Alfred",
  "Gaston",
  "Fernand",
  "Lucien",
  "Raymond",
  "Andr\xE9",
  "Roger",
  "Bernard",
  "Michel",
  "Jacques",
  "Daniel",
  "Patrick",
  "Christian",
  "Didier",
  "Olivier",
  "Christophe",
  "Laurent",
  "St\xE9phane",
  "Philippe",
  "Nicolas",
  "Julien",
  "S\xE9bastien",
  "Fr\xE9d\xE9ric",
  "Thomas",
  "Antoine",
  "Guillaume",
  "Vincent",
  "Benjamin",
  "Samuel",
  "Alexis",
  "Mathis",
  "Evan",
  "Lukas",
  "Robin",
  "Jonas",
  "Senne",
  "Brent",
  "Jelle",
  "Kobe",
  "Niels",
  "Jens",
  "Maarten",
  "Pieter",
  "Sander",
  "Bas",
  "Joost",
  "Dirk",
  "Henk",
  "Jan",
  "Kees",
  "Gert",
  "Hans",
  "Peter",
  "Rob",
  "Tom",
  "Willem",
  "Bart",
  "Dennis",
  "Erik",
  "Frank",
  "Gerard",
  "Herman",
  "Johan",
  "Klaas",
  "Marcel",
  "Martijn",
  "Nico",
  "Oscar",
  "Paul",
  "Quinten",
  "Rein",
  "Stefan",
  "Theo",
  "Uwe",
  "Victor",
  "Wim",
  "Yves",
  "Zeger",
  "Arjen",
  "Boudewijn",
  "Cas",
  "Diederik",
  "Ewout",
  "Floris",
  "Gijs",
  "Hidde",
  "Ivo",
  "Joris",
  "Koen",
  "Lennart",
  "Mees",
  "Noud",
  "Olaf",
  "Pepijn",
  "Quinten",
  "Rutger",
  "Siem",
  "Teun",
  "Ulysse",
  "Viktor",
  "Wouter",
  "Xander",
  "Yannick",
  "Zion"
];
var BENELUX_MALE_LASTNAMES = [
  "Janssens",
  "Peeters",
  "Maes",
  "Jacobs",
  "Mertens",
  "Willems",
  "Claes",
  "Goossens",
  "Vermeulen",
  "De Smet",
  "Smets",
  "Vandermeulen",
  "De Clercq",
  "Desmet",
  "Vermeersch",
  "Michiels",
  "Vandenberghe",
  "De Vos",
  "Declercq",
  "Wouters",
  "Coppens",
  "Verstraeten",
  "Vanhove",
  "Verhelst",
  "Lemmens",
  "Stevens",
  "Pauwels",
  "Segers",
  "Hermans",
  "Martens",
  "De Bruyn",
  "De Jong",
  "Janssen",
  "de Vries",
  "Bakker",
  "Jansen",
  "Visser",
  "Smit",
  "Meijer",
  "de Boer",
  "Mulder",
  "de Groot",
  "Bos",
  "Vos",
  "Peters",
  "Hendriks",
  "van Dijk",
  "Dekker",
  "van Leeuwen",
  "Brouwer",
  "de Wit",
  "Dijkstra",
  "Smits",
  "de Graaf",
  "van der Meer",
  "van den Berg",
  "van der Linden",
  "van der Heijden",
  "van der Veen",
  "van den Heuvel",
  "van der Velden",
  "van den Broek",
  "van der Hoek",
  "van der Laan",
  "van der Wal",
  "van der Molen",
  "van der Horst",
  "van der Meulen",
  "van der Sluis",
  "van der Woude",
  "van der Zee",
  "van der Poel",
  "van der Voort",
  "van der Werf",
  "van der Zwaan",
  "van der Aa",
  "van der Baan",
  "van der Burg",
  "van der Does",
  "van der Eijk",
  "van der Gouw",
  "van der Hoeven",
  "van der Kamp",
  "van der Kooij",
  "van der Kroon",
  "van der Leek",
  "van der Linden",
  "van der Lugt",
  "van der Maat",
  "van der Meij",
  "van der Ploeg",
  "van der Putten",
  "van der Sande",
  "van der Schoot",
  "van der Steen",
  "van der Veer",
  "van der Vliet",
  "van der Voort",
  "van der Walle",
  "van der Weide",
  "van der Wiel",
  "van der Wijk",
  "van der Wilt",
  "van der Wolf",
  "van der Zanden",
  "van Dijk",
  "van Doorn",
  "van Egmond",
  "van Gelder",
  "van Gent",
  "van Gogh",
  "van Houten",
  "van Kessel",
  "van Loon",
  "van Nistelrooy",
  "van Oosterom",
  "van Rijn",
  "van Rooij",
  "van Rossum",
  "van Schaik",
  "van Schijndel",
  "van Veen",
  "van Vliet",
  "van Wijk",
  "van Wingerden",
  "van Zanten",
  "Verbeek",
  "Verhoeven",
  "Vermeer",
  "Verschoor",
  "Vink",
  "Visser",
  "Vliet",
  "Vos",
  "Willems",
  "Wouters",
  "Zuidema",
  "Zwart",
  "Aerts",
  "Baert",
  "Bogaert",
  "Bonte",
  "Bossuyt",
  "Bourgeois",
  "Braeckman",
  "Bracke",
  "Callens",
  "Callewaert",
  "Christiaens",
  "Coene",
  "Cools",
  "Cornelis",
  "Daems",
  "Dauwe",
  "De Backer",
  "De Baets",
  "De Block",
  "De Boeck",
  "De Bondt",
  "De Bruyne",
  "De Coninck",
  "De Corte",
  "De Decker",
  "De Groote",
  "De Haes",
  "De Herdt",
  "De Keyser",
  "De Maeyer",
  "De Meyer",
  "De Moor",
  "De Neve",
  "De Pauw",
  "De Ridder",
  "De Roeck",
  "De Sutter",
  "De Vriendt",
  "De Wilde",
  "Decoster",
  "Delaere",
  "Demey",
  "Deprez",
  "Dierickx",
  "Dirkx",
  "Dumont",
  "Dupont",
  "Eeckhout",
  "Geerts",
  "Gielen",
  "Govaerts",
  "Heylen",
  "Hoste",
  "Huybrechts",
  "Joris",
  "Lauwers",
  "Lef\xE8vre",
  "Lemaire",
  "Luyten",
  "Maertens",
  "Matthys",
  "Meeus",
  "Meyers",
  "Moens",
  "Moreau",
  "Naessens",
  "Nijs",
  "Nuyts",
  "Opsomer",
  "Pauwels",
  "Peeters",
  "Penninckx",
  "Pieters",
  "Piron",
  "Rijckaert",
  "Roels",
  "Rombouts",
  "Saeys",
  "Schoenmakers",
  "Smet",
  "Smolders",
  "Steen",
  "Steyaert",
  "Stroobants",
  "Swinnen",
  "Thijs",
  "Timmermans",
  "Van Acker",
  "Van Balen",
  "Van Camp",
  "Van Damme",
  "Van de Velde",
  "Van den Bossche",
  "Van den Broeck",
  "Van den Eynde",
  "Van der Auwera",
  "Van Hecke",
  "Van Hoof",
  "Van Hove",
  "Van Impe",
  "Van Looy",
  "Van Meir",
  "Van Neste",
  "Van Nieuwenhuyse",
  "Van Nuffel",
  "Van Rompaey",
  "Van Roy",
  "Van Steen",
  "Van Waes",
  "Van Wijnsberghe",
  "Vanden Abeele",
  "Vandenbroucke",
  "Vanderlinden",
  "Vanhoutte",
  "Verbruggen",
  "Vercauteren",
  "Verhaegen",
  "Verhaeghe",
  "Verheyden",
  "Vermeiren",
  "Verschueren",
  "Vervoort",
  "Veys",
  "Vrancken",
  "Wauters",
  "Willems",
  "Wuyts",
  "Zaman"
];

// resources/static_db/names/hungarian_data.ts
var HUNGARIAN_MALE_FIRSTNAMES = [
  "Bence",
  "M\xE1t\xE9",
  "Levente",
  "D\xE1vid",
  "\xC1d\xE1m",
  "Bal\xE1zs",
  "Krist\xF3f",
  "Tam\xE1s",
  "Gerg\u0151",
  "Attila",
  "Zolt\xE1n",
  "P\xE9ter",
  "L\xE1szl\xF3",
  "Istv\xE1n",
  "J\xE1nos",
  "G\xE1bor",
  "Andr\xE1s",
  "Ferenc",
  "S\xE1ndor",
  "J\xF3zsef",
  "Mih\xE1ly",
  "Kriszti\xE1n",
  "Csaba",
  "Zsolt",
  "Imre",
  "Gy\xF6rgy",
  "Viktor",
  "M\xE1rk",
  "\xC1ron",
  "Benedek",
  "Botond",
  "D\xE1niel",
  "Dominik",
  "Endre",
  "Erik",
  "Gell\xE9rt",
  "Henrik",
  "Hubert",
  "Ign\xE1c",
  "Jen\u0151",
  "K\xE1lm\xE1n",
  "L\xF3r\xE1nt",
  "Mikl\xF3s",
  "N\xE1ndor",
  "Oliv\xE9r",
  "Patrik",
  "Rich\xE1rd",
  "R\xF3bert",
  "Roland",
  "Rudolf",
  "Soma",
  "Szabolcs",
  "Szil\xE1rd",
  "Tibor",
  "Vencel",
  "Vilmos",
  "Zsombor",
  "\xC1bel",
  "\xC1kos",
  "\xC1rmin",
  "Barnab\xE1s",
  "Bertalan",
  "Boldizs\xE1r",
  "D\xE9nes",
  "Dezs\u0151",
  "Elek",
  "Elem\xE9r",
  "Emil",
  "Ern\u0151",
  "Farkas",
  "F\xFCl\xF6p",
  "Guszt\xE1v",
  "Gyula",
  "Hug\xF3",
  "Iv\xE1n",
  "J\xE1cint",
  "K\xE1roly",
  "Korn\xE9l",
  "Lajos",
  "Lip\xF3t",
  "M\xE1ty\xE1s",
  "Mih\xE1ly",
  "M\xF3zes",
  "No\xE9",
  "\xD6d\xF6n",
  "P\xE1l",
  "Pongr\xE1c",
  "Rafael",
  "Rezs\u0151",
  "Sebesty\xE9n",
  "Simon",
  "Szilveszter",
  "Tivadar",
  "Vendel",
  "Vince",
  "Z\xE9n\xF3",
  "Zsigmond",
  "\xC1goston",
  "Alad\xE1r",
  "Alfr\xE9d",
  "Antal",
  "\xC1rp\xE1d",
  "B\xE9la",
  "Bertold",
  "B\xE9res",
  "Csongor",
  "Don\xE1t",
  "Ede",
  "Edv\xE1rd",
  "Egon",
  "Elek",
  "Ervin",
  "F\xE1bi\xE1n",
  "F\xE9lix",
  "Frigyes",
  "G\xE9za",
  "Gy\u0151z\u0151",
  "Hajnalka",
  "Hektor",
  "Hug\xF3",
  "Idrisz",
  "Ill\xE9s",
  "Imre",
  "Istv\xE1n",
  "Jakab",
  "J\xE1nos",
  "J\xF3zsef",
  "Judit",
  "Kelemen",
  "Kende",
  "Kereszt\xE9ly",
  "Korn\xE9l",
  "L\xE1szl\xF3",
  "L\xE9n\xE1rd",
  "L\xF3r\xE1nt",
  "M\xE1rton",
  "M\xE1t\xE9",
  "Menyh\xE9rt",
  "Mih\xE1ly",
  "Mikl\xF3s",
  "M\xF3ric",
  "N\xE1ndor",
  "Norbert",
  "\xD6rs",
  "P\xE1l",
  "P\xE9ter",
  "R\xF3bert",
  "S\xE1muel",
  "Seb\u0151",
  "Sebesty\xE9n",
  "Simon",
  "Szabolcs",
  "Szent",
  "Tam\xE1s",
  "Tibor",
  "Tiham\xE9r",
  "Vajk",
  "Val\xE9r",
  "Vencel",
  "Vidor",
  "Viktor",
  "Vilmos",
  "Vince",
  "Zolt\xE1n",
  "Zsombor",
  "Zsolt"
];
var HUNGARIAN_MALE_LASTNAMES = [
  "Nagy",
  "Kov\xE1cs",
  "T\xF3th",
  "Szab\xF3",
  "Horv\xE1th",
  "Varga",
  "Kiss",
  "Moln\xE1r",
  "N\xE9meth",
  "Farkas",
  "Papp",
  "Tak\xE1cs",
  "Juh\xE1sz",
  "Lakatos",
  "M\xE9sz\xE1ros",
  "Simon",
  "R\xE1cz",
  "Balogh",
  "S\xE1ndor",
  "Fekete",
  "Kis",
  "Szil\xE1gyi",
  "Pint\xE9r",
  "Katona",
  "G\xE1l",
  "B\xEDr\xF3",
  "Kir\xE1ly",
  "L\xE1szl\xF3",
  "Jakab",
  "Bal\xE1zs",
  "Fodor",
  "V\xE1radi",
  "Antal",
  "Borb\xE9ly",
  "Somogyi",
  "Heged\u0171s",
  "Ill\xE9s",
  "Guly\xE1s",
  "Kocsis",
  "Veres",
  "Barta",
  "Boros",
  "Csonka",
  "De\xE1k",
  "Dud\xE1s",
  "Farag\xF3",
  "Feh\xE9r",
  "G\xE1sp\xE1r",
  "Hal\xE1sz",
  "Heged\xFCs",
  "Herczeg",
  "Husz\xE1r",
  "K\xE1lm\xE1n",
  "Kelemen",
  "Kerekes",
  "Kert\xE9sz",
  "Kocsis",
  "Kov\xE1cs",
  "Lengyel",
  "Luk\xE1cs",
  "Magyar",
  "M\xE1rton",
  "M\xE1t\xE9",
  "Mih\xE1ly",
  "Mikl\xF3s",
  "Nagy",
  "N\xE9meth",
  "Nov\xE1k",
  "Ol\xE1h",
  "Orb\xE1n",
  "Orosz",
  "P\xE1l",
  "P\xE1sztor",
  "Pataki",
  "P\xE9ter",
  "Pint\xE9r",
  "Popovics",
  "R\xE1cz",
  "R\xE1kosi",
  "S\xE1rk\xF6zi",
  "Sipos",
  "So\xF3s",
  "S\xF6r\xF6s",
  "Szab\xF3",
  "Szalai",
  "Szekeres",
  "Szil\xE1gyi",
  "Sz\u0171cs",
  "Tam\xE1s",
  "T\xF3th",
  "T\xF6r\xF6k",
  "Varga",
  "V\xE1radi",
  "Vass",
  "V\xE9gh",
  "Vincze",
  "Vir\xE1g",
  "Zal\xE1n",
  "Z\xE1mbori",
  "Zolt\xE1n",
  "\xC1cs",
  "\xC1d\xE1m",
  "\xC1goston",
  "Bajnok",
  "Bakos",
  "B\xE1lint",
  "B\xE1n",
  "Barna",
  "Barta",
  "Bart\xF3k",
  "Beke",
  "Bencsik",
  "Bende",
  "Berecz",
  "Bodn\xE1r",
  "Bogn\xE1r",
  "Borb\xE1s",
  "Boros",
  "Budai",
  "Buz\xE1s",
  "Cseh",
  "Csik\xF3s",
  "Csizmadia",
  "Csord\xE1s",
  "Dank\xF3",
  "D\xE1vid",
  "D\xE9nes",
  "Dobos",
  "Domonkos",
  "Dud\xE1s",
  "Egresi",
  "Egyed",
  "F\xE1bi\xE1n",
  "Fazekas",
  "Fekete",
  "Fodor",
  "F\xF6ldi",
  "G\xE1bor",
  "G\xE1l",
  "G\xE1sp\xE1r",
  "Gergely",
  "Guly\xE1s",
  "Gy\u0151ri",
  "Hajdu",
  "Hal\xE1sz",
  "Heged\u0171s",
  "Herczeg",
  "Holl\xF3",
  "Horv\xE1th",
  "Ill\xE9s",
  "Imre",
  "Jakab",
  "Juh\xE1sz",
  "K\xE1d\xE1r",
  "K\xE1lm\xE1n",
  "Kelemen",
  "Kerekes",
  "Kir\xE1ly",
  "Kiss",
  "Kocsis",
  "Kov\xE1cs",
  "Kozma",
  "Kuti",
  "Lakatos",
  "L\xE1szl\xF3",
  "Lengyel",
  "Lipt\xE1k",
  "Luk\xE1cs",
  "Magyar",
  "M\xE1rkus",
  "M\xE1t\xE9",
  "M\xE9sz\xE1ros",
  "Moln\xE1r",
  "Nagy",
  "N\xE9meth",
  "Nov\xE1k",
  "Ol\xE1h",
  "Orb\xE1n",
  "Orosz",
  "P\xE1l",
  "Papp",
  "Pataki",
  "Pint\xE9r",
  "R\xE1cz",
  "R\xE1k\xF3czi",
  "S\xE1ndor",
  "Simon",
  "Somogyi",
  "So\xF3s",
  "Szab\xF3",
  "Szalai",
  "Szekeres",
  "Szil\xE1gyi",
  "Sz\u0171cs",
  "Tak\xE1cs",
  "Tam\xE1s",
  "T\xF3th",
  "T\xF6r\xF6k",
  "Varga",
  "Vass",
  "Veres",
  "Vincze",
  "Vir\xE1g",
  "Zolt\xE1n",
  "Zsigmond"
];

// resources/static_db/names/maltese_data.ts
var MALTESE_MALE_FIRSTNAMES = [
  "Joseph",
  "John",
  "Mark",
  "Mario",
  "David",
  "Paul",
  "Michael",
  "Anthony",
  "Luke",
  "Luca",
  "Matthew",
  "Jacob",
  "Zachary",
  "Nathan",
  "Andrew",
  "Andreas",
  "Andre",
  "Andy",
  "Samuel",
  "Adam",
  "Noah",
  "Liam",
  "Oliver",
  "Benjamin",
  "Daniel",
  "Gabriel",
  "Isaac",
  "Julian",
  "Thomas",
  "Jake",
  "Anton",
  "An\u0121lu",
  "Alessandru",
  "Alfred",
  "Alwi\u0121i",
  "Andrija",
  "Antnin",
  "Arturo",
  "Baldassar",
  "Bernard",
  "Bertu",
  "\u010Aensu",
  "\u010Aikku",
  "\u010Aharlu",
  "Dumniku",
  "Dwardu",
  "Duminku",
  "Fran\u0121isk",
  "\u0120akbu",
  "\u0120akobb",
  "\u0120anni",
  "\u0120or\u0121",
  "\u0120u\u017Ceppi",
  "\u0120u\u017C\xE8",
  "\u0120wann",
  "\u0120wanni",
  "Girgor",
  "Indri",
  "Karmenu",
  "Lawrenz",
  "Leli",
  "Manwel",
  "Mikiel",
  "Ninu",
  "Pawlu",
  "Pinu",
  "Publiju",
  "Roccu",
  "Salvu",
  "Saverju",
  "Spiru",
  "Stiefnu",
  "Tumas",
  "Wenzu",
  "Wistin",
  "Xandru",
  "Xmun",
  "\u017Baren",
  "Aaron",
  "Aiden",
  "Alex",
  "Angelo",
  "Carmel",
  "Charles",
  "Christopher",
  "Dominic",
  "Edward",
  "Emanuel",
  "Emmanuel",
  "Francis",
  "George",
  "Henry",
  "James",
  "Lawrence",
  "Louis",
  "Nicholas",
  "Patrick",
  "Philip",
  "Raymond",
  "Robert",
  "Stephen",
  "Victor",
  "Vincent",
  "William"
];
var MALTESE_MALE_LASTNAMES = [
  "Borg",
  "Vella",
  "Camilleri",
  "Farrugia",
  "Zammit",
  "Galea",
  "Micallef",
  "Grech",
  "Attard",
  "Spiteri",
  "Azzopardi",
  "Cassar",
  "Agius",
  "Caruana",
  "Mifsud",
  "Pace",
  "Galea",
  "Xuereb",
  "Buttigieg",
  "Calleja",
  "Gatt",
  "Mallia",
  "Mizzi",
  "Busuttil",
  "Falzon",
  "Cumbo",
  "Brincat",
  "Cauchi",
  "Zahra",
  "Ellul",
  "Xerri",
  "Teuma",
  "Stivala",
  "Ciappara",
  "Fiteni",
  "Cini",
  "Galdes",
  "Gristi",
  "Parnis",
  "Xiriha",
  "Abdilla",
  "Abela",
  "Azzopardi",
  "Bajada",
  "Baldacchino",
  "Bonello",
  "Bondin",
  "Bonici",
  "Borg",
  "Briffa",
  "Busietta",
  "Cachia",
  "Calafato",
  "Carabott",
  "Cardona",
  "Cassar",
  "Caucci",
  "Chetcuti",
  "Chircop",
  "Cini",
  "Cortis",
  "Cuschieri",
  "Cutajar",
  "Dalli",
  "Debono",
  "Degiorgio",
  "Delia",
  "Dimech",
  "Dingli",
  "Doublet",
  "Ellul",
  "Farrugia",
  "Fenech",
  "Ferriggi",
  "Formosa",
  "Frendo",
  "Galea",
  "Gatt",
  "Grech",
  "Grima",
  "Gauci",
  "Haber",
  "Hili",
  "Lanzon",
  "Lia",
  "Magri",
  "Mallia",
  "Mamo",
  "Mangion",
  "Mercieca",
  "Micallef",
  "Mifsud",
  "Mizzi",
  "Muscat",
  "Pace",
  "Pisani",
  "Portelli",
  "Psaila",
  "Pullicino",
  "Rapa",
  "Rizzo",
  "Saliba",
  "Sammut",
  "Sant",
  "Sciberras",
  "Scicluna",
  "Serracino",
  "Sultana",
  "Tabone",
  "Tanti",
  "Tonna",
  "Vassallo",
  "Vella",
  "Xuereb",
  "Zahra",
  "Zammit",
  "Zarb"
];

// resources/static_db/names/israeli_data.ts
var ISRAELI_MALE_FIRSTNAMES = [
  "David",
  "Yosef",
  "Moshe",
  "Avraham",
  "Yitzhak",
  "Yaakov",
  "Aharon",
  "Yehuda",
  "Shimon",
  "Levi",
  "Yehoshua",
  "Yonatan",
  "Daniel",
  "Eitan",
  "Noam",
  "Ariel",
  "Omer",
  "Itay",
  "Uri",
  "Nadav",
  "Eyal",
  "Gilad",
  "Amir",
  "Barak",
  "Ido",
  "Liran",
  "Shahar",
  "Tal",
  "Ron",
  "Matan",
  "Shai",
  "Nimrod",
  "Ziv",
  "Ori",
  "Alon",
  "Dvir",
  "Ofir",
  "Roi",
  "Guy",
  "Ben",
  "Yair",
  "Asaf",
  "Tomer",
  "Yoav",
  "Yuval",
  "Erez",
  "Hillel",
  "Boaz",
  "Elad",
  "Gal",
  "Itamar",
  "Lior",
  "Nir",
  "Ran",
  "Shaked",
  "Shlomi",
  "Sagi",
  "Yogev",
  "Yotam",
  "Ze'ev",
  "Adam",
  "Aviv",
  "Bar",
  "Doron",
  "Eli",
  "Gideon",
  "Hadar",
  "Ilan",
  "Kfir",
  "Lev",
  "Maor",
  "Natan",
  "Omri",
  "Peleg",
  "Raz",
  "Shmuel",
  "Tzur",
  "Udi",
  "Vered",
  "Yarden",
  "Zohar",
  "Amit",
  "Benny",
  "Carmel",
  "Dani",
  "Eden",
  "Elisha",
  "Eran",
  "Gadi",
  "Haim",
  "Imri",
  "Jared",
  "Kobi",
  "Lavi",
  "Meir",
  "Naor",
  "Oded",
  "Paz",
  "Rafi",
  "Sagiv",
  "Shimon",
  "Tali",
  "Uriel",
  "Yehiel",
  "Zack",
  "Aaron",
  "Abraham",
  "Adi",
  "Akiva",
  "Amos",
  "Avi",
  "Aviel",
  "Aviad",
  "Avishai",
  "Avner",
  "Ayal",
  "Baruch",
  "Ben Zion",
  "Binyamin",
  "Chaim",
  "Dovid",
  "Dov",
  "Efraim",
  "Ehud",
  "Elazar",
  "Eliav",
  "Eliyahu",
  "Ephraim",
  "Ezra",
  "Gershon",
  "Hagai",
  "Hanan",
  "Harel",
  "Hashim",
  "Hershel",
  "Hillel",
  "Isaac",
  "Ishai",
  "Israel",
  "Itzik",
  "Jacob",
  "Jonathan",
  "Judah",
  "Kahana",
  "Koby",
  "Leib",
  "Menashe",
  "Menachem",
  "Mordechai",
  "Moti",
  "Nachman",
  "Naftali",
  "Netanel",
  "Nissim",
  "Noach",
  "Noy",
  "Oren",
  "Pinchas",
  "Rafael",
  "Reuven",
  "Ronni",
  "Rotem",
  "Saul",
  "Shalom",
  "Shaul",
  "Shlomo",
  "Shmuel",
  "Shneur",
  "Shraga",
  "Shuki",
  "Simcha",
  "Solomon",
  "Tanhum",
  "Tuvia",
  "Tzvi",
  "Uzi",
  "Yaacov",
  "Yanky",
  "Yaron",
  "Yehoshua",
  "Yehuda",
  "Yishai",
  "Yisrael",
  "Yitzchak",
  "Yochanan",
  "Yoni",
  "Yossi",
  "Zalman",
  "Zev",
  "Zvi",
  "Arik",
  "Asher",
  "Avihu",
  "Avraham",
  "Benaya",
  "Binyamin",
  "Chanan",
  "Daniyel",
  "Eitan",
  "Elchanan",
  "Eli",
  "Elyakim",
  "Emanuel",
  "Erez",
  "Gavriel",
  "Gershon",
  "Haim",
  "Hanan",
  "Hod",
  "Idan",
  "Ilay",
  "Inbar",
  "Itay",
  "Keren",
  "Liel",
  "Matityahu",
  "Meidad",
  "Menachem",
  "Michal",
  "Mordechai",
  "Moshe",
  "Nadav",
  "Naftali",
  "Netanel",
  "Nir",
  "Noam",
  "Ofer",
  "Ophir",
  "Ori",
  "Orr",
  "Oshri",
  "Otniel",
  "Oz",
  "Pinchas",
  "Rami",
  "Ronen",
  "Rotem",
  "Roy",
  "Shai",
  "Shalom",
  "Shaul",
  "Shay",
  "Shimon",
  "Shlomi",
  "Shmuel",
  "Shoham",
  "Shuki",
  "Tal",
  "Tamir",
  "Tomer",
  "Tzion",
  "Uriel",
  "Yair",
  "Yaki",
  "Yaron",
  "Yehiel",
  "Yehonatan",
  "Yehoshua",
  "Yehuda",
  "Yishai",
  "Yitzhak",
  "Yoav",
  "Yonatan",
  "Yosef",
  "Yossi",
  "Yuval",
  "Ziv"
];
var ISRAELI_MALE_LASTNAMES = [
  "Cohen",
  "Levy",
  "Mizrachi",
  "Peretz",
  "Bitton",
  "Azoulay",
  "David",
  "Mor",
  "Klein",
  "Friedman",
  "Goldberg",
  "Levin",
  "Shapiro",
  "Rosenberg",
  "Weiss",
  "Roth",
  "Kaplan",
  "Abramov",
  "Katz",
  "Ben David",
  "Ben Ezra",
  "Ben Zion",
  "Ben Yosef",
  "Ben Ari",
  "Ben Moshe",
  "Ben Shimon",
  "Ben Gurion",
  "Dayan",
  "Elias",
  "Farkash",
  "Golan",
  "Halevy",
  "Harari",
  "Hasson",
  "Hayun",
  "Herman",
  "Hoffman",
  "Israeli",
  "Kadosh",
  "Kahlon",
  "Kedem",
  "Keren",
  "Lahav",
  "Landau",
  "Lavi",
  "Lazar",
  "Levi",
  "Maman",
  "Maoz",
  "Marom",
  "Mashiach",
  "Mizrahi",
  "Morag",
  "Moshe",
  "Nagar",
  "Nahum",
  "Navon",
  "Neeman",
  "Nissan",
  "Ohana",
  "Oren",
  "Ovadia",
  "Paz",
  "Peled",
  "Perez",
  "Porat",
  "Rabin",
  "Rabinovich",
  "Rahamim",
  "Ram",
  "Rapaport",
  "Ravid",
  "Raz",
  "Regev",
  "Reuven",
  "Romano",
  "Rosen",
  "Rotem",
  "Saada",
  "Sabag",
  "Saban",
  "Sagi",
  "Salomon",
  "Sasson",
  "Schwartz",
  "Shalom",
  "Shamir",
  "Shapira",
  "Sharon",
  "Shemesh",
  "Shilo",
  "Shimon",
  "Shoham",
  "Shulman",
  "Silver",
  "Sinai",
  "Stern",
  "Suissa",
  "Tadmor",
  "Tal",
  "Tamir",
  "Tevet",
  "Toledano",
  "Tzur",
  "Vaknin",
  "Wasser",
  "Weinstein",
  "Yadin",
  "Yahav",
  "Yarkoni",
  "Yitzhaki",
  "Yosef",
  "Zadok",
  "Zamir",
  "Zohar",
  "Zuckerman",
  "Abadi",
  "Abecassis",
  "Abergel",
  "Abulafia",
  "Adler",
  "Aharoni",
  "Almog",
  "Amar",
  "Amram",
  "Arad",
  "Arbel",
  "Ashkenazi",
  "Avidan",
  "Avital",
  "Ayalon",
  "Azaria",
  "Barak",
  "Bar Ilan",
  "Bar Lev",
  "Barak",
  "Bass",
  "Ben Artzi",
  "Ben Haim",
  "Ben Harush",
  "Ben Ishay",
  "Ben Natan",
  "Ben Porat",
  "Ben Shalom",
  "Ben Yair",
  "Ben Yishai",
  "Berkowitz",
  "Bloch",
  "Blum",
  "Bouskila",
  "Braverman",
  "Chaim",
  "Cohen",
  "Dahan",
  "Dankner",
  "Dar",
  "Doron",
  "Eden",
  "Efrati",
  "Eisenberg",
  "Elbaz",
  "Eliezer",
  "Elkayam",
  "Elmaliach",
  "Elyashiv",
  "Eshkol",
  "Farkas",
  "Fogel",
  "Frankel",
  "Freund",
  "Gabai",
  "Gabay",
  "Gafni",
  "Gal",
  "Ganon",
  "Gavrieli",
  "Gefen",
  "Gershon",
  "Gil",
  "Golan",
  "Gold",
  "Goldman",
  "Gottlieb",
  "Greenberg",
  "Gross",
  "Gur",
  "Hadar",
  "Haim",
  "Halperin",
  "Harel",
  "Hasson",
  "Haziza",
  "Hershkovitz",
  "Hirsch",
  "Hofman",
  "Horowitz",
  "Idan",
  "Ilan",
  "Israeli",
  "Kadosh",
  "Kahan",
  "Kahana",
  "Kahn",
  "Kaminer",
  "Kantor",
  "Katz",
  "Kedar",
  "Kenan",
  "Keren",
  "Kessler",
  "Kfir",
  "Kishon",
  "Klausner",
  "Koch",
  "Kohn",
  "Kopel",
  "Koren",
  "Kramer",
  "Kushnir",
  "Lahav",
  "Landau",
  "Lapid",
  "Laufer",
  "Lavi",
  "Leibowitz",
  "Leibson",
  "Leitner",
  "Lerner",
  "Levi",
  "Levin",
  "Levy",
  "Lieberman",
  "Lifshitz",
  "Lior",
  "Lipschitz",
  "Lobel",
  "Lustig",
  "Magen",
  "Maimon",
  "Malchi",
  "Malka",
  "Malkin",
  "Manor",
  "Maoz",
  "Marom",
  "Mass",
  "Matz",
  "Mayer",
  "Medina",
  "Meir",
  "Melamed",
  "Mendel",
  "Meshulam",
  "Mizrahi",
  "Mor",
  "Mordechai",
  "Moshe",
  "Nagar",
  "Nahmani",
  "Naim",
  "Namir",
  "Natan",
  "Navon",
  "Neeman",
  "Negev",
  "Nir",
  "Nissan",
  "Noam",
  "Noy",
  "Ohana",
  "Ophir",
  "Oren",
  "Orlev",
  "Ovadia",
  "Paz",
  "Peled",
  "Peres",
  "Peretz",
  "Perez",
  "Porat",
  "Rabin",
  "Rabinowitz",
  "Rahamim",
  "Ram",
  "Ravid",
  "Raz",
  "Regev",
  "Reich",
  "Reuveni",
  "Rimon",
  "Ronen",
  "Rosen",
  "Rosenberg",
  "Rosenblum",
  "Roth",
  "Rubin",
  "Sabag",
  "Sadan",
  "Sagi",
  "Salem",
  "Salomon",
  "Samocha",
  "Sasson",
  "Schwartz",
  "Segal",
  "Shachar",
  "Shaked",
  "Shalom",
  "Shamir",
  "Shapira",
  "Sharon",
  "Shechter",
  "Shemesh",
  "Shenhav",
  "Shilo",
  "Shimon",
  "Shmuel",
  "Shoham",
  "Shpigel",
  "Shtark",
  "Sidi",
  "Silver",
  "Siman Tov",
  "Sinai",
  "Sofer",
  "Sokol",
  "Stern",
  "Suissa",
  "Swisa",
  "Tadmor",
  "Tal",
  "Tamir",
  "Tayar",
  "Tevet",
  "Toledano",
  "Tzafir",
  "Tzur",
  "Vaknin",
  "Vardi",
  "Wagner",
  "Weiss",
  "Wolf",
  "Yadin",
  "Yahav",
  "Yarkoni",
  "Yechezkel",
  "Yehoshua",
  "Yehuda",
  "Yishai",
  "Yitzhaki",
  "Yosef",
  "Zadok",
  "Zamir",
  "Zohar",
  "Zuckerman"
];

// resources/static_db/names/greek_data.ts
var GREEK_MALE_FIRSTNAMES = [
  "Giorgos",
  "Dimitris",
  "Nikos",
  "Christos",
  "Panagiotis",
  "Ioannis",
  "Konstantinos",
  "Alexandros",
  "Michalis",
  "Antonis",
  "Stavros",
  "Vassilis",
  "Thanasis",
  "Petros",
  "Sotiris",
  "Kostas",
  "Spyros",
  "Manolis",
  "Lefteris",
  "Yiannis",
  "Andreas",
  "Theodoros",
  "Pavlos",
  "Marios",
  "Savvas",
  "Kyriakos",
  "Charalambos",
  "Evangelos",
  "Filippos",
  "Stefanos",
  "Loukas",
  "Elias",
  "Achilleas",
  "Aristides",
  "Athanasios",
  "Dionysios",
  "Eleftherios",
  "Epaminondas",
  "Eustathios",
  "Georgios",
  "Ilias",
  "Konstantinos",
  "Lambros",
  "Leonidas",
  "Makarios",
  "Marinos",
  "Menelaos",
  "Neophytos",
  "Odysseas",
  "Orestis",
  "Pambos",
  "Panayiotis",
  "Paraskevas",
  "Phivos",
  "Photios",
  "Prokopis",
  "Rafail",
  "Sokratis",
  "Spyridon",
  "Stelios",
  "Stylianos",
  "Symeon",
  "Tassos",
  "Themistoklis",
  "Theofanis",
  "Thomas",
  "Timotheos",
  "Titos",
  "Vasileios",
  "Xenophon",
  "Zinon",
  "Adonis",
  "Agapios",
  "Akis",
  "Alexis",
  "Alkis",
  "Anastasios",
  "Andreas",
  "Angelos",
  "Antonis",
  "Apostolos",
  "Aris",
  "Aristarchos",
  "Aristodemos",
  "Aristofanis",
  "Aristos",
  "Athos",
  "Avgoustinos",
  "Avraam",
  "Charis",
  "Chariton",
  "Christakis",
  "Christodoulos",
  "Christoforos",
  "Chrysanthos",
  "Chrysostomos",
  "Damianos",
  "Demetrios",
  "Dimos",
  "Dionisis",
  "Doros",
  "Efthymios",
  "Elpidoforos",
  "Emmanouil",
  "Ermis",
  "Ermogenis",
  "Eugenios",
  "Eustathios",
  "Evripidis",
  "Filippos",
  "Fivos",
  "Fotios",
  "Fragkiskos",
  "Gavriel",
  "Gregoris",
  "Haralambos",
  "Haris",
  "Heraklis",
  "Iakovos",
  "Iason",
  "Ippokratis",
  "Isidoros",
  "Kleanthis",
  "Kostas",
  "Kyprianos",
  "Kyriakos",
  "Lambis",
  "Lambros",
  "Lazaros",
  "Lefkos",
  "Leon",
  "Leontios",
  "Loucas",
  "Louizos",
  "Loukis",
  "Makis",
  "Manos",
  "Manthos",
  "Markos",
  "Martinos",
  "Matthaios",
  "Melis",
  "Michail",
  "Mihalis",
  "Miltos",
  "Minas",
  "Nearchos",
  "Neoklis",
  "Nestor",
  "Nicos",
  "Odysseas",
  "Orestis",
  "Pambos",
  "Panos",
  "Pantelis",
  "Paris",
  "Parmenion",
  "Paschalis",
  "Petros",
  "Philippos",
  "Phivos",
  "Pieris",
  "Polycarpos",
  "Prodromos",
  "Rafail",
  "Renos",
  "Sakis",
  "Savvas",
  "Semos",
  "Sokratis",
  "Sotiris",
  "Spyridon",
  "Stavros",
  "Stefanos",
  "Stelios",
  "Stylianos",
  "Symeon",
  "Takis",
  "Tassos",
  "Thanasis",
  "Themistoklis",
  "Theodoros",
  "Theofanis",
  "Thomas",
  "Titos",
  "Tomas",
  "Vangelis",
  "Vasilis",
  "Vassilis",
  "Viktor",
  "Vlassis",
  "Xanthos",
  "Xenios",
  "Xenophon",
  "Yiannakis",
  "Yiannis",
  "Zinon",
  "Adam",
  "Alekos",
  "Alex",
  "Alexandros",
  "Alkis",
  "Anastasios",
  "Andreas",
  "Angelos",
  "Antonis",
  "Apostolos",
  "Aris",
  "Aristides",
  "Aristodemos",
  "Athanasios",
  "Charalampos",
  "Charis",
  "Christodoulos",
  "Christoforos",
  "Chrysanthos",
  "Demetrios",
  "Dionysios",
  "Doros",
  "Efthymios",
  "Eleftherios",
  "Emmanouil",
  "Ermis",
  "Eugenios",
  "Evangelos",
  "Filippos",
  "Fotios",
  "Georgios",
  "Giorgos",
  "Gregoris",
  "Haralambos",
  "Haris",
  "Heraklis",
  "Ilias",
  "Ioannis",
  "Ippokratis",
  "Kleanthis",
  "Konstantinos",
  "Kostas",
  "Kyriakos",
  "Lambros",
  "Leonidas",
  "Loukas",
  "Makarios",
  "Manolis",
  "Marinos",
  "Matthaios",
  "Michalis",
  "Miltos",
  "Neophytos",
  "Nikolaos",
  "Odysseas",
  "Orestis",
  "Panagiotis",
  "Pantelis",
  "Paraskevas",
  "Petros",
  "Philippos",
  "Rafail",
  "Sokratis",
  "Sotiris",
  "Spyridon",
  "Stavros",
  "Stefanos",
  "Stelios",
  "Stylianos",
  "Symeon",
  "Theodoros",
  "Thomas",
  "Timotheos",
  "Vassilis",
  "Xenophon",
  "Yiannis",
  "Zinon",
  "Achilleas",
  "Adonis",
  "Agapios",
  "Alexis",
  "Alkis",
  "Anastasios",
  "Andreas",
  "Angelos",
  "Antonis",
  "Apostolos",
  "Aris",
  "Aristides",
  "Athanasios",
  "Charalampos",
  "Christodoulos",
  "Christos",
  "Demetrios",
  "Dionysios",
  "Eleftherios",
  "Emmanouil",
  "Evangelos",
  "Filippos",
  "Fotios",
  "Georgios",
  "Giorgos",
  "Ilias",
  "Ioannis",
  "Konstantinos",
  "Kostas",
  "Kyriakos",
  "Lambros",
  "Leonidas",
  "Loukas",
  "Manolis",
  "Michalis",
  "Nikolaos",
  "Panagiotis",
  "Pantelis",
  "Petros",
  "Sotiris",
  "Spyridon",
  "Stavros",
  "Stelios",
  "Theodoros",
  "Thomas",
  "Vassilis",
  "Yiannis",
  "Zinon"
];
var GREEK_MALE_LASTNAMES = [
  "Papadopoulos",
  "Papadopoulou",
  "Georgiou",
  "Papageorgiou",
  "Nikolaou",
  "Ioannou",
  "Christodoulou",
  "Konstantinou",
  "Michailidis",
  "Panagiotou",
  "Dimitriou",
  "Alexandrou",
  "Vasilopoulos",
  "Kostas",
  "Spyropoulos",
  "Antoniou",
  "Stavropoulos",
  "Theodorou",
  "Pavlou",
  "Sotiriou",
  "Kyriakou",
  "Charalambous",
  "Evangelou",
  "Filippos",
  "Manolopoulos",
  "Lefteris",
  "Yiannis",
  "Andreas",
  "Theodoridis",
  "Panagiotidis",
  "Savvas",
  "Kyriakos",
  "Marios",
  "Stelios",
  "Lambrou",
  "Petridis",
  "Athanasiou",
  "Eleftheriou",
  "Panayiotou",
  "Christou",
  "Vasilou",
  "Markou",
  "Evangelou",
  "Paraskevas",
  "Stylianou",
  "Neophytou",
  "Kostas",
  "Louca",
  "Mavrou",
  "Hadjigeorgiou",
  "Hadjichristodoulou",
  "Hadjipavlou",
  "Hadjimichael",
  "Hadjinicolaou",
  "Hadjipetrou",
  "Hadjisavvas",
  "Hadjikostis",
  "Hadjimichael",
  "Hadjistyllis",
  "Hadjipetrou",
  "Andreou",
  "Antoniou",
  "Charalambous",
  "Christodoulou",
  "Constantinou",
  "Demetriou",
  "Eleftheriou",
  "Evangelou",
  "Georgiou",
  "Ioannou",
  "Kleanthous",
  "Kyriacou",
  "Lambrou",
  "Louca",
  "Markou",
  "Michael",
  "Nicolaou",
  "Panagiotou",
  "Papadopoulos",
  "Pavlou",
  "Petrides",
  "Savva",
  "Socratous",
  "Spyrou",
  "Stavrou",
  "Stylianou",
  "Theodorou",
  "Vasilou",
  "Zachariou",
  "Zenonos",
  "Agathangelou",
  "Alexandrou",
  "Anastasiou",
  "Aristidou",
  "Avraam",
  "Bakirtzis",
  "Charalambides",
  "Charitou",
  "Christofides",
  "Chrysanthou",
  "Chrysostomou",
  "Constantinides",
  "Demetriades",
  "Dimitriou",
  "Efthymiou",
  "Eliades",
  "Ellinas",
  "Erotokritou",
  "Fotiou",
  "Frangou",
  "Georgiadis",
  "Georgiades",
  "Gregoriou",
  "Hadjidemetriou",
  "Hadjinicolaou",
  "Hadjipavlou",
  "Hadjisavvas",
  "Hadjitheodorou",
  "Hadjikyriakou",
  "Iacovou",
  "Ioannides",
  "Kakoullis",
  "Kallis",
  "Kalogirou",
  "Karageorgiou",
  "Karamallis",
  "Katsaros",
  "Kleanthous",
  "Konstantinou",
  "Koumi",
  "Kourou",
  "Kyriakides",
  "Kyriakou",
  "Lambrou",
  "Leontiou",
  "Loizou",
  "Loucaides",
  "Makedonas",
  "Mallis",
  "Manoli",
  "Markides",
  "Matsas",
  "Mavrommatis",
  "Michaelides",
  "Mina",
  "Mitsis",
  "Moullos",
  "Neophytou",
  "Nikolaides",
  "Nikolaou",
  "Papageorgiou",
  "Papantoniou",
  "Paphitis",
  "Paraskevas",
  "Patsalides",
  "Pericleous",
  "Petrakis",
  "Philippou",
  "Pierides",
  "Pitsillides",
  "Polyviou",
  "Prodromou",
  "Psaltis",
  "Raptis",
  "Savidis",
  "Savvides",
  "Sideris",
  "Sofocleous",
  "Soteriou",
  "Stavrides",
  "Stylianides",
  "Symeou",
  "Symeonides",
  "Themistocleous",
  "Theocharous",
  "Theodorides",
  "Theofanous",
  "Tofarides",
  "Toma",
  "Tsiakkiros",
  "Tsikkos",
  "Tsolakis",
  "Varnava",
  "Vasileiou",
  "Vassiliou",
  "Xenophontos",
  "Yiallouris",
  "Zachariades",
  "Zembylas",
  "Zenios",
  "Zervos",
  "Adamopoulos",
  "Alexopoulos",
  "Anagnostou",
  "Anastasiadis",
  "Andreopoulos",
  "Angelopoulos",
  "Antoniadis",
  "Argyropoulos",
  "Athanasopoulos",
  "Christopoulos",
  "Diamantis",
  "Dimitriadis",
  "Economou",
  "Efthymiadis",
  "Fotiadis",
  "Georgiadis",
  "Giannakopoulos",
  "Giannopoulos",
  "Grigoriadis",
  "Hadjipavlou",
  "Ioannidis",
  "Kalogeropoulos",
  "Karagiannis",
  "Karamanlis",
  "Karamouzis",
  "Katsouris",
  "Kefalas",
  "Konstantinidis",
  "Kostopoulos",
  "Koulouris",
  "Kouris",
  "Kyriakidis",
  "Lazaridis",
  "Leontidis",
  "Makridis",
  "Manolakis",
  "Markopoulos",
  "Mavridis",
  "Michailidis",
  "Nikolaidis",
  "Panagiotidis",
  "Papadakis",
  "Papadimitriou",
  "Papakonstantinou",
  "Papathanasiou",
  "Pappas",
  "Paraskevopoulos",
  "Pavlidis",
  "Petridis",
  "Raptis",
  "Samaras",
  "Sideris",
  "Sotiropoulos",
  "Stavridis",
  "Stefanidis",
  "Stylianou",
  "Theodoridis",
  "Tsakiris",
  "Tsoukalas",
  "Vasilakis",
  "Vasilopoulos",
  "Vlachos",
  "Voulgaris",
  "Zafeiriou",
  "Zisis",
  "Zografos"
];

// resources/static_db/names/azerbaijani_data.ts
var AZERBAIJANI_MALE_FIRSTNAMES = [
  "Elchin",
  "Ramin",
  "Farid",
  "Ilgar",
  "Anar",
  "Rashad",
  "Eldar",
  "Tural",
  "Orkhan",
  "Fuad",
  "Vugar",
  "Emil",
  "Kamran",
  "Elman",
  "Rovshan",
  "Nizami",
  "Murad",
  "Eldaniz",
  "Aydin",
  "Samir",
  "Ilkin",
  "Rufat",
  "Zaur",
  "Elvin",
  "Nadir",
  "Sabir",
  "Vidadi",
  "Yusif",
  "Bakhtiyar",
  "Parviz",
  "Gurban",
  "Islam",
  "Rahman",
  "Seymur",
  "Tofig",
  "Vahid",
  "Zakir",
  "Arif",
  "Asif",
  "Bayram",
  "Chingiz",
  "Davud",
  "Emin",
  "Fikret",
  "Gafar",
  "Hikmet",
  "Isa",
  "Javid",
  "Kamal",
  "Latif",
  "Mahir",
  "Nabi",
  "Nijat",
  "Osman",
  "Rasim",
  "Sahil",
  "Tahir",
  "Ulvi",
  "Vasif",
  "Yasar",
  "Zeynal",
  "Abbas",
  "Adil",
  "Aghasi",
  "Akif",
  "Alakbar",
  "Alim",
  "Alish",
  "Allahverdi",
  "Amir",
  "Anvar",
  "Arastun",
  "Araz",
  "Arslan",
  "Ashraf",
  "Aydan",
  "Azer",
  "Babek",
  "Bahram",
  "Balagardash",
  "Barat",
  "Bahruz",
  "Bala",
  "Bilal",
  "Bunyad",
  "Ceyhun",
  "Dadash",
  "Dayanat",
  "Elbrus",
  "Elchin",
  "Eldar",
  "Elmir",
  "Elshan",
  "Elvin",
  "Emil",
  "Emin",
  "Elnur",
  "Elshan",
  "Elvin",
  "Emin",
  "Farhad",
  "Farman",
  "Fazil",
  "Fikret",
  "Firudin",
  "Fuad",
  "Gabil",
  "Gahraman",
  "Ganjali",
  "Garib",
  "Gazanfar",
  "Gulali",
  "Gulhuseyn",
  "Gurban",
  "Habil",
  "Hafiz",
  "Hajibala",
  "Hajimurad",
  "Hakim",
  "Hamid",
  "Hasan",
  "Heydar",
  "Hidayat",
  "Hikmat",
  "Huseyn",
  "Ibrahim",
  "Ilgar",
  "Ilham",
  "Ilkin",
  "Ilqar",
  "Imran",
  "Isa",
  "Isfandiyar",
  "Islam",
  "Ismayil",
  "Jabir",
  "Jahangir",
  "Jalal",
  "Jamil",
  "Javad",
  "Kamal",
  "Kamran",
  "Karim",
  "Khalid",
  "Khalil",
  "Khudayar",
  "Latif",
  "Mahammad",
  "Mahir",
  "Mammad",
  "Mansur",
  "Mehdi",
  "Meyxan",
  "Mikayil",
  "Mirza",
  "Mubariz",
  "Muhammed",
  "Musa",
  "Mustafa",
  "Nadir",
  "Nail",
  "Nariman",
  "Nazim",
  "Nijat",
  "Nizami",
  "Nurlan",
  "Nuraddin",
  "Nusret",
  "Ogtay",
  "Orkhan",
  "Osman",
  "Parviz",
  "Ramil",
  "Rashad",
  "Rauf",
  "Rovshan",
  "Rufat",
  "Ruslan",
  "Sabir",
  "Sahib",
  "Sahil",
  "Said",
  "Salim",
  "Samir",
  "Sanan",
  "Sarkhan",
  "Sattar",
  "Sevindik",
  "Shahbaz",
  "Shahriyar",
  "Shamil",
  "Shirin",
  "Shukur",
  "Tahir",
  "Talib",
  "Tofiq",
  "Tural",
  "Ulvi",
  "Umid",
  "Vagif",
  "Vahid",
  "Vakil",
  "Vali",
  "Vasif",
  "Vidadi",
  "Vugar",
  "Yadigar",
  "Yashar",
  "Yusif",
  "Zahid",
  "Zaur",
  "Zeynal",
  "Ziya",
  "Zohrab"
];
var AZERBAIJANI_MALE_LASTNAMES = [
  "Aliyev",
  "Huseynov",
  "Mammadov",
  "Hasanov",
  "Guliyev",
  "Ibrahimov",
  "Abbasov",
  "Rzayev",
  "Safarov",
  "Ahmadov",
  "Ismayilov",
  "Jafarov",
  "Rahimov",
  "Quliyev",
  "Hajiyev",
  "Musayev",
  "Seyidov",
  "Mirzayev",
  "Abdullayev",
  "Bayramov",
  "Nabiyev",
  "Aslanov",
  "Mammadli",
  "Qasimov",
  "Huseynli",
  "Orujov",
  "Salimov",
  "Karimov",
  "Farhadov",
  "Rustamov",
  "Aghayev",
  "Alasgarov",
  "Allahverdiyev",
  "Alizade",
  "Amirov",
  "Amiraslanov",
  "Arifov",
  "Asadov",
  "Asgarov",
  "Azerov",
  "Babayev",
  "Badalov",
  "Baghirov",
  "Bakhtiyarov",
  "Balayev",
  "Bayramli",
  "Bunyadov",
  "Dadashov",
  "Dayanov",
  "Eldarov",
  "Elchinov",
  "Emilov",
  "Farajov",
  "Fazli",
  "Gafarov",
  "Gahramanov",
  "Ganjaliyev",
  "Garayev",
  "Gasimov",
  "Guliyev",
  "Hajiyev",
  "Hakimzade",
  "Hamidov",
  "Hasanov",
  "Heydarov",
  "Hidayatzade",
  "Huseynov",
  "Ibrahimov",
  "Ilhamov",
  "Ilkinov",
  "Isayev",
  "Isfandiyarov",
  "Ismayilov",
  "Jabbarov",
  "Jafarov",
  "Jalilov",
  "Jamilov",
  "Javadov",
  "Kamalov",
  "Karimov",
  "Khalilov",
  "Khanlarov",
  "Khudaverdiyev",
  "Latifov",
  "Maharramov",
  "Mahmudov",
  "Mammadov",
  "Mansurov",
  "Mehraliyev",
  "Mehdiyev",
  "Mikayilov",
  "Mirzayev",
  "Mubarizov",
  "Muhammedov",
  "Muradov",
  "Mustafayev",
  "Nabiyev",
  "Nadirli",
  "Naghiyev",
  "Narimanov",
  "Nasibov",
  "Nazimov",
  "Nematov",
  "Niyazov",
  "Novruzov",
  "Nuriyev",
  "Nurlanov",
  "Orujov",
  "Osmanov",
  "Pashayev",
  "Qadirov",
  "Qahramanov",
  "Qarayev",
  "Qasimov",
  "Quliyev",
  "Rahimov",
  "Rasulov",
  "Rzayev",
  "Safarov",
  "Salimov",
  "Samadov",
  "Samedov",
  "Seyidov",
  "Shahbazov",
  "Shahverdiyev",
  "Shamilov",
  "Sharifov",
  "Shirinov",
  "Soltanov",
  "Suleymanov",
  "Taghiyev",
  "Tahirov",
  "Tahirli",
  "Talibov",
  "Turalov",
  "Usubov",
  "Vahabov",
  "Vahidov",
  "Vakilov",
  "Valiyev",
  "Vasifov",
  "Vidadiyev",
  "Vugarov",
  "Yadigarov",
  "Yagubov",
  "Yusifov",
  "Zahidov",
  "Zamanov",
  "Zeynalov",
  "Ziyadov",
  "Zohrabov",
  "Abbasli",
  "Abdullazade",
  "Aghalarov",
  "Ahmadli",
  "Akhundov",
  "Alakbarov",
  "Aliyev",
  "Allahverdiyev",
  "Almazov",
  "Amiraslanov",
  "Arzumanov",
  "Asgarov",
  "Aydinli",
  "Azimov",
  "Babazade",
  "Bagirov",
  "Bakhtiyarli",
  "Balayev",
  "Bayramov",
  "Dadashli",
  "Eldarov",
  "Elmanov",
  "Farajov",
  "Fikretov",
  "Gahramanli",
  "Garibov",
  "Guliyev",
  "Hajiyev",
  "Hasanli",
  "Huseynli",
  "Ibrahimli",
  "Ilgarli",
  "Ismayilzade",
  "Jabbarli",
  "Jafarli",
  "Kamilov",
  "Karimli",
  "Khalilli",
  "Khanov",
  "Khalafov",
  "Latifli",
  "Mahammadli",
  "Mammadli",
  "Mansimli",
  "Mehdiyev",
  "Mirzazade",
  "Mushfigov",
  "Mustafazade",
  "Nabiyev",
  "Nadirli",
  "Narimanli",
  "Nasirli",
  "Nazirli",
  "Novruzli",
  "Nurullayev",
  "Orujzade",
  "Pashazade",
  "Rahimli",
  "Rasulzade",
  "Rzayev",
  "Sabirzade",
  "Safarli",
  "Salimli",
  "Samadli",
  "Seyidli",
  "Shahbazli",
  "Shukurlu",
  "Soltanli",
  "Suleymanli",
  "Taghizade",
  "Tahirli",
  "Talibli",
  "Turalov",
  "Usubov",
  "Vagifov",
  "Vahabov",
  "Vahidli",
  "Valiyev",
  "Vasifli",
  "Vidadiyev",
  "Vugarli",
  "Yusifli",
  "Zahidov",
  "Zeynalov"
];

// resources/static_db/names/kazakh_data.ts
var KAZAKH_MALE_FIRSTNAMES = [
  "Aidar",
  "Aidos",
  "Aisultan",
  "Alikhan",
  "Alim",
  "Almas",
  "Almat",
  "Aman",
  "Amanat",
  "Amir",
  "Anuar",
  "Arlan",
  "Arman",
  "Arsen",
  "Arystan",
  "Asan",
  "Asat",
  "Askar",
  "Aslan",
  "Asset",
  "Ayan",
  "Azamat",
  "Azat",
  "Bakhyt",
  "Bakir",
  "Bakyt",
  "Bauyrzhan",
  "Bek",
  "Bekzat",
  "Berik",
  "Bolat",
  "Daniyar",
  "Daulet",
  "Dauren",
  "Dauyr",
  "Dias",
  "Dilmukhamed",
  "Dmitriy",
  "Dosym",
  "Edil",
  "Eldar",
  "Eldos",
  "Erbol",
  "Erbolat",
  "Erden",
  "Erdos",
  "Erlan",
  "Ermek",
  "Ermurat",
  "Ernar",
  "Ernur",
  "Ersultan",
  "Galym",
  "Galymzhan",
  "Gani",
  "Gulmurat",
  "Ilyas",
  "Islam",
  "Ismail",
  "Iskander",
  "Kairat",
  "Kaisar",
  "Kaldybek",
  "Kanat",
  "Karamat",
  "Kasym",
  "Kenes",
  "Kenzhebek",
  "Kuanysh",
  "Kuat",
  "Madi",
  "Madiyar",
  "Maksat",
  "Mansur",
  "Marat",
  "Margulan",
  "Miras",
  "Mirlan",
  "Murat",
  "Musa",
  "Nartay",
  "Nazar",
  "Nurlan",
  "Nursultan",
  "Nurtas",
  "Nurzhan",
  "Olzhas",
  "Omar",
  "Rakhat",
  "Ramazan",
  "Rasul",
  "Rauan",
  "Rinat",
  "Rishat",
  "Rustam",
  "Sadyk",
  "Sagynysh",
  "Saken",
  "Sanzhar",
  "Sapar",
  "Sardar",
  "Sarsen",
  "Sartay",
  "Serik",
  "Serikbay",
  "Serikzhan",
  "Shakhzod",
  "Shamil",
  "Shyngys",
  "Sultan",
  "Syrgak",
  "Tair",
  "Talgar",
  "Talip",
  "Tamerlan",
  "Taras",
  "Temir",
  "Temirlan",
  "Tengiz",
  "Timur",
  "Tolegen",
  "Toleu",
  "Tomas",
  "Tursyn",
  "Ulan",
  "Umar",
  "Yerbol",
  "Yerkebulan",
  "Yermek",
  "Yermurat",
  "Yernar",
  "Yernur",
  "Yersultan",
  "Yerzhan",
  "Yessen",
  "Yusup",
  "Zhanat",
  "Zhandos",
  "Zhanibek",
  "Zhanuzak",
  "Zhaslan",
  "Zhasulan",
  "Zhasur",
  "Zhassulan",
  "Zhasyr",
  "Zhetpis",
  "Zhomart",
  "Zhumas",
  "Zhyrgal",
  "Ziyad",
  "Abay",
  "Abzal",
  "Adil",
  "Adilet",
  "Adilzhan",
  "Aidos",
  "Akhmet",
  "Akmaral",
  "Aktan",
  "Alen",
  "Ali",
  "Alibek",
  "Alik",
  "Alisher",
  "Almas",
  "Altyn",
  "Amangeldy",
  "Amirzhan",
  "Anuarbek",
  "Ardak",
  "Arman",
  "Arsen",
  "Artyom",
  "Asanali",
  "Asel",
  "Askhat",
  "Aslanbek",
  "Aybek",
  "Aydar",
  "Ayman",
  "Aysultan",
  "Azamat",
  "Azat",
  "Bakhytzhan",
  "Bakir",
  "Baktybek",
  "Bauyrzhan",
  "Bekbolat",
  "Beknur",
  "Bekzat",
  "Berik",
  "Bolatbek",
  "Daniil",
  "Daniyar",
  "Darkhan",
  "Dauletbek",
  "Dauren",
  "Dauyrzhan",
  "Dias",
  "Dilmurat",
  "Dmitry",
  "Dos",
  "Duman",
  "Edige",
  "Eldar",
  "Elkhan",
  "Elman",
  "Elnur",
  "Eraly",
  "Erbolat",
  "Erdaulet",
  "Erden",
  "Erdos",
  "Erlan",
  "Ermek",
  "Ermurat",
  "Ernar",
  "Ernur",
  "Ersain",
  "Ersultan",
  "Erzhan",
  "Galym",
  "Gani",
  "Ibragim",
  "Ilias",
  "Ilyas",
  "Islam",
  "Ismail",
  "Kairat",
  "Kaisar",
  "Kanat",
  "Karamat",
  "Kasym",
  "Kenes",
  "Kenzhe",
  "Kuanysh",
  "Kuat",
  "Madi",
  "Madiyar",
  "Maksat",
  "Marat",
  "Margulan",
  "Miras",
  "Mirlan",
  "Murat",
  "Musa",
  "Nartay",
  "Nazar",
  "Nurlan",
  "Nursultan",
  "Nurtas",
  "Nurzhan",
  "Olzhas",
  "Omar",
  "Rakhat",
  "Ramazan",
  "Rasul",
  "Rauan",
  "Rinat",
  "Rishat",
  "Rustam",
  "Sagynysh",
  "Saken",
  "Sanzhar",
  "Sapar",
  "Sardar",
  "Serik",
  "Serikzhan",
  "Shakhzod",
  "Shamil",
  "Shyngys",
  "Sultan",
  "Syrgak",
  "Tair",
  "Talgar",
  "Talip",
  "Tamerlan",
  "Temir",
  "Temirlan",
  "Tengiz",
  "Timur",
  "Tolegen",
  "Tursyn",
  "Ulan",
  "Umar",
  "Yerbol",
  "Yerkebulan",
  "Yermek",
  "Yermurat",
  "Yernar",
  "Yernur",
  "Yersultan",
  "Yerzhan",
  "Yessen",
  "Yusup",
  "Zhanat",
  "Zhandos",
  "Zhanibek",
  "Zhaslan",
  "Zhasulan",
  "Zhasur",
  "Zhassulan",
  "Zhyrgal",
  "Ziyad"
];
var KAZAKH_MALE_LASTNAMES = [
  "Abdrakhmanov",
  "Abilov",
  "Akhmetov",
  "Akhmetzhanov",
  "Aliev",
  "Alimbekov",
  "Alimzhanov",
  "Altynbekov",
  "Amanov",
  "Amanzholov",
  "Amirbekov",
  "Amirkhanov",
  "Artykbayev",
  "Asanov",
  "Askarov",
  "Aslanov",
  "Aubakirov",
  "Auezov",
  "Auyezov",
  "Baimbetov",
  "Baimenov",
  "Baitursynov",
  "Baktybayev",
  "Balapanov",
  "Balgimbayev",
  "Balmagambetov",
  "Balmukhanov",
  "Baltabayev",
  "Batyrov",
  "Bauyrzhanov",
  "Bekbolatov",
  "Bekmuratov",
  "Bekov",
  "Bekzhanov",
  "Berdibekov",
  "Berdikulov",
  "Berdybekov",
  "Biyashev",
  "Bolatov",
  "Boranbayev",
  "Bozhbanov",
  "Burkitbayev",
  "Daulenov",
  "Dauletov",
  "Dauletbayev",
  "Dauletbekov",
  "Dauletov",
  "Doszhanov",
  "Duisenov",
  "Dusenov",
  "Elemesov",
  "Ermekov",
  "Ermolov",
  "Erzhanov",
  "Esengeldiyev",
  "Esenov",
  "Esirkepov",
  "Gabdullin",
  "Galiyev",
  "Gulimov",
  "Ibraev",
  "Ibragimov",
  "Ibrayev",
  "Ilyasov",
  "Imashev",
  "Isayev",
  "Iskakov",
  "Iskanderov",
  "Ismagulov",
  "Ismailov",
  "Jabayev",
  "Jaksybekov",
  "Jandarbekov",
  "Jangeldin",
  "Japarov",
  "Jumabaev",
  "Kabylbekov",
  "Kairatov",
  "Kairbekov",
  "Kaliev",
  "Kalmakhanov",
  "Kalmuratov",
  "Kamalov",
  "Kambarov",
  "Kambarov",
  "Kanagatov",
  "Kanatov",
  "Karashev",
  "Karimov",
  "Kasymov",
  "Kassymov",
  "Kenzhebayev",
  "Kenzhebekov",
  "Kenzhegulov",
  "Khamitov",
  "Khairullin",
  "Khasenov",
  "Khasenuly",
  "Khatimov",
  "Khozhamzharov",
  "Kozhakhmetov",
  "Kozhamkulov",
  "Kudaibergenov",
  "Kudaibergenuly",
  "Kulanov",
  "Kulmanov",
  "Kurmangaliyev",
  "Kusainov",
  "Kussainov",
  "Kydyrmanov",
  "Madenov",
  "Madiyev",
  "Maksutov",
  "Mamytov",
  "Maratov",
  "Mashrapov",
  "Mataev",
  "Matayev",
  "Mukhtarov",
  "Mukushev",
  "Muratov",
  "Mussin",
  "Mussinov",
  "Myrzabayev",
  "Myrzakhmetov",
  "Nabiyev",
  "Nurgaliyev",
  "Nurgazin",
  "Nurkasymov",
  "Nurkenov",
  "Nurlanov",
  "Nurlybayev",
  "Nurmoldin",
  "Nurmukhamedov",
  "Nurpeisov",
  "Nursultanov",
  "Nurymov",
  "Nusupov",
  "Omarov",
  "Orazbayev",
  "Orazov",
  "Orynbayev",
  "Orynbekov",
  "Ospanov",
  "Ospanuly",
  "Otegenov",
  "Otepbergenov",
  "Oteuliyev",
  "Otkeldiyev",
  "Otynshiyev",
  "Pavlov",
  "Rakhimov",
  "Rakhmanov",
  "Rakhmetov",
  "Ramazanov",
  "Ryskulov",
  "Sabirov",
  "Sadykov",
  "Sagimbayev",
  "Sagindykov",
  "Sakenov",
  "Salgaraev",
  "Salmaganbetov",
  "Salykov",
  "Samatov",
  "Saparov",
  "Sarbayev",
  "Sarsenbayev",
  "Sarsenov",
  "Sarybayev",
  "Satpayev",
  "Sautov",
  "Serikbayev",
  "Serikov",
  "Shaikenov",
  "Shaimardanov",
  "Shakenov",
  "Shalabayev",
  "Shamshiyev",
  "Sharipov",
  "Shayakhmetov",
  "Shaydullin",
  "Shaymerdenov",
  "Shegenov",
  "Shukurov",
  "Smailov",
  "Smagulov",
  "Smanov",
  "Smaylov",
  "Sultanov",
  "Sydykov",
  "Taimasov",
  "Tazhibayev",
  "Tazhiyev",
  "Temirbekov",
  "Temirgaliev",
  "Tleubayev",
  "Tleugabylov",
  "Tleulessov",
  "Tolegenov",
  "Toleuov",
  "Toleubayev",
  "Tulegenov",
  "Tulepov",
  "Tuleubayev",
  "Tursunov",
  "Ualiyev",
  "Ulanov",
  "Umarov",
  "Urazbayev",
  "Urazov",
  "Utegenov",
  "Uteuliyev",
  "Uzbekov",
  "Yakubov",
  "Yerzhanov",
  "Yessimov",
  "Yessengeldiyev",
  "Yessimov",
  "Yusupov",
  "Zhanabayev",
  "Zhanatov",
  "Zhandarbekov",
  "Zhanibekov",
  "Zhanuzakov",
  "Zhasuzakov",
  "Zhaylauov",
  "Zholdasov",
  "Zholdybayev",
  "Zhumashev",
  "Zhussupov",
  "Zhunisov",
  "Zhunusov",
  "Ziyabekov",
  "Zhumagaliyev",
  "Zhumabayev",
  "Zhumagulov",
  "Zhumaliev",
  "Zhumartov",
  "Zhumatov"
];

// resources/static_db/names/southamerican_data.ts
var SOUTH_AMERICAN_MALE_FIRSTNAMES = [
  "Mateo",
  "Santiago",
  "Lucas",
  "Liam",
  "Thiago",
  "Benjam\xEDn",
  "Gaspar",
  "Facundo",
  "Vicente",
  "Gael",
  "Mat\xEDas",
  "Sebasti\xE1n",
  "Alejandro",
  "Nicol\xE1s",
  "Mart\xEDn",
  "Emiliano",
  "Joaqu\xEDn",
  "Diego",
  "Gabriel",
  "Juan",
  "Jos\xE9",
  "Carlos",
  "Luis",
  "Jorge",
  "Miguel",
  "Roberto",
  "Pedro",
  "Francisco",
  "Antonio",
  "Andr\xE9s",
  "Pablo",
  "Fernando",
  "Ricardo",
  "Leonardo",
  "Gonzalo",
  "Hern\xE1n",
  "Ignacio",
  "Eduardo",
  "Marcelo",
  "Ra\xFAl",
  "Hugo",
  "Oscar",
  "Daniel",
  "Adri\xE1n",
  "Gustavo",
  "Sergio",
  "Ram\xF3n",
  "Esteban",
  "Mariano",
  "Claudio",
  "V\xEDctor",
  "Enrique",
  "Alberto",
  "Mauricio",
  "Rub\xE9n",
  "Patricio",
  "Cristian",
  "David",
  "Maximiliano",
  "Valent\xEDn",
  "Lautaro",
  "Franco",
  "Bruno",
  "Santino",
  "Felipe",
  "Matteo",
  "Noah",
  "Dante",
  "Jer\xF3nimo",
  "Tob\xEDas",
  "Ramiro",
  "Ezequiel",
  "Leandro",
  "Nahuel",
  "Alexis",
  "Brian",
  "C\xE9sar",
  "Dami\xE1n",
  "El\xEDas",
  "Fabio",
  "Gast\xF3n",
  "H\xE9ctor",
  "Iv\xE1n",
  "Julio",
  "Kevin",
  "Luciano",
  "Octavio",
  "Quint\xEDn",
  "Rodrigo",
  "Ulises",
  "Walter",
  "Xavier",
  "Yago",
  "Zacar\xEDas",
  "Abel",
  "Adolfo",
  "\xC1lvaro",
  "Amado",
  "An\xEDbal",
  "Armando",
  "Arturo",
  "Atilio",
  "Augusto",
  "Bartolom\xE9",
  "Bernardo",
  "Blas",
  "Braulio",
  "Camilo",
  "C\xE1ndido",
  "Crist\xF3bal",
  "Dar\xEDo",
  "Domingo",
  "Donato",
  "Edgardo",
  "Elio",
  "Emilio",
  "Ernesto",
  "Eugenio",
  "Fabian",
  "Fausto",
  "Ferm\xEDn",
  "Fidel",
  "Gerardo",
  "Germ\xE1n",
  "Gilberto",
  "Gregorio",
  "Guillermo",
  "Horacio",
  "Humberto",
  "Ismael",
  "Jacinto",
  "Jaime",
  "Jes\xFAs",
  "Justo",
  "Leopoldo",
  "Lino",
  "Lorenzo",
  "Manuel",
  "Marco",
  "Marcos",
  "Mario",
  "M\xE1ximo",
  "Milton",
  "Mois\xE9s",
  "N\xE9stor",
  "Norberto",
  "Omar",
  "Rafael",
  "Ren\xE9",
  "Rom\xE1n",
  "Rufino",
  "Salvador",
  "Sim\xF3n",
  "Teodoro",
  "Tom\xE1s",
  "Uriel",
  "Vicente",
  "Abelardo",
  "Adalberto",
  "Ad\xE1n",
  "Agust\xEDn",
  "Albano",
  "Alfonso",
  "Alfredo",
  "Alonso",
  "Amancio",
  "Anselmo",
  "Ariel",
  "Aurelio",
  "Baltasar",
  "Basilio",
  "Benito",
  "Bonifacio",
  "C\xE1ssio",
  "Celso",
  "C\xEDcero",
  "Constantino",
  "Crist\xF3v\xE3o",
  "Dami\xE3o",
  "D\xE9cio",
  "Dem\xE9trio",
  "Denis",
  "Dorival",
  "Du\xEDlio",
  "Durval",
  "Edilson",
  "Edmar",
  "Edmilson",
  "El\xE1dio",
  "El\xEDsio",
  "En\xE9as",
  "Evaristo",
  "Everaldo",
  "Expedito",
  "Feliciano",
  "F\xE9lix",
  "Firmino",
  "Flor\xEAncio",
  "Fortunato",
  "Franco",
  "Geraldo",
  "Get\xFAlio",
  "Gide\xE3o",
  "Glauber",
  "Glauco",
  "Gon\xE7alo",
  "Hamilton",
  "Haroldo",
  "Hermes",
  "Hil\xE1rio",
  "Ibrahim",
  "Idal\xEDcio",
  "In\xE1cio",
  "Irineu",
  "Isa\xEDas",
  "Israel",
  "Ivo",
  "Jackson",
  "Jair",
  "Jairo",
  "James",
  "J\xE2nio",
  "Jardel",
  "Jarbas",
  "Jeferson",
  "Jer\xF4nimo",
  "Jesu\xEDno",
  "Jonas",
  "Josu\xE9",
  "Joviano",
  "Juarez",
  "J\xFAlio",
  "Juraci",
  "Justiniano",
  "Juvenal",
  "Kl\xE9ber",
  "Laerte",
  "Lauro",
  "Le\xF4ncio",
  "L\xEDdio",
  "Maciel",
  "Manoel",
  "Martinho",
  "Melqu\xEDades",
  "Micael",
  "Moacir",
  "Nabor",
  "Nataniel",
  "N\xE9lio",
  "Newton",
  "Nicolau",
  "Nilo",
  "Nilton",
  "Nivaldo",
  "Olavo",
  "Ol\xEDmpio",
  "Onofre",
  "Oriovaldo",
  "Osman",
  "Osmar",
  "Osvaldo",
  "Otac\xEDlio",
  "Otoniel",
  "Ovaldo",
  "Ozeias",
  "Pascoal",
  "Patr\xEDcio",
  "Pel\xE9",
  "Percival",
  "P\xE9ricles",
  "Pierre",
  "Pl\xEDnio",
  "Policarpo",
  "Prudente",
  "Quintino",
  "Raimundo",
  "Ramiro",
  "Reginaldo",
  "Reinaldo",
  "Richard",
  "Robson",
  "Rodolfo",
  "Rog\xE9rio",
  "Rom\xE1rio",
  "R\xF4mulo",
  "Ronald",
  "Ronaldo",
  "Roque",
  "Rui",
  "Ruy",
  "S\xE1lvio",
  "Sandoval",
  "Saulo",
  "Severino",
  "Sidney",
  "Silas",
  "Silvestre",
  "Sime\xE3o",
  "S\xEDlvio",
  "Sotero",
  "Stanislau",
  "Tadeu",
  "Tarc\xEDsio",
  "Tasso",
  "Te\xF3filo",
  "Ter\xEAncio",
  "Thales",
  "Th\xE9o",
  "Thomas",
  "Thomaz",
  "Tib\xE9rio",
  "Tim\xF3teo",
  "Tobias",
  "Trist\xE3o",
  "Ubirajara",
  "Ubiratan",
  "Ulisses",
  "Urbano",
  "Valdemar",
  "Valdir",
  "Valter",
  "Vanderlei",
  "Vasco",
  "Ven\xE2ncio",
  "Venceslau",
  "Vidal",
  "Vin\xEDcius",
  "Virg\xEDlio",
  "V\xEDtor",
  "Wagner",
  "Waldemar",
  "Waldir",
  "Washington",
  "Wellington",
  "Wesley",
  "William",
  "Wilson",
  "Zeno",
  "Z\xE9",
  "Zeca",
  "Josue",
  "Edison",
  "Darwin",
  "Jairo",
  "Henry",
  "Edwin",
  "Jonathan",
  "Gary",
  "Michael",
  "Cristopher",
  "Erick",
  "Bryam",
  "Jefferson",
  "Byron",
  "Geovanny",
  "Andre",
  "Fabio",
  "Eduar",
  "Juan Manuel",
  "Alfredo",
  "Sebastian",
  "Ernesto",
  "Victor",
  "Pedro",
  "Walter",
  "Nemine",
  "Sonny",
  "Fernando",
  "Louis",
  "Charlie",
  "Jhonny",
  "Reginald",
  "Adonis",
  "Franklin",
  "Mario",
  "John",
  "Roy",
  "Kleber",
  "Will",
  "Angel",
  "Nicolas",
  "Robert",
  "Emilio",
  "Keysi",
  "Yandri",
  "Steven",
  "Pablo",
  "Jordy",
  "Adriel",
  "Isaac",
  "Eithan",
  "Enzo",
  "Luciano",
  "Mathias",
  "Marcelo",
  "Cristian",
  "Julian",
  "Simon",
  "Ian",
  "Amaro",
  "Leon",
  "Alonso",
  "Jose",
  "Cristobal",
  "Diego",
  "Juan",
  "Nicolas",
  "Sebastian",
  "Felipe",
  "Tomas"
];
var SOUTH_AMERICAN_MALE_LASTNAMES = [
  "Rodr\xEDguez",
  "G\xF3mez",
  "Gonz\xE1lez",
  "Mart\xEDnez",
  "Garc\xEDa",
  "L\xF3pez",
  "Hern\xE1ndez",
  "S\xE1nchez",
  "P\xE9rez",
  "Ram\xEDrez",
  "Torres",
  "Flores",
  "Morales",
  "Rojas",
  "Ortiz",
  "Silva",
  "Navarro",
  "Vargas",
  "Castro",
  "Mendoza",
  "Ruiz",
  "Jim\xE9nez",
  "Moreno",
  "\xC1lvarez",
  "Romero",
  "Fern\xE1ndez",
  "D\xEDaz",
  "Acosta",
  "Molina",
  "Su\xE1rez",
  "Delgado",
  "V\xE1zquez",
  "Cruz",
  "Castillo",
  "Sosa",
  "Vega",
  "Pereyra",
  "R\xEDos",
  "Luna",
  "Mu\xF1oz",
  "Blanco",
  "Soto",
  "Campos",
  "Ibarra",
  "Peralta",
  "Ben\xEDtez",
  "M\xE9ndez",
  "Ferrari",
  "Paz",
  "Godoy",
  "Carrizo",
  "Quiroga",
  "Rivera",
  "Cort\xE9s",
  "Cabrera",
  "Vera",
  "C\xE1ceres",
  "Figueroa",
  "Dom\xEDnguez",
  "Reyes",
  "Guerrero",
  "Montes",
  "Santana",
  "Maldonado",
  "Correa",
  "Valdez",
  "Espinoza",
  "M\xE1rquez",
  "Santos",
  "Ponce",
  "Villalba",
  "Arias",
  "Ojeda",
  "Salazar",
  "Miranda",
  "Leiva",
  "Barrios",
  "Galv\xE1n",
  "Aguilera",
  "P\xE1ez",
  "Escobar",
  "Montero",
  "Alonso",
  "Contreras",
  "Barreto",
  "Duarte",
  "Palacios",
  "Serrano",
  "Pe\xF1a",
  "Carrasco",
  "Gallardo",
  "Rueda",
  "Vidal",
  "Arce",
  "Guzm\xE1n",
  "Fuentes",
  "Salas",
  "Vallejos",
  "Coronel",
  "Bustos",
  "Ledesma",
  "Franco",
  "Cardozo",
  "Lucero",
  "Nieto",
  "Rold\xE1n",
  "Villanueva",
  "Sandoval",
  "Z\xE1rate",
  "Bianchi",
  "Morel",
  "Lombardi",
  "Russo",
  "Romano",
  "Marino",
  "Conte",
  "Bruno",
  "Rossi",
  "Moretti",
  "Esp\xF3sito",
  "De Luca",
  "Rizzo",
  "Barbieri",
  "Colombo",
  "Gallo",
  "Gentile",
  "Greco",
  "Marchetti",
  "Martini",
  "Mazza",
  "Monti",
  "Neri",
  "Orlando",
  "Pellegrini",
  "Ricci",
  "Rinaldi",
  "Santoro",
  "Serra",
  "Sorrentino",
  "Valentini",
  "Vitale",
  "Abad",
  "Aguilar",
  "Andrade",
  "Arrieta",
  "B\xE1ez",
  "Battaglia",
  "Beltr\xE1n",
  "Berm\xFAdez",
  "Bogado",
  "Bonifacio",
  "Bord\xF3n",
  "Brizuela",
  "Calder\xF3n",
  "C\xE1mera",
  "Cantero",
  "Casco",
  "Cejas",
  "Centuri\xF3n",
  "Ch\xE1vez",
  "Corval\xE1n",
  "Crespo",
  "De la Cruz",
  "Encina",
  "Esp\xEDnola",
  "Falc\xF3n",
  "Far\xEDas",
  "Ferreira",
  "Galarza",
  "Gim\xE9nez",
  "Guerra",
  "Heredia",
  "Insfr\xE1n",
  "Jara",
  "Lencina",
  "Lozano",
  "Lugo",
  "Mar\xEDn",
  "Merlo",
  "Montiel",
  "N\xFA\xF1ez",
  "Oliva",
  "Oviedo",
  "Paredes",
  "Portillo",
  "Qui\xF1ones",
  "Rivero",
  "Tapia",
  "Zelaya",
  "Quispe",
  "Mamani",
  "Araya",
  "Vergara",
  "Z\xFA\xF1iga",
  "Jaramillo",
  "Restrepo",
  "Montoya",
  "Valencia",
  "Giraldo",
  "Pab\xF3n",
  "Ramos",
  "Le\xF3n",
  "Soto",
  "Cruz",
  "Torres",
  "Ortiz",
  "Medina",
  "Herrera",
  "Gutierrez",
  "Ch\xE1vez",
  "Reyes",
  "Morales",
  "Vargas",
  "Castro",
  "Flores",
  "Rojas",
  "Acosta",
  "Molina",
  "Su\xE1rez",
  "Delgado",
  "V\xE1zquez",
  "Castillo",
  "Sosa",
  "Vega",
  "Pereyra",
  "R\xEDos",
  "Luna",
  "Mu\xF1oz",
  "Blanco",
  "Campos",
  "Ibarra",
  "Peralta",
  "Ben\xEDtez",
  "M\xE9ndez",
  "Paz",
  "Godoy",
  "Quiroga",
  "Rivera",
  "Cort\xE9s",
  "Cabrera",
  "Vera",
  "Figueroa",
  "Dom\xEDnguez",
  "Reyes",
  "Guerrero",
  "Santana",
  "Maldonado",
  "Correa",
  "Valdez",
  "Espinoza",
  "M\xE1rquez",
  "Ponce",
  "Arias",
  "Ojeda",
  "Salazar",
  "Miranda",
  "Leiva",
  "Barrios",
  "Galv\xE1n",
  "Escobar",
  "Montero",
  "Contreras",
  "Duarte",
  "Palacios",
  "Serrano",
  "Pe\xF1a",
  "Carrasco",
  "Gallardo",
  "Vidal",
  "Guzm\xE1n",
  "Fuentes",
  "Salas",
  "Bustos",
  "Ledesma",
  "Franco",
  "Lucero",
  "Nieto",
  "Rold\xE1n",
  "Sandoval",
  "Z\xE1rate",
  "Abad",
  "Aguilar",
  "Andrade",
  "B\xE1ez",
  "Beltr\xE1n",
  "Calder\xF3n",
  "Ch\xE1vez",
  "Crespo",
  "Far\xEDas",
  "Gim\xE9nez",
  "Heredia",
  "Jara",
  "Lozano",
  "Mar\xEDn",
  "Montiel",
  "N\xFA\xF1ez",
  "Oliva",
  "Paredes",
  "Tapia",
  "Zelaya",
  "Quispe",
  "Mamani",
  "Araya",
  "Vergara",
  "Jaramillo",
  "Restrepo",
  "Montoya",
  "Valencia",
  "Giraldo",
  "Pab\xF3n",
  "Le\xF3n",
  "Medina",
  "Herrera",
  "Gutierrez",
  "Ramos",
  "Cruz",
  "Torres",
  "Ortiz",
  "Vargas",
  "Flores",
  "Rojas",
  "Acosta",
  "Molina",
  "Su\xE1rez",
  "Delgado",
  "V\xE1zquez",
  "Castillo",
  "Sosa",
  "Vega",
  "Pereyra",
  "R\xEDos",
  "Luna",
  "Mu\xF1oz",
  "Blanco",
  "Campos",
  "Ibarra",
  "Peralta",
  "Ben\xEDtez",
  "M\xE9ndez",
  "Paz",
  "Godoy",
  "Quiroga",
  "Rivera",
  "Cort\xE9s",
  "Cabrera",
  "Vera",
  "Figueroa",
  "Dom\xEDnguez",
  "Reyes",
  "Guerrero",
  "Santana",
  "Maldonado",
  "Correa",
  "Valdez",
  "Espinoza",
  "M\xE1rquez",
  "Ponce",
  "Arias",
  "Ojeda",
  "Salazar",
  "Miranda",
  "Leiva",
  "Barrios",
  "Galv\xE1n",
  "Escobar",
  "Montero",
  "Contreras",
  "Duarte",
  "Palacios",
  "Serrano",
  "Pe\xF1a",
  "Carrasco",
  "Gallardo",
  "Vidal",
  "Guzm\xE1n",
  "Fuentes",
  "Salas",
  "Bustos",
  "Ledesma",
  "Franco",
  "Lucero",
  "Nieto",
  "Rold\xE1n",
  "Sandoval",
  "Z\xE1rate"
];

// resources/static_db/names/mexican_data.ts
var MEXICAN_MALE_FIRSTNAMES = [
  "Santiago",
  "Mateo",
  "Sebasti\xE1n",
  "Leonardo",
  "Emiliano",
  "Mat\xEDas",
  "Diego",
  "Daniel",
  "Alejandro",
  "Miguel",
  "Liam",
  "Thiago",
  "Gael",
  "Noah",
  "Alexander",
  "Jes\xFAs",
  "\xC1ngel",
  "David",
  "Emmanuel",
  "Luis",
  "Rodrigo",
  "Fernando",
  "Maximiliano",
  "Jos\xE9",
  "Gabriel",
  "Eduardo",
  "Juan",
  "Rafael",
  "Isaac",
  "Samuel",
  "Axel",
  "Nicol\xE1s",
  "Emilio",
  "Dami\xE1n",
  "Leonel",
  "El\xEDas",
  "Ricardo",
  "Adri\xE1n",
  "Mauricio",
  "Antonio",
  "Alan",
  "Jonathan",
  "Francisco",
  "Carlos",
  "Juan Pablo",
  "Miguel \xC1ngel",
  "Jos\xE9 \xC1ngel",
  "Jos\xE9 Luis",
  "Luis \xC1ngel",
  "Valent\xEDn",
  "Lucas",
  "Benjam\xEDn",
  "Joaqu\xEDn",
  "Andr\xE9s",
  "Pablo",
  "Hugo",
  "Alonso",
  "Jorge",
  "Manuel",
  "Pedro",
  "Enrique",
  "Felipe",
  "Arturo",
  "Oscar",
  "Erick",
  "Fabian",
  "Gustavo",
  "Salvador",
  "Gerardo",
  "Ram\xF3n",
  "Armando",
  "H\xE9ctor",
  "Roberto",
  "V\xEDctor",
  "Alberto",
  "Mario",
  "Iker",
  "Bruno",
  "Juli\xE1n",
  "Andr\xE9s",
  "Rafael",
  "Axel",
  "Iv\xE1n",
  "Mauricio",
  "Dante",
  "Camilo",
  "Fabi\xE1n",
  "Rodrigo",
  "Samuel",
  "Emilio",
  "Alejandro",
  "Fernando",
  "Mart\xEDn",
  "Lorenzo",
  "Tom\xE1s",
  "Agust\xEDn",
  "Ignacio",
  "\xC1lvaro",
  "Cristian",
  "Esteban",
  "Francisco Javier",
  "Guillermo",
  "H\xE9ctor",
  "Ismael",
  "Javier",
  "Kevin",
  "Luis Fernando",
  "Marco",
  "Nicol\xE1s",
  "Orlando",
  "Patricio",
  "Quint\xEDn",
  "Ra\xFAl",
  "Sergio",
  "Tom\xE1s",
  "Ulises",
  "Vicente",
  "Xavier",
  "Yair",
  "Zacar\xEDas",
  "Ad\xE1n",
  "Braulio",
  "C\xE9sar",
  "Domingo",
  "Ernesto",
  "Fidel",
  "Gonzalo",
  "Hugo",
  "Israel",
  "Jaime",
  "Kelvin",
  "L\xE1zaro",
  "Marcelo",
  "Norberto",
  "Octavio",
  "Pascual",
  "Quintiliano",
  "Renato",
  "Sim\xF3n",
  "Teodoro",
  "Uriel",
  "Valerio",
  "Wilfredo",
  "Ximeno",
  "Yeray",
  "Zacarias"
];
var MEXICAN_MALE_LASTNAMES = [
  "Hern\xE1ndez",
  "Garc\xEDa",
  "Mart\xEDnez",
  "Gonz\xE1lez",
  "L\xF3pez",
  "Rodr\xEDguez",
  "P\xE9rez",
  "S\xE1nchez",
  "Ram\xEDrez",
  "Flores",
  "Cruz",
  "G\xF3mez",
  "D\xEDaz",
  "Morales",
  "Ortiz",
  "Torres",
  "Reyes",
  "Jim\xE9nez",
  "Ruiz",
  "V\xE1zquez",
  "Castillo",
  "Mendoza",
  "Guerrero",
  "\xC1lvarez",
  "Romero",
  "Herrera",
  "Medina",
  "Aguilar",
  "Castro",
  "Vargas",
  "Rivera",
  "Silva",
  "Ramos",
  "Navarro",
  "Molina",
  "Delgado",
  "Campos",
  "Rojas",
  "Vel\xE1zquez",
  "Soto",
  "Cabrera",
  "Pe\xF1a",
  "Sol\xEDs",
  "Santos",
  "Mora",
  "Contreras",
  "Estrada",
  "N\xFA\xF1ez",
  "Figueroa",
  "M\xE9ndez",
  "Ch\xE1vez",
  "Vega",
  "Guadarrama",
  "Ibarra",
  "Ju\xE1rez",
  "Salazar",
  "Trevi\xF1o",
  "Zamora",
  "Cort\xE9s",
  "Lara",
  "Pacheco",
  "Dom\xEDnguez",
  "Carrillo",
  "\xC1vila",
  "Fuentes",
  "Espinoza",
  "R\xEDos",
  "Valdez",
  "Aguirre",
  "Salinas",
  "Acosta",
  "Gallegos",
  "Barrera",
  "Padilla",
  "Rosales",
  "Escobar",
  "Miranda",
  "Serrano",
  "Villarreal",
  "Rangel",
  "Guti\xE9rrez",
  "Alvarado",
  "Olivares",
  "Sandoval",
  "Pineda",
  "Mej\xEDa",
  "Arellano",
  "Cervantes",
  "Le\xF3n",
  "Galv\xE1n",
  "Tapia",
  "Sosa",
  "Blanco",
  "Valencia",
  "Z\xFA\xF1iga",
  "Cano",
  "Rico",
  "Quiroz",
  "Palacios",
  "Arroyo",
  "Calder\xF3n",
  "Bautista",
  "Ochoa",
  "Luna",
  "Montoya",
  "Orozco",
  "Santana",
  "Valladares",
  "Su\xE1rez",
  "Armenta",
  "Berm\xFAdez",
  "C\xE1rdenas",
  "Corona",
  "Duarte",
  "Escalante",
  "Fajardo",
  "Guzm\xE1n",
  "Huerta",
  "Islas",
  "Lozano",
  "Mar\xEDn",
  "Nava",
  "Ponce",
  "Quintana",
  "Robles",
  "Salgado",
  "Toledo",
  "Uribe",
  "Vera",
  "Zavala",
  "Aranda",
  "Beltr\xE1n",
  "Cordero",
  "D\xE1vila",
  "Espinosa",
  "Fierro",
  "G\xE1lvez",
  "Hidalgo",
  "I\xF1iguez",
  "Jaramillo",
  "Landeros",
  "Mac\xEDas",
  "Nieto",
  "Olvera",
  "Peralta",
  "Quezada",
  "Rivas",
  "Saucedo",
  "T\xE9llez",
  "Urrutia",
  "Villanueva",
  "Xochitl",
  "Y\xE1\xF1ez",
  "Zepeda"
];

// resources/static_db/names/oceanian_data.ts
var OCEANIAN_MALE_FIRSTNAMES = [
  "Oliver",
  "Noah",
  "Jack",
  "William",
  "Leo",
  "Lucas",
  "Henry",
  "Charlie",
  "Thomas",
  "James",
  "Liam",
  "Alexander",
  "Harrison",
  "Ethan",
  "Mason",
  "Lachlan",
  "Hunter",
  "Arlo",
  "Hugo",
  "Cooper",
  "Oscar",
  "Elijah",
  "Hudson",
  "Archie",
  "Levi",
  "Luca",
  "Theodore",
  "Benjamin",
  "Samuel",
  "Daniel",
  "Matthew",
  "Michael",
  "David",
  "Joseph",
  "John",
  "Robert",
  "George",
  "Arthur",
  "Ryan",
  "Jacob",
  "Joshua",
  "Luke",
  "Isaac",
  "Sebastian",
  "Xavier",
  "Kai",
  "Malakai",
  "Koa",
  "Manaia",
  "Ariki",
  "Te Ariki",
  "Sione",
  "Tevita",
  "Viliami",
  "Paula",
  "Etuate",
  "Keanu",
  "Tai",
  "Kainoa",
  "Lani",
  "Moana",
  "Tane",
  "Wiremu",
  "Anaru",
  "Nikau",
  "Aroha",
  "Mana",
  "Rangi",
  "Tama",
  "Atamai",
  "Kelekolio",
  "Malachi",
  "Jone",
  "Mohammed",
  "John",
  "Peter",
  "Thomas",
  "James",
  "Michael",
  "David",
  "Joseph",
  "Matthew",
  "Andrew",
  "Mark",
  "Luke",
  "Paul",
  "Steven",
  "Daniel",
  "Christopher",
  "Joshua",
  "Ryan",
  "Ethan",
  "Jacob",
  "Samuel",
  "Benjamin",
  "William",
  "Henry",
  "Jack",
  "Oliver",
  "Noah",
  "Leo",
  "Lucas",
  "Charlie",
  "Thomas",
  "James",
  "Liam",
  "Alexander",
  "Harrison",
  "Mason",
  "Lachlan",
  "Hunter",
  "Arlo",
  "Hugo",
  "Cooper",
  "Oscar",
  "Elijah",
  "Hudson",
  "Archie",
  "Levi",
  "Luca",
  "Theodore",
  "Benjamin",
  "Samuel",
  "Daniel",
  "Matthew",
  "Michael",
  "David",
  "Joseph",
  "John",
  "Robert",
  "George",
  "Arthur",
  "Ryan",
  "Jacob",
  "Joshua",
  "Luke",
  "Isaac",
  "Sebastian",
  "Xavier",
  "Kai",
  "Malakai",
  "Koa",
  "Manaia",
  "Ariki",
  "Te Ariki",
  "Sione",
  "Tevita",
  "Viliami",
  "Paula",
  "Etuate",
  "Keanu",
  "Tai",
  "Kainoa",
  "Lani",
  "Tane",
  "Wiremu",
  "Anaru",
  "Nikau",
  "Rangi",
  "Tama",
  "Atamai",
  "Kelekolio",
  "Jone",
  "Peter",
  "Thomas",
  "James",
  "Michael",
  "David",
  "Joseph",
  "Matthew",
  "Andrew",
  "Mark",
  "Luke",
  "Paul",
  "Steven",
  "Daniel",
  "Christopher",
  "Joshua",
  "Ryan",
  "Ethan",
  "Jacob",
  "Samuel",
  "Benjamin",
  "William",
  "Henry",
  "Jack",
  "Oliver",
  "Noah",
  "Leo",
  "Lucas",
  "Charlie",
  "Thomas",
  "James",
  "Liam",
  "Alexander",
  "Harrison",
  "Mason",
  "Lachlan",
  "Hunter",
  "Arlo",
  "Hugo",
  "Cooper",
  "Oscar",
  "Elijah",
  "Hudson",
  "Archie",
  "Levi",
  "Luca",
  "Theodore",
  "Benjamin",
  "Samuel",
  "Daniel",
  "Matthew",
  "Michael",
  "David",
  "Joseph",
  "John",
  "Robert",
  "George",
  "Arthur",
  "Ryan",
  "Jacob",
  "Joshua",
  "Luke",
  "Isaac",
  "Sebastian",
  "Xavier",
  "Kai",
  "Malakai",
  "Koa",
  "Manaia",
  "Ariki",
  "Te Ariki",
  "Sione",
  "Tevita",
  "Viliami",
  "Paula",
  "Etuate",
  "Keanu",
  "Tai",
  "Kainoa",
  "Tane",
  "Wiremu",
  "Anaru",
  "Nikau",
  "Rangi",
  "Tama",
  "Atamai",
  "Kelekolio",
  "Mana",
  "Moana",
  "Aroha",
  "Ranginui",
  "Kiwa",
  "Kawe",
  "Te Koha",
  "Taniora",
  "Manuka",
  "Ahi",
  "Ari",
  "Matiu",
  "Wiremu",
  "Hemi",
  "Tama",
  "Kahu",
  "Rua",
  "Tahu",
  "Teina",
  "Whaka",
  "Mikaere",
  "Rawiri",
  "Hirini",
  "Hohepa",
  "Rewi",
  "Tawhiri",
  "Kereama",
  "Maui",
  "Kupe",
  "Tonga",
  "Samoa",
  "Fiji",
  "Vanuatu",
  "Solomon",
  "Brandon",
  "Caleb",
  "Eddie",
  "Rex",
  "Clinton",
  "Ryan",
  "Daniel",
  "Michael",
  "David",
  "John",
  "Shaun",
  "Bobby",
  "Fabian",
  "Arnold",
  "Nelson",
  "Jesse",
  "Danny",
  "Spencer",
  "Damien",
  "Jackson",
  "Mike",
  "Patrick",
  "Samson",
  "Elvis",
  "Perry",
  "Nigel",
  "Marc",
  "Ben",
  "Greydon",
  "Nollen",
  "Iven",
  "Oko",
  "Silkarni",
  "Paka"
];
var OCEANIAN_MALE_LASTNAMES = [
  "Smith",
  "Jones",
  "Williams",
  "Brown",
  "Wilson",
  "Taylor",
  "Johnson",
  "White",
  "Martin",
  "Anderson",
  "Thompson",
  "Jackson",
  "Harris",
  "Thomas",
  "Clark",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Green",
  "Baker",
  "Adams",
  "Nelson",
  "Hill",
  "Campbell",
  "Mitchell",
  "Roberts",
  "Carter",
  "Phillips",
  "Evans",
  "Turner",
  "Collins",
  "Edwards",
  "Stewart",
  "Morris",
  "Murphy",
  "Cook",
  "Rogers",
  "Morgan",
  "Peterson",
  "Cooper",
  "Reed",
  "Bailey",
  "Bell",
  "Kelly",
  "Howard",
  "Ward",
  "Cox",
  "Richardson",
  "Watson",
  "Brooks",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Hughes",
  "Price",
  "Foster",
  "Sanders",
  "Ross",
  "Powell",
  "Long",
  "Perry",
  "Russell",
  "Henderson",
  "Coleman",
  "Jenkins",
  "Perry",
  "Powell",
  "Long",
  "Patterson",
  "Hughes",
  "Flores",
  "Washington",
  "Butler",
  "Simmons",
  "Foster",
  "Gonzalez",
  "Bryant",
  "Alexander",
  "Russell",
  "Griffin",
  "Diaz",
  "Hayes",
  "Myers",
  "Ford",
  "Hamilton",
  "Graham",
  "Sullivan",
  "Wallace",
  "Woods",
  "Cole",
  "West",
  "Jordan",
  "Owens",
  "Reynolds",
  "Fisher",
  "Ellis",
  "Harrison",
  "Gibson",
  "Mcdonald",
  "Cruz",
  "Marshall",
  "Ortiz",
  "Gomez",
  "Murray",
  "Freeman",
  "Wells",
  "Webb",
  "Simpson",
  "Stevens",
  "Tucker",
  "Porter",
  "Hunter",
  "Hicks",
  "Crawford",
  "Henry",
  "Boyd",
  "Mason",
  "Morales",
  "Kennedy",
  "Warren",
  "Dixon",
  "Ramos",
  "Reyes",
  "Burns",
  "Gordon",
  "Shaw",
  "Holmes",
  "Rice",
  "Robertson",
  "Hunt",
  "Black",
  "Daniels",
  "Palmer",
  "Mills",
  "Nichols",
  "Grant",
  "Knight",
  "Ferguson",
  "Rose",
  "Stone",
  "Hawkins",
  "Dunn",
  "Perkins",
  "Hudson",
  "Spencer",
  "Gardner",
  "Stephens",
  "Payne",
  "Pierce",
  "Berry",
  "Matthews",
  "Arnold",
  "Wagner",
  "Willis",
  "Ray",
  "Watkins",
  "Olson",
  "Carroll",
  "Duncan",
  "Snyder",
  "Hart",
  "Cunningham",
  "Bradley",
  "Lane",
  "Andrews",
  "Ruiz",
  "Harper",
  "Fox",
  "Riley",
  "Armstrong",
  "Carpenter",
  "Weaver",
  "Greene",
  "Lawrence",
  "Elliott",
  "Chavez",
  "Sims",
  "Austin",
  "Peters",
  "Kelley",
  "Franklin",
  "Lawson",
  "Fields",
  "Gutierrez",
  "Ryan",
  "Schmidt",
  "Carr",
  "Vasquez",
  "Castillo",
  "Wheeler",
  "Chapman",
  "Oliver",
  "Montgomery",
  "Richards",
  "Williamson",
  "Johnston",
  "Banks",
  "Meyer",
  "Bishop",
  "Mccoy",
  "Howell",
  "Alvarez",
  "Morrison",
  "Hansen",
  "Fernandez",
  "Garza",
  "Harvey",
  "Little",
  "Burton",
  "Stanley",
  "Nguyen",
  "George",
  "Jacobs",
  "Reid",
  "Kim",
  "Fuller",
  "Lynch",
  "Dean",
  "Gilbert",
  "Garrett",
  "Romero",
  "Welch",
  "Larson",
  "Frazier",
  "Burke",
  "Hanson",
  "Day",
  "Mendoza",
  "Moreno",
  "Bowman",
  "Medina",
  "Fowler",
  "Brewer",
  "Hoffman",
  "Carlson",
  "Silva",
  "Pearson",
  "Holland",
  "Douglas",
  "Fleming",
  "Jensen",
  "Vargas",
  "Byrd",
  "Davidson",
  "Hopkins",
  "May",
  "Terrell",
  "Terry",
  "Herrera",
  "Wade",
  "Soto",
  "Walters",
  "Curtis",
  "Neal",
  "Caldwell",
  "Lowe",
  "Jennings",
  "Barnett",
  "Graves",
  "Jimenez",
  "Horton",
  "Shelton",
  "Barrett",
  "Obrien",
  "Castro",
  "Sutton",
  "Gregory",
  "Mckinney",
  "Lucas",
  "Miles",
  "Craig",
  "Rodriquez",
  "Chambers",
  "Holt",
  "Lambert",
  "Fletcher",
  "Watts",
  "Bates",
  "Hale",
  "Rhodes",
  "Pena",
  "Beck",
  "Newman",
  "Haynes",
  "McDaniel",
  "Mendez",
  "Bush",
  "Vaughn",
  "Parks",
  "Dawson",
  "Santiago",
  "Norris",
  "Hardy",
  "Love",
  "Steele",
  "Curry",
  "Powers",
  "Schultz",
  "Barker",
  "Guzman",
  "Page",
  "Munoz",
  "Ball",
  "Keller",
  "Chandler",
  "Weber",
  "Leonard",
  "Walsh",
  "Lyons",
  "Ramsey",
  "Wolfe",
  "Schneider",
  "Mullins",
  "Benson",
  "Sharp",
  "Bowen",
  "Daniel",
  "Barber",
  "Cummings",
  "Hines",
  "Baldwin",
  "Griffith",
  "Valdez",
  "Hubbard",
  "Salazar",
  "Reeves",
  "Warner",
  "Stevenson",
  "Burgess",
  "Santos",
  "Tate",
  "Cross",
  "Garner",
  "Mann",
  "Mack",
  "Moss",
  "Thornton",
  "Dennis",
  "Mcgee",
  "Farmer",
  "Delacruz",
  "Little",
  "Walton",
  "Bates",
  "John",
  "Peter",
  "Thomas",
  "James",
  "Paul",
  "Mark",
  "Luke",
  "Matthew",
  "Andrew",
  "Joseph",
  "David",
  "Michael",
  "Steven",
  "Christopher",
  "Daniel",
  "Joshua",
  "Ryan",
  "Jacob",
  "Nicholas",
  "Tyler",
  "Brandon",
  "Austin",
  "Benjamin",
  "Samuel",
  "Nathan",
  "Logan",
  "Christian",
  "Jonathan",
  "Caleb",
  "Dylan",
  "Isaac",
  "Gavin",
  "Jackson",
  "Eli",
  "Jordan",
  "Hunter",
  "Luke",
  "Angel",
  "Kevin",
  "Jack",
  "Cody",
  "Asher",
  "Cameron",
  "Chase",
  "Cooper",
  "Xavier",
  "Parker",
  "Jace",
  "Miles",
  "Blake",
  "Aiden",
  "Leo",
  "Theo",
  "Kai",
  "Malakai",
  "Koa",
  "Manaia",
  "Ariki",
  "Te Ariki",
  "Sione",
  "Tevita",
  "Viliami",
  "Paula",
  "Etuate",
  "Keanu",
  "Tai",
  "Kainoa",
  "Tane",
  "Wiremu",
  "Anaru",
  "Nikau",
  "Rangi",
  "Tama",
  "Atamai",
  "Kelekolio",
  "Aiono",
  "Faamausili",
  "Fatialofa",
  "Fepuleai",
  "Fuamatu",
  "Laulala",
  "Lealamanua",
  "Nuuausala",
  "Palamo",
  "Palepoi",
  "Salavea",
  "Savea",
  "Vaai",
  "Tuilaepa",
  "Ah Mu",
  "Alofaituli",
  "Faleafa",
  "Gatoloai",
  "Singh",
  "Kaur",
  "Patel",
  "Kumar",
  "Sharma",
  "Wong",
  "Lee",
  "Chen",
  "Zhang",
  "Liu",
  "Li",
  "Wang",
  "Yang",
  "Maori",
  "Tawhiri",
  "Te Hira",
  "Mabo",
  "Fatnowna",
  "Lui",
  "Mose",
  "Solomon",
  "Tonga",
  "Saukuru",
  "Quakawoot",
  "Mussing",
  "Minniecon",
  "Budby"
];

// resources/static_db/names/northamerican_data.ts
var NORTH_AMERICAN_MALE_FIRSTNAMES = [
  "James",
  "John",
  "Robert",
  "Michael",
  "William",
  "David",
  "Richard",
  "Joseph",
  "Thomas",
  "Charles",
  "Christopher",
  "Daniel",
  "Matthew",
  "Anthony",
  "Mark",
  "Paul",
  "Steven",
  "Andrew",
  "Kenneth",
  "Joshua",
  "Kevin",
  "Brian",
  "George",
  "Edward",
  "Ronald",
  "Timothy",
  "Jason",
  "Jeffrey",
  "Ryan",
  "Jacob",
  "Gary",
  "Nicholas",
  "Eric",
  "Jonathan",
  "Stephen",
  "Larry",
  "Justin",
  "Scott",
  "Brandon",
  "Benjamin",
  "Samuel",
  "Gregory",
  "Alexander",
  "Frank",
  "Patrick",
  "Raymond",
  "Jack",
  "Dennis",
  "Jerry",
  "Tyler",
  "Aaron",
  "Jose",
  "Adam",
  "Nathan",
  "Henry",
  "Zachary",
  "Douglas",
  "Peter",
  "Kyle",
  "Noah",
  "Ethan",
  "Jeremy",
  "Christian",
  "Walter",
  "Keith",
  "Roger",
  "Terry",
  "Austin",
  "Sean",
  "Gerald",
  "Carl",
  "Dylan",
  "Harold",
  "Jordan",
  "Jesse",
  "Bryan",
  "Lawrence",
  "Arthur",
  "Gabriel",
  "Bruce",
  "Logan",
  "Caleb",
  "Mason",
  "Elijah",
  "Oliver",
  "Lucas",
  "Liam",
  "Alexander",
  "Jackson",
  "Aiden",
  "Logan",
  "Jacob",
  "Michael",
  "Matthew",
  "Ethan",
  "Andrew",
  "Daniel",
  "William",
  "Joseph",
  "David",
  "Noah",
  "Anthony",
  "Ryan",
  "Christopher",
  "Tyler",
  "Joshua",
  "Benjamin",
  "Samuel",
  "Henry",
  "Jack",
  "Owen",
  "Luke",
  "Gabriel",
  "Isaac",
  "Levi",
  "Nathan",
  "Eli",
  "Caleb",
  "Isaiah",
  "Christian",
  "Jonathan",
  "Aaron",
  "Thomas",
  "Hunter",
  "Cameron",
  "Connor",
  "Wyatt",
  "Carter",
  "Jayden",
  "Brayden",
  "Grayson",
  "Leo",
  "Jaxon",
  "Lincoln",
  "Asher",
  "Ezra",
  "Hudson",
  "Miles",
  "Theo",
  "Miles",
  "Theo",
  "Kai",
  "Roman",
  "Axel",
  "Sawyer",
  "Ryder",
  "Micah",
  "Colton",
  "Cooper",
  "Easton",
  "Carson",
  "Chase",
  "Beau",
  "Maverick",
  "Kingston",
  "Weston",
  "Everett",
  "Bennett",
  "Emmett",
  "Parker",
  "Kaiden",
  "Rowan",
  "Declan",
  "Waylon",
  "Eli",
  "Colt",
  "River",
  "Finn",
  "Tucker",
  "Zane",
  "Dawson",
  "Karter",
  "Nash",
  "Beckett",
  "Knox",
  "Hayden",
  "Jace",
  "Emerson",
  "Atlas",
  "Emery",
  "Amari",
  "Zion",
  "Malachi",
  "Ali",
  "Jamal",
  "Malik",
  "Darius",
  "Jaylen",
  "Isaiah",
  "Xavier",
  "Jalen",
  "Khalil",
  "Tristan",
  "Devin",
  "Bryson",
  "Trevor",
  "Derek",
  "Blake",
  "Corey",
  "Shane",
  "Cody",
  "Dakota",
  "Tanner",
  "Collin",
  "Brady",
  "Jake",
  "Seth",
  "Gavin",
  "Caden",
  "Riley",
  "Cole",
  "Brody",
  "Max",
  "Luke",
  "Owen",
  "Aidan",
  "Evan",
  "Nathaniel",
  "Dominic",
  "Hayes",
  "Holden",
  "Ryker",
  "Grady",
  "Phoenix",
  "Cash",
  "Reid",
  "Zander",
  "Chance",
  "Tyson",
  "Bodhi",
  "Gunner",
  "Cohen",
  "Crew",
  "Apollo",
  "Romeo",
  "Zayn",
  "Jett",
  "Judah",
  "Soren",
  "Orion",
  "Aziel",
  "Koa",
  "Kyson",
  "Ronan",
  "Wilder",
  "Archer",
  "Remington",
  "Prince",
  "Santana",
  "Legend",
  "Dante",
  "Kane",
  "Brock",
  "Drake",
  "Zackary",
  "Quentin",
  "Reed",
  "Porter",
  "Sullivan",
  "Trent",
  "Keegan",
  "Finley",
  "Benson",
  "Callan",
  "Daxton",
  "Enzo",
  "Jonas",
  "Kieran",
  "Lucian",
  "Nolan"
];
var NORTH_AMERICAN_MALE_LASTNAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
  "Cruz",
  "Edwards",
  "Collins",
  "Reyes",
  "Stewart",
  "Morris",
  "Morales",
  "Murphy",
  "Cook",
  "Rogers",
  "Gutierrez",
  "Ortiz",
  "Morgan",
  "Cooper",
  "Peterson",
  "Bailey",
  "Reed",
  "Kelly",
  "Howard",
  "Ramos",
  "Kim",
  "Cox",
  "Ward",
  "Richardson",
  "Watson",
  "Brooks",
  "Chavez",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Mendoza",
  "Ruiz",
  "Hughes",
  "Price",
  "Alvarez",
  "Castillo",
  "Sanders",
  "Patel",
  "Myers",
  "Long",
  "Ross",
  "Foster",
  "Jimenez",
  "Powell",
  "Jenkins",
  "Perry",
  "Russell",
  "Sullivan",
  "Bell",
  "Coleman",
  "Butler",
  "Henderson",
  "Barnes",
  "Gonzales",
  "Fisher",
  "Vasquez",
  "Simmons",
  "Romero",
  "Jordan",
  "Patterson",
  "Alexander",
  "Hamilton",
  "Graham",
  "Reynolds",
  "Griffin",
  "Wallace",
  "Moreno",
  "West",
  "Cole",
  "Hayes",
  "Bryant",
  "Herrera",
  "Gibson",
  "Ellis",
  "Tran",
  "Medina",
  "Aguilar",
  "Stevens",
  "Murray",
  "Ford",
  "Castro",
  "Marshall",
  "Owens",
  "Mcdonald",
  "Harrison",
  "Ruiz",
  "Kennedy",
  "Wells",
  "Alvarez",
  "Woods",
  "Washington",
  "Barnes",
  "Freeman",
  "Webb",
  "Simpson",
  "Stevens",
  "Tucker",
  "Porter",
  "Hunter",
  "Hicks",
  "Crawford",
  "Henry",
  "Boyd",
  "Mason",
  "Morales",
  "Kennedy",
  "Warren",
  "Dixon",
  "Ramos",
  "Reyes",
  "Burns",
  "Gordon",
  "Shaw",
  "Holmes",
  "Rice",
  "Robertson",
  "Hunt",
  "Black",
  "Daniels",
  "Palmer",
  "Mills",
  "Nichols",
  "Grant",
  "Knight",
  "Ferguson",
  "Rose",
  "Stone",
  "Hawkins",
  "Dunn",
  "Perkins",
  "Hudson",
  "Spencer",
  "Gardner",
  "Stephens",
  "Payne",
  "Pierce",
  "Berry",
  "Matthews",
  "Arnold",
  "Wagner",
  "Willis",
  "Ray",
  "Watkins",
  "Olson",
  "Carroll",
  "Duncan",
  "Snyder",
  "Hart",
  "Cunningham",
  "Bradley",
  "Lane",
  "Andrews",
  "Ruiz",
  "Harper",
  "Fox",
  "Riley",
  "Armstrong",
  "Carpenter",
  "Weaver",
  "Greene",
  "Lawrence",
  "Elliott",
  "Chavez",
  "Sims",
  "Austin",
  "Peters",
  "Kelley",
  "Franklin",
  "Lawson",
  "Fields",
  "Gutierrez",
  "Ryan",
  "Schmidt",
  "Carr",
  "Vasquez",
  "Castillo",
  "Wheeler",
  "Chapman",
  "Oliver",
  "Montgomery",
  "Richards",
  "Williamson",
  "Johnston",
  "Banks",
  "Meyer",
  "Bishop",
  "Mccoy",
  "Howell",
  "Alvarez",
  "Morrison",
  "Hansen",
  "Fernandez",
  "Garza",
  "Harvey",
  "Little",
  "Burton",
  "Stanley",
  "Nguyen",
  "George",
  "Jacobs",
  "Reid",
  "Kim",
  "Fuller",
  "Lynch",
  "Dean",
  "Gilbert",
  "Garrett",
  "Romero",
  "Welch",
  "Larson",
  "Frazier",
  "Burke",
  "Hanson",
  "Day",
  "Mendoza",
  "Moreno",
  "Bowman",
  "Medina",
  "Fowler",
  "Brewer",
  "Hoffman",
  "Carlson",
  "Silva",
  "Pearson",
  "Holland",
  "Douglas",
  "Fleming",
  "Jensen",
  "Vargas",
  "Byrd",
  "Davidson",
  "Hopkins",
  "May",
  "Terrell",
  "Terry",
  "Herrera",
  "Wade",
  "Soto",
  "Walters",
  "Curtis",
  "Neal",
  "Caldwell",
  "Lowe",
  "Jennings",
  "Barnett",
  "Graves",
  "Jimenez",
  "Horton",
  "Shelton",
  "Barrett",
  "Obrien",
  "Castro",
  "Sutton",
  "Gregory",
  "Mckinney",
  "Lucas",
  "Miles",
  "Craig",
  "Rodriquez",
  "Chambers",
  "Holt",
  "Lambert",
  "Fletcher",
  "Watts",
  "Bates",
  "Hale",
  "Rhodes",
  "Pena",
  "Beck",
  "Newman",
  "Haynes",
  "McDaniel",
  "Mendez",
  "Bush",
  "Vaughn",
  "Parks",
  "Dawson",
  "Santiago",
  "Norris",
  "Hardy",
  "Love",
  "Steele",
  "Curry",
  "Powers",
  "Schultz",
  "Barker",
  "Guzman",
  "Page",
  "Munoz",
  "Ball",
  "Keller",
  "Chandler",
  "Weber",
  "Leonard",
  "Walsh",
  "Lyons",
  "Ramsey",
  "Wolfe",
  "Schneider",
  "Mullins",
  "Benson",
  "Sharp",
  "Bowen",
  "Daniel",
  "Barber",
  "Cummings",
  "Hines",
  "Baldwin",
  "Griffith",
  "Valdez",
  "Hubbard",
  "Salazar",
  "Reeves",
  "Warner",
  "Stevenson",
  "Burgess",
  "Santos",
  "Tate",
  "Cross",
  "Garner",
  "Mann",
  "Mack",
  "Moss",
  "Thornton",
  "Dennis",
  "Mcgee",
  "Farmer",
  "Delacruz",
  "Walton",
  "Bates",
  "John",
  "Peter",
  "Thomas",
  "James",
  "Paul",
  "Mark",
  "Luke",
  "Matthew",
  "Andrew",
  "Joseph",
  "David",
  "Michael",
  "Steven",
  "Christopher",
  "Daniel",
  "Joshua",
  "Ryan",
  "Jacob",
  "Nicholas",
  "Tyler",
  "Brandon",
  "Austin",
  "Benjamin",
  "Samuel",
  "Nathan",
  "Logan",
  "Christian",
  "Jonathan",
  "Caleb",
  "Dylan",
  "Isaac",
  "Gavin",
  "Jackson",
  "Eli",
  "Jordan",
  "Hunter",
  "Luke",
  "Angel",
  "Kevin",
  "Jack",
  "Cody",
  "Asher",
  "Cameron",
  "Chase",
  "Cooper",
  "Xavier",
  "Parker",
  "Jace",
  "Miles",
  "Blake",
  "Aiden",
  "Leo",
  "Theo"
];

// services/NameGeneratorService.ts
var getRandomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};
var NameGeneratorService = {
  getRandomName(region) {
    switch (region) {
      case "POLAND" /* POLAND */:
        return {
          firstName: getRandomElement(PL_MALE_FIRSTNAMES),
          lastName: getRandomElement(PL_MALE_LASTNAMES)
        };
      case "BALKANS" /* BALKANS */:
        return {
          firstName: getRandomElement(BALKAN_MALE_FIRSTNAMES),
          lastName: getRandomElement(BALKAN_MALE_LASTNAMES)
        };
      case "CZ_SK" /* CZ_SK */:
        return {
          firstName: getRandomElement(CZSK_MALE_FIRSTNAMES),
          lastName: getRandomElement(CZSK_MALE_LASTNAMES)
        };
      case "SSA" /* SSA */:
        return {
          firstName: getRandomElement(SSA_MALE_FIRSTNAMES),
          lastName: getRandomElement(SSA_MALE_LASTNAMES)
        };
      case "IBERIA" /* IBERIA */:
        return {
          firstName: getRandomElement(IBERIA_MALE_FIRSTNAMES),
          lastName: getRandomElement(IBERIA_MALE_LASTNAMES)
        };
      case "NORTH_AMERICA" /* NORTH_AMERICA */:
        return {
          firstName: getRandomElement(NORTH_AMERICAN_MALE_FIRSTNAMES),
          lastName: getRandomElement(NORTH_AMERICAN_MALE_LASTNAMES)
        };
      case "MEXICO" /* MEXICO */:
        return {
          firstName: getRandomElement(MEXICAN_MALE_FIRSTNAMES),
          lastName: getRandomElement(MEXICAN_MALE_LASTNAMES)
        };
      case "OCEANIA" /* OCEANIA */:
        return {
          firstName: getRandomElement(OCEANIAN_MALE_FIRSTNAMES),
          lastName: getRandomElement(OCEANIAN_MALE_LASTNAMES)
        };
      case "SWEDEN" /* SWEDEN */:
        return {
          firstName: getRandomElement(SWEDISH_MALE_FIRSTNAMES),
          lastName: getRandomElement(SWEDISH_MALE_LASTNAMES)
        };
      case "SCANDINAVIA" /* SCANDINAVIA */:
        return {
          firstName: getRandomElement(SCANDINAVIA_MALE_FIRSTNAMES),
          lastName: getRandomElement(SCANDINAVIA_MALE_LASTNAMES)
        };
      case "EX_USSR" /* EX_USSR */:
        return {
          firstName: getRandomElement(EXUSSR_MALE_FIRSTNAMES),
          lastName: getRandomElement(EXUSSR_MALE_LASTNAMES)
        };
      case "SPAIN" /* SPAIN */:
        return { firstName: getRandomElement(ES_MALE_FIRSTNAMES), lastName: getRandomElement(ES_MALE_LASTNAMES) };
      case "ENGLAND" /* ENGLAND */:
        return { firstName: getRandomElement(EN_MALE_FIRSTNAMES), lastName: getRandomElement(EN_MALE_LASTNAMES) };
      case "GERMANY" /* GERMANY */:
        return { firstName: getRandomElement(DE_MALE_FIRSTNAMES), lastName: getRandomElement(DE_MALE_LASTNAMES) };
      case "ITALY" /* ITALY */:
        return { firstName: getRandomElement(IT_MALE_FIRSTNAMES), lastName: getRandomElement(IT_MALE_LASTNAMES) };
      case "FRANCE" /* FRANCE */:
        return { firstName: getRandomElement(FR_MALE_FIRSTNAMES), lastName: getRandomElement(FR_MALE_LASTNAMES) };
      case "JAPAN" /* JAPAN */:
        return { firstName: getRandomElement(JAPANESE_MALE_FIRSTNAMES), lastName: getRandomElement(JAPANESE_MALE_SURNAMES) };
      case "KOREA" /* KOREA */:
        return { firstName: getRandomElement(KOREAN_MALE_FIRSTNAMES), lastName: getRandomElement(KOREAN_MALE_SURNAMES) };
      case "ARGENTINA" /* ARGENTINA */:
        return { firstName: getRandomElement(ARGENTINIAN_MALE_FIRSTNAMES), lastName: getRandomElement(ARGENTINIAN_MALE_LASTNAMES) };
      case "BRAZIL" /* BRAZIL */:
        return { firstName: getRandomElement(BRAZILIAN_MALE_FIRSTNAMES), lastName: getRandomElement(BRAZILIAN_MALE_LASTNAMES) };
      case "TURKEY" /* TURKEY */:
        return { firstName: getRandomElement(TURKISH_MALE_FIRSTNAMES), lastName: getRandomElement(TURKISH_MALE_LASTNAMES) };
      case "ARABIA" /* ARABIA */:
        return { firstName: getRandomElement(ARABIC_MALE_FIRSTNAMES), lastName: getRandomElement(ARABIC_MALE_LASTNAMES) };
      case "FINLAND" /* FINLAND */:
        return { firstName: getRandomElement(FINNISH_MALE_FIRSTNAMES), lastName: getRandomElement(FINNISH_MALE_LASTNAMES) };
      case "GEORGIA" /* GEORGIA */:
        return { firstName: getRandomElement(GEORGIAN_MALE_FIRSTNAMES), lastName: getRandomElement(GEORGIAN_MALE_LASTNAMES) };
      case "ARMENIA" /* ARMENIA */:
        return { firstName: getRandomElement(ARMENIAN_MALE_FIRSTNAMES), lastName: getRandomElement(ARMENIAN_MALE_LASTNAMES) };
      case "ALBANIA" /* ALBANIA */:
        return { firstName: getRandomElement(ALBANIAN_MALE_FIRSTNAMES), lastName: getRandomElement(ALBANIAN_MALE_LASTNAMES) };
      case "ROMANIA" /* ROMANIA */:
        return { firstName: getRandomElement(ROMANIAN_MALE_FIRSTNAMES), lastName: getRandomElement(ROMANIAN_MALE_LASTNAMES) };
      case "BALTIC" /* BALTIC */:
        return { firstName: getRandomElement(BALTIC_MALE_FIRSTNAMES), lastName: getRandomElement(BALTIC_MALE_LASTNAMES) };
      case "BENELUX" /* BENELUX */:
        return { firstName: getRandomElement(BENELUX_MALE_FIRSTNAMES), lastName: getRandomElement(BENELUX_MALE_LASTNAMES) };
      case "HUNGARIAN" /* HUNGARIAN */:
        return { firstName: getRandomElement(HUNGARIAN_MALE_FIRSTNAMES), lastName: getRandomElement(HUNGARIAN_MALE_LASTNAMES) };
      case "MALTESE" /* MALTESE */:
        return { firstName: getRandomElement(MALTESE_MALE_FIRSTNAMES), lastName: getRandomElement(MALTESE_MALE_LASTNAMES) };
      case "ISRAELI" /* ISRAELI */:
        return { firstName: getRandomElement(ISRAELI_MALE_FIRSTNAMES), lastName: getRandomElement(ISRAELI_MALE_LASTNAMES) };
      case "GREEK" /* GREEK */:
        return { firstName: getRandomElement(GREEK_MALE_FIRSTNAMES), lastName: getRandomElement(GREEK_MALE_LASTNAMES) };
      case "AZERBAIJANI" /* AZERBAIJANI */:
        return { firstName: getRandomElement(AZERBAIJANI_MALE_FIRSTNAMES), lastName: getRandomElement(AZERBAIJANI_MALE_LASTNAMES) };
      case "KAZAKH" /* KAZAKH */:
        return { firstName: getRandomElement(KAZAKH_MALE_FIRSTNAMES), lastName: getRandomElement(KAZAKH_MALE_LASTNAMES) };
      case "SOUTH_AMERICAN" /* SOUTH_AMERICAN */:
        return { firstName: getRandomElement(SOUTH_AMERICAN_MALE_FIRSTNAMES), lastName: getRandomElement(SOUTH_AMERICAN_MALE_LASTNAMES) };
      default:
        return {
          firstName: getRandomElement(PL_MALE_FIRSTNAMES),
          lastName: getRandomElement(PL_MALE_LASTNAMES)
        };
    }
  },
  getRandomForeignRegion() {
    const foreignRegions = [
      "BALKANS" /* BALKANS */,
      "CZ_SK" /* CZ_SK */,
      "SSA" /* SSA */,
      "IBERIA" /* IBERIA */,
      "SCANDINAVIA" /* SCANDINAVIA */,
      "EX_USSR" /* EX_USSR */,
      "SPAIN" /* SPAIN */,
      "ENGLAND" /* ENGLAND */,
      "GERMANY" /* GERMANY */,
      "ITALY" /* ITALY */,
      "FRANCE" /* FRANCE */,
      "JAPAN" /* JAPAN */,
      "KOREA" /* KOREA */,
      "ARGENTINA" /* ARGENTINA */,
      "BRAZIL" /* BRAZIL */,
      "TURKEY" /* TURKEY */,
      "ARABIA" /* ARABIA */,
      "FINLAND" /* FINLAND */,
      "GEORGIA" /* GEORGIA */,
      "ARMENIA" /* ARMENIA */,
      "ALBANIA" /* ALBANIA */,
      "ROMANIA" /* ROMANIA */,
      "BALTIC" /* BALTIC */,
      "BENELUX" /* BENELUX */,
      "HUNGARIAN" /* HUNGARIAN */,
      "MALTESE" /* MALTESE */,
      "ISRAELI" /* ISRAELI */,
      "GREEK" /* GREEK */,
      "AZERBAIJANI" /* AZERBAIJANI */,
      "KAZAKH" /* KAZAKH */
    ];
    return foreignRegions[Math.floor(Math.random() * foreignRegions.length)];
  }
};

// resources/static_db/NationalTeams/NationalTeamsEurope.tsx
var NATIONAL_TEAMS_EUROPE = [
  { name: "Albania", continent: "Europe", tier: 4, colors: ["#E41E20", "#000000", "#E41E20"], stadium: "Air Albania Stadium", capacity: 22500, reputation: 9, region: "ALBANIA" /* ALBANIA */ },
  { name: "Andora", continent: "Europe", tier: 5, colors: ["#0032A0", "#FEDD00", "#D52B1E"], stadium: "Estadi Nacional", capacity: 3306, reputation: 2, region: "IBERIA" /* IBERIA */ },
  { name: "Armenia", continent: "Europe", tier: 4, colors: ["#D90012", "#0033A0", "#F2A800"], stadium: "Republican Stadium", capacity: 14200, reputation: 7, region: "ARMENIA" /* ARMENIA */ },
  { name: "Austria", continent: "Europe", tier: 2, colors: ["#ED2939", "#FFFFFF", "#ED2939"], stadium: "Ernst-Happel-Stadion", capacity: 50708, reputation: 14, region: "GERMANY" /* GERMANY */ },
  { name: "Azerbejd\u017Can", continent: "Europe", tier: 4, colors: ["#00B9E4", "#ED2939", "#3F9C35"], stadium: "Baku Olympic Stadium", capacity: 69870, reputation: 6, region: "AZERBAIJANI" /* AZERBAIJANI */ },
  { name: "Belgia", continent: "Europe", tier: 1, colors: ["#000000", "#FFD100", "#EF3340"], stadium: "King Baudouin Stadium", capacity: 50093, reputation: 17, region: "BENELUX" /* BENELUX */ },
  { name: "Bia\u0142oru\u015B", continent: "Europe", tier: 4, colors: ["#D22730", "#00AF66", "#FFFFFF"], stadium: "Dinamo Stadium", capacity: 22346, reputation: 6, region: "EX_USSR" /* EX_USSR */ },
  { name: "Bo\u015Bnia i Hercegowina", continent: "Europe", tier: 3, colors: ["#002395", "#FECB00", "#002395"], stadium: "Bilino Polje", capacity: 15292, reputation: 9, region: "BALKANS" /* BALKANS */ },
  { name: "Bu\u0142garia", continent: "Europe", tier: 4, colors: ["#FFFFFF", "#00966E", "#D62612"], stadium: "Vasil Levski", capacity: 43230, reputation: 8, region: "BALKANS" /* BALKANS */ },
  { name: "Chorwacja", continent: "Europe", tier: 2, colors: ["#FF0000", "#FFFFFF", "#0000FF"], stadium: "Maksimir", capacity: 35e3, reputation: 17, region: "BALKANS" /* BALKANS */ },
  { name: "Cypr", continent: "Europe", tier: 4, colors: ["#FFFFFF", "#D57800", "#FFFFFF"], stadium: "GSP Stadium", capacity: 22859, reputation: 6, region: "GREEK" /* GREEK */ },
  { name: "Czarnog\xF3ra", continent: "Europe", tier: 3, colors: ["#C40308", "#FFD700", "#C40308"], stadium: "Pod Goricom", capacity: 17e3, reputation: 7, region: "BALKANS" /* BALKANS */ },
  { name: "Czechy", continent: "Europe", tier: 2, colors: ["#11457E", "#FFFFFF", "#D7141A"], stadium: "Eden Arena", capacity: 20800, reputation: 13, region: "CZ_SK" /* CZ_SK */ },
  { name: "Dania", continent: "Europe", tier: 2, colors: ["#C60C30", "#FFFFFF", "#C60C30"], stadium: "Parken", capacity: 38065, reputation: 15, region: "SCANDINAVIA" /* SCANDINAVIA */ },
  { name: "Estonia", continent: "Europe", tier: 5, colors: ["#4891D9", "#000000", "#FFFFFF"], stadium: "A. Le Coq Arena", capacity: 14336, reputation: 5, region: "BALTIC" /* BALTIC */ },
  { name: "Finlandia", continent: "Europe", tier: 3, colors: ["#FFFFFF", "#003580", "#FFFFFF"], stadium: "Olympic Stadium Helsinki", capacity: 36300, reputation: 9, region: "FINLAND" /* FINLAND */ },
  { name: "Francja", continent: "Europe", tier: 1, colors: ["#0055A4", "#FFFFFF", "#EF4135"], stadium: "Stade de France", capacity: 8e4, reputation: 20, region: "FRANCE" /* FRANCE */ },
  { name: "Gibraltar", continent: "Europe", tier: 5, colors: ["#D40000", "#FFFFFF", "#D40000"], stadium: "Victoria Stadium", capacity: 5e3, reputation: 2, region: "IBERIA" /* IBERIA */ },
  { name: "Grecja", continent: "Europe", tier: 2, colors: ["#0D5EAF", "#FFFFFF", "#0D5EAF"], stadium: "Olympic Stadium Athens", capacity: 69618, reputation: 12, region: "GREEK" /* GREEK */ },
  { name: "Gruzja", continent: "Europe", tier: 4, colors: ["#FFFFFF", "#E41E20", "#FFFFFF"], stadium: "Boris Paichadze", capacity: 54949, reputation: 9, region: "GEORGIA" /* GEORGIA */ },
  { name: "Hiszpania", continent: "Europe", tier: 1, colors: ["#AA151B", "#F1BF00", "#AA151B"], stadium: "Santiago Bernab\xE9u", capacity: 81044, reputation: 20, region: "SPAIN" /* SPAIN */ },
  { name: "Holandia", continent: "Europe", tier: 1, colors: ["#FF4F00", "#FFFFFF", "#0000FF"], stadium: "Johan Cruijff Arena", capacity: 55500, reputation: 18, region: "BENELUX" /* BENELUX */ },
  { name: "Irlandia", continent: "Europe", tier: 3, colors: ["#169B62", "#FFFFFF", "#FF883E"], stadium: "Aviva Stadium", capacity: 51711, reputation: 11, region: "ENGLAND" /* ENGLAND */ },
  { name: "Irlandia P\xF3\u0142nocna", continent: "Europe", tier: 4, colors: ["#007A37", "#FFFFFF", "#007A37"], stadium: "Windsor Park", capacity: 18500, reputation: 7, region: "ENGLAND" /* ENGLAND */ },
  { name: "Islandia", continent: "Europe", tier: 3, colors: ["#02529C", "#FFFFFF", "#DC1E35"], stadium: "Laugardalsv\xF6llur", capacity: 15e3, reputation: 9, region: "SCANDINAVIA" /* SCANDINAVIA */ },
  { name: "Izrael", continent: "Europe", tier: 3, colors: ["#0038B8", "#FFFFFF", "#0038B8"], stadium: "Sammy Ofer Stadium", capacity: 30858, reputation: 12, region: "ISRAELI" /* ISRAELI */ },
  { name: "Kazachstan", continent: "Europe", tier: 4, colors: ["#00AFCA", "#FEC50C", "#00AFCA"], stadium: "Astana Arena", capacity: 3e4, reputation: 7, region: "KAZAKH" /* KAZAKH */ },
  { name: "Kosovo", continent: "Europe", tier: 3, colors: ["#244AA5", "#D0A650", "#244AA5"], stadium: "Fadil Vokrri Stadium", capacity: 13800, reputation: 8, region: "ALBANIA" /* ALBANIA */ },
  { name: "Liechtenstein", continent: "Europe", tier: 5, colors: ["#002B7F", "#CE1126", "#FFD100"], stadium: "Rheinpark Stadion", capacity: 7838, reputation: 2, region: "GERMANY" /* GERMANY */ },
  { name: "Litwa", continent: "Europe", tier: 5, colors: ["#FDB913", "#006A44", "#C1272D"], stadium: "LFF Stadium", capacity: 5067, reputation: 5, region: "BALTIC" /* BALTIC */ },
  { name: "Luksemburg", continent: "Europe", tier: 5, colors: ["#00A3E0", "#FFFFFF", "#EF3340"], stadium: "Stade de Luxembourg", capacity: 9385, reputation: 4, region: "BENELUX" /* BENELUX */ },
  { name: "\u0141otwa", continent: "Europe", tier: 5, colors: ["#9E3039", "#FFFFFF", "#9E3039"], stadium: "Daugava Stadium", capacity: 1e4, reputation: 5, region: "BALTIC" /* BALTIC */ },
  { name: "Macedonia P\xF3\u0142nocna", continent: "Europe", tier: 4, colors: ["#D20000", "#FFD700", "#D20000"], stadium: "To\u0161e Proeski Arena", capacity: 33500, reputation: 8, region: "BALKANS" /* BALKANS */ },
  { name: "Malta", continent: "Europe", tier: 5, colors: ["#FFFFFF", "#CF142B", "#FFFFFF"], stadium: "Ta' Qali", capacity: 17797, reputation: 3, region: "MALTESE" /* MALTESE */ },
  { name: "Mo\u0142dawia", continent: "Europe", tier: 5, colors: ["#0033A0", "#FFD100", "#CE1126"], stadium: "Zimbru", capacity: 10400, reputation: 6, region: "EX_USSR" /* EX_USSR */ },
  { name: "Niemcy", continent: "Europe", tier: 1, colors: ["#000000", "#DD0000", "#FFCE00"], stadium: "Olympiastadion Berlin", capacity: 74475, reputation: 20, region: "GERMANY" /* GERMANY */ },
  { name: "Norwegia", continent: "Europe", tier: 2, colors: ["#BA0C2F", "#FFFFFF", "#00205B"], stadium: "Ullevaal", capacity: 28e3, reputation: 11, region: "SCANDINAVIA" /* SCANDINAVIA */ },
  { name: "Polska", continent: "Europe", tier: 2, colors: ["#FFFFFF", "#DC143C", "#FFFFFF"], stadium: "Stadion Narodowy", capacity: 58580, reputation: 14, region: "POLAND" /* POLAND */ },
  { name: "Portugalia", continent: "Europe", tier: 1, colors: ["#006600", "#FF0000", "#006600"], stadium: "Est\xE1dio da Luz", capacity: 64642, reputation: 18, region: "IBERIA" /* IBERIA */ },
  { name: "Rosja", continent: "Europe", tier: 2, colors: ["#FFFFFF", "#0039A6", "#D52B1E"], stadium: "Luzhniki Stadium", capacity: 81e3, reputation: 13, region: "EX_USSR" /* EX_USSR */ },
  { name: "Rumunia", continent: "Europe", tier: 3, colors: ["#002B7F", "#FCD116", "#CE1126"], stadium: "Arena Na\u021Bional\u0103", capacity: 55634, reputation: 12, region: "ROMANIA" /* ROMANIA */ },
  { name: "San Marino", continent: "Europe", tier: 5, colors: ["#5EB6E4", "#FFFFFF", "#5EB6E4"], stadium: "San Marino Stadium", capacity: 6664, reputation: 1, region: "ITALY" /* ITALY */ },
  { name: "Serbia", continent: "Europe", tier: 2, colors: ["#C6363C", "#0C4076", "#FFFFFF"], stadium: "Rajko Miti\u0107", capacity: 53530, reputation: 14, region: "BALKANS" /* BALKANS */ },
  { name: "S\u0142owacja", continent: "Europe", tier: 3, colors: ["#FFFFFF", "#0B4EA2", "#EF3340"], stadium: "Teheln\xE9 pole", capacity: 22500, reputation: 10, region: "CZ_SK" /* CZ_SK */ },
  { name: "S\u0142owenia", continent: "Europe", tier: 3, colors: ["#FFFFFF", "#005DA4", "#ED1C24"], stadium: "Sto\u017Eice", capacity: 16038, reputation: 10, region: "BALKANS" /* BALKANS */ },
  { name: "Szkocja", continent: "Europe", tier: 2, colors: ["#0065BD", "#FFFFFF", "#0065BD"], stadium: "Hampden Park", capacity: 51866, reputation: 12, region: "ENGLAND" /* ENGLAND */ },
  { name: "Szwajcaria", continent: "Europe", tier: 2, colors: ["#FF0000", "#FFFFFF", "#FF0000"], stadium: "St. Jakob-Park", capacity: 38512, reputation: 15, region: "GERMANY" /* GERMANY */ },
  { name: "Szwecja", continent: "Europe", tier: 2, colors: ["#006AA7", "#FECC00", "#006AA7"], stadium: "Friends Arena", capacity: 5e4, reputation: 15, region: "SWEDEN" /* SWEDEN */ },
  { name: "Turcja", continent: "Europe", tier: 2, colors: ["#E30A17", "#FFFFFF", "#E30A17"], stadium: "Atat\xFCrk Olympic", capacity: 76092, reputation: 16, region: "TURKEY" /* TURKEY */ },
  { name: "Ukraina", continent: "Europe", tier: 2, colors: ["#005BBB", "#FFD500", "#005BBB"], stadium: "NSK Olimpiyskiy", capacity: 70050, reputation: 13, region: "EX_USSR" /* EX_USSR */ },
  { name: "Walia", continent: "Europe", tier: 3, colors: ["#FFFFFF", "#D30731", "#006400"], stadium: "Millennium Stadium", capacity: 74500, reputation: 11, region: "ENGLAND" /* ENGLAND */ },
  { name: "W\u0119gry", continent: "Europe", tier: 3, colors: ["#CD2A3E", "#FFFFFF", "#436F4D"], stadium: "Pusk\xE1s Ar\xE9na", capacity: 67215, reputation: 12, region: "HUNGARIAN" /* HUNGARIAN */ },
  { name: "W\u0142ochy", continent: "Europe", tier: 1, colors: ["#009246", "#FFFFFF", "#CE2B37"], stadium: "Stadio Olimpico", capacity: 70634, reputation: 19, region: "ITALY" /* ITALY */ },
  { name: "Wyspy Owcze", continent: "Europe", tier: 5, colors: ["#FFFFFF", "#0035AD", "#D21034"], stadium: "T\xF3rsv\xF8llur", capacity: 6040, reputation: 3, region: "SCANDINAVIA" /* SCANDINAVIA */ },
  { name: "Anglia", continent: "Europe", tier: 1, colors: ["#FFFFFF", "#C8102E", "#FFFFFF"], stadium: "Wembley", capacity: 9e4, reputation: 20, region: "ENGLAND" /* ENGLAND */ }
];

// resources/static_db/NationalTeams/NationalTeamsAfrica.tsx
var NATIONAL_TEAMS_AFRICA = [
  { name: "Algieria", continent: "Africa", tier: 3, colors: ["#006233", "#FFFFFF", "#D21034"], stadium: "Stade du 5 Juillet", capacity: 8e4, reputation: 12, region: "ARABIA" /* ARABIA */ },
  { name: "Angola", continent: "Africa", tier: 5, colors: ["#CE1126", "#000000", "#FCD116"], stadium: "Est\xE1dio 11 de Novembro", capacity: 5e4, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Benin", continent: "Africa", tier: 5, colors: ["#008751", "#FCD116", "#E8112D"], stadium: "Stade de l'Amiti\xE9", capacity: 4e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Botswana", continent: "Africa", tier: 5, colors: ["#75AADB", "#000000", "#FFFFFF"], stadium: "Obed Itani Chilume Stadium", capacity: 26e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Burkina Faso", continent: "Africa", tier: 4, colors: ["#EF2B2D", "#FCD116", "#009E49"], stadium: "Stade du 4 Ao\xFBt", capacity: 35e3, reputation: 9, region: "SSA" /* SSA */ },
  { name: "Burundi", continent: "Africa", tier: 5, colors: ["#CE1126", "#FFFFFF", "#1EB53A"], stadium: "Stade Prince Louis Rwagasore", capacity: 22e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Czad", continent: "Africa", tier: 5, colors: ["#002664", "#FECB00", "#C60C30"], stadium: "Stade Idriss Mahamat Ouya", capacity: 3e4, reputation: 4, region: "SSA" /* SSA */ },
  { name: "D\u017Cibuti", continent: "Africa", tier: 5, colors: ["#6AB2E7", "#FFFFFF", "#12AD2B"], stadium: "Stade du Ville", capacity: 2e4, reputation: 3, region: "ARABIA" /* ARABIA */ },
  { name: "Egipt", continent: "Africa", tier: 2, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Cairo International Stadium", capacity: 75e3, reputation: 12, region: "ARABIA" /* ARABIA */ },
  { name: "Erytrea", continent: "Africa", tier: 5, colors: ["#EA0437", "#0B5ED7", "#0A7E38"], stadium: "Cicero Stadium", capacity: 2e4, reputation: 3, region: "SSA" /* SSA */ },
  { name: "Eswatini", continent: "Africa", tier: 5, colors: ["#3E5EB9", "#FFD100", "#B10C2E"], stadium: "Somhlolo National Stadium", capacity: 2e4, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Etiopia", continent: "Africa", tier: 5, colors: ["#078930", "#FCDD09", "#DA121A"], stadium: "Addis Ababa Stadium", capacity: 35e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Gabon", continent: "Africa", tier: 5, colors: ["#009E60", "#FCD116", "#3A75C4"], stadium: "Stade de l'Amiti\xE9", capacity: 4e4, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Gambia", continent: "Africa", tier: 5, colors: ["#CE1126", "#0C1C8C", "#3A7728"], stadium: "Independence Stadium", capacity: 3e4, reputation: 6, region: "SSA" /* SSA */ },
  { name: "Ghana", continent: "Africa", tier: 2, colors: ["#CE1126", "#FCD116", "#006B3F"], stadium: "Accra Sports Stadium", capacity: 40500, reputation: 11, region: "SSA" /* SSA */ },
  { name: "Gwinea", continent: "Africa", tier: 5, colors: ["#CE1126", "#FCD116", "#009460"], stadium: "Stade du 28 Septembre", capacity: 5e4, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Gwinea Bissau", continent: "Africa", tier: 5, colors: ["#CE1126", "#FCD116", "#009460"], stadium: "Est\xE1dio 24 de Setembro", capacity: 2e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Gwinea R\xF3wnikowa", continent: "Africa", tier: 5, colors: ["#3E9A00", "#FFFFFF", "#D21034"], stadium: "Nuevo Estadio de Malabo", capacity: 15e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Kamerun", continent: "Africa", tier: 2, colors: ["#007A5E", "#CE1126", "#FCD116"], stadium: "Stade Ahmadou Ahidjo", capacity: 42e3, reputation: 11, region: "SSA" /* SSA */ },
  { name: "Kenia", continent: "Africa", tier: 5, colors: ["#000000", "#CE1126", "#006600"], stadium: "Nyayo National Stadium", capacity: 3e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Komory", continent: "Africa", tier: 5, colors: ["#3D8E33", "#FFFFFF", "#FFC61E"], stadium: "Stade Omnisports de Malouzini", capacity: 6e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Kongo", continent: "Africa", tier: 5, colors: ["#009543", "#FBDE4A", "#DC241F"], stadium: "Stade Alphonse Massamba-D\xE9bat", capacity: 33e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Demokratyczna Republika Konga", continent: "Africa", tier: 2, colors: ["#00A3E0", "#CE1126", "#FCD116"], stadium: "Stade des Martyrs", capacity: 8e4, reputation: 9, region: "SSA" /* SSA */ },
  { name: "Lesotho", continent: "Africa", tier: 5, colors: ["#00209F", "#FFFFFF", "#009543"], stadium: "Setsoto Stadium", capacity: 2e4, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Liberia", continent: "Africa", tier: 5, colors: ["#BF0A30", "#FFFFFF", "#002868"], stadium: "Samuel Kanyon Doe Stadium", capacity: 35e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Libia", continent: "Africa", tier: 5, colors: ["#E70013", "#000000", "#239E46"], stadium: "Martyrs of February Stadium", capacity: 45e3, reputation: 7, region: "ARABIA" /* ARABIA */ },
  { name: "Madagaskar", continent: "Africa", tier: 5, colors: ["#FFFFFF", "#FC3D32", "#007E3A"], stadium: "Stade Municipal de Mahamasina", capacity: 22e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Malawi", continent: "Africa", tier: 5, colors: ["#000000", "#CE1126", "#007A3D"], stadium: "Bingu National Stadium", capacity: 4e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Mali", continent: "Africa", tier: 3, colors: ["#14B53A", "#FCD116", "#CE1126"], stadium: "Stade du 26 Mars", capacity: 5e4, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Maroko", continent: "Africa", tier: 2, colors: ["#C1272D", "#006233", "#C1272D"], stadium: "Stade Mohammed V", capacity: 67e3, reputation: 13, region: "ARABIA" /* ARABIA */ },
  { name: "Mauretania", continent: "Africa", tier: 5, colors: ["#006233", "#FFD100", "#006233"], stadium: "Stade Olympique Nouakchott", capacity: 2e4, reputation: 6, region: "ARABIA" /* ARABIA */ },
  { name: "Mauritius", continent: "Africa", tier: 5, colors: ["#EA2839", "#1A206D", "#FFD500"], stadium: "Stade George V", capacity: 5e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Mozambik", continent: "Africa", tier: 5, colors: ["#007A3D", "#000000", "#FCD116"], stadium: "Est\xE1dio do Zimpeto", capacity: 42e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Namibia", continent: "Africa", tier: 5, colors: ["#003580", "#D21034", "#009543"], stadium: "Independence Stadium", capacity: 25e3, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Niger", continent: "Africa", tier: 5, colors: ["#E05206", "#FFFFFF", "#0DB02B"], stadium: "Stade G\xE9n\xE9ral Seyni Kountch\xE9", capacity: 35e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Nigeria", continent: "Africa", tier: 2, colors: ["#008753", "#FFFFFF", "#008753"], stadium: "Moshood Abiola Stadium", capacity: 6e4, reputation: 12, region: "SSA" /* SSA */ },
  { name: "Republika Po\u0142udniowej Afryki", continent: "Africa", tier: 3, colors: ["#007A4D", "#FFB612", "#000000"], stadium: "FNB Stadium", capacity: 94736, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Republika \u015Arodkowoafryka\u0144ska", continent: "Africa", tier: 5, colors: ["#003082", "#FFFFFF", "#289728"], stadium: "Stade Barth\xE9lemy Boganda", capacity: 2e4, reputation: 4, region: "SSA" /* SSA */ },
  { name: "Rwanda", continent: "Africa", tier: 5, colors: ["#00A1DE", "#FAD201", "#20603D"], stadium: "Amahoro Stadium", capacity: 45e3, reputation: 6, region: "SSA" /* SSA */ },
  { name: "Senegal", continent: "Africa", tier: 2, colors: ["#00853F", "#FDEF42", "#E31B23"], stadium: "Stade Abdoulaye Wade", capacity: 5e4, reputation: 14, region: "SSA" /* SSA */ },
  { name: "Seszele", continent: "Africa", tier: 5, colors: ["#003F87", "#FCD116", "#CE1126"], stadium: "Stade Linite", capacity: 1e4, reputation: 3, region: "SSA" /* SSA */ },
  { name: "Sierra Leone", continent: "Africa", tier: 5, colors: ["#1EB53A", "#FFFFFF", "#0072C6"], stadium: "Siaka Stevens Stadium", capacity: 36e3, reputation: 5, region: "SSA" /* SSA */ },
  { name: "Somalia", continent: "Africa", tier: 5, colors: ["#4189DD", "#FFFFFF", "#4189DD"], stadium: "Mogadishu Stadium", capacity: 65e3, reputation: 3, region: "SSA" /* SSA */ },
  { name: "Sudan", continent: "Africa", tier: 5, colors: ["#D21034", "#FFFFFF", "#000000"], stadium: "Al-Merrikh Stadium", capacity: 43e3, reputation: 6, region: "ARABIA" /* ARABIA */ },
  { name: "Sudan Po\u0142udniowy", continent: "Africa", tier: 5, colors: ["#000000", "#CE1126", "#078930"], stadium: "Juba National Stadium", capacity: 3e4, reputation: 4, region: "SSA" /* SSA */ },
  { name: "Wyspy \u015Awi\u0119tego Tomasza i Ksi\u0105\u017C\u0119ca", continent: "Africa", tier: 5, colors: ["#009E49", "#FCD116", "#CE1126"], stadium: "Est\xE1dio Nacional 12 de Julho", capacity: 6500, reputation: 3, region: "SSA" /* SSA */ },
  { name: "Tanzania", continent: "Africa", tier: 5, colors: ["#1EB53A", "#FCD116", "#00A3DD"], stadium: "Benjamin Mkapa Stadium", capacity: 6e4, reputation: 7, region: "SSA" /* SSA */ },
  { name: "Togo", continent: "Africa", tier: 5, colors: ["#006A4E", "#FCD116", "#D21034"], stadium: "Stade de K\xE9gu\xE9", capacity: 3e4, reputation: 6, region: "SSA" /* SSA */ },
  { name: "Tunezja", continent: "Africa", tier: 2, colors: ["#E70013", "#FFFFFF", "#E70013"], stadium: "Stade Olympique de Rad\xE8s", capacity: 6e4, reputation: 11, region: "ARABIA" /* ARABIA */ },
  { name: "Uganda", continent: "Africa", tier: 5, colors: ["#000000", "#FCD116", "#CE1126"], stadium: "Mandela National Stadium", capacity: 45e3, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Wybrze\u017Ce Ko\u015Bci S\u0142oniowej", continent: "Africa", tier: 2, colors: ["#F77F00", "#FFFFFF", "#009E60"], stadium: "Stade Olympique d'Ebimp\xE9", capacity: 6e4, reputation: 14, region: "SSA" /* SSA */ },
  { name: "Wyspy Zielonego Przyl\u0105dka", continent: "Africa", tier: 2, colors: ["#003893", "#FFFFFF", "#CF2027"], stadium: "Est\xE1dio Nacional de Cabo Verde", capacity: 15e3, reputation: 8, region: "SSA" /* SSA */ },
  { name: "Zambia", continent: "Africa", tier: 5, colors: ["#198A00", "#EF3340", "#000000"], stadium: "National Heroes Stadium", capacity: 6e4, reputation: 9, region: "SSA" /* SSA */ },
  { name: "Zimbabwe", continent: "Africa", tier: 5, colors: ["#006400", "#FFD100", "#D21034"], stadium: "National Sports Stadium", capacity: 6e4, reputation: 7, region: "SSA" /* SSA */ }
];

// resources/static_db/NationalTeams/NationalTeamsAFC.tsx
var NATIONAL_TEAMS_AFC = [
  { name: "Arabia Saudyjska", continent: "Asia", tier: 4, colors: ["#006C35", "#FFFFFF", "#006C35"], stadium: "King Fahd International Stadium", capacity: 68752, reputation: 12, region: "ARABIA" /* ARABIA */ },
  { name: "Bahrajn", continent: "Asia", tier: 4, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Bahrain National Stadium", capacity: 24e3, reputation: 7, region: "ARABIA" /* ARABIA */ },
  { name: "Irak", continent: "Asia", tier: 3, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Basra International Stadium", capacity: 65e3, reputation: 10, region: "ARABIA" /* ARABIA */ },
  { name: "Iran", continent: "Asia", tier: 3, colors: ["#239F40", "#FFFFFF", "#DA0000"], stadium: "Azadi Stadium", capacity: 78116, reputation: 11, region: "ARABIA" /* ARABIA */ },
  { name: "Jemen", continent: "Asia", tier: 5, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Al-Thawra Stadium", capacity: 3e4, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Jordania", continent: "Asia", tier: 3, colors: ["#000000", "#FFFFFF", "#007A3D"], stadium: "Amman International Stadium", capacity: 25e3, reputation: 9, region: "ARABIA" /* ARABIA */ },
  { name: "Katar", continent: "Asia", tier: 4, colors: ["#8A1538", "#FFFFFF", "#8A1538"], stadium: "Lusail Stadium", capacity: 88966, reputation: 12, region: "ARABIA" /* ARABIA */ },
  { name: "Kuwejt", continent: "Asia", tier: 4, colors: ["#007A3D", "#FFFFFF", "#CE1126"], stadium: "Jaber Al-Ahmad International Stadium", capacity: 6e4, reputation: 9, region: "ARABIA" /* ARABIA */ },
  { name: "Liban", continent: "Asia", tier: 4, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Beirut Municipal Stadium", capacity: 22e3, reputation: 7, region: "ARABIA" /* ARABIA */ },
  { name: "Oman", continent: "Asia", tier: 4, colors: ["#D21034", "#FFFFFF", "#009543"], stadium: "Sultan Qaboos Sports Complex", capacity: 39e3, reputation: 9, region: "ARABIA" /* ARABIA */ },
  { name: "Palestyna", continent: "Asia", tier: 5, colors: ["#000000", "#FFFFFF", "#007A3D"], stadium: "Faisal Al-Husseini Stadium", capacity: 12e3, reputation: 7, region: "ARABIA" /* ARABIA */ },
  { name: "Syria", continent: "Asia", tier: 4, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Abbasiyyin Stadium", capacity: 3e4, reputation: 8, region: "ARABIA" /* ARABIA */ },
  { name: "ZEA", continent: "Asia", tier: 3, colors: ["#00732F", "#FFFFFF", "#000000"], stadium: "Zayed Sports City Stadium", capacity: 43e3, reputation: 10, region: "ARABIA" /* ARABIA */ },
  { name: "Australia", continent: "Asia", tier: 2, colors: ["#1F8A43", "#FFD100", "#1F8A43"], stadium: "Stadium Australia", capacity: 83500, reputation: 13, region: "OCEANIA" /* OCEANIA */ },
  { name: "Chiny", continent: "Asia", tier: 4, colors: ["#DE2910", "#FFDE00", "#DE2910"], stadium: "Workers' Stadium", capacity: 68e3, reputation: 10, region: "JAPAN" /* JAPAN */ },
  { name: "Filipiny", continent: "Asia", tier: 5, colors: ["#0038A8", "#FFFFFF", "#CE1126"], stadium: "Rizal Memorial Stadium", capacity: 12e3, reputation: 7, region: "JAPAN" /* JAPAN */ },
  { name: "Indonezja", continent: "Asia", tier: 5, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Gelora Bung Karno", capacity: 77e3, reputation: 9, region: "JAPAN" /* JAPAN */ },
  { name: "Japonia", continent: "Asia", tier: 2, colors: ["#BC002D", "#FFFFFF", "#BC002D"], stadium: "Saitama Stadium", capacity: 63700, reputation: 14, region: "JAPAN" /* JAPAN */ },
  { name: "Kambod\u017Ca", continent: "Asia", tier: 5, colors: ["#032EA1", "#E00025", "#032EA1"], stadium: "Morodok Techo National Stadium", capacity: 6e4, reputation: 5, region: "JAPAN" /* JAPAN */ },
  { name: "Korea P\u0141D", continent: "Asia", tier: 2, colors: ["#FFFFFF", "#C60C30", "#FFFFFF"], stadium: "Seoul World Cup Stadium", capacity: 66806, reputation: 14, region: "KOREA" /* KOREA */ },
  { name: "Korea P\u0141N", continent: "Asia", tier: 5, colors: ["#024FA2", "#ED1C27", "#024FA2"], stadium: "Kim Il-sung Stadium", capacity: 5e4, reputation: 9, region: "KOREA" /* KOREA */ },
  { name: "Laos", continent: "Asia", tier: 5, colors: ["#CE1126", "#002868", "#CE1126"], stadium: "New Laos National Stadium", capacity: 25e3, reputation: 4, region: "JAPAN" /* JAPAN */ },
  { name: "Malezja", continent: "Asia", tier: 5, colors: ["#010066", "#FFCC00", "#CE1126"], stadium: "Bukit Jalil National Stadium", capacity: 87411, reputation: 6, region: "JAPAN" /* JAPAN */ },
  {
    name: "Macau",
    continent: "Asia",
    tier: 5,
    colors: ["#006600", "#FFD700", "#FFFFFF"],
    stadium: "Centro Desportivo Ol\xEDmpico - Est\xE1dio",
    capacity: 16272,
    reputation: 3,
    region: "JAPAN" /* JAPAN */
  },
  { name: "Mjanma", continent: "Asia", tier: 5, colors: ["#FECB00", "#34B233", "#EA2839"], stadium: "Thuwunna Stadium", capacity: 32e3, reputation: 6, region: "JAPAN" /* JAPAN */ },
  { name: "Singapur", continent: "Asia", tier: 5, colors: ["#EF3340", "#FFFFFF", "#EF3340"], stadium: "National Stadium", capacity: 55e3, reputation: 8, region: "JAPAN" /* JAPAN */ },
  { name: "Tajlandia", continent: "Asia", tier: 5, colors: ["#CE1126", "#002868", "#CE1126"], stadium: "Rajamangala Stadium", capacity: 49e3, reputation: 7, region: "JAPAN" /* JAPAN */ },
  { name: "Timor Wschodni", continent: "Asia", tier: 5, colors: ["#DA121A", "#000000", "#FCD116"], stadium: "Est\xE1dio Nacional de Dili", capacity: 3e4, reputation: 4, region: "JAPAN" /* JAPAN */ },
  { name: "Wietnam", continent: "Asia", tier: 5, colors: ["#DA251D", "#FFDE00", "#DA251D"], stadium: "M\u1EF9 \u0110\xECnh National Stadium", capacity: 40192, reputation: 9, region: "JAPAN" /* JAPAN */ },
  { name: "Afganistan", continent: "Asia", tier: 5, colors: ["#000000", "#DA0000", "#007A36"], stadium: "Ghazi Stadium", capacity: 25e3, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Bangladesz", continent: "Asia", tier: 5, colors: ["#006A4E", "#F42A41", "#006A4E"], stadium: "Bangabandhu National Stadium", capacity: 36e3, reputation: 3, region: "ARABIA" /* ARABIA */ },
  { name: "Bhutan", continent: "Asia", tier: 5, colors: ["#FFCC00", "#FFFFFF", "#FF6600"], stadium: "Changlimithang Stadium", capacity: 25e3, reputation: 3, region: "JAPAN" /* JAPAN */ },
  { name: "Hongkong", continent: "Asia", tier: 5, colors: ["#DE2910", "#FFFFFF", "#DE2910"], stadium: "Hong Kong Stadium", capacity: 4e4, reputation: 4, region: "JAPAN" /* JAPAN */ },
  { name: "Indie", continent: "Asia", tier: 5, colors: ["#FF9933", "#FFFFFF", "#138808"], stadium: "Salt Lake Stadium", capacity: 85e3, reputation: 8, region: "ARABIA" /* ARABIA */ },
  { name: "Kirgistan", continent: "Asia", tier: 5, colors: ["#E8112D", "#FFD100", "#E8112D"], stadium: "Dolen Omurzakov Stadium", capacity: 23e3, reputation: 8, region: "KAZAKH" /* KAZAKH */ },
  { name: "Malediwy", continent: "Asia", tier: 5, colors: ["#D21034", "#007A3D", "#D21034"], stadium: "National Football Stadium", capacity: 7e3, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Mongolia", continent: "Asia", tier: 5, colors: ["#C4272F", "#0033A0", "#F9CF02"], stadium: "MFF Football Centre", capacity: 5e3, reputation: 3, region: "JAPAN" /* JAPAN */ },
  { name: "Nepal", continent: "Asia", tier: 5, colors: ["#DC143C", "#003893", "#DC143C"], stadium: "Dasarath Rangasala", capacity: 15e3, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Pakistan", continent: "Asia", tier: 5, colors: ["#01411C", "#FFFFFF", "#01411C"], stadium: "Jinnah Sports Stadium", capacity: 3e4, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Sri Lanka", continent: "Asia", tier: 5, colors: ["#8D153A", "#F9E547", "#1C4FA1"], stadium: "Racecourse Stadium", capacity: 35e3, reputation: 5, region: "ARABIA" /* ARABIA */ },
  { name: "Tad\u017Cykistan", continent: "Asia", tier: 5, colors: ["#CE1126", "#FFFFFF", "#007A3D"], stadium: "Central Republican Stadium", capacity: 23e3, reputation: 9, region: "EX_USSR" /* EX_USSR */ },
  { name: "Turkmenistan", continent: "Asia", tier: 5, colors: ["#009E60", "#FFFFFF", "#CE1126"], stadium: "Ashgabat Stadium", capacity: 2e4, reputation: 7, region: "KAZAKH" /* KAZAKH */ },
  { name: "Uzbekistan", continent: "Asia", tier: 4, colors: ["#0099B5", "#FFFFFF", "#1EB53A"], stadium: "Milliy Stadium", capacity: 34e3, reputation: 12, region: "KAZAKH" /* KAZAKH */ },
  {
    name: "Brunei",
    continent: "Asia",
    tier: 5,
    colors: ["#000000", "#FFFFFF", "#CF1126"],
    stadium: "Hassanal Bolkiah National Stadium",
    capacity: 28e3,
    reputation: 4,
    region: "JAPAN" /* JAPAN */
  },
  {
    name: "Chinese Taipei",
    continent: "Asia",
    tier: 5,
    colors: ["#002868", "#FFFFFF", "#CE1126"],
    stadium: "Kaohsiung National Stadium",
    capacity: 55e3,
    reputation: 6,
    region: "JAPAN" /* JAPAN */
  },
  {
    name: "Guam",
    continent: "Asia",
    tier: 5,
    colors: ["#0033A0", "#FFFFFF", "#CE1126"],
    stadium: "Guam National Football Stadium",
    capacity: 3500,
    reputation: 3,
    region: "JAPAN" /* JAPAN */
  }
];

// resources/static_db/NationalTeams/NationalTeamsCONCACAF.tsx
var NATIONAL_TEAMS_CONCACAF = [
  { name: "Stany Zjednoczone", continent: "North America", tier: 3, colors: ["#B22234", "#FFFFFF", "#3C3B6E"], stadium: "MetLife Stadium", capacity: 82500, reputation: 13, region: "NORTH_AMERICA" /* NORTH_AMERICA */ },
  { name: "Meksyk", continent: "North America", tier: 2, colors: ["#006847", "#FFFFFF", "#CE1126"], stadium: "Estadio Azteca", capacity: 87e3, reputation: 14, region: "MEXICO" /* MEXICO */ },
  { name: "Kanada", continent: "North America", tier: 3, colors: ["#D52B1E", "#FFFFFF", "#D52B1E"], stadium: "BMO Field", capacity: 3e4, reputation: 12, region: "NORTH_AMERICA" /* NORTH_AMERICA */ },
  { name: "Kostaryka", continent: "North America", tier: 2, colors: ["#002B7F", "#FFFFFF", "#CE1126"], stadium: "Estadio Nacional", capacity: 35e3, reputation: 12, region: "IBERIA" /* IBERIA */ },
  { name: "Panama", continent: "North America", tier: 2, colors: ["#0052A5", "#FFFFFF", "#EF3340"], stadium: "Estadio Rommel Fern\xE1ndez", capacity: 32e3, reputation: 12, region: "IBERIA" /* IBERIA */ },
  { name: "Honduras", continent: "North America", tier: 5, colors: ["#0073CF", "#FFFFFF", "#0073CF"], stadium: "Estadio Ol\xEDmpico Metropolitano", capacity: 38e3, reputation: 10, region: "IBERIA" /* IBERIA */ },
  { name: "Salwador", continent: "North America", tier: 4, colors: ["#0F47AF", "#FFFFFF", "#0F47AF"], stadium: "Estadio Cuscatl\xE1n", capacity: 53e3, reputation: 9, region: "IBERIA" /* IBERIA */ },
  { name: "Gwatemala", continent: "North America", tier: 5, colors: ["#4997D0", "#FFFFFF", "#4997D0"], stadium: "Estadio Doroteo Guamuch Flores", capacity: 26e3, reputation: 8, region: "IBERIA" /* IBERIA */ },
  { name: "Nikaragua", continent: "North America", tier: 5, colors: ["#0067C6", "#FFFFFF", "#0067C6"], stadium: "Estadio Nacional de F\xFAtbol", capacity: 15e3, reputation: 7, region: "IBERIA" /* IBERIA */ },
  { name: "Belize", continent: "North America", tier: 5, colors: ["#003F87", "#FFFFFF", "#CE1126"], stadium: "FFB Stadium", capacity: 5e3, reputation: 4, region: "ENGLAND" /* ENGLAND */ },
  { name: "Jamajka", continent: "North America", tier: 3, colors: ["#009B3A", "#FED100", "#000000"], stadium: "Independence Park", capacity: 35e3, reputation: 10, region: "NORTH_AMERICA" /* NORTH_AMERICA */ },
  { name: "Trynidad i Tobago", continent: "North America", tier: 3, colors: ["#CE1126", "#FFFFFF", "#000000"], stadium: "Hasely Crawford Stadium", capacity: 23e3, reputation: 9, region: "ENGLAND" /* ENGLAND */ },
  { name: "Haiti", continent: "North America", tier: 3, colors: ["#00209F", "#D21034", "#FFFFFF"], stadium: "Stade Sylvio Cator", capacity: 15e3, reputation: 9, region: "FRANCE" /* FRANCE */ },
  { name: "Cura\xE7ao", continent: "North America", tier: 3, colors: ["#0033A0", "#FFD100", "#CE1126"], stadium: "Ergilio Hato Stadium", capacity: 15e3, reputation: 9, region: "BENELUX" /* BENELUX */ },
  { name: "Surinam", continent: "North America", tier: 5, colors: ["#377E3F", "#FFFFFF", "#B40A2D"], stadium: "Andr\xE9 Kamperveen Stadium", capacity: 6e3, reputation: 7, region: "BENELUX" /* BENELUX */ },
  { name: "Kuba", continent: "North America", tier: 5, colors: ["#002A8F", "#FFFFFF", "#CF142B"], stadium: "Estadio Pedro Marrero", capacity: 3e4, reputation: 8, region: "IBERIA" /* IBERIA */ },
  { name: "Republika Dominikany", continent: "North America", tier: 5, colors: ["#002D62", "#FFFFFF", "#CE1126"], stadium: "Estadio Cibao FC", capacity: 14e3, reputation: 8, region: "IBERIA" /* IBERIA */ },
  { name: "Antigua i Barbuda", continent: "North America", tier: 5, colors: ["#000000", "#CE1126", "#FFFFFF"], stadium: "Sir Vivian Richards Stadium", capacity: 1e4, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Aruba", continent: "North America", tier: 5, colors: ["#418FDE", "#FFD100", "#CE1126"], stadium: "Guillermo Prospero Trinidad Stadium", capacity: 8e3, reputation: 5, region: "BENELUX" /* BENELUX */ },
  { name: "Bahamy", continent: "North America", tier: 5, colors: ["#00ABC9", "#FFD100", "#000000"], stadium: "Thomas A. Robinson Stadium", capacity: 15e3, reputation: 4, region: "ENGLAND" /* ENGLAND */ },
  { name: "Barbados", continent: "North America", tier: 5, colors: ["#00267F", "#FFD100", "#000000"], stadium: "Wildey Turf", capacity: 3e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Bermudy", continent: "North America", tier: 5, colors: ["#CE1126", "#FFFFFF", "#00247D"], stadium: "National Sports Centre", capacity: 8e3, reputation: 6, region: "ENGLAND" /* ENGLAND */ },
  { name: "Dominika", continent: "North America", tier: 5, colors: ["#006B3F", "#FFD100", "#000000"], stadium: "Windsor Park", capacity: 12e3, reputation: 4, region: "ENGLAND" /* ENGLAND */ },
  { name: "Grenada", continent: "North America", tier: 5, colors: ["#CE1126", "#FFD100", "#006B3F"], stadium: "Kirani James Athletic Stadium", capacity: 8e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Kajmany", continent: "North America", tier: 5, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "Truman Bodden Sports Complex", capacity: 3e3, reputation: 4, region: "ENGLAND" /* ENGLAND */ },
  { name: "Montserrat", continent: "North America", tier: 5, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "Blakes Estate Stadium", capacity: 3e3, reputation: 3, region: "ENGLAND" /* ENGLAND */ },
  { name: "Saint Kitts i Nevis", continent: "North America", tier: 5, colors: ["#009E60", "#FCD116", "#CE1126"], stadium: "Warner Park Stadium", capacity: 8e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Saint Lucia", continent: "North America", tier: 5, colors: ["#6CF", "#FFD100", "#000000"], stadium: "Daren Sammy Cricket Ground", capacity: 15e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Saint Vincent i Grenadyny", continent: "North America", tier: 5, colors: ["#0052A5", "#FFD100", "#009E60"], stadium: "Arnos Vale Stadium", capacity: 18e3, reputation: 5, region: "ENGLAND" /* ENGLAND */ },
  { name: "Turks i Caicos", continent: "North America", tier: 5, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "TCIFA National Academy", capacity: 3e3, reputation: 3, region: "ENGLAND" /* ENGLAND */ },
  {
    name: "Anguilla",
    continent: "North America",
    tier: 5,
    colors: ["#FFFFFF", "#CE1126", "#00247D"],
    stadium: "Raymond E. Lee Football Field",
    capacity: 2500,
    reputation: 5,
    region: "ENGLAND" /* ENGLAND */
  },
  {
    name: "Brytyjskie Wyspy Dziewicze",
    continent: "North America",
    tier: 5,
    colors: ["#FFFFFF", "#00247D", "#CE1126"],
    stadium: "A.O. Shirley Recreation Ground",
    capacity: 5e3,
    reputation: 5,
    region: "ENGLAND" /* ENGLAND */
  },
  {
    name: "Francuska Gujana",
    continent: "North America",
    tier: 5,
    colors: ["#002395", "#FFFFFF", "#ED2939"],
    stadium: "Stade de Badminton",
    capacity: 7e3,
    reputation: 6,
    region: "FRANCE" /* FRANCE */
  },
  {
    name: "Gujana",
    continent: "North America",
    tier: 5,
    colors: ["#009E49", "#FFD100", "#CE1126"],
    stadium: "Providence Stadium",
    capacity: 15e3,
    reputation: 6,
    region: "ENGLAND" /* ENGLAND */
  },
  {
    name: "Portoryko",
    continent: "North America",
    tier: 5,
    colors: ["#002D62", "#FFFFFF", "#CE1126"],
    stadium: "Estadio Juan Ram\xF3n Loubriel",
    capacity: 22e3,
    reputation: 7,
    region: "IBERIA" /* IBERIA */
  },
  {
    name: "Stany Zjednoczone Wyspy Dziewicze",
    continent: "North America",
    tier: 5,
    colors: ["#FFFFFF", "#0033A0", "#CE1126"],
    stadium: "Lionel Roberts Stadium",
    capacity: 3500,
    reputation: 3,
    region: "ENGLAND" /* ENGLAND */
  },
  {
    name: "Bonaire",
    continent: "North America",
    tier: 5,
    colors: ["#FFFFFF", "#E30613", "#002395"],
    stadium: "Stadion Kralendijk",
    capacity: 3e3,
    reputation: 4,
    region: "BENELUX" /* BENELUX */
  },
  {
    name: "Gwadelupa",
    continent: "North America",
    tier: 5,
    colors: ["#002395", "#FFFFFF", "#ED2939"],
    stadium: "Stade Jos\xE9phine-Charlotte",
    capacity: 18e3,
    reputation: 6,
    region: "FRANCE" /* FRANCE */
  },
  {
    name: "Martynika",
    continent: "North America",
    tier: 5,
    colors: ["#002395", "#FFFFFF", "#ED2939"],
    stadium: "Stade Pierre-Aliker",
    capacity: 18e3,
    reputation: 7,
    region: "FRANCE" /* FRANCE */
  },
  {
    name: "Saint-Martin",
    continent: "North America",
    tier: 5,
    colors: ["#002395", "#FFFFFF", "#ED2939"],
    stadium: "Stade de Marigot",
    capacity: 2e3,
    reputation: 3,
    region: "FRANCE" /* FRANCE */
  },
  {
    name: "Sint Maarten",
    continent: "North America",
    tier: 5,
    colors: ["#CE1126", "#FFFFFF", "#00247D"],
    stadium: "Raoul Illidge Sports Complex",
    capacity: 3e3,
    reputation: 3,
    region: "BENELUX" /* BENELUX */
  }
];

// resources/static_db/NationalTeams/NationalTeamsCONMEBOL.tsx
var NATIONAL_TEAMS_CONMEBOL = [
  { name: "Argentyna", continent: "South America", tier: 1, colors: ["#75AADB", "#FFFFFF", "#75AADB"], stadium: "Estadio Monumental", capacity: 84567, reputation: 20, region: "ARGENTINA" /* ARGENTINA */ },
  { name: "Brazylia", continent: "South America", tier: 1, colors: ["#009C3B", "#FFDF00", "#002776"], stadium: "Maracan\xE3", capacity: 78838, reputation: 20, region: "BRAZIL" /* BRAZIL */ },
  { name: "Urugwaj", continent: "South America", tier: 2, colors: ["#6CACE4", "#FFFFFF", "#6CACE4"], stadium: "Estadio Centenario", capacity: 60235, reputation: 15, region: "ARGENTINA" /* ARGENTINA */ },
  { name: "Kolumbia", continent: "South America", tier: 2, colors: ["#FCD116", "#003893", "#CE1126"], stadium: "Estadio Metropolitano", capacity: 46e3, reputation: 14, region: "IBERIA" /* IBERIA */ },
  { name: "Chile", continent: "South America", tier: 2, colors: ["#0039A6", "#FFFFFF", "#D52B1E"], stadium: "Estadio Nacional", capacity: 48665, reputation: 13, region: "IBERIA" /* IBERIA */ },
  { name: "Peru", continent: "South America", tier: 3, colors: ["#D91023", "#FFFFFF", "#D91023"], stadium: "Estadio Nacional", capacity: 43086, reputation: 13, region: "IBERIA" /* IBERIA */ },
  { name: "Ekwador", continent: "South America", tier: 3, colors: ["#FCD116", "#003893", "#CE1126"], stadium: "Estadio Rodrigo Paz Delgado", capacity: 41575, reputation: 12, region: "IBERIA" /* IBERIA */ },
  { name: "Paragwaj", continent: "South America", tier: 3, colors: ["#D52B1E", "#FFFFFF", "#0038A8"], stadium: "Estadio Defensores del Chaco", capacity: 42e3, reputation: 11, region: "IBERIA" /* IBERIA */ },
  { name: "Boliwia", continent: "South America", tier: 3, colors: ["#D52B1E", "#FCD116", "#007A33"], stadium: "Estadio Hernando Siles", capacity: 41e3, reputation: 9, region: "IBERIA" /* IBERIA */ },
  { name: "Wenezuela", continent: "South America", tier: 3, colors: ["#F4C300", "#003DA5", "#C8102E"], stadium: "Estadio Ol\xEDmpico UCV", capacity: 24e3, reputation: 9, region: "IBERIA" /* IBERIA */ }
];

// resources/static_db/NationalTeams/NationalTeamsOFC.tsx
var NATIONAL_TEAMS_OFC = [
  { name: "Nowa Zelandia", continent: "Oceania", tier: 2, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "Eden Park", capacity: 5e4, reputation: 10, region: "OCEANIA" /* OCEANIA */ },
  { name: "Fid\u017Ci", continent: "Oceania", tier: 5, colors: ["#68BFE5", "#FFFFFF", "#CE1126"], stadium: "HFC Bank Stadium", capacity: 15e3, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Wyspy Salomona", continent: "Oceania", tier: 5, colors: ["#215B33", "#0051BA", "#FCD116"], stadium: "Lawson Tama Stadium", capacity: 2e4, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Papua-Nowa Gwinea", continent: "Oceania", tier: 5, colors: ["#000000", "#CE1126", "#FCD116"], stadium: "National Football Stadium", capacity: 15e3, reputation: 4, region: "OCEANIA" /* OCEANIA */ },
  { name: "Tahiti", continent: "Oceania", tier: 5, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Stade Pater", capacity: 1e4, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Nowa Kaledonia", continent: "Oceania", tier: 5, colors: ["#0035AD", "#ED2939", "#009543"], stadium: "Stade Numa-Daly Magenta", capacity: 16e3, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Vanuatu", continent: "Oceania", tier: 5, colors: ["#D21034", "#000000", "#009543"], stadium: "Korman Stadium", capacity: 6500, reputation: 5, region: "OCEANIA" /* OCEANIA */ },
  { name: "Samoa", continent: "Oceania", tier: 5, colors: ["#002B7F", "#CE1126", "#FFFFFF"], stadium: "Apia Park", capacity: 12e3, reputation: 4, region: "OCEANIA" /* OCEANIA */ },
  { name: "Samoa Ameryka\u0144skie", continent: "Oceania", tier: 5, colors: ["#002B7F", "#FFFFFF", "#CE1126"], stadium: "Pago Park Soccer Stadium", capacity: 2e3, reputation: 2, region: "OCEANIA" /* OCEANIA */ },
  { name: "Tonga", continent: "Oceania", tier: 5, colors: ["#CE1126", "#FFFFFF", "#CE1126"], stadium: "Teufaiva Sport Stadium", capacity: 1e4, reputation: 3, region: "OCEANIA" /* OCEANIA */ },
  { name: "Wyspy Cooka", continent: "Oceania", tier: 5, colors: ["#00247D", "#FFFFFF", "#CF142B"], stadium: "National Stadium (Rarotonga)", capacity: 3e3, reputation: 3, region: "OCEANIA" /* OCEANIA */ }
];

// services/NationalityService.ts
var REGION_TO_NT_LIST = {};
var allNTData = [
  ...NATIONAL_TEAMS_EUROPE,
  ...NATIONAL_TEAMS_AFRICA,
  ...NATIONAL_TEAMS_AFC,
  ...NATIONAL_TEAMS_CONCACAF,
  ...NATIONAL_TEAMS_CONMEBOL,
  ...NATIONAL_TEAMS_OFC
];
for (const nt of allNTData) {
  const region = nt.region;
  if (!REGION_TO_NT_LIST[region]) {
    REGION_TO_NT_LIST[region] = [];
  }
  REGION_TO_NT_LIST[region].push({ name: nt.name, reputation: nt.reputation });
}
function pickNationalityForRegion(region) {
  const list = REGION_TO_NT_LIST[region];
  if (!list || list.length === 0) return "";
  if (list.length === 1) return list[0].name;
  const totalWeight = list.reduce((sum, nt) => sum + nt.reputation, 0);
  let roll = Math.random() * totalWeight;
  for (const nt of list) {
    roll -= nt.reputation;
    if (roll <= 0) return nt.name;
  }
  return list[list.length - 1].name;
}

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

// services/ReserveTeamLeagueService.ts
var RESERVE_PARENT_CLUB_BY_ID = {
  PL_LEGIA_WARSZAWA_II: "PL_LEGIA_WARSZAWA",
  PL_SLASK_WROCLAW_II: "PL_SLASK_WROCLAW",
  PL_LKS_II_LODZ: "PL_LKS_LODZ",
  PL_WIDZEW_LODZ_II: "PL_WIDZEW_LODZ",
  PL_WISLA_PLOCK_II: "PL_WISLA_PLOCK",
  PL_JAGIELLONIA_BIALYSTOK_II: "PL_JAGIELLONIA_BIALYSTOK",
  PL_LECH_POZNAN_II: "PL_LECH_POZNAN",
  PL_ZAGLEBIE_LUBIN_II: "PL_ZAGLEBIE_LUBIN",
  PL_MIEDZ_LEGNICA_II: "PL_MIEDZ_LEGNICA",
  PL_RAKOW_CZESTOCHOWA_II: "PL_RAKOW_CZESTOCHOWA",
  PL_WISLA_KRAKOW_II: "PL_WISLA_KRAKOW",
  PL_WIECZYSTA_KRAKOW_II: "PL_WIECZYSTA_KRAKOW",
  PL_KORONA_KIELCE_II: "PL_KORONA_KIELCE"
};
var PLAYABLE_POLISH_LEAGUE_IDS = /* @__PURE__ */ new Set([
  "L_PL_1",
  "L_PL_2",
  "L_PL_3",
  ...THIRD_LEAGUE_GROUP_IDS
]);
var getLeagueId = (clubId, clubs, projectedLeagueByClubId) => projectedLeagueByClubId?.get(clubId) ?? clubs.find((club) => club.id === clubId)?.leagueId;
var ReserveTeamLeagueService = {
  createLeagueProjection(clubs, changes = []) {
    const projection = new Map(clubs.map((club) => [club.id, club.leagueId]));
    changes.forEach((change) => {
      for (const clubId of change.clubIds) projection.set(clubId, change.targetLeagueId);
    });
    return projection;
  },
  applyLeagueProjection(projection, clubIds, targetLeagueId) {
    for (const clubId of clubIds) projection.set(clubId, targetLeagueId);
  },
  getParentClubId(reserveClubId) {
    return RESERVE_PARENT_CLUB_BY_ID[reserveClubId] ?? null;
  },
  /**
   * Resolves the configured reserve-club relationship without deciding if the
   * reserve side participates in the currently selected season. Callers which
   * control the player's reserve screen must use getPlayableReserveClubId;
   * promotion, finance and ownership rules may still need this raw relation
   * even while the reserve team temporarily plays below the simulated leagues.
   */
  getReserveClubId(parentClubId) {
    const pair = Object.entries(RESERVE_PARENT_CLUB_BY_ID).find(([, configuredParentClubId]) => configuredParentClubId === parentClubId);
    return pair?.[0] ?? null;
  },
  /**
   * Resolves an official reserve side only when it is an actual participant in
   * a simulated league for the current career state. This is intentionally a
   * runtime check against the supplied clubs rather than a static season list:
   * promotions and relegations can make the answer change in later seasons.
   *
   * When the configured reserve club is missing or sits only in the L_PL_5
   * feeder pool, null instructs GameContext to keep using generated reserves. A
   * club with no configured database reserve side, such as Polonia Warszawa,
   * naturally follows the same fallback path.
   */
  getPlayableReserveClubId(parentClubId, clubs) {
    const reserveClubId = this.getReserveClubId(parentClubId);
    if (!reserveClubId) return null;
    const reserveClub = clubs.find((club) => club.id === reserveClubId);
    if (!reserveClub || !PLAYABLE_POLISH_LEAGUE_IDS.has(reserveClub.leagueId)) return null;
    return reserveClubId;
  },
  /**
   * Official reserve teams are database-controlled development sides, not
   * independent career entry points. The defensive predicate is shared by
   * the selection screen and GameContext so a future UI regression cannot
   * bypass the restriction by calling selectUserTeam directly.
   */
  canBeSelectedAsUserClub(clubId) {
    return !this.isReserveClub(clubId);
  },
  /**
   * Returns every configured parent/reserve relationship as immutable-looking
   * value objects. Squad-integration services use this method instead of
   * duplicating club ids, so promotion restrictions, finances and internal
   * player movement always refer to the same source of truth.
   */
  getParentReservePairs() {
    return Object.entries(RESERVE_PARENT_CLUB_BY_ID).map(([reserveClubId, parentClubId]) => ({
      reserveClubId,
      parentClubId
    }));
  },
  isReserveClub(clubId) {
    return Object.prototype.hasOwnProperty.call(RESERVE_PARENT_CLUB_BY_ID, clubId);
  },
  /**
   * Reports whether a club may act as a buyer in a club-to-club transaction.
   * Reserve teams return false because they may sell players and sign free
   * agents, but they are not allowed to purchase or loan players from clubs.
   * Source-specific parent/reserve validation belongs to canRecruitPlayerFrom.
   */
  canParticipateAsTransferBuyer(clubId) {
    return !this.isReserveClub(clubId);
  },
  /**
   * Central market-eligibility rule shared by permanent transfers, loans,
   * pre-contracts, scouting and final transfer execution.
   *
   * The order of these checks is intentional:
   * 1. Reserve teams may still sign free agents because no selling club is
   *    involved and this is their only permitted recruitment channel.
   * 2. A reserve team may never act as a buyer on the club-to-club market.
   * 3. A first team may not buy or loan a player from its own reserve team.
   *    Such a move belongs to the future internal squad-integration system
   *    and must not create a fee, negotiation or market transfer record.
   *
   * Players owned by a reserve team may still be sold to every unrelated
   * club. This preserves the rule that reserve teams can sell players even
   * though they cannot purchase players from other clubs.
   */
  canRecruitPlayerFrom(buyerClubId, sellerClubId) {
    if (sellerClubId === "FREE_AGENTS") return true;
    if (!this.canParticipateAsTransferBuyer(buyerClubId)) return false;
    return this.getParentClubId(sellerClubId) !== buyerClubId;
  },
  canEnterLeague(clubId, targetLeagueId, clubs, projectedLeagueByClubId) {
    const parentClubId = this.getParentClubId(clubId);
    if (!parentClubId) return true;
    if (targetLeagueId === "L_PL_1") return false;
    const parentLeagueId = getLeagueId(parentClubId, clubs, projectedLeagueByClubId);
    return PolishThirdLeagueService.getPolishTier(parentLeagueId) !== PolishThirdLeagueService.getPolishTier(targetLeagueId);
  },
  selectPromotionPlaces(standings, targetLeagueId, clubs, directPlaceCount = 2, playoffPlaceCount = 4, projectedLeagueByClubId) {
    const eligible = this.getEligibleCandidates(standings, targetLeagueId, clubs, projectedLeagueByClubId);
    return {
      direct: eligible.slice(0, directPlaceCount),
      playoffs: eligible.slice(directPlaceCount, directPlaceCount + playoffPlaceCount)
    };
  },
  getEligibleCandidates(standings, targetLeagueId, clubs, projectedLeagueByClubId) {
    return standings.map((club, index) => ({ club, tablePosition: index + 1 })).filter((candidate) => this.canEnterLeague(candidate.club.id, targetLeagueId, clubs, projectedLeagueByClubId));
  },
  findSameLeagueConflicts(clubs, projectedLeagueByClubId) {
    return Object.entries(RESERVE_PARENT_CLUB_BY_ID).flatMap(([reserveClubId, parentClubId]) => {
      const reserveLeagueId = getLeagueId(reserveClubId, clubs, projectedLeagueByClubId);
      const parentLeagueId = getLeagueId(parentClubId, clubs, projectedLeagueByClubId);
      const reserveTier = PolishThirdLeagueService.getPolishTier(reserveLeagueId);
      const parentTier = PolishThirdLeagueService.getPolishTier(parentLeagueId);
      if (!reserveLeagueId || reserveTier === null || reserveTier !== parentTier || reserveTier > 4) {
        return [];
      }
      return [{ reserveClubId, parentClubId, leagueId: reserveLeagueId }];
    });
  },
  resolvePlayoffWinner(result, targetLeagueId, clubs, excludedClubIds = /* @__PURE__ */ new Set(), projectedLeagueByClubId) {
    if (!result) return null;
    const loserId = result.winnerId === result.homeId ? result.awayId : result.homeId;
    return [result.winnerId, loserId].find(
      (clubId) => !excludedClubIds.has(clubId) && this.canEnterLeague(clubId, targetLeagueId, clubs, projectedLeagueByClubId)
    ) ?? null;
  }
};

// services/AiContractService.tsx
var _isTransferWindowOpen = (currentDate) => {
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const isSummer = month === 6 && day >= 1 || month === 7 || month === 8 && day <= 8;
  const isWinter = month === 0 && day >= 12 || month === 1 && day <= 13;
  return isSummer || isWinter;
};
var _getNextWindowStart = (currentDate) => {
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  if (month === 0 && day < 12) return new Date(year, 0, 12);
  if (month === 1 && day >= 14 || month >= 2 && month <= 5) return new Date(year, 6, 1);
  return new Date(year + 1, 0, 12);
};
var _hasActiveTransferLockout = (player, currentDate) => {
  return !!player.transferLockoutUntil && currentDate < new Date(player.transferLockoutUntil);
};
var _buildTransferLockoutUntil = (currentDate) => {
  const lockoutDate = new Date(currentDate);
  lockoutDate.setMonth(lockoutDate.getMonth() + 6);
  return lockoutDate.toISOString();
};
var _isProtectedNewSigning = (player, currentDate) => _hasActiveTransferLockout(player, currentDate);
var _buildTransferOfferBanUntil = (currentDate) => {
  const banDate = new Date(currentDate);
  banDate.setFullYear(banDate.getFullYear() + 1);
  return banDate.toISOString();
};
var GULF_STAR_HUNTER_COUNTRIES = /* @__PURE__ */ new Set(["KSA", "QAT", "UAE"]);
var BIG_CLUB_REPUTATION = 18;
var VETERAN_STAR_MIN_AGE = 33;
var GULF_STAR_EXCEPTION_MIN_AGE = 35;
var GULF_STAR_EXCEPTION_RARE_MIN_AGE = 30;
var VETERAN_STAR_MIN_OVR = 85;
var GULF_SHOWPIECE_STAR_MIN_REPUTATION = 80;
var GULF_MEGA_OFFER_ACCEPTANCE_CHANCE = 0.75;
var GULF_MEGA_OFFER_EUR_TO_PLN = 4.3;
var GULF_MEGA_OFFER_MIN_ANNUAL_EUR = 5e7;
var GULF_MEGA_OFFER_ELITE_REPUTATION = 97;
var GULF_MEGA_OFFER_ELITE_ANNUAL_EUR = 1e8;
var GULF_MEGA_OFFER_MAX_ANNUAL_EUR = 125e6;
var ELITE_PRE_CONTRACT_WATCHLIST_MIN_OVR = 90;
var ELITE_PRE_CONTRACT_WATCHLIST_MIN_REPUTATION = 17;
var MIN_SQUAD_POSITION_COUNTS = {
  ["GK" /* GK */]: 3,
  ["DEF" /* DEF */]: 8,
  ["MID" /* MID */]: 8,
  ["FWD" /* FWD */]: 4
};
var AI_MIN_SQUAD_SIZE = Object.values(MIN_SQUAD_POSITION_COUNTS).reduce((sum, count) => sum + count, 0);
var AI_TARGET_SQUAD_SIZE = 28;
var AI_MAX_SQUAD_SIZE = 32;
var AI_SCOUTING_REFRESH_DAYS = 90;
var AI_SOFT_MAX_POSITION_COUNTS = {
  ["GK" /* GK */]: 3,
  ["DEF" /* DEF */]: 9,
  ["MID" /* MID */]: 9,
  ["FWD" /* FWD */]: 6
};
var AI_SEASON_YOUTH_MAX_INTAKE = 4;
var AI_SEASON_YOUTH_ID_PREFIX = "AI_YOUTH_INTAKE";
var TRANSFER_LIST_CAP_MIN_SQUAD_SIZE = AI_TARGET_SQUAD_SIZE;
var TRANSFER_LIST_MAX_SHARE = 0.25;
var HIGH_REPUTATION_RELEASE_THRESHOLD = 80;
var HIGH_REPUTATION_RELEASE_CHANCE = 0.03;
var _hasActiveTransferOfferBan = (player, currentDate) => {
  return !!player.transferOfferBanUntil && currentDate < new Date(player.transferOfferBanUntil);
};
var _hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash << 5) - hash + value.charCodeAt(i) | 0;
  return Math.abs(hash);
};
var _seededRandom = (seed) => {
  const x = Math.sin(_hashString(seed) + 1) * 1e4;
  return x - Math.floor(x);
};
var _isGulfStarHunterClub = (club) => GULF_STAR_HUNTER_COUNTRIES.has(club.country || "") && club.reputation >= 8;
var _getGulfOwnerShortfallCover = (club, requiredCash) => {
  if (!_isGulfStarHunterClub(club)) return 0;
  return Math.max(0, Math.ceil(requiredCash - club.budget));
};
var _isVeteranStar = (player) => player.age >= VETERAN_STAR_MIN_AGE && player.overallRating >= VETERAN_STAR_MIN_OVR;
var _isGulfShowpieceStar = (player) => _getPlayerReputation(player) >= GULF_SHOWPIECE_STAR_MIN_REPUTATION;
var _getContractDaysLeft = (player, currentDate) => {
  if (!player.contractEndDate) return Number.POSITIVE_INFINITY;
  const endDate = new Date(player.contractEndDate);
  if (Number.isNaN(endDate.getTime())) return Number.POSITIVE_INFINITY;
  return Math.floor((endDate.getTime() - currentDate.getTime()) / 864e5);
};
var LAST_CONTRACT_YEAR_DAYS = 365;
var PRE_CONTRACT_PRIORITY_DAYS3 = 330;
var _isInLastContractYear = (player, currentDate) => {
  const daysLeft = _getContractDaysLeft(player, currentDate);
  return daysLeft > 0 && daysLeft <= LAST_CONTRACT_YEAR_DAYS;
};
var _isElitePreContractWatchlistPlayer = (player, currentDate) => {
  const daysLeft = _getContractDaysLeft(player, currentDate);
  return player.overallRating >= ELITE_PRE_CONTRACT_WATCHLIST_MIN_OVR && player.isNegotiationPermanentBlocked && daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS3;
};
var _getPreContractJoinDate = (player) => {
  const contractEnd = new Date(player.contractEndDate);
  if (Number.isNaN(contractEnd.getTime())) return player.contractEndDate;
  contractEnd.setDate(contractEnd.getDate() + 1);
  return contractEnd.toISOString();
};
var _shouldUsePreContractInsteadOfPaidTransfer = (player, currentDate, paidTransferEffectiveDate) => {
  const daysLeft = _getContractDaysLeft(player, currentDate);
  if (daysLeft <= 0) return false;
  if (daysLeft <= PRE_CONTRACT_PRIORITY_DAYS3) return true;
  if (!paidTransferEffectiveDate || !player.contractEndDate) return false;
  const contractEnd = new Date(player.contractEndDate);
  if (Number.isNaN(contractEnd.getTime())) return false;
  return contractEnd <= paidTransferEffectiveDate;
};
var _getTransferListPriority = (player, squad, currentDate) => {
  const positionCount = squad.filter((p) => p.position === player.position).length;
  const positionSurplus = Math.max(0, positionCount - MIN_SQUAD_POSITION_COUNTS[player.position]);
  const daysLeft = _getContractDaysLeft(player, currentDate);
  return (player.isNegotiationPermanentBlocked ? 140 : 0) + (player.transferListDemandUntil ? 90 : 0) + (daysLeft <= PRE_CONTRACT_PRIORITY_DAYS3 ? 55 : daysLeft <= 730 ? 24 : 0) + positionSurplus * 9 + (player.squadRole === "KEY_PLAYER" ? -120 : 0) + (player.isUntouchable ? -160 : 0) + (player.loan ? -100 : 0) + Math.max(0, 90 - player.overallRating) + Math.max(0, player.age - 28) * 2 - Math.max(0, (player.attributes?.talent ?? player.overallRating) - player.overallRating) * 2 - _getPlayerReputationScore(player) * 4;
};
var _getPreviousCareerClub = (player) => [...player.history || []].reverse().find((entry) => entry.clubId !== "FREE_AGENTS");
var _getInterestedClubs = (player, clubs) => {
  const clubMap = new Map(clubs.map((club) => [club.id, club]));
  return (player.interestedClubs || []).map((clubId) => clubMap.get(clubId)).filter((club) => !!club);
};
var _wasReleasedByBigClub = (player, clubMap) => {
  const previousClub = _getPreviousCareerClub(player);
  if (!previousClub) return false;
  const previousClubInfo = clubMap.get(previousClub.clubId);
  return (previousClubInfo?.reputation ?? 0) >= BIG_CLUB_REPUTATION;
};
var _isGulfMegaOfferTarget = (player, clubMap) => player.age >= GULF_STAR_EXCEPTION_RARE_MIN_AGE && (_isGulfShowpieceStar(player) || _isVeteranStar(player) && _wasReleasedByBigClub(player, clubMap));
var _getGulfMegaOfferAcceptanceChance = (player) => {
  if (player.age >= GULF_STAR_EXCEPTION_MIN_AGE) return GULF_MEGA_OFFER_ACCEPTANCE_CHANCE;
  if (player.age >= 32) return 0.18;
  return 0.06;
};
var _isExpiringBigClubVeteranStar = (player, sellerClub, currentDate) => {
  const daysLeft = Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5);
  return _isVeteranStar(player) && sellerClub.reputation >= BIG_CLUB_REPUTATION && daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS3;
};
var _getGulfMegaOfferSalaryFloor = (player, club) => {
  const reputation = _clamp(_getPlayerReputation(player), GULF_SHOWPIECE_STAR_MIN_REPUTATION, 100);
  const baseEliteFactor = _clamp(
    (reputation - GULF_SHOWPIECE_STAR_MIN_REPUTATION) / (GULF_MEGA_OFFER_ELITE_REPUTATION - GULF_SHOWPIECE_STAR_MIN_REPUTATION),
    0,
    1
  );
  const legendFactor = _clamp((reputation - GULF_MEGA_OFFER_ELITE_REPUTATION) / 3, 0, 1);
  const annualEuro = GULF_MEGA_OFFER_MIN_ANNUAL_EUR + (GULF_MEGA_OFFER_ELITE_ANNUAL_EUR - GULF_MEGA_OFFER_MIN_ANNUAL_EUR) * baseEliteFactor + (GULF_MEGA_OFFER_MAX_ANNUAL_EUR - GULF_MEGA_OFFER_ELITE_ANNUAL_EUR) * legendFactor;
  const countryMultiplier = club.country === "KSA" ? 1.12 : club.country === "QAT" ? 1.06 : 1;
  const clubAmbitionMultiplier = 1 + Math.max(0, club.reputation - 8) * 0.012;
  return Math.round(annualEuro * GULF_MEGA_OFFER_EUR_TO_PLN * countryMultiplier * clubAmbitionMultiplier / 1e6) * 1e6;
};
var _buildGulfStarOffer = (player, club, currentDate) => {
  const countryPremium = club.country === "KSA" ? 2.75 : club.country === "QAT" ? 2.35 : 2.05;
  const reputationPremium = 1 + Math.max(0, club.reputation - 8) * 0.08;
  const showpiecePremium = _isGulfShowpieceStar(player) ? 1 + (_getPlayerReputation(player) - GULF_SHOWPIECE_STAR_MIN_REPUTATION) * 0.025 : 1;
  const ageBonusPremium = player.age >= 36 ? 1.75 : player.age >= 34 ? 1.45 : 1.25;
  const salaryBase = Math.max(
    FinanceService.getFairMarketSalary(player.overallRating),
    _isGulfShowpieceStar(player) ? FinanceService.getFairMarketSalary(Math.max(player.overallRating, 90)) : 0,
    player.annualSalary || 0
  );
  const proposedSalary = Math.max(
    _getGulfMegaOfferSalaryFloor(player, club),
    Math.round(salaryBase * countryPremium * reputationPremium * showpiecePremium / 1e5) * 1e5
  );
  const proposedBonus = Math.max(
    Math.round(salaryBase * ageBonusPremium * countryPremium * showpiecePremium / 1e5) * 1e5,
    Math.round(proposedSalary * (_isGulfShowpieceStar(player) ? 1.15 : 0.45) / 1e5) * 1e5
  );
  const contractYears = player.age >= 36 ? 1 : 2;
  const newEndDate = new Date(currentDate.getFullYear() + contractYears, 5, 30).toISOString();
  return { proposedSalary, proposedBonus, contractYears, newEndDate };
};
var _getGulfMegaOfferPreviousClub = (player, clubMap) => {
  const previousClub = _getPreviousCareerClub(player);
  if (!previousClub) return null;
  return clubMap.get(previousClub.clubId) || null;
};
var _countByPosition = (squad) => ({
  ["GK" /* GK */]: squad.filter((p) => p.position === "GK" /* GK */).length,
  ["DEF" /* DEF */]: squad.filter((p) => p.position === "DEF" /* DEF */).length,
  ["MID" /* MID */]: squad.filter((p) => p.position === "MID" /* MID */).length,
  ["FWD" /* FWD */]: squad.filter((p) => p.position === "FWD" /* FWD */).length
});
var _hasCriticalDepthShortage = (squad) => {
  const counts = _countByPosition(squad);
  return squad.length < AI_MIN_SQUAD_SIZE || Object.keys(MIN_SQUAD_POSITION_COUNTS).some((pos) => counts[pos] < MIN_SQUAD_POSITION_COUNTS[pos]);
};
var _getAverageOverall = (squad) => squad.length > 0 ? squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length : 0;
var _getPositionAverageOverall = (squad, position) => {
  const samePosition = squad.filter((player) => player.position === position);
  return samePosition.length > 0 ? _getAverageOverall(samePosition) : _getAverageOverall(squad);
};
var _clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var _getPlayerReputation = (player) => player.reputacja ?? 50;
var _getPlayerReputationScore = (player) => _clamp((_getPlayerReputation(player) - 50) / 10, -3, 5);
var _canAiReleasePlayer = (player, club, currentDate, reason) => {
  if (_getPlayerReputation(player) < HIGH_REPUTATION_RELEASE_THRESHOLD) return true;
  return _seededRandom(
    `AI_HIGH_REP_RELEASE_${reason}_${club.id}_${player.id}_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}`
  ) < HIGH_REPUTATION_RELEASE_CHANCE;
};
var _getSquadReviewScore = (player) => player.overallRating - (player.age - 18) * 1.5 + _getPlayerReputationScore(player);
var _getRecruitmentReputationBonus = (player, strategy, need) => {
  const strategyMultiplier = strategy === 2 ? 1.15 : strategy === 1 ? 0.55 : strategy === 0 ? 0.45 : 0.75;
  const urgencyMultiplier = need?.urgency === "LOW" ? 0.65 : need?.urgency === "CRITICAL" ? 0.5 : 1;
  return _getPlayerReputationScore(player) * strategyMultiplier * urgencyMultiplier;
};
var _getTargetDepthCount = (position) => MIN_SQUAD_POSITION_COUNTS[position];
var _canAddBalancedDepth = (squad, position, cachedPositionCounts) => {
  const positionCount = cachedPositionCounts?.get(position) ?? _countByPosition(squad)[position];
  if (positionCount < MIN_SQUAD_POSITION_COUNTS[position]) return true;
  return positionCount < AI_SOFT_MAX_POSITION_COUNTS[position];
};
var _getAiSeasonalPositionLimit = (club, position, currentDate) => {
  if (position === "GK" /* GK */) return 3;
  const seasonYear = currentDate.getMonth() >= 6 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
  const roll = _seededRandom(`AI_POSITION_LIMIT_${club.id}_${position}_${seasonYear}`);
  if (position === "DEF" /* DEF */ || position === "MID" /* MID */) return roll < 0.45 ? 9 : 8;
  return roll < 0.55 ? 6 : 5;
};
var _shouldRunAiSurplusSelection = (club, position, surplus, currentDate) => {
  if (surplus <= 0) return false;
  if (surplus >= 2) return true;
  const monthKey = `${currentDate.getFullYear()}_${currentDate.getMonth() + 1}`;
  const chance = _clamp(0.5 + club.boardStrictness * 0.03 + surplus * 0.12, 0.45, 0.88);
  return _seededRandom(`AI_SURPLUS_SELECTION_${club.id}_${position}_${monthKey}`) < chance;
};
var _chooseAiSurplusExit = (player, club, currentDate) => {
  const rng = (_seededRandom(`AI_SURPLUS_EXIT_${club.id}_${player.id}_${currentDate.getFullYear()}_${currentDate.getMonth()}`) - 0.5) * 20;
  const talent = player.attributes?.talent || 50;
  const salaryPressure = player.annualSalary / Math.max(1, FinanceService.getFairMarketSalary(player.overallRating));
  const reputation = _getPlayerReputation(player);
  const loanScore = (player.age <= 21 ? 24 : player.age <= 23 ? 14 : player.age <= 25 ? 5 : -12) + (talent - 50) * 0.45 + (player.overallRating < 30 + club.reputation * 4.5 ? 8 : -4) + rng;
  const releaseScore = (player.age >= 32 ? 16 : player.age >= 29 ? 8 : -10) + (salaryPressure > 1.2 ? 14 : salaryPressure > 0.9 ? 6 : -4) + (reputation < 45 ? 8 : reputation > 70 ? -18 : 0) + (player.overallRating < 45 ? 10 : 0) - talent * 0.12 + rng;
  if (releaseScore >= 18) return "RELEASE";
  if (loanScore >= 16) return "LOAN";
  return "TRANSFER_LIST";
};
var _isQuantityDepthNeed = (need, squad, position, cachedPositionCounts) => {
  if (need.reason !== "SHORTAGE") return false;
  const positionCount = cachedPositionCounts?.get(position) ?? squad.filter((player) => player.position === position).length;
  return squad.length < AI_MIN_SQUAD_SIZE || positionCount < MIN_SQUAD_POSITION_COUNTS[position] || positionCount < _getTargetDepthCount(position);
};
var AI_YOUTH_COUNTRY_REGION = {
  POL: "POLAND" /* POLAND */,
  ENG: "ENGLAND" /* ENGLAND */,
  SCO: "ENGLAND" /* ENGLAND */,
  WAL: "ENGLAND" /* ENGLAND */,
  NIR: "ENGLAND" /* ENGLAND */,
  IRL: "ENGLAND" /* ENGLAND */,
  GER: "GERMANY" /* GERMANY */,
  AUT: "GERMANY" /* GERMANY */,
  SUI: "GERMANY" /* GERMANY */,
  LIE: "GERMANY" /* GERMANY */,
  LUX: "FRANCE" /* FRANCE */,
  ESP: "SPAIN" /* SPAIN */,
  AND: "IBERIA" /* IBERIA */,
  POR: "IBERIA" /* IBERIA */,
  GIB: "IBERIA" /* IBERIA */,
  FRA: "FRANCE" /* FRANCE */,
  ITA: "ITALY" /* ITALY */,
  SMR: "ITALY" /* ITALY */,
  NED: "BENELUX" /* BENELUX */,
  BEL: "BENELUX" /* BENELUX */,
  NOR: "SCANDINAVIA" /* SCANDINAVIA */,
  DEN: "SCANDINAVIA" /* SCANDINAVIA */,
  ISL: "SCANDINAVIA" /* SCANDINAVIA */,
  FRO: "SCANDINAVIA" /* SCANDINAVIA */,
  SWE: "SWEDEN" /* SWEDEN */,
  FIN: "FINLAND" /* FINLAND */,
  CZE: "CZ_SK" /* CZ_SK */,
  SVK: "CZ_SK" /* CZ_SK */,
  HUN: "HUNGARIAN" /* HUNGARIAN */,
  ROU: "ROMANIA" /* ROMANIA */,
  SRB: "BALKANS" /* BALKANS */,
  CRO: "BALKANS" /* BALKANS */,
  BIH: "BALKANS" /* BALKANS */,
  MKD: "BALKANS" /* BALKANS */,
  MNE: "BALKANS" /* BALKANS */,
  BUL: "BALKANS" /* BALKANS */,
  SVN: "BALKANS" /* BALKANS */,
  ALB: "ALBANIA" /* ALBANIA */,
  KOS: "ALBANIA" /* ALBANIA */,
  GRE: "GREEK" /* GREEK */,
  TUR: "TURKEY" /* TURKEY */,
  UKR: "EX_USSR" /* EX_USSR */,
  RUS: "EX_USSR" /* EX_USSR */,
  BLR: "EX_USSR" /* EX_USSR */,
  MDA: "EX_USSR" /* EX_USSR */,
  GEO: "GEORGIA" /* GEORGIA */,
  ARM: "ARMENIA" /* ARMENIA */,
  AZE: "AZERBAIJANI" /* AZERBAIJANI */,
  KAZ: "KAZAKH" /* KAZAKH */,
  LTU: "BALTIC" /* BALTIC */,
  LAT: "BALTIC" /* BALTIC */,
  EST: "BALTIC" /* BALTIC */,
  MLT: "MALTESE" /* MALTESE */,
  ISR: "ISRAELI" /* ISRAELI */,
  ARG: "ARGENTINA" /* ARGENTINA */,
  BRA: "BRAZIL" /* BRAZIL */,
  MEX: "MEXICO" /* MEXICO */,
  USA: "NORTH_AMERICA" /* NORTH_AMERICA */,
  CAN: "NORTH_AMERICA" /* NORTH_AMERICA */,
  JPN: "JAPAN" /* JAPAN */,
  KOR: "KOREA" /* KOREA */
};
var AI_YOUTH_FOREIGN_REGIONS = [
  "POLAND" /* POLAND */,
  "ENGLAND" /* ENGLAND */,
  "GERMANY" /* GERMANY */,
  "FRANCE" /* FRANCE */,
  "SPAIN" /* SPAIN */,
  "ITALY" /* ITALY */,
  "IBERIA" /* IBERIA */,
  "BENELUX" /* BENELUX */,
  "SCANDINAVIA" /* SCANDINAVIA */,
  "SWEDEN" /* SWEDEN */,
  "CZ_SK" /* CZ_SK */,
  "BALKANS" /* BALKANS */,
  "TURKEY" /* TURKEY */,
  "EX_USSR" /* EX_USSR */,
  "ROMANIA" /* ROMANIA */,
  "HUNGARIAN" /* HUNGARIAN */,
  "BRAZIL" /* BRAZIL */,
  "ARGENTINA" /* ARGENTINA */,
  "SSA" /* SSA */
];
var AI_YOUTH_TUNING_ATTRS = {
  ["GK" /* GK */]: ["goalkeeping", "positioning", "mentality", "strength", "stamina", "workRate"],
  ["DEF" /* DEF */]: ["defending", "heading", "strength", "positioning", "stamina", "mentality", "workRate"],
  ["MID" /* MID */]: ["passing", "vision", "technique", "stamina", "workRate", "dribbling", "mentality"],
  ["FWD" /* FWD */]: ["finishing", "attacking", "pace", "dribbling", "positioning", "technique", "mentality"]
};
var _buildAiYouthSeasonPrefix = (seasonYear, clubId) => `${AI_SEASON_YOUTH_ID_PREFIX}_${seasonYear}_${clubId}`;
var _getAiSeasonYouthIntakeCount = (squadSize, seed) => {
  const roll = _seededRandom(`${seed}_COUNT`);
  if (squadSize <= 20) return roll < 0.85 ? 4 : 3;
  if (squadSize <= 22) return roll < 0.7 ? 4 : 3;
  if (squadSize <= 24) return roll < 0.45 ? 4 : roll < 0.8 ? 3 : 2;
  if (squadSize <= 25) return roll < 0.25 ? 4 : roll < 0.6 ? 3 : roll < 0.88 ? 2 : 1;
  if (squadSize <= 27) return roll < 0.1 ? 3 : roll < 0.38 ? 2 : roll < 0.78 ? 1 : 0;
  if (squadSize <= 30) return roll < 0.1 ? 2 : roll < 0.35 ? 1 : 0;
  return roll < 0.08 ? 1 : 0;
};
var _pickAiYouthPosition = (squad, seed, slot) => {
  const positions = ["GK" /* GK */, "DEF" /* DEF */, "MID" /* MID */, "FWD" /* FWD */];
  const counts = _countByPosition(squad);
  const hardShortages = positions.map((position) => ({
    position,
    shortage: MIN_SQUAD_POSITION_COUNTS[position] - counts[position],
    roll: _seededRandom(`${seed}_HARD_${slot}_${position}`)
  })).filter((entry) => entry.shortage > 0).sort((a, b) => b.shortage - a.shortage || a.roll - b.roll);
  if (hardShortages.length > 0) return hardShortages[0].position;
  const depthShortages = positions.map((position) => ({
    position,
    shortage: _getTargetDepthCount(position) - counts[position],
    roll: _seededRandom(`${seed}_DEPTH_${slot}_${position}`)
  })).filter((entry) => entry.shortage > 0).sort((a, b) => b.shortage - a.shortage || a.roll - b.roll);
  if (depthShortages.length > 0) return depthShortages[0].position;
  const weightedPool = [
    "GK" /* GK */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "DEF" /* DEF */,
    "MID" /* MID */,
    "MID" /* MID */,
    "MID" /* MID */,
    "FWD" /* FWD */,
    "FWD" /* FWD */
  ].filter((position) => _canAddBalancedDepth(squad, position));
  if (weightedPool.length === 0) return "MID" /* MID */;
  return weightedPool[Math.floor(_seededRandom(`${seed}_FREE_${slot}`) * weightedPool.length)] ?? "MID" /* MID */;
};
var _pickAiYouthRegion = (club, seed, slot) => {
  const localRegion = AI_YOUTH_COUNTRY_REGION[club.country || ""] ?? "POLAND" /* POLAND */;
  const foreignRoll = _seededRandom(`${seed}_REGION_FOREIGN_${slot}`);
  if (foreignRoll >= 0.08) return localRegion;
  const foreignPool = AI_YOUTH_FOREIGN_REGIONS.filter((region) => region !== localRegion);
  return foreignPool[Math.floor(_seededRandom(`${seed}_REGION_POOL_${slot}`) * foreignPool.length)] ?? localRegion;
};
var _buildAiYouthContractEnd = (currentDate) => {
  const endDate = new Date(currentDate);
  endDate.setFullYear(endDate.getFullYear() + 3);
  endDate.setMonth(5, 30);
  return endDate.toISOString().split("T")[0];
};
var _roundAiYouthMoney = (value, step = 5e3) => Math.max(step, Math.round(value / step) * step);
var _emptyAiYouthStats = () => ({
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
var _tuneAiYouthAttributesToOverall = (attributes, position, targetOverall) => {
  let tuned = { ...attributes };
  let currentOverall = PlayerAttributesGenerator.calculateOverall(tuned, position);
  const tunedKeys = AI_YOUTH_TUNING_ATTRS[position];
  for (let attempt = 0; attempt < 8 && Math.abs(currentOverall - targetOverall) > 1; attempt++) {
    const diff = targetOverall - currentOverall;
    const step = diff > 0 ? Math.min(3, diff) : Math.max(-3, diff);
    tuned = tunedKeys.reduce((next, key) => ({
      ...next,
      [key]: _clamp((next[key] || 1) + step, 1, 99)
    }), tuned);
    currentOverall = PlayerAttributesGenerator.calculateOverall(tuned, position);
  }
  return { attributes: tuned, overall: currentOverall };
};
var _getAiDeadlineYouthOverallRange = (club) => {
  if (club.reputation >= 17) return { minDelta: -1, maxDelta: 6 };
  if (club.reputation >= 14) return { minDelta: -3, maxDelta: 6 };
  if (club.reputation >= 10) return { minDelta: -4, maxDelta: 6 };
  if (club.reputation >= 7) return { minDelta: -5, maxDelta: 6 };
  return { minDelta: -6, maxDelta: 6 };
};
var _getContractYearsLeft = (player, currentDate) => {
  const daysLeft = _getContractDaysLeft(player, currentDate);
  if (!Number.isFinite(daysLeft) || daysLeft <= 0) return 0;
  return Math.max(daysLeft / 365, 0);
};
var _isAiDeadlineOutgoingRisk = (player, currentDate) => {
  if (player.loan || _isProtectedNewSigning(player, currentDate)) return false;
  if (player.transferPendingClubId) return true;
  return !!(player.isOnTransferList || player.isAvailableForLoan || player.transferListDemandUntil);
};
var _getAiDeadlineExtraSlots = (club, riskyOutgoingCount, seasonYear) => {
  if (riskyOutgoingCount <= 0) return 0;
  const roll = _seededRandom(`AI_DEADLINE_EXTRA_SLOTS_${club.id}_${seasonYear}_${riskyOutgoingCount}`);
  return roll < 0.55 ? 2 : 3;
};
var _getAiDeadlineRiskNeeds = (squad, riskyOutgoing) => {
  if (riskyOutgoing.length === 0) return [];
  const positions = ["GK" /* GK */, "DEF" /* DEF */, "MID" /* MID */, "FWD" /* FWD */];
  return positions.filter((position) => {
    const currentCount = squad.filter((player) => player.position === position).length;
    const riskCount = riskyOutgoing.filter((player) => player.position === position).length;
    if (riskCount === 0) return false;
    return currentCount - riskCount < MIN_SQUAD_POSITION_COUNTS[position];
  }).map((position) => ({
    position,
    urgency: "HIGH",
    reason: "SHORTAGE",
    starterRequired: false
  }));
};
var _isAiDeadlineReleaseCandidate = (player, club, squad, currentDate, createdIds) => {
  if (createdIds.has(player.id)) return false;
  if (player.loan || player.isUntouchable || player.squadRole === "KEY_PLAYER") return false;
  if (player.transferPendingClubId || _isProtectedNewSigning(player, currentDate)) return false;
  const isQualityProblem = _isSquadLevelOutlier(player, club, squad, currentDate) || _isBelowAiMarketQualityFloor(player, club, squad, player.position) || player.overallRating < _getPositionAverageOverall(squad, player.position) - 8;
  return isQualityProblem;
};
var _releaseAiPlayerToFreeAgents = (player, club, currentDate) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const updatedHistory = PlayerCareerService.movePlayer(
    player,
    { clubName: "BEZ KLUBU", clubId: "FREE_AGENTS" },
    currentYear,
    currentMonth,
    { clubName: club.name, clubId: club.id }
  );
  return {
    ...PlayerCareerService.resetClubStatsForNewEntry(player),
    clubId: "FREE_AGENTS",
    annualSalary: 0,
    contractEndDate: "",
    marketValue: 0,
    negotiationStep: 0,
    isNegotiationPermanentBlocked: false,
    isOnTransferList: false,
    isAvailableForLoan: false,
    interestedClubs: [],
    transferPendingClubId: void 0,
    transferReportDate: void 0,
    transferPendingFee: void 0,
    transferPendingSalary: void 0,
    transferPendingBonus: void 0,
    transferPendingContractYears: void 0,
    history: updatedHistory
  };
};
var _buildAiSeasonYouthPlayer = (club, squad, position, currentDate, seasonYear, slot, options = {}) => {
  const seed = `${seasonYear}_${club.id}_${slot}`;
  const averageOverall = Math.round(_getAverageOverall(squad) || 30 + club.reputation * 3.5);
  const deadlineRange = _getAiDeadlineYouthOverallRange(club);
  const targetOverall = options.deadlineFallback ? _clamp(
    averageOverall + deadlineRange.minDelta + Math.floor(_seededRandom(`${seed}_DEADLINE_OVR`) * (deadlineRange.maxDelta - deadlineRange.minDelta + 1)),
    35,
    99
  ) : _clamp(
    averageOverall - 3 + Math.floor(_seededRandom(`${seed}_OVR`) * 7),
    35,
    99
  );
  const age = options.deadlineFallback ? 18 + Math.floor(_seededRandom(`${seed}_DEADLINE_AGE`) * 2) : 17 + Math.floor(_seededRandom(`${seed}_AGE`) * 4);
  const tier = FinanceService.getClubTier(club);
  const region = _pickAiYouthRegion(club, seed, slot);
  const name = NameGeneratorService.getRandomName(region);
  const generated = PlayerAttributesGenerator.generateAttributes(
    position,
    tier,
    club.reputation,
    age,
    club.country !== "POL",
    {
      minBase: _clamp(targetOverall - 4, 1, 99),
      maxBase: _clamp(targetOverall + 4, 1, 99),
      hardCap: 99
    }
  );
  const tuned = _tuneAiYouthAttributesToOverall(generated.attributes, position, targetOverall);
  const overallRating = options.deadlineFallback ? _clamp(tuned.overall, Math.max(35, averageOverall + deadlineRange.minDelta), Math.min(99, averageOverall + deadlineRange.maxDelta)) : _clamp(tuned.overall, Math.max(35, averageOverall - 3), Math.min(99, averageOverall + 3));
  const salaryBase = FinanceService.getFairMarketSalary(overallRating);
  const salaryMultiplier = 0.16 + _clamp(club.reputation / 20, 0, 1) * 0.14 + _seededRandom(`${seed}_SALARY`) * 0.08;
  const annualSalary = _roundAiYouthMoney(Math.max(2e4, salaryBase * salaryMultiplier));
  const newPlayer = {
    id: `${_buildAiYouthSeasonPrefix(seasonYear, club.id)}_${slot}`,
    firstName: name.firstName,
    lastName: name.lastName,
    age,
    clubId: club.id,
    nationality: region,
    nationalityCountry: pickNationalityForRegion(region),
    position,
    overallRating,
    attributes: {
      ...tuned.attributes,
      talent: _clamp(Math.max(tuned.attributes.talent || 1, overallRating + 8 + Math.floor(_seededRandom(`${seed}_TALENT`) * 14)), 1, 99)
    },
    stats: _emptyAiYouthStats(),
    cupStats: _emptyAiYouthStats(),
    euroStats: _emptyAiYouthStats(),
    nationalStats: _emptyAiYouthStats(),
    health: { status: "HEALTHY" /* HEALTHY */ },
    condition: 100,
    suspensionMatches: 0,
    contractEndDate: _buildAiYouthContractEnd(currentDate),
    annualSalary,
    isOnTransferList: false,
    isAvailableForLoan: false,
    marketValue: 0,
    history: [{
      clubName: club.name,
      clubId: club.id,
      fromYear: currentDate.getFullYear(),
      fromMonth: currentDate.getMonth() + 1,
      toYear: null,
      toMonth: null
    }],
    boardLockoutUntil: null,
    isUntouchable: false,
    negotiationStep: 0,
    negotiationLockoutUntil: null,
    contractLockoutUntil: null,
    moraleDemandLockoutUntil: PlayerMoraleService.getMoraleDemandLockoutUntil(currentDate),
    fatigueDebt: 0,
    reputacja: PlayerPrestigeService.calculateGeneratedReputation(overallRating, club.reputation),
    lojalnosc: 45 + Math.floor(_seededRandom(`${seed}_LOYALTY`) * 55),
    isNegotiationPermanentBlocked: false,
    transferLockoutUntil: null,
    freeAgentLockoutUntil: null,
    freeAgentClubLockouts: {}
  };
  return {
    ...newPlayer,
    marketValue: FinanceService.calculateMarketValue(newPlayer, club.reputation, tier, club.country)
  };
};
var _shuffleMarketOrder = (items, seed, getId) => [...items].map((item, index) => ({
  item,
  roll: _seededRandom(`${seed}_${getId(item, index)}_${index}`)
})).sort((a, b) => a.roll - b.roll).map((entry) => entry.item);
var _getScoutingProfile = (club, hasCriticalShortage = false) => {
  const reputationFactor = _clamp((club.reputation - 1) / 19, 0, 1);
  return {
    discoveryShare: _clamp(0.28 + reputationFactor * 0.34 + (hasCriticalShortage ? 0.14 : 0), 0.28, 0.8),
    maxPool: Math.round(6 + reputationFactor * 18 + (hasCriticalShortage ? 4 : 0)),
    noise: _clamp(12 - reputationFactor * 8 - (hasCriticalShortage ? 2 : 0), 2, 12),
    qualityBand: _clamp((hasCriticalShortage ? 18 : 14) - reputationFactor * 9, 5, 18)
  };
};
var _computeDiscoveredPool = (players, seed, scorePlayer, options = {}) => {
  if (players.length === 0) return [];
  const discoveryShare = options.discoveryShare ?? 0.4;
  const maxPool = options.maxPool ?? 10;
  const noise = options.noise ?? 5;
  const qualityBand = options.qualityBand ?? Number.POSITIVE_INFINITY;
  const scored = players.map((player, index) => {
    const score = scorePlayer(player);
    const roll = _seededRandom(`${seed}_SCAN_${player.id}_${index}`);
    return {
      player,
      score,
      discoveryScore: score + (roll - 0.5) * noise
    };
  });
  const bestScore = scored.reduce((best, entry) => Math.max(best, entry.score), Number.NEGATIVE_INFINITY);
  const discovered = scored.filter((entry) => entry.score >= bestScore - qualityBand).sort((a, b) => b.discoveryScore - a.discoveryScore);
  const visibleCount = Math.min(
    discovered.length,
    Math.max(1, Math.min(maxPool, Math.ceil(discovered.length * discoveryShare)))
  );
  return discovered.slice(0, visibleCount).sort((a, b) => b.score - a.score);
};
var _pickDiscoveredMarketPlayer = (players, seed, scorePlayer, options = {}) => {
  const visible = _computeDiscoveredPool(players, seed, scorePlayer, options);
  if (visible.length === 0) return null;
  const pickRoll = _seededRandom(`${seed}_PICK`);
  const pickIndex = Math.min(visible.length - 1, Math.floor(Math.pow(pickRoll, 1.35) * visible.length));
  return visible[pickIndex]?.player ?? null;
};
var _buildAiMarketSquadSnapshot = (squad) => {
  const positionTotals = /* @__PURE__ */ new Map();
  const positionCounts = /* @__PURE__ */ new Map();
  const weakestByPosition = /* @__PURE__ */ new Map();
  squad.forEach((player) => {
    positionTotals.set(player.position, (positionTotals.get(player.position) ?? 0) + player.overallRating);
    positionCounts.set(player.position, (positionCounts.get(player.position) ?? 0) + 1);
    const weakest = weakestByPosition.get(player.position);
    if (!weakest || player.overallRating < weakest.overallRating) {
      weakestByPosition.set(player.position, player);
    }
  });
  const positionAverages = /* @__PURE__ */ new Map();
  positionTotals.forEach((total, position) => {
    positionAverages.set(position, total / Math.max(1, positionCounts.get(position) ?? 0));
  });
  const sortedRatings = squad.map((player) => player.overallRating).sort((a, b) => b - a);
  const coreSize = Math.min(Math.max(11, Math.ceil(squad.length * 0.55)), squad.length);
  const coreAverage = coreSize > 0 ? sortedRatings.slice(0, coreSize).reduce((sum, rating) => sum + rating, 0) / coreSize : 0;
  return { coreAverage, positionAverages, positionCounts, weakestByPosition };
};
var _buildFreeAgentCandidates = (pool, club, squad, needsFA, aiStrategy, minCounts, idealOvr, currentDate) => {
  const marketSnapshot = _buildAiMarketSquadSnapshot(squad);
  return pool.filter((fa) => {
    if (fa.transferPendingClubId) return false;
    const needFA = needsFA.find((n) => n.position === fa.position);
    if (!needFA) return false;
    if (!PrestigeTransferGuardService.shouldConsiderDestination(fa, club)) return false;
    if (_isBelowAiMarketQualityFloor(fa, club, squad, needFA, marketSnapshot)) return false;
    const isQuantityNeed = _isQuantityDepthNeed(needFA, squad, fa.position);
    const faMinOvr = isQuantityNeed ? 45 : needFA.urgency === "CRITICAL" ? idealOvr - 16 : idealOvr - 12;
    const faMaxOvr = isQuantityNeed ? Math.max(idealOvr + 12, 99) : idealOvr + 7;
    if (fa.overallRating > faMaxOvr || fa.overallRating < faMinOvr) return false;
    if (fa.aiNegotiationClubId) return false;
    if (FreeAgentNegotiationService.isClubLockedOut(fa, club.id, currentDate)) return false;
    const positionCount = marketSnapshot.positionCounts.get(fa.position) ?? 0;
    const weakestExisting = marketSnapshot.weakestByPosition.get(fa.position);
    const hasShortage = positionCount < minCounts[fa.position];
    const needsSquadBody = (isQuantityNeed || squad.length < AI_MIN_SQUAD_SIZE) && _canAddBalancedDepth(squad, fa.position);
    const isUpgrade = !!weakestExisting && fa.overallRating >= weakestExisting.overallRating + 2;
    return hasShortage || needsSquadBody || isUpgrade && _canAddBalancedDepth(squad, fa.position);
  }).sort((a, b) => {
    const needA = needsFA.find((n) => n.position === a.position);
    const needB = needsFA.find((n) => n.position === b.position);
    const scoreA = AiClubTransferStrategyService.candidateScore(a, club, aiStrategy, { needUrgency: needA?.urgency }) + _getRecruitmentReputationBonus(a, 3, needA);
    const scoreB = AiClubTransferStrategyService.candidateScore(b, club, aiStrategy, { needUrgency: needB?.urgency }) + _getRecruitmentReputationBonus(b, 3, needB);
    return scoreB - scoreA || a.age - b.age;
  });
};
var _protectPendingTransferPlayerFromMarket = (player) => {
  if (!player.transferPendingClubId) return player;
  if ((player.interestedClubs?.length ?? 0) === 0 && !player.aiNegotiationClubId && !player.aiNegotiationResponseDate && !player.isOnTransferList && !player.isAvailableForLoan) return player;
  return {
    ...player,
    interestedClubs: [],
    aiNegotiationClubId: void 0,
    aiNegotiationResponseDate: void 0,
    isOnTransferList: false,
    transferListPrice: void 0,
    isAvailableForLoan: false
  };
};
var _buildInterestedPlayerTargets = (pool, club, squad, needsITMap, idealOvr, isGulfStarHunter, windowOpen, currentDate, sellerClubMap, options = {}) => {
  const marketSnapshot = _buildAiMarketSquadSnapshot(squad);
  const positionContexts = /* @__PURE__ */ new Map();
  needsITMap.forEach((need) => {
    const position = need.position;
    const isQuantityNeed = _isQuantityDepthNeed(
      need,
      squad,
      position,
      marketSnapshot.positionCounts
    );
    const ovrCap = Math.min(idealOvr, 95);
    positionContexts.set(position, {
      need,
      qualityFloor: _getAiMarketQualityFloor(club, squad, position, need, marketSnapshot),
      canAddBalancedDepth: _canAddBalancedDepth(squad, position, marketSnapshot.positionCounts),
      buyerPositionAverage: marketSnapshot.positionAverages.get(position) ?? 0,
      isQuantityNeed,
      low: isQuantityNeed ? 45 : need.urgency === "CRITICAL" ? ovrCap - 14 : ovrCap - 8,
      openMarketHigh: isQuantityNeed ? Math.max(ovrCap + 12, 99) : ovrCap + 8,
      shortlistedHigh: isQuantityNeed ? Math.max(ovrCap + 12, 99) : ovrCap + 12
    });
  });
  const targets = [];
  for (const { player: p, sourceClubId } of pool) {
    if (sourceClubId === club.id) continue;
    if (options.newlyPendingPlayerIds?.has(p.id)) continue;
    if (!options.prevalidatedForDate && p.loan) continue;
    if (!ReserveTeamLeagueService.canRecruitPlayerFrom(club.id, p.clubId || "FREE_AGENTS")) continue;
    if (!options.prevalidatedForDate) {
      if (_hasActiveTransferLockout(p, currentDate)) continue;
      if (_hasActiveTransferOfferBan(p, currentDate)) continue;
      if (p.isOnTransferList || p.transferPendingClubId) continue;
      const paidTransferEffectiveDate = windowOpen ? currentDate : _getNextWindowStart(currentDate);
      if (_shouldUsePreContractInsteadOfPaidTransfer(p, currentDate, paidTransferEffectiveDate)) continue;
    }
    const prestigeRoll = Math.random();
    const sellerClub = sellerClubMap.get(p.clubId || "");
    const isGulfVeteranStarTarget = !!sellerClub && isGulfStarHunter && _isExpiringBigClubVeteranStar(p, sellerClub, currentDate);
    const isShortlisted = (p.interestedClubs || []).includes(club.id);
    const context = positionContexts.get(p.position);
    const passesNormalMarketRules = !!context && p.overallRating >= context.qualityFloor && (context.canAddBalancedDepth || context.need.reason === "SHORTAGE") && (isShortlisted || context.isQuantityNeed || p.overallRating >= context.buyerPositionAverage + (context.need.starterRequired ? 2 : 3) || club.reputation >= (sellerClub?.reputation ?? 0) + 2 && p.overallRating >= context.buyerPositionAverage + 1) && p.overallRating >= context.low && p.overallRating <= (isShortlisted ? context.shortlistedHigh : context.openMarketHigh);
    if (!isGulfVeteranStarTarget && !passesNormalMarketRules) continue;
    if (PrestigeTransferGuardService.shouldConsiderDestination(p, club, 0, prestigeRoll)) {
      targets.push(p);
    }
  }
  return targets;
};
var _roundContractMoney = (value) => Math.max(5e4, Math.round(value / 1e4) * 1e4);
var _buildAiTransferContractOffer = (player, sellerClub, buyerClub, sellerSquad, buyerSquad, currentDate, need) => {
  const plan = TransferPlayerDecisionService.buildNegotiationPlan(
    player,
    sellerClub,
    buyerClub,
    sellerSquad,
    buyerSquad,
    currentDate
  );
  if (!plan.willingToTalk) return null;
  const reputationFactor = _clamp((buyerClub.reputation - 1) / 19, 0, 1);
  const urgencyPremium = need?.urgency === "CRITICAL" ? 0.07 : need?.urgency === "HIGH" ? 0.04 : need?.urgency === "MEDIUM" ? 0.02 : 0;
  const starPremium = player.overallRating >= 85 ? 0.04 : player.overallRating >= 78 ? 0.02 : 0;
  const salaryPremium = 1 + reputationFactor * 0.08 + urgencyPremium + starPremium;
  const bonusPremium = 1 + reputationFactor * 0.12 + urgencyPremium + starPremium;
  return {
    salary: _roundContractMoney(Math.max(
      FinanceService.getFairMarketSalary(player.overallRating),
      plan.desiredSalary * salaryPremium
    )),
    bonus: _roundContractMoney(plan.desiredBonus * bonusPremium),
    years: plan.desiredYears
  };
};
var _getAiTransferSpendingPower = (club) => Math.max(club.budget || 0, club.transferBudget || 0);
var _getCoreSquadAverageOverall = (squad) => {
  if (squad.length === 0) return 0;
  const coreSize = Math.min(Math.max(11, Math.ceil(squad.length * 0.55)), squad.length);
  return _getAverageOverall([...squad].sort((a, b) => b.overallRating - a.overallRating).slice(0, coreSize));
};
var _getAiMarketQualityFloor = (club, squad, position, need, snapshot) => {
  if (squad.length === 0) return 35;
  const coreAverage = snapshot?.coreAverage ?? _getCoreSquadAverageOverall(squad);
  const positionAverage = snapshot?.positionAverages.get(position) ?? _getPositionAverageOverall(squad, position);
  const referenceAverage = Math.max(coreAverage, positionAverage || coreAverage);
  const isQuantityNeed = need ? _isQuantityDepthNeed(need, squad, position, snapshot?.positionCounts) : false;
  const tolerance = club.reputation >= 18 ? isQuantityNeed ? 8 : 6 : club.reputation >= 15 ? isQuantityNeed ? 10 : 8 : club.reputation >= 12 ? isQuantityNeed ? 12 : 10 : club.reputation >= 8 ? isQuantityNeed ? 14 : 12 : 16;
  return Math.max(35, Math.floor(referenceAverage - tolerance));
};
var _isBelowAiMarketQualityFloor = (player, club, squad, need, snapshot) => player.overallRating < _getAiMarketQualityFloor(club, squad, player.position, need, snapshot);
var _getAiSquadOutlierFloor = (club, squad) => {
  if (squad.length < 11) return 0;
  const coreAverage = _getCoreSquadAverageOverall(squad);
  const tolerance = club.reputation >= 18 ? 13 : club.reputation >= 15 ? 15 : club.reputation >= 12 ? 17 : club.reputation >= 8 ? 19 : 22;
  return Math.max(30, Math.floor(coreAverage - tolerance));
};
var _isSquadLevelOutlier = (player, club, squad, currentDate) => {
  if (player.isUntouchable || player.squadRole === "KEY_PLAYER" || player.loan || player.transferPendingClubId) return false;
  if (_isProtectedNewSigning(player, currentDate)) return false;
  const floor = _getAiSquadOutlierFloor(club, squad);
  if (floor <= 0 || player.overallRating >= floor) return false;
  const talent = player.attributes?.talent ?? player.overallRating;
  const isDevelopableDepth = player.age <= 19 && talent >= floor + 4 && player.overallRating >= floor - 4;
  return !isDevelopableDepth;
};
var _chargeAiTransferFee = (club, fee) => ({
  ...club,
  budget: Math.max(0, (club.budget || 0) - fee),
  transferBudget: Math.max(0, (club.transferBudget || 0) - fee)
});
var _hashToUnit = (seed) => _seededRandom(seed);
var _getCoachCoreAssessment = (coach) => {
  const experience = coach?.attributes.experience ?? 50;
  const decisionMaking = coach?.attributes.decisionMaking ?? 50;
  return {
    experience,
    decisionMaking,
    quality: _clamp((experience * 0.55 + decisionMaking * 0.45) / 100, 0.15, 0.98)
  };
};
var _getCoreSquadSize = (club, squadSize, seed) => {
  if (squadSize <= 0) return 0;
  const reputationScore = _clamp((club.reputation - 1) / 17, 0, 1);
  const expected = Math.round(3 + reputationScore * 8);
  const variance = Math.floor(_hashToUnit(`${seed}_CORE_SIZE`) * 3) - 1;
  const maxBySquadSize = Math.max(1, Math.floor(squadSize * 0.4));
  const upperLimit = Math.min(11, Math.max(3, maxBySquadSize));
  return _clamp(expected + variance, Math.min(3, upperLimit), upperLimit);
};
var _getAgeProfileBonus = (player) => {
  if (player.age <= 20) return 2;
  if (player.age <= 24) return 3.5;
  if (player.age <= 29) return 4;
  if (player.age <= 32) return 2;
  if (player.age <= 35) return -1.5;
  return -4;
};
var _getRecentFormBonus = (player) => {
  const ratings = [
    ...player.stats?.ratingHistory || [],
    ...player.cupStats?.ratingHistory || [],
    ...player.euroStats?.ratingHistory || []
  ].slice(-6);
  if (ratings.length === 0) return 0;
  const average2 = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return _clamp((average2 - 6.7) * 2, -3, 4);
};
var _getCoreContractBonus = (player, currentDate) => {
  const daysLeft = player.contractEndDate ? Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5) : 0;
  if (player.isNegotiationPermanentBlocked && daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS3) return -8;
  if (daysLeft > 730) return 2;
  if (daysLeft > PRE_CONTRACT_PRIORITY_DAYS3) return 0.8;
  if (daysLeft > 180) return -1;
  if (daysLeft > 0) return -3;
  return -6;
};
var _getPositionScarcityBonus = (player, squad) => {
  const samePosition = squad.filter((candidate) => candidate.position === player.position && candidate.id !== player.id).sort((a, b) => b.overallRating - a.overallRating);
  const minimumDepth = MIN_SQUAD_POSITION_COUNTS[player.position];
  if (samePosition.length < minimumDepth) return 5;
  const bestReplacement = samePosition[0];
  if (!bestReplacement) return 5;
  return _clamp((player.overallRating - bestReplacement.overallRating) * 0.45, -2, 5.5);
};
var _scoreCorePlayer = (player, squad, club, coach, currentDate, seed) => {
  const coachAssessment = _getCoachCoreAssessment(coach);
  const perceptionNoiseRange = 0.18 - coachAssessment.quality * 0.13;
  const noise = (_hashToUnit(`${seed}_${player.id}_CORE_SCORE`) * 2 - 1) * perceptionNoiseRange;
  const perceivedOverall = player.overallRating * (1 + noise);
  const talentGap = Math.max(0, player.attributes.talent - player.overallRating);
  const leadershipBonus = (player.attributes.leadership + player.attributes.mentality + player.attributes.workRate) / 100;
  const salaryPressure = player.annualSalary > 0 ? player.annualSalary / Math.max(1, FinanceService.getFairMarketSalary(Math.max(1, player.overallRating))) : 1;
  const continuityBonus = player.isUntouchable ? 4.5 : player.squadRole === "KEY_PLAYER" ? 2.5 : 0;
  const starterBonus = player.squadRole === "STARTER" ? 1.5 : 0;
  const salaryPenalty = salaryPressure > 1.65 && player.overallRating < _getAverageOverall(squad) + 2 ? (salaryPressure - 1.65) * 3 : 0;
  return perceivedOverall * 0.62 + player.attributes.talent * 0.16 + talentGap * 0.28 + _getPositionScarcityBonus(player, squad) + _getAgeProfileBonus(player) + _getRecentFormBonus(player) + _getCoreContractBonus(player, currentDate) + _getPlayerReputationScore(player) * 0.8 + leadershipBonus + continuityBonus + starterBonus - salaryPenalty + club.reputation * 0.08;
};
var _selectCorePlayerIds = (club, squad, coach, currentDate, sessionSeed) => {
  if (squad.length === 0) return [];
  const seed = `${sessionSeed}_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}_${club.id}`;
  const coreSize = _getCoreSquadSize(club, squad.length, seed);
  const eligible = squad.filter(
    (player) => !player.transferPendingClubId && player.clubId !== "FREE_AGENTS"
  );
  return eligible.map((player) => ({
    player,
    score: _scoreCorePlayer(player, squad, club, coach, currentDate, seed)
  })).sort((a, b) => b.score - a.score).slice(0, coreSize).map((entry) => entry.player.id);
};
var _getCombinedMatches = (player) => (player.stats?.matchesPlayed || 0) + (player.cupStats?.matchesPlayed || 0) + (player.euroStats?.matchesPlayed || 0);
var _getCombinedMinutes = (player) => (player.stats?.minutesPlayed || 0) + (player.cupStats?.minutesPlayed || 0) + (player.euroStats?.minutesPlayed || 0);
var _shouldAiTryRenewContract = (player, squad, club, currentDate, daysLeft) => {
  if (player.loan) return false;
  if (player.transferPendingClubId) return false;
  if (player.isOnTransferList && !player.isUntouchable) return false;
  const squadAverage = _getAverageOverall(squad);
  const positionAverage = _getPositionAverageOverall(squad, player.position);
  const matches = _getCombinedMatches(player);
  const minutes = _getCombinedMinutes(player);
  const isImportantRole = player.squadRole === "KEY_PLAYER" || player.squadRole === "STARTER" || player.isUntouchable;
  const strongForSquad = player.overallRating >= squadAverage + 2 || player.overallRating >= positionAverage + 3;
  const youngUpside = player.age <= 23 && player.attributes.talent >= player.overallRating + 8;
  const usefulVeteran = player.age >= 32 && player.age <= 35 && player.overallRating >= squadAverage + 2 && matches >= 8;
  const fadingVeteran = player.age >= 35 && player.overallRating < squadAverage + 2;
  const unusedFringe = !isImportantRole && matches < 6 && minutes < 450 && player.overallRating < positionAverage;
  const tooExpensiveForRole = player.annualSalary > FinanceService.getFairMarketSalary(Math.max(1, player.overallRating + 4)) && !strongForSquad;
  if (fadingVeteran || unusedFringe || tooExpensiveForRole) return false;
  if (isImportantRole || strongForSquad || youngUpside || usefulVeteran) return true;
  const squadSize = squad.length;
  const positionCount = squad.filter((candidate) => candidate.position === player.position).length;
  if (positionCount <= MIN_SQUAD_POSITION_COUNTS[player.position]) return true;
  const monthKey = `${currentDate.getFullYear()}_${currentDate.getMonth()}`;
  const conservativeClub = club.reputation <= 7 && squadSize < AI_TARGET_SQUAD_SIZE;
  const depthChance = squadSize < AI_MIN_SQUAD_SIZE ? 0.75 : conservativeClub ? 0.55 : 0.25;
  return daysLeft <= PRE_CONTRACT_PRIORITY_DAYS3 && _seededRandom(`AI_RENEW_DEPTH_${club.id}_${player.id}_${monthKey}`) < depthChance;
};
var _buildAiPreContractOffer = (player, sellerClub, buyerClub, currentDate, isEliteWatchlistOpportunity = false) => {
  const repDelta = buyerClub.reputation - sellerClub.reputation;
  const salaryMultiplier = isEliteWatchlistOpportunity ? repDelta >= 2 ? 1.42 : repDelta >= 0 ? 1.32 : 1.55 : repDelta >= 3 ? 1.24 : repDelta >= 1 ? 1.14 : repDelta === 0 ? 1.08 : 1.32;
  const rawSalary = Math.max(
    FinanceService.getFairMarketSalary(player.overallRating),
    Math.round((player.annualSalary || FinanceService.getFairMarketSalary(player.overallRating)) * salaryMultiplier / 1e4) * 1e4
  );
  const salaryCeiling = FinanceService.calculatePolishLeagueSalaryCeiling(
    FinanceService.getClubTier(buyerClub),
    buyerClub.reputation
  );
  const salary = salaryCeiling ? Math.min(rawSalary, salaryCeiling) : rawSalary;
  const bonusBase = salaryCeiling ? Math.min(player.annualSalary || salary, salary) : player.annualSalary || salary;
  const bonusMultiplier = isEliteWatchlistOpportunity ? player.age < 24 ? 0.75 : player.age <= 30 ? 1.05 : player.age <= 34 ? 1.25 : 1.45 : player.age < 24 ? 0.35 : player.age <= 30 ? 0.55 : player.age <= 34 ? 0.8 : 1.05;
  const bonus = Math.round(bonusBase * bonusMultiplier / 1e4) * 1e4;
  const years = player.age <= 27 ? 4 : player.age <= 31 ? 3 : player.age <= 34 ? 2 : 1;
  return { salary, bonus, years };
};
var _findWeakestSurplusPlayer = (squad, skippedIds = /* @__PURE__ */ new Set(), currentDate = /* @__PURE__ */ new Date()) => {
  const counts = _countByPosition(squad);
  return [...squad].filter(
    (p) => !skippedIds.has(p.id) && !p.isUntouchable && !p.loan && !p.transferPendingClubId && !_isProtectedNewSigning(p, currentDate) && counts[p.position] > MIN_SQUAD_POSITION_COUNTS[p.position]
  ).sort((a, b) => {
    const scoreA = a.overallRating - a.annualSalary / 1e5 - (a.age >= 32 ? 4 : 0) + _getPlayerReputationScore(a);
    const scoreB = b.overallRating - b.annualSalary / 1e5 - (b.age >= 32 ? 4 : 0) + _getPlayerReputationScore(b);
    return scoreA - scoreB;
  })[0] || null;
};
var _getTransferListOpportunity = (player, buyerClub, sellerClub) => {
  if (!player.isOnTransferList) return { scoreBonus: 0, budgetBoost: 0 };
  const repDelta = sellerClub.reputation - buyerClub.reputation;
  const buyerIdealOvr = 30 + buyerClub.reputation * 4.5;
  const sellerIdealOvr = 30 + sellerClub.reputation * 4.5;
  const qualityVsSeller = player.overallRating - sellerIdealOvr;
  let scoreBonus = 0;
  let budgetBoost = 0;
  if (repDelta >= -1 && repDelta <= 2) {
    scoreBonus += 12;
    budgetBoost += 0.1;
  } else if (repDelta <= 5 && player.overallRating >= buyerIdealOvr - 2) {
    scoreBonus += 6;
    budgetBoost += 0.05;
  }
  if (sellerClub.reputation >= buyerClub.reputation) scoreBonus += 4;
  if (qualityVsSeller >= 4) {
    scoreBonus += 12;
    budgetBoost += 0.1;
  } else if (qualityVsSeller >= 1) {
    scoreBonus += 8;
    budgetBoost += 0.05;
  }
  if (player.age <= 29) scoreBonus += 3;
  if (player.age >= 33) scoreBonus -= 2;
  return {
    scoreBonus: Math.max(0, scoreBonus),
    budgetBoost: Math.min(0.2, Math.max(0, budgetBoost))
  };
};
var _assessClubNeeds = (club, squad, currentDate, aiStrategy) => {
  const monthKey = currentDate.getFullYear() * 100 + currentDate.getMonth();
  const clubHash = Math.abs(club.id.split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0) | 0, 0));
  const seed = (clubHash ^ monthKey * 2654435761) >>> 0;
  const seededRand = (offset) => {
    const x = Math.sin(seed + offset) * 1e4;
    return x - Math.floor(x);
  };
  const positions = ["GK" /* GK */, "DEF" /* DEF */, "MID" /* MID */, "FWD" /* FWD */];
  const minCounts = MIN_SQUAD_POSITION_COUNTS;
  const idealOvr = 30 + club.reputation * 4.5;
  const recentForm = club.stats?.form || [];
  const recentLosses = recentForm.slice(-5).filter((r) => r === "P").length;
  const panicPosition = recentLosses >= 3 && seededRand(12345) < (aiStrategy?.panicBuyChance ?? 0.2) ? positions[Math.floor(seededRand(9999) * positions.length)] : null;
  const results = [];
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const posSquad = squad.filter((p) => p.position === pos);
    const posCount = posSquad.length;
    const keyPlayer = [...posSquad].sort((a, b) => b.overallRating - a.overallRating)[0];
    const bestOvr = keyPlayer?.overallRating || 0;
    const urgencyNoise = 1 + (seededRand(i * 37 + 1) * 0.3 - 0.15);
    if (posCount < minCounts[pos]) {
      results.push({ position: pos, urgency: "CRITICAL", reason: "SHORTAGE", starterRequired: true });
      continue;
    }
    const daysToExpiry = keyPlayer ? Math.floor((new Date(keyPlayer.contractEndDate).getTime() - currentDate.getTime()) / 864e5) : 999;
    if (keyPlayer?.isNegotiationPermanentBlocked && daysToExpiry < 180 && daysToExpiry > 0) {
      results.push({ position: pos, urgency: "HIGH", reason: "CONTRACT_LOSS", starterRequired: true });
      continue;
    }
    if (keyPlayer?.health.status === "INJURED" && (keyPlayer.health.injury?.daysRemaining || 0) > 100) {
      results.push({ position: pos, urgency: "HIGH", reason: "INJURY", starterRequired: false });
      continue;
    }
    if (pos === panicPosition) {
      results.push({ position: pos, urgency: "HIGH", reason: "FORM_PANIC", starterRequired: true });
      continue;
    }
    const patienceFactor = 1.14 - (aiStrategy?.patience ?? 0.5) * 0.28;
    const ovrGap = (idealOvr - bestOvr) * urgencyNoise * patienceFactor;
    if (ovrGap > 8) {
      results.push({
        position: pos,
        urgency: "MEDIUM",
        reason: "QUALITY_GAP",
        starterRequired: ovrGap > 14
      });
      continue;
    }
    const budgetAggression = club.budget > FinanceService.getFairMarketSalary(idealOvr) * 18 ? 2 : 1;
    const impulseMultiplier = aiStrategy ? Math.max(0.55, aiStrategy.budgetAggression) : 1;
    if (seededRand(i * 113 + 7) < 0.06 * budgetAggression * impulseMultiplier) {
      results.push({ position: pos, urgency: "LOW", reason: "IMPULSE", starterRequired: false });
    }
  }
  if (squad.length < AI_TARGET_SQUAD_SIZE) {
    const depthPositions = positions.filter((pos) => !results.some((result) => result.position === pos)).map((pos, index) => {
      const posSquad = squad.filter((p) => p.position === pos);
      const targetShare = MIN_SQUAD_POSITION_COUNTS[pos];
      const weakest = [...posSquad].sort((a, b) => a.overallRating - b.overallRating)[0];
      const shortageRatio = (targetShare - posSquad.length) / targetShare;
      const qualityGap = weakest ? Math.max(0, idealOvr - weakest.overallRating) / 20 : 1;
      return {
        pos,
        score: _canAddBalancedDepth(squad, pos) ? shortageRatio * 8 + qualityGap + seededRand(700 + index) * 0.25 : Number.NEGATIVE_INFINITY
      };
    }).sort((a, b) => b.score - a.score);
    const depthNeed = depthPositions.find((entry) => entry.score > 0);
    if (depthNeed) {
      results.push({
        position: depthNeed.pos,
        urgency: squad.length < AI_MIN_SQUAD_SIZE ? "CRITICAL" : "HIGH",
        reason: "SHORTAGE",
        starterRequired: false
      });
    }
  }
  const reluctantChance = aiStrategy ? 0.06 + aiStrategy.patience * 0.12 - Math.max(0, aiStrategy.budgetAggression - 1) * 0.08 : 0.1;
  if (seededRand(42) < _clamp(reluctantChance, 0.02, 0.18)) {
    return results.filter((r) => r.urgency === "CRITICAL" || r.urgency === "HIGH");
  }
  const urgencyOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  return results.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
};
var _appendUniqueToFreeAgents = (playersMap, player) => {
  const freeAgents = playersMap["FREE_AGENTS"] || [];
  if (freeAgents.some((existing) => existing.id === player.id)) return;
  playersMap["FREE_AGENTS"] = [...freeAgents, player];
};
var AiContractService = {
  enforceTransferListLimits: (playersMap, currentDate, userTeamId) => {
    const updatedPlayersMap = { ...playersMap };
    Object.entries(updatedPlayersMap).forEach(([clubId, squad]) => {
      if (clubId === userTeamId || clubId === "FREE_AGENTS") return;
      if (!squad || squad.length <= TRANSFER_LIST_CAP_MIN_SQUAD_SIZE) return;
      const listed = squad.filter((player) => player.isOnTransferList);
      const maxListed = Math.floor(squad.length * TRANSFER_LIST_MAX_SHARE);
      if (listed.length <= maxListed) return;
      const keepIds = new Set(
        [...listed].sort(
          (a, b) => _getTransferListPriority(b, squad, currentDate) - _getTransferListPriority(a, squad, currentDate)
        ).slice(0, maxListed).map((player) => player.id)
      );
      updatedPlayersMap[clubId] = squad.map(
        (player) => player.isOnTransferList && !keepIds.has(player.id) ? { ...player, isOnTransferList: false, transferListPrice: void 0 } : player
      );
    });
    return updatedPlayersMap;
  },
  processAiPrioritySquadDepth: (clubs, playersMap, currentDate, userTeamId) => {
    let updatedClubs = [...clubs];
    const updatedPlayersMap = { ...playersMap };
    for (const club of updatedClubs) {
      if (club.id === userTeamId) continue;
      let squad = [...updatedPlayersMap[club.id] || []];
      if (squad.length === 0) continue;
      const skippedReleaseIds = /* @__PURE__ */ new Set();
      while (squad.length >= AI_MAX_SQUAD_SIZE && _hasCriticalDepthShortage(squad)) {
        const playerToRelease = _findWeakestSurplusPlayer(squad, skippedReleaseIds, currentDate);
        if (!playerToRelease) break;
        if (!_canAiReleasePlayer(playerToRelease, club, currentDate, "SQUAD_DEPTH")) {
          skippedReleaseIds.add(playerToRelease.id);
          if (!_isInLastContractYear(playerToRelease, currentDate) && !_isProtectedNewSigning(playerToRelease, currentDate)) {
            squad = squad.map(
              (p) => p.id === playerToRelease.id ? { ...p, isOnTransferList: true } : p
            );
          }
          continue;
        }
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const releaseCost = Math.floor(playerToRelease.annualSalary * 0.25);
        const updatedHistory = PlayerCareerService.movePlayer(
          playerToRelease,
          { clubName: "BEZ KLUBU", clubId: "FREE_AGENTS" },
          currentYear,
          currentMonth,
          { clubName: club.name, clubId: club.id }
        );
        const releasedPlayer = {
          ...PlayerCareerService.resetClubStatsForNewEntry(playerToRelease),
          clubId: "FREE_AGENTS",
          annualSalary: 0,
          contractEndDate: "",
          marketValue: 0,
          negotiationStep: 0,
          isNegotiationPermanentBlocked: false,
          isOnTransferList: false,
          interestedClubs: [],
          transferPendingClubId: void 0,
          transferReportDate: void 0,
          transferPendingFee: void 0,
          transferPendingSalary: void 0,
          transferPendingBonus: void 0,
          transferPendingContractYears: void 0,
          history: updatedHistory
        };
        squad = squad.filter((p) => p.id !== playerToRelease.id);
        _appendUniqueToFreeAgents(updatedPlayersMap, releasedPlayer);
        updatedClubs = updatedClubs.map(
          (c) => c.id === club.id ? { ...c, budget: Math.max(0, c.budget - releaseCost) } : c
        );
      }
      const counts = _countByPosition(squad);
      const surplusActions = /* @__PURE__ */ new Map();
      [...squad].filter(
        (player) => _isSquadLevelOutlier(player, club, squad, currentDate) && !_isInLastContractYear(player, currentDate)
      ).sort((a, b) => a.overallRating - b.overallRating).forEach((player) => {
        const posCountAfter = counts[player.position] - 1;
        const canRelease = posCountAfter >= MIN_SQUAD_POSITION_COUNTS[player.position] && squad.length - 1 >= AI_MIN_SQUAD_SIZE && (updatedClubs.find((c) => c.id === club.id)?.budget ?? club.budget) >= Math.floor(player.annualSalary * 0.35) && _canAiReleasePlayer(player, club, currentDate, "SQUAD_LEVEL_OUTLIER");
        surplusActions.set(player.id, canRelease ? "RELEASE" : "TRANSFER_LIST");
      });
      Object.keys(AI_SOFT_MAX_POSITION_COUNTS).forEach((position) => {
        const seasonalLimit = _getAiSeasonalPositionLimit(club, position, currentDate);
        const surplus = counts[position] - seasonalLimit;
        if (!_shouldRunAiSurplusSelection(club, position, surplus, currentDate)) return;
        [...squad].filter(
          (player) => player.position === position && !player.isUntouchable && !player.loan && player.squadRole !== "KEY_PLAYER" && !player.transferPendingClubId && !_isProtectedNewSigning(player, currentDate) && !_isInLastContractYear(player, currentDate)
        ).sort((a, b) => _getSquadReviewScore(a) - _getSquadReviewScore(b)).slice(0, surplus).forEach((player) => {
          if (!surplusActions.has(player.id)) {
            surplusActions.set(player.id, _chooseAiSurplusExit(player, club, currentDate));
          }
        });
      });
      for (const [playerId, action] of surplusActions) {
        if (action !== "RELEASE") continue;
        const playerToRelease = squad.find((player) => player.id === playerId);
        if (!playerToRelease) {
          surplusActions.delete(playerId);
          continue;
        }
        const posCountAfter = squad.filter((player) => player.position === playerToRelease.position && player.id !== playerId).length;
        const releaseCost = Math.floor(playerToRelease.annualSalary * 0.35);
        const currentClub = updatedClubs.find((c) => c.id === club.id) || club;
        const canRelease = posCountAfter >= MIN_SQUAD_POSITION_COUNTS[playerToRelease.position] && squad.length - 1 >= AI_MIN_SQUAD_SIZE && currentClub.budget >= releaseCost && _canAiReleasePlayer(playerToRelease, club, currentDate, "POSITION_SURPLUS");
        if (!canRelease) {
          surplusActions.set(playerId, _chooseAiSurplusExit(playerToRelease, club, currentDate) === "LOAN" ? "LOAN" : "TRANSFER_LIST");
          continue;
        }
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const updatedHistory = PlayerCareerService.movePlayer(
          playerToRelease,
          { clubName: "BEZ KLUBU", clubId: "FREE_AGENTS" },
          currentYear,
          currentMonth,
          { clubName: club.name, clubId: club.id }
        );
        const releasedPlayer = {
          ...PlayerCareerService.resetClubStatsForNewEntry(playerToRelease),
          clubId: "FREE_AGENTS",
          annualSalary: 0,
          contractEndDate: "",
          marketValue: 0,
          negotiationStep: 0,
          isNegotiationPermanentBlocked: false,
          isOnTransferList: false,
          isAvailableForLoan: false,
          interestedClubs: [],
          transferPendingClubId: void 0,
          transferReportDate: void 0,
          transferPendingFee: void 0,
          transferPendingSalary: void 0,
          transferPendingBonus: void 0,
          transferPendingContractYears: void 0,
          history: updatedHistory
        };
        squad = squad.filter((player) => player.id !== playerId);
        counts[playerToRelease.position]--;
        _appendUniqueToFreeAgents(updatedPlayersMap, releasedPlayer);
        updatedClubs = updatedClubs.map(
          (c) => c.id === club.id ? { ...c, budget: Math.max(0, c.budget - releaseCost) } : c
        );
      }
      updatedPlayersMap[club.id] = squad.map((p) => {
        const surplusAction = surplusActions.get(p.id);
        if (surplusAction === "TRANSFER_LIST") return { ...p, isOnTransferList: true, isAvailableForLoan: false };
        if (surplusAction === "LOAN") return { ...p, isAvailableForLoan: true, isOnTransferList: false };
        return counts[p.position] > MIN_SQUAD_POSITION_COUNTS[p.position] ? p : { ...p, isOnTransferList: false, isAvailableForLoan: false };
      });
    }
    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },
  /**
   * Awaryjnie uzupełnia kadry AI tydzień przed końcem okna, dopiero po próbach rynku.
   */
  processAiDeadlineAcademyFallback: (clubs, playersMap, currentDate, userTeamId) => {
    const isSummerDeadlineFallback = currentDate.getMonth() === 8 && currentDate.getDate() === 1;
    const isWinterDeadlineFallback = currentDate.getMonth() === 1 && currentDate.getDate() === 6;
    if (!isSummerDeadlineFallback && !isWinterDeadlineFallback) {
      return { updatedClubs: clubs, updatedPlayers: playersMap, generatedCount: 0 };
    }
    let updatedPlayersMap = { ...playersMap };
    let generatedCount = 0;
    const seasonYear = currentDate.getMonth() >= 6 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
    const allIdsInUse = new Set(Object.values(playersMap).flat().map((player) => player.id));
    const updatedClubs = clubs.map((club) => {
      if (club.id === userTeamId || club.id === "FREE_AGENTS" || !club.leagueId) return club;
      let workingSquad = [...updatedPlayersMap[club.id] || []];
      if (workingSquad.length === 0 || workingSquad.length >= AI_MAX_SQUAD_SIZE) return club;
      const deadlinePrefix = `${_buildAiYouthSeasonPrefix(seasonYear, club.id)}_DEADLINE`;
      const alreadyGenerated = Array.from({ length: AI_SEASON_YOUTH_MAX_INTAKE + 8 }, (_, index) => index).filter((index) => allIdsInUse.has(`${deadlinePrefix}_${index}`)).length;
      const initialRiskyOutgoing = workingSquad.filter((player) => _isAiDeadlineOutgoingRisk(player, currentDate));
      const deadlineIntakeLimit = 4 + _getAiDeadlineExtraSlots(club, initialRiskyOutgoing.length, seasonYear);
      const slotsLeft = Math.min(deadlineIntakeLimit - alreadyGenerated, AI_MAX_SQUAD_SIZE - workingSquad.length);
      if (slotsLeft <= 0) return club;
      const pendingIncoming = Object.values(updatedPlayersMap).flat().filter((player) => player.transferPendingClubId === club.id);
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);
      const urgencyOrder = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1
      };
      const createdPlayers = [];
      const fallbackCoveredPositions = /* @__PURE__ */ new Set();
      for (let i = 0; i < slotsLeft; i++) {
        const assessmentSquad = [...workingSquad, ...pendingIncoming];
        const riskyOutgoing = workingSquad.filter((player) => _isAiDeadlineOutgoingRisk(player, currentDate));
        const riskNeeds = _getAiDeadlineRiskNeeds(assessmentSquad, riskyOutgoing);
        const marketNeeds = _assessClubNeeds(club, assessmentSquad, currentDate, aiStrategy);
        const mergedNeeds = [...marketNeeds];
        riskNeeds.forEach((riskNeed) => {
          if (!mergedNeeds.some((need2) => need2.position === riskNeed.position)) {
            mergedNeeds.push(riskNeed);
          }
        });
        const orderedNeeds = mergedNeeds.filter((need2) => {
          const posSquad = assessmentSquad.filter((player) => player.position === need2.position);
          const hasHardShortage = posSquad.length < MIN_SQUAD_POSITION_COUNTS[need2.position];
          const riskNeed = riskNeeds.some((risk) => risk.position === need2.position);
          if (fallbackCoveredPositions.has(need2.position) && !hasHardShortage) return false;
          if (hasHardShortage || riskNeed) return true;
          const weakest = [...posSquad].sort((a, b) => a.overallRating - b.overallRating)[0];
          return !!weakest && weakest.overallRating < _getAiMarketQualityFloor(club, assessmentSquad, need2.position, need2);
        }).sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
        const need = orderedNeeds[0];
        if (!need) break;
        const hadHardShortage = assessmentSquad.filter((player) => player.position === need.position).length < MIN_SQUAD_POSITION_COUNTS[need.position];
        const hadRiskNeed = riskNeeds.some((risk) => risk.position === need.position);
        const slot = Array.from({ length: deadlineIntakeLimit }, (_, index) => index).find((index) => !allIdsInUse.has(`${deadlinePrefix}_${index}`) && !workingSquad.some((player) => player.id === `${deadlinePrefix}_${index}`));
        if (slot === void 0) break;
        const youthPlayer = {
          ..._buildAiSeasonYouthPlayer(club, workingSquad, need.position, currentDate, seasonYear, slot, { deadlineFallback: true }),
          id: `${deadlinePrefix}_${slot}`
        };
        workingSquad = [...workingSquad, youthPlayer];
        createdPlayers.push(youthPlayer);
        const stillHasHardShortage = workingSquad.filter((player) => player.position === need.position).length < MIN_SQUAD_POSITION_COUNTS[need.position];
        const stillHasRiskNeed = _getAiDeadlineRiskNeeds(
          [...workingSquad, ...pendingIncoming],
          workingSquad.filter((player) => _isAiDeadlineOutgoingRisk(player, currentDate))
        ).some((risk) => risk.position === need.position);
        if ((!hadHardShortage || !stillHasHardShortage) && (!hadRiskNeed || !stillHasRiskNeed)) {
          fallbackCoveredPositions.add(need.position);
        }
      }
      if (createdPlayers.length === 0) return club;
      let currentClub = { ...club };
      const createdIds = new Set(createdPlayers.map((player) => player.id));
      const releaseCandidates = [...workingSquad].filter((player) => _isAiDeadlineReleaseCandidate(player, club, workingSquad, currentDate, createdIds)).sort((a, b) => {
        const salaryWasteA = a.annualSalary * _getContractYearsLeft(a, currentDate);
        const salaryWasteB = b.annualSalary * _getContractYearsLeft(b, currentDate);
        return _getSquadReviewScore(a) - _getSquadReviewScore(b) || salaryWasteB - salaryWasteA;
      });
      for (const playerToRelease of releaseCandidates) {
        const releaseCost = Math.floor(playerToRelease.annualSalary * 0.4);
        const fullContractCost = playerToRelease.annualSalary * _getContractYearsLeft(playerToRelease, currentDate);
        const posCountAfter = workingSquad.filter((player) => player.position === playerToRelease.position && player.id !== playerToRelease.id).length;
        const canRelease = releaseCost > 0 && releaseCost < fullContractCost && currentClub.budget >= releaseCost && workingSquad.length - 1 >= AI_MIN_SQUAD_SIZE && posCountAfter >= MIN_SQUAD_POSITION_COUNTS[playerToRelease.position] && _canAiReleasePlayer(playerToRelease, club, currentDate, "DEADLINE_ACADEMY_REBALANCE");
        if (!canRelease) continue;
        const releasedPlayer = _releaseAiPlayerToFreeAgents(playerToRelease, club, currentDate);
        workingSquad = workingSquad.filter((player) => player.id !== playerToRelease.id);
        _appendUniqueToFreeAgents(updatedPlayersMap, releasedPlayer);
        currentClub = { ...currentClub, budget: Math.max(0, currentClub.budget - releaseCost) };
      }
      generatedCount += createdPlayers.length;
      updatedPlayersMap[club.id] = workingSquad;
      const rosterIdSet = new Set(workingSquad.map((player) => player.id));
      return {
        ...currentClub,
        rosterIds: Array.from(rosterIdSet)
      };
    });
    return { updatedClubs, updatedPlayers: updatedPlayersMap, generatedCount };
  },
  /**
   * Przetwarza wszystkie kluby AI w poszukiwaniu kończących się kontraktów.
   */
  processClubsContracts: (clubs, playersMap, currentDate, userTeamId) => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    updatedClubs = updatedClubs.map((club) => {
      if (club.id === userTeamId || !updatedPlayersMap[club.id]) return club;
      let currentClub = { ...club };
      const squad = updatedPlayersMap[club.id];
      updatedPlayersMap[club.id] = squad.map((player) => {
        const p = { ...player };
        const daysLeft = Math.floor((new Date(p.contractEndDate).getTime() - currentDate.getTime()) / (1e3 * 60 * 60 * 24));
        if (daysLeft <= 0 || daysLeft > 425) return p;
        if (!_shouldAiTryRenewContract(p, squad, club, currentDate, daysLeft)) return p;
        const forgetRoll = _seededRandom(`AI_CONTRACT_FORGET_${club.id}_${p.id}_${new Date(p.contractEndDate).getFullYear()}`);
        if (forgetRoll < 1e-3) {
          return {
            ...p,
            negotiationLockoutUntil: p.contractEndDate
          };
        }
        const contractMindflow = PlayerContractMindflowService.evaluate({
          player: p,
          currentClub: club,
          currentSquad: squad,
          currentDate,
          interestedClubs: _getInterestedClubs(p, updatedClubs)
        });
        if (contractMindflow.mindset.state === "READY_TO_LEAVE" || contractMindflow.mindset.state === "PRECONTRACT_READY") {
          return _isInLastContractYear(p, currentDate) || _isProtectedNewSigning(p, currentDate) ? p : { ...p, isOnTransferList: true };
        }
        const isLocked = p.negotiationLockoutUntil && currentDate < new Date(p.negotiationLockoutUntil);
        if (isLocked || p.isNegotiationPermanentBlocked) return p;
        const expectations = contractMindflow.contractExpectations;
        const salaryPressure = contractMindflow.mindset.state === "EXPECTING_BETTER_TERMS" ? 1.05 : contractMindflow.mindset.state === "LOSING_PATIENCE" ? 1.1 : contractMindflow.mindset.state === "TESTING_MARKET" ? 1.14 : contractMindflow.currentClubSituation.totalStayComfort >= 82 ? 0.96 : 1;
        const proposedSalary = Math.max(
          expectations.minimumSalary,
          Math.round(expectations.expectedSalary * salaryPressure / 1e4) * 1e4
        );
        const proposedBonus = Math.max(
          expectations.minimumBonus,
          Math.round(expectations.expectedBonus * 0.88 / 1e4) * 1e4
        );
        if (proposedBonus > currentClub.signingBonusPool) return p;
        const newEndDate = new Date(currentDate.getFullYear() + expectations.preferredYears, 5, 30).toISOString();
        const result = FinanceService.evaluateContractLogic(p, proposedSalary, proposedBonus, newEndDate, currentDate, club.reputation, FinanceService.getClubTier(club));
        if (result.accepted) {
          currentClub.signingBonusPool -= proposedBonus;
          currentClub.budget -= proposedBonus;
          return {
            ...PlayerMoraleService.applyContractSigningMindflowReset(p, currentDate),
            annualSalary: proposedSalary,
            contractEndDate: newEndDate,
            negotiationStep: 0,
            isOnTransferList: false
            // Zdejmij z listy jeśli podpisał
          };
        } else {
          const nextStep = (p.negotiationStep || 0) + 1;
          const lockout = new Date(currentDate);
          lockout.setDate(lockout.getDate() + 21);
          const permanentBlock = nextStep >= 3;
          return {
            ...p,
            negotiationStep: nextStep,
            negotiationLockoutUntil: lockout.toISOString(),
            isNegotiationPermanentBlocked: permanentBlock,
            isOnTransferList: permanentBlock
            // Jeśli obraził się na amen -> trafia na listę transferową
          };
        }
      });
      return currentClub;
    });
    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },
  // TUTAJ WSTAW TEN KOD - SYSTEM REKRUTACJI FAIR PLAY
  /**
   * Analizuje wolnych agentów i generuje oferty oczekujące dla klubów AI.
   */
  // PERF — HISTORIA (znalezione 2026-07-30, naprawione ostatecznie 2026-08-01):
  // Ta funkcja jest wywoływana codziennie (z BackgroundMatchProcessor.ts:460 w dni bez
  // meczów i :1008 w dni meczowe — czyli praktycznie każdego dnia gry). Pierwotnie dla
  // KAŻDEGO klubu AI przeszukiwała w całości (updatedPlayersMap['FREE_AGENTS'] || []).filter(...)
  // — czyli listę WSZYSTKICH wolnych agentów w grze. Ta lista tylko rośnie przez cały czas
  // trwania save'a (zwolnieni gracze nigdy nie są z niej usuwani), więc koszt =
  // liczba_klubów_AI × rozmiar_FREE_AGENTS rósł z każdym rozegranym sezonem. Zmierzone przez
  // PerfProfilerService na realnym save'ie (sezon 4): sama ta funkcja zajmowała ~13.8s na
  // dzień, a pomocnicza PrestigeTransferGuardService.shouldConsiderDestination była
  // wywoływana ~2 mln razy dziennie tylko z tego miejsca. Sprawdzenie faktycznego rozmiaru
  // puli w tym samym save'ie: 15 737 wolnych agentów na 33 228 wszystkich zawodników w grze
  // (47%!) — AI nie nadążała ich podpisywać, pula tylko rosła.
  //
  // Pierwsza poprawka (2026-07-30) rozkładała pełne skanowanie na 3 dni per klub (stagger).
  // To pomogło (~13.8s → ~4-5s/dzień), ale nadal oznaczało pełne skanowanie 15 737+ wolnych
  // agentów co 3 dni, przez każdy klub z osobna, dla samego tylko "opportunistycznego"
  // dokupywania.
  //
  // FIX OSTATECZNY (2026-08-01): zamiast rozkładać PEŁNE skanowanie w czasie, klub AI w
  // ogóle nie skanuje już codziennie/co kilka dni całej puli. Zamiast tego trzyma własną,
  // krótką listę obserwowanych kandydatów (club.aiScoutedTargets.freeAgentIds — patrz pole
  // w types.ts, ~6-24 zawodników zależnie od reputacji klubu przez _getScoutingProfile),
  // odświeżaną PEŁNYM skanowaniem raz na AI_SCOUTING_REFRESH_DAYS (90) dni. Klub REALIZUJE
  // transfery (przegląda listę, składa oferty) codziennie — tylko samo SKANOWANIE rynku
  // jest rzadkie. To był wyraźny wymóg: "klub mając listę może realizować transfery
  // codziennie, ale skanowanie musi być co 3 miesiące" — i nie ma tu duplikacji logiki:
  // _buildFreeAgentCandidates to JEDYNE miejsce z logiką filtrowania kandydatów, używane
  // identycznie zarówno przy pełnym skanie, jak i przy skanie małej listy z cache'a (różni
  // się tylko rozmiarem `pool`, który dostaje).
  //
  // WAŻNE — kolejność sprawdzeń jest celowa i NIE WOLNO jej odwracać: decyzja pełne-skanowanie-
  // vs-cache zapada DOPIERO PO obliczeniu `needsFA`/`hasCriticalShortage`/`gulfStarCandidate`
  // (tanie operacje, dotyczą tylko własnego składu klubu — nie całej puli FREE_AGENTS), a klub
  // z krytycznym brakiem składu (`hasCriticalShortage`, np. właśnie stracił zawodnika i spadł
  // poniżej minimum na pozycji) ORAZ kandydat na gwiazdę z Zatoki (`gulfStarCandidate`) ZAWSZE
  // skanują pełną pulę tego samego dnia, bez opóźnienia i bez oglądania się na wiek cache'a —
  // pilna potrzeba nigdy nie czeka na starą listę. Cache jest odświeżany (nadpisywany) tylko
  // gdy faktycznie wygasł (cacheStale), nie przy każdym pełnym skanie wywołanym samą pilnością
  // — inaczej marnowalibyśmy obliczenia, gdy lista jest i tak świeża.
  //
  // Ten sam mechanizm cache'a (z tym samym AI_SCOUTING_REFRESH_DAYS) zastosowano też w
  // processAiInterestedPlayerTargeting (interestedPlayerIds zamiast freeAgentIds — patrz
  // obszerny komentarz tam). processAiPreContractOpportunities NIE ma cache'a — dotyczy
  // zawodników, którzy DOPIERO będą wolni (długoterminowe skautowanie), nie wypełniania
  // bieżącej luki w składzie, więc to inna kategoria (patrz komentarz przy tamtej funkcji).
  processAiRecruitment: (clubs, playersMap, currentDate, userTeamId) => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const newOffers = [];
    const logEntries = [];
    const rawFreeAgents = updatedPlayersMap["FREE_AGENTS"] || [];
    const freeAgents = rawFreeAgents.map(_protectPendingTransferPlayerFromMarket);
    if (freeAgents.some((freeAgent, index) => freeAgent !== rawFreeAgents[index])) {
      updatedPlayersMap["FREE_AGENTS"] = freeAgents;
    }
    if (freeAgents.length === 0) return { updatedClubs, updatedPlayers: updatedPlayersMap, newOffers, logEntries };
    const clubMap = new Map(updatedClubs.map((c) => [c.id, c]));
    const freeAgentsById = new Map(freeAgents.map((fa) => [fa.id, fa]));
    const negotiatingClubIds = new Set(
      freeAgents.filter((fa) => fa.aiNegotiationClubId).map((fa) => fa.aiNegotiationClubId)
    );
    updatedClubs = updatedClubs.map((club) => {
      if (club.id === userTeamId) return club;
      const squad = updatedPlayersMap[club.id] || [];
      const minCounts = MIN_SQUAD_POSITION_COUNTS;
      const idealOvr = 30 + club.reputation * 4.5;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);
      const needsFA = _assessClubNeeds(club, squad, currentDate, aiStrategy);
      const hasCriticalShortage = needsFA.some((n) => n.urgency === "CRITICAL" && n.reason === "SHORTAGE");
      const gulfStarCandidate = _isGulfStarHunterClub(club) ? (updatedPlayersMap["FREE_AGENTS"] || []).filter(
        (fa) => _isGulfMegaOfferTarget(fa, clubMap) && !fa.transferPendingClubId && !fa.aiNegotiationClubId && !FreeAgentNegotiationService.isClubLockedOut(fa, club.id, currentDate)
      ).sort(
        (a, b) => _getPlayerReputation(b) - _getPlayerReputation(a) || b.overallRating - a.overallRating || b.age - a.age
      )[0] : null;
      if (needsFA.length === 0 && !gulfStarCandidate) return club;
      if (negotiatingClubIds.has(club.id)) return club;
      if (club.budget <= 25e4 && !hasCriticalShortage && !gulfStarCandidate) return club;
      const scoutCache = club.aiScoutedTargets;
      const cacheAgeDays = scoutCache?.lastRefreshDate ? Math.floor((currentDate.getTime() - new Date(scoutCache.lastRefreshDate).getTime()) / 864e5) : Number.POSITIVE_INFINITY;
      const cacheStale = cacheAgeDays >= AI_SCOUTING_REFRESH_DAYS;
      const useFullScan = hasCriticalShortage || !!gulfStarCandidate || cacheStale;
      const searchPool = useFullScan ? updatedPlayersMap["FREE_AGENTS"] || [] : (scoutCache?.freeAgentIds ?? []).map((id) => freeAgentsById.get(id)).filter((p) => !!p);
      const freeAgentCandidates = _buildFreeAgentCandidates(
        searchPool,
        club,
        squad,
        needsFA,
        aiStrategy,
        minCounts,
        idealOvr,
        currentDate
      );
      let nextAiScoutedTargets = scoutCache;
      if (cacheStale) {
        const refreshScouting = _getScoutingProfile(club, false);
        const discoveredPool = _computeDiscoveredPool(
          freeAgentCandidates,
          `AI_FA_SCOUT_REFRESH_${club.id}_${currentDate.toISOString().slice(0, 10)}`,
          (player) => {
            const need = needsFA.find((n) => n.position === player.position);
            return AiClubTransferStrategyService.candidateScore(player, club, aiStrategy, { needUrgency: need?.urgency }) + _getRecruitmentReputationBonus(player, 3, need);
          },
          refreshScouting
        );
        nextAiScoutedTargets = {
          lastRefreshDate: currentDate.toISOString(),
          freeAgentIds: discoveredPool.map((entry) => entry.player.id),
          interestedPlayerIds: scoutCache?.interestedPlayerIds ?? []
        };
      }
      const clubWithScoutingUpdate = nextAiScoutedTargets !== scoutCache ? { ...club, aiScoutedTargets: nextAiScoutedTargets } : club;
      const faScouting = _getScoutingProfile(club, hasCriticalShortage);
      const candidate = gulfStarCandidate || _pickDiscoveredMarketPlayer(
        freeAgentCandidates,
        `AI_FA_DISCOVERY_${club.id}_${currentDate.toISOString().slice(0, 10)}`,
        (player) => {
          const need = needsFA.find((n) => n.position === player.position);
          return AiClubTransferStrategyService.candidateScore(player, club, aiStrategy, { needUrgency: need?.urgency }) + _getRecruitmentReputationBonus(player, 3, need);
        },
        {
          discoveryShare: faScouting.discoveryShare,
          maxPool: faScouting.maxPool,
          noise: faScouting.noise,
          qualityBand: faScouting.qualityBand
        }
      );
      if (!candidate) return clubWithScoutingUpdate;
      const responseDate = new Date(currentDate);
      responseDate.setDate(responseDate.getDate() + (gulfStarCandidate ? 2 : 4));
      const gulfStarOffer = candidate === gulfStarCandidate ? _buildGulfStarOffer(candidate, club, currentDate) : null;
      const faList = updatedPlayersMap["FREE_AGENTS"];
      const idx = faList.findIndex((p) => p.id === candidate.id);
      if (idx !== -1) {
        updatedPlayersMap["FREE_AGENTS"] = faList.map(
          (p, i) => i === idx ? { ...p, aiNegotiationClubId: club.id, aiNegotiationResponseDate: responseDate.toISOString() } : p
        );
      }
      if (gulfStarOffer) {
        const previousClub = _getGulfMegaOfferPreviousClub(candidate, clubMap);
        logEntries.push({
          id: `GULF_FA_OFFER_${candidate.id}_${club.id}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${candidate.lastName} ${candidate.firstName}`,
          playerOvr: candidate.overallRating,
          playerPosition: candidate.position,
          fromClub: previousClub?.name || "Bez klubu",
          toClub: club.name,
          status: "OFFER_MADE",
          fee: 0,
          playerId: candidate.id,
          fromClubId: previousClub?.id,
          toClubId: club.id,
          isGulfMegaOffer: true,
          salary: gulfStarOffer.proposedSalary,
          bonus: gulfStarOffer.proposedBonus,
          contractYears: gulfStarOffer.contractYears
        });
      }
      return clubWithScoutingUpdate;
    });
    return { updatedClubs, updatedPlayers: updatedPlayersMap, newOffers, logEntries };
  },
  /**
     * Rozwiązuje zakończone negocjacje AI z wolnymi agentami.
     * Wywoływana codziennie. Gdy aiNegotiationResponseDate <= dziś:
     *   - Ocenia akceptację oferty używając reputacji AI-klubu
     *   - Jeśli TAK: przenosi zawodnika do składu AI-klubu
     *   - Jeśli NIE: czyści pola, ustawia blokadę 90 dni
     */
  resolveAiFreeAgentNegotiations: (clubs, playersMap, currentDate, userTeamId) => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries = [];
    const freeAgents = updatedPlayersMap["FREE_AGENTS"] || [];
    const freeAgentsWithoutConflictingNegotiations = freeAgents.map(_protectPendingTransferPlayerFromMarket);
    if (freeAgentsWithoutConflictingNegotiations.some((freeAgent, index) => freeAgent !== freeAgents[index])) {
      updatedPlayersMap["FREE_AGENTS"] = freeAgentsWithoutConflictingNegotiations;
    }
    const today = currentDate.getTime();
    const clubMap = new Map(updatedClubs.map((c) => [c.id, c]));
    const due = freeAgentsWithoutConflictingNegotiations.filter(
      (fa) => !fa.transferPendingClubId && fa.aiNegotiationClubId && fa.aiNegotiationResponseDate && new Date(fa.aiNegotiationResponseDate).getTime() <= today
    );
    if (due.length === 0) return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
    for (const fa of due) {
      const aiClub = updatedClubs.find((c) => c.id === fa.aiNegotiationClubId);
      if (!aiClub || aiClub.id === userTeamId) {
        updatedPlayersMap["FREE_AGENTS"] = (updatedPlayersMap["FREE_AGENTS"] || []).map(
          (p) => p.id === fa.id ? { ...p, aiNegotiationClubId: void 0, aiNegotiationResponseDate: void 0 } : p
        );
        continue;
      }
      const gulfStarOffer = _isGulfStarHunterClub(aiClub) && _isGulfMegaOfferTarget(fa, clubMap) ? _buildGulfStarOffer(fa, aiClub, currentDate) : null;
      if (!gulfStarOffer && !PrestigeTransferGuardService.isAllowedDestinationForHighPrestigePlayer(fa, aiClub)) {
        updatedPlayersMap["FREE_AGENTS"] = (updatedPlayersMap["FREE_AGENTS"] || []).map(
          (p) => p.id === fa.id ? { ...p, aiNegotiationClubId: void 0, aiNegotiationResponseDate: void 0 } : p
        );
        continue;
      }
      const proposedSalary = gulfStarOffer?.proposedSalary ?? FinanceService.getFairMarketSalary(fa.overallRating);
      const proposedBonus = gulfStarOffer?.proposedBonus ?? Math.floor(proposedSalary * 0.4);
      const newEndDate = gulfStarOffer?.newEndDate ?? new Date(currentDate.getFullYear() + 2, 5, 30).toISOString();
      const gulfOwnerShortfallCover = _getGulfOwnerShortfallCover(aiClub, proposedBonus + proposedSalary);
      if (gulfOwnerShortfallCover > 0) {
        updatedClubs = updatedClubs.map(
          (c) => c.id === aiClub.id ? { ...c, budget: c.budget + gulfOwnerShortfallCover } : c
        );
      }
      if (aiClub.budget + gulfOwnerShortfallCover < proposedBonus + proposedSalary) {
        updatedPlayersMap["FREE_AGENTS"] = (updatedPlayersMap["FREE_AGENTS"] || []).map(
          (p) => p.id === fa.id ? { ...p, aiNegotiationClubId: void 0, aiNegotiationResponseDate: void 0 } : p
        );
        continue;
      }
      const currentSquad = updatedPlayersMap[aiClub.id] || [];
      const positionStillShort = currentSquad.filter((player) => player.position === fa.position).length < MIN_SQUAD_POSITION_COUNTS[fa.position];
      if (!gulfStarOffer && !positionStillShort && !_canAddBalancedDepth(currentSquad, fa.position)) {
        updatedPlayersMap["FREE_AGENTS"] = (updatedPlayersMap["FREE_AGENTS"] || []).map(
          (p) => p.id === fa.id ? { ...p, aiNegotiationClubId: void 0, aiNegotiationResponseDate: void 0 } : p
        );
        continue;
      }
      const result = FinanceService.evaluateContractLogic(fa, proposedSalary, proposedBonus, newEndDate, currentDate, aiClub.reputation, FinanceService.getClubTier(aiClub));
      const accepted = gulfStarOffer ? Math.random() < _getGulfMegaOfferAcceptanceChance(fa) : result.accepted;
      if (accepted) {
        updatedPlayersMap["FREE_AGENTS"] = (updatedPlayersMap["FREE_AGENTS"] || []).filter((p) => p.id !== fa.id);
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const updatedHistory = PlayerCareerService.movePlayer(
          fa,
          { clubName: aiClub.name, clubId: aiClub.id },
          currentYear,
          currentMonth
        );
        const signedPlayerBase = {
          ...PlayerMoraleService.applyContractSigningMindflowReset(
            PlayerCareerService.resetClubStatsForNewEntry(fa),
            currentDate
          ),
          clubId: aiClub.id,
          annualSalary: proposedSalary,
          contractEndDate: newEndDate,
          aiNegotiationClubId: void 0,
          aiNegotiationResponseDate: void 0,
          isOnTransferList: false,
          history: updatedHistory,
          transferLockoutUntil: _buildTransferLockoutUntil(currentDate),
          retirementLockUntil: gulfStarOffer ? newEndDate : fa.retirementLockUntil
        };
        const signedPlayer = PlayerClubAdaptationService.beginForClub(signedPlayerBase, aiClub.id, currentDate);
        updatedPlayersMap[aiClub.id] = [...updatedPlayersMap[aiClub.id] || [], signedPlayer];
        updatedClubs = updatedClubs.map(
          (c) => c.id === aiClub.id ? { ...c, budget: c.budget - proposedBonus } : c
        );
        if (gulfStarOffer) {
          const previousClub = _getGulfMegaOfferPreviousClub(fa, clubMap);
          logEntries.push({
            id: `GULF_FA_SIGN_${fa.id}_${aiClub.id}_${currentDate.getTime()}`,
            date: currentDate.toISOString(),
            playerName: `${fa.lastName} ${fa.firstName}`,
            playerOvr: fa.overallRating,
            playerPosition: fa.position,
            fromClub: previousClub?.name || "Bez klubu",
            toClub: aiClub.name,
            status: "TRANSFER_SIGNED",
            fee: 0,
            playerId: fa.id,
            fromClubId: previousClub?.id,
            toClubId: aiClub.id,
            isGulfMegaOffer: true,
            salary: proposedSalary,
            bonus: proposedBonus,
            contractYears: gulfStarOffer.contractYears
          });
        }
      } else {
        const lockout = new Date(currentDate);
        lockout.setDate(lockout.getDate() + 90);
        updatedPlayersMap["FREE_AGENTS"] = (updatedPlayersMap["FREE_AGENTS"] || []).map(
          (p) => p.id === fa.id ? {
            ...p,
            aiNegotiationClubId: void 0,
            aiNegotiationResponseDate: void 0,
            freeAgentLockoutUntil: null,
            freeAgentClubLockouts: FreeAgentNegotiationService.buildClubLockouts(
              p.freeAgentClubLockouts,
              aiClub.id,
              lockout.toISOString()
            )
          } : p
        );
      }
    }
    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },
  /**
   * Przygotowanie finansowania zakupów.
   * Dla klubów z potrzebami kadrowymi ale zbyt niskim budżetem — listuje na sprzedaż
   * najbardziej zbędnego zawodnika, aby wygospodarować środki na wzmocnienie.
   * Wywoływana codziennie (stagger co 7 dni per klub).
   */
  processAiSquadFinancing: (clubs, playersMap, currentDate, userTeamId) => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const hashClubFin = (id) => {
      let h = 0;
      for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i) | 0;
      return Math.abs(h);
    };
    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 864e5
    );
    for (const club of updatedClubs) {
      if (club.id === userTeamId) continue;
      if (!ReserveTeamLeagueService.canParticipateAsTransferBuyer(club.id)) continue;
      const finStagger = _isTransferWindowOpen(currentDate) ? 5 : 14;
      if ((dayOfYear + hashClubFin(club.id)) % finStagger !== 0) continue;
      const squad = updatedPlayersMap[club.id] || [];
      const positions = [
        "GK" /* GK */,
        "DEF" /* DEF */,
        "MID" /* MID */,
        "FWD" /* FWD */
      ];
      const minCounts = MIN_SQUAD_POSITION_COUNTS;
      const idealOvr = 30 + club.reputation * 4.5;
      const hasNeeds = positions.some((pos) => {
        const posSquad = squad.filter((p) => p.position === pos);
        if (posSquad.length < minCounts[pos]) return true;
        const weakest = [...posSquad].sort((a, b) => a.overallRating - b.overallRating)[0];
        return weakest && weakest.overallRating < idealOvr - 1;
      });
      if (!hasNeeds) continue;
      const estimatedMinCost = FinanceService.getFairMarketSalary(idealOvr - 8) * 6;
      if (club.budget >= estimatedMinCost * 0.5) continue;
      const expendable = squad.filter(
        (p) => !p.isUntouchable && !p.isOnTransferList && !p.loan && !p.transferPendingClubId && !_isProtectedNewSigning(p, currentDate) && !_isInLastContractYear(p, currentDate) && squad.filter((s) => s.position === p.position).length > minCounts[p.position]
      ).sort((a, b) => {
        const scoreA = a.overallRating - a.annualSalary / 1e5 + _getPlayerReputationScore(a);
        const scoreB = b.overallRating - b.annualSalary / 1e5 + _getPlayerReputationScore(b);
        return scoreA - scoreB;
      })[0];
      if (!expendable) continue;
      updatedPlayersMap[club.id] = (updatedPlayersMap[club.id] || []).map(
        (p) => p.id === expendable.id ? { ...p, isOnTransferList: true } : p
      );
    }
    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },
  /**
   * Szuka okazji transferowych na liście transferowej dla każdego AI-klubu.
   * Wywoływana codziennie — wewnętrzny stagger (hash klubu % 4) sprawia, że
   * każdy klub sprawdza rynek co ~4 dni w inny dzień cyklu.
   *
   * Logika:
   *   - Dynamiczna diagnoza potrzeb kadrowych
   *   - Normalny zakres OVR: [idealOvr-8, idealOvr+10]
   *   - Bargain hunting: [idealOvr+10, idealOvr+20] tylko gdy cena ≤ 35% budżetu
   *   - Pełna symulacja: getNegotiationStance → evaluateSellerDecision → evaluateMove
   *   - Jeśli obie strony akceptują → tag TRSF (transferPendingClubId + transferReportDate +3 dni)
   */
  processAiTransferListSignings: (clubs, playersMap, currentDate, userTeamId, coachesMap = {}) => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries = [];
    const windowOpen = _isTransferWindowOpen(currentDate);
    const hashClub = (id) => {
      let h = 0;
      for (let i = 0; i < id.length; i++) {
        h = (h << 5) - h + id.charCodeAt(i) | 0;
      }
      return Math.abs(h);
    };
    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 864e5
    );
    const transferListed = Object.entries(updatedPlayersMap).filter(([clubId]) => clubId !== "FREE_AGENTS" && clubId !== userTeamId).flatMap(([, squad]) => squad).filter(
      (p) => p.isOnTransferList && !p.loan && !p.transferPendingClubId && p.clubId !== userTeamId
    );
    if (transferListed.length === 0) return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
    const availableByPosition = /* @__PURE__ */ new Map();
    transferListed.forEach((player) => {
      const positionPool = availableByPosition.get(player.position) ?? [];
      positionPool.push(player);
      availableByPosition.set(player.position, positionPool);
    });
    const sellerClubMap = new Map(updatedClubs.map((c) => [c.id, c]));
    for (const club of _shuffleMarketOrder(
      clubs,
      `AI_TL_CLUB_ORDER_${currentDate.toISOString().slice(0, 10)}`,
      (item) => item.id
    )) {
      if (club.id === userTeamId) continue;
      if (!ReserveTeamLeagueService.canParticipateAsTransferBuyer(club.id)) continue;
      const stagger = windowOpen ? 2 : 12;
      if ((dayOfYear + hashClub(club.id)) % stagger !== 0) continue;
      const clubStrategy = hashClub(club.id) % 4;
      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length >= AI_MAX_SQUAD_SIZE && !_hasCriticalDepthShortage(squad)) continue;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);
      const transferSpendingPower = _getAiTransferSpendingPower(club);
      if (transferSpendingPower <= 25e4) continue;
      const minCounts = MIN_SQUAD_POSITION_COUNTS;
      const idealOvr = 30 + club.reputation * 4.5;
      const needsTL = _assessClubNeeds(club, squad, currentDate, aiStrategy);
      if (needsTL.length === 0) continue;
      const hasCriticalShortageTL = needsTL.some((n) => n.urgency === "CRITICAL" && n.reason === "SHORTAGE");
      const needsTLMap = new Map(needsTL.map((n) => [n.position, n]));
      const marketSnapshot = _buildAiMarketSquadSnapshot(squad);
      const relevantAvailable = Array.from(needsTLMap.keys()).flatMap(
        (position) => availableByPosition.get(position) ?? []
      );
      const candidates = relevantAvailable.filter((p) => {
        if (p.loan) return false;
        if (p.clubId === club.id) return false;
        if (!ReserveTeamLeagueService.canRecruitPlayerFrom(club.id, p.clubId || "FREE_AGENTS")) return false;
        if (_hasActiveTransferLockout(p, currentDate)) return false;
        if (_hasActiveTransferOfferBan(p, currentDate)) return false;
        const paidTransferEffectiveDate = windowOpen ? currentDate : _getNextWindowStart(currentDate);
        if (_shouldUsePreContractInsteadOfPaidTransfer(p, currentDate, paidTransferEffectiveDate)) return false;
        const needTL = needsTLMap.get(p.position);
        if (!needTL) return false;
        if (_isBelowAiMarketQualityFloor(p, club, squad, needTL, marketSnapshot)) return false;
        if (!_canAddBalancedDepth(squad, p.position) && needTL.reason !== "SHORTAGE") return false;
        const ovrCap = Math.min(idealOvr, 95);
        const isQuantityNeed = _isQuantityDepthNeed(needTL, squad, p.position);
        const ovrLow = isQuantityNeed ? 45 : needTL.urgency === "CRITICAL" ? ovrCap - 14 : needTL.urgency === "HIGH" ? ovrCap - 11 : needTL.urgency === "LOW" ? ovrCap - 4 : ovrCap - 8;
        const ovrHigh = isQuantityNeed ? Math.max(ovrCap + 12, 99) : needTL.urgency === "LOW" ? ovrCap + 5 : ovrCap + 10;
        const normalRange = p.overallRating >= ovrLow && p.overallRating <= ovrHigh;
        const bargainRange = p.overallRating > ovrHigh && p.overallRating <= ovrCap + 20;
        if (!normalRange && !bargainRange) return false;
        const positionCount = marketSnapshot.positionCounts.get(p.position) ?? 0;
        const weakestExisting = marketSnapshot.weakestByPosition.get(p.position);
        if (!isQuantityNeed && positionCount >= minCounts[p.position] && weakestExisting && p.overallRating <= weakestExisting.overallRating) return false;
        const sellerClub2 = sellerClubMap.get(p.clubId || "");
        if (!sellerClub2) return false;
        const marketOpportunity = _getTransferListOpportunity(p, club, sellerClub2);
        const sellerSquad2 = updatedPlayersMap[p.clubId || ""] || [];
        const askingPrice2 = TransferSellerLogicService.estimateAskingPrice(p, sellerClub2, sellerSquad2, currentDate);
        const proposedSalary = FinanceService.getFairMarketSalary(p.overallRating);
        const budgetCapNormalBase = hasCriticalShortageTL ? 0.9 : Math.min(0.78, (clubStrategy === 2 ? 0.65 : 0.5) + marketOpportunity.budgetBoost);
        const budgetCapBargainBase = Math.min(0.6, (clubStrategy === 2 ? 0.45 : 0.35) + marketOpportunity.budgetBoost);
        const budgetCapNormal = AiClubTransferStrategyService.budgetCap(budgetCapNormalBase, aiStrategy, {
          needUrgency: needTL.urgency,
          isShortage: needTL.reason === "SHORTAGE",
          askingPrice: askingPrice2
        });
        const budgetCapBargain = AiClubTransferStrategyService.budgetCap(budgetCapBargainBase, aiStrategy, {
          needUrgency: needTL.urgency,
          isShortage: needTL.reason === "SHORTAGE",
          isTransferListed: true,
          askingPrice: askingPrice2
        });
        if (bargainRange && askingPrice2 > transferSpendingPower * budgetCapBargain) return false;
        if (normalRange && askingPrice2 > transferSpendingPower * budgetCapNormal) return false;
        if (!hasCriticalShortageTL && clubStrategy === 1 && p.age > 26 && aiStrategy.ageProfile === "YOUTH") return false;
        if (transferSpendingPower < askingPrice2 + proposedSalary * 0.5) return false;
        return true;
      });
      if (candidates.length === 0) continue;
      const scoreTransferListedCandidate = (candidate) => {
        const candidateSeller = sellerClubMap.get(candidate.clubId || "");
        const need = needsTLMap.get(candidate.position);
        return AiClubTransferStrategyService.candidateScore(candidate, club, aiStrategy, { needUrgency: need?.urgency, isTransferListed: true }) + (candidateSeller ? _getTransferListOpportunity(candidate, club, candidateSeller).scoreBonus : 0) + _getRecruitmentReputationBonus(candidate, clubStrategy, need) + (clubStrategy === 1 ? Math.max(0, 28 - candidate.age) * 0.35 : 0) + (clubStrategy === 0 && candidate.isOnTransferList ? 4 : 0);
      };
      let sortedCandidates = [...candidates];
      if (clubStrategy === 1) {
        sortedCandidates.sort((a, b) => {
          const aSeller = sellerClubMap.get(a.clubId || "");
          const bSeller = sellerClubMap.get(b.clubId || "");
          const aBonus = aSeller ? _getTransferListOpportunity(a, club, aSeller).scoreBonus : 0;
          const bBonus = bSeller ? _getTransferListOpportunity(b, club, bSeller).scoreBonus : 0;
          const aNeed = needsTLMap.get(a.position);
          const bNeed = needsTLMap.get(b.position);
          const aScore = AiClubTransferStrategyService.candidateScore(a, club, aiStrategy, { needUrgency: aNeed?.urgency, isTransferListed: true }) + aBonus + _getRecruitmentReputationBonus(a, clubStrategy, aNeed);
          const bScore = AiClubTransferStrategyService.candidateScore(b, club, aiStrategy, { needUrgency: bNeed?.urgency, isTransferListed: true }) + bBonus + _getRecruitmentReputationBonus(b, clubStrategy, bNeed);
          return a.age - b.age || bScore - aScore;
        });
      } else if (clubStrategy === 0) {
        sortedCandidates.sort((a, b) => {
          const aSeller = sellerClubMap.get(a.clubId || "");
          const bSeller = sellerClubMap.get(b.clubId || "");
          const aNeed = needsTLMap.get(a.position);
          const bNeed = needsTLMap.get(b.position);
          const aVal = (a.isOnTransferList ? 20 : 0) + (new Date(a.contractEndDate).getTime() - currentDate.getTime() < PRE_CONTRACT_PRIORITY_DAYS3 * 864e5 ? 10 : 0) + (aSeller ? _getTransferListOpportunity(a, club, aSeller).scoreBonus : 0) + _getRecruitmentReputationBonus(a, clubStrategy, aNeed) + AiClubTransferStrategyService.candidateScore(a, club, aiStrategy, { needUrgency: aNeed?.urgency, isTransferListed: true }) * 0.25;
          const bVal = (b.isOnTransferList ? 20 : 0) + (new Date(b.contractEndDate).getTime() - currentDate.getTime() < PRE_CONTRACT_PRIORITY_DAYS3 * 864e5 ? 10 : 0) + (bSeller ? _getTransferListOpportunity(b, club, bSeller).scoreBonus : 0) + _getRecruitmentReputationBonus(b, clubStrategy, bNeed) + AiClubTransferStrategyService.candidateScore(b, club, aiStrategy, { needUrgency: bNeed?.urgency, isTransferListed: true }) * 0.25;
          return bVal - aVal || a.overallRating - b.overallRating;
        });
      } else {
        sortedCandidates.sort((a, b) => {
          const aSeller = sellerClubMap.get(a.clubId || "");
          const bSeller = sellerClubMap.get(b.clubId || "");
          const aBonus = aSeller ? _getTransferListOpportunity(a, club, aSeller).scoreBonus : 0;
          const bBonus = bSeller ? _getTransferListOpportunity(b, club, bSeller).scoreBonus : 0;
          const aNeed = needsTLMap.get(a.position);
          const bNeed = needsTLMap.get(b.position);
          const aScore = AiClubTransferStrategyService.candidateScore(a, club, aiStrategy, { needUrgency: aNeed?.urgency, isTransferListed: true }) + aBonus + _getRecruitmentReputationBonus(a, clubStrategy, aNeed);
          const bScore = AiClubTransferStrategyService.candidateScore(b, club, aiStrategy, { needUrgency: bNeed?.urgency, isTransferListed: true }) + bBonus + _getRecruitmentReputationBonus(b, clubStrategy, bNeed);
          return bScore - aScore;
        });
      }
      const tlScouting = _getScoutingProfile(club, hasCriticalShortageTL);
      const best = _pickDiscoveredMarketPlayer(
        sortedCandidates,
        `AI_TL_DISCOVERY_${club.id}_${currentDate.toISOString().slice(0, 10)}_${clubStrategy}`,
        scoreTransferListedCandidate,
        {
          discoveryShare: tlScouting.discoveryShare,
          maxPool: tlScouting.maxPool,
          noise: tlScouting.noise,
          qualityBand: tlScouting.qualityBand
        }
      ) || sortedCandidates[0];
      const sellerClub = sellerClubMap.get(best.clubId || "");
      if (!sellerClub) continue;
      const sellerSquad = updatedPlayersMap[best.clubId || ""] || [];
      const askingPrice = TransferSellerLogicService.estimateAskingPrice(best, sellerClub, sellerSquad, currentDate);
      const transferTiming = windowOpen ? "IMMEDIATE" /* IMMEDIATE */ : "IN_SIX_MONTHS" /* IN_SIX_MONTHS */;
      const sellerCoachTL = sellerClub.coachId ? coachesMap[sellerClub.coachId] : null;
      const sellerFavoritesTL = sellerCoachTL?.favoritePlayerIds;
      const stance = TransferSellerLogicService.getNegotiationStance(
        best,
        sellerClub,
        club,
        sellerSquad,
        currentDate,
        transferTiming,
        void 0,
        sellerFavoritesTL
      );
      if (!stance.allowTalks) continue;
      const agreedFee = stance.askingPrice;
      const contractInput = _buildAiTransferContractOffer(
        best,
        sellerClub,
        club,
        sellerSquad,
        squad,
        currentDate,
        needsTLMap.get(best.position)
      );
      if (!contractInput) continue;
      if (transferSpendingPower < agreedFee + contractInput.salary * 0.5) continue;
      const bidInput = { fee: agreedFee, timing: transferTiming };
      const sellerDecision = TransferSellerLogicService.evaluateSellerDecision(
        bidInput,
        best,
        sellerClub,
        club,
        sellerSquad,
        currentDate,
        void 0,
        sellerFavoritesTL
      );
      if (sellerDecision.verdict !== "ACCEPT") continue;
      const playerDecision = TransferPlayerDecisionService.evaluateMove(
        contractInput,
        best,
        sellerClub,
        club,
        sellerSquad,
        squad,
        currentDate
      );
      if (!playerDecision.accepted) {
        logEntries.push({
          id: `TL_REJ_${best.id}_${club.id}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${best.lastName} ${best.firstName}`,
          playerOvr: best.overallRating,
          playerPosition: best.position,
          fromClub: sellerClub.name,
          toClub: club.name,
          status: "PLAYER_REJECTED",
          reason: playerDecision.reason,
          fee: agreedFee,
          playerId: best.id,
          fromClubId: sellerClub.id,
          toClubId: club.id
        });
        continue;
      }
      const reportDate = windowOpen ? new Date(currentDate.getTime() + 3 * 864e5) : _getNextWindowStart(currentDate);
      const sellerClubId = best.clubId || "";
      updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(
        (p) => p.id === best.id ? {
          ...p,
          transferPendingClubId: club.id,
          transferReportDate: reportDate.toISOString(),
          transferPendingFee: agreedFee,
          transferPendingSalary: contractInput.salary,
          transferPendingBonus: contractInput.bonus,
          transferPendingContractYears: contractInput.years,
          interestedClubs: [],
          isOnTransferList: false,
          transferListPrice: void 0,
          transferListDemandUntil: null,
          transferListRemovalPromiseDeadline: null,
          isAvailableForLoan: false
        } : p
      );
      logEntries.push({
        id: `TL_OFFER_${best.id}_${club.id}_${currentDate.getTime()}`,
        date: currentDate.toISOString(),
        playerName: `${best.lastName} ${best.firstName}`,
        playerOvr: best.overallRating,
        playerPosition: best.position,
        fromClub: sellerClub.name,
        toClub: club.name,
        status: "OFFER_MADE",
        fee: agreedFee,
        playerId: best.id,
        fromClubId: sellerClub.id,
        toClubId: club.id
      });
      const positionPool = availableByPosition.get(best.position);
      const idx = positionPool?.findIndex((p) => p.id === best.id) ?? -1;
      if (positionPool && idx !== -1) positionPool.splice(idx, 1);
      updatedClubs = updatedClubs.map((c) => {
        if (c.id === club.id) return _chargeAiTransferFee(c, agreedFee);
        if (c.id === sellerClubId) return { ...c, budget: c.budget + agreedFee };
        return c;
      });
    }
    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },
  /**
   * Realizuje zainteresowania transferowe AI — kluby próbują pozyskać zawodników
   * z interestedClubs którzy NIE są na liście transferowej.
   * Uzupełnia processAiTransferListSignings który obsługuje tylko isOnTransferList.
   * Wywoływana codziennie (stagger co 6 dni per klub).
   */
  processAiInterestedPlayerTargeting: (clubs, playersMap, currentDate, userTeamId, coachesMap = {}) => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries = [];
    const windowOpen = _isTransferWindowOpen(currentDate);
    const sellerClubMap = new Map(updatedClubs.map((c) => [c.id, c]));
    const otherClubPlayersById = /* @__PURE__ */ new Map();
    const buyingClubIds = /* @__PURE__ */ new Set();
    const paidTransferEffectiveDate = windowOpen ? currentDate : _getNextWindowStart(currentDate);
    const fullScanMarketIndex = [];
    const newlyPendingPlayerIds = /* @__PURE__ */ new Set();
    Object.entries(updatedPlayersMap).forEach(([cId, squadList]) => {
      squadList.forEach((p) => {
        if (p.transferPendingClubId) buyingClubIds.add(p.transferPendingClubId);
        if (cId === "FREE_AGENTS" || cId === userTeamId) return;
        otherClubPlayersById.set(p.id, p);
        if (p.loan) return;
        if (_hasActiveTransferLockout(p, currentDate)) return;
        if (_hasActiveTransferOfferBan(p, currentDate)) return;
        if (p.isOnTransferList || p.transferPendingClubId) return;
        if (_shouldUsePreContractInsteadOfPaidTransfer(p, currentDate, paidTransferEffectiveDate)) return;
        fullScanMarketIndex.push({ player: p, sourceClubId: cId });
      });
    });
    for (const club of _shuffleMarketOrder(
      clubs,
      `AI_IT_CLUB_ORDER_${currentDate.toISOString().slice(0, 10)}`,
      (item) => item.id
    )) {
      if (club.id === userTeamId) continue;
      if (!ReserveTeamLeagueService.canParticipateAsTransferBuyer(club.id)) continue;
      const transferSpendingPower = _getAiTransferSpendingPower(club);
      if (transferSpendingPower <= 5e5) continue;
      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length >= AI_MAX_SQUAD_SIZE && !_hasCriticalDepthShortage(squad)) continue;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);
      const idealOvr = 30 + club.reputation * 4.5;
      const isGulfStarHunter = _isGulfStarHunterClub(club);
      const needsIT = _assessClubNeeds(club, squad, currentDate, aiStrategy);
      if (needsIT.length === 0 && !isGulfStarHunter) continue;
      const hasCriticalShortageIT = needsIT.some((n) => n.urgency === "CRITICAL" && n.reason === "SHORTAGE");
      const needsITMap = new Map(needsIT.map((n) => [n.position, n]));
      if (buyingClubIds.has(club.id)) continue;
      const scoutCache = club.aiScoutedTargets;
      const cacheAgeDays = scoutCache?.lastRefreshDate ? Math.floor((currentDate.getTime() - new Date(scoutCache.lastRefreshDate).getTime()) / 864e5) : Number.POSITIVE_INFINITY;
      const cacheStale = cacheAgeDays >= AI_SCOUTING_REFRESH_DAYS;
      const useFullScan = hasCriticalShortageIT || isGulfStarHunter || cacheStale;
      const targetPool = useFullScan ? fullScanMarketIndex : (scoutCache?.interestedPlayerIds ?? []).map((id) => otherClubPlayersById.get(id)).filter((p) => !!p && p.clubId !== club.id).map((player) => ({ player, sourceClubId: player.clubId || "" }));
      const targets = _buildInterestedPlayerTargets(
        targetPool,
        club,
        squad,
        needsITMap,
        idealOvr,
        isGulfStarHunter,
        windowOpen,
        currentDate,
        sellerClubMap,
        { prevalidatedForDate: useFullScan, newlyPendingPlayerIds }
      );
      if (cacheStale) {
        const refreshScouting = _getScoutingProfile(club, false);
        const discoveredPool = _computeDiscoveredPool(
          targets,
          `AI_IT_SCOUT_REFRESH_${club.id}_${currentDate.toISOString().slice(0, 10)}`,
          (player) => AiClubTransferStrategyService.candidateScore(player, club, aiStrategy, { needUrgency: needsITMap.get(player.position)?.urgency }) + _getRecruitmentReputationBonus(player, 2, needsITMap.get(player.position)),
          refreshScouting
        );
        const nextAiScoutedTargets = {
          lastRefreshDate: currentDate.toISOString(),
          freeAgentIds: scoutCache?.freeAgentIds ?? [],
          interestedPlayerIds: discoveredPool.map((entry) => entry.player.id)
        };
        updatedClubs = updatedClubs.map((c) => c.id === club.id ? { ...c, aiScoutedTargets: nextAiScoutedTargets } : c);
      }
      if (targets.length === 0) continue;
      const itScouting = _getScoutingProfile(club, hasCriticalShortageIT);
      const target = _pickDiscoveredMarketPlayer(
        targets,
        `AI_IT_DISCOVERY_${club.id}_${currentDate.toISOString().slice(0, 10)}`,
        (player) => AiClubTransferStrategyService.candidateScore(player, club, aiStrategy, { needUrgency: needsITMap.get(player.position)?.urgency }) + _getRecruitmentReputationBonus(player, 2, needsITMap.get(player.position)),
        {
          discoveryShare: itScouting.discoveryShare,
          maxPool: itScouting.maxPool,
          noise: itScouting.noise,
          qualityBand: itScouting.qualityBand
        }
      );
      if (!target) continue;
      const sellerClub = sellerClubMap.get(target.clubId || "");
      if (!sellerClub) continue;
      const sellerSquad = updatedPlayersMap[target.clubId || ""] || [];
      const askingPrice = TransferSellerLogicService.estimateAskingPrice(target, sellerClub, sellerSquad, currentDate);
      const isGulfVeteranStarTarget = isGulfStarHunter && _isExpiringBigClubVeteranStar(target, sellerClub, currentDate);
      const gulfVeteranStarOffer = isGulfVeteranStarTarget ? _buildGulfStarOffer(target, club, currentDate) : null;
      const aiContractOffer = gulfVeteranStarOffer ? {
        salary: gulfVeteranStarOffer.proposedSalary,
        bonus: gulfVeteranStarOffer.proposedBonus,
        years: gulfVeteranStarOffer.contractYears
      } : _buildAiTransferContractOffer(
        target,
        sellerClub,
        club,
        sellerSquad,
        squad,
        currentDate,
        needsITMap.get(target.position)
      );
      if (!aiContractOffer) continue;
      const proposedSalary = aiContractOffer.salary;
      if (transferSpendingPower < askingPrice + proposedSalary * 0.5) continue;
      const budgetCapIT = AiClubTransferStrategyService.budgetCap(
        isGulfVeteranStarTarget ? 0.88 : hasCriticalShortageIT ? 0.9 : Math.min(0.7, 0.45 + club.reputation * 0.015),
        aiStrategy,
        { needUrgency: needsITMap.get(target.position)?.urgency, askingPrice }
      );
      if (askingPrice > transferSpendingPower * budgetCapIT) continue;
      const transferTimingInt = windowOpen ? "IMMEDIATE" /* IMMEDIATE */ : "IN_SIX_MONTHS" /* IN_SIX_MONTHS */;
      const sellerCoachIT = sellerClub.coachId ? coachesMap[sellerClub.coachId] : null;
      const sellerFavoritesIT = sellerCoachIT?.favoritePlayerIds;
      const stance = TransferSellerLogicService.getNegotiationStance(
        target,
        sellerClub,
        club,
        sellerSquad,
        currentDate,
        transferTimingInt,
        void 0,
        sellerFavoritesIT
      );
      if (!stance.allowTalks) continue;
      const agreedFee = stance.askingPrice;
      const finalBudgetCapIT = AiClubTransferStrategyService.budgetCap(
        isGulfVeteranStarTarget ? 0.92 : hasCriticalShortageIT ? 0.94 : Math.min(0.82, 0.55 + club.reputation * 0.018),
        aiStrategy,
        { needUrgency: needsITMap.get(target.position)?.urgency, askingPrice: agreedFee }
      );
      if (transferSpendingPower < agreedFee + proposedSalary * 0.5) continue;
      if (agreedFee > transferSpendingPower * finalBudgetCapIT) continue;
      const bidInput = { fee: agreedFee, timing: transferTimingInt };
      const sellerDecision = TransferSellerLogicService.evaluateSellerDecision(
        bidInput,
        target,
        sellerClub,
        club,
        sellerSquad,
        currentDate,
        void 0,
        sellerFavoritesIT
      );
      if (sellerDecision.verdict !== "ACCEPT") continue;
      const contractInput = aiContractOffer;
      const playerDecision = TransferPlayerDecisionService.evaluateMove(
        contractInput,
        target,
        sellerClub,
        club,
        sellerSquad,
        squad,
        currentDate
      );
      const gulfVeteranStarOverrideAccepted = isGulfVeteranStarTarget && Math.random() < _getGulfMegaOfferAcceptanceChance(target);
      if (!playerDecision.accepted && !gulfVeteranStarOverrideAccepted) {
        logEntries.push({
          id: `IT_REJ_${target.id}_${club.id}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${target.lastName} ${target.firstName}`,
          playerOvr: target.overallRating,
          playerPosition: target.position,
          fromClub: sellerClub.name,
          toClub: club.name,
          status: "PLAYER_REJECTED",
          reason: playerDecision.reason,
          fee: agreedFee,
          playerId: target.id,
          fromClubId: sellerClub.id,
          toClubId: club.id
        });
        continue;
      }
      const reportDate = windowOpen ? new Date(currentDate.getTime() + 3 * 864e5) : _getNextWindowStart(currentDate);
      const sellerClubId = target.clubId || "";
      updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(
        (p) => p.id === target.id ? {
          ...p,
          transferPendingClubId: club.id,
          transferReportDate: reportDate.toISOString(),
          transferPendingFee: agreedFee,
          transferPendingSalary: contractInput.salary,
          transferPendingBonus: contractInput.bonus,
          transferPendingContractYears: contractInput.years,
          interestedClubs: [],
          isOnTransferList: false,
          transferListPrice: void 0,
          transferListDemandUntil: null,
          transferListRemovalPromiseDeadline: null,
          isAvailableForLoan: false,
          retirementLockUntil: gulfVeteranStarOffer?.newEndDate ?? p.retirementLockUntil
        } : p
      );
      newlyPendingPlayerIds.add(target.id);
      logEntries.push({
        id: `IT_OFFER_${target.id}_${club.id}_${currentDate.getTime()}`,
        date: currentDate.toISOString(),
        playerName: `${target.lastName} ${target.firstName}`,
        playerOvr: target.overallRating,
        playerPosition: target.position,
        fromClub: sellerClub.name,
        toClub: club.name,
        status: "OFFER_MADE",
        fee: agreedFee,
        playerId: target.id,
        fromClubId: sellerClub.id,
        toClubId: club.id,
        isGulfMegaOffer: isGulfVeteranStarTarget,
        salary: isGulfVeteranStarTarget ? contractInput.salary : void 0,
        bonus: isGulfVeteranStarTarget ? contractInput.bonus : void 0,
        contractYears: isGulfVeteranStarTarget ? contractInput.years : void 0
      });
      updatedClubs = updatedClubs.map((c) => {
        if (c.id === club.id) return _chargeAiTransferFee(c, agreedFee);
        if (c.id === sellerClubId) return { ...c, budget: c.budget + agreedFee };
        return c;
      });
    }
    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },
  /**
   * Wykonuje oczekujące transfery AI (tag TRSF) gdy transferReportDate <= dziś.
   * Wywoływana codziennie.
   *
   * Przy wykonaniu:
   *   - Ponowna weryfikacja budżetu kupującego (mógł zmaleć w międzyczasie)
   *   - Przenosi zawodnika ze składu sprzedającego do kupującego
   *   - Rozlicza opłatę transferową między klubami
   *   - Czyści tagi TRSF
   */
  processAiPreContractOpportunities: (clubs, playersMap, currentDate, userTeamId) => {
    const updatedPlayersMap = { ...playersMap };
    const logEntries = [];
    const todayKey = currentDate.toISOString().slice(0, 10);
    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 864e5
    );
    const signedPlayerIds = /* @__PURE__ */ new Set();
    const positions = [
      "GK" /* GK */,
      "DEF" /* DEF */,
      "MID" /* MID */,
      "FWD" /* FWD */
    ];
    const signedHash = (value) => {
      let hash = 0;
      for (let index = 0; index < value.length; index += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(index) | 0;
      }
      return hash;
    };
    const powerOf31 = (length) => {
      let value = 1;
      for (let index = 0; index < length; index += 1) value = Math.imul(value, 31);
      return value;
    };
    const clubById = new Map(clubs.map((club) => [club.id, club]));
    const buyerContexts = clubs.filter((buyer) => buyer.id !== userTeamId && buyer.id !== "FREE_AGENTS").map((buyerClub) => {
      const buyerSquad = updatedPlayersMap[buyerClub.id] || [];
      const strategy = AiClubTransferStrategyService.buildStrategy(buyerClub);
      const needs = _assessClubNeeds(buyerClub, buyerSquad, currentDate, strategy);
      const needPositions = new Set(needs.map((need) => need.position));
      const positionAverages = /* @__PURE__ */ new Map();
      const balancedDepth = /* @__PURE__ */ new Map();
      positions.forEach((position) => {
        positionAverages.set(position, _getPositionAverageOverall(buyerSquad, position));
        balancedDepth.set(position, _canAddBalancedDepth(buyerSquad, position));
      });
      return {
        buyerClub,
        buyerSquad,
        needPositions,
        positionAverages,
        balancedDepth,
        // Hashing `${buyer.id}_${player.id}` character by character for 4.3
        // million pairs was the largest remaining cost after squad-profile
        // caching. Store the prefix hash and combine it with the player hash
        // through the exact same 32-bit polynomial formula.
        staggerHashPrefix: signedHash(`${buyerClub.id}_`),
        hasCriticalDepthShortage: _hasCriticalDepthShortage(buyerSquad),
        canMonitorEliteWatchlist: buyerClub.reputation >= ELITE_PRE_CONTRACT_WATCHLIST_MIN_REPUTATION
      };
    });
    const buyerContextsBySellerId = /* @__PURE__ */ new Map();
    const getBuyerContextsForSeller = (sellerClubId) => {
      const cached = buyerContextsBySellerId.get(sellerClubId);
      if (cached) return cached;
      const eligible = buyerContexts.filter(
        ({ buyerClub }) => buyerClub.id !== sellerClubId && ReserveTeamLeagueService.canRecruitPlayerFrom(buyerClub.id, sellerClubId)
      );
      buyerContextsBySellerId.set(sellerClubId, eligible);
      return eligible;
    };
    for (const sellerClub of clubs) {
      if (sellerClub.id === userTeamId || sellerClub.id === "FREE_AGENTS") continue;
      const sellerSquad = updatedPlayersMap[sellerClub.id] || [];
      if (sellerSquad.length === 0) continue;
      for (const player of sellerSquad) {
        if (signedPlayerIds.has(player.id)) continue;
        if (player.loan) continue;
        if (player.transferPendingClubId) continue;
        if (_hasActiveTransferOfferBan(player, currentDate)) continue;
        const daysLeft = Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5);
        if (daysLeft <= 0 || daysLeft > PRE_CONTRACT_PRIORITY_DAYS3) continue;
        const isEliteWatchlistOpportunity = _isElitePreContractWatchlistPlayer(player, currentDate);
        const interestedClubIds = new Set(player.interestedClubs || []);
        const interestedClubs = (player.interestedClubs || []).map((clubId) => clubById.get(clubId)).filter((club) => !!club);
        const playerIdHash = signedHash(player.id);
        const playerIdHashMultiplier = powerOf31(player.id.length);
        const candidateBuyerContexts = getBuyerContextsForSeller(sellerClub.id).filter((context) => {
          const { buyerClub: buyer, buyerSquad } = context;
          const stagger = isEliteWatchlistOpportunity ? 3 : 9;
          const combinedStaggerHash = Math.abs(
            Math.imul(context.staggerHashPrefix, playerIdHashMultiplier) + playerIdHash | 0
          );
          if ((dayOfYear + combinedStaggerHash) % stagger !== 0) return false;
          if (isEliteWatchlistOpportunity && !context.canMonitorEliteWatchlist) return false;
          if (!isEliteWatchlistOpportunity && buyerSquad.length >= AI_MAX_SQUAD_SIZE && !context.hasCriticalDepthShortage) return false;
          const hasPosNeed = context.needPositions.has(player.position);
          const isShortlisted = interestedClubIds.has(buyer.id);
          const buyerPositionAverage = context.positionAverages.get(player.position) ?? 0;
          const sportingUpgrade = player.overallRating >= buyerPositionAverage + 1;
          const stepUp = buyer.reputation >= sellerClub.reputation + 1;
          if (isEliteWatchlistOpportunity) return player.overallRating >= buyerPositionAverage - 2;
          if (!context.balancedDepth.get(player.position) && !hasPosNeed) return false;
          return (hasPosNeed || isShortlisted || stepUp) && sportingUpgrade;
        }).sort((a, b) => {
          const aShortlisted = interestedClubIds.has(a.buyerClub.id) ? 8 : 0;
          const bShortlisted = interestedClubIds.has(b.buyerClub.id) ? 8 : 0;
          const aEliteBonus = isEliteWatchlistOpportunity && a.canMonitorEliteWatchlist ? 40 : 0;
          const bEliteBonus = isEliteWatchlistOpportunity && b.canMonitorEliteWatchlist ? 40 : 0;
          return b.buyerClub.reputation + bShortlisted + bEliteBonus - (a.buyerClub.reputation + aShortlisted + aEliteBonus);
        });
        for (const context of candidateBuyerContexts) {
          const buyerClub = context.buyerClub;
          const buyerSquad = updatedPlayersMap[buyerClub.id] || context.buyerSquad;
          const seedBase = `AI_PRECONTRACT_${todayKey}_${sellerClub.id}_${buyerClub.id}_${player.id}`;
          const isShortlisted = interestedClubIds.has(buyerClub.id);
          const repDelta = buyerClub.reputation - sellerClub.reputation;
          const contractMindflow = PlayerContractMindflowService.evaluate({
            player,
            currentClub: sellerClub,
            currentSquad: sellerSquad,
            currentDate,
            interestedClubs,
            targetClub: buyerClub,
            targetSquad: buyerSquad
          });
          if (!contractMindflow.externalOfferGate.willListen) continue;
          if (!contractMindflow.externalOfferGate.canSignPreContract) continue;
          let chance = isEliteWatchlistOpportunity ? daysLeft <= 90 ? 0.3 : daysLeft <= 180 ? 0.22 : 0.14 : daysLeft <= 90 ? 0.06 : daysLeft <= 180 ? 0.04 : 0.018;
          if (isShortlisted) chance *= 2.4;
          if (repDelta >= 3) chance *= 1.8;
          else if (repDelta >= 1) chance *= 1.35;
          else if (repDelta < 0) chance *= 0.45;
          if (!isEliteWatchlistOpportunity && (player.squadRole === "KEY_PLAYER" || player.isUntouchable)) chance *= 0.6;
          if (player.isNegotiationPermanentBlocked) chance *= 2.2;
          if (player.isOnTransferList) chance *= 1.35;
          chance *= contractMindflow.externalOfferGate.preContractChanceMultiplier;
          if (_seededRandom(`${seedBase}_ROLL`) >= Math.min(isEliteWatchlistOpportunity ? 0.65 : 0.2, chance)) continue;
          const offer = _buildAiPreContractOffer(player, sellerClub, buyerClub, currentDate, isEliteWatchlistOpportunity);
          if (buyerClub.budget < offer.bonus + offer.salary * offer.years) continue;
          const decision = TransferPlayerDecisionService.evaluateMove(
            { salary: offer.salary, bonus: offer.bonus, years: offer.years },
            player,
            sellerClub,
            buyerClub,
            sellerSquad,
            buyerSquad,
            currentDate
          );
          if (!decision.accepted) continue;
          updatedPlayersMap[sellerClub.id] = (updatedPlayersMap[sellerClub.id] || []).map(
            (p) => p.id === player.id ? {
              ...p,
              transferPendingClubId: buyerClub.id,
              transferReportDate: _getPreContractJoinDate(player),
              transferPendingFee: 0,
              transferPendingSalary: offer.salary,
              transferPendingBonus: offer.bonus,
              transferPendingContractYears: offer.years,
              interestedClubs: [],
              isOnTransferList: false,
              transferListPrice: void 0,
              transferListDemandUntil: null,
              transferListRemovalPromiseDeadline: null,
              isAvailableForLoan: false
            } : p
          );
          signedPlayerIds.add(player.id);
          logEntries.push({
            id: `AI_PRECONTRACT_${player.id}_${buyerClub.id}_${currentDate.getTime()}`,
            date: currentDate.toISOString(),
            playerName: `${player.lastName} ${player.firstName}`,
            playerOvr: player.overallRating,
            playerPosition: player.position,
            fromClub: sellerClub.name,
            toClub: buyerClub.name,
            status: "OFFER_MADE",
            reason: `Prekontrakt po wyga\u015Bni\u0119ciu umowy (${new Date(player.contractEndDate).toLocaleDateString("pl-PL")})`,
            fee: 0,
            playerId: player.id,
            fromClubId: sellerClub.id,
            toClubId: buyerClub.id,
            salary: offer.salary,
            bonus: offer.bonus,
            contractYears: offer.years
          });
          break;
        }
      }
    }
    return { updatedPlayers: updatedPlayersMap, logEntries };
  },
  resolveAiTransferPending: (clubs, playersMap, currentDate, userTeamId) => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries = [];
    const today = new Date(currentDate).setHours(0, 0, 0, 0);
    Object.entries(updatedPlayersMap).forEach(([clubId, squad]) => {
      let changed = false;
      const normalizedSquad = squad.map((player) => {
        const normalizedPlayer = _protectPendingTransferPlayerFromMarket(player);
        if (normalizedPlayer !== player) changed = true;
        return normalizedPlayer;
      });
      if (changed) updatedPlayersMap[clubId] = normalizedSquad;
    });
    const windowOpen = _isTransferWindowOpen(currentDate);
    for (const sellerClubId of Object.keys(updatedPlayersMap)) {
      const sourceIsFreeAgent = sellerClubId === "FREE_AGENTS";
      const squad = updatedPlayersMap[sellerClubId] || [];
      const due = squad.filter(
        (p) => p.transferPendingClubId && p.transferReportDate && (windowOpen || (p.transferPendingFee ?? 0) === 0) && new Date(p.transferReportDate).setHours(0, 0, 0, 0) <= today
      );
      for (const player of due) {
        const buyerClubId = player.transferPendingClubId;
        const buyerClub = updatedClubs.find((c) => c.id === buyerClubId);
        const sellerClub = updatedClubs.find((c) => c.id === sellerClubId);
        if (!buyerClub || !sourceIsFreeAgent && !sellerClub) {
          updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(
            (p) => p.id === player.id ? { ...p, transferPendingClubId: void 0, transferReportDate: void 0 } : p
          );
          continue;
        }
        const clubStructureBlockReason = ReserveTeamLeagueService.canRecruitPlayerFrom(buyerClubId, sellerClubId) ? null : "Dru\u017Cyny rezerw nie uczestnicz\u0105 w zakupach, a ruchy mi\u0119dzy pierwsz\u0105 dru\u017Cyn\u0105 i jej rezerwami nie s\u0105 transferami rynkowymi.";
        const transferBlockReason = sourceIsFreeAgent ? clubStructureBlockReason : clubStructureBlockReason ?? PrestigeTransferGuardService.getBlockedReason(player, buyerClub);
        if (transferBlockReason) {
          const refundFee = player.transferPendingFee ?? 0;
          if (refundFee > 0) {
            updatedClubs = updatedClubs.map((c) => {
              if (c.id === buyerClubId) {
                return {
                  ...c,
                  budget: c.budget + refundFee,
                  transferBudget: (c.transferBudget || 0) + refundFee
                };
              }
              if (sellerClub && c.id === sellerClubId) return { ...c, budget: c.budget - refundFee };
              return c;
            });
          }
          updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(
            (p) => p.id === player.id ? {
              ...p,
              transferPendingClubId: void 0,
              transferReportDate: void 0,
              transferPendingFee: void 0,
              transferPendingSalary: void 0,
              transferPendingBonus: void 0,
              transferPendingContractYears: void 0
            } : p
          );
          logEntries.push({
            id: `RES_PRESTIGE_REJ_${player.id}_${buyerClubId}_${currentDate.getTime()}`,
            date: currentDate.toISOString(),
            playerName: `${player.lastName} ${player.firstName}`,
            playerOvr: player.overallRating,
            playerPosition: player.position,
            fromClub: sellerClub?.name ?? "Bez klubu",
            toClub: buyerClub.name,
            status: "PLAYER_REJECTED",
            reason: transferBlockReason,
            fee: refundFee,
            playerId: player.id,
            fromClubId: sellerClub?.id,
            toClubId: buyerClub.id
          });
          continue;
        }
        const sourceReputation = sellerClub?.reputation ?? buyerClub.reputation;
        const repDeltaRes = buyerClub.reputation - sourceReputation;
        const salaryMultAI_Res = repDeltaRes <= -2 ? 1.4 : repDeltaRes === -1 ? 1.25 : 1.12;
        const proposedSalary = player.transferPendingSalary ?? Math.max(FinanceService.getFairMarketSalary(player.overallRating), Math.round(player.annualSalary * salaryMultAI_Res));
        const ageBonusMult_Res = player.age < 24 ? 0.4 : player.age <= 29 ? 0.65 : player.age <= 33 ? 1 : 1.3;
        const repBonusPremium_Res = repDeltaRes < 0 ? 0.4 : repDeltaRes === 0 ? 0.1 : 0;
        const proposedBonus = player.transferPendingBonus ?? Math.floor(player.annualSalary * (ageBonusMult_Res + repBonusPremium_Res));
        const gulfOwnerShortfallCover = _getGulfOwnerShortfallCover(buyerClub, proposedBonus);
        if (gulfOwnerShortfallCover > 0) {
          updatedClubs = updatedClubs.map(
            (c) => c.id === buyerClubId ? { ...c, budget: c.budget + gulfOwnerShortfallCover } : c
          );
        }
        if (!sourceIsFreeAgent && sellerClub && buyerClub.budget + gulfOwnerShortfallCover < proposedBonus) {
          const refundFee = player.transferPendingFee ?? TransferSellerLogicService.estimateAskingPrice(player, sellerClub, updatedPlayersMap[sellerClubId] || [], currentDate);
          updatedClubs = updatedClubs.map((c) => {
            if (c.id === buyerClubId) {
              return {
                ...c,
                budget: c.budget + refundFee,
                transferBudget: (c.transferBudget || 0) + refundFee
              };
            }
            if (c.id === sellerClubId) return { ...c, budget: c.budget - refundFee };
            return c;
          });
          updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(
            (p) => p.id === player.id ? {
              ...p,
              transferPendingClubId: void 0,
              transferReportDate: void 0,
              transferPendingFee: void 0,
              transferPendingSalary: void 0,
              transferPendingBonus: void 0,
              transferPendingContractYears: void 0
            } : p
          );
          logEntries.push({
            id: `RES_NOBUDGET_${player.id}_${buyerClubId}_${currentDate.getTime()}`,
            date: currentDate.toISOString(),
            playerName: `${player.lastName} ${player.firstName}`,
            playerOvr: player.overallRating,
            playerPosition: player.position,
            fromClub: sellerClub.name,
            toClub: buyerClub.name,
            status: "CANCELLED_NO_BUDGET",
            reason: `Brak \u015Brodk\xF3w na bonus ( ${proposedBonus.toLocaleString("pl-PL")} PLN)`,
            fee: refundFee,
            playerId: player.id,
            fromClubId: sellerClub.id,
            toClubId: buyerClub.id
          });
          continue;
        }
        const contractYears = player.transferPendingContractYears ?? (player.age <= 27 ? 4 : player.age <= 30 ? 3 : player.age <= 34 ? 2 : 1);
        const newEndDate = new Date(currentDate.getFullYear() + contractYears, 5, 30).toISOString();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const sourceClubName = sellerClub?.name ?? "BEZ KLUBU";
        const playerForHistory = !player.history || player.history.length === 0 ? { ...player, history: [{ clubName: sourceClubName, clubId: sellerClubId, fromYear: currentYear - 1, fromMonth: 7, toYear: null, toMonth: null }] } : player;
        const updatedHistory = PlayerCareerService.movePlayer(
          playerForHistory,
          { clubName: buyerClub.name, clubId: buyerClubId },
          currentYear,
          currentMonth,
          { clubName: sourceClubName, clubId: sellerClubId },
          player.transferPendingFee
        );
        const transferredPlayerBase = {
          ...PlayerMoraleService.applyContractSigningMindflowReset(
            PlayerCareerService.resetClubStatsForNewEntry(player),
            currentDate
          ),
          clubId: buyerClubId,
          annualSalary: proposedSalary,
          contractEndDate: newEndDate,
          transferPendingClubId: void 0,
          transferReportDate: void 0,
          transferPendingFee: void 0,
          transferPendingSalary: void 0,
          transferPendingBonus: void 0,
          transferPendingContractYears: void 0,
          aiNegotiationClubId: void 0,
          aiNegotiationResponseDate: void 0,
          isOnTransferList: false,
          isAvailableForLoan: false,
          interestedClubs: [],
          history: updatedHistory,
          transferLockoutUntil: _buildTransferLockoutUntil(currentDate),
          transferOfferBanUntil: _buildTransferOfferBanUntil(currentDate)
        };
        const transferredPlayer = PlayerClubAdaptationService.beginForClub(
          PlayerReputationGrowthService.applyTransferUpgrade(
            transferredPlayerBase,
            sourceReputation,
            buyerClub.reputation
          ),
          buyerClubId,
          currentDate
        );
        updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).filter((p) => p.id !== player.id);
        updatedPlayersMap[buyerClubId] = [
          ...(updatedPlayersMap[buyerClubId] || []).filter((p) => p.id !== player.id),
          transferredPlayer
        ];
        updatedClubs = updatedClubs.map((club) => {
          if (!sourceIsFreeAgent && club.id === sellerClubId) {
            return { ...club, rosterIds: club.rosterIds.filter((playerId) => playerId !== player.id) };
          }
          if (club.id === buyerClubId) {
            return { ...club, rosterIds: [...club.rosterIds.filter((playerId) => playerId !== player.id), player.id] };
          }
          return club;
        });
        logEntries.push({
          id: `RES_SIGNED_${player.id}_${buyerClubId}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${player.lastName} ${player.firstName}`,
          playerOvr: player.overallRating,
          playerPosition: player.position,
          fromClub: sourceClubName === "BEZ KLUBU" ? "Bez klubu" : sourceClubName,
          toClub: buyerClub.name,
          status: "TRANSFER_SIGNED",
          fee: player.transferPendingFee,
          playerId: player.id,
          fromClubId: sellerClub?.id,
          toClubId: buyerClub.id,
          isGulfMegaOffer: !!player.retirementLockUntil && _isGulfStarHunterClub(buyerClub),
          salary: player.retirementLockUntil ? proposedSalary : void 0,
          bonus: player.retirementLockUntil ? proposedBonus : void 0,
          contractYears: player.retirementLockUntil ? contractYears : void 0
        });
        updatedClubs = updatedClubs.map((c) => {
          if (c.id === buyerClubId) return { ...c, budget: Math.max(0, c.budget - proposedBonus) };
          return c;
        });
      }
    }
    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },
  /**
     * Miesięczny przegląd wydajności zawodników AI-klubów.
     * Wywoływany 1. dnia każdego miesiąca.
     *
     * Zawodnik trafia na listę transferową jeśli spełni JEDNO z kryteriów:
     *   A) Wydajnościowe — słabe statystyki sezonowe (min. 6 meczów):
     *      - FWD: goals/gp < 0.08
     *      - MID: (goals+assists)/gp < 0.07
     *      - DEF/GK: średnia ratingHistory (ostatnie 5) < 5.5
     *   B) Brak gry — mniej niż 35% oczekiwanych meczów i nie kontuzjowany
     *
     * Zabezpieczenia (anty-chaos):
     *   - isUntouchable → nigdy nie wystawiony
     *   - Minimalna głębokość składu: GK≥2, DEF≥4, MID≥4, FWD≥2
     *   - Losowość 30–50% per zawodnik per miesiąc (seed deterministyczny)
     *   - Max 2 zawodników wystawionych per klub per miesiąc
     */
  processMonthlyPlayerReview: (clubs, playersMap, currentDate, userTeamId) => {
    const updatedPlayersMap = { ...playersMap };
    const currentMonth = currentDate.getMonth();
    const monthsIntoSeason = currentMonth >= 6 ? currentMonth - 6 : currentMonth + 6;
    if (monthsIntoSeason < 2) return { updatedPlayers: updatedPlayersMap };
    const expectedMatches = monthsIntoSeason * 2;
    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      const squad = updatedPlayersMap[club.id];
      if (!squad || squad.length === 0) continue;
      if (squad.length <= AI_TARGET_SQUAD_SIZE) continue;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);
      const counts = {
        GK: squad.filter((p) => p.position === "GK").length,
        DEF: squad.filter((p) => p.position === "DEF").length,
        MID: squad.filter((p) => p.position === "MID").length,
        FWD: squad.filter((p) => p.position === "FWD").length
      };
      const minCounts = MIN_SQUAD_POSITION_COUNTS;
      let listedThisMonth = 0;
      const updatedSquad = squad.map((player) => {
        if (listedThisMonth >= 2) return player;
        if (player.loan) return player;
        if (_isProtectedNewSigning(player, currentDate)) return player;
        if (player.isOnTransferList || player.isUntouchable || !!player.transferPendingClubId) return player;
        const posKey = player.position;
        if (counts[posKey] <= minCounts[posKey]) return player;
        const gp = player.stats.matchesPlayed;
        const playRatio = gp / Math.max(1, expectedMatches);
        const isRarelyPlaying = playRatio < 0.35 && player.health.status !== "INJURED";
        let isPoorPerformer = false;
        if (gp >= 6) {
          if (player.position === "FWD") {
            isPoorPerformer = player.stats.goals / gp < 0.08;
          } else if (player.position === "MID") {
            isPoorPerformer = (player.stats.goals + player.stats.assists) / gp < 0.07;
          } else {
            const hist = player.stats.ratingHistory || [];
            if (hist.length >= 5) {
              const avgRating = hist.slice(-5).reduce((s, r) => s + r, 0) / 5;
              isPoorPerformer = avgRating < 5.5;
            }
          }
        }
        if (!isRarelyPlaying && !isPoorPerformer) return player;
        const monthKey = currentDate.getFullYear() * 100 + (currentDate.getMonth() + 1);
        const seed = Math.abs(
          monthKey * 31337 ^ player.id.split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0) | 0, 0) ^ club.id.split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0) | 0, 0)
        );
        const rand = Math.sin(seed) * 1e4;
        const chance = rand - Math.floor(rand);
        const reputationPatience = _getPlayerReputationScore(player) * 0.03;
        const strategyPatience = (aiStrategy.patience - 0.5) * 0.18;
        const strategyAggression = (aiStrategy.budgetAggression - 1) * 0.16;
        const listingChance = _clamp(0.3 + club.reputation / 100 * 0.2 - reputationPatience - strategyPatience + strategyAggression, 0.08, 0.62);
        if (chance > listingChance) return player;
        if (_isInLastContractYear(player, currentDate)) return player;
        counts[posKey]--;
        listedThisMonth++;
        return { ...player, isOnTransferList: true };
      });
      updatedPlayersMap[club.id] = updatedSquad;
    }
    return { updatedPlayers: updatedPlayersMap };
  },
  generateSeasonYouthIntakeForAiClubs: (clubs, playersMap, currentDate, userTeamId) => {
    let updatedPlayersMap = { ...playersMap };
    let generatedCount = 0;
    const seasonYear = currentDate.getMonth() >= 6 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
    const allIdsInUse = new Set(Object.values(playersMap).flat().map((player) => player.id));
    const updatedClubs = clubs.map((club) => {
      if (club.id === userTeamId || club.id === "FREE_AGENTS" || !club.leagueId) return club;
      const existingSquad = updatedPlayersMap[club.id] || [];
      if (existingSquad.length === 0) return club;
      const intakePrefix = _buildAiYouthSeasonPrefix(seasonYear, club.id);
      const alreadyGeneratedThisSeason = Array.from({ length: AI_SEASON_YOUTH_MAX_INTAKE }, (_, index) => index).filter((index) => allIdsInUse.has(`${intakePrefix}_${index}`)).length;
      if (alreadyGeneratedThisSeason >= AI_SEASON_YOUTH_MAX_INTAKE) return club;
      const desiredCount = _getAiSeasonYouthIntakeCount(existingSquad.length, `${seasonYear}_${club.id}`);
      const missingCount = _clamp(
        desiredCount - alreadyGeneratedThisSeason,
        0,
        AI_SEASON_YOUTH_MAX_INTAKE - alreadyGeneratedThisSeason
      );
      if (missingCount <= 0) return club;
      let workingSquad = [...existingSquad];
      const createdPlayers = [];
      for (let localSlot = 0; localSlot < missingCount; localSlot++) {
        const slot = Array.from({ length: AI_SEASON_YOUTH_MAX_INTAKE }, (_, index) => index).find((index) => !allIdsInUse.has(`${intakePrefix}_${index}`) && !workingSquad.some((player) => player.id === `${intakePrefix}_${index}`));
        if (slot === void 0) break;
        const position = _pickAiYouthPosition(workingSquad, `${seasonYear}_${club.id}`, slot);
        const youthPlayer = _buildAiSeasonYouthPlayer(club, workingSquad, position, currentDate, seasonYear, slot);
        workingSquad = [...workingSquad, youthPlayer];
        createdPlayers.push(youthPlayer);
      }
      if (createdPlayers.length === 0) return club;
      generatedCount += createdPlayers.length;
      updatedPlayersMap[club.id] = workingSquad;
      const rosterIdSet = /* @__PURE__ */ new Set([...club.rosterIds || [], ...createdPlayers.map((player) => player.id)]);
      return {
        ...club,
        rosterIds: Array.from(rosterIdSet)
      };
    });
    return { updatedClubs, updatedPlayers: updatedPlayersMap, generatedCount };
  },
  performSeasonSquadReview: (clubs, playersMap, currentDate, userTeamId) => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    updatedClubs = updatedClubs.map((club) => {
      if (club.id === userTeamId) return club;
      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length === 0) return club;
      if (squad.length <= AI_TARGET_SQUAD_SIZE) return club;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);
      const counts = {
        GK: squad.filter((p) => p.position === "GK").length,
        DEF: squad.filter((p) => p.position === "DEF").length,
        MID: squad.filter((p) => p.position === "MID").length,
        FWD: squad.filter((p) => p.position === "FWD").length
      };
      const rankedSquad = [...squad].sort((a, b) => {
        const scoreA = _getSquadReviewScore(a) - AiClubTransferStrategyService.outgoingScore(a, club, aiStrategy) * 0.25;
        const scoreB = _getSquadReviewScore(b) - AiClubTransferStrategyService.outgoingScore(b, club, aiStrategy) * 0.25;
        return scoreA - scoreB;
      });
      const numToRemove = Math.floor(Math.random() * 5);
      let removedCount = 0;
      let finalSquad = [...squad];
      let currentClub = { ...club };
      for (const candidate of rankedSquad) {
        if (removedCount >= numToRemove) break;
        if (candidate.loan || candidate.isUntouchable || candidate.squadRole === "KEY_PLAYER" || candidate.transferPendingClubId || _isProtectedNewSigning(candidate, currentDate)) continue;
        let canRemove = false;
        if (candidate.position === "GK" && counts.GK > MIN_SQUAD_POSITION_COUNTS["GK" /* GK */]) canRemove = true;
        else if (candidate.position === "DEF" && counts.DEF > MIN_SQUAD_POSITION_COUNTS["DEF" /* DEF */]) canRemove = true;
        else if (candidate.position === "MID" && counts.MID > MIN_SQUAD_POSITION_COUNTS["MID" /* MID */]) canRemove = true;
        else if (candidate.position === "FWD" && counts.FWD > MIN_SQUAD_POSITION_COUNTS["FWD" /* FWD */]) canRemove = true;
        if (canRemove) {
          const decision = FinanceService.evaluateReleaseVsList(candidate);
          let actionTaken = false;
          if (decision === "RELEASE" && _canAiReleasePlayer(candidate, club, currentDate, "SEASON_SQUAD_REVIEW")) {
            const cost = candidate.annualSalary * 0.4;
            if (currentClub.budget >= cost) {
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth() + 1;
              const updatedHistory = PlayerCareerService.movePlayer(
                candidate,
                { clubName: "BEZ KLUBU", clubId: "FREE_AGENTS" },
                currentYear,
                currentMonth,
                { clubName: club.name, clubId: club.id }
              );
              const releasedPlayer = {
                ...PlayerCareerService.resetClubStatsForNewEntry(candidate),
                clubId: "FREE_AGENTS",
                annualSalary: 0,
                contractEndDate: "",
                marketValue: 0,
                negotiationStep: 0,
                isNegotiationPermanentBlocked: false,
                isOnTransferList: false,
                interestedClubs: [],
                transferPendingClubId: void 0,
                transferReportDate: void 0,
                history: updatedHistory
              };
              currentClub.budget -= cost;
              finalSquad = finalSquad.filter((p) => p.id !== candidate.id);
              _appendUniqueToFreeAgents(updatedPlayersMap, releasedPlayer);
              actionTaken = true;
            }
          } else if (!_isInLastContractYear(candidate, currentDate)) {
            finalSquad = finalSquad.map((p) => p.id === candidate.id ? { ...p, isOnTransferList: true } : p);
            actionTaken = true;
          }
          if (actionTaken) {
            counts[candidate.position]--;
            removedCount++;
          }
        }
      }
      currentClub.squadNeeds = {
        GK: Math.max(0, MIN_SQUAD_POSITION_COUNTS["GK" /* GK */] - counts.GK),
        DEF: Math.max(0, MIN_SQUAD_POSITION_COUNTS["DEF" /* DEF */] - counts.DEF),
        MID: Math.max(0, MIN_SQUAD_POSITION_COUNTS["MID" /* MID */] - counts.MID),
        FWD: Math.max(0, MIN_SQUAD_POSITION_COUNTS["FWD" /* FWD */] - counts.FWD)
      };
      updatedPlayersMap[club.id] = finalSquad;
      return currentClub;
    });
    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },
  /**
   * Przegląd 3 najsłabszych zawodników każdego AI-klubu.
   * Wywoływana 2 lipca (start sezonu) i 12 stycznia (przerwa zimowa).
   *
   * Algorytm:
   *   1. Znajdź 3 najsłabszych (ranking: OVR - (wiek-18)*1.5)
   *   2. Zaproponuj niższy/krótszy kontrakt (75-85% pensji, 1 rok)
   *   3. Jeśli zawodnik odmówi → 50/50: zwolnienie LUB lista transferowa
   *   4. Przy zwolnieniu sprawdź: czy budżet >= 40% pensji i czy skład ma zapas na pozycji
   *   5. Jeśli za drogo lub za mało zawodników na pozycji → lista zamiast zwolnienia
   */
  processWeakPlayerContractCuts: (clubs, playersMap, currentDate, userTeamId) => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const minDepth = MIN_SQUAD_POSITION_COUNTS;
    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      const squad = updatedPlayersMap[club.id] || [];
      const squadOutliers = squad.filter((player) => _isSquadLevelOutlier(player, club, squad, currentDate));
      if (squad.length <= AI_TARGET_SQUAD_SIZE && squadOutliers.length === 0) continue;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);
      const eligible = squad.filter(
        (p) => (!p.isOnTransferList || squadOutliers.some((outlier) => outlier.id === p.id)) && !p.isUntouchable && !p.loan && p.squadRole !== "KEY_PLAYER" && !p.transferPendingClubId && !_isProtectedNewSigning(p, currentDate) && !p.isNegotiationPermanentBlocked
      );
      if (eligible.length === 0) continue;
      const ranked = [...eligible].sort((a, b) => {
        const scoreA = _getSquadReviewScore(a) - AiClubTransferStrategyService.outgoingScore(a, club, aiStrategy) * 0.25;
        const scoreB = _getSquadReviewScore(b) - AiClubTransferStrategyService.outgoingScore(b, club, aiStrategy) * 0.25;
        return scoreA - scoreB;
      });
      const outlierIds = new Set(squadOutliers.map((player) => player.id));
      const weakPlayers = [
        ...ranked.filter((player) => outlierIds.has(player.id)),
        ...ranked.filter((player) => !outlierIds.has(player.id)).slice(0, 3)
      ].slice(0, Math.max(3, squadOutliers.length));
      let finalSquad = [...squad];
      let currentClubCopy = { ...updatedClubs.find((c) => c.id === club.id) };
      for (const player of weakPlayers) {
        const salaryReduction = 0.15 + Math.random() * 0.1;
        const proposedSalary = Math.max(5e4, Math.floor(player.annualSalary * (1 - salaryReduction)));
        const acceptChance = player.age >= 32 ? 0.4 : player.age >= 29 ? 0.25 : 0.15;
        const accepted = Math.random() < acceptChance;
        if (accepted) {
          const newEndDate = new Date(currentDate);
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          newEndDate.setMonth(5);
          newEndDate.setDate(30);
          finalSquad = finalSquad.map(
            (p) => p.id === player.id ? {
              ...PlayerMoraleService.applyContractSigningMindflowReset(p, currentDate),
              annualSalary: proposedSalary,
              contractEndDate: newEndDate.toISOString()
            } : p
          );
        } else {
          if (Math.random() < 0.5 && _canAiReleasePlayer(player, club, currentDate, "WEAK_CONTRACT_CUT")) {
            const releaseCost = Math.floor(player.annualSalary * 0.4);
            const posCountAfter = finalSquad.filter((p) => p.position === player.position && p.id !== player.id).length;
            const canRelease = currentClubCopy.budget >= releaseCost && finalSquad.length - 1 >= AI_MIN_SQUAD_SIZE && posCountAfter >= (minDepth[player.position] || 3);
            if (canRelease) {
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth() + 1;
              const updatedHistory = PlayerCareerService.movePlayer(
                player,
                { clubName: "BEZ KLUBU", clubId: "FREE_AGENTS" },
                currentYear,
                currentMonth,
                { clubName: club.name, clubId: club.id }
              );
              const releasedPlayer = {
                ...PlayerCareerService.resetClubStatsForNewEntry(player),
                clubId: "FREE_AGENTS",
                annualSalary: 0,
                contractEndDate: "",
                marketValue: 0,
                negotiationStep: 0,
                isNegotiationPermanentBlocked: false,
                isOnTransferList: false,
                interestedClubs: [],
                transferPendingClubId: void 0,
                transferReportDate: void 0,
                history: updatedHistory
              };
              finalSquad = finalSquad.filter((p) => p.id !== player.id);
              _appendUniqueToFreeAgents(updatedPlayersMap, releasedPlayer);
              currentClubCopy.budget -= releaseCost;
            } else if ((finalSquad.length > AI_TARGET_SQUAD_SIZE || outlierIds.has(player.id)) && !_isInLastContractYear(player, currentDate)) {
              finalSquad = finalSquad.map(
                (p) => p.id === player.id ? { ...p, isOnTransferList: true } : p
              );
            }
          } else if ((finalSquad.length > AI_TARGET_SQUAD_SIZE || outlierIds.has(player.id)) && !_isInLastContractYear(player, currentDate)) {
            finalSquad = finalSquad.map(
              (p) => p.id === player.id ? { ...p, isOnTransferList: true } : p
            );
          }
        }
        updatedPlayersMap[club.id] = finalSquad;
      }
      updatedClubs = updatedClubs.map((c) => c.id === club.id ? currentClubCopy : c);
    }
    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },
  updateClubStars: (clubs, playersMap, userTeamId, coachesMap = {}, currentDate = /* @__PURE__ */ new Date(), sessionSeed = 0) => {
    const updatedPlayersMap = { ...playersMap };
    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      const squad = updatedPlayersMap[club.id];
      if (!squad || squad.length === 0) continue;
      const coach = club.coachId ? coachesMap[club.coachId] || null : null;
      const starIds = new Set(_selectCorePlayerIds(club, squad, coach, currentDate, sessionSeed));
      let squadChanged = false;
      const updatedSquad = squad.map((p) => {
        const isUntouchable = starIds.has(p.id);
        const isOnTransferList = isUntouchable ? false : p.isOnTransferList;
        const transferListPrice = isUntouchable ? void 0 : p.transferListPrice;
        if (p.isUntouchable === isUntouchable && p.isOnTransferList === isOnTransferList && p.transferListPrice === transferListPrice) {
          return p;
        }
        squadChanged = true;
        return { ...p, isUntouchable, isOnTransferList, transferListPrice };
      });
      if (squadChanged) updatedPlayersMap[club.id] = updatedSquad;
    }
    return updatedPlayersMap;
  }
};

// resources/tactics_db.ts
var createSlot = (index, role, x, y) => ({ index, role, x, y });
var TACTICS_DB = [
  {
    id: "4-4-2",
    name: "4-4-2 Classic",
    category: "Neutral",
    attackBias: 50,
    defenseBias: 50,
    pressingIntensity: 50,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      // GK
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      // LB
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      // CB
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      // RB
      createSlot(5, "MID" /* MID */, 0.15, 0.45),
      // LM
      createSlot(6, "MID" /* MID */, 0.38, 0.45),
      // CM
      createSlot(7, "MID" /* MID */, 0.62, 0.45),
      // CM
      createSlot(8, "MID" /* MID */, 0.85, 0.45),
      // RM
      createSlot(9, "FWD" /* FWD */, 0.35, 0.2),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.65, 0.2)
      // ST
    ]
  },
  {
    id: "4-4-2-OFF",
    name: "4-4-2 Offensive",
    category: "Offensive",
    attackBias: 75,
    defenseBias: 35,
    pressingIntensity: 75,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.1, 0.3),
      // LM (Wysoko)
      createSlot(6, "MID" /* MID */, 0.4, 0.5),
      // CM
      createSlot(7, "MID" /* MID */, 0.6, 0.5),
      // CM
      createSlot(8, "MID" /* MID */, 0.9, 0.3),
      // RM (Wysoko)
      createSlot(9, "FWD" /* FWD */, 0.4, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.6, 0.15)
      // ST
    ]
  },
  {
    id: "4-4-2-DEF",
    name: "4-4-2 Defensive",
    category: "Defensive",
    attackBias: 30,
    defenseBias: 80,
    pressingIntensity: 40,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.15, 0.51),
      // LM (Cofnięty)
      createSlot(6, "MID" /* MID */, 0.4, 0.61),
      // CDM
      createSlot(7, "MID" /* MID */, 0.6, 0.61),
      // CDM
      createSlot(8, "MID" /* MID */, 0.85, 0.51),
      // RM (Cofnięty)
      createSlot(9, "FWD" /* FWD */, 0.43, 0.3),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.57, 0.3)
      // ST
    ]
  },
  {
    id: "4-4-2-DIAMOND",
    name: "4-4-2 Diamond",
    category: "Technical",
    attackBias: 60,
    defenseBias: 55,
    pressingIntensity: 60,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.5, 0.65),
      // CDM
      createSlot(6, "MID" /* MID */, 0.25, 0.45),
      // CM (Lewy)
      createSlot(7, "MID" /* MID */, 0.75, 0.45),
      // CM (Prawy)
      createSlot(8, "MID" /* MID */, 0.5, 0.3),
      // CAM
      createSlot(9, "FWD" /* FWD */, 0.35, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.65, 0.15)
      // ST
    ]
  },
  {
    id: "6-3-1",
    name: "6-3-1 Ultra Defensive",
    category: "Park Bus",
    attackBias: 5,
    defenseBias: 95,
    pressingIntensity: 20,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.08, 0.75),
      // LWB
      createSlot(2, "DEF" /* DEF */, 0.25, 0.8),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.42, 0.82),
      // CB
      createSlot(4, "DEF" /* DEF */, 0.58, 0.82),
      // CB
      createSlot(5, "DEF" /* DEF */, 0.75, 0.8),
      // CB
      createSlot(6, "DEF" /* DEF */, 0.92, 0.75),
      // RWB
      createSlot(7, "MID" /* MID */, 0.25, 0.55),
      // CM
      createSlot(8, "MID" /* MID */, 0.5, 0.6),
      // CDM
      createSlot(9, "MID" /* MID */, 0.75, 0.55),
      // CM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.3)
      // ST (Samotny)
    ]
  },
  {
    id: "4-2-4",
    name: "4-2-4 Brazilian",
    category: "Ultra-Offensive",
    attackBias: 90,
    defenseBias: 10,
    pressingIntensity: 85,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.35, 0.55),
      // CM
      createSlot(6, "MID" /* MID */, 0.65, 0.55),
      // CM
      createSlot(7, "FWD" /* FWD */, 0.1, 0.2),
      // LW
      createSlot(8, "FWD" /* FWD */, 0.4, 0.15),
      // ST
      createSlot(9, "FWD" /* FWD */, 0.6, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.9, 0.2)
      // RW
    ]
  },
  {
    id: "4-3-3",
    name: "4-3-3 Offensive",
    category: "Offensive",
    attackBias: 75,
    defenseBias: 30,
    pressingIntensity: 80,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.5, 0.55),
      // CDM
      createSlot(6, "MID" /* MID */, 0.3, 0.45),
      // CM
      createSlot(7, "MID" /* MID */, 0.7, 0.45),
      // CM
      createSlot(8, "FWD" /* FWD */, 0.15, 0.2),
      // LW
      createSlot(9, "FWD" /* FWD */, 0.5, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.85, 0.2)
      // RW
    ]
  },
  {
    id: "4-2-3-1",
    name: "4-2-3-1 Wide",
    category: "Neutral",
    attackBias: 60,
    defenseBias: 60,
    pressingIntensity: 60,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.4, 0.6),
      // CDM
      createSlot(6, "MID" /* MID */, 0.6, 0.6),
      // CDM
      createSlot(7, "MID" /* MID */, 0.15, 0.35),
      // LM/LW
      createSlot(8, "MID" /* MID */, 0.5, 0.35),
      // CAM
      createSlot(9, "MID" /* MID */, 0.85, 0.35),
      // RM/RW
      createSlot(10, "FWD" /* FWD */, 0.5, 0.15)
      // ST
    ]
  },
  {
    id: "3-5-2",
    name: "3-5-2 Possession",
    category: "Neutral",
    attackBias: 65,
    defenseBias: 45,
    pressingIntensity: 70,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.3, 0.75),
      // CB
      createSlot(2, "DEF" /* DEF */, 0.5, 0.75),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.7, 0.75),
      // CB
      createSlot(4, "MID" /* MID */, 0.1, 0.5),
      // LWB
      createSlot(5, "MID" /* MID */, 0.35, 0.55),
      // CM
      createSlot(6, "MID" /* MID */, 0.5, 0.6),
      // CDM
      createSlot(7, "MID" /* MID */, 0.65, 0.55),
      // CM
      createSlot(8, "MID" /* MID */, 0.9, 0.5),
      // RWB
      createSlot(9, "FWD" /* FWD */, 0.4, 0.2),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.6, 0.2)
      // ST
    ]
  },
  {
    id: "5-3-2",
    name: "5-3-2 Fortress",
    category: "Defensive",
    attackBias: 20,
    defenseBias: 90,
    pressingIntensity: 30,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.1, 0.65),
      // LWB
      createSlot(2, "DEF" /* DEF */, 0.3, 0.75),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.5, 0.75),
      // CB
      createSlot(4, "DEF" /* DEF */, 0.7, 0.75),
      // CB
      createSlot(5, "DEF" /* DEF */, 0.9, 0.65),
      // RWB
      createSlot(6, "MID" /* MID */, 0.35, 0.5),
      // CM
      createSlot(7, "MID" /* MID */, 0.5, 0.5),
      // CM
      createSlot(8, "MID" /* MID */, 0.65, 0.5),
      // CM
      createSlot(9, "FWD" /* FWD */, 0.4, 0.25),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.6, 0.25)
      // ST
    ]
  },
  {
    id: "4-5-1",
    name: "4-5-1 Park Bus",
    category: "Defensive",
    attackBias: 30,
    defenseBias: 85,
    pressingIntensity: 40,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.1, 0.5),
      // LM
      createSlot(6, "MID" /* MID */, 0.3, 0.55),
      // CM
      createSlot(7, "MID" /* MID */, 0.5, 0.55),
      // CM
      createSlot(8, "MID" /* MID */, 0.7, 0.55),
      // CM
      createSlot(9, "MID" /* MID */, 0.9, 0.5),
      // RM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.25)
      // ST
    ]
  },
  {
    id: "4-1-4-1",
    name: "4-1-4-1 Control",
    category: "Neutral",
    attackBias: 55,
    defenseBias: 55,
    pressingIntensity: 65,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.5, 0.65),
      // CDM
      createSlot(6, "MID" /* MID */, 0.15, 0.45),
      // LM
      createSlot(7, "MID" /* MID */, 0.38, 0.45),
      // CM
      createSlot(8, "MID" /* MID */, 0.62, 0.45),
      // CM
      createSlot(9, "MID" /* MID */, 0.85, 0.45),
      // RM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.2)
      // ST
    ]
  },
  {
    id: "3-4-3",
    name: "3-4-3 Total",
    category: "Offensive",
    attackBias: 85,
    defenseBias: 20,
    pressingIntensity: 90,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.25, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.5, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.75, 0.75),
      createSlot(4, "MID" /* MID */, 0.1, 0.5),
      // LM
      createSlot(5, "MID" /* MID */, 0.4, 0.5),
      // CM
      createSlot(6, "MID" /* MID */, 0.6, 0.5),
      // CM
      createSlot(7, "MID" /* MID */, 0.9, 0.5),
      // RM
      createSlot(8, "FWD" /* FWD */, 0.2, 0.2),
      // LW
      createSlot(9, "FWD" /* FWD */, 0.5, 0.15),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.8, 0.2)
      // RW
    ]
  },
  {
    id: "5-4-1",
    name: "5-4-1 Diamond",
    category: "Defensive",
    attackBias: 35,
    defenseBias: 80,
    pressingIntensity: 50,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.1, 0.65),
      // LWB
      createSlot(2, "DEF" /* DEF */, 0.3, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.5, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.7, 0.75),
      createSlot(5, "DEF" /* DEF */, 0.9, 0.65),
      // RWB
      createSlot(6, "MID" /* MID */, 0.5, 0.6),
      // CDM
      createSlot(7, "MID" /* MID */, 0.3, 0.5),
      // CM
      createSlot(8, "MID" /* MID */, 0.7, 0.5),
      // CM
      createSlot(9, "MID" /* MID */, 0.5, 0.4),
      // CAM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.2)
      // ST
    ]
  },
  {
    id: "4-3-2-1",
    name: "4-3-2-1 Xmas Tree",
    category: "Neutral",
    attackBias: 60,
    defenseBias: 50,
    pressingIntensity: 55,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.3, 0.55),
      createSlot(6, "MID" /* MID */, 0.5, 0.55),
      createSlot(7, "MID" /* MID */, 0.7, 0.55),
      createSlot(8, "MID" /* MID */, 0.4, 0.35),
      // CAM
      createSlot(9, "MID" /* MID */, 0.6, 0.35),
      // CAM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.2)
      // ST
    ]
  },
  {
    id: "3-4-2-1",
    name: "3-4-2-1 Box Control",
    category: "Technical",
    attackBias: 65,
    defenseBias: 40,
    pressingIntensity: 70,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.25, 0.75),
      // CB
      createSlot(2, "DEF" /* DEF */, 0.5, 0.78),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.75, 0.75),
      // CB
      createSlot(4, "MID" /* MID */, 0.1, 0.5),
      // LWB
      createSlot(5, "MID" /* MID */, 0.38, 0.55),
      // CM
      createSlot(6, "MID" /* MID */, 0.62, 0.55),
      // CM
      createSlot(7, "MID" /* MID */, 0.9, 0.5),
      // RWB
      createSlot(8, "MID" /* MID */, 0.38, 0.35),
      // CAM
      createSlot(9, "MID" /* MID */, 0.62, 0.35),
      // CAM
      createSlot(10, "FWD" /* FWD */, 0.5, 0.15)
      // ST
    ]
  },
  {
    id: "4-3-3-F9",
    name: "4-3-3 False Nine",
    category: "Possession",
    attackBias: 80,
    defenseBias: 35,
    pressingIntensity: 75,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.15, 0.75),
      createSlot(2, "DEF" /* DEF */, 0.38, 0.75),
      createSlot(3, "DEF" /* DEF */, 0.62, 0.75),
      createSlot(4, "DEF" /* DEF */, 0.85, 0.75),
      createSlot(5, "MID" /* MID */, 0.5, 0.65),
      // CDM
      createSlot(6, "MID" /* MID */, 0.3, 0.45),
      // CM
      createSlot(7, "MID" /* MID */, 0.7, 0.45),
      // CM
      createSlot(8, "FWD" /* FWD */, 0.15, 0.25),
      // LW
      createSlot(9, "FWD" /* FWD */, 0.5, 0.35),
      // CF (False Nine)
      createSlot(10, "FWD" /* FWD */, 0.85, 0.25)
      // RW
    ]
  },
  {
    id: "5-2-1-2",
    name: "5-2-1-2 Vertical Counter",
    category: "Counter",
    attackBias: 45,
    defenseBias: 85,
    pressingIntensity: 45,
    slots: [
      createSlot(0, "GK" /* GK */, 0.5, 0.92),
      createSlot(1, "DEF" /* DEF */, 0.1, 0.72),
      // LWB
      createSlot(2, "DEF" /* DEF */, 0.3, 0.78),
      // CB
      createSlot(3, "DEF" /* DEF */, 0.5, 0.82),
      // CB
      createSlot(4, "DEF" /* DEF */, 0.7, 0.78),
      // CB
      createSlot(5, "DEF" /* DEF */, 0.9, 0.72),
      // RWB
      createSlot(6, "MID" /* MID */, 0.4, 0.55),
      // CM
      createSlot(7, "MID" /* MID */, 0.6, 0.55),
      // CM
      createSlot(8, "MID" /* MID */, 0.5, 0.35),
      // CAM
      createSlot(9, "FWD" /* FWD */, 0.38, 0.18),
      // ST
      createSlot(10, "FWD" /* FWD */, 0.62, 0.18)
      // ST
    ]
  }
];
var TacticRepository = {
  getAll: () => TACTICS_DB,
  getById: (id) => TACTICS_DB.find((t) => t.id === id) || TACTICS_DB[0],
  getDefault: () => TACTICS_DB[0]
  // 4-4-2
};

// services/AiScoutingService.ts
var squadAverageCache = /* @__PURE__ */ new WeakMap();
var AiScoutingService = {
  /**
   * Generuje raport zwiadowczy trenera AI na podstawie danych drużyny gracza.
   * Im wyższe `coachExperience`, tym precyzyjniejszy raport.
   */
  generateReport: (_playerClub, playerPlayers, playerLineup, coachExperience) => {
    const exp = Math.max(1, Math.min(99, coachExperience));
    const minError = exp >= 70 ? Math.max(1, 1 + (99 - exp) * 0.241) : Math.max(1, 8 + (70 - exp) * 0.435);
    const range = exp >= 70 ? 4 + (99 - exp) * 0.1 : Math.min(12, 7 + (70 - exp) * 0.125);
    const errorMargin = minError + Math.random() * range;
    const scoutingAccuracy = Math.max(0, Math.min(1, 1 - errorMargin / 100));
    const starters = playerLineup.startingXI.filter(Boolean);
    const starterPlayers = starters.map((id) => playerPlayers.find((p) => p.id === id)).filter((p) => !!p);
    const injuredOrSuspended = playerPlayers.filter(
      (p) => p.health.status === "INJURED" /* INJURED */ || p.health.injury?.severity === "SEVERE" /* SEVERE */ || p.suspensionMatches > 0
    );
    const avgCondition = starterPlayers.length > 0 ? starterPlayers.reduce((sum, p) => sum + p.condition, 0) / starterPlayers.length : 80;
    const realPower = starterPlayers.reduce(
      (sum, p) => sum + (p.attributes.attacking + p.attributes.passing + p.attributes.defending),
      0
    );
    const realInjuredCount = injuredOrSuspended.length;
    const realWeakened = realInjuredCount >= 3 || starterPlayers.length < 10;
    const powerErrorDir = Math.random() > 0.5 ? 1 : -1;
    const perceivedPower = Math.max(1, realPower * (1 + powerErrorDir * errorMargin / 100));
    let perceivedTacticId = playerLineup.tacticId;
    if (scoutingAccuracy < 0.75 && Math.random() > scoutingAccuracy) {
      const allTactics = TacticRepository.getAll();
      const wrongTactics = allTactics.filter((t) => t.id !== playerLineup.tacticId);
      if (wrongTactics.length > 0) {
        perceivedTacticId = wrongTactics[Math.floor(Math.random() * wrongTactics.length)].id;
      }
    }
    const conditionError = (Math.random() * 2 - 1) * (errorMargin * 0.5);
    const perceivedCondition = Math.max(50, Math.min(100, avgCondition + conditionError));
    const perceivedFatigueLevel = perceivedCondition >= 82 ? "FRESH" : perceivedCondition >= 67 ? "TIRED" : "EXHAUSTED";
    let isPerceivedWeakened = realWeakened;
    if (Math.random() > scoutingAccuracy + 0.3) {
      isPerceivedWeakened = !realWeakened;
    }
    const injuredCountNoise = Math.round((Math.random() * 2 - 1) * errorMargin * 0.15);
    const perceivedInjuredCount = Math.max(0, realInjuredCount + injuredCountNoise);
    return {
      perceivedPower,
      perceivedTacticId,
      perceivedInjuredCount,
      perceivedFatigueLevel,
      isPerceivedWeakened,
      scoutingAccuracy,
      errorMargin
    };
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSFER INTEREST SCOUTING — miesięczna aktualizacja zainteresowań klubów AI
  // ═══════════════════════════════════════════════════════════════════════════
  /**
   * Główna funkcja scoutingu transferowego. Wywoływana raz na miesiąc.
   *
   * Algorytm w skrócie:
   *   1. Wyczyść stare zainteresowania (usuń clubId z interestedClubs każdego gracza)
   *   2. Dla każdego AI-klubu → zdiagnozuj potrzeby kadrowe
   *   3. Z puli wszystkich zawodników w grze → wybierz kandydatów pasujących do potrzeb
   *   4. Oceń kandydatów (OVR, kontrakt, losowość trenera) i wybierz top N
   *   5. Zapisz wynik w polu player.interestedClubs
   *
   * @param clubs        Lista wszystkich klubów w grze
   * @param playersMap   Mapa clubId → Player[] (zawiera też 'FREE_AGENTS')
   * @param currentDate  Aktualna data gry
   * @param userTeamId   ID drużyny gracza (pomijamy przy generowaniu zainteresowań)
   * @param sessionSeed  Ziarno losowości sesji — zapewnia, że każda klubowa "osobowość trenera"
   *                     jest deterministyczna w ramach jednej rozgrywki, ale różna między klubami
   * @returns Zaktualizowana mapa playersMap z wypełnionymi interestedClubs
   */
  updateTransferInterests: (clubs, playersMap, currentDate, userTeamId, sessionSeed) => {
    const allPlayers = Object.values(playersMap).flat();
    if (allPlayers.length === 0) return playersMap;
    const clubById = new Map(clubs.map((club) => [club.id, club]));
    const tier4ClubIds = new Set(clubs.filter((club) => PolishThirdLeagueService.isThirdLeagueId(club.leagueId)).map((club) => club.id));
    const playersByPosition = /* @__PURE__ */ new Map([
      ["GK" /* GK */, []],
      ["DEF" /* DEF */, []],
      ["MID" /* MID */, []],
      ["FWD" /* FWD */, []]
    ]);
    const youngTalentPool = [];
    const tier4CandidatePool = [];
    const contractOpportunityPool = [];
    for (const player of allPlayers) {
      playersByPosition.get(player.position)?.push(player);
      if (player.age >= 17 && player.age <= 21) youngTalentPool.push(player);
      if (tier4ClubIds.has(player.clubId || "")) tier4CandidatePool.push(player);
      if (player.clubId && player.clubId !== "FREE_AGENTS") {
        const daysToExpiry = Math.floor(
          (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5
        );
        if (Number.isNaN(daysToExpiry) || daysToExpiry > 0 && daysToExpiry <= 365) {
          contractOpportunityPool.push(player);
        }
      }
    }
    const updatedMap = {};
    for (const clubId in playersMap) {
      updatedMap[clubId] = playersMap[clubId].map((player) => player.interestedClubs && player.interestedClubs.length > 0 ? { ...player, interestedClubs: [] } : player);
    }
    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      if (!ReserveTeamLeagueService.canParticipateAsTransferBuyer(club.id)) continue;
      const squad = updatedMap[club.id] || [];
      const needs = AiScoutingService._diagnoseSquadNeeds(squad, club, currentDate);
      const maxInterests = Math.min(10, Math.max(4, Math.floor(club.reputation * 0.5) + 2));
      const coachSeed = sessionSeed + AiScoutingService._hashString(club.id);
      const candidates = [];
      for (const need of needs) {
        const positionCandidates = AiScoutingService._findCandidatesForPosition(
          need.position,
          need.urgency,
          club,
          squad,
          playersByPosition.get(need.position) ?? [],
          clubById,
          coachSeed,
          currentDate
        );
        candidates.push(...positionCandidates);
      }
      if (needs.length === 0 && club.budget > 3e5) {
        const opportunistic = AiScoutingService._opportunisticScouting(club, squad, allPlayers, coachSeed, clubById);
        candidates.push(...opportunistic);
      }
      const youngTalents = AiScoutingService._youngTalentScouting(club, squad, youngTalentPool, clubById, coachSeed, currentDate);
      candidates.push(...youngTalents);
      const tier4Gems = AiScoutingService._tier4GemScouting(club, squad, tier4CandidatePool, tier4ClubIds, clubById, coachSeed, currentDate);
      candidates.push(...tier4Gems);
      const contractOpportunities = AiScoutingService._contractOpportunityScouting(
        club,
        squad,
        contractOpportunityPool,
        clubById,
        coachSeed,
        currentDate,
        needs
      );
      candidates.push(...contractOpportunities);
      const seen = /* @__PURE__ */ new Set();
      const topCandidates = candidates.sort((a, b) => b.score - a.score).filter((c) => {
        if (c.player.transferPendingClubId) return false;
        if (!ReserveTeamLeagueService.canRecruitPlayerFrom(club.id, c.player.clubId || "FREE_AGENTS")) return false;
        if (seen.has(c.player.id)) return false;
        seen.add(c.player.id);
        return true;
      }).slice(0, maxInterests);
      for (const { player } of topCandidates) {
        const sourceClubId = player.clubId || "FREE_AGENTS";
        const list = updatedMap[sourceClubId];
        if (!list) continue;
        const idx = list.findIndex((p) => p.id === player.id);
        if (idx === -1) continue;
        if (player.loan) continue;
        if (player.transferPendingClubId) continue;
        if (player.clubId === club.id) continue;
        if (!AiScoutingService._meetsSquadQualityFloor(player, squad, true)) continue;
        const existing = list[idx].interestedClubs || [];
        if (existing.length >= 10) continue;
        if (!existing.includes(club.id)) {
          list[idx] = { ...list[idx], interestedClubs: [...existing, club.id] };
        }
      }
    }
    return updatedMap;
  },
  // ─── Prywatne metody pomocnicze ──────────────────────────────────────────────
  /**
   * Diagnozuje słabe punkty składu i zwraca listę potrzeb ze wskazaniem priorytetu.
   *
   * Triggery (kombinacja):
   *   - Zbyt mało zawodników na pozycji (krytyczny niedobór)
   *   - Brak zawodnika z odpowiednim overall na pozycję (jakościowa luka)
   *   - Kluczowy zawodnik długotrminowo kontuzjowany (>21 dni)
   *   - Kontrakt gwiazdy wygasa w ciągu 6 miesięcy (ryzyko utraty)
   *   - Seria przegranych → trener szuka ratunku (forma drużyny)
   */
  _getSquadAverageOverall: (squad) => {
    if (squad.length === 0) return 0;
    const cachedAverage = squadAverageCache.get(squad);
    if (cachedAverage !== void 0) return cachedAverage;
    const average2 = squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length;
    squadAverageCache.set(squad, average2);
    return average2;
  },
  _meetsSquadQualityFloor: (player, buyerSquad, _allowDevelopment = false) => {
    if (buyerSquad.length === 0) return true;
    const squadAverage = AiScoutingService._getSquadAverageOverall(buyerSquad);
    return player.overallRating >= squadAverage;
  },
  _getSquadQualityScoreBonus: (player, buyerSquad) => {
    if (buyerSquad.length === 0) return 0;
    const squadAverage = AiScoutingService._getSquadAverageOverall(buyerSquad);
    const samePosition = buyerSquad.filter((squadPlayer) => squadPlayer.position === player.position);
    const positionAverage = samePosition.length > 0 ? AiScoutingService._getSquadAverageOverall(samePosition) : squadAverage;
    return Math.max(0, Math.min(18, (player.overallRating - squadAverage) * 2 + (player.overallRating - positionAverage)));
  },
  _diagnoseSquadNeeds: (squad, club, currentDate) => {
    const needs = [];
    const positions = ["GK" /* GK */, "DEF" /* DEF */, "MID" /* MID */, "FWD" /* FWD */];
    const minCounts = { GK: 2, DEF: 5, MID: 4, FWD: 3 };
    const idealOvr = 30 + club.reputation * 4.5;
    const recentForm = club.stats.form || [];
    const recentLosses = recentForm.slice(-5).filter((r) => r === "P").length;
    const formPressure = recentLosses >= 3 ? 1.3 : 1;
    for (const pos of positions) {
      const posSquad = squad.filter((p) => p.position === pos);
      const posCount = posSquad.length;
      let urgency = 0;
      if (posCount < minCounts[pos]) {
        urgency += 3;
      }
      const bestOvr = posSquad.length > 0 ? Math.max(...posSquad.map((p) => p.overallRating)) : 0;
      const ovrGap = idealOvr - bestOvr;
      if (ovrGap > 10) {
        urgency += Math.min(2, ovrGap / 10);
      }
      const keyPlayer = posSquad.sort((a, b) => b.overallRating - a.overallRating)[0];
      if (keyPlayer?.health.status === "INJURED" /* INJURED */) {
        const daysLeft = keyPlayer.health.injury?.daysRemaining || 0;
        if (daysLeft > 21) {
          urgency += 2;
        }
      }
      const contractExpiryDays = keyPlayer ? Math.floor((new Date(keyPlayer.contractEndDate).getTime() - currentDate.getTime()) / 864e5) : 999;
      if (contractExpiryDays < 180 && contractExpiryDays > 0) {
        urgency += 1.5;
      }
      urgency *= formPressure;
      if (urgency > 1) {
        needs.push({ position: pos, urgency });
      }
    }
    return needs.sort((a, b) => b.urgency - a.urgency);
  },
  /**
   * Znajduje i ocenia kandydatów pasujących do konkretnej potrzeby pozycyjnej klubu.
   *
   * Scoring kandydata (0–100):
   *   - Dopasowanie OVR do idealnego poziomu klubu          (0–40 pkt)
   *   - Wiek zawodnika (premiujemy potencjał, nie starców)  (0–20 pkt)
   *   - Dostępność (lista transferowa, kończący kontrakt)   (0–20 pkt)
   *   - Losowość "oka trenera" (skauting to nie nauka)      (0–20 pkt)
   */
  _findCandidatesForPosition: (position, urgency, club, buyerSquad, allPlayers, clubById, coachSeed, currentDate) => {
    const idealOvr = 30 + club.reputation * 4.5;
    const ovrTolerance = club.reputation >= 10 ? 12 : 18;
    const minOvr = idealOvr - ovrTolerance;
    const maxOvr = idealOvr + ovrTolerance;
    const maxAffordableValue = club.budget * 0.5;
    const candidates = allPlayers.filter((p) => {
      if (p.loan) return false;
      if (p.transferPendingClubId) return false;
      if (p.position !== position) return false;
      if (p.clubId === club.id) return false;
      if (!AiScoutingService._meetsSquadQualityFloor(p, buyerSquad)) return false;
      if (p.overallRating < minOvr || p.overallRating > maxOvr) return false;
      const estimatedCost = p.marketValue || p.annualSalary * 3;
      const sellerClub = clubById.get(p.clubId || "");
      const affordabilityMultiplier = AiScoutingService._getTransferListAffordabilityMultiplier(
        p,
        club,
        sellerClub,
        idealOvr
      );
      if (estimatedCost > maxAffordableValue * affordabilityMultiplier && p.clubId !== "FREE_AGENTS") return false;
      if (sellerClub && p.clubId !== "FREE_AGENTS" && Math.random() >= 0.02) {
        const repGap = sellerClub.reputation - club.reputation;
        const maxRepGap = p.isOnTransferList ? 6 : 4;
        if (repGap > maxRepGap) return false;
      }
      if (p.health.status === "INJURED" /* INJURED */ && (p.health.injury?.daysRemaining || 0) > 60) return false;
      return true;
    });
    return candidates.map((player) => {
      let score = 0;
      const sellerClub = clubById.get(player.clubId || "");
      const ovrDiff = Math.abs(player.overallRating - idealOvr);
      score += Math.max(0, 40 - ovrDiff * 2);
      score += AiScoutingService._getSquadQualityScoreBonus(player, buyerSquad);
      const age = player.age;
      if (age >= 19 && age <= 27) score += 20;
      else if (age === 18) score += 15;
      else if (age >= 28 && age <= 30) score += 12;
      else if (age >= 31 && age <= 33) score += 6;
      else score += 2;
      if (player.isOnTransferList) score += 15;
      score += AiScoutingService._getTransferListMarketOpportunityBonus(player, club, sellerClub, idealOvr);
      const daysToExpiry = Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5);
      if (daysToExpiry < 180) score += 12;
      else if (daysToExpiry < 365) score += 6;
      if (player.clubId === "FREE_AGENTS") score += 20;
      const trainerEye = AiScoutingService._seededRandom(coachSeed + AiScoutingService._hashString(player.id)) * 20;
      score += trainerEye;
      score *= AiScoutingService._evaluatePlayerPerformance(player);
      score *= urgency;
      if (player.isOnTransferList && player.age > 31) {
        const gp = player.stats.matchesPlayed;
        const stillProductive = player.position === "FWD" && gp >= 5 && player.stats.goals / gp >= 0.25 || player.position === "MID" && gp >= 5 && (player.stats.goals + player.stats.assists) / gp >= 0.25 || player.overallRating >= idealOvr + 5;
        if (!stillProductive) {
          const agePenalty = Math.max(0.15, 1 - (player.age - 31) * 0.2);
          score *= agePenalty;
        }
      }
      return { player, score };
    });
  },
  /**
   * Okazjonalne scouting — klub bez pilnych potrzeb "przypadkowo" odkrywa interesującego zawodnika.
   * Symuluje sytuację gdy skaut jedzie na inny mecz i obserwuje nieoczekiwany talent.
   * Liczba kandydatów: 1–3 (zależnie od reputacji = liczby skautów w klubie).
   */
  _opportunisticScouting: (club, buyerSquad, allPlayers, coachSeed, clubById) => {
    const idealOvr = 30 + club.reputation * 4.5;
    const minOvr = idealOvr - 20;
    const maxOvr = idealOvr + 8;
    const pool = allPlayers.filter((p) => {
      if (p.loan) return false;
      if (p.transferPendingClubId) return false;
      if (p.clubId === club.id) return false;
      if (!AiScoutingService._meetsSquadQualityFloor(p, buyerSquad)) return false;
      if (p.overallRating < minOvr || p.overallRating > maxOvr) return false;
      if (p.health.status === "INJURED" /* INJURED */) return false;
      if (p.clubId !== "FREE_AGENTS" && Math.random() >= 0.02) {
        const playerClub = clubById.get(p.clubId || "");
        if (playerClub && playerClub.reputation > club.reputation + 4) return false;
      }
      return true;
    });
    if (pool.length === 0) return [];
    const discoveryCount = club.reputation >= 10 ? 3 : club.reputation >= 7 ? 2 : 1;
    const results = [];
    for (let i = 0; i < discoveryCount; i++) {
      const idx = Math.floor(AiScoutingService._seededRandom(coachSeed + i * 7919) * pool.length);
      const player = pool[idx];
      if (player && !results.some((r) => r.player.id === player.id)) {
        results.push({
          player,
          score: 20 + AiScoutingService._seededRandom(coachSeed + i) * 15 + AiScoutingService._getSquadQualityScoreBonus(player, buyerSquad)
        });
      }
    }
    return results;
  },
  /**
   * Ocenia realną wydajność zawodnika na podstawie statystyk sezonowych.
   * Zwraca mnożnik do score scoutingu:
   *   < 1.0 → zawodnik traci na atrakcyjności (słabe statystyki)
   *   = 1.0 → neutralne (brak danych lub obrońca/bramkarz)
   *   > 1.0 → zawodnik zyskuje na atrakcyjności (świetne statystyki)
   *
   * Stosowany tylko od 8 meczów — mniejsza próbka jest zbyt niestabilna.
   */
  _evaluatePlayerPerformance: (player) => {
    const gamesPlayed = player.stats.matchesPlayed;
    if (gamesPlayed < 8) return 1;
    const goalsPerGame = player.stats.goals / gamesPlayed;
    const assistsPerGame = player.stats.assists / gamesPlayed;
    const contribPerGame = goalsPerGame + assistsPerGame;
    if (player.position === "FWD") {
      if (goalsPerGame < 0.08) return 0.25;
      if (goalsPerGame < 0.18) return 0.65;
      if (goalsPerGame >= 0.4) return 1.35;
      if (goalsPerGame >= 0.28) return 1.15;
      return 1;
    }
    if (player.position === "MID") {
      if (contribPerGame < 0.08) return 0.3;
      if (contribPerGame < 0.18) return 0.7;
      if (contribPerGame >= 0.35) return 1.25;
      if (contribPerGame >= 0.25) return 1.1;
      return 1;
    }
    const dangerCards = player.stats.yellowCards + player.stats.redCards * 3;
    const dangerCardsPerGame = dangerCards / gamesPlayed;
    if (dangerCardsPerGame > 0.5) return 0.55;
    if (dangerCardsPerGame > 0.3) return 0.8;
    return 1;
  },
  /**
   * Identyfikuje młode talenty (17–21 lat) grające w słabszych klubach niż obserwujący.
   * Symuluje sytuację: skaut leci na mecz 2. ligi i odkrywa 19-latka z OVR jak z Ekstraklasy.
   *
   * Warunki kwalifikacji:
   *   - Wiek 17–21
   *   - OVR ≥ idealOvr obserwującego klubu − 10
   *   - Jego klub ma reputację niższą o ≥2 od obserwującego
   *   - Nie pochodzi z obserwującego klubu
   */
  _youngTalentScouting: (club, buyerSquad, allPlayers, clubById, coachSeed, currentDate) => {
    const idealOvr = 30 + club.reputation * 4.5;
    const talents = allPlayers.filter((p) => {
      if (p.loan) return false;
      if (!AiScoutingService._meetsSquadQualityFloor(p, buyerSquad, true)) return false;
      if (p.clubId === club.id) return false;
      if (p.transferOfferBanUntil && currentDate < new Date(p.transferOfferBanUntil)) return false;
      if (p.age < 17 || p.age > 21) return false;
      if (p.overallRating < idealOvr - 10) return false;
      const playerClub = clubById.get(p.clubId || "");
      if (!playerClub) return true;
      if (playerClub.reputation > club.reputation - 2) return false;
      return true;
    });
    return talents.map((player) => {
      let score = 30;
      if (player.age <= 18) score += 20;
      else if (player.age <= 19) score += 15;
      else if (player.age <= 20) score += 10;
      else score += 5;
      const ovrBonus = Math.max(0, player.overallRating - (idealOvr - 10));
      score += Math.min(15, ovrBonus * 1.5);
      score += AiScoutingService._getSquadQualityScoreBonus(player, buyerSquad);
      score += AiScoutingService._seededRandom(
        coachSeed + AiScoutingService._hashString(player.id) + 1337
      ) * 10;
      score *= AiScoutingService._evaluatePlayerPerformance(player);
      return { player, score };
    });
  },
  /**
   * Scouting gemów tier 4 — wykrywa zawodników zbyt dobrych na swoją ligę.
   * Wywoływany miesięcznie dla każdego AI-klubu wyższego niż tier 4.
   *
   * Kwalifikacja gema:
   *   - Gra w klubie leagueId='L_PL_4'
   *   - OVR ≥ clubIdealOvr + 12 (zdecydowanie powyżej normy swojego klubu)
   *   - OVR ≥ observingIdealOvr − 25 (nie za słaby dla obserwującego klubu)
   *
   * Scoring (0–70 + mnożnik wydajności):
   *   - Baza: 30 pkt
   *   - OVR gap bonus: min(20, gap × 1.2)
   *   - ratingHistory avg (ostatnie 5): ≥8.0→+20, ≥7.0→+12, ≥6.0→+5, <5.0→−10
   *   - Mnożnik: _evaluatePlayerPerformance
   *
   * Losowość: 12–30% szansy odkrycia per gem per klub per miesiąc.
   * Limit: max 2 gemy per klub per miesiąc z tego kanału.
   */
  _tier4GemScouting: (observingClub, buyerSquad, allPlayers, tier4ClubIds, clubById, coachSeed, currentDate) => {
    if (observingClub.reputation <= 3) return [];
    const observingIdealOvr = 30 + observingClub.reputation * 4.5;
    const gems = allPlayers.filter((p) => {
      if (p.loan) return false;
      if (!tier4ClubIds.has(p.clubId || "")) return false;
      if (!AiScoutingService._meetsSquadQualityFloor(p, buyerSquad)) return false;
      if (p.transferOfferBanUntil && currentDate < new Date(p.transferOfferBanUntil)) return false;
      const playerClub = clubById.get(p.clubId || "");
      if (!playerClub) return false;
      const clubIdealOvr = 30 + playerClub.reputation * 4.5;
      if (p.overallRating < clubIdealOvr + 12) return false;
      if (p.overallRating < observingIdealOvr - 25) return false;
      if (p.health.status === "INJURED" /* INJURED */ && (p.health.injury?.daysRemaining || 0) > 60) return false;
      return true;
    });
    if (gems.length === 0) return [];
    const monthKey = currentDate.getFullYear() * 100 + (currentDate.getMonth() + 1);
    const discoveryChance = Math.min(0.3, 0.12 + observingClub.reputation * 0.012);
    const discovered = [];
    for (const player of gems) {
      const discoverySeed = coachSeed + AiScoutingService._hashString(player.id) + monthKey;
      if (AiScoutingService._seededRandom(discoverySeed) > discoveryChance) continue;
      const playerClub = clubById.get(player.clubId || "");
      if (!playerClub) continue;
      const clubIdealOvr = 30 + playerClub.reputation * 4.5;
      let score = 30;
      const ovrGap = player.overallRating - clubIdealOvr;
      score += Math.min(20, ovrGap * 1.2);
      score += AiScoutingService._getSquadQualityScoreBonus(player, buyerSquad);
      const ratings = player.stats.ratingHistory;
      if (ratings && ratings.length >= 5) {
        const avgRating = ratings.slice(-5).reduce((s, r) => s + r, 0) / 5;
        if (avgRating >= 8) score += 20;
        else if (avgRating >= 7) score += 12;
        else if (avgRating >= 6) score += 5;
        else if (avgRating < 5) score -= 10;
      }
      score *= AiScoutingService._evaluatePlayerPerformance(player);
      discovered.push({ player, score });
    }
    return discovered.sort((a, b) => b.score - a.score).slice(0, 2);
  },
  _contractOpportunityScouting: (buyingClub, buyerSquad, allPlayers, clubById, coachSeed, currentDate, needs) => {
    if (buyingClub.budget < 3e5) return [];
    const maxTargets = buyingClub.reputation >= 12 ? 2 : 1;
    const needMap = new Map(needs.map((need) => [need.position, need.urgency]));
    const squadAverage = AiScoutingService._getSquadAverageOverall(buyerSquad);
    const monthKey = currentDate.getFullYear() * 100 + currentDate.getMonth() + 1;
    const hasSquadRoom = buyerSquad.length < 30;
    const positionAverages = /* @__PURE__ */ new Map();
    for (const position of ["GK" /* GK */, "DEF" /* DEF */, "MID" /* MID */, "FWD" /* FWD */]) {
      const positionPlayers = buyerSquad.filter((player) => player.position === position);
      positionAverages.set(
        position,
        positionPlayers.length > 0 ? AiScoutingService._getSquadAverageOverall(positionPlayers) : squadAverage
      );
    }
    if (!hasSquadRoom && needMap.size === 0) return [];
    const candidates = [];
    for (const player of allPlayers) {
      if (player.loan) continue;
      if (player.clubId === buyingClub.id || player.clubId === "FREE_AGENTS") continue;
      if (player.transferPendingClubId) continue;
      if (player.transferOfferBanUntil && currentDate < new Date(player.transferOfferBanUntil)) continue;
      const sellerClub = clubById.get(player.clubId || "");
      if (!sellerClub) continue;
      const daysToExpiry = Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 864e5);
      if (daysToExpiry <= 0 || daysToExpiry > 365) continue;
      if (player.health.status === "INJURED" /* INJURED */ && (player.health.injury?.daysRemaining || 0) > 60) continue;
      const positionAverage = positionAverages.get(player.position) ?? squadAverage;
      const positionalNeed = needMap.get(player.position) || 0;
      const clearUpgrade = player.overallRating >= positionAverage + 2;
      const usefulDepth = hasSquadRoom && player.overallRating >= squadAverage;
      if (positionalNeed <= 0 && !clearUpgrade && !usefulDepth) continue;
      if (!AiScoutingService._meetsSquadQualityFloor(player, buyerSquad, true)) continue;
      const repGap = sellerClub.reputation - buyingClub.reputation;
      const maxRepGap = player.isOnTransferList || player.isNegotiationPermanentBlocked ? 6 : 4;
      if (repGap > maxRepGap) continue;
      const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
      const expectedSalary = Math.max(
        fairSalary,
        Math.round((player.annualSalary || fairSalary) * 1.08 / 1e4) * 1e4
      );
      const expectedBonus = Math.round(expectedSalary * (player.age <= 23 ? 0.35 : player.age <= 30 ? 0.55 : 0.8) / 1e4) * 1e4;
      const firstYearCost = expectedSalary + expectedBonus;
      if (expectedSalary > buyingClub.budget * 0.22) continue;
      if (firstYearCost > Math.max(buyingClub.transferBudget || 0, buyingClub.budget * 0.18)) continue;
      const importantForSeller = player.squadRole === "KEY_PLAYER" || player.squadRole === "STARTER" || player.isUntouchable;
      let discoveryChance = daysToExpiry <= 90 ? 0.1 : daysToExpiry <= 180 ? 0.075 : 0.045;
      if (positionalNeed > 0) discoveryChance *= 1.35;
      if (buyingClub.reputation <= 8) discoveryChance *= 1.15;
      if (!hasSquadRoom && positionalNeed <= 0) discoveryChance *= 0.35;
      if (importantForSeller && !player.isNegotiationPermanentBlocked) discoveryChance *= 0.55;
      const discoverySeed = coachSeed + AiScoutingService._hashString(`${player.id}_contract_${monthKey}`);
      if (AiScoutingService._seededRandom(discoverySeed) > Math.min(0.16, discoveryChance)) continue;
      let score = 28;
      if (daysToExpiry <= 90) score += 25;
      else if (daysToExpiry <= 180) score += 18;
      else if (daysToExpiry <= 270) score += 12;
      else score += 7;
      score += Math.min(20, positionalNeed * 8);
      score += AiScoutingService._getSquadQualityScoreBonus(player, buyerSquad);
      if (clearUpgrade) score += 10;
      if (player.isNegotiationPermanentBlocked) score += 12;
      if (player.isOnTransferList) score += 8;
      if (player.age >= 22 && player.age <= 29) score += 8;
      else if (player.age <= 21) score += 5;
      else if (player.age > 33) score -= 4;
      const affordabilityPenalty = firstYearCost > Math.max(1, buyingClub.budget * 0.12) ? 0.82 : 1;
      score *= affordabilityPenalty;
      score *= AiScoutingService._evaluatePlayerPerformance(player);
      candidates.push({ player, score });
    }
    return candidates.sort((a, b) => b.score - a.score).slice(0, maxTargets);
  },
  _getTransferListMarketOpportunityBonus: (player, buyingClub, sellerClub, buyerIdealOvr) => {
    if (!player.isOnTransferList || !sellerClub) return 0;
    const repDelta = sellerClub.reputation - buyingClub.reputation;
    const sellerIdealOvr = 30 + sellerClub.reputation * 4.5;
    const qualityVsSeller = player.overallRating - sellerIdealOvr;
    let bonus = 0;
    if (repDelta >= -1 && repDelta <= 2) bonus += 10;
    else if (repDelta <= 5 && player.overallRating >= buyerIdealOvr - 2) bonus += 5;
    if (sellerClub.reputation >= buyingClub.reputation) bonus += 4;
    if (qualityVsSeller >= 4) bonus += 12;
    else if (qualityVsSeller >= 1) bonus += 8;
    else if (player.overallRating >= buyerIdealOvr + 2) bonus += 4;
    if (player.age <= 29) bonus += 3;
    if (player.age >= 33) bonus -= 2;
    return Math.max(0, bonus);
  },
  _getTransferListAffordabilityMultiplier: (player, buyingClub, sellerClub, buyerIdealOvr) => {
    if (!player.isOnTransferList || !sellerClub) return 1;
    const repDelta = sellerClub.reputation - buyingClub.reputation;
    const sellerIdealOvr = 30 + sellerClub.reputation * 4.5;
    const qualityVsSeller = player.overallRating - sellerIdealOvr;
    let multiplier = 1;
    if (repDelta >= -1 && repDelta <= 2) multiplier += 0.2;
    else if (repDelta <= 5 && player.overallRating >= buyerIdealOvr - 2) multiplier += 0.1;
    if (qualityVsSeller >= 4) multiplier += 0.2;
    else if (qualityVsSeller >= 1) multiplier += 0.1;
    if (player.age <= 28) multiplier += 0.05;
    return Math.min(1.45, multiplier);
  },
  /**
   * Prosty deterministyczny generator pseudolosowy (LCG).
   * Zwraca wartość 0.0–1.0.
   * Gwarantuje że ten sam club + player zawsze daje ten sam wynik w tej samej sesji.
   */
  _seededRandom: (seed) => {
    const x = Math.sin(seed) * 1e4;
    return x - Math.floor(x);
  },
  /**
   * Prosty hash stringa → liczba całkowita.
   * Używany do tworzenia unikalnego ziarna per clubId/playerId.
   */
  _hashString: (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
};

// tests/PendingFreeAgentTransferTests.ts
var makeClub = (id, name, reputation, rosterIds = []) => ({
  id,
  name,
  shortName: name,
  country: "USA",
  leagueId: "L_OTHER",
  tier: 1,
  reputation,
  budget: 1e8,
  transferBudget: 1e8,
  rosterIds,
  stats: { form: [] }
});
var makePendingFreeAgent = () => ({
  id: "ROBERT_LEWANDOWSKI_TEST",
  firstName: "Robert",
  lastName: "Lewandowski",
  age: 37,
  clubId: "FREE_AGENTS",
  position: "FWD" /* FWD */,
  nationality: "POLAND" /* POLAND */,
  nationalityCountry: "Polska",
  overallRating: 85,
  reputacja: 19,
  lojalnosc: 70,
  attributes: {
    pace: 78,
    acceleration: 76,
    strength: 88,
    stamina: 75,
    finishing: 89,
    passing: 75,
    vision: 76,
    technique: 82,
    dribbling: 83,
    crossing: 65,
    defending: 38,
    positioning: 82,
    attacking: 85,
    mentality: 87,
    workRate: 78,
    aggression: 63,
    leadership: 83,
    goalkeeping: 5,
    reflexes: 5,
    handling: 5,
    aerial: 85,
    talent: 78,
    freeKicks: 80,
    penalties: 98,
    corners: 69
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
  condition: 100,
  fatigueDebt: 0,
  suspensionMatches: 0,
  annualSalary: 0,
  marketValue: 18e5,
  contractEndDate: "2026-07-01T00:00:00.000Z",
  transferPendingClubId: "CHI",
  transferReportDate: "2026-07-07T18:00:00.000Z",
  transferPendingFee: 0,
  transferPendingSalary: 5e6,
  transferPendingBonus: 1e6,
  transferPendingContractYears: 2,
  interestedClubs: ["OTHER"],
  aiNegotiationClubId: "OTHER",
  aiNegotiationResponseDate: "2026-07-06T00:00:00.000Z",
  isOnTransferList: true,
  isAvailableForLoan: true,
  history: [
    {
      clubName: "FC Barcelona",
      clubId: "BARCA",
      fromYear: 2025,
      fromMonth: 7,
      toYear: 2026,
      toMonth: 7
    },
    {
      clubName: "BEZ KLUBU",
      clubId: "FREE_AGENTS",
      fromYear: 2026,
      fromMonth: 7,
      toYear: null,
      toMonth: null
    }
  ]
});
var chicago = makeClub("CHI", "Chicago Fire FC", 8);
var barcelona = makeClub("BARCA", "FC Barcelona", 20);
var other = makeClub("OTHER", "Inny klub", 12);
var pending = makePendingFreeAgent();
var beforeDate = AiContractService.resolveAiTransferPending(
  [chicago, barcelona, other],
  { FREE_AGENTS: [pending], CHI: [], BARCA: [], OTHER: [] },
  /* @__PURE__ */ new Date("2026-07-06T00:00:00.000Z"),
  null
);
var protectedBeforeDate = beforeDate.updatedPlayers.FREE_AGENTS[0];
import_strict.default.equal(protectedBeforeDate.transferPendingClubId, "CHI");
import_strict.default.deepEqual(protectedBeforeDate.interestedClubs, []);
import_strict.default.equal(protectedBeforeDate.aiNegotiationClubId, void 0);
import_strict.default.equal(protectedBeforeDate.isOnTransferList, false);
import_strict.default.equal(protectedBeforeDate.isAvailableForLoan, false);
var resolved = AiContractService.resolveAiTransferPending(
  beforeDate.updatedClubs,
  beforeDate.updatedPlayers,
  /* @__PURE__ */ new Date("2026-07-08T00:00:00.000Z"),
  null
);
import_strict.default.equal(resolved.updatedPlayers.FREE_AGENTS.length, 0);
import_strict.default.equal(resolved.updatedPlayers.CHI.length, 1);
var signed = resolved.updatedPlayers.CHI[0];
import_strict.default.equal(signed.id, pending.id);
import_strict.default.equal(signed.clubId, "CHI");
import_strict.default.equal(signed.transferPendingClubId, void 0);
import_strict.default.equal(signed.transferReportDate, void 0);
import_strict.default.deepEqual(signed.interestedClubs, []);
import_strict.default.equal(signed.annualSalary, 5e6);
import_strict.default.equal(signed.history.at(-1)?.clubId, "CHI");
import_strict.default.equal(signed.history.at(-2)?.clubId, "FREE_AGENTS");
import_strict.default.equal(signed.history.at(-2)?.toYear, 2026);
import_strict.default.ok(resolved.updatedClubs.find((club) => club.id === "CHI")?.rosterIds.includes(pending.id));
import_strict.default.equal(resolved.logEntries.filter((entry) => entry.status === "TRANSFER_SIGNED").length, 1);
var secondPass = AiContractService.resolveAiTransferPending(
  resolved.updatedClubs,
  resolved.updatedPlayers,
  /* @__PURE__ */ new Date("2026-07-09T00:00:00.000Z"),
  null
);
import_strict.default.equal(secondPass.logEntries.length, 0);
import_strict.default.equal(secondPass.updatedPlayers.CHI.filter((player) => player.id === pending.id).length, 1);
var scoutingResult = AiScoutingService.updateTransferInterests(
  [other],
  { FREE_AGENTS: [makePendingFreeAgent()], OTHER: [] },
  /* @__PURE__ */ new Date("2026-07-01T00:00:00.000Z"),
  null,
  12345
);
import_strict.default.deepEqual(scoutingResult.FREE_AGENTS[0].interestedClubs, []);
var recruitmentResult = AiContractService.processAiRecruitment(
  [other],
  { FREE_AGENTS: [makePendingFreeAgent()], OTHER: [] },
  /* @__PURE__ */ new Date("2026-07-02T00:00:00.000Z"),
  null
);
import_strict.default.equal(recruitmentResult.updatedPlayers.FREE_AGENTS[0].aiNegotiationClubId, void 0);
import_strict.default.equal(recruitmentResult.updatedPlayers.FREE_AGENTS[0].transferPendingClubId, "CHI");
console.log("PendingFreeAgentTransferTests: OK");
