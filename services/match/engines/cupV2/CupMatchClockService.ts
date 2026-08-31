import type { CupEngineConfig, CupMatchPhase, CupRuntimeState } from './CupMatchTypes';

export type CupDisplayClock = {
  minute: number;
  secondInMinute: number;
  stoppageMinute?: number;
  label: string;
};

const pad = (value: number): string => String(Math.max(0, Math.floor(value))).padStart(2, '0');

const regulationHalfSeconds = (config: CupEngineConfig): number =>
  Math.floor(config.normalTimeSeconds / 2);

export const CupMatchClockService = {
  /**
   * The engine clock never moves backwards and includes every stoppage-time
   * second. Football presentation time does not: the second half starts at
   * 45:00 and extra time at 90:00. Keeping the conversion in one service
   * prevents UI clocks, commentary and reports from disagreeing.
   */
  getBoundaries: (state: CupRuntimeState, config: CupEngineConfig) => {
    const firstHalfRegulationEnd = regulationHalfSeconds(config);
    const firstHalfEnd = firstHalfRegulationEnd + state.firstHalfAddedTimeSeconds;
    const secondHalfRegulationEnd = firstHalfEnd + (config.normalTimeSeconds - firstHalfRegulationEnd);
    const normalTimeEnd = secondHalfRegulationEnd + state.secondHalfAddedTimeSeconds;

    return {
      firstHalfRegulationEnd,
      firstHalfEnd,
      secondHalfRegulationEnd,
      normalTimeEnd,
    };
  },

  /** Converts the monotonic simulation clock to normal football match time. */
  toFootballSecond: (state: CupRuntimeState, config: CupEngineConfig): number => {
    const boundaries = CupMatchClockService.getBoundaries(state, config);
    if (state.phase === 'FIRST_HALF') return state.second;
    if (state.phase === 'SECOND_HALF') {
      return Math.max(0, state.second - state.firstHalfAddedTimeSeconds);
    }
    if (
      state.phase === 'EXTRA_TIME_1' ||
      state.phase === 'EXTRA_TIME_2' ||
      state.phase === 'PENALTY_SHOOTOUT' ||
      state.second > boundaries.normalTimeEnd
    ) {
      return Math.max(0, state.second - state.addedTimeSeconds);
    }

    // A match finished in regulation should retain its visible 90+X clock.
    return Math.max(0, state.second - state.firstHalfAddedTimeSeconds);
  },

  /** Minute stored on events and consumed by commentary/statistics views. */
  eventMinute: (state: CupRuntimeState, config: CupEngineConfig): number =>
    Math.floor(CupMatchClockService.toFootballSecond(state, config) / 60) + 1,

  /** Presentation-ready clock for the future SVG match view. */
  displayClock: (state: CupRuntimeState, config: CupEngineConfig): CupDisplayClock => {
    const footballSecond = CupMatchClockService.toFootballSecond(state, config);
    const minute = Math.floor(footballSecond / 60);
    const secondInMinute = footballSecond % 60;
    const phase: CupMatchPhase = state.phase;
    const boundaries = CupMatchClockService.getBoundaries(state, config);
    const finishedAfterExtraTime = phase === 'FINISHED' && state.second > boundaries.normalTimeEnd;
    const baseMinute = phase === 'FIRST_HALF' ? 45 : phase === 'SECOND_HALF' || (phase === 'FINISHED' && !finishedAfterExtraTime) ? 90 : 120;
    const isStoppage =
      (phase === 'FIRST_HALF' && footballSecond >= 45 * 60) ||
      ((phase === 'SECOND_HALF' || (phase === 'FINISHED' && !finishedAfterExtraTime)) && footballSecond >= 90 * 60);
    const stoppageMinute = isStoppage ? Math.max(1, Math.ceil((footballSecond - baseMinute * 60 + 1) / 60)) : undefined;
    const label = stoppageMinute
      ? `${baseMinute}+${stoppageMinute}`
      : `${pad(minute)}:${pad(secondInMinute)}`;

    return { minute, secondInMinute, stoppageMinute, label };
  },
};
