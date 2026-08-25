import { Club } from '../types';
import { PolishThirdLeagueService, THIRD_LEAGUE_GROUP_IDS } from './PolishThirdLeagueService';

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
  PL_WIDZEW_LODZ_II: 'PL_WIDZEW_LODZ',
  PL_WISLA_PLOCK_II: 'PL_WISLA_PLOCK',
  PL_JAGIELLONIA_BIALYSTOK_II: 'PL_JAGIELLONIA_BIALYSTOK',
  PL_LECH_POZNAN_II: 'PL_LECH_POZNAN',
  PL_ZAGLEBIE_LUBIN_II: 'PL_ZAGLEBIE_LUBIN',
  PL_MIEDZ_LEGNICA_II: 'PL_MIEDZ_LEGNICA',
  PL_RAKOW_CZESTOCHOWA_II: 'PL_RAKOW_CZESTOCHOWA',
  PL_WISLA_KRAKOW_II: 'PL_WISLA_KRAKOW',
  PL_WIECZYSTA_KRAKOW_II: 'PL_WIECZYSTA_KRAKOW',
  PL_KORONA_KIELCE_II: 'PL_KORONA_KIELCE',
};

/**
 * Only clubs assigned to a fully simulated Polish competition may
 * replace the player's generated reserve squad. Season setup deliberately
 * moves database clubs which are absent from a selected season to L_PL_5, so
 * checking whether a Club record merely exists would incorrectly activate
 * teams such as Legia Warszawa II in the 2025/26 career start.
 */
const PLAYABLE_POLISH_LEAGUE_IDS: ReadonlySet<string> = new Set([
  'L_PL_1',
  'L_PL_2',
  'L_PL_3',
  ...THIRD_LEAGUE_GROUP_IDS,
]);

export interface ReserveParentClubPair {
  reserveClubId: string;
  parentClubId: string;
}

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

  /**
   * Resolves the configured reserve-club relationship without deciding if the
   * reserve side participates in the currently selected season. Callers which
   * control the player's reserve screen must use getPlayableReserveClubId;
   * promotion, finance and ownership rules may still need this raw relation
   * even while the reserve team temporarily plays below the simulated leagues.
   */
  getReserveClubId(parentClubId: string): string | null {
    const pair = Object.entries(RESERVE_PARENT_CLUB_BY_ID)
      .find(([, configuredParentClubId]) => configuredParentClubId === parentClubId);
    return pair?.[0] ?? null;
  },

  /**
   * Resolves an official reserve side only when it is an actual participant in
   * a simulated league for the current career state. This is intentionally a
   * runtime check against the supplied clubs rather than a static season list:
   * promotions and relegations can make the answer change in later seasons.
   *
   * When the configured reserve club is missing or sits only in the L_PL_5
   * feeder pool, null instructs GameContext to keep using generated reserves. A
   * club with no configured database reserve side, such as Polonia Warszawa,
   * naturally follows the same fallback path.
   */
  getPlayableReserveClubId(parentClubId: string, clubs: Club[]): string | null {
    const reserveClubId = this.getReserveClubId(parentClubId);
    if (!reserveClubId) return null;

    const reserveClub = clubs.find(club => club.id === reserveClubId);
    if (!reserveClub || !PLAYABLE_POLISH_LEAGUE_IDS.has(reserveClub.leagueId)) return null;

    return reserveClubId;
  },

  /**
   * Official reserve teams are database-controlled development sides, not
   * independent career entry points. The defensive predicate is shared by
   * the selection screen and GameContext so a future UI regression cannot
   * bypass the restriction by calling selectUserTeam directly.
   */
  canBeSelectedAsUserClub(clubId: string): boolean {
    return !this.isReserveClub(clubId);
  },

  /**
   * Returns every configured parent/reserve relationship as immutable-looking
   * value objects. Squad-integration services use this method instead of
   * duplicating club ids, so promotion restrictions, finances and internal
   * player movement always refer to the same source of truth.
   */
  getParentReservePairs(): ReserveParentClubPair[] {
    return Object.entries(RESERVE_PARENT_CLUB_BY_ID).map(([reserveClubId, parentClubId]) => ({
      reserveClubId,
      parentClubId,
    }));
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

    // A reserve team may never participate in the Ekstraklasa.
    if (targetLeagueId === 'L_PL_1') return false;

    const parentLeagueId = getLeagueId(parentClubId, clubs, projectedLeagueByClubId);
    return PolishThirdLeagueService.getPolishTier(parentLeagueId) !== PolishThirdLeagueService.getPolishTier(targetLeagueId);
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
      const reserveTier = PolishThirdLeagueService.getPolishTier(reserveLeagueId);
      const parentTier = PolishThirdLeagueService.getPolishTier(parentLeagueId);
      if (!reserveLeagueId || reserveTier === null || reserveTier !== parentTier || reserveTier > 4) {
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
