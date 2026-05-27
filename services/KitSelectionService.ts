import { Club, ClubKitPattern } from '../types';
import { getActiveClubKits } from '../resources/ClubKits';

export interface KitSelection {
  home: {
    primary: string;
    shirtSecondary?: string;
    secondary: string;
    pattern?: ClubKitPattern;
    text: string;
  };
  away: {
    primary: string;
    shirtSecondary?: string;
    secondary: string;
    pattern?: ClubKitPattern;
    text: string;
  };
}

export const KitSelectionService = {
  /**
   * Calculates perceptual color distance between two hex colors.
   * Uses weighted Euclidean distance for better human perception approximation.
   */
  getColorDistance: (hex1: string, hex2: string): number => {
    const r1 = parseInt(hex1.substring(1, 3), 16);
    const g1 = parseInt(hex1.substring(3, 5), 16);
    const b1 = parseInt(hex1.substring(5, 7), 16);

    const r2 = parseInt(hex2.substring(1, 3), 16);
    const g2 = parseInt(hex2.substring(3, 5), 16);
    const b2 = parseInt(hex2.substring(5, 7), 16);

    const rmean = (r1 + r2) / 2;
    const r = r1 - r2;
    const g = g1 - g2;
    const b = b1 - b2;

    return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
  },

  getKitClashScore: (
    kitA: { primary: string; shirtSecondary?: string; secondary: string },
    kitB: { primary: string; shirtSecondary?: string; secondary: string }
  ): number => {
    const colorsA = [kitA.primary, kitA.shirtSecondary, kitA.secondary].filter(Boolean) as string[];
    const colorsB = [kitB.primary, kitB.shirtSecondary, kitB.secondary].filter(Boolean) as string[];
    return Math.min(...colorsA.flatMap(a => colorsB.map(b => KitSelectionService.getColorDistance(a, b))));
  },

  /**
   * Determines if a color is light or dark for text contrast.
   */
  isColorLight: (hex: string): boolean => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  },

  /**
   * Selects the best possible combination from real club kit variants.
   */
  selectOptimalKits: (home: Club, away: Club): KitSelection => {
    const homeOptions = getActiveClubKits(home);
    const awayOptions = getActiveClubKits(away);
    const hKit = homeOptions[0];
    let bestOption = awayOptions[0];
    let maxScore = -1;

    for (const opt of awayOptions) {
      const shirtDistance = KitSelectionService.getColorDistance(opt.shirt, hKit.shirt);
      const accentDistance = Math.min(
        opt.shirtSecondary ? KitSelectionService.getColorDistance(opt.shirtSecondary, hKit.shirt) : shirtDistance,
        hKit.shirtSecondary ? KitSelectionService.getColorDistance(opt.shirt, hKit.shirtSecondary) : shirtDistance
      );
      const shortsDistance = Math.min(
        KitSelectionService.getColorDistance(opt.shorts, hKit.shirt),
        KitSelectionService.getColorDistance(opt.shirt, hKit.shorts)
      );
      const score = shirtDistance * 1.8 + accentDistance * 0.55 + shortsDistance * 0.25;
      if (score > maxScore) {
        maxScore = score;
        bestOption = opt;
      }
    }

    return {
      home: {
        primary: hKit.shirt,
        shirtSecondary: hKit.shirtSecondary,
        secondary: hKit.shorts,
        pattern: hKit.pattern,
        text: KitSelectionService.isColorLight(hKit.shirt) ? '#000000' : '#ffffff'
      },
      away: {
        primary: bestOption.shirt,
        shirtSecondary: bestOption.shirtSecondary,
        secondary: bestOption.shorts,
        pattern: bestOption.pattern,
        text: KitSelectionService.isColorLight(bestOption.shirt) ? '#000000' : '#ffffff'
      }
    };
  },

  /**
   * Selects the opponent kit that is furthest from the player's chosen shirt color.
   */
  selectOpponentKit: (playerKitHex: string, opponent: Club): { primary: string; shirtSecondary?: string; secondary: string; pattern?: ClubKitPattern; text: string } => {
    const oppKits = getActiveClubKits(opponent);
    let bestIdx = 0;
    let maxDist = -1;

    for (let i = 0; i < oppKits.length; i++) {
      const dist = KitSelectionService.getColorDistance(playerKitHex, oppKits[i].shirt);
      if (dist > maxDist) {
        maxDist = dist;
        bestIdx = i;
      }
    }

    const kit = oppKits[bestIdx];
    return {
      primary: kit.shirt,
      shirtSecondary: kit.shirtSecondary,
      secondary: kit.shorts,
      pattern: kit.pattern,
      text: KitSelectionService.isColorLight(kit.shirt) ? '#000000' : '#ffffff'
    };
  }
};
