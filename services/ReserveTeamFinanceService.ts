import { Club, FinanceLog } from '../types';
import { ReserveTeamLeagueService } from './ReserveTeamLeagueService';

const MIN_SEASON_FUNDING_RATE = 0.02;
const MAX_SEASON_FUNDING_RATE = 0.05;
const EMERGENCY_THRESHOLD_SHARE = 0.20;
const EMERGENCY_TARGET_SHARE = 0.50;
const EMERGENCY_PARENT_BUDGET_CAP = 0.01;

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const roundToThousands = (amount: number): number => Math.max(0, Math.floor(amount / 1_000) * 1_000);

const getSeasonFundingRate = (parentClubId: string, seasonStartYear: number, sessionSeed: number): number => {
  const basisPointsRange = Math.round((MAX_SEASON_FUNDING_RATE - MIN_SEASON_FUNDING_RATE) * 10_000);
  const offset = stableHash(`${parentClubId}_${seasonStartYear}_${sessionSeed}`) % (basisPointsRange + 1);
  return MIN_SEASON_FUNDING_RATE + offset / 10_000;
};

const prependFinanceLog = (club: Club, log: FinanceLog): FinanceLog[] =>
  [log, ...(club.financeHistory ?? [])].slice(0, 50);

const getSeasonLabel = (seasonStartYear: number): string =>
  `${seasonStartYear}/${String(seasonStartYear + 1).slice(-2)}`;

export interface ReserveSeasonFundingOptions {
  seasonStartYear: number;
  sessionSeed: number;
  date: Date;
  resetReserveBalances?: boolean;
}

export const ReserveTeamFinanceService = {
  getSeasonStartYear(date: Date): number {
    return date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
  },

  allocateSeasonFunding(clubs: Club[], options: ReserveSeasonFundingOptions): Club[] {
    const { seasonStartYear, sessionSeed, date, resetReserveBalances = false } = options;
    const clubById = new Map(clubs.map(club => [club.id, { ...club }]));
    const reserveIdsByParentId = new Map<string, string[]>();

    clubs.forEach(club => {
      const parentClubId = ReserveTeamLeagueService.getParentClubId(club.id);
      if (!parentClubId || !clubById.has(parentClubId)) return;
      const reserveIds = reserveIdsByParentId.get(parentClubId) ?? [];
      reserveIds.push(club.id);
      reserveIdsByParentId.set(parentClubId, reserveIds);
    });

    reserveIdsByParentId.forEach((reserveClubIds, parentClubId) => {
      const parentClub = clubById.get(parentClubId);
      if (!parentClub) return;

      const alreadyFunded = reserveClubIds.every(reserveClubId =>
        clubById.get(reserveClubId)?.reserveTeamSeasonGrantYear === seasonStartYear
      );
      if (alreadyFunded) return;

      const fundingRate = getSeasonFundingRate(parentClubId, seasonStartYear, sessionSeed);
      const availableParentBudget = Math.max(0, parentClub.budget);
      const totalFunding = Math.min(availableParentBudget, roundToThousands(availableParentBudget * fundingRate));
      const baseShare = reserveClubIds.length > 0 ? Math.floor(totalFunding / reserveClubIds.length) : 0;
      let distributedFunding = 0;

      reserveClubIds.forEach((reserveClubId, index) => {
        const reserveClub = clubById.get(reserveClubId);
        if (!reserveClub) return;
        const funding = index === reserveClubIds.length - 1
          ? totalFunding - distributedFunding
          : baseShare;
        const previousBalance = resetReserveBalances ? 0 : reserveClub.budget;
        distributedFunding += funding;

        const reserveIncomeLog: FinanceLog = {
          id: `RESERVE_TEAM_GRANT_IN_${seasonStartYear}_${reserveClubId}`,
          date: date.toISOString().split('T')[0],
          amount: funding,
          type: 'INCOME',
          description: `Dotacja od pierwszej drużyny na sezon ${getSeasonLabel(seasonStartYear)}`,
          previousBalance,
        };

        clubById.set(reserveClubId, {
          ...reserveClub,
          budget: previousBalance + funding,
          transferBudget: 0,
          reserveBudget: 0,
          signingBonusPool: 0,
          reserveTeamSeasonGrant: funding,
          reserveTeamSeasonGrantRate: fundingRate,
          reserveTeamSeasonGrantYear: seasonStartYear,
          reserveTeamEmergencySupportYear: undefined,
          financeHistory: prependFinanceLog(reserveClub, reserveIncomeLog),
        });
      });

      const reserveNames = reserveClubIds
        .map(reserveClubId => clubById.get(reserveClubId)?.name)
        .filter((name): name is string => !!name)
        .join(', ');
      const rateLabel = (fundingRate * 100).toFixed(2).replace('.', ',');
      const parentExpenseLog: FinanceLog = {
        id: `RESERVE_TEAM_GRANT_OUT_${seasonStartYear}_${parentClubId}`,
        date: date.toISOString().split('T')[0],
        amount: -totalFunding,
        type: 'EXPENSE',
        description: `Finansowanie drużyny rezerw (${reserveNames}) — ${rateLabel}% budżetu`,
        previousBalance: parentClub.budget,
      };

      clubById.set(parentClubId, {
        ...parentClub,
        budget: parentClub.budget - totalFunding,
        financeHistory: prependFinanceLog(parentClub, parentExpenseLog),
      });
    });

    return clubs.map(club => clubById.get(club.id) ?? club);
  },

  ensureSeasonFunding(clubs: Club[], options: ReserveSeasonFundingOptions): Club[] {
    const needsMigration = clubs.some(club =>
      ReserveTeamLeagueService.isReserveClub(club.id) &&
      club.reserveTeamSeasonGrantYear !== options.seasonStartYear
    );
    if (!needsMigration) return clubs;
    return this.allocateSeasonFunding(clubs, {
      ...options,
      resetReserveBalances: options.resetReserveBalances ?? true,
    });
  },

  applyEmergencySupport(clubs: Club[], date: Date): Club[] {
    const seasonStartYear = this.getSeasonStartYear(date);
    const clubById = new Map(clubs.map(club => [club.id, { ...club }]));
    let changed = false;

    clubs.forEach(originalReserveClub => {
      if (!ReserveTeamLeagueService.isReserveClub(originalReserveClub.id)) return;
      const reserveClub = clubById.get(originalReserveClub.id);
      if (!reserveClub || reserveClub.reserveTeamSeasonGrantYear !== seasonStartYear) return;
      if (reserveClub.reserveTeamEmergencySupportYear === seasonStartYear) return;

      const seasonGrant = Math.max(0, reserveClub.reserveTeamSeasonGrant ?? 0);
      const emergencyThreshold = seasonGrant * EMERGENCY_THRESHOLD_SHARE;
      if (seasonGrant <= 0 || reserveClub.budget >= emergencyThreshold) return;

      const parentClubId = ReserveTeamLeagueService.getParentClubId(reserveClub.id);
      const parentClub = parentClubId ? clubById.get(parentClubId) : undefined;
      if (!parentClub || parentClub.budget <= 0) return;

      const targetBalance = seasonGrant * EMERGENCY_TARGET_SHARE;
      const requiredSupport = Math.max(0, targetBalance - reserveClub.budget);
      const supportCap = roundToThousands(parentClub.budget * EMERGENCY_PARENT_BUDGET_CAP);
      const supportAmount = roundToThousands(Math.min(parentClub.budget, requiredSupport, supportCap));
      if (supportAmount <= 0) return;

      const parentExpenseLog: FinanceLog = {
        id: `RESERVE_TEAM_EMERGENCY_OUT_${seasonStartYear}_${parentClub.id}_${reserveClub.id}`,
        date: date.toISOString().split('T')[0],
        amount: -supportAmount,
        type: 'EXPENSE',
        description: `Awaryjne wsparcie finansowe drużyny rezerw (${reserveClub.name})`,
        previousBalance: parentClub.budget,
      };
      const reserveIncomeLog: FinanceLog = {
        id: `RESERVE_TEAM_EMERGENCY_IN_${seasonStartYear}_${reserveClub.id}`,
        date: date.toISOString().split('T')[0],
        amount: supportAmount,
        type: 'INCOME',
        description: `Awaryjna dotacja od pierwszej drużyny (${parentClub.name})`,
        previousBalance: reserveClub.budget,
      };

      clubById.set(parentClub.id, {
        ...parentClub,
        budget: parentClub.budget - supportAmount,
        financeHistory: prependFinanceLog(parentClub, parentExpenseLog),
      });
      clubById.set(reserveClub.id, {
        ...reserveClub,
        budget: reserveClub.budget + supportAmount,
        reserveTeamEmergencySupportYear: seasonStartYear,
        financeHistory: prependFinanceLog(reserveClub, reserveIncomeLog),
      });
      changed = true;
    });

    return changed ? clubs.map(club => clubById.get(club.id) ?? club) : clubs;
  },
};
