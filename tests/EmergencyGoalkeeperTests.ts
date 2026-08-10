import { strict as assert } from 'node:assert';
import { Club, HealthStatus, Lineup, Player, PlayerPosition } from '../types';
import { EmergencyGoalkeeperService } from '../services/EmergencyGoalkeeperService';

const club: Club = {
  id: 'PL_TEST',
  name: 'Klub Testowy',
  shortName: 'KLT',
  leagueId: 'L_PL_2',
  tier: 2,
  colorsHex: ['#000000', '#ffffff'],
  stadiumName: 'Stadion',
  stadiumCapacity: 10_000,
  reputation: 8,
  country: 'POL',
  isDefaultActive: true,
  rosterIds: ['REAL_GK', 'DEF_1'],
  stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
  budget: 1_000_000,
  transferBudget: 500_000,
  boardStrictness: 50,
  signingBonusPool: 0,
};

const injuredGoalkeeper = {
  id: 'REAL_GK',
  clubId: club.id,
  firstName: 'Jan',
  lastName: 'Kontuzjowany',
  position: PlayerPosition.GK,
  health: { status: HealthStatus.INJURED },
  suspensionMatches: 0,
  condition: 40,
} as Player;
const defender = {
  id: 'DEF_1',
  clubId: club.id,
  firstName: 'Piotr',
  lastName: 'Obrońca',
  position: PlayerPosition.DEF,
  health: { status: HealthStatus.HEALTHY },
  suspensionMatches: 0,
  condition: 100,
} as Player;
const lineup: Lineup = {
  clubId: club.id,
  tacticId: '4-4-2',
  startingXI: [injuredGoalkeeper.id, defender.id, null, null, null, null, null, null, null, null, null],
  bench: [],
  reserves: [],
};

const hired = EmergencyGoalkeeperService.process(
  [club],
  { [club.id]: [injuredGoalkeeper, defender] },
  { [club.id]: lineup },
  club.id,
  new Date(2026, 7, 10),
  false,
  'Kowalczyk'
);
assert.equal(hired.action, 'HIRED', 'brak dostępnego bramkarza musi uruchomić awaryjny nabór');
assert.ok(hired.emergencyGoalkeeper, 'usługa musi zwrócić wygenerowanego juniora');
assert.equal(
  hired.emergencyGoalkeeper?.lastName,
  'Kowalczyk',
  'naprawa starego zapisu musi odtworzyć nazwisko widoczne we wcześniejszej wiadomości'
);
assert.ok(
  hired.updatedPlayers[club.id].some(player => player.id === hired.emergencyGoalkeeper?.id),
  'junior musi faktycznie trafić do mapy zawodników klubu'
);
assert.ok(
  hired.updatedClubs[0].rosterIds.includes(hired.emergencyGoalkeeper!.id),
  'junior musi zostać dopisany również do rosterIds'
);
assert.equal(
  hired.updatedLineups[club.id].startingXI[0],
  hired.emergencyGoalkeeper!.id,
  'awaryjny bramkarz musi zostać ustawiony w pierwszym składzie'
);

const repeated = EmergencyGoalkeeperService.process(
  hired.updatedClubs,
  hired.updatedPlayers,
  hired.updatedLineups,
  club.id,
  new Date(2026, 7, 11),
  false
);
assert.equal(repeated.action, null, 'kolejny dzień nie może wygenerować drugiego awaryjnego bramkarza');
assert.equal(
  repeated.updatedPlayers[club.id].filter(player => player.id.startsWith('EMERGENCY_GK_')).length,
  1,
  'w klubie może być tylko jeden awaryjny bramkarz'
);

const recoveredPlayers = {
  ...hired.updatedPlayers,
  [club.id]: hired.updatedPlayers[club.id].map(player => player.id === injuredGoalkeeper.id
    ? { ...player, health: { status: HealthStatus.HEALTHY }, condition: 95 }
    : player
  ),
};
const released = EmergencyGoalkeeperService.process(
  hired.updatedClubs,
  recoveredPlayers,
  hired.updatedLineups,
  club.id,
  new Date(2026, 7, 20),
  false
);
assert.equal(released.action, 'RELEASED', 'po powrocie prawdziwego bramkarza junior musi odejść');
assert.equal(
  released.updatedPlayers[club.id].some(player => player.id.startsWith('EMERGENCY_GK_')),
  false,
  'zwolniony junior nie może pozostać w składzie'
);
assert.equal(
  released.updatedClubs[0].rosterIds.some(id => id.startsWith('EMERGENCY_GK_')),
  false,
  'rosterIds musi zostać oczyszczone po odejściu juniora'
);

console.log('EmergencyGoalkeeperTests: OK');
