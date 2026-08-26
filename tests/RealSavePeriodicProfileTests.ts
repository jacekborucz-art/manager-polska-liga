import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { gunzipSync } from 'node:zlib';
import { AiWeeklyTrainingService } from '../services/AiWeeklyTrainingService';
import { EuropeanPlayerStatsService } from '../services/EuropeanPlayerStatsService';
import { RecoveryService } from '../services/RecoveryService';
import { normalizeSaveState, SaveState } from '../services/SaveGameService';
import { Fixture, Player, TrainingIntensity } from '../types';

const savePath = process.env.FM_REAL_SAVE_PATH;
assert.ok(savePath, 'ustaw FM_REAL_SAVE_PATH na analizowany plik zapisu');

const reviveIsoDates = (_key: string, value: unknown): unknown => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
};

const parsed = JSON.parse(gunzipSync(readFileSync(savePath!)).toString('utf8'), reviveIsoDates) as SaveState;
const state = normalizeSaveState(parsed);
const savedDate = state.currentDate instanceof Date ? state.currentDate : new Date(state.currentDate);
const profileDate = new Date(savedDate);
profileDate.setFullYear(2026, 7, 15);

const fixtures = [
  ...Object.values(state.leagueSchedules ?? {}).flatMap((schedule: any) =>
    (schedule?.matchdays ?? []).flatMap((matchday: any) => matchday?.fixtures ?? [])
  ),
  ...(state.globalFixtures ?? []),
] as Fixture[];

const time = <T>(work: () => T): { result: T; ms: number } => {
  const startedAt = performance.now();
  const result = work();
  return { result, ms: performance.now() - startedAt };
};

const recovery = time(() => RecoveryService.applyDailyRecovery(
  state.players,
  profileDate,
  TrainingIntensity.NORMAL,
  1,
  1,
  undefined,
  state.userTeamId ?? undefined
));

const foreignLeagueIds = new Set(['L_CL', 'L_EL', 'L_CONF', 'L_SA', 'L_ASIA', 'L_AFRICA', 'L_NA']);
let foreignClubCount = 0;
let foreignPlayerCount = 0;
const foreignStats = time(() => {
  const nextPlayers: Record<string, Player[]> = { ...recovery.result };
  state.clubs.forEach(club => {
    if (!foreignLeagueIds.has(String(club.leagueId)) || club.country === 'POL') return;
    const squad = nextPlayers[club.id];
    if (!squad?.length) return;
    foreignClubCount += 1;
    foreignPlayerCount += squad.length;
    nextPlayers[club.id] = EuropeanPlayerStatsService.applyBackgroundLeagueStatsToDate(
      squad,
      club,
      profileDate,
      profileDate.getFullYear()
    );
  });
  return nextPlayers;
});

const weeklyTraining = time(() => AiWeeklyTrainingService.processWeeklyTraining(
  foreignStats.result,
  state.clubs,
  state.coaches,
  state.userTeamId,
  profileDate,
  fixtures,
  state.sessionSeed,
  (state as any).staffMembers ?? {}
));

const totalPlayersAfter = Object.values(weeklyTraining.result.updatedPlayers)
  .reduce((total, squad) => total + squad.length, 0);
const totalPlayersBefore = Object.values(state.players).reduce((total, squad) => total + squad.length, 0);
assert.equal(totalPlayersAfter, totalPlayersBefore, 'profil okresowych etapów nie może zmienić liczby zawodników');

console.log(JSON.stringify({
  date: profileDate.toISOString(),
  totalPlayers: totalPlayersBefore,
  foreignClubCount,
  foreignPlayerCount,
  recoveryMs: +recovery.ms.toFixed(1),
  foreignBackgroundStatsMs: +foreignStats.ms.toFixed(1),
  aiWeeklyTrainingMs: +weeklyTraining.ms.toFixed(1),
}, null, 2));
console.log('RealSavePeriodicProfileTests: OK');
