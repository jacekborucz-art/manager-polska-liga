import { Club, HealthStatus, Lineup, Player, PlayerPosition } from '../types';
import { PlayerCareerService } from './PlayerCareerService';
import { SquadGeneratorService } from './SquadGeneratorService';

export const USER_FIRST_TEAM_MINIMUM_SIZE = 14;

const TARGET_POSITION_COUNTS: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 2,
  [PlayerPosition.DEF]: 5,
  [PlayerPosition.MID]: 4,
  [PlayerPosition.FWD]: 3,
};

const POSITIONS: PlayerPosition[] = [
  PlayerPosition.GK,
  PlayerPosition.DEF,
  PlayerPosition.MID,
  PlayerPosition.FWD,
];

export interface UserFirstTeamMinimumMovement {
  playerId: string;
  playerName: string;
  position: PlayerPosition;
  source: 'LINKED_RESERVES' | 'LEGACY_RESERVES';
}

export interface UserFirstTeamMinimumResult {
  updatedClubs: Club[];
  updatedPlayers: Record<string, Player[]>;
  updatedLegacyReserves: Player[];
  updatedLineups: Record<string, Lineup>;
  movements: UserFirstTeamMinimumMovement[];
  generatedJuniors: Player[];
  remainingShortfall: number;
}

const countByPosition = (squad: Player[]): Record<PlayerPosition, number> => {
  const counts: Record<PlayerPosition, number> = {
    [PlayerPosition.GK]: 0,
    [PlayerPosition.DEF]: 0,
    [PlayerPosition.MID]: 0,
    [PlayerPosition.FWD]: 0,
  };
  squad.forEach(player => {
    counts[player.position] += 1;
  });
  return counts;
};

const isContractValid = (player: Player, currentDate: Date): boolean => {
  const contractEnd = new Date(player.contractEndDate);
  return Number.isNaN(contractEnd.getTime()) || contractEnd >= currentDate;
};

const canBePromoted = (player: Player, currentDate: Date): boolean =>
  !player.loan &&
  !player.transferPendingClubId &&
  !player.aiNegotiationClubId &&
  isContractValid(player, currentDate);

const isAvailableToday = (player: Player): boolean =>
  player.health?.status !== HealthStatus.INJURED &&
  (player.suspensionMatches ?? 0) <= 0;

const averageRecentRating = (player: Player): number => {
  const recent = (player.stats?.ratingHistory ?? []).slice(-5);
  if (recent.length === 0) return 0;
  return recent.reduce((sum, rating) => sum + rating, 0) / recent.length;
};

const candidateScore = (player: Player): number =>
  (isAvailableToday(player) ? 1_000_000 : 0) +
  player.overallRating * 100 +
  averageRecentRating(player) * 10 +
  Math.max(0, 24 - player.age) * 2;

const sortCandidates = (players: Player[]): Player[] => [...players].sort((a, b) =>
  candidateScore(b) - candidateScore(a) || a.id.localeCompare(b.id)
);

/**
 * Najpierw uzupełniamy pozycję o najniższym pokryciu docelowej obsady. Dzięki
 * temu system nie dobiera po prostu najlepszych rezerwowych, lecz buduje kadrę
 * zdolną wystawić bramkarza, linię obrony, pomoc i atak.
 */
const getPositionPriority = (firstTeam: Player[]): PlayerPosition[] => {
  const counts = countByPosition(firstTeam);
  return [...POSITIONS].sort((a, b) => {
    const coverageA = counts[a] / TARGET_POSITION_COUNTS[a];
    const coverageB = counts[b] / TARGET_POSITION_COUNTS[b];
    return coverageA - coverageB ||
      (TARGET_POSITION_COUNTS[b] - counts[b]) - (TARGET_POSITION_COUNTS[a] - counts[a]) ||
      POSITIONS.indexOf(a) - POSITIONS.indexOf(b);
  });
};

const markLatestHistoryEntryAsInternal = (history: Player['history']): Player['history'] =>
  history.map((entry, index) => index === history.length - 1
    ? { ...entry, movementType: 'INTERNAL_RESERVE' }
    : entry
  );

const preparePromotedPlayer = (
  player: Player,
  parentClub: Club,
  reserveClub: Club | null,
  currentDate: Date
): Player => {
  const history = reserveClub
    ? markLatestHistoryEntryAsInternal(PlayerCareerService.movePlayer(
        player,
        { clubId: parentClub.id, clubName: parentClub.name },
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        { clubId: reserveClub.id, clubName: reserveClub.name }
      ))
    : PlayerCareerService.reopenOrCreateEntry(
        player.history ?? [],
        player,
        { clubId: parentClub.id, clubName: parentClub.name },
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );

  const basePlayer = reserveClub
    ? PlayerCareerService.resetClubStatsForNewEntry(player)
    : player;

  return {
    ...basePlayer,
    clubId: parentClub.id,
    history,
    clubAdaptation: null,
    lastInternalSquadMoveDate: currentDate.toISOString(),
    lastInternalSquadMoveDirection: 'TO_FIRST_TEAM',
    firstTeamSurplusSince: null,
    reserveProtestUntil: null,
    squadRole: null,
    isUntouchable: false,
    isOnTransferList: false,
    transferListPrice: undefined,
    isAvailableForLoan: false,
    interestedClubs: [],
  };
};

const removePlayersFromLineup = (lineup: Lineup, playerIds: Set<string>): Lineup => ({
  ...lineup,
  startingXI: lineup.startingXI.map(playerId => playerId && playerIds.has(playerId) ? null : playerId),
  bench: lineup.bench.filter(playerId => !playerIds.has(playerId)),
  reserves: lineup.reserves.filter(playerId => !playerIds.has(playerId)),
});

const addPlayersToLineupReserves = (lineup: Lineup, playerIds: string[]): Lineup => {
  const alreadyAssigned = new Set([
    ...lineup.startingXI.filter((playerId): playerId is string => !!playerId),
    ...lineup.bench,
    ...lineup.reserves,
  ]);
  return {
    ...lineup,
    reserves: [
      ...lineup.reserves,
      ...playerIds.filter(playerId => !alreadyAssigned.has(playerId)),
    ],
  };
};

export const UserFirstTeamMinimumService = {
  /**
   * Zapewnia minimum 14 zawodników w pierwszej drużynie użytkownika. Operacja
   * jest idempotentna: po osiągnięciu limitu kolejne wywołanie niczego nie
   * zmienia. Kontuzjowani i zawieszeni są dobierani dopiero wtedy, gdy nie ma
   * zdrowego kandydata na potrzebną pozycję.
   */
  ensureMinimum(
    clubs: Club[],
    players: Record<string, Player[]>,
    legacyReserves: Player[],
    lineups: Record<string, Lineup>,
    userTeamId: string | null,
    linkedReserveClubId: string | null,
    currentDateInput: Date,
    isResigned: boolean
  ): UserFirstTeamMinimumResult {
    const unchanged = (remainingShortfall: number): UserFirstTeamMinimumResult => ({
      updatedClubs: clubs,
      updatedPlayers: players,
      updatedLegacyReserves: legacyReserves,
      updatedLineups: lineups,
      movements: [],
      generatedJuniors: [],
      remainingShortfall,
    });

    if (!userTeamId || isResigned) return unchanged(0);
    const parentClub = clubs.find(club => club.id === userTeamId);
    if (!parentClub) return unchanged(0);

    let firstTeam = [...(players[userTeamId] ?? [])];
    if (firstTeam.length >= USER_FIRST_TEAM_MINIMUM_SIZE) return unchanged(0);

    const reserveClub = linkedReserveClubId
      ? clubs.find(club => club.id === linkedReserveClubId) ?? null
      : null;
    let reserveSquad = linkedReserveClubId
      ? [...(players[linkedReserveClubId] ?? [])]
      : [...legacyReserves];
    const firstTeamIds = new Set(firstTeam.map(player => player.id));
    reserveSquad = reserveSquad.filter(player => !firstTeamIds.has(player.id));

    const currentDate = new Date(currentDateInput);
    currentDate.setHours(0, 0, 0, 0);
    const movements: UserFirstTeamMinimumMovement[] = [];

    while (firstTeam.length < USER_FIRST_TEAM_MINIMUM_SIZE) {
      const eligible = reserveSquad.filter(player => canBePromoted(player, currentDate));
      if (eligible.length === 0) break;

      let selected: Player | null = null;
      for (const position of getPositionPriority(firstTeam)) {
        selected = sortCandidates(eligible.filter(player => player.position === position))[0] ?? null;
        if (selected) break;
      }
      selected ??= sortCandidates(eligible)[0] ?? null;
      if (!selected) break;

      const promoted = preparePromotedPlayer(selected, parentClub, reserveClub, currentDate);
      firstTeam.push(promoted);
      reserveSquad = reserveSquad.filter(player => player.id !== selected!.id);
      movements.push({
        playerId: promoted.id,
        playerName: `${promoted.firstName} ${promoted.lastName}`,
        position: promoted.position,
        source: reserveClub ? 'LINKED_RESERVES' : 'LEGACY_RESERVES',
      });
    }

    if (movements.length === 0) {
      return unchanged(Math.max(0, USER_FIRST_TEAM_MINIMUM_SIZE - firstTeam.length));
    }

    const replacementReserveClub: Club = reserveClub ?? {
      ...parentClub,
      name: `${parentClub.name} II`,
      shortName: `${parentClub.shortName ?? parentClub.name} II`,
      reputation: Math.max(1, parentClub.reputation - 1),
      tier: Math.min(4, (parentClub.tier ?? 4) + 1),
    };
    const generatedJuniors = SquadGeneratorService.generateReserveReplacementJuniors(
      replacementReserveClub,
      reserveSquad,
      movements.map(movement => movement.position),
      currentDate
    );
    reserveSquad = [...reserveSquad, ...generatedJuniors];

    const movedIds = new Set(movements.map(movement => movement.playerId));
    const updatedPlayers: Record<string, Player[]> = {
      ...players,
      [userTeamId]: firstTeam,
      ...(linkedReserveClubId ? { [linkedReserveClubId]: reserveSquad } : {}),
    };
    const updatedLegacyReserves = linkedReserveClubId ? legacyReserves : reserveSquad;
    const updatedClubs = clubs.map(club => {
      if (club.id === userTeamId) {
        return { ...club, rosterIds: firstTeam.map(player => player.id) };
      }
      if (linkedReserveClubId && club.id === linkedReserveClubId) {
        return { ...club, rosterIds: reserveSquad.map(player => player.id) };
      }
      return club;
    });

    let updatedLineups = lineups;
    if (linkedReserveClubId && lineups[linkedReserveClubId]) {
      const reserveLineupWithoutPromotedPlayers = removePlayersFromLineup(
        lineups[linkedReserveClubId],
        movedIds
      );
      updatedLineups = {
        ...updatedLineups,
        [linkedReserveClubId]: addPlayersToLineupReserves(
          reserveLineupWithoutPromotedPlayers,
          generatedJuniors.map(junior => junior.id)
        ),
      };
    }
    if (lineups[userTeamId]) {
      updatedLineups = {
        ...updatedLineups,
        [userTeamId]: addPlayersToLineupReserves(
          lineups[userTeamId],
          movements.map(movement => movement.playerId)
        ),
      };
    }

    return {
      updatedClubs,
      updatedPlayers,
      updatedLegacyReserves,
      updatedLineups,
      movements,
      generatedJuniors,
      remainingShortfall: Math.max(0, USER_FIRST_TEAM_MINIMUM_SIZE - firstTeam.length),
    };
  },
};
