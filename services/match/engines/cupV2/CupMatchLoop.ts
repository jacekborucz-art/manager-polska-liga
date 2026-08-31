import { MatchEventType } from '../../../../types';
import type { CupEngineConfig, CupMatchEvent, CupMatchInput, CupRuntimeState } from './CupMatchTypes';
import { DEFAULT_CUP_ENGINE_CONFIG } from './CupMatchTypes';
import { clamp, seededRandom } from './CupMath';
import { CupActionBuilder } from './CupActionBuilder';
import { CupMomentumService } from './CupMomentumService';
import { CupSubstitutionService } from './CupSubstitutionService';
import { CupTeamProfileService } from './CupTeamProfileService';
import { CupMatchClockService } from './CupMatchClockService';

const emptyStats = () => ({
  possessionTicks: 0,
  passesAttempted: 0,
  passesCompleted: 0,
  dribblesAttempted: 0,
  dribblesCompleted: 0,
  tacklesWon: 0,
  crossesAttempted: 0,
  crossesCompleted: 0,
  blocks: 0,
  reboundsWon: 0,
  turnoversWon: 0,
  turnoversLost: 0,
  shots: 0,
  shotsOnTarget: 0,
  goals: 0,
  xG: 0,
  corners: 0,
  fouls: 0,
  offsides: 0,
  yellowCards: 0,
  redCards: 0,
  injuries: 0,
  freeKicks: 0,
  penalties: 0,
  posts: 0,
  bars: 0,
  saves: 0,
});

const initialFatigue = (input: CupMatchInput): Record<string, number> => {
  const fatigue: Record<string, number> = {};
  [...input.home.players, ...input.away.players].forEach(player => {
    fatigue[player.id] = player.condition;
  });
  return fatigue;
};

const neutralCoachEffects = () => ({
  initiativeModifier: 0,
  ownShotModifier: 0,
  opponentShotModifier: 0,
  turnoverRiskModifier: 0,
  fatigueExtra: 0,
  foulMultiplier: 1,
  injuryMultiplier: 1,
});

const RECEIVER_CARRIER_EVENTS = new Set<MatchEventType>([
  MatchEventType.PASS_COMPLETED,
  MatchEventType.CROSS_NEAR_POST,
  MatchEventType.CROSS_FAR_POST,
]);

const ACTOR_CARRIER_EVENTS = new Set<MatchEventType>([
  MatchEventType.BALL_CONTROL,
  MatchEventType.DRIBBLING,
  MatchEventType.TACKLE_WON,
  MatchEventType.MISPLACED_PASS,
  MatchEventType.REBOUND_WON,
  MatchEventType.SAVE,
  MatchEventType.ONE_ON_ONE_SAVE,
  MatchEventType.GK_LONG_THROW,
  MatchEventType.GOAL_KICK,
  MatchEventType.KICK_OFF,
]);

export const createInitialCupRuntimeState = (input: CupMatchInput): CupRuntimeState => ({
  second: 0,
  phase: 'FIRST_HALF',
  possession: seededRandom(input.seed, 0, 1) < 0.5 ? 'HOME' : 'AWAY',
  possessionReason: 'KICK_OFF',
  ballCarrierId: undefined,
  ballZone: 'MIDFIELD',
  attackPattern: 'BUILD_UP',
  homeScore: 0,
  awayScore: 0,
  momentum: 0,
  pressure: { HOME: 35, AWAY: 35 },
  organization: { HOME: 72, AWAY: 72 },
  halfTimeResponse: { HOME: 0, AWAY: 0 },
  coachEffects: { HOME: neutralCoachEffects(), AWAY: neutralCoachEffects() },
  fatigue: initialFatigue(input),
  yellowCards: {},
  redCards: {},
  injuries: {},
  substitutionsUsed: { HOME: 0, AWAY: 0 },
  firstHalfKickOffSide: seededRandom(input.seed, 0, 1) < 0.5 ? 'HOME' : 'AWAY',
  restartSourceEventId: undefined,
  firstHalfAddedTimeSeconds: 0,
  secondHalfAddedTimeSeconds: 0,
  addedTimeSeconds: 0,
  stats: { HOME: emptyStats(), AWAY: emptyStats() },
  events: [],
});

const selectRestartPlayer = (
  profile: ReturnType<typeof CupTeamProfileService.buildProfile>,
  reason: CupRuntimeState['possessionReason'],
) => {
  if (reason === 'SAVE' || reason === 'GOAL_KICK') return profile.goalkeeper;
  const preferred = reason === 'CORNER'
    ? [...profile.midfielders, ...profile.forwards, ...profile.defenders]
    : [...profile.midfielders, ...profile.forwards, ...profile.defenders];
  return preferred[0] ?? profile.outfieldPlayers[0] ?? profile.goalkeeper;
};

const appendPendingRestart = (
  input: CupMatchInput,
  state: CupRuntimeState,
  config: CupEngineConfig,
  homeProfile: ReturnType<typeof CupTeamProfileService.buildProfile>,
  awayProfile: ReturnType<typeof CupTeamProfileService.buildProfile>,
): void => {
  const reason = state.possessionReason;
  if (reason === 'OPEN_PLAY' || reason === 'TURNOVER' || reason === 'OUT_OF_PLAY') return;
  const profile = state.possession === 'HOME' ? homeProfile : awayProfile;
  const team = state.possession === 'HOME' ? input.home : input.away;
  const player = selectRestartPlayer(profile, reason);
  const type =
    reason === 'CORNER' ? MatchEventType.CORNER_TAKEN :
    reason === 'GOAL_KICK' ? MatchEventType.GOAL_KICK :
    reason === 'SAVE' ? MatchEventType.GK_LONG_THROW :
    MatchEventType.KICK_OFF;
  const text =
    reason === 'CORNER' ? `${player?.lastName ?? team.name} wykonuje rzut rożny.` :
    reason === 'GOAL_KICK' ? `${player?.lastName ?? 'Bramkarz'} wznawia grę od bramki.` :
    reason === 'SAVE' ? `${player?.lastName ?? 'Bramkarz'} szybko wprowadza piłkę do gry.` :
    reason === 'HALF_START' ? `${team.name} rozpoczyna drugą połowę.` :
    reason === 'GOAL_RESTART' ? `${team.name} wznawia grę po straconej bramce.` :
    `${team.name} rozpoczyna spotkanie.`;

  // Restarts are authoritative events, not inferred visual effects. The SVG
  // renderer can therefore animate a kick-off, corner or goal kick without
  // guessing from the previous shot text.
  // A corner keeps its own sequenceId so the CORNER_TAKEN cue and whatever
  // shot resolveSetPieceDelivery produces this same tick group as one
  // sequence for presentation, exactly like a foul-awarded free kick already
  // does with its own award event.
  const cornerSequenceId = `cupv2_corner_delivery_${state.second}_${state.possession}`;
  state.events.push({
    id: `cupv2_restart_${reason}_${state.second}_${state.possession}`,
    second: state.second,
    minute: CupMatchClockService.eventMinute(state, config),
    side: state.possession,
    type,
    zone: reason === 'CORNER' ? 'WIDE_LEFT' : reason === 'GOAL_KICK' || reason === 'SAVE' ? 'GK' : 'MIDFIELD',
    pattern: reason === 'CORNER' ? 'SET_PIECE' : 'BUILD_UP',
    playerId: player?.id,
    text,
    detail: {
      restartReason: reason,
      sourceEventId: state.restartSourceEventId,
      sequenceId: reason === 'CORNER' ? cornerSequenceId : undefined,
      setPieceKind: reason === 'CORNER' ? 'CORNER' : undefined,
    },
  });
  state.ballCarrierId = player?.id;
  // A corner isn't simply back to open play yet: simulateTick resolves the
  // delivery itself this same tick (see resolveSetPieceDelivery), the way a
  // foul-awarded free kick already resolves its own delivery inline.
  state.possessionReason = reason === 'CORNER' ? 'CORNER_DELIVERY' : 'OPEN_PLAY';
  state.restartSourceEventId = undefined;
};

const updateFatigue = (state: CupRuntimeState, input: CupMatchInput, config: CupEngineConfig): void => {
  const possessionSide = state.possession;
  const activeIds = [
    ...input.home.lineup.startingXI.filter((id): id is string => Boolean(id)),
    ...input.away.lineup.startingXI.filter((id): id is string => Boolean(id)),
  ].filter(id => !state.redCards[id]);

  activeIds.forEach(id => {
    const player = [...input.home.players, ...input.away.players].find(item => item.id === id);
    if (!player) return;
    const team = input.home.players.some(item => item.id === id) ? input.home : input.away;
    const isPossessionTeam = team.side === possessionSide;
    const instructionCost =
      team.instructions.tempo === 'FAST' ? 0.010 :
      team.instructions.tempo === 'SLOW' ? 0.004 :
      0.006;
    const pressingCost = team.instructions.pressing === 'PRESSING' ? 0.006 : 0.002;
    const coachCost = state.coachEffects[team.side].fatigueExtra * 0.24;
    const injuryCost =
      state.injuries[id] === 'SEVERE' ? 0.030 :
      state.injuries[id] === 'LIGHT' ? 0.012 :
      0;
    const staminaShield = player.attributes.stamina * 0.000065 + player.attributes.workRate * 0.000025;
    const costPerTick = (instructionCost + pressingCost + coachCost + injuryCost + (isPossessionTeam ? 0.001 : 0.002)) * (config.tickSeconds / 5);
    state.fatigue[id] = clamp((state.fatigue[id] ?? player.condition) - Math.max(0.001, costPerTick - staminaShield), 15, 100);
  });
};

const applyEventToState = (state: CupRuntimeState, event: CupMatchEvent) => {
  const { type: eventType, side } = event;
  if (!side) return;
  const stats = state.stats[side];
  const opponentStats = state.stats[side === 'HOME' ? 'AWAY' : 'HOME'];
  if (eventType === MatchEventType.GOAL || eventType === MatchEventType.ONE_ON_ONE_GOAL) {
    if (side === 'HOME') state.homeScore += 1;
    else state.awayScore += 1;
  }
  if (eventType === MatchEventType.PENALTY_SCORED) {
    if (side === 'HOME') state.homeScore += 1;
    else state.awayScore += 1;
  }
  if (eventType === MatchEventType.FREE_KICK || eventType === MatchEventType.FREE_KICK_DANGEROUS) stats.freeKicks += 1;
  if (eventType === MatchEventType.PENALTY_AWARDED) stats.penalties += 1;
  if (eventType === MatchEventType.FOUL) stats.fouls += 1;
  if (eventType === MatchEventType.ADVANTAGE_PLAYED) stats.fouls += 1;
  if (eventType === MatchEventType.YELLOW_CARD) {
    stats.fouls += 1;
    stats.yellowCards += 1;
  }
  if (eventType === MatchEventType.RED_CARD) {
    stats.fouls += 1;
    stats.redCards += 1;
  }
  if (eventType === MatchEventType.INJURY_LIGHT || eventType === MatchEventType.INJURY_SEVERE) {
    stats.injuries += 1;
  }
  if (eventType === MatchEventType.PASS_COMPLETED) {
    stats.passesAttempted += 1;
    stats.passesCompleted += 1;
  }
  if (eventType === MatchEventType.MISPLACED_PASS) {
    opponentStats.passesAttempted += 1;
    stats.turnoversWon += 1;
    opponentStats.turnoversLost += 1;
  }
  if (eventType === MatchEventType.DRIBBLING) {
    stats.dribblesAttempted += 1;
    if (event.detail?.succeeded !== false) stats.dribblesCompleted += 1;
  }
  if (eventType === MatchEventType.TACKLE_WON) {
    stats.tacklesWon += 1;
    stats.turnoversWon += 1;
    opponentStats.turnoversLost += 1;
  }
  if (eventType === MatchEventType.CROSS_NEAR_POST || eventType === MatchEventType.CROSS_FAR_POST) {
    stats.crossesAttempted += 1;
    if (event.detail?.completed !== false) stats.crossesCompleted += 1;
  }
  if (eventType === MatchEventType.CROSS_BLOCKED) {
    stats.blocks += 1;
    opponentStats.crossesAttempted += 1;
  }
  if (eventType === MatchEventType.SHOT_BLOCKED) opponentStats.blocks += 1;
  if (eventType === MatchEventType.REBOUND_WON) stats.reboundsWon += 1;
};

const applyPlayerEventToState = (state: CupRuntimeState, eventType: MatchEventType, playerId?: string) => {
  if (!playerId) return;
  if (eventType === MatchEventType.YELLOW_CARD) {
    state.yellowCards[playerId] = (state.yellowCards[playerId] ?? 0) + 1;
  }
  if (eventType === MatchEventType.RED_CARD) {
    state.redCards[playerId] = true;
  }
  if (eventType === MatchEventType.INJURY_LIGHT) {
    state.injuries[playerId] = 'LIGHT';
    state.fatigue[playerId] = Math.min(state.fatigue[playerId] ?? 58, 58);
  }
  if (eventType === MatchEventType.INJURY_SEVERE) {
    state.injuries[playerId] = 'SEVERE';
    state.fatigue[playerId] = Math.min(state.fatigue[playerId] ?? 34, 34);
  }
};

const applyBallCarrierEvent = (state: CupRuntimeState, event: CupMatchEvent): void => {
  if (RECEIVER_CARRIER_EVENTS.has(event.type) && event.secondaryPlayerId) {
    state.ballCarrierId = event.secondaryPlayerId;
    return;
  }
  if (ACTOR_CARRIER_EVENTS.has(event.type) && event.playerId) {
    state.ballCarrierId = event.playerId;
    return;
  }
  if (
    event.type === MatchEventType.GOAL ||
    event.type === MatchEventType.ONE_ON_ONE_GOAL ||
    event.type === MatchEventType.PENALTY_SCORED ||
    event.type === MatchEventType.SHOT ||
    event.type === MatchEventType.SHOT_ON_TARGET ||
    event.type === MatchEventType.SHOT_POST ||
    event.type === MatchEventType.SHOT_BAR
  ) {
    state.ballCarrierId = undefined;
  }
};

const updateOrganization = (
  state: CupRuntimeState,
  input: CupMatchInput,
  homeProfile: ReturnType<typeof CupTeamProfileService.buildProfile>,
  awayProfile: ReturnType<typeof CupTeamProfileService.buildProfile>
): void => {
  const calculate = (side: 'HOME' | 'AWAY', profile: ReturnType<typeof CupTeamProfileService.buildProfile>) => {
    const team = side === 'HOME' ? input.home : input.away;
    const markingMod =
      team.instructions.marking === 'ZONE' ? 4 :
      team.instructions.marking === 'MAN' ? 1 :
      -7;
    const intensityMod =
      team.instructions.intensity === 'AGGRESSIVE' ? -3 :
      team.instructions.intensity === 'CAUTIOUS' ? 2 :
      0;

    return clamp(
      43 +
      profile.defensiveShape * 0.20 +
      profile.midfieldControl * 0.08 +
      profile.leadership * 0.10 +
      profile.mentality * 0.10 +
      profile.staminaReserve * 0.10 -
      state.pressure[side] * 0.08 +
      markingMod +
      intensityMod,
      30,
      92
    );
  };

  state.organization.HOME = calculate('HOME', homeProfile);
  state.organization.AWAY = calculate('AWAY', awayProfile);
};

const maybeExecuteSubstitution = (
  input: CupMatchInput,
  state: CupRuntimeState,
  side: 'HOME' | 'AWAY',
  profile: ReturnType<typeof CupTeamProfileService.buildProfile>,
  config: CupEngineConfig
): void => {
  const footballSecond = CupMatchClockService.toFootballSecond(state, config);
  const minute = Math.floor(footballSecond / 60);
  const team = side === 'HOME' ? input.home : input.away;
  const hasInjuredStarter = team.lineup.startingXI.some(id => Boolean(id && state.injuries[id]));
  const hasSevereInjuredStarter = team.lineup.startingXI.some(id => Boolean(id && state.injuries[id] === 'SEVERE'));
  if (!hasInjuredStarter && (minute < 55 || footballSecond % (5 * 60) !== 0)) return;
  if (!hasInjuredStarter && seededRandom(input.seed, state.second, side === 'HOME' ? 811 : 812) > 0.54) return;
  if (hasInjuredStarter && !hasSevereInjuredStarter && seededRandom(input.seed, state.second, side === 'HOME' ? 813 : 814) > 0.82) return;

  const proposal = CupSubstitutionService.proposeAiSubstitution({
    team,
    profile,
    state,
    maxSubstitutions: config.maxSubstitutions,
  });
  if (!proposal) return;

  const slotIndex = team.lineup.startingXI.findIndex(id => id === proposal.playerOutId);
  if (slotIndex < 0) return;

  team.lineup.startingXI[slotIndex] = proposal.playerInId;
  team.lineup.bench = team.lineup.bench.filter(id => id !== proposal.playerInId);
  team.lineup.bench.push(proposal.playerOutId);
  state.substitutionsUsed[side] += 1;

  const playerOut = team.players.find(player => player.id === proposal.playerOutId);
  const playerIn = team.players.find(player => player.id === proposal.playerInId);
  state.events.push({
    id: `cupv2_substitution_${state.second}_${proposal.playerOutId}`,
    second: state.second,
    minute: minute + 1,
    side,
    type: MatchEventType.SUBSTITUTION,
    playerId: proposal.playerInId,
    secondaryPlayerId: proposal.playerOutId,
    text: `${team.name} dokonuje zmiany: ${playerIn?.lastName ?? 'rezerwowy'} za ${playerOut?.lastName ?? 'zawodnika'}.`,
    detail: {
      reason: proposal.reason,
      substitutionsUsed: state.substitutionsUsed[side],
    },
  });
};

export const CupMatchLoop = {
  /**
   * Główna pętla V2. Każdy przebieg reprezentuje kilka sekund meczu.
   * Warstwa nie generuje wyniku z góry: wynik jest skutkiem zdarzeń dodanych
   * przez CupActionBuilder oraz późniejsze moduły dogrywki/karnych.
   */
  runPeriod: (
    input: CupMatchInput,
    state: CupRuntimeState,
    periodEndSecond: number,
    config: CupEngineConfig = { ...DEFAULT_CUP_ENGINE_CONFIG, ...input.config }
  ): CupRuntimeState => {
    while (state.second < periodEndSecond && state.phase !== 'FINISHED' && state.phase !== 'PENALTY_SHOOTOUT') {
      const homeProfile = CupTeamProfileService.buildProfile(input.home, state.fatigue, state.redCards, state.injuries);
      const awayProfile = CupTeamProfileService.buildProfile(input.away, state.fatigue, state.redCards, state.injuries);
      const random = (salt: number) => seededRandom(input.seed, state.second, salt);

      appendPendingRestart(input, state, config, homeProfile, awayProfile);

      state.pressure.HOME = CupMomentumService.pressureForSide(state, state.homeScore, state.awayScore, homeProfile);
      state.pressure.AWAY = CupMomentumService.pressureForSide(state, state.awayScore, state.homeScore, awayProfile);
      updateOrganization(state, input, homeProfile, awayProfile);

      const outcome = CupActionBuilder.simulateTick({
        input,
        config,
        state,
        homeProfile,
        awayProfile,
        random,
      });

      outcome.events.forEach(event => {
        applyEventToState(state, event);
        applyPlayerEventToState(state, event.type, event.playerId);
        applyBallCarrierEvent(state, event);
        state.events.push(event);
      });

      state.momentum = CupMomentumService.updateMomentum(state, homeProfile, awayProfile, outcome.momentumDelta);
      if (outcome.nextPossession) {
        const nextTeam = outcome.nextPossession === 'HOME' ? input.home : input.away;
        if (!nextTeam.players.some(player => player.id === state.ballCarrierId)) {
          state.ballCarrierId = undefined;
        }
        state.possession = outcome.nextPossession;
      }
      if (outcome.nextZone) state.ballZone = outcome.nextZone;
      if (outcome.nextPossessionReason) {
        state.possessionReason = outcome.nextPossessionReason;
        state.restartSourceEventId = outcome.restartSourceEventId;
      } else if (outcome.nextPossession) {
        state.possessionReason = 'TURNOVER';
        state.restartSourceEventId = undefined;
      }

      updateFatigue(state, input, config);
      maybeExecuteSubstitution(input, state, 'HOME', homeProfile, config);
      maybeExecuteSubstitution(input, state, 'AWAY', awayProfile, config);
      state.second += config.tickSeconds;
    }

    return state;
  },
};
