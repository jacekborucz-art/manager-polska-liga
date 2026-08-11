import { Club } from '../types';
import { KitSelection, KitSelectionService } from './KitSelectionService';
import { getClubKitVariantsForClub, KitVariant } from '../resources/PlayerCardAssets';

type MatchKit = KitSelection['home'];

const getEffectiveKitDistance = (firstKit: KitVariant, secondKit: KitVariant): number => {
  const firstColors = [firstKit.hex, firstKit.shirtSecondaryHex, firstKit.secondaryHex].filter(Boolean) as string[];
  const secondColors = [secondKit.hex, secondKit.shirtSecondaryHex, secondKit.secondaryHex].filter(Boolean) as string[];

  return Math.min(
    ...firstColors.flatMap(firstColor =>
      secondColors.map(secondColor => KitSelectionService.getColorDistance(firstColor, secondColor))
    )
  );
};

const toMatchKit = (variant: KitVariant, fallbackVariant: KitVariant): MatchKit => ({
  primary: variant.hex,
  shirtSecondary: variant.shirtSecondaryHex,
  secondary: variant.secondaryHex ?? fallbackVariant.hex,
  pattern: variant.pattern,
  text: KitSelectionService.isColorLight(variant.hex) ? '#000000' : '#ffffff'
});

const findMostContrastingVariant = (selectedVariant: KitVariant, opponentVariants: KitVariant[]): number => {
  let bestIndex = 0;
  let bestDistance = -1;

  opponentVariants.forEach((variant, index) => {
    const distance = getEffectiveKitDistance(selectedVariant, variant);
    if (distance > bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
};

/**
 * Shared pre-match kit flow used by league and cup studios.
 *
 * The home club starts in its first active kit. The opponent is then assigned the
 * active variant with the greatest effective color distance. The comparison uses
 * shirt, accent and shorts colors so that a striped or two-color shirt cannot pass
 * the clash check only because its nominal primary color is different.
 */
const selectInitialKits = (homeClub: Club, awayClub: Club): KitSelection => {
  const homeVariants = getClubKitVariantsForClub(homeClub);
  const awayVariants = getClubKitVariantsForClub(awayClub);
  const homeVariant = homeVariants[0];
  const awayIndex = findMostContrastingVariant(homeVariant, awayVariants);
  const awayVariant = awayVariants[awayIndex];

  return {
    home: toMatchKit(homeVariant, homeVariant),
    away: toMatchKit(awayVariant, awayVariant)
  };
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
  const userClub = isUserHome ? homeClub : awayClub;
  const opponentClub = isUserHome ? awayClub : homeClub;
  const userVariants = getClubKitVariantsForClub(userClub);
  const opponentVariants = getClubKitVariantsForClub(opponentClub);
  const selectedIndex = Math.max(
    0,
    userVariants.findIndex(variant => (variant.id ?? variant.hex) === (selectedVariant.id ?? selectedVariant.hex))
  );
  const opponentIndex = findMostContrastingVariant(selectedVariant, opponentVariants);
  const userKit = toMatchKit(selectedVariant, userVariants[(selectedIndex + 1) % userVariants.length] ?? selectedVariant);
  const opponentVariant = opponentVariants[opponentIndex];
  const opponentKit = toMatchKit(
    opponentVariant,
    opponentVariants[(opponentIndex + 1) % opponentVariants.length] ?? opponentVariant
  );

  return isUserHome
    ? { home: userKit, away: opponentKit }
    : { home: opponentKit, away: userKit };
};

export const PreMatchKitSelectionService = {
  selectInitialKits,
  selectForUserVariant
};
