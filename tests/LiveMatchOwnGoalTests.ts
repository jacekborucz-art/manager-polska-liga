import assert from 'node:assert/strict';
import { Player, PlayerPosition } from '../types';
import {
  buildLiveOwnGoalCommentary,
  calculateLiveOwnGoalChance,
  resolveLiveOwnGoal,
} from '../services/match/live/LiveMatchOwnGoal';

/**
 * Match engine own-goal tests
 *
 * What these tests protect:
 * Own goals are intentionally modeled as a rare conversion of an already-dangerous goal situation, not
 * as a new independent scoring source. The assertions below verify that the probability stays small,
 * rises in realistic bad-defending conditions, chooses a defender from the defending XI, and produces
 * match commentary that clearly labels the event as a samobój.
 *
 * Why this matters:
 * A flat own-goal roll would distort total score balance and could create absurd goals from harmless
 * minutes. This calculator instead depends on context, defensive quality, fatigue, morale, and rain.
 * The tests lock those design guarantees before MatchLiveView wires the result into score, ticker,
 * reports, and post-match statistics.
 */

const baseAttributes = {
  strength: 70,
  stamina: 70,
  pace: 70,
  defending: 70,
  passing: 70,
  attacking: 55,
  finishing: 45,
  technique: 70,
  vision: 60,
  dribbling: 55,
  heading: 70,
  positioning: 70,
  goalkeeping: 25,
  freeKicks: 40,
  talent: 70,
  penalties: 40,
  corners: 40,
  aggression: 55,
  crossing: 45,
  leadership: 55,
  mentality: 70,
  workRate: 70,
  promisedRaisePct: null,
};

const makePlayer = (
  id: string,
  position: PlayerPosition,
  overrides: Partial<typeof baseAttributes> = {},
  morale = 55
): Player => ({
  id,
  firstName: id.toUpperCase(),
  lastName: `Player${id}`,
  position,
  overallRating: 70,
  attributes: { ...baseAttributes, ...overrides },
  morale,
} as Player);

const defenders = [
  makePlayer('gk', PlayerPosition.GK, { goalkeeping: 72 }),
  makePlayer('d1', PlayerPosition.DEF),
  makePlayer('d2', PlayerPosition.DEF),
  makePlayer('d3', PlayerPosition.DEF),
  makePlayer('d4', PlayerPosition.DEF),
  makePlayer('d5', PlayerPosition.DEF),
  makePlayer('m1', PlayerPosition.MID),
  makePlayer('m2', PlayerPosition.MID),
  makePlayer('m3', PlayerPosition.MID),
  makePlayer('f1', PlayerPosition.FWD),
  makePlayer('f2', PlayerPosition.FWD),
];
const lineup = defenders.map(player => player.id);

const calmOpenPlayChance = calculateLiveOwnGoalChance({
  context: 'openPlay',
  defendingPlayers: defenders,
  defendingLineup: lineup,
  defendingFatigue: Object.fromEntries(lineup.map(id => [id, 92])),
  weather: { precipitationChance: 0 } as any,
});
assert(calmOpenPlayChance >= 0.004);
assert(calmOpenPlayChance <= 0.018);

const exhaustedRainCornerChance = calculateLiveOwnGoalChance({
  context: 'corner',
  defendingPlayers: defenders.map(player => makePlayer(
    player.id,
    player.position,
    { defending: 42, positioning: 42, technique: 42, mentality: 42, workRate: 42 },
    22
  )),
  defendingLineup: lineup,
  defendingFatigue: Object.fromEntries(lineup.map(id => [id, 48])),
  weather: { precipitationChance: 95 } as any,
  pressureMultiplier: 1.45,
});
assert(exhaustedRainCornerChance > calmOpenPlayChance);
assert(exhaustedRainCornerChance <= 0.052);

const forcedOwnGoal = resolveLiveOwnGoal({
  context: 'chaos',
  defendingPlayers: defenders,
  defendingLineup: lineup,
  defendingFatigue: Object.fromEntries(lineup.map(id => [id, 58])),
  weather: { precipitationChance: 80 } as any,
  rng: () => 0,
});
assert(forcedOwnGoal);
assert(lineup.includes(forcedOwnGoal.player.id));
assert(forcedOwnGoal.commentary.toLowerCase().includes('samob'));

const blockedOwnGoal = resolveLiveOwnGoal({
  context: 'chaos',
  defendingPlayers: defenders,
  defendingLineup: lineup,
  defendingFatigue: Object.fromEntries(lineup.map(id => [id, 58])),
  weather: { precipitationChance: 80 } as any,
  rng: () => 0.999,
});
assert.equal(blockedOwnGoal, null);

assert(buildLiveOwnGoalCommentary('openPlay', 'Kowalski', () => 0.1).includes('Kowalski'));
assert(buildLiveOwnGoalCommentary('corner', 'Nowak', () => 0.9).includes('Nowak'));

console.log('LiveMatchOwnGoalTests: OK');
