import type { CupSpatialDecisionContext } from '../cupV2';
import type { MatchEngineV2SpatialState } from './MatchEngineV2Types';

/**
 * Creates the read-only geometry consumed by individual football decisions.
 * The cup engine knows nothing about SVG or frame animation; it receives only
 * pitch metres, velocities and the current owner of the ball.
 */
const createContext = (spatial: MatchEngineV2SpatialState): CupSpatialDecisionContext => ({
  second: spatial.lastSecond,
  pitchLength: spatial.pitchLength,
  pitchWidth: spatial.pitchWidth,
  ball: {
    x: spatial.ball.x,
    y: spatial.ball.y,
    ownerId: spatial.ball.ownerId,
  },
  players: Object.fromEntries(Object.values(spatial.players).map(player => [player.playerId, {
    playerId: player.playerId,
    side: player.side,
    role: player.role,
    x: player.position.x,
    y: player.position.y,
    velocityX: player.velocity.x,
    velocityY: player.velocity.y,
    isOnPitch: player.isOnPitch,
  }])),
});

export const MatchEngineV2SpatialDecisionService = {
  createContext,
};
