import {
  InstructionCounterAttack,
  InstructionIntensity,
  InstructionMindset,
  InstructionPassing,
  InstructionPressing,
  InstructionTempo,
} from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { TacticalMatchupService } from './TacticalMatchupService';

type InstructionKey = `${InstructionTempo}_${InstructionMindset}`;

export interface TacticalInstructionPackage {
  tempo: InstructionTempo;
  mindset: InstructionMindset;
  intensity: InstructionIntensity;
  passing: InstructionPassing;
  pressing: InstructionPressing;
  counterAttack: InstructionCounterAttack;
  confidence: number;
  reason:
    | 'counter_overcommit'
    | 'press_slow_attack'
    | 'control_neutral'
    | 'break_low_block'
    | 'protect_lead'
    | 'chase_game'
    | 'fatigue_safety'
    | 'base_matrix';
}

export interface TacticalInstructionMatrixContext {
  aiTacticId: string;
  opponentTacticId: string;
  opponentTempo: InstructionTempo;
  opponentMindset: InstructionMindset;
  intendedTempo: InstructionTempo;
  intendedMindset: InstructionMindset;
  intendedIntensity: InstructionIntensity;
  aiScoreDiff: number;
  aiMomentum: number;
  aiAvgFatigue: number;
  aiLowestFatigue: number;
  paceGap: number;
  techGap: number;
  minute: number;
  pressureDrama?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getInstructionKey = (
  tempo: InstructionTempo,
  mindset: InstructionMindset
): InstructionKey => `${tempo}_${mindset}`;

const normalize = (
  tempo: InstructionTempo,
  mindset: InstructionMindset,
  intensity: InstructionIntensity
): Pick<TacticalInstructionPackage, 'tempo' | 'mindset' | 'intensity'> => {
  let nextTempo = tempo;
  let nextMindset = mindset;
  let nextIntensity = intensity;

  if (nextMindset === 'DEFENSIVE' && nextTempo === 'FAST') nextTempo = 'NORMAL';
  if (nextMindset === 'OFFENSIVE') {
    if (nextTempo === 'SLOW') nextTempo = 'NORMAL';
    if (nextIntensity === 'CAUTIOUS') nextIntensity = 'NORMAL';
  }

  return { tempo: nextTempo, mindset: nextMindset, intensity: nextIntensity };
};

const pickTransitionPassing = (paceGap: number, techGap: number): InstructionPassing => {
  if (paceGap >= 3) return 'LONG';
  if (techGap >= 4 || paceGap <= -4) return 'SHORT';
  return 'MIXED';
};

const BASE_MATRIX: Record<InstructionKey, Omit<TacticalInstructionPackage, 'confidence' | 'reason'>> = {
  FAST_OFFENSIVE: {
    tempo: 'NORMAL',
    mindset: 'NEUTRAL',
    intensity: 'NORMAL',
    passing: 'MIXED',
    pressing: 'NORMAL',
    counterAttack: 'COUNTER',
  },
  NORMAL_OFFENSIVE: {
    tempo: 'NORMAL',
    mindset: 'NEUTRAL',
    intensity: 'NORMAL',
    passing: 'MIXED',
    pressing: 'NORMAL',
    counterAttack: 'COUNTER',
  },
  SLOW_OFFENSIVE: {
    tempo: 'NORMAL',
    mindset: 'NEUTRAL',
    intensity: 'NORMAL',
    passing: 'MIXED',
    pressing: 'PRESSING',
    counterAttack: 'NORMAL',
  },
  FAST_NEUTRAL: {
    tempo: 'NORMAL',
    mindset: 'NEUTRAL',
    intensity: 'NORMAL',
    passing: 'MIXED',
    pressing: 'NORMAL',
    counterAttack: 'COUNTER',
  },
  NORMAL_NEUTRAL: {
    tempo: 'NORMAL',
    mindset: 'NEUTRAL',
    intensity: 'NORMAL',
    passing: 'MIXED',
    pressing: 'NORMAL',
    counterAttack: 'NORMAL',
  },
  SLOW_NEUTRAL: {
    tempo: 'NORMAL',
    mindset: 'NEUTRAL',
    intensity: 'NORMAL',
    passing: 'MIXED',
    pressing: 'PRESSING',
    counterAttack: 'NORMAL',
  },
  FAST_DEFENSIVE: {
    tempo: 'NORMAL',
    mindset: 'OFFENSIVE',
    intensity: 'NORMAL',
    passing: 'MIXED',
    pressing: 'PRESSING',
    counterAttack: 'NORMAL',
  },
  NORMAL_DEFENSIVE: {
    tempo: 'NORMAL',
    mindset: 'OFFENSIVE',
    intensity: 'NORMAL',
    passing: 'MIXED',
    pressing: 'NORMAL',
    counterAttack: 'NORMAL',
  },
  SLOW_DEFENSIVE: {
    tempo: 'NORMAL',
    mindset: 'OFFENSIVE',
    intensity: 'NORMAL',
    passing: 'SHORT',
    pressing: 'PRESSING',
    counterAttack: 'NORMAL',
  },
};

export const TacticalInstructionMatrixService = {
  getMatrixRecommendation: (
    context: TacticalInstructionMatrixContext
  ): TacticalInstructionPackage => {
    const opponentKey = getInstructionKey(context.opponentTempo, context.opponentMindset);
    const base = BASE_MATRIX[opponentKey];
    const aiTactic = TacticRepository.getById(context.aiTacticId);
    const opponentTactic = TacticRepository.getById(context.opponentTacticId);
    const suggestedCounters = TacticalMatchupService.suggestCounterTactics(context.opponentTacticId);
    const isSuggestedCounter = suggestedCounters.includes(context.aiTacticId);
    const opponentOvercommits =
      context.opponentTempo === 'FAST' &&
      context.opponentMindset === 'OFFENSIVE';
    const opponentSitsDeep =
      context.opponentMindset === 'DEFENSIVE' ||
      opponentTactic.defenseBias >= 78;
    const seriousFatigue = context.aiAvgFatigue < 67 || context.aiLowestFatigue < 46;
    const mustProtect = context.aiScoreDiff > 0 && context.minute >= 70;
    const mustChase = context.aiScoreDiff < 0 && context.minute >= 55;

    let tempo = base.tempo;
    let mindset = base.mindset;
    let intensity = base.intensity;
    let passing = pickTransitionPassing(context.paceGap, context.techGap);
    let pressing = base.pressing;
    let counterAttack = base.counterAttack;
    let reason: TacticalInstructionPackage['reason'] = 'base_matrix';
    let confidence = 0.42;

    if (opponentOvercommits) {
      tempo = context.paceGap >= 3 ? 'FAST' : 'NORMAL';
      mindset = mustChase ? 'OFFENSIVE' : 'NEUTRAL';
      passing = context.paceGap >= 2 ? 'LONG' : pickTransitionPassing(context.paceGap, context.techGap);
      pressing = 'NORMAL';
      counterAttack = 'COUNTER';
      reason = 'counter_overcommit';
      confidence += 0.24;
    } else if (context.opponentTempo === 'SLOW' && context.opponentMindset === 'OFFENSIVE') {
      tempo = context.techGap >= 3 ? 'FAST' : 'NORMAL';
      mindset = 'NEUTRAL';
      passing = context.techGap >= 3 ? 'SHORT' : 'MIXED';
      pressing = seriousFatigue ? 'NORMAL' : 'PRESSING';
      counterAttack = 'NORMAL';
      reason = 'press_slow_attack';
      confidence += 0.16;
    } else if (opponentSitsDeep) {
      tempo = context.techGap >= 3 ? 'NORMAL' : 'FAST';
      mindset = mustProtect ? 'NEUTRAL' : 'OFFENSIVE';
      passing = context.techGap >= 3 ? 'SHORT' : 'MIXED';
      pressing = seriousFatigue ? 'NORMAL' : 'PRESSING';
      counterAttack = 'NORMAL';
      reason = 'break_low_block';
      confidence += 0.14;
    } else if (mustProtect) {
      tempo = 'SLOW';
      mindset = 'DEFENSIVE';
      intensity = seriousFatigue ? 'CAUTIOUS' : 'NORMAL';
      passing = 'MIXED';
      pressing = 'NORMAL';
      counterAttack = opponentTactic.attackBias >= 58 ? 'COUNTER' : 'NORMAL';
      reason = 'protect_lead';
      confidence += 0.18;
    } else if (mustChase) {
      tempo = seriousFatigue ? 'NORMAL' : 'FAST';
      mindset = 'OFFENSIVE';
      intensity = context.minute >= 78 && !seriousFatigue ? 'AGGRESSIVE' : 'NORMAL';
      passing = context.paceGap >= 2 ? 'LONG' : pickTransitionPassing(context.paceGap, context.techGap);
      pressing = seriousFatigue ? 'NORMAL' : 'PRESSING';
      counterAttack = 'NORMAL';
      reason = 'chase_game';
      confidence += 0.18;
    } else if (context.opponentMindset === 'NEUTRAL') {
      tempo = context.intendedTempo;
      mindset = context.intendedMindset;
      intensity = context.intendedIntensity;
      passing = pickTransitionPassing(context.paceGap, context.techGap);
      pressing = aiTactic.pressingIntensity >= 70 && !seriousFatigue ? 'PRESSING' : base.pressing;
      counterAttack = base.counterAttack;
      reason = 'control_neutral';
      confidence += 0.08;
    }

    if (isSuggestedCounter) confidence += 0.14;
    if (aiTactic.defenseBias >= 78 && opponentOvercommits) confidence += 0.06;
    if (aiTactic.attackBias >= 72 && opponentSitsDeep && !seriousFatigue) confidence += 0.06;
    if (context.aiMomentum <= -35 && !seriousFatigue) {
      pressing = pressing === 'PRESSING' && context.aiAvgFatigue < 72 ? 'NORMAL' : pressing;
      counterAttack = opponentTactic.attackBias >= 55 ? 'COUNTER' : counterAttack;
    }
    if (seriousFatigue) {
      tempo = tempo === 'FAST' ? 'NORMAL' : tempo;
      intensity = intensity === 'AGGRESSIVE' ? 'NORMAL' : intensity;
      pressing = 'NORMAL';
      reason = reason === 'protect_lead' ? reason : 'fatigue_safety';
      confidence -= 0.06;
    }

    const normalized = normalize(tempo, mindset, intensity);
    return {
      ...normalized,
      passing,
      pressing,
      counterAttack,
      confidence: clamp(confidence + (context.pressureDrama ?? 0) * 0.05, 0.20, 0.92),
      reason,
    };
  },
};
