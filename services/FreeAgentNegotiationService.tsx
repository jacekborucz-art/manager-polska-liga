import {
  Player,
  Club,
  PendingNegotiation,
  NegotiationStatus,
  ManagerProfile,
  FreeAgentContractDemands,
  FreeAgentDemandRngBand,
  PlayerPosition,
  TransferScoutNegotiationInfluence,
} from '../types';
import { ManagerNegotiationInfluenceService } from './ManagerNegotiationInfluenceService';
import { PrestigeTransferGuardService } from './PrestigeTransferGuardService';
import { FinanceService } from './FinanceService';
import { getScoutNegotiationPower } from './TransferPlayerDecisionService';

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const stableUnit = (key: string, salt: string): number => {
  const source = `${key}|${salt}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash += hash << 13;
  hash ^= hash >>> 7;
  hash += hash << 3;
  hash ^= hash >>> 17;
  hash += hash << 5;
  return (hash >>> 0) / 4294967296;
};

export interface FreeAgentOfferDecisionContext {
  club?: Club;
  managerProfile?: ManagerProfile | null;
  scout?: TransferScoutNegotiationInfluence;
  /** Stable [0, 1) roll stored on PendingNegotiation. */
  decisionRoll?: number;
  /** Optional prestige/destination ceiling calculated by the transfer system. */
  acceptanceChanceCap?: number;
}

export interface FreeAgentOfferDecision {
  accepted: boolean;
  reason: string;
  demands: Pick<FreeAgentContractDemands, 'salary' | 'bonus' | 'years' | 'goalBonus' | 'assistBonus' | 'cleanSheetBonus'> | null;
  /** Diagnostic values are persisted/used internally and are not shown to users. */
  acceptanceChance: number;
  decisionRoll: number;
}

const getPersonalityAcceptanceModifier = (player: Player, club?: Club): number => {
  const personality = player.moralePersonality;
  if (personality === 'LOYAL') return 0.03;
  if (personality === 'PROFESSIONAL') return 0.02;
  if (personality === 'CALM') return 0.01;
  if (personality === 'EGOIST') return -0.04;
  if (personality === 'CONFIDENT') return -0.01;
  if (personality === 'AMBITIOUS') {
    const playerReputation = player.reputacja ?? clamp(Math.round((player.overallRating - 38) / 3), 1, 20);
    return (club?.reputation ?? playerReputation) >= playerReputation ? 0.01 : -0.04;
  }
  return 0;
};

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const roundAnnualMoney = (value: number): number =>
  Math.max(20_000, Math.round(value / 10_000) * 10_000);

const roundSigningMoney = (value: number): number =>
  Math.max(0, Math.round(value / 10_000) * 10_000);

const roundPerformanceMoney = (value: number): number => {
  const step = value >= 100_000 ? 5_000 : value >= 20_000 ? 1_000 : 500;
  return Math.max(500, Math.round(value / step) * step);
};

const getFallbackLeagueFactor = (club: Club): number => {
  const tier = FinanceService.getClubTier(club);
  const reputation = clamp(club.reputation || 1, 1, 20);
  if (tier <= 1) return clamp(0.68 + reputation * 0.035, 0.72, 1.38);
  if (tier === 2) return clamp(0.42 + reputation * 0.028, 0.48, 0.88);
  if (tier === 3) return clamp(0.28 + reputation * 0.022, 0.32, 0.68);
  return clamp(0.20 + reputation * 0.017, 0.24, 0.52);
};

const getAgeSalaryMultiplier = (age: number): number => {
  if (age <= 18) return 0.70;
  if (age <= 21) return 0.82;
  if (age <= 24) return 0.93;
  if (age <= 29) return 1;
  if (age <= 32) return 0.96;
  if (age <= 35) return 0.86;
  return 0.72;
};

const getPersonalitySalaryMultiplier = (player: Player): number => {
  if (player.moralePersonality === 'EGOIST') return 1.10;
  if (player.moralePersonality === 'AMBITIOUS') return 1.06;
  if (player.moralePersonality === 'CONFIDENT') return 1.03;
  if (player.moralePersonality === 'LOYAL') return 0.95;
  if (player.moralePersonality === 'PROFESSIONAL') return 0.98;
  if (player.moralePersonality === 'CALM') return 0.97;
  return 1;
};

const getPositionGuaranteeMultiplier = (position: PlayerPosition): number => {
  if (position === PlayerPosition.DEF) return 1.10;
  if (position === PlayerPosition.GK) return 1.03;
  if (position === PlayerPosition.MID) return 1.02;
  return 1;
};

interface FreeAgentDemandRngProfile {
  seedKey: string;
  normalVolatility: number;
  relocationIntensity: number;
  salaryCenter: number;
  toughChance: number;
  veryHighChance: number;
  extremeChance: number;
}

const normalizeCountryKey = (country: string | undefined): string =>
  (country ?? '')
    .trim()
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '');

const playerCountryKey = (player: Player): string =>
  normalizeCountryKey(player.nationalityCountry) || player.nationality.toLocaleLowerCase('pl-PL');

const DISTANT_ORIGIN_REGIONS = new Set([
  'SSA',
  'NORTH_AMERICA',
  'MEXICO',
  'OCEANIA',
  'JAPAN',
  'KOREA',
  'ARGENTINA',
  'BRAZIL',
  'ARABIA',
  'SOUTH_AMERICAN',
]);

const getRelocationIntensity = (player: Player, club: Club): number => {
  const playerCountry = normalizeCountryKey(player.nationalityCountry);
  const clubCountry = normalizeCountryKey(club.country);

  if (playerCountry && clubCountry && playerCountry === clubCountry) return 0;
  if (!playerCountry || !clubCountry) return 0.025;
  return DISTANT_ORIGIN_REGIONS.has(player.nationality) ? 0.09 : 0.05;
};

const getDemandRngProfile = (player: Player, club: Club, seedKey: string): FreeAgentDemandRngProfile => {
  const relocationIntensity = getRelocationIntensity(player, club);
  const ageVolatility = player.age <= 21
    ? 0.075
    : player.age <= 24
      ? 0.045
      : player.age <= 30
        ? 0.02
        : player.age <= 34
          ? 0.045
          : 0.075;
  const overallVolatility = player.overallRating >= 82
    ? 0.08
    : player.overallRating >= 72
      ? 0.055
      : player.overallRating >= 62
        ? 0.03
        : 0.045;
  const profileSeedKey = [
    seedKey,
    `wiek:${player.age}`,
    `kraj:${playerCountryKey(player)}`,
    `region:${player.nationality}`,
    `ovr:${Math.round(player.overallRating)}`,
  ].join('|');
  const relocationSalaryPremium = relocationIntensity > 0
    ? relocationIntensity * (0.45 + stableUnit(profileSeedKey, 'relocation-premium') * 0.75)
    : (stableUnit(profileSeedKey, 'domestic-preference') - 0.5) * 0.02;
  const eliteLeverage = clamp((player.overallRating - 68) / 140, 0, 0.13);
  const ageLeverage = player.age <= 21 ? 0.008 : player.age >= 35 ? 0.004 : 0;

  return {
    seedKey: profileSeedKey,
    normalVolatility: clamp(0.09 + ageVolatility + overallVolatility + relocationIntensity * 0.7, 0.14, 0.31),
    relocationIntensity,
    salaryCenter: 1 + relocationSalaryPremium,
    toughChance: clamp(0.03 + eliteLeverage * 0.28 + relocationIntensity * 0.24 + ageLeverage, 0.03, 0.085),
    veryHighChance: clamp(0.009 + eliteLeverage * 0.075 + relocationIntensity * 0.055, 0.009, 0.026),
    extremeChance: clamp(0.001 + eliteLeverage * 0.012 + relocationIntensity * 0.01, 0.001, 0.0045),
  };
};

const getPreferredContractYears = (
  player: Player,
  club: Club,
  profile: FreeAgentDemandRngProfile,
): number => {
  const { seedKey } = profile;
  const roll = stableUnit(seedKey, 'contract-years');
  let years: number;
  if (player.age <= 18) years = roll < 0.65 ? 5 : 4;
  else if (player.age <= 21) years = roll < 0.55 ? 4 : roll < 0.88 ? 5 : 3;
  else if (player.age <= 24) years = roll < 0.55 ? 4 : 3;
  else if (player.age <= 29) years = roll < 0.68 ? 3 : 4;
  else if (player.age <= 32) years = roll < 0.58 ? 3 : 2;
  else if (player.age <= 35) years = roll < 0.72 ? 2 : 1;
  else years = roll < 0.15 ? 2 : 1;

  const playerReputation = player.reputacja ?? clamp(Math.round((player.overallRating - 38) / 3), 1, 20);
  if (player.age <= 30 && playerReputation - club.reputation >= 5) years = Math.max(1, years - 1);
  if (
    player.age <= 32 &&
    profile.relocationIntensity >= 0.05 &&
    stableUnit(seedKey, 'relocation-security') < 0.32
  ) {
    years = Math.min(5, years + 1);
  }
  return years;
};

const getDemandRng = (profile: FreeAgentDemandRngProfile): { band: FreeAgentDemandRngBand; multiplier: number } => {
  const { seedKey } = profile;
  const bandRoll = stableUnit(seedKey, 'demand-band');
  const valueRoll = stableUnit(seedKey, 'demand-value');
  const extremeLimit = profile.extremeChance;
  const veryHighLimit = extremeLimit + profile.veryHighChance;
  const toughLimit = veryHighLimit + profile.toughChance;

  if (bandRoll < extremeLimit) {
    return { band: 'EXTREME', multiplier: 2 + valueRoll * (1 + profile.relocationIntensity) };
  }
  if (bandRoll < veryHighLimit) {
    return { band: 'VERY_HIGH', multiplier: 1.45 + valueRoll * 0.38 + profile.relocationIntensity * 0.35 };
  }
  if (bandRoll < toughLimit) {
    return { band: 'TOUGH', multiplier: 1.18 + valueRoll * 0.30 + profile.relocationIntensity * 0.25 };
  }

  const centeredVariation = (valueRoll - 0.5) * 2 * profile.normalVolatility;
  return {
    band: 'NORMAL',
    multiplier: clamp(profile.salaryCenter + centeredVariation, 0.70, 1.42),
  };
};

const getPerformanceBonusVariation = (
  profile: FreeAgentDemandRngProfile,
  player: Player,
  bonusType: string,
): number => {
  const agePreference = player.age <= 23 ? 0.06 : player.age >= 34 ? -0.05 : 0;
  const overallPreference = clamp((player.overallRating - 65) / 250, -0.04, 0.08);
  const spread = clamp(0.18 + profile.normalVolatility * 0.45, 0.22, 0.32);
  return clamp(
    1 + agePreference + overallPreference + (stableUnit(profile.seedKey, `performance-${bonusType}`) - 0.5) * 2 * spread,
    0.68,
    1.38,
  );
};

const getClubTier = (club: Club): number => {
  if (typeof club.tier === 'number' && Number.isFinite(club.tier)) {
    return club.tier;
  }

  const parsedTier = Number((club.leagueId || '').split('_')[2]);
  return Number.isFinite(parsedTier) && parsedTier > 0 ? parsedTier : 4;
};

const getSquadAverageOverall = (squad: Player[]): number =>
  squad.length > 0
    ? squad.reduce((sum, player) => sum + player.overallRating, 0) / squad.length
    : 0;

const getSquadTopOverall = (squad: Player[]): number =>
  squad.length > 0
    ? squad.reduce((best, player) => Math.max(best, player.overallRating), 0)
    : 0;

const getRealisticClubCeiling = (club: Club, player: Player, squad: Player[]): number => {
  const tier = getClubTier(club);
  const samePosition = squad
    .filter(squadPlayer => squadPlayer.position === player.position)
    .sort((a, b) => b.overallRating - a.overallRating);

  const squadAverage = getSquadAverageOverall(squad);
  const squadTop = getSquadTopOverall(squad);
  const bestSamePosition = samePosition[0]?.overallRating ?? 0;
  const fallbackSquadBase = 41 + club.reputation * 2.6 - (tier - 1) * 4.2;
  const stadiumBoost = clamp((Math.log10(Math.max(club.stadiumCapacity, 1000)) - 3.0) * 4.2, 0, 6.5);
  const prestigeCeiling = 44 + club.reputation * 2.15 + stadiumBoost - (tier - 1) * 5.6;
  const squadCeiling = Math.max(
    squadAverage > 0 ? squadAverage + 8 : fallbackSquadBase,
    bestSamePosition > 0 ? bestSamePosition + 4 : fallbackSquadBase,
    squadTop > 0 ? squadTop + 1 : fallbackSquadBase
  );

  let realisticCeiling = Math.max(prestigeCeiling, squadCeiling);

  if (tier === 1) realisticCeiling += 1.5;
  if (club.reputation >= 9) realisticCeiling += 1.5;
  if (player.age >= 30) realisticCeiling += 2;
  if (player.age >= 33) realisticCeiling += 2;
  if (player.age >= 36) realisticCeiling += 2;

  return realisticCeiling;
};

export const FreeAgentNegotiationService = {
  /** Public deterministic roll helper used by save-compatible negotiation gates. */
  getStableDecisionRoll: (key: string, salt: string): number => stableUnit(key, salt),

  getClubLockoutUntil: (player: Player, clubId: string | null | undefined, currentDate: Date): string | null => {
    if (!clubId) return null;

    const lockoutUntil = player.freeAgentClubLockouts?.[clubId];
    if (!lockoutUntil) return null;

    const today = new Date(currentDate).setHours(0, 0, 0, 0);
    const lockoutDate = new Date(lockoutUntil).setHours(0, 0, 0, 0);
    return today < lockoutDate ? lockoutUntil : null;
  },

  isClubLockedOut: (player: Player, clubId: string | null | undefined, currentDate: Date): boolean => {
    return !!FreeAgentNegotiationService.getClubLockoutUntil(player, clubId, currentDate);
  },

  buildClubLockouts: (
    currentLockouts: Record<string, string> | undefined,
    clubId: string,
    lockoutUntil: string
  ): Record<string, string> => {
    return {
      ...(currentLockouts || {}),
      [clubId]: lockoutUntil
    };
  },

  evaluateInitialInterest: (player: Player, club: Club, squad: Player[] = [], managerProfile?: ManagerProfile | null): { interested: boolean, message: string } => {
    const tier = getClubTier(club);
    const managerInfluence = ManagerNegotiationInfluenceService.calculate(managerProfile);
    const prestigeAssessment = PrestigeTransferGuardService.evaluateDestination(player, club);

    if (
      prestigeAssessment.blocksNegotiation ||
      !PrestigeTransferGuardService.shouldConsiderDestination(player, club, managerInfluence.chanceAdjustment)
    ) {
      return {
        interested: false,
        message: PrestigeTransferGuardService.getRejectionReason(player, club)
      };
    }

    if (player.overallRating > 69 && club.reputation < 5) {
      const reputationGateChance = clamp(0.01 + Math.max(0, managerInfluence.chanceAdjustment) * 0.5, 0.01, 0.04);
      if (Math.random() > reputationGateChance) {
        return {
          interested: false,
          message: 'Moj klient nie jest zainteresowany gra na tym poziomie rozgrywkowym. Szukamy klubu o wiekszej renomie.'
        };
      }
    }

    const realisticCeiling = getRealisticClubCeiling(club, player, squad) + managerInfluence.realisticCeilingBonus;
    const excessOverCeiling = player.overallRating - realisticCeiling;

    if (tier >= 2 && player.overallRating >= 82 && player.age <= 32 && excessOverCeiling >= 4) {
      return {
        interested: false,
        message: 'Moj klient uwaza, ze ten ruch bylby zbyt duzym krokiem w dol pod wzgledem poziomu ligi i projektu sportowego.'
      };
    }

    if (excessOverCeiling >= 9 && player.age <= 32) {
      return {
        interested: false,
        message: 'Moj klient szuka projektu sportowego blizszego jego obecnym ambicjom. Na ten moment roznica poziomu jest zbyt duza.'
      };
    }

    if (excessOverCeiling > 0) {
      const chance = clamp(
        0.72 -
          excessOverCeiling * 0.10 +
          (tier === 1 ? 0.08 : 0) +
          (club.reputation >= 8 ? 0.05 : 0) +
          (player.age >= 33 ? 0.12 : player.age >= 30 ? 0.06 : 0) -
          (tier >= 3 ? 0.10 : 0) +
          managerInfluence.chanceAdjustment,
        0.01,
        0.70
      );

      if (Math.random() > chance) {
        return {
          interested: false,
          message: player.age >= 33
            ? 'Moj klient rozwazy jeszcze podobne kierunki, ale oczekuje klubu z mocniejszym argumentem sportowym.'
            : 'Moj klient celuje w klub, w ktorym poziom ligi i jakosc kadry beda blizsze jego aktualnej klasie.'
        };
      }
    }

    const isPolishClub = club.leagueId?.startsWith('L_PL_');
    if (isPolishClub && player.overallRating > 82) {
      const chance = clamp(
        0.50 - (player.overallRating - 83) * (0.49 / 16) + managerInfluence.chanceAdjustment * 0.5,
        0.01,
        0.55
      );
      if (Math.random() > chance) {
        return {
          interested: false,
          message: 'Moj klient rozwaza wylacznie oferty z silniejszych lig. Poziom rozgrywkowy jest dla niego niewystarczajacy.'
        };
      }
    }

    return { interested: true, message: '' };
  },

  calculateContractDemands: (
    player: Player,
    club: Club,
    squad: Player[],
    leaguePlayers: Player[],
    currentDate: Date,
    managerProfile?: ManagerProfile | null
  ): FreeAgentContractDemands => {
    const seedKey = `${player.id}|${club.id}|${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
    const fairSalary = FinanceService.getFairMarketSalary(player.overallRating);
    const fallbackMarketSalary = fairSalary * getFallbackLeagueFactor(club);
    const normalizeComparableSalary = (comparable: Player): number => {
      const comparableFairSalary = FinanceService.getFairMarketSalary(comparable.overallRating);
      const overallCorrection = comparableFairSalary > 0
        ? Math.pow(fairSalary / comparableFairSalary, 0.72)
        : 1;
      return comparable.annualSalary * overallCorrection;
    };

    const exactComparables = leaguePlayers.filter(comparable =>
      comparable.id !== player.id &&
      comparable.annualSalary > 0 &&
      comparable.position === player.position &&
      Math.abs(comparable.overallRating - player.overallRating) <= 4 &&
      Math.abs(comparable.age - player.age) <= 6
    );
    const widerComparables = exactComparables.length >= 5
      ? exactComparables
      : leaguePlayers.filter(comparable =>
          comparable.id !== player.id &&
          comparable.annualSalary > 0 &&
          comparable.position === player.position &&
          Math.abs(comparable.overallRating - player.overallRating) <= 7
        );
    const comparablePool = widerComparables.length >= 4
      ? widerComparables
      : leaguePlayers.filter(comparable =>
          comparable.id !== player.id &&
          comparable.annualSalary > 0 &&
          comparable.position === player.position
        );
    const normalizedComparableMedian = median(comparablePool.map(normalizeComparableSalary));
    const squadPositionMedian = median(
      squad
        .filter(squadPlayer => squadPlayer.annualSalary > 0 && squadPlayer.position === player.position)
        .map(squadPlayer => normalizeComparableSalary(squadPlayer))
    );

    let marketSalary = fallbackMarketSalary;
    if (normalizedComparableMedian > 0) {
      marketSalary = normalizedComparableMedian * 0.78 + fallbackMarketSalary * 0.22;
    }
    if (squadPositionMedian > 0) {
      marketSalary = marketSalary * 0.88 + squadPositionMedian * 0.12;
    }
    marketSalary = clamp(marketSalary, fallbackMarketSalary * 0.55, fallbackMarketSalary * 1.80);

    const playerReputation = player.reputacja ?? clamp(Math.round((player.overallRating - 38) / 3), 1, 20);
    const reputationMultiplier = clamp(1 + (playerReputation - 10) * 0.025, 0.82, 1.30);
    const prestigeCompensation = clamp(1 + Math.max(0, playerReputation - club.reputation) * 0.025, 1, 1.30);
    const demandRngProfile = getDemandRngProfile(player, club, seedKey);
    const demandRng = getDemandRng(demandRngProfile);
    const managerExpectationMultiplier = ManagerNegotiationInfluenceService.calculate(managerProfile).expectationMultiplier;
    const salaryBeforeRng =
      marketSalary *
      getAgeSalaryMultiplier(player.age) *
      reputationMultiplier *
      prestigeCompensation *
      getPositionGuaranteeMultiplier(player.position) *
      getPersonalitySalaryMultiplier(player) *
      managerExpectationMultiplier;
    const salary = roundAnnualMoney(salaryBeforeRng * demandRng.multiplier);

    const signingAgeRatio = player.age <= 22 ? 0.16 : player.age <= 29 ? 0.26 : player.age <= 33 ? 0.34 : 0.44;
    const signingReputationPremium = 1 + Math.max(0, playerReputation - 10) * 0.025;
    const signingVariation = 0.78 + stableUnit(demandRngProfile.seedKey, 'signing-bonus') * 0.44;
    const relocationSigningPremium = 1 + demandRngProfile.relocationIntensity * (
      0.4 + stableUnit(demandRngProfile.seedKey, 'signing-relocation') * 0.8
    );
    const bonus = roundSigningMoney(
      salary * signingAgeRatio * signingReputationPremium * signingVariation * relocationSigningPremium
    );
    const years = getPreferredContractYears(player, club, demandRngProfile);

    const finishingQuality = (player.attributes.finishing + player.attributes.attacking) / 2;
    const creativeQuality = (player.attributes.passing + player.attributes.vision) / 2;
    let goalBonus: number | undefined;
    let assistBonus: number | undefined;
    let cleanSheetBonus: number | undefined;

    if (player.position === PlayerPosition.GK) {
      const goalkeeperQuality = (player.attributes.goalkeeping + player.attributes.positioning + player.attributes.technique) / 3;
      cleanSheetBonus = roundPerformanceMoney(
        salary *
        0.0032 *
        clamp(0.65 + goalkeeperQuality / 160, 0.75, 1.28) *
        getPerformanceBonusVariation(demandRngProfile, player, 'clean-sheet')
      );
    } else if (player.position === PlayerPosition.MID) {
      if (finishingQuality >= 62) {
        goalBonus = roundPerformanceMoney(
          salary *
          0.0038 *
          clamp(0.62 + finishingQuality / 170, 0.72, 1.24) *
          getPerformanceBonusVariation(demandRngProfile, player, 'goal')
        );
      }
      if (creativeQuality >= 55) {
        assistBonus = roundPerformanceMoney(
          salary *
          0.0032 *
          clamp(0.65 + creativeQuality / 165, 0.74, 1.25) *
          getPerformanceBonusVariation(demandRngProfile, player, 'assist')
        );
      }
    } else if (player.position === PlayerPosition.FWD) {
      goalBonus = roundPerformanceMoney(
        salary *
        0.0045 *
        clamp(0.65 + finishingQuality / 155, 0.78, 1.32) *
        getPerformanceBonusVariation(demandRngProfile, player, 'goal')
      );
      if (creativeQuality >= 68) {
        assistBonus = roundPerformanceMoney(
          salary *
          0.0028 *
          clamp(0.65 + creativeQuality / 175, 0.74, 1.20) *
          getPerformanceBonusVariation(demandRngProfile, player, 'assist')
        );
      }
    }

    return {
      salary,
      bonus,
      years,
      goalBonus,
      assistBonus,
      cleanSheetBonus,
      marketSalary: roundAnnualMoney(marketSalary),
      comparablePlayers: comparablePool.length,
      rngBand: demandRng.band,
    };
  },

  evaluateOfferAgainstDemands: (
    player: Player,
    offer: Pick<PendingNegotiation, 'salary' | 'bonus' | 'years' | 'goalBonus' | 'assistBonus' | 'cleanSheetBonus'>,
    demands: FreeAgentContractDemands,
    decisionContext: FreeAgentOfferDecisionContext = {},
  ): FreeAgentOfferDecision => {
    const salaryFit = offer.salary / Math.max(1, demands.salary);
    /*
     * Annual salary and signing bonus are interchangeable parts of the guaranteed
     * package. Comparing their complete values makes 220k/year + 30k signing over
     * two years equivalent to 200k/year + 70k signing. Conditional performance
     * bonuses and the preferred contract length remain separate considerations.
     */
    const expectedGuaranteedTotal = demands.salary * demands.years + demands.bonus;
    const offeredGuaranteedTotal = offer.salary * offer.years + offer.bonus;
    const guaranteedFit = offeredGuaranteedTotal / Math.max(1, expectedGuaranteedTotal);
    const expectedPerformanceTotal =
      (demands.goalBonus ?? 0) +
      (demands.assistBonus ?? 0) +
      (demands.cleanSheetBonus ?? 0);
    const offeredPerformanceTotal =
      (offer.goalBonus ?? 0) +
      (offer.assistBonus ?? 0) +
      (offer.cleanSheetBonus ?? 0);
    const performanceFit = expectedPerformanceTotal > 0
      ? offeredPerformanceTotal / expectedPerformanceTotal
      : 1;
    const yearsGap = Math.abs(offer.years - demands.years);
    const yearsFit = yearsGap === 0 ? 1 : yearsGap === 1 ? 0.88 : 0.68;

    const performanceWeight = expectedPerformanceTotal > 0 ? 0.10 : 0;
    const yearsWeight = 0.12;
    const guaranteedWeight = 1 - performanceWeight - yearsWeight;
    const offerScore = (
      clamp(guaranteedFit, 0, 1.20) * guaranteedWeight +
      yearsFit * yearsWeight +
      clamp(performanceFit, 0, 1.20) * performanceWeight
    );

    const counterDemands = {
      salary: demands.salary,
      bonus: demands.bonus,
      years: demands.years,
      goalBonus: demands.goalBonus,
      assistBonus: demands.assistBonus,
      cleanSheetBonus: demands.cleanSheetBonus,
    };

    /* A signing bonus cannot replace the annual wage completely. The low salary
     * floor prevents exploitative zero-wage structures while still allowing a
     * manager to move most guaranteed money between the two components. */
    if (guaranteedFit < 0.45 || (salaryFit < 0.35 && guaranteedFit < 0.95)) {
      return {
        accepted: false,
        reason: 'Oferta jest tak niska, że mój klient nie widzi podstaw do dalszych rozmów.',
        demands: null,
        acceptanceChance: 0,
        decisionRoll: decisionContext.decisionRoll ?? 0,
      };
    }

    if (offerScore >= 0.68 && salaryFit >= 0.35) {
      /*
       * Convert the continuous offer quality into a smooth probability curve.
       * Around score 0.68 there is only a small exceptional chance; an exact
       * request is close to 94%, and a meaningfully better package approaches 99%.
       * No normal valid offer is absolutely guaranteed.
       */
      const curveChance = 1 / (1 + Math.exp(-14 * (offerScore - 0.86)));
      const exactTermsBonus =
        guaranteedFit >= 0.99 &&
        yearsGap === 0 &&
        performanceFit >= 0.90
          ? 0.055
          : 0;
      const managerModifier = ManagerNegotiationInfluenceService.calculate(
        decisionContext.managerProfile,
      ).chanceAdjustment;
      const playerReputation = player.reputacja ?? clamp(Math.round((player.overallRating - 38) / 3), 1, 20);
      const clubReputationModifier = decisionContext.club
        ? clamp(((decisionContext.club.reputation ?? 1) - playerReputation) * 0.012, -0.12, 0.08)
        : 0;
      const personalityModifier = getPersonalityAcceptanceModifier(player, decisionContext.club);
      const scoutModifier = getScoutNegotiationPower(decisionContext.scout) * 0.06;
      const uncappedChance = clamp(
        curveChance + exactTermsBonus + managerModifier + clubReputationModifier + personalityModifier + scoutModifier,
        0.01,
        0.99,
      );
      const acceptanceChance = typeof decisionContext.acceptanceChanceCap === 'number'
        ? Math.min(uncappedChance, clamp(decisionContext.acceptanceChanceCap, 0.000001, 1))
        : uncappedChance;
      const decisionRoll = clamp(
        decisionContext.decisionRoll ?? stableUnit(
          `${player.id}|${offer.salary}|${offer.bonus}|${offer.years}|${offer.goalBonus ?? 0}|${offer.assistBonus ?? 0}|${offer.cleanSheetBonus ?? 0}`,
          'fallback-final-offer',
        ),
        0,
        0.999999999,
      );

      if (decisionRoll < acceptanceChance) {
        return {
          accepted: true,
          reason: 'Zgadzamy się na przedstawione warunki.',
          demands: null,
          acceptanceChance,
          decisionRoll,
        };
      }

      const prestigeCapBlocked =
        typeof decisionContext.acceptanceChanceCap === 'number' &&
        acceptanceChance < uncappedChance &&
        decisionRoll < uncappedChance;
      if (prestigeCapBlocked && decisionContext.club) {
        return {
          accepted: false,
          reason: PrestigeTransferGuardService.getRejectionReason(player, decisionContext.club),
          demands: null,
          acceptanceChance,
          decisionRoll,
        };
      }

      return {
        accepted: false,
        reason: offerScore >= 0.96
          ? 'Warunki są bardzo bliskie porozumienia, ale mój klient nie jest jeszcze gotowy ich zaakceptować. Oczekujemy ostatniej poprawy oferty.'
          : 'Jesteśmy gotowi kontynuować rozmowy, ale oferta musi być bliższa oczekiwaniom mojego klienta.',
        demands: counterDemands,
        acceptanceChance,
        decisionRoll,
      };
    }
    return {
      accepted: false,
      reason: 'Warunki są zbyt dalekie od realiów kontraktowych mojego klienta.',
      demands: guaranteedFit >= 0.55 ? counterDemands : null,
      acceptanceChance: 0,
      decisionRoll: decisionContext.decisionRoll ?? 0,
    };
  },

  createNegotiationEntry: (player: Player, club: Club, salary: number, bonus: number, years: number, currentDate: Date, squad: Player[], goalBonus?: number, assistBonus?: number, cleanSheetBonus?: number, agentDemands?: FreeAgentContractDemands): PendingNegotiation => {
    const avgSalary = squad.length > 0 ? squad.reduce((sum, currentPlayer) => sum + currentPlayer.annualSalary, 0) / squad.length : 120000;
    const fallbackExpectedSalary = player.overallRating * 2000;
    /* Response time follows the same guaranteed-package model as final evaluation.
     * Otherwise a high-salary/low-bonus offer and its mathematically equivalent
     * low-salary/high-bonus variant could receive inconsistent agent behaviour. */
    const expectedGuaranteedTotal = agentDemands
      ? agentDemands.salary * agentDemands.years + agentDemands.bonus
      : fallbackExpectedSalary * years;
    const offeredGuaranteedTotal = salary * years + bonus;
    const rating = offeredGuaranteedTotal / Math.max(1, expectedGuaranteedTotal);

    let daysToWait = 2;
    if (rating < 0.5) daysToWait = 1;
    else if (rating < 0.9) daysToWait = 7 + Math.floor(Math.random() * 7);
    else daysToWait = 3 + Math.floor(Math.random() * 3);

    const responseDate = new Date(currentDate);
    responseDate.setDate(responseDate.getDate() + daysToWait);

    const negotiationId = `NEG_${Date.now()}_${player.id}`;
    const decisionSeed = `${negotiationId}|${club.id}|${salary}|${bonus}|${years}|${goalBonus ?? 0}|${assistBonus ?? 0}|${cleanSheetBonus ?? 0}`;

    return {
      id: negotiationId,
      playerId: player.id,
      clubId: club.id,
      salary,
      bonus,
      years,
      goalBonus,
      assistBonus,
      cleanSheetBonus,
      agentDemands,
      decisionSeed,
      decisionRoll: stableUnit(decisionSeed, 'final-player-decision'),
      responseDate: responseDate.toISOString(),
      status: NegotiationStatus.PENDING
    };
  }
};
