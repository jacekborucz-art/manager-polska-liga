import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { GoalTickerInfo } from '../types';
import {
  observeCommittedLiveGoal,
} from '../services/match/live/LiveMatchGoalCommit';
import type { LiveGoalObservation } from '../services/match/live/LiveMatchGoalCommit';

const goal = (playerName: string, minute: number, extra: Partial<GoalTickerInfo> = {}): GoalTickerInfo => ({
  playerName,
  minute,
  isPenalty: false,
  ...extra,
});

const baselineState = {
  sessionSeed: 123,
  homeScore: 0,
  awayScore: 0,
  homeGoals: [] as GoalTickerInfo[],
  awayGoals: [] as GoalTickerInfo[],
};

const baseline = observeCommittedLiveGoal(null, baselineState);
assert.equal(baseline.committedGoal, null);

const committedHome = observeCommittedLiveGoal(baseline.observation, {
  ...baselineState,
  homeScore: 1,
  homeGoals: [goal('Kowalski', 12, { scorerId: 'home-9' })],
});
assert.equal(committedHome.committedGoal?.side, 'HOME');
assert.equal(committedHome.committedGoal?.goal.scorerId, 'home-9');

const ghostGoalEntryOnly = observeCommittedLiveGoal(baseline.observation, {
  ...baselineState,
  homeGoals: [goal('Kowalski', 12, { scorerId: 'home-9' })],
});
assert.equal(ghostGoalEntryOnly.committedGoal, null);

const ghostScoreOnly = observeCommittedLiveGoal(baseline.observation, {
  ...baselineState,
  homeScore: 1,
});
assert.equal(ghostScoreOnly.committedGoal, null);

const missedPenalty = observeCommittedLiveGoal(baseline.observation, {
  ...baselineState,
  homeGoals: [goal('Kowalski', 18, { isPenalty: true, isMiss: true })],
});
assert.equal(missedPenalty.committedGoal, null);

const previousAway: LiveGoalObservation = {
  ...baseline.observation,
  homeEntries: 1,
};
const committedAway = observeCommittedLiveGoal(previousAway, {
  ...baselineState,
  homeGoals: [goal('Kowalski', 12, { scorerId: 'home-9' })],
  awayScore: 1,
  awayGoals: [goal('Nowak', 31, { scorerId: 'away-10' })],
});
assert.equal(committedAway.committedGoal?.side, 'AWAY');
assert.equal(committedAway.committedGoal?.goal.playerName, 'Nowak');

const resumedMatch = observeCommittedLiveGoal(null, {
  ...baselineState,
  homeScore: 1,
  homeGoals: [goal('Kowalski', 12)],
});
assert.equal(resumedMatch.committedGoal, null);

const activeLiveViews = [
  'components/views/MatchLiveView.tsx',
  'components/views/FriendlyMatchLiveView.tsx',
  'CLEngine/CLMatchLiveView.tsx',
  'LECupEngine/ELMatchLiveView.tsx',
  'LECupEngine/CONFMatchLiveView.tsx',
  'LECupEngine/LEMatchLiveView.tsx',
  'PolishCupEngine/MatchLiveViewPolishCupV2.tsx',
];

activeLiveViews.forEach(file => {
  const source = readFileSync(file, 'utf8');
  assert(source.includes('observeCommittedLiveGoal'), `${file}: missing committed-goal observer`);
  assert(source.includes('if (!goalTriggered)'), `${file}: goal log can still be overwritten by flavor commentary`);
  assert(!source.includes('varDataRef'), `${file}: legacy pre-commit VAR/celebration ref is still present`);
  assert.equal(
    source.match(/setIsCelebratingGoal\(true\)/g)?.length,
    1,
    `${file}: goal celebration must have one committed-state trigger`
  );
});

console.log('LiveMatchGoalCommitTests: OK');
