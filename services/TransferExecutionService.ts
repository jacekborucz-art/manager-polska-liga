import { Club, Player, TransferOffer } from '../types';
import { FinanceService } from './FinanceService';
import { PlayerCareerService } from './PlayerCareerService';
import { PlayerMoraleService } from './PlayerMoraleService';
import { PlayerReputationGrowthService } from './PlayerReputationGrowthService';

interface TransferExecutionResult {
  updatedClubs: Club[];
  updatedPlayers: Record<string, Player[]>;
}

const buildFinanceLog = (
  amount: number,
  description: string,
  date: Date,
  previousBalance: number
) => ({
  id: Math.random().toString(36).substr(2, 9),
  date: date.toISOString().split('T')[0],
  amount,
  type: amount >= 0 ? ('INCOME' as const) : ('EXPENSE' as const),
  description,
  previousBalance
});

export const TransferExecutionService = {
  finalizeTransfer: (
    offer: TransferOffer,
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date
  ): TransferExecutionResult => {
    const buyerClub = clubs.find(c => c.id === offer.buyerClubId);
    const sellerClub = clubs.find(c => c.id === offer.sellerClubId);
    const sellerSquad = playersMap[offer.sellerClubId] || [];
    const buyerSquad = playersMap[offer.buyerClubId] || [];
    const player = sellerSquad.find(p => p.id === offer.playerId);

    if (!buyerClub || !sellerClub || !player || !offer.salary || offer.bonus === undefined || !offer.years) {
      return { updatedClubs: clubs, updatedPlayers: playersMap };
    }

    if (player.loan) {
      return { updatedClubs: clubs, updatedPlayers: playersMap };
    }

    const newEndDate = new Date(currentDate.getFullYear() + offer.years, 5, 30).toISOString();
    // Protect a new signing for six months so AI clubs cannot instantly resell or push him out.
    const transferLockoutDate = new Date(currentDate);
    transferLockoutDate.setMonth(transferLockoutDate.getMonth() + 6);
    const transferOfferBanDate = new Date(currentDate);
    transferOfferBanDate.setFullYear(transferOfferBanDate.getFullYear() + 1);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const buyerTier = FinanceService.getClubTier(buyerClub);

    const updatedHistory = PlayerCareerService.movePlayer(
      player,
      { clubName: buyerClub.name, clubId: buyerClub.id },
      currentYear,
      currentMonth,
      { clubName: sellerClub.name, clubId: sellerClub.id },
      offer.fee
    );

    const transferredPlayerBase: Player = {
      ...PlayerMoraleService.applyContractSigningMindflowReset(
        PlayerCareerService.resetClubStatsForNewEntry(player),
        currentDate
      ),
      clubId: buyerClub.id,
      annualSalary: offer.salary,
      goalBonus: offer.goalBonus ?? undefined,
      assistBonus: offer.assistBonus ?? undefined,
      cleanSheetBonus: offer.cleanSheetBonus ?? undefined,
      contractEndDate: newEndDate,
      marketValue: FinanceService.calculateMarketValue(player, buyerClub.reputation, buyerTier, buyerClub.country),
      history: updatedHistory,
      purchaseFee: offer.fee > 0 ? offer.fee : undefined,
      isOnTransferList: false,
      isAvailableForLoan: false,
      interestedClubs: [],
      transferLockoutUntil: transferLockoutDate.toISOString(),
      transferOfferBanUntil: transferOfferBanDate.toISOString()
    };
    const transferredPlayer = PlayerReputationGrowthService.applyTransferUpgrade(
      transferredPlayerBase,
      sellerClub.reputation,
      buyerClub.reputation
    );

    const updatedPlayers: Record<string, Player[]> = {
      ...playersMap,
      [sellerClub.id]: sellerSquad.filter(p => p.id !== player.id),
      [buyerClub.id]: [...buyerSquad, transferredPlayer]
    };

    const updatedClubs = clubs.map(club => {
      if (club.id === buyerClub.id) {
        const bonus = offer.bonus ?? 0;
        const contractCost = offer.fee + bonus + (offer.salary || 0) * (offer.years || 0);
        const nextTransferBudget = Math.max(0, club.transferBudget - contractCost);
        const buyerFeeLog = buildFinanceLog(
          -offer.fee,
          `Kwota transferu za ${player.firstName} ${player.lastName}`,
          currentDate,
          club.budget
        );
        const buyerBonusLog = buildFinanceLog(
          -bonus,
          `Bonus za podpis dla ${player.firstName} ${player.lastName}`,
          currentDate,
          club.budget - offer.fee
        );

        return {
          ...club,
          transferBudget: nextTransferBudget,
          signingBonusPool: Math.max(0, club.signingBonusPool - bonus),
          rosterIds: [...club.rosterIds, player.id],
          financeHistory: [buyerBonusLog, buyerFeeLog, ...(club.financeHistory || [])].slice(0, 50)
        };
      }

      if (club.id === sellerClub.id) {
        const sellerIncomeLog = buildFinanceLog(
          offer.fee,
          `Sprzedaż zawodnika ${player.firstName} ${player.lastName}`,
          currentDate,
          club.budget
        );

        return {
          ...club,
          budget: club.budget + offer.fee,
          rosterIds: club.rosterIds.filter(id => id !== player.id),
          financeHistory: [sellerIncomeLog, ...(club.financeHistory || [])].slice(0, 50)
        };
      }

      return club;
    });

    return { updatedClubs, updatedPlayers };
  }
};
