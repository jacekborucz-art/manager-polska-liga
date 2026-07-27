import { MatchEventType } from '../../../../types';
import type { CupEngineConfig, CupMatchInput, CupRuntimeState } from './CupMatchTypes';
import { DEFAULT_CUP_ENGINE_CONFIG } from './CupMatchTypes';
import { clamp, seededRandom } from './CupMath';
import { CupActionBuilder } from './CupActionBuilder';
import { CupMomentumService } from './CupMomentumService';
import { CupSubstitutionService } from './CupSubstitutionService';
import { CupTeamProfileService } from './CupTeamProfileService';

const emptyStats = () => ({
  possessionTicks: 0,
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

export const createInitialCupRuntimeState = (input: CupMatchInput): CupRuntimeState => ({
  second: 0,
  phase: 'FIRST_HALF',
  possession: seededRandom(input.seed, 0, 1) < 0.5 ? 'HOME' : 'AWAY',
  possessionReason: 'KICK_OFF',
  ballZone: 'MIDFIELD',
  attackPattern: 'BUILD_UP',
  homeScore: 0,
  awayScore: 0,
  momentum: 0,
  pressure: { HOME: 35, AWAY: 35 },
  organization: { HOME: 72, AWAY: 72 },
  fatigue: initialFatigue(input),
  yellowCards: {},
  redCards: {},
  injuries: {},
  substitutionsUsed: { HOME: 0, AWAY: 0 },
  addedTimeSeconds: 0,
  stats: { HOME: emptyStats(), AWAY: emptyStats() },
  events: [],
});

const updateFatigue = (state: CupRuntimeState, input: CupMatchInput, config: CupEngineConfig): void => {
  const possessionSide = state.possession;
  const activeIds = [
    ...input.home.lineup.startingXI.filter((id): id is string => Boolean(id)),
    ...input.away.lineup.startingXI.filter((id): id is string => Boolean(id)),
  ];

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
    const injuryCost =
      state.injuries[id] === 'SEVERE' ? 0.030 :
      state.injuries[id] === 'LIGHT' ? 0.012 :
      0;
    const staminaShield = player.attributes.stamina * 0.000065 + player.attributes.workRate * 0.000025;
    const costPerTick = (instructionCost + pressingCost + injuryCost + (isPossessionTeam ? 0.001 : 0.002)) * (config.tickSeconds / 5);
    state.fatigue[id] = clamp((state.fatigue[id] ?? player.condition) - Math.max(0.001, costPerTick - staminaShield), 15, 100);
  });
};

const applyEventToState = (state: CupRuntimeState, eventType: MatchEventType, side?: 'HOME' | 'AWAY') => {
  if (!side) return;
  const stats = state.stats[side];
  if (eventType === MatchEventType.GOAL || eventType === MatchEventType.ONE_ON_ONE_GOAL) {
    if (side === 'HOME') state.homeScore += 1;
    else state.awayScore += 1;
  }
  if (eventType === MatchEventType.FOUL) stats.fouls += 1;
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
  const minute = Math.floor(state.second / 60);
  const team = side === 'HOME' ? input.home : input.away;
  const hasInjuredStarter = team.lineup.startingXI.some(id => Boolean(id && state.injuries[id]));
  const hasSevereInjuredStarter = team.lineup.startingXI.some(id => Boolean(id && state.injuries[id] === 'SEVERE'));
  if (!hasInjuredStarter && (minute < 55 || state.second % (5 * 60) !== 0)) return;
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
        applyEventToState(state, event.type, event.side);
        applyPlayerEventToState(state, event.type, event.playerId);
        state.events.push(event);
      });

      state.momentum = CupMomentumService.updateMomentum(state, homeProfile, awayProfile, outcome.momentumDelta);
      if (outcome.nextPossession) state.possession = outcome.nextPossession;
      if (outcome.nextZone) state.ballZone = outcome.nextZone;

      updateFatigue(state, input, config);
      maybeExecuteSubstitution(input, state, 'HOME', homeProfile, config);
      maybeExecuteSubstitution(input, state, 'AWAY', awayProfile, config);
      state.second += config.tickSeconds;
    }

    return state;
  },
};
