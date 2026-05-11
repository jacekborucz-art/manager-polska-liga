import { Player, PlayerAttributes, MatchSummary, HealthStatus, TrainingIntensity, PlayerPosition, InjurySeverity, Fixture, MatchStatus } from '../types';
import { TRAINING_CYCLES } from '../data/training_definitions_pl';
import { PlayerAttributesGenerator } from './PlayerAttributesGenerator';
import { FinanceService } from './FinanceService';
import { rollInjuryBySeverity } from './InjuryCatalog';

const WEEKLY_TRAINING_INJURY_CHANCE = 0.01;
const TRAINING_SEVERE_INJURY_CHANCE = 0.15;

const dateOnly = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const isWinterHoliday = (date: Date): boolean => {
  const month = date.getMonth();
  const day = date.getDate();
  return (month === 11 && day >= 17) || (month === 0 && day <= 2);
};

const isSummerHolidayForClub = (date: Date, clubId: string, fixtures: Fixture[] = []): boolean => {
  const month = date.getMonth();
  const day = date.getDate();
  const inSummerVacationWindow = month === 4 || (month === 5 && day <= 18);

  if (!inSummerVacationWindow) return false;

  const today = dateOnly(date);
  const vacationEnd = new Date(date.getFullYear(), 5, 18).getTime();
  const hasRemainingClubMatchBeforeVacationEnd = fixtures.some(fixture => {
    const fixtureDate = new Date(fixture.date);
    const fixtureTime = dateOnly(fixtureDate);

    return (
      fixture.status === MatchStatus.SCHEDULED &&
      fixtureTime > today &&
      fixtureTime <= vacationEnd &&
      (fixture.homeTeamId === clubId || fixture.awayTeamId === clubId)
    );
  });

  return !hasRemainingClubMatchBeforeVacationEnd;
};

const isTrainingHolidayForClub = (date: Date, clubId: string, fixtures: Fixture[] = []): boolean =>
  isWinterHoliday(date) || isSummerHolidayForClub(date, clubId, fixtures);

export const TrainingService = {
  processWeeklyTrainingInjuries: (
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    fixtures: Fixture[] = [],
    random: () => number = Math.random
  ): Record<string, Player[]> => {
    const updatedMap = { ...playersMap };

    for (const clubId of Object.keys(updatedMap)) {
      if (isTrainingHolidayForClub(currentDate, clubId, fixtures)) continue;

      updatedMap[clubId] = updatedMap[clubId].map(player => {
        if (player.health.status === HealthStatus.INJURED) return player;
        if (random() >= WEEKLY_TRAINING_INJURY_CHANCE) return player;

        const severity = random() < TRAINING_SEVERE_INJURY_CHANCE
          ? InjurySeverity.SEVERE
          : InjurySeverity.LIGHT;
        const injury = rollInjuryBySeverity(severity, random);
        const basePenalty = severity === InjurySeverity.SEVERE ? 45 : 12;
        const randomExtra = Math.floor(random() * 12);
        const conditionAfterInjury = Math.max(0, player.condition - basePenalty - randomExtra);

        return {
          ...player,
          condition: conditionAfterInjury,
          health: {
            status: HealthStatus.INJURED,
            injury: {
              type: injury.type,
              daysRemaining: injury.days,
              severity,
              injuryDate: currentDate.toISOString(),
              totalDays: injury.days,
              conditionAtInjury: conditionAfterInjury
            }
          }
        };
      });
    }

    return updatedMap;
  },

  /**
   * Main training logic applied after each round.
   */
  processTrainingEffects: (
    playersMap: Record<string, Player[]>,
    userTeamId: string,
    activeTrainingId: string | null,
    lastMatchSummary: MatchSummary | null,
    clubReputation: number,
    leagueTier: number,
    intensity: TrainingIntensity,
    clubCountry?: string
  ): Record<string, Player[]> => {
    const updatedMap = { ...playersMap };
    if (!updatedMap[userTeamId]) return updatedMap;

    const selectedCycle = TRAINING_CYCLES.find(c => c.id === activeTrainingId);
    const hasGeneralPlan = !!selectedCycle;
    const cycle = selectedCycle || TRAINING_CYCLES[0];

    updatedMap[userTeamId] = updatedMap[userTeamId].map(player => {
      const intensityMultiplier =
        intensity === TrainingIntensity.HEAVY ? 1.8 :
        intensity === TrainingIntensity.LIGHT ? 0.5 : 1.0;

      if (player.health.status === HealthStatus.INJURED) {
        return player;
      }

      const updated = { ...player };
      const stats = { ...updated.stats };
      const seasonalChanges = { ...(stats.seasonalChanges || {}) };
      const attributes = { ...updated.attributes };

      const performance =
        lastMatchSummary?.homePlayers.find(p => p.name === player.lastName) ||
        lastMatchSummary?.awayPlayers.find(p => p.name === player.lastName);

      const playedThisRound = !!performance;
      const rating = performance?.rating || 0;

      const attrKeys: (keyof PlayerAttributes)[] = [
        'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
        'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning', 'goalkeeping',
        'freeKicks', 'penalties', 'corners', 'aggression', 'crossing', 'leadership', 'mentality', 'workRate'
      ];

      attrKeys.forEach(key => {
        let pGrowth = 0.02;

        pGrowth *= intensityMultiplier;
        if (hasGeneralPlan && cycle.primaryAttributes.includes(key)) pGrowth += 0.08;
        if (hasGeneralPlan && cycle.secondaryAttributes.includes(key)) pGrowth += 0.04;
        if (player.trainingFocus === key) pGrowth += 0.06;
        if (!hasGeneralPlan) pGrowth *= 0.72;
        if (!player.trainingFocus) pGrowth *= player.age < 24 ? 0.82 : 0.90;

        if (player.age < 21) pGrowth *= 1.5;
        else if (player.age > 32) pGrowth *= 0.3;

        if (playedThisRound) {
          pGrowth += 0.02;
          if (rating >= 7.5) pGrowth += 0.05;
          if (rating >= 9.0) pGrowth += 0.10;
        }

        if (key === 'finishing' && (performance?.goals || 0) > 0) pGrowth += 0.05;
        if (key === 'goalkeeping' && player.position === PlayerPosition.GK && performance && performance.fatigue > 0 && lastMatchSummary) {
          const teamGoalsAgainst =
            player.clubId === lastMatchSummary.homeClub.id ? lastMatchSummary.awayScore : lastMatchSummary.homeScore;
          if (teamGoalsAgainst === 0) pGrowth += 0.05;
        }

        const talentMod = 0.70 + (player.attributes.talent / 100) * 0.60;
        pGrowth *= talentMod;

        if (Math.random() < pGrowth) {
          const currentChange = seasonalChanges[key] || 0;
          if (currentChange < 3 && attributes[key] < 99) {
            attributes[key] += 1;
            seasonalChanges[key] = currentChange + 1;
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

        if (!playedThisRound) {
          if (age >= 32) pRegress += 0.035;
          else if (age >= 28) pRegress += 0.020;
          else if (age >= 24) pRegress += 0.012;
          else pRegress += 0.006;
        }
        if (!hasGeneralPlan) pRegress += 0.004;
        if (!player.trainingFocus) pRegress += player.age < 24 ? 0.004 : 0.002;

        const physicalAttrs = ['pace', 'stamina', 'strength'];
        const mentalAttrs = ['vision', 'leadership', 'mentality', 'workRate', 'positioning'];
        if (physicalAttrs.includes(key as string)) pRegress *= 1.5;
        if (mentalAttrs.includes(key as string)) pRegress *= 0.55;

        if (Math.random() < pRegress) {
          const currentChange = seasonalChanges[key] || 0;
          if (currentChange > -3 && attributes[key] > 10) {
            attributes[key] -= 1;
            seasonalChanges[key] = currentChange - 1;
          }
        }
      });

      const newOvr = PlayerAttributesGenerator.calculateOverall(attributes, player.position);
      const conditionDrift = !hasGeneralPlan && Math.random() < 0.12 ? -1 : 0;
      const fatigueDrift = !hasGeneralPlan && Math.random() < 0.10 ? 1 : 0;
      const updatedMarketValue = FinanceService.calculateMarketValue(
        { ...updated, overallRating: newOvr },
        clubReputation,
        leagueTier,
        clubCountry
      );

      return {
        ...updated,
        attributes,
        overallRating: newOvr,
        condition: Math.max(1, Math.min(100, updated.condition + conditionDrift)),
        fatigueDebt: Math.max(0, Math.min(100, (updated.fatigueDebt ?? 0) + fatigueDrift)),
        stats: {
          ...player.stats,
          ratingHistory: player.stats.ratingHistory || [],
          seasonalChanges
        },
        marketValue: updatedMarketValue
      };
    });

    return updatedMap;
  },

  /**
   * Reserve training managed by the reserve coach.
   */
  processReserveTrainingEffects: (
    reserves: Player[],
    trainingId: string | null,
    coachTrainingAttr: number,
    clubReputation: number,
    leagueTier: number,
    clubCountry?: string
  ): Player[] => {
    const cycle = TRAINING_CYCLES.find(c => c.id === trainingId) || TRAINING_CYCLES[0];
    const coachMultiplier = 0.70 + (coachTrainingAttr / 100) * 0.50;

    return reserves.map(player => {
      if (player.health.status === HealthStatus.INJURED) {
        const totalDays = player.health.injury?.totalDays || player.health.injury?.daysRemaining || 0;
        if (totalDays <= 7) return player;

        const updated = { ...player };
        const stats = { ...updated.stats };
        const seasonalChanges = { ...(stats.seasonalChanges || {}) };
        const attributes = { ...updated.attributes };

        const pRegress = totalDays > 14 ? 0.006 : 0.003;
        const physicalAttrs: (keyof PlayerAttributes)[] = ['pace', 'stamina', 'strength'];

        physicalAttrs.forEach(key => {
          if (Math.random() < pRegress) {
            const currentChange = seasonalChanges[key as string] || 0;
            if (currentChange > -3 && attributes[key] > 10) {
              attributes[key] -= 1;
              seasonalChanges[key as string] = currentChange - 1;
            }
          }
        });

        const newOvr = PlayerAttributesGenerator.calculateOverall(attributes, player.position);
        return {
          ...updated,
          attributes,
          overallRating: newOvr,
          stats: { ...player.stats, ratingHistory: player.stats.ratingHistory || [], seasonalChanges }
        };
      }

      const updated = { ...player };
      const stats = { ...updated.stats };
      const seasonalChanges = { ...(stats.seasonalChanges || {}) };
      const attributes = { ...updated.attributes };

      const attrKeys: (keyof PlayerAttributes)[] = [
        'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
        'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning', 'goalkeeping',
        'freeKicks', 'penalties', 'corners', 'aggression', 'crossing', 'leadership', 'mentality', 'workRate'
      ];

      attrKeys.forEach(key => {
        let pGrowth = 0.015;

        if (cycle.primaryAttributes.includes(key)) pGrowth += 0.08;
        if (cycle.secondaryAttributes.includes(key)) pGrowth += 0.04;
        if (player.trainingFocus === key) pGrowth += 0.06;

        if (player.age < 21) pGrowth *= 2.0;
        else if (player.age > 32) pGrowth *= 0.3;

        const talentMod = 0.70 + (player.attributes.talent / 100) * 0.60;
        pGrowth *= talentMod;
        pGrowth *= coachMultiplier;

        if (Math.random() < pGrowth) {
          const currentChange = seasonalChanges[key] || 0;
          if (currentChange < 3 && attributes[key] < 99) {
            attributes[key] += 1;
            seasonalChanges[key] = currentChange + 1;
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

        if (age >= 32) pRegress += 0.035;
        else if (age >= 28) pRegress += 0.020;
        else if (age >= 24) pRegress += 0.012;
        else pRegress += 0.006;

        const physicalAttrs = ['pace', 'stamina', 'strength'];
        const mentalAttrs = ['vision', 'leadership', 'mentality', 'workRate', 'positioning'];
        if (physicalAttrs.includes(key as string)) pRegress *= 1.5;
        if (mentalAttrs.includes(key as string)) pRegress *= 0.55;

        if (Math.random() < pRegress) {
          const currentChange = seasonalChanges[key] || 0;
          if (currentChange > -3 && attributes[key] > 10) {
            attributes[key] -= 1;
            seasonalChanges[key] = currentChange - 1;
          }
        }
      });

      const newOvr = PlayerAttributesGenerator.calculateOverall(attributes, player.position);
      const updatedMarketValue = FinanceService.calculateMarketValue(
        { ...updated, overallRating: newOvr },
        clubReputation,
        leagueTier,
        clubCountry
      );

      return {
        ...updated,
        attributes,
        overallRating: newOvr,
        stats: {
          ...player.stats,
          ratingHistory: player.stats.ratingHistory || [],
          seasonalChanges
        },
        marketValue: updatedMarketValue
      };
    });
  }
};
