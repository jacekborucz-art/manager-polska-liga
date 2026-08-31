import type { MatchEngineV2Rules } from './MatchEngineV2Types';

/** First production target: a regular Polish league match that may end level. */
export const LEAGUE_MATCH_RULES_V2: MatchEngineV2Rules = Object.freeze({
  id: 'POLISH_LEAGUE_2026_27',
  normalTimeSeconds: 90 * 60,
  extraTimeSeconds: 0,
  maxSubstitutions: 5,
  allowDraw: true,
  enableExtraTime: false,
  enablePenaltyShootout: false,
});

/** Kept as a later adapter target; it proves competition behavior is data-driven. */
export const KNOCKOUT_MATCH_RULES_V2: MatchEngineV2Rules = Object.freeze({
  id: 'KNOCKOUT_STANDARD',
  normalTimeSeconds: 90 * 60,
  extraTimeSeconds: 30 * 60,
  maxSubstitutions: 5,
  allowDraw: false,
  enableExtraTime: true,
  enablePenaltyShootout: true,
});

export const validateMatchEngineV2Rules = (rules: MatchEngineV2Rules): void => {
  if (!rules.id.trim()) throw new Error('Match Engine V2 rules require an id.');
  if (rules.normalTimeSeconds <= 0) throw new Error('Normal time must be positive.');
  if (rules.maxSubstitutions < 0) throw new Error('Substitution limit cannot be negative.');
  if (rules.enablePenaltyShootout && rules.allowDraw) {
    throw new Error('A match cannot both allow a draw and require penalties.');
  }
  if (rules.enableExtraTime && rules.extraTimeSeconds <= 0) {
    throw new Error('Extra time must have a positive duration when enabled.');
  }
};

