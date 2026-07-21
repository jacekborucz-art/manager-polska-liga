import {
  EuroHostAnnouncement,
  EuroQualifiersFixture,
  EuroQualifiersGroup,
  EuroQualifiersPlayoffPath,
  EuroQualifiersState,
  EuroQualifiersTeamStanding,
  NationalTeam,
  NationsLeagueState,
  NTMatchResult,
  UefaNationalRankingState,
} from '../types';
import { NTMatchDay } from '../resources/NationalTeamSchedule';
import { UefaNationalRankingService } from './UefaNationalRankingService';

const GROUP_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const EURO_HOSTS_BY_YEAR: Record<number, string[]> = {
  2028: ['Anglia', 'Irlandia', 'Szkocja', 'Walia'],
  2032: ['Turcja', 'Włochy'],
  2036: ['Szwecja', 'Norwegia'],
};
const EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE = 6;
const FIVE_TEAM_GROUP_COUNT = 6;
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
const LEGACY_GROUP_RECOVERY_DAYS = [18, 19, 20, 21];

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

const EMPTY_STANDING = (teamName: string): EuroQualifiersTeamStanding => ({
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

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const uniqueTeams = (teams: string[]): string[] =>
  teams.filter((team, index, arr) => !!team && arr.indexOf(team) === index);

const isEuroTournamentYear = (year: number): boolean =>
  year >= 2028 && (year - 2028) % 4 === 0;

const getTournamentYearForDate = (date: Date): number => {
  let year = date.getFullYear();
  while (!isEuroTournamentYear(year)) year += 1;
  return year;
};

const getHostsForTournament = (tournamentYear: number, nationalTeams: NationalTeam[]): string[] => {
  const hostNames = EURO_HOSTS_BY_YEAR[tournamentYear] ?? [];
  if (hostNames.length === 0) return [];
  const available = new Map(nationalTeams.map(team => [normalize(team.name), team.name]));
  return hostNames
    .map(name => available.get(normalize(name)))
    .filter((name): name is string => !!name);
};

const getAnnouncedHostsForTournament = (
  tournamentYear: number,
  nationalTeams: NationalTeam[],
  hostAnnouncements: EuroHostAnnouncement[] = []
): string[] => {
  const announced = hostAnnouncements.find(entry => entry.tournamentYear === tournamentYear)?.hosts ?? [];
  if (announced.length > 0) {
    const available = new Map(nationalTeams.map(team => [normalize(team.name), team.name]));
    return announced
      .map(name => available.get(normalize(name)))
      .filter((name): name is string => !!name);
  }
  return getHostsForTournament(tournamentYear, nationalTeams);
};

const createHostAnnouncement = (
  nationalTeams: NationalTeam[],
  tournamentYear: number,
  existingAnnouncements: EuroHostAnnouncement[] = []
): EuroHostAnnouncement => {
  const presetHosts = getHostsForTournament(tournamentYear, nationalTeams);
  if (presetHosts.length > 0) {
    return {
      tournamentYear,
      hosts: presetHosts,
      announcedIso: new Date(tournamentYear - EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE, 11, 6).toISOString(),
    };
  }

  const recentlyHosted = new Set(
    existingAnnouncements
      .filter(entry => entry.tournamentYear < tournamentYear && entry.tournamentYear >= tournamentYear - 12)
      .flatMap(entry => entry.hosts)
  );
  const rng = new Rng(tournamentYear ^ 0xe0a40);
  const candidates = nationalTeams
    .filter(team => team.continent === 'Europe' && team.name !== 'Rosja' && !recentlyHosted.has(team.name))
    .sort((a, b) => {
      const bScore = (b.reputation ?? 0) * 100000 + (b.capacity ?? 0);
      const aScore = (a.reputation ?? 0) * 100000 + (a.capacity ?? 0);
      return bScore - aScore || a.name.localeCompare(b.name);
    });
  const fallbackCandidates = nationalTeams
    .filter(team => team.continent === 'Europe' && team.name !== 'Rosja')
    .sort((a, b) => (b.reputation ?? 0) - (a.reputation ?? 0) || a.name.localeCompare(b.name));
  const pool = candidates.length >= 2 ? candidates : fallbackCandidates;
  const hostCountRoll = rng.next();
  const hostCount = hostCountRoll < 0.18 ? 1 : hostCountRoll < 0.92 ? 2 : 4;
  const hosts = rng.shuffle(pool.slice(0, Math.max(12, hostCount * 4))).slice(0, hostCount).map(team => team.name);

  return {
    tournamentYear,
    hosts,
    announcedIso: new Date(tournamentYear - EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE, 11, 6).toISOString(),
  };
};

const buildBlockedDates = (nationsLeagueState?: NationsLeagueState | null): Map<string, Set<string>> => {
  const blocked = new Map<string, Set<string>>();
  (nationsLeagueState?.fixtures ?? [])
    .filter(fixture => !fixture.played)
    .forEach(fixture => {
      const key = `${fixture.day}-${fixture.month}`;
      if (!blocked.has(key)) blocked.set(key, new Set());
      blocked.get(key)?.add(fixture.home);
      blocked.get(key)?.add(fixture.away);
    });
  return blocked;
};

const hasDateBlock = (blocked: Map<string, Set<string>>, day: number, month: number, team: string): boolean =>
  blocked.get(`${day}-${month}`)?.has(team) ?? false;

const isLegacyGroupRecoveryDate = (date: Date, tournamentYear: number): boolean =>
  date.getFullYear() === tournamentYear - 1 &&
  date.getMonth() === 10 &&
  LEGACY_GROUP_RECOVERY_DAYS.includes(date.getDate());

const getTimeForFixture = (fixture: EuroQualifiersFixture): number =>
  new Date(fixture.year, fixture.month, fixture.day).getTime();

const getGroupStageCutoffTime = (state: EuroQualifiersState): number => {
  const groupFixtureTimes = state.fixtures
    .filter(fixture => (fixture.stage ?? 'GROUP_STAGE') === 'GROUP_STAGE')
    .map(getTimeForFixture);
  const latestScheduledTime = groupFixtureTimes.length > 0
    ? Math.max(...groupFixtureTimes)
    : new Date(state.tournamentYear - 1, 10, 17).getTime();
  const latestRecoveryTime = new Date(
    state.tournamentYear - 1,
    10,
    Math.max(...LEGACY_GROUP_RECOVERY_DAYS)
  ).getTime();
  return Math.max(latestScheduledTime, latestRecoveryTime);
};

const shouldForceResolveGroupStage = (state: EuroQualifiersState, date: Date): boolean =>
  state.stage === 'GROUP_STAGE' &&
  state.drawCompleted &&
  date.getTime() > getGroupStageCutoffTime(state);

const countBlockedMatchDates = (blocked: Map<string, Set<string>>, team: string): number =>
  MATCH_DATES.filter(slot => hasDateBlock(blocked, slot.day, slot.month, team)).length;

const createGroups = (
  rankedTeams: string[],
  hostTeams: string[],
  blocked: Map<string, Set<string>>,
  seed: number
): EuroQualifiersGroup[] => {
  const rng = new Rng(seed ^ 0xe2028);
  const targetSizes = GROUP_LABELS.map((label, index) => ({
    id: label,
    targetSize: index < FIVE_TEAM_GROUP_COUNT ? 5 : 4,
    teams: [] as string[],
    hostTeams: [] as string[],
  }));
  const hostSet = new Set(hostTeams);
  const blockedScore = new Map(rankedTeams.map(team => [team, countBlockedMatchDates(blocked, team)]));
  const ordered = uniqueTeams([
    ...hostTeams,
    ...rankedTeams
      .filter(team => !hostSet.has(team))
      .sort((a, b) => (blockedScore.get(b) ?? 0) - (blockedScore.get(a) ?? 0)),
  ]);

  ordered.forEach(team => {
    const isHost = hostSet.has(team);
    const prefersSmallGroup = isHost || (blockedScore.get(team) ?? 0) > 0;
    const candidates = targetSizes
      .filter(group => group.teams.length < group.targetSize)
      .filter(group => !isHost || group.hostTeams.length === 0)
      .sort((a, b) => {
        const aSmall = a.targetSize === 4 ? 0 : 1;
        const bSmall = b.targetSize === 4 ? 0 : 1;
        const groupSizePreference = prefersSmallGroup ? aSmall - bSmall : b.targetSize - a.targetSize;
        return groupSizePreference || a.teams.length - b.teams.length || a.id.localeCompare(b.id);
      });
    const selected = candidates[0] ?? targetSizes.find(group => group.teams.length < group.targetSize);
    if (!selected) return;
    selected.teams.push(team);
    if (isHost) selected.hostTeams.push(team);
  });

  return targetSizes.map(group => ({
    id: group.id,
    teams: rng.shuffle(group.teams),
    hostTeams: group.hostTeams,
    standings: group.teams.map(EMPTY_STANDING),
  }));
};

interface RoundRobinPair {
  home: string;
  away: string;
}

const buildRoundRobinRounds = (teams: string[], rng: Rng): RoundRobinPair[][] => {
  const shuffled = rng.shuffle(teams);
  const rotation: Array<string | null> = shuffled.length % 2 === 0 ? shuffled : [...shuffled, null];
  const firstLeg: RoundRobinPair[][] = [];

  for (let roundIndex = 0; roundIndex < rotation.length - 1; roundIndex += 1) {
    const matches: RoundRobinPair[] = [];
    for (let pairIndex = 0; pairIndex < rotation.length / 2; pairIndex += 1) {
      const first = rotation[pairIndex];
      const second = rotation[rotation.length - 1 - pairIndex];
      if (!first || !second) continue;
      const reverse = (roundIndex + pairIndex) % 2 === 1;
      matches.push(reverse ? { home: second, away: first } : { home: first, away: second });
    }
    firstLeg.push(matches);
    rotation.splice(1, 0, rotation.pop() as string | null);
  }

  const secondLeg = firstLeg.map(round => round.map(match => ({ home: match.away, away: match.home })));
  return [...firstLeg, ...secondLeg];
};

const assignRoundsToDates = (
  rounds: RoundRobinPair[][],
  allowedDateIndexes: number[],
  blocked: Map<string, Set<string>>
): RoundRobinPair[][] | null => {
  const assigned: Array<RoundRobinPair[] | undefined> = new Array(allowedDateIndexes.length);
  const usedRounds = new Set<number>();

  const isCompatible = (round: RoundRobinPair[], dateIndex: number): boolean => {
    const slot = MATCH_DATES[allowedDateIndexes[dateIndex]];
    return round.every(match =>
      !hasDateBlock(blocked, slot.day, slot.month, match.home) &&
      !hasDateBlock(blocked, slot.day, slot.month, match.away)
    );
  };

  const fill = (): boolean => {
    if (usedRounds.size === rounds.length) return true;

    let selectedDateIndex = -1;
    let selectedCandidates: number[] = [];
    for (let dateIndex = 0; dateIndex < allowedDateIndexes.length; dateIndex += 1) {
      if (assigned[dateIndex]) continue;
      const candidates = rounds
        .map((_, roundIndex) => roundIndex)
        .filter(roundIndex => !usedRounds.has(roundIndex) && isCompatible(rounds[roundIndex], dateIndex));
      if (candidates.length === 0) return false;
      if (selectedDateIndex < 0 || candidates.length < selectedCandidates.length) {
        selectedDateIndex = dateIndex;
        selectedCandidates = candidates;
      }
    }

    for (const roundIndex of selectedCandidates) {
      assigned[selectedDateIndex] = rounds[roundIndex];
      usedRounds.add(roundIndex);
      if (fill()) return true;
      usedRounds.delete(roundIndex);
      assigned[selectedDateIndex] = undefined;
    }
    return false;
  };

  return fill() ? assigned as RoundRobinPair[][] : null;
};

const buildFixturesForGroup = (
  group: EuroQualifiersGroup,
  tournamentYear: number,
  blocked: Map<string, Set<string>>,
  seed: number
): EuroQualifiersFixture[] => {
  const rng = new Rng(seed ^ group.id.charCodeAt(0));
  const allowedDateIndexes = group.teams.length <= 4 ? FOUR_TEAM_GROUP_DATE_INDEXES : MATCH_DATES.map((_, index) => index);
  const generatedRounds = buildRoundRobinRounds(group.teams, rng);
  const scheduledRounds = assignRoundsToDates(generatedRounds, allowedDateIndexes, blocked) ?? generatedRounds;

  return scheduledRounds.flatMap((matches, roundIndex) => {
    const slot = MATCH_DATES[allowedDateIndexes[roundIndex]];
    return matches.map((match, matchIndex) => ({
      id: `EUROQ_${tournamentYear}_${group.id}_R${roundIndex + 1}_${matchIndex + 1}`,
      year: tournamentYear + slot.yearOffset,
      day: slot.day,
      month: slot.month,
      round: roundIndex + 1,
      home: match.home,
      away: match.away,
      groupId: group.id,
      stage: 'GROUP_STAGE' as const,
      played: false,
    }));
  });
};

const compareStandings = (a: EuroQualifiersTeamStanding, b: EuroQualifiersTeamStanding): number =>
  b.points - a.points ||
  b.goalDifference - a.goalDifference ||
  b.goalsFor - a.goalsFor ||
  b.wins - a.wins ||
  a.teamName.localeCompare(b.teamName);

const getWinner = (result: NTMatchResult): string =>
  result.homePenaltyScore !== undefined && result.awayPenaltyScore !== undefined
    ? result.homePenaltyScore > result.awayPenaltyScore ? result.home : result.away
    : result.homeGoals >= result.awayGoals ? result.home : result.away;

const getLoser = (result: NTMatchResult): string =>
  getWinner(result) === result.home ? result.away : result.home;

const markFixturePlayed = (fixture: EuroQualifiersFixture, result: NTMatchResult): EuroQualifiersFixture => ({
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

const resolveAggregateWinner = (
  firstLeg: EuroQualifiersFixture,
  secondLeg: EuroQualifiersFixture
): { winner?: string; loser?: string } => {
  if (
    firstLeg.homeGoals === undefined ||
    firstLeg.awayGoals === undefined ||
    secondLeg.homeGoals === undefined ||
    secondLeg.awayGoals === undefined
  ) {
    return {};
  }
  const aggregateFirstLegHome = firstLeg.homeGoals + secondLeg.awayGoals;
  const aggregateFirstLegAway = firstLeg.awayGoals + secondLeg.homeGoals;
  if (aggregateFirstLegHome > aggregateFirstLegAway) return { winner: firstLeg.home, loser: firstLeg.away };
  if (aggregateFirstLegAway > aggregateFirstLegHome) return { winner: firstLeg.away, loser: firstLeg.home };
  if (secondLeg.homePenaltyScore !== undefined && secondLeg.awayPenaltyScore !== undefined) {
    const winner = secondLeg.homePenaltyScore > secondLeg.awayPenaltyScore ? secondLeg.home : secondLeg.away;
    return { winner, loser: winner === firstLeg.home ? firstLeg.away : firstLeg.home };
  }
  return { winner: secondLeg.winner, loser: secondLeg.loser };
};

const refreshStandings = (state: EuroQualifiersState, results: NTMatchResult[]): EuroQualifiersState => {
  const fixtures = state.fixtures.map(fixture => ({ ...fixture }));
  const groups = state.groups.map(group => ({
    ...group,
    standings: group.teams.map(EMPTY_STANDING),
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

const bestRows = (rows: EuroQualifiersTeamStanding[]): EuroQualifiersTeamStanding[] =>
  [...rows].sort(compareStandings);

const buildPathPlayoffData = (
  state: EuroQualifiersState,
  playoffTeams: string[],
  pathCount: number
): { paths: EuroQualifiersPlayoffPath[]; fixtures: EuroQualifiersFixture[] } => {
  const selectedTeams = playoffTeams.slice(0, pathCount * 4);
  const paths: EuroQualifiersPlayoffPath[] = [];
  const fixtures: EuroQualifiersFixture[] = [];
  for (let pathIndex = 0; pathIndex < pathCount; pathIndex += 1) {
    const teams = selectedTeams.slice(pathIndex * 4, pathIndex * 4 + 4);
    if (teams.length < 4) continue;
    const label = String.fromCharCode(65 + pathIndex);
    const id = `EUROQ_PO_${state.tournamentYear}_${label}`;
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

const buildTiePlayoffData = (
  state: EuroQualifiersState,
  playoffTeams: string[]
): { paths: EuroQualifiersPlayoffPath[]; fixtures: EuroQualifiersFixture[] } => {
  const selectedTeams = playoffTeams.slice(0, 8);
  const paths: EuroQualifiersPlayoffPath[] = [];
  const fixtures: EuroQualifiersFixture[] = [];
  for (let tieIndex = 0; tieIndex < 4; tieIndex += 1) {
    const homeSeed = selectedTeams[tieIndex];
    const awaySeed = selectedTeams[selectedTeams.length - 1 - tieIndex];
    if (!homeSeed || !awaySeed) continue;
    const label = String.fromCharCode(65 + tieIndex);
    const id = `EUROQ_PO_${state.tournamentYear}_${label}`;
    const firstLegId = `${id}_L1`;
    const secondLegId = `${id}_L2`;
    paths.push({
      id,
      label,
      mode: 'TIE',
      teams: [homeSeed, awaySeed],
      semiFinalFixtureIds: [],
      tieFixtureIds: [firstLegId, secondLegId],
    });
    fixtures.push(
      {
        id: firstLegId,
        year: state.tournamentYear,
        day: PLAYOFF_DATES[0].day,
        month: PLAYOFF_DATES[0].month,
        round: 1,
        home: awaySeed,
        away: homeSeed,
        groupId: label,
        stage: 'PLAYOFFS',
        playoffPathId: id,
        played: false,
      },
      {
        id: secondLegId,
        year: state.tournamentYear,
        day: PLAYOFF_DATES[1].day,
        month: PLAYOFF_DATES[1].month,
        round: 2,
        home: homeSeed,
        away: awaySeed,
        groupId: label,
        stage: 'PLAYOFFS',
        playoffPathId: id,
        played: false,
      }
    );
  }
  return { paths, fixtures };
};

const finalizeGroupStage = (state: EuroQualifiersState, rankingState?: UefaNationalRankingState | null): EuroQualifiersState => {
  const winners = state.groups.map(group => group.standings[0]?.teamName).filter((team): team is string => !!team);
  const runnersUp = bestRows(state.groups.map(group => group.standings[1]).filter((row): row is EuroQualifiersTeamStanding => !!row));
  const directRunnersUp = runnersUp.slice(0, 8).map(row => row.teamName);
  const directQualifiers = uniqueTeams([...winners, ...directRunnersUp]);
  const hostReservedQualifiers = state.hostTeams
    .filter(team => !directQualifiers.includes(team))
    .sort((a, b) =>
      (rankingState?.entries.find(entry => entry.teamName === a)?.rank ?? 999) -
      (rankingState?.entries.find(entry => entry.teamName === b)?.rank ?? 999)
    )
    .slice(0, 2);
  const qualifiedTeams = uniqueTeams([...directQualifiers, ...hostReservedQualifiers]);
  const runnerUpPlayoffPool = runnersUp.slice(8).map(row => row.teamName);
  const rankingFallback = (rankingState?.entries ?? [])
    .map(entry => entry.teamName)
    .filter(team => !qualifiedTeams.includes(team) && !runnerUpPlayoffPool.includes(team));
  const remainingSlots = Math.max(0, 24 - qualifiedTeams.length);
  const usesTwoLeggedTies = hostReservedQualifiers.length === 0;
  const playoffTeamCount = usesTwoLeggedTies ? 8 : remainingSlots * 4;
  const playoffTeams = uniqueTeams([...runnerUpPlayoffPool, ...rankingFallback]).slice(0, playoffTeamCount);
  const playoffData = usesTwoLeggedTies
    ? buildTiePlayoffData(state, playoffTeams)
    : buildPathPlayoffData(state, playoffTeams, remainingSlots);

  return {
    ...state,
    stage: 'PLAYOFFS',
    directQualifiers,
    hostReservedQualifiers,
    qualifiedTeams,
    playoffTeams,
    playoffPaths: playoffData.paths,
    fixtures: [
      ...state.fixtures.filter(fixture => (fixture.stage ?? 'GROUP_STAGE') === 'GROUP_STAGE'),
      ...playoffData.fixtures,
    ],
    completed: false,
    lastUpdatedIso: new Date().toISOString(),
  };
};

const refreshPlayoffs = (state: EuroQualifiersState, results: NTMatchResult[]): EuroQualifiersState => {
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
  const tiePaths = playoffPaths.filter(path => path.mode === 'TIE');
  if (tiePaths.length > 0) {
    playoffPaths = playoffPaths.map(path => {
      if (path.mode !== 'TIE' || path.winner) return path;
      const [firstLegId, secondLegId] = path.tieFixtureIds ?? [];
      const firstLeg = fixtures.find(fixture => fixture.id === firstLegId);
      const secondLeg = fixtures.find(fixture => fixture.id === secondLegId);
      if (!firstLeg?.played || !secondLeg?.played) return path;
      const { winner, loser } = resolveAggregateWinner(firstLeg, secondLeg);
      if (winner && secondLeg.winner !== winner) {
        fixtures = fixtures.map(fixture => fixture.id === secondLeg.id ? { ...fixture, winner, loser } : fixture);
      }
      return winner ? { ...path, winner } : path;
    });
    const tiesComplete = playoffPaths.filter(path => path.mode === 'TIE').every(path => !!path.winner);
    if (tiesComplete) {
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
  }

  const semiFixtures = fixtures.filter(fixture => fixture.stage === 'PLAYOFFS' && fixture.round === 1);
  const semiComplete = semiFixtures.length > 0 && semiFixtures.every(fixture => fixture.played);
  if (semiComplete) {
    const existingFinals = fixtures.filter(fixture => fixture.stage === 'PLAYOFFS' && fixture.round === 2);
    const finalFixtures: EuroQualifiersFixture[] = [];
    playoffPaths = playoffPaths.map(path => {
      if (path.finalFixtureId) return path;
      const semis = path.semiFinalFixtureIds
        .map(id => fixtures.find(fixture => fixture.id === id))
        .filter((fixture): fixture is EuroQualifiersFixture => !!fixture && !!fixture.winner);
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

export const EuroQualifiersService = {
  isEuroTournamentYear,

  isDrawDay(date: Date): boolean {
    const tournamentYear = getTournamentYearForDate(date);
    return date.getFullYear() === tournamentYear - 2 && date.getMonth() === 11 && date.getDate() === 6;
  },

  isPotentialMatchDate(date: Date): boolean {
    const tournamentYear = getTournamentYearForDate(date);
    const isGroupDate = date.getFullYear() === tournamentYear - 1 && MATCH_DATES.some(slot =>
      slot.day === date.getDate() && slot.month === date.getMonth()
    );
    const isLegacyRecoveryDate = isLegacyGroupRecoveryDate(date, tournamentYear);
    const isPlayoffDate = date.getFullYear() === tournamentYear && PLAYOFF_DATES.some(slot =>
      slot.day === date.getDate() && slot.month === date.getMonth()
    );
    return isGroupDate || isLegacyRecoveryDate || isPlayoffDate;
  },

  createInitialState(
    nationalTeams: NationalTeam[],
    tournamentYear: number,
    rankingState?: UefaNationalRankingState | null,
    nationsLeagueState?: NationsLeagueState | null,
    hostAnnouncements: EuroHostAnnouncement[] = []
  ): EuroQualifiersState {
    const europe = nationalTeams.filter(team => team.continent === 'Europe' && team.name !== 'Rosja');
    const byNormalizedName = new Map(europe.map(team => [normalize(team.name), team.name]));
    const rankedTeams = uniqueTeams(
      UefaNationalRankingService.getRankedEuropeanTeams(rankingState, nationalTeams)
        .map(name => byNormalizedName.get(normalize(name)))
        .filter((name): name is string => !!name)
    );
    const hostTeams = getAnnouncedHostsForTournament(tournamentYear, nationalTeams, hostAnnouncements);
    const blocked = buildBlockedDates(nationsLeagueState);
    const groups = createGroups(rankedTeams, hostTeams, blocked, tournamentYear);
    const fixtures = groups.flatMap(group => buildFixturesForGroup(group, tournamentYear, blocked, tournamentYear));
    return {
      tournamentYear,
      editionLabel: `EURO ${tournamentYear}`,
      stage: 'GROUP_STAGE',
      drawCompleted: true,
      groups,
      fixtures,
      playoffPaths: [],
      hostTeams,
      qualifiedTeams: [],
      directQualifiers: [],
      hostReservedQualifiers: [],
      playoffTeams: [],
      completed: false,
      lastUpdatedIso: new Date().toISOString(),
    };
  },

  isHostAnnouncementDay(date: Date): boolean {
    const tournamentYear = date.getFullYear() + EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE;
    return isEuroTournamentYear(tournamentYear) && date.getMonth() === 11 && date.getDate() === 6;
  },

  getTournamentYearForHostAnnouncement(date: Date): number | null {
    const tournamentYear = date.getFullYear() + EURO_HOST_ANNOUNCEMENT_YEARS_BEFORE;
    return isEuroTournamentYear(tournamentYear) && date.getMonth() === 11 && date.getDate() === 6
      ? tournamentYear
      : null;
  },

  createHostAnnouncement,

  ensurePlayoffsReady(
    state: EuroQualifiersState | null,
    date: Date,
    rankingState?: UefaNationalRankingState | null
  ): EuroQualifiersState | null {
    if (!state || state.stage !== 'GROUP_STAGE') return state;
    const groupFixtures = state.fixtures.filter(fixture => (fixture.stage ?? 'GROUP_STAGE') === 'GROUP_STAGE');
    const allGroupFixturesPlayed = groupFixtures.length > 0 && groupFixtures.every(fixture => fixture.played);
    if (!allGroupFixturesPlayed && !shouldForceResolveGroupStage(state, date)) return state;
    const refreshed = refreshStandings(state, []);
    return finalizeGroupStage(refreshed, rankingState);
  },

  getMatchDayForDate(state: EuroQualifiersState | null, date: Date): NTMatchDay | null {
    if (!state || state.completed) return null;
    let fixtures = state.fixtures.filter(fixture =>
      !fixture.played &&
      fixture.year === date.getFullYear() &&
      fixture.day === date.getDate() &&
      fixture.month === date.getMonth()
    );
    if (fixtures.length === 0 && state.stage === 'GROUP_STAGE' && isLegacyGroupRecoveryDate(date, state.tournamentYear)) {
      const recoveryCandidates = state.fixtures
        .filter(fixture =>
          (fixture.stage ?? 'GROUP_STAGE') === 'GROUP_STAGE' &&
          !fixture.played &&
          new Date(fixture.year, fixture.month, fixture.day).getTime() < date.getTime()
        )
        .sort((a, b) => a.year - b.year || a.month - b.month || a.day - b.day || a.round - b.round);
      const usedTeams = new Set<string>();
      fixtures = recoveryCandidates.filter(fixture => {
        if (usedTeams.has(fixture.home) || usedTeams.has(fixture.away)) return false;
        usedTeams.add(fixture.home);
        usedTeams.add(fixture.away);
        return true;
      });
    }
    if (fixtures.length === 0) return null;
    const round = fixtures[0].round;
    if (state.stage === 'PLAYOFFS') {
      const hasTiePlayoffs = state.playoffPaths.some(path => path.mode === 'TIE');
      const isFinal = !hasTiePlayoffs && fixtures.some(fixture => fixture.round === 2);
      return {
        day: date.getDate(),
        month: date.getMonth(),
        competitionLabel: hasTiePlayoffs
          ? `Eliminacje ${state.editionLabel} - Baraże dwumeczowe`
          : `Eliminacje ${state.editionLabel} - Baraże ${isFinal ? 'finały' : 'półfinały'}`,
        matches: fixtures.map(fixture => {
          const path = state.playoffPaths.find(item => item.id === fixture.playoffPathId);
          const firstLeg = path?.mode === 'TIE'
            ? state.fixtures.find(item => item.id === path.tieFixtureIds?.[0])
            : undefined;
          const knockoutContext = path?.mode === 'TIE'
            ? fixture.round === 2 && firstLeg?.played && firstLeg.homeGoals !== undefined && firstLeg.awayGoals !== undefined
              ? {
                  type: 'AGGREGATE_SECOND_LEG' as const,
                  firstLegHome: firstLeg.home,
                  firstLegAway: firstLeg.away,
                  firstLegHomeGoals: firstLeg.homeGoals,
                  firstLegAwayGoals: firstLeg.awayGoals,
                }
              : undefined
            : { type: 'SINGLE_MATCH' as const };
          const stageLabel = path?.mode === 'TIE'
            ? `Mecz ${fixture.round}`
            : fixture.round === 2 ? 'Finał' : 'Półfinał';
          return {
            home: fixture.home,
            away: fixture.away,
            group: fixture.groupId,
            competitionLabel: `Eliminacje ${state.editionLabel} - Baraż ${fixture.groupId} - ${stageLabel}`,
            knockoutContext,
          };
        }),
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
    state: EuroQualifiersState,
    results: NTMatchResult[],
    rankingState?: UefaNationalRankingState | null
  ): EuroQualifiersState {
    if (state.stage === 'PLAYOFFS') return refreshPlayoffs(state, results);
    const next = refreshStandings(state, results);
    const allPlayed = next.fixtures.length > 0 && next.fixtures.every(fixture => fixture.played);
    return allPlayed ? finalizeGroupStage(next, rankingState) : next;
  },
};
