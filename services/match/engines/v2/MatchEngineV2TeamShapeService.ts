import { PlayerPosition, type Tactic, type TacticalInstructions } from '../../../../types';
import type {
  MatchEngineV2PlayerSpatialState,
  MatchEngineV2Point,
  MatchEngineV2TeamPhase,
} from './MatchEngineV2Types';

const PITCH_LENGTH = 105;
const PITCH_WIDTH = 68;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const clampToMovementZone = (
  point: MatchEngineV2Point,
  player: MatchEngineV2PlayerSpatialState,
): MatchEngineV2Point => ({
  x: clamp(point.x, player.movementZone.minX, player.movementZone.maxX),
  y: clamp(point.y, player.movementZone.minY, player.movementZone.maxY),
});

const rolePhaseShift = (
  role: MatchEngineV2PlayerSpatialState['role'],
  phase: MatchEngineV2TeamPhase,
): number => {
  const byPhase: Record<MatchEngineV2TeamPhase, Record<MatchEngineV2PlayerSpatialState['role'], number>> = {
    DEFENSIVE_SHAPE: { GK: 0, DEF: -3.2, MID: -4.5, FWD: -5.5 },
    BUILD_UP: { GK: 0, DEF: 1.2, MID: 0.5, FWD: -1.2 },
    ATTACK: { GK: 0, DEF: 2.5, MID: 5.0, FWD: 6.5 },
    FINAL_THIRD: { GK: 0, DEF: 4.0, MID: 7.5, FWD: 10.0 },
    TRANSITION_ATTACK: { GK: 0, DEF: 1.8, MID: 6.5, FWD: 11.0 },
    TRANSITION_DEFEND: { GK: 0, DEF: -4.5, MID: -7.0, FWD: -4.0 },
  };
  return byPhase[phase][role];
};

const widthScale = (phase: MatchEngineV2TeamPhase, instructions: TacticalInstructions): number => {
  const base: Record<MatchEngineV2TeamPhase, number> = {
    DEFENSIVE_SHAPE: 0.86,
    BUILD_UP: 1.05,
    ATTACK: 1.08,
    FINAL_THIRD: 1.10,
    TRANSITION_ATTACK: 1.04,
    TRANSITION_DEFEND: 0.90,
  };
  const passingAdjustment = instructions.passing === 'SHORT' ? -0.03 : instructions.passing === 'LONG' ? 0.03 : 0;
  return clamp(base[phase] + passingAdjustment, 0.80, 1.14);
};

export type MatchEngineV2TeamShapeTargetInput = {
  player: MatchEngineV2PlayerSpatialState;
  ball: MatchEngineV2Point;
  phase: MatchEngineV2TeamPhase;
  tactic: Tactic;
  instructions: TacticalInstructions;
  isPresser: boolean;
};

/**
 * Produces one target from the formation anchor and the team's shared phase.
 * It contains no RNG and never modifies the score or match events. The same
 * snapshot therefore always creates the same tactical shape.
 */
const targetForPlayer = ({
  player,
  ball,
  phase,
  tactic,
  instructions,
  isPresser,
}: MatchEngineV2TeamShapeTargetInput): {
  point: MatchEngineV2Point;
  intent: MatchEngineV2PlayerSpatialState['movementIntent'];
} => {
  const direction = player.side === 'HOME' ? 1 : -1;
  const hasPossession = phase === 'BUILD_UP' || phase === 'ATTACK' || phase === 'FINAL_THIRD' || phase === 'TRANSITION_ATTACK';

  if (player.role === PlayerPosition.GK) {
    const goalY = player.side === 'HOME' ? 4.8 : PITCH_LENGTH - 4.8;
    const sweeperDepth = hasPossession ? 2.8 : 1.2;
    return {
      intent: 'HOLD_SHAPE',
      point: clampToMovementZone({
        x: clamp(PITCH_WIDTH / 2 + (ball.x - PITCH_WIDTH / 2) * 0.08, 30, 38),
        y: goalY + sweeperDepth * direction,
      }, player),
    };
  }

  if (isPresser && !hasPossession) {
    return {
      intent: 'PRESS',
      point: clampToMovementZone(ball, player),
    };
  }

  const ballProgressForSide = (ball.y - PITCH_LENGTH / 2) * direction;
  const ballLongitudinalShift = clamp(ballProgressForSide * (hasPossession ? 0.14 : 0.10), -6.5, 6.5);
  const ballLateralShift = clamp((ball.x - PITCH_WIDTH / 2) * (hasPossession ? 0.18 : 0.13), -5.5, 5.5);
  const roleShiftFactor = player.role === PlayerPosition.DEF ? 0.72 : player.role === PlayerPosition.MID ? 0.90 : 1;
  const mindsetShift = instructions.mindset === 'OFFENSIVE' ? 2.0 : instructions.mindset === 'DEFENSIVE' ? -2.0 : 0;
  const tacticShift = clamp((tactic.attackBias - tactic.defenseBias) / 18, -2.2, 2.2);
  const scaledAnchorX = PITCH_WIDTH / 2 + (player.anchor.x - PITCH_WIDTH / 2) * widthScale(phase, instructions);
  const centrality = clamp(1 - Math.abs(player.anchor.x - PITCH_WIDTH / 2) / 30, 0.25, 1);

  const point = {
    x: scaledAnchorX + ballLateralShift * centrality,
    y: player.anchor.y + direction * (
      rolePhaseShift(player.role, phase) +
      ballLongitudinalShift * roleShiftFactor +
      mindsetShift +
      tacticShift
    ),
  };

  const intent: MatchEngineV2PlayerSpatialState['movementIntent'] =
    phase === 'TRANSITION_DEFEND' || phase === 'DEFENSIVE_SHAPE'
      ? 'RECOVER'
      : (phase === 'FINAL_THIRD' || phase === 'TRANSITION_ATTACK') && player.role === PlayerPosition.FWD
        ? 'RUN_BEHIND'
        : 'SUPPORT';

  return {
    intent,
    point: clampToMovementZone(point, player),
  };
};

export const MatchEngineV2TeamShapeService = {
  targetForPlayer,
};
