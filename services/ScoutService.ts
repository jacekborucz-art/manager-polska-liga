import { Scout, ScoutPersonality, Region, PlayerPosition, ClubAcademy, BoardAttributeLevel } from '../types';
import { NameGeneratorService } from './NameGeneratorService';
import { AcademyService } from './AcademyService';

// ── Stałe ────────────────────────────────────────────────────────────────────

const TOTAL_POOL_SIZE = 80;
const MARKET_SIZE = 12;
const MARKET_REFRESH_DAYS = 45;

// Koszt tygodniówki = suma parametrów * mnożnik
const SALARY_PER_POINT = 850; // PLN/tyg na punkt

// Mnożnik skrócenia czasu misji przez reportSpeed (1-20)
// reportSpeed 10 = brak zmiany, 20 = -30% czasu
function speedMultiplier(reportSpeed: number): number {
  return 1.0 - ((reportSpeed - 1) / 19) * 0.30;
}

// Mnożnik kosztu przez networkDepth (1-20)
// networkDepth 10 = brak zmiany, 20 = -20% kosztu
function costMultiplier(networkDepth: number): number {
  return 1.0 - ((networkDepth - 1) / 19) * 0.20;
}

// Personalności — wpływ na generowanie
const PERSONALITIES: ScoutPersonality[] = ['RISK_TAKER', 'CONSERVATIVE', 'VERSATILE', 'AMBITIOUS'];

// Regiony z których mogą pochodzić skauci (non-Polish)
const SCOUT_REGIONS_OTHER: Region[] = [
  Region.GERMANY, Region.FRANCE, Region.IBERIA,
  Region.BALKANS, Region.CZ_SK, Region.HUNGARIAN, Region.EX_USSR,
  Region.ROMANIA, Region.SSA, Region.BRAZIL, Region.ARGENTINA,
];

// 75% skautów pochodzi z Polski, 25% z pozostałych regionów
function pickNationality(rng: () => number): Region {
  return rng() < 0.75 ? Region.POLAND : pick(SCOUT_REGIONS_OTHER, rng);
}

// Minimalna reputacja klubu zależna od jakości skauta
function calcMinReputation(totalStats: number): number {
  if (totalStats >= 65) return 6;
  if (totalStats >= 50) return 4;
  if (totalStats >= 35) return 2;
  return 1;
}

// ── Seeded RNG ────────────────────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed | 0;
  return (): number => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

function rngInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ── Publiczne API ─────────────────────────────────────────────────────────────

export const ScoutService = {

  // Generuje całą bazę skautów przy starcie gry
  generateScoutPool(seed: number): Scout[] {
    const rng = seededRng(seed);
    const scouts: Scout[] = [];

    for (let i = 0; i < TOTAL_POOL_SIZE; i++) {
      const nationality = pickNationality(rng);
      const namePair = NameGeneratorService.getRandomName(nationality);
      const age = rngInt(rng, 28, 62);
      const personality = pick(PERSONALITIES, rng);

      // Parametry bazowe zależne od osobowości
      let judgeBase = rngInt(rng, 3, 18);
      let networkBase = rngInt(rng, 3, 18);
      let speedBase = rngInt(rng, 3, 18);
      let expBase = rngInt(rng, 3, 18);

      // Korekty osobowości
      if (personality === 'RISK_TAKER') { networkBase = Math.min(20, networkBase + rngInt(rng, 2, 5)); judgeBase = Math.max(1, judgeBase - rngInt(rng, 1, 3)); }
      if (personality === 'CONSERVATIVE') { judgeBase = Math.min(20, judgeBase + rngInt(rng, 2, 4)); expBase = Math.min(20, expBase + rngInt(rng, 1, 3)); networkBase = Math.max(1, networkBase - rngInt(rng, 1, 3)); }
      if (personality === 'AMBITIOUS') { judgeBase = Math.min(20, judgeBase + rngInt(rng, 1, 3)); speedBase = Math.min(20, speedBase + rngInt(rng, 1, 2)); }

      // Starsi skauci mają wyższe experience
      if (age >= 50) expBase = Math.min(20, expBase + rngInt(rng, 2, 5));
      if (age <= 35) expBase = Math.max(1, expBase - rngInt(rng, 1, 4));

      // Specjalizacja regionalna — 60% szans na własny region
      const regionalSpecialty: Region | undefined = rng() < 0.60 ? nationality : (rng() < 0.30 ? pick(SCOUT_REGIONS_OTHER, rng) : undefined);

      // Specjalizacja pozycyjna — 40% szans
      const positions = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];
      const positionSpecialty: PlayerPosition | undefined = rng() < 0.40 ? pick(positions, rng) : undefined;

      const totalStats = judgeBase + networkBase + speedBase + expBase;
      const weeklySalary = Math.round(totalStats * SALARY_PER_POINT / 1000) * 1000;

      scouts.push({
        id: `SCOUT_${i}_${Math.floor(rng() * 99999)}`,
        firstName: namePair.firstName,
        lastName: namePair.lastName,
        age,
        nationality,
        judgmentAccuracy: judgeBase,
        networkDepth: networkBase,
        reportSpeed: speedBase,
        experience: expBase,
        regionalSpecialty,
        positionSpecialty,
        personality,
        minClubReputation: calcMinReputation(totalStats),
        weeklySalary,
        employedByClubId: undefined,
        isOnMission: false,
      });
    }

    return scouts;
  },

  // Generuje rynek dostępnych skautów (filtruje po reputacji i zatrudnieniu)
  generateMarket(pool: Scout[], clubReputation: number, boardKompetencja?: BoardAttributeLevel): Scout[] {
    const KOMPETENCJA_SCOUT_OFFSET: Record<BoardAttributeLevel, number> = {
      bardzo_wysoka:  3,
      wysoka:         1,
      przecietna:     0,
      niska:         -1,
      bardzo_niska:  -2,
    };
    const offset = boardKompetencja ? KOMPETENCJA_SCOUT_OFFSET[boardKompetencja] : 0;
    const effectiveSize = Math.max(1, MARKET_SIZE + offset);

    const available = pool.filter(s =>
      !s.employedByClubId &&
      s.minClubReputation <= clubReputation
    );
    // Miesza i bierze pierwszych effectiveSize
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, effectiveSize);
  },

  // Liczba dni do odświeżenia rynku
  getMarketRefreshDays(): number {
    return MARKET_REFRESH_DAYS;
  },

  // Maks. zatrudnionych skautów zależnie od poziomu akademii
  getMaxScouts(academyLevel: ClubAcademy['level']): number {
    return academyLevel; // poziom 1 = 1 skaut, poziom 5 = 5 skautów
  },

  // Oblicza czas misji z uwzględnieniem skauta
  getMissionDays(
    scout: Scout | undefined,
    regionFocus: Region | undefined,
    academyLevel: ClubAcademy['level']
  ): number {
    const baseDays = AcademyService.getScoutMissionDays(regionFocus, academyLevel);
    if (!scout) return baseDays;
    let days = baseDays * speedMultiplier(scout.reportSpeed);
    // Bonus regionalny: -15% dodatkowe
    if (scout.regionalSpecialty && scout.regionalSpecialty === regionFocus) {
      days *= 0.85;
    }
    return Math.max(14, Math.round(days));
  },

  // Oblicza koszt misji z uwzględnieniem skauta
  getMissionCost(
    scout: Scout | undefined,
    regionFocus: Region | undefined,
    academyLevel: ClubAcademy['level']
  ): number {
    const baseCost = AcademyService.getScoutMissionCost(regionFocus, academyLevel);
    if (!scout) return baseCost;
    let cost = baseCost * costMultiplier(scout.networkDepth);
    // Bonus regionalny: -20% dodatkowe
    if (scout.regionalSpecialty && scout.regionalSpecialty === regionFocus) {
      cost *= 0.80;
    }
    return Math.max(3_000, Math.round(cost / 500) * 500);
  },

  // Ocena talentu przez skauta (zamiast poziomu akademii)
  revealTalentWithScout(
    hiddenTalent: number,
    scout: Scout | undefined,
    targetPosition: PlayerPosition | undefined
  ): import('../types').YouthPlayer['revealedTalentRating'] {
    // Bazowy szum: im wyższe judgmentAccuracy + experience, tym mniejszy
    const accuracyStat = scout ? (scout.judgmentAccuracy + scout.experience) / 2 : 5;
    let noise = 20 - accuracyStat * 0.8; // noise: ~20 przy stat=5, ~4 przy stat=20
    // Bonus pozycyjny: zmniejsza szum o 30%
    if (scout?.positionSpecialty && scout.positionSpecialty === targetPosition) {
      noise *= 0.70;
    }
    noise = Math.max(2, noise);
    const perceived = Math.max(0, Math.min(100, hiddenTalent + (Math.random() - 0.5) * noise));
    if (perceived >= 78) return 'EXCEPTIONAL';
    if (perceived >= 62) return 'HIGH';
    if (perceived >= 44) return 'AVERAGE';
    return 'LOW';
  },

  // Etykieta osobowości
  getPersonalityLabel(personality: ScoutPersonality): { label: string; color: string; description: string } {
    switch (personality) {
      case 'RISK_TAKER':    return { label: 'Ryzykant',       color: 'text-orange-400 border-orange-500/40 bg-orange-500/10', description: 'Szuka diamentów — wysoka sieć kontaktów, ale może przegapić przeciętnych' };
      case 'CONSERVATIVE':  return { label: 'Konserwatywny',  color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',       description: 'Niezawodny i dokładny, rzadko się myli, ale nie odkryje geniusza' };
      case 'VERSATILE':     return { label: 'Wszechstronny',  color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', description: 'Brak specjalizacji, ale działa skutecznie wszędzie' };
      case 'AMBITIOUS':     return { label: 'Ambitny',        color: 'text-violet-400 border-violet-500/40 bg-violet-500/10',  description: 'Szybkie raporty i dobra ocena, wymaga lepszego klubu' };
    }
  },

  // Etykieta jakości skauta na podstawie sumy statystyk
  getScoutTier(scout: Scout): { label: string; color: string } {
    const total = scout.judgmentAccuracy + scout.networkDepth + scout.reportSpeed + scout.experience;
    if (total >= 65) return { label: 'Ekspert',       color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' };
    if (total >= 50) return { label: 'Doświadczony',  color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' };
    if (total >= 35) return { label: 'Przeciętny',    color: 'text-slate-300 border-slate-500/40 bg-slate-500/10' };
    return              { label: 'Początkujący',    color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' };
  },
};
