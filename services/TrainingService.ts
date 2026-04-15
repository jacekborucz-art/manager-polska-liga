import { Player, PlayerAttributes, MatchSummary, HealthStatus, TrainingIntensity, PlayerPosition } from '../types';
import { TRAINING_CYCLES } from '../data/training_definitions_pl';
import { PlayerAttributesGenerator } from './PlayerAttributesGenerator';
import { FinanceService } from './FinanceService';

export const TrainingService = {
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

    const cycle = TRAINING_CYCLES.find(c => c.id === activeTrainingId) || TRAINING_CYCLES[0];

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
        if (cycle.primaryAttributes.includes(key)) pGrowth += 0.08;
        if (cycle.secondaryAttributes.includes(key)) pGrowth += 0.04;
        if (player.trainingFocus === key) pGrowth += 0.06;

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
      if (player.health.status === HealthStatus.INJURED) return player;

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
