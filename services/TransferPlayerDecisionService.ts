import { Club, Player, TransferContractInput } from '../types';

type SquadRole = 'STAR' | 'FIRST_TEAM' | 'ROTATION' | 'BACKUP';

interface PlayerDecisionResult {
  accepted: boolean;
  reason: string;
  stayScore: number;
  offerScore: number;
  targetRole: SquadRole;
}

export interface PlayerNegotiationPlan {
  willingToTalk: boolean;
  reason: string;
  targetRole: SquadRole;
  desiredSalary: number;
  desiredBonus: number;
  desiredYears: number;
}

const roundMoney = (value: number) => Math.max(50_000, Math.round(value / 5_000) * 5_000);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getReputationDrop = (currentClub: Club, targetClub: Club): number =>
  Math.max(0, currentClub.reputation - targetClub.reputation);

const getBaseMoveAcceptanceChance = (currentClub: Club, targetClub: Club): number => {
  const reputationDrop = getReputationDrop(currentClub, targetClub);
  if (reputationDrop === 0) return 0.999;
  if (reputationDrop === 1) return 0.96;
  if (reputationDrop === 2) return 0.93;
  if (reputationDrop === 3) return 0.88;
  if (reputationDrop === 4) return 0.70;
  if (reputationDrop === 5) return 0.60;

  return clamp(0.60 * Math.pow(0.82, reputationDrop - 5), 0.02, 0.60);
};

const roleScore = (role: SquadRole): number => {
  switch (role) {
    case 'STAR':
      return 18;
    case 'FIRST_TEAM':
      return 12;
    case 'ROTATION':
      return 5;
    default:
      return -8;
  }
};

const roleLevel = (role: SquadRole): number => {
  switch (role) {
    case 'STAR':
      return 4;
    case 'FIRST_TEAM':
      return 3;
    case 'ROTATION':
      return 2;
    default:
      return 1;
  }
};

const contractScore = (years: number): number => {
  if (years >= 4) return 8;
  if (years === 3) return 6;
  if (years === 2) return 4;
  return 1;
};

const getAgeFinancialWeights = (age: number) => {
  if (age <= 23) {
    return { salary: 0.38, bonus: 0.12, years: 0.25, total: 0.25 };
  }

  if (age <= 29) {
    return { salary: 0.32, bonus: 0.18, years: 0.20, total: 0.30 };
  }

  return { salary: 0.22, bonus: 0.28, years: 0.22, total: 0.28 };
};

export const TransferPlayerDecisionService = {
  buildNegotiationPlan: (
    player: Player,
    currentClub: Club,
    targetClub: Club,
    currentSquad: Player[],
    targetSquad: Player[],
    currentDate: Date
  ): PlayerNegotiationPlan => {
    const currentRole = TransferPlayerDecisionService.estimateRole(player, currentSquad);
    const targetRole = TransferPlayerDecisionService.estimateRole(player, targetSquad);
    const currentSalaryBase = Math.max(player.annualSalary, 1);
    const currentRoleLevel = roleLevel(currentRole);
    const targetRoleLevel = roleLevel(targetRole);
    const reputationDelta = targetClub.reputation - currentClub.reputation;
    const reputationDrop = getReputationDrop(currentClub, targetClub);
    const isForeignMove =
      !!currentClub.country &&
      !!targetClub.country &&
      currentClub.country !== targetClub.country;
    const isNotFirstTeamPlayer = currentRole === 'ROTATION' || currentRole === 'BACKUP';
    const isVeteran = player.age >= 31;
    const hasMoveSoftener = !!player.isOnTransferList || isNotFirstTeamPlayer || isVeteran;
    const daysLeft = Math.floor(
      (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000
    );

    let desiredYears = 3;
    if (player.age <= 22) desiredYears = 5;
    else if (player.age <= 27) desiredYears = 4;
    else if (player.age <= 30) desiredYears = 3;
    else if (player.age <= 34) desiredYears = 2;
    else desiredYears = 1;

    if (daysLeft > 0 && daysLeft < 365) {
      desiredYears = Math.max(2, desiredYears - 1);
    }

    let salaryMultiplier = 1.10;
    if (player.age <= 24 && reputationDelta >= 2) salaryMultiplier -= 0.08;
    if (player.age <= 24 && reputationDrop > 0) salaryMultiplier += Math.min(0.18, reputationDrop * 0.03);
    if (reputationDelta > 0) salaryMultiplier += 0.08;
    if (reputationDelta === 0 && isForeignMove) salaryMultiplier += 0.12;
    if (reputationDrop > 0) salaryMultiplier += Math.min(0.42, reputationDrop * 0.06);
    if (reputationDrop >= 4 && !hasMoveSoftener) salaryMultiplier += 0.10;
    if (player.isOnTransferList) salaryMultiplier -= 0.08;
    if (isNotFirstTeamPlayer) salaryMultiplier -= 0.06;
    if (targetRoleLevel > currentRoleLevel) salaryMultiplier -= 0.06;
    if (targetRoleLevel < currentRoleLevel) salaryMultiplier += 0.10;

    let bonusMultiplier = 0.35;
    if (player.age >= 24 && player.age <= 29) bonusMultiplier = 0.55;
    else if (player.age >= 30 && player.age <= 33) bonusMultiplier = 0.90;
    else if (player.age >= 34) bonusMultiplier = 1.20;

    if (reputationDrop > 0) bonusMultiplier += Math.min(0.45, reputationDrop * 0.07);
    else if (reputationDelta === 0 && isForeignMove) bonusMultiplier += 0.14;
    else if (reputationDelta === 0) bonusMultiplier += 0.08;

    const desiredSalary = roundMoney(currentSalaryBase * salaryMultiplier);
    const desiredBonus = roundMoney(currentSalaryBase * bonusMultiplier);
    let negotiationReason = `Moj klient jest gotow rozmawiac. Oczekuje kontraktu na ${desiredYears} ${desiredYears === 1 ? 'rok' : 'lata'}.`;
    if (reputationDrop > 0) {
      negotiationReason = 'Moj klient jest gotow rozmawiac, ale nizsza reputacja nowego klubu podnosi jego oczekiwania finansowe. Im wiekszy spadek reputacji, tym mocniejszy kontrakt bedzie potrzebny.';
    } else if (reputationDelta === 0 && isForeignMove) {
      negotiationReason = 'Moj klient jest zainteresowany tym kierunkiem. Przy klubie o podobnej reputacji oczekuje solidnych, ale realistycznych warunkow.';
    } else if (reputationDelta === 0) {
      negotiationReason = `Moj klient traktuje ten ruch jako sportowo porownywalny i oczekuje kontraktu na ${desiredYears} ${desiredYears === 1 ? 'rok' : 'lata'}.`;
    } else if (reputationDelta > 0) {
      negotiationReason = `Mój klient jest zainteresowany przejściem do Waszego klubu i oczekuje kontraktu na ${desiredYears} ${desiredYears === 1 ? 'rok' : 'lata'} i warunkow adekwatnych do tego kroku.`;
    }

    return {
      willingToTalk: true,
      reason: negotiationReason,
      targetRole,
      desiredSalary,
      desiredBonus,
      desiredYears
    };
  },

  evaluateMove: (
    offer: TransferContractInput,
    player: Player,
    currentClub: Club,
    targetClub: Club,
    currentSquad: Player[],
    targetSquad: Player[],
    currentDate: Date
  ): PlayerDecisionResult => {
    const negotiationPlan = TransferPlayerDecisionService.buildNegotiationPlan(
      player,
      currentClub,
      targetClub,
      currentSquad,
      targetSquad,
      currentDate
    );

    if (!negotiationPlan.willingToTalk) {
      return {
        accepted: false,
        reason: negotiationPlan.reason,
        stayScore: 0,
        offerScore: 0,
        targetRole: negotiationPlan.targetRole
      };
    }

    const currentRole = TransferPlayerDecisionService.estimateRole(player, currentSquad);
    const currentSalaryBase = Math.max(player.annualSalary, 1);
    const reputationDelta = targetClub.reputation - currentClub.reputation;
    const reputationDrop = getReputationDrop(currentClub, targetClub);
    const isForeignMove =
      !!currentClub.country &&
      !!targetClub.country &&
      currentClub.country !== targetClub.country;

    let effectiveDesiredSalary = negotiationPlan.desiredSalary;
    let transferListSalaryDiscountApplied = false;
    if (player.isOnTransferList && offer.salary < currentSalaryBase * 0.90) {
      const interestedCount = player.interestedClubs?.length ?? 0;
      let acceptChance: number;
      if (interestedCount === 0) acceptChance = 0.70;
      else if (interestedCount === 1) acceptChance = 0.50;
      else if (interestedCount <= 3) acceptChance = 0.30;
      else acceptChance = 0.10;
      if (Math.random() < acceptChance) {
        const discount = Math.random() * 0.20;
        effectiveDesiredSalary = Math.max(50_000, roundMoney(currentSalaryBase * (1 - discount)));
        transferListSalaryDiscountApplied = true;
      } else {
        return {
          accepted: false,
          reason: 'Zawodnik oczekuje lepszych warunków finansowych. Oferta jest zbyt niska wzgledem obecnej pensji.',
          stayScore: 0,
          offerScore: 0,
          targetRole: negotiationPlan.targetRole
        };
      }
    }

    const salaryFit = clamp(offer.salary / Math.max(effectiveDesiredSalary, 1), 0, 1.3);
    const bonusFit = clamp((offer.bonus ?? 0) / Math.max(negotiationPlan.desiredBonus, 1), 0, 1.35);
    const yearsFit = clamp(offer.years / Math.max(negotiationPlan.desiredYears, 1), 0.5, 1.2);
    const financialWeights = getAgeFinancialWeights(player.age);

    const financialFit =
      salaryFit * financialWeights.salary +
      bonusFit * financialWeights.bonus +
      yearsFit * (financialWeights.years + financialWeights.total);

    let salaryScore = 0;
    if (salaryFit >= 1.12) salaryScore = 18;
    else if (salaryFit >= 1.0) salaryScore = 12;
    else if (salaryFit >= 0.92) salaryScore = 5;
    else salaryScore = -10;

    let bonusScore = 0;
    if (bonusFit >= 1.15) bonusScore = 12;
    else if (bonusFit >= 1.0) bonusScore = 8;
    else if (bonusFit >= 0.85) bonusScore = 3;
    else bonusScore = -6;

    let yearsScore = 0;
    if (yearsFit >= 1.0) yearsScore = 8;
    else if (yearsFit >= 0.85) yearsScore = 3;
    else yearsScore = -8;

    const daysLeft = Math.floor(
      (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000
    );
    const contractPressure = daysLeft > 0 && daysLeft < 365 ? 7 : 0;
    const transferListPressure = player.isOnTransferList ? 10 : 0;
    const reputationScore = reputationDelta > 0 ? Math.min(22, reputationDelta * 7) : 0;
    const foreignBonus = reputationDelta === 0 && isForeignMove ? 6 : 0;

    const estimatedMarketSalary = 50_000 + player.overallRating * 8_000;
    const salaryOverMarket = currentSalaryBase / Math.max(estimatedMarketSalary, 1);
    const salarySatisfactionBonus = salaryOverMarket >= 1.4 ? 10 : salaryOverMarket >= 1.2 ? 5 : 0;

    const roleUpgradeBonus = (currentRole === 'BACKUP' && roleLevel(negotiationPlan.targetRole) >= 3) ? 12 :
                             (currentRole === 'ROTATION' && roleLevel(negotiationPlan.targetRole) >= 4) ? 8 : 0;

    const stayScore =
      currentClub.reputation * 7 +
      roleScore(currentRole) +
      Math.min(16, Math.round(currentSalaryBase / 110_000)) +
      salarySatisfactionBonus -
      contractPressure -
      transferListPressure;

    const offerScore =
      targetClub.reputation * 7 +
      roleScore(negotiationPlan.targetRole) +
      salaryScore +
      bonusScore +
      yearsScore +
      contractScore(offer.years) +
      reputationScore +
      foreignBonus +
      roleUpgradeBonus +
      Math.round((financialFit - 1) * 35);

    const margin = offerScore - stayScore;
    const requiredFinancialFit = player.age >= 30 ? 0.98 : 0.92;
    const lowerClubMoveWithoutPremium = reputationDrop >= 4 && financialFit < 0.98 && !transferListSalaryDiscountApplied;
    const flatForeignMoveWithoutUpgrade = reputationDelta === 0 && isForeignMove && financialFit < 0.96;
    const allowedNegativeMargin = reputationDrop === 0 ? -8 : reputationDrop <= 5 ? -35 : -24;

    if (
      financialFit < requiredFinancialFit ||
      lowerClubMoveWithoutPremium ||
      flatForeignMoveWithoutUpgrade ||
      margin < allowedNegativeMargin
    ) {
      let reason = 'Zawodnik uznal, ze warunki kontraktu i projekt sportowy nie sa dla niego wystarczajaco korzystne.';

      if (lowerClubMoveWithoutPremium) {
        reason = 'Przy tak duzym spadku reputacji zawodnik oczekuje mocniejszej rekompensaty finansowej i stabilnego kontraktu.';
      } else if (player.age >= 30 && yearsFit < 1) {
        reason = 'Na tym etapie kariery zawodnik oczekuje mocniejszego zabezpieczenia gwarantowanego okresu kontraktu.';
      } else if (bonusFit < 0.9 && player.age >= 29) {
        reason = 'Dla starszego zawodnika bonus za podpis jest zbyt niski wzgledem ryzyka zmiany klubu.';
      } else if (salaryFit < 0.95) {
        reason = 'Roczna pensja jest zbyt daleka od finansowych oczekiwan zawodnika.';
      }

      return {
        accepted: false,
        reason,
        stayScore,
        offerScore,
        targetRole: negotiationPlan.targetRole
      };
    }

    const roleChanceAdjustment = clamp((roleLevel(negotiationPlan.targetRole) - roleLevel(currentRole)) * 0.05, -0.12, 0.12);
    const financialChanceAdjustment = clamp((financialFit - 1) * 0.25, -0.22, 0.16);
    const situationChanceAdjustment =
      (player.isOnTransferList ? 0.08 : 0) +
      (contractPressure > 0 ? 0.04 : 0) +
      (reputationDrop > 0 && player.age >= 31 ? 0.03 : 0);
    const finalAcceptanceChance = clamp(
      getBaseMoveAcceptanceChance(currentClub, targetClub) +
        roleChanceAdjustment +
        financialChanceAdjustment +
        situationChanceAdjustment,
      0.01,
      0.999
    );

    if (Math.random() > finalAcceptanceChance) {
      const reason = reputationDrop > 0
        ? 'Zawodnik byl gotow rozmawiac, ale po analizie uznal, ze spadek reputacji klubu jest dla niego zbyt duzym ryzykiem sportowym przy tej ofercie.'
        : 'Zawodnik byl blisko akceptacji, ale po namysle uznal, ze pozostanie w obecnym klubie jest dla niego minimalnie lepszym wyborem.';

      return {
        accepted: false,
        reason,
        stayScore,
        offerScore,
        targetRole: negotiationPlan.targetRole
      };
    }

    return {
      accepted: true,
      reason: `Zawodnik zaakceptowal warunki. Oferta spelnia jego oczekiwania finansowe i daje realna perspektywe roli ${negotiationPlan.targetRole.toLowerCase()}.`,
      stayScore,
      offerScore,
      targetRole: negotiationPlan.targetRole
    };
  },

  estimateRole: (
    player: Player,
    squad: Player[]
  ): SquadRole => {
    const samePosition = squad
      .filter(p => p.position === player.position && p.id !== player.id)
      .sort((a, b) => b.overallRating - a.overallRating);

    const betterPlayers = samePosition.filter(p => p.overallRating > player.overallRating).length;

    if (betterPlayers === 0) return 'STAR';
    if (betterPlayers <= 1) return 'FIRST_TEAM';
    if (betterPlayers <= 3) return 'ROTATION';
    return 'BACKUP';
  }
};
