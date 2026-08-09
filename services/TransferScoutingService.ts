import {
  Club,
  Player,
  PlayerAttributes,
  PlayerPosition,
  Region,
  TransferLikelihood,
  TransferLikelihoodFilter,
  TransferScout,
  TransferScoutingAssignment,
  TransferScoutingCandidateReport,
  TransferScoutingFilters,
  TransferScoutingReport,
} from '../types';
import { NameGeneratorService } from './NameGeneratorService';
import { TransferPlayerDecisionService } from './TransferPlayerDecisionService';

const MAX_TRANSFER_SCOUTS = 3;
const SCOUT_POOL_SIZE = 24;
const POSITIONS = [PlayerPosition.GK, PlayerPosition.DEF, PlayerPosition.MID, PlayerPosition.FWD];
const REGIONS = [
  Region.POLAND,
  Region.BALKANS,
  Region.CZ_SK,
  Region.SSA,
  Region.IBERIA,
  Region.GERMANY,
  Region.BRAZIL,
  Region.ARGENTINA,
  Region.FRANCE,
  Region.EX_USSR,
  Region.ROMANIA,
  Region.SCANDINAVIA,
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
    return Array.from({ length: SCOUT_POOL_SIZE }, (_, index) => {
      const region = REGIONS[Math.floor(stableUnit(`${seed}|${index}|region`) * REGIONS.length)];
      const name = NameGeneratorService.getRandomName(region);
      const base = 4 + Math.floor(stableUnit(`${seed}|${index}|base`) * 13);
      const stat = (key: string) => clamp(base + Math.floor(stableUnit(`${seed}|${index}|${key}`) * 9) - 4, 1, 20);
      const judgment = stat('judgment');
      const reach = stat('reach');
      const speed = stat('speed');
      const experience = stat('experience');
      const average = (judgment + reach + speed + experience) / 4;

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
        regionalSpecialty: stableUnit(`${seed}|${index}|regional`) < 0.72 ? region : undefined,
        positionSpecialty: stableUnit(`${seed}|${index}|position-specialty`) < 0.55
          ? POSITIONS[Math.floor(stableUnit(`${seed}|${index}|position`) * POSITIONS.length)]
          : undefined,
        weeklySalary: Math.round((9_000 + average * 2_200) / 500) * 500,
        employedByClubId: undefined,
        isOnAssignment: false,
      };
    });
  },

  getScoutStars(scout: TransferScout): number {
    const quality = getScoutQuality(scout);
    if (quality >= 17) return 5;
    if (quality >= 14) return 4;
    if (quality >= 11) return 3;
    if (quality >= 8) return 2;
    return 1;
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
        const probability = TransferScoutingService.getInterestProbability(player, userClub, sourceClub, playersByClub, completionDate);
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
