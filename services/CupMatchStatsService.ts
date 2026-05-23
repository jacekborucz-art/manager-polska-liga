import { MatchEventType, MatchSummaryTeamStats } from '../types';

type RawCupStats = {
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  offsides: number;
};

const seededRng = (seed: number, minute: number, offset: number = 0) => {
  const x = Math.sin(seed + minute + offset) * 10000;
  return x - Math.floor(x);
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
  const statRng = (offset: number) => seededRng(seed, 45, sideOffset + offset);
  const shotFloor = goals > 0
    ? goals * (2 + Math.floor(statRng(1) * 3)) + Math.floor(statRng(2) * 3)
    : Math.floor(statRng(2) * 2);
  const shots = Math.max(rawStats.shots, rawStats.shotsOnTarget, goals, shotFloor);
  const shotsOnTarget = Math.min(
    shots,
    Math.max(rawStats.shotsOnTarget, goals, goals > 0 ? Math.floor(shots * (0.32 + statRng(3) * 0.18)) : 0)
  );
  const corners = Math.max(rawStats.corners, goals > 0 ? Math.floor(statRng(4) * 4) : 0);
  const fouls = Math.max(rawStats.fouls, yellowCards * (2 + Math.floor(statRng(5) * 3)) + redCards * 3);

  return ensureCupGoalShotIntegrity({
    ...rawStats,
    shots,
    shotsOnTarget,
    corners,
    fouls,
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
