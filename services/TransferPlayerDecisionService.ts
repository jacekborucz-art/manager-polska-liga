import { Club, ManagerProfile, Player, Region, TransferContractInput } from '../types';
import { ManagerNegotiationInfluenceService } from './ManagerNegotiationInfluenceService';

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

const PRE_CONTRACT_PRIORITY_DAYS = 330;
const HIGH_OVERALL_EUROPEAN_TRANSFER_THRESHOLD = 76;

const EUROPEAN_PLAYER_REGIONS = new Set<Region>([
  Region.POLAND,
  Region.BALKANS,
  Region.CZ_SK,
  Region.IBERIA,
  Region.SWEDEN,
  Region.SCANDINAVIA,
  Region.EX_USSR,
  Region.SPAIN,
  Region.ENGLAND,
  Region.GERMANY,
  Region.ITALY,
  Region.FRANCE,
  Region.TURKEY,
  Region.FINLAND,
  Region.GEORGIA,
  Region.ARMENIA,
  Region.ALBANIA,
  Region.ROMANIA,
  Region.BALTIC,
  Region.BENELUX,
  Region.HUNGARIAN,
  Region.MALTESE,
  Region.ISRAELI,
  Region.GREEK,
  Region.AZERBAIJANI,
  Region.KAZAKH,
]);

const SOUTH_AMERICAN_COUNTRIES = new Set(['ARG', 'BRA', 'URU', 'COL', 'ECU', 'PAR', 'CHI', 'PER', 'BOL']);
const AFRICAN_COUNTRIES = new Set(['EGY', 'RSA', 'MAR', 'TUN', 'ALG', 'TZA', 'COD']);
const LOW_APPEAL_DESTINATION_COUNTRIES = new Set([
  ...SOUTH_AMERICAN_COUNTRIES,
  ...AFRICAN_COUNTRIES,
  'CHN',
]);

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

const getPlayerLoyalty = (player: Player): number =>
  clamp(Math.round(player.lojalnosc ?? 50), 1, 99);

const isLoyaltySoftenedForTransfer = (player: Player): boolean =>
  !!player.isOnTransferList || !player.squadRole;

const isMajorReputationStepUp = (currentClub: Club, targetClub: Club): boolean =>
  targetClub.reputation >= currentClub.reputation + 5;

const isLowAppealDestinationForHighOverallEuropean = (player: Player, targetClub: Club): boolean =>
  player.overallRating >= HIGH_OVERALL_EUROPEAN_TRANSFER_THRESHOLD &&
  EUROPEAN_PLAYER_REGIONS.has(player.nationality) &&
  LOW_APPEAL_DESTINATION_COUNTRIES.has(targetClub.country || '');

const getLowAppealDestinationPenalty = (player: Player, targetClub: Club): number => {
  if (!isLowAppealDestinationForHighOverallEuropean(player, targetClub)) return 0;
  if (player.overallRating >= 86) return 34;
  if (player.overallRating >= 82) return 26;
  if (player.overallRating >= 79) return 19;
  return 13;
};

const getLowAppealAcceptanceCap = (player: Player, targetClub: Club): number | null => {
  if (!isLowAppealDestinationForHighOverallEuropean(player, targetClub)) return null;
  const veteranSoftener = player.age >= 33 ? 0.025 : player.age >= 30 ? 0.012 : 0;
  if (player.overallRating >= 86) return 0.006 + veteranSoftener;
  if (player.overallRating >= 82) return 0.012 + veteranSoftener;
  if (player.overallRating >= 79) return 0.022 + veteranSoftener;
  return 0.04 + veteranSoftener;
};

const getLoyaltyResistance = (player: Player, currentClub: Club, targetClub: Club): number => {
  if (isLoyaltySoftenedForTransfer(player) || isMajorReputationStepUp(currentClub, targetClub)) {
    return 0;
  }

  return clamp((getPlayerLoyalty(player) - 50) / 49, 0, 1);
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

const getAgeStayScore = (player: Player): number => {
  if (player.age < 26) return 0;

  const isEliteLatePrime = player.age >= 26 && player.overallRating >= 85;
  if (player.age <= 28) return isEliteLatePrime ? 0 : 3;
  if (player.age <= 31) return isEliteLatePrime ? 2 : 7;
  if (player.age <= 34) return isEliteLatePrime ? 7 : 12;
  return isEliteLatePrime ? 11 : 18;
};

export const TransferPlayerDecisionService = {
  buildNegotiationPlan: (
    player: Player,
    currentClub: Club,
    targetClub: Club,
    currentSquad: Player[],
    targetSquad: Player[],
    currentDate: Date,
    managerProfile?: ManagerProfile | null
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
    const hasMoveSoftener = !!player.isOnTransferList || isNotFirstTeamPlayer;
    const ageStayScore = getAgeStayScore(player);
    const ageMovePremium = ageStayScore / 100;
    const managerInfluence = ManagerNegotiationInfluenceService.calculate(managerProfile);
    const lowAppealDestination = isLowAppealDestinationForHighOverallEuropean(player, targetClub);
    const daysLeft = Math.floor(
      (new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000
    );
    const loyaltyResistance = getLoyaltyResistance(player, currentClub, targetClub);

    if (getPlayerLoyalty(player) >= 88 && loyaltyResistance >= 0.72 && daysLeft > PRE_CONTRACT_PRIORITY_DAYS) {
      return {
        willingToTalk: false,
        reason: 'Moj klient jest mocno zwiazany z obecnym klubem i nie traktuje tego transferu jako realnej mozliwosci. Rozmowy moglyby miec sens tylko przy jasnym sygnale ze strony klubu albo przy wyraznym awansie sportowym.',
        targetRole,
        desiredSalary: roundMoney(currentSalaryBase * 1.25),
        desiredBonus: roundMoney(currentSalaryBase * 0.75),
        desiredYears: 3
      };
    }

    let desiredYears = 3;
    if (player.age <= 22) desiredYears = 5;
    else if (player.age <= 27) desiredYears = 4;
    else if (player.age <= 30) desiredYears = 3;
    else if (player.age <= 34) desiredYears = 2;
    else desiredYears = 1;

    if (daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS) {
      desiredYears = Math.max(2, desiredYears - 1);
    }

    let salaryMultiplier = 1.10;
    if (player.age <= 24 && reputationDelta >= 2) salaryMultiplier -= 0.08;
    if (player.age <= 24 && reputationDrop > 0) salaryMultiplier += Math.min(0.18, reputationDrop * 0.03);
    if (reputationDelta > 0) salaryMultiplier += 0.08;
    if (reputationDelta === 0 && isForeignMove) salaryMultiplier += 0.12;
    if (reputationDrop > 0) salaryMultiplier += Math.min(0.42, reputationDrop * 0.06);
    if (reputationDrop >= 4 && !hasMoveSoftener) salaryMultiplier += 0.10;
    if (lowAppealDestination) salaryMultiplier += player.overallRating >= 82 ? 0.34 : 0.24;
    if (player.isOnTransferList) salaryMultiplier -= 0.08;
    if (isNotFirstTeamPlayer) salaryMultiplier -= 0.06;
    if (targetRoleLevel > currentRoleLevel) salaryMultiplier -= 0.06;
    if (targetRoleLevel < currentRoleLevel) salaryMultiplier += 0.10;
    salaryMultiplier += loyaltyResistance * 0.14;
    salaryMultiplier += ageMovePremium * 0.45;
    salaryMultiplier *= managerInfluence.expectationMultiplier;

    let bonusMultiplier = 0.35;
    if (player.age >= 24 && player.age <= 29) bonusMultiplier = 0.55;
    else if (player.age >= 30 && player.age <= 33) bonusMultiplier = 0.90;
    else if (player.age >= 34) bonusMultiplier = 1.20;

    if (reputationDrop > 0) bonusMultiplier += Math.min(0.45, reputationDrop * 0.07);
    else if (reputationDelta === 0 && isForeignMove) bonusMultiplier += 0.14;
    else if (reputationDelta === 0) bonusMultiplier += 0.08;
    if (lowAppealDestination) bonusMultiplier += player.overallRating >= 82 ? 0.42 : 0.30;
    bonusMultiplier += loyaltyResistance * 0.18;
    bonusMultiplier += ageMovePremium;
    bonusMultiplier *= managerInfluence.expectationMultiplier;

    const desiredSalary = roundMoney(currentSalaryBase * salaryMultiplier);
    const desiredBonus = roundMoney(currentSalaryBase * bonusMultiplier);
    let negotiationReason = `Moj klient jest gotow rozmawiac. Oczekuje kontraktu na ${desiredYears} ${desiredYears === 1 ? 'rok' : 'lata'}.`;
    if (reputationDrop > 0) {
      negotiationReason = 'Moj klient jest gotow rozmawiac, ale nizsza reputacja nowego klubu podnosi jego oczekiwania finansowe. Im wiekszy spadek reputacji, tym mocniejszy kontrakt bedzie potrzebny.';
    } else if (lowAppealDestination) {
      negotiationReason = 'Moj klient traktuje ten kierunek jako malo atrakcyjny sportowo. Rozmowy maja sens tylko przy wyjatkowo mocnych warunkach i jasnej roli w projekcie.';
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
    currentDate: Date,
    managerProfile?: ManagerProfile | null
  ): PlayerDecisionResult => {
    const negotiationPlan = TransferPlayerDecisionService.buildNegotiationPlan(
      player,
      currentClub,
      targetClub,
      currentSquad,
      targetSquad,
      currentDate,
      managerProfile
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
    const managerInfluence = ManagerNegotiationInfluenceService.calculate(managerProfile);
    const loyaltyResistance = getLoyaltyResistance(player, currentClub, targetClub);
    const lowAppealDestinationPenalty = getLowAppealDestinationPenalty(player, targetClub);
    const lowAppealAcceptanceCap = getLowAppealAcceptanceCap(player, targetClub);

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
    const contractPressure = daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS ? 7 : 0;
    const contractBreakdownPressure =
      player.isNegotiationPermanentBlocked && daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS ? 24 : 0;
    const transferListPressure = player.isOnTransferList ? 10 : 0;
    const loyaltyStayBonus = Math.round(loyaltyResistance * 24);
    const reputationScore = reputationDelta > 0 ? Math.min(22, reputationDelta * 7) : 0;
    const foreignBonus = reputationDelta === 0 && isForeignMove ? 6 : 0;

    const estimatedMarketSalary = 50_000 + player.overallRating * 8_000;
    const salaryOverMarket = currentSalaryBase / Math.max(estimatedMarketSalary, 1);
    const salarySatisfactionBonus = salaryOverMarket >= 1.4 ? 10 : salaryOverMarket >= 1.2 ? 5 : 0;

    const roleUpgradeBonus = (currentRole === 'BACKUP' && roleLevel(negotiationPlan.targetRole) >= 3) ? 12 :
                             (currentRole === 'ROTATION' && roleLevel(negotiationPlan.targetRole) >= 4) ? 8 : 0;
    const ageStayScore = getAgeStayScore(player);

    const stayScore =
      currentClub.reputation * 7 +
      roleScore(currentRole) +
      ageStayScore +
      loyaltyStayBonus +
      Math.min(16, Math.round(currentSalaryBase / 110_000)) +
      salarySatisfactionBonus -
      contractPressure -
      contractBreakdownPressure -
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
      managerInfluence.scoreAdjustment +
      Math.round((financialFit - 1) * 35) -
      lowAppealDestinationPenalty;

    const margin = offerScore - stayScore;
    const requiredFinancialFit = player.age >= 30 ? 0.98 : 0.92;
    const lowerClubMoveWithoutPremium = reputationDrop >= 4 && financialFit < 0.98 && !transferListSalaryDiscountApplied;
    const flatForeignMoveWithoutUpgrade = reputationDelta === 0 && isForeignMove && financialFit < 0.96;
    const lowAppealMoveWithoutExceptionalPremium = lowAppealDestinationPenalty > 0 && financialFit < 1.12;
    const allowedNegativeMargin = reputationDrop === 0 ? -8 : reputationDrop <= 5 ? -35 : -24;

    if (
      financialFit < requiredFinancialFit ||
      lowerClubMoveWithoutPremium ||
      flatForeignMoveWithoutUpgrade ||
      lowAppealMoveWithoutExceptionalPremium ||
      margin < allowedNegativeMargin
    ) {
      let reason = 'Zawodnik uznal, ze warunki kontraktu i projekt sportowy nie sa dla niego wystarczajaco korzystne.';

      if (lowAppealMoveWithoutExceptionalPremium) {
        reason = 'Zawodnik nie traktuje tego kierunku jako atrakcyjnego sportowo. Przy takim profilu kariery potrzebowalby wyjatkowej premii finansowej i bardzo mocnej roli.';
      } else if (lowerClubMoveWithoutPremium) {
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
      (contractBreakdownPressure > 0 ? 0.12 : 0) -
      loyaltyResistance * 0.34;
    const rawAcceptanceChance = clamp(
      getBaseMoveAcceptanceChance(currentClub, targetClub) +
        roleChanceAdjustment +
        financialChanceAdjustment +
        situationChanceAdjustment +
        managerInfluence.chanceAdjustment,
      0.01,
      0.999
    );
    const finalAcceptanceChance = lowAppealAcceptanceCap === null
      ? rawAcceptanceChance
      : Math.min(rawAcceptanceChance, lowAppealAcceptanceCap);

    if (Math.random() > finalAcceptanceChance) {
      const reason = lowAppealDestinationPenalty > 0
        ? 'Zawodnik po analizie odrzucil kierunek transferu. Przy jego poziomie sportowym liga docelowa nie jest dla niego wystarczajaco atrakcyjna poza wyjatkowymi okolicznosciami.'
        : loyaltyResistance >= 0.45
        ? 'Zawodnik docenia oferte, ale jego przywiazanie do obecnego klubu przewazylo. Bez statusu zawodnika przeznaczonego do odejscia lub bardzo duzego kroku sportowego nie chce zmieniac klubu.'
        : reputationDrop > 0
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
