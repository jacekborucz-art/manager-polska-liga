import { strict as assert } from 'node:assert';
import { STATIC_CLUBS } from '../constants';
import { ManagedReserveTeamService } from '../services/ManagedReserveTeamService';
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import { ReserveTeamLeagueService } from '../services/ReserveTeamLeagueService';
import { HealthStatus, MatchStatus, Player, PlayerPosition, Region } from '../types';

const makePlayer = (id: string, clubId: string): Player => ({
  id,
  firstName: 'Test',
  lastName: id,
  age: 19,
  clubId,
  nationality: Region.POLAND,
  position: PlayerPosition.MID,
  overallRating: 55,
  attributes: { talent: 70 } as Player['attributes'],
  stats: {
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 0,
    minutesPlayed: 0,
    seasonalChanges: {},
    ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: '2028-06-30T00:00:00.000Z',
  annualSalary: 50_000,
  history: [{
    clubId,
    clubName: 'Legia Warszawa II',
    fromYear: 2025,
    fromMonth: 7,
    toYear: null,
    toMonth: null,
  }],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  fatigueDebt: 0,
});

const parentId = 'PL_LEGIA_WARSZAWA';
const reserveId = 'PL_LEGIA_WARSZAWA_II';
const clubs2025 = PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2025);
const clubs2026 = PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2026);
assert.equal(ReserveTeamLeagueService.getReserveClubId(parentId), reserveId);
assert.equal(ReserveTeamLeagueService.getReserveClubId('PL_LECH_POZNAN'), null);
assert.equal(ReserveTeamLeagueService.canBeSelectedAsUserClub(parentId), true);
assert.equal(ReserveTeamLeagueService.canBeSelectedAsUserClub(reserveId), false);

// A configured relationship is activated only if that reserve side belongs to
// an actually simulated league in the selected season. These assertions guard
// the exact career-start combinations which previously exposed two unrelated
// squads under the same reserve-team label.
assert.equal(ReserveTeamLeagueService.getPlayableReserveClubId(parentId, clubs2025), null);
assert.equal(
  ReserveTeamLeagueService.getPlayableReserveClubId('PL_LKS_LODZ', clubs2025),
  'PL_LKS_II_LODZ'
);
assert.equal(
  ReserveTeamLeagueService.getPlayableReserveClubId('PL_SLASK_WROCLAW', clubs2025),
  'PL_SLASK_WROCLAW_II'
);
assert.equal(ReserveTeamLeagueService.getPlayableReserveClubId(parentId, clubs2026), reserveId);
assert.equal(ReserveTeamLeagueService.getPlayableReserveClubId('PL_LKS_LODZ', clubs2026), null);
assert.equal(
  ReserveTeamLeagueService.getPlayableReserveClubId('PL_SLASK_WROCLAW', clubs2026),
  'PL_SLASK_WROCLAW_II'
);
assert.equal(
  ReserveTeamLeagueService.getPlayableReserveClubId('PL_POLONIA_WARSZAWA', clubs2026),
  null
);

const officialPlayer = makePlayer('OFFICIAL', reserveId);
const uniqueLegacyPlayer = makePlayer('LEGACY_UNIQUE', parentId);
const duplicateOfficialPlayer = makePlayer('OFFICIAL', parentId);
const claimedElsewherePlayer = makePlayer('CLAIMED', parentId);
const migration = ManagedReserveTeamService.migrateLoadedSave({
  userTeamId: parentId,
  clubs: clubs2026,
  players: {
    [parentId]: [],
    [reserveId]: [officialPlayer],
    PL_LECH_POZNAN: [makePlayer('CLAIMED', 'PL_LECH_POZNAN')],
  },
  legacyReserves: [uniqueLegacyPlayer, duplicateOfficialPlayer, claimedElsewherePlayer],
  lineups: {},
  currentDate: new Date('2026-08-04T00:00:00.000Z'),
});

assert.equal(migration.linkedReserveClubId, reserveId);
assert.equal(migration.legacyReserves.length, 0);
assert.equal(migration.migratedPlayerCount, 1);
assert.deepEqual(migration.players[reserveId].map(player => player.id), ['OFFICIAL', 'LEGACY_UNIQUE']);
const migratedLegacyPlayer = migration.players[reserveId].find(player => player.id === 'LEGACY_UNIQUE')!;
assert.equal(migratedLegacyPlayer.clubId, reserveId);
assert.equal(migratedLegacyPlayer.history.at(-1)?.clubId, reserveId);
assert.equal(migratedLegacyPlayer.history.at(-1)?.movementType, 'INTERNAL_RESERVE');

// Running the migration again must not append any player a second time.
const repeatedMigration = ManagedReserveTeamService.migrateLoadedSave({
  userTeamId: parentId,
  clubs: clubs2026,
  players: migration.players,
  legacyReserves: migration.legacyReserves,
  lineups: migration.lineups,
  currentDate: new Date('2026-08-04T00:00:00.000Z'),
});
assert.equal(repeatedMigration.migratedPlayerCount, 0);
assert.equal(repeatedMigration.players[reserveId].length, 2);

// In 2025/26 Legia II is outside the simulated league pyramid. Loading a save
// must therefore preserve the player's generated reserves instead of silently
// merging them into the unrelated background database squad.
const inactiveReserveMigration = ManagedReserveTeamService.migrateLoadedSave({
  userTeamId: parentId,
  clubs: clubs2025,
  players: {
    [parentId]: [],
    [reserveId]: [officialPlayer],
  },
  legacyReserves: [uniqueLegacyPlayer],
  lineups: {},
  currentDate: new Date('2025-08-04T00:00:00.000Z'),
});
assert.equal(inactiveReserveMigration.linkedReserveClubId, null);
assert.deepEqual(inactiveReserveMigration.legacyReserves.map(player => player.id), ['LEGACY_UNIQUE']);
assert.deepEqual(inactiveReserveMigration.players[reserveId].map(player => player.id), ['OFFICIAL']);

const opponentId = 'PL_SLASK_WROCLAW_II';
const officialSchedule = ManagedReserveTeamService.buildOfficialSchedule(
  reserveId,
  [{
    id: 'LEAGUE_FIXTURE_1',
    leagueId: 'L_PL_3',
    homeTeamId: reserveId,
    awayTeamId: opponentId,
    date: new Date('2026-08-10T18:00:00.000Z'),
    status: MatchStatus.FINISHED,
    homeScore: 2,
    awayScore: 1,
  }],
  clubs2026,
  2,
  [{
    matchId: 'LEAGUE_FIXTURE_1',
    date: '2026-08-10T18:00:00.000Z',
    season: 2,
    competition: 'L_PL_3',
    homeTeamId: reserveId,
    awayTeamId: opponentId,
    homeScore: 2,
    awayScore: 1,
    goals: [],
    cards: [],
    homeLineup: ['OFFICIAL'],
  }]
);
assert.equal(officialSchedule.fixtures.length, 1);
assert.equal(officialSchedule.results.length, 1);
assert.equal(officialSchedule.fixtures[0].opponentClubId, opponentId);
assert.equal(officialSchedule.results[0].homeScore, 2);
assert.deepEqual(officialSchedule.results[0].userStartingXI, ['OFFICIAL']);

console.log('ManagedReserveTeamTests: OK');
