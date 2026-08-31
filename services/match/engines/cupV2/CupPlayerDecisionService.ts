import { MatchEventType, PlayerPosition, type Player, type TacticalInstructions } from '../../../../types';
import type {
  CupAttackPattern,
  CupPitchZone,
  CupPossessionAction,
  CupPossessionDecision,
  CupSpatialDecisionContext,
  CupTeamRuntimeProfile,
} from './CupMatchTypes';
import { clamp, pickWeighted, weightedScore } from './CupMath';

type DecisionInput = {
  attacking: CupTeamRuntimeProfile;
  defending: CupTeamRuntimeProfile;
  zone: CupPitchZone;
  pattern: CupAttackPattern;
  fatigue: Record<string, number>;
  currentCarrierId?: string;
  instructions: TacticalInstructions;
  spatial?: CupSpatialDecisionContext;
  roll: (salt: number) => number;
};

type SpatialConnection = NonNullable<CupPossessionDecision['spatial']>;

const distanceToSegment = (
  point: { x: number; y: number },
  start: { x: number; y: number },
  end: { x: number; y: number },
): number => {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;
  if (lengthSquared < 0.001) return Math.hypot(point.x - start.x, point.y - start.y);
  const projection = clamp(
    ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / lengthSquared,
    0,
    1,
  );
  return Math.hypot(
    point.x - (start.x + segmentX * projection),
    point.y - (start.y + segmentY * projection),
  );
};

const pressureAt = (
  spatial: CupSpatialDecisionContext,
  side: CupTeamRuntimeProfile['side'],
  point: { x: number; y: number },
): number => {
  const opponents = Object.values(spatial.players).filter(player => player.isOnPitch && player.side !== side);
  if (opponents.length === 0) return 20;
  return Math.min(...opponents.map(player => Math.hypot(player.x - point.x, player.y - point.y)));
};

const spatialConnection = (
  spatial: CupSpatialDecisionContext | undefined,
  side: CupTeamRuntimeProfile['side'],
  passer: Player | undefined,
  receiver?: Player,
): SpatialConnection | undefined => {
  if (!spatial || !passer) return undefined;
  const passerPoint = spatial.players[passer.id];
  if (!passerPoint?.isOnPitch) return undefined;
  const receiverPoint = receiver ? spatial.players[receiver.id] : undefined;
  const base: SpatialConnection = {
    passerX: passerPoint.x,
    passerY: passerPoint.y,
    passerPressure: pressureAt(spatial, side, passerPoint),
  };
  if (!receiverPoint?.isOnPitch) return base;

  const opponents = Object.values(spatial.players).filter(player => player.isOnPitch && player.side !== side);
  const laneClearance = opponents.length > 0
    ? Math.min(...opponents.map(player => distanceToSegment(player, passerPoint, receiverPoint)))
    : 20;
  const direction = side === 'HOME' ? 1 : -1;
  return {
    ...base,
    receiverX: receiverPoint.x,
    receiverY: receiverPoint.y,
    passDistance: Math.hypot(receiverPoint.x - passerPoint.x, receiverPoint.y - passerPoint.y),
    forwardProgress: (receiverPoint.y - passerPoint.y) * direction,
    laneClearance,
    receiverPressure: pressureAt(spatial, side, receiverPoint),
  };
};

const spatialReceiverWeight = (connection: SpatialConnection | undefined): number => {
  if (!connection || connection.passDistance === undefined) return 1;
  const distanceFactor =
    connection.passDistance < 3 ? 0.22 :
    connection.passDistance <= 24 ? 1.18 :
    connection.passDistance <= 38 ? 0.92 :
    connection.passDistance <= 50 ? 0.48 : 0.12;
  const laneFactor =
    (connection.laneClearance ?? 20) < 1.8 ? 0.20 :
    (connection.laneClearance ?? 20) < 3.5 ? 0.52 :
    (connection.laneClearance ?? 20) > 7 ? 1.16 : 1;
  const pressureFactor = clamp((connection.receiverPressure ?? 8) / 6, 0.48, 1.18);
  const progressFactor = clamp(1 + (connection.forwardProgress ?? 0) / 90, 0.72, 1.24);
  return distanceFactor * laneFactor * pressureFactor * progressFactor;
};

const passerRoleWeight = (player: Player, zone: CupPitchZone): number => {
  if (zone === 'GK') {
    return player.position === PlayerPosition.GK ? 1.8 : player.position === PlayerPosition.DEF ? 1.2 : 0.25;
  }
  if (zone === 'DEFENSE') {
    return player.position === PlayerPosition.DEF ? 1.5 : player.position === PlayerPosition.MID ? 1 : player.position === PlayerPosition.GK ? 0.65 : 0.25;
  }
  if (zone === 'MIDFIELD') {
    return player.position === PlayerPosition.MID ? 1.55 : player.position === PlayerPosition.DEF ? 0.75 : player.position === PlayerPosition.FWD ? 0.65 : 0.1;
  }
  return player.position === PlayerPosition.MID ? 1.35 : player.position === PlayerPosition.FWD ? 1.1 : player.position === PlayerPosition.DEF ? 0.4 : 0.05;
};

const receiverRoleWeight = (player: Player, zone: CupPitchZone, pattern: CupAttackPattern): number => {
  const directBonus = pattern === 'DIRECT' || pattern === 'COUNTER' ? 0.35 : 0;
  if (zone === 'GK' || zone === 'DEFENSE') {
    return player.position === PlayerPosition.DEF ? 1.2 : player.position === PlayerPosition.MID ? 1.15 : player.position === PlayerPosition.FWD ? 0.35 + directBonus : 0.1;
  }
  if (zone === 'MIDFIELD') {
    return player.position === PlayerPosition.MID ? 1.35 : player.position === PlayerPosition.FWD ? 0.9 + directBonus : player.position === PlayerPosition.DEF ? 0.55 : 0.05;
  }
  return player.position === PlayerPosition.FWD ? 1.55 : player.position === PlayerPosition.MID ? 1.1 : player.position === PlayerPosition.DEF ? 0.25 : 0.03;
};

const receiverConnectionWeight = (
  passer: Player | undefined,
  receiver: Player,
  zone: CupPitchZone,
  pattern: CupAttackPattern,
): number => {
  if (!passer) return 1;
  const advancedZone = zone === 'FINAL_THIRD' || zone === 'BOX' || zone === 'WIDE_LEFT' || zone === 'WIDE_RIGHT';
  const direct = pattern === 'DIRECT' || pattern === 'COUNTER';

  // Passing networks normally connect neighbouring lines. A forward can lay
  // the ball off to midfield or combine with another forward, but should not
  // randomly select a deep centre-back during an attack near the opponent's
  // box. Backward and sideways passes remain available in midfield/build-up.
  if (passer.position === PlayerPosition.FWD) {
    if (receiver.position === PlayerPosition.FWD) return 1.28;
    if (receiver.position === PlayerPosition.MID) return 1.18;
    return advancedZone ? 0.015 : direct ? 0.10 : 0.28;
  }
  if (passer.position === PlayerPosition.MID) {
    if (receiver.position === PlayerPosition.MID) return 1.30;
    if (receiver.position === PlayerPosition.FWD) return direct ? 1.32 : 1.08;
    return advancedZone ? 0.24 : 0.72;
  }
  if (passer.position === PlayerPosition.DEF) {
    if (receiver.position === PlayerPosition.MID) return 1.38;
    if (receiver.position === PlayerPosition.DEF) return 1.14;
    return direct ? 1.02 : 0.58;
  }
  return receiver.position === PlayerPosition.DEF ? 1.45 : receiver.position === PlayerPosition.MID ? 1.12 : 0.30;
};

const fitnessFactor = (player: Player, fatigue: Record<string, number>): number =>
  clamp((fatigue[player.id] ?? player.condition) / 100, 0.35, 1);

const selectWeighted = (
  players: Player[],
  score: (player: Player) => number,
  roll: number,
): Player | undefined => {
  if (players.length === 0) return undefined;
  return pickWeighted(players.map(player => ({
    item: player,
    weight: Math.max(0.1, score(player)),
  })), roll);
};

const selectAction = (
  player: Player | undefined,
  zone: CupPitchZone,
  pattern: CupAttackPattern,
  instructions: TacticalInstructions,
  spatial: SpatialConnection | undefined,
  roll: number,
): CupPossessionAction => {
  if (!player) return 'PASS';
  const wideZone = zone === 'WIDE_LEFT' || zone === 'WIDE_RIGHT';
  const actualWidePosition = spatial ? spatial.passerX < 14 || spatial.passerX > 54 : wideZone;
  const closePressure = spatial ? (spatial.passerPressure ?? 8) < 3.2 : false;
  const openLane = spatial ? (spatial.laneClearance ?? 6) > 5 : false;
  const advancedZone = zone === 'FINAL_THIRD' || zone === 'BOX' || wideZone;
  const shortPassing = instructions.passing === 'SHORT';
  const longPassing = instructions.passing === 'LONG';
  const fastTempo = instructions.tempo === 'FAST';
  const offensive = instructions.mindset === 'OFFENSIVE';

  /*
   * This is an actual football decision, not a cosmetic animation roll. The
   * carrier's technique and mentality establish the base preference, while
   * tactical instructions reshape it and deterministic RNG preserves the
   * uncertainty of a live match. Team success is still resolved by the
   * calibrated duel model, so choosing a dribble cannot bypass defending.
   */
  const passQuality = weightedScore(player.attributes, {
    passing: 0.34,
    vision: 0.24,
    mentality: 0.18,
    technique: 0.14,
    positioning: 0.10,
  });
  const dribbleQuality = weightedScore(player.attributes, {
    dribbling: 0.34,
    technique: 0.24,
    pace: 0.18,
    mentality: 0.14,
    strength: 0.10,
  });
  const crossQuality = weightedScore(player.attributes, {
    crossing: 0.42,
    technique: 0.20,
    vision: 0.16,
    passing: 0.12,
    mentality: 0.10,
  });
  const directQuality = weightedScore(player.attributes, {
    passing: 0.30,
    vision: 0.28,
    mentality: 0.18,
    technique: 0.14,
    attacking: 0.10,
  });

  return pickWeighted([
    {
      item: 'PASS' as const,
      weight: passQuality * (shortPassing ? 1.48 : 1) * (pattern === 'BUILD_UP' ? 1.22 : 1) * (closePressure ? 1.18 : 1),
    },
    {
      item: 'DIRECT_PASS' as const,
      weight: directQuality * (longPassing ? 1.55 : 0.72) * (pattern === 'DIRECT' || pattern === 'COUNTER' ? 1.42 : 1) * (openLane ? 1.22 : 0.88),
    },
    {
      item: 'DRIBBLE' as const,
      weight: dribbleQuality * (advancedZone ? 1.18 : 0.76) * (fastTempo ? 1.17 : 1) * (pattern === 'COUNTER' ? 1.30 : 1) * (closePressure ? 0.72 : 1.14),
    },
    {
      item: 'CROSS' as const,
      weight: crossQuality * (actualWidePosition ? 2.25 : pattern === 'WING_PLAY' && advancedZone ? 1.45 : 0.08) * (offensive ? 1.12 : 1),
    },
  ], roll);
};

export const CupPlayerDecisionService = {
  /**
   * Selects the footballers involved in one possession action. Selection uses
   * role suitability, technical/mental attributes and current fatigue. It does
   * not decide whether the team succeeds; the calibrated team duel still owns
   * that probability, avoiding a balance change during this attribution stage.
   */
  selectPossessionDecision: ({
    attacking,
    defending,
    zone,
    pattern,
    fatigue,
    currentCarrierId,
    instructions,
    spatial,
    roll,
  }: DecisionInput): CupPossessionDecision => {
    const currentCarrier = attacking.activePlayers.find(player => player.id === currentCarrierId);
    const passer = currentCarrier ?? selectWeighted(attacking.activePlayers, player => (
      weightedScore(player.attributes, {
        passing: 0.34,
        vision: 0.22,
        technique: 0.18,
        mentality: 0.12,
        positioning: 0.08,
        workRate: 0.06,
      }) * passerRoleWeight(player, zone) * fitnessFactor(player, fatigue)
    ), roll(271));

    const allReceivers = attacking.outfieldPlayers.filter(player => player.id !== passer?.id);
    const advancedForwardOptions = passer?.position === PlayerPosition.FWD &&
      (zone === 'FINAL_THIRD' || zone === 'BOX' || zone === 'WIDE_LEFT' || zone === 'WIDE_RIGHT')
      ? allReceivers.filter(player => player.position === PlayerPosition.FWD || player.position === PlayerPosition.MID)
      : allReceivers;
    const receivers = advancedForwardOptions.length >= 2 ? advancedForwardOptions : allReceivers;
    const receiver = selectWeighted(receivers, player => (
      weightedScore(player.attributes, {
        positioning: 0.25,
        pace: 0.18,
        technique: 0.16,
        attacking: 0.15,
        vision: 0.10,
        workRate: 0.09,
        strength: 0.07,
      }) *
      receiverRoleWeight(player, zone, pattern) *
      receiverConnectionWeight(passer, player, zone, pattern) *
      spatialReceiverWeight(spatialConnection(spatial, attacking.side, passer, player)) *
      fitnessFactor(player, fatigue)
    ), roll(272));

    const passerPoint = passer && spatial?.players[passer.id];
    const presser = selectWeighted(defending.outfieldPlayers, player => (
      weightedScore(player.attributes, {
        defending: 0.25,
        positioning: 0.20,
        workRate: 0.17,
        pace: 0.13,
        strength: 0.12,
        mentality: 0.13,
      }) * fitnessFactor(player, fatigue) * (
        passerPoint && spatial?.players[player.id]
          ? clamp(18 / Math.max(2, Math.hypot(
              spatial.players[player.id].x - passerPoint.x,
              spatial.players[player.id].y - passerPoint.y,
            )), 0.35, 2.2)
          : 1
      )
    ), roll(273));

    const connection = spatialConnection(spatial, attacking.side, passer, receiver);
    const action = selectAction(passer, zone, pattern, instructions, connection, roll(274));
    return { passer, receiver, presser, action, spatial: connection };
  },

  /**
   * Resolves who reaches a genuinely loose ball after a save, post or block.
   * The defending side receives a contextual advantage, while anticipation,
   * positioning, pace, strength and fatigue still select the actual player.
   */
  selectReboundWinner: ({
    attacking,
    defending,
    fatigue,
    sourceEventType,
    roll,
  }: {
    attacking: CupTeamRuntimeProfile;
    defending: CupTeamRuntimeProfile;
    fatigue: Record<string, number>;
    sourceEventType: MatchEventType;
    roll: number;
  }): { player: Player; side: CupTeamRuntimeProfile['side'] } | undefined => {
    const attackingPool = [...attacking.forwards, ...attacking.midfielders];
    const defendingPool = [...defending.defenders, ...defending.midfielders, ...(defending.goalkeeper ? [defending.goalkeeper] : [])];
    const defenderAdvantage =
      sourceEventType === MatchEventType.SAVE || sourceEventType === MatchEventType.ONE_ON_ONE_SAVE ? 1.52 :
      sourceEventType === MatchEventType.SHOT_BLOCKED ? 1.32 :
      1.16;
    const candidates = [
      ...attackingPool.map(player => ({ player, side: attacking.side, multiplier: 1 })),
      ...defendingPool.map(player => ({ player, side: defending.side, multiplier: defenderAdvantage })),
    ];
    if (candidates.length === 0) return undefined;

    const selected = pickWeighted(candidates.map(candidate => ({
      item: candidate,
      weight: Math.max(0.1, weightedScore(candidate.player.attributes, {
        positioning: 0.28,
        mentality: 0.18,
        pace: 0.15,
        strength: 0.14,
        workRate: 0.13,
        aggression: 0.12,
      }) * fitnessFactor(candidate.player, fatigue) * candidate.multiplier),
    })), roll);

    return { player: selected.player, side: selected.side };
  },
};
