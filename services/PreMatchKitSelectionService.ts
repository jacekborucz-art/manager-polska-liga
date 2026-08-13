import { Club } from '../types';
import { KitSelection, KitSelectionService } from './KitSelectionService';
import type { KitVariant } from '../resources/PlayerCardAssets';

type MatchKit = KitSelection['home'];

const toMatchKit = (variant: KitVariant): MatchKit => ({
  primary: variant.hex,
  shirtSecondary: variant.shirtSecondaryHex,
  secondary: variant.secondaryHex ?? variant.hex,
  pattern: variant.pattern,
  text: KitSelectionService.isColorLight(variant.hex) ? '#000000' : '#ffffff'
});

/**
 * Shared pre-match kit flow used by league and cup studios.
 *
 * The home club keeps its first active kit whenever the opponent has a contrasting
 * variant. If that is impossible, all legal pairs are checked automatically.
 */
const selectInitialKits = (homeClub: Club, awayClub: Club): KitSelection => {
  return KitSelectionService.selectOptimalKits(homeClub, awayClub);
};

/**
 * Applies the user's explicit choice and immediately recalculates the opponent kit.
 * This makes the selection deterministic from the UI perspective while still
 * preventing kit clashes. The returned object is already ordered as home/away,
 * regardless of which side is controlled by the player.
 */
const selectForUserVariant = (
  homeClub: Club,
  awayClub: Club,
  userClubId: string,
  selectedVariant: KitVariant
): KitSelection => {
  const isUserHome = homeClub.id === userClubId;
  const opponentClub = isUserHome ? awayClub : homeClub;
  const userKit = toMatchKit(selectedVariant);
  const opponentKit = KitSelectionService.selectOpponentKitForKit(userKit, opponentClub);

  return isUserHome
    ? { home: userKit, away: opponentKit }
    : { home: opponentKit, away: userKit };
};

export const PreMatchKitSelectionService = {
  selectInitialKits,
  selectForUserVariant
};
