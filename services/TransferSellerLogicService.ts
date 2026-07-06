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
const ELITE_CLUB_REPUTATION_MIN = 18;
const SUPER_CLUB_REPUTATION_MIN = 19;
const ABSOLUTE_TOP_CLUB_REPUTATION = 20;
const YOUNG_CORE_AGE_MAX = 23;
const VETERAN_SALE_AGE_MIN = 29;

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
};

const seededChance = (seed: string): number => {
  const hash = hashString(seed);
  return (hash % 10_000) / 10_000;
};

const isYoungHighOverallCore = (player: Player, sellerClub: Club, sellerSquad: Player[]): boolean => {
  if (sellerClub.reputation < ELITE_CLUB_REPUTATION_MIN || player.age > YOUNG_CORE_AGE_MAX) return false;

  const eliteOverallThreshold = Math.max(74, sellerClub.reputation + 55);
  if (player.overallRating < eliteOverallThreshold) return false;

  const squadRank = [...sellerSquad]
    .sort((a, b) => b.overallRating - a.overallRating)
    .findIndex(item => item.id === player.id);

  return squadRank >= 0 && squadRank <= 10;
};

const isSuperClubHighOverallPlayer = (player: Player, sellerClub: Club): boolean => {
  if (sellerClub.reputation < SUPER_CLUB_REPUTATION_MIN) return false;
  const highOverallThreshold = Math.max(78, sellerClub.reputation + 59);
  return player.overallRating >= highOverallThreshold;
};

const isSuperVeteranExceptionPosition = (position: PlayerPosition): boolean =>
  position === PlayerPosition.GK || position === PlayerPosition.MID || position === PlayerPosition.FWD;

const isSuperVeteranStillProtected = (player: Player, sellerClub: Club): boolean => {
  if (player.age < VETERAN_SALE_AGE_MIN || !isSuperVeteranExceptionPosition(player.position)) return false;
  const superVeteranThreshold = Math.max(83, sellerClub.reputation + 63);
  return player.overallRating >= superVeteranThreshold;
};

const hasSeriousFinancialPressure = (club: Club, askingPrice: number): boolean =>
  club.budget < Math.max(askingPrice * 0.70, 4_000_000);

const canEliteClubConsiderYoungCoreSale = (
  player: Player,
  sellerClub: Club,
  buyerClub: Club,
  currentDate: Date
): boolean => {
  if (buyerClub.reputation < ABSOLUTE_TOP_CLUB_REPUTATION) return false;
  if (sellerClub.reputation >= ABSOLUTE_TOP_CLUB_REPUTATION) return false;

  const reputationJump = buyerClub.reputation - sellerClub.reputation;
  if (reputationJump <= 0 || reputationJump > 2) return false;

  // Keep elite-club young core sales rare, but allow a stable monthly exception for moves into the absolute top.
  const monthlySeed = `${sellerClub.id}_${buyerClub.id}_${player.id}_${currentDate.getFullYear()}_${currentDate.getMonth()}`;
  const chance = sellerClub.reputation === 18 ? 0.28 : 0.16;
  return seededChance(monthlySeed) < chance;
};

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
    const sellerNeedsCash = hasSeriousFinancialPressure(sellerClub, askingPrice);
    const buyerAvailableCash = Math.max(buyerClub.budget || 0, buyerClub.transferBudget || 0);
    const getExceptionalAskingPrice = (multiplier: number): number =>
      Math.max(
        askingPrice,
        applyTransferCap(Math.max(askingPrice, baseAskingPrice) * multiplier, sellerClub, player)
      );

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

    const protectedEliteYoungCore =
      !player.isOnTransferList &&
      isYoungHighOverallCore(player, sellerClub, sellerSquad) &&
      daysLeft > PRE_CONTRACT_PRIORITY_DAYS &&
      blocksShortDelaySale;

    if (protectedEliteYoungCore && !sellerNeedsCash) {
      const eliteJumpAllowed = canEliteClubConsiderYoungCoreSale(player, sellerClub, buyerClub, currentDate);
      const eliteAskingPrice = getExceptionalAskingPrice(eliteJumpAllowed ? 3.15 : 3.50);

      if (eliteJumpAllowed && buyerAvailableCash >= eliteAskingPrice * 0.92) {
        return {
          allowTalks: true,
          askingPrice: eliteAskingPrice,
          reason: `Zarzad chroni mlody rdzen skladu, ale wyjatkowy awans sportowy do klubu o reputacji 20 otwiera rozmowy. Cena wyjsciowa wynosi ${eliteAskingPrice.toLocaleString()} PLN.`
        };
      }

      return {
        allowTalks: false,
        askingPrice,
        reason: `Zarzad odrzucil zapytanie. Klub o reputacji ${sellerClub.reputation} nie sprzedaje mlodego zawodnika z wysokim overall bez powaznej presji finansowej.`
      };
    }

    const protectedSuperClubHighOverall =
      !player.isOnTransferList &&
      isSuperClubHighOverallPlayer(player, sellerClub) &&
      daysLeft > PRE_CONTRACT_PRIORITY_DAYS &&
      blocksShortDelaySale &&
      (player.age < VETERAN_SALE_AGE_MIN || isSuperVeteranStillProtected(player, sellerClub));

    if (protectedSuperClubHighOverall && !sellerNeedsCash) {
      const superClubAskingPrice = getExceptionalAskingPrice(isSuperVeteranStillProtected(player, sellerClub) ? 3.20 : 3.75);
      const monthlySeed = `${sellerClub.id}_${buyerClub.id}_${player.id}_super_core_${currentDate.getFullYear()}_${currentDate.getMonth()}`;
      const rareBoardApproval = buyerClub.reputation > sellerClub.reputation && buyerClub.reputation >= ABSOLUTE_TOP_CLUB_REPUTATION && seededChance(monthlySeed) < 0.08;

      // Reputation 19-20 clubs almost never sell high-overall players unless the board approves a rare step into the absolute top.
      if (rareBoardApproval && buyerAvailableCash >= superClubAskingPrice * 0.95) {
        return {
          allowTalks: true,
          askingPrice: superClubAskingPrice,
          reason: `Zarzad bardzo niechetnie dopuszcza rozmowy o zawodniku z wysokim overall, ale wyjatkowy ruch do klubu o reputacji 20 moze przejsc. Cena wyjsciowa wynosi ${superClubAskingPrice.toLocaleString()} PLN.`
        };
      }

      return {
        allowTalks: false,
        askingPrice,
        reason: `Zarzad odrzucil zapytanie. Klub o reputacji ${sellerClub.reputation} nie oddaje zawodnika z wysokim overall bez tarapatu finansowego albo bardzo szczegolnego ukladu sportowego.`
      };
    }

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
      const exceptionalAskingPrice = getExceptionalAskingPrice(coachSeesAsImportant ? 2.35 : 2.10);
      if (buyerAvailableCash >= exceptionalAskingPrice * 0.85) {
        return {
          allowTalks: true,
          askingPrice: exceptionalAskingPrice,
          reason: coachSeesAsImportant
            ? `Zarzad nie chce sprzedawac ulubienca trenera, ale przy bardzo wysokiej ofercie dopusci rozmowy. Cena wyjsciowa wynosi ${exceptionalAskingPrice.toLocaleString()} PLN.`
            : `Klub traktuje zawodnika jako czesc rdzenia skladu, ale przy bardzo wysokiej ofercie dopusci rozmowy. Cena wyjsciowa wynosi ${exceptionalAskingPrice.toLocaleString()} PLN.`
        };
      }

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
      const rivalAskingPrice = getExceptionalAskingPrice(2.45);
      if (buyerAvailableCash >= rivalAskingPrice * 0.90) {
        return {
          allowTalks: true,
          askingPrice: rivalAskingPrice,
          reason: `Klub nie chce wzmacniac ligowego rywala, ale bardzo wysoka oferta moze przelamac opor. Cena wyjsciowa wynosi ${rivalAskingPrice.toLocaleString()} PLN.`
        };
      }

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
      const protectedAskingPrice = getExceptionalAskingPrice(1.85);
      if (buyerAvailableCash >= protectedAskingPrice * 0.90) {
        return {
          allowTalks: true,
          askingPrice: protectedAskingPrice,
          reason: `Klub nie planuje sprzedazy waznego zawodnika, ale przy wyraznej nadplacie dopusci rozmowy. Cena wyjsciowa wynosi ${protectedAskingPrice.toLocaleString()} PLN.`
        };
      }

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

    // Elite clubs treat young high-overall players as project core, so the asking price should deter casual super offers.
    if (!player.isOnTransferList && isYoungHighOverallCore(player, sellerClub, sellerSquad)) {
      multiplier += 0.45;
    }

    // Reputation 19-20 clubs protect high-overall players heavily; older players may leave, but not at a normal market price.
    if (!player.isOnTransferList && isSuperClubHighOverallPlayer(player, sellerClub)) {
      multiplier += isSuperVeteranStillProtected(player, sellerClub) ? 0.55 : 0.32;
    }

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
    if (!player.isOnTransferList && isYoungHighOverallCore(player, sellerClub, sellerSquad)) {
      minimumMultiplier = Math.max(minimumMultiplier, 1.65);
    }
    if (!player.isOnTransferList && isSuperClubHighOverallPlayer(player, sellerClub)) {
      minimumMultiplier = Math.max(minimumMultiplier, isSuperVeteranStillProtected(player, sellerClub) ? 1.75 : 1.45);
    }

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
