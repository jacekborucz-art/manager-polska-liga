import { Club, PolishVoivodeship, SeasonTemplate, TeamStats } from '../types';
import { FinanceService } from './FinanceService';
import { generateClubId } from '../resources/static_db/clubs/pl_clubs';
import { POLISH_FOURTH_LEAGUE_2026 } from '../resources/static_db/clubs/pl_fourth_league_2026';

export const FOURTH_LEAGUE_IDS = [
  'L_PL_5_DS', 'L_PL_5_KP', 'L_PL_5_LU', 'L_PL_5_LB',
  'L_PL_5_LD', 'L_PL_5_MA', 'L_PL_5_MZ', 'L_PL_5_OP',
  'L_PL_5_PK', 'L_PL_5_PD', 'L_PL_5_PM', 'L_PL_5_SL',
  'L_PL_5_SK', 'L_PL_5_WM', 'L_PL_5_WP', 'L_PL_5_ZP',
] as const;

export type FourthLeagueId = typeof FOURTH_LEAGUE_IDS[number];

export const FOURTH_LEAGUE_FEEDER_IDS = [
  'L_PL_6_DS', 'L_PL_6_KP', 'L_PL_6_LU', 'L_PL_6_LB',
  'L_PL_6_LD', 'L_PL_6_MA', 'L_PL_6_MZ', 'L_PL_6_OP',
  'L_PL_6_PK', 'L_PL_6_PD', 'L_PL_6_PM', 'L_PL_6_SL',
  'L_PL_6_SK', 'L_PL_6_WM', 'L_PL_6_WP', 'L_PL_6_ZP',
] as const;

export type FourthLeagueFeederId = typeof FOURTH_LEAGUE_FEEDER_IDS[number];

export const FOURTH_LEAGUE_BY_VOIVODESHIP: Record<PolishVoivodeship, FourthLeagueId> = {
  'dolnośląskie': 'L_PL_5_DS',
  'kujawsko-pomorskie': 'L_PL_5_KP',
  'lubelskie': 'L_PL_5_LU',
  'lubuskie': 'L_PL_5_LB',
  'łódzkie': 'L_PL_5_LD',
  'małopolskie': 'L_PL_5_MA',
  'mazowieckie': 'L_PL_5_MZ',
  'opolskie': 'L_PL_5_OP',
  'podkarpackie': 'L_PL_5_PK',
  'podlaskie': 'L_PL_5_PD',
  'pomorskie': 'L_PL_5_PM',
  'śląskie': 'L_PL_5_SL',
  'świętokrzyskie': 'L_PL_5_SK',
  'warmińsko-mazurskie': 'L_PL_5_WM',
  'wielkopolskie': 'L_PL_5_WP',
  'zachodniopomorskie': 'L_PL_5_ZP',
};

export const FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP: Record<PolishVoivodeship, FourthLeagueFeederId> = {
  'dolnośląskie': 'L_PL_6_DS',
  'kujawsko-pomorskie': 'L_PL_6_KP',
  'lubelskie': 'L_PL_6_LU',
  'lubuskie': 'L_PL_6_LB',
  'łódzkie': 'L_PL_6_LD',
  'małopolskie': 'L_PL_6_MA',
  'mazowieckie': 'L_PL_6_MZ',
  'opolskie': 'L_PL_6_OP',
  'podkarpackie': 'L_PL_6_PK',
  'podlaskie': 'L_PL_6_PD',
  'pomorskie': 'L_PL_6_PM',
  'śląskie': 'L_PL_6_SL',
  'świętokrzyskie': 'L_PL_6_SK',
  'warmińsko-mazurskie': 'L_PL_6_WM',
  'wielkopolskie': 'L_PL_6_WP',
  'zachodniopomorskie': 'L_PL_6_ZP',
};

export const FOURTH_LEAGUE_NAMES: Record<FourthLeagueId, string> = {
  L_PL_5_DS: 'IV liga dolnośląska',
  L_PL_5_KP: 'IV liga kujawsko-pomorska',
  L_PL_5_LU: 'IV liga lubelska',
  L_PL_5_LB: 'IV liga lubuska',
  L_PL_5_LD: 'IV liga łódzka',
  L_PL_5_MA: 'IV liga małopolska',
  L_PL_5_MZ: 'IV liga mazowiecka',
  L_PL_5_OP: 'IV liga opolska',
  L_PL_5_PK: 'IV liga podkarpacka',
  L_PL_5_PD: 'IV liga podlaska',
  L_PL_5_PM: 'IV liga pomorska',
  L_PL_5_SL: 'IV liga śląska',
  L_PL_5_SK: 'IV liga świętokrzyska',
  L_PL_5_WM: 'IV liga warmińsko-mazurska',
  L_PL_5_WP: 'IV liga wielkopolska',
  L_PL_5_ZP: 'IV liga zachodniopomorska',
};

export interface FourthLeagueFixture {
  id: string;
  leagueId: FourthLeagueId;
  round: number;
  date: string;
  homeClubId: string;
  awayClubId: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: 'SCHEDULED' | 'FINISHED';
}

export interface FourthLeaguePlayerStat {
  id: string;
  clubId: string;
  name: string;
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  ratingTotal: number;
}

export interface PolishFourthLeagueState {
  seasonStartYear: number;
  fixtures: Record<FourthLeagueId, FourthLeagueFixture[]>;
  playerStats: Record<FourthLeagueId, FourthLeaguePlayerStat[]>;
}

const EMPTY_STATS = (): TeamStats => ({
  points: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  played: 0,
  form: [],
});

const hash = (value: string): number => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};

const rngFor = (seed: number, key: string): (() => number) => {
  let state = (seed ^ hash(key)) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const shuffled = <T,>(values: readonly T[], seed: number, key: string): T[] => {
  const result = [...values];
  const rng = rngFor(seed, key);
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(rng() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};

const poisson = (expected: number, rng: () => number): number => {
  const limit = Math.exp(-expected);
  let product = 1;
  let count = 0;
  do {
    count++;
    product *= rng();
  } while (product > limit && count < 9);
  return count - 1;
};

const FIRST_NAMES = ['Jakub', 'Kacper', 'Mateusz', 'Michał', 'Bartosz', 'Patryk', 'Szymon', 'Dawid', 'Paweł', 'Piotr', 'Tomasz'];
const LAST_NAMES = ['Kowalski', 'Nowak', 'Wiśniewski', 'Wójcik', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak', 'Dąbrowski', 'Kozłowski'];

const makePlayerStats = (leagueId: FourthLeagueId, clubs: Club[]): FourthLeaguePlayerStat[] =>
  clubs.flatMap(club => Array.from({ length: 11 }, (_, index) => {
    const nameSeed = hash(`${club.id}|${index}`);
    return {
      id: `IV_STAT_${club.id}_${index}`,
      clubId: club.id,
      name: `${FIRST_NAMES[(nameSeed + index) % FIRST_NAMES.length]} ${LAST_NAMES[(nameSeed >>> 5) % LAST_NAMES.length]}`,
      appearances: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      ratingTotal: 0,
    };
  }));

const createSchedule = (
  leagueId: FourthLeagueId,
  clubIds: string[],
  template: SeasonTemplate,
  seed: number
): FourthLeagueFixture[] => {
  // Every configured regional league has an even size (14, 16 or 18). The
  // circle method therefore needs no artificial bye team and produces exactly
  // two meetings per pair, regardless of the regional association's size.
  const ids = shuffled(clubIds, seed, leagueId);
  const fixed = ids[0];
  let rotating = ids.slice(1);
  const firstHalf: Array<Array<{ home: string; away: string }>> = [];
  for (let round = 0; round < ids.length - 1; round++) {
    const pairs: Array<{ home: string; away: string }> = [];
    const fixedOpponent = rotating[rotating.length - 1];
    pairs.push(round % 2 === 0
      ? { home: fixed, away: fixedOpponent }
      : { home: fixedOpponent, away: fixed });
    for (let index = 0; index < ids.length / 2 - 1; index++) {
      const left = rotating[index];
      const right = rotating[rotating.length - 2 - index];
      pairs.push(round % 2 === 0 ? { home: left, away: right } : { home: right, away: left });
    }
    firstHalf.push(pairs);
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }

  const leagueSlots = template.slots
    .filter(slot => String(slot.competition) === 'LEAGUE')
    .sort((left, right) => left.start.getTime() - right.start.getTime());
  const roundCount = (ids.length - 1) * 2;
  if (leagueSlots.length < roundCount) {
    throw new Error(`${leagueId} requires ${roundCount} league dates; only ${leagueSlots.length} are available.`);
  }

  // Shorter regional competitions should not finish several weeks before the
  // rest of the football pyramid. Both the 14- and 16-team formats therefore
  // end on the 33rd shared league date (15 May in the 2026/27 calendar), while
  // the 18-team format keeps all 34 dates and ends on 23 May. Working backwards
  // from that common finish gives a later start to the shorter formats without
  // deleting a fixture: 16 teams use slots 4-33 and 14 teams use slots 8-33.
  // Every pair still plays exactly once at home and once away.
  const lastSlotExclusive = ids.length < 18 ? 33 : 34;
  const firstSlotIndex = lastSlotExclusive - roundCount;
  const scheduledLeagueSlots = leagueSlots.slice(firstSlotIndex, lastSlotExclusive);

  return Array.from({ length: roundCount }, (_, roundIndex) => {
    const secondHalf = roundIndex >= ids.length - 1;
    const base = firstHalf[roundIndex % (ids.length - 1)];
    return base.map((pair, matchIndex): FourthLeagueFixture => ({
      id: `IV_${template.seasonStartYear}_${leagueId}_R${roundIndex + 1}_M${matchIndex + 1}`,
      leagueId,
      round: roundIndex + 1,
      date: scheduledLeagueSlots[roundIndex].start.toISOString(),
      homeClubId: secondHalf ? pair.away : pair.home,
      awayClubId: secondHalf ? pair.home : pair.away,
      homeGoals: null,
      awayGoals: null,
      status: 'SCHEDULED',
    }));
  }).flat();
};

const updateTable = (club: Club, goalsFor: number, goalsAgainst: number): Club => {
  const win = goalsFor > goalsAgainst;
  const draw = goalsFor === goalsAgainst;
  const form: TeamStats['form'][number] = win ? 'W' : draw ? 'R' : 'P';
  return {
    ...club,
    stats: {
      ...club.stats,
      played: club.stats.played + 1,
      wins: club.stats.wins + (win ? 1 : 0),
      draws: club.stats.draws + (draw ? 1 : 0),
      losses: club.stats.losses + (!win && !draw ? 1 : 0),
      goalsFor: club.stats.goalsFor + goalsFor,
      goalsAgainst: club.stats.goalsAgainst + goalsAgainst,
      goalDifference: club.stats.goalDifference + goalsFor - goalsAgainst,
      points: club.stats.points + (win ? 3 : draw ? 1 : 0),
      form: [...(club.stats.form ?? []), form].slice(-5),
    },
  };
};

const applyPlayerStats = (
  rows: FourthLeaguePlayerStat[],
  clubId: string,
  goals: number,
  conceded: number,
  rng: () => number
): FourthLeaguePlayerStat[] => {
  const clubRows = rows.filter(row => row.clubId === clubId);
  const changed = new Map(clubRows.map(row => [row.id, {
    ...row,
    appearances: row.appearances + 1,
    ratingTotal: row.ratingTotal + Math.max(5.2, Math.min(8.8, 6.45 + goals * 0.18 - conceded * 0.1 + (rng() - 0.5) * 0.8)),
  }]));
  for (let goal = 0; goal < goals; goal++) {
    const scorer = clubRows[Math.floor(rng() * Math.min(8, clubRows.length))];
    const assist = clubRows[Math.floor(rng() * clubRows.length)];
    changed.get(scorer.id)!.goals += 1;
    if (assist.id !== scorer.id && rng() > 0.14) changed.get(assist.id)!.assists += 1;
  }
  const yellowCount = rng() < 0.72 ? 1 + Math.floor(rng() * 3) : 0;
  for (let card = 0; card < yellowCount; card++) {
    changed.get(clubRows[Math.floor(rng() * clubRows.length)].id)!.yellowCards += 1;
  }
  if (rng() < 0.055) changed.get(clubRows[Math.floor(rng() * clubRows.length)].id)!.redCards += 1;
  return rows.map(row => changed.get(row.id) ?? row);
};

const reserveParentName = (name: string): string | null => {
  const stripped = name
    .replace(/\s+(II|III)$/i, '')
    .replace(/^(.+?)\s+(?:II|III)\s+(.+)$/i, '$1 $2')
    .trim();
  return stripped === name ? null : stripped;
};

const createRegionalPoolClub = (
  voivodeship: PolishVoivodeship,
  poolId: FourthLeagueFeederId,
  seasonStartYear: number,
  number: number,
  occupiedIds: Set<string>
): Club => {
  // These records deliberately stay lightweight: they are real promotion
  // candidates, but the game does not allocate a complete squad or a full
  // match engine to the unplayable district level. A year and a collision-safe
  // ordinal make every generated id stable across repeated simulations.
  let ordinal = number;
  let id = `PL_DISTRICT_${poolId}_${seasonStartYear}_${ordinal}`;
  while (occupiedIds.has(id)) {
    ordinal++;
    id = `PL_DISTRICT_${poolId}_${seasonStartYear}_${ordinal}`;
  }
  occupiedIds.add(id);
  const name = `Klub okręgowy ${voivodeship} ${ordinal}`;
  const reputation = 1 + (hash(id) % 3);
  const budget = FinanceService.calculateInitialBudget(6, reputation);
  return {
    id,
    name,
    shortName: `KO${ordinal}`,
    leagueId: poolId,
    tier: 6,
    colorsHex: ['#183a5a', '#ffffff'],
    colorPrimary: '#183a5a',
    colorSecondary: '#ffffff',
    stadiumName: `Stadion okręgowy ${ordinal}`,
    stadiumCapacity: 500 + (hash(`${id}|stadium`) % 1001),
    reputation,
    country: 'Polska',
    polishVoivodeship: voivodeship,
    isDefaultActive: false,
    rosterIds: [],
    stats: EMPTY_STATS(),
    budget,
    transferBudget: 0,
    reserveBudget: 0,
    boardStrictness: 5,
    signingBonusPool: 0,
    boardConfidence: 70,
  };
};

export const PolishFourthLeagueService = {
  isFourthLeagueId(value: string | null | undefined): value is FourthLeagueId {
    return FOURTH_LEAGUE_IDS.includes(value as FourthLeagueId);
  },

  isFourthLeagueFeederId(value: string | null | undefined): value is FourthLeagueFeederId {
    return FOURTH_LEAGUE_FEEDER_IDS.includes(value as FourthLeagueFeederId);
  },

  isLightweightRegionalLeagueId(value: string | null | undefined): boolean {
    return this.isFourthLeagueId(value) || this.isFourthLeagueFeederId(value);
  },

  getLeagueForVoivodeship(voivodeship: PolishVoivodeship): FourthLeagueId {
    return FOURTH_LEAGUE_BY_VOIVODESHIP[voivodeship];
  },

  getFeederLeagueForVoivodeship(voivodeship: PolishVoivodeship): FourthLeagueFeederId {
    return FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP[voivodeship];
  },

  getVoivodeshipForFeederLeague(leagueId: FourthLeagueFeederId): PolishVoivodeship {
    const match = (Object.entries(FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP) as Array<[PolishVoivodeship, FourthLeagueFeederId]>)
      .find(([, candidateLeagueId]) => candidateLeagueId === leagueId);
    if (!match) throw new Error(`Unknown Polish district-pool id: ${leagueId}.`);
    return match[0];
  },

  getVoivodeshipForLeague(leagueId: FourthLeagueId): PolishVoivodeship {
    const match = (Object.entries(FOURTH_LEAGUE_BY_VOIVODESHIP) as Array<[PolishVoivodeship, FourthLeagueId]>)
      .find(([, candidateLeagueId]) => candidateLeagueId === leagueId);
    if (!match) throw new Error(`Unknown Polish IV-liga id: ${leagueId}.`);
    return match[0];
  },

  /**
   * Merges the researched 2026/27 membership with existing database/datapack
   * clubs. Existing ids win, so a datapack can improve a club's crest, stadium
   * or strength without breaking the regional competition. Missing teams are
   * represented by deliberately inactive lightweight Club records.
   */
  mergeCareerClubs(sourceClubs: Club[], startYear: number): Club[] {
    if (startYear !== 2026) return sourceClubs;
    const result = sourceClubs.map(club => ({ ...club }));
    const byId = new Map(result.map(club => [club.id, club]));
    const byName = new Map(result.map(club => [club.name.toLocaleLowerCase('pl-PL'), club]));

    (Object.entries(POLISH_FOURTH_LEAGUE_2026) as Array<[PolishVoivodeship, readonly string[]]>).forEach(([voivodeship, names]) => {
      const leagueId = FOURTH_LEAGUE_BY_VOIVODESHIP[voivodeship];
      names.forEach((name, index) => {
        const generatedId = generateClubId(name);
        const existing = byId.get(generatedId) ?? byName.get(name.toLocaleLowerCase('pl-PL'));
        if (existing) {
          existing.leagueId = leagueId;
          existing.tier = 5;
          existing.polishVoivodeship = voivodeship;
          existing.isDefaultActive = false;
          existing.stats = EMPTY_STATS();
          return;
        }
        const reputation = 1 + (hash(`${voivodeship}|${name}`) % 3);
        const budget = FinanceService.calculateInitialBudget(5, reputation);
        const club: Club = {
          id: generatedId,
          name,
          shortName: name.replace(/[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, '').slice(0, 4).toUpperCase(),
          leagueId,
          tier: 5,
          colorsHex: ['#17345f', '#ffffff', '#d9273e'],
          colorPrimary: '#17345f',
          colorSecondary: '#ffffff',
          stadiumName: `Stadion ${name}`,
          stadiumCapacity: 800 + (hash(name) % 2201),
          reputation,
          country: 'Polska',
          polishVoivodeship: voivodeship,
          // Inactive here means "not part of the full playable-world engine".
          // The dedicated IV-liga service still simulates and displays the club.
          isDefaultActive: false,
          rosterIds: [],
          stats: EMPTY_STATS(),
          budget,
          transferBudget: 0,
          reserveBudget: 0,
          boardStrictness: 5,
          signingBonusPool: 0,
          boardConfidence: 70,
        };
        result.push(club);
        byId.set(club.id, club);
        byName.set(name.toLocaleLowerCase('pl-PL'), club);
      });
    });
    return result;
  },

  /**
   * Creates one private, 18-club promotion pool for every voivodeship. Existing
   * database or datapack clubs are preferred whenever their regional metadata
   * is available; deterministic placeholders only fill genuine database gaps.
   * The pool has no fixtures of its own and exists solely to provide stable,
   * region-correct candidates for promotion to the appropriate IV liga.
   */
  ensureRegionalFeederPools(clubs: Club[], seasonStartYear: number): Club[] {
    let result = clubs.map(club => ({ ...club }));
    const occupiedIds = new Set(result.map(club => club.id));

    (Object.keys(FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP) as PolishVoivodeship[]).forEach(voivodeship => {
      const poolId = FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP[voivodeship];
      let poolSize = result.filter(club => club.leagueId === poolId).length;
      if (poolSize < 18) {
        const candidates = result
          .filter(club => club.leagueId === 'L_PL_5' && club.polishVoivodeship === voivodeship)
          .sort((left, right) =>
            right.reputation - left.reputation ||
            hash(`${seasonStartYear}|${voivodeship}|${left.id}`) - hash(`${seasonStartYear}|${voivodeship}|${right.id}`)
          )
          .slice(0, 18 - poolSize);
        const selectedIds = new Set(candidates.map(club => club.id));
        result = result.map(club => selectedIds.has(club.id)
          ? { ...club, leagueId: poolId, tier: 6, isDefaultActive: false, stats: EMPTY_STATS() }
          : club);
        poolSize += candidates.length;
      }

      while (poolSize < 18) {
        result.push(createRegionalPoolClub(voivodeship, poolId, seasonStartYear, poolSize + 1, occupiedIds));
        poolSize++;
      }
    });
    return result;
  },

  createSeason(clubs: Club[], template: SeasonTemplate, seed: number): { state: PolishFourthLeagueState; clubs: Club[] } {
    const resetClubs = clubs.map(club => this.isFourthLeagueId(club.leagueId)
      ? { ...club, tier: 5, isDefaultActive: false, stats: EMPTY_STATS() }
      : club);
    const fixtures = {} as Record<FourthLeagueId, FourthLeagueFixture[]>;
    const playerStats = {} as Record<FourthLeagueId, FourthLeaguePlayerStat[]>;
    FOURTH_LEAGUE_IDS.forEach((leagueId, index) => {
      const leagueClubs = resetClubs.filter(club => club.leagueId === leagueId);
      if (![14, 16, 18].includes(leagueClubs.length)) {
        throw new Error(`${leagueId} must contain 14, 16 or 18 clubs; received ${leagueClubs.length}.`);
      }
      fixtures[leagueId] = createSchedule(leagueId, leagueClubs.map(club => club.id), template, seed + 500 + index);
      playerStats[leagueId] = makePlayerStats(leagueId, leagueClubs);
    });
    return { state: { seasonStartYear: template.seasonStartYear, fixtures, playerStats }, clubs: resetClubs };
  },

  rebalanceForNextSeason(clubs: Club[], seasonStartYear: number, seed: number): Club[] {
    // Older development saves may not contain the regional pools yet. Building
    // them here as well as on career creation keeps the transition atomic and
    // guarantees that every voivodeship starts with eighteen candidates.
    let result = this.ensureRegionalFeederPools(clubs, seasonStartYear);

    // A relegated first team can arrive in the same IV-liga tier as its own
    // reserves. Resolve that cascade before sizing the regional competitions.
    // The reserve side moves into its own voivodeship's pool instead of a
    // generic nationwide bucket, so it can only return to the correct IV liga.
    const reserveConflictIds = new Set(result
      .filter(club => this.isFourthLeagueId(club.leagueId))
      .filter(club => {
        const parentName = reserveParentName(club.name);
        if (!parentName) return false;
        const normalizedParentName = parentName.toLocaleLowerCase('pl-PL');
        return result.some(candidate =>
          candidate.id !== club.id &&
          this.isFourthLeagueId(candidate.leagueId) &&
          (candidate.name.toLocaleLowerCase('pl-PL') === normalizedParentName ||
            (normalizedParentName.length >= 5 && candidate.name.toLocaleLowerCase('pl-PL').includes(normalizedParentName)))
        );
      })
      .map(club => club.id));
    if (reserveConflictIds.size > 0) {
      result = result.map(club => {
        if (!reserveConflictIds.has(club.id)) return club;
        const voivodeship = club.polishVoivodeship ?? this.getVoivodeshipForLeague(club.leagueId as FourthLeagueId);
        return {
          ...club,
          leagueId: FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP[voivodeship],
          tier: 6,
          isDefaultActive: false,
          stats: EMPTY_STATS(),
        };
      });
    }

    (Object.entries(POLISH_FOURTH_LEAGUE_2026) as Array<[PolishVoivodeship, readonly string[]]>).forEach(([voivodeship, baseline]) => {
      const leagueId = FOURTH_LEAGUE_BY_VOIVODESHIP[voivodeship];
      const poolId = FOURTH_LEAGUE_FEEDER_BY_VOIVODESHIP[voivodeship];
      const targetSize = baseline.length;
      const current = this.getTable(result, leagueId);

      // Four clubs always arrive from the local 18-team pool. The draw is 70%
      // RNG and 30% club reputation: stronger teams have a meaningful edge,
      // while an upset remains possible every season. A seed-derived score per
      // club makes the result reproducible in saves and automated tests.
      const promotionCandidates = result
        .filter(club => club.leagueId === poolId && !reserveConflictIds.has(club.id))
        .filter(club => this.canReserveEnterFourthLeague(club, result))
        .map(club => {
          const rng = rngFor(seed, `IV_POOL_DRAW|${seasonStartYear}|${poolId}|${club.id}`);
          const strength = Math.max(0, Math.min(1, (club.reputation - 1) / 19));
          return { club, score: rng() * 0.7 + strength * 0.3 };
        })
        .sort((left, right) => right.score - left.score || left.club.id.localeCompare(right.club.id));
      if (promotionCandidates.length < 4) {
        throw new Error(`${poolId} has fewer than four eligible promotion candidates.`);
      }
      const promotedIds = new Set(promotionCandidates.slice(0, 4).map(candidate => candidate.club.id));

      // III-liga traffic changes the number of IV-liga relegations in a given
      // voivodeship. Four incoming pool clubs are fixed; relegating N + 4 - T
      // bottom teams (current size N, target T) absorbs every regional cascade
      // and returns the competition to its configured 14/16/18-team size.
      const relegationCount = Math.max(0, current.length + promotedIds.size - targetSize);
      const relegatedIds = new Set(current.slice(Math.max(0, current.length - relegationCount)).map(club => club.id));
      result = result.map(club => {
        if (promotedIds.has(club.id)) {
          return { ...club, leagueId, tier: 5, isDefaultActive: false, stats: EMPTY_STATS() };
        }
        if (relegatedIds.has(club.id)) {
          return { ...club, leagueId: poolId, tier: 6, isDefaultActive: false, stats: EMPTY_STATS() };
        }
        return club;
      });

      // The exchange can temporarily leave more or fewer than eighteen clubs
      // in the pool. Prefer retaining freshly relegated IV-liga sides, move any
      // weakest surplus to the deeper generic database bucket, then refill a
      // shortage with same-region datapack clubs or stable placeholders.
      let poolClubs = result.filter(club => club.leagueId === poolId);
      if (poolClubs.length > 18) {
        const surplusCount = poolClubs.length - 18;
        const surplusIds = new Set(poolClubs
          .filter(club => !relegatedIds.has(club.id))
          .sort((left, right) =>
            left.reputation - right.reputation ||
            hash(`${seed}|POOL_SURPLUS|${left.id}`) - hash(`${seed}|POOL_SURPLUS|${right.id}`)
          )
          .slice(0, surplusCount)
          .map(club => club.id));
        result = result.map(club => surplusIds.has(club.id)
          ? { ...club, leagueId: 'L_PL_5', tier: 6, isDefaultActive: false, stats: EMPTY_STATS() }
          : club);
      }

      poolClubs = result.filter(club => club.leagueId === poolId);
      if (poolClubs.length < 18) {
        const replacements = result
          .filter(club => club.leagueId === 'L_PL_5' && club.polishVoivodeship === voivodeship)
          .sort((left, right) =>
            right.reputation - left.reputation ||
            hash(`${seed}|POOL_REFILL|${left.id}`) - hash(`${seed}|POOL_REFILL|${right.id}`)
          )
          .slice(0, 18 - poolClubs.length);
        const replacementIds = new Set(replacements.map(club => club.id));
        result = result.map(club => replacementIds.has(club.id)
          ? { ...club, leagueId: poolId, tier: 6, isDefaultActive: false, stats: EMPTY_STATS() }
          : club);
      }

      const occupiedIds = new Set(result.map(club => club.id));
      let missing = 18 - result.filter(club => club.leagueId === poolId).length;
      while (missing > 0) {
        const ordinal = 19 - missing;
        result.push(createRegionalPoolClub(voivodeship, poolId, seasonStartYear, ordinal, occupiedIds));
        missing--;
      }
    });
    return result;
  },

  processDate(
    state: PolishFourthLeagueState | null,
    clubs: Club[],
    date: Date,
    seed: number
  ): { state: PolishFourthLeagueState | null; clubs: Club[]; played: number } {
    if (!state) return { state, clubs, played: 0 };
    const cutoff = date.getTime();
    const clubById = new Map(clubs.map(club => [club.id, club]));
    const nextFixtures = { ...state.fixtures };
    const nextPlayerStats = { ...state.playerStats };
    let played = 0;

    FOURTH_LEAGUE_IDS.forEach(leagueId => {
      let statsRows = nextPlayerStats[leagueId];
      nextFixtures[leagueId] = state.fixtures[leagueId].map(fixture => {
        if (fixture.status === 'FINISHED' || new Date(fixture.date).getTime() > cutoff) return fixture;
        const home = clubById.get(fixture.homeClubId);
        const away = clubById.get(fixture.awayClubId);
        if (!home || !away) return fixture;
        const rng = rngFor(seed, fixture.id);
        const strengthDifference = (home.reputation - away.reputation) * 2.2;
        const homeGoals = poisson(Math.max(0.25, Math.min(3.25, 1.48 + strengthDifference / 10)), rng);
        const awayGoals = poisson(Math.max(0.2, Math.min(3, 1.14 - strengthDifference / 10)), rng);
        clubById.set(home.id, updateTable(home, homeGoals, awayGoals));
        clubById.set(away.id, updateTable(away, awayGoals, homeGoals));
        statsRows = applyPlayerStats(statsRows, home.id, homeGoals, awayGoals, rng);
        statsRows = applyPlayerStats(statsRows, away.id, awayGoals, homeGoals, rng);
        played++;
        return { ...fixture, homeGoals, awayGoals, status: 'FINISHED' };
      });
      nextPlayerStats[leagueId] = statsRows;
    });

    if (played === 0) return { state, clubs, played: 0 };
    return {
      state: { ...state, fixtures: nextFixtures, playerStats: nextPlayerStats },
      clubs: clubs.map(club => clubById.get(club.id) ?? club),
      played,
    };
  },

  getTable(clubs: Club[], leagueId: FourthLeagueId): Club[] {
    return clubs
      .filter(club => club.leagueId === leagueId)
      .sort((left, right) =>
        right.stats.points - left.stats.points ||
        right.stats.goalDifference - left.stats.goalDifference ||
        right.stats.goalsFor - left.stats.goalsFor ||
        left.name.localeCompare(right.name, 'pl')
      );
  },

  canReserveEnterThirdLeague(club: Club, clubs: Club[]): boolean {
    const parentName = reserveParentName(club.name);
    if (!parentName) return true;
    const normalizedParentName = parentName.toLocaleLowerCase('pl-PL');
    const parent = clubs.find(candidate => {
      const candidateName = candidate.name.toLocaleLowerCase('pl-PL');
      return candidateName === normalizedParentName ||
        (normalizedParentName.length >= 5 && candidateName.includes(normalizedParentName));
    });
    return !parent || !/^L_PL_4(?:_|$)/.test(parent.leagueId);
  },

  canReserveEnterFourthLeague(club: Club, clubs: Club[]): boolean {
    const parentName = reserveParentName(club.name);
    if (!parentName) return true;
    const normalizedParentName = parentName.toLocaleLowerCase('pl-PL');
    const parent = clubs.find(candidate => {
      if (candidate.id === club.id) return false;
      const candidateName = candidate.name.toLocaleLowerCase('pl-PL');
      return candidateName === normalizedParentName ||
        (normalizedParentName.length >= 5 && candidateName.includes(normalizedParentName));
    });
    return !parent || !this.isFourthLeagueId(parent.leagueId);
  },
};
