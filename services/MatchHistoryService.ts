import { MatchHistoryEntry } from '../types';

// To jest nasza lokalna "Baza Danych" w pamięci (Runtime Database)
let matchHistory: MatchHistoryEntry[] = [];

// Indeks pomocniczy: klucz "sezon::matchId" -> pozycja w matchHistory.
// Bez niego logMatch() musiał przy KAŻDYM zapisywanym meczu przeszukiwać liniowo
// całą (rosnącą z każdym sezonem) tablicę, żeby sprawdzić czy to duplikat.
let matchIndex: Map<string, number> = new Map();
const indexKey = (season: number, matchId: string) => `${season}::${matchId}`;

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
    const duplicateIndex = matchIndex.get(indexKey(entry.season, entry.matchId));
    if (duplicateIndex !== undefined) {
      matchHistory = matchHistory.map((existing, index) =>
        index === duplicateIndex ? entry : existing
      );
      console.log(`[MatchHistory] Zaktualizowano mecz: ${entry.homeTeamId} vs ${entry.awayTeamId}`);
      return;
    }
    matchHistory.push(entry);
    matchIndex.set(indexKey(entry.season, entry.matchId), matchHistory.length - 1);
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

  // PERF/ROZMIAR ZAPISU (dodane 2026-08-01): zwraca historię meczów przeznaczoną
  // do ZAPISU DO PLIKU — mecze starsze niż `detailSeasons` pełnych sezonów wstecz
  // dostają wersję "podglądową" (bez goals[]/cards[]), dokładnie tym samym
  // przekształceniem (toArchivedSummary) co archiveBeforeSeason powyżej — zero
  // nowej logiki, tylko reużycie istniejącej funkcji.
  //
  // KLUCZOWA RÓŻNICA względem archiveBeforeSeason: ta funkcja NIE mutuje żywej
  // tablicy `matchHistory` w pamięci (buduje nową tablicę przez .map(), nie
  // przypisuje do `matchHistory`). Rozgrywka w bieżącej sesji (widok "Historia
  // meczów", statystyki na żywo) nadal widzi pełne szczegóły niezależnie od wieku
  // meczu — przycięcie dotyczy WYŁĄCZNIE tego, co trafia do pliku zapisu. Dopiero
  // wczytanie takiego zapisu pokaże stare mecze bez szczegółów (bo to fizycznie
  // jedyne dane, jakie w nim wtedy będą).
  getAllForSave: (currentSeasonNumber: number, detailSeasons: number = 2): MatchHistoryEntry[] => {
    const firstDetailedSeason = currentSeasonNumber - (detailSeasons - 1);
    return matchHistory.map(entry => {
      if (entry.season >= firstDetailedSeason || entry.archived) return entry;
      return toArchivedSummary(entry);
    });
  },

  // Funkcja czyszcząca (np. przy nowej grze)
  clear: () => {
    matchHistory = [];
    matchIndex.clear();
  }
};
