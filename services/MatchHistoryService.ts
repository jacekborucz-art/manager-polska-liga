import { MatchHistoryEntry } from '../types';

// To jest nasza lokalna "Baza Danych" w pamięci (Runtime Database)
let matchHistory: MatchHistoryEntry[] = [];

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

  // Funkcja czyszcząca (np. przy nowej grze)
  clear: () => {
    matchHistory = [];
  }
};
