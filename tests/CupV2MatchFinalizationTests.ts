import assert from 'node:assert/strict';
import { CompetitionType, MatchStatus, type Club, type MatchContext, type Player } from '../types';
import { KitSelectionService } from '../services/KitSelectionService';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import { CupShadowSimulationService, CupV2MatchFinalizationService } from '../services/match/adapters/cupV2';

const makeClub = (
  id: string,
  name: string,
  reputation: number,
  stadiumCapacity: number,
  morale: number,
  roleSource: { captainId?: string | null; penaltyTakerId?: string | null; freeKickTakerId?: string | null },
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
  isInPolishCup: true,
  captainId: roleSource.captainId,
  penaltyTakerId: roleSource.penaltyTakerId,
  freeKickTakerId: roleSource.freeKickTakerId,
}) as Club;

const cloneSquad = (players: Player[]): Player[] =>
  players.map(player => ({
    ...player,
    stats: { ...player.stats, seasonalChanges: { ...player.stats.seasonalChanges }, ratingHistory: [...player.stats.ratingHistory] },
    cupStats: player.cupStats
      ? { ...player.cupStats, seasonalChanges: { ...player.cupStats.seasonalChanges }, ratingHistory: [...player.cupStats.ratingHistory] }
      : undefined,
    health: { ...player.health, injury: player.health.injury ? { ...player.health.injury } : undefined },
  }));

const sample = CupSampleMatchFactory.makeInput(11, 'LOWER_LEAGUE_HOME');
const homeCaptainId = sample.home.lineup.startingXI.find((id): id is string => Boolean(id))!;
const homePenaltyId = sample.home.lineup.startingXI.filter((id): id is string => Boolean(id))[1]!;
const homeFreeKickId = sample.home.lineup.startingXI.filter((id): id is string => Boolean(id))[2]!;

const ctx: MatchContext = {
  fixture: {
    id: 'PP_TEST_R64_FINALIZATION',
    leagueId: CompetitionType.POLISH_CUP,
    homeTeamId: sample.home.clubId,
    awayTeamId: sample.away.clubId,
    date: new Date('2026-09-24T18:00:00'),
    status: MatchStatus.SCHEDULED,
    homeScore: null,
    awayScore: null,
    attendance: 7200,
  },
  homeClub: makeClub(sample.home.clubId, 'Olimpia Testowa', 48, 9000, 68, {
    captainId: homeCaptainId,
    penaltyTakerId: homePenaltyId,
    freeKickTakerId: homeFreeKickId,
  }),
  awayClub: makeClub(sample.away.clubId, 'Raków Testowy', 72, 18000, 58, {}),
  homePlayers: sample.home.players,
  awayPlayers: sample.away.players,
  homeAdvantage: true,
  competition: CompetitionType.POLISH_CUP,
};

const report = CupShadowSimulationService.simulateFromMatchContext(ctx, {
  homeLineup: sample.home.lineup,
  awayLineup: sample.away.lineup,
  homeInstructions: sample.home.instructions,
  awayInstructions: sample.away.instructions,
  userSide: 'HOME',
  manualSubstitutionSide: 'HOME',
  seedSuffix: 'finalization_test',
});

const fixtures = [ctx.fixture];
const players = {
  [ctx.homeClub.id]: cloneSquad(sample.home.players),
  [ctx.awayClub.id]: cloneSquad(sample.away.players),
};
const lineups = {
  [ctx.homeClub.id]: sample.home.lineup,
  [ctx.awayClub.id]: sample.away.lineup,
};
const kits = KitSelectionService.selectOptimalKits(ctx.homeClub, ctx.awayClub);

const finalization = CupV2MatchFinalizationService.build({
  report,
  ctx,
  fixtures,
  clubs: [ctx.homeClub, ctx.awayClub],
  players,
  lineups,
  currentDate: new Date('2026-09-24T20:00:00'),
  seasonNumber: 2,
  kits,
});

const finishedFixture = finalization.simulationOutput.updatedFixtures[0];
assert.equal(finishedFixture.status, MatchStatus.FINISHED);
assert.equal(finishedFixture.homeScore, report.result.homeScore);
assert.equal(finishedFixture.awayScore, report.result.awayScore);
assert.equal(finishedFixture.homePenaltyScore, report.result.penaltyScore?.home);
assert.equal(finishedFixture.awayPenaltyScore, report.result.penaltyScore?.away);

const winnerClub = finalization.simulationOutput.updatedClubs.find(club => club.id === finalization.winnerClubId);
const loserClub = finalization.simulationOutput.updatedClubs.find(club => club.id !== finalization.winnerClubId);
assert.equal(winnerClub?.isInPolishCup, true);
assert.equal(loserClub?.isInPolishCup, false);
assert.equal(finalization.simulationOutput.updatedClubs.find(club => club.id === ctx.homeClub.id)?.captainId, homeCaptainId);
assert.equal(finalization.simulationOutput.updatedClubs.find(club => club.id === ctx.homeClub.id)?.penaltyTakerId, homePenaltyId);
assert.equal(finalization.simulationOutput.updatedClubs.find(club => club.id === ctx.homeClub.id)?.freeKickTakerId, homeFreeKickId);

const homePlayed = Object.values(report.result.playerStats.HOME).find(player => player.minutesPlayed > 0)!;
const updatedHomePlayer = finalization.simulationOutput.updatedPlayers[ctx.homeClub.id].find(player => player.id === homePlayed.playerId)!;
assert.equal(updatedHomePlayer.cupStats?.matchesPlayed, 1);
assert.equal(updatedHomePlayer.cupStats?.minutesPlayed, Math.round(homePlayed.minutesPlayed));
assert.ok((updatedHomePlayer.cupStats?.ratingHistory.length ?? 0) >= 1);
assert.ok(updatedHomePlayer.condition >= 1 && updatedHomePlayer.condition <= 100);
assert.ok(updatedHomePlayer.fatigueDebt >= players[ctx.homeClub.id].find(player => player.id === homePlayed.playerId)!.fatigueDebt);

assert.equal(finalization.summary.homeScore, report.result.homeScore);
assert.equal(finalization.summary.awayScore, report.result.awayScore);
assert.equal(finalization.historyEntry.homeLineup?.length, 11);
assert.equal(finalization.historyEntry.awayLineup?.length, 11);
assert.equal(finalization.historyEntry.goals.length, report.result.events.filter(event =>
  event.side && !event.detail?.isShootout && ['GOAL', 'ONE_ON_ONE_GOAL', 'PENALTY_SCORED'].includes(event.type)
).length);
assert.ok(Object.keys(finalization.historyEntry.ratings ?? {}).length >= 22);
assert.equal(report.result.events.some(event => event.side === 'HOME' && event.type === 'SUBSTITUTION'), false);

console.table([{
  score: `${report.result.homeScore}:${report.result.awayScore}`,
  penalties: report.result.penaltyScore ? `${report.result.penaltyScore.home}:${report.result.penaltyScore.away}` : '',
  winner: finalization.winnerSide,
  historyGoals: finalization.historyEntry.goals.length,
  cards: finalization.historyEntry.cards.length,
  ratings: Object.keys(finalization.historyEntry.ratings ?? {}).length,
}]);

console.log('Cup V2 finalization test passed.');
