import { useState, useEffect, useMemo, useRef } from 'react';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { useGame } from '../../context/GameContext';
import { 
  ViewState, MatchLiveState, MatchContext, PlayerPosition, CompetitionType, 
  MatchEventType, SubstitutionRecord, MatchLogEntry, InjurySeverity, 
  Player, HealthStatus, MatchSummary, MatchSummaryEvent, MatchResult,
  Lineup,
  PlayerPerformance,
  MatchEvent,
  InstructionTempo, InstructionMindset, InstructionIntensity, InstructionPassing, InstructionPressing, InstructionCounterAttack,
  Referee,
  Fixture,
  WeatherSnapshot
} from '../../types';
import { rollInjuryBySeverity } from '../../services/InjuryCatalog';
import { PlayerMoraleService } from '../../services/PlayerMoraleService';

const getPlayerPenaltyImpact = (player: Player, side: 'HOME' | 'AWAY', state: any) => {
  const ownGoals = side === 'HOME' ? state.homeGoals : state.awayGoals;
  const oppSide = side === 'HOME' ? 'AWAY' : 'HOME';
  return {
    missed: ownGoals.filter((g: any) =>
      g.isPenalty &&
      g.isMiss &&
      (g.scorerId ? g.scorerId === player.id : g.playerName === player.lastName)
    ).length,
    saved: (state.logs ?? []).filter((log: MatchLogEntry) =>
      log.type === MatchEventType.PENALTY_MISSED &&
      log.teamSide === oppSide &&
      log.secondaryPlayerId === player.id
    ).length,
  };
};

const calculateLiveRatingNumber = (player: Player, side: 'HOME' | 'AWAY', state: any) => {
  let r = 6.0;
  const goals = (side === 'HOME' ? state.homeGoals : state.awayGoals)
    .filter((g: any) => (g.scorerId ? g.scorerId === player.id : g.playerName === player.lastName) && !g.varDisallowed && !g.isMiss)
    .length;
  const assists = (side === 'HOME' ? state.homeGoals : state.awayGoals).filter((g: any) => g.assistantId === player.id).length;
  const penaltyImpact = getPlayerPenaltyImpact(player, side, state);
  const cards = state.playerYellowCards[player.id] || 0;
  const isRed = state.sentOffIds.includes(player.id);
  
  r += goals * 1.5;
  r += assists * 0.8;
  r -= penaltyImpact.missed * 0.8;
  r += penaltyImpact.saved * 1.2;
  r -= cards * 0.5;
  if (isRed) r -= 3.0;

  // Bonus/kara za różnicę bramek (dla wszystkich)
  const teamScore = side === 'HOME' ? state.homeScore : state.awayScore;
  const oppScore  = side === 'HOME' ? state.awayScore : state.homeScore;
  const scoreDiff = teamScore - oppScore;
  if (scoreDiff === 1) r += 0.5;
  else if (scoreDiff === 2) r += 0.9;
  else if (scoreDiff >= 3) r += 1.2;
  else if (scoreDiff === -1) r -= 0.5;
  else if (scoreDiff === -2) r -= 1.0;
  else if (scoreDiff === -3) r -= 1.3;
  else if (scoreDiff <= -4) r -= 1.5;

  // Bonus dla MID za bramki drużyny
  if (player.position === 'MID') {
    const teamGoals = (side === 'HOME' ? state.homeGoals : state.awayGoals).length;
    const playerSeed = player.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const midFactor = 0.65 + (playerSeed % 36) / 100;
    r += teamGoals * midFactor;
  }

  // Kara za gole stracone (tylko GK i DEF)
  if (player.position === 'GK' || player.position === 'DEF') {
    const conceded = side === 'HOME' ? state.awayScore : state.homeScore;
    r -= conceded * 0.2;
    if (conceded === 0 && player.position === 'GK' && state.minute >= 30) {
      const oppSoT = side === 'HOME' ? state.liveStats.away.shotsOnTarget : state.liveStats.home.shotsOnTarget;
      r += Math.min(1.5, 1.0 + (oppSoT / 20));
    }
  }

  // Bonus za kondycję (świeżość podnosi ocenę)
  const fatigue = (side === 'HOME' ? state.homeFatigue[player.id] : state.awayFatigue[player.id]) || 100;
  if (fatigue > 90) r += 0.2;
  r += (PlayerMoraleService.getMatchMultiplier(player) - 1) * 5;
  r += Math.min(1.2, (state.actionContributions?.[player.id] ?? 0) * 0.85);
  
  return Math.min(10, Math.max(1, r));
};

const calculateLiveRating = (player: Player, side: 'HOME' | 'AWAY', state: any) => {
  return calculateLiveRatingNumber(player, side, state).toFixed(1);
};

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MatchEngineService } from '../../services/MatchEngineService';
import { MomentumService } from '../../services/MomentumService';
import { TacticRepository } from '../../resources/tactics_db';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { MatchTacticsModal } from '../modals/MatchTacticsModal';
import { GoalAttributionService } from '../../services/GoalAttributionService';
import { BackgroundMatchProcessor } from '../../services/BackgroundMatchProcessor';
import { RefereeService } from '../../services/RefereeService';
import { PolandWeatherService } from '../../services/PolandWeatherService';
import { DisciplineService } from '../../services/DisciplineService';
import { AiMatchDecisionService } from '../../services/AiMatchDecisionService';
import { PlayerStatsService } from '../../services/PlayerStatsService';
import { MATCH_COMMENTARY_DB } from '../../data/match_commentary_pl';
import { KitSelectionService } from '../../services/KitSelectionService';
import { InjuryEventGenerator } from '../../services/InjuryEventGenerator';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import { DebugLoggerService } from '../../services/DebugLoggerService';
import { InjuryUpgradeService } from '../../services/InjuryUpgradeService';
import { MatchActionService } from '../../services/MatchActionService';
import { LiveMatchInstructionBalanceService } from '../../services/LiveMatchInstructionBalanceService';
import { AttendanceService } from '../../services/AttendanceService';
import { RivalryService } from '../../services/RivalryService';
import { LineupService } from '../../services/LineupService';
import { analyzeClubFormImpact, NEUTRAL_CLUB_FORM_IMPACT } from '../../services/MatchFormService';
import { applyFocusToFormImpact } from '../../services/MatchPrepFocusService';
import { FinanceService } from '@/services/FinanceService';
import { HalftimeTalkModal } from '../modals/HalftimeTalkModal';
import { TalkEffect, calculateOpponentCoachTalkEffect, getScoreContext } from '../../services/HalftimeTalkService';
import { AiCoachTacticsService } from '../../services/AiCoachTacticsService';
import { AiOpponentAnalysisService, AiOpponentMatchReport } from '../../services/AiOpponentAnalysisService';
import { PreMatchBriefingModal } from '../modals/PreMatchBriefingModal';
import { BriefingEffect, calculateAiCoachBriefingEffect } from '../../services/PreMatchBriefingService';
import { PostMatchDebriefModal } from '../modals/PostMatchDebriefModal';
import { DebriefEffect, DebriefContext, getDebriefContext } from '../../services/PostMatchDebriefService';
import { PlayerPositionFitService } from '../../services/PlayerPositionFitService';
import { PreMatchPressConferenceService } from '../../services/PreMatchPressConferenceService';
import { TacticalMatchupService } from '../../services/TacticalMatchupService';
import { TeamFormImpactService } from '../../services/TeamFormImpactService';
import {
  adjustBriefingEffectForPressure,
  adjustDebriefEffectForPressure,
  adjustTalkEffectForPressure,
  buildMatchPressureContext,
  getAiHalftimePressureMultiplier,
  getLivePressureModifiers,
  getPressureProfileForSide,
} from '../../services/MatchPressureService';
import { detectLeagueMotivationContext } from '../../services/LeagueMotivationContextService';

const BigJerseyIcon = ({ primary, secondary, size = "w-[89px] h-[89px]" }: { primary: string, secondary: string, size?: string }) => (
  <div className="relative group">
    <div className="absolute inset-[-10px] rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-60" style={{ backgroundColor: primary }} />
    <div className={`relative ${size} flex items-center justify-center p-2`}>
      <svg viewBox="0 0 24 30" className="w-full h-full drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" fill={primary} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
        <path d="M7 2L2 5v4l3 1v10h14V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" />
        <path d="M12 4L10 6L12 8L14 6L12 4Z" fill={secondary} fillOpacity="0.6" />
        <path d="M5 20h6v9H5z" fill={secondary} />
        <path d="M13 20h6v9h-6z" fill={secondary} />
      </svg>
    </div>
  </div>
);

const PitchBroadcastOverlay = ({
  homeColor,
  awayColor,
  activeSide,
  eventType,
  momentum,
}: {
  homeColor: string;
  awayColor: string;
  activeSide?: 'HOME' | 'AWAY';
  eventType?: MatchEventType;
  momentum: number;
}) => {
  const activeColor = activeSide === 'AWAY' ? awayColor : activeSide === 'HOME' ? homeColor : '#ffffff';
  const isMajorEvent = eventType === MatchEventType.GOAL || eventType === MatchEventType.SHOT_ON_TARGET || eventType === MatchEventType.PENALTY_SCORED;
  void momentum;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full live-pitch-svg" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden>
        <defs>
          <filter id="live-pitch-glow">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#live-pitch-glow)" opacity={activeSide ? 1 : 0.2}>
          <path
            d={activeSide === 'AWAY'
              ? 'M 50 20 C 70 34, 72 54, 55 72 S 31 104, 50 132'
              : 'M 50 130 C 30 116, 28 96, 45 78 S 69 46, 50 18'}
            fill="none"
            stroke={activeColor}
            strokeWidth={isMajorEvent ? 1.7 : 1.1}
            strokeLinecap="round"
            strokeDasharray="4 5"
            className="live-action-path"
          />
          <circle
            cx="50"
            cy={activeSide === 'AWAY' ? 20 : 130}
            r={isMajorEvent ? 3.3 : 2.4}
            fill={activeColor}
            className="live-action-dot"
          />
        </g>
      </svg>
    </div>
  );
};

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
// Deterministyczny roll z seeda meczu, zeby losowania AI byly powtarzalne w ramach tej samej symulacji.
const seededValue = (seed: number, offset: number = 0) => {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
};

const getRefereeDecisionQuality = (referee: Referee) =>
  (referee.consistency * 0.6) + ((referee.experience ?? 50) * 0.4);

const getWinterFriendlyPrepMultiplier = (teamId: string, matchDate: Date, fixtures: Fixture[]): number => {
  const month = matchDate.getMonth();
  const day = matchDate.getDate();
  const isWinterRestartWindow = month === 0 || month === 1 || (month === 2 && day <= 15);
  if (!isWinterRestartWindow) return 1;

  const matchTime = matchDate.getTime();
  const lookbackMs = 45 * 24 * 60 * 60 * 1000;
  const recentFriendlyCount = fixtures.filter(f => {
    if (f.leagueId !== CompetitionType.FRIENDLY) return false;
    if (f.homeScore === null || f.awayScore === null) return false;
    if (f.homeTeamId !== teamId && f.awayTeamId !== teamId) return false;
    const fixtureTime = f.date instanceof Date ? f.date.getTime() : new Date(f.date).getTime();
    return fixtureTime < matchTime && matchTime - fixtureTime <= lookbackMs;
  }).length;

  if (recentFriendlyCount <= 0) return 1.45;
  if (recentFriendlyCount === 1) return 1.18;
  return 1;
};

const getLiveInstructionFatigueMultiplier = (
  minute: number,
  tempo: InstructionTempo,
  intensity: InstructionIntensity,
  pressing: InstructionPressing,
  weather: WeatherSnapshot | undefined,
  subsUsed: number,
  startingXI: (string | null)[],
  fatigueMap: Record<string, number>
): number => {
  const ids = startingXI.filter((id): id is string => id !== null);
  if (ids.length === 0) return 1;

  const avgFatigue = ids.reduce((sum, id) => sum + (fatigueMap[id] ?? 100), 0) / ids.length;
  const tiredShare = ids.filter(id => (fatigueMap[id] ?? 100) < 82).length / ids.length;
  const exhaustedShare = ids.filter(id => (fatigueMap[id] ?? 100) < 70).length / ids.length;

  const exertionRaw =
    (tempo === 'FAST' ? 1.0 : tempo === 'SLOW' ? -0.35 : 0) +
    (intensity === 'AGGRESSIVE' ? 0.75 : intensity === 'CAUTIOUS' ? -0.30 : 0) +
    (pressing === 'PRESSING' ? 0.60 : 0);
  const exertionFactor = clampNumber(exertionRaw / 2.35, 0, 1);
  if (exertionFactor <= 0) return 1;

  const heatPressure = weather ? clampNumber((weather.tempC - 24) / 12, 0, 1) : 0;
  const rainPressure = weather ? clampNumber((weather.precipitationChance - 55) / 45, 0, 1) : 0;
  const weatherPressure = clampNumber(heatPressure * 0.78 + rainPressure * 0.22, 0, 1);
  const lateFactor = minute < 55 ? 0 : clampNumber((minute - 55) / 35, 0, 1);
  const rotationPressure = (Math.max(0, 4 - subsUsed) / 4) * lateFactor;
  const averageFatiguePressure = clampNumber((84 - avgFatigue) / 22, 0, 1);
  const individualFatiguePressure = clampNumber(tiredShare * 0.75 + exhaustedShare * 0.55, 0, 1);

  return clampNumber(
    1 +
      exertionFactor *
        (
          0.07 +
          weatherPressure * 0.24 +
          rotationPressure * 0.26 +
          averageFatiguePressure * 0.18 +
          individualFatiguePressure * 0.22
        ),
    1,
    1.85
  );
};

const getAiMediaStakesBriefingEffect = (
  aiSide: 'HOME' | 'AWAY',
  pressureContext: ReturnType<typeof buildMatchPressureContext> | null,
  aiCoachAttributes: { motivation?: number; experience?: number; decisionMaking?: number } | undefined,
  aiRecentForm: ('W' | 'R' | 'P')[],
  rivalryBoost: number
): BriefingEffect => {
  if (!pressureContext) {
    return {
      actionMod: 0,
      goalMod: 0,
      momentumBonus: 0,
      expiryMinute: 0,
      fatigueMult: 1,
      rivalBoost: 0,
      label: 'NORMALNE TŁO MEDIALNE',
      reactionText: '',
      wasSurprise: false,
    };
  }

  const aiProfile = aiSide === 'HOME' ? pressureContext.home : pressureContext.away;
  const opponentProfile = aiSide === 'HOME' ? pressureContext.away : pressureContext.home;
  const aiHome = aiSide === 'HOME';
  const directTableRival = Math.abs(aiProfile.rank - opponentProfile.rank) <= 2;
  const topClash = aiProfile.rank <= 5 && opponentProfile.rank <= 5;
  const relegationClash = aiProfile.rank >= 13 && opponentProfile.rank >= 13;
  const wins = aiRecentForm.slice(-5).filter(result => result === 'W').length;
  const winStreak = (() => {
    let streak = 0;
    for (let i = aiRecentForm.length - 1; i >= 0; i -= 1) {
      if (aiRecentForm[i] !== 'W') break;
      streak += 1;
    }
    return streak;
  })();
  const coachDrive = clampNumber(
    (((aiCoachAttributes?.motivation ?? 50) - 50) * 0.55 +
      ((aiCoachAttributes?.experience ?? 50) - 50) * 0.25 +
      ((aiCoachAttributes?.decisionMaking ?? 50) - 50) * 0.20) / 50,
    -1,
    1
  );

  const contextHeat = clampNumber(
    (topClash ? 0.36 : 0) +
      (relegationClash ? 0.32 : 0) +
      (directTableRival ? 0.18 : 0) +
      (aiHome ? 0.12 : 0) +
      (pressureContext.isLateSeason ? 0.16 : 0) +
      (rivalryBoost - 1) * 4.5 +
      (wins >= 3 ? 0.08 : 0) +
      (winStreak >= 2 ? Math.min(0.12, (winStreak - 1) * 0.05) : 0) +
      Math.max(0, coachDrive) * 0.14,
    0,
    1
  );

  if (contextHeat < 0.28) {
    return {
      actionMod: 0,
      goalMod: 0,
      momentumBonus: 0,
      expiryMinute: 0,
      fatigueMult: 1,
      rivalBoost: 0,
      label: 'NORMALNE TŁO MEDIALNE',
      reactionText: '',
      wasSurprise: false,
    };
  }

  return {
    actionMod: clampNumber(contextHeat * 0.022, 0, 0.022),
    goalMod: clampNumber(contextHeat * 0.014, 0, 0.014),
    momentumBonus: Math.round(contextHeat * 11),
    expiryMinute: contextHeat >= 0.70 ? 45 : 30,
    fatigueMult: clampNumber(1 + contextHeat * 0.025, 1, 1.025),
    rivalBoost: 0,
    label: topClash
      ? 'MECZ NA SZCZYCIE'
      : relegationClash
        ? 'MECZ O PRZETRWANIE'
        : directTableRival
          ? 'BEZPOŚREDNI RYWAL'
          : 'MOCNE TŁO MEDIALNE',
    reactionText: '',
    wasSurprise: false,
  };
};

const getAiUserPatternBriefingEffect = (
  userTeamId: string,
  currentUserTacticId: string,
  aiCoachAttributes: { motivation?: number; experience?: number; decisionMaking?: number } | undefined,
  opponentReport?: AiOpponentMatchReport
): BriefingEffect => {
  const neutralPatternEffect = (): BriefingEffect => ({
    actionMod: 0,
    goalMod: 0,
    momentumBonus: 0,
    expiryMinute: 0,
    fatigueMult: 1,
    rivalBoost: 0,
    label: 'BRAK ROZPOZNANEGO WZORCA',
    reactionText: '',
    wasSurprise: false,
  });

  if (!opponentReport || opponentReport.confidence < 0.42) {
    return neutralPatternEffect();
  }

  const tacticStyleKey = (tacticId: string) => {
    const tactic = TacticRepository.getById(tacticId);
    return `${tactic.category}_${tactic.attackBias >= 68 ? 'ATT' : tactic.defenseBias >= 72 ? 'DEF' : 'BAL'}_${tactic.pressingIntensity >= 70 ? 'PRESS' : 'NORMAL'}`;
  };
  const currentStyleKey = tacticStyleKey(currentUserTacticId);
  const predictedStyleKey = tacticStyleKey(opponentReport.predictedTacticId);
  const reportAlignment = opponentReport.predictedTacticId === currentUserTacticId
    ? 1
    : predictedStyleKey === currentStyleKey
      ? 0.72
      : 0;

  if (reportAlignment <= 0) {
    return neutralPatternEffect();
  }

  // AI sprawdza startowe taktyki z historii; zmiany w trakcie meczu nie powinny kasowac kary za powtarzalny plan startowy.
  const recent = MatchHistoryService.getTeamHistory(userTeamId)
    .map(entry => entry.homeTeamId === userTeamId
      ? (entry.homeStartingTacticId ?? entry.homeTacticId)
      : (entry.awayStartingTacticId ?? entry.awayTacticId)
    )
    .filter((tacticId): tacticId is string => !!tacticId);

  if (recent.length < 4) {
    return neutralPatternEffect();
  }

  // Bonus odpala dopiero przy piatym starcie tym samym ustawieniem: wymagamy 4 poprzednich meczow z rzedu.
  let sameTacticStartStreak = 0;
  for (let idx = recent.length - 1; idx >= 0; idx--) {
    if (recent[idx] !== currentUserTacticId) break;
    sameTacticStartStreak++;
  }

  if (sameTacticStartStreak < 4) {
    return neutralPatternEffect();
  }

  const coachRead = clampNumber(
    ((aiCoachAttributes?.decisionMaking ?? 50) * 0.46 +
      (aiCoachAttributes?.experience ?? 50) * 0.34 +
      (aiCoachAttributes?.motivation ?? 50) * 0.20) / 100,
    0.35,
    0.95
  );
  const reportRead = clampNumber(opponentReport.confidence * (0.62 + reportAlignment * 0.38), 0.28, 0.95);
  const streakPressure = clampNumber(0.54 + (sameTacticStartStreak - 4) * 0.10, 0.54, 0.88);
  const strength = clampNumber(streakPressure * coachRead * reportRead, 0, 0.78);

  return {
    actionMod: clampNumber(strength * 0.024, 0, 0.020),
    goalMod: clampNumber(strength * 0.014, 0, 0.011),
    momentumBonus: Math.round(strength * 10),
    expiryMinute: strength >= 0.48 ? 45 : 30,
    fatigueMult: 1,
    rivalBoost: 0,
    label: 'ROZCZYTANY SCHEMAT GRACZA',
    reactionText: '',
    wasSurprise: false,
  };
};

const getAiRandomTacticGuessBriefingEffect = (
  currentUserTacticId: string,
  seed: number,
  aiCoachAttributes: { motivation?: number; experience?: number; decisionMaking?: number } | undefined
): { guessedTacticId: string; effect: BriefingEffect } => {
  const allTactics = TacticRepository.getAll();
  // Przed meczem AI losuje jedna taktyke gracza; trafienie daje lekki bonus tylko do 40. minuty.
  const guessRoll = seededValue(seed, 412);
  const guessedTacticId = allTactics[Math.floor(guessRoll * allTactics.length)]?.id ?? '4-4-2';
  const neutralEffect: BriefingEffect = {
    actionMod: 0,
    goalMod: 0,
    momentumBonus: 0,
    expiryMinute: 0,
    fatigueMult: 1,
    rivalBoost: 0,
    label: 'NIETRAFIONE PRZEWIDYWANIE TAKTYKI',
    reactionText: '',
    wasSurprise: false,
  };

  if (guessedTacticId !== currentUserTacticId) {
    return { guessedTacticId, effect: neutralEffect };
  }

  const coachRead = clampNumber(
    ((aiCoachAttributes?.decisionMaking ?? 50) * 0.48 +
      (aiCoachAttributes?.experience ?? 50) * 0.34 +
      (aiCoachAttributes?.motivation ?? 50) * 0.18) / 100,
    0.35,
    0.92
  );
  const guessNoise = 0.75 + seededValue(seed, 413) * 0.35;
  const strength = clampNumber(coachRead * guessNoise, 0.22, 0.72);

  return {
    guessedTacticId,
    effect: {
      actionMod: clampNumber(strength * 0.014, 0, 0.010),
      goalMod: clampNumber(strength * 0.008, 0, 0.006),
      momentumBonus: Math.round(strength * 5),
      expiryMinute: 40,
      fatigueMult: 1,
      rivalBoost: 0,
      label: 'TRAFIONE PRZEWIDYWANIE TAKTYKI',
      reactionText: '',
      wasSurprise: false,
    },
  };
};

const getPenaltyCallChance = (referee: Referee) => {
  const decisionQuality = getRefereeDecisionQuality(referee);
  return clampNumber(
    0.78
      + ((referee.strictness - 50) * 0.002)
      - ((referee.advantageTendency - 50) * 0.0012)
      + ((decisionQuality - 50) * 0.0008),
    0.62,
    0.92
  );
};

type PenaltyReviewReason = 'HAND_BALL' | 'FOUL';
type PenaltyReviewPhase = 'INCIDENT' | 'CHECKING' | 'RETURNING' | 'VERDICT';
type PenaltyReviewVerdict = 'PENALTY' | 'NO_PENALTY';

export const MatchLiveView = () => {
  const {
    navigateTo, userTeamId, clubs, fixtures, players,
    lineups, currentDate, setLastMatchSummary, applySimulationResult, viewPlayerDetails,seasonNumber, coaches, staffMembers,
    roundResults, setClubs,
    activeMatchState: matchState, setActiveMatchState: setMatchState,
    pendingMatchKits, pressConferenceEffects
  } = useGame();
  
  const [isTacticsOpen, setIsTacticsOpen] = useState(false);
  const [openTacticalSelect, setOpenTacticalSelect] = useState<string | null>(null);
  const [showBriefing, setShowBriefing] = useState(() => !matchState?.preMatchMotivation);
  const [isCelebratingGoal, setIsCelebratingGoal] = useState(false);
    const [showCommentHistory, setShowCommentHistory] = useState(false);
  const [activePenalty, setActivePenalty] = useState<{
    side: 'HOME' | 'AWAY',
    kicker: Player,
    keeper: Player,
    phase: 'AWARDED' | 'EXECUTING' | 'RESULT',
    result?: MatchEventType
  } | null>(null);
  const [activePenaltyReview, setActivePenaltyReview] = useState<{
    side: 'HOME' | 'AWAY',
    defendingSide: 'HOME' | 'AWAY',
    kicker: Player,
    keeper: Player,
    defender: Player,
    minute: number,
    reason: PenaltyReviewReason,
    phase: PenaltyReviewPhase,
    verdict: PenaltyReviewVerdict,
    usesVar: boolean,
    card?: MatchEventType,
    processed?: boolean
  } | null>(null);

  const [activeVAR, setActiveVAR] = useState<{
    side: 'HOME' | 'AWAY',
    scorerName: string,
    minute: number,
    phase: 'CHECKING' | 'VERDICT',
    verdict?: 'GOAL' | 'NO_GOAL'
  } | null>(null);
  const [activePenaltyNoCall, setActivePenaltyNoCall] = useState<{
    side: 'HOME' | 'AWAY',
    playerName: string,
    minute: number
  } | null>(null);
  const varDataRef = useRef<{ side: 'HOME' | 'AWAY', scorerName: string, minute: number } | null>(null);
  const [isHalftimeTalkOpen, setIsHalftimeTalkOpen] = useState(false);
  const [showPostMatchDebrief, setShowPostMatchDebrief] = useState(false);
  const [pendingFinishPayload, setPendingFinishPayload] = useState<{
    simResultMerged: any;
    matchHistoryArgs: any;
    summary: MatchSummary;
    userTeamId: string;
    debriefContext: DebriefContext;
    sessionSeed: number;
  } | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeTacticalSelect = () => setOpenTacticalSelect(null);
    document.addEventListener('click', closeTacticalSelect);
    return () => document.removeEventListener('click', closeTacticalSelect);
  }, []);

  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const hexToRgba = (hex: string, alpha: number) => {
    try {
      const h = (hex || '#000000').replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return `rgba(15, 23, 42, ${alpha})`;
    }
  };


  const ctx = useMemo(() => {
    const fixture = fixtures.find(f => 
        (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId) &&
        f.date.toDateString() === currentDate.toDateString()
    );
    if (!fixture) return null;
    const home = clubs.find(c => c.id === fixture.homeTeamId)!;
    const away = clubs.find(c => c.id === fixture.awayTeamId)!;
    const hPlayers = players[home.id] || [];
    const aPlayers = players[away.id] || [];
    const homeCoach = home.coachId ? coaches[home.coachId] ?? null : null;
    const awayCoach = away.coachId ? coaches[away.coachId] ?? null : null;
    return {
      fixture, homeClub: home, awayClub: away, homePlayers: hPlayers, awayPlayers: aPlayers, homeCoach, awayCoach, homeAdvantage: true, competition: CompetitionType.LEAGUE
    } as MatchContext;
  }, [userTeamId, clubs, fixtures, players, currentDate, coaches]);

  const kitColors = useMemo(() => {
    if (pendingMatchKits) return pendingMatchKits;
    if (!ctx) return undefined;
    return KitSelectionService.selectOptimalKits(ctx.homeClub, ctx.awayClub);
  }, [ctx, pendingMatchKits]);

  const userSide = useMemo(() => {
    if (!ctx || !userTeamId) return 'HOME';
    return ctx.homeClub.id === userTeamId ? 'HOME' : 'AWAY';
  }, [ctx, userTeamId]);

  const livePressureContext = useMemo(() => {
    if (!ctx) return null;
    const leagueClubs = clubs.filter(c => c.leagueId === ctx.homeClub.leagueId);
    const sortedStandings = [...leagueClubs].sort((a, b) =>
      b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference || b.stats.goalsFor - a.stats.goalsFor
    );
    const homeCoach = ctx.homeClub.coachId ? coaches[ctx.homeClub.coachId] : null;
    const awayCoach = ctx.awayClub.coachId ? coaches[ctx.awayClub.coachId] : null;
    return buildMatchPressureContext(ctx.fixture, ctx.homeClub, ctx.awayClub, sortedStandings, homeCoach, awayCoach);
  }, [ctx, clubs, coaches]);

  const userPressureProfile = useMemo(
    () => getPressureProfileForSide(livePressureContext, userSide),
    [livePressureContext, userSide]
  );

  const aiPressureProfile = useMemo(
    () => getPressureProfileForSide(livePressureContext, userSide === 'HOME' ? 'AWAY' : 'HOME'),
    [livePressureContext, userSide]
  );

  const leagueMotivationContext = useMemo(() => {
    if (!ctx || !userTeamId || typeof ctx.fixture.leagueId !== 'string') return null;
    const userClub = userSide === 'HOME' ? ctx.homeClub : ctx.awayClub;
    const opponentClub = userSide === 'HOME' ? ctx.awayClub : ctx.homeClub;
    const standings = clubs.filter(club => club.leagueId === ctx.fixture.leagueId);
    return detectLeagueMotivationContext({
      fixture: ctx.fixture,
      userClub,
      opponentClub,
      standings,
      fixtures,
    });
  }, [ctx, userTeamId, userSide, clubs, fixtures]);

  const rivalryContext = useMemo(
    () => ctx ? RivalryService.getMatchContext(ctx.homeClub, ctx.awayClub) : null,
    [ctx]
  );

  const teamFormImpact = useMemo(() => {
    if (!ctx) {
      return {
        home: NEUTRAL_CLUB_FORM_IMPACT,
        away: NEUTRAL_CLUB_FORM_IMPACT,
      };
    }

    const matchDateStr = ctx.fixture.date instanceof Date ? ctx.fixture.date.toISOString().split('T')[0] : String(ctx.fixture.date);
    const matchSeed = new Date(matchDateStr).getTime() / 100000;
    const homePrepMultiplier = ctx.homeClub.id === userTeamId
      ? getWinterFriendlyPrepMultiplier(ctx.homeClub.id, ctx.fixture.date, fixtures)
      : 1;
    const awayPrepMultiplier = ctx.awayClub.id === userTeamId
      ? getWinterFriendlyPrepMultiplier(ctx.awayClub.id, ctx.fixture.date, fixtures)
      : 1;
    return {
      home: applyFocusToFormImpact(analyzeClubFormImpact(ctx.homeClub.stats.form, ctx.homeCoach), ctx.homeClub, matchDateStr, matchSeed, ctx.homeClub.id === userTeamId, homePrepMultiplier),
      away: applyFocusToFormImpact(analyzeClubFormImpact(ctx.awayClub.stats.form, ctx.awayCoach), ctx.awayClub, matchDateStr, matchSeed + 1, ctx.awayClub.id === userTeamId, awayPrepMultiplier),
    };
  }, [ctx, userTeamId, fixtures]);

  const handleBriefingClose = (effect: BriefingEffect) => {
    const conferenceEffect = ctx && userTeamId
      ? PreMatchPressConferenceService.getTeamMatchEffect(pressConferenceEffects[ctx.fixture.id], userTeamId)
      : null;
    const combinedEffect = PreMatchPressConferenceService.combineWithBriefing(conferenceEffect, effect);
    const rivalryEffect = rivalryContext ? RivalryService.amplifyBriefingEffect(combinedEffect, rivalryContext) : combinedEffect;
    const pressureEffect = adjustBriefingEffectForPressure(rivalryEffect, userPressureProfile);
    setShowBriefing(false);
    setMatchState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        preMatchMotivation: {
          actionMod:     pressureEffect.actionMod,
          goalMod:       pressureEffect.goalMod,
          momentumBonus: pressureEffect.momentumBonus,
          expiryMinute:  pressureEffect.expiryMinute,
          fatigueMult:   pressureEffect.fatigueMult,
          rivalBoost:    pressureEffect.rivalBoost,
          label:         pressureEffect.label,
        },
      };
    });
  };

const isPausedForSevereInjury = useMemo(() => {
    if (!matchState || !matchState.isPaused) return false;
    const allInjuries = { ...matchState.homeInjuries, ...matchState.awayInjuries };
    const onPitchIds = [...matchState.homeLineup.startingXI, ...matchState.awayLineup.startingXI];
    return onPitchIds.some(id => id && allInjuries[id] === 'SEVERE');
  }, [matchState]);


  const env = useMemo(() => {
    if (!ctx) return null;
    const seedStr = `${ctx.fixture.id}_ENV`;
    const ref = RefereeService.assignPolishReferee(seedStr, 3);
    const weather = PolandWeatherService.getWeather(ctx.fixture.date, seedStr);
    return { ref, weather };
  }, [ctx]);

  const seededRng = (seed: number, minute: number, offset: number = 0) => {
    let s = seed + minute + offset;
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const buildDisplayStats = (
    rawStats: { shots: number; shotsOnTarget: number; corners: number; fouls: number; offsides: number },
    goals: number,
    yellowCards: number,
    redCards: number,
    possession: number,
    seed: number,
    sideOffset: number
  ) => {
    const statRng = (offset: number) => seededRng(seed, 45, sideOffset + offset);
    const possessionMod = possession >= 58 ? 2 : possession >= 52 ? 1 : possession <= 42 ? -1 : 0;
    const cornerChaos = Math.min(3, Math.floor(rawStats.corners * 0.35));
    const openPlayFloor = 5 + Math.floor(statRng(1) * 4) + possessionMod + cornerChaos;
    const goalFloor = goals > 0
      ? goals * (2 + Math.floor(statRng(2) * 2)) + Math.floor(statRng(3) * 2)
      : 0;
    const shotFloor = Math.max(0, Math.min(16, Math.max(openPlayFloor, goalFloor)));
    const shots = Math.max(0, rawStats.shots, rawStats.shotsOnTarget, goals, shotFloor);
    const onTargetFloor = goals > 0 ? Math.max(goals, Math.floor(shots * (0.30 + statRng(4) * 0.12))) : 0;
    const shotsOnTarget = Math.min(shots, Math.max(0, rawStats.shotsOnTarget, goals, onTargetFloor));
    const corners = Math.max(0, rawStats.corners);
    const fouls = Math.max(0, rawStats.fouls);

    return {
      ...rawStats,
      shots,
      shotsOnTarget,
      corners,
      fouls,
      yellowCards,
      redCards,
      possession,
    };
  };

  const hasMandatorySub = useMemo(() => {
    if (!matchState) return false;
    const userSubsUsed = userSide === 'HOME' ? matchState.subsCountHome : matchState.subsCountAway;
    if (userSubsUsed >= 5) return false;
    const userLineup = userSide === 'HOME' ? matchState.homeLineup : matchState.awayLineup;
    const userInjuries = userSide === 'HOME' ? matchState.homeInjuries : matchState.awayInjuries;
    return userLineup.startingXI.some(id => id && userInjuries[id] === InjurySeverity.SEVERE);
  }, [matchState, userSide]);

  useEffect(() => {
   if (ctx && (!matchState || matchState.fixtureId !== ctx.fixture.id)) {
      const sessionSeed = Math.abs(Math.floor(Date.now() * Math.random()));

      const aiClubInit = ctx.homeClub.id === userTeamId ? ctx.awayClub : ctx.homeClub;
      const aiInitialSide: 'HOME' | 'AWAY' = aiClubInit.id === ctx.homeClub.id ? 'HOME' : 'AWAY';
      const aiCoachInit = aiClubInit?.coachId ? coaches[aiClubInit.coachId] : null;
      const userClubInit = ctx.homeClub.id === userTeamId ? ctx.homeClub : ctx.awayClub;
      const userPlayersInit = ctx.homeClub.id === userTeamId ? ctx.homePlayers : ctx.awayPlayers;
      const aiPlayersInit = ctx.homeClub.id === userTeamId ? ctx.awayPlayers : ctx.homePlayers;
      const userLineupInit = lineups[userClubInit.id];
      const userTacticIdInit = userLineupInit?.tacticId ?? '4-4-2';
      const aiLineupBase = LineupService.autoPickLineup(aiClubInit.id, aiPlayersInit, '4-4-2', aiCoachInit, {
        formAware: true,
        selectionSeed: `${ctx.fixture.id}_${aiClubInit.id}_live_ai`
      });
      const opponentReport = userLineupInit
        ? AiOpponentAnalysisService.generateReport({
            aiClub: aiClubInit,
            aiCoach: aiCoachInit,
            aiStaffMembers: staffMembers,
            opponentClub: userClubInit,
            opponentPlayers: userPlayersInit,
            opponentLineup: userLineupInit,
            seed: sessionSeed,
          })
        : undefined;
      const aiPreparedTacticId = opponentReport
        ? AiOpponentAnalysisService.recommendStartingTactic(aiLineupBase.tacticId, opponentReport, aiClubInit, userClubInit, aiPlayersInit, aiClubInit.id !== ctx.homeClub.id, aiCoachInit)
        : aiLineupBase.tacticId;
      const aiLineupPrepared = aiPreparedTacticId !== aiLineupBase.tacticId
        ? LineupService.autoPickLineup(aiClubInit.id, aiPlayersInit, aiPreparedTacticId, aiCoachInit, {
            formAware: true,
            selectionSeed: `${ctx.fixture.id}_${aiClubInit.id}_${aiPreparedTacticId}_live_ai`
          })
        : aiLineupBase;
      const homeLineupInit = aiClubInit.id === ctx.homeClub.id
        ? aiLineupPrepared
        : (lineups[ctx.homeClub.id] ?? LineupService.autoPickLineup(ctx.homeClub.id, ctx.homePlayers));
      const awayLineupInit = aiClubInit.id === ctx.awayClub.id
        ? aiLineupPrepared
        : (lineups[ctx.awayClub.id] ?? LineupService.autoPickLineup(ctx.awayClub.id, ctx.awayPlayers));
      const preMatchInstr = AiCoachTacticsService.decidePreMatchInstructions(
        aiClubInit, aiCoachInit, aiPlayersInit, userClubInit, userPlayersInit, userTacticIdInit, sessionSeed, opponentReport
      );
      const aiConferenceEffect = PreMatchPressConferenceService.getTeamMatchEffect(pressConferenceEffects[ctx.fixture.id], aiClubInit.id);
      const aiCoachBriefingEffect = calculateAiCoachBriefingEffect(
          aiClubInit.reputation,
          userClubInit.reputation,
          aiCoachInit?.attributes,
          sessionSeed + 17,
          'LEAGUE',
          leagueMotivationContext
        );
      const aiMediaStakesEffect = getAiMediaStakesBriefingEffect(
        aiInitialSide,
        livePressureContext,
        aiCoachInit?.attributes,
        aiClubInit.stats.form ?? [],
        livePressureContext?.rivalryMultiplier ?? 1
      );
      const aiUserPatternEffect = getAiUserPatternBriefingEffect(
        userClubInit.id,
        userTacticIdInit,
        aiCoachInit?.attributes,
        opponentReport
      );
      // Osobny scouting AI: losowa proba przewidzenia startowej taktyki gracza przed pierwszym gwizdkiem.
      const aiTacticGuess = getAiRandomTacticGuessBriefingEffect(
        userTacticIdInit,
        sessionSeed,
        aiCoachInit?.attributes
      );
      const aiBriefingWithMedia = aiMediaStakesEffect.expiryMinute > 0
        ? PreMatchPressConferenceService.combineWithBriefing(aiMediaStakesEffect, aiCoachBriefingEffect)
        : aiCoachBriefingEffect;
      const aiBriefingWithPattern = aiUserPatternEffect.expiryMinute > 0
        ? PreMatchPressConferenceService.combineWithBriefing(aiUserPatternEffect, aiBriefingWithMedia)
        : aiBriefingWithMedia;
      // Trafione przewidywanie doklejamy do briefingu AI jako krotki, wczesnomeczowy bonus.
      const aiBriefingWithGuess = aiTacticGuess.effect.expiryMinute > 0
        ? PreMatchPressConferenceService.combineWithBriefing(aiTacticGuess.effect, aiBriefingWithPattern)
        : aiBriefingWithPattern;
      const aiBaseBriefingEffect = PreMatchPressConferenceService.combineWithBriefing(aiConferenceEffect, aiBriefingWithGuess);
      const aiRivalryBriefingEffect = rivalryContext ? RivalryService.amplifyBriefingEffect(aiBaseBriefingEffect, rivalryContext) : aiBaseBriefingEffect;
      const aiBriefingEffect = adjustBriefingEffectForPressure(
        aiRivalryBriefingEffect,
        aiPressureProfile
      );
      const aiInitNextMin = 10 + Math.floor(seededRng(sessionSeed, 0, 77) * 11);

      setMatchState({
        fixtureId: ctx.fixture.id, minute: 0, period: 1, addedTime: 0, isPaused: true,
        isPausedForEvent: false, isHalfTime: false, isFinished: false, speed: 1, momentum: 0, momentumPulse: 0,
        homeScore: 0, awayScore: 0, homeLineup: homeLineupInit, awayLineup: awayLineupInit,
        // Zapamietujemy taktyke startowa oddzielnie od aktualnej, bo gracz moze zmienic ustawienie w trakcie meczu.
        initialHomeTacticId: homeLineupInit.tacticId,
        initialAwayTacticId: awayLineupInit.tacticId,
        aiTacticGuessId: aiTacticGuess.guessedTacticId,
        // TUTAJ WSTAW TEN KOD
        homeFatigue: ctx.homePlayers.reduce((acc, p) => ({ ...acc, [p.id]: p.condition }), {}),
        awayFatigue: ctx.awayPlayers.reduce((acc, p) => ({ ...acc, [p.id]: p.condition }), {}),
        // KONIEC
        homeInjuries: {}, awayInjuries: {}, playerYellowCards: {},
        sentOffIds: [], homeRiskMode: {}, awayRiskMode: {}, homeUpgradeProb: {}, awayUpgradeProb: {}, lightInjuryPrompt: null,
        homeInjuryMin: {}, awayInjuryMin: {}, subsCountHome: 0, subsCountAway: 0,
        homeSubsHistory: [], awaySubsHistory: [], lastAiActionMinute: 0, lastAiSubMinute: 0, lastAiFormationMinute: 0, aiTacticLocked: false, aiTacticLockUntilMinute: 0, aiLateTacticChanges: 0,
        logs: [{ id: 'init', minute: 0, text: "Oczekiwanie na pierwszy gwizdek...", type: MatchEventType.GENERIC }],
        liveStats: {
    home: { shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, offsides: 0 },
    away: { shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, offsides: 0 }
  },
  actionContributions: {},
  momentumSum: 0,
  momentumTicks: 0,
events: [], homeGoals: [], awayGoals: [], flashMessage: null,
        sessionSeed,
      ////// DO ZAIMPLEMENTOWANIA PRZYCISKI TEMPO NASTAWIENIE I INTESNYWNOSC ...
        tacticalImpact: 1.0,
        halftimeTalkApplied: false,
        halftimeMomentumBonus: 0,
       userInstructions: {
          tempo: 'NORMAL',
          mindset: 'NEUTRAL',
          intensity: 'NORMAL',
          passing: 'MIXED',
          pressing: 'NORMAL',
          counterAttack: 'NORMAL',
          expiryMinute: -1,
          tempoExpiry: -1,
          mindsetExpiry: -1,
          intensityExpiry: -1,
          tempoCooldown: -1,
          mindsetCooldown: -1,
          intensityCooldown: -1,
          passingCooldown: -1,
          pressingCooldown: -1,
          counterAttackCooldown: -1,
          tempoResponseFactor: 1.0,
          mindsetResponseFactor: 1.0,
          intensityResponseFactor: 1.0,
          passingResponseFactor: 1.0,
          pressingResponseFactor: 1.0,
          counterAttackResponseFactor: 1.0,
          lastChangeMinute: -5,},
          playedPlayerIds: [],
        aiActiveShout: preMatchInstr ? { id: 'pre_match', ...preMatchInstr, expiryMinute: 999 } : null,
        // AI Exploit Window state:
        // Stores the minute until which the AI is allowed to keep an exploit instruction
        // active after identifying a player mistake. Initial value -1 means no active window.
        // See AiCoachTacticsService.decideInMatchInstructions for scoring and calibration.
        aiExploitUntilMinute: -1,
        aiPreMatchMotivation: {
          actionMod:     aiBriefingEffect.actionMod,
          goalMod:       aiBriefingEffect.goalMod,
          momentumBonus: aiBriefingEffect.momentumBonus,
          expiryMinute:  aiBriefingEffect.expiryMinute,
          fatigueMult:   aiBriefingEffect.fatigueMult,
          rivalBoost:    aiBriefingEffect.rivalBoost,
          label:         aiBriefingEffect.label,
        },
        aiNextInstructionMinute: aiInitNextMin,
        lastGoalBoostMinute: -1,
        activeTacticalBoost: 0,
        tacticalBoostExpiry: -1
        
        
     });
    }
  }, [ctx, lineups, matchState, setMatchState, userTeamId, coaches, staffMembers, aiPressureProfile, pressConferenceEffects, rivalryContext, leagueMotivationContext, livePressureContext]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [matchState?.logs]);

  useEffect(() => {
    if (matchState?.isHalfTime && !matchState.halftimeTalkApplied && !isHalftimeTalkOpen) {
      setIsHalftimeTalkOpen(true);
    }
  }, [matchState?.isHalfTime, matchState?.halftimeTalkApplied]);

  const handleOpenPlayerCard = (pId: string) => {
    setMatchState(prev => prev ? { ...prev, isPaused: true } : prev);
    viewPlayerDetails(pId);
  };

  const getActionLabel = () => {
    if (!matchState) return "";
    if (hasMandatorySub) return "WYMAGANA ZMIANA";
    if (matchState.isHalfTime) return "II POŁOWA";
    return matchState.isPaused ? "START" : "PAUZA";
  };

  useEffect(() => {
    if (!activePenaltyReview || !matchState || !ctx) return;

    if (activePenaltyReview.phase === 'INCIDENT') {
      const t = setTimeout(() => {
        setActivePenaltyReview(prev => prev ? { ...prev, phase: prev.usesVar ? 'CHECKING' : 'VERDICT' } : null);
      }, 2200);
      return () => clearTimeout(t);
    }

    if (activePenaltyReview.phase === 'CHECKING') {
      const t = setTimeout(() => {
        setActivePenaltyReview(prev => prev ? { ...prev, phase: 'RETURNING' } : null);
      }, 3300);
      return () => clearTimeout(t);
    }

    if (activePenaltyReview.phase === 'RETURNING') {
      const t = setTimeout(() => {
        setActivePenaltyReview(prev => prev ? { ...prev, phase: 'VERDICT' } : null);
      }, 1800);
      return () => clearTimeout(t);
    }

    if (activePenaltyReview.phase === 'VERDICT' && !activePenaltyReview.processed) {
      setMatchState(prev => {
        if (!prev) return prev;

        const reasonText = activePenaltyReview.reason === 'HAND_BALL' ? 'zagranie ręką' : `faul na ${activePenaltyReview.kicker.lastName}`;
        const verdictLog: MatchLogEntry = activePenaltyReview.verdict === 'PENALTY'
          ? {
              id: `PEN_REVIEW_OK_${activePenaltyReview.minute}`,
              minute: activePenaltyReview.minute,
              text: `${activePenaltyReview.usesVar ? '📺 VAR: ' : '👉 '}${reasonText}. RZUT KARNY dla ${activePenaltyReview.side === 'HOME' ? ctx.homeClub.shortName : ctx.awayClub.shortName}!`,
              type: MatchEventType.PENALTY_AWARDED,
              teamSide: activePenaltyReview.side,
              playerName: activePenaltyReview.kicker.lastName
            }
          : {
              id: `PEN_REVIEW_NO_${activePenaltyReview.minute}`,
              minute: activePenaltyReview.minute,
              text: `🚫 VAR: Nie ma karnego. ${activePenaltyReview.reason === 'HAND_BALL' ? 'Ręki' : 'Faulu'} nie było!`,
              type: MatchEventType.GENERIC,
              teamSide: activePenaltyReview.side,
              playerName: activePenaltyReview.kicker.lastName
            };

        if (activePenaltyReview.verdict !== 'PENALTY' || !activePenaltyReview.card || activePenaltyReview.card === MatchEventType.FOUL) {
          return { ...prev, logs: [verdictLog, ...prev.logs] };
        }

        const defenderId = activePenaltyReview.defender.id;
        const nextPlayerYellowCards = { ...prev.playerYellowCards };
        const nextSentOffIds = [...prev.sentOffIds];
        let nextHomeLineup = prev.homeLineup;
        let nextAwayLineup = prev.awayLineup;
        let cardLog: MatchLogEntry | null = null;

        if (activePenaltyReview.card === MatchEventType.YELLOW_CARD) {
          nextPlayerYellowCards[defenderId] = (nextPlayerYellowCards[defenderId] || 0) + 1;
          if (nextPlayerYellowCards[defenderId] >= 2 && !nextSentOffIds.includes(defenderId)) {
            nextSentOffIds.push(defenderId);
            nextHomeLineup = activePenaltyReview.defendingSide === 'HOME'
              ? { ...prev.homeLineup, startingXI: prev.homeLineup.startingXI.map(id => id === defenderId ? null : id) }
              : prev.homeLineup;
            nextAwayLineup = activePenaltyReview.defendingSide === 'AWAY'
              ? { ...prev.awayLineup, startingXI: prev.awayLineup.startingXI.map(id => id === defenderId ? null : id) }
              : prev.awayLineup;
            cardLog = {
              id: `PEN_REVIEW_SECOND_YELLOW_${activePenaltyReview.minute}`,
              minute: activePenaltyReview.minute,
              text: `🟥 DRUGA ŻÓŁTA! ${activePenaltyReview.defender.lastName} wylatuje z boiska po interwencji w polu karnym!`,
              type: MatchEventType.RED_CARD,
              teamSide: activePenaltyReview.defendingSide,
              playerId: defenderId,
              playerName: activePenaltyReview.defender.lastName
            };
          } else {
            cardLog = {
              id: `PEN_REVIEW_YELLOW_${activePenaltyReview.minute}`,
              minute: activePenaltyReview.minute,
              text: `🟨 Żółta kartka: ${activePenaltyReview.defender.lastName} za interwencję w polu karnym.`,
              type: MatchEventType.YELLOW_CARD,
              teamSide: activePenaltyReview.defendingSide,
              playerId: defenderId,
              playerName: activePenaltyReview.defender.lastName
            };
          }
        } else if (activePenaltyReview.card === MatchEventType.RED_CARD && !nextSentOffIds.includes(defenderId)) {
          nextSentOffIds.push(defenderId);
          nextHomeLineup = activePenaltyReview.defendingSide === 'HOME'
            ? { ...prev.homeLineup, startingXI: prev.homeLineup.startingXI.map(id => id === defenderId ? null : id) }
            : prev.homeLineup;
          nextAwayLineup = activePenaltyReview.defendingSide === 'AWAY'
            ? { ...prev.awayLineup, startingXI: prev.awayLineup.startingXI.map(id => id === defenderId ? null : id) }
            : prev.awayLineup;
          cardLog = {
            id: `PEN_REVIEW_RED_${activePenaltyReview.minute}`,
            minute: activePenaltyReview.minute,
            text: `🟥 CZERWONA KARTKA! ${activePenaltyReview.defender.lastName} za faul w polu karnym!`,
            type: MatchEventType.RED_CARD,
            teamSide: activePenaltyReview.defendingSide,
            playerId: defenderId,
            playerName: activePenaltyReview.defender.lastName
          };
        }

        return {
          ...prev,
          homeLineup: nextHomeLineup,
          awayLineup: nextAwayLineup,
          playerYellowCards: nextPlayerYellowCards,
          sentOffIds: nextSentOffIds,
          logs: cardLog ? [cardLog, verdictLog, ...prev.logs] : [verdictLog, ...prev.logs]
        };
      });
      setActivePenaltyReview(prev => prev ? { ...prev, processed: true } : null);
      return;
    }

    if (activePenaltyReview.phase === 'VERDICT' && activePenaltyReview.processed) {
      const t = setTimeout(() => {
        if (activePenaltyReview.verdict === 'PENALTY') {
          setActivePenalty({
            side: activePenaltyReview.side,
            kicker: activePenaltyReview.kicker,
            keeper: activePenaltyReview.keeper,
            phase: 'AWARDED'
          });
        } else {
          setMatchState(prev => prev ? { ...prev, isPaused: false, isPausedForEvent: false } : null);
        }
        setActivePenaltyReview(null);
      }, 2300);
      return () => clearTimeout(t);
    }
  }, [activePenaltyReview, matchState, ctx, setMatchState]);

  useEffect(() => {
    if (!activePenalty || !matchState || !ctx) return;

    if (activePenalty.phase === 'AWARDED') {
      const t = setTimeout(() => {
        setActivePenalty(prev => prev ? { ...prev, phase: 'EXECUTING' } : null);
      }, 2000);
      return () => clearTimeout(t);
    } 
    else if (activePenalty.phase === 'EXECUTING') {
      const t = setTimeout(() => {
        const penaltyKickerFormMod = clampNumber(0.92 + (TeamFormImpactService.getPlayerForm(activePenalty.kicker) / 100) * 0.16, 0.92, 1.08);
        const penaltyKeeperFormMod = clampNumber(0.93 + (TeamFormImpactService.getPlayerForm(activePenalty.keeper) / 100) * 0.14, 0.93, 1.07);
        const isGoal = GoalAttributionService.checkShotSuccess(
          activePenalty.kicker,
          activePenalty.keeper,
          [],
          false,
          () => Math.random(),
          true,
          100,
          100,
          penaltyKickerFormMod,
          penaltyKeeperFormMod
        );
        const finalResult = isGoal ? MatchEventType.PENALTY_SCORED : MatchEventType.PENALTY_MISSED;
        
        setActivePenalty(prev => prev ? { ...prev, phase: 'RESULT', result: finalResult } : null);

        setMatchState(prev => {
          if (!prev) return prev;
          let nextHomeScore = prev.homeScore;
          let nextAwayScore = prev.awayScore;
          const newHomeGoals = [...prev.homeGoals];
          const newAwayGoals = [...prev.awayGoals];
          
          if (isGoal) {
            if (activePenalty.side === 'HOME') {
              nextHomeScore++;
              newHomeGoals.push({ playerName: activePenalty.kicker.lastName, scorerId: activePenalty.kicker.id, minute: prev.minute, isPenalty: true });
            } else {
              nextAwayScore++;
              newAwayGoals.push({ playerName: activePenalty.kicker.lastName, scorerId: activePenalty.kicker.id, minute: prev.minute, isPenalty: true });
            }
          } else {
            if (activePenalty.side === 'HOME') {
              newHomeGoals.push({ playerName: activePenalty.kicker.lastName, scorerId: activePenalty.kicker.id, minute: prev.minute, isPenalty: true, isMiss: true });
            } else {
              newAwayGoals.push({ playerName: activePenalty.kicker.lastName, scorerId: activePenalty.kicker.id, minute: prev.minute, isPenalty: true, isMiss: true });
            }
          }

          const pool = MATCH_COMMENTARY_DB[finalResult] || ["Karny..."];
          const comment = pool[Math.floor(Math.random() * pool.length)].replace("{Nazwisko}", activePenalty.kicker.lastName);

          const newLog: MatchLogEntry = {
            id: `PEN_RES_${prev.minute}_${Math.random()}`,
            minute: prev.minute,
            text: isGoal ? `⚽ ${comment}` : `❌ ${comment}`,
            type: finalResult,
            teamSide: activePenalty.side,
            playerId: activePenalty.kicker.id,
            secondaryPlayerId: activePenalty.keeper.id,
            playerName: activePenalty.kicker.lastName
          };

          return {
            ...prev,
            homeScore: nextHomeScore,
            awayScore: nextAwayScore,
            homeGoals: newHomeGoals,
            awayGoals: newAwayGoals,
            logs: [newLog, ...prev.logs],
            momentum: MomentumService.computeMomentum(ctx, prev, finalResult, activePenalty.side, prev.homeFatigue, prev.awayFatigue, env?.weather),
            liveStats: {
              ...prev.liveStats,
              home: activePenalty.side === 'HOME' ? {
                ...prev.liveStats.home,
                shots: prev.liveStats.home.shots + 1,
                shotsOnTarget: isGoal ? prev.liveStats.home.shotsOnTarget + 1 : prev.liveStats.home.shotsOnTarget
              } : prev.liveStats.home,
              away: activePenalty.side === 'AWAY' ? {
                ...prev.liveStats.away,
                shots: prev.liveStats.away.shots + 1,
                shotsOnTarget: isGoal ? prev.liveStats.away.shotsOnTarget + 1 : prev.liveStats.away.shotsOnTarget
              } : prev.liveStats.away
            }
          };
        });

        if (isGoal) {
          setIsCelebratingGoal(true);
          setTimeout(() => setIsCelebratingGoal(false), 3000);
        }
      }, 2500);
      return () => clearTimeout(t);
    }
    else if (activePenalty.phase === 'RESULT') {
      const t = setTimeout(() => {
        setActivePenalty(null);
        setMatchState(prev => prev ? { ...prev, isPaused: false, isPausedForEvent: false } : null);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [activePenalty?.phase, matchState, ctx, setMatchState]);

  useEffect(() => {
    if (!activePenaltyNoCall) return;
    const t = setTimeout(() => {
      setActivePenaltyNoCall(null);
      setMatchState(prev => prev ? { ...prev, isPaused: false, isPausedForEvent: false } : null);
    }, 2500);
    return () => clearTimeout(t);
  }, [activePenaltyNoCall, setMatchState]);

  useEffect(() => {
    if (!activeVAR) return;
    if (activeVAR.phase === 'CHECKING') {
      const timer = setTimeout(() => {
        const verdict: 'GOAL' | 'NO_GOAL' = Math.floor(Math.random() * 2) === 0 ? 'NO_GOAL' : 'GOAL';
        setActiveVAR(prev => prev ? { ...prev, phase: 'VERDICT', verdict } : null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (activeVAR.phase === 'VERDICT' && activeVAR.verdict) {
      const isVarHome = activeVAR.side === 'HOME';
      setMatchState(prev => {
        if (!prev) return prev;
        const varLog: MatchLogEntry = activeVAR.verdict === 'NO_GOAL'
          ? { id: `VAR_DISALLOWED_${activeVAR.minute}`, minute: activeVAR.minute, text: `🚫 VAR: Bramka ${activeVAR.scorerName} NIEUZNANA! SPALONY!`, type: MatchEventType.GENERIC, teamSide: activeVAR.side }
          : { id: `VAR_CONFIRMED_${activeVAR.minute}`, minute: activeVAR.minute, text: `✅ VAR: Bramka ${activeVAR.scorerName} ZATWIERDZONA! Gol uznany.`, type: MatchEventType.GENERIC, teamSide: activeVAR.side };
        if (activeVAR.verdict === 'NO_GOAL') {
          let didDisallowGoal = false;
          const markDisallowedGoal = (goal: typeof prev.homeGoals[number]) => {
            if (!didDisallowGoal && goal.playerName === activeVAR.scorerName && goal.minute === activeVAR.minute && !goal.varDisallowed) {
              didDisallowGoal = true;
              return { ...goal, varDisallowed: true };
            }
            return goal;
          };
          const newHomeGoals = isVarHome
            ? prev.homeGoals.map(markDisallowedGoal)
            : prev.homeGoals;
          const newAwayGoals = !isVarHome
            ? prev.awayGoals.map(markDisallowedGoal)
            : prev.awayGoals;
          return {
            ...prev,
            homeScore: isVarHome && didDisallowGoal ? Math.max(0, prev.homeScore - 1) : prev.homeScore,
            awayScore: !isVarHome && didDisallowGoal ? Math.max(0, prev.awayScore - 1) : prev.awayScore,
            homeGoals: newHomeGoals,
            awayGoals: newAwayGoals,
            logs: [varLog, ...prev.logs]
          };
        }
        return { ...prev, logs: [varLog, ...prev.logs] };
      });
      const closeTimer = setTimeout(() => {
        setActiveVAR(null);
        setMatchState(prev => prev ? { ...prev, isPaused: false, isPausedForEvent: false } : null);
      }, 3000);
      return () => clearTimeout(closeTimer);
    }
  }, [activeVAR?.phase, activeVAR?.verdict, setMatchState]);

  const handleTacticsClose = (newLineup: Lineup, subsCount: number, subsHistory: SubstitutionRecord[], captainId: string | null, penaltyTakerId: string | null, freeKickTakerId: string | null) => {
    setMatchState(prev => {
      if (!prev) return prev;
      const isHome = userSide === 'HOME';
      return {
        ...prev,
        isPaused: true,
        homeLineup: isHome ? newLineup : prev.homeLineup,
        awayLineup: !isHome ? newLineup : prev.awayLineup,
        subsCountHome: isHome ? subsCount : prev.subsCountHome,
        subsCountAway: !isHome ? subsCount : prev.subsCountAway,
        homeSubsHistory: isHome ? subsHistory : prev.homeSubsHistory,
        awaySubsHistory: !isHome ? subsHistory : prev.awaySubsHistory
      };
    });
    if (userTeamId) {
      setClubs(prev => prev.map(c => c.id !== userTeamId ? c : { ...c, captainId, penaltyTakerId, freeKickTakerId }));
    }
    setIsTacticsOpen(false);
  };

  const handleHalftimeTalk = (effect: TalkEffect) => {
    setMatchState(prev => {
      if (!prev) return prev;
      const isHome = userSide === 'HOME';
      const userScore = isHome ? prev.homeScore : prev.awayScore;
      const oppScore = isHome ? prev.awayScore : prev.homeScore;
      const pressureEffect = adjustTalkEffectForPressure(effect, userPressureProfile, userScore - oppScore);
      const userFatigueMap = isHome ? prev.homeFatigue : prev.awayFatigue;
      const userXI = isHome ? prev.homeLineup.startingXI : prev.awayLineup.startingXI;
      const nextFatigue = { ...userFatigueMap };
      if (pressureEffect.fatigueRegenBonus !== 0) {
        userXI.forEach(pId => {
          if (pId) nextFatigue[pId] = Math.min(100, (nextFatigue[pId] || 100) + pressureEffect.fatigueRegenBonus);
        });
      }
      const oppClub = isHome ? ctx?.awayClub : ctx?.homeClub;
      const oppCoach = oppClub?.coachId ? coaches[oppClub.coachId] : null;
      const oppContext = getScoreContext(oppScore, userScore);
      const baseOppCoachDelta = oppCoach
        ? calculateOpponentCoachTalkEffect(
            oppCoach.attributes.decisionMaking,
            oppCoach.attributes.experience,
            oppContext,
            prev.sessionSeed
          )
        : 0;
      const oppCoachDelta = Math.round(baseOppCoachDelta * getAiHalftimePressureMultiplier(aiPressureProfile, oppCoach) * 10) / 10;
      const oppMomentumDelta = isHome ? -oppCoachDelta : oppCoachDelta;
      // Odprawa AI w przerwie lustrzanie daje zmeczenie i mnozniki reakcji, zeby rozmowa gracza nie byla jednostronna przewaga.
      const oppCoachQuality = ((oppCoach?.attributes.decisionMaking ?? 50) + (oppCoach?.attributes.experience ?? 50)) / 2;
      const oppTalkDirection = Math.sign(oppCoachDelta);
      const oppFatigueRegenBonus = Math.round(clampNumber(
        oppCoachDelta >= 0
          ? 0.4 + (oppCoachDelta / 23) * (1.8 + oppCoachQuality / 100)
          : oppCoachDelta / 12,
        -2.0,
        3.2
      ) * 10) / 10;
      const oppResponseSwing = clampNumber((Math.abs(oppCoachDelta) / 24) * (0.45 + oppCoachQuality / 180), 0, 0.28);
      const oppTempoResponseFactor = Number(clampNumber(1 + oppTalkDirection * oppResponseSwing * 0.85, 0.78, 1.25).toFixed(2));
      const oppMindsetResponseFactor = Number(clampNumber(1 + oppTalkDirection * oppResponseSwing, 0.78, 1.25).toFixed(2));
      const oppIntensityResponseFactor = Number(clampNumber(1 + oppTalkDirection * oppResponseSwing * 0.90, 0.78, 1.25).toFixed(2));
      const oppFatigueMap = isHome ? prev.awayFatigue : prev.homeFatigue;
      const oppXI = isHome ? prev.awayLineup.startingXI : prev.homeLineup.startingXI;
      const nextOppFatigue = { ...oppFatigueMap };
      if (oppFatigueRegenBonus !== 0) {
        oppXI.forEach(pId => {
          if (pId) nextOppFatigue[pId] = Math.min(100, Math.max(0, (nextOppFatigue[pId] || 100) + oppFatigueRegenBonus));
        });
      }
      return {
        ...prev,
        homeFatigue: isHome ? nextFatigue : prev.homeFatigue,
        awayFatigue: !isHome ? nextFatigue : prev.awayFatigue,
        ...(isHome ? { awayFatigue: nextOppFatigue } : { homeFatigue: nextOppFatigue }),
        halftimeTalkApplied: true,
        halftimeMomentumBonus: pressureEffect.momentumDelta,
        oppHalftimeMomentumBonus: oppMomentumDelta,
        aiActiveShout: prev.aiActiveShout
          ? {
              ...prev.aiActiveShout,
              tempoResponseFactor: oppTempoResponseFactor,
              mindsetResponseFactor: oppMindsetResponseFactor,
              intensityResponseFactor: oppIntensityResponseFactor,
            }
          : prev.aiActiveShout,
        userInstructions: {
          ...prev.userInstructions,
          tempoResponseFactor:     pressureEffect.tempoResponseFactor,
          mindsetResponseFactor:   pressureEffect.mindsetResponseFactor,
          intensityResponseFactor: pressureEffect.intensityResponseFactor,
        },
      };
    });
    setIsHalftimeTalkOpen(false);
  };

  const handleDebriefClose = (effect: DebriefEffect) => {
    if (!pendingFinishPayload) return;
    const args = pendingFinishPayload.matchHistoryArgs;
    const userScore = args.homeTeamId === pendingFinishPayload.userTeamId ? args.homeScore : args.awayScore;
    const oppScore = args.homeTeamId === pendingFinishPayload.userTeamId ? args.awayScore : args.homeScore;
    const pressureEffect = adjustDebriefEffectForPressure(effect, userPressureProfile, userScore - oppScore);
    const finalUpdatedClubs = pendingFinishPayload.simResultMerged.updatedClubs.map((c: any) => {
      if (c.id !== pendingFinishPayload.userTeamId) return c;
      const newMorale = Math.max(5, Math.min(95, Math.round((c.morale ?? 50) + pressureEffect.moraleDelta)));
      return { ...c, morale: newMorale };
    });
    applySimulationResult({ ...pendingFinishPayload.simResultMerged, updatedClubs: finalUpdatedClubs });
    MatchHistoryService.logMatch(pendingFinishPayload.matchHistoryArgs);
    setMatchState(null);
    setShowPostMatchDebrief(false);
    setPendingFinishPayload(null);
    navigateTo(ViewState.MATCH_POST);
  };

  useEffect(() => {
    if (!matchState || matchState.isPaused || matchState.isPausedForEvent ||
        matchState.isFinished || matchState.isHalfTime || isTacticsOpen || isCelebratingGoal || !env || activePenalty || activePenaltyReview || activeVAR || activePenaltyNoCall) return;

    const tickInterval = matchState.speed === 5 ? 120 
  : matchState.speed === 3.5 ? 200 
  : matchState.speed === 2.5 ? 400 
  : 1000;
    
    const interval = setInterval(() => {
      setMatchState(prev => {
        if (!prev || !ctx) return prev;
        const nextMinute = prev.minute + 1;
        let currentAddedTime = prev.addedTime;
        const currentSeed = prev.sessionSeed;

const nextMomentumSum = prev.momentumSum + prev.momentum;
  const nextMomentumTicks = prev.momentumTicks + 1;
  const nextLiveStats = { ...prev.liveStats };

        if (prev.period === 1 && prev.minute === 45 && currentAddedTime === 0) 
            currentAddedTime = Math.floor(seededRng(currentSeed, 45, 1) * 4) + 1;
        else if (prev.period === 2 && prev.minute === 90 && currentAddedTime === 0) 
            currentAddedTime = Math.floor(seededRng(currentSeed, 90, 2) * 5) + 2;

        const limit = prev.period === 1 ? (45 + currentAddedTime) : (90 + currentAddedTime);
        
        if (nextMinute > limit) {
           const isFT = prev.period === 2;
           const logText = isFT ? "Sędzia kończy mecz!" : "Przerwa w grze.";
           const newLog: MatchLogEntry = { id: `PERIOD_END_${prev.period}`, minute: prev.minute, text: logText, type: MatchEventType.GENERIC };
           

const applyHalftimeRegen = (fatigueMap: Record<string, number>, playersList: Player[]) => {
             const nextFatigue = { ...fatigueMap };
             Object.keys(nextFatigue).forEach(pId => {
               const p = playersList.find(px => px.id === pId);
               if (p) {
                 const stamina = p.attributes.stamina || 50;
                 const strength = p.attributes.strength || 50;
                 // ────────────────────────────────────────────────
      //           Nowa, bardziej sprawiedliwa formuła
      // ────────────────────────────────────────────────
      const sum = stamina + strength;
      const effectiveSum = Math.max(80, sum);           // najsłabsi traktowani jakby mieli min. 80
      const regenAmount = 4.5 + (effectiveSum / 198) * 5.5;
      // Wyniki przykładowe:
      //   80   → ~6.7%
      //  100   → ~7.3%
      //  130   → ~8.1%
      //  160   → ~8.9%
      //  180   → ~9.5%
      //  198   → 10.0%

      const cap = 100 - (p.fatigueDebt || 0);
      nextFatigue[pId] = Math.min(cap, (nextFatigue[pId] || 100) + regenAmount);
               }
             });
             return nextFatigue;
           };

           let nextHomeLineup = { ...prev.homeLineup };
           let nextAwayLineup = { ...prev.awayLineup };
           let nextSubsCountHome = prev.subsCountHome;
           let nextSubsCountAway = prev.subsCountAway;
           let nextHomeSubsHistory = [...prev.homeSubsHistory];
           let nextAwaySubsHistory = [...prev.awaySubsHistory];
           let nextLastAiActionMinute = prev.lastAiActionMinute;
           let nextLastAiSubMinute = prev.lastAiSubMinute ?? prev.lastAiActionMinute;
           let nextLastAiFormationMinute = prev.lastAiFormationMinute ?? prev.lastAiActionMinute;
           let nextAiTacticLockUntilMinute = prev.aiTacticLockUntilMinute ?? 0;
           let nextAiTacticLocked = nextAiTacticLockUntilMinute > 45;
           let nextAiLateTacticChanges = prev.aiLateTacticChanges ?? 0;
           let nextAiLateTacticScoreDiffAtLastChange = prev.aiLateTacticScoreDiffAtLastChange;
           let updatedLogs = [newLog, ...prev.logs];

           // --- HALFTIME AI DECISIONS ---
           if (!isFT) {
              const aiSide: 'HOME' | 'AWAY' = userSide === 'HOME' ? 'AWAY' : 'HOME';
              const decision = AiMatchDecisionService.makeDecisions(
                { ...prev, minute: 45 }, 
                ctx, aiSide, false, true
              );
              
              if (decision.subRecord) {
                 if (aiSide === 'HOME') { 
                   nextHomeLineup = decision.newLineup || nextHomeLineup; 
                   nextSubsCountHome = decision.newSubsCount ?? nextSubsCountHome; 
                   nextHomeSubsHistory.push(decision.subRecord); 
                 }
                 else { 
                   nextAwayLineup = decision.newLineup || nextAwayLineup; 
                   nextSubsCountAway = decision.newSubsCount ?? nextSubsCountAway; 
                   nextAwaySubsHistory.push(decision.subRecord); 
                 }
              }
              if (decision.newTacticId) {
                // [AI-COACH-FIX] decision.newLineup zamiast samego .tacticId — AiMatchDecisionService
                // przy zmianie taktyki teraz ZAWSZE przelicza i zwraca cały skład pod nowe ustawienie
                // (applyTacticReassignment), nie tylko nazwę taktyki. Wcześniej ten blok nadpisywał
                // tylko .tacticId na STARYM składzie (nextHomeLineup z linii ~1056 wyżej), więc
                // zawodnicy zostawali na starych miejscach i mogli "automatycznie" zmienić rolę
                // (np. pomocnik -> napastnik) bez żadnej faktycznej zmiany — to był główny zgłoszony błąd.
                if (aiSide === 'HOME') nextHomeLineup = decision.newLineup || nextHomeLineup;
                else nextAwayLineup = decision.newLineup || nextAwayLineup;
              }
              if (decision.lastAiActionMinute !== undefined) nextLastAiActionMinute = decision.lastAiActionMinute;
              if (decision.lastAiSubMinute !== undefined) nextLastAiSubMinute = decision.lastAiSubMinute;
              if (decision.lastAiFormationMinute !== undefined) nextLastAiFormationMinute = decision.lastAiFormationMinute;
              if (decision.aiTacticLockUntilMinute !== undefined) nextAiTacticLockUntilMinute = decision.aiTacticLockUntilMinute;
              if (decision.aiLateTacticChanges !== undefined) nextAiLateTacticChanges = decision.aiLateTacticChanges;
              if (decision.aiLateTacticScoreDiffAtLastChange !== undefined) nextAiLateTacticScoreDiffAtLastChange = decision.aiLateTacticScoreDiffAtLastChange;
              nextAiTacticLocked = nextAiTacticLockUntilMinute > 45 || !!decision.aiTacticLocked;
              if (decision.logs) {
                 decision.logs.forEach(l => {
                    updatedLogs = [{ id: `AI_HT_${Math.random()}`, minute: 45, text: l, type: MatchEventType.GENERIC }, ...updatedLogs];


                          
                 });
              }
             }
 const recoveredHomeFatigue = !isFT ? applyHalftimeRegen(prev.homeFatigue, ctx.homePlayers) : prev.homeFatigue;
           const recoveredAwayFatigue = !isFT ? applyHalftimeRegen(prev.awayFatigue, ctx.awayPlayers) : prev.awayFatigue;
           return { 
              ...prev, 
              homeLineup: nextHomeLineup, awayLineup: nextAwayLineup,
              homeFatigue: recoveredHomeFatigue, awayFatigue: recoveredAwayFatigue, // Aktualizacja kondycji
              subsCountHome: nextSubsCountHome, subsCountAway: nextSubsCountAway,
              homeSubsHistory: nextHomeSubsHistory, awaySubsHistory: nextAwaySubsHistory,
              lastAiActionMinute: nextLastAiActionMinute,
              lastAiSubMinute: nextLastAiSubMinute,
              lastAiFormationMinute: nextLastAiFormationMinute,
              aiTacticLockUntilMinute: nextAiTacticLockUntilMinute,
              aiLateTacticChanges: nextAiLateTacticChanges,
              aiLateTacticScoreDiffAtLastChange: nextAiLateTacticScoreDiffAtLastChange,
              aiTacticLocked: nextAiTacticLocked,
              isHalfTime: !isFT, isFinished: isFT, isPaused: true, addedTime: currentAddedTime, logs: updatedLogs
           };
        }
              
           

        let updatedLogs = [...prev.logs];
        let nextIsPaused = prev.isPaused;
        let nextHomeLineup = { ...prev.homeLineup };
        let nextAwayLineup = { ...prev.awayLineup };
        let nextPlayerYellowCards = { ...prev.playerYellowCards };
        let nextSentOffIds = [...prev.sentOffIds];
        let nextHomeScore = prev.homeScore;
        let nextAwayScore = prev.awayScore;
        const newHomeGoals = [...prev.homeGoals];
        const newAwayGoals = [...prev.awayGoals];
        let nextSubsCountHome = prev.subsCountHome;
        let nextSubsCountAway = prev.subsCountAway;
        let nextHomeSubsHistory = [...prev.homeSubsHistory];
        let nextAwaySubsHistory = [...prev.awaySubsHistory];
        let nextLastAiActionMinute = prev.lastAiActionMinute;
        let nextLastAiSubMinute = prev.lastAiSubMinute ?? prev.lastAiActionMinute;
        let nextLastAiFormationMinute = prev.lastAiFormationMinute ?? prev.lastAiActionMinute;
        let nextAiTacticLockUntilMinute = prev.aiTacticLockUntilMinute ?? 0;
        let nextAiTacticLocked = nextAiTacticLockUntilMinute > nextMinute;
        let nextAiLateTacticChanges = prev.aiLateTacticChanges ?? 0;
        let nextAiLateTacticScoreDiffAtLastChange = prev.aiLateTacticScoreDiffAtLastChange;
        let nextHomeInjuries = { ...prev.homeInjuries };
        let nextAwayInjuries = { ...prev.awayInjuries };
        let nextHomeRiskMode = { ...prev.homeRiskMode };
        let nextAwayRiskMode = { ...prev.awayRiskMode };
        let nextLightInjuryPrompt: { playerId: string; playerName: string; minute: number } | null = prev.lightInjuryPrompt ?? null;
        let nextHomeUpgradeProb = { ...prev.homeUpgradeProb };
        let nextAwayUpgradeProb = { ...prev.awayUpgradeProb };
        let nextHomeInjuryMin = { ...prev.homeInjuryMin };
        let nextAwayInjuryMin = { ...prev.awayInjuryMin };
        let nextIsPausedForEvent = prev.isPausedForEvent;
        let localHomeFatigue = { ...prev.homeFatigue };
        let localAwayFatigue = { ...prev.awayFatigue };
        let nextActionContributions = { ...(prev.actionContributions ?? {}) };

        // ── CONTACT GOAL BOOST: inicjalizacja zmiennych lokalnych ──────────────
        // Konwencja: >0 = boost dla HOME | <0 = boost dla AWAY | 0 = brak boosta
        // Wygaszamy boost gdy minął czas jego trwania
        let nextActiveTacticalBoost: number = prev.activeTacticalBoost ?? 0;
        let nextTacticalBoostExpiry: number = prev.tacticalBoostExpiry ?? -1;
        let nextLastGoalBoostMinute: number = prev.lastGoalBoostMinute ?? -1;
        if (nextActiveTacticalBoost !== 0 && nextMinute > nextTacticalBoostExpiry) {
          nextActiveTacticalBoost = 0;
          nextTacticalBoostExpiry = -1;
        }
        // ────────────────────────────────────────────────────────────────────────

        
       const engineComment = MatchEngineService.generateCommentary(nextMinute, currentSeed, ctx.homeClub.name, ctx.awayClub.name);
        
        if (engineComment) updatedLogs = [engineComment, ...updatedLogs];

        const aiSide: 'HOME' | 'AWAY' = userSide === 'HOME' ? 'AWAY' : 'HOME';
        const hasSevereHome = nextHomeLineup.startingXI.some(id => id && nextHomeInjuries[id] === InjurySeverity.SEVERE);
        const hasSevereAway = nextAwayLineup.startingXI.some(id => id && nextAwayInjuries[id] === InjurySeverity.SEVERE);
        const hasEmptySlotsAi = aiSide === 'AWAY' ? nextAwayLineup.startingXI.some(id => id === null) : nextHomeLineup.startingXI.some(id => id === null);
        const aiLateMatchContext = {
          aiStakes: aiPressureProfile.stakes,
          userStakes: userPressureProfile.stakes,
          aiRank: aiPressureProfile.rank,
          userRank: userPressureProfile.rank,
          isLateSeason: livePressureContext?.isLateSeason ?? false,
          rivalryMultiplier: livePressureContext?.rivalryMultiplier ?? 1
        };

        let immediateAiTrigger = hasSevereHome || hasSevereAway || hasEmptySlotsAi;

        if (nextMinute % 5 === 0 || immediateAiTrigger) {
           const decision = AiMatchDecisionService.makeDecisions(
              { ...prev, minute: nextMinute, homeLineup: nextHomeLineup, awayLineup: nextAwayLineup, homeInjuries: nextHomeInjuries, awayInjuries: nextAwayInjuries, homeFatigue: localHomeFatigue, awayFatigue: localAwayFatigue, sentOffIds: nextSentOffIds, lastAiActionMinute: nextLastAiActionMinute, lastAiSubMinute: nextLastAiSubMinute, lastAiFormationMinute: nextLastAiFormationMinute, aiTacticLockUntilMinute: nextAiTacticLockUntilMinute, aiTacticLocked: nextAiTacticLocked, aiLateTacticChanges: nextAiLateTacticChanges, aiLateTacticScoreDiffAtLastChange: nextAiLateTacticScoreDiffAtLastChange, subsCountHome: nextSubsCountHome, subsCountAway: nextSubsCountAway, homeSubsHistory: nextHomeSubsHistory, awaySubsHistory: nextAwaySubsHistory },
              ctx,
              aiSide,
              immediateAiTrigger,
              false,
              aiLateMatchContext
            );
           if (decision.subRecord) {
              if (aiSide === 'HOME') {
                nextHomeLineup = decision.newLineup || nextHomeLineup;
                nextSubsCountHome = decision.newSubsCount ?? nextSubsCountHome;
                nextHomeSubsHistory = [...nextHomeSubsHistory, decision.subRecord];
              }
              else {
                nextAwayLineup = decision.newLineup || nextAwayLineup;
                nextSubsCountAway = decision.newSubsCount ?? nextSubsCountAway;
                nextAwaySubsHistory = [...nextAwaySubsHistory, decision.subRecord];
              }
           }
           if (decision.newTacticId) {
              // [AI-COACH-FIX] decision.newLineup zamiast samego .tacticId — patrz identyczny
              // komentarz przy pierwszym takim bloku (sekcja przerwy, ~linia 1067).
              if (aiSide === 'HOME') nextHomeLineup = decision.newLineup || nextHomeLineup;
              else nextAwayLineup = decision.newLineup || nextAwayLineup;
           }
           if (decision.lastAiActionMinute !== undefined) nextLastAiActionMinute = decision.lastAiActionMinute;
           if (decision.lastAiSubMinute !== undefined) nextLastAiSubMinute = decision.lastAiSubMinute;
           if (decision.lastAiFormationMinute !== undefined) nextLastAiFormationMinute = decision.lastAiFormationMinute;
           if (decision.aiTacticLockUntilMinute !== undefined) nextAiTacticLockUntilMinute = decision.aiTacticLockUntilMinute;
           if (decision.aiLateTacticChanges !== undefined) nextAiLateTacticChanges = decision.aiLateTacticChanges;
           if (decision.aiLateTacticScoreDiffAtLastChange !== undefined) nextAiLateTacticScoreDiffAtLastChange = decision.aiLateTacticScoreDiffAtLastChange;
           nextAiTacticLocked = nextAiTacticLockUntilMinute > nextMinute || !!decision.aiTacticLocked;
           if (decision.logs) {
              decision.logs.forEach(l => {
                 updatedLogs = [{ id: `AI_LOG_${nextMinute}_${Math.random()}`, minute: nextMinute, text: l, type: MatchEventType.GENERIC, teamSide: aiSide }, ...updatedLogs];
              });
           }
        }

        const rngEvent = seededRng(currentSeed, nextMinute, 500);

        // ─── KARA ZA ZMĘCZENIE DRUŻYNY (wpływ na inicjatywę i liczbę strzałów) ───
        // Liczymy średnią kondycję aktywnych zawodników każdej drużyny
        const _getAvgFatigue = (lineup: (string | null)[], fatigueMap: Record<string, number>): number => {
          const ids = lineup.filter((id): id is string => id !== null);
          if (ids.length === 0) return 100;
          return ids.reduce((acc, id) => acc + (fatigueMap[id] ?? 100), 0) / ids.length;
        };
        const avgFatigueHome = _getAvgFatigue(nextHomeLineup.startingXI, localHomeFatigue);
        const avgFatigueAway = _getAvgFatigue(nextAwayLineup.startingXI, localAwayFatigue);

        // Krzywa kary: kondycja 94→0 | 85→-0.022 | 80→-0.039 | 75→-0.057 | 70→-0.077 | 60→-0.118
        // ZMIANA (2026-06-18): brak zmian był nadal zbyt mało odczuwalny, bo średnia kondycja
        // często nie spadała poniżej progów wpływających realnie na inicjatywę i liczbę strzałów.
        // Wyższy próg i łagodniejszy wykładnik zaczynają karać wcześniej, ale nadal progresywnie.
        // ZMIANA (2026-06-17): próg podniesiony z 85 → 92, współczynnik z 0.17 → 0.30.
        // Powód: poprzednie wartości były zbyt łagodne — przy typowej końcowej kondycji 80%
        // kara wynosiła zaledwie -0.005 (niewidoczna). Brak zmian nie powodował żadnej przewagi rywala.
        // Teraz: przy 80% kara = -0.039, przy 75% kara = -0.057 — odczuwalna różnica w kreowaniu sytuacji.
        // Drużyna bez zmian (80% kondycji) vs drużyna z 3 zmianami (87%) → różnica inicjatywy ~11-14%.
        const _fatiguePenalty = (avgFat: number): number => {
          if (avgFat >= 94) return 0;
          const depth = (94 - avgFat) / 94; // 0..1
          return -(Math.pow(depth, 1.25) * 0.42);
        };
        const _rotationPenalty = (lineup: (string | null)[], fatigueMap: Record<string, number>, ownSubs: number, oppSubs: number): number => {
          if (nextMinute < 60 || ownSubs >= 2) return 0;
          const ids = lineup.filter((id): id is string => id !== null);
          if (ids.length === 0) return 0;
          const tiredShare = ids.filter(id => (fatigueMap[id] ?? 100) < 84).length / ids.length;
          const lateFactor = Math.min(1, (nextMinute - 60) / 30);
          const rotationGap = Math.max(0, oppSubs - ownSubs);
          const pressure = ((2 - ownSubs) * 0.012) + tiredShare * 0.052 + rotationGap * 0.010;
          return -Math.min(0.085, pressure * lateFactor);
        };
        const homeFatPenalty = _fatiguePenalty(avgFatigueHome) + _rotationPenalty(nextHomeLineup.startingXI, localHomeFatigue, nextSubsCountHome, nextSubsCountAway);
        const awayFatPenalty = _fatiguePenalty(avgFatigueAway) + _rotationPenalty(nextAwayLineup.startingXI, localAwayFatigue, nextSubsCountAway, nextSubsCountHome);
        const homeFormImpact = teamFormImpact.home;
        const awayFormImpact = teamFormImpact.away;
        const playerFormImpact = TeamFormImpactService.calculateMatchImpact(
          ctx.homePlayers,
          ctx.awayPlayers,
          nextHomeLineup,
          nextAwayLineup
        );
        const getFormStackingMultiplier = (side: 'HOME' | 'AWAY'): number => {
          const sideMomentum = side === 'HOME' ? prev.momentum : -prev.momentum;
          if (sideMomentum <= 10) return 1;
          return 1 - Math.min(0.45, ((sideMomentum - 10) / 90) * 0.45);
        };
        const homeFormStacking = getFormStackingMultiplier('HOME');
        const awayFormStacking = getFormStackingMultiplier('AWAY');

        const homeScoreDiff = prev.homeScore - prev.awayScore;
        const awayScoreDiff = prev.awayScore - prev.homeScore;
        const userScoreDiff = userSide === 'HOME' ? homeScoreDiff : awayScoreDiff;
        const hLivePressure = getLivePressureModifiers(
          getPressureProfileForSide(livePressureContext, 'HOME'),
          homeScoreDiff,
          nextMinute
        );
        const aLivePressure = getLivePressureModifiers(
          getPressureProfileForSide(livePressureContext, 'AWAY'),
          awayScoreDiff,
          nextMinute
        );

        const getMidfieldControl = (
          playersList: Player[],
          xi: (string | null)[]
        ): number => {
          const ids = xi.filter((id): id is string => id !== null);
          const midfielders = playersList.filter(
            p => ids.includes(p.id) && p.position === PlayerPosition.MID
          );
          if (midfielders.length === 0) return 60;
          return midfielders.reduce(
            (acc, p) => acc + ((p.attributes.technique + p.attributes.passing) / 2),
            0
          ) / midfielders.length;
        };

        const homeMidfieldControl = getMidfieldControl(ctx.homePlayers, nextHomeLineup.startingXI);
        const awayMidfieldControl = getMidfieldControl(ctx.awayPlayers, nextAwayLineup.startingXI);
        const midfieldControlDiff = homeMidfieldControl - awayMidfieldControl;
        const midfieldInitiativeMod =
          Math.abs(midfieldControlDiff) <= 2
            ? 0
            : Math.max(-0.026, Math.min(0.026, midfieldControlDiff * 0.0014));
        // Use role-adjusted strength for the live advantage curve. A player moved into a new slot
        // contributes as his effective role overall, so tactical reshuffles can improve or weaken
        // the team instead of blindly reusing raw OVR.
        const getEffectiveXIStrength = (playersList: Player[], lineup: Lineup): number => {
          const tactic = TacticRepository.getById(lineup.tacticId);
          const activeRoleOveralls = lineup.startingXI
            .map((id, idx) => {
              if (!id) return null;
              const player = playersList.find(p => p.id === id);
              const role = tactic.slots[idx]?.role ?? player?.position;
              return player && role ? PlayerPositionFitService.getEffectiveRoleOverall(player, role, true) : null;
            })
            .filter((value): value is number => value !== null);
          if (activeRoleOveralls.length === 0) return 62;
          const avgOverall = activeRoleOveralls.reduce((sum, overall) => sum + overall, 0) / activeRoleOveralls.length;
          // Średnia jakości roli nie może maskować gry w 10/9. Efektywna siła XI waży klasę graczy
          // liczbą realnie obsadzonych slotów, więc 10 elitarnych nadal rozbije 10 amatorów,
          // ale brak zawodnika oraz zły profil na pozycji obniżają strukturę zespołu.
          const structureFactor = Math.min(1, activeRoleOveralls.length / 11);
          return avgOverall * structureFactor;
        };
        const homeAvgOverallLive = getEffectiveXIStrength(ctx.homePlayers, nextHomeLineup);
        const awayAvgOverallLive = getEffectiveXIStrength(ctx.awayPlayers, nextAwayLineup);
        const homeQualityGapLive = homeAvgOverallLive - awayAvgOverallLive;
        const getQualityGapCurve = (gap: number): number => {
          const absGap = Math.abs(gap);
          if (absGap <= 2) return 0;
          const normalized = Math.min(1, (absGap - 2) / 18);
          return Math.sign(gap) * Math.pow(normalized, 1.35);
        };
        const qualityInitiativeMod = getQualityGapCurve(homeQualityGapLive) * 0.055;
        const shotGapLive = nextLiveStats.home.shots - nextLiveStats.away.shots;
        const shotDominanceInitiativeMod =
          nextMinute < 25 || Math.abs(shotGapLive) < 8
            ? 0
            : -Math.sign(shotGapLive) *
              Math.min(0.055, (Math.abs(shotGapLive) - 7) * 0.006) *
              (Math.sign(shotGapLive) === Math.sign(homeQualityGapLive) && Math.abs(homeQualityGapLive) > 8 ? 0.45 : 1);

        // Wpływ na przewagę inicjatywy (homeAttackChance)
        // Bardziej zmęczona drużyna rzadziej przejmuje inicjatywę
        const fatInitiativeMod = (homeFatPenalty - awayFatPenalty) * 3.0; // [było *0.6 — zbyt słabe, zmęczona drużyna traciła inicjatywę o <1%; teraz ~11-14% różnicy przy braku zmian]
        const pressureInitiativeMod = ((hLivePressure.initiativeMultiplier - 1) - (aLivePressure.initiativeMultiplier - 1)) * 0.42;
        const formInitiativeMod = (homeFormImpact.initiativeModifier * homeFormStacking) - (awayFormImpact.initiativeModifier * awayFormStacking);
        const playerFormInitiativeMod = clampNumber(
          (playerFormImpact.homeGoalChanceMultiplier - playerFormImpact.awayGoalChanceMultiplier) * 0.055,
          -0.060,
          0.060
        );
        const getGoalkeeperCrisisInitiativePenalty = (lineup: Lineup, players: Player[]): number => {
          const keeper = lineup.startingXI[0] ? players.find(p => p.id === lineup.startingXI[0]) : null;
          if (!keeper) return 0.040;
          if (keeper.position === PlayerPosition.GK) return 0;
          const emergencyRead =
            keeper.attributes.goalkeeping * 0.35 +
            keeper.attributes.positioning * 0.25 +
            keeper.attributes.mentality * 0.22 +
            keeper.attributes.strength * 0.18;
          return 0.018 + Math.max(0, Math.min(1, (62 - emergencyRead) / 45)) * 0.018;
        };
        const goalkeeperCrisisInitiativeMod =
          getGoalkeeperCrisisInitiativePenalty(nextAwayLineup, ctx.awayPlayers) -
          getGoalkeeperCrisisInitiativePenalty(nextHomeLineup, ctx.homePlayers);
        const homeAttackChance = Math.min(
          0.72,
          Math.max(
            0.28,
            0.5 +
              prev.momentum / 280 +
              fatInitiativeMod +
              pressureInitiativeMod +
              formInitiativeMod +
              playerFormInitiativeMod +
              midfieldInitiativeMod +
              qualityInitiativeMod +
              shotDominanceInitiativeMod +
              goalkeeperCrisisInitiativeMod
          )
        );
        let activeSide: 'HOME' | 'AWAY' = seededRng(currentSeed, nextMinute, 600) < homeAttackChance ? 'HOME' : 'AWAY';
        const firstZeroShotCheckMinute = 34 + Math.floor(seededRng(currentSeed, 0, 641) * 12);
        const secondZeroShotCheckMinute = 61 + Math.floor(seededRng(currentSeed, 0, 642) * 30);
        const isZeroShotCheckMinute = nextMinute === firstZeroShotCheckMinute || nextMinute === secondZeroShotCheckMinute;
        const shouldRescueZeroShotSide = (side: 'HOME' | 'AWAY'): boolean => {
          const sideStats = side === 'HOME' ? nextLiveStats.home : nextLiveStats.away;
          if (!isZeroShotCheckMinute || sideStats.shots > 0) return false;
          const sideAttackChance = side === 'HOME' ? homeAttackChance : 1 - homeAttackChance;
          const sideQualityGap = side === 'HOME' ? homeQualityGapLive : -homeQualityGapLive;
          const sideSentOffs = prev.sentOffIds.filter(id => (side === 'HOME' ? ctx.homePlayers : ctx.awayPlayers).some(p => p.id === id)).length;
          if (sideSentOffs >= 2 || sideAttackChance < 0.30 || sideQualityGap < -16) return false;

          const lateCheck = nextMinute === secondZeroShotCheckMinute;
          if (sideQualityGap >= -8 && sideAttackChance >= 0.34 && sideSentOffs === 0) return true;
          return lateCheck && sideQualityGap >= -11 && sideAttackChance >= 0.35 && sideSentOffs <= 1;
        };
        let forceZeroShotChance = false;
        const homeZeroShotRescue = shouldRescueZeroShotSide('HOME');
        const awayZeroShotRescue = shouldRescueZeroShotSide('AWAY');
        if (homeZeroShotRescue || awayZeroShotRescue) {
          if (homeZeroShotRescue && awayZeroShotRescue) {
            activeSide = activeSide === 'HOME' ? 'HOME' : 'AWAY';
          } else {
            activeSide = homeZeroShotRescue ? 'HOME' : 'AWAY';
          }
          forceZeroShotChance = true;
        }
        let activePressureMods = activeSide === 'HOME' ? hLivePressure : aLivePressure;
        const counterAttackEnabled = prev.userInstructions.counterAttack === 'COUNTER';
        const userCounterTactic = TacticRepository.getById(userSide === 'HOME' ? nextHomeLineup.tacticId : nextAwayLineup.tacticId);
        const opponentCounterTactic = TacticRepository.getById(userSide === 'HOME' ? nextAwayLineup.tacticId : nextHomeLineup.tacticId);
        const opponentPressure = userSide === 'HOME' ? Math.max(0, -prev.momentum) : Math.max(0, prev.momentum);
        const userPressure = userSide === 'HOME' ? Math.max(0, prev.momentum) : Math.max(0, -prev.momentum);
        const counterShape =
          prev.userInstructions.mindset === 'DEFENSIVE' ||
          userCounterTactic.defenseBias >= 62 ||
          userCounterTactic.attackBias <= 45;
        const opponentPushes =
          opponentPressure >= 35 ||
          opponentCounterTactic.attackBias >= 62 ||
          userScoreDiff > 0;
        let counterAttackTriggered = false;
        let counterAttackShotBonus = 0;

        if (activeSide !== userSide && counterAttackEnabled && counterShape && opponentPushes) {
          const pressureFactor = Math.max(0, Math.min(1, (opponentPressure - 25) / 75));
          const shapeFactor = Math.max(0, Math.min(1, (userCounterTactic.defenseBias - 50) / 40));
          const opponentRiskFactor = Math.max(0, Math.min(1, (opponentCounterTactic.attackBias - 50) / 45));
          const scoreFactor = userScoreDiff > 0 ? 0.03 : 0;
          const rf = prev.userInstructions.counterAttackResponseFactor ?? 1.0;
          const counterChance = Math.max(
            0,
            Math.min(0.14, (0.023 + pressureFactor * 0.054 + shapeFactor * 0.022 + opponentRiskFactor * 0.022 + scoreFactor) * rf)
          );

          if (seededRng(currentSeed, nextMinute, 631) < counterChance) {
            activeSide = userSide;
            counterAttackTriggered = true;
            const counterQualityModifier = LiveMatchInstructionBalanceService.getCounterAttackModifier(
              userSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers,
              userSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI,
              userSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers,
              userSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI
            );
            counterAttackShotBonus = Math.max(
              0.006,
              Math.min(0.028, 0.011 + pressureFactor * 0.009 + opponentRiskFactor * 0.005 + counterQualityModifier)
            );
          }
        }

        // ─── AI KONTRATAK ─────────────────────────────────────────────────────
        let aiCounterAttackTriggered = false;
        let aiCounterAttackShotBonus = 0;
        const aiCounterAttackEnabled = prev.aiActiveShout?.counterAttack === 'COUNTER';
        const aiSideForCounter: 'HOME' | 'AWAY' = userSide === 'HOME' ? 'AWAY' : 'HOME';
        // Kontra AI dostaje taki sam losowy mnoznik reakcji jak instrukcja gracza, ale liczony z seeda meczu.
        const aiCounterShoutMinute = prev.aiActiveShout?.id.startsWith('ai_')
          ? parseInt(prev.aiActiveShout.id.replace('ai_', ''))
          : 0;
        const aiCounterResponseFactor = aiCounterAttackEnabled
          ? parseFloat((0.6 + seededRng(currentSeed, aiCounterShoutMinute, 806) * 0.8).toFixed(2))
          : 1.0;
        const aiCounterTacticObj = TacticRepository.getById(userSide === 'HOME' ? nextAwayLineup.tacticId : nextHomeLineup.tacticId);
        const aiScoreDiffForCounter = userSide === 'HOME' ? prev.awayScore - prev.homeScore : prev.homeScore - prev.awayScore;
        const aiCounterShape =
          aiCounterTacticObj.defenseBias >= 55 ||
          prev.aiActiveShout?.mindset === 'DEFENSIVE' ||
          aiScoreDiffForCounter > 0;
        const userPushes =
          prev.userInstructions.mindset === 'OFFENSIVE' ||
          userCounterTactic.attackBias >= 60 ||
          userScoreDiff < 0;

        if (!counterAttackTriggered && activeSide === userSide && aiCounterAttackEnabled && aiCounterShape && userPushes) {
          const userPressFactor = Math.max(0, Math.min(1, (userPressure - 25) / 75));
          const aiShapeFactor = Math.max(0, Math.min(1, (aiCounterTacticObj.defenseBias - 50) / 40));
          const userRiskFactor = Math.max(0, Math.min(1, (userCounterTactic.attackBias - 50) / 45));
          const aiScoreFactor = aiScoreDiffForCounter > 0 ? 0.03 : 0;
          const aiCounterChance = Math.max(
            0,
            Math.min(0.14, (0.023 + userPressFactor * 0.054 + aiShapeFactor * 0.022 + userRiskFactor * 0.022 + aiScoreFactor) * aiCounterResponseFactor)
          );
          if (seededRng(currentSeed, nextMinute, 641) < aiCounterChance) {
            activeSide = aiSideForCounter;
            aiCounterAttackTriggered = true;
            const aiCounterQualityModifier = LiveMatchInstructionBalanceService.getCounterAttackModifier(
              userSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers,
              userSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI,
              userSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers,
              userSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI
            );
            aiCounterAttackShotBonus = Math.max(
              0.006,
              Math.min(0.028, 0.011 + userPressFactor * 0.009 + userRiskFactor * 0.005 + aiCounterQualityModifier)
            );
          }
        }
        // ─────────────────────────────────────────────────────────────────────
        activePressureMods = activeSide === 'HOME' ? hLivePressure : aLivePressure;

   // TUTAJ WSTAW TEN KOD - Logika Nasycenia (Satiety Logic)
        let shotThreshold = 0.11;
        const goalDiff = Math.abs(prev.homeScore - prev.awayScore);
        const leads = (activeSide === 'HOME' && prev.homeScore > prev.awayScore) || (activeSide === 'AWAY' && prev.awayScore > prev.homeScore);

        if (leads && goalDiff >= 3) {
           // Losowanie współczynnika 0.3 - 0.6 na podstawie ziarna meczu
           const satietyWeight = 0.3 + (seededRng(currentSeed, 0, 999) * 0.3); 
           const satietyFactor = 1 + (goalDiff - 1) * satietyWeight;
           shotThreshold /= satietyFactor; // Im wyższy factor, tym niższy próg (trudniej o strzał)
        }

        // Krok 2: defenseBias rywala utrudnia dojście do strzału
        // max kara: 6-3-1 (defenseBias=95) → -0.076 | min: 4-2-4 (defenseBias=10) → -0.008
        const defendingLineup2 = activeSide === 'HOME' ? nextAwayLineup : nextHomeLineup;
        const defendingTactic2 = TacticRepository.getById(defendingLineup2.tacticId);
        const defBiasPenalty = (defendingTactic2.defenseBias / 100) * 0.045;

        // Bonus gdy broniący nie ma bramkarza na bramce (slot 0 = null lub nie-GK)
        const defendingXI2 = activeSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
        const defendingTeamPlayers2 = activeSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers;
        const slotZeroPlayer = defendingXI2[0] !== null ? defendingTeamPlayers2.find(p => p.id === defendingXI2[0]) : null;
        const getEmergencyKeeperRead = (player: Player | null | undefined): number => {
          if (!player) return 0;
          return (
            player.attributes.goalkeeping * 0.35 +
            player.attributes.positioning * 0.25 +
            player.attributes.mentality * 0.22 +
            player.attributes.strength * 0.18
          );
        };
        const noGkBonus = defendingXI2[0] === null
          ? 0.055  // pusty slot = otwarta bramka
          : (slotZeroPlayer?.position !== PlayerPosition.GK
              ? 0.031 + Math.max(0, Math.min(1, (62 - getEmergencyKeeperRead(slotZeroPlayer)) / 45)) * 0.017
              : 0); // nie-GK w bramce

        // Bonus za jakość napastnika (znormalizowany do polskiej ligi: zakres finishing 55-77)
        const attackingTeamPlayers2 = activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
        const attackingXI2 = (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter(id => id !== null) as string[];
        const topStriker = attackingTeamPlayers2
          .filter(p => attackingXI2.includes(p.id) && p.position === PlayerPosition.FWD)
          .sort((a, b) => b.attributes.finishing - a.attributes.finishing)[0];
        const strikerBonus = topStriker
          ? Math.max(0, ((topStriker.attributes.finishing * PlayerMoraleService.getMatchMultiplier(topStriker)) - 55) / (77 - 55)) * 0.012
          : 0;
        let moraleTeamPenalty = 0;
        attackingXI2.forEach(id => {
          const player = attackingTeamPlayers2.find(p => p.id === id);
          if (!player) return;
          const morale = (player as any).morale ?? 50;
          const baseDebuff = morale <= 19 ? 0.097 : morale <= 39 ? 0.062 : 0;
          if (baseDebuff === 0) return;
          const mentalityResistance = (player.attributes.mentality ?? 50) / 100;
          const effectivePenalty = baseDebuff * (1 - mentalityResistance * 0.6);
          const randomNoise = 1 + (Math.random() * 0.10 - 0.05);
          moraleTeamPenalty += effectivePenalty * randomNoise;
        });
        const moraleDebuffMultiplier = Math.max(0.15, 1 - moraleTeamPenalty);
        const activeFormImpact = activeSide === 'HOME' ? homeFormImpact : awayFormImpact;
        const defendingFormImpact = activeSide === 'HOME' ? awayFormImpact : homeFormImpact;
        const activePlayerFormImpact = activeSide === 'HOME' ? playerFormImpact.home : playerFormImpact.away;
        const defendingPlayerFormImpact = activeSide === 'HOME' ? playerFormImpact.away : playerFormImpact.home;
        const activePlayerFormChanceMultiplier = activeSide === 'HOME'
          ? playerFormImpact.homeGoalChanceMultiplier
          : playerFormImpact.awayGoalChanceMultiplier;
        const activeFormStacking = activeSide === 'HOME' ? homeFormStacking : awayFormStacking;
        const defendingFormStacking = activeSide === 'HOME' ? awayFormStacking : homeFormStacking;

        // Kara zmęczenia atakującej drużyny na shotThreshold
        const activeFatPenalty = activeSide === 'HOME' ? homeFatPenalty : awayFatPenalty;

        // ─── KARA: OSŁABIONY SKŁAD + OFENSYWNA TAKTYKA ────────────────────────
        // Liczba "dziur" w XI (null = brak zawodnika po czerwonej lub kontuzji bez zmiany)
        const homeMissing = nextHomeLineup.startingXI.filter(id => id === null).length;
        const awayMissing = nextAwayLineup.startingXI.filter(id => id === null).length;
        const defendingMissing = activeSide === 'HOME' ? awayMissing : homeMissing;
        const attackingMissing = activeSide === 'HOME' ? homeMissing : awayMissing;
        const defendingTacticObj = TacticRepository.getById(
          activeSide === 'HOME' ? nextAwayLineup.tacticId : nextHomeLineup.tacticId
        );
        const attackingTacticObj = TacticRepository.getById(
          activeSide === 'HOME' ? nextHomeLineup.tacticId : nextAwayLineup.tacticId
        );
        const attackingXIForGk = activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
        const attackingTeamForGk = activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
        const attackingSlotZeroPlayer = attackingXIForGk[0] !== null ? attackingTeamForGk.find(p => p.id === attackingXIForGk[0]) : null;
        const attackingGoalkeeperCrisis =
          attackingXIForGk[0] === null || (!!attackingSlotZeroPlayer && attackingSlotZeroPlayer.position !== PlayerPosition.GK);
        const defendingSentOff = nextSentOffIds.filter(id =>
          (activeSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers).some(p => p.id === id)
        ).length;
        const attackingSentOff = nextSentOffIds.filter(id =>
          (activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers).some(p => p.id === id)
        ).length;

        // Bonus dla atakującego jeśli broniący ma dziury defensywne (brakujący gracz + ofensywna taktyka)
        // Broniący grał ofensywnie i stracił zawodnika → otwarte plecy
        // 1 brak + attackBias>60 → +0.018 | 1 brak + attackBias>75 → +0.028 | 2+ braki → skaluje x1.6
        let openBacksBonus = 0;
        if (defendingMissing > 0 && defendingTacticObj.attackBias > 60) {
          const offensiveness = (defendingTacticObj.attackBias - 60) / 40; // 0..1
          openBacksBonus = 0.018 + offensiveness * 0.020;
          if (defendingMissing >= 2) openBacksBonus *= 1.6;
        }

        // Czerwona kartka powinna wymuszać ostrożniejszą grę.
        // Jeśli osłabiona drużyna dalej gra wysoko/ofensywnie, przeciwnik łatwiej dochodzi do sytuacji.
        let redCardTacticalExposure = 0;
        if (defendingSentOff > 0) {
          const lackOfCaution = Math.max(0, Math.min(1, (defendingTacticObj.attackBias - 50) / 45));
          const weakBlock = Math.max(0, Math.min(1, (62 - defendingTacticObj.defenseBias) / 42));
          redCardTacticalExposure = defendingSentOff * (0.006 + lackOfCaution * 0.016 + weakBlock * 0.006);
          if (defendingTacticObj.defenseBias >= 70 && defendingTacticObj.attackBias <= 45) redCardTacticalExposure *= 0.55;
          if (defendingSentOff >= 2) redCardTacticalExposure *= 1.35;
        }

        // Kara dla atakującego jeśli SAM ma dziury i gra ofensywnie (ryzyko kontry zostało już wyżej,
        // ale tu karzymy też jego własne możliwości — mniej nóg na boisku = mniej akcji)
        let ownShortHandedPenalty = 0;
        if (attackingMissing > 0) {
          // Każdy brakujący zawodnik to kara bazowa; większa jeśli taktyka ofensywna (mniej obrońców)
          const offensiveRisk = attackingTacticObj.attackBias > 65 ? 1.4 : 1.0;
          ownShortHandedPenalty = attackingMissing * 0.016 * offensiveRisk;
        }

        // Osłabiona drużyna ma też mniejszą jakość własnych ataków, zwłaszcza gdy nie cofa ustawienia.
        let redCardAttackingDrag = 0;
        if (attackingSentOff > 0) {
          const overreach = Math.max(0, Math.min(1, (attackingTacticObj.attackBias - 55) / 35));
          redCardAttackingDrag = attackingSentOff * (0.007 + overreach * 0.014);
          if (attackingTacticObj.defenseBias >= 65 && attackingTacticObj.attackBias <= 50) redCardAttackingDrag *= 0.65;
          if (attackingSentOff >= 2) redCardAttackingDrag *= 1.35;
        }

        // Gracz z pola w bramce zmienia zachowanie całej drużyny.
        // Kara jest mała przy niskim bloku i kontrataku, większa gdy zespół nadal gra otwarcie.
        let goalkeeperCrisisAttackDrag = 0;
        if (attackingGoalkeeperCrisis) {
          const overreach = Math.max(0, Math.min(1, (attackingTacticObj.attackBias - 52) / 38));
          const cautiousBlock = attackingTacticObj.defenseBias >= 62 && attackingTacticObj.attackBias <= 48;
          const keeperRead = getEmergencyKeeperRead(attackingSlotZeroPlayer);
          const panicFactor = attackingXIForGk[0] === null
            ? 1.25
            : 0.85 + Math.max(0, Math.min(1, (60 - keeperRead) / 42)) * 0.30;
          goalkeeperCrisisAttackDrag = (0.006 + overreach * 0.012) * panicFactor;
          if (cautiousBlock) goalkeeperCrisisAttackDrag *= 0.45;
          if ((counterAttackTriggered && activeSide === userSide) || (aiCounterAttackTriggered && activeSide !== userSide)) {
            goalkeeperCrisisAttackDrag *= 0.55;
          }
        }

        // ─── BOOST: CZERWONA KARTKA + DEFENSYWNA TAKTYKA ──────────────────────
        // Broniący grał defensywnie (attackBias ≤ 60) po czerwonej kartce → brak kary "otwarte plecy",
        // ale i tak jest luka w obronie. Przeciwnik dostaje losowy boost do akcji podbramkowych.
        // Skala progresywna: 1 kartka [0.006–0.015] | 2 kartki ×1.7 [0.010–0.026] | 3+ ×1.7^(n-1)
        let redCardDefensiveBoost = 0;
        if (defendingSentOff > 0 && defendingTacticObj.attackBias <= 60) {
          const baseBoost = 0.006 + seededRng(currentSeed, nextMinute, 777) * 0.009;
          redCardDefensiveBoost = baseBoost * Math.pow(1.7, defendingSentOff - 1);
        }

        // ─── KARA: ZMĘCZENIE INDYWIDUALNYCH GRACZY ───────────────────────────
        // Średnia kondycji całej jedenastki rozmywa wpływ 1-2 krytycznie zmęczonych graczy.
        // Dlatego: zawodnicy atakującej drużyny poniżej 82 i 70 fatigue nakładają dodatkową karę.
        // Każdy świeży zawodnik broniącej drużyny (fatigue > 82) przy ≥2 zmęczonych rywalach daje bonus.
        // Brak zmian ma być odczuwalny już zanim piłkarze spadną do krytycznych wartości <75.
        // [ZMIANA 2026-06-18: próg zmęczenia użytkowego podniesiony z 75 → 82, z limitem kary 0.060]
        const attackingFatigueMap = activeSide === 'HOME' ? localHomeFatigue : localAwayFatigue;
        const defendingFatigueMap = activeSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
        const attackingXIIds = (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter((id): id is string => id !== null);
        const defendingXIIds = (activeSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI).filter((id): id is string => id !== null);
        const tiredAttackers = attackingXIIds.filter(id => (attackingFatigueMap[id] ?? 100) < 82).length;
        const exhaustedAttackers = attackingXIIds.filter(id => (attackingFatigueMap[id] ?? 100) < 70).length;
        const tiredDefenders = defendingXIIds.filter(id => (defendingFatigueMap[id] ?? 100) < 82).length;
        const exhaustedDefenders = defendingXIIds.filter(id => (defendingFatigueMap[id] ?? 100) < 70).length;
        const freshDefenders = defendingXIIds.filter(id => (defendingFatigueMap[id] ?? 100) > 82).length;
        const criticalFatPenalty = Math.min(0.060, tiredAttackers * 0.006 + exhaustedAttackers * 0.010);
        const freshDefBonus = tiredAttackers >= 2 ? Math.min(0.040, freshDefenders * 0.006) : 0;
        const attackingSubsUsed = activeSide === 'HOME' ? nextSubsCountHome : nextSubsCountAway;
        const defendingSubsUsed = activeSide === 'HOME' ? nextSubsCountAway : nextSubsCountHome;
        const noRotationShotPenalty = nextMinute >= 60 && attackingSubsUsed <= 1
          ? Math.min(
              0.035,
              (2 - attackingSubsUsed) * 0.006 +
              tiredAttackers * 0.004 +
              Math.max(0, defendingSubsUsed - attackingSubsUsed) * 0.004
            ) * Math.min(1, (nextMinute - 60) / 30)
          : 0;
        // Fresh-legs attack bonus:
        // Rewards a side that used the bench (3+ substitutions) when attacking a team that
        // barely rotated (0-1 substitutions) after minute 60. This complements the existing
        // noRotationShotPenalty, which mostly punishes the tired team's own attacking output.
        // Without this positive swing, an AI that correctly uses 4-5 substitutions still did
        // not feel dangerous enough against a player who left exhausted defenders on the pitch.
        //
        // Calibration:
        // - "attackingSubsUsed >= 3" defines when fresh attacking legs are considered real.
        //   Lower to 2 if rotation should matter earlier; raise to 4 for a stricter payoff.
        // - "defendingSubsUsed <= 1" defines negligence. Raise to 2 if you want players who
        //   make only minimal changes to still be punished.
        // - Cap 0.024 limits how much this can add to shotThreshold. Raise carefully; this
        //   stacks with fatigue, momentum, tactics, and FAST + OFFENSIVE instruction bonuses.
        // - tiredDefenders/exhaustedDefenders weights control whether the effect is mainly
        //   about substitution count or actual tired bodies on the pitch.
        // - The minute ramp prevents a sudden jump at 60'; changing the divisor from 30 to
        //   20 makes the effect reach full strength around minute 80 instead of 90.
        const rotationMismatchAttackBonus = nextMinute >= 60 && attackingSubsUsed >= 3 && defendingSubsUsed <= 1
          ? Math.min(
              0.024,
              0.006 +
                Math.max(0, attackingSubsUsed - defendingSubsUsed - 1) * 0.003 +
                tiredDefenders * 0.003 +
                exhaustedDefenders * 0.005
            ) * Math.min(1, (nextMinute - 60) / 30)
          : 0;
        const lateFatigueShotDrag = nextMinute >= 60
          ? Math.min(0.052, noRotationShotPenalty * 0.75 + criticalFatPenalty * 0.35)
          : 0;
        const fatiguedShotFloor = Math.max(
          0.055,
          0.10 - noRotationShotPenalty - criticalFatPenalty * 0.25
        );

        shotThreshold = Math.max(
          fatiguedShotFloor,
          shotThreshold
            - defBiasPenalty
            + strikerBonus
            + activeFatPenalty
            + activeFormImpact.shotModifier * activeFormStacking
            - defendingFormImpact.shotResistanceModifier * defendingFormStacking
            + openBacksBonus
            + redCardTacticalExposure
            - ownShortHandedPenalty
            - redCardAttackingDrag
            - goalkeeperCrisisAttackDrag
            + noGkBonus
            + redCardDefensiveBoost
            + rotationMismatchAttackBonus
            - criticalFatPenalty
            - freshDefBonus
            - noRotationShotPenalty
        );
        shotThreshold = Math.max(fatiguedShotFloor, shotThreshold * moraleDebuffMultiplier);

        const defendingXI3 = defendingLineup2.startingXI.filter((id): id is string => id !== null);
        const attackingAvgRating = activeSide === 'HOME' ? homeAvgOverallLive : awayAvgOverallLive;
        const defendingAvgRating = activeSide === 'HOME' ? awayAvgOverallLive : homeAvgOverallLive;
        const ratingGap = attackingAvgRating - defendingAvgRating;
        const strengthShotMod = Math.max(-0.014, Math.min(0.020, getQualityGapCurve(ratingGap) * 0.020));
        shotThreshold += strengthShotMod;
        const activeShotsSoFar = activeSide === 'HOME' ? nextLiveStats.home.shots : nextLiveStats.away.shots;
        const defendingShotsSoFar = activeSide === 'HOME' ? nextLiveStats.away.shots : nextLiveStats.home.shots;
        const activeShotGap = activeShotsSoFar - defendingShotsSoFar;
        const shotVolumeDrag =
          nextMinute < 25 || activeShotGap < 8
            ? 0
            : Math.min(0.034, (activeShotGap - 7) * 0.0026) *
              (ratingGap > 10 ? 0.40 : ratingGap > 6 ? 0.65 : 1.0);

        const attackBiasBonus = Math.max(-0.016, Math.min(0.016, (attackingTacticObj.attackBias - 50) / 100 * 0.04));
        shotThreshold += attackBiasBonus;
        shotThreshold += TacticalMatchupService.evaluateShotMatchup(
          attackingTacticObj.id,
          defendingTacticObj.id,
          attackingTeamPlayers2,
          activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI,
          defendingTeamPlayers2,
          defendingLineup2.startingXI
        ).modifier;

        const activeMidfieldControlDiff = activeSide === 'HOME'
          ? midfieldControlDiff
          : -midfieldControlDiff;
        if (activeMidfieldControlDiff > 2) {
          shotThreshold += Math.min(0.006, activeMidfieldControlDiff * 0.00045);
        } else if (activeMidfieldControlDiff < -4) {
          shotThreshold -= Math.min(0.004, Math.abs(activeMidfieldControlDiff) * 0.0003);
        }

        // Momentum bonus do shotThreshold - tylko gdy aktywna drużyna ma impet po swojej stronie
        // max +0.015 przy momentum 100, przy momentum 50 → +0.0075
        const hasMomentumAdvantage = (activeSide === 'HOME' && prev.momentum > 0) || (activeSide === 'AWAY' && prev.momentum < 0);
        if (hasMomentumAdvantage) {
          shotThreshold += (Math.abs(prev.momentum) / 100) * 0.015;
        }

        // Krok 3: pressingIntensity atakującej drużyny - wysoki pressing = więcej okazji
        // pressing 20 (min) → +0.0016 | pressing 50 → +0.004 | pressing 90 (max) → +0.0072
        const attackingTacticForPressing = TacticRepository.getById(
          activeSide === 'HOME' ? nextHomeLineup.tacticId : nextAwayLineup.tacticId
        );
        shotThreshold += (attackingTacticForPressing.pressingIntensity / 100) * 0.008;

        // POGODA: Deszcz karze technicznie słabszą drużynę (śliska piłka, niedokładne podania)
        // Efekt jest WZGLĘDNY — liczy się różnica techniki między atakującymi a broniącymi
        // precipitationChance > 40% = realny deszcz; efekt progresywny od różnicy techniki
        if (env && env.weather.precipitationChance > 40) {
          const getAvgTech = (players: Player[], xi: (string | null)[]): number => {
            const ids = xi.filter((id): id is string => id !== null);
            const active = players.filter(p => ids.includes(p.id));
            if (active.length === 0) return 60;
            return active.reduce((acc, p) => acc + p.attributes.technique, 0) / active.length;
          };
          const attackingPlayers = activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
          const attackingXIW = activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
          const defendingPlayers = activeSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers;
          const defendingXIW = activeSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
          const attTech = getAvgTech(attackingPlayers, attackingXIW);
          const defTech = getAvgTech(defendingPlayers, defendingXIW);
          const techGapW = defTech - attTech; // > 0 = atakujący słabsi technicznie
          if (techGapW > 3) {
            // Progresywna kara: mała różnica → mała kara, duża → większa
            // gap 3-6 → -0.004 | gap 6-10 → -0.007 | gap 10+ → -0.010
            const rainPenalty = techGapW > 10 ? 0.010 : techGapW > 6 ? 0.007 : 0.004;
            // Skalowanie intensywności deszczu (40% = minimalna kara, 100% = pełna)
            const rainIntensity = Math.min(1.0, (env.weather.precipitationChance - 40) / 60);
            shotThreshold = Math.max(0.04, shotThreshold - rainPenalty * rainIntensity);
          }
        }

        // ─── INSTRUKCJE TAKTYCZNE GRACZA → MODYFIKATORY SILNIKA ────────────────
        let nextUserInstructions = { ...prev.userInstructions };
        const uInstr = nextUserInstructions;
        const isUserAttacking = activeSide === userSide;
        const _getXIAvgAttr = (playersList: Player[], xi: (string | null)[], attr: keyof Player['attributes']): number => {
          const ids = xi.filter((id): id is string => id !== null);
          const active = playersList.filter(p => ids.includes(p.id));
          if (active.length === 0) return 60;
          return active.reduce((acc, p) => acc + (p.attributes[attr] as number), 0) / active.length;
        };
        const uPlayersList = userSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
        const uXIList      = userSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
        const oPlayersList = userSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers;
        const oXIList      = userSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
        const uAvgTech = _getXIAvgAttr(uPlayersList, uXIList, 'technique');
        const oAvgTech = _getXIAvgAttr(oPlayersList, oXIList, 'technique');
        const uAvgPace = _getXIAvgAttr(uPlayersList, uXIList, 'pace');
        const oAvgPace = _getXIAvgAttr(oPlayersList, oXIList, 'pace');
        const oppTacticDefBias = TacticRepository.getById(
          userSide === 'HOME' ? nextAwayLineup.tacticId : nextHomeLineup.tacticId
        ).defenseBias;
        const aiOppTacticDefBias = TacticRepository.getById(
          userSide === 'HOME' ? nextHomeLineup.tacticId : nextAwayLineup.tacticId
        ).defenseBias;
        // TEMPO
        if (uInstr.tempo === 'FAST') {
          const rf = uInstr.tempoResponseFactor ?? 1.0;
          if (isUserAttacking) {
            shotThreshold += 0.012 * rf;
          } else {
            const counterBonus = oppTacticDefBias > 60 ? 0.010 : 0.004;
            const techSafetyMod = uAvgTech > 62 ? 0.5 : 1.0;
            shotThreshold += counterBonus * techSafetyMod * rf;
          }
        } else if (uInstr.tempo === 'SLOW') {
          const rf = uInstr.tempoResponseFactor ?? 1.0;
          if (isUserAttacking) {
            shotThreshold += LiveMatchInstructionBalanceService.getSlowTempoModifier(
              uPlayersList, uXIList, oPlayersList, oXIList
            ) * rf;
          }
        }
        // NASTAWIENIE
        if (uInstr.mindset === 'OFFENSIVE') {
          const rf = uInstr.mindsetResponseFactor ?? 1.0;
          if (isUserAttacking) shotThreshold += 0.015 * rf;
          else if (oppTacticDefBias > 65) shotThreshold += 0.012 * rf;
        } else if (uInstr.mindset === 'DEFENSIVE') {
          const rf = uInstr.mindsetResponseFactor ?? 1.0;
          if (!isUserAttacking) {
            shotThreshold -= LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(
              uPlayersList, uXIList, oPlayersList, oXIList
            ) * rf;
          } else {
            shotThreshold -= 0.005 * rf;
          }
        }
        // Modyfikatory intensywności — używane poniżej przy foulu/karnym/kontuzji
        const _irf = uInstr.intensityResponseFactor ?? 1.0;
        const userIntensityRisk = LiveMatchInstructionBalanceService.getIntensityRiskModifiers(
          uInstr.intensity, uPlayersList, uXIList, _irf
        );
        const uInjuryMod = userIntensityRisk.injury;
        // PODANIA
        if (uInstr.passing === 'SHORT') {
          const rf = uInstr.passingResponseFactor ?? 1.0;
          const modifier = LiveMatchInstructionBalanceService.getShortPassingModifier(
            uPlayersList, uXIList, oPlayersList, oXIList, uInstr.tempo === 'FAST'
          ) * rf;
          if (isUserAttacking) shotThreshold += modifier;
          else shotThreshold -= modifier;
        } else if (uInstr.passing === 'LONG') {
          const rf = uInstr.passingResponseFactor ?? 1.0;
          const modifier = LiveMatchInstructionBalanceService.getLongPassingModifier(
            uPlayersList, uXIList, oPlayersList, oXIList, uInstr.tempo === 'FAST'
          ) * rf;
          if (isUserAttacking) shotThreshold += modifier;
          else shotThreshold -= modifier;
        }
        // PRESSING
        if (uInstr.pressing === 'PRESSING') {
          const rf = uInstr.pressingResponseFactor ?? 1.0;
          const modifier = LiveMatchInstructionBalanceService.getPressingModifier(
            uPlayersList, uXIList, oPlayersList, oXIList
          ) * rf;
          if (isUserAttacking) shotThreshold += modifier;
          else shotThreshold -= modifier;
        }
        shotThreshold += LiveMatchInstructionBalanceService.getCombinationModifier(
          uInstr.tempo, uInstr.mindset, uInstr.pressing, uInstr.counterAttack, isUserAttacking
        );
        // ───────────────────────────────────────────────────────────────────────

        // ─── INSTRUKCJE TAKTYCZNE TRENERA AI → MODYFIKATORY SILNIKA ────────────
        if (counterAttackTriggered && isUserAttacking) {
          shotThreshold += counterAttackShotBonus;
        }
        if (aiCounterAttackTriggered && !isUserAttacking) {
          shotThreshold += aiCounterAttackShotBonus;
        }

        let nextAiActiveShout = prev.aiActiveShout;
        let nextAiNextInstructionMinute = prev.aiNextInstructionMinute ?? 10;
        // AI Exploit Window memory:
        // nextAiExploitUntilMinute lets AI keep a targeted pressure instruction active for a
        // short window after the tactical brain detects a player mistake. This prevents the
        // periodic AI decision loop from immediately clearing FAST + OFFENSIVE on the next
        // null decision, while still forcing the pressure to expire naturally.
        //
        // Calibration:
        // - Expiry duration is generated in AiCoachTacticsService. Tune it there first.
        // - Holding conditions below (AI fatigue > 55 and score diff > -3) are safety brakes.
        //   Raise fatigue threshold if AI should abandon pressure sooner when tired.
        //   Tighten score diff if AI should stop exploiting when clearly losing.
        let nextAiExploitUntilMinute = prev.aiExploitUntilMinute ?? -1;
        if (nextAiExploitUntilMinute > 0 && nextMinute > nextAiExploitUntilMinute) {
          nextAiExploitUntilMinute = -1;
        }
        let aiInstructionDecisionTrigger = false;

        if (nextMinute >= nextAiNextInstructionMinute) {
          const aiClub = userSide === 'HOME' ? ctx.awayClub : ctx.homeClub;
          const aiCoach = aiClub?.coachId ? coaches[aiClub.coachId] : null;
          const aiScoreDiff = userSide === 'HOME' ? prev.awayScore - prev.homeScore : prev.homeScore - prev.awayScore;
          const aiMomentum = userSide === 'HOME' ? -prev.momentum : prev.momentum;
          const aiXIForDecision = userSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
          const aiFatigueForDecision = userSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
          const aiActiveFatigues = aiXIForDecision
            .filter((id): id is string => id !== null)
            .map(id => aiFatigueForDecision[id] ?? 100);
          const aiAvgFatigueForDecision = aiActiveFatigues.length > 0
            ? aiActiveFatigues.reduce((acc, value) => acc + value, 0) / aiActiveFatigues.length
            : 100;
          const aiLowestFatigueForDecision = aiActiveFatigues.length > 0 ? Math.min(...aiActiveFatigues) : 100;
          const userXIForDecision = userSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
          const userFatigueForDecision = userSide === 'HOME' ? localHomeFatigue : localAwayFatigue;
          const userActiveFatigues = userXIForDecision
            .filter((id): id is string => id !== null)
            .map(id => userFatigueForDecision[id] ?? 100);
          const userAvgFatigueForDecision = userActiveFatigues.length > 0
            ? userActiveFatigues.reduce((acc, value) => acc + value, 0) / userActiveFatigues.length
            : 100;
          const userLowestFatigueForDecision = userActiveFatigues.length > 0 ? Math.min(...userActiveFatigues) : 100;
          const userKeeperForDecision = userXIForDecision[0]
            ? uPlayersList.find(player => player.id === userXIForDecision[0])
            : null;
          const userGoalkeeperCrisisForDecision = !userKeeperForDecision || userKeeperForDecision.position !== PlayerPosition.GK;
          const aiStatsForDecision = userSide === 'HOME' ? nextLiveStats.away : nextLiveStats.home;
          const userStatsForDecision = userSide === 'HOME' ? nextLiveStats.home : nextLiveStats.away;
          // The AI coach receives a compact snapshot of player-side weaknesses:
          // fatigue, remaining substitutions, red cards, goalkeeper crisis, current tempo,
          // and match pressure. MatchLiveView owns extraction because it has the live lineups,
          // current fatigue maps, and side orientation; AiCoachTacticsService owns the tactical
          // interpretation and coach-quality thresholds.
          const decision = AiCoachTacticsService.decideInMatchInstructions(
            aiScoreDiff, aiMomentum, nextMinute,
            aiCoach?.attributes.decisionMaking ?? 50,
            aiCoach?.attributes.experience ?? 50,
            prev.lastGoalBoostMinute ?? -1,
            currentSeed,
            prev.userInstructions.mindset,
            TacticRepository.getById(userSide === 'HOME' ? nextHomeLineup.tacticId : nextAwayLineup.tacticId).attackBias,
            TacticRepository.getById(userSide === 'HOME' ? nextAwayLineup.tacticId : nextHomeLineup.tacticId).defenseBias,
            {
              aiAvgFatigue: aiAvgFatigueForDecision,
              aiLowestFatigue: aiLowestFatigueForDecision,
              aiShots: aiStatsForDecision.shots,
              userShots: userStatsForDecision.shots,
              aiShotsOnTarget: aiStatsForDecision.shotsOnTarget,
              userShotsOnTarget: userStatsForDecision.shotsOnTarget,
              aiSubsRemaining: 5 - (userSide === 'HOME' ? nextSubsCountAway : nextSubsCountHome),
              userAvgFatigue: userAvgFatigueForDecision,
              userLowestFatigue: userLowestFatigueForDecision,
              userSubsRemaining: 5 - (userSide === 'HOME' ? nextSubsCountHome : nextSubsCountAway),
              userSentOffCount: prev.sentOffIds.filter(id => (userSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers).some(p => p.id === id)).length,
              userGoalkeeperCrisis: userGoalkeeperCrisisForDecision,
              userTempo: prev.userInstructions.tempo,
              aiStakes: aiPressureProfile.stakes,
              userStakes: userPressureProfile.stakes,
              aiRank: aiPressureProfile.rank,
              userRank: userPressureProfile.rank,
              isLateSeason: livePressureContext?.isLateSeason ?? false,
              rivalryMultiplier: livePressureContext?.rivalryMultiplier ?? 1,
              aiSentOffCount: prev.sentOffIds.filter(id => (userSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers).some(p => p.id === id)).length,
              aiPaceAvg: oAvgPace,
              aiTechAvg: oAvgTech,
              userPaceAvg: uAvgPace,
              userTechAvg: uAvgTech
            }
          );
          const shouldHoldExploit =
            !decision &&
            nextAiExploitUntilMinute >= nextMinute &&
            prev.aiActiveShout?.mindset === 'OFFENSIVE' &&
            prev.aiActiveShout?.tempo === 'FAST' &&
            aiAvgFatigueForDecision > 55 &&
            aiScoreDiff > -3;
          if (decision) {
            const { exploitUntilMinute, ...decisionShout } = decision;
            nextAiActiveShout = { id: `ai_${nextMinute}`, ...decisionShout, expiryMinute: -1 };
            nextAiExploitUntilMinute = exploitUntilMinute ?? -1;
          } else if (shouldHoldExploit) {
            nextAiActiveShout = prev.aiActiveShout;
          } else {
            nextAiActiveShout = null;
            nextAiExploitUntilMinute = -1;
          }
          if (decision) {
            const instructionShifted =
              decision.mindset !== prev.aiActiveShout?.mindset ||
              decision.tempo !== prev.aiActiveShout?.tempo ||
              decision.intensity !== prev.aiActiveShout?.intensity ||
              decision.pressing !== prev.aiActiveShout?.pressing ||
              decision.counterAttack !== prev.aiActiveShout?.counterAttack;
            const decisiveInstruction =
              decision.mindset === 'OFFENSIVE' ||
              decision.mindset === 'DEFENSIVE' ||
              decision.pressing === 'PRESSING' ||
              decision.counterAttack === 'COUNTER';
            aiInstructionDecisionTrigger = instructionShifted && decisiveInstruction && nextMinute >= 60;
          }
          const coachReadiness = ((aiCoach?.attributes.decisionMaking ?? 50) + (aiCoach?.attributes.experience ?? 50)) / 2;
          const baseDelay = nextMinute >= 46 && nextMinute <= 75
            ? Math.max(5, Math.round(12 - coachReadiness * 0.06))
            : 10;
          const randomDelay = Math.floor(seededRng(currentSeed, nextMinute, 77) * (nextMinute >= 46 && nextMinute <= 75 ? 6 : 11));
          nextAiNextInstructionMinute = nextMinute + baseDelay + randomDelay;
        }

        const aiShoutMinute = nextAiActiveShout?.id.startsWith('ai_')
          ? parseInt(nextAiActiveShout.id.replace('ai_', ''))
          : 0;
        // Instrukcje AI lacza bazowy roll z ewentualnym efektem przerwy, tak jak u gracza.
        const aiTempoRf     = nextAiActiveShout ? parseFloat(((0.6 + seededRng(currentSeed, aiShoutMinute, 801) * 0.8) * (nextAiActiveShout.tempoResponseFactor ?? 1.0)).toFixed(2)) : 1.0;
        const aiMindsetRf   = nextAiActiveShout ? parseFloat(((0.6 + seededRng(currentSeed, aiShoutMinute, 802) * 0.8) * (nextAiActiveShout.mindsetResponseFactor ?? 1.0)).toFixed(2)) : 1.0;
        const aiPassingRf   = nextAiActiveShout ? parseFloat((0.6 + seededRng(currentSeed, aiShoutMinute, 803) * 0.8).toFixed(2)) : 1.0;
        const aiPressingRf  = nextAiActiveShout ? parseFloat((0.6 + seededRng(currentSeed, aiShoutMinute, 804) * 0.8).toFixed(2)) : 1.0;
        const aiIntensityRf = nextAiActiveShout ? parseFloat(((0.6 + seededRng(currentSeed, aiShoutMinute, 805) * 0.8) * (nextAiActiveShout.intensityResponseFactor ?? 1.0)).toFixed(2)) : 1.0;

        const isAiAttacking = !isUserAttacking;
        if (nextAiActiveShout) {
          if (nextAiActiveShout.tempo === 'FAST') {
            if (isAiAttacking) {
              shotThreshold += 0.012 * aiTempoRf;
            } else {
              const counterBonus = aiOppTacticDefBias > 60 ? 0.010 : 0.004;
              const techSafetyMod = oAvgTech > 62 ? 0.5 : 1.0;
              shotThreshold += counterBonus * techSafetyMod * aiTempoRf;
            }
          } else if (nextAiActiveShout.tempo === 'SLOW' && isAiAttacking) {
            shotThreshold += LiveMatchInstructionBalanceService.getSlowTempoModifier(
              oPlayersList, oXIList, uPlayersList, uXIList
            ) * aiTempoRf;
          }
          if (nextAiActiveShout.mindset === 'OFFENSIVE') {
            if (isAiAttacking) shotThreshold += 0.015 * aiMindsetRf;
            else if (aiOppTacticDefBias > 65) shotThreshold += 0.012 * aiMindsetRf;
          } else if (nextAiActiveShout.mindset === 'DEFENSIVE') {
            if (!isAiAttacking) {
              shotThreshold -= LiveMatchInstructionBalanceService.getDefensiveMindsetModifier(
                oPlayersList, oXIList, uPlayersList, uXIList
              ) * aiMindsetRf;
            } else {
              shotThreshold -= 0.005 * aiMindsetRf;
            }
          }
        }
        // AI PRESSING
        if (nextAiActiveShout?.pressing === 'PRESSING') {
          const modifier = LiveMatchInstructionBalanceService.getPressingModifier(
            oPlayersList, oXIList, uPlayersList, uXIList
          ) * aiPressingRf;
          if (isAiAttacking) shotThreshold += modifier;
          else shotThreshold -= modifier;
        }
        if (nextAiActiveShout) {
          shotThreshold += LiveMatchInstructionBalanceService.getCombinationModifier(
            nextAiActiveShout.tempo,
            nextAiActiveShout.mindset,
            nextAiActiveShout.pressing ?? 'NORMAL',
            nextAiActiveShout.counterAttack,
            isAiAttacking
          );
        }
        if (nextAiActiveShout?.passing === 'SHORT') {
          const modifier = LiveMatchInstructionBalanceService.getShortPassingModifier(
            oPlayersList, oXIList, uPlayersList, uXIList, nextAiActiveShout.tempo === 'FAST'
          ) * aiPassingRf;
          if (isAiAttacking) shotThreshold += modifier;
          else shotThreshold -= modifier;
        } else if (nextAiActiveShout?.passing === 'LONG') {
          const modifier = LiveMatchInstructionBalanceService.getLongPassingModifier(
            oPlayersList, oXIList, uPlayersList, uXIList, nextAiActiveShout.tempo === 'FAST'
          ) * aiPassingRf;
          if (isAiAttacking) shotThreshold += modifier;
          else shotThreshold -= modifier;
        }

        const uFatigueMap = userSide === 'HOME' ? localHomeFatigue : localAwayFatigue;
        const oFatigueMap = userSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
        const userBuildUpProfile = LiveMatchInstructionBalanceService.getBuildUpAccuracyProfile(
          uPlayersList,
          uXIList,
          oPlayersList,
          oXIList,
          uInstr.passing,
          uInstr.tempo,
          nextAiActiveShout?.pressing ?? 'NORMAL',
          uFatigueMap
        );
        const aiBuildUpProfile = LiveMatchInstructionBalanceService.getBuildUpAccuracyProfile(
          oPlayersList,
          oXIList,
          uPlayersList,
          uXIList,
          nextAiActiveShout?.passing ?? 'MIXED',
          nextAiActiveShout?.tempo ?? 'NORMAL',
          uInstr.pressing,
          oFatigueMap
        );
        const activeBuildUpProfile = isUserAttacking ? userBuildUpProfile : aiBuildUpProfile;
        shotThreshold += activeBuildUpProfile.shotModifier;
        const opponentPressingNow = isUserAttacking
          ? nextAiActiveShout?.pressing === 'PRESSING'
          : uInstr.pressing === 'PRESSING';
        shotThreshold -= activeBuildUpProfile.turnoverRisk * (opponentPressingNow ? 0.006 : 0.002);

        const aiIntensityRisk = LiveMatchInstructionBalanceService.getIntensityRiskModifiers(
          nextAiActiveShout?.intensity ?? 'NORMAL', oPlayersList, oXIList, aiIntensityRf
        );
        // ────────────────────────────────────────────────────────────────────────

        // ── CONTACT GOAL BOOST: aplikacja do shotThreshold ─────────────────────
        // Jeśli atakująca drużyna ma aktywny boost kontaktowy → podnosi próg strzału.
        // Boost trwa losowo 5-15 min i wygasa automatycznie (zerowanie wyżej).
        if (nextActiveTacticalBoost !== 0 && nextMinute <= nextTacticalBoostExpiry) {
          const boostSide = nextActiveTacticalBoost > 0 ? 'HOME' : 'AWAY';
          if (boostSide === activeSide) {
            shotThreshold += Math.abs(nextActiveTacticalBoost);
          }
        }

        const activeBriefing =
          prev.preMatchMotivation && nextMinute <= prev.preMatchMotivation.expiryMinute
            ? prev.preMatchMotivation
            : null;
        const activeAiBriefing =
          prev.aiPreMatchMotivation && nextMinute <= prev.aiPreMatchMotivation.expiryMinute
            ? prev.aiPreMatchMotivation
            : null;
        const briefingFinishingFitMod = activeBriefing
          ? Math.max(0.96, Math.min(1.05, 1 + activeBriefing.goalMod * 1.25))
          : 1.0;
        const aiBriefingFinishingFitMod = activeAiBriefing
          ? Math.max(0.96, Math.min(1.05, 1 + activeAiBriefing.goalMod * 1.25))
          : 1.0;
        const briefingFreshnessDelta = activeBriefing
          ? Math.max(-3, Math.min(3, (1 - activeBriefing.fatigueMult) * 45))
          : 0;
        const aiBriefingFreshnessDelta = activeAiBriefing
          ? Math.max(-3, Math.min(3, (1 - activeAiBriefing.fatigueMult) * 45))
          : 0;
        // ────────────────────────────────────────────────────────────────────────

        // PRE-MATCH BRIEFING MOTIVATION — aktywne dopóki nie wygaśnie
        if (activeBriefing) {
          if (isUserAttacking) {
            shotThreshold += activeBriefing.actionMod * 0.12;
            shotThreshold += (1 - activeBriefing.fatigueMult) * 0.04;
          } else if (activeBriefing.rivalBoost !== 0) {
            shotThreshold += activeBriefing.rivalBoost * 0.012;
          }
        }
        if (activeAiBriefing) {
          if (isAiAttacking) {
            shotThreshold += activeAiBriefing.actionMod * 0.12;
            shotThreshold += (1 - activeAiBriefing.fatigueMult) * 0.04;
          } else if (activeAiBriefing.rivalBoost !== 0) {
            shotThreshold += activeAiBriefing.rivalBoost * 0.012;
          }
        }
        // PRE-MATCH BRIEFING — jednorazowy impuls momentum przy minucie 1
        if (nextMinute === 1 && activeBriefing?.momentumBonus && isUserAttacking) {
          shotThreshold += (activeBriefing.momentumBonus / 100) * 0.014;
        }
        if (nextMinute === 1 && activeAiBriefing?.momentumBonus && isAiAttacking) {
          shotThreshold += (activeAiBriefing.momentumBonus / 100) * 0.014;
        }
        shotThreshold = Math.max(
          Math.max(0.050, fatiguedShotFloor - 0.010),
          Math.min(
            0.155,
            (shotThreshold - lateFatigueShotDrag - shotVolumeDrag) *
              clampNumber(activePlayerFormChanceMultiplier, 0.66, 1.34) *
              activePressureMods.shotMultiplier *
              (livePressureContext?.rivalryMultiplier ?? 1)
          )
        );
        const statShotGapDrag = activeShotsSoFar >= 14
          ? Math.min(0.035, (activeShotsSoFar - 13) * 0.007)
          : 0;
        const statPressureChance = Math.max(
          0.075,
          Math.min(
            0.205,
            0.145
              + Math.max(-0.018, Math.min(0.024, getQualityGapCurve(ratingGap) * 0.022))
              + Math.max(-0.014, Math.min(0.018, (attackingTacticObj.attackBias - 50) / 100 * 0.045))
              + (activeMidfieldControlDiff > 0 ? Math.min(0.014, activeMidfieldControlDiff * 0.0010) : -Math.min(0.012, Math.abs(activeMidfieldControlDiff) * 0.0009))
              + (hasMomentumAdvantage ? (Math.abs(prev.momentum) / 100) * 0.010 : 0)
              - lateFatigueShotDrag * 0.35
              - statShotGapDrag
          )
        );
        const statPressureLimit = Math.min(0.42, shotThreshold + statPressureChance);

        let pauseForEvent = false;
        let newLog: MatchLogEntry | null = null;
        let goalTriggered = false;
        let priorityAiTrigger = aiInstructionDecisionTrigger;
        let immediateEventType: MatchEventType | undefined;

        const getCommentary = (type: MatchEventType, playerName?: string) => {
          const pool = MATCH_COMMENTARY_DB[type] || ["Zdarzenie meczowe..."];
          const idx = Math.floor(seededRng(currentSeed, nextMinute, 888) * pool.length);
          let text = pool[idx];
          if (playerName) text = text.replace("{Nazwisko}", playerName);
          return text;
        };

        const processInjury = (injury: MatchEvent) => {
          const isHomeInj = injury.teamSide === 'HOME';
          const pId = injury.primaryPlayerId!;
          const severity = injury.type === MatchEventType.INJURY_SEVERE ? InjurySeverity.SEVERE : InjurySeverity.LIGHT;
          
         if (isHomeInj) {
            nextHomeInjuries[pId] = severity;
            nextHomeInjuryMin[pId] = injury.minute;
            if (severity === InjurySeverity.LIGHT) {
              nextHomeRiskMode[pId] = true;
              localHomeFatigue[pId] = Math.max(0, (localHomeFatigue[pId] || 100) - 25);
            }
            if (severity === InjurySeverity.SEVERE) localHomeFatigue[pId] = 0;
          } else {
            nextAwayInjuries[pId] = severity;
            nextAwayInjuryMin[pId] = injury.minute;
            if (severity === InjurySeverity.LIGHT) {
              nextAwayRiskMode[pId] = true;
              localAwayFatigue[pId] = Math.max(0, (localAwayFatigue[pId] || 100) - 25);
            }
            if (severity === InjurySeverity.SEVERE) localAwayFatigue[pId] = 0;
          }

          const injText = getCommentary(injury.type, injury.text);
          if (!updatedLogs.some(l => l.id === `INJ_${nextMinute}_${pId}`)) updatedLogs = [{ id: `INJ_${nextMinute}_${pId}`, minute: nextMinute, text: injText, type: injury.type, teamSide: injury.teamSide, playerName: injury.text }, ...updatedLogs];
          
          if (severity === InjurySeverity.SEVERE) {
            priorityAiTrigger = true;
            nextIsPaused = true;
          } else {
            const isUserTeam = (isHomeInj && userSide === 'HOME') || (!isHomeInj && userSide === 'AWAY');
            const playerObj = (isHomeInj ? ctx.homePlayers : ctx.awayPlayers).find(p => p.id === pId);
            const mentality = playerObj?.attributes.mentality ?? 50;
            const wantsOffProb = Math.max(0.05, (100 - mentality) / 100 * 0.75);
            const wantsOff = seededRng(currentSeed, nextMinute, 9900) < wantsOffProb;
            if (isUserTeam) {
              if (wantsOff) {
                nextLightInjuryPrompt = { playerId: pId, playerName: injury.text, minute: nextMinute };
                nextIsPaused = true;
              }
            } else {
              const aiCoach = isHomeInj ? ctx.homeCoach : ctx.awayCoach;
              const coachQuality = aiCoach
                ? (aiCoach.attributes.experience * 0.48) + (aiCoach.attributes.decisionMaking * 0.52)
                : 50;
              const currentCondition = (isHomeInj ? localHomeFatigue[pId] : localAwayFatigue[pId]) ?? 100;
              const coachReadsRiskProb = Math.max(0.10, Math.min(0.72, coachQuality / 135 + (currentCondition < 62 ? 0.18 : 0)));
              if (wantsOff || seededRng(currentSeed, nextMinute, 9901) < coachReadsRiskProb) priorityAiTrigger = true;
            }
          }
        };

        const activeIntensityRisk = isUserAttacking ? userIntensityRisk : aiIntensityRisk;
        const uFoulThreshold = 0.043 * activeIntensityRisk.foul * activePressureMods.cardMultiplier * (livePressureContext?.rivalryMultiplier ?? 1);
        if (!forceZeroShotChance && rngEvent < uFoulThreshold) {
           const xi = activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
           const validXi = xi.filter(id => id !== null) as string[];
           const pId = validXi[Math.floor(seededRng(currentSeed, nextMinute, 1500) * validXi.length)];
           const player = (activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers).find(p => p.id === pId)!;
           if (!player) return prev; // Jeśli zawodnik zniknął (np. czerwona kartka), przerwij akcję
           const isPenalty = seededRng(currentSeed, nextMinute, 1700) < (0.0956 * activeIntensityRisk.penalty * activePressureMods.penaltyMultiplier);

           if (isPenalty) {
              const attackingSide = activeSide === 'HOME' ? 'AWAY' : 'HOME';
              const defendingSide = activeSide;
              const kickerTeam = attackingSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;

            const kickerXI = (attackingSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter(id => id !== null) as string[];
              const keeperTeam = defendingSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
              const keeperXI = (defendingSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter(id => id !== null) as string[];

              const _designatedPK = attackingSide === 'HOME' ? ctx.homeClub.penaltyTakerId : ctx.awayClub.penaltyTakerId;
              const kicker = (_designatedPK ? kickerTeam.find(p => p.id === _designatedPK && kickerXI.includes(p.id)) : null) ?? GoalAttributionService.pickScorer(kickerTeam, kickerXI, false, () => seededRng(currentSeed, nextMinute, 1800));
              const keeper = keeperTeam.find(p => p.id === keeperXI[0]) || keeperTeam[0];

              if (!kicker || !keeper || !kicker.attributes || !keeper.attributes) return prev;

              const penaltyCallChance = getPenaltyCallChance(env.ref);
              const refereeGivesPenalty = seededRng(currentSeed, nextMinute, 1710) < penaltyCallChance;

              nextIsPausedForEvent = true;
              if (refereeGivesPenalty) {
                const reason: PenaltyReviewReason = seededRng(currentSeed, nextMinute, 1712) < 0.42 ? 'HAND_BALL' : 'FOUL';
                const usesVar = seededRng(currentSeed, nextMinute, 1714) < 0.48;
                const varOverturnChance = clampNumber(
                  0.18 - ((getRefereeDecisionQuality(env.ref) - 50) * 0.0012),
                  0.08,
                  0.28
                );
                const verdict: PenaltyReviewVerdict = usesVar && seededRng(currentSeed, nextMinute, 1716) < varOverturnChance ? 'NO_PENALTY' : 'PENALTY';
                const baseCard = reason === 'FOUL'
                  ? DisciplineService.evaluateFoul(env.ref, player, nextPlayerYellowCards[pId] || 0, () => seededRng(currentSeed, nextMinute, 1718))
                  : (seededRng(currentSeed, nextMinute, 1720) < 0.22 ? MatchEventType.YELLOW_CARD : MatchEventType.FOUL);
                const card = verdict === 'PENALTY' ? baseCard : MatchEventType.FOUL;

                setActivePenaltyReview({
                  side: attackingSide,
                  defendingSide,
                  kicker,
                  keeper,
                  defender: player,
                  minute: nextMinute,
                  reason,
                  phase: 'INCIDENT',
                  verdict,
                  usesVar,
                  card
                });
                immediateEventType = verdict === 'PENALTY' ? MatchEventType.PENALTY_AWARDED : MatchEventType.FOUL;
                
                const attackingTeamName = attackingSide === 'HOME' ? ctx.homeClub.shortName : ctx.awayClub.shortName;
                const incidentText = reason === 'HAND_BALL'
                  ? `${attackingTeamName} domaga się karnego za zagranie ręką! Sędzia wskazuje na 11 metr.`
                  : `${kicker.lastName} faulowany w polu karnym! Sędzia wskazuje na 11 metr.`;
                newLog = { id: `PEN_INCIDENT_${nextMinute}`, minute: nextMinute, text: `👉 ${incidentText}`, type: verdict === 'PENALTY' ? MatchEventType.PENALTY_AWARDED : MatchEventType.GENERIC, teamSide: attackingSide, playerName: kicker.lastName };

                if (verdict === 'PENALTY') {
                  if (defendingSide === 'HOME') nextLiveStats.home.fouls++;
                  else nextLiveStats.away.fouls++;
                  const injury = InjuryEventGenerator.maybeGenerateInjury(ctx, prev, { minute: nextMinute, teamSide: attackingSide, type: MatchEventType.PENALTY_AWARDED, text: '' } as MatchEvent, () => seededRng(currentSeed, nextMinute, 2000));
                  if (injury) processInjury(injury);
                }
              } else {
                immediateEventType = MatchEventType.FOUL;
                setActivePenaltyNoCall({ side: attackingSide, playerName: kicker.lastName, minute: nextMinute });
                newLog = {
                  id: `PEN_NO_CALL_${nextMinute}`,
                  minute: nextMinute,
                  text: `Kontakt w polu karnym! ${kicker.lastName} pada na murawę, ale sędzia każe grać dalej.`,
                  type: MatchEventType.GENERIC,
                  teamSide: attackingSide,
                  playerName: kicker.lastName
                };
              }
           } else {
              if (activeSide === 'HOME') nextLiveStats.home.fouls++;
              else nextLiveStats.away.fouls++;
              const card = DisciplineService.evaluateFoul(env.ref, player, nextPlayerYellowCards[pId] || 0, () => seededRng(currentSeed, nextMinute, 1600));

              if (card === MatchEventType.YELLOW_CARD) {
                 nextPlayerYellowCards[pId] = (nextPlayerYellowCards[pId] || 0) + 1;
                 immediateEventType = MatchEventType.YELLOW_CARD;
                 if (nextPlayerYellowCards[pId] === 2 && !prev.sentOffIds.includes(pId)) {
                    nextSentOffIds.push(pId);
                    if (activeSide === 'HOME') nextHomeLineup.startingXI = nextHomeLineup.startingXI.map(id => id === pId ? null : id);
                    else nextAwayLineup.startingXI = nextAwayLineup.startingXI.map(id => id === pId ? null : id);
                    newLog = { id: `RED_${nextMinute}`, minute: nextMinute, text: `🟥 DRUGA ŻÓŁTA! ${player.lastName} wylatuje z boiska!`, type: MatchEventType.RED_CARD, teamSide: activeSide, playerId: pId, playerName: player.lastName };
                    priorityAiTrigger = true;
                    immediateEventType = MatchEventType.RED_CARD;
                    if (activeSide === userSide) nextIsPaused = true;
                 } else if (nextPlayerYellowCards[pId] !== 2) {
                    newLog = { id: `YEL_${nextMinute}`, minute: nextMinute, text: `🟨 Żółta kartka: ${player.lastName}`, type: MatchEventType.YELLOW_CARD, teamSide: activeSide, playerId: pId, playerName: player.lastName };
                 }
              } else if (card === MatchEventType.RED_CARD && !prev.sentOffIds.includes(pId)) {
                 nextSentOffIds.push(pId);
                 immediateEventType = MatchEventType.RED_CARD;
                 if (activeSide === 'HOME') nextHomeLineup.startingXI = nextHomeLineup.startingXI.map(id => id === pId ? null : id);
                 else nextAwayLineup.startingXI = nextAwayLineup.startingXI.map(id => id === pId ? null : id);
                 newLog = { id: `RED_DIR_${nextMinute}`, minute: nextMinute, text: `🟥 CZERWONA KARTKA! ${player.lastName}!`, type: MatchEventType.RED_CARD, teamSide: activeSide, playerId: pId, playerName: player.lastName };
                 priorityAiTrigger = true;
                 if (activeSide === userSide) nextIsPaused = true;
             } else {
                 immediateEventType = MatchEventType.FOUL;
                 newLog = { id: `FOUL_${nextMinute}`, minute: nextMinute, text: `${getCommentary(MatchEventType.FOUL, player.lastName)}`, type: MatchEventType.FOUL, teamSide: activeSide };
              }

              if (newLog) {
                const injury = InjuryEventGenerator.maybeGenerateInjury(ctx, prev, { minute: nextMinute, teamSide: activeSide, type: MatchEventType.FOUL, text: '' } as MatchEvent, () => seededRng(currentSeed, nextMinute, 2000));
                if (injury) processInjury(injury);
              }
           }
        } 
       else if (forceZeroShotChance || rngEvent < shotThreshold) {
           const team = activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
           const xi = activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
           const oppTeam = activeSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers;
           const oppXi = activeSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
      const scorer = GoalAttributionService.pickScorer(team, xi as string[], false, () => seededRng(currentSeed, nextMinute, 700));
           if (!scorer) return prev;
           const assistant = GoalAttributionService.pickAssistant(team, xi as string[], scorer.id, false, () => seededRng(currentSeed, nextMinute, 720));
           
           // Bezpieczne pobieranie bramkarza
           const gk = oppTeam.find(p => p.id === oppXi[0]);
           const defs = oppTeam.filter(p => oppXi.slice(1, 6).includes(p.id));

           // Live fatigue strzelca i bramkarza
           const oppFatigueMap = activeSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
           const myFatigueMap  = activeSide === 'HOME' ? localHomeFatigue : localAwayFatigue;
           const scorerLiveFatigue = myFatigueMap[scorer.id]  ?? 100;
           const gkLiveFatigue     = gk ? (oppFatigueMap[gk.id] ?? 100) : 100;

           // Position Fit Modifier - kara za grę poza naturalną pozycją
           const computePosFitMod = (player: Player, slotRole: PlayerPosition, useSecondaryPosition: boolean): number => {
             const penaltyFactor = PlayerPositionFitService.getPenaltyFactor(player, slotRole, useSecondaryPosition);
             if (penaltyFactor === 0) return 1.0;
             const naturalPos = player.position;
             const gkMismatch = naturalPos === PlayerPosition.GK || slotRole === PlayerPosition.GK;
             if (gkMismatch) return 0.45;
             const baseMod = ((naturalPos === PlayerPosition.DEF && slotRole === PlayerPosition.FWD) ||
                 (naturalPos === PlayerPosition.FWD && slotRole === PlayerPosition.DEF)) ? 0.75 : 0.88;
             return 1 - ((1 - baseMod) * penaltyFactor);
           };
            const attackingLineup = activeSide === 'HOME' ? nextHomeLineup : nextAwayLineup;
            const defendingLineup = activeSide === 'HOME' ? nextAwayLineup : nextHomeLineup;
            const attackingTactic = TacticRepository.getById(attackingLineup.tacticId);
            const defendingTactic = TacticRepository.getById(defendingLineup.tacticId);
            const scorerSlotIdx   = attackingLineup.startingXI.indexOf(scorer.id);
            const scorerSlotRole  = scorerSlotIdx !== -1 ? attackingTactic.slots[scorerSlotIdx].role : scorer.position;
            const scorerFitMod    = computePosFitMod(scorer, scorerSlotRole, true);
           // Brak bramkarza (pusty slot 0): gkFitMod 0.01 = niemal pewny gol
           const gkFitMod        = gk ? (gk.position === PlayerPosition.GK ? 1.0 : 0.45) : 0.01;
           const scorerBriefingFatigue = activeSide === userSide
             ? Math.max(0, Math.min(100, scorerLiveFatigue + briefingFreshnessDelta))
             : activeSide !== userSide
               ? Math.max(0, Math.min(100, scorerLiveFatigue + aiBriefingFreshnessDelta))
             : scorerLiveFatigue;
            const scorerBriefingFitMod = activeSide === userSide
              ? scorerFitMod * briefingFinishingFitMod
              : activeSide !== userSide
                ? scorerFitMod * aiBriefingFinishingFitMod
              : scorerFitMod;
            const scorerCounterFitMod = (counterAttackTriggered && activeSide === userSide) || (aiCounterAttackTriggered && activeSide !== userSide)
              ? scorerBriefingFitMod * 1.06
              : scorerBriefingFitMod;
            const scorerFormBoost = 1 + ((activeFormImpact.finishingMultiplier - 1) * activeFormStacking);
            const gkFormBoost = 1 + ((defendingFormImpact.goalkeepingMultiplier - 1) * defendingFormStacking);
            const playerFormFinishingBoost = clampNumber(activePlayerFormImpact.performanceMultiplier, 0.78, 1.22);
            const playerFormGoalkeepingBoost = clampNumber(defendingPlayerFormImpact.performanceMultiplier, 0.82, 1.18);
            const actionProfile = MatchActionService.evaluateOpenPlayAction({
              attackingPlayers: team,
              defendingPlayers: oppTeam,
              attackingLineup,
              defendingLineup,
              attackingTactic,
              defendingTactic,
              attackingFatigue: myFatigueMap,
              defendingFatigue: oppFatigueMap,
              scorer,
              assistant,
              isCounterAttack: (counterAttackTriggered && activeSide === userSide) || (aiCounterAttackTriggered && activeSide !== userSide),
              rng: () => seededRng(currentSeed, nextMinute, 760),
            });
            const scorerTeamFormFitMod = scorerCounterFitMod * scorerFormBoost * playerFormFinishingBoost * actionProfile.finishingFitMod;
            const gkTeamFormFitMod = gkFitMod * gkFormBoost * playerFormGoalkeepingBoost;

            // Jeśli bramkarza nie ma w slocie (chwila po czerwonej kartce), strzał ma ogromną szansę na gola
            const isGoal = GoalAttributionService.checkShotSuccess(
             scorer,
             gk as Player,
             defs,
             false,
             () => seededRng(currentSeed, nextMinute, 750),
              false,
              scorerBriefingFatigue,
              gkLiveFatigue,
              scorerTeamFormFitMod,
              gkTeamFormFitMod,
               oppFatigueMap
             );
            const actionContributionBoost = { ...actionProfile.contributions };
            if (isGoal) {
              actionContributionBoost[scorer.id] = (actionContributionBoost[scorer.id] ?? 0) + 0.55;
              if (assistant) actionContributionBoost[assistant.id] = (actionContributionBoost[assistant.id] ?? 0) + 0.35;
            } else if (gk && actionProfile.dangerLabel !== 'chaotic') {
              actionContributionBoost[gk.id] = (actionContributionBoost[gk.id] ?? 0) + (actionProfile.dangerLabel === 'big' ? 0.28 : 0.14);
            }
            nextActionContributions = MatchActionService.mergeContributions(nextActionContributions, actionContributionBoost);
           

           if (isGoal) {
              const goalInfo = { 
                playerName: scorer.lastName,
                scorerId: scorer.id,
                minute: nextMinute, 
                isPenalty: false,
                assistantName: assistant?.lastName,
                assistantId: assistant?.id
              };
   if (activeSide === 'HOME') { 
                nextHomeScore++; 
                newHomeGoals.push(goalInfo);
                // Zliczanie gola jako strzału celnego
                nextLiveStats.home.shots++;
                nextLiveStats.home.shotsOnTarget++;
              }
              else { 
                nextAwayScore++; 
                newAwayGoals.push(goalInfo);
                nextLiveStats.away.shots++;
                nextLiveStats.away.shotsOnTarget++;
              }
              const counterPrefix = (counterAttackTriggered && activeSide === userSide) || (aiCounterAttackTriggered && activeSide !== userSide) ? 'Kontra! ' : '';
              newLog = { id: `GOAL_${nextMinute}`, minute: nextMinute, text: `⚽ ${counterPrefix}${getCommentary(MatchEventType.GOAL, scorer.lastName)}${assistant ? ` (Asystował: ${assistant.lastName})` : ''}`, type: MatchEventType.GOAL, teamSide: activeSide, playerName: scorer.lastName };
              goalTriggered = true; priorityAiTrigger = true; immediateEventType = MatchEventType.GOAL;

              // ── CONTACT GOAL BOOST: detekcja i przyznanie boosta ───────────────
              // Bramka kontaktowa = strzelająca drużyna była w tyle przed tym golem.
              // Im bliżej remisu tym silniejszy boost bazowy.
              // Im lepsza drużyna tym efektywniej wykorzystuje impet (factor 0.75–1.25).
              // Konwencja zapisu: HOME > 0, AWAY < 0 (jeden number w stanie).
              {
                const _prevScoringScore = activeSide === 'HOME' ? prev.homeScore : prev.awayScore;
                const _prevOppScore     = activeSide === 'HOME' ? prev.awayScore : prev.homeScore;
                if (_prevScoringScore < _prevOppScore) {
                  const _newDiff   = (_prevOppScore - _prevScoringScore) - 1; // różnica PO bramce
                  const _baseBoost = _newDiff === 0 ? 0.020 : _newDiff === 1 ? 0.013 : 0.007;
                  // Siła drużyny: średni overallRating XI (zakres 55-80 → factor 0.75-1.25)
                  const _scoringPlayers = activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
                  const _scoringXI = (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter((id): id is string => id !== null);
                  const _avgRating = _scoringXI.length > 0
                    ? _scoringPlayers
                        .filter(p => _scoringXI.includes(p.id))
                        .reduce((acc, p) => acc + (p.overallRating * PlayerMoraleService.getMatchMultiplier(p)), 0) / _scoringXI.length
                    : 60;
                  const _teamFactor  = 0.75 + Math.max(0, Math.min(1, (_avgRating - 55) / 25)) * 0.5;
                  const _finalBoost  = parseFloat((_baseBoost * _teamFactor).toFixed(4));
                  // Czas trwania: losowo 5–15 minut (seededRng dla powtarzalności)
                  const _boostDuration = 5 + Math.floor(seededRng(currentSeed, nextMinute, 9901) * 11);
                  // Zapis: HOME = +value, AWAY = -value
                  nextActiveTacticalBoost = activeSide === 'HOME' ? _finalBoost : -_finalBoost;
                  nextTacticalBoostExpiry = nextMinute + _boostDuration;
                  nextLastGoalBoostMinute = nextMinute;
                }
              }
              // ────────────────────────────────────────────────────────────────────
          } else {
              const failRng = seededRng(currentSeed, nextMinute, 780);
              let failType = MatchEventType.SHOT_ON_TARGET;
              if (failRng < 0.08) failType = MatchEventType.SHOT_POST;
              else if (failRng < 0.16) failType = MatchEventType.SHOT_BAR;
              else if (failRng < 0.26) failType = MatchEventType.ONE_ON_ONE_SAVE;
              else if (failRng < 0.36) failType = MatchEventType.ONE_ON_ONE_MISS;
              else if (failRng < 0.44) failType = MatchEventType.SAVE;
              else if (failRng < 0.54) failType = MatchEventType.WINGER_STOPPED;
              else if (failRng > 0.85) failType = MatchEventType.SHOT;
              if (actionProfile.dangerLabel === 'big' && failType === MatchEventType.SHOT) failType = MatchEventType.ONE_ON_ONE_MISS;
              if (actionProfile.dangerLabel === 'clear' && failType === MatchEventType.WINGER_STOPPED) failType = MatchEventType.SHOT_ON_TARGET;
              if (actionProfile.dangerLabel === 'chaotic' && failType === MatchEventType.SHOT_ON_TARGET) failType = MatchEventType.SHOT;
              const shotAccuracyRoll = seededRng(currentSeed, nextMinute, 790);
              if (actionProfile.shotOnTargetBoost > 0 && failType === MatchEventType.SHOT && shotAccuracyRoll < actionProfile.shotOnTargetBoost * 3) {
                failType = MatchEventType.SHOT_ON_TARGET;
              } else if (actionProfile.shotOnTargetBoost < 0 && failType !== MatchEventType.SHOT && shotAccuracyRoll < Math.abs(actionProfile.shotOnTargetBoost) * 2) {
                failType = MatchEventType.SHOT;
              }

              // Inkrementacja strzałów niecelnych i celnych (bez gola)
              if (activeSide === 'HOME') {
                nextLiveStats.home.shots++;
                if (failType !== MatchEventType.SHOT) nextLiveStats.home.shotsOnTarget++;
              } else {
                nextLiveStats.away.shots++;
                if (failType !== MatchEventType.SHOT) nextLiveStats.away.shotsOnTarget++;
              }

              immediateEventType = failType;
              const counterPrefix = (counterAttackTriggered && activeSide === userSide) || (aiCounterAttackTriggered && activeSide !== userSide) ? 'Kontra! ' : '';
              newLog = { id: `MISS_${nextMinute}`, minute: nextMinute, text: `${counterPrefix}${getCommentary(failType, scorer.lastName)}`, type: failType, teamSide: activeSide };
           }
           pauseForEvent = isGoal;

           if (newLog) {
             const injury = InjuryEventGenerator.maybeGenerateInjury(ctx, prev, { minute: nextMinute, teamSide: activeSide, type: immediateEventType, primaryPlayerId: scorer.id, text: '' } as MatchEvent, () => seededRng(currentSeed, nextMinute, 2500));
             if (injury) processInjury(injury);
           }
        }
        else if (rngEvent < statPressureLimit) {
          const statRng = seededRng(currentSeed, nextMinute, 910);
          const activeStats = activeSide === 'HOME' ? nextLiveStats.home : nextLiveStats.away;
          const targetSideStats = activeSide === 'HOME' ? nextLiveStats.home : nextLiveStats.away;
          const statTeam = activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
          const statLineup = activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
          const statActiveIds = statLineup.filter((id): id is string => id !== null);
          const statPlayerId = statActiveIds[Math.floor(seededRng(currentSeed, nextMinute, 914) * statActiveIds.length)];
          const statPlayer = statTeam.find(p => p.id === statPlayerId);
          // Chaotyczne strzały są celowo odpięte od OVR. Nawet słabsze ligi produkują dobitki,
          // półszanse i uderzenia po niedokładnych akcjach; jakość ma decydować głównie o bramkach.
          const chaosShotShare = activeStats.shots < 5
            ? 0.24
            : activeStats.shots < 9
              ? 0.16
              : activeStats.shots < 13
                ? 0.09
                : 0.04;
          const cornerShare = 0.26 + Math.max(0, Math.min(0.05, (activeStats.shots - activeStats.corners) * 0.006));
          const foulShare = 0.12 + Math.max(0, Math.min(0.06, (70 - attackingTacticObj.defenseBias) * 0.0015));

          if (statRng < chaosShotShare) {
            targetSideStats.shots++;
            const strengthEdge = Math.max(-1, Math.min(1, ratingGap / 18));
            // Chaos shot może dać bramkę, ale ma zostać rzadką dobitką/zamieszaniem:
            // podobne siły ~3.2%, mocny faworyt do ~6.4%, wyraźny outsider min. ~1.2%.
            const chaosGoalChance = Math.max(0.012, Math.min(0.064, 0.032 + strengthEdge * 0.022));
            const isChaosGoal = seededRng(currentSeed, nextMinute, 920) < chaosGoalChance;
            const onTargetChance = 0.24 + seededRng(currentSeed, nextMinute, 916) * 0.16 + (strengthEdge * 0.04);
            const shotType = isChaosGoal || seededRng(currentSeed, nextMinute, 918) < onTargetChance
              ? MatchEventType.SHOT_ON_TARGET
              : MatchEventType.SHOT;
            if (shotType === MatchEventType.SHOT_ON_TARGET) targetSideStats.shotsOnTarget++;
            immediateEventType = shotType;
            if (isChaosGoal && statPlayer) {
              const goalInfo = {
                playerName: statPlayer.lastName,
                scorerId: statPlayer.id,
                minute: nextMinute,
                isPenalty: false
              };
              if (activeSide === 'HOME') {
                nextHomeScore++;
                newHomeGoals.push(goalInfo);
              } else {
                nextAwayScore++;
                newAwayGoals.push(goalInfo);
              }
              newLog = {
                id: `CHAOS_GOAL_${nextMinute}`,
                minute: nextMinute,
                text: `⚽ Chaos w polu karnym! ${statPlayer.lastName} wykorzystuje zamieszanie i pakuje piłkę do siatki!`,
                type: MatchEventType.GOAL,
                teamSide: activeSide,
                playerName: statPlayer.lastName
              };
              goalTriggered = true;
              priorityAiTrigger = true;
              pauseForEvent = true;
              immediateEventType = MatchEventType.GOAL;
            } else if (seededRng(currentSeed, nextMinute, 922) < 0.18) {
              newLog = {
                id: `STAT_SHOT_${nextMinute}`,
                minute: nextMinute,
                text: getCommentary(shotType, statPlayer?.lastName || ''),
                type: shotType,
                teamSide: activeSide,
                playerName: statPlayer?.lastName
              };
            }
          } else if (statRng < chaosShotShare + cornerShare) {
            targetSideStats.corners++;
            immediateEventType = MatchEventType.CORNER;
            if (seededRng(currentSeed, nextMinute, 924) < 0.16) {
              newLog = {
                id: `STAT_CORNER_${nextMinute}`,
                minute: nextMinute,
                text: getCommentary(MatchEventType.CORNER, statPlayer?.lastName || ''),
                type: MatchEventType.CORNER,
                teamSide: activeSide,
                playerName: statPlayer?.lastName
              };
            }
          } else if (statRng < chaosShotShare + cornerShare + foulShare) {
            targetSideStats.fouls++;
            immediateEventType = MatchEventType.FOUL;
          } else {
            targetSideStats.offsides++;
            immediateEventType = MatchEventType.OFFSIDE;
          }
        }
        else if (rngEvent < 0.32) { // [było 0.42 — obniżono proporcjonalnie do shotThreshold, aby zmniejszyć liczbę rzutów rożnych/autów bez wpływu na gole]
          const flavorRng = seededRng(currentSeed, nextMinute, 900);
         let type = MatchEventType.MIDFIELD_CONTROL;
          if (flavorRng < 0.25) type = MatchEventType.CORNER;
          else if (flavorRng < 0.12) type = MatchEventType.THROW_IN;
          else if (flavorRng < 0.19) type = MatchEventType.DRIBBLING;
          else if (flavorRng < 0.26) type = MatchEventType.MISPLACED_PASS;
          else if (flavorRng < 0.32) type = MatchEventType.BLUNDER;
          else if (flavorRng < 0.40) type = MatchEventType.PLAY_LEFT;
          else if (flavorRng < 0.48) type = MatchEventType.PLAY_RIGHT;
          else if (flavorRng < 0.54) type = MatchEventType.PLAY_BACK;
          else if (flavorRng < 0.60) type = MatchEventType.PLAY_SIDE;
          else if (flavorRng < 0.66) type = MatchEventType.STUMBLE;
          else if (flavorRng < 0.72) type = MatchEventType.OFFSIDE;
          else if (flavorRng < 0.78) type = MatchEventType.PRESSURE;
          else if (flavorRng < 0.84) type = MatchEventType.FREE_KICK;
          else if (flavorRng < 0.90) type = MatchEventType.FOUL_PUSH;
          else if (flavorRng < 0.95) type = MatchEventType.FOUL_JERSEY;
          else type = MatchEventType.GK_LONG_THROW;

       if (type === MatchEventType.CORNER) {
            if (activeSide === 'HOME') nextLiveStats.home.corners++;
            else nextLiveStats.away.corners++;

            // Krok 5: Rzut rożny → szansa na strzał głową zależy od atrybutu corners wykonawcy
            const _cornerTakers = (activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers).filter(p => (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).includes(p.id));
            const _bestCornerAttr = _cornerTakers.length > 0 ? Math.max(..._cornerTakers.map(p => p.attributes.corners)) : 50;
            const _cornerTaker = _cornerTakers.sort((a, b) => b.attributes.corners - a.attributes.corners)[0];
            const _cornerShotChance = 0.10 + (_bestCornerAttr / 100) * 0.30;
            if (seededRng(currentSeed, nextMinute, 3300) < _cornerShotChance) {
              const cornerTeam   = activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
              const cornerXI     = (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter(id => id !== null) as string[];
              const cornerOppTeam = activeSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers;
              const cornerOppXI   = (activeSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI).filter(id => id !== null) as string[];
              const headerScorer = GoalAttributionService.pickScorer(cornerTeam, cornerXI, true, () => seededRng(currentSeed, nextMinute, 3400));
              if (headerScorer) {
                const cornerGk   = cornerOppTeam.find(p => p.id === cornerOppXI[0]);
                const cornerDefs = cornerOppTeam.filter(p => cornerOppXI.slice(1, 6).includes(p.id));
                const hScorerFat = (activeSide === 'HOME' ? localHomeFatigue : localAwayFatigue)[headerScorer.id] ?? 100;
                const hGkFat     = cornerGk ? ((activeSide === 'HOME' ? localAwayFatigue : localHomeFatigue)[cornerGk.id] ?? 100) : 100;
                // Brak bramkarza przy rożnym — tak samo niemal pewny gol
                const hGkFitMod  = cornerGk ? (cornerGk.position === PlayerPosition.GK ? 1.0 : 0.45) : 0.01;
                const cornerOppFatigue = activeSide === 'HOME' ? localAwayFatigue : localHomeFatigue;
                const headerBriefingFatigue = activeSide === userSide
                  ? Math.max(0, Math.min(100, hScorerFat + briefingFreshnessDelta))
                  : activeSide !== userSide
                    ? Math.max(0, Math.min(100, hScorerFat + aiBriefingFreshnessDelta))
                  : hScorerFat;
                const headerBriefingFitMod = activeSide === userSide
                  ? briefingFinishingFitMod
                  : activeSide !== userSide
                    ? aiBriefingFinishingFitMod
                  : 1.0;
                const headerFormBoost = 1 + ((activeFormImpact.finishingMultiplier - 1) * activeFormStacking);
                const headerGkBoost = 1 + ((defendingFormImpact.goalkeepingMultiplier - 1) * defendingFormStacking);
                const headerTeamFormFitMod = headerBriefingFitMod * headerFormBoost * clampNumber(activePlayerFormImpact.performanceMultiplier, 0.80, 1.20);
                const headerGkFormFitMod = hGkFitMod * headerGkBoost * clampNumber(defendingPlayerFormImpact.performanceMultiplier, 0.84, 1.16);
                const isHeaderGoal = GoalAttributionService.checkShotSuccess(
                  headerScorer, cornerGk as Player, cornerDefs, true,
                  () => seededRng(currentSeed, nextMinute, 3500),
                  false, headerBriefingFatigue, hGkFat, headerTeamFormFitMod, headerGkFormFitMod, cornerOppFatigue
                );
                nextActionContributions = MatchActionService.mergeContributions(nextActionContributions, {
                  [headerScorer.id]: isHeaderGoal ? 0.45 : 0.12,
                  ...(_cornerTaker ? { [_cornerTaker.id]: isHeaderGoal ? 0.25 : 0.08 } : {}),
                  ...(cornerGk && !isHeaderGoal ? { [cornerGk.id]: 0.12 } : {}),
                });
                if (isHeaderGoal) {
                  if (activeSide === 'HOME') {
                    nextHomeScore++;
                    newHomeGoals.push({ playerName: headerScorer.lastName, scorerId: headerScorer.id, minute: nextMinute, isPenalty: false });
                    nextLiveStats.home.shots++;
                    nextLiveStats.home.shotsOnTarget++;
                  } else {
                    nextAwayScore++;
                    newAwayGoals.push({ playerName: headerScorer.lastName, scorerId: headerScorer.id, minute: nextMinute, isPenalty: false });
                    nextLiveStats.away.shots++;
                    nextLiveStats.away.shotsOnTarget++;
                  }
                  newLog = { id: `CORNER_GOAL_${nextMinute}`, minute: nextMinute, text: `⚽ Gol po rzucie rożnym! ${headerScorer.lastName} wbija głową!`, type: MatchEventType.GOAL, teamSide: activeSide, playerName: headerScorer.lastName };
                  goalTriggered = true;
                  priorityAiTrigger = true;
                  immediateEventType = MatchEventType.GOAL;
                } else {
                  if (activeSide === 'HOME') nextLiveStats.home.shots++;
                  else nextLiveStats.away.shots++;
                }
              }
            }
          }
          if (type === MatchEventType.FREE_KICK && seededRng(currentSeed, nextMinute, 5100) < 0.18) {
            const fkTeam = activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
            const fkXI = (activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI).filter(id => id !== null) as string[];
            const fkOppTeam = activeSide === 'HOME' ? ctx.awayPlayers : ctx.homePlayers;
            const fkOppXI = (activeSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI).filter(id => id !== null) as string[];
            const _designatedFK = ctx.homeClub && ctx.awayClub ? (activeSide === 'HOME' ? ctx.homeClub.freeKickTakerId : ctx.awayClub.freeKickTakerId) : null;
            const fkTaker = (_designatedFK ? fkTeam.find(p => p.id === _designatedFK && fkXI.includes(p.id)) : null) ?? fkTeam.filter(p => fkXI.includes(p.id)).sort((a, b) => b.attributes.freeKicks - a.attributes.freeKicks)[0];
            if (fkTaker) {
              const fkGk = fkOppTeam.find(p => p.id === fkOppXI[0]);
              const fkGkAttr = fkGk?.attributes.goalkeeping ?? 50;
              const fkFormAttMod = 1 + ((activeFormImpact.finishingMultiplier - 1) * activeFormStacking);
              const fkFormDefMod = 1 + ((defendingFormImpact.goalkeepingMultiplier - 1) * defendingFormStacking);
              const fkMoraleMod = PlayerMoraleService.getMatchMultiplier(fkTaker);
              const fkGkMoraleMod = fkGk ? PlayerMoraleService.getMatchMultiplier(fkGk) : 1;
              const fkGoalProb = Math.max(
                0.05,
                Math.min(0.30, 0.50 + (((fkTaker.attributes.freeKicks * fkFormAttMod * fkMoraleMod) * 1.05) - ((fkGkAttr * fkFormDefMod * fkGkMoraleMod) * 1.20)) / 300)
              );
              if (seededRng(currentSeed, nextMinute, 5200) < fkGoalProb) {
                nextActionContributions = MatchActionService.mergeContributions(nextActionContributions, { [fkTaker.id]: 0.55 });
                if (activeSide === 'HOME') {
                  nextHomeScore++;
                  newHomeGoals.push({ playerName: fkTaker.lastName, scorerId: fkTaker.id, minute: nextMinute, isPenalty: false });
                  nextLiveStats.home.shots++;
                  nextLiveStats.home.shotsOnTarget++;
                } else {
                  nextAwayScore++;
                  newAwayGoals.push({ playerName: fkTaker.lastName, scorerId: fkTaker.id, minute: nextMinute, isPenalty: false });
                  nextLiveStats.away.shots++;
                  nextLiveStats.away.shotsOnTarget++;
                }
                newLog = { id: `FK_GOAL_${nextMinute}`, minute: nextMinute, text: `⚽ Gol z rzutu wolnego! ${fkTaker.lastName} nie daje szans bramkarzowi!`, type: MatchEventType.GOAL, teamSide: activeSide, playerName: fkTaker.lastName };
                goalTriggered = true;
                priorityAiTrigger = true;
                immediateEventType = MatchEventType.GOAL;
              } else {
                nextActionContributions = MatchActionService.mergeContributions(nextActionContributions, {
                  [fkTaker.id]: 0.10,
                  ...(fkGk ? { [fkGk.id]: 0.10 } : {}),
                });
                if (activeSide === 'HOME') nextLiveStats.home.shots++;
                else nextLiveStats.away.shots++;
              }
            }
          }
          if (type === MatchEventType.OFFSIDE) {
            if (activeSide === 'HOME') nextLiveStats.home.offsides++;
            else nextLiveStats.away.offsides++;
          }
          immediateEventType = type;
          const flavorTeam = activeSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
          const flavorLineup = activeSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
          const flavorActiveIds = flavorLineup.filter(id => id !== null);
          const flavorPlayerId = flavorActiveIds[Math.floor(seededRng(currentSeed, nextMinute, 777) * flavorActiveIds.length)];
          const flavorPlayer = flavorTeam.find(p => p.id === flavorPlayerId);
          newLog = { id: `FLAVOR_${nextMinute}`, minute: nextMinute, text: getCommentary(type, flavorPlayer?.lastName || ''), type: type, teamSide: activeSide };
        }

        const accidentalInjurySides: Array<{
          side: 'HOME' | 'AWAY';
          pressure: typeof hLivePressure;
          instructionInjuryMod: number;
          rollOffset: number;
          pickOffset: number;
          severityOffset: number;
        }> = [
          {
            side: 'HOME',
            pressure: hLivePressure,
            instructionInjuryMod: userSide === 'HOME' ? userIntensityRisk.injury : aiIntensityRisk.injury,
            rollOffset: 4500,
            pickOffset: 4700,
            severityOffset: 4800,
          },
          {
            side: 'AWAY',
            pressure: aLivePressure,
            instructionInjuryMod: userSide === 'AWAY' ? userIntensityRisk.injury : aiIntensityRisk.injury,
            rollOffset: 4550,
            pickOffset: 4750,
            severityOffset: 4850,
          },
        ];

        accidentalInjurySides.forEach(({ side, pressure, instructionInjuryMod, rollOffset, pickOffset, severityOffset }) => {
          const threshold = 0.0032 * ((instructionInjuryMod + 1.0) / 2) * pressure.injuryMultiplier;
          if (seededRng(currentSeed, nextMinute, rollOffset) >= threshold) return;

          const pool = side === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
          const lineup = side === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
          const activeInjMap = side === 'HOME' ? nextHomeInjuries : nextAwayInjuries;
          const healthyOnPitch = pool.filter(p => lineup.includes(p.id) && !activeInjMap[p.id]);
          if (healthyOnPitch.length === 0) return;

          const victim = healthyOnPitch[Math.floor(seededRng(currentSeed, nextMinute, pickOffset) * healthyOnPitch.length)];
          const isSevere = seededRng(currentSeed, nextMinute, severityOffset) < 0.15;
          processInjury({
            minute: nextMinute,
            teamSide: side,
            type: isSevere ? MatchEventType.INJURY_SEVERE : MatchEventType.INJURY_LIGHT,
            primaryPlayerId: victim.id,
            text: victim.lastName
          } as MatchEvent);
        });

        // --- Progresywne ryzyko kontuzji na podstawie kondycji (poniżej 70%) ---
        const staminaInjurySides: Array<{ side: 'HOME' | 'AWAY', lineup: (string | null)[], injuries: Record<string, InjurySeverity>, fatMap: Record<string, number>, pool: Player[] }> = [
          { side: 'HOME', lineup: nextHomeLineup.startingXI, injuries: nextHomeInjuries, fatMap: localHomeFatigue, pool: ctx.homePlayers },
          { side: 'AWAY', lineup: nextAwayLineup.startingXI, injuries: nextAwayInjuries, fatMap: localAwayFatigue, pool: ctx.awayPlayers },
        ];
        staminaInjurySides.forEach(({ side, lineup, injuries, fatMap, pool }, sideIdx) => {
          lineup.forEach((id, slotIdx) => {
            if (!id || injuries[id]) return;
            const stamina = fatMap[id] ?? 100;
            if (stamina >= 64) return;
            let pStamina = 0;
            if (stamina >= 50) {
              pStamina = ((70 - stamina) / 20) * 0.50;
            } else if (stamina >= 15) {
              pStamina = 0.50 + ((50 - stamina) / 35) * 0.40;
            } else {
              pStamina = 0.90;
            }
            if (seededRng(currentSeed, nextMinute, 5000 + sideIdx * 100 + slotIdx) < pStamina) {
              const p = pool.find(px => px.id === id);
              if (!p) return;
              const isSevere = seededRng(currentSeed, nextMinute, 5200 + sideIdx * 100 + slotIdx) < 0.22;
              processInjury({
                minute: nextMinute,
                teamSide: side,
                type: isSevere ? MatchEventType.INJURY_SEVERE : MatchEventType.INJURY_LIGHT,
                primaryPlayerId: id,
                text: p.lastName
              } as MatchEvent);
            }
          });
        });
        // --- koniec progresywnego ryzyka ---

        const upgrades = InjuryUpgradeService.checkUpgrades(ctx, prev, () => seededRng(currentSeed, nextMinute, 3000));
        upgrades.forEach(upg => processInjury(upg));

        const carriedOffLogs: MatchLogEntry[] = [];
        const autoRemoveInjured = (lineup: (string | null)[], injuries: Record<string, InjurySeverity>, side: 'HOME' | 'AWAY', forceAiRemoval: boolean = false) => {
               const subsCount = side === 'HOME' ? nextSubsCountHome : nextSubsCountAway;
               const isUserWithoutSubs = side === userSide && subsCount >= 5;
               const isAiWithoutSubs = side !== userSide && subsCount >= 5;
          
          if (side === userSide && !isUserWithoutSubs) return lineup;
          if (side !== userSide && !isAiWithoutSubs && !forceAiRemoval) return lineup;

          return lineup.map(id => {
            if (id && injuries[id] === InjurySeverity.SEVERE) {
               const p = (side === 'HOME' ? ctx.homePlayers : ctx.awayPlayers).find(px => px.id === id);
               carriedOffLogs.push({
                 id: `CARRIED_${nextMinute}_${id}`,
                 minute: nextMinute,
                 text: side === userSide 
                    ? `🚑 ${p?.lastName} zniesiony na noszach! Brak zmian - gramy w osłabieniu!` 
                    : `🚨 ${p?.lastName} zostaje zniesiony na noszach! Drużyna gra w dziesiątkę!`,
                 type: MatchEventType.GENERIC,
                 teamSide: side
               });
               return null;
            }
            return id;
          });
        };
        nextHomeLineup.startingXI = autoRemoveInjured(nextHomeLineup.startingXI, nextHomeInjuries, 'HOME');
        nextAwayLineup.startingXI = autoRemoveInjured(nextAwayLineup.startingXI, nextAwayInjuries, 'AWAY');
        updatedLogs = [...carriedOffLogs, ...updatedLogs];

        if (goalTriggered) {
          const lastGoal = activeSide === 'HOME' ? newHomeGoals[newHomeGoals.length - 1] : newAwayGoals[newAwayGoals.length - 1];
          const canTriggerVAR = !lastGoal?.isPenalty;
          if (canTriggerVAR) {
            varDataRef.current = { side: activeSide, scorerName: lastGoal?.playerName || '', minute: nextMinute };
          }
          setIsCelebratingGoal(true);
          setTimeout(() => {
            setIsCelebratingGoal(false);
            const vd = varDataRef.current;
            if (vd && Math.random() < 0.2) {
              setActiveVAR({ ...vd, phase: 'CHECKING' });
            }
            varDataRef.current = null;
          }, 3500);
        }

        const briefingMomentumImpulse =
          nextMinute === 1
            ? (activeBriefing?.momentumBonus ?? 0) * (userSide === 'HOME' ? 1 : -1)
              + (activeAiBriefing?.momentumBonus ?? 0) * (aiSide === 'HOME' ? 1 : -1)
            : 0;
        const rawMomentumUpdate = MomentumService.computeMomentum(ctx, { ...prev, minute: nextMinute, momentum: prev.momentum, homeLineup: nextHomeLineup, awayLineup: nextAwayLineup }, immediateEventType, activeSide, localHomeFatigue, localAwayFatigue, env?.weather);
        const momentumUpdate = Math.max(-100, Math.min(100, rawMomentumUpdate + briefingMomentumImpulse));

     if (priorityAiTrigger) {
           let aiFixedSevere = false;
           let aiDecisionIterations = 0;

           while (aiDecisionIterations < 5) {
           const decision = AiMatchDecisionService.makeDecisions({ ...prev, minute: nextMinute, homeScore: nextHomeScore, awayScore: nextAwayScore, sentOffIds: nextSentOffIds, homeLineup: nextHomeLineup, awayLineup: nextAwayLineup, homeInjuries: nextHomeInjuries, awayInjuries: nextAwayInjuries, homeFatigue: localHomeFatigue, awayFatigue: localAwayFatigue, lastAiActionMinute: nextLastAiActionMinute, lastAiSubMinute: nextLastAiSubMinute, lastAiFormationMinute: nextLastAiFormationMinute, aiTacticLockUntilMinute: nextAiTacticLockUntilMinute, aiTacticLocked: nextAiTacticLocked, aiLateTacticChanges: nextAiLateTacticChanges, aiLateTacticScoreDiffAtLastChange: nextAiLateTacticScoreDiffAtLastChange, homeSubsHistory: nextHomeSubsHistory, awaySubsHistory: nextAwaySubsHistory, subsCountHome: nextSubsCountHome, subsCountAway: nextSubsCountAway }, ctx, aiSide, true, false, aiLateMatchContext);
           
           // TUTAJ WSTAW TEN KOD - Obsługa wewnętrznych przesunięć (np. gracz z pola na bramkę)
           if (decision.newLineup) {
              if (aiSide === 'HOME') nextHomeLineup = decision.newLineup;
              else nextAwayLineup = decision.newLineup;
           }

           if (decision.subRecord) {
              const subbedId = decision.subRecord.playerOutId;
              const severityWas = (aiSide === 'HOME' ? nextHomeInjuries : nextAwayInjuries)[subbedId];
              
              if (aiSide === 'HOME') { 
                nextHomeLineup = decision.newLineup || nextHomeLineup; 
                nextSubsCountHome = decision.newSubsCount ?? nextSubsCountHome; 
                nextHomeSubsHistory = [...nextHomeSubsHistory, decision.subRecord];
                delete nextHomeRiskMode[decision.subRecord.playerOutId];
              }
              else { 
                nextAwayLineup = decision.newLineup || nextAwayLineup; 
                nextSubsCountAway = decision.newSubsCount ?? nextSubsCountAway; 
                nextAwaySubsHistory = [...nextAwaySubsHistory, decision.subRecord]; 
                delete nextAwayRiskMode[decision.subRecord.playerOutId];
              }

              if (severityWas === InjurySeverity.SEVERE || subbedId === 'NONE') aiFixedSevere = true;
           }
           if (decision.newTacticId) {
              if (aiSide === 'HOME') nextHomeLineup = decision.newLineup || nextHomeLineup;
              else nextAwayLineup = decision.newLineup || nextAwayLineup;
           }
           if (decision.lastAiActionMinute !== undefined) nextLastAiActionMinute = decision.lastAiActionMinute;
           if (decision.lastAiSubMinute !== undefined) nextLastAiSubMinute = decision.lastAiSubMinute;
           if (decision.lastAiFormationMinute !== undefined) nextLastAiFormationMinute = decision.lastAiFormationMinute;
           if (decision.aiTacticLockUntilMinute !== undefined) nextAiTacticLockUntilMinute = decision.aiTacticLockUntilMinute;
           if (decision.aiLateTacticChanges !== undefined) nextAiLateTacticChanges = decision.aiLateTacticChanges;
           if (decision.aiLateTacticScoreDiffAtLastChange !== undefined) nextAiLateTacticScoreDiffAtLastChange = decision.aiLateTacticScoreDiffAtLastChange;
           nextAiTacticLocked = nextAiTacticLockUntilMinute > nextMinute || !!decision.aiTacticLocked;
           if (decision.logs) {
              decision.logs.forEach(l => {
                 updatedLogs = [{ id: `AI_LOG_${nextMinute}_${Math.random()}`, minute: nextMinute, text: l, type: MatchEventType.GENERIC, teamSide: aiSide }, ...updatedLogs];
              });
           }

           aiDecisionIterations++;
           const aiLineup = aiSide === 'HOME' ? nextHomeLineup : nextAwayLineup;
           const aiInjuries = aiSide === 'HOME' ? nextHomeInjuries : nextAwayInjuries;
           const aiSubsCount = aiSide === 'HOME' ? nextSubsCountHome : nextSubsCountAway;
           const hasSevereAiInjuryOnPitch = aiLineup.startingXI.some(id => id && aiInjuries[id] === InjurySeverity.SEVERE);
           const hasFillableAiGap = aiSubsCount < 5 && aiLineup.startingXI.some(id => id === null);
           if (!decision.subRecord || (!hasSevereAiInjuryOnPitch && !hasFillableAiGap)) break;
           }

           if (aiFixedSevere) {
              const injuredUserOnPitch = (userSide === 'HOME' ? nextHomeLineup : nextAwayLineup).startingXI.some(id => id && (userSide === 'HOME' ? nextHomeInjuries : nextAwayInjuries)[id] === InjurySeverity.SEVERE);
              if (!injuredUserOnPitch) {
                 nextIsPaused = false;
              }
           }
        }

        const lateCarriedOffLogStart = carriedOffLogs.length;
        nextHomeLineup.startingXI = autoRemoveInjured(nextHomeLineup.startingXI, nextHomeInjuries, 'HOME');
        nextAwayLineup.startingXI = autoRemoveInjured(nextAwayLineup.startingXI, nextAwayInjuries, 'AWAY');
        if (priorityAiTrigger) {
          if (aiSide === 'HOME') {
            nextHomeLineup.startingXI = autoRemoveInjured(nextHomeLineup.startingXI, nextHomeInjuries, 'HOME', true);
          } else {
            nextAwayLineup.startingXI = autoRemoveInjured(nextAwayLineup.startingXI, nextAwayInjuries, 'AWAY', true);
          }
        }
        const lateCarriedOffLogs = carriedOffLogs.slice(lateCarriedOffLogStart);
        if (lateCarriedOffLogs.length > 0) {
          updatedLogs = [...lateCarriedOffLogs, ...updatedLogs];
        }

        const fatigue = MatchEngineService.calculateFatigueStep({
          ...prev,
          momentum: momentumUpdate,
          homeLineup: nextHomeLineup,
          awayLineup: nextAwayLineup,
          homeFatigue: localHomeFatigue,
          awayFatigue: localAwayFatigue,
          homeInjuries: nextHomeInjuries,
          awayInjuries: nextAwayInjuries,
          sentOffIds: nextSentOffIds,
          subsCountHome: nextSubsCountHome,
          subsCountAway: nextSubsCountAway,
          homeSubsHistory: nextHomeSubsHistory,
          awaySubsHistory: nextAwaySubsHistory,
        }, ctx, env.weather);
        
        const uFatExtra = LiveMatchInstructionBalanceService.getInstructionFatigueExtra(
          uInstr.tempo,
          uInstr.intensity,
          uInstr.pressing,
          uInstr.tempoResponseFactor ?? 1.0,
          uInstr.intensityResponseFactor ?? 1.0,
          uInstr.pressingResponseFactor ?? 1.0
        );
        if (uFatExtra !== 0) {
          const uXIForFat = userSide === 'HOME' ? nextHomeLineup.startingXI : nextAwayLineup.startingXI;
          const uFatTarget = userSide === 'HOME' ? fatigue.home : fatigue.away;
          const uSubsUsed = userSide === 'HOME' ? nextSubsCountHome : nextSubsCountAway;
          const uFatigueMultiplier = uFatExtra > 0
            ? getLiveInstructionFatigueMultiplier(
                nextMinute,
                uInstr.tempo,
                uInstr.intensity,
                uInstr.pressing,
                env.weather,
                uSubsUsed,
                uXIForFat,
                uFatTarget
              )
            : 1;
          uXIForFat.filter((id): id is string => id !== null).forEach(id => {
            uFatTarget[id] = Math.min(100, Math.max(0, (uFatTarget[id] ?? 100) - (uFatExtra * uFatigueMultiplier)));
          });
        }
        const aiFatExtra = nextAiActiveShout
          ? LiveMatchInstructionBalanceService.getInstructionFatigueExtra(
              nextAiActiveShout.tempo,
              nextAiActiveShout.intensity,
              nextAiActiveShout.pressing ?? 'NORMAL',
              aiTempoRf,
              aiIntensityRf,
              aiPressingRf
            )
          : 0;
        if (aiFatExtra !== 0) {
          const aiXIForFat = userSide === 'HOME' ? nextAwayLineup.startingXI : nextHomeLineup.startingXI;
          const aiFatTarget = userSide === 'HOME' ? fatigue.away : fatigue.home;
          const aiSubsUsed = userSide === 'HOME' ? nextSubsCountAway : nextSubsCountHome;
          const aiPressing = nextAiActiveShout?.pressing ?? 'NORMAL';
          const aiFatigueMultiplier = aiFatExtra > 0 && nextAiActiveShout
            ? getLiveInstructionFatigueMultiplier(
                nextMinute,
                nextAiActiveShout.tempo,
                nextAiActiveShout.intensity,
                aiPressing,
                env.weather,
                aiSubsUsed,
                aiXIForFat,
                aiFatTarget
              )
            : 1;
          aiXIForFat.filter((id): id is string => id !== null).forEach(id => {
            aiFatTarget[id] = Math.min(100, Math.max(0, (aiFatTarget[id] ?? 100) - (aiFatExtra * aiFatigueMultiplier)));
          });
        }
        if (hLivePressure.fatigueDrainExtra > 0) {
          nextHomeLineup.startingXI.filter((id): id is string => id !== null).forEach(id => {
            fatigue.home[id] = Math.max(0, (fatigue.home[id] ?? 100) - hLivePressure.fatigueDrainExtra);
          });
        }
        if (aLivePressure.fatigueDrainExtra > 0) {
          nextAwayLineup.startingXI.filter((id): id is string => id !== null).forEach(id => {
            fatigue.away[id] = Math.max(0, (fatigue.away[id] ?? 100) - aLivePressure.fatigueDrainExtra);
          });
        }
        Object.keys(nextHomeInjuries).forEach(id => { if (nextHomeInjuries[id] === InjurySeverity.SEVERE) fatigue.home[id] = 0; });
        Object.keys(nextAwayInjuries).forEach(id => { if (nextAwayInjuries[id] === InjurySeverity.SEVERE) fatigue.away[id] = 0; });

        if (newLog && !updatedLogs.some(l => l.id === newLog!.id)) updatedLogs = [newLog, ...updatedLogs];

        // WALKOWER: drużyna z ≤7 zawodnikami i bez dostępnych zmian przegrywa 3-0
        const homeOnPitch = nextHomeLineup.startingXI.filter(id => id !== null).length;
        const awayOnPitch = nextAwayLineup.startingXI.filter(id => id !== null).length;
        const homeWalkover = homeOnPitch <= 7 && nextSubsCountHome >= 5;
        const awayWalkover = awayOnPitch <= 7 && nextSubsCountAway >= 5;

        if (homeWalkover || awayWalkover) {
          const walText = (homeWalkover && awayWalkover)
            ? `⛔ Obie drużyny mają zbyt mało zawodników. Mecz zakończony.`
            : homeWalkover
              ? `⛔ ${ctx.homeClub.name} ma tylko ${homeOnPitch} zawodników! Walkower – ${ctx.awayClub.name} wygrywa 3:0!`
              : `⛔ ${ctx.awayClub.name} ma tylko ${awayOnPitch} zawodników! Walkower – ${ctx.homeClub.name} wygrywa 3:0!`;
          const walLog: MatchLogEntry = { id: `WALKOVER_${nextMinute}`, minute: nextMinute, text: walText, type: MatchEventType.GENERIC };
          const finalHomeScore = (homeWalkover && !awayWalkover) ? 0 : (!homeWalkover && awayWalkover) ? 3 : nextHomeScore;
          const finalAwayScore = (!homeWalkover && awayWalkover) ? 0 : (homeWalkover && !awayWalkover) ? 3 : nextAwayScore;
          return {
            ...prev,
            minute: nextMinute, addedTime: currentAddedTime,
            homeScore: finalHomeScore, awayScore: finalAwayScore,
            homeGoals: newHomeGoals, awayGoals: newAwayGoals,
            momentum: momentumUpdate, momentumSum: nextMomentumSum, momentumTicks: nextMomentumTicks,
            liveStats: nextLiveStats,
            actionContributions: nextActionContributions,
            homeFatigue: fatigue.home, awayFatigue: fatigue.away,
            homeLineup: nextHomeLineup, awayLineup: nextAwayLineup,
            playerYellowCards: nextPlayerYellowCards, sentOffIds: nextSentOffIds,
            logs: [walLog, ...updatedLogs],
            isFinished: true, isPaused: true, isPausedForEvent: false, isHalfTime: false,
            subsCountHome: nextSubsCountHome, subsCountAway: nextSubsCountAway,
            homeSubsHistory: nextHomeSubsHistory, awaySubsHistory: nextAwaySubsHistory,
            lastAiActionMinute: nextLastAiActionMinute,
            lastAiSubMinute: nextLastAiSubMinute,
            lastAiFormationMinute: nextLastAiFormationMinute,
            aiTacticLockUntilMinute: nextAiTacticLockUntilMinute,
            aiLateTacticChanges: nextAiLateTacticChanges,
            aiLateTacticScoreDiffAtLastChange: nextAiLateTacticScoreDiffAtLastChange,
            aiTacticLocked: nextAiTacticLocked,
            homeInjuries: nextHomeInjuries, awayInjuries: nextAwayInjuries,
            homeRiskMode: nextHomeRiskMode, awayRiskMode: nextAwayRiskMode,
            homeInjuryMin: nextHomeInjuryMin, awayInjuryMin: nextAwayInjuryMin,
            homeUpgradeProb: nextHomeUpgradeProb, awayUpgradeProb: nextAwayUpgradeProb,
            lightInjuryPrompt: null,
            userInstructions: nextUserInstructions,
            activeTacticalBoost: 0, tacticalBoostExpiry: -1, lastGoalBoostMinute: nextLastGoalBoostMinute,
            aiActiveShout: nextAiActiveShout,
            aiNextInstructionMinute: nextAiNextInstructionMinute,
            aiExploitUntilMinute: nextAiExploitUntilMinute,
          };
        }

        
return {
           ...prev, 
           minute: nextMinute, 
           addedTime: currentAddedTime, 
           homeScore: nextHomeScore, 
           awayScore: nextAwayScore,
           homeGoals: newHomeGoals, 
           awayGoals: newAwayGoals, 
           momentum: momentumUpdate,
           momentumSum: nextMomentumSum, 
            momentumTicks: nextMomentumTicks, 
            liveStats: nextLiveStats,
            actionContributions: nextActionContributions,
            homeFatigue: fatigue.home, 
           awayFatigue: fatigue.away, 
           homeLineup: nextHomeLineup, 
           awayLineup: nextAwayLineup,
           playerYellowCards: nextPlayerYellowCards, 
           sentOffIds: nextSentOffIds, 
           logs: updatedLogs,
           isPaused: nextIsPaused, 
           isPausedForEvent: (pauseForEvent && !goalTriggered) || nextIsPausedForEvent, 
           subsCountHome: nextSubsCountHome, 
           subsCountAway: nextSubsCountAway,
           homeSubsHistory: nextHomeSubsHistory, 
           awaySubsHistory: nextAwaySubsHistory,
           lastAiActionMinute: nextLastAiActionMinute,
           lastAiSubMinute: nextLastAiSubMinute,
           lastAiFormationMinute: nextLastAiFormationMinute,
           aiTacticLockUntilMinute: nextAiTacticLockUntilMinute,
           aiLateTacticChanges: nextAiLateTacticChanges,
           aiLateTacticScoreDiffAtLastChange: nextAiLateTacticScoreDiffAtLastChange,
           aiTacticLocked: nextAiTacticLocked,
           homeInjuries: nextHomeInjuries, 
           awayInjuries: nextAwayInjuries,
           homeRiskMode: nextHomeRiskMode,
           awayRiskMode: nextAwayRiskMode,
           homeInjuryMin: nextHomeInjuryMin,
           awayInjuryMin: nextAwayInjuryMin,
           lightInjuryPrompt: nextLightInjuryPrompt,
           homeUpgradeProb: nextHomeUpgradeProb,
           awayUpgradeProb: nextAwayUpgradeProb,
           userInstructions: nextUserInstructions,
           activeTacticalBoost: nextActiveTacticalBoost,
           tacticalBoostExpiry: nextTacticalBoostExpiry,
           lastGoalBoostMinute: nextLastGoalBoostMinute,
           aiActiveShout: nextAiActiveShout,
           aiNextInstructionMinute: nextAiNextInstructionMinute,
           aiExploitUntilMinute: nextAiExploitUntilMinute,
        };


      });
    }, tickInterval);
    return () => clearInterval(interval);
  }, [matchState?.isPaused, matchState?.isPausedForEvent, matchState?.isFinished, matchState?.isHalfTime, matchState?.speed, isCelebratingGoal, ctx, env, userSide, livePressureContext, isTacticsOpen, activePenalty, activePenaltyReview, activeVAR, activePenaltyNoCall, hasMandatorySub, setMatchState]);

 const handleFinishMatch = () => {
    if (!matchState || !ctx) return;

    const simResult = BackgroundMatchProcessor.processLeagueEvent(currentDate, userTeamId, fixtures, clubs, players, lineups, seasonNumber, coaches);
    // TUTAJ WSTAW TEN KOD
    // Obliczamy ranking ligowy gracza dla potrzeb frekwencji
    const leagueClubs = clubs.filter(c => c.leagueId === ctx.homeClub.leagueId);
    const sortedStandings = [...leagueClubs].sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
    const homeRank = sortedStandings.findIndex(c => c.id === ctx.homeClub.id) + 1;
    
    // Obliczamy frekwencję (korzystając z pogody zdefiniowanej w env.weather)
    const leaderPoints = sortedStandings[0]?.stats.points ?? 0;
    const isTitleRace = homeRank <= 3 && ctx.homeClub.stats.played >= 27 && (leaderPoints - ctx.homeClub.stats.points) <= 9;
    const attendance = AttendanceService.calculate(ctx.homeClub, homeRank, env!.weather, ctx.awayClub, isTitleRace);

    // NAPRAWKA DUPLIKACJI WYNIKÓW:
    // Priorytet: wyniki z advanceDay (jeśli już uruchomił się dla daty meczu)
    // Fallback: wyniki z processLeagueEvent powyżej (jeśli advanceDay jeszcze nie uruchomił się)
    const fixtureDateKey = ctx.fixture.date.toDateString();
    const bgFromAdvanceDay = roundResults[fixtureDateKey];
    const bgFromProcessor = simResult.roundResults;
    const bgSource = bgFromAdvanceDay || bgFromProcessor || { dateKey: currentDate.toDateString(), league1Results: [], league2Results: [], league3Results: [] };

    DebugLoggerService.separator('handleFinishMatch');
    DebugLoggerService.log('FINISH', `fixtureDateKey=${fixtureDateKey} | currentDate=${currentDate.toDateString()}`);
    DebugLoggerService.log('FINISH', `bgFromAdvanceDay=${bgFromAdvanceDay?.league1Results?.length ?? 'null'} | bgFromProcessor=${bgFromProcessor?.league1Results?.length ?? 'null'} | bgSource=${bgSource.league1Results.length}`);
    DebugLoggerService.log('FINISH', `roundResults keys in state: ${Object.keys(roundResults).join(', ')}`);
    Object.entries(roundResults).forEach(([k, v]) => {
      DebugLoggerService.log('FINISH', `  key=${k} L1=${v.league1Results.length} L2=${v.league2Results.length} L3=${v.league3Results.length}`);
      v.league1Results.forEach((r, i) => DebugLoggerService.log('FINISH', `    L1[${i}]: ${r.homeTeamName} vs ${r.awayTeamName} ${r.homeScore}:${r.awayScore}`));
    });

    // Wyniki przechowywane pod currentDate.toDateString() - to samo co czyta PostMatchStudioView
    const finalRoundResults = {
      dateKey: currentDate.toDateString(),
      league1Results: [...bgSource.league1Results],
      league2Results: [...bgSource.league2Results],
      league3Results: [...bgSource.league3Results],
    };
    const userMatchResult: MatchResult = { homeTeamName: ctx.homeClub.name, awayTeamName: ctx.awayClub.name, homeScore: matchState.homeScore, awayScore: matchState.awayScore, homeColors: ctx.homeClub.colorsHex, awayColors: ctx.awayClub.colorsHex };
    const lid = ctx.fixture.leagueId;
    if (lid === 'L_PL_1') finalRoundResults.league1Results.push(userMatchResult);
    else if (lid === 'L_PL_2') finalRoundResults.league2Results.push(userMatchResult);
    else if (lid === 'L_PL_3') finalRoundResults.league3Results.push(userMatchResult);

   let updatedPlayers = { ...simResult.updatedPlayers };

    // TUTAJ WSTAW TEN KOD - Poprawna identyfikacja wszystkich zawodników (Starterzy + Zmiennicy)
    const getPlayedIds = (lineup: any, history: SubstitutionRecord[]) => {
      const currentOnPitch = lineup.startingXI.filter((id: any) => id !== null) as string[];
      const subbedOut = history.map(s => s.playerOutId).filter(id => id !== 'NONE' && id !== '??');
      return new Set([...currentOnPitch, ...subbedOut]);
    };

    const playedIdsHome = getPlayedIds(matchState.homeLineup, matchState.homeSubsHistory);
    const playedIdsAway = getPlayedIds(matchState.awayLineup, matchState.awaySubsHistory);
    updatedPlayers = PlayerStatsService.processMatchDayEndForClub(updatedPlayers, ctx.homeClub.id, Array.from(playedIdsHome) as string[]);
    updatedPlayers = PlayerStatsService.processMatchDayEndForClub(updatedPlayers, ctx.awayClub.id, Array.from(playedIdsAway) as string[]);

  const applyFatigueDebtToSquad = (squad: Player[], playedIds: Set<string>) => {
      return squad.map(p => {
        if (playedIds.has(p.id)) {
          const stamina = p.attributes.stamina || 50;
          const gkDebtFactor = p.position === PlayerPosition.GK
            ? Math.max(0.70, Math.min(0.90, 0.75 + Math.max(0, (p.age - 27) * 0.004) - (stamina / 100) * 0.05))
            : 1;
          const matchDebt = (5 + ((100 - stamina) * 0.15)) * gkDebtFactor;
          return { ...p, fatigueDebt: Math.min(100, (p.fatigueDebt || 0) + matchDebt) };
        }
        return p;
      });
    };
    updatedPlayers[ctx.homeClub.id] = applyFatigueDebtToSquad(updatedPlayers[ctx.homeClub.id], playedIdsHome);
    updatedPlayers[ctx.awayClub.id] = applyFatigueDebtToSquad(updatedPlayers[ctx.awayClub.id], playedIdsAway);

    matchState.homeGoals.filter(g => !g.varDisallowed).forEach(g => {
       const pFound = ctx.homePlayers.find(px => px.lastName === g.playerName);
       if (pFound) updatedPlayers = PlayerStatsService.applyGoal(updatedPlayers, pFound.id, g.assistantId);
    });
    matchState.awayGoals.filter(g => !g.varDisallowed).forEach(g => {
       const pFound = ctx.awayPlayers.find(px => px.lastName === g.playerName);
       if (pFound) updatedPlayers = PlayerStatsService.applyGoal(updatedPlayers, pFound.id, g.assistantId);
    });

    Object.entries(matchState.playerYellowCards).forEach(([pId, count]) => {
       for (let i = 0; i < (count as number); i++) updatedPlayers = PlayerStatsService.applyCard(updatedPlayers, pId, MatchEventType.YELLOW_CARD);
    });
    matchState.sentOffIds.forEach(pId => updatedPlayers = PlayerStatsService.applyCard(updatedPlayers, pId, MatchEventType.RED_CARD));

    const applyInjuriesToSquad = (squad: Player[], sideInjuries: Record<string, InjurySeverity>, sideInMins: Record<string, number>) => {
      return squad.map(p => {
        if (sideInjuries[p.id]) {
          const sev = sideInjuries[p.id];
          const isSev = sev === InjurySeverity.SEVERE;
          const { days, type } = rollInjuryBySeverity(sev, Math.random);
          
       const penalty = isSev ? (Math.floor(Math.random() * 31) + 60) : (Math.floor(Math.random() * 26) + 10);
          const condAfterPenalty = Math.max(0, p.condition - penalty);
          return {
            ...p,
            health: {
              status: HealthStatus.INJURED,
              injury: { 
                type, 
                daysRemaining: days, 
                severity: sev,
                injuryDate: currentDate.toISOString(), // -> tutaj wstaw kod
                totalDays: days,
                conditionAtInjury: condAfterPenalty
              }
            },
            condition: condAfterPenalty
          };
        }
        return p;
      });
    };

    updatedPlayers[ctx.homeClub.id] = applyInjuriesToSquad(updatedPlayers[ctx.homeClub.id], matchState.homeInjuries, matchState.homeInjuryMin);
    updatedPlayers[ctx.awayClub.id] = applyInjuriesToSquad(updatedPlayers[ctx.awayClub.id], matchState.awayInjuries, matchState.awayInjuryMin);

    const applyMatchMoraleToSquad = (
      squad: Player[],
      side: 'HOME' | 'AWAY',
      resultChar: 'W' | 'R' | 'P'
    ) => {
      const activeIds = new Set([
        ...(side === 'HOME' ? matchState.homeLineup.startingXI : matchState.awayLineup.startingXI).filter((id): id is string => !!id),
        ...matchState.playedPlayerIds,
      ]);
      const sideGoals = side === 'HOME' ? matchState.homeGoals : matchState.awayGoals;
      const sideScore = side === 'HOME' ? matchState.homeScore : matchState.awayScore;
      const oppScore = side === 'HOME' ? matchState.awayScore : matchState.homeScore;
      const scoreDiff = sideScore - oppScore;
      const teamDelta = resultChar === 'W' ? (scoreDiff >= 2 ? 5 : 3) : resultChar === 'P' ? (scoreDiff <= -3 ? -6 : -3) : 0;

      return squad.map(player => {
        const withMorale = PlayerMoraleService.ensurePlayerState(player);
        let delta = activeIds.has(player.id) ? teamDelta : Math.round(teamDelta * 0.45);
        const scored = sideGoals.some(goal => goal.scorerId === player.id || goal.playerName === player.lastName);
        const assisted = sideGoals.some(goal => goal.assistantId === player.id);
        const cards = (matchState.playerYellowCards[player.id] || 0) + (matchState.sentOffIds.includes(player.id) ? 2 : 0);

        if (scored) delta += 3;
        if (assisted) delta += 2;
        if (cards > 0) delta -= cards;
        if (!activeIds.has(player.id) && player.squadRole === 'KEY_PLAYER') delta -= 2;
        if (!activeIds.has(player.id) && player.squadRole === 'STARTER') delta -= 1;

        return {
          ...withMorale,
          morale: PlayerMoraleService.clamp((withMorale.morale ?? 50) + delta),
        };
      });
    };

    const homeResultChar: 'W' | 'R' | 'P' = matchState.homeScore > matchState.awayScore ? 'W' : matchState.homeScore === matchState.awayScore ? 'R' : 'P';
    const awayResultChar: 'W' | 'R' | 'P' = matchState.awayScore > matchState.homeScore ? 'W' : matchState.awayScore === matchState.homeScore ? 'R' : 'P';
    updatedPlayers[ctx.homeClub.id] = applyMatchMoraleToSquad(updatedPlayers[ctx.homeClub.id], 'HOME', homeResultChar);
    updatedPlayers[ctx.awayClub.id] = applyMatchMoraleToSquad(updatedPlayers[ctx.awayClub.id], 'AWAY', awayResultChar);

  const updatedClubs = simResult.updatedClubs.map(c => {
       if (c.id === ctx.homeClub.id || c.id === ctx.awayClub.id) {
          const isHome = c.id === ctx.homeClub.id;
          const matchCost = FinanceService.calculateMatchdayExpenses(c, isHome, isHome ? attendance : undefined);
          
          // Dodajemy przychód z biletów dla gospodarza
          const { revenue: ticketRevenue, avgPrice: ticketAvgPrice } = isHome
            ? FinanceService.calculateMatchTicketRevenueForClub(attendance, c)
            : { revenue: 0, avgPrice: 0 };
          const additionalRevenues = isHome ? FinanceService.calculateMatchdayAdditionalRevenuesForClub(attendance, c) : null;
          const additionalTotal = additionalRevenues
            ? (additionalRevenues.catering + additionalRevenues.merchandising + additionalRevenues.programs + additionalRevenues.parking)
            : 0;
          const netChange = ticketRevenue + additionalTotal - matchCost;

          const s = isHome ? matchState.homeScore : matchState.awayScore;
          const o = isHome ? matchState.awayScore : matchState.homeScore;
          const pts = s > o ? 3 : (s === o ? 1 : 0);
          
          const resultChar: "W" | "R" | "P" = pts === 3 ? 'W' : (pts === 1 ? 'R' : 'P');
          const newForm = [...(c.stats.form || []), resultChar].slice(-5) as ("W" | "R" | "P")[];

          const _scoreDiff = s - o;
          const _moraleDelta = resultChar === 'W' ? (_scoreDiff >= 2 ? 8 : 5) : resultChar === 'P' ? (_scoreDiff <= -3 ? -10 : -5) : 0;
          const _recentTwo = (c.stats.form || []).slice(-2);
          const _seriesBonus = (resultChar === 'W' && _recentTwo.length >= 2 && _recentTwo.every(r => r === 'W')) ? 3 : (resultChar === 'P' && _recentTwo.length >= 2 && _recentTwo.every(r => r === 'P')) ? -4 : 0;
          const _lossesInLastFive = newForm.filter(result => result === 'P').length;
          const _lossCrisisPenalty = resultChar === 'P'
            ? (_lossesInLastFive >= 5 ? -10 : _lossesInLastFive >= 4 ? -7 : _lossesInLastFive >= 3 ? -4 : 0)
            : 0;
          const _clubCoach = coaches[c.coachId || ''];
          const _coachMotivation = _clubCoach?.attributes?.motivation ?? 50;
          // Motywacja trenera amortyzuje porażki, ale nie może ukryć długiej serii przegranych.
          const _motivationFactor = resultChar === 'P' ? Math.max(0.55, 1.0 - (_coachMotivation / 100) * 0.45) : 1.0;
          const _adjustedMoraleDelta = _moraleDelta < 0 ? Math.round(_moraleDelta * _motivationFactor) : _moraleDelta;
          const _adjustedSeriesBonus = _seriesBonus < 0 ? Math.round(_seriesBonus * _motivationFactor) : _seriesBonus;
          const _adjustedLossCrisisPenalty = Math.round(_lossCrisisPenalty * _motivationFactor);
          const newMorale = Math.max(5, Math.min(95, Math.round((c.morale ?? 50) + _adjustedMoraleDelta + _adjustedSeriesBonus + _adjustedLossCrisisPenalty + (50 - (c.morale ?? 50)) * 0.05)));

          // Tworzymy logi finansowe
          const financeLogsToAdd: any[] = [];
          let currentBalance = c.budget;
          
          if (isHome) {
            // 🏟️ Przychody z biletów
            if (ticketRevenue > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: ticketRevenue,
                type: 'INCOME' as const,
                description: `Bilety (vs ${ctx.awayClub.name}): ${attendance} widzów @ ${ticketAvgPrice} PLN`,
                previousBalance: currentBalance
              });
              currentBalance += ticketRevenue;
            }
            
            // 💰 Koszty organizacji
            if (additionalRevenues && additionalRevenues.catering > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: additionalRevenues.catering,
                type: 'INCOME' as const,
                description: `Catering i Hospitality (vs ${ctx.awayClub.name})`,
                previousBalance: currentBalance
              });
              currentBalance += additionalRevenues.catering;
            }

            if (additionalRevenues && additionalRevenues.merchandising > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: additionalRevenues.merchandising,
                type: 'INCOME' as const,
                description: `Sklep kibica — merchandising (vs ${ctx.awayClub.name})`,
                previousBalance: currentBalance
              });
              currentBalance += additionalRevenues.merchandising;
            }

            if (additionalRevenues && additionalRevenues.programs > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: additionalRevenues.programs,
                type: 'INCOME' as const,
                description: `Programy meczowe i reklamy LED (vs ${ctx.awayClub.name})`,
                previousBalance: currentBalance
              });
              currentBalance += additionalRevenues.programs;
            }

            if (additionalRevenues && additionalRevenues.parking > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: additionalRevenues.parking,
                type: 'INCOME' as const,
                description: `Parkingi i strefa kibica (vs ${ctx.awayClub.name})`,
                previousBalance: currentBalance
              });
              currentBalance += additionalRevenues.parking;
            }

            if (matchCost > 0) {
              financeLogsToAdd.push({
                id: Math.random().toString(36).substr(2, 9),
                date: currentDate.toISOString().split('T')[0],
                amount: -matchCost,
                type: 'EXPENSE' as const,
                description: `Koszty organizacji meczu`,
                previousBalance: currentBalance
              });
              currentBalance -= matchCost;
            }
          } else {
            // 🚌 Koszty wyjazdu (away)
            financeLogsToAdd.push({
              id: Math.random().toString(36).substr(2, 9),
              date: currentDate.toISOString().split('T')[0],
              amount: -matchCost,
              type: 'EXPENSE' as const,
              description: `Koszty wyjazdu`,
              previousBalance: currentBalance
            });
            currentBalance -= matchCost;
          }

          return {
            ...c,
            budget: c.budget + netChange,
            financeHistory: [...financeLogsToAdd, ...(c.financeHistory || [])].slice(0, 50),
            morale: newMorale,
            stats: {
              ...c.stats,
              played: c.stats.played + 1,
              wins: c.stats.wins + (pts === 3 ? 1 : 0),
              draws: c.stats.draws + (pts === 1 ? 1 : 0),
              losses: c.stats.losses + (pts === 0 ? 1 : 0),
              goalsFor: c.stats.goalsFor + s,
              goalsAgainst: c.stats.goalsAgainst + o,
              goalDifference: c.stats.goalDifference + (s - o),
              points: c.stats.points + pts,
              form: newForm
            }
          };

       }
       return c;
    });

    const updatedFixtures = simResult.updatedFixtures.map(f => f.id === ctx.fixture.id ? { ...f, status: 'FINISHED' as any, homeScore: matchState.homeScore, awayScore: matchState.awayScore, attendance } : f);

    

    const timeline: MatchSummaryEvent[] = [];
    let hCounter = 0, aCounter = 0;
    [...matchState.logs].filter(l => [MatchEventType.GOAL, MatchEventType.YELLOW_CARD, MatchEventType.RED_CARD, MatchEventType.PENALTY_SCORED, MatchEventType.INJURY_LIGHT, MatchEventType.INJURY_SEVERE].includes(l.type)).sort((a, b) => a.minute - b.minute).forEach(l => {
      const goalEntry = (l.type === MatchEventType.GOAL)
        ? matchState[l.teamSide === 'HOME' ? 'homeGoals' : 'awayGoals'].find(g => g.playerName === l.playerName && g.minute === l.minute)
        : undefined;
      const isVarDisallowed = goalEntry?.varDisallowed === true;
      if ((l.type === MatchEventType.GOAL || l.type === MatchEventType.PENALTY_SCORED) && !isVarDisallowed) { if (l.teamSide === 'HOME') hCounter++; else aCounter++; }
      timeline.push({ minute: l.minute, type: l.type, playerName: l.playerName || '?', assistantName: l.type === MatchEventType.GOAL ? goalEntry?.assistantName : undefined, teamSide: l.teamSide!, varDisallowed: isVarDisallowed, scoreAtMoment: (l.type === MatchEventType.GOAL || l.type === MatchEventType.PENALTY_SCORED) && !isVarDisallowed ? `${hCounter}-${aCounter}` : undefined });
    });

    const homeYellowCards = Object.keys(matchState.playerYellowCards).filter(id => ctx.homePlayers.some(p => p.id === id)).length;
    const awayYellowCards = Object.keys(matchState.playerYellowCards).filter(id => ctx.awayPlayers.some(p => p.id === id)).length;
    const homeRedCards = matchState.sentOffIds.filter(id => ctx.homePlayers.some(p => p.id === id)).length;
    const awayRedCards = matchState.sentOffIds.filter(id => ctx.awayPlayers.some(p => p.id === id)).length;
    const homePossession = Math.round(50 + ((matchState.momentumSum / (matchState.momentumTicks || 1)) * 0.4));
    const awayPossession = 100 - homePossession;
    const finalHomeStats = buildDisplayStats(matchState.liveStats.home, matchState.homeScore, homeYellowCards, homeRedCards, homePossession, matchState.sessionSeed, 1000);
    const finalAwayStats = buildDisplayStats(matchState.liveStats.away, matchState.awayScore, awayYellowCards, awayRedCards, awayPossession, matchState.sessionSeed, 2000);

const calculateUnitRatings = (teamPlayers: Player[], playedIds: Set<string>, side: 'HOME' | 'AWAY', conceded: number, shotsAgainst: number) => {
      const teamScore = side === 'HOME' ? matchState.homeScore : matchState.awayScore;
      const oppScore = side === 'HOME' ? matchState.awayScore : matchState.homeScore;
      const scoreDifference = teamScore - oppScore;

      const perfs = teamPlayers.filter(p => playedIds.has(p.id)).map(p => {
        const penaltyImpact = getPlayerPenaltyImpact(p, side, matchState);
        const perf: PlayerPerformance = {
          playerId: p.id, name: p.lastName, position: p.position,
          goals: matchState[side === 'HOME' ? 'homeGoals' : 'awayGoals']
            .filter(g => (g.scorerId ? g.scorerId === p.id : g.playerName === p.lastName) && !g.varDisallowed && !g.isMiss)
            .length,
          assists: matchState[side === 'HOME' ? 'homeGoals' : 'awayGoals'].filter(g => g.assistantId === p.id).length,
          yellowCards: matchState.playerYellowCards[p.id] || 0,
          redCards: matchState.sentOffIds.includes(p.id) ? 1 : 0,
          missedPenalties: penaltyImpact.missed,
          savedPenalties: penaltyImpact.saved,
          healthStatus: (side === 'HOME' ? matchState.homeInjuries[p.id] : matchState.awayInjuries[p.id]) ? HealthStatus.INJURED : HealthStatus.HEALTHY,
          fatigue: Math.floor((side === 'HOME' ? matchState.homeFatigue[p.id] : matchState.awayFatigue[p.id]) || 90)
        };

        let finalAdjustment = 0;
        if (scoreDifference > 0) {
          finalAdjustment += scoreDifference === 1 ? 0.15 : scoreDifference === 2 ? 0.25 : 0.35;
        } else if (scoreDifference < 0) {
          const absoluteLoss = Math.abs(scoreDifference);
          finalAdjustment -= absoluteLoss === 1 ? 0.15 : absoluteLoss === 2 ? 0.25 : 0.35;
        }
        if (conceded === 0 && p.position === PlayerPosition.GK) {
          finalAdjustment += Math.min(0.35, 0.15 + shotsAgainst / 80);
        }
        if (conceded === 0 && p.position === PlayerPosition.DEF) {
          finalAdjustment += 0.15;
        } else if (conceded >= 3 && p.position === PlayerPosition.DEF) {
          finalAdjustment -= 0.15;
        }
        finalAdjustment += Math.min(0.35, perf.goals * 0.12);
        finalAdjustment += Math.min(0.25, perf.assists * 0.10);
        finalAdjustment += Math.min(0.30, perf.savedPenalties * 0.30);
        finalAdjustment -= Math.min(0.25, perf.missedPenalties * 0.25);
        finalAdjustment -= Math.min(0.25, perf.yellowCards * 0.10);
        if (perf.redCards > 0) finalAdjustment -= 0.35;

        perf.rating = Math.min(10, Math.max(1, parseFloat((calculateLiveRatingNumber(p, side, matchState) + finalAdjustment).toFixed(1))));
        return perf;
      });

      return perfs;
    };

const summary: MatchSummary = {
      matchId: ctx.fixture.id, userTeamId: userTeamId!, homeClub: ctx.homeClub, awayClub: ctx.awayClub, 
      homeScore: matchState.homeScore, awayScore: matchState.awayScore, homeGoals: matchState.homeGoals.filter(g => !g.varDisallowed), awayGoals: matchState.awayGoals.filter(g => !g.varDisallowed),
      attendance: attendance,
      homeStats: finalHomeStats,
      awayStats: finalAwayStats,
      homePlayers: calculateUnitRatings(ctx.homePlayers, playedIdsHome, 'HOME', matchState.awayScore, matchState.liveStats.away.shotsOnTarget),
      awayPlayers: calculateUnitRatings(ctx.awayPlayers, playedIdsAway, 'AWAY', matchState.homeScore, matchState.liveStats.home.shotsOnTarget),
      timeline,
      kits: kitColors
    };

    // TUTAJ WSTAW TEN KOD - Mapowanie ocen zawodników
    const finalRatingsMap: Record<string, number> = {};
    [...summary.homePlayers, ...summary.awayPlayers].forEach(perf => {
      if (perf.rating) finalRatingsMap[perf.playerId] = perf.rating;
    });
    // KONIEC WSTAWKI

    const buildReportLineup = (lineup: Lineup, subs: SubstitutionRecord[]) => {
      const reportLineup = [...lineup.startingXI];
      [...subs].sort((a, b) => b.minute - a.minute).forEach(sub => {
        const idx = reportLineup.indexOf(sub.playerInId);
        if (idx !== -1) reportLineup[idx] = sub.playerOutId;
      });
      return reportLineup.filter((id): id is string => !!id);
    };

    const buildReportSubs = (side: 'HOME' | 'AWAY') => {
      const subs = side === 'HOME' ? matchState.homeSubsHistory : matchState.awaySubsHistory;
      const teamPlayers = side === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
      const teamId = side === 'HOME' ? ctx.homeClub.id : ctx.awayClub.id;
      return subs.map(sub => {
        const playerOut = teamPlayers.find(p => p.id === sub.playerOutId);
        const playerIn = teamPlayers.find(p => p.id === sub.playerInId);
        return {
          playerOutId: sub.playerOutId,
          playerOutName: playerOut ? `${playerOut.firstName.charAt(0)}. ${playerOut.lastName}` : '',
          playerInId: sub.playerInId,
          playerInName: playerIn ? `${playerIn.firstName.charAt(0)}. ${playerIn.lastName}` : '',
          minute: sub.minute,
          teamId
        };
      });
    };

    const buildReportInjuries = (side: 'HOME' | 'AWAY') => {
      const injuries = side === 'HOME' ? matchState.homeInjuries : matchState.awayInjuries;
      const injuryMinutes = side === 'HOME' ? matchState.homeInjuryMin : matchState.awayInjuryMin;
      const teamPlayers = side === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
      const teamId = side === 'HOME' ? ctx.homeClub.id : ctx.awayClub.id;
      return Object.entries(injuries).map(([playerId, severity]) => {
        const player = teamPlayers.find(p => p.id === playerId);
        const playerName = player ? `${player.firstName.charAt(0)}. ${player.lastName}` : '';
        return {
          playerId,
          playerName,
          minute: injuryMinutes[playerId] ?? 0,
          teamId,
          severity,
          days: severity === InjurySeverity.SEVERE ? 30 : 7,
          type: severity
        };
      });
    };

    const matchHistoryArgs = {
      matchId: ctx.fixture.id,
      date: currentDate.toDateString(),
      season: seasonNumber,
      competition: ctx.fixture.leagueId,
      homeTeamId: ctx.homeClub.id,
      awayTeamId: ctx.awayClub.id,
      homeScore: matchState.homeScore,
      awayScore: matchState.awayScore,
      attendance: attendance,
      kits: kitColors,
      goals: summary.homeGoals.map(g => ({
        playerId: g.scorerId,
        playerName: g.playerName,
        minute: g.minute,
        teamId: ctx.homeClub.id,
        isPenalty: g.isPenalty,
        assistantId: g.assistantId,
        assistantName: g.assistantName,
        isMiss: g.isMiss,
      })).concat(summary.awayGoals.map(g => ({
        playerId: g.scorerId,
        playerName: g.playerName,
        minute: g.minute,
        teamId: ctx.awayClub.id,
        isPenalty: g.isPenalty,
        assistantId: g.assistantId,
        assistantName: g.assistantName,
        isMiss: g.isMiss,
      }))),
      ratings: finalRatingsMap,
      substitutions: buildReportSubs('HOME').concat(buildReportSubs('AWAY')),
      injuries: buildReportInjuries('HOME').concat(buildReportInjuries('AWAY')),
      homeLineup: buildReportLineup(matchState.homeLineup, matchState.homeSubsHistory),
      awayLineup: buildReportLineup(matchState.awayLineup, matchState.awaySubsHistory),
      // Historia zapisuje taktyke startowa i koncowa osobno, bo scouting AI analizuje otwarcie meczu.
      homeStartingTacticId: matchState.initialHomeTacticId ?? matchState.homeLineup.tacticId,
      awayStartingTacticId: matchState.initialAwayTacticId ?? matchState.awayLineup.tacticId,
      aiTacticGuessId: matchState.aiTacticGuessId,
      homeTacticId: matchState.homeLineup.tacticId,
      awayTacticId: matchState.awayLineup.tacticId,
      cards: (() => {
          const playerYellowCount: Record<string, number> = {};
          return [...matchState.logs]
            .filter(l => l.type === MatchEventType.YELLOW_CARD || l.type === MatchEventType.RED_CARD)
            .sort((a, b) => a.minute - b.minute)
            .map(l => {
               const pId = l.playerId || l.playerName || '?';
               let finalType: 'YELLOW' | 'RED' | 'SECOND_YELLOW' = l.type === MatchEventType.RED_CARD ? 'RED' : 'YELLOW';
               if (finalType === 'YELLOW') {
                  playerYellowCount[pId] = (playerYellowCount[pId] || 0) + 1;
                  if (playerYellowCount[pId] === 2) finalType = 'SECOND_YELLOW';
               }
               return {
                  playerId: l.playerId,
                  playerName: l.playerName || '?',
                  minute: l.minute,
                  teamId: l.teamSide === 'HOME' ? ctx.homeClub.id : ctx.awayClub.id,
                  type: finalType as any
               };
            });
        })()
    };

    const debriefUserScore = userSide === 'HOME' ? matchState.homeScore : matchState.awayScore;
    const debriefOppScore  = userSide === 'HOME' ? matchState.awayScore : matchState.homeScore;
    const debriefUserRep   = userSide === 'HOME' ? ctx.homeClub.reputation : ctx.awayClub.reputation;
    const debriefOppRep    = userSide === 'HOME' ? ctx.awayClub.reputation : ctx.homeClub.reputation;
    const debriefUserGoals = (userSide === 'HOME' ? matchState.homeGoals : matchState.awayGoals).filter(g => !g.varDisallowed);
    const debriefOppGoals  = (userSide === 'HOME' ? matchState.awayGoals : matchState.homeGoals).filter(g => !g.varDisallowed);
    const debriefUserPIds  = userSide === 'HOME' ? ctx.homePlayers.map(p => p.id) : ctx.awayPlayers.map(p => p.id);
    const debriefUserHasRC = matchState.sentOffIds.some(id => debriefUserPIds.includes(id));
    const debriefCtx = getDebriefContext(debriefUserScore, debriefOppScore, debriefUserRep, debriefOppRep, debriefUserGoals, debriefOppGoals, debriefUserHasRC);

    setLastMatchSummary(summary);
    setPendingFinishPayload({
      simResultMerged: { ...simResult, updatedClubs, updatedFixtures, updatedPlayers, roundResults: finalRoundResults, seasonNumber, ratings: finalRatingsMap },
      matchHistoryArgs,
      summary,
      userTeamId: userTeamId!,
      debriefContext: debriefCtx,
      sessionSeed: matchState.sessionSeed,
    });
    setShowPostMatchDebrief(true);
  };

  if (!matchState || !ctx || !env || !kitColors) return null;

  const renderTicker = (side: 'HOME' | 'AWAY') => {
    const goals = side === 'HOME' ? matchState.homeGoals : matchState.awayGoals;
    const rawCards = matchState.logs.filter(l => l.teamSide === side && (l.type === MatchEventType.YELLOW_CARD || l.type === MatchEventType.RED_CARD));
    const cards = rawCards.filter(card => {
      if (card.type !== MatchEventType.YELLOW_CARD) return true;
      return !rawCards.some(other => {
        if (other.type !== MatchEventType.RED_CARD || other.minute !== card.minute) return false;
        if (card.playerId && other.playerId) return card.playerId === other.playerId;
        return card.playerName === other.playerName;
      });
    });
    const injs = matchState.logs.filter(l => l.teamSide === side && (l.type === MatchEventType.INJURY_LIGHT || l.type === MatchEventType.INJURY_SEVERE));
    
    return (
      <div className={`flex flex-wrap gap-2 mt-1 ${side === 'AWAY' ? 'justify-end' : 'justify-start'}`}>
        
      {goals.map((g, i) => {
          const playersList = side === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
          const foundPlayer = g.scorerId
            ? playersList.find(px => px.id === g.scorerId)
            : playersList.find(px => px.lastName === g.playerName);
          const nameToDisplay = foundPlayer
            ? `${foundPlayer.firstName.charAt(0)}. ${foundPlayer.lastName}`
            : g.playerName;
          return (
            <span key={`g-${i}`} className={`text-[9px] font-bold flex items-center gap-1 ${g.isMiss ? 'text-rose-500' : g.varDisallowed ? 'text-slate-500' : 'text-white'}`}>
              {g.isMiss ? '❌' : '⚽'}{' '}
              {g.varDisallowed
                ? <><s>{nameToDisplay} ({g.minute}'{g.isPenalty ? ' k.' : ''})</s> (VAR)</>
                : `${nameToDisplay} (${g.minute}'${g.isPenalty ? ' k.' : ''}${g.isMiss ? '' : ''})`}
            </span>
          );
        })}

        {cards.map((c, i) => {
          const playersList = side === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
          const foundPlayer = c.playerId
            ? playersList.find(px => px.id === c.playerId)
            : playersList.find(px => px.lastName === c.playerName);
          const cardName = foundPlayer ? `${foundPlayer.firstName.charAt(0)}. ${foundPlayer.lastName}` : c.playerName;
          return (
            <span key={`c-${i}`} className="text-[9px] font-bold text-white flex items-center gap-1">
              {c.type === MatchEventType.RED_CARD ? '🟥' : '🟨'} {cardName} ({c.minute}')
            </span>
          );
        })}
        {injs.map((j, i) => {
          const playersList = side === 'HOME' ? ctx.homePlayers : ctx.awayPlayers;
          const foundPlayer = playersList.find(px => px.lastName === j.playerName);
          const injName = foundPlayer ? `${foundPlayer.firstName.charAt(0)}. ${foundPlayer.lastName}` : j.playerName;
          return (
            <span key={`j-${i}`} className="text-[9px] font-bold text-white flex items-center gap-1">
              <span className={j.type === MatchEventType.INJURY_SEVERE ? 'text-red-500' : 'text-white'}>✚</span> {injName} ({j.minute}')
            </span>
          );
        })}
      </div>
    );
  };

const SquadList = ({ side, lineup, players, fatigue, injs, subsHistory }: { side: 'HOME' | 'AWAY', lineup: (string | null)[], players: Player[], fatigue: Record<string, number>, injs: Record<string, InjurySeverity>, subsHistory: SubstitutionRecord[] }) => (
    <div
      className="group/squad w-96 shrink-0 p-4 rounded-[32px] border border-white/10 flex flex-col gap-2 overflow-hidden h-[calc(100%+64px)] min-h-0 self-start shadow-[0_35px_90px_rgba(0,0,0,0.55)] relative backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-[0_45px_110px_rgba(0,0,0,0.68)]"
      style={{ backgroundColor: kitColors ? (side === 'HOME' ? hexToRgba(kitColors.home.primary, 0.16) : hexToRgba(kitColors.away.primary, 0.16)) : 'rgba(15,23,42,0.28)'}}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: side === 'HOME' ? kitColors!.home.primary : kitColors!.away.primary }} />
      <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none transition-opacity duration-300 group-hover/squad:opacity-70" viewBox="0 0 100 180" preserveAspectRatio="none" aria-hidden>
        <path d={side === 'HOME' ? 'M 4 18 C 30 8, 42 38, 64 30 S 78 74, 96 66' : 'M 96 18 C 70 8, 58 38, 36 30 S 22 74, 4 66'} fill="none" stroke={side === 'HOME' ? kitColors!.home.primary : kitColors!.away.primary} strokeWidth="0.55" strokeLinecap="round" className="live-squad-signal" />
        <path d={side === 'HOME' ? 'M 8 118 C 28 98, 44 138, 62 120 S 78 148, 94 132' : 'M 92 118 C 72 98, 56 138, 38 120 S 22 148, 6 132'} fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="0.4" strokeLinecap="round" className="live-squad-signal live-squad-signal-slow" />
        <rect x="0" y="0" width="100" height="180" fill="none" stroke="#ffffff" strokeOpacity="0.035" strokeWidth="0.5" />
      </svg>
      <div className="absolute inset-x-4 bottom-0 h-24 rounded-full blur-3xl opacity-25" style={{ backgroundColor: side === 'HOME' ? kitColors!.home.primary : kitColors!.away.primary }} />
       <h4 className="relative z-10 text-[10px] font-black text-slate-100 uppercase tracking-[0.3em] mb-4 text-center">
        {TacticRepository.getById(side === 'HOME' ? matchState!.homeLineup.tacticId : matchState!.awayLineup.tacticId).name}
      </h4>
      
      <div className={`relative z-10 grid ${side === 'HOME' ? 'grid-cols-[1fr_45px_35px_35px]' : 'grid-cols-[35px_35px_45px_1fr]'} gap-2 px-4 mb-2 text-[8px] font-black text-slate-500 uppercase tracking-widest`}>
        {side === 'HOME' ? (
          <><span>Zawodnik</span><span className="text-center">Rtg</span><span className="text-center">Gol</span><span className="text-center">Asist</span></>
        ) : (
          <><span className="text-center">Asist</span><span className="text-center">Gol</span><span className="text-center">Rtg</span><span className="text-right">Zawodnik</span></>
        )}
      </div>

      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1">
        {lineup.map((pid, idx) => {
          if (!pid) return <div key={`empty-${idx}`} className="h-10 bg-red-950/10 rounded-xl border border-dashed border-red-500/20 flex items-center justify-center text-[7px] text-red-500/40 font-black uppercase">Luka</div>;
          const p = players.find(px => px.id === pid);
          if (!p) return null;
          
          const liveRating = calculateLiveRating(p, side, matchState);
          const nameWithInitial = `${p.firstName.charAt(0)}. ${p.lastName}`;
          // Poprawiona detekcja goli: używamy scorerId gdy dostępne, fallback na nazwisko
          const goalsCount = (side === 'HOME' ? matchState!.homeGoals : matchState!.awayGoals).filter(g => (g.scorerId ? g.scorerId === p.id : (g.playerName === p.lastName || g.playerName === nameWithInitial)) && !g.varDisallowed && !g.isMiss).length;
          const varDisallowedCount = (side === 'HOME' ? matchState!.homeGoals : matchState!.awayGoals).filter(g => (g.scorerId ? g.scorerId === p.id : (g.playerName === p.lastName || g.playerName === nameWithInitial)) && g.varDisallowed && !g.isMiss).length;
          const assistsCount = (side === 'HOME' ? matchState!.homeGoals : matchState!.awayGoals).filter(g => g.assistantId === p.id).length;
          const f = fatigue[pid] || 100;
          const isSentOff = matchState!.sentOffIds.includes(pid);

  const injuryStatus = injs[pid];
  const isSevereInjured = injuryStatus === 'SEVERE';
  const isLightInjured = injuryStatus === 'LIGHT';
          const conditionColor = injuryStatus === 'LIGHT' ? 'bg-orange-500' : PlayerPresentationService.getConditionColorClass(f);


          return (
            <div key={pid} onClick={() => handleOpenPlayerCard(p.id)} className={`group/playerrow relative overflow-hidden grid ${side === 'HOME' ? 'grid-cols-[1fr_45px_35px_35px]' : 'grid-cols-[35px_35px_45px_1fr]'} gap-2 items-center py-2 px-3 rounded-2xl border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.28)] ${isSentOff ? 'opacity-20 grayscale' : isSevereInjured ? 'bg-red-600/20 border-red-500/40 hover:bg-red-600/30' : isLightInjured ? 'bg-orange-500/20 border-orange-400/40 hover:bg-orange-500/30' : 'bg-white/[0.055] border-white/[0.025] hover:border-white/20 hover:bg-white/[0.09]'}`}>
              {side === 'HOME' ? (
                <>
                  <div className="min-w-0 flex items-center gap-3">
                    <span className={`w-8 font-mono font-black text-[9px] ${PlayerPresentationService.getPositionColorClass(p.position)}`}>{p.position}</span>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-white font-black uppercase italic text-[10px] truncate">{nameWithInitial}</span>
                      <div className="w-full h-0.5 bg-black/40 rounded-full overflow-hidden mt-1 relative">
                          <div className="absolute inset-0 bg-red-900/30" style={{ left: `${100 - (p.fatigueDebt || 0)}%` }} />
                          <div className={`h-full ${conditionColor} transition-all duration-1000 relative z-10`} style={{ width: `${f}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-center font-black text-blue-400 text-xs">{liveRating}</div>
                  <div className="text-center text-xs">{goalsCount > 0 ? (goalsCount === 1 ? '⚽' : `⚽${goalsCount}`) : ''}{varDisallowedCount > 0 ? (varDisallowedCount === 1 ? '🚫' : `🚫${varDisallowedCount}`) : ''}</div>
                  <div className="text-center text-xs">{assistsCount > 0 ? (assistsCount === 1 ? '👟' : `👟${assistsCount}`) : ''}</div>
                </>
              ) : (
                <>
                  <div className="text-center text-xs">{assistsCount > 0 ? (assistsCount === 1 ? '👟' : `👟${assistsCount}`) : ''}</div>
                  <div className="text-center text-xs">{goalsCount > 0 ? (goalsCount === 1 ? '⚽' : `⚽${goalsCount}`) : ''}{varDisallowedCount > 0 ? (varDisallowedCount === 1 ? '🚫' : `🚫${varDisallowedCount}`) : ''}</div>
                  <div className="text-center font-black text-blue-400 text-xs">{liveRating}</div>
                  <div className="min-w-0 flex items-center gap-3 flex-row-reverse">
                    <span className={`w-8 font-mono font-black text-[9px] text-right ${PlayerPresentationService.getPositionColorClass(p.position)}`}>{p.position}</span>
                    <div className="flex-1 min-w-0 flex flex-col text-right">
                      <span className="text-white font-black uppercase italic text-[10px] truncate">{nameWithInitial}</span>
                      <div className="w-full h-0.5 bg-black/40 rounded-full overflow-hidden mt-1 relative">
                          <div className="absolute inset-0 bg-red-900/30" style={{ left: `${100 - (p.fatigueDebt || 0)}%` }} />
                          <div className={`h-full ${conditionColor} transition-all duration-1000 relative z-10`} style={{ width: `${f}%` }} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {subsHistory.length > 0 && (
          <div className="mt-4 border-t border-white/5 pt-3 space-y-1.5">
            <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 px-2">ZMIANY</h5>
            {subsHistory.map((sub, sIdx) => {
              const pOut = sub.playerOutId !== 'NONE' ? players.find(px => px.id === sub.playerOutId) : null;
              const pIn = players.find(px => px.id === sub.playerInId);
              if (!pOut && !pIn) return null;
              return (
                <div key={`sub-${sub.playerOutId}-${sub.playerInId}-${sIdx}`} className={`flex items-center gap-3 py-1.5 px-3 rounded-xl bg-black/50 opacity-85 transition-all ${side === 'AWAY' ? 'flex-row-reverse text-right' : ''}`}>
                  <span className={`w-8 font-mono font-black text-[8px] text-slate-200 ${side === 'AWAY' ? 'text-right' : ''}`}>{pOut?.position ?? pIn?.position ?? 'SUB'}</span>
                  <div className="flex-1 flex flex-col min-w-0 gap-0.5">
                     {pOut && (
                       <span className={`text-red-200 grayscale-0 truncate font-bold uppercase italic tracking-tight text-[10px] flex items-center gap-1 ${side === 'AWAY' ? 'justify-end' : ''}`}>
                         <span className="text-red-500 text-[11px] leading-none">↓</span>
                         <span className="truncate">{pOut.firstName.charAt(0)}. {pOut.lastName}</span>
                       </span>
                     )}
                     {pIn && (
                       <span className={`text-emerald-200 grayscale-0 truncate font-bold uppercase italic tracking-tight text-[10px] flex items-center gap-1 ${side === 'AWAY' ? 'justify-end' : ''}`}>
                         <span className="text-emerald-400 text-[11px] leading-none">↑</span>
                         <span className="truncate">{pIn.firstName.charAt(0)}. {pIn.lastName}</span>
                       </span>
                     )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-black text-slate-600 italic">{sub.minute} min 🔄</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderTacticalSelect = <T extends string,>({
    value,
    locked,
    accent,
    options,
    onPick,
  }: {
    value: T;
    locked: boolean;
    accent: string;
    options: { val: T; label: string }[];
    onPick: (value: T) => void;
  }) => {
    const widestLabelLength = Math.max(...options.map(option => option.label.length));
    const selectId = options.map(option => option.val).join('|');
    const isOpen = openTacticalSelect === selectId && !locked;
    const selectedLabel = options.find(option => option.val === value)?.label ?? String(value);
    const controlStyle = {
      backgroundColor: locked ? 'rgba(15, 23, 42, 0.54)' : hexToRgba(accent, 0.32),
      borderColor: locked ? 'rgba(255, 255, 255, 0.1)' : hexToRgba(accent, 0.88),
      boxShadow: locked
        ? 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -9px 15px rgba(0,0,0,0.35)'
        : `0 0 18px ${hexToRgba(accent, 0.26)}, inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -11px 18px rgba(0,0,0,0.48)`,
      lineHeight: '1',
      textShadow: locked
        ? '0 1px 4px rgba(0,0,0,0.75)'
        : '0 1px 2px rgba(0,0,0,0.95), 0 0 5px rgba(0,0,0,0.85)',
    };

    return (
      <div
        className="relative z-30"
        style={{
          width: `calc(${widestLabelLength}ch + 42px)`,
          minWidth: '70px',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          disabled={locked}
          onClick={() => setOpenTacticalSelect(current => current === selectId ? null : selectId)}
          className={`relative h-9 w-full rounded-[4px] border px-[8px] pr-[24px] text-center text-[12px] font-black italic uppercase tracking-tighter outline-none transition-all duration-200 ${
            locked ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer text-yellow-50 hover:brightness-125 focus:brightness-125'
          }`}
          style={controlStyle}
        >
          <span className="block truncate">{selectedLabel}</span>
          <span className="absolute right-[7px] top-1/2 -translate-y-1/2 text-[12px] leading-none text-yellow-50/90">⌃</span>
        </button>
        {isOpen && (
          <div
            className="absolute bottom-[calc(100%+5px)] left-0 z-[620] w-full overflow-hidden rounded-[4px] border py-1 shadow-[0_18px_34px_rgba(0,0,0,0.9)]"
            style={{
              background: `linear-gradient(180deg, rgba(2,6,23,0.99), rgba(9,12,22,0.99)), linear-gradient(180deg, ${hexToRgba(accent, 0.18)}, transparent)`,
              borderColor: hexToRgba(accent, 0.94),
              boxShadow: `0 18px 34px rgba(0,0,0,0.92), 0 0 0 1px rgba(0,0,0,0.85), 0 0 18px ${hexToRgba(accent, 0.2)}`,
            }}
          >
            {options.map(option => (
              <button
                key={option.val}
                type="button"
                onClick={() => {
                  onPick(option.val);
                  setOpenTacticalSelect(null);
                }}
                className={`block h-8 w-full px-2 text-center text-[12px] font-black italic uppercase tracking-tighter transition-colors ${
                  option.val === value
                    ? 'text-yellow-50'
                    : 'text-slate-100 hover:text-yellow-50'
                }`}
                style={{
                  backgroundColor: option.val === value ? hexToRgba(accent, 0.32) : 'rgba(2, 6, 23, 0.96)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.95)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 gap-6 animate-fade-in overflow-hidden relative">
     {/* BACKGROUND (STADION) */}
<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
  {/* obraz stadionu */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: "url('https://i.ibb.co/fdSSvHLz/stadion.jpg')" }}
  />

  {/* przyciemnienie żeby UI było czytelne */}
  <div className="absolute inset-0 bg-slate-950/85" />

  {/* opcjonalnie delikatny grid */}
  <div
    className="absolute inset-0 opacity-[0.04]"
    style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
    }}
  />
</div>
   {/* CONTENT (WSZYSTKO NAD TŁEM) */}
    <div className="relative z-10 flex h-full min-h-0 flex-col gap-6">

      {activePenaltyReview && (
        <div className="fixed inset-0 z-[560] bg-black/80 backdrop-blur-xl flex items-center justify-center p-10 animate-fade-in">
          <div className="max-w-3xl w-full bg-slate-900/85 border border-yellow-500/30 rounded-[44px] shadow-[0_50px_100px_rgba(0,0,0,0.85)] overflow-hidden text-center">
            <div className="h-2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            <div className="p-12 flex flex-col items-center gap-6">
              {activePenaltyReview.phase === 'INCIDENT' && (
                <>
                  <div className="text-7xl animate-bounce">👉</div>
                  <span className="text-[10px] text-yellow-400 font-black italic uppercase tracking-tighter">
                    {activePenaltyReview.side === 'HOME' ? ctx.homeClub.shortName : ctx.awayClub.shortName}
                  </span>
                  <h2 className="text-5xl text-white font-black italic uppercase tracking-tighter drop-shadow-[0_0_40px_rgba(250,204,21,0.35)]">
                    Sędzia wskazuje na 11 metr!
                  </h2>
                  <p className="text-lg text-slate-300 font-black italic uppercase tracking-tighter">
                    {activePenaltyReview.reason === 'HAND_BALL'
                      ? 'Zagranie ręką w polu karnym.'
                      : `Faul na ${activePenaltyReview.kicker.lastName} w polu karnym.`}
                  </p>
                </>
              )}
              {activePenaltyReview.phase === 'CHECKING' && (
                <>
                  <div className="text-7xl animate-bounce">📺</div>
                  <span className="text-[10px] text-yellow-400 font-black italic uppercase tracking-tighter">VAR</span>
                  <h2 className="text-5xl text-white font-black italic uppercase tracking-tighter">Sędzia sprawdza sytuację</h2>
                  <p className="text-lg text-slate-300 font-black italic uppercase tracking-tighter">
                    Czy {activePenaltyReview.reason === 'HAND_BALL' ? 'była ręka?' : 'był faul?'}
                  </p>
                  <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mt-2" />
                </>
              )}
              {activePenaltyReview.phase === 'RETURNING' && (
                <>
                  <div className="text-7xl animate-pulse">🏃</div>
                  <span className="text-[10px] text-yellow-400 font-black italic uppercase tracking-tighter">Decyzja zapadła</span>
                  <h2 className="text-5xl text-white font-black italic uppercase tracking-tighter">
                    Sędzia wraca na boisko
                  </h2>
                  <p className="text-lg text-slate-300 font-black italic uppercase tracking-tighter">Cały stadion czeka na werdykt.</p>
                </>
              )}
              {activePenaltyReview.phase === 'VERDICT' && activePenaltyReview.verdict === 'PENALTY' && (
                <>
                  <div className="text-8xl animate-bounce">✅</div>
                  <span className="text-[10px] text-emerald-400 font-black italic uppercase tracking-tighter">
                    {activePenaltyReview.usesVar ? 'Po analizie VAR' : 'Decyzja sędziego'}
                  </span>
                  <h2 className="text-6xl text-emerald-400 font-black italic uppercase tracking-tighter drop-shadow-[0_0_40px_rgba(52,211,153,0.5)]">
                    Rzut karny!
                  </h2>
                  {activePenaltyReview.card && activePenaltyReview.card !== MatchEventType.FOUL && (
                    <p className="text-base text-slate-300 font-black italic uppercase tracking-tighter">
                      {activePenaltyReview.card === MatchEventType.RED_CARD ? 'Czerwona kartka' : 'Żółta kartka'} dla {activePenaltyReview.defender.lastName}.
                    </p>
                  )}
                </>
              )}
              {activePenaltyReview.phase === 'VERDICT' && activePenaltyReview.verdict === 'NO_PENALTY' && (
                <>
                  <div className="text-8xl animate-bounce">🚫</div>
                  <span className="text-[10px] text-red-400 font-black italic uppercase tracking-tighter">Po analizie VAR</span>
                  <h2 className="text-6xl text-red-500 font-black italic uppercase tracking-tighter drop-shadow-[0_0_40px_rgba(239,68,68,0.55)]">
                    Nie ma karnego!
                  </h2>
                  <p className="text-lg text-slate-300 font-black italic uppercase tracking-tighter">
                    {activePenaltyReview.reason === 'HAND_BALL' ? 'Ręki nie było.' : 'Faulu nie było.'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activePenalty && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-10 animate-fade-in">
           <div className="max-w-4xl w-full bg-slate-900/60 border border-white/10 rounded-[50px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
              
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

              <div className="p-12 flex items-center justify-between gap-10">
                 <div className={`flex-1 flex flex-col items-center gap-6 transition-all duration-1000 ${activePenalty.phase === 'EXECUTING' ? 'scale-110' : ''}`}>
                    <BigJerseyIcon 
                      primary={activePenalty.side === 'HOME' ? kitColors.home.primary : kitColors.away.primary} 
                      secondary={activePenalty.side === 'HOME' ? kitColors.home.secondary : kitColors.away.secondary} 
                      size="w-32 h-32"
                    />
                    <div className="text-center">
                       <span className="block text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">STRZELEC</span>
                       <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">{activePenalty.kicker.lastName}</h3>
                       <div className="mt-4 flex items-center justify-center gap-3">
                          <span className="text-slate-500 text-[9px] font-black uppercase">SKUTECZNOŚĆ:</span>
                          <span className="text-2xl font-black italic text-emerald-400 font-mono">{activePenalty.kicker.attributes.finishing}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-6">
                    {activePenalty.phase === 'AWARDED' && (
                      <div className="flex flex-col items-center animate-bounce">
                         <span className="text-7xl">👉</span>
                         <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] text-center">RZUT<br/>KARNY</h2>
                      </div>
                    )}
                    {activePenalty.phase === 'EXECUTING' && (
                      <div className="flex flex-col items-center">
                         <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                         <span className="text-xl font-black italic text-emerald-400 uppercase tracking-widest animate-pulse">STRZELA!</span>
                      </div>
                    )}
                    {activePenalty.phase === 'RESULT' && (
                      <div className="flex flex-col items-center animate-scale-up">
                         {activePenalty.result === MatchEventType.PENALTY_SCORED ? (
                            <><span className="text-9xl mb-4">⚽</span><h2 className="text-8xl font-black italic text-emerald-400 uppercase tracking-tighter drop-shadow-[0_0_50px_rgba(52,211,153,0.5)]">GOL!</h2></>
                         ) : (
                            <><span className="text-9xl mb-4">🧤</span><h2 className="text-7xl font-black italic text-red-500 uppercase tracking-tighter drop-shadow-[0_0_50px_rgba(239,68,68,0.5)]">NIE MA!</h2></>
                         )}
                      </div>
                    )}
                    <div className="text-8xl font-black italic text-white/5 select-none font-serif">czy</div>
                 </div>

                 <div className={`flex-1 flex flex-col items-center gap-6 transition-all duration-1000 ${activePenalty.phase === 'EXECUTING' ? 'scale-110' : ''}`}>
                    <BigJerseyIcon 
                      primary={activePenalty.side === 'HOME' ? kitColors.away.primary : kitColors.home.primary} 
                      secondary={activePenalty.side === 'HOME' ? kitColors.away.secondary : kitColors.home.secondary} 
                      size="w-32 h-32"
                    />
                    <div className="text-center">
                       <span className="block text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-2">BRAMKARZ</span>
                       <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">{activePenalty.keeper.lastName}</h3>
                       <div className="mt-4 flex items-center justify-center gap-3">
                          <span className="text-slate-500 text-[9px] font-black uppercase">REFLEKS:</span>
                          <span className="text-2xl font-black italic text-blue-400 font-mono">{activePenalty.keeper.attributes.goalkeeping}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeVAR && (
        <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-xl flex items-center justify-center animate-fade-in">
          <div className="bg-slate-900/80 border border-white/10 rounded-[40px] p-12 flex flex-col items-center gap-6 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
            {activeVAR.phase === 'CHECKING' && (
              <>
                <div className="text-7xl animate-bounce">📺</div>
                <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">VAR</h2>
                <p className="text-xl font-bold text-slate-300 uppercase tracking-widest text-center">Sędzia biegnie do monitora</p>
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mt-2" />
              </>
            )}
            {activeVAR.phase === 'VERDICT' && activeVAR.verdict === 'GOAL' && (
              <>
                <div className="text-8xl">✅</div>
                <h2 className="text-6xl font-black italic text-emerald-400 uppercase tracking-tighter drop-shadow-[0_0_40px_rgba(52,211,153,0.6)]">BRAMKA!</h2>
                <p className="text-lg font-bold text-slate-300 uppercase tracking-widest">VAR: Gol uznany</p>
              </>
            )}
            {activeVAR.phase === 'VERDICT' && activeVAR.verdict === 'NO_GOAL' && (
              <>
                <div className="text-8xl animate-bounce">🚫</div>
                <h2 className="text-6xl font-black italic text-red-500 uppercase tracking-tighter drop-shadow-[0_0_40px_rgba(239,68,68,0.6)]">SPALONY!</h2>
                <p className="text-lg font-bold text-slate-300 uppercase tracking-widest">VAR: Bramka nieuznana</p>
              </>
            )}
          </div>
        </div>
      )}

      {activePenaltyNoCall && (
        <div className="fixed inset-0 z-[550] bg-black/75 backdrop-blur-xl flex items-center justify-center animate-fade-in">
          <div className="bg-slate-900/85 border border-yellow-500/30 rounded-[40px] p-12 flex flex-col items-center gap-6 shadow-[0_50px_100px_rgba(0,0,0,0.8)] max-w-2xl text-center">
            <div className="text-7xl animate-bounce">📺</div>
            <span className="text-[10px] text-yellow-400 font-black italic uppercase tracking-tighter">Analiza sędziego</span>
            <h2 className="text-6xl text-white font-black italic uppercase tracking-tighter drop-shadow-[0_0_40px_rgba(250,204,21,0.35)]">Nie ma karnego</h2>
            <p className="text-lg text-slate-300 font-black italic uppercase tracking-tighter">
              {activePenaltyNoCall.playerName} pada w polu karnym, ale arbiter każe grać dalej.
            </p>
          </div>
        </div>
      )}


      <header className="group/header relative flex items-stretch justify-between h-36 bg-black/45 backdrop-blur-xl rounded-[36px] overflow-hidden shadow-[0_35px_110px_rgba(0,0,0,0.68)] border border-white/10 shrink-0 transition-all duration-300 hover:border-white/20">
         <svg className="absolute inset-0 w-full h-full opacity-50 pointer-events-none transition-opacity duration-300 group-hover/header:opacity-80" viewBox="0 0 1000 144" preserveAspectRatio="none" aria-hidden>
            <path d="M 0 126 C 110 72, 210 128, 330 74 S 552 16, 672 64 S 866 118, 1000 40" fill="none" stroke={kitColors.home.primary} strokeWidth="1.4" strokeLinecap="round" className="live-header-signal" />
            <path d="M 1000 118 C 870 64, 760 132, 620 84 S 420 20, 300 76 S 118 122, 0 38" fill="none" stroke={kitColors.away.primary} strokeWidth="1.4" strokeLinecap="round" className="live-header-signal live-header-signal-alt" />
            <rect x="-120" y="0" width="80" height="144" fill="#ffffff" opacity="0.10" className="live-panel-scan" />
            <line x1="500" y1="0" x2="500" y2="144" stroke="#ffffff" strokeOpacity="0.08" />
         </svg>
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
         <div className="flex-1 flex flex-col justify-center px-12 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: kitColors.home.primary }} />

         
             <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10rem] font-black italic text-white/[0.04] select-none pointer-events-none uppercase tracking-tighter">
      {ctx.homeClub.shortName}
   </div>
            <div className="relative z-10 flex items-center gap-4">
               <BigJerseyIcon primary={kitColors.home.primary} secondary={kitColors.home.secondary} />
               <h1 className="text-6xl font-black italic uppercase tracking-tighter truncate leading-tight drop-shadow-2xl">{ctx.homeClub.name}</h1>
            </div>
            <div className="relative z-10 pl-24">{renderTicker('HOME')}</div>
         </div>
        <div className="w-72 flex flex-col items-center justify-center border-x border-white/10 relative overflow-hidden">
            {isCelebratingGoal ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-500/20 animate-pulse-gold">
                  <span className="text-8xl font-black italic text-yellow-400 tracking-tighter drop-shadow-[0_0_30px_rgba(250,204,21,1)]">GOL!</span>
               </div>
            ) : (
               <>
                  <div className="invisible relative translate-y-[5px] whitespace-nowrap text-8xl font-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] tracking-tighter leading-none mb-1" aria-hidden="true">{matchState.homeScore} <span className="text-slate-700 mx-1">&nbsp;&nbsp;&nbsp;</span> {matchState.awayScore}</div>
                  <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-8xl font-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] tracking-tighter leading-none">{matchState.homeScore} <span className="text-slate-700 mx-1">&nbsp;&nbsp;&nbsp;</span> {matchState.awayScore}</div>
                  <div className="flex items-center gap-3">{!matchState.isFinished && <div className="text-xl font-mono font-bold text-emerald-400 animate-pulse bg-emerald-500/10 size-10 flex items-center justify-center rounded-full border border-emerald-500/20">{matchState.minute}</div>}
                  {matchState.addedTime > 0 && !matchState.isFinished && <div className="text-[11px] font-black text-red-500 font-mono">+{matchState.addedTime}</div>}</div>
               </>
            )}
         </div>
         <div className="flex-1 flex flex-col justify-center pl-12 pr-4 text-right relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: kitColors.away.primary }} />
<div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10rem] font-black italic text-white/[0.04] select-none pointer-events-none uppercase tracking-tighter">
      {ctx.awayClub.shortName}
   </div>

            <div className="relative z-10 flex items-center gap-10 justify-end">
               <h1 className="text-6xl font-black italic uppercase tracking-tighter truncate leading-tight drop-shadow-2xl pr-2">{ctx.awayClub.name}</h1>
               <BigJerseyIcon primary={kitColors.away.primary} secondary={kitColors.away.secondary} />

            </div>
            <div className="relative z-10 pr-24">{renderTicker('AWAY')}</div>
         </div>
      </header>

      <div className="flex-1 flex gap-8 min-h-0 overflow-visible">
      <SquadList side="HOME" lineup={matchState.homeLineup.startingXI} players={ctx.homePlayers} fatigue={matchState.homeFatigue} injs={matchState.homeInjuries} subsHistory={matchState.homeSubsHistory} />
        <div className="flex-1 flex flex-col gap-6 min-w-0 max-w-5xl mx-auto">
           
           <div className={`group/momentum h-8 w-full bg-black/55 rounded-[18px] overflow-hidden border border-white/15 flex shadow-[0_22px_70px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.16)] shrink-0 p-1 backdrop-blur-xl relative transition-all duration-200
              ${Math.abs(matchState.momentum) > 85 ? 'animate-shake' : ''}
           `}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60 transition-opacity duration-300 group-hover/momentum:opacity-90" viewBox="0 0 1000 32" preserveAspectRatio="none" aria-hidden>
                <path d="M 0 24 C 96 8, 174 28, 270 12 S 468 24, 572 10 S 764 8, 1000 22" fill="none" stroke={kitColors.home.primary} strokeOpacity="0.62" strokeWidth="1.2" strokeLinecap="round" className="live-momentum-signal" />
                <path d="M 1000 9 C 872 26, 762 7, 650 20 S 428 24, 316 10 S 110 7, 0 20" fill="none" stroke={kitColors.away.primary} strokeOpacity="0.62" strokeWidth="1.2" strokeLinecap="round" className="live-momentum-signal live-momentum-signal-alt" />
                <rect x="-110" y="0" width="70" height="32" fill="#ffffff" opacity="0.10" className="live-momentum-scan" />
              </svg>
              <div className="absolute left-1/2 top-1 bottom-1 w-px -translate-x-1/2 bg-white/45 shadow-[0_0_14px_rgba(255,255,255,0.55)] z-20" />
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              <div 
                className="h-full transition-all duration-300 flex items-center justify-end pr-4 text-[9px] font-black italic uppercase tracking-tighter rounded-l-full shadow-[inset_-10px_0_20px_rgba(0,0,0,0.3)] relative overflow-hidden z-10" 
                style={{ 
                  backgroundColor: kitColors.home.primary, width: `${50 + matchState.momentum / 2}%`, color: kitColors.home.text,
                  boxShadow: matchState.momentum > 75 ? `0 0 25px ${kitColors.home.primary}CC` : 'none'
                }}
              >
                 <div className="absolute inset-0 opacity-35 live-momentum-fill" />
                 <div className={`absolute inset-0 bg-white/20 opacity-0 ${Math.abs(matchState.momentum - (matchState.logs[0]?.type === MatchEventType.GOAL ? 40 : 0)) > 10 ? 'animate-ping' : ''}`} />
                 <span className="relative z-10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">{Math.round(50 + matchState.momentum / 2)}%</span>
              </div>
              <div className="h-full transition-all duration-300 flex items-center justify-start pl-4 text-[9px] font-black italic uppercase tracking-tighter rounded-r-full shadow-[inset_10px_0_20px_rgba(0,0,0,0.3)] relative overflow-hidden z-10" 
                style={{ backgroundColor: kitColors.away.primary, flex: 1, color: kitColors.away.text,
                  boxShadow: matchState.momentum < -75 ? `0 0 25px ${kitColors.away.primary}CC` : 'none'
                }}
              >
                 <div className="absolute inset-0 opacity-35 live-momentum-fill live-momentum-fill-alt" />
                 <span className="relative z-10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">{Math.round(50 - matchState.momentum / 2)}%</span>
              </div>
           </div>




<div className="flex-1 relative p-2 overflow-visible">
  <div 
    className="w-full max-w-[475px] h-[420px] mx-auto bg-emerald-950/20 border border-emerald-300/20 relative overflow-visible shadow-[0_70px_120px_rgba(0,0,0,0.75),0_0_65px_rgba(16,185,129,0.14)]"
    style={{
      aspectRatio: '105 / 68',
      transform: 'perspective(950px) rotateX(24deg) scale(1.19)',
      transformOrigin: 'top center',
      transformStyle: 'preserve-3d',
      background: '#0f6b3d'
    }}
  >
    {/* Tło trawy */}
    <div 
      className="absolute inset-0 bg-[#0f6b3d]"
    />

    <PitchBroadcastOverlay
      homeColor={kitColors.home.primary}
      awayColor={kitColors.away.primary}
      activeSide={matchState.logs[0]?.teamSide}
      eventType={matchState.logs[0]?.type}
      momentum={matchState.momentum}
    />

    {/* Linie boiska */}
    <div className="absolute inset-0 pointer-events-none opacity-70">
      {/* Obwód boiska */}
      <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-white/70" />

      {/* Linia środkowa */}
      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/70 -translate-y-1/2" />

      {/* Koło środkowe */}
      <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/70 rounded-full -translate-x-1/2 -translate-y-1/2" />

      {/* Punkt środkowy */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/70 rounded-full -translate-x-1/2 -translate-y-1/2" />

      {/* === GÓRNA CZĘŚĆ === */}
      
      {/* Górne pole karne (16.5m) */}
      <div className="absolute top-4 left-1/2 w-[50%] h-[20%] -translate-x-1/2">
        <div className="absolute top-0 left-0 w-0.5 h-full bg-white/70" />
        <div className="absolute top-0 right-0 w-0.5 h-full bg-white/70" />
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/70" />
      </div>

      {/* Górne pole bramkowe (5.5m) */}
      <div className="absolute top-4 left-1/2 w-[24%] h-[9%] -translate-x-1/2">
        <div className="absolute top-0 left-0 w-0.5 h-full bg-white/70" />
        <div className="absolute top-0 right-0 w-0.5 h-full bg-white/70" />
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/70" />
      </div>

      {/* Górne półkolo - poniżej pola bramkowego, na linii pola karnego */}
      <div 
        className="absolute left-1/2 w-[18%] h-[38px] -translate-x-1/2"
        style={{
          top: 'calc(4px + 20% - 3px)',
          border: '2px solid rgba(255,255,255,0.7)',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderRadius: '0 0 100% 100%'
        }}
      />

      {/* Górny punkt karny */}
      <div className="absolute left-1/2 w-2 h-2 bg-white/70 rounded-full -translate-x-1/2" style={{ top: 'calc(16px + 11% + 15px)' }} />

      {/* Górny łuk przy punkcie karnym */}
      <div 
        className="absolute left-1/2 w-[40%] h-10 -translate-x-1/2"
        style={{
          top: 'calc(4px + 20% - 6px)',
          border: '2px solid rgba(255,255,255,0.7)',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderRadius: '0 0 100% 100%',
          clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 60%)'
        }}
      />

      {/* === DOLNA CZĘŚĆ === */}
      
      {/* Dolne pole karne (16.5m) */}
      <div className="absolute bottom-4 left-1/2 w-[50%] h-[20%] -translate-x-1/2">
        <div className="absolute bottom-0 left-0 w-0.5 h-full bg-white/70" />
        <div className="absolute bottom-0 right-0 w-0.5 h-full bg-white/70" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/70" />
      </div>

      {/* Dolne pole bramkowe (5.5m) */}
      <div className="absolute bottom-4 left-1/2 w-[24%] h-[9%] -translate-x-1/2">
        <div className="absolute bottom-0 left-0 w-0.5 h-full bg-white/70" />
        <div className="absolute bottom-0 right-0 w-0.5 h-full bg-white/70" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/70" />
      </div>

      {/* Dolne półkolo - powyżej pola bramkowego, na linii pola karnego */}
      <div 
        className="absolute left-1/2 w-[18%] h-[38px] -translate-x-1/2"
        style={{
          bottom: 'calc(4px + 20% - 3px)',
          border: '2px solid rgba(255,255,255,0.7)',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderRadius: '100% 100% 0 0'
        }}
      />

      {/* Dolny punkt karny */}
      <div className="absolute left-1/2 w-2 h-2 bg-white/70 rounded-full -translate-x-1/2" style={{ bottom: 'calc(16px + 11% + 15px)' }} />

      {/* Dolny łuk przy punkcie karnym */}
      <div 
        className="absolute left-1/2 w-[40%] h-10 -translate-x-1/2"
        style={{
          bottom: 'calc(4px + 20% - 6px)',
          border: '2px solid rgba(255,255,255,0.7)',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderRadius: '100% 100% 0 0',
          clipPath: 'polygon(0 40%, 100% 40%, 100% 100%, 0 100%)'
        }}
      />

    {/* === NAROŻNIKI - ćwierćokrąg od punktu narożnego === */}
      {/* Lewy górny - łuk od rogu do środka */}
      <div 
        className="absolute w-5 h-5"
        style={{
          top: '14px',
          left: '14px',
          border: '2px solid rgba(255,255,255,0.7)',
          borderTop: 'none',
          borderLeft: 'none',
          borderRadius: '0 0 100% 0'
        }}
      />
      
      {/* Prawy górny - łuk od rogu do środka */}
      <div 
        className="absolute w-5 h-5"
        style={{
          top: '14px',
          right: '14px',
          border: '2px solid rgba(255,255,255,0.7)',
          borderTop: 'none',
          borderRight: 'none',
          borderRadius: '0 0 0 100%'
        }}
      />
      
      {/* Lewy dolny - łuk od rogu do środka */}
      <div 
        className="absolute w-5 h-5"
        style={{
          bottom: '14px',
          left: '14px',
          border: '2px solid rgba(255,255,255,0.7)',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRadius: '0 100% 0 0'
        }}
      />
      
      {/* Prawy dolny - łuk od rogu do środka */}
      <div 
        className="absolute w-5 h-5"
        style={{
          bottom: '14px',
          right: '14px',
          border: '2px solid rgba(255,255,255,0.7)',
          borderBottom: 'none',
          borderRight: 'none',
          borderRadius: '100% 0 0 0'
        }}
      />

      {/* === BRAMKI (wizualizacja linii bramkowych) === */}
      {/* Górna bramka */}
      <div className="absolute top-4 left-1/2 w-[10%] h-1 bg-white/70 -translate-x-1/2" />
      
      {/* Dolna bramka */}
      <div className="absolute bottom-4 left-1/2 w-[10%] h-1 bg-white/70 -translate-x-1/2" />



   
    </div>


    {/* Ikony DOMOWI – mniejsze, lepiej rozłożone */}
    {TacticRepository.getById(matchState.homeLineup.tacticId).slots.map((slot, i) => {
      const pId = matchState.homeLineup.startingXI[i];
      if (!pId) return null;
      const p = ctx.homePlayers.find(px => px.id === pId);
      if (!p || matchState.sentOffIds.includes(p.id)) return null;
      const injury = matchState.homeInjuries[pId];
const hasScored = matchState.homeGoals.some(g => (g.scorerId ? g.scorerId === p.id : g.playerName === p.lastName) && !g.isMiss && !g.varDisallowed);
      return (
        <div
  key={`h-${p.id}`}
  onClick={() => handleOpenPlayerCard(p.id)}
  className="absolute flex flex-col items-center z-20 transition-all duration-1000 cursor-pointer group/live-player"
  style={{
    left: `${slot.x * 100}%`,
    top: `calc(${(slot.y * 0.42 + 0.54) * 100}% + ${slot.role === PlayerPosition.FWD ? -31 : slot.role === PlayerPosition.MID ? -29 : slot.role === PlayerPosition.DEF ? -10 : slot.role === PlayerPosition.GK ? 6 : 0}px)`,
    transform: 'translate(-50%, -50%) scale(1.265)'
  }}
        >
          {hasScored && (
            <div className="absolute w-2 h-2 bg-white rounded-full flex items-center justify-center text-[8px] shadow-lg border border-black z-30" style={{ top: '-5px', left: 'calc(50% - 13px)' }}>
              ⚽
            </div>
          )}
          <div className="relative group/player">
            <div
              className="absolute inset-[-12px] rounded-full blur-xl opacity-0 group-hover/live-player:opacity-65 transition-opacity duration-300"
              style={{ backgroundColor: kitColors.home.primary }}
            />
            <div
              className={`relative w-6 h-6 rounded-full border-2 border-white/55 shadow-[0_8px_14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] flex flex-col overflow-hidden transform -rotate-3 transition-all duration-300 group-hover/player:rotate-0 group-hover/player:scale-115 ${injury === InjurySeverity.SEVERE ? 'grayscale opacity-50' : ''}`}
              style={{ backgroundColor: kitColors.home.primary, borderColor: kitColors.home.secondary }}
            >
              <div className="absolute inset-x-0 top-0 h-[68%]" style={{ backgroundColor: kitColors.home.primary }} />
              <div className="absolute inset-x-0 bottom-0 h-[32%]" style={{ backgroundColor: kitColors.home.secondary }} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/35" />
              <div className="relative flex-1 flex items-center justify-center text-[8px] font-black italic uppercase tracking-tighter" style={{ color: kitColors.home.text, textShadow: '0 2px 5px rgba(0,0,0,0.85)' }}>
                {p.overallRating}
              </div>
            </div>
            {matchState.playerYellowCards[p.id] > 0 && <div className="absolute -top-1.5 -right-1.5 w-2.5 h-3.5 bg-yellow-400 rounded-sm shadow-lg rotate-6" />}
          </div>
          {injury && <div className={`absolute flex items-center justify-center text-[12px] z-30 ${injury === InjurySeverity.SEVERE ? 'text-red-400 animate-bounce' : 'text-white animate-pulse'}`} style={{ bottom: '19px', right: 'calc(50% - 18px)' }}>✚</div>}
          <div 
            className={`text-[8px] font-black whitespace-nowrap italic tracking-tighter z-50 relative ${injury ? 'text-red-400' : 'text-white'}`}
            style={{ marginTop: '-2px', textShadow: '0 3px 10px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.8)' }}
          >
            {p.firstName.charAt(0)}. {p.lastName}
          </div>
        </div>
      );
    })}

{/* Ikony GOŚCIE – symetrycznie */}
{TacticRepository.getById(matchState.awayLineup.tacticId).slots.map((slot, i) => {
  const pId = matchState.awayLineup.startingXI[i];
  if (!pId) return null;
  const p = ctx.awayPlayers.find(px => px.id === pId);
  if (!p || matchState.sentOffIds.includes(p.id)) return null;
  const injury = matchState.awayInjuries[pId];
 const hasScored = matchState.awayGoals.some(g => (g.scorerId ? g.scorerId === p.id : g.playerName === p.lastName) && !g.isMiss && !g.varDisallowed);
  return (
    <div
      key={`a-${p.id}`}
      onClick={() => handleOpenPlayerCard(p.id)}
      className="absolute flex flex-col items-center z-20 transition-all duration-1000 cursor-pointer group/live-player"
      style={{
        left: `calc(${slot.x * 100}% + ${slot.role === PlayerPosition.MID ? (slot.x < 0.5 ? -4 : slot.x > 0.5 ? 4 : 0) : 0}px)`,
        top: `calc(${(0.48 - slot.y * 0.42) * 100}% + ${slot.role === PlayerPosition.FWD ? 18 : slot.role === PlayerPosition.MID ? 27 : slot.role === PlayerPosition.DEF ? 6 : slot.role === PlayerPosition.GK ? -16 : 0}px)`,
        transform: 'translate(-50%, -50%) scale(1.4)'
      }}
    >
      {hasScored && (
        <div className="absolute w-2 h-2 bg-white rounded-full flex items-center justify-center text-[8px] shadow-lg border border-black z-30" style={{ top: '-5px', right: 'calc(50% - 12px)' }}>
          ⚽
        </div>
      )}
      <div className="relative group/player">
        <div
          className="absolute inset-[-12px] rounded-full blur-xl opacity-0 group-hover/live-player:opacity-65 transition-opacity duration-300"
          style={{ backgroundColor: kitColors.away.primary }}
        />
        <div
          className={`relative w-6 h-6 rounded-full border-2 border-white/55 shadow-[0_8px_14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] flex flex-col overflow-hidden transform rotate-3 transition-all duration-300 group-hover/player:rotate-0 group-hover/player:scale-115 ${injury === InjurySeverity.SEVERE ? 'grayscale opacity-50' : ''}`}
          style={{ backgroundColor: kitColors.away.primary, borderColor: kitColors.away.secondary }}
        >
          <div className="absolute inset-x-0 top-0 h-[68%]" style={{ backgroundColor: kitColors.away.primary }} />
          <div className="absolute inset-x-0 bottom-0 h-[32%]" style={{ backgroundColor: kitColors.away.secondary }} />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/35" />
          <div className="relative flex-1 flex items-center justify-center text-[8px] font-black italic uppercase tracking-tighter" style={{ color: kitColors.away.text, textShadow: '0 2px 5px rgba(0,0,0,0.85)' }}>
            {p.overallRating}
          </div>
        </div>
        {matchState.playerYellowCards[p.id] > 0 && <div className="absolute -top-1.5 -left-1.5 w-2.5 h-3.5 bg-yellow-400 rounded-sm shadow-lg -rotate-6" />}
      </div>
      {injury && <div className={`absolute flex items-center justify-center text-[12px] z-30 ${injury === InjurySeverity.SEVERE ? 'text-red-400 animate-bounce' : 'text-white animate-pulse'}`} style={{ bottom: '-2px', left: 'calc(50% - 18px)' }}>✚</div>}
      <div className={`text-[8px] font-black whitespace-nowrap italic tracking-tighter z-50 relative ${injury ? 'text-red-400' : 'text-white'}`} style={{ marginTop: '-2px', textShadow: '0 2px 8px rgba(0, 0, 0, 0.65)' }}>
        {p.firstName.charAt(0)}. {p.lastName}
      </div>
    </div>
  );
})}
  </div>
</div>
              
                              <div className={`fixed bottom-[29px] left-1/2 -translate-x-1/2 z-[1100] flex flex-col items-center gap-2 max-w-5xl transition-opacity duration-200 ${isTacticsOpen ? 'opacity-0 pointer-events-none' : showBriefing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
  <div className="h-px w-full max-w-[760px] bg-gradient-to-r from-transparent via-teal-300/60 to-transparent shadow-[0_0_12px_rgba(94,234,212,0.35)]" />
  {matchState.isFinished ? (
    <div className="flex gap-3 justify-center py-3 px-8 bg-white/5 border border-white/10 rounded-[28px] shadow-2xl">
      <button
        onClick={() => setShowCommentHistory(!showCommentHistory)}
        className="min-w-[60px] py-3 px-6 rounded-xl bg-white/5 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-slate-300 font-black italic uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:translate-y-[2px] flex items-center justify-center gap-2"
        style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
      >
        HISTORIA
      </button>
      <button
        onClick={handleFinishMatch}
        className="min-w-[160px] py-3 px-10 rounded-2xl bg-emerald-600/20 border-t border-x border-b border-t-emerald-400/40 border-x-emerald-500/20 border-b-black/60 text-emerald-400 font-black italic uppercase tracking-tighter text-base transition-all hover:scale-105 active:translate-y-[2px] hover:bg-emerald-600/30 flex items-center justify-center gap-3 group"
        style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
      >
        <span>STUDIO POMECZOWE</span>
        <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
      </button>
    </div>
  ) : (
    <div
      className="relative flex flex-col items-center gap-2 py-2.5 px-6 shadow-[0_12px_36px_rgba(0,0,0,0.42)] backdrop-blur-md"
      style={{
        background: 'linear-gradient(180deg, rgba(5, 96, 64, 0.48), rgba(3, 63, 46, 0.54))',
        boxShadow: '0 12px 36px rgba(0,0,0,0.34), inset 0 1px 0 rgba(134,239,172,0.12), inset 0 -1px 0 rgba(0,0,0,0.22)',
      }}
    >
      {/* ── GÓRNY RZĄD: Tempo / Postawa / Styl gry ── */}
      <div className="relative z-10 flex gap-[3px] justify-center">
      {/* ── TEMPO ── */}
      {(() => {
        const cd = matchState.userInstructions.tempoCooldown;
        const locked = cd > 0 && matchState.minute < cd;
        const remaining = locked ? cd - matchState.minute : 0;
        const cur = matchState.userInstructions.tempo;
        const pick = (val: InstructionTempo) => setMatchState(s => {
          if (!s) return s;
          const c = s.userInstructions.tempoCooldown;
          if (c > 0 && s.minute < c) return s;
          if (s.userInstructions.tempo === val) return s;
          const rf = val === 'NORMAL' ? 1.0 : parseFloat((0.6 + Math.random() * 0.8).toFixed(2));
          const cooldown = s.minute + 5 + Math.floor(Math.random() * 6);
          return { ...s, userInstructions: { ...s.userInstructions, tempo: val, tempoExpiry: -1, tempoCooldown: cooldown, tempoResponseFactor: rf } };
        });
        return (
          <div className={`relative flex flex-col items-center gap-0.5 px-0 py-1 transition-opacity ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[8px] text-yellow-500 font-black italic uppercase tracking-tighter">
              {locked ? `Tempo – blokada ${remaining}'` : 'Tempo'}
            </span>
            {renderTacticalSelect({
              value: cur,
              locked,
              accent: '#facc15',
              onPick: pick,
              options: [
                { val: 'SLOW' as InstructionTempo, label: 'Wolno' },
                { val: 'NORMAL' as InstructionTempo, label: 'Normalnie' },
                { val: 'FAST' as InstructionTempo, label: 'Szybko' },
              ],
            })}
          </div>
        );
      })()}

      {/* ── POSTAWA ── */}
      {(() => {
        const cd = matchState.userInstructions.mindsetCooldown;
        const locked = cd > 0 && matchState.minute < cd;
        const remaining = locked ? cd - matchState.minute : 0;
        const cur = matchState.userInstructions.mindset;
        const pick = (val: InstructionMindset) => setMatchState(s => {
          if (!s) return s;
          const c = s.userInstructions.mindsetCooldown;
          if (c > 0 && s.minute < c) return s;
          if (s.userInstructions.mindset === val) return s;
          const rf = val === 'NEUTRAL' ? 1.0 : parseFloat((0.6 + Math.random() * 0.8).toFixed(2));
          const cooldown = s.minute + 5 + Math.floor(Math.random() * 6);
          return { ...s, userInstructions: { ...s.userInstructions, mindset: val, mindsetExpiry: -1, mindsetCooldown: cooldown, mindsetResponseFactor: rf } };
        });
        return (
          <div className={`relative flex flex-col items-center gap-0.5 px-0 py-1 transition-opacity ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[8px] text-yellow-500 font-black italic uppercase tracking-tighter">
              {locked ? `Postawa – blokada ${remaining}'` : 'Postawa'}
            </span>
            {renderTacticalSelect({
              value: cur,
              locked,
              accent: '#facc15',
              onPick: pick,
              options: [
                { val: 'DEFENSIVE' as InstructionMindset, label: 'Defensywna' },
                { val: 'NEUTRAL' as InstructionMindset, label: 'Neutralna' },
                { val: 'OFFENSIVE' as InstructionMindset, label: 'Ofensywna' },
              ],
            })}
          </div>
        );
      })()}

      {/* ── STYL GRY ── */}
      {(() => {
        const cd = matchState.userInstructions.intensityCooldown;
        const locked = cd > 0 && matchState.minute < cd;
        const remaining = locked ? cd - matchState.minute : 0;
        const cur = matchState.userInstructions.intensity;
        const pick = (val: InstructionIntensity) => setMatchState(s => {
          if (!s) return s;
          const c = s.userInstructions.intensityCooldown;
          if (c > 0 && s.minute < c) return s;
          if (s.userInstructions.intensity === val) return s;
          const rf = val === 'NORMAL' ? 1.0 : parseFloat((0.6 + Math.random() * 0.8).toFixed(2));
          const cooldown = s.minute + 5 + Math.floor(Math.random() * 6);
          return { ...s, userInstructions: { ...s.userInstructions, intensity: val, intensityExpiry: -1, intensityCooldown: cooldown, intensityResponseFactor: rf } };
        });
        return (
          <div className={`relative flex flex-col items-center gap-0.5 px-0 py-1 transition-opacity ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[8px] text-yellow-500 font-black italic uppercase tracking-tighter">
              {locked ? `Styl gry – blokada ${remaining}'` : 'Styl gry'}
            </span>
            {renderTacticalSelect({
              value: cur,
              locked,
              accent: '#facc15',
              onPick: pick,
              options: [
                { val: 'CAUTIOUS' as InstructionIntensity, label: 'Ostrożnie' },
                { val: 'NORMAL' as InstructionIntensity, label: 'Normalnie' },
                { val: 'AGGRESSIVE' as InstructionIntensity, label: 'Agresywnie' },
              ],
            })}
          </div>
        );
      })()}

      {/* ── PODANIA ── */}
      {(() => {
        const cd = matchState.userInstructions.passingCooldown;
        const locked = cd > 0 && matchState.minute < cd;
        const remaining = locked ? cd - matchState.minute : 0;
        const cur = matchState.userInstructions.passing ?? 'MIXED';
        const pick = (val: InstructionPassing) => setMatchState(s => {
          if (!s) return s;
          const c = s.userInstructions.passingCooldown;
          if (c > 0 && s.minute < c) return s;
          if (s.userInstructions.passing === val) return s;
          const rf = val === 'MIXED' ? 1.0 : parseFloat((0.6 + Math.random() * 0.8).toFixed(2));
          const cooldown = s.minute + 5 + Math.floor(Math.random() * 6);
          return { ...s, userInstructions: { ...s.userInstructions, passing: val, passingCooldown: cooldown, passingResponseFactor: rf } };
        });
        return (
          <div className={`relative flex flex-col items-center gap-0.5 px-0 py-1 transition-opacity ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[8px] text-yellow-500 font-black italic uppercase tracking-tighter">
              {locked ? `Podania – blokada ${remaining}'` : 'Podania'}
            </span>
            {renderTacticalSelect({
              value: cur,
              locked,
              accent: '#facc15',
              onPick: pick,
              options: [
                { val: 'SHORT' as InstructionPassing, label: 'Krótkie' },
                { val: 'MIXED' as InstructionPassing, label: 'Mieszane' },
                { val: 'LONG' as InstructionPassing, label: 'Długie' },
              ],
            })}
          </div>
        );
      })()}

      {/* ── PRESSING ── */}
      {(() => {
        const cd = matchState.userInstructions.pressingCooldown;
        const locked = cd > 0 && matchState.minute < cd;
        const remaining = locked ? cd - matchState.minute : 0;
        const cur = matchState.userInstructions.pressing ?? 'NORMAL';
        const pick = (val: InstructionPressing) => setMatchState(s => {
          if (!s) return s;
          const c = s.userInstructions.pressingCooldown;
          if (c > 0 && s.minute < c) return s;
          if (s.userInstructions.pressing === val) return s;
          const rf = val === 'NORMAL' ? 1.0 : parseFloat((0.6 + Math.random() * 0.8).toFixed(2));
          const cooldown = s.minute + 5 + Math.floor(Math.random() * 6);
          return { ...s, userInstructions: { ...s.userInstructions, pressing: val, pressingCooldown: cooldown, pressingResponseFactor: rf } };
        });
        return (
          <div className={`relative flex flex-col items-center gap-0.5 px-0 py-1 transition-opacity ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[8px] text-yellow-500 font-black italic uppercase tracking-tighter">
              {locked ? `Pressing – blokada ${remaining}'` : 'Pressing'}
            </span>
            {renderTacticalSelect({
              value: cur,
              locked,
              accent: '#facc15',
              onPick: pick,
              options: [
                { val: 'NORMAL' as InstructionPressing, label: 'Normalnie' },
                { val: 'PRESSING' as InstructionPressing, label: 'Pressing' },
              ],
            })}
          </div>
        );
      })()}
      {(() => {
        const cd = matchState.userInstructions.counterAttackCooldown ?? -1;
        const locked = cd > 0 && matchState.minute < cd;
        const remaining = locked ? cd - matchState.minute : 0;
        const cur = matchState.userInstructions.counterAttack ?? 'NORMAL';
        const pick = (val: InstructionCounterAttack) => setMatchState(s => {
          if (!s) return s;
          const c = s.userInstructions.counterAttackCooldown ?? -1;
          if (c > 0 && s.minute < c) return s;
          if ((s.userInstructions.counterAttack ?? 'NORMAL') === val) return s;
          const rf = val === 'NORMAL' ? 1.0 : parseFloat((0.6 + Math.random() * 0.8).toFixed(2));
          const cooldown = s.minute + 5 + Math.floor(Math.random() * 6);
          return { ...s, userInstructions: { ...s.userInstructions, counterAttack: val, counterAttackCooldown: cooldown, counterAttackResponseFactor: rf } };
        });
        return (
          <div className={`relative flex flex-col items-center gap-0.5 px-0 py-1 transition-opacity ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-[8px] text-yellow-500 font-black italic uppercase tracking-tighter">
              {locked ? `Kontra - blokada ${remaining}'` : 'Kontra'}
            </span>
            {renderTacticalSelect({
              value: cur,
              locked,
              accent: '#facc15',
              onPick: pick,
              options: [
                { val: 'NORMAL' as InstructionCounterAttack, label: 'Nie' },
                { val: 'COUNTER' as InstructionCounterAttack, label: 'Tak' },
              ],
            })}
          </div>
        );
      })()}
      </div>

      <div className="relative z-10 h-px w-full max-w-[760px] bg-gradient-to-r from-transparent via-yellow-400/45 to-transparent shadow-[0_0_12px_rgba(250,204,21,0.22)]" />

      {/* ── DOLNY RZĄD: Historia / Taktyka / Prędkość + Start ── */}
      <div className="relative z-10 flex gap-3 justify-center">
        <button
          onClick={() => setShowCommentHistory(!showCommentHistory)}
          className="relative min-w-[120px] py-2 px-6 rounded-xl bg-sky-600/18 border-t border-x border-b border-t-sky-400/45 border-x-sky-500/25 border-b-black/60 text-sky-200 font-black italic uppercase tracking-widest text-xs hover:bg-sky-600/28 hover:text-sky-100 transition-all hover:scale-105 active:translate-y-[2px] flex items-center justify-center gap-2"
          style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
        >
          HISTORIA
        </button>

        <button
          onClick={() => { setIsTacticsOpen(true); setMatchState(s => s ? {...s, isPaused: true} : s); }}
          className="relative min-w-[110px] py-2 px-6 rounded-xl bg-violet-600/18 border-t border-x border-b border-t-violet-400/45 border-x-violet-500/25 border-b-black/60 text-violet-200 font-black italic uppercase tracking-widest text-xs hover:bg-violet-600/28 hover:text-violet-100 transition-all hover:scale-105 active:translate-y-[2px] flex items-center justify-center gap-2"
          style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
        >
          TAKTYKA
        </button>

        <button
          disabled={hasMandatorySub}
          onClick={() => matchState.isHalfTime ? setMatchState(s => s ? {...s, isHalfTime: false, isPaused: false, period: 2, minute: 45, addedTime: 0, momentum: Math.max(-100, Math.min(100, s.momentum + (s.halftimeMomentumBonus || 0) + (s.oppHalftimeMomentumBonus || 0))), halftimeMomentumBonus: 0, oppHalftimeMomentumBonus: 0} : s) : setMatchState(s => s ? {...s, isPaused: !s.isPaused, isPausedForEvent: false, flashMessage: null} : s)}
          className={`relative min-w-[132px] py-2 px-5 rounded-xl font-black italic uppercase tracking-widest text-sm transition-all hover:scale-105 active:translate-y-[2px] border-t border-x border-b
            ${hasMandatorySub
              ? 'bg-red-600/20 border-t-red-400/40 border-x-red-500/20 border-b-black/60 text-red-500 hover:bg-red-600/30'
              : matchState.isPaused || matchState.isHalfTime
                ? 'bg-emerald-600/25 border-t-emerald-400/45 border-x-emerald-500/25 border-b-black/60 text-emerald-300 hover:bg-emerald-600/35'
                : 'bg-red-600/25 border-t-red-400/45 border-x-red-500/25 border-b-black/60 text-red-300 hover:bg-red-600/35'
            }
          `}
          style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
        >
          {getActionLabel()}
        </button>

        <div
          className="relative flex overflow-hidden rounded-xl border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 bg-white/5"
          style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          aria-label="Sterowanie meczem i tempo meczu"
        >
          {([1, 2.5, 3.5, 5] as const).map((speed, index) => {
            const active = matchState.speed === speed;
            const tone = speed === 1
              ? { active: 'bg-emerald-600/30 text-emerald-200 shadow-[inset_0_1px_0_rgba(110,231,183,0.35),inset_0_-10px_22px_rgba(5,150,105,0.18)]', idle: 'text-emerald-200/65 hover:bg-emerald-500/12 hover:text-emerald-100' }
              : speed === 2.5
              ? { active: 'bg-sky-600/30 text-sky-200 shadow-[inset_0_1px_0_rgba(125,211,252,0.35),inset_0_-10px_22px_rgba(2,132,199,0.18)]', idle: 'text-sky-200/65 hover:bg-sky-500/12 hover:text-sky-100' }
              : speed === 3.5
              ? { active: 'bg-violet-600/30 text-violet-200 shadow-[inset_0_1px_0_rgba(196,181,253,0.35),inset_0_-10px_22px_rgba(124,58,237,0.18)]', idle: 'text-violet-200/65 hover:bg-violet-500/12 hover:text-violet-100' }
              : { active: 'bg-rose-600/30 text-rose-200 shadow-[inset_0_1px_0_rgba(251,113,133,0.35),inset_0_-10px_22px_rgba(225,29,72,0.18)]', idle: 'text-rose-200/65 hover:bg-rose-500/12 hover:text-rose-100' };
            return (
              <button
                key={speed}
                onClick={() => setMatchState(s => s ? { ...s, speed } : s)}
                className={`relative min-w-[54px] py-2 px-3 font-black italic uppercase tracking-tighter text-xs transition-all active:translate-y-[1px] ${
                  active ? tone.active : tone.idle
                } ${index > 0 ? 'border-l border-white/10' : ''}`}
              >
                {speed}x
              </button>
            );
          })}
        </div>
      </div>
    </div>
  )}


</div>


        </div>

       <SquadList side="AWAY" lineup={matchState.awayLineup.startingXI} players={ctx.awayPlayers} fatigue={matchState.awayFatigue} injs={matchState.awayInjuries} subsHistory={matchState.awaySubsHistory} />
      </div>

    {matchState.logs.length > 0 && (
      <>
        <div
          className="fixed left-1/2 -translate-x-1/2 z-30 h-[2px] w-[760px] max-w-[72vw] bg-white/90 shadow-[0_0_14px_rgba(255,255,255,0.62)]"
          style={{ bottom: 'calc(15rem + 4px)' }}
        />
        <div className="fixed left-1/2 -translate-x-1/2 z-30 flex justify-center" style={{ bottom: 'calc(15rem - 62px)' }}>
          {(() => {
            const latestLog = matchState.logs[0];
            const isHome = latestLog.teamSide === 'HOME';
            const bgColor = isHome ? kitColors!.home.primary : kitColors!.away.primary;
            const textColor = getContrastColor(bgColor);

            return (
              <div
                className="w-fit max-w-[min(90vw,68.6rem)] px-8 py-3.5 rounded-[11px] shadow-2xl border border-white/20 backdrop-blur-md"
                style={{ backgroundColor: bgColor }}
              >
                <span
                  className="block text-center text-lg font-black italic uppercase tracking-tight"
                  style={{ color: textColor }}
                >
                  {latestLog.text}
                </span>
              </div>
            );
          })()}
        </div>
      </>
    )}


      {showBriefing && ctx && matchState && (
        <PreMatchBriefingModal
          isOpen={showBriefing}
          onClose={handleBriefingClose}
          userClubName={userSide === 'HOME' ? ctx.homeClub.name : ctx.awayClub.name}
          oppClubName={userSide === 'HOME' ? ctx.awayClub.name : ctx.homeClub.name}
          userRep={userSide === 'HOME' ? ctx.homeClub.reputation : ctx.awayClub.reputation}
          oppRep={userSide === 'HOME' ? ctx.awayClub.reputation : ctx.homeClub.reputation}
          userClubColors={userSide === 'HOME' ? ctx.homeClub.colorsHex : ctx.awayClub.colorsHex}
          oppClubColors={userSide === 'HOME' ? ctx.awayClub.colorsHex : ctx.homeClub.colorsHex}
          userClubId={userSide === 'HOME' ? ctx.homeClub.id : ctx.awayClub.id}
          oppClubId={userSide === 'HOME' ? ctx.awayClub.id : ctx.homeClub.id}
          sessionSeed={matchState.sessionSeed}
          leagueMotivationContext={leagueMotivationContext}
        />
      )}

      {isTacticsOpen && (
        <div className="fixed inset-0 z-[990] backdrop-blur-md bg-black/40 pointer-events-none" />
      )}

      <MatchTacticsModal isOpen={isTacticsOpen} onClose={handleTacticsClose} club={userSide === 'HOME' ? ctx.homeClub : ctx.awayClub} lineup={userSide === 'HOME' ? matchState.homeLineup : matchState.awayLineup} players={userSide === 'HOME' ? ctx.homePlayers : ctx.awayPlayers} fatigue={userSide === 'HOME' ? matchState.homeFatigue : matchState.awayFatigue} subsCount={userSide === 'HOME' ? matchState.subsCountHome : matchState.subsCountAway} subsHistory={userSide === 'HOME' ? matchState.homeSubsHistory : matchState.awaySubsHistory} minute={matchState.minute} sentOffIds={matchState.sentOffIds} injs={userSide === 'HOME' ? matchState.homeInjuries : matchState.awayInjuries} />
      <style>{`
        @keyframes shine { from { left: -150%; } to { left: 150%; } }
        .animate-shine { animation: shine 3s infinite linear; }
        @keyframes pulse-gold { 0%, 100% { transform: scale(1); filter: brightness(1.2); } 50% { transform: scale(1.1); filter: brightness(1.8); } }
        .animate-pulse-gold { animation: pulse-gold 0.6s infinite ease-in-out; }
        @keyframes shake { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(2px, 2px); } 50% { transform: translate(-2px, -2px); } 75% { transform: translate(2px, -2px); } }
        .animate-shake { animation: shake 0.15s infinite linear; }
        @keyframes scale-up { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        @keyframes slide-up { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes live-action-dash { from { stroke-dashoffset: 80; opacity: 0.15; } 35% { opacity: 1; } to { stroke-dashoffset: 0; opacity: 0.35; } }
        @keyframes live-action-dot { 0% { transform: scale(0.7); opacity: 0.2; } 45% { transform: scale(1.7); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.45; } }
        @keyframes live-signal-flow { from { stroke-dashoffset: 120; } to { stroke-dashoffset: 0; } }
        @keyframes live-panel-sweep { from { transform: translateX(-15%); opacity: 0; } 28% { opacity: 0.45; } 66% { opacity: 0.12; } to { transform: translateX(135%); opacity: 0; } }
        @keyframes live-tactical-button-sweep { from { transform: translateX(-40%); opacity: 0; } 35% { opacity: 0.55; } to { transform: translateX(170%); opacity: 0; } }
        @keyframes live-momentum-fill { from { background-position: 0 0; } to { background-position: 42px 0; } }
        .live-action-path { stroke-dashoffset: 80; animation: live-action-dash 1.55s cubic-bezier(.2,.9,.2,1) infinite; }
        .live-action-dot { transform-origin: center; transform-box: fill-box; animation: live-action-dot 1.55s cubic-bezier(.2,.9,.2,1) infinite; }
        .live-header-signal, .live-tactics-wave, .live-squad-signal, .live-momentum-signal {
          stroke-dasharray: 10 12;
          animation: live-signal-flow 5.4s linear infinite;
        }
        .live-momentum-signal {
          stroke-dasharray: 14 14;
          animation-duration: 4.6s;
        }
        .live-momentum-signal-alt {
          animation-direction: reverse;
          animation-duration: 5.8s;
        }
        .live-tactical-button-line {
          stroke-dasharray: 8 10;
          animation: live-signal-flow 4.8s linear infinite;
        }
        .live-tactical-button-scan {
          animation: live-tactical-button-sweep 4.2s ease-in-out infinite;
        }
        .live-momentum-scan {
          animation: live-panel-sweep 4.8s ease-in-out infinite;
        }
        .live-momentum-fill {
          background-image: repeating-linear-gradient(115deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 14px);
          background-size: 42px 100%;
          animation: live-momentum-fill 1.9s linear infinite;
        }
        .live-momentum-fill-alt {
          animation-direction: reverse;
        }
        .live-header-signal-alt, .live-tactics-wave-alt, .live-squad-signal-slow {
          animation-duration: 7.2s;
          animation-direction: reverse;
        }
        .live-panel-scan {
          animation: live-panel-sweep 5.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .live-action-path, .live-action-dot, .live-header-signal, .live-tactics-wave, .live-squad-signal, .live-panel-scan, .live-tactical-button-line, .live-tactical-button-scan, .live-momentum-signal, .live-momentum-scan, .live-momentum-fill {
            animation: none !important;
          }
        }
      `}</style>
    </div>

      {showCommentHistory && (
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900/95 border-l border-white/10  z-[400] overflow-y-auto p-4 space-y-2">
        <div className="sticky top-0 bg-slate-900/95 p-2 mb-4 flex justify-between items-center">
          <h3 className="text-white font-black uppercase tracking-widest text-sm">HISTORIA</h3>
          <button 
            onClick={() => setShowCommentHistory(false)} 
            className="text-white text-2xl hover:text-slate-300 transition-colors"
          >
            ×
          </button>
        </div>
        
        {matchState.logs.map((log) => {
          const isHome = log.teamSide === 'HOME';
          const isAway = log.teamSide === 'AWAY';
          const teamColor = isHome ? kitColors!.home.primary : isAway ? kitColors!.away.primary : null;
          return (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-white/10 text-xs text-slate-200 hover:brightness-125 transition-all"
              style={{
                backgroundColor: teamColor ? hexToRgba(teamColor, 0.10) : 'rgba(255,255,255,0.05)',
                borderLeftColor: teamColor ?? undefined,
                borderLeftWidth: teamColor ? '3px' : undefined,
              }}
            >
              <span className="inline-flex items-center justify-center min-w-[28px] h-5 rounded-full bg-white text-black font-black text-[9px] px-1 mr-1.5 shrink-0">{log.minute}'</span>{log.text}
            </div>
          );
        })}
      </div>
    )}

{(() => {
        const isHome = userSide === 'HOME';
        const uXI  = isHome ? matchState.homeLineup.startingXI : matchState.awayLineup.startingXI;
        const oXI  = isHome ? matchState.awayLineup.startingXI : matchState.homeLineup.startingXI;
        const uFat = isHome ? matchState.homeFatigue : matchState.awayFatigue;
        const validIds = uXI.filter((id): id is string => id !== null);
        const avgUserFatigue = validIds.length > 0 ? validIds.reduce((acc, id) => acc + (uFat[id] ?? 100), 0) / validIds.length : 100;
        const uStats = isHome ? matchState.liveStats.home : matchState.liveStats.away;
        const oStats = isHome ? matchState.liveStats.away : matchState.liveStats.home;
        const uYellows = uXI.filter((id): id is string => id !== null).filter(id => (matchState.playerYellowCards[id] || 0) >= 1).length;
        const oYellows = oXI.filter((id): id is string => id !== null).filter(id => (matchState.playerYellowCards[id] || 0) >= 1).length;
        const avgMomentum = matchState.momentumTicks > 0 ? matchState.momentumSum / matchState.momentumTicks : 0;
        const userPossession = Math.round(Math.max(20, Math.min(80, 50 + avgMomentum * 0.3)));
        const uScore = isHome ? matchState.homeScore : matchState.awayScore;
        const oScore = isHome ? matchState.awayScore : matchState.homeScore;
        const uRedCards = (isHome ? matchState.sentOffIds.filter(id => ctx.homePlayers.some(p => p.id === id)) : matchState.sentOffIds.filter(id => ctx.awayPlayers.some(p => p.id === id))).length;
        const oRedCards = (isHome ? matchState.sentOffIds.filter(id => ctx.awayPlayers.some(p => p.id === id)) : matchState.sentOffIds.filter(id => ctx.homePlayers.some(p => p.id === id))).length;
        const calibratedUserStats = buildDisplayStats(uStats, uScore, uYellows, uRedCards, userPossession, matchState.sessionSeed, isHome ? 1000 : 2000);
        const calibratedOppStats = buildDisplayStats(oStats, oScore, oYellows, oRedCards, 100 - userPossession, matchState.sessionSeed, isHome ? 2000 : 1000);
        return (
          <HalftimeTalkModal
            isOpen={isHalftimeTalkOpen}
            onClose={handleHalftimeTalk}
            userScore={isHome ? matchState.homeScore : matchState.awayScore}
            oppScore={isHome ? matchState.awayScore : matchState.homeScore}
            userSide={userSide}
            homeClubName={ctx.homeClub.name}
            awayClubName={ctx.awayClub.name}
            homeClubColors={ctx.homeClub.colorsHex}
            awayClubColors={ctx.awayClub.colorsHex}
            homeKitPrimary={kitColors.home.primary}
            homeKitSecondary={kitColors.home.secondary}
            awayKitPrimary={kitColors.away.primary}
            awayKitSecondary={kitColors.away.secondary}
            userShots={calibratedUserStats.shots}
            userShotsOnTarget={calibratedUserStats.shotsOnTarget}
            userCorners={calibratedUserStats.corners}
            userFouls={calibratedUserStats.fouls}
            userYellowCards={uYellows}
            oppShots={calibratedOppStats.shots}
            oppShotsOnTarget={calibratedOppStats.shotsOnTarget}
            oppCorners={calibratedOppStats.corners}
            oppFouls={calibratedOppStats.fouls}
            oppYellowCards={oYellows}
            userPossession={userPossession}
            momentumEndOf1st={matchState.momentum}
            avgFatigue={avgUserFatigue}
            sessionSeed={matchState.sessionSeed}
            leagueMotivationContext={leagueMotivationContext}
          />
        );
      })()}

    {showPostMatchDebrief && pendingFinishPayload && (
      <PostMatchDebriefModal
        isOpen={true}
        onClose={handleDebriefClose}
        context={pendingFinishPayload.debriefContext}
        userScore={pendingFinishPayload.matchHistoryArgs.homeTeamId === userTeamId ? pendingFinishPayload.matchHistoryArgs.homeScore : pendingFinishPayload.matchHistoryArgs.awayScore}
        oppScore={pendingFinishPayload.matchHistoryArgs.homeTeamId === userTeamId ? pendingFinishPayload.matchHistoryArgs.awayScore : pendingFinishPayload.matchHistoryArgs.homeScore}
        userSide={userSide}
        homeClubName={pendingFinishPayload.summary.homeClub.name}
        awayClubName={pendingFinishPayload.summary.awayClub.name}
        sessionSeed={pendingFinishPayload.sessionSeed}
        leagueMotivationContext={leagueMotivationContext}
      />
    )}

///Etykieta przerwa w meczu ///
     {matchState.isHalfTime && !isTacticsOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none" style={{ transform: 'rotateX(-24deg)' }}>
        <div className="bg-slate-950/90 backdrop-blur-2xl border-y-4 border-rose-500 px-16 py-8 rounded-[40px] shadow-[0_0_100px_rgba(225,29,72,0.4)] animate-pulse">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-rose-500 tracking-[0.5em] mb-2">PIŁKARZE SCHODZĄ DO SZATNI</span>
            <span className="text-6xl font-black italic text-white uppercase tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">PRZERWA</span>
          </div>
        </div>
      </div>
    )}

 {/* Etykieta Kontuzji */}
    {isPausedForSevereInjury && !isTacticsOpen &&(
      <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none" style={{ transform: 'rotateX(-24deg)' }}>
        <div className="bg-slate-950/90 backdrop-blur-2xl border-y-4 border-red-600 px-16 py-8 rounded-[40px] shadow-[0_0_100px_rgba(220,38,38,0.5)] animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <div className="text-7xl filter drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">➕</div>
            <div className="text-center">
              <span className="text-[10px] font-black text-red-500 tracking-[0.5em] mb-2 uppercase block">Zawodnik leży na murawie</span>
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                PRZERWA MEDYCZNA<br/>
                <span className="text-2xl text-red-500 font-bold not-italic">KONTUZJA</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Prośba o zmianę — lekka kontuzja */}
    {matchState.lightInjuryPrompt && !isTacticsOpen && (
      <div className="absolute inset-0 z-[999] flex items-center justify-center" style={{ transform: 'rotateX(-24deg)' }}>
        <div className="bg-slate-950/95 backdrop-blur-2xl border-y-4 border-orange-500 px-12 py-8 rounded-[40px] shadow-[0_0_80px_rgba(249,115,22,0.4)] flex flex-col items-center gap-4">
          <div className="text-5xl">🤕</div>
          <span className="text-[10px] font-black text-orange-400 tracking-[0.5em] uppercase">Sygnał z boiska</span>
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tight text-center">
            {matchState.lightInjuryPrompt.playerName}
            <br />
            <span className="text-xl text-orange-300 font-bold not-italic">prosi o zmianę</span>
          </h2>
          <p className="text-slate-400 text-[11px] text-center max-w-[260px]">
            Lekka kontuzja. Możesz go zmienić lub pozwolić mu grać — ale jego skuteczność spadnie.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setMatchState(s => s ? { ...s, lightInjuryPrompt: null, isPaused: false } : s)}
              className="px-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-black uppercase tracking-widest transition-all"
            >
              Graj dalej
            </button>
            <button
              onClick={() => { setMatchState(s => s ? { ...s, lightInjuryPrompt: null } : s); setIsTacticsOpen(true); }}
              className="px-6 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            >
              Dokonaj zmiany
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Etykieta Końca Meczu */}
    {matchState.isFinished && !showPostMatchDebrief && (
      <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none" style={{ transform: 'rotateX(-24deg)' }}>
        <div className="bg-slate-950/90 backdrop-blur-2xl border-y-4 border-emerald-500 px-20 py-12 rounded-[50px] shadow-[0_0_120px_rgba(34,197,94,0.6)] animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-black text-emerald-400 tracking-[0.6em] uppercase"> KONIEC SPOTKANIA</span>
            <span className="text-7xl font-black italic text-white uppercase tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              
            </span>
            <span className="text-4xl font-bold text-emerald-300 mt-2">
              TRANSMISJA ZAKOŃCZONA
            </span>
          </div>
        </div>
      </div>
    )}




  </div>
  );
};
   
