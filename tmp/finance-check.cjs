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

// services/FinanceService.ts
var FinanceService_exports = {};
__export(FinanceService_exports, {
  FinanceService: () => FinanceService,
  MATCHDAY_ADDITIONAL_REVENUE_PARAMS: () => MATCHDAY_ADDITIONAL_REVENUE_PARAMS,
  MATCHDAY_COST_PARAMS: () => MATCHDAY_COST_PARAMS,
  VIP_BOX_REVENUE_PARAMS: () => VIP_BOX_REVENUE_PARAMS
});
module.exports = __toCommonJS(FinanceService_exports);
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
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
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
      return 0.94 + clamp(careerMatches / 260, 0, 1) * 0.2;
    case "GK" /* GK */:
      return 0.92 + clamp(careerMatches / 240, 0, 1) * 0.24;
    default:
      return 0.94 + clamp(careerMatches / 260, 0, 1) * 0.08;
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
  const sampleFactor = clamp(minutesPlayed / 900, 0, 1);
  const ratingDelta = averageRating === null ? 0 : averageRating - 6.7;
  switch (player.position) {
    case "FWD" /* FWD */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const goalsBoost = clamp(goals / 20, 0, 1) * 0.2 + clamp(goalsPer90 / 0.75, 0, 1) * 0.18;
      const assistsBoost = clamp(assists / 10, 0, 1) * 0.07 + clamp(assistsPer90 / 0.35, 0, 1) * 0.05;
      const ratingBoost = clamp(ratingDelta * 0.1, -0.08, 0.1);
      return 1 + clamp(sampleFactor * (goalsBoost + assistsBoost + ratingBoost), -0.1, 0.52);
    }
    case "MID" /* MID */: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const assistsBoost = clamp(assists / 14, 0, 1) * 0.18 + clamp(assistsPer90 / 0.45, 0, 1) * 0.15;
      const goalsBoost = clamp(goals / 12, 0, 1) * 0.08 + clamp(goalsPer90 / 0.35, 0, 1) * 0.06;
      const ratingBoost = clamp(ratingDelta * 0.11, -0.08, 0.12);
      return 1 + clamp(sampleFactor * (assistsBoost + goalsBoost + ratingBoost), -0.1, 0.46);
    }
    case "DEF" /* DEF */: {
      const matchFactor = clamp(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp(getCareerMatches(player) / 260, 0, 1) * 0.12;
      const ratingBoost = averageRating === null ? 0 : clamp((averageRating - 6.6) * 0.18, -0.1, 0.22) * clamp(matchesPlayed / 10, 0, 1);
      return 1 + clamp(matchFactor + experienceBoost + ratingBoost, -0.1, 0.42);
    }
    case "GK" /* GK */: {
      const matchFactor = clamp(matchesPlayed / 30, 0, 1) * 0.1;
      const experienceBoost = clamp(getCareerMatches(player) / 240, 0, 1) * 0.14;
      const ratingBoost = averageRating === null ? 0 : clamp((averageRating - 6.6) * 0.22, -0.1, 0.24) * clamp(matchesPlayed / 8, 0, 1);
      return 1 + clamp(matchFactor + experienceBoost + ratingBoost, -0.12, 0.46);
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
  const reputationFactor = 0.88 + clamp(reputation, 1, 10) * 0.025;
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
  return clamp(countryFactor * reputationFactor * stadiumFactor * competitionFactor / 1.45, 0.45, 2.6);
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
  const marketFactor = clamp(0.5 + Math.sqrt(financeFactor / 1.45) * 0.55, 0.45, 1.1);
  const capScale = clamp(marketFactor / 0.9, 0.55, 1.22);
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
  const reputationFactor = 0.9 + clamp(reputation, 1, 20) * 0.015;
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
        min = 2e7;
        max = 7e7;
        break;
      case 3:
        min = 35e5;
        max = 16e6;
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
    if (isEuropeanCommercialClub(club)) {
      const marketIndex = getEuropeanCommercialIndex(club);
      if (isHome) {
        const att = attendance ?? 0;
        const fillRate = club.stadiumCapacity > 0 ? att / club.stadiumCapacity : 0;
        const fillMultiplier = fillRate >= 0.95 ? 1.3 : fillRate >= 0.85 ? 1.18 : fillRate >= 0.7 ? 1.08 : 1;
        const rawCost2 = (18e4 + club.stadiumCapacity * (5.5 + marketIndex * 1.8) + att * (7 + marketIndex * 2.4) + club.reputation * (16e3 + marketIndex * 8e3)) * fillMultiplier;
        const minFloor = 18e4 + club.stadiumCapacity * (2 + marketIndex * 0.8);
        const maxCap = 35e4 + club.stadiumCapacity * (14 + marketIndex * 4);
        return Math.round(clamp(rawCost2, minFloor, maxCap));
      }
      const awayRaw = 12e4 + club.stadiumCapacity * (1 + marketIndex * 0.35) + club.reputation * (7e3 + marketIndex * 3e3);
      const awayCap = 22e4 + club.stadiumCapacity * (3.5 + marketIndex);
      return Math.round(Math.min(awayRaw, awayCap));
    }
    const tier = Math.min(4, Math.max(1, parseInt(club.leagueId.split("_")[2] || "4")));
    const p = MATCHDAY_COST_PARAMS;
    if (isHome) {
      const att = attendance ?? 0;
      const fillRate = club.stadiumCapacity > 0 ? att / club.stadiumCapacity : 0;
      const fillMultiplier = fillRate >= 0.95 ? 1.5 : fillRate >= 0.85 ? 1.3 : fillRate >= 0.7 ? 1.1 : 1;
      const rawCost2 = (p.home.baseCost[tier] + att * p.home.perFanCost[tier] + club.reputation * p.home.repScale[tier]) * fillMultiplier;
      return Math.min(
        p.home.maxCap[tier],
        Math.max(p.home.minFloor[tier], Math.floor(rawCost2))
      );
    }
    const rawCost = p.away.baseCost[tier] + club.reputation * p.away.repScale[tier];
    return Math.min(p.away.maxCap[tier], Math.floor(rawCost));
  },
  calculateSeasonalIncome: (tier, reputation, rank) => {
    const cappedReputation = Math.max(1, Math.min(10, reputation));
    if (tier === 3) {
      const tvRights2 = 2e6;
      const sponsorship2 = cappedReputation * 5e5;
      const prizeMoney2 = Math.max(0, (19 - rank) * 15e4);
      return Math.floor(tvRights2 + sponsorship2 + prizeMoney2);
    }
    if (tier === 4) {
      const tvRights2 = 75e4;
      const sponsorship2 = cappedReputation * 15e4;
      const prizeMoney2 = Math.max(0, (20 - rank) * 4e4);
      return Math.floor(tvRights2 + sponsorship2 + prizeMoney2);
    }
    const tvRights = [0, 35e6, 15e6, 6e6, 2e6][tier] || 1e6;
    const sponsorship = cappedReputation * 4e6;
    const prizeMoney = Math.max(0, (19 - rank) * 15e5);
    return Math.floor(tvRights + sponsorship + prizeMoney);
  },
  calculateMarketValue: (player, reputation, tier, clubCountry) => {
    if (player.clubId === "FREE_AGENTS") return 0;
    const ovr = player.overallRating;
    const normalizedCountry = normalizeMarketCountry(clubCountry);
    const isPolishClub = player.clubId.startsWith("PL_") || normalizedCountry === "POL";
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
    let basePercent = 0.25 + Math.random() * 0.75;
    if (clubReputation > 8) {
      basePercent = Math.max(0.6, basePercent);
    }
    let demand = proposedSalary * basePercent;
    if (player.overallRating > 75) {
      demand *= 1.15;
    }
    return Math.floor(demand);
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
  evaluateContractLogic: (player, newSalary, newBonus, newEndDate, currentDate, clubReputation) => {
    const now = currentDate.getTime();
    const currentEnd = new Date(player.contractEndDate).getTime();
    const newEnd = new Date(newEndDate).getTime();
    const expectedSalary = player.annualSalary > 0 ? player.annualSalary : FinanceService.getFairMarketSalary(player.overallRating);
    const expectedBonus = FinanceService.calculatePlayerBonusDemand(player, expectedSalary, clubReputation);
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
    return Math.round(clamp(maxPrice, 45, 420));
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
    const seasonTicketShare = clamp(0.14 + marketIndex * 0.1 + club.reputation / 20 * 0.18, 0.16, 0.65);
    const ticketsSold = Math.floor(club.stadiumCapacity * seasonTicketShare);
    const singleMatchPrice = FinanceService.calculateTicketPriceForClub(club);
    const seasonDiscount = clamp(0.68 + marketIndex * 0.05, 0.7, 0.82);
    const seasonTicketPrice = Math.round(clamp(singleMatchPrice * 19 * seasonDiscount, 900, 8500));
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
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      return FinanceService.calculateMatchdayAdditionalRevenues(attendance, tier, club.reputation);
    }
    const marketIndex = getEuropeanCommercialIndex(club);
    const repMultiplier = 0.9 + club.reputation / 20 * 0.45;
    const rand = () => 0.82 + Math.random() * 0.36;
    const catering = Math.floor(attendance * (2.5 + marketIndex * 2.6) * repMultiplier * rand());
    const merchandising = Math.floor(attendance * (0.9 + marketIndex * 1.4) * repMultiplier * rand());
    const programs = Math.floor(attendance * (0.3 + marketIndex * 0.45) * repMultiplier * rand());
    const parking = Math.floor(attendance * (0.4 + marketIndex * 0.65) * repMultiplier * rand());
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
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      if (tier !== 1 || club.stadiumCapacity <= 15e3) return 0;
      return FinanceService.calculateVIPBoxRevenue(club.stadiumCapacity, club.reputation);
    }
    if (club.stadiumCapacity < 4e3) return 0;
    const marketIndex = getEuropeanCommercialIndex(club);
    const suitesSold = Math.max(4, Math.round(club.stadiumCapacity / 2200));
    const avgSuitePrice = 25e3 + marketIndex * 12e4 + club.reputation / 20 * 1e5;
    const occupancyFactor = club.leagueId === "L_CL" ? 1 : club.leagueId === "L_EL" ? 0.92 : 0.86;
    const jitter = 0.9 + Math.random() * 0.2;
    return Math.round(suitesSold * avgSuitePrice * occupancyFactor * jitter);
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
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FinanceService,
  MATCHDAY_ADDITIONAL_REVENUE_PARAMS,
  MATCHDAY_COST_PARAMS,
  VIP_BOX_REVENUE_PARAMS
});
