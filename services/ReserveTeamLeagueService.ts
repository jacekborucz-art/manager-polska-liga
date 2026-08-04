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

  /**
   * Reports whether a club may act as a buyer in a club-to-club transaction.
   * Reserve teams return false because they may sell players and sign free
   * agents, but they are not allowed to purchase or loan players from clubs.
   * Source-specific parent/reserve validation belongs to canRecruitPlayerFrom.
   */
  canParticipateAsTransferBuyer(clubId: string): boolean {
    return !this.isReserveClub(clubId);
  },

  /**
   * Central market-eligibility rule shared by permanent transfers, loans,
   * pre-contracts, scouting and final transfer execution.
   *
   * The order of these checks is intentional:
   * 1. Reserve teams may still sign free agents because no selling club is
   *    involved and this is their only permitted recruitment channel.
   * 2. A reserve team may never act as a buyer on the club-to-club market.
   * 3. A first team may not buy or loan a player from its own reserve team.
   *    Such a move belongs to the future internal squad-integration system
   *    and must not create a fee, negotiation or market transfer record.
   *
   * Players owned by a reserve team may still be sold to every unrelated
   * club. This preserves the rule that reserve teams can sell players even
   * though they cannot purchase players from other clubs.
   */
  canRecruitPlayerFrom(buyerClubId: string, sellerClubId: string): boolean {
    if (sellerClubId === 'FREE_AGENTS') return true;
    if (!this.canParticipateAsTransferBuyer(buyerClubId)) return false;

    return this.getParentClubId(sellerClubId) !== buyerClubId;
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
