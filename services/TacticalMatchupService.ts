import { Player, PlayerPosition } from '../types';
import { TacticRepository } from '../resources/tactics_db';

export type TacticalMatchupId =
  | 'WIDE_OVERLOAD'
  | 'CENTRAL_DM_GAP'
  | 'HIGH_LINE_PACE_TRAP'
  | 'PRESS_RESISTANCE'
  | 'MIDFIELD_OVERLOAD'
  | 'LOW_BLOCK_STALE_POSSESSION'
  | 'OVERCOMMITTED_FRONT';

export interface TacticalMatchupSignal {
  id: TacticalMatchupId;
  modifier: number;
  weight: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getPlayersInXI = (players: Player[] = [], startingXI: (string | null)[] = []) => {
  const ids = new Set(startingXI.filter((id): id is string => !!id));
  return players.filter(player => ids.has(player.id));
};

const averageAttributes = (
  players: Player[] = [],
  startingXI: (string | null)[] = [],
  positions: PlayerPosition[] | null,
  attributes: Array<keyof Player['attributes']>
) => {
  const xi = getPlayersInXI(players, startingXI);
  const selected = positions ? xi.filter(player => positions.includes(player.position)) : xi;
  const source = selected.length > 0 ? selected : xi;
  if (source.length === 0) return 55;

  return source.reduce((teamSum, player) => {
    const playerAvg = attributes.reduce((sum, attribute) => sum + player.attributes[attribute], 0) / attributes.length;
    return teamSum + playerAvg;
  }, 0) / source.length;
};

export const TacticalMatchupService = {
  getTacticProfile: (tacticId: string) => {
    const tactic = TacticRepository.getById(tacticId);
    const slots = tactic.slots;
    const mids = slots.filter(slot => slot.role === PlayerPosition.MID);
    const defs = slots.filter(slot => slot.role === PlayerPosition.DEF);
    const fwds = slots.filter(slot => slot.role === PlayerPosition.FWD);
    const advanced = slots.filter(slot => slot.role !== PlayerPosition.GK && slot.y <= 0.55);
    const wideThreat = advanced.filter(slot => slot.x <= 0.20 || slot.x >= 0.80).length;
    const wideCover = slots.filter(slot =>
      slot.role !== PlayerPosition.GK &&
      slot.y >= 0.48 &&
      (slot.x <= 0.18 || slot.x >= 0.82)
    ).length;
    const centralMids = mids.filter(slot => slot.x >= 0.30 && slot.x <= 0.70).length;
    const holdingMids = mids.filter(slot => slot.y >= 0.55).length;
    const centralAttackSlots = slots.filter(slot =>
      slot.role !== PlayerPosition.GK &&
      slot.x >= 0.30 &&
      slot.x <= 0.70 &&
      slot.y <= 0.55
    ).length;
    const xs = advanced.map(slot => slot.x);
    const attackWidth = xs.length > 0 ? Math.max(...xs) - Math.min(...xs) : 0.45;
    const backLineY = defs.length > 0 ? defs.reduce((sum, slot) => sum + slot.y, 0) / defs.length : 0.75;

    return {
      tactic,
      midCount: mids.length,
      defCount: defs.length,
      fwdCount: fwds.length,
      wideThreat,
      wideCover,
      centralMids,
      holdingMids,
      centralAttackSlots,
      attackWidth,
      backLineY,
    };
  },

  evaluateShotMatchup: (
    attackingTacticId: string,
    defendingTacticId: string,
    attackingPlayers: Player[] = [],
    attackingXI: (string | null)[] = [],
    defendingPlayers: Player[] = [],
    defendingXI: (string | null)[] = []
  ): { modifier: number; signals: TacticalMatchupSignal[] } => {
    const attacking = TacticalMatchupService.getTacticProfile(attackingTacticId);
    const defending = TacticalMatchupService.getTacticProfile(defendingTacticId);
    const signals: TacticalMatchupSignal[] = [];
    const push = (id: TacticalMatchupId, modifier: number, weight: number) => {
      if (Math.abs(modifier) < 0.001) return;
      signals.push({ id, modifier, weight });
    };

    const attackingPace = averageAttributes(attackingPlayers, attackingXI, [PlayerPosition.FWD, PlayerPosition.MID], ['pace', 'acceleration']);
    const attackingCentralTech = averageAttributes(attackingPlayers, attackingXI, [PlayerPosition.MID], ['technique', 'passing', 'vision', 'mentality']);
    const defendingBackPace = averageAttributes(defendingPlayers, defendingXI, [PlayerPosition.DEF], ['pace', 'acceleration', 'positioning']);
    const defendingPressQuality = averageAttributes(defendingPlayers, defendingXI, [PlayerPosition.MID, PlayerPosition.FWD], ['workRate', 'stamina', 'aggression', 'pace']);

    if (attacking.wideThreat >= 2 && attacking.attackWidth >= 0.68 && defending.wideCover <= 2) {
      const exposure = defending.wideCover <= 1 ? 1 : 0.72;
      push('WIDE_OVERLOAD', 0.007 * exposure, exposure);
    }

    if (attacking.centralAttackSlots >= 3 && defending.holdingMids === 0) {
      const centralWeight = clamp((attacking.centralAttackSlots - 2) / 3, 0.45, 1);
      push('CENTRAL_DM_GAP', 0.008 * centralWeight, centralWeight);
    }

    if (attacking.centralMids - defending.centralMids >= 2 && defending.holdingMids <= 1) {
      const overloadWeight = clamp((attacking.centralMids - defending.centralMids) / 3, 0.45, 1);
      push('MIDFIELD_OVERLOAD', 0.0055 * overloadWeight, overloadWeight);
    }

    const highLinePressure =
      (defending.tactic.attackBias >= 70 ? 0.45 : 0) +
      (defending.tactic.pressingIntensity >= 72 ? 0.35 : 0) +
      (defending.backLineY <= 0.72 ? 0.20 : 0);
    const paceGap = attackingPace - defendingBackPace;
    if (highLinePressure > 0.35 && paceGap > 3) {
      const trapWeight = clamp((paceGap - 3) / 18, 0.25, 1) * clamp(highLinePressure, 0.35, 1);
      push('HIGH_LINE_PACE_TRAP', 0.010 * trapWeight, trapWeight);
    }

    const pressGap = defending.tactic.pressingIntensity - attacking.tactic.pressingIntensity;
    const resistanceGap = attackingCentralTech - defendingPressQuality;
    if (pressGap >= 18 && resistanceGap > 4) {
      const pressWeight = clamp((pressGap - 18) / 42, 0.25, 1) * clamp((resistanceGap - 4) / 20, 0.25, 1);
      push('PRESS_RESISTANCE', 0.007 * pressWeight, pressWeight);
    }

    if (defending.tactic.defenseBias >= 82 && defending.defCount >= 5 && attacking.tactic.attackBias <= 62) {
      const blockWeight = clamp((defending.tactic.defenseBias - 78) / 18, 0.35, 1);
      push('LOW_BLOCK_STALE_POSSESSION', -0.008 * blockWeight, blockWeight);
    }

    if (attacking.tactic.attackBias >= 78 && attacking.fwdCount >= 3 && defending.tactic.defenseBias >= 76 && defending.defCount >= 5) {
      const overcommitWeight = clamp((attacking.tactic.attackBias - 72) / 24, 0.35, 1);
      push('OVERCOMMITTED_FRONT', -0.006 * overcommitWeight, overcommitWeight);
    }

    const modifier = clamp(signals.reduce((sum, signal) => sum + signal.modifier, 0), -0.018, 0.022);
    return { modifier, signals };
  },

  suggestCounterTactics: (opponentTacticId: string): string[] => {
    const opponent = TacticalMatchupService.getTacticProfile(opponentTacticId);
    const tactic = opponent.tactic;

    if (opponent.holdingMids === 0 && opponent.centralAttackSlots >= 3) {
      return ['4-2-3-1', '4-3-3', '3-5-2', '4-5-1'];
    }
    if (opponent.wideCover <= 2 && opponent.attackWidth < 0.55) {
      return ['4-3-3', '4-2-3-1', '3-4-3', '4-4-2-OFF'];
    }
    if (tactic.attackBias >= 72 && tactic.pressingIntensity >= 72) {
      return ['4-4-2-DEF', '4-5-1', '5-3-2', '4-2-3-1'];
    }
    if (tactic.defenseBias >= 82 && opponent.defCount >= 5) {
      return ['3-5-2', '4-2-3-1', '4-3-3', '4-4-2-DIAMOND'];
    }
    // Kontra na zwarte ustawienia z piecioma pomocnikami i jednym napastnikiem, np. 4-1-4-1 gracza.
    if (opponent.midCount >= 5 && opponent.fwdCount <= 1 && opponent.holdingMids >= 1) {
      return ['4-2-3-1', '3-5-2', '4-3-3', '5-2-1-2', '4-4-2-DIAMOND'];
    }
    if (opponent.midCount <= 3) {
      return ['3-5-2', '4-2-3-1', '4-3-3'];
    }

    return [];
  },
};
