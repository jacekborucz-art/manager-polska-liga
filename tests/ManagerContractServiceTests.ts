import assert from 'node:assert/strict';
import { ManagerContractService } from '../services/ManagerContractService';
import { Club } from '../types';

const makeClub = (id: string, points = 0): Club => ({
  id,
  name: `Klub ${id}`,
  shortName: id,
  leagueId: 'L_PL_1',
  tier: 1,
  reputation: 7,
  budget: 10_000_000,
  transferBudget: 2_000_000,
  colorsHex: ['#0f5ca8', '#f4c430'],
  stats: { played: 10, wins: 3, draws: 3, losses: 4, goalsFor: 12, goalsAgainst: 14, goalDifference: -2, points },
  board: {
    hojnosc: 'wysoka',
    ambicja: 'wysoka',
    cierpliwosc: 'przecietna',
    chciwosc: 'niska',
    oczekiwania: 'wysoka',
    kompetencja: 'wysoka',
  },
} as Club);

const clubs = Array.from({ length: 18 }, (_, index) => makeClub(`C${index + 1}`, 40 - index));
const club = clubs[0];
const start = new Date('2026-07-01T12:00:00.000Z');
const originalRandom = Math.random;

try {
  Math.random = () => 0;
  const shortest = ManagerContractService.createNegotiation(club, clubs, null, start, 'CAREER_START');
  assert.equal(shortest.maxRounds, 4, 'ukryty limit negocjacji powinien zaczynać się od 4 tur');

  Math.random = () => 0.999999;
  const longest = ManagerContractService.createNegotiation(club, clubs, null, start, 'JOB_MARKET');
  assert.equal(longest.maxRounds, 7, 'ukryty limit negocjacji powinien kończyć się na 7 turach');

  const options = ManagerContractService.getAvailableTargets(club, clubs);
  const conservative = options.find(option => option.type === 'SURVIVAL')!;
  const champion = options.find(option => option.type === 'CHAMPION')!;
  const minimumTarget = ManagerContractService.getBoardMinimumTarget(club, clubs);
  assert.ok(minimumTarget.ambitionLevel > conservative.ambitionLevel, 'ambitny zarząd musi mieć minimalny akceptowalny cel');
  assert.ok(
    ManagerContractService.calculateSalaryForTarget(club, clubs, null, champion) >
      ManagerContractService.calculateSalaryForTarget(club, clubs, null, conservative),
    'wyższy deklarowany cel powinien podnosić stawkę kontraktu'
  );
  options.forEach(option => {
    const salary = ManagerContractService.calculateSalaryForTarget(club, clubs, null, option);
    assert.equal(salary % 500_000, 0, 'każda stawka musi być zaokrąglona do 500 tys. PLN');
  });

  const legia = { ...club, id: 'PL_LEGIA_WARSZAWA', name: 'Legia Warszawa', reputation: 10 };
  const legiaBaseSalary = ManagerContractService.calculateBaseSalary(legia, null);
  assert.equal(legiaBaseSalary, 4_500_000, 'bazowa pensja początkującego trenera Legii powinna wynosić 4,5 mln PLN rocznie');

  Math.random = () => 0;
  const eliteNegotiation = ManagerContractService.createNegotiation(legia, clubs, null, start, 'CAREER_START');
  const eliteVeto = ManagerContractService.negotiate(eliteNegotiation, legia, clubs, null, conservative.id, 2);
  assert.equal(eliteVeto.status, 'NEGOTIATING', 'veto nie powinno natychmiast kończyć negocjacji');
  assert.equal(eliteVeto.lastResponseType, 'VETO', 'elity klub powinien zawetować cel utrzymania');
  assert.equal(eliteVeto.clubTerms.target.type, 'CHAMPION', 'po veto elitarny klub powinien podtrzymać cel mistrzowski');
  assert.match(eliteVeto.message, /najniższy cel/i, 'zarząd powinien wyjaśnić granicę negocjacji');

  let rejected = { ...shortest, maxRounds: 4 };
  Math.random = () => 0.999999;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    rejected = ManagerContractService.negotiate(rejected, club, clubs, null, champion.id, 3);
  }
  assert.equal(rejected.status, 'FAILED', 'klub powinien zakończyć rozmowy najpóźniej po ukrytym limicie');

  Math.random = () => 0;
  const openingCounter = ManagerContractService.negotiate(shortest, club, clubs, null, champion.id, 2);
  assert.equal(openingCounter.status, 'NEGOTIATING', 'zmieniona propozycja gracza powinna najpierw wywołać kontrofertę klubu');
  assert.equal(openingCounter.lastResponseType, 'COUNTER');
  const accepted = ManagerContractService.negotiate(openingCounter, club, clubs, null, openingCounter.clubTerms.target.id, openingCounter.clubTerms.durationYears);
  assert.equal(accepted.status, 'AGREED');
  const signed = ManagerContractService.createSignedContract(accepted, start);
  assert.equal(signed?.terms.target.id, champion.id, 'podpisany kontrakt musi zachować dokładnie uzgodniony cel');
  assert.equal(signed?.terms.annualSalary, accepted.agreedTerms?.annualSalary);

  const legacySeasonStart = new Date('2026-07-01T12:00:00.000Z');
  const migrated = ManagerContractService.createLegacyContract(club, clubs, null, legacySeasonStart);
  const migratedAgain = ManagerContractService.createLegacyContract(club, clubs, null, legacySeasonStart);
  assert.equal(migrated.terms.startDate, legacySeasonStart.toISOString());
  assert.equal(new Date(migrated.terms.endDate).getFullYear(), 2028);
  assert.ok(migrated.terms.target.id, 'migracja starego zapisu musi uzupełnić cel kontraktowy');
  assert.ok(migrated.terms.annualSalary > 0, 'migracja starego zapisu musi uzupełnić wynagrodzenie');
  assert.equal(migrated.terms.salaryModelVersion, ManagerContractService.SALARY_MODEL_VERSION);
  assert.equal(migrated.standardRenewalMonths, migratedAgain.standardRenewalMonths, 'migracja powinna być deterministyczna');

  console.log('Manager contract service tests: OK');
} finally {
  Math.random = originalRandom;
}
