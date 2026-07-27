import { PlayerPosition } from '../../../../types';
import type { CupMatchStats, CupPlayerMatchStats } from './CupMatchTypes';
import { clamp } from './CupMath';

export type CupPlayerRatingInput = {
  entry: CupPlayerMatchStats;
  sideScore: number;
  opponentScore: number;
  teamStats?: CupMatchStats;
  opponentStats?: CupMatchStats;
  finalFatigue?: number;
};

const resultImpact = (sideScore: number, opponentScore: number): number => {
  if (sideScore > opponentScore) return 0.22;
  if (sideScore === opponentScore) return 0.04;
  return -0.16;
};

const minutesImpact = (minutesPlayed: number): number => {
  if (minutesPlayed <= 0) return -6;
  if (minutesPlayed < 15) return -0.22;
  if (minutesPlayed < 30) return -0.08;
  if (minutesPlayed >= 90) return 0.04;
  return 0;
};

const teamControlImpact = (teamStats?: CupMatchStats, opponentStats?: CupMatchStats): number => {
  if (!teamStats || !opponentStats) return 0;

  return clamp(
    (teamStats.xG - opponentStats.xG) * 0.055 +
      (teamStats.shotsOnTarget - opponentStats.shotsOnTarget) * 0.018 +
      (teamStats.corners - opponentStats.corners) * 0.010 -
      teamStats.redCards * 0.035,
    -0.22,
    0.22,
  );
};

const fatigueImpact = (minutesPlayed: number, finalFatigue?: number): number => {
  if (finalFatigue === undefined || minutesPlayed < 45) return 0;
  if (finalFatigue < 25) return -0.14;
  if (finalFatigue < 38) return -0.07;
  if (finalFatigue > 72 && minutesPlayed >= 85) return 0.05;
  return 0;
};

const goalWeight = (entry: CupPlayerMatchStats): number => {
  if (entry.position === PlayerPosition.FWD) return 0.92;
  if (entry.position === PlayerPosition.MID) return 1.05;
  if (entry.position === PlayerPosition.DEF) return 1.20;
  return 1.28;
};

const assistWeight = (entry: CupPlayerMatchStats): number => {
  if (entry.position === PlayerPosition.MID) return 0.62;
  if (entry.position === PlayerPosition.FWD) return 0.48;
  if (entry.position === PlayerPosition.DEF) return 0.58;
  return 0.45;
};

const attackingImpact = (entry: CupPlayerMatchStats): number => {
  const conversionImpact = clamp((entry.goals - entry.xG) * 0.30, -0.45, 0.55);
  const wastePenalty = entry.goals === 0 && entry.xG >= 0.7 ? clamp((entry.xG - 0.55) * 0.22, 0, 0.22) : 0;
  const shotSelectionPenalty = entry.shots >= 4 && entry.shotsOnTarget === 0 ? 0.12 : 0;

  return (
    entry.goals * goalWeight(entry) +
    entry.assists * assistWeight(entry) +
    entry.shotsOnTarget * 0.075 -
    entry.shotsOffTarget * 0.035 +
    Math.min(0.34, entry.xG * 0.14) +
    conversionImpact -
    wastePenalty -
    shotSelectionPenalty +
    entry.posts * 0.05 +
    entry.bars * 0.05
  );
};

const creationImpact = (entry: CupPlayerMatchStats): number =>
  entry.chancesCreated * (entry.position === PlayerPosition.MID ? 0.095 : 0.075) +
  entry.keyPasses * (entry.position === PlayerPosition.MID ? 0.075 : 0.055) +
  entry.foulsWon * 0.035 -
  entry.offsides * 0.055;

const goalkeeperImpact = (entry: CupPlayerMatchStats, opponentScore: number): number => {
  if (entry.position !== PlayerPosition.GK) return 0;

  const shotsFaced = entry.saves + entry.goalsConceded;
  const saveRate = shotsFaced > 0 ? entry.saves / shotsFaced : 1;
  const cleanSheet = entry.minutesPlayed >= 60 && opponentScore === 0 ? 0.38 : 0;

  return (
    entry.saves * 0.17 +
    clamp((saveRate - 0.68) * 0.55, -0.22, 0.28) +
    cleanSheet -
    entry.goalsConceded * 0.22 +
    entry.penaltiesSaved * 0.72
  );
};

const defensiveImpact = (entry: CupPlayerMatchStats, opponentScore: number): number => {
  if (entry.position === PlayerPosition.GK) return 0;

  const cleanSheet =
    opponentScore === 0 && entry.minutesPlayed >= 60
      ? entry.position === PlayerPosition.DEF ? 0.22 : entry.position === PlayerPosition.MID ? 0.08 : 0.02
      : 0;
  const concessionPenalty =
    opponentScore >= 4 && entry.minutesPlayed >= 60
      ? entry.position === PlayerPosition.DEF ? 0.16 : entry.position === PlayerPosition.MID ? 0.08 : 0.03
      : 0;

  return cleanSheet - concessionPenalty;
};

const disciplineImpact = (entry: CupPlayerMatchStats): number =>
  -entry.foulsCommitted * 0.045 -
  entry.yellowCards * 0.32 -
  entry.redCards * 1.22 -
  entry.ownGoals * 0.95 -
  entry.penaltiesMissed * 0.52 +
  entry.penaltiesScored * 0.08;

const healthImpact = (entry: CupPlayerMatchStats): number =>
  -entry.injuriesLight * 0.04 -
  entry.injuriesSevere * 0.12;

export const CupPlayerRatingService = {
  /**
   * Ocena zawodnika jest modelem raportowym, nie generatorem meczu. Korzysta z
   * wyniku, roli, minut, statystyk indywidualnych, jakości okazji, bramkarza,
   * dyscypliny i zmęczenia po meczu.
   */
  calculate: ({
    entry,
    sideScore,
    opponentScore,
    teamStats,
    opponentStats,
    finalFatigue,
  }: CupPlayerRatingInput): number => {
    if (entry.minutesPlayed <= 0) return 0;

    const rating =
      6.0 +
      resultImpact(sideScore, opponentScore) +
      minutesImpact(entry.minutesPlayed) +
      teamControlImpact(teamStats, opponentStats) +
      fatigueImpact(entry.minutesPlayed, finalFatigue) +
      attackingImpact(entry) +
      creationImpact(entry) +
      goalkeeperImpact(entry, opponentScore) +
      defensiveImpact(entry, opponentScore) +
      disciplineImpact(entry) +
      healthImpact(entry);

    return Number(clamp(rating, 1, 10).toFixed(1));
  },
};
