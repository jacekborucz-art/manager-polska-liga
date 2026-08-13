import { strict as assert } from 'node:assert';
import { AiMatchPreparationService } from '../services/AiMatchPreparationService';
import {
  BackgroundMatchProcessorCL,
  calculateEuropeanRedCardImpact,
  sampleEuropeanExtraTimeGoals,
} from '../services/BackgroundMatchProcessorCL';
import { BackgroundMatchUEFASuperCup } from '../services/BackgroundMatchUEFASuperCup';
import { LineupService } from '../services/LineupService';
import { TacticRepository } from '../resources/tactics_db';
import { Club, Coach, CompetitionType, Fixture, HealthStatus, InjurySeverity, MatchStatus, Player, PlayerPosition } from '../types';

const makePlayer = (id: string, position: PlayerPosition, level: number): Player => ({
  id,
  firstName: 'Test',
  lastName: id,
  position,
  overallRating: level,
  condition: 100,
  morale: 75,
  suspensionMatches: 0,
  euroSuspensionMatches: 0,
  health: { status: HealthStatus.HEALTHY },
  stats: { matchesPlayed: 0, minutesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, seasonalChanges: {}, ratingHistory: [] },
  attributes: {
    strength: level,
    stamina: level,
    pace: level,
    acceleration: level,
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
  ...Array.from({ length: 7 }, (_, index) => makePlayer(`${prefix}_def_${index}`, PlayerPosition.DEF, level - index % 3)),
  ...Array.from({ length: 8 }, (_, index) => makePlayer(`${prefix}_mid_${index}`, PlayerPosition.MID, level - index % 3)),
  ...Array.from({ length: 5 }, (_, index) => makePlayer(`${prefix}_fwd_${index}`, PlayerPosition.FWD, level - index % 3)),
];

const makeCoach = (
  id: string,
  clubId: string,
  quality: number,
  tactics: Coach['favoriteTactics']
): Coach => ({
  id,
  firstName: 'Coach',
  lastName: id,
  age: 48,
  nationality: 'Europe',
  nationalityFlag: '',
  currentClubId: clubId,
  hiredDate: '2025-07-01',
  contractEndDate: '2027-06-30',
  annualSalary: 1,
  expPoints: 100,
  blacklist: {},
  attributes: { experience: quality, decisionMaking: quality, motivation: quality, training: quality },
  favoriteTactics: tactics,
  history: [],
  seasonStats: [],
});

const strongClub = { id: 'STRONG', coachId: 'COACH_STRONG', reputation: 18, stats: {} } as Club;
const weakClub = { id: 'WEAK', coachId: 'COACH_WEAK', reputation: 10, stats: {} } as Club;
const cautiousClub = { id: 'CAUTIOUS', coachId: 'COACH_CAUTIOUS', reputation: 14, stats: {} } as Club;
const strongCoach = makeCoach('COACH_STRONG', strongClub.id, 90, {
  offensive: '4-3-3 Atak',
  neutral: '4-2-3-1',
  defensive: '5-4-1',
});
const weakCoach = makeCoach('COACH_WEAK', weakClub.id, 85, {
  offensive: '3-4-3',
  neutral: '3-5-2',
  defensive: '5-4-1',
});
const cautiousCoach = makeCoach('COACH_CAUTIOUS', cautiousClub.id, 20, {
  offensive: '4-3-3 Atak',
  neutral: '3-5-2',
  defensive: '5-4-1',
});
const coaches = {
  [strongCoach.id]: strongCoach,
  [weakCoach.id]: weakCoach,
  [cautiousCoach.id]: cautiousCoach,
};

const halfMatchRedImpact = calculateEuropeanRedCardImpact([{ outId: 'test_player', min: 45 }]);
assert.ok(Math.abs(halfMatchRedImpact.attackMult - 0.66) < 0.000001, 'kartka w 45. minucie ma obniżyć ofensywę proporcjonalnie do czasu gry w osłabieniu');
assert.ok(Math.abs(halfMatchRedImpact.defenseLeakMult - 1.375) < 0.000001, 'kartka w 45. minucie ma zwiększyć podatność obrony proporcjonalnie do czasu gry w osłabieniu');

const extraTimeWithoutGoalCap = sampleEuropeanExtraTimeGoals(0.8, () => 0.9999, 0);
assert.ok(extraTimeWithoutGoalCap > 2, 'dogrywka nie może mieć sztywnego limitu dwóch bramek');

assert.equal(
  AiMatchPreparationService.getClubCoach(strongClub, coaches),
  strongCoach,
  'trener musi być pobierany przez club.coachId, a nie przez ID klubu'
);
assert.equal(
  AiMatchPreparationService.determineMatchIntent(strongClub, weakClub, strongCoach, true),
  'OFFENSIVE',
  'mocny trener zdecydowanego faworyta powinien wybrać plan ofensywny'
);
assert.equal(
  AiMatchPreparationService.determineMatchIntent(weakClub, strongClub, weakCoach, false),
  'DEFENSIVE',
  'mocny trener outsidera powinien wybrać plan defensywny'
);
assert.equal(
  AiMatchPreparationService.determineMatchIntent(cautiousClub, weakClub, cautiousCoach, false),
  'NEUTRAL',
  'słabszy trener ma pozostać neutralny zamiast wybierać nielogiczną skrajność'
);
assert.equal(
  AiMatchPreparationService.determineMatchIntent(weakClub, strongClub, weakCoach, false, -1),
  'OFFENSIVE',
  'przegrywający zespół w rewanżu musi próbować odrobić wynik'
);

const fixture: Fixture = {
  id: 'EL_TEST_MATCH',
  leagueId: CompetitionType.EL_GROUP_STAGE,
  homeTeamId: strongClub.id,
  awayTeamId: weakClub.id,
  date: new Date(2025, 7, 7),
  status: MatchStatus.SCHEDULED,
  homeScore: null,
  awayScore: null,
};
const strongSquad = makeSquad('strong', 84);
const weakSquad = makeSquad('weak', 68);
const strongLineup = AiMatchPreparationService.prepareTeamForMatch(
  strongClub,
  weakClub,
  strongSquad,
  strongCoach,
  fixture,
  true,
  'strong_test'
);
const weakLineup = AiMatchPreparationService.prepareTeamForMatch(
  weakClub,
  strongClub,
  weakSquad,
  weakCoach,
  fixture,
  false,
  'weak_test'
);

assert.equal(strongLineup.tacticId, '4-3-3', 'faworyt musi użyć ofensywnej ulubionej taktyki swojego trenera');
assert.equal(weakLineup.tacticId, '5-4-1', 'outsider musi użyć defensywnej ulubionej taktyki swojego trenera');
assert.notEqual(strongLineup.tacticId, weakLineup.tacticId, 'europejskie drużyny nie mogą być sprowadzane do wspólnego 4-4-2');
assert.equal(strongLineup.startingXI.filter(Boolean).length, 11, 'trener gospodarzy musi wystawić pełną jedenastkę');
assert.equal(weakLineup.startingXI.filter(Boolean).length, 11, 'trener gości musi wystawić pełną jedenastkę');

// Strict European background flow: availability must be resolved before the
// formation. Only one of four forwards can play, therefore the coach's 4-3-3 is
// impossible and the compatible neutral 4-2-3-1 must be selected instead.
const constrainedSquad: Player[] = [
  makePlayer('limited_gk_1', PlayerPosition.GK, 82),
  makePlayer('limited_gk_2', PlayerPosition.GK, 76),
  ...Array.from({ length: 4 }, (_, index) => makePlayer(`limited_def_${index}`, PlayerPosition.DEF, 80 - index)),
  ...Array.from({ length: 6 }, (_, index) => makePlayer(`limited_mid_${index}`, PlayerPosition.MID, 81 - index)),
  makePlayer('limited_fwd_fit', PlayerPosition.FWD, 80),
  { ...makePlayer('limited_fwd_suspended', PlayerPosition.FWD, 86), euroSuspensionMatches: 1 },
  {
    ...makePlayer('limited_fwd_injured', PlayerPosition.FWD, 88),
    health: {
      status: HealthStatus.INJURED,
      injury: {
        type: 'Test injury',
        daysRemaining: 20,
        totalDays: 20,
        injuryDate: '2025-08-01',
        severity: InjurySeverity.SEVERE,
      },
    },
  },
  { ...makePlayer('limited_fwd_unfit', PlayerPosition.FWD, 90), condition: 40 },
];
const strictEuropeanLineup = AiMatchPreparationService.prepareTeamForMatch(
  strongClub,
  weakClub,
  constrainedSquad,
  strongCoach,
  fixture,
  true,
  'strict_european_test',
  undefined,
  true
);

assert.equal(strictEuropeanLineup.tacticId, '4-2-3-1', 'braki pozycyjne muszą wymusić wykonalną alternatywę dla 4-3-3');
assert.equal(strictEuropeanLineup.startingXI.filter(Boolean).length, 11, 'alternatywna formacja musi zapewnić pełną jedenastkę');
assert.equal(strictEuropeanLineup.startingXI.includes('limited_fwd_suspended'), false, 'zawieszony zawodnik nie może wpływać na formację ani skład');
assert.equal(strictEuropeanLineup.startingXI.includes('limited_fwd_injured'), false, 'poważnie kontuzjowany zawodnik nie może wpływać na formację ani skład');
assert.equal(strictEuropeanLineup.startingXI.includes('limited_fwd_unfit'), false, 'zawodnik poniżej progu kondycji nie może wpływać na formację ani skład');

const strictTactic = TacticRepository.getById(strictEuropeanLineup.tacticId);
strictEuropeanLineup.startingXI.forEach((playerId, slotIndex) => {
  const player = constrainedSquad.find(candidate => candidate.id === playerId);
  assert.ok(player, `slot ${slotIndex} musi zawierać istniejącego zawodnika`);
  assert.equal(player?.position, strictTactic.slots[slotIndex].role, `slot ${slotIndex} musi być obsadzony naturalną pozycją`);
});

// Pełna regresja raportu: nawet jeśli globalny stan nadal zawiera stare 4-4-2,
// procesor europejski ma przygotować mecz przez faktycznych trenerów i zapisać
// ich formacje do historii.
const staleLineups = {
  [strongClub.id]: LineupService.autoPickLineup(strongClub.id, strongSquad, '4-4-2', null, { respectRequestedTactic: true }),
  [weakClub.id]: LineupService.autoPickLineup(weakClub.id, weakSquad, '4-4-2', null, { respectRequestedTactic: true }),
};
const backgroundResult = BackgroundMatchProcessorCL.processChampionsLeagueEvent(
  new Date(fixture.date),
  null,
  [fixture],
  [strongClub, weakClub],
  { [strongClub.id]: strongSquad, [weakClub.id]: weakSquad },
  staleLineups,
  1,
  123456,
  coaches
);
const report = backgroundResult.matchHistoryEntries[0];
assert.ok(report, 'symulowany mecz europejski musi utworzyć raport');
assert.equal(report.homeStartingTacticId, '4-3-3', 'raport ma zapisać startową taktykę właściwego trenera gospodarzy');
assert.equal(report.awayStartingTacticId, '5-4-1', 'raport ma zapisać startową taktykę właściwego trenera gości');
assert.equal(report.homeTacticId, '4-3-3', 'raport nie może odziedziczyć starego globalnego 4-4-2 gospodarzy');
assert.equal(report.awayTacticId, '5-4-1', 'raport nie może odziedziczyć starego globalnego 4-4-2 gości');
assert.equal(report.homeLineup?.length, 11, 'raport ma zawierać pełny skład gospodarzy');
assert.equal(report.awayLineup?.length, 11, 'raport ma zawierać pełny skład gości');

const superCupFixture: Fixture = {
  ...fixture,
  id: 'UEFA_SUPER_CUP_TEST',
  leagueId: CompetitionType.UEFA_SUPER_CUP,
};
const superCupResult = BackgroundMatchUEFASuperCup.processSuperCupMatch(
  new Date(superCupFixture.date),
  [superCupFixture],
  [strongClub, weakClub],
  { [strongClub.id]: constrainedSquad, [weakClub.id]: weakSquad },
  {},
  1,
  654321,
  coaches
);
const superCupReport = superCupResult.matchHistoryEntries[0];
assert.ok(superCupReport, 'Superpuchar UEFA musi utworzyć raport');
assert.equal(superCupReport.homeStartingTacticId, '4-2-3-1', 'Superpuchar UEFA ma użyć wykonalnej alternatywy trenera gospodarzy');
assert.equal(superCupReport.awayStartingTacticId, '5-4-1', 'Superpuchar UEFA ma użyć trenera gości');
assert.equal(superCupReport.ratings && Object.keys(superCupReport.ratings).length > 0, true, 'raport Superpucharu UEFA ma zapisać oceny');

console.log('EuropeanAiMatchPreparationTests: OK');
