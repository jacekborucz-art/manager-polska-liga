import type { Club, Coach } from '../types';
import type { ClubFormImpact } from './MatchFormService';
import { MATCH_PREP_FOCUSES } from '../data/match_prep_focuses_pl';

const REQUIRED_DAYS = 5;

const seededRng = (seed: number, offset: number): number => {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
};

export const isFocusReady = (club: Club, currentDate: string): boolean => {
  if (!club.matchPrepFocusId || !club.matchPrepFocusStartDate) return false;
  const start = new Date(club.matchPrepFocusStartDate).setHours(0, 0, 0, 0);
  const now = new Date(currentDate).setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now - start) / 86400000);
  return diffDays >= REQUIRED_DAYS;
};

export const getFocusDaysCount = (club: Club, currentDate: string): number => {
  if (!club.matchPrepFocusId || !club.matchPrepFocusStartDate) return 0;
  const start = new Date(club.matchPrepFocusStartDate).setHours(0, 0, 0, 0);
  const now = new Date(currentDate).setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((now - start) / 86400000));
};

// reputation: 1–10, seed: liczba z daty meczu
const calcEffectiveness = (reputation: number, seed: number): number => {
  const qualityFactor = Math.min(1, Math.max(0, (reputation - 1) / 9));
  const base = 0.35 + qualityFactor * 0.65;
  const offset = (seededRng(seed, 17) - 0.5) * 0.20;
  return Math.min(1.0, Math.max(0.25, base + offset));
};

export const applyFocusToFormImpact = (
  impact: ClubFormImpact,
  club: Club,
  currentDate: string,
  seed: number,
  applyUnpreparedPenalty = false
): ClubFormImpact => {
  if (!isFocusReady(club, currentDate)) {
    if (!applyUnpreparedPenalty) return impact;
    const hasAnyFocus = !!club.matchPrepFocusId && !!club.matchPrepFocusStartDate;
    const penaltyScale = hasAnyFocus ? 0.55 : 1.0;
    return {
      ...impact,
      score: impact.score - 0.18 * penaltyScale,
      momentumBonus: Math.max(-7, impact.momentumBonus - 1.6 * penaltyScale),
      initiativeModifier: Math.max(-0.026, impact.initiativeModifier - 0.005 * penaltyScale),
      shotModifier: Math.max(-0.013, impact.shotModifier - 0.003 * penaltyScale),
      shotResistanceModifier: Math.max(-0.011, impact.shotResistanceModifier - 0.002 * penaltyScale),
      finishingMultiplier: Math.max(0.95, impact.finishingMultiplier - 0.010 * penaltyScale),
      goalkeepingMultiplier: Math.max(0.955, impact.goalkeepingMultiplier - 0.007 * penaltyScale),
    };
  }
  const focus = MATCH_PREP_FOCUSES.find(f => f.id === club.matchPrepFocusId);
  if (!focus) return impact;

  const eff = calcEffectiveness(club.reputation, seed);

  if (focus.isRecovery) {
    const penalty = 0.005 + seededRng(seed, 77) * focus.recoveryPenaltyMax;
    return {
      ...impact,
      finishingMultiplier: Math.max(0.940, impact.finishingMultiplier - penalty),
    };
  }

  return {
    ...impact,
    finishingMultiplier:    Math.min(1.060, impact.finishingMultiplier    + focus.finishingMultiplierBase    * eff),
    shotModifier:           Math.min(0.020, impact.shotModifier           + focus.shotModifierBase           * eff),
    initiativeModifier:     Math.min(0.035, impact.initiativeModifier     + focus.initiativeModifierBase     * eff),
    shotResistanceModifier: Math.min(0.020, impact.shotResistanceModifier + focus.shotResistanceModifierBase * eff),
    goalkeepingMultiplier:  Math.min(1.050, impact.goalkeepingMultiplier  + focus.goalkeepingMultiplierBase  * eff),
  };
};

// Dla meczów AI — zwraca prosty mnożnik do hGoalLambda/aGoalLambda
export const getAIFocusLambdaBoost = (coach: Coach | null | undefined, seed: number): number => {
  const exp = coach?.attributes?.experience ?? 0;
  const maxBoost = 0.005 + (exp / 20) * 0.010;
  return 1.0 + seededRng(seed, 333) * maxBoost;
};

// Czy fokus regeneracji jest aktywny dla danego klubu
export const isRecoveryFocusReady = (club: Club, currentDate: string): boolean => {
  return club.matchPrepFocusId === 'FOCUS_RECOVERY' && isFocusReady(club, currentDate);
};
