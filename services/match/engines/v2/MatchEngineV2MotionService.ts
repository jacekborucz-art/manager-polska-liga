import type {
  MatchEngineV2PlayerSpatialState,
  MatchEngineV2Point,
} from './MatchEngineV2Types';

const MAX_INTEGRATION_SECONDS = 1.25;
const MAX_ACCELERATION = 3.2;
const MAX_BRAKING = 4.6;
const MAX_TURN_RADIANS_PER_SECOND = 2.8;
const ARRIVAL_DISTANCE = 0.18;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const normaliseAngle = (angle: number): number => {
  let result = angle;
  while (result > Math.PI) result -= Math.PI * 2;
  while (result < -Math.PI) result += Math.PI * 2;
  return result;
};

const urgentIntent = (intent: MatchEngineV2PlayerSpatialState['movementIntent']): boolean =>
  intent === 'PRESS' || intent === 'RUN_BEHIND' || intent === 'RECOVER';

const advancePlayer = ({
  player,
  proposedTarget,
  proposedIntent,
  matchSecond,
  elapsedSeconds,
  maximumStepMetres,
}: {
  player: MatchEngineV2PlayerSpatialState;
  proposedTarget: MatchEngineV2Point;
  proposedIntent: MatchEngineV2PlayerSpatialState['movementIntent'];
  matchSecond: number;
  elapsedSeconds: number;
  maximumStepMetres: number;
}): void => {
  const mayChangeIntent =
    proposedIntent === player.movementIntent ||
    matchSecond >= player.intentCommittedUntilSecond ||
    urgentIntent(proposedIntent);

  player.target = { ...proposedTarget };
  if (mayChangeIntent && proposedIntent !== player.movementIntent) {
    player.movementIntent = proposedIntent;
    player.intentCommittedUntilSecond = matchSecond + (urgentIntent(proposedIntent) ? 4 : 3);
  }

  const dx = player.target.x - player.position.x;
  const dy = player.target.y - player.position.y;
  const distance = Math.hypot(dx, dy);
  const dt = clamp(elapsedSeconds, 0, MAX_INTEGRATION_SECONDS);
  if (dt <= 0) return;

  if (distance <= ARRIVAL_DISTANCE) {
    player.position = { ...player.target };
    player.velocity = { x: 0, y: 0 };
    player.movementState = 'IDLE';
    return;
  }

  const currentSpeed = Math.hypot(player.velocity.x, player.velocity.y);
  const desiredHeading = Math.atan2(dy, dx);
  const headingDelta = normaliseAngle(desiredHeading - player.facingRadians);
  const maximumTurn = MAX_TURN_RADIANS_PER_SECOND * dt;
  const nextHeading = player.facingRadians + clamp(headingDelta, -maximumTurn, maximumTurn);

  // The stopping-distance term makes a player brake before his target instead
  // of overshooting it and oscillating on alternating snapshots.
  const stoppingLimitedSpeed = Math.sqrt(2 * MAX_BRAKING * distance);
  const desiredSpeed = Math.min(player.metresPerSecond, stoppingLimitedSpeed, distance / dt);
  const speedDelta = desiredSpeed - currentSpeed;
  const accelerationLimit = (speedDelta >= 0 ? MAX_ACCELERATION : MAX_BRAKING) * dt;
  const nextSpeed = clamp(currentSpeed + clamp(speedDelta, -accelerationLimit, accelerationLimit), 0, player.metresPerSecond);
  const step = Math.min(distance, maximumStepMetres, nextSpeed * dt);
  const directionX = Math.cos(nextHeading);
  const directionY = Math.sin(nextHeading);

  player.position = {
    x: player.position.x + directionX * step,
    y: player.position.y + directionY * step,
  };
  player.velocity = {
    x: directionX * nextSpeed,
    y: directionY * nextSpeed,
  };
  player.facingRadians = nextHeading;
  player.movementState = nextSpeed < currentSpeed - 0.05
    ? 'BRAKING'
    : nextSpeed < player.metresPerSecond * 0.72
      ? 'ACCELERATING'
      : 'RUNNING';
};

export const MatchEngineV2MotionService = {
  advancePlayer,
};
