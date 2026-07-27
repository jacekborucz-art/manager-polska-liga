import type { TacticalInstructions } from '../../../../types';
import type { CupAiDecision, CupRuntimeState, CupTeamRuntimeProfile } from './CupMatchTypes';

export const CupAiDecisionService = {
  /**
   * AI korzysta z tych samych instrukcji co gracz. Ten moduł nie dostaje
   * ukrytych bonusów; może tylko zmienić tempo, nastawienie, pressing, kontrę
   * i krycie na podstawie stanu meczu oraz profilu własnej drużyny.
   */
  evaluate: ({
    state,
    current,
    own,
    opponent,
  }: {
    state: CupRuntimeState;
    current: TacticalInstructions;
    own: CupTeamRuntimeProfile;
    opponent: CupTeamRuntimeProfile;
  }): CupAiDecision | null => {
    const ownScore = own.side === 'HOME' ? state.homeScore : state.awayScore;
    const opponentScore = own.side === 'HOME' ? state.awayScore : state.homeScore;
    const minute = Math.floor(state.second / 60);
    const losing = ownScore < opponentScore;
    const winning = ownScore > opponentScore;
    const exhausted = own.staminaReserve < 48;
    const midfieldProblem = own.midfieldControl + 4 < opponent.midfieldControl;

    if (minute < 12 || minute - current.lastChangeMinute < 8) return null;

    if (losing && minute > 62 && !exhausted) {
      return {
        instructions: {
          ...current,
          tempo: 'FAST',
          mindset: 'OFFENSIVE',
          pressing: 'PRESSING',
          counterAttack: midfieldProblem ? 'COUNTER' : current.counterAttack,
          lastChangeMinute: minute,
        },
        reason: 'AI przegrywa w końcówce i zwiększa ryzyko oraz tempo.',
        urgency: 0.82,
      };
    }

    if (winning && minute > 70) {
      return {
        instructions: {
          ...current,
          tempo: exhausted ? 'SLOW' : 'NORMAL',
          mindset: 'DEFENSIVE',
          pressing: exhausted ? 'NORMAL' : current.pressing,
          passing: 'SHORT',
          lastChangeMinute: minute,
        },
        reason: 'AI prowadzi i próbuje kontrolować przestrzeń oraz zmęczenie.',
        urgency: 0.64,
      };
    }

    if (midfieldProblem && current.counterAttack !== 'COUNTER') {
      return {
        instructions: {
          ...current,
          tempo: 'FAST',
          passing: 'LONG',
          counterAttack: 'COUNTER',
          lastChangeMinute: minute,
        },
        reason: 'AI przegrywa środek pola i przechodzi na szybsze ataki po odbiorze.',
        urgency: 0.55,
      };
    }

    return null;
  },
};

