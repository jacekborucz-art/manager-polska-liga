import assert from 'node:assert/strict';
import { Club, HealthStatus, Player, PlayerPosition, Region } from '../types';
import { FinanceService } from '../services/FinanceService';
import { FreeAgentBoardAppealService } from '../services/FreeAgentBoardAppealService';

const makePlayer = (id: string, overallRating: number, annualSalary: number, position = PlayerPosition.GK): Player => ({
  id,
  firstName: 'Test',
  lastName: id,
  age: 26,
  clubId: annualSalary > 0 ? 'SECOND_LEAGUE' : 'FREE_AGENTS',
  nationality: Region.POLAND,
  position,
  overallRating,
  attributes: {
    strength: 55, stamina: 55, pace: 55, defending: 50, passing: 50,
    attacking: 50, finishing: 45, technique: 55, vision: 50, dribbling: 50,
    heading: 55, positioning: 58, goalkeeping: position === PlayerPosition.GK ? overallRating : 5,
    freeKicks: 45, talent: overallRating, penalties: 45, corners: 45,
    aggression: 50, crossing: 45, leadership: 50, mentality: 55, workRate: 55,
  },
  stats: {
    matchesPlayed: 0, minutesPlayed: 0, goals: 0, assists: 0,
    yellowCards: 0, redCards: 0, cleanSheets: 0,
    seasonalChanges: {}, ratingHistory: [],
  },
  health: { status: HealthStatus.HEALTHY },
  condition: 100,
  suspensionMatches: 0,
  contractEndDate: '2026-06-30T00:00:00.000Z',
  annualSalary,
  history: [],
  boardLockoutUntil: null,
  isUntouchable: false,
  negotiationStep: 0,
  negotiationLockoutUntil: null,
  contractLockoutUntil: null,
  isNegotiationPermanentBlocked: false,
  transferLockoutUntil: null,
  freeAgentLockoutUntil: null,
  fatigueDebt: 0,
} as Player);

const club: Club = ({
  id: 'SECOND_LEAGUE',
  name: 'Klub 2. ligi',
  shortName: 'K2L',
  leagueId: 'L_PL_3',
  tier: 3,
  reputation: 4,
  country: 'Polska',
  colorsHex: ['#111827', '#ffffff'],
  stadiumName: 'Stadion',
  stadiumCapacity: 5_000,
  isDefaultActive: true,
  rosterIds: [],
  stats: { form: [] },
  budget: 1_211_584,
  transferBudget: 600_000,
  boardStrictness: 5,
  signingBonusPool: 180_000,
} as Club);

const squad = [
  makePlayer('GK_CURRENT', 54, 54_000),
  makePlayer('DEF_1', 53, 48_000, PlayerPosition.DEF),
  makePlayer('MID_1', 55, 50_000, PlayerPosition.MID),
  makePlayer('FWD_1', 56, 52_000, PlayerPosition.FWD),
];
const candidate = makePlayer('WILLIAM', 59, 0);

const realisticOffer = FinanceService.evaluateFASigningBoardDecision(candidate, 120_000, 40_000, squad, club);
assert.equal(realisticOffer.approved, true, 'Kontrakt 120 000 PLN dla GK 59 OVR nie powinien dostać automatycznego VETO w 2. lidze.');

const astronomicalHierarchyOffer = FinanceService.evaluateFASigningBoardDecision(candidate, 300_000, 40_000, squad, club);
assert.equal(astronomicalHierarchyOffer.approved, false, 'Pensja wielokrotnie wyższa od hierarchii nadal powinna być blokowana.');
assert.equal(astronomicalHierarchyOffer.appealable, true, 'Weto dotyczące hierarchii płac powinno pozwalać na rozmowę z zarządem.');
assert.ok(!/OVR|overall/i.test(astronomicalHierarchyOffer.reason), 'Uzasadnienie zarządu nie może podawać limitu pensji wynikającego z OVR.');

const liquidityBreakingOffer = FinanceService.evaluateFASigningBoardDecision(candidate, 500_000, 40_000, squad, club);
assert.equal(liquidityBreakingOffer.approved, false, 'Zarząd powinien blokować pensję zagrażającą płynności klubu.');

const richPolishClub: Club = {
  ...club,
  id: 'RICH_POLISH_CLUB',
  name: 'Bogaty klub Ekstraklasy',
  leagueId: 'L_PL_1',
  tier: 1,
  reputation: 8,
  budget: 120_000_000,
  transferBudget: 24_000_000,
  boardStrictness: 7,
};
const richSquad = [
  makePlayer('RICH_1', 70, 900_000, PlayerPosition.DEF),
  makePlayer('RICH_2', 72, 1_300_000, PlayerPosition.MID),
  makePlayer('RICH_3', 74, 2_000_000, PlayerPosition.FWD),
];
const strongFreeAgent = makePlayer('STRONG_FA', 71, 0, PlayerPosition.GK);
const cracoviaScaleOffer = FinanceService.evaluateFASigningBoardDecision(
  strongFreeAgent,
  1_200_000,
  150_000,
  richSquad,
  richPolishClub,
);
assert.equal(cracoviaScaleOffer.approved, true, 'Bogaty klub powinien móc zapłacić 1,2 mln PLN zawodnikowi 71 OVR bez sztucznego limitu OVR.');

const elitePolishSquad = [
  ...richSquad,
  makePlayer('LEAGUE_STAR', 78, 4_500_000, PlayerPosition.FWD),
];
const eliteSalaryOffer = FinanceService.evaluateFASigningBoardDecision(
  makePlayer('ELITE_FA', 79, 0, PlayerPosition.MID),
  5_000_000,
  500_000,
  elitePolishSquad,
  { ...richPolishClub, budget: 220_000_000, transferBudget: 45_000_000 },
);
assert.equal(eliteSalaryOffer.approved, true, 'Silny finansowo polski klub powinien móc zatwierdzić kontrakt rzędu 5 mln PLN rocznie.');

const appealInput = {
  player: candidate,
  salary: 300_000,
  bonus: 40_000,
  years: 2,
  squad,
  club,
  managerProfile: null,
  managerContract: null,
  currentDate: new Date('2026-08-17T12:00:00.000Z'),
  action: 'SPORTING_ARGUMENT' as const,
};
const firstAppeal = FreeAgentBoardAppealService.evaluate(appealInput);
const repeatedAppeal = FreeAgentBoardAppealService.evaluate(appealInput);
assert.deepEqual(repeatedAppeal, firstAppeal, 'Ponowne otwarcie tej samej rozmowy nie może ponownie losować decyzji zarządu.');
assert.ok(firstAppeal.chance >= 4 && firstAppeal.chance <= 84, 'Odwołanie powinno zachować RNG bez gwarantowanej akceptacji.');

const commitment = FinanceService.calculateFreeAgentContractCommitment(120_000, 2, 40_000);
assert.equal(commitment, 280_000);
const currentSeasonCost = FinanceService.calculateFreeAgentCurrentSeasonCost(120_000, 40_000);
assert.equal(currentSeasonCost, 160_000, 'Bieżący budżet obejmuje tylko pierwszy rok pensji i bonus za podpis.');
assert.equal(FinanceService.calculateRemainingContractBudget(club.transferBudget, 120_000, 2, 40_000), 440_000);
assert.equal(
  FinanceService.calculateRemainingContractBudget(club.transferBudget, 120_000, 5, 40_000),
  440_000,
  'Długość umowy nie może obciążać bieżącego budżetu pensjami z przyszłych sezonów.',
);
assert.ok(
  FinanceService.calculateFreeAgentContractCommitment(120_000, 3, 40_000) > commitment,
  'Dłuższy kontrakt nadal ma większą pełną wartość dla zawodnika i agenta.',
);

console.log('FreeAgentBoardVetoTests: OK');
