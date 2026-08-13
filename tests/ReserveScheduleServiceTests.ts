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

console.log('ReserveScheduleServiceTests: OK');
