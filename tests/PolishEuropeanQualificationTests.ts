import { strict as assert } from 'node:assert';
import { PolishEuropeanQualificationService } from '../services/PolishEuropeanQualificationService';
import { CLDrawService } from '../services/CLDrawService';
import { CONFDrawService } from '../LECupEngine/CONFDrawService';

const table = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH'];

const initial2026 = PolishEuropeanQualificationService.getInitialQualification(2026);
assert.deepEqual(initial2026, {
  championsLeagueR2TeamId: 'PL_LECH_POZNAN',
  championsLeagueR1TeamId: 'PL_GORNIK_ZABRZE',
  europaLeagueR2TeamId: 'PL_JAGIELLONIA_BIALYSTOK',
  conferenceLeagueR1TeamIds: ['PL_RAKOW_CZESTOCHOWA', 'PL_GKS_KATOWICE'],
  conferenceLeagueR2TeamIds: [],
});

const initial2025 = PolishEuropeanQualificationService.getInitialQualification(2025);
assert.deepEqual(initial2025.conferenceLeagueR1TeamIds, []);
assert.deepEqual(initial2025.conferenceLeagueR2TeamIds, ['PL_JAGIELLONIA_BIALYSTOK', 'PL_POGON_SZCZECIN']);

const cupWinnerFourth = PolishEuropeanQualificationService.resolve({
  leagueTableIds: table,
  cupWinnerId: 'FOURTH',
  cupRunnerUpId: 'SIXTH',
});
assert.equal(cupWinnerFourth.championsLeagueR2TeamId, 'FIRST');
assert.equal(cupWinnerFourth.championsLeagueR1TeamId, 'SECOND');
assert.equal(cupWinnerFourth.europaLeagueR2TeamId, 'FOURTH');
assert.deepEqual(cupWinnerFourth.conferenceLeagueR2TeamIds, ['THIRD', 'FIFTH']);

const cupWinnerThird = PolishEuropeanQualificationService.resolve({
  leagueTableIds: table,
  cupWinnerId: 'THIRD',
  cupRunnerUpId: 'SIXTH',
});
assert.deepEqual(cupWinnerThird.conferenceLeagueR2TeamIds, ['FOURTH', 'FIFTH']);

const cupWinnerSecond = PolishEuropeanQualificationService.resolve({
  leagueTableIds: table,
  cupWinnerId: 'SECOND',
  cupRunnerUpId: 'SIXTH',
});
assert.equal(cupWinnerSecond.europaLeagueR2TeamId, 'SIXTH');
assert.deepEqual(cupWinnerSecond.conferenceLeagueR2TeamIds, ['THIRD', 'FOURTH']);

const cupFinalBetweenChampionsLeagueTeams = PolishEuropeanQualificationService.resolve({
  leagueTableIds: table,
  cupWinnerId: 'FIRST',
  cupRunnerUpId: 'SECOND',
});
assert.equal(cupFinalBetweenChampionsLeagueTeams.europaLeagueR2TeamId, 'THIRD');
assert.deepEqual(cupFinalBetweenChampionsLeagueTeams.conferenceLeagueR2TeamIds, ['FOURTH', 'FIFTH']);

const allQualifiedIds = [
  cupWinnerFourth.championsLeagueR2TeamId,
  cupWinnerFourth.championsLeagueR1TeamId,
  cupWinnerFourth.europaLeagueR2TeamId,
  ...cupWinnerFourth.conferenceLeagueR2TeamIds,
];
assert.equal(new Set(allQualifiedIds).size, 5);

const rawChampionsLeagueClubs = Array.from({ length: 40 }, (_, index) => ({
  name: `Foreign Club ${index + 1}`,
  country: 'ENG',
  tier: index < 20 ? 4 : 3,
  colors: ['#000000', '#ffffff'],
  stadium: `Stadium ${index + 1}`,
  capacity: 20_000,
  reputation: 10,
}));
const championsLeagueR1Pool = CLDrawService.getEligibleTeams(rawChampionsLeagueClubs, 'PL_SECOND');
assert.equal(championsLeagueR1Pool.length, 36);
assert.equal(championsLeagueR1Pool.filter(teamId => teamId === 'PL_SECOND').length, 1);
assert.equal(championsLeagueR1Pool.filter(teamId => teamId !== 'PL_SECOND').length, 35);

const conferenceCountries = ['ENG', 'ESP', 'ITA', 'GER', 'FRA', 'NED', 'BEL'];
const rawConferenceLeagueClubs = Array.from({ length: 70 }, (_, index) => ({
  name: `Conference Club ${index + 1}`,
  country: conferenceCountries[index % conferenceCountries.length],
  tier: 4,
  colors: ['#000000', '#ffffff'],
  stadium: `Conference Stadium ${index + 1}`,
  capacity: 15_000,
  reputation: 6,
}));
const conferenceR1Pool = CONFDrawService.getEligibleTeams(
  rawConferenceLeagueClubs,
  2026,
  64,
  initial2026.conferenceLeagueR1TeamIds,
);
assert.equal(conferenceR1Pool.length, 64);
assert.equal(conferenceR1Pool.filter(teamId => teamId.startsWith('PL_')).length, 2);
const conferenceR1Pairs = CONFDrawService.drawPairs(
  conferenceR1Pool,
  rawConferenceLeagueClubs,
  [],
  new Date(2026, 6, 1),
  2026,
);
assert.equal(conferenceR1Pairs.length, 32);
assert.equal(
  conferenceR1Pairs.some(pair => pair.homeTeamId.startsWith('PL_') && pair.awayTeamId.startsWith('PL_')),
  false,
);

console.log('PolishEuropeanQualificationTests: OK');
