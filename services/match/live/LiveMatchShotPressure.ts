import { Lineup, Player, PlayerAttributes, PlayerPosition, WeatherSnapshot } from '../../../types';
import { PlayerMoraleService } from '../../PlayerMoraleService';

export type LiveMatchShotFatigueImpact = {
  tiredAttackers: number;
  exhaustedAttackers: number;
  freshDefenders: number;
  criticalFatPenalty: number;
  freshDefBonus: number;
  noRotationShotPenalty: number;
  lateFatigueShotDrag: number;
  fatiguedShotFloor: number;
};

export type LiveMatchShotPressureBreakdown = {
  shotThreshold: number;
  satietyFactor: number;
  moraleDebuffMultiplier: number;
  rainTechniqueModifier: number;
  fatigueImpact: LiveMatchShotFatigueImpact;
};

export type CalculateLiveMatchShotPressureParams = {
  baseShotThreshold: number;
  leads: boolean;
  goalDiff: number;
  satietyRoll: number;
  attackingPlayers: Player[];
  attackingLineup: Lineup;
  defendingPlayers: Player[];
  defendingLineup: Lineup;
  attackingFatigue: Record<string, number>;
  defendingFatigue: Record<string, number>;
  attackingSubsUsed: number;
  defendingSubsUsed: number;
  minute: number;
  weather?: WeatherSnapshot | null;
  moraleNoise: () => number;
  additiveModifier: number;
  minimumFloor?: number;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const getActiveLineupIds = (lineup: Lineup | (string | null)[]): string[] => {
  const ids = Array.isArray(lineup) ? lineup : lineup.startingXI;
  return ids.filter((id): id is string => id !== null);
};

export const getLiveEmergencyKeeperRead = (player: Player | null | undefined): number => {
  if (!player) return 0;
  return (
    player.attributes.goalkeeping * 0.35 +
    player.attributes.positioning * 0.25 +
    player.attributes.mentality * 0.22 +
    player.attributes.strength * 0.18
  );
};

export const calculateLiveShotSatiety = ({
  baseShotThreshold,
  leads,
  goalDiff,
  satietyRoll,
}: {
  baseShotThreshold: number;
  leads: boolean;
  goalDiff: number;
  satietyRoll: number;
}): { threshold: number; satietyFactor: number } => {
  if (!leads || goalDiff < 3) {
    return { threshold: baseShotThreshold, satietyFactor: 1 };
  }

  const satietyWeight = 0.3 + satietyRoll * 0.3;
  const satietyFactor = 1 + (goalDiff - 1) * satietyWeight;
  return {
    threshold: baseShotThreshold / satietyFactor,
    satietyFactor,
  };
};

export const calculateLiveDefendingBiasShotPenalty = (defenseBias: number): number => {
  return (defenseBias / 100) * 0.045;
};

export const calculateLiveNoGoalkeeperShotBonus = (
  defendingLineup: (string | null)[],
  slotZeroPlayer: Player | null | undefined
): number => {
  if (defendingLineup[0] === null) return 0.055;
  if (slotZeroPlayer?.position === PlayerPosition.GK) return 0;
  return 0.031 + clamp((62 - getLiveEmergencyKeeperRead(slotZeroPlayer)) / 45, 0, 1) * 0.017;
};

export const calculateLiveTopStrikerShotBonus = (
  attackingPlayers: Player[],
  attackingLineup: (string | null)[]
): number => {
  const attackingIds = getActiveLineupIds(attackingLineup);
  const topStriker = attackingPlayers
    .filter(player => attackingIds.includes(player.id) && player.position === PlayerPosition.FWD)
    .sort((a, b) => b.attributes.finishing - a.attributes.finishing)[0];

  return topStriker
    ? Math.max(0, ((topStriker.attributes.finishing * PlayerMoraleService.getMatchMultiplier(topStriker)) - 55) / (77 - 55)) * 0.012
    : 0;
};

export const calculateLiveMoraleShotMultiplier = ({
  attackingPlayers,
  attackingLineup,
  moraleNoise,
}: {
  attackingPlayers: Player[];
  attackingLineup: (string | null)[];
  moraleNoise: () => number;
}): number => {
  let moraleTeamPenalty = 0;

  getActiveLineupIds(attackingLineup).forEach(id => {
    const player = attackingPlayers.find(candidate => candidate.id === id);
    if (!player) return;

    const morale = player.morale ?? 50;
    const baseDebuff = morale <= 19 ? 0.097 : morale <= 39 ? 0.062 : 0;
    if (baseDebuff === 0) return;

    const mentalityResistance = (player.attributes.mentality ?? 50) / 100;
    const effectivePenalty = baseDebuff * (1 - mentalityResistance * 0.6);
    const randomNoise = 1 + (moraleNoise() * 0.10 - 0.05);
    moraleTeamPenalty += effectivePenalty * randomNoise;
  });

  return Math.max(0.15, 1 - moraleTeamPenalty);
};

export const calculateLiveRelativeFreshnessShotSwing = (
  attackingAverageFatigue: number,
  defendingAverageFatigue: number
): number => {
  return clamp(((attackingAverageFatigue - defendingAverageFatigue) / 100) * 0.18, -0.026, 0.026);
};

export const calculateLiveIndividualFatigueShotImpact = ({
  minute,
  attackingLineup,
  defendingLineup,
  attackingFatigue,
  defendingFatigue,
  attackingSubsUsed,
  defendingSubsUsed,
}: {
  minute: number;
  attackingLineup: (string | null)[];
  defendingLineup: (string | null)[];
  attackingFatigue: Record<string, number>;
  defendingFatigue: Record<string, number>;
  attackingSubsUsed: number;
  defendingSubsUsed: number;
}): LiveMatchShotFatigueImpact => {
  const attackingIds = getActiveLineupIds(attackingLineup);
  const defendingIds = getActiveLineupIds(defendingLineup);
  const tiredAttackers = attackingIds.filter(id => (attackingFatigue[id] ?? 100) < 82).length;
  const exhaustedAttackers = attackingIds.filter(id => (attackingFatigue[id] ?? 100) < 70).length;
  const freshDefenders = defendingIds.filter(id => (defendingFatigue[id] ?? 100) > 82).length;
  const criticalFatPenalty = Math.min(0.060, tiredAttackers * 0.006 + exhaustedAttackers * 0.010);
  const freshDefBonus = tiredAttackers >= 2 ? Math.min(0.040, freshDefenders * 0.006) : 0;
  const noRotationShotPenalty = minute >= 60 && attackingSubsUsed <= 1
    ? Math.min(
        0.035,
        (2 - attackingSubsUsed) * 0.006 +
        tiredAttackers * 0.004 +
        Math.max(0, defendingSubsUsed - attackingSubsUsed) * 0.004
      ) * Math.min(1, (minute - 60) / 30)
    : 0;
  const lateFatigueShotDrag = minute >= 60
    ? Math.min(0.052, noRotationShotPenalty * 0.75 + criticalFatPenalty * 0.35)
    : 0;
  const fatiguedShotFloor = Math.max(0.055, 0.10 - noRotationShotPenalty - criticalFatPenalty * 0.25);

  return {
    tiredAttackers,
    exhaustedAttackers,
    freshDefenders,
    criticalFatPenalty,
    freshDefBonus,
    noRotationShotPenalty,
    lateFatigueShotDrag,
    fatiguedShotFloor,
  };
};

export const getLiveLineupAttributeAverage = (
  players: Player[],
  lineup: (string | null)[],
  attr: keyof PlayerAttributes
): number => {
  const ids = getActiveLineupIds(lineup);
  const active = players.filter(player => ids.includes(player.id));
  if (active.length === 0) return 60;
  return active.reduce((acc, player) => acc + (player.attributes[attr] as number), 0) / active.length;
};

export const adjustLiveShotThresholdForRainTechnique = ({
  shotThreshold,
  weather,
  attackingTechniqueAverage,
  defendingTechniqueAverage,
}: {
  shotThreshold: number;
  weather?: WeatherSnapshot | null;
  attackingTechniqueAverage: number;
  defendingTechniqueAverage: number;
}): { threshold: number; modifier: number } => {
  if (!weather || weather.precipitationChance <= 40) {
    return { threshold: shotThreshold, modifier: 0 };
  }

  const techniqueGap = defendingTechniqueAverage - attackingTechniqueAverage;
  if (techniqueGap <= 3) {
    return { threshold: shotThreshold, modifier: 0 };
  }

  const rainPenalty = techniqueGap > 10 ? 0.010 : techniqueGap > 6 ? 0.007 : 0.004;
  const rainIntensity = Math.min(1.0, (weather.precipitationChance - 40) / 60);
  const modifier = -(rainPenalty * rainIntensity);
  return {
    threshold: Math.max(0.04, shotThreshold + modifier),
    modifier,
  };
};

/**
 * Match engine migration note
 *
 * What this module does:
 * It gives the live match engine one named place for shot-pressure primitives: satiety after a large
 * lead, defensive compactness, emergency goalkeeper exposure, striker quality, low-morale execution
 * drag, relative freshness, individual fatigue pressure, and rain-vs-technique disruption. These were
 * previously embedded directly in MatchLiveView's minute loop, which made the engine hard to audit.
 *
 * Why it is deliberately conservative:
 * Shot creation is one of the most sensitive parts of the match engine. A tiny threshold change can
 * alter shot volume, goals, highlights, keeper ratings, morale changes, and even league tables. For
 * this migration step the formulas are kept numerically equivalent to the legacy inline code. The goal
 * is to make every contributing force visible and testable before introducing stronger profile-driven
 * changes.
 *
 * How this supports the larger rebuild:
 * Later stages can replace the raw lineup scans with LiveMatchTeamProfile values such as
 * attackingReadiness, defensiveReadiness, transitionReadiness, weather.technicalDifficulty, coach
 * tacticalRead, and moraleMultiplierAverage. Because the current helpers already expose a breakdown,
 * those future changes can be reviewed as explicit football concepts instead of hidden arithmetic.
 */
export const calculateLiveMatchShotPressure = ({
  baseShotThreshold,
  leads,
  goalDiff,
  satietyRoll,
  attackingPlayers,
  attackingLineup,
  defendingPlayers,
  defendingLineup,
  attackingFatigue,
  defendingFatigue,
  attackingSubsUsed,
  defendingSubsUsed,
  minute,
  weather,
  moraleNoise,
  additiveModifier,
  minimumFloor = 0.04,
}: CalculateLiveMatchShotPressureParams): LiveMatchShotPressureBreakdown => {
  const satiety = calculateLiveShotSatiety({
    baseShotThreshold,
    leads,
    goalDiff,
    satietyRoll,
  });
  const moraleDebuffMultiplier = calculateLiveMoraleShotMultiplier({
    attackingPlayers,
    attackingLineup: attackingLineup.startingXI,
    moraleNoise,
  });
  const fatigueImpact = calculateLiveIndividualFatigueShotImpact({
    minute,
    attackingLineup: attackingLineup.startingXI,
    defendingLineup: defendingLineup.startingXI,
    attackingFatigue,
    defendingFatigue,
    attackingSubsUsed,
    defendingSubsUsed,
  });
  const rainAdjusted = adjustLiveShotThresholdForRainTechnique({
    shotThreshold: Math.max(fatigueImpact.fatiguedShotFloor, satiety.threshold + additiveModifier),
    weather,
    attackingTechniqueAverage: getLiveLineupAttributeAverage(attackingPlayers, attackingLineup.startingXI, 'technique'),
    defendingTechniqueAverage: getLiveLineupAttributeAverage(defendingPlayers, defendingLineup.startingXI, 'technique'),
  });

  return {
    shotThreshold: Math.max(minimumFloor, Math.max(fatigueImpact.fatiguedShotFloor, rainAdjusted.threshold * moraleDebuffMultiplier)),
    satietyFactor: satiety.satietyFactor,
    moraleDebuffMultiplier,
    rainTechniqueModifier: rainAdjusted.modifier,
    fatigueImpact,
  };
};
