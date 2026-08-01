
import { Club, Player, PlayerPosition, Lineup, HealthStatus, Coach, Fixture, MatchStatus } from '../types';
import { LineupService } from './LineupService';
import { PlayerMoraleService } from './PlayerMoraleService';

export const AiMatchPreparationService = {

  // PERF (dodane 2026-08-01): `fixtures`/`currentDate` są OPCJONALNE — to celowe,
  // żeby nie zmieniać zachowania pozostałych wywołań tej funkcji w innych miejscach
  // (BackgroundMatchProcessorPolishCup.ts, BackgroundPlayOffMatchPolishCup.ts, testy),
  // które przekazują mniejszy, już wcześniej przefiltrowany zestaw klubów (np. tylko
  // uczestników danej rundy pucharu) i nie wywołują się codziennie dla WSZYSTKICH
  // klubów w grze — tam to ograniczenie nie jest potrzebne i nie miałoby sensu.
  //
  // Jedyne miejsce, które faktycznie miało problem: BackgroundMatchProcessor.ts —
  // ta funkcja była tam wywoływana CODZIENNIE, bezwarunkowo, dla WSZYSTKICH ~650
  // klubów AI, bez żadnego stagger'u/cache'a (jedyne tak duże miejsce w całym
  // pipeline'ie AI, którego nie dotykaliśmy wcześniejszymi poprawkami). W środku,
  // determineBestStartingTactic → calculateTopLineStrength woła kosztowne
  // PlayerMoraleService.ensurePlayerState (pełny klon zawodnika + przeliczenie
  // całego mindsetu od zera) WEWNĄTRZ komparatora .sort() (2x na porównanie) i
  // jeszcze raz w reduce() zaraz potem dla tych samych zawodników — to był
  // prawdopodobnie główny, niewyjaśniony wcześniej wkład w setki tysięcy dziennych
  // wywołań ensurePlayerState/clamp widocznych w PerfProfilerService.
  //
  // FIX: skład drużyny ma realne znaczenie dopiero tuż przed meczem — nie ma
  // powodu przygotowywać go codziennie dla klubu, który gra za 2 tygodnie. Gdy
  // `fixtures`+`currentDate` są podane, funkcja przygotowuje skład TYLKO dla
  // klubów, które mają zaplanowany mecz DZIŚ LUB JUTRO. "Jutro" realizuje wymóg
  // "1 dzień przed meczem" — dzięki `{...currentLineups}` niżej, skład przygotowany
  // wczoraj (gdy dziś było dla tego klubu "jutro") zostaje zachowany i jest gotowy
  // na dzisiejszy mecz. "Dziś" to czysta siatka bezpieczeństwa (np. pierwszy dzień
  // gry, gdzie nie było "wczoraj") — symulacja meczu w tym samym pliku bezpośrednio
  // odczytuje newLineups[home.id]/[away.id] i CAŁKOWICIE POMIJA mecz, jeśli składu
  // brakuje (patrz `if (!hLineup || !aLineup) return;` w processLeagueEvent), więc
  // brak siatki bezpieczeństwa mógłby po cichu psuć symulację.
  prepareAllTeams: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentLineups: Record<string, Lineup>,
    userTeamId: string | null,
    coaches: Record<string, Coach> = {},
    fixtures?: Fixture[],
    currentDate?: Date
  ): Record<string, Lineup> => {

    const updatedLineups: Record<string, Lineup> = { ...currentLineups };

    // Budowane RAZ na całe wywołanie (nie per klub) — zbiór ID klubów mających
    // zaplanowany mecz dziś lub jutro. undefined (fixtures/currentDate nieprzekazane)
    // = brak filtrowania, dokładnie stare zachowanie (wszystkie kluby).
    let relevantClubIds: Set<string> | null = null;
    if (fixtures && currentDate) {
      relevantClubIds = new Set<string>();
      const todayStr = currentDate.toDateString();
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toDateString();
      fixtures.forEach(f => {
        if (f.status !== MatchStatus.SCHEDULED) return;
        const fDateStr = f.date.toDateString();
        if (fDateStr !== todayStr && fDateStr !== tomorrowStr) return;
        relevantClubIds!.add(f.homeTeamId);
        relevantClubIds!.add(f.awayTeamId);
      });
    }

    clubs.forEach(club => {
      // Nie zmieniaj składu gracza tutaj, to dzieje się w GameContext lub przed meczem
      if (club.id === userTeamId) return;
      if (relevantClubIds && !relevantClubIds.has(club.id)) return;

      const squad = playersMap[club.id];
   if (!squad || squad.length === 0) return;
      // --- STAGE 1 PRO: FRESHNESS POOL ---
      const AI_FRESH_THRESHOLD = 87;
      const readySquad = squad.filter(p => p.condition >= AI_FRESH_THRESHOLD);
      const analysisSquad = readySquad.length >= 14 ? readySquad : squad.filter(p => p.condition >= 75);

      // 1. Wybierz najlepszą taktykę startową na podstawie dostępnych zdrowych graczy
     const bestTacticId = AiMatchPreparationService.determineBestStartingTactic(club, analysisSquad);

      // 2. Pobierz aktualny skład lub stwórz nowy z inteligentnie dobraną taktyką
      const clubCoach = club.coachId ? (coaches[club.coachId] ?? null) : null;
      const seedParts = [
        club.id,
        bestTacticId,
        club.stats?.played ?? 0,
        club.stats?.points ?? 0,
        club.stats?.goalsFor ?? 0,
        club.stats?.goalsAgainst ?? 0
      ];
      let lineup = LineupService.autoPickLineup(club.id, squad, bestTacticId, clubCoach, {
        formAware: true,
        selectionSeed: seedParts.join('_')
      });
      if (!lineup) {
        // Brak składu lub utknięcie w domyślnym 4-4-2 — trener dobiera skład pod swoje taktyki
        lineup = LineupService.autoPickLineup(club.id, squad, bestTacticId, clubCoach, {
          formAware: true,
          selectionSeed: seedParts.join('_')
        });
      }

      // 3. Napraw skład (wywal zawieszonych/rannych i wypełnij luki inteligentnie)
      updatedLineups[club.id] = LineupService.repairLineup(lineup, squad);
    });

    return updatedLineups;
  },

/**
   * Analizuje kadrę i wybiera optymalną formację startową na podstawie reputacji klubu i siły linii.
   */
determineBestStartingTactic: (club: Club, players: Player[]): string => {
    const defStr = AiMatchPreparationService.calculateTopLineStrength(players, PlayerPosition.DEF, 5);
    const midStr = AiMatchPreparationService.calculateTopLineStrength(players, PlayerPosition.MID, 5);
    const fwdStr = AiMatchPreparationService.calculateTopLineStrength(players, PlayerPosition.FWD, 3);

    // Outsiderzy (Reputacja <= 4) - Preferują defensywę
    if (club.reputation <= 4) {
      if (defStr > fwdStr) return '5-4-1';
      return '4-5-1';
    }

    // Giganci (Reputacja >= 8) - Preferują dominację
    if (club.reputation >= 8) {
      if (fwdStr > defStr) return '4-3-3';
      return '4-2-3-1';
    }

    // Bardzo mocny środek pola
    if (midStr > defStr + 3 && midStr > fwdStr + 3) {
      return '3-5-2';
    }

    // Mocny atak, słabsza obrona
    if (fwdStr > defStr + 5) {
      return '4-3-3';
    }

    // Solidna obrona, szukanie kontroli
    if (defStr > fwdStr + 3) {
      return '4-1-4-1';
    }

    // Default dla zrównoważonych zespołów
    return '4-4-2';
  },

  calculateTopLineStrength: (players: Player[], pos: PlayerPosition, topN: number): number => {
    const linePlayers = players
      .filter(p => p.position === pos)
      .sort((a, b) =>
        PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(b)) -
        PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(a))
      )
      .slice(0, topN);

    if (linePlayers.length === 0) return 0;
    const total = linePlayers.reduce((sum, p) =>
      sum + PlayerMoraleService.getEffectiveOverall(PlayerMoraleService.ensurePlayerState(p)), 0);
    return total / linePlayers.length;
  }
};
