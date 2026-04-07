import { Club, Fixture, MatchStatus, CompetitionType } from '../types';

export const UEFASuperCupService = {
  /**
   * Generuje fixture Superpucharu Europy.
   * @param year Rok, w kt\u00f3rym rozgrywany jest mecz (23 Sierpnia)
   * @param clubs Lista aktualnych klub\u00f3w
   * @param clWinnerId ID zdobywcy Ligi Mistrz\u00f3w (opcjonalne \u2014 domy\u015blnie PSG dla lore 2025)
   * @param elWinnerId ID zdobywcy Ligi Europy (opcjonalne \u2014 domy\u015blnie Tottenham dla lore 2025)
   */
  generateFixture: (year: number, clubs: Club[], clWinnerId?: string, elWinnerId?: string): Fixture => {
    // Sezon 1 lore (2025): PSG wygra\u0142 LM, Tottenham wygra\u0142 LE
    const homeId = clWinnerId ?? 'EU_CL_PARIS_SAINT_GERMAIN';
    let awayId = elWinnerId ?? 'EU_CL_TOTTENHAM_HOTSPUR';

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
