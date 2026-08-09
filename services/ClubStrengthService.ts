export const CLUB_REPUTATION_MIN = 1;
export const CLUB_REPUTATION_DOMESTIC_CEILING = 10;
export const CLUB_REPUTATION_MAX = 20;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Wspólna skala poziomu sportowego klubu używana przez systemy transferowe.
 * Do reputacji 10 zachowuje dotychczasową krzywą, a powyżej 10 spłaszcza
 * progresję tak, aby reputacja 20 odpowiadała poziomowi 96 zamiast 118.
 */
export const ClubStrengthService = {
  getLevel(reputation: number): number {
    const normalizedReputation = clamp(
      Number.isFinite(reputation) ? reputation : CLUB_REPUTATION_MIN,
      CLUB_REPUTATION_MIN,
      CLUB_REPUTATION_MAX,
    );

    if (normalizedReputation <= CLUB_REPUTATION_DOMESTIC_CEILING) {
      return 34 + normalizedReputation * 4.2;
    }

    return 76 + (normalizedReputation - CLUB_REPUTATION_DOMESTIC_CEILING) * 2;
  },

  getExposure(reputation: number): number {
    const minimumLevel = 34 + CLUB_REPUTATION_MIN * 4.2;
    const maximumLevel = 96;
    return clamp(
      (ClubStrengthService.getLevel(reputation) - minimumLevel) / (maximumLevel - minimumLevel),
      0,
      1,
    );
  },
};
