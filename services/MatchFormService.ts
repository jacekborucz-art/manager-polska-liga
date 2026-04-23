import type { Coach } from '../types';

type MatchResultChar = 'W' | 'R' | 'P';

export interface ClubFormImpact {
  recent: MatchResultChar[];
  sampleSize: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  score: number;
  momentumBonus: number;
  initiativeModifier: number;
  shotModifier: number;
  shotResistanceModifier: number;
  finishingMultiplier: number;
  goalkeepingMultiplier: number;
  isDeepSlump: boolean;
}

export const NEUTRAL_CLUB_FORM_IMPACT: ClubFormImpact = {
  recent: [],
  sampleSize: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  points: 0,
  score: 0,
  momentumBonus: 0,
  initiativeModifier: 0,
  shotModifier: 0,
  shotResistanceModifier: 0,
  finishingMultiplier: 1,
  goalkeepingMultiplier: 1,
  isDeepSlump: false,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getStreak = (recent: MatchResultChar[], target: MatchResultChar): number => {
  let streak = 0;
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    if (recent[i] !== target) break;
    streak += 1;
  }
  return streak;
};

const getCoachSlumpAdjustment = (coach?: Coach | null): number => {
  const motivation = coach?.attributes?.motivation ?? 50;
  const experience = coach?.attributes?.experience ?? 50;
  const coachControl = (((motivation - 50) * 0.6) + ((experience - 50) * 0.4)) / 50;
  return clamp(1 - coachControl * 0.35, 0.72, 1.24);
};

export const analyzeClubFormImpact = (form: MatchResultChar[] = [], coach?: Coach | null): ClubFormImpact => {
  const recent = form.slice(-5);
  const sampleSize = recent.length;
  if (sampleSize === 0) return NEUTRAL_CLUB_FORM_IMPACT;

  const wins = recent.filter(result => result === 'W').length;
  const draws = recent.filter(result => result === 'R').length;
  const losses = recent.filter(result => result === 'P').length;
  const points = wins * 3 + draws;
  const sampleWeight = clamp(sampleSize / 5, 0, 1);
  const pointsRatio = points / (sampleSize * 3);
  const normalizedPoints = (pointsRatio - 0.5) * 2;
  const resultBalance = (wins - losses) / sampleSize;
  const winStreak = getStreak(recent, 'W');
  const lossStreak = getStreak(recent, 'P');

  let score = normalizedPoints * 0.65 + resultBalance * 0.35;

  if (wins >= 3) score += 0.12 + Math.max(0, wins - 3) * 0.06;
  if (losses >= 3) score -= 0.18 + Math.max(0, losses - 3) * 0.08;
  if (winStreak >= 2) score += Math.min(0.18, (winStreak - 1) * 0.07);
  if (lossStreak >= 2) score -= Math.min(0.24, (lossStreak - 1) * 0.10);
  if (sampleSize === 5 && points <= 2) score -= 0.12;
  if (sampleSize === 5 && points >= 13) score += 0.08;

  score = clamp(score * sampleWeight, -1.25, 1.05);
  if (score < 0) {
    score = clamp(score * getCoachSlumpAdjustment(coach), -1.25, 1.05);
  }

  return {
    recent,
    sampleSize,
    wins,
    draws,
    losses,
    points,
    score,
    momentumBonus: clamp(score * 5.5, -7, 7),
    initiativeModifier: clamp(score * 0.018, -0.026, 0.018),
    shotModifier: clamp(score * 0.009, -0.013, 0.01),
    shotResistanceModifier: clamp(score * 0.008, -0.011, 0.009),
    finishingMultiplier: clamp(1 + score * 0.025, 0.96, 1.03),
    goalkeepingMultiplier: clamp(1 + score * 0.022, 0.965, 1.025),
    isDeepSlump: sampleSize === 5 && losses >= 4,
  };
};
