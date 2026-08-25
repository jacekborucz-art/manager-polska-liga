import assert from 'node:assert/strict';
import { Coach, HealthStatus, Player, PlayerPosition } from '../types';
import {
  getReserveCoachAnalysisQuality,
  getReserveCoachUncertainty,
  ReserveCoachAnalysisService,
} from '../services/ReserveCoachAnalysisService';

const baseAttributes: Player['attributes'] = {
  strength: 58,
  stamina: 66,
  pace: 72,
  defending: 42,
  passing: 70,
  attacking: 65,
  finishing: 61,
  technique: 74,
  vision: 76,
  dribbling: 69,
  heading: 48,
  positioning: 64,
  goalkeeping: 8,
  freeKicks: 57,
  talent: 88,
  penalties: 55,
  corners: 61,
  aggression: 64,
  crossing: 62,
  leadership: 58,
  mentality: 71,
  workRate: 75,
};

const makePlayer = (overrides: Partial<Player>): Player => ({
  id: 'RESERVE_TALENT_A',
  firstName: 'Jan',
  lastName: 'Talent',
  age: 18,
  clubId: 'RESERVE_CLUB',
  nationality: 'POL' as Player['nationality'],
  position: PlayerPosition.MID,
  overallRating: 64,
  attributes: { ...baseAttributes },
  stats: {
    goals: 3,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 8,
    minutesPlayed: 610,
    seasonalChanges: { passing: 2, technique: 1, vision: 1, stamina: 1 },
    ratingHistory: [6.4, 6.7, 6.9, 7.1, 7.3, 7.5],
  },
  reserveStats: {
    matches: 8,
    goals: 3,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    totalRatingPoints: 56.2,
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 91,
  suspensionMatches: 0,
  contractEndDate: '2030-06-30',
  annualSalary: 80_000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 12,
  morale: 78,
  clubAdaptation: {
    clubId: 'RESERVE_CLUB',
    startedAt: '2026-07-01',
    lastUpdatedAt: '2026-08-24',
    durationDays: 90,
    initialLevel: 45,
    level: 79,
  },
  playerMindset: {
    coachTrust: 82,
    clubHappiness: 80,
    squadBelonging: 78,
    roleClarity: 75,
    playingTimeSatisfaction: 74,
    developmentSatisfaction: 84,
    transferOpenness: 15,
    conflictLevel: 2,
  },
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  ...overrides,
});

const makeCoach = (quality: number): Coach => ({
  id: `RESERVE_COACH_${quality}`,
  firstName: 'Adam',
  lastName: 'Analityk',
  age: 48,
  nationality: 'POL',
  nationalityFlag: '🇵🇱',
  attributes: {
    experience: quality,
    decisionMaking: quality,
    motivation: quality,
    training: quality,
  },
  history: [],
  currentClubId: 'RESERVE_CLUB',
  hiredDate: '2026-07-01',
  contractEndDate: '2028-06-30',
  annualSalary: 150_000,
  expPoints: 1,
  blacklist: {},
  favoriteTactics: { offensive: '4-3-3', neutral: '4-2-3-1', defensive: '5-3-2' },
  seasonStats: [],
});

const eliteCoach = makeCoach(100);
const weakCoach = makeCoach(20);
const star = makePlayer({});
const prospect = makePlayer({
  id: 'RESERVE_TALENT_B',
  firstName: 'Piotr',
  lastName: 'Projekt',
  age: 20,
  position: PlayerPosition.FWD,
  overallRating: 57,
  attributes: { ...baseAttributes, talent: 76, finishing: 68, attacking: 70 },
  reserveStats: { matches: 3, goals: 1, assists: 0, yellowCards: 0, redCards: 0, totalRatingPoints: 19.4 },
});
const squadPlayer = makePlayer({
  id: 'RESERVE_SQUAD_C',
  firstName: 'Marek',
  lastName: 'Kadrowy',
  age: 24,
  position: PlayerPosition.DEF,
  overallRating: 55,
  attributes: { ...baseAttributes, talent: 58, defending: 62, positioning: 60 },
  reserveStats: { matches: 7, goals: 0, assists: 0, yellowCards: 5, redCards: 1, totalRatingPoints: 42.1 },
});
const players = [star, prospect, squadPlayer];

assert.equal(getReserveCoachAnalysisQuality(eliteCoach), 100);
assert.equal(getReserveCoachUncertainty(100), 5, 'najlepszy trener nadal zachowuje 5% RNG');
assert.ok(getReserveCoachUncertainty(getReserveCoachAnalysisQuality(weakCoach)) > 5, 'słabszy trener musi mieć większy margines błędu');

const input = { players, coach: eliteCoach, currentDate: new Date('2026-08-25T12:00:00Z') };
const report = ReserveCoachAnalysisService.createReport(input);
const repeated = ReserveCoachAnalysisService.createReport(input);
const weakReport = ReserveCoachAnalysisService.createReport({ ...input, coach: weakCoach });

assert.deepEqual(report, repeated, 'raport musi być stabilny po ponownym otwarciu w tym samym tygodniu');
assert.equal(report.uncertaintyPercent, 5);
assert.ok(weakReport.uncertaintyPercent > report.uncertaintyPercent);
assert.equal(report.talents[0].player.id, star.id, 'największy talent powinien trafić na szczyt rankingu przy dobrym trenerze');
assert.equal(report.talents[0].candles.every(candle => !candle.estimated), true, 'historia ocen meczowych powinna zasilać wykres świecowy');
assert.ok(report.talents[0].growthCurve.every((point, index, list) => index === 0 || point.value >= list[index - 1].value), 'prognoza rozwoju nie powinna cofać się bez ujemnego trendu');
assert.equal(report.pitchMarkers.length, report.talents.length);
assert.ok(report.pitchMarkers.every(marker => marker.x >= 0 && marker.x <= 100 && marker.y >= 0 && marker.y <= 100));
assert.ok(report.talents.some(talent => talent.behaviorLabel === 'RYZYKOWNE' || talent.behaviorLabel === 'PROBLEMATYCZNE'), 'kartki i agresja muszą wpływać na ocenę zachowania');
assert.ok(report.talents[0].observation.includes('8 meczów, 3 goli, 4 asyst'), 'raport powinien wykorzystywać prawdziwe statystyki rezerw');

const nextWeek = ReserveCoachAnalysisService.createReport({ ...input, currentDate: new Date('2026-09-01T12:00:00Z') });
assert.notEqual(nextWeek.generatedForWeek, report.generatedForWeek);
assert.ok(
  nextWeek.talents.some(talent => {
    const previous = report.talents.find(item => item.player.id === talent.player.id);
    return previous && (previous.potentialScore !== talent.potentialScore || previous.formScore !== talent.formScore);
  }),
  'nowy tydzień powinien otrzymać nową próbkę obserwacyjnego RNG',
);

console.log('ReserveCoachAnalysisTests: OK');
