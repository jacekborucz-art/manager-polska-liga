import type { CupMatchInput, CupTeamInput } from '../cupV2';
import { CupMatchClockService, CupMatchEngineV2 } from '../cupV2';
import { validateMatchEngineV2Rules } from './MatchEngineV2Rules';
import { MatchEngineV2CoachService } from './MatchEngineV2CoachService';
import { MatchEngineV2SpatialService } from './MatchEngineV2SpatialService';
import { MatchEngineV2SpatialDecisionService } from './MatchEngineV2SpatialDecisionService';
import type {
  MatchEngineV2Command,
  MatchEngineV2CommandLogEntry,
  MatchEngineV2Input,
  MatchEngineV2Runtime,
  MatchEngineV2Snapshot,
} from './MatchEngineV2Types';

const activeIds = (team: CupTeamInput): string[] =>
  team.lineup.startingXI.filter((id): id is string => Boolean(id));

const validateTeam = (team: CupTeamInput): void => {
  const ids = activeIds(team);
  if (ids.length !== 11) throw new Error(`${team.name} must provide exactly 11 starters.`);
  if (new Set(ids).size !== ids.length) throw new Error(`${team.name} contains a duplicate starter.`);

  const squadIds = new Set(team.players.map(player => player.id));
  const registeredIds = [...ids, ...team.lineup.bench];
  const missingId = registeredIds.find(id => !squadIds.has(id));
  if (missingId) throw new Error(`${team.name} lineup references an unknown player: ${missingId}.`);
};

const toCupInput = (input: MatchEngineV2Input): CupMatchInput => ({
  seed: input.seed,
  home: input.home,
  away: input.away,
  environment: input.environment,
  halfTimeTalks: input.halfTimeTalks,
  calibration: input.calibration,
  config: {
    tickSeconds: input.config?.tickSeconds ?? 5,
    calibrationMode: input.config?.calibrationMode ?? false,
    normalTimeSeconds: input.rules.normalTimeSeconds,
    extraTimeSeconds: input.rules.extraTimeSeconds,
    maxSubstitutions: input.rules.maxSubstitutions,
    enableExtraTime: input.rules.enableExtraTime,
    enablePenaltyShootout: input.rules.enablePenaltyShootout,
  },
});

const recordCommand = (
  runtime: MatchEngineV2Runtime,
  command: MatchEngineV2Command,
  accepted: boolean,
  reason?: string,
): boolean => {
  const entry: MatchEngineV2CommandLogEntry = {
    sequence: runtime.commandLog.length + 1,
    command,
    accepted,
    reason,
  };
  runtime.commandLog.push(entry);
  return accepted;
};

const snapshot = (runtime: MatchEngineV2Runtime): MatchEngineV2Snapshot => ({
  version: runtime.version,
  second: runtime.core.state.second,
  displayClock: CupMatchClockService.displayClock(runtime.core.state, runtime.core.config),
  phase: runtime.core.state.phase,
  isFinished: runtime.core.state.phase === 'FINISHED',
  result: CupMatchEngineV2.snapshotLiveMatch(runtime.core),
  commandLog: runtime.commandLog.map(entry => ({
    ...entry,
    command: entry.command.type === 'UPDATE_INSTRUCTIONS'
      ? { ...entry.command, patch: { ...entry.command.patch } }
      : { ...entry.command },
  })),
  coachState: {
    HOME: {
      ...runtime.coachState.HOME,
      instructionMemory: { ...runtime.coachState.HOME.instructionMemory },
      shoutMemory: { ...runtime.coachState.HOME.shoutMemory },
      shoutRng: { ...runtime.coachState.HOME.shoutRng },
      activeInstruction: runtime.coachState.HOME.activeInstruction ? { ...runtime.coachState.HOME.activeInstruction } : null,
      activeShout: runtime.coachState.HOME.activeShout ? { ...runtime.coachState.HOME.activeShout } : null,
    },
    AWAY: {
      ...runtime.coachState.AWAY,
      instructionMemory: { ...runtime.coachState.AWAY.instructionMemory },
      shoutMemory: { ...runtime.coachState.AWAY.shoutMemory },
      shoutRng: { ...runtime.coachState.AWAY.shoutRng },
      activeInstruction: runtime.coachState.AWAY.activeInstruction ? { ...runtime.coachState.AWAY.activeInstruction } : null,
      activeShout: runtime.coachState.AWAY.activeShout ? { ...runtime.coachState.AWAY.activeShout } : null,
    },
  },
  coachPresentation: {
    HOME: MatchEngineV2CoachService.getPresentation(runtime.core, runtime.coachState.HOME),
    AWAY: MatchEngineV2CoachService.getPresentation(runtime.core, runtime.coachState.AWAY),
  },
  spatial: MatchEngineV2SpatialService.clone(runtime.spatial),
});

const refreshSpatialDecisionContext = (runtime: MatchEngineV2Runtime): void => {
  runtime.core.input.spatialDecisionContext = MatchEngineV2SpatialDecisionService.createContext(runtime.spatial);
};

export const MatchEngineV2 = {
  /**
   * Creates a league/cup-neutral runtime without calculating future actions.
   * This is the boundary that the future Worker and SVG controller will use.
   */
  createMatch: (input: MatchEngineV2Input): MatchEngineV2Runtime => {
    validateMatchEngineV2Rules(input.rules);
    validateTeam(input.home);
    validateTeam(input.away);

    const core = CupMatchEngineV2.createLiveMatch(toCupInput(input));
    const spatial = MatchEngineV2SpatialService.create(core);
    core.input.spatialDecisionContext = MatchEngineV2SpatialDecisionService.createContext(spatial);
    return {
      version: '2.0-prototype',
      rules: { ...input.rules },
      core,
      commandLog: [],
      coachState: {
        HOME: MatchEngineV2CoachService.createState(input.seed, 'HOME', {
          aiControlled: input.coaching?.aiSides?.includes('HOME'),
          coachAttributes: input.coaching?.coachAttributes?.HOME,
        }),
        AWAY: MatchEngineV2CoachService.createState(input.seed, 'AWAY', {
          aiControlled: input.coaching?.aiSides?.includes('AWAY'),
          coachAttributes: input.coaching?.coachAttributes?.AWAY,
        }),
      },
      spatial,
    };
  },

  /**
   * Advances monotonically. The clock is aligned to the simulation tick so UI
   * frame timing cannot introduce a different number of random decisions.
   */
  advanceTo: (runtime: MatchEngineV2Runtime, requestedSecond: number): MatchEngineV2Snapshot => {
    const tick = runtime.core.config.tickSeconds;
    const alignedSecond = Math.max(
      runtime.core.state.second,
      Math.floor(Math.max(0, requestedSecond) / tick) * tick,
    );
    // Match Engine V2 advances one authoritative tick at a time. Before each
    // decision the cup core receives the latest pitch geometry; after it, the
    // spatial state consumes the resulting events. This closed loop is what
    // prevents a pass decision from using positions from several actions ago.
    while (
      runtime.core.state.second < alignedSecond &&
      runtime.core.state.phase !== 'FINISHED'
    ) {
      MatchEngineV2CoachService.refreshEffects(runtime.core, runtime.coachState);
      refreshSpatialDecisionContext(runtime);
      CupMatchEngineV2.advanceLiveMatch(
        runtime.core,
        Math.min(alignedSecond, runtime.core.state.second + tick),
      );
      MatchEngineV2SpatialService.synchronize(runtime.spatial, runtime.core);
    }
    MatchEngineV2CoachService.refreshEffects(runtime.core, runtime.coachState);
    refreshSpatialDecisionContext(runtime);
    return snapshot(runtime);
  },

  /**
   * Applies a command only at the current authoritative clock. Future commands
   * will be queued by the controller later; accepting them here would silently
   * skip simulation time and make UI latency affect the match.
   */
  applyCommand: (runtime: MatchEngineV2Runtime, command: MatchEngineV2Command): boolean => {
    if (runtime.core.state.phase === 'FINISHED') {
      return recordCommand(runtime, command, false, 'MATCH_FINISHED');
    }
    if (command.atSecond !== runtime.core.state.second) {
      return recordCommand(runtime, command, false, 'COMMAND_CLOCK_MISMATCH');
    }
    if (runtime.coachState[command.side].aiControlled) {
      return recordCommand(runtime, command, false, 'SIDE_CONTROLLED_BY_AI');
    }

    if (command.type === 'UPDATE_INSTRUCTIONS') {
      const team = command.side === 'HOME' ? runtime.core.input.home : runtime.core.input.away;
      team.instructions = {
        ...team.instructions,
        ...command.patch,
        lastChangeMinute: Math.max(0, CupMatchClockService.eventMinute(runtime.core.state, runtime.core.config) - 1),
      };
      MatchEngineV2SpatialService.synchronize(runtime.spatial, runtime.core);
      return recordCommand(runtime, command, true);
    }

    if (command.type === 'TOUCHLINE_INSTRUCTION') {
      const applied = MatchEngineV2CoachService.issueInstruction(
        runtime.core,
        runtime.coachState[command.side],
        command.side,
        command.instructionId,
      );
      MatchEngineV2CoachService.refreshEffects(runtime.core, runtime.coachState);
      return recordCommand(runtime, command, applied, applied ? undefined : 'COACH_COMMAND_TOO_EARLY');
    }

    if (command.type === 'COACH_SHOUT') {
      const applied = MatchEngineV2CoachService.issueShout(
        runtime.core,
        runtime.coachState[command.side],
        command.side,
        command.shoutId,
      );
      MatchEngineV2CoachService.refreshEffects(runtime.core, runtime.coachState);
      return recordCommand(runtime, command, applied, applied ? undefined : 'COACH_COMMAND_TOO_EARLY');
    }

    if (command.type === 'SET_HALF_TIME_TALK') {
      if (runtime.core.halfTimeTalkApplied || runtime.core.state.second > 45 * 60) {
        return recordCommand(runtime, command, false, 'HALF_TIME_TALK_WINDOW_CLOSED');
      }
      runtime.core.input.halfTimeTalks = {
        ...runtime.core.input.halfTimeTalks,
        [command.side]: command.talk,
      };
      return recordCommand(runtime, command, true);
    }

    const applied = CupMatchEngineV2.applyManualSubstitution(
      runtime.core,
      command.side,
      command.playerOutId,
      command.playerInId,
    );
    if (applied) MatchEngineV2SpatialService.synchronize(runtime.spatial, runtime.core);
    return recordCommand(runtime, command, applied, applied ? undefined : 'ILLEGAL_SUBSTITUTION');
  },

  snapshot,

  /** Finalization never advances time; it only exposes an already finished result. */
  finalize: (runtime: MatchEngineV2Runtime) => CupMatchEngineV2.finalizeLiveMatch(runtime.core),
};
