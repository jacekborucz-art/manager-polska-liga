import { MatchEventType } from '../../types';
import { CupShadowSimulationService, type CupLiveMatchHandle, type CupShadowSimulationReport } from '../../services/match/adapters/cupV2';

const importantEvents = new Set<MatchEventType>([
  MatchEventType.PENALTY_MISSED,
  MatchEventType.RED_CARD,
  MatchEventType.INJURY_SEVERE,
]);

export type CupV2PlaybackStep = {
  report: CupShadowSimulationReport;
  nextSecond: number;
  shouldPause: boolean;
  pauseReason?: 'HALF_TIME' | 'IMPORTANT_EVENT' | 'FINISHED';
};

export const CupV2LivePlaybackController = {
  finalSecond: (report: CupShadowSimulationReport): number =>
    Math.max(90 * 60, report.result.finalState.second),

  /**
   * Dolicza mecz na żywo o jeden krok (30s gry) i zwraca świeży raport.
   * Nie odsłania gotowych zdarzeń z góry — `handle` faktycznie symuluje
   * tylko do tej pory, dokąd zegar UI już doszedł.
   */
  step: (
    handle: CupLiveMatchHandle,
    currentSecond: number,
  ): CupV2PlaybackStep => {
    const increment = 30;
    const targetSecond = currentSecond + increment;
    const report = CupShadowSimulationService.tickLiveMatch(handle, targetSecond);
    const reachedSecond = report.result.finalState.second;
    const isFinished = report.result.finalState.phase === 'FINISHED';

    const crossedImportantEvent = report.result.events.find(event =>
      event.second > currentSecond &&
      event.second <= reachedSecond &&
      importantEvents.has(event.type) &&
      event.detail?.isShootout !== true
    );

    if (crossedImportantEvent) {
      return {
        report,
        nextSecond: crossedImportantEvent.second,
        shouldPause: true,
        pauseReason: 'IMPORTANT_EVENT',
      };
    }

    if (currentSecond < 45 * 60 && reachedSecond >= 45 * 60 && !isFinished) {
      return { report, nextSecond: 45 * 60, shouldPause: true, pauseReason: 'HALF_TIME' };
    }

    if (isFinished) {
      return { report, nextSecond: reachedSecond, shouldPause: true, pauseReason: 'FINISHED' };
    }

    return { report, nextSecond: reachedSecond, shouldPause: false };
  },
};
