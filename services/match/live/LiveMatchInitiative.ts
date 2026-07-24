export type LiveMatchInitiativeInputs = {
  momentum: number;
  minute: number;
  homeFatPenalty: number;
  awayFatPenalty: number;
  homePressureInitiativeMultiplier: number;
  awayPressureInitiativeMultiplier: number;
  homeFormInitiativeModifier: number;
  awayFormInitiativeModifier: number;
  homeFormStacking: number;
  awayFormStacking: number;
  homePlayerFormGoalChanceMultiplier: number;
  awayPlayerFormGoalChanceMultiplier: number;
  midfieldControlDiff: number;
  homeQualityGapLive: number;
  shotGapLive: number;
  homeGoalkeeperCrisisPenalty: number;
  awayGoalkeeperCrisisPenalty: number;
  homeSentOffCount: number;
  awaySentOffCount: number;
  homeProfileReadiness?: number;
  awayProfileReadiness?: number;
};

export type LiveMatchInitiativeModifiers = {
  fatigue: number;
  pressure: number;
  form: number;
  playerForm: number;
  midfield: number;
  quality: number;
  shotDominance: number;
  goalkeeperCrisis: number;
  redCards: number;
};

export type LiveMatchInitiativeResult = {
  homeAttackChance: number;
  modifiers: LiveMatchInitiativeModifiers;
  profileReadinessGap: number | null;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const getLegacyQualityGapCurve = (gap: number): number => {
  const absGap = Math.abs(gap);
  if (absGap <= 2) return 0;
  const normalized = Math.min(1, (absGap - 2) / 18);
  return Math.sign(gap) * Math.pow(normalized, 1.35);
};

/**
 * Match engine migration note
 *
 * What this calculator does:
 * It owns the live initiative calculation that decides the base HOME/AWAY attack chance for a
 * simulated minute. The formula below is intentionally the same as the previous inline block in
 * MatchLiveView: fatigue penalty, pressure, team form, player form, midfield control, role-adjusted
 * quality gap, shot dominance rubber-banding, goalkeeper crisis, red cards, and momentum are all
 * combined into one clamped probability.
 *
 * Why this is being extracted:
 * Initiative is one of the most important control points in the match engine. It shapes which side
 * receives the next attacking phase, which then influences shot volume, goal chance, corners, fouls,
 * injuries, penalties, commentary, and AI reactions. Keeping this calculation inside the React view
 * makes it hard to test and hard to evolve. Moving it into a pure function gives us a stable contract
 * before changing any balance.
 *
 * How the profile fields are handled:
 * homeProfileReadiness and awayProfileReadiness are accepted now so the newly introduced team profile
 * can be threaded into the initiative layer without changing outcomes. The current result exposes the
 * readiness gap as diagnostics only. A future phase may use that gap as a small calibrated modifier,
 * but that must happen with golden-match/range tests because it will affect match balance.
 *
 * What must stay true during this phase:
 * This function must reproduce the legacy MatchLiveView math exactly. If a future edit changes the
 * chance curve, clamps, or modifier weights, it should update the tests and explain the intended match
 * behavior change in the same commit or migration step.
 */
export const calculateLiveMatchInitiative = (inputs: LiveMatchInitiativeInputs): LiveMatchInitiativeResult => {
  const midfield =
    Math.abs(inputs.midfieldControlDiff) <= 2
      ? 0
      : clamp(inputs.midfieldControlDiff * 0.0014, -0.026, 0.026);

  const quality = getLegacyQualityGapCurve(inputs.homeQualityGapLive) * 0.055;

  const shotDominance =
    inputs.minute < 25 || Math.abs(inputs.shotGapLive) < 8
      ? 0
      : -Math.sign(inputs.shotGapLive) *
        Math.min(0.055, (Math.abs(inputs.shotGapLive) - 7) * 0.006) *
        (Math.sign(inputs.shotGapLive) === Math.sign(inputs.homeQualityGapLive) && Math.abs(inputs.homeQualityGapLive) > 8 ? 0.45 : 1);

  const modifiers: LiveMatchInitiativeModifiers = {
    fatigue: (inputs.homeFatPenalty - inputs.awayFatPenalty) * 3.0,
    pressure: ((inputs.homePressureInitiativeMultiplier - 1) - (inputs.awayPressureInitiativeMultiplier - 1)) * 0.42,
    form: (inputs.homeFormInitiativeModifier * inputs.homeFormStacking) - (inputs.awayFormInitiativeModifier * inputs.awayFormStacking),
    playerForm: clamp(
      (inputs.homePlayerFormGoalChanceMultiplier - inputs.awayPlayerFormGoalChanceMultiplier) * 0.055,
      -0.060,
      0.060
    ),
    midfield,
    quality,
    shotDominance,
    goalkeeperCrisis: inputs.awayGoalkeeperCrisisPenalty - inputs.homeGoalkeeperCrisisPenalty,
    redCards: (inputs.awaySentOffCount - inputs.homeSentOffCount) * 0.065,
  };

  const homeAttackChance = clamp(
    0.5 +
      inputs.momentum / 340 +
      modifiers.fatigue +
      modifiers.pressure +
      modifiers.form +
      modifiers.playerForm +
      modifiers.midfield +
      modifiers.quality +
      modifiers.shotDominance +
      modifiers.goalkeeperCrisis +
      modifiers.redCards,
    0.28,
    0.72
  );

  return {
    homeAttackChance,
    modifiers,
    profileReadinessGap:
      inputs.homeProfileReadiness === undefined || inputs.awayProfileReadiness === undefined
        ? null
        : inputs.homeProfileReadiness - inputs.awayProfileReadiness,
  };
};
