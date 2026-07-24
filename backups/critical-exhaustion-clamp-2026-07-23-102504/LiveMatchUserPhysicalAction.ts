import { InjurySeverity } from '../../../types';

export type LiveMatchUserPhysicalActionSuppressionInputs = {
  minute: number;
  lineup: (string | null)[];
  fatigueMap: Record<string, number>;
  matchInjuries: Record<string, InjurySeverity>;
  substitutionsUsed: number;
  maxSubstitutions?: number;
  existingPhysicalActionPenalty?: number;
  rng: () => number;
};

export type LiveMatchUserPhysicalActionSuppression = {
  tiredPlayerCount: number;
  injuredPlayerCount: number;
  unusedSubstitutions: number;
  fatiguePenalty: number;
  injuryPenalty: number;
  substitutionPenalty: number;
  rawPenalty: number;
  creditedExistingPenalty: number;
  incrementalPenalty: number;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const getActiveUserIds = (lineup: (string | null)[]): string[] =>
  lineup.filter((id): id is string => id !== null);

export const calculateLiveTiredPlayerActionPenalty = (fatigue: number, rng: () => number): number => {
  if (fatigue >= 85) return 0;
  const depth = clamp((85 - fatigue) / 45, 0, 1);
  const deterministicNoise = 0.85 + clamp(rng(), 0, 1) * 0.30;
  return clamp((0.010 + depth * 0.040) * deterministicNoise, 0.010, 0.050);
};

export const calculateLiveInjuredPlayerActionPenalty = (severity: InjurySeverity, rng: () => number): number => {
  const roll = clamp(rng(), 0, 1);
  return severity === InjurySeverity.SEVERE
    ? 0.075 + roll * 0.025
    : 0.050 + roll * 0.025;
};

export const calculateLiveUnusedSubstitutionActionPenalty = (rng: () => number): number =>
  0.020 + clamp(rng(), 0, 1) * 0.030;

/**
 * Match engine user-physical action note
 *
 * What this calculator does:
 * It models the user's live ability to create goal actions when the user's own team is physically
 * compromised. The rule is intentionally scoped to the player-controlled side only: tired user
 * players below 85 condition reduce action creation by 1-5 percentage points each, injured user
 * players left on the pitch reduce action creation by 5-10 percentage points each, and unused user
 * substitutions after minute 60 reduce action creation by 2-5 percentage points per unused change.
 *
 * Why this is not embedded directly in MatchLiveView:
 * The live view already has several physical penalties: average team fatigue, individual tired
 * attackers, late no-rotation pressure, and injury mismatch drag. Adding another inline subtraction
 * would make it very easy to double-count the same condition. This pure function receives the amount
 * already charged by the legacy physical systems as existingPhysicalActionPenalty, then returns only
 * the incremental penalty still needed to reach the user-specific rule.
 *
 * How the RNG is used:
 * The ranges requested by design are deterministic-random ranges, not fully random balance swings.
 * MatchLiveView passes seeded RNG values, so the same match seed and minute produce the same penalty.
 * The noise keeps penalties from feeling mechanically identical while preserving reproducibility for
 * tests and mathematical audits.
 *
 * Why the output contains a breakdown:
 * Fatigue, injuries, and substitutions are separate football reasons. Returning all components makes
 * the result auditable, lets tests verify every rule independently, and gives future UI/debug tooling
 * a single place to explain why a user's team stopped creating chances late in a match.
 */
export const calculateLiveUserPhysicalActionSuppression = ({
  minute,
  lineup,
  fatigueMap,
  matchInjuries,
  substitutionsUsed,
  maxSubstitutions = 5,
  existingPhysicalActionPenalty = 0,
  rng,
}: LiveMatchUserPhysicalActionSuppressionInputs): LiveMatchUserPhysicalActionSuppression => {
  const activeIds = getActiveUserIds(lineup);
  const tiredPlayerPenalties = activeIds
    .map(id => calculateLiveTiredPlayerActionPenalty(fatigueMap[id] ?? 100, rng))
    .filter(value => value > 0);
  const injuredPlayerPenalties = activeIds
    .map(id => matchInjuries[id])
    .filter((severity): severity is InjurySeverity => severity !== undefined)
    .map(severity => calculateLiveInjuredPlayerActionPenalty(severity, rng));
  const unusedSubstitutions = minute >= 60
    ? clamp(Math.floor(maxSubstitutions - substitutionsUsed), 0, maxSubstitutions)
    : 0;
  const substitutionPenalties = Array.from({ length: unusedSubstitutions }, () =>
    calculateLiveUnusedSubstitutionActionPenalty(rng)
  );
  const fatiguePenalty = tiredPlayerPenalties.reduce((sum, value) => sum + value, 0);
  const injuryPenalty = injuredPlayerPenalties.reduce((sum, value) => sum + value, 0);
  const substitutionPenalty = substitutionPenalties.reduce((sum, value) => sum + value, 0);
  const rawPenalty = fatiguePenalty + injuryPenalty + substitutionPenalty;
  const creditedExistingPenalty = clamp(existingPhysicalActionPenalty, 0, 0.60);

  return {
    tiredPlayerCount: tiredPlayerPenalties.length,
    injuredPlayerCount: injuredPlayerPenalties.length,
    unusedSubstitutions,
    fatiguePenalty,
    injuryPenalty,
    substitutionPenalty,
    rawPenalty,
    creditedExistingPenalty,
    incrementalPenalty: clamp(rawPenalty - creditedExistingPenalty, 0, 0.42),
  };
};
