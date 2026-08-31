import { MatchEventType } from '../../../../types';
import type { CupEngineConfig, CupRuntimeState } from './CupMatchTypes';

type AddedTimeWindow = {
  fromSecond?: number;
  toSecond?: number;
};

export const CupExtraTimeService = {
  /**
   * Reguły pucharowe powinny być osobną warstwą nad symulacją gry. Dzięki temu
   * ta sama pętla ticków może obsługiwać pierwszą połowę, drugą połowę i
   * dogrywkę, a decyzja o karnych nie miesza się z generowaniem akcji.
   */
  shouldPlayExtraTime: (state: CupRuntimeState, config: CupEngineConfig): boolean =>
    config.enableExtraTime && state.homeScore === state.awayScore,

  shouldPlayPenaltyShootout: (state: CupRuntimeState, config: CupEngineConfig): boolean =>
    config.enablePenaltyShootout && state.homeScore === state.awayScore,

  getAddedTimeSeconds: (state: CupRuntimeState, window: AddedTimeWindow = {}): number => {
    const fromSecond = window.fromSecond ?? 0;
    const toSecond = window.toSecond ?? state.second;
    const periodEvents = state.events.filter(event => event.second >= fromSecond && event.second < toSecond);
    const count = (type: MatchEventType): number =>
      periodEvents.filter(event => event.type === type).length;
    const goals = count(MatchEventType.GOAL) + count(MatchEventType.ONE_ON_ONE_GOAL) + count(MatchEventType.PENALTY_SCORED);
    const injuries = count(MatchEventType.INJURY_LIGHT) + count(MatchEventType.INJURY_SEVERE);

    // Count only incidents from the requested half. Reading cumulative match
    // statistics here would charge first-half interruptions again after 90'.
    const eventsCost =
      goals * 35 +
      count(MatchEventType.YELLOW_CARD) * 18 +
      count(MatchEventType.RED_CARD) * 45 +
      injuries * 55 +
      count(MatchEventType.SUBSTITUTION) * 25;

    return Math.max(60, Math.min(420, eventsCost));
  },
};
