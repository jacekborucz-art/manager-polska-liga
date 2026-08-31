export type MatchActionOutcomeTag =
  | 'GOAL'
  | 'CORNER'
  | 'FREE_KICK'
  | 'PENALTY'
  | 'THROW_IN'
  | 'OFFSIDE'
  | 'FOUL'
  | 'SAVE'
  | 'POST'
  | 'BAR';

export const MATCH_ACTION_OUTCOME_TAGS: MatchActionOutcomeTag[] = [
  'GOAL',
  'CORNER',
  'FREE_KICK',
  'PENALTY',
  'THROW_IN',
  'OFFSIDE',
  'FOUL',
  'SAVE',
  'POST',
  'BAR',
];

export const MATCH_ACTION_OUTCOME_LABELS: Record<MatchActionOutcomeTag, string> = {
  GOAL: 'GOL',
  CORNER: 'RZUT ROŻNY',
  FREE_KICK: 'RZUT WOLNY',
  PENALTY: 'RZUT KARNY',
  THROW_IN: 'AUT',
  OFFSIDE: 'SPALONY',
  FOUL: 'FAUL',
  SAVE: 'OBRONA BRAMKARZA',
  POST: 'SŁUPEK',
  BAR: 'POPRZECZKA',
};

export type MatchActionSide = 'A' | 'B';

export type MatchActionWaypoint = {
  x: number;
  y: number;
  atMs: number;
};

/**
 * A player is addressed by their formation slot (0-10 into the chosen
 * Tactic's `slots` array), not a role+index like the hand-authored
 * MatchEngineV2HighlightActor system. The editor already requires a chosen
 * formation for both sides, so the slot alone is an unambiguous address —
 * resolving it to a real player at match time is the same
 * tactic.slots[index] + startingXI[index] lookup createTeamPlayers already
 * does in MatchEngineV2SpatialService.ts.
 */
export type MatchActionPlayerPath = {
  side: MatchActionSide;
  slotIndex: number;
  /** [0] is the player's formation starting point; later points are drawn. */
  waypoints: MatchActionWaypoint[];
};

export type MatchActionPlayerRef = { side: MatchActionSide; slotIndex: number };

export type MatchActionBallTouchKind = 'PASS' | 'CARRY' | 'LOFTED_PASS' | 'SHOT';

export const MATCH_ACTION_BALL_TOUCH_KINDS: MatchActionBallTouchKind[] = ['PASS', 'CARRY', 'LOFTED_PASS', 'SHOT'];

export const MATCH_ACTION_BALL_TOUCH_LABELS: Record<MatchActionBallTouchKind, string> = {
  PASS: 'PODANIE',
  CARRY: 'BIEG Z PIŁKĄ',
  LOFTED_PASS: 'PODANIE GÓRĄ',
  SHOT: 'STRZAŁ',
};

/**
 * One leg of the ball's journey through the action: who has it, what they do
 * with it, and — for a pass — who it's going to. The whole `ball` array is
 * one continuous timeline (each touch's waypoints continue in time where the
 * previous touch's left off), so "podanie, bieg z piłką, podanie górą,
 * strzał" is just four touches recorded one after another.
 */
export type MatchActionBallTouch = {
  kind: MatchActionBallTouchKind;
  from: MatchActionPlayerRef;
  /** Only set for PASS/LOFTED_PASS — who receives it. CARRY stays with `from`; SHOT goes to goal. */
  to?: MatchActionPlayerRef;
  waypoints: MatchActionWaypoint[];
};

/**
 * A player placed somewhere other than their formation anchor before the
 * action even starts — e.g. how the defence actually lines up for a corner,
 * not the generic tactical shape. This is the point everything else (off-ball
 * runs, ball touches) starts from for that player; anyone not listed here
 * simply starts on their formation anchor, same convention as `players`.
 */
export type MatchActionStartPosition = {
  side: MatchActionSide;
  slotIndex: number;
  x: number;
  y: number;
};

export type MatchActionRecording = {
  id: string;
  outcome: MatchActionOutcomeTag;
  title: string;
  formationIdA: string;
  formationIdB: string;
  /** Only players moved before the action starts; everyone else stays on their formation anchor. */
  startPositions: MatchActionStartPosition[];
  /** Off-ball runs only — decoys, markers, supporting movement. */
  players: MatchActionPlayerPath[];
  /** The ball's whole journey through the action, as consecutive typed touches. */
  ball: MatchActionBallTouch[];
  createdAt: string;
};
