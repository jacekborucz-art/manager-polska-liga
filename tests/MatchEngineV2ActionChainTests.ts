import assert from 'node:assert/strict';
import { MatchEventType } from '../types';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
  MatchEngineV2TrajectoryService,
  type MatchEngineV2Input,
} from '../services/match/engines/v2';

const trackedTypes = [
  MatchEventType.BALL_CONTROL,
  MatchEventType.DRIBBLING,
  MatchEventType.TACKLE_WON,
  MatchEventType.CROSS_NEAR_POST,
  MatchEventType.CROSS_FAR_POST,
  MatchEventType.CROSS_BLOCKED,
  MatchEventType.SHOT_BLOCKED,
  MatchEventType.REBOUND_WON,
  MatchEventType.GOAL,
] as const;

const totals = new Map<MatchEventType, number>(trackedTypes.map(type => [type, 0]));
let validatedGoalChains = 0;
let totalMatches = 0;
let reboundShots = 0;

for (let seed = 1; seed <= 36; seed += 1) {
  const sample = CupSampleMatchFactory.makeInput(1200 + seed, seed % 3 === 0 ? 'STRONGER' : 'EQUAL');
  const input: MatchEngineV2Input = {
    seed: `match_engine_v2_chain_${seed}`,
    home: sample.home,
    away: sample.away,
    environment: sample.environment,
    halfTimeTalks: sample.halfTimeTalks,
    calibration: sample.calibration,
    rules: LEAGUE_MATCH_RULES_V2,
    config: { tickSeconds: 5 },
  };
  const runtime = MatchEngineV2.createMatch(input);
  const snapshot = MatchEngineV2.advanceTo(runtime, 120 * 60);
  assert.equal(snapshot.isFinished, true);
  assert.ok(snapshot.result.finalState.firstHalfAddedTimeSeconds >= 60);
  assert.ok(snapshot.result.finalState.secondHalfAddedTimeSeconds >= 60);
  const events = snapshot.result.events;
  const players = [
    ...Object.values(snapshot.result.playerStats.HOME),
    ...Object.values(snapshot.result.playerStats.AWAY),
  ];
  totalMatches += 1;

  trackedTypes.forEach(type => {
    totals.set(type, (totals.get(type) ?? 0) + events.filter(event => event.type === type).length);
  });

  const controls = events.filter(event => event.type === MatchEventType.BALL_CONTROL);
  const dribbles = events.filter(event => event.type === MatchEventType.DRIBBLING);
  const tackles = events.filter(event => event.type === MatchEventType.TACKLE_WON);
  const crosses = events.filter(event => event.type === MatchEventType.CROSS_NEAR_POST || event.type === MatchEventType.CROSS_FAR_POST);
  const blockedCrosses = events.filter(event => event.type === MatchEventType.CROSS_BLOCKED);
  const blockedShots = events.filter(event => event.type === MatchEventType.SHOT_BLOCKED);
  const rebounds = events.filter(event => event.type === MatchEventType.REBOUND_WON);
  const followUpShots = events.filter(event => event.detail?.reboundShot === true);
  reboundShots += followUpShots.length;

  assert.equal(players.reduce((sum, player) => sum + player.controls, 0), controls.length);
  assert.equal(players.reduce((sum, player) => sum + player.dribblesAttempted, 0), dribbles.length);
  assert.equal(players.reduce((sum, player) => sum + player.dribblesCompleted, 0), dribbles.length);
  assert.equal(players.reduce((sum, player) => sum + player.tacklesWon, 0), tackles.length);
  assert.equal(players.reduce((sum, player) => sum + player.crossesAttempted, 0), crosses.length + blockedCrosses.length);
  assert.equal(players.reduce((sum, player) => sum + player.crossesCompleted, 0), crosses.length);
  assert.equal(players.reduce((sum, player) => sum + player.shotsBlocked, 0), blockedShots.length);
  assert.equal(players.reduce((sum, player) => sum + player.reboundsWon, 0), rebounds.length);
  const teamStats = [snapshot.result.stats.HOME, snapshot.result.stats.AWAY];
  const interceptions = events.filter(event => event.type === MatchEventType.MISPLACED_PASS);
  assert.equal(teamStats.reduce((sum, team) => sum + team.passesAttempted, 0),
    events.filter(event => event.type === MatchEventType.PASS_COMPLETED).length + interceptions.length);
  assert.equal(teamStats.reduce((sum, team) => sum + team.dribblesCompleted, 0), dribbles.length);
  assert.equal(teamStats.reduce((sum, team) => sum + team.tacklesWon, 0), tackles.length);
  assert.equal(teamStats.reduce((sum, team) => sum + team.crossesAttempted, 0), crosses.length + blockedCrosses.length);
  assert.equal(teamStats.reduce((sum, team) => sum + team.blocks, 0), blockedShots.length + blockedCrosses.length);
  assert.equal(teamStats.reduce((sum, team) => sum + team.reboundsWon, 0), rebounds.length);

  rebounds.forEach(rebound => {
    const sequenceId = rebound.detail?.sequenceId;
    assert.equal(typeof sequenceId, 'string');
    const reboundIndex = events.indexOf(rebound);
    const source = events.slice(0, reboundIndex).findLast(event =>
      event.detail?.sequenceId === sequenceId && (
        event.type === MatchEventType.SAVE ||
        event.type === MatchEventType.ONE_ON_ONE_SAVE ||
        event.type === MatchEventType.SHOT_POST ||
        event.type === MatchEventType.SHOT_BAR ||
        event.type === MatchEventType.SHOT_BLOCKED
      )
    );
    assert.ok(source, 'A rebound must reference a preceding loose-ball shot.');
  });

  followUpShots.forEach(followUp => {
    const sequenceId = followUp.detail?.sequenceId;
    const followUpIndex = events.indexOf(followUp);
    const buildup = events.slice(0, followUpIndex).filter(event => event.detail?.sequenceId === sequenceId);
    assert.ok(buildup.some(event => event.type === MatchEventType.REBOUND_WON && event.playerId === followUp.playerId));
    assert.ok(buildup.some(event => event.type === MatchEventType.BALL_CONTROL && event.playerId === followUp.playerId));
    assert.equal(followUp.detail?.assistEligible, false);
  });

  const goals = events.filter(event => event.type === MatchEventType.GOAL || event.type === MatchEventType.ONE_ON_ONE_GOAL);
  goals.forEach(goal => {
    const sequenceId = goal.detail?.sequenceId;
    assert.equal(typeof sequenceId, 'string');
    assert.equal(typeof goal.detail?.goalkeeperId, 'string');
    const goalIndex = events.indexOf(goal);
    const buildup = events.slice(0, goalIndex).filter(event => event.detail?.sequenceId === sequenceId);
    const attackingShooterId = goal.detail?.attackingShooterId;
    assert.ok(buildup.some(event =>
      event.type === MatchEventType.BALL_CONTROL && event.playerId === attackingShooterId
    ), 'A goal must follow the scorer\'s first touch in the same sequence.');
    assert.ok(buildup.every(event => event.second === goal.second));
    validatedGoalChains += 1;
  });

  const authoritativeIds = new Set(events.map(event => `visual_${event.id}`));
  snapshot.spatial.visualCues.forEach(cue => {
    assert.ok(authoritativeIds.has(cue.id));
    const midpoint = MatchEngineV2TrajectoryService.sampleCue(cue, cue.durationMs / 2);
    assert.ok(midpoint.x >= 0 && midpoint.x <= snapshot.spatial.pitchWidth);
    assert.ok(midpoint.y >= 0 && midpoint.y <= snapshot.spatial.pitchLength);
    assert.ok(midpoint.z >= 0);
  });
}

assert.ok(validatedGoalChains >= 20, `Only ${validatedGoalChains} goal chains were available.`);
assert.ok(reboundShots >= 3, `Only ${reboundShots} rebound shots were generated.`);
for (const type of trackedTypes) {
  assert.ok((totals.get(type) ?? 0) > 0, `No ${type} event was generated in ${totalMatches} matches.`);
}

console.log('MatchEngineV2ActionChainTests: OK', {
  matches: totalMatches,
  validatedGoalChains,
  reboundShots,
  eventTotals: Object.fromEntries(totals),
});
