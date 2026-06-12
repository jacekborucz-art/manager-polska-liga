import { Coach, Region, Club, MatchHistoryEntry, CoachHistoryEntry, Fixture, MatchStatus, NationalTeam, NTMatchResult } from '../types';
import { NameGeneratorService } from './NameGeneratorService';

const TACTICS_OFFENSIVE = ['4-3-3 Atak', '3-4-3', 'Wysoki Pressing', 'Total Football', '4-1-2-1-2'];
const TACTICS_NEUTRAL   = ['4-4-2', '4-3-3 Zrównoważona', '3-5-2', '4-5-1', '4-2-3-1', '5-3-2'];
const TACTICS_DEFENSIVE = ['5-4-1', '5-3-2 Blok', '4-4-2 Kontratak', 'Niski Blok', '4-5-1 Defensywna', '3-6-1'];

const randomTactic = (list: string[]) => list[Math.floor(Math.random() * list.length)];
const DEFAULT_HIRED_DATE = new Date('2025-07-01').toISOString();
const DEFAULT_CONTRACT_YEARS = 2;

const addYears = (dateIso: string, years: number): string => {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return new Date(2027, 6, 1).toISOString();
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString();
};

const roundSalary = (value: number): number => Math.max(50_000, Math.round(value / 10_000) * 10_000);

const coachQualityMultiplier = (coach: Coach): number => {
  const attrs = coach.attributes;
  const avg = (attrs.experience * 1.25 + attrs.decisionMaking + attrs.motivation * 0.85 + attrs.training * 0.7) / 3.8;
  return 0.72 + Math.max(0, Math.min(99, avg)) / 99 * 0.72;
};

const getClubSalaryBase = (club: Pick<Club, 'reputation'>): number => {
  const rep = club.reputation;
  if (rep >= 18) return 5_500_000;
  if (rep >= 15) return 3_000_000;
  if (rep >= 12) return 1_500_000;
  if (rep >= 9) return 850_000;
  if (rep >= 7) return 480_000;
  if (rep >= 4) return 220_000;
  return 90_000;
};

const getLeagueSalaryMultiplier = (leagueId: string): number => {
  if (leagueId === 'L_CL') return 1.35;
  if (leagueId === 'L_EL') return 1.15;
  if (leagueId === 'L_CONF') return 0.95;
  if (leagueId === 'L_PL_1') return 1.00;
  if (leagueId === 'L_PL_2') return 0.55;
  if (leagueId === 'L_PL_3') return 0.32;
  if (leagueId === 'L_PL_4') return 0.18;
  if (leagueId === 'L_SA') return 1.05;
  if (leagueId === 'L_ASIA') return 0.90;
  if (leagueId === 'L_NA') return 0.80;
  if (leagueId === 'L_AFRICA') return 0.45;
  return 0.70;
};

const getFallbackSalary = (coach: Coach): number => {
  const attrs = coach.attributes;
  const avg = (attrs.experience + attrs.decisionMaking + attrs.motivation + attrs.training) / 4;
  return roundSalary(60_000 + avg * 8_500);
};

const stableHash = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const isPolishClub = (club: Club): boolean =>
  club.country === 'POL' || club.leagueId.startsWith('L_PL_') || club.id.startsWith('PL_');

const getFixtureOutcome = (fixture: Fixture, clubId: string): 'WIN' | 'DRAW' | 'LOSS' | null => {
  if (fixture.homeScore === null || fixture.awayScore === null) return null;
  const isHome = fixture.homeTeamId === clubId;
  const isAway = fixture.awayTeamId === clubId;
  if (!isHome && !isAway) return null;

  const goalsFor = isHome ? fixture.homeScore : fixture.awayScore;
  const goalsAgainst = isHome ? fixture.awayScore : fixture.homeScore;
  if (goalsFor > goalsAgainst) return 'WIN';
  if (goalsFor < goalsAgainst) return 'LOSS';

  const homePens = fixture.homePenaltyScore;
  const awayPens = fixture.awayPenaltyScore;
  if (typeof homePens === 'number' && typeof awayPens === 'number' && homePens !== awayPens) {
    const wonPens = isHome ? homePens > awayPens : awayPens > homePens;
    return wonPens ? 'WIN' : 'LOSS';
  }

  return 'DRAW';
};

const getExpDelta = (club: Club, outcome: 'WIN' | 'DRAW' | 'LOSS', userTeamId?: string | null): number => {
  const polish = isPolishClub(club);
  if (polish && club.id === userTeamId) return 0;

  if (!polish) {
    if (outcome === 'WIN') return 5;
    if (outcome === 'DRAW') return 1;
    return -1;
  }

  if (outcome === 'WIN') return 1;
  if (outcome === 'DRAW') return 0.5;
  return -0.5;
};

const getNationalTeamExpDelta = (team: NationalTeam, outcome: 'WIN' | 'DRAW' | 'LOSS'): number => {
  const polish = team.region === Region.POLAND || team.name === 'Polska';
  if (!polish) {
    if (outcome === 'WIN') return 5;
    if (outcome === 'DRAW') return 1;
    return -1;
  }

  if (outcome === 'WIN') return 1;
  if (outcome === 'DRAW') return 0.5;
  return -0.5;
};

const getNationalTeamOutcome = (result: NTMatchResult, teamId: string): 'WIN' | 'DRAW' | 'LOSS' | null => {
  const isHome = result.homeTeamId === teamId;
  const isAway = result.awayTeamId === teamId;
  if (!isHome && !isAway) return null;

  const goalsFor = isHome ? result.homeGoals : result.awayGoals;
  const goalsAgainst = isHome ? result.awayGoals : result.homeGoals;
  if (goalsFor > goalsAgainst) return 'WIN';
  if (goalsFor < goalsAgainst) return 'LOSS';
  return 'DRAW';
};

const LEAGUE_PREFERRED_REGIONS: Partial<Record<string, Region[]>> = {
  'L_ASIA':   [Region.JAPAN, Region.KOREA, Region.ARABIA, Region.TURKEY, Region.KAZAKH, Region.AZERBAIJANI],
  'L_AFRICA': [Region.SSA, Region.ARABIA],
  'L_SA':     [Region.ARGENTINA, Region.BRAZIL, Region.SOUTH_AMERICAN, Region.IBERIA],
  'L_NA':     [Region.NORTH_AMERICA, Region.MEXICO],
};

const EUROPEAN_COACH_REGIONS = new Set<Region>([
  Region.BALKANS,
  Region.CZ_SK,
  Region.IBERIA,
  Region.SWEDEN,
  Region.SCANDINAVIA,
  Region.EX_USSR,
  Region.SPAIN,
  Region.ENGLAND,
  Region.GERMANY,
  Region.ITALY,
  Region.FRANCE,
  Region.TURKEY,
  Region.FINLAND,
  Region.GEORGIA,
  Region.ARMENIA,
  Region.ALBANIA,
  Region.ROMANIA,
  Region.BALTIC,
  Region.BENELUX,
  Region.HUNGARIAN,
  Region.MALTESE,
  Region.GREEK,
  Region.AZERBAIJANI,
  Region.KAZAKH,
]);

const getCoachExpPoints = (coach: Coach): number => Math.max(1, typeof coach.expPoints === 'number' ? coach.expPoints : 1);

const randomIntInclusive = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

const getInitialCoachExpForClub = (club: Pick<Club, 'reputation'>): number => {
  if (club.reputation >= 18) return randomIntInclusive(100, 200);
  if (club.reputation >= 15) return randomIntInclusive(75, 100);
  if (club.reputation >= 11) return randomIntInclusive(50, 75);
  return randomIntInclusive(1, 50);
};

const sortByCoachExp = (a: Coach, b: Coach): number =>
  getCoachExpPoints(b) - getCoachExpPoints(a) ||
  b.attributes.experience - a.attributes.experience ||
  b.attributes.decisionMaking - a.attributes.decisionMaking;

const isPreferredEuropeanCoach = (coach: Coach): boolean =>
  EUROPEAN_COACH_REGIONS.has(coach.nationality as Region);

export const CoachService = {
  getDefaultContractEndDate: (hiredDate: string = DEFAULT_HIRED_DATE): string => addYears(hiredDate, DEFAULT_CONTRACT_YEARS),

  calculateAnnualSalaryForClub: (club: Club, coach: Coach): number => {
    const base = getClubSalaryBase(club) * getLeagueSalaryMultiplier(club.leagueId);
    return roundSalary(base * coachQualityMultiplier(coach));
  },

  calculateAnnualSalaryForNationalTeam: (team: Pick<Club, 'reputation'>, coach: Coach): number => {
    const base = getClubSalaryBase(team);
    return roundSalary(base * 0.75 * coachQualityMultiplier(coach));
  },

  shouldRefuseContractExtension: (coach: Coach, club: Club, renewalDate: Date): boolean => {
    if ((coach.expPoints ?? 1) <= 200) return false;
    if (club.reputation >= 17) return false;

    const renewalKey = renewalDate.toISOString().split('T')[0];
    return stableHash(`${coach.id}|${club.id}|${renewalKey}|contract-renewal`) % 2 === 0;
  },

  findReplacementCoach: (
    coaches: Record<string, Coach>,
    club: Club,
    hireDate: Date,
    excludedCoachId?: string
  ): Coach | undefined => {
    const hireKey = hireDate.toISOString().split('T')[0];
    const candidates = Object.values(coaches).filter(coach =>
      !coach.currentClubId &&
      coach.id !== excludedCoachId &&
      (!coach.blacklist?.[club.id] || coach.blacklist[club.id] <= hireDate.getFullYear())
    );

    if (candidates.length === 0) return undefined;

    if (club.reputation < 12) {
      return candidates.sort((a, b) => b.attributes.experience - a.attributes.experience)[0];
    }

    const shouldSearchEurope = stableHash(`${club.id}|${hireKey}|coach-market-region`) % 100 < 99;
    const preferredCandidates = candidates.filter(isPreferredEuropeanCoach);
    const alternativeCandidates = candidates.filter(candidate => !isPreferredEuropeanCoach(candidate));
    const pool = shouldSearchEurope
      ? (preferredCandidates.length > 0 ? preferredCandidates : candidates)
      : (alternativeCandidates.length > 0 ? alternativeCandidates : candidates);
    const sorted = [...pool].sort(sortByCoachExp);

    if (club.reputation >= 17) {
      return sorted[0];
    }

    return sorted.find(candidate =>
      stableHash(`${candidate.id}|${club.id}|${hireKey}|coach-hire-agreement`) % 2 === 0
    );
  },

  normalizeCoachContract: (coach: Coach, club?: Club | null, nationalTeam?: Pick<Club, 'reputation'> | null): Coach => {
    const hiredDate = coach.hiredDate || DEFAULT_HIRED_DATE;
    const annualSalary = typeof coach.annualSalary === 'number' && coach.annualSalary > 0
      ? coach.annualSalary
      : club
        ? CoachService.calculateAnnualSalaryForClub(club, coach)
        : nationalTeam
          ? CoachService.calculateAnnualSalaryForNationalTeam(nationalTeam, coach)
          : getFallbackSalary(coach);

    return {
      ...coach,
      hiredDate,
      contractEndDate: coach.contractEndDate || CoachService.getDefaultContractEndDate(hiredDate),
      annualSalary,
      expPoints: Math.max(1, typeof coach.expPoints === 'number' ? coach.expPoints : 1),
    };
  },

  applyMatchExpForFinishedFixtures: (
    coaches: Record<string, Coach>,
    clubs: Club[],
    updatedFixtures: Fixture[],
    previousFixtures: Fixture[],
    userTeamId?: string | null
  ): Record<string, Coach> => {
    const previousById = new Map(previousFixtures.map(fixture => [fixture.id, fixture]));
    const clubById = new Map(clubs.map(club => [club.id, club]));
    let nextCoaches = coaches;

    const applyForClub = (fixture: Fixture, clubId: string): void => {
      const club = clubById.get(clubId);
      if (!club?.coachId) return;

      const coach = nextCoaches[club.coachId];
      if (!coach) return;

      const outcome = getFixtureOutcome(fixture, clubId);
      if (!outcome) return;

      const delta = getExpDelta(club, outcome, userTeamId);
      if (delta === 0) return;

      if (nextCoaches === coaches) nextCoaches = { ...coaches };
      nextCoaches[coach.id] = {
        ...coach,
        expPoints: Math.max(1, (typeof coach.expPoints === 'number' ? coach.expPoints : 1) + delta),
      };
    };

    updatedFixtures.forEach(fixture => {
      const previous = previousById.get(fixture.id);
      if (fixture.status !== MatchStatus.FINISHED || previous?.status === MatchStatus.FINISHED) return;
      applyForClub(fixture, fixture.homeTeamId);
      applyForClub(fixture, fixture.awayTeamId);
    });

    return nextCoaches;
  },

  applyNationalTeamExpForResults: (
    coaches: Record<string, Coach>,
    nationalTeams: NationalTeam[],
    results: NTMatchResult[]
  ): Record<string, Coach> => {
    const teamById = new Map(nationalTeams.map(team => [team.id, team]));
    let nextCoaches = coaches;

    const applyForTeam = (result: NTMatchResult, teamId?: string): void => {
      if (!teamId) return;
      const team = teamById.get(teamId);
      if (!team?.coachId) return;

      const coach = nextCoaches[team.coachId];
      if (!coach) return;

      const outcome = getNationalTeamOutcome(result, team.id);
      if (!outcome) return;

      const delta = getNationalTeamExpDelta(team, outcome);
      if (delta === 0) return;

      if (nextCoaches === coaches) nextCoaches = { ...coaches };
      nextCoaches[coach.id] = {
        ...coach,
        expPoints: Math.max(1, (typeof coach.expPoints === 'number' ? coach.expPoints : 1) + delta),
      };
    };

    results.forEach(result => {
      applyForTeam(result, result.homeTeamId);
      applyForTeam(result, result.awayTeamId);
    });

    return nextCoaches;
  },

  generateInitialCoaches: (clubs: Club[]): { coaches: Record<string, Coach>, updatedClubs: Club[] } => {
    const coaches: Record<string, Coach> = {};
    const coachList: Coach[] = [];

    for (let i = 0; i < 1500; i++) {
      coachList.push(CoachService.createRandomCoach(i < 180));
    }

const updatedClubs = [...clubs];
    // Inicjalizujemy wszystkich trenerów w mapie obiektów
    coachList.forEach(c => { coaches[c.id] = c; });

   // Losowe przypisanie trenerów do klubów na podstawie progów reputacji
    updatedClubs.forEach(club => {
      let minExp = 0;
      let maxExp = 55;

      if (club.leagueId === 'L_CL' || club.leagueId === 'L_EL' || club.leagueId === 'L_CONF') {
        // Trenerzy dla klubów europejskich — wg reputacji (koreluje z tier)
        if (club.reputation >= 18) { minExp = 80; maxExp = 99; }       // Tier 1 top (Real, Bayern, PSG)
        else if (club.reputation >= 15) { minExp = 70; maxExp = 88; }  // Tier 1 (Porto, Benfica)
        else if (club.reputation >= 12) { minExp = 48; maxExp = 75; }  // Tier 2 (Club Brugge, Dinamo)
        else { minExp = 10; maxExp = 60; }                             // Tier 3/4 (Sheriff, Žalgiris)
      } else {
        // Polskie kluby — stara logika
        if (club.reputation >= 7) maxExp = 72;
        else if (club.reputation >= 4) maxExp = 65;
      }

      // Szukamy wolnych trenerów spełniających kryterium doświadczenia
    // Dla europejskich Tier 1 i 2 (reputacja >= 12) — trener nie może być Polakiem
      const excludePolish = (club.leagueId === 'L_CL' || club.leagueId === 'L_EL' || club.leagueId === 'L_CONF') && club.reputation >= 12;

      const isPolishClub = club.leagueId.startsWith('L_PL_');
      const preferredRegions = LEAGUE_PREFERRED_REGIONS[club.leagueId];
      const polishCandidates = isPolishClub ? coachList.filter(c =>
        c.attributes.experience >= minExp &&
        c.attributes.experience <= maxExp &&
        c.currentClubId === null &&
        c.nationality === Region.POLAND
      ) : [];
      const regionalCandidates = preferredRegions ? coachList.filter(c =>
        c.attributes.experience >= minExp &&
        c.attributes.experience <= maxExp &&
        c.currentClubId === null &&
        preferredRegions.includes(c.nationality as Region)
      ) : [];
      const generalCandidates = coachList.filter(c =>
        c.attributes.experience >= minExp &&
        c.attributes.experience <= maxExp &&
        c.currentClubId === null &&
        (!excludePolish || c.nationality !== Region.POLAND)
      );
      const candidates = polishCandidates.length > 0
        ? polishCandidates
        : regionalCandidates.length > 0
          ? regionalCandidates
          : generalCandidates;

           // Jeśli nie znaleziono trenera — stopniowo obniżaj minExp o 5 aż do znalezienia
      let finalCandidates = candidates;
      let searchMinExp = minExp;
      while (finalCandidates.length === 0 && searchMinExp > 0) {
        searchMinExp = Math.max(0, searchMinExp - 5);
              finalCandidates = coachList.filter(c =>
          c.attributes.experience >= searchMinExp &&
          c.attributes.experience <= maxExp &&
          c.currentClubId === null &&
          (!excludePolish || c.nationality !== Region.POLAND)
        );
      }
      // Ostateczny failsafe — jeśli nadal brak, bierzemy jakiegokolwiek wolnego
      const coach = finalCandidates.length > 0
        ? finalCandidates[Math.floor(Math.random() * finalCandidates.length)]
        : coachList.find(c => c.currentClubId === null);
          if (coach) {
        const hiredDate = DEFAULT_HIRED_DATE;
        coach.currentClubId = club.id;
        coach.hiredDate = hiredDate;
        coach.contractEndDate = CoachService.getDefaultContractEndDate(hiredDate);
        coach.annualSalary = CoachService.calculateAnnualSalaryForClub(club, coach);
        coach.expPoints = getInitialCoachExpForClub(club);
        coach.history.push({
          clubId: club.id, clubName: club.name,
          fromYear: 2025, fromMonth: 7, toYear: null, toMonth: null
        });
        club.coachId = coach.id;

        // Dla europejskich Tier 1 (rep >= 18) — każdy atrybut poniżej 80 losujemy między 80-99
        if ((club.leagueId === 'L_CL' || club.leagueId === 'L_EL' || club.leagueId === 'L_CONF') && club.reputation >= 18) {
          const attrs = coach.attributes;
          const keys: (keyof typeof attrs)[] = ['experience', 'decisionMaking', 'motivation', 'training'];
          keys.forEach(key => {
            if (attrs[key] < 80) {
              attrs[key] = 80 + Math.floor(Math.random() * 20);
            }
          });
        }
      }
    });
    coachList.forEach(coach => {
      if (!coach.contractEndDate) coach.contractEndDate = CoachService.getDefaultContractEndDate(coach.hiredDate);
      if (!coach.annualSalary || coach.annualSalary <= 0) coach.annualSalary = getFallbackSalary(coach);
    });
    return { coaches, updatedClubs };
  },

createRandomCoach: (isPolish: boolean): Coach => {
    const region = isPolish ? Region.POLAND : NameGeneratorService.getRandomForeignRegion();
    const namePair = NameGeneratorService.getRandomName(region);
    return {
      id: `COACH_${Math.random().toString(36).substr(2, 9)}`,
      firstName: namePair.firstName,
      lastName: namePair.lastName,
      age: 35 + Math.floor(Math.random() * 35),
      nationality: region,
      nationalityFlag: isPolish ? '🇵🇱' : '🌍',
      currentClubId: null,
      currentNationalTeamId: null,
      isNationalTeamCoach: false,
      hiredDate: DEFAULT_HIRED_DATE, // Domyślna data startu sezonu
      contractEndDate: CoachService.getDefaultContractEndDate(DEFAULT_HIRED_DATE),
      annualSalary: 0,
      expPoints: 1,
      blacklist: {},
      attributes: {
        experience: 20 + Math.floor(Math.random() * 75),
        decisionMaking: 30 + Math.floor(Math.random() * 60),
        motivation: 40 + Math.floor(Math.random() * 55),
        training: 35 + Math.floor(Math.random() * 60)
      },
      favoriteTactics: {
        offensive: randomTactic(TACTICS_OFFENSIVE),
        neutral: randomTactic(TACTICS_NEUTRAL),
        defensive: randomTactic(TACTICS_DEFENSIVE)
      },
      history: [],
      seasonStats: []
    };
  },

  generateNationalTeamCoaches: (): Coach[] => {
    // Generuje ~500 trenerów dedykowanych reprezentacjom narodowym (overhead dla 208 drużyn)
    // Rozłożonych proporcjonalnie po 5 przedziałach doświadczenia odpowiadających reputacji NT
    const tiers = [
      { minExp: 85, maxExp: 99, count: 100 }, // rep 18-20: światowe potęgi
      { minExp: 65, maxExp: 84, count: 100 }, // rep 14-17: silne reprezentacje
      { minExp: 40, maxExp: 64, count: 120 }, // rep 10-13: średnie reprezentacje
      { minExp: 20, maxExp: 39, count: 100 }, // rep 6-9:  słabe reprezentacje
      { minExp: 5,  maxExp: 19, count: 80  }, // rep 1-5:  najsłabsze reprezentacje
    ];
    const result: Coach[] = [];
    tiers.forEach(({ minExp, maxExp, count }) => {
      for (let i = 0; i < count; i++) {
        const region = NameGeneratorService.getRandomForeignRegion();
        const namePair = NameGeneratorService.getRandomName(region);
        const exp = minExp + Math.floor(Math.random() * (maxExp - minExp + 1));
        result.push({
          id: `NT_COACH_${Math.random().toString(36).substr(2, 9)}`,
          firstName: namePair.firstName,
          lastName: namePair.lastName,
          age: 35 + Math.floor(Math.random() * 35),
          nationality: region,
          nationalityFlag: '🌍',
          currentClubId: null,
          currentNationalTeamId: null,
          isNationalTeamCoach: true,
          hiredDate: DEFAULT_HIRED_DATE,
          contractEndDate: CoachService.getDefaultContractEndDate(DEFAULT_HIRED_DATE),
          annualSalary: 0,
          expPoints: 1,
          blacklist: {},
          attributes: {
            experience: exp,
            decisionMaking: 20 + Math.floor(Math.random() * 79),
            motivation: 20 + Math.floor(Math.random() * 79),
            training: 20 + Math.floor(Math.random() * 79)
          },
          favoriteTactics: {
            offensive: randomTactic(TACTICS_OFFENSIVE),
            neutral: randomTactic(TACTICS_NEUTRAL),
            defensive: randomTactic(TACTICS_DEFENSIVE)
          },
          history: [],
          seasonStats: []
        });
      }
    });
    return result;
  },

  evaluatePerformance: (club: Club, coach: Coach, rank: number): { fire: boolean, reason: string } => {
    const board = club.board;

    // --- KROK 1: Oczekiwana pozycja ---
    // Baza z oczekiwań zarządu, korygowana przez reputację (klub słaby nie może mieć nierealistycznych oczekiwań)
    const EXPECTED_RANK_FROM_BOARD: Record<string, number> = {
      bardzo_wysoka: 3,
      wysoka:        6,
      przecietna:    12,
      niska:         15,
      bardzo_niska:  18,
    };
    const boardExpected = board ? EXPECTED_RANK_FROM_BOARD[board.oczekiwania] : 12;
    const repExpected   = Math.max(1, 15 - club.reputation);
    // Bierzemy gorsze z dwóch (wyższy rank = niższe oczekiwanie reputacyjne hamuje zbyt ambitny zarząd)
    const baseExpected  = Math.max(boardExpected, repExpected);

    // Ambicja przesuwa poprzeczkę: wysoka ambicja = surowszy próg, niska = odpuszcza
    const AMBICJA_OFFSET: Record<string, number> = {
      bardzo_wysoka: -2,
      wysoka:        -1,
      przecietna:     0,
      niska:         +2,
      bardzo_niska:  +4,
    };
    const ambicjaOffset = board ? AMBICJA_OFFSET[board.ambicja] : 0;
    const expectedRank  = Math.max(1, baseExpected + ambicjaOffset);

    // --- KROK 2: Gap i bazowe prawdopodobieństwo ---
    const gap = rank - expectedRank;

    let baseChance: number;
    if (gap <= 0)        baseChance = 0.00;
    else if (gap <= 2)   baseChance = 0.02;
    else if (gap <= 4)   baseChance = 0.08;
    else if (gap <= 6)   baseChance = 0.20;
    else if (gap <= 9)   baseChance = 0.35;
    else                 baseChance = 0.55;

    // Bonus za kompromitację: wielki klub w strefie spadkowej
    if (rank >= 16 && club.reputation >= 7) baseChance = Math.max(baseChance, 0.40) + 0.20;

    // --- KROK 3: Mnożnik cierpliwości ---
    const PATIENCE_MULTIPLIER: Record<string, number> = {
      bardzo_wysoka: 0.25,
      wysoka:        0.55,
      przecietna:    1.00,
      niska:         1.30,
      bardzo_niska:  1.80,
    };
    const multiplier = board ? PATIENCE_MULTIPLIER[board.cierpliwosc] : 1.00;

    // --- KROK 4: Minimalna liczba meczy zanim zarząd reaguje ---
    const MIN_MATCHES: Record<string, number> = {
      bardzo_wysoka: 22,
      wysoka:        17,
      przecietna:    13,
      niska:         9,
      bardzo_niska:  6,
    };
    const minMatches = board ? MIN_MATCHES[board.cierpliwosc] : 13;
    if (club.stats.played < minMatches) return { fire: false, reason: "" };

    // --- Finalna decyzja ---
    const finalChance = Math.min(0.95, baseChance * multiplier);
    if (finalChance <= 0) return { fire: false, reason: "" };

    if (Math.random() < finalChance) {
      if (rank >= 16 && club.reputation >= 7) return { fire: true, reason: "Kompromitująca pozycja w tabeli względem potencjału klubu." };
      if (gap >= 7) return { fire: true, reason: "Brak wyników sportowych i niezadowolenie kibiców." };
      if (gap >= 4) return { fire: true, reason: "Wyniki poniżej oczekiwań zarządu przez zbyt długi okres." };
      return { fire: true, reason: "Zarząd stracił cierpliwość do obecnego szkoleniowca." };
    }

    return { fire: false, reason: "" };
  }
};
