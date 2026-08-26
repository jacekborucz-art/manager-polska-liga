import { strict as assert } from 'node:assert';
import { gzipSync } from 'node:zlib';
import {
  STATIC_AFRICAN_CLUBS,
  STATIC_ASIAN_CLUBS,
  STATIC_CLUBS,
  STATIC_CL_CLUBS,
  STATIC_CONF_CLUBS,
  STATIC_EL_CLUBS,
  STATIC_NA_CLUBS,
  STATIC_SA_CLUBS,
} from '../constants';
import { AiContractService } from '../services/AiContractService';
import { CoachService } from '../services/CoachService';
import { EuropeanPlayerStatsService } from '../services/EuropeanPlayerStatsService';
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import { PrestigeTransferGuardService } from '../services/PrestigeTransferGuardService';
import { ReserveTeamLeagueService } from '../services/ReserveTeamLeagueService';
import { SaveState, serializeSaveState } from '../services/SaveGameService';
import { SquadGeneratorService } from '../services/SquadGeneratorService';
import { Club, Player } from '../types';

const USER_CLUB_ID = 'PL_POLONIA_WARSZAWA';
const FOREIGN_BACKGROUND_LEAGUE_IDS = new Set(['L_CL', 'L_EL', 'L_CONF', 'L_SA', 'L_ASIA', 'L_AFRICA', 'L_NA']);

/**
 * Reproduce the high-load work which meets immediately after the Polish Super
 * Cup: the open summer transfer market and the 15 July foreign-statistics pass.
 * A small fixture would not expose the old candidate-by-candidate squad sorts,
 * therefore this test deliberately creates the complete configured game world.
 */
const clubs: Club[] = [
  ...PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2026),
  ...STATIC_CL_CLUBS,
  ...STATIC_EL_CLUBS,
  ...STATIC_CONF_CLUBS,
  ...STATIC_SA_CLUBS,
  ...STATIC_ASIAN_CLUBS,
  ...STATIC_AFRICAN_CLUBS,
  ...STATIC_NA_CLUBS,
];
let players: Record<string, Player[]> = Object.fromEntries(
  clubs.map(club => [club.id, SquadGeneratorService.generateSquadForClub(club.id, club)])
);
let updatedClubs = clubs;
const coaches = CoachService.generateInitialCoaches(clubs).coaches;
const julyFifteenth = new Date(2026, 6, 15);
const playerCountBefore = Object.values(players).reduce((sum, squad) => sum + squad.length, 0);
const startedAt = performance.now();
const phaseTimings: Record<string, number> = {};
let prestigeAssessmentCount = 0;
const originalEvaluateDestination = PrestigeTransferGuardService.evaluateDestination;
PrestigeTransferGuardService.evaluateDestination = (...args) => {
  prestigeAssessmentCount += 1;
  return originalEvaluateDestination(...args);
};

const measurePhase = <T>(label: string, run: () => T): T => {
  const phaseStartedAt = performance.now();
  const result = run();
  phaseTimings[label] = performance.now() - phaseStartedAt;
  return result;
};

// Use the same service order as BackgroundMatchProcessor. Recruitment refreshes
// each club's compact scouting cache before paid-transfer targeting consumes it.
const recruitment = measurePhase('free-agent recruitment', () =>
  AiContractService.processAiRecruitment(
    updatedClubs,
    players,
    julyFifteenth,
    USER_CLUB_ID
  )
);
updatedClubs = recruitment.updatedClubs;
players = recruitment.updatedPlayers;

const transferList = measurePhase('transfer-list signings', () =>
  AiContractService.processAiTransferListSignings(
    updatedClubs,
    players,
    julyFifteenth,
    USER_CLUB_ID,
    coaches
  )
);
updatedClubs = transferList.updatedClubs;
players = transferList.updatedPlayers;

const interestedTargeting = measurePhase('interested-player targeting', () =>
  AiContractService.processAiInterestedPlayerTargeting(
    updatedClubs,
    players,
    julyFifteenth,
    USER_CLUB_ID,
    coaches
  )
);
updatedClubs = interestedTargeting.updatedClubs;
players = interestedTargeting.updatedPlayers;

// The production code performs this update on the local postReviewPlayers map
// and commits it once at the end of advanceDay. This loop measures the actual
// statistics calculation without introducing an artificial React state copy.
players = measurePhase('foreign background statistics', () => {
  const refreshedPlayers = { ...players };
  for (const club of updatedClubs) {
    if (!FOREIGN_BACKGROUND_LEAGUE_IDS.has(club.leagueId) || club.country === 'POL') continue;
    const squad = players[club.id];
    if (!squad?.length) continue;
    refreshedPlayers[club.id] = EuropeanPlayerStatsService.applyBackgroundLeagueStatsToDate(
      squad,
      club,
      julyFifteenth,
      julyFifteenth.getFullYear()
    );
  }
  return refreshedPlayers;
});

const elapsedMs = performance.now() - startedAt;
console.log('JulyPostSuperCupPerformanceTests phases:', Object.fromEntries(
  Object.entries(phaseTimings).map(([label, milliseconds]) => [label, `${Math.round(milliseconds)}ms`])
));
console.log(`JulyPostSuperCupPerformanceTests prestige assessments: ${prestigeAssessmentCount}`);
const playerCountAfter = Object.values(players).reduce((sum, squad) => sum + squad.length, 0);
const reserveClubIds = new Set(
  updatedClubs.filter(club => ReserveTeamLeagueService.isReserveClub(club.id)).map(club => club.id)
);
const allPlayers = Object.values(players).flat();

assert.ok(
  elapsedMs < 10_000,
  `post-Super-Cup full-world processing took ${Math.round(elapsedMs)}ms; the July memory/performance regression may have returned`
);
assert.equal(playerCountAfter, playerCountBefore, 'the market/statistics pass must not duplicate or lose players');
assert.equal(
  allPlayers.some(player => player.transferPendingClubId && reserveClubIds.has(player.transferPendingClubId)),
  false,
  'reserve teams must remain excluded as paid-transfer buyers after market optimization'
);

// Reapplying the same date must not award a second synthetic league round. This
// protects SAVE reload/retry flows and verifies that removing intermediate form
// recalculations did not alter the persisted progress guard.
const sampleClub = updatedClubs.find(club =>
  FOREIGN_BACKGROUND_LEAGUE_IDS.has(club.leagueId) && club.country !== 'POL' && (players[club.id]?.length ?? 0) > 0
);
assert.ok(sampleClub, 'the full-world test must contain a foreign background club');
const sampleSquad = players[sampleClub.id];
const repeatedSquad = EuropeanPlayerStatsService.applyBackgroundLeagueStatsToDate(
  sampleSquad,
  sampleClub,
  julyFifteenth,
  julyFifteenth.getFullYear()
);
assert.deepEqual(
  repeatedSquad.map(player => player.stats?.backgroundLeagueProgress ?? {}),
  sampleSquad.map(player => player.stats?.backgroundLeagueProgress ?? {}),
  'processing 15 July twice must not advance foreign league progress twice'
);

// SAVE wykonywany po 14 lipca nie może ponownie materializować historii
// wszystkich zawodników ani tworzyć pliku o rozmiarze setek megabajtów.
const saveStartedAt = performance.now();
const serializedSave = serializeSaveState({
  currentDate: julyFifteenth,
  clubs: updatedClubs,
  players,
  userTeamId: USER_CLUB_ID,
  seasonNumber: 2,
} as unknown as SaveState, julyFifteenth);
const saveElapsedMs = performance.now() - saveStartedAt;
const saveSizeMb = Buffer.byteLength(serializedSave) / 1_048_576;
const compressedSaveSizeMb = gzipSync(serializedSave).byteLength / 1_048_576;
assert.ok(saveElapsedMs < 4_000, `15 July SAVE serialization took ${Math.round(saveElapsedMs)}ms`);
assert.ok(saveSizeMb < 50, `15 July compact SAVE payload grew to ${saveSizeMb.toFixed(2)} MB`);
assert.ok(compressedSaveSizeMb < 10, `15 July GZIP SAVE grew to ${compressedSaveSizeMb.toFixed(2)} MB`);

console.log(`JulyPostSuperCupPerformanceTests: ${Math.round(elapsedMs)}ms, SAVE ${saveSizeMb.toFixed(2)} MB -> ${compressedSaveSizeMb.toFixed(2)} MB GZIP/${Math.round(saveElapsedMs)}ms, ${clubs.length} clubs, ${playerCountAfter} players`);
console.log('JulyPostSuperCupPerformanceTests: OK');
