import assert from 'node:assert/strict';
import { PlayerPosition } from '../types';
import {
  CupPlayerRatingService,
  type CupMatchStats,
  type CupPlayerMatchStats,
} from '../services/match/engines/cupV2';

const emptyTeamStats = (overrides: Partial<CupMatchStats> = {}): CupMatchStats => ({
  possessionTicks: 50,
  passesAttempted: 40,
  passesCompleted: 32,
  dribblesAttempted: 5,
  dribblesCompleted: 3,
  tacklesWon: 7,
  crossesAttempted: 8,
  crossesCompleted: 3,
  blocks: 4,
  reboundsWon: 12,
  turnoversWon: 9,
  turnoversLost: 8,
  shots: 10,
  shotsOnTarget: 4,
  goals: 1,
  xG: 1.2,
  corners: 4,
  fouls: 3,
  offsides: 1,
  yellowCards: 1,
  redCards: 0,
  injuries: 0,
  freeKicks: 2,
  penalties: 0,
  posts: 0,
  bars: 0,
  saves: 3,
  ...overrides,
});

const playerStats = (overrides: Partial<CupPlayerMatchStats>): CupPlayerMatchStats => ({
  playerId: 'p1',
  name: 'Test Player',
  side: 'HOME',
  clubId: 'club',
  position: PlayerPosition.MID,
  starter: true,
  startedSecond: 0,
  endedSecond: undefined,
  minutesPlayed: 90,
  goals: 0,
  ownGoals: 0,
  assists: 0,
  shots: 0,
  shotsOnTarget: 0,
  shotsOffTarget: 0,
  posts: 0,
  bars: 0,
  xG: 0,
  chancesCreated: 0,
  keyPasses: 0,
  passesAttempted: 0,
  passesCompleted: 0,
  controls: 0,
  dribblesAttempted: 0,
  dribblesCompleted: 0,
  tacklesAttempted: 0,
  tacklesWon: 0,
  crossesAttempted: 0,
  crossesCompleted: 0,
  shotsBlocked: 0,
  reboundsWon: 0,
  turnoversWon: 0,
  turnoversLost: 0,
  foulsCommitted: 0,
  foulsWon: 0,
  offsides: 0,
  yellowCards: 0,
  redCards: 0,
  injuriesLight: 0,
  injuriesSevere: 0,
  substitutionsOn: 0,
  substitutionsOff: 0,
  saves: 0,
  goalsConceded: 0,
  penaltiesTaken: 0,
  penaltiesScored: 0,
  penaltiesMissed: 0,
  penaltiesSaved: 0,
  rating: 6,
  ...overrides,
});

const teamStats = emptyTeamStats({ shots: 15, shotsOnTarget: 7, goals: 2, xG: 2.1, corners: 6 });
const opponentStats = emptyTeamStats({ shots: 7, shotsOnTarget: 2, goals: 0, xG: 0.6, corners: 2 });

const scorer = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: PlayerPosition.FWD,
    goals: 2,
    shots: 4,
    shotsOnTarget: 3,
    shotsOffTarget: 1,
    xG: 0.9,
  }),
  sideScore: 2,
  opponentScore: 0,
  teamStats,
  opponentStats,
  finalFatigue: 66,
});

const creator = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: PlayerPosition.MID,
    assists: 1,
    chancesCreated: 4,
    keyPasses: 3,
    foulsWon: 2,
  }),
  sideScore: 2,
  opponentScore: 0,
  teamStats,
  opponentStats,
  finalFatigue: 70,
});

const cleanSheetKeeper = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: PlayerPosition.GK,
    saves: 5,
    goalsConceded: 0,
    penaltiesSaved: 1,
  }),
  sideScore: 1,
  opponentScore: 0,
  teamStats,
  opponentStats,
  finalFatigue: 78,
});

const punishedDefender = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: PlayerPosition.DEF,
    ownGoals: 1,
    redCards: 1,
    foulsCommitted: 3,
    yellowCards: 1,
  }),
  sideScore: 0,
  opponentScore: 2,
  teamStats: opponentStats,
  opponentStats: teamStats,
  finalFatigue: 44,
});

const wastefulForward = CupPlayerRatingService.calculate({
  entry: playerStats({
    position: PlayerPosition.FWD,
    shots: 5,
    shotsOnTarget: 0,
    shotsOffTarget: 5,
    xG: 0.9,
    penaltiesTaken: 1,
    penaltiesMissed: 1,
  }),
  sideScore: 0,
  opponentScore: 1,
  teamStats: emptyTeamStats({ shots: 16, shotsOnTarget: 2, goals: 0, xG: 1.7 }),
  opponentStats: emptyTeamStats({ shots: 8, shotsOnTarget: 3, goals: 1, xG: 0.9 }),
  finalFatigue: 33,
});

const unusedSub = CupPlayerRatingService.calculate({
  entry: playerStats({ minutesPlayed: 0, startedSecond: undefined, starter: false }),
  sideScore: 1,
  opponentScore: 1,
});

assert.ok(scorer >= 8.0, `Two-goal scorer rating too low: ${scorer}`);
assert.ok(creator >= 6.9 && creator < scorer, `Creator rating should be good but below two-goal scorer: ${creator}`);
assert.ok(cleanSheetKeeper >= 7.4, `Clean-sheet keeper with penalty save rating too low: ${cleanSheetKeeper}`);
assert.ok(punishedDefender <= 4.2, `Own goal and red card should be heavily punished: ${punishedDefender}`);
assert.ok(wastefulForward < 5.8, `Wasteful forward should be below average: ${wastefulForward}`);
assert.equal(unusedSub, 0);

console.table([{
  scorer,
  creator,
  cleanSheetKeeper,
  punishedDefender,
  wastefulForward,
  unusedSub,
}]);

console.log('CupPlayerRatingServiceTests: OK');
