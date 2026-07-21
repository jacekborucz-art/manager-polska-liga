import {
  HealthStatus,
  InjurySeverity,
  Lineup,
  Player,
  PlayerPosition,
} from '../types';
import { TacticRepository } from '../resources/tactics_db';

type MatchSideInjuries = Record<string, InjurySeverity>;

type InjuryChanceImpactArgs = {
  players: Player[];
  lineup: Lineup;
  matchInjuries: MatchSideInjuries;
  mode: 'DEFENDING' | 'ATTACKING';
  rng: () => number;
};

type RotationMismatchArgs = {
  attackingSubsUsed: number;
  defendingSubsUsed: number;
  defendingPlayers: Player[];
  defendingLineup: Lineup;
  defendingFatigue: Record<string, number>;
  rng: () => number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getOverallFactor = (overall: number): number =>
  clamp(0.80 + ((overall - 55) / 25) * 0.40, 0.70, 1.25);

const getRngMultiplier = (rng: () => number): number =>
  0.75 + clamp(rng(), 0, 1) * 0.50;

const getInjurySeverity = (
  player: Player,
  matchInjuries: MatchSideInjuries
): InjurySeverity | null => {
  const liveSeverity = matchInjuries[player.id];
  if (liveSeverity) return liveSeverity;
  if (player.health.status !== HealthStatus.INJURED) return null;
  return player.health.injury?.severity ?? InjurySeverity.LIGHT;
};

const getInjuryRoleBase = (
  role: PlayerPosition,
  mode: 'DEFENDING' | 'ATTACKING'
): number => {
  if (mode === 'DEFENDING') {
    if (role === PlayerPosition.GK) return 0.0175;
    if (role === PlayerPosition.DEF) return 0.0080;
    if (role === PlayerPosition.MID) return 0.0060;
    return 0.0040;
  }

  if (role === PlayerPosition.GK) return 0.0075;
  if (role === PlayerPosition.DEF) return 0.0050;
  if (role === PlayerPosition.MID) return 0.0070;
  return 0.0090;
};

const getTiredRoleBase = (role: PlayerPosition): number => {
  if (role === PlayerPosition.GK) return 0.0075;
  if (role === PlayerPosition.DEF) return 0.0085;
  if (role === PlayerPosition.MID) return 0.0065;
  return 0.0045;
};

export const LiveMatchPhysicalMismatchService = {
  /**
   * Kontuzjowany zawodnik osłabia własną drużynę proporcjonalnie do roli,
   * jakości i ciężkości urazu. DEFENDING oznacza bonus do szans przeciwnika,
   * ATTACKING oznacza spadek szans drużyny kontuzjowanego gracza. Bonus
   * przeciwnika dostaje deterministyczny rozrzut RNG 75–125%.
   */
  getInjuryChanceImpact: ({
    players,
    lineup,
    matchInjuries,
    mode,
    rng,
  }: InjuryChanceImpactArgs): number => {
    const tactic = TacticRepository.getById(lineup.tacticId);
    const playerMap = new Map(players.map(player => [player.id, player]));
    let impact = 0;

    lineup.startingXI.forEach((playerId, slotIdx) => {
      if (!playerId) return;
      const player = playerMap.get(playerId);
      if (!player) return;
      const severity = getInjurySeverity(player, matchInjuries);
      if (!severity) return;

      const role = tactic.slots[slotIdx]?.role ?? player.position;
      const severityFactor = severity === InjurySeverity.SEVERE ? 2.30 : 1;
      impact += getInjuryRoleBase(role, mode) * getOverallFactor(player.overallRating) * severityFactor;
    });

    const rngMultiplier = mode === 'DEFENDING' ? getRngMultiplier(rng) : 1;
    return Math.min(mode === 'DEFENDING' ? 0.055 : 0.040, impact * rngMultiplier);
  },

  /**
   * Świeże nogi zwiększają liczbę szans od momentu, gdy drużyna atakująca
   * wykonała co najmniej dwie zmiany i ma przewagę minimum dwóch zmian.
   * Siłę bonusu wyznacza najbardziej zmęczony rywal, jego rola i OVR,
   * a finalny wynik dostaje deterministyczny rozrzut RNG 75–125%.
   */
  getRotationMismatchAttackBonus: ({
    attackingSubsUsed,
    defendingSubsUsed,
    defendingPlayers,
    defendingLineup,
    defendingFatigue,
    rng,
  }: RotationMismatchArgs): number => {
    const substitutionGap = attackingSubsUsed - defendingSubsUsed;
    if (
      attackingSubsUsed < 2 ||
      substitutionGap < 2
    ) {
      return 0;
    }

    const tactic = TacticRepository.getById(defendingLineup.tacticId);
    const playerMap = new Map(defendingPlayers.map(player => [player.id, player]));
    const activePlayers = defendingLineup.startingXI
      .map((playerId, slotIdx) => {
        if (!playerId) return null;
        const player = playerMap.get(playerId);
        if (!player) return null;
        return {
          player,
          role: tactic.slots[slotIdx]?.role ?? player.position,
          fatigue: defendingFatigue[player.id] ?? 100,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => a.fatigue - b.fatigue);

    const weakest = activePlayers[0];
    if (!weakest || weakest.fatigue >= 84) return 0;

    const fatigueDepth = clamp((84 - weakest.fatigue) / 34, 0, 1);
    const criticalDepth = weakest.fatigue < 70
      ? clamp((70 - weakest.fatigue) / 35, 0, 1)
      : 0;
    const substitutionBonus = Math.min(0.013, 0.004 + Math.max(0, substitutionGap - 2) * 0.003);
    const playerExposure =
      getTiredRoleBase(weakest.role) *
      getOverallFactor(weakest.player.overallRating) *
      (0.35 + fatigueDepth * 0.65 + criticalDepth * 0.35);
    const randomizedBonus = (substitutionBonus + playerExposure) * getRngMultiplier(rng);
    return Math.min(0.026, randomizedBonus);
  },
};
