import type { Player } from '../../../../types';
import { PlayerPosition } from '../../../../types';
import type { CupActionIntent, CupChance, CupPitchZone, CupTeamRuntimeProfile } from './CupMatchTypes';
import { clamp, contestProbability, pickWeighted, weightedScore } from './CupMath';

const bestShooterPool = (profile: CupTeamRuntimeProfile): Player[] => {
  const attackers = [...profile.forwards, ...profile.midfielders, ...profile.outfieldPlayers];
  return attackers.length > 0 ? attackers : profile.activePlayers;
};

const shotWeight = (player: Player): number => {
  const positionalBonus =
    player.position === PlayerPosition.FWD ? 18 :
    player.position === PlayerPosition.MID ? 8 :
    player.position === PlayerPosition.DEF ? -6 : -30;

  return Math.max(1, weightedScore(player.attributes, {
    finishing: 0.24,
    attacking: 0.18,
    positioning: 0.16,
    technique: 0.13,
    pace: 0.08,
    heading: 0.08,
    mentality: 0.08,
    strength: 0.05,
  }) + positionalBonus);
};

const creatorWeight = (player: Player): number =>
  Math.max(1, weightedScore(player.attributes, {
    passing: 0.24,
    vision: 0.22,
    technique: 0.18,
    crossing: 0.13,
    dribbling: 0.10,
    mentality: 0.08,
    workRate: 0.05,
  }));

export const CupChanceCreationService = {
  /**
   * Ta warstwa zamienia udaną progresję w konkretną sytuację. Nie każda akcja
   * w ostatniej tercji kończy się strzałem: obrona może zamknąć kąt, złapać
   * spalonego, wymusić dośrodkowanie z trudnej pozycji albo zablokować podanie.
   */
  createChance: ({
    side,
    intent,
    attacking,
    defending,
    zone,
    pressure,
    scoreDiff,
    roll,
  }: {
    side: 'HOME' | 'AWAY';
    intent: CupActionIntent;
    attacking: CupTeamRuntimeProfile;
    defending: CupTeamRuntimeProfile;
    zone: CupPitchZone;
    pressure: number;
    scoreDiff: number;
    roll: (salt: number) => number;
  }): CupChance | null => {
    const creationScore =
      attacking.chanceCreation * 0.34 +
      attacking.progression * 0.20 +
      attacking.finishing * 0.12 +
      attacking.crossing * intent.widthUse * 0.10 +
      attacking.aerialThreat * intent.verticality * 0.08 +
      attacking.mentality * 0.08 +
      attacking.counterThreat * (intent.pattern === 'COUNTER' ? 0.12 : 0.04);

    const preventionScore =
      defending.defensiveShape * 0.42 +
      defending.pressing * 0.18 +
      defending.goalkeeperQuality * 0.10 +
      defending.mentality * 0.12 +
      defending.staminaReserve * 0.08;

    const zoneBonus = zone === 'BOX' ? 0.16 : zone === 'FINAL_THIRD' ? 0.06 : -0.08;
    const pressurePenalty = pressure * 0.0025;
    const leadingChanceDampener =
      scoreDiff >= 5 ? 0.54 :
      scoreDiff >= 4 ? 0.62 :
      scoreDiff >= 3 ? 0.72 :
      scoreDiff >= 2 ? 0.86 :
      scoreDiff >= 1 ? 0.95 :
      1;
    const trailingUrgency =
      scoreDiff < 0 ? clamp(1 + Math.min(3, Math.abs(scoreDiff)) * 0.025, 1, 1.075) :
      1;
    const chanceProbability = clamp(
      (contestProbability(creationScore, preventionScore, 0.205, 24) + zoneBonus - pressurePenalty) *
        leadingChanceDampener *
        trailingUrgency,
      0.012,
      0.52
    );

    if (roll(31) > chanceProbability) return null;

    const shooter = pickWeighted(bestShooterPool(attacking).map(player => ({ item: player, weight: shotWeight(player) })), roll(32));
    const creatorCandidates = attacking.outfieldPlayers.filter(player => player.id !== shooter.id);
    const creator = creatorCandidates.length > 0
      ? pickWeighted(creatorCandidates.map(player => ({ item: player, weight: creatorWeight(player) })), roll(33))
      : undefined;
    const marker = defending.defenders.length > 0
      ? pickWeighted(defending.defenders.map(player => ({ item: player, weight: Math.max(1, player.attributes.defending + player.attributes.positioning) })), roll(34))
      : undefined;

    const rawXg =
      0.044 +
      (creationScore - preventionScore) * 0.0018 +
      (zone === 'BOX' ? 0.112 : zone === 'FINAL_THIRD' ? 0.044 : 0.018) +
      (intent.pattern === 'COUNTER' ? 0.030 : 0) +
      (intent.pattern === 'SET_PIECE' ? 0.018 : 0) -
      pressure * 0.0009;

    const leadingXgDampener =
      scoreDiff >= 5 ? 0.76 :
      scoreDiff >= 4 ? 0.82 :
      scoreDiff >= 3 ? 0.88 :
      scoreDiff >= 2 ? 0.94 :
      1;
    const xG = clamp(clamp(rawXg, 0.015, 0.42) * leadingXgDampener, 0.012, 0.42);
    const kind =
      xG >= 0.30 ? 'ONE_ON_ONE' :
      xG >= 0.21 ? 'BIG_CHANCE' :
      xG >= 0.11 ? 'GOOD_CHANCE' :
      xG >= 0.06 ? 'HALF_CHANCE' :
      'DISTANCE';

    return {
      side,
      kind,
      zone,
      pattern: intent.pattern,
      shooter,
      creator,
      marker,
      xG,
      pressure,
      angle: clamp(0.25 + roll(35) * 0.65 + (zone === 'BOX' ? 0.10 : 0), 0, 1),
      distance: zone === 'BOX' ? 7 + roll(36) * 10 : 16 + roll(36) * 14,
    };
  },
};
