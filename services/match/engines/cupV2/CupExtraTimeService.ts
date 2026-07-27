import type { CupEngineConfig, CupRuntimeState } from './CupMatchTypes';

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

  getAddedTimeSeconds: (state: CupRuntimeState): number => {
    const eventsCost =
      (state.stats.HOME.goals + state.stats.AWAY.goals) * 35 +
      (state.stats.HOME.yellowCards + state.stats.AWAY.yellowCards) * 18 +
      (state.stats.HOME.redCards + state.stats.AWAY.redCards) * 45 +
      (state.stats.HOME.injuries + state.stats.AWAY.injuries) * 55 +
      (state.substitutionsUsed.HOME + state.substitutionsUsed.AWAY) * 25;

    return Math.max(60, Math.min(420, eventsCost));
  },
};

