import { Club, Player, PendingNegotiation, PlayerPosition, TransferTiming, TransferClubBidInput, TransferContractInput, AiTransferLogEntry, Coach } from '../types';
import { FinanceService as FinanceLogic } from './FinanceService';
import { TransferSellerLogicService } from './TransferSellerLogicService';
import { TransferPlayerDecisionService } from './TransferPlayerDecisionService';
import { FreeAgentNegotiationService } from './FreeAgentNegotiationService';
import { PlayerCareerService } from './PlayerCareerService';
import { PlayerContractMindflowService } from './PlayerContractMindflowService';
import { PlayerMoraleService } from './PlayerMoraleService';
import { PlayerReputationGrowthService } from './PlayerReputationGrowthService';
import { AiClubTransferStrategy, AiClubTransferStrategyService } from './AiClubTransferStrategyService';

/**
 * Sprawdza czy aktualnie trwa okno transferowe.
 * Nie dotyczy wolnych agentów — ci mogą być podpisywani przez cały rok.
 *
 * Letnie:  1 lipca  (m6, d1)  — 8 września  (m8, d8)  włącznie
 * Zimowe: 12 stycznia (m0, d12) — 13 lutego (m1, d13) włącznie
 */
const _isTransferWindowOpen = (currentDate: Date): boolean => {
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  const isSummer =
    (month === 6 && day >= 1) ||
    month === 7 ||
    (month === 8 && day <= 8);

  const isWinter =
    (month === 0 && day >= 12) ||
    (month === 1 && day <= 13);

  return isSummer || isWinter;
};

/**
 * Zwraca datę otwarcia najbliższego okna transferowego (dla negocjacji poza oknem).
 * Letnie:  1 lipca   Zimowe: 12 stycznia
 */
const _getNextWindowStart = (currentDate: Date): Date => {
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  if (month === 0 && day < 12) return new Date(year, 0, 12);
  if ((month === 1 && day >= 14) || (month >= 2 && month <= 5)) return new Date(year, 6, 1);
  return new Date(year + 1, 0, 12);
};

const _hasActiveTransferLockout = (player: Player, currentDate: Date): boolean => {
  return !!player.transferLockoutUntil && currentDate < new Date(player.transferLockoutUntil);
};

const _buildTransferLockoutUntil = (currentDate: Date): string => {
  const lockoutDate = new Date(currentDate);
  lockoutDate.setMonth(lockoutDate.getMonth() + 3);
  return lockoutDate.toISOString();
};

const _buildTransferOfferBanUntil = (currentDate: Date): string => {
  const banDate = new Date(currentDate);
  banDate.setFullYear(banDate.getFullYear() + 1);
  return banDate.toISOString();
};

const GULF_STAR_HUNTER_COUNTRIES = new Set(['KSA', 'QAT', 'UAE']);
const BIG_CLUB_REPUTATION = 18;
const VETERAN_STAR_MIN_AGE = 33;
const VETERAN_STAR_MIN_OVR = 85;
const GULF_SHOWPIECE_STAR_MIN_REPUTATION = 80;
const GULF_MEGA_OFFER_ACCEPTANCE_CHANCE = 0.75;
const ELITE_PRE_CONTRACT_WATCHLIST_MIN_OVR = 90;
const ELITE_PRE_CONTRACT_WATCHLIST_MIN_REPUTATION = 17;
const MIN_SQUAD_POSITION_COUNTS: Record<PlayerPosition, number> = {
  [PlayerPosition.GK]: 2,
  [PlayerPosition.DEF]: 6,
  [PlayerPosition.MID]: 6,
  [PlayerPosition.FWD]: 4,
};
const AI_MAX_SQUAD_SIZE = 32;
const TRANSFER_LIST_CAP_MIN_SQUAD_SIZE = 25;
const TRANSFER_LIST_MAX_SHARE = 0.25;
const HIGH_REPUTATION_RELEASE_THRESHOLD = 80;
const HIGH_REPUTATION_RELEASE_CHANCE = 0.03;

const _hasActiveTransferOfferBan = (player: Player, currentDate: Date): boolean => {
  return !!player.transferOfferBanUntil && currentDate < new Date(player.transferOfferBanUntil);
};

const _hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
};

const _seededRandom = (seed: string): number => {
  const x = Math.sin(_hashString(seed) + 1) * 10000;
  return x - Math.floor(x);
};

const _isGulfStarHunterClub = (club: Club): boolean =>
  GULF_STAR_HUNTER_COUNTRIES.has(club.country || '') && club.reputation >= 8;

const _getGulfOwnerShortfallCover = (club: Club, requiredCash: number): number => {
  if (!_isGulfStarHunterClub(club)) return 0;
  return Math.max(0, Math.ceil(requiredCash - club.budget));
};

const _isVeteranStar = (player: Player): boolean =>
  player.age >= VETERAN_STAR_MIN_AGE && player.overallRating >= VETERAN_STAR_MIN_OVR;

const _isGulfShowpieceStar = (player: Player): boolean =>
  _getPlayerReputation(player) >= GULF_SHOWPIECE_STAR_MIN_REPUTATION;

const _getContractDaysLeft = (player: Player, currentDate: Date): number => {
  if (!player.contractEndDate) return Number.POSITIVE_INFINITY;
  const endDate = new Date(player.contractEndDate);
  if (Number.isNaN(endDate.getTime())) return Number.POSITIVE_INFINITY;
  return Math.floor((endDate.getTime() - currentDate.getTime()) / 86_400_000);
};

const LAST_CONTRACT_YEAR_DAYS = 365;
const PRE_CONTRACT_PRIORITY_DAYS = 330;

const _isInLastContractYear = (player: Player, currentDate: Date): boolean => {
  const daysLeft = _getContractDaysLeft(player, currentDate);
  return daysLeft > 0 && daysLeft <= LAST_CONTRACT_YEAR_DAYS;
};

const _isElitePreContractWatchlistPlayer = (player: Player, currentDate: Date): boolean => {
  const daysLeft = _getContractDaysLeft(player, currentDate);
  return (
    player.overallRating >= ELITE_PRE_CONTRACT_WATCHLIST_MIN_OVR &&
    player.isNegotiationPermanentBlocked &&
    daysLeft > 0 &&
    daysLeft <= PRE_CONTRACT_PRIORITY_DAYS
  );
};

const _getPreContractJoinDate = (player: Player): string => {
  const contractEnd = new Date(player.contractEndDate);
  if (Number.isNaN(contractEnd.getTime())) return player.contractEndDate;
  contractEnd.setDate(contractEnd.getDate() + 1);
  return contractEnd.toISOString();
};

const _shouldUsePreContractInsteadOfPaidTransfer = (
  player: Player,
  currentDate: Date,
  paidTransferEffectiveDate?: Date
): boolean => {
  const daysLeft = _getContractDaysLeft(player, currentDate);
  if (daysLeft <= 0) return false;
  if (daysLeft <= PRE_CONTRACT_PRIORITY_DAYS) return true;
  if (!paidTransferEffectiveDate || !player.contractEndDate) return false;

  const contractEnd = new Date(player.contractEndDate);
  if (Number.isNaN(contractEnd.getTime())) return false;
  return contractEnd <= paidTransferEffectiveDate;
};

const _getTransferListPriority = (player: Player, squad: Player[], currentDate: Date): number => {
  const positionCount = squad.filter(p => p.position === player.position).length;
  const positionSurplus = Math.max(0, positionCount - MIN_SQUAD_POSITION_COUNTS[player.position]);
  const daysLeft = _getContractDaysLeft(player, currentDate);

  return (
    (player.isNegotiationPermanentBlocked ? 140 : 0) +
    (player.transferListDemandUntil ? 90 : 0) +
    (daysLeft <= PRE_CONTRACT_PRIORITY_DAYS ? 55 : daysLeft <= 730 ? 24 : 0) +
    (positionSurplus * 9) +
    (player.squadRole === 'KEY_PLAYER' ? -120 : 0) +
    (player.isUntouchable ? -160 : 0) +
    (player.loan ? -100 : 0) +
    Math.max(0, 90 - player.overallRating) +
    Math.max(0, player.age - 28) * 2 -
    Math.max(0, (player.attributes?.talent ?? player.overallRating) - player.overallRating) * 2 -
    _getPlayerReputationScore(player) * 4
  );
};

const _getPreviousCareerClub = (player: Player) =>
  [...(player.history || [])].reverse().find(entry => entry.clubId !== 'FREE_AGENTS');

const _getInterestedClubs = (player: Player, clubs: Club[]): Club[] => {
  const clubMap = new Map(clubs.map(club => [club.id, club]));
  return (player.interestedClubs || [])
    .map(clubId => clubMap.get(clubId))
    .filter((club): club is Club => !!club);
};

const _wasReleasedByBigClub = (player: Player, clubMap: Map<string, Club>): boolean => {
  const previousClub = _getPreviousCareerClub(player);
  if (!previousClub) return false;

  const previousClubInfo = clubMap.get(previousClub.clubId);
  return (previousClubInfo?.reputation ?? 0) >= BIG_CLUB_REPUTATION;
};

const _isGulfMegaOfferTarget = (player: Player, clubMap: Map<string, Club>): boolean =>
  _isGulfShowpieceStar(player) || (_isVeteranStar(player) && _wasReleasedByBigClub(player, clubMap));

const _isExpiringBigClubVeteranStar = (
  player: Player,
  sellerClub: Club,
  currentDate: Date
): boolean => {
  const daysLeft = Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000);
  return _isVeteranStar(player) &&
    sellerClub.reputation >= BIG_CLUB_REPUTATION &&
    daysLeft > 0 &&
    daysLeft <= PRE_CONTRACT_PRIORITY_DAYS;
};

const _getGulfShowpieceSalaryFloor = (player: Player, club: Club): number => {
  const reputation = _clamp(_getPlayerReputation(player), GULF_SHOWPIECE_STAR_MIN_REPUTATION, 100);
  const reputationFactor = (reputation - GULF_SHOWPIECE_STAR_MIN_REPUTATION) / 20;
  const countryFloor =
    club.country === 'KSA' ? 4_000_000 :
    club.country === 'QAT' ? 3_400_000 :
    2_900_000;
  const countryCeiling =
    club.country === 'KSA' ? 9_000_000 :
    club.country === 'QAT' ? 7_500_000 :
    6_500_000;

  return Math.round((countryFloor + (countryCeiling - countryFloor) * reputationFactor) / 100_000) * 100_000;
};

const _buildGulfStarOffer = (player: Player, club: Club, currentDate: Date) => {
  const countryPremium = club.country === 'KSA' ? 2.75 : club.country === 'QAT' ? 2.35 : 2.05;
  const reputationPremium = 1 + Math.max(0, club.reputation - 8) * 0.08;
  const showpiecePremium = _isGulfShowpieceStar(player)
    ? 1 + ((_getPlayerReputation(player) - GULF_SHOWPIECE_STAR_MIN_REPUTATION) * 0.025)
    : 1;
  const ageBonusPremium = player.age >= 36 ? 1.75 : player.age >= 34 ? 1.45 : 1.25;
  const salaryBase = Math.max(
    FinanceLogic.getFairMarketSalary(player.overallRating),
    _isGulfShowpieceStar(player) ? FinanceLogic.getFairMarketSalary(Math.max(player.overallRating, 90)) : 0,
    player.annualSalary || 0
  );
  const proposedSalary = Math.max(
    _isGulfShowpieceStar(player) ? _getGulfShowpieceSalaryFloor(player, club) : 0,
    Math.round((salaryBase * countryPremium * reputationPremium * showpiecePremium) / 100_000) * 100_000
  );
  const proposedBonus = Math.max(
    Math.round((salaryBase * ageBonusPremium * countryPremium * showpiecePremium) / 100_000) * 100_000,
    _isGulfShowpieceStar(player) ? Math.round((proposedSalary * 1.15) / 100_000) * 100_000 : 0
  );
  const contractYears = player.age >= 36 ? 1 : 2;
  const newEndDate = new Date(currentDate.getFullYear() + contractYears, 5, 30).toISOString();

  return { proposedSalary, proposedBonus, contractYears, newEndDate };
};

const _getGulfMegaOfferPreviousClub = (player: Player, clubMap: Map<string, Club>) => {
  const previousClub = _getPreviousCareerClub(player);
  if (!previousClub) return null;
  return clubMap.get(previousClub.clubId) || null;
};

const _countByPosition = (squad: Player[]): Record<PlayerPosition, number> => ({
  [PlayerPosition.GK]: squad.filter(p => p.position === PlayerPosition.GK).length,
  [PlayerPosition.DEF]: squad.filter(p => p.position === PlayerPosition.DEF).length,
  [PlayerPosition.MID]: squad.filter(p => p.position === PlayerPosition.MID).length,
  [PlayerPosition.FWD]: squad.filter(p => p.position === PlayerPosition.FWD).length,
});

const _hasCriticalDepthShortage = (squad: Player[]): boolean => {
  const counts = _countByPosition(squad);
  return (Object.keys(MIN_SQUAD_POSITION_COUNTS) as PlayerPosition[])
    .some(pos => counts[pos] < MIN_SQUAD_POSITION_COUNTS[pos]);
};

const _getAverageOverall = (squad: Player[]): number =>
  squad.length > 0 ? squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length : 0;

const _getPositionAverageOverall = (squad: Player[], position: PlayerPosition): number => {
  const samePosition = squad.filter(player => player.position === position);
  return samePosition.length > 0 ? _getAverageOverall(samePosition) : _getAverageOverall(squad);
};

const _clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const _getPlayerReputation = (player: Player): number => player.reputacja ?? 50;

const _getPlayerReputationScore = (player: Player): number =>
  _clamp((_getPlayerReputation(player) - 50) / 10, -3, 5);

const _canAiReleasePlayer = (
  player: Player,
  club: Club,
  currentDate: Date,
  reason: string
): boolean => {
  if (_getPlayerReputation(player) < HIGH_REPUTATION_RELEASE_THRESHOLD) return true;

  return _seededRandom(
    `AI_HIGH_REP_RELEASE_${reason}_${club.id}_${player.id}_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}`
  ) < HIGH_REPUTATION_RELEASE_CHANCE;
};

const _getSquadReviewScore = (player: Player): number =>
  player.overallRating - (player.age - 18) * 1.5 + _getPlayerReputationScore(player);

const _getRecruitmentReputationBonus = (
  player: Player,
  strategy: number,
  need?: ClubNeedAssessment
): number => {
  const strategyMultiplier = strategy === 2 ? 1.15 : strategy === 1 ? 0.55 : strategy === 0 ? 0.45 : 0.75;
  const urgencyMultiplier = need?.urgency === 'LOW' ? 0.65 : need?.urgency === 'CRITICAL' ? 0.50 : 1.0;
  return _getPlayerReputationScore(player) * strategyMultiplier * urgencyMultiplier;
};

const _hashToUnit = (seed: string): number => _seededRandom(seed);

const _getCoachCoreAssessment = (coach: Coach | null): { experience: number; decisionMaking: number; quality: number } => {
  const experience = coach?.attributes.experience ?? 50;
  const decisionMaking = coach?.attributes.decisionMaking ?? 50;
  return {
    experience,
    decisionMaking,
    quality: _clamp((experience * 0.55 + decisionMaking * 0.45) / 100, 0.15, 0.98)
  };
};

const _getCoreSquadSize = (club: Club, squadSize: number, seed: string): number => {
  if (squadSize <= 0) return 0;

  const reputationScore = _clamp((club.reputation - 1) / 17, 0, 1);
  const expected = Math.round(3 + reputationScore * 8);
  const variance = Math.floor(_hashToUnit(`${seed}_CORE_SIZE`) * 3) - 1;
  const maxBySquadSize = Math.max(1, Math.floor(squadSize * 0.40));
  const upperLimit = Math.min(11, Math.max(3, maxBySquadSize));

  return _clamp(expected + variance, Math.min(3, upperLimit), upperLimit);
};

const _getAgeProfileBonus = (player: Player): number => {
  if (player.age <= 20) return 2.0;
  if (player.age <= 24) return 3.5;
  if (player.age <= 29) return 4.0;
  if (player.age <= 32) return 2.0;
  if (player.age <= 35) return -1.5;
  return -4.0;
};

const _getRecentFormBonus = (player: Player): number => {
  const ratings = [
    ...(player.stats?.ratingHistory || []),
    ...(player.cupStats?.ratingHistory || []),
    ...(player.euroStats?.ratingHistory || [])
  ].slice(-6);
  if (ratings.length === 0) return 0;
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return _clamp((average - 6.7) * 2.0, -3.0, 4.0);
};

const _getCoreContractBonus = (player: Player, currentDate: Date): number => {
  const daysLeft = player.contractEndDate
    ? Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000)
    : 0;

  if (player.isNegotiationPermanentBlocked && daysLeft > 0 && daysLeft <= PRE_CONTRACT_PRIORITY_DAYS) return -8.0;
  if (daysLeft > 730) return 2.0;
  if (daysLeft > PRE_CONTRACT_PRIORITY_DAYS) return 0.8;
  if (daysLeft > 180) return -1.0;
  if (daysLeft > 0) return -3.0;
  return -6.0;
};

const _getPositionScarcityBonus = (player: Player, squad: Player[]): number => {
  const samePosition = squad
    .filter(candidate => candidate.position === player.position && candidate.id !== player.id)
    .sort((a, b) => b.overallRating - a.overallRating);
  const minimumDepth = MIN_SQUAD_POSITION_COUNTS[player.position];

  if (samePosition.length < minimumDepth) return 5.0;
  const bestReplacement = samePosition[0];
  if (!bestReplacement) return 5.0;
  return _clamp((player.overallRating - bestReplacement.overallRating) * 0.45, -2.0, 5.5);
};

const _scoreCorePlayer = (
  player: Player,
  squad: Player[],
  club: Club,
  coach: Coach | null,
  currentDate: Date,
  seed: string
): number => {
  const coachAssessment = _getCoachCoreAssessment(coach);
  const perceptionNoiseRange = 0.18 - coachAssessment.quality * 0.13;
  const noise = (_hashToUnit(`${seed}_${player.id}_CORE_SCORE`) * 2 - 1) * perceptionNoiseRange;
  const perceivedOverall = player.overallRating * (1 + noise);
  const talentGap = Math.max(0, player.attributes.talent - player.overallRating);
  const leadershipBonus = (player.attributes.leadership + player.attributes.mentality + player.attributes.workRate) / 100;
  const salaryPressure = player.annualSalary > 0
    ? player.annualSalary / Math.max(1, FinanceLogic.getFairMarketSalary(Math.max(1, player.overallRating)))
    : 1;

  const continuityBonus = player.isUntouchable ? 4.5 : player.squadRole === 'KEY_PLAYER' ? 2.5 : 0;
  const starterBonus = player.squadRole === 'STARTER' ? 1.5 : 0;
  const salaryPenalty = salaryPressure > 1.65 && player.overallRating < _getAverageOverall(squad) + 2
    ? (salaryPressure - 1.65) * 3.0
    : 0;

  return (
    perceivedOverall * 0.62 +
    player.attributes.talent * 0.16 +
    talentGap * 0.28 +
    _getPositionScarcityBonus(player, squad) +
    _getAgeProfileBonus(player) +
    _getRecentFormBonus(player) +
    _getCoreContractBonus(player, currentDate) +
    _getPlayerReputationScore(player) * 0.8 +
    leadershipBonus +
    continuityBonus +
    starterBonus -
    salaryPenalty +
    club.reputation * 0.08
  );
};

const _selectCorePlayerIds = (
  club: Club,
  squad: Player[],
  coach: Coach | null,
  currentDate: Date,
  sessionSeed: number
): string[] => {
  if (squad.length === 0) return [];

  const seed = `${sessionSeed}_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}_${club.id}`;
  const coreSize = _getCoreSquadSize(club, squad.length, seed);
  const eligible = squad.filter(player =>
    !player.transferPendingClubId &&
    player.clubId !== 'FREE_AGENTS'
  );

  return eligible
    .map(player => ({
      player,
      score: _scoreCorePlayer(player, squad, club, coach, currentDate, seed)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, coreSize)
    .map(entry => entry.player.id);
};

const _getCombinedMatches = (player: Player): number =>
  (player.stats?.matchesPlayed || 0) +
  (player.cupStats?.matchesPlayed || 0) +
  (player.euroStats?.matchesPlayed || 0);

const _getCombinedMinutes = (player: Player): number =>
  (player.stats?.minutesPlayed || 0) +
  (player.cupStats?.minutesPlayed || 0) +
  (player.euroStats?.minutesPlayed || 0);

const _shouldAiTryRenewContract = (
  player: Player,
  squad: Player[],
  club: Club,
  currentDate: Date,
  daysLeft: number
): boolean => {
  if (player.loan) return false;
  if (player.transferPendingClubId) return false;
  if (player.isOnTransferList && !player.isUntouchable) return false;

  const squadAverage = _getAverageOverall(squad);
  const positionAverage = _getPositionAverageOverall(squad, player.position);
  const matches = _getCombinedMatches(player);
  const minutes = _getCombinedMinutes(player);
  const isImportantRole = player.squadRole === 'KEY_PLAYER' || player.squadRole === 'STARTER' || player.isUntouchable;
  const strongForSquad = player.overallRating >= squadAverage + 2 || player.overallRating >= positionAverage + 3;
  const youngUpside = player.age <= 23 && player.attributes.talent >= player.overallRating + 8;
  const usefulVeteran = player.age >= 32 && player.age <= 35 && player.overallRating >= squadAverage + 2 && matches >= 8;
  const fadingVeteran = player.age >= 35 && player.overallRating < squadAverage + 2;
  const unusedFringe = !isImportantRole && matches < 6 && minutes < 450 && player.overallRating < positionAverage;
  const tooExpensiveForRole = player.annualSalary > FinanceLogic.getFairMarketSalary(Math.max(1, player.overallRating + 4)) && !strongForSquad;

  if (fadingVeteran || unusedFringe || tooExpensiveForRole) return false;
  if (isImportantRole || strongForSquad || youngUpside || usefulVeteran) return true;

  const squadSize = squad.length;
  const positionCount = squad.filter(candidate => candidate.position === player.position).length;
  if (positionCount <= MIN_SQUAD_POSITION_COUNTS[player.position]) return true;

  const monthKey = `${currentDate.getFullYear()}_${currentDate.getMonth()}`;
  const conservativeClub = club.reputation <= 7 && squadSize < 25;
  const depthChance = conservativeClub ? 0.55 : 0.25;
  return daysLeft <= PRE_CONTRACT_PRIORITY_DAYS && _seededRandom(`AI_RENEW_DEPTH_${club.id}_${player.id}_${monthKey}`) < depthChance;
};

const _buildAiPreContractOffer = (
  player: Player,
  sellerClub: Club,
  buyerClub: Club,
  currentDate: Date,
  isEliteWatchlistOpportunity = false
): { salary: number; bonus: number; years: number } => {
  const repDelta = buyerClub.reputation - sellerClub.reputation;
  const salaryMultiplier = isEliteWatchlistOpportunity
    ? (repDelta >= 2 ? 1.42 : repDelta >= 0 ? 1.32 : 1.55)
    : repDelta >= 3 ? 1.24 : repDelta >= 1 ? 1.14 : repDelta === 0 ? 1.08 : 1.32;
  const rawSalary = Math.max(
    FinanceLogic.getFairMarketSalary(player.overallRating),
    Math.round((player.annualSalary || FinanceLogic.getFairMarketSalary(player.overallRating)) * salaryMultiplier / 10_000) * 10_000
  );
  const salaryCeiling = FinanceLogic.calculatePolishLeagueSalaryCeiling(
    FinanceLogic.getClubTier(buyerClub),
    buyerClub.reputation
  );
  const salary = salaryCeiling ? Math.min(rawSalary, salaryCeiling) : rawSalary;
  const bonusBase = salaryCeiling ? Math.min(player.annualSalary || salary, salary) : (player.annualSalary || salary);
  const bonusMultiplier = isEliteWatchlistOpportunity
    ? (player.age < 24 ? 0.75 : player.age <= 30 ? 1.05 : player.age <= 34 ? 1.25 : 1.45)
    : player.age < 24 ? 0.35 : player.age <= 30 ? 0.55 : player.age <= 34 ? 0.80 : 1.05;
  const bonus = Math.round(bonusBase * bonusMultiplier / 10_000) * 10_000;
  const years = player.age <= 27 ? 4 : player.age <= 31 ? 3 : player.age <= 34 ? 2 : 1;

  return { salary, bonus, years };
};

const _findWeakestSurplusPlayer = (squad: Player[], skippedIds: Set<string> = new Set()): Player | null => {
  const counts = _countByPosition(squad);
  return [...squad]
    .filter(p =>
      !skippedIds.has(p.id) &&
      !p.isUntouchable &&
      !p.loan &&
      !p.transferPendingClubId &&
      counts[p.position] > MIN_SQUAD_POSITION_COUNTS[p.position]
    )
    .sort((a, b) => {
      const scoreA = a.overallRating - (a.annualSalary / 100_000) - (a.age >= 32 ? 4 : 0) + _getPlayerReputationScore(a);
      const scoreB = b.overallRating - (b.annualSalary / 100_000) - (b.age >= 32 ? 4 : 0) + _getPlayerReputationScore(b);
      return scoreA - scoreB;
    })[0] || null;
};

const _getTransferListOpportunity = (
  player: Player,
  buyerClub: Club,
  sellerClub: Club
): { scoreBonus: number; budgetBoost: number } => {
  if (!player.isOnTransferList) return { scoreBonus: 0, budgetBoost: 0 };

  const repDelta = sellerClub.reputation - buyerClub.reputation;
  const buyerIdealOvr = 30 + buyerClub.reputation * 4.5;
  const sellerIdealOvr = 30 + sellerClub.reputation * 4.5;
  const qualityVsSeller = player.overallRating - sellerIdealOvr;

  let scoreBonus = 0;
  let budgetBoost = 0;

  if (repDelta >= -1 && repDelta <= 2) {
    scoreBonus += 12;
    budgetBoost += 0.10;
  } else if (repDelta <= 5 && player.overallRating >= buyerIdealOvr - 2) {
    scoreBonus += 6;
    budgetBoost += 0.05;
  }

  if (sellerClub.reputation >= buyerClub.reputation) scoreBonus += 4;

  if (qualityVsSeller >= 4) {
    scoreBonus += 12;
    budgetBoost += 0.10;
  } else if (qualityVsSeller >= 1) {
    scoreBonus += 8;
    budgetBoost += 0.05;
  }

  if (player.age <= 29) scoreBonus += 3;
  if (player.age >= 33) scoreBonus -= 2;

  return {
    scoreBonus: Math.max(0, scoreBonus),
    budgetBoost: Math.min(0.20, Math.max(0, budgetBoost))
  };
};

interface ClubNeedAssessment {
  position: PlayerPosition;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: 'SHORTAGE' | 'CONTRACT_LOSS' | 'INJURY' | 'QUALITY_GAP' | 'FORM_PANIC' | 'IMPULSE';
  starterRequired: boolean;
}

/**
 * Centralna diagnoza potrzeb transferowych klubu AI.
 * Zastępuje trzy oddzielne kopie logiki w funkcjach zakupowych.
 *
 * Triggery:
 *   SHORTAGE      — za mało zawodników na pozycji (CRITICAL)
 *   CONTRACT_LOSS — lider odmówił przedłużenia i wkrótce odejdzie (HIGH)
 *   INJURY        — lider kontuzjowany >30 dni (HIGH)
 *   FORM_PANIC    — ≥3 porażki z ostatnich 5 → losowa "winna" pozycja (HIGH)
 *   QUALITY_GAP   — najlepszy OVR poniżej idealOvr−8 (MEDIUM)
 *   IMPULSE       — 6% szansy "trener chciał" upgrade (LOW)
 *
 * Nieprzewidywalność:
 *   - Szum ±15% na QUALITY_GAP (seed per klub+miesiąc) — różne progi reakcji
 *   - FORM_PANIC losuje JEDNĄ pozycję, nie wszystkie
 *   - "Reluctant buyer": 10% szansy pominięcia MEDIUM/LOW w danym miesiącu
 *   - Budget aggression: bogate kluby mają próg IMPULSE ×2
 */
const _assessClubNeeds = (
  club: Club,
  squad: Player[],
  currentDate: Date,
  aiStrategy?: AiClubTransferStrategy
): ClubNeedAssessment[] => {
  const monthKey = currentDate.getFullYear() * 100 + currentDate.getMonth();
  const clubHash = Math.abs(club.id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0));
  const seed = (clubHash ^ (monthKey * 2654435761)) >>> 0;
  const seededRand = (offset: number): number => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const positions: PlayerPosition[] = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];
  const minCounts = MIN_SQUAD_POSITION_COUNTS;
  const idealOvr = 30 + club.reputation * 4.5;

  // FORM_PANIC: ≥3 strat z ostatnich 5 → losuje się JEDNA pozycja "winna" serii
  const recentForm = (club.stats as any)?.form as string[] | undefined || [];
  const recentLosses = recentForm.slice(-5).filter(r => r === 'P').length;
  const panicPosition: PlayerPosition | null = recentLosses >= 3 && (seededRand(12345) < (aiStrategy?.panicBuyChance ?? 0.20))
    ? positions[Math.floor(seededRand(9999) * positions.length)]
    : null;

  const results: ClubNeedAssessment[] = [];

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const posSquad = squad.filter(p => p.position === pos);
    const posCount = posSquad.length;
    const keyPlayer = [...posSquad].sort((a, b) => b.overallRating - a.overallRating)[0];
    const bestOvr = keyPlayer?.overallRating || 0;

    // Szum ±15% per pozycja — różne kluby mają różne progi QUALITY_GAP
    const urgencyNoise = 1 + (seededRand(i * 37 + 1) * 0.30 - 0.15);

    // TRIGGER 1: SHORTAGE (CRITICAL)
    if (posCount < minCounts[pos]) {
      results.push({ position: pos, urgency: 'CRITICAL', reason: 'SHORTAGE', starterRequired: true });
      continue;
    }

    // TRIGGER 2: CONTRACT_LOSS (HIGH)
    // Lider odmówił przedłużenia — wiadomo że odejdzie, szukaj następcy z wyprzedzeniem
    const daysToExpiry = keyPlayer
      ? Math.floor((new Date(keyPlayer.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000)
      : 999;
    if (keyPlayer?.isNegotiationPermanentBlocked && daysToExpiry < 180 && daysToExpiry > 0) {
      results.push({ position: pos, urgency: 'HIGH', reason: 'CONTRACT_LOSS', starterRequired: true });
      continue;
    }

    // TRIGGER 3: INJURY (HIGH)
    // Lider kontuzjowany >30 dni — rotacyjny zastępca wystarczy
    if (keyPlayer?.health.status === 'INJURED' && (keyPlayer.health.injury?.daysRemaining || 0) > 100) {
      results.push({ position: pos, urgency: 'HIGH', reason: 'INJURY', starterRequired: false });
      continue;
    }

    // TRIGGER 4: FORM_PANIC (HIGH)
    // Losowa "winna" pozycja po serii porażek — zarząd wywiera presję na jedną pozycję
    if (pos === panicPosition) {
      results.push({ position: pos, urgency: 'HIGH', reason: 'FORM_PANIC', starterRequired: true });
      continue;
    }

    // TRIGGER 5: QUALITY_GAP (MEDIUM) — z szumem: różne kluby reagują przy różnych progach
    const patienceFactor = 1.14 - (aiStrategy?.patience ?? 0.5) * 0.28;
    const ovrGap = (idealOvr - bestOvr) * urgencyNoise * patienceFactor;
    if (ovrGap > 8) {
      results.push({
        position: pos,
        urgency: 'MEDIUM',
        reason: 'QUALITY_GAP',
        starterRequired: ovrGap > 14
      });
      continue;
    }

    // TRIGGER 6: IMPULSE (LOW) — "trener chciał" — bogaty klub ma wyższy próg
    const budgetAggression = club.budget > FinanceLogic.getFairMarketSalary(idealOvr) * 18 ? 2.0 : 1.0;
    const impulseMultiplier = aiStrategy ? Math.max(0.55, aiStrategy.budgetAggression) : 1.0;
    if (seededRand(i * 113 + 7) < 0.06 * budgetAggression * impulseMultiplier) {
      results.push({ position: pos, urgency: 'LOW', reason: 'IMPULSE', starterRequired: false });
    }
  }

  // "Reluctant buyer": 10% szansy że klub z MEDIUM/LOW potrzebami odpuszcza w tym miesiącu
  const reluctantChance = aiStrategy ? 0.06 + (aiStrategy.patience * 0.12) - Math.max(0, aiStrategy.budgetAggression - 1) * 0.08 : 0.10;
  if (seededRand(42) < _clamp(reluctantChance, 0.02, 0.18)) {
    return results.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH');
  }

  const urgencyOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  return results.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
};

export const AiContractService = {
  enforceTransferListLimits: (
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): Record<string, Player[]> => {
    const updatedPlayersMap = { ...playersMap };

    Object.entries(updatedPlayersMap).forEach(([clubId, squad]) => {
      if (clubId === userTeamId || clubId === 'FREE_AGENTS') return;
      if (!squad || squad.length <= TRANSFER_LIST_CAP_MIN_SQUAD_SIZE) return;

      const listed = squad.filter(player => player.isOnTransferList);
      const maxListed = Math.floor(squad.length * TRANSFER_LIST_MAX_SHARE);
      if (listed.length <= maxListed) return;

      const keepIds = new Set(
        [...listed]
          .sort((a, b) =>
            _getTransferListPriority(b, squad, currentDate) - _getTransferListPriority(a, squad, currentDate)
          )
          .slice(0, maxListed)
          .map(player => player.id)
      );

      updatedPlayersMap[clubId] = squad.map(player =>
        player.isOnTransferList && !keepIds.has(player.id)
          ? { ...player, isOnTransferList: false, transferListPrice: undefined }
          : player
      );
    });

    return updatedPlayersMap;
  },

  processAiPrioritySquadDepth: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    let updatedClubs = [...clubs];
    const updatedPlayersMap = { ...playersMap };

    for (const club of updatedClubs) {
      if (club.id === userTeamId) continue;

      let squad = [...(updatedPlayersMap[club.id] || [])];
      if (squad.length === 0) continue;

      const skippedReleaseIds = new Set<string>();
      while (squad.length >= AI_MAX_SQUAD_SIZE && _hasCriticalDepthShortage(squad)) {
        const playerToRelease = _findWeakestSurplusPlayer(squad, skippedReleaseIds);
        if (!playerToRelease) break;

        if (!_canAiReleasePlayer(playerToRelease, club, currentDate, 'SQUAD_DEPTH')) {
          skippedReleaseIds.add(playerToRelease.id);
          if (!_isInLastContractYear(playerToRelease, currentDate)) {
            squad = squad.map(p =>
              p.id === playerToRelease.id ? { ...p, isOnTransferList: true } : p
            );
          }
          continue;
        }

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const releaseCost = Math.floor(playerToRelease.annualSalary * 0.25);
        const updatedHistory = PlayerCareerService.movePlayer(
          playerToRelease,
          { clubName: 'BEZ KLUBU', clubId: 'FREE_AGENTS' },
          currentYear,
          currentMonth,
          { clubName: club.name, clubId: club.id }
        );

        const releasedPlayer: Player = {
          ...PlayerCareerService.resetClubStatsForNewEntry(playerToRelease),
          clubId: 'FREE_AGENTS',
          annualSalary: 0,
          contractEndDate: '',
          marketValue: 0,
          negotiationStep: 0,
          isNegotiationPermanentBlocked: false,
          isOnTransferList: false,
          interestedClubs: [],
          transferPendingClubId: undefined,
          transferReportDate: undefined,
          transferPendingFee: undefined,
          transferPendingSalary: undefined,
          transferPendingBonus: undefined,
          transferPendingContractYears: undefined,
          history: updatedHistory,
        };

        squad = squad.filter(p => p.id !== playerToRelease.id);
        updatedPlayersMap['FREE_AGENTS'] = [...(updatedPlayersMap['FREE_AGENTS'] || []), releasedPlayer];
        updatedClubs = updatedClubs.map(c =>
          c.id === club.id ? { ...c, budget: Math.max(0, c.budget - releaseCost) } : c
        );
      }

      const counts = _countByPosition(squad);
      updatedPlayersMap[club.id] = squad.map(p =>
        counts[p.position] > MIN_SQUAD_POSITION_COUNTS[p.position]
          ? p
          : { ...p, isOnTransferList: false }
      );
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  /**
   * Przetwarza wszystkie kluby AI w poszukiwaniu kończących się kontraktów.
   */
  processClubsContracts: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };

    updatedClubs = updatedClubs.map(club => {
      // Pomijamy klub gracza i kluby bez przypisanych piłkarzy
      if (club.id === userTeamId || !updatedPlayersMap[club.id]) return club;

      let currentClub = { ...club };
      const squad = updatedPlayersMap[club.id];

      updatedPlayersMap[club.id] = squad.map(player => {
        const p = { ...player };
        
        // 1. Sprawdzenie czy kontrakt wygasa (poniżej 330 dni)
        const daysLeft = Math.floor((new Date(p.contractEndDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0 || daysLeft > 425) return p;
        if (!_shouldAiTryRenewContract(p, squad, club, currentDate, daysLeft)) return p;

        const forgetRoll = _seededRandom(`AI_CONTRACT_FORGET_${club.id}_${p.id}_${new Date(p.contractEndDate).getFullYear()}`);
        if (forgetRoll < 0.001) {
          return {
            ...p,
            negotiationLockoutUntil: p.contractEndDate,
          };
        }

        // 2. Blokady: Czy zawodnik chce w ogóle rozmawiać?
        const contractMindflow = PlayerContractMindflowService.evaluate({
          player: p,
          currentClub: club,
          currentSquad: squad,
          currentDate,
          interestedClubs: _getInterestedClubs(p, updatedClubs),
        });

        if (
          contractMindflow.mindset.state === 'READY_TO_LEAVE' ||
          contractMindflow.mindset.state === 'PRECONTRACT_READY'
        ) {
          return _isInLastContractYear(p, currentDate) ? p : { ...p, isOnTransferList: true };
        }

        const isLocked = p.negotiationLockoutUntil && currentDate < new Date(p.negotiationLockoutUntil);
        if (isLocked || p.isNegotiationPermanentBlocked) return p;

        // 3. Obliczanie oferty AI z jednego źródła oczekiwań zawodnika.
        const expectations = contractMindflow.contractExpectations;
        const salaryPressure =
          contractMindflow.mindset.state === 'EXPECTING_BETTER_TERMS' ? 1.05 :
          contractMindflow.mindset.state === 'LOSING_PATIENCE' ? 1.10 :
          contractMindflow.mindset.state === 'TESTING_MARKET' ? 1.14 :
          contractMindflow.currentClubSituation.totalStayComfort >= 82 ? 0.96 :
          1.0;
        const proposedSalary = Math.max(
          expectations.minimumSalary,
          Math.round((expectations.expectedSalary * salaryPressure) / 10_000) * 10_000
        );
        
        // Bonus za podpis oparty o widełki mindflow, bez drugiej losowej kalkulacji oczekiwań.
        const proposedBonus = Math.max(
          expectations.minimumBonus,
          Math.round((expectations.expectedBonus * 0.88) / 10_000) * 10_000
        );

        // Czy klub ma na to pieniądze w puli bonusowej?
        if (proposedBonus > currentClub.signingBonusPool) return p;

        // 4. Ewaluacja silnikiem gry
        const newEndDate = new Date(currentDate.getFullYear() + expectations.preferredYears, 5, 30).toISOString();
        const result = FinanceLogic.evaluateContractLogic(p, proposedSalary, proposedBonus, newEndDate, currentDate, club.reputation, FinanceLogic.getClubTier(club));

        if (result.accepted) {
          // SUKCES: Piłkarz zostaje
          currentClub.signingBonusPool -= proposedBonus;
          currentClub.budget -= proposedBonus;
          return {
            ...PlayerMoraleService.applyContractSigningMindflowReset(p, currentDate),
            annualSalary: proposedSalary,
            contractEndDate: newEndDate,
            negotiationStep: 0,
            isOnTransferList: false // Zdejmij z listy jeśli podpisał
          };
        } else {
          // PORAŻKA: Zwiększ licznik prób
          const nextStep = (p.negotiationStep || 0) + 1;
          const lockout = new Date(currentDate);
          lockout.setDate(lockout.getDate() + 21); // Blokada na 3 tygodnie

          const permanentBlock = nextStep >= 3;
          
          return {
            ...p,
            negotiationStep: nextStep,
            negotiationLockoutUntil: lockout.toISOString(),
            isNegotiationPermanentBlocked: permanentBlock,
            isOnTransferList: permanentBlock // Jeśli obraził się na amen -> trafia na listę transferową
          };
        }
      });

      return currentClub;
    });

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  // TUTAJ WSTAW TEN KOD - SYSTEM REKRUTACJI FAIR PLAY
  /**
   * Analizuje wolnych agentów i generuje oferty oczekujące dla klubów AI.
   */
processAiRecruitment: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]>, newOffers: PendingNegotiation[], logEntries: AiTransferLogEntry[] } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const newOffers: PendingNegotiation[] = []; // AI nie używa już flow PendingNegotiation
    const logEntries: AiTransferLogEntry[] = [];

    const freeAgents = updatedPlayersMap['FREE_AGENTS'] || [];
    if (freeAgents.length === 0) return { updatedClubs, updatedPlayers: updatedPlayersMap, newOffers, logEntries };

    const clubMap = new Map(updatedClubs.map(c => [c.id, c]));

    updatedClubs = updatedClubs.map(club => {
      if (club.id === userTeamId) return club;

      // DYNAMICZNA diagnoza potrzeb kadrowych:
      // klub szuka nie tylko brakow ilosciowych, ale tez upgrade'u na zbyt slabej pozycji.
      const squad = updatedPlayersMap[club.id] || [];
      const minCounts = MIN_SQUAD_POSITION_COUNTS;
      const idealOvr = 30 + club.reputation * 4.5;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);
      const needsFA = _assessClubNeeds(club, squad, currentDate, aiStrategy);
      const hasCriticalShortage = needsFA.some(n => n.urgency === 'CRITICAL' && n.reason === 'SHORTAGE');
      const gulfStarCandidate = _isGulfStarHunterClub(club)
        ? (updatedPlayersMap['FREE_AGENTS'] || [])
            .filter(fa =>
              _isGulfMegaOfferTarget(fa, clubMap) &&
              !fa.aiNegotiationClubId &&
              !FreeAgentNegotiationService.isClubLockedOut(fa, club.id, currentDate)
            )
            .sort((a, b) =>
              _getPlayerReputation(b) - _getPlayerReputation(a) ||
              b.overallRating - a.overallRating ||
              b.age - a.age
            )[0]
        : null;
      if (needsFA.length === 0 && !gulfStarCandidate) return club;

      // OGRANICZENIE CZĘSTOTLIWOŚCI: klub może mieć tylko 1 aktywną negocjację z wolnym agentem
      const alreadyNegotiating = freeAgents.some(fa => fa.aiNegotiationClubId === club.id);
      if (alreadyNegotiating) return club;

      if (club.budget <= 250_000 && !hasCriticalShortage && !gulfStarCandidate) return club;

      // Szukanie kandydata: pasująca pozycja, OVR w zasięgu, nie jest już w negocjacji z innym AI, brak blokady
      // Używamy updatedPlayersMap zamiast freeAgents — freeAgents to stary snapshot sprzed pętli.
      // Bez tego kilka klubów może w jednej iteracji zgłosić się do tego samego agenta.
      const freeAgentCandidates = (updatedPlayersMap['FREE_AGENTS'] || []).filter(fa => {
        const needFA = needsFA.find(n => n.position === fa.position);
        if (!needFA) return false;
        const faMinOvr = needFA.reason === 'SHORTAGE' ? idealOvr - 30 : needFA.urgency === 'CRITICAL' ? idealOvr - 16 : idealOvr - 12;
        const faMaxOvr = needFA.reason === 'SHORTAGE' ? idealOvr + 12 : idealOvr + 7;
        if (fa.overallRating > faMaxOvr || fa.overallRating < faMinOvr) return false;
        if (fa.aiNegotiationClubId) return false;
        if (FreeAgentNegotiationService.isClubLockedOut(fa, club.id, currentDate)) return false;

        const posSquad = squad.filter(p => p.position === fa.position);
        const weakestExisting = [...posSquad].sort((a, b) => a.overallRating - b.overallRating)[0];
        const hasShortage = posSquad.length < minCounts[fa.position];
        const isUpgrade = !!weakestExisting && fa.overallRating >= weakestExisting.overallRating + 2;

        return hasShortage || isUpgrade;
      }).sort((a, b) => {
        const needA = needsFA.find(n => n.position === a.position);
        const needB = needsFA.find(n => n.position === b.position);
        const scoreA = AiClubTransferStrategyService.candidateScore(a, club, aiStrategy, { needUrgency: needA?.urgency }) + _getRecruitmentReputationBonus(a, 3, needA);
        const scoreB = AiClubTransferStrategyService.candidateScore(b, club, aiStrategy, { needUrgency: needB?.urgency }) + _getRecruitmentReputationBonus(b, 3, needB);
        return scoreB - scoreA || a.age - b.age;
      });
      const candidate = gulfStarCandidate || freeAgentCandidates[0];

      if (!candidate) return club;

      // Oznacz wolnego agenta jako "w negocjacji" — okno 4 dni dla gracza na kontr-ofertę
      const responseDate = new Date(currentDate);
      responseDate.setDate(responseDate.getDate() + (gulfStarCandidate ? 2 : 4));
      const gulfStarOffer = candidate === gulfStarCandidate
        ? _buildGulfStarOffer(candidate, club, currentDate)
        : null;

      const faList = updatedPlayersMap['FREE_AGENTS'];
      const idx = faList.findIndex(p => p.id === candidate.id);
      if (idx !== -1) {
        updatedPlayersMap['FREE_AGENTS'] = faList.map((p, i) =>
          i === idx
            ? { ...p, aiNegotiationClubId: club.id, aiNegotiationResponseDate: responseDate.toISOString() }
            : p
        );
      }

      if (gulfStarOffer) {
        const previousClub = _getGulfMegaOfferPreviousClub(candidate, clubMap);
        logEntries.push({
          id: `GULF_FA_OFFER_${candidate.id}_${club.id}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${candidate.lastName} ${candidate.firstName}`,
          playerOvr: candidate.overallRating,
          playerPosition: candidate.position,
          fromClub: previousClub?.name || 'Bez klubu',
          toClub: club.name,
          status: 'OFFER_MADE',
          fee: 0,
          playerId: candidate.id,
          fromClubId: previousClub?.id,
          toClubId: club.id,
          isGulfMegaOffer: true,
          salary: gulfStarOffer.proposedSalary,
          bonus: gulfStarOffer.proposedBonus,
          contractYears: gulfStarOffer.contractYears,
        });
      }

      return club;
    });

    return { updatedClubs, updatedPlayers: updatedPlayersMap, newOffers, logEntries };
  },

/**
   * Rozwiązuje zakończone negocjacje AI z wolnymi agentami.
   * Wywoływana codziennie. Gdy aiNegotiationResponseDate <= dziś:
   *   - Ocenia akceptację oferty używając reputacji AI-klubu
   *   - Jeśli TAK: przenosi zawodnika do składu AI-klubu
   *   - Jeśli NIE: czyści pola, ustawia blokadę 90 dni
   */
  resolveAiFreeAgentNegotiations: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]>, logEntries: AiTransferLogEntry[] } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries: AiTransferLogEntry[] = [];

    const freeAgents = updatedPlayersMap['FREE_AGENTS'] || [];
    const today = currentDate.getTime();
    const clubMap = new Map(updatedClubs.map(c => [c.id, c]));

    const due = freeAgents.filter(fa =>
      fa.aiNegotiationClubId &&
      fa.aiNegotiationResponseDate &&
      new Date(fa.aiNegotiationResponseDate).getTime() <= today
    );

    if (due.length === 0) return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };

    for (const fa of due) {
      const aiClub = updatedClubs.find(c => c.id === fa.aiNegotiationClubId);

      if (!aiClub || aiClub.id === userTeamId) {
        // Klub nie istnieje lub to klub gracza — wyczyść flagi
        updatedPlayersMap['FREE_AGENTS'] = (updatedPlayersMap['FREE_AGENTS'] || []).map(p =>
          p.id === fa.id ? { ...p, aiNegotiationClubId: undefined, aiNegotiationResponseDate: undefined } : p
        );
        continue;
      }

      const gulfStarOffer = _isGulfStarHunterClub(aiClub) && _isGulfMegaOfferTarget(fa, clubMap)
        ? _buildGulfStarOffer(fa, aiClub, currentDate)
        : null;
      const proposedSalary = gulfStarOffer?.proposedSalary ?? FinanceLogic.getFairMarketSalary(fa.overallRating);
      const proposedBonus = gulfStarOffer?.proposedBonus ?? Math.floor(proposedSalary * 0.4);
      const newEndDate = gulfStarOffer?.newEndDate ?? new Date(currentDate.getFullYear() + 2, 5, 30).toISOString();

      const gulfOwnerShortfallCover = _getGulfOwnerShortfallCover(aiClub, proposedBonus + proposedSalary);

      if (gulfOwnerShortfallCover > 0) {
        updatedClubs = updatedClubs.map(c =>
          c.id === aiClub.id
            ? { ...c, budget: c.budget + gulfOwnerShortfallCover }
            : c
        );
      }

      if (aiClub.budget + gulfOwnerShortfallCover < proposedBonus + proposedSalary) {
        // Brak środków — wyczyść flagę
        updatedPlayersMap['FREE_AGENTS'] = (updatedPlayersMap['FREE_AGENTS'] || []).map(p =>
          p.id === fa.id ? { ...p, aiNegotiationClubId: undefined, aiNegotiationResponseDate: undefined } : p
        );
        continue;
      }

      const result = FinanceLogic.evaluateContractLogic(fa, proposedSalary, proposedBonus, newEndDate, currentDate, aiClub.reputation, FinanceLogic.getClubTier(aiClub));
      const accepted = gulfStarOffer
        ? Math.random() < GULF_MEGA_OFFER_ACCEPTANCE_CHANCE
        : result.accepted;

      if (accepted) {
        // Przenieś zawodnika do składu AI-klubu
        updatedPlayersMap['FREE_AGENTS'] = (updatedPlayersMap['FREE_AGENTS'] || []).filter(p => p.id !== fa.id);

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const updatedHistory = PlayerCareerService.movePlayer(
          fa,
          { clubName: aiClub.name, clubId: aiClub.id },
          currentYear,
          currentMonth
        );

        const signedPlayer: Player = {
          ...PlayerMoraleService.applyContractSigningMindflowReset(
            PlayerCareerService.resetClubStatsForNewEntry(fa),
            currentDate
          ),
          clubId: aiClub.id,
          annualSalary: proposedSalary,
          contractEndDate: newEndDate,
          aiNegotiationClubId: undefined,
          aiNegotiationResponseDate: undefined,
          isOnTransferList: false,
          history: updatedHistory,
          transferLockoutUntil: _buildTransferLockoutUntil(currentDate),
          retirementLockUntil: gulfStarOffer ? newEndDate : fa.retirementLockUntil
        };

        updatedPlayersMap[aiClub.id] = [...(updatedPlayersMap[aiClub.id] || []), signedPlayer];

        updatedClubs = updatedClubs.map(c =>
          c.id === aiClub.id ? { ...c, budget: c.budget - proposedBonus } : c
        );

        if (gulfStarOffer) {
          const previousClub = _getGulfMegaOfferPreviousClub(fa, clubMap);
          logEntries.push({
            id: `GULF_FA_SIGN_${fa.id}_${aiClub.id}_${currentDate.getTime()}`,
            date: currentDate.toISOString(),
            playerName: `${fa.lastName} ${fa.firstName}`,
            playerOvr: fa.overallRating,
            playerPosition: fa.position,
            fromClub: previousClub?.name || 'Bez klubu',
            toClub: aiClub.name,
            status: 'TRANSFER_SIGNED',
            fee: 0,
            playerId: fa.id,
            fromClubId: previousClub?.id,
            toClubId: aiClub.id,
            isGulfMegaOffer: true,
            salary: proposedSalary,
            bonus: proposedBonus,
            contractYears: gulfStarOffer.contractYears,
          });
        }
      } else {
        // Odrzucenie — blokada 90 dni
        const lockout = new Date(currentDate);
        lockout.setDate(lockout.getDate() + 90);
        updatedPlayersMap['FREE_AGENTS'] = (updatedPlayersMap['FREE_AGENTS'] || []).map(p =>
          p.id === fa.id
            ? {
                ...p,
                aiNegotiationClubId: undefined,
                aiNegotiationResponseDate: undefined,
                freeAgentLockoutUntil: null,
                freeAgentClubLockouts: FreeAgentNegotiationService.buildClubLockouts(
                  p.freeAgentClubLockouts,
                  aiClub.id,
                  lockout.toISOString()
                )
              }
            : p
        );
      }
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },

  /**
   * Przygotowanie finansowania zakupów.
   * Dla klubów z potrzebami kadrowymi ale zbyt niskim budżetem — listuje na sprzedaż
   * najbardziej zbędnego zawodnika, aby wygospodarować środki na wzmocnienie.
   * Wywoływana codziennie (stagger co 7 dni per klub).
   */
  processAiSquadFinancing: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };

    const hashClubFin = (id: string): number => {
      let h = 0;
      for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
      return Math.abs(h);
    };

    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86_400_000
    );

    for (const club of updatedClubs) {
      if (club.id === userTeamId) continue;
      const finStagger = _isTransferWindowOpen(currentDate) ? 5 : 14;
      if ((dayOfYear + hashClubFin(club.id)) % finStagger !== 0) continue;

      const squad = updatedPlayersMap[club.id] || [];
      const positions: PlayerPosition[] = [
        PlayerPosition.GK,
        PlayerPosition.DEF,
        PlayerPosition.MID,
        PlayerPosition.FWD
      ];
      const minCounts = MIN_SQUAD_POSITION_COUNTS;
      const idealOvr = 30 + club.reputation * 4.5;

      const hasNeeds = positions.some(pos => {
        const posSquad = squad.filter(p => p.position === pos);
        if (posSquad.length < minCounts[pos]) return true;
        const weakest = [...posSquad].sort((a, b) => a.overallRating - b.overallRating)[0];
        return weakest && weakest.overallRating < idealOvr - 1;
      });

      if (!hasNeeds) continue;

      // Szacowany minimalny koszt wzmocnienia dla tego poziomu reputacji
      const estimatedMinCost = FinanceLogic.getFairMarketSalary(idealOvr - 8) * 6;
      if (club.budget >= estimatedMinCost * 0.5) continue;

      // Szukaj najbardziej zbędnego zawodnika: pozycja z nadmiarem, najniższy stosunek OVR do pensji
      const expendable = squad
        .filter(p =>
          !p.isUntouchable &&
          !p.isOnTransferList &&
          !p.loan &&
          !p.transferPendingClubId &&
          !_isInLastContractYear(p, currentDate) &&
          squad.filter(s => s.position === p.position).length > minCounts[p.position]
        )
        .sort((a, b) => {
          const scoreA = a.overallRating - (a.annualSalary / 100_000) + _getPlayerReputationScore(a);
          const scoreB = b.overallRating - (b.annualSalary / 100_000) + _getPlayerReputationScore(b);
          return scoreA - scoreB;
        })[0];

      if (!expendable) continue;

      updatedPlayersMap[club.id] = (updatedPlayersMap[club.id] || []).map(p =>
        p.id === expendable.id ? { ...p, isOnTransferList: true } : p
      );
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  /**
   * Szuka okazji transferowych na liście transferowej dla każdego AI-klubu.
   * Wywoływana codziennie — wewnętrzny stagger (hash klubu % 4) sprawia, że
   * każdy klub sprawdza rynek co ~4 dni w inny dzień cyklu.
   *
   * Logika:
   *   - Dynamiczna diagnoza potrzeb kadrowych
   *   - Normalny zakres OVR: [idealOvr-8, idealOvr+10]
   *   - Bargain hunting: [idealOvr+10, idealOvr+20] tylko gdy cena ≤ 35% budżetu
   *   - Pełna symulacja: getNegotiationStance → evaluateSellerDecision → evaluateMove
   *   - Jeśli obie strony akceptują → tag TRSF (transferPendingClubId + transferReportDate +3 dni)
   */
  processAiTransferListSignings: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null,
    coachesMap: Record<string, Coach> = {}
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]>, logEntries: AiTransferLogEntry[] } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries: AiTransferLogEntry[] = [];

    // Poza oknem: negocjacje dozwolone, ale rzadsze — zawodnik przejdzie w kolejnym oknie
    const windowOpen = _isTransferWindowOpen(currentDate);

    const hashClub = (id: string): number => {
      let h = 0;
      for (let i = 0; i < id.length; i++) {
        h = ((h << 5) - h + id.charCodeAt(i)) | 0;
      }
      return Math.abs(h);
    };

    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86_400_000
    );

    // Zbuduj płaską listę zawodników z listy transferowej (bez wolnych agentów i drużyny gracza)
    const transferListed: Player[] = Object.entries(updatedPlayersMap)
      .filter(([clubId]) => clubId !== 'FREE_AGENTS' && clubId !== userTeamId)
      .flatMap(([, squad]) => squad)
      .filter(p =>
        p.isOnTransferList &&
        !p.loan &&
        !p.transferPendingClubId &&
        p.clubId !== userTeamId
      );

    if (transferListed.length === 0) return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };

    // Mutable kopia listy by usuwać zajętych kandydatów w trakcie pętli
    const available = [...transferListed];

    const sellerClubMap = new Map(updatedClubs.map(c => [c.id, c]));

    for (const club of clubs) {
      if (club.id === userTeamId) continue;

      // Stagger: w oknie co 2 dni (pilność), poza oknem co 12 dni (przyszłe okno)
      const stagger = windowOpen ? 2 : 12;
      if ((dayOfYear + hashClub(club.id)) % stagger !== 0) continue;

      // Strategia rekrutacyjna: deterministyczna per klub, różna dla każdego agenta
      // 0=bargain hunter, 1=youth investor, 2=star chaser, 3=pragmatist
      const clubStrategy = hashClub(club.id) % 4;

      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length >= AI_MAX_SQUAD_SIZE && !_hasCriticalDepthShortage(squad)) continue;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);
      if (club.budget <= 250_000) continue;

      const minCounts = MIN_SQUAD_POSITION_COUNTS;
      const idealOvr = 30 + club.reputation * 4.5;
      const needsTL = _assessClubNeeds(club, squad, currentDate, aiStrategy);
      if (needsTL.length === 0) continue;
      const hasCriticalShortageTL = needsTL.some(n => n.urgency === 'CRITICAL' && n.reason === 'SHORTAGE');
      const needsTLMap = new Map(needsTL.map(n => [n.position as string, n]));

      // Oceń kandydatów
      const candidates = available.filter(p => {
        if (p.loan) return false;
        if (p.clubId === club.id) return false;
        if (_hasActiveTransferLockout(p, currentDate)) return false;
        if (_hasActiveTransferOfferBan(p, currentDate)) return false;
        const paidTransferEffectiveDate = windowOpen ? currentDate : _getNextWindowStart(currentDate);
        if (_shouldUsePreContractInsteadOfPaidTransfer(p, currentDate, paidTransferEffectiveDate)) return false;
        const needTL = needsTLMap.get(p.position);
        if (!needTL) return false;

        // OVR range zależy od pilności: CRITICAL szuka szerzej (desperacja), LOW tylko wąski upgrade
        // ovrCap: idealOvr powyżej 95 jest nieosiągalne — klampujemy by top kluby w ogóle widziały kandydatów
        const ovrCap = Math.min(idealOvr, 95);
        const ovrLow = needTL.reason === 'SHORTAGE' ? ovrCap - 30 :
                       needTL.urgency === 'CRITICAL' ? ovrCap - 14 :
                       needTL.urgency === 'HIGH'     ? ovrCap - 11 :
                       needTL.urgency === 'LOW'      ? ovrCap - 4  : ovrCap - 8;
        const ovrHigh = needTL.reason === 'SHORTAGE' ? ovrCap + 12 : needTL.urgency === 'LOW' ? ovrCap + 5 : ovrCap + 10;
        const normalRange = p.overallRating >= ovrLow && p.overallRating <= ovrHigh;
        const bargainRange = p.overallRating > ovrHigh && p.overallRating <= ovrCap + 20;
        if (!normalRange && !bargainRange) return false;

        // Kandydat musi być lepszy od obecnego najsłabszego na tej pozycji (upgrade check)
        const posSquad = (updatedPlayersMap[club.id] || []).filter(sq => sq.position === p.position);
        const weakestExisting = [...posSquad].sort((a, b) => a.overallRating - b.overallRating)[0];
        if (posSquad.length >= minCounts[p.position] && weakestExisting && p.overallRating <= weakestExisting.overallRating) return false;

        const sellerClub = sellerClubMap.get(p.clubId || '');
        if (!sellerClub) return false;
        const marketOpportunity = _getTransferListOpportunity(p, club, sellerClub);

        const sellerSquad = updatedPlayersMap[p.clubId || ''] || [];
        const askingPrice = TransferSellerLogicService.estimateAskingPrice(p, sellerClub, sellerSquad, currentDate);
        const proposedSalary = FinanceLogic.getFairMarketSalary(p.overallRating);

        const budgetCapNormalBase = hasCriticalShortageTL
          ? 0.90
          : Math.min(0.78, (clubStrategy === 2 ? 0.65 : 0.50) + marketOpportunity.budgetBoost);
        const budgetCapBargainBase = Math.min(0.60, (clubStrategy === 2 ? 0.45 : 0.35) + marketOpportunity.budgetBoost);
        const budgetCapNormal = AiClubTransferStrategyService.budgetCap(budgetCapNormalBase, aiStrategy, {
          needUrgency: needTL.urgency,
          isShortage: needTL.reason === 'SHORTAGE',
          askingPrice
        });
        const budgetCapBargain = AiClubTransferStrategyService.budgetCap(budgetCapBargainBase, aiStrategy, {
          needUrgency: needTL.urgency,
          isShortage: needTL.reason === 'SHORTAGE',
          isTransferListed: true,
          askingPrice
        });
        if (bargainRange && askingPrice > club.budget * budgetCapBargain) return false;
        if (normalRange && askingPrice > club.budget * budgetCapNormal) return false;
        if (!hasCriticalShortageTL && clubStrategy === 1 && p.age > 26 && aiStrategy.ageProfile === 'YOUTH') return false;
        if (club.budget < askingPrice + proposedSalary * 0.5) return false;

        return true;
      });

      if (candidates.length === 0) continue;

      // Wybierz kandydata wg strategii agenta rekrutacyjnego
      let sortedCandidates = [...candidates];
      if (clubStrategy === 1) {
        // Youth investor: najmłodszy, potem najwyższy OVR
        sortedCandidates.sort((a, b) => {
          const aSeller = sellerClubMap.get(a.clubId || '');
          const bSeller = sellerClubMap.get(b.clubId || '');
          const aBonus = aSeller ? _getTransferListOpportunity(a, club, aSeller).scoreBonus : 0;
          const bBonus = bSeller ? _getTransferListOpportunity(b, club, bSeller).scoreBonus : 0;
          const aNeed = needsTLMap.get(a.position);
          const bNeed = needsTLMap.get(b.position);
          const aScore = AiClubTransferStrategyService.candidateScore(a, club, aiStrategy, { needUrgency: aNeed?.urgency, isTransferListed: true }) + aBonus + _getRecruitmentReputationBonus(a, clubStrategy, aNeed);
          const bScore = AiClubTransferStrategyService.candidateScore(b, club, aiStrategy, { needUrgency: bNeed?.urgency, isTransferListed: true }) + bBonus + _getRecruitmentReputationBonus(b, clubStrategy, bNeed);
          return a.age - b.age || bScore - aScore;
        });
      } else if (clubStrategy === 0) {
        // Bargain hunter: lista transferowa i wygasające kontrakty najpierw, potem tańszy OVR
        sortedCandidates.sort((a, b) => {
          const aSeller = sellerClubMap.get(a.clubId || '');
          const bSeller = sellerClubMap.get(b.clubId || '');
          const aNeed = needsTLMap.get(a.position);
          const bNeed = needsTLMap.get(b.position);
          const aVal = (a.isOnTransferList ? 20 : 0)
            + (new Date(a.contractEndDate).getTime() - currentDate.getTime() < PRE_CONTRACT_PRIORITY_DAYS * 86_400_000 ? 10 : 0)
            + (aSeller ? _getTransferListOpportunity(a, club, aSeller).scoreBonus : 0)
            + _getRecruitmentReputationBonus(a, clubStrategy, aNeed)
            + AiClubTransferStrategyService.candidateScore(a, club, aiStrategy, { needUrgency: aNeed?.urgency, isTransferListed: true }) * 0.25;
          const bVal = (b.isOnTransferList ? 20 : 0)
            + (new Date(b.contractEndDate).getTime() - currentDate.getTime() < PRE_CONTRACT_PRIORITY_DAYS * 86_400_000 ? 10 : 0)
            + (bSeller ? _getTransferListOpportunity(b, club, bSeller).scoreBonus : 0)
            + _getRecruitmentReputationBonus(b, clubStrategy, bNeed)
            + AiClubTransferStrategyService.candidateScore(b, club, aiStrategy, { needUrgency: bNeed?.urgency, isTransferListed: true }) * 0.25;
          return bVal - aVal || a.overallRating - b.overallRating;
        });
      } else {
        // Star chaser / pragmatist: najwyższy OVR
        sortedCandidates.sort((a, b) => {
          const aSeller = sellerClubMap.get(a.clubId || '');
          const bSeller = sellerClubMap.get(b.clubId || '');
          const aBonus = aSeller ? _getTransferListOpportunity(a, club, aSeller).scoreBonus : 0;
          const bBonus = bSeller ? _getTransferListOpportunity(b, club, bSeller).scoreBonus : 0;
          const aNeed = needsTLMap.get(a.position);
          const bNeed = needsTLMap.get(b.position);
          const aScore = AiClubTransferStrategyService.candidateScore(a, club, aiStrategy, { needUrgency: aNeed?.urgency, isTransferListed: true }) + aBonus + _getRecruitmentReputationBonus(a, clubStrategy, aNeed);
          const bScore = AiClubTransferStrategyService.candidateScore(b, club, aiStrategy, { needUrgency: bNeed?.urgency, isTransferListed: true }) + bBonus + _getRecruitmentReputationBonus(b, clubStrategy, bNeed);
          return bScore - aScore;
        });
      }
      const best = sortedCandidates[0];
      const sellerClub = sellerClubMap.get(best.clubId || '');
      if (!sellerClub) continue;

      const sellerSquad = updatedPlayersMap[best.clubId || ''] || [];
      const askingPrice = TransferSellerLogicService.estimateAskingPrice(best, sellerClub, sellerSquad, currentDate);

      // Sprawdź czy sprzedający dopuszcza rozmowy.
      // Poza oknem negocjujemy z timingiem IN_SIX_MONTHS — daje realistyczną premię cenową
      // i poprawnie klasyfikuje ochronę przed sprzedażą do rywala (blocksShortDelaySale).
      const transferTiming = windowOpen ? TransferTiming.IMMEDIATE : TransferTiming.IN_SIX_MONTHS;
      const sellerCoachTL = sellerClub.coachId ? coachesMap[sellerClub.coachId] : null;
      const sellerFavoritesTL = sellerCoachTL?.favoritePlayerIds;
      const stance = TransferSellerLogicService.getNegotiationStance(
        best, sellerClub, club, sellerSquad, currentDate, transferTiming, undefined, sellerFavoritesTL
      );
      if (!stance.allowTalks) continue;

      // AI płaci pełną cenę wywoławczą
      const bidInput: TransferClubBidInput = { fee: stance.askingPrice, timing: transferTiming };
      const sellerDecision = TransferSellerLogicService.evaluateSellerDecision(
        bidInput, best, sellerClub, club, sellerSquad, currentDate, undefined, sellerFavoritesTL
      );
      if (sellerDecision.verdict !== 'ACCEPT') continue;

      // Sprawdź czy zawodnik chce przejść
      // Bonus zależy od kierunku ruchu reputacyjnego: ruch w dół wymaga wyższego bonusu by zawodnik zaakceptował
      const repDeltaTL = club.reputation - sellerClub.reputation;
      const salaryMultAI_TL = repDeltaTL <= -2 ? 1.40 : repDeltaTL === -1 ? 1.25 : 1.12;
      const proposedSalary = Math.max(FinanceLogic.getFairMarketSalary(best.overallRating), Math.round(best.annualSalary * salaryMultAI_TL));
      const ageBonusMult_TL = best.age < 24 ? 0.40 : best.age <= 29 ? 0.65 : best.age <= 33 ? 1.00 : 1.30;
      const repBonusPremium_TL = repDeltaTL < 0 ? 0.40 : repDeltaTL === 0 ? 0.10 : 0;
      const negRandTL = 0.75 + Math.random() * 0.50;
      const proposedBonus = Math.floor(best.annualSalary * (ageBonusMult_TL + repBonusPremium_TL) * negRandTL);
      const contractYears = best.age <= 27 ? 4 : best.age <= 30 ? 3 : best.age <= 34 ? 2 : 1;
      const contractInput: TransferContractInput = { salary: proposedSalary, bonus: proposedBonus, years: contractYears };

      const playerDecision = TransferPlayerDecisionService.evaluateMove(
        contractInput, best, sellerClub, club, sellerSquad, squad, currentDate
      );
      if (!playerDecision.accepted) {
        logEntries.push({
          id: `TL_REJ_${best.id}_${club.id}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${best.lastName} ${best.firstName}`,
          playerOvr: best.overallRating,
          playerPosition: best.position,
          fromClub: sellerClub.name,
          toClub: club.name,
          status: 'PLAYER_REJECTED',
          reason: playerDecision.reason,
          fee: askingPrice,
          playerId: best.id,
          fromClubId: sellerClub.id,
          toClubId: club.id,
        });
        continue;
      }

      // Obie strony OK → tag TRSF + data meldunku
      // W oknie: za 3 dni. Poza oknem: start kolejnego okna transferowego.
      const reportDate = windowOpen
        ? new Date(currentDate.getTime() + 3 * 86_400_000)
        : _getNextWindowStart(currentDate);

      const sellerClubId = best.clubId || '';
      updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(p =>
        p.id === best.id
          ? { ...p, transferPendingClubId: club.id, transferReportDate: reportDate.toISOString(), transferPendingFee: askingPrice }
          : p
      );

      logEntries.push({
        id: `TL_OFFER_${best.id}_${club.id}_${currentDate.getTime()}`,
        date: currentDate.toISOString(),
        playerName: `${best.lastName} ${best.firstName}`,
        playerOvr: best.overallRating,
        playerPosition: best.position,
        fromClub: sellerClub.name,
        toClub: club.name,
        status: 'OFFER_MADE',
        fee: askingPrice,
        playerId: best.id,
        fromClubId: sellerClub.id,
        toClubId: club.id,
      });

      // Usuń zawodnika z dostępnej listy by inne kluby go nie wybrały w tej samej iteracji
      const idx = available.findIndex(p => p.id === best.id);
      if (idx !== -1) available.splice(idx, 1);

      // Opłata transferowa płatna natychmiast przy podpisaniu umowy
      updatedClubs = updatedClubs.map(c => {
        if (c.id === club.id) return { ...c, budget: c.budget - askingPrice };
        if (c.id === sellerClubId) return { ...c, budget: c.budget + askingPrice };
        return c;
      });
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },

  /**
   * Realizuje zainteresowania transferowe AI — kluby próbują pozyskać zawodników
   * z interestedClubs którzy NIE są na liście transferowej.
   * Uzupełnia processAiTransferListSignings który obsługuje tylko isOnTransferList.
   * Wywoływana codziennie (stagger co 6 dni per klub).
   */
  processAiInterestedPlayerTargeting: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null,
    coachesMap: Record<string, Coach> = {}
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]>, logEntries: AiTransferLogEntry[] } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries: AiTransferLogEntry[] = [];

    // Poza oknem: podejścia dozwolone, ale rzadsze — transfer nastąpi w kolejnym oknie
    const windowOpen = _isTransferWindowOpen(currentDate);

    const hashClubInt = (id: string): number => {
      let h = 0;
      for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
      return Math.abs(h);
    };

    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86_400_000
    );

    const sellerClubMap = new Map(updatedClubs.map(c => [c.id, c]));

    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      // Stagger: w oknie co 3 dni, poza oknem co 15 dni
      const staggerInt = windowOpen ? 3 : 15;
      if ((dayOfYear + hashClubInt(club.id)) % staggerInt !== 0) continue;
      if (club.budget <= 500_000) continue;

      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length >= AI_MAX_SQUAD_SIZE && !_hasCriticalDepthShortage(squad)) continue;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);

      // Jeden aktywny zakup na raz
      const alreadyBuying = Object.values(updatedPlayersMap)
        .flat()
        .some(p => p.transferPendingClubId === club.id);
      if (alreadyBuying) continue;

      const idealOvr = 30 + club.reputation * 4.5;
      const isGulfStarHunter = _isGulfStarHunterClub(club);
      const needsIT = _assessClubNeeds(club, squad, currentDate, aiStrategy);
      if (needsIT.length === 0 && !isGulfStarHunter) continue;
      const hasCriticalShortageIT = needsIT.some(n => n.urgency === 'CRITICAL' && n.reason === 'SHORTAGE');
      const needsITMap = new Map(needsIT.map(n => [n.position as string, n]));

      // Kandydaci: gracze z interestedClubs zawierającym ten klub, niewystawieni na listę
      const targets = Object.entries(updatedPlayersMap)
        .filter(([cId]) => cId !== 'FREE_AGENTS' && cId !== club.id && cId !== userTeamId)
        .flatMap(([, sq]) => sq)
        .filter(p => {
          if (p.loan) return false;
          if (_hasActiveTransferLockout(p, currentDate)) return false;
          if (_hasActiveTransferOfferBan(p, currentDate)) return false;
          if (p.isOnTransferList || p.transferPendingClubId) return false;
          const paidTransferEffectiveDate = windowOpen ? currentDate : _getNextWindowStart(currentDate);
          if (_shouldUsePreContractInsteadOfPaidTransfer(p, currentDate, paidTransferEffectiveDate)) return false;

          const sellerClub = sellerClubMap.get(p.clubId || '');
          const isGulfVeteranStarTarget = !!sellerClub &&
            isGulfStarHunter &&
            _isExpiringBigClubVeteranStar(p, sellerClub, currentDate);
          if (isGulfVeteranStarTarget) return true;

          if (!(p.interestedClubs || []).includes(club.id)) return false;
          if (!needsITMap.has(p.position)) return false;

          const need = needsITMap.get(p.position)!;
          const ovrCap = Math.min(idealOvr, 95);
          const low = need.reason === 'SHORTAGE' ? ovrCap - 30 : need.urgency === 'CRITICAL' ? ovrCap - 14 : ovrCap - 8;
          return p.overallRating >= low && p.overallRating <= ovrCap + 12;
        });

      if (targets.length === 0) continue;

      const target = [...targets].sort((a, b) =>
        (AiClubTransferStrategyService.candidateScore(b, club, aiStrategy, { needUrgency: needsITMap.get(b.position)?.urgency }) + _getRecruitmentReputationBonus(b, 2, needsITMap.get(b.position))) -
        (AiClubTransferStrategyService.candidateScore(a, club, aiStrategy, { needUrgency: needsITMap.get(a.position)?.urgency }) + _getRecruitmentReputationBonus(a, 2, needsITMap.get(a.position)))
      )[0];
      const sellerClub = sellerClubMap.get(target.clubId || '');
      if (!sellerClub) continue;

      const sellerSquad = updatedPlayersMap[target.clubId || ''] || [];
      const askingPrice = TransferSellerLogicService.estimateAskingPrice(target, sellerClub, sellerSquad, currentDate);
      const proposedSalary = FinanceLogic.getFairMarketSalary(target.overallRating);
      const isGulfVeteranStarTarget = isGulfStarHunter &&
        _isExpiringBigClubVeteranStar(target, sellerClub, currentDate);

      if (club.budget < askingPrice + proposedSalary * 0.5) continue;
      // Bogatsze kluby mogą przeznaczyć większy % budżetu na jeden transfer: rep=10→60%, rep=15→67.5%, rep=20→70%
      const budgetCapIT = AiClubTransferStrategyService.budgetCap(
        isGulfVeteranStarTarget ? 0.88 : hasCriticalShortageIT ? 0.90 : Math.min(0.70, 0.45 + club.reputation * 0.015),
        aiStrategy,
        { needUrgency: needsITMap.get(target.position)?.urgency, askingPrice }
      );
      if (askingPrice > club.budget * budgetCapIT) continue;

      // Poza oknem: timing IN_SIX_MONTHS — poprawna premia cenowa i klasyfikacja ochrony rywala.
      const transferTimingInt = windowOpen ? TransferTiming.IMMEDIATE : TransferTiming.IN_SIX_MONTHS;
      const sellerCoachIT = sellerClub.coachId ? coachesMap[sellerClub.coachId] : null;
      const sellerFavoritesIT = sellerCoachIT?.favoritePlayerIds;
      const stance = TransferSellerLogicService.getNegotiationStance(
        target, sellerClub, club, sellerSquad, currentDate, transferTimingInt, undefined, sellerFavoritesIT
      );
      if (!stance.allowTalks) continue;

      const bidInput: TransferClubBidInput = { fee: stance.askingPrice, timing: transferTimingInt };
      const sellerDecision = TransferSellerLogicService.evaluateSellerDecision(
        bidInput, target, sellerClub, club, sellerSquad, currentDate, undefined, sellerFavoritesIT
      );
      if (sellerDecision.verdict !== 'ACCEPT') continue;

      // Bonus zależy od kierunku ruchu reputacyjnego: ruch w dół wymaga wyższego bonusu by zawodnik zaakceptował
      const repDeltaIT = club.reputation - sellerClub.reputation;
      const salaryMultAI_IT = repDeltaIT <= -2 ? 1.40 : repDeltaIT === -1 ? 1.25 : 1.12;
      const gulfVeteranStarOffer = isGulfVeteranStarTarget
        ? _buildGulfStarOffer(target, club, currentDate)
        : null;
      const proposedSalaryIT = gulfVeteranStarOffer?.proposedSalary ?? Math.max(FinanceLogic.getFairMarketSalary(target.overallRating), Math.round(target.annualSalary * salaryMultAI_IT));
      const ageBonusMult_IT = target.age < 24 ? 0.40 : target.age <= 29 ? 0.65 : target.age <= 33 ? 1.00 : 1.30;
      const repBonusPremium_IT = repDeltaIT < 0 ? 0.40 : repDeltaIT === 0 ? 0.10 : 0;
      const negRandIT = 0.75 + Math.random() * 0.50;
      const proposedBonus = gulfVeteranStarOffer?.proposedBonus ?? Math.floor(target.annualSalary * (ageBonusMult_IT + repBonusPremium_IT) * negRandIT);
      const contractYears = gulfVeteranStarOffer?.contractYears ?? (target.age <= 27 ? 4 : target.age <= 30 ? 3 : target.age <= 34 ? 2 : 1);
      const contractInput: TransferContractInput = { salary: proposedSalaryIT, bonus: proposedBonus, years: contractYears };

      const playerDecision = TransferPlayerDecisionService.evaluateMove(
        contractInput, target, sellerClub, club, sellerSquad, squad, currentDate
      );
      const gulfVeteranStarOverrideAccepted = isGulfVeteranStarTarget &&
        Math.random() < GULF_MEGA_OFFER_ACCEPTANCE_CHANCE;
      if (!playerDecision.accepted && !gulfVeteranStarOverrideAccepted) {
        logEntries.push({
          id: `IT_REJ_${target.id}_${club.id}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${target.lastName} ${target.firstName}`,
          playerOvr: target.overallRating,
          playerPosition: target.position,
          fromClub: sellerClub.name,
          toClub: club.name,
          status: 'PLAYER_REJECTED',
          reason: playerDecision.reason,
          fee: askingPrice,
          playerId: target.id,
          fromClubId: sellerClub.id,
          toClubId: club.id,
        });
        continue;
      }

      // W oknie: za 3 dni. Poza oknem: start kolejnego okna transferowego.
      const reportDate = windowOpen
        ? new Date(currentDate.getTime() + 3 * 86_400_000)
        : _getNextWindowStart(currentDate);

      const sellerClubId = target.clubId || '';
      updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(p =>
        p.id === target.id
          ? {
              ...p,
              transferPendingClubId: club.id,
              transferReportDate: reportDate.toISOString(),
              transferPendingFee: askingPrice,
              transferPendingSalary: proposedSalaryIT,
              transferPendingBonus: proposedBonus,
              transferPendingContractYears: contractYears,
              retirementLockUntil: gulfVeteranStarOffer?.newEndDate ?? p.retirementLockUntil,
            }
          : p
      );

      logEntries.push({
        id: `IT_OFFER_${target.id}_${club.id}_${currentDate.getTime()}`,
        date: currentDate.toISOString(),
        playerName: `${target.lastName} ${target.firstName}`,
        playerOvr: target.overallRating,
        playerPosition: target.position,
        fromClub: sellerClub.name,
        toClub: club.name,
        status: 'OFFER_MADE',
        fee: askingPrice,
        playerId: target.id,
        fromClubId: sellerClub.id,
        toClubId: club.id,
        isGulfMegaOffer: isGulfVeteranStarTarget,
        salary: isGulfVeteranStarTarget ? proposedSalaryIT : undefined,
        bonus: isGulfVeteranStarTarget ? proposedBonus : undefined,
        contractYears: isGulfVeteranStarTarget ? contractYears : undefined,
      });

      // Opłata transferowa płatna natychmiast przy podpisaniu umowy
      updatedClubs = updatedClubs.map(c => {
        if (c.id === club.id) return { ...c, budget: c.budget - askingPrice };
        if (c.id === sellerClubId) return { ...c, budget: c.budget + askingPrice };
        return c;
      });
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },

  /**
   * Wykonuje oczekujące transfery AI (tag TRSF) gdy transferReportDate <= dziś.
   * Wywoływana codziennie.
   *
   * Przy wykonaniu:
   *   - Ponowna weryfikacja budżetu kupującego (mógł zmaleć w międzyczasie)
   *   - Przenosi zawodnika ze składu sprzedającego do kupującego
   *   - Rozlicza opłatę transferową między klubami
   *   - Czyści tagi TRSF
   */
  processAiPreContractOpportunities: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedPlayers: Record<string, Player[]>, logEntries: AiTransferLogEntry[] } => {
    const updatedPlayersMap = { ...playersMap };
    const logEntries: AiTransferLogEntry[] = [];
    const todayKey = currentDate.toISOString().slice(0, 10);
    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86_400_000
    );
    const signedPlayerIds = new Set<string>();

    for (const sellerClub of clubs) {
      if (sellerClub.id === userTeamId || sellerClub.id === 'FREE_AGENTS') continue;
      const sellerSquad = updatedPlayersMap[sellerClub.id] || [];
      if (sellerSquad.length === 0) continue;

      for (const player of sellerSquad) {
        if (signedPlayerIds.has(player.id)) continue;
        if (player.loan) continue;
        if (player.transferPendingClubId) continue;
        if (_hasActiveTransferOfferBan(player, currentDate)) continue;

        const daysLeft = Math.floor((new Date(player.contractEndDate).getTime() - currentDate.getTime()) / 86_400_000);
        if (daysLeft <= 0 || daysLeft > PRE_CONTRACT_PRIORITY_DAYS) continue;
        const isEliteWatchlistOpportunity = _isElitePreContractWatchlistPlayer(player, currentDate);

        const candidateBuyers = clubs
          .filter(buyer => buyer.id !== userTeamId && buyer.id !== sellerClub.id && buyer.id !== 'FREE_AGENTS')
          .filter(buyer => {
            const buyerSquad = updatedPlayersMap[buyer.id] || [];
            const buyerStrategy = AiClubTransferStrategyService.buildStrategy(buyer);
            const canMonitorEliteWatchlist = buyer.reputation >= ELITE_PRE_CONTRACT_WATCHLIST_MIN_REPUTATION;
            if (isEliteWatchlistOpportunity && !canMonitorEliteWatchlist) return false;
            if (!isEliteWatchlistOpportunity && buyerSquad.length >= AI_MAX_SQUAD_SIZE && !_hasCriticalDepthShortage(buyerSquad)) return false;
            const stagger = isEliteWatchlistOpportunity ? 3 : 9;
            if ((dayOfYear + _hashString(`${buyer.id}_${player.id}`)) % stagger !== 0) return false;

            const needs = _assessClubNeeds(buyer, buyerSquad, currentDate, buyerStrategy);
            const hasPosNeed = needs.some(need => need.position === player.position);
            const isShortlisted = (player.interestedClubs || []).includes(buyer.id);
            const buyerPositionAverage = _getPositionAverageOverall(buyerSquad, player.position);
            const sportingUpgrade = player.overallRating >= buyerPositionAverage + 1;
            const stepUp = buyer.reputation >= sellerClub.reputation + 1;

            if (isEliteWatchlistOpportunity) return player.overallRating >= buyerPositionAverage - 2;
            return (hasPosNeed || isShortlisted || stepUp) && sportingUpgrade;
          })
          .sort((a, b) => {
            const aShortlisted = (player.interestedClubs || []).includes(a.id) ? 8 : 0;
            const bShortlisted = (player.interestedClubs || []).includes(b.id) ? 8 : 0;
            const aEliteBonus = isEliteWatchlistOpportunity && a.reputation >= ELITE_PRE_CONTRACT_WATCHLIST_MIN_REPUTATION ? 40 : 0;
            const bEliteBonus = isEliteWatchlistOpportunity && b.reputation >= ELITE_PRE_CONTRACT_WATCHLIST_MIN_REPUTATION ? 40 : 0;
            return (b.reputation + bShortlisted + bEliteBonus) - (a.reputation + aShortlisted + aEliteBonus);
          });

        for (const buyerClub of candidateBuyers) {
          const buyerSquad = updatedPlayersMap[buyerClub.id] || [];
          const seedBase = `AI_PRECONTRACT_${todayKey}_${sellerClub.id}_${buyerClub.id}_${player.id}`;
          const isShortlisted = (player.interestedClubs || []).includes(buyerClub.id);
          const repDelta = buyerClub.reputation - sellerClub.reputation;
          const contractMindflow = PlayerContractMindflowService.evaluate({
            player,
            currentClub: sellerClub,
            currentSquad: sellerSquad,
            currentDate,
            interestedClubs: _getInterestedClubs(player, clubs),
            targetClub: buyerClub,
            targetSquad: buyerSquad,
          });

          if (!contractMindflow.externalOfferGate.willListen) continue;
          if (!contractMindflow.externalOfferGate.canSignPreContract) continue;

          let chance = isEliteWatchlistOpportunity
            ? (daysLeft <= 90 ? 0.30 : daysLeft <= 180 ? 0.22 : 0.14)
            : daysLeft <= 90 ? 0.06 : daysLeft <= 180 ? 0.04 : 0.018;
          if (isShortlisted) chance *= 2.4;
          if (repDelta >= 3) chance *= 1.8;
          else if (repDelta >= 1) chance *= 1.35;
          else if (repDelta < 0) chance *= 0.45;
          if (!isEliteWatchlistOpportunity && (player.squadRole === 'KEY_PLAYER' || player.isUntouchable)) chance *= 0.60;
          if (player.isNegotiationPermanentBlocked) chance *= 2.2;
          if (player.isOnTransferList) chance *= 1.35;
          chance *= contractMindflow.externalOfferGate.preContractChanceMultiplier;

          if (_seededRandom(`${seedBase}_ROLL`) >= Math.min(isEliteWatchlistOpportunity ? 0.65 : 0.20, chance)) continue;

          const offer = _buildAiPreContractOffer(player, sellerClub, buyerClub, currentDate, isEliteWatchlistOpportunity);
          if (buyerClub.budget < offer.bonus + offer.salary * offer.years) continue;

          const decision = TransferPlayerDecisionService.evaluateMove(
            { salary: offer.salary, bonus: offer.bonus, years: offer.years },
            player,
            sellerClub,
            buyerClub,
            sellerSquad,
            buyerSquad,
            currentDate
          );
          if (!decision.accepted) continue;

          updatedPlayersMap[sellerClub.id] = (updatedPlayersMap[sellerClub.id] || []).map(p =>
            p.id === player.id
              ? {
                  ...p,
                  transferPendingClubId: buyerClub.id,
                  transferReportDate: _getPreContractJoinDate(player),
                  transferPendingFee: 0,
                  transferPendingSalary: offer.salary,
                  transferPendingBonus: offer.bonus,
                  transferPendingContractYears: offer.years,
                  interestedClubs: [],
                  isOnTransferList: false,
                }
              : p
          );

          signedPlayerIds.add(player.id);
          logEntries.push({
            id: `AI_PRECONTRACT_${player.id}_${buyerClub.id}_${currentDate.getTime()}`,
            date: currentDate.toISOString(),
            playerName: `${player.lastName} ${player.firstName}`,
            playerOvr: player.overallRating,
            playerPosition: player.position,
            fromClub: sellerClub.name,
            toClub: buyerClub.name,
            status: 'OFFER_MADE',
            reason: `Prekontrakt po wygaśnięciu umowy (${new Date(player.contractEndDate).toLocaleDateString('pl-PL')})`,
            fee: 0,
            playerId: player.id,
            fromClubId: sellerClub.id,
            toClubId: buyerClub.id,
            salary: offer.salary,
            bonus: offer.bonus,
            contractYears: offer.years,
          });
          break;
        }
      }
    }

    return { updatedPlayers: updatedPlayersMap, logEntries };
  },

  resolveAiTransferPending: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]>, logEntries: AiTransferLogEntry[] } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };
    const logEntries: AiTransferLogEntry[] = [];
    const today = currentDate.getTime();

    // Okno transferowe zamknięte — zawodnicy z tagiem TRSF czekają, nie są przenoszeni
    const windowOpen = _isTransferWindowOpen(currentDate);

    for (const sellerClubId of Object.keys(updatedPlayersMap)) {
      if (sellerClubId === 'FREE_AGENTS') continue;

      const squad = updatedPlayersMap[sellerClubId] || [];
      const due = squad.filter(p =>
        p.transferPendingClubId &&
        p.transferReportDate &&
        (windowOpen || (p.transferPendingFee ?? 0) === 0) &&
        new Date(p.transferReportDate).getTime() <= today
      );

      for (const player of due) {
        const buyerClubId = player.transferPendingClubId!;
        const buyerClub = updatedClubs.find(c => c.id === buyerClubId);
        const sellerClub = updatedClubs.find(c => c.id === sellerClubId);

        if (!buyerClub || !sellerClub) {
          updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(p =>
            p.id === player.id ? { ...p, transferPendingClubId: undefined, transferReportDate: undefined } : p
          );
          continue;
        }

        // Spójna z logiką negocjacji: bonus zależy od kierunku ruchu reputacyjnego
        const repDeltaRes = buyerClub.reputation - sellerClub.reputation;
        const salaryMultAI_Res = repDeltaRes <= -2 ? 1.40 : repDeltaRes === -1 ? 1.25 : 1.12;
        const proposedSalary = player.transferPendingSalary ?? Math.max(FinanceLogic.getFairMarketSalary(player.overallRating), Math.round(player.annualSalary * salaryMultAI_Res));
        const ageBonusMult_Res = player.age < 24 ? 0.40 : player.age <= 29 ? 0.65 : player.age <= 33 ? 1.00 : 1.30;
        const repBonusPremium_Res = repDeltaRes < 0 ? 0.40 : repDeltaRes === 0 ? 0.10 : 0;
        const proposedBonus = player.transferPendingBonus ?? Math.floor(player.annualSalary * (ageBonusMult_Res + repBonusPremium_Res));

        // Opłata transferowa została już pobrana przy podpisaniu umowy (processAiTransferListSignings / processAiInterestedPlayerTargeting)
        // Weryfikacja: czy kupujący ma środki na bonus dla zawodnika przy meldunku
        const gulfOwnerShortfallCover = _getGulfOwnerShortfallCover(buyerClub, proposedBonus);

        if (gulfOwnerShortfallCover > 0) {
          updatedClubs = updatedClubs.map(c =>
            c.id === buyerClubId
              ? { ...c, budget: c.budget + gulfOwnerShortfallCover }
              : c
          );
        }

        if (buyerClub.budget + gulfOwnerShortfallCover < proposedBonus) {
          // Zwrot opłaty transferowej — kupujący zapłacił przy negocjacji, ale transfer odpada.
          // Bez zwrotu klub traci pieniądze i nie dostaje zawodnika.
          const refundFee = player.transferPendingFee ?? TransferSellerLogicService.estimateAskingPrice(player, sellerClub, updatedPlayersMap[sellerClubId] || [], currentDate);
          updatedClubs = updatedClubs.map(c => {
            if (c.id === buyerClubId) return { ...c, budget: c.budget + refundFee };
            if (c.id === sellerClubId) return { ...c, budget: c.budget - refundFee };
            return c;
          });
          updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).map(p =>
            p.id === player.id ? { ...p, transferPendingClubId: undefined, transferReportDate: undefined } : p
          );
          logEntries.push({
            id: `RES_NOBUDGET_${player.id}_${buyerClubId}_${currentDate.getTime()}`,
            date: currentDate.toISOString(),
            playerName: `${player.lastName} ${player.firstName}`,
            playerOvr: player.overallRating,
            playerPosition: player.position,
            fromClub: sellerClub.name,
            toClub: buyerClub.name,
            status: 'CANCELLED_NO_BUDGET',
            reason: `Brak środków na bonus ( ${proposedBonus.toLocaleString('pl-PL')} PLN)`,
            fee: refundFee,
            playerId: player.id,
            fromClubId: sellerClub.id,
            toClubId: buyerClub.id,
          });
          continue;
        }

        const contractYears = player.transferPendingContractYears ?? (player.age <= 27 ? 4 : player.age <= 30 ? 3 : player.age <= 34 ? 2 : 1);
        const newEndDate = new Date(currentDate.getFullYear() + contractYears, 5, 30).toISOString();

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const playerForHistory = (!player.history || player.history.length === 0)
          ? { ...player, history: [{ clubName: sellerClub.name, clubId: sellerClubId, fromYear: currentYear - 1, fromMonth: 7, toYear: null as null, toMonth: null as null }] }
          : player;
        const updatedHistory = PlayerCareerService.movePlayer(
          playerForHistory,
          { clubName: buyerClub.name, clubId: buyerClubId },
          currentYear,
          currentMonth,
          { clubName: sellerClub.name, clubId: sellerClubId },
          player.transferPendingFee
        );

        const transferredPlayerBase: Player = {
          ...PlayerMoraleService.applyContractSigningMindflowReset(
            PlayerCareerService.resetClubStatsForNewEntry(player),
            currentDate
          ),
          clubId: buyerClubId,
          annualSalary: proposedSalary,
          contractEndDate: newEndDate,
          transferPendingClubId: undefined,
          transferReportDate: undefined,
          transferPendingFee: undefined,
          transferPendingSalary: undefined,
          transferPendingBonus: undefined,
          transferPendingContractYears: undefined,
          isOnTransferList: false,
          interestedClubs: (player.interestedClubs || []).filter(clubId => clubId !== buyerClubId),
          history: updatedHistory,
          transferLockoutUntil: _buildTransferLockoutUntil(currentDate),
          transferOfferBanUntil: _buildTransferOfferBanUntil(currentDate)
        };
        const transferredPlayer = PlayerReputationGrowthService.applyTransferUpgrade(
          transferredPlayerBase,
          sellerClub.reputation,
          buyerClub.reputation
        );

        // Przenieś zawodnika
        updatedPlayersMap[sellerClubId] = (updatedPlayersMap[sellerClubId] || []).filter(p => p.id !== player.id);
        updatedPlayersMap[buyerClubId] = [...(updatedPlayersMap[buyerClubId] || []), transferredPlayer];

        logEntries.push({
          id: `RES_SIGNED_${player.id}_${buyerClubId}_${currentDate.getTime()}`,
          date: currentDate.toISOString(),
          playerName: `${player.lastName} ${player.firstName}`,
          playerOvr: player.overallRating,
          playerPosition: player.position,
          fromClub: sellerClub.name,
          toClub: buyerClub.name,
          status: 'TRANSFER_SIGNED',
          fee: player.transferPendingFee,
          playerId: player.id,
          fromClubId: sellerClub.id,
          toClubId: buyerClub.id,
          isGulfMegaOffer: !!player.retirementLockUntil && _isGulfStarHunterClub(buyerClub),
          salary: player.retirementLockUntil ? proposedSalary : undefined,
          bonus: player.retirementLockUntil ? proposedBonus : undefined,
          contractYears: player.retirementLockUntil ? contractYears : undefined,
        });

        // Tylko bonus dla zawodnika przy meldunku — opłata transferowa zapłacona już przy podpisaniu
        updatedClubs = updatedClubs.map(c => {
          if (c.id === buyerClubId) return { ...c, budget: c.budget - proposedBonus };
          return c;
        });
      }
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap, logEntries };
  },

/**
   * Miesięczny przegląd wydajności zawodników AI-klubów.
   * Wywoływany 1. dnia każdego miesiąca.
   *
   * Zawodnik trafia na listę transferową jeśli spełni JEDNO z kryteriów:
   *   A) Wydajnościowe — słabe statystyki sezonowe (min. 6 meczów):
   *      - FWD: goals/gp < 0.08
   *      - MID: (goals+assists)/gp < 0.07
   *      - DEF/GK: średnia ratingHistory (ostatnie 5) < 5.5
   *   B) Brak gry — mniej niż 35% oczekiwanych meczów i nie kontuzjowany
   *
   * Zabezpieczenia (anty-chaos):
   *   - isUntouchable → nigdy nie wystawiony
   *   - Minimalna głębokość składu: GK≥2, DEF≥4, MID≥4, FWD≥2
   *   - Losowość 30–50% per zawodnik per miesiąc (seed deterministyczny)
   *   - Max 2 zawodników wystawionych per klub per miesiąc
   */
  processMonthlyPlayerReview: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedPlayers: Record<string, Player[]> } => {
    const updatedPlayersMap = { ...playersMap };

    // Miesiące od startu sezonu (sezon startuje lipiec = miesiąc 6)
    const currentMonth = currentDate.getMonth();
    const monthsIntoSeason = currentMonth >= 6
      ? currentMonth - 6
      : currentMonth + 6; // styczeń–czerwiec = 6–11 miesięcy

    // Za mało danych — nie oceniamy przez pierwsze 2 miesiące sezonu
    if (monthsIntoSeason < 2) return { updatedPlayers: updatedPlayersMap };

    // Oczekiwana liczba meczów ligowych na ten moment sezonu (~2 mecze/miesiąc)
    const expectedMatches = monthsIntoSeason * 2;

    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      const squad = updatedPlayersMap[club.id];
      if (!squad || squad.length === 0) continue;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);

      // Liczniki głębokości składu (ochrona minimalna)
      const counts = {
        GK:  squad.filter(p => p.position === 'GK').length,
        DEF: squad.filter(p => p.position === 'DEF').length,
        MID: squad.filter(p => p.position === 'MID').length,
        FWD: squad.filter(p => p.position === 'FWD').length,
      };
      const minCounts = MIN_SQUAD_POSITION_COUNTS;

      let listedThisMonth = 0;
      const updatedSquad = squad.map(player => {
        // Nie listujemy więcej niż 2 w miesiącu
        if (listedThisMonth >= 2) return player;
        if (player.loan) return player;

        // Pomijamy zawodników już na liście, nietykalnych lub z uzgodnionym transferem
        if (player.isOnTransferList || player.isUntouchable || !!player.transferPendingClubId) return player;

        // Minimalna głębokość — jeśli wystawienie zejdzie poniżej minimum, pomijamy
        const posKey = player.position as keyof typeof counts;
        if (counts[posKey] <= minCounts[posKey]) return player;

        const gp = player.stats.matchesPlayed;

        // Kryterium B: brak gry (nie licząc kontuzjowanych)
        const playRatio = gp / Math.max(1, expectedMatches);
        const isRarelyPlaying = playRatio < 0.35 && player.health.status !== 'INJURED';

        // Kryterium A: słaba wydajność (min. 6 meczów)
        let isPoorPerformer = false;
        if (gp >= 6) {
          if (player.position === 'FWD') {
            isPoorPerformer = (player.stats.goals / gp) < 0.08;
          } else if (player.position === 'MID') {
            isPoorPerformer = ((player.stats.goals + player.stats.assists) / gp) < 0.07;
          } else {
            // DEF / GK — średnia ratingHistory
            const hist = player.stats.ratingHistory || [];
            if (hist.length >= 5) {
              const avgRating = hist.slice(-5).reduce((s, r) => s + r, 0) / 5;
              isPoorPerformer = avgRating < 5.5;
            }
          }
        }

        if (!isRarelyPlaying && !isPoorPerformer) return player;

        // Losowość 30–50% — nie wszystkie kluby reagują w tym samym miesiącu
        const monthKey = currentDate.getFullYear() * 100 + (currentDate.getMonth() + 1);
        const seed = Math.abs(
          (monthKey * 31337) ^
          player.id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) ^
          club.id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
        );
        const rand = (Math.sin(seed) * 10000);
        const chance = rand - Math.floor(rand);
        const reputationPatience = _getPlayerReputationScore(player) * 0.03;
        const strategyPatience = (aiStrategy.patience - 0.5) * 0.18;
        const strategyAggression = (aiStrategy.budgetAggression - 1) * 0.16;
        const listingChance = _clamp(0.30 + (club.reputation / 100) * 0.20 - reputationPatience - strategyPatience + strategyAggression, 0.08, 0.62);
        if (chance > listingChance) return player;
        if (_isInLastContractYear(player, currentDate)) return player;

        // Wystawiamy na listę transferową
        counts[posKey]--;
        listedThisMonth++;
        return { ...player, isOnTransferList: true };
      });

      updatedPlayersMap[club.id] = updatedSquad;
    }

    return { updatedPlayers: updatedPlayersMap };
  },

performSeasonSquadReview: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };

    updatedClubs = updatedClubs.map(club => {
      if (club.id === userTeamId) return club;

      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length === 0) return club;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);

      const counts = {
        GK: squad.filter(p => p.position === 'GK').length,
        DEF: squad.filter(p => p.position === 'DEF').length,
        MID: squad.filter(p => p.position === 'MID').length,
        FWD: squad.filter(p => p.position === 'FWD').length
      };

      const rankedSquad = [...squad].sort((a, b) => {
        const scoreA = _getSquadReviewScore(a) - AiClubTransferStrategyService.outgoingScore(a, club, aiStrategy) * 0.25;
        const scoreB = _getSquadReviewScore(b) - AiClubTransferStrategyService.outgoingScore(b, club, aiStrategy) * 0.25;
        return scoreA - scoreB;
      });

      const numToRemove = Math.floor(Math.random() * 5);
      let removedCount = 0;
      let finalSquad = [...squad];
      let currentClub = { ...club };

      for (const candidate of rankedSquad) {
        if (removedCount >= numToRemove) break;
        if (candidate.loan || candidate.isUntouchable || candidate.squadRole === 'KEY_PLAYER' || candidate.transferPendingClubId) continue;

        let canRemove = false;
        if (candidate.position === 'GK' && counts.GK > MIN_SQUAD_POSITION_COUNTS[PlayerPosition.GK]) canRemove = true;
        else if (candidate.position === 'DEF' && counts.DEF > MIN_SQUAD_POSITION_COUNTS[PlayerPosition.DEF]) canRemove = true;
        else if (candidate.position === 'MID' && counts.MID > MIN_SQUAD_POSITION_COUNTS[PlayerPosition.MID]) canRemove = true;
        else if (candidate.position === 'FWD' && counts.FWD > MIN_SQUAD_POSITION_COUNTS[PlayerPosition.FWD]) canRemove = true;

        if (canRemove) {
          const decision = FinanceLogic.evaluateReleaseVsList(candidate);
          let actionTaken = false;
          
          if (decision === 'RELEASE' && _canAiReleasePlayer(candidate, club, currentDate, 'SEASON_SQUAD_REVIEW')) {
            const cost = candidate.annualSalary * 0.4;
            if (currentClub.budget >= cost) {
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth() + 1;
              const updatedHistory = PlayerCareerService.movePlayer(
                candidate,
                { clubName: 'BEZ KLUBU', clubId: 'FREE_AGENTS' },
                currentYear,
                currentMonth,
                { clubName: club.name, clubId: club.id }
              );

              const releasedPlayer: Player = {
                ...PlayerCareerService.resetClubStatsForNewEntry(candidate),
                clubId: 'FREE_AGENTS',
                annualSalary: 0,
                contractEndDate: '',
                marketValue: 0,
                negotiationStep: 0,
                isNegotiationPermanentBlocked: false,
                isOnTransferList: false,
                interestedClubs: [],
                transferPendingClubId: undefined,
                transferReportDate: undefined,
                history: updatedHistory
              };

              currentClub.budget -= cost;
              finalSquad = finalSquad.filter(p => p.id !== candidate.id);
              updatedPlayersMap['FREE_AGENTS'] = [...(updatedPlayersMap['FREE_AGENTS'] || []), releasedPlayer];
              actionTaken = true;
            }
          } else if (!_isInLastContractYear(candidate, currentDate)) {
            finalSquad = finalSquad.map(p => p.id === candidate.id ? { ...p, isOnTransferList: true } : p);
            actionTaken = true;
          }

          if (actionTaken) {
            counts[candidate.position as keyof typeof counts]--;
            removedCount++;
          }
        }
      }

      currentClub.squadNeeds = {
        GK: Math.max(0, MIN_SQUAD_POSITION_COUNTS[PlayerPosition.GK] - counts.GK),
        DEF: Math.max(0, MIN_SQUAD_POSITION_COUNTS[PlayerPosition.DEF] - counts.DEF),
        MID: Math.max(0, MIN_SQUAD_POSITION_COUNTS[PlayerPosition.MID] - counts.MID),
        FWD: Math.max(0, MIN_SQUAD_POSITION_COUNTS[PlayerPosition.FWD] - counts.FWD)
      };

      updatedPlayersMap[club.id] = finalSquad;
      return currentClub;
    });

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  /**
   * Przegląd 3 najsłabszych zawodników każdego AI-klubu.
   * Wywoływana 2 lipca (start sezonu) i 12 stycznia (przerwa zimowa).
   *
   * Algorytm:
   *   1. Znajdź 3 najsłabszych (ranking: OVR - (wiek-18)*1.5)
   *   2. Zaproponuj niższy/krótszy kontrakt (75-85% pensji, 1 rok)
   *   3. Jeśli zawodnik odmówi → 50/50: zwolnienie LUB lista transferowa
   *   4. Przy zwolnieniu sprawdź: czy budżet >= 40% pensji i czy skład ma zapas na pozycji
   *   5. Jeśli za drogo lub za mało zawodników na pozycji → lista zamiast zwolnienia
   */
  processWeakPlayerContractCuts: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    currentDate: Date,
    userTeamId: string | null
  ): { updatedClubs: Club[], updatedPlayers: Record<string, Player[]> } => {
    let updatedClubs = [...clubs];
    let updatedPlayersMap = { ...playersMap };

    const minDepth = MIN_SQUAD_POSITION_COUNTS;

    for (const club of clubs) {
      if (club.id === userTeamId) continue;

      const squad = updatedPlayersMap[club.id] || [];
      if (squad.length < 12) continue;
      const aiStrategy = AiClubTransferStrategyService.buildStrategy(club);

      const eligible = squad.filter(p =>
        !p.isOnTransferList &&
        !p.isUntouchable &&
        !p.loan &&
        p.squadRole !== 'KEY_PLAYER' &&
        !p.transferPendingClubId &&
        !p.isNegotiationPermanentBlocked
      );
      if (eligible.length === 0) continue;

      const ranked = [...eligible].sort((a, b) => {
        const scoreA = _getSquadReviewScore(a) - AiClubTransferStrategyService.outgoingScore(a, club, aiStrategy) * 0.25;
        const scoreB = _getSquadReviewScore(b) - AiClubTransferStrategyService.outgoingScore(b, club, aiStrategy) * 0.25;
        return scoreA - scoreB;
      });

      const weakPlayers = ranked.slice(0, 3);
      let finalSquad = [...squad];
      let currentClubCopy = { ...updatedClubs.find(c => c.id === club.id)! };

      for (const player of weakPlayers) {
        const salaryReduction = 0.15 + Math.random() * 0.10;
        const proposedSalary = Math.max(50_000, Math.floor(player.annualSalary * (1 - salaryReduction)));

        const acceptChance = player.age >= 32 ? 0.40 : player.age >= 29 ? 0.25 : 0.15;
        const accepted = Math.random() < acceptChance;

        if (accepted) {
          const newEndDate = new Date(currentDate);
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          newEndDate.setMonth(5);
          newEndDate.setDate(30);
          finalSquad = finalSquad.map(p =>
            p.id === player.id
              ? {
                  ...PlayerMoraleService.applyContractSigningMindflowReset(p, currentDate),
                  annualSalary: proposedSalary,
                  contractEndDate: newEndDate.toISOString()
                }
              : p
          );
        } else {
          if (Math.random() < 0.5 && _canAiReleasePlayer(player, club, currentDate, 'WEAK_CONTRACT_CUT')) {
            const releaseCost = Math.floor(player.annualSalary * 0.4);
            const posCountAfter = finalSquad.filter(p => p.position === player.position && p.id !== player.id).length;
            const canRelease = currentClubCopy.budget >= releaseCost && posCountAfter >= (minDepth[player.position] || 3);

            if (canRelease) {
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth() + 1;
              const updatedHistory = PlayerCareerService.movePlayer(
                player,
                { clubName: 'BEZ KLUBU', clubId: 'FREE_AGENTS' },
                currentYear,
                currentMonth,
                { clubName: club.name, clubId: club.id }
              );
              const releasedPlayer: Player = {
                ...PlayerCareerService.resetClubStatsForNewEntry(player),
                clubId: 'FREE_AGENTS',
                annualSalary: 0,
                contractEndDate: '',
                marketValue: 0,
                negotiationStep: 0,
                isNegotiationPermanentBlocked: false,
                isOnTransferList: false,
                interestedClubs: [],
                transferPendingClubId: undefined,
                transferReportDate: undefined,
                history: updatedHistory
              };
              finalSquad = finalSquad.filter(p => p.id !== player.id);
              updatedPlayersMap['FREE_AGENTS'] = [...(updatedPlayersMap['FREE_AGENTS'] || []), releasedPlayer];
              currentClubCopy.budget -= releaseCost;
            } else if (!_isInLastContractYear(player, currentDate)) {
              finalSquad = finalSquad.map(p =>
                p.id === player.id ? { ...p, isOnTransferList: true } : p
              );
            }
          } else if (!_isInLastContractYear(player, currentDate)) {
            finalSquad = finalSquad.map(p =>
              p.id === player.id ? { ...p, isOnTransferList: true } : p
            );
          }
        }
        updatedPlayersMap[club.id] = finalSquad;
      }

      updatedClubs = updatedClubs.map(c => c.id === club.id ? currentClubCopy : c);
    }

    return { updatedClubs, updatedPlayers: updatedPlayersMap };
  },

  updateClubStars: (
    clubs: Club[],
    playersMap: Record<string, Player[]>,
    userTeamId: string | null,
    coachesMap: Record<string, Coach> = {},
    currentDate: Date = new Date(),
    sessionSeed: number = 0
  ): Record<string, Player[]> => {
    const updatedPlayersMap = { ...playersMap };

    for (const club of clubs) {
      if (club.id === userTeamId) continue;
      const squad = updatedPlayersMap[club.id];
      if (!squad || squad.length === 0) continue;

      const coach = club.coachId ? (coachesMap[club.coachId] || null) : null;
      const starIds = new Set(_selectCorePlayerIds(club, squad, coach, currentDate, sessionSeed));

      updatedPlayersMap[club.id] = squad.map(p => ({
        ...p,
        isUntouchable: starIds.has(p.id),
        isOnTransferList: starIds.has(p.id) ? false : p.isOnTransferList,
        transferListPrice: starIds.has(p.id) ? undefined : p.transferListPrice
      }));
    }

    return updatedPlayersMap;
  }

};
