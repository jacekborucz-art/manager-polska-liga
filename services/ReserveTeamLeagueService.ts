import { Club } from '../types';

type PolishPlayableLeagueId = 'L_PL_1' | 'L_PL_2' | 'L_PL_3';

export interface PromotionCandidate {
  club: Club;
  tablePosition: number;
}

export interface PromotionSelection {
  direct: PromotionCandidate[];
  playoffs: PromotionCandidate[];
}

export interface LeagueProjectionChange {
  clubIds: Iterable<string>;
  targetLeagueId: string;
}

const RESERVE_PARENT_CLUB_BY_ID: Readonly<Record<string, string>> = {
  PL_LEGIA_WARSZAWA_II: 'PL_LEGIA_WARSZAWA',
  PL_SLASK_WROCLAW_II: 'PL_SLASK_WROCLAW',
  PL_LKS_II_LODZ: 'PL_LKS_LODZ',
};

const getLeagueId = (
  clubId: string,
  clubs: Club[],
  projectedLeagueByClubId?: ReadonlyMap<string, string>
): string | undefined => projectedLeagueByClubId?.get(clubId) ?? clubs.find(club => club.id === clubId)?.leagueId;

export const ReserveTeamLeagueService = {
  createLeagueProjection(clubs: Club[], changes: LeagueProjectionChange[] = []): Map<string, string> {
    const projection = new Map(clubs.map(club => [club.id, club.leagueId]));
    changes.forEach(change => {
      for (const clubId of change.clubIds) projection.set(clubId, change.targetLeagueId);
    });
    return projection;
  },

  applyLeagueProjection(
    projection: Map<string, string>,
    clubIds: Iterable<string>,
    targetLeagueId: string
  ): void {
    for (const clubId of clubIds) projection.set(clubId, targetLeagueId);
  },

  getParentClubId(reserveClubId: string): string | null {
    return RESERVE_PARENT_CLUB_BY_ID[reserveClubId] ?? null;
  },

  isReserveClub(clubId: string): boolean {
    return Object.prototype.hasOwnProperty.call(RESERVE_PARENT_CLUB_BY_ID, clubId);
  },

  canEnterLeague(
    clubId: string,
    targetLeagueId: PolishPlayableLeagueId,
    clubs: Club[],
    projectedLeagueByClubId?: ReadonlyMap<string, string>
  ): boolean {
    const parentClubId = this.getParentClubId(clubId);
    if (!parentClubId) return true;

    // Drużyna rezerw nigdy nie może występować w Ekstraklasie.
    if (targetLeagueId === 'L_PL_1') return false;

    return getLeagueId(parentClubId, clubs, projectedLeagueByClubId) !== targetLeagueId;
  },

  selectPromotionPlaces(
    standings: Club[],
    targetLeagueId: PolishPlayableLeagueId,
    clubs: Club[],
    directPlaceCount = 2,
    playoffPlaceCount = 4,
    projectedLeagueByClubId?: ReadonlyMap<string, string>
  ): PromotionSelection {
    const eligible = this.getEligibleCandidates(standings, targetLeagueId, clubs, projectedLeagueByClubId);

    return {
      direct: eligible.slice(0, directPlaceCount),
      playoffs: eligible.slice(directPlaceCount, directPlaceCount + playoffPlaceCount),
    };
  },

  getEligibleCandidates(
    standings: Club[],
    targetLeagueId: PolishPlayableLeagueId,
    clubs: Club[],
    projectedLeagueByClubId?: ReadonlyMap<string, string>
  ): PromotionCandidate[] {
    return standings
      .map((club, index) => ({ club, tablePosition: index + 1 }))
      .filter(candidate => this.canEnterLeague(candidate.club.id, targetLeagueId, clubs, projectedLeagueByClubId));
  },

  findSameLeagueConflicts(
    clubs: Club[],
    projectedLeagueByClubId: ReadonlyMap<string, string>
  ): Array<{ reserveClubId: string; parentClubId: string; leagueId: string }> {
    return Object.entries(RESERVE_PARENT_CLUB_BY_ID).flatMap(([reserveClubId, parentClubId]) => {
      const reserveLeagueId = getLeagueId(reserveClubId, clubs, projectedLeagueByClubId);
      const parentLeagueId = getLeagueId(parentClubId, clubs, projectedLeagueByClubId);
      if (!reserveLeagueId || reserveLeagueId !== parentLeagueId || !['L_PL_1', 'L_PL_2', 'L_PL_3'].includes(reserveLeagueId)) {
        return [];
      }
      return [{ reserveClubId, parentClubId, leagueId: reserveLeagueId }];
    });
  },

  resolvePlayoffWinner(
    result: { homeId: string; awayId: string; winnerId: string } | null | undefined,
    targetLeagueId: PolishPlayableLeagueId,
    clubs: Club[],
    excludedClubIds: ReadonlySet<string> = new Set(),
    projectedLeagueByClubId?: ReadonlyMap<string, string>
  ): string | null {
    if (!result) return null;

    const loserId = result.winnerId === result.homeId ? result.awayId : result.homeId;
    return [result.winnerId, loserId].find(clubId =>
      !excludedClubIds.has(clubId) &&
      this.canEnterLeague(clubId, targetLeagueId, clubs, projectedLeagueByClubId)
    ) ?? null;
  },
};
