import type { Club } from '../types';
import type { BriefingEffect } from './PreMatchBriefingService';
import { directRivalries, rivalryGroups } from './rivalries.data';

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
