import {
  Club,
  Player,
  PlayerAttributes,
  PlayerPosition,
  Region,
  TransferLikelihood,
  TransferLikelihoodFilter,
  TransferScout,
  TransferScoutContract,
  TransferScoutContractOffer,
  TransferScoutHiringResult,
  TransferScoutReputation,
  TransferScoutingAssignment,
  TransferScoutingCandidateReport,
  TransferScoutingFilters,
  TransferScoutingReport,
} from '../types';
import { NameGeneratorService } from './NameGeneratorService';
import { TransferPlayerDecisionService } from './TransferPlayerDecisionService';

const MAX_TRANSFER_SCOUTS = 3;
const SCOUT_POOL_SIZE = 48;
const POSITIONS = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];
const EUROPEAN_SCOUT_REGIONS = [
  Region.BALKANS,
  Region.CZ_SK,
  Region.IBERIA,
  Region.GERMANY,
  Region.FRANCE,
  Region.EX_USSR,
  Region.ROMANIA,
  Region.SCANDINAVIA,
  Region.ENGLAND,
  Region.ITALY,
  Region.BENELUX,
  Region.HUNGARIAN,
  Region.BALTIC,
];
const OTHER_SCOUT_REGIONS = [
  Region.SSA,
  Region.BRAZIL,
  Region.ARGENTINA,
  Region.NORTH_AMERICA,
  Region.ARABIA,
  Region.JAPAN,
  Region.KOREA,
  Region.OCEANIA,
];

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const stableUnit = (key: string): number => hashString(key) / 0xffffffff;

const matchesContractStatus = (
  player: Player,
  status: TransferScoutingFilters['contractStatus'],
  referenceDate: Date,
): boolean => {
  if (status === 'FREE_AGENT') return player.clubId === 'FREE_AGENTS';
  if (player.clubId === 'FREE_AGENTS') return false;

  const contractEnd = player.contractEndDate ? new Date(player.contractEndDate) : null;
  const oneYearFromReference = new Date(referenceDate);
  oneYearFromReference.setFullYear(oneYearFromReference.getFullYear() + 1);
  const contractEndTime = contractEnd?.getTime();
  const hasValidDate = contractEndTime !== undefined && Number.isFinite(contractEndTime);
  const expiresWithinYear = hasValidDate
    && contractEndTime >= referenceDate.getTime()
    && contractEndTime <= oneYearFromReference.getTime();

  return status === 'EXPIRING'
    ? expiresWithinYear
    : !hasValidDate || contractEndTime! > oneYearFromReference.getTime();
};

const toLikelihood = (probability: number): TransferLikelihood => {
  if (probability >= 90) return 'CERTAIN';
  if (probability >= 50) return 'LIKELY';
  if (probability >= 25) return 'MEDIUM';
  return 'LOW';
};

const getScoutQuality = (scout: TransferScout): number =>
  (scout.judgment + scout.reach + scout.speed + scout.experience) / 4;

const getReputation = (seed: number, index: number): TransferScoutReputation => {
  const roll = stableUnit(`${seed}|${index}|reputation`);
  if (roll < 0.30) return 1;
  if (roll < 0.58) return 2;
  if (roll < 0.80) return 3;
  if (roll < 0.94) return 4;
  return 5;
};

const getExpectedWeeklySalary = (reputation: TransferScoutReputation, seedKey: string): number => {
  const ranges: Record<TransferScoutReputation, [number, number]> = {
    1: [700, 1_200],
    2: [1_200, 1_900],
    3: [1_900, 3_000],
    4: [3_000, 4_500],
    5: [4_500, 6_500],
  };
  const [min, max] = ranges[reputation];
  return Math.max(500, Math.round((min + stableUnit(seedKey) * (max - min)) / 500) * 500);
};

const getRegionCategories = (seed: number): ('POLAND' | 'EUROPE' | 'OTHER')[] => {
  const categories: ('POLAND' | 'EUROPE' | 'OTHER')[] = [
    ...Array.from({ length: 36 }, () => 'POLAND' as const),
    ...Array.from({ length: 11 }, () => 'EUROPE' as const),
    'OTHER',
  ];
  return categories
    .map((category, index) => ({ category, order: stableUnit(`${seed}|nationality-order|${index}`) }))
    .sort((left, right) => left.order - right.order)
    .map(entry => entry.category);
};

const matchesFilters = (player: Player, filters: TransferScoutingFilters, referenceDate: Date): boolean => {
  if (filters.position && player.position !== filters.position && player.secondaryPosition !== filters.position) return false;
  if (filters.region && player.nationality !== filters.region) return false;
  if (filters.nationalityCountry) {
    const expected = filters.nationalityCountry.trim().toLocaleLowerCase('pl');
    const actual = (player.nationalityCountry ?? '').trim().toLocaleLowerCase('pl');
    if (!actual.includes(expected)) return false;
  }
  if (player.age < filters.ageMin || player.age > filters.ageMax) return false;
  if (!matchesContractStatus(player, filters.contractStatus ?? 'VALID', referenceDate)) return false;

  return (Object.entries(filters.attributes) as [keyof PlayerAttributes, { min: number; max: number }][]) .every(
    ([attribute, range]) => {
      const value = player.attributes[attribute];
      return value >= range.min && value <= range.max;
    }
  );
};

export const TransferScoutingService = {
  getMaxScouts(): number {
    return MAX_TRANSFER_SCOUTS;
  },

  generateScoutPool(seed: number): TransferScout[] {
    const nationalityCategories = getRegionCategories(seed);
    return Array.from({ length: SCOUT_POOL_SIZE }, (_, index) => {
      const category = nationalityCategories[index];
      const availableRegions = category === 'EUROPE' ? EUROPEAN_SCOUT_REGIONS : OTHER_SCOUT_REGIONS;
      const region = category === 'POLAND'
        ? Region.POLAND
        : availableRegions[Math.floor(stableUnit(`${seed}|${index}|region`) * availableRegions.length)];
      const name = NameGeneratorService.getRandomName(region);
      const archetype = Math.floor(stableUnit(`${seed}|${index}|archetype`) * 4);
      const stat = (key: string, min: number, max: number) =>
        min + Math.floor(stableUnit(`${seed}|${index}|${key}`) * (max - min + 1));
      const [judgment, reach, speed, experience] = archetype === 0
        ? [stat('judgment', 15, 20), stat('reach', 8, 15), stat('speed', 7, 14), stat('experience', 10, 18)]
        : archetype === 1
          ? [stat('judgment', 9, 16), stat('reach', 15, 20), stat('speed', 10, 18), stat('experience', 6, 14)]
          : archetype === 2
            ? [stat('judgment', 8, 15), stat('reach', 9, 16), stat('speed', 16, 20), stat('experience', 6, 13)]
            : [stat('judgment', 12, 18), stat('reach', 7, 14), stat('speed', 6, 13), stat('experience', 16, 20)];
      const average = (judgment + reach + speed + experience) / 4;
      const reputation = getReputation(seed, index);

      return {
        id: `TRANSFER_SCOUT_${seed}_${index}`,
        firstName: name.firstName,
        lastName: name.lastName,
        age: 28 + Math.floor(stableUnit(`${seed}|${index}|age`) * 35),
        nationality: region,
        judgment,
        reach,
        speed,
        experience,
        reputation,
        regionalSpecialty: stableUnit(`${seed}|${index}|regional`) < 0.72 ? region : undefined,
        positionSpecialty: stableUnit(`${seed}|${index}|position-specialty`) < 0.55
          ? POSITIONS[Math.floor(stableUnit(`${seed}|${index}|position`) * POSITIONS.length)]
          : undefined,
        weeklySalary: getExpectedWeeklySalary(reputation, `${seed}|${index}|salary|${average}`),
        contract: undefined,
        employedByClubId: undefined,
        isOnAssignment: false,
      };
    });
  },

  normalizeScoutPool(scouts: TransferScout[], seed: number, referenceDate: Date = new Date()): TransferScout[] {
    const generated = TransferScoutingService.generateScoutPool(seed);
    const normalized = scouts.map((scout, index) => {
      const quality = getScoutQuality(scout);
      const reputation = scout.reputation ?? clamp(Math.round((quality - 6) / 3), 1, 5) as TransferScoutReputation;
      const weeklySalary = scout.weeklySalary > 10_000
        ? getExpectedWeeklySalary(reputation, `${seed}|legacy|${scout.id}|salary`)
        : scout.weeklySalary;
      const normalizedScout = { ...scout, reputation, weeklySalary };
      const contract = normalizedScout.employedByClubId && !normalizedScout.contract
        ? TransferScoutingService.buildScoutContract(
            normalizedScout,
            { durationYears: 1, weeklySalary },
            referenceDate,
          )
        : normalizedScout.contract;
      return { ...normalizedScout, contract };
    });
    const retained = normalized.filter(scout => !!scout.employedByClubId || scout.isOnAssignment);
    const existingIds = new Set(retained.map(scout => scout.id));
    const additions = generated.filter(scout => !existingIds.has(scout.id));
    return [...retained, ...additions].slice(0, Math.max(SCOUT_POOL_SIZE, retained.length));
  },

  getContractAcceptanceChance(
    scout: TransferScout,
    club: Club,
    offer: TransferScoutContractOffer,
    demandedWeeklySalary: number = scout.weeklySalary,
  ): number {
    const expectedSalary = Math.max(1, demandedWeeklySalary);
    const salaryRatio = offer.weeklySalary / expectedSalary;
    const requiredClubReputation = clamp(scout.reputation * 3 - 1, 1, 16);
    const clubFit = (club.reputation - requiredClubReputation) * 5;
    const salaryFit = (salaryRatio - 1) * 85;
    const durationFit = offer.durationYears >= 2 ? 6 : scout.reputation >= 4 ? -12 : 0;
    return clamp(Math.round(58 - scout.reputation * 5 + clubFit + salaryFit + durationFit), 5, 96);
  },

  evaluateContractOffer(
    scout: TransferScout,
    club: Club,
    offer: TransferScoutContractOffer,
    currentDate: Date,
  ): TransferScoutHiringResult {
    const previousNegotiation = scout.contractNegotiation?.clubId === club.id
      ? scout.contractNegotiation
      : undefined;
    const attempt = (previousNegotiation?.attempts ?? 0) + 1;
    const demand = previousNegotiation?.demandedWeeklySalary ?? scout.weeklySalary;
    const normalizedOffer = Math.max(500, Math.round(offer.weeklySalary / 500) * 500);
    const normalizedContractOffer = { ...offer, weeklySalary: normalizedOffer };
    const salaryRatio = normalizedOffer / Math.max(500, demand);
    const requiredClubReputation = clamp(scout.reputation * 3 - 1, 1, 16);
    const reputationGap = Math.max(0, requiredClubReputation - club.reputation);
    const isMajorReputationMismatch = reputationGap >= 4;
    const decisionRoll = stableUnit(`${scout.id}|${club.id}|contract-decision|${attempt}`) * 100;
    const breakRoll = stableUnit(`${scout.id}|${club.id}|contract-break|${attempt}`);
    const lowOffer = salaryRatio < 0.82;
    const immediateBreakChance = clamp(
      0.18 + reputationGap * 0.035 + Math.max(0, 0.82 - salaryRatio) * 1.15,
      0.18,
      0.82,
    );

    const walkAway = (message: string): TransferScoutHiringResult => {
      const unavailableUntil = new Date(currentDate);
      unavailableUntil.setMonth(unavailableUntil.getMonth() + 5 + Math.floor(stableUnit(`${scout.id}|${club.id}|cooldown`) * 3));
      return {
        ok: false,
        status: 'WALKED_AWAY',
        message,
        attemptsRemaining: 0,
        unavailableUntil: unavailableUntil.toISOString().split('T')[0],
      };
    };

    if (lowOffer && breakRoll < immediateBreakChance) {
      return walkAway(`${scout.firstName} ${scout.lastName} uznał ofertę za niepoważną i zerwał rozmowy.`);
    }

    let acceptanceChance = TransferScoutingService.getContractAcceptanceChance(
      scout,
      club,
      normalizedContractOffer,
      demand,
    );
    if (isMajorReputationMismatch) {
      const exceptionalPremium = Math.max(0, salaryRatio - 1) * 12;
      const durationBonus = offer.durationYears >= 3 ? 3 : offer.durationYears === 2 ? 1 : 0;
      acceptanceChance = clamp(Math.round(2 + exceptionalPremium + durationBonus), 2, 12);
    }
    if (lowOffer) acceptanceChance = Math.min(acceptanceChance, 4);

    if (decisionRoll <= acceptanceChance) {
      return {
        ok: true,
        status: 'SIGNED',
        message: isMajorReputationMismatch
          ? `${scout.firstName} ${scout.lastName} zrobił wyjątek i zaakceptował ofertę klubu o niższej reputacji.`
          : `${scout.firstName} ${scout.lastName} zaakceptował warunki kontraktu.`,
        attemptsRemaining: Math.max(0, 3 - attempt),
      };
    }

    if (attempt >= 3) {
      return walkAway(`${scout.firstName} ${scout.lastName} odrzucił trzecią ofertę i zakończył negocjacje.`);
    }

    const counterMultiplier = 1.08 + scout.reputation * 0.015 + stableUnit(`${scout.id}|${club.id}|counter|${attempt}`) * 0.05;
    const reputationPremium = reputationGap > 0 ? 1 + Math.min(0.20, reputationGap * 0.025) : 1;
    const counterWeeklySalary = Math.max(
      demand,
      Math.round(demand * counterMultiplier * reputationPremium / 500) * 500,
    );
    return {
      ok: false,
      status: 'COUNTER',
      message: `${scout.firstName} ${scout.lastName} nie przyjął oferty i podbił oczekiwaną pensję do ${counterWeeklySalary.toLocaleString('pl-PL')} PLN tygodniowo.`,
      counterWeeklySalary,
      attemptsRemaining: 3 - attempt,
    };
  },

  buildScoutContract(
    scout: TransferScout,
    offer: TransferScoutContractOffer,
    currentDate: Date,
  ): TransferScoutContract {
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + offer.durationYears);
    const basePenaltyWeeks: Record<TransferScoutReputation, number> = { 1: 5, 2: 9, 3: 14, 4: 22, 5: 32 };
    const extraYears = Math.max(0, offer.durationYears - 1);
    const penaltyWeeks = basePenaltyWeeks[scout.reputation] + extraYears * (2 + scout.reputation);
    const weeklySalary = Math.max(500, Math.round(offer.weeklySalary / 500) * 500);
    return {
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      weeklySalary,
      earlyTerminationPenalty: Math.max(10_000, Math.round(weeklySalary * penaltyWeeks / 10_000) * 10_000),
    };
  },

  getEarlyTerminationPenalty(scout: TransferScout, currentDate: Date): number {
    if (!scout.contract) return 0;
    const start = new Date(scout.contract.startDate).getTime();
    const end = new Date(scout.contract.endDate).getTime();
    const now = currentDate.getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || now >= end) return 0;
    const remainingRatio = clamp((end - now) / Math.max(1, end - start), 0, 1);
    return Math.max(0, Math.round(scout.contract.earlyTerminationPenalty * remainingRatio / 10_000) * 10_000);
  },

  getScoutPersuasionChance(reputation: TransferScoutReputation): number {
    return ({ 1: 3, 2: 7, 3: 13, 4: 21, 5: 32 })[reputation];
  },

  getAssignmentDays(scout: TransferScout, filters: TransferScoutingFilters): number {
    let days = 30 - scout.speed * 0.9;
    if (filters.region && scout.regionalSpecialty === filters.region) days -= 4;
    if (filters.position && scout.positionSpecialty === filters.position) days -= 2;
    const activeAttributeCount = Object.keys(filters.attributes).length;
    days += Math.max(0, activeAttributeCount - 2);
    return clamp(Math.round(days), 7, 28);
  },

  getAssignmentCost(scout: TransferScout, filters: TransferScoutingFilters): number {
    const regionCost = filters.region && filters.region !== Region.POLAND ? 10_000 : 0;
    const complexityCost = Object.keys(filters.attributes).length * 1_500;
    return Math.round((12_000 + scout.reach * 900 + regionCost + complexityCost) / 500) * 500;
  },

  buildAssignment(
    scout: TransferScout,
    clubId: string,
    filters: TransferScoutingFilters,
    currentDate: Date,
  ): TransferScoutingAssignment {
    const completionDate = new Date(currentDate);
    completionDate.setDate(completionDate.getDate() + TransferScoutingService.getAssignmentDays(scout, filters));
    return {
      id: `TRANSFER_SCOUTING_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      scoutId: scout.id,
      clubId,
      startedDate: currentDate.toISOString().split('T')[0],
      completionDate: completionDate.toISOString().split('T')[0],
      cost: TransferScoutingService.getAssignmentCost(scout, filters),
      filters,
    };
  },

  getInterestProbability(
    player: Player,
    userClub: Club,
    sourceClub: Club | null,
    playersByClub: Record<string, Player[]>,
    currentDate: Date,
    scoutReputation?: TransferScoutReputation,
  ): number {
    const targetSquad = playersByClub[userClub.id] ?? [];
    const sourceSquad = sourceClub ? (playersByClub[sourceClub.id] ?? []) : [];
    const clubLevel = 34 + userClub.reputation * 4.2;
    const levelGap = player.overallRating - clubLevel;
    const loyalty = clamp(player.lojalnosc ?? 50, 1, 99);
    const stableSurprise = (stableUnit(`${player.id}|${userClub.id}|transfer-interest`) - 0.5) * 30;

    let probability = 62 - Math.max(0, levelGap) * 3.2 + Math.max(0, -levelGap) * 0.6;
    probability += player.isOnTransferList ? 17 : 0;
    probability += player.clubId === 'FREE_AGENTS' ? 12 : 0;
    probability += player.age >= 31 ? 7 : player.age <= 22 ? 3 : 0;
    probability -= Math.max(0, loyalty - 55) * 0.28;
    probability += stableSurprise;
    probability += scoutReputation ? ({ 1: 1, 2: 3, 3: 6, 4: 10, 5: 15 })[scoutReputation] : 0;

    if (sourceClub) {
      probability += (userClub.reputation - sourceClub.reputation) * 5;
      const plan = TransferPlayerDecisionService.buildNegotiationPlan(
        player,
        sourceClub,
        userClub,
        sourceSquad,
        targetSquad,
        currentDate,
      );
      if (!plan.willingToTalk) probability = Math.min(probability, 18);
    }

    return clamp(Math.round(probability), 1, 96);
  },

  resolveAssignment(
    assignment: TransferScoutingAssignment,
    scout: TransferScout,
    userClub: Club,
    clubs: Club[],
    playersByClub: Record<string, Player[]>,
    completionDate: Date,
  ): TransferScoutingReport {
    const clubById = new Map(clubs.map(club => [club.id, club]));
    const uniquePlayers = new Map<string, Player>();
    Object.values(playersByClub).flat().forEach(player => {
      if (!uniquePlayers.has(player.id)) uniquePlayers.set(player.id, player);
    });

    const quality = getScoutQuality(scout);
    const coverage = clamp(0.30 + scout.reach * 0.033, 0.35, 0.96);
    const selectedLikelihood: TransferLikelihoodFilter = assignment.filters.likelihood
      ?? assignment.filters.minimumLikelihood
      ?? 'ANY';
    const candidates = Array.from(uniquePlayers.values())
      .filter(player => player.clubId !== userClub.id)
      .filter(player => matchesFilters(player, assignment.filters, completionDate))
      .map(player => {
        const sourceClub = player.clubId === 'FREE_AGENTS' ? null : clubById.get(player.clubId) ?? null;
        const probability = TransferScoutingService.getInterestProbability(player, userClub, sourceClub, playersByClub, completionDate, scout.reputation);
        const likelihood = toLikelihood(probability);
        const discoveryRoll = stableUnit(`${assignment.id}|${player.id}|discovery`);
        const specialtyBonus = scout.positionSpecialty === player.position ? 0.08 : 0;
        const regionBonus = scout.regionalSpecialty === player.nationality ? 0.10 : 0;
        const discovered = discoveryRoll <= clamp(coverage + specialtyBonus + regionBonus, 0, 0.99);
        const attributeFit = (Object.entries(assignment.filters.attributes) as [keyof PlayerAttributes, { min: number; max: number }][]) .reduce(
          (score, [attribute, range]) => {
            const midpoint = (range.min + range.max) / 2;
            return score + Math.max(0, 20 - Math.abs(player.attributes[attribute] - midpoint));
          },
          0,
        );
        return {
          player,
          probability,
          likelihood,
          discovered,
          score: probability * 0.6 + player.overallRating * 0.35 + attributeFit,
        };
      })
      .filter(entry => entry.discovered && (selectedLikelihood === 'ANY' || entry.likelihood === selectedLikelihood))
      .sort((left, right) => right.score - left.score);

    const resultCount = clamp(2 + Math.floor((scout.judgment + scout.reach) / 6), 3, 9);
    const uncertainty = clamp(Math.round(16 - quality * 0.65), 3, 14);
    const reports: TransferScoutingCandidateReport[] = candidates.slice(0, resultCount).map(({ player, probability, likelihood }, index) => {
      const value = Math.max(0, player.marketValue ?? 0);
      const salary = Math.max(0, player.annualSalary ?? 0);
      const valueSpread = clamp((22 - scout.judgment) / 100, 0.03, 0.20);
      const salarySpread = clamp((23 - scout.experience) / 100, 0.04, 0.22);
      return {
        playerId: player.id,
        matchScore: clamp(Math.round(98 - index * 5 - stableUnit(`${assignment.id}|${player.id}|fit`) * 8), 50, 99),
        likelihood,
        probabilityMin: clamp(probability - uncertainty, 1, 99),
        probabilityMax: clamp(probability + uncertainty, 1, 99),
        estimatedMarketValue: {
          min: Math.round(value * (1 - valueSpread)),
          max: Math.round(value * (1 + valueSpread)),
        },
        estimatedAnnualSalary: {
          min: Math.round(salary * (1 - salarySpread)),
          max: Math.round(salary * (1 + salarySpread)),
        },
        recommendation: likelihood === 'CERTAIN' || (likelihood === 'LIKELY' && player.overallRating >= clubLevelForRecommendation(userClub))
          ? 'PRIORITY'
          : likelihood === 'LIKELY' || likelihood === 'MEDIUM'
            ? 'APPROACH'
            : 'WATCH',
      };
    });

    return {
      id: `TRANSFER_REPORT_${assignment.id}`,
      assignmentId: assignment.id,
      scoutId: scout.id,
      scoutName: `${scout.firstName} ${scout.lastName}`,
      completedDate: completionDate.toISOString().split('T')[0],
      filters: assignment.filters,
      candidates: reports,
    };
  },
};

function clubLevelForRecommendation(club: Club): number {
  return 34 + club.reputation * 4.2;
}
