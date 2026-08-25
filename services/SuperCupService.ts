
import { Club, Fixture, MatchStatus, CompetitionType } from '../types';

interface HistoricalSuperCupParticipants {
  championId: string;
  cupWinnerId: string;
}

/**
 * Participants known before a new career starts. These values must be kept
 * separate from European qualification: when a cup winner also qualifies for
 * the Champions League, its Europa League place can pass to another club, but
 * the cup winner still remains the Polish Super Cup participant.
 */
const INITIAL_SUPER_CUP_PARTICIPANTS: Partial<Record<number, HistoricalSuperCupParticipants>> = {
  2025: {
    championId: 'PL_LEGIA_WARSZAWA',
    cupWinnerId: 'PL_LECH_POZNAN',
  },
  2026: {
    championId: 'PL_LECH_POZNAN',
    cupWinnerId: 'PL_GORNIK_ZABRZE',
  },
};

export const SuperCupService = {
  /**
   * Generuje fixture Superpucharu Polski.
   * @param year Rok, w którym rozgrywany jest mecz (lipiec)
   * @param clubs Lista aktualnych klubów
   * @param championId ID mistrza z poprzedniego sezonu (opcjonalne)
   * @param cupWinnerId ID zdobywcy pucharu z poprzedniego sezonu (opcjonalne)
   */
  generateFixture: (year: number, clubs: Club[], championId?: string, cupWinnerId?: string): Fixture => {
    // Explicit winners always come from a completed in-game season and take
    // precedence over historical career-start data. The historical pair is
    // used only when neither winner is supplied, which is exactly the normal
    // new-career and datapack-import path.
    const historicalParticipants = !championId && !cupWinnerId
      ? INITIAL_SUPER_CUP_PARTICIPANTS[year]
      : undefined;
    const topClubs = [...clubs]
      .filter(club => club.leagueId === 'L_PL_1')
      .sort((left, right) =>
        right.stats.points - left.stats.points ||
        right.stats.goalDifference - left.stats.goalDifference ||
        right.stats.goalsFor - left.stats.goalsFor ||
        left.id.localeCompare(right.id)
      );

    // Home is the champion. Away is the cup winner, except after a domestic
    // double, when the highest-ranked different league club takes the place.
    // Table order is now only a defensive fallback for unsupported years; it
    // can no longer let datapack array order decide the 2026/27 participants.
    const homeId = championId
      ?? historicalParticipants?.championId
      ?? topClubs[0]?.id
      ?? 'PL_LEGIA_WARSZAWA';
    const potentialAwayId = cupWinnerId
      ?? historicalParticipants?.cupWinnerId
      ?? topClubs[1]?.id
      ?? 'PL_LECH_POZNAN';
    const awayId = homeId === potentialAwayId
      ? topClubs.find(club => club.id !== homeId)?.id
        ?? (homeId === 'PL_LEGIA_WARSZAWA' ? 'PL_LECH_POZNAN' : 'PL_LEGIA_WARSZAWA')
      : potentialAwayId;

    return {
      id: `SUPER_CUP_${year}_${homeId}_${awayId}`,
      leagueId: CompetitionType.SUPER_CUP,
      homeTeamId: homeId,
      awayTeamId: awayId,
      date: new Date(year, 6, 12), // Sztywna data: 12 Lipca
      status: MatchStatus.SCHEDULED,
      homeScore: null,
      awayScore: null,
      neutralVenue: true
    };
  }
};
