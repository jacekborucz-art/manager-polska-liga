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

export type MatchKitColors = KitSelection['home'];

export const MIN_KIT_CONTRAST_DISTANCE = 120;

const hasVisibleShirtAccent = (pattern?: ClubKitPattern): boolean => Boolean(pattern && pattern !== 'solid');

const getVisibleShirtColors = (
  kit: Pick<MatchKitColors, 'primary' | 'shirtSecondary' | 'pattern'>
): string[] => {
  const colors = [kit.primary];
  if (hasVisibleShirtAccent(kit.pattern) && kit.shirtSecondary) colors.push(kit.shirtSecondary);
  return [...new Set(colors)];
};

const toMatchKitColors = (kit: ClubKit): MatchKitColors => ({
  primary: kit.shirt,
  shirtSecondary: kit.shirtSecondary,
  secondary: kit.shorts,
  pattern: kit.pattern,
  text: KitSelectionService.isColorLight(kit.shirt) ? '#000000' : '#ffffff'
});

const buildKitSelection = (homeKit: ClubKit, awayKit: ClubKit): KitSelection => ({
  home: toMatchKitColors(homeKit),
  away: toMatchKitColors(awayKit)
});

const getKitPairScore = (homeKit: ClubKit, awayKit: ClubKit) => {
  const homeMatchKit = toMatchKitColors(homeKit);
  const awayMatchKit = toMatchKitColors(awayKit);
  const shirtDistance = KitSelectionService.getKitClashScore(homeMatchKit, awayMatchKit);
  const primaryDistance = KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shirt);
  const shortsDistance = Math.min(
    KitSelectionService.getColorDistance(awayKit.shorts, homeKit.shirt),
    KitSelectionService.getColorDistance(awayKit.shirt, homeKit.shorts)
  );
  return {
    shirtDistance,
    primaryDistance,
    supportingScore: primaryDistance * 0.7 + shortsDistance * 0.3,
  };
};

const isBetterKitPair = (
  candidate: ReturnType<typeof getKitPairScore>,
  current: ReturnType<typeof getKitPairScore>
): boolean => {
  const candidateHasContrast = candidate.shirtDistance >= MIN_KIT_CONTRAST_DISTANCE;
  const currentHasContrast = current.shirtDistance >= MIN_KIT_CONTRAST_DISTANCE;
  if (candidateHasContrast !== currentHasContrast) return candidateHasContrast;
  if (candidate.shirtDistance !== current.shirtDistance) return candidate.shirtDistance > current.shirtDistance;
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
  const defaultHomeKit = homeOptions[0];
  const defaultAwayKit = selectBestAwayKit(defaultHomeKit, awayOptions);
  if (getKitPairScore(defaultHomeKit, defaultAwayKit).shirtDistance >= MIN_KIT_CONTRAST_DISTANCE) {
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
    kitA: Pick<MatchKitColors, 'primary' | 'shirtSecondary' | 'pattern'>,
    kitB: Pick<MatchKitColors, 'primary' | 'shirtSecondary' | 'pattern'>
  ): number => {
    const colorsA = getVisibleShirtColors(kitA);
    const colorsB = getVisibleShirtColors(kitB);
    return Math.min(...colorsA.flatMap(a => colorsB.map(b => KitSelectionService.getColorDistance(a, b))));
  },

  hasKitClash: (
    kitA: Pick<MatchKitColors, 'primary' | 'shirtSecondary' | 'pattern'>,
    kitB: Pick<MatchKitColors, 'primary' | 'shirtSecondary' | 'pattern'>
  ): boolean => KitSelectionService.getKitClashScore(kitA, kitB) < MIN_KIT_CONTRAST_DISTANCE,

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
    selectOptimalKitsFromVariants(getActiveNationalTeamKits(home), getActiveNationalTeamKits(away)),

  /**
   * Selects the opponent kit after the player explicitly changes their own kit.
   */
  selectOpponentKitForKit: (playerKit: MatchKitColors, opponent: Club): MatchKitColors => {
    const opponentKits = getActiveClubKits(opponent);
    const selectedKit: ClubKit = {
      id: 'selected-player-kit',
      name: 'Wybrany strój',
      shirt: playerKit.primary,
      shirtSecondary: playerKit.shirtSecondary,
      shorts: playerKit.secondary,
      socks: playerKit.secondary,
      pattern: playerKit.pattern ?? 'solid',
      isActive: true
    };
    return toMatchKitColors(selectBestAwayKit(selectedKit, opponentKits));
  },

  /**
   * Selects the opponent kit that is furthest from the player's chosen shirt color.
   */
  selectOpponentKit: (playerKitHex: string, opponent: Club): { primary: string; shirtSecondary?: string; secondary: string; pattern?: ClubKitPattern; text: string } => {
    return KitSelectionService.selectOpponentKitForKit({
      primary: playerKitHex,
      secondary: playerKitHex,
      pattern: 'solid',
      text: KitSelectionService.isColorLight(playerKitHex) ? '#000000' : '#ffffff'
    }, opponent);
  }
};
