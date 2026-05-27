import { Lineup, Player, PlayerPosition, Tactic } from '../types';

type ActionInput = {
  attackingPlayers: Player[];
  defendingPlayers: Player[];
  attackingLineup: Lineup;
  defendingLineup: Lineup;
  attackingTactic: Tactic;
  defendingTactic: Tactic;
  attackingFatigue: Record<string, number>;
  defendingFatigue: Record<string, number>;
  scorer: Player;
  assistant?: Player | null;
  isCounterAttack?: boolean;
  rng: () => number;
};

export type MatchActionProfile = {
  quality: number;
  finishingFitMod: number;
  shotOnTargetBoost: number;
  dangerLabel: 'chaotic' | 'normal' | 'clear' | 'big';
  contributions: Record<string, number>;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const avg = (values: number[], fallback = 50) =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

const fatigueMod = (fatigue: number) => clamp(0.72 + (fatigue / 100) * 0.35, 0.72, 1.07);

const getActive = (players: Player[], lineup: Lineup) => {
  const activeIds = new Set(lineup.startingXI.filter((id): id is string => id !== null));
  return players.filter(player => activeIds.has(player.id));
};

const roleScore = (player: Player, fatigueMap: Record<string, number>) => {
  const f = fatigueMod(fatigueMap[player.id] ?? 100);
  switch (player.position) {
    case PlayerPosition.GK:
      return (player.attributes.goalkeeping * 0.70 + player.attributes.positioning * 0.30) * f;
    case PlayerPosition.DEF:
      return (player.attributes.defending * 0.48 + player.attributes.positioning * 0.25 + player.attributes.strength * 0.17 + player.attributes.pace * 0.10) * f;
    case PlayerPosition.MID:
      return (player.attributes.passing * 0.30 + player.attributes.technique * 0.25 + player.attributes.vision * 0.22 + player.attributes.workRate * 0.13 + player.attributes.stamina * 0.10) * f;
    case PlayerPosition.FWD:
      return (player.attributes.finishing * 0.36 + player.attributes.attacking * 0.24 + player.attributes.pace * 0.16 + player.attributes.dribbling * 0.14 + player.attributes.technique * 0.10) * f;
    default:
      return player.overallRating * f;
  }
};

const addContribution = (map: Record<string, number>, playerId: string | undefined, amount: number) => {
  if (!playerId || amount === 0) return;
  map[playerId] = (map[playerId] ?? 0) + amount;
};

export const MatchActionService = {
  evaluateOpenPlayAction: ({
    attackingPlayers,
    defendingPlayers,
    attackingLineup,
    defendingLineup,
    attackingTactic,
    defendingTactic,
    attackingFatigue,
    defendingFatigue,
    scorer,
    assistant,
    isCounterAttack = false,
    rng,
  }: ActionInput): MatchActionProfile => {
    const attackers = getActive(attackingPlayers, attackingLineup);
    const defenders = getActive(defendingPlayers, defendingLineup);
    const attackingMids = attackers.filter(player => player.position === PlayerPosition.MID);
    const attackingForwards = attackers.filter(player => player.position === PlayerPosition.FWD);
    const defendingMids = defenders.filter(player => player.position === PlayerPosition.MID);
    const defendingBacks = defenders.filter(player => player.position === PlayerPosition.DEF);

    const midfieldBuild = avg(attackingMids.map(player =>
      (player.attributes.passing * 0.34 + player.attributes.technique * 0.26 + player.attributes.vision * 0.25 + player.attributes.workRate * 0.15) * fatigueMod(attackingFatigue[player.id] ?? 100)
    ));
    const midfieldPressure = avg(defendingMids.map(player =>
      (player.attributes.defending * 0.32 + player.attributes.positioning * 0.22 + player.attributes.workRate * 0.20 + player.attributes.stamina * 0.14 + player.attributes.aggression * 0.12) * fatigueMod(defendingFatigue[player.id] ?? 100)
    ));

    const progression = avg(attackers.filter(player => player.position !== PlayerPosition.GK).map(player =>
      (player.attributes.pace * 0.20 + player.attributes.dribbling * 0.22 + player.attributes.technique * 0.20 + player.attributes.passing * 0.18 + player.attributes.vision * 0.12 + player.attributes.strength * 0.08) * fatigueMod(attackingFatigue[player.id] ?? 100)
    ));
    const defensiveShape = avg(defenders.filter(player => player.position !== PlayerPosition.GK).map(player =>
      (player.attributes.defending * 0.35 + player.attributes.positioning * 0.25 + player.attributes.strength * 0.15 + player.attributes.pace * 0.12 + player.attributes.mentality * 0.13) * fatigueMod(defendingFatigue[player.id] ?? 100)
    ));

    const creator = assistant ?? attackingMids.sort((a, b) => roleScore(b, attackingFatigue) - roleScore(a, attackingFatigue))[0] ?? scorer;
    const creatorScore = (
      creator.attributes.passing * 0.26 +
      creator.attributes.vision * 0.26 +
      creator.attributes.technique * 0.20 +
      creator.attributes.crossing * 0.14 +
      creator.attributes.dribbling * 0.14
    ) * fatigueMod(attackingFatigue[creator.id] ?? 100);

    const scorerScore = (
      scorer.attributes.finishing * 0.34 +
      scorer.attributes.attacking * 0.22 +
      scorer.attributes.positioning * 0.16 +
      scorer.attributes.technique * 0.12 +
      scorer.attributes.pace * 0.10 +
      scorer.attributes.mentality * 0.06
    ) * fatigueMod(attackingFatigue[scorer.id] ?? 100);

    const bestDefender = defendingBacks.sort((a, b) => roleScore(b, defendingFatigue) - roleScore(a, defendingFatigue))[0];
    const bestDefenderScore = bestDefender ? roleScore(bestDefender, defendingFatigue) : 35;

    const tacticIntent =
      (attackingTactic.attackBias - defendingTactic.defenseBias) * 0.16 +
      (attackingTactic.pressingIntensity - 50) * 0.05 -
      Math.max(0, defendingTactic.defenseBias - 70) * 0.06;
    const counterBoost = isCounterAttack ? 8 + Math.max(0, defendingTactic.attackBias - 55) * 0.12 : 0;
    const randomness = (rng() - 0.5) * 8;

    const rawQuality =
      (midfieldBuild - midfieldPressure) * 0.22 +
      (progression - defensiveShape) * 0.24 +
      (creatorScore - bestDefenderScore) * 0.16 +
      (scorerScore - bestDefenderScore) * 0.18 +
      tacticIntent +
      counterBoost +
      randomness;

    const quality = clamp(1 + rawQuality / 95, 0.72, 1.28);
    const finishingFitMod = clamp(1 + (quality - 1) * 0.20, 0.92, 1.08);
    const shotOnTargetBoost = clamp((quality - 1) * 0.24, -0.08, 0.08);
    const dangerLabel = quality >= 1.18 ? 'big' : quality >= 1.08 ? 'clear' : quality <= 0.86 ? 'chaotic' : 'normal';

    const contributions: Record<string, number> = {};
    addContribution(contributions, scorer.id, 0.10 + Math.max(0, quality - 0.9) * 0.30);
    addContribution(contributions, creator.id, creator.id === scorer.id ? 0.04 : 0.08 + Math.max(0, quality - 1) * 0.18);
    if (bestDefender && quality < 1.04) {
      addContribution(contributions, bestDefender.id, 0.05 + (1.04 - quality) * 0.16);
    }

    return { quality, finishingFitMod, shotOnTargetBoost, dangerLabel, contributions };
  },

  mergeContributions: (base: Record<string, number> | undefined, extra: Record<string, number>) => {
    const merged = { ...(base ?? {}) };
    Object.entries(extra).forEach(([playerId, value]) => {
      merged[playerId] = (merged[playerId] ?? 0) + value;
    });
    return merged;
  },
};
