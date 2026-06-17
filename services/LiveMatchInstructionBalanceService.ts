import {
  InstructionCounterAttack,
  InstructionIntensity,
  InstructionMindset,
  InstructionPressing,
  InstructionTempo,
  Player,
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

export const LiveMatchInstructionBalanceService = {
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

  getCombinationModifier: (
    tempo: InstructionTempo,
    mindset: InstructionMindset,
    pressing: InstructionPressing,
    counterAttack: InstructionCounterAttack | undefined,
    isAttacking: boolean
  ) => {
    let modifier = 0;

    if (tempo === 'FAST' && mindset === 'OFFENSIVE') modifier += isAttacking ? 0.003 : 0.003;
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
    pressingResponseFactor = 1
  ) => {
    const tempoCost = tempo === 'FAST' ? 0.025 * tempoResponseFactor : 0;
    const intensityCost = intensity === 'AGGRESSIVE'
      ? 0.018 * intensityResponseFactor
      : intensity === 'CAUTIOUS'
        ? -0.012 * intensityResponseFactor
        : 0;
    const pressingCost = pressing === 'PRESSING' ? 0.015 * pressingResponseFactor : 0;
    const fastPressingCost = tempo === 'FAST' && pressing === 'PRESSING' ? 0.004 : 0;
    return tempoCost + intensityCost + pressingCost + fastPressingCost;
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
        const counterBonus = opponentTacticDefBias > 60 ? 0.010 : 0.004;
        modifier += counterBonus * (userTechnique > 62 ? 0.5 : 1);
      }
    } else if (instructions.tempo === 'SLOW' && isAttacking) {
      modifier += LiveMatchInstructionBalanceService.getSlowTempoModifier(
        userPlayers, userStartingXI, opponentPlayers, opponentStartingXI
      );
    }

    if (instructions.mindset === 'OFFENSIVE') {
      if (isAttacking) modifier += 0.015;
      else if (opponentTacticDefBias > 65) modifier += 0.012;
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
