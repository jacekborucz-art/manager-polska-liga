import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { PlayerPosition } from '../../../types';
import type { CupTeamSide } from '../../../services/match/engines/cupV2';
import { anchorForSlot, type MatchEngineV2Point } from '../../../services/match/engines/v2';
import { TacticRepository } from '../../../resources/tactics_db';
import {
  MATCH_ACTION_BALL_TOUCH_KINDS,
  MATCH_ACTION_BALL_TOUCH_LABELS,
  MATCH_ACTION_OUTCOME_LABELS,
  MATCH_ACTION_OUTCOME_TAGS,
  type MatchActionBallTouch,
  type MatchActionBallTouchKind,
  type MatchActionOutcomeTag,
  type MatchActionPlayerPath,
  type MatchActionPlayerRef,
  type MatchActionRecording,
  type MatchActionSide,
  type MatchActionStartPosition,
  type MatchActionWaypoint,
} from '../../../services/match/editor/MatchActionEditorTypes';
import {
  ballPositionAtTime,
  describeBallTouch,
  playerPositionAtTime,
  validateRecording,
} from '../../../services/match/editor/MatchActionEditorPlaybackService';
import { MatchActionEditorStorageService } from '../../../services/match/editor/MatchActionEditorStorageService';

const VIEW_WIDTH = 1920;
const VIEW_HEIGHT = 1080;
const PITCH = { x: 690, y: 158, width: 540, height: 720 } as const;
const MIN_WAYPOINT_DISTANCE_METRES = 1.4;
const BALL_REST_POINT: MatchEngineV2Point = { x: 34, y: 52.5 };
const SIDE_COLOR: Record<MatchActionSide, string> = { A: '#60a5fa', B: '#f43f5e' };
// A player marker landing within this distance of the drag's end point is
// treated as the pass/lofted-pass receiver.
const RECEIVER_SNAP_METRES = 4;
// PLAY replays slower than the drawn/real timing so the sequence is actually
// readable, not just a blur — independent of anything else in the app.
const PREVIEW_SLOWDOWN = 0.35;
// Off-ball runs start within this random window of playback beginning, so
// several drawn together look like a team moving at once, not a queue.
const OFF_BALL_JITTER_MS = 300;

const TOUCH_STYLE: Record<MatchActionBallTouchKind, { color: string; dash?: string; width: number }> = {
  PASS: { color: '#fbbf24', width: 3 },
  LOFTED_PASS: { color: '#fbbf24', dash: '10 6', width: 3 },
  CARRY: { color: '#fde68a', dash: '2 6', width: 2.5 },
  SHOT: { color: '#ef4444', width: 4 },
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const mapPoint = (point: MatchEngineV2Point): MatchEngineV2Point => ({
  x: PITCH.x + clamp(point.x, 0, 68) / 68 * PITCH.width,
  y: PITCH.y + PITCH.height - clamp(point.y, 0, 105) / 105 * PITCH.height,
});

const unmapPoint = (svgPoint: MatchEngineV2Point): MatchEngineV2Point => ({
  x: clamp((svgPoint.x - PITCH.x) / PITCH.width * 68, 0, 68),
  y: clamp(105 - (svgPoint.y - PITCH.y) / PITCH.height * 105, 0, 105),
});

type SlotKey = string;
const slotKey = (side: MatchActionSide, slotIndex: number): SlotKey => `${side}:${slotIndex}`;

type DrawingTarget =
  | { kind: 'PLAYER'; side: MatchActionSide; slotIndex: number }
  | { kind: 'TOUCH'; touchKind: MatchActionBallTouchKind; from: MatchActionPlayerRef }
  | { kind: 'REPOSITION'; side: MatchActionSide; slotIndex: number };
type DrawingState = {
  target: DrawingTarget;
  startedAtMs: number;
  points: MatchActionWaypoint[];
  /** Positions of every player when the drag started — used to snap a pass/lofted-pass onto a receiver without ever reading live state from the stale window-event closures below. */
  slotSnapshot?: Array<{ ref: MatchActionPlayerRef; position: MatchEngineV2Point }>;
  /** For REPOSITION only: the custom start override in place before this drag, so undo can restore it exactly (or drop back to the formation anchor if there wasn't one). */
  previousStart?: MatchEngineV2Point;
};

const polylinePoints = (waypoints: MatchActionWaypoint[]): string =>
  waypoints.map(point => { const mapped = mapPoint(point); return `${mapped.x},${mapped.y}`; }).join(' ');

/** A small triangle pointing from the path's last segment's direction, so a drawn line reads as an arrow. */
const Arrowhead = ({ waypoints, color }: { waypoints: MatchActionWaypoint[]; color: string }) => {
  if (waypoints.length < 2) return null;
  const end = mapPoint(waypoints[waypoints.length - 1]);
  const before = mapPoint(waypoints[waypoints.length - 2]);
  const angle = Math.atan2(end.y - before.y, end.x - before.x) * (180 / Math.PI);
  return (
    <polygon
      points="0,-7 16,0 0,7"
      fill={color}
      transform={`translate(${end.x}, ${end.y}) rotate(${angle})`}
    />
  );
};

export const MatchActionEditorView = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [formationIdA, setFormationIdA] = useState(TacticRepository.getDefault().id);
  const [formationIdB, setFormationIdB] = useState(TacticRepository.getDefault().id);
  const [outcome, setOutcome] = useState<MatchActionOutcomeTag>('GOAL');
  const [title, setTitle] = useState('');
  const [playerPaths, setPlayerPaths] = useState<Record<SlotKey, MatchActionPlayerPath>>({});
  const [touches, setTouches] = useState<MatchActionBallTouch[]>([]);
  const [customStartPositions, setCustomStartPositions] = useState<Record<SlotKey, MatchEngineV2Point>>({});
  const [pendingKind, setPendingKind] = useState<MatchActionBallTouchKind | null>(null);
  const [history, setHistory] = useState<Array<
    | { kind: 'PLAYER'; key: SlotKey }
    | { kind: 'TOUCH' }
    | { kind: 'REPOSITION'; key: SlotKey; previous: MatchEngineV2Point | undefined }
  >>([]);
  const [playing, setPlaying] = useState(false);
  const [playbackAtMs, setPlaybackAtMs] = useState(0);
  const [saveState, setSaveState] = useState<{ status: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>({ status: 'idle' });
  const [, bumpDrawTick] = useState(0);
  const drawingRef = useRef<DrawingState | null>(null);

  const tacticA = TacticRepository.getById(formationIdA);
  const tacticB = TacticRepository.getById(formationIdB);

  const slotEntries: Array<{ side: MatchActionSide; slotIndex: number; role: PlayerPosition }> = [
    ...tacticA.slots.map(slot => ({ side: 'A' as const, slotIndex: slot.index, role: slot.role })),
    ...tacticB.slots.map(slot => ({ side: 'B' as const, slotIndex: slot.index, role: slot.role })),
  ];

  const anchorFor = (side: MatchActionSide, slotIndex: number): MatchEngineV2Point => {
    const override = customStartPositions[slotKey(side, slotIndex)];
    if (override) return override;
    const tactic = side === 'A' ? tacticA : tacticB;
    const slot = tactic.slots[slotIndex] ?? tactic.slots[0];
    const engineSide: CupTeamSide = side === 'A' ? 'HOME' : 'AWAY';
    return anchorForSlot(engineSide, slot.x, slot.y);
  };

  /**
   * Where every player currently "is", used to start the next touch and to
   * find who a pass/lofted-pass lands on. Starts from the formation anchor,
   * then applies — in order — any drawn off-ball run (they're wherever it
   * ends) and any ball touch that moves or delivers to them (carrying ends
   * there; receiving a pass ends there). Only ever called from a fresh
   * render (mousedown handler), never from the window-level drag listeners,
   * so it always sees current state.
   */
  const computeCurrentPositions = (): Record<SlotKey, MatchEngineV2Point> => {
    const positions: Record<SlotKey, MatchEngineV2Point> = {};
    slotEntries.forEach(({ side, slotIndex }) => { positions[slotKey(side, slotIndex)] = anchorFor(side, slotIndex); });
    Object.values(playerPaths).forEach(path => {
      const end = path.waypoints.at(-1);
      if (end) positions[slotKey(path.side, path.slotIndex)] = { x: end.x, y: end.y };
    });
    touches.forEach(touch => {
      const end = touch.waypoints.at(-1);
      if (!end) return;
      if (touch.kind === 'CARRY') positions[slotKey(touch.from.side, touch.from.slotIndex)] = { x: end.x, y: end.y };
      if (touch.to) positions[slotKey(touch.to.side, touch.to.slotIndex)] = { x: end.x, y: end.y };
    });
    return positions;
  };

  const currentDurationMs = Math.max(
    0,
    ...Object.values(playerPaths).map(path => path.waypoints.at(-1)?.atMs ?? 0),
    ...touches.map(touch => touch.waypoints.at(-1)?.atMs ?? 0),
  );
  const scrubbing = playing || playbackAtMs > 0;

  const clientPointToPitch = (clientX: number, clientY: number): MatchEngineV2Point | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const transformed = point.matrixTransform(ctm.inverse());
    return unmapPoint({ x: transformed.x, y: transformed.y });
  };

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const drawing = drawingRef.current;
      if (!drawing) return;
      const pitchPoint = clientPointToPitch(event.clientX, event.clientY);
      if (!pitchPoint) return;
      const last = drawing.points[drawing.points.length - 1];
      if (Math.hypot(pitchPoint.x - last.x, pitchPoint.y - last.y) < MIN_WAYPOINT_DISTANCE_METRES) return;
      // drawing.points[0].atMs is this drag's baseline on the shared
      // timeline (0 for the very first thing ever drawn, later for
      // anything drawn afterwards) — every later point must add to that
      // baseline, not restart from 0, or the sequence jumps backwards in
      // time the moment a second stroke begins.
      const baselineMs = drawing.points[0].atMs;
      drawing.points.push({ x: pitchPoint.x, y: pitchPoint.y, atMs: baselineMs + (performance.now() - drawing.startedAtMs) });
      bumpDrawTick(tick => tick + 1);
    };
    const handleUp = (event: MouseEvent) => {
      const drawing = drawingRef.current;
      drawingRef.current = null;
      if (!drawing) return;
      if (drawing.points.length < 2) {
        // A short, quick drag (a common gesture for a pass between two
        // nearby players) can end before any mousemove ever crossed
        // MIN_WAYPOINT_DISTANCE_METRES, leaving only the starting point —
        // the whole action would otherwise be silently dropped. Use the
        // actual release position as the second point instead, as long as
        // it moved at all.
        const releasePoint = clientPointToPitch(event.clientX, event.clientY);
        const first = drawing.points[0];
        if (releasePoint && Math.hypot(releasePoint.x - first.x, releasePoint.y - first.y) > 0.3) {
          const baselineMs = first.atMs;
          const elapsedMs = Math.max(200, performance.now() - drawing.startedAtMs);
          drawing.points.push({ x: releasePoint.x, y: releasePoint.y, atMs: baselineMs + elapsedMs });
        }
      }
      if (drawing.points.length < 2) {
        bumpDrawTick(tick => tick + 1);
        return;
      }
      if (drawing.target.kind === 'PLAYER') {
        const key = slotKey(drawing.target.side, drawing.target.slotIndex);
        setPlayerPaths(previous => ({
          ...previous,
          [key]: { side: drawing.target.side, slotIndex: drawing.target.slotIndex, waypoints: drawing.points },
        }));
        setHistory(previous => [...previous.filter(entry => !(entry.kind === 'PLAYER' && entry.key === key)), { kind: 'PLAYER', key }]);
      } else if (drawing.target.kind === 'REPOSITION') {
        const key = slotKey(drawing.target.side, drawing.target.slotIndex);
        const last = drawing.points[drawing.points.length - 1];
        setCustomStartPositions(previous => ({ ...previous, [key]: { x: last.x, y: last.y } }));
        setHistory(previous => [...previous, { kind: 'REPOSITION', key, previous: drawing.previousStart }]);
      } else {
        const { touchKind, from } = drawing.target;
        let to: MatchActionPlayerRef | undefined;
        let waypoints = drawing.points;
        if ((touchKind === 'PASS' || touchKind === 'LOFTED_PASS') && drawing.slotSnapshot) {
          const last = drawing.points[drawing.points.length - 1];
          let closest: { ref: MatchActionPlayerRef; position: MatchEngineV2Point; distance: number } | null = null;
          drawing.slotSnapshot.forEach(({ ref, position }) => {
            if (ref.side === from.side && ref.slotIndex === from.slotIndex) return;
            const distance = Math.hypot(position.x - last.x, position.y - last.y);
            if (!closest || distance < closest.distance) closest = { ref, position, distance };
          });
          if (closest && closest.distance <= RECEIVER_SNAP_METRES) {
            to = closest.ref;
            waypoints = [...drawing.points.slice(0, -1), { ...last, x: closest.position.x, y: closest.position.y }];
          }
        }
        const touch: MatchActionBallTouch = { kind: touchKind, from, to, waypoints };
        setTouches(previous => [...previous, touch]);
        setHistory(previous => [...previous, { kind: 'TOUCH' }]);
        setPendingKind(null);
      }
      bumpDrawTick(tick => tick + 1);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let lastTimestamp: number | null = null;
    const tick = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const elapsed = (timestamp - lastTimestamp) * PREVIEW_SLOWDOWN;
      lastTimestamp = timestamp;
      setPlaybackAtMs(previous => {
        const next = previous + elapsed;
        if (next >= currentDurationMs) {
          setPlaying(false);
          return currentDurationMs;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const handlePlayerPointerDown = (side: MatchActionSide, slotIndex: number) => (event: ReactMouseEvent) => {
    if (event.button !== 0 && event.button !== 2) return;
    event.preventDefault();
    event.stopPropagation();
    const positions = computeCurrentPositions();
    const start = positions[slotKey(side, slotIndex)];
    if (event.button === 2) {
      // Right button = setting up a custom starting spot (e.g. how the
      // defence actually lines up for a corner), independent of whatever
      // ball action is currently pending on the left button — it never
      // touches playerPaths/touches, only the formation-anchor override
      // this player starts the whole recording from.
      drawingRef.current = {
        target: { kind: 'REPOSITION', side, slotIndex },
        startedAtMs: performance.now(),
        points: [{ x: start.x, y: start.y, atMs: 0 }],
        previousStart: customStartPositions[slotKey(side, slotIndex)],
      };
    } else if (pendingKind) {
      // A pass/carry/lofted-pass/shot must wait only for whichever player
      // it actually involves — chained after the previous touch AND, if
      // this specific player still had an off-ball run in progress, after
      // that run finishes too. It never waits on anyone ELSE's unrelated
      // off-ball movement.
      const ownPathEndMs = playerPaths[slotKey(side, slotIndex)]?.waypoints.at(-1)?.atMs ?? 0;
      const startMs = Math.max(touches.at(-1)?.waypoints.at(-1)?.atMs ?? 0, ownPathEndMs);
      const needsSnapshot = pendingKind === 'PASS' || pendingKind === 'LOFTED_PASS';
      drawingRef.current = {
        target: { kind: 'TOUCH', touchKind: pendingKind, from: { side, slotIndex } },
        startedAtMs: performance.now(),
        points: [{ x: start.x, y: start.y, atMs: startMs }],
        slotSnapshot: needsSnapshot ? slotEntries.map(entry => ({ ref: entry, position: positions[slotKey(entry.side, entry.slotIndex)] })) : undefined,
      };
    } else {
      // Off-ball runs (decoys, markers, positioning) happen in the
      // background, in parallel with everything else — not queued up one
      // after another. A small random stagger keeps several of them drawn
      // together from looking robotically synchronised.
      const startMs = Math.random() * OFF_BALL_JITTER_MS;
      drawingRef.current = {
        target: { kind: 'PLAYER', side, slotIndex },
        startedAtMs: performance.now(),
        points: [{ x: start.x, y: start.y, atMs: startMs }],
      };
    }
    bumpDrawTick(tick => tick + 1);
  };

  const handleKindSelect = (kind: MatchActionBallTouchKind) => {
    setPendingKind(previous => (previous === kind ? null : kind));
  };

  const handleUndo = () => {
    setHistory(previous => {
      if (previous.length === 0) return previous;
      const last = previous[previous.length - 1];
      if (last.kind === 'PLAYER') {
        setPlayerPaths(paths => {
          const next = { ...paths };
          delete next[last.key];
          return next;
        });
      } else if (last.kind === 'REPOSITION') {
        setCustomStartPositions(previousStarts => {
          const next = { ...previousStarts };
          if (last.previous) next[last.key] = last.previous;
          else delete next[last.key];
          return next;
        });
      } else {
        setTouches(previousTouches => previousTouches.slice(0, -1));
      }
      return previous.slice(0, -1);
    });
  };

  const handleReset = () => {
    if (history.length > 0 && !window.confirm('Wyczyścić całą narysowaną akcję i wrócić do ustawień domyślnych?')) return;
    drawingRef.current = null;
    setFormationIdA(TacticRepository.getDefault().id);
    setFormationIdB(TacticRepository.getDefault().id);
    setOutcome('GOAL');
    setTitle('');
    setPlayerPaths({});
    setTouches([]);
    setCustomStartPositions({});
    setPendingKind(null);
    setHistory([]);
    setPlaying(false);
    setPlaybackAtMs(0);
    setSaveState({ status: 'idle' });
    bumpDrawTick(tick => tick + 1);
  };

  const handlePlay = () => {
    if (currentDurationMs <= 0) return;
    if (playbackAtMs >= currentDurationMs) setPlaybackAtMs(0);
    setPlaying(true);
  };
  const handlePause = () => setPlaying(false);
  const handleStop = () => { setPlaying(false); setPlaybackAtMs(0); };

  const buildRecording = (): MatchActionRecording => ({
    id: `${outcome}_${Date.now()}`,
    outcome,
    title,
    formationIdA,
    formationIdB,
    startPositions: Object.entries(customStartPositions).map(([key, position]): MatchActionStartPosition => {
      const [side, slotIndexText] = key.split(':');
      return { side: side as MatchActionSide, slotIndex: Number(slotIndexText), x: position.x, y: position.y };
    }),
    players: Object.values(playerPaths),
    ball: touches,
    createdAt: new Date().toISOString(),
  });

  const handleSave = async () => {
    const recording = buildRecording();
    const errors = validateRecording(recording);
    if (errors.length > 0) {
      setSaveState({ status: 'error', message: errors.join(' ') });
      return;
    }
    setSaveState({ status: 'saving' });
    try {
      await MatchActionEditorStorageService.save(recording);
      setSaveState({ status: 'saved', message: `Zapisano: ${recording.id}.json` });
    } catch (error) {
      setSaveState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  };

  const savedActions = MatchActionEditorStorageService.listSaved();

  const drawingPreview = drawingRef.current;
  // Every marker rests here while idle/editing — the formation anchor,
  // carried forward through whatever off-ball run or ball touch a player has
  // been given so far. Without this the marker used to sit frozen on its
  // formation anchor even after a drawn carry or a received pass, so the
  // NEXT action you dragged from it visibly started from the wrong spot even
  // though the underlying data was already correct.
  const currentPositions = computeCurrentPositions();
  const ballDisplay = ballPositionAtTime(touches, playbackAtMs, BALL_REST_POINT);
  const ballMapped = mapPoint(ballDisplay);

  const pendingInstruction = pendingKind
    ? pendingKind === 'CARRY'
      ? 'Przytrzymaj i przeciągnij zawodnika, który prowadzi piłkę — narysuj jego trasę.'
      : pendingKind === 'SHOT'
        ? 'Przytrzymaj zawodnika-strzelca i przeciągnij w stronę bramki.'
        : 'Przytrzymaj zawodnika z piłką i przeciągnij w stronę odbiorcy — zakończ blisko niego, żeby edytor go rozpoznał.'
    : null;
  const startPositionCount = Object.keys(customStartPositions).length;

  return (
    <div className="min-h-screen bg-[#020712] text-slate-50 p-6" style={{ fontFamily: 'inherit' }}>
      <h1 className="text-xl font-black italic uppercase tracking-tighter mb-3">Edytor Akcji Meczowych</h1>
      <div className="flex gap-6">
        <div className="flex flex-col gap-3 w-72 shrink-0">
          <label className="text-xs uppercase font-bold text-slate-400">
            Formacja drużyny A
            <select
              className="w-full mt-1 bg-[#0b1526] border border-slate-700 rounded px-2 py-1 text-slate-50"
              value={formationIdA}
              onChange={event => setFormationIdA(event.target.value)}
            >
              {TacticRepository.getAll().map(tactic => <option key={tactic.id} value={tactic.id}>{tactic.name}</option>)}
            </select>
          </label>
          <label className="text-xs uppercase font-bold text-slate-400">
            Formacja drużyny B
            <select
              className="w-full mt-1 bg-[#0b1526] border border-slate-700 rounded px-2 py-1 text-slate-50"
              value={formationIdB}
              onChange={event => setFormationIdB(event.target.value)}
            >
              {TacticRepository.getAll().map(tactic => <option key={tactic.id} value={tactic.id}>{tactic.name}</option>)}
            </select>
          </label>
          <label className="text-xs uppercase font-bold text-slate-400">
            Tytuł akcji
            <input
              className="w-full mt-1 bg-[#0b1526] border border-slate-700 rounded px-2 py-1 text-slate-50"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="np. Dośrodkowanie z prawej i strzał głową"
            />
          </label>

          <div className="text-[11px] bg-[#0b1526] border border-[#a78bfa]/50 rounded p-2 text-slate-200">
            <strong className="text-[#a78bfa]">Pozycja startowa (poza akcją):</strong> prawy przycisk myszy,
            przytrzymaj i przeciągnij zawodnika — ustawia jego miejsce startowe niezależnie od formacji (np.
            faktyczne ustawienie obrony przy rożnym), zanim zacznie się rysowana akcja.
            {startPositionCount > 0 && <span className="text-slate-400"> Ustawiono: {startPositionCount}.</span>}
          </div>

          <div>
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Dodaj akcję piłki</div>
            <div className="grid grid-cols-2 gap-1">
              {MATCH_ACTION_BALL_TOUCH_KINDS.map(kind => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => handleKindSelect(kind)}
                  className={`text-[10px] font-black uppercase px-2 py-2 rounded border ${pendingKind === kind ? 'bg-[#fbbf24] text-black border-[#fbbf24]' : 'bg-[#0b1526] border-slate-700 text-slate-300'}`}
                >
                  {MATCH_ACTION_BALL_TOUCH_LABELS[kind]}
                </button>
              ))}
            </div>
            {pendingInstruction && (
              <div className="text-[11px] bg-[#0b1526] border border-[#fbbf24]/50 rounded p-2 mt-1 text-slate-200">
                {pendingInstruction} Kliknij ten sam przycisk ponownie, żeby anulować.
              </div>
            )}
          </div>

          <div>
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">
              Sekwencja piłki {currentDurationMs > 0 && <span className="text-slate-500 normal-case">— {(currentDurationMs / 1000).toFixed(1)}s łącznie</span>}
            </div>
            <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside">
              {touches.map((touch, index) => {
                const startS = (touch.waypoints[0]?.atMs ?? 0) / 1000;
                const endS = (touch.waypoints.at(-1)?.atMs ?? 0) / 1000;
                const missingReceiver = (touch.kind === 'PASS' || touch.kind === 'LOFTED_PASS') && !touch.to;
                return (
                  <li key={index}>
                    <span className="text-slate-500">{startS.toFixed(1)}–{endS.toFixed(1)}s</span> {describeBallTouch(touch)}
                    {missingReceiver && <span className="text-red-400"> — brak rozpoznanego odbiorcy, dociągnij bliżej!</span>}
                  </li>
                );
              })}
              {touches.length === 0 && <li className="text-slate-600 list-none">Brak — wybierz akcję powyżej.</li>}
            </ol>
          </div>

          <div>
            <div className="text-xs uppercase font-bold text-slate-400 mb-1">Wynik akcji</div>
            <div className="flex flex-wrap gap-1">
              {MATCH_ACTION_OUTCOME_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setOutcome(tag)}
                  className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${outcome === tag ? 'bg-[#35e6b2] text-black border-[#35e6b2]' : 'bg-[#0b1526] border-slate-700 text-slate-300'}`}
                >
                  {MATCH_ACTION_OUTCOME_LABELS[tag]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={handlePlay} className="flex-1 bg-[#35e6b2] text-black font-black uppercase text-xs rounded px-2 py-2">Play</button>
            <button type="button" onClick={handlePause} className="flex-1 bg-[#60a5fa] text-black font-black uppercase text-xs rounded px-2 py-2">Pauza</button>
            <button type="button" onClick={handleStop} className="flex-1 bg-slate-700 text-white font-black uppercase text-xs rounded px-2 py-2">Stop</button>
          </div>
          <button type="button" onClick={handleUndo} disabled={history.length === 0} className="bg-[#fbbf24] disabled:opacity-30 text-black font-black uppercase text-xs rounded px-2 py-2">Cofnij ostatnie rysowanie</button>
          <button type="button" onClick={handleReset} className="bg-slate-800 border border-slate-600 text-slate-200 font-black uppercase text-xs rounded px-2 py-2 hover:bg-slate-700">Resetuj widok do domyślnego</button>
          <button type="button" onClick={handleSave} disabled={saveState.status === 'saving'} className="bg-[#f43f5e] disabled:opacity-50 text-white font-black uppercase text-xs rounded px-2 py-2">Zapisz akcję</button>
          {saveState.status !== 'idle' && (
            <div className={`text-xs font-bold ${saveState.status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{saveState.message ?? saveState.status}</div>
          )}
          <div className="text-[10px] text-slate-500 leading-snug mt-2">
            <strong className="text-slate-400">Piłka:</strong> wybierz PODANIE / BIEG Z PIŁKĄ / PODANIE GÓRĄ / STRZAŁ
            powyżej, potem przytrzymaj i przeciągnij zawodnika z piłką — dokładnie tak samo jak rysowanie
            zwykłej trasy. Dla podania/podania górą zakończ blisko odbiorcy: edytor sam go rozpozna i przypnie
            piłkę do jego aktualnej pozycji (nawet jeśli wcześniej przesunąłeś go inną strzałką).{' '}
            <strong className="text-slate-400">Bez piłki:</strong> to samo przeciągnięcie, ale bez wybranego
            przycisku akcji piłki, rysuje samodzielny bieg zawodnika (np. wbiegnięcie w pole karne bez piłki).
            Zapisane akcje trafiają do <code>services/match/engines/v2/actions/&lt;WYNIK&gt;/</code> — lista
            poniżej odświeża się po przeładowaniu strony.
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Zapisane akcje: {savedActions.length}</div>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="flex-1 select-none"
          style={{ maxHeight: '92vh' }}
          onContextMenu={event => event.preventDefault()}
        >
          <rect x={PITCH.x - 20} y={PITCH.y - 20} width={PITCH.width + 40} height={PITCH.height + 40} fill="#0c3d24" rx="6" />
          <g stroke="#c9f7e2" strokeOpacity="0.55" strokeWidth="2" fill="none">
            <rect x={PITCH.x} y={PITCH.y} width={PITCH.width} height={PITCH.height} />
            <line x1={PITCH.x} y1={PITCH.y + PITCH.height / 2} x2={PITCH.x + PITCH.width} y2={PITCH.y + PITCH.height / 2} />
            <circle cx={PITCH.x + PITCH.width / 2} cy={PITCH.y + PITCH.height / 2} r="65" />
            <rect x={PITCH.x + 102} y={PITCH.y} width={PITCH.width - 204} height="116" />
            <rect x={PITCH.x + 102} y={PITCH.y + PITCH.height - 116} width={PITCH.width - 204} height="116" />
          </g>

          {slotEntries.map(({ side, slotIndex, role }) => {
            const key = slotKey(side, slotIndex);
            const path = playerPaths[key];
            const isBeingDrawn = drawingPreview?.target.kind === 'PLAYER' && drawingPreview.target.side === side && drawingPreview.target.slotIndex === slotIndex;
            const previewWaypoints = isBeingDrawn ? drawingPreview!.points : undefined;
            const isDragSource = drawingPreview?.target.kind === 'TOUCH' && drawingPreview.target.from.side === side && drawingPreview.target.from.slotIndex === slotIndex;
            const isRepositionSource = drawingPreview?.target.kind === 'REPOSITION' && drawingPreview.target.side === side && drawingPreview.target.slotIndex === slotIndex;
            const hasCustomStart = Boolean(customStartPositions[key]);
            // While carrying the ball the player's own marker follows the
            // same live drag as the ball; for a pass/lofted-pass/shot the
            // passer stands still and only the ball moves, so their marker
            // does not track that drag.
            const isCarryDragSource = isDragSource && drawingPreview?.target.kind === 'TOUCH' && drawingPreview.target.touchKind === 'CARRY';
            const livePoints = isBeingDrawn || isCarryDragSource || isRepositionSource ? drawingPreview!.points : undefined;
            const restingPosition = currentPositions[key] ?? anchorFor(side, slotIndex);
            const display = livePoints && livePoints.length > 0
              ? { x: livePoints[livePoints.length - 1].x, y: livePoints[livePoints.length - 1].y }
              : scrubbing
                ? playerPositionAtTime({ side, slotIndex }, path, touches, playbackAtMs, anchorFor(side, slotIndex))
                : restingPosition;
            const mapped = mapPoint(display);
            const color = SIDE_COLOR[side];
            return (
              <g key={key}>
                {path && !isBeingDrawn && (
                  <>
                    <polyline points={polylinePoints(path.waypoints)} fill="none" stroke={color} strokeOpacity="0.75" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
                    <Arrowhead waypoints={path.waypoints} color={color} />
                  </>
                )}
                {previewWaypoints && previewWaypoints.length > 1 && (
                  <>
                    <polyline points={polylinePoints(previewWaypoints)} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                    <Arrowhead waypoints={previewWaypoints} color={color} />
                  </>
                )}
                <circle
                  cx={mapped.x}
                  cy={mapped.y}
                  r="17"
                  fill="#05101b"
                  stroke={isDragSource || isRepositionSource ? '#a78bfa' : color}
                  strokeWidth={isDragSource || isRepositionSource ? 4 : 3}
                  strokeDasharray={!isDragSource && !isRepositionSource && hasCustomStart ? '3 3' : undefined}
                  onMouseDown={handlePlayerPointerDown(side, slotIndex)}
                  onContextMenu={event => event.preventDefault()}
                  style={{ cursor: pendingKind ? 'crosshair' : 'grab' }}
                />
                <text x={mapped.x} y={mapped.y + 4} textAnchor="middle" fontSize="10" fill={color} className="font-black uppercase pointer-events-none">
                  {role}{slotIndex}
                </text>
              </g>
            );
          })}

          {touches.map((touch, index) => {
            const style = TOUCH_STYLE[touch.kind];
            return (
              <g key={index}>
                <polyline points={polylinePoints(touch.waypoints)} fill="none" stroke={style.color} strokeWidth={style.width} strokeDasharray={style.dash} strokeLinecap="round" />
                <Arrowhead waypoints={touch.waypoints} color={style.color} />
              </g>
            );
          })}
          {drawingPreview?.target.kind === 'TOUCH' && drawingPreview.points.length > 1 && (
            <>
              <polyline
                points={polylinePoints(drawingPreview.points)}
                fill="none"
                stroke={TOUCH_STYLE[drawingPreview.target.touchKind].color}
                strokeWidth={TOUCH_STYLE[drawingPreview.target.touchKind].width}
                strokeDasharray={TOUCH_STYLE[drawingPreview.target.touchKind].dash}
                strokeLinecap="round"
              />
              <Arrowhead waypoints={drawingPreview.points} color={TOUCH_STYLE[drawingPreview.target.touchKind].color} />
            </>
          )}
          <circle cx={ballMapped.x} cy={ballMapped.y} r="9" fill="#fbbf24" stroke="#05101b" strokeWidth="2" className="pointer-events-none" />

          {currentDurationMs > 0 && (
            <text x={PITCH.x} y={PITCH.y - 28} fontSize="14" fill="#dbe7f6" className="font-black uppercase">
              {(playbackAtMs / 1000).toFixed(1)}s / {(currentDurationMs / 1000).toFixed(1)}s
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};
