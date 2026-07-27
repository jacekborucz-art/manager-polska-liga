import type {
  Lineup,
  MatchEventType,
  Player,
  Referee,
  Tactic,
  TacticalInstructions,
  WeatherSnapshot,
} from '../../../../types';

export type CupTeamSide = 'HOME' | 'AWAY';
export type CupMatchPhase = 'FIRST_HALF' | 'SECOND_HALF' | 'EXTRA_TIME_1' | 'EXTRA_TIME_2' | 'PENALTY_SHOOTOUT' | 'FINISHED';
export type CupPitchZone = 'GK' | 'DEFENSE' | 'MIDFIELD' | 'FINAL_THIRD' | 'BOX' | 'WIDE_LEFT' | 'WIDE_RIGHT';
export type CupAttackPattern = 'BUILD_UP' | 'DIRECT' | 'COUNTER' | 'WING_PLAY' | 'SET_PIECE' | 'SECOND_BALL';
export type CupPossessionReason = 'KICK_OFF' | 'TURNOVER' | 'SAVE' | 'OUT_OF_PLAY' | 'GOAL_RESTART' | 'HALF_START';
export type CupChanceKind = 'DISTANCE' | 'HALF_CHANCE' | 'GOOD_CHANCE' | 'BIG_CHANCE' | 'ONE_ON_ONE' | 'SET_PIECE';
export type CupHalfTimeTalkStyle = 'NONE' | 'CALM' | 'ENCOURAGE' | 'DEMAND_MORE' | 'PRAISE' | 'TACTICAL_RESET';
export type CupInjurySeverity = 'LIGHT' | 'SEVERE';

export type CupEngineConfig = {
  tickSeconds: number;
  normalTimeSeconds: number;
  extraTimeSeconds: number;
  maxSubstitutions: number;
  enableExtraTime: boolean;
  enablePenaltyShootout: boolean;
  calibrationMode?: boolean;
};

export const DEFAULT_CUP_ENGINE_CONFIG: CupEngineConfig = {
  tickSeconds: 5,
  normalTimeSeconds: 90 * 60,
  extraTimeSeconds: 30 * 60,
  maxSubstitutions: 5,
  enableExtraTime: true,
  enablePenaltyShootout: true,
  calibrationMode: false,
};

export type CupTeamInput = {
  side: CupTeamSide;
  clubId: string;
  name: string;
  players: Player[];
  lineup: Lineup;
  tactic: Tactic;
  instructions: TacticalInstructions;
  morale: number;
  preMatchMotivation: number;
  stadiumSupport: number;
};

export type CupEnvironment = {
  weather?: WeatherSnapshot;
  pitchQuality: number;
  stadiumCapacity?: number;
  attendance?: number;
  referee: Referee;
};

export type CupHalfTimeTalk = {
  style: CupHalfTimeTalkStyle;
  intensity?: number;
  clarity?: number;
};

export type CupMatchInput = {
  seed: string;
  home: CupTeamInput;
  away: CupTeamInput;
  environment: CupEnvironment;
  halfTimeTalks?: Partial<Record<CupTeamSide, CupHalfTimeTalk>>;
  config?: Partial<CupEngineConfig>;
  calibration?: {
    scenario: string;
    homeQuality: number;
    awayQuality: number;
    expectedFavorite?: CupTeamSide;
  };
};

export type CupPlayerRuntime = {
  player: Player;
  side: CupTeamSide;
  fatigue: number;
  yellowCards: number;
  redCard: boolean;
  injured: boolean;
  ratingImpact: number;
};

export type CupTeamRuntimeProfile = {
  side: CupTeamSide;
  activePlayers: Player[];
  goalkeeper?: Player;
  outfieldPlayers: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
  buildUp: number;
  midfieldControl: number;
  progression: number;
  chanceCreation: number;
  finishing: number;
  crossing: number;
  aerialThreat: number;
  defensiveShape: number;
  pressing: number;
  counterThreat: number;
  setPieces: number;
  goalkeeperQuality: number;
  disciplineRisk: number;
  staminaReserve: number;
  leadership: number;
  mentality: number;
  tacticalWidth: number;
  lineHeight: number;
};

export type CupMatchStats = {
  possessionTicks: number;
  shots: number;
  shotsOnTarget: number;
  goals: number;
  xG: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  injuries: number;
  freeKicks: number;
  penalties: number;
  posts: number;
  bars: number;
  saves: number;
};

export type CupTeamStatsMap = Record<CupTeamSide, CupMatchStats>;

export type CupMatchEvent = {
  id: string;
  second: number;
  minute: number;
  side?: CupTeamSide;
  type: MatchEventType;
  zone?: CupPitchZone;
  pattern?: CupAttackPattern;
  playerId?: string;
  secondaryPlayerId?: string;
  text: string;
  xG?: number;
  detail?: Record<string, number | string | boolean | undefined>;
};

export type CupPlayerMatchStats = {
  playerId: string;
  name: string;
  side: CupTeamSide;
  clubId: string;
  position: Player['position'];
  starter: boolean;
  startedSecond?: number;
  endedSecond?: number;
  minutesPlayed: number;
  goals: number;
  ownGoals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  posts: number;
  bars: number;
  xG: number;
  chancesCreated: number;
  keyPasses: number;
  foulsCommitted: number;
  foulsWon: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  injuriesLight: number;
  injuriesSevere: number;
  substitutionsOn: number;
  substitutionsOff: number;
  saves: number;
  goalsConceded: number;
  penaltiesTaken: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  penaltiesSaved: number;
  rating: number;
};

export type CupPlayerStatsMap = Record<CupTeamSide, Record<string, CupPlayerMatchStats>>;

export type CupRuntimeState = {
  second: number;
  phase: CupMatchPhase;
  possession: CupTeamSide;
  possessionReason: CupPossessionReason;
  ballZone: CupPitchZone;
  attackPattern: CupAttackPattern;
  homeScore: number;
  awayScore: number;
  momentum: number;
  pressure: Record<CupTeamSide, number>;
  organization: Record<CupTeamSide, number>;
  fatigue: Record<string, number>;
  yellowCards: Record<string, number>;
  redCards: Record<string, boolean>;
  injuries: Record<string, CupInjurySeverity>;
  substitutionsUsed: Record<CupTeamSide, number>;
  addedTimeSeconds: number;
  stats: CupTeamStatsMap;
  events: CupMatchEvent[];
};

export type CupTickContext = {
  input: CupMatchInput;
  config: CupEngineConfig;
  state: CupRuntimeState;
  homeProfile: CupTeamRuntimeProfile;
  awayProfile: CupTeamRuntimeProfile;
  random: (salt: number) => number;
};

export type CupActionIntent = {
  side: CupTeamSide;
  pattern: CupAttackPattern;
  risk: number;
  tempo: number;
  verticality: number;
  widthUse: number;
};

export type CupActionOutcome = {
  nextPossession?: CupTeamSide;
  nextZone?: CupPitchZone;
  momentumDelta: number;
  events: CupMatchEvent[];
};

export type CupChance = {
  side: CupTeamSide;
  kind: CupChanceKind;
  zone: CupPitchZone;
  pattern: CupAttackPattern;
  shooter: Player;
  creator?: Player;
  marker?: Player;
  xG: number;
  pressure: number;
  angle: number;
  distance: number;
};

export type CupShotOutcome = {
  eventType: MatchEventType;
  goal: boolean;
  onTarget: boolean;
  corner: boolean;
  save: boolean;
  xG: number;
  momentumDelta: number;
  text: string;
  assistEligible?: boolean;
  isOwnGoal?: boolean;
  ownGoalPlayerId?: string;
};

export type CupPenaltyShootoutAttempt = {
  id: string;
  round: number;
  order: number;
  side: CupTeamSide;
  takerId: string;
  goalkeeperId?: string;
  scored: boolean;
  saved: boolean;
  xG: number;
  takerScore: number;
  keeperScore: number;
};

export type CupAiDecision = {
  instructions: TacticalInstructions;
  reason: string;
  urgency: number;
};

export type CupMatchResult = {
  homeScore: number;
  awayScore: number;
  winner?: CupTeamSide;
  decidedByPenalties: boolean;
  penaltyScore?: { home: number; away: number };
  penaltyShootout?: CupPenaltyShootoutAttempt[];
  stats: CupTeamStatsMap;
  playerStats: CupPlayerStatsMap;
  events: CupMatchEvent[];
  finalState: CupRuntimeState;
};
