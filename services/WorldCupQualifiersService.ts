import {
  NationalTeam,
  NTMatchResult,
  UefaNationalRankingState,
  WorldCupQualifiersFixture,
  WorldCupQualifiersGroup,
  WorldCupQualifiersPlayoffPath,
  WorldCupQualifiersState,
  WorldCupQualifiersTeamStanding,
} from '../types';
import { NTMatchDay } from '../resources/NationalTeamSchedule';
import { getWorldCupHostsForYear } from '../resources/WorldCupTournamentData';
import { UefaNationalRankingService } from './UefaNationalRankingService';

const GROUP_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const UEFA_WORLD_CUP_SLOTS = 16;

const MATCH_DATES = [
  { yearOffset: -1, day: 17, month: 2 },
  { yearOffset: -1, day: 20, month: 2 },
  { yearOffset: -1, day: 7, month: 5 },
  { yearOffset: -1, day: 11, month: 5 },
  { yearOffset: -1, day: 4, month: 8 },
  { yearOffset: -1, day: 7, month: 8 },
  { yearOffset: -1, day: 8, month: 9 },
  { yearOffset: -1, day: 11, month: 9 },
  { yearOffset: -1, day: 14, month: 10 },
  { yearOffset: -1, day: 17, month: 10 },
];
const FOUR_TEAM_GROUP_DATE_INDEXES = [4, 5, 6, 7, 8, 9];
const PLAYOFF_DATES = [
  { day: 17, month: 2 },
  { day: 20, month: 2 },
];

class Rng {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0 || 1;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  shuffle<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const uniqueTeams = (teams: string[]): string[] =>
  teams.filter((team, index, arr) => !!team && arr.indexOf(team) === index);

const emptyStanding = (teamName: string): WorldCupQualifiersTeamStanding => ({
  teamName,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
});

const compareStandings = (a: WorldCupQualifiersTeamStanding, b: WorldCupQualifiersTeamStanding): number =>
  b.points - a.points ||
  b.goalDifference - a.goalDifference ||
  b.goalsFor - a.goalsFor ||
  b.wins - a.wins ||
  a.teamName.localeCompare(b.teamName);

const isWorldCupYear = (year: number): boolean =>
  year >= 2026 && (year - 2026) % 4 === 0;

const getTournamentYearForDate = (date: Date): number => {
  let year = date.getFullYear();
  while (!isWorldCupYear(year)) year += 1;
  return year;
};

const getHostsForTournament = (tournamentYear: number, nationalTeams: NationalTeam[]): string[] => {
  // Host data comes from the shared WorldCupTournamentData module so UEFA
  // qualifiers, World Cup team assembly and match reports all agree on official
  // hosts through 2034 and deterministic generated hosts from 2038 onward.
  const hostNames = getWorldCupHostsForYear(tournamentYear);
  const available = new Map(nationalTeams.map(team => [normalize(team.name), team.name]));
  return hostNames
    .map(name => available.get(normalize(name)))
    .filter((name): name is string => !!name);
};

const getEuropeanHostsForTournament = (tournamentYear: number, nationalTeams: NationalTeam[]): string[] => {
  const europe = new Set(nationalTeams.filter(team => team.continent === 'Europe').map(team => team.name));
  return getHostsForTournament(tournamentYear, nationalTeams).filter(name => europe.has(name));
};

const pairKey = (home: string, away: string): string => `${home}__${away}`;

const buildPairPool = (teams: string[], rng: Rng): { home: string; away: string }[] => {
  const pairs: { home: string; away: string }[] = [];
  teams.forEach((home, homeIndex) => {
    teams.forEach((away, awayIndex) => {
      if (homeIndex !== awayIndex) pairs.push({ home, away });
    });
  });
  return rng.shuffle(pairs);
};

const createGroups = (
  rankedTeams: string[],
  europeanHosts: string[],
  seed: number
): WorldCupQualifiersGroup[] => {
  const rng = new Rng(seed ^ 0x2030);
  const hostSet = new Set(europeanHosts);
  const candidates = rankedTeams.filter(team => !hostSet.has(team));
  const fourTeamCapacity = GROUP_LABELS.length * 4;
  const fiveTeamGroupCount = Math.max(0, Math.min(GROUP_LABELS.length, candidates.length - fourTeamCapacity));
  const targetSizes = GROUP_LABELS.map((label, index) => ({
    id: label,
    targetSize: index < fiveTeamGroupCount ? 5 : 4,
    teams: [] as string[],
  }));

  // The amount of five-team groups is calculated from the actual UEFA field for
  // this World Cup cycle. 2030 removes Portugal and Spain as hosts, while later
  // cycles may have no European host at all. Computing capacity here prevents
  // future 2034/2038+ cycles from silently dropping ranked teams when the field
  // is larger than the 2030-specific 52-team setup.
  candidates.forEach(team => {
    const selected = targetSizes
      .filter(group => group.teams.length < group.targetSize)
      .sort((a, b) => b.targetSize - a.targetSize || a.teams.length - b.teams.length || a.id.localeCompare(b.id))[0];
    selected?.teams.push(team);
  });

  return targetSizes.map(group => ({
    id: group.id,
    teams: rng.shuffle(group.teams),
    hostTeams: [],
    standings: group.teams.map(emptyStanding),
  }));
};

const buildFixturesForGroup = (
  group: WorldCupQualifiersGroup,
  tournamentYear: number,
  seed: number
): WorldCupQualifiersFixture[] => {
  const rng = new Rng(seed ^ group.id.charCodeAt(0));
  const pairs = buildPairPool(group.teams, rng);
  const allowedDateIndexes = group.teams.length <= 4 ? FOUR_TEAM_GROUP_DATE_INDEXES : MATCH_DATES.map((_, index) => index);
  const fixtures: WorldCupQualifiersFixture[] = [];
  const usedPairs = new Set<string>();
  let round = 1;

  allowedDateIndexes.forEach(dateIndex => {
    const slot = MATCH_DATES[dateIndex];
    const usedTeams = new Set<string>();
    let matchesOnDate = 0;
    pairs.forEach(pair => {
      if (matchesOnDate >= Math.floor(group.teams.length / 2)) return;
      if (usedPairs.has(pairKey(pair.home, pair.away))) return;
      if (usedTeams.has(pair.home) || usedTeams.has(pair.away)) return;
      usedPairs.add(pairKey(pair.home, pair.away));
      usedTeams.add(pair.home);
      usedTeams.add(pair.away);
      fixtures.push({
        id: `WCQ_${tournamentYear}_${group.id}_R${round}_${matchesOnDate + 1}`,
        year: tournamentYear + slot.yearOffset,
        day: slot.day,
        month: slot.month,
        round,
        home: pair.home,
        away: pair.away,
        groupId: group.id,
        stage: 'GROUP_STAGE',
        played: false,
      });
      matchesOnDate += 1;
    });
    round += 1;
  });

  // This fallback should rarely be used, but it keeps the service robust if the
  // database gains or loses European teams. Any unassigned home/away pairing is
  // still placed in an existing international window, preserving the "use existing
  // calendar slots" rule instead of inventing new dates.
  pairs
    .filter(pair => !usedPairs.has(pairKey(pair.home, pair.away)))
    .forEach(pair => {
      const slot = MATCH_DATES[allowedDateIndexes[fixtures.length % allowedDateIndexes.length]];
      fixtures.push({
        id: `WCQ_${tournamentYear}_${group.id}_EX${fixtures.length + 1}`,
        year: tournamentYear + slot.yearOffset,
        day: slot.day,
        month: slot.month,
        round: Math.min(10, fixtures.length + 1),
        home: pair.home,
        away: pair.away,
        groupId: group.id,
        stage: 'GROUP_STAGE',
        played: false,
      });
    });

  return fixtures.sort((a, b) =>
    a.year - b.year || a.month - b.month || a.day - b.day || a.groupId.localeCompare(b.groupId)
  );
};

const getWinner = (result: NTMatchResult): string =>
  result.homePenaltyScore !== undefined && result.awayPenaltyScore !== undefined
    ? result.homePenaltyScore > result.awayPenaltyScore ? result.home : result.away
    : result.homeGoals >= result.awayGoals ? result.home : result.away;

const getLoser = (result: NTMatchResult): string =>
  getWinner(result) === result.home ? result.away : result.home;

const markFixturePlayed = (fixture: WorldCupQualifiersFixture, result: NTMatchResult): WorldCupQualifiersFixture => ({
  ...fixture,
  played: true,
  matchId: result.matchId,
  homeGoals: result.homeGoals,
  awayGoals: result.awayGoals,
  homePenaltyScore: result.homePenaltyScore,
  awayPenaltyScore: result.awayPenaltyScore,
  isExtraTime: result.isExtraTime,
  winner: getWinner(result),
  loser: getLoser(result),
});

const refreshStandings = (state: WorldCupQualifiersState, results: NTMatchResult[]): WorldCupQualifiersState => {
  if (results.length === 0) return state;
  const fixtures = state.fixtures.map(fixture => ({ ...fixture }));
  const groups = state.groups.map(group => ({
    ...group,
    standings: group.teams.map(emptyStanding),
  }));
  const standingsByGroup = new Map(groups.map(group => [group.id, new Map(group.standings.map(row => [row.teamName, row]))]));

  results.forEach(result => {
    const fixtureIndex = fixtures.findIndex(fixture =>
      !fixture.played &&
      fixture.home === result.home &&
      fixture.away === result.away &&
      fixture.groupId === result.group
    );
    if (fixtureIndex < 0) return;
    fixtures[fixtureIndex] = markFixturePlayed(fixtures[fixtureIndex], result);
  });

  fixtures.forEach(fixture => {
    if (fixture.stage !== 'GROUP_STAGE' || !fixture.played) return;
    if (fixture.homeGoals === undefined || fixture.awayGoals === undefined) return;
    const table = standingsByGroup.get(fixture.groupId);
    const home = table?.get(fixture.home);
    const away = table?.get(fixture.away);
    if (!home || !away) return;
    home.played += 1;
    away.played += 1;
    home.goalsFor += fixture.homeGoals;
    home.goalsAgainst += fixture.awayGoals;
    away.goalsFor += fixture.awayGoals;
    away.goalsAgainst += fixture.homeGoals;
    if (fixture.homeGoals > fixture.awayGoals) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (fixture.awayGoals > fixture.homeGoals) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  });

  return {
    ...state,
    fixtures,
    groups: groups.map(group => ({
      ...group,
      standings: [...group.standings].sort(compareStandings),
    })),
    lastUpdatedIso: new Date().toISOString(),
  };
};

const buildPathPlayoffData = (
  state: WorldCupQualifiersState,
  playoffTeams: string[],
  pathCount: number
): { paths: WorldCupQualifiersPlayoffPath[]; fixtures: WorldCupQualifiersFixture[] } => {
  const selectedTeams = playoffTeams.slice(0, pathCount * 4);
  const paths: WorldCupQualifiersPlayoffPath[] = [];
  const fixtures: WorldCupQualifiersFixture[] = [];
  for (let pathIndex = 0; pathIndex < pathCount; pathIndex += 1) {
    const teams = selectedTeams.slice(pathIndex * 4, pathIndex * 4 + 4);
    if (teams.length < 4) continue;
    const label = String.fromCharCode(65 + pathIndex);
    const id = `WCQ_PO_${state.tournamentYear}_${label}`;
    const sf1Id = `${id}_SF1`;
    const sf2Id = `${id}_SF2`;
    paths.push({
      id,
      label,
      mode: 'PATH',
      teams,
      semiFinalFixtureIds: [sf1Id, sf2Id],
    });
    fixtures.push(
      {
        id: sf1Id,
        year: state.tournamentYear,
        day: PLAYOFF_DATES[0].day,
        month: PLAYOFF_DATES[0].month,
        round: 1,
        home: teams[0],
        away: teams[3],
        groupId: label,
        stage: 'PLAYOFFS',
        playoffPathId: id,
        played: false,
      },
      {
        id: sf2Id,
        year: state.tournamentYear,
        day: PLAYOFF_DATES[0].day,
        month: PLAYOFF_DATES[0].month,
        round: 1,
        home: teams[1],
        away: teams[2],
        groupId: label,
        stage: 'PLAYOFFS',
        playoffPathId: id,
        played: false,
      }
    );
  }
  return { paths, fixtures };
};

const finalizeGroupStage = (
  state: WorldCupQualifiersState,
  rankingState?: UefaNationalRankingState | null
): WorldCupQualifiersState => {
  const winners = state.groups.map(group => group.standings[0]?.teamName).filter((team): team is string => !!team);
  const europeanHostCount = state.hostTeams.length;
  const playoffWinnerSlots = Math.max(0, UEFA_WORLD_CUP_SLOTS - europeanHostCount - winners.length);
  const qualifiedTeams = uniqueTeams([...state.hostTeams, ...winners]);
  const runnerUpRows = state.groups
    .map(group => group.standings[1])
    .filter((row): row is WorldCupQualifiersTeamStanding => !!row)
    .sort(compareStandings);
  const rankingFallback = (rankingState?.entries ?? [])
    .map(entry => entry.teamName)
    .filter(team => !qualifiedTeams.includes(team) && !runnerUpRows.some(row => row.teamName === team));

  // UEFA's real future format can change, so this model deliberately isolates the
  // playoff-pool decision. Today it seeds the best runners-up plus ranking fallback
  // teams into four-team paths; later it can be swapped for Nations League access
  // rules without changing match simulation, reports, or the World Cup assembler.
  const playoffTeams = uniqueTeams([...runnerUpRows.map(row => row.teamName), ...rankingFallback])
    .slice(0, playoffWinnerSlots * 4);
  const playoffData = buildPathPlayoffData(state, playoffTeams, playoffWinnerSlots);

  return {
    ...state,
    stage: playoffData.paths.length > 0 ? 'PLAYOFFS' : 'COMPLETE',
    directQualifiers: winners,
    hostReservedQualifiers: state.hostTeams,
    qualifiedTeams: playoffData.paths.length > 0 ? qualifiedTeams : uniqueTeams([...qualifiedTeams, ...playoffTeams]),
    playoffTeams,
    playoffPaths: playoffData.paths,
    fixtures: [...state.fixtures, ...playoffData.fixtures],
    completed: playoffData.paths.length === 0,
    lastUpdatedIso: new Date().toISOString(),
  };
};

const refreshPlayoffs = (state: WorldCupQualifiersState, results: NTMatchResult[]): WorldCupQualifiersState => {
  if (results.length === 0) return state;
  let fixtures = state.fixtures.map(fixture => ({ ...fixture }));
  results.forEach(result => {
    const fixtureIndex = fixtures.findIndex(fixture =>
      fixture.stage === 'PLAYOFFS' &&
      !fixture.played &&
      fixture.home === result.home &&
      fixture.away === result.away
    );
    if (fixtureIndex >= 0) fixtures[fixtureIndex] = markFixturePlayed(fixtures[fixtureIndex], result);
  });

  let playoffPaths = state.playoffPaths.map(path => ({ ...path }));
  const semiFixtures = fixtures.filter(fixture => fixture.stage === 'PLAYOFFS' && fixture.round === 1);
  const semiComplete = semiFixtures.length > 0 && semiFixtures.every(fixture => fixture.played);
  if (semiComplete) {
    const existingFinals = fixtures.filter(fixture => fixture.stage === 'PLAYOFFS' && fixture.round === 2);
    const finalFixtures: WorldCupQualifiersFixture[] = [];
    playoffPaths = playoffPaths.map(path => {
      if (path.finalFixtureId) return path;
      const semis = path.semiFinalFixtureIds
        .map(id => fixtures.find(fixture => fixture.id === id))
        .filter((fixture): fixture is WorldCupQualifiersFixture => !!fixture && !!fixture.winner);
      if (semis.length < 2) return path;
      const finalId = `${path.id}_FINAL`;
      if (!existingFinals.some(fixture => fixture.id === finalId)) {
        finalFixtures.push({
          id: finalId,
          year: state.tournamentYear,
          day: PLAYOFF_DATES[1].day,
          month: PLAYOFF_DATES[1].month,
          round: 2,
          home: semis[0].winner as string,
          away: semis[1].winner as string,
          groupId: path.label,
          stage: 'PLAYOFFS',
          playoffPathId: path.id,
          played: false,
        });
      }
      return { ...path, finalFixtureId: finalId };
    });
    fixtures = [...fixtures, ...finalFixtures];
  }

  const finalFixtures = fixtures.filter(fixture => fixture.stage === 'PLAYOFFS' && fixture.round === 2);
  const finalsComplete = finalFixtures.length > 0 && finalFixtures.every(fixture => fixture.played);
  if (finalsComplete) {
    playoffPaths = playoffPaths.map(path => {
      if (path.winner) return path;
      const finalFixture = fixtures.find(fixture => fixture.id === path.finalFixtureId);
      return finalFixture?.winner ? { ...path, winner: finalFixture.winner } : path;
    });
    const playoffWinners = playoffPaths.map(path => path.winner).filter((team): team is string => !!team);
    return {
      ...state,
      stage: 'COMPLETE',
      fixtures,
      playoffPaths,
      qualifiedTeams: uniqueTeams([...state.qualifiedTeams, ...playoffWinners]),
      completed: true,
      lastUpdatedIso: new Date().toISOString(),
    };
  }

  return {
    ...state,
    fixtures,
    playoffPaths,
    lastUpdatedIso: new Date().toISOString(),
  };
};

export const WorldCupQualifiersService = {
  isWorldCupYear,
  getHostsForTournament,
  getEuropeanHostsForTournament,

  isDrawDay(date: Date): boolean {
    const tournamentYear = date.getFullYear() + 2;
    return isWorldCupYear(tournamentYear) && tournamentYear >= 2030 && date.getMonth() === 11 && date.getDate() === 6;
  },

  isPotentialMatchDate(date: Date): boolean {
    const tournamentYear = getTournamentYearForDate(date);
    if (tournamentYear < 2030) return false;
    const isGroupDate = date.getFullYear() === tournamentYear - 1 && MATCH_DATES.some(slot =>
      slot.day === date.getDate() && slot.month === date.getMonth()
    );
    const isPlayoffDate = date.getFullYear() === tournamentYear && PLAYOFF_DATES.some(slot =>
      slot.day === date.getDate() && slot.month === date.getMonth()
    );
    return isGroupDate || isPlayoffDate;
  },

  createInitialState(
    nationalTeams: NationalTeam[],
    tournamentYear: number,
    rankingState?: UefaNationalRankingState | null
  ): WorldCupQualifiersState {
    const europe = nationalTeams.filter(team => team.continent === 'Europe' && team.name !== 'Rosja');
    const byNormalizedName = new Map(europe.map(team => [normalize(team.name), team.name]));
    const rankedTeams = uniqueTeams(
      UefaNationalRankingService.getRankedEuropeanTeams(rankingState, nationalTeams)
        .map(name => byNormalizedName.get(normalize(name)))
        .filter((name): name is string => !!name)
    );
    const hostTeams = getEuropeanHostsForTournament(tournamentYear, nationalTeams);
    const groups = createGroups(rankedTeams, hostTeams, tournamentYear);
    const fixtures = groups.flatMap(group => buildFixturesForGroup(group, tournamentYear, tournamentYear));
    return {
      tournamentYear,
      editionLabel: `MŚ ${tournamentYear}`,
      stage: 'GROUP_STAGE',
      drawCompleted: true,
      groups,
      fixtures,
      playoffPaths: [],
      hostTeams,
      qualifiedTeams: hostTeams,
      directQualifiers: [],
      hostReservedQualifiers: hostTeams,
      playoffTeams: [],
      completed: false,
      lastUpdatedIso: new Date().toISOString(),
    };
  },

  getMatchDayForDate(state: WorldCupQualifiersState | null, date: Date): NTMatchDay | null {
    if (!state || state.completed) return null;
    const fixtures = state.fixtures.filter(fixture =>
      !fixture.played &&
      fixture.year === date.getFullYear() &&
      fixture.day === date.getDate() &&
      fixture.month === date.getMonth()
    );
    if (fixtures.length === 0) return null;
    const round = fixtures[0].round;
    if (state.stage === 'PLAYOFFS') {
      const isFinal = fixtures.some(fixture => fixture.round === 2);
      return {
        day: date.getDate(),
        month: date.getMonth(),
        competitionLabel: `Eliminacje ${state.editionLabel} - Baraże ${isFinal ? 'finały' : 'półfinały'}`,
        matches: fixtures.map(fixture => ({
          home: fixture.home,
          away: fixture.away,
          group: fixture.groupId,
          competitionLabel: `Eliminacje ${state.editionLabel} - Baraż ${fixture.groupId} - ${fixture.round === 2 ? 'Finał' : 'Półfinał'}`,
          knockoutContext: { type: 'SINGLE_MATCH' as const },
        })),
      };
    }
    return {
      day: date.getDate(),
      month: date.getMonth(),
      competitionLabel: `Eliminacje ${state.editionLabel} - Kolejka ${round}`,
      matches: fixtures.map(fixture => ({
        home: fixture.home,
        away: fixture.away,
        group: fixture.groupId,
        competitionLabel: `Eliminacje ${state.editionLabel} - Grupa ${fixture.groupId} - Kolejka ${fixture.round}`,
      })),
    };
  },

  applyResults(
    state: WorldCupQualifiersState,
    results: NTMatchResult[],
    rankingState?: UefaNationalRankingState | null
  ): WorldCupQualifiersState {
    if (state.stage === 'PLAYOFFS') return refreshPlayoffs(state, results);
    const next = refreshStandings(state, results);
    const groupFixtures = next.fixtures.filter(fixture => (fixture.stage ?? 'GROUP_STAGE') === 'GROUP_STAGE');
    const allPlayed = groupFixtures.length > 0 && groupFixtures.every(fixture => fixture.played);
    return allPlayed ? finalizeGroupStage(next, rankingState) : next;
  },
};
