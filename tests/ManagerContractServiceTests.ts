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
  const wealthyLegia = { ...legia, budget: 217_000_000, transferBudget: 70_000_000 };
  const rookieProfile = { expPoints: 1, expHistory: [], careerHistory: [], achievements: [] } as any;
  const decoratedProfile = {
    expPoints: 500,
    expHistory: [],
    careerHistory: [{}, {}, {}],
    achievements: [
      { id: 'mp-1', seasonLabel: '2026/27', title: 'Mistrz Polski 2026/27', competition: 'Ekstraklasa' },
      { id: 'mp-2', seasonLabel: '2027/28', title: 'Mistrz Polski 2027/28', competition: 'Ekstraklasa' },
      { id: 'mp-3', seasonLabel: '2028/29', title: 'Mistrz Polski 2028/29', competition: 'Ekstraklasa' },
    ],
  } as any;
  const legiaRookieSalary = ManagerContractService.calculateBaseSalary(legia, rookieProfile);
  const legiaDecoratedSalary = ManagerContractService.calculateBaseSalary(legia, decoratedProfile);
  assert.equal(ManagerContractService.calculateClubManagerSalaryBenchmark(legia), 5_000_000, 'typowa stawka referencyjna Legii powinna wynosić 5 mln PLN');
  assert.equal(
    ManagerContractService.calculateManagerNegotiationSalaryCeiling(wealthyLegia, rookieProfile),
    5_000_000,
    'początkujący trener nie powinien automatycznie otrzymywać dostępu do wyższych stawek bogatego klubu'
  );
  assert.ok(
    ManagerContractService.calculateManagerNegotiationSalaryCeiling(wealthyLegia, decoratedProfile) > 5_000_000,
    'dynamiczny pułap negocjacji powinien przekraczać 5 mln dla utytułowanego trenera w bogatym klubie'
  );
  assert.equal(legiaRookieSalary, 2_500_000, 'początkujący trener Legii powinien otrzymać wyraźnie niższą ofertę startową');
  assert.equal(legiaDecoratedSalary, 4_500_000, 'trzykrotny mistrz Polski powinien otrzymać ofertę zbliżoną do klubowego maksimum');
  const lowExpLeverage = ManagerContractService.getManagerSalaryLeverage(legia, { expPoints: 1 } as any);
  const highExpLeverage = ManagerContractService.getManagerSalaryLeverage(legia, decoratedProfile);
  assert.equal(lowExpLeverage.offerMultiplier, 0.5, 'początkujący trener powinien zaczynać od połowy klubowego pułapu');
  assert.ok(highExpLeverage.offerMultiplier > lowExpLeverage.offerMultiplier, 'duże doświadczenie i sukcesy powinny podnosić ofertę bazową');
  assert.equal(highExpLeverage.polishChampionships, 3, 'model powinien rozpoznawać zdobyte mistrzostwa Polski');
  assert.ok(
    highExpLeverage.maxNegotiatedPremium > lowExpLeverage.maxNegotiatedPremium,
    'doświadczony trener powinien móc negocjować większą podwyżkę'
  );
  const discountedTerms = ManagerContractService.createTerms(legia, clubs, { expPoints: 1 } as any, start);
  assert.equal(discountedTerms.salaryReviewAfterOneSeason, true, 'niższa stawka powinna zawierać możliwość przeglądu po sezonie');

  Math.random = () => 0.999999;
  const rookieLegiaNegotiation = ManagerContractService.createNegotiation(legia, clubs, rookieProfile, start, 'CAREER_START');
  const rookieHighDemandCounter = ManagerContractService.negotiate(
    rookieLegiaNegotiation,
    legia,
    clubs,
    rookieProfile,
    rookieLegiaNegotiation.clubTerms.target.id,
    2,
    5_000_000
  );
  assert.equal(rookieHighDemandCounter.status, 'NEGOTIATING', 'bardzo wysoka prośba początkującego trenera powinna wywołać kontrofertę');
  assert.equal(rookieHighDemandCounter.lastResponseType, 'VETO');
  const rookieHighDemandRejected = ManagerContractService.negotiate(
    rookieHighDemandCounter,
    legia,
    clubs,
    rookieProfile,
    rookieHighDemandCounter.clubTerms.target.id,
    2,
    5_000_000
  );
  assert.equal(rookieHighDemandRejected.status, 'NEGOTIATING', 'przy niekorzystnym RNG wyjątkowo wysoka stawka nie powinna zostać zaakceptowana');

  Math.random = () => 0;
  const rookieExceptionalAgreement = ManagerContractService.negotiate(
    rookieHighDemandCounter,
    legia,
    clubs,
    rookieProfile,
    rookieHighDemandCounter.clubTerms.target.id,
    2,
    5_000_000
  );
  assert.equal(rookieExceptionalAgreement.status, 'AGREED', 'minimalna szansa RNG powinna pozwalać na wyjątkową zgodę zarządu');
  const aboveClubLimit = ManagerContractService.negotiate(
    rookieHighDemandCounter,
    legia,
    clubs,
    rookieProfile,
    rookieHighDemandCounter.clubTerms.target.id,
    2,
    5_100_000
  );
  assert.notEqual(aboveClubLimit.status, 'AGREED', 'początkujący trener nie powinien przekroczyć aktualnego pułapu uzasadnionego swoim dorobkiem');

  const decoratedWealthyNegotiation = ManagerContractService.createNegotiation(wealthyLegia, clubs, decoratedProfile, start, 'JOB_MARKET');
  const decoratedDynamicCeiling = ManagerContractService.calculateManagerNegotiationSalaryCeiling(wealthyLegia, decoratedProfile);
  assert.ok(decoratedDynamicCeiling > 5_000_000);
  Math.random = () => 0;
  const decoratedOpeningCounter = ManagerContractService.negotiate(
    decoratedWealthyNegotiation,
    wealthyLegia,
    clubs,
    decoratedProfile,
    decoratedWealthyNegotiation.clubTerms.target.id,
    2,
    decoratedDynamicCeiling
  );
  const decoratedExceptionalAgreement = ManagerContractService.negotiate(
    decoratedOpeningCounter,
    wealthyLegia,
    clubs,
    decoratedProfile,
    decoratedOpeningCounter.clubTerms.target.id,
    2,
    decoratedDynamicCeiling
  );
  assert.equal(decoratedExceptionalAgreement.status, 'AGREED', 'bogaty klub powinien móc wyjątkowo zaakceptować stawkę powyżej 5 mln dla utytułowanego trenera');

  Math.random = () => 0;
  const eliteNegotiation = ManagerContractService.createNegotiation(legia, clubs, null, start, 'CAREER_START');
  const eliteVeto = ManagerContractService.negotiate(eliteNegotiation, legia, clubs, null, conservative.id, 2);
  assert.equal(eliteVeto.status, 'NEGOTIATING', 'veto nie powinno natychmiast kończyć negocjacji');
  assert.equal(eliteVeto.lastResponseType, 'VETO', 'elity klub powinien zawetować cel utrzymania');
  assert.equal(eliteVeto.clubTerms.target.type, 'CHAMPION', 'po veto elitarny klub powinien podtrzymać cel mistrzowski');
  assert.match(eliteVeto.message, /najniższy cel/i, 'zarząd powinien wyjaśnić granicę negocjacji');

  const salaryOpeningCounter = ManagerContractService.negotiate(
    shortest,
    club,
    clubs,
    null,
    shortest.clubTerms.target.id,
    shortest.clubTerms.durationYears,
    shortest.clubTerms.annualSalary + 100_000
  );
  assert.equal(salaryOpeningCounter.status, 'NEGOTIATING', 'podwyższenie pensji powinno najpierw wywołać kontrofertę');
  assert.equal(salaryOpeningCounter.lastResponseType, 'COUNTER');
  const requestedNegotiatedSalary = salaryOpeningCounter.clubTerms.annualSalary + 100_000;
  const salaryAgreement = ManagerContractService.negotiate(
    salaryOpeningCounter,
    club,
    clubs,
    null,
    salaryOpeningCounter.clubTerms.target.id,
    salaryOpeningCounter.clubTerms.durationYears,
    requestedNegotiatedSalary
  );
  assert.equal(salaryAgreement.status, 'AGREED');
  assert.equal(salaryAgreement.agreedTerms?.annualSalary, requestedNegotiatedSalary);
  assert.equal(requestedNegotiatedSalary % ManagerContractService.MANAGER_SALARY_NEGOTIATION_STEP, 0);

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

  const renegotiationTooEarly = ManagerContractService.getManagerContractRenegotiationEligibility(
    migrated,
    new Date('2027-06-30T11:59:59.000Z')
  );
  assert.equal(renegotiationTooEarly.eligible, false, 'renegocjacja nie może ruszyć przed pełnym rokiem pracy');
  const renegotiationAvailable = ManagerContractService.getManagerContractRenegotiationEligibility(
    migrated,
    new Date('2027-07-01T12:00:00.000Z')
  );
  assert.equal(renegotiationAvailable.eligible, true, 'po pełnym roku pracy renegocjacja powinna być dostępna');
  const recentlyRequested = {
    ...migrated,
    lastRenegotiationRequestAt: '2027-07-01T12:00:00.000Z',
  };
  assert.equal(
    ManagerContractService.getManagerContractRenegotiationEligibility(recentlyRequested, new Date('2027-08-01T12:00:00.000Z')).eligible,
    false,
    'po złożeniu wniosku kolejna próba powinna być zablokowana na 90 dni'
  );
  const renegotiation = ManagerContractService.createNegotiation(club, clubs, { expPoints: 20 } as any, new Date('2027-07-02T12:00:00.000Z'), 'RENEGOTIATION');
  assert.equal(renegotiation.source, 'RENEGOTIATION');
  assert.match(renegotiation.message, /renegocjację/i);

  assert.equal(
    ManagerContractService.shouldDismissManagerAfterRelegation(0.049),
    false,
    'po spadku trener powinien mieć jedynie 5% szans na zachowanie pracy'
  );
  assert.equal(ManagerContractService.shouldDismissManagerAfterRelegation(0.05), true);
  assert.equal(ManagerContractService.shouldDismissManagerAfterRelegation(0.99), true);

  console.log('Manager contract service tests: OK');
} finally {
  Math.random = originalRandom;
}
