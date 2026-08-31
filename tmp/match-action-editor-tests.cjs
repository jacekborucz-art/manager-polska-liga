var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// tests/MatchActionEditorConversionTests.ts
var import_strict = __toESM(require("node:assert/strict"), 1);

// services/match/editor/MatchActionEditorTypes.ts
var MATCH_ACTION_BALL_TOUCH_LABELS = {
  PASS: "PODANIE",
  CARRY: "BIEG Z PI\u0141K\u0104",
  LOFTED_PASS: "PODANIE G\xD3R\u0104",
  SHOT: "STRZA\u0141"
};

// services/match/editor/MatchActionEditorPlaybackService.ts
var PITCH_WIDTH = 68;
var PITCH_LENGTH = 105;
var interpolatePathAtTime = (waypoints2, atMs) => {
  if (waypoints2.length === 0) return { x: 0, y: 0 };
  if (waypoints2.length === 1 || atMs <= waypoints2[0].atMs) return { x: waypoints2[0].x, y: waypoints2[0].y };
  const last = waypoints2[waypoints2.length - 1];
  if (atMs >= last.atMs) return { x: last.x, y: last.y };
  for (let index = 1; index < waypoints2.length; index += 1) {
    const previous = waypoints2[index - 1];
    const current = waypoints2[index];
    if (atMs > current.atMs) continue;
    const span = current.atMs - previous.atMs;
    const progress = span > 0 ? (atMs - previous.atMs) / span : 1;
    return {
      x: previous.x + (current.x - previous.x) * progress,
      y: previous.y + (current.y - previous.y) * progress
    };
  }
  return { x: last.x, y: last.y };
};
var ballPositionAtTime = (touches, atMs, restPoint2) => {
  if (touches.length === 0) return restPoint2;
  const activeTouch = touches.find((touch) => atMs <= (touch.waypoints.at(-1)?.atMs ?? 0)) ?? touches[touches.length - 1];
  return interpolatePathAtTime(activeTouch.waypoints, atMs);
};
var playerPositionAtTime = (ref, playerPath, touches, atMs, restPoint2) => {
  const segments = [];
  if (playerPath) segments.push(playerPath.waypoints);
  touches.forEach((touch) => {
    if (touch.kind === "CARRY" && touch.from.side === ref.side && touch.from.slotIndex === ref.slotIndex) {
      segments.push(touch.waypoints);
    } else if (touch.to && touch.to.side === ref.side && touch.to.slotIndex === ref.slotIndex) {
      const end = touch.waypoints.at(-1);
      if (end) segments.push([end]);
    }
  });
  if (segments.length === 0) return restPoint2;
  segments.sort((left, right) => (left[0]?.atMs ?? 0) - (right[0]?.atMs ?? 0));
  const active = segments.find((segment) => atMs <= (segment.at(-1)?.atMs ?? 0)) ?? segments[segments.length - 1];
  if ((active[0]?.atMs ?? 0) > atMs && active === segments[0]) return restPoint2;
  return interpolatePathAtTime(active, atMs);
};
var describeBallTouch = (touch) => {
  const from = `${touch.from.side}${touch.from.slotIndex}`;
  const to = touch.to ? `${touch.to.side}${touch.to.slotIndex}` : null;
  if (touch.kind === "CARRY") return `${from} prowadzi pi\u0142k\u0119`;
  if (touch.kind === "SHOT") return `${from} oddaje strza\u0142`;
  return `${from} \u2192 ${to ?? "?"} (${MATCH_ACTION_BALL_TOUCH_LABELS[touch.kind].toLowerCase()})`;
};
var recordingDurationMs = (recording) => {
  const playerMax = recording.players.reduce(
    (max, player) => Math.max(max, player.waypoints.at(-1)?.atMs ?? 0),
    0
  );
  const ballMax = recording.ball.reduce((max, touch) => Math.max(max, touch.waypoints.at(-1)?.atMs ?? 0), 0);
  return Math.max(playerMax, ballMax);
};
var validatePath = (label, waypoints2, errors) => {
  if (waypoints2.length < 2) {
    errors.push(`${label}: \u015Bcie\u017Cka musi mie\u0107 co najmniej 2 punkty, ma ${waypoints2.length}.`);
    return;
  }
  waypoints2.forEach((point, index) => {
    if (point.x < 0 || point.x > PITCH_WIDTH || point.y < 0 || point.y > PITCH_LENGTH) {
      errors.push(`${label}: punkt ${index} (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) wykracza poza boisko.`);
    }
    if (index > 0 && point.atMs < waypoints2[index - 1].atMs) {
      errors.push(`${label}: czas punktu ${index} cofa si\u0119 wzgl\u0119dem poprzedniego.`);
    }
  });
};
var validateRecording = (recording) => {
  const errors = [];
  if (!recording.title.trim()) errors.push("Akcja musi mie\u0107 tytu\u0142.");
  if (recording.players.length === 0 && recording.ball.length === 0) {
    errors.push("Akcja musi mie\u0107 przynajmniej jedno podanie/bieg/strza\u0142 albo \u015Bcie\u017Ck\u0119 zawodnika.");
  }
  const seenStartSlots = /* @__PURE__ */ new Set();
  recording.startPositions.forEach((start, index) => {
    if (start.slotIndex < 0 || start.slotIndex > 10) {
      errors.push(`Pozycja startowa ${index}: nieprawid\u0142owy slot formacji ${start.slotIndex}.`);
    }
    const key = `${start.side}:${start.slotIndex}`;
    if (seenStartSlots.has(key)) errors.push(`Pozycja startowa ${index}: slot ${key} ma ju\u017C ustawion\u0105 pozycj\u0119 startow\u0105.`);
    seenStartSlots.add(key);
    if (start.x < 0 || start.x > PITCH_WIDTH || start.y < 0 || start.y > PITCH_LENGTH) {
      errors.push(`Pozycja startowa ${key}: punkt (${start.x.toFixed(1)}, ${start.y.toFixed(1)}) wykracza poza boisko.`);
    }
  });
  const seenSlots = /* @__PURE__ */ new Set();
  recording.players.forEach((player, index) => {
    if (player.slotIndex < 0 || player.slotIndex > 10) {
      errors.push(`Zawodnik ${index}: nieprawid\u0142owy slot formacji ${player.slotIndex}.`);
    }
    const slotKey = `${player.side}:${player.slotIndex}`;
    if (seenSlots.has(slotKey)) errors.push(`Zawodnik ${index}: slot ${slotKey} ma ju\u017C narysowan\u0105 \u015Bcie\u017Ck\u0119.`);
    seenSlots.add(slotKey);
    validatePath(`Zawodnik ${player.side}${player.slotIndex}`, player.waypoints, errors);
  });
  let previousTouchEndMs = -Infinity;
  recording.ball.forEach((touch, index) => {
    const label = `Pi\u0142ka, akcja ${index + 1} (${touch.kind})`;
    validatePath(label, touch.waypoints, errors);
    if ((touch.kind === "PASS" || touch.kind === "LOFTED_PASS") && !touch.to) {
      errors.push(`${label}: podanie musi mie\u0107 odbiorc\u0119.`);
    }
    const startMs = touch.waypoints[0]?.atMs ?? 0;
    if (startMs < previousTouchEndMs) errors.push(`${label}: zaczyna si\u0119 przed ko\u0144cem poprzedniej akcji pi\u0142ki.`);
    previousTouchEndMs = touch.waypoints.at(-1)?.atMs ?? previousTouchEndMs;
  });
  return errors;
};

// tests/MatchActionEditorConversionTests.ts
var waypoints = [
  { x: 10, y: 20, atMs: 0 },
  { x: 20, y: 40, atMs: 1e3 },
  { x: 30, y: 40, atMs: 2e3 }
];
import_strict.default.deepEqual(interpolatePathAtTime(waypoints, -100), { x: 10, y: 20 }, "Przed startem trzyma pierwszy punkt.");
import_strict.default.deepEqual(interpolatePathAtTime(waypoints, 0), { x: 10, y: 20 });
import_strict.default.deepEqual(interpolatePathAtTime(waypoints, 500), { x: 15, y: 30 }, "\u015Arodek pierwszego odcinka.");
import_strict.default.deepEqual(interpolatePathAtTime(waypoints, 1e3), { x: 20, y: 40 });
import_strict.default.deepEqual(interpolatePathAtTime(waypoints, 1500), { x: 25, y: 40 }, "\u015Arodek drugiego odcinka.");
import_strict.default.deepEqual(interpolatePathAtTime(waypoints, 2e3), { x: 30, y: 40 });
import_strict.default.deepEqual(interpolatePathAtTime(waypoints, 9e3), { x: 30, y: 40 }, "Po ko\u0144cu trzyma ostatni punkt.");
import_strict.default.deepEqual(interpolatePathAtTime([], 100), { x: 0, y: 0 });
import_strict.default.deepEqual(interpolatePathAtTime([{ x: 5, y: 6, atMs: 0 }], 500), { x: 5, y: 6 });
var restPoint = { x: 34, y: 52.5 };
var passTouch = {
  kind: "PASS",
  from: { side: "A", slotIndex: 6 },
  to: { side: "A", slotIndex: 9 },
  waypoints: [{ x: 34, y: 60, atMs: 0 }, { x: 34, y: 80, atMs: 500 }]
};
var shotTouch = {
  kind: "SHOT",
  from: { side: "A", slotIndex: 9 },
  waypoints: [{ x: 34, y: 80, atMs: 500 }, { x: 34, y: 104, atMs: 800 }]
};
import_strict.default.deepEqual(ballPositionAtTime([], 100, restPoint), restPoint, "Bez \u017Cadnej akcji pi\u0142ka stoi w punkcie spoczynku.");
import_strict.default.deepEqual(ballPositionAtTime([passTouch, shotTouch], 250, restPoint), { x: 34, y: 70 }, "\u015Arodek pierwszej akcji (podania).");
import_strict.default.deepEqual(ballPositionAtTime([passTouch, shotTouch], 650, restPoint), { x: 34, y: 92 }, "\u015Arodek drugiej akcji (strza\u0142u).");
import_strict.default.deepEqual(ballPositionAtTime([passTouch, shotTouch], 9e3, restPoint), { x: 34, y: 104 }, "Po ko\u0144cu trzyma ostatni punkt ostatniej akcji.");
var carryTouch = {
  kind: "CARRY",
  from: { side: "A", slotIndex: 9 },
  waypoints: [{ x: 34, y: 80, atMs: 500 }, { x: 34, y: 90, atMs: 900 }]
};
var receiverRef = { side: "A", slotIndex: 9 };
import_strict.default.deepEqual(
  playerPositionAtTime(receiverRef, void 0, [passTouch, shotTouch], 100, restPoint),
  restPoint,
  "Zanim podanie dotrze, odbiorca stoi w swoim punkcie spoczynku."
);
import_strict.default.deepEqual(
  playerPositionAtTime(receiverRef, void 0, [passTouch, shotTouch], 500, restPoint),
  { x: 34, y: 80 },
  "W momencie dotarcia podania odbiorca jest dok\u0142adnie tam, gdzie wyl\u0105dowa\u0142a pi\u0142ka."
);
import_strict.default.deepEqual(
  playerPositionAtTime(receiverRef, void 0, [passTouch, shotTouch], 700, restPoint),
  { x: 34, y: 80 },
  "Po przyj\u0119ciu podania (a przed/podczas strza\u0142u) zawodnik trzyma pozycj\u0119 przyj\u0119cia."
);
import_strict.default.deepEqual(
  playerPositionAtTime(receiverRef, void 0, [carryTouch], 700, restPoint),
  { x: 34, y: 85 },
  "W trakcie biegu z pi\u0142k\u0105 zawodnik pod\u0105\u017Ca razem z pi\u0142k\u0105 (\u015Brodek odcinka)."
);
import_strict.default.equal(describeBallTouch(passTouch), "A6 \u2192 A9 (podanie)");
import_strict.default.equal(describeBallTouch(shotTouch), "A9 oddaje strza\u0142");
import_strict.default.equal(describeBallTouch(carryTouch), "A9 prowadzi pi\u0142k\u0119");
var validRecording = {
  id: "GOAL_1",
  outcome: "GOAL",
  title: "Testowa akcja",
  formationIdA: "4-4-2",
  formationIdB: "4-4-2",
  startPositions: [],
  players: [],
  ball: [passTouch, shotTouch],
  createdAt: (/* @__PURE__ */ new Date()).toISOString()
};
import_strict.default.deepEqual(validateRecording(validRecording), [], "Poprawny rekord nie mo\u017Ce mie\u0107 b\u0142\u0119d\xF3w.");
import_strict.default.equal(recordingDurationMs(validRecording), 800);
import_strict.default.ok(validateRecording({ ...validRecording, title: "" }).length > 0, "Pusty tytu\u0142 musi by\u0107 b\u0142\u0119dem.");
import_strict.default.ok(validateRecording({ ...validRecording, players: [], ball: [] }).length > 0, "Brak jakiejkolwiek akcji (ani pi\u0142ki, ani zawodnika) musi by\u0107 b\u0142\u0119dem.");
import_strict.default.ok(
  validateRecording({ ...validRecording, ball: [{ ...passTouch, waypoints: [{ x: 34, y: 60, atMs: 0 }] }] }).length > 0,
  "Akcja pi\u0142ki z jednym punktem musi by\u0107 b\u0142\u0119dem."
);
import_strict.default.ok(
  validateRecording({ ...validRecording, ball: [{ ...passTouch, to: void 0 }] }).length > 0,
  "Podanie bez odbiorcy musi by\u0107 b\u0142\u0119dem."
);
import_strict.default.ok(
  validateRecording({
    ...validRecording,
    players: [{ side: "A", slotIndex: 9, waypoints: [{ x: 34, y: 70, atMs: 0 }, { x: 200, y: 90, atMs: 800 }] }]
  }).length > 0,
  "Punkt poza boiskiem musi by\u0107 b\u0142\u0119dem."
);
import_strict.default.ok(
  validateRecording({
    ...validRecording,
    players: [{ side: "A", slotIndex: 9, waypoints: [{ x: 34, y: 70, atMs: 800 }, { x: 34, y: 90, atMs: 0 }] }]
  }).length > 0,
  "Cofaj\u0105cy si\u0119 czas musi by\u0107 b\u0142\u0119dem."
);
import_strict.default.ok(
  validateRecording({
    ...validRecording,
    players: [
      { side: "A", slotIndex: 9, waypoints: [{ x: 34, y: 70, atMs: 0 }, { x: 34, y: 90, atMs: 800 }] },
      { side: "A", slotIndex: 9, waypoints: [{ x: 34, y: 70, atMs: 0 }, { x: 34, y: 90, atMs: 800 }] }
    ]
  }).length > 0,
  "Dwie \u015Bcie\u017Cki na ten sam slot musz\u0105 by\u0107 b\u0142\u0119dem."
);
var cornerStart = { side: "A", slotIndex: 3, x: 10, y: 15 };
import_strict.default.deepEqual(
  validateRecording({ ...validRecording, startPositions: [cornerStart] }),
  [],
  "Poprawna pozycja startowa nie mo\u017Ce dawa\u0107 b\u0142\u0119d\xF3w."
);
import_strict.default.ok(
  validateRecording({ ...validRecording, startPositions: [{ ...cornerStart, slotIndex: 11 }] }).length > 0,
  "Pozycja startowa spoza slot\xF3w formacji (0-10) musi by\u0107 b\u0142\u0119dem."
);
import_strict.default.ok(
  validateRecording({ ...validRecording, startPositions: [{ ...cornerStart, x: 200 }] }).length > 0,
  "Pozycja startowa poza boiskiem musi by\u0107 b\u0142\u0119dem."
);
import_strict.default.ok(
  validateRecording({ ...validRecording, startPositions: [cornerStart, cornerStart] }).length > 0,
  "Dwie pozycje startowe na ten sam slot musz\u0105 by\u0107 b\u0142\u0119dem."
);
console.log("MatchActionEditorConversionTests: OK");
