import { clamp } from '../cupV2';
import type {
  MatchEngineV2Frame,
  MatchEngineV2GroupBehaviorId,
  MatchEngineV2PlayerSpatialState,
  MatchEngineV2Point,
  MatchEngineV2Side,
} from './MatchEngineV2Types';

// Duplicated on purpose from MatchEngineV2FrameControllerService, which is
// this service's only caller: importing back from there would create a
// circular module dependency for two small, stable geometry helpers.
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

/** HOME always attacks towards metre 105, so its own goal sits at metre 0. */
const ownGoalY = (side: MatchEngineV2Side): number => side === 'HOME' ? 0 : 105;
const attackDirection = (side: MatchEngineV2Side): 1 | -1 => side === 'HOME' ? 1 : -1;

export type MatchEngineV2GroupBehaviorContext = {
  /** Mutated in place, exactly like the choreography functions that call this. */
  players: MatchEngineV2Frame['players'];
  spatialPlayers: Record<string, MatchEngineV2PlayerSpatialState>;
  /** The team this single behavior call should move. */
  side: MatchEngineV2Side;
  ballPoint: MatchEngineV2Point;
  /** 0..1 through the current step. */
  progress: number;
  /** Actor/receiver of the step: already handled by applyActionChoreography. */
  excludeIds: ReadonlySet<string>;
  /** Stable per-scene origin, matching sceneOrigin's fallback-to-current-position pattern. */
  originFor: (playerId: string, fallback: MatchEngineV2Point) => MatchEngineV2Point;
  /** Presentation speed cap shared with the rest of this cue's choreography. */
  maxTravel: number;
};

const eligiblePlayers = (
  ctx: MatchEngineV2GroupBehaviorContext,
  roles: ReadonlyArray<MatchEngineV2PlayerSpatialState['role']>,
): MatchEngineV2PlayerSpatialState[] =>
  Object.values(ctx.spatialPlayers).filter(player =>
    player.isOnPitch &&
    player.side === ctx.side &&
    roles.includes(player.role) &&
    !ctx.excludeIds.has(player.playerId) &&
    ctx.players[player.playerId]
  );

const moveTo = (
  ctx: MatchEngineV2GroupBehaviorContext,
  playerId: string,
  target: MatchEngineV2Point,
): void => {
  const rendered = ctx.players[playerId];
  const origin = ctx.originFor(playerId, rendered.position);
  const bounded = movePointTowards(origin, target, ctx.maxTravel);
  rendered.position = interpolatePoint(origin, bounded, ctx.progress);
};

type GroupBehaviorFn = (ctx: MatchEngineV2GroupBehaviorContext) => void;

/** Defenders drop off towards their own goal as the ball advances. */
const defensiveLineRetreat: GroupBehaviorFn = ctx => {
  const goalY = ownGoalY(ctx.side);
  eligiblePlayers(ctx, ['DEF']).forEach(player => {
    const origin = ctx.originFor(player.playerId, ctx.players[player.playerId].position);
    moveTo(ctx, player.playerId, { x: origin.x, y: origin.y + (goalY - origin.y) * 0.22 });
  });
};

const shiftMidfield = (ctx: MatchEngineV2GroupBehaviorContext, signX: number): void => {
  eligiblePlayers(ctx, ['MID']).forEach(player => {
    const origin = ctx.originFor(player.playerId, ctx.players[player.playerId].position);
    moveTo(ctx, player.playerId, { x: clamp(origin.x + signX * 9, 3, 65), y: origin.y });
  });
};

/** Midfield block slides towards the flank the ball is being played down. */
const midfieldShiftLeft: GroupBehaviorFn = ctx => shiftMidfield(ctx, -1);
const midfieldShiftRight: GroupBehaviorFn = ctx => shiftMidfield(ctx, 1);

/** The whole outfield team steps up together, e.g. after winning the ball. */
const teamPushForward: GroupBehaviorFn = ctx => {
  const direction = attackDirection(ctx.side);
  eligiblePlayers(ctx, ['DEF', 'MID', 'FWD']).forEach(player => {
    const origin = ctx.originFor(player.playerId, ctx.players[player.playerId].position);
    moveTo(ctx, player.playerId, { x: origin.x, y: origin.y + direction * 6 });
  });
};

/** Forwards and attacking midfielders load the box for a cross or cutback. */
const attackersEnterBox: GroupBehaviorFn = ctx => {
  const direction = attackDirection(ctx.side);
  const boxY = direction === 1 ? 100 : 5;
  eligiblePlayers(ctx, ['FWD', 'MID']).forEach((player, index) => {
    moveTo(ctx, player.playerId, {
      x: clamp(ctx.ballPoint.x + (index - 1) * 9, 12, 56),
      y: clamp(boxY - direction * (index % 3) * 3, 3, 102),
    });
  });
};

/** Deliberately minimal: a settled backline that holds shape instead of scrambling. */
const defendersHoldLine: GroupBehaviorFn = ctx => {
  eligiblePlayers(ctx, ['DEF']).forEach(player => {
    const origin = ctx.originFor(player.playerId, ctx.players[player.playerId].position);
    moveTo(ctx, player.playerId, { x: origin.x + clamp((ctx.ballPoint.x - origin.x) * 0.06, -1.5, 1.5), y: origin.y });
  });
};

const MATCH_ENGINE_V2_GROUP_BEHAVIORS: Record<MatchEngineV2GroupBehaviorId, GroupBehaviorFn> = {
  DEFENSIVE_LINE_RETREAT: defensiveLineRetreat,
  MIDFIELD_SHIFT_LEFT: midfieldShiftLeft,
  MIDFIELD_SHIFT_RIGHT: midfieldShiftRight,
  TEAM_PUSH_FORWARD: teamPushForward,
  ATTACKERS_ENTER_BOX: attackersEnterBox,
  DEFENDERS_HOLD_LINE: defendersHoldLine,
};

export const MatchEngineV2GroupBehaviorService = {
  apply: (id: MatchEngineV2GroupBehaviorId, ctx: MatchEngineV2GroupBehaviorContext): void => {
    MATCH_ENGINE_V2_GROUP_BEHAVIORS[id](ctx);
  },
};
