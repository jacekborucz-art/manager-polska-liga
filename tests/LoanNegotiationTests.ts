import { strict as assert } from 'node:assert';
import { Club, HealthStatus, LoanNegotiationTerms, Player, PlayerPosition, Region } from '../types';
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
const buyerSquad = [player('BUYER_FWD_1', 27, 64, 65), player('BUYER_FWD_2', 24, 62, 68)];
const sellerSquad = [prospect, player('SELLER_FWD_1', 27, 76, 78), player('SELLER_FWD_2', 25, 74, 77), player('SELLER_FWD_3', 23, 72, 82), player('SELLER_FWD_4', 21, 71, 85)];
const initialTerms: LoanNegotiationTerms = {
  loanFee: 0,
  wageCoveragePercent: 20,
  loanDuration: 'SEASON',
  promisedPlayingTime: 'ROTATION',
};

assert.equal(
  LoanNegotiationService.getArrivalDate('2050-07-31'),
  '2050-08-01',
  'zawodnik musi dołączyć dokładnie następnego dnia, także na granicy miesiąca'
);

const approachCounts = new Set<number>();
for (let seed = 1; seed <= 300; seed += 1) {
  const state = LoanNegotiationService.createState('2050-07-01', initialTerms, seed);
  approachCounts.add(state.maxApproaches);
  assert.ok(state.maxApproaches >= 3 && state.maxApproaches <= 5, 'negocjacje muszą trwać od 3 do 5 podejść');
  assert.deepEqual(
    state,
    LoanNegotiationService.createState('2050-07-01', initialTerms, seed),
    'ukryta liczba podejść musi być odporna na ponowne wczytanie'
  );
}
assert.deepEqual([...approachCounts].sort(), [3, 4, 5], 'RNG musi wykorzystywać wszystkie długości negocjacji');

let higherCounters = 0;
let lowerCounters = 0;
for (let seed = 1; seed <= 300; seed += 1) {
  const state = LoanNegotiationService.createState('2050-07-01', initialTerms, seed);
  const result = LoanNegotiationService.negotiateRound({
    player: prospect,
    buyerClub: buyer,
    sellerClub: seller,
    buyerSquad,
    sellerSquad,
    submittedTerms: initialTerms,
    state,
    expectedLoanFee: 50_000,
    seed,
  });
  assert.equal(result.outcome, 'COUNTER', 'pierwsza oferta zainteresowanego klubu nie może natychmiast kończyć negocjacji');
  if ((result.counterOffer?.loanFee ?? 0) > initialTerms.loanFee || (result.counterOffer?.wageCoveragePercent ?? 0) > initialTerms.wageCoveragePercent) higherCounters += 1;
  if ((result.counterOffer?.loanFee ?? 0) < initialTerms.loanFee || (result.counterOffer?.wageCoveragePercent ?? 0) < initialTerms.wageCoveragePercent) lowerCounters += 1;
}
assert.ok(higherCounters > 0, 'klub musi czasem podwyższać warunki');
assert.ok(lowerCounters > 0, 'klub musi czasem obniżać warunki');

const stateFive = { ...LoanNegotiationService.createState('2050-07-01', initialTerms, 10), maxApproaches: 5 as const };
let currentState = stateFive;
for (let approach = 1; approach < 5; approach += 1) {
  const result = LoanNegotiationService.negotiateRound({
    player: prospect,
    buyerClub: buyer,
    sellerClub: seller,
    buyerSquad,
    sellerSquad,
    submittedTerms: currentState.clubTerms,
    state: currentState,
    expectedLoanFee: 50_000,
    seed: 10,
  });
  assert.equal(result.outcome, 'COUNTER', 'przed ukrytym limitem klub powinien kontynuować rozmowy');
  currentState = result.nextState!;
}
const finalResult = LoanNegotiationService.negotiateRound({
  player: prospect,
  buyerClub: buyer,
  sellerClub: seller,
  buyerSquad,
  sellerSquad,
  submittedTerms: { loanFee: 100_000, wageCoveragePercent: 100, loanDuration: 'SEASON', promisedPlayingTime: 'FIRST_TEAM' },
  state: currentState,
  expectedLoanFee: 50_000,
  seed: 10,
});
assert.ok(finalResult.outcome === 'ACCEPT' || finalResult.outcome === 'REJECT', 'dopiero ostatnie podejście powinno zakończyć rozmowy');

for (let seed = 1; seed <= 100; seed += 1) {
  const until = new Date(LoanNegotiationService.getLockoutUntil('2050-01-15', seed));
  assert.ok(until >= new Date('2050-04-15'), 'blokada nie może być krótsza niż 3 miesiące');
  assert.ok(until <= new Date('2051-01-15'), 'blokada nie może być dłuższa niż 12 miesięcy');
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
assert.equal(warning.outcome, 'WARNING');

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
assert.equal(fulfilled.nextBreaches, 0);

console.log('LoanNegotiationTests: OK');
