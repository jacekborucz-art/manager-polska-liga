import { MatchEventType } from '../../../../types';
import type { CupEngineConfig, CupHalfTimeTalk, CupLiveMatch, CupMatchInput, CupMatchResult, CupTeamInput, CupTeamSide } from './CupMatchTypes';
import { DEFAULT_CUP_ENGINE_CONFIG } from './CupMatchTypes';
import { createInitialCupRuntimeState, CupMatchLoop } from './CupMatchLoop';
import { clamp, weightedScore } from './CupMath';
import { CupPenaltyShootoutService } from './CupPenaltyShootoutService';
import { CupPlayerStatsAggregator } from './CupPlayerStatsAggregator';
import { CupExtraTimeService } from './CupExtraTimeService';
import { CupMatchClockService } from './CupMatchClockService';

const alignedAddedTime = (
  state: CupLiveMatch['state'],
  config: CupEngineConfig,
  fromSecond: number,
): number => {
  const rawSeconds = CupExtraTimeService.getAddedTimeSeconds(state, {
    fromSecond,
    toSecond: state.second,
  });
  return Math.ceil(rawSeconds / config.tickSeconds) * config.tickSeconds;
};

const cloneTeam = (team: CupTeamInput): CupTeamInput => ({
  ...team,
  lineup: {
    ...team.lineup,
    startingXI: [...team.lineup.startingXI],
    bench: [...team.lineup.bench],
    reserves: [...team.lineup.reserves],
  },
  instructions: { ...team.instructions },
});

const cloneInput = (input: CupMatchInput): CupMatchInput => ({
  ...input,
  home: cloneTeam(input.home),
  away: cloneTeam(input.away),
  environment: { ...input.environment },
  config: input.config ? { ...input.config } : undefined,
  halfTimeTalks: input.halfTimeTalks ? { ...input.halfTimeTalks } : undefined,
});

const cloneLineup = (lineup: CupTeamInput['lineup']): CupTeamInput['lineup'] => ({
  ...lineup,
  startingXI: [...lineup.startingXI],
  bench: [...lineup.bench],
  reserves: [...lineup.reserves],
});

const activePlayers = (team: CupTeamInput) => {
  const byId = new Map(team.players.map(player => [player.id, player]));
  return team.lineup.startingXI
    .map(id => id ? byId.get(id) : undefined)
    .filter((player): player is CupTeamInput['players'][number] => Boolean(player));
};

const teamMentalReceptivity = (team: CupTeamInput): number => {
  const players = activePlayers(team);
  if (players.length === 0) return 1;
  const mentalAverage = players.reduce((sum, player) => sum + weightedScore(player.attributes, {
    mentality: 0.42,
    leadership: 0.24,
    workRate: 0.16,
    stamina: 0.10,
    positioning: 0.08,
  }), 0) / players.length;

  return clamp(0.82 + (mentalAverage - 50) * 0.006, 0.72, 1.18);
};

const talkBaseImpact = (talk: CupHalfTimeTalk, scoreDiff: number): { motivation: number; organization: number; fatigueRelief: number; momentum: number } => {
  const intensity = clamp(talk.intensity ?? 0.65, 0, 1);
  const clarity = clamp(talk.clarity ?? 0.60, 0, 1);

  if (talk.style === 'NONE') return { motivation: 0, organization: 0, fatigueRelief: 0, momentum: 0 };
  if (talk.style === 'CALM') return { motivation: 2.5 + clarity * 1.5, organization: 4 + clarity * 4, fatigueRelief: 0.8, momentum: 1.5 };
  if (talk.style === 'ENCOURAGE') return { motivation: 5 + intensity * 3, organization: 1.5 + clarity * 2, fatigueRelief: 0.6, momentum: 4 };
  if (talk.style === 'DEMAND_MORE') {
    const trailingBonus = scoreDiff <= 0 ? 3 : 0;
    return { motivation: 4 + intensity * 5 + trailingBonus, organization: -2 + clarity * 3, fatigueRelief: -0.6, momentum: 5 };
  }
  if (talk.style === 'PRAISE') {
    const leadingBonus = scoreDiff > 0 ? 3 : -1;
    return { motivation: 3 + leadingBonus + intensity * 2, organization: 1 + clarity * 2, fatigueRelief: 0.4, momentum: 2.5 };
  }
  return { motivation: 3 + clarity * 4, organization: 5 + clarity * 5, fatigueRelief: 0.3, momentum: 2 };
};

const applyHalfTimeTalk = (input: CupMatchInput, state: ReturnType<typeof createInitialCupRuntimeState>): void => {
  const talks = input.halfTimeTalks;
  if (!talks) return;

  (['HOME', 'AWAY'] as CupTeamSide[]).forEach(side => {
    const talk = talks[side];
    if (!talk || talk.style === 'NONE') return;

    const team = side === 'HOME' ? input.home : input.away;
    const scoreDiff = side === 'HOME'
      ? state.homeScore - state.awayScore
      : state.awayScore - state.homeScore;
    const receptivity = teamMentalReceptivity(team);
    const impact = talkBaseImpact(talk, scoreDiff);
    const motivationDelta = impact.motivation * receptivity;
    const organizationDelta = impact.organization * receptivity;
    const momentumDelta = impact.momentum * receptivity;

    team.preMatchMotivation = clamp(team.preMatchMotivation + motivationDelta, 0, 100);
    team.morale = clamp(team.morale + motivationDelta * 0.38, 0, 100);
    if (talk.style === 'TACTICAL_RESET') {
      team.instructions.tempoResponseFactor = clamp(team.instructions.tempoResponseFactor + 0.08, 0.5, 1.4);
      team.instructions.mindsetResponseFactor = clamp(team.instructions.mindsetResponseFactor + 0.08, 0.5, 1.4);
      team.instructions.pressingResponseFactor = clamp(team.instructions.pressingResponseFactor + 0.05, 0.5, 1.4);
      team.instructions.markingResponseFactor = clamp((team.instructions.markingResponseFactor ?? 1) + 0.08, 0.5, 1.4);
    }

    activePlayers(team).forEach(player => {
      state.fatigue[player.id] = clamp((state.fatigue[player.id] ?? player.condition) + impact.fatigueRelief * receptivity, 15, 100);
    });

    state.organization[side] = clamp(state.organization[side] + organizationDelta, 30, 95);
    state.momentum = clamp(state.momentum + (side === 'HOME' ? momentumDelta : -momentumDelta), -100, 100);
    // Preserve a bounded, temporary response to the team talk. Morale alone
    // was too diluted by the composite team profile, making an encouraging
    // interval talk statistically invisible. This value only affects future
    // possession/progression and fades throughout the second half.
    state.halfTimeResponse[side] = clamp(
      motivationDelta * 0.78 + Math.max(0, organizationDelta) * 0.22,
      0,
      12,
    );
  });
};

const buildResult = (
  input: CupMatchInput,
  state: ReturnType<typeof createInitialCupRuntimeState>,
  initialLineup: CupLiveMatch['initialLineup'],
  shootout?: {
    penaltyScore: { home: number; away: number };
    attempts: NonNullable<CupMatchResult['penaltyShootout']>;
    winner: CupTeamSide;
  },
): CupMatchResult => {
  const playerStats = CupPlayerStatsAggregator.aggregate({
    match: input,
    events: state.events,
    finalSecond: state.second,
    homeScore: state.homeScore,
    awayScore: state.awayScore,
    initialLineups: {
      HOME: initialLineup.HOME.startingXI,
      AWAY: initialLineup.AWAY.startingXI,
    },
    finalFatigue: state.fatigue,
    teamStats: state.stats,
  });

  const winner: CupTeamSide | undefined = shootout?.winner ?? (
    state.homeScore > state.awayScore ? 'HOME' :
    state.awayScore > state.homeScore ? 'AWAY' :
    undefined
  );

  return {
    homeScore: state.homeScore,
    awayScore: state.awayScore,
    winner,
    decidedByPenalties: Boolean(shootout),
    penaltyScore: shootout?.penaltyScore,
    penaltyShootout: shootout?.attempts,
    stats: state.stats,
    playerStats,
    events: state.events,
    finalState: state,
  };
};

const cloneResult = (result: CupMatchResult): CupMatchResult => ({
  ...result,
  penaltyScore: result.penaltyScore ? { ...result.penaltyScore } : undefined,
  penaltyShootout: result.penaltyShootout?.map(attempt => ({ ...attempt })),
  stats: {
    HOME: { ...result.stats.HOME },
    AWAY: { ...result.stats.AWAY },
  },
  playerStats: {
    HOME: Object.fromEntries(Object.entries(result.playerStats.HOME).map(([id, stats]) => [id, { ...stats }])),
    AWAY: Object.fromEntries(Object.entries(result.playerStats.AWAY).map(([id, stats]) => [id, { ...stats }])),
  },
  events: result.events.map(event => ({
    ...event,
    detail: event.detail ? { ...event.detail } : undefined,
  })),
  finalState: {
    ...result.finalState,
    pressure: { ...result.finalState.pressure },
    organization: { ...result.finalState.organization },
    halfTimeResponse: { ...result.finalState.halfTimeResponse },
    coachEffects: {
      HOME: { ...result.finalState.coachEffects.HOME },
      AWAY: { ...result.finalState.coachEffects.AWAY },
    },
    fatigue: { ...result.finalState.fatigue },
    yellowCards: { ...result.finalState.yellowCards },
    redCards: { ...result.finalState.redCards },
    injuries: { ...result.finalState.injuries },
    substitutionsUsed: { ...result.finalState.substitutionsUsed },
    stats: {
      HOME: { ...result.finalState.stats.HOME },
      AWAY: { ...result.finalState.stats.AWAY },
    },
    events: result.finalState.events.map(event => ({
      ...event,
      detail: event.detail ? { ...event.detail } : undefined,
    })),
  },
});

const finishLiveMatch = (live: CupLiveMatch): CupMatchResult => {
  if (live.finalResult) return live.finalResult;
  live.state.phase = 'FINISHED';
  live.finalResult = buildResult(live.input, live.state, live.initialLineup);
  return live.finalResult;
};

const finishLiveMatchWithPenalties = (live: CupLiveMatch): CupMatchResult => {
  if (live.finalResult) return live.finalResult;
  live.state.phase = 'PENALTY_SHOOTOUT';
  const penalties = CupPenaltyShootoutService.simulate(live.input, live.state.fatigue, {
    redCards: live.state.redCards,
    injuries: live.state.injuries,
    startSecond: live.state.second,
  });
  live.state.events.push(...penalties.events);
  live.state.second = Math.max(live.state.second, ...penalties.events.map(event => event.second));
  live.state.phase = 'FINISHED';
  live.finalResult = buildResult(live.input, live.state, live.initialLineup, {
    penaltyScore: { home: penalties.home, away: penalties.away },
    attempts: penalties.attempts,
    winner: penalties.winner,
  });
  return live.finalResult;
};

export const CupMatchEngineV2 = {
  /**
   * Creates an advance-only live simulation. No match tick is executed here,
   * therefore the score, winner and future event list are unknown at kick-off.
   */
  createLiveMatch: (input: CupMatchInput): CupLiveMatch => {
    const runtimeInput = cloneInput(input);
    const config: CupEngineConfig = { ...DEFAULT_CUP_ENGINE_CONFIG, ...runtimeInput.config };
    return {
      input: runtimeInput,
      config,
      state: createInitialCupRuntimeState(runtimeInput),
      initialLineup: {
        HOME: cloneLineup(runtimeInput.home.lineup),
        AWAY: cloneLineup(runtimeInput.away.lineup),
      },
      halfTimeTalkApplied: false,
    };
  },

  /**
   * Advances only toward `targetSecond`. Requests behind the current clock are
   * ignored so a tactical change can never cause already played actions to be
   * simulated again. A non-null return value means the match has finished.
   */
  advanceLiveMatch: (live: CupLiveMatch, targetSecond: number): CupMatchResult | null => {
    if (live.finalResult) return live.finalResult;
    const requestedSecond = Math.max(live.state.second, Math.floor(targetSecond));
    const firstHalfRegulationEnd = Math.floor(live.config.normalTimeSeconds / 2);

    if (live.state.second < firstHalfRegulationEnd) {
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, firstHalfRegulationEnd), live.config);
      if (requestedSecond <= firstHalfRegulationEnd) return null;
    }

    // Each regulation half owns its interruption budget. The first-half value
    // is frozen before the interval so later goals, cards or substitutions can
    // never retroactively move the half-time whistle.
    if (live.state.firstHalfAddedTimeSeconds === 0) {
      live.state.firstHalfAddedTimeSeconds = alignedAddedTime(live.state, live.config, 0);
      live.state.addedTimeSeconds = live.state.firstHalfAddedTimeSeconds;
    }
    const firstHalfEnd = firstHalfRegulationEnd + live.state.firstHalfAddedTimeSeconds;
    if (live.state.second < firstHalfEnd) {
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, firstHalfEnd), live.config);
      if (requestedSecond < firstHalfEnd || live.state.second < firstHalfEnd) return null;
    }

    if (!live.halfTimeTalkApplied) {
      applyHalfTimeTalk(live.input, live.state);
      live.halfTimeTalkApplied = true;
      live.state.phase = 'SECOND_HALF';
      live.state.possession = live.state.firstHalfKickOffSide === 'HOME' ? 'AWAY' : 'HOME';
      live.state.possessionReason = 'HALF_START';
      live.state.ballCarrierId = undefined;
      live.state.ballZone = 'MIDFIELD';
    }

    const secondHalfRegulationEnd = firstHalfEnd + (live.config.normalTimeSeconds - firstHalfRegulationEnd);
    if (live.state.second < secondHalfRegulationEnd) {
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, secondHalfRegulationEnd), live.config);
      if (requestedSecond < secondHalfRegulationEnd || live.state.second < secondHalfRegulationEnd) return null;
    }

    if (live.state.secondHalfAddedTimeSeconds === 0) {
      live.state.secondHalfAddedTimeSeconds = alignedAddedTime(live.state, live.config, firstHalfEnd);
      live.state.addedTimeSeconds = live.state.firstHalfAddedTimeSeconds + live.state.secondHalfAddedTimeSeconds;
    }
    const normalTimeEnd = secondHalfRegulationEnd + live.state.secondHalfAddedTimeSeconds;
    if (live.state.second < normalTimeEnd) {
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, normalTimeEnd), live.config);
      if (requestedSecond < normalTimeEnd || live.state.second < normalTimeEnd) return null;
    }

    if (live.state.homeScore !== live.state.awayScore || !live.config.enableExtraTime) {
      return finishLiveMatch(live);
    }

    const extraTimeHalfEnd = normalTimeEnd + 15 * 60;
    if (live.state.second < extraTimeHalfEnd) {
      live.state.phase = 'EXTRA_TIME_1';
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, extraTimeHalfEnd), live.config);
      if (requestedSecond < extraTimeHalfEnd || live.state.second < extraTimeHalfEnd) return null;
    }

    const extraTimeEnd = normalTimeEnd + live.config.extraTimeSeconds;
    if (live.state.second < extraTimeEnd) {
      live.state.phase = 'EXTRA_TIME_2';
      CupMatchLoop.runPeriod(live.input, live.state, Math.min(requestedSecond, extraTimeEnd), live.config);
      if (requestedSecond < extraTimeEnd || live.state.second < extraTimeEnd) return null;
    }

    if (live.state.homeScore !== live.state.awayScore || !live.config.enablePenaltyShootout) {
      return finishLiveMatch(live);
    }

    return finishLiveMatchWithPenalties(live);
  },

  /**
   * Returns a detached report for the elapsed portion without advancing time.
   * The clone is intentional: a React view may sort or annotate its copy, but
   * it must never mutate the authoritative event history held by the engine.
   */
  snapshotLiveMatch: (live: CupLiveMatch): CupMatchResult =>
    cloneResult(live.finalResult ?? buildResult(live.input, live.state, live.initialLineup)),

  /** Returns the committed result only after the live state reached full time. */
  finalizeLiveMatch: (live: CupLiveMatch): CupMatchResult | null => live.finalResult ?? null,

  /**
   * Applies a legal manual substitution in place. The event log is the source
   * of truth for players who already left the pitch, preventing illegal returns.
   */
  applyManualSubstitution: (
    live: CupLiveMatch,
    side: CupTeamSide,
    playerOutId: string,
    playerInId: string,
  ): boolean => {
    if (live.finalResult || playerOutId === playerInId) return false;
    if (live.state.substitutionsUsed[side] >= live.config.maxSubstitutions) return false;
    if (live.state.redCards[playerOutId] || live.state.redCards[playerInId]) return false;

    const team = side === 'HOME' ? live.input.home : live.input.away;
    const slotIndex = team.lineup.startingXI.findIndex(id => id === playerOutId);
    if (slotIndex < 0 || !team.lineup.bench.includes(playerInId)) return false;

    const alreadyLeftPitch = live.state.events.some(event =>
      event.type === MatchEventType.SUBSTITUTION && event.secondaryPlayerId === playerInId
    );
    if (alreadyLeftPitch) return false;

    const playerOut = team.players.find(player => player.id === playerOutId);
    const playerIn = team.players.find(player => player.id === playerInId);
    if (!playerOut || !playerIn) return false;

    team.lineup.startingXI[slotIndex] = playerInId;
    team.lineup.bench = team.lineup.bench.filter(id => id !== playerInId);
    team.lineup.bench.push(playerOutId);
    live.state.substitutionsUsed[side] += 1;
    live.state.fatigue[playerInId] = Math.min(
      playerIn.condition,
      live.state.fatigue[playerInId] ?? playerIn.condition,
    );
    live.state.events.push({
      id: `cupv2_manual_substitution_${live.state.second}_${side}_${playerOutId}_${playerInId}`,
      second: live.state.second,
      minute: CupMatchClockService.eventMinute(live.state, live.config),
      side,
      type: MatchEventType.SUBSTITUTION,
      playerId: playerInId,
      secondaryPlayerId: playerOutId,
      text: `${team.name} dokonuje zmiany: ${playerIn.lastName} za ${playerOut.lastName}.`,
      detail: {
        reason: 'MANUAL',
        substitutionsUsed: live.state.substitutionsUsed[side],
      },
    });
    return true;
  },

  /**
   * Publiczne wejście silnika. Na tym etapie moduł jest przeznaczony do
   * symulacji, testów balansu i późniejszego podłączenia do widoku Pucharu
   * Polski. Nie modyfikuje istniejącego silnika live.
   */
  simulate: (input: CupMatchInput): CupMatchResult => {
    const runtimeInput = cloneInput(input);
    const initialLineups = {
      HOME: [...runtimeInput.home.lineup.startingXI],
      AWAY: [...runtimeInput.away.lineup.startingXI],
    };
    const config: CupEngineConfig = { ...DEFAULT_CUP_ENGINE_CONFIG, ...runtimeInput.config };
    const state = createInitialCupRuntimeState(runtimeInput);

    state.phase = 'FIRST_HALF';
    const firstHalfRegulationEnd = Math.floor(config.normalTimeSeconds / 2);
    CupMatchLoop.runPeriod(runtimeInput, state, firstHalfRegulationEnd, config);
    state.firstHalfAddedTimeSeconds = alignedAddedTime(state, config, 0);
    state.addedTimeSeconds = state.firstHalfAddedTimeSeconds;
    const firstHalfEnd = firstHalfRegulationEnd + state.firstHalfAddedTimeSeconds;
    CupMatchLoop.runPeriod(runtimeInput, state, firstHalfEnd, config);

    applyHalfTimeTalk(runtimeInput, state);
    state.phase = 'SECOND_HALF';
    state.possession = state.firstHalfKickOffSide === 'HOME' ? 'AWAY' : 'HOME';
    state.possessionReason = 'HALF_START';
    state.ballCarrierId = undefined;
    state.ballZone = 'MIDFIELD';
    const secondHalfRegulationEnd = firstHalfEnd + (config.normalTimeSeconds - firstHalfRegulationEnd);
    CupMatchLoop.runPeriod(runtimeInput, state, secondHalfRegulationEnd, config);
    state.secondHalfAddedTimeSeconds = alignedAddedTime(state, config, firstHalfEnd);
    state.addedTimeSeconds = state.firstHalfAddedTimeSeconds + state.secondHalfAddedTimeSeconds;
    const normalTimeEnd = secondHalfRegulationEnd + state.secondHalfAddedTimeSeconds;
    CupMatchLoop.runPeriod(runtimeInput, state, normalTimeEnd, config);

    if (state.homeScore === state.awayScore && config.enableExtraTime) {
      state.phase = 'EXTRA_TIME_1';
      CupMatchLoop.runPeriod(runtimeInput, state, normalTimeEnd + 15 * 60, config);

      state.phase = 'EXTRA_TIME_2';
      CupMatchLoop.runPeriod(runtimeInput, state, normalTimeEnd + config.extraTimeSeconds, config);
    }

    let decidedByPenalties = false;
    let penaltyScore: { home: number; away: number } | undefined;
    let penaltyShootout: CupMatchResult['penaltyShootout'] = undefined;
    let winner: 'HOME' | 'AWAY' | undefined =
      state.homeScore > state.awayScore ? 'HOME' :
      state.awayScore > state.homeScore ? 'AWAY' :
      undefined;

    if (!winner && config.enablePenaltyShootout) {
      state.phase = 'PENALTY_SHOOTOUT';
      const penalties = CupPenaltyShootoutService.simulate(runtimeInput, state.fatigue, {
        redCards: state.redCards,
        injuries: state.injuries,
        startSecond: state.second,
      });
      decidedByPenalties = true;
      penaltyScore = { home: penalties.home, away: penalties.away };
      penaltyShootout = penalties.attempts;
      state.events.push(...penalties.events);
      state.second = Math.max(state.second, ...penalties.events.map(event => event.second));
      winner = penalties.winner;
    }

    state.phase = 'FINISHED';
    const playerStats = CupPlayerStatsAggregator.aggregate({
      match: runtimeInput,
      events: state.events,
      finalSecond: state.second,
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      initialLineups,
      finalFatigue: state.fatigue,
      teamStats: state.stats,
    });

    return {
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      winner,
      decidedByPenalties,
      penaltyScore,
      penaltyShootout,
      stats: state.stats,
      playerStats,
      events: state.events,
      finalState: state,
    };
  },
};
