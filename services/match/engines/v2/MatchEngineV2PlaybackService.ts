import { clamp } from '../cupV2';
import type {
  MatchEngineV2PlaybackSpeed,
  MatchEngineV2PlaybackState,
  MatchEngineV2RenderMode,
  MatchEngineV2TransmissionMode,
  MatchEngineV2VisualCue,
} from './MatchEngineV2Types';
import { MatchEngineV2HighlightScriptService } from './MatchEngineV2HighlightScriptService';

// Quiet play advances 60 match-seconds (one match minute) per this many real
// seconds; state.speed selects this directly (1 = normal, 2 = slower, 3 =
// much slower). A scripted scene freezes this rate entirely (the host stops
// calling advance while one plays), so the real length of a match now
// depends on how many scenes it shows rather than on this constant alone.
const MATCH_SECONDS_PER_MATCH_MINUTE = 60;

export const MatchEngineV2PlaybackService = {
  create: (options?: Partial<Pick<MatchEngineV2PlaybackState,
    'speed' | 'sceneSpeed' | 'renderMode' | 'transmissionMode' | 'goalReplays'
  >>): MatchEngineV2PlaybackState => ({
    exactSecond: 0,
    targetSecond: 0,
    paused: true,
    speed: options?.speed ?? 1,
    sceneSpeed: options?.sceneSpeed ?? 1,
    renderMode: options?.renderMode ?? 'INTERACTIVE',
    // Key moments are the safe default for the prototype: quiet match time is
    // advanced quickly, while only goals and genuinely dangerous chances take
    // control of the pitch presentation. A user may still opt into every
    // action or the experimental full-match stream.
    transmissionMode: options?.transmissionMode ?? 'KEY_MOMENTS',
    // Replays deliberately default to off. Otherwise the live finish and its
    // immediate replay can look like the same player taking two shots.
    goalReplays: options?.goalReplays ?? false,
  }),

  /**
   * Converts wall-clock time into an engine target. Fractional seconds stay in
   * the controller so frequent animation frames do not lose time to rounding.
   */
  advance: (
    state: MatchEngineV2PlaybackState,
    elapsedRealMs: number,
    matchEndSecond = 90 * 60,
  ): MatchEngineV2PlaybackState => {
    if (state.paused || elapsedRealMs <= 0) return { ...state };
    const exactSecond = clamp(
      state.exactSecond + elapsedRealMs / 1000 * (MATCH_SECONDS_PER_MATCH_MINUTE / state.speed),
      0,
      matchEndSecond,
    );
    return {
      ...state,
      exactSecond,
      targetSecond: Math.floor(exactSecond),
      paused: exactSecond >= matchEndSecond ? true : state.paused,
    };
  },

  setPaused: (state: MatchEngineV2PlaybackState, paused: boolean): MatchEngineV2PlaybackState => ({
    ...state,
    paused,
  }),

  setSpeed: (state: MatchEngineV2PlaybackState, speed: MatchEngineV2PlaybackSpeed): MatchEngineV2PlaybackState => ({
    ...state,
    speed,
  }),

  setSceneSpeed: (state: MatchEngineV2PlaybackState, sceneSpeed: MatchEngineV2PlaybackSpeed): MatchEngineV2PlaybackState => ({
    ...state,
    sceneSpeed,
  }),

  setRenderMode: (state: MatchEngineV2PlaybackState, renderMode: MatchEngineV2RenderMode): MatchEngineV2PlaybackState => ({
    ...state,
    renderMode,
  }),

  setTransmissionMode: (
    state: MatchEngineV2PlaybackState,
    transmissionMode: MatchEngineV2TransmissionMode,
  ): MatchEngineV2PlaybackState => ({
    ...state,
    transmissionMode,
  }),

  setGoalReplays: (state: MatchEngineV2PlaybackState, goalReplays: boolean): MatchEngineV2PlaybackState => ({
    ...state,
    goalReplays,
  }),

  /**
   * Both modes filter presentation only. The authoritative engine still
   * calculates the complete match, including score, fatigue, cards, injuries
   * and statistics. A pre-authored cue is returned untouched for isolated SVG
   * controller tests and for an optional replay of an already built highlight.
   */
  selectVisibleCues: (
    state: MatchEngineV2PlaybackState,
    cues: readonly MatchEngineV2VisualCue[],
  ): MatchEngineV2VisualCue[] => {
    if (state.transmissionMode === 'COMMENTARY_ONLY') return [];
    if (state.transmissionMode === 'FULL_MATCH') return [...cues];
    const authored = cues.filter(cue => cue.scriptedHighlight);
    if (authored.length > 0) {
      return state.transmissionMode === 'KEY_MOMENTS'
        ? authored.filter(cue => cue.kind === 'GOAL' || MatchEngineV2HighlightScriptService.isKeyMomentCue(cue))
        : authored;
    }
    return MatchEngineV2HighlightScriptService.selectTerminalCues(state.transmissionMode, cues);
  },
};
