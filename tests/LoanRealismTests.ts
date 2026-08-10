import { strict as assert } from 'node:assert';
import { Club } from '../types';
import { IncomingTransferService } from '../services/IncomingTransferService';

const club = (overrides: Partial<Club>): Club => ({
  id: 'CLUB',
  name: 'Klub',
  shortName: 'KLU',
  leagueId: 'L_PL_1',
  tier: 1,
  colorsHex: ['#000000', '#ffffff'],
  stadiumName: 'Stadion',
  stadiumCapacity: 10_000,
  reputation: 10,
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

const realMadrid = club({
  id: 'CL_REAL_MADRYT',
  name: 'Real Madryt',
  leagueId: 'L_CL',
  country: 'ESP',
  reputation: 20,
});
const firstLeagueClub = club({
  id: 'PL_FIRST_LEAGUE',
  name: 'Klub 1 Ligi',
  leagueId: 'L_PL_2',
  tier: 2,
  reputation: 9,
});

assert.equal(
  IncomingTransferService.getEliteEuropeanToPolishLoanChance(
    firstLeagueClub,
    realMadrid
  ),
  0.000001,
  'klub 1 Ligi może wypożyczyć zawodnika z europejskiej elity najwyżej raz na milion prób'
);
assert.equal(
  IncomingTransferService.getEliteEuropeanToPolishLoanChance(
    club({ leagueId: 'L_PL_3', tier: 3, reputation: 6 }),
    realMadrid
  ),
  0.000001,
  'klub 2 Ligi musi mieć ograniczenie jeden na milion'
);
assert.equal(
  IncomingTransferService.getEliteEuropeanToPolishLoanChance(
    club({ leagueId: 'L_PL_1', reputation: 14 }),
    realMadrid
  ),
  0.0001,
  'Ekstraklasa poniżej reputacji 15 musi mieć bardzo małą szansę'
);
assert.equal(
  IncomingTransferService.getEliteEuropeanToPolishLoanChance(
    club({ leagueId: 'L_PL_1', reputation: 15 }),
    realMadrid
  ),
  null,
  'polski klub z reputacją 15 może korzystać ze standardowej logiki wypożyczeń'
);
assert.equal(
  IncomingTransferService.getLoanBuyerCategory(
    club({ leagueId: 'L_PL_1', reputation: 15 }),
    realMadrid
  ),
  'FOREIGN_LOWER_REP',
  'próg reputacji 15 musi faktycznie otwierać ścieżkę oferty mimo dużej różnicy reputacji'
);
assert.equal(
  IncomingTransferService.getEliteEuropeanToPolishLoanChance(
    club({ leagueId: 'L_PL_2', reputation: 9 }),
    club({ id: 'CLUB_BRNO', leagueId: 'L_CONF', country: 'CZE', reputation: 12 })
  ),
  null,
  'ograniczenie nie może blokować zwykłych wypożyczeń z klubów spoza europejskiej elity'
);

assert.equal(
  IncomingTransferService.getPolishLowerLeagueLoanSource(
    firstLeagueClub,
    club({ id: 'PL_EKSTRA', leagueId: 'L_PL_1', tier: 1, reputation: 13 })
  ),
  'POLISH_HIGHER_LEAGUE',
  'klub niższej ligi musi móc wypożyczać z wyższej ligi polskiej'
);
assert.equal(
  IncomingTransferService.getPolishLowerLeagueLoanSource(
    firstLeagueClub,
    club({ id: 'EU_LOW', leagueId: 'L_CONF', country: 'CZE', reputation: 10 })
  ),
  'FOREIGN_EUROPE_REP_10_MAX',
  'zagraniczny klub europejski z reputacją 10 musi należeć do puli 15%'
);
assert.equal(
  IncomingTransferService.getPolishLowerLeagueLoanSource(
    firstLeagueClub,
    club({ id: 'EU_TOO_STRONG', leagueId: 'L_CONF', country: 'CZE', reputation: 11 })
  ),
  'INELIGIBLE',
  'zagraniczny klub z reputacją 11-14 nie może wypożyczać do polskiej niższej ligi'
);
assert.equal(
  IncomingTransferService.getPolishLowerLeagueLoanSource(firstLeagueClub, realMadrid),
  'ELITE_ONE_IN_MILLION',
  'europejska elita zachowuje wyłącznie wcześniejszy wyjątek jeden na milion'
);

let polishSourceDraws = 0;
let foreignSourceDraws = 0;
const polishSeller = club({ id: 'PL_EKSTRA_DRAW', leagueId: 'L_PL_1', tier: 1, reputation: 13 });
const foreignSeller = club({ id: 'EU_LOW_DRAW', leagueId: 'L_CONF', country: 'CZE', reputation: 10 });
for (let day = 1; day <= 10_000; day++) {
  const date = new Date(2050, 0, 1);
  date.setDate(day);
  if (IncomingTransferService.matchesPolishLowerLeagueLoanSourceDraw(firstLeagueClub, polishSeller, date)) {
    polishSourceDraws += 1;
  }
  if (IncomingTransferService.matchesPolishLowerLeagueLoanSourceDraw(firstLeagueClub, foreignSeller, date)) {
    foreignSourceDraws += 1;
  }
}
const polishShare = polishSourceDraws / (polishSourceDraws + foreignSourceDraws);
assert.ok(polishShare > 0.84 && polishShare < 0.86, `udział polskiej puli powinien wynosić około 85%, otrzymano ${polishShare}`);

const deterministicFirst = IncomingTransferService.passesLoanRealismGate(
  club({ leagueId: 'L_PL_3', reputation: 6 }),
  realMadrid,
  12345
);
const deterministicSecond = IncomingTransferService.passesLoanRealismGate(
  club({ leagueId: 'L_PL_3', reputation: 6 }),
  realMadrid,
  12345
);
assert.equal(deterministicFirst, deterministicSecond, 'ta sama oferta nie może ponownie losować RNG');

console.log('LoanRealismTests: OK');
