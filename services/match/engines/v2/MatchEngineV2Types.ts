import type {
  ActiveUserCoachInstruction,
  ActiveUserCoachShout,
  ActiveAiCoachInstruction,
  ActiveAiCoachShout,
  CoachAttributes,
  TacticalInstructions,
  UserCoachInstructionId,
  UserCoachInstructionMemory,
  UserCoachShoutId,
  UserCoachShoutMemory,
  UserCoachShoutRngState,
} from '../../../../types';
import type {
  CupDisplayClock,
  CupHalfTimeTalk,
  CupLiveMatch,
  CupMatchEvent,
  CupMatchInput,
  CupMatchResult,
  CupTeamSide,
} from '../cupV2';

export type MatchEngineV2Side = CupTeamSide;

/** Competition rules are data, not branches duplicated across match views. */
export type MatchEngineV2Rules = {
  id: string;
  normalTimeSeconds: number;
  extraTimeSeconds: number;
  maxSubstitutions: number;
  allowDraw: boolean;
  enableExtraTime: boolean;
  enablePenaltyShootout: boolean;
};

/**
 * The first neutral input deliberately reuses the already calibrated cupV2
 * team/environment contracts. The `rules` field removes cup-specific behavior
 * from the core API and lets league, cup and friendly adapters share one engine.
 */
export type MatchEngineV2Input = Omit<CupMatchInput, 'config'> & {
  rules: MatchEngineV2Rules;
  config?: {
    tickSeconds?: number;
    calibrationMode?: boolean;
  };
  coaching?: {
    aiSides?: MatchEngineV2Side[];
    coachAttributes?: Partial<Record<MatchEngineV2Side, CoachAttributes>>;
  };
};

export type MatchEngineV2TacticalPatch = Partial<Pick<TacticalInstructions,
  | 'tempo'
  | 'mindset'
  | 'intensity'
  | 'passing'
  | 'pressing'
  | 'counterAttack'
  | 'marking'
  | 'tempoResponseFactor'
  | 'mindsetResponseFactor'
  | 'intensityResponseFactor'
  | 'passingResponseFactor'
  | 'pressingResponseFactor'
  | 'counterAttackResponseFactor'
  | 'markingResponseFactor'
>>;

export type MatchEngineV2Command =
  | {
      type: 'UPDATE_INSTRUCTIONS';
      atSecond: number;
      side: MatchEngineV2Side;
      patch: MatchEngineV2TacticalPatch;
    }
  | {
      type: 'SUBSTITUTION';
      atSecond: number;
      side: MatchEngineV2Side;
      playerOutId: string;
      playerInId: string;
    }
  | {
      type: 'SET_HALF_TIME_TALK';
      atSecond: number;
      side: MatchEngineV2Side;
      talk: CupHalfTimeTalk;
    }
  | {
      type: 'TOUCHLINE_INSTRUCTION';
      atSecond: number;
      side: MatchEngineV2Side;
      instructionId: UserCoachInstructionId | null;
    }
  | {
      type: 'COACH_SHOUT';
      atSecond: number;
      side: MatchEngineV2Side;
      shoutId: UserCoachShoutId | null;
    };

export type MatchEngineV2CommandLogEntry = {
  sequence: number;
  accepted: boolean;
  reason?: string;
  command: MatchEngineV2Command;
};

export type MatchEngineV2Point = {
  /** Horizontal pitch coordinate in metres: 0..68. */
  x: number;
  /** Longitudinal pitch coordinate in metres: 0..105. HOME attacks upward. */
  y: number;
};

export type MatchEngineV2PlayerSpatialState = {
  playerId: string;
  side: MatchEngineV2Side;
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
  anchor: MatchEngineV2Point;
  /** Invisible tactical work area derived from this player's default slot. */
  movementZone: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  position: MatchEngineV2Point;
  target: MatchEngineV2Point;
  /** Continuous velocity in pitch metres per match second. */
  velocity: MatchEngineV2Point;
  /** Facing direction in radians, used by later ball-control decisions. */
  facingRadians: number;
  metresPerSecond: number;
  isOnPitch: boolean;
  movementIntent: 'HOLD_SHAPE' | 'SUPPORT' | 'PRESS' | 'RECOVER' | 'RUN_BEHIND';
  movementState: 'IDLE' | 'ACCELERATING' | 'RUNNING' | 'BRAKING';
  /** Prevents an individual from changing jobs on every five-second tick. */
  intentCommittedUntilSecond: number;
  /** Temporary restart exception; the player must run back instead of being clamped/teleported. */
  returningToMovementZone: boolean;
};

export type MatchEngineV2BallSpatialState = MatchEngineV2Point & {
  z: number;
  velocity: MatchEngineV2Point & { z: number };
  ownerId?: string;
  intendedReceiverId?: string;
  lastTouchPlayerId?: string;
  lastUpdatedSecond: number;
  phase: 'CONTROLLED' | 'TRAVELLING' | 'LOOSE' | 'DEAD';
};

/**
 * A team phase describes the collective purpose of all eleven players. It is
 * deliberately separate from an individual movement intent: the team may be
 * in ATTACK while one defender still holds a covering position.
 */
export type MatchEngineV2TeamPhase =
  | 'DEFENSIVE_SHAPE'
  | 'BUILD_UP'
  | 'ATTACK'
  | 'FINAL_THIRD'
  | 'TRANSITION_ATTACK'
  | 'TRANSITION_DEFEND';

export type MatchEngineV2TeamSpatialContext = {
  phase: MatchEngineV2TeamPhase;
  previousPhase: MatchEngineV2TeamPhase;
  phaseChangedAtSecond: number;
};

/**
 * Named, reusable movement patterns for the players not directly involved in
 * a scene's pass/shot chain. Each is a pure presentation function keyed by
 * this id in MatchEngineV2GroupBehaviorService — adding a new one never
 * requires touching the frame controller or an authored scenario's steps
 * that do not reference it.
 */
export type MatchEngineV2GroupBehaviorId =
  | 'DEFENSIVE_LINE_RETREAT'
  | 'MIDFIELD_SHIFT_LEFT'
  | 'MIDFIELD_SHIFT_RIGHT'
  | 'TEAM_PUSH_FORWARD'
  | 'ATTACKERS_ENTER_BOX'
  | 'DEFENDERS_HOLD_LINE';

export type MatchEngineV2VisualCueKind =
  | 'PASS'
  | 'CONTROL'
  | 'DRIBBLE'
  | 'TACKLE'
  | 'CROSS'
  | 'TURNOVER'
  | 'SHOT'
  | 'BLOCK'
  | 'REBOUND'
  | 'GOAL'
  | 'SAVE'
  | 'RESTART'
  | 'FOUL'
  | 'CARD'
  | 'INJURY'
  | 'SUBSTITUTION';

/**
 * Renderer instruction derived from an authoritative match event. It contains
 * no random value and therefore cannot create an action which the engine did
 * not record. A later SVG controller may interpolate between start and end.
 */
export type MatchEngineV2VisualCue = {
  id: string;
  sourceEventId: string;
  sequenceId?: string;
  sourceEventType: CupMatchEvent['type'];
  /**
   * Preserves the authoritative restart subtype for the SVG presentation.
   * A penalty/free-kick shot is still a normal SHOT event in the simulation,
   * so sourceEventType alone cannot tell the renderer how both teams should
   * line up. This field never feeds information back into the match engine.
   */
  setPieceKind?: 'CORNER' | 'FREE_KICK_WIDE' | 'FREE_KICK_DIRECT' | 'PENALTY';
  kind: MatchEngineV2VisualCueKind;
  atSecond: number;
  side?: MatchEngineV2Side;
  actorId?: string;
  secondaryPlayerId?: string;
  start: MatchEngineV2Point;
  end: MatchEngineV2Point;
  durationMs: number;
  /** Expected-goals value of the underlying shot event, when it has one. */
  xG?: number;
  /** Presentation-only reference to a pre-authored key-moment sequence. */
  highlightScriptId?: string;
  highlightScriptTitle?: string;
  highlightSceneIndex?: number;
  highlightSceneCount?: number;
  scriptedHighlight?: boolean;
  /** How the attacking side's uninvolved players should move during this step. */
  attackingGroupBehavior?: MatchEngineV2GroupBehaviorId;
  /** How the defending side's uninvolved players should move during this step. */
  defendingGroupBehavior?: MatchEngineV2GroupBehaviorId;
  /**
   * Commentary text for this step, with {actor}/{receiver} placeholders. The
   * presentation layer substitutes real names; this service never sees them.
   */
  commentaryTemplate?: string;
  /**
   * Named, individually-choreographed runs for players who are neither this
   * step's actor nor its receiver (a decoy run, a marker being dragged out of
   * position), already resolved to real player ids and mirrored for the away
   * side. Presentation-only, like the rest of this cue.
   */
  supportingRuns?: Array<{ playerId: string; start: MatchEngineV2Point; end: MatchEngineV2Point }>;
};

export type MatchEngineV2TrajectorySample = MatchEngineV2Point & {
  z: number;
  progress: number;
  finished: boolean;
};

export type MatchEngineV2RenderMode = 'CLASSIC' | 'INTERACTIVE';
/**
 * FULL_MATCH exposes every recorded ball event to the SVG controller.
 * ALL_ACTIONS shows every terminal shot, foul and set piece as a scene.
 * KEY_MOMENTS narrows that down to goals, penalties and only the shots or
 * saves that came from a high-quality chance. COMMENTARY_ONLY shows no
 * scripted scene at all, only the running text event log.
 */
export type MatchEngineV2TransmissionMode = 'FULL_MATCH' | 'ALL_ACTIONS' | 'KEY_MOMENTS' | 'COMMENTARY_ONLY';
/** Real seconds per match minute during quiet play: 1 = normal, 2 = slower, 3 = much slower. */
export type MatchEngineV2PlaybackSpeed = 1 | 2 | 3;

export type MatchEngineV2PlaybackState = {
  exactSecond: number;
  targetSecond: number;
  paused: boolean;
  speed: MatchEngineV2PlaybackSpeed;
  /**
   * Independent from `speed`: only stretches how long an authored action
   * scene (goal, save, corner, free kick...) plays out, not the pacing of
   * quiet in-between play. 1 = normal, 2 = slower, 3 = much slower.
   */
  sceneSpeed: MatchEngineV2PlaybackSpeed;
  renderMode: MatchEngineV2RenderMode;
  transmissionMode: MatchEngineV2TransmissionMode;
  goalReplays: boolean;
};

export type MatchEngineV2FramePlayer = {
  playerId: string;
  position: MatchEngineV2Point;
  isOnPitch: boolean;
};

export type MatchEngineV2ReplayFrame = {
  active: boolean;
  goalCueId?: string;
  cueIndex: number;
  cueCount: number;
  progress: number;
};

/**
 * Read-only presentation frame sampled between authoritative engine snapshots.
 * Nothing in this object is fed back into match decisions, score or RNG state.
 */
export type MatchEngineV2Frame = {
  visualClockMs: number;
  /** Smoothly advancing football-time (half/stoppage-aware) second for cosmetic clock display; freezes during any shown scene. */
  displaySecond: number;
  players: Record<string, MatchEngineV2FramePlayer>;
  ball: MatchEngineV2TrajectorySample;
  activeCue: MatchEngineV2VisualCue | null;
  cueProgress: number;
  replay: MatchEngineV2ReplayFrame;
  goalCelebration: {
    active: boolean;
    side?: MatchEngineV2Side;
    progress: number;
  };
  /** The host pauses advancement during a live goal celebration or stored replay. */
  blockSimulation: boolean;
};

export type MatchEngineV2SpatialState = {
  pitchLength: 105;
  pitchWidth: 68;
  lastSecond: number;
  players: Record<string, MatchEngineV2PlayerSpatialState>;
  ball: MatchEngineV2BallSpatialState;
  /** Last possession used to detect a real turnover exactly once. */
  lastPossession: MatchEngineV2Side;
  /** Collective state shared by every player of the relevant side. */
  teamContexts: Record<MatchEngineV2Side, MatchEngineV2TeamSpatialContext>;
  /** Index of the last authoritative event already projected for SVG. */
  lastEventIndex: number;
  /** Bounded replay/display buffer; it never feeds decisions back to the engine. */
  visualCues: MatchEngineV2VisualCue[];
};

export type MatchEngineV2CoachSideState = {
  activeInstruction: ActiveUserCoachInstruction | ActiveAiCoachInstruction | null;
  instructionMemory: UserCoachInstructionMemory;
  activeShout: ActiveUserCoachShout | ActiveAiCoachShout | null;
  shoutMemory: UserCoachShoutMemory;
  shoutRng: UserCoachShoutRngState;
  aiControlled: boolean;
  coachAttributes: CoachAttributes;
  nextAiDecisionMinute: number;
  /** Number of authoritative events already inspected by the reactive AI layer. */
  lastReviewedEventIndex: number;
  /** Prevents one incident from producing several commands in adjacent engine ticks. */
  lastReactiveDecisionMinute: number;
  /** Separate cooldown for statistical dominance, which has no single source event. */
  lastDominanceReactionMinute: number;
  /** Human-readable UI may translate this stable code without reading AI internals. */
  lastDecisionReason: 'SCHEDULED' | 'RED_CARD' | 'INJURY' | 'FORCED_SUBSTITUTION' | 'OPPONENT_DOMINANCE' | null;
};

export type MatchEngineV2CoachCommandPresentation = {
  id: UserCoachInstructionId | UserCoachShoutId;
  label: string;
  status: 'PENDING' | 'ACTIVE';
  issuedMinute: number;
  startsMinute: number;
  expiryMinute: number;
  remainingMinutes: number;
};

/**
 * Detached, display-ready coach information. The future SVG panel must consume
 * this projection instead of inspecting or mutating authoritative AI objects.
 */
export type MatchEngineV2CoachPresentation = {
  instruction: MatchEngineV2CoachCommandPresentation | null;
  shout: MatchEngineV2CoachCommandPresentation | null;
  lastDecisionReason: MatchEngineV2CoachSideState['lastDecisionReason'];
  decisionReasonLabel: string | null;
  summary: string;
};

export type MatchEngineV2Runtime = {
  version: '2.0-prototype';
  rules: MatchEngineV2Rules;
  core: CupLiveMatch;
  commandLog: MatchEngineV2CommandLogEntry[];
  coachState: Record<MatchEngineV2Side, MatchEngineV2CoachSideState>;
  spatial: MatchEngineV2SpatialState;
};

export type MatchEngineV2Snapshot = {
  version: MatchEngineV2Runtime['version'];
  second: number;
  displayClock: CupDisplayClock;
  phase: CupLiveMatch['state']['phase'];
  isFinished: boolean;
  result: CupMatchResult;
  commandLog: readonly MatchEngineV2CommandLogEntry[];
  coachState: Record<MatchEngineV2Side, MatchEngineV2CoachSideState>;
  coachPresentation: Record<MatchEngineV2Side, MatchEngineV2CoachPresentation>;
  spatial: MatchEngineV2SpatialState;
};
