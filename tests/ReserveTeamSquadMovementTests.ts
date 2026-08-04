import { strict as assert } from 'node:assert';
import { STATIC_CLUBS } from '../constants';
import { PolishLeagueSeasonService } from '../services/PolishLeagueSeasonService';
import { ReserveTeamSquadMovementService } from '../services/ReserveTeamSquadMovementService';
import { Club, HealthStatus, Player, PlayerPosition, Region } from '../types';

const emptyStats = (matchesPlayed = 0, minutesPlayed = 0) => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  cleanSheets: 0,
  matchesPlayed,
  minutesPlayed,
  seasonalChanges: {},
  ratingHistory: [],
});

/**
 * The movement service intentionally reads only normal Player fields. This
 * focused fixture supplies the complete runtime subset while using a type cast
 * for unrelated attributes, keeping failures tied to squad-movement behavior
 * instead of the much larger player-generation system.
 */
const makePlayer = (options: {
  id: string;
  clubId: string;
  position: PlayerPosition;
  overall?: number;
  age?: number;
  healthStatus?: HealthStatus;
  isOnTransferList?: boolean;
  isAvailableForLoan?: boolean;
  firstTeamSurplusSince?: string | null;
  lastInternalSquadMoveDate?: string | null;
  matchesPlayed?: number;
  minutesPlayed?: number;
}): Player => ({
  id: options.id,
  firstName: 'Test',
  lastName: options.id,
  age: options.age ?? 24,
  clubId: options.clubId,
  nationality: Region.POLAND,
  position: options.position,
  overallRating: options.overall ?? 60,
  attributes: {} as Player['attributes'],
  stats: emptyStats(options.matchesPlayed, options.minutesPlayed),
  health: { status: options.healthStatus ?? HealthStatus.HEALTHY },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: '2030-06-30T00:00:00.000Z',
  annualSalary: 100_000,
  history: [{
    clubName: options.clubId,
    clubId: options.clubId,
    fromYear: 2025,
    fromMonth: 7,
    toYear: null,
    toMonth: null,
  }],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  isOnTransferList: options.isOnTransferList,
  isAvailableForLoan: options.isAvailableForLoan,
  interestedClubs: [],
  firstTeamSurplusSince: options.firstTeamSurplusSince ?? null,
  lastInternalSquadMoveDate: options.lastInternalSquadMoveDate ?? null,
});

const buildSquad = (
  clubId: string,
  counts: Record<PlayerPosition, number>,
  overall = 65
): Player[] => Object.entries(counts).flatMap(([position, count]) =>
  Array.from({ length: count }, (_, index) => makePlayer({
    id: `${clubId}_${position}_${index}`,
    clubId,
    position: position as PlayerPosition,
    overall,
  }))
);

const buildLegiaPair = (): { clubs: Club[]; parent: Club; reserve: Club } => {
  const seasonClubs = PolishLeagueSeasonService.buildClubsForCareerStart(STATIC_CLUBS, 2026);
  const parentSource = seasonClubs.find(club => club.id === 'PL_LEGIA_WARSZAWA');
  const reserveSource = seasonClubs.find(club => club.id === 'PL_LEGIA_WARSZAWA_II');
  assert.ok(parentSource && reserveSource, 'Legia parent/reserve test pair must exist in the 2026 database');

  const parent = { ...parentSource, rosterIds: [], stats: { ...parentSource.stats, played: 10 } };
  const reserve = { ...reserveSource, rosterIds: [], stats: { ...reserveSource.stats, played: 10 } };
  return { clubs: [parent, reserve], parent, reserve };
};

const parentMinimumCounts: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 3,
  [PlayerPosition.DEF]: 8,
  [PlayerPosition.MID]: 8,
  [PlayerPosition.FWD]: 4,
};

const reserveMinimumCounts: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 2,
  [PlayerPosition.DEF]: 5,
  [PlayerPosition.MID]: 5,
  [PlayerPosition.FWD]: 3,
};

// SELF-TEST 1: a structural monthly shortage promotes exactly one player and
// the persisted month key prevents a second move when the same day is replayed.
{
  const { clubs, parent, reserve } = buildLegiaPair();
  const parentSquad = buildSquad(parent.id, { ...parentMinimumCounts, [PlayerPosition.GK]: 2 });
  const reserveSquad = buildSquad(reserve.id, { ...reserveMinimumCounts, [PlayerPosition.GK]: 3 }, 58);
  const date = new Date('2026-09-01T12:00:00.000Z');

  const firstRun = ReserveTeamSquadMovementService.processDailyAiMovements(
    clubs,
    { [parent.id]: parentSquad, [reserve.id]: reserveSquad },
    date,
    null
  );
  assert.equal(firstRun.movements.length, 1, 'monthly review should execute one internal move');
  assert.equal(firstRun.movements[0].reason, 'MONTHLY_CALL_UP');
  assert.equal(firstRun.movements[0].position, PlayerPosition.GK);
  assert.equal(firstRun.updatedPlayers[parent.id].filter(player => player.position === PlayerPosition.GK).length, 3);
  assert.equal(firstRun.updatedClubs.find(club => club.id === parent.id)?.reserveSquadLastReviewMonth, '2026-09');
  const promoted = firstRun.updatedPlayers[parent.id].find(player => player.lastInternalSquadMoveDirection === 'TO_FIRST_TEAM');
  assert.equal(promoted?.history.at(-1)?.movementType, 'INTERNAL_RESERVE');
  assert.equal(promoted?.clubAdaptation, null, 'an internal move must not start club adaptation');

  const replay = ReserveTeamSquadMovementService.processDailyAiMovements(
    firstRun.updatedClubs,
    firstRun.updatedPlayers,
    date,
    null
  );
  assert.equal(replay.movements.length, 0, 'the same monthly review must be idempotent');
}

// SELF-TEST 2: a match-day availability crisis bypasses the monthly date, but
// another unresolved positional crisis cannot pull a second player the next day
// because the pair-level emergency cooldown is 14 days.
{
  const { clubs, parent, reserve } = buildLegiaPair();
  const parentSquad = buildSquad(parent.id, parentMinimumCounts);
  parentSquad
    .filter(player => player.position === PlayerPosition.FWD)
    .forEach(player => { player.health = { status: HealthStatus.INJURED }; });
  const reserveSquad = buildSquad(reserve.id, { ...reserveMinimumCounts, [PlayerPosition.FWD]: 4 }, 57);

  const emergency = ReserveTeamSquadMovementService.processDailyAiMovements(
    clubs,
    { [parent.id]: parentSquad, [reserve.id]: reserveSquad },
    new Date('2026-09-15T12:00:00.000Z'),
    null
  );
  assert.equal(emergency.movements.length, 1);
  assert.equal(emergency.movements[0].reason, 'EMERGENCY_CALL_UP');
  assert.equal(emergency.movements[0].position, PlayerPosition.FWD);

  const nextDay = ReserveTeamSquadMovementService.processDailyAiMovements(
    emergency.updatedClubs,
    emergency.updatedPlayers,
    new Date('2026-09-16T12:00:00.000Z'),
    null
  );
  assert.equal(nextDay.movements.length, 0, 'emergency cooldown must block repeated daily call-ups');
}

// SELF-TEST 3: an unused listed player first receives a market-exposure date.
// Only the next monthly review, after at least 30 days without interest, may send
// him down. His market availability remains active after the internal move.
{
  const { clubs, parent, reserve } = buildLegiaPair();
  const parentSquad = buildSquad(parent.id, { ...parentMinimumCounts, [PlayerPosition.FWD]: 5 }, 67);
  const surplusPlayer = parentSquad.find(player => player.position === PlayerPosition.FWD)!;
  surplusPlayer.overallRating = 54;
  surplusPlayer.isOnTransferList = true;
  surplusPlayer.isAvailableForLoan = true;
  const reserveSquad = buildSquad(reserve.id, reserveMinimumCounts, 48);

  const exposureStart = ReserveTeamSquadMovementService.processDailyAiMovements(
    clubs,
    { [parent.id]: parentSquad, [reserve.id]: reserveSquad },
    new Date('2026-09-01T12:00:00.000Z'),
    null
  );
  assert.equal(exposureStart.movements.length, 0, 'the first review must give the market time to react');
  assert.ok(
    exposureStart.updatedPlayers[parent.id].find(player => player.id === surplusPlayer.id)?.firstTeamSurplusSince,
    'the first eligible review must start the market-exposure timer'
  );

  const demotion = ReserveTeamSquadMovementService.processDailyAiMovements(
    exposureStart.updatedClubs,
    exposureStart.updatedPlayers,
    new Date('2026-10-01T12:00:00.000Z'),
    null
  );
  assert.equal(demotion.movements.length, 1);
  assert.equal(demotion.movements[0].reason, 'MONTHLY_DEMOTION');
  const demoted = demotion.updatedPlayers[reserve.id].find(player => player.id === surplusPlayer.id);
  assert.ok(demoted, 'the unused player must move into the linked reserve squad');
  assert.equal(demoted?.isOnTransferList, true, 'reserve assignment must not cancel an ongoing sale attempt');
  assert.equal(demoted?.isAvailableForLoan, true, 'reserve assignment must not cancel an ongoing loan attempt');

  const cooldownReview = ReserveTeamSquadMovementService.processDailyAiMovements(
    demotion.updatedClubs,
    demotion.updatedPlayers,
    new Date('2026-11-01T12:00:00.000Z'),
    null
  );
  assert.ok(
    cooldownReview.updatedPlayers[reserve.id].some(player => player.id === surplusPlayer.id),
    'the 60-day player cooldown must prevent an immediate call-up after demotion'
  );
}

// SELF-TEST 4: pairs involving the user-controlled club are deliberately left
// untouched until the separate user `reserves` array is explicitly unified with
// database reserve clubs such as Legia II.
{
  const { clubs, parent, reserve } = buildLegiaPair();
  const parentSquad = buildSquad(parent.id, { ...parentMinimumCounts, [PlayerPosition.GK]: 2 });
  const reserveSquad = buildSquad(reserve.id, { ...reserveMinimumCounts, [PlayerPosition.GK]: 3 });
  const skipped = ReserveTeamSquadMovementService.processDailyAiMovements(
    clubs,
    { [parent.id]: parentSquad, [reserve.id]: reserveSquad },
    new Date('2026-09-01T12:00:00.000Z'),
    parent.id
  );
  assert.equal(skipped.movements.length, 0);
  assert.equal(skipped.updatedClubs.find(club => club.id === parent.id)?.reserveSquadLastReviewMonth, undefined);
}

console.log('ReserveTeamSquadMovementTests: OK');
