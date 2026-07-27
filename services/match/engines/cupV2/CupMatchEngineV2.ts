import type { CupEngineConfig, CupHalfTimeTalk, CupMatchInput, CupMatchResult, CupTeamInput, CupTeamSide } from './CupMatchTypes';
import { DEFAULT_CUP_ENGINE_CONFIG } from './CupMatchTypes';
import { createInitialCupRuntimeState, CupMatchLoop } from './CupMatchLoop';
import { clamp, weightedScore } from './CupMath';
import { CupPenaltyShootoutService } from './CupPenaltyShootoutService';
import { CupPlayerStatsAggregator } from './CupPlayerStatsAggregator';

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
  });
};

export const CupMatchEngineV2 = {
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
    CupMatchLoop.runPeriod(runtimeInput, state, 45 * 60, config);

    applyHalfTimeTalk(runtimeInput, state);
    state.phase = 'SECOND_HALF';
    CupMatchLoop.runPeriod(runtimeInput, state, config.normalTimeSeconds + state.addedTimeSeconds, config);

    if (state.homeScore === state.awayScore && config.enableExtraTime) {
      state.phase = 'EXTRA_TIME_1';
      CupMatchLoop.runPeriod(runtimeInput, state, config.normalTimeSeconds + 15 * 60, config);

      state.phase = 'EXTRA_TIME_2';
      CupMatchLoop.runPeriod(runtimeInput, state, config.normalTimeSeconds + config.extraTimeSeconds, config);
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
