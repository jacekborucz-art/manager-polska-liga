import assert from 'node:assert/strict';
import { Coach, Lineup, Player, PlayerAttributes, PlayerPosition, WeatherSnapshot } from '../types';
import { buildLiveMatchTeamProfile } from '../services/match/live/LiveMatchTeamProfile';

/**
 * Match engine migration test
 *
 * What this test protects:
 * LiveMatchTeamProfile is the first non-random domain object added during the match engine
 * migration. It does not yet drive event outcomes; it prepares a safer surface for the future
 * engine by collecting player attributes, morale, fatigue, coach quality, and weather into a
 * single pure profile. This test makes sure that the profile is complete and that its most
 * important live-match signals move in the expected direction.
 *
 * Why this matters:
 * The old MatchLiveView loop recalculates similar ideas in many places. Before replacing those
 * inline calculations, we need a stable profile that can be trusted. If a future edit forgets an
 * attribute, includes a sent-off player, or makes harsh weather improve readiness, the migration
 * would become misleading instead of safer.
 *
 * How it verifies the builder:
 * The test builds a compact XI, checks every PlayerAttributes key, compares fresh/good-weather
 * readiness against tired/bad-weather readiness, and confirms that a sent-off player disappears
 * from active calculations.
 */

const attributeKeys: Array<keyof PlayerAttributes> = [
  'strength',
  'stamina',
  'pace',
  'defending',
  'passing',
  'attacking',
  'finishing',
  'technique',
  'vision',
  'dribbling',
  'heading',
  'positioning',
  'goalkeeping',
  'freeKicks',
  'talent',
  'penalties',
  'corners',
  'aggression',
  'crossing',
  'leadership',
  'mentality',
  'workRate',
];

const makeAttributes = (base: number, overrides: Partial<PlayerAttributes> = {}): PlayerAttributes => {
  return {
    strength: base,
    stamina: base,
    pace: base,
    defending: base,
    passing: base,
    attacking: base,
    finishing: base,
    technique: base,
    vision: base,
    dribbling: base,
    heading: base,
    positioning: base,
    goalkeeping: base,
    freeKicks: base,
    talent: base,
    penalties: base,
    corners: base,
    aggression: base,
    crossing: base,
    leadership: base,
    mentality: base,
    workRate: base,
    ...overrides,
  };
};

const makePlayer = (id: string, position: PlayerPosition, overallRating: number, morale: number): Player => {
  return {
    id,
    firstName: id,
    lastName: id,
    position,
    overallRating,
    morale,
    condition: 100,
    attributes: makeAttributes(overallRating, position === PlayerPosition.GK ? { goalkeeping: overallRating + 8 } : {}),
  } as Player;
};

const lineup: Lineup = {
  clubId: 'TEST',
  tacticId: '4-4-2',
  startingXI: ['gk', 'def1', 'def2', 'def3', 'def4', 'mid1', 'mid2', 'mid3', 'mid4', 'fwd1', 'fwd2'],
  bench: [],
  reserves: [],
};

const players: Player[] = [
  makePlayer('gk', PlayerPosition.GK, 72, 60),
  makePlayer('def1', PlayerPosition.DEF, 68, 58),
  makePlayer('def2', PlayerPosition.DEF, 69, 58),
  makePlayer('def3', PlayerPosition.DEF, 70, 58),
  makePlayer('def4', PlayerPosition.DEF, 71, 58),
  makePlayer('mid1', PlayerPosition.MID, 73, 62),
  makePlayer('mid2', PlayerPosition.MID, 72, 62),
  makePlayer('mid3', PlayerPosition.MID, 71, 62),
  makePlayer('mid4', PlayerPosition.MID, 70, 62),
  makePlayer('fwd1', PlayerPosition.FWD, 74, 65),
  makePlayer('fwd2', PlayerPosition.FWD, 73, 65),
];

const coach: Coach = {
  attributes: { experience: 70, decisionMaking: 72, motivation: 68, training: 66 },
} as Coach;

const goodWeather: WeatherSnapshot = {
  tempC: 16,
  precipitationChance: 10,
  windKmh: 8,
  description: 'calm',
  weatherIntensity: 0,
};

const harshWeather: WeatherSnapshot = {
  tempC: 34,
  precipitationChance: 88,
  windKmh: 42,
  description: 'harsh',
  weatherIntensity: 0.9,
};

const freshFatigue = Object.fromEntries(players.map(player => [player.id, 96]));
const tiredFatigue = Object.fromEntries(players.map(player => [player.id, 66]));

const freshProfile = buildLiveMatchTeamProfile({
  side: 'HOME',
  players,
  lineup,
  fatigue: freshFatigue,
  coach,
  weather: goodWeather,
});

const tiredProfile = buildLiveMatchTeamProfile({
  side: 'HOME',
  players,
  lineup,
  fatigue: tiredFatigue,
  coach,
  weather: harshWeather,
});

for (const key of attributeKeys) {
  assert.equal(typeof freshProfile.attributeAverages[key], 'number');
}

assert.equal(freshProfile.activePlayers.length, 11);
assert.equal(freshProfile.freshShare, 1);
assert.equal(tiredProfile.exhaustedShare, 1);
assert(tiredProfile.readiness < freshProfile.readiness);
assert(tiredProfile.attackingReadiness < freshProfile.attackingReadiness);
assert(tiredProfile.weather.technicalDifficulty > freshProfile.weather.technicalDifficulty);

const sentOffProfile = buildLiveMatchTeamProfile({
  side: 'HOME',
  players,
  lineup,
  fatigue: freshFatigue,
  coach,
  weather: goodWeather,
  sentOffIds: ['fwd1'],
});

assert.equal(sentOffProfile.activePlayers.length, 10);
assert.equal(sentOffProfile.activePlayers.some(player => player.id === 'fwd1'), false);

console.log('LiveMatchTeamProfileTests: OK');
