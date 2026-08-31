import { MatchEventType, PlayerPosition } from '../../../../types';
import { TacticRepository } from '../../../../resources/tactics_db';
import { stableHash, type CupLiveMatch, type CupMatchEvent, type CupPitchZone, type CupTeamInput, type CupTeamSide } from '../cupV2';
import type {
  MatchEngineV2BallSpatialState,
  MatchEngineV2PlayerSpatialState,
  MatchEngineV2Point,
  MatchEngineV2SpatialState,
  MatchEngineV2VisualCue,
  MatchEngineV2VisualCueKind,
} from './MatchEngineV2Types';
import { MatchEngineV2TeamPhaseService } from './MatchEngineV2TeamPhaseService';
import { MatchEngineV2TeamShapeService } from './MatchEngineV2TeamShapeService';
import { MatchEngineV2MotionService } from './MatchEngineV2MotionService';
import { MatchEngineV2BallService } from './MatchEngineV2BallService';

const PITCH_LENGTH = 105 as const;
const PITCH_WIDTH = 68 as const;
// One authoritative update represents five match seconds, but the viewer sees
// it in under a second. Capping the projected step prevents a normal tactical
// shift from looking like a player sprinting through the entire pitch.
const MAX_PLAYER_STEP_PER_TICK = 7.5;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const clonePoint = (point: MatchEngineV2Point): MatchEngineV2Point => ({ ...point });

const movementZoneForPlayer = (
  anchor: MatchEngineV2Point,
  role: PlayerPosition,
): MatchEngineV2PlayerSpatialState['movementZone'] => {
  // Two-striker systems need overlapping lateral work areas. Otherwise a
  // scripted central combination can pin both forwards to opposite zone edges
  // only three metres apart, leaving no legal direction for de-clumping.
  const halfWidth = role === PlayerPosition.GK
    ? 11
    : role === PlayerPosition.MID || role === PlayerPosition.FWD
      ? 14
      : 12;
  // The anchor now uses nearly the full pitch, so an outfielder no longer
  // needs a 34-44 metre-long roaming corridor to make the formation breathe.
  // Tighter personal zones preserve tactical lines and stop most players from
  // being pulled into one crowded central band when possession changes.
  const halfLength = role === PlayerPosition.GK ? 5.5 : role === PlayerPosition.FWD ? 18 : role === PlayerPosition.MID ? 17 : 15;
  return {
    minX: clamp(anchor.x - halfWidth, 2.5, PITCH_WIDTH - 2.5),
    maxX: clamp(anchor.x + halfWidth, 2.5, PITCH_WIDTH - 2.5),
    minY: clamp(anchor.y - halfLength, 2.5, PITCH_LENGTH - 2.5),
    maxY: clamp(anchor.y + halfLength, 2.5, PITCH_LENGTH - 2.5),
  };
};

const clampToMovementZone = (
  point: MatchEngineV2Point,
  player: MatchEngineV2PlayerSpatialState,
): MatchEngineV2Point => ({
  x: clamp(point.x, player.movementZone.minX, player.movementZone.maxX),
  y: clamp(point.y, player.movementZone.minY, player.movementZone.maxY),
});

// Exported so tools outside match simulation (the match action editor) can
// place a formation's 22 players using the exact same projection instead of
// duplicating this pitch geometry.
export const anchorForSlot = (side: CupTeamSide, x: number, y: number): MatchEngineV2Point => {
  // Existing tactics use y=0.92 for a goalkeeper and y≈0.15 for a forward.
  // Convert that convention to real pitch metres with HOME attacking toward
  // 105. The earlier 70-metre projection compressed both elevens around the
  // middle. An 81-metre projection gives defenders, midfielders and forwards
  // distinct thirds while the dedicated goalkeeper anchor remains unchanged.
  const homeY = clamp(3 + (1 - y) * 81, 3, PITCH_LENGTH - 3);
  return {
    // Use more of the playable width as well. Wide tactical slots now sit close
    // enough to the touchline to be visually distinct without placing their
    // 36-pixel SVG marker outside the field.
    x: clamp(-1 + x * 70, 2.5, PITCH_WIDTH - 2.5),
    y: side === 'HOME' ? homeY : PITCH_LENGTH - homeY,
  };
};

const createTeamPlayers = (
  team: CupTeamInput,
  side: CupTeamSide,
): Record<string, MatchEngineV2PlayerSpatialState> => {
  const tactic = TacticRepository.getById(team.lineup.tacticId);
  const players: Record<string, MatchEngineV2PlayerSpatialState> = {};

  team.lineup.startingXI.forEach((playerId, index) => {
    if (!playerId) return;
    const slot = tactic.slots[index] ?? tactic.slots[0];
    const player = team.players.find(item => item.id === playerId);
    if (!slot || !player) return;
    const tacticalAnchor = anchorForSlot(side, slot.x, slot.y);
    // Goalkeepers need a dedicated goal-line anchor. Following the generic
    // possession block previously pulled them 18-25 metres from goal whenever
    // their team had the ball, even though the UI still labelled them as GK.
    const anchor = player.position === PlayerPosition.GK
      ? { x: PITCH_WIDTH / 2, y: side === 'HOME' ? 5.5 : PITCH_LENGTH - 5.5 }
      : tacticalAnchor;
    players[playerId] = {
      playerId,
      side,
      role: player.position,
      anchor,
      movementZone: movementZoneForPlayer(anchor, player.position),
      position: clonePoint(anchor),
      target: clonePoint(anchor),
      velocity: { x: 0, y: 0 },
      facingRadians: side === 'HOME' ? Math.PI / 2 : -Math.PI / 2,
      // Pace controls visible travel speed, but the conservative range avoids
      // arcade-like teleporting and will later be calibrated against action time.
      metresPerSecond: clamp(3.8 + player.attributes.pace * 0.055, 4.2, 9.3),
      isOnPitch: true,
      movementIntent: 'HOLD_SHAPE',
      movementState: 'IDLE',
      intentCommittedUntilSecond: 0,
      returningToMovementZone: false,
    };
  });

  return players;
};

const placeInitialKickOff = (
  players: Record<string, MatchEngineV2PlayerSpatialState>,
  live: CupLiveMatch,
): void => {
  const side = live.state.firstHalfKickOffSide;
  const team = side === 'HOME' ? live.input.home : live.input.away;
  const candidates = team.lineup.startingXI
    .filter((playerId): playerId is string => Boolean(playerId))
    .map(playerId => players[playerId])
    .filter((player): player is MatchEngineV2PlayerSpatialState => Boolean(player) && player.role !== 'GK');
  const kicker = candidates.find(player => player.role === 'MID')
    ?? candidates.find(player => player.role === 'FWD')
    ?? candidates[0];
  const support = candidates.find(player => player.playerId !== kicker?.playerId && player.role === 'FWD')
    ?? candidates.find(player => player.playerId !== kicker?.playerId);
  if (!kicker) return;

  // The authoritative opening event also prefers the first midfielder, so the
  // visible player standing over the ball is the same player who executes the
  // recorded kick-off. This is presentation setup only and uses no extra RNG.
  const direction = side === 'HOME' ? 1 : -1;
  kicker.position = { x: PITCH_WIDTH / 2, y: PITCH_LENGTH / 2 };
  kicker.target = clonePoint(kicker.position);
  kicker.returningToMovementZone = true;
  if (support) {
    support.position = { x: PITCH_WIDTH / 2 - 4.2, y: PITCH_LENGTH / 2 - direction * 3.4 };
    support.target = clonePoint(support.position);
    support.returningToMovementZone = true;
  }
};

const zonePoint = (zone: CupPitchZone, possession: CupTeamSide): MatchEngineV2Point => {
  const attackingY: Record<CupPitchZone, number> = {
    GK: 8,
    DEFENSE: 27,
    MIDFIELD: 52.5,
    FINAL_THIRD: 76,
    BOX: 94,
    WIDE_LEFT: 68,
    WIDE_RIGHT: 68,
  };
  const baseY = attackingY[zone];
  return {
    x: zone === 'WIDE_LEFT' ? 8 : zone === 'WIDE_RIGHT' ? 60 : 34,
    y: possession === 'HOME' ? baseY : PITCH_LENGTH - baseY,
  };
};

const moveTowards = (
  current: MatchEngineV2Point,
  target: MatchEngineV2Point,
  maxDistance: number,
): MatchEngineV2Point => {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= maxDistance || distance === 0) return clonePoint(target);
  const ratio = maxDistance / distance;
  return {
    x: current.x + dx * ratio,
    y: current.y + dy * ratio,
  };
};

const applyPlayerSeparation = (players: Record<string, MatchEngineV2PlayerSpatialState>): void => {
  const active = Object.values(players).filter(player => player.isOnPitch);
  // Player markers are 36 SVG pixels wide. On the 540 x 720 pitch this is
  // up to roughly 5.3 pitch metres, so the old 1.15-metre collision radius let
  // icons sit almost completely on top of each other. This distance protects
  // the visible marker, while action actors may still approach closely enough
  // for tackles and contested balls to look natural.
  const minimumDistance = 5.3;

  // Several inexpensive relaxation passes are enough for only 22 players.
  // Every correction is immediately clamped to the player's own tactical zone;
  // otherwise the later zone clamp could recreate the overlap we just removed.
  // Dense action projections can place several attackers in the same small
  // area. Extra deterministic relaxation passes let the correction propagate
  // through the whole cluster instead of fixing only its first pair.
  for (let iteration = 0; iteration < 14; iteration += 1) {
    for (let firstIndex = 0; firstIndex < active.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < active.length; secondIndex += 1) {
        const first = active[firstIndex];
        const second = active[secondIndex];
        let dx = second.position.x - first.position.x;
        let dy = second.position.y - first.position.y;
        let distance = Math.hypot(dx, dy);
        if (distance >= minimumDistance) continue;
        if (distance < 0.001) {
          const direction = first.playerId.localeCompare(second.playerId) <= 0 ? 1 : -1;
          dx = direction;
          dy = 0;
          distance = 1;
        }
        const correction = (minimumDistance - distance) / 2;
        const normalX = dx / distance;
        const normalY = dy / distance;
        const firstCorrection = {
          x: clamp(first.position.x - normalX * correction, 1, PITCH_WIDTH - 1),
          y: clamp(first.position.y - normalY * correction, 1, PITCH_LENGTH - 1),
        };
        const secondCorrection = {
          x: clamp(second.position.x + normalX * correction, 1, PITCH_WIDTH - 1),
          y: clamp(second.position.y + normalY * correction, 1, PITCH_LENGTH - 1),
        };
        first.position = first.returningToMovementZone ? firstCorrection : clampToMovementZone(firstCorrection, first);
        second.position = second.returningToMovementZone ? secondCorrection : clampToMovementZone(secondCorrection, second);
      }
    }
  }
};

const enforceGoalkeeperArea = (players: Record<string, MatchEngineV2PlayerSpatialState>): void => {
  Object.values(players).forEach(player => {
    if (!player.isOnPitch || player.role !== 'GK') return;
    player.position.x = clamp(player.position.x, 20, 48);
    player.position.y = player.side === 'HOME'
      ? clamp(player.position.y, 3.5, 11)
      : clamp(player.position.y, PITCH_LENGTH - 11, PITCH_LENGTH - 3.5);
  });
};

const enforceMovementZones = (players: Record<string, MatchEngineV2PlayerSpatialState>): void => {
  Object.values(players).forEach(player => {
    if (!player.isOnPitch || player.role === 'GK') return;
    player.target = clampToMovementZone(player.target, player);
    if (!player.returningToMovementZone) {
      player.position = clampToMovementZone(player.position, player);
      return;
    }
    const inside =
      player.position.x >= player.movementZone.minX &&
      player.position.x <= player.movementZone.maxX &&
      player.position.y >= player.movementZone.minY &&
      player.position.y <= player.movementZone.maxY;
    if (inside) player.returningToMovementZone = false;
  });
};

const enforceMaximumTickTravel = (
  players: Record<string, MatchEngineV2PlayerSpatialState>,
  startPositions: Record<string, MatchEngineV2Point>,
  elapsedSeconds: number,
): void => {
  const maximumTravel = 9;
  Object.values(players).forEach(player => {
    const start = startPositions[player.playerId];
    if (!start || !player.isOnPitch) return;
    const distance = Math.hypot(player.position.x - start.x, player.position.y - start.y);
    if (distance <= maximumTravel) return;
    player.position = moveTowards(start, player.position, maximumTravel);
    const dx = player.position.x - start.x;
    const dy = player.position.y - start.y;
    const dt = Math.max(0.2, Math.min(1.25, elapsedSeconds));
    const speed = Math.min(player.metresPerSecond, Math.hypot(dx, dy) / dt);
    player.facingRadians = Math.atan2(dy, dx);
    player.velocity = {
      x: Math.cos(player.facingRadians) * speed,
      y: Math.sin(player.facingRadians) * speed,
    };
  });
};

const nearestCarrier = (
  players: Record<string, MatchEngineV2PlayerSpatialState>,
  side: CupTeamSide,
  point: MatchEngineV2Point,
): MatchEngineV2PlayerSpatialState | undefined =>
  Object.values(players)
    .filter(player => player.side === side && player.isOnPitch)
    .sort((a, b) =>
      Math.hypot(a.position.x - point.x, a.position.y - point.y) -
      Math.hypot(b.position.x - point.x, b.position.y - point.y)
    )[0];

const synchronizeLineups = (spatial: MatchEngineV2SpatialState, live: CupLiveMatch): void => {
  (['HOME', 'AWAY'] as CupTeamSide[]).forEach(side => {
    const team = side === 'HOME' ? live.input.home : live.input.away;
    const active = new Set(team.lineup.startingXI.filter((id): id is string => Boolean(id)));
    Object.values(spatial.players).forEach(player => {
      if (player.side === side) {
        player.isOnPitch = active.has(player.playerId) && !live.state.redCards[player.playerId];
      }
    });

    const missingActivePlayer = [...active].filter(playerId => !spatial.players[playerId]);
    if (!missingActivePlayer.length) return;
    const rebuilt = createTeamPlayers(team, side);
    missingActivePlayer.forEach(playerId => {
      const player = rebuilt[playerId];
      if (player) spatial.players[playerId] = player;
    });
  });
};

const pressingPlayersForSide = (
  spatial: MatchEngineV2SpatialState,
  live: CupLiveMatch,
  side: CupTeamSide,
  ball: MatchEngineV2Point,
): Set<string> => {
  if (side === live.state.possession) return new Set();
  const team = side === 'HOME' ? live.input.home : live.input.away;
  const phase = spatial.teamContexts[side].phase;
  const presserCount = team.instructions.pressing === 'PRESSING' || phase === 'TRANSITION_DEFEND' ? 2 : 1;
  return new Set(
    Object.values(spatial.players)
      .filter(player => player.side === side && player.isOnPitch && player.role !== PlayerPosition.GK)
      .sort((first, second) =>
        Math.hypot(first.position.x - ball.x, first.position.y - ball.y) -
        Math.hypot(second.position.x - ball.x, second.position.y - ball.y)
      )
      .slice(0, presserCount)
      .map(player => player.playerId),
  );
};

const cueKind = (type: MatchEventType): MatchEngineV2VisualCueKind => {
  if (type === MatchEventType.MISPLACED_PASS) return 'TURNOVER';
  if (type === MatchEventType.BALL_CONTROL) return 'CONTROL';
  if (type === MatchEventType.DRIBBLING) return 'DRIBBLE';
  if (type === MatchEventType.TACKLE_WON) return 'TACKLE';
  if (type === MatchEventType.CROSS_NEAR_POST || type === MatchEventType.CROSS_FAR_POST || type === MatchEventType.CROSS_BLOCKED) return 'CROSS';
  if (type === MatchEventType.SHOT_BLOCKED) return 'BLOCK';
  if (type === MatchEventType.REBOUND_WON) return 'REBOUND';
  if (type === MatchEventType.GOAL || type === MatchEventType.ONE_ON_ONE_GOAL || type === MatchEventType.PENALTY_SCORED) return 'GOAL';
  if (
    type === MatchEventType.SHOT ||
    type === MatchEventType.SHOT_ON_TARGET ||
    type === MatchEventType.SHOT_POST ||
    type === MatchEventType.SHOT_BAR ||
    type === MatchEventType.ONE_ON_ONE_MISS ||
    type === MatchEventType.PENALTY_MISSED
  ) return 'SHOT';
  if (type === MatchEventType.SAVE || type === MatchEventType.ONE_ON_ONE_SAVE) return 'SAVE';
  if (type === MatchEventType.YELLOW_CARD || type === MatchEventType.RED_CARD) return 'CARD';
  if (type === MatchEventType.INJURY_LIGHT || type === MatchEventType.INJURY_SEVERE) return 'INJURY';
  if (type === MatchEventType.MEDICAL_TREATMENT) return 'INJURY';
  if (type === MatchEventType.SUBSTITUTION) return 'SUBSTITUTION';
  if (
    type === MatchEventType.CORNER ||
    type === MatchEventType.CORNER_TAKEN ||
    type === MatchEventType.THROW_IN ||
    type === MatchEventType.KICK_OFF ||
    type === MatchEventType.GOAL_KICK ||
    type === MatchEventType.GK_LONG_THROW ||
    type === MatchEventType.FREE_KICK ||
    type === MatchEventType.FREE_KICK_DANGEROUS ||
    type === MatchEventType.PENALTY_AWARDED ||
    type === MatchEventType.OFFSIDE
  ) return 'RESTART';
  if (
    type === MatchEventType.FOUL ||
    type === MatchEventType.ADVANTAGE_PLAYED ||
    type === MatchEventType.FOUL_JERSEY ||
    type === MatchEventType.FOUL_PUSH ||
    type === MatchEventType.HANDBALL
  ) return 'FOUL';
  return 'PASS';
};

const cueDuration = (kind: MatchEngineV2VisualCueKind): number => {
  if (kind === 'SHOT' || kind === 'GOAL' || kind === 'SAVE') return 850;
  if (kind === 'CROSS') return 900;
  if (kind === 'TACKLE' || kind === 'BLOCK' || kind === 'REBOUND') return 620;
  if (kind === 'CONTROL') return 420;
  if (kind === 'DRIBBLE') return 760;
  if (kind === 'RESTART') return 1100;
  if (kind === 'CARD' || kind === 'INJURY' || kind === 'SUBSTITUTION') return 1400;
  return 700;
};

const eventTarget = (event: CupMatchEvent, side: CupTeamSide, fallbackZone: CupPitchZone): MatchEngineV2Point => {
  const kind = cueKind(event.type);
  const attackingGoalY = side === 'HOME' ? PITCH_LENGTH : 0;
  const attackDirection = side === 'HOME' ? 1 : -1;
  const setPieceKind = event.detail?.setPieceKind;

  // The restart subtype describes how the players line up, but an ensuing
  // shot still travels from that restart position towards the actual goal.
  if (kind === 'SHOT' || kind === 'GOAL' || kind === 'SAVE') {
    return { x: PITCH_WIDTH / 2, y: side === 'HOME' ? PITCH_LENGTH - 1 : 1 };
  }

  // Restarts need real pitch coordinates. The old generic zone point placed a
  // penalty around the edge of the final third and made direct free kicks look
  // exactly like ordinary passes, even though the match event was correct.
  if (event.type === MatchEventType.PENALTY_AWARDED || setPieceKind === 'PENALTY') {
    return { x: PITCH_WIDTH / 2, y: attackingGoalY - attackDirection * 11 };
  }
  if (event.type === MatchEventType.FREE_KICK_DANGEROUS || setPieceKind === 'FREE_KICK_DIRECT') {
    return {
      x: 30 + stableHash(`${event.id}:direct-free-kick`) % 9,
      y: attackingGoalY - attackDirection * 23,
    };
  }
  if (event.type === MatchEventType.FREE_KICK || setPieceKind === 'FREE_KICK_WIDE') {
    const left = stableHash(`${event.id}:wide-free-kick`) % 2 === 0;
    return { x: left ? 11 : PITCH_WIDTH - 11, y: attackingGoalY - attackDirection * 27 };
  }
  const zone = event.zone ?? fallbackZone;
  const point = zonePoint(zone, side);
  if (event.type === MatchEventType.CORNER) {
    return {
      x: zone === 'WIDE_LEFT' ? 0.5 : PITCH_WIDTH - 0.5,
      y: side === 'HOME' ? PITCH_LENGTH - 0.5 : 0.5,
    };
  }
  if (event.type === MatchEventType.CORNER_TAKEN) {
    return zonePoint('BOX', side);
  }
  if (event.type === MatchEventType.THROW_IN) {
    return { x: point.x <= PITCH_WIDTH / 2 ? 0.5 : PITCH_WIDTH - 0.5, y: point.y };
  }
  if (event.type === MatchEventType.GOAL_KICK || event.type === MatchEventType.GK_LONG_THROW) {
    return zonePoint('DEFENSE', side);
  }
  return point;
};

const actionTargetForZone = (
  event: CupMatchEvent,
  side: CupTeamSide,
  fallbackZone: CupPitchZone,
  participant: MatchEngineV2PlayerSpatialState | undefined,
): MatchEngineV2Point => {
  const zone = event.zone ?? fallbackZone;
  const target = zonePoint(zone, side);
  if (zone === 'WIDE_LEFT' || zone === 'WIDE_RIGHT') return target;
  return {
    x: clamp((participant?.position.x ?? target.x) * 0.68 + target.x * 0.32, 3, PITCH_WIDTH - 3),
    y: target.y,
  };
};

const carryTarget = (
  start: MatchEngineV2Point,
  event: CupMatchEvent,
  side: CupTeamSide,
  fallbackZone: CupPitchZone,
): MatchEngineV2Point => {
  const tacticalTarget = eventTarget(event, side, fallbackZone);
  const direction = side === 'HOME' ? 1 : -1;
  const desired = {
    x: start.x + (tacticalTarget.x - start.x) * 0.38,
    y: start.y + direction * (event.pattern === 'COUNTER' ? 11 : 7.5),
  };
  return moveTowards(start, {
    x: clamp(desired.x, 2.5, PITCH_WIDTH - 2.5),
    y: clamp(desired.y, 2.5, PITCH_LENGTH - 2.5),
  }, event.pattern === 'COUNTER' ? 12 : 8.5);
};

const projectNewEvents = (spatial: MatchEngineV2SpatialState, live: CupLiveMatch): void => {
  const newEvents = live.state.events.slice(spatial.lastEventIndex);
  const cues: MatchEngineV2VisualCue[] = [];
  const workingPositions = Object.fromEntries(
    Object.entries(spatial.players).map(([id, player]) => [id, clonePoint(player.position)])
  );
  let ballCursor: MatchEngineV2Point = { x: spatial.ball.x, y: spatial.ball.y };

  newEvents.forEach(event => {
    const side = event.side ?? live.state.possession;
    const kind = cueKind(event.type);
    const primaryPlayer = event.playerId ? spatial.players[event.playerId] : undefined;
    const secondaryPlayer = event.secondaryPlayerId ? spatial.players[event.secondaryPlayerId] : undefined;
    const markerId = typeof event.detail?.markerId === 'string' ? event.detail.markerId : undefined;
    const marker = markerId ? spatial.players[markerId] : undefined;
    const fallbackTarget = eventTarget(event, side, live.state.ballZone);
    const actor = primaryPlayer ?? nearestCarrier(spatial.players, side, fallbackTarget);
    const previousCue = cues.at(-1) ?? spatial.visualCues.at(-1);
    const sequenceId = typeof event.detail?.sequenceId === 'string' ? event.detail.sequenceId : undefined;
    const continuesSequence = Boolean(sequenceId && previousCue?.sequenceId === sequenceId);
    const isBlockedCross = event.type === MatchEventType.CROSS_BLOCKED;
    const receiverPoint = secondaryPlayer
      ? workingPositions[secondaryPlayer.playerId] ?? secondaryPlayer.position
      : undefined;
    const restartAtCentre = event.type === MatchEventType.KICK_OFF;
    const restartAtGoal = event.type === MatchEventType.GOAL_KICK || event.type === MatchEventType.GK_LONG_THROW;
    const restartFromThrowIn = event.type === MatchEventType.THROW_IN;
    const recordedStart = typeof event.detail?.startX === 'number' && typeof event.detail?.startY === 'number'
      ? { x: clamp(event.detail.startX, 0, PITCH_WIDTH), y: clamp(event.detail.startY, 0, PITCH_LENGTH) }
      : undefined;
    const recordedEnd = typeof event.detail?.endX === 'number' && typeof event.detail?.endY === 'number'
      ? { x: clamp(event.detail.endX, 0, PITCH_WIDTH), y: clamp(event.detail.endY, 0, PITCH_LENGTH) }
      : undefined;
    const start = restartAtCentre
      ? { x: PITCH_WIDTH / 2, y: PITCH_LENGTH / 2 }
      : restartAtGoal
        ? { x: PITCH_WIDTH / 2, y: side === 'HOME' ? 5.5 : PITCH_LENGTH - 5.5 }
        : restartFromThrowIn
          ? clonePoint(fallbackTarget)
          : continuesSequence && previousCue
            ? clonePoint(previousCue.end)
            : clonePoint(recordedStart ?? ballCursor);

    let target: MatchEngineV2Point;
    if (restartAtCentre) {
      target = { x: PITCH_WIDTH / 2, y: PITCH_LENGTH / 2 + (side === 'HOME' ? 2.8 : -2.8) };
    } else if (restartAtGoal) {
      target = actionTargetForZone(event, side, 'DEFENSE', secondaryPlayer ?? actor);
    } else if (restartFromThrowIn) {
      // THROW_IN is already the executed restart in the authoritative event
      // stream. Animate the ball from outside the line to the named receiver
      // instead of showing only an abstract movement towards the touchline.
      const receivingTarget = receiverPoint ?? {
        x: start.x < PITCH_WIDTH / 2 ? 8 : PITCH_WIDTH - 8,
        y: clamp(start.y + (side === 'HOME' ? 5 : -5), 6, PITCH_LENGTH - 6),
      };
      const thrownTarget = moveTowards(start, {
        x: clamp(receivingTarget.x, 5, PITCH_WIDTH - 5),
        y: clamp(receivingTarget.y, 5, PITCH_LENGTH - 5),
      }, 10);
      target = secondaryPlayer ? clampToMovementZone(thrownTarget, secondaryPlayer) : thrownTarget;
    } else if (kind === 'DRIBBLE') {
      const carry = carryTarget(start, event, side, live.state.ballZone);
      target = actor ? clampToMovementZone(carry, actor) : carry;
    } else if ((kind === 'PASS' || kind === 'CROSS') && secondaryPlayer) {
      const tacticalReception = actionTargetForZone(event, side, live.state.ballZone, secondaryPlayer);
      const actionDecision = event.detail?.actionDecision;
      const maximumReceivingRun = kind === 'CROSS'
        ? 9.5
        : actionDecision === 'DIRECT_PASS' || event.pattern === 'COUNTER'
          ? 8.5
          : 6.5;
      // A zone transition is a tactical abstraction, not permission to move a
      // receiver thirty metres in one visual pass. He checks toward the new
      // zone by a plausible amount; later formation ticks continue the run.
      target = recordedEnd
        ? clampToMovementZone(recordedEnd, secondaryPlayer)
        : clampToMovementZone(
            moveTowards(receiverPoint ?? secondaryPlayer.position, tacticalReception, maximumReceivingRun),
            secondaryPlayer,
          );
    } else if (isBlockedCross) {
      target = clonePoint(start);
    } else if (kind === 'TURNOVER' || kind === 'TACKLE' || kind === 'CONTROL' || kind === 'REBOUND') {
      target = kind === 'CONTROL'
        ? moveTowards(start, fallbackTarget, 1.4)
        : clonePoint(start);
    } else if (kind === 'BLOCK' && marker) {
      target = clonePoint(workingPositions[marker.playerId] ?? marker.position);
    } else if (kind === 'FOUL' || kind === 'CARD' || kind === 'INJURY' || kind === 'SUBSTITUTION') {
      // Administrative and stoppage events describe what happened around the
      // current ball location. They must not manufacture an unrelated ball
      // flight to a generic zone merely because the commentary has a player.
      target = clonePoint(start);
    } else {
      target = fallbackTarget;
    }

    cues.push({
      id: `visual_${event.id}`,
      sourceEventId: event.id,
      sequenceId,
      sourceEventType: event.type,
      setPieceKind:
        event.detail?.setPieceKind === 'CORNER' ||
        event.detail?.setPieceKind === 'FREE_KICK_WIDE' ||
        event.detail?.setPieceKind === 'FREE_KICK_DIRECT' ||
        event.detail?.setPieceKind === 'PENALTY'
          ? event.detail.setPieceKind
          : event.type === MatchEventType.CORNER || event.type === MatchEventType.CORNER_TAKEN
            ? 'CORNER'
            : event.type === MatchEventType.PENALTY_AWARDED
              ? 'PENALTY'
              : event.type === MatchEventType.FREE_KICK_DANGEROUS
                ? 'FREE_KICK_DIRECT'
                : event.type === MatchEventType.FREE_KICK
                  ? 'FREE_KICK_WIDE'
                  : undefined,
      kind,
      atSecond: event.second,
      side: event.side,
      actorId: actor?.playerId,
      secondaryPlayerId: event.secondaryPlayerId,
      start,
      end: target,
      durationMs: cueDuration(kind),
      xG: event.xG,
    });

    ballCursor = clonePoint(target);
    if (actor) {
      if (kind === 'DRIBBLE' || kind === 'CONTROL' || kind === 'REBOUND' || kind === 'TACKLE' || kind === 'TURNOVER') {
        workingPositions[actor.playerId] = clonePoint(target);
      } else if (restartAtCentre || restartAtGoal) {
        workingPositions[actor.playerId] = clonePoint(start);
      }
    }
    if (secondaryPlayer && (kind === 'PASS' || kind === 'CROSS')) {
      workingPositions[secondaryPlayer.playerId] = clonePoint(target);
    }
  });

  // `workingPositions` is local action geometry used to connect every cue in
  // one sequence. It is intentionally not copied back into persistent player
  // positions: doing that after the motion step was a hidden teleport. The
  // next spatial tick moves the real formation, while the frame controller
  // shows the exact recorded pass/dribble between those snapshots.

  spatial.lastEventIndex = live.state.events.length;
  // Detailed action chains create several short cues per possession. A larger
  // bounded buffer preserves first-half goal replays without allowing an
  // abnormal extra-time match to grow presentation memory without a limit.
  spatial.visualCues = [...spatial.visualCues, ...cues].slice(-1200);
};

export const MatchEngineV2SpatialService = {
  create: (live: CupLiveMatch): MatchEngineV2SpatialState => {
    const players = {
      ...createTeamPlayers(live.input.home, 'HOME'),
      ...createTeamPlayers(live.input.away, 'AWAY'),
    };
    placeInitialKickOff(players, live);
    const ball: MatchEngineV2BallSpatialState = {
      x: PITCH_WIDTH / 2,
      y: PITCH_LENGTH / 2,
      z: 0,
      velocity: { x: 0, y: 0, z: 0 },
      lastUpdatedSecond: live.state.second,
      phase: 'DEAD',
    };
    return {
      pitchLength: PITCH_LENGTH,
      pitchWidth: PITCH_WIDTH,
      lastSecond: live.state.second,
      players,
      ball,
      lastPossession: live.state.possession,
      teamContexts: {
        HOME: MatchEngineV2TeamPhaseService.createContext('HOME', live.state.possession, live.state.ballZone, live.state.second),
        AWAY: MatchEngineV2TeamPhaseService.createContext('AWAY', live.state.possession, live.state.ballZone, live.state.second),
      },
      lastEventIndex: 0,
      visualCues: [],
    };
  },

  /**
   * Stage-one spatial projection. It gives the renderer stable, bounded and
   * formation-aware coordinates while the next engine stage replaces zone
   * projection with individual pass/run/shot trajectories.
   */
  synchronize: (spatial: MatchEngineV2SpatialState, live: CupLiveMatch): void => {
    synchronizeLineups(spatial, live);
    const startPositions = Object.fromEntries(Object.entries(spatial.players).map(([playerId, player]) => [
      playerId,
      clonePoint(player.position),
    ]));
    const elapsed = Math.max(0, live.state.second - spatial.lastSecond);
    const movementWindow = Math.min(5, elapsed);
    const ballTarget = zonePoint(live.state.ballZone, live.state.possession);
    const possessionChanged = spatial.lastPossession !== live.state.possession;

    (['HOME', 'AWAY'] as CupTeamSide[]).forEach(side => {
      const previous = spatial.teamContexts[side];
      spatial.teamContexts[side] = MatchEngineV2TeamPhaseService.updateContext(
        previous,
        side,
        live.state.possession,
        live.state.ballZone,
        live.state.second,
        possessionChanged,
      );
    });
    const pressingPlayers = {
      HOME: pressingPlayersForSide(spatial, live, 'HOME', ballTarget),
      AWAY: pressingPlayersForSide(spatial, live, 'AWAY', ballTarget),
    };

    Object.values(spatial.players).forEach(player => {
      if (!player.isOnPitch) return;
      const team = player.side === 'HOME' ? live.input.home : live.input.away;
      const movement = MatchEngineV2TeamShapeService.targetForPlayer({
        player,
        ball: ballTarget,
        phase: spatial.teamContexts[player.side].phase,
        tactic: team.tactic,
        instructions: team.instructions,
        isPresser: pressingPlayers[player.side].has(player.playerId),
      });
      MatchEngineV2MotionService.advancePlayer({
        player,
        proposedTarget: movement.point,
        proposedIntent: movement.intent,
        matchSecond: live.state.second,
        elapsedSeconds: movementWindow,
        maximumStepMetres: MAX_PLAYER_STEP_PER_TICK,
      });
    });
    enforceMovementZones(spatial.players);
    applyPlayerSeparation(spatial.players);
    // Project action actors after formation movement. The resulting positions
    // become the next snapshot baseline instead of being overwritten by a
    // generic block shift in the same tick.
    projectNewEvents(spatial, live);
    // A tackle or reception may deliberately converge two action paths on one
    // point. Resolve marker overlap after projection as well, while leaving the
    // authoritative event and ball outcome unchanged.
    enforceMovementZones(spatial.players);
    applyPlayerSeparation(spatial.players);
    enforceGoalkeeperArea(spatial.players);
    // Separation and a sudden transition can otherwise combine into one large
    // displacement. This final safety boundary protects persistent motion;
    // the SVG declumper may still make a tiny cosmetic adjustment to markers.
    enforceMaximumTickTravel(spatial.players, startPositions, movementWindow);
    enforceMovementZones(spatial.players);
    enforceGoalkeeperArea(spatial.players);
    // The travel cap can shorten the final half of a separation correction.
    // Restore only the marker-safe distance afterwards; this adjustment is
    // small and does not redirect the player's football movement.
    applyPlayerSeparation(spatial.players);
    enforceMovementZones(spatial.players);
    enforceGoalkeeperArea(spatial.players);

    const authoritativeCarrier = live.state.ballCarrierId
      ? spatial.players[live.state.ballCarrierId]
      : undefined;
    const carrier = authoritativeCarrier?.isOnPitch && authoritativeCarrier.side === live.state.possession
      ? authoritativeCarrier
      : nearestCarrier(spatial.players, live.state.possession, ballTarget);
    spatial.ball = MatchEngineV2BallService.resolve({
      previous: spatial.ball,
      carrier,
      latestCue: spatial.visualCues.at(-1),
      fallback: ballTarget,
      second: live.state.second,
    });
    spatial.lastPossession = live.state.possession;
    spatial.lastSecond = live.state.second;
  },

  clone: (spatial: MatchEngineV2SpatialState): MatchEngineV2SpatialState => ({
    ...spatial,
    players: Object.fromEntries(Object.entries(spatial.players).map(([id, player]) => [id, {
      ...player,
      anchor: clonePoint(player.anchor),
      movementZone: { ...player.movementZone },
      position: clonePoint(player.position),
      target: clonePoint(player.target),
      velocity: clonePoint(player.velocity),
    }])),
    ball: { ...spatial.ball, velocity: { ...spatial.ball.velocity } },
    teamContexts: {
      HOME: { ...spatial.teamContexts.HOME },
      AWAY: { ...spatial.teamContexts.AWAY },
    },
    visualCues: spatial.visualCues.map(cue => ({
      ...cue,
      start: clonePoint(cue.start),
      end: clonePoint(cue.end),
    })),
  }),
};
