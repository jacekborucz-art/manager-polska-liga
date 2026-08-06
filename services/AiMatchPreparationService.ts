
import { Club, Player, PlayerPosition, Lineup, HealthStatus, Coach, Fixture, MatchStatus } from '../types';
import { CoachTacticalIntent, LineupService } from './LineupService';
import { PlayerMoraleService } from './PlayerMoraleService';

export const AiMatchPreparationService = {

  getClubCoach: (club: Club, coaches: Record<string, Coach>): Coach | null =>
    club.coachId ? (coaches[club.coachId] ?? null) : null,

  determineMatchIntent: (
    club: Club,
    opponent: Club | null,
    coach: Coach | null,
    isHome: boolean,
    aggregateGoalDifference?: number
  ): CoachTacticalIntent => {
    // Wynik dwumeczu ma pierwszeństwo. Trener przegrywający musi szukać bramki,
    // a wyraźnie prowadzący może zabezpieczyć przewagę.
    if (aggregateGoalDifference !== undefined) {
      if (aggregateGoalDifference <= -1) return 'OFFENSIVE';
      if (aggregateGoalDifference >= 2) return 'DEFENSIVE';
    }

    if (!opponent) return 'NEUTRAL';

    const coachRead = coach
      ? ((coach.attributes.decisionMaking ?? 50) + (coach.attributes.experience ?? 50)) / 2
      : 50;
    // Dobry trener reaguje już na mniejszą przewagę profilu drużyny. Słabszy nie
    // wybiera przeciwnej, absurdalnej strategii — po prostu częściej zostaje przy
    // swoim bezpiecznym planie neutralnym.
    const adaptationThreshold = coachRead >= 80 ? 2 : coachRead >= 60 ? 3 : coachRead >= 40 ? 4 : 5;
    const strengthDifference = (club.reputation ?? 5) - (opponent.reputation ?? 5) + (isHome ? 0.75 : 0);

    if (strengthDifference >= adaptationThreshold) return 'OFFENSIVE';
    if (strengthDifference <= -adaptationThreshold) return 'DEFENSIVE';
    return 'NEUTRAL';
  },

  prepareTeamForMatch: (
    club: Club,
    opponent: Club | null,
    squad: Player[],
    coach: Coach | null,
    fixture: Fixture,
    isHome: boolean,
    selectionSeed: string,
    aggregateGoalDifference?: number,
    requireNaturalPositionFit: boolean = false
  ): Lineup => {
    const competitionId = fixture.leagueId as string;
    const matchEligibleSquad = LineupService.getMatchEligiblePlayers(squad, { competitionId });
    const readySquad = squad.filter(player => player.condition >= 87);
    const analysisSquad = readySquad.length >= 14
      ? readySquad
      : squad.filter(player => player.condition >= 75);

    /**
     * European background matches use a strict coach workflow. Formation
     * feasibility is evaluated only against players who can actually take part
     * in this competition on this date: suspended, seriously injured and
     * critically unfit players have already been removed. Consequently a
     * coach's preferred formation can be selected only when every natural
     * positional slot (GK/DEF/MID/FWD) can be filled. If it cannot, the tactic
     * resolver walks through the coach's other preferred plans and then through
     * squad-compatible alternatives. The non-strict branch is retained for
     * existing domestic callers until their match-preparation pipelines are
     * migrated separately.
     */
    const tacticalSquad = requireNaturalPositionFit
      ? matchEligibleSquad
      : (analysisSquad.length >= 11 ? analysisSquad : squad);
    const baselineTacticId = AiMatchPreparationService.determineBestStartingTactic(club, tacticalSquad);
    const intent = AiMatchPreparationService.determineMatchIntent(
      club,
      opponent,
      coach,
      isHome,
      aggregateGoalDifference
    );
    const tacticId = LineupService.resolveCoachTacticId(coach, tacticalSquad, intent, baselineTacticId);
    const lineup = LineupService.autoPickLineup(club.id, squad, tacticId, coach, {
      competitionId,
      formAware: true,
      selectionSeed,
      respectRequestedTactic: true,
    });

    // autoPickLineup fills natural roles across all fitness pools. Running the
    // legacy repair cascade afterwards could replace a tired natural player with
    // a fresh player from the wrong line, defeating the strict formation check.
    return requireNaturalPositionFit
      ? lineup
      : LineupService.repairLineup(lineup, squad, { competitionId });
  },

  // PERFORMANCE CONTRACT: fixtures/currentDate are optional because callers
  // which already own a small, explicitly filtered club list (for example a cup
  // or playoff processor) may pass only those participants. A caller must never
  // omit fixtures/currentDate while also passing the complete world. The Polish
  // Cup processor previously violated that contract on 12 July and prepared all
  // ~650 clubs for a two-team Super Cup; it now filters participants first.
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
    const relevantFixturesByClubId = new Map<string, Fixture>();
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
        const existingHomeFixture = relevantFixturesByClubId.get(f.homeTeamId);
        const existingAwayFixture = relevantFixturesByClubId.get(f.awayTeamId);
        if (!existingHomeFixture || f.date.getTime() < existingHomeFixture.date.getTime()) {
          relevantFixturesByClubId.set(f.homeTeamId, f);
        }
        if (!existingAwayFixture || f.date.getTime() < existingAwayFixture.date.getTime()) {
          relevantFixturesByClubId.set(f.awayTeamId, f);
        }
      });
    }

    clubs.forEach(club => {
      // Nie zmieniaj składu gracza tutaj, to dzieje się w GameContext lub przed meczem
      if (club.id === userTeamId) return;
      if (relevantClubIds && !relevantClubIds.has(club.id)) return;

      const squad = playersMap[club.id];
   if (!squad || squad.length === 0) return;
      const clubCoach = club.coachId ? (coaches[club.coachId] ?? null) : null;
      const fixture = relevantFixturesByClubId.get(club.id);
      if (fixture) {
        const opponentId = fixture.homeTeamId === club.id ? fixture.awayTeamId : fixture.homeTeamId;
        const opponent = clubs.find(candidate => candidate.id === opponentId) ?? null;
        updatedLineups[club.id] = AiMatchPreparationService.prepareTeamForMatch(
          club,
          opponent,
          squad,
          clubCoach,
          fixture,
          fixture.homeTeamId === club.id,
          `${fixture.id}_${club.id}_ai_match_preparation`
        );
        return;
      }

      // Zachowanie dla wywołań bez terminarza: trener nadal wybiera ulubioną
      // formację, ale bez kontekstu konkretnego przeciwnika.
      const bestTacticId = AiMatchPreparationService.determineBestStartingTactic(club, squad);
      const tacticId = LineupService.resolveCoachTacticId(clubCoach, squad, 'NEUTRAL', bestTacticId);
      const lineup = LineupService.autoPickLineup(club.id, squad, tacticId, clubCoach, {
        formAware: true,
        selectionSeed: `${club.id}_${tacticId}_ai_match_preparation`,
        respectRequestedTactic: true,
      });
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
