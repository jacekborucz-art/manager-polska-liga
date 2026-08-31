import type { CupPitchZone } from '../cupV2';
import type {
  MatchEngineV2Side,
  MatchEngineV2TeamPhase,
  MatchEngineV2TeamSpatialContext,
} from './MatchEngineV2Types';

const TRANSITION_DURATION_SECONDS = 8;

const settledPhase = (
  side: MatchEngineV2Side,
  possession: MatchEngineV2Side,
  ballZone: CupPitchZone,
): MatchEngineV2TeamPhase => {
  if (side !== possession) return 'DEFENSIVE_SHAPE';
  if (ballZone === 'GK' || ballZone === 'DEFENSE') return 'BUILD_UP';
  if (ballZone === 'FINAL_THIRD' || ballZone === 'BOX' || ballZone === 'WIDE_LEFT' || ballZone === 'WIDE_RIGHT') {
    return 'FINAL_THIRD';
  }
  return 'ATTACK';
};

const createContext = (
  side: MatchEngineV2Side,
  possession: MatchEngineV2Side,
  ballZone: CupPitchZone,
  second: number,
): MatchEngineV2TeamSpatialContext => {
  const phase = settledPhase(side, possession, ballZone);
  return {
    phase,
    previousPhase: phase,
    phaseChangedAtSecond: second,
  };
};

const updateContext = (
  previous: MatchEngineV2TeamSpatialContext,
  side: MatchEngineV2Side,
  possession: MatchEngineV2Side,
  ballZone: CupPitchZone,
  second: number,
  possessionChanged: boolean,
): MatchEngineV2TeamSpatialContext => {
  let phase: MatchEngineV2TeamPhase;

  if (possessionChanged) {
    phase = side === possession ? 'TRANSITION_ATTACK' : 'TRANSITION_DEFEND';
  } else if (
    (previous.phase === 'TRANSITION_ATTACK' || previous.phase === 'TRANSITION_DEFEND') &&
    second - previous.phaseChangedAtSecond < TRANSITION_DURATION_SECONDS
  ) {
    phase = previous.phase;
  } else {
    phase = settledPhase(side, possession, ballZone);
  }

  if (phase === previous.phase) return previous;
  return {
    phase,
    previousPhase: previous.phase,
    phaseChangedAtSecond: second,
  };
};

export const MatchEngineV2TeamPhaseService = {
  createContext,
  updateContext,
  transitionDurationSeconds: TRANSITION_DURATION_SECONDS,
};
