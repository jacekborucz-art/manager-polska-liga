
import { Club } from '../types';

export interface KitSelection {
  home: {
    primary: string;
    secondary: string;
    text: string;
  };
  away: {
    primary: string;
    secondary: string;
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
    
    // Perceptual weighting formula
    return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
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
   * Selects the best possible combination of colors from 3-color palettes of both clubs.
   */
  selectOptimalKits: (home: Club, away: Club): KitSelection => {
    const homeColors = home.colorsHex;
    const awayColors = away.colorsHex;

    // Gospodarze zawsze w stroju podstawowym
    const hShirt = homeColors[0] ?? '#1d4ed8';
    const hShorts = homeColors[1] ?? homeColors[0] ?? '#93c5fd';

    // Warianty strojów gości: mieszane (koszulka[i] + spodenki[i+1]) + jednolite (koszulka[i] + spodenki[i])
    interface KitOption { shirt: string; shorts: string; isPrimary: boolean; }
    const awayOptions: KitOption[] = [];
    for (let i = 0; i < awayColors.length; i++) {
      awayOptions.push({ shirt: awayColors[i], shorts: awayColors[(i + 1) % awayColors.length], isPrimary: i === 0 });
      awayOptions.push({ shirt: awayColors[i], shorts: awayColors[i], isPrimary: false });
    }

    let bestOption = awayOptions[0];
    let maxScore = -1;

    for (const opt of awayOptions) {
      // Każdy kolor gości musi być różny od KAŻDEGO koloru gospodarzy
      const d1 = KitSelectionService.getColorDistance(opt.shirt, hShirt);
      const d2 = KitSelectionService.getColorDistance(opt.shirt, hShorts);
      const d3 = KitSelectionService.getColorDistance(opt.shorts, hShirt);
      const d4 = KitSelectionService.getColorDistance(opt.shorts, hShorts);
      // Wynik to najgorszy przypadek (najblizszA para) — maksymalizujemy najslabsze ogniwo
      const score = Math.min(d1, d2, d3, d4) + (opt.isPrimary ? 40 : 0);
      if (score > maxScore) { maxScore = score; bestOption = opt; }
    }

    return {
      home: {
        primary: hShirt,
        secondary: hShorts,
        text: KitSelectionService.isColorLight(hShirt) ? '#000000' : '#ffffff'
      },
      away: {
        primary: bestOption.shirt,
        secondary: bestOption.shorts,
        text: KitSelectionService.isColorLight(bestOption.shirt) ? '#000000' : '#ffffff'
      }
    };
  },

  /**
   * Wybiera optymalną koszulkę przeciwnika na podstawie wybranego koloru gracza.
   * Szuka koloru z największą odległością percepcyjną (brak kolizji).
   */
  selectOpponentKit: (playerKitHex: string, opponent: Club): { primary: string; secondary: string; text: string } => {
    const oppColors = opponent.colorsHex;
    let bestIdx = 0;
    let maxDist = -1;
    for (let i = 0; i < oppColors.length; i++) {
      const dist = KitSelectionService.getColorDistance(playerKitHex, oppColors[i]);
      if (dist > maxDist) { maxDist = dist; bestIdx = i; }
    }
    const primary = oppColors[bestIdx];
    return {
      primary,
      secondary: oppColors[(bestIdx + 1) % oppColors.length] || primary,
      text: KitSelectionService.isColorLight(primary) ? '#000000' : '#ffffff'
    };
  }
};
