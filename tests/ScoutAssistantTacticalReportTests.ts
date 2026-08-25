import assert from 'node:assert/strict';
import {
  Club,
  HealthStatus,
  Lineup,
  Player,
  PlayerPosition,
} from '../types';
import { buildScoutTacticalAnalysis, ScoutAssistantService } from '../services/ScoutAssistantService';

const makePlayer = (
  id: string,
  position: PlayerPosition,
  overrides: Partial<Player> = {}
): Player => ({
  id,
  firstName: 'Jan',
  lastName: id,
  age: 25,
  clubId: id.startsWith('USER') ? 'USER_CLUB' : 'OPPONENT_CLUB',
  nationality: 'POL' as Player['nationality'],
  position,
  overallRating: 70,
  attributes: {
    pace: 70,
    strength: 70,
    stamina: 70,
    defending: position === PlayerPosition.DEF ? 75 : 60,
    passing: 70,
    attacking: 68,
    finishing: 65,
    technique: 70,
    vision: 70,
    dribbling: 65,
    heading: 65,
    positioning: 70,
    goalkeeping: position === PlayerPosition.GK ? 75 : 5,
    freeKicks: 50,
    talent: 70,
    penalties: 50,
    corners: 50,
    aggression: 65,
    crossing: 60,
    leadership: 60,
    mentality: 70,
    workRate: 70,
  },
  stats: {
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    matchesPlayed: 0,
    minutesPlayed: 0,
    seasonalChanges: {},
    ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 90,
  suspensionMatches: 0,
  contractEndDate: '2030-06-30',
  annualSalary: 100_000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  ...overrides,
});

const makeSquad = (prefix: string): Player[] => [
  makePlayer(`${prefix}_GK`, PlayerPosition.GK),
  ...Array.from({ length: 4 }, (_, index) => makePlayer(`${prefix}_DEF_${index}`, PlayerPosition.DEF)),
  ...Array.from({ length: 3 }, (_, index) => makePlayer(`${prefix}_MID_${index}`, PlayerPosition.MID)),
  ...Array.from({ length: 3 }, (_, index) => makePlayer(`${prefix}_FWD_${index}`, PlayerPosition.FWD)),
];

const makeLineup = (clubId: string, tacticId: string, players: Player[]): Lineup => ({
  clubId,
  tacticId,
  startingXI: players.slice(0, 11).map(player => player.id),
  bench: [],
  reserves: [],
});

const userPlayers = makeSquad('USER');
const opponentPlayers = makeSquad('OPPONENT');
const userLineup = makeLineup('USER_CLUB', '4-2-3-1', userPlayers);
const pressingOpponentLineup = makeLineup('OPPONENT_CLUB', '4-3-3', opponentPlayers);
const counterOpponentLineup = makeLineup('OPPONENT_CLUB', '5-2-1-2', opponentPlayers);

// A fixed high roll disables the intentional scouting error and makes the structural assertions stable.
const eliteAnalysis = buildScoutTacticalAnalysis({
  opponentLineup: pressingOpponentLineup,
  opponentPlayers,
  userLineup,
  userPlayers,
  analysisQuality: 20,
  random: () => 1,
});

assert.equal(eliteAnalysis.uncertaintyPercent, 5, 'elitarny analityk nadal musi mieć minimum 5% niepewności');
assert.equal(eliteAnalysis.confidencePercent, 95);
assert.equal(eliteAnalysis.opponent.pressing, 'PRESSING', 'wysoki pressing formacji rywala powinien trafić do raportu');

const instructionKeys = ['tempo', 'mindset', 'intensity', 'passing', 'pressing', 'counterAttack', 'marking'] as const;
instructionKeys.forEach(key => {
  assert.ok(eliteAnalysis.opponent[key], `profil rywala powinien zawierać instrukcję ${key}`);
  assert.ok(eliteAnalysis.recommendation[key], `plan gracza powinien zawierać instrukcję ${key}`);
});

const counterAnalysis = buildScoutTacticalAnalysis({
  opponentLineup: counterOpponentLineup,
  opponentPlayers,
  userLineup,
  userPlayers,
  analysisQuality: 10,
  random: () => 1,
});
assert.equal(counterAnalysis.opponent.counterAttack, 'COUNTER', 'system kontratakujący musi być rozpoznany');
assert.equal(counterAnalysis.opponent.mindset, 'DEFENSIVE');
assert.equal(counterAnalysis.recommendation.marking, 'ZONE', 'przeciw kontrze raport powinien chronić strukturę kryciem strefowym');
assert.ok(counterAnalysis.warnings.some(warning => warning.includes('bocznych obrońców')));

const weakAnalysis = buildScoutTacticalAnalysis({
  opponentLineup: pressingOpponentLineup,
  opponentPlayers,
  userLineup,
  userPlayers,
  analysisQuality: 1,
  random: () => 1,
});
assert.ok(weakAnalysis.uncertaintyPercent > eliteAnalysis.uncertaintyPercent, 'słabszy analityk powinien mieć większy margines błędu');

const opponentClub = {
  id: 'OPPONENT_CLUB',
  name: 'Testowy Rywal',
  reputation: 7,
  colorPrimary: '#7c3aed',
  colorSecondary: '#ffffff',
  stats: { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
} as Club;
const mail = ScoutAssistantService.generatePreMatchReport({
  opponentClub,
  opponentPlayers,
  opponentLineup: pressingOpponentLineup,
  userPlayers,
  userLineup,
  matchDate: new Date('2026-08-25T12:00:00Z'),
  managerName: 'Jan Trener',
  clubs: [opponentClub],
  opponentLeaguePosition: 1,
  opponentLeaguePlayed: 0,
  opponentLeaguePoints: 0,
  opponentLeagueGoalDiff: 0,
  leagueName: 'Sparing',
  analysisQuality: 20,
  userClubId: 'USER_CLUB',
  isHome: true,
  isFriendly: true,
  seasonNumber: 1,
});
[
  'PROFIL TAKTYCZNY I PLAN STARTOWY',
  'Tempo',
  'Nastawienie',
  'Intensywność',
  'Podania',
  'Pressing',
  'Kontratak',
  'Krycie',
  'MARGINES NIEPEWNOŚCI 5%',
].forEach(fragment => assert.ok(mail.body.includes(fragment), `gotowy raport powinien zawierać: ${fragment}`));

console.log('ScoutAssistantTacticalReportTests: OK');
