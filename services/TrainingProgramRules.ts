import { TRAINING_CYCLES } from '../data/training_definitions_pl';
import { TrainingCycle } from '../types';

export const SPECIALIST_TRAINING_CYCLE_IDS = new Set([
  'T_FINISHING',
  'T_MODERN_GK'
]);

export const isTeamTrainingCycleId = (cycleId: string | null | undefined): boolean =>
  !!cycleId && !SPECIALIST_TRAINING_CYCLE_IDS.has(cycleId);

export const getTeamTrainingCycles = (): TrainingCycle[] =>
  TRAINING_CYCLES.filter(cycle => isTeamTrainingCycleId(cycle.id));

export const findTeamTrainingCycle = (cycleId: string | null | undefined): TrainingCycle | null =>
  TRAINING_CYCLES.find(cycle => cycle.id === cycleId && isTeamTrainingCycleId(cycle.id)) ?? null;

export const getDefaultTeamTrainingCycle = (): TrainingCycle =>
  getTeamTrainingCycles()[0] ?? TRAINING_CYCLES[0];
