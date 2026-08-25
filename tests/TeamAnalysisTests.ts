import assert from 'node:assert/strict';
import {
  Club,
  HealthStatus,
  Lineup,
  MatchEventType,
  MatchHistoryEntry,
  Player,
  PlayerPosition,
  StaffMember,
  StaffRole,
  TrainingIntensity,
} from '../types';
import {
  getTeamAssistantQuality,
  getTeamAssistantUncertainty,
  TeamAnalysisService,
} from '../services/TeamAnalysisService';

const club = {
  id: 'TEAM_ANALYSIS_CLUB',
  name: 'Klub Testowy',
  reputation: 70,
  staffIds: ['ASSISTANT_ELITE'],
  trainingFacilityLevel: 7,
} as Club;

const makeAssistant = (id: string, value: number): StaffMember => ({
  id,
  firstName: 'Adam',
  lastName: value >= 18 ? 'Ekspert' : 'Nowicjusz',
  age: 45,
  nationality: 'POL',
  nationalityFlag: '🇵🇱',
  role: StaffRole.ASSISTANT_COACH,
  attributes: {
    offensiveTactics: value,
    defensiveTactics: value,
    opponentAnalysis: value,
    motivation: value,
    communication: value,
    dressingRoom: value,
    individualWork: value,
    experience: value,
  },
  currentClubId: club.id,
  hiredDate: '2026-07-01',
  contractEndDate: '2029-06-30',
  salary: 200_000,
  history: [],
});

const baseAttributes: Player['attributes'] = {
  strength: 68,
  stamina: 73,
  pace: 70,
  defending: 66,
  passing: 72,
  attacking: 69,
  finishing: 66,
  technique: 71,
  vision: 70,
  dribbling: 67,
  heading: 65,
  positioning: 70,
  goalkeeping: 10,
  freeKicks: 63,
  talent: 72,
  penalties: 62,
  corners: 64,
  aggression: 58,
  crossing: 67,
  leadership: 65,
  mentality: 72,
  workRate: 74,
};

const makePlayer = (index: number, position: PlayerPosition): Player => ({
  id: `PLAYER_${index}`,
  firstName: `Jan${index}`,
  lastName: `Testowy${index}`,
  age: index < 3 ? 19 : 24 + index % 8,
  clubId: club.id,
  nationality: 'POL' as Player['nationality'],
  position,
  overallRating: 62 + index % 15,
  attributes: {
    ...baseAttributes,
    goalkeeping: position === PlayerPosition.GK ? 72 + index % 5 : 8,
    defending: position === PlayerPosition.DEF ? 72 + index % 5 : 60,
    passing: position === PlayerPosition.MID ? 75 + index % 5 : 67,
    finishing: position === PlayerPosition.FWD ? 74 + index % 5 : 58,
    talent: index < 3 ? 86 - index : 68 + index % 9,
  },
  stats: {
    goals: position === PlayerPosition.FWD ? 5 : 1,
    assists: position === PlayerPosition.MID ? 4 : 1,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: position === PlayerPosition.GK ? 3 : 0,
    matchesPlayed: 8,
    minutesPlayed: 620,
    seasonalChanges: index % 2 === 0 ? { stamina: 1, workRate: 1 } : {},
    ratingHistory: [6.5, 6.8, 7.0, 7.2, 6.9],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: index === 21 ? 58 : 88,
  suspensionMatches: index === 20 ? 1 : 0,
  contractEndDate: index === 19 ? '2027-01-10' : '2030-06-30',
  annualSalary: 120_000 + index * 3_000,
  marketValue: 500_000 + index * 20_000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: index < 2,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: index === 21 ? 46 : 10 + index % 10,
  morale: index === 18 ? 42 : 75,
  clubAdaptation: index === 18 ? {
    clubId: club.id,
    startedAt: '2026-07-01',
    lastUpdatedAt: '2026-08-25',
    durationDays: 120,
    initialLevel: 20,
    level: 38,
  } : null,
  playerMindset: {
    coachTrust: index === 18 ? 40 : 75,
    clubHappiness: index === 18 ? 42 : 76,
    squadBelonging: index === 18 ? 38 : 77,
    roleClarity: index === 18 ? 35 : 74,
    playingTimeSatisfaction: index === 18 ? 30 : 72,
    developmentSatisfaction: 70,
    transferOpenness: index === 18 ? 75 : 20,
    conflictLevel: index === 18 ? 58 : 5,
  },
  trainingFocus: index < 3 ? null : position === PlayerPosition.GK ? 'goalkeeping' : null,
  trainingIntensity: TrainingIntensity.NORMAL,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
});

const positions = [
  PlayerPosition.GK, PlayerPosition.GK,
  ...Array.from({ length: 7 }, () => PlayerPosition.DEF),
  ...Array.from({ length: 8 }, () => PlayerPosition.MID),
  ...Array.from({ length: 5 }, () => PlayerPosition.FWD),
];
const players = positions.map((position, index) => makePlayer(index, position));
const lineup: Lineup = {
  clubId: club.id,
  tacticId: '4-4-2-OFF',
  startingXI: players.slice(0, 11).map(player => player.id),
  bench: players.slice(11, 18).map(player => player.id),
  reserves: players.slice(18).map(player => player.id),
};

const matches: MatchHistoryEntry[] = [
  {
    matchId: 'MATCH_1',
    date: '2026-08-10T18:00:00.000Z',
    season: 1,
    competition: 'LIGA',
    homeTeamId: club.id,
    awayTeamId: 'RIVAL_1',
    homeScore: 2,
    awayScore: 0,
    goals: [],
    cards: [],
    homeLineup: lineup.startingXI.filter(Boolean) as string[],
    ratings: Object.fromEntries(players.slice(0, 11).map(player => [player.id, 7.1])),
    homeStartingTacticId: lineup.tacticId,
    timeline: [
      { minute: 12, teamSide: 'HOME', type: MatchEventType.SHOT_ON_TARGET, text: 'Strzał' },
      { minute: 22, teamSide: 'AWAY', type: MatchEventType.SHOT, text: 'Strzał' },
    ],
  },
  {
    matchId: 'MATCH_2',
    date: '2026-08-17T18:00:00.000Z',
    season: 1,
    competition: 'LIGA',
    homeTeamId: 'RIVAL_2',
    awayTeamId: club.id,
    homeScore: 1,
    awayScore: 1,
    goals: [],
    cards: [],
    awayLineup: lineup.startingXI.filter(Boolean) as string[],
    ratings: Object.fromEntries(players.slice(0, 11).map(player => [player.id, 6.8])),
    awayStartingTacticId: lineup.tacticId,
  },
];

const eliteAssistant = makeAssistant('ASSISTANT_ELITE', 20);
const weakAssistant = makeAssistant('ASSISTANT_WEAK', 4);
const currentDate = new Date('2026-08-25T12:00:00.000Z');
const input = {
  club,
  players,
  currentDate,
  assistant: eliteAssistant,
  lineup,
  matchHistory: matches,
  activeTrainingName: 'Rozwój techniczny',
  activeIntensity: TrainingIntensity.HEAVY,
};

assert.equal(getTeamAssistantQuality(eliteAssistant), 100);
assert.equal(getTeamAssistantUncertainty(100), 5, 'najlepszy asystent musi zachować co najmniej 5% RNG');
assert.ok(getTeamAssistantUncertainty(getTeamAssistantQuality(weakAssistant)) > 5);

const report = TeamAnalysisService.analyzeSquad(input);
const repeated = TeamAnalysisService.analyzeSquad(input);
const weakReport = TeamAnalysisService.analyzeSquad({ ...input, assistant: weakAssistant });

assert.deepEqual(report, repeated, 'raport musi być stabilny po ponownym otwarciu w tym samym tygodniu');
assert.equal(report.assistantModel.uncertaintyPercent, 5);
assert.ok(weakReport.assistantModel.uncertaintyPercent > report.assistantModel.uncertaintyPercent);
assert.equal(report.formAnalysis.sampleSize, 2);
assert.equal(report.formAnalysis.wins, 1);
assert.equal(report.formAnalysis.draws, 1);
assert.equal(report.formAnalysis.goalsFor, 3);
assert.equal(report.formAnalysis.goalsAgainst, 1);
assert.equal(report.formAnalysis.pointsPerMatch, 2);
assert.ok(report.formAnalysis.tacticRecords.some(record => record.tacticId === lineup.tacticId && record.matches === 2));
assert.ok(report.readinessAnalysis.unavailable >= 1, 'zawieszenie musi wpływać na gotowość kadry');
assert.ok(report.readinessAnalysis.concerns.some(entry => entry.player.id === 'PLAYER_21'), 'zmęczony zawodnik powinien trafić do ryzyk rotacyjnych');
assert.ok(report.dressingRoomAnalysis.concerns.some(entry => entry.player.id === 'PLAYER_18'), 'morale, konflikt i aklimatyzacja muszą trafiać do analizy szatni');
assert.ok(report.developmentAnalysis.focusMismatches.some(entry => entry.player.age <= 21), 'młody zawodnik bez celu treningowego wymaga korekty planu');
assert.ok(report.tacticalProfile.pressingFit > 0 && report.tacticalProfile.counterAttackFit > 0);
assert.equal(report.executiveSummary.actions.length, 3);
assert.equal(report.commentary.styleName, 'Adam Ekspert', 'głos raportu powinien należeć do faktycznie zatrudnionego asystenta');

const nextWeek = TeamAnalysisService.analyzeSquad({
  ...input,
  currentDate: new Date('2026-09-01T12:00:00.000Z'),
});
assert.notEqual(nextWeek.assistantModel.generatedForWeek, report.assistantModel.generatedForWeek);

console.log('TeamAnalysisTests: OK');
