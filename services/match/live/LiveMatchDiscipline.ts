import { MatchEventType } from '../../../types';

export type LivePenaltyReviewReason = 'FOUL' | 'HAND_BALL';
export type LivePenaltyReviewVerdict = 'PENALTY' | 'NO_PENALTY';

export type LiveFoulThresholdParams = {
  baseFoulChance?: number;
  intensityFoulMultiplier: number;
  pressureCardMultiplier: number;
  rivalryMultiplier: number;
};

export type LivePenaltyIncidentParams = {
  basePenaltyChance?: number;
  intensityPenaltyMultiplier: number;
  pressurePenaltyMultiplier: number;
};

export const calculateLiveFoulThreshold = ({
  baseFoulChance = 0.043,
  intensityFoulMultiplier,
  pressureCardMultiplier,
  rivalryMultiplier,
}: LiveFoulThresholdParams): number => {
  return baseFoulChance * intensityFoulMultiplier * pressureCardMultiplier * rivalryMultiplier;
};

export const shouldTriggerLiveFoul = ({
  forceZeroShotChance,
  eventRoll,
  foulThreshold,
}: {
  forceZeroShotChance: boolean;
  eventRoll: number;
  foulThreshold: number;
}): boolean => {
  return !forceZeroShotChance && eventRoll < foulThreshold;
};

export const calculateLivePenaltyIncidentChance = ({
  basePenaltyChance = 0.0956,
  intensityPenaltyMultiplier,
  pressurePenaltyMultiplier,
}: LivePenaltyIncidentParams): number => {
  return basePenaltyChance * intensityPenaltyMultiplier * pressurePenaltyMultiplier;
};

export const chooseLivePenaltyReviewReason = (roll: number): LivePenaltyReviewReason => {
  return roll < 0.42 ? 'HAND_BALL' : 'FOUL';
};

export const calculateLivePenaltyVarOverturnChance = (refereeDecisionQuality: number): number => {
  return Math.max(0.08, Math.min(0.28, 0.18 - ((refereeDecisionQuality - 50) * 0.0012)));
};

export const resolveLivePenaltyReviewVerdict = ({
  usesVar,
  varRoll,
  varOverturnChance,
}: {
  usesVar: boolean;
  varRoll: number;
  varOverturnChance: number;
}): LivePenaltyReviewVerdict => {
  return usesVar && varRoll < varOverturnChance ? 'NO_PENALTY' : 'PENALTY';
};

export const resolveLivePenaltyReviewCard = ({
  verdict,
  baseCard,
}: {
  verdict: LivePenaltyReviewVerdict;
  baseCard: MatchEventType;
}): MatchEventType => {
  return verdict === 'PENALTY' ? baseCard : MatchEventType.FOUL;
};

export const resolveLiveHandballBaseCard = (roll: number): MatchEventType => {
  return roll < 0.22 ? MatchEventType.YELLOW_CARD : MatchEventType.FOUL;
};

/**
 * Match engine migration note
 *
 * What this module does:
 * It extracts the pure probability decisions for live discipline: normal foul threshold, penalty
 * incident chance, penalty-review reason, VAR overturn chance, penalty-review verdict, and handball
 * card fallback. It does not mutate match state, add logs, remove players, or trigger injury side
 * effects.
 *
 * Why this boundary is intentionally narrow:
 * Discipline is connected to many stateful systems: yellow-card accumulation, red cards, substitutions,
 * tactical AI reactions, injury generation, referee presentation, and penalty overlays. Moving only the
 * arithmetic first keeps behaviour stable while making the coefficients visible and unit-testable.
 *
 * How it should evolve:
 * Later tuning can pass richer inputs such as referee strictness, rivalry heat, player aggression,
 * coach discipline, pressure, fatigue, and weather slipperiness. For now, the helpers preserve the
 * legacy coefficients so the migration remains an architectural improvement rather than a hidden rebalance.
 */
