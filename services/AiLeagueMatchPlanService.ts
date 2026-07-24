import { AiLeagueMatchPlan, Club, Coach, Lineup, Player } from '../types';
import {
  AiOpponentAnalysisService,
  AiOpponentMatchReport,
  getDefensiveStartProbability,
  isCautiousStartJustified,
  isLowBlockStartJustified,
} from './AiOpponentAnalysisService';
import { AiCoachTacticsService } from './AiCoachTacticsService';
import { PlayerMoraleService } from './PlayerMoraleService';
import { getLegacySpreadOffsetSeededValue } from './match/live/LiveMatchRandom';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

// Migration bridge: keep plan selection on the existing spread-offset formula during extraction.
const seededRng = getLegacySpreadOffsetSeededValue;

const getLineupPlayers = (players: Player[], lineup: Lineup): Player[] =>
  lineup.startingXI
    .map(id => id ? players.find(player => player.id === id) : null)
    .filter((player): player is Player => !!player);

const getReadinessAverage = (players: Player[], lineup: Lineup): number => {
  const active = getLineupPlayers(players, lineup);
  if (active.length === 0) return 60;
  return active.reduce((sum, player) => sum + PlayerMoraleService.getEffectiveOverall(player), 0) / active.length;
};

const getMoraleAverage = (players: Player[], lineup: Lineup): number => {
  const active = getLineupPlayers(players, lineup);
  if (active.length === 0) return 50;
  return active.reduce((sum, player) => sum + (player.morale ?? 50), 0) / active.length;
};

const getStrength = (ratio: number): AiLeagueMatchPlan['strength'] => {
  if (ratio <= 0.92) return 'FAVORED';
  if (ratio < 1.25) return 'EVEN';
  if (ratio < 1.50) return 'CAUTIOUS';
  return 'CLEAR_UNDERDOG';
};

const getApproach = (
  report: AiOpponentMatchReport,
  ratio: number,
  defensiveStartSelected: boolean
): AiOpponentMatchReport['recommendedApproach'] => {
  if (defensiveStartSelected && isLowBlockStartJustified(ratio, report.matchEnvironment)) return 'LOW_BLOCK';
  if (isCautiousStartJustified(ratio)) return 'COUNTER';
  if (ratio <= 0.92) {
    return report.predictedStyle === 'DEFENSIVE' || report.perceivedWeakness === 'DEFENSE' || report.perceivedWeakness === 'FITNESS'
      ? 'PRESS'
      : 'CONTROL';
  }
  if (report.recommendedApproach === 'LOW_BLOCK' || report.recommendedApproach === 'COUNTER') return 'CONTROL';
  return report.recommendedApproach;
};

export const AiLeagueMatchPlanService = {
  createPlan: (params: {
    report: AiOpponentMatchReport;
    aiClub: Club;
    aiCoach: Coach | null;
    aiPlayers: Player[];
    aiBaseLineup: Lineup;
    userClub: Club;
    userPlayers: Player[];
    userLineup: Lineup;
    aiRank: number;
    userRank: number;
    isAiAway: boolean;
    seed: number;
  }): { plan: AiLeagueMatchPlan; effectiveReport: AiOpponentMatchReport } => {
    const {
      report,
      aiClub,
      aiCoach,
      aiPlayers,
      aiBaseLineup,
      userClub,
      userPlayers,
      userLineup,
      aiRank,
      userRank,
      isAiAway,
      seed,
    } = params;

    const decisionMaking = aiCoach?.attributes.decisionMaking ?? 50;
    const experience = aiCoach?.attributes.experience ?? 50;
    const coachQuality = (decisionMaking * 0.52 + experience * 0.48) / 100;
    const reportTrustProbability = clamp(0.24 + report.confidence * 0.48 + coachQuality * 0.20, 0.28, 0.92);
    const source: AiLeagueMatchPlan['source'] = seededRng(seed, 910) < reportTrustProbability ? 'REPORT' : 'INTUITION';

    const aiReadiness = getReadinessAverage(aiPlayers, aiBaseLineup);
    const userReadiness = getReadinessAverage(userPlayers, userLineup);
    const aiMorale = getMoraleAverage(aiPlayers, aiBaseLineup);
    const userMorale = getMoraleAverage(userPlayers, userLineup);
    const observedRatio = aiReadiness > 0 ? userReadiness / aiReadiness : 1;
    const intuitionNoiseRange = 0.12 - coachQuality * 0.07;
    const intuitionNoise = (seededRng(seed, 911) * 2 - 1) * intuitionNoiseRange;
    const rankGap = clamp(userRank - aiRank, -10, 10);
    const rankConfidenceAdjustment = rankGap * -0.006;
    const homeAdjustment = isAiAway ? 0.015 : -0.025;
    const intuitionRatio = observedRatio * (1 + intuitionNoise + rankConfidenceAdjustment + homeAdjustment);
    const reportRatio = report.perceivedOpponentToAiPowerRatio ?? intuitionRatio;
    let effectiveRatio = source === 'REPORT'
      ? reportRatio * 0.82 + intuitionRatio * 0.18
      : intuitionRatio;

    // Bezpiecznik spójności: trener zna własny zespół, jego morale i pozycję w tabeli.
    // Błędny raport może skłonić do ostrożności, ale nie do autobusu przeciw drużynie
    // o podobnej lub niższej realnej gotowości, gdy AI jest w ligowej czołówce i ma dobre morale.
    const confidentStrongTeam = aiRank <= 5 && aiRank <= userRank && aiMorale >= 70 && observedRatio <= 1.10;
    if (confidentStrongTeam) effectiveRatio = Math.min(effectiveRatio, 1.24);
    effectiveRatio = clamp(effectiveRatio, 0.55, 2.20);

    const defensiveStartChance = getDefensiveStartProbability(effectiveRatio);
    const defensiveStartSelected = defensiveStartChance > 0 && seededRng(seed, 912) < defensiveStartChance;
    const recommendedApproach = getApproach(report, effectiveRatio, defensiveStartSelected);
    const effectiveReport: AiOpponentMatchReport = {
      ...report,
      perceivedOpponentToAiPowerRatio: effectiveRatio,
      defensiveStartChance,
      defensiveStartSelected,
      recommendedApproach,
      coachPlanResolved: true,
    };

    const initialTacticId = AiOpponentAnalysisService.recommendStartingTactic(
      aiBaseLineup.tacticId,
      effectiveReport,
      aiClub,
      userClub,
      aiPlayers,
      isAiAway,
      aiCoach
    );
    const initialInstructions = AiCoachTacticsService.decidePreMatchInstructions(
      aiClub,
      aiCoach,
      aiPlayers,
      userClub,
      userPlayers,
      userLineup.tacticId,
      seed,
      effectiveReport
    );

    return {
      effectiveReport,
      plan: {
        source,
        reportTrustProbability,
        reportConfidence: report.confidence,
        opponentToAiPowerRatio: effectiveRatio,
        strength: getStrength(effectiveRatio),
        recommendedApproach,
        defensiveStartChance,
        defensiveStartSelected,
        initialTacticId,
        initialInstructions,
        aiRank,
        userRank,
        aiMorale,
        userMorale,
      },
    };
  },
};
