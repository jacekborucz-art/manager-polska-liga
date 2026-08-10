import { strict as assert } from 'node:assert';
import { Club, Player, PlayerPosition } from '../types';
import { DatapackSeasonSquadRepairService } from '../services/DatapackSeasonSquadRepairService';

const club = (overrides: Partial<Club>): Club => ({
  id: 'CLUB',
  name: 'Klub',
  shortName: 'KLU',
  leagueId: 'L_PL_2',
  tier: 2,
  colorsHex: ['#000000', '#ffffff'],
  stadiumName: 'Stadion',
  stadiumCapacity: 10_000,
  reputation: 9,
  country: 'POL',
  isDefaultActive: true,
  rosterIds: [],
  stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
  budget: 1_000_000,
  transferBudget: 500_000,
  boardStrictness: 50,
  signingBonusPool: 0,
  ...overrides,
});

const player = (id: string, clubId: string, position: PlayerPosition): Player => ({
  id,
  clubId,
  firstName: 'Test',
  lastName: id,
  age: 22,
  position,
  overallRating: 50,
  annualSalary: 50_000,
  attributes: {} as Player['attributes'],
} as Player);

const polishClub = club({ id: 'PL_TEST', leagueId: 'L_PL_2', country: 'POL' });
const europeanClub = club({ id: 'EU_TEST', leagueId: 'L_CL', country: 'ESP', reputation: 16 });
const shortSquad = (clubId: string): Player[] => [
  player(`${clubId}_GK`, clubId, PlayerPosition.GK),
  player(`${clubId}_DEF_1`, clubId, PlayerPosition.DEF),
  player(`${clubId}_DEF_2`, clubId, PlayerPosition.DEF),
  player(`${clubId}_MID_1`, clubId, PlayerPosition.MID),
  player(`${clubId}_MID_2`, clubId, PlayerPosition.MID),
  player(`${clubId}_FWD`, clubId, PlayerPosition.FWD),
];

assert.equal(
  DatapackSeasonSquadRepairService.shouldRun(new Date(2026, 6, 5), null),
  false,
  'audyt nie może uruchomić się bez datapacka'
);
assert.equal(
  DatapackSeasonSquadRepairService.shouldRun(new Date(2027, 6, 5), 2026),
  false,
  'audyt nie może wracać w kolejnych sezonach'
);

const initialPlayers = {
  [polishClub.id]: shortSquad(polishClub.id),
  [europeanClub.id]: shortSquad(europeanClub.id),
};
const polishRepair = DatapackSeasonSquadRepairService.repair(
  [polishClub, europeanClub],
  initialPlayers,
  new Date(2026, 6, 5),
  2026
);
assert.equal(polishRepair.updatedPlayers[polishClub.id].length, 16, 'polski klub musi mieć 16 zawodników 5 lipca');
assert.equal(polishRepair.updatedPlayers[europeanClub.id].length, 6, 'kontrola polska nie może skanować klubów zagranicznych');
assert.deepEqual(
  polishRepair.updatedClubs.find(candidate => candidate.id === polishClub.id)?.rosterIds,
  polishRepair.updatedPlayers[polishClub.id].map(candidate => candidate.id),
  'rosterIds muszą zostać zsynchronizowane z naprawioną kadrą'
);
Object.values(PlayerPosition).forEach(position => {
  assert.ok(
    polishRepair.updatedPlayers[polishClub.id].some(candidate => candidate.position === position),
    `uzupełniona kadra musi zawierać pozycję ${position}`
  );
});

const europeanRepair = DatapackSeasonSquadRepairService.repair(
  [polishClub, europeanClub],
  initialPlayers,
  new Date(2026, 6, 4),
  2026
);
assert.equal(europeanRepair.updatedPlayers[europeanClub.id].length, 16, 'zagraniczny klub europejski musi mieć 16 zawodników 4 lipca');
assert.equal(europeanRepair.updatedPlayers[polishClub.id].length, 6, 'kontrola europejska musi wykluczyć Polskę');

const secondCheck = DatapackSeasonSquadRepairService.repair(
  polishRepair.updatedClubs,
  polishRepair.updatedPlayers,
  new Date(2026, 6, 7),
  2026
);
assert.equal(secondCheck.generatedPlayerCount, 0, 'ponowna kontrola nie może dublować już uzupełnionych zawodników');

console.log('DatapackSeasonSquadRepairTests: OK');
