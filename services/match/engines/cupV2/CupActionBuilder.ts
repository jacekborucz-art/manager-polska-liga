import { MatchEventType } from '../../../../types';
import type {
  CupActionIntent,
  CupActionOutcome,
  CupAttackPattern,
  CupChance,
  CupMatchEvent,
  CupPitchZone,
  CupShotOutcome,
  CupTeamRuntimeProfile,
  CupTickContext,
} from './CupMatchTypes';
import { clamp, contestProbability, pickWeighted, weightedScore } from './CupMath';
import { CupChanceCreationService } from './CupChanceCreationService';
import { CupDisciplineResolver } from './CupDisciplineResolver';
import { CupInjuryResolver } from './CupInjuryResolver';
import { CupOwnGoalResolver } from './CupOwnGoalResolver';
import { CupActionSequenceService } from './CupActionSequenceService';
import { CupPlayerDecisionService } from './CupPlayerDecisionService';
import { CupMatchClockService } from './CupMatchClockService';
import { CupSetPieceResolver, type CupSetPieceKind } from './CupSetPieceResolver';
import { CupShotResolver } from './CupShotResolver';

const opponentSide = (side: 'HOME' | 'AWAY') => side === 'HOME' ? 'AWAY' : 'HOME';

const profileForSide = (ctx: CupTickContext, side: 'HOME' | 'AWAY'): CupTeamRuntimeProfile =>
  side === 'HOME' ? ctx.homeProfile : ctx.awayProfile;

// Keep one weather conversion for normal shots, set pieces and rebounds. The
// previous value became too weak once added time and foul restarts introduced
// more attempts, so poor conditions no longer produced a measurable accuracy
// cost in the multi-scenario test.
const weatherShotPenalty = (ctx: CupTickContext): number =>
  Math.max(0, (ctx.input.environment.weather?.weatherIntensity ?? 0) * 15.5);

const registerShotStats = (
  ctx: CupTickContext,
  attacking: CupTeamRuntimeProfile,
  defending: CupTeamRuntimeProfile,
  shot: CupShotOutcome,
): void => {
  const stats = ctx.state.stats[attacking.side];
  stats.shots += 1;
  stats.xG += shot.xG;
  if (shot.onTarget) stats.shotsOnTarget += 1;
  if (shot.goal) stats.goals += 1;
  if (shot.corner) stats.corners += 1;
  if (shot.save) ctx.state.stats[defending.side].saves += 1;
  if (shot.eventType === MatchEventType.SHOT_POST) stats.posts += 1;
  if (shot.eventType === MatchEventType.SHOT_BAR) stats.bars += 1;
};

/**
 * Rozstrzyga rozegranie już przyznanego stałego fragmentu (wolny, rzut karny
 * albo rożny): czy w ogóle powstaje sytuacja strzelecka, a jeśli tak — jej
 * przebieg i strzał. Zdarzenie przyznania stałego fragmentu jest tworzone
 * osobno przez wywołującego, bo dla rożnego powstaje ono wcześniej, w innym
 * ticku (CupMatchLoop.appendPendingRestart), a dla wolnego/karnego — tutaj,
 * w tym samym ticku co faul (resolveFoulRestart poniżej).
 */
const resolveSetPieceDelivery = ({
  ctx,
  attacking,
  defending,
  intent,
  sequenceId,
  kind,
  sourceContactId,
}: {
  ctx: CupTickContext;
  attacking: CupTeamRuntimeProfile;
  defending: CupTeamRuntimeProfile;
  intent: CupActionIntent;
  sequenceId: string;
  kind: CupSetPieceKind;
  sourceContactId?: string;
}): CupActionOutcome => {
  const events: CupMatchEvent[] = [];
  const chance = CupSetPieceResolver.createSetPieceChance({ ctx, attacking, defending, kind });
  if (!chance) {
    // A corner without a shooting chance can still be a clean defensive
    // clearance rather than the attacking side simply keeping the ball —
    // only for CORNER, so free-kick/penalty balance stays exactly as before.
    const clearedByDefender = kind === 'CORNER' && ctx.random(504) < 0.30;
    return {
      nextPossession: clearedByDefender ? defending.side : attacking.side,
      nextZone: clearedByDefender ? 'MIDFIELD' : kind === 'PENALTY' ? 'BOX' : 'FINAL_THIRD',
      momentumDelta: clearedByDefender
        ? (attacking.side === 'HOME' ? -1.4 : 1.4)
        : (attacking.side === 'HOME' ? 1.4 : -1.4),
      events,
    };
  }

  events.push(...CupActionSequenceService.createChanceBuildup({
    ctx,
    attacking,
    intent: { ...intent, pattern: 'SET_PIECE' },
    sequenceId,
    chance,
  }));
  const shot = CupShotResolver.resolveShot({
    chance,
    attacking,
    defending,
    shooterFatigue: ctx.state.fatigue[chance.shooter.id] ?? chance.shooter.condition,
    keeperFatigue: defending.goalkeeper ? ctx.state.fatigue[defending.goalkeeper.id] ?? defending.goalkeeper.condition : 80,
    weatherPenalty: weatherShotPenalty(ctx),
    scoreDiff: attacking.side === 'HOME'
      ? ctx.state.homeScore - ctx.state.awayScore
      : ctx.state.awayScore - ctx.state.homeScore,
    roll: salt => ctx.random(500 + salt),
  });
  registerShotStats(ctx, attacking, defending, shot);
  const setPieceShotId = `${sequenceId}_set_piece_shot`;
  const setPieceShooterPoint = ctx.input.spatialDecisionContext?.players[chance.shooter.id];
  events.push({
    id: setPieceShotId,
    second: ctx.state.second,
    minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
    side: attacking.side,
    type: shot.eventType,
    zone: chance.zone,
    pattern: 'SET_PIECE',
    playerId: chance.shooter.id,
    secondaryPlayerId: kind === 'PENALTY' || shot.assistEligible === false ? undefined : chance.creator?.id,
    text: shot.text,
    xG: shot.xG,
    detail: {
      sequenceId,
      sourceContactId,
      setPieceKind: kind,
      chanceKind: chance.kind,
      pressure: chance.pressure,
      distance: chance.distance,
      angle: chance.angle,
      assistEligible: kind === 'PENALTY' ? false : Boolean(chance.creator),
      attackingShooterId: chance.shooter.id,
      goalkeeperId: defending.goalkeeper?.id,
      markerId: chance.marker?.id,
      saved: shot.save,
      startX: setPieceShooterPoint?.x,
      startY: setPieceShooterPoint?.y,
    },
  });
  if (shot.corner) {
    const cornerAward = CupSetPieceResolver.eventForAward(ctx, attacking.side, 'CORNER');
    cornerAward.id = `${cornerAward.id}_after_set_piece`;
    cornerAward.detail = { sequenceId, sourceShotId: setPieceShotId };
    events.push(cornerAward);
  }

  return {
    nextPossession: shot.goal ? defending.side : shot.corner ? attacking.side : defending.side,
    nextZone: shot.goal ? 'MIDFIELD' : shot.corner ? 'WIDE_LEFT' : 'DEFENSE',
    nextPossessionReason:
      shot.goal ? 'GOAL_RESTART' :
      shot.corner ? 'CORNER' :
      shot.save ? 'SAVE' :
      'GOAL_KICK',
    restartSourceEventId: shot.corner ? events.at(-1)?.id : setPieceShotId,
    momentumDelta: attacking.side === 'HOME' ? shot.momentumDelta : -shot.momentumDelta,
    events,
  };
};

const resolveFoulRestart = ({
  ctx,
  attacking,
  defending,
  intent,
  sequenceId,
  sourceContactId,
}: {
  ctx: CupTickContext;
  attacking: CupTeamRuntimeProfile;
  defending: CupTeamRuntimeProfile;
  intent: CupActionIntent;
  sequenceId: string;
  sourceContactId: string;
}): CupActionOutcome => {
  const kind: CupSetPieceKind =
    ctx.state.ballZone === 'BOX' ? 'PENALTY' :
    ctx.state.ballZone === 'WIDE_LEFT' || ctx.state.ballZone === 'WIDE_RIGHT' ? 'FREE_KICK_WIDE' :
    ctx.state.ballZone === 'FINAL_THIRD' && ctx.random(295) < 0.46 ? 'FREE_KICK_DIRECT' :
    'FREE_KICK_WIDE';
  const award = CupSetPieceResolver.eventForAward(ctx, attacking.side, kind);
  award.detail = { ...(award.detail ?? {}), sequenceId, sourceContactId, setPieceKind: kind };
  const delivery = resolveSetPieceDelivery({ ctx, attacking, defending, intent, sequenceId, kind, sourceContactId });
  return { ...delivery, events: [award, ...delivery.events] };
};

const nextZoneAfterProgression = (zone: CupPitchZone, roll: number, widthUse: number): CupPitchZone => {
  if (zone === 'GK') return 'DEFENSE';
  if (zone === 'DEFENSE') return 'MIDFIELD';
  if (zone === 'MIDFIELD') return widthUse > 0.58 && roll < 0.45 ? (roll < 0.225 ? 'WIDE_LEFT' : 'WIDE_RIGHT') : 'FINAL_THIRD';
  if (zone === 'WIDE_LEFT' || zone === 'WIDE_RIGHT') return roll < 0.55 ? 'BOX' : 'FINAL_THIRD';
  if (zone === 'FINAL_THIRD') return roll < 0.42 ? 'BOX' : 'FINAL_THIRD';
  return 'BOX';
};

const buildIntent = (ctx: CupTickContext, attacking: CupTeamRuntimeProfile): CupActionIntent => {
  const team = attacking.side === 'HOME' ? ctx.input.home : ctx.input.away;
  const instructions = team.instructions;
  const patternWeights: Array<{ item: CupAttackPattern; weight: number }> = [
    { item: 'BUILD_UP', weight: instructions.passing === 'SHORT' ? 38 : 24 },
    { item: 'DIRECT', weight: instructions.passing === 'LONG' ? 32 : 12 },
    { item: 'COUNTER', weight: instructions.counterAttack === 'COUNTER' ? 28 : 8 },
    { item: 'WING_PLAY', weight: attacking.tacticalWidth > 58 ? 22 : 12 },
    { item: 'SECOND_BALL', weight: instructions.passing === 'LONG' ? 14 : 7 },
  ];

  const tempo = instructions.tempo === 'FAST' ? 0.72 : instructions.tempo === 'SLOW' ? 0.34 : 0.52;
  const risk = instructions.mindset === 'OFFENSIVE' ? 0.68 : instructions.mindset === 'DEFENSIVE' ? 0.30 : 0.48;
  const verticality = instructions.passing === 'LONG' ? 0.72 : instructions.passing === 'SHORT' ? 0.32 : 0.52;
  const widthUse = clamp(attacking.tacticalWidth / 100 + (instructions.passing === 'LONG' ? 0.05 : 0), 0.25, 0.85);
  const intensityTempo = instructions.intensity === 'AGGRESSIVE' ? 0.04 : instructions.intensity === 'CAUTIOUS' ? -0.04 : 0;
  const intensityRisk = instructions.intensity === 'AGGRESSIVE' ? 0.05 : instructions.intensity === 'CAUTIOUS' ? -0.05 : 0;

  return {
    side: attacking.side,
    pattern: pickWeighted(patternWeights, ctx.random(12)),
    risk: clamp(risk + intensityRisk, 0.18, 0.78),
    tempo: clamp(tempo + intensityTempo, 0.24, 0.78),
    verticality,
    widthUse,
  };
};

const selectOffsideRunner = (
  attacking: CupTeamRuntimeProfile,
  roll: number,
) => {
  const pool = attacking.forwards.length > 0
    ? [...attacking.forwards, ...attacking.forwards, ...attacking.midfielders]
    : attacking.outfieldPlayers;
  if (pool.length === 0) return undefined;

  return pickWeighted(pool.map(player => ({
    item: player,
    weight:
      weightedScore(player.attributes, {
        pace: 0.22,
        attacking: 0.20,
        positioning: 0.18,
        finishing: 0.13,
        mentality: 0.10,
        workRate: 0.08,
        dribbling: 0.05,
        strength: 0.04,
      }) +
      (player.position === 'FWD' ? 14 : player.position === 'MID' ? 6 : -8),
  })), roll);
};

const selectOffsidePasser = (
  attacking: CupTeamRuntimeProfile,
  runnerId: string | undefined,
  roll: number,
) => {
  const pool = attacking.outfieldPlayers.filter(player => player.id !== runnerId);
  if (pool.length === 0) return undefined;

  return pickWeighted(pool.map(player => ({
    item: player,
    weight:
      weightedScore(player.attributes, {
        passing: 0.24,
        vision: 0.22,
        technique: 0.17,
        crossing: 0.11,
        mentality: 0.10,
        attacking: 0.08,
        workRate: 0.08,
      }) +
      (player.position === 'MID' ? 12 : player.position === 'FWD' ? 5 : player.position === 'DEF' ? 2 : -12),
  })), roll);
};

export const CupActionBuilder = {
  /**
   * Jeden tick symulacji. Ten blok nie zna wyniku końcowego meczu. Widzi tylko
   * aktualny stan piłki i rozstrzyga najbliższe kilka sekund: utrzymanie,
   * pressing, progresję, kontakt, sytuację i ewentualny strzał.
   */
  simulateTick: (ctx: CupTickContext): CupActionOutcome => {
    const attacking = profileForSide(ctx, ctx.state.possession);
    const defending = profileForSide(ctx, opponentSide(ctx.state.possession));
    const intent = buildIntent(ctx, attacking);
    const events = [];
    const possessionStats = ctx.state.stats[attacking.side];
    possessionStats.possessionTicks += 1;

    // CORNER_TAKEN was already recorded this same tick by
    // CupMatchLoop.appendPendingRestart; this resolves its delivery — a shot
    // or nothing — exactly like a foul-awarded free kick resolves inline in
    // resolveFoulRestart below, instead of silently falling through to a
    // fresh, unrelated open-play decision.
    if (ctx.state.possessionReason === 'CORNER_DELIVERY') {
      const sequenceId = `cupv2_corner_delivery_${ctx.state.second}_${ctx.state.possession}`;
      return resolveSetPieceDelivery({ ctx, attacking, defending, intent, sequenceId, kind: 'CORNER' });
    }
    const scoreDiff = attacking.side === 'HOME'
      ? ctx.state.homeScore - ctx.state.awayScore
      : ctx.state.awayScore - ctx.state.homeScore;
    const footballMinute = CupMatchClockService.eventMinute(ctx.state, ctx.config) - 1;
    const halfTimeResponseDecay = ctx.state.phase === 'SECOND_HALF'
      ? clamp(1 - Math.max(0, footballMinute - 45) / 52, 0.12, 1)
      : 0;
    const halfTimeResponse = ctx.state.halfTimeResponse[attacking.side] * halfTimeResponseDecay;
    const attackingCoach = ctx.state.coachEffects[attacking.side];
    const defendingCoach = ctx.state.coachEffects[defending.side];
    const leadingGameControlDampener =
      scoreDiff >= 5 ? 0.46 :
      scoreDiff >= 4 ? 0.55 :
      scoreDiff >= 3 ? 0.66 :
      scoreDiff >= 2 ? 0.80 :
      scoreDiff >= 1 ? 0.93 :
      1;
    const trailingUrgency =
      scoreDiff < 0 ? clamp(1 + Math.min(3, Math.abs(scoreDiff)) * 0.035, 1, 1.105) :
      1;

    const actionCadence = clamp(
      (
        0.190 +
        intent.tempo * 0.08 +
        intent.risk * 0.05 +
        Math.abs(ctx.state.momentum) * 0.00045 +
        attackingCoach.initiativeModifier * 0.55
      ) * leadingGameControlDampener * trailingUrgency,
      0.08,
      0.34
    );

    if (ctx.random(20) > actionCadence) {
      return {
        nextZone: ctx.state.ballZone,
        momentumDelta: 0,
        events,
      };
    }

    const decision = CupPlayerDecisionService.selectPossessionDecision({
      attacking,
      defending,
      zone: ctx.state.ballZone,
      pattern: intent.pattern,
      fatigue: ctx.state.fatigue,
      currentCarrierId: ctx.state.ballCarrierId,
      instructions: attacking.side === 'HOME' ? ctx.input.home.instructions : ctx.input.away.instructions,
      spatial: ctx.input.spatialDecisionContext,
      roll: ctx.random,
    });
    const sequenceId = `cupv2_sequence_${ctx.state.second}_${attacking.side}`;

    const pressure = ctx.state.pressure[attacking.side];
    const attackingOrganization = ctx.state.organization[attacking.side];
    const defendingOrganization = ctx.state.organization[defending.side];
    const pressingScore = defending.pressing * (defending.lineHeight > 55 ? 1.05 : 0.96);
    const buildScore =
      attacking.buildUp * 0.32 +
      attacking.midfieldControl * 0.23 +
      attacking.progression * 0.20 +
      attacking.mentality * 0.12 +
      attacking.staminaReserve * 0.08 +
      attackingOrganization * 0.04 -
      pressure * 0.10 +
      halfTimeResponse * 0.38;

    const turnoverProbability = clamp(
      contestProbability(pressingScore, buildScore, 0.10, 28) +
      intent.risk * 0.045 +
      intent.tempo * 0.030 +
      attackingCoach.turnoverRiskModifier * 0.32,
      0.018,
      0.22
    );

    if (ctx.random(21) < turnoverProbability) {
      const contact = CupDisciplineResolver.resolveContact({ ctx, defending, attacking, danger: intent.risk, salt: 200 });
      if (contact) events.push(contact);
      const injury = CupInjuryResolver.maybeCreateInjury({ ctx, profile: attacking, contactIntensity: intent.risk, salt: 215 });
      if (injury) {
        events.push(injury, {
          id: `${injury.id}_medical_treatment`,
          second: ctx.state.second,
          minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
          side: injury.side,
          type: MatchEventType.MEDICAL_TREATMENT,
          zone: ctx.state.ballZone,
          playerId: injury.playerId,
          text: `Służby medyczne udzielają pomocy poszkodowanemu zawodnikowi.`,
          detail: {
            sourceInjuryId: injury.id,
            severity: injury.type === MatchEventType.INJURY_SEVERE ? 'SEVERE' : 'LIGHT',
          },
        });
      }

      // Advantage is a real referee decision. The contact is recorded as a
      // foul, but open play stays with the fouled team and no set piece is
      // created. This gives commentary and SVG playback an exact causal event.
      if (contact?.type === MatchEventType.ADVANTAGE_PLAYED) {
        return {
          nextPossession: attacking.side,
          nextZone: ctx.state.ballZone,
          nextPossessionReason: 'OPEN_PLAY',
          momentumDelta: attacking.side === 'HOME' ? 0.8 : -0.8,
          events,
        };
      }

      // A foul by the pressing side cannot also award that side possession.
      // Resolve the resulting free kick or penalty from the same contact and
      // return before the normal interception/tackle branch.
      if (contact) {
        const restart = resolveFoulRestart({
          ctx,
          attacking,
          defending,
          intent,
          sequenceId,
          sourceContactId: contact.id,
        });
        return {
          ...restart,
          events: [...events, ...restart.events],
        };
      }

      events.push(CupActionSequenceService.createTurnoverEvent({
        ctx,
        attacking,
        defending,
        intent,
        decision,
        sequenceId,
      }));

      return {
        nextPossession: defending.side,
        nextZone: ctx.state.ballZone === 'BOX' || ctx.state.ballZone === 'FINAL_THIRD' ? 'DEFENSE' : 'MIDFIELD',
        momentumDelta: defending.side === 'HOME' ? 1.8 : -1.8,
        events,
      };
    }

    const progressionScore =
      attacking.progression * 0.34 +
      attacking.midfieldControl * 0.18 +
      attacking.chanceCreation * 0.15 +
      (intent.pattern === 'COUNTER' ? attacking.counterThreat * 0.20 : 0) +
      intent.verticality * 12 +
      intent.tempo * 8 +
      halfTimeResponse * 0.82;

    const defensiveScore =
      defending.defensiveShape * 0.38 +
      defending.midfieldControl * 0.18 +
      defending.pressing * 0.14 +
      defending.mentality * 0.12 +
      defendingOrganization * 0.05;

    const progressProbability = clamp(
      (contestProbability(progressionScore, defensiveScore, 0.38, 24) +
        intent.risk * 0.04 +
        attackingCoach.initiativeModifier * 0.45 +
        attackingCoach.ownShotModifier * 1.25 +
        defendingCoach.opponentShotModifier * 1.10) *
        leadingGameControlDampener *
        trailingUrgency,
      0.05,
      0.72
    );
    const progressed = ctx.random(22) < progressProbability;
    const nextZone = progressed
      ? nextZoneAfterProgression(ctx.state.ballZone, ctx.random(23), intent.widthUse)
      : ctx.state.ballZone;

    if (!progressed) {
      const eventType = ctx.random(24) < 0.10 ? MatchEventType.THROW_IN : MatchEventType.MIDFIELD_CONTROL;
      return {
        nextZone,
        momentumDelta: attacking.side === 'HOME' ? 0.2 : -0.2,
        events: [{
          id: `cupv2_stalled_${ctx.state.second}`,
          second: ctx.state.second,
          minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
          side: attacking.side,
          type: eventType,
          zone: ctx.state.ballZone,
          pattern: intent.pattern,
          playerId: decision.passer?.id,
          secondaryPlayerId: decision.receiver?.id,
          text: eventType === MatchEventType.THROW_IN
            ? `${decision.passer?.lastName ?? (attacking.side === 'HOME' ? ctx.input.home.name : ctx.input.away.name)} wznawia grę z autu.`
            : `${attacking.side === 'HOME' ? ctx.input.home.name : ctx.input.away.name} utrzymuje piłkę, ale akcja zwalnia.`,
          detail: eventType === MatchEventType.THROW_IN
            ? { sequenceId, restartReason: 'THROW_IN' }
            : { sequenceId },
        }],
      };
    }

    if (nextZone !== 'FINAL_THIRD' && nextZone !== 'BOX' && nextZone !== 'WIDE_LEFT' && nextZone !== 'WIDE_RIGHT') {
      events.push(...CupActionSequenceService.createProgressionEvents({
        ctx,
        attacking,
        defending,
        intent,
        decision,
        sequenceId,
        fromZone: ctx.state.ballZone,
        toZone: nextZone,
      }));
      return { nextZone, momentumDelta: attacking.side === 'HOME' ? 0.5 : -0.5, events };
    }

    const offsideChance = clamp(
      0.010 +
      intent.verticality * 0.020 +
      Math.max(0, defending.lineHeight - 58) * 0.0005 -
      attacking.mentality * 0.00008,
      0.002,
      0.055
    );

    if (ctx.random(25) < offsideChance) {
      const offsideRunner = selectOffsideRunner(attacking, ctx.random(251));
      const offsidePasser = selectOffsidePasser(attacking, offsideRunner?.id, ctx.random(252));
      ctx.state.stats[attacking.side].offsides += 1;
      return {
        nextPossession: defending.side,
        nextZone: 'DEFENSE',
        momentumDelta: attacking.side === 'HOME' ? -0.8 : 0.8,
        events: [{
          id: `cupv2_offside_${ctx.state.second}`,
          second: ctx.state.second,
          minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
          side: attacking.side,
          type: MatchEventType.OFFSIDE,
          zone: nextZone,
          pattern: intent.pattern,
          playerId: offsideRunner?.id,
          secondaryPlayerId: offsidePasser?.id,
          text: `${offsideRunner?.lastName ?? (attacking.side === 'HOME' ? ctx.input.home.name : ctx.input.away.name)} łapie się na spalonym po próbie zagrania za linię obrony.`,
          detail: {
            runnerId: offsideRunner?.id,
            passerId: offsidePasser?.id,
            defensiveLineHeight: defending.lineHeight,
            verticality: intent.verticality,
          },
        }],
      };
    }

    const chance = CupChanceCreationService.createChance({
      side: attacking.side,
      intent,
      attacking,
      defending,
      zone: nextZone,
      pressure,
      scoreDiff,
      spatial: ctx.input.spatialDecisionContext,
      preferredShooterId: decision.receiver?.id ?? decision.passer?.id,
      preferredCreatorId: decision.passer?.id,
      roll: ctx.random,
    });

    if (!chance) {
      const cornerChance = clamp(0.026 + attacking.crossing * 0.00042 + intent.widthUse * 0.024, 0.018, 0.095);
      if (ctx.random(26) < cornerChance) {
        ctx.state.stats[attacking.side].corners += 1;
        if (
          decision.passer &&
          decision.presser &&
          (ctx.state.ballZone === 'WIDE_LEFT' || ctx.state.ballZone === 'WIDE_RIGHT' || intent.pattern === 'WING_PLAY')
        ) {
          events.push({
            id: `${sequenceId}_cross_blocked`,
            second: ctx.state.second,
            minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
            side: defending.side,
            type: MatchEventType.CROSS_BLOCKED,
            zone: nextZone,
            pattern: intent.pattern,
            playerId: decision.presser.id,
            secondaryPlayerId: decision.passer.id,
            text: `${decision.presser.lastName} blokuje dośrodkowanie zawodnika ${decision.passer.lastName}.`,
            detail: { sequenceId, completed: false },
          });
        }
        events.push({
          id: `cupv2_corner_${ctx.state.second}`,
          second: ctx.state.second,
          minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
          side: attacking.side,
          type: MatchEventType.CORNER,
          zone: nextZone,
          pattern: intent.pattern,
          playerId: decision.receiver?.id ?? decision.passer?.id,
          secondaryPlayerId: decision.passer?.id,
          text: `${attacking.side === 'HOME' ? ctx.input.home.name : ctx.input.away.name} wywalcza rzut rożny po zablokowanej akcji.`,
          detail: {
            sequenceId,
            sourceEventId: events.at(-1)?.id,
          },
        });
      } else {
        events.push(...CupActionSequenceService.createProgressionEvents({
          ctx,
          attacking,
          defending,
          intent,
          decision,
          sequenceId,
          fromZone: ctx.state.ballZone,
          toZone: nextZone,
        }));
      }
      const cornerEvent = events.find(event => event.type === MatchEventType.CORNER);
      return {
        nextPossession: cornerEvent ? attacking.side : undefined,
        nextZone,
        nextPossessionReason: cornerEvent ? 'CORNER' : undefined,
        restartSourceEventId: cornerEvent?.id,
        momentumDelta: attacking.side === 'HOME' ? 0.7 : -0.7,
        events,
      };
    }

    const ownGoal = CupOwnGoalResolver.maybeOwnGoal({
      chance,
      defending,
      roll: ctx.random,
    });

    const shot = ownGoal ?? CupShotResolver.resolveShot({
      chance,
      attacking,
      defending,
      shooterFatigue: ctx.state.fatigue[chance.shooter.id] ?? chance.shooter.condition,
      keeperFatigue: defending.goalkeeper ? ctx.state.fatigue[defending.goalkeeper.id] ?? defending.goalkeeper.condition : 80,
      weatherPenalty: weatherShotPenalty(ctx),
      scoreDiff,
      roll: ctx.random,
    });

    // The authoritative sequence is recorded before the shot so UI playback,
    // replays and player statistics all consume the same football action.
    events.push(...CupActionSequenceService.createChanceBuildup({
      ctx,
      attacking,
      intent,
      sequenceId,
      chance,
    }));

    registerShotStats(ctx, attacking, defending, shot);

    const shotEventId = `cupv2_shot_${ctx.state.second}`;
    const shooterPoint = ctx.input.spatialDecisionContext?.players[chance.shooter.id];
    events.push({
      id: shotEventId,
      second: ctx.state.second,
      minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
      side: attacking.side,
      type: shot.eventType,
      zone: chance.zone,
      pattern: chance.pattern,
      playerId: shot.isOwnGoal ? shot.ownGoalPlayerId : chance.shooter.id,
      secondaryPlayerId: shot.assistEligible === false || shot.isOwnGoal ? undefined : chance.creator?.id,
      text: shot.text,
      xG: shot.xG,
      detail: {
        sequenceId,
        chanceKind: chance.kind,
        pressure: chance.pressure,
        distance: chance.distance,
        angle: chance.angle,
        assistEligible: shot.assistEligible ?? Boolean(chance.creator),
        isOwnGoal: shot.isOwnGoal ?? false,
        ownGoalPlayerId: shot.ownGoalPlayerId,
        attackingShooterId: chance.shooter.id,
        goalkeeperId: defending.goalkeeper?.id,
        markerId: chance.marker?.id,
        startX: shooterPoint?.x,
        startY: shooterPoint?.y,
      },
    });

    const producesLooseBall =
      shot.eventType === MatchEventType.SAVE ||
      shot.eventType === MatchEventType.ONE_ON_ONE_SAVE ||
      shot.eventType === MatchEventType.SHOT_POST ||
      shot.eventType === MatchEventType.SHOT_BAR ||
      shot.eventType === MatchEventType.SHOT_BLOCKED;
    const rebound = producesLooseBall && !shot.corner
      ? CupPlayerDecisionService.selectReboundWinner({
          attacking,
          defending,
          fatigue: ctx.state.fatigue,
          sourceEventType: shot.eventType,
          roll: ctx.random(291),
        })
      : undefined;

    if (rebound) {
      events.push({
        id: `${sequenceId}_rebound`,
        second: ctx.state.second,
        minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
        side: rebound.side,
        type: MatchEventType.REBOUND_WON,
        zone: chance.zone,
        pattern: chance.pattern,
        playerId: rebound.player.id,
        secondaryPlayerId: chance.shooter.id,
        text: `${rebound.player.lastName} jako pierwszy dopada do odbitej piłki.`,
        detail: {
          sequenceId,
          sourceEventType: shot.eventType,
          attackingRebound: rebound.side === attacking.side,
        },
      });
    }

    let finalShot = shot;
    let finalShotEventId = shotEventId;
    const followUpChance = rebound?.side === attacking.side && ctx.random(292) < 0.16;
    if (rebound && followUpChance) {
      const controlId = `${sequenceId}_rebound_control`;
      events.push({
        id: controlId,
        second: ctx.state.second,
        minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
        side: attacking.side,
        type: MatchEventType.BALL_CONTROL,
        zone: 'BOX',
        pattern: 'SECOND_BALL',
        playerId: rebound.player.id,
        secondaryPlayerId: chance.shooter.id,
        text: `${rebound.player.lastName} opanowuje odbitą piłkę i natychmiast składa się do dobicia.`,
        detail: { sequenceId, reboundControl: true },
      });

      const reboundChance: CupChance = {
        side: attacking.side,
        kind: 'HALF_CHANCE',
        zone: 'BOX',
        pattern: 'SECOND_BALL',
        shooter: rebound.player,
        marker: chance.marker,
        xG: clamp(chance.xG * 0.42, 0.025, 0.14),
        pressure: clamp(chance.pressure + 14, 0, 100),
        angle: clamp(chance.angle - 0.08, 0.18, 0.92),
        distance: clamp(chance.distance * 0.72, 5, 15),
      };
      const reboundShooterPoint = ctx.input.spatialDecisionContext?.players[rebound.player.id];
      const reboundShot = CupShotResolver.resolveShot({
        chance: reboundChance,
        attacking,
        defending,
        shooterFatigue: ctx.state.fatigue[rebound.player.id] ?? rebound.player.condition,
        keeperFatigue: defending.goalkeeper ? ctx.state.fatigue[defending.goalkeeper.id] ?? defending.goalkeeper.condition : 80,
        weatherPenalty: weatherShotPenalty(ctx),
        scoreDiff,
        // A salt namespace independent from the first shot prevents a replay of
        // the same keeper/finishing rolls within one action sequence.
        roll: salt => ctx.random(400 + salt),
      });
      registerShotStats(ctx, attacking, defending, reboundShot);
      finalShot = reboundShot;
      finalShotEventId = `${sequenceId}_rebound_shot`;
      events.push({
        id: finalShotEventId,
        second: ctx.state.second,
        minute: CupMatchClockService.eventMinute(ctx.state, ctx.config),
        side: attacking.side,
        type: reboundShot.eventType,
        zone: reboundChance.zone,
        pattern: reboundChance.pattern,
        playerId: rebound.player.id,
        text: reboundShot.text,
        xG: reboundShot.xG,
        detail: {
          sequenceId,
          chanceKind: reboundChance.kind,
          pressure: reboundChance.pressure,
          distance: reboundChance.distance,
          angle: reboundChance.angle,
          assistEligible: false,
          attackingShooterId: rebound.player.id,
          goalkeeperId: defending.goalkeeper?.id,
          markerId: reboundChance.marker?.id,
          reboundShot: true,
          startX: reboundShooterPoint?.x,
          startY: reboundShooterPoint?.y,
        },
      });
    }

    let restartSourceEventId = finalShotEventId;
    if (finalShot.corner) {
      const cornerAward = CupSetPieceResolver.eventForAward(ctx, attacking.side, 'CORNER');
      cornerAward.detail = {
        ...(cornerAward.detail ?? {}),
        sequenceId,
        sourceShotId: finalShotEventId,
      };
      events.push(cornerAward);
      restartSourceEventId = cornerAward.id;
    }
    const combinedMomentumDelta = shot.momentumDelta +
      (finalShot === shot ? 0 : finalShot.momentumDelta * 0.65);

    return {
      nextPossession: finalShot.goal ? defending.side : finalShot.corner ? attacking.side : defending.side,
      nextZone: finalShot.goal ? 'MIDFIELD' : finalShot.corner ? 'WIDE_LEFT' : 'DEFENSE',
      nextPossessionReason:
        finalShot.goal ? 'GOAL_RESTART' :
        finalShot.corner ? 'CORNER' :
        rebound ? undefined :
        finalShot.save ? 'SAVE' :
        finalShot.eventType === MatchEventType.SHOT_BLOCKED ? undefined :
        'GOAL_KICK',
      restartSourceEventId,
      momentumDelta: attacking.side === 'HOME' ? combinedMomentumDelta : -combinedMomentumDelta,
      events,
    };
  },
};
