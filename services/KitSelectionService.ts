import { Club, ClubKit, ClubKitPattern, NationalTeam } from '../types';
import { getActiveClubKits, getActiveNationalTeamKits } from '../resources/ClubKits';

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

const MIN_PRIMARY_SHIRT_DISTANCE = 120;

const buildKitSelection = (homeKit: ClubKit, awayKit: ClubKit): KitSelection => ({
  home: {
    primary: homeKit.shirt,
    shirtSecondary: homeKit.shirtSecondary,
    secondary: homeKit.shorts,
    pattern: homeKit.pattern,
    text: KitSelectionService.isColorLight(homeKit.shirt) ? '#000000' : '#ffffff'
  },
  away: {
    primary: awayKit.shirt,
    shirtSecondary: awayKit.shirtSecondary,
    secondary: awayKit.shorts,
    pattern: awayKit.pattern,
    text: KitSelectionService.isColorLight(awayKit.shirt) ? '#000000' : '#ffffff'
  }
});

const getKitPairScore = (homeKit: ClubKit, awayKit: ClubKit) => {
  const primaryDistance = KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shirt);
  const accentDistance = Math.min(
    awayKit.shirtSecondary ? KitSelectionService.getColorDistance(awayKit.shirtSecondary, homeKit.shirt) : primaryDistance,
    homeKit.shirtSecondary ? KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shirtSecondary) : primaryDistance
  );
  const shortsDistance = Math.min(
    KitSelectionService.getColorDistance(awayKit.shorts, homeKit.shirt),
    KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shorts)
  );
  return {
    primaryDistance,
    supportingScore: accentDistance * 0.55 + shortsDistance * 0.25,
  };
};

const isBetterKitPair = (
  candidate: ReturnType<typeof getKitPairScore>,
  current: ReturnType<typeof getKitPairScore>
): boolean => {
  const candidateHasContrast = candidate.primaryDistance >= MIN_PRIMARY_SHIRT_DISTANCE;
  const currentHasContrast = current.primaryDistance >= MIN_PRIMARY_SHIRT_DISTANCE;
  if (candidateHasContrast !== currentHasContrast) return candidateHasContrast;
  if (candidate.primaryDistance !== current.primaryDistance) return candidate.primaryDistance > current.primaryDistance;
  return candidate.supportingScore > current.supportingScore;
};

const selectBestAwayKit = (homeKit: ClubKit, awayOptions: ClubKit[]): ClubKit => {
  let bestAwayKit = awayOptions[0];
  let bestScore = getKitPairScore(homeKit, bestAwayKit);
  for (const awayKit of awayOptions.slice(1)) {
    const score = getKitPairScore(homeKit, awayKit);
    if (isBetterKitPair(score, bestScore)) {
      bestAwayKit = awayKit;
      bestScore = score;
    }
  }
  return bestAwayKit;
};

const selectOptimalKitsFromVariants = (homeOptions: ClubKit[], awayOptions: ClubKit[]): KitSelection => {
  const homeKit = homeOptions[0];
  return buildKitSelection(homeKit, selectBestAwayKit(homeKit, awayOptions));
};

const selectOptimalNationalTeamKitsFromVariants = (homeOptions: ClubKit[], awayOptions: ClubKit[]): KitSelection => {
  const defaultHomeKit = homeOptions[0];
  const defaultAwayKit = selectBestAwayKit(defaultHomeKit, awayOptions);
  if (getKitPairScore(defaultHomeKit, defaultAwayKit).primaryDistance >= MIN_PRIMARY_SHIRT_DISTANCE) {
    return buildKitSelection(defaultHomeKit, defaultAwayKit);
  }

  let bestHomeKit = defaultHomeKit;
  let bestAwayKit = defaultAwayKit;
  let bestScore = getKitPairScore(bestHomeKit, bestAwayKit);
  for (const homeKit of homeOptions) {
    for (const awayKit of awayOptions) {
      const score = getKitPairScore(homeKit, awayKit);
      if (isBetterKitPair(score, bestScore)) {
        bestHomeKit = homeKit;
        bestAwayKit = awayKit;
        bestScore = score;
      }
    }
  }
  return buildKitSelection(bestHomeKit, bestAwayKit);
};

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
    return selectOptimalKitsFromVariants(homeOptions, awayOptions);
  },

  selectOptimalNationalTeamKits: (home: NationalTeam, away: NationalTeam): KitSelection =>
    selectOptimalNationalTeamKitsFromVariants(getActiveNationalTeamKits(home), getActiveNationalTeamKits(away)),

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
