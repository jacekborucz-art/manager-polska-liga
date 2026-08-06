import type {
  Coach,
  GoalTickerInfo,
  Lineup,
  MatchContext,
  MatchLiveState,
  UserCoachInstructionId,
  UserCoachShoutId,
} from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { AiCoachCommandService } from './AiCoachCommandService';
import { UserCoachInstructionService } from './UserCoachInstructionService';
import { UserCoachShoutService } from './UserCoachShoutService';

export type LiveCoachSideEffects = {
  initiativeModifier: number;
  ownShotModifier: number;
  opponentShotModifier: number;
  turnoverRiskModifier: number;
  fatigueExtra: number;
  foulMultiplier: number;
  injuryMultiplier: number;
};

type LiveStats = MatchLiveState['liveStats'];

const EMPTY_MEMORY = {
  lastId: null,
  lastIssuedMinute: -99,
  repeatCount: 0,
  issueCount: 0,
};

const getActiveIds = (lineup: Lineup) => lineup.startingXI.filter((id): id is string => id !== null);

const scaleNeutralMultiplier = (value: number, scale: number) => 1 + (value - 1) * scale;

/**
 * SHARED LIVE-MATCH COACH COMMAND RUNTIME
 * =======================================
 *
 * Every interactive player-vs-AI engine owns a different minute loop (league, Polish Cup/playoffs,
 * Champions League, Europa League, Conference League and friendlies). This service is the single
 * bridge between those loops and the coach-command matrices. It deliberately does not generate match
 * events. Instead, each engine passes its freshest local lineups, fatigue, score, goals and statistics,
 * then applies the returned bounded modifiers to its own initiative, shot, turnover, fatigue, foul and
 * injury formulas.
 *
 * Ownership is strict. Human effects are evaluated only from the user side and AI effects only from the
 * opponent side. AI state, entropy, memory and the 1.01-1.10 advantage multiplier never reuse human
 * state. The hard logic gate remains inside AiCoachCommandService, so no competition can accidentally
 * bypass the rule that a weak coach may be suboptimal but never absurd.
 *
 * The returned `patch` is fixed-size save data. Engines must spread it into their normal minute result;
 * no history arrays or per-minute command snapshots are created. This keeps long cup and European runs
 * from growing save payloads merely because the feature is enabled in more competitions.
 */
export const LiveCoachCommandRuntimeService = {
  issueUserInstruction: (
    state: MatchLiveState,
    id: UserCoachInstructionId | null
  ): Partial<MatchLiveState> => {
    if (state.minute < 1 || state.isFinished) return {};
    if (id === null) return { userCoachInstruction: null };
    const issued = UserCoachInstructionService.issue({
      id,
      minute: state.minute,
      sessionSeed: state.sessionSeed,
      previousActive: state.userCoachInstruction,
      memory: state.userCoachInstructionMemory,
    });
    return {
      userCoachInstruction: issued.active,
      userCoachInstructionMemory: issued.memory,
    };
  },

  issueUserShout: ({
    state,
    id,
    ctx,
    userSide,
  }: {
    state: MatchLiveState;
    id: UserCoachShoutId | null;
    ctx: MatchContext;
    userSide: 'HOME' | 'AWAY';
  }): Partial<MatchLiveState> => {
    if (state.minute < 1 || state.isFinished) return {};
    if (id === null) return { userCoachShout: null };
    const players = userSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
    const lineup = userSide === 'HOME' ? state.homeLineup : state.awayLineup;
    const fatigue = userSide === 'HOME' ? state.homeFatigue : state.awayFatigue;
    const ownStats = userSide === 'HOME' ? state.liveStats.home : state.liveStats.away;
    const opponentStats = userSide === 'HOME' ? state.liveStats.away : state.liveStats.home;
    const ownGoals = userSide === 'HOME' ? state.homeGoals : state.awayGoals;
    const opponentGoals = userSide === 'HOME' ? state.awayGoals : state.homeGoals;
    const activeIds = getActiveIds(lineup);
    const activePlayers = players.filter(player => activeIds.includes(player.id));
    const averageFatigue = activeIds.length
      ? activeIds.reduce((sum, playerId) => sum + (fatigue[playerId] ?? 100), 0) / activeIds.length
      : 100;
    const averageMorale = activePlayers.length
      ? activePlayers.reduce((sum, player) => sum + (player.morale ?? 50), 0) / activePlayers.length
      : 50;
    const isRecentGoal = (goal: GoalTickerInfo) =>
      !goal.varDisallowed && !goal.isMiss && state.minute - goal.minute >= 0 && state.minute - goal.minute <= 3;
    const rngState = state.userCoachShoutRng ?? UserCoachShoutService.createRngState();
    const issued = UserCoachShoutService.issue({
      id,
      minute: state.minute,
      rngState,
      previousActive: state.userCoachShout,
      memory: state.userCoachShoutMemory,
      situation: {
        scoreDiff: userSide === 'HOME' ? state.homeScore - state.awayScore : state.awayScore - state.homeScore,
        shotDiff: ownStats.shots - opponentStats.shots,
        shotsOnTargetDiff: ownStats.shotsOnTarget - opponentStats.shotsOnTarget,
        userMomentum: userSide === 'HOME' ? state.momentum : -state.momentum,
        recentlyScored: ownGoals.some(isRecentGoal),
        recentlyConceded: opponentGoals.some(isRecentGoal),
        averageFatigue,
        averageMorale,
        yellowCardCount: activeIds.reduce(
          (sum, playerId) => sum + Math.min(1, state.playerYellowCards[playerId] ?? 0),
          0
        ),
      },
    });
    return {
      userCoachShout: issued.active,
      userCoachShoutMemory: issued.memory,
      userCoachShoutRng: issued.rngState,
    };
  },

  advance: ({
    previousState,
    minute,
    ctx,
    userSide,
    coaches,
    homeLineup,
    awayLineup,
    homeFatigue,
    awayFatigue,
    homeScore,
    awayScore,
    homeGoals,
    awayGoals,
    liveStats,
    playerYellowCards,
    actionContributions,
  }: {
    previousState: MatchLiveState;
    minute: number;
    ctx: MatchContext;
    userSide: 'HOME' | 'AWAY';
    coaches: Record<string, Coach>;
    homeLineup: Lineup;
    awayLineup: Lineup;
    homeFatigue: Record<string, number>;
    awayFatigue: Record<string, number>;
    homeScore: number;
    awayScore: number;
    homeGoals: GoalTickerInfo[];
    awayGoals: GoalTickerInfo[];
    liveStats: LiveStats;
    playerYellowCards: Record<string, number>;
    actionContributions?: Record<string, number>;
  }): {
    patch: Partial<MatchLiveState>;
    user: LiveCoachSideEffects;
    ai: LiveCoachSideEffects;
  } => {
    const aiSide: 'HOME' | 'AWAY' = userSide === 'HOME' ? 'AWAY' : 'HOME';
    const userLineup = userSide === 'HOME' ? homeLineup : awayLineup;
    const aiLineup = aiSide === 'HOME' ? homeLineup : awayLineup;
    const userPlayers = userSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
    const aiPlayers = aiSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
    const userFatigue = userSide === 'HOME' ? homeFatigue : awayFatigue;
    const aiFatigue = aiSide === 'HOME' ? homeFatigue : awayFatigue;
    const userStats = userSide === 'HOME' ? liveStats.home : liveStats.away;
    const aiStats = aiSide === 'HOME' ? liveStats.home : liveStats.away;
    const userGoals = userSide === 'HOME' ? homeGoals : awayGoals;
    const aiGoals = aiSide === 'HOME' ? homeGoals : awayGoals;
    const userScoreDiff = userSide === 'HOME' ? homeScore - awayScore : awayScore - homeScore;
    const aiScoreDiff = -userScoreDiff;
    const userActiveIds = getActiveIds(userLineup);
    const aiActiveIds = getActiveIds(aiLineup);
    const aiActivePlayers = aiPlayers.filter(player => aiActiveIds.includes(player.id));
    const aiAverageFatigue = aiActiveIds.length
      ? aiActiveIds.reduce((sum, playerId) => sum + (aiFatigue[playerId] ?? 100), 0) / aiActiveIds.length
      : 100;
    const aiAverageMorale = aiActivePlayers.length
      ? aiActivePlayers.reduce((sum, player) => sum + (player.morale ?? 50), 0) / aiActivePlayers.length
      : 50;
    const isRecentGoal = (goal: GoalTickerInfo) =>
      !goal.varDisallowed && !goal.isMiss && minute - goal.minute >= 0 && minute - goal.minute <= 3;

    const userInstruction = previousState.userCoachInstruction && minute <= previousState.userCoachInstruction.expiryMinute
      ? previousState.userCoachInstruction
      : null;
    const userShout = previousState.userCoachShout && minute <= previousState.userCoachShout.expiryMinute
      ? previousState.userCoachShout
      : null;
    let aiInstruction = previousState.aiCoachInstruction && minute <= previousState.aiCoachInstruction.expiryMinute
      ? previousState.aiCoachInstruction
      : null;
    let aiShout = previousState.aiCoachShout && minute <= previousState.aiCoachShout.expiryMinute
      ? previousState.aiCoachShout
      : null;
    let aiInstructionMemory = previousState.aiCoachInstructionMemory ?? { ...EMPTY_MEMORY };
    let aiShoutMemory = previousState.aiCoachShoutMemory ?? { ...EMPTY_MEMORY };
    let aiRng = previousState.aiCoachCommandRng ?? AiCoachCommandService.createRngState();
    let aiNextDecisionMinute = previousState.aiCoachNextCommandMinute ?? 7;
    let aiAnnouncement = previousState.aiCoachShoutAnnouncement ?? null;

    const aiTacticalInstructions = {
      tempo: previousState.aiActiveShout?.tempo ?? 'NORMAL',
      mindset: previousState.aiActiveShout?.mindset ?? 'NEUTRAL',
      intensity: previousState.aiActiveShout?.intensity ?? 'NORMAL',
      passing: previousState.aiActiveShout?.passing ?? 'MIXED',
      pressing: previousState.aiActiveShout?.pressing ?? 'NORMAL',
      counterAttack: previousState.aiActiveShout?.counterAttack ?? 'NORMAL',
      marking: previousState.aiActiveShout?.marking ?? 'NONE',
      lastChangeMinute: -5,
      expiryMinute: -1,
      tempoExpiry: -1,
      mindsetExpiry: -1,
      intensityExpiry: -1,
      tempoCooldown: 0,
      mindsetCooldown: 0,
      intensityCooldown: 0,
      passingCooldown: 0,
      pressingCooldown: 0,
      counterAttackCooldown: 0,
      markingCooldown: 0,
      tempoResponseFactor: previousState.aiActiveShout?.tempoResponseFactor ?? 1,
      mindsetResponseFactor: previousState.aiActiveShout?.mindsetResponseFactor ?? 1,
      intensityResponseFactor: previousState.aiActiveShout?.intensityResponseFactor ?? 1,
      passingResponseFactor: 1,
      pressingResponseFactor: 1,
      counterAttackResponseFactor: 1,
      markingResponseFactor: previousState.aiActiveShout?.markingResponseFactor ?? 1,
    } as const;
    const situation = {
      scoreDiff: aiScoreDiff,
      shotDiff: aiStats.shots - userStats.shots,
      shotsOnTargetDiff: aiStats.shotsOnTarget - userStats.shotsOnTarget,
      userMomentum: aiSide === 'HOME' ? previousState.momentum : -previousState.momentum,
      recentlyScored: aiGoals.some(isRecentGoal),
      recentlyConceded: userGoals.some(isRecentGoal),
      averageFatigue: aiAverageFatigue,
      averageMorale: aiAverageMorale,
      yellowCardCount: aiActiveIds.reduce(
        (sum, playerId) => sum + Math.min(1, playerYellowCards[playerId] ?? 0),
        0
      ),
    };
    const latestGoalMinute = [...aiGoals, ...userGoals]
      .filter(goal => !goal.varDisallowed && !goal.isMiss)
      .reduce((latest, goal) => Math.max(latest, goal.minute), -1);
    const mustReactToGoal = latestGoalMinute >= 0 && aiShoutMemory.lastIssuedMinute < latestGoalMinute;

    if (minute >= aiNextDecisionMinute || mustReactToGoal) {
      const aiClub = aiSide === 'HOME' ? ctx.homeClub : ctx.awayClub;
      const coach = (aiSide === 'HOME' ? ctx.homeCoach : ctx.awayCoach)
        ?? (aiClub.coachId ? coaches[aiClub.coachId] : null);
      const decision = AiCoachCommandService.decide({
        minute,
        coachAttributes: coach?.attributes ?? { experience: 50, decisionMaking: 50, motivation: 50, training: 50 },
        rngState: aiRng,
        aiInstructions: aiTacticalInstructions,
        aiTactic: TacticRepository.getById(aiLineup.tacticId),
        userTactic: TacticRepository.getById(userLineup.tacticId),
        aiScoreDiff,
        userTempo: previousState.userInstructions.tempo,
        userPassing: previousState.userInstructions.passing,
        situation,
        previousInstruction: aiInstruction,
        instructionMemory: aiInstructionMemory,
        previousShout: aiShout,
        shoutMemory: aiShoutMemory,
      });
      if (decision.instruction) aiInstruction = decision.instruction;
      if (decision.shout) aiShout = decision.shout;
      aiInstructionMemory = decision.instructionMemory;
      aiShoutMemory = decision.shoutMemory;
      aiRng = decision.rngState;
      aiNextDecisionMinute = decision.nextDecisionMinute;
      if (decision.shoutAnnouncement) aiAnnouncement = decision.shoutAnnouncement;
    }

    const userInstructionEffects = UserCoachInstructionService.getEffects({
      active: userInstruction,
      minute,
      instructions: previousState.userInstructions,
      tactic: TacticRepository.getById(userLineup.tacticId),
      opponentTactic: TacticRepository.getById(aiLineup.tacticId),
      players: userPlayers,
      startingXI: userActiveIds,
      fatigueMap: userFatigue,
      scoreDiff: userScoreDiff,
      opponentTempo: aiTacticalInstructions.tempo,
      opponentPassing: aiTacticalInstructions.passing,
    });
    const userShoutEffects = UserCoachShoutService.getEffects({
      active: userShout,
      minute,
      rngState: previousState.userCoachShoutRng,
      players: userPlayers,
      startingXI: userActiveIds,
      fatigueMap: userFatigue,
      yellowCards: playerYellowCards,
      actionContributions,
    });
    const aiInstructionEffects = UserCoachInstructionService.getEffects({
      active: aiInstruction,
      minute,
      instructions: aiTacticalInstructions,
      tactic: TacticRepository.getById(aiLineup.tacticId),
      opponentTactic: TacticRepository.getById(userLineup.tacticId),
      players: aiPlayers,
      startingXI: aiActiveIds,
      fatigueMap: aiFatigue,
      scoreDiff: aiScoreDiff,
      opponentTempo: previousState.userInstructions.tempo,
      opponentPassing: previousState.userInstructions.passing,
    });
    const aiShoutEffects = UserCoachShoutService.getEffects({
      active: aiShout,
      minute,
      rngState: aiRng,
      players: aiPlayers,
      startingXI: aiActiveIds,
      fatigueMap: aiFatigue,
      yellowCards: playerYellowCards,
      actionContributions,
    });
    const aiInstructionScale = aiInstruction?.advantageMultiplier ?? 1;
    const aiShoutScale = (aiShout?.coachEffectiveness ?? 1) * (aiShout?.advantageMultiplier ?? 1);

    return {
      patch: {
        userCoachInstruction: userInstruction,
        userCoachShout: userShout,
        aiCoachInstruction: aiInstruction,
        aiCoachInstructionMemory: aiInstructionMemory,
        aiCoachShout: aiShout,
        aiCoachShoutMemory: aiShoutMemory,
        aiCoachCommandRng: aiRng,
        aiCoachNextCommandMinute: aiNextDecisionMinute,
        aiCoachShoutAnnouncement: aiAnnouncement,
      },
      user: {
        initiativeModifier: userInstructionEffects.initiativeModifier + userShoutEffects.initiativeModifier,
        ownShotModifier: userInstructionEffects.userShotModifier + userShoutEffects.userShotModifier,
        opponentShotModifier: userInstructionEffects.opponentShotModifier + userShoutEffects.opponentShotModifier,
        turnoverRiskModifier: userInstructionEffects.turnoverRiskModifier + userShoutEffects.turnoverRiskModifier,
        fatigueExtra: userInstructionEffects.fatigueExtra + userShoutEffects.fatigueExtra,
        foulMultiplier: userInstructionEffects.foulMultiplier * userShoutEffects.foulMultiplier,
        injuryMultiplier: userInstructionEffects.injuryMultiplier * userShoutEffects.injuryMultiplier,
      },
      ai: {
        initiativeModifier:
          aiInstructionEffects.initiativeModifier * aiInstructionScale +
          aiShoutEffects.initiativeModifier * aiShoutScale,
        ownShotModifier:
          aiInstructionEffects.userShotModifier * aiInstructionScale +
          aiShoutEffects.userShotModifier * aiShoutScale,
        opponentShotModifier:
          aiInstructionEffects.opponentShotModifier * aiInstructionScale +
          aiShoutEffects.opponentShotModifier * aiShoutScale,
        turnoverRiskModifier:
          aiInstructionEffects.turnoverRiskModifier * aiInstructionScale +
          aiShoutEffects.turnoverRiskModifier * aiShoutScale,
        fatigueExtra:
          aiInstructionEffects.fatigueExtra * aiInstructionScale +
          aiShoutEffects.fatigueExtra * aiShoutScale,
        foulMultiplier:
          scaleNeutralMultiplier(aiInstructionEffects.foulMultiplier, aiInstructionScale) *
          scaleNeutralMultiplier(aiShoutEffects.foulMultiplier, aiShoutScale),
        injuryMultiplier:
          scaleNeutralMultiplier(aiInstructionEffects.injuryMultiplier, aiInstructionScale) *
          scaleNeutralMultiplier(aiShoutEffects.injuryMultiplier, aiShoutScale),
      },
    };
  },
};
