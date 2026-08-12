import { strict as assert } from 'node:assert';
import { NationalTeamService } from '../services/NationalTeamService';
import { WorldCupHistoryBackfillService } from '../services/WorldCupHistoryBackfillService';

const nationalTeams = NationalTeamService.initializeNationalTeams();

const beforeTournament = WorldCupHistoryBackfillService.simulateSkippedWorldCups(2025, nationalTeams, 12345);
assert.equal(beforeTournament.worldCupStates.length, 0);
assert.equal(beforeTournament.latestWorldCupState, null);

const season2026Start = WorldCupHistoryBackfillService.simulateSkippedWorldCups(2026, nationalTeams, 12345);
assert.equal(season2026Start.worldCupStates.length, 1);
assert.equal(season2026Start.latestWorldCupState?.year, 2026);
assert.equal(season2026Start.latestWorldCupState?.champion, 'Hiszpania');
assert.equal(season2026Start.worldCupStates[0]?.champion, 'Hiszpania');
assert.match(season2026Start.messages[0]?.subject ?? '', /Hiszpania/);
assert.match(season2026Start.messages[0]?.body ?? '', /Hiszpania/);

const finalPlacements = [
  season2026Start.latestWorldCupState?.champion,
  season2026Start.latestWorldCupState?.runnerUp,
  season2026Start.latestWorldCupState?.thirdPlace,
  season2026Start.latestWorldCupState?.fourthPlace,
].filter(Boolean);
assert.equal(new Set(finalPlacements).size, finalPlacements.length);

console.log('World Cup history backfill tests passed.');
