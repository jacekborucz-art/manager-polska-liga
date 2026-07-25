import {
  InstructionCounterAttack,
  InstructionIntensity,
  InstructionMindset,
  InstructionMarking,
  InstructionPassing,
  InstructionPressing,
  InstructionTempo,
  Player,
  PlayerLiveInstructions,
  PlayerPosition,
} from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getSelectedPlayers = (
  players: Player[],
  startingXI: (string | null)[],
  positions?: Player['position'][]
) => {
  const ids = new Set(startingXI.filter((id): id is string => id !== null));
  return players.filter(player => ids.has(player.id) && (!positions || positions.includes(player.position)));
};

const getAverage = (
  players: Player[],
  startingXI: (string | null)[],
  attributes: Array<keyof Player['attributes']>,
  positions?: Player['position'][]
) => {
  const selectedPlayers = getSelectedPlayers(players, startingXI, positions);
  if (selectedPlayers.length === 0) return 55;

  return selectedPlayers.reduce((teamSum, player) => {
    const playerAverage = attributes.reduce((sum, attribute) => sum + player.attributes[attribute], 0) / attributes.length;
    return teamSum + playerAverage;
  }, 0) / selectedPlayers.length;
};

const getWeightedAverage = (
  players: Player[],
  startingXI: (string | null)[],
  attributes: Partial<Record<keyof Player['attributes'], number>>,
  positions?: Player['position'][]
) => {
  const positionPlayers = getSelectedPlayers(players, startingXI, positions);
  const selectedPlayers = positionPlayers.length > 0 ? positionPlayers : getSelectedPlayers(players, startingXI);
  if (selectedPlayers.length === 0) return 55;

  const entries = Object.entries(attributes) as Array<[keyof Player['attributes'], number]>;
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  return selectedPlayers.reduce((teamSum, player) => {
    const weightedValue = entries.reduce((sum, [attribute, weight]) => sum + player.attributes[attribute] * weight, 0);
    return teamSum + weightedValue / totalWeight;
  }, 0) / selectedPlayers.length;
};

const getProgressiveModifier = (
  gap: number,
  neutralBand: number,
  maxPositive: number,
  maxNegative: number,
  fullEffectGap: number
) => {
  if (gap > neutralBand) {
    return clamp((gap - neutralBand) / (fullEffectGap - neutralBand), 0, 1) * maxPositive;
  }
  if (gap < -neutralBand) {
    return -clamp((-gap - neutralBand) / (fullEffectGap - neutralBand), 0, 1) * maxNegative;
  }
  return 0;
};

const getInstructionPositionWeight = (
  player: Player,
  key: keyof PlayerLiveInstructions
) => {
  if (key === 'tempo') {
    if (player.position === PlayerPosition.GK) return 0.12;
    if (player.position === PlayerPosition.DEF) return 0.80;
    if (player.position === PlayerPosition.MID) return 1.18;
    return 1.02;
  }
  if (key === 'mindset') {
    if (player.position === PlayerPosition.GK) return 0.10;
    if (player.position === PlayerPosition.DEF) return 0.96;
    if (player.position === PlayerPosition.MID) return 1.08;
    return 1.16;
  }
  if (key === 'passing') {
    if (player.position === PlayerPosition.GK) return 0.36;
    if (player.position === PlayerPosition.DEF) return 0.92;
    if (player.position === PlayerPosition.MID) return 1.30;
    return 0.82;
  }
  if (key === 'marking') {
    if (player.position === PlayerPosition.GK) return 0.08;
    if (player.position === PlayerPosition.DEF) return 1.34;
    if (player.position === PlayerPosition.MID) return 0.92;
    return 0.32;
  }
  if (player.position === PlayerPosition.GK) return 0.04;
  if (player.position === PlayerPosition.DEF) return 0.64;
  if (player.position === PlayerPosition.MID) return 1.08;
  return 1.28;
};

const getInstructionQualityFactor = (
  player: Player,
  key: keyof PlayerLiveInstructions
) => {
  const a = player.attributes;
  let quality = 55;
  if (key === 'tempo') quality = (a.stamina * 0.28) + (a.pace * 0.28) + (a.workRate * 0.24) + (a.mentality * 0.20);
  if (key === 'mindset') quality = (a.mentality * 0.34) + (a.positioning * 0.22) + (a.attacking * 0.22) + (a.defending * 0.22);
  if (key === 'passing') quality = (a.passing * 0.38) + (a.technique * 0.26) + (a.vision * 0.24) + (a.mentality * 0.12);
  if (key === 'pressing') quality = (a.workRate * 0.30) + (a.stamina * 0.26) + (a.aggression * 0.18) + (a.pace * 0.16) + (a.mentality * 0.10);
  if (key === 'marking') quality = (a.positioning * 0.34) + (a.defending * 0.30) + (a.mentality * 0.14) + (a.pace * 0.10) + (a.strength * 0.07) + (a.stamina * 0.05);
  return clamp(0.76 + ((quality - 55) / 45) * 0.34, 0.68, 1.22);
};

const getInstructionShare = (
  player: Player,
  activePlayers: Player[],
  key: keyof PlayerLiveInstructions
) => {
  const totalWeight = activePlayers.reduce(
    (sum, activePlayer) => sum + getInstructionPositionWeight(activePlayer, key),
    0
  );
  if (totalWeight <= 0) return 0;
  return (getInstructionPositionWeight(player, key) / totalWeight) * getInstructionQualityFactor(player, key);
};

const getPlayerWeightedValue = (
  player: Player,
  attributes: Partial<Record<keyof Player['attributes'], number>>
) => {
  const entries = Object.entries(attributes) as Array<[keyof Player['attributes'], number]>;
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight <= 0) return 55;
  return entries.reduce((sum, [attribute, weight]) => sum + player.attributes[attribute] * weight, 0) / totalWeight;
};

const getInstructionResponsibilityImpact = (
  player: Player,
  key: keyof PlayerLiveInstructions
) => {
  if (key === 'tempo') {
    if (player.position === PlayerPosition.GK) return 0.16;
    if (player.position === PlayerPosition.DEF) return 0.72;
    if (player.position === PlayerPosition.MID) return 1.08;
    return 0.96;
  }
  if (key === 'passing') {
    if (player.position === PlayerPosition.GK) return 0.24;
    if (player.position === PlayerPosition.DEF) return 0.78;
    if (player.position === PlayerPosition.MID) return 1.10;
    return 0.84;
  }
  if (key === 'marking') {
    if (player.position === PlayerPosition.GK) return 0.08;
    if (player.position === PlayerPosition.DEF) return 1.16;
    if (player.position === PlayerPosition.MID) return 0.82;
    return 0.30;
  }
  return getInstructionPositionWeight(player, key);
};

const getIndividualInstructionFitProfile = ({
  player,
  key,
  instruction,
  opponentPlayers,
  opponentStartingXI,
  opponentPressing = 'NORMAL',
  opponentTempo = 'NORMAL',
  opponentPassing = 'MIXED',
  opponentMindset = 'NEUTRAL',
  fatigue = 100,
}: {
  player: Player;
  key: 'tempo' | 'passing' | 'marking';
  instruction: InstructionTempo | InstructionPassing | InstructionMarking;
  opponentPlayers: Player[];
  opponentStartingXI: (string | null)[];
  opponentPressing?: InstructionPressing;
  opponentTempo?: InstructionTempo;
  opponentPassing?: InstructionPassing;
  opponentMindset?: InstructionMindset;
  fatigue?: number;
}) => {
  /**
   * Individual instruction fit:
   * "Weak" is not a fixed attribute threshold. The player is compared against the match problem
   * created by the opponent. Bad fits create larger penalties; strong fits only add light bonuses.
   */
  const pressurePlayers: Player['position'][] = [PlayerPosition.MID, PlayerPosition.FWD];
  const defensivePlayers: Player['position'][] = [PlayerPosition.DEF, PlayerPosition.MID];
  const fatigueDrag = clamp((78 - fatigue) / 42, 0, 1);
  const responsibility = getInstructionResponsibilityImpact(player, key);

  let playerFit = 55;
  let opponentDemand = 55;
  let styleStress = 0;
  let shotPenaltyMax = 0.010;
  let shotBonusMax = 0.003;
  let turnoverPenaltyMax = 0.05;
  let turnoverBonusMax = 0.018;
  let fatiguePenaltyMax = 0.010;
  let foulPenaltyMax = 0;
  let penaltyPenaltyMax = 0;

  if (key === 'tempo') {
    if (instruction === 'FAST') {
      playerFit = getPlayerWeightedValue(player, {
        pace: 0.28,
        stamina: 0.24,
        technique: 0.22,
        workRate: 0.16,
        mentality: 0.10,
      }) - fatigueDrag * 8;
      opponentDemand = getWeightedAverage(opponentPlayers, opponentStartingXI, {
        workRate: 0.25,
        stamina: 0.20,
        aggression: 0.18,
        pace: 0.16,
        positioning: 0.12,
        mentality: 0.09,
      }, pressurePlayers);
      styleStress = (opponentPressing === 'PRESSING' ? 4.5 : 0) + (opponentTempo === 'FAST' ? 1.5 : 0);
      shotPenaltyMax = 0.015;
      shotBonusMax = 0.004;
      turnoverPenaltyMax = 0.105;
      turnoverBonusMax = 0.030;
      fatiguePenaltyMax = 0.024;
    } else if (instruction === 'SLOW') {
      playerFit = getPlayerWeightedValue(player, {
        passing: 0.28,
        technique: 0.24,
        vision: 0.20,
        mentality: 0.16,
        positioning: 0.12,
      }) - fatigueDrag * 5;
      opponentDemand = getWeightedAverage(opponentPlayers, opponentStartingXI, {
        positioning: 0.24,
        workRate: 0.22,
        defending: 0.18,
        aggression: 0.14,
        mentality: 0.12,
        pace: 0.10,
      }, pressurePlayers);
      styleStress = opponentPressing === 'PRESSING' ? 3.0 : opponentTempo === 'FAST' ? 1.2 : 0;
      shotPenaltyMax = 0.008;
      shotBonusMax = 0.003;
      turnoverPenaltyMax = 0.055;
      turnoverBonusMax = 0.024;
      fatiguePenaltyMax = 0.006;
    }
  }

  if (key === 'passing') {
    if (instruction === 'SHORT') {
      playerFit = getPlayerWeightedValue(player, {
        passing: 0.32,
        technique: 0.28,
        vision: 0.18,
        mentality: 0.12,
        positioning: 0.10,
      }) - fatigueDrag * 5;
      opponentDemand = getWeightedAverage(opponentPlayers, opponentStartingXI, {
        workRate: 0.24,
        positioning: 0.20,
        defending: 0.18,
        aggression: 0.16,
        pace: 0.12,
        mentality: 0.10,
      }, pressurePlayers);
      styleStress = (opponentPressing === 'PRESSING' ? 4.0 : 0) + (opponentTempo === 'FAST' ? 1.2 : 0);
      shotPenaltyMax = 0.013;
      shotBonusMax = 0.004;
      turnoverPenaltyMax = 0.100;
      turnoverBonusMax = 0.034;
      fatiguePenaltyMax = 0.008;
    } else if (instruction === 'LONG') {
      playerFit = getPlayerWeightedValue(player, {
        passing: 0.34,
        crossing: 0.20,
        vision: 0.20,
        technique: 0.16,
        mentality: 0.10,
      }) - fatigueDrag * 4;
      opponentDemand = getWeightedAverage(opponentPlayers, opponentStartingXI, {
        heading: 0.22,
        strength: 0.20,
        positioning: 0.18,
        defending: 0.16,
        pace: 0.14,
        mentality: 0.10,
      }, defensivePlayers);
      styleStress = opponentPassing === 'SHORT' ? 0.6 : opponentMindset === 'DEFENSIVE' ? 2.4 : 0;
      shotPenaltyMax = 0.014;
      shotBonusMax = 0.004;
      turnoverPenaltyMax = 0.085;
      turnoverBonusMax = 0.026;
      fatiguePenaltyMax = 0.006;
    }
  }

  if (key === 'marking') {
    if (instruction === 'MAN') {
      playerFit = getPlayerWeightedValue(player, {
        positioning: 0.28,
        defending: 0.27,
        pace: 0.16,
        strength: 0.12,
        mentality: 0.11,
        stamina: 0.06,
      }) - fatigueDrag * 7;
      opponentDemand = getWeightedAverage(opponentPlayers, opponentStartingXI, {
        dribbling: 0.20,
        pace: 0.19,
        attacking: 0.18,
        technique: 0.16,
        positioning: 0.12,
        finishing: 0.10,
        strength: 0.05,
      }, pressurePlayers);
      styleStress = (opponentTempo === 'FAST' ? 3.2 : 0) + (opponentPassing === 'SHORT' ? 1.0 : 0);
      shotPenaltyMax = 0.018;
      shotBonusMax = 0.005;
      fatiguePenaltyMax = 0.020;
      foulPenaltyMax = 0.24;
      penaltyPenaltyMax = 0.14;
    } else if (instruction === 'ZONE') {
      playerFit = getPlayerWeightedValue(player, {
        positioning: 0.34,
        defending: 0.26,
        mentality: 0.16,
        workRate: 0.12,
        stamina: 0.08,
        pace: 0.04,
      }) - fatigueDrag * 5;
      opponentDemand = getWeightedAverage(opponentPlayers, opponentStartingXI, {
        passing: 0.20,
        vision: 0.18,
        technique: 0.17,
        attacking: 0.15,
        positioning: 0.14,
        pace: 0.10,
        dribbling: 0.06,
      }, pressurePlayers);
      styleStress = opponentTempo === 'FAST' ? 2.2 : opponentPassing === 'LONG' ? 1.4 : 0;
      shotPenaltyMax = 0.010;
      shotBonusMax = 0.003;
      fatiguePenaltyMax = 0.008;
      foulPenaltyMax = 0.08;
      penaltyPenaltyMax = 0.06;
    }
  }

  if (instruction === 'NORMAL' || instruction === 'MIXED' || instruction === 'NONE') {
    return { gap: 0, shotModifier: 0, turnoverRiskModifier: 0, fatigueExtra: 0, foulMultiplier: 1, penaltyMultiplier: 1 };
  }

  const gap = playerFit - opponentDemand - styleStress;
  const penalty = clamp((-gap - 4) / 20, 0, 1);
  const bonus = clamp((gap - 8) / 24, 0, 1);
  const shotModifier = key === 'marking'
    ? ((shotPenaltyMax * penalty) - (shotBonusMax * bonus)) * responsibility
    : ((-shotPenaltyMax * penalty) + (shotBonusMax * bonus)) * responsibility;

  return {
    gap,
    shotModifier,
    turnoverRiskModifier: ((turnoverPenaltyMax * penalty) - (turnoverBonusMax * bonus)) * responsibility,
    fatigueExtra: fatiguePenaltyMax * penalty * responsibility,
    foulMultiplier: clamp(1 + foulPenaltyMax * penalty * responsibility - 0.03 * bonus * responsibility, 0.94, 1.34),
    penaltyMultiplier: clamp(1 + penaltyPenaltyMax * penalty * responsibility - 0.02 * bonus * responsibility, 0.96, 1.22),
  };
};

const getTempoFatigueCost = (tempo: InstructionTempo) => tempo === 'FAST' ? 0.065 : 0;
const getPressingFatigueCost = (pressing: InstructionPressing) => pressing === 'PRESSING' ? 0.015 : 0;
const getMarkingFatigueCost = (marking: InstructionMarking) => marking === 'MAN' ? 0.012 : marking === 'ZONE' ? 0.004 : 0;
const getFastPressingFatigueCost = (tempo: InstructionTempo, pressing: InstructionPressing) =>
  tempo === 'FAST' && pressing === 'PRESSING' ? 0.004 : 0;

export const LiveMatchInstructionBalanceService = {
  getFastTempoDefensiveExposure: (
    opponentTacticDefBias: number,
    teamTechnique: number
  ) => {
    const exposure = 0.006 + clamp((opponentTacticDefBias - 50) / 35, 0, 1) * 0.006;
    const techSafetyMod = teamTechnique > 72 ? 0.80 : teamTechnique > 62 ? 0.90 : 1.0;
    return exposure * techSafetyMod;
  },

  getOffensiveMindsetDefensiveExposure: (
    opponentTacticDefBias: number
  ) => {
    return 0.007 + clamp((opponentTacticDefBias - 55) / 30, 0, 1) * 0.007;
  },

  getBuildUpAccuracyProfile: (
    userPlayers: Player[],
    userStartingXI: (string | null)[],
    opponentPlayers: Player[],
    opponentStartingXI: (string | null)[],
    passing: InstructionPassing = 'MIXED',
    tempo: InstructionTempo = 'NORMAL',
    opponentPressing: InstructionPressing = 'NORMAL',
    fatigueMap: Record<string, number> = {}
  ) => {
    const builders: Player['position'][] = [PlayerPosition.DEF, PlayerPosition.MID];
    const receivers: Player['position'][] = [PlayerPosition.MID, PlayerPosition.FWD];
    const opponentBlock: Player['position'][] = [PlayerPosition.MID, PlayerPosition.FWD];
    const activePlayers = getSelectedPlayers(userPlayers, userStartingXI, builders);
    const activeCount = Math.max(1, activePlayers.length);
    const avgFatigue = activePlayers.reduce((sum, player) => sum + (fatigueMap[player.id] ?? 100), 0) / activeCount;
    const fatigueDrag = clamp((82 - avgFatigue) / 55, 0, 1);

    const buildQuality = getWeightedAverage(userPlayers, userStartingXI, {
      passing: 0.34,
      technique: 0.25,
      vision: 0.18,
      mentality: 0.13,
      workRate: 0.10,
    }, builders);
    const receivingQuality = getWeightedAverage(userPlayers, userStartingXI, {
      technique: 0.30,
      passing: 0.24,
      vision: 0.18,
      dribbling: 0.14,
      positioning: 0.14,
    }, receivers);
    const pressResistance = buildQuality * 0.68 + receivingQuality * 0.32 - fatigueDrag * 9;
    const opponentPressQuality = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      workRate: 0.27,
      stamina: 0.23,
      aggression: 0.18,
      pace: 0.14,
      mentality: 0.10,
      positioning: 0.08,
    }, opponentBlock);

    const tempoRisk = tempo === 'FAST' ? 5.5 : tempo === 'SLOW' ? -3.5 : 0;
    const passStyleRisk = passing === 'SHORT' ? -1.8 : passing === 'LONG' ? 3.2 : 0;
    const opponentPressingRisk = opponentPressing === 'PRESSING' ? 5.5 : 0;
    const rawSecurity = pressResistance - opponentPressQuality - tempoRisk - passStyleRisk - opponentPressingRisk;
    const qualityGap = buildQuality - opponentPressQuality;
    const positiveControl = getProgressiveModifier(rawSecurity, 2, 0.011, 0.008, 28);
    const turnoverDrag = getProgressiveModifier(rawSecurity, 2, 0.008, 0.018, 28);
    const styleBonus = passing === 'SHORT' && qualityGap > 4 && tempo !== 'FAST'
      ? clamp((qualityGap - 4) / 24, 0, 1) * 0.004
      : 0;
    const rushedLongBallPenalty = passing === 'LONG' && receivingQuality < opponentPressQuality - 5
      ? -clamp((opponentPressQuality - receivingQuality - 5) / 24, 0, 1) * 0.006
      : 0;
    const shotModifier = clamp(positiveControl + turnoverDrag + styleBonus + rushedLongBallPenalty, -0.024, 0.017);
    const turnoverRisk = clamp((-rawSecurity - 2) / 55, 0, 1);

    return {
      buildQuality,
      pressResistance,
      opponentPressQuality,
      rawSecurity,
      shotModifier,
      turnoverRisk,
    };
  },

  getIntensityRiskModifiers: (
    intensity: InstructionIntensity,
    players: Player[],
    startingXI: (string | null)[],
    intensityResponseFactor = 1
  ) => {
    const averageAggression = getAverage(players, startingXI, ['aggression']);
    const aggressionGap = (averageAggression - 50) / 50;
    const aggressionSensitivity = intensity === 'AGGRESSIVE' ? 1.25 : intensity === 'CAUTIOUS' ? 0.65 : 1;
    const aggressionFoulMod = clamp(1 + aggressionGap * 0.18 * aggressionSensitivity, 0.78, 1.28);
    const aggressionPenaltyMod = clamp(1 + aggressionGap * 0.10 * aggressionSensitivity, 0.88, 1.15);
    const aggressionInjuryMod = clamp(1 + aggressionGap * 0.06 * aggressionSensitivity, 0.94, 1.10);
    const instructionFoulMod = intensity === 'AGGRESSIVE'
      ? 1 + 0.30 * intensityResponseFactor
      : intensity === 'CAUTIOUS'
        ? 1 - 0.28 * intensityResponseFactor
        : 1;
    const instructionPenaltyMod = intensity === 'AGGRESSIVE'
      ? 1 + 0.25 * intensityResponseFactor
      : intensity === 'CAUTIOUS'
        ? 1 - 0.30 * intensityResponseFactor
        : 1;
    const instructionInjuryMod = intensity === 'AGGRESSIVE'
      ? 1 + 0.28 * intensityResponseFactor
      : intensity === 'CAUTIOUS'
        ? 1 - 0.30 * intensityResponseFactor
        : 1;

    return {
      averageAggression,
      aggressionFoul: aggressionFoulMod,
      aggressionPenalty: aggressionPenaltyMod,
      aggressionInjury: aggressionInjuryMod,
      foul: instructionFoulMod * aggressionFoulMod,
      penalty: instructionPenaltyMod * aggressionPenaltyMod,
      injury: instructionInjuryMod * aggressionInjuryMod,
    };
  },

  getMarkingProfile: ({
    defendingPlayers,
    defendingStartingXI,
    attackingPlayers,
    attackingStartingXI,
    marking,
    opponentPassing = 'MIXED',
    opponentTempo = 'NORMAL',
    opponentMindset = 'NEUTRAL',
    fatigueMap = {},
    responseFactor = 1,
  }: {
    defendingPlayers: Player[];
    defendingStartingXI: (string | null)[];
    attackingPlayers: Player[];
    attackingStartingXI: (string | null)[];
    marking: InstructionMarking;
    opponentPassing?: InstructionPassing;
    opponentTempo?: InstructionTempo;
    opponentMindset?: InstructionMindset;
    fatigueMap?: Record<string, number>;
    responseFactor?: number;
  }) => {
    if (marking === 'NONE') {
      return { shotModifier: 0, foulMultiplier: 1, penaltyMultiplier: 1, fatigueExtra: 0 };
    }

    const blockPlayers: Player['position'][] = [PlayerPosition.DEF, PlayerPosition.MID];
    const threatPlayers: Player['position'][] = [PlayerPosition.MID, PlayerPosition.FWD];
    const activeDefenders = getSelectedPlayers(defendingPlayers, defendingStartingXI, blockPlayers);
    const activeCount = Math.max(1, activeDefenders.length);
    const avgFatigue = activeDefenders.reduce((sum, player) => sum + (fatigueMap[player.id] ?? 100), 0) / activeCount;
    const fatigueDrag = clamp((82 - avgFatigue) / 48, 0, 1);

    if (marking === 'ZONE') {
      /**
       * Zone marking is evaluated as a collective spacing problem.
       * It rewards positioning, defending, mentality, and stamina across DEF/MID players.
       * It is intentionally better versus slow/short attacks and weaker versus fast direct routes.
       */
      const zoneStructure = getWeightedAverage(defendingPlayers, defendingStartingXI, {
        positioning: 0.34,
        defending: 0.28,
        mentality: 0.16,
        workRate: 0.12,
        stamina: 0.10,
      }, blockPlayers) - fatigueDrag * 7;
      const attackingPattern = getWeightedAverage(attackingPlayers, attackingStartingXI, {
        passing: 0.24,
        technique: 0.22,
        vision: 0.18,
        positioning: 0.14,
        attacking: 0.12,
        pace: 0.10,
      }, threatPlayers);
      const styleFit =
        (opponentPassing === 'SHORT' ? 2.2 : opponentPassing === 'LONG' ? -2.6 : 0) +
        (opponentTempo === 'SLOW' ? 1.8 : opponentTempo === 'FAST' ? -2.4 : 0) +
        (opponentMindset === 'OFFENSIVE' ? -0.9 : opponentMindset === 'DEFENSIVE' ? 0.7 : 0);
      const edge = zoneStructure - attackingPattern + styleFit;
      const control = getProgressiveModifier(edge, 2, 0.009, 0.010, 28);
      const mismatch = clamp((-edge - 2) / 24, 0, 1);

      return {
        shotModifier: clamp((-0.004 - control) * responseFactor, -0.016, 0.007),
        foulMultiplier: clamp(0.95 + mismatch * 0.10, 0.88, 1.08),
        penaltyMultiplier: clamp(0.96 + mismatch * 0.08, 0.90, 1.08),
        fatigueExtra: clamp((0.004 + fatigueDrag * 0.002) * responseFactor, 0, 0.008),
      };
    }

    /**
     * Man marking is evaluated as a duel/matchup problem.
     * It can suppress dangerous forwards more strongly than zone marking, but poor defenders
     * facing fast or technical attackers create fouls, penalties, and extra fatigue.
     */
    const duelQuality = getWeightedAverage(defendingPlayers, defendingStartingXI, {
      defending: 0.28,
      positioning: 0.24,
      pace: 0.14,
      strength: 0.12,
      aggression: 0.10,
      mentality: 0.08,
      stamina: 0.04,
    }, blockPlayers) - fatigueDrag * 8;
    const threatQuality = getWeightedAverage(attackingPlayers, attackingStartingXI, {
      attacking: 0.20,
      dribbling: 0.19,
      pace: 0.18,
      technique: 0.15,
      finishing: 0.13,
      positioning: 0.10,
      strength: 0.05,
    }, threatPlayers);
    const styleFit =
      (opponentPassing === 'LONG' ? 1.8 : opponentPassing === 'SHORT' ? -1.2 : 0) +
      (opponentTempo === 'FAST' ? -2.0 : opponentTempo === 'SLOW' ? 0.8 : 0) +
      (opponentMindset === 'OFFENSIVE' ? 0.9 : opponentMindset === 'DEFENSIVE' ? -0.6 : 0);
    const edge = duelQuality - threatQuality + styleFit;
    const duelControl = getProgressiveModifier(edge, 2, 0.012, 0.013, 28);
    const mismatch = clamp((-edge - 2) / 24, 0, 1);
    const aggression = getAverage(defendingPlayers, defendingStartingXI, ['aggression'], blockPlayers);
    const aggressionRisk = clamp((aggression - 60) / 35, 0, 1);

    return {
      shotModifier: clamp((-0.005 - duelControl) * responseFactor, -0.020, 0.010),
      foulMultiplier: clamp(1.06 + mismatch * 0.18 + aggressionRisk * 0.06, 0.98, 1.30),
      penaltyMultiplier: clamp(1.03 + mismatch * 0.12 + (opponentTempo === 'FAST' ? 0.03 : 0), 0.98, 1.20),
      fatigueExtra: clamp((0.011 + mismatch * 0.007 + fatigueDrag * 0.003) * responseFactor, 0, 0.022),
    };
  },

  getCombinationModifier: (
    tempo: InstructionTempo,
    mindset: InstructionMindset,
    pressing: InstructionPressing,
    counterAttack: InstructionCounterAttack | undefined,
    isAttacking: boolean
  ) => {
    let modifier = 0;

    if (tempo === 'FAST' && mindset === 'OFFENSIVE') modifier += isAttacking ? 0.003 : 0.006;
    if (tempo === 'SLOW' && mindset === 'DEFENSIVE') modifier += isAttacking ? -0.002 : -0.003;
    if (tempo === 'FAST' && mindset === 'DEFENSIVE') modifier += isAttacking ? -0.002 : 0.002;
    if (tempo === 'SLOW' && mindset === 'OFFENSIVE') modifier += isAttacking ? -0.002 : 0.001;

    if (pressing === 'PRESSING' && tempo === 'FAST') modifier += isAttacking ? 0.002 : -0.001;
    if (pressing === 'PRESSING' && tempo === 'SLOW') modifier += isAttacking ? -0.002 : 0;
    if (pressing === 'PRESSING' && counterAttack === 'COUNTER') modifier += isAttacking ? -0.002 : 0.002;

    return clamp(modifier, -0.006, 0.006);
  },

  getInstructionFatigueExtra: (
    tempo: InstructionTempo,
    intensity: InstructionIntensity,
    pressing: InstructionPressing,
    tempoResponseFactor = 1,
    intensityResponseFactor = 1,
    pressingResponseFactor = 1,
    marking: InstructionMarking = 'NONE',
    markingResponseFactor = 1
  ) => {
    const tempoCost = tempo === 'FAST' ? 0.065 * tempoResponseFactor : 0;
    const intensityCost = intensity === 'AGGRESSIVE'
      ? 0.018 * intensityResponseFactor
      : intensity === 'CAUTIOUS'
        ? -0.012 * intensityResponseFactor
        : 0;
    const pressingCost = pressing === 'PRESSING' ? 0.015 * pressingResponseFactor : 0;
    const markingCost = getMarkingFatigueCost(marking) * markingResponseFactor;
    const fastPressingCost = tempo === 'FAST' && pressing === 'PRESSING' ? 0.004 : 0;
    return tempoCost + intensityCost + pressingCost + markingCost + fastPressingCost;
  },

  getIndividualInstructionShotModifier: ({
    players,
    startingXI,
    individualInstructions,
    teamInstructions,
    opponentPlayers,
    opponentStartingXI,
    opponentTacticDefBias,
    opponentTempo = 'NORMAL',
    opponentPassing = 'MIXED',
    opponentMindset = 'NEUTRAL',
    opponentPressing = 'NORMAL',
    fatigueMap = {},
    isAttacking,
  }: {
    players: Player[];
    startingXI: (string | null)[];
    individualInstructions: Record<string, PlayerLiveInstructions>;
    teamInstructions: {
      tempo: InstructionTempo;
      mindset: InstructionMindset;
      passing: InstructionPassing;
      pressing: InstructionPressing;
      counterAttack?: InstructionCounterAttack;
    };
    opponentPlayers: Player[];
    opponentStartingXI: (string | null)[];
    opponentTacticDefBias: number;
    opponentTempo?: InstructionTempo;
    opponentPassing?: InstructionPassing;
    opponentMindset?: InstructionMindset;
    opponentPressing?: InstructionPressing;
    fatigueMap?: Record<string, number>;
    isAttacking: boolean;
  }) => {
    const activePlayers = getSelectedPlayers(players, startingXI);
    if (activePlayers.length === 0 || Object.keys(individualInstructions).length === 0) return 0;

    const teamTechnique = getAverage(players, startingXI, ['technique']);
    const slowTempoModifier = LiveMatchInstructionBalanceService.getSlowTempoModifier(
      players, startingXI, opponentPlayers, opponentStartingXI
    );
    const defensiveMindsetModifier = LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(
      players, startingXI, opponentPlayers, opponentStartingXI
    );
    const shortPassingModifier = LiveMatchInstructionBalanceService.getShortPassingModifier(
      players, startingXI, opponentPlayers, opponentStartingXI, teamInstructions.tempo === 'FAST'
    );
    const longPassingModifier = LiveMatchInstructionBalanceService.getLongPassingModifier(
      players, startingXI, opponentPlayers, opponentStartingXI, teamInstructions.tempo === 'FAST'
    );
    const pressingModifier = LiveMatchInstructionBalanceService.getPressingModifier(
      players, startingXI, opponentPlayers, opponentStartingXI
    );

    const tempoContribution = (tempo: InstructionTempo) => {
      if (tempo === 'FAST') {
        return isAttacking
          ? 0.012
          : LiveMatchInstructionBalanceService.getFastTempoDefensiveExposure(opponentTacticDefBias, teamTechnique);
      }
      if (tempo === 'SLOW' && isAttacking) return slowTempoModifier;
      return 0;
    };
    const mindsetContribution = (mindset: InstructionMindset) => {
      if (mindset === 'OFFENSIVE') {
        return isAttacking
          ? 0.015
          : LiveMatchInstructionBalanceService.getOffensiveMindsetDefensiveExposure(opponentTacticDefBias);
      }
      if (mindset === 'DEFENSIVE') return isAttacking ? -0.005 : -defensiveMindsetModifier;
      return 0;
    };
    const passingContribution = (passing: InstructionPassing) => {
      if (passing === 'SHORT') return isAttacking ? shortPassingModifier : -shortPassingModifier;
      if (passing === 'LONG') return isAttacking ? longPassingModifier : -longPassingModifier;
      return 0;
    };
    const pressingContribution = (pressing: InstructionPressing) => {
      if (pressing !== 'PRESSING') return 0;
      return isAttacking ? pressingModifier : -pressingModifier;
    };

    let modifier = 0;
    activePlayers.forEach(player => {
      const instructions = individualInstructions[player.id];
      if (!instructions) return;

      if (instructions.tempo && instructions.tempo !== teamInstructions.tempo) {
        const fitProfile = getIndividualInstructionFitProfile({
          player,
          key: 'tempo',
          instruction: instructions.tempo,
          opponentPlayers,
          opponentStartingXI,
          opponentTempo,
          opponentPassing,
          opponentMindset,
          opponentPressing,
          fatigue: fatigueMap[player.id] ?? 100,
        });
        modifier += (
          tempoContribution(instructions.tempo) -
          tempoContribution(teamInstructions.tempo)
        ) * getInstructionShare(player, activePlayers, 'tempo') * 0.58;
        /**
         * Fit penalty note:
         * The normal tactical delta above says what the instruction generally does.
         * This extra layer says whether this specific player can execute it against this opponent.
         */
        modifier += fitProfile.shotModifier;
      }
      if (instructions.mindset && instructions.mindset !== teamInstructions.mindset) {
        modifier += (
          mindsetContribution(instructions.mindset) -
          mindsetContribution(teamInstructions.mindset)
        ) * getInstructionShare(player, activePlayers, 'mindset') * 0.58;
      }
      if (instructions.passing && instructions.passing !== teamInstructions.passing) {
        const fitProfile = getIndividualInstructionFitProfile({
          player,
          key: 'passing',
          instruction: instructions.passing,
          opponentPlayers,
          opponentStartingXI,
          opponentTempo,
          opponentPassing,
          opponentMindset,
          opponentPressing,
          fatigue: fatigueMap[player.id] ?? 100,
        });
        modifier += (
          passingContribution(instructions.passing) -
          passingContribution(teamInstructions.passing)
        ) * getInstructionShare(player, activePlayers, 'passing') * 0.62;
        modifier += fitProfile.shotModifier;
      }
      if (instructions.pressing && instructions.pressing !== teamInstructions.pressing) {
        modifier += (
          pressingContribution(instructions.pressing) -
          pressingContribution(teamInstructions.pressing)
        ) * getInstructionShare(player, activePlayers, 'pressing') * 0.58;
      }
    });

    return clamp(modifier, -0.040, 0.024);
  },

  getIndividualMarkingAdjustment: ({
    players,
    startingXI,
    individualInstructions,
    teamMarking,
    attackingPlayers,
    attackingStartingXI,
    opponentPassing,
    opponentTempo,
    opponentMindset,
    fatigueMap = {},
    responseFactor = 1,
  }: {
    players: Player[];
    startingXI: (string | null)[];
    individualInstructions: Record<string, PlayerLiveInstructions>;
    teamMarking: InstructionMarking;
    attackingPlayers: Player[];
    attackingStartingXI: (string | null)[];
    opponentPassing: InstructionPassing;
    opponentTempo: InstructionTempo;
    opponentMindset: InstructionMindset;
    fatigueMap?: Record<string, number>;
    responseFactor?: number;
  }) => {
    const activePlayers = getSelectedPlayers(players, startingXI);
    if (activePlayers.length === 0 || Object.keys(individualInstructions).length === 0) {
      return { shotModifier: 0, foulMultiplier: 1, penaltyMultiplier: 1 };
    }

    /**
     * Individual marking is treated as a partial override of the team defensive plan.
     * A defender changes more of the team outcome than a forward because getInstructionShare()
     * already combines positional responsibility with player quality for the "marking" key.
     */
    const teamProfile = LiveMatchInstructionBalanceService.getMarkingProfile({
      defendingPlayers: players,
      defendingStartingXI: startingXI,
      attackingPlayers,
      attackingStartingXI,
      marking: teamMarking,
      opponentPassing,
      opponentTempo,
      opponentMindset,
      fatigueMap,
      responseFactor,
    });
    let shotModifier = 0;
    let foulDelta = 0;
    let penaltyDelta = 0;

    activePlayers.forEach(player => {
      const instructions = individualInstructions[player.id];
      if (!instructions?.marking || instructions.marking === teamMarking) return;

      const individualProfile = LiveMatchInstructionBalanceService.getMarkingProfile({
        defendingPlayers: players,
        defendingStartingXI: startingXI,
        attackingPlayers,
        attackingStartingXI,
        marking: instructions.marking,
        opponentPassing,
        opponentTempo,
        opponentMindset,
        fatigueMap,
        responseFactor,
      });
      const fitProfile = getIndividualInstructionFitProfile({
        player,
        key: 'marking',
        instruction: instructions.marking,
        opponentPlayers: attackingPlayers,
        opponentStartingXI: attackingStartingXI,
        opponentTempo,
        opponentPassing,
        opponentMindset,
        fatigue: fatigueMap[player.id] ?? 100,
      });
      const share = getInstructionShare(player, activePlayers, 'marking');
      shotModifier += (individualProfile.shotModifier - teamProfile.shotModifier) * share * 0.72;
      foulDelta += (individualProfile.foulMultiplier - teamProfile.foulMultiplier) * share * 0.72;
      penaltyDelta += (individualProfile.penaltyMultiplier - teamProfile.penaltyMultiplier) * share * 0.72;
      /**
       * Individual marking fit note:
       * A poor man-marker should not be protected by the team average. If his attributes are
       * below the attacking matchup, the opponent receives a direct chance-quality opening.
       */
      shotModifier += fitProfile.shotModifier;
      foulDelta += fitProfile.foulMultiplier - 1;
      penaltyDelta += fitProfile.penaltyMultiplier - 1;
    });

    return {
      shotModifier: clamp(shotModifier, -0.018, 0.026),
      foulMultiplier: clamp(1 + foulDelta, 0.90, 1.36),
      penaltyMultiplier: clamp(1 + penaltyDelta, 0.92, 1.24),
    };
  },

  /**
   * Instruction-risk stage note:
   * Large penalties/light bonuses now follow one shared pattern: compare the instructed
   * player's required attributes against the opponent context, then scale the result by
   * position responsibility. This keeps player-specific instructions from becoming flat bonuses.
   */

  getIndividualBuildUpAdjustment: ({
    players,
    startingXI,
    individualInstructions,
    teamInstructions,
    opponentPlayers = [],
    opponentStartingXI = [],
    opponentTempo = 'NORMAL',
    opponentPassing = 'MIXED',
    opponentMindset = 'NEUTRAL',
    opponentPressing = 'NORMAL',
    fatigueMap = {},
  }: {
    players: Player[];
    startingXI: (string | null)[];
    individualInstructions: Record<string, PlayerLiveInstructions>;
    teamInstructions: {
      tempo: InstructionTempo;
      passing: InstructionPassing;
    };
    opponentPlayers?: Player[];
    opponentStartingXI?: (string | null)[];
    opponentTempo?: InstructionTempo;
    opponentPassing?: InstructionPassing;
    opponentMindset?: InstructionMindset;
    opponentPressing?: InstructionPressing;
    fatigueMap?: Record<string, number>;
  }) => {
    const activePlayers = getSelectedPlayers(players, startingXI).filter(player => player.position !== PlayerPosition.GK);
    if (activePlayers.length === 0 || Object.keys(individualInstructions).length === 0) {
      return { shotModifier: 0, turnoverRiskModifier: 0 };
    }

    const tempoSecurity = (tempo: InstructionTempo) => tempo === 'FAST' ? -2.2 : tempo === 'SLOW' ? 1.35 : 0;
    const passingSecurity = (passing: InstructionPassing) => passing === 'SHORT' ? 1.65 : passing === 'LONG' ? -2.05 : 0;
    let securityDelta = 0;
    let fitShotModifier = 0;
    let fitTurnoverModifier = 0;

    activePlayers.forEach(player => {
      const instructions = individualInstructions[player.id];
      if (!instructions) return;
      if (instructions.tempo && instructions.tempo !== teamInstructions.tempo) {
        const fitProfile = getIndividualInstructionFitProfile({
          player,
          key: 'tempo',
          instruction: instructions.tempo,
          opponentPlayers,
          opponentStartingXI,
          opponentTempo,
          opponentPassing,
          opponentMindset,
          opponentPressing,
          fatigue: fatigueMap[player.id] ?? 100,
        });
        securityDelta += (
          tempoSecurity(instructions.tempo) -
          tempoSecurity(teamInstructions.tempo)
        ) * getInstructionShare(player, activePlayers, 'tempo');
        fitShotModifier += fitProfile.shotModifier * 0.45;
        fitTurnoverModifier += fitProfile.turnoverRiskModifier;
      }
      if (instructions.passing && instructions.passing !== teamInstructions.passing) {
        const fitProfile = getIndividualInstructionFitProfile({
          player,
          key: 'passing',
          instruction: instructions.passing,
          opponentPlayers,
          opponentStartingXI,
          opponentTempo,
          opponentPassing,
          opponentMindset,
          opponentPressing,
          fatigue: fatigueMap[player.id] ?? 100,
        });
        securityDelta += (
          passingSecurity(instructions.passing) -
          passingSecurity(teamInstructions.passing)
        ) * getInstructionShare(player, activePlayers, 'passing');
        fitShotModifier += fitProfile.shotModifier * 0.45;
        fitTurnoverModifier += fitProfile.turnoverRiskModifier;
      }
    });

    /**
     * Build-up fit note:
     * Bad individual fit is allowed to punish turnovers more than it boosts good players.
     * This keeps the feature tactical: risky instructions are powerful only when the player can execute them.
     */
    const shotModifier = clamp(securityDelta * 0.0018 + fitShotModifier, -0.018, 0.009);
    const turnoverRiskModifier = clamp(-securityDelta * 0.025 + fitTurnoverModifier, -0.08, 0.18);
    return { shotModifier, turnoverRiskModifier };
  },

  getIndividualInstructionFatigueExtras: (
    players: Player[],
    startingXI: (string | null)[],
    individualInstructions: Record<string, PlayerLiveInstructions>,
    teamInstructions: {
      tempo: InstructionTempo;
      pressing: InstructionPressing;
      passing?: InstructionPassing;
      marking?: InstructionMarking;
    },
    context: {
      opponentPlayers?: Player[];
      opponentStartingXI?: (string | null)[];
      opponentTempo?: InstructionTempo;
      opponentPassing?: InstructionPassing;
      opponentMindset?: InstructionMindset;
      opponentPressing?: InstructionPressing;
      fatigueMap?: Record<string, number>;
    } = {}
  ) => {
    const activePlayers = getSelectedPlayers(players, startingXI);
    if (activePlayers.length === 0 || Object.keys(individualInstructions).length === 0) return {};

    return activePlayers.reduce<Record<string, number>>((acc, player) => {
      const instructions = individualInstructions[player.id];
      if (!instructions) return acc;

      const effectiveTempo = instructions.tempo ?? teamInstructions.tempo;
      const effectivePressing = instructions.pressing ?? teamInstructions.pressing;
      const effectiveMarking = instructions.marking ?? teamInstructions.marking ?? 'NONE';
      const individualCost =
        getTempoFatigueCost(effectiveTempo) +
        getPressingFatigueCost(effectivePressing) +
        getMarkingFatigueCost(effectiveMarking) +
        getFastPressingFatigueCost(effectiveTempo, effectivePressing);
      const teamCost =
        getTempoFatigueCost(teamInstructions.tempo) +
        getPressingFatigueCost(teamInstructions.pressing) +
        getMarkingFatigueCost(teamInstructions.marking ?? 'NONE') +
        getFastPressingFatigueCost(teamInstructions.tempo, teamInstructions.pressing);
      let fitFatigueExtra = 0;
      if (context.opponentPlayers && context.opponentStartingXI && instructions.tempo && instructions.tempo !== teamInstructions.tempo) {
        fitFatigueExtra += getIndividualInstructionFitProfile({
          player,
          key: 'tempo',
          instruction: instructions.tempo,
          opponentPlayers: context.opponentPlayers,
          opponentStartingXI: context.opponentStartingXI,
          opponentTempo: context.opponentTempo,
          opponentPassing: context.opponentPassing,
          opponentMindset: context.opponentMindset,
          opponentPressing: context.opponentPressing,
          fatigue: context.fatigueMap?.[player.id] ?? 100,
        }).fatigueExtra;
      }
      if (context.opponentPlayers && context.opponentStartingXI && teamInstructions.passing && instructions.passing && instructions.passing !== teamInstructions.passing) {
        fitFatigueExtra += getIndividualInstructionFitProfile({
          player,
          key: 'passing',
          instruction: instructions.passing,
          opponentPlayers: context.opponentPlayers,
          opponentStartingXI: context.opponentStartingXI,
          opponentTempo: context.opponentTempo,
          opponentPassing: context.opponentPassing,
          opponentMindset: context.opponentMindset,
          opponentPressing: context.opponentPressing,
          fatigue: context.fatigueMap?.[player.id] ?? 100,
        }).fatigueExtra;
      }
      if (context.opponentPlayers && context.opponentStartingXI && instructions.marking) {
        fitFatigueExtra += getIndividualInstructionFitProfile({
          player,
          key: 'marking',
          instruction: instructions.marking,
          opponentPlayers: context.opponentPlayers,
          opponentStartingXI: context.opponentStartingXI,
          opponentTempo: context.opponentTempo,
          opponentPassing: context.opponentPassing,
          opponentMindset: context.opponentMindset,
          fatigue: context.fatigueMap?.[player.id] ?? 100,
        }).fatigueExtra;
      }
      /**
       * Fatigue fit note:
       * Badly matched individual instructions cost extra energy because the player is chasing,
       * forcing actions, or correcting technical mistakes more often than a natural fit would.
       */
      const delta = clamp(individualCost - teamCost + fitFatigueExtra, -0.06, 0.105);
      if (delta !== 0) acc[player.id] = delta;
      return acc;
    }, {});
  },

  getInstructionShotModifier: (
    instructions: {
      tempo: InstructionTempo;
      mindset: InstructionMindset;
      pressing?: InstructionPressing;
      counterAttack?: InstructionCounterAttack;
    },
    userPlayers: Player[],
    userStartingXI: (string | null)[],
    opponentPlayers: Player[],
    opponentStartingXI: (string | null)[],
    opponentTacticDefBias: number,
    isAttacking: boolean,
    pressRf: number = 1.0
  ) => {
    const pressing = instructions.pressing ?? 'NORMAL';
    let modifier = 0;

    if (instructions.tempo === 'FAST') {
      if (isAttacking) {
        modifier += 0.012;
      } else {
        const userTechnique = getAverage(userPlayers, userStartingXI, ['technique']);
        modifier += LiveMatchInstructionBalanceService.getFastTempoDefensiveExposure(
          opponentTacticDefBias,
          userTechnique
        );
      }
    } else if (instructions.tempo === 'SLOW' && isAttacking) {
      modifier += LiveMatchInstructionBalanceService.getSlowTempoModifier(
        userPlayers, userStartingXI, opponentPlayers, opponentStartingXI
      );
    }

    if (instructions.mindset === 'OFFENSIVE') {
      if (isAttacking) modifier += 0.015;
      else modifier += LiveMatchInstructionBalanceService.getOffensiveMindsetDefensiveExposure(
        opponentTacticDefBias
      );
    } else if (instructions.mindset === 'DEFENSIVE') {
      if (!isAttacking) {
        modifier -= LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(
          userPlayers, userStartingXI, opponentPlayers, opponentStartingXI
        );
      } else {
        modifier -= 0.005;
      }
    }

    if (pressing === 'PRESSING') {
      const pressingModifier = LiveMatchInstructionBalanceService.getPressingModifier(
        userPlayers, userStartingXI, opponentPlayers, opponentStartingXI
      ) * pressRf;
      modifier += isAttacking ? pressingModifier : -pressingModifier;
    }

    return modifier + LiveMatchInstructionBalanceService.getCombinationModifier(
      instructions.tempo, instructions.mindset, pressing, instructions.counterAttack, isAttacking
    );
  },

  getSlowTempoModifier: (
    userPlayers: Player[],
    userStartingXI: (string | null)[],
    opponentPlayers: Player[],
    opponentStartingXI: (string | null)[]
  ) => {
    const controllers: Player['position'][] = [PlayerPosition.DEF, PlayerPosition.MID];
    const disruptors: Player['position'][] = [PlayerPosition.MID, PlayerPosition.FWD];
    const controlQuality = getWeightedAverage(userPlayers, userStartingXI, {
      passing: 0.30, technique: 0.25, vision: 0.20, mentality: 0.15, positioning: 0.10,
    }, controllers);
    const opponentDisruption = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      defending: 0.25, positioning: 0.20, aggression: 0.18, workRate: 0.17, pace: 0.10, mentality: 0.10,
    }, disruptors);
    return getProgressiveModifier(controlQuality - opponentDisruption, 2, 0.015, 0.009, 30);
  },

  getDefensiveMindsetModifier: (
    userPlayers: Player[],
    userStartingXI: (string | null)[],
    opponentPlayers: Player[],
    opponentStartingXI: (string | null)[]
  ) => {
    const blockPlayers: Player['position'][] = [PlayerPosition.DEF, PlayerPosition.MID];
    const attackers: Player['position'][] = [PlayerPosition.MID, PlayerPosition.FWD];
    const defensiveBlock = getWeightedAverage(userPlayers, userStartingXI, {
      defending: 0.30, positioning: 0.25, mentality: 0.17, workRate: 0.13, strength: 0.10, stamina: 0.05,
    }, blockPlayers);
    const opponentAttack = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      attacking: 0.22, finishing: 0.20, technique: 0.15, vision: 0.15, pace: 0.13, dribbling: 0.10, mentality: 0.05,
    }, attackers);
    const qualityModifier = getProgressiveModifier(defensiveBlock - opponentAttack, 2, 0.011, 0.003, 30);
    return clamp(0.003 + qualityModifier, 0, 0.014);
  },

  getShortPassingModifier: (
    userPlayers: Player[],
    userStartingXI: (string | null)[],
    opponentPlayers: Player[],
    opponentStartingXI: (string | null)[],
    isFastTempo: boolean
  ) => {
    const positions: Player['position'][] = [PlayerPosition.MID, PlayerPosition.FWD];
    const userQuality = getAverage(userPlayers, userStartingXI, ['technique', 'passing'], positions);
    const opponentQuality = getAverage(opponentPlayers, opponentStartingXI, ['technique', 'passing'], positions);
    const qualityGap = userQuality - opponentQuality;
    const baseModifier = getProgressiveModifier(qualityGap, 2, 0.016, 0.012, 30);

    if (!isFastTempo) return baseModifier;

    const fastTempoSynergy = getProgressiveModifier(qualityGap, 5, 0.008, 0.005, 30);
    return clamp(baseModifier + fastTempoSynergy, -0.017, 0.024);
  },

  getLongPassingModifier: (
    userPlayers: Player[],
    userStartingXI: (string | null)[],
    opponentPlayers: Player[],
    opponentStartingXI: (string | null)[],
    isFastTempo: boolean
  ) => {
    const distributors: Player['position'][] = [PlayerPosition.DEF, PlayerPosition.MID];
    const targets: Player['position'][] = [PlayerPosition.MID, PlayerPosition.FWD];
    const defenders: Player['position'][] = [PlayerPosition.DEF];
    const distributionQuality = getWeightedAverage(userPlayers, userStartingXI, {
      passing: 0.38, technique: 0.22, crossing: 0.20, vision: 0.20,
    }, distributors);
    const targetQuality = getWeightedAverage(userPlayers, userStartingXI, {
      heading: 0.27, strength: 0.21, pace: 0.22, attacking: 0.18, positioning: 0.12,
    }, targets);
    const opponentControl = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      heading: 0.27, strength: 0.21, pace: 0.22, defending: 0.18, positioning: 0.12,
    }, defenders);
    const longBallScore = (distributionQuality - 55) * 0.35 + (targetQuality - opponentControl) * 0.75;
    const baseModifier = getProgressiveModifier(longBallScore, 2, 0.018, 0.014, 30);

    if (!isFastTempo) return baseModifier;

    const userTargetPace = getAverage(userPlayers, userStartingXI, ['pace'], targets);
    const opponentDefenderPace = getAverage(opponentPlayers, opponentStartingXI, ['pace'], defenders);
    const fastTempoSynergy = getProgressiveModifier(userTargetPace - opponentDefenderPace, 4, 0.007, 0.004, 25);
    return clamp(baseModifier + fastTempoSynergy, -0.018, 0.025);
  },

  getPressingModifier: (
    userPlayers: Player[],
    userStartingXI: (string | null)[],
    opponentPlayers: Player[],
    opponentStartingXI: (string | null)[]
  ) => {
    const userQuality = getWeightedAverage(userPlayers, userStartingXI, {
      workRate: 0.26, stamina: 0.22, aggression: 0.18, pace: 0.14, mentality: 0.12, strength: 0.08,
    });
    const opponentResistance = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      passing: 0.25, technique: 0.23, vision: 0.18, mentality: 0.12, pace: 0.12, strength: 0.10,
    });
    return getProgressiveModifier(userQuality - opponentResistance, 2.5, 0.015, 0.012, 30);
  },

  getCounterAttackModifier: (
    userPlayers: Player[],
    userStartingXI: (string | null)[],
    opponentPlayers: Player[],
    opponentStartingXI: (string | null)[]
  ) => {
    const transitionPlayers: Player['position'][] = [PlayerPosition.MID, PlayerPosition.FWD];
    const recoveryPlayers: Player['position'][] = [PlayerPosition.DEF, PlayerPosition.MID];
    const transitionQuality = getWeightedAverage(userPlayers, userStartingXI, {
      pace: 0.30, passing: 0.20, vision: 0.17, technique: 0.13, attacking: 0.12, mentality: 0.08,
    }, transitionPlayers);
    const opponentRecovery = getWeightedAverage(opponentPlayers, opponentStartingXI, {
      pace: 0.25, positioning: 0.25, defending: 0.22, workRate: 0.13, stamina: 0.10, mentality: 0.05,
    }, recoveryPlayers);
    return getProgressiveModifier(transitionQuality - opponentRecovery, 2, 0.008, 0.005, 30);
  },
};
