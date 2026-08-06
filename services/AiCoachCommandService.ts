import {
  ActiveAiCoachInstruction,
  ActiveAiCoachShout,
  CoachAttributes,
  InstructionPassing,
  InstructionTempo,
  Tactic,
  TacticalInstructions,
  UserCoachInstructionId,
  UserCoachInstructionMemory,
  UserCoachShoutId,
  UserCoachShoutMemory,
  UserCoachShoutRngState,
} from '../types';
import { UserCoachInstructionService } from './UserCoachInstructionService';
import {
  getUserCoachShoutLabel,
  UserCoachShoutService,
  type UserCoachShoutSituation,
} from './UserCoachShoutService';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const INSTRUCTION_IDS: UserCoachInstructionId[] = [
  'NARROW',
  'WIDE',
  'CALM_DOWN',
  'SPEED_UP',
  'KEEP_BALL',
  'TAKE_RISKS',
  'CLOSE_DOWN',
  'DROP_BACK',
  'ALL_FORWARD',
  'TIME_WASTE',
];

const SHOUT_IDS: UserCoachShoutId[] = [
  'MOTIVATE',
  'PRAISE',
  'FOCUS',
  'NO_PANIC',
  'MORE_EFFORT',
  'CALM_EMOTIONS',
  'DO_BETTER',
  'DONT_GIVE_UP',
];

const MAX_SHOUT_SILENCE_MINUTES = 14;

type RandomCursor = {
  state: UserCoachShoutRngState;
  next: () => number;
};

const createRandomCursor = (initialState: UserCoachShoutRngState): RandomCursor => {
  let state = initialState;
  return {
    get state() { return state; },
    next: () => {
      let next = state.streamState >>> 0;
      if (next === 0) next = 0x6d2b79f5;
      next ^= next << 13;
      next ^= next >>> 17;
      next ^= next << 5;
      next >>>= 0;
      state = { ...state, streamState: next, drawCount: state.drawCount + 1 };
      return next / 4294967296;
    },
  };
};

const getCoachQuality = (attributes: CoachAttributes): number => clamp(
  attributes.decisionMaking * 0.45 + attributes.experience * 0.35 + attributes.motivation * 0.20,
  0,
  100
);

const isLogicalInstruction = ({
  id,
  alignment,
  minute,
  scoreDiff,
  averageFatigue,
}: {
  id: UserCoachInstructionId;
  alignment: number;
  minute: number;
  scoreDiff: number;
  averageFatigue: number;
}): boolean => {
  if (alignment < 0.10) return false;
  if (id === 'ALL_FORWARD') return minute >= 65 && scoreDiff < 0 && averageFatigue >= 58;
  if (id === 'TIME_WASTE') return minute >= 65 && scoreDiff > 0;
  if (id === 'DROP_BACK' && scoreDiff < 0 && minute >= 65) return false;
  if ((id === 'SPEED_UP' || id === 'TAKE_RISKS') && scoreDiff > 0 && minute >= 70) return false;
  if ((id === 'CALM_DOWN' || id === 'KEEP_BALL') && scoreDiff < 0 && minute >= 80) return false;
  if (id === 'CLOSE_DOWN' && averageFatigue < 58) return false;
  return true;
};

const isLogicalShout = ({
  id,
  alignment,
  situation,
}: {
  id: UserCoachShoutId;
  alignment: number;
  situation: UserCoachShoutSituation;
}): boolean => {
  if (alignment < 0.15) return false;
  const fit = UserCoachShoutService.getSelectionFit(id, situation);
  if (id === 'PRAISE' && (fit.contextCategory === 'LOSING_POORLY' || fit.contextCategory === 'JUST_CONCEDED')) return false;
  if (id === 'DO_BETTER' && situation.scoreDiff > 0 && fit.mentalState !== 'COMPLACENT') return false;
  if (id === 'DONT_GIVE_UP' && situation.scoreDiff > 0 && !situation.recentlyConceded) return false;
  if (id === 'MORE_EFFORT' && fit.mentalState === 'EXHAUSTED') return false;
  if (id === 'CALM_EMOTIONS' && !['NERVOUS', 'FRUSTRATED'].includes(fit.mentalState) && situation.yellowCardCount < 2) return false;
  if (id === 'NO_PANIC' && !['NERVOUS', 'EXHAUSTED'].includes(fit.mentalState) && fit.contextCategory !== 'LEADING_NARROWLY') return false;
  return true;
};

/**
 * AI TOUCHLINE COMMAND DECISION LAYER
 * ===================================
 *
 * This service gives the AI the same short-lived instruction and emotional-shout vocabulary as the
 * human player without allowing low coach attributes to produce absurd football decisions. Selection
 * has two distinct stages which must remain separate:
 *
 * 1. A hard logic gate removes candidates that contradict basic match logic. ALL_FORWARD is available
 *    only while losing late, TIME_WASTE only while leading late, an exhausted team cannot be ordered to
 *    make an extreme physical push, and clearly inappropriate emotional shouts are rejected. Coach RNG
 *    is never allowed to restore a rejected candidate.
 * 2. Coach quality controls ranking noise inside the remaining sensible pool. An elite coach normally
 *    selects the highest-scoring matrix option. A weak coach may select the second or third reasonable
 *    option, react later and produce a weaker response, but still behaves like a human football coach.
 * 3. Shout randomness controls variation, not indefinite silence. A logical shout is forced when the AI
 *    has been quiet for MAX_SHOUT_SILENCE_MINUTES, and the next decision deadline is shortened so that
 *    the match loop cannot skip that limit. This keeps the coach visible during normal play without
 *    turning shouts into a mechanical every-few-minutes timer.
 *
 * Decision quality uses decisionMaking, experience and motivation. The command stream has private crypto
 * entropy and never reads the main match seed. Every issued instruction/shout also receives a random
 * 1.01-1.10 advantage multiplier. MatchLiveView applies that multiplier to the magnitude around neutral
 * (additive modifiers or the distance from multiplier 1.0), never as a flat percentage-point bonus to a
 * shot or goal probability.
 */
export const AiCoachCommandService = {
  createRngState: (fixedEntropySeed?: number): UserCoachShoutRngState =>
    UserCoachShoutService.createRngState(fixedEntropySeed),

  decide: ({
    minute,
    coachAttributes,
    rngState,
    aiInstructions,
    aiTactic,
    userTactic,
    aiScoreDiff,
    userTempo,
    userPassing,
    situation,
    previousInstruction,
    instructionMemory,
    previousShout,
    shoutMemory,
  }: {
    minute: number;
    coachAttributes: CoachAttributes;
    rngState: UserCoachShoutRngState;
    aiInstructions: TacticalInstructions;
    aiTactic: Tactic;
    userTactic: Tactic;
    aiScoreDiff: number;
    userTempo?: InstructionTempo;
    userPassing?: InstructionPassing;
    situation: UserCoachShoutSituation;
    previousInstruction?: ActiveAiCoachInstruction | null;
    instructionMemory?: UserCoachInstructionMemory;
    previousShout?: ActiveAiCoachShout | null;
    shoutMemory?: UserCoachShoutMemory;
  }): {
    instruction: ActiveAiCoachInstruction | null;
    instructionMemory: UserCoachInstructionMemory;
    shout: ActiveAiCoachShout | null;
    shoutMemory: UserCoachShoutMemory;
    shoutAnnouncement: { id: string; text: string } | null;
    rngState: UserCoachShoutRngState;
    nextDecisionMinute: number;
  } => {
    const rng = createRandomCursor(rngState);
    const quality = getCoachQuality(coachAttributes);
    const selectionNoise = 0.58 - quality * 0.0045;
    const aiAverageFatigue = situation.averageFatigue;

    const instructionCandidates = INSTRUCTION_IDS
      .map(id => ({
        id,
        alignment: UserCoachInstructionService.getSelectionAlignment({
          id,
          instructions: aiInstructions,
          tactic: aiTactic,
          opponentTactic: userTactic,
          minute,
          scoreDiff: aiScoreDiff,
          opponentTempo: userTempo,
          opponentPassing: userPassing,
        }),
      }))
      .filter(candidate => isLogicalInstruction({
        id: candidate.id,
        alignment: candidate.alignment,
        minute,
        scoreDiff: aiScoreDiff,
        averageFatigue: aiAverageFatigue,
      }))
      .map(candidate => ({ ...candidate, rankedScore: candidate.alignment + (rng.next() - 0.5) * selectionNoise * 2 }))
      .sort((left, right) => right.rankedScore - left.rankedScore);

    const instructionChoice = instructionCandidates[0] ?? null;
    const instructionIssueChance = clamp(0.58 + quality / 300 + Math.max(0, Math.abs(aiScoreDiff)) * 0.04, 0.58, 0.94);
    let instruction: ActiveAiCoachInstruction | null = null;
    let nextInstructionMemory: UserCoachInstructionMemory = instructionMemory ?? {
      lastId: null,
      lastIssuedMinute: -99,
      repeatCount: 0,
      issueCount: 0,
    };
    if (instructionChoice && rng.next() < instructionIssueChance) {
      const id = instructionChoice.id;
      const issueCount = nextInstructionMemory.issueCount + 1;
      const recentRepeat = nextInstructionMemory.lastId === id && minute - nextInstructionMemory.lastIssuedMinute <= 12;
      const repeatCount = recentRepeat ? Math.min(3, nextInstructionMemory.repeatCount + 1) : 0;
      const rapidChange = Boolean(previousInstruction && previousInstruction.id !== id && minute - previousInstruction.issuedMinute < 3);
      const delayChance = clamp(0.44 - quality * 0.0031, 0.12, 0.44);
      const startsMinute = minute + 1 + (rng.next() < delayChance ? 1 : 0);
      const duration = 5 + Math.floor(rng.next() * 5);
      const coachEffectiveness = clamp(0.66 + quality * 0.0042 + (rng.next() - 0.5) * 0.18, 0.58, 1.14);
      const advantageMultiplier = 1.01 + rng.next() * 0.09;
      instruction = {
        id,
        issuedMinute: minute,
        startsMinute,
        expiryMinute: startsMinute + duration - 1,
        responseFactor: coachEffectiveness,
        misunderstandingRoll: rng.next(),
        repeatCount,
        confusionUntilMinute: rapidChange ? minute + 2 : -1,
        coachEffectiveness,
        advantageMultiplier,
      };
      nextInstructionMemory = { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount };
    }

    const shoutCandidates = SHOUT_IDS
      .map(id => ({ id, ...UserCoachShoutService.getSelectionFit(id, situation) }))
      .filter(candidate => isLogicalShout({ id: candidate.id, alignment: candidate.alignment, situation }))
      .map(candidate => ({ ...candidate, rankedScore: candidate.alignment + (rng.next() - 0.5) * selectionNoise * 2 }))
      .sort((left, right) => right.rankedScore - left.rankedScore);

    const shoutChoice = shoutCandidates[0] ?? null;
    const emotionalUrgency = situation.recentlyConceded || aiScoreDiff < 0 || Math.abs(situation.userMomentum) >= 28;
    const shoutIssueChance = clamp(0.42 + quality / 350 + (emotionalUrgency ? 0.18 : 0), 0.42, 0.88);
    let shout: ActiveAiCoachShout | null = null;
    let shoutAnnouncement: { id: string; text: string } | null = null;
    let nextShoutMemory: UserCoachShoutMemory = shoutMemory ?? {
      lastId: null,
      lastIssuedMinute: -99,
      repeatCount: 0,
      issueCount: 0,
    };
    const shoutSilenceMinutes = minute - nextShoutMemory.lastIssuedMinute;
    const mustBreakShoutSilence = shoutSilenceMinutes >= MAX_SHOUT_SILENCE_MINUTES;
    if (shoutChoice && (mustBreakShoutSilence || rng.next() < shoutIssueChance)) {
      const id = shoutChoice.id;
      const issueCount = nextShoutMemory.issueCount + 1;
      const recentRepeat = nextShoutMemory.lastId === id && minute - nextShoutMemory.lastIssuedMinute <= 12;
      const repeatCount = recentRepeat ? Math.min(3, nextShoutMemory.repeatCount + 1) : 0;
      const rapidChange = Boolean(previousShout && previousShout.id !== id && minute - previousShout.issuedMinute < 3);
      const delayChance = clamp(0.40 - quality * 0.0028, 0.10, 0.40);
      const startsMinute = minute + 1 + (rng.next() < delayChance ? 1 : 0);
      const duration = 5 + Math.floor(rng.next() * 4);
      const coachEffectiveness = clamp(0.68 + quality * 0.0038 + (rng.next() - 0.5) * 0.16, 0.60, 1.12);
      const advantageMultiplier = 1.01 + rng.next() * 0.09;
      shout = {
        id,
        issuedMinute: minute,
        startsMinute,
        expiryMinute: startsMinute + duration - 1,
        responseSeed: Math.floor(rng.next() * 0xffffffff) >>> 0,
        unexpectedSeed: Math.floor(rng.next() * 0xffffffff) >>> 0,
        repeatCount,
        confusionUntilMinute: rapidChange ? minute + 2 : -1,
        contextCategory: shoutChoice.contextCategory,
        mentalState: shoutChoice.mentalState,
        contextFit: shoutChoice.contextFit,
        mentalFit: shoutChoice.mentalFit,
        coachEffectiveness,
        advantageMultiplier,
      };
      nextShoutMemory = { lastId: id, lastIssuedMinute: minute, repeatCount, issueCount };
      shoutAnnouncement = {
        id: `ai-shout-${minute}-${rng.state.drawCount}`,
        text: getUserCoachShoutLabel(id),
      };
    }

    const urgent = aiScoreDiff < 0 && minute >= 65;
    const baseDelay = urgent ? 5 : Math.round(11 - quality * 0.035);
    const delayWindow = urgent ? 4 : 6;
    const routineNextDecisionMinute = minute + Math.max(4, baseDelay + Math.floor(rng.next() * delayWindow));
    const nextShoutDeadline = nextShoutMemory.lastIssuedMinute >= 0
      ? nextShoutMemory.lastIssuedMinute + MAX_SHOUT_SILENCE_MINUTES
      : minute + 4;
    const nextDecisionMinute = Math.min(
      routineNextDecisionMinute,
      Math.max(minute + 4, nextShoutDeadline)
    );

    return {
      instruction,
      instructionMemory: nextInstructionMemory,
      shout,
      shoutMemory: nextShoutMemory,
      shoutAnnouncement,
      rngState: rng.state,
      nextDecisionMinute,
    };
  },

  getCoachQuality,
  isLogicalInstruction,
  isLogicalShout,
};
