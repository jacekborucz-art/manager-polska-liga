import {
  NationalTeam,
  NationsLeagueFixture,
  NationsLeagueGroup,
  NationsLeaguePlayoffLevel,
  NationsLeaguePlayoffTie,
  NationsLeagueState,
  NationsLeagueTeamStanding,
  NationsLeagueTier,
  NTMatchResult,
  UefaNationalRankingState,
} from '../types';
import { NTMatchDay } from '../resources/NationalTeamSchedule';
import { UefaNationalRankingService } from './UefaNationalRankingService';

const LEAGUE_PHASE_DATES = [
  { day: 4, month: 8 },
  { day: 7, month: 8 },
  { day: 8, month: 9 },
  { day: 11, month: 9 },
  { day: 14, month: 10 },
  { day: 17, month: 10 },
];

const QUARTER_FINAL_DATES = [
  { day: 17, month: 2 },
  { day: 20, month: 2 },
];

const FINALS_DATES = [
  { day: 7, month: 5 },
  { day: 11, month: 5 },
];

const EMPTY_STANDING = (teamName: string): NationsLeagueTeamStanding => ({
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

const getSeasonStartYear = (date: Date): number =>
  date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;

const isNationsLeagueSeason = (seasonStartYear: number): boolean =>
  seasonStartYear >= 2026 && (seasonStartYear - 2026) % 2 === 0;

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

type ExtraStandingStats = {
  awayGoals: number;
  awayWins: number;
};

type LeagueRankRow = NationsLeagueTeamStanding & {
  tier: NationsLeagueTier;
  groupId: string;
  groupPosition: number;
  awayGoals: number;
  awayWins: number;
};

const getPlayedGroupFixtures = (fixtures: NationsLeagueFixture[]): NationsLeagueFixture[] =>
  fixtures.filter(fixture => fixture.played && fixture.homeGoals !== undefined && fixture.awayGoals !== undefined);

const getExtraStats = (teamName: string, fixtures: NationsLeagueFixture[]): ExtraStandingStats => {
  let awayGoals = 0;
  let awayWins = 0;
  fixtures.forEach(fixture => {
    if (fixture.away !== teamName) return;
    awayGoals += fixture.awayGoals ?? 0;
    if ((fixture.awayGoals ?? 0) > (fixture.homeGoals ?? 0)) awayWins += 1;
  });
  return { awayGoals, awayWins };
};

const buildHeadToHeadStanding = (
  teamName: string,
  tiedTeams: Set<string>,
  fixtures: NationsLeagueFixture[]
): NationsLeagueTeamStanding => {
  const row = EMPTY_STANDING(teamName);
  fixtures
    .filter(fixture => tiedTeams.has(fixture.home) && tiedTeams.has(fixture.away))
    .forEach(fixture => {
      const isHome = fixture.home === teamName;
      const isAway = fixture.away === teamName;
      if (!isHome && !isAway) return;
      const goalsFor = isHome ? fixture.homeGoals ?? 0 : fixture.awayGoals ?? 0;
      const goalsAgainst = isHome ? fixture.awayGoals ?? 0 : fixture.homeGoals ?? 0;
      row.played += 1;
      row.goalsFor += goalsFor;
      row.goalsAgainst += goalsAgainst;
      if (goalsFor > goalsAgainst) {
        row.wins += 1;
        row.points += 3;
      } else if (goalsFor < goalsAgainst) {
        row.losses += 1;
      } else {
        row.draws += 1;
        row.points += 1;
      }
    });
  row.goalDifference = row.goalsFor - row.goalsAgainst;
  return row;
};

const sortStandings = (
  standings: NationsLeagueTeamStanding[],
  groupFixtures: NationsLeagueFixture[] = []
): NationsLeagueTeamStanding[] => {
  const playedFixtures = getPlayedGroupFixtures(groupFixtures);
  const byPoints = new Map<number, NationsLeagueTeamStanding[]>();
  standings.forEach(row => {
    byPoints.set(row.points, [...(byPoints.get(row.points) ?? []), row]);
  });

  return [...standings].sort((a, b) => {
    const basePoints = b.points - a.points;
    if (basePoints !== 0) return basePoints;

    const tiedRows = byPoints.get(a.points) ?? [];
    if (tiedRows.length > 1) {
      const tiedTeams = new Set(tiedRows.map(row => row.teamName));
      const aHead = buildHeadToHeadStanding(a.teamName, tiedTeams, playedFixtures);
      const bHead = buildHeadToHeadStanding(b.teamName, tiedTeams, playedFixtures);
      const headToHead =
        bHead.points - aHead.points ||
        bHead.goalDifference - aHead.goalDifference ||
        bHead.goalsFor - aHead.goalsFor;
      if (headToHead !== 0) return headToHead;
    }

    const aExtra = getExtraStats(a.teamName, playedFixtures);
    const bExtra = getExtraStats(b.teamName, playedFixtures);
    return b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      bExtra.awayGoals - aExtra.awayGoals ||
      b.wins - a.wins ||
      bExtra.awayWins - aExtra.awayWins ||
      a.teamName.localeCompare(b.teamName);
  });
};

const compareLeagueRankRows = (a: LeagueRankRow, b: LeagueRankRow): number =>
  a.groupPosition - b.groupPosition ||
  b.points - a.points ||
  b.goalDifference - a.goalDifference ||
  b.goalsFor - a.goalsFor ||
  b.awayGoals - a.awayGoals ||
  b.wins - a.wins ||
  b.awayWins - a.awayWins ||
  a.teamName.localeCompare(b.teamName);

const getLeagueRankRows = (state: NationsLeagueState, tier: NationsLeagueTier): LeagueRankRow[] =>
  state.groups
    .filter(group => group.tier === tier)
    .flatMap(group => {
      const fixtures = state.fixtures.filter(fixture => fixture.groupId === group.id);
      return group.standings.map((standing, index) => ({
        ...standing,
        tier,
        groupId: group.id,
        groupPosition: index + 1,
        ...getExtraStats(standing.teamName, getPlayedGroupFixtures(fixtures)),
      }));
    })
    .sort(compareLeagueRankRows);

const uniqueTeams = (teams: string[]): string[] => teams.filter((team, index, arr) => !!team && arr.indexOf(team) === index);

const buildGroupsForTier = (
  tier: NationsLeagueTier,
  teams: string[],
  groupCount: number,
  rng: Rng
): NationsLeagueGroup[] => {
  const groups = Array.from({ length: groupCount }, (_, index) => ({
    id: `${tier}${index + 1}`,
    tier,
    teams: [] as string[],
    standings: [] as NationsLeagueTeamStanding[],
  }));

  for (let start = 0; start < teams.length; start += groupCount) {
    const pot = rng.shuffle(teams.slice(start, start + groupCount));
    pot.forEach((team, index) => {
      groups[index % groupCount].teams.push(team);
    });
  }

  return groups
    .filter(group => group.teams.length >= 3)
    .map(group => ({ ...group, standings: group.teams.map(EMPTY_STANDING) }));
};

const buildInitialGroups = (
  nationalTeams: NationalTeam[],
  editionStartYear: number,
  rankingState?: UefaNationalRankingState | null,
  previousEdition?: NationsLeagueState | null
): NationsLeagueGroup[] => {
  const europe = nationalTeams.filter(team => team.continent === 'Europe' && team.name !== 'Rosja');
  const byNormalizedName = new Map(europe.map(team => [normalize(team.name), team.name]));
  const rankedTeams = uniqueTeams(
    UefaNationalRankingService.getRankedEuropeanTeams(rankingState, nationalTeams)
      .map(name => byNormalizedName.get(normalize(name)))
      .filter((name): name is string => !!name)
  );
  const rankedIndex = new Map(rankedTeams.map((team, index) => [team, index]));
  const teamsByTier = previousEdition?.completed
    ? buildTeamsAfterPromotionAndRelegation(previousEdition, rankedTeams)
    : null;
  const rng = new Rng(editionStartYear ^ 0x756efa);
  const leagueA = teamsByTier?.A ?? rankedTeams.slice(0, 16);
  const leagueB = teamsByTier?.B ?? rankedTeams.slice(16, 32);
  const leagueC = teamsByTier?.C ?? rankedTeams.slice(32, 48);
  const leagueD = teamsByTier?.D ?? rankedTeams.slice(48);
  const byRank = (a: string, b: string) => (rankedIndex.get(a) ?? 999) - (rankedIndex.get(b) ?? 999);

  return [
    ...buildGroupsForTier('A', [...leagueA].sort(byRank), 4, rng),
    ...buildGroupsForTier('B', [...leagueB].sort(byRank), 4, rng),
    ...buildGroupsForTier('C', [...leagueC].sort(byRank), 4, rng),
    ...buildGroupsForTier('D', [...leagueD].sort(byRank), Math.max(1, Math.ceil(leagueD.length / 3)), rng),
  ];
};

const getTierTeams = (state: NationsLeagueState, tier: NationsLeagueTier): string[] =>
  uniqueTeams(state.groups.filter(group => group.tier === tier).flatMap(group => group.teams));

const getGroupWinners = (state: NationsLeagueState, tier: NationsLeagueTier): string[] =>
  state.groups
    .filter(group => group.tier === tier)
    .map(group => group.standings[0]?.teamName)
    .filter((team): team is string => !!team);

const getGroupBottomTeams = (state: NationsLeagueState, tier: NationsLeagueTier): string[] =>
  state.groups
    .filter(group => group.tier === tier)
    .map(group => group.standings[group.standings.length - 1])
    .filter((row): row is NationsLeagueTeamStanding => !!row)
    .sort((a, b) =>
      a.points - b.points ||
      a.goalDifference - b.goalDifference ||
      a.goalsFor - b.goalsFor ||
      a.teamName.localeCompare(b.teamName)
    )
    .map(row => row.teamName);

const withoutTeams = (teams: string[], removed: string[]): string[] =>
  teams.filter(team => !removed.includes(team));

const getPlayoffWinners = (state: NationsLeagueState, level: NationsLeaguePlayoffLevel): string[] =>
  (state.playoffs ?? [])
    .filter(tie => tie.level === level && tie.winner)
    .map(tie => tie.winner as string);

const getPlayoffLosers = (state: NationsLeagueState, level: NationsLeaguePlayoffLevel): string[] =>
  (state.playoffs ?? [])
    .filter(tie => tie.level === level && tie.loser)
    .map(tie => tie.loser as string);

const buildTeamsAfterPromotionAndRelegation = (
  previousEdition: NationsLeagueState,
  rankedTeams: string[]
): Record<NationsLeagueTier, string[]> => {
  const available = new Set(rankedTeams);
  const leagueA = getTierTeams(previousEdition, 'A').filter(team => available.has(team));
  const leagueB = getTierTeams(previousEdition, 'B').filter(team => available.has(team));
  const leagueC = getTierTeams(previousEdition, 'C').filter(team => available.has(team));
  const leagueD = getTierTeams(previousEdition, 'D').filter(team => available.has(team));

  const promotedB = getGroupWinners(previousEdition, 'B').filter(team => available.has(team));
  const promotedC = getGroupWinners(previousEdition, 'C').filter(team => available.has(team));
  const promotedD = getGroupWinners(previousEdition, 'D').filter(team => available.has(team));
  const relegatedA = getGroupBottomTeams(previousEdition, 'A').slice(0, 4).filter(team => available.has(team));
  const relegatedB = getGroupBottomTeams(previousEdition, 'B').slice(0, 4).filter(team => available.has(team));
  const leagueCFourths = getLeagueRankRows(previousEdition, 'C').filter(row => row.groupPosition === 4);
  const relegatedC = leagueCFourths.slice(-2).map(row => row.teamName).filter(team => available.has(team));
  const playoffABWinners = getPlayoffWinners(previousEdition, 'AB').filter(team => available.has(team));
  const playoffABLosers = getPlayoffLosers(previousEdition, 'AB').filter(team => available.has(team));
  const playoffBCWinners = getPlayoffWinners(previousEdition, 'BC').filter(team => available.has(team));
  const playoffBCLosers = getPlayoffLosers(previousEdition, 'BC').filter(team => available.has(team));
  const playoffCDWinners = getPlayoffWinners(previousEdition, 'CD').filter(team => available.has(team));
  const playoffCDLosers = getPlayoffLosers(previousEdition, 'CD').filter(team => available.has(team));

  const next: Record<NationsLeagueTier, string[]> = {
    A: uniqueTeams([...withoutTeams(withoutTeams(leagueA, relegatedA), playoffABLosers), ...promotedB, ...playoffABWinners]),
    B: uniqueTeams([...withoutTeams(withoutTeams(withoutTeams(withoutTeams(leagueB, promotedB), relegatedB), playoffABWinners), playoffBCLosers), ...relegatedA, ...playoffABLosers, ...promotedC, ...playoffBCWinners]),
    C: uniqueTeams([...withoutTeams(withoutTeams(withoutTeams(withoutTeams(leagueC, promotedC), relegatedC), playoffBCWinners), playoffCDLosers), ...relegatedB, ...playoffBCLosers, ...promotedD, ...playoffCDWinners]),
    D: uniqueTeams([...withoutTeams(withoutTeams(leagueD, promotedD), playoffCDWinners), ...relegatedC, ...playoffCDLosers]),
  };

  const assigned = new Set(Object.values(next).flat());
  rankedTeams.forEach(team => {
    if (assigned.has(team)) return;
    const target = next.A.length < 16 ? 'A' : next.B.length < 16 ? 'B' : next.C.length < 16 ? 'C' : 'D';
    next[target].push(team);
    assigned.add(team);
  });

  return next;
};

const buildGroupFixtures = (group: NationsLeagueGroup): NationsLeagueFixture[] => {
  const teams = group.teams;
  const pairRounds4 = [
    [[0, 1], [2, 3]],
    [[0, 2], [3, 1]],
    [[0, 3], [1, 2]],
    [[1, 0], [3, 2]],
    [[2, 0], [1, 3]],
    [[3, 0], [2, 1]],
  ];
  const pairRounds3 = [
    [[0, 1]],
    [[1, 2]],
    [[2, 0]],
    [[1, 0]],
    [[2, 1]],
    [[0, 2]],
  ];
  const rounds = teams.length === 3 ? pairRounds3 : pairRounds4;

  return rounds.flatMap((pairs, roundIndex) => {
    const date = LEAGUE_PHASE_DATES[roundIndex];
    return pairs
      .filter(([homeIdx, awayIdx]) => teams[homeIdx] && teams[awayIdx])
      .map(([homeIdx, awayIdx], pairIndex) => ({
        id: `UNL_${group.id}_MD${roundIndex + 1}_${pairIndex + 1}`,
        stage: 'LEAGUE_PHASE' as const,
        round: roundIndex + 1,
        day: date.day,
        month: date.month,
        home: teams[homeIdx],
        away: teams[awayIdx],
        groupId: group.id,
        tier: group.tier,
        played: false,
      }));
  });
};

const markFixturePlayed = (fixture: NationsLeagueFixture, result: NTMatchResult): NationsLeagueFixture => ({
  ...fixture,
  played: true,
  matchId: result.matchId,
  homeGoals: result.homeGoals,
  awayGoals: result.awayGoals,
  homePenaltyScore: result.homePenaltyScore,
  awayPenaltyScore: result.awayPenaltyScore,
  isExtraTime: result.isExtraTime,
});

const rebuildLeaguePhaseStandings = (
  state: NationsLeagueState,
  fixtures: NationsLeagueFixture[] = state.fixtures,
  touchTimestamp = false
): NationsLeagueState => {
  const groups = state.groups.map(group => ({
    ...group,
    standings: group.teams.map(EMPTY_STANDING),
  }));
  const standingByGroup = new Map(groups.map(group => [group.id, new Map(group.standings.map(row => [row.teamName, row]))]));

  getPlayedGroupFixtures(fixtures).forEach(fixture => {
    if (!fixture.groupId) return;
    const table = standingByGroup.get(fixture.groupId);
    const home = table?.get(fixture.home);
    const away = table?.get(fixture.away);
    if (!home || !away) return;
    const homeGoals = fixture.homeGoals ?? 0;
    const awayGoals = fixture.awayGoals ?? 0;

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.wins += 1; home.points += 3; away.losses += 1;
    } else if (awayGoals > homeGoals) {
      away.wins += 1; away.points += 3; home.losses += 1;
    } else {
      home.draws += 1; away.draws += 1; home.points += 1; away.points += 1;
    }
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  });

  return {
    ...state,
    groups: groups.map(group => ({
      ...group,
      standings: sortStandings(group.standings, fixtures.filter(fixture => fixture.groupId === group.id)),
    })),
    fixtures,
    lastUpdatedIso: touchTimestamp ? new Date().toISOString() : state.lastUpdatedIso,
  };
};

const refreshStandingsFromResults = (state: NationsLeagueState, results: NTMatchResult[]): NationsLeagueState => {
  if (results.length === 0) return state;
  const fixtures = state.fixtures.map(fixture => ({ ...fixture }));

  results.forEach(result => {
    const resultRound = Number(result.competitionLabel.match(/Kolejka (\d+)/)?.[1] ?? 0);
    const fixtureIndex = fixtures.findIndex(item =>
      item.home === result.home &&
      item.away === result.away &&
      item.groupId === result.group &&
      (resultRound > 0 ? item.round === resultRound : !item.played)
    );
    const fixture = fixtureIndex >= 0 ? fixtures[fixtureIndex] : undefined;
    if (!fixture?.groupId) return;
    fixtures[fixtureIndex] = markFixturePlayed(fixture, result);
  });

  return rebuildLeaguePhaseStandings(state, fixtures, true);
};

const getLeaguePhaseMatchDay = (state: NationsLeagueState, date: Date): NTMatchDay | null => {
  const fixtures = state.fixtures.filter(fixture =>
    fixture.stage === 'LEAGUE_PHASE' &&
    fixture.day === date.getDate() &&
    fixture.month === date.getMonth() &&
    !fixture.played
  );
  if (fixtures.length === 0) return null;

  const round = fixtures[0].round;
  return {
    day: date.getDate(),
    month: date.getMonth(),
    competitionLabel: `Liga Narodów UEFA ${state.editionLabel} - Kolejka ${round}`,
    matches: fixtures.map(fixture => ({
      home: fixture.home,
      away: fixture.away,
      group: fixture.groupId,
      competitionLabel: `Liga Narodów UEFA ${state.editionLabel} - ${fixture.groupId} - Kolejka ${round}`,
    })),
  };
};

const buildQuarterFinalFixtures = (state: NationsLeagueState): NationsLeagueFixture[] => {
  const leagueAGroups = state.groups.filter(group => group.tier === 'A');
  const winners = leagueAGroups.map(group => group.standings[0]?.teamName).filter(Boolean) as string[];
  const runnersUp = leagueAGroups.map(group => group.standings[1]?.teamName).filter(Boolean) as string[];
  const pairs = winners
    .map((winner, index) => ({ winner, runnerUp: runnersUp[(index + 1) % runnersUp.length] }))
    .filter(pair => pair.winner && pair.runnerUp);

  return pairs.flatMap((pair, index) => [
    {
      id: `UNL_QF_${index + 1}_L1`,
      stage: 'QUARTER_FINALS' as const,
      round: 1,
      day: QUARTER_FINAL_DATES[0].day,
      month: QUARTER_FINAL_DATES[0].month,
      home: pair.runnerUp,
      away: pair.winner,
      tier: 'A' as const,
      played: false,
    },
    {
      id: `UNL_QF_${index + 1}_L2`,
      stage: 'QUARTER_FINALS' as const,
      round: 2,
      day: QUARTER_FINAL_DATES[1].day,
      month: QUARTER_FINAL_DATES[1].month,
      home: pair.winner,
      away: pair.runnerUp,
      tier: 'A' as const,
      played: false,
    },
  ]);
};

const createPlayoffTie = (
  level: NationsLeaguePlayoffLevel,
  index: number,
  highLeagueTeam: string | undefined,
  lowLeagueTeam: string | undefined
): { tie: NationsLeaguePlayoffTie; fixtures: NationsLeagueFixture[] } | null => {
  if (!highLeagueTeam || !lowLeagueTeam) return null;
  const id = `UNL_PO_${level}_${index + 1}`;
  const firstLegId = `${id}_L1`;
  const secondLegId = `${id}_L2`;
  const tier = level === 'AB' ? 'A' : level === 'BC' ? 'B' : 'C';
  return {
    tie: {
      id,
      level,
      highLeagueTeam,
      lowLeagueTeam,
      firstLegId,
      secondLegId,
    },
    fixtures: [
      {
        id: firstLegId,
        stage: 'PLAYOFFS',
        round: 1,
        day: QUARTER_FINAL_DATES[0].day,
        month: QUARTER_FINAL_DATES[0].month,
        home: lowLeagueTeam,
        away: highLeagueTeam,
        tier,
        playoffTieId: id,
        playoffLevel: level,
        played: false,
      },
      {
        id: secondLegId,
        stage: 'PLAYOFFS',
        round: 2,
        day: QUARTER_FINAL_DATES[1].day,
        month: QUARTER_FINAL_DATES[1].month,
        home: highLeagueTeam,
        away: lowLeagueTeam,
        tier,
        playoffTieId: id,
        playoffLevel: level,
        played: false,
      },
    ],
  };
};

const buildPlayoffTiesAndFixtures = (state: NationsLeagueState): { ties: NationsLeaguePlayoffTie[]; fixtures: NationsLeagueFixture[] } => {
  const aThirds = getLeagueRankRows(state, 'A').filter(row => row.groupPosition === 3);
  const bRunnersUp = getLeagueRankRows(state, 'B').filter(row => row.groupPosition === 2);
  const bThirds = getLeagueRankRows(state, 'B').filter(row => row.groupPosition === 3);
  const cRunnersUp = getLeagueRankRows(state, 'C').filter(row => row.groupPosition === 2);
  const cFourths = getLeagueRankRows(state, 'C').filter(row => row.groupPosition === 4).slice(0, 2);
  const dRunnersUp = getLeagueRankRows(state, 'D').filter(row => row.groupPosition === 2);

  const created = [
    ...aThirds.map((row, index) => createPlayoffTie('AB', index, row.teamName, bRunnersUp[index]?.teamName)),
    ...bThirds.map((row, index) => createPlayoffTie('BC', index, row.teamName, cRunnersUp[index]?.teamName)),
    ...cFourths.map((row, index) => createPlayoffTie('CD', index, row.teamName, dRunnersUp[index]?.teamName)),
  ].filter((item): item is { tie: NationsLeaguePlayoffTie; fixtures: NationsLeagueFixture[] } => !!item);

  return {
    ties: created.map(item => item.tie),
    fixtures: created.flatMap(item => item.fixtures),
  };
};

const getFirstLegForFixture = (state: NationsLeagueState, fixture: NationsLeagueFixture): NationsLeagueFixture | undefined => {
  if (fixture.round !== 2) return undefined;
  if (fixture.stage === 'PLAYOFFS') {
    const tie = state.playoffs?.find(item => item.secondLegId === fixture.id);
    return tie ? state.fixtures.find(item => item.id === tie.firstLegId) : undefined;
  }
  if (fixture.stage === 'QUARTER_FINALS') {
    return state.fixtures.find(item =>
      item.stage === 'QUARTER_FINALS' &&
      item.round === 1 &&
      item.home === fixture.away &&
      item.away === fixture.home
    );
  }
  return undefined;
};

const getKnockoutContextForFixture = (state: NationsLeagueState, fixture: NationsLeagueFixture): NTMatchDay['matches'][number]['knockoutContext'] => {
  if (fixture.stage === 'FINALS') {
    return { type: 'SINGLE_MATCH' };
  }
  const firstLeg = getFirstLegForFixture(state, fixture);
  if (!firstLeg || firstLeg.homeGoals === undefined || firstLeg.awayGoals === undefined) return undefined;
  return {
    type: 'AGGREGATE_SECOND_LEG',
    firstLegHome: firstLeg.home,
    firstLegAway: firstLeg.away,
    firstLegHomeGoals: firstLeg.homeGoals,
    firstLegAwayGoals: firstLeg.awayGoals,
  };
};

const getKnockoutMatchDay = (state: NationsLeagueState, date: Date): NTMatchDay | null => {
  const fixtures = state.fixtures.filter(fixture =>
    (fixture.stage === 'QUARTER_FINALS' || fixture.stage === 'PLAYOFFS' || fixture.stage === 'FINALS') &&
    fixture.day === date.getDate() &&
    fixture.month === date.getMonth() &&
    !fixture.played
  );
  if (fixtures.length === 0) return null;

  const hasFinals = fixtures.some(fixture => fixture.stage === 'FINALS');
  const hasQuarterFinals = fixtures.some(fixture => fixture.stage === 'QUARTER_FINALS');
  const hasPlayoffs = fixtures.some(fixture => fixture.stage === 'PLAYOFFS');
  const label = hasFinals
    ? `Liga Narodów UEFA ${state.editionLabel} - Finały`
    : hasQuarterFinals && hasPlayoffs
      ? `Liga Narodów UEFA ${state.editionLabel} - Ćwierćfinały i baraże`
      : hasQuarterFinals
        ? `Liga Narodów UEFA ${state.editionLabel} - Ćwierćfinały`
        : `Liga Narodów UEFA ${state.editionLabel} - Baraże`;

  return {
    day: date.getDate(),
    month: date.getMonth(),
    competitionLabel: label,
    matches: fixtures.map(fixture => ({
      home: fixture.home,
      away: fixture.away,
      group: fixture.stage === 'QUARTER_FINALS' ? 'QF' : fixture.stage === 'PLAYOFFS' ? fixture.playoffLevel : 'FINALS',
      competitionLabel: fixture.stage === 'PLAYOFFS'
        ? `Liga Narodów UEFA ${state.editionLabel} - Baraż ${fixture.playoffLevel} - Mecz ${fixture.round}`
        : label,
      knockoutContext: getKnockoutContextForFixture(state, fixture),
    })),
  };
};

const getWinner = (result: NTMatchResult): string =>
  result.homePenaltyScore !== undefined && result.awayPenaltyScore !== undefined
    ? result.homePenaltyScore > result.awayPenaltyScore ? result.home : result.away
    : result.homeGoals >= result.awayGoals ? result.home : result.away;

const getLoser = (result: NTMatchResult): string =>
  getWinner(result) === result.home ? result.away : result.home;

const getAggregateWinner = (firstLeg: NationsLeagueFixture, secondLeg: NationsLeagueFixture): string => {
  const firstHomeGoals = firstLeg.homeGoals ?? 0;
  const firstAwayGoals = firstLeg.awayGoals ?? 0;
  const secondHomeGoals = secondLeg.homeGoals ?? 0;
  const secondAwayGoals = secondLeg.awayGoals ?? 0;
  const secondLegHomeAggregate = firstAwayGoals + secondHomeGoals;
  const secondLegAwayAggregate = firstHomeGoals + secondAwayGoals;
  if (secondLegHomeAggregate > secondLegAwayAggregate) return secondLeg.home;
  if (secondLegAwayAggregate > secondLegHomeAggregate) return secondLeg.away;
  if (secondLeg.homePenaltyScore !== undefined && secondLeg.awayPenaltyScore !== undefined) {
    return secondLeg.homePenaltyScore > secondLeg.awayPenaltyScore ? secondLeg.home : secondLeg.away;
  }
  return secondLeg.home;
};

const refreshKnockout = (state: NationsLeagueState, date: Date, results: NTMatchResult[]): NationsLeagueState => {
  if (results.length === 0) return state;
  let fixtures = state.fixtures.map(fixture => ({ ...fixture }));

  results.forEach(result => {
    const fixtureIndex = fixtures.findIndex(item =>
      item.home === result.home &&
      item.away === result.away &&
      item.day === date.getDate() &&
      item.month === date.getMonth() &&
      !item.played
    );
    if (fixtureIndex >= 0) fixtures[fixtureIndex] = markFixturePlayed(fixtures[fixtureIndex], result);
  });

  let nextState: NationsLeagueState = { ...state, fixtures, lastUpdatedIso: new Date().toISOString() };
  const playoffSecondLegs = fixtures.filter(fixture => fixture.stage === 'PLAYOFFS' && fixture.round === 2);
  if (playoffSecondLegs.length > 0 && playoffSecondLegs.every(fixture => fixture.played)) {
    const playoffs = (nextState.playoffs ?? []).map(tie => {
      if (tie.winner && tie.loser) return tie;
      const firstLeg = fixtures.find(fixture => fixture.id === tie.firstLegId);
      const secondLeg = fixtures.find(fixture => fixture.id === tie.secondLegId);
      if (!firstLeg || !secondLeg || !firstLeg.played || !secondLeg.played) return tie;
      const winner = getAggregateWinner(firstLeg, secondLeg);
      return {
        ...tie,
        winner,
        loser: winner === tie.highLeagueTeam ? tie.lowLeagueTeam : tie.highLeagueTeam,
      };
    });
    nextState = { ...nextState, playoffs };
  }

  const qfSecondLegs = fixtures.filter(fixture => fixture.stage === 'QUARTER_FINALS' && fixture.round === 2);
  if (qfSecondLegs.length > 0 && qfSecondLegs.every(fixture => fixture.played) && nextState.semiFinalists.length === 0) {
    const winners = qfSecondLegs.map(secondLeg => {
      const firstLeg = fixtures.find(fixture =>
        fixture.stage === 'QUARTER_FINALS' &&
        fixture.round === 1 &&
        fixture.home === secondLeg.away &&
        fixture.away === secondLeg.home
      );
      return firstLeg ? getAggregateWinner(firstLeg, secondLeg) : secondLeg.home;
    });
    const semiFixtures: NationsLeagueFixture[] = [
      {
        id: 'UNL_SF_1',
        stage: 'FINALS',
        round: 1,
        day: FINALS_DATES[0].day,
        month: FINALS_DATES[0].month,
        home: winners[0],
        away: winners[3] ?? winners[1],
        tier: 'A',
        played: false,
      },
      {
        id: 'UNL_SF_2',
        stage: 'FINALS',
        round: 1,
        day: FINALS_DATES[0].day,
        month: FINALS_DATES[0].month,
        home: winners[1],
        away: winners[2],
        tier: 'A',
        played: false,
      },
    ].filter(fixture => fixture.home && fixture.away);
    fixtures = [...fixtures, ...semiFixtures];
    nextState = {
      ...nextState,
      stage: 'FINALS',
      semiFinalists: winners,
      finals: {
        semiFinalists: winners,
        finalists: [],
        thirdPlaceTeams: [],
      },
      fixtures,
    };
  }

  const semiFixtures = nextState.fixtures.filter(fixture => fixture.stage === 'FINALS' && fixture.round === 1);
  if (semiFixtures.length > 0 && semiFixtures.every(fixture => fixture.played) && nextState.finals && nextState.finals.finalists.length === 0) {
    const semiResults = results.filter(result => semiFixtures.some(fixture => fixture.home === result.home && fixture.away === result.away));
    const finalists = semiResults.map(getWinner);
    const thirdPlaceTeams = semiResults.map(getLoser);
    const finalFixtures: NationsLeagueFixture[] = [
      {
        id: 'UNL_THIRD',
        stage: 'FINALS',
        round: 2,
        day: FINALS_DATES[1].day,
        month: FINALS_DATES[1].month,
        home: thirdPlaceTeams[0],
        away: thirdPlaceTeams[1],
        tier: 'A',
        played: false,
      },
      {
        id: 'UNL_FINAL',
        stage: 'FINALS',
        round: 2,
        day: FINALS_DATES[1].day,
        month: FINALS_DATES[1].month,
        home: finalists[0],
        away: finalists[1],
        tier: 'A',
        played: false,
      },
    ].filter(fixture => fixture.home && fixture.away);
    nextState = {
      ...nextState,
      finals: {
        ...nextState.finals,
        finalists,
        thirdPlaceTeams,
      },
      fixtures: [...nextState.fixtures, ...finalFixtures],
    };
  }

  const finalFixtures = nextState.fixtures.filter(fixture => fixture.stage === 'FINALS' && fixture.round === 2);
  if (finalFixtures.length > 0 && finalFixtures.every(fixture => fixture.played) && nextState.finals && !nextState.finals.champion) {
    const finalFixture = finalFixtures.find(fixture => fixture.id === 'UNL_FINAL');
    const thirdFixture = finalFixtures.find(fixture => fixture.id === 'UNL_THIRD');
    const finalResult = results.find(result => result.home === finalFixture?.home && result.away === finalFixture?.away);
    const thirdResult = results.find(result => result.home === thirdFixture?.home && result.away === thirdFixture?.away);
    nextState = {
      ...nextState,
      stage: 'COMPLETE',
      completed: true,
      finals: {
        ...nextState.finals,
        champion: finalResult ? getWinner(finalResult) : undefined,
        runnerUp: finalResult ? getLoser(finalResult) : undefined,
        thirdPlace: thirdResult ? getWinner(thirdResult) : undefined,
        fourthPlace: thirdResult ? getLoser(thirdResult) : undefined,
      },
    };
  }

  return nextState;
};

export const NationsLeagueService = {
  isNationsLeagueSeason,

  repairLeaguePhaseStandings(state: NationsLeagueState): NationsLeagueState {
    return rebuildLeaguePhaseStandings(state);
  },

  isPotentialMatchDate(date: Date): boolean {
    const seasonStartYear = getSeasonStartYear(date);
    if (!isNationsLeagueSeason(seasonStartYear)) return false;
    const day = date.getDate();
    const month = date.getMonth();
    return [...LEAGUE_PHASE_DATES, ...QUARTER_FINAL_DATES, ...FINALS_DATES].some(slot =>
      slot.day === day && slot.month === month
    );
  },

  createInitialState(
    nationalTeams: NationalTeam[],
    editionStartYear: number,
    rankingState?: UefaNationalRankingState | null,
    previousEdition?: NationsLeagueState | null
  ): NationsLeagueState {
    const groups = buildInitialGroups(nationalTeams, editionStartYear, rankingState, previousEdition);
    const fixtures = groups.flatMap(buildGroupFixtures);
    return {
      editionStartYear,
      editionLabel: `${editionStartYear}/${String(editionStartYear + 1).slice(2)}`,
      stage: 'LEAGUE_PHASE',
      groups,
      fixtures,
      playoffs: [],
      quarterFinalists: [],
      semiFinalists: [],
      finals: null,
      completed: false,
    };
  },

  ensureState(
    state: NationsLeagueState | null,
    date: Date,
    nationalTeams: NationalTeam[],
    rankingState?: UefaNationalRankingState | null,
    previousEdition?: NationsLeagueState | null
  ): NationsLeagueState | null {
    const seasonStartYear = getSeasonStartYear(date);
    if (!isNationsLeagueSeason(seasonStartYear)) return state;
    if (state?.editionStartYear === seasonStartYear) return state;
    return NationsLeagueService.createInitialState(nationalTeams, seasonStartYear, rankingState, previousEdition ?? state);
  },

  getMatchDayForDate(state: NationsLeagueState | null, date: Date): NTMatchDay | null {
    if (!state || state.completed) return null;
    const seasonStartYear = getSeasonStartYear(date);
    if (seasonStartYear !== state.editionStartYear) return null;
    if (state.stage === 'LEAGUE_PHASE') return getLeaguePhaseMatchDay(state, date);
    return getKnockoutMatchDay(state, date);
  },

  applyResults(state: NationsLeagueState, date: Date, results: NTMatchResult[]): NationsLeagueState {
    if (state.stage === 'LEAGUE_PHASE') {
      const next = refreshStandingsFromResults(state, results);
      const leagueFixtures = next.fixtures.filter(fixture => fixture.stage === 'LEAGUE_PHASE');
      if (leagueFixtures.length > 0 && leagueFixtures.every(fixture => fixture.played)) {
        const qfFixtures = buildQuarterFinalFixtures(next);
        const playoffData = buildPlayoffTiesAndFixtures(next);
        return {
          ...next,
          stage: 'QUARTER_FINALS',
          quarterFinalists: uniqueTeams(qfFixtures.flatMap(fixture => [fixture.home, fixture.away])),
          playoffs: playoffData.ties,
          fixtures: [...next.fixtures, ...qfFixtures, ...playoffData.fixtures],
        };
      }
      return next;
    }

    return refreshKnockout(state, date, results);
  },
};
