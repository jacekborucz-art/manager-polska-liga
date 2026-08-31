import type {
  MatchEngineV2BallSpatialState,
  MatchEngineV2PlayerSpatialState,
  MatchEngineV2Point,
  MatchEngineV2VisualCue,
} from './MatchEngineV2Types';

const velocityBetween = (
  start: MatchEngineV2BallSpatialState,
  end: MatchEngineV2Point,
  elapsedSeconds: number,
): MatchEngineV2BallSpatialState['velocity'] => ({
  x: (end.x - start.x) / elapsedSeconds,
  y: (end.y - start.y) / elapsedSeconds,
  z: 0,
});

const travellingKind = (cue: MatchEngineV2VisualCue): boolean =>
  cue.kind === 'PASS' ||
  cue.kind === 'CROSS' ||
  cue.kind === 'SHOT' ||
  cue.kind === 'GOAL' ||
  cue.kind === 'BLOCK' ||
  cue.kind === 'SAVE';

const controlledKind = (cue: MatchEngineV2VisualCue): boolean =>
  cue.kind === 'CONTROL' ||
  cue.kind === 'DRIBBLE' ||
  cue.kind === 'TACKLE' ||
  cue.kind === 'TURNOVER' ||
  cue.kind === 'REBOUND';

const resolve = ({
  previous,
  carrier,
  latestCue,
  fallback,
  second,
}: {
  previous: MatchEngineV2BallSpatialState;
  carrier?: MatchEngineV2PlayerSpatialState;
  latestCue?: MatchEngineV2VisualCue;
  fallback: MatchEngineV2Point;
  second: number;
}): MatchEngineV2BallSpatialState => {
  const elapsed = Math.max(0.2, second - previous.lastUpdatedSecond);

  if (latestCue?.atSecond === second && travellingKind(latestCue)) {
    const target = latestCue.end;
    return {
      x: target.x,
      y: target.y,
      z: latestCue.kind === 'SHOT' || latestCue.kind === 'GOAL' ? 1.2 : 0.25,
      velocity: velocityBetween(previous, target, elapsed),
      intendedReceiverId: latestCue.kind === 'PASS' || latestCue.kind === 'CROSS'
        ? latestCue.secondaryPlayerId
        : undefined,
      lastTouchPlayerId: latestCue.actorId ?? previous.lastTouchPlayerId,
      lastUpdatedSecond: second,
      phase: 'TRAVELLING',
    };
  }

  if (latestCue?.atSecond === second && latestCue.kind === 'RESTART') {
    return {
      x: latestCue.end.x,
      y: latestCue.end.y,
      z: 0,
      velocity: { x: 0, y: 0, z: 0 },
      lastTouchPlayerId: latestCue.actorId ?? previous.lastTouchPlayerId,
      lastUpdatedSecond: second,
      phase: 'DEAD',
    };
  }

  if (latestCue?.atSecond === second && controlledKind(latestCue)) {
    const ownerId = latestCue.actorId ?? carrier?.playerId;
    const ownerPoint = ownerId && carrier?.playerId === ownerId ? carrier.position : latestCue.end;
    return {
      x: ownerPoint.x,
      y: ownerPoint.y,
      z: 0,
      velocity: carrier?.playerId === ownerId
        ? { x: carrier.velocity.x, y: carrier.velocity.y, z: 0 }
        : velocityBetween(previous, ownerPoint, elapsed),
      ownerId,
      lastTouchPlayerId: ownerId ?? previous.lastTouchPlayerId,
      lastUpdatedSecond: second,
      phase: 'CONTROLLED',
    };
  }

  if (carrier) {
    return {
      x: carrier.position.x,
      y: carrier.position.y,
      z: 0,
      velocity: { x: carrier.velocity.x, y: carrier.velocity.y, z: 0 },
      ownerId: carrier.playerId,
      lastTouchPlayerId: carrier.playerId,
      lastUpdatedSecond: second,
      phase: 'CONTROLLED',
    };
  }

  return {
    x: fallback.x,
    y: fallback.y,
    z: 0,
    velocity: velocityBetween(previous, fallback, elapsed),
    lastTouchPlayerId: previous.lastTouchPlayerId,
    lastUpdatedSecond: second,
    phase: 'LOOSE',
  };
};

export const MatchEngineV2BallService = {
  resolve,
};
