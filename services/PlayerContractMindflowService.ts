import { Club, Player, PlayerPosition } from '../types';
import { FinanceService } from './FinanceService';

export type ContractAgeGroup = 'YOUNG' | 'PRIME' | 'EXPERIENCED' | 'VETERAN';
export type ContractCareerStage = 'DEVELOPMENT' | 'BREAKTHROUGH' | 'PEAK' | 'SECURITY' | 'DECLINE';
export type ContractQualityLevel = 'BELOW_SQUAD' | 'SQUAD_PLAYER' | 'STARTER_LEVEL' | 'STAR_LEVEL';
export type ContractPotentialStatus = 'LOW_UPSIDE' | 'NORMAL' | 'HIGH_UPSIDE' | 'ELITE_UPSIDE';

export type ContractMindsetState =
  | 'SUPER_HAPPY'
  | 'HAPPY_TO_STAY'
  | 'OPEN_TO_RENEWAL'
  | 'EXPECTING_BETTER_TERMS'
  | 'LOSING_PATIENCE'
  | 'TESTING_MARKET'
  | 'READY_TO_LEAVE'
  | 'PRECONTRACT_READY';

export type OfferQuality = 'NONE' | 'INSULTING' | 'WEAK' | 'FAIR' | 'STRONG';

export interface PlayerContractMindflowParams {
  player: Player;
  currentClub: Club;
  currentSquad: Player[];
  currentDate: Date;
  interestedClubs?: Club[];
  targetClub?: Club;
  targetSquad?: Player[];
}

export interface PlayerContractMindflow {
  profile: {
    ageGroup: ContractAgeGroup;
    careerStage: ContractCareerStage;
    qualityLevel: ContractQualityLevel;
    potentialStatus: ContractPotentialStatus;
  };
  currentClubSituation: {
    contractDaysLeft: number;
    clubReputationFit: number;
    teamAmbitionFit: number;
    squadRoleFit: number;
    playingTimeFit: number;
    moraleFit: number;
    developmentFit: number;
    financialRespectFit: number;
    totalStayComfort: number;
  };
  contractExpectations: {
    minimumSalary: number;
    expectedSalary: number;
    premiumSalary: number;
    minimumBonus: number;
    expectedBonus: number;
    minimumYears: number;
    preferredYears: number;
    maximumYears: number;
    expectedRole: 'NONE' | 'STARTER' | 'KEY_PLAYER';
    priorities: {
      salary: number;
      bonus: number;
      years: number;
      role: number;
      playingTime: number;
      ambition: number;
      development: number;
    };
  };
  negotiationMemory: {
    rejectedOffers: number;
    lastOfferQuality: OfferQuality;
    trustInClub: number;
    frustration: number;
    patience: number;
    permanentBreakdown: boolean;
  };
  marketSituation: {
    hasInterest: boolean;
    interestedClubCount: number;
    bestInterestedClubReputation: number | null;
    bestSportingUpgrade: number;
    bestFinancialPotential: number;
    marketConfidence: number;
  };
  externalOfferGate: {
    willListen: boolean;
    requiresMajorUpgrade: boolean;
    canSignPreContract: boolean;
    preContractChanceMultiplier: number;
    willingnessToListen: number;
    autoRejectThreshold: number;
    reason: string;
  };
  mindset: {
    state: ContractMindsetState;
    renewalPriority: number;
    marketOpenness: number;
    preContractReadiness: number;
    clubTrust: number;
    explanation: string[];
  };
}

export interface RenewalOfferMindflowResult {
  accepted: boolean;
  reason: string;
  demands: { salary: number; bonus: number } | null;
  offerQuality: OfferQuality;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const roundMoney = (value: number): number => {
  const step = value >= 1_000_000 ? 100_000 : value >= 100_000 ? 10_000 : 5_000;
  return Math.max(50_000, Math.round(value / step) * step);
};

const seededUnit = (seed: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const getContractDaysLeft = (player: Player, currentDate: Date): number => {
  if (!player.contractEndDate) return 9999;
  return Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000);
};

const getCombinedMatches = (player: Player): number =>
  (player.stats?.matchesPlayed || 0) +
  (player.cupStats?.matchesPlayed || 0) +
  (player.euroStats?.matchesPlayed || 0);

const getCombinedMinutes = (player: Player): number =>
  (player.stats?.minutesPlayed || 0) +
  (player.cupStats?.minutesPlayed || 0) +
  (player.euroStats?.minutesPlayed || 0);

const getCombinedGoals = (player: Player): number =>
  (player.stats?.goals || 0) + (player.cupStats?.goals || 0) + (player.euroStats?.goals || 0);

const getCombinedAssists = (player: Player): number =>
  (player.stats?.assists || 0) + (player.cupStats?.assists || 0) + (player.euroStats?.assists || 0);

const getAverageRating = (player: Player): number | null => {
  const ratings = [
    ...(player.stats?.ratingHistory || []),
    ...(player.cupStats?.ratingHistory || []),
    ...(player.euroStats?.ratingHistory || []),
  ].slice(-15);

  return ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : null;
};

const getSquadAverage = (squad: Player[]): number =>
  squad.length > 0 ? squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length : 0;

const getPositionAverage = (squad: Player[], position: PlayerPosition): number => {
  const samePosition = squad.filter(player => player.position === position);
  return samePosition.length > 0 ? getSquadAverage(samePosition) : getSquadAverage(squad);
};

const getDevelopmentSignal = (player: Player): number => {
  const changes = player.stats?.seasonalChanges || {};
  const values = Object.values(changes).filter(value => Number.isFinite(value));
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0);
};

const getAgeGroup = (age: number): ContractAgeGroup => {
  if (age <= 23) return 'YOUNG';
  if (age <= 29) return 'PRIME';
  if (age <= 33) return 'EXPERIENCED';
  return 'VETERAN';
};

const buildProfile = (player: Player, squadAverage: number, positionAverage: number): PlayerContractMindflow['profile'] => {
  const ageGroup = getAgeGroup(player.age);
  const talentGap = (player.attributes?.talent ?? player.overallRating) - player.overallRating;

  const careerStage: ContractCareerStage =
    player.age <= 21 ? 'DEVELOPMENT' :
    player.age <= 24 && talentGap >= 5 ? 'BREAKTHROUGH' :
    player.age <= 30 ? 'PEAK' :
    player.age <= 34 ? 'SECURITY' :
    'DECLINE';

  const qualityDelta = Math.max(player.overallRating - squadAverage, player.overallRating - positionAverage);
  const qualityLevel: ContractQualityLevel =
    qualityDelta >= 6 ? 'STAR_LEVEL' :
    qualityDelta >= 2 ? 'STARTER_LEVEL' :
    qualityDelta >= -3 ? 'SQUAD_PLAYER' :
    'BELOW_SQUAD';

  const potentialStatus: ContractPotentialStatus =
    talentGap >= 12 ? 'ELITE_UPSIDE' :
    talentGap >= 7 ? 'HIGH_UPSIDE' :
    talentGap >= 2 ? 'NORMAL' :
    'LOW_UPSIDE';

  return { ageGroup, careerStage, qualityLevel, potentialStatus };
};

const getTeamAmbitionFit = (club: Club): number => {
  const played = club.stats?.played || 0;
  if (played < 5) return 60;

  const pointsPerMatch = (club.stats?.points || 0) / Math.max(1, played);
  const form = club.stats?.form || [];
  const recentScore = form.slice(-5).reduce((sum, result) => {
    if (result === 'W') return sum + 3;
    if (result === 'R') return sum + 1;
    return sum;
  }, 0);

  return clamp(38 + pointsPerMatch * 18 + recentScore * 2.2, 20, 95);
};

const getRoleFit = (player: Player, profile: PlayerContractMindflow['profile']): number => {
  if (player.isUntouchable || player.squadRole === 'KEY_PLAYER') return 96;
  if (player.squadRole === 'STARTER') return 82;
  if (profile.qualityLevel === 'STAR_LEVEL') return 42;
  if (profile.qualityLevel === 'STARTER_LEVEL') return 56;
  return 68;
};

const getPlayingTimeFit = (player: Player, club: Club, profile: PlayerContractMindflow['profile']): number => {
  const matches = getCombinedMatches(player);
  const minutes = getCombinedMinutes(player);
  const teamMatches = Math.max(1, club.stats?.played || matches || 1);

  if (matches < 5 && club.stats?.played < 8) return 62;

  const minutesShare = clamp(minutes / Math.max(1, teamMatches * 90), 0, 1);
  const base = minutesShare * 100;

  if (profile.qualityLevel === 'STAR_LEVEL') return clamp(base - 8, 0, 100);
  if (profile.qualityLevel === 'STARTER_LEVEL') return clamp(base + 4, 0, 100);
  if (profile.careerStage === 'DEVELOPMENT') return clamp(base + 18, 0, 100);
  return clamp(base + 12, 0, 100);
};

const getPerformanceFit = (player: Player): number => {
  const matches = Math.max(1, getCombinedMatches(player));
  const averageRating = getAverageRating(player);
  if (matches >= 15 && averageRating !== null) {
    return clamp(50 + (averageRating - 6.5) * 18, 15, 95);
  }

  const goals = getCombinedGoals(player);
  const assists = getCombinedAssists(player);
  if (player.position === PlayerPosition.FWD) return clamp(48 + (goals / matches) * 55 + (assists / matches) * 20, 20, 90);
  if (player.position === PlayerPosition.MID) return clamp(48 + ((goals + assists) / matches) * 38, 20, 90);
  return 58;
};

const getClubReputationFit = (player: Player, club: Club): number => {
  const expectedReputation = clamp((player.overallRating - 34) / 4.3, 1, 20);
  const delta = club.reputation - expectedReputation;
  if (delta >= 1) return 88;
  if (delta >= -1) return 74;
  if (delta >= -3) return 58;
  if (delta >= -5) return 42;
  return 28;
};

const getSeasonPerformanceRaiseBonus = (player: Player): number => {
  const matches = getCombinedMatches(player);
  if (matches < 20) return 0;

  let bonus = 0;
  const averageRating = getAverageRating(player);
  if (averageRating !== null) {
    if (averageRating >= 7.35) bonus += 0.24;
    else if (averageRating >= 7.10) bonus += 0.16;
    else if (averageRating >= 6.90) bonus += 0.08;
  }

  const goalAssistRate = (getCombinedGoals(player) + getCombinedAssists(player)) / Math.max(1, matches);
  if (player.position === PlayerPosition.FWD) {
    if (goalAssistRate >= 0.75) bonus += 0.24;
    else if (goalAssistRate >= 0.50) bonus += 0.15;
    else if (goalAssistRate >= 0.32) bonus += 0.07;
  } else if (player.position === PlayerPosition.MID) {
    if (goalAssistRate >= 0.45) bonus += 0.20;
    else if (goalAssistRate >= 0.30) bonus += 0.12;
    else if (goalAssistRate >= 0.18) bonus += 0.06;
  } else if (player.position === PlayerPosition.DEF || player.position === PlayerPosition.GK) {
    if (averageRating !== null && averageRating >= 7.15) bonus += 0.14;
    else if (averageRating !== null && averageRating >= 6.95) bonus += 0.07;
  }

  return clamp(bonus, 0, 0.38);
};

const getRenewalRaiseLimit = (
  player: Player,
  currentClub: Club,
  profile: PlayerContractMindflow['profile'],
  currentClubSituation: PlayerContractMindflow['currentClubSituation']
): number | null => {
  if (!player.annualSalary || player.annualSalary <= 0) return null;

  let multiplier = 1.30;

  if (player.overallRating >= 78) multiplier += 0.38;
  else if (player.overallRating >= 74) multiplier += 0.28;
  else if (player.overallRating >= 70) multiplier += 0.18;
  else if (player.overallRating >= 66) multiplier += 0.10;

  if (profile.qualityLevel === 'STAR_LEVEL') multiplier += 0.24;
  else if (profile.qualityLevel === 'STARTER_LEVEL') multiplier += 0.12;

  if (player.isUntouchable || player.squadRole === 'KEY_PLAYER') multiplier += 0.16;
  else if (player.squadRole === 'STARTER') multiplier += 0.07;

  if (profile.potentialStatus === 'ELITE_UPSIDE') multiplier += 0.16;
  else if (profile.potentialStatus === 'HIGH_UPSIDE') multiplier += 0.07;

  if (currentClubSituation.clubReputationFit < 48) multiplier += 0.12;
  else if (currentClub.reputation >= 8) multiplier += 0.05;

  if (currentClubSituation.financialRespectFit < 45) multiplier += 0.14;
  if (currentClubSituation.totalStayComfort < 50) multiplier += 0.08;
  if (profile.ageGroup === 'PRIME') multiplier += 0.06;
  if (player.moralePersonality === 'AMBITIOUS' || player.moralePersonality === 'EGOIST') multiplier += 0.07;
  const performanceRaiseBonus = getSeasonPerformanceRaiseBonus(player);
  multiplier += performanceRaiseBonus;
  multiplier = clamp(multiplier, 1.30, 2.50);

  const rareRaiseCandidate =
    profile.qualityLevel === 'STAR_LEVEL' ||
    profile.potentialStatus === 'ELITE_UPSIDE' ||
    player.isUntouchable ||
    player.squadRole === 'KEY_PLAYER' ||
    performanceRaiseBonus >= 0.24 ||
    (profile.qualityLevel === 'STARTER_LEVEL' && currentClubSituation.financialRespectFit < 40);
  const rareChance =
    profile.qualityLevel === 'STAR_LEVEL' || profile.potentialStatus === 'ELITE_UPSIDE' ? 0.12 :
    rareRaiseCandidate ? 0.07 :
    0.02;
  const rareRoll = seededUnit(`${player.id}_${player.contractEndDate}_renewal_raise`);

  if (rareRoll < rareChance) {
    const rareStrength = 0.35 + (1 - rareRoll / rareChance) * 0.55;
    multiplier += rareRaiseCandidate ? rareStrength : rareStrength * 0.55;
  }

  return roundMoney(player.annualSalary * clamp(multiplier, 1.30, 3.05));
};

const buildExpectations = (
  player: Player,
  currentClub: Club,
  profile: PlayerContractMindflow['profile'],
  currentClubSituation: PlayerContractMindflow['currentClubSituation']
): PlayerContractMindflow['contractExpectations'] => {
  const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
  const currentSalary = Math.max(player.annualSalary || 0, fairSalary * 0.72);
  let salaryMultiplier = 1.05;

  if (profile.qualityLevel === 'STAR_LEVEL') salaryMultiplier += 0.22;
  else if (profile.qualityLevel === 'STARTER_LEVEL') salaryMultiplier += 0.12;

  if (currentClubSituation.financialRespectFit < 72) salaryMultiplier += 0.12;
  if (currentClubSituation.totalStayComfort >= 82) salaryMultiplier -= 0.07;
  if (currentClubSituation.totalStayComfort < 55) salaryMultiplier += 0.10;
  if (profile.ageGroup === 'VETERAN') salaryMultiplier -= 0.04;
  if (profile.potentialStatus === 'ELITE_UPSIDE') salaryMultiplier += 0.10;

  const salaryCeiling = FinanceService.calculatePolishLeagueSalaryCeiling(
    FinanceService.getClubTier(currentClub),
    currentClub.reputation
  );
  const rawExpectedSalary = roundMoney(Math.max(fairSalary, currentSalary) * salaryMultiplier);
  const renewalRaiseLimit = getRenewalRaiseLimit(player, currentClub, profile, currentClubSituation);
  const cappedExpectedSalary = salaryCeiling ? Math.min(rawExpectedSalary, salaryCeiling) : rawExpectedSalary;
  const expectedSalary = renewalRaiseLimit ? Math.min(cappedExpectedSalary, renewalRaiseLimit) : cappedExpectedSalary;
  const minimumSalary = roundMoney(expectedSalary * (currentClubSituation.totalStayComfort >= 78 ? 0.88 : 0.95));
  const rawPremiumSalary = roundMoney(expectedSalary * (currentClubSituation.totalStayComfort < 55 ? 1.28 : 1.18));
  const cappedPremiumSalary = salaryCeiling ? Math.min(rawPremiumSalary, salaryCeiling) : rawPremiumSalary;
  const premiumSalary = renewalRaiseLimit ? Math.min(cappedPremiumSalary, renewalRaiseLimit) : cappedPremiumSalary;

  const bonusMultiplier =
    profile.ageGroup === 'VETERAN' ? 0.92 :
    profile.ageGroup === 'EXPERIENCED' ? 0.72 :
    profile.ageGroup === 'PRIME' ? 0.56 :
    0.38;
  const reputationBonus = currentClub.reputation >= 10 ? 1.10 : currentClub.reputation >= 7 ? 1.02 : 0.94;
  const qualityBonus = profile.qualityLevel === 'STAR_LEVEL' ? 1.18 : profile.qualityLevel === 'STARTER_LEVEL' ? 1.08 : 1.0;
  const baseBonus = expectedSalary * bonusMultiplier * reputationBonus * qualityBonus;
  const expectedBonus = roundMoney(baseBonus * (profile.ageGroup === 'VETERAN' ? 1.10 : profile.ageGroup === 'YOUNG' ? 0.72 : 0.92));
  const minimumBonus = roundMoney(expectedBonus * (profile.ageGroup === 'VETERAN' ? 0.82 : 0.65));

  const preferredYears =
    player.age <= 22 ? 4 :
    player.age <= 27 ? 4 :
    player.age <= 31 ? 3 :
    player.age <= 34 ? 2 :
    1;

  const expectedRole =
    profile.qualityLevel === 'STAR_LEVEL' ? 'KEY_PLAYER' :
    profile.qualityLevel === 'STARTER_LEVEL' ? 'STARTER' :
    'NONE';

  const priorities =
    profile.ageGroup === 'YOUNG'
      ? { salary: 18, bonus: 8, years: 18, role: 16, playingTime: 24, ambition: 12, development: 24 }
      : profile.ageGroup === 'PRIME'
        ? { salary: 24, bonus: 14, years: 14, role: 20, playingTime: 18, ambition: 22, development: 10 }
        : profile.ageGroup === 'EXPERIENCED'
          ? { salary: 24, bonus: 20, years: 18, role: 16, playingTime: 12, ambition: 18, development: 5 }
          : { salary: 18, bonus: 26, years: 24, role: 10, playingTime: 8, ambition: 10, development: 2 };

  return {
    minimumSalary,
    expectedSalary,
    premiumSalary,
    minimumBonus,
    expectedBonus,
    minimumYears: player.age >= 34 ? 1 : 2,
    preferredYears,
    maximumYears: player.age >= 34 ? 2 : 5,
    expectedRole,
    priorities,
  };
};

const getMarketSituation = (
  player: Player,
  currentClub: Club,
  interestedClubs: Club[] = []
): PlayerContractMindflow['marketSituation'] => {
  const validInterest = interestedClubs.filter(club => club.id !== currentClub.id);
  const bestReputation = validInterest.length > 0
    ? Math.max(...validInterest.map(club => club.reputation))
    : null;
  const bestSportingUpgrade = bestReputation === null ? 0 : bestReputation - currentClub.reputation;
  const bestFinancialPotential = validInterest.length > 0
    ? Math.max(...validInterest.map(club => Math.max(0.75, club.reputation / Math.max(1, currentClub.reputation))))
    : 0;

  const playerLevelBoost = player.overallRating >= 75 ? 10 : player.overallRating >= 68 ? 5 : 0;
  const marketConfidence = clamp(
    validInterest.length * 16 +
    Math.max(0, bestSportingUpgrade) * 10 +
    playerLevelBoost,
    0,
    100
  );

  return {
    hasInterest: validInterest.length > 0,
    interestedClubCount: validInterest.length,
    bestInterestedClubReputation: bestReputation,
    bestSportingUpgrade,
    bestFinancialPotential,
    marketConfidence,
  };
};

const getNegotiationMemory = (
  player: Player,
  currentDate: Date,
  currentClubSituation: PlayerContractMindflow['currentClubSituation']
): PlayerContractMindflow['negotiationMemory'] => {
  const rejectedOffers = player.negotiationStep || 0;
  const isLocked = !!player.negotiationLockoutUntil && currentDate < new Date(player.negotiationLockoutUntil);
  const permanentBreakdown = !!player.isNegotiationPermanentBlocked;

  let frustration =
    rejectedOffers * 16 +
    (isLocked ? 10 : 0) +
    (permanentBreakdown ? 38 : 0) +
    (currentClubSituation.financialRespectFit < 60 ? 14 : 0) +
    (currentClubSituation.squadRoleFit < 55 ? 10 : 0);

  if ((player.morale ?? 55) >= 78) frustration -= 10;
  if (player.moralePersonality === 'LOYAL') frustration -= 8;
  if (player.moralePersonality === 'EGOIST') frustration += 8;
  if (player.moralePersonality === 'AMBITIOUS' && currentClubSituation.clubReputationFit < 58) frustration += 8;

  frustration = clamp(frustration, 0, 100);

  const lastOfferQuality: OfferQuality =
    rejectedOffers <= 0 ? 'NONE' :
    permanentBreakdown ? 'INSULTING' :
    rejectedOffers >= 3 ? 'WEAK' :
    currentClubSituation.financialRespectFit >= 86 ? 'FAIR' :
    'WEAK';

  const patience = clamp(
    72 +
    (player.moralePersonality === 'LOYAL' ? 14 : 0) +
    (player.moralePersonality === 'CALM' ? 8 : 0) -
    (player.moralePersonality === 'EGOIST' ? 12 : 0) -
    rejectedOffers * 12 -
    (permanentBreakdown ? 30 : 0),
    0,
    100
  );

  const trustInClub = clamp(100 - frustration + (currentClubSituation.totalStayComfort - 60) * 0.35, 0, 100);

  return {
    rejectedOffers,
    lastOfferQuality,
    trustInClub,
    frustration,
    patience,
    permanentBreakdown,
  };
};

const getTimePressure = (daysLeft: number): number => {
  if (daysLeft <= 0) return 100;
  if (daysLeft <= 30) return 78;
  if (daysLeft <= 90) return 55;
  if (daysLeft <= 180) return 32;
  if (daysLeft <= 365) return 16;
  return 0;
};

const getMindset = (
  player: Player,
  currentClubSituation: PlayerContractMindflow['currentClubSituation'],
  negotiationMemory: PlayerContractMindflow['negotiationMemory'],
  marketSituation: PlayerContractMindflow['marketSituation']
): PlayerContractMindflow['mindset'] => {
  const timePressure = getTimePressure(currentClubSituation.contractDaysLeft);
  const stayComfort = currentClubSituation.totalStayComfort;
  const frustration = negotiationMemory.frustration;
  const trust = negotiationMemory.trustInClub;
  const marketConfidence = marketSituation.marketConfidence;

  const marketOpenness = clamp(
    18 +
    timePressure * 0.45 +
    frustration * 0.62 +
    marketConfidence * 0.40 -
    stayComfort * 0.42 -
    trust * 0.20,
    0,
    100
  );

  const preContractReadiness = clamp(
    marketOpenness +
    timePressure * 0.42 +
    (negotiationMemory.permanentBreakdown ? 25 : 0) +
    Math.max(0, marketSituation.bestSportingUpgrade) * 8 -
    (stayComfort >= 82 ? 22 : stayComfort >= 72 ? 12 : 0),
    0,
    100
  );

  const renewalPriority = clamp(
    stayComfort * 0.75 +
    trust * 0.35 -
    frustration * 0.28 -
    timePressure * 0.12,
    0,
    100
  );

  let state: ContractMindsetState;
  if (stayComfort >= 86 && frustration <= 18 && marketOpenness <= 24) state = 'SUPER_HAPPY';
  else if (stayComfort >= 76 && frustration <= 28 && marketOpenness <= 38) state = 'HAPPY_TO_STAY';
  else if (frustration <= 32 && renewalPriority >= 58) state = 'OPEN_TO_RENEWAL';
  else if (currentClubSituation.financialRespectFit < 68 && frustration < 58) state = 'EXPECTING_BETTER_TERMS';
  else if (frustration >= 72 || negotiationMemory.permanentBreakdown) state = preContractReadiness >= 70 ? 'PRECONTRACT_READY' : 'READY_TO_LEAVE';
  else if (marketOpenness >= 68) state = preContractReadiness >= 72 ? 'PRECONTRACT_READY' : 'TESTING_MARKET';
  else if (frustration >= 48 || timePressure >= 55) state = 'LOSING_PATIENCE';
  else state = 'OPEN_TO_RENEWAL';

  const explanation = [
    stayComfort >= 80 ? 'Zawodnik dobrze czuje się w obecnym klubie.' : null,
    currentClubSituation.financialRespectFit < 68 ? 'Oczekuje lepszego finansowego uznania swojej pozycji.' : null,
    negotiationMemory.rejectedOffers > 0 ? `Historia rozmów obniża zaufanie: ${negotiationMemory.rejectedOffers} odrzucone próby.` : null,
    marketSituation.hasInterest ? `Rynek jest aktywny: ${marketSituation.interestedClubCount} klub(y) obserwują sytuację.` : null,
    currentClubSituation.contractDaysLeft <= 180 ? 'Końcówka kontraktu zwiększa presję decyzyjną.' : null,
    player.squadRole === 'KEY_PLAYER' || player.isUntouchable ? 'Status w drużynie działa na korzyść obecnego klubu.' : null,
  ].filter(Boolean) as string[];

  return {
    state,
    renewalPriority,
    marketOpenness,
    preContractReadiness,
    clubTrust: trust,
    explanation,
  };
};

const getExternalOfferGate = (
  currentClub: Club,
  targetClub: Club | undefined,
  mindset: PlayerContractMindflow['mindset'],
  currentClubSituation: PlayerContractMindflow['currentClubSituation'],
  negotiationMemory: PlayerContractMindflow['negotiationMemory']
): PlayerContractMindflow['externalOfferGate'] => {
  const reputationUpgrade = targetClub ? targetClub.reputation - currentClub.reputation : 0;
  const isMajorSportingUpgrade = reputationUpgrade >= 3;
  const isClearSportingUpgrade = reputationUpgrade >= 1;
  const isLowerStep = reputationUpgrade < 0;
  const isSuperHappy = mindset.state === 'SUPER_HAPPY';
  const requiresMajorUpgrade =
    isSuperHappy ||
    (mindset.state === 'HAPPY_TO_STAY' && currentClubSituation.contractDaysLeft > 90);

  let willingnessToListen = mindset.marketOpenness + Math.max(0, reputationUpgrade) * 10;
  if (isLowerStep) willingnessToListen -= 18;
  if (isSuperHappy) willingnessToListen -= 26;
  if (negotiationMemory.permanentBreakdown) willingnessToListen += 28;
  willingnessToListen = clamp(willingnessToListen, 0, 100);

  const autoRejectThreshold = requiresMajorUpgrade ? 72 : mindset.state === 'OPEN_TO_RENEWAL' ? 54 : 42;
  const willListen =
    negotiationMemory.permanentBreakdown ||
    mindset.state === 'READY_TO_LEAVE' ||
    mindset.state === 'PRECONTRACT_READY' ||
    (requiresMajorUpgrade ? isMajorSportingUpgrade && willingnessToListen >= 46 : willingnessToListen >= autoRejectThreshold) ||
    (isClearSportingUpgrade && currentClubSituation.contractDaysLeft <= 60 && willingnessToListen >= 40);

  const canSignPreContract =
    willListen &&
    currentClubSituation.contractDaysLeft > 0 &&
    currentClubSituation.contractDaysLeft <= 365 &&
    (
      mindset.state === 'PRECONTRACT_READY' ||
      negotiationMemory.permanentBreakdown ||
      (mindset.state === 'READY_TO_LEAVE' && currentClubSituation.contractDaysLeft <= 180) ||
      (mindset.state === 'TESTING_MARKET' && currentClubSituation.contractDaysLeft <= 90 && isClearSportingUpgrade) ||
      (currentClubSituation.contractDaysLeft <= 30 && mindset.preContractReadiness >= 58)
    );

  const preContractChanceMultiplier = clamp(
    0.25 +
    mindset.preContractReadiness / 72 +
    Math.max(0, reputationUpgrade) * 0.12 -
    (isSuperHappy ? 0.55 : 0),
    0.08,
    2.2
  );

  const reason = !willListen
    ? 'Zawodnik nie chce słuchać tej oferty na obecnym etapie.'
    : canSignPreContract
      ? 'Zawodnik jest gotów realnie rozważyć prekontrakt.'
      : 'Zawodnik może wysłuchać rynku, ale nie jest gotów podpisać prekontraktu.';

  return {
    willListen,
    requiresMajorUpgrade,
    canSignPreContract,
    preContractChanceMultiplier,
    willingnessToListen,
    autoRejectThreshold,
    reason,
  };
};

const evaluateRenewalOffer = (
  mindflow: PlayerContractMindflow,
  offer: { salary: number; bonus: number; years: number }
): RenewalOfferMindflowResult => {
  const expectations = mindflow.contractExpectations;
  const priorities = expectations.priorities;
  const prioritySum = Math.max(1, priorities.salary + priorities.bonus + priorities.years);

  const salaryWeight = priorities.salary / prioritySum;
  const bonusWeight = priorities.bonus / prioritySum;
  const yearsWeight = priorities.years / prioritySum;

  const salaryFit = offer.salary / Math.max(1, expectations.expectedSalary);
  const bonusFit = expectations.expectedBonus > 0
    ? offer.bonus / Math.max(1, expectations.expectedBonus)
    : 1;
  const yearsFit = offer.years / Math.max(1, expectations.preferredYears);

  const bonusSurplus = Math.max(0, bonusFit - 1);
  const salarySurplus = Math.max(0, salaryFit - 1);
  const effectiveSalaryFit = salaryFit + bonusSurplus * 0.08;
  const effectiveBonusFit = bonusFit + salarySurplus * (mindflow.profile.ageGroup === 'YOUNG' ? 0.75 : 1.15);

  const offerScore =
    clamp(effectiveSalaryFit, 0, 1.25) * salaryWeight +
    clamp(effectiveBonusFit, 0, 1.25) * bonusWeight +
    clamp(yearsFit, 0.55, 1.15) * yearsWeight;

  let requiredScore =
    mindflow.mindset.state === 'SUPER_HAPPY' ? 0.88 :
    mindflow.mindset.state === 'HAPPY_TO_STAY' ? 0.91 :
    mindflow.mindset.state === 'OPEN_TO_RENEWAL' ? 0.95 :
    mindflow.mindset.state === 'EXPECTING_BETTER_TERMS' ? 0.99 :
    mindflow.mindset.state === 'LOSING_PATIENCE' ? 1.02 :
    mindflow.mindset.state === 'TESTING_MARKET' ? 1.05 :
    mindflow.mindset.state === 'READY_TO_LEAVE' ? 1.08 :
    1.12;

  if (mindflow.marketSituation.marketConfidence >= 55) requiredScore += 0.03;
  if (mindflow.currentClubSituation.totalStayComfort >= 82) requiredScore -= 0.04;
  if (mindflow.negotiationMemory.rejectedOffers > 0) requiredScore += Math.min(0.06, mindflow.negotiationMemory.rejectedOffers * 0.02);
  requiredScore = clamp(requiredScore, 0.86, 1.14);

  const salaryFloor =
    mindflow.mindset.state === 'TESTING_MARKET' ||
    mindflow.mindset.state === 'READY_TO_LEAVE' ||
    mindflow.mindset.state === 'PRECONTRACT_READY'
      ? expectations.minimumSalary
      : expectations.minimumSalary * 0.94;
  const bonusFloor = expectations.minimumBonus * (
    mindflow.profile.ageGroup === 'YOUNG' ? 0.45 :
    mindflow.profile.ageGroup === 'PRIME' ? 0.55 :
    0.68
  );

  const demandPressure =
    mindflow.mindset.state === 'TESTING_MARKET' ||
    mindflow.mindset.state === 'READY_TO_LEAVE' ||
    mindflow.mindset.state === 'PRECONTRACT_READY' ||
    mindflow.negotiationMemory.frustration >= 55;

  const demandedSalary = demandPressure
    ? Math.max(expectations.expectedSalary, Math.round(expectations.premiumSalary / 10_000) * 10_000)
    : Math.max(expectations.minimumSalary, expectations.expectedSalary);
  const demandedBonus = demandPressure
    ? Math.max(expectations.expectedBonus, Math.round(expectations.minimumBonus * 1.15 / 5_000) * 5_000)
    : expectations.expectedBonus;

  const demands = {
    salary: roundMoney(demandedSalary),
    bonus: roundMoney(demandedBonus),
  };

  const isSalaryDisrespectful = offer.salary < salaryFloor;
  const isBonusDisrespectful = offer.bonus < bonusFloor && offer.salary < expectations.expectedSalary * 1.12;
  const isTooShort = offer.years < expectations.minimumYears;

  if (offer.salary < expectations.minimumSalary * 0.72 || (offer.bonus < expectations.minimumBonus * 0.18 && offer.salary < expectations.minimumSalary)) {
    return {
      accepted: false,
      reason: 'Mój klient uznał tę propozycję za niepoważną. Przy jego pozycji, wieku i perspektywach oczekujemy zupełnie innego poziomu oferty.',
      demands,
      offerQuality: 'INSULTING',
    };
  }

  if (isSalaryDisrespectful || isBonusDisrespectful || isTooShort) {
    const reasonParts = [
      isSalaryDisrespectful ? 'pensja jest poniżej minimalnego poziomu, jaki zawodnik uważa za uczciwy' : null,
      isBonusDisrespectful ? 'bonus za podpis nie rekompensuje ryzyka podpisania nowej umowy' : null,
      isTooShort ? 'długość kontraktu nie daje mu oczekiwanej stabilizacji' : null,
    ].filter(Boolean);

    return {
      accepted: false,
      reason: `Nie podpiszemy tego kontraktu. ${reasonParts.join(', ')}. Jeśli klub naprawdę widzi w nim ważnego zawodnika, oczekujemy warunków bliższych jego obecnej wartości rynkowej.`,
      demands,
      offerQuality: 'WEAK',
    };
  }

  if (offerScore >= requiredScore) {
    return {
      accepted: true,
      reason: '',
      demands: null,
      offerQuality: offerScore >= requiredScore + 0.14 ? 'STRONG' : 'FAIR',
    };
  }

  return {
    accepted: false,
    reason: 'Jesteśmy w stanie rozmawiać, ale ta oferta nadal nie odpowiada temu, jak zawodnik ocenia swoją pozycję w drużynie i możliwe opcje na rynku.',
    demands,
    offerQuality: offerScore >= requiredScore * 0.86 ? 'WEAK' : 'INSULTING',
  };
};

export const PlayerContractMindflowService = {
  evaluate: (params: PlayerContractMindflowParams): PlayerContractMindflow => {
    const { player, currentClub, currentSquad, currentDate, interestedClubs, targetClub } = params;
    const squadAverage = getSquadAverage(currentSquad);
    const positionAverage = getPositionAverage(currentSquad, player.position);
    const profile = buildProfile(player, squadAverage, positionAverage);
    const contractDaysLeft = getContractDaysLeft(player, currentDate);
    const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
    const financialRespectFit = clamp(((player.annualSalary || 0) / Math.max(1, fairSalary)) * 78, 18, 105);
    const developmentSignal = getDevelopmentSignal(player);
    const performanceFit = getPerformanceFit(player);

    const currentClubSituation: PlayerContractMindflow['currentClubSituation'] = {
      contractDaysLeft,
      clubReputationFit: getClubReputationFit(player, currentClub),
      teamAmbitionFit: getTeamAmbitionFit(currentClub),
      squadRoleFit: getRoleFit(player, profile),
      playingTimeFit: getPlayingTimeFit(player, currentClub, profile),
      moraleFit: clamp(player.morale ?? 55, 0, 100),
      developmentFit: clamp(58 + developmentSignal * 8 + (profile.careerStage === 'DEVELOPMENT' ? performanceFit * 0.08 : 0), 15, 95),
      financialRespectFit,
      totalStayComfort: 0,
    };

    currentClubSituation.totalStayComfort = clamp(
      currentClubSituation.clubReputationFit * 0.16 +
      currentClubSituation.teamAmbitionFit * 0.12 +
      currentClubSituation.squadRoleFit * 0.18 +
      currentClubSituation.playingTimeFit * 0.17 +
      currentClubSituation.moraleFit * 0.17 +
      currentClubSituation.developmentFit * 0.08 +
      currentClubSituation.financialRespectFit * 0.12,
      0,
      100
    );

    const contractExpectations = buildExpectations(player, currentClub, profile, currentClubSituation);
    const negotiationMemory = getNegotiationMemory(player, currentDate, currentClubSituation);
    const marketSituation = getMarketSituation(player, currentClub, interestedClubs);
    const mindset = getMindset(player, currentClubSituation, negotiationMemory, marketSituation);
    const externalOfferGate = getExternalOfferGate(currentClub, targetClub, mindset, currentClubSituation, negotiationMemory);

    return {
      profile,
      currentClubSituation,
      contractExpectations,
      negotiationMemory,
      marketSituation,
      externalOfferGate,
      mindset,
    };
  },
  evaluateRenewalOffer,
};
