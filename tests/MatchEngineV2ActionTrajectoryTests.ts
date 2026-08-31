import assert from 'node:assert/strict';
import { MatchEventType } from '../types';
import {
  CupPlayerDecisionService,
  CupSampleMatchFactory,
  CupTeamProfileService,
  seededRandom,
} from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
  MatchEngineV2PlaybackService,
  MatchEngineV2TrajectoryService,
  type MatchEngineV2Input,
} from '../services/match/engines/v2';

const sample = CupSampleMatchFactory.makeInput(812, 'EQUAL');
const input: MatchEngineV2Input = {
  seed: 'match_engine_v2_actions_812',
  home: sample.home,
  away: sample.away,
  environment: sample.environment,
  halfTimeTalks: sample.halfTimeTalks,
  calibration: sample.calibration,
  rules: LEAGUE_MATCH_RULES_V2,
  config: { tickSeconds: 5 },
};

const runtime = MatchEngineV2.createMatch(input);
let snapshot = MatchEngineV2.snapshot(runtime);
let narrowestOutfieldLengthSpan = Number.POSITIVE_INFINITY;
let narrowestOutfieldWidthSpan = Number.POSITIVE_INFINITY;
let smallestRenderedPlayerDistance = Number.POSITIVE_INFINITY;
let smallestRenderedPlayerDistanceContext = '';
for (let second = 5; second <= 90 * 60; second += 5) {
  snapshot = MatchEngineV2.advanceTo(runtime, second);
  const activePlayers = Object.values(snapshot.spatial.players).filter(player => player.isOnPitch);
  const redCardCount = Object.keys(snapshot.result.finalState.redCards).length;
  assert.equal(activePlayers.length, 22 - redCardCount);
  activePlayers.forEach(player => {
    assert.ok(player.position.x >= 0 && player.position.x <= snapshot.spatial.pitchWidth);
    assert.ok(player.position.y >= 0 && player.position.y <= snapshot.spatial.pitchLength);
    if (!player.returningToMovementZone) {
      assert.ok(player.position.x >= player.movementZone.minX && player.position.x <= player.movementZone.maxX);
      assert.ok(player.position.y >= player.movementZone.minY && player.position.y <= player.movementZone.maxY);
    }
  });
  const activeOutfieldPlayers = activePlayers.filter(player => player.role !== 'GK');
  const lengthSpan = Math.max(...activeOutfieldPlayers.map(player => player.position.y))
    - Math.min(...activeOutfieldPlayers.map(player => player.position.y));
  const widthSpan = Math.max(...activeOutfieldPlayers.map(player => player.position.x))
    - Math.min(...activeOutfieldPlayers.map(player => player.position.x));
  narrowestOutfieldLengthSpan = Math.min(narrowestOutfieldLengthSpan, lengthSpan);
  narrowestOutfieldWidthSpan = Math.min(narrowestOutfieldWidthSpan, widthSpan);
  for (let firstIndex = 0; firstIndex < activePlayers.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < activePlayers.length; secondIndex += 1) {
      const firstPlayer = activePlayers[firstIndex];
      const secondPlayer = activePlayers[secondIndex];
      const renderedDistance = Math.hypot(
        (firstPlayer.position.x - secondPlayer.position.x) * 540 / 68,
        (firstPlayer.position.y - secondPlayer.position.y) * 720 / 105,
      );
      if (renderedDistance < smallestRenderedPlayerDistance) {
        smallestRenderedPlayerDistance = renderedDistance;
        smallestRenderedPlayerDistanceContext = `${second}s: ${firstPlayer.playerId} ${JSON.stringify(firstPlayer.position)} / ${secondPlayer.playerId} ${JSON.stringify(secondPlayer.position)}`;
      }
    }
  }
  assert.ok(snapshot.spatial.ball.x >= 0 && snapshot.spatial.ball.x <= snapshot.spatial.pitchWidth);
  assert.ok(snapshot.spatial.ball.y >= 0 && snapshot.spatial.ball.y <= snapshot.spatial.pitchLength);
}
assert.ok(narrowestOutfieldLengthSpan >= 47, `Outfield collapsed vertically to ${narrowestOutfieldLengthSpan.toFixed(2)} m.`);
assert.ok(narrowestOutfieldWidthSpan >= 43, `Outfield collapsed horizontally to ${narrowestOutfieldWidthSpan.toFixed(2)} m.`);
assert.ok(
  smallestRenderedPlayerDistance >= 35.5,
  `SVG player markers overlap at ${smallestRenderedPlayerDistance.toFixed(2)} px (${smallestRenderedPlayerDistanceContext}).`,
);
snapshot = MatchEngineV2.advanceTo(runtime, 120 * 60);
assert.equal(snapshot.isFinished, true);

const passes = snapshot.result.events.filter(event => event.type === MatchEventType.PASS_COMPLETED);
const interceptions = snapshot.result.events.filter(event => event.type === MatchEventType.MISPLACED_PASS);
const tackles = snapshot.result.events.filter(event => event.type === MatchEventType.TACKLE_WON);
const turnovers = [...interceptions, ...tackles];
assert.ok(passes.length >= 20, `Expected visible completed passes, received ${passes.length}.`);
assert.ok(turnovers.length >= 5, `Expected attributed turnovers, received ${turnovers.length}.`);

passes.forEach(event => {
  assert.ok(event.playerId, 'A completed pass requires a passer.');
  assert.ok(event.secondaryPlayerId, 'A completed pass requires a receiver.');
  assert.notEqual(event.playerId, event.secondaryPlayerId);
  assert.equal(typeof event.detail?.passerQuality, 'number');
  assert.equal(typeof event.detail?.receiverMovement, 'number');
});

turnovers.forEach(event => {
  assert.ok(event.playerId, 'A turnover requires the player who won possession.');
  assert.ok(event.secondaryPlayerId, 'A turnover requires the player who lost possession.');
});
const allPlayerStats = [
  ...Object.values(snapshot.result.playerStats.HOME),
  ...Object.values(snapshot.result.playerStats.AWAY),
];
assert.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.passesCompleted, 0),
  passes.length,
);
assert.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.turnoversWon, 0),
  turnovers.length,
);
assert.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.turnoversLost, 0),
  turnovers.length,
);
assert.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.tacklesWon, 0),
  tackles.length,
);
assert.equal(
  allPlayerStats.reduce((sum, entry) => sum + entry.passesAttempted, 0),
  passes.length + interceptions.length,
);

const passCue = snapshot.spatial.visualCues.find(cue => cue.sourceEventType === MatchEventType.PASS_COMPLETED);
assert.ok(passCue, 'A completed pass must create an SVG cue.');
const throwInCue = snapshot.spatial.visualCues.find(cue => cue.sourceEventType === MatchEventType.THROW_IN);
assert.ok(throwInCue, 'A throw-in must create an SVG cue.');
assert.ok(
  throwInCue.start.x <= 0.6 || throwInCue.start.x >= snapshot.spatial.pitchWidth - 0.6,
  'A throw-in trajectory must start at the touchline.',
);
assert.ok(
  throwInCue.end.x >= 5 && throwInCue.end.x <= snapshot.spatial.pitchWidth - 5,
  'A throw-in must travel back inside the pitch to a teammate.',
);
const start = MatchEngineV2TrajectoryService.sampleCue(passCue, 0);
const middle = MatchEngineV2TrajectoryService.sampleCue(passCue, passCue.durationMs / 2);
const end = MatchEngineV2TrajectoryService.sampleCue(passCue, passCue.durationMs);
assert.deepEqual({ x: start.x, y: start.y }, passCue.start);
assert.deepEqual({ x: end.x, y: end.y }, passCue.end);
assert.ok(middle.z > 0);
assert.equal(end.finished, true);

const repeatedMiddle = MatchEngineV2TrajectoryService.sampleCue(passCue, passCue.durationMs / 2);
assert.deepEqual(repeatedMiddle, middle, 'Visual sampling must be deterministic.');

snapshot.spatial.visualCues.forEach(cue => {
  const samplePoint = MatchEngineV2TrajectoryService.sampleCue(cue, cue.durationMs * 0.63);
  assert.ok(samplePoint.x >= 0 && samplePoint.x <= snapshot.spatial.pitchWidth);
  assert.ok(samplePoint.y >= 0 && samplePoint.y <= snapshot.spatial.pitchLength);
  assert.ok(samplePoint.z >= 0);
});

// A clearly superior passer should be selected much more frequently, while
// deterministic RNG still prevents him from owning every single action.
const biasSample = CupSampleMatchFactory.makeInput(913, 'EQUAL');
const midfieldStarterId = biasSample.home.lineup.startingXI.find(id =>
  biasSample.home.players.find(player => player.id === id)?.position === 'MID'
)!;
assert.ok(midfieldStarterId);
biasSample.home.players = biasSample.home.players.map(player => ({
  ...player,
  attributes: {
    ...player.attributes,
    passing: player.id === midfieldStarterId ? 100 : 8,
    vision: player.id === midfieldStarterId ? 100 : 8,
    technique: player.id === midfieldStarterId ? 100 : 8,
    mentality: player.id === midfieldStarterId ? 100 : 20,
  },
}));
const fatigue = Object.fromEntries([
  ...biasSample.home.players,
  ...biasSample.away.players,
].map(player => [player.id, 100]));
const attackingProfile = CupTeamProfileService.buildProfile(biasSample.home, fatigue, {});
const defendingProfile = CupTeamProfileService.buildProfile(biasSample.away, fatigue, {});
let eliteSelections = 0;
const selectedActions = new Set<string>();
const decisionSamples = 500;
for (let index = 0; index < decisionSamples; index += 1) {
  const decision = CupPlayerDecisionService.selectPossessionDecision({
    attacking: attackingProfile,
    defending: defendingProfile,
    zone: 'MIDFIELD',
    pattern: 'BUILD_UP',
    fatigue,
    instructions: biasSample.home.instructions,
    roll: salt => seededRandom('player_decision_bias', index * 5, salt),
  });
  if (decision.passer?.id === midfieldStarterId) eliteSelections += 1;
  selectedActions.add(decision.action);
}
assert.ok(eliteSelections > decisionSamples * 0.35, `Elite passer selected only ${eliteSelections} times.`);
assert.ok(eliteSelections < decisionSamples, 'Minimum RNG must leave room for other passers.');
assert.ok(selectedActions.has('PASS'));
assert.ok(selectedActions.has('DIRECT_PASS'));
assert.ok(selectedActions.has('DRIBBLE'));

// In an advanced attack the carrier may recycle possession through midfield,
// but he must not suddenly send an ordinary attacking pass all the way back to
// his own central defender or goalkeeper.
const forwardCarrierId = attackingProfile.forwards[0]?.id;
assert.ok(forwardCarrierId);
for (let index = 0; index < 200; index += 1) {
  const decision = CupPlayerDecisionService.selectPossessionDecision({
    attacking: attackingProfile,
    defending: defendingProfile,
    zone: 'FINAL_THIRD',
    pattern: 'BUILD_UP',
    fatigue,
    currentCarrierId: forwardCarrierId,
    instructions: biasSample.home.instructions,
    roll: salt => seededRandom('advanced_forward_connection', index * 5, salt),
  });
  assert.notEqual(decision.receiver?.position, 'DEF', 'Napastnik w tercji ataku nie powinien podawać bezpośrednio do głębokiego obrońcy.');
  assert.notEqual(decision.receiver?.position, 'GK');
}

// Quiet play now advances at 1 real second per match minute, so an idle
// 90-minute stretch clamps to full time well inside 750 simulated seconds.
// View and transmission changes are presentation-only preferences.
let playback = MatchEngineV2PlaybackService.create({ renderMode: 'INTERACTIVE' });
playback = MatchEngineV2PlaybackService.setPaused(playback, false);
playback = MatchEngineV2PlaybackService.advance(playback, 750 * 1000);
assert.equal(playback.targetSecond, 90 * 60);
assert.equal(playback.paused, true);
const engineSecondBeforeViewChange = runtime.core.state.second;
playback = MatchEngineV2PlaybackService.setRenderMode(playback, 'CLASSIC');
playback = MatchEngineV2PlaybackService.setTransmissionMode(playback, 'ALL_ACTIONS');
assert.equal(runtime.core.state.second, engineSecondBeforeViewChange);
const highlights = MatchEngineV2PlaybackService.selectVisibleCues(playback, snapshot.spatial.visualCues);
assert.ok(highlights.length > 0);
assert.ok(highlights.length < snapshot.spatial.visualCues.length);
assert.ok(highlights.every(cue => ['GOAL', 'SAVE', 'SHOT', 'RESTART', 'FOUL'].includes(cue.kind)));

console.log('MatchEngineV2ActionTrajectoryTests: OK', {
  score: `${snapshot.result.homeScore}:${snapshot.result.awayScore}`,
  passes: passes.length,
  interceptions: interceptions.length,
  tackles: tackles.length,
  visualCues: snapshot.spatial.visualCues.length,
  elitePasserShare: Number((eliteSelections / decisionSamples).toFixed(3)),
  normalSpeedRealMinutes: 12.5,
  highlightCues: highlights.length,
  narrowestOutfieldLengthSpan: Number(narrowestOutfieldLengthSpan.toFixed(2)),
  narrowestOutfieldWidthSpan: Number(narrowestOutfieldWidthSpan.toFixed(2)),
  smallestRenderedPlayerDistance: Number(smallestRenderedPlayerDistance.toFixed(2)),
});
