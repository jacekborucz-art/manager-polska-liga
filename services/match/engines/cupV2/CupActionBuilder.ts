import { MatchEventType } from '../../../../types';
import type {
  CupActionIntent,
  CupActionOutcome,
  CupAttackPattern,
  CupPitchZone,
  CupTeamRuntimeProfile,
  CupTickContext,
} from './CupMatchTypes';
import { clamp, contestProbability, pickWeighted, weightedScore } from './CupMath';
import { CupChanceCreationService } from './CupChanceCreationService';
import { CupDisciplineResolver } from './CupDisciplineResolver';
import { CupInjuryResolver } from './CupInjuryResolver';
import { CupOwnGoalResolver } from './CupOwnGoalResolver';
import { CupShotResolver } from './CupShotResolver';

const opponentSide = (side: 'HOME' | 'AWAY') => side === 'HOME' ? 'AWAY' : 'HOME';

const profileForSide = (ctx: CupTickContext, side: 'HOME' | 'AWAY'): CupTeamRuntimeProfile =>
  side === 'HOME' ? ctx.homeProfile : ctx.awayProfile;

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
    const scoreDiff = attacking.side === 'HOME'
      ? ctx.state.homeScore - ctx.state.awayScore
      : ctx.state.awayScore - ctx.state.homeScore;
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
        Math.abs(ctx.state.momentum) * 0.00045
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
      pressure * 0.10;

    const turnoverProbability = clamp(
      contestProbability(pressingScore, buildScore, 0.10, 28) +
      intent.risk * 0.045 +
      intent.tempo * 0.030,
      0.018,
      0.22
    );

    if (ctx.random(21) < turnoverProbability) {
      const contact = CupDisciplineResolver.resolveContact({ ctx, defending, attacking, danger: intent.risk, salt: 200 });
      if (contact) events.push(contact);
      const injury = CupInjuryResolver.maybeCreateInjury({ ctx, profile: attacking, contactIntensity: intent.risk, salt: 215 });
      if (injury) events.push(injury);

      events.push({
        id: `cupv2_turnover_${ctx.state.second}`,
        second: ctx.state.second,
        minute: Math.floor(ctx.state.second / 60) + 1,
        side: defending.side,
        type: MatchEventType.MISPLACED_PASS,
        zone: ctx.state.ballZone,
        pattern: intent.pattern,
        text: `${defending.side === 'HOME' ? ctx.input.home.name : ctx.input.away.name} odbiera piłkę po niedokładnym rozegraniu.`,
      });

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
      intent.tempo * 8;

    const defensiveScore =
      defending.defensiveShape * 0.38 +
      defending.midfieldControl * 0.18 +
      defending.pressing * 0.14 +
      defending.mentality * 0.12 +
      defendingOrganization * 0.05;

    const progressProbability = clamp(
      (contestProbability(progressionScore, defensiveScore, 0.38, 24) + intent.risk * 0.04) *
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
          minute: Math.floor(ctx.state.second / 60) + 1,
          side: attacking.side,
          type: eventType,
          zone: ctx.state.ballZone,
          pattern: intent.pattern,
          text: `${attacking.side === 'HOME' ? ctx.input.home.name : ctx.input.away.name} utrzymuje piłkę, ale akcja zwalnia.`,
        }],
      };
    }

    if (nextZone !== 'FINAL_THIRD' && nextZone !== 'BOX' && nextZone !== 'WIDE_LEFT' && nextZone !== 'WIDE_RIGHT') {
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
          minute: Math.floor(ctx.state.second / 60) + 1,
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
      roll: ctx.random,
    });

    if (!chance) {
      const cornerChance = clamp(0.026 + attacking.crossing * 0.00042 + intent.widthUse * 0.024, 0.018, 0.095);
      if (ctx.random(26) < cornerChance) {
        ctx.state.stats[attacking.side].corners += 1;
        events.push({
          id: `cupv2_corner_${ctx.state.second}`,
          second: ctx.state.second,
          minute: Math.floor(ctx.state.second / 60) + 1,
          side: attacking.side,
          type: MatchEventType.CORNER,
          zone: nextZone,
          pattern: intent.pattern,
          text: `${attacking.side === 'HOME' ? ctx.input.home.name : ctx.input.away.name} wywalcza rzut rożny po zablokowanej akcji.`,
        });
      }
      return { nextZone, momentumDelta: attacking.side === 'HOME' ? 0.7 : -0.7, events };
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
      weatherPenalty: Math.max(0, (ctx.input.environment.weather?.weatherIntensity ?? 0) * 10.5),
      scoreDiff,
      roll: ctx.random,
    });

    const stats = ctx.state.stats[attacking.side];
    stats.shots += 1;
    stats.xG += shot.xG;
    if (shot.onTarget) stats.shotsOnTarget += 1;
    if (shot.goal) stats.goals += 1;
    if (shot.corner) stats.corners += 1;
    if (shot.save) ctx.state.stats[defending.side].saves += 1;
    if (shot.eventType === MatchEventType.SHOT_POST) stats.posts += 1;
    if (shot.eventType === MatchEventType.SHOT_BAR) stats.bars += 1;

    events.push({
      id: `cupv2_shot_${ctx.state.second}`,
      second: ctx.state.second,
      minute: Math.floor(ctx.state.second / 60) + 1,
      side: attacking.side,
      type: shot.eventType,
      zone: chance.zone,
      pattern: chance.pattern,
      playerId: shot.isOwnGoal ? shot.ownGoalPlayerId : chance.shooter.id,
      secondaryPlayerId: shot.assistEligible === false || shot.isOwnGoal ? undefined : chance.creator?.id,
      text: shot.text,
      xG: shot.xG,
      detail: {
        chanceKind: chance.kind,
        pressure: chance.pressure,
        distance: chance.distance,
        angle: chance.angle,
        assistEligible: shot.assistEligible ?? Boolean(chance.creator),
        isOwnGoal: shot.isOwnGoal ?? false,
        ownGoalPlayerId: shot.ownGoalPlayerId,
        attackingShooterId: chance.shooter.id,
      },
    });

    return {
      nextPossession: shot.goal ? defending.side : shot.corner ? attacking.side : defending.side,
      nextZone: shot.goal ? 'MIDFIELD' : shot.corner ? 'WIDE_LEFT' : 'DEFENSE',
      momentumDelta: attacking.side === 'HOME' ? shot.momentumDelta : -shot.momentumDelta,
      events,
    };
  },
};
