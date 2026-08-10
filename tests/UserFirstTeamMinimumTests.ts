import assert from 'node:assert/strict';
import { Club, HealthStatus, Lineup, Player, PlayerPosition } from '../types';
import {
  USER_FIRST_TEAM_MINIMUM_SIZE,
  UserFirstTeamMinimumService,
} from '../services/UserFirstTeamMinimumService';

const currentDate = new Date('2026-08-10T12:00:00.000Z');

const makePlayer = (
  id: string,
  position: PlayerPosition,
  clubId: string,
  overallRating = 60,
  healthStatus = HealthStatus.HEALTHY
): Player => ({
  id,
  firstName: 'Jan',
  lastName: id,
  age: 20,
  position,
  clubId,
  overallRating,
  contractEndDate: '2028-06-30',
  health: { status: healthStatus },
  condition: 100,
  suspensionMatches: 0,
  history: [{
    clubId,
    clubName: clubId,
    fromYear: 2025,
    fromMonth: 7,
    toYear: null,
    toMonth: null,
  }],
  interestedClubs: [],
} as Player);

const makeClub = (id: string, rosterIds: string[]): Club => ({
  id,
  name: id,
  shortName: id,
  leagueId: 'L_PL_1',
  country: 'Polska',
  reputation: 8,
  rosterIds,
} as Club);

const makeLineup = (clubId: string, playerIds: string[]): Lineup => ({
  clubId,
  tacticId: '4-4-2',
  startingXI: [...playerIds.slice(0, 11), ...new Array(Math.max(0, 11 - playerIds.length)).fill(null)],
  bench: playerIds.slice(11, 20),
  reserves: playerIds.slice(20),
});

const countPosition = (players: Player[], position: PlayerPosition): number =>
  players.filter(player => player.position === position).length;

const linkedFirstTeam = [
  makePlayer('f_gk_1', PlayerPosition.GK, 'FIRST'),
  ...Array.from({ length: 3 }, (_, index) => makePlayer(`f_def_${index}`, PlayerPosition.DEF, 'FIRST')),
  ...Array.from({ length: 4 }, (_, index) => makePlayer(`f_mid_${index}`, PlayerPosition.MID, 'FIRST')),
  ...Array.from({ length: 2 }, (_, index) => makePlayer(`f_fwd_${index}`, PlayerPosition.FWD, 'FIRST')),
];
const linkedReserves = [
  makePlayer('r_gk', PlayerPosition.GK, 'RESERVE', 54),
  makePlayer('r_def_1', PlayerPosition.DEF, 'RESERVE', 58),
  makePlayer('r_def_2', PlayerPosition.DEF, 'RESERVE', 56),
  makePlayer('r_fwd', PlayerPosition.FWD, 'RESERVE', 57),
  makePlayer('r_mid_star', PlayerPosition.MID, 'RESERVE', 90),
];
const linkedClubs = [
  makeClub('FIRST', linkedFirstTeam.map(player => player.id)),
  makeClub('RESERVE', linkedReserves.map(player => player.id)),
];
const linkedLineups = {
  FIRST: makeLineup('FIRST', linkedFirstTeam.map(player => player.id)),
  RESERVE: makeLineup('RESERVE', linkedReserves.map(player => player.id)),
};

const linkedResult = UserFirstTeamMinimumService.ensureMinimum(
  linkedClubs,
  { FIRST: linkedFirstTeam, RESERVE: linkedReserves },
  [],
  linkedLineups,
  'FIRST',
  'RESERVE',
  currentDate,
  false
);

assert.equal(linkedResult.updatedPlayers.FIRST.length, USER_FIRST_TEAM_MINIMUM_SIZE);
assert.equal(linkedResult.movements.length, 4);
assert.equal(linkedResult.generatedJuniors.length, linkedResult.movements.length);
assert.equal(linkedResult.updatedPlayers.RESERVE.length, linkedReserves.length);
assert.equal(countPosition(linkedResult.updatedPlayers.FIRST, PlayerPosition.GK), 2);
assert.equal(countPosition(linkedResult.updatedPlayers.FIRST, PlayerPosition.DEF), 5);
assert.equal(countPosition(linkedResult.updatedPlayers.FIRST, PlayerPosition.MID), 4);
assert.equal(countPosition(linkedResult.updatedPlayers.FIRST, PlayerPosition.FWD), 3);
assert.ok(linkedResult.updatedPlayers.RESERVE.some(player => player.id === 'r_mid_star'));
assert.ok(!linkedResult.updatedPlayers.FIRST.some(player => player.id === 'r_mid_star'));
assert.deepEqual(
  linkedResult.generatedJuniors.map(junior => junior.position).sort(),
  linkedResult.movements.map(movement => movement.position).sort()
);
assert.ok(linkedResult.generatedJuniors.every(junior => junior.age >= 16 && junior.age <= 18));
assert.ok(linkedResult.generatedJuniors.every(junior => junior.clubId === 'RESERVE'));
assert.deepEqual(
  linkedResult.updatedClubs.find(club => club.id === 'FIRST')?.rosterIds,
  linkedResult.updatedPlayers.FIRST.map(player => player.id)
);
assert.ok(linkedResult.movements.every(movement =>
  !linkedResult.updatedLineups.RESERVE.startingXI.includes(movement.playerId) &&
  !linkedResult.updatedLineups.RESERVE.bench.includes(movement.playerId)
));
assert.ok(linkedResult.movements.every(movement =>
  linkedResult.updatedLineups.FIRST.reserves.includes(movement.playerId)
));
assert.ok(linkedResult.generatedJuniors.every(junior =>
  linkedResult.updatedLineups.RESERVE.reserves.includes(junior.id)
));

const idempotentResult = UserFirstTeamMinimumService.ensureMinimum(
  linkedResult.updatedClubs,
  linkedResult.updatedPlayers,
  linkedResult.updatedLegacyReserves,
  linkedResult.updatedLineups,
  'FIRST',
  'RESERVE',
  currentDate,
  false
);
assert.equal(idempotentResult.movements.length, 0);
assert.equal(idempotentResult.generatedJuniors.length, 0);
assert.equal(idempotentResult.updatedPlayers.FIRST.length, USER_FIRST_TEAM_MINIMUM_SIZE);

const legacyFirstTeam = [
  makePlayer('l_gk', PlayerPosition.GK, 'FIRST'),
  ...Array.from({ length: 5 }, (_, index) => makePlayer(`l_def_${index}`, PlayerPosition.DEF, 'FIRST')),
  ...Array.from({ length: 4 }, (_, index) => makePlayer(`l_mid_${index}`, PlayerPosition.MID, 'FIRST')),
  ...Array.from({ length: 2 }, (_, index) => makePlayer(`l_fwd_${index}`, PlayerPosition.FWD, 'FIRST')),
];
const legacyReserves = [
  makePlayer('legacy_gk', PlayerPosition.GK, 'FIRST', 52, HealthStatus.INJURED),
  makePlayer('legacy_fwd', PlayerPosition.FWD, 'FIRST', 55),
];
const legacyResult = UserFirstTeamMinimumService.ensureMinimum(
  [makeClub('FIRST', legacyFirstTeam.map(player => player.id))],
  { FIRST: legacyFirstTeam },
  legacyReserves,
  { FIRST: makeLineup('FIRST', legacyFirstTeam.map(player => player.id)) },
  'FIRST',
  null,
  currentDate,
  false
);

assert.equal(legacyResult.updatedPlayers.FIRST.length, USER_FIRST_TEAM_MINIMUM_SIZE);
assert.equal(legacyResult.updatedLegacyReserves.length, legacyReserves.length);
assert.equal(legacyResult.generatedJuniors.length, legacyResult.movements.length);
assert.equal(countPosition(legacyResult.updatedPlayers.FIRST, PlayerPosition.GK), 2);
assert.equal(countPosition(legacyResult.updatedPlayers.FIRST, PlayerPosition.FWD), 3);
assert.ok(legacyResult.movements.every(movement => movement.source === 'LEGACY_RESERVES'));
assert.ok(legacyResult.generatedJuniors.every(junior => junior.age >= 16 && junior.age <= 18));
assert.ok(legacyResult.generatedJuniors.every(junior => junior.clubId === 'FIRST'));

const blockedPlayer = {
  ...makePlayer('blocked', PlayerPosition.DEF, 'RESERVE'),
  transferPendingClubId: 'OTHER',
};
const blockedResult = UserFirstTeamMinimumService.ensureMinimum(
  [makeClub('FIRST', linkedFirstTeam.map(player => player.id)), makeClub('RESERVE', ['blocked'])],
  { FIRST: linkedFirstTeam, RESERVE: [blockedPlayer] },
  [],
  {},
  'FIRST',
  'RESERVE',
  currentDate,
  false
);
assert.equal(blockedResult.movements.length, 0);
assert.equal(blockedResult.generatedJuniors.length, 0);
assert.equal(blockedResult.remainingShortfall, 4);

console.log('UserFirstTeamMinimumTests: OK');
