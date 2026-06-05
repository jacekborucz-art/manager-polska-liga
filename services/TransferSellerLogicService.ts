import { Club, Player, PlayerPosition, TransferClubBidInput, TransferTiming, BoardAttributeLevel } from '../types';
import { FinanceService } from './FinanceService';

interface SellerDecisionResult {
  verdict: 'REJECT' | 'COUNTER' | 'ACCEPT';
  reason: string;
  askingPrice: number;
}

interface SellerOpeningStance {
  allowTalks: boolean;
  reason: string;
  askingPrice: number;
}

interface SellerNegotiationContext {
  currentAskingPrice?: number;
  attemptNumber?: number;
  maxAttempts?: number;
}

const MIN_POSITION_DEPTH: Record<PlayerPosition, number> = {
  GK: 2,
  DEF: 5,
  MID: 4,
  FWD: 3
};

const POLISH_TRANSFER_CAP_BY_TIER: Record<number, number> = {
  1: 23_500_000,
  2: 7_000_000,
  3: 2_000_000,
  4: 450_000,
  5: 225_000,
};

const getPolishAgeTransferCap = (player: Player, tier: number): number => {
  const tierScale = ({
    1: 1.00,
    2: 0.36,
    3: 0.12,
    4: 0.04,
    5: 0.02,
  } as Record<number, number>)[tier] ?? 0.02;

  let ekstraklasaCap = 0;

  switch (player.position) {
    case PlayerPosition.GK:
      if (player.age <= 23) ekstraklasaCap = 10_000_000;
      else if (player.age <= 29) ekstraklasaCap = 13_000_000;
      else if (player.age <= 32) ekstraklasaCap = 8_000_000;
      else if (player.age <= 34) ekstraklasaCap = 4_800_000;
      else ekstraklasaCap = 2_800_000;
      break;
    case PlayerPosition.DEF:
      if (player.age <= 21) ekstraklasaCap = 12_000_000;
      else if (player.age <= 24) ekstraklasaCap = 15_000_000;
      else if (player.age <= 29) ekstraklasaCap = 13_500_000;
      else if (player.age <= 32) ekstraklasaCap = 8_000_000;
      else if (player.age <= 34) ekstraklasaCap = 4_800_000;
      else ekstraklasaCap = 2_800_000;
      break;
    default:
      if (player.age <= 21) ekstraklasaCap = 23_500_000;
      else if (player.age <= 24) ekstraklasaCap = 20_000_000;
      else if (player.age <= 29) ekstraklasaCap = 16_000_000;
      else if (player.age <= 32) ekstraklasaCap = 8_500_000;
      else if (player.age <= 34) ekstraklasaCap = 4_500_000;
      else ekstraklasaCap = 2_600_000;
      break;
  }

  return ekstraklasaCap * tierScale;
};

const roundToNearest50k = (value: number) => Math.round(Math.max(100_000, value) / 50_000) * 50_000;
const isPolishClub = (club: Pick<Club, 'id' | 'leagueId'>): boolean =>
  club.id.startsWith('PL_') || club.leagueId.startsWith('PL_');

const applyInternationalAskingGuardrail = (
  value: number,
  baseValue: number,
  player: Player,
  contractDaysLeft: number,
  club: Pick<Club, 'id' | 'leagueId'>
): number => {
  if (isPolishClub(club)) return value;

  let maxMarkup = player.isUntouchable ? 1.38 : 1.30;
  if (player.isOnTransferList) maxMarkup = Math.min(maxMarkup, 1.05);
  else if (contractDaysLeft > 0 && contractDaysLeft < PRE_CONTRACT_PRIORITY_DAYS) maxMarkup = Math.min(maxMarkup, 1.15);
  if (player.age >= 32) maxMarkup -= 0.05;
  else if (player.age >= 29) maxMarkup -= 0.02;

  return Math.min(value, baseValue * Math.max(1.02, maxMarkup));
};

const applyTransferCap = (
  value: number,
  club: Pick<Club, 'id' | 'leagueId' | 'tier'>,
  player?: Player
): number => {
  if (!isPolishClub(club)) return roundToNearest50k(value);
  const tierCap = player
    ? Math.min(
        POLISH_TRANSFER_CAP_BY_TIER[club.tier] ?? 225_000,
        getPolishAgeTransferCap(player, club.tier)
      )
    : (POLISH_TRANSFER_CAP_BY_TIER[club.tier] ?? 225_000);
  return roundToNearest50k(Math.min(value, tierCap));
};

const getTimingPriceMultiplier = (timing: TransferTiming): number => {
  switch (timing) {
    case TransferTiming.IN_SIX_MONTHS:
      return 1.08;
    case TransferTiming.IN_TWELVE_MONTHS:
      return 1.20;
    case TransferTiming.CONTRACT_END:
      return 0;
    default:
      return 1;
  }
};

const getTimingLabel = (timing: TransferTiming): string => {
  switch (timing) {
    case TransferTiming.IN_SIX_MONTHS:
      return 'za 6 miesiecy';
    case TransferTiming.IN_TWELVE_MONTHS:
      return 'za 12 miesiecy';
    case TransferTiming.CONTRACT_END:
      return 'po wygasnieciu obecnej umowy';
    default:
      return 'natychmiast';
  }
};

const PRE_CONTRACT_PRIORITY_DAYS = 330;

export const TransferSellerLogicService = {
  generateNegotiationAttemptLimit: (): number => Math.floor(Math.random() * 7) + 1,

  getNegotiationStance: (
    player: Player,
    sellerClub: Club,
    buyerClub: Club,
    sellerSquad: Player[],
    currentDate: Date,
    timing: TransferTiming = TransferTiming.IMMEDIATE,
    boardKompetencja?: BoardAttributeLevel,
    coachFavoriteIds?: string[]
  ): SellerOpeningStance => {
    const baseAskingPrice = TransferSellerLogicService.estimateAskingPrice(
      player,
      sellerClub,
      sellerSquad,
      currentDate,
      boardKompetencja
    );
    const askingPrice = applyTransferCap(baseAskingPrice * getTimingPriceMultiplier(timing), sellerClub, player);

    if (!player.isUntouchable && !player.isOnTransferList && coachFavoriteIds && coachFavoriteIds.includes(player.id) && Math.random() < 0.12) {
      return {
        allowTalks: false,
        askingPrice,
        reason: `Zarząd odrzucił zapytanie. Trener uznaje tego zawodnika za kluczową postać składu i nie zgadza się na jego odejście.`
      };
    }

    const sortedSquad = [...sellerSquad].sort((a, b) => b.overallRating - a.overallRating);
    const playerRank = Math.max(0, sortedSquad.findIndex(item => item.id === player.id));
    const isBestPlayer = playerRank === 0;
    const isTopThree = playerRank <= 2;
    const isTopEleven = playerRank <= 10;
    const sameLeague = sellerClub.leagueId === buyerClub.leagueId;
    const reputationGap = buyerClub.reputation - sellerClub.reputation;
    const daysLeft = Math.floor(
      (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000
    );
    const sellerNeedsCash = sellerClub.budget < Math.max(askingPrice * 0.7, 4_000_000);

    if (timing !== TransferTiming.CONTRACT_END && daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS) {
      return {
        allowTalks: false,
        askingPrice: 0,
        reason: `Kontrakt zawodnika wygasa za ${daysLeft} dni. Klub kupujący powinien rozmawiać z zawodnikiem o wolnym transferze po wygaśnięciu umowy.`
      };
    }

    if (timing === TransferTiming.CONTRACT_END && player.isNegotiationPermanentBlocked && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS) {
      return {
        allowTalks: true,
        askingPrice: 0,
        reason: `Zawodnik odmowil przedluzenia umowy. Klub nie zada odstepnego za transfer po wygasnieciu kontraktu.`
      };
    }

    const blocksShortDelaySale =
      timing === TransferTiming.IMMEDIATE || timing === TransferTiming.IN_SIX_MONTHS;

    const protectedByCorePlan = !!player.isUntouchable;
    const coachSeesAsImportant = !!coachFavoriteIds?.includes(player.id);
    if (
      protectedByCorePlan &&
      !player.isOnTransferList &&
      !sellerNeedsCash &&
      daysLeft > PRE_CONTRACT_PRIORITY_DAYS &&
      blocksShortDelaySale &&
      reputationGap < 5
    ) {
      return {
        allowTalks: false,
        askingPrice,
        reason: coachSeesAsImportant
          ? `Zarzad odrzucil zapytanie. Trener i klub uznaja tego zawodnika za kluczowa postac skladu.`
          : `Zarzad odrzucil zapytanie. Klub traktuje tego zawodnika jako czesc rdzenia skladu.`
      };
    }

    if (protectedByCorePlan && !player.isOnTransferList && daysLeft > PRE_CONTRACT_PRIORITY_DAYS) {
      const coreAskingPrice = applyTransferCap(askingPrice * (sellerNeedsCash ? 1.15 : 1.35), sellerClub, player);
      return {
        allowTalks: true,
        askingPrice: coreAskingPrice,
        reason: `Klub nie planuje sprzedazy kluczowego zawodnika, ale dopusci rozmowy tylko przy wyjatkowej ofercie. Cena wyjsciowa wynosi ${coreAskingPrice.toLocaleString()} PLN.`
      };
    }

    const protectedRivalSale =
      sameLeague &&
      !player.isOnTransferList &&
      !sellerNeedsCash &&
      (player.isUntouchable || isBestPlayer) &&
      reputationGap <= 1 &&
      daysLeft > PRE_CONTRACT_PRIORITY_DAYS;

    if (protectedRivalSale && blocksShortDelaySale) {
      return {
        allowTalks: false,
        askingPrice,
        reason: `Klub nie podejmie rozmow. ${sellerClub.name} nie zamierza sprzedawac kluczowego zawodnika bezposredniemu rywalowi z ligi w tym terminie.`
      };
    }

    const protectedTopElevenSale =
      sameLeague &&
      !player.isOnTransferList &&
      !sellerNeedsCash &&
      isTopEleven &&
      reputationGap <= 0 &&
      daysLeft > PRE_CONTRACT_PRIORITY_DAYS;

    if (protectedTopElevenSale && blocksShortDelaySale) {
      return {
        allowTalks: false,
        askingPrice,
        reason: `Klub nie jest sklonny sprzedac waznego zawodnika do ligowego rywala w tym terminie.`
      };
    }

    if ((protectedRivalSale || protectedTopElevenSale) && timing === TransferTiming.IN_TWELVE_MONTHS) {
      const delayedAskingPrice = applyTransferCap(askingPrice * 1.20, sellerClub, player);
      return {
        allowTalks: true,
        askingPrice: delayedAskingPrice,
        reason: `Klub nie chce sprzedawac tego zawodnika od razu, ale dopuszcza transfer ${getTimingLabel(timing)}. Cena wyjsciowa wynosi ${delayedAskingPrice.toLocaleString()} PLN.`
      };
    }

    if (
      sameLeague &&
      isTopThree &&
      !player.isOnTransferList &&
      reputationGap <= 1
    ) {
      return {
        allowTalks: true,
        askingPrice,
        reason: `Klub dopuszcza rozmowy o transferze ${getTimingLabel(timing)}, ale tylko przy ofercie wyjatkowej. Cena wyjsciowa wynosi ${askingPrice.toLocaleString()} PLN.`
      };
    }

    return {
      allowTalks: true,
      askingPrice,
      reason: `Klub jest gotow rozmawiac o transferze ${getTimingLabel(timing)}. Cena wyjsciowa wynosi ${askingPrice.toLocaleString()} PLN.`
    };
  },

  estimateAskingPrice: (
    player: Player,
    sellerClub: Club,
    sellerSquad: Player[],
    currentDate: Date,
    boardKompetencja?: BoardAttributeLevel
  ): number => {
    const tier = FinanceService.getClubTier(sellerClub);
    const rawBaseValue = player.transferListPrice
      ? player.transferListPrice
      : FinanceService.calculateMarketValue(player, sellerClub.reputation, tier, sellerClub.country);
    const KOMPETENCJA_SELL_MULTIPLIER: Record<BoardAttributeLevel, number> = {
      bardzo_wysoka: 1.15,
      wysoka:        1.07,
      przecietna:    1.00,
      niska:         0.95,
      bardzo_niska:  0.88,
    };
    const kompMult = boardKompetencja ? KOMPETENCJA_SELL_MULTIPLIER[boardKompetencja] : 1.00;
    const baseValue = rawBaseValue * kompMult;

    let multiplier = 1.0;
    const daysLeft = Math.floor(
      (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000
    );

    if (player.isOnTransferList && !player.transferListPrice) multiplier -= 0.18;
    if (daysLeft > 0 && daysLeft < 180) multiplier -= 0.22;
    else if (daysLeft > 0 && daysLeft < PRE_CONTRACT_PRIORITY_DAYS) multiplier -= 0.12;
    else if (daysLeft >= PRE_CONTRACT_PRIORITY_DAYS && daysLeft < 730) multiplier += 0.04;
    else if (daysLeft >= 730) multiplier += 0.10;

    if (player.age <= 21) multiplier += 0.12;
    else if (player.age <= 24) multiplier += 0.06;
    else if (player.age >= 34) multiplier -= 0.18;
    else if (player.age >= 31) multiplier -= 0.10;
    if (player.isUntouchable) multiplier += 0.30;
    if (player.squadRole === 'KEY_PLAYER') multiplier += 0.18;
    else if (player.squadRole === 'STARTER') multiplier += 0.08;

    const sortedSquad = [...sellerSquad].sort((a, b) => b.overallRating - a.overallRating);
    const top11Ids = sortedSquad.slice(0, 11).map(p => p.id);
    if (top11Ids.includes(player.id)) multiplier += 0.14;
    if (sortedSquad.slice(0, 3).some(p => p.id === player.id)) multiplier += 0.08;
    if (sortedSquad[0]?.id === player.id) multiplier += 0.10;

    const samePosition = sellerSquad.filter(p => p.position === player.position && p.id !== player.id);
    const bestReplacement = samePosition.sort((a, b) => b.overallRating - a.overallRating)[0];
    const minimumDepth = MIN_POSITION_DEPTH[player.position];

    if (samePosition.length < minimumDepth) multiplier += 0.18;
    if (!bestReplacement) multiplier += 0.12;
    if (bestReplacement && player.overallRating - bestReplacement.overallRating >= 6) multiplier += 0.10;

    const financialPressure = sellerClub.budget < Math.max(baseValue * 0.75, 3_000_000);
    if (financialPressure) multiplier -= 0.10;

    let minimumMultiplier = player.isOnTransferList ? 0.75 : 1.0;
    if (daysLeft > PRE_CONTRACT_PRIORITY_DAYS && !player.isOnTransferList) {
      minimumMultiplier = Math.max(minimumMultiplier, 1.02);
    }

    if (top11Ids.includes(player.id)) minimumMultiplier = Math.max(minimumMultiplier, 1.08);
    if (sortedSquad.slice(0, 3).some(p => p.id === player.id)) minimumMultiplier = Math.max(minimumMultiplier, 1.15);
    if (player.isUntouchable || sortedSquad[0]?.id === player.id) minimumMultiplier = Math.max(minimumMultiplier, 1.25);
    if (player.squadRole === 'KEY_PLAYER') minimumMultiplier = Math.max(minimumMultiplier, 1.20);
    else if (player.squadRole === 'STARTER') minimumMultiplier = Math.max(minimumMultiplier, 1.10);
    if (daysLeft >= 730 && !player.isOnTransferList) minimumMultiplier = Math.max(minimumMultiplier, 1.10);

    const rawPrice = Math.max(100_000, baseValue * Math.max(multiplier, minimumMultiplier));
    const guardedPrice = applyInternationalAskingGuardrail(rawPrice, baseValue, player, daysLeft, sellerClub);
    return applyTransferCap(guardedPrice, sellerClub, player);
  },

  evaluateSellerDecision: (
    offer: TransferClubBidInput,
    player: Player,
    sellerClub: Club,
    buyerClub: Club,
    sellerSquad: Player[],
    currentDate: Date,
    negotiationContext?: SellerNegotiationContext,
    coachFavoriteIds?: string[]
  ): SellerDecisionResult => {
    const openingStance = TransferSellerLogicService.getNegotiationStance(
      player,
      sellerClub,
      buyerClub,
      sellerSquad,
      currentDate,
      offer.timing,
      undefined,
      coachFavoriteIds
    );
    if (!openingStance.allowTalks) {
      return {
        verdict: 'REJECT',
        askingPrice: openingStance.askingPrice,
        reason: openingStance.reason
      };
    }

    const askingPrice = roundToNearest50k(
      negotiationContext?.currentAskingPrice || openingStance.askingPrice
    );
    const attemptNumber = Math.max(1, negotiationContext?.attemptNumber || 1);
    const maxAttempts = Math.max(1, negotiationContext?.maxAttempts || 3);
    const ratio = offer.fee / Math.max(askingPrice, 1);
    if (offer.fee >= askingPrice) {
      return {
        verdict: 'ACCEPT',
        askingPrice,
        reason: `Klub zaakceptowal warunki odstepnego. Ustalona cena: ${offer.fee.toLocaleString()} PLN.`
      };
    }

    if (ratio < 0.60) {
      return {
        verdict: 'REJECT',
        askingPrice,
        reason: `Oferta zostala odebrana jako niepowazna. Klub oczekuje minimum ${askingPrice.toLocaleString()} PLN.`
      };
    }

    if (attemptNumber >= maxAttempts) {
      return {
        verdict: 'REJECT',
        askingPrice,
        reason: `Klub uznal, ze stanowiska obu stron sa zbyt odlegle i konczy rozmowy. Oczekiwana cena nie spadla ponizej ${askingPrice.toLocaleString()} PLN.`
      };
    }

    const negotiationVariance = 1 + ((Math.random() * 0.04) - 0.02);
    const counterPrice = roundToNearest50k(askingPrice * negotiationVariance);
    const normalizedCounterPrice = Math.max(
      roundToNearest50k(askingPrice * 0.97),
      Math.min(roundToNearest50k(askingPrice * 1.03), counterPrice)
    );

    return {
      verdict: 'COUNTER',
      askingPrice: normalizedCounterPrice,
      reason: `Klub nie zaakceptuje ${offer.fee.toLocaleString()} PLN. Oczekiwana cena to ${normalizedCounterPrice.toLocaleString()} PLN.`
    };
  }
};
