import { FinanceService } from '../services/FinanceService';
import { TransferSellerLogicService } from '../services/TransferSellerLogicService';
import {
  BoardAttributeLevel,
  Club,
  HealthStatus,
  Player,
  PlayerPosition,
  Region,
  TeamStats,
} from '../types';

type BalanceScenario = {
  id: string;
  label: string;
  player: Player;
  sellerClub: Club;
  sellerSquad: Player[];
  boardKompetencja?: BoardAttributeLevel;
  marketValueRange: [number, number];
  askingPriceRange: [number, number];
};

const TEAM_STATS_TEMPLATE: TeamStats = {
  points: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  played: 0,
  form: [],
};

const DEFAULT_BOARD_LEVEL: BoardAttributeLevel = 'przecietna';
const TEST_DATE = new Date('2026-04-15T12:00:00Z');

const failures: string[] = [];

const assertInRange = (value: number, [min, max]: [number, number], message: string) => {
  if (value >= min && value <= max) return;
  failures.push(
    `${message}. Expected ${min.toLocaleString()}-${max.toLocaleString()} PLN, got ${value.toLocaleString()} PLN`
  );
};

const assertGreaterThan = (left: number, right: number, message: string) => {
  if (left > right) return;
  failures.push(
    `${message}. Expected ${left.toLocaleString()} PLN to be greater than ${right.toLocaleString()} PLN`
  );
};

const assertLessThan = (left: number, right: number, message: string) => {
  if (left < right) return;
  failures.push(
    `${message}. Expected ${left.toLocaleString()} PLN to be lower than ${right.toLocaleString()} PLN`
  );
};

const averageRatingHistory = (average: number, matches: number): number[] =>
  Array.from({ length: Math.max(0, matches) }, () => average);

const createClub = (overrides: Partial<Club> = {}): Club => ({
  id: 'PL_TEST_CLUB',
  name: 'Test FC',
  shortName: 'TFC',
  leagueId: 'PL_LEAGUE_1',
  tier: 1,
  colorsHex: ['#ffffff', '#000000'],
  stadiumName: 'Test Arena',
  stadiumCapacity: 18_000,
  reputation: 6,
  country: 'POL',
  isDefaultActive: true,
  rosterIds: [],
  stats: { ...TEAM_STATS_TEMPLATE },
  budget: 12_000_000,
  transferBudget: 4_000_000,
  boardStrictness: 5,
  signingBonusPool: 600_000,
  board: {
    hojnosc: DEFAULT_BOARD_LEVEL,
    ambicja: DEFAULT_BOARD_LEVEL,
    cierpliwosc: DEFAULT_BOARD_LEVEL,
    chciwosc: DEFAULT_BOARD_LEVEL,
    oczekiwania: DEFAULT_BOARD_LEVEL,
    kompetencja: DEFAULT_BOARD_LEVEL,
  },
  ...overrides,
});

const createPlayer = ({
  id,
  position,
  overallRating,
  age,
  goals = 0,
  assists = 0,
  matchesPlayed = 0,
  minutesPlayed = 0,
  averageRating = 6.8,
  cleanSheets = 0,
  talent = 72,
  contractEndDate = '2028-06-30',
  clubId = 'PL_TEST_CLUB',
  annualSalary = 1_200_000,
  isUntouchable = false,
  isOnTransferList = false,
}: {
  id: string;
  position: PlayerPosition;
  overallRating: number;
  age: number;
  goals?: number;
  assists?: number;
  matchesPlayed?: number;
  minutesPlayed?: number;
  averageRating?: number;
  cleanSheets?: number;
  talent?: number;
  contractEndDate?: string;
  clubId?: string;
  annualSalary?: number;
  isUntouchable?: boolean;
  isOnTransferList?: boolean;
}): Player => ({
  id,
  firstName: 'Test',
  lastName: id,
  age,
  clubId,
  nationality: Region.POLAND,
  position,
  overallRating,
  attributes: {
    strength: overallRating,
    stamina: overallRating,
    pace: overallRating,
    defending: position === PlayerPosition.DEF ? overallRating + 3 : overallRating - 2,
    passing: overallRating,
    attacking: position === PlayerPosition.FWD ? overallRating + 2 : overallRating - 1,
    finishing: position === PlayerPosition.FWD ? overallRating + 4 : overallRating - 2,
    technique: overallRating,
    vision: overallRating,
    dribbling: overallRating,
    heading: overallRating - 1,
    positioning: overallRating,
    goalkeeping: position === PlayerPosition.GK ? overallRating + 4 : 10,
    freeKicks: overallRating - 3,
    talent,
    penalties: overallRating - 2,
    corners: overallRating - 4,
    aggression: overallRating - 2,
    crossing: overallRating - 1,
    leadership: overallRating,
    mentality: overallRating + 1,
    workRate: overallRating + 1,
  },
  stats: {
    goals,
    assists,
    yellowCards: 0,
    redCards: 0,
    cleanSheets,
    matchesPlayed,
    minutesPlayed,
    seasonalChanges: {},
    ratingHistory: averageRatingHistory(averageRating, matchesPlayed),
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate,
  annualSalary,
  isOnTransferList,
  marketValue: 0,
  history: [
    {
      clubName: 'Old Club',
      clubId,
      fromYear: 2022,
      fromMonth: 7,
      toYear: 2025,
      toMonth: 6,
      statsSnapshot: {
        matchesPlayed: Math.max(matchesPlayed, 26),
        goals: goals,
        assists: assists,
        yellowCards: 0,
        redCards: 0,
        averageRating,
      },
    },
  ],
  boardLockoutUntil: null,
  isUntouchable,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  freeAgentClubLockouts: {},
});

const createSupportSquad = (mainPlayer: Player): Player[] => {
  const samePositionSupport = Array.from({ length: 3 }, (_, index) =>
    createPlayer({
      id: `${mainPlayer.position}_SUPPORT_${index + 1}`,
      position: mainPlayer.position,
      overallRating: Math.max(58, mainPlayer.overallRating - 6 - index),
      age: Math.min(31, mainPlayer.age + index),
      matchesPlayed: 8 + index * 4,
      minutesPlayed: 500 + index * 180,
      averageRating: 6.5,
      clubId: mainPlayer.clubId,
      annualSalary: 600_000,
      contractEndDate: '2027-06-30',
    })
  );

  const supportingCore: Player[] = [
    createPlayer({ id: 'GK_1', position: PlayerPosition.GK, overallRating: 73, age: 27, matchesPlayed: 28, minutesPlayed: 2520, averageRating: 6.9, cleanSheets: 11 }),
    createPlayer({ id: 'DEF_1', position: PlayerPosition.DEF, overallRating: 74, age: 26, matchesPlayed: 29, minutesPlayed: 2500, averageRating: 6.9 }),
    createPlayer({ id: 'DEF_2', position: PlayerPosition.DEF, overallRating: 72, age: 24, matchesPlayed: 25, minutesPlayed: 2200, averageRating: 6.8 }),
    createPlayer({ id: 'DEF_3', position: PlayerPosition.DEF, overallRating: 71, age: 28, matchesPlayed: 24, minutesPlayed: 2100, averageRating: 6.7 }),
    createPlayer({ id: 'MID_1', position: PlayerPosition.MID, overallRating: 76, age: 25, matchesPlayed: 30, minutesPlayed: 2550, averageRating: 7.0, goals: 6, assists: 7 }),
    createPlayer({ id: 'MID_2', position: PlayerPosition.MID, overallRating: 74, age: 23, matchesPlayed: 27, minutesPlayed: 2200, averageRating: 6.9, goals: 3, assists: 6 }),
    createPlayer({ id: 'MID_3', position: PlayerPosition.MID, overallRating: 72, age: 29, matchesPlayed: 22, minutesPlayed: 1800, averageRating: 6.7, goals: 2, assists: 4 }),
    createPlayer({ id: 'FWD_1', position: PlayerPosition.FWD, overallRating: 77, age: 24, matchesPlayed: 30, minutesPlayed: 2480, averageRating: 7.1, goals: 14, assists: 5 }),
    createPlayer({ id: 'FWD_2', position: PlayerPosition.FWD, overallRating: 73, age: 22, matchesPlayed: 24, minutesPlayed: 1650, averageRating: 6.8, goals: 8, assists: 3 }),
  ];

  return [mainPlayer, ...samePositionSupport, ...supportingCore].sort((a, b) => b.overallRating - a.overallRating);
};

const buildScenario = (
  definition: Omit<BalanceScenario, 'sellerSquad' | 'sellerClub'> & {
    clubOverrides?: Partial<Club>;
  }
): BalanceScenario => {
  const sellerClub = createClub(definition.clubOverrides);
  const sellerSquad = createSupportSquad(definition.player);
  sellerClub.rosterIds = sellerSquad.map(player => player.id);
  return {
    ...definition,
    sellerClub,
    sellerSquad,
  };
};

const calculateScenarioPrices = (
  player: Player,
  sellerClub: Club,
  sellerSquad: Player[],
  boardKompetencja?: BoardAttributeLevel
) => {
  const marketValue = FinanceService.calculateMarketValue(
    player,
    sellerClub.reputation,
    sellerClub.tier || 1
  );
  const askingPrice = TransferSellerLogicService.estimateAskingPrice(
    { ...player, marketValue },
    sellerClub,
    sellerSquad,
    TEST_DATE,
    boardKompetencja
  );

  return { marketValue, askingPrice };
};

export const runMarketValueBalanceTests = () => {
  console.group('Market Value Balance Tests');
  failures.length = 0;

  const originalRandom = Math.random;
  Math.random = () => 0.5;

  try {
    const scenarios: BalanceScenario[] = [
      buildScenario({
        id: 'veteran_mid_idle',
        label: '35-letni MID 75 OVR bez minut',
        player: createPlayer({
          id: 'VETERAN_MID_IDLE',
          position: PlayerPosition.MID,
          overallRating: 75,
          age: 35,
          matchesPlayed: 0,
          minutesPlayed: 0,
          averageRating: 6.7,
          annualSalary: 3_600_000,
          contractEndDate: '2029-06-30',
          isOnTransferList: true,
        }),
        marketValueRange: [500_000, 1_700_000],
        askingPriceRange: [600_000, 2_600_000],
      }),
      buildScenario({
        id: 'veteran_mid_playing',
        label: '35-letni MID 75 OVR regularnie grający',
        player: createPlayer({
          id: 'VETERAN_MID_PLAYING',
          position: PlayerPosition.MID,
          overallRating: 75,
          age: 35,
          matchesPlayed: 24,
          minutesPlayed: 1_850,
          assists: 8,
          goals: 3,
          averageRating: 7.1,
          annualSalary: 2_400_000,
          contractEndDate: '2028-06-30',
        }),
        marketValueRange: [900_000, 1_900_000],
        askingPriceRange: [1_100_000, 2_600_000],
      }),
      buildScenario({
        id: 'leader_fwd_32',
        label: '32-letni FWD 78 OVR po mocnym sezonie',
        player: createPlayer({
          id: 'LEADER_FWD_32',
          position: PlayerPosition.FWD,
          overallRating: 78,
          age: 32,
          matchesPlayed: 31,
          minutesPlayed: 2_520,
          goals: 18,
          assists: 5,
          averageRating: 7.3,
          annualSalary: 2_000_000,
          contractEndDate: '2028-06-30',
          isUntouchable: true,
        }),
        marketValueRange: [3_500_000, 5_500_000],
        askingPriceRange: [5_000_000, 8_500_000],
      }),
      buildScenario({
        id: 'leader_def_34',
        label: '34-letni DEF 76 OVR lider obrony',
        player: createPlayer({
          id: 'LEADER_DEF_34',
          position: PlayerPosition.DEF,
          overallRating: 76,
          age: 34,
          matchesPlayed: 30,
          minutesPlayed: 2_610,
          averageRating: 7.1,
          annualSalary: 1_600_000,
          contractEndDate: '2028-06-30',
        }),
        marketValueRange: [1_500_000, 3_800_000],
        askingPriceRange: [2_000_000, 4_800_000],
      }),
      buildScenario({
        id: 'veteran_gk_36',
        label: '36-letni GK 74 OVR z dobrą średnią',
        player: createPlayer({
          id: 'VETERAN_GK_36',
          position: PlayerPosition.GK,
          overallRating: 74,
          age: 36,
          matchesPlayed: 29,
          minutesPlayed: 2_610,
          cleanSheets: 12,
          averageRating: 7.2,
          annualSalary: 1_300_000,
          contractEndDate: '2027-06-30',
        }),
        marketValueRange: [1_000_000, 2_200_000],
        askingPriceRange: [1_300_000, 2_800_000],
      }),
      buildScenario({
        id: 'prime_mid_27',
        label: '27-letni MID 79 OVR gwiazda ligi',
        player: createPlayer({
          id: 'PRIME_MID_27',
          position: PlayerPosition.MID,
          overallRating: 79,
          age: 27,
          matchesPlayed: 31,
          minutesPlayed: 2_640,
          goals: 10,
          assists: 12,
          averageRating: 7.4,
          annualSalary: 2_800_000,
          contractEndDate: '2029-06-30',
          isUntouchable: true,
        }),
        marketValueRange: [8_000_000, 14_000_000],
        askingPriceRange: [12_000_000, 20_000_000],
      }),
      buildScenario({
        id: 'liga1_fwd_25',
        label: '25-letni FWD 74 OVR lider 1. Ligi',
        player: createPlayer({
          id: 'LIGA1_FWD_25',
          position: PlayerPosition.FWD,
          overallRating: 74,
          age: 25,
          matchesPlayed: 29,
          minutesPlayed: 2_380,
          goals: 15,
          assists: 4,
          averageRating: 7.2,
          annualSalary: 780_000,
          contractEndDate: '2028-06-30',
          clubId: 'PL_L1_CLUB',
        }),
        clubOverrides: {
          id: 'PL_L1_CLUB',
          leagueId: 'PL_LEAGUE_2',
          tier: 2,
          reputation: 5,
          budget: 5_500_000,
          transferBudget: 1_200_000,
        },
        marketValueRange: [1_600_000, 3_000_000],
        askingPriceRange: [2_000_000, 4_200_000],
      }),
      buildScenario({
        id: 'liga1_veteran_mid',
        label: '35-letni MID 72 OVR rezerwowy 1. Ligi',
        player: createPlayer({
          id: 'LIGA1_VETERAN_MID',
          position: PlayerPosition.MID,
          overallRating: 72,
          age: 35,
          matchesPlayed: 9,
          minutesPlayed: 540,
          assists: 2,
          goals: 1,
          averageRating: 6.8,
          annualSalary: 540_000,
          contractEndDate: '2027-06-30',
          clubId: 'PL_L1_CLUB_2',
          isOnTransferList: true,
        }),
        clubOverrides: {
          id: 'PL_L1_CLUB_2',
          leagueId: 'PL_LEAGUE_2',
          tier: 2,
          reputation: 4,
          budget: 3_800_000,
          transferBudget: 900_000,
        },
        marketValueRange: [250_000, 750_000],
        askingPriceRange: [250_000, 1_000_000],
      }),
      buildScenario({
        id: 'liga2_fwd_23',
        label: '23-letni FWD 69 OVR strzelec 2. Ligi',
        player: createPlayer({
          id: 'LIGA2_FWD_23',
          position: PlayerPosition.FWD,
          overallRating: 69,
          age: 23,
          matchesPlayed: 28,
          minutesPlayed: 2_250,
          goals: 13,
          assists: 3,
          averageRating: 7.0,
          annualSalary: 240_000,
          contractEndDate: '2028-06-30',
          clubId: 'PL_L2_CLUB',
        }),
        clubOverrides: {
          id: 'PL_L2_CLUB',
          leagueId: 'PL_LEAGUE_3',
          tier: 3,
          reputation: 3,
          budget: 1_600_000,
          transferBudget: 350_000,
        },
        marketValueRange: [350_000, 900_000],
        askingPriceRange: [450_000, 1_400_000],
      }),
    ];

    const rows = scenarios.map(scenario => {
      const { marketValue, askingPrice } = calculateScenarioPrices(
        scenario.player,
        scenario.sellerClub,
        scenario.sellerSquad,
        scenario.boardKompetencja
      );

      assertInRange(marketValue, scenario.marketValueRange, `${scenario.label} marketValue outside expected range`);
      assertInRange(askingPrice, scenario.askingPriceRange, `${scenario.label} askingPrice outside expected range`);

      return {
        scenario: scenario.label,
        marketValue,
        marketTarget: `${scenario.marketValueRange[0].toLocaleString()}-${scenario.marketValueRange[1].toLocaleString()}`,
        askingPrice,
        askingTarget: `${scenario.askingPriceRange[0].toLocaleString()}-${scenario.askingPriceRange[1].toLocaleString()}`,
      };
    });

    console.table(rows);

    const comparisonBasePlayer = createPlayer({
      id: 'COMPARISON_BASE',
      position: PlayerPosition.MID,
      overallRating: 76,
      age: 28,
      matchesPlayed: 28,
      minutesPlayed: 2_250,
      assists: 7,
      goals: 5,
      averageRating: 7.0,
      contractEndDate: '2028-06-30',
      annualSalary: 1_700_000,
    });
    const comparisonBaseClub = createClub({
      id: 'PL_COMPARISON_CLUB',
      leagueId: 'PL_LEAGUE_1',
      tier: 1,
      reputation: 6,
      budget: 11_000_000,
      transferBudget: 3_500_000,
    });

    const comparisonCases = [
      {
        label: 'Baza',
        player: comparisonBasePlayer,
        club: comparisonBaseClub,
        boardKompetencja: 'przecietna' as BoardAttributeLevel,
      },
      {
        label: 'Lista transferowa',
        player: { ...comparisonBasePlayer, id: 'COMPARISON_LISTED', isOnTransferList: true },
        club: comparisonBaseClub,
        boardKompetencja: 'przecietna' as BoardAttributeLevel,
      },
      {
        label: 'Krótki kontrakt',
        player: { ...comparisonBasePlayer, id: 'COMPARISON_SHORT', contractEndDate: '2026-09-01' },
        club: comparisonBaseClub,
        boardKompetencja: 'przecietna' as BoardAttributeLevel,
      },
      {
        label: 'Długi kontrakt',
        player: { ...comparisonBasePlayer, id: 'COMPARISON_LONG', contractEndDate: '2030-06-30' },
        club: comparisonBaseClub,
        boardKompetencja: 'przecietna' as BoardAttributeLevel,
      },
      {
        label: 'Untouchable',
        player: { ...comparisonBasePlayer, id: 'COMPARISON_UNTOUCHABLE', isUntouchable: true },
        club: comparisonBaseClub,
        boardKompetencja: 'przecietna' as BoardAttributeLevel,
      },
      {
        label: 'Presja finansowa',
        player: { ...comparisonBasePlayer, id: 'COMPARISON_PRESSURE' },
        club: { ...comparisonBaseClub, id: 'PL_COMPARISON_PRESSURE', budget: 900_000, transferBudget: 200_000 },
        boardKompetencja: 'przecietna' as BoardAttributeLevel,
      },
      {
        label: 'Zarząd bardzo wysoki',
        player: { ...comparisonBasePlayer, id: 'COMPARISON_BOARD_HIGH' },
        club: comparisonBaseClub,
        boardKompetencja: 'bardzo_wysoka' as BoardAttributeLevel,
      },
      {
        label: 'Zarząd bardzo niski',
        player: { ...comparisonBasePlayer, id: 'COMPARISON_BOARD_LOW' },
        club: comparisonBaseClub,
        boardKompetencja: 'bardzo_niska' as BoardAttributeLevel,
      },
      {
        label: 'Weteran 35 lat',
        player: {
          ...comparisonBasePlayer,
          id: 'COMPARISON_VETERAN',
          age: 35,
          matchesPlayed: 20,
          minutesPlayed: 1_350,
          assists: 5,
          goals: 3,
          averageRating: 6.9,
        },
        club: comparisonBaseClub,
        boardKompetencja: 'przecietna' as BoardAttributeLevel,
      },
    ].map(entry => {
      const squad = createSupportSquad(entry.player);
      return {
        ...entry,
        ...calculateScenarioPrices(entry.player, entry.club, squad, entry.boardKompetencja),
      };
    });

    console.table(
      comparisonCases.map(({ label, marketValue, askingPrice }) => ({
        scenario: label,
        marketValue,
        askingPrice,
      }))
    );

    const comparisonMap = Object.fromEntries(
      comparisonCases.map(entry => [entry.label, entry])
    ) as Record<string, (typeof comparisonCases)[number]>;

    assertLessThan(
      comparisonMap['Lista transferowa'].askingPrice,
      comparisonMap['Baza'].askingPrice,
      'Transfer list should reduce asking price'
    );
    assertLessThan(
      comparisonMap['Krótki kontrakt'].askingPrice,
      comparisonMap['Baza'].askingPrice,
      'Short contract should reduce asking price'
    );
    assertGreaterThan(
      comparisonMap['Długi kontrakt'].askingPrice,
      comparisonMap['Krótki kontrakt'].askingPrice,
      'Long contract should be valued above short contract'
    );
    assertGreaterThan(
      comparisonMap['Untouchable'].askingPrice,
      comparisonMap['Baza'].askingPrice,
      'Untouchable status should increase asking price'
    );
    assertLessThan(
      comparisonMap['Presja finansowa'].askingPrice,
      comparisonMap['Baza'].askingPrice,
      'Financial pressure should reduce asking price'
    );
    assertGreaterThan(
      comparisonMap['Zarząd bardzo wysoki'].askingPrice,
      comparisonMap['Zarząd bardzo niski'].askingPrice,
      'Higher board competence should increase asking price'
    );
    assertLessThan(
      comparisonMap['Weteran 35 lat'].marketValue,
      comparisonMap['Baza'].marketValue,
      'Veteran market value should be lower than prime-age equivalent'
    );
    assertLessThan(
      comparisonMap['Weteran 35 lat'].askingPrice,
      comparisonMap['Baza'].askingPrice,
      'Veteran asking price should be lower than prime-age equivalent'
    );

    if (failures.length > 0) {
      console.error('Market balance assertions failed:');
      failures.forEach(failure => console.error(`- ${failure}`));
      process.exitCode = 1;
      return;
    }

    console.log('Market balance assertions completed.');
  } finally {
    Math.random = originalRandom;
    console.groupEnd();
  }
};

runMarketValueBalanceTests();
