import { Club, CompetitionType, Fixture, MatchHistoryEntry } from '../types';

export const POLISH_CUP_NEUTRAL_VENUE = {
  name: 'PGE Narodowy, Warszawa',
  capacity: 58_580,
} as const;

const isPolishCupFinal = (fixture: Pick<Fixture, 'id'>): boolean =>
  fixture.id.toUpperCase().includes('FINAŁ');

export const PolishCupVenueService = {
  getVenue: (
    fixture: Pick<Fixture, 'id' | 'leagueId'>,
    homeClub: Pick<Club, 'stadiumName' | 'stadiumCapacity'>
  ) => {
    const isNeutral = fixture.leagueId === CompetitionType.SUPER_CUP || isPolishCupFinal(fixture);

    return isNeutral
      ? { ...POLISH_CUP_NEUTRAL_VENUE, isNeutral: true }
      : { name: homeClub.stadiumName, capacity: homeClub.stadiumCapacity, isNeutral: false };
  },
  getHistoryVenue: (
    match: Pick<MatchHistoryEntry, 'matchId' | 'competition' | 'venue'>,
    homeClub: Pick<Club, 'stadiumName' | 'stadiumCapacity'>
  ): string => {
    const venue = PolishCupVenueService.getVenue(
      { id: match.matchId, leagueId: match.competition },
      homeClub
    );

    return venue.isNeutral ? venue.name : match.venue || venue.name;
  },
};
