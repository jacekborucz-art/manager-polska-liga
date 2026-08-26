var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// tests/MarketValueBalanceTests.ts
var MarketValueBalanceTests_exports = {};
__export(MarketValueBalanceTests_exports, {
  runMarketValueBalanceTests: () => runMarketValueBalanceTests
});
module.exports = __toCommonJS(MarketValueBalanceTests_exports);

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

// tests/MarketValueBalanceTests.ts
var TEAM_STATS_TEMPLATE = {
  points: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  played: 0,
  form: []
};
var DEFAULT_BOARD_LEVEL = "przecietna";
var TEST_DATE = /* @__PURE__ */ new Date("2026-04-15T12:00:00Z");
var failures = [];
var assertInRange = (value, [min, max], message) => {
  if (value >= min && value <= max) return;
  failures.push(
    `${message}. Expected ${min.toLocaleString()}-${max.toLocaleString()} PLN, got ${value.toLocaleString()} PLN`
  );
};
var assertGreaterThan = (left, right, message) => {
  if (left > right) return;
  failures.push(
    `${message}. Expected ${left.toLocaleString()} PLN to be greater than ${right.toLocaleString()} PLN`
  );
};
var assertLessThan = (left, right, message) => {
  if (left < right) return;
  failures.push(
    `${message}. Expected ${left.toLocaleString()} PLN to be lower than ${right.toLocaleString()} PLN`
  );
};
var averageRatingHistory = (average, matches) => Array.from({ length: Math.max(0, matches) }, () => average);
var createClub = (overrides = {}) => ({
  id: "PL_TEST_CLUB",
  name: "Test FC",
  shortName: "TFC",
  leagueId: "PL_LEAGUE_1",
  tier: 1,
  colorsHex: ["#ffffff", "#000000"],
  stadiumName: "Test Arena",
  stadiumCapacity: 18e3,
  reputation: 6,
  country: "POL",
  isDefaultActive: true,
  rosterIds: [],
  stats: { ...TEAM_STATS_TEMPLATE },
  budget: 12e6,
  transferBudget: 4e6,
  boardStrictness: 5,
  signingBonusPool: 6e5,
  board: {
    hojnosc: DEFAULT_BOARD_LEVEL,
    ambicja: DEFAULT_BOARD_LEVEL,
    cierpliwosc: DEFAULT_BOARD_LEVEL,
    chciwosc: DEFAULT_BOARD_LEVEL,
    oczekiwania: DEFAULT_BOARD_LEVEL,
    kompetencja: DEFAULT_BOARD_LEVEL
  },
  ...overrides
});
var createPlayer = ({
  id,
  position,
  overallRating,
  age,
  goals = 0,
  assists = 0,
  matchesPlayed = 0,
  minutesPlayed = 0,
  averageRating = 6.8,
  cleanSheets = 0,
  talent = 72,
  contractEndDate = "2028-06-30",
  clubId = "PL_TEST_CLUB",
  annualSalary = 12e5,
  isUntouchable = false,
  isOnTransferList = false
}) => ({
  id,
  firstName: "Test",
  lastName: id,
  age,
  clubId,
  nationality: "POLAND" /* POLAND */,
  position,
  overallRating,
  attributes: {
    strength: overallRating,
    stamina: overallRating,
    pace: overallRating,
    defending: position === "DEF" /* DEF */ ? overallRating + 3 : overallRating - 2,
    passing: overallRating,
    attacking: position === "FWD" /* FWD */ ? overallRating + 2 : overallRating - 1,
    finishing: position === "FWD" /* FWD */ ? overallRating + 4 : overallRating - 2,
    technique: overallRating,
    vision: overallRating,
    dribbling: overallRating,
    heading: overallRating - 1,
    positioning: overallRating,
    goalkeeping: position === "GK" /* GK */ ? overallRating + 4 : 10,
    freeKicks: overallRating - 3,
    talent,
    penalties: overallRating - 2,
    corners: overallRating - 4,
    aggression: overallRating - 2,
    crossing: overallRating - 1,
    leadership: overallRating,
    mentality: overallRating + 1,
    workRate: overallRating + 1
  },
  stats: {
    goals,
    assists,
    yellowCards: 0,
    redCards: 0,
    cleanSheets,
    matchesPlayed,
    minutesPlayed,
    seasonalChanges: {},
    ratingHistory: averageRatingHistory(averageRating, matchesPlayed)
  },
  health: { status: "HEALTHY" /* HEALTHY */ },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate,
  annualSalary,
  isOnTransferList,
  marketValue: 0,
  history: [
    {
      clubName: "Old Club",
      clubId,
      fromYear: 2022,
      fromMonth: 7,
      toYear: 2025,
      toMonth: 6,
      statsSnapshot: {
        matchesPlayed: Math.max(matchesPlayed, 26),
        goals,
        assists,
        yellowCards: 0,
        redCards: 0,
        averageRating
      }
    }
  ],
  boardLockoutUntil: null,
  isUntouchable,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  freeAgentClubLockouts: {}
});
var createSupportSquad = (mainPlayer) => {
  const samePositionSupport = Array.from(
    { length: 3 },
    (_, index) => createPlayer({
      id: `${mainPlayer.position}_SUPPORT_${index + 1}`,
      position: mainPlayer.position,
      overallRating: Math.max(58, mainPlayer.overallRating - 6 - index),
      age: Math.min(31, mainPlayer.age + index),
      matchesPlayed: 8 + index * 4,
      minutesPlayed: 500 + index * 180,
      averageRating: 6.5,
      clubId: mainPlayer.clubId,
      annualSalary: 6e5,
      contractEndDate: "2027-06-30"
    })
  );
  const supportingCore = [
    createPlayer({ id: "GK_1", position: "GK" /* GK */, overallRating: 73, age: 27, matchesPlayed: 28, minutesPlayed: 2520, averageRating: 6.9, cleanSheets: 11 }),
    createPlayer({ id: "DEF_1", position: "DEF" /* DEF */, overallRating: 74, age: 26, matchesPlayed: 29, minutesPlayed: 2500, averageRating: 6.9 }),
    createPlayer({ id: "DEF_2", position: "DEF" /* DEF */, overallRating: 72, age: 24, matchesPlayed: 25, minutesPlayed: 2200, averageRating: 6.8 }),
    createPlayer({ id: "DEF_3", position: "DEF" /* DEF */, overallRating: 71, age: 28, matchesPlayed: 24, minutesPlayed: 2100, averageRating: 6.7 }),
    createPlayer({ id: "MID_1", position: "MID" /* MID */, overallRating: 76, age: 25, matchesPlayed: 30, minutesPlayed: 2550, averageRating: 7, goals: 6, assists: 7 }),
    createPlayer({ id: "MID_2", position: "MID" /* MID */, overallRating: 74, age: 23, matchesPlayed: 27, minutesPlayed: 2200, averageRating: 6.9, goals: 3, assists: 6 }),
    createPlayer({ id: "MID_3", position: "MID" /* MID */, overallRating: 72, age: 29, matchesPlayed: 22, minutesPlayed: 1800, averageRating: 6.7, goals: 2, assists: 4 }),
    createPlayer({ id: "FWD_1", position: "FWD" /* FWD */, overallRating: 77, age: 24, matchesPlayed: 30, minutesPlayed: 2480, averageRating: 7.1, goals: 14, assists: 5 }),
    createPlayer({ id: "FWD_2", position: "FWD" /* FWD */, overallRating: 73, age: 22, matchesPlayed: 24, minutesPlayed: 1650, averageRating: 6.8, goals: 8, assists: 3 })
  ];
  return [mainPlayer, ...samePositionSupport, ...supportingCore].sort((a, b) => b.overallRating - a.overallRating);
};
var buildScenario = (definition) => {
  const sellerClub = createClub(definition.clubOverrides);
  const sellerSquad = createSupportSquad(definition.player);
  sellerClub.rosterIds = sellerSquad.map((player) => player.id);
  return {
    ...definition,
    sellerClub,
    sellerSquad
  };
};
var calculateScenarioPrices = (player, sellerClub, sellerSquad, boardKompetencja) => {
  const marketValue = FinanceService.calculateMarketValue(
    player,
    sellerClub.reputation,
    sellerClub.tier || 1,
    sellerClub.country
  );
  const askingPrice = TransferSellerLogicService.estimateAskingPrice(
    { ...player, marketValue },
    sellerClub,
    sellerSquad,
    TEST_DATE,
    boardKompetencja
  );
  return { marketValue, askingPrice };
};
var runMarketValueBalanceTests = () => {
  console.group("Market Value Balance Tests");
  failures.length = 0;
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  try {
    const scenarios = [
      buildScenario({
        id: "veteran_mid_idle",
        label: "35-letni MID 75 OVR bez minut",
        player: createPlayer({
          id: "VETERAN_MID_IDLE",
          position: "MID" /* MID */,
          overallRating: 75,
          age: 35,
          matchesPlayed: 0,
          minutesPlayed: 0,
          averageRating: 6.7,
          annualSalary: 36e5,
          contractEndDate: "2029-06-30",
          isOnTransferList: true
        }),
        marketValueRange: [5e5, 17e5],
        askingPriceRange: [6e5, 26e5]
      }),
      buildScenario({
        id: "veteran_mid_playing",
        label: "35-letni MID 75 OVR regularnie graj\u0105cy",
        player: createPlayer({
          id: "VETERAN_MID_PLAYING",
          position: "MID" /* MID */,
          overallRating: 75,
          age: 35,
          matchesPlayed: 24,
          minutesPlayed: 1850,
          assists: 8,
          goals: 3,
          averageRating: 7.1,
          annualSalary: 24e5,
          contractEndDate: "2028-06-30"
        }),
        marketValueRange: [9e5, 19e5],
        askingPriceRange: [11e5, 26e5]
      }),
      buildScenario({
        id: "leader_fwd_32",
        label: "32-letni FWD 78 OVR po mocnym sezonie",
        player: createPlayer({
          id: "LEADER_FWD_32",
          position: "FWD" /* FWD */,
          overallRating: 78,
          age: 32,
          matchesPlayed: 31,
          minutesPlayed: 2520,
          goals: 18,
          assists: 5,
          averageRating: 7.3,
          annualSalary: 2e6,
          contractEndDate: "2028-06-30",
          isUntouchable: true
        }),
        marketValueRange: [35e5, 55e5],
        askingPriceRange: [5e6, 85e5]
      }),
      buildScenario({
        id: "leader_def_34",
        label: "34-letni DEF 76 OVR lider obrony",
        player: createPlayer({
          id: "LEADER_DEF_34",
          position: "DEF" /* DEF */,
          overallRating: 76,
          age: 34,
          matchesPlayed: 30,
          minutesPlayed: 2610,
          averageRating: 7.1,
          annualSalary: 16e5,
          contractEndDate: "2028-06-30"
        }),
        marketValueRange: [15e5, 38e5],
        askingPriceRange: [2e6, 48e5]
      }),
      buildScenario({
        id: "veteran_gk_36",
        label: "36-letni GK 74 OVR z dobr\u0105 \u015Bredni\u0105",
        player: createPlayer({
          id: "VETERAN_GK_36",
          position: "GK" /* GK */,
          overallRating: 74,
          age: 36,
          matchesPlayed: 29,
          minutesPlayed: 2610,
          cleanSheets: 12,
          averageRating: 7.2,
          annualSalary: 13e5,
          contractEndDate: "2027-06-30"
        }),
        marketValueRange: [1e6, 22e5],
        askingPriceRange: [13e5, 28e5]
      }),
      buildScenario({
        id: "prime_mid_27",
        label: "27-letni MID 79 OVR gwiazda ligi",
        player: createPlayer({
          id: "PRIME_MID_27",
          position: "MID" /* MID */,
          overallRating: 79,
          age: 27,
          matchesPlayed: 31,
          minutesPlayed: 2640,
          goals: 10,
          assists: 12,
          averageRating: 7.4,
          annualSalary: 28e5,
          contractEndDate: "2029-06-30",
          isUntouchable: true
        }),
        marketValueRange: [8e6, 14e6],
        askingPriceRange: [12e6, 2e7]
      }),
      buildScenario({
        id: "liga1_fwd_25",
        label: "25-letni FWD 74 OVR lider 1. Ligi",
        player: createPlayer({
          id: "LIGA1_FWD_25",
          position: "FWD" /* FWD */,
          overallRating: 74,
          age: 25,
          matchesPlayed: 29,
          minutesPlayed: 2380,
          goals: 15,
          assists: 4,
          averageRating: 7.2,
          annualSalary: 78e4,
          contractEndDate: "2028-06-30",
          clubId: "PL_L1_CLUB"
        }),
        clubOverrides: {
          id: "PL_L1_CLUB",
          leagueId: "PL_LEAGUE_2",
          tier: 2,
          reputation: 5,
          budget: 55e5,
          transferBudget: 12e5
        },
        marketValueRange: [16e5, 3e6],
        askingPriceRange: [2e6, 42e5]
      }),
      buildScenario({
        id: "liga1_veteran_mid",
        label: "35-letni MID 72 OVR rezerwowy 1. Ligi",
        player: createPlayer({
          id: "LIGA1_VETERAN_MID",
          position: "MID" /* MID */,
          overallRating: 72,
          age: 35,
          matchesPlayed: 9,
          minutesPlayed: 540,
          assists: 2,
          goals: 1,
          averageRating: 6.8,
          annualSalary: 54e4,
          contractEndDate: "2027-06-30",
          clubId: "PL_L1_CLUB_2",
          isOnTransferList: true
        }),
        clubOverrides: {
          id: "PL_L1_CLUB_2",
          leagueId: "PL_LEAGUE_2",
          tier: 2,
          reputation: 4,
          budget: 38e5,
          transferBudget: 9e5
        },
        marketValueRange: [25e4, 75e4],
        askingPriceRange: [25e4, 1e6]
      }),
      buildScenario({
        id: "liga2_fwd_23",
        label: "23-letni FWD 69 OVR strzelec 2. Ligi",
        player: createPlayer({
          id: "LIGA2_FWD_23",
          position: "FWD" /* FWD */,
          overallRating: 69,
          age: 23,
          matchesPlayed: 28,
          minutesPlayed: 2250,
          goals: 13,
          assists: 3,
          averageRating: 7,
          annualSalary: 24e4,
          contractEndDate: "2028-06-30",
          clubId: "PL_L2_CLUB"
        }),
        clubOverrides: {
          id: "PL_L2_CLUB",
          leagueId: "PL_LEAGUE_3",
          tier: 3,
          reputation: 3,
          budget: 16e5,
          transferBudget: 35e4
        },
        marketValueRange: [35e4, 9e5],
        askingPriceRange: [45e4, 14e5]
      }),
      buildScenario({
        id: "eng_elite_fwd_90",
        label: "Premier League: elite FWD 90 OVR",
        player: createPlayer({
          id: "ENG_ELITE_FWD_90",
          position: "FWD" /* FWD */,
          overallRating: 90,
          age: 24,
          matchesPlayed: 32,
          minutesPlayed: 2760,
          goals: 27,
          assists: 8,
          averageRating: 7.7,
          annualSalary: 18e6,
          contractEndDate: "2030-06-30",
          clubId: "ENG_TEST_CLUB"
        }),
        clubOverrides: {
          id: "ENG_TEST_CLUB",
          leagueId: "ENG_1",
          tier: 1,
          reputation: 18,
          country: "ENG",
          budget: 9e8,
          transferBudget: 25e7
        },
        marketValueRange: [18e7, 22e7],
        askingPriceRange: [19e7, 25e7]
      }),
      buildScenario({
        id: "esp_elite_fwd_90",
        label: "LaLiga: elite FWD 90 OVR",
        player: createPlayer({
          id: "ESP_ELITE_FWD_90",
          position: "FWD" /* FWD */,
          overallRating: 90,
          age: 21,
          matchesPlayed: 31,
          minutesPlayed: 2600,
          goals: 19,
          assists: 12,
          averageRating: 7.6,
          annualSalary: 14e6,
          contractEndDate: "2030-06-30",
          clubId: "ESP_TEST_CLUB"
        }),
        clubOverrides: {
          id: "ESP_TEST_CLUB",
          leagueId: "ESP_1",
          tier: 1,
          reputation: 19,
          country: "ESP",
          budget: 7e8,
          transferBudget: 18e7
        },
        marketValueRange: [175e6, 2e8],
        askingPriceRange: [185e6, 245e6]
      }),
      buildScenario({
        id: "ger_elite_mid_88",
        label: "Bundesliga: elite MID 88 OVR",
        player: createPlayer({
          id: "GER_ELITE_MID_88",
          position: "MID" /* MID */,
          overallRating: 88,
          age: 22,
          matchesPlayed: 30,
          minutesPlayed: 2520,
          goals: 11,
          assists: 14,
          averageRating: 7.5,
          annualSalary: 11e6,
          contractEndDate: "2030-06-30",
          clubId: "GER_TEST_CLUB"
        }),
        clubOverrides: {
          id: "GER_TEST_CLUB",
          leagueId: "GER_1",
          tier: 1,
          reputation: 18,
          country: "GER",
          budget: 52e7,
          transferBudget: 15e7
        },
        marketValueRange: [12e7, 135e6],
        askingPriceRange: [13e7, 17e7]
      }),
      buildScenario({
        id: "ita_elite_fwd_87",
        label: "Serie A: elite FWD 87 OVR",
        player: createPlayer({
          id: "ITA_ELITE_FWD_87",
          position: "FWD" /* FWD */,
          overallRating: 87,
          age: 28,
          matchesPlayed: 31,
          minutesPlayed: 2550,
          goals: 23,
          assists: 5,
          averageRating: 7.4,
          annualSalary: 105e5,
          contractEndDate: "2029-06-30",
          clubId: "ITA_TEST_CLUB"
        }),
        clubOverrides: {
          id: "ITA_TEST_CLUB",
          leagueId: "ITA_1",
          tier: 1,
          reputation: 18,
          country: "ITA",
          budget: 42e7,
          transferBudget: 11e7
        },
        marketValueRange: [85e6, 1e8],
        askingPriceRange: [1e8, 13e7]
      }),
      buildScenario({
        id: "fra_elite_mid_87",
        label: "Ligue 1: elite MID 87 OVR",
        player: createPlayer({
          id: "FRA_ELITE_MID_87",
          position: "MID" /* MID */,
          overallRating: 87,
          age: 25,
          matchesPlayed: 30,
          minutesPlayed: 2510,
          goals: 8,
          assists: 13,
          averageRating: 7.4,
          annualSalary: 9e6,
          contractEndDate: "2029-06-30",
          clubId: "FRA_TEST_CLUB"
        }),
        clubOverrides: {
          id: "FRA_TEST_CLUB",
          leagueId: "FRA_1",
          tier: 1,
          reputation: 19,
          country: "FRA",
          budget: 38e7,
          transferBudget: 95e6
        },
        marketValueRange: [9e7, 105e6],
        askingPriceRange: [1e8, 135e6]
      }),
      buildScenario({
        id: "por_top_mid_85",
        label: "Liga Portugal: top MID 85 OVR",
        player: createPlayer({
          id: "POR_TOP_MID_85",
          position: "MID" /* MID */,
          overallRating: 85,
          age: 26,
          matchesPlayed: 31,
          minutesPlayed: 2580,
          goals: 7,
          assists: 11,
          averageRating: 7.3,
          annualSalary: 45e5,
          contractEndDate: "2029-06-30",
          clubId: "POR_TEST_CLUB"
        }),
        clubOverrides: {
          id: "POR_TEST_CLUB",
          leagueId: "POR_1",
          tier: 1,
          reputation: 17,
          country: "POR",
          budget: 165e6,
          transferBudget: 45e6
        },
        marketValueRange: [5e7, 6e7],
        askingPriceRange: [55e6, 75e6]
      }),
      buildScenario({
        id: "bra_top_fwd_84",
        label: "Brazil Serie A: top FWD 84 OVR",
        player: createPlayer({
          id: "BRA_TOP_FWD_84",
          position: "FWD" /* FWD */,
          overallRating: 84,
          age: 23,
          matchesPlayed: 31,
          minutesPlayed: 2620,
          goals: 22,
          assists: 6,
          averageRating: 7.5,
          annualSalary: 65e5,
          contractEndDate: "2030-06-30",
          clubId: "BRA_TEST_CLUB"
        }),
        clubOverrides: {
          id: "BRA_TEST_CLUB",
          leagueId: "BRA_1",
          tier: 1,
          reputation: 16,
          country: "BRA",
          budget: 26e7,
          transferBudget: 8e7
        },
        marketValueRange: [4e7, 42e6],
        askingPriceRange: [5e7, 55e6]
      }),
      buildScenario({
        id: "arg_top_mid_83",
        label: "Argentina Primera: top MID 83 OVR",
        player: createPlayer({
          id: "ARG_TOP_MID_83",
          position: "MID" /* MID */,
          overallRating: 83,
          age: 22,
          matchesPlayed: 30,
          minutesPlayed: 2480,
          goals: 8,
          assists: 10,
          averageRating: 7.3,
          annualSalary: 4e6,
          contractEndDate: "2030-06-30",
          clubId: "ARG_TEST_CLUB"
        }),
        clubOverrides: {
          id: "ARG_TEST_CLUB",
          leagueId: "ARG_1",
          tier: 1,
          reputation: 15,
          country: "ARG",
          budget: 18e7,
          transferBudget: 45e6
        },
        marketValueRange: [27e6, 28e6],
        askingPriceRange: [35e6, 38e6]
      }),
      buildScenario({
        id: "ksa_top_fwd_85",
        label: "Saudi Pro League: top FWD 85 OVR",
        player: createPlayer({
          id: "KSA_TOP_FWD_85",
          position: "FWD" /* FWD */,
          overallRating: 85,
          age: 27,
          matchesPlayed: 29,
          minutesPlayed: 2310,
          goals: 19,
          assists: 7,
          averageRating: 7.4,
          annualSalary: 12e6,
          contractEndDate: "2029-06-30",
          clubId: "KSA_TEST_CLUB"
        }),
        clubOverrides: {
          id: "KSA_TEST_CLUB",
          leagueId: "KSA_1",
          tier: 2,
          reputation: 10,
          country: "KSA",
          budget: 22e7,
          transferBudget: 75e6
        },
        marketValueRange: [26e6, 3e7],
        askingPriceRange: [33e6, 39e6]
      }),
      buildScenario({
        id: "jpn_star_mid_80",
        label: "J1 League: star MID 80 OVR",
        player: createPlayer({
          id: "JPN_STAR_MID_80",
          position: "MID" /* MID */,
          overallRating: 80,
          age: 25,
          matchesPlayed: 30,
          minutesPlayed: 2420,
          goals: 7,
          assists: 11,
          averageRating: 7.2,
          annualSalary: 28e5,
          contractEndDate: "2029-06-30",
          clubId: "JPN_TEST_CLUB"
        }),
        clubOverrides: {
          id: "JPN_TEST_CLUB",
          leagueId: "JPN_1",
          tier: 2,
          reputation: 9,
          country: "JPN",
          budget: 7e7,
          transferBudget: 18e6
        },
        marketValueRange: [25e5, 32e5],
        askingPriceRange: [3e6, 45e5]
      }),
      buildScenario({
        id: "egy_star_fwd_79",
        label: "Egypt Premier League: star FWD 79 OVR",
        player: createPlayer({
          id: "EGY_STAR_FWD_79",
          position: "FWD" /* FWD */,
          overallRating: 79,
          age: 26,
          matchesPlayed: 28,
          minutesPlayed: 2180,
          goals: 16,
          assists: 4,
          averageRating: 7.2,
          annualSalary: 24e5,
          contractEndDate: "2029-06-30",
          clubId: "EGY_TEST_CLUB"
        }),
        clubOverrides: {
          id: "EGY_TEST_CLUB",
          leagueId: "EGY_1",
          tier: 2,
          reputation: 10,
          country: "EGY",
          budget: 6e7,
          transferBudget: 14e6
        },
        marketValueRange: [2e6, 3e6],
        askingPriceRange: [25e5, 4e6]
      })
    ];
    const rows = scenarios.map((scenario) => {
      const { marketValue, askingPrice } = calculateScenarioPrices(
        scenario.player,
        scenario.sellerClub,
        scenario.sellerSquad,
        scenario.boardKompetencja
      );
      assertInRange(marketValue, scenario.marketValueRange, `${scenario.label} marketValue outside expected range`);
      assertInRange(askingPrice, scenario.askingPriceRange, `${scenario.label} askingPrice outside expected range`);
      return {
        scenario: scenario.label,
        marketValue,
        marketTarget: `${scenario.marketValueRange[0].toLocaleString()}-${scenario.marketValueRange[1].toLocaleString()}`,
        askingPrice,
        askingTarget: `${scenario.askingPriceRange[0].toLocaleString()}-${scenario.askingPriceRange[1].toLocaleString()}`
      };
    });
    console.table(rows);
    const comparisonBasePlayer = createPlayer({
      id: "COMPARISON_BASE",
      position: "MID" /* MID */,
      overallRating: 76,
      age: 28,
      matchesPlayed: 28,
      minutesPlayed: 2250,
      assists: 7,
      goals: 5,
      averageRating: 7,
      contractEndDate: "2028-06-30",
      annualSalary: 17e5
    });
    const comparisonBaseClub = createClub({
      id: "PL_COMPARISON_CLUB",
      leagueId: "PL_LEAGUE_1",
      tier: 1,
      reputation: 6,
      budget: 11e6,
      transferBudget: 35e5
    });
    const comparisonCases = [
      {
        label: "Baza",
        player: comparisonBasePlayer,
        club: comparisonBaseClub,
        boardKompetencja: "przecietna"
      },
      {
        label: "Lista transferowa",
        player: { ...comparisonBasePlayer, id: "COMPARISON_LISTED", isOnTransferList: true },
        club: comparisonBaseClub,
        boardKompetencja: "przecietna"
      },
      {
        label: "Kr\xF3tki kontrakt",
        player: { ...comparisonBasePlayer, id: "COMPARISON_SHORT", contractEndDate: "2026-09-01" },
        club: comparisonBaseClub,
        boardKompetencja: "przecietna"
      },
      {
        label: "D\u0142ugi kontrakt",
        player: { ...comparisonBasePlayer, id: "COMPARISON_LONG", contractEndDate: "2030-06-30" },
        club: comparisonBaseClub,
        boardKompetencja: "przecietna"
      },
      {
        label: "Untouchable",
        player: { ...comparisonBasePlayer, id: "COMPARISON_UNTOUCHABLE", isUntouchable: true },
        club: comparisonBaseClub,
        boardKompetencja: "przecietna"
      },
      {
        label: "Presja finansowa",
        player: { ...comparisonBasePlayer, id: "COMPARISON_PRESSURE" },
        club: { ...comparisonBaseClub, id: "PL_COMPARISON_PRESSURE", budget: 9e5, transferBudget: 2e5 },
        boardKompetencja: "przecietna"
      },
      {
        label: "Zarz\u0105d bardzo wysoki",
        player: { ...comparisonBasePlayer, id: "COMPARISON_BOARD_HIGH" },
        club: comparisonBaseClub,
        boardKompetencja: "bardzo_wysoka"
      },
      {
        label: "Zarz\u0105d bardzo niski",
        player: { ...comparisonBasePlayer, id: "COMPARISON_BOARD_LOW" },
        club: comparisonBaseClub,
        boardKompetencja: "bardzo_niska"
      },
      {
        label: "Weteran 35 lat",
        player: {
          ...comparisonBasePlayer,
          id: "COMPARISON_VETERAN",
          age: 35,
          matchesPlayed: 20,
          minutesPlayed: 1350,
          assists: 5,
          goals: 3,
          averageRating: 6.9
        },
        club: comparisonBaseClub,
        boardKompetencja: "przecietna"
      }
    ].map((entry) => {
      const squad = createSupportSquad(entry.player);
      return {
        ...entry,
        ...calculateScenarioPrices(entry.player, entry.club, squad, entry.boardKompetencja)
      };
    });
    console.table(
      comparisonCases.map(({ label, marketValue, askingPrice }) => ({
        scenario: label,
        marketValue,
        askingPrice
      }))
    );
    const comparisonMap = Object.fromEntries(
      comparisonCases.map((entry) => [entry.label, entry])
    );
    assertLessThan(
      comparisonMap["Lista transferowa"].askingPrice,
      comparisonMap["Baza"].askingPrice,
      "Transfer list should reduce asking price"
    );
    assertLessThan(
      comparisonMap["Kr\xF3tki kontrakt"].askingPrice,
      comparisonMap["Baza"].askingPrice,
      "Short contract should reduce asking price"
    );
    assertGreaterThan(
      comparisonMap["D\u0142ugi kontrakt"].askingPrice,
      comparisonMap["Kr\xF3tki kontrakt"].askingPrice,
      "Long contract should be valued above short contract"
    );
    assertGreaterThan(
      comparisonMap["Untouchable"].askingPrice,
      comparisonMap["Baza"].askingPrice,
      "Untouchable status should increase asking price"
    );
    assertLessThan(
      comparisonMap["Presja finansowa"].askingPrice,
      comparisonMap["Baza"].askingPrice,
      "Financial pressure should reduce asking price"
    );
    assertGreaterThan(
      comparisonMap["Zarz\u0105d bardzo wysoki"].askingPrice,
      comparisonMap["Zarz\u0105d bardzo niski"].askingPrice,
      "Higher board competence should increase asking price"
    );
    assertLessThan(
      comparisonMap["Weteran 35 lat"].marketValue,
      comparisonMap["Baza"].marketValue,
      "Veteran market value should be lower than prime-age equivalent"
    );
    assertLessThan(
      comparisonMap["Weteran 35 lat"].askingPrice,
      comparisonMap["Baza"].askingPrice,
      "Veteran asking price should be lower than prime-age equivalent"
    );
    const internationalComparisonPlayer = createPlayer({
      id: "INTERNATIONAL_COMPARISON",
      position: "FWD" /* FWD */,
      overallRating: 83,
      age: 24,
      matchesPlayed: 29,
      minutesPlayed: 2280,
      goals: 17,
      assists: 5,
      averageRating: 7.2,
      annualSalary: 5e6,
      contractEndDate: "2029-06-30",
      clubId: "INTL_BASE"
    });
    const internationalComparisonCases = [
      { label: "England", country: "ENG", reputation: 17, clubId: "INTL_ENG" },
      { label: "Spain", country: "ESP", reputation: 17, clubId: "INTL_ESP" },
      { label: "Germany", country: "GER", reputation: 17, clubId: "INTL_GER" },
      { label: "Italy", country: "ITA", reputation: 17, clubId: "INTL_ITA" },
      { label: "France", country: "FRA", reputation: 17, clubId: "INTL_FRA" },
      { label: "Portugal", country: "POR", reputation: 17, clubId: "INTL_POR" }
    ].map((entry) => {
      const club = createClub({
        id: entry.clubId,
        leagueId: `${entry.country}_1`,
        tier: 1,
        country: entry.country,
        reputation: entry.reputation,
        budget: 25e7,
        transferBudget: 8e7
      });
      const player = { ...internationalComparisonPlayer, id: `INT_${entry.country}`, clubId: entry.clubId };
      const squad = createSupportSquad(player);
      return {
        label: entry.label,
        ...calculateScenarioPrices(player, club, squad, "przecietna")
      };
    });
    console.table(
      internationalComparisonCases.map(({ label, marketValue, askingPrice }) => ({
        scenario: `Rynek ${label}`,
        marketValue,
        askingPrice
      }))
    );
    const internationalMap = Object.fromEntries(
      internationalComparisonCases.map((entry) => [entry.label, entry])
    );
    assertGreaterThan(
      internationalMap["England"].marketValue,
      internationalMap["Spain"].marketValue,
      "England should price the same player above Spain"
    );
    assertGreaterThan(
      internationalMap["Spain"].marketValue,
      internationalMap["Germany"].marketValue,
      "Spain should price the same player above Germany"
    );
    assertGreaterThan(
      internationalMap["Germany"].marketValue,
      internationalMap["Italy"].marketValue,
      "Germany should price the same player above Italy"
    );
    assertGreaterThan(
      internationalMap["Italy"].marketValue,
      internationalMap["Portugal"].marketValue,
      "Italy should price the same player above Portugal"
    );
    assertGreaterThan(
      internationalMap["France"].marketValue,
      internationalMap["Portugal"].marketValue,
      "France should price the same player above Portugal"
    );
    const emergingMarketComparisonPlayer = createPlayer({
      id: "EMERGING_MARKET_COMPARISON",
      position: "FWD" /* FWD */,
      overallRating: 81,
      age: 24,
      matchesPlayed: 29,
      minutesPlayed: 2260,
      goals: 18,
      assists: 5,
      averageRating: 7.2,
      annualSalary: 35e5,
      contractEndDate: "2029-06-30",
      clubId: "EM_BASE"
    });
    const emergingMarketComparisonCases = [
      { label: "Brazil", country: "BRA", tier: 1, reputation: 16, clubId: "EM_BRA", budget: 18e7, transferBudget: 5e7 },
      { label: "Argentina", country: "ARG", tier: 1, reputation: 15, clubId: "EM_ARG", budget: 13e7, transferBudget: 3e7 },
      { label: "Saudi Arabia", country: "KSA", tier: 2, reputation: 10, clubId: "EM_KSA", budget: 18e7, transferBudget: 6e7 },
      { label: "Egypt", country: "EGY", tier: 2, reputation: 10, clubId: "EM_EGY", budget: 45e6, transferBudget: 12e6 },
      { label: "Japan", country: "JPN", tier: 2, reputation: 9, clubId: "EM_JPN", budget: 55e6, transferBudget: 14e6 },
      { label: "Morocco", country: "MAR", tier: 2, reputation: 9, clubId: "EM_MAR", budget: 4e7, transferBudget: 1e7 }
    ].map((entry) => {
      const club = createClub({
        id: entry.clubId,
        leagueId: `${entry.country}_1`,
        tier: entry.tier,
        country: entry.country,
        reputation: entry.reputation,
        budget: entry.budget,
        transferBudget: entry.transferBudget
      });
      const player = { ...emergingMarketComparisonPlayer, id: `EM_${entry.country}`, clubId: entry.clubId };
      const squad = createSupportSquad(player);
      return {
        label: entry.label,
        ...calculateScenarioPrices(player, club, squad, "przecietna")
      };
    });
    console.table(
      emergingMarketComparisonCases.map(({ label, marketValue, askingPrice }) => ({
        scenario: `Rynek ${label}`,
        marketValue,
        askingPrice
      }))
    );
    const emergingMap = Object.fromEntries(
      emergingMarketComparisonCases.map((entry) => [entry.label, entry])
    );
    assertGreaterThan(
      emergingMap["Brazil"].marketValue,
      emergingMap["Argentina"].marketValue,
      "Brazil should price the same player above Argentina"
    );
    assertGreaterThan(
      emergingMap["Argentina"].marketValue,
      emergingMap["Saudi Arabia"].marketValue,
      "Argentina should price the same player above Saudi Arabia"
    );
    assertGreaterThan(
      emergingMap["Saudi Arabia"].marketValue,
      emergingMap["Egypt"].marketValue,
      "Saudi Arabia should price the same player above Egypt"
    );
    assertGreaterThan(
      emergingMap["Egypt"].marketValue,
      emergingMap["Japan"].marketValue,
      "Egypt should price the same player above Japan"
    );
    assertGreaterThan(
      emergingMap["Japan"].marketValue,
      emergingMap["Morocco"].marketValue,
      "Japan should price the same player above Morocco"
    );
    const balkanComparisonPlayer = createPlayer({
      id: "BALKAN_MARKET_COMPARISON",
      position: "FWD" /* FWD */,
      overallRating: 78,
      age: 24,
      matchesPlayed: 30,
      minutesPlayed: 2400,
      goals: 16,
      assists: 5,
      averageRating: 7.2,
      annualSalary: 18e5,
      contractEndDate: "2029-06-30",
      clubId: "BALKAN_BASE"
    });
    const balkanComparisonCases = [
      { label: "Greece", country: "GRE", reputation: 12 },
      { label: "Croatia", country: "CRO", reputation: 10 },
      { label: "Serbia", country: "SRB", reputation: 10 },
      { label: "Romania", country: "ROU", reputation: 10 },
      { label: "Bulgaria", country: "BUL", reputation: 8 },
      { label: "Slovenia", country: "SVN", reputation: 8 },
      { label: "Bosnia", country: "BIH", reputation: 7 },
      { label: "Albania", country: "ALB", reputation: 6 },
      { label: "North Macedonia", country: "MKD", reputation: 6 },
      { label: "Montenegro", country: "MNE", reputation: 6 }
    ].map((entry) => {
      const club = createClub({
        id: `BALKAN_${entry.country}`,
        leagueId: `${entry.country}_1`,
        tier: 1,
        country: entry.country,
        reputation: entry.reputation,
        budget: 6e7,
        transferBudget: 15e6
      });
      const player = { ...balkanComparisonPlayer, id: `BALKAN_${entry.country}`, clubId: club.id };
      const squad = createSupportSquad(player);
      return {
        label: entry.label,
        ...calculateScenarioPrices(player, club, squad, "przecietna")
      };
    });
    console.table(
      balkanComparisonCases.map(({ label, marketValue, askingPrice }) => ({
        scenario: `Rynek ${label}`,
        marketValue,
        askingPrice
      }))
    );
    const balkanMap = Object.fromEntries(
      balkanComparisonCases.map((entry) => [entry.label, entry])
    );
    assertGreaterThan(
      balkanMap["Greece"].marketValue,
      balkanMap["Croatia"].marketValue,
      "Greece should price the same player above Croatia"
    );
    assertGreaterThan(
      balkanMap["Croatia"].marketValue,
      balkanMap["Serbia"].marketValue,
      "Croatia should price the same player above Serbia"
    );
    assertGreaterThan(
      balkanMap["Serbia"].marketValue,
      balkanMap["Romania"].marketValue,
      "Serbia should price the same player above Romania"
    );
    assertGreaterThan(
      balkanMap["Romania"].marketValue,
      balkanMap["Bulgaria"].marketValue,
      "Romania should price the same player above Bulgaria"
    );
    assertGreaterThan(
      balkanMap["Bulgaria"].marketValue,
      balkanMap["Slovenia"].marketValue,
      "Bulgaria should price the same player above Slovenia"
    );
    assertGreaterThan(
      balkanMap["Slovenia"].marketValue,
      balkanMap["Bosnia"].marketValue,
      "Slovenia should price the same player above Bosnia"
    );
    assertGreaterThan(
      balkanMap["Bosnia"].marketValue,
      balkanMap["Albania"].marketValue,
      "Bosnia should price the same player above Albania"
    );
    assertGreaterThan(
      balkanMap["Albania"].marketValue,
      balkanMap["North Macedonia"].marketValue,
      "Albania should price the same player above North Macedonia"
    );
    assertGreaterThan(
      balkanMap["North Macedonia"].marketValue,
      balkanMap["Montenegro"].marketValue,
      "North Macedonia should price the same player above Montenegro"
    );
    const nordicComparisonPlayer = createPlayer({
      id: "NORDIC_MARKET_COMPARISON",
      position: "FWD" /* FWD */,
      overallRating: 78,
      age: 24,
      matchesPlayed: 30,
      minutesPlayed: 2400,
      goals: 16,
      assists: 5,
      averageRating: 7.2,
      annualSalary: 18e5,
      contractEndDate: "2029-06-30",
      clubId: "NORDIC_BASE"
    });
    const nordicComparisonCases = [
      { label: "Denmark", country: "DEN", reputation: 13 },
      { label: "Norway", country: "NOR", reputation: 11 },
      { label: "Sweden", country: "SWE", reputation: 10 },
      { label: "Finland", country: "FIN", reputation: 7 },
      { label: "Iceland", country: "ISL", reputation: 5 }
    ].map((entry) => {
      const club = createClub({
        id: `NORDIC_${entry.country}`,
        leagueId: `${entry.country}_1`,
        tier: 1,
        country: entry.country,
        reputation: entry.reputation,
        budget: 5e7,
        transferBudget: 12e6
      });
      const player = { ...nordicComparisonPlayer, id: `NORDIC_${entry.country}`, clubId: club.id };
      const squad = createSupportSquad(player);
      return {
        label: entry.label,
        ...calculateScenarioPrices(player, club, squad, "przecietna")
      };
    });
    console.table(
      nordicComparisonCases.map(({ label, marketValue, askingPrice }) => ({
        scenario: `Rynek ${label}`,
        marketValue,
        askingPrice
      }))
    );
    const nordicMap = Object.fromEntries(
      nordicComparisonCases.map((entry) => [entry.label, entry])
    );
    assertGreaterThan(
      nordicMap["Denmark"].marketValue,
      nordicMap["Norway"].marketValue,
      "Denmark should price the same player above Norway"
    );
    assertGreaterThan(
      nordicMap["Norway"].marketValue,
      nordicMap["Sweden"].marketValue,
      "Norway should price the same player above Sweden"
    );
    assertGreaterThan(
      nordicMap["Sweden"].marketValue,
      nordicMap["Finland"].marketValue,
      "Sweden should price the same player above Finland"
    );
    assertGreaterThan(
      nordicMap["Finland"].marketValue,
      nordicMap["Iceland"].marketValue,
      "Finland should price the same player above Iceland"
    );
    if (failures.length > 0) {
      console.error("Market balance assertions failed:");
      failures.forEach((failure) => console.error(`- ${failure}`));
      process.exitCode = 1;
      return;
    }
    console.log("Market balance assertions completed.");
  } finally {
    Math.random = originalRandom;
    console.groupEnd();
  }
};
runMarketValueBalanceTests();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  runMarketValueBalanceTests
});
