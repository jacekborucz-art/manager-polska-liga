import { strict as assert } from 'node:assert';
import { PolishEuropeanQualificationService } from '../services/PolishEuropeanQualificationService';
import { CLDrawService } from '../services/CLDrawService';

const table = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH'];

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

console.log('PolishEuropeanQualificationTests: OK');
