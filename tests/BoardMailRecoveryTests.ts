import assert from 'node:assert/strict';
import { MailService, getManagerLeagueFormTrend } from '../services/MailService';
import { Club, Fixture, ManagerContract, MatchStatus } from '../types';

const makeClub = (id: string, name: string): Club => ({
  id,
  name,
  shortName: name,
  leagueId: 'L_PL_1',
  tier: 1,
  reputation: 8,
  budget: 20_000_000,
  transferBudget: 5_000_000,
  colorsHex: ['#0f5ca8', '#ffffff'],
  stats: {
    played: 25,
    wins: 5,
    draws: 3,
    losses: 17,
    goalsFor: 22,
    goalsAgainst: 48,
    goalDifference: -26,
    points: 18,
    form: ['P', 'P', 'W', 'W', 'W'],
  },
  board: {
    hojnosc: 'przecietna',
    ambicja: 'wysoka',
    cierpliwosc: 'przecietna',
    chciwosc: 'przecietna',
    oczekiwania: 'wysoka',
    kompetencja: 'wysoka',
  },
} as Club);

const userClub = makeClub('USER_CLUB', 'Wisła Płock');
const opponents = Array.from({ length: 11 }, (_, index) => makeClub(`OPPONENT_${index + 1}`, `Rywal ${index + 1}`));
const allClubs = [userClub, ...opponents];
const signedAt = new Date('2026-12-01T12:00:00.000Z');
const currentDate = new Date('2027-03-01T12:00:00.000Z');
const managerContract = {
  id: 'RECOVERY_CONTRACT',
  clubId: userClub.id,
  signedAt: signedAt.toISOString(),
  source: 'JOB_MARKET',
  status: 'ACTIVE',
  terms: { startDate: signedAt.toISOString() },
  standardRenewalMonths: 6,
} as ManagerContract;

const makeFinishedFixture = (index: number, won: boolean): Fixture => ({
  id: `FIXTURE_${index + 1}`,
  leagueId: userClub.leagueId,
  homeTeamId: userClub.id,
  awayTeamId: opponents[index].id,
  date: new Date(2026, 11, 5 + index * 10),
  status: MatchStatus.FINISHED,
  homeScore: won ? 2 : 0,
  awayScore: won ? 0 : 2,
} as Fixture);

const recoveryFixtures = Array.from({ length: 8 }, (_, index) => makeFinishedFixture(index, index >= 5));
const scheduledFixtures = Array.from({ length: 3 }, (_, index) => ({
  ...makeFinishedFixture(index + 8, false),
  id: `SCHEDULED_${index + 1}`,
  date: new Date(2027, 2, 8 + index * 7),
  status: MatchStatus.SCHEDULED,
  homeScore: null,
  awayScore: null,
})) as Fixture[];
const allFixtures = [...recoveryFixtures, ...scheduledFixtures];

const trend = getManagerLeagueFormTrend(managerContract, userClub, allFixtures, currentDate);
assert.equal(trend.matchesManaged, 8, 'trend powinien uwzględniać wyłącznie mecze rozegrane przez aktualnego trenera');
assert.equal(trend.currentWinStreak, 3, 'silnik powinien rozpoznać trzy kolejne zwycięstwa po przejęciu zespołu');
assert.equal(trend.isClearRecovery, true, 'trzy kolejne zwycięstwa powinny zostać uznane za wyraźną poprawę');

const originalRandom = Math.random;
try {
  Math.random = () => 0;
  const recoveryMails = MailService.generateDailyMails(
    currentDate,
    userClub,
    {},
    allClubs,
    18,
    40,
    undefined,
    undefined,
    [],
    undefined,
    allFixtures,
    undefined,
    1,
    {},
    [],
    [],
    1,
    [],
    undefined,
    managerContract,
  );

  assert.ok(recoveryMails.some(mail => mail.subject === 'Wyraźny postęp drużyny'), 'zarząd powinien pochwalić odbudowę mimo nadal niskiego miejsca w tabeli');
  assert.equal(recoveryMails.some(mail => mail.subject === 'Niezadowolenie z miejsca w tabeli'), false, 'dobra seria nie może jednocześnie wywoływać krytyki pozycji w tabeli');
  assert.equal(recoveryMails.some(mail => mail.subject === 'PILNE: Wymagane działania'), false, 'dobra seria musi wstrzymać cotygodniowy krytyczny nacisk zarządu');

  const poorFixtures = Array.from({ length: 8 }, (_, index) => makeFinishedFixture(index, false));
  const poorMails = MailService.generateDailyMails(
    currentDate,
    { ...userClub, stats: { ...userClub.stats, form: ['P', 'P', 'P', 'P', 'P'] } },
    {},
    allClubs,
    18,
    25,
    undefined,
    undefined,
    [],
    undefined,
    [...poorFixtures, ...scheduledFixtures],
    undefined,
    1,
    {},
    [],
    [],
    1,
    [],
    undefined,
    managerContract,
  );
  assert.ok(
    poorMails.some(mail => mail.subject === 'Niezadowolenie z miejsca w tabeli' || mail.subject === 'PILNE: Wymagane działania'),
    'bez poprawy wyników ostrzegawcza komunikacja zarządu powinna nadal działać',
  );
} finally {
  Math.random = originalRandom;
}

console.log('BoardMailRecoveryTests: OK');
