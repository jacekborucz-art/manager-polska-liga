export interface PolishCupResumeClockInput {
  isExtraTime: boolean;
  period: number;
  minute: number;
}

export interface PolishCupResumeClock {
  period: number;
  minute: number;
}

/**
 * A regular halftime resumes period 2 at 45:00. The extra-time interval is a
 * different phase and must resume period 4 at 105:00. Treating both breaks as
 * the same state used to restart the regular second half after minute 105,
 * preventing the proper 2x15 extra-time flow from ever reaching penalties.
 */
export const getPolishCupResumeClock = (state: PolishCupResumeClockInput): PolishCupResumeClock =>
  state.isExtraTime && state.period === 3 && state.minute >= 105
    ? { period: 4, minute: 105 }
    : { period: 2, minute: 45 };

/**
 * Per-player, per-minute progressive injury probability caused by exhaustion.
 * The previous curve returned fractions such as 0.15, 0.50 and 0.90, which are
 * 15%, 50% and 90% chances every minute. Late matches consequently produced
 * clusters of injuries, empty lineups and false walkovers. This curve remains
 * progressive but is capped at 1.2% for a player at complete exhaustion.
 */
export const getPolishCupExhaustionInjuryChance = (condition: number): number => {
  const normalized = Math.max(0, Math.min(100, condition));
  if (normalized >= 64) return 0;
  if (normalized >= 50) return ((64 - normalized) / 14) * 0.0025;
  if (normalized >= 15) return 0.0025 + ((50 - normalized) / 35) * 0.0065;
  return 0.009 + ((15 - normalized) / 15) * 0.003;
};

// IFAB Law 3: a match cannot continue only when a team has fewer than seven players.
export const hasPolishCupWalkoverPlayerCount = (playersOnPitch: number): boolean => playersOnPitch < 7;
