// tests/SaveArchiveTests.ts
var import_node_assert = require("node:assert");

// services/MatchHistoryService.ts
var matchHistory = [];
var matchIndex = /* @__PURE__ */ new Map();
var indexKey = (season, matchId) => `${season}::${matchId}`;
var toArchivedSummary = (entry) => ({
  matchId: entry.matchId,
  date: entry.date,
  season: entry.season,
  archived: true,
  competition: entry.competition,
  homeTeamId: entry.homeTeamId,
  awayTeamId: entry.awayTeamId,
  homeScore: entry.homeScore,
  awayScore: entry.awayScore,
  homePenaltyScore: entry.homePenaltyScore,
  awayPenaltyScore: entry.awayPenaltyScore,
  isExtraTime: entry.isExtraTime,
  attendance: entry.attendance,
  venue: entry.venue,
  goals: [],
  cards: []
});
var MatchHistoryService = {
  // Funkcja dodająca nowy wpis
  logMatch: (entry) => {
    const duplicateIndex = matchIndex.get(indexKey(entry.season, entry.matchId));
    if (duplicateIndex !== void 0) {
      matchHistory = matchHistory.map(
        (existing, index) => index === duplicateIndex ? entry : existing
      );
      console.log(`[MatchHistory] Zaktualizowano mecz: ${entry.homeTeamId} vs ${entry.awayTeamId}`);
      return;
    }
    matchHistory.push(entry);
    matchIndex.set(indexKey(entry.season, entry.matchId), matchHistory.length - 1);
    console.log(`[MatchHistory] Zapisano mecz: ${entry.homeTeamId} vs ${entry.awayTeamId}`);
  },
  updateMatch: (matchId, updates) => {
    matchHistory = matchHistory.map(
      (entry) => entry.matchId === matchId ? { ...entry, ...updates } : entry
    );
  },
  // Funkcja pobierająca całą historię
  getAll: () => [...matchHistory],
  // Funkcja pobierająca mecze konkretnej drużyny
  getTeamHistory: (teamId) => {
    return matchHistory.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
  },
  archiveBeforeSeason: (firstDetailedSeason) => {
    let archivedCount = 0;
    matchHistory = matchHistory.map((entry) => {
      if (entry.season >= firstDetailedSeason || entry.archived) return entry;
      archivedCount += 1;
      return toArchivedSummary(entry);
    });
    return archivedCount;
  },
  // PERF/ROZMIAR ZAPISU (dodane 2026-08-01): zwraca historię meczów przeznaczoną
  // do ZAPISU DO PLIKU — mecze starsze niż `detailSeasons` pełnych sezonów wstecz
  // dostają wersję "podglądową" (bez goals[]/cards[]), dokładnie tym samym
  // przekształceniem (toArchivedSummary) co archiveBeforeSeason powyżej — zero
  // nowej logiki, tylko reużycie istniejącej funkcji.
  //
  // KLUCZOWA RÓŻNICA względem archiveBeforeSeason: ta funkcja NIE mutuje żywej
  // tablicy `matchHistory` w pamięci (buduje nową tablicę przez .map(), nie
  // przypisuje do `matchHistory`). Rozgrywka w bieżącej sesji (widok "Historia
  // meczów", statystyki na żywo) nadal widzi pełne szczegóły niezależnie od wieku
  // meczu — przycięcie dotyczy WYŁĄCZNIE tego, co trafia do pliku zapisu. Dopiero
  // wczytanie takiego zapisu pokaże stare mecze bez szczegółów (bo to fizycznie
  // jedyne dane, jakie w nim wtedy będą).
  getAllForSave: (currentSeasonNumber, detailSeasons = 2) => {
    const firstDetailedSeason = currentSeasonNumber - (detailSeasons - 1);
    return matchHistory.map((entry) => {
      if (entry.season >= firstDetailedSeason || entry.archived) return entry;
      return toArchivedSummary(entry);
    });
  },
  // Funkcja czyszcząca (np. przy nowej grze)
  clear: () => {
    matchHistory = [];
    matchIndex.clear();
  }
};

// services/SaveArchiveService.ts
var ARCHIVE_INTERVAL_SEASONS = 5;
var getValidDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
var SaveArchiveService = {
  shouldArchiveAfterSeason(completedSeasonNumber) {
    return completedSeasonNumber > 0 && completedSeasonNumber % ARCHIVE_INTERVAL_SEASONS === 0;
  },
  archiveMessagesBefore(messages, cutoff) {
    return messages.filter((mail) => {
      const metadataType = mail.metadata?.type;
      if (metadataType === "SEASON_SUMMARY") return true;
      const mailDate = getValidDate(mail.date);
      return !mailDate || mailDate >= cutoff;
    });
  },
  archiveReserveResultsBefore(results, firstDetailedSeason) {
    return results.filter((result) => result.season >= firstDetailedSeason);
  },
  archiveAiFriendlyPairsBefore(pairs, cutoff) {
    return pairs.filter((pair) => {
      const date = getValidDate(pair.date);
      return !date || date >= cutoff;
    });
  },
  archiveAiFriendlyReportsBefore(reports, cutoff) {
    return reports.filter((report) => {
      const date = getValidDate(report.date);
      return !date || date >= cutoff;
    });
  }
};

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
  const history2 = player.stats?.ratingHistory?.slice(-sampleSize) ?? [];
  if (history2.length === 0) return null;
  return history2.reduce((sum, rating) => sum + rating, 0) / history2.length;
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

// services/ManagerExperienceService.ts
var MIN_EXP_POINTS = 1;
function dateKey(date) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return parsed.toISOString().split("T")[0];
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
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
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
  const adaptation2 = value;
  const clubId = typeof adaptation2.clubId === "string" ? adaptation2.clubId : "";
  const startedAt = asDateOnlyString(adaptation2.startedAt);
  const lastUpdatedAt = asDateOnlyString(adaptation2.lastUpdatedAt, startedAt);
  const durationDays = typeof adaptation2.durationDays === "number" ? adaptation2.durationDays : Number.NaN;
  const initialLevel = typeof adaptation2.initialLevel === "number" ? adaptation2.initialLevel : Number.NaN;
  const level = typeof adaptation2.level === "number" ? adaptation2.level : Number.NaN;
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
function normalizeNationsLeagueState(state) {
  if (!state || typeof state !== "object") return null;
  return {
    ...state,
    groups: asArray(state.groups).map((group) => ({
      ...group,
      teams: asArray(group?.teams),
      standings: asArray(group?.standings)
    })),
    fixtures: asArray(state.fixtures),
    playoffs: asArray(state.playoffs),
    quarterFinalists: asArray(state.quarterFinalists),
    semiFinalists: asArray(state.semiFinalists),
    finals: state.finals ? {
      ...state.finals,
      semiFinalists: asArray(state.finals.semiFinalists),
      finalists: asArray(state.finals.finalists),
      thirdPlaceTeams: asArray(state.finals.thirdPlaceTeams)
    } : null,
    completed: state.completed ?? false
  };
}
function normalizeEuroQualifiersState(state) {
  if (!state || typeof state !== "object") return null;
  return {
    ...state,
    groups: asArray(state.groups).map((group) => ({
      ...group,
      teams: asArray(group?.teams),
      hostTeams: asArray(group?.hostTeams),
      standings: asArray(group?.standings)
    })),
    fixtures: asArray(state.fixtures),
    playoffPaths: asArray(state.playoffPaths).map((path) => ({
      ...path,
      teams: asArray(path?.teams),
      semiFinalFixtureIds: asArray(path?.semiFinalFixtureIds),
      tieFixtureIds: path?.tieFixtureIds ? asArray(path.tieFixtureIds) : void 0
    })),
    hostTeams: asArray(state.hostTeams),
    qualifiedTeams: asArray(state.qualifiedTeams),
    directQualifiers: asArray(state.directQualifiers),
    hostReservedQualifiers: asArray(state.hostReservedQualifiers),
    playoffTeams: asArray(state.playoffTeams),
    drawCompleted: state.drawCompleted ?? false,
    completed: state.completed ?? false
  };
}
function normalizeTournamentState(state) {
  if (!state || typeof state !== "object") return null;
  return {
    ...state,
    teams: asArray(state.teams),
    groups: asArray(state.groups).map((group) => ({
      ...group,
      teams: asArray(group?.teams),
      matches: asArray(group?.matches)
    })),
    knockoutMatches: asArray(state.knockoutMatches),
    playerEffects: asArray(state.playerEffects),
    groupStageComplete: state.groupStageComplete ?? false,
    knockoutComplete: state.knockoutComplete ?? false
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
  const dateOnly = currentDate.toISOString().split("T")[0];
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
      discoveredDate: dateOnly,
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
    startedDate: asDateOnlyString(mission.startedDate, dateOnly)
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
function normalizeMatchHistory(matchHistory2) {
  return asArray(matchHistory2).map((match2) => ({
    ...match2,
    date: asDateString(match2?.date),
    goals: asArray(match2?.goals),
    cards: asArray(match2?.cards)
  }));
}
function reconcileCupStatsFromHistory(players, matchHistory2) {
  const cupCompetitions = /* @__PURE__ */ new Set(["POLISH_CUP", "SUPER_CUP"]);
  const playerCupTotals = /* @__PURE__ */ new Map();
  const ensureTotals = (playerId) => {
    if (!playerCupTotals.has(playerId)) playerCupTotals.set(playerId, { goals: 0, assists: 0 });
    return playerCupTotals.get(playerId);
  };
  (matchHistory2 || []).forEach((match2) => {
    if (!cupCompetitions.has(String(match2?.competition || ""))) return;
    (match2.goals || []).forEach((goal) => {
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
function reconcileFriendlyStatsFromHistory(players, matchHistory2, seasonNumber) {
  const playerFriendlyTotals = /* @__PURE__ */ new Map();
  const ensureTotals = (playerId) => {
    if (!playerFriendlyTotals.has(playerId)) playerFriendlyTotals.set(playerId, emptyPlayerStats());
    return playerFriendlyTotals.get(playerId);
  };
  (matchHistory2 || []).forEach((match2) => {
    if (String(match2?.competition || "") !== "FRIENDLY") return;
    if (Number(match2?.season) !== seasonNumber) return;
    const homePlayedIds = /* @__PURE__ */ new Set([
      ...asArray(match2.homeLineup).filter(Boolean),
      ...asArray(match2.substitutions).filter((sub) => sub?.teamId === match2.homeTeamId).map((sub) => sub.playerInId).filter(Boolean)
    ]);
    const awayPlayedIds = /* @__PURE__ */ new Set([
      ...asArray(match2.awayLineup).filter(Boolean),
      ...asArray(match2.substitutions).filter((sub) => sub?.teamId === match2.awayTeamId).map((sub) => sub.playerInId).filter(Boolean)
    ]);
    const applyPlayed = (playerId) => {
      const totals = ensureTotals(playerId);
      totals.matchesPlayed += 1;
      totals.minutesPlayed += 90;
      const rating = match2.ratings?.[playerId];
      if (typeof rating === "number") totals.ratingHistory.push(rating);
    };
    homePlayedIds.forEach(applyPlayed);
    awayPlayedIds.forEach(applyPlayed);
    asArray(match2.goals).forEach((goal) => {
      if (goal?.isMiss) return;
      const scorerId = goal.playerId || goal.scorerId;
      if (scorerId) ensureTotals(scorerId).goals += 1;
      if (goal.assistantId) ensureTotals(goal.assistantId).assists += 1;
    });
    asArray(match2.cards).forEach((card) => {
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
function reconcileEuroRatingHistoryFromHistory(players, matchHistory2, seasonNumber) {
  const playerRatings = /* @__PURE__ */ new Map();
  (matchHistory2 || []).forEach((match2) => {
    if (!isEuropeanCupCompetition(match2?.competition)) return;
    if (Number(match2?.season) !== seasonNumber) return;
    const playedIds = /* @__PURE__ */ new Set([
      ...asArray(match2.homeLineup).filter(Boolean),
      ...asArray(match2.awayLineup).filter(Boolean),
      ...asArray(match2.substitutions).map((sub) => sub?.playerInId).filter(Boolean),
      ...asArray(match2.substitutions).map((sub) => sub?.playerOutId).filter(Boolean),
      ...Object.keys(asRecord(match2.ratings))
    ]);
    playedIds.forEach((playerId) => {
      const rating = match2.ratings?.[playerId];
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
    lastRecoveryDate: asDate(data.lastRecoveryDate),
    coaches: asRecord(data.coaches),
    staffMembers: asRecord(data.staffMembers),
    roundResults: asRecord(data.roundResults),
    managerProfile: ManagerExperienceService.ensureManagerExperience(data.managerProfile),
    managerJobOffers: asArray(data.managerJobOffers),
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
var PROTECTED_MORALE_HISTORY_REASONS = /* @__PURE__ */ new Set([
  "Matematycznie zapewnione mistrzostwo kraju",
  "Matematycznie zapewniony awans do wy\u017Cszej ligi"
]);
function createSaveReplacer(state) {
  const playerObjects = /* @__PURE__ */ new WeakSet();
  const mindsetObjects = /* @__PURE__ */ new WeakSet();
  Object.values(state.players ?? {}).forEach((squad) => {
    (squad ?? []).forEach((player) => {
      if (!player || typeof player !== "object") return;
      playerObjects.add(player);
      if (player.playerMindset && typeof player.playerMindset === "object") {
        mindsetObjects.add(player.playerMindset);
      }
    });
  });
  return function saveReplacer(key, value) {
    if (mindsetObjects.has(this) && key === "history") return void 0;
    if (playerObjects.has(this) && key === "moraleHistory") {
      if (!Array.isArray(value)) return void 0;
      const protectedEntries = value.filter(
        (entry) => entry && PROTECTED_MORALE_HISTORY_REASONS.has(entry.reason)
      );
      return protectedEntries.length > 0 ? protectedEntries : void 0;
    }
    return value;
  };
}
function serializeSaveState(state, savedAt = /* @__PURE__ */ new Date()) {
  const envelope = { ...state, version: SAVE_VERSION, savedAt: savedAt.toISOString() };
  return JSON.stringify(envelope, createSaveReplacer(state));
}
function getSaveFileName(savedAt = /* @__PURE__ */ new Date(), compressed = true) {
  const extension = compressed ? ".json.gz" : ".json";
  return `futbol_manager_${savedAt.toISOString().slice(0, 10)}${extension}`;
}

// tests/SaveArchiveTests.ts
import_node_assert.strict.equal(SaveArchiveService.shouldArchiveAfterSeason(4), false);
import_node_assert.strict.equal(SaveArchiveService.shouldArchiveAfterSeason(5), true);
import_node_assert.strict.equal(SaveArchiveService.shouldArchiveAfterSeason(6), false);
import_node_assert.strict.equal(SaveArchiveService.shouldArchiveAfterSeason(10), true);
var archiveCutoff = new Date(2030, 6, 1);
var baseMail = {
  sender: "Test",
  role: "Test",
  subject: "Test",
  body: "Test",
  isRead: true,
  type: "SYSTEM" /* SYSTEM */,
  priority: 1
};
var retainedMessages = SaveArchiveService.archiveMessagesBefore([
  { ...baseMail, id: "old-info", date: new Date(2025, 6, 1) },
  { ...baseMail, id: "recent-info", date: new Date(2030, 6, 1) },
  { ...baseMail, id: "old-summary", date: new Date(2025, 6, 1), metadata: { type: "SEASON_SUMMARY", championName: "A", promotions: [], relegations: [], leagueAwards: [] } },
  { ...baseMail, id: "old-action", date: new Date(2025, 6, 1), metadata: { type: "INCOMING_TRANSFER_OFFER", offerId: "offer" } }
], archiveCutoff);
import_node_assert.strict.deepEqual(retainedMessages.map((mail) => mail.id), ["recent-info", "old-summary"]);
var retainedReserveResults = SaveArchiveService.archiveReserveResultsBefore([
  { season: 5 },
  { season: 6 }
], 6);
import_node_assert.strict.deepEqual(retainedReserveResults.map((result) => result.season), [6]);
var retainedFriendlyPairs = SaveArchiveService.archiveAiFriendlyPairsBefore([
  { date: new Date(2029, 6, 1) },
  { date: new Date(2030, 6, 1) }
], archiveCutoff);
import_node_assert.strict.equal(retainedFriendlyPairs.length, 1);
var fullSave = {
  messages: [{ id: "old-message" }, { id: "new-message" }],
  reserveMatchResults: [{ season: 1 }, { season: 6 }],
  matchHistory: [{ matchId: "old-detailed-match", timeline: [{ minute: 1 }] }],
  aiFriendlyPairs: [{ id: "old-friendly" }],
  aiFriendlyReports: [{ id: "old-friendly-report" }]
};
var serializedFullSave = JSON.parse(serializeSaveState(fullSave, /* @__PURE__ */ new Date("2030-07-01T00:00:00.000Z")));
import_node_assert.strict.equal(serializedFullSave.messages.length, 2);
import_node_assert.strict.equal(serializedFullSave.reserveMatchResults.length, 2);
import_node_assert.strict.equal(serializedFullSave.matchHistory[0].timeline.length, 1);
import_node_assert.strict.equal(serializedFullSave.aiFriendlyPairs.length, 1);
import_node_assert.strict.equal(serializedFullSave.aiFriendlyReports.length, 1);
import_node_assert.strict.equal(getSaveFileName(/* @__PURE__ */ new Date("2030-07-01T00:00:00.000Z")), "futbol_manager_2030-07-01.json.gz");
import_node_assert.strict.equal(getSaveFileName(/* @__PURE__ */ new Date("2030-07-01T00:00:00.000Z"), false), "futbol_manager_2030-07-01.json");
var largeMoraleHistory = Array.from({ length: 40 }, (_, index) => ({
  id: `morale-${index}`,
  date: `2030-07-${String(index % 28 + 1).padStart(2, "0")}`,
  delta: index % 2 === 0 ? 1 : -1,
  reason: `Zmiana diagnostyczna ${index}`,
  moraleAfter: 50
}));
largeMoraleHistory.push({
  id: "championship-guard",
  date: "2030-07-01",
  delta: 10,
  reason: "Matematycznie zapewnione mistrzostwo kraju",
  moraleAfter: 90
});
var compactPlayerState = {
  version: "3.1",
  savedAt: "2030-07-10T12:00:00.000Z",
  userTeamId: "CLUB_A",
  players: {
    CLUB_A: [{
      id: "player-a",
      clubId: "CLUB_A",
      morale: 77,
      moraleHistory: largeMoraleHistory,
      playerMindset: {
        coachTrust: 70,
        clubHappiness: 71,
        squadBelonging: 72,
        roleClarity: 73,
        playingTimeSatisfaction: 74,
        developmentSatisfaction: 75,
        transferOpenness: 20,
        conflictLevel: 10,
        history: Array.from({ length: 30 }, (_, index) => ({
          id: `mindset-${index}`,
          date: "2030-07-01",
          reason: `Mindset ${index}`,
          deltas: { coachTrust: 1 }
        }))
      }
    }]
  }
};
var rawCompactPlayerBytes = Buffer.byteLength(JSON.stringify(compactPlayerState));
var compactPlayerJson = serializeSaveState(compactPlayerState);
var parsedCompactPlayerState = JSON.parse(compactPlayerJson);
var savedPlayer = parsedCompactPlayerState.players.CLUB_A[0];
import_node_assert.strict.equal(parsedCompactPlayerState.version, "4.0");
import_node_assert.strict.equal(savedPlayer.morale, 77);
import_node_assert.strict.equal(savedPlayer.playerMindset.coachTrust, 70);
import_node_assert.strict.equal(savedPlayer.playerMindset.history, void 0);
import_node_assert.strict.deepEqual(savedPlayer.moraleHistory.map((entry) => entry.id), ["championship-guard"]);
import_node_assert.strict.ok(Buffer.byteLength(compactPlayerJson) < rawCompactPlayerBytes * 0.25);
var adaptation = {
  clubId: "CLUB_A",
  startedAt: "2030-07-01",
  lastUpdatedAt: "2030-07-10",
  durationDays: 90,
  initialLevel: 25,
  level: 41.5
};
var adaptationSave = {
  version: "3.0",
  savedAt: "2030-07-10T12:00:00.000Z",
  currentDate: "2030-07-10T12:00:00.000Z",
  clubs: [],
  players: {
    CLUB_A: [{ id: "adapted-player", clubId: "CLUB_A", position: "MID", clubAdaptation: adaptation }],
    CLUB_B: [{ id: "legacy-player", clubId: "CLUB_B", position: "DEF" }]
  },
  userTeamId: "CLUB_A"
};
var importedAdaptationSave = normalizeSaveState(JSON.parse(serializeSaveState(adaptationSave)));
import_node_assert.strict.deepEqual(importedAdaptationSave.players.CLUB_A[0].clubAdaptation, adaptation);
import_node_assert.strict.equal(importedAdaptationSave.players.CLUB_B[0].clubAdaptation, void 0);
var invalidAdaptationSave = {
  ...adaptationSave,
  players: {
    CLUB_A: [{
      id: "invalid-adaptation-player",
      clubId: "CLUB_A",
      position: "MID",
      clubAdaptation: { ...adaptation, clubId: "WRONG_CLUB", level: Number.NaN }
    }]
  }
};
var importedInvalidAdaptationSave = normalizeSaveState(invalidAdaptationSave);
import_node_assert.strict.equal(importedInvalidAdaptationSave.players.CLUB_A[0].clubAdaptation, null);
var match = (season) => ({
  matchId: `match-${season}`,
  date: `${2024 + season}-08-01`,
  season,
  competition: "L_PL_1",
  homeTeamId: "home",
  awayTeamId: "away",
  homeScore: 2,
  awayScore: 1,
  goals: [{ playerId: "p1", playerName: "Gracz", minute: 10, teamId: "home", isPenalty: false }],
  cards: [],
  timeline: [{ minute: 10, teamSide: "HOME", type: "GOAL", text: "Gol" }],
  ratings: { p1: 8.2 }
});
MatchHistoryService.clear();
MatchHistoryService.logMatch(match(1));
MatchHistoryService.logMatch(match(5));
MatchHistoryService.logMatch(match(6));
import_node_assert.strict.equal(MatchHistoryService.archiveBeforeSeason(6), 2);
var history = MatchHistoryService.getAll();
import_node_assert.strict.equal(history[0].archived, true);
import_node_assert.strict.equal(history[0].timeline, void 0);
import_node_assert.strict.deepEqual(history[0].goals, []);
import_node_assert.strict.equal(history[1].archived, true);
import_node_assert.strict.equal(history[2].archived, void 0);
import_node_assert.strict.equal(history[2].timeline?.length, 1);
import_node_assert.strict.ok(JSON.stringify(history[0]).length < JSON.stringify(match(1)).length);
console.log("SaveArchiveTests: OK");
