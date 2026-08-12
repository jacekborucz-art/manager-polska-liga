import { strict as assert } from 'node:assert';
import { Club, HealthStatus, Player, PlayerPosition, Region } from '../types';
import { LoanNegotiationService } from '../services/LoanNegotiationService';

const club = (id: string, reputation: number): Club => ({
  id,
  name: id,
  shortName: id.slice(0, 3),
  leagueId: id === 'BUYER' ? 'L_PL_3' : 'L_PL_1',
  tier: id === 'BUYER' ? 3 : 1,
  colorsHex: ['#000000', '#ffffff'],
  stadiumName: 'Stadion',
  stadiumCapacity: 10_000,
  reputation,
  country: 'POL',
  isDefaultActive: true,
  rosterIds: [],
  stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
  budget: 1_000_000,
  transferBudget: 500_000,
  boardStrictness: 50,
  signingBonusPool: 0,
} as Club);

const player = (id: string, age: number, overallRating: number, talent: number): Player => ({
  id,
  firstName: 'Jan',
  lastName: id,
  age,
  clubId: 'SELLER',
  nationality: Region.POLAND,
  position: PlayerPosition.FWD,
  overallRating,
  attributes: {
    strength: 60, stamina: 60, pace: 60, defending: 40, passing: 60, attacking: 65,
    finishing: 65, technique: 60, vision: 60, dribbling: 60, heading: 60, positioning: 60,
    goalkeeping: 10, freeKicks: 50, talent, penalties: 50, corners: 50, aggression: 50,
    crossing: 50, leadership: 50, mentality: 60, workRate: 60,
  },
  stats: {
    goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0,
    matchesPlayed: 0, minutesPlayed: 0, seasonalChanges: {}, ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: '2052-06-30',
  annualSalary: 120_000,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  fatigueDebt: 0,
} as Player);

const buyer = club('BUYER', 6);
const seller = club('SELLER', 13);
const prospect = player('PROSPECT', 19, 70, 90);
const olderPlayer = player('OLDER', 29, 70, 72);
const buyerSquad = [player('BUYER_FWD_1', 27, 64, 65), player('BUYER_FWD_2', 24, 62, 68)];
const sellerSquad = [prospect, player('SELLER_FWD_1', 27, 76, 78), player('SELLER_FWD_2', 25, 74, 77), player('SELLER_FWD_3', 23, 72, 82), player('SELLER_FWD_4', 21, 71, 85)];

let firstTeamAccepted = 0;
let rotationAccepted = 0;
let youngUltimatums = 0;
let olderUltimatums = 0;
for (let seed = 1; seed <= 500; seed += 1) {
  const common = {
    buyerClub: buyer,
    sellerClub: seller,
    buyerSquad,
    sellerSquad,
    loanFee: 0,
    wageCoveragePercent: 0,
    financialValueForSeller: 0,
    expectedFinancialValue: 100_000,
    seed,
  };
  const firstTeam = LoanNegotiationService.evaluate({ ...common, player: prospect, promisedPlayingTime: 'FIRST_TEAM' });
  const rotation = LoanNegotiationService.evaluate({ ...common, player: prospect, promisedPlayingTime: 'ROTATION' });
  const olderRotation = LoanNegotiationService.evaluate({ ...common, player: olderPlayer, promisedPlayingTime: 'ROTATION' });
  if (firstTeam.outcome === 'ACCEPT') firstTeamAccepted += 1;
  if (rotation.outcome === 'ACCEPT') rotationAccepted += 1;
  if (rotation.outcome === 'ULTIMATUM') youngUltimatums += 1;
  if (olderRotation.outcome === 'ULTIMATUM') olderUltimatums += 1;
}

assert.ok(firstTeamAccepted > 150, 'wiarygodna gwarancja pierwszego składu musi czasem otwierać darmowe wypożyczenie');
assert.ok(firstTeamAccepted < 490, 'nawet bardzo dobra darmowa oferta nie może być pewna');
assert.ok(firstTeamAccepted > rotationAccepted, 'pierwszy skład musi być wyraźnie cenniejszy od roli zmiennika');
assert.ok(youngUltimatums > olderUltimatums, 'młody wartościowy zawodnik powinien częściej wywoływać ultimatum');

const acceptedUltimatum = LoanNegotiationService.evaluate({
  player: prospect,
  buyerClub: buyer,
  sellerClub: seller,
  buyerSquad,
  sellerSquad,
  loanFee: 0,
  wageCoveragePercent: 0,
  financialValueForSeller: 0,
  expectedFinancialValue: 100_000,
  promisedPlayingTime: 'FIRST_TEAM',
  acceptedUltimatum: true,
  seed: 123,
});
assert.equal(acceptedUltimatum.outcome, 'ACCEPT', 'przyjęcie wiarygodnego ultimatum musi kończyć etap rozmów z klubem');

for (let seed = 1; seed <= 100; seed += 1) {
  const until = new Date(LoanNegotiationService.getLockoutUntil('2050-01-15', seed));
  assert.ok(until >= new Date('2050-04-15'), 'blokada nie może być krótsza niż 3 miesiące');
  assert.ok(until <= new Date('2051-01-15'), 'blokada nie może być dłuższa niż 12 miesięcy');
  assert.equal(
    LoanNegotiationService.getLockoutUntil('2050-01-15', seed),
    LoanNegotiationService.getLockoutUntil('2050-01-15', seed),
    'ten sam zapis nie może ponownie losować długości blokady'
  );
}

const warning = LoanNegotiationService.reviewPromise({
  player: prospect,
  promisedPlayingTime: 'FIRST_TEAM',
  eligibleClubMatches: 5,
  playerMatches: 1,
  playerMinutes: 30,
  previousBreaches: 0,
  seed: 10,
});
assert.equal(warning.outcome, 'WARNING', 'pierwsze naruszenie powinno kończyć się ostrzeżeniem');

let recalls = 0;
for (let seed = 1; seed <= 200; seed += 1) {
  const review = LoanNegotiationService.reviewPromise({
    player: prospect,
    promisedPlayingTime: 'FIRST_TEAM',
    eligibleClubMatches: 5,
    playerMatches: 0,
    playerMinutes: 0,
    previousBreaches: 1,
    seed,
  });
  if (review.outcome === 'RECALL') recalls += 1;
}
assert.ok(recalls > 80 && recalls < 200, 'odwołanie po kolejnym naruszeniu musi pozostać częste, ale losowe');

const fulfilled = LoanNegotiationService.reviewPromise({
  player: prospect,
  promisedPlayingTime: 'FIRST_TEAM',
  eligibleClubMatches: 5,
  playerMatches: 4,
  playerMinutes: 320,
  previousBreaches: 1,
  seed: 10,
});
assert.equal(fulfilled.outcome, 'FULFILLED');
assert.equal(fulfilled.nextBreaches, 0, 'regularna gra musi wyzerować wcześniejsze naruszenia');

console.log('LoanNegotiationTests: OK');
