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
import { BackgroundMatchProcessorPolishCup } from '../services/BackgroundMatchProcessorPolishCup';
import { BackgroundMatchProcessor } from '../services/BackgroundMatchProcessor';
import { CoachService } from '../services/CoachService';
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import { SquadGeneratorService } from '../services/SquadGeneratorService';
import { SuperCupService } from '../services/SuperCupService';
import { Club, MatchStatus, Player } from '../types';

const USER_CLUB_ID = 'PL_POLONIA_WARSZAWA';

/**
 * Reproduce the exact reported path: a 2025/26 career, a user club which does
 * not participate in the Polish Super Cup, and an AI-versus-AI result shown on
 * 12 July. The complete configured world is intentional because the regression
 * was invisible with a two-club fixture even though only two clubs should ever
 * be prepared by the cup processor.
 */
const clubs: Club[] = [
  ...PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2025),
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
const fixture = SuperCupService.generateFixture(2025, clubs);
const participantIds = new Set([fixture.homeTeamId, fixture.awayTeamId]);

assert.equal(participantIds.has(USER_CLUB_ID), false, 'the user club must be an observer in this regression scenario');
assert.equal(fixture.date.getMonth(), 6, 'the Polish Super Cup must be scheduled in July');
assert.equal(fixture.date.getDate(), 12, 'the Polish Super Cup must be scheduled on 12 July');

const playerCountBefore = Object.values(players).reduce((sum, squad) => sum + squad.length, 0);
const coaches = CoachService.generateInitialCoaches(clubs).coaches;
const startedAt = performance.now();
const result = BackgroundMatchProcessorPolishCup.processCupEvent(
  new Date(2025, 6, 12),
  USER_CLUB_ID,
  [fixture],
  clubs,
  players,
  {},
  123456,
  1
);
const elapsedMs = performance.now() - startedAt;
const finishedFixture = result.updatedFixtures.find(candidate => candidate.id === fixture.id);
const preparedClubIds = Object.keys(result.updatedLineups);
const playerCountAfter = Object.values(result.updatedPlayers).reduce((sum, squad) => sum + squad.length, 0);

assert.equal(finishedFixture?.status, MatchStatus.FINISHED, 'the background Super Cup must produce a finished result');
assert.ok(finishedFixture?.homeScore !== null && finishedFixture?.awayScore !== null, 'the finished result must contain a score');
assert.equal(playerCountAfter, playerCountBefore, 'the background Super Cup must not duplicate or lose players');
assert.deepEqual(
  new Set(preparedClubIds),
  participantIds,
  'lineup preparation must be limited to the two Super Cup participants'
);
assert.ok(
  elapsedMs < 3_000,
  `background Polish Super Cup took ${Math.round(elapsedMs)}ms; full-world lineup preparation may have returned`
);

/**
 * Clicking Continue processes the same calendar date once more through the
 * normal daily pipeline. If the cup fixture is already finished, the cup
 * processor must be a true no-op and return the existing lineup map by identity
 * instead of cloning or rebuilding hundreds of clubs behind the result screen.
 */
const replay = BackgroundMatchProcessorPolishCup.processCupEvent(
  new Date(2025, 6, 12),
  USER_CLUB_ID,
  result.updatedFixtures,
  result.updatedClubs,
  result.updatedPlayers,
  result.updatedLineups,
  123456,
  1
);
assert.equal(replay.updatedLineups, result.updatedLineups, 'an already-finished Super Cup must not rebuild lineups');
assert.equal(replay.updatedPlayers, result.updatedPlayers, 'an already-finished Super Cup must not rebuild the player world');

/**
 * Finally reproduce the Continue button's expensive part: the regular daily AI
 * pipeline runs for 12 July after the result screen closes. Keeping this call in
 * the regression test ensures the small two-team cup result and the following
 * full-world market pass fit safely in one process, which is the exact sequence
 * that previously exhausted the browser heap.
 */
const continueStartedAt = performance.now();
const continuedDay = BackgroundMatchProcessor.processLeagueEvent(
  new Date(2025, 6, 12),
  USER_CLUB_ID,
  result.updatedFixtures,
  result.updatedClubs,
  result.updatedPlayers,
  result.updatedLineups,
  1,
  coaches,
  123456
);
const continueElapsedMs = performance.now() - continueStartedAt;
assert.ok(
  continueElapsedMs < 8_000,
  `continuing after the Polish Super Cup took ${Math.round(continueElapsedMs)}ms; the post-result regression may have returned`
);
assert.equal(
  continuedDay.updatedFixtures.find(candidate => candidate.id === fixture.id)?.status,
  MatchStatus.FINISHED,
  'the normal daily pipeline must preserve the finished Super Cup result'
);

console.log(`PolishSuperCupBackgroundPerformanceTests: cup ${Math.round(elapsedMs)}ms, continue ${Math.round(continueElapsedMs)}ms, ${clubs.length} clubs, ${playerCountAfter} players`);
console.log('PolishSuperCupBackgroundPerformanceTests: OK');
