/**
 * Match engine migration note
 *
 * What this module does:
 * This file centralizes the legacy deterministic random helpers used by the live match
 * simulation and the AI tactical services. The previous implementation duplicated small
 * sine-based helper functions in MatchLiveView and in multiple AI services. The helpers
 * below intentionally keep those exact formulas so this extraction changes ownership and
 * readability only; it must not change match balance, event probability, AI timing, or
 * scouting accuracy.
 *
 * Why this is necessary:
 * The match engine currently has several layers that all depend on random-looking values:
 * live events, AI tactical choices, pre-match reports, late-game reactions, display stat
 * floors, penalties, cards, injuries, and momentum swings. When each area owns a private
 * RNG helper, future balancing becomes risky because two identical-looking changes may
 * actually affect different formulas. A single module makes that dependency visible and
 * gives the engine a safe place to evolve toward full replay determinism later.
 *
 * How this migration should be continued:
 * 1. First, import these legacy helpers wherever the old duplicated formulas exist.
 * 2. Do not alter numeric formulas during the extraction step.
 * 3. Once the engine has tests or golden-match snapshots, introduce a stronger seeded RNG
 *    behind a new API and migrate callers gradually.
 * 4. Keep random stream names or offsets explicit when new domains are added, so penalties,
 *    injuries, AI decisions, and display-only stat polishing do not accidentally influence
 *    each other.
 *
 * What this does not solve yet:
 * The live match session seed is still created from Date.now() and Math.random() because
 * that is the existing behavior. This preserves the current "new match, new story" feel,
 * but it is not enough for perfect replay/debug reproducibility. A future phase should
 * derive the session seed from fixture id, squads, tactical setup, weather, referee, and
 * user-visible match setup once the current behavior is covered by verification.
 */

export const getLegacyOffsetSeededValue = (seed: number, offset: number = 0): number => {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
};

export const getLegacyMinuteSeededValue = (seed: number, minute: number, offset: number = 0): number => {
  const x = Math.sin(seed + minute + offset) * 10000;
  return x - Math.floor(x);
};

export const getLegacySpreadOffsetSeededValue = (seed: number, offset: number = 0): number => {
  const x = Math.sin(seed + offset * 9973) * 10000;
  return x - Math.floor(x);
};

export const createRuntimeSessionSeed = (): number => {
  return Math.abs(Math.floor(Date.now() * Math.random()));
};
