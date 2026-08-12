import { Club, Fixture, MatchStatus, CompetitionType } from '../types';

export const UEFASuperCupService = {
  /**
   * Generuje fixture Superpucharu Europy.
   * @param year Rok, w którym rozgrywany jest mecz (23 sierpnia)
   * @param clubs Lista aktualnych klubów
   * @param clWinnerId ID zdobywcy Ligi Mistrzów; ma pierwszeństwo przed obsadą startową
   * @param elWinnerId ID zdobywcy Ligi Europy; ma pierwszeństwo przed obsadą startową
   */
  generateFixture: (year: number, clubs: Club[], clWinnerId?: string, elWinnerId?: string): Fixture => {
    // Obsada historyczna przy bezpośrednim rozpoczęciu kariery w danym sezonie.
    // W kolejnych sezonach GameContext przekazuje rzeczywistych zwycięzców LM i LE.
    const initialEuropaLeagueWinnerId = year === 2026
      ? 'EU_EL_ASTON_VILLA'
      : 'EU_CL_TOTTENHAM_HOTSPUR';
    const homeId = clWinnerId ?? 'EU_CL_PARIS_SAINT_GERMAIN';
    let awayId = elWinnerId ?? initialEuropaLeagueWinnerId;

    // Obsługa dubletu: ta sama drużyna wygrała LM i LE
    if (homeId === awayId) {
      const fallback = clubs.find(c => c.id.startsWith('EU_CL_') && c.id !== homeId);
      awayId = fallback?.id ?? 'EU_CL_REAL_MADRYT';
    }

    return {
      id: `UEFA_SUPER_CUP_${year}`,
      leagueId: CompetitionType.UEFA_SUPER_CUP,
      homeTeamId: homeId,
      awayTeamId: awayId,
      date: new Date(year, 7, 23), // 23 Sierpnia
      status: MatchStatus.SCHEDULED,
      homeScore: null,
      awayScore: null,
    };
  },
};
