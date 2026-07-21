import { AiOpponentAnalysisService, AiOpponentMatchReport } from '../services/AiOpponentAnalysisService';
import { LineupService } from '../services/LineupService';
import { TacticRepository } from '../resources/tactics_db';
import { Club, Coach, HealthStatus, Player, PlayerPosition } from '../types';

const assert = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(message);
};

const makePlayer = (id: string, position: PlayerPosition, level: number): Player => ({
  id,
  position,
  overallRating: level,
  condition: 100,
  suspensionMatches: 0,
  health: { status: HealthStatus.HEALTHY },
  attributes: {
    strength: level,
    stamina: level,
    pace: level,
    defending: level,
    passing: level,
    attacking: level,
    finishing: level,
    technique: level,
    vision: level,
    dribbling: level,
    heading: level,
    positioning: level,
    goalkeeping: level,
    freeKicks: level,
    talent: level,
    penalties: level,
    corners: level,
    aggression: level,
    crossing: level,
    leadership: level,
    mentality: level,
    workRate: level,
  },
} as Player);

const makeSquad = (prefix: string, level: number): Player[] => [
  makePlayer(`${prefix}_gk_1`, PlayerPosition.GK, level),
  makePlayer(`${prefix}_gk_2`, PlayerPosition.GK, level - 2),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(`${prefix}_def_${index}`, PlayerPosition.DEF, level - index % 2)),
  ...Array.from({ length: 7 }, (_, index) => makePlayer(`${prefix}_mid_${index}`, PlayerPosition.MID, level - index % 2)),
  ...Array.from({ length: 4 }, (_, index) => makePlayer(`${prefix}_fwd_${index}`, PlayerPosition.FWD, level - index % 2)),
];

const strongAi = makeSquad('ai', 88);
const weakerOpponent = makeSquad('opponent', 55);
const opponentLineup = LineupService.autoPickLineup('OPPONENT', weakerOpponent, '4-4-2-OFF', null, {
  respectRequestedTactic: true,
});
const aiClub = { id: 'AI', staffIds: [], reputation: 9 } as Club;
const opponentClub = { id: 'OPPONENT', staffIds: [], reputation: 5 } as Club;

const report = AiOpponentAnalysisService.generateReport({
  aiClub,
  aiCoach: null,
  aiPlayers: strongAi,
  opponentClub,
  opponentPlayers: weakerOpponent,
  opponentLineup,
  seed: 12345,
});

assert(report.perceivedOpponentToAiPowerRatio !== undefined, 'Raport powinien porównywać siłę obu drużyn.');
assert(report.perceivedOpponentToAiPowerRatio! < 0.92, 'Mocniejsza drużyna AI powinna zostać rozpoznana jako faworyt.');
assert(report.recommendedApproach !== 'LOW_BLOCK', 'Wyraźny faworyt nie powinien automatycznie wybierać niskiego bloku.');

const defensiveCoach = {
  attributes: { decisionMaking: 75, experience: 75, training: 70 },
  favoriteTactics: {
    neutral: '5-3-2',
    offensive: '4-3-3 Atak',
    defensive: '5-4-1',
  },
} as Coach;

const preparedLineup = LineupService.autoPickLineup('AI', strongAi, '4-3-3', defensiveCoach, {
  respectRequestedTactic: true,
});
assert(preparedLineup.tacticId === '4-3-3', 'Taktyka wybrana przez analizę meczu nie może zostać nadpisana preferencją trenera.');

const strongFavoriteReport: AiOpponentMatchReport = {
  ...report,
  confidence: 0.9,
  predictedTacticId: '4-4-2-OFF',
  predictedStyle: 'OFFENSIVE',
  recommendedApproach: 'LOW_BLOCK',
  perceivedOpponentToAiPowerRatio: 0.75,
};
const recommendedTacticId = AiOpponentAnalysisService.recommendStartingTactic(
  '5-3-2',
  strongFavoriteReport,
  aiClub,
  opponentClub,
  strongAi,
  true,
  defensiveCoach
);
const recommendedTactic = TacticRepository.getById(recommendedTacticId);
assert(recommendedTactic.defenseBias <= 65, 'Wyraźny faworyt powinien odejść od defensywnej formacji startowej.');
assert(recommendedTactic.attackBias >= 55, 'Wyraźny faworyt powinien wybrać aktywniejszą formację.');

console.log('AiOpponentAnalysisTests: OK');
