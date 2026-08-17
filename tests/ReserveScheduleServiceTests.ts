import { strict as assert } from 'node:assert';
import { ReserveScheduleService } from '../services/ReserveScheduleService';
import { Club } from '../types';

const userClub = {
  id: 'USER',
  name: 'Klub użytkownika',
  tier: 1,
} as Club;

const opponents = Array.from({ length: 17 }, (_, index) => ({
  id: `OPPONENT_${index}`,
  name: `Rywal ${index + 1}`,
  tier: 2,
} as Club));

const schedule2025 = ReserveScheduleService.generate(userClub, [userClub, ...opponents], 1, 12345, 2025);
assert.ok(schedule2025.length > 0, 'terminarz rezerw musi zawierać mecze');
assert.equal(new Date(schedule2025[0].date).getFullYear(), 2025, 'start kariery 2025/26 ma wygenerować rundę jesienną w 2025 roku');
assert.ok(
  schedule2025.filter(fixture => fixture.round === 2).every(fixture => new Date(fixture.date).getFullYear() === 2026),
  'runda wiosenna sezonu 2025/26 ma przypadać na 2026 rok'
);

const schedule2026 = ReserveScheduleService.generate(userClub, [userClub, ...opponents], 1, 12345, 2026);
assert.ok(schedule2026.length > 0, 'terminarz rezerw dla startu 2026/27 musi zawierać mecze');
assert.equal(new Date(schedule2026[0].date).getFullYear(), 2026, 'numer sezonu 1 nie może cofać terminarza startu 2026/27 do 2025 roku');
assert.ok(
  schedule2026.filter(fixture => fixture.round === 2).every(fixture => new Date(fixture.date).getFullYear() === 2027),
  'runda wiosenna sezonu 2026/27 ma przypadać na 2027 rok'
);

const migratedSchedule = ReserveScheduleService.alignToSeasonStartYear(schedule2025, 1, 2026);
assert.ok(
  migratedSchedule.filter(fixture => fixture.round === 1).every(fixture => new Date(fixture.date).getFullYear() === 2026),
  'wczytany błędny terminarz rundy jesiennej musi zostać przesunięty na rok rozpoczęcia sezonu'
);
assert.ok(
  migratedSchedule.filter(fixture => fixture.round === 2).every(fixture => new Date(fixture.date).getFullYear() === 2027),
  'wczytany błędny terminarz rundy wiosennej musi zostać przesunięty na kolejny rok'
);

const takeoverDate = new Date(2026, 9, 5, 12, 0, 0);
const takeoverSchedule = ReserveScheduleService.generateForMidSeasonTakeover(
  userClub,
  [userClub, ...opponents],
  1,
  12345,
  2026,
  takeoverDate
);
const pastFixtures = takeoverSchedule.fixtures.filter(fixture => new Date(fixture.date).getTime() <= new Date(2026, 9, 5, 23, 59, 59, 999).getTime());
const futureFixtures = takeoverSchedule.fixtures.filter(fixture => new Date(fixture.date).getTime() > new Date(2026, 9, 5, 23, 59, 59, 999).getTime());

assert.ok(pastFixtures.length > 0, 'przejęcie klubu w trakcie sezonu musi znaleźć wcześniejsze mecze rezerw');
assert.ok(futureFixtures.length > 0, 'po przejęciu klubu musi pozostać co najmniej jeden przyszły mecz rezerw');
assert.equal(
  takeoverSchedule.results.length,
  pastFixtures.length,
  'każdy wcześniejszy termin musi otrzymać uproszczony wynik'
);
assert.ok(pastFixtures.every(fixture => fixture.resultId), 'wcześniejsze mecze muszą wskazywać zapisany wynik');
assert.ok(futureFixtures.every(fixture => !fixture.resultId), 'przyszłe mecze nie mogą zostać zasymulowane podczas przejęcia klubu');
assert.ok(
  takeoverSchedule.results.every(result =>
    result.isSummaryOnly &&
    result.goals.length === 0 &&
    result.cards.length === 0 &&
    result.substitutions.length === 0 &&
    Object.keys(result.ratings).length === 0
  ),
  'odtworzone wyniki nie mogą zawierać pełnego raportu ani statystyk zawodników'
);

const repeatedTakeoverSchedule = ReserveScheduleService.generateForMidSeasonTakeover(
  userClub,
  [userClub, ...opponents],
  1,
  12345,
  2026,
  takeoverDate
);
assert.deepEqual(
  repeatedTakeoverSchedule.results.map(result => [result.homeScore, result.awayScore]),
  takeoverSchedule.results.map(result => [result.homeScore, result.awayScore]),
  'szybkie wyniki muszą być deterministyczne dla tego samego zapisu gry'
);

console.log('ReserveScheduleServiceTests: OK');
