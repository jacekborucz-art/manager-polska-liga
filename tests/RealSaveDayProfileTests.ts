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
const saveFileHash = createHash('sha256').update(compressed).digest('hex');
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

// A fixed test-only generator turns the real-save profile into a behavioural
// fingerprint. Performance refactors must preserve both the number and order
// of random draws, otherwise the hashes below change even when totals look sane.
let deterministicRandomState = 0x5f3759df;
const originalRandom = Math.random;
Math.random = () => {
  deterministicRandomState = (Math.imul(deterministicRandomState, 1664525) + 1013904223) >>> 0;
  return deterministicRandomState / 0x1_0000_0000;
};

// This test runs the real production processor against a copy loaded into the
// Node process. Instrumentation is diagnostic only and never changes the save.
// Wrapping the service objects reveals which daily phase consumes the wall time
// instead of attributing every slowdown to the compressed file size.
PerfProfilerService.reset();
PerfProfilerService.instrument(AiContractService, 'AiContractService');
PerfProfilerService.instrument(AiMatchPreparationService, 'AiMatchPreparationService');
PerfProfilerService.instrument(ReserveTeamSquadMovementService, 'ReserveTeamSquadMovementService');

const processStartedAt = performance.now();
const phaseTimings: Array<{ label: string; elapsedMs: number }> = [];
let result: ReturnType<typeof BackgroundMatchProcessor.processLeagueEvent>;
try {
  result = BackgroundMatchProcessor.processLeagueEvent(
    currentDate,
    state.userTeamId,
    fixtures,
    state.clubs,
    state.players,
    state.lineups,
    state.seasonNumber,
    state.coaches,
    state.sessionSeed,
    (label, elapsedMs) => phaseTimings.push({ label, elapsedMs })
  );
} finally {
  Math.random = originalRandom;
}
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
const freeAgentNegotiationSignature = (result.updatedPlayers.FREE_AGENTS ?? []).map(player => [
  player.id,
  player.aiNegotiationClubId ?? '',
  player.aiNegotiationResponseDate ?? '',
  player.transferPendingClubId ?? '',
].join('|'));
const scoutingCacheSignature = result.updatedClubs.map(club => [
  club.id,
  club.aiScoutedTargets?.lastRefreshDate ?? '',
  ...(club.aiScoutedTargets?.freeAgentIds ?? []),
].join('|'));
const aiTransferLogHash = signatureHash(result.aiTransferLogEntries.map(entry => entry.id).sort());
const pendingTransferHash = signatureHash(pendingSignature);
const freeAgentNegotiationHash = signatureHash(freeAgentNegotiationSignature);
const scoutingCacheHash = signatureHash(scoutingCacheSignature);

assert.equal(playerCountAfter, playerCountBefore, 'profilowanie dnia nie może zgubić ani powielić zawodników');
if (saveFileHash === '6fadc2f2e076bc20e074352231f808c715b4029c20901ae9175f83c364e3b9bd') {
  assert.equal(aiTransferLogHash, 'f786a686d1bf4c9755b299acc3f46ea05b2c59850bee4917ef86979c49e67d57');
  assert.equal(pendingTransferHash, 'e9ddd6ae4c30edfa170fd9886cddfd2099f4a42afab1f85560bbb6e5d1990e6f');
  assert.equal(freeAgentNegotiationHash, 'b4bfcb1da8bc39e7d190513ad8067ce071fbad74b4be51d236784bf6884df428');
  assert.equal(scoutingCacheHash, '2c6aff24528c9d6b79e80f3b00b6f5ce114bcb765cbb2d994e330553a4f09e52');
}
console.log(JSON.stringify({
  savePath,
  saveFileHash,
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
  aiTransferLogHash,
  pendingTransferCount: pendingSignature.length,
  pendingTransferHash,
  freeAgentNegotiationHash,
  scoutingCacheHash,
  processingPhases: phaseTimings
    .sort((left, right) => right.elapsedMs - left.elapsedMs)
    .map(phase => ({ label: phase.label, elapsedMs: +phase.elapsedMs.toFixed(1) })),
  slowestServices: PerfProfilerService.report().slice(0, 30).map(row => ({
    label: row.label,
    calls: row.count,
    totalMs: +row.totalMs.toFixed(1),
    maxMs: +row.maxMs.toFixed(1),
  })),
}, null, 2));

console.log('RealSaveDayProfileTests: OK');
