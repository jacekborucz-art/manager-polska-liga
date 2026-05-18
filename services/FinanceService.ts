import { Club, Player, PlayerPosition } from '../types';

// ============================================================
// PARAMETRY KOSZTÓW DNIA MECZOWEGO  —  pogrupowane wg. ligi
// ============================================================
// Tier 1 = Ekstraklasa, Tier 2 = 1. Liga, Tier 3 = 2. Liga, Tier 4 = Regionalna
//
// Koszty rosną progresywnie w zależności od:
//   • ligi (tier)
//   • reputacji klubu (representuje wielkość klubu i infrastrukturę)
//   • frekwencji (attendance) — osób na trybunach
//   • współczynnika obciążenia stadionu (fill-rate multiplier)
//
// PRZYKŁADY (home):
//   Legia/Lech (rep=10, tier=1, att~22k)   ≈ 350–400 tys. zł  (max ~700 tys.)
//   Średniak Ekstraklasy (rep=6, att~7k)   ≈ 200–250 tys. zł
//   1. Liga Średni klub (rep=5, att~5k)     ≈ 55–80 tys. zł
//   2. Liga klub (rep=4, att~2k)            ≈ 14–20 tys. zł
// ============================================================
// ============================================================
// PARAMETRY PRZYCHODÓW DODATKOWYCH DNIA MECZOWEGO
// ============================================================
// Przychody per kibic (PLN/fan) przy meczu domowym.
// Tier 1 = Ekstraklasa, Tier 2 = 1. Liga, Tier 3 = 2. Liga, Tier 4 = Regionalna
//
// Mnożnik reputacji:  repMultiplier = 0.8 + (rep / 10) * 0.4
// Losowość:           random factor  0.80–1.20 (osobny dla każdej kategorii)
//
// PRZYKŁADY (przy attendance ~22k, rep=9, tier=1 — Legia/Lech):
//   Catering+Hospitality: ~85–130 tys. zł
//   Merchandising:        ~35–55  tys. zł
//   Programy + LED:       ~10–18  tys. zł
//   Parkingi + fanzony:   ~12–20  tys. zł
//
// PRZYKŁADY (attendance ~7k, rep=5, tier=1 — średniak Ekstraklasy):
//   Catering+Hospitality: ~22–40  tys. zł
//   Merchandising:        ~10–17  tys. zł
//   Programy + LED:       ~3–5    tys. zł
//   Parkingi + fanzony:   ~3–5    tys. zł
// ============================================================
export const MATCHDAY_ADDITIONAL_REVENUE_PARAMS = {
  //                             tier: [  0,    1,    2,    3,    4 ]
  cateringPerFan:                      [  0,  4.5,  2.0,  0.8,  0.5],
  merchandisingPerFan:                 [  0,  2.0,  0.8, 0.22, 0.15],
  programsPerFan:                      [  0,  0.6,  0.3, 0.15, 0.07],
  parkingPerFan:                       [  0,  0.7,  0.4, 0.16,  0.1],
} as const;

// ============================================================
// PARAMETRY ROCZNYCH PRZYCHODÓW VIP / LOŻE
// ============================================================
// Wynajem lóż (Skybox) – płatne raz na sezon (start sezonu).
// Dostęp: tylko kluby grające w Ekstraklasie (tier 1)
//         ORAZ stadiumCapacity > 15 000 miejsc.
//
// Zakres: 240 000 – 450 000 PLN/rok (zależnie od rep i rozmiaru stadionu)
// ============================================================
export const VIP_BOX_REVENUE_PARAMS = {
  base:            150_000,
  repScale:        200_000,   // * (rep / 10)
  capacityScale:    60_000,   // * (capacity / 40 000)
  minRevenue:      240_000,
  maxRevenue:      500_000,
} as const;

export const MATCHDAY_COST_PARAMS = {
  home: {
    //                       tier: [  0,       1,       2,      3,     4  ]
    baseCost:                     [  0,  50_000,  15_000,  5_000, 1_500],
    perFanCost:                   [  0,       9,     4.5,    2.0,   0.8],  // PLN za kibica
    repScale:                     [  0,  12_000,   4_000,  1_200,   400],  // PLN * reputacja
    minFloor:                     [  0, 200_000,  40_000, 10_000, 3_500],  // minim. koszt meczu u siebie
    maxCap:                       [  0, 700_000, 220_000, 70_000,20_000],  // maks. koszt meczu u siebie
  },
  away: {
    baseCost:                     [  0,  35_000,  12_000,  5_000, 1_500],  // koszty bazy wyjazdu
    repScale:                     [  0,   3_500,   1_500,    600,   150],  // wkład reputacji w koszty
    maxCap:                       [  0, 140_000,  55_000, 20_000, 7_000],  // maks. koszt wyjazdu
  },
} as const;

// Latest public benchmarks used for European club start budgets:
// - Deloitte Football Money League 2026 (2024/25 season revenue)
// - FC Barcelona 2024/25 approved operating budget
// - NBP table 059/A/NBP/2026 exchange rates
const EUR_TO_PLN_NBP_2026 = 4.2710;

const eurMillionsToPln = (amount: number): number =>
  Math.round(amount * EUR_TO_PLN_NBP_2026 * 1_000_000);

const EUROPEAN_TIER_BASE_REVENUE_EUR_M: Record<number, number> = {
  1: 190,
  2: 90,
  3: 50,
  4: 8,
};

const EUROPEAN_COUNTRY_FINANCE_FACTOR: Record<string, number> = {
  ENG: 2.40,
  ESP: 1.70,
  GER: 1.80,
  ITA: 1.45,
  FRA: 1.15,
  POR: 1.00,
  NED: 0.95,
  BEL: 0.75,
  SCO: 0.70,
  TUR: 0.80,
  AUT: 0.55,
  SUI: 0.60,
  CZE: 0.45,
  DEN: 0.45,
  GRE: 0.45,
  NOR: 0.35,
  CRO: 0.30,
  SRB: 0.30,
  UKR: 0.30,
  RUS: 0.45,
  SWE: 0.30,
  ISR: 0.28,
  CYP: 0.25,
  HUN: 0.20,
  AZE: 0.20,
  KAZ: 0.20,
  SVK: 0.18,
  SVN: 0.18,
  BUL: 0.18,
  BIH: 0.14,
  MNE: 0.12,
  MKD: 0.10,
  ALB: 0.10,
  ARM: 0.09,
  GEO: 0.09,
  BLR: 0.09,
  KOS: 0.09,
  MDA: 0.08,
  FIN: 0.14,
  LTU: 0.08,
  LAT: 0.08,
  EST: 0.08,
  IRL: 0.10,
  NIR: 0.08,
  WAL: 0.06,
  ISL: 0.08,
  FRO: 0.06,
  AND: 0.04,
  GIB: 0.05,
  LIE: 0.04,
  SMR: 0.04,
  MLT: 0.06,
  LUX: 0.07,
};

const EUROPEAN_CLUB_REVENUE_OVERRIDE_PLN: Record<string, number> = {
  'Real Madryt': eurMillionsToPln(1161.0),
  'FC Barcelona': eurMillionsToPln(893.0),
  'Bayern Monachium': eurMillionsToPln(860.6),
  'Paris Saint-Germain': eurMillionsToPln(837.0),
  'Liverpool FC': eurMillionsToPln(836.1),
  'Manchester City': eurMillionsToPln(829.3),
  'Arsenal Londyn': eurMillionsToPln(821.7),
  'Manchester United': eurMillionsToPln(793.1),
  'Tottenham Hotspur': eurMillionsToPln(672.6),
  'Chelsea Londyn': eurMillionsToPln(584.1),
  'Borussia Dortmund': eurMillionsToPln(531.3),
  'Inter Mediolan': eurMillionsToPln(537.5),
  'Atlético Madryt': eurMillionsToPln(454.5),
  'Milan AC': eurMillionsToPln(410.4),
  'Juventus Turyn': eurMillionsToPln(401.7),
  'Newcastle United': eurMillionsToPln(398.4),
  'Benfica Lizbona': eurMillionsToPln(283.4),
};

const EUROPEAN_COMMERCIAL_LEAGUES = new Set(['L_CL', 'L_EL', 'L_CONF']);

const isEuropeanCommercialClub = (club: Pick<Club, 'leagueId'>): boolean =>
  EUROPEAN_COMMERCIAL_LEAGUES.has(club.leagueId);

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const POLISH_MARKET_CAP_BY_TIER: Record<number, number> = {
  1: 21_000_000,
  2: 6_500_000,
  3: 1_800_000,
  4: 350_000,
  5: 175_000,
};

const getPolishAgeMarketCap = (player: Player, tier: number): number => {
  const tierScale = ({
    1: 1.00,
    2: 0.34,
    3: 0.11,
    4: 0.035,
    5: 0.018,
  } as Record<number, number>)[tier] ?? 0.018;

  let ekstraklasaCap = 0;

  switch (player.position) {
    case PlayerPosition.GK:
      if (player.age <= 23) ekstraklasaCap = 8_000_000;
      else if (player.age <= 29) ekstraklasaCap = 11_000_000;
      else if (player.age <= 32) ekstraklasaCap = 6_500_000;
      else if (player.age <= 34) ekstraklasaCap = 3_800_000;
      else ekstraklasaCap = 2_200_000;
      break;
    case PlayerPosition.DEF:
      if (player.age <= 21) ekstraklasaCap = 10_000_000;
      else if (player.age <= 24) ekstraklasaCap = 13_000_000;
      else if (player.age <= 29) ekstraklasaCap = 11_000_000;
      else if (player.age <= 32) ekstraklasaCap = 6_500_000;
      else if (player.age <= 34) ekstraklasaCap = 3_800_000;
      else ekstraklasaCap = 2_200_000;
      break;
    default:
      if (player.age <= 21) ekstraklasaCap = 16_000_000;
      else if (player.age <= 24) ekstraklasaCap = 18_000_000;
      else if (player.age <= 29) ekstraklasaCap = 14_000_000;
      else if (player.age <= 32) ekstraklasaCap = 5_500_000;
      else if (player.age <= 34) ekstraklasaCap = 2_800_000;
      else ekstraklasaCap = 1_700_000;
      break;
  }

  return ekstraklasaCap * tierScale;
};

const getRecentAverageRating = (player: Player, sampleSize: number = 10): number | null => {
  const history = player.stats?.ratingHistory?.slice(-sampleSize) ?? [];
  if (history.length === 0) return null;
  return history.reduce((sum, rating) => sum + rating, 0) / history.length;
};

const getCareerMatches = (player: Player): number => {
  const currentMatches = player.stats?.matchesPlayed || 0;
  const historicalMatches = (player.history || []).reduce(
    (sum, entry) => sum + (entry.statsSnapshot?.matchesPlayed || 0),
    0
  );
  return currentMatches + historicalMatches;
};

const getPolishBaseMarketValue = (ovr: number): number => {
  if (ovr >= 82) return 12_500_000 + (ovr - 82) * 1_400_000;
  if (ovr >= 78) return 8_800_000 + (ovr - 78) * 900_000;
  if (ovr >= 74) return 5_800_000 + (ovr - 74) * 750_000;
  if (ovr >= 70) return 3_400_000 + (ovr - 70) * 600_000;
  if (ovr >= 65) return 1_700_000 + (ovr - 65) * 340_000;
  if (ovr >= 60) return 650_000 + (ovr - 60) * 210_000;
  return 100_000 + Math.max(0, ovr - 40) * 27_500;
};

const getPolishAgeFactor = (player: Player): number => {
  switch (player.position) {
    case PlayerPosition.DEF:
      if (player.age <= 20) return 0.94;
      if (player.age <= 23) return 1.00;
      if (player.age <= 27) return 1.08;
      if (player.age <= 30) return 1.02;
      if (player.age === 31) return 0.92;
      if (player.age === 32) return 0.80;
      if (player.age === 33) return 0.68;
      if (player.age === 34) return 0.56;
      if (player.age === 35) return 0.46;
      if (player.age === 36) return 0.36;
      return 0.28;
    case PlayerPosition.GK:
      if (player.age <= 21) return 0.96;
      if (player.age <= 25) return 1.00;
      if (player.age <= 30) return 1.06;
      if (player.age <= 32) return 1.02;
      if (player.age === 33) return 0.94;
      if (player.age === 34) return 0.84;
      if (player.age === 35) return 0.74;
      if (player.age === 36) return 0.62;
      if (player.age === 37) return 0.50;
      return 0.40;
    default:
      if (player.age <= 19) return 1.16;
      if (player.age <= 21) return 1.12;
      if (player.age <= 24) return 1.08;
      if (player.age <= 28) return 1.00;
      if (player.age === 29) return 0.94;
      if (player.age === 30) return 0.86;
      if (player.age === 31) return 0.74;
      if (player.age === 32) return 0.60;
      if (player.age === 33) return 0.48;
      if (player.age === 34) return 0.36;
      if (player.age === 35) return 0.27;
      if (player.age === 36) return 0.20;
      return 0.15;
  }
};

const getPolishExperienceFactor = (player: Player): number => {
  const careerMatches = getCareerMatches(player);

  switch (player.position) {
    case PlayerPosition.DEF:
      return 0.94 + clamp(careerMatches / 260, 0, 1) * 0.20;
    case PlayerPosition.GK:
      return 0.92 + clamp(careerMatches / 240, 0, 1) * 0.24;
    default:
      return 0.94 + clamp(careerMatches / 260, 0, 1) * 0.08;
  }
};

const getPolishVeteranUsageFactor = (player: Player): number => {
  const minutesPlayed = Math.max(0, player.stats?.minutesPlayed || 0);

  if (player.age <= 32) return 1;

  switch (player.position) {
    case PlayerPosition.GK:
    case PlayerPosition.DEF:
      if (minutesPlayed >= 1800) return 1;
      if (minutesPlayed >= 900) return 0.90;
      if (minutesPlayed >= 450) return 0.78;
      return 0.64;
    default:
      if (minutesPlayed >= 1800) return 1;
      if (minutesPlayed >= 900) return 0.86;
      if (minutesPlayed >= 450) return 0.72;
      return 0.55;
  }
};

const getPolishPerformanceFactor = (player: Player): number => {
  const minutesPlayed = Math.max(0, player.stats?.minutesPlayed || 0);
  const matchesPlayed = Math.max(0, player.stats?.matchesPlayed || 0);
  const goals = Math.max(0, player.stats?.goals || 0);
  const assists = Math.max(0, player.stats?.assists || 0);
  const averageRating = getRecentAverageRating(player);
  const fullMatches = Math.max(1, minutesPlayed / 90);
  const sampleFactor = clamp(minutesPlayed / 900, 0, 1);
  const ratingDelta = averageRating === null ? 0 : averageRating - 6.7;

  switch (player.position) {
    case PlayerPosition.FWD: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const goalsBoost =
        clamp(goals / 20, 0, 1) * 0.20 +
        clamp(goalsPer90 / 0.75, 0, 1) * 0.18;
      const assistsBoost =
        clamp(assists / 10, 0, 1) * 0.07 +
        clamp(assistsPer90 / 0.35, 0, 1) * 0.05;
      const ratingBoost = clamp(ratingDelta * 0.10, -0.08, 0.10);
      return 1 + clamp(sampleFactor * (goalsBoost + assistsBoost + ratingBoost), -0.10, 0.52);
    }
    case PlayerPosition.MID: {
      const goalsPer90 = goals / fullMatches;
      const assistsPer90 = assists / fullMatches;
      const assistsBoost =
        clamp(assists / 14, 0, 1) * 0.18 +
        clamp(assistsPer90 / 0.45, 0, 1) * 0.15;
      const goalsBoost =
        clamp(goals / 12, 0, 1) * 0.08 +
        clamp(goalsPer90 / 0.35, 0, 1) * 0.06;
      const ratingBoost = clamp(ratingDelta * 0.11, -0.08, 0.12);
      return 1 + clamp(sampleFactor * (assistsBoost + goalsBoost + ratingBoost), -0.10, 0.46);
    }
    case PlayerPosition.DEF: {
      const matchFactor = clamp(matchesPlayed / 30, 0, 1) * 0.10;
      const experienceBoost = clamp(getCareerMatches(player) / 260, 0, 1) * 0.12;
      const ratingBoost = averageRating === null
        ? 0
        : clamp((averageRating - 6.6) * 0.18, -0.10, 0.22) * clamp(matchesPlayed / 10, 0, 1);
      return 1 + clamp(matchFactor + experienceBoost + ratingBoost, -0.10, 0.42);
    }
    case PlayerPosition.GK: {
      const matchFactor = clamp(matchesPlayed / 30, 0, 1) * 0.10;
      const experienceBoost = clamp(getCareerMatches(player) / 240, 0, 1) * 0.14;
      const ratingBoost = averageRating === null
        ? 0
        : clamp((averageRating - 6.6) * 0.22, -0.10, 0.24) * clamp(matchesPlayed / 8, 0, 1);
      return 1 + clamp(matchFactor + experienceBoost + ratingBoost, -0.12, 0.46);
    }
    default:
      return 1;
  }
};

const calculatePolishMarketValue = (player: Player, reputation: number, tier: number): number => {
  const baseValue = getPolishBaseMarketValue(player.overallRating);
  const tierMultiplier = ({
    1: 1.00,
    2: 0.38,
    3: 0.14,
    4: 0.05,
    5: 0.025,
  } as Record<number, number>)[tier] ?? 0.05;
  const reputationFactor = 0.88 + clamp(reputation, 1, 10) * 0.025;
  const ageFactor = getPolishAgeFactor(player);
  const experienceFactor = getPolishExperienceFactor(player);
  const performanceFactor = getPolishPerformanceFactor(player);
  const veteranUsageFactor = getPolishVeteranUsageFactor(player);
  const randomFactor = 0.985 + (Math.random() * 0.03);
  const tierCap = Math.min(
    POLISH_MARKET_CAP_BY_TIER[tier] ?? 175_000,
    getPolishAgeMarketCap(player, tier)
  );

  const rawValue =
    baseValue *
    tierMultiplier *
    reputationFactor *
    ageFactor *
    experienceFactor *
    performanceFactor *
    veteranUsageFactor *
    randomFactor;
  const cappedValue = Math.min(rawValue, tierCap);
  const step = cappedValue >= 10_000_000 ? 250_000 : cappedValue >= 1_000_000 ? 100_000 : cappedValue >= 100_000 ? 25_000 : 10_000;
  return Math.round(cappedValue / step) * step;
};

const getEuropeanCommercialIndex = (club: Pick<Club, 'leagueId' | 'country' | 'reputation' | 'stadiumCapacity'>): number => {
  const countryFactorRaw = EUROPEAN_COUNTRY_FINANCE_FACTOR[club.country || ''] ?? 0.10;
  const countryFactor = 0.40 + Math.sqrt(Math.max(0.01, countryFactorRaw));
  const reputationFactor = 0.70 + Math.pow(Math.max(1, Math.min(20, club.reputation)) / 20, 1.2) * 0.90;
  const stadiumFactor = 0.78 + Math.pow(Math.max(2_000, Math.min(100_000, club.stadiumCapacity)) / 100_000, 0.8) * 0.42;
  const competitionFactor = club.leagueId === 'L_CL' ? 1.12 : club.leagueId === 'L_EL' ? 1.00 : 0.92;

  return clamp((countryFactor * reputationFactor * stadiumFactor * competitionFactor) / 1.45, 0.45, 2.60);
};

type InternationalMarketProfile = {
  marketFactor: number;
  tierCaps: Record<number, number>;
};

const INTERNATIONAL_DEFAULT_TIER_CAPS: Record<number, number> = {
  1: 90_000_000,
  2: 22_000_000,
  3: 6_000_000,
  4: 1_500_000,
  5: 500_000,
};

const INTERNATIONAL_MARKET_PROFILE_BY_COUNTRY: Record<string, InternationalMarketProfile> = {
  ENG: {
    marketFactor: 1.28,
    tierCaps: { 1: 220_000_000, 2: 70_000_000, 3: 18_000_000, 4: 4_000_000, 5: 1_200_000 },
  },
  ESP: {
    marketFactor: 1.18,
    tierCaps: { 1: 200_000_000, 2: 45_000_000, 3: 12_000_000, 4: 3_000_000, 5: 1_000_000 },
  },
  GER: {
    marketFactor: 1.08,
    tierCaps: { 1: 150_000_000, 2: 40_000_000, 3: 10_000_000, 4: 2_500_000, 5: 800_000 },
  },
  ITA: {
    marketFactor: 1.00,
    tierCaps: { 1: 110_000_000, 2: 28_000_000, 3: 8_000_000, 4: 2_000_000, 5: 700_000 },
  },
  FRA: {
    marketFactor: 0.97,
    tierCaps: { 1: 120_000_000, 2: 24_000_000, 3: 7_000_000, 4: 1_800_000, 5: 600_000 },
  },
  POR: {
    marketFactor: 0.78,
    tierCaps: { 1: 60_000_000, 2: 15_000_000, 3: 4_000_000, 4: 1_000_000, 5: 350_000 },
  },
  DEN: {
    marketFactor: 0.43,
    tierCaps: { 1: 22_000_000, 2: 10_000_000, 3: 3_500_000, 4: 1_000_000, 5: 325_000 },
  },
  NOR: {
    marketFactor: 0.30,
    tierCaps: { 1: 11_000_000, 2: 6_000_000, 3: 2_200_000, 4: 650_000, 5: 225_000 },
  },
  SWE: {
    marketFactor: 0.22,
    tierCaps: { 1: 6_500_000, 2: 3_500_000, 3: 1_300_000, 4: 400_000, 5: 150_000 },
  },
  FIN: {
    marketFactor: 0.07,
    tierCaps: { 1: 1_200_000, 2: 700_000, 3: 300_000, 4: 100_000, 5: 40_000 },
  },
  ISL: {
    marketFactor: 0.035,
    tierCaps: { 1: 600_000, 2: 350_000, 3: 150_000, 4: 50_000, 5: 20_000 },
  },
  GRE: {
    marketFactor: 0.52,
    tierCaps: { 1: 25_000_000, 2: 12_000_000, 3: 4_000_000, 4: 1_100_000, 5: 350_000 },
  },
  CRO: {
    marketFactor: 0.34,
    tierCaps: { 1: 15_000_000, 2: 8_000_000, 3: 3_000_000, 4: 850_000, 5: 275_000 },
  },
  SRB: {
    marketFactor: 0.32,
    tierCaps: { 1: 12_000_000, 2: 7_000_000, 3: 2_800_000, 4: 800_000, 5: 250_000 },
  },
  ROU: {
    marketFactor: 0.28,
    tierCaps: { 1: 10_000_000, 2: 6_000_000, 3: 2_400_000, 4: 700_000, 5: 225_000 },
  },
  BUL: {
    marketFactor: 0.22,
    tierCaps: { 1: 5_500_000, 2: 3_500_000, 3: 1_500_000, 4: 450_000, 5: 150_000 },
  },
  SVN: {
    marketFactor: 0.14,
    tierCaps: { 1: 2_800_000, 2: 1_800_000, 3: 800_000, 4: 250_000, 5: 90_000 },
  },
  BIH: {
    marketFactor: 0.11,
    tierCaps: { 1: 2_200_000, 2: 1_400_000, 3: 650_000, 4: 200_000, 5: 70_000 },
  },
  MNE: {
    marketFactor: 0.06,
    tierCaps: { 1: 1_000_000, 2: 650_000, 3: 300_000, 4: 100_000, 5: 40_000 },
  },
  MKD: {
    marketFactor: 0.07,
    tierCaps: { 1: 1_200_000, 2: 750_000, 3: 350_000, 4: 120_000, 5: 45_000 },
  },
  ALB: {
    marketFactor: 0.09,
    tierCaps: { 1: 1_600_000, 2: 1_000_000, 3: 450_000, 4: 150_000, 5: 55_000 },
  },
  BRA: {
    marketFactor: 0.72,
    tierCaps: { 1: 42_000_000, 2: 18_000_000, 3: 6_000_000, 4: 1_500_000, 5: 500_000 },
  },
  ARG: {
    marketFactor: 0.58,
    tierCaps: { 1: 28_000_000, 2: 12_000_000, 3: 4_000_000, 4: 1_100_000, 5: 350_000 },
  },
  URU: {
    marketFactor: 0.24,
    tierCaps: { 1: 8_000_000, 2: 5_000_000, 3: 1_800_000, 4: 500_000, 5: 175_000 },
  },
  COL: {
    marketFactor: 0.27,
    tierCaps: { 1: 9_000_000, 2: 5_500_000, 3: 1_800_000, 4: 500_000, 5: 175_000 },
  },
  ECU: {
    marketFactor: 0.30,
    tierCaps: { 1: 11_000_000, 2: 6_000_000, 3: 2_000_000, 4: 600_000, 5: 200_000 },
  },
  PAR: {
    marketFactor: 0.23,
    tierCaps: { 1: 7_000_000, 2: 4_000_000, 3: 1_400_000, 4: 400_000, 5: 150_000 },
  },
  CHI: {
    marketFactor: 0.26,
    tierCaps: { 1: 7_500_000, 2: 4_000_000, 3: 1_400_000, 4: 400_000, 5: 150_000 },
  },
  PER: {
    marketFactor: 0.18,
    tierCaps: { 1: 4_500_000, 2: 2_500_000, 3: 900_000, 4: 250_000, 5: 100_000 },
  },
  BOL: {
    marketFactor: 0.12,
    tierCaps: { 1: 2_500_000, 2: 1_500_000, 3: 500_000, 4: 150_000, 5: 60_000 },
  },
  KSA: {
    marketFactor: 1.20,
    tierCaps: { 1: 90_000_000, 2: 40_000_000, 3: 12_000_000, 4: 3_000_000, 5: 900_000 },
  },
  UAE: {
    marketFactor: 0.48,
    tierCaps: { 1: 18_000_000, 2: 12_000_000, 3: 4_000_000, 4: 1_100_000, 5: 350_000 },
  },
  QAT: {
    marketFactor: 0.64,
    tierCaps: { 1: 22_000_000, 2: 16_000_000, 3: 5_000_000, 4: 1_500_000, 5: 500_000 },
  },
  JPN: {
    marketFactor: 0.30,
    tierCaps: { 1: 10_000_000, 2: 6_000_000, 3: 2_000_000, 4: 600_000, 5: 200_000 },
  },
  KOR: {
    marketFactor: 0.22,
    tierCaps: { 1: 7_000_000, 2: 4_500_000, 3: 1_500_000, 4: 450_000, 5: 150_000 },
  },
  IRN: {
    marketFactor: 0.26,
    tierCaps: { 1: 8_000_000, 2: 5_000_000, 3: 1_800_000, 4: 500_000, 5: 175_000 },
  },
  CHN: {
    marketFactor: 0.28,
    tierCaps: { 1: 9_000_000, 2: 6_000_000, 3: 2_000_000, 4: 600_000, 5: 200_000 },
  },
  THA: {
    marketFactor: 0.17,
    tierCaps: { 1: 5_000_000, 2: 3_000_000, 3: 1_800_000, 4: 500_000, 5: 150_000 },
  },
  MAS: {
    marketFactor: 0.16,
    tierCaps: { 1: 4_500_000, 2: 2_800_000, 3: 1_600_000, 4: 450_000, 5: 150_000 },
  },
  AUS: {
    marketFactor: 0.20,
    tierCaps: { 1: 6_000_000, 2: 3_500_000, 3: 2_000_000, 4: 600_000, 5: 200_000 },
  },
  EGY: {
    marketFactor: 0.30,
    tierCaps: { 1: 10_000_000, 2: 6_000_000, 3: 2_000_000, 4: 600_000, 5: 200_000 },
  },
  RSA: {
    marketFactor: 0.21,
    tierCaps: { 1: 7_000_000, 2: 4_000_000, 3: 1_500_000, 4: 450_000, 5: 150_000 },
  },
  MAR: {
    marketFactor: 0.24,
    tierCaps: { 1: 8_000_000, 2: 5_000_000, 3: 1_800_000, 4: 500_000, 5: 175_000 },
  },
  TUN: {
    marketFactor: 0.15,
    tierCaps: { 1: 4_500_000, 2: 3_000_000, 3: 1_100_000, 4: 350_000, 5: 120_000 },
  },
  ALG: {
    marketFactor: 0.14,
    tierCaps: { 1: 4_000_000, 2: 2_800_000, 3: 1_000_000, 4: 300_000, 5: 100_000 },
  },
  TZA: {
    marketFactor: 0.10,
    tierCaps: { 1: 2_500_000, 2: 1_800_000, 3: 700_000, 4: 220_000, 5: 80_000 },
  },
  COD: {
    marketFactor: 0.09,
    tierCaps: { 1: 2_200_000, 2: 1_600_000, 3: 600_000, 4: 200_000, 5: 70_000 },
  },
};

const normalizeMarketCountry = (country?: string | null): string | null => {
  if (!country) return null;
  const normalized = country.trim().toUpperCase();
  return normalized.length >= 3 ? normalized.slice(0, 3) : normalized;
};

const getInternationalMarketProfile = (country?: string | null): InternationalMarketProfile => {
  const normalizedCountry = normalizeMarketCountry(country);
  if (normalizedCountry && INTERNATIONAL_MARKET_PROFILE_BY_COUNTRY[normalizedCountry]) {
    return INTERNATIONAL_MARKET_PROFILE_BY_COUNTRY[normalizedCountry];
  }

  const financeFactor = EUROPEAN_COUNTRY_FINANCE_FACTOR[normalizedCountry || ''] ?? 0.25;
  const marketFactor = clamp(0.50 + Math.sqrt(financeFactor / 1.45) * 0.55, 0.45, 1.10);
  const capScale = clamp(marketFactor / 0.90, 0.55, 1.22);

  return {
    marketFactor,
    tierCaps: Object.fromEntries(
      Object.entries(INTERNATIONAL_DEFAULT_TIER_CAPS).map(([tierKey, value]) => [
        Number(tierKey),
        Math.round(value * capScale),
      ])
    ) as Record<number, number>,
  };
};

const getInternationalBaseMarketValue = (ovr: number): number => {
  if (ovr >= 92) return 155_000_000 + (ovr - 92) * 15_000_000;
  if (ovr >= 89) return 105_000_000 + (ovr - 89) * 16_000_000;
  if (ovr >= 86) return 68_000_000 + (ovr - 86) * 12_000_000;
  if (ovr >= 83) return 40_000_000 + (ovr - 83) * 9_000_000;
  if (ovr >= 80) return 24_000_000 + (ovr - 80) * 5_000_000;
  if (ovr >= 76) return 11_000_000 + (ovr - 76) * 3_000_000;
  if (ovr >= 72) return 5_000_000 + (ovr - 72) * 1_500_000;
  if (ovr >= 68) return 1_800_000 + (ovr - 68) * 800_000;
  if (ovr >= 60) return 350_000 + (ovr - 60) * 180_000;
  return 50_000 + Math.max(0, ovr - 40) * 15_000;
};

const getInternationalAgeFactor = (player: Player): number => {
  switch (player.position) {
    case PlayerPosition.DEF:
      if (player.age <= 20) return 1.08;
      if (player.age <= 24) return 1.04;
      if (player.age <= 29) return 1.00;
      if (player.age <= 31) return 0.94;
      if (player.age <= 33) return 0.82;
      if (player.age <= 35) return 0.68;
      if (player.age <= 37) return 0.52;
      return 0.40;
    case PlayerPosition.GK:
      if (player.age <= 21) return 1.02;
      if (player.age <= 25) return 1.00;
      if (player.age <= 31) return 1.05;
      if (player.age <= 34) return 0.96;
      if (player.age <= 36) return 0.82;
      if (player.age <= 38) return 0.66;
      return 0.52;
    default:
      if (player.age <= 20) return 1.18;
      if (player.age <= 23) return 1.10;
      if (player.age <= 27) return 1.00;
      if (player.age <= 29) return 0.94;
      if (player.age <= 31) return 0.82;
      if (player.age <= 33) return 0.68;
      if (player.age <= 35) return 0.54;
      if (player.age <= 37) return 0.40;
      return 0.28;
  }
};

const calculateInternationalMarketValue = (
  player: Player,
  reputation: number,
  tier: number,
  country?: string | null
): number => {
  const baseValue = getInternationalBaseMarketValue(player.overallRating);
  const tierMultiplier = ({
    1: 1.00,
    2: 0.36,
    3: 0.16,
    4: 0.06,
    5: 0.03,
  } as Record<number, number>)[tier] ?? 0.08;
  const reputationFactor = 0.90 + clamp(reputation, 1, 20) * 0.015;
  const ageFactor = getInternationalAgeFactor(player);
  const marketProfile = getInternationalMarketProfile(country);
  const randomFactor = 0.97 + (Math.random() * 0.06);
  const tierCap = marketProfile.tierCaps[tier] ?? INTERNATIONAL_DEFAULT_TIER_CAPS[5];

  const rawValue =
    baseValue *
    tierMultiplier *
    marketProfile.marketFactor *
    reputationFactor *
    ageFactor *
    randomFactor;
  const cappedValue = Math.min(rawValue, tierCap);
  const step =
    cappedValue >= 100_000_000 ? 1_000_000 :
    cappedValue >= 25_000_000 ? 500_000 :
    cappedValue >= 10_000_000 ? 250_000 :
    cappedValue >= 1_000_000 ? 100_000 :
    cappedValue >= 100_000 ? 25_000 : 10_000;
  return Math.round(cappedValue / step) * step;
};

export const FinanceService = {
  /**
   * Oblicza budżet początkowy na podstawie poziomu ligi i reputacji (1-10)
   */
  calculateInitialBudget: (tier: number, reputation: number): number => {
    let min = 0;
    let max = 0;

    switch (tier) {
      case 1: // Ekstraklasa
        min = 50000000;
        max = 217000000;
        break;
      case 2: // 1 Liga
        min = 12800000;
        max = 44800000;
        break;
      case 3: // 2 Liga
        min = 2800000;
        max = 12800000;
        break;
      case 4: // Tier 4
        min = 800000;
        max = 10000000;
        break;
      default:
        min = 1000000;
        max = 5000000;
    }

    const reputationFactor = (Math.min(10, Math.max(1, reputation)) - 1) / 9;
    const baseBudget = min + (max - min) * reputationFactor;
    const variability = 0.95 + (Math.random() * 0.1);
   
    return Math.floor(baseBudget * variability);
  },

  calculateTransferBudgetCap: (budget: number, reputation: number, wageBill: number = 0): number => {
    if (!Number.isFinite(budget) || budget <= 0) return 0;

    const rep = Math.max(1, Math.min(20, reputation || 1));
    const wagePressure = wageBill > 0 ? wageBill / Math.max(1, budget) : 0;
    let ratio = 0.34 + Math.min(0.14, rep * 0.007);

    if (wagePressure >= 0.85) ratio -= 0.14;
    else if (wagePressure >= 0.65) ratio -= 0.09;
    else if (wagePressure >= 0.45) ratio -= 0.04;

    const cappedRatio = Math.max(0.18, Math.min(0.52, ratio));
    return Math.floor(budget * cappedRatio);
  },

  calculateInitialTransferBudget: (budget: number, reputation: number): number => {
    const cap = FinanceService.calculateTransferBudgetCap(budget, reputation);
    const rep = Math.max(1, Math.min(20, reputation || 1));
    const allocationRatio = 0.52 + Math.min(0.28, rep * 0.018) + Math.random() * 0.14;
    return Math.floor(cap * Math.min(0.95, allocationRatio));
  },

  calculateInitialReserveBudget: (budget: number, reputation: number): number => {
    if (!Number.isFinite(budget) || budget <= 0) return 0;

    const rep = Math.max(1, Math.min(20, reputation || 1));
    const reserveRatio = 0.045 + Math.min(0.08, rep * 0.004);
    return Math.floor(budget * reserveRatio);
  },

  normalizeTransferBudget: (budget: number, transferBudget: number, reputation: number, wageBill: number = 0): number => {
    const cap = FinanceService.calculateTransferBudgetCap(budget, reputation, wageBill);
    return Math.max(0, Math.min(Math.floor(transferBudget || 0), cap));
  },

  getClubTier: (club?: Pick<Club, 'leagueId' | 'tier'> | null): number => {
    if (!club) return 4;
    if (typeof club.tier === 'number' && Number.isFinite(club.tier)) {
      return club.tier;
    }

    const parsedTier = parseInt((club.leagueId || '').split('_')[2] || '4', 10);
    return Number.isFinite(parsedTier) ? parsedTier : 4;
  },

  calculateEuropeanInitialBudget: (
    tier: number,
    reputation: number,
    country: string,
    clubName?: string,
    stadiumCapacity: number = 15_000
  ): number => {
    if (clubName && EUROPEAN_CLUB_REVENUE_OVERRIDE_PLN[clubName]) {
      return EUROPEAN_CLUB_REVENUE_OVERRIDE_PLN[clubName];
    }

    const baseRevenueEurM = EUROPEAN_TIER_BASE_REVENUE_EUR_M[tier] ?? EUROPEAN_TIER_BASE_REVENUE_EUR_M[4];
    const countryFactor = EUROPEAN_COUNTRY_FINANCE_FACTOR[country] ?? 0.10;
    const cappedReputation = Math.max(1, Math.min(20, reputation));
    const cappedCapacity = Math.max(2_000, Math.min(100_000, stadiumCapacity));

    // Europe has a much wider financial gap between elite and ordinary clubs than Poland.
    const reputationFactor = 0.62 + (Math.pow(cappedReputation / 20, 1.35) * 0.98);
    const stadiumFactor = 0.85 + (((cappedCapacity - 2_000) / 98_000) * 0.30);
    const continentalPremium = tier === 1 ? 1.08 : tier === 2 ? 1.00 : tier === 3 ? 0.96 : 0.92;
    const variability = 0.97 + (Math.random() * 0.06);

    const estimatedRevenueEurM =
      baseRevenueEurM *
      countryFactor *
      reputationFactor *
      stadiumFactor *
      continentalPremium *
      variability;

    return eurMillionsToPln(estimatedRevenueEurM);
  },

  getWagePool: (totalBudget: number): number => {
    return totalBudget * 0.45;
  },

  calculatePolishLeagueSalaryCeiling: (tier: number, reputation: number): number | null => {
    if (tier !== 2) return null;

    const reputationFactor = clamp((Math.max(1, Math.min(10, reputation)) - 4) / 6, 0, 1);
    const ceiling = 120_000 + (240_000 * reputationFactor);
    return Math.round(ceiling / 10_000) * 10_000;
  },

  normalizePolishLeagueAnnualSalary: (rawSalary: number, tier: number, reputation: number): number => {
    const salary = Math.max(0, Math.floor(rawSalary));
    const ceiling = FinanceService.calculatePolishLeagueSalaryCeiling(tier, reputation);
    return ceiling ? Math.min(salary, ceiling) : salary;
  },

  calculateTotalSalaries: (squad: Player[]): number => {
    return squad.reduce((sum, p) => sum + (p.annualSalary || 0), 0);
  },

  calculateAvailableFunds: (totalBudget: number, squad: Player[]): number => {
    const expenses = FinanceService.calculateTotalSalaries(squad);
    return totalBudget - expenses;
  },

  calculateSalaryWeight: (ovr: number, age: number): number => {
    const baseWeight = Math.pow(Math.max(1, ovr - 35), 1.5);
    const ageMod = age < 20 ? 0.8 : 1.0;
    return baseWeight * ageMod;
  },
  calculateNewgenSalary: (clubBudget: number, overall: number, age: number): number => {
    const wagePool = FinanceService.getWagePool(clubBudget);
    const avgSquadSalary = wagePool / 31;

    const youthDiscount =
      age <= 17 ? 0.38 :
      age <= 19 ? 0.46 :
      age <= 21 ? 0.58 :
      0.72;

    const overallModifier = Math.min(1.2, Math.max(0.55, 0.55 + ((overall - 45) * 0.03)));

    let salary = avgSquadSalary * youthDiscount * overallModifier;

    if (overall >= 70) {
      const starBonus = 1.12 + Math.min(0.18, (overall - 70) * 0.02);
      salary *= starBonus;
    }

    const fairMarketSalary = FinanceService.getFairMarketSalary(overall);
    const fairMarketCapMultiplier = overall >= 70 ? 0.55 : 0.40;
    const cappedSalary = Math.min(salary, fairMarketSalary * fairMarketCapMultiplier);

    const salaryStep = cappedSalary >= 1_000_000 ? 100_000 : cappedSalary >= 100_000 ? 10_000 : 5_000;
    return Math.max(15_000, Math.round(cappedSalary / salaryStep) * salaryStep);
  },

  // Koszty organizacji meczu — progresywna formuła wg. ligi, reputacji i frekwencji
  // attendance (opcjonalne) — liczba kibiców na trybunach (dla meczów u siebie)
  calculateMatchdayExpenses: (club: any, isHome: boolean, attendance?: number): number => {
    const cfoFactor = 1.15 - ((club.management?.cfo?.dyscyplinaFinansowa ?? 10) / 20) * 0.30;

    if (isEuropeanCommercialClub(club)) {
      const marketIndex = getEuropeanCommercialIndex(club);

      if (isHome) {
        const att = attendance ?? 0;
        const fillRate = club.stadiumCapacity > 0 ? att / club.stadiumCapacity : 0;
        const fillMultiplier =
          fillRate >= 0.95 ? 1.30 :
          fillRate >= 0.85 ? 1.18 :
          fillRate >= 0.70 ? 1.08 : 1.00;

        const rawCost =
          (
            180_000 +
            club.stadiumCapacity * (5.5 + marketIndex * 1.8) +
            att * (7.0 + marketIndex * 2.4) +
            club.reputation * (16_000 + marketIndex * 8_000)
          ) * fillMultiplier * cfoFactor;

        const minFloor = 180_000 + club.stadiumCapacity * (2.0 + marketIndex * 0.8);
        const maxCap = 350_000 + club.stadiumCapacity * (14 + marketIndex * 4.0);

        return Math.round(clamp(rawCost, minFloor, maxCap));
      }

      const awayRaw =
        (
          120_000 +
          club.stadiumCapacity * (1.0 + marketIndex * 0.35) +
          club.reputation * (7_000 + marketIndex * 3_000)
        ) * cfoFactor;

      const awayCap = 220_000 + club.stadiumCapacity * (3.5 + marketIndex);
      return Math.round(Math.min(awayRaw, awayCap));
    }

    const tier = Math.min(4, Math.max(1, parseInt((club.leagueId as string).split('_')[2] || '4')));
    const p = MATCHDAY_COST_PARAMS;

    if (isHome) {
      const att = attendance ?? 0;
      const fillRate = club.stadiumCapacity > 0 ? att / club.stadiumCapacity : 0;

      // Współczynnik obciążenia — im wyższe obciążenie stadionu, tym nieproporcjonalnie
      // większe koszty ochrony, stewardów, logistyki i hospitality
      const fillMultiplier =
        fillRate >= 0.95 ? 1.50 :
        fillRate >= 0.85 ? 1.30 :
        fillRate >= 0.70 ? 1.10 : 1.00;

      const rawCost =
        (p.home.baseCost[tier] +
         att * p.home.perFanCost[tier] +
         club.reputation * p.home.repScale[tier]) * fillMultiplier * cfoFactor;

      return Math.min(
        p.home.maxCap[tier],
        Math.max(p.home.minFloor[tier], Math.floor(rawCost))
      );
    }

    // Wyjazd — koszty transportu, zakwaterowania, diet zawodników i sztabu
    const rawCost =
      (p.away.baseCost[tier] +
       club.reputation * p.away.repScale[tier]) * cfoFactor;

    return Math.min(p.away.maxCap[tier], Math.floor(rawCost));
  },

  calculateManagementMonthlySalary: (club: Club): number => {
    if (!club.management) return 0;
    const { owner, ceo, cfo, coo, marketingDirector, academyDirector } = club.management;
    return (
      owner.monthlySalary +
      (ceo?.monthlySalary ?? 0) +
      cfo.monthlySalary +
      coo.monthlySalary +
      marketingDirector.monthlySalary +
      (academyDirector?.monthlySalary ?? 0)
    );
  },

  calculateMonthlyOperationalCosts: (club: Club): number => {
    const KOMPETENCJA_MULTIPLIER: Record<string, number> = {
      bardzo_niska:  1.35,
      niska:         1.20,
      przecietna:    1.05,
      wysoka:        0.95,
      bardzo_wysoka: 0.85,
    };

    const kompetencja = club.board?.kompetencja ?? 'przecietna';
    const kompetencjaFactor = KOMPETENCJA_MULTIPLIER[kompetencja] ?? 1.05;
    const cfoFactor = 1.15 - ((club.management?.cfo?.dyscyplinaFinansowa ?? 10) / 20) * 0.30;

    if (isEuropeanCommercialClub(club)) {
      const tier = Math.min(4, Math.max(1, club.tier ?? 1));
      const monthlyFactor = ({ 1: 0.015, 2: 0.012, 3: 0.010, 4: 0.008 } as Record<number, number>)[tier] ?? 0.010;
      const rawCost = club.budget * monthlyFactor * kompetencjaFactor * cfoFactor;
      return Math.round(clamp(rawCost, 50_000, 80_000_000) / 1_000) * 1_000;
    }

    const tier = Math.min(4, Math.max(1, parseInt((club.leagueId as string).split('_')[2] || '4')));
    const cappedCapacity = Math.max(500, Math.min(80_000, club.stadiumCapacity));
    const cappedRep = Math.max(1, Math.min(10, club.reputation));

    const costPerSeat  = ({ 1: 18,  2: 9,   3: 4.5, 4: 2   } as Record<number, number>)[tier] ?? 2;
    const opsBase      = ({ 1: 350_000, 2: 65_000, 3: 16_000, 4: 5_000 } as Record<number, number>)[tier] ?? 5_000;
    const opsPerRep    = ({ 1: 65_000,  2: 16_000, 3: 4_500,  4: 1_500 } as Record<number, number>)[tier] ?? 1_500;
    const tierMin      = ({ 1: 350_000, 2: 70_000, 3: 18_000, 4: 5_000 } as Record<number, number>)[tier] ?? 5_000;
    const tierMax      = ({ 1: 3_000_000, 2: 900_000, 3: 180_000, 4: 55_000 } as Record<number, number>)[tier] ?? 55_000;

    const stadiumCost = cappedCapacity * costPerSeat;
    const opsCost     = opsBase + cappedRep * opsPerRep;
    const rawCost     = (stadiumCost + opsCost) * 1.30 * kompetencjaFactor * cfoFactor;

    return Math.round(clamp(rawCost, tierMin, tierMax) / 1_000) * 1_000;
  },

  calculateSeasonalIncome: (tier: number, reputation: number, rank: number, sponsorshipMult: number = 1.0): number => {
    const cappedReputation = Math.max(1, Math.min(10, reputation));
    if (tier === 3) {
      const tvRights = 2000000;
      const sponsorship = cappedReputation * 500000 * sponsorshipMult;
      const prizeMoney = Math.max(0, (19 - rank) * 150000);
      return Math.floor(tvRights + sponsorship + prizeMoney);
    }
    if (tier === 4) {
      const tvRights = 750000;
      const sponsorship = cappedReputation * 150000 * sponsorshipMult;
      const prizeMoney = Math.max(0, (20 - rank) * 40000);
      return Math.floor(tvRights + sponsorship + prizeMoney);
    }
    const tvRights = [0, 35000000, 15000000, 6000000, 2000000][tier] || 1000000;
    const sponsorship = cappedReputation * 4000000 * sponsorshipMult;
    const prizeMoney = Math.max(0, (19 - rank) * 1500000);
    return Math.floor(tvRights + sponsorship + prizeMoney);
  },

  calculateMarketValue: (player: Player, reputation: number, tier: number, clubCountry?: string | null): number => {
    if (player.clubId === 'FREE_AGENTS') return 0;
    const ovr = player.overallRating;
    const normalizedCountry = normalizeMarketCountry(clubCountry);
    const isPolishClub = player.clubId.startsWith('PL_') || normalizedCountry === 'POL';
    if (isPolishClub) {
      return calculatePolishMarketValue(player, reputation, tier);
    }
    return calculateInternationalMarketValue(player, reputation, tier, normalizedCountry);
  },

  /**
   * Board Intervention Engine (BIE)
   * Oblicza WOZ (Wskaźnik Oporu Zarządu)
   */
  evaluateReleaseRequest: (player: Player, club: Club, squad: Player[]): { 
    status: 'APPROVED' | 'WARNING' | 'SOFT_BLOCK' | 'VETO', 
    woz: number, 
    reason: string 
  } => {
    const penalty = Math.floor(player.annualSalary * 0.4);
    const budget = club.budget;
    
    // 1. Wektor Finansowy (45%) - Ból budżetowy
    const financialPain = (penalty / budget) * 100;
    let financialScore = financialPain * 4; 
    if (financialPain > 20) financialScore += 50; 

    // 2. Wektor Sportowy (40%) - Status w kadrze
    const avgOvr = squad.reduce((acc, p) => acc + p.overallRating, 0) / squad.length;
    const starGap = player.overallRating - avgOvr;
    let sportScore = 0;
    if (starGap > 10) sportScore = 95; 
    else if (starGap > 5) sportScore = 50;
    else if (starGap < -5) sportScore = -20;

    // 3. Wektor Osobowości Zarządu (10%)
    const strictnessScore = (club.boardStrictness - 5) * 10;

    // 4. Czynnik Chaosu (5%)
    const chaosScore = (Math.random() * 20) - 10;

    let woz = Math.max(0, Math.min(100, (financialScore * 0.45) + (sportScore * 0.40) + (strictnessScore * 0.10) + chaosScore));

    const top11Ids = [...squad].sort((a, b) => b.overallRating - a.overallRating).slice(0, 11).map(p => p.id);
    const isPillar = top11Ids.includes(player.id);
    
    // Mechanizm Top 11 Elite Lock: 95% szansy na twardy opór zarządu przy próbie zwolnienia filaru drużyny
    if (isPillar && Math.random() > 0.05) {
      woz = Math.max(woz, 90); 
    }
    
    // Dodatkowy twardy warunek dla statusu Nietykalnego (isUntouchable) - 99% szansy na blokadę
    if (player.isUntouchable && Math.random() > 0.01) {
      woz = 100;
    }

    if (woz < 30) return { status: 'APPROVED', woz, reason: "Zarząd akceptuje Pana decyzję. Koszty są akceptowalne, a zawodnik nie jest kluczowy dla wizerunku klubu." };
    if (woz < 60) return { status: 'WARNING', woz, reason: "Zarząd ma pewne wątpliwości co do opłacalności tego ruchu. Ostatecznie ufa Pana osądowi, ale oczekuje wyników." };
    if (woz < 85) return { status: 'SOFT_BLOCK', woz, reason: "Wniosek odrzucony. Obecnie nie możemy sobie pozwolić na taką stratę finansową. Proszę spróbować za 3 miesiące." };
    return { status: 'VETO', woz, reason: "ABSOLUTNE VETO! Ten zawodnik jest ikoną klubu, a koszty jego zwolnienia zrujnowałyby nasz budżet transferowy!" };
  },

  /**
   * Oblicza ile klub ma w puli na bonusy za podpis (5-10% budżetu)
   */
  calculateInitialSigningPool: (budget: number, reputation: number): number => {
    // Im większa reputacja, tym zarząd chętniej rezerwuje więcej (do 10%)
    const repFactor = (reputation / 10) * 0.05; 
    const finalPercent = 0.05 + repFactor; 
    return Math.floor(budget * finalPercent);
  },

  /**
   * Oblicza ile zawodnik żąda za sam podpis (25-100% pensji)
   */
  calculatePlayerBonusDemand: (player: Player, proposedSalary: number, clubReputation: number): number => {
    // Losowa baza 25-100%
    let basePercent = 0.25 + (Math.random() * 0.75);
    
    // Modyfikator Reputacji: Jeśli klub > 8, zawodnik rząda min. 60%
    if (clubReputation > 8) {
      basePercent = Math.max(0.60, basePercent);
    }

    let demand = proposedSalary * basePercent;

    // Modyfikator Overall: Gwiazdy (>75) rzadają o 15% więcej
    if (player.overallRating > 75) {
      demand *= 1.15;
    }

    return Math.floor(demand);
  },

  /**
   * Sprawdza czy oferta nie jest "manipulacją" (poniżej 40% żądań)
   */
  isOfferInsulting: (proposedBonus: number, demand: number): boolean => {
    return proposedBonus < (demand * 0.4);
  },

  /**
   * Główny silnik prawdopodobieństwa akceptacji (FM HARDCORE MODE)
   */
  evaluateContractLogic: (
    player: Player, 
    newSalary: number, 
    newBonus: number,
    newEndDate: string, 
    currentDate: Date,
    clubReputation: number,
    clubTier?: number
  ): { accepted: boolean, reason: string, demands: { salary: number, bonus: number } | null } => {
    const now = currentDate.getTime();
    const currentEnd = new Date(player.contractEndDate).getTime();
    const newEnd = new Date(newEndDate).getTime();
    
    // 1. Oczekiwania zawodnika (punkt odniesienia to obecna pensja)
    const rawExpectedSalary = player.annualSalary > 0 
  ? player.annualSalary 
  : FinanceService.getFairMarketSalary(player.overallRating);
    const salaryCeiling = clubTier
      ? FinanceService.calculatePolishLeagueSalaryCeiling(clubTier, clubReputation)
      : null;
    const expectedSalary = salaryCeiling ? Math.min(rawExpectedSalary, salaryCeiling) : rawExpectedSalary;
    const expectedBonus = FinanceService.calculatePlayerBonusDemand(player, expectedSalary, clubReputation);

    // --- TUTAJ WSTAW LOGIKĘ: WARUNEK LOSOWY (1 SZANSA NA 10 PRZY MAX -15%) ---
    const isSalaryWithin15Percent = newSalary >= expectedSalary * 0.85;
    const isBonusWithin15Percent = newBonus >= expectedBonus * 0.85;
    
    if (isSalaryWithin15Percent && isBonusWithin15Percent && Math.random() < 0.10) {
      return {
        accepted: true,
        reason: "Mój klient liczył na nieco lepsze warunki, ale po namyśle uznaliśmy, że ten zespół jest wart pewnych ustępstw finansowych. Podpisujemy!",
        demands: null
      };
    }
    // --- KONIEC WARUNKU LOSOWEGO ---
    
    // 2. Składowe satysfakcji (1.0 = 100% zadowolenia)
    const salaryScore = newSalary / expectedSalary;
    const bonusScore = expectedBonus > 0 ? (newBonus / expectedBonus) : 1.1;

    // 3. Mechanizm Dynamicznej Wymienności (Interchangeability)
    // Nadwyżka w pensji (powyżej 100%) rekompensuje brak bonusu w skali 1:2.5
    const salarySurplus = Math.max(0, salaryScore - 1.0);
    const effectiveBonusScore = bonusScore + (salarySurplus * 2.5);

    // Dodanie odwrotnej wymienności: Bonus -> Pensja
    const bonusSurplus = Math.max(0, bonusScore - 1.0);
    const effectiveSalaryScore = salaryScore + (bonusSurplus * 0.12); // Wysoki bonus łagodzi ból nieco niższej pensji

    // 4. Test "Progu Godności" (Hard Block)
    if (effectiveSalaryScore < 0.65) {
      return { 
        accepted: false, 
        reason: "Nie traktujecie mnie powaznie wiec nie będziemy o niczym rozmawiac. Do widzenia!",
        demands: null
      };
    }
    
    // Bonus może być zerowy, JEŚLI pensja jest wystarczająco wysoka (min. 115% oczekiwań)
    if (newBonus < (expectedBonus * 0.2) && effectiveSalaryScore < 1.15) {
      return { 
        accepted: false, 
        reason: "Mój agent uważa, że kwota za sam podpis jest zdecydowanie za niska. Proszę o przedstawienie nowej oferty uwzględniającej godny bonus.",
        demands: { salary: Math.ceil(expectedSalary * 1.05), bonus: expectedBonus }
      };
    }

    // 5. Wagi Satysfakcji zależne od Wieku
    let wSal = 0.6, wBon = 0.3, wLen = 0.1;
    if (player.age >= 32) {
      wSal = 0.4; wBon = 0.5; wLen = 0.1; // Weterani cenią gotówkę "na stół"
    } else if (player.age <= 23) {
      wSal = 0.7; wBon = 0.1; wLen = 0.2; // Młodzi chcą wysokiej pensji i statusu
    }

    // 6. Ocena Długości
    const proposedYears = (newEnd - now) / (365 * 24 * 60 * 60 * 1000);
    const remainingYears = (currentEnd - now) / (365 * 24 * 60 * 60 * 1000);
    
    let lengthScore = 1.0;
    if (proposedYears < remainingYears) lengthScore = 0.5; 
    if (player.age > 33 && proposedYears >= 2) lengthScore = 1.3; // Starsi kochają stabilizację

    // 7. Wynik Końcowy (Final Score)
    const finalScore = (effectiveSalaryScore * wSal) + (effectiveBonusScore * wBon) + (lengthScore * wLen);
  // 8. System Kontroferty (Zgodnie z wymaganiem: 9/10 przypadków rząda 5-25% WIĘCEJ niż obecna pensja)
    const isDemandingHigher = Math.random() < 0.9;

    let demandSalary = expectedSalary;
    let demandBonus = expectedBonus;

    if (isDemandingHigher) {
      const multiplier = 1.05 + (Math.random() * 0.15); // 1.05 do 1.20
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
      return { accepted: true, reason: "Zgadzam się na te warunki.", demands: null };
    }

    if (finalScore >= 0.70) { 
       return { 
         accepted: false, 
         reason: "Jesteśmy blisko porozumienia, ale mój klient oczekuje lepszych kwot, biorąc pod uwagę jego status w zespole. Oto nasze oczekiwania.",
         demands 
       };
    }

    return { 
      accepted: false, 
      reason: "Z całym szacunkiem, ale te warunki są nieakceptowalne. Proszę o przedstawienie oferty godnej zawodnika tej klasy.", 
      demands: finalScore > 0.4 ? demands : null 
    };
  },

  // Oblicza sumę wszystkich pensji w drużynie
  calculateCurrentWageBill: (squad: Player[]): number => {
    return squad.reduce((sum, p) => sum + (p.annualSalary || 0), 0);
  },

  // Oblicza rynkową wartość pensji dla danego OVR (punkt odniesienia dla Zarządu)
   getFairMarketSalary: (ovr: number): number => {
    const base = Math.pow(ovr / 50, 4) * 125000;
    const step = base >= 1_000_000 ? 100_000 : base >= 100_000 ? 10_000 : 5_000;
    return Math.round(base / step) * step;
  },

  calculateFAExpectations: (player: Player, clubReputation: number, avgSquadSalary: number): number => {
    // Podstawa: OVR do kwadratu (wykładniczy wzrost żądań)
    const base = Math.pow(player.overallRating, 2.9) * 0.45;
    // Podatek od reputacji: Jeśli klub ma niską sławę, gracz chce więcej "odszkodowania"
    const repTax = (10 - clubReputation) * 0.05;
    // Kotwica płacowa: Agent patrzy ile zarabiają inni w Twoim klubie
    const anchor = (avgSquadSalary * 0.3) + (base * 0.7);
    // Czynnik losowy (Chaos) +/- 15%
    const chaos = 0.85 + (Math.random() * 0.3);
    return Math.floor(anchor * (1 + repTax) * chaos);
  },

  evaluateFASigningBoardDecision: (player: Player, proposedSalary: number, proposedBonus: number, squad: Player[], club: Club): { approved: boolean, reason: string } => {
    // 1. BLOKADA KSIĘGOWEGO: proponowana pensja > 25% budżetu transferowego
    // (Nie porównujemy łącznego funduszu płac do budżetu – to są zupełnie różne pojęcia finansowe)
    const salaryCap = club.budget * 0.25;
    if (proposedSalary > salaryCap) {
      return { approved: false, reason: `DYREKTOR FINANSOWY: Proponowana pensja przekracza 25% naszego budżetu transferowego (limit: ${Math.floor(salaryCap).toLocaleString()} PLN).` };
    }

    // 2. BLOKADA STRUKTURALNA (Porównanie z liderami płac)
    const highestSalary = squad.length > 0 ? Math.max(...squad.map(p => p.annualSalary)) : 0;
    if (proposedSalary > highestSalary * 2 && highestSalary > 0 && player.overallRating < 82) {
      return {
        approved: false,
        reason: `PREZES: Ta oferta zniszczy naszą hierarchię w szatni! Nie damy nowemu graczowi dwa razy więcej niż zarabia nasz najlepszy zawodnik (${highestSalary.toLocaleString()} PLN).`
      };
    }

    // 3. OCENA WARTOŚCI RYNKOWEJ (Usunięto lukę dla OVR 78+)
    const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
    const overpayRatio = proposedSalary / fairSalary;
    const allowedOverpay = 1.2 + ((10 - club.boardStrictness) / 10); // Max 2.1x przy bardzo luźnym zarządzie

    if (overpayRatio > allowedOverpay) {
      return {
        approved: false,
        reason: `ZARZĄD: Ta kwota to absurd! Sugerowana pensja rynkowa dla OVR ${player.overallRating} to ok. ${fairSalary.toLocaleString()} PLN. Nie pozwolimy na taką niegospodarność.`
      };
    }

    if (proposedBonus > club.budget * 0.5) {
      return { approved: false, reason: "ZARZĄD: Bonus za podpis jest zbyt wysoki w stosunku do wolnej gotówki w klubie." };
    }

    return { approved: true, reason: "" };
  },

  evaluateRenewalBoardDecision: (player: Player, proposedSalary: number, proposedBonus: number, squad: Player[], club: Club): { approved: boolean, reason: string } => {
    // 1/365 szansa że "zwariowany prezes" zatwierdza cokolwiek
    if (Math.random() < (1 / 365)) {
      return { approved: true, reason: "PREZES: Wiecie co, idę na całość. Podpisujemy!" };
    }

    const currentWageBill = FinanceService.calculateCurrentWageBill(squad);
    const wageBillAfter = currentWageBill - player.annualSalary + proposedSalary;

    // 1. FUNDUSZ PŁAC: łączne pensje po przedłużeniu > 65% budżetu
    if (wageBillAfter > club.budget * 0.65) {
      return {
        approved: false,
        reason: "DYREKTOR FINANSOWY: Łączny fundusz płac po tej podwyżce przekroczyłby nasze możliwości budżetowe."
      };
    }

    // 2. SKOK PENSJI: nowa pensja > 2× obecna pensja zawodnika
    if (proposedSalary > player.annualSalary * 2 && player.annualSalary > 0) {
      return {
        approved: false,
        reason: `PREZES: Podwojenie pensji to za duży skok naraz. Zawodnik zarabia teraz ${player.annualSalary.toLocaleString()} PLN — wróćcie z rozsądniejszą propozycją.`
      };
    }

    // 3. HIERARCHIA PŁAC: nowa pensja > 1.5× max w składzie (tylko dla OVR < 80)
    const highestSalary = squad.length > 0 ? Math.max(...squad.map(p => p.annualSalary)) : 0;
    if (proposedSalary > highestSalary * 1.5 && highestSalary > 0 && player.overallRating < 80) {
      return {
        approved: false,
        reason: `PREZES: Ten zawodnik zarabiałby więcej niż 1.5x tyle co najlepiej opłacany gracz w zespole (${highestSalary.toLocaleString()} PLN). Szatnia tego nie zaakceptuje.`
      };
    }

    // 4. BONUS: > 30% wolnego budżetu
    if (proposedBonus > club.budget * 0.30) {
      return {
        approved: false,
        reason: "DYREKTOR FINANSOWY: Bonus za podpis jest zbyt wysoki wobec aktualnych rezerw gotówkowych klubu."
      };
    }

    return { approved: true, reason: "" };
  },

  classifyFAOffer: (proposed: number, expected: number): 'IDEAL' | 'ATTRACTIVE' | 'AVERAGE' | 'WEAK' | 'INSULT' => {
    const ratio = proposed / expected;
    if (ratio >= 1.1) return 'IDEAL';
    if (ratio >= 0.9) return 'ATTRACTIVE';
    if (ratio >= 0.7) return 'AVERAGE';
    if (ratio >= 0.45) return 'WEAK';
    return 'INSULT';
  },

  compareMultipleOffers: (offers: any[], clubs: Club[]): any => {
    return [...offers].sort((a, b) => {
      const clubA = clubs.find(c => c.id === a.clubId);
      const clubB = clubs.find(c => c.id === b.clubId);
      
      const repA = clubA ? clubA.reputation : 1;
      const repB = clubB ? clubB.reputation : 1;

      // Algorytm atrakcyjności: Pensja + połowa bonusu + bonus za prestiż klubu
      const scoreA = a.salary + (a.bonus / 2) + (repA * 50000);
      const scoreB = b.salary + (b.bonus / 2) + (repB * 50000);
      
      return scoreB - scoreA; 
    })[0];
  },

  evaluateReleaseVsList: (player: Player): 'RELEASE' | 'TRANSFER_LIST' => {
    // Jeśli zawodnik jest wart więcej niż połowa jego rocznej pensji -> próbujemy sprzedać
    const marketValue = player.marketValue || 0;
    const releaseCost = player.annualSalary * 0.4;
    
    if (marketValue > player.annualSalary * 0.5) {
      return 'TRANSFER_LIST';
    }
    return 'RELEASE';
  },

  // Funkcja zwraca cenę biletu jednorazowego w zależności od ligi i reputacji
  calculateTicketPrice: (tier: number, reputation: number): number => {
    let basePrice = 0;
    
    switch (tier) {
      case 1: // Ekstraklasa
        basePrice = 20 + (reputation / 10) * 160; // 20-180 PLN
        break;
      case 2: // 1 Liga
        const ekstraPrice = 20 + (reputation / 10) * 160;
        basePrice = ekstraPrice * (0.4 + (reputation / 10) * 0.2); // 40-60% poniżej
        break;
      case 3: // 2 Liga i niższe
        const refPrice = 20 + (reputation / 10) * 160;
        basePrice = refPrice * (0.15 + (reputation / 10) * 0.25); // 60-85% poniżej
        break;
      case 4: // Piłka regionalna / półamatorska
        basePrice = 8 + (reputation / 10) * 16; // 8-24 PLN
        break;
      default:
        basePrice = 12;
    }

    if (tier === 3) {
      basePrice = 8 + (reputation / 10) * 18; // 8-26 PLN
    }
    
    return Math.floor(basePrice);
  },

  calculateTicketPriceForClub: (club: Club): number => {
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      return FinanceService.calculateTicketPrice(tier, club.reputation);
    }

    const marketIndex = getEuropeanCommercialIndex(club);
    const maxPrice = 18 + marketIndex * 110 + (club.reputation / 20) * 85;
    return Math.round(clamp(maxPrice, 45, 420));
  },

  // Przychód z biletów jednorazowych
  calculateMatchTicketRevenue: (attendance: number, tier: number, reputation: number): { revenue: number; avgPrice: number } => {
    const maxPrice = FinanceService.calculateTicketPrice(tier, reputation);
    const minPrice = maxPrice <= 20 ? Math.max(5, Math.floor(maxPrice * 0.65)) : 20;
    const avgPrice = maxPrice <= minPrice
      ? maxPrice
      : Math.floor(minPrice + Math.random() * (maxPrice - minPrice));
    return { revenue: Math.floor(attendance * avgPrice), avgPrice };
  },

  calculateMatchTicketRevenueForClub: (attendance: number, club: Club): { revenue: number; avgPrice: number } => {
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      return FinanceService.calculateMatchTicketRevenue(attendance, tier, club.reputation);
    }

    const maxPrice = FinanceService.calculateTicketPriceForClub(club);
    const avgPrice = Math.round(maxPrice * (0.58 + Math.random() * 0.20));
    return { revenue: Math.floor(attendance * avgPrice), avgPrice };
  },

  // Przychód z karnetów na sezon (tylko dla gospodarza)
  calculateSeasonTicketRevenue: (stadiumCapacity: number, reputation: number, tier: number): number => {
    // Karnetami kupuje się od 10%-30% pojemności stadionu w zaledości od reputacji
    let percentageOfCapacity = 0.10 + ((reputation / 10) * 0.20); // 10-30%
    
    // Cena sezonu od 200 do 1300 PLN
    const singlePrice = FinanceService.calculateTicketPrice(tier, reputation);
    const matchesPerSeason = 19; // Średnia liczba meczów u siebie
    const seasonTicketPrice = singlePrice * matchesPerSeason;
    const minSeasonPrice = 200;
    const maxSeasonPrice = 1300;
    
    const finalSeasonPrice = Math.max(minSeasonPrice, Math.min(maxSeasonPrice, seasonTicketPrice));
    const seasonTicketsSold = Math.floor(stadiumCapacity * percentageOfCapacity);
    
    return Math.floor(seasonTicketsSold * finalSeasonPrice);
  },

  calculateSeasonTicketPackageForClub: (club: Club): { revenue: number; ticketsSold: number; seasonTicketPrice: number } => {
    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      const revenue = FinanceService.calculateSeasonTicketRevenue(club.stadiumCapacity, club.reputation, tier);
      const ticketsSold = Math.floor(club.stadiumCapacity * (0.10 + ((club.reputation / 10) * 0.20)));
      const ticketPrice = FinanceService.calculateTicketPrice(tier, club.reputation);
      const seasonTicketPrice = Math.max(200, Math.min(1300, ticketPrice * 19));
      return { revenue, ticketsSold, seasonTicketPrice };
    }

    const marketIndex = getEuropeanCommercialIndex(club);
    const seasonTicketShare = clamp(0.14 + marketIndex * 0.10 + (club.reputation / 20) * 0.18, 0.16, 0.65);
    const ticketsSold = Math.floor(club.stadiumCapacity * seasonTicketShare);
    const singleMatchPrice = FinanceService.calculateTicketPriceForClub(club);
    const seasonDiscount = clamp(0.68 + marketIndex * 0.05, 0.70, 0.82);
    const seasonTicketPrice = Math.round(clamp(singleMatchPrice * 19 * seasonDiscount, 900, 8_500));
    return {
      revenue: ticketsSold * seasonTicketPrice,
      ticketsSold,
      seasonTicketPrice
    };
  },

  // Dodatkowe przychody dnia meczowego per mecz domowy:
  // catering, merchandising, programy/LED, parkingi — proporcjonalne do frekwencji
  calculateMatchdayAdditionalRevenues: (attendance: number, tier: number, reputation: number): {
    catering: number;
    merchandising: number;
    programs: number;
    parking: number;
  } => {
    const t = Math.min(4, Math.max(1, tier));
    const p = MATCHDAY_ADDITIONAL_REVENUE_PARAMS;
    const repMultiplier = 0.8 + (reputation / 10) * 0.4;

    const rand = () => 0.80 + Math.random() * 0.40;

    const catering      = Math.floor(attendance * p.cateringPerFan[t]      * repMultiplier * rand());
    const merchandising = Math.floor(attendance * p.merchandisingPerFan[t] * repMultiplier * rand());
    const programs      = Math.floor(attendance * p.programsPerFan[t]      * repMultiplier * rand());
    const parking       = Math.floor(attendance * p.parkingPerFan[t]       * repMultiplier * rand());

    return { catering, merchandising, programs, parking };
  },

  calculateMatchdayAdditionalRevenuesForClub: (attendance: number, club: Club): {
    catering: number;
    merchandising: number;
    programs: number;
    parking: number;
  } => {
    const mktFactor = 0.85 + ((club.management?.marketingDirector?.zdolnosciMarketingowe ?? 10) / 20) * 0.30;

    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      const base = FinanceService.calculateMatchdayAdditionalRevenues(attendance, tier, club.reputation);
      return {
        catering:      Math.floor(base.catering * mktFactor),
        merchandising: Math.floor(base.merchandising * mktFactor),
        programs:      Math.floor(base.programs * mktFactor),
        parking:       Math.floor(base.parking * mktFactor),
      };
    }

    const marketIndex = getEuropeanCommercialIndex(club);
    const repMultiplier = 0.90 + (club.reputation / 20) * 0.45;
    const rand = () => 0.82 + Math.random() * 0.36;

    const catering = Math.floor(attendance * (2.5 + marketIndex * 2.6) * repMultiplier * rand() * mktFactor);
    const merchandising = Math.floor(attendance * (0.9 + marketIndex * 1.4) * repMultiplier * rand() * mktFactor);
    const programs = Math.floor(attendance * (0.3 + marketIndex * 0.45) * repMultiplier * rand() * mktFactor);
    const parking = Math.floor(attendance * (0.4 + marketIndex * 0.65) * repMultiplier * rand() * mktFactor);

    return { catering, merchandising, programs, parking };
  },

  // Roczny przychód z wynajmu stref VIP i lóż (Skybox).
  // Warunki: tier === 1 (Ekstraklasa) ORAZ stadiumCapacity > 15 000
  calculateVIPBoxRevenue: (stadiumCapacity: number, reputation: number): number => {
    const p = VIP_BOX_REVENUE_PARAMS;
    const raw = p.base + (reputation / 10) * p.repScale + (stadiumCapacity / 40_000) * p.capacityScale;
    const jitter = 0.85 + Math.random() * 0.30;
    return Math.min(p.maxRevenue, Math.max(p.minRevenue, Math.floor(raw * jitter)));
  },

  calculateVIPBoxRevenueForClub: (club: Club): number => {
    const mktFactor = 0.85 + ((club.management?.marketingDirector?.zdolnosciMarketingowe ?? 10) / 20) * 0.30;

    if (!isEuropeanCommercialClub(club)) {
      const tier = FinanceService.getClubTier(club);
      if (tier !== 1 || club.stadiumCapacity <= 15_000) return 0;
      return Math.floor(FinanceService.calculateVIPBoxRevenue(club.stadiumCapacity, club.reputation) * mktFactor);
    }

    if (club.stadiumCapacity < 4_000) return 0;

    const marketIndex = getEuropeanCommercialIndex(club);
    const suitesSold = Math.max(4, Math.round(club.stadiumCapacity / 2_200));
    const avgSuitePrice = 25_000 + marketIndex * 120_000 + (club.reputation / 20) * 100_000;
    const occupancyFactor = club.leagueId === 'L_CL' ? 1.00 : club.leagueId === 'L_EL' ? 0.92 : 0.86;
    const jitter = 0.90 + Math.random() * 0.20;

    return Math.round(suitesSold * avgSuitePrice * occupancyFactor * jitter * mktFactor);
  },

  // Bonusy za pozycję końcową w lidze (Ekstraklasa)
  calculateLeagueFinishBonus: (position: number, tier: number): number => {
    // Bonusy tylko dla Ekstraklasy (tier 1)
    if (tier !== 1) return 0;
    
    const bonuses: Record<number, number> = {
      1: 35000000 + Math.random() * 3000000, // 35-38 mln
      2: 28000000 + Math.random() * 4000000, // 28-32 mln
      3: 24000000 + Math.random() * 4000000, // 24-28 mln
      4: 20000000 + Math.random() * 5000000, // 20-25 mln
    };
    
    if (bonuses[position]) return Math.floor(bonuses[position]);
    
    // Dla pozycji 5-18: zmniejszające się bonusy
    if (position > 4) {
      const baseBonus = 10000000;
      const decrement = 500000 * (position - 4);
      return Math.max(0, Math.floor(baseBonus - decrement));
    }
    
    return 0;
  },

  // Bonusy za Puchar Polski
  calculatePolishCupBonus: (cupPosition: 'WINNER' | 'FINALIST' | 'SEMIFINALIST' | 'QUARTERFINALIST' | 'ROUND_8' | 'ROUND_16' | 'ROUND_32' | 'ROUND_64'): number => {
    const bonuses: Record<string, number> = {
      'WINNER': 5000000,
      'FINALIST': 1000000,
      'SEMIFINALIST': 380000,
      'QUARTERFINALIST': 190000,
      'ROUND_8': 90000,
      'ROUND_16': 45000,
      'ROUND_32': 20000,
      'ROUND_64': 10000,
    };
    
    return bonuses[cupPosition] || 0;
  },

  // Bonus za Superpuchar Polski
  calculateSuperCupBonus: (isWinner: boolean): number => {
    return isWinner ? 200000 : 100000;
  },

  // Premie UEFA za Puchary Europejskie (sezon 2025/26, przeliczone na PLN wg kursu 4,25 EUR/PLN)
  calculateEuropeanPrizeMoney: (
    competition: 'CL' | 'EL' | 'CONF',
    event: 'Q1_ADVANCE' | 'Q2_ADVANCE' | 'GROUP_STAGE_ENTRY' | 'WIN' | 'DRAW' | 'KO_PLAYOFF' | 'R16' | 'QF' | 'SF' | 'FINALIST' | 'WINNER'
  ): number => {
    const EUR_PLN = 4.25;
    const prizes: Record<string, Record<string, number>> = {
      CL: {
        Q1_ADVANCE:        Math.round(400_000    * EUR_PLN), //   1 700 000
        Q2_ADVANCE:        Math.round(1_000_000  * EUR_PLN), //   4 250 000
        GROUP_STAGE_ENTRY: Math.round(18_620_000 * EUR_PLN), //  79 135 000
        WIN:               Math.round(2_100_000  * EUR_PLN), //   8 925 000
        DRAW:              Math.round(700_000    * EUR_PLN), //   2 975 000
        KO_PLAYOFF:        Math.round(1_100_000  * EUR_PLN), //   4 675 000
        R16:               Math.round(11_000_000 * EUR_PLN), //  46 750 000
        QF:                Math.round(12_500_000 * EUR_PLN), //  53 125 000
        SF:                Math.round(15_000_000 * EUR_PLN), //  63 750 000
        FINALIST:          Math.round(18_500_000 * EUR_PLN), //  78 625 000
        WINNER:            Math.round(25_000_000 * EUR_PLN), // 106 250 000
      },
      EL: {
        Q1_ADVANCE:        Math.round(100_000    * EUR_PLN), //     425 000
        Q2_ADVANCE:        Math.round(250_000    * EUR_PLN), //   1 062 500
        GROUP_STAGE_ENTRY: Math.round(4_310_000  * EUR_PLN), //  18 317 500
        WIN:               Math.round(630_000    * EUR_PLN), //   2 677 500
        DRAW:              Math.round(210_000    * EUR_PLN), //     892 500
        KO_PLAYOFF:        Math.round(500_000    * EUR_PLN), //   2 125 000
        R16:               Math.round(1_500_000  * EUR_PLN), //   6 375 000
        QF:                Math.round(2_200_000  * EUR_PLN), //   9 350 000
        SF:                Math.round(3_900_000  * EUR_PLN), //  16 575 000
        FINALIST:          Math.round(6_100_000  * EUR_PLN), //  25 925 000
        WINNER:            Math.round(5_200_000  * EUR_PLN), //  22 100 000
      },
      CONF: {
        Q1_ADVANCE:        Math.round(75_000     * EUR_PLN), //     318 750
        Q2_ADVANCE:        Math.round(150_000    * EUR_PLN), //     637 500
        GROUP_STAGE_ENTRY: Math.round(3_170_000  * EUR_PLN), //  13 472 500
        WIN:               Math.round(400_000    * EUR_PLN), //   1 700 000
        DRAW:              Math.round(133_000    * EUR_PLN), //     565 250
        KO_PLAYOFF:        Math.round(200_000    * EUR_PLN), //     850 000
        R16:               Math.round(800_000    * EUR_PLN), //   3 400 000
        QF:                Math.round(1_300_000  * EUR_PLN), //   5 525 000
        SF:                Math.round(2_500_000  * EUR_PLN), //  10 625 000
        FINALIST:          Math.round(4_000_000  * EUR_PLN), //  17 000 000
        WINNER:            Math.round(3_000_000  * EUR_PLN), //  12 750 000
      },
    };
    return prizes[competition]?.[event] ?? 0;
  },

  // Premie dla zawodników i sztabu za osiągnięcia — wypłacane z budżetu klubu
  calculateAchievementBonus: (
    achievement: 'CHAMPION' | 'RUNNER_UP' | 'THIRD' | 'FOURTH' | 'PROMOTE_L2_L1' | 'PROMOTE_L3_L2' | 'CUP_WINNER' | 'CUP_FINALIST' | 'CUP_SEMI',
    reputation: number,
    hojnosc: string
  ): number => {
    const BASE_RANGES: Record<string, [number, number]> = {
      CHAMPION:      [1_500_000, 2_500_000],
      RUNNER_UP:     [  800_000, 1_400_000],
      THIRD:         [  500_000,   900_000],
      FOURTH:        [  200_000,   500_000],
      PROMOTE_L2_L1: [  600_000, 1_000_000],
      PROMOTE_L3_L2: [  200_000,   400_000],
      CUP_WINNER:    [  700_000, 1_200_000],
      CUP_FINALIST:  [  200_000,   500_000],
      CUP_SEMI:      [   50_000,   150_000],
    };
    const REP_MULTIPLIER = reputation >= 7 ? 3.0 : reputation >= 4 ? 1.5 : 1.0;
    const HOJNOSC_MULTIPLIER: Record<string, number> = {
      bardzo_wysoka: 2.0,
      wysoka:        1.5,
      przecietna:    1.0,
      niska:         0.6,
      bardzo_niska:  0.3,
    };
    const [min, max] = BASE_RANGES[achievement] ?? [0, 0];
    const base = min + Math.random() * (max - min);
    const hMult = HOJNOSC_MULTIPLIER[hojnosc] ?? 1.0;
    return Math.floor(base * REP_MULTIPLIER * hMult);
  },

  getSponsorCheckProbability: (avg: number): number => {
    const f = Math.floor(Math.max(1, Math.min(20, avg)));
    if (f >= 20) return 0.50;
    if (f === 19) return 0.40;
    if (f === 18) return 0.35;
    if (f === 17) return 0.30;
    if (f === 16) return 0.25;
    if (f === 15) return 0.20;
    if (f === 14) return 0.15;
    if (f === 13) return 0.10;
    if (f === 12) return 0.05;
    if (f === 11) return 0.035;
    if (f === 10) return 0.025;
    if (f === 9)  return 0.018;
    if (f === 8)  return 0.012;
    if (f === 7)  return 0.008;
    if (f === 6)  return 0.005;
    if (f === 5)  return 0.003;
    if (f === 4)  return 0.002;
    if (f === 3)  return 0.001;
    if (f === 2)  return 0.0005;
    return 0.0002;
  },

  getSponsorAmount: (avg: number): number => {
    const MIN = 100_000;
    const MAX = 100_000_000;
    const clamped = Math.max(1, Math.min(20, avg));
    const exponent = 0.5 + (20 - clamped) * 0.175;
    const biasedR = Math.pow(Math.random(), exponent);
    const raw = MIN + (MAX - MIN) * biasedR;
    return Math.round(raw / 100_000) * 100_000;
  },

  getOwnerRescueProbability: (hojnosc: number): number => {
    const h = Math.floor(Math.max(1, Math.min(20, hojnosc)));
    if (h >= 18) return 0.90;
    if (h >= 16) return 0.75;
    if (h >= 14) return 0.60;
    if (h >= 12) return 0.45;
    if (h >= 10) return 0.30;
    if (h >= 8)  return 0.18;
    if (h >= 6)  return 0.10;
    if (h >= 4)  return 0.05;
    if (h >= 2)  return 0.02;
    return 0.01;
  },

  getOwnerRescueBonus: (hojnosc: number): number => {
    const h = Math.max(1, Math.min(20, hojnosc));
    if (Math.random() >= h / 20) return 0;
    const raw = 100_000 + Math.random() * h * 250_000;
    return Math.round(raw / 100_000) * 100_000;
  },

};
