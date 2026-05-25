import { Player, PlayerPosition } from '../types';

export const DEFAULT_SECONDARY_POSITION_RATING = 50;

const isGoalkeeperMismatch = (player: Player, role: PlayerPosition): boolean =>
  player.position === PlayerPosition.GK
    ? role !== PlayerPosition.GK
    : role === PlayerPosition.GK;

export const PlayerPositionFitService = {
  hasSecondaryPosition: (player: Player, role: PlayerPosition): boolean =>
    !isGoalkeeperMismatch(player, role) &&
    player.secondaryPosition === role &&
    player.secondaryPosition !== player.position,

  matchesRole: (player: Player, role: PlayerPosition, useSecondaryPosition = false): boolean =>
    player.position === role ||
    (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)),

  getPenaltyFactor: (player: Player, role: PlayerPosition, useSecondaryPosition = false): number => {
    if (player.position === role) return 0;
    if (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)) {
      const rating = Math.max(1, Math.min(99, player.secondaryPositionRating ?? DEFAULT_SECONDARY_POSITION_RATING));
      return 1 - (rating / 99);
    }
    return 1;
  },

  getFitScoreBonus: (player: Player, role: PlayerPosition, useSecondaryPosition = false): number => {
    if (player.position === role) return 16;
    if (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)) {
      const rating = Math.max(1, Math.min(99, player.secondaryPositionRating ?? DEFAULT_SECONDARY_POSITION_RATING));
      return 16 * (rating / 99);
    }
    return 0;
  },

  getSecondaryRating: (player: Player): number =>
    Math.max(1, Math.min(99, player.secondaryPositionRating ?? DEFAULT_SECONDARY_POSITION_RATING)),
};
