import assert from 'node:assert/strict';
import { MatchEventType, PlayerPosition, type Player } from '../types';
import {
  CupMatchEngineV2,
  CupPenaltyShootoutService,
  CupPlayerStatsAggregator,
  CupSampleMatchFactory,
  type CupMatchEvent,
  type CupTeamInput,
} from '../services/match/engines/cupV2';

const sample = CupSampleMatchFactory.makeInput(21, 'EQUAL');

const byId = (team: CupTeamInput): Map<string, Player> =>
  new Map(team.players.map(player => [player.id, player]));

const playerFromLineup = (team: CupTeamInput, position: PlayerPosition): Player => {
  const players = byId(team);
  const player = team.lineup.startingXI
    .map(id => id ? players.get(id) : undefined)
    .find(item => item?.position === position);
  assert.ok(player, `Missing ${position} player in sample lineup`);
  return player;
};

const benchPlayer = (team: CupTeamInput): Player => {
  const players = byId(team);
  const player = team.lineup.bench
    .map(id => players.get(id))
    .find(Boolean);
  assert.ok(player, 'Missing bench player in sample team');
  return player;
};

const homeScorer = playerFromLineup(sample.home, PlayerPosition.FWD);
const homeCreator = playerFromLineup(sample.home, PlayerPosition.MID);
const homeKeeper = playerFromLineup(sample.home, PlayerPosition.GK);
const homeSub = benchPlayer(sample.home);
const awayAttacker = playerFromLineup(sample.away, PlayerPosition.FWD);
const awayKeeper = playerFromLineup(sample.away, PlayerPosition.GK);
const awayOwnGoalDefender = playerFromLineup(sample.away, PlayerPosition.DEF);
const awayCardedDefender = sample.away.players.find(player =>
  sample.away.lineup.startingXI.includes(player.id) &&
  player.position === PlayerPosition.DEF &&
  player.id !== awayOwnGoalDefender.id
);
assert.ok(awayCardedDefender, 'Missing second away defender in sample lineup');

const events: CupMatchEvent[] = [
  {
    id: 'shot_off_1',
    second: 300,
    minute: 5,
    side: 'HOME',
    type: MatchEventType.SHOT,
    playerId: homeScorer.id,
    secondaryPlayerId: homeCreator.id,
    text: 'Shot off target',
    xG: 0.05,
  },
  {
    id: 'shot_on_1',
    second: 600,
    minute: 10,
    side: 'HOME',
    type: MatchEventType.SHOT_ON_TARGET,
    playerId: homeScorer.id,
    secondaryPlayerId: homeCreator.id,
    text: 'Shot on target',
    xG: 0.09,
  },
  {
    id: 'goal_1',
    second: 1200,
    minute: 20,
    side: 'HOME',
    type: MatchEventType.GOAL,
    playerId: homeScorer.id,
    secondaryPlayerId: homeCreator.id,
    text: 'Goal with assist',
    xG: 0.25,
    detail: { assistEligible: true },
  },
  {
    id: 'save_1',
    second: 1800,
    minute: 30,
    side: 'AWAY',
    type: MatchEventType.SAVE,
    playerId: awayAttacker.id,
    text: 'Keeper save',
    xG: 0.14,
  },
  {
    id: 'post_1',
    second: 2400,
    minute: 40,
    side: 'HOME',
    type: MatchEventType.SHOT_POST,
    playerId: homeScorer.id,
    text: 'Post',
    xG: 0.07,
  },
  {
    id: 'offside_1',
    second: 3000,
    minute: 50,
    side: 'HOME',
    type: MatchEventType.OFFSIDE,
    playerId: homeScorer.id,
    text: 'Offside',
  },
  {
    id: 'yellow_1',
    second: 3300,
    minute: 55,
    side: 'HOME',
    type: MatchEventType.YELLOW_CARD,
    playerId: homeScorer.id,
    secondaryPlayerId: awayAttacker.id,
    text: 'Yellow card',
  },
  {
    id: 'sub_1',
    second: 3600,
    minute: 60,
    side: 'HOME',
    type: MatchEventType.SUBSTITUTION,
    playerId: homeSub.id,
    secondaryPlayerId: homeScorer.id,
    text: 'Substitution',
  },
  {
    id: 'injury_1',
    second: 4200,
    minute: 70,
    side: 'AWAY',
    type: MatchEventType.INJURY_SEVERE,
    playerId: awayAttacker.id,
    text: 'Severe injury',
  },
  {
    id: 'own_goal_1',
    second: 4800,
    minute: 80,
    side: 'HOME',
    type: MatchEventType.GOAL,
    playerId: awayOwnGoalDefender.id,
    text: 'Own goal',
    xG: 0.10,
    detail: {
      assistEligible: false,
      isOwnGoal: true,
      ownGoalPlayerId: awayOwnGoalDefender.id,
    },
  },
  {
    id: 'red_1',
    second: 5000,
    minute: 84,
    side: 'AWAY',
    type: MatchEventType.RED_CARD,
    playerId: awayCardedDefender.id,
    secondaryPlayerId: homeSub.id,
    text: 'Red card',
  },
  {
    id: 'penalty_goal_1',
    second: 5100,
    minute: 85,
    side: 'AWAY',
    type: MatchEventType.PENALTY_SCORED,
    playerId: awayAttacker.id,
    text: 'Penalty scored',
    xG: 0.76,
    detail: { assistEligible: false },
  },
  {
    id: 'penalty_miss_1',
    second: 5300,
    minute: 89,
    side: 'HOME',
    type: MatchEventType.PENALTY_MISSED,
    playerId: homeSub.id,
    text: 'Penalty missed',
    xG: 0.76,
  },
];

const stats = CupPlayerStatsAggregator.aggregate({
  match: sample,
  events,
  finalSecond: 90 * 60,
  homeScore: 2,
  awayScore: 1,
  initialLineups: {
    HOME: [...sample.home.lineup.startingXI],
    AWAY: [...sample.away.lineup.startingXI],
  },
});

const scorerStats = stats.HOME[homeScorer.id];
assert.equal(scorerStats.starter, true);
assert.equal(scorerStats.minutesPlayed, 60);
assert.equal(scorerStats.substitutionsOff, 1);
assert.equal(scorerStats.goals, 1);
assert.equal(scorerStats.assists, 0);
assert.equal(scorerStats.shots, 4);
assert.equal(scorerStats.shotsOnTarget, 2);
assert.equal(scorerStats.shotsOffTarget, 2);
assert.equal(scorerStats.posts, 1);
assert.equal(scorerStats.offsides, 1);
assert.equal(scorerStats.yellowCards, 1);
assert.equal(scorerStats.foulsCommitted, 1);
assert.equal(scorerStats.xG, 0.46);

const creatorStats = stats.HOME[homeCreator.id];
assert.equal(creatorStats.assists, 1);
assert.equal(creatorStats.chancesCreated, 3);
assert.equal(creatorStats.keyPasses, 2);

const subStats = stats.HOME[homeSub.id];
assert.equal(subStats.starter, false);
assert.equal(subStats.substitutionsOn, 1);
assert.equal(subStats.minutesPlayed, 30);
assert.equal(subStats.foulsWon, 1);
assert.equal(subStats.penaltiesTaken, 1);
assert.equal(subStats.penaltiesMissed, 1);
assert.equal(subStats.shots, 1);
assert.equal(subStats.shotsOffTarget, 1);

const homeKeeperStats = stats.HOME[homeKeeper.id];
assert.equal(homeKeeperStats.saves, 1);
assert.equal(homeKeeperStats.goalsConceded, 1);

const awayAttackerStats = stats.AWAY[awayAttacker.id];
assert.equal(awayAttackerStats.shots, 2);
assert.equal(awayAttackerStats.shotsOnTarget, 2);
assert.equal(awayAttackerStats.goals, 1);
assert.equal(awayAttackerStats.foulsWon, 1);
assert.equal(awayAttackerStats.penaltiesTaken, 1);
assert.equal(awayAttackerStats.penaltiesScored, 1);
assert.equal(awayAttackerStats.injuriesSevere, 1);

const ownGoalStats = stats.AWAY[awayOwnGoalDefender.id];
assert.equal(ownGoalStats.ownGoals, 1);
assert.equal(ownGoalStats.goals, 0);

const cardedStats = stats.AWAY[awayCardedDefender.id];
assert.equal(cardedStats.redCards, 1);
assert.equal(cardedStats.foulsCommitted, 1);
assert.equal(cardedStats.minutesPlayed, 84);

const awayKeeperStats = stats.AWAY[awayKeeper.id];
assert.equal(awayKeeperStats.goalsConceded, 2);

assert.ok(scorerStats.rating >= 6.5, `Scorer rating too low: ${scorerStats.rating}`);
assert.ok(homeKeeperStats.rating >= 6.0, `Keeper rating too low: ${homeKeeperStats.rating}`);
assert.ok(ownGoalStats.rating < 6.2, `Own goal should lower rating: ${ownGoalStats.rating}`);

const shootoutSample = CupSampleMatchFactory.makeInput(31, 'EQUAL');
const redCardedShootoutPlayer = shootoutSample.home.players.find(player =>
  shootoutSample.home.lineup.startingXI.includes(player.id) &&
  player.position !== PlayerPosition.GK
);
assert.ok(redCardedShootoutPlayer, 'Missing red-card shootout candidate');
const shootoutFatigue = Object.fromEntries(
  [...shootoutSample.home.players, ...shootoutSample.away.players].map(player => [player.id, player.condition])
);
const shootout = CupPenaltyShootoutService.simulate(shootoutSample, shootoutFatigue, {
  redCards: { [redCardedShootoutPlayer.id]: true },
  startSecond: 120 * 60,
});

assert.equal(shootout.events.length, shootout.attempts.length);
assert.ok(shootout.attempts.length >= 6, 'Shootout should contain multiple attempts');
assert.ok(shootout.events.every(event => event.detail?.isShootout === true), 'Shootout events should be marked explicitly');
assert.ok(shootout.events.every(event => Boolean(event.playerId)), 'Shootout event should have taker');
assert.ok(shootout.events.every(event => Boolean(event.secondaryPlayerId)), 'Shootout event should have goalkeeper');
assert.ok(
  shootout.attempts.every(attempt => attempt.takerId !== redCardedShootoutPlayer.id),
  'Red-carded player must not take a shootout penalty',
);

(['HOME', 'AWAY'] as const).forEach(side => {
  const firstCycle = shootout.attempts
    .filter(attempt => attempt.side === side)
    .slice(0, 5)
    .map(attempt => attempt.takerId);
  assert.equal(new Set(firstCycle).size, firstCycle.length, `Shootout takers for ${side} should not repeat in first cycle`);
});

const shootoutStats = CupPlayerStatsAggregator.aggregate({
  match: shootoutSample,
  events: shootout.events,
  finalSecond: 120 * 60,
  homeScore: 0,
  awayScore: 0,
  initialLineups: {
    HOME: [...shootoutSample.home.lineup.startingXI],
    AWAY: [...shootoutSample.away.lineup.startingXI],
  },
});

shootout.attempts.forEach(attempt => {
  const taker = shootoutStats[attempt.side][attempt.takerId];
  assert.ok(taker, 'Shootout taker should exist in player stats');
  assert.ok(taker.penaltiesTaken >= 1, 'Shootout taker should have penalty taken');
  if (attempt.scored) assert.ok(taker.penaltiesScored >= 1, 'Scored shootout penalty should be counted');
  if (!attempt.scored) assert.ok(taker.penaltiesMissed >= 1, 'Missed shootout penalty should be counted');

  if (attempt.saved && attempt.goalkeeperId) {
    const keeperSide = attempt.side === 'HOME' ? 'AWAY' : 'HOME';
    const keeper = shootoutStats[keeperSide][attempt.goalkeeperId];
    assert.ok(keeper.penaltiesSaved >= 1, 'Saved shootout penalty should be counted for goalkeeper');
  }
});

const simulated = CupMatchEngineV2.simulate({
  ...CupSampleMatchFactory.makeInput(22, 'EQUAL'),
  config: {
    tickSeconds: 5,
    normalTimeSeconds: 90 * 60,
    enableExtraTime: false,
    enablePenaltyShootout: false,
  },
});

const simulatedHomePlayers = Object.values(simulated.playerStats.HOME);
const simulatedAwayPlayers = Object.values(simulated.playerStats.AWAY);
assert.ok(simulatedHomePlayers.length >= 11, 'Simulated result should include home player stats');
assert.ok(simulatedAwayPlayers.length >= 11, 'Simulated result should include away player stats');
assert.ok(simulatedHomePlayers.some(player => player.minutesPlayed > 0), 'Home player minutes should be tracked');
assert.ok(simulatedAwayPlayers.some(player => player.minutesPlayed > 0), 'Away player minutes should be tracked');

console.log('CupPlayerStatsAggregatorTests: OK');
