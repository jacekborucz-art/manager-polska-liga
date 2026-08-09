import {
  CLUB_REPUTATION_DOMESTIC_CEILING,
  CLUB_REPUTATION_MAX,
  CLUB_REPUTATION_MIN,
} from './ClubStrengthService';

export type EuropeanClubTrophy =
  | 'CONFERENCE_LEAGUE'
  | 'EUROPA_LEAGUE'
  | 'CHAMPIONS_LEAGUE';

export interface ClubSeasonHonours {
  wonPolishChampionship?: boolean;
  wonPolishCup?: boolean;
  europeanTrophies?: EuropeanClubTrophy[];
}

interface FinalFixtureResult {
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
}

const EUROPEAN_TROPHY_BONUS: Record<EuropeanClubTrophy, number> = {
  CONFERENCE_LEAGUE: 1,
  EUROPA_LEAGUE: 1,
  CHAMPIONS_LEAGUE: 2,
};

const clampReputation = (reputation: number): number => {
  const safeReputation = Number.isFinite(reputation) ? reputation : CLUB_REPUTATION_MIN;
  return Math.min(CLUB_REPUTATION_MAX, Math.max(CLUB_REPUTATION_MIN, safeReputation));
};

export const ClubReputationService = {
  calculateSeasonEndReputation(
    currentReputation: number,
    honours: ClubSeasonHonours,
  ): number {
    let nextReputation = clampReputation(currentReputation);
    const domesticBonus =
      (honours.wonPolishChampionship ? 1 : 0) +
      (honours.wonPolishCup ? 0.5 : 0);

    // Krajowe sukcesy rozwijają klub tylko do poziomu odpowiadającego
    // maksymalnej reputacji polskiej ligi. Nie mogą obniżyć klubu, który
    // wcześniej przekroczył ten próg dzięki wynikom w Europie.
    if (domesticBonus > 0 && nextReputation < CLUB_REPUTATION_DOMESTIC_CEILING) {
      nextReputation = Math.min(CLUB_REPUTATION_DOMESTIC_CEILING, nextReputation + domesticBonus);
    }

    const europeanBonus = (honours.europeanTrophies ?? []).reduce(
      (sum, trophy) => sum + EUROPEAN_TROPHY_BONUS[trophy],
      0,
    );

    return Math.min(CLUB_REPUTATION_MAX, nextReputation + europeanBonus);
  },

  resolveFinalWinnerId(fixture: FinalFixtureResult | null | undefined): string | null {
    if (!fixture || fixture.homeScore == null || fixture.awayScore == null) return null;
    if (fixture.homeScore > fixture.awayScore) return fixture.homeTeamId;
    if (fixture.awayScore > fixture.homeScore) return fixture.awayTeamId;

    if (fixture.homePenaltyScore == null || fixture.awayPenaltyScore == null) return null;
    if (fixture.homePenaltyScore > fixture.awayPenaltyScore) return fixture.homeTeamId;
    if (fixture.awayPenaltyScore > fixture.homePenaltyScore) return fixture.awayTeamId;
    return null;
  },
};
