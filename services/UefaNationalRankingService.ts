import {
  NationalTeam,
  NationsLeagueFixture,
  NationsLeagueState,
  NationsLeagueTeamStanding,
  NationsLeagueTier,
  NTMatchResult,
  UefaNationalRankingEntry,
  UefaNationalRankingState,
} from '../types';

const INITIAL_ACCESS_ORDER = [
  'Portugalia',
  'Hiszpania',
  'Francja',
  'Niemcy',
  'Holandia',
  'Włochy',
  'Dania',
  'Chorwacja',
  'Anglia',
  'Belgia',
  'Turcja',
  'Serbia',
  'Norwegia',
  'Walia',
  'Grecja',
  'Czechy',
  'Szwajcaria',
  'Austria',
  'Szkocja',
  'Ukraina',
  'Szwecja',
  'Polska',
  'Węgry',
  'Rumunia',
  'Bośnia i Hercegowina',
  'Irlandia',
  'Izrael',
  'Słowenia',
  'Gruzja',
  'Albania',
  'Macedonia Północna',
  'Kosovo',
  'Słowacja',
  'Irlandia Północna',
  'Bułgaria',
  'Islandia',
  'Finlandia',
  'Czarnogóra',
  'Armenia',
  'Białoruś',
  'Luksemburg',
  'Wyspy Owcze',
  'Kazachstan',
  'Estonia',
  'Cypr',
  'Litwa',
  'Łotwa',
  'Mołdawia',
  'Azerbejdżan',
  'Malta',
  'Andora',
  'Gibraltar',
  'Liechtenstein',
  'San Marino',
];

const RANKING_SOURCE = 'Startowa lista dostępu Ligi Narodów UEFA 2026/27';
const LEAGUE_PHASE_SOURCE = 'Ranking ogólny UEFA po fazie ligowej Ligi Narodów';
const FINAL_SOURCE = 'Ranking ogólny UEFA po finałach Ligi Narodów';
const TIER_ORDER: NationsLeagueTier[] = ['A', 'B', 'C', 'D'];

type RankingBasis = NonNullable<UefaNationalRankingEntry['rankingBasis']>;

type StandingWithContext = NationsLeagueTeamStanding & {
  leagueTier: NationsLeagueTier;
  groupId: string;
  groupPosition: number;
  awayGoals: number;
  awayWins: number;
};

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const tierForRank = (rank: number): NationsLeagueTier => {
  if (rank <= 16) return 'A';
  if (rank <= 32) return 'B';
  if (rank <= 48) return 'C';
  return 'D';
};

const getEuropeanTeams = (nationalTeams: NationalTeam[]): string[] =>
  nationalTeams.filter(team => team.continent === 'Europe' && team.name !== 'Rosja').map(team => team.name);

const createAccessOrderedTeams = (nationalTeams: NationalTeam[]): string[] => {
  const europeanTeams = getEuropeanTeams(nationalTeams);
  const byNormalizedName = new Map(europeanTeams.map(name => [normalize(name), name]));
  const used = new Set<string>();
  const orderedTeams: string[] = [];

  INITIAL_ACCESS_ORDER.forEach(name => {
    const resolved = byNormalizedName.get(normalize(name));
    if (resolved && !used.has(resolved)) {
      used.add(resolved);
      orderedTeams.push(resolved);
    }
  });

  europeanTeams
    .filter(name => !used.has(name))
    .sort((a, b) => a.localeCompare(b))
    .forEach(name => orderedTeams.push(name));

  return orderedTeams;
};

const getAccessRankMap = (
  state: UefaNationalRankingState | null | undefined,
  nationalTeams?: NationalTeam[]
): Map<string, number> => {
  const teams = state?.entries?.length
    ? state.entries.map(entry => entry.teamName)
    : nationalTeams
      ? createAccessOrderedTeams(nationalTeams)
      : INITIAL_ACCESS_ORDER;
  return new Map(teams.map((teamName, index) => [teamName, index + 1]));
};

const createEntry = (
  teamName: string,
  rank: number,
  previousRank: number | undefined,
  basis: RankingBasis,
  stats?: Partial<StandingWithContext>,
  totalTeams = 54
): UefaNationalRankingEntry => ({
  teamName,
  rank,
  previousRank: previousRank ?? rank,
  points: stats?.points ?? Math.max(1, totalTeams - rank + 1),
  leagueTier: stats?.leagueTier ?? tierForRank(rank),
  lastDelta: (previousRank ?? rank) - rank,
  rankingBasis: basis,
  groupPosition: stats?.groupPosition,
  played: stats?.played,
  wins: stats?.wins,
  draws: stats?.draws,
  losses: stats?.losses,
  goalsFor: stats?.goalsFor,
  goalsAgainst: stats?.goalsAgainst,
  goalDifference: stats?.goalDifference,
});

const countAwayStats = (teamName: string, fixtures: NationsLeagueFixture[]): Pick<StandingWithContext, 'awayGoals' | 'awayWins'> => {
  let awayGoals = 0;
  let awayWins = 0;
  fixtures.forEach(fixture => {
    if (!fixture.played || fixture.away !== teamName) return;
    awayGoals += fixture.awayGoals ?? 0;
    if ((fixture.awayGoals ?? 0) > (fixture.homeGoals ?? 0)) awayWins += 1;
  });
  return { awayGoals, awayWins };
};

const compareRows = (accessRanks: Map<string, number>) => (a: StandingWithContext, b: StandingWithContext): number =>
  a.groupPosition - b.groupPosition ||
  b.points - a.points ||
  b.goalDifference - a.goalDifference ||
  b.goalsFor - a.goalsFor ||
  b.awayGoals - a.awayGoals ||
  b.wins - a.wins ||
  b.awayWins - a.awayWins ||
  (accessRanks.get(a.teamName) ?? 999) - (accessRanks.get(b.teamName) ?? 999) ||
  a.teamName.localeCompare(b.teamName);

const buildLeaguePhaseRows = (
  nationsLeagueState: NationsLeagueState,
  accessRanks: Map<string, number>
): StandingWithContext[] => {
  const rows = nationsLeagueState.groups.flatMap(group => {
    const groupFixtures = nationsLeagueState.fixtures.filter(fixture => fixture.groupId === group.id);
    return group.standings.map((standing, index) => ({
      ...standing,
      leagueTier: group.tier,
      groupId: group.id,
      groupPosition: index + 1,
      ...countAwayStats(standing.teamName, groupFixtures),
    }));
  });

  return TIER_ORDER.flatMap(tier =>
    rows
      .filter(row => row.leagueTier === tier)
      .sort(compareRows(accessRanks))
  );
};

const moveFinalFourToTop = (
  rows: StandingWithContext[],
  finals: NationsLeagueState['finals'] | null
): StandingWithContext[] => {
  if (!finals?.champion || !finals.runnerUp || !finals.thirdPlace || !finals.fourthPlace) return rows;
  const finalOrder = [finals.champion, finals.runnerUp, finals.thirdPlace, finals.fourthPlace];
  const byTeam = new Map(rows.map(row => [row.teamName, row]));
  const topRows = finalOrder.map(team => byTeam.get(team)).filter((row): row is StandingWithContext => !!row);
  const remaining = rows.filter(row => !finalOrder.includes(row.teamName));
  return [...topRows, ...remaining];
};

const sortByInterimOrder = (rows: StandingWithContext[], interimOrder: Map<string, number>): StandingWithContext[] =>
  [...rows].sort((a, b) =>
    (interimOrder.get(a.teamName) ?? 999) - (interimOrder.get(b.teamName) ?? 999) ||
    a.teamName.localeCompare(b.teamName)
  );

const rowsForTeams = (
  rowsByTeam: Map<string, StandingWithContext>,
  teamNames: string[],
  interimOrder: Map<string, number>
): StandingWithContext[] =>
  sortByInterimOrder(
    teamNames.map(teamName => rowsByTeam.get(teamName)).filter((row): row is StandingWithContext => !!row),
    interimOrder
  );

const playoffWinners = (state: NationsLeagueState, level: 'AB' | 'BC' | 'CD'): string[] =>
  (state.playoffs ?? [])
    .filter(tie => tie.level === level && tie.winner)
    .map(tie => tie.winner as string);

const playoffLosers = (state: NationsLeagueState, level: 'AB' | 'BC' | 'CD'): string[] =>
  (state.playoffs ?? [])
    .filter(tie => tie.level === level && tie.loser)
    .map(tie => tie.loser as string);

const buildFinalOverallRows = (
  leagueRows: StandingWithContext[],
  state: NationsLeagueState
): StandingWithContext[] => {
  const interimOrder = new Map(leagueRows.map((row, index) => [row.teamName, index + 1]));
  const rowsByTeam = new Map(leagueRows.map(row => [row.teamName, row]));
  const byTier = (tier: NationsLeagueTier) => leagueRows.filter(row => row.leagueTier === tier);
  const byTierAndPosition = (tier: NationsLeagueTier, groupPosition: number) =>
    byTier(tier).filter(row => row.groupPosition === groupPosition);

  const finalFour = [
    state.finals?.champion,
    state.finals?.runnerUp,
    state.finals?.thirdPlace,
    state.finals?.fourthPlace,
  ].filter((teamName): teamName is string => !!teamName);
  const qfLosers = (state.quarterFinalists ?? []).filter(teamName => !finalFour.includes(teamName));

  const promotedB = byTierAndPosition('B', 1).map(row => row.teamName);
  const promotedC = byTierAndPosition('C', 1).map(row => row.teamName);
  const promotedD = byTierAndPosition('D', 1).map(row => row.teamName);
  const relegatedA = byTierAndPosition('A', 4).map(row => row.teamName);
  const relegatedB = byTierAndPosition('B', 4).map(row => row.teamName);
  const cFourths = byTierAndPosition('C', 4);
  const cPlayoffTeams = cFourths.slice(0, 2).map(row => row.teamName);
  const relegatedC = cFourths.slice(-2).map(row => row.teamName);
  const cRemaining = byTierAndPosition('C', 3).map(row => row.teamName);
  const dRemaining = byTier('D')
    .filter(row => row.groupPosition === 3 || (!promotedD.includes(row.teamName) && !playoffLosers(state, 'CD').includes(row.teamName) && !playoffWinners(state, 'CD').includes(row.teamName)))
    .map(row => row.teamName);

  const buckets = [
    finalFour,
    qfLosers,
    [...promotedB, ...playoffWinners(state, 'AB')],
    [...relegatedA, ...playoffLosers(state, 'AB')],
    [...promotedC, ...playoffWinners(state, 'BC')],
    [...relegatedB, ...playoffLosers(state, 'BC')],
    cRemaining,
    [...promotedD, ...playoffWinners(state, 'CD')],
    [...relegatedC, ...playoffLosers(state, 'CD')],
    dRemaining,
  ];
  const used = new Set<string>();
  const ordered = buckets.flatMap(bucket => {
    const rows = rowsForTeams(rowsByTeam, bucket, interimOrder).filter(row => !used.has(row.teamName));
    rows.forEach(row => used.add(row.teamName));
    return rows;
  });
  const leftovers = leagueRows.filter(row => !used.has(row.teamName));
  return [...ordered, ...leftovers];
};

const buildEntriesFromRows = (
  rows: StandingWithContext[],
  state: UefaNationalRankingState,
  basis: RankingBasis,
  nationalTeams?: NationalTeam[]
): UefaNationalRankingEntry[] => {
  const previousRanks = new Map(state.entries.map(entry => [entry.teamName, entry.rank]));
  const used = new Set(rows.map(row => row.teamName));
  const fallbackTeams = nationalTeams
    ? createAccessOrderedTeams(nationalTeams)
    : state.entries.map(entry => entry.teamName);
  const orderedRows = [
    ...rows,
    ...fallbackTeams
      .filter(teamName => !used.has(teamName))
      .map((teamName, index) => ({
        teamName,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        leagueTier: tierForRank(rows.length + index + 1),
        groupId: '',
        groupPosition: undefined,
        awayGoals: 0,
        awayWins: 0,
      })),
  ];

  return orderedRows.map((row, index) =>
    createEntry(row.teamName, index + 1, previousRanks.get(row.teamName), basis, row, orderedRows.length)
  );
};

export const UefaNationalRankingService = {
  createInitialState(nationalTeams: NationalTeam[]): UefaNationalRankingState {
    const orderedTeams = createAccessOrderedTeams(nationalTeams);
    const entries = orderedTeams.map((teamName, index) =>
      createEntry(teamName, index + 1, index + 1, 'ACCESS_LIST', undefined, orderedTeams.length)
    );

    return {
      entries,
      source: RANKING_SOURCE,
      lastUpdatedIso: new Date().toISOString(),
    };
  },

  ensureState(state: UefaNationalRankingState | null | undefined, nationalTeams: NationalTeam[]): UefaNationalRankingState {
    if (state?.entries?.length) return state;
    return UefaNationalRankingService.createInitialState(nationalTeams);
  },

  getRankedEuropeanTeams(state: UefaNationalRankingState | null | undefined, nationalTeams: NationalTeam[]): string[] {
    const ensured = UefaNationalRankingService.ensureState(state, nationalTeams);
    const available = new Set(getEuropeanTeams(nationalTeams));
    const ranked = ensured.entries.map(entry => entry.teamName).filter(name => available.has(name));
    const missing = [...available].filter(name => !ranked.includes(name)).sort((a, b) => a.localeCompare(b));
    return [...ranked, ...missing];
  },

  updateFromNationsLeagueState(
    state: UefaNationalRankingState,
    nationsLeagueState: NationsLeagueState,
    nationalTeams?: NationalTeam[]
  ): UefaNationalRankingState {
    const accessRanks = getAccessRankMap(state, nationalTeams);
    const leagueRows = buildLeaguePhaseRows(nationsLeagueState, accessRanks);
    const basis: RankingBasis = nationsLeagueState.completed ? 'FINAL' : 'LEAGUE_PHASE';
    const rows = nationsLeagueState.completed
      ? buildFinalOverallRows(moveFinalFourToTop(leagueRows, nationsLeagueState.finals), nationsLeagueState)
      : leagueRows;

    return {
      entries: buildEntriesFromRows(rows, state, basis, nationalTeams),
      source: nationsLeagueState.completed
        ? `${FINAL_SOURCE} ${nationsLeagueState.editionLabel}`
        : `${LEAGUE_PHASE_SOURCE} ${nationsLeagueState.editionLabel}`,
      lastUpdatedIso: new Date().toISOString(),
    };
  },

  applyResults(state: UefaNationalRankingState, _results: NTMatchResult[]): UefaNationalRankingState {
    return state;
  },
};
