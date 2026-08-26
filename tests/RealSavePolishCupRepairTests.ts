import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { BackgroundMatchProcessorPolishCup } from '../services/BackgroundMatchProcessorPolishCup';
import { MatchHistoryService } from '../services/MatchHistoryService';
import { POLISH_CUP_BYE_TEAM_ID } from '../services/PolishCupDrawService';
import { normalizeSaveState, SaveState } from '../services/SaveGameService';
import { CompetitionType, Fixture, MatchStatus } from '../types';

const savePath = process.env.FM_REAL_SAVE_PATH;
assert.ok(savePath, 'ustaw FM_REAL_SAVE_PATH na analizowany plik zapisu');

const reviveIsoDates = (_key: string, value: unknown): unknown => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
};

const parsed = JSON.parse(
  gunzipSync(readFileSync(savePath!)).toString('utf8'),
  reviveIsoDates
) as SaveState;
const state = normalizeSaveState(parsed);
const leagueFixtures = Object.values(state.leagueSchedules ?? {}).flatMap((schedule: any) =>
  (schedule?.matchdays ?? []).flatMap((matchday: any) => matchday?.fixtures ?? [])
) as Fixture[];
const fixtures = [...leagueFixtures, ...(state.globalFixtures ?? [])];
const currentDate = state.currentDate instanceof Date ? state.currentDate : new Date(state.currentDate);
const dateStr = currentDate.toDateString();
const clubIds = new Set(state.clubs.map(club => club.id));
const brokenBefore = fixtures.filter(fixture =>
  fixture.date.toDateString() === dateStr &&
  fixture.status === MatchStatus.SCHEDULED &&
  fixture.leagueId === CompetitionType.POLISH_CUP &&
  (!clubIds.has(fixture.homeTeamId) || !clubIds.has(fixture.awayTeamId))
);

assert.ok(brokenBefore.length > 0, 'rzeczywisty zapis testowy musi zawierać uszkodzoną parę Pucharu Polski');
const playerCountBefore = Object.values(state.players).reduce((sum, squad) => sum + squad.length, 0);
MatchHistoryService.clear();
const result = BackgroundMatchProcessorPolishCup.processCupEvent(
  currentDate,
  state.userTeamId,
  fixtures,
  state.clubs,
  state.players,
  state.lineups,
  state.sessionSeed,
  state.seasonNumber,
  state.coaches
);
const playerCountAfter = Object.values(result.updatedPlayers).reduce((sum, squad) => sum + squad.length, 0);

brokenBefore.forEach(brokenFixture => {
  const repaired = result.updatedFixtures.find(fixture => fixture.id === brokenFixture.id);
  assert.ok(repaired, 'naprawiona para musi pozostać w terminarzu');
  assert.equal(repaired?.status, MatchStatus.FINISHED, 'wolny los musi zamknąć uszkodzoną parę');
  assert.equal(repaired?.awayTeamId, POLISH_CUP_BYE_TEAM_ID, 'brakujący klub musi zostać zastąpiony znacznikiem wolnego losu');
  assert.equal(repaired?.homeScore, 1, 'istniejący klub musi awansować przez wolny los');
});

assert.equal(
  result.updatedFixtures.some(fixture =>
    fixture.date.toDateString() === dateStr &&
    fixture.status === MatchStatus.SCHEDULED &&
    fixture.leagueId === CompetitionType.POLISH_CUP &&
    (!clubIds.has(fixture.homeTeamId) || !clubIds.has(fixture.awayTeamId))
  ),
  false,
  'po naprawie nie może pozostać zaplanowana para z brakującym klubem'
);
assert.equal(playerCountAfter, playerCountBefore, 'naprawa rundy nie może zgubić ani powielić zawodników');

console.log(JSON.stringify({
  date: dateStr,
  brokenFixturesRepaired: brokenBefore.length,
  finishedCupFixtures: result.updatedFixtures.filter(fixture =>
    fixture.date.toDateString() === dateStr &&
    fixture.leagueId === CompetitionType.POLISH_CUP &&
    fixture.status === MatchStatus.FINISHED
  ).length,
  playerCountBefore,
  playerCountAfter,
}, null, 2));
console.log('RealSavePolishCupRepairTests: OK');
