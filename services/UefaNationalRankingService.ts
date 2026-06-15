import { NationalTeam, NationsLeagueTier, NTMatchResult, UefaNationalRankingEntry, UefaNationalRankingState } from '../types';

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

const RANKING_SOURCE = 'Startowy ranking UEFA reprezentacji według access list Ligi Narodów 2026/27';

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const rankEntries = (entries: UefaNationalRankingEntry[]): UefaNationalRankingEntry[] =>
  [...entries]
    .sort((a, b) => b.points - a.points || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({
      ...entry,
      previousRank: entry.rank,
      rank: index + 1,
    }));

const tierForRank = (rank: number, total: number): NationsLeagueTier => {
  if (rank <= 16) return 'A';
  if (rank <= 32) return 'B';
  if (rank <= 48) return 'C';
  return 'D';
};

const resultDelta = (result: NTMatchResult, teamName: string): number => {
  const isHome = result.home === teamName;
  const goalsFor = isHome ? result.homeGoals : result.awayGoals;
  const goalsAgainst = isHome ? result.awayGoals : result.homeGoals;
  const goalDiff = goalsFor - goalsAgainst;
  const stageBonus = result.competitionLabel.includes('Finały')
    ? 8
    : result.competitionLabel.includes('Ćwierćfinały')
      ? 5
      : 0;

  if (goalDiff > 0) return 18 + stageBonus + Math.min(6, goalDiff * 2);
  if (goalDiff === 0) return 7 + stageBonus;
  return Math.max(1, stageBonus + Math.max(0, 4 + goalDiff));
};

export const UefaNationalRankingService = {
  createInitialState(nationalTeams: NationalTeam[]): UefaNationalRankingState {
    const europeanTeams = nationalTeams
      .filter(team => team.continent === 'Europe' && team.name !== 'Rosja')
      .map(team => team.name);
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

    const entries = orderedTeams.map((teamName, index) => {
      const rank = index + 1;
      return {
        teamName,
        points: Math.max(100, 2200 - index * 25),
        rank,
        previousRank: rank,
        leagueTier: tierForRank(rank, orderedTeams.length),
        lastDelta: 0,
      };
    });

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
    const available = new Set(nationalTeams.filter(team => team.continent === 'Europe' && team.name !== 'Rosja').map(team => team.name));
    const ranked = ensured.entries.map(entry => entry.teamName).filter(name => available.has(name));
    const missing = [...available].filter(name => !ranked.includes(name)).sort((a, b) => a.localeCompare(b));
    return [...ranked, ...missing];
  },

  applyResults(state: UefaNationalRankingState, results: NTMatchResult[]): UefaNationalRankingState {
    if (results.length === 0) return state;
    const deltas = new Map<string, number>();

    results.forEach(result => {
      deltas.set(result.home, (deltas.get(result.home) ?? 0) + resultDelta(result, result.home));
      deltas.set(result.away, (deltas.get(result.away) ?? 0) + resultDelta(result, result.away));
    });

    const nextEntries = state.entries.map(entry => {
      const delta = deltas.get(entry.teamName) ?? 0;
      return {
        ...entry,
        points: entry.points + delta,
        lastDelta: delta,
      };
    });
    const ranked = rankEntries(nextEntries);
    return {
      ...state,
      entries: ranked.map(entry => ({ ...entry, leagueTier: tierForRank(entry.rank, ranked.length) })),
      lastUpdatedIso: new Date().toISOString(),
    };
  },
};
