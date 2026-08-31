import {
  MATCH_ACTION_BALL_TOUCH_LABELS,
  type MatchActionBallTouch,
  type MatchActionPlayerPath,
  type MatchActionPlayerRef,
  type MatchActionRecording,
  type MatchActionStartPosition,
  type MatchActionWaypoint,
} from './MatchActionEditorTypes';

const PITCH_WIDTH = 68;
const PITCH_LENGTH = 105;

/**
 * Linear interpolation along a drawn, timestamped path. Before the first
 * waypoint the path holds at its start; after the last it holds at its end —
 * both should be rare since every path's [0] is the formation start and
 * playback never runs past the recording's own duration.
 */
export const interpolatePathAtTime = (
  waypoints: MatchActionWaypoint[],
  atMs: number,
): { x: number; y: number } => {
  if (waypoints.length === 0) return { x: 0, y: 0 };
  if (waypoints.length === 1 || atMs <= waypoints[0].atMs) return { x: waypoints[0].x, y: waypoints[0].y };
  const last = waypoints[waypoints.length - 1];
  if (atMs >= last.atMs) return { x: last.x, y: last.y };
  for (let index = 1; index < waypoints.length; index += 1) {
    const previous = waypoints[index - 1];
    const current = waypoints[index];
    if (atMs > current.atMs) continue;
    const span = current.atMs - previous.atMs;
    const progress = span > 0 ? (atMs - previous.atMs) / span : 1;
    return {
      x: previous.x + (current.x - previous.x) * progress,
      y: previous.y + (current.y - previous.y) * progress,
    };
  }
  return { x: last.x, y: last.y };
};

/**
 * The ball's position at a given time across the whole chained sequence of
 * touches (touch 2 starts in time exactly where touch 1 ends). Before the
 * first touch or with no touches at all, falls back to `restPoint`.
 */
export const ballPositionAtTime = (
  touches: MatchActionBallTouch[],
  atMs: number,
  restPoint: { x: number; y: number },
): { x: number; y: number } => {
  if (touches.length === 0) return restPoint;
  const activeTouch = touches.find(touch => atMs <= (touch.waypoints.at(-1)?.atMs ?? 0)) ?? touches[touches.length - 1];
  return interpolatePathAtTime(activeTouch.waypoints, atMs);
};

/**
 * Where a specific player is at a given time, accounting for everything
 * that can move them: their own off-ball run (if drawn), any ball touch
 * where they carry it (they track the ball for the whole touch), and any
 * touch where they receive a pass/lofted pass (they hold at the arrival
 * point from the moment the ball actually gets there, not before). Falls
 * back to `restPoint` (their formation anchor) if nothing has moved them
 * yet by `atMs`.
 */
export const playerPositionAtTime = (
  ref: MatchActionPlayerRef,
  playerPath: MatchActionPlayerPath | undefined,
  touches: MatchActionBallTouch[],
  atMs: number,
  restPoint: { x: number; y: number },
): { x: number; y: number } => {
  const segments: MatchActionWaypoint[][] = [];
  if (playerPath) segments.push(playerPath.waypoints);
  touches.forEach(touch => {
    if (touch.kind === 'CARRY' && touch.from.side === ref.side && touch.from.slotIndex === ref.slotIndex) {
      segments.push(touch.waypoints);
    } else if (touch.to && touch.to.side === ref.side && touch.to.slotIndex === ref.slotIndex) {
      const end = touch.waypoints.at(-1);
      if (end) segments.push([end]);
    }
  });
  if (segments.length === 0) return restPoint;
  segments.sort((left, right) => (left[0]?.atMs ?? 0) - (right[0]?.atMs ?? 0));
  const active = segments.find(segment => atMs <= (segment.at(-1)?.atMs ?? 0)) ?? segments[segments.length - 1];
  if ((active[0]?.atMs ?? 0) > atMs && active === segments[0]) return restPoint;
  return interpolatePathAtTime(active, atMs);
};

/** Short Polish description of one ball touch, for the editor's sequence readout. */
export const describeBallTouch = (touch: MatchActionBallTouch): string => {
  const from = `${touch.from.side}${touch.from.slotIndex}`;
  const to = touch.to ? `${touch.to.side}${touch.to.slotIndex}` : null;
  if (touch.kind === 'CARRY') return `${from} prowadzi piłkę`;
  if (touch.kind === 'SHOT') return `${from} oddaje strzał`;
  return `${from} → ${to ?? '?'} (${MATCH_ACTION_BALL_TOUCH_LABELS[touch.kind].toLowerCase()})`;
};

export const recordingDurationMs = (recording: MatchActionRecording): number => {
  const playerMax = recording.players.reduce(
    (max, player) => Math.max(max, player.waypoints.at(-1)?.atMs ?? 0),
    0,
  );
  const ballMax = recording.ball.reduce((max, touch) => Math.max(max, touch.waypoints.at(-1)?.atMs ?? 0), 0);
  return Math.max(playerMax, ballMax);
};

const validatePath = (label: string, waypoints: MatchActionWaypoint[], errors: string[]): void => {
  if (waypoints.length < 2) {
    errors.push(`${label}: ścieżka musi mieć co najmniej 2 punkty, ma ${waypoints.length}.`);
    return;
  }
  waypoints.forEach((point, index) => {
    if (point.x < 0 || point.x > PITCH_WIDTH || point.y < 0 || point.y > PITCH_LENGTH) {
      errors.push(`${label}: punkt ${index} (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) wykracza poza boisko.`);
    }
    if (index > 0 && point.atMs < waypoints[index - 1].atMs) {
      errors.push(`${label}: czas punktu ${index} cofa się względem poprzedniego.`);
    }
  });
};

export const validateRecording = (recording: MatchActionRecording): string[] => {
  const errors: string[] = [];
  if (!recording.title.trim()) errors.push('Akcja musi mieć tytuł.');
  if (recording.players.length === 0 && recording.ball.length === 0) {
    errors.push('Akcja musi mieć przynajmniej jedno podanie/bieg/strzał albo ścieżkę zawodnika.');
  }

  const seenStartSlots = new Set<string>();
  recording.startPositions.forEach((start: MatchActionStartPosition, index: number) => {
    if (start.slotIndex < 0 || start.slotIndex > 10) {
      errors.push(`Pozycja startowa ${index}: nieprawidłowy slot formacji ${start.slotIndex}.`);
    }
    const key = `${start.side}:${start.slotIndex}`;
    if (seenStartSlots.has(key)) errors.push(`Pozycja startowa ${index}: slot ${key} ma już ustawioną pozycję startową.`);
    seenStartSlots.add(key);
    if (start.x < 0 || start.x > PITCH_WIDTH || start.y < 0 || start.y > PITCH_LENGTH) {
      errors.push(`Pozycja startowa ${key}: punkt (${start.x.toFixed(1)}, ${start.y.toFixed(1)}) wykracza poza boisko.`);
    }
  });

  const seenSlots = new Set<string>();
  recording.players.forEach((player: MatchActionPlayerPath, index: number) => {
    if (player.slotIndex < 0 || player.slotIndex > 10) {
      errors.push(`Zawodnik ${index}: nieprawidłowy slot formacji ${player.slotIndex}.`);
    }
    const slotKey = `${player.side}:${player.slotIndex}`;
    if (seenSlots.has(slotKey)) errors.push(`Zawodnik ${index}: slot ${slotKey} ma już narysowaną ścieżkę.`);
    seenSlots.add(slotKey);
    validatePath(`Zawodnik ${player.side}${player.slotIndex}`, player.waypoints, errors);
  });

  let previousTouchEndMs = -Infinity;
  recording.ball.forEach((touch: MatchActionBallTouch, index: number) => {
    const label = `Piłka, akcja ${index + 1} (${touch.kind})`;
    validatePath(label, touch.waypoints, errors);
    if ((touch.kind === 'PASS' || touch.kind === 'LOFTED_PASS') && !touch.to) {
      errors.push(`${label}: podanie musi mieć odbiorcę.`);
    }
    const startMs = touch.waypoints[0]?.atMs ?? 0;
    if (startMs < previousTouchEndMs) errors.push(`${label}: zaczyna się przed końcem poprzedniej akcji piłki.`);
    previousTouchEndMs = touch.waypoints.at(-1)?.atMs ?? previousTouchEndMs;
  });

  return errors;
};
