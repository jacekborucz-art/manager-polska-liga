import { MatchEventType } from '../../../../types';
import type {
  CupActionIntent,
  CupChance,
  CupMatchEvent,
  CupPitchZone,
  CupPossessionDecision,
  CupTeamRuntimeProfile,
  CupTickContext,
} from './CupMatchTypes';
import { clamp } from './CupMath';
import { CupMatchClockService } from './CupMatchClockService';

type SequenceContext = {
  ctx: CupTickContext;
  attacking: CupTeamRuntimeProfile;
  defending: CupTeamRuntimeProfile;
  intent: CupActionIntent;
  decision: CupPossessionDecision;
  sequenceId: string;
};

const baseEvent = (
  ctx: CupTickContext,
  sequenceId: string,
  suffix: string,
): Pick<CupMatchEvent, 'id' | 'second' | 'minute' | 'detail'> => ({
  id: `${sequenceId}_${suffix}`,
  second: ctx.state.second,
  minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
  detail: { sequenceId },
});

const isWideZone = (zone: CupPitchZone): boolean =>
  zone === 'WIDE_LEFT' || zone === 'WIDE_RIGHT';

export const CupActionSequenceService = {
  /**
   * Builds the visible, player-attributed chain for successful progression.
   * These events describe an outcome already resolved by the calibrated team
   * model. They must never make a second hidden success roll or alter balance.
   */
  createProgressionEvents: ({
    ctx,
    attacking,
    intent,
    decision,
    sequenceId,
    fromZone,
    toZone,
  }: SequenceContext & { fromZone: CupPitchZone; toZone: CupPitchZone }): CupMatchEvent[] => {
    const passer = decision.passer;
    const receiver = decision.receiver;
    if (!passer || !receiver) return [];

    if (decision.action === 'DRIBBLE') {
      const dribbleBase = baseEvent(ctx, sequenceId, 'carry');
      return [{
        ...dribbleBase,
        side: attacking.side,
        type: MatchEventType.DRIBBLING,
        zone: toZone,
        pattern: intent.pattern,
        playerId: passer.id,
        secondaryPlayerId: decision.presser?.id,
        text: `${passer.lastName} rusza z piłką i prowadzi akcję do przodu.`,
        detail: {
          ...dribbleBase.detail,
          fromZone,
          toZone,
          succeeded: true,
          dribblingQuality: passer.attributes.dribbling,
          actionDecision: decision.action,
          startX: decision.spatial?.passerX,
          startY: decision.spatial?.passerY,
          endX: decision.spatial?.receiverX,
          endY: decision.spatial?.receiverY,
          passDistance: decision.spatial?.passDistance,
          laneClearance: decision.spatial?.laneClearance,
          receiverPressure: decision.spatial?.receiverPressure,
        },
      }];
    }

    const eventBase = baseEvent(ctx, sequenceId, 'delivery');
    const crossingDecision = decision.action === 'CROSS' || (
      isWideZone(fromZone) && (toZone === 'BOX' || toZone === 'FINAL_THIRD')
    );
    const delivery: CupMatchEvent = crossingDecision
      ? {
          ...eventBase,
          side: attacking.side,
          type: ctx.random(281) < 0.58 ? MatchEventType.CROSS_NEAR_POST : MatchEventType.CROSS_FAR_POST,
          zone: toZone,
          pattern: intent.pattern,
          playerId: passer.id,
          secondaryPlayerId: receiver.id,
          text: `${passer.lastName} dośrodkowuje do ${receiver.lastName}.`,
          detail: {
            ...eventBase.detail,
            fromZone,
            toZone,
            completed: true,
            passerQuality: passer.attributes.crossing,
            receiverMovement: receiver.attributes.positioning,
            actionDecision: decision.action,
            startX: decision.spatial?.passerX,
            startY: decision.spatial?.passerY,
            endX: decision.spatial?.receiverX,
            endY: decision.spatial?.receiverY,
            passDistance: decision.spatial?.passDistance,
            laneClearance: decision.spatial?.laneClearance,
            receiverPressure: decision.spatial?.receiverPressure,
          },
        }
      : {
          ...eventBase,
          side: attacking.side,
          type: MatchEventType.PASS_COMPLETED,
          zone: toZone,
          pattern: intent.pattern,
          playerId: passer.id,
          secondaryPlayerId: receiver.id,
          text: decision.action === 'DIRECT_PASS'
            ? `${passer.lastName} zagrywa odważnie do przodu do ${receiver.lastName}.`
            : `${passer.lastName} podaje do ${receiver.lastName}.`,
          detail: {
            ...eventBase.detail,
            fromZone,
            toZone,
            passerQuality: passer.attributes.passing,
            receiverMovement: receiver.attributes.positioning,
            actionDecision: decision.action,
            startX: decision.spatial?.passerX,
            startY: decision.spatial?.passerY,
            endX: decision.spatial?.receiverX,
            endY: decision.spatial?.receiverY,
            passDistance: decision.spatial?.passDistance,
            laneClearance: decision.spatial?.laneClearance,
            receiverPressure: decision.spatial?.receiverPressure,
          },
        };

    const controlBase = baseEvent(ctx, sequenceId, 'control');
    const events: CupMatchEvent[] = [delivery, {
      ...controlBase,
      side: attacking.side,
      type: MatchEventType.BALL_CONTROL,
      zone: toZone,
      pattern: intent.pattern,
      playerId: receiver.id,
      secondaryPlayerId: passer.id,
      text: `${receiver.lastName} opanowuje piłkę i podtrzymuje akcję.`,
      detail: {
        ...controlBase.detail,
        controlQuality: receiver.attributes.technique,
        underPressureFromId: decision.presser?.id,
        startX: decision.spatial?.receiverX,
        startY: decision.spatial?.receiverY,
      },
    }];

    const dribbleChance = clamp(
      0.06 + receiver.attributes.dribbling * 0.0012 + (intent.pattern === 'COUNTER' ? 0.08 : 0),
      0.07,
      0.25,
    );
    if (toZone !== 'GK' && toZone !== 'DEFENSE' && ctx.random(282) < dribbleChance) {
      const dribbleBase = baseEvent(ctx, sequenceId, 'dribble');
      events.push({
        ...dribbleBase,
        side: attacking.side,
        type: MatchEventType.DRIBBLING,
        zone: toZone,
        pattern: intent.pattern,
        playerId: receiver.id,
        secondaryPlayerId: decision.presser?.id,
        text: `${receiver.lastName} mija rywala z piłką przy nodze.`,
        detail: {
          ...dribbleBase.detail,
          succeeded: true,
          dribblingQuality: receiver.attributes.dribbling,
          startX: decision.spatial?.receiverX,
          startY: decision.spatial?.receiverY,
        },
      });
    }

    return events;
  },

  /** A turnover can be an interception or an actual tackle; both share one result. */
  createTurnoverEvent: ({
    ctx,
    attacking,
    defending,
    intent,
    decision,
    sequenceId,
  }: SequenceContext): CupMatchEvent => {
    const tackler = decision.presser;
    const loser = decision.passer;
    const tackleChance = clamp(0.30 + defending.pressing * 0.0022, 0.34, 0.56);
    const tackle = Boolean(tackler && loser && ctx.random(283) < tackleChance);
    const eventBase = baseEvent(ctx, sequenceId, tackle ? 'tackle' : 'interception');
    return {
      ...eventBase,
      side: defending.side,
      type: tackle ? MatchEventType.TACKLE_WON : MatchEventType.MISPLACED_PASS,
      zone: ctx.state.ballZone,
      pattern: intent.pattern,
      playerId: tackler?.id,
      secondaryPlayerId: loser?.id,
      text: tackler && loser
        ? tackle
          ? `${tackler.lastName} wygrywa pojedynek z zawodnikiem ${loser.lastName}.`
          : `${tackler.lastName} przechwytuje niedokładne podanie zawodnika ${loser.lastName}.`
        : `${defending.side === 'HOME' ? ctx.input.home.name : ctx.input.away.name} odbiera piłkę.`,
      detail: {
        ...eventBase.detail,
        possessionWinnerId: tackler?.id,
        possessionLoserId: loser?.id,
        tackle,
      },
    };
  },

  /**
   * A shot is preceded by the concrete final delivery and first touch. This is
   * what lets SVG replay one coherent goal rather than three unrelated cues.
   */
  createChanceBuildup: ({
    ctx,
    attacking,
    intent,
    sequenceId,
    chance,
  }: Omit<SequenceContext, 'defending' | 'decision'> & { chance: CupChance }): CupMatchEvent[] => {
    const creator = chance.creator;
    const shooter = chance.shooter;
    const events: CupMatchEvent[] = [];

    if (creator && creator.id !== shooter.id) {
      const deliveryBase = baseEvent(ctx, sequenceId, 'chance_delivery');
      const cross = intent.pattern === 'WING_PLAY' || isWideZone(ctx.state.ballZone);
      events.push({
        ...deliveryBase,
        side: attacking.side,
        type: cross
          ? (ctx.random(284) < 0.58 ? MatchEventType.CROSS_NEAR_POST : MatchEventType.CROSS_FAR_POST)
          : MatchEventType.PASS_COMPLETED,
        zone: chance.zone,
        pattern: chance.pattern,
        playerId: creator.id,
        secondaryPlayerId: shooter.id,
        text: cross
          ? `${creator.lastName} posyła dośrodkowanie do ${shooter.lastName}.`
          : `${creator.lastName} otwiera drogę do bramki podaniem do ${shooter.lastName}.`,
        detail: {
          ...deliveryBase.detail,
          fromZone: ctx.state.ballZone,
          toZone: chance.zone,
          completed: true,
          chanceCreatingDelivery: true,
          passerQuality: cross ? creator.attributes.crossing : creator.attributes.passing,
          receiverMovement: shooter.attributes.positioning,
        },
      });
    }

    const controlBase = baseEvent(ctx, sequenceId, 'chance_control');
    events.push({
      ...controlBase,
      side: attacking.side,
      type: MatchEventType.BALL_CONTROL,
      zone: chance.zone,
      pattern: chance.pattern,
      playerId: shooter.id,
      secondaryPlayerId: creator?.id,
      text: `${shooter.lastName} przygotowuje sobie pozycję do strzału.`,
      detail: {
        ...controlBase.detail,
        controlQuality: shooter.attributes.technique,
        shotPreparation: true,
      },
    });

    if (chance.kind === 'ONE_ON_ONE' || intent.pattern === 'COUNTER') {
      const dribbleBase = baseEvent(ctx, sequenceId, 'chance_dribble');
      events.push({
        ...dribbleBase,
        side: attacking.side,
        type: MatchEventType.DRIBBLING,
        zone: chance.zone,
        pattern: chance.pattern,
        playerId: shooter.id,
        secondaryPlayerId: chance.marker?.id,
        text: `${shooter.lastName} prowadzi piłkę w kierunku bramki.`,
        detail: { ...dribbleBase.detail, succeeded: true },
      });
    }

    return events;
  },
};
