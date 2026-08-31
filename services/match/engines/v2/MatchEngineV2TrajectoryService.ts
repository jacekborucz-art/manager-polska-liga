import { clamp, stableHash } from '../cupV2';
import type {
  MatchEngineV2Point,
  MatchEngineV2TrajectorySample,
  MatchEngineV2VisualCue,
} from './MatchEngineV2Types';

const PITCH_LENGTH = 105;
const PITCH_WIDTH = 68;

const smoothStep = (value: number): number =>
  value * value * (3 - 2 * value);

const arcHeight = (cue: MatchEngineV2VisualCue): number => {
  if (cue.kind === 'SHOT' || cue.kind === 'GOAL' || cue.kind === 'SAVE') return 1.8;
  if (cue.kind === 'RESTART' || cue.kind === 'CROSS') return 1.25;
  if (cue.kind === 'PASS') return 0.45;
  return 0.08;
};

const controlPoint = (cue: MatchEngineV2VisualCue): MatchEngineV2Point => {
  const dx = cue.end.x - cue.start.x;
  const dy = cue.end.y - cue.start.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const curveDirection = stableHash(cue.id) % 2 === 0 ? 1 : -1;
  const curveStrength = cue.kind === 'PASS' || cue.kind === 'CROSS' || cue.kind === 'RESTART'
    ? Math.min(5.5, distance * 0.12)
    : Math.min(2.2, distance * 0.05);

  return {
    x: clamp((cue.start.x + cue.end.x) / 2 + (-dy / distance) * curveStrength * curveDirection, 0, PITCH_WIDTH),
    y: clamp((cue.start.y + cue.end.y) / 2 + (dx / distance) * curveStrength * curveDirection, 0, PITCH_LENGTH),
  };
};

const quadratic = (start: number, control: number, end: number, progress: number): number => {
  const inverse = 1 - progress;
  return inverse * inverse * start + 2 * inverse * progress * control + progress * progress * end;
};

export const MatchEngineV2TrajectoryService = {
  /**
   * Samples one deterministic ball path. SVG animation time changes only the
   * interpolation progress; it never requests RNG and cannot alter the match.
   */
  sampleCue: (cue: MatchEngineV2VisualCue, elapsedMs: number): MatchEngineV2TrajectorySample => {
    const rawProgress = clamp(elapsedMs / Math.max(1, cue.durationMs), 0, 1);
    const progress = smoothStep(rawProgress);
    const control = controlPoint(cue);
    return {
      x: clamp(quadratic(cue.start.x, control.x, cue.end.x, progress), 0, PITCH_WIDTH),
      y: clamp(quadratic(cue.start.y, control.y, cue.end.y, progress), 0, PITCH_LENGTH),
      z: arcHeight(cue) * 4 * progress * (1 - progress),
      progress: rawProgress,
      finished: rawProgress >= 1,
    };
  },

  /** Formation movement uses a restrained linear interpolation without RNG. */
  samplePlayerMovement: (
    start: MatchEngineV2Point,
    end: MatchEngineV2Point,
    elapsedMs: number,
    durationMs: number,
  ): MatchEngineV2Point => {
    const progress = smoothStep(clamp(elapsedMs / Math.max(1, durationMs), 0, 1));
    return {
      x: clamp(start.x + (end.x - start.x) * progress, 0, PITCH_WIDTH),
      y: clamp(start.y + (end.y - start.y) * progress, 0, PITCH_LENGTH),
    };
  },
};
