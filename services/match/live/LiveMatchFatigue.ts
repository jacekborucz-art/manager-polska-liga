export type LiveMatchFatigueImpactInputs = {
  minute: number;
  lineup: (string | null)[];
  fatigueMap: Record<string, number>;
  ownSubs: number;
  opponentSubs: number;
};

export type LiveMatchFatigueImpact = {
  averageFatigue: number;
  fatiguePenalty: number;
  rotationPenalty: number;
  totalPenalty: number;
};

export const getAverageLiveFatigue = (
  lineup: (string | null)[],
  fatigueMap: Record<string, number>
): number => {
  const ids = lineup.filter((id): id is string => id !== null);
  if (ids.length === 0) return 100;
  return ids.reduce((acc, id) => acc + (fatigueMap[id] ?? 100), 0) / ids.length;
};

export const calculateLiveFatiguePenalty = (averageFatigue: number): number => {
  if (averageFatigue >= 94) return 0;
  const depth = (94 - averageFatigue) / 94;
  return -(Math.pow(depth, 1.25) * 0.42);
};

export const calculateLiveRotationPenalty = ({
  minute,
  lineup,
  fatigueMap,
  ownSubs,
  opponentSubs,
}: LiveMatchFatigueImpactInputs): number => {
  if (minute < 60 || ownSubs >= 2) return 0;
  const ids = lineup.filter((id): id is string => id !== null);
  if (ids.length === 0) return 0;
  const tiredShare = ids.filter(id => (fatigueMap[id] ?? 100) < 84).length / ids.length;
  const lateFactor = Math.min(1, (minute - 60) / 30);
  const rotationGap = Math.max(0, opponentSubs - ownSubs);
  const pressure = ((2 - ownSubs) * 0.012) + tiredShare * 0.052 + rotationGap * 0.010;
  return -Math.min(0.085, pressure * lateFactor);
};

/**
 * Match engine migration note
 *
 * What this calculator does:
 * It centralizes the live team fatigue impact that was previously embedded in MatchLiveView.
 * The output keeps the same three legacy signals: averageFatigue, the nonlinear fatiguePenalty,
 * and the late rotationPenalty for teams that delay or avoid substitutions.
 *
 * Why this matters:
 * Fatigue is a core match-engine pressure point. It influences initiative, shot thresholds,
 * attacking/defending effectiveness, injury pressure, and the perceived value of substitutions.
 * When these calculations live inside the React view, it is difficult to test whether a future
 * balance change affects only fatigue or accidentally changes another part of the minute loop.
 *
 * How this phase preserves behavior:
 * The formulas here are copied from the existing live engine without changing constants, thresholds,
 * or curves. The extraction is deliberately boring: it moves ownership into a pure function while
 * keeping the current match balance stable. Future changes can tune the curve here, but only after
 * adding range/golden-match tests for substitutions, late-game shot volume, injuries, and comeback
 * pressure.
 *
 * What should happen next:
 * MatchLiveView should call this builder for HOME and AWAY each minute, then pass totalPenalty and
 * averageFatigue into initiative and shot calculators. Later, this module can absorb additional
 * weather-driven fatigue drain and player-specific stamina/strength effects that are currently
 * scattered through the match loop.
 */
export const calculateLiveMatchFatigueImpact = (inputs: LiveMatchFatigueImpactInputs): LiveMatchFatigueImpact => {
  const averageFatigue = getAverageLiveFatigue(inputs.lineup, inputs.fatigueMap);
  const fatiguePenalty = calculateLiveFatiguePenalty(averageFatigue);
  const rotationPenalty = calculateLiveRotationPenalty(inputs);

  return {
    averageFatigue,
    fatiguePenalty,
    rotationPenalty,
    totalPenalty: fatiguePenalty + rotationPenalty,
  };
};
