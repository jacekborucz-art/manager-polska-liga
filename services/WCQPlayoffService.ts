/**
 * WCQPlayoffService — UEFA WCQ 2026 Playoff (Baraże MŚ 2026)
 *
 * Obsługuje:
 *  1. Obliczenie 16 uczestników (12 wicemistrzów grup + 4 dodatkowe)
 *  2. Losowanie par (Pot1=top8 rep, Pot2=bottom8 rep) → 4 ścieżki A-D
 *  3. Symulację półfinałów (17 marca 2026)
 *  4. Symulację finałów ścieżek (20 marca 2026) + wyłonienie 4 kwalifikantów
 */

import { NationalTeam, WCQPlayoffMatchResult, WCQPlayoffPath, WCQPlayoffState } from '../types';
import { MatchHistoryService } from './MatchHistoryService';

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

/**
 * Pełne składy grup A-F, H-L (bez Grupy G — ta pochodzi z historii meczów).
 * Kolejność: [lider, drużyna 2, drużyna 3, ...]
 */
const GROUP_TEAMS: Record<string, string[]> = {
  A: ['Niemcy', 'Słowacja', 'Irlandia Północna', 'Luksemburg'],
  B: ['Szwajcaria', 'Kosovo', 'Słowenia', 'Szwecja'],
  C: ['Szkocja', 'Dania', 'Grecja', 'Białoruś'],
  D: ['Francja', 'Ukraina', 'Islandia', 'Azerbejdżan'],
  E: ['Hiszpania', 'Turcja', 'Gruzja', 'Bułgaria'],
  F: ['Portugalia', 'Irlandia', 'Węgry', 'Armenia'],
  H: ['Austria', 'Bośnia i Hercegowina', 'Rumunia', 'Cypr', 'San Marino'],
  I: ['Norwegia', 'Włochy', 'Izrael', 'Estonia', 'Mołdawia'],
  J: ['Belgia', 'Walia', 'Macedonia Północna', 'Kazachstan', 'Liechtenstein'],
  K: ['Anglia', 'Albania', 'Serbia', 'Łotwa', 'Andora'],
  L: ['Chorwacja', 'Czechy', 'Wyspy Owcze', 'Czarnogóra', 'Gibraltar'],
};

/**
 * Mecze Grupy G rozegrane przed startem gry (kolejki 1–3 = 3 okna FIFA = 8 meczów).
 * Pary [gospodarz, gość] wg fikcyjnego kalendarza kwalifikacji.
 */
const GROUP_G_PREGAME_MATCHES: Array<[string, string]> = [
  ['Polska',    'Litwa'],
  ['Polska',    'Malta'],
  ['Finlandia', 'Polska'],
  ['Finlandia', 'Holandia'],
  ['Holandia',  'Malta'],
  ['Litwa',     'Finlandia'],
  ['Malta',     'Finlandia'],
  ['Malta',     'Litwa'],
];

/** Grupy G — drużyny rozgrywające mecze (w tej kolejności). */
const GROUP_G_TEAMS = ['Polska', 'Holandia', 'Finlandia', 'Litwa', 'Malta'];

// ─── HELPER: REPUTATION ────────────────────────────────────────────────────────

function getReputation(name: string, nationalTeams: NationalTeam[]): number {
  return nationalTeams.find(t => t.name === name)?.reputation ?? 8;
}

// ─── MATCH SIMULATION ─────────────────────────────────────────────────────────

/**
 * Symuluje pojedynczy mecz na podstawie reputacji drużyn + seeded RNG.
 * Zwraca wynik bramkowy.
 */
function simMatch(homeRep: number, awayRep: number, rng: Rng): { h: number; a: number } {
  const diff = (homeRep - awayRep) / 20;
  const homeAdvantage = 0.08;
  const hwRaw = 0.42 + diff * 0.28 + homeAdvantage;
  const awRaw = 0.42 - diff * 0.28 - homeAdvantage;
  const hw = Math.max(0.1, Math.min(0.72, hwRaw));
  const aw = Math.max(0.1, Math.min(0.72, awRaw));
  const dr = Math.max(0.15, 1 - hw - aw);
  const total = hw + dr + aw;
  const r = rng.next() * total;

  if (r < hw) {
    const hg = 1 + (rng.next() < 0.52 ? 1 : 0) + (rng.next() < 0.18 ? 1 : 0);
    return { h: hg, a: rng.next() < 0.27 ? 1 : 0 };
  } else if (r < hw + dr) {
    const g = rng.next() < 0.38 ? 0 : rng.next() < 0.52 ? 1 : 2;
    return { h: g, a: g };
  } else {
    const ag = 1 + (rng.next() < 0.52 ? 1 : 0) + (rng.next() < 0.18 ? 1 : 0);
    return { h: rng.next() < 0.27 ? 1 : 0, a: ag };
  }
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

// ─── SIMULATED GROUP RESULT (Groups A-F, H-L) ─────────────────────────────────

function computeGroupResult(
  groupLetter: string,
  nationalTeams: NationalTeam[],
  seed: number
): { winner: string; runnerUp: string } {
  const teams = GROUP_TEAMS[groupLetter];
  if (!teams) return { winner: '?', runnerUp: '?' };

  const rng = new Rng(seed ^ strHash(groupLetter));
  const standings: Record<string, GroupStanding> = {};
  teams.forEach(t => { standings[t] = { teamName: t, pts: 0, gd: 0, gf: 0 }; });

  // Pełna podwójna eliminacja (każda para gra u siebie i u rywala)
  for (let i = 0; i < teams.length; i++) {
    for (let j = 0; j < teams.length; j++) {
      if (i === j) continue;
      const homeRep = getReputation(teams[i], nationalTeams);
      const awayRep = getReputation(teams[j], nationalTeams);
      const { h, a } = simMatch(homeRep, awayRep, rng);
      applyMatchToStandings(standings, teams[i], teams[j], h, a);
    }
  }

  const sorted = sortStandings(standings);

  // Grupa E: Hispania wygrywa i idzie na MŚ bezpośrednio (Mistrz Świata)
  if (groupLetter === 'E') {
    const nonHispania = sorted.filter(s => s.teamName !== 'Hiszpania');
    return { winner: 'Hiszpania', runnerUp: nonHispania[0].teamName };
  }

  return { winner: sorted[0].teamName, runnerUp: sorted[1].teamName };
}

// ─── GROUP G RESULT (from actual match history + pre-game) ────────────────────

function computeGroupGResult(
  nationalTeams: NationalTeam[],
  seasonNumber: number,
  seed: number
): { winner: string; runnerUp: string } {
  const teamIdToName = new Map(
    nationalTeams.filter(t => GROUP_G_TEAMS.includes(t.name)).map(t => [t.id, t.name])
  );

  const standings: Record<string, GroupStanding> = {};
  GROUP_G_TEAMS.forEach(t => { standings[t] = { teamName: t, pts: 0, gd: 0, gf: 0 }; });

  // 1. Mecze przed grą (kolejki 1–3) — deterministycznie symulowane
  const preRng = new Rng(seed ^ strHash('GRP_G_PRE'));
  for (const [home, away] of GROUP_G_PREGAME_MATCHES) {
    const { h, a } = simMatch(getReputation(home, nationalTeams), getReputation(away, nationalTeams), preRng);
    applyMatchToStandings(standings, home, away, h, a);
  }

  // 2. Mecze z gry (kolejki 4–9) — z MatchHistoryService
  const competition = 'Kwalifikacje MŚ 2026 – Gr. G';
  const inGameMatches = MatchHistoryService.getAll().filter(
    m => m.competition === competition && m.season === seasonNumber
  );
  for (const m of inGameMatches) {
    const homeName = teamIdToName.get(m.homeTeamId);
    const awayName = teamIdToName.get(m.awayTeamId);
    if (homeName && awayName) {
      applyMatchToStandings(standings, homeName, awayName, m.homeScore, m.awayScore);
    }
  }

  const sorted = sortStandings(standings);
  return { winner: sorted[0].teamName, runnerUp: sorted[1].teamName };
}

// ─── BUILD 16-TEAM PLAYOFF FIELD ──────────────────────────────────────────────

function buildPlayoffField(
  nationalTeams: NationalTeam[],
  seasonNumber: number,
  seed: number
): { all16: string[]; groupWinners: string[] } {
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const runnerUps: string[] = [];
  const groupWinners: string[] = [];

  for (const letter of groupLetters) {
    const result = letter === 'G'
      ? computeGroupGResult(nationalTeams, seasonNumber, seed)
      : computeGroupResult(letter, nationalTeams, seed);
    groupWinners.push(result.winner);
    runnerUps.push(result.runnerUp);
  }

  // 4 dodatkowe drużyny: najwyższa reputacja z puli europejskich
  // nieuwzględnionych w wicemistrzach ani mistrzach grup
  const excluded = new Set([...runnerUps, ...groupWinners, 'Hiszpania']);
  const extras = nationalTeams
    .filter(t => t.continent === 'Europe' && !excluded.has(t.name))
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, 4)
    .map(t => t.name);

  return { all16: [...runnerUps, ...extras], groupWinners };
}

// ─── PLAYOFF MATCH SIMULATION ─────────────────────────────────────────────────

function simulatePlayoffMatch(
  homeTeam: string,
  awayTeam: string,
  nationalTeams: NationalTeam[],
  seed: number
): WCQPlayoffMatchResult {
  const rng = new Rng(seed ^ strHash(`${homeTeam}|${awayTeam}`));
  const { h, a } = simMatch(getReputation(homeTeam, nationalTeams), getReputation(awayTeam, nationalTeams), rng);
  return { homeTeam, awayTeam, homeGoals: h, awayGoals: a };
}

function resolveSFWinner(result: WCQPlayoffMatchResult, tieBreakSeed: number): string {
  if (result.homeGoals > result.awayGoals) return result.homeTeam;
  if (result.homeGoals < result.awayGoals) return result.awayTeam;
  // Remis → losowanie (dogrywka + karne w grze)
  return new Rng(tieBreakSeed).next() < 0.5 ? result.homeTeam : result.awayTeam;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export const WCQPlayoffService = {

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
    const { all16 } = buildPlayoffField(nationalTeams, seasonNumber, seed);

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
    seed: number
  ): WCQPlayoffState {
    const newPaths = state.paths.map(path => {
      const sf1Seed = seed ^ strHash(`SF1_${path.pathLabel}`);
      const sf2Seed = seed ^ strHash(`SF2_${path.pathLabel}`);

      const sf1Result = simulatePlayoffMatch(path.sf1Home, path.sf1Away, nationalTeams, sf1Seed);
      const sf2Result = simulatePlayoffMatch(path.sf2Home, path.sf2Away, nationalTeams, sf2Seed);

      const sf1Winner = resolveSFWinner(sf1Result, sf1Seed ^ 0xDEAD);
      const sf2Winner = resolveSFWinner(sf2Result, sf2Seed ^ 0xDEAD);

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
    seed: number
  ): WCQPlayoffState {
    const newPaths = state.paths.map(path => {
      if (!path.finalHome || !path.finalAway) return path;

      const finalSeed = seed ^ strHash(`FINAL_${path.pathLabel}`);
      const finalResult = simulatePlayoffMatch(path.finalHome, path.finalAway, nationalTeams, finalSeed);
      const qualifier = resolveSFWinner(finalResult, finalSeed ^ 0xBEEF);

      return { ...path, finalResult, qualifier };
    });

    return { ...state, paths: newPaths, finalCompleted: true };
  },
};
