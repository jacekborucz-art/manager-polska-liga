import assert from 'node:assert/strict';
import {
  ballPositionAtTime,
  describeBallTouch,
  interpolatePathAtTime,
  playerPositionAtTime,
  recordingDurationMs,
  validateRecording,
} from '../services/match/editor/MatchActionEditorPlaybackService';
import type { MatchActionBallTouch, MatchActionRecording, MatchActionStartPosition, MatchActionWaypoint } from '../services/match/editor/MatchActionEditorTypes';

const waypoints: MatchActionWaypoint[] = [
  { x: 10, y: 20, atMs: 0 },
  { x: 20, y: 40, atMs: 1000 },
  { x: 30, y: 40, atMs: 2000 },
];

assert.deepEqual(interpolatePathAtTime(waypoints, -100), { x: 10, y: 20 }, 'Przed startem trzyma pierwszy punkt.');
assert.deepEqual(interpolatePathAtTime(waypoints, 0), { x: 10, y: 20 });
assert.deepEqual(interpolatePathAtTime(waypoints, 500), { x: 15, y: 30 }, 'Środek pierwszego odcinka.');
assert.deepEqual(interpolatePathAtTime(waypoints, 1000), { x: 20, y: 40 });
assert.deepEqual(interpolatePathAtTime(waypoints, 1500), { x: 25, y: 40 }, 'Środek drugiego odcinka.');
assert.deepEqual(interpolatePathAtTime(waypoints, 2000), { x: 30, y: 40 });
assert.deepEqual(interpolatePathAtTime(waypoints, 9000), { x: 30, y: 40 }, 'Po końcu trzyma ostatni punkt.');
assert.deepEqual(interpolatePathAtTime([], 100), { x: 0, y: 0 });
assert.deepEqual(interpolatePathAtTime([{ x: 5, y: 6, atMs: 0 }], 500), { x: 5, y: 6 });

const restPoint = { x: 34, y: 52.5 };
const passTouch: MatchActionBallTouch = {
  kind: 'PASS',
  from: { side: 'A', slotIndex: 6 },
  to: { side: 'A', slotIndex: 9 },
  waypoints: [{ x: 34, y: 60, atMs: 0 }, { x: 34, y: 80, atMs: 500 }],
};
const shotTouch: MatchActionBallTouch = {
  kind: 'SHOT',
  from: { side: 'A', slotIndex: 9 },
  waypoints: [{ x: 34, y: 80, atMs: 500 }, { x: 34, y: 104, atMs: 800 }],
};
assert.deepEqual(ballPositionAtTime([], 100, restPoint), restPoint, 'Bez żadnej akcji piłka stoi w punkcie spoczynku.');
assert.deepEqual(ballPositionAtTime([passTouch, shotTouch], 250, restPoint), { x: 34, y: 70 }, 'Środek pierwszej akcji (podania).');
assert.deepEqual(ballPositionAtTime([passTouch, shotTouch], 650, restPoint), { x: 34, y: 92 }, 'Środek drugiej akcji (strzału).');
assert.deepEqual(ballPositionAtTime([passTouch, shotTouch], 9000, restPoint), { x: 34, y: 104 }, 'Po końcu trzyma ostatni punkt ostatniej akcji.');

const carryTouch: MatchActionBallTouch = {
  kind: 'CARRY',
  from: { side: 'A', slotIndex: 9 },
  waypoints: [{ x: 34, y: 80, atMs: 500 }, { x: 34, y: 90, atMs: 900 }],
};
const receiverRef = { side: 'A' as const, slotIndex: 9 };
assert.deepEqual(
  playerPositionAtTime(receiverRef, undefined, [passTouch, shotTouch], 100, restPoint),
  restPoint,
  'Zanim podanie dotrze, odbiorca stoi w swoim punkcie spoczynku.',
);
assert.deepEqual(
  playerPositionAtTime(receiverRef, undefined, [passTouch, shotTouch], 500, restPoint),
  { x: 34, y: 80 },
  'W momencie dotarcia podania odbiorca jest dokładnie tam, gdzie wylądowała piłka.',
);
assert.deepEqual(
  playerPositionAtTime(receiverRef, undefined, [passTouch, shotTouch], 700, restPoint),
  { x: 34, y: 80 },
  'Po przyjęciu podania (a przed/podczas strzału) zawodnik trzyma pozycję przyjęcia.',
);
assert.deepEqual(
  playerPositionAtTime(receiverRef, undefined, [carryTouch], 700, restPoint),
  { x: 34, y: 85 },
  'W trakcie biegu z piłką zawodnik podąża razem z piłką (środek odcinka).',
);

assert.equal(describeBallTouch(passTouch), 'A6 → A9 (podanie)');
assert.equal(describeBallTouch(shotTouch), 'A9 oddaje strzał');
assert.equal(describeBallTouch(carryTouch), 'A9 prowadzi piłkę');

const validRecording: MatchActionRecording = {
  id: 'GOAL_1',
  outcome: 'GOAL',
  title: 'Testowa akcja',
  formationIdA: '4-4-2',
  formationIdB: '4-4-2',
  startPositions: [],
  players: [],
  ball: [passTouch, shotTouch],
  createdAt: new Date().toISOString(),
};
assert.deepEqual(validateRecording(validRecording), [], 'Poprawny rekord nie może mieć błędów.');
assert.equal(recordingDurationMs(validRecording), 800);

assert.ok(validateRecording({ ...validRecording, title: '' }).length > 0, 'Pusty tytuł musi być błędem.');
assert.ok(validateRecording({ ...validRecording, players: [], ball: [] }).length > 0, 'Brak jakiejkolwiek akcji (ani piłki, ani zawodnika) musi być błędem.');
assert.ok(
  validateRecording({ ...validRecording, ball: [{ ...passTouch, waypoints: [{ x: 34, y: 60, atMs: 0 }] }] }).length > 0,
  'Akcja piłki z jednym punktem musi być błędem.',
);
assert.ok(
  validateRecording({ ...validRecording, ball: [{ ...passTouch, to: undefined }] }).length > 0,
  'Podanie bez odbiorcy musi być błędem.',
);
assert.ok(
  validateRecording({
    ...validRecording,
    players: [{ side: 'A', slotIndex: 9, waypoints: [{ x: 34, y: 70, atMs: 0 }, { x: 200, y: 90, atMs: 800 }] }],
  }).length > 0,
  'Punkt poza boiskiem musi być błędem.',
);
assert.ok(
  validateRecording({
    ...validRecording,
    players: [{ side: 'A', slotIndex: 9, waypoints: [{ x: 34, y: 70, atMs: 800 }, { x: 34, y: 90, atMs: 0 }] }],
  }).length > 0,
  'Cofający się czas musi być błędem.',
);
assert.ok(
  validateRecording({
    ...validRecording,
    players: [
      { side: 'A', slotIndex: 9, waypoints: [{ x: 34, y: 70, atMs: 0 }, { x: 34, y: 90, atMs: 800 }] },
      { side: 'A', slotIndex: 9, waypoints: [{ x: 34, y: 70, atMs: 0 }, { x: 34, y: 90, atMs: 800 }] },
    ],
  }).length > 0,
  'Dwie ścieżki na ten sam slot muszą być błędem.',
);

const cornerStart: MatchActionStartPosition = { side: 'A', slotIndex: 3, x: 10, y: 15 };
assert.deepEqual(
  validateRecording({ ...validRecording, startPositions: [cornerStart] }),
  [],
  'Poprawna pozycja startowa nie może dawać błędów.',
);
assert.ok(
  validateRecording({ ...validRecording, startPositions: [{ ...cornerStart, slotIndex: 11 }] }).length > 0,
  'Pozycja startowa spoza slotów formacji (0-10) musi być błędem.',
);
assert.ok(
  validateRecording({ ...validRecording, startPositions: [{ ...cornerStart, x: 200 }] }).length > 0,
  'Pozycja startowa poza boiskiem musi być błędem.',
);
assert.ok(
  validateRecording({ ...validRecording, startPositions: [cornerStart, cornerStart] }).length > 0,
  'Dwie pozycje startowe na ten sam slot muszą być błędem.',
);

console.log('MatchActionEditorConversionTests: OK');
