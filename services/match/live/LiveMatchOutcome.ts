import { MatchEventType } from '../../../types';

export type LiveOpenPlayAttemptDecision = {
  shouldAttempt: boolean;
  reason: 'FORCED_ZERO_SHOT_RESCUE' | 'THRESHOLD_ROLL' | 'NO_ATTEMPT';
};

export type LiveMissedShotOutcomeParams = {
  failRoll: number;
  shotAccuracyRoll: number;
  dangerLabel: 'low' | 'normal' | 'big' | 'clear' | 'chaotic' | string;
  shotOnTargetBoost: number;
};

export const shouldAttemptLiveOpenPlayShot = ({
  forceZeroShotChance,
  eventRoll,
  shotThreshold,
}: {
  forceZeroShotChance: boolean;
  eventRoll: number;
  shotThreshold: number;
}): LiveOpenPlayAttemptDecision => {
  if (forceZeroShotChance) {
    return { shouldAttempt: true, reason: 'FORCED_ZERO_SHOT_RESCUE' };
  }

  if (eventRoll < shotThreshold) {
    return { shouldAttempt: true, reason: 'THRESHOLD_ROLL' };
  }

  return { shouldAttempt: false, reason: 'NO_ATTEMPT' };
};

export const isLiveShotOnTargetEvent = (eventType: MatchEventType): boolean => {
  return eventType !== MatchEventType.SHOT;
};

/**
 * Match engine migration note
 *
 * What this resolver does:
 * It reproduces the legacy non-goal shot classification from MatchLiveView. The initial fail roll
 * chooses between post, bar, one-on-one save, one-on-one miss, save, blocked winger action, generic
 * shot on target, and generic off-target shot. The action profile can then nudge the result based on
 * danger quality and shot-on-target boost.
 *
 * Why this is separate from goal calculation:
 * GoalAttributionService still owns the actual goal-vs-save check because it already combines scorer,
 * goalkeeper, defenders, fatigue, role fit, form, and goalkeeper availability. This module only owns
 * the classification of non-goal outcomes, which is a smaller and safer migration boundary.
 *
 * How to evolve it later:
 * Once golden match ranges exist, this function can accept richer LiveMatchTeamProfile signals:
 * finishing readiness, defensive readiness, goalkeeper line profile, morale multiplier, weather
 * technical difficulty, and coach tactical read. For now it must remain numerically equivalent to the
 * old inline branch so test failures point to real behaviour drift.
 */
export const resolveLiveMissedShotOutcome = ({
  failRoll,
  shotAccuracyRoll,
  dangerLabel,
  shotOnTargetBoost,
}: LiveMissedShotOutcomeParams): MatchEventType => {
  let failType = MatchEventType.SHOT_ON_TARGET;

  if (failRoll < 0.08) failType = MatchEventType.SHOT_POST;
  else if (failRoll < 0.16) failType = MatchEventType.SHOT_BAR;
  else if (failRoll < 0.26) failType = MatchEventType.ONE_ON_ONE_SAVE;
  else if (failRoll < 0.36) failType = MatchEventType.ONE_ON_ONE_MISS;
  else if (failRoll < 0.44) failType = MatchEventType.SAVE;
  else if (failRoll < 0.54) failType = MatchEventType.WINGER_STOPPED;
  else if (failRoll > 0.85) failType = MatchEventType.SHOT;

  if (dangerLabel === 'big' && failType === MatchEventType.SHOT) failType = MatchEventType.ONE_ON_ONE_MISS;
  if (dangerLabel === 'clear' && failType === MatchEventType.WINGER_STOPPED) failType = MatchEventType.SHOT_ON_TARGET;
  if (dangerLabel === 'chaotic' && failType === MatchEventType.SHOT_ON_TARGET) failType = MatchEventType.SHOT;

  if (shotOnTargetBoost > 0 && failType === MatchEventType.SHOT && shotAccuracyRoll < shotOnTargetBoost * 3) {
    failType = MatchEventType.SHOT_ON_TARGET;
  } else if (shotOnTargetBoost < 0 && failType !== MatchEventType.SHOT && shotAccuracyRoll < Math.abs(shotOnTargetBoost) * 2) {
    failType = MatchEventType.SHOT;
  }

  return failType;
};
