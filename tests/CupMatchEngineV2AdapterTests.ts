import assert from 'node:assert/strict';
import { CompetitionType, MatchStatus, type Club, type MatchContext } from '../types';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import { CupMatchInputAdapter, CupShadowSimulationService } from '../services/match/adapters/cupV2';

const makeClub = (
  id: string,
  name: string,
  reputation: number,
  stadiumCapacity: number,
  morale: number,
): Club => ({
  id,
  name,
  shortName: name.split(' ')[0],
  leagueId: 'POLISH_CUP_TEST',
  tier: 1,
  colorsHex: ['#111827', '#f8fafc'],
  stadiumName: `${name} Arena`,
  stadiumCapacity,
  reputation,
  country: 'POL',
  isDefaultActive: false,
  rosterIds: [],
  stats: {} as Club['stats'],
  budget: 0,
  transferBudget: 0,
  boardStrictness: 5,
  signingBonusPool: 0,
  morale,
}) as Club;

const sample = CupSampleMatchFactory.makeInput(3, 'LOWER_LEAGUE_HOME');

const ctx: MatchContext = {
  fixture: {
    id: 'PP_TEST_R64_ADAPTER',
    leagueId: CompetitionType.POLISH_CUP,
    homeTeamId: sample.home.clubId,
    awayTeamId: sample.away.clubId,
    date: new Date('2026-09-24T18:00:00'),
    status: MatchStatus.SCHEDULED,
    homeScore: null,
    awayScore: null,
    attendance: 6800,
  },
  homeClub: makeClub(sample.home.clubId, 'Olimpia Testowa', 48, 9000, 68),
  awayClub: makeClub(sample.away.clubId, 'Raków Testowy', 72, 18000, 58),
  homePlayers: sample.home.players,
  awayPlayers: sample.away.players,
  homeAdvantage: true,
  competition: CompetitionType.POLISH_CUP,
};

const adapted = CupMatchInputAdapter.fromMatchContext(ctx, {
  homeLineup: sample.home.lineup,
  awayLineup: sample.away.lineup,
  homeInstructions: sample.home.instructions,
  awayInstructions: sample.away.instructions,
  userSide: 'HOME',
  seedSuffix: 'adapter_test',
});

assert.equal(adapted.input.home.clubId, ctx.homeClub.id);
assert.equal(adapted.input.away.clubId, ctx.awayClub.id);
assert.equal(adapted.input.home.lineup.tacticId, sample.home.lineup.tacticId);
assert.equal(adapted.input.away.lineup.tacticId, sample.away.lineup.tacticId);
assert.equal(adapted.diagnostics.home.foundStartingPlayers, 11);
assert.equal(adapted.diagnostics.away.foundStartingPlayers, 11);
assert.equal(adapted.diagnostics.home.hasGoalkeeper, true);
assert.equal(adapted.diagnostics.away.hasGoalkeeper, true);
assert.equal(adapted.diagnostics.expectedFavorite, 'AWAY');
assert.ok(adapted.diagnostics.pitchQuality >= 48 && adapted.diagnostics.pitchQuality <= 96);
assert.ok(adapted.input.environment.referee.id.length > 0);

const shadow = CupShadowSimulationService.simulateFromMatchContext(ctx, {
  homeLineup: sample.home.lineup,
  awayLineup: sample.away.lineup,
  homeInstructions: sample.home.instructions,
  awayInstructions: sample.away.instructions,
  userSide: 'HOME',
  seedSuffix: 'shadow_test',
  legacy: {
    homeScore: 0,
    awayScore: 0,
    home: { shots: 2, shotsOnTarget: 1, corners: 3, fouls: 5, offsides: 4, yellowCards: 1, redCards: 0 },
    away: { shots: 1, shotsOnTarget: 1, corners: 3, fouls: 3, offsides: 5, yellowCards: 1, redCards: 0 },
  },
});

assert.equal(shadow.diagnostics.home.foundStartingPlayers, 11);
assert.equal(shadow.diagnostics.away.foundStartingPlayers, 11);
assert.ok(shadow.summary.totalShots >= 6, `Za mało strzałów w symulacji shadow: ${shadow.summary.totalShots}`);
assert.ok(shadow.summary.totalShots <= 40, `Za dużo strzałów w symulacji shadow: ${shadow.summary.totalShots}`);
assert.ok(shadow.summary.totalGoals <= 6, `Wynik nadal wygląda hokejowo: ${shadow.summary.score}`);
assert.ok(shadow.summary.totalOffsides <= 8, `Spalone nadal są za wysokie: ${shadow.summary.totalOffsides}`);
assert.ok(shadow.diff, 'Raport shadow powinien zawierać różnicę względem starego silnika');

assert.ok(shadow.summary.topPerformers.length > 0, 'Raport shadow powinien zawierać najlepszych zawodników');
assert.ok(Object.keys(shadow.summary.ratings).length >= 22, 'Raport shadow powinien zawierać mapę ocen zawodników');
assert.ok(
  shadow.summary.shotLeaders.length > 0 || shadow.summary.totalShots === 0,
  'Raport shadow powinien wskazywać liderów strzałów, jeśli w meczu były strzały',
);
assert.equal(shadow.matchSummary.homeScore, shadow.result.homeScore);
assert.equal(shadow.matchSummary.awayScore, shadow.result.awayScore);
assert.equal(shadow.matchSummary.homeStats.shots, shadow.result.stats.HOME.shots);
assert.equal(shadow.matchSummary.awayStats.shots, shadow.result.stats.AWAY.shots);
assert.ok(shadow.matchSummary.homePlayers.length >= 11, 'MatchSummary V2 powinien zawierać zawodników gospodarzy');
assert.ok(shadow.matchSummary.awayPlayers.length >= 11, 'MatchSummary V2 powinien zawierać zawodników gości');
assert.ok(
  shadow.matchSummary.homePlayers.some(player => typeof player.rating === 'number') ||
  shadow.matchSummary.awayPlayers.some(player => typeof player.rating === 'number'),
  'MatchSummary V2 powinien przekazywać oceny zawodników',
);
const offsideEvents = shadow.result.events.filter(event => event.type === 'OFFSIDE');
const disciplineEvents = shadow.result.events.filter(event =>
  event.type === 'FOUL' || event.type === 'YELLOW_CARD' || event.type === 'RED_CARD'
);
assert.ok(offsideEvents.every(event => Boolean(event.playerId)), 'Każde spalone V2 powinno mieć zawodnika na spalonym');
assert.ok(disciplineEvents.every(event => Boolean(event.playerId)), 'Każdy faul/kartka V2 powinien mieć faulującego');
assert.ok(disciplineEvents.every(event => Boolean(event.secondaryPlayerId)), 'Każdy faul/kartka V2 powinien mieć faulowanego');

console.table([{
  score: shadow.summary.score,
  shots: shadow.summary.totalShots,
  onTarget: shadow.summary.totalShotsOnTarget,
  goals: shadow.summary.totalGoals,
  xG: shadow.summary.totalXg,
  corners: shadow.summary.totalCorners,
  offsides: shadow.summary.totalOffsides,
  yellows: shadow.summary.totalYellowCards,
  penalties: shadow.summary.decidedByPenalties ? shadow.summary.penaltyScore : '',
  shotDiffVsLegacy: shadow.diff?.totalShotsDiff,
  offsideDiffVsLegacy: shadow.diff?.totalOffsidesDiff,
}]);
console.table(shadow.summary.topPerformers.map(player => ({
  player: player.name,
  side: player.side,
  rating: player.rating,
  goals: player.goals,
  assists: player.assists,
  shots: player.shots,
  xG: player.xG,
})));

console.log('Cup V2 adapter/shadow test passed.');
