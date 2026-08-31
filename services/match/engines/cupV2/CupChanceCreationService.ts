import type { Player } from '../../../../types';
import { PlayerPosition } from '../../../../types';
import type { CupActionIntent, CupChance, CupPitchZone, CupSpatialDecisionContext, CupTeamRuntimeProfile } from './CupMatchTypes';
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

const nearestOpponentDistance = (
  spatial: CupSpatialDecisionContext,
  side: 'HOME' | 'AWAY',
  playerId: string,
): number => {
  const point = spatial.players[playerId];
  if (!point) return 8;
  const opponents = Object.values(spatial.players).filter(player => player.isOnPitch && player.side !== side);
  return opponents.length > 0
    ? Math.min(...opponents.map(player => Math.hypot(player.x - point.x, player.y - point.y)))
    : 12;
};

const spatialShotWeight = (
  spatial: CupSpatialDecisionContext | undefined,
  side: 'HOME' | 'AWAY',
  playerId: string,
): number => {
  const point = spatial?.players[playerId];
  if (!spatial || !point?.isOnPitch) return 1;
  const goalY = side === 'HOME' ? spatial.pitchLength : 0;
  const distance = Math.hypot(point.x - spatial.pitchWidth / 2, point.y - goalY);
  const pressure = nearestOpponentDistance(spatial, side, playerId);
  return clamp((1.42 - distance / 95) * clamp(pressure / 5, 0.45, 1.22), 0.22, 1.42);
};

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
    spatial,
    preferredShooterId,
    preferredCreatorId,
    roll,
  }: {
    side: 'HOME' | 'AWAY';
    intent: CupActionIntent;
    attacking: CupTeamRuntimeProfile;
    defending: CupTeamRuntimeProfile;
    zone: CupPitchZone;
    pressure: number;
    scoreDiff: number;
    spatial?: CupSpatialDecisionContext;
    preferredShooterId?: string;
    preferredCreatorId?: string;
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

    const shooter = pickWeighted(bestShooterPool(attacking).map(player => ({
      item: player,
      weight: shotWeight(player) *
        spatialShotWeight(spatial, side, player.id) *
        (player.id === preferredShooterId ? 1.75 : 1),
    })), roll(32));
    const creatorCandidates = attacking.outfieldPlayers.filter(player => player.id !== shooter.id);
    const creator = creatorCandidates.length > 0
      ? pickWeighted(creatorCandidates.map(player => ({
          item: player,
          weight: creatorWeight(player) * (player.id === preferredCreatorId ? 1.65 : 1),
        })), roll(33))
      : undefined;
    const shooterPoint = spatial?.players[shooter.id];
    const marker = defending.defenders.length > 0
      ? pickWeighted(defending.defenders.map(player => {
          const markerPoint = spatial?.players[player.id];
          const distanceWeight = shooterPoint && markerPoint
            ? clamp(14 / Math.max(2, Math.hypot(markerPoint.x - shooterPoint.x, markerPoint.y - shooterPoint.y)), 0.35, 2.2)
            : 1;
          return {
            item: player,
            weight: Math.max(1, player.attributes.defending + player.attributes.positioning) * distanceWeight,
          };
        }), roll(34))
      : undefined;

    const goalY = side === 'HOME' ? 105 : 0;
    const spatialDistance = shooterPoint
      ? clamp(Math.hypot(shooterPoint.x - 34, shooterPoint.y - goalY), 5, 36)
      : undefined;
    const spatialAngle = shooterPoint
      ? clamp(1 - Math.abs(shooterPoint.x - 34) / 34, 0.18, 1)
      : undefined;

    const rawXg =
      0.044 +
      (creationScore - preventionScore) * 0.0018 +
      (zone === 'BOX' ? 0.112 : zone === 'FINAL_THIRD' ? 0.044 : 0.018) +
      (intent.pattern === 'COUNTER' ? 0.030 : 0) +
      (intent.pattern === 'SET_PIECE' ? 0.018 : 0) -
      pressure * 0.0009 +
      (spatialDistance !== undefined ? clamp((20 - spatialDistance) * 0.0022, -0.035, 0.035) : 0);

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
      angle: spatialAngle ?? clamp(0.25 + roll(35) * 0.65 + (zone === 'BOX' ? 0.10 : 0), 0, 1),
      distance: spatialDistance ?? (zone === 'BOX' ? 7 + roll(36) * 10 : 16 + roll(36) * 14),
    };
  },
};
