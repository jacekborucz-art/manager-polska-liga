import assert from 'node:assert/strict';
import {
  Club,
  ManagerProfile,
  PlayerPosition,
  Region,
  SportingDirectorContractVetoState,
} from '../types';
import { SportingDirectorContractAppealService } from '../services/SportingDirectorContractAppealService';

const baseState: SportingDirectorContractVetoState = {
  contractMailId: 'CONTRACT_1',
  playerId: 'PLAYER_1',
  playerName: 'Jan Testowy',
  playerOverall: 66,
  playerAge: 25,
  position: PlayerPosition.MID,
  salary: 180_000,
  years: 3,
  bonus: 72_000,
  totalCommitment: 612_000,
  transferBudget: 2_000_000,
  budgetUsage: 0.306,
  wageBillBefore: 1_200_000,
  wageBillAfter: 1_380_000,
  averageSalary: 75_000,
  highestSalary: 150_000,
  salaryRatio: 2.4,
  positionFit: 9,
  resistance: 76,
  reasonCode: 'WAGE_STRUCTURE',
  reason: 'Pensja jest zbyt wysoka względem struktury płac w kadrze.',
  stage: 'EXPLANATION',
  seed: 88421,
  ultimatumAvailable: true,
};

const buildClub = (strongManagerEnvironment: boolean): Club => ({
  id: strongManagerEnvironment ? 'STRONG_CLUB' : 'WEAK_CLUB',
  name: 'Klub Testowy',
  shortName: 'KT',
  leagueId: 'L_PL_3',
  colorsHex: ['#ffffff'],
  stadiumName: 'Stadion',
  stadiumCapacity: 5_000,
  reputation: 6,
  isDefaultActive: true,
  rosterIds: [],
  stats: { points: 30, wins: 9, draws: 3, losses: 3, goalsFor: 28, goalsAgainst: 15, goalDifference: 13, played: 15, form: ['W'] },
  budget: 8_000_000,
  transferBudget: 2_000_000,
  reserveBudget: 1_000_000,
  boardStrictness: 5,
  signingBonusPool: 500_000,
  boardConfidence: strongManagerEnvironment ? 92 : 25,
  management: {
    owner: {
      id: 'OWNER', firstName: 'Jan', lastName: 'Właściciel', age: 54, nationality: Region.POLAND, nationalityCountry: 'Polska',
      cierpliwosc: strongManagerEnvironment ? 18 : 4,
      ambicja: strongManagerEnvironment ? 19 : 4,
      hojnosc: strongManagerEnvironment ? 17 : 3,
      doswiadczenie: strongManagerEnvironment ? 8 : 19,
      monthlySalary: 0,
    },
    cfo: { id: 'CFO', firstName: 'A', lastName: 'B', age: 45, nationality: Region.POLAND, nationalityCountry: 'Polska', hojnosc: 10, doswiadczenie: 10, zdolnosciMarketingowe: 10, dyscyplinaFinansowa: 10, monthlySalary: 0 },
    coo: { id: 'COO', firstName: 'A', lastName: 'C', age: 45, nationality: Region.POLAND, nationalityCountry: 'Polska', doswiadczenie: 10, organizacja: 10, zarzadzanieInfrastruktura: 10, efektywnoscKosztowa: 10, logistykaIPlanowanie: 10, monthlySalary: 0 },
    marketingDirector: { id: 'MD', firstName: 'A', lastName: 'D', age: 45, nationality: Region.POLAND, nationalityCountry: 'Polska', doswiadczenie: 10, zdolnosciMarketingowe: 10, monthlySalary: 0 },
  },
  sportingDirector: {
    id: 'DIRECTOR', firstName: 'Adam', lastName: 'Dyrektor', age: 48, nationality: Region.POLAND, nationalityCountry: 'Polska',
    patience: 10,
    control: strongManagerEnvironment ? 7 : 19,
    flexibility: strongManagerEnvironment ? 18 : 3,
    ambition: 14,
    footballKnowledge: 15,
    negotiation: 14,
    developmentVision: 12,
    financialDiscipline: strongManagerEnvironment ? 8 : 19,
    relationshipWithManager: strongManagerEnvironment ? 88 : 20,
    personality: strongManagerEnvironment ? 'PARTNER' : 'CONTROLLER',
  },
});

const strongManager: ManagerProfile = {
  firstName: 'Marek', lastName: 'Trener', age: 45, nationality: 'Polska', nationalityFlag: '🇵🇱',
  expPoints: 900, experience: 20, expHistory: [], careerHistory: [], achievements: [],
};

const weakManager: ManagerProfile = {
  ...strongManager,
  expPoints: 1,
  experience: 1,
};

const firstRound = SportingDirectorContractAppealService.applyAction({
  state: baseState,
  action: 'POSITION_NEED',
  club: buildClub(true),
  managerProfile: strongManager,
});
assert.equal(firstRound.state.stage, 'COUNTER_ARGUMENT', 'Pierwszy argument powinien przejść do kontrargumentu dyrektora.');
assert.ok(firstRound.state.directorResponse, 'Odpowiedź dyrektora powinna zostać zapisana w stanie sprawy.');

const repeatedFirstRound = SportingDirectorContractAppealService.applyAction({
  state: baseState,
  action: 'POSITION_NEED',
  club: buildClub(true),
  managerProfile: strongManager,
});
assert.deepEqual(firstRound, repeatedFirstRound, 'Ten sam zapis sprawy musi dawać identyczną odpowiedź i RNG.');

const strongAppeal = SportingDirectorContractAppealService.applyAction({
  state: firstRound.state,
  action: 'USE_DATA',
  club: buildClub(true),
  managerProfile: strongManager,
});

const weakFirstRound = SportingDirectorContractAppealService.applyAction({
  state: baseState,
  action: 'MANAGER_TRUST',
  club: buildClub(false),
  managerProfile: weakManager,
});
const weakAppeal = SportingDirectorContractAppealService.applyAction({
  state: weakFirstRound.state,
  action: 'TAKE_RESPONSIBILITY',
  club: buildClub(false),
  managerProfile: weakManager,
});
assert.ok(strongAppeal.chance > weakAppeal.chance, 'Dobra relacja, wyniki i dopasowany argument muszą zwiększać szansę rozmowy.');
assert.ok(strongAppeal.chance <= 80 && weakAppeal.chance >= 5, 'Szansa rozmowy musi pozostać w granicach 5–80%.');

const failedState: SportingDirectorContractVetoState = { ...baseState, stage: 'APPEAL_FAILED' };
const strongUltimatum = SportingDirectorContractAppealService.applyAction({
  state: failedState,
  action: 'ULTIMATUM',
  club: buildClub(true),
  managerProfile: strongManager,
});
const weakUltimatum = SportingDirectorContractAppealService.applyAction({
  state: failedState,
  action: 'ULTIMATUM',
  club: buildClub(false),
  managerProfile: weakManager,
});
assert.ok(strongUltimatum.chance > weakUltimatum.chance, 'Silna pozycja trenera i ambitny właściciel muszą poprawiać szansę ultimatum.');
assert.ok(strongUltimatum.chance <= 80 && weakUltimatum.chance >= 5, 'Ultimatum również musi pozostać w granicach 5–80%.');
assert.equal(strongUltimatum.state.stage, 'RESOLVED', 'Ultimatum musi nieodwracalnie rozstrzygnąć sprawę.');

console.log('SportingDirectorContractAppealTests: OK');
