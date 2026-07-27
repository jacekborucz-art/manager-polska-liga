import type { CupRuntimeState, CupTeamRuntimeProfile } from './CupMatchTypes';
import { clamp } from './CupMath';

export const CupMomentumService = {
  /**
   * Momentum jest efektem gry, a nie generatorem goli. Zmienia jakość decyzji,
   * odwagę i presję, ale bramka nadal wymaga akcji, sytuacji i strzału.
   */
  updateMomentum: (
    state: CupRuntimeState,
    homeProfile: CupTeamRuntimeProfile,
    awayProfile: CupTeamRuntimeProfile,
    eventDelta: number
  ): number => {
    const homeScorePressure = state.homeScore < state.awayScore ? 4 : state.homeScore > state.awayScore ? -2 : 0;
    const awayScorePressure = state.awayScore < state.homeScore ? 4 : state.awayScore > state.homeScore ? -2 : 0;
    const midfieldTilt = (homeProfile.midfieldControl - awayProfile.midfieldControl) * 0.018;
    const leadershipDamping = ((homeProfile.leadership + awayProfile.leadership) / 2 - 50) * 0.004;
    const pressureTilt = homeScorePressure - awayScorePressure;
    const naturalDecay = state.momentum * (0.018 + Math.max(0, leadershipDamping));

    return clamp(state.momentum + midfieldTilt + pressureTilt * 0.03 + eventDelta - naturalDecay, -100, 100);
  },

  pressureForSide: (state: CupRuntimeState, sideScore: number, opponentScore: number, profile: CupTeamRuntimeProfile): number => {
    const losingPressure = sideScore < opponentScore ? clamp((opponentScore - sideScore) * 9, 0, 30) : 0;
    const latePressure = state.second > 75 * 60 && sideScore <= opponentScore ? 10 : 0;
    const mentalityShield = (profile.mentality - 50) * 0.18 + (profile.leadership - 50) * 0.12;
    return clamp(35 + losingPressure + latePressure - mentalityShield, 0, 100);
  },
};

