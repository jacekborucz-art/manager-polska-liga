import { ManagerProfile } from '../types';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export interface ManagerNegotiationInfluence {
  experience: number;
  normalized: number;
  scoreAdjustment: number;
  chanceAdjustment: number;
  expectationMultiplier: number;
  realisticCeilingBonus: number;
}

const getExperience = (managerProfile?: ManagerProfile | null): number => {
  if (!managerProfile || !Number.isFinite(managerProfile.experience)) return 50;
  return clamp(managerProfile.experience, 1, 99);
};

export const ManagerNegotiationInfluenceService = {
  calculate(managerProfile?: ManagerProfile | null): ManagerNegotiationInfluence {
    const experience = getExperience(managerProfile);
    const normalized = clamp((experience - 50) / 49, -1, 1);

    return {
      experience,
      normalized,
      scoreAdjustment: Math.round(normalized * 8),
      chanceAdjustment: normalized * 0.06,
      expectationMultiplier: clamp(1 - normalized * 0.045, 0.955, 1.045),
      realisticCeilingBonus: normalized * 3.5,
    };
  },
};
