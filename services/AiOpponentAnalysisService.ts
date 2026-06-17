import { Club, Coach, HealthStatus, InjurySeverity, Lineup, Player, PlayerPosition, StaffMember, StaffRole } from '../types';
import { TacticRepository } from '../resources/tactics_db';

export type AiPredictedStyle = 'DEFENSIVE' | 'BALANCED' | 'OFFENSIVE';
export type AiRecommendedApproach = 'PRESS' | 'CONTROL' | 'COUNTER' | 'LOW_BLOCK' | 'DIRECT';
export type AiPerceivedFatigueLevel = 'FRESH' | 'TIRED' | 'EXHAUSTED';
export type AiPerceivedWeakness = 'DEFENSE' | 'MIDFIELD' | 'ATTACK' | 'FITNESS' | null;

export interface AiStaffAnalysisProfile {
  analysisQuality: number;
  tacticalQuality: number;
  fitnessQuality: number;
  decisionQuality: number;
}

export interface AiOpponentMatchReport {
  accuracy: number;
  confidence: number;
  predictedTacticId: string;
  predictedStyle: AiPredictedStyle;
  perceivedPower: number;
  perceivedLineStrengths: {
    defense: number;
    midfield: number;
    attack: number;
  };
  perceivedFatigueLevel: AiPerceivedFatigueLevel;
  perceivedWeakness: AiPerceivedWeakness;
  recommendedApproach: AiRecommendedApproach;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const staffAttr = (member: StaffMember | undefined, key: string, fallback = 10): number =>
  clamp(member?.attributes?.[key] ?? fallback, 1, 20) * 5;

const seededRng = (seed: number, offset: number): number => {
  const x = Math.sin(seed + offset * 9973) * 10000;
  return x - Math.floor(x);
};

const hashString = (value: string): number =>
  value.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 17), 0);

const pickBestStaff = (staff: StaffMember[], role: StaffRole, keys: string[]): StaffMember | undefined =>
  staff
    .filter(member => member.role === role)
    .sort((a, b) => {
      const score = (member: StaffMember) =>
        keys.reduce((sum, key) => sum + (member.attributes[key] ?? 10), 0) / Math.max(1, keys.length);
      return score(b) - score(a);
    })[0];

const staffTeamAttr = (members: StaffMember[], key: string, fallback = 10): number => {
  if (members.length === 0) return clamp(fallback, 1, 20) * 5;
  const leadValue = clamp(members[0].attributes[key] ?? fallback, 1, 20) * 5;
  const supportWeights = [0.10, 0.06];
  const supportBonus = members.slice(1, 3).reduce((sum, member, index) => {
    const supportValue = clamp(member.attributes[key] ?? fallback, 1, 20) * 5;
    return sum + (supportValue - 50) * supportWeights[index];
  }, 0);
  return clamp(leadValue + supportBonus, 5, 99);
};

const getStarters = (players: Player[], lineup: Lineup): Player[] =>
  lineup.startingXI
    .map(id => id ? players.find(player => player.id === id) : null)
    .filter((player): player is Player => !!player);

const getTopLineAvg = (players: Player[], position: PlayerPosition, topN: number): number => {
  const line = players
    .filter(player => player.position === position)
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, topN);
  if (line.length === 0) return 60;
  return line.reduce((sum, player) => sum + player.overallRating, 0) / line.length;
};

const isTacticFeasible = (players: Player[], tacticId: string): boolean => {
  const tactic = TacticRepository.getById(tacticId);
  const available = players.filter(player =>
    player.condition >= 60 &&
    player.suspensionMatches <= 0 &&
    (
      player.health.status !== HealthStatus.INJURED ||
      player.health.injury?.severity !== InjurySeverity.SEVERE
    )
  );
  const required = tactic.slots.slice(1).reduce<Record<string, number>>((acc, slot) => {
    acc[slot.role] = (acc[slot.role] ?? 0) + 1;
    return acc;
  }, {});
  const counts = available.reduce<Record<string, number>>((acc, player) => {
    if (player.position !== PlayerPosition.GK) acc[player.position] = (acc[player.position] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(required).every(([position, count]) => (counts[position] ?? 0) >= count);
};

const addNoise = (value: number, errorPercent: number, seed: number, offset: number): number => {
  const direction = seededRng(seed, offset) > 0.5 ? 1 : -1;
  const scale = 0.35 + seededRng(seed, offset + 13) * 0.65;
  return value * (1 + direction * (errorPercent / 100) * scale);
};

const getStyleFromTactic = (tacticId: string): AiPredictedStyle => {
  const tactic = TacticRepository.getById(tacticId);
  if (!tactic) return 'BALANCED';
  if (tactic.attackBias >= 65 && tactic.defenseBias <= 50) return 'OFFENSIVE';
  if (tactic.defenseBias >= 65 && tactic.attackBias <= 50) return 'DEFENSIVE';
  return 'BALANCED';
};

const getWrongTactic = (actualTacticId: string, seed: number): string => {
  const all = TacticRepository.getAll().filter(tactic => tactic.id !== actualTacticId);
  if (all.length === 0) return actualTacticId;
  return all[Math.floor(seededRng(seed, 29) * all.length)]?.id ?? actualTacticId;
};

const getWeakness = (
  lines: AiOpponentMatchReport['perceivedLineStrengths'],
  fatigueLevel: AiPerceivedFatigueLevel
): AiPerceivedWeakness => {
  if (fatigueLevel === 'EXHAUSTED') return 'FITNESS';
  const entries: [Exclude<AiPerceivedWeakness, null | 'FITNESS'>, number][] = [
    ['DEFENSE', lines.defense],
    ['MIDFIELD', lines.midfield],
    ['ATTACK', lines.attack],
  ];
  const weakest = entries.sort((a, b) => a[1] - b[1])[0];
  return weakest && weakest[1] < 66 ? weakest[0] : null;
};

export const AiOpponentAnalysisService = {
  buildStaffProfile: (
    club: Club,
    coach: Coach | null,
    staffMembers: Record<string, StaffMember> = {}
  ): AiStaffAnalysisProfile => {
    const clubStaff = (club.staffIds ?? [])
      .map(id => staffMembers[id])
      .filter((member): member is StaffMember => !!member);

    const assistants = clubStaff
      .filter(member => member.role === StaffRole.ASSISTANT_COACH)
      .sort((a, b) => {
        const score = (member: StaffMember) => (
          (member.attributes.opponentAnalysis ?? 10) +
          (member.attributes.offensiveTactics ?? 10) +
          (member.attributes.defensiveTactics ?? 10) +
          (member.attributes.communication ?? 10) +
          (member.attributes.experience ?? 10)
        ) / 5;
        return score(b) - score(a);
      });
    const analyst = pickBestStaff(clubStaff, StaffRole.VIDEO_ANALYST, [
      'videoAnalysis',
      'tactics',
      'statsAnalysis',
      'scouting',
      'reporting',
      'experience',
    ]);
    const fitness = pickBestStaff(clubStaff, StaffRole.FITNESS_COACH, [
      'fitnessTests',
      'periodization',
      'recovery',
      'experience',
    ]);

    const coachDecision = coach?.attributes.decisionMaking ?? 50;
    const coachExperience = coach?.attributes.experience ?? 50;
    const coachTraining = coach?.attributes.training ?? 50;

    const assistantAnalysis = staffTeamAttr(assistants, 'opponentAnalysis');
    const assistantTactics = (staffTeamAttr(assistants, 'offensiveTactics') + staffTeamAttr(assistants, 'defensiveTactics')) / 2;
    const videoAnalysis = staffAttr(analyst, 'videoAnalysis');
    const videoTactics = staffAttr(analyst, 'tactics');
    const statsAnalysis = staffAttr(analyst, 'statsAnalysis');
    const videoScouting = staffAttr(analyst, 'scouting');
    const fitnessTests = staffAttr(fitness, 'fitnessTests');
    const periodization = staffAttr(fitness, 'periodization');

    return {
      analysisQuality: clamp(
        coachDecision * 0.22 +
          coachExperience * 0.18 +
          assistantAnalysis * 0.22 +
          videoAnalysis * 0.16 +
          videoTactics * 0.10 +
          statsAnalysis * 0.07 +
          videoScouting * 0.05,
        1,
        99
      ),
      tacticalQuality: clamp(
        coachDecision * 0.24 +
          coachExperience * 0.16 +
          assistantTactics * 0.25 +
          assistantAnalysis * 0.12 +
          videoTactics * 0.18 +
          videoAnalysis * 0.05,
        1,
        99
      ),
      fitnessQuality: clamp(coachTraining * 0.25 + coachExperience * 0.15 + fitnessTests * 0.42 + periodization * 0.18, 1, 99),
      decisionQuality: clamp(coachDecision * 0.55 + coachExperience * 0.25 + assistantTactics * 0.20, 1, 99),
    };
  },

  generateReport: (params: {
    aiClub: Club;
    aiCoach: Coach | null;
    aiStaffMembers?: Record<string, StaffMember>;
    opponentClub: Club;
    opponentPlayers: Player[];
    opponentLineup: Lineup;
    seed: number;
  }): AiOpponentMatchReport => {
    const { aiClub, aiCoach, aiStaffMembers = {}, opponentClub, opponentPlayers, opponentLineup, seed } = params;
    const profile = AiOpponentAnalysisService.buildStaffProfile(aiClub, aiCoach, aiStaffMembers);
    const reportSeed = seed + hashString(aiClub.id) * 11 + hashString(opponentClub.id) * 17;

    const accuracy = clamp((profile.analysisQuality * 0.55 + profile.tacticalQuality * 0.30 + profile.fitnessQuality * 0.15) / 100, 0.08, 0.98);
    const confidence = clamp((profile.analysisQuality * 0.45 + profile.decisionQuality * 0.30 + profile.tacticalQuality * 0.25) / 100, 0.08, 0.98);
    const errorPercent = clamp(34 - accuracy * 28, 3, 38);

    const starters = getStarters(opponentPlayers, opponentLineup);
    const defense = addNoise(getTopLineAvg(starters, PlayerPosition.DEF, 4), errorPercent, reportSeed, 1);
    const midfield = addNoise(getTopLineAvg(starters, PlayerPosition.MID, 4), errorPercent, reportSeed, 2);
    const attack = addNoise(getTopLineAvg(starters, PlayerPosition.FWD, 3), errorPercent, reportSeed, 3);
    const realPower = starters.reduce((sum, player) => {
      return sum + player.attributes.attacking + player.attributes.passing + player.attributes.defending + player.attributes.technique * 0.5;
    }, 0);
    const perceivedPower = Math.max(1, addNoise(realPower, errorPercent, reportSeed, 4));

    const tacticMistakeChance = clamp(0.38 - profile.tacticalQuality / 260, 0.03, 0.34);
    const predictedTacticId =
      seededRng(reportSeed, 5) < tacticMistakeChance
        ? getWrongTactic(opponentLineup.tacticId, reportSeed)
        : opponentLineup.tacticId;
    const predictedStyle = getStyleFromTactic(predictedTacticId);

    const avgCondition = starters.length > 0
      ? starters.reduce((sum, player) => sum + player.condition, 0) / starters.length
      : 80;
    const conditionError = (seededRng(reportSeed, 6) * 2 - 1) * clamp(18 - profile.fitnessQuality / 7, 2, 16);
    const perceivedCondition = clamp(avgCondition + conditionError, 35, 100);
    const perceivedFatigueLevel: AiPerceivedFatigueLevel =
      perceivedCondition >= 82 ? 'FRESH' : perceivedCondition >= 67 ? 'TIRED' : 'EXHAUSTED';

    const lines = {
      defense: clamp(defense, 35, 99),
      midfield: clamp(midfield, 35, 99),
      attack: clamp(attack, 35, 99),
    };
    const perceivedWeakness = getWeakness(lines, perceivedFatigueLevel);

    let recommendedApproach: AiRecommendedApproach = 'CONTROL';
    if (predictedStyle === 'OFFENSIVE' || lines.attack > lines.defense + 5) recommendedApproach = 'COUNTER';
    if (predictedStyle === 'DEFENSIVE' || lines.defense < 64 || perceivedWeakness === 'DEFENSE') recommendedApproach = 'PRESS';
    if (perceivedPower > 850) recommendedApproach = 'LOW_BLOCK';
    if (perceivedWeakness === 'FITNESS') recommendedApproach = 'PRESS';
    if (perceivedWeakness === 'MIDFIELD') recommendedApproach = 'CONTROL';
    if (perceivedWeakness === 'ATTACK' && predictedStyle !== 'DEFENSIVE') recommendedApproach = 'DIRECT';

    return {
      accuracy,
      confidence,
      predictedTacticId,
      predictedStyle,
      perceivedPower,
      perceivedLineStrengths: lines,
      perceivedFatigueLevel,
      perceivedWeakness,
      recommendedApproach,
    };
  },

  recommendStartingTactic: (baseTacticId: string, report: AiOpponentMatchReport, aiClub: Club, opponentClub: Club, aiPlayers: Player[] = [], isAiAway: boolean = false, aiCoach: Coach | null = null): string => {
    const confidenceGate = report.confidence >= 0.48;
    if (!confidenceGate) return baseTacticId;

    const current = TacticRepository.getById(baseTacticId);
    const alreadyDefensive = current.defenseBias >= 65;
    const alreadyOffensive = current.attackBias >= 65;

    const pickFeasible = (...tacticIds: string[]): string => {
      if (aiPlayers.length === 0) return tacticIds[0] ?? baseTacticId;
      return tacticIds.find(tacticId => isTacticFeasible(aiPlayers, tacticId)) ?? baseTacticId;
    };

    if (report.recommendedApproach === 'LOW_BLOCK' && !alreadyDefensive) {
      return pickFeasible('5-4-1', '4-5-1', '4-4-2-DEF');
    }

    if (report.recommendedApproach === 'COUNTER' && !alreadyDefensive) {
      const coachBoldness = ((aiCoach?.attributes.decisionMaking ?? 50) + (aiCoach?.attributes.experience ?? 50)) / 2;
      if (!isAiAway) {
        if (!alreadyOffensive && coachBoldness >= 60 && Math.random() < (coachBoldness - 55) / 45) {
          return pickFeasible('4-3-3', '4-2-3-1', '4-4-2-OFF');
        }
        return baseTacticId;
      }
      const offensiveRisk = Math.max(0, (coachBoldness - 45) / 55);
      if (!alreadyOffensive && Math.random() < offensiveRisk) {
        return pickFeasible('4-2-3-1', '4-3-3', '4-4-2-OFF');
      }
      if (coachBoldness < 45) return pickFeasible('4-4-2-DEF', '4-5-1');
      return baseTacticId;
    }

    if (report.recommendedApproach === 'PRESS' && !alreadyOffensive) {
      return pickFeasible('4-2-3-1', '4-3-3', '4-4-2-OFF');
    }

    if (report.recommendedApproach === 'CONTROL') {
      return report.perceivedLineStrengths.midfield < 66 ? pickFeasible('3-5-2', '4-2-3-1') : baseTacticId;
    }

    if (report.recommendedApproach === 'DIRECT' && !alreadyOffensive) {
      return pickFeasible('4-4-2-OFF', '4-3-3');
    }

    return baseTacticId;
  },
};
