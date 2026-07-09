import { HealthStatus, Player, PlayerPosition, PlayerStats, TrainingIntensity } from '../types';

export type PlayerFormLevel = 'VERY_HIGH' | 'RISING' | 'STABLE' | 'FALLING' | 'VERY_LOW';

export interface PlayerFormInfo {
  score: number;
  level: PlayerFormLevel;
  label: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const average = (values: number[]): number | null =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

const emptyStats = (): PlayerStats => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: [],
});

const combineStats = (player: Player): PlayerStats => {
  const groups = [player.stats, player.cupStats, player.euroStats, player.friendlyStats, player.nationalStats].filter(Boolean) as PlayerStats[];

  return groups.reduce<PlayerStats>((acc, stats) => ({
    ...acc,
    goals: acc.goals + (stats.goals ?? 0),
    assists: acc.assists + (stats.assists ?? 0),
    yellowCards: acc.yellowCards + (stats.yellowCards ?? 0),
    redCards: acc.redCards + (stats.redCards ?? 0),
    cleanSheets: acc.cleanSheets + (stats.cleanSheets ?? 0),
    matchesPlayed: acc.matchesPlayed + (stats.matchesPlayed ?? 0),
    minutesPlayed: acc.minutesPlayed + (stats.minutesPlayed ?? 0),
    ratingHistory: [...acc.ratingHistory, ...(stats.ratingHistory ?? [])],
  }), emptyStats());
};

const getOutputBonus = (player: Player, stats: PlayerStats): number => {
  const matches = Math.max(1, stats.matchesPlayed || 0);
  const goalsPerMatch = (stats.goals ?? 0) / matches;
  const assistsPerMatch = (stats.assists ?? 0) / matches;
  const contributionsPerMatch = ((stats.goals ?? 0) + (stats.assists ?? 0)) / matches;
  const cleanSheetRate = (stats.cleanSheets ?? 0) / matches;

  if ((stats.matchesPlayed ?? 0) < 3) return 0;

  if (player.position === PlayerPosition.FWD) {
    return clamp(goalsPerMatch * 20 + assistsPerMatch * 8 - (goalsPerMatch === 0 ? 8 : 0), -10, 14);
  }

  if (player.position === PlayerPosition.MID) {
    return clamp(contributionsPerMatch * 18, -4, 12);
  }

  if (player.position === PlayerPosition.GK) {
    return clamp(cleanSheetRate * 18 - (cleanSheetRate === 0 ? 4 : 0), -8, 14);
  }

  return clamp(contributionsPerMatch * 10, -4, 8);
};

export const PlayerFormService = {
  calculate(player: Player): PlayerFormInfo {
    const stats = combineStats(player);
    const ratings = stats.ratingHistory.filter(rating => typeof rating === 'number' && Number.isFinite(rating));
    const seasonAverage = average(ratings);
    const recent10Ratings = ratings.slice(-10);
    const recentRatings = ratings.slice(-5);
    const recent10Average = average(recent10Ratings);
    const previousRatings = ratings.slice(-10, -5);
    const recentAverage = average(recentRatings);
    const previousAverage = average(previousRatings);
    const goodRatingCount = ratings.filter(rating => rating >= 7.0).length;

    let score = 50;

    if (seasonAverage !== null) {
      score += clamp((seasonAverage - 6.5) * 10, -18, 22);
    }

    if (recent10Average !== null) {
      score += clamp((recent10Average - 6.5) * 14, -22, 28);
    }

    if (recentAverage !== null) {
      score += clamp((recentAverage - 6.5) * 8, -12, 16);
    }

    if (recentAverage !== null && previousAverage !== null) {
      score += clamp((recentAverage - previousAverage) * 10, -10, 10);
    }

    const matches = stats.matchesPlayed ?? 0;
    const minutes = stats.minutesPlayed ?? 0;
    if (matches >= 6) score += 6;
    else if (matches >= 3) score += 3;
    else if (matches === 0) score += 0;
    else score -= 4;

    if (matches > 0) {
      const averageMinutes = minutes / matches;
      if (averageMinutes >= 70 && matches >= 10) score += 6;
      else if (averageMinutes >= 75) score += 5;
      else if (averageMinutes < 35) score -= 6;

      if (matches >= 10 && averageMinutes >= 70 && goodRatingCount >= 10 && (recent10Average ?? seasonAverage ?? 0) >= 7.0) {
        score += 6;
      }
    }

    score += getOutputBonus(player, stats);
    score += clamp(((player.morale ?? 50) - 50) * 0.18, -9, 9);
    if (matches > 0 || recentAverage !== null) score += player.trainingFocus ? 4 : -3;

    if (player.health?.status === HealthStatus.INJURED) score -= 18;
    if ((player.condition ?? 100) < 60) score -= 8;
    if ((player.fatigueDebt ?? 0) > 55) score -= 6;

    return PlayerFormService.getInfo(Math.round(clamp(score, 0, 100)));
  },

  getTrainingIntensityAdjustment(player: Player, intensity: TrainingIntensity): number {
    const attributes = player.attributes;
    const responseScore =
      (attributes.workRate ?? 50) * 0.45 +
      (attributes.mentality ?? 50) * 0.35 +
      (attributes.stamina ?? 50) * 0.20;
    const fatigueDebt = player.fatigueDebt ?? 0;
    const condition = player.condition ?? 100;
    const strainPenalty =
      (fatigueDebt >= 70 ? 5 : fatigueDebt >= 55 ? 3 : fatigueDebt >= 40 ? 1 : 0) +
      (condition < 55 ? 5 : condition < 68 ? 3 : condition < 78 ? 1 : 0);

    if (intensity === TrainingIntensity.HEAVY) {
      let adjustment = 0;
      if (responseScore >= 82) adjustment = 6;
      else if (responseScore >= 72) adjustment = 4;
      else if (responseScore >= 62) adjustment = 2;
      else if (responseScore < 45) adjustment = -6;
      else if (responseScore < 55) adjustment = -3;

      return clamp(adjustment - strainPenalty, -9, 7);
    }

    if (intensity === TrainingIntensity.LIGHT) {
      if (fatigueDebt >= 55 || condition < 68) return 4;
      if (responseScore >= 78 && condition >= 82) return -1;
      return 0;
    }

    if (responseScore >= 76 && condition >= 75 && fatigueDebt <= 45) return 1;
    if (condition < 60 || fatigueDebt >= 70) return -2;
    return 0;
  },

  withUpdatedForm<T extends Player>(player: T, adjustment: number = 0): T {
    return {
      ...player,
      form: PlayerFormService.getInfo(PlayerFormService.calculate(player).score + adjustment).score,
    };
  },

  getInfo(score: number = 50): PlayerFormInfo {
    const safeScore = Math.round(clamp(score, 0, 100));

    if (safeScore >= 90) {
      return {
        score: safeScore,
        level: 'VERY_HIGH',
        label: 'Bardzo wysoka',
        colorClass: 'text-emerald-300',
        borderClass: 'border-emerald-400/35',
        bgClass: 'bg-emerald-500/12',
      };
    }

    if (safeScore >= 51) {
      return {
        score: safeScore,
        level: 'RISING',
        label: 'Wysoka / wzrastająca',
        colorClass: 'text-lime-300',
        borderClass: 'border-lime-400/35',
        bgClass: 'bg-lime-500/12',
      };
    }

    if (safeScore >= 40) {
      return {
        score: safeScore,
        level: 'STABLE',
        label: 'Stabilna',
        colorClass: 'text-slate-200',
        borderClass: 'border-slate-300/25',
        bgClass: 'bg-slate-400/10',
      };
    }

    if (safeScore >= 11) {
      return {
        score: safeScore,
        level: 'FALLING',
        label: 'Spadająca',
        colorClass: 'text-orange-300',
        borderClass: 'border-orange-400/35',
        bgClass: 'bg-orange-500/12',
      };
    }

    return {
      score: safeScore,
      level: 'VERY_LOW',
      label: 'Bardzo niska',
      colorClass: 'text-red-300',
      borderClass: 'border-red-400/35',
      bgClass: 'bg-red-500/12',
    };
  },
};
