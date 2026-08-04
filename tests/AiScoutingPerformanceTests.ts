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
import { AiScoutingService } from '../services/AiScoutingService';
import { AiContractService } from '../services/AiContractService';
import { AiTransferDecisionService } from '../services/AiTransferDecisionService';
import { CoachService } from '../services/CoachService';
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import { ReserveTeamLeagueService } from '../services/ReserveTeamLeagueService';
import { SquadGeneratorService } from '../services/SquadGeneratorService';
import { Club, Player } from '../types';

/**
 * This regression test intentionally uses the full configured club world, not
 * a tiny synthetic sample. The July crash was caused by an accidental nested
 * world scan which looked harmless with a few clubs but grew catastrophically
 * with roughly 650 clubs and 20,000 players. A generous 20-second ceiling keeps
 * the test stable on slower development machines while still detecting the old
 * implementation, which required about 60 seconds for a single season refresh.
 */
const runFullWorldScoutingTest = (startYear: number): void => {
  const clubs: Club[] = [
    ...PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, startYear),
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

  const stalePlayer = Object.values(players).find(squad => squad.length > 0)?.[0];
  assert.ok(stalePlayer, 'the full-world fixture must contain at least one player');
  stalePlayer.interestedClubs = ['STALE_CLUB_ID'];

  /**
   * Reproduce the real career-start boundary in chronological order. Day one
   * performs the monthly market scan; day two performs contracts, squad cuts,
   * youth intake and transfer-list decisions without scanning the world again.
   * Keeping the complete chain in this test protects both the optimized search
   * and the scheduling decision which removed the duplicate July 2 pass.
   */
  const startedAt = performance.now();
  let updatedPlayers = AiScoutingService.updateTransferInterests(
    clubs,
    players,
    new Date(startYear, 6, 1),
    'PL_POLONIA_WARSZAWA',
    123456
  );
  let updatedClubs = clubs;
  let coaches = CoachService.generateInitialCoaches(clubs).coaches;
  const julySecond = new Date(startYear, 6, 2);

  coaches = AiTransferDecisionService.updateCoachFavorites(
    updatedClubs,
    updatedPlayers,
    coaches,
    julySecond,
    123456,
    'PL_POLONIA_WARSZAWA'
  );
  updatedPlayers = AiContractService.updateClubStars(
    updatedClubs,
    updatedPlayers,
    'PL_POLONIA_WARSZAWA',
    coaches,
    julySecond,
    123456
  );
  const squadReview = AiContractService.performSeasonSquadReview(
    updatedClubs,
    updatedPlayers,
    julySecond,
    'PL_POLONIA_WARSZAWA'
  );
  updatedClubs = squadReview.updatedClubs;
  updatedPlayers = squadReview.updatedPlayers;
  const contractCuts = AiContractService.processWeakPlayerContractCuts(
    updatedClubs,
    updatedPlayers,
    julySecond,
    'PL_POLONIA_WARSZAWA'
  );
  updatedClubs = contractCuts.updatedClubs;
  updatedPlayers = contractCuts.updatedPlayers;
  const youthIntake = AiContractService.generateSeasonYouthIntakeForAiClubs(
    updatedClubs,
    updatedPlayers,
    julySecond,
    'PL_POLONIA_WARSZAWA'
  );
  updatedClubs = youthIntake.updatedClubs;
  updatedPlayers = youthIntake.updatedPlayers;
  const seasonDecision = AiTransferDecisionService.processSeasonStart(
    updatedClubs,
    updatedPlayers,
    coaches,
    julySecond,
    'PL_POLONIA_WARSZAWA'
  );
  updatedPlayers = AiContractService.enforceTransferListLimits(
    seasonDecision.updatedPlayers,
    julySecond,
    'PL_POLONIA_WARSZAWA'
  );
  const elapsedMs = performance.now() - startedAt;
  const allUpdatedPlayers = Object.values(updatedPlayers).flat();
  const reserveClubIds = new Set(
    clubs.filter(club => ReserveTeamLeagueService.isReserveClub(club.id)).map(club => club.id)
  );

  assert.ok(
    elapsedMs < 20_000,
    `full-world scouting for ${startYear} took ${Math.round(elapsedMs)}ms; the July OOM regression may have returned`
  );
  assert.equal(
    allUpdatedPlayers.find(player => player.id === stalePlayer.id)?.interestedClubs?.includes('STALE_CLUB_ID') ?? false,
    false,
    'a monthly refresh must remove stale transfer interests'
  );
  assert.equal(
    allUpdatedPlayers.every(player => (player.interestedClubs?.length ?? 0) <= 10),
    true,
    'one player may be observed by at most ten clubs'
  );
  assert.equal(
    allUpdatedPlayers.every(player => (
      player.interestedClubs ?? []
    ).every(clubId => clubId !== player.clubId && !reserveClubIds.has(clubId))),
    true,
    'a club may not scout its own player and reserve teams may not become transfer buyers'
  );

  console.log(`AiScoutingPerformanceTests ${startYear}: ${Math.round(elapsedMs)}ms`);
};

runFullWorldScoutingTest(2025);
runFullWorldScoutingTest(2026);
console.log('AiScoutingPerformanceTests: OK');
