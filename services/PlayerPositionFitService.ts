import { Player, PlayerPosition } from '../types';
import { PlayerAttributesGenerator } from './PlayerAttributesGenerator';

export const DEFAULT_SECONDARY_POSITION_RATING = 50;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const isGoalkeeperMismatch = (player: Player, role: PlayerPosition): boolean =>
  player.position === PlayerPosition.GK
    ? role !== PlayerPosition.GK
    : role === PlayerPosition.GK;

const getPositionFamilyDistance = (from: PlayerPosition, to: PlayerPosition): number => {
  if (from === to) return 0;
  if (from === PlayerPosition.GK || to === PlayerPosition.GK) return 1;
  if (
    (from === PlayerPosition.DEF && to === PlayerPosition.FWD) ||
    (from === PlayerPosition.FWD && to === PlayerPosition.DEF)
  ) return 0.95;
  if (
    (from === PlayerPosition.DEF && to === PlayerPosition.MID) ||
    (from === PlayerPosition.MID && to === PlayerPosition.DEF)
  ) return 0.55;
  if (
    (from === PlayerPosition.MID && to === PlayerPosition.FWD) ||
    (from === PlayerPosition.FWD && to === PlayerPosition.MID)
  ) return 0.48;
  return 0.7;
};

const getRoleOverall = (player: Player, role: PlayerPosition): number =>
  PlayerAttributesGenerator.calculateOverall(player.attributes, role);

// Role familiarity is separate from raw attribute quality. A midfielder can have good striker
// attributes, but still needs a smaller tactical adaptation penalty if FWD is not his natural role.
const getRoleFamiliarity = (player: Player, role: PlayerPosition, useSecondaryPosition = false): number => {
  if (player.position === role) return 1;
  if (isGoalkeeperMismatch(player, role)) return 0;
  if (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)) {
    const rating = PlayerPositionFitService.getSecondaryRating(player);
    return clamp(0.72 + (rating / 99) * 0.28, 0.72, 1);
  }
  return clamp(1 - getPositionFamilyDistance(player.position, role) * 0.42, 0.54, 0.78);
};

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
    if (isGoalkeeperMismatch(player, role)) return 1;

    // The old model treated every non-matching field role as the same penalty. This curve first
    // recalculates the player's real overall for the requested role, then blends that quality drop
    // with positional familiarity. Good attributes for the new role soften the penalty; hard family
    // jumps like FWD -> DEF still hurt if the role-specific overall collapses.
    const naturalOverall = Math.max(1, player.overallRating || getRoleOverall(player, player.position));
    const roleOverall = PlayerPositionFitService.getRoleOverall(player, role);
    const familyDistance = getPositionFamilyDistance(player.position, role);
    const familiarity = getRoleFamiliarity(player, role, useSecondaryPosition);
    const qualityDrop = clamp((naturalOverall - roleOverall) / 24, -0.25, 1);

    if (useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)) {
      const secondaryGap = 1 - (PlayerPositionFitService.getSecondaryRating(player) / 99);
      const raw = (qualityDrop * 0.58) + (secondaryGap * 0.32) + ((1 - familiarity) * 0.10);
      return clamp(Math.pow(Math.max(0, raw), 1.25), 0.02, 0.55);
    }

    const raw = (qualityDrop * 0.68) + (familyDistance * 0.24) + ((1 - familiarity) * 0.08);
    return clamp(Math.pow(Math.max(0, raw), 1.18), 0.08, 1);
  },

  getFitScoreBonus: (player: Player, role: PlayerPosition, useSecondaryPosition = false): number => {
    if (player.position === role) return 16;
    if (isGoalkeeperMismatch(player, role)) return -80;

    // Lineup and AI substitution scoring use this value, so the coach now compares players by
    // role-specific usefulness instead of only checking the label printed on their position.
    const roleOverall = PlayerPositionFitService.getRoleOverall(player, role);
    const naturalOverall = Math.max(1, player.overallRating || getRoleOverall(player, player.position));
    const familiarity = getRoleFamiliarity(player, role, useSecondaryPosition);
    const roleQualityDelta = clamp(roleOverall - naturalOverall, -18, 12);
    const base = useSecondaryPosition && PlayerPositionFitService.hasSecondaryPosition(player, role)
      ? 16 * (PlayerPositionFitService.getSecondaryRating(player) / 99)
      : -10 * getPositionFamilyDistance(player.position, role);

    return clamp(base + roleQualityDelta * 0.55 + (familiarity - 0.65) * 12, -24, 16);
  },

  getSecondaryRating: (player: Player): number =>
    Math.max(1, Math.min(99, player.secondaryPositionRating ?? DEFAULT_SECONDARY_POSITION_RATING)),

  getRoleOverall,

  // Effective role overall is the number the match engine should use when team strength depends on
  // who is actually occupying each tactical slot during the live match.
  getEffectiveRoleOverall: (player: Player, role: PlayerPosition, useSecondaryPosition = false): number => {
    if (player.position === role) return clamp(Math.round(player.overallRating || getRoleOverall(player, role)), 1, 99);
    if (isGoalkeeperMismatch(player, role)) return Math.max(1, Math.round(getRoleOverall(player, role) * 0.35));
    const roleOverall = getRoleOverall(player, role);
    const penaltyFactor = PlayerPositionFitService.getPenaltyFactor(player, role, useSecondaryPosition);
    const familiarityDrag = player.position === role ? 0 : penaltyFactor * 8;
    return clamp(Math.round(roleOverall - familiarityDrag), 1, 99);
  },
};
