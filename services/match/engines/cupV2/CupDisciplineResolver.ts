import { MatchEventType } from '../../../../types';
import type { CupMatchEvent, CupTeamRuntimeProfile, CupTickContext } from './CupMatchTypes';
import { clamp, pickWeighted, weightedScore } from './CupMath';
import { CupMatchClockService } from './CupMatchClockService';

const selectFouler = (
  profile: CupTeamRuntimeProfile,
  roll: number,
) => {
  const pool = profile.activePlayers.length > 0 ? profile.activePlayers : profile.outfieldPlayers;
  if (pool.length === 0) return undefined;

  return pickWeighted(pool.map(player => ({
    item: player,
    weight:
      weightedScore(player.attributes, {
        aggression: 0.24,
        defending: 0.20,
        workRate: 0.16,
        strength: 0.13,
        pace: 0.09,
        positioning: 0.08,
        mentality: 0.06,
        stamina: 0.04,
      }) +
      (player.position === 'DEF' ? 12 : player.position === 'MID' ? 7 : player.position === 'FWD' ? 3 : -12),
  })), roll);
};

const selectFouledPlayer = (
  profile: CupTeamRuntimeProfile,
  roll: number,
) => {
  const pool = profile.outfieldPlayers.length > 0 ? profile.outfieldPlayers : profile.activePlayers;
  if (pool.length === 0) return undefined;

  return pickWeighted(pool.map(player => ({
    item: player,
    weight:
      weightedScore(player.attributes, {
        dribbling: 0.22,
        pace: 0.18,
        technique: 0.16,
        attacking: 0.14,
        vision: 0.10,
        strength: 0.08,
        mentality: 0.07,
        workRate: 0.05,
      }) +
      (player.position === 'FWD' ? 12 : player.position === 'MID' ? 8 : player.position === 'DEF' ? 2 : -18),
  })), roll);
};

export const CupDisciplineResolver = {
  /**
   * Faule i kartki wynikają z kontaktu w konkretnej fazie: pressingu,
   * kontrataku, pojedynku skrzydłowego albo ratowania sytuacji. Sędzia nie
   * generuje fauli sam z siebie, tylko interpretuje kontakt według własnych cech.
   */
  resolveContact: ({
    ctx,
    defending,
    attacking,
    danger,
    salt,
  }: {
    ctx: CupTickContext;
    defending: CupTeamRuntimeProfile;
    attacking: CupTeamRuntimeProfile;
    danger: number;
    salt: number;
  }): CupMatchEvent | null => {
    const referee = ctx.input.environment.referee;
    const strictness = referee.strictness / 100;
    const advantage = referee.advantageTendency / 100;
    const consistencyNoise = (1 - referee.consistency / 100) * (ctx.random(salt + 1) - 0.5) * 0.08;
    const foulChance = clamp((
      0.026 +
      defending.disciplineRisk * 0.00070 +
      defending.pressing * 0.00032 +
      danger * 0.045 +
      strictness * 0.018 -
      consistencyNoise
    ) * ctx.state.coachEffects[defending.side].foulMultiplier,
      0.004,
      0.16
    );

    if (ctx.random(salt + 2) > foulChance) return null;

    const yellowChance = clamp(0.11 + strictness * 0.22 + danger * 0.25 + defending.disciplineRisk * 0.0009, 0.06, 0.62);
    const redChance = clamp(0.004 + strictness * 0.018 + Math.max(0, danger - 0.75) * 0.07, 0.002, 0.12);
    const initialType = ctx.random(salt + 3) < redChance
      ? MatchEventType.RED_CARD
      : ctx.random(salt + 4) < yellowChance
      ? MatchEventType.YELLOW_CARD
      : MatchEventType.FOUL;
    const fouler = selectFouler(defending, ctx.random(salt + 5));
    const fouled = selectFouledPlayer(attacking, ctx.random(salt + 6));
    const advantageChance = clamp(advantage * 0.55 + danger * 0.18 - strictness * 0.10, 0.03, 0.68);
    const advantagePlayed = initialType === MatchEventType.FOUL && ctx.random(salt + 7) < advantageChance;
    // A second caution must remove the player. Keeping this decision here
    // means profiles, spatial state and statistics all see the same red-card
    // event on the next tick rather than merely storing two yellow counters.
    const secondYellow = initialType === MatchEventType.YELLOW_CARD && Boolean(fouler && (ctx.state.yellowCards[fouler.id] ?? 0) >= 1);
    const type = advantagePlayed
      ? MatchEventType.ADVANTAGE_PLAYED
      : secondYellow
        ? MatchEventType.RED_CARD
        : initialType;
    const defendingTeamName = defending.side === 'HOME' ? ctx.input.home.name : ctx.input.away.name;
    const foulerName = fouler ? fouler.lastName : defendingTeamName;
    const fouledName = fouled ? fouled.lastName : 'rywala';

    return {
      id: `cupv2_contact_${ctx.state.second}_${salt}`,
      second: ctx.state.second,
      minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
      side: defending.side,
      type,
      playerId: fouler?.id,
      secondaryPlayerId: fouled?.id,
      text: advantagePlayed
        ? `${foulerName} fauluje ${fouledName}, ale sędzia stosuje przywilej korzyści.`
        : `${foulerName} przerywa akcję faulem na ${fouledName}.`,
      detail: {
        danger,
        refereeStrictness: referee.strictness,
        refereeConsistency: referee.consistency,
        attackingSide: attacking.side,
        foulerId: fouler?.id,
        fouledPlayerId: fouled?.id,
        secondYellow,
        advantagePlayed,
      },
    };
  },
};
