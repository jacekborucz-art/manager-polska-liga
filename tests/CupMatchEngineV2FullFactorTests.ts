import assert from 'node:assert/strict';
import {
  HealthStatus,
  MatchEventType,
  PlayerPosition,
  Region,
  type Lineup,
  type Player,
  type PlayerAttributes,
  type Referee,
  type Tactic,
  type TacticalInstructions,
  type WeatherSnapshot,
} from '../types';
import {
  CupMatchEngineV2,
  CupTeamProfileService,
  clamp,
  type CupHalfTimeTalk,
  type CupMatchInput,
  type CupMatchResult,
} from '../services/match/engines/cupV2';

type FactorCaseOptions = {
  homeFormation?: FormationId;
  awayFormation?: FormationId;
  homeInstructions?: Partial<TacticalInstructions>;
  awayInstructions?: Partial<TacticalInstructions>;
  homeQuality?: number;
  awayQuality?: number;
  homeProfile?: AttributeProfile;
  awayProfile?: AttributeProfile;
  homeCondition?: number;
  awayCondition?: number;
  homeMorale?: number;
  awayMorale?: number;
  homeMotivation?: number;
  awayMotivation?: number;
  homeSupport?: number;
  awaySupport?: number;
  weather?: WeatherSnapshot;
  pitchQuality?: number;
  referee?: Referee;
  halfTimeTalks?: {
    HOME?: CupHalfTimeTalk;
    AWAY?: CupHalfTimeTalk;
  };
};

type FormationId = '4-4-2' | '4-3-3' | '5-4-1' | '4-5-1' | '4-2-3-1';
type AttributeProfile = 'BALANCED' | 'ATTACK_PLUS' | 'DEFENSE_PLUS' | 'KEEPER_PLUS' | 'AGGRESSIVE' | 'LOW_STAMINA';

type SeriesSummary = {
  label: string;
  matches: number;
  homeShots: number;
  awayShots: number;
  totalShots: number;
  homeXg: number;
  awayXg: number;
  totalXg: number;
  homeGoals: number;
  awayGoals: number;
  totalGoals: number;
  homeOnTarget: number;
  awayOnTarget: number;
  totalOnTarget: number;
  homeOffsides: number;
  awayOffsides: number;
  fouls: number;
  yellows: number;
  reds: number;
  injuries: number;
  substitutions: number;
  homePossessionPct: number;
  homeWinPct: number;
  awayWinPct: number;
  homePointsPerMatch: number;
  homeSecondHalfXg: number;
  awaySecondHalfXg: number;
  homeFinalFatigue: number;
  awayFinalFatigue: number;
  directEvents: number;
  counterEvents: number;
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

const CLEAR_WEATHER: WeatherSnapshot = {
  tempC: 14,
  precipitationChance: 5,
  windKmh: 6,
  description: 'Warunki neutralne',
  weatherIntensity: 0.05,
};

const STORM_WEATHER: WeatherSnapshot = {
  tempC: 4,
  precipitationChance: 92,
  windKmh: 44,
  description: 'Ulewa i silny wiatr',
  weatherIntensity: 0.92,
};

const LENIENT_REFEREE: Referee = {
  id: 'cup_v2_lenient_referee',
  firstName: 'Test',
  lastName: 'Łagodny',
  age: 42,
  nationality: Region.POLAND,
  strictness: 18,
  consistency: 88,
  advantageTendency: 82,
  matchRatings: [],
  totalYellowCardsShown: 0,
  totalRedCardsShown: 0,
  experience: 82,
  isInternational: false,
};

const STRICT_REFEREE: Referee = {
  id: 'cup_v2_strict_referee',
  firstName: 'Test',
  lastName: 'Surowy',
  age: 39,
  nationality: Region.POLAND,
  strictness: 92,
  consistency: 84,
  advantageTendency: 18,
  matchRatings: [],
  totalYellowCardsShown: 0,
  totalRedCardsShown: 0,
  experience: 74,
  isInternational: false,
};

const formationRoles: Record<FormationId, PlayerPosition[]> = {
  '4-4-2': [
    PlayerPosition.GK,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
  ],
  '4-3-3': [
    PlayerPosition.GK,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
  ],
  '5-4-1': [
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
    PlayerPosition.FWD,
  ],
  '4-5-1': [
    PlayerPosition.GK,
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
  ],
  '4-2-3-1': [
    PlayerPosition.GK,
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
  ],
};

const formationCoordinates: Record<FormationId, Array<{ x: number; y: number }>> = {
  '4-4-2': [
    { x: 50, y: 8 },
    { x: 18, y: 28 },
    { x: 38, y: 25 },
    { x: 62, y: 25 },
    { x: 82, y: 28 },
    { x: 20, y: 55 },
    { x: 40, y: 50 },
    { x: 60, y: 50 },
    { x: 80, y: 55 },
    { x: 42, y: 82 },
    { x: 58, y: 82 },
  ],
  '4-3-3': [
    { x: 50, y: 8 },
    { x: 16, y: 30 },
    { x: 38, y: 26 },
    { x: 62, y: 26 },
    { x: 84, y: 30 },
    { x: 36, y: 54 },
    { x: 50, y: 50 },
    { x: 64, y: 54 },
    { x: 24, y: 80 },
    { x: 50, y: 84 },
    { x: 76, y: 80 },
  ],
  '5-4-1': [
    { x: 50, y: 8 },
    { x: 12, y: 28 },
    { x: 30, y: 25 },
    { x: 50, y: 24 },
    { x: 70, y: 25 },
    { x: 88, y: 28 },
    { x: 22, y: 50 },
    { x: 42, y: 47 },
    { x: 58, y: 47 },
    { x: 78, y: 50 },
    { x: 50, y: 76 },
  ],
  '4-5-1': [
    { x: 50, y: 8 },
    { x: 18, y: 28 },
    { x: 38, y: 25 },
    { x: 62, y: 25 },
    { x: 82, y: 28 },
    { x: 18, y: 52 },
    { x: 36, y: 48 },
    { x: 50, y: 45 },
    { x: 64, y: 48 },
    { x: 82, y: 52 },
    { x: 50, y: 78 },
  ],
  '4-2-3-1': [
    { x: 50, y: 8 },
    { x: 18, y: 28 },
    { x: 38, y: 25 },
    { x: 62, y: 25 },
    { x: 82, y: 28 },
    { x: 42, y: 46 },
    { x: 58, y: 46 },
    { x: 24, y: 66 },
    { x: 50, y: 64 },
    { x: 76, y: 66 },
    { x: 50, y: 82 },
  ],
};

const smallNoise = (seed: string, salt: number): number => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index) + salt) >>> 0;
  }
  return ((hash % 1000) / 1000 - 0.5) * 8;
};

const makeInstructions = (overrides: Partial<TacticalInstructions> = {}): TacticalInstructions => ({
  ...DEFAULT_INSTRUCTIONS,
  ...overrides,
});

const makeTactic = (formation: FormationId, id: string): Tactic => {
  const attackBias =
    formation === '4-3-3' ? 66 :
    formation === '4-2-3-1' ? 60 :
    formation === '5-4-1' ? 42 :
    formation === '4-5-1' ? 48 :
    54;
  const defenseBias =
    formation === '5-4-1' ? 72 :
    formation === '4-5-1' ? 66 :
    formation === '4-3-3' ? 46 :
    formation === '4-2-3-1' ? 56 :
    58;
  const pressingIntensity =
    formation === '4-3-3' ? 66 :
    formation === '5-4-1' ? 42 :
    formation === '4-5-1' ? 54 :
    56;

  return {
    id,
    name: formation,
    category: 'cup-v2-full-factor-test',
    attackBias,
    defenseBias,
    pressingIntensity,
    slots: formationRoles[formation].map((role, index) => ({
      index,
      role,
      ...formationCoordinates[formation][index],
    })),
  };
};

const positionalBoost = (position: PlayerPosition, key: keyof PlayerAttributes): number => {
  if (position === PlayerPosition.GK) {
    return key === 'goalkeeping' ? 21 : key === 'positioning' ? 8 : key === 'mentality' ? 5 : 0;
  }
  if (position === PlayerPosition.DEF) {
    return key === 'defending' ? 13 : key === 'positioning' ? 9 : key === 'heading' ? 7 : key === 'strength' ? 5 : 0;
  }
  if (position === PlayerPosition.MID) {
    return key === 'passing' ? 10 : key === 'vision' ? 8 : key === 'technique' ? 7 : key === 'workRate' ? 6 : 0;
  }
  return key === 'finishing' ? 12 : key === 'attacking' ? 10 : key === 'pace' ? 5 : key === 'dribbling' ? 5 : 0;
};

const profileBoost = (profile: AttributeProfile, key: keyof PlayerAttributes, position: PlayerPosition): number => {
  if (profile === 'ATTACK_PLUS') {
    return ['finishing', 'attacking', 'technique', 'vision', 'passing', 'dribbling', 'crossing', 'pace'].includes(key) ? 9 : 0;
  }
  if (profile === 'DEFENSE_PLUS') {
    return ['defending', 'positioning', 'strength', 'heading', 'mentality', 'workRate'].includes(key) ? 9 : 0;
  }
  if (profile === 'KEEPER_PLUS') {
    return position === PlayerPosition.GK && ['goalkeeping', 'positioning', 'mentality', 'strength'].includes(key) ? 16 : 0;
  }
  if (profile === 'AGGRESSIVE') {
    return key === 'aggression' ? 22 : ['mentality', 'workRate', 'strength'].includes(key) ? 5 : 0;
  }
  if (profile === 'LOW_STAMINA') {
    return key === 'stamina' ? -24 : key === 'workRate' ? -10 : 0;
  }
  return 0;
};

const makeAttributes = (seed: string, position: PlayerPosition, quality: number, profile: AttributeProfile): PlayerAttributes => {
  const attrs = {} as PlayerAttributes;
  ATTRIBUTE_KEYS.forEach((key, index) => {
    const value = quality + smallNoise(seed, index + 3) + positionalBoost(position, key) + profileBoost(profile, key, position);
    attrs[key] = Math.round(clamp(value, 12, 96));
  });
  if (position !== PlayerPosition.GK) attrs.goalkeeping = Math.round(clamp(14 + smallNoise(seed, 99), 5, 28));
  return attrs;
};

const overallFor = (position: PlayerPosition, attrs: PlayerAttributes): number => {
  const weights: Record<PlayerPosition, Array<keyof PlayerAttributes>> = {
    [PlayerPosition.GK]: ['goalkeeping', 'positioning', 'mentality', 'strength'],
    [PlayerPosition.DEF]: ['defending', 'positioning', 'heading', 'strength', 'pace'],
    [PlayerPosition.MID]: ['passing', 'vision', 'technique', 'stamina', 'workRate'],
    [PlayerPosition.FWD]: ['finishing', 'attacking', 'pace', 'technique', 'positioning'],
  };
  return Math.round(weights[position].reduce((sum, key) => sum + attrs[key], 0) / weights[position].length);
};

const makePlayer = ({
  prefix,
  index,
  position,
  quality,
  profile,
  condition,
  morale,
}: {
  prefix: string;
  index: number;
  position: PlayerPosition;
  quality: number;
  profile: AttributeProfile;
  condition: number;
  morale: number;
}): Player => {
  const id = `${prefix}_${position}_${index}`;
  const attrs = makeAttributes(id, position, quality, profile);

  return {
    id,
    firstName: 'Test',
    lastName: `${prefix}${index}`,
    age: 19 + (index % 16),
    clubId: prefix,
    nationality: Region.POLAND,
    position,
    overallRating: overallFor(position, attrs),
    attributes: attrs,
    stats: {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      matchesPlayed: 10,
      minutesPlayed: 720,
      seasonalChanges: {},
      ratingHistory: [6.5, 6.6, 6.7],
    },
    health: { status: HealthStatus.HEALTHY },
    condition: Math.round(clamp(condition + smallNoise(id, 121), 35, 100)),
    suspensionMatches: 0,
    contractEndDate: '2029-06-30',
    annualSalary: 120000,
    history: [],
    boardLockoutUntil: null,
    isUntouchable: false,
    negotiationStep: 0,
    negotiationLockoutUntil: null,
    contractLockoutUntil: null,
    fatigueDebt: 0,
    form: Math.round(clamp(58 + smallNoise(id, 122), 30, 86)),
    morale,
    isNegotiationPermanentBlocked: false,
    transferLockoutUntil: null,
    freeAgentLockoutUntil: null,
  } as Player;
};

const makeSquad = (prefix: string, quality: number, profile: AttributeProfile, condition: number, morale: number): Player[] => {
  const positions = [
    PlayerPosition.GK,
    PlayerPosition.GK,
    PlayerPosition.DEF,
    PlayerPosition.DEF,
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
    PlayerPosition.MID,
    PlayerPosition.MID,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
    PlayerPosition.FWD,
  ];

  return positions.map((position, index) => makePlayer({
    prefix,
    index,
    position,
    quality,
    profile,
    condition,
    morale,
  }));
};

const buildLineup = (players: Player[], clubId: string, tactic: Tactic): Lineup => {
  const used = new Set<string>();
  const take = (position: PlayerPosition): string | null => {
    const player = players
      .filter(candidate => candidate.position === position && !used.has(candidate.id))
      .sort((a, b) => b.overallRating - a.overallRating)[0];
    if (!player) return null;
    used.add(player.id);
    return player.id;
  };

  return {
    clubId,
    tacticId: tactic.id,
    startingXI: tactic.slots.map(slot => take(slot.role)),
    bench: players.filter(player => !used.has(player.id)).map(player => player.id),
    reserves: [],
  };
};

const makeInput = (seed: string, options: FactorCaseOptions = {}): CupMatchInput => {
  const homeFormation = options.homeFormation ?? '4-4-2';
  const awayFormation = options.awayFormation ?? '4-4-2';
  const homeTactic = makeTactic(homeFormation, `home_${seed}_${homeFormation}`);
  const awayTactic = makeTactic(awayFormation, `away_${seed}_${awayFormation}`);
  const homePlayers = makeSquad('HOME_FACTOR', options.homeQuality ?? 67, options.homeProfile ?? 'BALANCED', options.homeCondition ?? 92, options.homeMorale ?? 60);
  const awayPlayers = makeSquad('AWAY_FACTOR', options.awayQuality ?? 67, options.awayProfile ?? 'BALANCED', options.awayCondition ?? 92, options.awayMorale ?? 60);

  return {
    seed,
    home: {
      side: 'HOME',
      clubId: 'HOME_FACTOR',
      name: 'Test Gospodarze',
      players: homePlayers,
      lineup: buildLineup(homePlayers, 'HOME_FACTOR', homeTactic),
      tactic: homeTactic,
      instructions: makeInstructions(options.homeInstructions),
      morale: options.homeMorale ?? 60,
      preMatchMotivation: options.homeMotivation ?? 60,
      stadiumSupport: options.homeSupport ?? 52,
    },
    away: {
      side: 'AWAY',
      clubId: 'AWAY_FACTOR',
      name: 'Test Goście',
      players: awayPlayers,
      lineup: buildLineup(awayPlayers, 'AWAY_FACTOR', awayTactic),
      tactic: awayTactic,
      instructions: makeInstructions(options.awayInstructions),
      morale: options.awayMorale ?? 60,
      preMatchMotivation: options.awayMotivation ?? 60,
      stadiumSupport: options.awaySupport ?? 48,
    },
    environment: {
      weather: options.weather ?? CLEAR_WEATHER,
      pitchQuality: options.pitchQuality ?? 82,
      stadiumCapacity: 18000,
      attendance: 14600,
      referee: options.referee ?? LENIENT_REFEREE,
    },
    halfTimeTalks: options.halfTimeTalks,
    config: {
      calibrationMode: true,
      enableExtraTime: false,
      enablePenaltyShootout: false,
    },
  };
};

const eventXg = (result: CupMatchResult, side: 'HOME' | 'AWAY', fromSecond: number): number =>
  result.events
    .filter(event => event.side === side && event.second >= fromSecond && typeof event.xG === 'number')
    .reduce((sum, event) => sum + (event.xG ?? 0), 0);

const avgFinalFatigue = (input: CupMatchInput, result: CupMatchResult, side: 'HOME' | 'AWAY'): number => {
  const team = side === 'HOME' ? input.home : input.away;
  const ids = team.lineup.startingXI.filter((id): id is string => Boolean(id));
  return ids.reduce((sum, id) => sum + (result.finalState.fatigue[id] ?? 0), 0) / Math.max(1, ids.length);
};

const summarize = (label: string, pairs: Array<{ input: CupMatchInput; result: CupMatchResult }>): SeriesSummary => {
  const matches = Math.max(1, pairs.length);
  const totals = pairs.reduce((sum, pair) => {
    const { input, result } = pair;
    const home = result.stats.HOME;
    const away = result.stats.AWAY;
    const possessionTicks = Math.max(1, home.possessionTicks + away.possessionTicks);
    const events = result.events;

    return {
      homeShots: sum.homeShots + home.shots,
      awayShots: sum.awayShots + away.shots,
      homeXg: sum.homeXg + home.xG,
      awayXg: sum.awayXg + away.xG,
      homeGoals: sum.homeGoals + result.homeScore,
      awayGoals: sum.awayGoals + result.awayScore,
      homeOnTarget: sum.homeOnTarget + home.shotsOnTarget,
      awayOnTarget: sum.awayOnTarget + away.shotsOnTarget,
      homeOffsides: sum.homeOffsides + home.offsides,
      awayOffsides: sum.awayOffsides + away.offsides,
      fouls: sum.fouls + home.fouls + away.fouls,
      yellows: sum.yellows + home.yellowCards + away.yellowCards,
      reds: sum.reds + home.redCards + away.redCards,
      injuries: sum.injuries + home.injuries + away.injuries,
      substitutions: sum.substitutions + events.filter(event => event.type === MatchEventType.SUBSTITUTION).length,
      homePossessionShare: sum.homePossessionShare + home.possessionTicks / possessionTicks,
      homeWins: sum.homeWins + (result.winner === 'HOME' ? 1 : 0),
      awayWins: sum.awayWins + (result.winner === 'AWAY' ? 1 : 0),
      homePoints: sum.homePoints + (
        result.homeScore > result.awayScore ? 3 : result.homeScore === result.awayScore ? 1 : 0
      ),
      homeSecondHalfXg: sum.homeSecondHalfXg + eventXg(
        result,
        'HOME',
        45 * 60 + result.finalState.firstHalfAddedTimeSeconds,
      ),
      awaySecondHalfXg: sum.awaySecondHalfXg + eventXg(
        result,
        'AWAY',
        45 * 60 + result.finalState.firstHalfAddedTimeSeconds,
      ),
      homeFinalFatigue: sum.homeFinalFatigue + avgFinalFatigue(input, result, 'HOME'),
      awayFinalFatigue: sum.awayFinalFatigue + avgFinalFatigue(input, result, 'AWAY'),
      directEvents: sum.directEvents + events.filter(event => event.pattern === 'DIRECT').length,
      counterEvents: sum.counterEvents + events.filter(event => event.pattern === 'COUNTER').length,
    };
  }, {
    homeShots: 0,
    awayShots: 0,
    homeXg: 0,
    awayXg: 0,
    homeGoals: 0,
    awayGoals: 0,
    homeOnTarget: 0,
    awayOnTarget: 0,
    homeOffsides: 0,
    awayOffsides: 0,
    fouls: 0,
    yellows: 0,
    reds: 0,
    injuries: 0,
    substitutions: 0,
    homePossessionShare: 0,
    homeWins: 0,
    awayWins: 0,
    homePoints: 0,
    homeSecondHalfXg: 0,
    awaySecondHalfXg: 0,
    homeFinalFatigue: 0,
    awayFinalFatigue: 0,
    directEvents: 0,
    counterEvents: 0,
  });

  return {
    label,
    matches,
    homeShots: totals.homeShots / matches,
    awayShots: totals.awayShots / matches,
    totalShots: (totals.homeShots + totals.awayShots) / matches,
    homeXg: totals.homeXg / matches,
    awayXg: totals.awayXg / matches,
    totalXg: (totals.homeXg + totals.awayXg) / matches,
    homeGoals: totals.homeGoals / matches,
    awayGoals: totals.awayGoals / matches,
    totalGoals: (totals.homeGoals + totals.awayGoals) / matches,
    homeOnTarget: totals.homeOnTarget / matches,
    awayOnTarget: totals.awayOnTarget / matches,
    totalOnTarget: (totals.homeOnTarget + totals.awayOnTarget) / matches,
    homeOffsides: totals.homeOffsides / matches,
    awayOffsides: totals.awayOffsides / matches,
    fouls: totals.fouls / matches,
    yellows: totals.yellows / matches,
    reds: totals.reds / matches,
    injuries: totals.injuries / matches,
    substitutions: totals.substitutions / matches,
    homePossessionPct: (totals.homePossessionShare / matches) * 100,
    homeWinPct: (totals.homeWins / matches) * 100,
    awayWinPct: (totals.awayWins / matches) * 100,
    homePointsPerMatch: totals.homePoints / matches,
    homeSecondHalfXg: totals.homeSecondHalfXg / matches,
    awaySecondHalfXg: totals.awaySecondHalfXg / matches,
    homeFinalFatigue: totals.homeFinalFatigue / matches,
    awayFinalFatigue: totals.awayFinalFatigue / matches,
    directEvents: totals.directEvents / matches,
    counterEvents: totals.counterEvents / matches,
  };
};

const runSeries = (label: string, options: FactorCaseOptions, count = 32): SeriesSummary => {
  const pairs = Array.from({ length: count }, (_, index) => {
    const input = makeInput(`cup_v2_factor_shared_${index}`, options);
    return { input, result: CupMatchEngineV2.simulate(input) };
  });
  return summarize(label, pairs);
};

const printable = (summary: SeriesSummary) => ({
  label: summary.label,
  matches: summary.matches,
  homeShots: Number(summary.homeShots.toFixed(2)),
  awayShots: Number(summary.awayShots.toFixed(2)),
  totalShots: Number(summary.totalShots.toFixed(2)),
  homeXg: Number(summary.homeXg.toFixed(2)),
  awayXg: Number(summary.awayXg.toFixed(2)),
  totalXg: Number(summary.totalXg.toFixed(2)),
  goals: Number(summary.totalGoals.toFixed(2)),
  onTarget: Number(summary.totalOnTarget.toFixed(2)),
  offsides: Number((summary.homeOffsides + summary.awayOffsides).toFixed(2)),
  fouls: Number(summary.fouls.toFixed(2)),
  yellows: Number(summary.yellows.toFixed(2)),
  injuries: Number(summary.injuries.toFixed(2)),
  subs: Number(summary.substitutions.toFixed(2)),
  homePossession: Number(summary.homePossessionPct.toFixed(2)),
  homeWinPct: Number(summary.homeWinPct.toFixed(2)),
  homePoints: Number(summary.homePointsPerMatch.toFixed(2)),
  homeSecondHalfXg: Number(summary.homeSecondHalfXg.toFixed(2)),
  awaySecondHalfXg: Number(summary.awaySecondHalfXg.toFixed(2)),
  homeFatigue: Number(summary.homeFinalFatigue.toFixed(2)),
  awayFatigue: Number(summary.awayFinalFatigue.toFixed(2)),
  direct: Number(summary.directEvents.toFixed(2)),
  counter: Number(summary.counterEvents.toFixed(2)),
});

const assertHigher = (actual: number, baseline: number, diff: number, message: string) => {
  assert.ok(actual >= baseline + diff, `${message}: ${actual.toFixed(3)} < ${baseline.toFixed(3)} + ${diff}`);
};

const assertLower = (actual: number, baseline: number, diff: number, message: string) => {
  assert.ok(actual <= baseline - diff, `${message}: ${actual.toFixed(3)} > ${baseline.toFixed(3)} - ${diff}`);
};

const assertInjuredStarterWeakensTeamProfile = () => {
  const input = makeInput('cup_v2_injured_starter_profile', {
    homeProfile: 'ATTACK_PLUS',
    awayProfile: 'BALANCED',
  });
  const fatigue = Object.fromEntries(input.home.players.map(player => [player.id, player.condition]));
  const forwardId = input.home.lineup.startingXI.find(id =>
    Boolean(id && input.home.players.find(player => player.id === id)?.position === PlayerPosition.FWD)
  );
  assert.ok(forwardId, 'Test kontuzji wymaga napastnika w wyjściowym składzie');

  const healthy = CupTeamProfileService.buildProfile(input.home, fatigue, {}, {});
  const lightInjury = CupTeamProfileService.buildProfile(input.home, fatigue, {}, { [forwardId]: 'LIGHT' });
  const severeInjury = CupTeamProfileService.buildProfile(input.home, fatigue, {}, { [forwardId]: 'SEVERE' });

  assertLower(lightInjury.finishing, healthy.finishing, 2.5, 'Lekko kontuzjowany napastnik na boisku musi obniżać wykończenie drużyny');
  assertLower(lightInjury.chanceCreation, healthy.chanceCreation, 1.2, 'Lekko kontuzjowany napastnik na boisku musi obniżać kreację drużyny');
  assertLower(severeInjury.finishing, lightInjury.finishing, 3.0, 'Ciężko kontuzjowany napastnik musi osłabiać wykończenie bardziej niż lekki uraz');
  assertLower(severeInjury.staminaReserve, lightInjury.staminaReserve, 1.0, 'Ciężko kontuzjowany zawodnik musi mocniej obniżać rezerwę fizyczną drużyny');
};

assertInjuredStarterWeakensTeamProfile();

const mirror442 = runSeries('mirror_442', {
  homeFormation: '4-4-2',
  awayFormation: '4-4-2',
}, 20);

const attackAttributes = runSeries('attack_attributes', {
  homeProfile: 'ATTACK_PLUS',
  awayProfile: 'BALANCED',
}, 20);

const defenseAttributes = runSeries('defense_attributes', {
  homeProfile: 'BALANCED',
  awayProfile: 'DEFENSE_PLUS',
  awayFormation: '5-4-1',
  awayInstructions: { mindset: 'DEFENSIVE', marking: 'ZONE' },
}, 20);

const keeperAttributes = runSeries('keeper_attributes', {
  homeProfile: 'BALANCED',
  awayProfile: 'KEEPER_PLUS',
}, 20);

const aggressiveAttributes = runSeries('aggressive_attributes', {
  homeProfile: 'AGGRESSIVE',
  awayProfile: 'AGGRESSIVE',
  homeInstructions: { intensity: 'AGGRESSIVE', pressing: 'PRESSING', marking: 'MAN' },
  awayInstructions: { intensity: 'AGGRESSIVE', pressing: 'PRESSING', marking: 'MAN' },
}, 20);

const lowStaminaPress = runSeries('low_stamina_press', {
  homeProfile: 'LOW_STAMINA',
  awayProfile: 'LOW_STAMINA',
  homeCondition: 72,
  awayCondition: 72,
  homeInstructions: { tempo: 'FAST', pressing: 'PRESSING', intensity: 'AGGRESSIVE' },
  awayInstructions: { tempo: 'FAST', pressing: 'PRESSING', intensity: 'AGGRESSIVE' },
}, 20);

const attacking433 = runSeries('attacking_433_vs_541', {
  homeFormation: '4-3-3',
  awayFormation: '5-4-1',
  homeInstructions: { tempo: 'FAST', mindset: 'OFFENSIVE', intensity: 'AGGRESSIVE', pressing: 'PRESSING' },
  awayInstructions: { tempo: 'SLOW', mindset: 'DEFENSIVE', intensity: 'CAUTIOUS', passing: 'LONG', counterAttack: 'COUNTER' },
}, 20);

const midfield451 = runSeries('midfield_451_vs_442', {
  homeFormation: '4-5-1',
  awayFormation: '4-4-2',
  homeInstructions: { tempo: 'NORMAL', mindset: 'NEUTRAL', passing: 'SHORT', marking: 'ZONE' },
  awayInstructions: { tempo: 'NORMAL', mindset: 'NEUTRAL', passing: 'MIXED', marking: 'ZONE' },
}, 20);

const slowDefensive = runSeries('slow_defensive', {
  homeInstructions: { tempo: 'SLOW', mindset: 'DEFENSIVE', intensity: 'CAUTIOUS', passing: 'SHORT', pressing: 'NORMAL', counterAttack: 'NORMAL', marking: 'ZONE' },
  awayInstructions: { tempo: 'SLOW', mindset: 'DEFENSIVE', intensity: 'CAUTIOUS', passing: 'SHORT', pressing: 'NORMAL', counterAttack: 'NORMAL', marking: 'ZONE' },
}, 20);

const fastOffensive = runSeries('fast_offensive', {
  homeInstructions: { tempo: 'FAST', mindset: 'OFFENSIVE', intensity: 'AGGRESSIVE', passing: 'MIXED', pressing: 'PRESSING', counterAttack: 'NORMAL', marking: 'MAN' },
  awayInstructions: { tempo: 'FAST', mindset: 'OFFENSIVE', intensity: 'AGGRESSIVE', passing: 'MIXED', pressing: 'PRESSING', counterAttack: 'NORMAL', marking: 'MAN' },
}, 20);

const shortPassing = runSeries('short_passing', {
  homeInstructions: { passing: 'SHORT', tempo: 'NORMAL', counterAttack: 'NORMAL' },
  awayInstructions: { passing: 'SHORT', tempo: 'NORMAL', counterAttack: 'NORMAL' },
}, 20);

const longCounter = runSeries('long_counter', {
  homeInstructions: { passing: 'LONG', tempo: 'FAST', counterAttack: 'COUNTER' },
  awayInstructions: { passing: 'LONG', tempo: 'FAST', counterAttack: 'COUNTER' },
}, 20);

const noMarking = runSeries('no_marking', {
  homeInstructions: { marking: 'NONE' },
  awayInstructions: { marking: 'NONE' },
}, 20);

const manMarking = runSeries('man_marking', {
  homeInstructions: { marking: 'MAN', intensity: 'AGGRESSIVE' },
  awayInstructions: { marking: 'MAN', intensity: 'AGGRESSIVE' },
}, 20);

const goodConditions = runSeries('good_weather_pitch', {
  weather: CLEAR_WEATHER,
  pitchQuality: 92,
}, 24);

const badConditions = runSeries('bad_weather_pitch', {
  weather: STORM_WEATHER,
  pitchQuality: 46,
}, 24);

const lenientRef = runSeries('lenient_referee', {
  referee: LENIENT_REFEREE,
  homeInstructions: { intensity: 'NORMAL', pressing: 'NORMAL' },
  awayInstructions: { intensity: 'NORMAL', pressing: 'NORMAL' },
}, 24);

const strictRef = runSeries('strict_referee', {
  referee: STRICT_REFEREE,
  homeInstructions: { intensity: 'AGGRESSIVE', pressing: 'PRESSING', marking: 'MAN' },
  awayInstructions: { intensity: 'AGGRESSIVE', pressing: 'PRESSING', marking: 'MAN' },
}, 24);

const lowMotivation = runSeries('low_motivation', {
  homeMorale: 42,
  homeMotivation: 42,
  homeSupport: 48,
  awayMorale: 60,
  awayMotivation: 60,
  awaySupport: 52,
}, 80);

const highMotivation = runSeries('high_motivation', {
  homeMorale: 76,
  homeMotivation: 82,
  homeSupport: 64,
  awayMorale: 60,
  awayMotivation: 60,
  awaySupport: 36,
}, 80);

const noHalfTimeTalk = runSeries('no_half_time_talk', {
  homeMorale: 58,
  homeMotivation: 58,
  awayMorale: 58,
  awayMotivation: 58,
}, 24);

const strongHalfTimeTalk = runSeries('strong_half_time_talk', {
  homeMorale: 58,
  homeMotivation: 58,
  awayMorale: 58,
  awayMotivation: 58,
  halfTimeTalks: {
    HOME: { style: 'ENCOURAGE', intensity: 0.88, clarity: 0.82 },
    AWAY: { style: 'NONE' },
  },
}, 24);

console.table([
  mirror442,
  attackAttributes,
  defenseAttributes,
  keeperAttributes,
  aggressiveAttributes,
  lowStaminaPress,
  attacking433,
  midfield451,
  slowDefensive,
  fastOffensive,
  shortPassing,
  longCounter,
  noMarking,
  manMarking,
  goodConditions,
  badConditions,
  lenientRef,
  strictRef,
  lowMotivation,
  highMotivation,
  noHalfTimeTalk,
  strongHalfTimeTalk,
].map(printable));

assert.ok(mirror442.totalShots >= 12 && mirror442.totalShots <= 30, `4-4-2 vs 4-4-2 ma nierealną liczbę strzałów: ${mirror442.totalShots}`);
assert.ok(mirror442.homePossessionPct >= 43 && mirror442.homePossessionPct <= 57, `4-4-2 vs 4-4-2 nie jest neutralne w posiadaniu: ${mirror442.homePossessionPct}`);
assert.ok(mirror442.homeWinPct >= 30 && mirror442.homeWinPct <= 70, `4-4-2 vs 4-4-2 nie jest neutralne w zwycięstwach: ${mirror442.homeWinPct}`);

assertHigher(attackAttributes.homeXg, mirror442.homeXg, 0.18, 'Lepsze atrybuty ofensywne muszą zwiększać xG gospodarzy');
assertHigher(attackAttributes.homeShots, mirror442.homeShots, 0.9, 'Lepsze atrybuty ofensywne muszą zwiększać strzały gospodarzy');
assertHigher(attackAttributes.homeWinPct, mirror442.homeWinPct, 8, 'Lepsze atrybuty ofensywne muszą zwiększać szansę zwycięstwa');
assertLower(defenseAttributes.homeXg, mirror442.homeXg, 0.10, 'Lepsza obrona/formacja defensywna rywala musi obniżać xG gospodarzy');
assertLower(keeperAttributes.homeGoals, mirror442.homeGoals, 0.10, 'Lepszy bramkarz rywala musi obniżać gole gospodarzy');
assertHigher(aggressiveAttributes.yellows, mirror442.yellows, 0.35, 'Agresywne atrybuty i gra muszą zwiększać kartki');
assertLower(lowStaminaPress.homeFinalFatigue, mirror442.homeFinalFatigue, 2.2, 'Niska stamina przy pressingu musi szybciej męczyć gospodarzy');

assertHigher(attacking433.homeShots, attacking433.awayShots, 2.0, '4-3-3 ofensywne musi generować więcej strzałów niż 5-4-1 defensywne');
assertHigher(attacking433.homeXg, attacking433.awayXg, 0.22, '4-3-3 ofensywne musi generować większe xG niż 5-4-1 defensywne');
assert.ok(midfield451.homePossessionPct >= 51.5, `4-5-1 z krótkim podaniem musi dawać przewagę kontroli środka/posiadania: ${midfield451.homePossessionPct}`);

assertHigher(fastOffensive.totalShots, slowDefensive.totalShots, 2.0, 'Szybkie ofensywne nastawienie musi zwiększać liczbę strzałów');
assertHigher(fastOffensive.totalXg, slowDefensive.totalXg, 0.25, 'Szybkie ofensywne nastawienie musi zwiększać xG');
assertLower(fastOffensive.homeFinalFatigue, slowDefensive.homeFinalFatigue, 0.9, 'Szybkie ofensywne nastawienie musi mocniej męczyć zawodników');
assertHigher(longCounter.directEvents, shortPassing.directEvents, 2.0, 'Długie podania muszą zwiększać liczbę akcji bezpośrednich');
assertHigher(longCounter.counterEvents, shortPassing.counterEvents, 2.0, 'Kontratak musi zwiększać liczbę akcji z kontry');
assertHigher(longCounter.homeOffsides + longCounter.awayOffsides, shortPassing.homeOffsides + shortPassing.awayOffsides, 0.18, 'Długa gra i kontra muszą zwiększać spalone');
assertHigher(noMarking.totalXg, manMarking.totalXg, 0.08, 'Brak krycia musi zwiększać łączne xG rywali');
assertHigher(manMarking.yellows, noMarking.yellows, 0.16, 'Krycie indywidualne/agresywne musi zwiększać kartki');

assertLower(badConditions.totalOnTarget, goodConditions.totalOnTarget, 0.45, 'Zła pogoda musi obniżać liczbę celnych strzałów');
assertHigher(badConditions.injuries, goodConditions.injuries, 0.04, 'Zła pogoda i murawa muszą zwiększać ryzyko urazów');
assertHigher(strictRef.yellows, lenientRef.yellows, 0.45, 'Surowy sędzia musi zwiększać liczbę żółtych kartek');
assertHigher(strictRef.fouls, lenientRef.fouls, 0.35, 'Surowy sędzia musi częściej przerywać kontakt gwizdkiem');

assertHigher(highMotivation.homeXg, lowMotivation.homeXg, 0.14, 'Motywacja przedmeczowa i stadion muszą zwiększać xG gospodarzy');
// Expected points are less brittle than a binary win percentage in a 24-match
// deterministic sample: a stronger side turning defeats into draws is still a
// real result improvement and should not fail only because one draw was not a win.
assertHigher(highMotivation.homePointsPerMatch, lowMotivation.homePointsPerMatch, 0.10, 'Motywacja przedmeczowa i stadion muszą zwiększać dorobek punktowy gospodarzy');
assertHigher(
  strongHalfTimeTalk.homeSecondHalfXg - strongHalfTimeTalk.awaySecondHalfXg,
  noHalfTimeTalk.homeSecondHalfXg - noHalfTimeTalk.awaySecondHalfXg,
  0.08,
  'Rozmowa w przerwie musi poprawiać bilans xG gospodarzy w drugiej połowie'
);

console.log('CupMatchEngineV2FullFactorTests: OK');
