import {
  Club,
  Coach,
  HealthStatus,
  InstructionCounterAttack,
  InstructionIntensity,
  InstructionMindset,
  InstructionPassing,
  InstructionPressing,
  InstructionTempo,
  Lineup,
  MatchEventType,
  Player,
  PlayerPosition,
} from '../types';
import { TacticRepository } from '../resources/tactics_db';
import { AiCoachTacticsService } from '../services/AiCoachTacticsService';
import { GoalAttributionService } from '../services/GoalAttributionService';
import { LineupService } from '../services/LineupService';
import { LiveMatchInstructionBalanceService } from '../services/LiveMatchInstructionBalanceService';
import { MatchActionService } from '../services/MatchActionService';
import { PlayerMoraleService } from '../services/PlayerMoraleService';
import { TacticalMatchupService } from '../services/TacticalMatchupService';

type Side = 'HOME' | 'AWAY';

type LiveInstructions = {
  tempo: InstructionTempo;
  mindset: InstructionMindset;
  intensity: InstructionIntensity;
  passing: InstructionPassing;
  pressing: InstructionPressing;
  counterAttack: InstructionCounterAttack;
  tempoResponseFactor: number;
  mindsetResponseFactor: number;
  intensityResponseFactor: number;
  passingResponseFactor: number;
  pressingResponseFactor: number;
  counterAttackResponseFactor: number;
};

type Scenario = {
  id: string;
  description: string;
  userTacticId: string;
  aiTacticId: string;
  userInstructions: LiveInstructions;
  userMorale: number;
  aiMorale: number;
  userPrep: 'READY' | 'NONE';
  aiCoachLevel: 'AVERAGE' | 'GOOD';
  aiStrengthBonus: number;
  aiPlanRetention: 'current-clear-on-null' | 'hold-pre-match';
  aiDepthTrap?: 'neutral-autopick' | 'fast-counter-autopick';
};

type TeamStats = {
  goals: number;
  shots: number;
  shotsOnTarget: number;
  fouls: number;
  activeMinutes: number;
  openPlayChances: number;
  avgShotThreshold: number;
};

type MatchResult = {
  userGoals: number;
  aiGoals: number;
  userShots: number;
  aiShots: number;
  userXThreat: number;
  aiXThreat: number;
  aiInstructionMinutes: number;
  aiInstructionClears: number;
  userLowPrepPenalty: number;
  avgMomentum: number;
};

const MATCHES_PER_SCENARIO = 50;

const baseInstructions: LiveInstructions = {
  tempo: 'NORMAL',
  mindset: 'NEUTRAL',
  intensity: 'NORMAL',
  passing: 'MIXED',
  pressing: 'NORMAL',
  counterAttack: 'NORMAL',
  tempoResponseFactor: 1,
  mindsetResponseFactor: 1,
  intensityResponseFactor: 1,
  passingResponseFactor: 1,
  pressingResponseFactor: 1,
  counterAttackResponseFactor: 1,
};

const maxResponseAttackInstructions: LiveInstructions = {
  tempo: 'FAST',
  mindset: 'OFFENSIVE',
  intensity: 'NORMAL',
  passing: 'SHORT',
  pressing: 'PRESSING',
  counterAttack: 'NORMAL',
  tempoResponseFactor: 1.4,
  mindsetResponseFactor: 1.4,
  intensityResponseFactor: 1,
  passingResponseFactor: 1.4,
  pressingResponseFactor: 1.4,
  counterAttackResponseFactor: 1,
};

const maxResponseCounterInstructions: LiveInstructions = {
  tempo: 'FAST',
  mindset: 'OFFENSIVE',
  intensity: 'AGGRESSIVE',
  passing: 'LONG',
  pressing: 'PRESSING',
  counterAttack: 'COUNTER',
  tempoResponseFactor: 1.4,
  mindsetResponseFactor: 1.4,
  intensityResponseFactor: 1.4,
  passingResponseFactor: 1.4,
  pressingResponseFactor: 1.4,
  counterAttackResponseFactor: 1.4,
};

const fastCounterProfile = {
  tempo: 'FAST' as InstructionTempo,
  mindset: 'OFFENSIVE' as InstructionMindset,
  intensity: 'NORMAL' as InstructionIntensity,
  passing: 'MIXED' as InstructionPassing,
  pressing: 'PRESSING' as InstructionPressing,
  counterAttack: 'COUNTER' as InstructionCounterAttack,
};

const seededRng = (seed: number, minute: number, offset = 0): number => {
  const x = Math.sin(seed + minute + offset) * 10000;
  return x - Math.floor(x);
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const qualityGapCurve = (gap: number): number => {
  const absGap = Math.abs(gap);
  if (absGap <= 2) return 0;
  const normalized = Math.min(1, (absGap - 2) / 18);
  return Math.sign(gap) * Math.pow(normalized, 1.35);
};

const avg = (values: number[], fallback = 60) =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

const makeCoach = (id: string, level: Scenario['aiCoachLevel']): Coach => ({
  id,
  firstName: 'AI',
  lastName: level === 'GOOD' ? 'Dobry' : 'Przecietny',
  age: 48,
  nationality: 'POL',
  avatarUrl: '',
  attributes: level === 'GOOD'
    ? { attacking: 72, defending: 72, motivation: 76, discipline: 72, workingWithYoungsters: 55, fitness: 65, goalkeeping: 45, tacticalKnowledge: 76, judgingPlayerAbility: 70, judgingPlayerPotential: 65, adaptability: 65, determination: 74, manManagement: 75, experience: 76, decisionMaking: 76 }
    : { attacking: 58, defending: 58, motivation: 58, discipline: 58, workingWithYoungsters: 50, fitness: 55, goalkeeping: 45, tacticalKnowledge: 58, judgingPlayerAbility: 58, judgingPlayerPotential: 55, adaptability: 55, determination: 58, manManagement: 58, experience: 58, decisionMaking: 58 },
  reputation: level === 'GOOD' ? 7 : 5,
  preferredFormation: '4-4-2',
  tacticalStyle: 'BALANCED',
  salary: 0,
  contractUntil: '',
  traits: [],
} as Coach);

const makeClub = (id: string, name: string, reputation: number, coach: Coach): Club => ({
  id,
  name,
  shortName: name.slice(0, 3).toUpperCase(),
  country: 'Poland',
  region: 'POLAND' as any,
  leagueId: 'TEST',
  reputation,
  budget: 0,
  transferBudget: 0,
  wageBudget: 0,
  squadValue: 0,
  colors: { primary: '#000000', secondary: '#ffffff' },
  colorsHex: { primary: '#000000', secondary: '#ffffff' },
  coachId: coach.id,
  morale: 50,
  stats: { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] },
} as Club);

const makePlayer = (id: string, position: PlayerPosition, rating: number, morale: number): Player => {
  const positionBias =
    position === PlayerPosition.GK ? { goalkeeping: 10, defending: 2, finishing: -12 } :
    position === PlayerPosition.DEF ? { defending: 8, positioning: 7, finishing: -8 } :
    position === PlayerPosition.MID ? { passing: 7, technique: 6, vision: 6 } :
    { finishing: 9, attacking: 8, pace: 4 };

  const attr = (offset = 0, key?: keyof typeof positionBias) =>
    clamp(Math.round(rating + offset + (key && positionBias[key] ? positionBias[key] : 0)), 35, 95);

  return {
    id,
    firstName: 'Test',
    lastName: id,
    age: 26,
    nationality: 'POL',
    clubId: id.startsWith('U') ? 'USER' : 'AI',
    position,
    overallRating: rating,
    potential: rating,
    marketValue: rating * 100000,
    annualSalary: 100000,
    contractEndDate: '2027-06-30',
    morale,
    condition: 100,
    health: { status: HealthStatus.HEALTHY },
    attributes: {
      attacking: attr(0, 'attacking'),
      defending: attr(0, 'defending'),
      goalkeeping: attr(0, 'goalkeeping'),
      pace: attr(0, 'pace'),
      stamina: attr(2),
      strength: attr(0),
      technique: attr(0, 'technique'),
      passing: attr(0, 'passing'),
      finishing: attr(0, 'finishing'),
      heading: attr(-2),
      crossing: attr(-1),
      dribbling: attr(0),
      vision: attr(0, 'vision'),
      positioning: attr(0, 'positioning'),
      workRate: attr(1),
      aggression: attr(0),
      leadership: attr(0),
      mentality: attr(0),
      freeKicks: attr(-5),
      penalties: attr(-3),
      corners: attr(-4),
    },
    stats: { matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, ratingHistory: [] },
  } as Player;
};

const makeTeam = (prefix: 'U' | 'A', baseRating: number, morale: number): Player[] => [
  makePlayer(`${prefix}_GK`, PlayerPosition.GK, baseRating, morale),
  makePlayer(`${prefix}_LB`, PlayerPosition.DEF, baseRating, morale),
  makePlayer(`${prefix}_CB1`, PlayerPosition.DEF, baseRating + 1, morale),
  makePlayer(`${prefix}_CB2`, PlayerPosition.DEF, baseRating, morale),
  makePlayer(`${prefix}_RB`, PlayerPosition.DEF, baseRating, morale),
  makePlayer(`${prefix}_LM`, PlayerPosition.MID, baseRating, morale),
  makePlayer(`${prefix}_CM1`, PlayerPosition.MID, baseRating + 1, morale),
  makePlayer(`${prefix}_CM2`, PlayerPosition.MID, baseRating, morale),
  makePlayer(`${prefix}_RM`, PlayerPosition.MID, baseRating, morale),
  makePlayer(`${prefix}_ST1`, PlayerPosition.FWD, baseRating + 1, morale),
  makePlayer(`${prefix}_ST2`, PlayerPosition.FWD, baseRating, morale),
];

const makeLineup = (players: Player[], tacticId: string): Lineup => ({
  tacticId,
  startingXI: players.map(player => player.id),
  substitutes: [],
  captainId: players[6]?.id ?? null,
  penaltyTakerId: players[9]?.id ?? null,
  freeKickTakerId: players[6]?.id ?? null,
});

const getXIPlayers = (players: Player[], lineup: Lineup) =>
  players.filter(player => lineup.startingXI.includes(player.id));

const getAvgAttr = (players: Player[], lineup: Lineup, attr: keyof Player['attributes'], positions?: PlayerPosition[]) => {
  const selected = getXIPlayers(players, lineup).filter(player => !positions || positions.includes(player.position));
  return avg(selected.map(player => player.attributes[attr]), 60);
};

const getEffectiveXIStrength = (players: Player[], lineup: Lineup): number => {
  const ids = lineup.startingXI.filter((id): id is string => id !== null);
  return avg(players.filter(player => ids.includes(player.id)).map(player => player.overallRating * PlayerMoraleService.getMatchMultiplier(player)), 60) * Math.min(1, ids.length / 11);
};

const getFatiguePenalty = (players: Player[], lineup: Lineup, fatigue: Record<string, number>) => {
  const active = getXIPlayers(players, lineup);
  const avgFatigue = avg(active.map(player => fatigue[player.id] ?? 100), 100);
  return Math.max(0, (82 - avgFatigue) / 100) * 0.038;
};

const applyPrepImpact = (scenario: Scenario, side: 'USER' | 'AI') => {
  if (side === 'USER' && scenario.userPrep === 'NONE') {
    return {
      initiativeModifier: -0.010,
      shotModifier: -0.006,
      shotResistanceModifier: -0.004,
      finishingMultiplier: 0.982,
      goalkeepingMultiplier: 0.988,
      momentumBonus: -2.4,
    };
  }
  return {
    initiativeModifier: 0,
    shotModifier: 0,
    shotResistanceModifier: 0,
    finishingMultiplier: 1,
    goalkeepingMultiplier: 1,
    momentumBonus: 0,
  };
};

const getAiDecision = (input: Parameters<typeof AiCoachTacticsService.decideInMatchInstructions>) => {
  const originalLog = console.log;
  console.log = () => undefined;
  try {
    return AiCoachTacticsService.decideInMatchInstructions(...input);
  } finally {
    console.log = originalLog;
  }
};

const simulateOne = (scenario: Scenario, matchIndex: number): MatchResult => {
  const seed = 91001 + matchIndex * 173;
  const userCoach = makeCoach('USER_COACH', 'AVERAGE');
  const aiCoach = makeCoach('AI_COACH', scenario.aiCoachLevel);
  const userClub = makeClub('USER', 'User FC', 7, userCoach);
  const aiClub = makeClub('AI', 'AI FC', scenario.aiStrengthBonus > 0 ? 8 : 7, aiCoach);
  const userPlayers = makeTeam('U', 68, scenario.userMorale);
  const aiPlayers = scenario.aiDepthTrap
    ? makeOrderedDepthSquad('A').map(player => ({ ...player, morale: scenario.aiMorale }))
    : makeTeam('A', 68 + scenario.aiStrengthBonus, scenario.aiMorale);
  const userLineup = makeLineup(userPlayers, scenario.userTacticId);
  const aiLineup = scenario.aiDepthTrap
    ? LineupService.autoPickLineup('AI', aiPlayers, scenario.aiTacticId, aiCoach, {
        formAware: false,
        selectionSeed: `${scenario.id}_${matchIndex}`,
        instructionProfile: scenario.aiDepthTrap === 'fast-counter-autopick' ? fastCounterProfile : undefined,
      })
    : makeLineup(aiPlayers, scenario.aiTacticId);
  const userPrep = applyPrepImpact(scenario, 'USER');
  const aiPrep = applyPrepImpact(scenario, 'AI');

  const stats: Record<Side, TeamStats> = {
    HOME: { goals: 0, shots: 0, shotsOnTarget: 0, fouls: 0, activeMinutes: 0, openPlayChances: 0, avgShotThreshold: 0 },
    AWAY: { goals: 0, shots: 0, shotsOnTarget: 0, fouls: 0, activeMinutes: 0, openPlayChances: 0, avgShotThreshold: 0 },
  };
  const fatigue = {
    HOME: Object.fromEntries(userPlayers.map(player => [player.id, 100])),
    AWAY: Object.fromEntries(aiPlayers.map(player => [player.id, 100])),
  } as Record<Side, Record<string, number>>;

  let momentum = 0;
  let momentumSum = 0;
  let aiActiveShout: (LiveInstructions & { id: string }) | null = {
    id: 'pre_match',
    tempo: 'NORMAL',
    mindset: scenario.aiStrengthBonus > 0 ? 'OFFENSIVE' : 'NEUTRAL',
    intensity: 'NORMAL',
    passing: 'MIXED',
    pressing: scenario.aiCoachLevel === 'GOOD' ? 'PRESSING' : 'NORMAL',
    counterAttack: scenario.userInstructions.mindset === 'OFFENSIVE' ? 'COUNTER' : 'NORMAL',
    tempoResponseFactor: 1,
    mindsetResponseFactor: 1,
    intensityResponseFactor: 1,
    passingResponseFactor: 1,
    pressingResponseFactor: 1,
    counterAttackResponseFactor: 1,
  };
  let aiNextInstructionMinute = 10;
  let aiInstructionMinutes = 0;
  let aiInstructionClears = 0;
  let aiSubsUsed = 0;
  let userSubsUsed = 0;

  for (let minute = 1; minute <= 90; minute += 1) {
    const userTactic = TacticRepository.getById(userLineup.tacticId);
    const aiTactic = TacticRepository.getById(aiLineup.tacticId);
    const homeStrength = getEffectiveXIStrength(userPlayers, userLineup);
    const awayStrength = getEffectiveXIStrength(aiPlayers, aiLineup);
    const qualityGap = homeStrength - awayStrength;
    const midfieldDiff =
      getAvgAttr(userPlayers, userLineup, 'technique', [PlayerPosition.MID]) -
      getAvgAttr(aiPlayers, aiLineup, 'technique', [PlayerPosition.MID]);
    const homeFatPenalty = getFatiguePenalty(userPlayers, userLineup, fatigue.HOME);
    const awayFatPenalty = getFatiguePenalty(aiPlayers, aiLineup, fatigue.AWAY);
    const homeAttackChance = clamp(
      0.5 +
        momentum / 340 +
        qualityGapCurve(qualityGap) * 0.055 +
        clamp(midfieldDiff * 0.0014, -0.026, 0.026) +
        (homeFatPenalty - awayFatPenalty) * 3 +
        userPrep.initiativeModifier -
        aiPrep.initiativeModifier,
      0.28,
      0.72
    );

    let activeSide: Side = seededRng(seed, minute, 600) < homeAttackChance ? 'HOME' : 'AWAY';

    if (minute >= aiNextInstructionMinute) {
      const aiScoreDiff = stats.AWAY.goals - stats.HOME.goals;
      const aiMomentum = -momentum;
      const decision = getAiDecision([
        aiScoreDiff,
        aiMomentum,
        minute,
        aiCoach.attributes.decisionMaking,
        aiCoach.attributes.experience,
        -1,
        seed,
        scenario.userInstructions.mindset,
        userTactic.attackBias,
        aiTactic.defenseBias,
        {
          aiAvgFatigue: avg(Object.values(fatigue.AWAY), 100),
          aiLowestFatigue: Math.min(...Object.values(fatigue.AWAY)),
          aiShots: stats.AWAY.shots,
          userShots: stats.HOME.shots,
          aiShotsOnTarget: stats.AWAY.shotsOnTarget,
          userShotsOnTarget: stats.HOME.shotsOnTarget,
          aiSubsRemaining: 5 - aiSubsUsed,
          userAvgFatigue: avg(Object.values(fatigue.HOME), 100),
          userLowestFatigue: Math.min(...Object.values(fatigue.HOME)),
          userSubsRemaining: 5 - userSubsUsed,
          userTempo: scenario.userInstructions.tempo,
          aiPaceAvg: getAvgAttr(aiPlayers, aiLineup, 'pace'),
          aiTechAvg: getAvgAttr(aiPlayers, aiLineup, 'technique'),
          userPaceAvg: getAvgAttr(userPlayers, userLineup, 'pace'),
          userTechAvg: getAvgAttr(userPlayers, userLineup, 'technique'),
          aiTacticId: aiLineup.tacticId,
          userTacticId: userLineup.tacticId,
        },
      ]);
      if (decision) {
        aiActiveShout = {
          id: `ai_${minute}`,
          tempo: decision.tempo,
          mindset: decision.mindset,
          intensity: decision.intensity,
          passing: decision.passing ?? 'MIXED',
          pressing: decision.pressing ?? 'NORMAL',
          counterAttack: decision.counterAttack ?? 'NORMAL',
          tempoResponseFactor: 1,
          mindsetResponseFactor: 1,
          intensityResponseFactor: 1,
          passingResponseFactor: 1,
          pressingResponseFactor: 1,
          counterAttackResponseFactor: 1,
        };
      } else if (scenario.aiPlanRetention === 'current-clear-on-null') {
        if (aiActiveShout) aiInstructionClears += 1;
        aiActiveShout = null;
      }
      aiNextInstructionMinute = minute + 10 + Math.floor(seededRng(seed, minute, 77) * 11);
    }

    if (aiActiveShout) aiInstructionMinutes += 1;

    const activePlayers = activeSide === 'HOME' ? userPlayers : aiPlayers;
    const defendingPlayers = activeSide === 'HOME' ? aiPlayers : userPlayers;
    const activeLineup = activeSide === 'HOME' ? userLineup : aiLineup;
    const defendingLineup = activeSide === 'HOME' ? aiLineup : userLineup;
    const attackingTactic = activeSide === 'HOME' ? userTactic : aiTactic;
    const defendingTactic = activeSide === 'HOME' ? aiTactic : userTactic;
    const activeFatigue = fatigue[activeSide];
    const defendingFatigue = fatigue[activeSide === 'HOME' ? 'AWAY' : 'HOME'];
    const activePrep = activeSide === 'HOME' ? userPrep : aiPrep;
    const defendingPrep = activeSide === 'HOME' ? aiPrep : userPrep;
    const isUserAttacking = activeSide === 'HOME';
    const activeAvgRating = activeSide === 'HOME' ? homeStrength : awayStrength;
    const defendingAvgRating = activeSide === 'HOME' ? awayStrength : homeStrength;
    const ratingGap = activeAvgRating - defendingAvgRating;

    let shotThreshold = 0.11;
    shotThreshold -= (defendingTactic.defenseBias / 100) * 0.045;
    shotThreshold += clamp(qualityGapCurve(ratingGap) * 0.020, -0.014, 0.020);
    shotThreshold += clamp((attackingTactic.attackBias - 50) / 100 * 0.04, -0.016, 0.016);
    shotThreshold += (attackingTactic.pressingIntensity / 100) * 0.008;
    shotThreshold += activePrep.shotModifier - defendingPrep.shotResistanceModifier;
    if ((activeSide === 'HOME' && momentum > 0) || (activeSide === 'AWAY' && momentum < 0)) {
      shotThreshold += (Math.abs(momentum) / 100) * 0.012;
    }
    shotThreshold += TacticalMatchupService.evaluateShotMatchup(
      attackingTactic.id,
      defendingTactic.id,
      activePlayers,
      activeLineup.startingXI,
      defendingPlayers,
      defendingLineup.startingXI
    ).modifier;

    const u = scenario.userInstructions;
    const ai = aiActiveShout;
    const userOppDefBias = aiTactic.defenseBias;
    const aiOppDefBias = userTactic.defenseBias;
    const userTech = getAvgAttr(userPlayers, userLineup, 'technique');
    const aiTech = getAvgAttr(aiPlayers, aiLineup, 'technique');

    if (u.tempo === 'FAST') shotThreshold += isUserAttacking ? 0.012 * u.tempoResponseFactor : LiveMatchInstructionBalanceService.getFastTempoDefensiveExposure(userOppDefBias, userTech) * u.tempoResponseFactor;
    if (u.tempo === 'SLOW' && isUserAttacking) shotThreshold += LiveMatchInstructionBalanceService.getSlowTempoModifier(userPlayers, userLineup.startingXI, aiPlayers, aiLineup.startingXI) * u.tempoResponseFactor;
    if (u.mindset === 'OFFENSIVE') shotThreshold += isUserAttacking ? 0.015 * u.mindsetResponseFactor : LiveMatchInstructionBalanceService.getOffensiveMindsetDefensiveExposure(userOppDefBias) * u.mindsetResponseFactor;
    if (u.mindset === 'DEFENSIVE') shotThreshold += !isUserAttacking ? -LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(userPlayers, userLineup.startingXI, aiPlayers, aiLineup.startingXI) * u.mindsetResponseFactor : -0.005 * u.mindsetResponseFactor;
    if (u.pressing === 'PRESSING') {
      const mod = LiveMatchInstructionBalanceService.getPressingModifier(userPlayers, userLineup.startingXI, aiPlayers, aiLineup.startingXI) * u.pressingResponseFactor;
      shotThreshold += isUserAttacking ? mod : -mod;
    }
    shotThreshold += LiveMatchInstructionBalanceService.getCombinationModifier(u.tempo, u.mindset, u.pressing, u.counterAttack, isUserAttacking);

    if (ai) {
      const isAiAttacking = !isUserAttacking;
      if (ai.tempo === 'FAST') shotThreshold += isAiAttacking ? 0.012 : LiveMatchInstructionBalanceService.getFastTempoDefensiveExposure(aiOppDefBias, aiTech);
      if (ai.tempo === 'SLOW' && isAiAttacking) shotThreshold += LiveMatchInstructionBalanceService.getSlowTempoModifier(aiPlayers, aiLineup.startingXI, userPlayers, userLineup.startingXI);
      if (ai.mindset === 'OFFENSIVE') shotThreshold += isAiAttacking ? 0.015 : LiveMatchInstructionBalanceService.getOffensiveMindsetDefensiveExposure(aiOppDefBias);
      if (ai.mindset === 'DEFENSIVE') shotThreshold += !isAiAttacking ? -LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(aiPlayers, aiLineup.startingXI, userPlayers, userLineup.startingXI) : -0.005;
      if (ai.pressing === 'PRESSING') {
        const mod = LiveMatchInstructionBalanceService.getPressingModifier(aiPlayers, aiLineup.startingXI, userPlayers, userLineup.startingXI);
        shotThreshold += isAiAttacking ? mod : -mod;
      }
      shotThreshold += LiveMatchInstructionBalanceService.getCombinationModifier(ai.tempo, ai.mindset, ai.pressing, ai.counterAttack, isAiAttacking);
    }

    const activeBuildUp = LiveMatchInstructionBalanceService.getBuildUpAccuracyProfile(
      activePlayers,
      activeLineup.startingXI,
      defendingPlayers,
      defendingLineup.startingXI,
      isUserAttacking ? u.passing : ai?.passing ?? 'MIXED',
      isUserAttacking ? u.tempo : ai?.tempo ?? 'NORMAL',
      isUserAttacking ? ai?.pressing ?? 'NORMAL' : u.pressing,
      activeFatigue
    );
    shotThreshold += activeBuildUp.shotModifier;
    shotThreshold -= activeBuildUp.turnoverRisk * ((isUserAttacking ? ai?.pressing === 'PRESSING' : u.pressing === 'PRESSING') ? 0.006 : 0.002);
    shotThreshold = clamp(shotThreshold, 0.050, 0.155);

    stats[activeSide].activeMinutes += 1;
    stats[activeSide].avgShotThreshold += shotThreshold;

    const userIntensityRisk = LiveMatchInstructionBalanceService.getIntensityRiskModifiers(u.intensity, userPlayers, userLineup.startingXI, u.intensityResponseFactor);
    const aiIntensityRisk = LiveMatchInstructionBalanceService.getIntensityRiskModifiers(ai?.intensity ?? 'NORMAL', aiPlayers, aiLineup.startingXI, 1);
    const activeIntensityRisk = isUserAttacking ? userIntensityRisk : aiIntensityRisk;
    const eventRoll = seededRng(seed, minute, 610);
    const foulThreshold = 0.043 * activeIntensityRisk.foul;

    if (eventRoll < foulThreshold) {
      stats[activeSide].fouls += 1;
      momentum = clamp(momentum + (activeSide === 'HOME' ? -3 : 3), -100, 100);
    } else if (eventRoll < shotThreshold) {
      stats[activeSide].shots += 1;
      stats[activeSide].openPlayChances += 1;
      const scorer = GoalAttributionService.pickScorer(activePlayers, activeLineup.startingXI as string[], false, () => seededRng(seed, minute, 700));
      const assistant = scorer ? GoalAttributionService.pickAssistant(activePlayers, activeLineup.startingXI as string[], scorer.id, false, () => seededRng(seed, minute, 720)) : null;
      if (scorer) {
        const gk = defendingPlayers.find(player => player.id === defendingLineup.startingXI[0]);
        const defs = defendingPlayers.filter(player => defendingLineup.startingXI.slice(1, 6).includes(player.id));
        const action = MatchActionService.evaluateOpenPlayAction({
          attackingPlayers: activePlayers,
          defendingPlayers,
          attackingLineup: activeLineup,
          defendingLineup,
          attackingTactic,
          defendingTactic,
          attackingFatigue: activeFatigue,
          defendingFatigue,
          scorer,
          assistant,
          rng: () => seededRng(seed, minute, 760),
        });
        const isGoal = GoalAttributionService.checkShotSuccess(
          scorer,
          gk as Player,
          defs,
          false,
          () => seededRng(seed, minute, 750),
          false,
          activeFatigue[scorer.id] ?? 100,
          gk ? defendingFatigue[gk.id] ?? 100 : 100,
          action.finishingFitMod * activePrep.finishingMultiplier,
          defendingPrep.goalkeepingMultiplier,
          defendingFatigue
        );
        if (isGoal) {
          stats[activeSide].goals += 1;
          stats[activeSide].shotsOnTarget += 1;
          momentum = clamp(momentum + (activeSide === 'HOME' ? 45 : -45), -100, 100);
        } else {
          const onTarget = seededRng(seed, minute, 780) < 0.72 + action.shotOnTargetBoost;
          if (onTarget) stats[activeSide].shotsOnTarget += 1;
          momentum = clamp(momentum + (activeSide === 'HOME' ? 8 : -8), -100, 100);
        }
      }
    } else {
      momentum = clamp(momentum + ((activeSide === 'HOME' ? 1 : -1) * 1.5) + (seededRng(seed, minute, 900) - 0.5) * 3, -100, 100);
    }

    const userFatigueExtra = LiveMatchInstructionBalanceService.getInstructionFatigueExtra(u.tempo, u.intensity, u.pressing, u.tempoResponseFactor, u.intensityResponseFactor, u.pressingResponseFactor);
    const aiFatigueExtra = ai ? LiveMatchInstructionBalanceService.getInstructionFatigueExtra(ai.tempo, ai.intensity, ai.pressing, 1, 1, 1) : 0;
    for (const player of userPlayers) fatigue.HOME[player.id] = Math.max(0, fatigue.HOME[player.id] - 0.21 - userFatigueExtra);
    for (const player of aiPlayers) fatigue.AWAY[player.id] = Math.max(0, fatigue.AWAY[player.id] - 0.21 - aiFatigueExtra);

    if (minute === 62 && scenario.id.includes('no-rotation')) aiSubsUsed = 4;
    if (minute === 62 && !scenario.id.includes('no-rotation')) {
      aiSubsUsed = 3;
      userSubsUsed = 3;
    }

    momentumSum += momentum;
  }

  return {
    userGoals: stats.HOME.goals,
    aiGoals: stats.AWAY.goals,
    userShots: stats.HOME.shots,
    aiShots: stats.AWAY.shots,
    userXThreat: stats.HOME.avgShotThreshold / Math.max(1, stats.HOME.activeMinutes),
    aiXThreat: stats.AWAY.avgShotThreshold / Math.max(1, stats.AWAY.activeMinutes),
    aiInstructionMinutes,
    aiInstructionClears,
    userLowPrepPenalty: scenario.userPrep === 'NONE' ? 1 : 0,
    avgMomentum: momentumSum / 90,
  };
};

const scenarios: Scenario[] = [
  {
    id: 'baseline-current',
    description: 'Równe drużyny, neutralny gracz, obecne czyszczenie planu AI',
    userTacticId: '4-4-2',
    aiTacticId: '4-4-2',
    userInstructions: baseInstructions,
    userMorale: 55,
    aiMorale: 55,
    userPrep: 'READY',
    aiCoachLevel: 'AVERAGE',
    aiStrengthBonus: 0,
    aiPlanRetention: 'current-clear-on-null',
  },
  {
    id: 'baseline-ai-holds',
    description: 'Równe drużyny, neutralny gracz, AI utrzymuje plan przedmeczowy',
    userTacticId: '4-4-2',
    aiTacticId: '4-4-2',
    userInstructions: baseInstructions,
    userMorale: 55,
    aiMorale: 55,
    userPrep: 'READY',
    aiCoachLevel: 'AVERAGE',
    aiStrengthBonus: 0,
    aiPlanRetention: 'hold-pre-match',
  },
  {
    id: 'user-offensive-current',
    description: 'Gracz FAST+OFFENSIVE, AI obecnie może tracić plan',
    userTacticId: '4-4-2-OFF',
    aiTacticId: '4-4-2',
    userInstructions: { ...baseInstructions, tempo: 'FAST', mindset: 'OFFENSIVE', pressing: 'PRESSING' },
    userMorale: 55,
    aiMorale: 55,
    userPrep: 'READY',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 0,
    aiPlanRetention: 'current-clear-on-null',
  },
  {
    id: 'user-offensive-ai-holds',
    description: 'Gracz FAST+OFFENSIVE, AI utrzymuje plan i kontrę/pressing',
    userTacticId: '4-4-2-OFF',
    aiTacticId: '4-4-2',
    userInstructions: { ...baseInstructions, tempo: 'FAST', mindset: 'OFFENSIVE', pressing: 'PRESSING' },
    userMorale: 55,
    aiMorale: 55,
    userPrep: 'READY',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 0,
    aiPlanRetention: 'hold-pre-match',
  },
  {
    id: 'user-max-rf-control-stack',
    description: 'Równe drużyny, gracz ma FAST+OFFENSIVE+SHORT+PRESSING z maksymalnym RF 1.4',
    userTacticId: '4-4-2-OFF',
    aiTacticId: '4-4-2',
    userInstructions: maxResponseAttackInstructions,
    userMorale: 55,
    aiMorale: 55,
    userPrep: 'READY',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 0,
    aiPlanRetention: 'hold-pre-match',
  },
  {
    id: 'user-max-rf-chaos-stack',
    description: 'Równe drużyny, gracz stackuje FAST+OFFENSIVE+AGGRESSIVE+LONG+PRESS+COUNTER z RF 1.4',
    userTacticId: '4-4-2-OFF',
    aiTacticId: '4-4-2',
    userInstructions: maxResponseCounterInstructions,
    userMorale: 55,
    aiMorale: 55,
    userPrep: 'READY',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 0,
    aiPlanRetention: 'hold-pre-match',
  },
  {
    id: 'bad-user-no-prep-current',
    description: 'Zły gracz: ultra ofensywa, brak przygotowania, niskie morale, obecne AI',
    userTacticId: '4-2-4',
    aiTacticId: '4-4-2',
    userInstructions: { ...baseInstructions, tempo: 'FAST', mindset: 'OFFENSIVE', intensity: 'AGGRESSIVE', pressing: 'PRESSING', passing: 'LONG' },
    userMorale: 35,
    aiMorale: 60,
    userPrep: 'NONE',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 1,
    aiPlanRetention: 'current-clear-on-null',
  },
  {
    id: 'bad-user-no-prep-ai-holds',
    description: 'Zły gracz: ultra ofensywa, brak przygotowania, niskie morale, AI utrzymuje plan',
    userTacticId: '4-2-4',
    aiTacticId: '4-4-2',
    userInstructions: { ...baseInstructions, tempo: 'FAST', mindset: 'OFFENSIVE', intensity: 'AGGRESSIVE', pressing: 'PRESSING', passing: 'LONG' },
    userMorale: 35,
    aiMorale: 60,
    userPrep: 'NONE',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 1,
    aiPlanRetention: 'hold-pre-match',
  },
  {
    id: 'ai-stronger-current',
    description: 'AI +2 OVR, dobry trener, obecne czyszczenie planu',
    userTacticId: '4-4-2',
    aiTacticId: '4-2-3-1',
    userInstructions: baseInstructions,
    userMorale: 55,
    aiMorale: 60,
    userPrep: 'READY',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 2,
    aiPlanRetention: 'current-clear-on-null',
  },
  {
    id: 'ai-stronger-ai-holds',
    description: 'AI +2 OVR, dobry trener, utrzymuje plan',
    userTacticId: '4-4-2',
    aiTacticId: '4-2-3-1',
    userInstructions: baseInstructions,
    userMorale: 55,
    aiMorale: 60,
    userPrep: 'READY',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 2,
    aiPlanRetention: 'hold-pre-match',
  },
  {
    id: 'ai-depth-neutral-autopick',
    description: 'AI ma głębię składu; neutralny autopick wybiera mocnych zawodników',
    userTacticId: '4-4-2',
    aiTacticId: '4-4-2',
    userInstructions: baseInstructions,
    userMorale: 55,
    aiMorale: 55,
    userPrep: 'READY',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 0,
    aiPlanRetention: 'hold-pre-match',
    aiDepthTrap: 'neutral-autopick',
  },
  {
    id: 'ai-depth-fast-counter-autopick',
    description: 'AI ma tę samą głębię, ale FAST+COUNTER profile psuje wybór XI przez brak acceleration',
    userTacticId: '4-4-2',
    aiTacticId: '4-4-2',
    userInstructions: baseInstructions,
    userMorale: 55,
    aiMorale: 55,
    userPrep: 'READY',
    aiCoachLevel: 'GOOD',
    aiStrengthBonus: 0,
    aiPlanRetention: 'hold-pre-match',
    aiDepthTrap: 'fast-counter-autopick',
  },
];

const summarize = (scenario: Scenario) => {
  const results = Array.from({ length: MATCHES_PER_SCENARIO }, (_, idx) => simulateOne(scenario, idx));
  const total = (pick: (result: MatchResult) => number) => results.reduce((sum, result) => sum + pick(result), 0);
  const userWins = results.filter(result => result.userGoals > result.aiGoals).length;
  const draws = results.filter(result => result.userGoals === result.aiGoals).length;
  const aiWins = results.filter(result => result.aiGoals > result.userGoals).length;
  const avg = (pick: (result: MatchResult) => number) => total(pick) / results.length;

  return {
    id: scenario.id,
    description: scenario.description,
    userWins,
    draws,
    aiWins,
    userWinPct: userWins / results.length,
    aiWinPct: aiWins / results.length,
    avgUserGoals: avg(result => result.userGoals),
    avgAiGoals: avg(result => result.aiGoals),
    avgUserShots: avg(result => result.userShots),
    avgAiShots: avg(result => result.aiShots),
    avgUserXThreat: avg(result => result.userXThreat),
    avgAiXThreat: avg(result => result.aiXThreat),
    avgAiInstructionMinutes: avg(result => result.aiInstructionMinutes),
    avgAiInstructionClears: avg(result => result.aiInstructionClears),
    avgMomentum: avg(result => result.avgMomentum),
    avgAiLineupOverall: scenario.aiDepthTrap
      ? getLineupAvgOverall(
          makeOrderedDepthSquad('A'),
          LineupService.autoPickLineup('AI', makeOrderedDepthSquad('A'), scenario.aiTacticId, makeCoach('PROBE_AVG', scenario.aiCoachLevel), {
            formAware: false,
            selectionSeed: `${scenario.id}_summary`,
            instructionProfile: scenario.aiDepthTrap === 'fast-counter-autopick' ? fastCounterProfile : undefined,
          })
        )
      : 68 + scenario.aiStrengthBonus,
  };
};

const makeOrderedDepthSquad = (prefix: 'U' | 'A'): Player[] => {
  const weak = makeTeam(prefix, 54, 55);
  const strong = makeTeam(prefix, 74, 55).map(player => ({
    ...player,
    id: `${player.id}_STRONG`,
    overallRating: player.overallRating + 2,
  }));
  return [...weak, ...strong];
};

const getLineupAvgOverall = (players: Player[], lineup: Lineup): number => {
  const ids = lineup.startingXI.filter((id): id is string => id !== null);
  return avg(players.filter(player => ids.includes(player.id)).map(player => player.overallRating), 0);
};

const runDiagnosticProbes = () => {
  const probeCoach = makeCoach('PROBE_COACH', 'GOOD');
  const orderedSquad = makeOrderedDepthSquad('A');
  const neutralLineup = LineupService.autoPickLineup('AI', orderedSquad, '4-4-2', probeCoach, {
    formAware: false,
    selectionSeed: 'probe_neutral',
  });
  const fastLineup = LineupService.autoPickLineup('AI', orderedSquad, '4-4-2', probeCoach, {
    formAware: false,
    selectionSeed: 'probe_fast',
    instructionProfile: fastCounterProfile,
  });
  const matchup = TacticalMatchupService.evaluateShotMatchup(
    '4-4-2-OFF',
    '4-4-2',
    orderedSquad,
    fastLineup.startingXI,
    orderedSquad,
    neutralLineup.startingXI
  );

  console.log('Diagnostic probes');
  console.log('probe,value');
  console.log(`playerAttributesHasAcceleration,${Object.prototype.hasOwnProperty.call(orderedSquad[0].attributes, 'acceleration')}`);
  console.log(`neutralAutoPickAvgXI,${getLineupAvgOverall(orderedSquad, neutralLineup).toFixed(2)}`);
  console.log(`fastCounterProfileAutoPickAvgXI,${getLineupAvgOverall(orderedSquad, fastLineup).toFixed(2)}`);
  console.log(`fastProfileLostXIOverall,${(getLineupAvgOverall(orderedSquad, neutralLineup) - getLineupAvgOverall(orderedSquad, fastLineup)).toFixed(2)}`);
  console.log(`fastProfileStrongPlayersSelected,${fastLineup.startingXI.filter(id => id?.includes('_STRONG')).length}`);
  console.log(`tacticalMatchupModifier,${Number.isFinite(matchup.modifier) ? matchup.modifier.toFixed(4) : String(matchup.modifier)}`);
  console.log(`tacticalMatchupSignals,${matchup.signals.map(signal => signal.id).join('|') || 'none'}`);
  console.log('');
};

runDiagnosticProbes();

const rows = scenarios.map(summarize);

console.log(`Live match balance matrix: ${MATCHES_PER_SCENARIO} matches per scenario`);
console.log('id,userW,draw,aiW,userG,aiG,userSh,aiSh,userX,aiX,aiInstrMin,aiClears,avgMom,aiXI');
for (const row of rows) {
  console.log([
    row.id,
    row.userWins,
    row.draws,
    row.aiWins,
    row.avgUserGoals.toFixed(2),
    row.avgAiGoals.toFixed(2),
    row.avgUserShots.toFixed(2),
    row.avgAiShots.toFixed(2),
    row.avgUserXThreat.toFixed(4),
    row.avgAiXThreat.toFixed(4),
    row.avgAiInstructionMinutes.toFixed(1),
    row.avgAiInstructionClears.toFixed(1),
    row.avgMomentum.toFixed(1),
    row.avgAiLineupOverall.toFixed(1),
  ].join(','));
}

console.log('\nScenario descriptions:');
for (const row of rows) {
  console.log(`${row.id}: ${row.description}`);
}
