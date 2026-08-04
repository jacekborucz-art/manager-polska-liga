import {
  Club,
  Fixture,
  Lineup,
  MatchHistoryEntry,
  MatchStatus,
  Player,
  ReserveFixture,
  ReserveMatchResult,
} from '../types';
import { ReserveTeamLeagueService } from './ReserveTeamLeagueService';

export interface LinkedReserveSaveMigrationInput {
  userTeamId: string | null;
  clubs: Club[];
  players: Record<string, Player[]>;
  legacyReserves: Player[];
  lineups: Record<string, Lineup>;
  currentDate: Date;
}

export interface LinkedReserveSaveMigrationResult {
  linkedReserveClubId: string | null;
  players: Record<string, Player[]>;
  lineups: Record<string, Lineup>;
  legacyReserves: Player[];
  migratedPlayerCount: number;
}

export interface OfficialReserveSchedule {
  fixtures: ReserveFixture[];
  results: ReserveMatchResult[];
}

const normalizeDate = (value: Date): Date => {
  const normalized = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isNaN(normalized.getTime()) ? new Date(2025, 6, 1) : normalized;
};

/**
 * Converts one player from the historical, parent-owned `reserves` array into
 * a normal player owned by the official reserve club. Old generated reserves
 * used the parent id even though the open career-history row was labelled
 * "Club II". Rewriting that open row preserves the original career start date
 * and avoids presenting the migration as a paid transfer.
 */
const migrateLegacyPlayer = (
  player: Player,
  parentClubId: string,
  reserveClub: Club,
  currentDate: Date
): Player => {
  let foundOpenReserveEntry = false;
  const history = (player.history ?? []).map(entry => {
    const looksLikeLegacyReserveEntry =
      entry.toYear === null &&
      entry.clubId === parentClubId &&
      (entry.clubName === reserveClub.name || entry.clubName.trim().endsWith(' II'));

    if (!looksLikeLegacyReserveEntry) return entry;
    foundOpenReserveEntry = true;
    return {
      ...entry,
      clubId: reserveClub.id,
      clubName: reserveClub.name,
      movementType: 'INTERNAL_RESERVE' as const,
    };
  });

  const migrationDate = normalizeDate(currentDate);
  const migratedHistory = foundOpenReserveEntry
    ? history
    : [
        ...history,
        {
          clubId: reserveClub.id,
          clubName: reserveClub.name,
          fromYear: migrationDate.getFullYear(),
          fromMonth: migrationDate.getMonth() + 1,
          toYear: null,
          toMonth: null,
          movementType: 'INTERNAL_RESERVE' as const,
        },
      ];

  return {
    ...player,
    clubId: reserveClub.id,
    squadRole: null,
    history: migratedHistory,
  };
};

export const ManagedReserveTeamService = {
  /**
   * Adapts real league fixtures to the historical reserve-schedule view model.
   * It does not simulate or persist anything: scores and event details come
   * from the same Fixture/MatchHistory records used by the league table. This
   * lets the existing reserve UI render an official team's season without
   * maintaining a second synthetic calendar.
   */
  buildOfficialSchedule(
    reserveClubId: string,
    fixtures: Fixture[],
    clubs: Club[],
    seasonNumber: number,
    matchHistory: MatchHistoryEntry[]
  ): OfficialReserveSchedule {
    const clubById = new Map(clubs.map(club => [club.id, club]));
    const historyByMatchId = new Map(matchHistory.map(entry => [entry.matchId, entry]));
    const officialFixtures = fixtures
      .filter(fixture =>
        (fixture.homeTeamId === reserveClubId || fixture.awayTeamId === reserveClubId) &&
        String(fixture.leagueId).startsWith('L_PL_')
      )
      .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

    const results: ReserveMatchResult[] = [];
    const adaptedFixtures = officialFixtures.map(fixture => {
      const isHome = fixture.homeTeamId === reserveClubId;
      const opponentClubId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
      const opponentClub = clubById.get(opponentClubId);
      const date = new Date(fixture.date);
      const history = historyByMatchId.get(fixture.id);
      const isFinished = fixture.status === MatchStatus.FINISHED &&
        fixture.homeScore !== null && fixture.awayScore !== null;
      const resultId = isFinished ? `official_reserve_${fixture.id}` : undefined;

      if (isFinished && resultId) {
        const reserveClub = clubById.get(reserveClubId);
        results.push({
          id: resultId,
          date: date.toISOString(),
          season: history?.season ?? seasonNumber,
          homeTeamName: clubById.get(fixture.homeTeamId)?.name ?? fixture.homeTeamId,
          awayTeamName: clubById.get(fixture.awayTeamId)?.name ?? fixture.awayTeamId,
          isUserHome: isHome,
          homeScore: fixture.homeScore!,
          awayScore: fixture.awayScore!,
          venue: history?.venue ?? clubById.get(fixture.homeTeamId)?.stadiumName ?? reserveClub?.stadiumName ?? 'Stadion',
          opponentClubId,
          goals: history?.goals ?? [],
          cards: history?.cards ?? [],
          substitutions: history?.substitutions ?? [],
          injuries: history?.injuries ?? [],
          ratings: history?.ratings ?? {},
          userStartingXI: isHome ? (history?.homeLineup ?? []) : (history?.awayLineup ?? []),
        });
      }

      return {
        id: `official_reserve_fixture_${fixture.id}`,
        date: date.toISOString(),
        isHome,
        opponentClubId,
        opponentClubName: opponentClub?.name ?? opponentClubId,
        round: (date.getMonth() >= 6 ? 1 : 2) as 1 | 2,
        resultId,
      };
    });

    return { fixtures: adaptedFixtures, results };
  },

  /**
   * Migrates saves created before official reserve clubs became the single
   * source of truth for the user's reserve view.
   *
   * Safety rules:
   * - the official squad always wins when an id already exists there;
   * - a legacy copy is ignored when its id belongs to any other world squad;
   * - unique legacy players are appended without replacing database players;
   * - only a user controlling the configured parent club is migrated;
   * - the historical virtual-reserve array is cleared after a successful
   *   linked-mode decision, even when it contained only duplicate records.
   *
   * These rules make repeated normalization idempotent and prevent a SAVE/LOAD
   * cycle from re-adding the same player.
   */
  migrateLoadedSave(input: LinkedReserveSaveMigrationInput): LinkedReserveSaveMigrationResult {
    const linkedReserveClubId = input.userTeamId
      ? ReserveTeamLeagueService.getPlayableReserveClubId(input.userTeamId, input.clubs)
      : null;
    if (!linkedReserveClubId) {
      return {
        linkedReserveClubId: null,
        players: input.players,
        lineups: input.lineups,
        legacyReserves: input.legacyReserves,
        migratedPlayerCount: 0,
      };
    }

    const reserveClub = input.clubs.find(club => club.id === linkedReserveClubId);
    if (!reserveClub) {
      // A custom database may omit the configured reserve club. Falling back
      // to the legacy array is safer than silently deleting the user's squad.
      return {
        linkedReserveClubId: null,
        players: input.players,
        lineups: input.lineups,
        legacyReserves: input.legacyReserves,
        migratedPlayerCount: 0,
      };
    }

    const officialSquad = input.players[linkedReserveClubId] ?? [];
    const claimedOutsideOfficialSquad = new Set(
      Object.entries(input.players)
        .filter(([clubId]) => clubId !== linkedReserveClubId)
        .flatMap(([, squad]) => squad.map(player => player.id))
    );
    const officialIds = new Set(officialSquad.map(player => player.id));
    const migratedPlayers: Player[] = [];

    input.legacyReserves.forEach(player => {
      if (officialIds.has(player.id) || claimedOutsideOfficialSquad.has(player.id)) return;
      const migrated = migrateLegacyPlayer(player, input.userTeamId!, reserveClub, input.currentDate);
      officialIds.add(migrated.id);
      migratedPlayers.push(migrated);
    });

    const mergedSquad = [...officialSquad, ...migratedPlayers];
    const currentLineup = input.lineups[linkedReserveClubId];
    const validPlayerIds = new Set(mergedSquad.map(player => player.id));
    const normalizedLineup = currentLineup
      ? {
          ...currentLineup,
          startingXI: currentLineup.startingXI.map(playerId => (
            playerId && validPlayerIds.has(playerId) ? playerId : null
          )),
          bench: currentLineup.bench.filter(playerId => validPlayerIds.has(playerId)),
          reserves: Array.from(new Set([
            ...currentLineup.reserves.filter(playerId => validPlayerIds.has(playerId)),
            ...migratedPlayers.map(player => player.id),
          ])),
        }
      : currentLineup;

    return {
      linkedReserveClubId,
      players: {
        ...input.players,
        [linkedReserveClubId]: mergedSquad,
      },
      lineups: normalizedLineup
        ? { ...input.lineups, [linkedReserveClubId]: normalizedLineup }
        : input.lineups,
      legacyReserves: [],
      migratedPlayerCount: migratedPlayers.length,
    };
  },
};
