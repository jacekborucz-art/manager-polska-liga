import type { Club, Coach } from '../types';

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const getCoachExpPointsRating = (coach?: Coach | null): number => {
  const expPoints = Math.max(1, Number(coach?.expPoints ?? 1));
  return clamp((Math.log10(expPoints + 1) / Math.log10(501)) * 100, 0, 100);
};

export const CoachPreMatchMoraleService = {
  getEffectiveExperience: (coach?: Coach | null): number => {
    const attributeExperience = clamp(Number(coach?.attributes?.experience ?? 50), 1, 99);
    const expPointsRating = getCoachExpPointsRating(coach);
    return attributeExperience * 0.75 + expPointsRating * 0.25;
  },

  getPreMatchMoraleBonus: (coach?: Coach | null): number => {
    const effectiveExperience = CoachPreMatchMoraleService.getEffectiveExperience(coach);
    return Math.round(clamp(((effectiveExperience - 50) / 50) * 4, -3, 4));
  },

  getEffectivePreMatchMorale: (club: Pick<Club, 'morale'>, coach?: Coach | null): number => {
    const baseMorale = Number(club.morale ?? 50);
    return clamp(baseMorale + CoachPreMatchMoraleService.getPreMatchMoraleBonus(coach), 5, 95);
  },

  getPreMatchMoraleMultiplier: (club: Pick<Club, 'morale'>, coach?: Coach | null): number => {
    const effectiveMorale = CoachPreMatchMoraleService.getEffectivePreMatchMorale(club, coach);
    return clamp(0.94 + (effectiveMorale / 50) * 0.06, 0.94, 1.06);
  },
};
