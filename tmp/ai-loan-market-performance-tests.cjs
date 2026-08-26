// tests/AiLoanMarketPerformanceTests.ts
var import_node_assert = require("node:assert");
var import_node_perf_hooks = require("node:perf_hooks");

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

// services/IncomingTransferService.ts
var TIMING_LABELS = {
  ["IMMEDIATE" /* IMMEDIATE */]: "Natychmiast",
  ["IN_SIX_MONTHS" /* IN_SIX_MONTHS */]: "Na kolejne okno transferowe",
  ["IN_TWELVE_MONTHS" /* IN_TWELVE_MONTHS */]: "Od pocz\u0105tku kolejnego sezonu",
  ["CONTRACT_END" /* CONTRACT_END */]: "Po wyga\u015Bni\u0119ciu kontraktu"
};
var LOAN_DURATION_LABELS = {
  ROUND: "Do ko\u0144ca rundy",
  SEASON: "Do ko\u0144ca sezonu"
};
var IncomingTransferService = {
  buildOfferSeed(currentDate, buyerClubId, playerId) {
    const dateKey = typeof currentDate === "string" ? currentDate : currentDate.toISOString().split("T")[0];
    return IncomingTransferService.hashString(`${dateKey}::${buyerClubId}::${playerId}`);
  },
  getTimingLabel(timing) {
    return TIMING_LABELS[timing] ?? timing;
  },
  getLoanDurationLabel(duration) {
    return duration ? LOAN_DURATION_LABELS[duration] : "Wypo\u017Cyczenie";
  },
  isActiveIncomingOfferStatus(status) {
    return status !== "EXPIRED" /* EXPIRED */ && status !== "REJECTED_BY_MANAGER" /* REJECTED_BY_MANAGER */ && status !== "COMPLETED" /* COMPLETED */ && status !== "REJECTED_AT_CONFIRM" /* REJECTED_AT_CONFIRM */ && status !== "PLAYER_REFUSED" /* PLAYER_REFUSED */;
  },
  hasActiveIncomingOfferForPlayer(playerId, activeIncomingOffers, kind) {
    return activeIncomingOffers.some(
      (offer) => offer.playerId === playerId && IncomingTransferService.isActiveIncomingOfferStatus(offer.status) && (!kind || (offer.kind ?? "TRANSFER") === kind)
    );
  },
  getClubTier(club) {
    return FinanceService.getClubTier(club);
  },
  /**
   * Ogranicza nierealne wypożyczenia z klubów europejskiej czołówki do Polski.
   * Zwrócenie `null` oznacza, że para klubów nie wymaga specjalnego ograniczenia.
   * Losowanie jest deterministyczne dla przekazanego ziarna, więc ponawianie tej
   * samej oferty tego samego dnia nie daje graczowi kolejnych prób RNG.
   */
  getEliteEuropeanToPolishLoanChance(buyerClub, sellerClub) {
    const isPolishBuyer = buyerClub.country === "POL" || buyerClub.leagueId.startsWith("L_PL_");
    const isForeignEuropeanSeller = sellerClub.country !== "POL" && ["L_CL", "L_EL", "L_CONF"].includes(sellerClub.leagueId);
    const isEliteSeller = sellerClub.reputation >= 15;
    if (!isPolishBuyer || !isForeignEuropeanSeller || !isEliteSeller) return null;
    if (["L_PL_2", "L_PL_3", "L_PL_4"].includes(buyerClub.leagueId)) {
      return 1e-6;
    }
    if (buyerClub.leagueId === "L_PL_1" && buyerClub.reputation < 15) {
      return 1e-4;
    }
    return null;
  },
  passesLoanRealismGate(buyerClub, sellerClub, seed) {
    const restrictedChance = IncomingTransferService.getEliteEuropeanToPolishLoanChance(
      buyerClub,
      sellerClub
    );
    return restrictedChance === null || IncomingTransferService.seededRandom(seed + 911731) < restrictedChance;
  },
  /**
   * Polskie kluby z poziomów L_PL_2-L_PL_4 korzystają z zamkniętej puli
   * wypożyczeń: wyższe ligi polskie albo zagraniczna Europa z reputacją do 10.
   * Poprzedni wyjątek dla europejskiej elity pozostaje możliwy raz na milion.
   */
  getPolishLowerLeagueLoanSource(buyerClub, sellerClub) {
    if (!["L_PL_2", "L_PL_3", "L_PL_4"].includes(buyerClub.leagueId)) return null;
    const buyerTier = IncomingTransferService.getClubTier(buyerClub);
    const sellerTier = IncomingTransferService.getClubTier(sellerClub);
    const isPolishSeller = sellerClub.country === "POL" || sellerClub.leagueId.startsWith("L_PL_");
    if (isPolishSeller && sellerTier < buyerTier) return "POLISH_HIGHER_LEAGUE";
    const isForeignEuropeanSeller = !isPolishSeller && ["L_CL", "L_EL", "L_CONF"].includes(sellerClub.leagueId);
    if (isForeignEuropeanSeller && sellerClub.reputation <= 10) {
      return "FOREIGN_EUROPE_REP_10_MAX";
    }
    if (isForeignEuropeanSeller && sellerClub.reputation >= 15) {
      return "ELITE_ONE_IN_MILLION";
    }
    return "INELIGIBLE";
  },
  matchesPolishLowerLeagueLoanSourceDraw(buyerClub, sellerClub, currentDate) {
    const source = IncomingTransferService.getPolishLowerLeagueLoanSource(buyerClub, sellerClub);
    if (source === null || source === "ELITE_ONE_IN_MILLION") return true;
    if (source === "INELIGIBLE") return false;
    const sourceSeed = IncomingTransferService.buildOfferSeed(
      currentDate,
      buyerClub.id,
      "POLISH_LOWER_LEAGUE_LOAN_SOURCE"
    );
    const preferredSource = IncomingTransferService.seededRandom(sourceSeed + 85015) < 0.85 ? "POLISH_HIGHER_LEAGUE" : "FOREIGN_EUROPE_REP_10_MAX";
    return source === preferredSource;
  },
  getBuyerIdealOverall(club) {
    return Math.min(95, 30 + club.reputation * 4.5);
  },
  getBuyerMinimumTargetOverall(player, buyerClub) {
    const idealOvr = IncomingTransferService.getBuyerIdealOverall(buyerClub);
    let tolerance = 24;
    if (buyerClub.reputation >= 18) tolerance = 15;
    else if (buyerClub.reputation >= 15) tolerance = 17;
    else if (buyerClub.reputation >= 12) tolerance = 19;
    else if (buyerClub.reputation >= 8) tolerance = 22;
    if (player.isOnTransferList) tolerance += 2;
    if (player.age <= 21) tolerance += 2;
    return idealOvr - tolerance;
  },
  getSquadAverageOverall(squad) {
    if (squad.length === 0) return 0;
    return squad.reduce((sum, squadPlayer) => sum + squadPlayer.overallRating, 0) / squad.length;
  },
  getBuyerSquadFit(player, buyerSquad) {
    if (!buyerSquad || buyerSquad.length === 0) return { fits: true, multiplier: 1 };
    const squadAverage = IncomingTransferService.getSquadAverageOverall(buyerSquad);
    if (player.overallRating < squadAverage) {
      return { fits: false, multiplier: 0 };
    }
    const samePosition = buyerSquad.filter((squadPlayer) => squadPlayer.position === player.position);
    const positionAverage = samePosition.length > 0 ? IncomingTransferService.getSquadAverageOverall(samePosition) : squadAverage;
    const positionGap = player.overallRating - positionAverage;
    const squadGap = player.overallRating - squadAverage;
    if (positionGap >= 4 || squadGap >= 5) return { fits: true, multiplier: 1.2 };
    if (positionGap >= 1 || squadGap >= 2) return { fits: true, multiplier: 1.05 };
    return { fits: true, multiplier: 0.85 };
  },
  getLoanSquadNeed(player, buyerSquad, snapshot) {
    if (!buyerSquad || buyerSquad.length === 0) {
      return { fits: true, needScore: 9, positionGap: 9, squadGap: 9 };
    }
    const squadAverage = snapshot?.squadAverage ?? IncomingTransferService.getSquadAverageOverall(buyerSquad);
    const positionSnapshot = snapshot?.byPosition[player.position];
    const samePosition = positionSnapshot ? void 0 : buyerSquad.filter((squadPlayer) => squadPlayer.position === player.position);
    const positionCount = positionSnapshot?.count ?? samePosition.length;
    const positionAverage = positionCount > 0 ? positionSnapshot?.average ?? IncomingTransferService.getSquadAverageOverall(samePosition) : squadAverage - 3;
    const bestInPosition = positionCount > 0 ? positionSnapshot?.best ?? Math.max(...samePosition.map((squadPlayer) => squadPlayer.overallRating)) : squadAverage - 4;
    const positionGap = player.overallRating - positionAverage;
    const bestGap = player.overallRating - bestInPosition;
    const squadGap = player.overallRating - squadAverage;
    const thinPositionBonus = positionCount <= 2 ? 2 : 0;
    const positionSlots = {
      ["GK" /* GK */]: 1,
      ["DEF" /* DEF */]: 4,
      ["MID" /* MID */]: 4,
      ["FWD" /* FWD */]: 2
    };
    const matchdayRotationLimit = positionSlots[player.position] + 3;
    const strongerOrEqualInPosition = positionSnapshot ? positionSnapshot.ratingsDescending.findIndex((rating) => rating < player.overallRating) : samePosition.filter((squadPlayer) => squadPlayer.overallRating >= player.overallRating).length;
    const normalizedStrongerOrEqual = strongerOrEqualInPosition === -1 ? positionCount : strongerOrEqualInPosition;
    const isInsidePositionRotation = normalizedStrongerOrEqual < matchdayRotationLimit;
    const isCloseToPositionLevel = player.overallRating >= positionAverage - 2;
    const isThinPosition = positionCount <= positionSlots[player.position] + 1;
    const isDevelopmentLoan = player.age <= 23 && player.overallRating >= positionAverage - 4 && normalizedStrongerOrEqual < matchdayRotationLimit + 2;
    const rotationScore = isInsidePositionRotation ? Math.max(3, matchdayRotationLimit - normalizedStrongerOrEqual) : 0;
    const needScore = Math.max(positionGap + thinPositionBonus, bestGap * 1.5, squadGap, rotationScore);
    return {
      fits: needScore >= 4 || isInsidePositionRotation && isCloseToPositionLevel || isThinPosition || isDevelopmentLoan,
      needScore,
      positionGap,
      squadGap
    };
  },
  /**
   * Builds the immutable values reused while many loan candidates are compared
   * with the same buyer squad. The daily AI-to-AI market used to filter and
   * average the entire squad several times for every seller-player-buyer tuple.
   */
  buildLoanSquadNeedSnapshot(buyerSquad) {
    const positions2 = ["GK" /* GK */, "DEF" /* DEF */, "MID" /* MID */, "FWD" /* FWD */];
    const squadAverage = IncomingTransferService.getSquadAverageOverall(buyerSquad);
    const byPosition = Object.fromEntries(positions2.map((position) => {
      const ratingsDescending = buyerSquad.filter((player) => player.position === position).map((player) => player.overallRating).sort((left, right) => right - left);
      const total = ratingsDescending.reduce((sum, rating) => sum + rating, 0);
      return [position, {
        count: ratingsDescending.length,
        average: ratingsDescending.length > 0 ? total / ratingsDescending.length : 0,
        best: ratingsDescending[0] ?? 0,
        ratingsDescending
      }];
    }));
    return { squadAverage, byPosition };
  },
  getLoanBuyerCategory(buyerClub, sellerClub) {
    const buyerTier = IncomingTransferService.getClubTier(buyerClub);
    const sellerTier = IncomingTransferService.getClubTier(sellerClub);
    const repGap = sellerClub.reputation - buyerClub.reputation;
    const foreignClub = !!buyerClub.country && !!sellerClub.country && buyerClub.country !== sellerClub.country;
    const polishLowerLeagueSource = IncomingTransferService.getPolishLowerLeagueLoanSource(
      buyerClub,
      sellerClub
    );
    if (polishLowerLeagueSource === "POLISH_HIGHER_LEAGUE") return "LOWER_LEAGUE";
    if (polishLowerLeagueSource === "FOREIGN_EUROPE_REP_10_MAX" || polishLowerLeagueSource === "ELITE_ONE_IN_MILLION") {
      return "FOREIGN_LOWER_REP";
    }
    if (polishLowerLeagueSource === "INELIGIBLE") return null;
    if (buyerTier > sellerTier) return "LOWER_LEAGUE";
    if (buyerClub.leagueId === sellerClub.leagueId) return "SAME_LEAGUE";
    if (foreignClub && buyerClub.leagueId === "L_PL_1" && buyerClub.reputation >= 15 && sellerClub.reputation >= 15) {
      return "FOREIGN_LOWER_REP";
    }
    if (foreignClub && repGap >= 2 && repGap <= 4) return "FOREIGN_LOWER_REP";
    return null;
  },
  resolveLoanEndDate(currentDate, duration) {
    const current = new Date(currentDate);
    const year = current.getFullYear();
    const month = current.getMonth();
    let endDate;
    if (duration === "ROUND") {
      endDate = month <= 0 ? new Date(year, 0, 31) : new Date(year, 11, 31);
    } else {
      endDate = month >= 6 ? new Date(year + 1, 5, 30) : new Date(year, 5, 30);
    }
    if (endDate <= current) {
      endDate = new Date(current);
      endDate.setMonth(endDate.getMonth() + (duration === "ROUND" ? 5 : 10));
    }
    return endDate.toISOString().split("T")[0];
  },
  calculateLoanTotalCost(player, loanFee, wageCoveragePercent, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(30, Math.ceil((end.getTime() - start.getTime()) / 864e5));
    const wageCost = player.annualSalary * (wageCoveragePercent / 100) * (days / 365);
    return Math.round((loanFee + wageCost) / 1e3) * 1e3;
  },
  shouldGenerateLoanOffer(player, buyerClub, sellerClub, activeIncomingOffers, seed, currentDate, buyerPlayers, optimization) {
    if (!optimization?.prevalidatedCategory) {
      if (!ReserveTeamLeagueService.canRecruitPlayerFrom(buyerClub.id, sellerClub.id)) {
        return { shouldGenerate: false, category: null };
      }
      if (!IncomingTransferService.matchesPolishLowerLeagueLoanSourceDraw(buyerClub, sellerClub, currentDate)) {
        return { shouldGenerate: false, category: null };
      }
    }
    if (!IncomingTransferService.passesLoanRealismGate(buyerClub, sellerClub, seed)) {
      return { shouldGenerate: false, category: null };
    }
    if (!player.isAvailableForLoan || player.loan || player.transferPendingClubId) {
      return { shouldGenerate: false, category: null };
    }
    const buyerSquadSize = buyerPlayers?.length ?? buyerClub.rosterIds.length;
    if (buyerClub.id === sellerClub.id || buyerSquadSize >= 32) {
      return { shouldGenerate: false, category: null };
    }
    const category = optimization?.prevalidatedCategory ?? IncomingTransferService.getLoanBuyerCategory(buyerClub, sellerClub);
    if (!category) return { shouldGenerate: false, category: null };
    if (!optimization?.activeOfferConflictAlreadyChecked) {
      const hasActiveLoanOffer = IncomingTransferService.hasActiveIncomingOfferForPlayer(player.id, activeIncomingOffers, "LOAN");
      const hasActiveSaleOffer = IncomingTransferService.hasActiveIncomingOfferForPlayer(player.id, activeIncomingOffers, "TRANSFER");
      if (hasActiveLoanOffer || hasActiveSaleOffer) return { shouldGenerate: false, category: null };
    }
    if (IncomingTransferService.hasRecentIncomingOfferNoise(player, buyerClub, activeIncomingOffers, currentDate)) {
      return { shouldGenerate: false, category: null };
    }
    const need = IncomingTransferService.getLoanSquadNeed(player, buyerPlayers, optimization?.loanNeedSnapshot);
    if (!need.fits) return { shouldGenerate: false, category: null };
    const categoryWeight = category === "LOWER_LEAGUE" ? 0.85 : category === "SAME_LEAGUE" ? 0.18 : 0.09;
    const repGap = sellerClub.reputation - buyerClub.reputation;
    let chance = 0.06 * categoryWeight;
    if (need.needScore >= 8) chance *= 2.2;
    else if (need.needScore >= 6) chance *= 1.45;
    if (category === "SAME_LEAGUE") chance *= 0.85;
    if (category === "FOREIGN_LOWER_REP" && repGap > 3.5) chance *= 0.65;
    if (player.age <= 23) chance *= 1.25;
    if (player.annualSalary > buyerClub.transferBudget * 0.45) chance *= 0.35;
    return {
      shouldGenerate: IncomingTransferService.seededRandom(seed + 2201) < Math.min(0.16, chance),
      category
    };
  },
  calculateLoanOffer(player, buyerClub, sellerClub, currentDate, seed) {
    const rng1 = IncomingTransferService.seededRandom(seed + 3001);
    const rng2 = IncomingTransferService.seededRandom(seed + 3002);
    const rng3 = IncomingTransferService.seededRandom(seed + 3003);
    const duration = rng1 < 0.42 ? "ROUND" : "SEASON";
    const startDate = typeof currentDate === "string" ? currentDate : currentDate.toISOString().split("T")[0];
    const endDate = IncomingTransferService.resolveLoanEndDate(currentDate, duration);
    const repGap = sellerClub.reputation - buyerClub.reputation;
    const coverageOptions = repGap >= 4 ? [35, 45, 55] : repGap >= 2 ? [45, 55, 65] : [50, 65, 80];
    const wageCoveragePercent = coverageOptions[Math.min(coverageOptions.length - 1, Math.floor(rng2 * coverageOptions.length))];
    const marketValue = FinanceService.calculateMarketValue(
      player,
      sellerClub.reputation,
      IncomingTransferService.getClubTier(sellerClub),
      sellerClub.country
    );
    const wantsFee = rng3 > 0.65 || player.overallRating >= IncomingTransferService.getBuyerIdealOverall(buyerClub) + 4;
    const rawLoanFee = wantsFee ? Math.max(player.annualSalary * (0.04 + rng3 * 0.08), marketValue * (15e-4 + rng3 * 45e-4)) : 0;
    const loanFee = Math.round(rawLoanFee / 1e3) * 1e3;
    const totalCost = IncomingTransferService.calculateLoanTotalCost(player, loanFee, wageCoveragePercent, startDate, endDate);
    const budgetCeiling = Math.max(0, Math.min(buyerClub.transferBudget, buyerClub.budget * 0.4));
    if (totalCost > budgetCeiling || loanFee > buyerClub.transferBudget) return null;
    const urgency = rng1 < 0.25 ? 3 : rng1 < 0.7 ? 2 : 1;
    return {
      fee: loanFee,
      aiMaxFee: Math.min(buyerClub.transferBudget, Math.round(Math.max(loanFee, loanFee * 1.2) / 1e3) * 1e3),
      aiUrgency: urgency,
      timing: "IMMEDIATE" /* IMMEDIATE */,
      loanDuration: duration,
      loanStartDate: startDate,
      loanEndDate: endDate,
      wageCoveragePercent,
      loanFee,
      loanTotalCost: totalCost,
      loanPlayerCanBeForced: true,
      promisedPlayingTime: player.age <= 23 && rng1 < 0.68 ? "FIRST_TEAM" : rng2 < 0.48 ? "FIRST_TEAM" : "ROTATION"
    };
  },
  evaluateLoanCounterOffer(player, buyerClub, offer, currentDate, requested) {
    const startDate = offer.loanStartDate || (typeof currentDate === "string" ? currentDate : currentDate.toISOString().split("T")[0]);
    const requestedDuration = requested.loanDuration;
    const requestedEndDate = IncomingTransferService.resolveLoanEndDate(currentDate, requestedDuration);
    const requestedFee = Math.max(0, Math.round(requested.loanFee / 1e3) * 1e3);
    const requestedCoverage = Math.max(0, Math.min(100, Math.round(requested.wageCoveragePercent / 5) * 5));
    const requestedTotalCost = IncomingTransferService.calculateLoanTotalCost(
      player,
      requestedFee,
      requestedCoverage,
      startDate,
      requestedEndDate
    );
    const urgencyMultiplier = offer.aiUrgency === 3 ? 1.35 : offer.aiUrgency === 2 ? 1.18 : 1;
    const originalFee = offer.loanFee ?? offer.fee ?? 0;
    const maxFee = Math.min(
      buyerClub.transferBudget,
      Math.max(offer.aiMaxFee, Math.round(originalFee * (1.15 + offer.aiUrgency * 0.08) / 1e3) * 1e3)
    );
    const budgetCeiling = Math.max(
      0,
      Math.min(buyerClub.transferBudget, buyerClub.budget * (offer.aiUrgency === 3 ? 0.45 : 0.35))
    );
    const affordableTotal = budgetCeiling * urgencyMultiplier;
    if (requestedFee <= maxFee && requestedTotalCost <= affordableTotal) {
      return {
        result: "ACCEPT",
        loanFee: requestedFee,
        wageCoveragePercent: requestedCoverage,
        loanDuration: requestedDuration,
        loanStartDate: startDate,
        loanEndDate: requestedEndDate,
        loanTotalCost: requestedTotalCost,
        note: "Klub zaakceptowa\u0142 kontrofert\u0119. Warunki mieszcz\u0105 si\u0119 w bud\u017Cecie i nadal odpowiadaj\u0105 potrzebie kadrowej."
      };
    }
    if (requestedFee > buyerClub.transferBudget || requestedTotalCost > affordableTotal * 1.35) {
      return {
        result: "REJECT",
        loanFee: offer.loanFee ?? offer.fee ?? 0,
        wageCoveragePercent: offer.wageCoveragePercent ?? 0,
        loanDuration: offer.loanDuration ?? "SEASON",
        loanStartDate: startDate,
        loanEndDate: offer.loanEndDate || IncomingTransferService.resolveLoanEndDate(currentDate, offer.loanDuration ?? "SEASON"),
        loanTotalCost: offer.loanTotalCost ?? 0,
        note: "Klub odrzuci\u0142 kontrofert\u0119. \u0141\u0105czny koszt wypo\u017Cyczenia przekracza ich realne mo\u017Cliwo\u015Bci finansowe."
      };
    }
    const counterDuration = requestedDuration === "SEASON" && requestedTotalCost > budgetCeiling ? "ROUND" : requestedDuration;
    const counterEndDate = IncomingTransferService.resolveLoanEndDate(currentDate, counterDuration);
    const counterFee = Math.max(
      offer.loanFee ?? offer.fee ?? 0,
      Math.min(requestedFee, Math.round(maxFee / 1e3) * 1e3)
    );
    const counterCoverage = Math.max(
      offer.wageCoveragePercent ?? 0,
      Math.min(requestedCoverage, requestedCoverage >= 100 ? 75 : requestedCoverage)
    );
    const counterTotalCost = IncomingTransferService.calculateLoanTotalCost(
      player,
      counterFee,
      counterCoverage,
      startDate,
      counterEndDate
    );
    return {
      result: "COUNTER",
      loanFee: counterFee,
      wageCoveragePercent: counterCoverage,
      loanDuration: counterDuration,
      loanStartDate: startDate,
      loanEndDate: counterEndDate,
      loanTotalCost: counterTotalCost,
      note: "Klub nie przyj\u0105\u0142 pe\u0142nej kontroferty, ale przedstawi\u0142 kompromis mieszcz\u0105cy si\u0119 bli\u017Cej ich bud\u017Cetu."
    };
  },
  isPlausibleBuyerForPlayer(player, buyerClub, buyerSquad) {
    const squadFit = IncomingTransferService.getBuyerSquadFit(player, buyerSquad);
    if (!squadFit.fits) return false;
    const minOvr = IncomingTransferService.getBuyerMinimumTargetOverall(player, buyerClub);
    if (player.overallRating >= minOvr) return true;
    const idealOvr = IncomingTransferService.getBuyerIdealOverall(buyerClub);
    const talent = player.attributes?.talent ?? player.overallRating;
    const highUpsideYoungster = player.age <= 21 && talent >= idealOvr - 2 && player.overallRating >= minOvr - 8;
    if (highUpsideYoungster) return true;
    const strongRecentForm = player.age <= 28 && IncomingTransferService.getAvgRating(player) >= 8 && player.overallRating >= minOvr - 4;
    return strongRecentForm;
  },
  getStrongForeignBuyerPolishLowOvrMultiplier(player, buyerClub, sellerClub) {
    const isPolishPlayer = player.nationality === "POLAND" /* POLAND */ || player.nationalityCountry === "Polska" || player.nationalityCountry === "Poland";
    const isForeignBuyer = !!buyerClub.country && !!sellerClub.country && buyerClub.country !== sellerClub.country;
    if (isPolishPlayer && isForeignBuyer && buyerClub.reputation > 9 && player.overallRating < 65) {
      return 0.08;
    }
    return 1;
  },
  getBuyerFitProbabilityMultiplier(player, buyerClub, buyerSquad) {
    const idealOvr = IncomingTransferService.getBuyerIdealOverall(buyerClub);
    const ovrDelta = player.overallRating - idealOvr;
    const squadFit = IncomingTransferService.getBuyerSquadFit(player, buyerSquad);
    let multiplier = 0.3;
    if (ovrDelta >= -2) multiplier = 1.15;
    else if (ovrDelta >= -6) multiplier = 1;
    else if (ovrDelta >= -10) multiplier = 0.75;
    else if (ovrDelta >= -16) multiplier = 0.5;
    return multiplier * squadFit.multiplier;
  },
  hasRecentIncomingOfferNoise(player, buyerClub, incomingOffers, currentDate) {
    const today = new Date(currentDate);
    const playerOffers = incomingOffers.filter((offer) => offer.playerId === player.id);
    return playerOffers.some((offer) => {
      const offerDate = new Date(offer.createdAt || offer.emailSentAt);
      const daysSinceOffer = IncomingTransferService.daysBetween(offerDate, today);
      if (daysSinceOffer < 0) return false;
      if (offer.buyerClubId === buyerClub.id && daysSinceOffer < 60) return true;
      if (player.isOnTransferList) {
        return daysSinceOffer < 4;
      }
      switch (offer.status) {
        case "REJECTED_BY_MANAGER" /* REJECTED_BY_MANAGER */:
        case "REJECTED_AT_CONFIRM" /* REJECTED_AT_CONFIRM */:
          return daysSinceOffer < 21;
        case "EXPIRED" /* EXPIRED */:
        case "PLAYER_REFUSED" /* PLAYER_REFUSED */:
          return daysSinceOffer < 14;
        case "COMPLETED" /* COMPLETED */:
          return false;
        default:
          return daysSinceOffer < 10;
      }
    });
  },
  getPlayerLoyalty(player) {
    return Math.max(1, Math.min(99, Math.round(player.lojalnosc ?? 50)));
  },
  isTransferLoyaltySoftened(player) {
    return !!player.isOnTransferList || !player.squadRole;
  },
  isMajorReputationStepUp(buyerClub, sellerClub) {
    return buyerClub.reputation >= sellerClub.reputation + 5;
  },
  getTransferLoyaltyInterestMultiplier(player, buyerClub, sellerClub) {
    if (IncomingTransferService.isTransferLoyaltySoftened(player) || IncomingTransferService.isMajorReputationStepUp(buyerClub, sellerClub)) {
      return 1;
    }
    const loyalty = IncomingTransferService.getPlayerLoyalty(player);
    const resistance = Math.max(0, (loyalty - 55) / 44);
    return Math.max(0.16, 1 - resistance * 0.84);
  },
  isProtectedFromLowerReputationBuyer(player, buyerClub, sellerClub, sellerPlayers) {
    if (player.isOnTransferList) return false;
    const reputationGap = sellerClub.reputation - buyerClub.reputation;
    if (reputationGap <= 1) return false;
    const matchesPlayed = player.stats?.matchesPlayed ?? 0;
    const minutesPlayed = player.stats?.minutesPlayed ?? 0;
    const goals = player.stats?.goals ?? 0;
    const assists = player.stats?.assists ?? 0;
    const goalContributions = goals + assists;
    const avgRating = IncomingTransferService.getAvgRating(player);
    const gamesSample = Math.max(matchesPlayed, minutesPlayed / 90);
    const regularPlayer = matchesPlayed >= 6 || minutesPlayed >= 450;
    const goodRecentForm = gamesSample >= 5 && avgRating >= 7.2;
    const productiveForward = player.position === "FWD" /* FWD */ && gamesSample >= 5 && (goals >= 5 || goals / gamesSample >= 0.25);
    const productiveMidfielder = player.position === "MID" /* MID */ && gamesSample >= 5 && (goalContributions >= 6 || goalContributions / gamesSample >= 0.25);
    const productiveSeason = goals >= 8 || goalContributions >= 10;
    const importantRole = player.isUntouchable || player.squadRole === "KEY_PLAYER" || player.squadRole === "STARTER";
    let importantInSquad = false;
    if (sellerPlayers && sellerPlayers.length > 0) {
      const sortedSquad = [...sellerPlayers].sort((a, b) => b.overallRating - a.overallRating);
      const playerRank = sortedSquad.findIndex((squadPlayer) => squadPlayer.id === player.id);
      const squadAverage = IncomingTransferService.getSquadAverageOverall(sellerPlayers);
      importantInSquad = playerRank >= 0 && playerRank <= 10 || player.overallRating >= squadAverage + 2;
    }
    const sellerLevelOverall = Math.max(60, IncomingTransferService.getBuyerIdealOverall(sellerClub) - 7);
    const strongForSellerLevel = player.overallRating >= sellerLevelOverall;
    const isValuableRegular = regularPlayer && (strongForSellerLevel || importantRole || importantInSquad || goodRecentForm);
    return importantRole || importantInSquad || isValuableRegular || goodRecentForm || productiveForward || productiveMidfielder || productiveSeason;
  },
  shouldGenerateOffer(player, buyerClub, sellerClub, activeIncomingOffers, seed, currentDate, sellerPlayers, buyerPlayers) {
    if (!ReserveTeamLeagueService.canRecruitPlayerFrom(buyerClub.id, sellerClub.id)) {
      return { shouldGenerate: false, source: null };
    }
    const hasActiveOffer = activeIncomingOffers.some(
      (o) => o.playerId === player.id && o.buyerClubId === buyerClub.id && IncomingTransferService.isActiveIncomingOfferStatus(o.status)
    );
    if (hasActiveOffer) return { shouldGenerate: false, source: null };
    if (IncomingTransferService.hasActiveIncomingOfferForPlayer(player.id, activeIncomingOffers, "LOAN")) {
      return { shouldGenerate: false, source: null };
    }
    if (player.loan) {
      return { shouldGenerate: false, source: null };
    }
    if (IncomingTransferService.hasRecentIncomingOfferNoise(player, buyerClub, activeIncomingOffers, currentDate)) {
      return { shouldGenerate: false, source: null };
    }
    if (player.transferLockoutUntil && new Date(currentDate) < new Date(player.transferLockoutUntil)) {
      return { shouldGenerate: false, source: null };
    }
    if (player.transferOfferBanUntil && new Date(currentDate) < new Date(player.transferOfferBanUntil)) {
      return { shouldGenerate: false, source: null };
    }
    if (player.transferPendingClubId) {
      return { shouldGenerate: false, source: null };
    }
    if (buyerClub.rosterIds.length >= 30) return { shouldGenerate: false, source: null };
    if (buyerClub.id === sellerClub.id) return { shouldGenerate: false, source: null };
    if (!IncomingTransferService.isPlausibleBuyerForPlayer(player, buyerClub, buyerPlayers)) {
      return { shouldGenerate: false, source: null };
    }
    if (IncomingTransferService.isProtectedFromLowerReputationBuyer(player, buyerClub, sellerClub, sellerPlayers)) {
      return { shouldGenerate: false, source: null };
    }
    if (player.squadRole === "KEY_PLAYER") {
      const avgRating = IncomingTransferService.getAvgRating(player);
      const isExceptional = player.overallRating >= 75 && avgRating > 7.6;
      if (!isExceptional) return { shouldGenerate: false, source: null };
    }
    const isShortlisted = !!player.interestedClubs?.includes(buyerClub.id);
    const priority = IncomingTransferService.isExceptionalSpontaneousTarget(
      player,
      buyerClub,
      sellerClub,
      currentDate,
      sellerPlayers
    );
    if (player.isUntouchable && !player.isOnTransferList) {
      const buyerIsClearStepUp = buyerClub.reputation >= sellerClub.reputation + 2;
      const eliteInterest = priority === 1 || priority === 2;
      if (!buyerIsClearStepUp || !eliteInterest) {
        return { shouldGenerate: false, source: null };
      }
    }
    const PRIORITY_PROB = {
      1: 36e-4,
      2: 24e-4,
      3: 18e-4,
      4: 18e-4,
      5: 9e-4
    };
    let prob = priority !== false ? PRIORITY_PROB[priority] : 0;
    let source = null;
    prob *= IncomingTransferService.getBuyerFitProbabilityMultiplier(player, buyerClub, buyerPlayers);
    prob *= IncomingTransferService.getTransferLoyaltyInterestMultiplier(player, buyerClub, sellerClub);
    if (player.isOnTransferList) prob *= 4;
    if (player.isUntouchable && !player.isOnTransferList) prob *= 0.18;
    if (player.contractEndDate) {
      const daysLeft = IncomingTransferService.daysUntil(player.contractEndDate, currentDate);
      if (daysLeft < 180) prob *= 1.8;
    }
    if (buyerClub.reputation > sellerClub.reputation) prob *= 1.3;
    if (isShortlisted) {
      prob = Math.max(prob, 4e-3);
      prob *= 3;
      prob *= 0.85;
      source = "SHORTLIST";
    } else {
      if (priority === false) {
        return { shouldGenerate: false, source: null };
      }
      const discoveryRoll = IncomingTransferService.seededRandom(seed + 17);
      const discoveryThreshold = priority === 1 ? 0.35 : priority === 2 ? 0.25 : priority <= 4 ? 0.18 : 0.12;
      if (discoveryRoll >= discoveryThreshold) {
        return { shouldGenerate: false, source: null };
      }
      source = "SPONTANEOUS";
    }
    if (player.squadRole === "KEY_PLAYER") prob = Math.min(prob, 0.05);
    prob *= IncomingTransferService.getStrongForeignBuyerPolishLowOvrMultiplier(player, buyerClub, sellerClub);
    const rng = IncomingTransferService.seededRandom(seed);
    const shouldGenerate = rng < prob;
    return {
      shouldGenerate,
      source: shouldGenerate ? source : null
    };
  },
  calculateOffer(player, buyerClub, sellerClub, isInsideTransferWindow, seed) {
    const sellerTier = IncomingTransferService.getClubTier(sellerClub);
    const marketValue = FinanceService.calculateMarketValue(player, sellerClub.reputation, sellerTier, sellerClub.country);
    const rng1 = IncomingTransferService.seededRandom(seed + 1);
    const rng2 = IncomingTransferService.seededRandom(seed + 2);
    const rng3 = IncomingTransferService.seededRandom(seed + 3);
    const urgency = rng1 < 0.25 ? 1 : rng1 < 0.65 ? 2 : 3;
    let feeMin;
    let feeMax;
    if (urgency === 1) {
      feeMin = 0.55;
      feeMax = 0.85;
    } else if (urgency === 2) {
      feeMin = 0.85;
      feeMax = 1.15;
    } else {
      feeMin = 1.15;
      feeMax = 1.6;
    }
    if (player.isUntouchable && !player.isOnTransferList) {
      if (urgency === 1) {
        feeMin = 1.35;
        feeMax = 1.7;
      } else if (urgency === 2) {
        feeMin = 1.65;
        feeMax = 2.05;
      } else {
        feeMin = 1.95;
        feeMax = 2.5;
      }
    }
    const feeMultiplier = feeMin + rng2 * (feeMax - feeMin);
    const isLowerRepBuyer = buyerClub.reputation < sellerClub.reputation;
    const repPenalty = isLowerRepBuyer ? 0.5 + IncomingTransferService.seededRandom(seed + 4) * 0.2 : 1;
    const fee = Math.round(marketValue * feeMultiplier * repPenalty / 1e3) * 1e3;
    const maxMultiplier = 1.1 + rng3 * 0.2;
    const aiMaxFee = Math.min(
      Math.round(fee * maxMultiplier / 1e3) * 1e3,
      buyerClub.budget
    );
    const timing = IncomingTransferService.selectTiming(isInsideTransferWindow, rng1, rng2);
    return { fee, aiMaxFee, aiUrgency: urgency, timing };
  },
  selectTiming(isInsideWindow, _rng1, rng2) {
    if (isInsideWindow) {
      if (rng2 < 0.45) return "IMMEDIATE" /* IMMEDIATE */;
      if (rng2 < 0.75) return "IN_SIX_MONTHS" /* IN_SIX_MONTHS */;
      return "IN_TWELVE_MONTHS" /* IN_TWELVE_MONTHS */;
    }
    if (rng2 < 0.55) return "IN_SIX_MONTHS" /* IN_SIX_MONTHS */;
    return "IN_TWELVE_MONTHS" /* IN_TWELVE_MONTHS */;
  },
  evaluateBoardPressure(offer, player, sellerClub, buyerClub, seed) {
    const sellerTier = IncomingTransferService.getClubTier(sellerClub);
    if (sellerClub.budget < 0) return true;
    const marketValue = FinanceService.calculateMarketValue(player, sellerClub.reputation, sellerTier, sellerClub.country);
    if (offer.fee > marketValue * 1.8) return true;
    if (player.isOnTransferList && buyerClub && seed !== void 0 && buyerClub.reputation < sellerClub.reputation && offer.fee < marketValue) {
      if (IncomingTransferService.seededRandom(seed + 99) < 0.4) return true;
    }
    return false;
  },
  processAICounterResponse(offer, seed) {
    const currentDemand = offer.counterFee ?? offer.fee;
    if (currentDemand <= offer.aiMaxFee) {
      return { verdict: "ACCEPT", newFee: currentDemand };
    }
    const rng = IncomingTransferService.seededRandom(seed);
    if (offer.aiUrgency === 3 && rng < 0.4) {
      const compromise = Math.round(offer.aiMaxFee * (1.02 + rng * 0.05) / 1e3) * 1e3;
      if (compromise < currentDemand) {
        return { verdict: "COUNTER", newFee: compromise };
      }
      return { verdict: "ACCEPT", newFee: offer.aiMaxFee };
    }
    if (offer.aiUrgency === 2 && rng < 0.2) {
      const compromise = Math.round(offer.aiMaxFee * (1.01 + rng * 0.03) / 1e3) * 1e3;
      if (compromise < currentDemand) {
        return { verdict: "COUNTER", newFee: compromise };
      }
      return { verdict: "ACCEPT", newFee: offer.aiMaxFee };
    }
    return { verdict: "REJECT" };
  },
  simulatePlayerNegotiation(player, buyerClub, sellerClub, seed, currentDate) {
    const rng = IncomingTransferService.seededRandom(seed);
    const repDelta = buyerClub.reputation - sellerClub.reputation;
    let acceptChance = 0.55;
    if (repDelta >= 3) acceptChance = 0.85;
    else if (repDelta >= 1) acceptChance = 0.7;
    else if (repDelta === 0) acceptChance = 0.55;
    else if (repDelta === -1) acceptChance = 0.4;
    else acceptChance = 0.25;
    if (player.isOnTransferList) acceptChance += 0.15;
    if (!player.squadRole) acceptChance += 0.08;
    const daysLeft = IncomingTransferService.daysUntil(player.contractEndDate, currentDate);
    if (daysLeft < 180) acceptChance += 0.1;
    if (!IncomingTransferService.isTransferLoyaltySoftened(player) && !IncomingTransferService.isMajorReputationStepUp(buyerClub, sellerClub)) {
      const loyalty = IncomingTransferService.getPlayerLoyalty(player);
      const loyaltyResistance = Math.max(0, (loyalty - 50) / 49);
      acceptChance -= loyaltyResistance * 0.46;
      if (loyalty >= 85) acceptChance *= 0.72;
    }
    acceptChance = Math.min(0.95, Math.max(0.05, acceptChance));
    return rng < acceptChance ? "accepted" : "refused";
  },
  simulateLoanPlayerDecision(player, buyerClub, sellerClub, buyerSquad, seed, loanNeedSnapshot) {
    const rng = IncomingTransferService.seededRandom(seed);
    const repDelta = buyerClub.reputation - sellerClub.reputation;
    const need = IncomingTransferService.getLoanSquadNeed(player, buyerSquad, loanNeedSnapshot);
    let acceptChance = 0.48;
    if (repDelta >= 0) acceptChance += 0.18;
    else if (repDelta === -1) acceptChance += 0.04;
    else if (repDelta === -2) acceptChance -= 0.1;
    else acceptChance -= 0.22;
    if (need.needScore >= 8) acceptChance += 0.18;
    else if (need.needScore >= 6) acceptChance += 0.1;
    if (player.age <= 23) acceptChance += 0.12;
    if (player.stats.matchesPlayed <= 3 && player.stats.minutesPlayed < 300) acceptChance += 0.1;
    if (player.squadRole === "KEY_PLAYER" || player.squadRole === "STARTER") acceptChance -= 0.2;
    acceptChance = Math.min(0.92, Math.max(0.08, acceptChance));
    return rng < acceptChance ? "accepted" : "refused";
  },
  processDailyTimers(offers, currentDateStr) {
    const today = new Date(currentDateStr);
    const actions = [];
    const updatedOffers = offers.map((offer) => {
      const updated = { ...offer };
      if (offer.status === "EMAIL_SENT" /* EMAIL_SENT */) {
        const emailDate = new Date(offer.emailSentAt);
        const daysPassed = IncomingTransferService.daysBetween(emailDate, today);
        if (daysPassed >= 5) {
          updated.status = "REMINDER_SENT" /* REMINDER_SENT */;
          updated.reminderSentAt = currentDateStr;
          actions.push({ type: "SEND_REMINDER", offerId: offer.id });
        }
      } else if (offer.status === "REMINDER_SENT" /* REMINDER_SENT */) {
        const reminderDate = new Date(offer.reminderSentAt);
        const daysPassed = IncomingTransferService.daysBetween(reminderDate, today);
        if (daysPassed >= 3) {
          updated.status = "EXPIRED" /* EXPIRED */;
          actions.push({ type: "EXPIRE", offerId: offer.id });
        }
      } else if (offer.status === "COUNTER_PENDING_AI" /* COUNTER_PENDING_AI */) {
        const counterDate = new Date(offer.playerNegotiationStartedAt ?? offer.createdAt);
        const daysPassed = IncomingTransferService.daysBetween(counterDate, today);
        if (daysPassed >= 1) {
          actions.push({ type: "PROCESS_AI_COUNTER", offerId: offer.id });
        }
      } else if (offer.status === "NEGOTIATION_IN_PROGRESS" /* NEGOTIATION_IN_PROGRESS */) {
        if (offer.playerNegotiationResolvesAt) {
          const resolveDate = new Date(offer.playerNegotiationResolvesAt);
          if (today >= resolveDate) {
            actions.push({ type: "RESOLVE_PLAYER_NEGOTIATION", offerId: offer.id });
          }
        }
      }
      return updated;
    });
    return { updatedOffers, actions };
  },
  daysUntil(isoDate, referenceDate = /* @__PURE__ */ new Date()) {
    const target = new Date(isoDate);
    const now = new Date(referenceDate);
    return Math.floor((target.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
  },
  daysBetween(from, to) {
    return Math.floor((to.getTime() - from.getTime()) / (1e3 * 60 * 60 * 24));
  },
  addDays(isoDate, days) {
    const d = new Date(isoDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  },
  getAvgRating(player) {
    const h = player.stats.ratingHistory;
    if (!h || h.length === 0) return 0;
    return h.reduce((s, r) => s + r, 0) / h.length;
  },
  isExceptionalSpontaneousTarget(player, buyerClub, sellerClub, currentDate, sellerPlayers) {
    if (player.isOnTransferList) {
      let isBestPlayerListed = false;
      if (sellerPlayers) {
        const squadBestOvr = Math.max(...sellerPlayers.map((p) => p.overallRating));
        isBestPlayerListed = player.overallRating >= squadBestOvr;
      }
      return isBestPlayerListed ? 1 : 3;
    }
    const ovr = player.overallRating;
    const age = player.age;
    const avgRating = IncomingTransferService.getAvgRating(player);
    const goals = player.stats.goals;
    const assists = player.stats.assists;
    const talent = player.attributes.talent;
    const isFwd = player.position === "FWD" /* FWD */;
    const isMid = player.position === "MID" /* MID */;
    if (ovr >= 80 && talent >= 80 && age >= 16 && age <= 24) return 1;
    if (ovr >= 80 && age <= 28 && avgRating >= 7.5) return 2;
    if (isFwd && ovr >= 80 && age <= 30 && goals >= 10 && avgRating >= 7.2) return 3;
    if (isMid && ovr >= 80 && age <= 30 && assists >= 10 && avgRating >= 7.2) return 4;
    if (avgRating >= 7.2) return 5;
    return false;
  },
  hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = hash * 31 + value.charCodeAt(i) | 0;
    }
    return Math.abs(hash);
  },
  seededRandom(seed) {
    const x = Math.sin(seed + 1) * 1e4;
    return x - Math.floor(x);
  }
};

// tests/AiLoanMarketPerformanceTests.ts
var makePlayer = (id, position, overallRating) => ({
  id,
  firstName: "Test",
  lastName: id,
  age: 19 + overallRating % 15,
  clubId: "BUYER",
  nationality: "POLAND" /* POLAND */,
  position,
  overallRating,
  attributes: {
    strength: 60,
    stamina: 60,
    pace: 60,
    defending: 60,
    passing: 60,
    attacking: 60,
    finishing: 60,
    technique: 60,
    vision: 60,
    dribbling: 60,
    heading: 60,
    positioning: 60,
    goalkeeping: 10,
    freeKicks: 50,
    talent: 70,
    penalties: 50,
    corners: 50,
    aggression: 50,
    crossing: 50,
    leadership: 50,
    mentality: 60,
    workRate: 60
  },
  stats: {
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
  health: { status: "HEALTHY" /* HEALTHY */ },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: "2052-06-30",
  annualSalary: 1e5,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0
});
var positions = ["GK" /* GK */, "DEF" /* DEF */, "MID" /* MID */, "FWD" /* FWD */];
var buyerSquads = Array.from(
  { length: 1213 },
  (_, clubIndex) => Array.from({ length: 24 }, (_2, playerIndex) => makePlayer(
    `BUYER_${clubIndex}_${playerIndex}`,
    positions[playerIndex % positions.length],
    48 + (clubIndex * 7 + playerIndex * 3) % 35
  ))
);
var candidates = Array.from({ length: 360 }, (_, index) => makePlayer(
  `CANDIDATE_${index}`,
  positions[index % positions.length],
  52 + index * 11 % 35
));
var snapshots = buyerSquads.map((squad) => IncomingTransferService.buildLoanSquadNeedSnapshot(squad));
var legacyChecksum = 0;
var legacyStartedAt = import_node_perf_hooks.performance.now();
for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
  const candidate = candidates[candidateIndex];
  for (let buyerIndex = candidateIndex % 3; buyerIndex < buyerSquads.length; buyerIndex += 3) {
    const result = IncomingTransferService.getLoanSquadNeed(
      candidate,
      buyerSquads[buyerIndex]
    );
    legacyChecksum += result.fits ? Math.round(result.needScore * 10) : -1;
  }
}
var legacyElapsedMs = import_node_perf_hooks.performance.now() - legacyStartedAt;
var optimizedChecksum = 0;
var optimizedStartedAt = import_node_perf_hooks.performance.now();
for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
  const candidate = candidates[candidateIndex];
  for (let buyerIndex = candidateIndex % 3; buyerIndex < buyerSquads.length; buyerIndex += 3) {
    const result = IncomingTransferService.getLoanSquadNeed(
      candidate,
      buyerSquads[buyerIndex],
      snapshots[buyerIndex]
    );
    optimizedChecksum += result.fits ? Math.round(result.needScore * 10) : -1;
  }
}
var optimizedElapsedMs = import_node_perf_hooks.performance.now() - optimizedStartedAt;
import_node_assert.strict.notEqual(optimizedChecksum, 0, "benchmark musi wykorzysta\u0107 wyniki oblicze\u0144, a nie zosta\u0107 pomini\u0119ty");
import_node_assert.strict.equal(optimizedChecksum, legacyChecksum, "optymalizacja musi zachowa\u0107 dok\u0142adnie te same decyzje potrzeb kadry");
import_node_assert.strict.ok(
  optimizedElapsedMs < 1500,
  `ponowne u\u017Cycie profilu kadry jest zbyt wolne: ${optimizedElapsedMs.toFixed(1)} ms`
);
console.log(
  `AiLoanMarketPerformanceTests: OK (legacy ${legacyElapsedMs.toFixed(1)} ms, optimized ${optimizedElapsedMs.toFixed(1)} ms, checksum ${optimizedChecksum})`
);
