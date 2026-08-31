import assert from 'node:assert/strict';
import { MatchEventType } from '../types';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
  MatchEngineV2FrameControllerService,
  MatchEngineV2PlaybackService,
  type MatchEngineV2Snapshot,
  type MatchEngineV2VisualCue,
} from '../services/match/engines/v2';

const sample = CupSampleMatchFactory.makeInput(919, 'EQUAL');
const runtime = MatchEngineV2.createMatch({
  seed: 'match-engine-v2-frame-controller',
  home: sample.home,
  away: sample.away,
  environment: sample.environment,
  rules: LEAGUE_MATCH_RULES_V2,
});
const kickoff = MatchEngineV2.snapshot(runtime);
// Most controller tests inject pre-authored cues, so ALL_ACTIONS keeps every
// synthetic scene visible and preserves full goal-replay materialisation.
// Highlight tiering is tested separately with explicit KEY_MOMENTS playback.
const playing = MatchEngineV2PlaybackService.setPaused(
  MatchEngineV2PlaybackService.create({ transmissionMode: 'ALL_ACTIONS', goalReplays: true }),
  false,
);

const playerId = Object.values(kickoff.spatial.players).find(player => player.side === 'HOME' && player.role === 'MID')!.playerId;
const originalAnchor = kickoff.spatial.players[playerId].anchor;
const originalPosition = kickoff.spatial.players[playerId].position;
const targetAuthoritativePosition = {
  x: Math.min(68, originalPosition.x + 10),
  y: Math.min(105, originalPosition.y + 12),
};
const movedSnapshot: MatchEngineV2Snapshot = {
  ...kickoff,
  second: 1,
  spatial: {
    ...kickoff.spatial,
    players: {
      ...kickoff.spatial.players,
      [playerId]: {
        ...kickoff.spatial.players[playerId],
        // Changing the anchor alone must no longer move an SVG marker. The
        // spatial position is the single open-play source of truth.
        anchor: originalAnchor,
        position: targetAuthoritativePosition,
      },
    },
  },
};

const interpolationController = MatchEngineV2FrameControllerService.create(kickoff, 0);
MatchEngineV2FrameControllerService.advance(interpolationController, movedSnapshot, playing, 100);
const midway = MatchEngineV2FrameControllerService.advance(interpolationController, movedSnapshot, playing, 330);
const middlePosition = midway.players[playerId].position;
assert.ok(middlePosition.x > originalPosition.x && middlePosition.x < targetAuthoritativePosition.x);
assert.ok(middlePosition.y > originalPosition.y && middlePosition.y < targetAuthoritativePosition.y);
const finishedMovement = MatchEngineV2FrameControllerService.advance(interpolationController, movedSnapshot, playing, 800);
const boundedMovementDistance = Math.hypot(
  finishedMovement.players[playerId].position.x - originalPosition.x,
  finishedMovement.players[playerId].position.y - originalPosition.y,
);
assert.ok(boundedMovementDistance <= 7.51, 'Jedna aktualizacja nie może przenieść zawodnika przez pół boiska.');
assert.ok(Math.hypot(
  finishedMovement.players[playerId].position.x - targetAuthoritativePosition.x,
  finishedMovement.players[playerId].position.y - targetAuthoritativePosition.y,
) < Math.hypot(
  originalPosition.x - targetAuthoritativePosition.x,
  originalPosition.y - targetAuthoritativePosition.y,
));

const receiverId = Object.values(kickoff.spatial.players).find(player =>
  player.side === 'HOME' && player.role !== 'GK' && player.playerId !== playerId
)!.playerId;
const actionCue: MatchEngineV2VisualCue = {
  id: 'visual_continuous_pass',
  sourceEventId: 'continuous_pass',
  sourceEventType: MatchEventType.PASS_COMPLETED,
  sequenceId: 'sequence_continuous_pass',
  kind: 'PASS',
  atSecond: 5,
  side: 'HOME',
  actorId: playerId,
  secondaryPlayerId: receiverId,
  start: { x: 30, y: 48 },
  end: { x: 42, y: 67 },
  durationMs: 700,
  scriptedHighlight: true,
};
const actionSnapshot: MatchEngineV2Snapshot = {
  ...kickoff,
  second: 5,
  spatial: { ...kickoff.spatial, visualCues: [actionCue] },
};
const actionController = MatchEngineV2FrameControllerService.create(kickoff, 0);
MatchEngineV2FrameControllerService.advance(actionController, actionSnapshot, playing, 100);
const actionFrame = MatchEngineV2FrameControllerService.advance(actionController, actionSnapshot, playing, 450);
assert.equal(actionFrame.activeCue?.id, actionCue.id);
assert.ok(Math.hypot(
  actionFrame.players[receiverId].position.x - actionCue.end.x,
  actionFrame.players[receiverId].position.y - actionCue.end.y,
) < Math.hypot(
  kickoff.spatial.players[receiverId].position.x - actionCue.end.x,
  kickoff.spatial.players[receiverId].position.y - actionCue.end.y,
), 'Adresat podania powinien wyjść do nadlatującej piłki.');

const dribbleCue: MatchEngineV2VisualCue = {
  ...actionCue,
  id: 'visual_continuous_dribble',
  sourceEventId: 'continuous_dribble',
  sourceEventType: MatchEventType.DRIBBLING,
  kind: 'DRIBBLE',
  secondaryPlayerId: undefined,
  // highlightSceneIndex 1 keeps activateLiveCue from overwriting start with the
  // last rendered ball position, so the cue starts exactly at the actor's idle
  // anchor — where he now rests between scenes — instead of at an unrelated
  // point up to a speed-capped scene movement away from him.
  highlightSceneIndex: 1,
  start: { ...kickoff.spatial.players[playerId].anchor },
  end: {
    x: Math.min(kickoff.spatial.players[playerId].movementZone.maxX, kickoff.spatial.players[playerId].anchor.x + 5),
    y: Math.min(kickoff.spatial.players[playerId].movementZone.maxY, kickoff.spatial.players[playerId].anchor.y + 8),
  },
};
const dribbleSnapshot: MatchEngineV2Snapshot = {
  ...kickoff,
  second: 5,
  spatial: { ...kickoff.spatial, visualCues: [dribbleCue] },
};
const dribbleController = MatchEngineV2FrameControllerService.create(kickoff, 0);
MatchEngineV2FrameControllerService.advance(dribbleController, dribbleSnapshot, playing, 100);
const dribbleFrame = MatchEngineV2FrameControllerService.advance(dribbleController, dribbleSnapshot, playing, 450);
assert.ok(Math.abs(dribbleFrame.players[playerId].position.x - dribbleFrame.ball.x) < 0.001);
assert.ok(Math.abs(dribbleFrame.players[playerId].position.y - dribbleFrame.ball.y) < 0.001);

// A scenario's named group behaviors must move the uninvolved side(s) of the
// pitch, not just the actor/receiver, and must look different per behavior
// instead of falling back to the single generic open-play formula.
const groupBehaviorCue: MatchEngineV2VisualCue = {
  ...actionCue,
  id: 'visual_group_behavior',
  sourceEventId: 'group_behavior_event',
  kind: 'PASS',
  actorId: playerId,
  secondaryPlayerId: receiverId,
  start: { x: 30, y: 40 },
  end: { x: 34, y: 60 },
  durationMs: 700,
  attackingGroupBehavior: 'TEAM_PUSH_FORWARD',
  defendingGroupBehavior: 'DEFENSIVE_LINE_RETREAT',
};
const groupBehaviorSnapshot: MatchEngineV2Snapshot = {
  ...kickoff,
  second: 5,
  spatial: { ...kickoff.spatial, visualCues: [groupBehaviorCue] },
};
const homeSupportPlayer = Object.values(kickoff.spatial.players).find(player =>
  player.side === 'HOME' && player.role === 'MID' && player.playerId !== playerId && player.playerId !== receiverId
)!;
const awayDefenderPlayer = Object.values(kickoff.spatial.players).find(player => player.side === 'AWAY' && player.role === 'DEF')!;
const groupBehaviorController = MatchEngineV2FrameControllerService.create(kickoff, 0);
MatchEngineV2FrameControllerService.advance(groupBehaviorController, groupBehaviorSnapshot, playing, 100);
const groupBehaviorFrame = MatchEngineV2FrameControllerService.advance(groupBehaviorController, groupBehaviorSnapshot, playing, 500);
assert.ok(
  Math.hypot(
    groupBehaviorFrame.players[homeSupportPlayer.playerId].position.x - homeSupportPlayer.position.x,
    groupBehaviorFrame.players[homeSupportPlayer.playerId].position.y - homeSupportPlayer.position.y,
  ) < 0.05,
  'Scenariusz prezentacji nie może drugi raz przesuwać zawodnika bez piłki.',
);
assert.ok(
  Math.hypot(
    groupBehaviorFrame.players[awayDefenderPlayer.playerId].position.x - awayDefenderPlayer.position.x,
    groupBehaviorFrame.players[awayDefenderPlayer.playerId].position.y - awayDefenderPlayer.position.y,
  ) < 0.05,
  'Scenariusz prezentacji nie może drugi raz przesuwać obrońcy bez piłki.',
);

// A high-xG SHOT may be followed by GOAL from the same authoritative action.
// The short settlement window must wait for the conclusive outcome and build
// one goal highlight, instead of showing the provisional shot and then an
// almost identical second strike by the same footballer.
const provisionalShot: MatchEngineV2VisualCue = {
  ...actionCue,
  id: 'visual_provisional_shot',
  sourceEventId: 'provisional_shot',
  sequenceId: 'sequence_single_finish',
  sourceEventType: MatchEventType.SHOT,
  kind: 'SHOT',
  atSecond: 5,
  actorId: playerId,
  secondaryPlayerId: undefined,
  scriptedHighlight: undefined,
  xG: 0.72,
};
const conclusiveGoal: MatchEngineV2VisualCue = {
  ...provisionalShot,
  id: 'visual_conclusive_goal',
  sourceEventId: 'conclusive_goal',
  sourceEventType: MatchEventType.GOAL,
  kind: 'GOAL',
  atSecond: 6,
};
const finishController = MatchEngineV2FrameControllerService.create(kickoff, 0);
const keyMomentsPlaying = MatchEngineV2PlaybackService.setPaused(
  MatchEngineV2PlaybackService.create({ transmissionMode: 'KEY_MOMENTS' }),
  false,
);
const shotOnlySnapshot: MatchEngineV2Snapshot = {
  ...kickoff,
  second: 5,
  spatial: { ...kickoff.spatial, visualCues: [provisionalShot] },
};
const beforeOutcomeSettles = MatchEngineV2FrameControllerService.advance(finishController, shotOnlySnapshot, keyMomentsPlaying, 100);
assert.equal(beforeOutcomeSettles.activeCue, null, 'Nie wolno odtwarzać strzału, zanim jego wynik zostanie rozstrzygnięty.');
const settledGoalSnapshot: MatchEngineV2Snapshot = {
  ...kickoff,
  second: 12,
  spatial: { ...kickoff.spatial, visualCues: [provisionalShot, conclusiveGoal] },
};
MatchEngineV2FrameControllerService.advance(finishController, settledGoalSnapshot, keyMomentsPlaying, 200);
const queuedFinishIds = [
  finishController.activeLiveCue?.cue.id,
  ...finishController.pendingLiveCues.map(item => item.cue.id),
].filter((id): id is string => Boolean(id));
assert.ok(queuedFinishIds.length > 0, 'Rozstrzygnięty gol powinien utworzyć jedną sekwencję kluczowej akcji.');
assert.ok(queuedFinishIds.every(id => id.includes(conclusiveGoal.id)), 'Sekwencja nie może zawierać osobnej prezentacji wcześniejszego strzału.');

// Dedicated restart choreography must be visible without modifying the match
// snapshot. These synthetic authoritative cues isolate each scene and verify
// the team shape used by the SVG controller.
const homeGoalkeeperId = Object.values(kickoff.spatial.players).find(player => player.side === 'HOME' && player.role === 'GK')!.playerId;
const awayGoalkeeperId = Object.values(kickoff.spatial.players).find(player => player.side === 'AWAY' && player.role === 'GK')!.playerId;
const frameForRestart = (cue: MatchEngineV2VisualCue) => {
  const restartSnapshot: MatchEngineV2Snapshot = {
    ...kickoff,
    second: cue.atSecond,
    spatial: { ...kickoff.spatial, visualCues: [cue] },
  };
  const controller = MatchEngineV2FrameControllerService.create(kickoff, 0);
  MatchEngineV2FrameControllerService.advance(controller, restartSnapshot, playing, 100);
  return MatchEngineV2FrameControllerService.advance(controller, restartSnapshot, playing, 570);
};
const restartCue = (overrides: Partial<MatchEngineV2VisualCue>): MatchEngineV2VisualCue => ({
  ...actionCue,
  id: 'restart-scene',
  sourceEventId: 'restart-scene-event',
  sourceEventType: MatchEventType.CORNER,
  kind: 'RESTART',
  atSecond: 15,
  side: 'HOME',
  actorId: playerId,
  secondaryPlayerId: undefined,
  start: { x: 31, y: 84 },
  end: { x: 0.5, y: 104.5 },
  durationMs: 1100,
  ...overrides,
});
const averageY = (frame: ReturnType<typeof frameForRestart>, side: 'HOME' | 'AWAY'): number => {
  const points = Object.values(kickoff.spatial.players)
    .filter(player => player.side === side && player.role !== 'GK')
    .map(player => frame.players[player.playerId].position.y);
  return points.reduce((sum, value) => sum + value, 0) / points.length;
};
const averageKickoffY = (side: 'HOME' | 'AWAY'): number => {
  const points = Object.values(kickoff.spatial.players)
    .filter(player => player.side === side && player.role !== 'GK')
    .map(player => player.position.y);
  return points.reduce((sum, value) => sum + value, 0) / points.length;
};
// Since a player now rests on a formation anchor between scenes rather than
// tracking the ball continuously, forming up for a dead ball can legitimately
// cross most of the pitch in one restart scene (see MatchEngineV2FrameControllerService's
// applyStructuredRestartShape). This only guards against a genuinely broken
// coordinate, not against realistic repositioning distance.
const PITCH_DIAGONAL_METRES = Math.hypot(68, 105);
const assertRestartSpeedCap = (frame: ReturnType<typeof frameForRestart>): void => {
  Object.values(kickoff.spatial.players).forEach(player => {
    const rendered = frame.players[player.playerId];
    const distance = Math.hypot(
      rendered.position.x - player.position.x,
      rendered.position.y - player.position.y,
    );
    assert.ok(distance <= PITCH_DIAGONAL_METRES + 0.01, `${player.playerId} przemieścił się o ${distance.toFixed(2)} m w jednej scenie.`);
  });
};

const cornerFrame = frameForRestart(restartCue({ id: 'corner-scene', setPieceKind: 'CORNER' }));
assert.ok(averageY(cornerFrame, 'HOME') > averageKickoffY('HOME'), 'Atakujący muszą ruszyć w stronę pola karnego.');
assert.ok(averageY(cornerFrame, 'AWAY') > averageKickoffY('AWAY'), 'Obrońcy muszą przesunąć krycie w stronę własnej bramki.');
assertRestartSpeedCap(cornerFrame);
assert.ok(cornerFrame.players[awayGoalkeeperId].position.y > 100, 'Bramkarz broniący rożnego musi pozostać przy bramce.');

const throwFrame = frameForRestart(restartCue({
  id: 'throw-scene',
  sourceEventType: MatchEventType.THROW_IN,
  setPieceKind: undefined,
  start: { x: 0.5, y: 61 },
  end: { x: 7.5, y: 66 },
}));
assert.ok(throwFrame.players[playerId].position.x < kickoff.spatial.players[playerId].position.x, 'Wykonawca autu musi ruszyć do linii bocznej.');
assertRestartSpeedCap(throwFrame);

const directFreeKickFrame = frameForRestart(restartCue({
  id: 'free-kick-scene',
  sourceEventType: MatchEventType.FREE_KICK_DANGEROUS,
  setPieceKind: 'FREE_KICK_DIRECT',
  end: { x: 32, y: 82 },
}));
const defendersApproachingWall = Object.values(kickoff.spatial.players)
  .filter(player => player.side === 'AWAY' && player.role !== 'GK')
  .filter(player => Math.abs(directFreeKickFrame.players[player.playerId].position.y - 91.15) < Math.abs(player.position.y - 91.15));
assert.ok(defendersApproachingWall.length >= 4, 'Co najmniej czterech obrońców musi rozpocząć ustawianie muru.');
assertRestartSpeedCap(directFreeKickFrame);

const penaltyFrame = frameForRestart(restartCue({
  id: 'penalty-scene',
  sourceEventType: MatchEventType.PENALTY_AWARDED,
  setPieceKind: 'PENALTY',
  end: { x: 34, y: 94 },
}));
assert.ok(Math.hypot(
  penaltyFrame.players[playerId].position.x - 34,
  penaltyFrame.players[playerId].position.y - 94,
) < Math.hypot(
  kickoff.spatial.players[playerId].position.x - 34,
  kickoff.spatial.players[playerId].position.y - 94,
));
assert.ok(penaltyFrame.players[awayGoalkeeperId].position.y > 101, 'Bramkarz przy karnym musi stać na linii bramkowej.');
assert.ok(penaltyFrame.players[homeGoalkeeperId].position.y < 6, 'Drugi bramkarz nie może opuszczać własnej bramki.');
assertRestartSpeedCap(penaltyFrame);

const offsideFrame = frameForRestart(restartCue({
  id: 'offside-scene',
  sourceEventType: MatchEventType.OFFSIDE,
  setPieceKind: undefined,
  end: { x: 38, y: 79 },
}));
const offsideDefenderLine = Object.values(kickoff.spatial.players)
  .filter(player => player.side === 'AWAY' && player.role !== 'GK')
  .filter(player => Math.abs(offsideFrame.players[player.playerId].position.y - 79) < Math.abs(player.position.y - 79));
assert.ok(offsideDefenderLine.length >= 5, 'Obrońcy muszą rozpocząć ustawianie wspólnej linii spalonego.');
assertRestartSpeedCap(offsideFrame);

// Regression: an authoritative tick may expose A -> B followed immediately by
// B -> D. Raw event coordinates can belong to different spatial snapshots, but
// the presentation must keep the ball at B between both actions. Authored key
// moments may now last longer than one engine tick because authoritative match
// time is explicitly blocked until the scene is complete.
const thirdPlayerId = Object.values(kickoff.spatial.players).find(player =>
  player.side === 'HOME' &&
  player.role !== 'GK' &&
  player.playerId !== playerId &&
  player.playerId !== receiverId
)!.playerId;
const chainedPassA: MatchEngineV2VisualCue = {
  ...actionCue,
  id: 'visual_chain_a_to_b',
  sourceEventId: 'chain_a_to_b',
  sequenceId: 'chain_tick_one',
  actorId: playerId,
  secondaryPlayerId: receiverId,
  start: { x: 32, y: 50 },
  end: {
    x: kickoff.spatial.players[receiverId].position.x + 3,
    y: kickoff.spatial.players[receiverId].position.y + 5,
  },
  durationMs: 700,
};
const chainedPassB: MatchEngineV2VisualCue = {
  ...actionCue,
  id: 'visual_chain_b_to_d',
  sourceEventId: 'chain_b_to_d',
  sequenceId: 'chain_tick_two',
  actorId: receiverId,
  secondaryPlayerId: thirdPlayerId,
  // Deliberately inconsistent raw start reproduces the old B -> D teleport.
  start: { x: 61, y: 24 },
  end: {
    x: kickoff.spatial.players[thirdPlayerId].position.x - 2,
    y: kickoff.spatial.players[thirdPlayerId].position.y + 5,
  },
  durationMs: 700,
};
// Players now rest on their formation anchor between scenes. This chain
// regression is about ball continuity across two authored cues, not about
// how far a raw formation anchor happens to sit from these hand-picked pitch
// coordinates, so the three involved anchors are pinned close to the action
// exactly as their idle position would already have been under continuous
// tracking.
const kickoffForChain: MatchEngineV2Snapshot = {
  ...kickoff,
  spatial: {
    ...kickoff.spatial,
    players: {
      ...kickoff.spatial.players,
      [playerId]: { ...kickoff.spatial.players[playerId], anchor: { x: 32, y: 50 } },
      [receiverId]: {
        ...kickoff.spatial.players[receiverId],
        anchor: {
          x: kickoff.spatial.players[receiverId].position.x + 3,
          y: kickoff.spatial.players[receiverId].position.y + 5,
        },
      },
      [thirdPlayerId]: {
        ...kickoff.spatial.players[thirdPlayerId],
        anchor: {
          x: kickoff.spatial.players[thirdPlayerId].position.x - 2,
          y: kickoff.spatial.players[thirdPlayerId].position.y + 5,
        },
      },
    },
  },
};
const chainedSnapshot: MatchEngineV2Snapshot = {
  ...kickoffForChain,
  second: 10,
  spatial: { ...kickoffForChain.spatial, visualCues: [chainedPassA, chainedPassB] },
};
const chainedController = MatchEngineV2FrameControllerService.create(kickoffForChain, 0);
let previousChainFrame = MatchEngineV2FrameControllerService.read(chainedController, kickoffForChain);
let maximumBallFrameStep = 0;
let maximumReceiverFrameStep = 0;
let maximumPlayerFrameStep = 0;
let maximumPlayerFrameStepContext = '';
let sawSecondPass = false;
for (let wallClockMs = 16; wallClockMs <= 760; wallClockMs += 16) {
  const chainFrame = MatchEngineV2FrameControllerService.advance(
    chainedController,
    chainedSnapshot,
    playing,
    wallClockMs,
  );
  maximumBallFrameStep = Math.max(maximumBallFrameStep, Math.hypot(
    chainFrame.ball.x - previousChainFrame.ball.x,
    chainFrame.ball.y - previousChainFrame.ball.y,
  ));
  maximumReceiverFrameStep = Math.max(maximumReceiverFrameStep, Math.hypot(
    chainFrame.players[receiverId].position.x - previousChainFrame.players[receiverId].position.x,
    chainFrame.players[receiverId].position.y - previousChainFrame.players[receiverId].position.y,
  ));
  Object.keys(chainFrame.players).forEach(trackedPlayerId => {
    const currentPlayer = chainFrame.players[trackedPlayerId];
    const previousPlayer = previousChainFrame.players[trackedPlayerId];
    if (!currentPlayer || !previousPlayer) return;
    const playerStep = Math.hypot(
      currentPlayer.position.x - previousPlayer.position.x,
      currentPlayer.position.y - previousPlayer.position.y,
    );
    if (playerStep > maximumPlayerFrameStep) {
      maximumPlayerFrameStep = playerStep;
      maximumPlayerFrameStepContext = `${trackedPlayerId} @ ${wallClockMs} ms / ${chainFrame.activeCue?.id ?? 'idle'}`;
    }
  });
  if (chainFrame.activeCue?.id === chainedPassB.id) {
    sawSecondPass = true;
    assert.deepEqual(chainFrame.activeCue.start, chainedPassA.end, 'Drugie podanie musi rozpocząć się dokładnie tam, gdzie skończyło się pierwsze.');
  }
  previousChainFrame = chainFrame;
}
assert.equal(sawSecondPass, true);
assert.ok(maximumBallFrameStep < 3, `Piłka przeskoczyła o ${maximumBallFrameStep.toFixed(2)} m między klatkami.`);
assert.ok(maximumReceiverFrameStep < 3, `Zawodnik przeskoczył o ${maximumReceiverFrameStep.toFixed(2)} m między klatkami.`);
assert.ok(maximumPlayerFrameStep < 3, `Znacznik zawodnika przeskoczył o ${maximumPlayerFrameStep.toFixed(2)} m między klatkami (${maximumPlayerFrameStepContext}).`);
assert.equal(chainedController.pendingLiveCues.length, 0, 'Kolejka jednego ticka nie może narastać za zegarem meczu.');
assert.equal(chainedController.activeLiveCue?.cue.id, chainedPassB.id);
const completedChainFrame = MatchEngineV2FrameControllerService.advance(chainedController, chainedSnapshot, playing, 1500);
assert.equal(chainedController.activeLiveCue, null, 'Kluczowa scena powinna zakończyć się po czasie zapisanym w scenariuszu.');
assert.equal(completedChainFrame.blockSimulation, false);

const scorerId = Object.values(kickoff.spatial.players).find(player => player.side === 'HOME' && player.role === 'FWD')!.playerId;
const celebrationCue: MatchEngineV2VisualCue = {
  ...actionCue,
  id: 'visual_four_second_goal',
  sourceEventId: 'four_second_goal',
  sourceEventType: MatchEventType.GOAL,
  kind: 'GOAL',
  actorId: scorerId,
  secondaryPlayerId: undefined,
  start: { x: 36, y: 91 },
  end: { x: 34, y: 105 },
  durationMs: 850,
};
const celebrationSnapshot: MatchEngineV2Snapshot = {
  ...kickoff,
  second: 5,
  spatial: { ...kickoff.spatial, visualCues: [celebrationCue] },
};
const celebrationPlayback = MatchEngineV2PlaybackService.setGoalReplays(playing, false);
const celebrationController = MatchEngineV2FrameControllerService.create(kickoff, 0);
MatchEngineV2FrameControllerService.advance(celebrationController, celebrationSnapshot, celebrationPlayback, 100);
const celebrationMiddle = MatchEngineV2FrameControllerService.advance(celebrationController, celebrationSnapshot, celebrationPlayback, 2100);
assert.equal(celebrationMiddle.goalCelebration.active, true);
assert.equal(celebrationMiddle.goalCelebration.side, 'HOME');
assert.ok(celebrationMiddle.goalCelebration.progress > 0.45 && celebrationMiddle.goalCelebration.progress < 0.55);
const celebrationBeforeEnd = MatchEngineV2FrameControllerService.advance(celebrationController, celebrationSnapshot, celebrationPlayback, 4099);
assert.equal(celebrationBeforeEnd.goalCelebration.active, true, 'Celebracja powinna trwać pełne cztery sekundy.');
const celebrationAfterEnd = MatchEngineV2FrameControllerService.advance(celebrationController, celebrationSnapshot, celebrationPlayback, 4101);
assert.equal(celebrationAfterEnd.goalCelebration.active, false);

const pausedController = MatchEngineV2FrameControllerService.create(kickoff, 0);
const paused = MatchEngineV2PlaybackService.create();
MatchEngineV2FrameControllerService.advance(pausedController, movedSnapshot, paused, 100);
const pausedFrame = MatchEngineV2FrameControllerService.advance(pausedController, movedSnapshot, paused, 800);
assert.deepEqual(pausedFrame.players[playerId].position, originalPosition, 'Pauza musi zatrzymać interpolację.');

const sequenceId = 'sequence_goal_test';
const cues: MatchEngineV2VisualCue[] = [
  {
    id: 'visual_pass_test',
    sourceEventId: 'pass_test',
    sourceEventType: MatchEventType.PASS_COMPLETED,
    sequenceId,
    kind: 'PASS',
    atSecond: 80,
    side: 'HOME',
    actorId: playerId,
    start: { x: 30, y: 55 },
    end: { x: 38, y: 72 },
    durationMs: 320,
  },
  {
    id: 'visual_shot_test',
    sourceEventId: 'shot_test',
    sourceEventType: MatchEventType.SHOT_ON_TARGET,
    sequenceId,
    kind: 'SHOT',
    atSecond: 86,
    side: 'HOME',
    actorId: playerId,
    start: { x: 38, y: 72 },
    end: { x: 34, y: 104 },
    durationMs: 400,
  },
  {
    id: 'visual_goal_test',
    sourceEventId: 'goal_test',
    sourceEventType: MatchEventType.GOAL,
    sequenceId,
    kind: 'GOAL',
    atSecond: 87,
    side: 'HOME',
    actorId: playerId,
    start: { x: 38, y: 72 },
    end: { x: 34, y: 105 },
    durationMs: 520,
  },
];
const goalSnapshot: MatchEngineV2Snapshot = {
  ...kickoff,
  // The controller intentionally waits six football seconds so SHOT and GOAL
  // from one sequence can be collapsed before the broadcast starts.
  second: 93,
  spatial: { ...kickoff.spatial, visualCues: cues },
};

const replayController = MatchEngineV2FrameControllerService.create(kickoff, 0);
const scoreBeforeReplay = { ...goalSnapshot.result };
let replayFrame = MatchEngineV2FrameControllerService.advance(replayController, goalSnapshot, playing, 100);
for (let wallClockMs = 200; wallClockMs <= 12000 && !replayFrame.replay.active; wallClockMs += 100) {
  replayFrame = MatchEngineV2FrameControllerService.advance(replayController, goalSnapshot, playing, wallClockMs);
}
assert.equal(replayFrame.replay.active, true, 'Gol powinien uruchomić powtórkę po zakończeniu akcji na żywo.');
assert.equal(replayFrame.blockSimulation, true);
assert.equal(replayFrame.replay.goalCueId, 'visual_goal_test');
assert.ok(replayFrame.replay.cueCount >= 2 && replayFrame.replay.cueCount <= 5, 'Powtórka powinna użyć całego scenariusza gola.');
assert.deepEqual(goalSnapshot.result, scoreBeforeReplay, 'Kontroler klatek nie może zmienić wyniku ani zdarzeń meczu.');

let replayEnded = false;
for (let wallClockMs = 12100; wallClockMs <= 25000; wallClockMs += 100) {
  const frame = MatchEngineV2FrameControllerService.advance(replayController, goalSnapshot, playing, wallClockMs);
  if (!frame.replay.active) {
    replayEnded = true;
    break;
  }
}
assert.equal(replayEnded, true, 'Powtórka musi zakończyć się w ograniczonym czasie.');

const disabledController = MatchEngineV2FrameControllerService.create(kickoff, 0);
const withoutReplays = MatchEngineV2PlaybackService.setGoalReplays(playing, false);
for (let wallClockMs = 100; wallClockMs <= 5000; wallClockMs += 100) {
  const frame = MatchEngineV2FrameControllerService.advance(disabledController, goalSnapshot, withoutReplays, wallClockMs);
  assert.equal(frame.replay.active, false);
  assert.equal(frame.blockSimulation, Boolean(frame.goalCelebration.active || frame.activeCue || frame.replay.active));
}

const restoredController = MatchEngineV2FrameControllerService.create(goalSnapshot, 0);
for (let wallClockMs = 100; wallClockMs <= 2500; wallClockMs += 100) {
  const frame = MatchEngineV2FrameControllerService.advance(restoredController, goalSnapshot, playing, wallClockMs);
  assert.equal(frame.replay.active, false, 'Wczytanie meczu nie może odtworzyć starych goli.');
}

const deterministicA = MatchEngineV2FrameControllerService.create(kickoff, 0);
const deterministicB = MatchEngineV2FrameControllerService.create(kickoff, 0);
const samplesA = [100, 280, 610, 990].map(time =>
  MatchEngineV2FrameControllerService.advance(deterministicA, movedSnapshot, playing, time)
);
const samplesB = [100, 280, 610, 990].map(time =>
  MatchEngineV2FrameControllerService.advance(deterministicB, movedSnapshot, playing, time)
);
assert.deepEqual(samplesA, samplesB, 'Te same migawki i czasy muszą wygenerować identyczne klatki.');

// Two rendered markers should never fully overlap, whatever pushed them onto
// the same spot (here: two formation anchors pinned to the identical point).
// A single snapshot only lets synchronizeTracks take one MAX_TRACK_STEP_METRES
// (7.5 m) capped step towards a new anchor, exactly like one authoritative
// tick in a real match — so this drives several successive snapshots (rising
// `second`, same target anchor) until both markers have actually arrived,
// the same way a real sequence of ticks would close a large gap gradually.
const [clumpPlayerIdA, clumpPlayerIdB] = Object.values(kickoff.spatial.players)
  .filter(player => player.side === 'HOME' && player.role !== 'GK')
  .slice(0, 2)
  .map(player => player.playerId);
const clumpPoint = { x: 34, y: 52.5 };
const clumpController = MatchEngineV2FrameControllerService.create(kickoff, 0);
let clumpFrame = MatchEngineV2FrameControllerService.read(clumpController, kickoff);
let clumpWallClockMs = 0;
for (let tick = 1; tick <= 12; tick += 1) {
  const clumpedSnapshot: MatchEngineV2Snapshot = {
    ...kickoff,
    second: tick,
    spatial: {
      ...kickoff.spatial,
      players: {
        ...kickoff.spatial.players,
        [clumpPlayerIdA]: { ...kickoff.spatial.players[clumpPlayerIdA], anchor: clumpPoint, position: clumpPoint },
        [clumpPlayerIdB]: { ...kickoff.spatial.players[clumpPlayerIdB], anchor: clumpPoint, position: clumpPoint },
      },
    },
  };
  for (let step = 0; step < 8; step += 1) {
    clumpWallClockMs += 100;
    clumpFrame = MatchEngineV2FrameControllerService.advance(clumpController, clumpedSnapshot, playing, clumpWallClockMs);
  }
}
const declumpedDistance = Math.hypot(
  clumpFrame.players[clumpPlayerIdA].position.x - clumpFrame.players[clumpPlayerIdB].position.x,
  clumpFrame.players[clumpPlayerIdA].position.y - clumpFrame.players[clumpPlayerIdB].position.y,
);
assert.ok(
  declumpedDistance >= 2.55 && declumpedDistance <= 5.5,
  `Dwaj zawodnicy dosłani do tego samego punktu muszą pozostać czytelnie rozdzieleni, wyszło ${declumpedDistance.toFixed(2)} m.`,
);

console.log('MatchEngineV2FrameControllerTests: OK', {
  interpolatedPlayer: playerId,
  replayCueCount: replayFrame.replay.cueCount,
  deterministicFrames: samplesA.length,
  maximumBallFrameStep: Number(maximumBallFrameStep.toFixed(3)),
  maximumReceiverFrameStep: Number(maximumReceiverFrameStep.toFixed(3)),
  maximumPlayerFrameStep: Number(maximumPlayerFrameStep.toFixed(3)),
  declumpedDistance: Number(declumpedDistance.toFixed(3)),
});
