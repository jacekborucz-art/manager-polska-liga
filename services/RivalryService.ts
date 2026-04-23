import type { Club } from '../types';
import type { BriefingEffect } from './PreMatchBriefingService';

export type RivalryTier = 'NONE' | 'RIVAL' | 'DERBY' | 'CLASSIC';

export interface RivalryMatchContext {
  tier: RivalryTier;
  label: string | null;
  isRivalry: boolean;
  isDerby: boolean;
  attendanceBoost: number;
  pressureBoost: number;
  briefingBoost: number;
  marqueeBoost: number;
  minimumAttendancePct: number;
}

type RivalryDefinition = {
  clubs: [string, string];
  tier: Exclude<RivalryTier, 'NONE'>;
  label: string;
  attendanceBoost: number;
  pressureBoost: number;
  briefingBoost: number;
  minimumAttendancePct?: number;
};

type RivalryGroup = {
  clubs: string[];
  tier: Exclude<RivalryTier, 'NONE'>;
  label: string;
  attendanceBoost: number;
  pressureBoost: number;
  briefingBoost: number;
  minimumAttendancePct?: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalizeClubName = (value: string): string =>
  value
    .trim()
    .toUpperCase()
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const pairKey = (a: string, b: string) => [normalizeClubName(a), normalizeClubName(b)].sort().join('::');

const directRivalries: RivalryDefinition[] = [
  {
    clubs: ['Legia Warszawa', 'Polonia Warszawa'],
    tier: 'DERBY',
    label: 'DERBY STOLICY',
    attendanceBoost: 0.18,
    pressureBoost: 0.055,
    briefingBoost: 0.20,
    minimumAttendancePct: 0.84,
  },
  {
    clubs: ['Legia Warszawa', 'Lech Poznan'],
    tier: 'CLASSIC',
    label: 'KLASYCZNY HIT',
    attendanceBoost: 0.20,
    pressureBoost: 0.065,
    briefingBoost: 0.24,
    minimumAttendancePct: 0.90,
  },
  {
    clubs: ['Wisla Krakow', 'Cracovia'],
    tier: 'DERBY',
    label: 'DERBY KRAKOWA',
    attendanceBoost: 0.18,
    pressureBoost: 0.055,
    briefingBoost: 0.20,
    minimumAttendancePct: 0.86,
  },
  {
    clubs: ['Wisla Krakow', 'Hutnik Krakow'],
    tier: 'DERBY',
    label: 'DERBY KRAKOWA',
    attendanceBoost: 0.14,
    pressureBoost: 0.045,
    briefingBoost: 0.16,
    minimumAttendancePct: 0.74,
  },
  {
    clubs: ['Cracovia', 'Hutnik Krakow'],
    tier: 'DERBY',
    label: 'DERBY KRAKOWA',
    attendanceBoost: 0.13,
    pressureBoost: 0.040,
    briefingBoost: 0.15,
    minimumAttendancePct: 0.70,
  },
  {
    clubs: ['Lechia Gdansk', 'Arka Gdynia'],
    tier: 'DERBY',
    label: 'DERBY POMORZA',
    attendanceBoost: 0.17,
    pressureBoost: 0.050,
    briefingBoost: 0.18,
    minimumAttendancePct: 0.80,
  },
  {
    clubs: ['Lechia Gdansk', 'Pogon Szczecin'],
    tier: 'DERBY',
    label: 'DERBY POMORZA',
    attendanceBoost: 0.12,
    pressureBoost: 0.034,
    briefingBoost: 0.12,
    minimumAttendancePct: 0.64,
  },
  {
    clubs: ['Arka Gdynia', 'Pogon Szczecin'],
    tier: 'DERBY',
    label: 'DERBY POMORZA',
    attendanceBoost: 0.11,
    pressureBoost: 0.032,
    briefingBoost: 0.11,
    minimumAttendancePct: 0.60,
  },
  {
    clubs: ['Lech Poznan', 'Pogon Szczecin'],
    tier: 'RIVAL',
    label: 'KLASYCZNY MECZ WROGOW',
    attendanceBoost: 0.10,
    pressureBoost: 0.028,
    briefingBoost: 0.10,
    minimumAttendancePct: 0.62,
  },
  {
    clubs: ['Widzew Lodz', 'LKS Lodz'],
    tier: 'DERBY',
    label: 'DERBY LODZI',
    attendanceBoost: 0.18,
    pressureBoost: 0.055,
    briefingBoost: 0.20,
    minimumAttendancePct: 0.86,
  },
];

const rivalryGroups: RivalryGroup[] = [
  {
    clubs: ['Lech Poznan', 'Legia Warszawa', 'Widzew Lodz', 'Gornik Zabrze', 'Pogon Szczecin', 'Wisla Krakow'],
    tier: 'RIVAL',
    label: 'MECZ WROGOW',
    attendanceBoost: 0.08,
    pressureBoost: 0.022,
    briefingBoost: 0.08,
    minimumAttendancePct: 0.58,
  },
  {
    clubs: ['Ruch Chorzow', 'Gornik Zabrze', 'GKS Katowice', 'Piast Gliwice', 'GKS Tychy'],
    tier: 'DERBY',
    label: 'DERBY WIELKIEGO SLASKA',
    attendanceBoost: 0.13,
    pressureBoost: 0.038,
    briefingBoost: 0.14,
    minimumAttendancePct: 0.68,
  },
  {
    clubs: ['Zaglebie Lubin', 'Slask Wroclaw', 'Gornik Zabrze', 'Pogon Szczecin'],
    tier: 'RIVAL',
    label: 'MECZ PODWYZSZONEGO RYZYKA',
    attendanceBoost: 0.07,
    pressureBoost: 0.020,
    briefingBoost: 0.08,
    minimumAttendancePct: 0.54,
  },
  {
    clubs: ['Polonia Warszawa', 'Legia Warszawa', 'Znicz Pruszkow', 'Pogon Siedlce', 'Pogon Grodzisk Mazowiecki', 'Wisla Krakow', 'LKS Lodz', 'Slask Wroclaw', 'Ruch Chorzow', 'Pogon Szczecin'],
    tier: 'RIVAL',
    label: 'MECZ PODWYZSZONEGO RYZYKA',
    attendanceBoost: 0.08,
    pressureBoost: 0.024,
    briefingBoost: 0.10,
    minimumAttendancePct: 0.56,
  },
];

const marqueeClubWeights: Record<string, number> = {
  [normalizeClubName('Legia Warszawa')]: 1.0,
  [normalizeClubName('Lech Poznan')]: 1.0,
  [normalizeClubName('Widzew Lodz')]: 0.78,
  [normalizeClubName('Gornik Zabrze')]: 0.74,
  [normalizeClubName('Jagiellonia Bialystok')]: 0.68,
};

const directRivalryMap = new Map(
  directRivalries.map(def => [pairKey(def.clubs[0], def.clubs[1]), def])
);

const tierPriority: Record<RivalryTier, number> = {
  NONE: 0,
  RIVAL: 1,
  DERBY: 2,
  CLASSIC: 3,
};

const resolveGroupRivalry = (homeName: string, awayName: string): RivalryGroup | null => {
  const normalizedHome = normalizeClubName(homeName);
  const normalizedAway = normalizeClubName(awayName);

  let bestMatch: RivalryGroup | null = null;

  for (const group of rivalryGroups) {
    const normalizedGroup = group.clubs.map(normalizeClubName);
    if (!normalizedGroup.includes(normalizedHome) || !normalizedGroup.includes(normalizedAway)) continue;

    if (!bestMatch || tierPriority[group.tier] > tierPriority[bestMatch.tier]) {
      bestMatch = group;
    }
  }

  return bestMatch;
};

const getMarqueeBoost = (homeName: string, awayName: string): number => {
  const homeWeight = marqueeClubWeights[normalizeClubName(homeName)] ?? 0;
  const awayWeight = marqueeClubWeights[normalizeClubName(awayName)] ?? 0;

  if (homeWeight === 0 && awayWeight === 0) return 0;
  return clamp(homeWeight * 0.022 + awayWeight * 0.030, 0, 0.075);
};

const getContextFromNames = (homeName: string, awayName: string): RivalryMatchContext => {
  const directMatch = directRivalryMap.get(pairKey(homeName, awayName));
  const groupMatch = resolveGroupRivalry(homeName, awayName);
  const baseMatch = directMatch ?? groupMatch;
  const marqueeBoost = getMarqueeBoost(homeName, awayName);

  if (!baseMatch && marqueeBoost <= 0) {
    return {
      tier: 'NONE',
      label: null,
      isRivalry: false,
      isDerby: false,
      attendanceBoost: 0,
      pressureBoost: 0,
      briefingBoost: 0,
      marqueeBoost: 0,
      minimumAttendancePct: 0,
    };
  }

  return {
    tier: baseMatch?.tier ?? 'NONE',
    label: baseMatch?.label ?? (marqueeBoost > 0 ? 'HIT KOLEJKI' : null),
    isRivalry: Boolean(baseMatch),
    isDerby: baseMatch?.tier === 'DERBY' || baseMatch?.tier === 'CLASSIC',
    attendanceBoost: baseMatch?.attendanceBoost ?? 0,
    pressureBoost: baseMatch?.pressureBoost ?? 0,
    briefingBoost: baseMatch?.briefingBoost ?? 0,
    marqueeBoost,
    minimumAttendancePct: baseMatch?.minimumAttendancePct ?? 0,
  };
};

export const RivalryService = {
  normalizeClubName,

  getMatchContext(homeClub: Club, awayClub: Club): RivalryMatchContext {
    return getContextFromNames(homeClub.name, awayClub.name);
  },

  getMatchContextByNames(homeClubName: string, awayClubName: string): RivalryMatchContext {
    return getContextFromNames(homeClubName, awayClubName);
  },

  amplifyBriefingEffect(effect: BriefingEffect, rivalry: RivalryMatchContext): BriefingEffect {
    if (!rivalry.isRivalry) return effect;

    const amp = 1 + rivalry.briefingBoost;
    const fatigueAmp = 1 + rivalry.briefingBoost * 0.8;

    return {
      ...effect,
      actionMod: clamp(effect.actionMod * amp, -0.10, 0.12),
      goalMod: clamp(effect.goalMod * amp, -0.09, 0.11),
      momentumBonus: Math.round(clamp(effect.momentumBonus * amp, -36, 42)),
      fatigueMult: clamp(1 + (effect.fatigueMult - 1) * fatigueAmp, 0.84, 1.18),
      rivalBoost: clamp(effect.rivalBoost + rivalry.pressureBoost * 2.4, -0.10, 1.00),
    };
  },
};
