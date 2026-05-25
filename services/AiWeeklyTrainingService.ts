import { Club, Coach, Fixture, HealthStatus, MatchStatus, Player, PlayerAttributes, TrainingIntensity, StaffMember } from '../types';
import { TrainingAssistantService } from './TrainingAssistantService';
import { PlayerAttributesGenerator } from './PlayerAttributesGenerator';
import { FinanceService } from './FinanceService';
import { PlayerDevelopmentService } from './PlayerDevelopmentService';
import { TRAINING_CYCLES } from '../data/training_definitions_pl';

const DAY_MS = 86_400_000;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const average = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const dateOnly = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const seededRng = (seed: number, offset: number): number => {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
};

const getAiCoachGrowthMult = (q: number): number => {
  if (q >= 17) return 1.30 + (q - 17) / 3 * 0.20;
  if (q >= 14) return 1.00 + (q - 14) / 3 * 0.30;
  if (q >= 10) return 0.15 + (q - 10) / 4 * 0.85;
  if (q >= 5)  return 0.08 + (q - 5) / 5 * 0.07;
  return Math.max(0.05, 0.05 + (q - 1) / 4 * 0.03);
};

const getAiCoachRegressMult = (q: number): number => {
  if (q >= 14) return Math.max(0.65, 1.00 - (q - 14) / 6 * 0.35);
  if (q >= 10) return 1.00 + (14 - q) / 4 * 0.50;
  if (q >= 5)  return 1.50 + (10 - q) / 5 * 0.30;
  return Math.min(2.20, 1.80 + (5 - q) / 4 * 0.40);
};

const getWeekKey = (date: Date): string => {
  const start = new Date(date.getFullYear(), 0, 1);
  const day = Math.floor((dateOnly(date) - dateOnly(start)) / DAY_MS);
  return `${date.getFullYear()}-${Math.floor(day / 7)}`;
};

const getNextFixture = (clubId: string, currentDate: Date, fixtures: Fixture[]): Fixture | null => {
  const today = dateOnly(currentDate);
  return fixtures
    .filter(fixture => {
      if (fixture.status !== MatchStatus.SCHEDULED) return false;
      if (fixture.homeTeamId !== clubId && fixture.awayTeamId !== clubId) return false;
      return dateOnly(new Date(fixture.date)) > today;
    })
    .sort((left, right) => dateOnly(new Date(left.date)) - dateOnly(new Date(right.date)))[0] ?? null;
};

const isWinterHoliday = (date: Date): boolean => {
  const month = date.getMonth();
  const day = date.getDate();
  return (month === 11 && day >= 17) || (month === 0 && day <= 2);
};

const isSummerHolidayForClub = (date: Date, clubId: string, fixtures: Fixture[]): boolean => {
  const month = date.getMonth();
  const day = date.getDate();
  const inSummerVacationWindow = month === 4 || (month === 5 && day <= 18);
  if (!inSummerVacationWindow) return false;

  const today = dateOnly(date);
  const vacationEnd = new Date(date.getFullYear(), 5, 18).getTime();
  return !fixtures.some(fixture => {
    const fixtureTime = dateOnly(new Date(fixture.date));
    return (
      fixture.status === MatchStatus.SCHEDULED &&
      fixtureTime > today &&
      fixtureTime <= vacationEnd &&
      (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId)
    );
  });
};

const isTrainingHoliday = (date: Date, clubId: string, fixtures: Fixture[]): boolean =>
  isWinterHoliday(date) || isSummerHolidayForClub(date, clubId, fixtures);

const pickIntensity = (
  coach: Coach | null,
  squad: Player[],
  daysUntilNextMatch: number | null,
  rng: () => number
): TrainingIntensity => {
  const avgCondition = average(squad.map(player => player.condition));
  const avgFatigueDebt = average(squad.map(player => player.fatigueDebt ?? 0));
  const training = coach?.attributes.training ?? 50;
  const discipline = coach?.attributes.decisionMaking ?? 50;
  const experience = coach?.attributes.experience ?? 50;
  const motivation = coach?.attributes.motivation ?? 50;

  if (avgCondition < 74 || avgFatigueDebt > 28 || (daysUntilNextMatch !== null && daysUntilNextMatch <= 2)) {
    return TrainingIntensity.LIGHT;
  }

  const recklessPush = clamp((motivation + training - discipline - experience) / 120, 0, 0.28);
  const heavyChance = clamp(0.10 + (training - 60) / 160 + recklessPush, 0.04, 0.42);
  if (avgCondition > 82 && avgFatigueDebt < 22 && rng() < heavyChance) {
    return TrainingIntensity.HEAVY;
  }

  return TrainingIntensity.NORMAL;
};

const getValidUntil = (currentDate: Date, nextFixture: Fixture | null): string => {
  const fallback = new Date(dateOnly(currentDate) + 7 * DAY_MS);
  if (!nextFixture) return fallback.toISOString().split('T')[0];

  const nextDate = new Date(nextFixture.date);
  const daysUntil = Math.round((dateOnly(nextDate) - dateOnly(currentDate)) / DAY_MS);
  return (daysUntil <= 10 ? nextDate : fallback).toISOString().split('T')[0];
};

export const AiWeeklyTrainingService = {
  processWeeklyTraining: (
    playersMap: Record<string, Player[]>,
    clubs: Club[],
    coaches: Record<string, Coach>,
    userTeamId: string | null,
    currentDate: Date,
    fixtures: Fixture[],
    sessionSeed: number = 0,
    staffMembers: Record<string, StaffMember> = {}
  ): { updatedPlayers: Record<string, Player[]>; updatedClubs: Club[] } => {
    const weekKey = getWeekKey(currentDate);
    const updatedPlayers = { ...playersMap };
    const updatedClubs = clubs.map((club, clubIndex) => {
      if (club.id === userTeamId) return club;
      if (club.aiWeeklyTraining?.weekKey === weekKey) return club;

      const squad = updatedPlayers[club.id] || [];
      if (squad.length === 0 || isTrainingHoliday(currentDate, club.id, fixtures)) return club;

      const coach = club.coachId ? coaches[club.coachId] ?? null : null;
      const nextFixture = getNextFixture(club.id, currentDate, fixtures);
      const daysUntilNextMatch = nextFixture
        ? Math.round((dateOnly(new Date(nextFixture.date)) - dateOnly(currentDate)) / DAY_MS)
        : null;
      const seed = sessionSeed + currentDate.getTime() / 100000 + clubIndex * 97 + club.id.length * 13;
      let rngOffset = 1;
      const rng = () => seededRng(seed, rngOffset++);

      const aiStaffMembers = (club.staffIds ?? [])
        .map(id => staffMembers[id])
        .filter((s): s is StaffMember => !!s);
      const baseStaffQuality = aiStaffMembers.length > 0
        ? Math.round(
            aiStaffMembers.reduce((sum, s) => {
              const vals = Object.values(s.attributes) as number[];
              return sum + vals.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
            }, 0) / aiStaffMembers.length
          )
        : 10;
      const noise = Math.round((rng() - 0.5) * 10);
      const aiStaffQ = Math.max(1, Math.min(20, baseStaffQuality + noise));

      const plan = TrainingAssistantService.buildPlan(squad, rng);
      const cycle = TRAINING_CYCLES.find(trainingCycle => trainingCycle.id === plan.cycleId) || TRAINING_CYCLES[0];
      const intensity = plan.cycleId === 'T_RECOVERY_YOGA'
        ? TrainingIntensity.LIGHT
        : pickIntensity(coach, squad, daysUntilNextMatch, rng);

      const training = coach?.attributes.training ?? 50;
      const discipline = coach?.attributes.decisionMaking ?? 50;
      const experience = coach?.attributes.experience ?? 50;
      const quality = clamp((training * 0.42 + discipline * 0.33 + experience * 0.25) / 100, 0.10, 0.99);
      const avgCondition = average(squad.map(player => player.condition));
      const avgFatigueDebt = average(squad.map(player => player.fatigueDebt ?? 0));
      const overworkRisk = intensity === TrainingIntensity.HEAVY
        ? clamp((0.62 - quality) + (avgFatigueDebt - 20) / 70 + (78 - avgCondition) / 80, 0, 0.40)
        : 0;
      const overworked = intensity === TrainingIntensity.HEAVY && rng() < overworkRisk;

      const fatigueLoad =
        intensity === TrainingIntensity.HEAVY
          ? (overworked ? 10 : 6)
          : intensity === TrainingIntensity.LIGHT
            ? -7
            : 2;
      const conditionDelta =
        intensity === TrainingIntensity.HEAVY
          ? (overworked ? -5 : -2)
          : intensity === TrainingIntensity.LIGHT
            ? 3
            : 0;

      const intensityPrep =
        intensity === TrainingIntensity.HEAVY
          ? (overworked ? -0.010 : 0.007)
          : intensity === TrainingIntensity.LIGHT
            ? -0.002
            : 0.004;
      const freshnessPenalty = avgCondition < 70 || avgFatigueDebt > 34 ? -0.008 : 0;
      const matchModifier = clamp(1 + (quality - 0.50) * 0.030 + intensityPrep + freshnessPenalty, 0.970, 1.025);

      const leagueTier = parseInt(club.leagueId?.split('_')[2] || '1') || 1;
      const aiGrowthMult = getAiCoachGrowthMult(aiStaffQ);
      const aiRegressMult = getAiCoachRegressMult(aiStaffQ);
      const aiAttrKeys: (keyof PlayerAttributes)[] = [
        'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
        'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning', 'goalkeeping',
        'freeKicks', 'penalties', 'corners', 'aggression', 'crossing', 'leadership', 'mentality', 'workRate'
      ];

      updatedPlayers[club.id] = squad.map(player => {
        if (player.health.status === HealthStatus.INJURED) return player;
        const playerLoad = fatigueLoad + Math.round((rng() - 0.5) * 2);
        const nextDebt = clamp((player.fatigueDebt ?? 0) + playerLoad, 0, 100);
        const nextCondition = clamp(player.condition + conditionDelta - Math.max(0, nextDebt - 75) * 0.05, 1, 100 - nextDebt * 0.15);

        const attributes = { ...player.attributes };
        const stats = { ...player.stats };
        const seasonalChanges = { ...(stats.seasonalChanges || {}) };
        let seasonalGrowthPoints = PlayerDevelopmentService.getSeasonalGrowthUsed(
          seasonalChanges,
          stats.seasonalGrowthPoints
        );
        const playerTalent = player.attributes.talent;

        aiAttrKeys.forEach(key => {
          let pGrowth = 0.004;
          if (cycle.primaryAttributes.includes(key)) pGrowth += 0.035;
          if (cycle.secondaryAttributes.includes(key)) pGrowth += 0.018;
          if (player.age < 21) pGrowth *= 1.5;
          else if (player.age > 32) pGrowth *= 0.3;
          pGrowth *= (0.70 + (playerTalent / 100) * 0.60);
          pGrowth *= aiGrowthMult;

          if (rng() < pGrowth) {
            const currentChange = seasonalChanges[key] || 0;
            const growthCap = PlayerDevelopmentService.getSeasonalGrowthCap(player, {
              clubReputation: club.reputation,
              coachQuality: aiStaffQ
            });
            if (seasonalGrowthPoints < growthCap && currentChange < 2 && attributes[key] < 99) {
              attributes[key] += 1;
              seasonalChanges[key] = currentChange + 1;
              seasonalGrowthPoints += 1;
            }
          }

          let pRegress = 0.003;
          const age = player.age;
          if (age >= 36) pRegress += 0.100;
          else if (age >= 35) pRegress += 0.075;
          else if (age >= 34) pRegress += 0.055;
          else if (age >= 33) pRegress += 0.035;
          else if (age >= 32) pRegress += 0.022;
          else if (age >= 31) pRegress += 0.012;
          else if (age >= 30) pRegress += 0.006;
          if (['pace', 'stamina', 'strength'].includes(key as string)) pRegress *= 1.5;
          if (['vision', 'leadership', 'mentality', 'workRate', 'positioning'].includes(key as string)) pRegress *= 0.55;
          pRegress *= aiRegressMult;

          if (rng() < pRegress) {
            const currentChange = seasonalChanges[key] || 0;
            if (currentChange > -3 && attributes[key] > 10) {
              attributes[key] -= 1;
              seasonalChanges[key] = currentChange - 1;
            }
          }
        });

        const newOvr = PlayerAttributesGenerator.calculateOverall(attributes, player.position);
        const updatedMarketValue = FinanceService.calculateMarketValue(
          { ...player, attributes, overallRating: newOvr },
          club.reputation,
          leagueTier,
          club.country
        );

        return {
          ...player,
          attributes,
          overallRating: newOvr,
          fatigueDebt: Math.round(nextDebt),
          condition: Math.round(nextCondition),
          marketValue: updatedMarketValue,
          stats: { ...player.stats, ratingHistory: player.stats.ratingHistory || [], seasonalChanges, seasonalGrowthPoints }
        };
      });

      return {
        ...club,
        aiWeeklyTraining: {
          weekKey,
          cycleId: plan.cycleId,
          intensity,
          matchModifier,
          fatigueLoad,
          quality: Number(quality.toFixed(3)),
          validUntil: getValidUntil(currentDate, nextFixture)
        }
      };
    });

    return { updatedPlayers, updatedClubs };
  }
};
