import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { gunzipSync } from 'node:zlib';
import { AiContractService } from '../services/AiContractService';
import { AiMatchPreparationService } from '../services/AiMatchPreparationService';
import { BackgroundMatchProcessor } from '../services/BackgroundMatchProcessor';
import { PerfProfilerService } from '../services/PerfProfilerService';
import { ReserveTeamSquadMovementService } from '../services/ReserveTeamSquadMovementService';
import { normalizeSaveState, SaveState } from '../services/SaveGameService';
import { Fixture } from '../types';

const savePath = process.env.FM_REAL_SAVE_PATH;
assert.ok(savePath, 'ustaw FM_REAL_SAVE_PATH na analizowany plik zapisu');

const reviveIsoDates = (_key: string, value: unknown): unknown => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
};

const loadStartedAt = performance.now();
const compressed = readFileSync(savePath!);
const decompressed = gunzipSync(compressed).toString('utf8');
const parsed = JSON.parse(decompressed, reviveIsoDates) as SaveState;
const normalizeStartedAt = performance.now();
const state = normalizeSaveState(parsed);
const normalizeMs = performance.now() - normalizeStartedAt;
const loadMs = performance.now() - loadStartedAt;

const leagueFixtures = Object.values(state.leagueSchedules ?? {}).flatMap((schedule: any) =>
  (schedule?.matchdays ?? []).flatMap((matchday: any) => matchday?.fixtures ?? [])
) as Fixture[];
const fixtures = [...leagueFixtures, ...(state.globalFixtures ?? [])];
const savedCurrentDate = state.currentDate instanceof Date ? state.currentDate : new Date(state.currentDate);
const requestedProfileDate = process.env.FM_PROFILE_DATE;
const currentDate = requestedProfileDate
  // Keep the saved local time when profiling another calendar day. The game
  // compares fixtures with Date#toDateString, so a UTC-midnight override could
  // accidentally select the previous day on machines west/east of UTC.
  ? (() => {
      const [year, month, day] = requestedProfileDate.split('-').map(Number);
      assert.ok(year && month && day, 'FM_PROFILE_DATE musi mieć format RRRR-MM-DD');
      const profiledDate = new Date(savedCurrentDate);
      profiledDate.setFullYear(year, month - 1, day);
      return profiledDate;
    })()
  : savedCurrentDate;
const scheduledFixturesOnProfiledDay = fixtures.filter(fixture =>
  fixture.status !== 'FINISHED' && new Date(fixture.date).toDateString() === currentDate.toDateString()
).length;
const playerCountBefore = Object.values(state.players).reduce((total, squad) => total + squad.length, 0);

// This test runs the real production processor against a copy loaded into the
// Node process. Instrumentation is diagnostic only and never changes the save.
// Wrapping the service objects reveals which daily phase consumes the wall time
// instead of attributing every slowdown to the compressed file size.
PerfProfilerService.reset();
PerfProfilerService.instrument(AiContractService, 'AiContractService');
PerfProfilerService.instrument(AiMatchPreparationService, 'AiMatchPreparationService');
PerfProfilerService.instrument(ReserveTeamSquadMovementService, 'ReserveTeamSquadMovementService');

const processStartedAt = performance.now();
const result = BackgroundMatchProcessor.processLeagueEvent(
  currentDate,
  state.userTeamId,
  fixtures,
  state.clubs,
  state.players,
  state.lineups,
  state.seasonNumber,
  state.coaches,
  state.sessionSeed
);
const processMs = performance.now() - processStartedAt;
const playerCountAfter = Object.values(result.updatedPlayers).reduce((total, squad) => total + squad.length, 0);
const pendingSignature = Object.entries(result.updatedPlayers).flatMap(([sellerClubId, squad]) =>
  squad
    .filter(player => player.transferPendingClubId)
    .map(player => [
      sellerClubId,
      player.id,
      player.transferPendingClubId,
      player.transferReportDate,
      player.transferPendingSalary,
      player.transferPendingBonus,
      player.transferPendingContractYears,
    ].join('|'))
).sort();
const signatureHash = (values: string[]) => createHash('sha256').update(values.join('\n')).digest('hex');

assert.equal(playerCountAfter, playerCountBefore, 'profilowanie dnia nie może zgubić ani powielić zawodników');
console.log(JSON.stringify({
  savePath,
  date: currentDate.toISOString(),
  compressedMB: +(compressed.byteLength / 1_048_576).toFixed(2),
  decompressedMB: +(Buffer.byteLength(decompressed) / 1_048_576).toFixed(2),
  totalPlayers: playerCountBefore,
  freeAgents: state.players.FREE_AGENTS?.length ?? 0,
  fixtures: fixtures.length,
  scheduledFixturesOnProfiledDay,
  loadAndNormalizeMs: +loadMs.toFixed(1),
  normalizeMs: +normalizeMs.toFixed(1),
  backgroundDayMs: +processMs.toFixed(1),
  aiTransferLogCount: result.aiTransferLogEntries.length,
  aiTransferLogHash: signatureHash(result.aiTransferLogEntries.map(entry => entry.id).sort()),
  pendingTransferCount: pendingSignature.length,
  pendingTransferHash: signatureHash(pendingSignature),
  slowestServices: PerfProfilerService.report().slice(0, 30).map(row => ({
    label: row.label,
    calls: row.count,
    totalMs: +row.totalMs.toFixed(1),
    maxMs: +row.maxMs.toFixed(1),
  })),
}, null, 2));

console.log('RealSaveDayProfileTests: OK');
