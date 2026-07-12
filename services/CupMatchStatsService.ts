import { MatchEventType, MatchSummaryTeamStats } from '../types';

type RawCupStats = {
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  offsides: number;
};

export const isCupShotEvent = (type: MatchEventType) =>
  type === MatchEventType.GOAL ||
  type === MatchEventType.SHOT ||
  type === MatchEventType.SHOT_ON_TARGET ||
  type === MatchEventType.SHOT_POST ||
  type === MatchEventType.SHOT_BAR ||
  type === MatchEventType.ONE_ON_ONE_GOAL ||
  type === MatchEventType.ONE_ON_ONE_MISS ||
  type === MatchEventType.ONE_ON_ONE_SAVE ||
  type === MatchEventType.PENALTY_SCORED ||
  type === MatchEventType.PENALTY_MISSED;

export const isCupShotOnTargetEvent = (type: MatchEventType) =>
  type === MatchEventType.GOAL ||
  type === MatchEventType.SHOT_ON_TARGET ||
  type === MatchEventType.ONE_ON_ONE_GOAL ||
  type === MatchEventType.ONE_ON_ONE_SAVE ||
  type === MatchEventType.PENALTY_SCORED;

export const buildCupDisplayStats = (
  rawStats: RawCupStats,
  goals: number,
  yellowCards: number,
  redCards: number,
  possession: number,
  seed: number,
  sideOffset: number
): MatchSummaryTeamStats => {
  return ensureCupGoalShotIntegrity({
    ...rawStats,
    shots: rawStats.shots,
    shotsOnTarget: rawStats.shotsOnTarget,
    corners: rawStats.corners,
    fouls: rawStats.fouls,
    offsides: rawStats.offsides,
    yellowCards,
    redCards,
    possession,
  }, goals);
};

export const ensureCupGoalShotIntegrity = (
  stats: MatchSummaryTeamStats,
  goals: number
): MatchSummaryTeamStats => {
  const shotsOnTarget = Math.max(stats.shotsOnTarget, goals);
  const shots = Math.max(stats.shots, shotsOnTarget);
  return {
    ...stats,
    shots,
    shotsOnTarget,
  };
};
