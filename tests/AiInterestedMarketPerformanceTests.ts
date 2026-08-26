import { strict as assert } from 'node:assert';
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
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import { ReserveTeamLeagueService } from '../services/ReserveTeamLeagueService';
import { SquadGeneratorService } from '../services/SquadGeneratorService';
import { Club, Player } from '../types';

const USER_CLUB_ID = 'PL_POLONIA_WARSZAWA';
const TEST_DATE = new Date(2026, 7, 11);

/**
 * This test deliberately creates the complete configured world. A small unit
 * fixture cannot detect a regression where every AI buyer rebuilds and parses
 * the full contracted-player market separately.
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
const players: Record<string, Player[]> = Object.fromEntries(
  clubs.map(club => [club.id, SquadGeneratorService.generateSquadForClub(club.id, club)])
);
const coaches = CoachService.generateInitialCoaches(clubs).coaches;
const playerCountBefore = Object.values(players).reduce((sum, squad) => sum + squad.length, 0);

const runWithControlledRandom = (seed: number) => {
  const originalRandom = Math.random;
  let state = seed >>> 0;
  let randomCalls = 0;
  Math.random = () => {
    randomCalls += 1;
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };

  try {
    const startedAt = performance.now();
    const result = AiContractService.processAiInterestedPlayerTargeting(
      clubs,
      players,
      TEST_DATE,
      USER_CLUB_ID,
      coaches
    );
    return { result, randomCalls, elapsedMs: performance.now() - startedAt };
  } finally {
    Math.random = originalRandom;
  }
};

const first = runWithControlledRandom(0x51a7c0de);
const second = runWithControlledRandom(0x51a7c0de);

const summarizePendingTransfers = (world: Record<string, Player[]>) =>
  Object.values(world)
    .flat()
    .filter(player => !!player.transferPendingClubId)
    .map(player => ({
      id: player.id,
      targetClubId: player.transferPendingClubId,
      reportDate: player.transferReportDate,
      fee: player.transferPendingFee,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));

const playerCountAfter = Object.values(first.result.updatedPlayers).reduce(
  (sum, squad) => sum + squad.length,
  0
);
const reserveClubIds = new Set(
  clubs.filter(club => ReserveTeamLeagueService.isReserveClub(club.id)).map(club => club.id)
);

assert.ok(
  first.elapsedMs < 5_000,
  `full-world interested-player targeting took ${Math.round(first.elapsedMs)}ms`
);
assert.equal(playerCountAfter, playerCountBefore, 'market targeting must not duplicate or remove players');
assert.ok(first.randomCalls > 0, 'the performance fixture must exercise prestige RNG traversal');
assert.equal(first.randomCalls, second.randomCalls, 'identical worlds must consume the same number of RNG draws');
assert.deepEqual(
  summarizePendingTransfers(first.result.updatedPlayers),
  summarizePendingTransfers(second.result.updatedPlayers),
  'a controlled RNG stream must produce identical transfer decisions'
);
assert.deepEqual(
  first.result.logEntries,
  second.result.logEntries,
  'a controlled RNG stream must produce identical transfer logs'
);
assert.equal(
  summarizePendingTransfers(first.result.updatedPlayers).some(transfer =>
    !!transfer.targetClubId && reserveClubIds.has(transfer.targetClubId)
  ),
  false,
  'reserve teams must remain excluded as paid-transfer buyers'
);

console.log(
  `AiInterestedMarketPerformanceTests: ${Math.round(first.elapsedMs)}ms, ` +
  `${clubs.length} clubs, ${playerCountAfter} players, ${first.randomCalls} RNG draws`
);
console.log('AiInterestedMarketPerformanceTests: OK');
