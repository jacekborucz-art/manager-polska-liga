import assert from 'node:assert/strict';
import { MatchEventType } from '../types';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
  MatchEngineV2BallService,
  MatchEngineV2FrameControllerService,
  MatchEngineV2PlaybackService,
  type MatchEngineV2BallSpatialState,
  type MatchEngineV2Snapshot,
  type MatchEngineV2VisualCue,
} from '../services/match/engines/v2';

const sample = CupSampleMatchFactory.makeInput(2442, 'EQUAL');
const runtime = MatchEngineV2.createMatch({
  seed: 'match_engine_v2_spatial_continuity',
  home: sample.home,
  away: sample.away,
  environment: sample.environment,
  rules: LEAGUE_MATCH_RULES_V2,
  config: { tickSeconds: 5 },
});
const kickoff = MatchEngineV2.snapshot(runtime);
const activeKickoffPlayers = Object.values(kickoff.spatial.players).filter(player => player.isOnPitch);
const outfieldAtCentre = activeKickoffPlayers.filter(player =>
  player.role !== 'GK' && Math.abs(player.position.y - 52.5) < 3.6
);
assert.ok(outfieldAtCentre.length <= 2, `Przy rozpoczęciu w środku znalazło się ${outfieldAtCentre.length} zawodników.`);

const kickoffSide = runtime.core.state.firstHalfKickOffSide;
const kicker = outfieldAtCentre.find(player => player.side === kickoffSide) ??
  activeKickoffPlayers.find(player => player.side === kickoffSide && player.role !== 'GK')!;
const kickoffCue: MatchEngineV2VisualCue = {
  id: 'continuity_kickoff_cue',
  sourceEventId: 'continuity_kickoff_event',
  sourceEventType: MatchEventType.KICK_OFF,
  kind: 'RESTART',
  atSecond: 5,
  side: kickoffSide,
  actorId: kicker.playerId,
  start: { x: 34, y: 52.5 },
  end: { x: 34, y: kickoffSide === 'HOME' ? 55.3 : 49.7 },
  durationMs: 1100,
};
const kickoffScene: MatchEngineV2Snapshot = {
  ...kickoff,
  second: 5,
  spatial: { ...kickoff.spatial, visualCues: [kickoffCue] },
};
const playing = MatchEngineV2PlaybackService.setPaused(MatchEngineV2PlaybackService.create(), false);
const frameController = MatchEngineV2FrameControllerService.create(kickoff, 0);
MatchEngineV2FrameControllerService.advance(frameController, kickoffScene, playing, 100);
const kickoffFrame = MatchEngineV2FrameControllerService.advance(frameController, kickoffScene, playing, 570);
const renderedAtCentre = activeKickoffPlayers.filter(player =>
  player.role !== 'GK' && Math.abs(kickoffFrame.players[player.playerId].position.y - 52.5) < 3.6
);
assert.ok(renderedAtCentre.length <= 2, `SVG ustawił ${renderedAtCentre.length} zawodników w jednej linii przy środku.`);

let previous = kickoff;
let maximumTickTravel = 0;
for (let second = 5; second <= 20 * 60; second += 5) {
  const current = MatchEngineV2.advanceTo(runtime, second);
  Object.values(current.spatial.players).filter(player => player.isOnPitch).forEach(player => {
    const before = previous.spatial.players[player.playerId];
    if (!before?.isOnPitch) return;
    const travel = Math.hypot(player.position.x - before.position.x, player.position.y - before.position.y);
    maximumTickTravel = Math.max(maximumTickTravel, travel);
    assert.ok(travel <= 9.5, `${player.playerId} przemieścił się o ${travel.toFixed(2)} m w jednym ticku.`);
    assert.ok(Math.hypot(player.velocity.x, player.velocity.y) <= player.metresPerSecond + 0.01);
    assert.ok(Number.isFinite(player.facingRadians));
  });

  const ball = current.spatial.ball;
  if (ball.phase === 'CONTROLLED') {
    assert.ok(ball.ownerId, 'Kontrolowana piłka musi mieć dokładnie jednego właściciela.');
    const owner = current.spatial.players[ball.ownerId!];
    assert.ok(owner?.isOnPitch);
    assert.ok(Math.hypot(ball.x - owner.position.x, ball.y - owner.position.y) < 0.01);
  } else {
    assert.equal(ball.ownerId, undefined, 'Piłka w locie, luźna lub martwa nie może mieć właściciela.');
  }
  previous = current;
}

const finalSnapshot = previous;
const spatialPasses = finalSnapshot.result.events.filter(event =>
  event.type === MatchEventType.PASS_COMPLETED && typeof event.detail?.passDistance === 'number'
);
assert.ok(spatialPasses.length >= 3, 'Decyzje podań muszą korzystać ze współrzędnych boiska.');
spatialPasses.forEach(event => {
  assert.equal(typeof event.detail?.startX, 'number');
  assert.equal(typeof event.detail?.startY, 'number');
  assert.equal(typeof event.detail?.endX, 'number');
  assert.equal(typeof event.detail?.endY, 'number');
  assert.equal(typeof event.detail?.laneClearance, 'number');
  assert.ok((event.detail?.passDistance as number) > 0);
});

const connectedCues = finalSnapshot.spatial.visualCues.filter(cue => cue.sequenceId);
for (let index = 1; index < connectedCues.length; index += 1) {
  const previousCue = connectedCues[index - 1];
  const cue = connectedCues[index];
  if (cue.sequenceId !== previousCue.sequenceId) continue;
  assert.ok(
    Math.hypot(cue.start.x - previousCue.end.x, cue.start.y - previousCue.end.y) < 0.01,
    `Piłka przeskoczyła wewnątrz sekwencji ${cue.sequenceId}.`,
  );
}

const baseBall: MatchEngineV2BallSpatialState = {
  x: 20,
  y: 30,
  z: 0,
  velocity: { x: 0, y: 0, z: 0 },
  ownerId: kicker.playerId,
  lastTouchPlayerId: kicker.playerId,
  lastUpdatedSecond: 10,
  phase: 'CONTROLLED',
};
const passCue: MatchEngineV2VisualCue = {
  ...kickoffCue,
  id: 'continuity_pass',
  sourceEventId: 'continuity_pass_event',
  sourceEventType: MatchEventType.PASS_COMPLETED,
  kind: 'PASS',
  actorId: kicker.playerId,
  secondaryPlayerId: activeKickoffPlayers.find(player => player.side === kicker.side && player.playerId !== kicker.playerId)?.playerId,
  atSecond: 15,
  start: { x: 20, y: 30 },
  end: { x: 30, y: 42 },
};
const travellingBall = MatchEngineV2BallService.resolve({
  previous: baseBall,
  latestCue: passCue,
  fallback: passCue.end,
  second: 15,
});
assert.equal(travellingBall.phase, 'TRAVELLING');
assert.equal(travellingBall.ownerId, undefined);
assert.equal(travellingBall.intendedReceiverId, passCue.secondaryPlayerId);

console.log('Match Engine V2 spatial continuity tests passed.', {
  maximumTickTravel: Number(maximumTickTravel.toFixed(3)),
  spatialPasses: spatialPasses.length,
  connectedCues: connectedCues.length,
});
