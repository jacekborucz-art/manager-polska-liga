import assert from 'node:assert/strict';
import { HealthStatus, Player, PlayerPosition, TrainingIntensity } from '../types';
import { generatePlayerReport } from '../services/TrainingAssistantService';

const attributes: Player['attributes'] = {
  pace: 67,
  strength: 55,
  stamina: 62,
  defending: 50,
  passing: 66,
  attacking: 63,
  finishing: 58,
  technique: 68,
  vision: 70,
  dribbling: 64,
  heading: 48,
  positioning: 60,
  goalkeeping: 8,
  freeKicks: 57,
  talent: 88,
  penalties: 55,
  corners: 61,
  aggression: 78,
  crossing: 62,
  leadership: 58,
  mentality: 69,
  workRate: 73,
};

const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'ASSISTANT_REPORT_PLAYER',
  firstName: 'Jan',
  lastName: 'Raportowy',
  age: 20,
  clubId: 'CLUB_A',
  nationality: 'POL' as Player['nationality'],
  position: PlayerPosition.MID,
  overallRating: 63,
  attributes: { ...attributes },
  stats: {
    goals: 2,
    assists: 3,
    yellowCards: 2,
    redCards: 1,
    cleanSheets: 0,
    matchesPlayed: 6,
    minutesPlayed: 360,
    seasonalChanges: { passing: 1, stamina: -1 },
    ratingHistory: [6.0, 6.2, 6.3, 6.4, 6.5, 6.9, 7.0, 7.2, 7.4, 7.6],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 82,
  suspensionMatches: 0,
  contractEndDate: '2030-06-30',
  annualSalary: 100_000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 18,
  morale: 68,
  moralePersonality: 'PROFESSIONAL',
  clubAdaptation: {
    clubId: 'CLUB_A',
    startedAt: '2026-07-01',
    lastUpdatedAt: '2026-08-20',
    durationDays: 120,
    initialLevel: 30,
    level: 64,
  },
  playerMindset: {
    coachTrust: 72,
    clubHappiness: 67,
    squadBelonging: 61,
    roleClarity: 66,
    playingTimeSatisfaction: 58,
    developmentSatisfaction: 73,
    transferOpenness: 32,
    conflictLevel: 8,
  },
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  ...overrides,
});

const player = makePlayer();
const strongerPeer = makePlayer({
  id: 'STRONGER_PEER',
  age: 27,
  overallRating: 78,
  attributes: { ...attributes, talent: 72, passing: 81, technique: 80, vision: 80 },
});
const staffBase = {
  assistantExists: true,
  fitnessExists: true,
  goalkeeperExists: true,
};

const eliteReport = generatePlayerReport(
  player,
  [player, strongerPeer],
  [player, strongerPeer],
  { ...staffBase, assistantAvg: 20, fitnessAvg: 20, goalkeeperAvg: 20 },
  { activeTrainingName: 'Gra kombinacyjna', intensity: TrainingIntensity.MEDIUM }
);
const repeatedEliteReport = generatePlayerReport(
  player,
  [player, strongerPeer],
  [player, strongerPeer],
  { ...staffBase, assistantAvg: 20, fitnessAvg: 20, goalkeeperAvg: 20 },
  { activeTrainingName: 'Gra kombinacyjna', intensity: TrainingIntensity.MEDIUM }
);
const weakReport = generatePlayerReport(
  player,
  [player, strongerPeer],
  [player, strongerPeer],
  { ...staffBase, assistantAvg: 1, fitnessAvg: 1, goalkeeperAvg: 1 }
);

assert.deepEqual(eliteReport, repeatedEliteReport, 'raport powinien być stabilny po ponownym otwarciu');
assert.equal(eliteReport.analysisMeta.assistantQuality, 100, 'atrybut sztabu 20 powinien oznaczać jakość 100%');
assert.equal(eliteReport.analysisMeta.uncertaintyPercent, 5, 'najlepszy asystent nadal musi mieć minimum 5% RNG');
assert.ok(weakReport.analysisMeta.uncertaintyPercent > eliteReport.analysisMeta.uncertaintyPercent, 'słabszy asystent powinien mieć większy margines błędu');
assert.equal(eliteReport.formAnalysis.trend, 'ROSNĄCA');
assert.equal(eliteReport.formAnalysis.recentAverage?.toFixed(2), '7.22');
assert.equal(eliteReport.adaptationAnalysis.active, true);
assert.equal(eliteReport.adaptationAnalysis.adaptationLevel, 64);
assert.ok(eliteReport.matchBehavior.cardsPer90 > 0);
assert.ok(eliteReport.matchBehavior.assessment.includes('agresję'));
assert.ok(eliteReport.careerPlan.nextSteps.some(step => step.includes('Gra kombinacyjna')));
assert.ok(eliteReport.careerPlan.decision === 'WYPOŻYCZYĆ' || eliteReport.careerPlan.decision === 'ROZWIJAĆ');

console.log('AssistantPlayerReportTests: OK');
