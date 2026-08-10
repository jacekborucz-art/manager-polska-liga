import { strict as assert } from 'node:assert';
import { STATIC_CLUBS } from '../constants';
import { DatapackClubService } from '../services/DatapackClubService';

const legia = STATIC_CLUBS.find(club => club.id === 'PL_LEGIA_WARSZAWA')!;
const importedLegia = {
  ...legia,
  name: 'Legia Testowa',
  colorsHex: ['#123456', '#abcdef'],
  leagueId: 'L_PL_3',
  tier: 3,
  isDefaultActive: false,
};
const customClub = {
  ...legia,
  id: 'CUSTOM_NOWY_KLUB',
  name: 'Nowy Klub',
  shortName: 'NOW',
  country: 'POL',
  leagueId: 'L_PL_1',
  tier: 1,
  rosterIds: [],
};

const preparedClubs = DatapackClubService.applyCareerStartStructure(
  STATIC_CLUBS,
  [importedLegia, customClub],
  2025
);

const preparedLegia = preparedClubs.find(club => club.id === legia.id)!;
assert.equal(preparedLegia.name, 'Legia Testowa', 'datapack musi zachować edytowaną nazwę klubu');
assert.deepEqual(preparedLegia.colorsHex, ['#123456', '#abcdef'], 'datapack musi zachować kolory klubu');
assert.equal(preparedLegia.leagueId, 'L_PL_1', 'datapack nie może nadpisać oficjalnej ligi klubu');
assert.equal(preparedLegia.tier, 1, 'poziom klubu musi wynikać z konfiguracji sezonu');
assert.equal(preparedLegia.isDefaultActive, true, 'klub z oficjalnej ligi musi być aktywny');

const preparedCustomClub = preparedClubs.find(club => club.id === customClub.id)!;
assert.equal(preparedCustomClub.leagueId, 'L_PL_4', 'nowy polski klub z datapacka musi trafić do puli ligowej');
assert.equal(preparedCustomClub.tier, 4, 'nowy polski klub nie może sam przypisać się do grywalnej ligi');

(['L_PL_1', 'L_PL_2', 'L_PL_3'] as const).forEach(leagueId => {
  assert.equal(
    preparedClubs.filter(club => club.leagueId === leagueId).length,
    18,
    `${leagueId} musi zawierać dokładnie 18 klubów po imporcie datapacka`
  );
});

const exportedPolishClub = DatapackClubService.prepareClubForExport(importedLegia);
assert.equal('leagueId' in exportedPolishClub, false, 'eksport nie może zapisywać ligi polskiego klubu');
assert.equal('tier' in exportedPolishClub, false, 'eksport nie może zapisywać poziomu ligi polskiego klubu');
assert.equal('isDefaultActive' in exportedPolishClub, false, 'eksport nie może zapisywać aktywności ligowej polskiego klubu');

const squadResult = DatapackClubService.ensureSquads([preparedCustomClub], {});
assert.ok(squadResult.players[customClub.id].length >= 26, 'nowy klub bez kadry musi otrzymać zawodników');
assert.equal(squadResult.generatedClubIds[0], customClub.id);
assert.deepEqual(
  squadResult.clubs[0].rosterIds,
  squadResult.players[customClub.id].map(player => player.id),
  'rosterIds nowego klubu muszą odpowiadać wygenerowanej kadrze'
);
assert.ok(
  squadResult.players[customClub.id].every(player => player.clubId === customClub.id),
  'wszyscy wygenerowani zawodnicy muszą należeć do nowego klubu'
);

console.log('DatapackClubTests: OK');
