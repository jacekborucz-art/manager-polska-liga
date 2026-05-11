import { Club, Coach, Fixture, HealthStatus, MatchStatus, Player, TrainingIntensity } from '../types';
import { TrainingAssistantService } from './TrainingAssistantService';

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
    sessionSeed: number = 0
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
      const plan = TrainingAssistantService.buildPlan(squad, rng);
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

      updatedPlayers[club.id] = squad.map(player => {
        if (player.health.status === HealthStatus.INJURED) return player;
        const playerLoad = fatigueLoad + Math.round((rng() - 0.5) * 2);
        const nextDebt = clamp((player.fatigueDebt ?? 0) + playerLoad, 0, 100);
        const nextCondition = clamp(player.condition + conditionDelta - Math.max(0, nextDebt - 75) * 0.05, 1, 100 - nextDebt * 0.15);
        return {
          ...player,
          fatigueDebt: Math.round(nextDebt),
          condition: Math.round(nextCondition)
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
