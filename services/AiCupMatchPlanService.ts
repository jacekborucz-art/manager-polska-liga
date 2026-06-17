import {
  InstructionMindset, InstructionTempo, InstructionIntensity,
  InstructionPressing, InstructionCounterAttack,
  AiCupMatchPlan, CupPowerScenario, CupScoreState, AiCupScenarioPlan
} from '../types';

const REASSESSMENT_MINUTES = [45, 60, 70, 75, 80, 85, 90];

const PLANS: Record<CupPowerScenario, Record<CupScoreState, AiCupScenarioPlan>> = {
  MUCH_STRONGER: {
    WINNING: {
      mindset: 'NEUTRAL', tempo: 'NORMAL', intensity: 'NORMAL', pressing: 'PRESSING', counterAttack: 'NORMAL',
      log: 'Rywale pewnie kontrolują grę.',
      escalation: { minute: 80, mindset: 'DEFENSIVE', tempo: 'SLOW', intensity: 'CAUTIOUS', pressing: 'NORMAL', counterAttack: 'COUNTER', log: 'Trener rywali ustawia defensywny blok — chronią prowadzenie.' },
    },
    DRAWING: {
      mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL',
      log: 'Trener rywali jest niezadowolony — naciska na atak.',
    },
    LOSING: {
      mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL',
      log: 'Zaskoczeni rywale — pełna reakcja!',
      escalation: { minute: 75, mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL', log: 'Rywale rzucają się do desperackiego ataku!' },
    },
  },
  STRONGER: {
    WINNING: {
      mindset: 'NEUTRAL', tempo: 'NORMAL', intensity: 'NORMAL', pressing: 'NORMAL', counterAttack: 'COUNTER',
      log: 'Rywale grają pewnie, kontrolując grę.',
      escalation: { minute: 80, mindset: 'DEFENSIVE', tempo: 'SLOW', intensity: 'CAUTIOUS', pressing: 'NORMAL', counterAttack: 'COUNTER', log: 'Rywale cofają się — chcą utrzymać prowadzenie.' },
    },
    DRAWING: {
      mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL',
      log: 'Trener rywali podbija stawkę — pchają do przodu.',
    },
    LOSING: {
      mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL',
      log: 'Nieoczekiwana sytuacja — rywale muszą reagować!',
      escalation: { minute: 75, mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL', log: 'Rywale naciskają z całych sił!' },
    },
  },
  EQUAL: {
    WINNING: {
      mindset: 'NEUTRAL', tempo: 'NORMAL', intensity: 'NORMAL', pressing: 'NORMAL', counterAttack: 'COUNTER',
      log: 'Rywale bronią przewagi.',
      escalation: { minute: 75, mindset: 'DEFENSIVE', tempo: 'SLOW', intensity: 'CAUTIOUS', pressing: 'NORMAL', counterAttack: 'COUNTER', log: 'Rywale skupiają się na utrzymaniu prowadzenia.' },
    },
    DRAWING: {
      mindset: 'NEUTRAL', tempo: 'NORMAL', intensity: 'NORMAL', pressing: 'PRESSING', counterAttack: 'NORMAL',
      log: 'Równa walka — rywale szukają przewagi.',
      escalation: { minute: 65, mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL', log: 'Rywale szukają zwycięskiego gola!' },
    },
    LOSING: {
      mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL',
      log: 'Rywale muszą wyrównać — pełny atak!',
      escalation: { minute: 80, mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL', log: 'Rywal wszystko stawia na jedną kartę!' },
    },
  },
  WEAKER: {
    WINNING: {
      mindset: 'DEFENSIVE', tempo: 'SLOW', intensity: 'CAUTIOUS', pressing: 'NORMAL', counterAttack: 'COUNTER',
      log: 'Nieoczekiwane prowadzenie — rywale bronią kurczowo!',
    },
    DRAWING: {
      mindset: 'NEUTRAL', tempo: 'NORMAL', intensity: 'NORMAL', pressing: 'NORMAL', counterAttack: 'COUNTER',
      log: 'Rywale grają ostrożnie, szukając swojej szansy.',
      escalation: { minute: 70, mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL', log: 'Rywale idą po niespodziankę — szukają gola!' },
    },
    LOSING: {
      mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL',
      log: 'Rywale szarżują mimo trudnej sytuacji!',
      escalation: { minute: 80, mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL', log: 'Rywale desperacko walczą o wyrównanie!' },
    },
  },
  MUCH_WEAKER: {
    WINNING: {
      mindset: 'DEFENSIVE', tempo: 'SLOW', intensity: 'CAUTIOUS', pressing: 'NORMAL', counterAttack: 'COUNTER',
      log: 'Historyczna niespodzianka! Rywale bronią jak lwy.',
    },
    DRAWING: {
      mindset: 'DEFENSIVE', tempo: 'SLOW', intensity: 'CAUTIOUS', pressing: 'NORMAL', counterAttack: 'COUNTER',
      log: 'Rywale grają na remis — liczą na szczęście.',
    },
    LOSING: {
      mindset: 'NEUTRAL', tempo: 'NORMAL', intensity: 'AGGRESSIVE', pressing: 'NORMAL', counterAttack: 'COUNTER',
      log: 'Rywale desperacko szukają szansy.',
      escalation: { minute: 75, mindset: 'OFFENSIVE', tempo: 'FAST', intensity: 'AGGRESSIVE', pressing: 'PRESSING', counterAttack: 'NORMAL', log: 'Rywale nie mają nic do stracenia — szarża!' },
    },
  },
};

const getPowerScenario = (powerRatio: number): CupPowerScenario => {
  if (powerRatio > 0.25) return 'MUCH_STRONGER';
  if (powerRatio > 0.10) return 'STRONGER';
  if (powerRatio > -0.10) return 'EQUAL';
  if (powerRatio > -0.25) return 'WEAKER';
  return 'MUCH_WEAKER';
};

const seededRng = (seed: number): number => {
  const x = Math.sin(seed * 9973) * 10000;
  return x - Math.floor(x);
};

export interface AiCupPlanInstruction {
  mindset: InstructionMindset;
  tempo: InstructionTempo;
  intensity: InstructionIntensity;
  pressing: InstructionPressing;
  counterAttack: InstructionCounterAttack;
  log?: string;
}

export const AiCupMatchPlanService = {
  generatePlan: (params: {
    aiPerceivedPlayerPower: number;
    aiOwnPower: number;
    coachQuality: number;
    seed: number;
  }): AiCupMatchPlan => {
    const { aiPerceivedPlayerPower, aiOwnPower, coachQuality, seed } = params;
    const powerRatio = (aiOwnPower - aiPerceivedPlayerPower) / Math.max(1, Math.max(aiOwnPower, aiPerceivedPlayerPower));
    const misjudgeChance = Math.max(0, (50 - coachQuality) / 100);
    let scenario = getPowerScenario(powerRatio);
    if (seededRng(seed) < misjudgeChance) {
      const SCENARIOS: CupPowerScenario[] = ['MUCH_WEAKER', 'WEAKER', 'EQUAL', 'STRONGER', 'MUCH_STRONGER'];
      const idx = SCENARIOS.indexOf(scenario);
      const dir = seededRng(seed + 7) > 0.5 ? 1 : -1;
      scenario = SCENARIOS[Math.max(0, Math.min(4, idx + dir))];
    }
    return { powerScenario: scenario, coachQuality, plans: PLANS[scenario] };
  },

  getActiveInstructions: (
    plan: AiCupMatchPlan,
    minute: number,
    scoreDiff: number,
  ): AiCupPlanInstruction | null => {
    const scoreState: CupScoreState = scoreDiff > 0 ? 'WINNING' : scoreDiff < 0 ? 'LOSING' : 'DRAWING';
    const sp = plan.plans[scoreState];
    const qualityDelay = Math.floor(Math.max(0, (60 - plan.coachQuality) / 10));

    if (sp.escalation) {
      const escalationMinute = sp.escalation.minute + qualityDelay;
      if (minute >= escalationMinute) {
        return {
          mindset: sp.escalation.mindset ?? sp.mindset,
          tempo: sp.escalation.tempo ?? sp.tempo,
          intensity: sp.escalation.intensity ?? sp.intensity,
          pressing: sp.escalation.pressing ?? sp.pressing,
          counterAttack: sp.escalation.counterAttack ?? sp.counterAttack,
          log: sp.escalation.log ?? sp.log,
        };
      }
    }

    const adjustedMinutes = REASSESSMENT_MINUTES.map(m => m + qualityDelay);
    if (adjustedMinutes.includes(minute)) {
      return { mindset: sp.mindset, tempo: sp.tempo, intensity: sp.intensity, pressing: sp.pressing, counterAttack: sp.counterAttack, log: sp.log };
    }

    return null;
  },
};
