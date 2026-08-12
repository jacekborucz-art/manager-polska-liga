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
ChampionshipHistoryService.seedCareerStartEuropeanClubHistory(2025);
assert.equal(
  ChampionshipHistoryService.getAll().some(entry => entry.year === 2026 && entry.competition === 'LIGA_MISTRZOW'),
  false,
);

ChampionshipHistoryService.clear();
ChampionshipHistoryService.seedCareerStartEuropeanClubHistory(2026);

const history2026 = ChampionshipHistoryService.getAll().filter(entry => entry.season === '2025/2026');
assert.equal(history2026.find(entry => entry.competition === 'LIGA_MISTRZOW')?.winner, 'Paris Saint-Germain');
assert.equal(history2026.find(entry => entry.competition === 'LIGA_EUROPY')?.winner, 'Aston Villa');
assert.equal(history2026.find(entry => entry.competition === 'LIGA_KONFERENCJI')?.winner, 'Crystal Palace');
assert.equal(history2026.find(entry => entry.competition === 'LIGA_KONFERENCJI')?.runnerUp, 'Rayo Vallecano');

console.log('European club history tests passed.');
