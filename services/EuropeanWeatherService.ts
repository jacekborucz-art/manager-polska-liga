
import { WeatherSnapshot } from '../types';

type ClimateZone = 'NORTH' | 'ATLANTIC' | 'CONTINENTAL' | 'MEDITERRANEAN' | 'EAST';

const COUNTRY_TO_ZONE: Record<string, ClimateZone> = {
  // Północ
  'NOR': 'NORTH', 'SWE': 'NORTH', 'DEN': 'NORTH', 'FIN': 'NORTH',
  'ISL': 'NORTH', 'FRO': 'NORTH', 'SCO': 'NORTH',
  // Atlantycki
  'ENG': 'ATLANTIC', 'IRL': 'ATLANTIC', 'WAL': 'ATLANTIC', 'NIR': 'ATLANTIC',
  'POR': 'ATLANTIC', 'BEL': 'ATLANTIC', 'NED': 'ATLANTIC', 'FRA': 'ATLANTIC',
  // Kontynentalny
  'GER': 'CONTINENTAL', 'POL': 'CONTINENTAL', 'CZE': 'CONTINENTAL', 'SVK': 'CONTINENTAL',
  'AUT': 'CONTINENTAL', 'SUI': 'CONTINENTAL', 'HUN': 'CONTINENTAL',
  'SRB': 'CONTINENTAL', 'CRO': 'CONTINENTAL', 'BIH': 'CONTINENTAL',
  'MKD': 'CONTINENTAL', 'MNE': 'CONTINENTAL', 'BUL': 'CONTINENTAL', 'SVN': 'CONTINENTAL',
  'UKR': 'CONTINENTAL', 'ROU': 'CONTINENTAL', 'MDA': 'CONTINENTAL',
  'LTU': 'CONTINENTAL', 'LAT': 'CONTINENTAL', 'EST': 'CONTINENTAL',
  'BLR': 'CONTINENTAL',
  // Śródziemnomorski
  'ITA': 'MEDITERRANEAN', 'ESP': 'MEDITERRANEAN', 'GRE': 'MEDITERRANEAN',
  'TUR': 'MEDITERRANEAN', 'CYP': 'MEDITERRANEAN', 'MLT': 'MEDITERRANEAN',
  'AND': 'MEDITERRANEAN', 'GIB': 'MEDITERRANEAN', 'SMR': 'MEDITERRANEAN',
  'ISR': 'MEDITERRANEAN', 'LIB': 'MEDITERRANEAN',
  // Wschód
  'RUS': 'EAST', 'KAZ': 'EAST', 'AZE': 'EAST', 'GEO': 'EAST', 'ARM': 'EAST',
};

// Miesięczny modyfikator goli (0=Styczeń … 11=Grudzień)
// 1.0 = normalnie | < 1.0 = mniej goli (zła pogoda) | > 1.0 = więcej goli (dobre warunki)
const BASE_MODIFIER: Record<ClimateZone, number[]> = {
  NORTH:         [0.82, 0.83, 0.88, 0.95, 1.02, 1.05, 1.05, 1.03, 0.98, 0.92, 0.87, 0.83],
  ATLANTIC:      [0.90, 0.90, 0.93, 0.97, 1.00, 1.02, 1.03, 1.02, 1.00, 0.96, 0.92, 0.90],
  CONTINENTAL:   [0.84, 0.85, 0.90, 0.97, 1.02, 1.04, 1.04, 1.03, 1.00, 0.95, 0.89, 0.85],
  MEDITERRANEAN: [0.96, 0.97, 0.99, 1.02, 1.04, 1.05, 1.05, 1.05, 1.03, 1.01, 0.98, 0.97],
  EAST:          [0.80, 0.81, 0.87, 0.95, 1.01, 1.04, 1.04, 1.02, 0.98, 0.91, 0.85, 0.81],
};

type ZoneMonthCfg = { minT: number; maxT: number; precip: number };

const ZONE_CLIMATE: Record<ClimateZone, ZoneMonthCfg[]> = {
  NORTH:         [{minT:-8,maxT:-2,precip:0.45},{minT:-7,maxT:0,precip:0.40},{minT:-3,maxT:5,precip:0.35},{minT:3,maxT:11,precip:0.35},{minT:8,maxT:17,precip:0.30},{minT:12,maxT:21,precip:0.35},{minT:15,maxT:23,precip:0.40},{minT:14,maxT:22,precip:0.40},{minT:9,maxT:17,precip:0.40},{minT:4,maxT:11,precip:0.45},{minT:-1,maxT:5,precip:0.50},{minT:-5,maxT:0,precip:0.50}],
  ATLANTIC:      [{minT:5,maxT:11,precip:0.55},{minT:5,maxT:12,precip:0.50},{minT:6,maxT:14,precip:0.45},{minT:8,maxT:16,precip:0.40},{minT:11,maxT:19,precip:0.40},{minT:14,maxT:22,precip:0.35},{minT:16,maxT:24,precip:0.30},{minT:16,maxT:24,precip:0.30},{minT:13,maxT:20,precip:0.40},{minT:10,maxT:16,precip:0.50},{minT:7,maxT:12,precip:0.55},{minT:5,maxT:10,precip:0.60}],
  CONTINENTAL:   [{minT:-4,maxT:3,precip:0.38},{minT:-3,maxT:5,precip:0.33},{minT:2,maxT:10,precip:0.30},{minT:7,maxT:16,precip:0.35},{minT:12,maxT:21,precip:0.45},{minT:15,maxT:25,precip:0.50},{minT:17,maxT:27,precip:0.45},{minT:17,maxT:26,precip:0.40},{minT:12,maxT:21,precip:0.35},{minT:7,maxT:14,precip:0.30},{minT:2,maxT:8,precip:0.40},{minT:-2,maxT:4,precip:0.42}],
  MEDITERRANEAN: [{minT:8,maxT:15,precip:0.32},{minT:8,maxT:16,precip:0.28},{minT:11,maxT:19,precip:0.22},{minT:14,maxT:22,precip:0.18},{minT:18,maxT:27,precip:0.12},{minT:22,maxT:31,precip:0.08},{minT:25,maxT:34,precip:0.04},{minT:25,maxT:34,precip:0.05},{minT:21,maxT:30,precip:0.15},{minT:17,maxT:24,precip:0.28},{minT:13,maxT:20,precip:0.32},{minT:9,maxT:15,precip:0.35}],
  EAST:          [{minT:-12,maxT:-5,precip:0.40},{minT:-10,maxT:-3,precip:0.35},{minT:-4,maxT:5,precip:0.30},{minT:5,maxT:14,precip:0.35},{minT:12,maxT:21,precip:0.40},{minT:16,maxT:25,precip:0.45},{minT:18,maxT:28,precip:0.40},{minT:17,maxT:27,precip:0.38},{minT:12,maxT:21,precip:0.35},{minT:5,maxT:13,precip:0.30},{minT:-2,maxT:5,precip:0.38},{minT:-8,maxT:-2,precip:0.42}],
};

export const EuropeanWeatherService = {
  // Zwraca modyfikator liczby goli (0.75 – 1.10) dla kraju gospodarza i daty meczu.
  // randVariation: wartość 0–1 z seededRng — dodaje małą losową wariację ±0.05
  getGoalModifier: (countryCode: string, date: Date, randVariation: number): number => {
    const zone: ClimateZone = COUNTRY_TO_ZONE[countryCode] ?? 'CONTINENTAL';
    const month = date.getMonth(); // 0-11
    const base = BASE_MODIFIER[zone][month];
    return Math.max(0.75, Math.min(1.10, base + (randVariation - 0.5) * 0.10));
  },

  getSnapshot: (countryCode: string, date: Date, seedStr: string): WeatherSnapshot => {
    const zone: ClimateZone = COUNTRY_TO_ZONE[countryCode] ?? 'CONTINENTAL';
    const month = date.getMonth();
    const cfg = ZONE_CLIMATE[zone][month];

    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const r1 = (Math.abs(hash) % 10000) / 10000;
    const r2 = (Math.abs(hash * 1664525 + 1013904223) % 10000) / 10000;
    const r3 = (Math.abs(hash * 22695477 + 1) % 10000) / 10000;

    const tempC = Math.floor(cfg.minT + r2 * (cfg.maxT - cfg.minT));
    const windKmh = Math.floor(r3 * 55);

    let description: string;
    let precipitationChance: number;
    let weatherIntensity: number;

    if (r1 < cfg.precip * 0.10) {
      description = tempC < 1 ? 'Zamieć śnieżna' : 'Burza';
      precipitationChance = 100;
      weatherIntensity = 1.0;
    } else if (r1 < cfg.precip * 0.60) {
      description = tempC < 1 ? 'Intensywne opady śniegu' : 'Ulewny deszcz';
      precipitationChance = 100;
      weatherIntensity = 0.72;
    } else if (r1 < cfg.precip) {
      description = tempC < 1 ? 'Lekki śnieg' : 'Lekki deszcz';
      precipitationChance = 85;
      weatherIntensity = 0.36;
    } else if (windKmh >= 34) {
      description = 'Silny wiatr';
      precipitationChance = 10;
      weatherIntensity = windKmh > 45 ? 0.45 : 0.25;
    } else if (r1 > 0.75) {
      description = 'Zachmurzenie umiarkowane';
      precipitationChance = 0;
      weatherIntensity = 0.05;
    } else {
      description = 'Bezchmurnie';
      precipitationChance = 0;
      weatherIntensity = 0.0;
    }

    return { tempC, precipitationChance, windKmh, description, weatherIntensity };
  },
};
