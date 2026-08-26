import { Club, Player } from '../types';
import { PlayerPrestigeService } from './PlayerPrestigeService';

export const HIGH_PLAYER_PRESTIGE_THRESHOLD = 90;
export const LOW_PRESTIGE_CLUB_REPUTATION_LIMIT = 17;
export const GULF_EXCEPTION_MIN_AGE = 35;
export const YOUTH_TALENT_EXCEPTION_MIN_AGE = 16;
export const YOUTH_TALENT_EXCEPTION_MAX_AGE = 18;
export const YOUTH_TALENT_EXCEPTION_MIN_PRESTIGE = 72;

const GULF_EXCEPTION_COUNTRIES = new Set(['KSA', 'UAE', 'QAT']);

export type PrestigeDestinationBand = 'NATURAL' | 'STRETCH' | 'LONG_SHOT' | 'EXTREME' | 'BLOCKED';

interface PrestigeExpectation {
  preferredMinReputation: number;
  acceptableMinReputation: number;
  longShotMinReputation: number;
  stretchChance: number;
  longShotChance: number;
  extremeChance: number;
}

export interface PrestigeDestinationAssessment {
  band: PrestigeDestinationBand;
  clubReputation: number;
  effectivePrestige: number;
  preferredMinReputation: number;
  acceptableMinReputation: number;
  longShotMinReputation: number;
  chanceCap: number;
  salaryPremium: number;
  bonusPremium: number;
  scorePenalty: number;
  blocksNegotiation: boolean;
  reason: string;
}

const getClubReputation = (club: Club): number => club.reputation ?? 0;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const getExpectationForPrestige = (prestige: number): PrestigeExpectation => {
  const normalized = clamp((prestige - 58) / 32, 0, 1);
  const preferredMinReputation = Math.round(4 + normalized * 15);
  const expectationGap = Math.round(3 + normalized * 2);
  const chanceBase = 1 - normalized;

  return {
    preferredMinReputation,
    acceptableMinReputation: Math.max(1, preferredMinReputation - expectationGap),
    longShotMinReputation: Math.max(0, preferredMinReputation - expectationGap * 2),
    stretchChance: clamp(0.80 - normalized * 0.64, 0.16, 0.80),
    longShotChance: clamp(0.36 * Math.pow(chanceBase, 2.2), 0, 0.36),
    extremeChance: clamp(0.12 * Math.pow(chanceBase, 3), 0, 0.12),
  };
};

const getBandForClub = (clubReputation: number, expectation: PrestigeExpectation): PrestigeDestinationBand => {
  if (clubReputation >= expectation.preferredMinReputation) return 'NATURAL';
  if (clubReputation >= expectation.acceptableMinReputation) return 'STRETCH';
  if (clubReputation >= expectation.longShotMinReputation) return 'LONG_SHOT';
  return expectation.extremeChance > 0 ? 'EXTREME' : 'BLOCKED';
};

const getReasonForBand = (
  band: PrestigeDestinationBand,
  player: Player,
  targetClub: Club,
  expectation: PrestigeExpectation
): string => {
  const clubReputation = getClubReputation(targetClub);

  if (band === 'BLOCKED') {
    return 'Mój klient traktuje taki kierunek jako nierealny sportowo. Różnica między jego poziomem a prestiżem klubu jest zbyt duża, żeby rozpocząć rozmowy.';
  }

  if (band === 'EXTREME') {
    return `Mój klient celuje dużo wyżej. Klub o reputacji ${clubReputation} jest daleko poniżej jego naturalnego rynku i taki ruch wymagałby wyjątkowych okoliczności.`;
  }

  if (band === 'LONG_SHOT') {
    return `Mój klient zwykle szuka klubów o reputacji co najmniej ${expectation.acceptableMinReputation}. Ten kierunek jest bardzo mało prawdopodobny bez ogromnej roli i wyjątkowego kontraktu.`;
  }

  if (band === 'STRETCH') {
    return `Mój klient najchętniej rozmawia z klubami o reputacji ${expectation.preferredMinReputation}+. Wasz klub jest możliwym, ale mniej naturalnym kierunkiem.`;
  }

  return '';
};

const getYouthTalentDiscoveryChance = (assessment: PrestigeDestinationAssessment): number => {
  const clubFactor = clamp(0.45 + assessment.clubReputation / 20, 0.45, 1.15);
  const baseChance =
    assessment.effectivePrestige >= 90 ? 0.004 :
    assessment.effectivePrestige >= 85 ? 0.012 :
    assessment.effectivePrestige >= 80 ? 0.022 :
    assessment.effectivePrestige >= 76 ? 0.035 :
    0.05;

  return clamp(baseChance * clubFactor, 0.0015, 0.055);
};

const applyYouthTalentDiscoveryException = (
  assessment: PrestigeDestinationAssessment,
  player: Player
): PrestigeDestinationAssessment => {
  if (
    player.age < YOUTH_TALENT_EXCEPTION_MIN_AGE ||
    player.age > YOUTH_TALENT_EXCEPTION_MAX_AGE ||
    assessment.effectivePrestige < YOUTH_TALENT_EXCEPTION_MIN_PRESTIGE ||
    assessment.band === 'NATURAL'
  ) {
    return assessment;
  }

  const youthChance = getYouthTalentDiscoveryChance(assessment);

  return {
    ...assessment,
    band: assessment.band === 'BLOCKED' ? 'EXTREME' : assessment.band,
    chanceCap: Math.max(assessment.chanceCap, youthChance),
    salaryPremium: Math.min(Math.max(assessment.salaryPremium, 0.08), 0.22),
    bonusPremium: Math.min(Math.max(assessment.bonusPremium, 0.16), 0.35),
    scorePenalty: Math.min(assessment.scorePenalty, assessment.effectivePrestige >= 85 ? 26 : 18),
    blocksNegotiation: false,
    reason: 'Mój klient jest bardzo młody, więc taki ruch mógłby mieć sens jako wyjątkowy projekt rozwojowy po wcześniejszym wyłowieniu talentu. To nadal rzadki scenariusz i klub musi zagwarantować jasną ścieżkę gry.'
  };
};

const applyGulfException = (
  assessment: PrestigeDestinationAssessment,
  player: Player,
  targetClub: Club
): PrestigeDestinationAssessment => {
  if (!PrestigeTransferGuardService.isGulfExceptionClub(targetClub) || assessment.band === 'NATURAL') {
    return assessment;
  }

  if (player.age >= 35) {
    return {
      ...assessment,
      band: assessment.band === 'BLOCKED' ? 'LONG_SHOT' : assessment.band,
      chanceCap: Math.max(assessment.chanceCap, 0.72),
      salaryPremium: Math.max(assessment.salaryPremium, 0.20),
      bonusPremium: Math.max(assessment.bonusPremium, 0.35),
      scorePenalty: Math.max(0, assessment.scorePenalty - 18),
      blocksNegotiation: false,
      reason: 'Mój klient może potraktować ten kierunek jako emerytalny mega-kontrakt, ale oferta musi jasno rekompensować niższy prestiż sportowy.'
    };
  }

  if (player.age >= 30) {
    return {
      ...assessment,
      band: assessment.band === 'BLOCKED' ? 'EXTREME' : assessment.band,
      chanceCap: Math.max(assessment.chanceCap, assessment.effectivePrestige >= 90 ? 0.035 : 0.08),
      salaryPremium: Math.max(assessment.salaryPremium, 0.38),
      bonusPremium: Math.max(assessment.bonusPremium, 0.75),
      scorePenalty: Math.max(assessment.scorePenalty, 24),
      blocksNegotiation: false,
      reason: 'Mój klient jest jeszcze przed końcówką kariery, więc taki kierunek jest rzadki. Realny byłby tylko przy bardzo bogatym, wyjątkowo przekonującym kontrakcie.'
    };
  }

  return {
    ...assessment,
    band: assessment.band === 'BLOCKED' ? 'EXTREME' : assessment.band,
    chanceCap: Math.max(assessment.chanceCap, assessment.effectivePrestige >= 90 ? 0.006 : 0.018),
    salaryPremium: Math.max(assessment.salaryPremium, 0.55),
    bonusPremium: Math.max(assessment.bonusPremium, 1.0),
    scorePenalty: Math.max(assessment.scorePenalty, 34),
    blocksNegotiation: false,
    reason: 'Bogaty klub z regionu może czasem skusić młodszego zawodnika, ale to wyjątkowo rzadki scenariusz i wymagałby finansowej oferty poza normalnym rynkiem.'
  };
};

const getChanceWithManagerInfluence = (
  assessment: PrestigeDestinationAssessment,
  managerChanceAdjustment = 0
): number => {
  if (assessment.blocksNegotiation) return 0;
  if (assessment.band === 'NATURAL') return 1;

  const positiveInfluence = Math.max(0, managerChanceAdjustment);
  const boost =
    assessment.band === 'STRETCH' ? positiveInfluence * 0.45 :
    assessment.band === 'LONG_SHOT' ? positiveInfluence * 0.12 :
    positiveInfluence * 0.03;

  return clamp(assessment.chanceCap + boost, 0, assessment.band === 'STRETCH' ? 0.65 : assessment.chanceCap + 0.015);
};

export const PrestigeTransferGuardService = {
  getPlayerPrestige: (player: Player): number => PlayerPrestigeService.getTransferPrestige(player),

  isHighPrestigePlayer: (player: Player): boolean =>
    PrestigeTransferGuardService.getPlayerPrestige(player) >= HIGH_PLAYER_PRESTIGE_THRESHOLD,

  isLowPrestigeDestination: (club: Club): boolean =>
    getClubReputation(club) <= LOW_PRESTIGE_CLUB_REPUTATION_LIMIT,

  isGulfExceptionClub: (club: Club): boolean =>
    GULF_EXCEPTION_COUNTRIES.has(club.country || '') && getClubReputation(club) >= 8,

  evaluateDestination: (player: Player, targetClub: Club): PrestigeDestinationAssessment => {
    const effectivePrestige = PlayerPrestigeService.getTransferPrestige(player);
    const expectation = getExpectationForPrestige(effectivePrestige);
    const clubReputation = getClubReputation(targetClub);
    const band = getBandForClub(clubReputation, expectation);
    const chanceCap =
      band === 'NATURAL' ? 1 :
      band === 'STRETCH' ? expectation.stretchChance :
      band === 'LONG_SHOT' ? expectation.longShotChance :
      band === 'EXTREME' ? expectation.extremeChance :
      0;
    const salaryPremium =
      band === 'NATURAL' ? 0 :
      band === 'STRETCH' ? 0.10 :
      band === 'LONG_SHOT' ? 0.26 :
      band === 'EXTREME' ? 0.46 :
      0.70;
    const bonusPremium =
      band === 'NATURAL' ? 0 :
      band === 'STRETCH' ? 0.18 :
      band === 'LONG_SHOT' ? 0.50 :
      band === 'EXTREME' ? 0.90 :
      1.25;
    const scorePenalty =
      band === 'NATURAL' ? 0 :
      band === 'STRETCH' ? 8 :
      band === 'LONG_SHOT' ? 24 :
      band === 'EXTREME' ? 38 :
      55;

    const assessment: PrestigeDestinationAssessment = {
      band,
      clubReputation,
      effectivePrestige,
      preferredMinReputation: expectation.preferredMinReputation,
      acceptableMinReputation: expectation.acceptableMinReputation,
      longShotMinReputation: expectation.longShotMinReputation,
      chanceCap,
      salaryPremium,
      bonusPremium,
      scorePenalty,
      blocksNegotiation: band === 'BLOCKED',
      reason: getReasonForBand(band, player, targetClub, expectation)
    };

    return applyGulfException(
      applyYouthTalentDiscoveryException(assessment, player),
      player,
      targetClub
    );
  },

  isAllowedDestinationForHighPrestigePlayer: (player: Player, targetClub: Club): boolean => {
    return !PrestigeTransferGuardService.evaluateDestination(player, targetClub).blocksNegotiation;
  },

  shouldConsiderDestination: (
    player: Player,
    targetClub: Club,
    managerChanceAdjustment = 0,
    randomRoll?: number
  ): boolean => {
    const assessment = PrestigeTransferGuardService.evaluateDestination(player, targetClub);
    const chance = getChanceWithManagerInfluence(assessment, managerChanceAdjustment);
    // Callers normally omit randomRoll and retain the original behavior. The AI
    // bulk-market scan may capture the roll before cheap deterministic filters
    // and pass it here only for candidates which can actually be signed. This
    // avoids thousands of unused prestige calculations while preserving the
    // exact count and order of global RNG draws from the old implementation.
    return (randomRoll ?? Math.random()) <= chance;
  },

  getAcceptanceChanceCap: (player: Player, targetClub: Club): number => {
    const assessment = PrestigeTransferGuardService.evaluateDestination(player, targetClub);
    return assessment.blocksNegotiation ? 0 : assessment.chanceCap;
  },

  getBlockedReason: (player: Player, targetClub: Club): string | null => {
    const assessment = PrestigeTransferGuardService.evaluateDestination(player, targetClub);
    return assessment.blocksNegotiation ? assessment.reason : null;
  },

  getRejectionReason: (player: Player, targetClub: Club): string => {
    const assessment = PrestigeTransferGuardService.evaluateDestination(player, targetClub);
    return assessment.reason || 'Mój klient szuka projektu lepiej dopasowanego do jego aktualnego poziomu sportowego.';
  }
};
