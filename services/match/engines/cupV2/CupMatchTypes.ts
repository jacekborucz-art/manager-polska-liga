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
export type CupPossessionReason =
  | 'OPEN_PLAY'
  | 'KICK_OFF'
  | 'TURNOVER'
  | 'SAVE'
  | 'OUT_OF_PLAY'
  | 'CORNER'
  /** Róg wykonany (CORNER_TAKEN już zapisany); ten sam tick rozstrzyga jeszcze, czy z dośrodkowania powstaje sytuacja strzelecka. */
  | 'CORNER_DELIVERY'
  | 'GOAL_KICK'
  | 'GOAL_RESTART'
  | 'HALF_START';
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
  /**
   * Optional live 2D geometry supplied by Match Engine V2 before each tick.
   * Background cup simulations omit it and retain their calibrated aggregate
   * model. This object is ephemeral and is never required in a career save.
   */
  spatialDecisionContext?: CupSpatialDecisionContext;
};

export type CupSpatialDecisionPlayer = {
  playerId: string;
  side: CupTeamSide;
  role: Player['position'];
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isOnPitch: boolean;
};

export type CupSpatialDecisionContext = {
  second: number;
  pitchLength: 105;
  pitchWidth: 68;
  ball: { x: number; y: number; ownerId?: string };
  players: Record<string, CupSpatialDecisionPlayer>;
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
  passesAttempted: number;
  passesCompleted: number;
  dribblesAttempted: number;
  dribblesCompleted: number;
  tacklesWon: number;
  crossesAttempted: number;
  crossesCompleted: number;
  blocks: number;
  reboundsWon: number;
  turnoversWon: number;
  turnoversLost: number;
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

export type CupCoachEffects = {
  initiativeModifier: number;
  ownShotModifier: number;
  opponentShotModifier: number;
  turnoverRiskModifier: number;
  fatigueExtra: number;
  foulMultiplier: number;
  injuryMultiplier: number;
};

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
  passesAttempted: number;
  passesCompleted: number;
  controls: number;
  dribblesAttempted: number;
  dribblesCompleted: number;
  tacklesAttempted: number;
  tacklesWon: number;
  crossesAttempted: number;
  crossesCompleted: number;
  shotsBlocked: number;
  reboundsWon: number;
  turnoversWon: number;
  turnoversLost: number;
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
  /** Current authoritative carrier keeps consecutive actions player-continuous. */
  ballCarrierId?: string;
  ballZone: CupPitchZone;
  attackPattern: CupAttackPattern;
  homeScore: number;
  awayScore: number;
  momentum: number;
  pressure: Record<CupTeamSide, number>;
  organization: Record<CupTeamSide, number>;
  /** Temporary post-talk response; it fades during the second half. */
  halfTimeResponse: Record<CupTeamSide, number>;
  coachEffects: Record<CupTeamSide, CupCoachEffects>;
  fatigue: Record<string, number>;
  yellowCards: Record<string, number>;
  redCards: Record<string, boolean>;
  injuries: Record<string, CupInjurySeverity>;
  substitutionsUsed: Record<CupTeamSide, number>;
  firstHalfKickOffSide: CupTeamSide;
  restartSourceEventId?: string;
  /** Stoppage time resolved independently at the end of each regulation half. */
  firstHalfAddedTimeSeconds: number;
  secondHalfAddedTimeSeconds: number;
  /**
   * Compatibility total used by reports and rule checks. It is always equal
   * to firstHalfAddedTimeSeconds + secondHalfAddedTimeSeconds.
   */
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

export type CupPossessionAction = 'PASS' | 'DIRECT_PASS' | 'DRIBBLE' | 'CROSS';

/** Individual actors selected for the current possession duel. */
export type CupPossessionDecision = {
  passer?: Player;
  receiver?: Player;
  presser?: Player;
  action: CupPossessionAction;
  spatial?: {
    passerX: number;
    passerY: number;
    receiverX?: number;
    receiverY?: number;
    passDistance?: number;
    forwardProgress?: number;
    laneClearance?: number;
    passerPressure?: number;
    receiverPressure?: number;
  };
};

export type CupActionOutcome = {
  nextPossession?: CupTeamSide;
  nextZone?: CupPitchZone;
  nextPossessionReason?: CupPossessionReason;
  restartSourceEventId?: string;
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

/**
 * Mutable runtime owned by the match engine while a live match is in progress.
 *
 * React must never edit `state` directly. Tactical commands and substitutions
 * go through the public engine API so past events remain immutable and every
 * future random draw continues from the same deterministic timeline.
 */
export type CupLiveMatch = {
  input: CupMatchInput;
  config: CupEngineConfig;
  state: CupRuntimeState;
  initialLineup: Record<CupTeamSide, Lineup>;
  halfTimeTalkApplied: boolean;
  finalResult?: CupMatchResult;
};
