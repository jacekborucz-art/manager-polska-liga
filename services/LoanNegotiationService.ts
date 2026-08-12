import { Club, LoanNegotiationTerms, LoanPlayingTimeRole, Player, PlayerLoanNegotiationState, PlayerPosition } from '../types';

export interface LoanClubInterestInput {
  player: Player;
  buyerClub: Club;
  sellerClub: Club;
  buyerSquad: Player[];
  sellerSquad: Player[];
  seed: number;
}

export interface LoanNegotiationRoundInput extends LoanClubInterestInput {
  submittedTerms: LoanNegotiationTerms;
  state: PlayerLoanNegotiationState;
  expectedLoanFee: number;
}

export interface LoanNegotiationRoundResult {
  outcome: 'COUNTER' | 'ACCEPT' | 'REJECT';
  message: string;
  nextState?: PlayerLoanNegotiationState;
  counterOffer?: LoanNegotiationTerms;
}

export interface LoanPromiseReviewInput {
  player: Player;
  promisedPlayingTime: LoanPlayingTimeRole;
  eligibleClubMatches: number;
  playerMatches: number;
  playerMinutes: number;
  previousBreaches: number;
  seed: number;
}

export interface LoanPromiseReviewResult {
  outcome: 'NOT_ENOUGH_DATA' | 'FULFILLED' | 'WARNING' | 'RECALL' | 'CONTINUE';
  nextBreaches: number;
  message: string;
}

const POSITION_STARTERS: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 1,
  [PlayerPosition.DEF]: 4,
  [PlayerPosition.MID]: 4,
  [PlayerPosition.FWD]: 2,
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const unit = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const getDevelopmentPriority = (player: Player): number => {
  const ageScore =
    player.age <= 19 ? 1 :
    player.age <= 21 ? 0.86 :
    player.age <= 23 ? 0.66 :
    player.age <= 25 ? 0.36 :
    0.10;
  const talentGap = clamp((player.attributes.talent - player.overallRating) / 22, 0, 1);
  const overallScore = clamp((player.overallRating - 52) / 28, 0, 1);
  return clamp(ageScore * 0.52 + talentGap * 0.20 + overallScore * 0.28, 0, 1);
};

const getRoleCredibility = (
  player: Player,
  buyerSquad: Player[],
  role: LoanPlayingTimeRole
): number => {
  const samePosition = buyerSquad.filter(candidate => candidate.position === player.position && candidate.id !== player.id);
  const strongerPlayers = samePosition.filter(candidate => candidate.overallRating > player.overallRating).length;
  const starterSlots = POSITION_STARTERS[player.position];
  const allowedAhead = role === 'FIRST_TEAM' ? starterSlots - 1 : starterSlots + 2;
  if (strongerPlayers <= allowedAhead) return 1;
  return clamp(1 - (strongerPlayers - allowedAhead) * 0.22, 0.12, 0.82);
};

export const LoanNegotiationService = {
  getArrivalDate(agreementDate: Date | string): string {
    const date = new Date(agreementDate);
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().split('T')[0];
  },

  isClubInterested(input: LoanClubInterestInput): boolean {
    const { player, buyerClub, sellerClub, buyerSquad, sellerSquad, seed } = input;
    const developmentPriority = getDevelopmentPriority(player);
    const firstTeamCredibility = getRoleCredibility(player, buyerSquad, 'FIRST_TEAM');
    const sellerSamePosition = sellerSquad.filter(candidate => candidate.position === player.position && candidate.id !== player.id);
    const starterSlots = POSITION_STARTERS[player.position];
    const strongerAtSeller = sellerSamePosition.filter(candidate => candidate.overallRating >= player.overallRating).length;
    const isImportantAtSeller = sellerSamePosition.length <= starterSlots + 1 && strongerAtSeller < starterSlots;
    const isSurplusAtSeller = strongerAtSeller >= starterSlots || sellerSamePosition.length >= starterSlots + 3;
    const reputationGap = buyerClub.reputation - sellerClub.reputation;
    let chance = 0.74;
    chance += developmentPriority * 0.10;
    chance += isSurplusAtSeller ? 0.12 : 0;
    chance -= isImportantAtSeller ? 0.34 : 0;
    chance += firstTeamCredibility >= 0.62 ? 0.06 : -0.16;
    chance += clamp(reputationGap * 0.018, -0.12, 0.06);
    return unit(seed + 17_001) < clamp(chance, 0.18, 0.96);
  },

  createState(
    currentDate: Date | string,
    initialTerms: LoanNegotiationTerms,
    seed: number
  ): PlayerLoanNegotiationState {
    return {
      startedAt: new Date(currentDate).toISOString().split('T')[0],
      approach: 0,
      maxApproaches: (3 + Math.floor(unit(seed + 17_101) * 3)) as 3 | 4 | 5,
      clubTerms: initialTerms,
    };
  },

  negotiateRound(input: LoanNegotiationRoundInput): LoanNegotiationRoundResult {
    const { player, buyerSquad, sellerClub, submittedTerms, state, expectedLoanFee, seed } = input;
    const nextApproach = state.approach + 1;
    const isFinalApproach = nextApproach >= state.maxApproaches;
    const roleCredibility = getRoleCredibility(player, buyerSquad, submittedTerms.promisedPlayingTime);
    const requestedFinancialScore =
      Math.min(1.4, submittedTerms.wageCoveragePercent / 65) * 0.55 +
      Math.min(1.4, expectedLoanFee > 0 ? submittedTerms.loanFee / expectedLoanFee : submittedTerms.loanFee > 0 ? 1 : 0) * 0.45;
    const currentClubTerms = state.clubTerms;
    const meetsClubTerms =
      submittedTerms.loanFee >= currentClubTerms.loanFee &&
      submittedTerms.wageCoveragePercent >= currentClubTerms.wageCoveragePercent &&
      (currentClubTerms.promisedPlayingTime !== 'FIRST_TEAM' || submittedTerms.promisedPlayingTime === 'FIRST_TEAM');

    if (isFinalApproach) {
      let finalChance = 0.24 + requestedFinancialScore * 0.34 + roleCredibility * 0.25;
      if (meetsClubTerms) finalChance += 0.20;
      if (player.age <= 23 && submittedTerms.promisedPlayingTime === 'FIRST_TEAM') finalChance += 0.12;
      finalChance += (unit(seed + nextApproach * 307) - 0.5) * 0.14;
      if (unit(seed + nextApproach * 311) < clamp(finalChance, 0.12, 0.94)) {
        return {
          outcome: 'ACCEPT',
          message: `${sellerClub.name} zaakceptował ostateczne warunki wypożyczenia. Zawodnik zamelduje się w nowym klubie następnego dnia.`,
        };
      }
      return {
        outcome: 'REJECT',
        message: `${sellerClub.name} nie jest zainteresowany wypożyczeniem zawodnika do tego klubu na uzgodnionych warunkach.`,
      };
    }

    const feeDirection = unit(seed + nextApproach * 401) < 0.62 ? 1 : -1;
    const coverageDirection = unit(seed + nextApproach * 409) < 0.62 ? 1 : -1;
    const feeStep = Math.max(5_000, Math.round(Math.max(expectedLoanFee, 20_000) * (0.15 + unit(seed + nextApproach * 419) * 0.30) / 5_000) * 5_000);
    const coverageStep = 5 + Math.floor(unit(seed + nextApproach * 421) * 3) * 5;
    const referenceFee = nextApproach === 1 ? submittedTerms.loanFee : currentClubTerms.loanFee;
    const referenceCoverage = nextApproach === 1 ? submittedTerms.wageCoveragePercent : currentClubTerms.wageCoveragePercent;
    const shouldDemandFirstTeam =
      player.age <= 23 &&
      getRoleCredibility(player, buyerSquad, 'FIRST_TEAM') >= 0.62 &&
      unit(seed + nextApproach * 431) < 0.48;
    const counterOffer: LoanNegotiationTerms = {
      loanFee: Math.max(0, Math.round((referenceFee + feeDirection * feeStep) / 5_000) * 5_000),
      wageCoveragePercent: clamp(Math.round((referenceCoverage + coverageDirection * coverageStep) / 5) * 5, 0, 100),
      loanDuration: unit(seed + nextApproach * 433) < 0.22
        ? submittedTerms.loanDuration === 'SEASON' ? 'ROUND' : 'SEASON'
        : submittedTerms.loanDuration,
      promisedPlayingTime: shouldDemandFirstTeam ? 'FIRST_TEAM' : submittedTerms.promisedPlayingTime,
    };
    const nextState: PlayerLoanNegotiationState = {
      ...state,
      approach: nextApproach,
      clubTerms: counterOffer,
    };
    return {
      outcome: 'COUNTER',
      message: `${sellerClub.name} chce kontynuować rozmowy i przedstawia własne warunki wypożyczenia.`,
      nextState,
      counterOffer,
    };
  },

  getLockoutUntil(currentDate: Date | string, seed: number): string {
    const date = new Date(currentDate);
    const months = 3 + Math.floor(unit(seed + 19_981) * 10);
    const originalDay = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + months);
    const endOfTargetMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(originalDay, endOfTargetMonth));
    return date.toISOString().split('T')[0];
  },

  isLocked(player: Player, buyerClubId: string, currentDate: Date | string): boolean {
    const lockout = player.loanNegotiationLockouts?.[buyerClubId];
    if (!lockout) return false;
    const until = new Date(lockout);
    const now = new Date(currentDate);
    return !Number.isNaN(until.getTime()) && until > now;
  },

  reviewPromise(input: LoanPromiseReviewInput): LoanPromiseReviewResult {
    const {
      player,
      promisedPlayingTime,
      eligibleClubMatches,
      playerMatches,
      playerMinutes,
      previousBreaches,
      seed,
    } = input;
    if (eligibleClubMatches < 3) {
      return { outcome: 'NOT_ENOUGH_DATA', nextBreaches: previousBreaches, message: 'Za mało oficjalnych meczów do rzetelnej oceny obietnicy.' };
    }

    const requiredMatches = Math.ceil(eligibleClubMatches * (promisedPlayingTime === 'FIRST_TEAM' ? 0.60 : 0.35));
    const requiredMinutes = eligibleClubMatches * (promisedPlayingTime === 'FIRST_TEAM' ? 50 : 18);
    const fulfilled = playerMatches >= requiredMatches && playerMinutes >= requiredMinutes;
    if (fulfilled) {
      return { outcome: 'FULFILLED', nextBreaches: 0, message: 'Klub macierzysty jest zadowolony z realizacji obietnicy minut.' };
    }

    const nextBreaches = previousBreaches + 1;
    if (nextBreaches === 1) {
      return { outcome: 'WARNING', nextBreaches, message: 'Klub macierzysty ostrzega, że obietnica dotycząca minut nie jest realizowana.' };
    }

    const matchRatio = requiredMatches > 0 ? playerMatches / requiredMatches : 0;
    const minuteRatio = requiredMinutes > 0 ? playerMinutes / requiredMinutes : 0;
    const severity = clamp(1 - Math.min(matchRatio, minuteRatio), 0, 1);
    const developmentPriority = getDevelopmentPriority(player);
    const recallChance = clamp(
      0.34 + developmentPriority * 0.34 + severity * 0.24 + (playerMatches === 0 ? 0.10 : 0),
      0.35,
      0.95
    );
    if (unit(seed + 21_113) < recallChance) {
      return { outcome: 'RECALL', nextBreaches, message: 'Klub macierzysty odwołuje zawodnika z powodu złamania warunków wypożyczenia.' };
    }
    return { outcome: 'CONTINUE', nextBreaches, message: 'Klub macierzysty pozostawia zawodnika na wypożyczeniu, ale nadal obserwuje jego minuty.' };
  },
};
