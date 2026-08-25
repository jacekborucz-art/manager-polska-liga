import { Lineup, Player } from '../types';
import { PlayerFormService } from './PlayerFormService';

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const average = (values: number[], fallback: number): number =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

const getPlayerForm = (player: Player | undefined): number =>
  player ? (player.form ?? PlayerFormService.calculate(player).score) : 50;

const getPlayersByIds = (players: Player[], ids: Array<string | null | undefined>): Player[] => {
  const playerMap = new Map(players.map(player => [player.id, player]));
  return ids
    .map(id => (id ? playerMap.get(id) : undefined))
    .filter((player): player is Player => !!player);
};

const getBaseFormMultiplier = (form: number): number => {
  const centered = (clamp(form, 0, 100) - 50) / 50;
  const curve = Math.sign(centered) * Math.pow(Math.abs(centered), 1.18);
  return clamp(1 + curve * 0.18, 0.82, 1.18);
};

const getTeamQuality = (players: Player[], lineup: Lineup): number => {
  const starters = getPlayersByIds(players, lineup.startingXI);
  return average(starters.map(player => player.overallRating ?? 50), 50);
};

const getTeamForm = (players: Player[], lineup: Lineup): number => {
  const starters = getPlayersByIds(players, lineup.startingXI);
  const bench = getPlayersByIds(players, lineup.bench ?? []);
  const starterForm = average(starters.map(getPlayerForm), 50);
  const benchForm = average(bench.map(getPlayerForm), starterForm);
  return starterForm * 0.88 + benchForm * 0.12;
};

export interface TeamFormImpactOptions {
  /**
   * European background competitions need a little more room for an in-form
   * underdog to outperform its nominal squad rating. The legacy behaviour is
   * still the default so domestic competitions, live matches and Champions
   * League simulations keep their existing balance.
   */
  preserveUnderdogForm?: boolean;
}

const adjustForQualityGap = (
  ownMultiplier: number,
  ownQuality: number,
  opponentQuality: number,
  options: TeamFormImpactOptions = {}
): number => {
  const qualityGap = Math.abs(ownQuality - opponentQuality);
  const isUnderdog = ownQuality < opponentQuality;
  const isFavorite = ownQuality > opponentQuality;

  if (qualityGap <= 12) return ownMultiplier;

  if (isUnderdog && ownMultiplier > 1) {
    const boost = ownMultiplier - 1;
    // The old curve could retain only 35% of an underdog's positive form.
    // EL/Conference League background matches retain at least 72%, allowing
    // actual form to contribute to an upset without cancelling the quality gap.
    const minimumBoostFactor = options.preserveUnderdogForm ? 0.72 : 0.35;
    const reductionAtTwentyFive = options.preserveUnderdogForm ? 0.28 : 0.45;
    const boostFactor = qualityGap <= 25
      ? 1 - ((qualityGap - 12) / 13) * reductionAtTwentyFive
      : minimumBoostFactor;
    return 1 + boost * boostFactor;
  }

  if (isFavorite && ownMultiplier < 1) {
    const penalty = 1 - ownMultiplier;
    // In the more variable European profile a favorite's poor form is not
    // softened as aggressively. This complements, but does not force, upsets.
    const minimumPenaltyFactor = options.preserveUnderdogForm ? 0.88 : 0.72;
    const reductionAtTwentyFive = options.preserveUnderdogForm ? 0.12 : 0.20;
    const penaltyFactor = qualityGap <= 25
      ? 1 - ((qualityGap - 12) / 13) * reductionAtTwentyFive
      : minimumPenaltyFactor;
    return 1 - penalty * penaltyFactor;
  }

  return ownMultiplier;
};

const getDefenseLeakMultiplier = (opponentMultiplier: number): number => {
  if (opponentMultiplier < 1) return 1 + (1 - opponentMultiplier) * 0.35;
  return 1 - (opponentMultiplier - 1) * 0.16;
};

export interface TeamFormImpact {
  teamForm: number;
  teamQuality: number;
  performanceMultiplier: number;
}

export interface MatchFormImpact {
  home: TeamFormImpact;
  away: TeamFormImpact;
  homeGoalChanceMultiplier: number;
  awayGoalChanceMultiplier: number;
}

export const TeamFormImpactService = {
  getPlayerForm,

  getSelectionFormBonus(player: Player, coachQuality: number): number {
    const form = getPlayerForm(player);
    const awareness = clamp(coachQuality / 100, 0.25, 1);
    const weight = 7 + awareness * 7;
    return clamp(((form - 50) / 50) * weight, -14, 14);
  },

  calculateMatchImpact(
    homePlayers: Player[],
    awayPlayers: Player[],
    homeLineup: Lineup,
    awayLineup: Lineup,
    options: TeamFormImpactOptions = {}
  ): MatchFormImpact {
    const homeQuality = getTeamQuality(homePlayers, homeLineup);
    const awayQuality = getTeamQuality(awayPlayers, awayLineup);
    const homeForm = getTeamForm(homePlayers, homeLineup);
    const awayForm = getTeamForm(awayPlayers, awayLineup);
    const homePerformance = adjustForQualityGap(getBaseFormMultiplier(homeForm), homeQuality, awayQuality, options);
    const awayPerformance = adjustForQualityGap(getBaseFormMultiplier(awayForm), awayQuality, homeQuality, options);
    const homeGoalChanceMultiplier = clamp(homePerformance * getDefenseLeakMultiplier(awayPerformance), 0.72, 1.32);
    const awayGoalChanceMultiplier = clamp(awayPerformance * getDefenseLeakMultiplier(homePerformance), 0.72, 1.32);

    return {
      home: {
        teamForm: homeForm,
        teamQuality: homeQuality,
        performanceMultiplier: homePerformance,
      },
      away: {
        teamForm: awayForm,
        teamQuality: awayQuality,
        performanceMultiplier: awayPerformance,
      },
      homeGoalChanceMultiplier,
      awayGoalChanceMultiplier,
    };
  },
};
