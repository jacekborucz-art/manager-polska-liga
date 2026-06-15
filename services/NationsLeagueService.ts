import {
  NationalTeam,
  NationsLeagueFixture,
  NationsLeagueGroup,
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

const sortStandings = (standings: NationsLeagueTeamStanding[]): NationsLeagueTeamStanding[] =>
  [...standings].sort((a, b) =>
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.teamName.localeCompare(b.teamName)
  );

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
  rankingState?: UefaNationalRankingState | null
): NationsLeagueGroup[] => {
  const europe = nationalTeams.filter(team => team.continent === 'Europe' && team.name !== 'Rosja');
  const byNormalizedName = new Map(europe.map(team => [normalize(team.name), team.name]));
  const rankedTeams = uniqueTeams(
    UefaNationalRankingService.getRankedEuropeanTeams(rankingState, nationalTeams)
      .map(name => byNormalizedName.get(normalize(name)))
      .filter((name): name is string => !!name)
  );
  const rng = new Rng(editionStartYear ^ 0x756efa);
  const leagueA = rankedTeams.slice(0, 16);
  const leagueB = rankedTeams.slice(16, 32);
  const leagueC = rankedTeams.slice(32, 48);
  const leagueD = rankedTeams.slice(48);

  return [
    ...buildGroupsForTier('A', leagueA, 4, rng),
    ...buildGroupsForTier('B', leagueB, 4, rng),
    ...buildGroupsForTier('C', leagueC, 4, rng),
    ...buildGroupsForTier('D', leagueD, Math.max(1, Math.ceil(leagueD.length / 3)), rng),
  ];
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
});

const refreshStandingsFromResults = (state: NationsLeagueState, results: NTMatchResult[]): NationsLeagueState => {
  if (results.length === 0) return state;
  const groups = state.groups.map(group => ({
    ...group,
    standings: group.teams.map(EMPTY_STANDING),
  }));
  const standingByGroup = new Map(groups.map(group => [group.id, new Map(group.standings.map(row => [row.teamName, row]))]));
  const fixtures = state.fixtures.map(fixture => ({ ...fixture }));

  results.forEach(result => {
    const resultRound = Number(result.competitionLabel.match(/Kolejka (\d+)/)?.[1] ?? 0);
    const fixtureIndex = fixtures.findIndex(item =>
      item.home === result.home &&
      item.away === result.away &&
      item.groupId === result.group &&
      item.round === resultRound
    );
    const fixture = fixtureIndex >= 0 ? fixtures[fixtureIndex] : undefined;
    if (!fixture?.groupId) return;
    fixtures[fixtureIndex] = markFixturePlayed(fixture, result);

    const table = standingByGroup.get(fixture.groupId);
    const home = table?.get(result.home);
    const away = table?.get(result.away);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.goalsFor += result.homeGoals;
    home.goalsAgainst += result.awayGoals;
    away.goalsFor += result.awayGoals;
    away.goalsAgainst += result.homeGoals;

    if (result.homeGoals > result.awayGoals) {
      home.wins += 1; home.points += 3; away.losses += 1;
    } else if (result.awayGoals > result.homeGoals) {
      away.wins += 1; away.points += 3; home.losses += 1;
    } else {
      home.draws += 1; away.draws += 1; home.points += 1; away.points += 1;
    }
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  });

  return {
    ...state,
    groups: groups.map(group => ({ ...group, standings: sortStandings(group.standings) })),
    fixtures,
    lastUpdatedIso: new Date().toISOString(),
  };
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

const getKnockoutMatchDay = (state: NationsLeagueState, date: Date): NTMatchDay | null => {
  const fixtures = state.fixtures.filter(fixture =>
    (fixture.stage === 'QUARTER_FINALS' || fixture.stage === 'FINALS') &&
    fixture.day === date.getDate() &&
    fixture.month === date.getMonth() &&
    !fixture.played
  );
  if (fixtures.length === 0) return null;

  const label = fixtures[0].stage === 'QUARTER_FINALS'
    ? `Liga Narodów UEFA ${state.editionLabel} - Ćwierćfinały`
    : `Liga Narodów UEFA ${state.editionLabel} - Finały`;

  return {
    day: date.getDate(),
    month: date.getMonth(),
    competitionLabel: label,
    matches: fixtures.map(fixture => ({
      home: fixture.home,
      away: fixture.away,
      group: fixture.stage === 'QUARTER_FINALS' ? 'QF' : 'FINALS',
      competitionLabel: label,
    })),
  };
};

const getWinner = (result: NTMatchResult): string =>
  result.homeGoals >= result.awayGoals ? result.home : result.away;

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
  if (secondHomeGoals !== secondAwayGoals) return secondHomeGoals > secondAwayGoals ? secondLeg.home : secondLeg.away;
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
    rankingState?: UefaNationalRankingState | null
  ): NationsLeagueState {
    const groups = buildInitialGroups(nationalTeams, editionStartYear, rankingState);
    const fixtures = groups.flatMap(buildGroupFixtures);
    return {
      editionStartYear,
      editionLabel: `${editionStartYear}/${String(editionStartYear + 1).slice(2)}`,
      stage: 'LEAGUE_PHASE',
      groups,
      fixtures,
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
    rankingState?: UefaNationalRankingState | null
  ): NationsLeagueState | null {
    const seasonStartYear = getSeasonStartYear(date);
    if (!isNationsLeagueSeason(seasonStartYear)) return state;
    if (state?.editionStartYear === seasonStartYear) return state;
    return NationsLeagueService.createInitialState(nationalTeams, seasonStartYear, rankingState);
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
        return {
          ...next,
          stage: 'QUARTER_FINALS',
          quarterFinalists: uniqueTeams(qfFixtures.flatMap(fixture => [fixture.home, fixture.away])),
          fixtures: [...next.fixtures, ...qfFixtures],
        };
      }
      return next;
    }

    return refreshKnockout(state, date, results);
  },
};
