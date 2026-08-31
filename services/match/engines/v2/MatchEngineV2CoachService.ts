import {
  MatchEventType,
  type ActiveAiCoachInstruction,
  type ActiveAiCoachShout,
  type ActiveUserCoachInstruction,
  type ActiveUserCoachShout,
  type CoachAttributes,
  type UserCoachInstructionId,
  type UserCoachShoutId,
} from '../../../../types';
import { AiCoachCommandService } from '../../../AiCoachCommandService';
import {
  getUserCoachInstructionLabel,
  UserCoachInstructionService,
} from '../../../UserCoachInstructionService';
import {
  getUserCoachShoutLabel,
  UserCoachShoutService,
} from '../../../UserCoachShoutService';
import {
  CupMatchClockService,
  stableHash,
  type CupLiveMatch,
  type CupTeamSide,
} from '../cupV2';
import type {
  MatchEngineV2CoachCommandPresentation,
  MatchEngineV2CoachPresentation,
  MatchEngineV2CoachSideState,
} from './MatchEngineV2Types';

const emptyMemory = () => ({
  lastId: null,
  lastIssuedMinute: -99,
  repeatCount: 0,
  issueCount: 0,
});

const DEFAULT_COACH_ATTRIBUTES: CoachAttributes = {
  experience: 50,
  decisionMaking: 50,
  motivation: 50,
  training: 50,
};

const footballMinute = (live: CupLiveMatch): number =>
  Math.max(0, CupMatchClockService.eventMinute(live.state, live.config) - 1);

const teamFor = (live: CupLiveMatch, side: CupTeamSide) =>
  side === 'HOME' ? live.input.home : live.input.away;

const scoreFor = (live: CupLiveMatch, side: CupTeamSide): number =>
  side === 'HOME' ? live.state.homeScore - live.state.awayScore : live.state.awayScore - live.state.homeScore;

const isGoal = (type: MatchEventType): boolean =>
  type === MatchEventType.GOAL || type === MatchEventType.ONE_ON_ONE_GOAL || type === MatchEventType.PENALTY_SCORED;

type AiDecisionReason = NonNullable<MatchEngineV2CoachSideState['lastDecisionReason']>;

const DECISION_REASON_LABELS: Record<AiDecisionReason, string> = {
  SCHEDULED: 'Planowa analiza przebiegu meczu',
  RED_CARD: 'Reakcja po czerwonej kartce',
  INJURY: 'Reakcja na uraz zawodnika',
  FORCED_SUBSTITUTION: 'Korekta po wymuszonej zmianie',
  OPPONENT_DOMINANCE: 'Reakcja na dominację przeciwnika',
};

const commandPresentation = (
  command: ActiveUserCoachInstruction | ActiveUserCoachShout | null,
  minute: number,
  label: string,
): MatchEngineV2CoachCommandPresentation | null => {
  if (!command || minute > command.expiryMinute) return null;
  return {
    id: command.id,
    label,
    status: minute < command.startsMinute ? 'PENDING' : 'ACTIVE',
    issuedMinute: command.issuedMinute,
    startsMinute: command.startsMinute,
    expiryMinute: command.expiryMinute,
    remainingMinutes: Math.max(0, command.expiryMinute - Math.max(minute, command.startsMinute) + 1),
  };
};

/**
 * Scheduled reviews remain the normal AI path, but a coach must not wait many
 * minutes after losing a player or after the opponent establishes sustained
 * control. The event cursor makes this check O(new events), not O(all events)
 * on every five-second simulation tick. Dominance has a longer cooldown because
 * it is a statistical condition rather than a one-off incident.
 */
const getReactiveDecisionReason = (
  live: CupLiveMatch,
  state: MatchEngineV2CoachSideState,
  side: CupTeamSide,
  minute: number,
): AiDecisionReason | null => {
  const newEvents = live.state.events.slice(state.lastReviewedEventIndex);
  state.lastReviewedEventIndex = live.state.events.length;
  if (minute - state.lastReactiveDecisionMinute >= 2) {
    if (newEvents.some(event => event.side === side && event.type === MatchEventType.RED_CARD)) {
      return 'RED_CARD';
    }
    if (newEvents.some(event =>
      event.side === side &&
      (event.type === MatchEventType.INJURY_LIGHT || event.type === MatchEventType.INJURY_SEVERE)
    )) {
      return 'INJURY';
    }
    if (newEvents.some(event =>
      event.side === side &&
      event.type === MatchEventType.SUBSTITUTION &&
      event.detail?.reason === 'INJURY'
    )) {
      return 'FORCED_SUBSTITUTION';
    }
  }

  const situation = situationFor(live, side);
  const sustainedDominance = minute >= 20 && (
    (situation.shotDiff <= -5 && situation.shotsOnTargetDiff <= -3) ||
    situation.userMomentum <= -42
  );
  if (sustainedDominance && minute - state.lastDominanceReactionMinute >= 12) {
    state.lastDominanceReactionMinute = minute;
    return 'OPPONENT_DOMINANCE';
  }
  return null;
};

const situationFor = (live: CupLiveMatch, side: CupTeamSide) => {
  const team = teamFor(live, side);
  const opponentSide: CupTeamSide = side === 'HOME' ? 'AWAY' : 'HOME';
  const ownStats = live.state.stats[side];
  const opponentStats = live.state.stats[opponentSide];
  const minute = footballMinute(live);
  const activeIds = team.lineup.startingXI.filter((id): id is string => Boolean(id) && !live.state.redCards[id]);
  const activePlayers = team.players.filter(player => activeIds.includes(player.id));
  const averageFatigue = activeIds.length
    ? activeIds.reduce((sum, id) => sum + (live.state.fatigue[id] ?? 100), 0) / activeIds.length
    : 100;
  const averageMorale = activePlayers.length
    ? activePlayers.reduce((sum, player) => sum + (player.morale ?? team.morale), 0) / activePlayers.length
    : team.morale;
  const recentGoals = live.state.events.filter(event =>
    isGoal(event.type) && event.detail?.isShootout !== true && minute - event.minute >= 0 && minute - event.minute <= 3
  );

  return {
    scoreDiff: scoreFor(live, side),
    shotDiff: ownStats.shots - opponentStats.shots,
    shotsOnTargetDiff: ownStats.shotsOnTarget - opponentStats.shotsOnTarget,
    userMomentum: side === 'HOME' ? live.state.momentum : -live.state.momentum,
    recentlyScored: recentGoals.some(event => event.side === side),
    recentlyConceded: recentGoals.some(event => event.side === opponentSide),
    averageFatigue,
    averageMorale,
    yellowCardCount: activeIds.reduce((sum, id) => sum + Math.min(1, live.state.yellowCards[id] ?? 0), 0),
  };
};

export const MatchEngineV2CoachService = {
  createState: (
    seed: string,
    side: CupTeamSide,
    options: { aiControlled?: boolean; coachAttributes?: CoachAttributes } = {},
  ): MatchEngineV2CoachSideState => ({
    activeInstruction: null,
    instructionMemory: emptyMemory(),
    activeShout: null,
    shoutMemory: emptyMemory(),
    // The V2 prototype must remain reproducible. Coach reaction RNG therefore
    // has its own deterministic stream, isolated from all football-action RNG.
    shoutRng: UserCoachShoutService.createRngState(stableHash(`${seed}:${side}:coach-shout`)),
    aiControlled: options.aiControlled ?? false,
    coachAttributes: options.coachAttributes ?? { ...DEFAULT_COACH_ATTRIBUTES },
    nextAiDecisionMinute: 7,
    lastReviewedEventIndex: 0,
    lastReactiveDecisionMinute: -99,
    lastDominanceReactionMinute: -99,
    lastDecisionReason: null,
  }),

  issueInstruction: (
    live: CupLiveMatch,
    state: MatchEngineV2CoachSideState,
    side: CupTeamSide,
    instructionId: UserCoachInstructionId | null,
  ): boolean => {
    const minute = footballMinute(live);
    if (minute < 1) return false;
    if (!instructionId) {
      state.activeInstruction = null;
      return true;
    }
    const issued = UserCoachInstructionService.issue({
      id: instructionId,
      minute,
      sessionSeed: stableHash(`${live.input.seed}:${side}:instruction`),
      previousActive: state.activeInstruction,
      memory: state.instructionMemory,
    });
    state.activeInstruction = issued.active;
    state.instructionMemory = issued.memory;
    return true;
  },

  issueShout: (
    live: CupLiveMatch,
    state: MatchEngineV2CoachSideState,
    side: CupTeamSide,
    shoutId: UserCoachShoutId | null,
  ): boolean => {
    const minute = footballMinute(live);
    if (minute < 1) return false;
    if (!shoutId) {
      state.activeShout = null;
      return true;
    }
    const issued = UserCoachShoutService.issue({
      id: shoutId,
      minute,
      rngState: state.shoutRng,
      situation: situationFor(live, side),
      previousActive: state.activeShout,
      memory: state.shoutMemory,
    });
    state.activeShout = issued.active;
    state.shoutMemory = issued.memory;
    state.shoutRng = issued.rngState;
    return true;
  },

  refreshEffects: (
    live: CupLiveMatch,
    states: Record<CupTeamSide, MatchEngineV2CoachSideState>,
  ): void => {
    const minute = footballMinute(live);
    (['HOME', 'AWAY'] as CupTeamSide[]).forEach(side => {
      const team = teamFor(live, side);
      const opponent = teamFor(live, side === 'HOME' ? 'AWAY' : 'HOME');
      const state = states[side];
      if (state.activeInstruction && minute > state.activeInstruction.expiryMinute) state.activeInstruction = null;
      if (state.activeShout && minute > state.activeShout.expiryMinute) state.activeShout = null;
      const reactiveReason = state.aiControlled
        ? getReactiveDecisionReason(live, state, side, minute)
        : null;
      if (reactiveReason) state.nextAiDecisionMinute = Math.min(state.nextAiDecisionMinute, minute);
      if (state.aiControlled && minute >= state.nextAiDecisionMinute) {
        const decision = AiCoachCommandService.decide({
          minute,
          coachAttributes: state.coachAttributes,
          rngState: state.shoutRng,
          aiInstructions: team.instructions,
          aiTactic: team.tactic,
          userTactic: opponent.tactic,
          aiScoreDiff: scoreFor(live, side),
          userTempo: opponent.instructions.tempo,
          userPassing: opponent.instructions.passing,
          situation: situationFor(live, side),
          previousInstruction: state.activeInstruction as ActiveAiCoachInstruction | null,
          instructionMemory: state.instructionMemory,
          previousShout: state.activeShout as ActiveAiCoachShout | null,
          shoutMemory: state.shoutMemory,
        });
        if (decision.instruction) state.activeInstruction = decision.instruction;
        if (decision.shout) state.activeShout = decision.shout;
        state.instructionMemory = decision.instructionMemory;
        state.shoutMemory = decision.shoutMemory;
        state.shoutRng = decision.rngState;
        state.nextAiDecisionMinute = decision.nextDecisionMinute;
        state.lastDecisionReason = reactiveReason ?? 'SCHEDULED';
        if (reactiveReason) state.lastReactiveDecisionMinute = minute;
      }
      const instruction = UserCoachInstructionService.getEffects({
        active: state.activeInstruction,
        minute,
        instructions: team.instructions,
        tactic: team.tactic,
        opponentTactic: opponent.tactic,
        players: team.players,
        startingXI: team.lineup.startingXI,
        fatigueMap: live.state.fatigue,
        scoreDiff: scoreFor(live, side),
        opponentTempo: opponent.instructions.tempo,
        opponentPassing: opponent.instructions.passing,
      });
      const shout = UserCoachShoutService.getEffects({
        active: state.activeShout,
        minute,
        rngState: state.shoutRng,
        players: team.players,
        startingXI: team.lineup.startingXI,
        fatigueMap: live.state.fatigue,
        yellowCards: live.state.yellowCards,
      });
      const instructionScale = state.activeInstruction && 'coachEffectiveness' in state.activeInstruction
        ? state.activeInstruction.coachEffectiveness * state.activeInstruction.advantageMultiplier
        : 1;
      const shoutScale = state.activeShout && 'coachEffectiveness' in state.activeShout
        ? state.activeShout.coachEffectiveness * state.activeShout.advantageMultiplier
        : 1;
      const scaleNeutral = (value: number, scale: number): number => 1 + (value - 1) * scale;
      live.state.coachEffects[side] = {
        initiativeModifier: instruction.initiativeModifier * instructionScale + shout.initiativeModifier * shoutScale,
        ownShotModifier: instruction.userShotModifier * instructionScale + shout.userShotModifier * shoutScale,
        opponentShotModifier: instruction.opponentShotModifier * instructionScale + shout.opponentShotModifier * shoutScale,
        turnoverRiskModifier: instruction.turnoverRiskModifier * instructionScale + shout.turnoverRiskModifier * shoutScale,
        fatigueExtra: instruction.fatigueExtra * instructionScale + shout.fatigueExtra * shoutScale,
        foulMultiplier: scaleNeutral(instruction.foulMultiplier, instructionScale) * scaleNeutral(shout.foulMultiplier, shoutScale),
        injuryMultiplier: scaleNeutral(instruction.injuryMultiplier, instructionScale) * scaleNeutral(shout.injuryMultiplier, shoutScale),
      };
    });
  },

  hasActiveCommand: (states: Record<CupTeamSide, MatchEngineV2CoachSideState>): boolean =>
    Boolean(
      states.HOME.aiControlled ||
      states.AWAY.aiControlled ||
      states.HOME.activeInstruction ||
      states.HOME.activeShout ||
      states.AWAY.activeInstruction ||
      states.AWAY.activeShout
    ),

  /**
   * Produces immutable Polish copy for the future coach ribbon. This method is
   * intentionally read-only: rendering a label can never consume RNG, issue a
   * command or alter the authoritative match state.
   */
  getPresentation: (
    live: CupLiveMatch,
    state: MatchEngineV2CoachSideState,
  ): MatchEngineV2CoachPresentation => {
    const minute = footballMinute(live);
    const instruction = commandPresentation(
      state.activeInstruction,
      minute,
      getUserCoachInstructionLabel(state.activeInstruction?.id),
    );
    const shout = commandPresentation(
      state.activeShout,
      minute,
      getUserCoachShoutLabel(state.activeShout?.id),
    );
    const fragments: string[] = [];
    if (instruction) {
      fragments.push(instruction.status === 'ACTIVE'
        ? `Polecenie aktywne: ${instruction.label}`
        : `Zespół przygotowuje się do polecenia: ${instruction.label}`);
    }
    if (shout) {
      fragments.push(shout.status === 'ACTIVE'
        ? `Okrzyk aktywny: ${shout.label}`
        : `Zawodnicy reagują na okrzyk: ${shout.label}`);
    }
    const decisionReasonLabel = state.lastDecisionReason
      ? DECISION_REASON_LABELS[state.lastDecisionReason]
      : null;
    if (!fragments.length && decisionReasonLabel) fragments.push(decisionReasonLabel);
    return {
      instruction,
      shout,
      lastDecisionReason: state.lastDecisionReason,
      decisionReasonLabel,
      summary: fragments.join(' • ') || 'Brak aktywnych poleceń',
    };
  },
};
