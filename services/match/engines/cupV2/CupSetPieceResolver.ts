import { MatchEventType } from '../../../../types';
import type { CupChance, CupMatchEvent, CupTeamRuntimeProfile, CupTickContext } from './CupMatchTypes';
import { clamp, pickWeighted, weightedScore } from './CupMath';
import { CupMatchClockService } from './CupMatchClockService';

export type CupSetPieceKind = 'CORNER' | 'FREE_KICK_WIDE' | 'FREE_KICK_DIRECT' | 'PENALTY';

export const CupSetPieceResolver = {
  /**
   * Stałe fragmenty powinny powstawać z wcześniejszego zdarzenia: faulu,
   * wybicia na róg, ręki, zablokowanego dośrodkowania albo ostrego pressingu.
   * Ten moduł nie powinien sam zwiększać tempa meczu; ma tylko rozstrzygać
   * jakość już przyznanego stałego fragmentu.
   */
  createSetPieceChance: ({
    ctx,
    attacking,
    defending,
    kind,
  }: {
    ctx: CupTickContext;
    attacking: CupTeamRuntimeProfile;
    defending: CupTeamRuntimeProfile;
    kind: CupSetPieceKind;
  }): CupChance | null => {
    const takers = attacking.activePlayers;
    const targets = attacking.outfieldPlayers;
    if (takers.length === 0 || targets.length === 0) return null;

    const taker = pickWeighted(takers.map(player => ({
      item: player,
      weight: weightedScore(player.attributes, {
        freeKicks: kind === 'FREE_KICK_DIRECT' ? 0.34 : 0.16,
        corners: kind === 'CORNER' ? 0.32 : 0.10,
        crossing: 0.18,
        technique: 0.16,
        vision: 0.12,
        mentality: 0.10,
      }),
    })), ctx.random(501));

    const selectedTarget = pickWeighted(targets.map(player => ({
      item: player,
      weight: weightedScore(player.attributes, {
        heading: kind === 'CORNER' || kind === 'FREE_KICK_WIDE' ? 0.28 : 0.08,
        positioning: 0.18,
        attacking: 0.16,
        finishing: 0.14,
        strength: 0.12,
        technique: 0.07,
        mentality: 0.05,
      }),
    })), ctx.random(502));
    // The set-piece taker is also the penalty shooter. Selecting a separate
    // aerial target here produced impossible penalty assists and wrong takers.
    const shooter = kind === 'PENALTY' ? taker : selectedTarget;

    const delivery =
      weightedScore(taker.attributes, {
        freeKicks: 0.22,
        corners: kind === 'CORNER' ? 0.24 : 0.08,
        crossing: 0.22,
        technique: 0.16,
        vision: 0.10,
        mentality: 0.06,
      }) +
      attacking.setPieces * 0.25 -
      defending.defensiveShape * 0.16 -
      defending.goalkeeperQuality * 0.08;

    const chanceProbability = clamp(0.08 + delivery * 0.0022, 0.025, 0.34);
    if (ctx.random(503) > chanceProbability) return null;

    const baseXg =
      kind === 'PENALTY' ? 0.76 :
      kind === 'FREE_KICK_DIRECT' ? 0.075 :
      kind === 'CORNER' ? 0.055 :
      0.065;

    return {
      side: attacking.side,
      kind: 'SET_PIECE',
      zone: kind === 'PENALTY' ? 'BOX' : 'FINAL_THIRD',
      pattern: 'SET_PIECE',
      shooter,
      creator: taker.id === shooter.id ? undefined : taker,
      marker: defending.defenders[0],
      xG: clamp(baseXg + (delivery - 50) * 0.0018, 0.025, kind === 'PENALTY' ? 0.82 : 0.22),
      pressure: ctx.state.pressure[attacking.side],
      angle: kind === 'FREE_KICK_DIRECT' ? 0.44 : 0.62,
      distance: kind === 'PENALTY' ? 11 : kind === 'FREE_KICK_DIRECT' ? 22 : 9,
    };
  },

  eventForAward: (ctx: CupTickContext, side: 'HOME' | 'AWAY', kind: CupSetPieceKind): CupMatchEvent => ({
    id: `cupv2_setpiece_award_${ctx.state.second}_${kind}`,
    second: ctx.state.second,
    minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
    side,
    type:
      kind === 'CORNER' ? MatchEventType.CORNER :
      kind === 'PENALTY' ? MatchEventType.PENALTY_AWARDED :
      kind === 'FREE_KICK_DIRECT' ? MatchEventType.FREE_KICK_DANGEROUS :
      MatchEventType.FREE_KICK,
    zone: kind === 'CORNER' ? 'WIDE_LEFT' : 'FINAL_THIRD',
    pattern: 'SET_PIECE',
    text: `${side === 'HOME' ? ctx.input.home.name : ctx.input.away.name} otrzymuje stały fragment gry.`,
  }),
};
