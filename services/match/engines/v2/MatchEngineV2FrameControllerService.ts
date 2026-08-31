import { MatchEventType } from '../../../../types';
import { clamp } from '../cupV2';
import { MatchEngineV2PlaybackService } from './MatchEngineV2PlaybackService';
import { MatchEngineV2HighlightScriptService } from './MatchEngineV2HighlightScriptService';
import { MatchEngineV2GroupBehaviorService } from './MatchEngineV2GroupBehaviorService';
import { MatchEngineV2TrajectoryService } from './MatchEngineV2TrajectoryService';
import type {
  MatchEngineV2Frame,
  MatchEngineV2PlayerSpatialState,
  MatchEngineV2PlaybackState,
  MatchEngineV2Point,
  MatchEngineV2Snapshot,
  MatchEngineV2VisualCue,
} from './MatchEngineV2Types';

// A league snapshot normally arrives roughly every 694 ms at 1x speed. Keeping
// movement active for most of that interval removes the old "move, freeze,
// move" rhythm while still letting every track settle before the next update.
const PLAYER_MOVE_MS = 680;
const MAX_TRACK_STEP_METRES = 7.5;
const MAX_VISIBLE_METRES_PER_MS = 0.014;
const REPLAY_INTRO_MS = 650;
const REPLAY_OUTRO_MS = 700;
// A goal replay is deliberately slow motion, like a real broadcast — each
// step of the same scene the viewer just watched live now takes 1.8x as
// long. This is independent of playback.sceneSpeed, which only paces the
// live scene itself.
const REPLAY_CUE_SPEED = 1.8;
const GOAL_CELEBRATION_MS = 4000;
const LIVE_MIN_CUE_MS = 72;
// A shot outcome can be followed by a more conclusive event from the same
// sequence (most importantly GOAL). Waiting a few football seconds before
// turning a raw terminal cue into a highlight lets the selector see the whole
// sequence and prevents a provisional shot plus the goal from being shown as
// two separate attempts by the same player.
const HIGHLIGHT_SETTLE_SECONDS = 6;
// Default catch-up budget for an actor already close to cue.start.
const DEFAULT_APPROACH_SHARE = 0.18;
const DEFAULT_APPROACH_CAP_MS = 110;
// Must match MatchEngineV2PlaybackService's own match-minute constant. Kept
// as a separate literal because that service does not export it, and the
// cosmetic clock below only needs the same ratio, not the engine's own advance.
const MATCH_SECONDS_PER_MATCH_MINUTE = 60;

type PlayerTrack = {
  start: MatchEngineV2Point;
  end: MatchEngineV2Point;
  startedAtMs: number;
  durationMs: number;
  isOnPitch: boolean;
};

type PendingLiveCue = {
  cue: MatchEngineV2VisualCue;
  durationMs: number;
};

type ActiveCue = PendingLiveCue & {
  startedAtMs: number;
  actorOrigin?: MatchEngineV2Point;
  receiverOrigin?: MatchEngineV2Point;
  /** Stable origins let a whole set-piece formation move continuously. */
  playerOrigins?: Record<string, MatchEngineV2Point>;
};

type ReplaySequence = {
  goalCueId: string;
  cues: MatchEngineV2VisualCue[];
};

type ActiveReplay = ReplaySequence & {
  startedAtMs: number;
};

export type MatchEngineV2FrameController = {
  visualClockMs: number;
  lastWallClockMs: number;
  lastSnapshotSecond: number;
  /** Raw authoritative snapshot.second last seen, used only to detect a new tick. */
  clockSourceSecond: number;
  /** Football-time (half/stoppage-aware) second the cosmetic clock last confirmed. */
  clockBaselineFootballSecond: number;
  /** Real ms accumulated while genuinely idle (no cue, no replay) since that baseline. */
  idleElapsedMsSinceBaseline: number;
  /** Smoothly advancing football-time second shown between authoritative snapshots. */
  cosmeticDisplaySecond: number;
  playerTracks: Record<string, PlayerTrack>;
  seenCueIds: Set<string>;
  seenGoalCueIds: Set<string>;
  pendingLiveCues: PendingLiveCue[];
  activeLiveCue: ActiveCue | null;
  replayQueue: ReplaySequence[];
  activeReplay: ActiveReplay | null;
  lastFramePlayers: MatchEngineV2Frame['players'];
  lastFrameBall: MatchEngineV2Frame['ball'];
  lastFrameAtMs: number;
};

const samePoint = (left: MatchEngineV2Point, right: MatchEngineV2Point): boolean =>
  Math.abs(left.x - right.x) < 0.001 && Math.abs(left.y - right.y) < 0.001;

const sampleTrack = (track: PlayerTrack, visualClockMs: number): MatchEngineV2Point =>
  MatchEngineV2TrajectoryService.samplePlayerMovement(
    track.start,
    track.end,
    visualClockMs - track.startedAtMs,
    track.durationMs,
  );

const interpolatePoint = (
  start: MatchEngineV2Point,
  end: MatchEngineV2Point,
  progress: number,
): MatchEngineV2Point => {
  const eased = progress * progress * (3 - 2 * progress);
  return {
    x: start.x + (end.x - start.x) * eased,
    y: start.y + (end.y - start.y) * eased,
  };
};

const movePointTowards = (
  start: MatchEngineV2Point,
  end: MatchEngineV2Point,
  maximumDistance: number,
): MatchEngineV2Point => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= maximumDistance || distance < 0.001) return { ...end };
  const ratio = maximumDistance / distance;
  return { x: start.x + dx * ratio, y: start.y + dy * ratio };
};

const maximumVisibleTravel = (active: ActiveCue, multiplier = 1): number =>
  clamp(active.durationMs * MAX_VISIBLE_METRES_PER_MS * multiplier, 1.2, 10);

const applyActionChoreography = (
  players: MatchEngineV2Frame['players'],
  active: ActiveCue,
  ball: MatchEngineV2Frame['ball'],
  presentationProgress: number,
  approachProgress: number,
): void => {
  const cue = active.cue;
  const actor = cue.actorId ? players[cue.actorId] : undefined;
  const receiver = cue.secondaryPlayerId ? players[cue.secondaryPlayerId] : undefined;
  const progress = clamp(ball.progress, 0, 1);

  // Authoritative events decide what happened. This presentation-only layer
  // makes the involved players arrive with the ball instead of leaving the
  // ball to travel between two static formation markers.
  if (actor) {
    const actorOrigin = active.actorOrigin ?? actor.position;
    const placeActor = (desired: MatchEngineV2Point): void => {
      actor.position = movePointTowards(actorOrigin, desired, maximumVisibleTravel(active));
    };
    if (approachProgress < 1) {
      // The event may have been generated after the formation track had already
      // moved the footballer elsewhere. Let him run to the real ball position
      // first instead of replacing his coordinates with cue.start in one frame.
      placeActor(interpolatePoint(actorOrigin, cue.start, approachProgress));
    } else if (cue.kind === 'DRIBBLE') {
      placeActor({ x: ball.x, y: ball.y });
    } else if (cue.kind === 'CONTROL' || cue.kind === 'REBOUND') {
      placeActor(interpolatePoint(cue.start, cue.end, progress));
    } else if (cue.kind === 'TACKLE' || cue.kind === 'TURNOVER' || cue.kind === 'BLOCK') {
      placeActor(interpolatePoint(cue.start, cue.end, Math.min(1, progress * 1.25)));
    } else if (cue.kind === 'RESTART') {
      placeActor(interpolatePoint(cue.start, cue.end, Math.min(0.16, progress * 0.16)));
    } else if (cue.kind === 'PASS' || cue.kind === 'CROSS' || cue.kind === 'SHOT' || cue.kind === 'GOAL') {
      const followThrough = interpolatePoint(cue.start, cue.end, Math.min(0.12, progress * 0.12));
      placeActor(followThrough);
    }
  }

  if (receiver && (cue.kind === 'PASS' || cue.kind === 'CROSS')) {
    // The receiver starts checking toward the passing lane before the ball
    // arrives, then meets it at the end of the trajectory.
    const receiverOrigin = active.receiverOrigin ?? receiver.position;
    const desired = interpolatePoint(receiverOrigin, cue.end, clamp(presentationProgress * 1.04, 0, 1));
    receiver.position = movePointTowards(receiverOrigin, desired, maximumVisibleTravel(active));
  } else if (receiver && cue.kind === 'SAVE') {
    // The last cue of a saved chance carries the defending goalkeeper as its
    // secondary participant. A short, speed-capped movement towards the shot
    // makes the intervention readable without inventing a second match event.
    const receiverOrigin = active.receiverOrigin ?? receiver.position;
    const desired = interpolatePoint(receiverOrigin, cue.end, clamp(presentationProgress * 1.15, 0, 1));
    receiver.position = movePointTowards(receiverOrigin, desired, maximumVisibleTravel(active, 0.72));
  }

  // Do not clamp action actors here. The authoritative spatial snapshot still
  // enforces every tactical zone, and rebaseActionTracks returns each marker
  // there after the cue. Clamping a kick-off taker, receiver or dribbler inside
  // a rendered frame caused the exact disappear/reappear jump reported by the
  // player whenever an intentional run began just outside the default zone.
};

const isCornerCue = (cue: MatchEngineV2VisualCue): boolean =>
  cue.setPieceKind === 'CORNER' ||
  cue.sourceEventType === MatchEventType.CORNER ||
  cue.sourceEventType === MatchEventType.CORNER_TAKEN;

const isThrowInCue = (cue: MatchEngineV2VisualCue): boolean =>
  cue.sourceEventType === MatchEventType.THROW_IN;

const isFreeKickCue = (cue: MatchEngineV2VisualCue): boolean =>
  cue.setPieceKind === 'FREE_KICK_WIDE' ||
  cue.setPieceKind === 'FREE_KICK_DIRECT' ||
  cue.sourceEventType === MatchEventType.FREE_KICK ||
  cue.sourceEventType === MatchEventType.FREE_KICK_DANGEROUS;

const isPenaltyCue = (cue: MatchEngineV2VisualCue): boolean =>
  cue.setPieceKind === 'PENALTY' || cue.sourceEventType === MatchEventType.PENALTY_AWARDED;

const isOffsideCue = (cue: MatchEngineV2VisualCue): boolean =>
  cue.sourceEventType === MatchEventType.OFFSIDE;

const isCentreRestart = (cue: MatchEngineV2VisualCue): boolean =>
  cue.sourceEventType === MatchEventType.KICK_OFF;

const usesStructuredRestartShape = (cue: MatchEngineV2VisualCue): boolean =>
  isCornerCue(cue) || isThrowInCue(cue) || isFreeKickCue(cue) || isPenaltyCue(cue) || isOffsideCue(cue) || isCentreRestart(cue);

const sceneOrigin = (
  active: ActiveCue,
  playerId: string,
  fallback: MatchEngineV2Point,
): MatchEngineV2Point => active.playerOrigins?.[playerId] ?? fallback;

const usesOpenPlayTeamFlow = (cue: MatchEngineV2VisualCue): boolean =>
  !usesStructuredRestartShape(cue) &&
  cue.kind !== 'GOAL' &&
  cue.kind !== 'CARD' &&
  cue.kind !== 'INJURY' &&
  cue.kind !== 'SUBSTITUTION' &&
  cue.kind !== 'FOUL';

/**
 * Moves the two formations around the current action. The attacking lines
 * advance together, nearby teammates create passing angles and the defending
 * block slides towards the ball. All offsets are small and speed-capped; this
 * is continuous support movement, not a second source of match decisions.
 */
const applyOpenPlayTeamFlow = (
  players: MatchEngineV2Frame['players'],
  active: ActiveCue,
  snapshot: MatchEngineV2Snapshot,
  presentationProgress: number,
): void => {
  const cue = active.cue;
  if (!usesOpenPlayTeamFlow(cue)) return;
  const attackingSide = cue.side ?? snapshot.spatial.players[cue.actorId ?? '']?.side;
  if (!attackingSide) return;
  const defendingSide = attackingSide === 'HOME' ? 'AWAY' : 'HOME';
  const actionProgress = clamp(presentationProgress, 0, 1);
  const direction = attackingSide === 'HOME' ? 1 : -1;
  const ballPoint = interpolatePoint(cue.start, cue.end, actionProgress);
  const delta = { x: cue.end.x - cue.start.x, y: cue.end.y - cue.start.y };
  const spatialPlayers = Object.values(snapshot.spatial.players)
    .filter(player => player.isOnPitch && player.role !== 'GK' && players[player.playerId]);
  const supportIds = new Set(spatialPlayers
    .filter(player => player.side === attackingSide && player.playerId !== cue.actorId && player.playerId !== cue.secondaryPlayerId)
    .sort((left, right) => {
      const leftOrigin = sceneOrigin(active, left.playerId, players[left.playerId].position);
      const rightOrigin = sceneOrigin(active, right.playerId, players[right.playerId].position);
      return Math.hypot(leftOrigin.x - ballPoint.x, leftOrigin.y - ballPoint.y) -
        Math.hypot(rightOrigin.x - ballPoint.x, rightOrigin.y - ballPoint.y);
    })
    .slice(0, 3)
    .map(player => player.playerId));
  const pressingIds = new Set(spatialPlayers
    .filter(player => player.side === defendingSide)
    .sort((left, right) => {
      const leftOrigin = sceneOrigin(active, left.playerId, players[left.playerId].position);
      const rightOrigin = sceneOrigin(active, right.playerId, players[right.playerId].position);
      return Math.hypot(leftOrigin.x - ballPoint.x, leftOrigin.y - ballPoint.y) -
        Math.hypot(rightOrigin.x - ballPoint.x, rightOrigin.y - ballPoint.y);
    })
    .slice(0, 2)
    .map(player => player.playerId));

  spatialPlayers.forEach(player => {
    if (player.playerId === cue.actorId || player.playerId === cue.secondaryPlayerId) return;
    const rendered = players[player.playerId];
    const origin = sceneOrigin(active, player.playerId, rendered.position);
    const roleFactor = player.role === 'DEF' ? 0.55 : player.role === 'MID' ? 0.82 : 1;
    const ownsBall = player.side === attackingSide;
    let target = {
      x: origin.x + clamp(delta.x * (ownsBall ? 0.18 : 0.13), -2.8, 2.8),
      y: origin.y + clamp(delta.y * (ownsBall ? 0.20 : 0.14) * roleFactor, -4.2, 4.2),
    };

    if (supportIds.has(player.playerId)) {
      const supportIndex = [...supportIds].indexOf(player.playerId);
      const supportTarget = {
        x: clamp(ballPoint.x + (supportIndex - 1) * 8, 5, 63),
        y: clamp(ballPoint.y - direction * (7 + (supportIndex % 2) * 4), 6, 99),
      };
      target = movePointTowards(target, supportTarget, 3.8);
    } else if (pressingIds.has(player.playerId)) {
      const pressIndex = [...pressingIds].indexOf(player.playerId);
      const pressingTarget = {
        x: clamp(ballPoint.x + (pressIndex === 0 ? -3.5 : 3.5), 4, 64),
        y: clamp(ballPoint.y + direction * 2.5, 5, 100),
      };
      target = movePointTowards(target, pressingTarget, 3.2);
    }

    const boundedTarget = movePointTowards(origin, target, maximumVisibleTravel(active, 0.72));
    rendered.position = interpolatePoint(origin, boundedTarget, actionProgress);
  });
};

/**
 * Runs an authored scenario's named group behaviors for whichever side(s)
 * specify one on the current step, instead of applyOpenPlayTeamFlow's single
 * generic formula. A step naming only one side's behavior leaves the other
 * side to the generic flow, so a scenario only has to describe what actually
 * matters for it. Purely presentational: it never creates a match decision.
 */
const applyScenarioGroupBehaviors = (
  players: MatchEngineV2Frame['players'],
  active: ActiveCue,
  snapshot: MatchEngineV2Snapshot,
  presentationProgress: number,
): boolean => {
  const cue = active.cue;
  if (!usesOpenPlayTeamFlow(cue)) return false;
  if (!cue.attackingGroupBehavior && !cue.defendingGroupBehavior) return false;
  const attackingSide = cue.side ?? snapshot.spatial.players[cue.actorId ?? '']?.side;
  if (!attackingSide) return false;
  const defendingSide = attackingSide === 'HOME' ? 'AWAY' : 'HOME';
  const progress = clamp(presentationProgress, 0, 1);
  const ballPoint = interpolatePoint(cue.start, cue.end, progress);
  const excludeIds = new Set(
    [cue.actorId, cue.secondaryPlayerId].filter((id): id is string => Boolean(id)),
  );
  const originFor = (playerId: string, fallback: MatchEngineV2Point): MatchEngineV2Point =>
    sceneOrigin(active, playerId, fallback);
  const maxTravel = maximumVisibleTravel(active, 0.72);
  const baseContext = {
    players,
    spatialPlayers: snapshot.spatial.players,
    ballPoint,
    progress,
    excludeIds,
    originFor,
    maxTravel,
  };

  if (cue.attackingGroupBehavior) {
    MatchEngineV2GroupBehaviorService.apply(cue.attackingGroupBehavior, { ...baseContext, side: attackingSide });
  }
  if (cue.defendingGroupBehavior) {
    MatchEngineV2GroupBehaviorService.apply(cue.defendingGroupBehavior, { ...baseContext, side: defendingSide });
  }
  return true;
};

/**
 * Moves the specific, named players an authored scenario calls out (a decoy
 * run, a marker being dragged away) on top of whatever the bulk group
 * behaviors or generic flow already did for the rest of the side — an
 * authored run always wins for the one player it names, since it runs last.
 */
const applyStepSupportingRuns = (
  players: MatchEngineV2Frame['players'],
  active: ActiveCue,
  presentationProgress: number,
): void => {
  const runs = active.cue.supportingRuns;
  if (!runs || runs.length === 0) return;
  const progress = clamp(presentationProgress, 0, 1);
  runs.forEach(run => {
    const rendered = players[run.playerId];
    if (!rendered) return;
    const origin = sceneOrigin(active, run.playerId, rendered.position);
    const bounded = movePointTowards(origin, run.end, maximumVisibleTravel(active, 1.1));
    rendered.position = interpolatePoint(origin, bounded, progress);
  });
};

/**
 * Builds the recognisable, temporary team shapes around authoritative restart
 * events. This is deliberately a renderer concern: it moves only SVG markers,
 * never the simulation players, possession, statistics or RNG state.
 */
const applyStructuredRestartShape = (
  players: MatchEngineV2Frame['players'],
  active: ActiveCue,
  snapshot: MatchEngineV2Snapshot,
  presentationProgress: number,
): void => {
  const cue = active.cue;
  if (!usesStructuredRestartShape(cue)) return;
  const attackingSide = cue.side ?? snapshot.spatial.players[cue.actorId ?? '']?.side;
  if (!attackingSide) return;
  const defendingSide = attackingSide === 'HOME' ? 'AWAY' : 'HOME';
  const direction = attackingSide === 'HOME' ? 1 : -1;
  const opponentGoalY = attackingSide === 'HOME' ? 105 : 0;
  const shapeProgress = clamp(presentationProgress / 0.62, 0, 1);
  const spatialPlayers = Object.values(snapshot.spatial.players).filter(player => player.isOnPitch && players[player.playerId]);
  const attackers = spatialPlayers.filter(player => player.side === attackingSide);
  const defenders = spatialPlayers.filter(player => player.side === defendingSide);
  const move = (playerId: string, target: MatchEngineV2Point): void => {
    const rendered = players[playerId];
    if (!rendered) return;
    const origin = sceneOrigin(active, playerId, rendered.position);
    // Both teams may need to cross most of the pitch to form up for a dead
    // ball, since a player now rests on a formation anchor between scenes
    // instead of tracking the ball continuously. Like the goal celebration
    // gather below, this is an accepted presentation abstraction rather than
    // a sprint-speed-capped movement, so it is not run through
    // maximumVisibleTravel.
    rendered.position = interpolatePoint(origin, target, shapeProgress);
  };
  const bySetPiecePriority = (left: MatchEngineV2PlayerSpatialState, right: MatchEngineV2PlayerSpatialState): number => {
    const priority = { FWD: 0, MID: 1, DEF: 2, GK: 3 } as const;
    return priority[left.role] - priority[right.role] || left.playerId.localeCompare(right.playerId);
  };
  const attackingOutfield = attackers.filter(player => player.role !== 'GK' && player.playerId !== cue.actorId).sort(bySetPiecePriority);
  const defendingOutfield = defenders.filter(player => player.role !== 'GK').sort(bySetPiecePriority);
  const attackingKeeper = attackers.find(player => player.role === 'GK');
  const defendingKeeper = defenders.find(player => player.role === 'GK');

  // Goalkeepers remain on their goal line while outfield players temporarily
  // leave their normal zones for a dead-ball situation.
  if (attackingKeeper) move(attackingKeeper.playerId, { x: 34, y: attackingSide === 'HOME' ? 5 : 100 });
  if (defendingKeeper) move(defendingKeeper.playerId, { x: 34, y: opponentGoalY - direction * 3.2 });

  if (isCentreRestart(cue)) {
    // Only the taker and one nearby team-mate leave their authoritative
    // formation positions. The previous implementation lined every outfield
    // player across the halfway area, which looked like two queues instead of
    // a 4-4-2/4-3-3 shape and then forced the renderer to scatter them again.
    const centreY = 52.5;
    if (cue.actorId) move(cue.actorId, { x: 34, y: centreY - direction * 1.4 });
    const support = attackingOutfield
      .filter(player => player.playerId !== cue.actorId)
      .sort((left, right) =>
        Math.hypot(left.position.x - 34, left.position.y - centreY) -
        Math.hypot(right.position.x - 34, right.position.y - centreY)
      )[0];
    if (support) move(support.playerId, { x: 30, y: centreY - direction * 2.8 });
    return;
  }

  if (isPenaltyCue(cue)) {
    const penaltySpot = { x: 34, y: opponentGoalY - direction * 11 };
    if (cue.actorId) move(cue.actorId, penaltySpot);
    attackingOutfield.forEach((player, index) => move(player.playerId, {
      x: 20 + (index % 6) * 5.6,
      y: opponentGoalY - direction * (24 + Math.floor(index / 6) * 3),
    }));
    defendingOutfield.forEach((player, index) => move(player.playerId, {
      x: 18 + (index % 7) * 5.3,
      y: opponentGoalY - direction * (21.5 + Math.floor(index / 7) * 3),
    }));
    return;
  }

  if (isCornerCue(cue) || cue.setPieceKind === 'FREE_KICK_WIDE') {
    const restartPoint = cue.sourceEventType === MatchEventType.CORNER ? cue.end : cue.start;
    if (cue.actorId) move(cue.actorId, restartPoint);
    const boxX = [18, 25.5, 33, 40.5, 48, 29];
    attackingOutfield.forEach((player, index) => move(player.playerId, index < 6 ? {
      x: boxX[index],
      y: opponentGoalY - direction * (8.5 + (index % 3) * 4.2),
    } : {
      x: index % 2 ? 27 : 41,
      y: opponentGoalY - direction * (23 + Math.floor(index / 2)),
    }));
    defendingOutfield.forEach((player, index) => move(player.playerId, index < 6 ? {
      x: clamp(boxX[index] + (index % 2 ? 1.4 : -1.4), 15, 53),
      y: opponentGoalY - direction * (7.2 + (index % 3) * 4.2),
    } : {
      x: 20 + (index % 4) * 9,
      y: opponentGoalY - direction * 20,
    }));
    return;
  }

  if (isFreeKickCue(cue)) {
    const restartPoint = cue.kind === 'RESTART' ? cue.end : cue.start;
    if (cue.actorId) move(cue.actorId, restartPoint);
    // Four defenders form a wall 9.15 m from a direct free kick. Remaining
    // players occupy the box so a resulting shot/cross reads as one action.
    const wallCentre = {
      x: restartPoint.x + (34 - restartPoint.x) * 0.22,
      y: restartPoint.y + direction * 9.15,
    };
    defendingOutfield.forEach((player, index) => move(player.playerId, index < 4 ? {
      x: wallCentre.x + (index - 1.5) * 1.8,
      y: wallCentre.y,
    } : {
      x: 18 + ((index - 4) % 6) * 6.2,
      y: opponentGoalY - direction * (10 + ((index - 4) % 2) * 4),
    }));
    attackingOutfield.forEach((player, index) => move(player.playerId, index < 5 ? {
      x: 20 + index * 7,
      y: opponentGoalY - direction * (12 + (index % 2) * 4),
    } : {
      x: restartPoint.x + (index % 2 ? -6 : 6),
      y: restartPoint.y - direction * 3,
    }));
    return;
  }

  if (isThrowInCue(cue)) {
    const touchline = cue.start.x < 34 ? 0.7 : 67.3;
    const restartPoint = { x: touchline, y: cue.start.y };
    if (cue.actorId) move(cue.actorId, restartPoint);
    attackingOutfield.slice(0, 4).forEach((player, index) => move(player.playerId, {
      x: touchline < 34 ? 6 + index * 3 : 62 - index * 3,
      y: clamp(restartPoint.y + direction * ((index - 1) * 5), 8, 97),
    }));
    defendingOutfield.slice(0, 4).forEach((player, index) => move(player.playerId, {
      x: touchline < 34 ? 9 + index * 3 : 59 - index * 3,
      y: clamp(restartPoint.y + direction * ((index - 1) * 5 + 1.5), 8, 97),
    }));
    if (cue.secondaryPlayerId) move(cue.secondaryPlayerId, cue.end);
    return;
  }

  if (isOffsideCue(cue)) {
    const lineY = clamp(cue.end.y, 18, 87);
    if (cue.actorId) move(cue.actorId, { x: cue.end.x, y: lineY + direction * 1.6 });
    defendingOutfield.slice(0, 5).forEach((player, index) => move(player.playerId, {
      x: 11 + index * 11.5,
      y: lineY,
    }));
  }
};

const applyGoalCelebration = (
  players: MatchEngineV2Frame['players'],
  cue: MatchEngineV2VisualCue,
  progress: number,
  snapshot: MatchEngineV2Snapshot,
  visualClockMs: number,
): void => {
  const actor = cue.actorId ? players[cue.actorId] : undefined;
  const scoringSide = cue.side ?? (cue.actorId ? snapshot.spatial.players[cue.actorId]?.side : undefined);
  if (!actor || !scoringSide) return;

  // Players leave their normal tactical work areas only after the whistle.
  // They gather near the scorer, hold the celebration, then return smoothly to
  // their live formation tracks before the next authoritative action begins.
  const gather = progress < 0.45
    ? progress / 0.45
    : progress < 0.78
      ? 1
      : Math.max(0, (1 - progress) / 0.22);
  const goalDirection = scoringSide === 'HOME' ? 1 : -1;
  const celebrationPoint = {
    x: cue.start.x <= 34 ? 10 : 58,
    y: scoringSide === 'HOME' ? 99 : 6,
  };
  const teammates = Object.values(snapshot.spatial.players)
    .filter(player => player.isOnPitch && player.side === scoringSide && player.role !== 'GK' && players[player.playerId])
    .sort((left, right) => {
      if (left.playerId === cue.actorId) return -1;
      if (right.playerId === cue.actorId) return 1;
      const leftDistance = Math.hypot(left.position.x - cue.start.x, left.position.y - cue.start.y);
      const rightDistance = Math.hypot(right.position.x - cue.start.x, right.position.y - cue.start.y);
      return leftDistance - rightDistance || left.playerId.localeCompare(right.playerId);
    })
    .slice(0, 5);

  teammates.forEach((teammate, index) => {
    const rendered = players[teammate.playerId];
    const base = rendered.position;
    const column = index % 3 - 1;
    const row = Math.floor(index / 3);
    const target = {
      x: clamp(celebrationPoint.x + column * 3.2, 3, 65),
      y: clamp(celebrationPoint.y - goalDirection * row * 3.1, 3, 102),
    };
    rendered.position = interpolatePoint(base, target, gather);
    if (teammate.playerId === cue.actorId) {
      rendered.position.y += Math.sin(visualClockMs / 95) * 0.7 * gather;
    }
  });
};

// Player markers render at roughly 2.6 pitch-metres wide on screen. Every
// other positioning pass above (choreography, group behaviours, restart
// formations, supporting runs, idle formation, goal celebration) treats
// players as points and can legitimately land two of them almost on top of
// each other — a tight tackle, a marker on a marked runner, two decoys
// converging on the same patch of grass. This final pass only nudges the two
// markers apart just enough that their icons stop fully overlapping; it never
// touches the ball, never runs before every other pass has already decided
// where everyone wants to be, and has no effect on the authoritative match.
const MIN_PLAYER_SEPARATION_METRES = 2.6;
const DECLUMP_PASSES = 3;

const declumpPlayers = (players: MatchEngineV2Frame['players']): void => {
  const ids = Object.keys(players).filter(id => players[id].isOnPitch);
  for (let pass = 0; pass < DECLUMP_PASSES; pass += 1) {
    let movedAny = false;
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const a = players[ids[i]];
        const b = players[ids[j]];
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= MIN_PLAYER_SEPARATION_METRES) continue;
        movedAny = true;
        // Two markers landing on the exact same point have no direction to
        // separate along; fall back to a stable, id-ordered direction so
        // this never flickers between frames.
        const nx = distance > 0.001 ? dx / distance : (ids[i] < ids[j] ? 1 : -1);
        const ny = distance > 0.001 ? dy / distance : 0;
        const push = (MIN_PLAYER_SEPARATION_METRES - distance) / 2;
        a.position = { x: clamp(a.position.x - nx * push, 0, 68), y: clamp(a.position.y - ny * push, 0, 105) };
        b.position = { x: clamp(b.position.x + nx * push, 0, 68), y: clamp(b.position.y + ny * push, 0, 105) };
      }
    }
    if (!movedAny) break;
  }
};

const createTracks = (snapshot: MatchEngineV2Snapshot): Record<string, PlayerTrack> =>
  Object.fromEntries(Object.values(snapshot.spatial.players).map(player => [player.playerId, {
    // The spatial engine is the only source of an open-play position. Tracks
    // merely interpolate between its snapshots and must never reset a marker
    // to a formation anchor chosen independently by the renderer.
    start: { ...player.position },
    end: { ...player.position },
    startedAtMs: 0,
    durationMs: 1,
    isOnPitch: player.isOnPitch,
  }]));

const synchronizeTracks = (
  controller: MatchEngineV2FrameController,
  snapshot: MatchEngineV2Snapshot,
  playback: MatchEngineV2PlaybackState,
): void => {
  const snapshotChanged = snapshot.second !== controller.lastSnapshotSecond;
  Object.values(snapshot.spatial.players).forEach(player => {
    const existing = controller.playerTracks[player.playerId];
    if (!existing) {
      controller.playerTracks[player.playerId] = {
        start: { ...player.position },
        end: { ...player.position },
        startedAtMs: controller.visualClockMs,
        durationMs: 1,
        isOnPitch: player.isOnPitch,
      };
      return;
    }

    existing.isOnPitch = player.isOnPitch;
    if (!snapshotChanged) return;
    if (samePoint(existing.end, player.position)) return;

    // Continue from the last rendered frame towards the next authoritative
    // spatial position. Irregular React frame timing therefore cannot create
    // a disappear/reappear jump and no presentation rule competes with the
    // engine's formation and motion services.
    const current = controller.lastFramePlayers[player.playerId]?.position
      ?? sampleTrack(existing, controller.visualClockMs);
    existing.start = current;
    existing.end = movePointTowards(current, player.position, MAX_TRACK_STEP_METRES);
    existing.startedAtMs = controller.visualClockMs;
    // playback.speed is real seconds per match minute (1 normal, 2 slower, 3
    // much slower), so a higher value means everything on screen — including
    // this settle animation — should take longer, not shorter.
    existing.durationMs = clamp(PLAYER_MOVE_MS * playback.speed, 150, 700 * 3);
  });
};

const collectNewCues = (
  controller: MatchEngineV2FrameController,
  snapshot: MatchEngineV2Snapshot,
  playback: MatchEngineV2PlaybackState,
): void => {
  const settledThroughSecond = snapshot.isFinished
    ? Number.POSITIVE_INFINITY
    : snapshot.second - HIGHLIGHT_SETTLE_SECONDS;
  const visible = MatchEngineV2PlaybackService.selectVisibleCues(playback, snapshot.spatial.visualCues)
    .filter(cue => cue.atSecond <= snapshot.second)
    .filter(cue =>
      playback.transmissionMode === 'FULL_MATCH' ||
      cue.scriptedHighlight === true ||
      cue.atSecond <= settledThroughSecond
    )
    .sort((left, right) => left.atSecond - right.atSecond || left.id.localeCompare(right.id));

  const newlyVisible = visible.filter(cue => !controller.seenCueIds.has(cue.id));
  newlyVisible.forEach(cue => {
    controller.seenCueIds.add(cue.id);
    // The match engine remains authoritative. We expand only its recorded
    // terminal event into a short, pre-authored presentation sequence. This
    // avoids simulating all 90 minutes on screen while score and statistics
    // remain identical in both transmission modes.
    // A standalone restart (corner, free kick, penalty award) that never led
    // to a shot has no authored family in the highlight library. Falling back
    // to the single authoritative cue still gives it a scene: the structured
    // restart shape below already knows how to line up both teams for it.
    const materialized = cue.scriptedHighlight || playback.transmissionMode === 'FULL_MATCH'
      ? [cue]
      : MatchEngineV2HighlightScriptService.materialize(cue, snapshot);
    const presentationCues = materialized.length > 0 ? materialized : [cue];
    presentationCues.forEach(presentationCue => {
      controller.pendingLiveCues.push({
        cue: presentationCue,
        durationMs: presentationCue.kind === 'GOAL'
          ? GOAL_CELEBRATION_MS
          : Math.max(LIVE_MIN_CUE_MS, presentationCue.durationMs) * playback.sceneSpeed,
      });
    });

    if (cue.kind === 'GOAL' && !controller.seenGoalCueIds.has(cue.id)) {
      controller.seenGoalCueIds.add(cue.id);
      if (playback.goalReplays && presentationCues.length > 0) {
        controller.replayQueue.push({ goalCueId: cue.id, cues: presentationCues });
      }
    }
  });
};

const preservesRecordedRestartOrigin = (cue: MatchEngineV2VisualCue): boolean =>
  isCentreRestart(cue) ||
  cue.sourceEventType === MatchEventType.THROW_IN ||
  (cue.scriptedHighlight === true && cue.highlightSceneIndex === 1);

const activateLiveCue = (
  controller: MatchEngineV2FrameController,
  pending: PendingLiveCue,
  startedAtMs: number,
  ballOrigin: MatchEngineV2Point,
  snapshot: MatchEngineV2Snapshot,
): ActiveCue => {
  const cue = preservesRecordedRestartOrigin(pending.cue)
    ? pending.cue
    : {
        ...pending.cue,
        // The displayed ball always continues from its preceding frame. The
        // target still comes from the authoritative event, so this repairs
        // presentation continuity without changing possession or match RNG.
        start: { ...ballOrigin },
      };
  const isFirstScriptedScene = cue.scriptedHighlight === true && cue.highlightSceneIndex === 1;
  // A highlight is a broadcast cut, not a continuation of the hidden quiet
  // simulation. Its first frame starts from the tactical formation and places
  // only explicitly named participants at their authored start coordinates.
  // Later steps inherit the last rendered frame, preserving the action chain.
  const playerOrigins = Object.fromEntries(Object.values(snapshot.spatial.players).map(player => {
    const previous = controller.lastFramePlayers[player.playerId]?.position ?? player.position;
    return [player.playerId, { ...(isFirstScriptedScene ? player.anchor : previous) }];
  }));
  if (isFirstScriptedScene && cue.actorId) playerOrigins[cue.actorId] = { ...cue.start };
  if (isFirstScriptedScene) {
    cue.supportingRuns?.forEach(run => { playerOrigins[run.playerId] = { ...run.start }; });
  }
  const rawActorOrigin = cue.actorId && playerOrigins[cue.actorId]
    ? { ...playerOrigins[cue.actorId] }
    : undefined;
  // The actor now rests on a formation anchor between scenes, which can be far
  // from where the authored cue.start is. Stretching the scene to let him
  // sprint the full real distance made routine, moderately distant plays take
  // several seconds each (see git history for that attempt) — instead, the
  // effective start is pulled in to whatever a short, fixed catch-up window
  // can realistically reach, so the ball is always shown departing from
  // exactly where the actor already is rather than an empty patch of grass.
  // A structured restart positions its actor through applyStructuredRestartShape's
  // own timeline instead, which would just overwrite this, so it is skipped there.
  const approachBudgetMetres = DEFAULT_APPROACH_CAP_MS * MAX_VISIBLE_METRES_PER_MS;
  const cueWithReachableStart = rawActorOrigin && !usesStructuredRestartShape(cue)
    ? { ...cue, start: movePointTowards(rawActorOrigin, cue.start, approachBudgetMetres) }
    : cue;
  return {
    cue: cueWithReachableStart,
    durationMs: pending.durationMs,
    startedAtMs,
    actorOrigin: rawActorOrigin,
    receiverOrigin: cue.secondaryPlayerId && playerOrigins[cue.secondaryPlayerId]
      ? { ...playerOrigins[cue.secondaryPlayerId] }
      : undefined,
    playerOrigins,
  };
};

const rebaseActionTracks = (
  controller: MatchEngineV2FrameController,
  completed: ActiveCue,
  snapshot: MatchEngineV2Snapshot,
  playback: MatchEngineV2PlaybackState,
): void => {
  const affectedPlayerIds = usesStructuredRestartShape(completed.cue)
    ? Object.keys(completed.playerOrigins ?? {})
    : [completed.cue.actorId, completed.cue.secondaryPlayerId].filter((playerId): playerId is string => Boolean(playerId));
  affectedPlayerIds.forEach(playerId => {
    if (!playerId) return;
    const track = controller.playerTracks[playerId];
    const rendered = controller.lastFramePlayers[playerId];
    const authoritative = snapshot.spatial.players[playerId];
    if (!track || !rendered || !authoritative) return;
    // Action choreography temporarily takes control of the marker. Returning
    // that marker to formation must begin at its last visible coordinate,
    // otherwise it disappears from the reception point and reappears on the
    // already-finished background track.
    track.start = { ...rendered.position };
    track.end = movePointTowards(rendered.position, authoritative.position, MAX_TRACK_STEP_METRES);
    track.startedAtMs = controller.visualClockMs;
    track.durationMs = clamp(PLAYER_MOVE_MS / playback.speed, 150, 700);
  });
};

const updateLiveCue = (
  controller: MatchEngineV2FrameController,
  snapshot: MatchEngineV2Snapshot,
  playback: MatchEngineV2PlaybackState,
): void => {
  if (!controller.activeLiveCue && controller.pendingLiveCues.length > 0) {
    controller.activeLiveCue = activateLiveCue(
      controller,
      controller.pendingLiveCues.shift()!,
      controller.visualClockMs,
      controller.lastFrameBall,
      snapshot,
    );
  }
  while (
    controller.activeLiveCue &&
    controller.visualClockMs - controller.activeLiveCue.startedAtMs >= controller.activeLiveCue.durationMs
  ) {
    const completed = controller.activeLiveCue;
    const overrun = controller.visualClockMs - completed.startedAtMs - completed.durationMs;
    const continuityBall = completed.cue.end;
    rebaseActionTracks(controller, completed, snapshot, playback);
    const next = controller.pendingLiveCues.shift();
    controller.activeLiveCue = next
      ? activateLiveCue(controller, next, controller.visualClockMs - overrun, continuityBall, snapshot)
      : null;
  }
};

const replayDuration = (replay: ReplaySequence): number =>
  REPLAY_INTRO_MS + replay.cues.reduce((sum, cue) => sum + cue.durationMs * REPLAY_CUE_SPEED, 0) + REPLAY_OUTRO_MS;

const updateReplay = (controller: MatchEngineV2FrameController, playback: MatchEngineV2PlaybackState): void => {
  if (!playback.goalReplays) {
    controller.replayQueue = [];
    controller.activeReplay = null;
    return;
  }
  if (!controller.activeReplay && !controller.activeLiveCue && controller.pendingLiveCues.length === 0) {
    const next = controller.replayQueue.shift();
    if (next) controller.activeReplay = { ...next, startedAtMs: controller.visualClockMs };
  }
  if (
    controller.activeReplay &&
    controller.visualClockMs - controller.activeReplay.startedAtMs >= replayDuration(controller.activeReplay)
  ) {
    controller.activeReplay = null;
    const next = controller.replayQueue.shift();
    if (next) controller.activeReplay = { ...next, startedAtMs: controller.visualClockMs };
  }
};

const sampleReplay = (controller: MatchEngineV2FrameController): {
  cue: MatchEngineV2VisualCue | null;
  elapsedMs: number;
  cueIndex: number;
  cueCount: number;
  progress: number;
} => {
  const replay = controller.activeReplay;
  if (!replay) return { cue: null, elapsedMs: 0, cueIndex: 0, cueCount: 0, progress: 0 };
  const total = replayDuration(replay);
  const elapsed = clamp(controller.visualClockMs - replay.startedAtMs, 0, total);
  const actionElapsed = elapsed - REPLAY_INTRO_MS;
  let cursor = 0;
  for (let index = 0; index < replay.cues.length; index += 1) {
    const cue = replay.cues[index];
    const duration = cue.durationMs * REPLAY_CUE_SPEED;
    if (actionElapsed >= cursor && actionElapsed < cursor + duration) {
      return {
        cue,
        elapsedMs: (actionElapsed - cursor) / REPLAY_CUE_SPEED,
        cueIndex: index + 1,
        cueCount: replay.cues.length,
        progress: total > 0 ? elapsed / total : 1,
      };
    }
    cursor += duration;
  }
  return {
    cue: null,
    elapsedMs: 0,
    cueIndex: replay.cues.length,
    cueCount: replay.cues.length,
    progress: total > 0 ? elapsed / total : 1,
  };
};

const makeFrame = (
  controller: MatchEngineV2FrameController,
  snapshot: MatchEngineV2Snapshot,
): MatchEngineV2Frame => {
  const replaySample = sampleReplay(controller);
  const liveActive = replaySample.cue ? null : controller.activeLiveCue;
  const activeCue = replaySample.cue ?? liveActive?.cue ?? null;
  const liveElapsedMs = liveActive
    ? clamp(controller.visualClockMs - liveActive.startedAtMs, 0, liveActive.durationMs)
    : 0;
  const presentationProgress = replaySample.cue
    ? clamp(replaySample.elapsedMs / Math.max(1, replaySample.cue.durationMs), 0, 1)
    : liveActive
      ? clamp(liveElapsedMs / Math.max(1, liveActive.durationMs), 0, 1)
      : 1;
  const approachShare = liveActive && liveActive.cue.kind !== 'GOAL'
    ? Math.min(DEFAULT_APPROACH_SHARE, DEFAULT_APPROACH_CAP_MS / Math.max(1, liveActive.durationMs))
    : 0;
  const approachProgress = approachShare > 0
    ? clamp(presentationProgress / approachShare, 0, 1)
    : 1;
  const actionProgress = replaySample.cue
    ? presentationProgress
    : liveActive?.cue.kind === 'GOAL'
      ? clamp(liveElapsedMs / Math.max(1, liveActive.cue.durationMs), 0, 1)
      : approachShare < 1
        ? clamp((presentationProgress - approachShare) / (1 - approachShare), 0, 1)
        : 1;

  const players = Object.fromEntries(Object.entries(controller.playerTracks).map(([playerId, track]) => [playerId, {
    playerId,
    position: sampleTrack(track, controller.visualClockMs),
    isOnPitch: track.isOnPitch,
  }]));
  const activeForChoreography: ActiveCue | null = liveActive ?? (replaySample.cue
    ? {
        cue: replaySample.cue,
        startedAtMs: controller.visualClockMs - replaySample.elapsedMs,
        durationMs: replaySample.cue.durationMs,
      }
    : null);
  if (activeForChoreography?.cue.scriptedHighlight && activeForChoreography.playerOrigins) {
    // Freeze the background formation for the duration of one authored scene.
    // Only the actor, receiver, named supporting runners and structured
    // set-piece participants move. This makes it visually obvious who is
    // involved instead of allowing hidden open-play tracks to create chaos.
    Object.entries(activeForChoreography.playerOrigins).forEach(([playerId, origin]) => {
      if (players[playerId]) players[playerId].position = { ...origin };
    });
  }
  const desiredIdleBall = snapshot.spatial.ball.ownerId && players[snapshot.spatial.ball.ownerId]
    ? players[snapshot.spatial.ball.ownerId].position
    : snapshot.spatial.ball;
  const idleElapsedMs = clamp(controller.visualClockMs - controller.lastFrameAtMs, 0, 50);
  const idleBallPoint = controller.lastFrameAtMs === 0
    ? desiredIdleBall
    : movePointTowards(controller.lastFrameBall, desiredIdleBall, idleElapsedMs * 0.030);
  const ball = activeCue
    ? MatchEngineV2TrajectoryService.sampleCue(activeCue, activeCue.durationMs * actionProgress)
    : {
        x: idleBallPoint.x,
        y: idleBallPoint.y,
        z: Math.max(0, controller.lastFrameBall.z - idleElapsedMs * 0.006),
        progress: 1,
        finished: true,
      };
  const liveGoalCelebration = !controller.activeReplay && controller.activeLiveCue?.cue.kind === 'GOAL';
  const goalCelebrationProgress = liveGoalCelebration
    ? clamp(
        (controller.visualClockMs - controller.activeLiveCue!.startedAtMs) /
        Math.max(1, controller.activeLiveCue!.durationMs),
        0,
        1,
      )
    : 0;

  if (activeForChoreography) {
    applyActionChoreography(
      players,
      activeForChoreography,
      ball,
      presentationProgress,
      approachProgress,
    );
    // Open-play support and defensive movement already exists in the spatial
    // snapshot. Older presentation helpers moved both formations a second
    // time and were the main source of chaotic running. Only the named actor
    // and receiver are choreographed around an authoritative ball event here.
    applyStructuredRestartShape(
      players,
      activeForChoreography,
      snapshot,
      presentationProgress,
    );
    if (activeForChoreography.cue.scriptedHighlight) {
      applyStepSupportingRuns(players, activeForChoreography, presentationProgress);
    }
  }
  if (liveGoalCelebration) {
    applyGoalCelebration(
      players,
      controller.activeLiveCue!.cue,
      goalCelebrationProgress,
      snapshot,
      controller.visualClockMs,
    );
  }
  declumpPlayers(players);

  const frame: MatchEngineV2Frame = {
    visualClockMs: controller.visualClockMs,
    displaySecond: controller.cosmeticDisplaySecond,
    players,
    ball,
    activeCue,
    cueProgress: ball.progress,
    replay: {
      active: Boolean(controller.activeReplay),
      goalCueId: controller.activeReplay?.goalCueId,
      cueIndex: replaySample.cueIndex,
      cueCount: replaySample.cueCount,
      progress: replaySample.progress,
    },
    goalCelebration: {
      active: Boolean(liveGoalCelebration),
      side: liveGoalCelebration ? controller.activeLiveCue?.cue.side : undefined,
      progress: goalCelebrationProgress,
    },
    // A key moment is a presentation scene, so authoritative match time waits
    // until it has been shown in full. This covers both a materialized
    // highlight script and the raw-cue fallback used for a standalone restart
    // with no authored family (see collectNewCues) — either way, something is
    // visibly playing out and must not be overtaken by the next authoritative
    // tick. This pause never changes RNG or the result.
    blockSimulation: Boolean(
      controller.activeReplay ||
      liveGoalCelebration ||
      controller.activeLiveCue ||
      controller.pendingLiveCues.length > 0,
    ),
  };
  controller.lastFramePlayers = Object.fromEntries(Object.entries(players).map(([playerId, player]) => [playerId, {
    ...player,
    position: { ...player.position },
  }]));
  controller.lastFrameBall = { ...ball };
  controller.lastFrameAtMs = controller.visualClockMs;
  return frame;
};

export const MatchEngineV2FrameControllerService = {
  create: (
    snapshot: MatchEngineV2Snapshot,
    wallClockMs = 0,
  ): MatchEngineV2FrameController => {
    const playerTracks = createTracks(snapshot);
    const initialPlayers = Object.fromEntries(Object.entries(playerTracks).map(([playerId, track]) => [playerId, {
      playerId,
      position: { ...track.start },
      isOnPitch: track.isOnPitch,
    }]));
    return {
      visualClockMs: 0,
      lastWallClockMs: wallClockMs,
      lastSnapshotSecond: snapshot.second,
      clockSourceSecond: snapshot.second,
      clockBaselineFootballSecond: snapshot.displayClock.minute * 60 + snapshot.displayClock.secondInMinute,
      idleElapsedMsSinceBaseline: 0,
      cosmeticDisplaySecond: snapshot.displayClock.minute * 60 + snapshot.displayClock.secondInMinute,
      playerTracks,
      // Existing cues are history when a view is mounted or restored. Marking
      // them as seen prevents a saved match from replaying every old action.
      seenCueIds: new Set(snapshot.spatial.visualCues.map(cue => cue.id)),
      seenGoalCueIds: new Set(snapshot.spatial.visualCues.filter(cue => cue.kind === 'GOAL').map(cue => cue.id)),
      pendingLiveCues: [],
      activeLiveCue: null,
      replayQueue: [],
      activeReplay: null,
      lastFramePlayers: initialPlayers,
      lastFrameBall: {
        x: snapshot.spatial.ball.x,
        y: snapshot.spatial.ball.y,
        z: snapshot.spatial.ball.z,
        progress: 1,
        finished: true,
      },
      lastFrameAtMs: 0,
    };
  },

  advance: (
    controller: MatchEngineV2FrameController,
    snapshot: MatchEngineV2Snapshot,
    playback: MatchEngineV2PlaybackState,
    wallClockMs: number,
  ): MatchEngineV2Frame => {
    const safeWallClock = Math.max(controller.lastWallClockMs, wallClockMs);
    const elapsedWallMs = safeWallClock - controller.lastWallClockMs;
    controller.lastWallClockMs = safeWallClock;
    // An active replay keeps its own presentation clock running even after the
    // host pauses authoritative simulation in response to blockSimulation.
    if (!playback.paused || controller.activeReplay) {
      controller.visualClockMs += elapsedWallMs;
    }

    synchronizeTracks(controller, snapshot, playback);
    collectNewCues(controller, snapshot, playback);
    updateLiveCue(controller, snapshot, playback);
    updateReplay(controller, playback);
    controller.lastSnapshotSecond = snapshot.second;

    // The authoritative clock only moves in the coarse batches the host polls
    // at. Between two such batches, the on-screen clock still counts forward
    // smoothly on its own — but only while genuinely idle: a shown scene (or
    // a stored replay) freezes it exactly like it freezes authoritative time,
    // instead of letting it keep ticking through a goal celebration. The
    // baseline is the already half/stoppage-aware displayClock second, not
    // the raw monotonic engine second, so the cosmetic count never drifts
    // away from what the authoritative label will show once it catches up.
    if (snapshot.second !== controller.clockSourceSecond) {
      controller.clockSourceSecond = snapshot.second;
      controller.clockBaselineFootballSecond = snapshot.displayClock.minute * 60 + snapshot.displayClock.secondInMinute;
      controller.idleElapsedMsSinceBaseline = 0;
    }
    const isIdleForClock = !playback.paused &&
      !controller.activeLiveCue &&
      !controller.activeReplay &&
      controller.pendingLiveCues.length === 0;
    if (isIdleForClock) controller.idleElapsedMsSinceBaseline += elapsedWallMs;
    controller.cosmeticDisplaySecond = controller.clockBaselineFootballSecond +
      controller.idleElapsedMsSinceBaseline / 1000 * (MATCH_SECONDS_PER_MATCH_MINUTE / playback.speed);

    return makeFrame(controller, snapshot);
  },

  read: (
    controller: MatchEngineV2FrameController,
    snapshot: MatchEngineV2Snapshot,
  ): MatchEngineV2Frame => makeFrame(controller, snapshot),

  needsAnimation: (
    controller: MatchEngineV2FrameController,
    playback: MatchEngineV2PlaybackState,
  ): boolean => Boolean(controller.activeReplay || !playback.paused),
};
