import { Player, PlayerAttributes, MatchSummary, HealthStatus, TrainingIntensity, PlayerPosition, InjurySeverity, Fixture, MatchStatus } from '../types';
import { TRAINING_CYCLES } from '../data/training_definitions_pl';
import { PlayerAttributesGenerator } from './PlayerAttributesGenerator';
import { FinanceService } from './FinanceService';
import { rollInjuryBySeverity } from './InjuryCatalog';
import { PlayerMoraleService } from './PlayerMoraleService';
import { PlayerDevelopmentService } from './PlayerDevelopmentService';

const DAILY_TRAINING_INJURY_CHANCE = 0.005;
const TRAINING_SEVERE_INJURY_CHANCE = 0.15;

const dateOnly = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const getMoraleTrainingModifier = (morale: number = 50): { growth: number; regression: number } => {
  if (morale <= 19) return { growth: 0.45, regression: 2.20 };
  if (morale <= 39) return { growth: 0.65, regression: 1.65 };
  if (morale <= 59) return { growth: 1.00, regression: 1.00 };
  if (morale <= 79) return { growth: 1.08, regression: 0.92 };
  return { growth: 1.15, regression: 0.85 };
};

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
    fitnessCoachQuality?: number,
    userTeamId?: string,
    random: () => number = Math.random
  ): Record<string, Player[]> => {
    const updatedMap = { ...playersMap };

    for (const clubId of Object.keys(updatedMap)) {
      if (isTrainingHolidayForClub(currentDate, clubId, fixtures)) continue;

      const healthyPlayers = updatedMap[clubId].filter(player => player.health.status !== HealthStatus.INJURED);
      const injuryModifier = (userTeamId && clubId === userTeamId) ? (() => {
        if (fitnessCoachQuality === undefined) return 1.15;
        const q = fitnessCoachQuality;
        if (q >= 17) return 0.70 - (q - 17) / 3 * 0.15;
        if (q >= 14) return 0.85 - (q - 14) / 3 * 0.15;
        if (q >= 10) return 1.00 - (q - 10) / 4 * 0.15;
        if (q >= 5)  return 1.08 - (q - 5) / 5 * 0.08;
        return Math.min(1.12, 1.12 - (q - 1) / 4 * 0.04);
      })() : 1.0;
      if (healthyPlayers.length === 0 || random() >= DAILY_TRAINING_INJURY_CHANCE * injuryModifier) continue;

      const injuredPlayerId = healthyPlayers[Math.floor(random() * healthyPlayers.length)]?.id;
      if (!injuredPlayerId) continue;

      updatedMap[clubId] = updatedMap[clubId].map(player => {
        if (player.id !== injuredPlayerId) return player;

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
    clubCountry?: string,
    gkCoachQuality?: number,
    assistantCoachQuality?: number,
    fitnessCoachQuality?: number
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

      const updated = PlayerMoraleService.ensurePlayerState(player);
      const stats = { ...updated.stats };
      const seasonalChanges = { ...(stats.seasonalChanges || {}) };
      let seasonalGrowthPoints = PlayerDevelopmentService.getSeasonalGrowthUsed(
        seasonalChanges,
        stats.seasonalGrowthPoints
      );
      const attributes = { ...updated.attributes };
      const moraleTrainingModifier = getMoraleTrainingModifier(updated.morale);

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

      const isGkPlayer = player.position === PlayerPosition.GK;
      const GK_COACHED_ATTRS: (keyof PlayerAttributes)[] = ['goalkeeping', 'positioning', 'mentality', 'passing'];
      const playerTalent = player.attributes.talent;
      const gkCoachMultiplier = (() => {
        if (!isGkPlayer) return 1.0;
        if (!gkCoachQuality || gkCoachQuality <= 0) {
          if (playerTalent >= 80) return 0.08;
          if (playerTalent >= 60) return 0.05;
          return 0.03;
        }
        const q = gkCoachQuality;
        if (q >= 17) return 1.30 + (q - 17) / 3 * 0.20;
        if (q >= 14) return 1.00 + (q - 14) / 3 * 0.30;
        if (q >= 10) return 0.15 + (q - 10) / 4 * 0.85;
        if (q >= 5)  return 0.08 + (q - 5) / 5 * 0.07;
        return Math.max(0.05, 0.05 + (q - 1) / 4 * 0.03);
      })();
      const gkAttrSeasonalCap = isGkPlayer ? (() => {
        const t = playerTalent;
        const base = t >= 95 ? 3 : t >= 85 ? 2 : t >= 72 ? 1 : 0;
        const coachBonus = (gkCoachQuality && gkCoachQuality >= 15) ? 1 : 0;
        return Math.min(3, base + coachBonus);
      })() : 3;
      const coachGrowthMult = (() => {
        if (assistantCoachQuality === undefined) {
          if (playerTalent >= 80) return 0.08;
          if (playerTalent >= 60) return 0.05;
          if (playerTalent >= 40) return 0.03;
          return 0.02;
        }
        const q = assistantCoachQuality;
        if (q >= 17) return 1.30 + (q - 17) / 3 * 0.20;
        if (q >= 14) return 1.00 + (q - 14) / 3 * 0.30;
        if (q >= 10) return 0.15 + (q - 10) / 4 * 0.85;
        if (q >= 5)  return 0.08 + (q - 5) / 5 * 0.07;
        return Math.max(0.05, 0.05 + (q - 1) / 4 * 0.03);
      })();
      const FITNESS_COACHED_ATTRS: (keyof PlayerAttributes)[] = ['pace', 'stamina', 'strength'];
      const fitnessCoachMult = (() => {
        if (fitnessCoachQuality === undefined) {
          if (playerTalent >= 80) return 0.08;
          if (playerTalent >= 60) return 0.05;
          if (playerTalent >= 40) return 0.03;
          return 0.02;
        }
        const q = fitnessCoachQuality;
        if (q >= 17) return 1.30 + (q - 17) / 3 * 0.20;
        if (q >= 14) return 1.00 + (q - 14) / 3 * 0.30;
        if (q >= 10) return 0.15 + (q - 10) / 4 * 0.85;
        if (q >= 5)  return 0.08 + (q - 5) / 5 * 0.07;
        return Math.max(0.05, 0.05 + (q - 1) / 4 * 0.03);
      })();

      attrKeys.forEach(key => {
        let pGrowth = 0.005;

        pGrowth *= intensityMultiplier;
        if (hasGeneralPlan && cycle.primaryAttributes.includes(key)) pGrowth += 0.05;
        if (hasGeneralPlan && cycle.secondaryAttributes.includes(key)) pGrowth += 0.025;
        if (player.trainingFocus === key) pGrowth += 0.035;
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
        pGrowth *= moraleTrainingModifier.growth;
        pGrowth *= coachGrowthMult;
        if (isGkPlayer && GK_COACHED_ATTRS.includes(key)) pGrowth *= gkCoachMultiplier;
        if (FITNESS_COACHED_ATTRS.includes(key)) pGrowth *= fitnessCoachMult;

        if (Math.random() < pGrowth) {
          const currentChange = seasonalChanges[key] || 0;
          const seasonalCap = (isGkPlayer && GK_COACHED_ATTRS.includes(key)) ? gkAttrSeasonalCap : 3;
          const growthCap = PlayerDevelopmentService.getSeasonalGrowthCap(updated, {
            clubReputation,
            coachQuality: Math.max(assistantCoachQuality ?? 10, fitnessCoachQuality ?? 10, gkCoachQuality ?? 10)
          });
          if (seasonalGrowthPoints < growthCap && currentChange < Math.min(2, seasonalCap) && attributes[key] < 99) {
            attributes[key] += 1;
            seasonalChanges[key] = currentChange + 1;
            seasonalGrowthPoints += 1;
          }
        }

        const age = player.age;
        const mentalAttrs: (keyof PlayerAttributes)[] = ['vision', 'leadership', 'mentality', 'workRate', 'positioning'];

        const relevantCoachQuality: number = (() => {
          if (isGkPlayer && GK_COACHED_ATTRS.includes(key)) return gkCoachQuality ?? 0;
          if (FITNESS_COACHED_ATTRS.includes(key)) return fitnessCoachQuality ?? 0;
          return assistantCoachQuality ?? 0;
        })();
        const expectedCoachLevel = Math.min(20, clubReputation);
        const coachDeficitRatio = expectedCoachLevel > 0
          ? Math.max(0, (expectedCoachLevel - relevantCoachQuality) / expectedCoachLevel)
          : 0;

        let pRegress = 0;

        if (!hasGeneralPlan) pRegress += 0.006;
        if (!player.trainingFocus) pRegress += 0.002;
        if (coachDeficitRatio > 0.3) pRegress += coachDeficitRatio * 0.010;
        if (!playedThisRound) pRegress += 0.005;

        if (age >= 33) {
          const ageDeclineBase = age >= 36 ? 0.025 : age >= 35 ? 0.018 : age >= 34 ? 0.012 : 0.007;
          const clubSlowsDecline =
            clubReputation >= 14 && relevantCoachQuality >= 14 ? 0.50 :
            clubReputation >= 10 && relevantCoachQuality >= 10 ? 0.75 : 1.00;
          pRegress += ageDeclineBase * clubSlowsDecline;
        }

        if (FITNESS_COACHED_ATTRS.includes(key) && age >= 33) pRegress *= 1.30;
        if (mentalAttrs.includes(key)) pRegress *= 0.60;

        const talentProtection = playerTalent >= 80 ? 0.40 : playerTalent >= 65 ? 0.70 : 1.00;
        pRegress *= talentProtection;
        pRegress *= moraleTrainingModifier.regression;

        if (pRegress > 0 && Math.random() < pRegress) {
          const currentChange = seasonalChanges[key] || 0;
          if (currentChange > -3 && attributes[key] > 10) {
            attributes[key] -= 1;
            seasonalChanges[key] = currentChange - 1;
          }
        }
      });

      const newOvr = PlayerAttributesGenerator.calculateOverall(attributes, player.position);
      const fitnessCondDrift = (() => {
        if (fitnessCoachQuality === undefined) return Math.random() < 0.15 ? -1 : 0;
        if (fitnessCoachQuality >= 14) return Math.random() < 0.08 ? 1 : 0;
        if (fitnessCoachQuality >= 10) return 0;
        return Math.random() < 0.08 ? -1 : 0;
      })();
      const fitnessFatigueDrift = (() => {
        if (fitnessCoachQuality === undefined) return Math.random() < 0.12 ? 1 : 0;
        if (fitnessCoachQuality >= 14) return Math.random() < 0.06 ? -1 : 0;
        if (fitnessCoachQuality >= 10) return 0;
        return Math.random() < 0.06 ? 1 : 0;
      })();
      const conditionDrift = (!hasGeneralPlan && Math.random() < 0.12 ? -1 : 0) + fitnessCondDrift;
      const fatigueDrift = (!hasGeneralPlan && Math.random() < 0.10 ? 1 : 0) + fitnessFatigueDrift;
      const moraleDelta = PlayerMoraleService.applyTrainingMood(updated, intensity);
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
        morale: PlayerMoraleService.clamp((updated.morale ?? 50) + moraleDelta),
        condition: Math.max(1, Math.min(100, updated.condition + conditionDrift)),
        fatigueDebt: Math.max(0, Math.min(100, (updated.fatigueDebt ?? 0) + fatigueDrift)),
        stats: {
          ...player.stats,
          ratingHistory: player.stats.ratingHistory || [],
          seasonalChanges,
          seasonalGrowthPoints
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
    playerFocuses: Record<string, string>,
    coachTrainingAttr: number,
    clubReputation: number,
    leagueTier: number,
    clubCountry?: string
  ): Player[] => {
    const cycle = TRAINING_CYCLES.find(c => c.id === trainingId) || TRAINING_CYCLES[0];
    const coachScore = coachTrainingAttr / 100;

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

      const updated = PlayerMoraleService.ensurePlayerState(player);
      const stats = { ...updated.stats };
      const seasonalChanges = { ...(stats.seasonalChanges || {}) };
      let seasonalGrowthPoints = PlayerDevelopmentService.getSeasonalGrowthUsed(
        seasonalChanges,
        stats.seasonalGrowthPoints
      );
      const attributes = { ...updated.attributes };
      const moraleTrainingModifier = getMoraleTrainingModifier(updated.morale);

      const attrKeys: (keyof PlayerAttributes)[] = [
        'strength', 'stamina', 'pace', 'defending', 'passing', 'attacking',
        'finishing', 'technique', 'vision', 'dribbling', 'heading', 'positioning', 'goalkeeping',
        'freeKicks', 'penalties', 'corners', 'aggression', 'crossing', 'leadership', 'mentality', 'workRate'
      ];

      const effectiveFocus = (player.trainingFocus || playerFocuses[player.id]) ?? null;

      attrKeys.forEach(key => {
        let pGrowth = 0.004;

        if (cycle.primaryAttributes.includes(key)) pGrowth += 0.045;
        if (cycle.secondaryAttributes.includes(key)) pGrowth += 0.022;
        if (effectiveFocus === key) pGrowth += 0.032;
        if (!effectiveFocus) pGrowth *= player.age < 24 ? 0.82 : 0.90;

        if (player.age < 21) pGrowth *= 1.5;
        else if (player.age > 32) pGrowth *= 0.3;

        const talentScore = player.attributes.talent / 100;
        const growthMod = Math.max(0, (talentScore * coachScore - 0.10) * 4.0);
        pGrowth *= growthMod;
        pGrowth *= moraleTrainingModifier.growth;

        if (Math.random() < pGrowth) {
          const currentChange = seasonalChanges[key] || 0;
          const growthCap = PlayerDevelopmentService.getSeasonalGrowthCap(updated, {
            clubReputation,
            coachQuality: coachTrainingAttr
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

        if (age >= 32) pRegress += 0.035;
        else if (age >= 28) pRegress += 0.020;
        else if (age >= 24) pRegress += 0.012;
        else pRegress += 0.006;

        const physicalAttrs = ['pace', 'stamina', 'strength'];
        const mentalAttrs = ['vision', 'leadership', 'mentality', 'workRate', 'positioning'];
        if (physicalAttrs.includes(key as string)) pRegress *= 1.5;
        if (mentalAttrs.includes(key as string)) pRegress *= 0.55;
        pRegress *= moraleTrainingModifier.regression;
        pRegress *= (1.55 - coachScore * 0.90);

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
        morale: PlayerMoraleService.clamp((updated.morale ?? 50) + PlayerMoraleService.applyTrainingMood(updated, TrainingIntensity.NORMAL)),
        stats: {
          ...player.stats,
          ratingHistory: player.stats.ratingHistory || [],
          seasonalChanges,
          seasonalGrowthPoints
        },
        marketValue: updatedMarketValue
      };
    });
  }
};
