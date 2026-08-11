import type { GoalTickerInfo } from '../../../types';

export type LiveGoalObservation = {
  sessionSeed: number;
  homeScore: number;
  awayScore: number;
  homeEntries: number;
  awayEntries: number;
};

export type CommittedLiveGoal = {
  side: 'HOME' | 'AWAY';
  goal: GoalTickerInfo;
};

type LiveGoalStateSnapshot = {
  sessionSeed: number;
  homeScore: number;
  awayScore: number;
  homeGoals: GoalTickerInfo[];
  awayGoals: GoalTickerInfo[];
};

const isCountedGoal = (goal: GoalTickerInfo) => !goal.isMiss && !goal.varDisallowed;

/**
 * Detects a goal only after both parts of the canonical match state have committed:
 * the scoreboard increased and a matching goal entry was appended. UI effects must
 * not be started from inside a React state updater because React may evaluate that
 * updater without committing its returned state.
 */
export const observeCommittedLiveGoal = (
  previous: LiveGoalObservation | null,
  current: LiveGoalStateSnapshot
): { observation: LiveGoalObservation; committedGoal: CommittedLiveGoal | null } => {
  const observation: LiveGoalObservation = {
    sessionSeed: current.sessionSeed,
    homeScore: current.homeScore,
    awayScore: current.awayScore,
    homeEntries: current.homeGoals.length,
    awayEntries: current.awayGoals.length,
  };

  if (!previous || previous.sessionSeed !== current.sessionSeed) {
    return { observation, committedGoal: null };
  }

  const newHomeGoal = current.homeScore > previous.homeScore
    ? current.homeGoals.slice(previous.homeEntries).filter(isCountedGoal).at(-1)
    : undefined;
  const newAwayGoal = current.awayScore > previous.awayScore
    ? current.awayGoals.slice(previous.awayEntries).filter(isCountedGoal).at(-1)
    : undefined;

  if (newHomeGoal && newAwayGoal) {
    return newHomeGoal.minute >= newAwayGoal.minute
      ? { observation, committedGoal: { side: 'HOME', goal: newHomeGoal } }
      : { observation, committedGoal: { side: 'AWAY', goal: newAwayGoal } };
  }
  if (newHomeGoal) return { observation, committedGoal: { side: 'HOME', goal: newHomeGoal } };
  if (newAwayGoal) return { observation, committedGoal: { side: 'AWAY', goal: newAwayGoal } };
  return { observation, committedGoal: null };
};
