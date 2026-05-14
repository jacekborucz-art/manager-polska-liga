
import { Club, Player, HealthStatus, PlayerStats } from '../types';

export interface StatRow {
  player: Player;
  club: Club;
}

const EMPTY_STATS: PlayerStats = {
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed: 0,
  minutesPlayed: 0,
  seasonalChanges: {},
  ratingHistory: []
};

const getStatsForLeagueId = (player: Player, leagueId?: string): PlayerStats => {
  if (leagueId === 'L_CL' || leagueId === 'L_EL' || leagueId === 'L_CONF') {
    return player.euroStats ?? EMPTY_STATS;
  }

  return player.stats ?? EMPTY_STATS;
};

export const LeagueStatsService = {
  getStatsForLeagueId,

  /**
   * Helper to get all players from valid clubs in a league
   */
  getPlayersForLeague: (
    leagueId: string, 
    clubs: Club[], 
    playersMap: Record<string, Player[]>
  ): StatRow[] => {
    const leagueClubs = clubs.filter(c => c.leagueId === leagueId && c.isDefaultActive);
    const rows: StatRow[] = [];

    leagueClubs.forEach(club => {
      const teamPlayers = playersMap[club.id] || [];
      teamPlayers.forEach(player => {
        rows.push({ player, club });
      });
    });

    return rows;
  },

  /**
   * 1. Top Scorers
   */
  getTopScorers: (rows: StatRow[], limit = 50, leagueId?: string): StatRow[] => {
    return [...rows]
      .filter(row => getStatsForLeagueId(row.player, leagueId).goals > 0)
      .sort((a, b) => {
        const aStats = getStatsForLeagueId(a.player, leagueId);
        const bStats = getStatsForLeagueId(b.player, leagueId);

        if (bStats.goals !== aStats.goals) {
            return bStats.goals - aStats.goals;
        }
        if (bStats.assists !== aStats.assists) {
            return bStats.assists - aStats.assists;
        }
        if (aStats.matchesPlayed !== bStats.matchesPlayed) {
            return aStats.matchesPlayed - bStats.matchesPlayed;
        }
        return a.player.lastName.localeCompare(b.player.lastName);
      })
      .slice(0, limit);
  },

  /**
   * 2. Top Assists
   */
  getTopAssists: (rows: StatRow[], limit = 50, leagueId?: string): StatRow[] => {
    return [...rows]
      .filter(row => getStatsForLeagueId(row.player, leagueId).assists > 0)
      .sort((a, b) => {
        const aStats = getStatsForLeagueId(a.player, leagueId);
        const bStats = getStatsForLeagueId(b.player, leagueId);

        if (bStats.assists !== aStats.assists) {
            return bStats.assists - aStats.assists;
        }
        if (bStats.goals !== aStats.goals) {
            return bStats.goals - aStats.goals;
        }
        return aStats.matchesPlayed - bStats.matchesPlayed;
      })
      .slice(0, limit);
  },

  /**
   * 3. Yellow Cards - Dedicated separate list
   */
  getYellowCardsList: (rows: StatRow[], limit = 50, leagueId?: string): StatRow[] => {
    return [...rows]
      .filter(row => getStatsForLeagueId(row.player, leagueId).yellowCards > 0)
      .sort((a, b) => {
        const aStats = getStatsForLeagueId(a.player, leagueId);
        const bStats = getStatsForLeagueId(b.player, leagueId);

        if (bStats.yellowCards !== aStats.yellowCards) {
          return bStats.yellowCards - aStats.yellowCards;
        }
        // Tie-breaker: mniejsza liczba czerwonych kartek (gracz "czystszy")
        if (aStats.redCards !== bStats.redCards) {
          return aStats.redCards - bStats.redCards;
        }
        return aStats.matchesPlayed - bStats.matchesPlayed;
      })
      .slice(0, limit);
  },

  /**
   * 4. Red Cards - Dedicated separate list
   */
  getRedCardsList: (rows: StatRow[], limit = 50, leagueId?: string): StatRow[] => {
    return [...rows]
      .filter(row => (getStatsForLeagueId(row.player, leagueId).redCards || 0) > 0)
      .sort((a, b) => (getStatsForLeagueId(b.player, leagueId).redCards || 0) - (getStatsForLeagueId(a.player, leagueId).redCards || 0))
      .slice(0, limit);
  },

  /**
   * 5. Injuries
   */
  getInjuryList: (rows: StatRow[], limit = 50): StatRow[] => {
    return [...rows]
      .filter(row => row.player.health.status === HealthStatus.INJURED)
      .sort((a, b) => {
        const daysA = a.player.health.injury?.daysRemaining || 999;
        const daysB = b.player.health.injury?.daysRemaining || 999;
        return daysA - daysB;
      })
      .slice(0, limit);
  }
};
