/**
 * WCQPlayoffService — UEFA WCQ 2026 Playoff (Baraże MŚ 2026)
 *
 * Obsługuje:
 *  1. Obliczenie 16 uczestników (12 wicemistrzów grup + 4 dodatkowe)
 *  2. Losowanie par (Pot1=top8 rep, Pot2=bottom8 rep) → 4 ścieżki A-D
 *  3. Symulację półfinałów (17 marca 2026)
 *  4. Symulację finałów ścieżek (20 marca 2026) + wyłonienie 4 kwalifikantów
 */

import { Coach, NationalTeam, Player, WCQPlayoffMatchResult, WCQPlayoffPath, WCQPlayoffState } from '../types';
import { MatchHistoryService } from './MatchHistoryService';
import { simulateSinglePlayoffMatch } from './NationalTeamSimulator';

// ─── TYPES ─────────────────────────────────────────────────────────────────────

interface GroupStanding {
  teamName: string;
  pts: number;
  gd: number;
  gf: number;
}

// ─── SEEDED RNG ────────────────────────────────────────────────────────────────

class Rng {
  private s: number;
  constructor(seed: number) { this.s = (seed >>> 0) || 1; }
  next(): number { this.s = (this.s * 1664525 + 1013904223) >>> 0; return this.s / 0x100000000; }
  int(min: number, max: number): number { return Math.floor(this.next() * (max - min + 1)) + min; }
  shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
}

function strHash(v: string): number {
  let h = 0;
  for (let i = 0; i < v.length; i++) h = ((h << 5) - h + v.charCodeAt(i)) | 0;
  return h >>> 0;
}

// ─── GROUP DATA ────────────────────────────────────────────────────────────────

/** Pełne składy grup A-L. */
const GROUP_TEAMS: Record<string, string[]> = {
  A: ['Niemcy', 'Słowacja', 'Irlandia Północna', 'Luksemburg'],
  B: ['Szwajcaria', 'Kosovo', 'Słowenia', 'Szwecja'],
  C: ['Szkocja', 'Dania', 'Grecja', 'Białoruś'],
  D: ['Francja', 'Ukraina', 'Islandia', 'Azerbejdżan'],
  E: ['Hiszpania', 'Turcja', 'Gruzja', 'Bułgaria'],
  F: ['Portugalia', 'Irlandia', 'Węgry', 'Armenia'],
  G: ['Polska', 'Holandia', 'Finlandia', 'Litwa', 'Malta'],
  H: ['Austria', 'Bośnia i Hercegowina', 'Rumunia', 'Cypr', 'San Marino'],
  I: ['Norwegia', 'Włochy', 'Izrael', 'Estonia', 'Mołdawia'],
  J: ['Belgia', 'Walia', 'Macedonia Północna', 'Kazachstan', 'Liechtenstein'],
  K: ['Anglia', 'Albania', 'Serbia', 'Łotwa', 'Andora'],
  L: ['Chorwacja', 'Czechy', 'Wyspy Owcze', 'Czarnogóra', 'Gibraltar'],
};

interface StaticMatch {
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
}

/**
 * Wyniki rozegrane przed startem gry (kolejki 1–4 dla grup G/H/I/J/K/L).
 * Grupy A-F startują od kolejki 1 wewnątrz gry — tu pusta lista.
 */
const PREGAME_BY_GROUP: Record<string, StaticMatch[]> = {
  G: [
    { home: 'Malta',     away: 'Finlandia',           homeGoals: 0, awayGoals: 1 },
    { home: 'Polska',    away: 'Litwa',                homeGoals: 1, awayGoals: 0 },
    { home: 'Polska',    away: 'Malta',                homeGoals: 2, awayGoals: 0 },
    { home: 'Litwa',     away: 'Finlandia',            homeGoals: 2, awayGoals: 2 },
    { home: 'Finlandia', away: 'Holandia',             homeGoals: 0, awayGoals: 2 },
    { home: 'Malta',     away: 'Litwa',                homeGoals: 0, awayGoals: 0 },
    { home: 'Finlandia', away: 'Polska',               homeGoals: 2, awayGoals: 1 },
    { home: 'Holandia',  away: 'Malta',                homeGoals: 8, awayGoals: 0 },
  ],
  H: [
    { home: 'Rumunia',              away: 'Cypr',                 homeGoals: 2,  awayGoals: 0 },
    { home: 'Austria',              away: 'San Marino',           homeGoals: 10, awayGoals: 0 },
    { home: 'Austria',              away: 'Rumunia',              homeGoals: 2,  awayGoals: 1 },
    { home: 'San Marino',           away: 'Cypr',                 homeGoals: 0,  awayGoals: 4 },
    { home: 'Cypr',                 away: 'Bośnia i Hercegowina', homeGoals: 2,  awayGoals: 2 },
    { home: 'Rumunia',              away: 'San Marino',           homeGoals: 7,  awayGoals: 1 },
    { home: 'Cypr',                 away: 'Austria',              homeGoals: 0,  awayGoals: 2 },
    { home: 'Bośnia i Hercegowina', away: 'Rumunia',              homeGoals: 3,  awayGoals: 1 },
  ],
  I: [
    { home: 'Izrael',   away: 'Estonia',  homeGoals: 2,  awayGoals: 1  },
    { home: 'Norwegia', away: 'Mołdawia', homeGoals: 11, awayGoals: 1  },
    { home: 'Norwegia', away: 'Izrael',   homeGoals: 5,  awayGoals: 0  },
    { home: 'Mołdawia', away: 'Estonia',  homeGoals: 2,  awayGoals: 3  },
    { home: 'Estonia',  away: 'Włochy',   homeGoals: 1,  awayGoals: 3  },
    { home: 'Izrael',   away: 'Mołdawia', homeGoals: 4,  awayGoals: 1  },
    { home: 'Estonia',  away: 'Norwegia', homeGoals: 0,  awayGoals: 1  },
    { home: 'Włochy',   away: 'Izrael',   homeGoals: 3,  awayGoals: 0  },
  ],
  J: [
    { home: 'Macedonia Północna', away: 'Kazachstan',         homeGoals: 1, awayGoals: 1 },
    { home: 'Belgia',             away: 'Liechtenstein',      homeGoals: 7, awayGoals: 0 },
    { home: 'Belgia',             away: 'Macedonia Północna', homeGoals: 0, awayGoals: 0 },
    { home: 'Liechtenstein',      away: 'Kazachstan',         homeGoals: 0, awayGoals: 2 },
    { home: 'Kazachstan',         away: 'Walia',              homeGoals: 0, awayGoals: 1 },
    { home: 'Macedonia Północna', away: 'Liechtenstein',      homeGoals: 5, awayGoals: 0 },
    { home: 'Kazachstan',         away: 'Belgia',             homeGoals: 1, awayGoals: 1 },
    { home: 'Walia',              away: 'Macedonia Północna', homeGoals: 7, awayGoals: 1 },
  ],
  K: [
    { home: 'Serbia',  away: 'Łotwa',   homeGoals: 2, awayGoals: 1 },
    { home: 'Anglia',  away: 'Andora',  homeGoals: 2, awayGoals: 0 },
    { home: 'Anglia',  away: 'Serbia',  homeGoals: 2, awayGoals: 0 },
    { home: 'Andora',  away: 'Łotwa',   homeGoals: 0, awayGoals: 1 },
    { home: 'Łotwa',   away: 'Albania', homeGoals: 1, awayGoals: 1 },
    { home: 'Serbia',  away: 'Andora',  homeGoals: 3, awayGoals: 0 },
    { home: 'Łotwa',   away: 'Anglia',  homeGoals: 0, awayGoals: 5 },
    { home: 'Albania', away: 'Serbia',  homeGoals: 0, awayGoals: 0 },
  ],
  L: [
    { home: 'Czarnogóra',  away: 'Wyspy Owcze', homeGoals: 1, awayGoals: 0 },
    { home: 'Chorwacja',   away: 'Gibraltar',   homeGoals: 3, awayGoals: 0 },
    { home: 'Chorwacja',   away: 'Czarnogóra',  homeGoals: 4, awayGoals: 0 },
    { home: 'Gibraltar',   away: 'Wyspy Owcze', homeGoals: 0, awayGoals: 1 },
    { home: 'Wyspy Owcze', away: 'Czechy',      homeGoals: 2, awayGoals: 1 },
    { home: 'Czarnogóra',  away: 'Gibraltar',   homeGoals: 3, awayGoals: 1 },
    { home: 'Wyspy Owcze', away: 'Chorwacja',   homeGoals: 0, awayGoals: 1 },
    { home: 'Czechy',      away: 'Czarnogóra',  homeGoals: 2, awayGoals: 0 },
  ],
};

// ─── HELPER: REPUTATION ────────────────────────────────────────────────────────

function getReputation(name: string, nationalTeams: NationalTeam[]): number {
  return nationalTeams.find(t => t.name === name)?.reputation ?? 8;
}

// ─── GROUP STANDINGS ─────────────────────────────────────────────────────────

function applyMatchToStandings(
  standings: Record<string, GroupStanding>,
  home: string,
  away: string,
  hg: number,
  ag: number
): void {
  if (!standings[home] || !standings[away]) return;
  standings[home].gf += hg;
  standings[home].gd += hg - ag;
  standings[away].gf += ag;
  standings[away].gd += ag - hg;
  if (hg > ag) { standings[home].pts += 3; }
  else if (hg === ag) { standings[home].pts += 1; standings[away].pts += 1; }
  else { standings[away].pts += 3; }
}

function sortStandings(standings: Record<string, GroupStanding>): GroupStanding[] {
  return Object.values(standings).sort(
    (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
  );
}

// ─── GROUP RESULT FROM ACTUAL DATA ───────────────────────────────────────────

/**
 * Oblicza miejsce w grupie na podstawie rzeczywistych wyników:
 *   1. Wyniki sprzed gry (hardcode w PREGAME_BY_GROUP — grupy G/H/I/J/K/L).
 *   2. Wyniki z gry pobrane z MatchHistoryService.
 */
function computeGroupFromActualData(
  groupLetter: string,
  nationalTeams: NationalTeam[],
  seasonNumber: number
): { winner: string; runnerUp: string; thirdPlace: string } {
  const teams = GROUP_TEAMS[groupLetter];
  if (!teams) return { winner: '?', runnerUp: '?', thirdPlace: '?' };

  const standings: Record<string, GroupStanding> = {};
  teams.forEach(t => { standings[t] = { teamName: t, pts: 0, gd: 0, gf: 0 }; });

  // 1. Wyniki sprzed gry (kolejki 1–4 dla G/H-L; puste dla A-F)
  for (const m of PREGAME_BY_GROUP[groupLetter] ?? []) {
    applyMatchToStandings(standings, m.home, m.away, m.homeGoals, m.awayGoals);
  }

  // 2. Wyniki z gry — z MatchHistoryService
  const teamSet = new Set(teams);
  const teamNameById = new Map(
    nationalTeams.filter(t => teamSet.has(t.name)).map(t => [t.id, t.name])
  );
  const inGameMatches = MatchHistoryService.getAll().filter(m =>
    m.season === seasonNumber &&
    m.competition.includes('Kwalifikacje') &&
    teamNameById.has(m.homeTeamId) &&
    teamNameById.has(m.awayTeamId)
  );
  for (const m of inGameMatches) {
    const home = teamNameById.get(m.homeTeamId)!;
    const away = teamNameById.get(m.awayTeamId)!;
    applyMatchToStandings(standings, home, away, m.homeScore, m.awayScore);
  }

  const sorted = sortStandings(standings);
  return {
    winner: sorted[0]?.teamName ?? '?',
    runnerUp: sorted[1]?.teamName ?? '?',
    thirdPlace: sorted[2]?.teamName ?? '?',
  };
}

// ─── BUILD 16-TEAM PLAYOFF FIELD ──────────────────────────────────────────────

function buildPlayoffField(
  nationalTeams: NationalTeam[],
  seasonNumber: number
): { all16: string[]; groupWinners: string[] } {
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const runnerUps: string[] = [];
  const groupWinners: string[] = [];
  const thirdPlaces: string[] = [];

  for (const letter of groupLetters) {
    const result = computeGroupFromActualData(letter, nationalTeams, seasonNumber);
    groupWinners.push(result.winner);
    runnerUps.push(result.runnerUp);
    thirdPlaces.push(result.thirdPlace);
  }

  // 4 dodatkowe drużyny: najlepsze 4 z trzecich miejsc (najwyższy overall/reputacja)
  const extras = thirdPlaces
    .filter(name => name !== '?')
    .sort((a, b) => getReputation(b, nationalTeams) - getReputation(a, nationalTeams))
    .slice(0, 4);

  return { all16: [...runnerUps, ...extras], groupWinners };
}

// ─── PLAYOFF MATCH SIMULATION ─────────────────────────────────────────────────

function runPlayoffMatch(
  homeTeam: string,
  awayTeam: string,
  nationalTeams: NationalTeam[],
  players: Record<string, Player[]>,
  coaches: Record<string, Coach>,
  seed: number,
  season: number = 0,
  matchDate: Date = new Date(2026, 2, 17),
  usedRefereeIds: Set<string> = new Set(),
): WCQPlayoffMatchResult {
  const label = 'Baraże MŚ 2026';
  const res = simulateSinglePlayoffMatch(homeTeam, awayTeam, label, matchDate, seed, nationalTeams, players, coaches, season, usedRefereeIds);
  if (res.matchHistoryEntry) {
    MatchHistoryService.logMatch(res.matchHistoryEntry);
  }
  return {
    homeTeam,
    awayTeam,
    homeGoals: res.homeGoalsAET ?? res.homeGoals,
    awayGoals: res.awayGoalsAET ?? res.awayGoals,
    penaltyWinner: res.penaltyWinner,
    homePenaltyGoals: res.homePenaltyGoals,
    awayPenaltyGoals: res.awayPenaltyGoals,
    wentToExtraTime: res.homeGoals === res.awayGoals,
    refereeName: res.refereeName,
    homeTeamId: res.homeTeamId,
    awayTeamId: res.awayTeamId,
    goals: res.goals,
    cards: res.cards,
    venue: res.venue,
    attendance: res.attendance,
    weather: res.weather,
  };
}

function resolveSFWinner(result: WCQPlayoffMatchResult): { winner: string; penaltyWinner?: string } {
  if (result.penaltyWinner) return { winner: result.penaltyWinner, penaltyWinner: result.penaltyWinner };
  if (result.homeGoals > result.awayGoals) return { winner: result.homeTeam };
  if (result.homeGoals < result.awayGoals) return { winner: result.awayTeam };
  // Shouldn't reach here — simulateSinglePlayoffMatch always produces a winner
  return { winner: result.homeTeam };
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export const WCQPlayoffService = {

  /**
   * Zwraca podsumowanie fazy grupowej: zwycięzcy, wicemistrzowie i 4 dodatkowe
   * drużyny z 3. miejsc zakwalifikowane do baraży.
   * Używane do generowania emaila-podsumowania po ostatniej kolejce (17 listopada).
   */
  getWCQGroupSummary(
    nationalTeams: NationalTeam[],
    seasonNumber: number
  ): {
    groups: Array<{ group: string; winner: string; runnerUp: string; thirdPlace: string }>;
    directQualifiers: string[];
    runnerUps: string[];
    extras: string[];
  } {
    const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const groups = groupLetters.map(letter => {
      const result = computeGroupFromActualData(letter, nationalTeams, seasonNumber);
      return { group: letter, winner: result.winner, runnerUp: result.runnerUp, thirdPlace: result.thirdPlace };
    });
    const directQualifiers = groups.map(g => g.winner);
    const runnerUps = groups.map(g => g.runnerUp);
    const thirdPlaces = groups.map(g => g.thirdPlace).filter(name => name !== '?');
    const extras = [...thirdPlaces]
      .sort((a, b) => getReputation(b, nationalTeams) - getReputation(a, nationalTeams))
      .slice(0, 4);
    return { groups, directQualifiers, runnerUps, extras };
  },

  /**
   * Przeprowadza losowanie baraży — zwraca gotowy WCQPlayoffState z 4 ścieżkami.
   *
   * @param nationalTeams  - lista wszystkich reprezentacji z GameContext
   * @param seasonYear     - rok kalendarzowy (np. 2025) — do wyświetlania
   * @param seasonNumber   - numer sezonu gry (do filtrowania historii meczów)
   * @param seed           - ziarno RNG (zwykle dateToProcess.getTime())
   */
  conductDraw(
    nationalTeams: NationalTeam[],
    seasonYear: number,
    seasonNumber: number,
    seed: number
  ): WCQPlayoffState {
    const { all16 } = buildPlayoffField(nationalTeams, seasonNumber);

    // Sortuj 16 drużyn wg reputacji → Pot1 (top 8) i Pot2 (bottom 8)
    const sorted16 = [...all16].sort(
      (a, b) => getReputation(b, nationalTeams) - getReputation(a, nationalTeams)
    );
    const pot1 = sorted16.slice(0, 8);
    const pot2 = sorted16.slice(8);

    // Tasowanie deterministyczne (losowanie RNG)
    const rng = new Rng(seed ^ strHash('PLAYOFF_DRAW'));
    const shuffledPot1 = rng.shuffle(pot1);
    const shuffledPot2 = rng.shuffle(pot2);

    // Przypisanie do 4 ścieżek:
    // Każda ścieżka = SF1 (Pot1[2i] vs Pot2[2i]) + SF2 (Pot1[2i+1] vs Pot2[2i+1])
    const pathLabels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
    const paths: WCQPlayoffPath[] = pathLabels.map((label, idx) => ({
      pathLabel: label,
      sf1Home: shuffledPot1[idx * 2],
      sf1Away: shuffledPot2[idx * 2],
      sf2Home: shuffledPot1[idx * 2 + 1],
      sf2Away: shuffledPot2[idx * 2 + 1],
    }));

    return {
      seasonYear,
      drawCompleted: true,
      sfCompleted: false,
      finalCompleted: false,
      paths,
    };
  },

  /**
   * Symuluje półfinały wszystkich 4 ścieżek.
   * Uzupełnia sf1Result, sf2Result, sf1Winner, sf2Winner, finalHome, finalAway.
   */
  simulateSF(
    state: WCQPlayoffState,
    nationalTeams: NationalTeam[],
    players: Record<string, Player[]>,
    coaches: Record<string, Coach>,
    seed: number
  ): WCQPlayoffState {
    const sfDate = new Date(2026, 2, 17);
    const usedRefereeIds = new Set<string>();
    const newPaths = state.paths.map(path => {
      const sf1Seed = seed ^ strHash(`SF1_${path.pathLabel}`);
      const sf2Seed = seed ^ strHash(`SF2_${path.pathLabel}`);

      const sf1Result = runPlayoffMatch(path.sf1Home, path.sf1Away, nationalTeams, players, coaches, sf1Seed, state.seasonYear, sfDate, usedRefereeIds);
      const sf2Result = runPlayoffMatch(path.sf2Home, path.sf2Away, nationalTeams, players, coaches, sf2Seed, state.seasonYear, sfDate, usedRefereeIds);

      const sf1Resolved = resolveSFWinner(sf1Result);
      const sf2Resolved = resolveSFWinner(sf2Result);
      const sf1Winner = sf1Resolved.winner;
      const sf2Winner = sf2Resolved.winner;

      // Reguła rewanżu: zwycięzca grał u siebie → gra na wyjeździe w finale i vice versa
      const sf1WonHome = sf1Winner === path.sf1Home;
      const sf2WonHome = sf2Winner === path.sf2Home;

      let finalHome: string;
      let finalAway: string;

      if (sf1WonHome && !sf2WonHome) {
        // SF1 wygrał u siebie → gra na wyjeździe; SF2 wygrał na wyjeździe → gra u siebie
        finalHome = sf2Winner;
        finalAway = sf1Winner;
      } else if (!sf1WonHome && sf2WonHome) {
        finalHome = sf1Winner;
        finalAway = sf2Winner;
      } else {
        // Obaj wygrali u siebie LUB obaj na wyjeździe → losowanie
        const coinRng = new Rng(seed ^ strHash(`COIN_${path.pathLabel}`));
        finalHome = coinRng.next() < 0.5 ? sf1Winner : sf2Winner;
        finalAway = finalHome === sf1Winner ? sf2Winner : sf1Winner;
      }

      return { ...path, sf1Result, sf2Result, sf1Winner, sf2Winner, finalHome, finalAway };
    });

    return { ...state, paths: newPaths, sfCompleted: true };
  },

  /**
   * Symuluje finały wszystkich 4 ścieżek.
   * Uzupełnia finalResult i qualifier.
   */
  simulateFinal(
    state: WCQPlayoffState,
    nationalTeams: NationalTeam[],
    players: Record<string, Player[]>,
    coaches: Record<string, Coach>,
    seed: number
  ): WCQPlayoffState {
    const usedRefereeIds = new Set<string>();
    const newPaths = state.paths.map(path => {
      if (!path.finalHome || !path.finalAway) return path;

      const finalSeed = seed ^ strHash(`FINAL_${path.pathLabel}`);
      const finalDate = new Date(2026, 2, 20);
      const finalResult = runPlayoffMatch(path.finalHome, path.finalAway, nationalTeams, players, coaches, finalSeed, state.seasonYear, finalDate, usedRefereeIds);
      const finalResolved = resolveSFWinner(finalResult);
      const qualifier = finalResolved.winner;

      return { ...path, finalResult, qualifier };
    });

    return { ...state, paths: newPaths, finalCompleted: true };
  },
};
