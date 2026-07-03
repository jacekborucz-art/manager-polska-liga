import {
  Coach,
  EuroQualifiersState,
  NationalTeam,
  Player,
  TrainingIntensity,
  WCGroup,
  WCGroupStanding,
  WCKnockoutMatch,
  WCPlayerEffect,
  WCState,
  WCTeam,
} from '../types';
import { simulateSinglePlayoffMatch, simulateWCGroupMatch } from './NationalTeamSimulator';
import { RecoveryService } from './RecoveryService';
import { computeGroupStandings } from './WorldCupService';
import { MatchHistoryService } from './MatchHistoryService';

interface EuroGroupDaySimulation {
  groups: WCGroup[];
  updatedPlayers?: Record<string, Player[]>;
}

interface EuroKnockoutDaySimulation {
  matches: WCKnockoutMatch[];
  updatedPlayers?: Record<string, Player[]>;
}

interface EuroTournamentSimulation {
  state: WCState;
  updatedPlayers?: Record<string, Player[]>;
}

class Rng {
  private s: number;
  constructor(seed: number) { this.s = (seed >>> 0) || 1; }
  next(): number { this.s = (this.s * 1664525 + 1013904223) >>> 0; return this.s / 0x100000000; }
  int(min: number, max: number): number { return Math.floor(this.next() * (max - min + 1)) + min; }
  shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
}

const strHash = (value: string): number => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = ((h << 5) - h + value.charCodeAt(i)) | 0;
  return h >>> 0;
};

const GROUP_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const GROUP_DAYS = [1, 3, 5, 7, 9, 11, 13, 15, 17];
const KNOCKOUT_DAYS = [20, 21, 24, 25, 28, 30];

const getGroupDaySchedule = (day: number): Array<{ groupLabel: string; round: number }> | null => {
  const index = GROUP_DAYS.indexOf(day);
  if (index < 0) return null;
  const round = Math.floor(index / 3) + 1;
  const dayInRound = index % 3;
  return GROUP_LABELS
    .slice(dayInRound * 2, dayInRound * 2 + 2)
    .map(groupLabel => ({ groupLabel, round }));
};

const getGroupRoundMatchups = (round: number): [number, number][] => {
  if (round === 1) return [[0, 1], [2, 3]];
  if (round === 2) return [[0, 2], [1, 3]];
  return [[0, 3], [1, 2]];
};

const dateStr = (year: number, day: number): string => `${year}-06-${String(day).padStart(2, '0')}`;

const compareStandings = (a: WCGroupStanding, b: WCGroupStanding): number =>
  b.pts - a.pts || (b.GF - b.GA) - (a.GF - a.GA) || b.GF - a.GF || a.name.localeCompare(b.name);

const propagateWinners = (matches: WCKnockoutMatch[], year: number): WCKnockoutMatch[] => {
  const updated = [...matches];
  const r16Complete = updated.filter(m => m.round === 'R16' && m.winner);
  if (r16Complete.length === 8 && !updated.some(m => m.round === 'QF')) {
    for (let i = 0; i < 4; i += 1) {
      const m1 = r16Complete.find(m => m.id === `R16_${String(i * 2 + 1).padStart(2, '0')}`);
      const m2 = r16Complete.find(m => m.id === `R16_${String(i * 2 + 2).padStart(2, '0')}`);
      if (m1?.winner && m2?.winner) {
        updated.push({ id: `QF_${i + 1}`, round: 'QF', home: m1.winner, away: m2.winner, date: dateStr(year, i < 2 ? 24 : 25) });
      }
    }
  }

  const qfComplete = updated.filter(m => m.round === 'QF' && m.winner);
  if (qfComplete.length === 4 && !updated.some(m => m.round === 'SF')) {
    const qf1 = qfComplete.find(m => m.id === 'QF_1');
    const qf2 = qfComplete.find(m => m.id === 'QF_2');
    const qf3 = qfComplete.find(m => m.id === 'QF_3');
    const qf4 = qfComplete.find(m => m.id === 'QF_4');
    if (qf1?.winner && qf2?.winner) updated.push({ id: 'SF_1', round: 'SF', home: qf1.winner, away: qf2.winner, date: dateStr(year, 28) });
    if (qf3?.winner && qf4?.winner) updated.push({ id: 'SF_2', round: 'SF', home: qf3.winner, away: qf4.winner, date: dateStr(year, 28) });
  }

  const sfComplete = updated.filter(m => m.round === 'SF' && m.winner);
  if (sfComplete.length === 2 && !updated.some(m => m.round === 'FINAL')) {
    const sf1 = sfComplete.find(m => m.id === 'SF_1');
    const sf2 = sfComplete.find(m => m.id === 'SF_2');
    if (sf1?.winner && sf2?.winner) {
      updated.push({ id: 'FINAL_1', round: 'FINAL', home: sf1.winner, away: sf2.winner, date: dateStr(year, 30) });
    }
  }

  return updated;
};

export const EuroTournamentService = {
  GROUP_DAYS,
  KNOCKOUT_DAYS,

  isEuroTournamentYear(year: number): boolean {
    return year >= 2028 && (year - 2028) % 4 === 0;
  },

  assembleTeams(
    nationalTeams: NationalTeam[],
    euroQualifiersState: EuroQualifiersState | null,
    year: number,
    seed: number
  ): WCTeam[] {
    const rng = new Rng(seed ^ strHash(`EURO_TEAMS_${year}`));
    const used = new Set<string>();
    const teams: WCTeam[] = [];
    const byName = new Map(nationalTeams.map(team => [team.name, team]));
    const hostSet = new Set(euroQualifiersState?.hostTeams ?? []);
    const sourceNames = euroQualifiersState?.tournamentYear === year && euroQualifiersState.qualifiedTeams.length > 0
      ? euroQualifiersState.qualifiedTeams
      : [];

    const add = (name: string) => {
      if (used.has(name) || name === 'Rosja') return;
      const nt = byName.get(name);
      if (!nt || nt.continent !== 'Europe') return;
      used.add(name);
      teams.push({
        name,
        confederation: 'UEFA',
        reputation: nt.reputation ?? 10,
        colors: nt.colorsHex ?? ['#2563eb', '#ffffff', '#1d4ed8'],
        isHost: hostSet.has(name),
      });
    };

    sourceNames.forEach(add);
    const fallback = rng.shuffle(
      nationalTeams
        .filter(team => team.continent === 'Europe' && team.name !== 'Rosja' && !used.has(team.name))
        .sort((a, b) => (b.reputation ?? 0) - (a.reputation ?? 0))
        .slice(0, 32)
    );
    fallback.forEach(team => add(team.name));

    return teams
      .sort((a, b) => Number(b.isHost) - Number(a.isHost) || b.reputation - a.reputation || a.name.localeCompare(b.name))
      .slice(0, 24);
  },

  drawGroups(teams: WCTeam[], seed: number, year: number): WCGroup[] {
    const rng = new Rng(seed ^ strHash(`EURO_DRAW_${year}`));
    const sorted = [...teams].sort((a, b) => Number(b.isHost) - Number(a.isHost) || b.reputation - a.reputation);
    const pots = [
      sorted.slice(0, 6),
      rng.shuffle(sorted.slice(6, 12)),
      rng.shuffle(sorted.slice(12, 18)),
      rng.shuffle(sorted.slice(18, 24)),
    ];
    const groupTeams = GROUP_LABELS.map(() => [] as string[]);
    pots.forEach(pot => pot.forEach((team, index) => groupTeams[index]?.push(team.name)));
    return GROUP_LABELS.map((label, index) => ({ label, teams: groupTeams[index], matches: [] }));
  },

  createInitialState(teams: WCTeam[], groups: WCGroup[], year: number): WCState {
    return {
      year,
      teams,
      groups,
      knockoutMatches: [],
      playerEffects: [],
      groupStageComplete: false,
      knockoutComplete: false,
      drawComplete: true,
    };
  },

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
  ): EuroGroupDaySimulation {
    if (month !== 6) return { groups, updatedPlayers: players };
    const schedule = getGroupDaySchedule(day);
    if (!schedule) return { groups, updatedPlayers: players };
    const newGroups = groups.map(group => ({ ...group, matches: [...group.matches] }));
    let updatedPlayers = players;
    const matchDate = new Date(year, month - 1, day);

    schedule.forEach(({ groupLabel, round }) => {
      const groupIndex = newGroups.findIndex(group => group.label === groupLabel);
      if (groupIndex < 0) return;
      const group = newGroups[groupIndex];
      getGroupRoundMatchups(round).forEach(([homeIndex, awayIndex]) => {
        const home = group.teams[homeIndex];
        const away = group.teams[awayIndex];
        if (!home || !away) return;
        const existing = group.matches.some(match => match.home === home && match.away === away);
        if (existing) return;
        const matchSeed = seed ^ strHash(`EURO_GROUP_${year}_${groupLabel}_${round}_${home}_${away}`);
        const result = nationalTeams && updatedPlayers && coaches
          ? simulateWCGroupMatch(home, away, matchDate, matchSeed, nationalTeams, updatedPlayers, coaches)
          : { homeGoals: 0, awayGoals: 0, goals: [], cards: [] };
        updatedPlayers = result.updatedPlayers ?? updatedPlayers;
        if (result.matchHistoryEntry) {
          MatchHistoryService.logMatch({
            ...result.matchHistoryEntry,
            competition: 'UEFA EURO',
          });
        }
        group.matches.push({
          matchId: result.matchId,
          home,
          away,
          homeGoals: result.homeGoals,
          awayGoals: result.awayGoals,
          date: dateStr(year, day),
          goals: result.goals,
          cards: result.cards,
          venue: result.venue,
          attendance: result.attendance,
          weather: result.weather,
          refereeName: result.refereeName,
        });
      });
    });

    return { groups: newGroups, updatedPlayers };
  },

  buildKnockoutBracket(groups: WCGroup[], year: number): WCKnockoutMatch[] {
    const rankedGroups = groups.map(group => ({
      label: group.label,
      standings: computeGroupStandings(group),
    }));
    const qualified = [
      ...rankedGroups.flatMap(group => group.standings.slice(0, 2).map(row => ({ ...row, source: group.label }))),
      ...rankedGroups
        .map(group => group.standings[2] ? { ...group.standings[2], source: group.label } : null)
        .filter((row): row is WCGroupStanding & { source: string } => !!row)
        .sort(compareStandings)
        .slice(0, 4),
    ].sort(compareStandings);

    const pairs = [
      [0, 15], [7, 8], [3, 12], [4, 11],
      [1, 14], [6, 9], [2, 13], [5, 10],
    ];
    return pairs.map(([homeIndex, awayIndex], index) => ({
      id: `R16_${String(index + 1).padStart(2, '0')}`,
      round: 'R16',
      home: qualified[homeIndex]?.name ?? null,
      away: qualified[awayIndex]?.name ?? null,
      date: dateStr(year, index < 4 ? 20 : 21),
    }));
  },

  simulateKnockoutDay(
    euroState: WCState,
    teams: WCTeam[],
    day: number,
    month: number,
    year: number,
    seed: number,
    nationalTeams?: NationalTeam[],
    players?: Record<string, Player[]>,
    coaches?: Record<string, Coach>
  ): EuroKnockoutDaySimulation {
    if (month !== 6) return { matches: euroState.knockoutMatches, updatedPlayers: players };
    const targetDate = dateStr(year, day);
    let updatedPlayers = players;
    const matchDate = new Date(year, month - 1, day);

    const matches = euroState.knockoutMatches.map(match => {
      if (match.date !== targetDate || match.winner || !match.home || !match.away) return match;
      const matchSeed = seed ^ strHash(`EURO_KO_${match.id}_${match.home}_${match.away}`);
      if (nationalTeams && updatedPlayers && coaches) {
        const result = simulateSinglePlayoffMatch(match.home, match.away, 'UEFA EURO', matchDate, matchSeed, nationalTeams, updatedPlayers, coaches, year);
        updatedPlayers = result.updatedPlayers ?? updatedPlayers;
        if (result.matchHistoryEntry) MatchHistoryService.logMatch(result.matchHistoryEntry);
        const wentToET = result.homeGoals === result.awayGoals;
        const wentToPenalties = result.penaltyWinner !== undefined;
        const winner = result.penaltyWinner
          ?? (wentToET
            ? ((result.homeGoalsAET ?? 0) > (result.awayGoalsAET ?? 0) ? match.home : match.away)
            : (result.homeGoals > result.awayGoals ? match.home : match.away));
        return {
          ...match,
          matchId: result.matchHistoryEntry?.matchId,
          homeGoals: result.homeGoals,
          awayGoals: result.awayGoals,
          homeGoalsAET: result.homeGoalsAET,
          awayGoalsAET: result.awayGoalsAET,
          homePenalties: result.homePenaltyGoals,
          awayPenalties: result.awayPenaltyGoals,
          wentToET,
          wentToPenalties,
          winner,
          goals: result.goals,
          cards: result.cards,
          venue: result.venue,
          attendance: result.attendance,
          weather: result.weather,
          refereeName: result.refereeName,
        };
      }
      return match;
    });

    return { matches: propagateWinners(matches, year), updatedPlayers };
  },

  simulateFullTournament(
    euroState: WCState,
    seed: number,
    nationalTeams?: NationalTeam[],
    players?: Record<string, Player[]>,
    coaches?: Record<string, Coach>
  ): EuroTournamentSimulation {
    let state = { ...euroState };
    let updatedPlayers = players;
    let previousMatchDate: Date | null = null;
    const recoverBeforeMatchDay = (day: number) => {
      const matchDate = new Date(state.year, 5, day);
      if (updatedPlayers && previousMatchDate) {
        const daysBetween = Math.max(1, Math.round((matchDate.getTime() - previousMatchDate.getTime()) / 86_400_000));
        updatedPlayers = RecoveryService.applyDailyRecovery(updatedPlayers, matchDate, TrainingIntensity.NORMAL, daysBetween);
      }
      previousMatchDate = matchDate;
    };

    GROUP_DAYS.forEach(day => {
      recoverBeforeMatchDay(day);
      const simulation = EuroTournamentService.simulateGroupDay(state.groups, state.teams, day, 6, state.year, seed, nationalTeams, updatedPlayers, coaches);
      updatedPlayers = simulation.updatedPlayers ?? updatedPlayers;
      state = { ...state, groups: simulation.groups };
    });
    state = { ...state, groupStageComplete: true, knockoutMatches: EuroTournamentService.buildKnockoutBracket(state.groups, state.year) };

    KNOCKOUT_DAYS.forEach(day => {
      recoverBeforeMatchDay(day);
      const simulation = EuroTournamentService.simulateKnockoutDay(state, state.teams, day, 6, state.year, seed, nationalTeams, updatedPlayers, coaches);
      updatedPlayers = simulation.updatedPlayers ?? updatedPlayers;
      state = { ...state, knockoutMatches: simulation.matches };
    });

    const finalMatch = state.knockoutMatches.find(match => match.round === 'FINAL');
    state = {
      ...state,
      knockoutComplete: true,
      champion: finalMatch?.winner,
      runnerUp: finalMatch?.winner === finalMatch?.home ? finalMatch?.away : finalMatch?.home,
    };

    return { state, updatedPlayers };
  },

  computePlayerEffects(euroState: WCState, players: Player[], seed: number): WCPlayerEffect[] {
    const rng = new Rng(seed ^ strHash(`EURO_EFFECTS_${euroState.year}`));
    const effects: WCPlayerEffect[] = [];
    if (!euroState.knockoutComplete) return effects;

    players.forEach(player => {
      const ntName = player.nationality;
      if (!ntName) return;
      const groupMatchCount = euroState.groups.flatMap(group => group.matches).filter(match => match.home === ntName || match.away === ntName).length;
      const koMatchCount = euroState.knockoutMatches.filter(match => match.winner && (match.home === ntName || match.away === ntName)).length;
      const totalMatches = groupMatchCount + koMatchCount;
      if (totalMatches >= 6) effects.push({ playerId: player.id, type: 'FATIGUE', value: 8 });
      else if (totalMatches >= 4) effects.push({ playerId: player.id, type: 'FATIGUE', value: 4 });
      if (ntName === euroState.champion && rng.next() < 0.45) effects.push({ playerId: player.id, type: 'MORALE_BOOST', value: 12 });
    });

    return effects;
  },
};
