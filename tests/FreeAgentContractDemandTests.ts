import assert from 'node:assert/strict';
import {
  Club,
  HealthStatus,
  Player,
  PlayerPosition,
  Region,
} from '../types';
import { FreeAgentNegotiationService } from '../services/FreeAgentNegotiationService';
import { FreeAgentContractPackageService } from '../services/FreeAgentContractPackageService';

const currentDate = new Date('2026-07-10T00:00:00.000Z');

const makeClub = (id: string, leagueId: string, tier: number, reputation: number): Club => ({
  id,
  name: id,
  shortName: id,
  leagueId,
  tier,
  reputation,
  country: 'Polska',
  colorsHex: ['#111827', '#ffffff'],
  stadiumName: 'Stadion',
  stadiumCapacity: 8_000,
  isDefaultActive: true,
  rosterIds: [],
  stats: { form: [] },
  budget: 20_000_000,
  transferBudget: 8_000_000,
  boardStrictness: 5,
  signingBonusPool: 2_000_000,
} as Club);

const makePlayer = (
  id: string,
  overallRating: number,
  annualSalary: number,
  position: PlayerPosition = PlayerPosition.MID,
  age = 27,
): Player => ({
  id,
  firstName: 'Test',
  lastName: id,
  age,
  clubId: annualSalary > 0 ? 'LEAGUE_CLUB' : 'FREE_AGENTS',
  nationality: Region.POLAND,
  nationalityCountry: 'Polska',
  position,
  overallRating,
  reputacja: Math.max(1, Math.min(20, Math.round((overallRating - 38) / 3))),
  attributes: {
    pace: overallRating, strength: overallRating, stamina: overallRating,
    finishing: position === PlayerPosition.FWD ? overallRating : 66,
    passing: position === PlayerPosition.GK || position === PlayerPosition.DEF ? 48 : 72,
    vision: position === PlayerPosition.GK || position === PlayerPosition.DEF ? 48 : 72,
    technique: overallRating, dribbling: overallRating, crossing: overallRating,
    defending: position === PlayerPosition.DEF ? overallRating : 45,
    positioning: overallRating, attacking: position === PlayerPosition.FWD ? overallRating : 66,
    mentality: overallRating, workRate: overallRating, aggression: 60, leadership: 60,
    goalkeeping: position === PlayerPosition.GK ? overallRating : 5,
    heading: overallRating, talent: overallRating, freeKicks: 60, penalties: 60, corners: 60,
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

const lowClub = makeClub('LOW', 'L_PL_3', 3, 4);
const highClub = makeClub('HIGH', 'L_PL_1', 1, 10);
const leaguePlayers: Player[] = [];
for (const position of Object.values(PlayerPosition)) {
  for (let index = 0; index < 16; index += 1) {
    const overall = 48 + (index % 7);
    leaguePlayers.push(makePlayer(`LOW_${position}_${index}`, overall, 55_000 + index * 5_000, position));
    leaguePlayers.push(makePlayer(`HIGH_${position}_${index}`, overall, 420_000 + index * 35_000, position));
  }
}

const getNormalDemand = (club: Club, position = PlayerPosition.MID, age = 27) => {
  for (let index = 0; index < 1_000; index += 1) {
    const player = makePlayer(`NORMAL_${position}_${age}_${index}`, 52, 0, position, age);
    const demands = FreeAgentNegotiationService.calculateContractDemands(player, club, [], leaguePlayers, currentDate);
    if (demands.rngBand === 'NORMAL') return { player, demands };
  }
  throw new Error('Nie znaleziono normalnego wariantu RNG.');
};

const lowNormal = getNormalDemand(lowClub);
const repeatedLowNormal = FreeAgentNegotiationService.calculateContractDemands(
  lowNormal.player,
  lowClub,
  [],
  leaguePlayers,
  currentDate,
);
assert.deepEqual(repeatedLowNormal, lowNormal.demands, 'Żądania muszą być deterministyczne.');
assert.ok(lowNormal.demands.salary < 400_000, 'Słaby zawodnik niższej ligi nie powinien standardowo żądać kwoty z kosmosu.');

const normalLowSalaries: number[] = [];
const normalHighSalaries: number[] = [];
for (let index = 0; index < 100; index += 1) {
  const player = makePlayer(`LEAGUE_LEVEL_${index}`, 52, 0);
  const lowDemand = FreeAgentNegotiationService.calculateContractDemands(player, lowClub, [], leaguePlayers.filter(p => p.id.startsWith('LOW_')), currentDate);
  const highDemand = FreeAgentNegotiationService.calculateContractDemands(player, highClub, [], leaguePlayers.filter(p => p.id.startsWith('HIGH_')), currentDate);
  if (lowDemand.rngBand === 'NORMAL') normalLowSalaries.push(lowDemand.salary);
  if (highDemand.rngBand === 'NORMAL') normalHighSalaries.push(highDemand.salary);
}
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
assert.ok(average(normalHighSalaries) > average(normalLowSalaries) * 2.5, 'Poziom ligi musi wyraźnie wpływać na żądania.');

const getNormalSalaryProfile = (
  label: string,
  overallRating: number,
  age: number,
  nationality: Region,
  nationalityCountry: string,
) => {
  const salaries: number[] = [];
  for (let index = 0; index < 1_200; index += 1) {
    const player = {
      ...makePlayer(`${label}_${index}`, overallRating, 0, PlayerPosition.MID, age),
      nationality,
      nationalityCountry,
    };
    const demands = FreeAgentNegotiationService.calculateContractDemands(
      player,
      highClub,
      [],
      leaguePlayers,
      currentDate,
    );
    if (demands.rngBand === 'NORMAL') salaries.push(demands.salary);
  }

  const mean = average(salaries);
  return {
    mean,
    relativeRange: (Math.max(...salaries) - Math.min(...salaries)) / mean,
  };
};

const primeDomesticProfile = getNormalSalaryProfile('PROFILE_PRIME_PL', 68, 27, Region.POLAND, 'Polska');
const youngDomesticProfile = getNormalSalaryProfile('PROFILE_YOUNG_PL', 68, 19, Region.POLAND, 'Polska');
const eliteDomesticProfile = getNormalSalaryProfile('PROFILE_ELITE_PL', 84, 27, Region.POLAND, 'Polska');
const distantForeignProfile = getNormalSalaryProfile('PROFILE_FOREIGN_BR', 68, 27, Region.BRAZIL, 'Brazylia');

assert.ok(
  youngDomesticProfile.relativeRange > primeDomesticProfile.relativeRange * 1.20,
  'Młodzi zawodnicy powinni mieć bardziej zróżnicowane oczekiwania niż gracze w wieku optymalnym.',
);
assert.ok(
  eliteDomesticProfile.relativeRange > primeDomesticProfile.relativeRange * 1.15,
  'Overall powinien wpływać na rozpiętość negocjacyjnego RNG.',
);
assert.ok(
  distantForeignProfile.relativeRange > primeDomesticProfile.relativeRange * 1.25,
  'Kraj pochodzenia powinien wpływać na rozpiętość negocjacyjnego RNG.',
);
assert.ok(
  distantForeignProfile.mean > primeDomesticProfile.mean * 1.03,
  'Daleki transfer zagraniczny powinien przeciętnie zawierać premię relokacyjną.',
);

const prime = getNormalDemand(lowClub, PlayerPosition.MID, 27);
const veteranPlayer = { ...prime.player, age: 37 };
const veteranDemands = FreeAgentNegotiationService.calculateContractDemands(veteranPlayer, lowClub, [], leaguePlayers, currentDate);
assert.ok(prime.demands.salary > veteranDemands.salary, 'Wiek powinien obniżać normalną pensję starszego zawodnika.');
assert.ok(veteranDemands.years <= 2, 'Weteran nie powinien standardowo oczekiwać długiego kontraktu.');

const goalkeeper = getNormalDemand(lowClub, PlayerPosition.GK);
assert.ok(goalkeeper.demands.cleanSheetBonus, 'Bramkarz powinien móc oczekiwać bonusu za czyste konto.');
assert.equal(goalkeeper.demands.goalBonus, undefined);
assert.equal(goalkeeper.demands.assistBonus, undefined);

const defender = getNormalDemand(lowClub, PlayerPosition.DEF);
assert.equal(defender.demands.goalBonus, undefined);
assert.equal(defender.demands.assistBonus, undefined);
assert.equal(defender.demands.cleanSheetBonus, undefined);

const midfielder = getNormalDemand(lowClub, PlayerPosition.MID);
assert.ok(midfielder.demands.goalBonus);
assert.ok(midfielder.demands.assistBonus);

const forward = getNormalDemand(lowClub, PlayerPosition.FWD);
assert.ok(forward.demands.goalBonus);
assert.ok(forward.demands.assistBonus);

const exactOffer = FreeAgentNegotiationService.evaluateOfferAgainstDemands(
  forward.player,
  forward.demands,
  forward.demands,
  { decisionRoll: 0.01 },
);
assert.equal(exactOffer.accepted, true, 'Oferta zgodna z żądaniami powinna zostać przyjęta.');

const expectedGuaranteedTotal = forward.demands.salary * forward.demands.years + forward.demands.bonus;
const annualRaise = Math.min(10_000, Math.floor(forward.demands.bonus / Math.max(1, forward.demands.years)));
const redistributedOffer = {
  ...forward.demands,
  salary: forward.demands.salary + annualRaise,
  bonus: forward.demands.bonus - annualRaise * forward.demands.years,
};
assert.equal(
  redistributedOffer.salary * redistributedOffer.years + redistributedOffer.bonus,
  expectedGuaranteedTotal,
  'Podwyżka pensji musi analogicznie obniżyć bonus i zachować wartość gwarantowaną.',
);
assert.equal(
  FreeAgentNegotiationService.evaluateOfferAgainstDemands(
    forward.player,
    redistributedOffer,
    forward.demands,
    { decisionRoll: 0.01 },
  ).accepted,
  true,
  'Agent powinien traktować równowartościową zmianę pensja/bonus jako ten sam pakiet.',
);

const uiAllocation = FreeAgentContractPackageService.allocateSalary(
  470_000,
  220_000,
  { years: 2, maxAnnualSalary: 300_000, maxSigningBonus: 200_000 },
);
assert.deepEqual(
  uiAllocation,
  { annualSalary: 220_000, signingBonus: 30_000, guaranteedTotal: 470_000 },
  'Dwuletni pakiet 470k po podwyżce pensji do 220k powinien obniżyć bonus do 30k.',
);
const reversedAllocation = FreeAgentContractPackageService.allocateBonus(
  uiAllocation.guaranteedTotal,
  70_000,
  { years: 2, maxAnnualSalary: 300_000, maxSigningBonus: 200_000 },
);
assert.deepEqual(
  reversedAllocation,
  { annualSalary: 200_000, signingBonus: 70_000, guaranteedTotal: 470_000 },
  'Podniesienie bonusu z 30k do 70k powinno obniżyć pensję roczną o 20k.',
);

const insultingOffer = FreeAgentNegotiationService.evaluateOfferAgainstDemands(
  forward.player,
  { ...forward.demands, salary: Math.round(forward.demands.salary * 0.4), bonus: 0, goalBonus: 0, assistBonus: 0 },
  forward.demands,
  { decisionRoll: 0.01 },
);
assert.equal(insultingOffer.accepted, false);
assert.equal(insultingOffer.demands, null, 'Obraźliwa oferta powinna zakończyć rozmowy bez kontroferty.');

const exactOfferRejectedByRng = FreeAgentNegotiationService.evaluateOfferAgainstDemands(
  forward.player,
  forward.demands,
  forward.demands,
  { decisionRoll: 0.999 },
);
assert.equal(exactOfferRejectedByRng.accepted, false, 'Nawet pełna oferta powinna zachować małe ryzyko odmowy RNG.');
assert.ok(
  exactOfferRejectedByRng.acceptanceChance >= 0.85 && exactOfferRejectedByRng.acceptanceChance <= 0.99,
  `Pełna oferta powinna mieć wysoką, ale nie stuprocentową szansę: ${exactOfferRejectedByRng.acceptanceChance}`,
);

const repeatedRngDecision = FreeAgentNegotiationService.evaluateOfferAgainstDemands(
  forward.player,
  forward.demands,
  forward.demands,
  { decisionRoll: 0.999 },
);
assert.deepEqual(
  repeatedRngDecision,
  exactOfferRejectedByRng,
  'Ta sama oferta i zapisany roll muszą zawsze zwracać ten sam wynik.',
);

const loyalDecision = FreeAgentNegotiationService.evaluateOfferAgainstDemands(
  { ...forward.player, moralePersonality: 'LOYAL' },
  forward.demands,
  forward.demands,
  { club: lowClub, decisionRoll: 0.999 },
);
const egoistDecision = FreeAgentNegotiationService.evaluateOfferAgainstDemands(
  { ...forward.player, moralePersonality: 'EGOIST' },
  forward.demands,
  forward.demands,
  { club: lowClub, decisionRoll: 0.999 },
);
assert.ok(
  loyalDecision.acceptanceChance > egoistDecision.acceptanceChance,
  'Osobowość zawodnika musi modyfikować końcową szansę przy tej samej ofercie.',
);

const strongClubDecision = FreeAgentNegotiationService.evaluateOfferAgainstDemands(
  forward.player,
  forward.demands,
  forward.demands,
  { club: highClub, decisionRoll: 0.999 },
);
const weakClubDecision = FreeAgentNegotiationService.evaluateOfferAgainstDemands(
  forward.player,
  forward.demands,
  forward.demands,
  { club: lowClub, decisionRoll: 0.999 },
);
assert.ok(
  strongClubDecision.acceptanceChance > weakClubDecision.acceptanceChance,
  'Reputacja klubu musi wpływać na końcowe RNG przy identycznych warunkach.',
);

const bandCounts = { NORMAL: 0, TOUGH: 0, VERY_HIGH: 0, EXTREME: 0 };
for (let index = 0; index < 10_000; index += 1) {
  const player = makePlayer(`RNG_DISTRIBUTION_${index}`, 52, 0);
  const demands = FreeAgentNegotiationService.calculateContractDemands(player, lowClub, [], leaguePlayers, currentDate);
  bandCounts[demands.rngBand] += 1;
}
assert.ok(bandCounts.NORMAL >= 9_450 && bandCounts.NORMAL <= 9_750, `Nieprawidłowy udział normalnych ofert: ${bandCounts.NORMAL}`);
assert.ok(bandCounts.EXTREME >= 1 && bandCounts.EXTREME <= 25, `Skrajne żądania powinny być bardzo rzadkie: ${bandCounts.EXTREME}`);

console.log('FreeAgentContractDemandTests: OK', bandCounts);
