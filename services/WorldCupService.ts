/**
 * WorldCupService — logika Mistrzostw Świata
 *
 * Odpowiada za:
 *  1. Sprawdzenie czy dany rok jest rokiem MŚ
 *  2. Zebranie 48 drużyn (16 UEFA + reszta świata)
 *  3. Losowanie 12 grup po 4 drużyny
 *  4. Symulację fazy grupowej (90 min, brak ET)
 *  5. Symulację fazy pucharowej (90 min + ET + karne)
 *  6. Obliczenie efektów na zawodników po turnieju
 */

import {
  NationalTeam,
  Player,
  Coach,
  WCConfederation,
  WCGroup,
  WCGroupStanding,
  WCKnockoutMatch,
  WCPlayerEffect,
  WCState,
  WCTeam,
  WCQPlayoffState,
  WorldCupQualifiersState,
  HealthStatus,
  InjurySeverity,
  TrainingIntensity,
} from '../types';
import { WCQPlayoffService } from './WCQPlayoffService';
import { simulateWCGroupMatch, simulateSinglePlayoffMatch } from './NationalTeamSimulator';
import { MatchHistoryService } from './MatchHistoryService';
import { NATIONAL_TEAMS_AFRICA } from '../resources/static_db/NationalTeams/NationalTeamsAfrica';
import { NATIONAL_TEAMS_AFC } from '../resources/static_db/NationalTeams/NationalTeamsAFC';
import { NATIONAL_TEAMS_CONMEBOL } from '../resources/static_db/NationalTeams/NationalTeamsCONMEBOL';
import { NATIONAL_TEAMS_CONCACAF } from '../resources/static_db/NationalTeams/NationalTeamsCONCACAF';
import { NATIONAL_TEAMS_OFC } from '../resources/static_db/NationalTeams/NationalTeamsOFC';
import { NATIONAL_TEAMS_EUROPE } from '../resources/static_db/NationalTeams/NationalTeamsEurope';
import {
  getWorldCupHostConfederationForName,
  getWorldCupHostsForYear,
  pickWorldCupStadiumForMatch,
} from '../resources/WorldCupTournamentData';
import { RecoveryService } from './RecoveryService';

export interface WorldCupGroupDaySimulation {
  groups: WCGroup[];
  updatedPlayers?: Record<string, Player[]>;
}

export interface WorldCupKnockoutDaySimulation {
  matches: WCKnockoutMatch[];
  updatedPlayers?: Record<string, Player[]>;
}

export interface WorldCupTournamentSimulation {
  state: WCState;
  updatedPlayers?: Record<string, Player[]>;
}

// ─── SEEDED RNG ───────────────────────────────────────────────────────────────

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

// ─── HOSTY MŚ ─────────────────────────────────────────────────────────────────

const WC_HOST_GROUPS_2026: Record<string, number> = {
  Meksyk: 0,
  Kanada: 1,
  'Stany Zjednoczone': 3,
};

const formatWorldCupVenue = (stadium: { name: string; city: string; country: string }): string =>
  `${stadium.name} (${stadium.city}, ${stadium.country})`;

const estimateWorldCupVenueAttendance = (capacity: number, year: number, matchKey: string): number => {
  const rng = new Rng(strHash(`WORLD_CUP_ATTENDANCE_${year}_${matchKey}`));
  return Math.max(0, Math.round(capacity * (0.78 + rng.next() * 0.19)));
};

const applyWorldCupTournamentVenue = <T extends {
  venue?: string;
  attendance?: number;
  matchHistoryEntry?: { venue?: string; attendance?: number };
}>(
  result: T,
  year: number,
  matchKey: string
): T => {
  const stadium = pickWorldCupStadiumForMatch(year, matchKey);
  if (!stadium) return result;
  const venue = formatWorldCupVenue(stadium);
  const attendance = estimateWorldCupVenueAttendance(stadium.capacity, year, matchKey);

  // NationalTeamSimulator uses the nominal home team's stadium because it is
  // shared by friendlies, qualifiers and neutral tournament matches. World Cup
  // matches are neutral events hosted in the tournament country/countries, so we
  // patch both the immediate simulation result and the persisted MatchHistoryEntry
  // before the report is logged.
  return {
    ...result,
    venue,
    attendance,
    matchHistoryEntry: result.matchHistoryEntry
      ? { ...result.matchHistoryEntry, venue, attendance }
      : result.matchHistoryEntry,
  };
};

// ─── POISSON SAMPLING ────────────────────────────────────────────────────────

function poissonSample(lambda: number, rng: Rng): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= rng.next();
  } while (p > L && k < 10);
  return Math.max(0, k - 1);
}

// ─── SYMULACJA MECZU GRUPOWEGO ────────────────────────────────────────────────

function simulateGroupMatchResult(
  homeRep: number,
  awayRep: number,
  rng: Rng
): { homeGoals: number; awayGoals: number } {
  const total = homeRep + awayRep;
  const homeStrength = homeRep / total;
  const homeExpected = 2.6 * homeStrength + 0.15;
  const awayExpected = 2.6 * (1 - homeStrength);
  const homeGoals = poissonSample(homeExpected, rng);
  const awayGoals = poissonSample(awayExpected, rng);
  return { homeGoals, awayGoals };
}

// ─── SYMULACJA MECZU PUCHAROWEGO (z ET i karnym) ──────────────────────────────

function simulateKnockoutMatchResult(
  homeRep: number,
  awayRep: number,
  rng: Rng
): {
  homeGoals: number;
  awayGoals: number;
  homeGoalsAET?: number;
  awayGoalsAET?: number;
  homePenalties?: number;
  awayPenalties?: number;
  wentToET: boolean;
  wentToPenalties: boolean;
  winner: 'home' | 'away';
} {
  const { homeGoals, awayGoals } = simulateGroupMatchResult(homeRep, awayRep, rng);

  if (homeGoals !== awayGoals) {
    return {
      homeGoals,
      awayGoals,
      wentToET: false,
      wentToPenalties: false,
      winner: homeGoals > awayGoals ? 'home' : 'away',
    };
  }

  // Dogrywka
  const etHome = rng.next() < (homeRep / (homeRep + awayRep) + 0.05) ? (rng.next() < 0.35 ? 1 : 0) : 0;
  const etAway = rng.next() < ((awayRep / (homeRep + awayRep)) + 0.05) ? (rng.next() < 0.35 ? 1 : 0) : 0;
  const homeAET = homeGoals + etHome;
  const awayAET = awayGoals + etAway;

  if (homeAET !== awayAET) {
    return {
      homeGoals,
      awayGoals,
      homeGoalsAET: homeAET,
      awayGoalsAET: awayAET,
      wentToET: true,
      wentToPenalties: false,
      winner: homeAET > awayAET ? 'home' : 'away',
    };
  }

  // Karne — seria do 5, potem nagłe
  const homePKProb = 0.73 + (homeRep - awayRep) * 0.003;
  const awayPKProb = 0.73 + (awayRep - homeRep) * 0.003;
  let homePK = 0, awayPK = 0;
  let round = 0;

  while (round < 5) {
    if (rng.next() < Math.min(0.9, Math.max(0.55, homePKProb))) homePK++;
    if (rng.next() < Math.min(0.9, Math.max(0.55, awayPKProb))) awayPK++;
    round++;
  }

  // Nagła śmierć jeśli remis po 5
  let extraRound = 0;
  while (homePK === awayPK && extraRound < 20) {
    const h = rng.next() < Math.min(0.9, Math.max(0.55, homePKProb)) ? 1 : 0;
    const a = rng.next() < Math.min(0.9, Math.max(0.55, awayPKProb)) ? 1 : 0;
    homePK += h;
    awayPK += a;
    if (h !== a) break;
    extraRound++;
  }

  if (homePK === awayPK) homePK++;

  return {
    homeGoals,
    awayGoals,
    homeGoalsAET: homeAET,
    awayGoalsAET: awayAET,
    homePenalties: homePK,
    awayPenalties: awayPK,
    wentToET: true,
    wentToPenalties: true,
    winner: homePK > awayPK ? 'home' : 'away',
  };
}

// ─── OBLICZANIE TABELI GRUPY ─────────────────────────────────────────────────

export function computeGroupStandings(group: WCGroup): WCGroupStanding[] {
  const map: Record<string, WCGroupStanding> = {};
  group.teams.forEach(t => { map[t] = { name: t, M: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, pts: 0 }; });

  for (const m of group.matches) {
    if (!map[m.home] || !map[m.away]) continue;
    const h = map[m.home];
    const a = map[m.away];
    h.M++; a.M++;
    h.GF += m.homeGoals; h.GA += m.awayGoals;
    a.GF += m.awayGoals; a.GA += m.homeGoals;
    if (m.homeGoals > m.awayGoals) { h.W++; a.L++; h.pts += 3; }
    else if (m.homeGoals < m.awayGoals) { a.W++; h.L++; a.pts += 3; }
    else { h.D++; a.D++; h.pts++; a.pts++; }
  }

  return Object.values(map).sort((a, b) =>
    b.pts - a.pts || (b.GF - b.GA) - (a.GF - a.GA) || b.GF - a.GF
  );
}

// ─── LOSOWANIE WAŻONE REPUTACJĄ ───────────────────────────────────────────────

function weightedPick<T extends { reputation: number }>(
  pool: T[],
  count: number,
  rng: Rng,
  exclude: Set<string>,
  getName: (t: T) => string,
  power = 6
): T[] {
  const available = pool.filter(t => !exclude.has(getName(t)));
  const result: T[] = [];
  const remaining = [...available];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalRep = remaining.reduce((s, t) => s + Math.pow(Math.max(1, t.reputation), power), 0);
    let pick = rng.next() * totalRep;
    let chosen = remaining[0];
    for (const t of remaining) {
      pick -= Math.pow(Math.max(1, t.reputation), power);
      if (pick <= 0) { chosen = t; break; }
    }
    result.push(chosen);
    const idx = remaining.indexOf(chosen);
    remaining.splice(idx, 1);
  }

  return result;
}

function qualifiedPick<T extends { reputation: number }>(
  pool: T[],
  count: number,
  rng: Rng,
  exclude: Set<string>,
  getName: (t: T) => string,
  options: { minReputation?: number; shortlistSize?: number } = {}
): T[] {
  const available = pool
    .filter(t => !exclude.has(getName(t)))
    .sort((a, b) => b.reputation - a.reputation);
  const minReputation = options.minReputation ?? 1;
  const shortlistSize = Math.max(count, options.shortlistSize ?? count * 2);
  const shortlist = available
    .filter(t => t.reputation >= minReputation)
    .slice(0, shortlistSize);
  const candidatePool = shortlist.length >= count ? shortlist : available.slice(0, Math.max(count, shortlistSize));
  const picked = weightedPick(candidatePool, count, rng, exclude, getName, 7);

  if (picked.length >= count) return picked;

  const pickedNames = new Set(picked.map(getName));
  return [
    ...picked,
    ...available.filter(t => !pickedNames.has(getName(t))).slice(0, count - picked.length),
  ];
}

// ─── GŁÓWNE FUNKCJE ───────────────────────────────────────────────────────────

export const WorldCupService = {

  isWorldCupYear(year: number): boolean {
    return year >= 2026 && (year - 2026) % 4 === 0;
  },

  getHosts(year: number): string[] {
    return getWorldCupHostsForYear(year);
  },

  /**
   * Zbiera 48 drużyn na MŚ:
   *  UEFA (16) — z WCQPlayoffService (12 zwycięzców grup + 4 zwycięzców baraży)
   *  CAF (9), AFC (8), CONMEBOL (6), CONCACAF (6), OFC (1) — losowanie ważone reputacją z shortlisty
   *  Intercont (2) — najlepsze dostępne drużyny z pozostałych
   */
  assembleTeams(
    nationalTeams: NationalTeam[],
    wcqPlayoffState: WCQPlayoffState | null,
    seasonNumber: number,
    year: number,
    seed: number,
    worldCupQualifiersState?: WorldCupQualifiersState | null
  ): WCTeam[] {
    const rng = new Rng(seed ^ strHash(`WC_ASSEMBLE_${year}`));
    const usedNames = new Set<string>();
    const teams: WCTeam[] = [];

    const getNTColors = (name: string): string[] =>
      nationalTeams.find(t => t.name === name)?.colorsHex ?? ['#CCCCCC', '#FFFFFF', '#CCCCCC'];

    const addTeam = (name: string, conf: WCConfederation, rep: number, isHost = false) => {
      if (usedNames.has(name) || name === '?') return;
      usedNames.add(name);
      teams.push({ name, confederation: conf, reputation: rep, colors: getNTColors(name), isHost });
    };

    // ── UEFA: 12 zwycięzców grup ──────────────────────────────────────────────
    // UEFA qualification has two modes. The first season still uses the bespoke
    // 2026 WCQPlayoffService because it contains pre-game real results. From 2030
    // onward, WorldCupQualifiersState stores the full draw, standings, fixtures and
    // playoff results generated inside the career. The branch below keeps 2026
    // stable while allowing later World Cups to be driven by simulated qualifiers.
    if (worldCupQualifiersState?.tournamentYear === year) {
      const hostSet = new Set(WorldCupService.getHosts(year));
      for (const qualifier of worldCupQualifiersState.qualifiedTeams) {
        if (hostSet.has(qualifier)) continue;
        const rep = nationalTeams.find(t => t.name === qualifier)?.reputation ?? 10;
        addTeam(qualifier, 'UEFA', rep);
      }
    } else {
      const summary = WCQPlayoffService.getWCQGroupSummary(nationalTeams, seasonNumber);
      for (const winner of summary.directQualifiers) {
        const rep = nationalTeams.find(t => t.name === winner)?.reputation ?? 10;
        addTeam(winner, 'UEFA', rep);
      }
    }

    // ── UEFA: 4 zwycięzców baraży ─────────────────────────────────────────────
    if (worldCupQualifiersState?.tournamentYear !== year && wcqPlayoffState) {
      for (const path of wcqPlayoffState.paths) {
        if (path.qualifier) {
          const rep = nationalTeams.find(t => t.name === path.qualifier)?.reputation ?? 10;
          addTeam(path.qualifier, 'UEFA', rep);
        }
      }
    }

    // ── UEFA: fallback — uzupełnij do 16 jeśli brakuje kwalifikantów ─────────
    const uefaHostCount = WorldCupService.getHosts(year).filter(h => getWorldCupHostConfederationForName(h) === 'UEFA' && !usedNames.has(h)).length;
    const uefaCount = teams.filter(t => t.confederation === 'UEFA').length + uefaHostCount;
    if (uefaCount < 16) {
      const euFallback = NATIONAL_TEAMS_EUROPE
        .filter(t => !usedNames.has(t.name))
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 16 - uefaCount);
      euFallback.forEach(t => addTeam(t.name, 'UEFA', t.reputation));
    }

    // ── Hosty (CONCACAF dla 2026) ─────────────────────────────────────────────
    const hosts = WorldCupService.getHosts(year);
    for (const h of hosts) {
      const conf = getWorldCupHostConfederationForName(h);
      const ntHost = nationalTeams.find(t => t.name === h);
      addTeam(h, conf, ntHost?.reputation ?? 12, true);
    }

    // ── CAF: 9 ───────────────────────────────────────────────────────────────
    const cafNeeded = 9 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'CAF').length;
    const cafPicks = qualifiedPick(NATIONAL_TEAMS_AFRICA, Math.max(0, cafNeeded), rng, usedNames, t => t.name, { minReputation: 7, shortlistSize: 18 });
    cafPicks.forEach(t => addTeam(t.name, 'CAF', t.reputation));

    // ── AFC: 8 ───────────────────────────────────────────────────────────────
    // AFC host places are counted inside the same continental allocation, just
    // like the CONCACAF hosts in 2026. Saudi Arabia is the confirmed 2034 host,
    // so this keeps the final World Cup field at 48 teams instead of adding one
    // extra Asian team on top of the host.
    const afcNeeded = 8 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'AFC').length;
    const afcPicks = qualifiedPick(NATIONAL_TEAMS_AFC, Math.max(0, afcNeeded), rng, usedNames, t => t.name, { minReputation: 8, shortlistSize: 16 });
    afcPicks.forEach(t => addTeam(t.name, 'AFC', t.reputation));

    // ── CONMEBOL: 6 ──────────────────────────────────────────────────────────
    const conmebolNeeded = 6 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'CONMEBOL').length;
    const saPicks = qualifiedPick(NATIONAL_TEAMS_CONMEBOL, Math.max(0, conmebolNeeded), rng, usedNames, t => t.name, { minReputation: 9, shortlistSize: 10 });
    saPicks.forEach(t => addTeam(t.name, 'CONMEBOL', t.reputation));

    // ── CONCACAF: dopełnienie do 6 (hosty już wstawione) ─────────────────────
    const concacacNeeded = 6 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'CONCACAF').length;
    if (concacacNeeded > 0) {
      const concPicks = qualifiedPick(NATIONAL_TEAMS_CONCACAF, concacacNeeded, rng, usedNames, t => t.name, { minReputation: 8, shortlistSize: 10 });
      concPicks.forEach(t => addTeam(t.name, 'CONCACAF', t.reputation));
    }

    // ── OFC: 1 ───────────────────────────────────────────────────────────────
    const ofcNeeded = 1 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'OFC').length;
    const ofcPicks = qualifiedPick(NATIONAL_TEAMS_OFC, Math.max(0, ofcNeeded), rng, usedNames, t => t.name, { minReputation: 8, shortlistSize: 3 });
    ofcPicks.forEach(t => addTeam(t.name, 'OFC', t.reputation));

    // ── Intercontinental: 2 najlepsze pozostałe ────────────────────────────
    const allConfedTeams = [
      ...NATIONAL_TEAMS_AFRICA,
      ...NATIONAL_TEAMS_AFC,
      ...NATIONAL_TEAMS_CONMEBOL,
      ...NATIONAL_TEAMS_CONCACAF,
      ...NATIONAL_TEAMS_OFC,
    ];
    const interContPicks = allConfedTeams
      .filter(t => !usedNames.has(t.name))
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, Math.max(0, 48 - teams.length));
    interContPicks.forEach(t => addTeam(t.name, 'INTERCONT', t.reputation));

    return teams.slice(0, 48);
  },

  /**
   * Losowanie 12 grup po 4 drużyny z podziałem na koszyki (pot-seeding).
   * Koszyk 1: 12 najlepszych drużyn UEFA + hosty
   * Koszyk 2: następne 12 wg reputacji
   * Koszyk 3: następne 12
   * Koszyk 4: ostatnie 12
   */
  drawGroups(teams: WCTeam[], seed: number, year: number): WCGroup[] {
    const rng = new Rng(seed ^ strHash(`WC_DRAW_${year}`));
    const LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

    const sorted = [...teams].sort((a, b) => {
      if (a.isHost !== b.isHost) return a.isHost ? -1 : 1;
      return b.reputation - a.reputation;
    });

    const pot1 = sorted.slice(0, 12);
    const pot2 = rng.shuffle(sorted.slice(12, 24));
    const pot3 = rng.shuffle(sorted.slice(24, 36));
    const pot4 = rng.shuffle(sorted.slice(36, 48));

    const groupTeams: string[][] = LABELS.map(() => []);
    pot1.forEach((t, i) => groupTeams[i].push(t.name));
    pot2.forEach((t, i) => groupTeams[i].push(t.name));
    pot3.forEach((t, i) => groupTeams[i].push(t.name));
    pot4.forEach((t, i) => groupTeams[i].push(t.name));

    return LABELS.map((label, i) => ({
      label,
      teams: groupTeams[i],
      matches: [],
    }));
  },

  /**
   * Symuluje mecze grupowe na dany dzień turnieju.
   * Zwraca zaktualizowane grupy ze wstawionymi wynikami.
   */
  simulateGroupDay(
    groups: WCGroup[],
    teams: WCTeam[],
    day: number,
    month: number,
    year: number,
    seed: number,
    nationalTeams?: NationalTeam[],
    players?: Record<string, Player[]>,
    coaches?: Record<string, Coach>
  ): WorldCupGroupDaySimulation {
    const schedule = getGroupDaySchedule(day, month);
    if (!schedule) return { groups, updatedPlayers: players };

    const getTeamRep = (name: string) =>
      teams.find(t => t.name === name)?.reputation ?? 8;

    const newGroups = groups.map(g => ({ ...g, matches: [...g.matches] }));
    let updatedPlayers = players;
    const matchDate = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    for (const { groupLabel, round } of schedule) {
      const groupIdx = newGroups.findIndex(g => g.label === groupLabel);
      if (groupIdx === -1) continue;
      const group = newGroups[groupIdx];
      const matchups = getGroupRoundMatchups(group.teams, round);

      for (const [homeIdx, awayIdx] of matchups) {
        const home = group.teams[homeIdx];
        const away = group.teams[awayIdx];
        const matchSeed = seed ^ strHash(`WC_GROUP_${groupLabel}_R${round}_${home}_${away}`);

        if (nationalTeams && updatedPlayers && coaches) {
          const full = applyWorldCupTournamentVenue(
            simulateWCGroupMatch(home, away, matchDate, matchSeed, nationalTeams, updatedPlayers, coaches),
            year,
            `GROUP_${groupLabel}_R${round}_${home}_${away}_${dateStr}`
          );
          updatedPlayers = full.updatedPlayers ?? updatedPlayers;
          if (full.matchHistoryEntry) MatchHistoryService.logMatch(full.matchHistoryEntry);
          group.matches.push({
            matchId: full.matchId,
            home,
            away,
            homeGoals: full.homeGoals,
            awayGoals: full.awayGoals,
            date: dateStr,
            goals: full.goals,
            cards: full.cards,
            venue: full.venue,
            attendance: full.attendance,
            weather: full.weather,
            refereeName: full.refereeName,
          });
        } else {
          const rng = new Rng(matchSeed);
          const result = simulateGroupMatchResult(getTeamRep(home), getTeamRep(away), rng);
          group.matches.push({ home, away, homeGoals: result.homeGoals, awayGoals: result.awayGoals, date: dateStr });
        }
      }
    }

    return { groups: newGroups, updatedPlayers };
  },

  /**
   * Buduje pusty bracket 1/16 finału na podstawie kwalifikantów z fazy grupowej.
   * Rozstawianie: zwycięzcy grup (1-12) + wicemistrzowie (13-24) + najlepsze 3. miejsca (25-32).
   * Parowanie: seed 1 vs seed 32, seed 2 vs seed 31, itd.
   */
  buildKnockoutBracket(groups: WCGroup[], year: number): WCKnockoutMatch[] {
    const standings = groups.map(g => computeGroupStandings(g));

    const winners = standings.map((s, i) => ({
      name: s[0]?.name ?? '?',
      group: groups[i].label,
      tier: 0,
      pts: s[0]?.pts ?? 0,
      gd: (s[0]?.GF ?? 0) - (s[0]?.GA ?? 0),
      gf: s[0]?.GF ?? 0,
    }));
    const runnersUp = standings.map((s, i) => ({
      name: s[1]?.name ?? '?',
      group: groups[i].label,
      tier: 1,
      pts: s[1]?.pts ?? 0,
      gd: (s[1]?.GF ?? 0) - (s[1]?.GA ?? 0),
      gf: s[1]?.GF ?? 0,
    }));
    const thirds = standings
      .map((s, i) => ({
        name: s[2]?.name ?? '?',
        group: groups[i].label,
        tier: 2,
        pts: s[2]?.pts ?? 0,
        gd: (s[2]?.GF ?? 0) - (s[2]?.GA ?? 0),
        gf: s[2]?.GF ?? 0,
      }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
      .slice(0, 8);

    const seeded = [
      ...winners.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf),
      ...runnersUp.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf),
      ...thirds,
    ];

    const R32_DATES: string[] = [
      ...Array(4).fill(`${year}-06-15`),
      ...Array(4).fill(`${year}-06-16`),
      ...Array(4).fill(`${year}-06-17`),
      ...Array(4).fill(`${year}-06-18`),
    ];

    const matches: WCKnockoutMatch[] = [];
    for (let i = 0; i < 16; i++) {
      const high = seeded[i];
      const low = seeded[31 - i];
      matches.push({
        id: `R32_${String(i + 1).padStart(2, '0')}`,
        round: 'R32',
        home: high?.name ?? null,
        away: low?.name ?? null,
        date: R32_DATES[i],
      });
    }

    return matches;
  },

  /**
   * Symuluje mecze pucharowe na dany dzień.
   * Dla gotowych meczów (home i away znane) oblicza wynik.
   * Kolejne rundy są uzupełniane po zakończeniu poprzedniej.
   */
  simulateKnockoutDay(
    wcState: WCState,
    teams: WCTeam[],
    day: number,
    month: number,
    year: number,
    seed: number,
    nationalTeams?: NationalTeam[],
    players?: Record<string, Player[]>,
    coaches?: Record<string, Coach>
  ): WorldCupKnockoutDaySimulation {
    const matchDate = new Date(year, month - 1, day);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const getTeamRep = (name: string | null) =>
      name ? (teams.find(t => t.name === name)?.reputation ?? 8) : 8;

    let updatedPlayers = players;
    const newMatches = wcState.knockoutMatches.map(m => {
      if (m.date !== dateStr || m.winner) return m;
      if (!m.home || !m.away) return m;

      const matchSeed = seed ^ strHash(`WC_KO_${m.id}_${m.home}_${m.away}`);

      if (nationalTeams && updatedPlayers && coaches) {
        const full = applyWorldCupTournamentVenue(
          simulateSinglePlayoffMatch(m.home, m.away, 'FIFA World Cup', matchDate, matchSeed, nationalTeams, updatedPlayers, coaches, year),
          year,
          `KO_${m.id}_${m.home}_${m.away}_${dateStr}`
        );
        updatedPlayers = full.updatedPlayers ?? updatedPlayers;
        if (full.matchHistoryEntry) MatchHistoryService.logMatch(full.matchHistoryEntry);
        const wentToET = full.homeGoals === full.awayGoals;
        const wentToPenalties = full.penaltyWinner !== undefined;
        const winner = full.penaltyWinner
          ?? (wentToET
            ? ((full.homeGoalsAET ?? 0) > (full.awayGoalsAET ?? 0) ? m.home : m.away)
            : (full.homeGoals > full.awayGoals ? m.home : m.away));
        return {
          ...m,
          matchId: full.matchHistoryEntry?.matchId,
          homeGoals: full.homeGoals,
          awayGoals: full.awayGoals,
          homeGoalsAET: full.homeGoalsAET,
          awayGoalsAET: full.awayGoalsAET,
          homePenalties: full.homePenaltyGoals,
          awayPenalties: full.awayPenaltyGoals,
          wentToET,
          wentToPenalties,
          winner,
          goals: full.goals,
          cards: full.cards,
          venue: full.venue,
          attendance: full.attendance,
          weather: full.weather,
          refereeName: full.refereeName,
        };
      }

      const rng = new Rng(matchSeed);
      const res = simulateKnockoutMatchResult(getTeamRep(m.home), getTeamRep(m.away), rng);
      return {
        ...m,
        homeGoals: res.homeGoals,
        awayGoals: res.awayGoals,
        homeGoalsAET: res.homeGoalsAET,
        awayGoalsAET: res.awayGoalsAET,
        homePenalties: res.homePenalties,
        awayPenalties: res.awayPenalties,
        wentToET: res.wentToET,
        wentToPenalties: res.wentToPenalties,
        winner: res.winner === 'home' ? m.home : m.away,
      };
    });

    return { matches: propagateWinners(newMatches, year), updatedPlayers };
  },

  /**
   * Symuluje cały turniej od razu (tryb Skip to Final).
   */
  simulateFullTournament(wcState: WCState, seed: number, nationalTeams?: NationalTeam[], players?: Record<string, Player[]>, coaches?: Record<string, Coach>): WorldCupTournamentSimulation {
    let state = { ...wcState };
    let updatedPlayers = players;
    let previousMatchDate: Date | null = null;
    const recoverBeforeMatchDay = (day: number, month: number) => {
      const matchDate = new Date(state.year, month - 1, day);
      if (updatedPlayers && previousMatchDate) {
        const daysBetween = Math.max(1, Math.round((matchDate.getTime() - previousMatchDate.getTime()) / 86_400_000));
        updatedPlayers = RecoveryService.applyDailyRecovery(updatedPlayers, matchDate, TrainingIntensity.NORMAL, daysBetween);
      }
      previousMatchDate = matchDate;
    };

    // Faza grupowa — wszystkie dni
    const groupDays = [
      [2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],[12,6],
    ];
    for (const [day, month] of groupDays) {
      recoverBeforeMatchDay(day, month);
      const groupSimulation = WorldCupService.simulateGroupDay(state.groups, state.teams, day, month, state.year, seed, nationalTeams, updatedPlayers, coaches);
      updatedPlayers = groupSimulation.updatedPlayers ?? updatedPlayers;
      state = {
        ...state,
        groups: groupSimulation.groups,
      };
    }
    state.groupStageComplete = true;

    // Budowanie bracketu
    const knockoutMatches = WorldCupService.buildKnockoutBracket(state.groups, state.year);
    state = { ...state, knockoutMatches };

    // Faza pucharowa — wszystkie dni
    const koDays = [
      [15,6],[16,6],[17,6],[18,6],
      [19,6],[20,6],[21,6],[22,6],
      [23,6],[24,6],
      [26,6],[27,6],
      [29,6],[30,6],
    ];
    for (const [day, month] of koDays) {
      recoverBeforeMatchDay(day, month);
      const knockoutSimulation = WorldCupService.simulateKnockoutDay(state, state.teams, day, month, state.year, seed, nationalTeams, updatedPlayers, coaches);
      updatedPlayers = knockoutSimulation.updatedPlayers ?? updatedPlayers;
      state = {
        ...state,
        knockoutMatches: knockoutSimulation.matches,
      };
    }
    state.knockoutComplete = true;

    const finalMatch = state.knockoutMatches.find(m => m.round === 'FINAL');
    const thirdMatch = state.knockoutMatches.find(m => m.round === 'THIRD');
    state.champion = finalMatch?.winner ?? undefined;
    state.runnerUp = finalMatch?.winner === finalMatch?.home ? finalMatch?.away : finalMatch?.home;
    state.thirdPlace = thirdMatch?.winner ?? undefined;
    state.fourthPlace = thirdMatch?.winner === thirdMatch?.home ? thirdMatch?.away : thirdMatch?.home;

    return { state, updatedPlayers };
  },

  /**
   * Tworzy pusty WCState dla danego roku i zebranych drużyn.
   */
  createInitialState(
    teams: WCTeam[],
    groups: WCGroup[],
    year: number
  ): WCState {
    return {
      year,
      teams,
      groups,
      knockoutMatches: [],
      playerEffects: [],
      groupStageComplete: false,
      knockoutComplete: false,
    };
  },

  /**
   * Oblicza efekty MŚ na zawodników drużyny gracza.
   * Kontuzje, morale mistrza, zmęczenie po wielu meczach.
   */
  computePlayerEffects(
    wcState: WCState,
    players: Player[],
    seed: number
  ): WCPlayerEffect[] {
    const rng = new Rng(seed ^ strHash(`WC_EFFECTS_${wcState.year}`));
    const effects: WCPlayerEffect[] = [];

    if (!wcState.knockoutComplete) return effects;

    const champion = wcState.champion;

    for (const player of players) {
      const ntName = player.nationality;
      if (!ntName) continue;

      // Policz ile meczów rozegrała drużyna zawodnika
      const groupMatchCount = wcState.groups
        .flatMap(g => g.matches)
        .filter(m => m.home === ntName || m.away === ntName).length;

      const koMatchCount = wcState.knockoutMatches
        .filter(m => m.winner && (m.home === ntName || m.away === ntName)).length;

      const totalMatches = groupMatchCount + koMatchCount;
      if (totalMatches === 0) continue;

      // Zmęczenie po dużej liczbie meczów
      if (totalMatches >= 6) {
        effects.push({ playerId: player.id, type: 'FATIGUE', value: 10 });
      } else if (totalMatches >= 4) {
        effects.push({ playerId: player.id, type: 'FATIGUE', value: 5 });
      }

      // Kontuzja — 3% szansa per zawodnik który grał
      if (rng.next() < 0.03) {
        effects.push({ playerId: player.id, type: 'INJURY', value: rng.int(5, 21) });
      }

      // Morale mistrza
      if (champion && ntName === champion) {
        effects.push({ playerId: player.id, type: 'MORALE_BOOST', value: 15 });
      }
    }

    return effects;
  },

  /**
   * Zbiera 42 znane drużyny na losowanie MŚ.
   * Pozostałe 6 miejsc to 4 placeholdery baraży UEFA i 2 placeholdery play-off FIFA.
   * Wywoływane 5 grudnia roku poprzedzającego MŚ.
   */
  assembleTeamsForDraw(
    nationalTeams: NationalTeam[],
    seasonNumber: number,
    year: number,
    seed: number,
    worldCupQualifiersState?: WorldCupQualifiersState | null
  ): WCTeam[] {
    const rng = new Rng(seed ^ strHash(`WC_DRAW_ASSEMBLE_${year}`));
    const usedNames = new Set<string>();
    const teams: WCTeam[] = [];

    const getNTColors = (name: string): string[] =>
      nationalTeams.find(t => t.name === name)?.colorsHex ?? ['#CCCCCC', '#FFFFFF', '#CCCCCC'];

    const addTeam = (name: string, conf: WCConfederation, rep: number, isHost = false, isPlayoffSlot = false) => {
      if (usedNames.has(name) || name === '?') return;
      usedNames.add(name);
      teams.push({ name, confederation: conf, reputation: rep, colors: getNTColors(name), isHost, isPlayoffSlot });
    };

    // ── UEFA: 12 zwycięzców grup (bezpośredni kwalifikanci) ───────────────────
    // During draw month the later-career WCQ state has already resolved group
    // winners but may still have March playoff slots open. We add only the known
    // non-host UEFA qualifiers here; hosts are inserted below with isHost=true, and
    // unresolved playoff paths stay as TBD placeholders for the existing World Cup
    // group-draw ceremony.
    if (worldCupQualifiersState?.tournamentYear === year) {
      const hostSet = new Set(WorldCupService.getHosts(year));
      for (const winner of worldCupQualifiersState.directQualifiers) {
        if (hostSet.has(winner)) continue;
        const rep = nationalTeams.find(t => t.name === winner)?.reputation ?? 10;
        addTeam(winner, 'UEFA', rep);
      }
    } else {
      const summary = WCQPlayoffService.getWCQGroupSummary(nationalTeams, seasonNumber);
      for (const winner of summary.directQualifiers) {
        const rep = nationalTeams.find(t => t.name === winner)?.reputation ?? 10;
        addTeam(winner, 'UEFA', rep);
      }
    }

    // ── UEFA: 4 TBD placeholdery (zwycięzcy baraży — nieznani w grudniu) ─────
    const uefaPlayoffPathLabels = worldCupQualifiersState?.tournamentYear === year && worldCupQualifiersState.playoffPaths.length > 0
      ? worldCupQualifiersState.playoffPaths.map(path => path.label)
      : ['A', 'B', 'C', 'D'];
    for (const path of uefaPlayoffPathLabels) {
      const tbdName = `TBD_PATH_${path}`;
      usedNames.add(tbdName);
      teams.push({ name: tbdName, confederation: 'UEFA', reputation: 0, colors: ['#475569', '#64748b', '#475569'], isHost: false, isPlayoffSlot: true });
    }

    for (const path of ['1', '2']) {
      const tbdName = `TBD_FIFA_PO_${path}`;
      usedNames.add(tbdName);
      teams.push({ name: tbdName, confederation: 'INTERCONT', reputation: 0, colors: ['#475569', '#64748b', '#475569'], isHost: false, isPlayoffSlot: true });
    }

    // ── Hosty (CONCACAF dla 2026) ─────────────────────────────────────────────
    const hosts = WorldCupService.getHosts(year);
    for (const h of hosts) {
      const conf = getWorldCupHostConfederationForName(h);
      const ntHost = nationalTeams.find(t => t.name === h);
      addTeam(h, conf, ntHost?.reputation ?? 12, true);
    }

    // ── CAF: 9 ───────────────────────────────────────────────────────────────
    const cafNeeded = 9 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'CAF').length;
    const cafPicks = qualifiedPick(NATIONAL_TEAMS_AFRICA, Math.max(0, cafNeeded), rng, usedNames, t => t.name, { minReputation: 7, shortlistSize: 18 });
    cafPicks.forEach(t => addTeam(t.name, 'CAF', t.reputation));

    // ── AFC: 8 ───────────────────────────────────────────────────────────────
    // AFC host places are counted inside the same continental allocation, just
    // like the CONCACAF hosts in 2026. Saudi Arabia is the confirmed 2034 host,
    // so the pre-tournament draw receives 48 teams/placeholders with no hidden
    // overbooking from the Asian allocation.
    const afcNeeded = 8 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'AFC').length;
    const afcPicks = qualifiedPick(NATIONAL_TEAMS_AFC, Math.max(0, afcNeeded), rng, usedNames, t => t.name, { minReputation: 8, shortlistSize: 16 });
    afcPicks.forEach(t => addTeam(t.name, 'AFC', t.reputation));

    // ── CONMEBOL: 6 ──────────────────────────────────────────────────────────
    const conmebolNeeded = 6 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'CONMEBOL').length;
    const saPicks = qualifiedPick(NATIONAL_TEAMS_CONMEBOL, Math.max(0, conmebolNeeded), rng, usedNames, t => t.name, { minReputation: 9, shortlistSize: 10 });
    saPicks.forEach(t => addTeam(t.name, 'CONMEBOL', t.reputation));

    // ── CONCACAF: dopełnienie do 6 (hosty już wstawione) ─────────────────────
    const concacacNeeded = 6 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'CONCACAF').length;
    if (concacacNeeded > 0) {
      const concPicks = qualifiedPick(NATIONAL_TEAMS_CONCACAF, concacacNeeded, rng, usedNames, t => t.name, { minReputation: 8, shortlistSize: 10 });
      concPicks.forEach(t => addTeam(t.name, 'CONCACAF', t.reputation));
    }

    // ── OFC: 1 ───────────────────────────────────────────────────────────────
    const ofcNeeded = 1 - hosts.filter(h => getWorldCupHostConfederationForName(h) === 'OFC').length;
    const ofcPicks = qualifiedPick(NATIONAL_TEAMS_OFC, Math.max(0, ofcNeeded), rng, usedNames, t => t.name, { minReputation: 8, shortlistSize: 3 });
    ofcPicks.forEach(t => addTeam(t.name, 'OFC', t.reputation));

    return teams;
  },

  /**
   * Losowanie grup z zasadami FIFA:
   *  Pot 1: hosty pre-przypisane do A/B/D + 9 najlepszych do wolnych grup
   *  Pot 2-3: kolejne 12 wg reputacji, randomowo do grup
   *  Pot 4: ostatnie drużyny + 6 TBD (4 UEFA + 2 play-off FIFA)
   * Ograniczenia: max 1 drużyna per konfederacja (poza UEFA), max 2 UEFA per grupa.
   * Zwraca grupy z polem pots do wyświetlenia w ceremonii.
   */
  drawGroupsWithFIFARules(teams: WCTeam[], seed: number, year: number): { groups: WCGroup[]; pots: WCTeam[][] } {
    const rng = new Rng(seed ^ strHash(`WC_FIFADRAW_${year}`));
    const LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

    const groupTeams: string[][] = LABELS.map(() => []);
    const groupConfs: WCConfederation[][] = LABELS.map(() => []);

    const countUEFA = (gIdx: number) => groupConfs[gIdx].filter(c => c === 'UEFA').length;

    const placeInGroup = (team: WCTeam, gIdx: number) => {
      groupTeams[gIdx].push(team.name);
      groupConfs[gIdx].push(team.confederation);
    };

    // ── Pot 1: hosty pre-przypisane, reszta do D-L ────────────────────────
    const hostsOrdered = teams.filter(t => t.isHost);
    hostsOrdered.forEach((h, i) => {
      const hostGroup = year === 2026 ? WC_HOST_GROUPS_2026[h.name] : i;
      if (hostGroup !== undefined && hostGroup < LABELS.length) placeInGroup(h, hostGroup);
    });

    // Pot 1 cannot assume the 2026 setup of three hosts plus nine seeded teams.
    // The 2030 tournament has six hosts, and future data may define a different
    // host count. The draw therefore fills Pot 1 up to the number of World Cup
    // groups that are not already occupied by pre-assigned hosts.
    const nonHostPot1Slots = Math.max(0, LABELS.length - Math.min(hostsOrdered.length, LABELS.length));
    const nonHostPot1 = [...teams]
      .filter(t => !t.isHost && !t.isPlayoffSlot)
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, nonHostPot1Slots);
    const pot1Shuffled = rng.shuffle(nonHostPot1);
    const freePot1Groups = LABELS.map((_, i) => i).filter(i => groupTeams[i].length === 0);
    pot1Shuffled.forEach((t, i) => placeInGroup(t, freePot1Groups[i]));

    const usedInPot1Names = new Set([...hostsOrdered.map(t => t.name), ...nonHostPot1.map(t => t.name)]);

    // Sortuj pozostałe (bez TBD) wg reputacji
    const remaining = teams
      .filter(t => !usedInPot1Names.has(t.name) && !t.isPlayoffSlot)
      .sort((a, b) => b.reputation - a.reputation);

    const pot2 = rng.shuffle(remaining.slice(0, 12));
    const pot3 = rng.shuffle(remaining.slice(12, 24));
    const pot4Real = rng.shuffle(remaining.slice(24));
    const tbdTeams = [...teams.filter(t => t.isPlayoffSlot)].sort((a, b) => a.name.localeCompare(b.name));
    const pot4 = rng.shuffle([...pot4Real, ...tbdTeams]);

    const pots: WCTeam[][] = [
      [...hostsOrdered, ...nonHostPot1],
      pot2,
      pot3,
      pot4,
    ];

    // ── Pomocnik: znajdź grupę spełniającą ograniczenia ────────────────────
    const canPlaceInGroup = (team: WCTeam, gIdx: number): boolean => {
      if (groupTeams[gIdx].length >= 4) return false;
      if (team.confederation === 'UEFA' && countUEFA(gIdx) >= 2) return false;
      if (team.confederation !== 'UEFA' && groupConfs[gIdx].includes(team.confederation)) return false;
      if (team.confederation !== 'UEFA' && countUEFA(gIdx) === 0 && groupTeams[gIdx].length === 3) return false;
      return true;
    };

    const placePotTeams = (potTeams: WCTeam[]): boolean => {
      const placed: Array<{ groupIdx: number }> = [];
      const usedGroups = new Set<number>();

      const tryPlace = (idx: number): boolean => {
        if (idx >= potTeams.length) return true;
        const team = potTeams[idx];
        const groupOrder = rng.shuffle([...Array(12).keys()]);

        for (const gIdx of groupOrder) {
          if (usedGroups.has(gIdx)) continue;
          if (!canPlaceInGroup(team, gIdx)) continue;
          placeInGroup(team, gIdx);
          usedGroups.add(gIdx);
          placed.push({ groupIdx: gIdx });
          if (tryPlace(idx + 1)) return true;
          placed.pop();
          usedGroups.delete(gIdx);
          groupTeams[gIdx].pop();
          groupConfs[gIdx].pop();
        }

        return false;
      };

      const success = tryPlace(0);
      if (success) return true;

      while (placed.length > 0) {
        const last = placed.pop()!;
        usedGroups.delete(last.groupIdx);
        groupTeams[last.groupIdx].pop();
        groupConfs[last.groupIdx].pop();
      }
      return false;
    };

    const findValidGroup = (team: WCTeam, shuffledOrder: number[]): number => {
      for (const gIdx of shuffledOrder) {
        if (canPlaceInGroup(team, gIdx)) return gIdx;
      }
      return shuffledOrder.find(g => groupTeams[g].length < 4) ?? 0;
    };

    // ── Losowanie Pot 2 ────────────────────────────────────────────────────
    if (!placePotTeams(pot2)) {
      const groupOrder2 = rng.shuffle([...Array(12).keys()]);
      pot2.forEach(team => placeInGroup(team, findValidGroup(team, groupOrder2)));
    }

    // ── Losowanie Pot 3 ────────────────────────────────────────────────────
    if (!placePotTeams(pot3)) {
      const groupOrder3 = rng.shuffle([...Array(12).keys()]);
      pot3.forEach(team => placeInGroup(team, findValidGroup(team, groupOrder3)));
    }

    // ── Losowanie Pot 4 ─────────────────────────────────────────────────────
    if (!placePotTeams(pot4)) {
      const groupOrder4 = rng.shuffle([...Array(12).keys()]);
      pot4.forEach(team => placeInGroup(team, findValidGroup(team, groupOrder4)));
    }

    const groups: WCGroup[] = LABELS.map((label, i) => ({
      label,
      teams: groupTeams[i],
      matches: [],
    }));

    return { groups, pots };
  },

  /**
   * Wypełnia placeholdery zwycięzcami baraży UEFA i play-off FIFA.
   * Wywoływane 21 marca roku MŚ po zakończeniu finałów baraży.
   */
  fillPlayoffSlots(wcState: WCState, winners: string[], nationalTeams: NationalTeam[]): WCState {
    const getNTColors = (name: string): string[] =>
      nationalTeams.find(t => t.name === name)?.colorsHex ?? ['#CCCCCC', '#FFFFFF', '#CCCCCC'];

    const newTeams = [...wcState.teams];
    const newGroups = wcState.groups.map(g => ({ ...g, teams: [...g.teams] }));

    const uefaSlots = newTeams.filter(t => t.isPlayoffSlot && t.name.startsWith('TBD_PATH_'));

    uefaSlots.forEach((tbd, i) => {
      const winner = winners[i];
      if (!winner) return;
      const rep = nationalTeams.find(t => t.name === winner)?.reputation ?? 10;
      const idx = newTeams.findIndex(t => t.name === tbd.name);
      if (idx !== -1) {
        newTeams[idx] = { name: winner, confederation: 'UEFA', reputation: rep, colors: getNTColors(winner), isHost: false, isPlayoffSlot: false };
      }
      // Zastąp w grupach
      for (const g of newGroups) {
        const ti = g.teams.indexOf(tbd.name);
        if (ti !== -1) g.teams[ti] = winner;
      }
    });

    const usedNames = new Set(newTeams.filter(t => !t.isPlayoffSlot).map(t => t.name));
    const intercontinentalCandidates = [
      ...NATIONAL_TEAMS_AFRICA.map(t => ({ ...t, confederation: 'CAF' as WCConfederation })),
      ...NATIONAL_TEAMS_AFC.map(t => ({ ...t, confederation: 'AFC' as WCConfederation })),
      ...NATIONAL_TEAMS_CONMEBOL.map(t => ({ ...t, confederation: 'CONMEBOL' as WCConfederation })),
      ...NATIONAL_TEAMS_CONCACAF.map(t => ({ ...t, confederation: 'CONCACAF' as WCConfederation })),
      ...NATIONAL_TEAMS_OFC.map(t => ({ ...t, confederation: 'OFC' as WCConfederation })),
    ].filter(t => !usedNames.has(t.name)).sort((a, b) => b.reputation - a.reputation);

    const fifaSlots = newTeams.filter(t => t.isPlayoffSlot && t.name.startsWith('TBD_FIFA_PO_'));
    fifaSlots.forEach(tbd => {
      const group = newGroups.find(g => g.teams.includes(tbd.name));
      const groupConfs = group
        ? group.teams
            .map(name => newTeams.find(t => t.name === name)?.confederation)
            .filter((conf): conf is WCConfederation => !!conf && conf !== 'INTERCONT')
        : [];
      const winner = intercontinentalCandidates.find(t => !usedNames.has(t.name) && !groupConfs.includes(t.confederation));
      if (!winner) return;
      usedNames.add(winner.name);
      const idx = newTeams.findIndex(t => t.name === tbd.name);
      if (idx !== -1) {
        newTeams[idx] = { name: winner.name, confederation: winner.confederation, reputation: winner.reputation, colors: getNTColors(winner.name), isHost: false, isPlayoffSlot: false };
      }
      if (group) {
        const ti = group.teams.indexOf(tbd.name);
        if (ti !== -1) group.teams[ti] = winner.name;
      }
    });

    return { ...wcState, teams: newTeams, groups: newGroups, playoffSlotsResolved: true };
  },
};

// ─── POMOCNICZE: HARMONOGRAM GRUPOWY ─────────────────────────────────────────

interface GroupDayEntry { groupLabel: string; round: number; }

function getGroupDaySchedule(day: number, month: number): GroupDayEntry[] | null {
  if (month !== 6) return null;
  switch (day) {
    case 2:  return [{ groupLabel: 'A', round: 1 }, { groupLabel: 'B', round: 1 }, { groupLabel: 'C', round: 1 }];
    case 3:  return [{ groupLabel: 'D', round: 1 }, { groupLabel: 'E', round: 1 }, { groupLabel: 'F', round: 1 }];
    case 4:  return [{ groupLabel: 'G', round: 1 }, { groupLabel: 'H', round: 1 }, { groupLabel: 'I', round: 1 }];
    case 5:  return [
      { groupLabel: 'J', round: 1 }, { groupLabel: 'K', round: 1 }, { groupLabel: 'L', round: 1 },
      { groupLabel: 'A', round: 2 }, { groupLabel: 'B', round: 2 }, { groupLabel: 'C', round: 2 },
    ];
    case 6:  return [{ groupLabel: 'D', round: 2 }, { groupLabel: 'E', round: 2 }, { groupLabel: 'F', round: 2 }];
    case 7:  return [{ groupLabel: 'G', round: 2 }, { groupLabel: 'H', round: 2 }, { groupLabel: 'I', round: 2 }];
    case 8:  return [{ groupLabel: 'J', round: 2 }, { groupLabel: 'K', round: 2 }, { groupLabel: 'L', round: 2 }];
    case 9:  return [{ groupLabel: 'A', round: 3 }, { groupLabel: 'B', round: 3 }, { groupLabel: 'C', round: 3 }];
    case 10: return [{ groupLabel: 'D', round: 3 }, { groupLabel: 'E', round: 3 }, { groupLabel: 'F', round: 3 }];
    case 11: return [{ groupLabel: 'G', round: 3 }, { groupLabel: 'H', round: 3 }, { groupLabel: 'I', round: 3 }];
    case 12: return [{ groupLabel: 'J', round: 3 }, { groupLabel: 'K', round: 3 }, { groupLabel: 'L', round: 3 }];
    default: return null;
  }
}

/** Zwraca pary indeksów drużyn dla danej rundy w grupie 4-zespołowej. */
function getGroupRoundMatchups(teams: string[], round: number): [number, number][] {
  if (teams.length < 4) return [];
  switch (round) {
    case 1: return [[0, 1], [2, 3]];
    case 2: return [[0, 2], [1, 3]];
    case 3: return [[0, 3], [1, 2]];
    default: return [];
  }
}

// ─── POMOCNICZE: PROPAGACJA WYNIKÓW DO KOLEJNYCH RUND ────────────────────────

const R16_DATES = [
  `{Y}-06-19`, `{Y}-06-19`,
  `{Y}-06-20`, `{Y}-06-20`,
  `{Y}-06-21`, `{Y}-06-21`,
  `{Y}-06-22`, `{Y}-06-22`,
];
const QF_DATES = [
  `{Y}-06-23`, `{Y}-06-23`,
  `{Y}-06-24`, `{Y}-06-24`,
];

function propagateWinners(matches: WCKnockoutMatch[], year: number): WCKnockoutMatch[] {
  const byId = new Map(matches.map(m => [m.id, m]));
  let updated = [...matches];

  const yearStr = String(year);

  // Uzupełnij R16 z R32
  const r32Complete = updated.filter(m => m.round === 'R32' && m.winner);
  if (r32Complete.length === 16 && !updated.some(m => m.round === 'R16')) {
    for (let i = 0; i < 8; i++) {
      const m1 = updated.find(m => m.id === `R32_${String(i * 2 + 1).padStart(2,'0')}`);
      const m2 = updated.find(m => m.id === `R32_${String(i * 2 + 2).padStart(2,'0')}`);
      if (!m1?.winner || !m2?.winner) continue;
      updated.push({
        id: `R16_${String(i + 1).padStart(2,'0')}`,
        round: 'R16',
        home: m1.winner,
        away: m2.winner,
        date: R16_DATES[i].replace('{Y}', yearStr),
      });
    }
  }

  // Uzupełnij QF z R16
  const r16Complete = updated.filter(m => m.round === 'R16' && m.winner);
  if (r16Complete.length === 8 && !updated.some(m => m.round === 'QF')) {
    for (let i = 0; i < 4; i++) {
      const m1 = r16Complete.find(m => m.id === `R16_${String(i * 2 + 1).padStart(2,'0')}`);
      const m2 = r16Complete.find(m => m.id === `R16_${String(i * 2 + 2).padStart(2,'0')}`);
      if (!m1?.winner || !m2?.winner) continue;
      updated.push({
        id: `QF_${i + 1}`,
        round: 'QF',
        home: m1.winner,
        away: m2.winner,
        date: QF_DATES[i].replace('{Y}', yearStr),
      });
    }
  }

  // Uzupełnij SF z QF
  const qfComplete = updated.filter(m => m.round === 'QF' && m.winner);
  if (qfComplete.length === 4 && !updated.some(m => m.round === 'SF')) {
    const qf1 = qfComplete.find(m => m.id === 'QF_1');
    const qf2 = qfComplete.find(m => m.id === 'QF_2');
    const qf3 = qfComplete.find(m => m.id === 'QF_3');
    const qf4 = qfComplete.find(m => m.id === 'QF_4');
    if (qf1?.winner && qf2?.winner) {
      updated.push({ id: 'SF_1', round: 'SF', home: qf1.winner, away: qf2.winner, date: `${year}-06-26` });
    }
    if (qf3?.winner && qf4?.winner) {
      updated.push({ id: 'SF_2', round: 'SF', home: qf3.winner, away: qf4.winner, date: `${year}-06-27` });
    }
  }

  // Uzupełnij THIRD i FINAL z SF
  const sfComplete = updated.filter(m => m.round === 'SF' && m.winner);
  if (sfComplete.length === 2 && !updated.some(m => m.round === 'FINAL')) {
    const sf1 = sfComplete.find(m => m.id === 'SF_1');
    const sf2 = sfComplete.find(m => m.id === 'SF_2');
    const loser1 = sf1 ? (sf1.winner === sf1.home ? sf1.away : sf1.home) : null;
    const loser2 = sf2 ? (sf2.winner === sf2.home ? sf2.away : sf2.home) : null;
    if (loser1 && loser2) {
      updated.push({ id: 'THIRD_1', round: 'THIRD', home: loser1, away: loser2, date: `${year}-06-29` });
    }
    if (sf1?.winner && sf2?.winner) {
      updated.push({ id: 'FINAL_1', round: 'FINAL', home: sf1.winner, away: sf2.winner, date: `${year}-06-30` });
    }
  }

  return updated;
}
