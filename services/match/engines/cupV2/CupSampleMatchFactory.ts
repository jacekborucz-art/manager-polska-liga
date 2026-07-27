import {
  HealthStatus,
  PlayerPosition,
  Region,
  type Lineup,
  type Player,
  type PlayerAttributes,
  type Referee,
  type Tactic,
  type TacticalInstructions,
} from '../../../../types';
import type { CupMatchInput, CupTeamInput } from './CupMatchTypes';
import { clamp, seededRandom } from './CupMath';

export type CupSampleScenario = 'EQUAL' | 'HOME_FAVORITE' | 'AWAY_FAVORITE' | 'LOWER_LEAGUE_HOME' | 'FINAL_NEUTRAL';

type SquadQuality = {
  base: number;
  morale: number;
  condition: number;
  motivation: number;
};

const ATTRIBUTE_KEYS: Array<keyof PlayerAttributes> = [
  'strength',
  'stamina',
  'pace',
  'defending',
  'passing',
  'attacking',
  'finishing',
  'technique',
  'vision',
  'dribbling',
  'heading',
  'positioning',
  'goalkeeping',
  'freeKicks',
  'talent',
  'penalties',
  'corners',
  'aggression',
  'crossing',
  'leadership',
  'mentality',
  'workRate',
];

const DEFAULT_INSTRUCTIONS: TacticalInstructions = {
  tempo: 'NORMAL',
  mindset: 'NEUTRAL',
  intensity: 'NORMAL',
  passing: 'MIXED',
  pressing: 'NORMAL',
  counterAttack: 'NORMAL',
  marking: 'ZONE',
  lastChangeMinute: 0,
  expiryMinute: -1,
  tempoExpiry: -1,
  mindsetExpiry: -1,
  intensityExpiry: -1,
  tempoCooldown: -1,
  mindsetCooldown: -1,
  intensityCooldown: -1,
  passingCooldown: -1,
  pressingCooldown: -1,
  counterAttackCooldown: -1,
  markingCooldown: -1,
  tempoResponseFactor: 1,
  mindsetResponseFactor: 1,
  intensityResponseFactor: 1,
  passingResponseFactor: 1,
  pressingResponseFactor: 1,
  counterAttackResponseFactor: 1,
  markingResponseFactor: 1,
};

const makeTactic = (id: string, style: 'BALANCED' | 'ATTACK' | 'DEFENSE' | 'DIRECT'): Tactic => {
  const attackBias = style === 'ATTACK' ? 68 : style === 'DEFENSE' ? 42 : style === 'DIRECT' ? 58 : 54;
  const defenseBias = style === 'DEFENSE' ? 70 : style === 'ATTACK' ? 44 : style === 'DIRECT' ? 50 : 56;
  const pressingIntensity = style === 'ATTACK' ? 66 : style === 'DEFENSE' ? 42 : style === 'DIRECT' ? 55 : 52;

  return {
    id,
    name: `Cup V2 ${style}`,
    category: 'cupV2-calibration',
    attackBias,
    defenseBias,
    pressingIntensity,
    slots: [
      { index: 0, role: PlayerPosition.GK, x: 50, y: 8 },
      { index: 1, role: PlayerPosition.DEF, x: 18, y: 28 },
      { index: 2, role: PlayerPosition.DEF, x: 38, y: 25 },
      { index: 3, role: PlayerPosition.DEF, x: 62, y: 25 },
      { index: 4, role: PlayerPosition.DEF, x: 82, y: 28 },
      { index: 5, role: PlayerPosition.MID, x: 34, y: 50 },
      { index: 6, role: PlayerPosition.MID, x: 66, y: 50 },
      { index: 7, role: PlayerPosition.MID, x: 22, y: 66 },
      { index: 8, role: PlayerPosition.MID, x: 78, y: 66 },
      { index: 9, role: PlayerPosition.FWD, x: 42, y: 82 },
      { index: 10, role: PlayerPosition.FWD, x: 58, y: 84 },
    ],
  };
};

const positionBoosts: Record<PlayerPosition, Partial<Record<keyof PlayerAttributes, number>>> = {
  [PlayerPosition.GK]: { goalkeeping: 14, positioning: 8, mentality: 5, passing: 2 },
  [PlayerPosition.DEF]: { defending: 11, positioning: 8, heading: 6, strength: 5, aggression: 3 },
  [PlayerPosition.MID]: { passing: 9, vision: 7, technique: 7, stamina: 5, workRate: 5 },
  [PlayerPosition.FWD]: { finishing: 11, attacking: 9, pace: 5, dribbling: 4, technique: 4 },
};

const makeAttributes = (seed: string, position: PlayerPosition, quality: number): PlayerAttributes => {
  const attrs = {} as PlayerAttributes;
  ATTRIBUTE_KEYS.forEach((key, index) => {
    const spread = (seededRandom(seed, index, 4) - 0.5) * 16;
    const positional = positionBoosts[position][key] ?? 0;
    attrs[key] = Math.round(clamp(quality + spread + positional, 18, 95));
  });

  if (position !== PlayerPosition.GK) {
    attrs.goalkeeping = Math.round(12 + seededRandom(seed, 44, 7) * 20);
  }

  return attrs;
};

const calculateOverall = (position: PlayerPosition, attrs: PlayerAttributes): number => {
  const keysByPosition: Record<PlayerPosition, Array<keyof PlayerAttributes>> = {
    [PlayerPosition.GK]: ['goalkeeping', 'positioning', 'mentality', 'strength'],
    [PlayerPosition.DEF]: ['defending', 'positioning', 'heading', 'strength', 'pace'],
    [PlayerPosition.MID]: ['passing', 'vision', 'technique', 'stamina', 'workRate'],
    [PlayerPosition.FWD]: ['finishing', 'attacking', 'pace', 'technique', 'positioning'],
  };
  const keys = keysByPosition[position];
  return Math.round(keys.reduce((sum, key) => sum + attrs[key], 0) / keys.length);
};

const makePlayer = (prefix: string, index: number, position: PlayerPosition, quality: SquadQuality): Player => {
  const id = `${prefix}_${position}_${index}`;
  const attrs = makeAttributes(id, position, quality.base);
  const overallRating = calculateOverall(position, attrs);

  return {
    id,
    firstName: 'Test',
    lastName: `${prefix}${index}`,
    age: 20 + Math.floor(seededRandom(id, 9, 9) * 15),
    clubId: prefix,
    nationality: Region.POLAND,
    position,
    overallRating,
    attributes: attrs,
    stats: {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      matchesPlayed: 12,
      minutesPlayed: 820,
      seasonalChanges: {},
      ratingHistory: [6.4, 6.6, 6.7, 6.5, 6.8],
    },
    health: { status: HealthStatus.HEALTHY },
    condition: Math.round(clamp(quality.condition + (seededRandom(id, 10, 10) - 0.5) * 9, 55, 100)),
    suspensionMatches: 0,
    contractEndDate: '2028-06-30',
    annualSalary: 120000,
    history: [],
    boardLockoutUntil: null,
    isUntouchable: false,
    negotiationStep: 0,
    negotiationLockoutUntil: null,
    contractLockoutUntil: null,
    fatigueDebt: 0,
    form: Math.round(clamp(50 + (seededRandom(id, 11, 11) - 0.5) * 24, 25, 85)),
    morale: quality.morale,
    isNegotiationPermanentBlocked: false,
    transferLockoutUntil: null,
    freeAgentLockoutUntil: null,
  } as Player;
};

const makeSquad = (prefix: string, quality: SquadQuality): Player[] => {
  const positions = [
    PlayerPosition.GK,
    PlayerPosition.GK,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
  ];

  return positions.map((position, index) => makePlayer(prefix, index, position, quality));
};

const buildLineup = (players: Player[], clubId: string, tacticId: string): Lineup => {
  const used = new Set<string>();
  const take = (position: PlayerPosition): string | null => {
    const player = players
      .filter(candidate => candidate.position === position && !used.has(candidate.id))
      .sort((a, b) => b.overallRating - a.overallRating)[0];
    if (!player) return null;
    used.add(player.id);
    return player.id;
  };

  const startingXI = [
    take(PlayerPosition.GK),
    take(PlayerPosition.DEF),
    take(PlayerPosition.DEF),
    take(PlayerPosition.DEF),
    take(PlayerPosition.DEF),
    take(PlayerPosition.MID),
    take(PlayerPosition.MID),
    take(PlayerPosition.MID),
    take(PlayerPosition.MID),
    take(PlayerPosition.FWD),
    take(PlayerPosition.FWD),
  ];

  return {
    clubId,
    tacticId,
    startingXI,
    bench: players.filter(player => !used.has(player.id)).map(player => player.id),
    reserves: [],
  };
};

const makeReferee = (seed: string): Referee => ({
  id: `cupv2_ref_${seed}`,
  firstName: 'Arbiter',
  lastName: seed,
  age: 38,
  nationality: Region.POLAND,
  strictness: Math.round(35 + seededRandom(seed, 1, 40) * 45),
  consistency: Math.round(50 + seededRandom(seed, 2, 41) * 40),
  advantageTendency: Math.round(25 + seededRandom(seed, 3, 42) * 55),
  matchRatings: [],
  totalYellowCardsShown: 0,
  totalRedCardsShown: 0,
  experience: Math.round(45 + seededRandom(seed, 4, 43) * 45),
  isInternational: false,
});

const makeTeam = ({
  side,
  prefix,
  name,
  quality,
  tactic,
  instructions,
  stadiumSupport,
}: {
  side: 'HOME' | 'AWAY';
  prefix: string;
  name: string;
  quality: SquadQuality;
  tactic: Tactic;
  instructions: TacticalInstructions;
  stadiumSupport: number;
}): CupTeamInput => {
  const players = makeSquad(prefix, quality);
  return {
    side,
    clubId: prefix,
    name,
    players,
    lineup: buildLineup(players, prefix, tactic.id),
    tactic,
    instructions,
    morale: quality.morale,
    preMatchMotivation: quality.motivation,
    stadiumSupport,
  };
};

const scenarioQuality = (scenario: CupSampleScenario, index: number): { home: SquadQuality; away: SquadQuality } => {
  const smallSwing = (seededRandom(scenario, index, 88) - 0.5) * 3;
  if (scenario === 'HOME_FAVORITE') {
    return {
      home: { base: 70 + smallSwing, morale: 62, condition: 93, motivation: 63 },
      away: { base: 65.5 - smallSwing, morale: 52, condition: 90, motivation: 58 },
    };
  }
  if (scenario === 'AWAY_FAVORITE') {
    return {
      home: { base: 65.5 + smallSwing, morale: 55, condition: 91, motivation: 62 },
      away: { base: 70 - smallSwing, morale: 61, condition: 92, motivation: 60 },
    };
  }
  if (scenario === 'LOWER_LEAGUE_HOME') {
    return {
      home: { base: 62.5 + smallSwing, morale: 68, condition: 94, motivation: 74 },
      away: { base: 67.5 - smallSwing, morale: 58, condition: 90, motivation: 56 },
    };
  }
  if (scenario === 'FINAL_NEUTRAL') {
    return {
      home: { base: 72 + smallSwing, morale: 60, condition: 91, motivation: 68 },
      away: { base: 71 - smallSwing, morale: 60, condition: 91, motivation: 68 },
    };
  }
  return {
    home: { base: 67 + smallSwing, morale: 58, condition: 92, motivation: 60 },
    away: { base: 67 - smallSwing, morale: 58, condition: 92, motivation: 60 },
  };
};

const expectedFavoriteForScenario = (scenario: CupSampleScenario): 'HOME' | 'AWAY' | undefined => {
  if (scenario === 'HOME_FAVORITE') return 'HOME';
  if (scenario === 'AWAY_FAVORITE' || scenario === 'LOWER_LEAGUE_HOME') return 'AWAY';
  return undefined;
};

const scenarioInstructions = (scenario: CupSampleScenario): { home: TacticalInstructions; away: TacticalInstructions; homeStyle: Parameters<typeof makeTactic>[1]; awayStyle: Parameters<typeof makeTactic>[1] } => {
  if (scenario === 'LOWER_LEAGUE_HOME') {
    return {
      home: { ...DEFAULT_INSTRUCTIONS, mindset: 'DEFENSIVE', passing: 'LONG', counterAttack: 'COUNTER' },
      away: { ...DEFAULT_INSTRUCTIONS, mindset: 'OFFENSIVE', tempo: 'FAST', pressing: 'PRESSING' },
      homeStyle: 'DIRECT',
      awayStyle: 'ATTACK',
    };
  }
  if (scenario === 'HOME_FAVORITE') {
    return {
      home: { ...DEFAULT_INSTRUCTIONS, mindset: 'OFFENSIVE', tempo: 'FAST', pressing: 'PRESSING' },
      away: { ...DEFAULT_INSTRUCTIONS, mindset: 'DEFENSIVE', counterAttack: 'COUNTER' },
      homeStyle: 'ATTACK',
      awayStyle: 'DEFENSE',
    };
  }
  if (scenario === 'AWAY_FAVORITE') {
    return {
      home: { ...DEFAULT_INSTRUCTIONS, mindset: 'DEFENSIVE', counterAttack: 'COUNTER' },
      away: { ...DEFAULT_INSTRUCTIONS, mindset: 'OFFENSIVE', tempo: 'FAST', pressing: 'PRESSING' },
      homeStyle: 'DEFENSE',
      awayStyle: 'ATTACK',
    };
  }
  return {
    home: DEFAULT_INSTRUCTIONS,
    away: DEFAULT_INSTRUCTIONS,
    homeStyle: 'BALANCED',
    awayStyle: 'BALANCED',
  };
};

const stadiumSupportForScenario = (scenario: CupSampleScenario): { home: number; away: number } => {
  if (scenario === 'FINAL_NEUTRAL') return { home: 50, away: 50 };
  if (scenario === 'LOWER_LEAGUE_HOME') return { home: 61, away: 39 };
  return { home: 52, away: 48 };
};

export const CupSampleMatchFactory = {
  scenarios: ['EQUAL', 'HOME_FAVORITE', 'AWAY_FAVORITE', 'LOWER_LEAGUE_HOME', 'FINAL_NEUTRAL'] as CupSampleScenario[],

  makeInput: (index: number, scenario: CupSampleScenario): CupMatchInput => {
    const seed = `cupv2_balance_${scenario}_${index}`;
    const quality = scenarioQuality(scenario, index);
    const instructions = scenarioInstructions(scenario);
    const stadiumSupport = stadiumSupportForScenario(scenario);

    return {
      seed,
      home: makeTeam({
        side: 'HOME',
        prefix: `HOME_${scenario}_${index}`,
        name: `Gospodarze ${scenario}`,
        quality: quality.home,
        tactic: makeTactic(`home_${scenario}_${index}`, instructions.homeStyle),
        instructions: instructions.home,
        stadiumSupport: stadiumSupport.home,
      }),
      away: makeTeam({
        side: 'AWAY',
        prefix: `AWAY_${scenario}_${index}`,
        name: `Goście ${scenario}`,
        quality: quality.away,
        tactic: makeTactic(`away_${scenario}_${index}`, instructions.awayStyle),
        instructions: instructions.away,
        stadiumSupport: stadiumSupport.away,
      }),
      environment: {
        pitchQuality: Math.round(68 + seededRandom(seed, 7, 90) * 28),
        stadiumCapacity: scenario === 'FINAL_NEUTRAL' ? 56000 : 9000 + Math.round(seededRandom(seed, 8, 91) * 23000),
        attendance: scenario === 'FINAL_NEUTRAL' ? 48000 : 5000 + Math.round(seededRandom(seed, 9, 92) * 18000),
        referee: makeReferee(seed),
        weather: {
          tempC: Math.round(4 + seededRandom(seed, 10, 93) * 20),
          precipitationChance: Math.round(seededRandom(seed, 11, 94) * 70),
          windKmh: Math.round(seededRandom(seed, 12, 95) * 32),
          description: 'Warunki testowe',
          weatherIntensity: seededRandom(seed, 13, 96) * 0.65,
        },
      },
      config: {
        calibrationMode: true,
        enableExtraTime: true,
        enablePenaltyShootout: true,
      },
      calibration: {
        scenario,
        homeQuality: quality.home.base,
        awayQuality: quality.away.base,
        expectedFavorite: expectedFavoriteForScenario(scenario),
      },
    };
  },

  makeBatch: (matchesPerScenario: number): CupMatchInput[] =>
    CupSampleMatchFactory.scenarios.flatMap(scenario =>
      Array.from({ length: matchesPerScenario }, (_, index) =>
        CupSampleMatchFactory.makeInput(index, scenario)
      )
    ),
};
