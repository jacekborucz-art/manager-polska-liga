import { strict as assert } from 'node:assert';
import { ChampionshipHistoryService } from '../data/championship_history';

const storage = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

ChampionshipHistoryService.clear();
ChampionshipHistoryService.seedCareerStartDomesticHistory(2025);
ChampionshipHistoryService.seedCareerStartEuropeanClubHistory(2025);
ChampionshipHistoryService.seedCareerStartInternationalHistory(2025);
assert.equal(
  ChampionshipHistoryService.getAll().some(entry => entry.year === 2026 && entry.competition === 'LIGA_MISTRZOW'),
  false,
);

ChampionshipHistoryService.clear();
ChampionshipHistoryService.seedCareerStartDomesticHistory(2026);
ChampionshipHistoryService.seedCareerStartEuropeanClubHistory(2026);
ChampionshipHistoryService.seedCareerStartInternationalHistory(2026);

const history2026 = ChampionshipHistoryService.getAll().filter(entry => entry.season === '2025/2026');
const ekstraklasa2026 = history2026.find(entry => entry.competition === 'EKSTRAKLASA');
assert.equal(ekstraklasa2026?.winner, 'Lech Poznań');
assert.equal(ekstraklasa2026?.runnerUp, 'Górnik Zabrze');
assert.equal(history2026.find(entry => entry.competition === 'PUCHAR_POLSKI')?.winner, 'Górnik Zabrze');
assert.equal(history2026.find(entry => entry.competition === 'LIGA_MISTRZOW')?.winner, 'Paris Saint-Germain');
assert.equal(history2026.find(entry => entry.competition === 'LIGA_EUROPY')?.winner, 'Aston Villa');
assert.equal(history2026.find(entry => entry.competition === 'LIGA_KONFERENCJI')?.winner, 'Crystal Palace');
assert.equal(history2026.find(entry => entry.competition === 'LIGA_KONFERENCJI')?.runnerUp, 'Rayo Vallecano');
assert.equal(history2026.find(entry => entry.competition === 'SUPERPUCHAR_EUROPY')?.winner, 'Paris Saint-Germain');

const polishSupercups = ChampionshipHistoryService.getByCompetition('SUPERPUCHAR_POLSKI');
assert.equal(polishSupercups.length, 21);
assert.equal(polishSupercups[0]?.winner, 'Legia Warszawa');
assert.equal(polishSupercups.some(entry => entry.season === '2002/2003'), false);
assert.equal(polishSupercups.at(-1)?.season, '2000/2001');

const uefaSupercups = ChampionshipHistoryService.getByCompetition('SUPERPUCHAR_EUROPY');
assert.equal(uefaSupercups.length, 26);
assert.equal(uefaSupercups[2]?.winner, 'Manchester City');
assert.equal(uefaSupercups.at(-1)?.winner, 'Galatasaray');

const worldCups = ChampionshipHistoryService.getByCompetition('WORLD_CUP');
assert.equal(worldCups.length, 7);
assert.deepEqual(
  [worldCups[0]?.winner, worldCups[0]?.runnerUp, worldCups[0]?.thirdPlace, worldCups[0]?.fourthPlace],
  ['Hiszpania', 'Argentyna', 'Anglia', 'Francja'],
);
assert.equal(worldCups.at(-1)?.winner, 'Brazylia');

const euros = ChampionshipHistoryService.getByCompetition('EURO_CHAMPIONSHIP');
assert.equal(euros.length, 7);
assert.equal(euros[0]?.winner, 'Hiszpania');
assert.equal(euros.at(-1)?.winner, 'Francja');

const championsLeague = ChampionshipHistoryService.getByCompetition('LIGA_MISTRZOW');
assert.equal(championsLeague.length, 27);
assert.equal(championsLeague.at(-1)?.season, '1999/2000');

const europaLeague = ChampionshipHistoryService.getByCompetition('LIGA_EUROPY');
assert.equal(europaLeague.length, 27);
assert.equal(europaLeague.at(-1)?.winner, 'Galatasaray');

const conferenceLeague = ChampionshipHistoryService.getByCompetition('LIGA_KONFERENCJI');
assert.equal(conferenceLeague.length, 5);
assert.equal(conferenceLeague.at(-1)?.season, '2021/2022');

const ekstraklasa = ChampionshipHistoryService.getByCompetition('EKSTRAKLASA');
assert.equal(ekstraklasa.length, 27);
assert.equal(ekstraklasa.at(-1)?.winner, 'Polonia Warszawa');

const polishCup = ChampionshipHistoryService.getByCompetition('PUCHAR_POLSKI');
assert.equal(polishCup.length, 27);
assert.equal(polishCup.at(-1)?.winner, 'Amica Wronki');

console.log('Career start history tests passed.');
