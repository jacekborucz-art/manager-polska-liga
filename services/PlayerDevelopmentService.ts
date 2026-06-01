import { Player, PlayerAttributes } from '../types';

export interface DevelopmentEnvironment {
  clubReputation?: number;
  coachQuality?: number;
  averageRating?: number | null;
}

const TRAINABLE_ATTRS: (keyof PlayerAttributes)[] = [
  'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
  'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning',
  'goalkeeping', 'freeKicks', 'penalties', 'corners', 'aggression', 'crossing',
  'leadership', 'mentality', 'workRate'
];

const stableUnit = (seed: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

const normalizeClubReputation = (reputation?: number): number => {
  if (reputation === undefined || Number.isNaN(reputation)) return 5;
  return reputation > 20 ? reputation / 10 : reputation;
};

const normalizeCoachQuality = (quality?: number): number => {
  if (quality === undefined || Number.isNaN(quality)) return 10;
  return quality > 20 ? quality / 5 : quality;
};

export const PlayerDevelopmentService = {
  getSeasonalGrowthUsed(seasonalChanges: Record<string, number> = {}, explicitUsed?: number): number {
    if (explicitUsed !== undefined) return Math.max(0, explicitUsed);
    return TRAINABLE_ATTRS.reduce((sum, key) => sum + Math.max(0, seasonalChanges[key] || 0), 0);
  },

  getSeasonalGrowthCap(player: Player, environment: DevelopmentEnvironment = {}): number {
    const talent = player.attributes.talent ?? 50;
    const rep = normalizeClubReputation(environment.clubReputation);
    const coach = normalizeCoachQuality(environment.coachQuality);
    const reserveMatches = player.reserveStats?.matches ?? 0;
    const minutes = (player.stats?.minutesPlayed ?? 0) + reserveMatches * 90;
    const ratingHistory = player.stats?.ratingHistory ?? [];
    const reserveAverageRating = reserveMatches > 0
      ? (player.reserveStats?.totalRatingPoints ?? 0) / reserveMatches
      : null;
    const averageRating = environment.averageRating ?? (
      ratingHistory.length > 0
        ? ratingHistory.reduce((sum, rating) => sum + rating, 0) / ratingHistory.length
        : reserveAverageRating
    );

    let score = 0;

    if (player.age <= 19) score += 0.32;
    else if (player.age <= 21) score += 0.25;
    else if (player.age <= 23) score += 0.16;
    else if (player.age <= 26) score += 0.06;
    else if (player.age >= 33) score -= 0.42;
    else if (player.age >= 30) score -= 0.24;
    else if (player.age >= 28) score -= 0.10;

    if (talent >= 90) score += 0.38;
    else if (talent >= 82) score += 0.28;
    else if (talent >= 74) score += 0.18;
    else if (talent >= 65) score += 0.08;
    else if (talent < 52) score -= 0.16;

    if (rep >= 8.5) score += 0.18;
    else if (rep >= 7) score += 0.10;
    else if (rep <= 3) score -= 0.08;

    if (coach >= 17) score += 0.26;
    else if (coach >= 14) score += 0.16;
    else if (coach >= 11) score += 0.06;
    else if (coach <= 6) score -= 0.12;

    if (minutes >= 2200) score += 0.14;
    else if (minutes >= 1200) score += 0.08;
    else if (minutes < 360 && player.age >= 22) score -= 0.12;

    if (averageRating !== null) {
      if (averageRating >= 7.45) score += 0.14;
      else if (averageRating >= 7.05) score += 0.07;
      else if (averageRating < 6.25) score -= 0.12;
    }

    const destiny = stableUnit(`${player.id}_${player.age}_season_destiny`);
    if (destiny >= 0.94) score += 0.18;
    else if (destiny <= 0.06) score -= 0.18;

    if (score >= 0.92) return 2;
    if (score >= 0.18) return 1;
    return 0;
  },

  canGrowThisSeason(
    player: Player,
    seasonalChanges: Record<string, number>,
    environment: DevelopmentEnvironment = {}
  ): boolean {
    const used = PlayerDevelopmentService.getSeasonalGrowthUsed(
      seasonalChanges,
      player.stats?.seasonalGrowthPoints
    );
    return used < PlayerDevelopmentService.getSeasonalGrowthCap(player, environment);
  },

  recordGrowth(seasonalChanges: Record<string, number>, key: keyof PlayerAttributes, used?: number): {
    seasonalChanges: Record<string, number>;
    seasonalGrowthPoints: number;
  } {
    const currentUsed = used ?? PlayerDevelopmentService.getSeasonalGrowthUsed(seasonalChanges);
    const nextChanges = {
      ...seasonalChanges,
      [key]: (seasonalChanges[key] || 0) + 1
    };
    return {
      seasonalChanges: nextChanges,
      seasonalGrowthPoints: currentUsed + 1
    };
  },

  recordRegression(seasonalChanges: Record<string, number>, key: keyof PlayerAttributes): Record<string, number> {
    return {
      ...seasonalChanges,
      [key]: (seasonalChanges[key] || 0) - 1
    };
  }
};
