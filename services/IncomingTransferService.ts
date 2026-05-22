import {
  Club,
  Player,
  IncomingTransferOffer,
  IncomingOfferStatus,
  LoanOfferDuration,
  TransferTiming,
  PlayerPosition,
} from '../types';
import { FinanceService } from './FinanceService';

const TIMING_LABELS: Record<TransferTiming, string> = {
  [TransferTiming.IMMEDIATE]: 'Natychmiast',
  [TransferTiming.IN_SIX_MONTHS]: 'Na kolejne okno transferowe',
  [TransferTiming.IN_TWELVE_MONTHS]: 'Od początku kolejnego sezonu',
  [TransferTiming.CONTRACT_END]: 'Po wygaśnięciu kontraktu',
};

const LOAN_DURATION_LABELS: Record<LoanOfferDuration, string> = {
  ROUND: 'Do końca rundy',
  SEASON: 'Do końca sezonu',
};

export const IncomingTransferService = {
  buildOfferSeed(
    currentDate: Date | string,
    buyerClubId: string,
    playerId: string
  ): number {
    const dateKey = typeof currentDate === 'string'
      ? currentDate
      : currentDate.toISOString().split('T')[0];
    return IncomingTransferService.hashString(`${dateKey}::${buyerClubId}::${playerId}`);
  },

  getTimingLabel(timing: TransferTiming): string {
    return TIMING_LABELS[timing] ?? timing;
  },

  getLoanDurationLabel(duration?: LoanOfferDuration): string {
    return duration ? LOAN_DURATION_LABELS[duration] : 'Wypożyczenie';
  },

  isActiveIncomingOfferStatus(status: IncomingOfferStatus): boolean {
    return (
      status !== IncomingOfferStatus.EXPIRED &&
      status !== IncomingOfferStatus.REJECTED_BY_MANAGER &&
      status !== IncomingOfferStatus.COMPLETED &&
      status !== IncomingOfferStatus.REJECTED_AT_CONFIRM &&
      status !== IncomingOfferStatus.PLAYER_REFUSED
    );
  },

  hasActiveIncomingOfferForPlayer(
    playerId: string,
    activeIncomingOffers: IncomingTransferOffer[],
    kind?: 'TRANSFER' | 'LOAN'
  ): boolean {
    return activeIncomingOffers.some(offer =>
      offer.playerId === playerId &&
      IncomingTransferService.isActiveIncomingOfferStatus(offer.status) &&
      (!kind || (offer.kind ?? 'TRANSFER') === kind)
    );
  },

  getClubTier(club: Club): number {
    return FinanceService.getClubTier(club);
  },

  getBuyerIdealOverall(club: Club): number {
    return Math.min(95, 30 + club.reputation * 4.5);
  },

  getBuyerMinimumTargetOverall(player: Player, buyerClub: Club): number {
    const idealOvr = IncomingTransferService.getBuyerIdealOverall(buyerClub);
    let tolerance = 24;

    if (buyerClub.reputation >= 18) tolerance = 15;
    else if (buyerClub.reputation >= 15) tolerance = 17;
    else if (buyerClub.reputation >= 12) tolerance = 19;
    else if (buyerClub.reputation >= 8) tolerance = 22;

    if (player.isOnTransferList) tolerance += 2;
    if (player.age <= 21) tolerance += 2;

    return idealOvr - tolerance;
  },

  getSquadAverageOverall(squad: Player[]): number {
    if (squad.length === 0) return 0;
    return squad.reduce((sum, squadPlayer) => sum + squadPlayer.overallRating, 0) / squad.length;
  },

  getBuyerSquadFit(player: Player, buyerSquad?: Player[]): { fits: boolean; multiplier: number } {
    if (!buyerSquad || buyerSquad.length === 0) return { fits: true, multiplier: 1.0 };

    const squadAverage = IncomingTransferService.getSquadAverageOverall(buyerSquad);
    if (player.overallRating < squadAverage) {
      return { fits: false, multiplier: 0 };
    }

    const samePosition = buyerSquad.filter(squadPlayer => squadPlayer.position === player.position);
    const positionAverage = samePosition.length > 0
      ? IncomingTransferService.getSquadAverageOverall(samePosition)
      : squadAverage;
    const positionGap = player.overallRating - positionAverage;
    const squadGap = player.overallRating - squadAverage;

    if (positionGap >= 4 || squadGap >= 5) return { fits: true, multiplier: 1.20 };
    if (positionGap >= 1 || squadGap >= 2) return { fits: true, multiplier: 1.05 };
    return { fits: true, multiplier: 0.85 };
  },

  getLoanSquadNeed(
    player: Player,
    buyerSquad?: Player[]
  ): { fits: boolean; needScore: number; positionGap: number; squadGap: number } {
    if (!buyerSquad || buyerSquad.length === 0) {
      return { fits: true, needScore: 9, positionGap: 9, squadGap: 9 };
    }

    const squadAverage = IncomingTransferService.getSquadAverageOverall(buyerSquad);
    const samePosition = buyerSquad.filter(squadPlayer => squadPlayer.position === player.position);
    const positionAverage = samePosition.length > 0
      ? IncomingTransferService.getSquadAverageOverall(samePosition)
      : squadAverage - 3;
    const bestInPosition = samePosition.length > 0
      ? Math.max(...samePosition.map(squadPlayer => squadPlayer.overallRating))
      : squadAverage - 4;
    const positionGap = player.overallRating - positionAverage;
    const bestGap = player.overallRating - bestInPosition;
    const squadGap = player.overallRating - squadAverage;
    const thinPositionBonus = samePosition.length <= 2 ? 2 : 0;
    const needScore = Math.max(positionGap + thinPositionBonus, bestGap * 1.5, squadGap);

    return {
      fits: needScore >= 4 && player.overallRating >= squadAverage + 2,
      needScore,
      positionGap,
      squadGap,
    };
  },

  getLoanBuyerCategory(
    buyerClub: Club,
    sellerClub: Club
  ): 'LOWER_LEAGUE' | 'SAME_LEAGUE' | 'FOREIGN_LOWER_REP' | null {
    const buyerTier = IncomingTransferService.getClubTier(buyerClub);
    const sellerTier = IncomingTransferService.getClubTier(sellerClub);
    const repGap = sellerClub.reputation - buyerClub.reputation;
    const foreignClub =
      !!buyerClub.country &&
      !!sellerClub.country &&
      buyerClub.country !== sellerClub.country;

    if (buyerTier > sellerTier) return 'LOWER_LEAGUE';
    if (buyerClub.leagueId === sellerClub.leagueId) return 'SAME_LEAGUE';
    if (foreignClub && repGap >= 2 && repGap <= 4) return 'FOREIGN_LOWER_REP';
    return null;
  },

  resolveLoanEndDate(currentDate: Date | string, duration: LoanOfferDuration): string {
    const current = new Date(currentDate);
    const year = current.getFullYear();
    const month = current.getMonth();
    let endDate: Date;

    if (duration === 'ROUND') {
      endDate = month <= 0
        ? new Date(year, 0, 31)
        : new Date(year, 11, 31);
    } else {
      endDate = month >= 6
        ? new Date(year + 1, 5, 30)
        : new Date(year, 5, 30);
    }

    if (endDate <= current) {
      endDate = new Date(current);
      endDate.setMonth(endDate.getMonth() + (duration === 'ROUND' ? 5 : 10));
    }

    return endDate.toISOString().split('T')[0];
  },

  calculateLoanTotalCost(
    player: Player,
    loanFee: number,
    wageCoveragePercent: number,
    startDate: Date | string,
    endDate: Date | string
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(30, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
    const wageCost = player.annualSalary * (wageCoveragePercent / 100) * (days / 365);
    return Math.round((loanFee + wageCost) / 1000) * 1000;
  },

  shouldGenerateLoanOffer(
    player: Player,
    buyerClub: Club,
    sellerClub: Club,
    activeIncomingOffers: IncomingTransferOffer[],
    seed: number,
    currentDate: Date | string,
    buyerPlayers?: Player[]
  ): { shouldGenerate: boolean; category: 'LOWER_LEAGUE' | 'SAME_LEAGUE' | 'FOREIGN_LOWER_REP' | null } {
    if (!player.isAvailableForLoan || player.loan || player.transferPendingClubId) {
      return { shouldGenerate: false, category: null };
    }
    if (buyerClub.id === sellerClub.id || buyerClub.rosterIds.length >= 30) {
      return { shouldGenerate: false, category: null };
    }

    const category = IncomingTransferService.getLoanBuyerCategory(buyerClub, sellerClub);
    if (!category) return { shouldGenerate: false, category: null };

    const hasActiveLoanOffer = IncomingTransferService.hasActiveIncomingOfferForPlayer(player.id, activeIncomingOffers, 'LOAN');
    const hasActiveSaleOffer = IncomingTransferService.hasActiveIncomingOfferForPlayer(player.id, activeIncomingOffers, 'TRANSFER');
    if (hasActiveLoanOffer || hasActiveSaleOffer) return { shouldGenerate: false, category: null };

    if (IncomingTransferService.hasRecentIncomingOfferNoise(player, buyerClub, activeIncomingOffers, currentDate)) {
      return { shouldGenerate: false, category: null };
    }

    const need = IncomingTransferService.getLoanSquadNeed(player, buyerPlayers);
    if (!need.fits) return { shouldGenerate: false, category: null };

    const categoryWeight = category === 'LOWER_LEAGUE'
      ? 0.85
      : category === 'SAME_LEAGUE'
        ? 0.125
        : 0.075;
    const repGap = sellerClub.reputation - buyerClub.reputation;
    let chance = 0.045 * categoryWeight;

    if (need.needScore >= 8) chance *= 2.2;
    else if (need.needScore >= 6) chance *= 1.45;
    if (category === 'SAME_LEAGUE') chance *= 0.75;
    if (category === 'FOREIGN_LOWER_REP' && repGap > 3.5) chance *= 0.65;
    if (player.age <= 23) chance *= 1.25;
    if (player.annualSalary > buyerClub.transferBudget * 0.45) chance *= 0.35;

    return {
      shouldGenerate: IncomingTransferService.seededRandom(seed + 2201) < Math.min(0.12, chance),
      category,
    };
  },

  calculateLoanOffer(
    player: Player,
    buyerClub: Club,
    sellerClub: Club,
    currentDate: Date | string,
    seed: number
  ): Pick<IncomingTransferOffer, 'fee' | 'aiMaxFee' | 'aiUrgency' | 'timing' | 'loanDuration' | 'loanStartDate' | 'loanEndDate' | 'wageCoveragePercent' | 'loanFee' | 'loanTotalCost' | 'loanPlayerCanBeForced'> | null {
    const rng1 = IncomingTransferService.seededRandom(seed + 3001);
    const rng2 = IncomingTransferService.seededRandom(seed + 3002);
    const rng3 = IncomingTransferService.seededRandom(seed + 3003);
    const duration: LoanOfferDuration = rng1 < 0.42 ? 'ROUND' : 'SEASON';
    const startDate = typeof currentDate === 'string'
      ? currentDate
      : currentDate.toISOString().split('T')[0];
    const endDate = IncomingTransferService.resolveLoanEndDate(currentDate, duration);

    const repGap = sellerClub.reputation - buyerClub.reputation;
    const coverageOptions = repGap >= 4
      ? [40, 50, 60]
      : repGap >= 2
        ? [50, 60, 75]
        : [60, 75, 100];
    const wageCoveragePercent = coverageOptions[Math.min(coverageOptions.length - 1, Math.floor(rng2 * coverageOptions.length))];

    const marketValue = FinanceService.calculateMarketValue(
      player,
      sellerClub.reputation,
      IncomingTransferService.getClubTier(sellerClub),
      sellerClub.country
    );
    const wantsFee = rng3 > 0.55 || player.overallRating >= IncomingTransferService.getBuyerIdealOverall(buyerClub) + 4;
    const rawLoanFee = wantsFee ? Math.max(player.annualSalary * (0.05 + rng3 * 0.10), marketValue * (0.002 + rng3 * 0.006)) : 0;
    const loanFee = Math.round(rawLoanFee / 1000) * 1000;
    const totalCost = IncomingTransferService.calculateLoanTotalCost(player, loanFee, wageCoveragePercent, startDate, endDate);
    const budgetCeiling = Math.max(0, Math.min(buyerClub.transferBudget, buyerClub.budget * 0.35));

    if (totalCost > budgetCeiling || loanFee > buyerClub.transferBudget) return null;

    const urgency: 1 | 2 | 3 = rng1 < 0.25 ? 3 : rng1 < 0.70 ? 2 : 1;

    return {
      fee: loanFee,
      aiMaxFee: Math.min(buyerClub.transferBudget, Math.round(Math.max(loanFee, loanFee * 1.2) / 1000) * 1000),
      aiUrgency: urgency,
      timing: TransferTiming.IMMEDIATE,
      loanDuration: duration,
      loanStartDate: startDate,
      loanEndDate: endDate,
      wageCoveragePercent,
      loanFee,
      loanTotalCost: totalCost,
      loanPlayerCanBeForced: true,
    };
  },

  evaluateLoanCounterOffer(
    player: Player,
    buyerClub: Club,
    offer: IncomingTransferOffer,
    currentDate: Date | string,
    requested: {
      loanFee: number;
      wageCoveragePercent: number;
      loanDuration: LoanOfferDuration;
    }
  ): {
    result: 'ACCEPT' | 'COUNTER' | 'REJECT';
    loanFee: number;
    wageCoveragePercent: number;
    loanDuration: LoanOfferDuration;
    loanStartDate: string;
    loanEndDate: string;
    loanTotalCost: number;
    note: string;
  } {
    const startDate = offer.loanStartDate || (
      typeof currentDate === 'string'
        ? currentDate
        : currentDate.toISOString().split('T')[0]
    );
    const requestedDuration = requested.loanDuration;
    const requestedEndDate = IncomingTransferService.resolveLoanEndDate(currentDate, requestedDuration);
    const requestedFee = Math.max(0, Math.round(requested.loanFee / 1000) * 1000);
    const requestedCoverage = Math.max(0, Math.min(100, Math.round(requested.wageCoveragePercent / 5) * 5));
    const requestedTotalCost = IncomingTransferService.calculateLoanTotalCost(
      player,
      requestedFee,
      requestedCoverage,
      startDate,
      requestedEndDate
    );

    const urgencyMultiplier = offer.aiUrgency === 3 ? 1.35 : offer.aiUrgency === 2 ? 1.18 : 1.0;
    const originalFee = offer.loanFee ?? offer.fee ?? 0;
    const maxFee = Math.min(
      buyerClub.transferBudget,
      Math.max(offer.aiMaxFee, Math.round(originalFee * (1.15 + offer.aiUrgency * 0.08) / 1000) * 1000)
    );
    const budgetCeiling = Math.max(
      0,
      Math.min(buyerClub.transferBudget, buyerClub.budget * (offer.aiUrgency === 3 ? 0.45 : 0.35))
    );
    const affordableTotal = budgetCeiling * urgencyMultiplier;

    if (requestedFee <= maxFee && requestedTotalCost <= affordableTotal) {
      return {
        result: 'ACCEPT',
        loanFee: requestedFee,
        wageCoveragePercent: requestedCoverage,
        loanDuration: requestedDuration,
        loanStartDate: startDate,
        loanEndDate: requestedEndDate,
        loanTotalCost: requestedTotalCost,
        note: 'Klub zaakceptował kontrofertę. Warunki mieszczą się w budżecie i nadal odpowiadają potrzebie kadrowej.',
      };
    }

    if (requestedFee > buyerClub.transferBudget || requestedTotalCost > affordableTotal * 1.35) {
      return {
        result: 'REJECT',
        loanFee: offer.loanFee ?? offer.fee ?? 0,
        wageCoveragePercent: offer.wageCoveragePercent ?? 0,
        loanDuration: offer.loanDuration ?? 'SEASON',
        loanStartDate: startDate,
        loanEndDate: offer.loanEndDate || IncomingTransferService.resolveLoanEndDate(currentDate, offer.loanDuration ?? 'SEASON'),
        loanTotalCost: offer.loanTotalCost ?? 0,
        note: 'Klub odrzucił kontrofertę. Łączny koszt wypożyczenia przekracza ich realne możliwości finansowe.',
      };
    }

    const counterDuration: LoanOfferDuration =
      requestedDuration === 'SEASON' && requestedTotalCost > budgetCeiling
        ? 'ROUND'
        : requestedDuration;
    const counterEndDate = IncomingTransferService.resolveLoanEndDate(currentDate, counterDuration);
    const counterFee = Math.max(
      offer.loanFee ?? offer.fee ?? 0,
      Math.min(requestedFee, Math.round(maxFee / 1000) * 1000)
    );
    const counterCoverage = Math.max(
      offer.wageCoveragePercent ?? 0,
      Math.min(requestedCoverage, requestedCoverage >= 100 ? 75 : requestedCoverage)
    );
    const counterTotalCost = IncomingTransferService.calculateLoanTotalCost(
      player,
      counterFee,
      counterCoverage,
      startDate,
      counterEndDate
    );

    return {
      result: 'COUNTER',
      loanFee: counterFee,
      wageCoveragePercent: counterCoverage,
      loanDuration: counterDuration,
      loanStartDate: startDate,
      loanEndDate: counterEndDate,
      loanTotalCost: counterTotalCost,
      note: 'Klub nie przyjął pełnej kontroferty, ale przedstawił kompromis mieszczący się bliżej ich budżetu.',
    };
  },

  isPlausibleBuyerForPlayer(player: Player, buyerClub: Club, buyerSquad?: Player[]): boolean {
    const squadFit = IncomingTransferService.getBuyerSquadFit(player, buyerSquad);
    if (!squadFit.fits) return false;

    const minOvr = IncomingTransferService.getBuyerMinimumTargetOverall(player, buyerClub);
    if (player.overallRating >= minOvr) return true;

    const idealOvr = IncomingTransferService.getBuyerIdealOverall(buyerClub);
    const talent = player.attributes?.talent ?? player.overallRating;
    const highUpsideYoungster =
      player.age <= 21 &&
      talent >= idealOvr - 2 &&
      player.overallRating >= minOvr - 8;
    if (highUpsideYoungster) return true;

    const strongRecentForm =
      player.age <= 28 &&
      IncomingTransferService.getAvgRating(player) >= 8.0 &&
      player.overallRating >= minOvr - 4;
    return strongRecentForm;
  },

  getBuyerFitProbabilityMultiplier(player: Player, buyerClub: Club, buyerSquad?: Player[]): number {
    const idealOvr = IncomingTransferService.getBuyerIdealOverall(buyerClub);
    const ovrDelta = player.overallRating - idealOvr;
    const squadFit = IncomingTransferService.getBuyerSquadFit(player, buyerSquad);

    let multiplier = 0.30;
    if (ovrDelta >= -2) multiplier = 1.15;
    else if (ovrDelta >= -6) multiplier = 1.0;
    else if (ovrDelta >= -10) multiplier = 0.75;
    else if (ovrDelta >= -16) multiplier = 0.50;

    return multiplier * squadFit.multiplier;
  },

  hasRecentIncomingOfferNoise(
    player: Player,
    buyerClub: Club,
    incomingOffers: IncomingTransferOffer[],
    currentDate: Date | string
  ): boolean {
    const today = new Date(currentDate);
    const playerOffers = incomingOffers.filter(offer => offer.playerId === player.id);

    return playerOffers.some(offer => {
      const offerDate = new Date(offer.createdAt || offer.emailSentAt);
      const daysSinceOffer = IncomingTransferService.daysBetween(offerDate, today);
      if (daysSinceOffer < 0) return false;

      if (offer.buyerClubId === buyerClub.id && daysSinceOffer < 60) return true;

      if (player.isOnTransferList) {
        return daysSinceOffer < 4;
      }

      switch (offer.status) {
        case IncomingOfferStatus.REJECTED_BY_MANAGER:
        case IncomingOfferStatus.REJECTED_AT_CONFIRM:
          return daysSinceOffer < 21;
        case IncomingOfferStatus.EXPIRED:
        case IncomingOfferStatus.PLAYER_REFUSED:
          return daysSinceOffer < 14;
        case IncomingOfferStatus.COMPLETED:
          return false;
        default:
          return daysSinceOffer < 10;
      }
    });
  },

  isProtectedFromLowerReputationBuyer(
    player: Player,
    buyerClub: Club,
    sellerClub: Club,
    sellerPlayers?: Player[]
  ): boolean {
    if (player.isOnTransferList) return false;

    const reputationGap = sellerClub.reputation - buyerClub.reputation;
    if (reputationGap <= 1) return false;

    const matchesPlayed = player.stats?.matchesPlayed ?? 0;
    const minutesPlayed = player.stats?.minutesPlayed ?? 0;
    const goals = player.stats?.goals ?? 0;
    const assists = player.stats?.assists ?? 0;
    const goalContributions = goals + assists;
    const avgRating = IncomingTransferService.getAvgRating(player);
    const gamesSample = Math.max(matchesPlayed, minutesPlayed / 90);

    const regularPlayer = matchesPlayed >= 6 || minutesPlayed >= 450;
    const goodRecentForm = gamesSample >= 5 && avgRating >= 7.2;
    const productiveForward =
      player.position === PlayerPosition.FWD &&
      gamesSample >= 5 &&
      (goals >= 5 || goals / gamesSample >= 0.25);
    const productiveMidfielder =
      player.position === PlayerPosition.MID &&
      gamesSample >= 5 &&
      (goalContributions >= 6 || goalContributions / gamesSample >= 0.25);
    const productiveSeason = goals >= 8 || goalContributions >= 10;
    const importantRole =
      player.isUntouchable ||
      player.squadRole === 'KEY_PLAYER' ||
      player.squadRole === 'STARTER';

    let importantInSquad = false;
    if (sellerPlayers && sellerPlayers.length > 0) {
      const sortedSquad = [...sellerPlayers].sort((a, b) => b.overallRating - a.overallRating);
      const playerRank = sortedSquad.findIndex(squadPlayer => squadPlayer.id === player.id);
      const squadAverage = IncomingTransferService.getSquadAverageOverall(sellerPlayers);
      importantInSquad =
        (playerRank >= 0 && playerRank <= 10) ||
        player.overallRating >= squadAverage + 2;
    }

    const sellerLevelOverall = Math.max(60, IncomingTransferService.getBuyerIdealOverall(sellerClub) - 7);
    const strongForSellerLevel = player.overallRating >= sellerLevelOverall;
    const isValuableRegular =
      regularPlayer &&
      (strongForSellerLevel || importantRole || importantInSquad || goodRecentForm);

    return (
      importantRole ||
      importantInSquad ||
      isValuableRegular ||
      goodRecentForm ||
      productiveForward ||
      productiveMidfielder ||
      productiveSeason
    );
  },

  shouldGenerateOffer(
    player: Player,
    buyerClub: Club,
    sellerClub: Club,
    activeIncomingOffers: IncomingTransferOffer[],
    seed: number,
    currentDate: Date | string,
    sellerPlayers?: Player[],
    buyerPlayers?: Player[]
  ): { shouldGenerate: boolean; source: 'SHORTLIST' | 'SPONTANEOUS' | null } {
    const hasActiveOffer = activeIncomingOffers.some(
      o =>
        o.playerId === player.id &&
        o.buyerClubId === buyerClub.id &&
        IncomingTransferService.isActiveIncomingOfferStatus(o.status)
    );
    if (hasActiveOffer) return { shouldGenerate: false, source: null };

    if (IncomingTransferService.hasActiveIncomingOfferForPlayer(player.id, activeIncomingOffers, 'LOAN')) {
      return { shouldGenerate: false, source: null };
    }

    if (player.loan) {
      return { shouldGenerate: false, source: null };
    }

    if (IncomingTransferService.hasRecentIncomingOfferNoise(player, buyerClub, activeIncomingOffers, currentDate)) {
      return { shouldGenerate: false, source: null };
    }

    if (
      player.transferLockoutUntil &&
      new Date(currentDate) < new Date(player.transferLockoutUntil)
    ) {
      return { shouldGenerate: false, source: null };
    }

    if (
      player.transferOfferBanUntil &&
      new Date(currentDate) < new Date(player.transferOfferBanUntil)
    ) {
      return { shouldGenerate: false, source: null };
    }

    if (player.transferPendingClubId) {
      return { shouldGenerate: false, source: null };
    }

    if (buyerClub.rosterIds.length >= 30) return { shouldGenerate: false, source: null };
    if (buyerClub.id === sellerClub.id) return { shouldGenerate: false, source: null };
    if (!IncomingTransferService.isPlausibleBuyerForPlayer(player, buyerClub, buyerPlayers)) {
      return { shouldGenerate: false, source: null };
    }

    if (IncomingTransferService.isProtectedFromLowerReputationBuyer(player, buyerClub, sellerClub, sellerPlayers)) {
      return { shouldGenerate: false, source: null };
    }

    if (player.squadRole === 'KEY_PLAYER') {
      const avgRating = IncomingTransferService.getAvgRating(player);
      const isExceptional = player.overallRating >= 75 && avgRating > 7.6;
      if (!isExceptional) return { shouldGenerate: false, source: null };
    }

    const isShortlisted = !!player.interestedClubs?.includes(buyerClub.id);
    const priority = IncomingTransferService.isExceptionalSpontaneousTarget(
      player,
      buyerClub,
      sellerClub,
      currentDate,
      sellerPlayers
    );

    if (player.isUntouchable && !player.isOnTransferList) {
      const buyerIsClearStepUp = buyerClub.reputation >= sellerClub.reputation + 2;
      const eliteInterest = priority === 1 || priority === 2;
      if (!buyerIsClearStepUp || !eliteInterest) {
        return { shouldGenerate: false, source: null };
      }
    }

    const PRIORITY_PROB: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0.0036,
      2: 0.0024,
      3: 0.0018,
      4: 0.0018,
      5: 0.0009,
    };

    let prob = priority !== false ? PRIORITY_PROB[priority] : 0;
    let source: 'SHORTLIST' | 'SPONTANEOUS' | null = null;

    prob *= IncomingTransferService.getBuyerFitProbabilityMultiplier(player, buyerClub, buyerPlayers);

    if (player.isOnTransferList) prob *= 4.0;
    if (player.isUntouchable && !player.isOnTransferList) prob *= 0.18;

    if (player.contractEndDate) {
      const daysLeft = IncomingTransferService.daysUntil(player.contractEndDate, currentDate);
      if (daysLeft < 180) prob *= 1.8;
    }

    if (buyerClub.reputation > sellerClub.reputation) prob *= 1.3;

    if (isShortlisted) {
      prob = Math.max(prob, 0.004);
      prob *= 3.0;
      prob *= 0.85;
      source = 'SHORTLIST';
    } else {
      if (priority === false) {
        return { shouldGenerate: false, source: null };
      }

      const discoveryRoll = IncomingTransferService.seededRandom(seed + 17);
      const discoveryThreshold = priority === 1 ? 0.35 : priority === 2 ? 0.25 : priority <= 4 ? 0.18 : 0.12;
      if (discoveryRoll >= discoveryThreshold) {
        return { shouldGenerate: false, source: null };
      }

      source = 'SPONTANEOUS';
    }

    if (player.squadRole === 'KEY_PLAYER') prob = Math.min(prob, 0.05);

    const rng = IncomingTransferService.seededRandom(seed);
    const shouldGenerate = rng < prob;
    return {
      shouldGenerate,
      source: shouldGenerate ? source : null,
    };
  },

  calculateOffer(
    player: Player,
    buyerClub: Club,
    sellerClub: Club,
    isInsideTransferWindow: boolean,
    seed: number
  ): Pick<IncomingTransferOffer, 'fee' | 'aiMaxFee' | 'aiUrgency' | 'timing'> {
    const sellerTier = IncomingTransferService.getClubTier(sellerClub);
    const marketValue = FinanceService.calculateMarketValue(player, sellerClub.reputation, sellerTier, sellerClub.country);

    const rng1 = IncomingTransferService.seededRandom(seed + 1);
    const rng2 = IncomingTransferService.seededRandom(seed + 2);
    const rng3 = IncomingTransferService.seededRandom(seed + 3);

    const urgency = rng1 < 0.25 ? 1 : rng1 < 0.65 ? 2 : 3;

    let feeMin: number;
    let feeMax: number;
    if (urgency === 1) {
      feeMin = 0.55;
      feeMax = 0.85;
    } else if (urgency === 2) {
      feeMin = 0.85;
      feeMax = 1.15;
    } else {
      feeMin = 1.15;
      feeMax = 1.60;
    }

    if (player.isUntouchable && !player.isOnTransferList) {
      if (urgency === 1) {
        feeMin = 1.35;
        feeMax = 1.70;
      } else if (urgency === 2) {
        feeMin = 1.65;
        feeMax = 2.05;
      } else {
        feeMin = 1.95;
        feeMax = 2.50;
      }
    }

    const feeMultiplier = feeMin + rng2 * (feeMax - feeMin);
    const isLowerRepBuyer = buyerClub.reputation < sellerClub.reputation;
    const repPenalty = isLowerRepBuyer
      ? 0.50 + IncomingTransferService.seededRandom(seed + 4) * 0.20
      : 1.0;
    const fee = Math.round(marketValue * feeMultiplier * repPenalty / 1000) * 1000;

    const maxMultiplier = 1.10 + rng3 * 0.20;
    const aiMaxFee = Math.min(
      Math.round(fee * maxMultiplier / 1000) * 1000,
      buyerClub.budget
    );

    const timing = IncomingTransferService.selectTiming(isInsideTransferWindow, rng1, rng2);

    return { fee, aiMaxFee, aiUrgency: urgency as 1 | 2 | 3, timing };
  },

  selectTiming(isInsideWindow: boolean, _rng1: number, rng2: number): TransferTiming {
    if (isInsideWindow) {
      if (rng2 < 0.45) return TransferTiming.IMMEDIATE;
      if (rng2 < 0.75) return TransferTiming.IN_SIX_MONTHS;
      return TransferTiming.IN_TWELVE_MONTHS;
    }
    if (rng2 < 0.55) return TransferTiming.IN_SIX_MONTHS;
    return TransferTiming.IN_TWELVE_MONTHS;
  },

  evaluateBoardPressure(
    offer: Pick<IncomingTransferOffer, 'fee'>,
    player: Player,
    sellerClub: Club,
    buyerClub?: Club,
    seed?: number
  ): boolean {
    const sellerTier = IncomingTransferService.getClubTier(sellerClub);
    if (sellerClub.budget < 0) return true;
    const marketValue = FinanceService.calculateMarketValue(player, sellerClub.reputation, sellerTier, sellerClub.country);
    if (offer.fee > marketValue * 1.8) return true;
    if (
      player.isOnTransferList &&
      buyerClub &&
      seed !== undefined &&
      buyerClub.reputation < sellerClub.reputation &&
      offer.fee < marketValue
    ) {
      if (IncomingTransferService.seededRandom(seed + 99) < 0.40) return true;
    }
    return false;
  },

  processAICounterResponse(
    offer: IncomingTransferOffer,
    seed: number
  ): { verdict: 'ACCEPT' | 'COUNTER' | 'REJECT'; newFee?: number } {
    const currentDemand = offer.counterFee ?? offer.fee;

    if (currentDemand <= offer.aiMaxFee) {
      return { verdict: 'ACCEPT', newFee: currentDemand };
    }

    const rng = IncomingTransferService.seededRandom(seed);

    if (offer.aiUrgency === 3 && rng < 0.40) {
      const compromise = Math.round(offer.aiMaxFee * (1.02 + rng * 0.05) / 1000) * 1000;
      if (compromise < currentDemand) {
        return { verdict: 'COUNTER', newFee: compromise };
      }
      return { verdict: 'ACCEPT', newFee: offer.aiMaxFee };
    }

    if (offer.aiUrgency === 2 && rng < 0.20) {
      const compromise = Math.round(offer.aiMaxFee * (1.01 + rng * 0.03) / 1000) * 1000;
      if (compromise < currentDemand) {
        return { verdict: 'COUNTER', newFee: compromise };
      }
      return { verdict: 'ACCEPT', newFee: offer.aiMaxFee };
    }

    return { verdict: 'REJECT' };
  },

  simulatePlayerNegotiation(
    player: Player,
    buyerClub: Club,
    sellerClub: Club,
    seed: number,
    currentDate: Date | string
  ): 'accepted' | 'refused' {
    const rng = IncomingTransferService.seededRandom(seed);
    const repDelta = buyerClub.reputation - sellerClub.reputation;

    let acceptChance = 0.55;

    if (repDelta >= 3) acceptChance = 0.85;
    else if (repDelta >= 1) acceptChance = 0.70;
    else if (repDelta === 0) acceptChance = 0.55;
    else if (repDelta === -1) acceptChance = 0.40;
    else acceptChance = 0.25;

    if (player.isOnTransferList) acceptChance += 0.15;
    const daysLeft = IncomingTransferService.daysUntil(player.contractEndDate, currentDate);
    if (daysLeft < 180) acceptChance += 0.10;

    acceptChance = Math.min(0.95, Math.max(0.05, acceptChance));
    return rng < acceptChance ? 'accepted' : 'refused';
  },

  simulateLoanPlayerDecision(
    player: Player,
    buyerClub: Club,
    sellerClub: Club,
    buyerSquad: Player[] | undefined,
    seed: number
  ): 'accepted' | 'refused' {
    const rng = IncomingTransferService.seededRandom(seed);
    const repDelta = buyerClub.reputation - sellerClub.reputation;
    const need = IncomingTransferService.getLoanSquadNeed(player, buyerSquad);

    let acceptChance = 0.48;
    if (repDelta >= 0) acceptChance += 0.18;
    else if (repDelta === -1) acceptChance += 0.04;
    else if (repDelta === -2) acceptChance -= 0.10;
    else acceptChance -= 0.22;

    if (need.needScore >= 8) acceptChance += 0.18;
    else if (need.needScore >= 6) acceptChance += 0.10;
    if (player.age <= 23) acceptChance += 0.12;
    if (player.stats.matchesPlayed <= 3 && player.stats.minutesPlayed < 300) acceptChance += 0.10;
    if (player.squadRole === 'KEY_PLAYER' || player.squadRole === 'STARTER') acceptChance -= 0.20;

    acceptChance = Math.min(0.92, Math.max(0.08, acceptChance));
    return rng < acceptChance ? 'accepted' : 'refused';
  },

  processDailyTimers(
    offers: IncomingTransferOffer[],
    currentDateStr: string
  ): {
    updatedOffers: IncomingTransferOffer[];
    actions: Array<{
      type:
        | 'SEND_REMINDER'
        | 'EXPIRE'
        | 'PROCESS_AI_COUNTER'
        | 'RESOLVE_PLAYER_NEGOTIATION';
      offerId: string;
    }>;
  } {
    const today = new Date(currentDateStr);
    const actions: Array<{
      type:
        | 'SEND_REMINDER'
        | 'EXPIRE'
        | 'PROCESS_AI_COUNTER'
        | 'RESOLVE_PLAYER_NEGOTIATION';
      offerId: string;
    }> = [];

    const updatedOffers = offers.map(offer => {
      const updated = { ...offer };

      if (offer.status === IncomingOfferStatus.EMAIL_SENT) {
        const emailDate = new Date(offer.emailSentAt);
        const daysPassed = IncomingTransferService.daysBetween(emailDate, today);
        if (daysPassed >= 5) {
          updated.status = IncomingOfferStatus.REMINDER_SENT;
          updated.reminderSentAt = currentDateStr;
          actions.push({ type: 'SEND_REMINDER', offerId: offer.id });
        }
      } else if (offer.status === IncomingOfferStatus.REMINDER_SENT) {
        const reminderDate = new Date(offer.reminderSentAt!);
        const daysPassed = IncomingTransferService.daysBetween(reminderDate, today);
        if (daysPassed >= 3) {
          updated.status = IncomingOfferStatus.EXPIRED;
          actions.push({ type: 'EXPIRE', offerId: offer.id });
        }
      } else if (offer.status === IncomingOfferStatus.COUNTER_PENDING_AI) {
        const counterDate = new Date(offer.playerNegotiationStartedAt ?? offer.createdAt);
        const daysPassed = IncomingTransferService.daysBetween(counterDate, today);
        if (daysPassed >= 1) {
          actions.push({ type: 'PROCESS_AI_COUNTER', offerId: offer.id });
        }
      } else if (offer.status === IncomingOfferStatus.NEGOTIATION_IN_PROGRESS) {
        if (offer.playerNegotiationResolvesAt) {
          const resolveDate = new Date(offer.playerNegotiationResolvesAt);
          if (today >= resolveDate) {
            actions.push({ type: 'RESOLVE_PLAYER_NEGOTIATION', offerId: offer.id });
          }
        }
      }

      return updated;
    });

    return { updatedOffers, actions };
  },

  daysUntil(isoDate: string, referenceDate: Date | string = new Date()): number {
    const target = new Date(isoDate);
    const now = new Date(referenceDate);
    return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  },

  daysBetween(from: Date, to: Date): number {
    return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  },

  addDays(isoDate: string, days: number): string {
    const d = new Date(isoDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  },

  getAvgRating(player: Player): number {
    const h = player.stats.ratingHistory;
    if (!h || h.length === 0) return 0;
    return h.reduce((s, r) => s + r, 0) / h.length;
  },

  isExceptionalSpontaneousTarget(
    player: Player,
    buyerClub: Club,
    sellerClub: Club,
    currentDate: Date | string,
    sellerPlayers?: Player[]
  ): 1 | 2 | 3 | 4 | 5 | false {
    if (player.isOnTransferList) {
      let isBestPlayerListed = false;
      if (sellerPlayers) {
        const squadBestOvr = Math.max(...sellerPlayers.map(p => p.overallRating));
        isBestPlayerListed = player.overallRating >= squadBestOvr;
      }
      return isBestPlayerListed ? 1 : 3;
    }

    const ovr = player.overallRating;
    const age = player.age;
    const avgRating = IncomingTransferService.getAvgRating(player);
    const goals = player.stats.goals;
    const assists = player.stats.assists;
    const talent = player.attributes.talent;
    const isFwd = player.position === PlayerPosition.FWD;
    const isMid = player.position === PlayerPosition.MID;

    // Priorytet 1: talent/elite + młody
    if (ovr >= 80 && talent >= 80 && age >= 16 && age <= 24) return 1;

    // Priorytet 2: elite + do 28 lat + wysoka forma
    if (ovr >= 80 && age <= 28 && avgRating >= 7.5) return 2;

    // Priorytet 3: napastnik elite + gole + forma
    if (isFwd && ovr >= 80 && age <= 30 && goals >= 10 && avgRating >= 7.2) return 3;

    // Priorytet 4: pomocnik elite + asysty + forma
    if (isMid && ovr >= 80 && age <= 30 && assists >= 10 && avgRating >= 7.2) return 4;

    // Priorytet 5: wysoka forma niezależnie od wieku
    if (avgRating >= 7.2) return 5;

    return false;
  },

  hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  },

  seededRandom(seed: number): number {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  },
};
