import { MatchHistoryEntry } from '../types';

// To jest nasza lokalna "Baza Danych" w pamięci (Runtime Database)
let matchHistory: MatchHistoryEntry[] = [];

const toArchivedSummary = (entry: MatchHistoryEntry): MatchHistoryEntry => ({
  matchId: entry.matchId,
  date: entry.date,
  season: entry.season,
  archived: true,
  competition: entry.competition,
  homeTeamId: entry.homeTeamId,
  awayTeamId: entry.awayTeamId,
  homeScore: entry.homeScore,
  awayScore: entry.awayScore,
  homePenaltyScore: entry.homePenaltyScore,
  awayPenaltyScore: entry.awayPenaltyScore,
  isExtraTime: entry.isExtraTime,
  attendance: entry.attendance,
  venue: entry.venue,
  goals: [],
  cards: [],
});

export const MatchHistoryService = {
  // Funkcja dodająca nowy wpis
  logMatch: (entry: MatchHistoryEntry) => {
    const duplicateIndex = matchHistory.findIndex(
      e => e.matchId === entry.matchId && e.season === entry.season
    );
    if (duplicateIndex !== -1) {
      matchHistory = matchHistory.map((existing, index) =>
        index === duplicateIndex ? entry : existing
      );
      console.log(`[MatchHistory] Zaktualizowano mecz: ${entry.homeTeamId} vs ${entry.awayTeamId}`);
      return;
    }
    matchHistory.push(entry);
    console.log(`[MatchHistory] Zapisano mecz: ${entry.homeTeamId} vs ${entry.awayTeamId}`);
  },

  updateMatch: (matchId: string, updates: Partial<MatchHistoryEntry>) => {
    matchHistory = matchHistory.map(entry =>
      entry.matchId === matchId ? { ...entry, ...updates } : entry
    );
  },

  // Funkcja pobierająca całą historię
  getAll: () => [...matchHistory],

  // Funkcja pobierająca mecze konkretnej drużyny
  getTeamHistory: (teamId: string) => {
    return matchHistory.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);
  },

  archiveBeforeSeason: (firstDetailedSeason: number) => {
    let archivedCount = 0;
    matchHistory = matchHistory.map(entry => {
      if (entry.season >= firstDetailedSeason || entry.archived) return entry;
      archivedCount += 1;
      return toArchivedSummary(entry);
    });
    return archivedCount;
  },

  getForSave: (firstDetailedSeason: number) => {
    return matchHistory.map(entry =>
      entry.season >= firstDetailedSeason || entry.archived ? entry : toArchivedSummary(entry)
    );
  },

  // Funkcja czyszcząca (np. przy nowej grze)
  clear: () => {
    matchHistory = [];
  }
};
