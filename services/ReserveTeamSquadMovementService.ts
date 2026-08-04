import { Club, HealthStatus, Player, PlayerPosition } from '../types';
import { PlayerCareerService } from './PlayerCareerService';
import { ReserveTeamLeagueService } from './ReserveTeamLeagueService';

export type InternalSquadMovementDirection = 'TO_FIRST_TEAM' | 'TO_RESERVES';
export type InternalSquadMovementReason = 'EMERGENCY_CALL_UP' | 'MONTHLY_CALL_UP' | 'MONTHLY_DEMOTION';

export interface InternalSquadMovement {
  playerId: string;
  playerName: string;
  parentClubId: string;
  reserveClubId: string;
  sourceClubId: string;
  destinationClubId: string;
  direction: InternalSquadMovementDirection;
  reason: InternalSquadMovementReason;
  position: PlayerPosition;
  date: string;
}

export interface ReserveSquadMovementResult {
  updatedClubs: Club[];
  updatedPlayers: Record<string, Player[]>;
  movements: InternalSquadMovement[];
}

/**
 * First-team depth is intentionally aligned with the AI transfer service.
 * Internal call-ups must solve the same shortages that would otherwise trigger
 * an external signing, while reserve-team minimums are lower because reserve
 * squads in the Polish database are deliberately smaller than senior squads.
 */
const FIRST_TEAM_MINIMUMS: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 3,
  [PlayerPosition.DEF]: 8,
  [PlayerPosition.MID]: 8,
  [PlayerPosition.FWD]: 4,
};

const RESERVE_TEAM_MINIMUMS: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 2,
  [PlayerPosition.DEF]: 5,
  [PlayerPosition.MID]: 5,
  [PlayerPosition.FWD]: 3,
};

/**
 * Emergency thresholds count only players who can actually play today. They
 * are lower than structural squad minimums because this branch represents a
 * match-day crisis rather than long-term squad planning.
 */
const EMERGENCY_AVAILABLE_MINIMUMS: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 1,
  [PlayerPosition.DEF]: 4,
  [PlayerPosition.MID]: 4,
  [PlayerPosition.FWD]: 2,
};

const FIRST_TEAM_TARGET_SIZE = 28;
const INTERNAL_MOVE_COOLDOWN_DAYS = 60;
const EMERGENCY_CALL_UP_COOLDOWN_DAYS = 14;
const SURPLUS_MARKET_EXPOSURE_DAYS = 30;
const MS_PER_DAY = 86_400_000;

const POSITIONS: PlayerPosition[] = [
  PlayerPosition.GK,
  PlayerPosition.DEF,
  PlayerPosition.MID,
  PlayerPosition.FWD,
];

const toDayStart = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const toMonthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const daysSince = (isoDate: string | null | undefined, currentDate: Date): number => {
  if (!isoDate) return Number.POSITIVE_INFINITY;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return Number.POSITIVE_INFINITY;
  return Math.floor((toDayStart(currentDate).getTime() - toDayStart(parsed).getTime()) / MS_PER_DAY);
};

const countByPosition = (
  squad: Player[],
  predicate: (player: Player) => boolean = () => true
): Record<PlayerPosition, number> => {
  const counts: Record<PlayerPosition, number> = {
    [PlayerPosition.GK]: 0,
    [PlayerPosition.DEF]: 0,
    [PlayerPosition.MID]: 0,
    [PlayerPosition.FWD]: 0,
  };
  squad.forEach(player => {
    if (predicate(player)) counts[player.position] += 1;
  });
  return counts;
};

const isAvailableToday = (player: Player): boolean =>
  !player.loan &&
  player.health?.status !== HealthStatus.INJURED &&
  (player.suspensionMatches ?? 0) <= 0;

const hasActiveExternalTransferLock = (player: Player, currentDate: Date): boolean => {
  if (!player.transferLockoutUntil) return false;
  const lockDate = new Date(player.transferLockoutUntil);
  return !Number.isNaN(lockDate.getTime()) && currentDate < lockDate;
};

/**
 * Shared eligibility check for both directions. Pending market transactions,
 * active loans and recently moved players are never touched. The 60-day
 * internal cooldown is the main anti-oscillation rule: without it, the monthly
 * strength comparison could move the same player down and immediately back up
 * after one squad's weakest-player baseline changed.
 */
const canMoveInternally = (player: Player, currentDate: Date, requireAvailability: boolean): boolean => {
  if (player.loan || player.transferPendingClubId || player.aiNegotiationClubId) return false;
  if (hasActiveExternalTransferLock(player, currentDate)) return false;
  if (daysSince(player.lastInternalSquadMoveDate, currentDate) < INTERNAL_MOVE_COOLDOWN_DAYS) return false;
  if (requireAvailability && !isAvailableToday(player)) return false;

  const contractEnd = new Date(player.contractEndDate);
  if (!Number.isNaN(contractEnd.getTime()) && contractEnd < toDayStart(currentDate)) return false;
  return true;
};

const averageRecentRating = (player: Player): number => {
  const ratings = player.stats?.ratingHistory ?? [];
  if (ratings.length === 0) return 0;
  const recent = ratings.slice(-5);
  return recent.reduce((sum, rating) => sum + rating, 0) / recent.length;
};

const promotionScore = (player: Player): number =>
  player.overallRating * 100 +
  averageRecentRating(player) * 10 +
  Math.max(0, 24 - player.age) * 2;

const sortPromotionCandidates = (candidates: Player[]): Player[] =>
  [...candidates].sort((a, b) =>
    promotionScore(b) - promotionScore(a) || a.id.localeCompare(b.id)
  );

const getShortagePositions = (
  squad: Player[],
  minimums: Record<PlayerPosition, number>,
  availableOnly: boolean
): PlayerPosition[] => {
  const counts = countByPosition(squad, availableOnly ? isAvailableToday : () => true);
  return POSITIONS
    .filter(position => counts[position] < minimums[position])
    .sort((a, b) =>
      (minimums[b] - counts[b]) - (minimums[a] - counts[a]) ||
      POSITIONS.indexOf(a) - POSITIONS.indexOf(b)
    );
};

const reserveCanReleasePosition = (
  reserveSquad: Player[],
  position: PlayerPosition,
  minimums: Record<PlayerPosition, number>
): boolean => countByPosition(reserveSquad)[position] > minimums[position];

const findCallUpForPositions = (
  reserveSquad: Player[],
  shortagePositions: PlayerPosition[],
  currentDate: Date,
  reserveMinimums: Record<PlayerPosition, number>
): Player | null => {
  for (const position of shortagePositions) {
    if (!reserveCanReleasePosition(reserveSquad, position, reserveMinimums)) continue;
    const candidate = sortPromotionCandidates(
      reserveSquad.filter(player =>
        player.position === position && canMoveInternally(player, currentDate, true)
      )
    )[0];
    if (candidate) return candidate;
  }
  return null;
};

/**
 * When there is no strict positional shortage, a monthly review may still
 * promote a clearly superior prospect. The threshold is deliberately high so
 * reserve teams are not continuously stripped merely because one player is one
 * rating point better than a senior substitute.
 */
const findStandoutMonthlyCallUp = (
  firstTeamSquad: Player[],
  reserveSquad: Player[],
  currentDate: Date
): Player | null => {
  if (firstTeamSquad.length >= FIRST_TEAM_TARGET_SIZE) return null;

  const reserveCounts = countByPosition(reserveSquad);
  const candidates = reserveSquad.filter(player => {
    if (!canMoveInternally(player, currentDate, true)) return false;
    if (reserveCounts[player.position] <= RESERVE_TEAM_MINIMUMS[player.position]) return false;
    const samePosition = firstTeamSquad.filter(firstPlayer => firstPlayer.position === player.position);
    if (samePosition.length === 0) return true;
    const weakestOverall = Math.min(...samePosition.map(firstPlayer => firstPlayer.overallRating));
    return player.overallRating >= weakestOverall + (player.age <= 23 ? 2 : 4);
  });

  return sortPromotionCandidates(candidates)[0] ?? null;
};

const hasNoMarketInterest = (player: Player): boolean =>
  (player.isOnTransferList || player.isAvailableForLoan) &&
  (player.interestedClubs?.length ?? 0) === 0 &&
  !player.transferPendingClubId &&
  !player.aiNegotiationClubId;

const isRarelyUsedByFirstTeam = (player: Player, parentClub: Club): boolean => {
  const clubMatches = Math.max(1, parentClub.stats?.played ?? 0);
  const appearanceShare = (player.stats?.matchesPlayed ?? 0) / clubMatches;
  const minuteShare = (player.stats?.minutesPlayed ?? 0) / (clubMatches * 90);
  return appearanceShare < 0.35 && minuteShare < 0.30;
};

const canFirstTeamReleasePlayer = (player: Player, firstTeamSquad: Player[]): boolean => {
  const counts = countByPosition(firstTeamSquad);
  const minimumTotal = Object.values(FIRST_TEAM_MINIMUMS).reduce((sum, count) => sum + count, 0);
  return firstTeamSquad.length > minimumTotal && counts[player.position] > FIRST_TEAM_MINIMUMS[player.position];
};

/**
 * Starts or clears the 30-day "market had a chance" timer during a monthly
 * review. A player only keeps the timer while every demotion prerequisite still
 * holds. Interest, a larger role, a depth problem or removal from both market
 * lists immediately resets the timer instead of allowing a stale date to cause
 * a later surprise demotion.
 */
const updateSurplusTimers = (
  parentClub: Club,
  firstTeamSquad: Player[],
  currentDate: Date
): Player[] => firstTeamSquad.map(player => {
  const eligible =
    canMoveInternally(player, currentDate, false) &&
    !player.isUntouchable &&
    player.squadRole !== 'KEY_PLAYER' &&
    player.squadRole !== 'STARTER' &&
    player.health?.status !== HealthStatus.INJURED &&
    canFirstTeamReleasePlayer(player, firstTeamSquad) &&
    isRarelyUsedByFirstTeam(player, parentClub) &&
    hasNoMarketInterest(player);

  if (!eligible) {
    return player.firstTeamSurplusSince ? { ...player, firstTeamSurplusSince: null } : player;
  }
  return player.firstTeamSurplusSince
    ? player
    : { ...player, firstTeamSurplusSince: currentDate.toISOString() };
});

const findMonthlyDemotion = (
  parentClub: Club,
  firstTeamSquad: Player[],
  reserveSquad: Player[],
  currentDate: Date
): Player | null => {
  if (reserveSquad.length >= FIRST_TEAM_TARGET_SIZE) return null;

  const candidates = firstTeamSquad.filter(player =>
    canMoveInternally(player, currentDate, false) &&
    !player.isUntouchable &&
    player.squadRole !== 'KEY_PLAYER' &&
    player.squadRole !== 'STARTER' &&
    player.health?.status !== HealthStatus.INJURED &&
    canFirstTeamReleasePlayer(player, firstTeamSquad) &&
    isRarelyUsedByFirstTeam(player, parentClub) &&
    hasNoMarketInterest(player) &&
    daysSince(player.firstTeamSurplusSince, currentDate) >= SURPLUS_MARKET_EXPOSURE_DAYS
  );

  return [...candidates].sort((a, b) =>
    (a.stats?.minutesPlayed ?? 0) - (b.stats?.minutesPlayed ?? 0) ||
    a.overallRating - b.overallRating ||
    b.age - a.age ||
    a.id.localeCompare(b.id)
  )[0] ?? null;
};

const markLatestHistoryEntryAsInternal = (history: Player['history']): Player['history'] =>
  history.map((entry, index) => index === history.length - 1
    ? { ...entry, movementType: 'INTERNAL_RESERVE' }
    : entry
  );

/**
 * Executes a fee-free internal assignment. It intentionally does not create a
 * loan, transfer fee, adaptation period or transfer-news entry. Career history
 * and club-specific statistics still roll over because Legia and Legia II (for
 * example) play separate official competitions and their appearance records
 * must not be merged into a single history row.
 */
const movePlayerBetweenLinkedSquads = (
  clubs: Club[],
  playersMap: Record<string, Player[]>,
  player: Player,
  sourceClub: Club,
  destinationClub: Club,
  direction: InternalSquadMovementDirection,
  reason: InternalSquadMovementReason,
  currentDate: Date
): { clubs: Club[]; playersMap: Record<string, Player[]>; movement: InternalSquadMovement } => {
  const history = PlayerCareerService.movePlayer(
    player,
    { clubId: destinationClub.id, clubName: destinationClub.name },
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    { clubId: sourceClub.id, clubName: sourceClub.name }
  );
  const playerWithResetStats = PlayerCareerService.resetClubStatsForNewEntry(player);
  const movedPlayer: Player = {
    ...playerWithResetStats,
    clubId: destinationClub.id,
    history: markLatestHistoryEntryAsInternal(history),
    clubAdaptation: null,
    lastInternalSquadMoveDate: currentDate.toISOString(),
    lastInternalSquadMoveDirection: direction,
    firstTeamSurplusSince: null,
    squadRole: null,
    isUntouchable: false,
    ...(direction === 'TO_FIRST_TEAM'
      ? {
          isOnTransferList: false,
          transferListPrice: undefined,
          isAvailableForLoan: false,
          interestedClubs: [],
        }
      : {}),
  };

  const updatedPlayers = {
    ...playersMap,
    [sourceClub.id]: (playersMap[sourceClub.id] ?? []).filter(sourcePlayer => sourcePlayer.id !== player.id),
    [destinationClub.id]: [
      ...(playersMap[destinationClub.id] ?? []).filter(destinationPlayer => destinationPlayer.id !== player.id),
      movedPlayer,
    ],
  };

  const updatedClubs = clubs.map(club => {
    if (club.id === sourceClub.id) {
      return { ...club, rosterIds: club.rosterIds.filter(playerId => playerId !== player.id) };
    }
    if (club.id === destinationClub.id) {
      return { ...club, rosterIds: [...club.rosterIds.filter(playerId => playerId !== player.id), player.id] };
    }
    return club;
  });

  return {
    clubs: updatedClubs,
    playersMap: updatedPlayers,
    movement: {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      parentClubId: direction === 'TO_FIRST_TEAM' ? destinationClub.id : sourceClub.id,
      reserveClubId: direction === 'TO_FIRST_TEAM' ? sourceClub.id : destinationClub.id,
      sourceClubId: sourceClub.id,
      destinationClubId: destinationClub.id,
      direction,
      reason,
      position: player.position,
      date: currentDate.toISOString(),
    },
  };
};

const updateParentMetadata = (
  clubs: Club[],
  parentClubId: string,
  fields: Pick<Club, 'reserveSquadLastReviewMonth' | 'reserveSquadLastEmergencyMoveDate'>
): Club[] => clubs.map(club => club.id === parentClubId ? { ...club, ...fields } : club);

export const ReserveTeamSquadMovementService = {
  /**
   * Runs an idempotent daily review for every configured AI parent/reserve pair.
   *
   * Priority order:
   * 1. Emergency call-up when the first team lacks available match-day depth.
   * 2. On day one of a month, a structural or standout call-up.
   * 3. If no call-up is justified, one unused player may be moved down after a
   *    full 30-day market-exposure period with no interest.
   *
   * A pair involving the user-controlled club is skipped because the game has a
   * separate `reserves` state and manual management flow for the user. Treating
   * that array and a database club such as Legia II as one squad would duplicate
   * players until those two systems are explicitly unified.
   */
  processDailyAiMovements(
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDateInput: Date,
    userTeamId: string | null
  ): ReserveSquadMovementResult {
    const currentDate = toDayStart(currentDateInput);
    const monthKey = toMonthKey(currentDate);
    let updatedClubs = clubs.map(club => ({ ...club, rosterIds: [...club.rosterIds] }));
    let updatedPlayers = Object.fromEntries(
      Object.entries(playersMap).map(([clubId, squad]) => [clubId, [...(squad ?? [])]])
    );
    const movements: InternalSquadMovement[] = [];

    for (const pair of ReserveTeamLeagueService.getParentReservePairs()) {
      if (pair.parentClubId === userTeamId || pair.reserveClubId === userTeamId) continue;

      let parentClub = updatedClubs.find(club => club.id === pair.parentClubId);
      let reserveClub = updatedClubs.find(club => club.id === pair.reserveClubId);
      if (!parentClub || !reserveClub) continue;

      let firstTeamSquad = updatedPlayers[parentClub.id] ?? [];
      let reserveSquad = updatedPlayers[reserveClub.id] ?? [];
      if (firstTeamSquad.length === 0 || reserveSquad.length === 0) continue;

      // Emergency call-ups run every day, including days after the normal monthly
      // review. The 14-day pair cooldown prevents a persistent injury crisis from
      // moving one reserve player on every simulated day.
      const emergencyCooldownComplete =
        daysSince(parentClub.reserveSquadLastEmergencyMoveDate, currentDate) >= EMERGENCY_CALL_UP_COOLDOWN_DAYS;
      const emergencyShortages = getShortagePositions(
        firstTeamSquad,
        EMERGENCY_AVAILABLE_MINIMUMS,
        true
      );
      const emergencyCandidate = emergencyCooldownComplete
        ? findCallUpForPositions(
            reserveSquad,
            emergencyShortages,
            currentDate,
            EMERGENCY_AVAILABLE_MINIMUMS
          )
        : null;

      if (emergencyCandidate) {
        const execution = movePlayerBetweenLinkedSquads(
          updatedClubs,
          updatedPlayers,
          emergencyCandidate,
          reserveClub,
          parentClub,
          'TO_FIRST_TEAM',
          'EMERGENCY_CALL_UP',
          currentDate
        );
        updatedClubs = updateParentMetadata(execution.clubs, parentClub.id, {
          reserveSquadLastReviewMonth: monthKey,
          reserveSquadLastEmergencyMoveDate: currentDate.toISOString(),
        });
        updatedPlayers = execution.playersMap;
        movements.push(execution.movement);
        continue;
      }

      // Ordinary movement is reviewed once on the first day of each calendar
      // month. The persisted month key makes this safe when the same date is
      // processed again after loading a SAVE or by another simulation branch.
      if (currentDate.getDate() !== 1 || parentClub.reserveSquadLastReviewMonth === monthKey) continue;

      firstTeamSquad = updateSurplusTimers(parentClub, firstTeamSquad, currentDate);
      updatedPlayers = { ...updatedPlayers, [parentClub.id]: firstTeamSquad };

      const structuralShortages = getShortagePositions(firstTeamSquad, FIRST_TEAM_MINIMUMS, false);
      const structuralCallUp = findCallUpForPositions(
        reserveSquad,
        structuralShortages,
        currentDate,
        RESERVE_TEAM_MINIMUMS
      );
      const monthlyCallUp = structuralCallUp ?? findStandoutMonthlyCallUp(firstTeamSquad, reserveSquad, currentDate);

      if (monthlyCallUp) {
        const execution = movePlayerBetweenLinkedSquads(
          updatedClubs,
          updatedPlayers,
          monthlyCallUp,
          reserveClub,
          parentClub,
          'TO_FIRST_TEAM',
          'MONTHLY_CALL_UP',
          currentDate
        );
        updatedClubs = updateParentMetadata(execution.clubs, parentClub.id, {
          reserveSquadLastReviewMonth: monthKey,
          reserveSquadLastEmergencyMoveDate: parentClub.reserveSquadLastEmergencyMoveDate,
        });
        updatedPlayers = execution.playersMap;
        movements.push(execution.movement);
        continue;
      }

      const monthlyDemotion = findMonthlyDemotion(parentClub, firstTeamSquad, reserveSquad, currentDate);
      if (monthlyDemotion) {
        const execution = movePlayerBetweenLinkedSquads(
          updatedClubs,
          updatedPlayers,
          monthlyDemotion,
          parentClub,
          reserveClub,
          'TO_RESERVES',
          'MONTHLY_DEMOTION',
          currentDate
        );
        updatedClubs = execution.clubs;
        updatedPlayers = execution.playersMap;
        movements.push(execution.movement);
      }

      updatedClubs = updateParentMetadata(updatedClubs, parentClub.id, {
        reserveSquadLastReviewMonth: monthKey,
        reserveSquadLastEmergencyMoveDate: parentClub.reserveSquadLastEmergencyMoveDate,
      });
    }

    return { updatedClubs, updatedPlayers, movements };
  },
};
