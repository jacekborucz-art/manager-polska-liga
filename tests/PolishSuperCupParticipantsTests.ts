import assert from 'node:assert/strict';
import { STATIC_CLUBS } from '../constants';
import { DatapackClubService } from '../services/DatapackClubService';
import { SuperCupService } from '../services/SuperCupService';

const legia = STATIC_CLUBS.find(club => club.id === 'PL_LEGIA_WARSZAWA')!;

// Reproduce the datapack career-start path and deliberately make Legia and
// Jagiellonia the first two clubs in the zero-round table. Before this fix the
// fixture silently depended on that array/table order instead of known winners.
const datapackClubs = DatapackClubService.applyCareerStartStructure(
  STATIC_CLUBS,
  [{ ...legia, name: 'Legia z datapacka' }],
  2026
).map(club => ({
  ...club,
  stats: {
    ...club.stats,
    points: club.id === 'PL_LEGIA_WARSZAWA'
      ? 100
      : club.id === 'PL_JAGIELLONIA_BIALYSTOK' ? 90 : 0,
  },
}));

const initial2026Fixture = SuperCupService.generateFixture(2026, datapackClubs);
assert.equal(initial2026Fixture.homeTeamId, 'PL_LECH_POZNAN');
assert.equal(initial2026Fixture.awayTeamId, 'PL_GORNIK_ZABRZE');
assert.equal(
  initial2026Fixture.id,
  'SUPER_CUP_2026_PL_LECH_POZNAN_PL_GORNIK_ZABRZE',
  'the 2026/27 fixture id must contain the historical champion and cup winner'
);

// The existing 2025/26 career lore remains unchanged.
const initial2025Fixture = SuperCupService.generateFixture(2025, datapackClubs);
assert.equal(initial2025Fixture.homeTeamId, 'PL_LEGIA_WARSZAWA');
assert.equal(initial2025Fixture.awayTeamId, 'PL_LECH_POZNAN');

// Completed in-game seasons pass actual winners explicitly. They must override
// historical presets so the fix does not freeze future careers to real data.
const simulatedSeasonFixture = SuperCupService.generateFixture(
  2026,
  datapackClubs,
  'PL_RAKOW_CZESTOCHOWA',
  'PL_JAGIELLONIA_BIALYSTOK'
);
assert.equal(simulatedSeasonFixture.homeTeamId, 'PL_RAKOW_CZESTOCHOWA');
assert.equal(simulatedSeasonFixture.awayTeamId, 'PL_JAGIELLONIA_BIALYSTOK');

console.log('PolishSuperCupParticipantsTests: OK');
