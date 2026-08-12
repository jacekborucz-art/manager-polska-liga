import { strict as assert } from 'node:assert';
import { UEFASuperCupService } from '../services/UEFASuperCupService';
import { Club, CompetitionType, MatchStatus } from '../types';

const clubs: Club[] = [];

const season2025Fixture = UEFASuperCupService.generateFixture(2025, clubs);
assert.equal(season2025Fixture.homeTeamId, 'EU_CL_PARIS_SAINT_GERMAIN');
assert.equal(season2025Fixture.awayTeamId, 'EU_CL_TOTTENHAM_HOTSPUR');

const season2026Fixture = UEFASuperCupService.generateFixture(2026, clubs);
assert.equal(season2026Fixture.homeTeamId, 'EU_CL_PARIS_SAINT_GERMAIN');
assert.equal(season2026Fixture.awayTeamId, 'EU_EL_ASTON_VILLA');
assert.equal(season2026Fixture.leagueId, CompetitionType.UEFA_SUPER_CUP);
assert.equal(season2026Fixture.status, MatchStatus.SCHEDULED);
assert.equal(season2026Fixture.date.getFullYear(), 2026);
assert.equal(season2026Fixture.date.getMonth(), 7);
assert.equal(season2026Fixture.date.getDate(), 23);

const generatedWinnersFixture = UEFASuperCupService.generateFixture(
  2026,
  clubs,
  'EU_CL_REAL_MADRYT',
  'EU_EL_MANCHESTER_UNITED',
);
assert.equal(generatedWinnersFixture.homeTeamId, 'EU_CL_REAL_MADRYT');
assert.equal(generatedWinnersFixture.awayTeamId, 'EU_EL_MANCHESTER_UNITED');

console.log('UEFA Super Cup service tests passed.');
