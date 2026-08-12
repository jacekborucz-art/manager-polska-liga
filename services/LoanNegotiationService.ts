import { Club, LoanPlayingTimeRole, Player, PlayerPosition } from '../types';

export interface LoanNegotiationEvaluationInput {
  player: Player;
  buyerClub: Club;
  sellerClub: Club;
  buyerSquad: Player[];
  sellerSquad: Player[];
  loanFee: number;
  wageCoveragePercent: number;
  financialValueForSeller: number;
  expectedFinancialValue: number;
  promisedPlayingTime: LoanPlayingTimeRole;
  acceptedUltimatum?: boolean;
  seed: number;
}

export interface LoanNegotiationEvaluation {
  outcome: 'ACCEPT' | 'ULTIMATUM' | 'REJECT';
  message: string;
  acceptanceChance: number;
  roleCredibility: number;
  demandedRole?: LoanPlayingTimeRole;
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
  evaluate(input: LoanNegotiationEvaluationInput): LoanNegotiationEvaluation {
    const {
      player,
      buyerClub,
      sellerClub,
      buyerSquad,
      sellerSquad,
      financialValueForSeller,
      expectedFinancialValue,
      promisedPlayingTime,
      acceptedUltimatum,
      seed,
    } = input;
    const developmentPriority = getDevelopmentPriority(player);
    const roleCredibility = getRoleCredibility(player, buyerSquad, promisedPlayingTime);
    const firstTeamCredibility = getRoleCredibility(player, buyerSquad, 'FIRST_TEAM');
    const sellerSamePosition = sellerSquad.filter(candidate => candidate.position === player.position && candidate.id !== player.id);
    const starterSlots = POSITION_STARTERS[player.position];
    const strongerAtSeller = sellerSamePosition.filter(candidate => candidate.overallRating >= player.overallRating).length;
    const isImportantAtSeller = sellerSamePosition.length <= starterSlots + 1 && strongerAtSeller < starterSlots;
    const isSurplusAtSeller = strongerAtSeller >= starterSlots || sellerSamePosition.length >= starterSlots + 3;
    const financialRatio = expectedFinancialValue > 0
      ? clamp(financialValueForSeller / expectedFinancialValue, 0, 2)
      : financialValueForSeller > 0 ? 1 : 0;
    const reputationGap = buyerClub.reputation - sellerClub.reputation;
    const reputationEffect = clamp(reputationGap * 0.025, -0.13, 0.08);
    const developmentFirstPath =
      promisedPlayingTime === 'FIRST_TEAM' &&
      player.age <= 23 &&
      firstTeamCredibility >= 0.62 &&
      !isImportantAtSeller;

    const ultimatumChance = clamp(
      0.06 + developmentPriority * 0.48 + (player.overallRating >= 68 ? 0.08 : 0) - (firstTeamCredibility < 0.62 ? 0.35 : 0),
      0.03,
      0.72
    );
    if (
      promisedPlayingTime === 'ROTATION' &&
      !acceptedUltimatum &&
      unit(seed + 17_071) < ultimatumChance
    ) {
      return {
        outcome: 'ULTIMATUM',
        message: `${sellerClub.name} zgodzi się na wypożyczenie tylko po zagwarantowaniu zawodnikowi miejsca w pierwszym składzie. Klub będzie kontrolował realizację tej obietnicy.`,
        acceptanceChance: 1,
        roleCredibility: firstTeamCredibility,
        demandedRole: 'FIRST_TEAM',
      };
    }

    let acceptanceChance = 0.14;
    acceptanceChance += Math.min(0.32, financialRatio * 0.22);
    acceptanceChance += promisedPlayingTime === 'FIRST_TEAM'
      ? roleCredibility * 0.28
      : roleCredibility * 0.07;
    acceptanceChance += developmentFirstPath ? 0.24 : developmentPriority * 0.05;
    acceptanceChance += isSurplusAtSeller ? 0.12 : 0;
    acceptanceChance -= isImportantAtSeller ? 0.25 : 0;
    acceptanceChance += reputationEffect;
    acceptanceChance += (unit(seed + 17_072) - 0.5) * 0.16;
    acceptanceChance = clamp(acceptanceChance, 0.08, 0.92);

    if (acceptedUltimatum && promisedPlayingTime === 'FIRST_TEAM' && roleCredibility >= 0.62) {
      return {
        outcome: 'ACCEPT',
        message: `${sellerClub.name} zaakceptował ofertę po przyjęciu ultimatum dotyczącego pierwszego składu.`,
        acceptanceChance,
        roleCredibility,
      };
    }

    if (unit(seed + 17_073) < acceptanceChance) {
      const developmentMessage = developmentFirstPath && financialRatio < 0.5
        ? ' Klub uznał, że regularna gra jest ważniejsza od wpływów finansowych.'
        : '';
      return {
        outcome: 'ACCEPT',
        message: `${sellerClub.name} zaakceptował przedstawione warunki.${developmentMessage}`,
        acceptanceChance,
        roleCredibility,
      };
    }

    const message = roleCredibility < 0.45
      ? `${sellerClub.name} nie wierzy, że deklarowana rola przełoży się na realne minuty zawodnika.`
      : isImportantAtSeller
        ? `${sellerClub.name} nie chce obecnie osłabiać swojej kadry na tej pozycji.`
        : financialRatio < 0.45 && promisedPlayingTime === 'ROTATION'
          ? `${sellerClub.name} oczekuje większego udziału w pensji, opłaty albo mocniejszej gwarancji gry.`
          : `${sellerClub.name} po analizie sportowej i finansowej odrzucił ofertę.`;
    return { outcome: 'REJECT', message, acceptanceChance, roleCredibility };
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
