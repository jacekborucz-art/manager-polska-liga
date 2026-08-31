import assert from 'node:assert/strict';
import { MatchEventType } from '../types';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
  type MatchEngineV2Input,
} from '../services/match/engines/v2';

const makeLeagueInput = (seed: number): MatchEngineV2Input => {
  const sample = CupSampleMatchFactory.makeInput(seed, 'EQUAL');
  return {
    seed: `league_v2_core_${seed}`,
    home: sample.home,
    away: sample.away,
    environment: sample.environment,
    halfTimeTalks: sample.halfTimeTalks,
    calibration: sample.calibration,
    rules: LEAGUE_MATCH_RULES_V2,
    config: { tickSeconds: 5, calibrationMode: false },
  };
};

// Creating a runtime must never pre-calculate a score or future event stream.
const kickoff = MatchEngineV2.createMatch(makeLeagueInput(101));
const kickoffSnapshot = MatchEngineV2.snapshot(kickoff);
assert.equal(kickoffSnapshot.second, 0);
assert.equal(kickoffSnapshot.result.events.length, 0);
assert.equal(kickoffSnapshot.result.winner, undefined);
assert.equal(MatchEngineV2.finalize(kickoff), null);

// The renderer receives exactly 22 active players at kick-off and all SVG
// coordinates remain inside the canonical 105 x 68 metre pitch.
const kickoffPlayers = Object.values(kickoffSnapshot.spatial.players);
assert.equal(kickoffPlayers.filter(player => player.isOnPitch).length, 22);
kickoffPlayers.forEach(player => {
  assert.ok(player.position.x >= 0 && player.position.x <= kickoffSnapshot.spatial.pitchWidth);
  assert.ok(player.position.y >= 0 && player.position.y <= kickoffSnapshot.spatial.pitchLength);
  assert.ok(player.anchor.x >= player.movementZone.minX && player.anchor.x <= player.movementZone.maxX);
  assert.ok(player.anchor.y >= player.movementZone.minY && player.anchor.y <= player.movementZone.maxY);
});
const kickoffSide = kickoff.core.state.firstHalfKickOffSide;
const kickoffTeam = kickoffSide === 'HOME' ? kickoff.core.input.home : kickoff.core.input.away;
const kickoffMidfielderId = kickoffTeam.lineup.startingXI.find(playerId =>
  kickoffTeam.players.find(player => player.id === playerId)?.position === 'MID'
);
assert.ok(kickoffMidfielderId);
assert.deepEqual(kickoffSnapshot.spatial.players[kickoffMidfielderId].position, { x: 34, y: 52.5 });
const homeGoalkeeper = kickoffPlayers.find(player => player.side === 'HOME' && player.role === 'GK');
const awayGoalkeeper = kickoffPlayers.find(player => player.side === 'AWAY' && player.role === 'GK');
assert.ok(homeGoalkeeper && homeGoalkeeper.position.y <= 8, 'Bramkarz gospodarzy musi zaczynać przy własnej bramce.');
assert.ok(awayGoalkeeper && awayGoalkeeper.position.y >= 97, 'Bramkarz gości musi zaczynać przy własnej bramce.');
const kickoffOutfieldAnchors = kickoffPlayers.filter(player => player.role !== 'GK').map(player => player.anchor);
assert.ok(
  Math.max(...kickoffOutfieldAnchors.map(point => point.y)) - Math.min(...kickoffOutfieldAnchors.map(point => point.y)) >= 58,
  'Ustawienie obu drużyn powinno wykorzystywać większość długości boiska.',
);
assert.ok(
  Math.max(...kickoffOutfieldAnchors.map(point => point.x)) - Math.min(...kickoffOutfieldAnchors.map(point => point.x)) >= 43,
  'Ustawienie obu drużyn powinno wykorzystywać większość szerokości boiska.',
);

// Identical seeds and clocks must produce identical authoritative histories.
const first = MatchEngineV2.createMatch(makeLeagueInput(202));
const second = MatchEngineV2.createMatch(makeLeagueInput(202));
const firstAt20 = MatchEngineV2.advanceTo(first, 20 * 60);
const secondAt20 = MatchEngineV2.advanceTo(second, 20 * 60);
assert.deepEqual(firstAt20.result.events, secondAt20.result.events);
assert.equal(firstAt20.result.homeScore, secondAt20.result.homeScore);
assert.equal(firstAt20.result.awayScore, secondAt20.result.awayScore);
assert.ok(firstAt20.spatial.ball.ownerId);
assert.equal(firstAt20.spatial.players[firstAt20.spatial.ball.ownerId!]?.isOnPitch, true);
assert.ok(firstAt20.spatial.ball.x >= 0 && firstAt20.spatial.ball.x <= firstAt20.spatial.pitchWidth);
assert.ok(firstAt20.spatial.ball.y >= 0 && firstAt20.spatial.ball.y <= firstAt20.spatial.pitchLength);
assert.equal(firstAt20.spatial.lastEventIndex, firstAt20.result.events.length);
assert.equal(firstAt20.spatial.visualCues.length, firstAt20.result.events.length);
firstAt20.spatial.visualCues.forEach(cue => {
  assert.ok(cue.start.x >= 0 && cue.start.x <= firstAt20.spatial.pitchWidth);
  assert.ok(cue.start.y >= 0 && cue.start.y <= firstAt20.spatial.pitchLength);
  assert.ok(cue.end.x >= 0 && cue.end.x <= firstAt20.spatial.pitchWidth);
  assert.ok(cue.end.y >= 0 && cue.end.y <= firstAt20.spatial.pitchLength);
});
const activeSpatialPlayers = Object.values(firstAt20.spatial.players).filter(player => player.isOnPitch);
activeSpatialPlayers.forEach(player => {
  assert.ok(player.position.x >= player.movementZone.minX && player.position.x <= player.movementZone.maxX);
  assert.ok(player.position.y >= player.movementZone.minY && player.position.y <= player.movementZone.maxY);
});
const homeOutfieldMovementVectors = activeSpatialPlayers
  .filter(player => player.side === 'HOME' && player.role !== 'GK')
  .map(player => `${(player.target.x - player.anchor.x).toFixed(2)}:${(player.target.y - player.anchor.y).toFixed(2)}`);
assert.ok(new Set(homeOutfieldMovementVectors).size >= 6, 'Zawodnicy powinni otrzymywać indywidualne cele ruchu.');
const activeHomeGoalkeeper = activeSpatialPlayers.find(player => player.side === 'HOME' && player.role === 'GK');
const activeAwayGoalkeeper = activeSpatialPlayers.find(player => player.side === 'AWAY' && player.role === 'GK');
assert.ok(activeHomeGoalkeeper && activeHomeGoalkeeper.position.y <= 12, 'Bramkarz gospodarzy wyszedł zbyt wysoko.');
assert.ok(activeAwayGoalkeeper && activeAwayGoalkeeper.position.y >= 93, 'Bramkarz gości wyszedł zbyt wysoko.');
assert.ok(activeSpatialPlayers.some(player => player.movementIntent === 'SUPPORT' || player.movementIntent === 'RUN_BEHIND'));
assert.ok(activeSpatialPlayers.some(player => player.movementIntent === 'PRESS' || player.movementIntent === 'RECOVER'));
for (let firstIndex = 0; firstIndex < activeSpatialPlayers.length; firstIndex += 1) {
  for (let secondIndex = firstIndex + 1; secondIndex < activeSpatialPlayers.length; secondIndex += 1) {
    const firstPlayer = activeSpatialPlayers[firstIndex];
    const secondPlayer = activeSpatialPlayers[secondIndex];
    // Measure the separation after converting metres to the actual SVG pitch.
    // This guards the visible 36-pixel tokens, not only abstract coordinates.
    const renderedDistance = Math.hypot(
      (firstPlayer.position.x - secondPlayer.position.x) * 540 / 68,
      (firstPlayer.position.y - secondPlayer.position.y) * 720 / 105,
    );
    assert.ok(renderedDistance >= 35.5, `Player icons overlap: ${firstPlayer.playerId} / ${secondPlayer.playerId}`);
  }
}

// Snapshots are detached from the authoritative spatial runtime. A UI mistake
// cannot move a real engine player or contaminate a later replay.
const detachedPlayerId = Object.keys(firstAt20.spatial.players)[0];
const authoritativeX = first.spatial.players[detachedPlayerId].position.x;
firstAt20.spatial.players[detachedPlayerId].position.x = -999;
assert.equal(first.spatial.players[detachedPlayerId].position.x, authoritativeX);
const detachedReport = MatchEngineV2.snapshot(first);
const authoritativeEventCount = first.core.state.events.length;
detachedReport.result.events.push({
  id: 'ui-mutation-must-not-enter-engine',
  second: 0,
  minute: 1,
  text: 'Detached UI-only event.',
  type: firstAt20.result.events[0]?.type,
} as typeof firstAt20.result.events[number]);
assert.equal(first.core.state.events.length, authoritativeEventCount);

// A tactical command changes only the future and receives an exact clock stamp.
const historyBeforeCommand = [...firstAt20.result.events];
assert.equal(MatchEngineV2.applyCommand(first, {
  type: 'UPDATE_INSTRUCTIONS',
  atSecond: firstAt20.second,
  side: 'HOME',
  patch: { tempo: 'FAST', mindset: 'OFFENSIVE' },
}), true);
assert.equal(MatchEngineV2.applyCommand(first, {
  type: 'TOUCHLINE_INSTRUCTION',
  atSecond: firstAt20.second,
  side: 'HOME',
  instructionId: 'SPEED_UP',
}), true);
assert.equal(MatchEngineV2.applyCommand(first, {
  type: 'COACH_SHOUT',
  atSecond: firstAt20.second,
  side: 'HOME',
  shoutId: 'MOTIVATE',
}), true);
const firstAt23 = MatchEngineV2.advanceTo(first, 23 * 60);
assert.equal(firstAt23.coachState.HOME.activeInstruction?.id, 'SPEED_UP');
assert.equal(firstAt23.coachState.HOME.activeShout?.id, 'MOTIVATE');
assert.notEqual(firstAt23.result.finalState.coachEffects.HOME.initiativeModifier, 0);
assert.equal(firstAt23.coachPresentation.HOME.instruction?.label, 'PRZYSPIESZCIE GRĘ');
assert.equal(firstAt23.coachPresentation.HOME.instruction?.status, 'ACTIVE');
assert.equal(firstAt23.coachPresentation.HOME.shout?.label, 'ZMOTYWUJ');
assert.ok(firstAt23.coachPresentation.HOME.summary.includes('Polecenie aktywne'));
assert.equal(MatchEngineV2.applyCommand(second, {
  type: 'UPDATE_INSTRUCTIONS',
  atSecond: secondAt20.second,
  side: 'HOME',
  patch: { tempo: 'FAST', mindset: 'OFFENSIVE' },
}), true);
assert.equal(MatchEngineV2.applyCommand(second, {
  type: 'TOUCHLINE_INSTRUCTION',
  atSecond: secondAt20.second,
  side: 'HOME',
  instructionId: 'SPEED_UP',
}), true);
assert.equal(MatchEngineV2.applyCommand(second, {
  type: 'COACH_SHOUT',
  atSecond: secondAt20.second,
  side: 'HOME',
  shoutId: 'MOTIVATE',
}), true);
const secondAt23 = MatchEngineV2.advanceTo(second, 23 * 60);
assert.deepEqual(secondAt23.result.events, firstAt23.result.events);
assert.deepEqual(secondAt23.coachState, firstAt23.coachState);
const firstAt30 = MatchEngineV2.advanceTo(first, 30 * 60);
assert.deepEqual(
  firstAt30.result.events.filter(event => event.second <= firstAt20.second),
  historyBeforeCommand,
  'A command must not rewrite events which already happened.',
);

// A stale UI command is rejected instead of being applied at the wrong minute.
assert.equal(MatchEngineV2.applyCommand(first, {
  type: 'UPDATE_INSTRUCTIONS',
  atSecond: 20 * 60,
  side: 'HOME',
  patch: { tempo: 'SLOW' },
}), false);
assert.equal(first.commandLog.at(-1)?.reason, 'COMMAND_CLOCK_MISMATCH');

// Advancing backwards is a no-op and cannot consume random draws.
const beforeBackwardRequest = MatchEngineV2.snapshot(first);
const afterBackwardRequest = MatchEngineV2.advanceTo(first, 10 * 60);
assert.equal(afterBackwardRequest.second, beforeBackwardRequest.second);
assert.deepEqual(afterBackwardRequest.result.events, beforeBackwardRequest.result.events);

// A legal manual substitution is recorded once and the replaced player cannot return.
const playerOutId = first.core.input.home.lineup.startingXI.find((id): id is string => Boolean(id))!;
const playerInId = first.core.input.home.lineup.bench[0];
assert.ok(playerOutId && playerInId);
assert.equal(MatchEngineV2.applyCommand(first, {
  type: 'SUBSTITUTION',
  atSecond: first.core.state.second,
  side: 'HOME',
  playerOutId,
  playerInId,
}), true);
const substitutionSnapshot = MatchEngineV2.snapshot(first);
assert.equal(substitutionSnapshot.spatial.players[playerOutId].isOnPitch, false);
assert.equal(substitutionSnapshot.spatial.players[playerInId].isOnPitch, true);
assert.equal(
  Object.values(substitutionSnapshot.spatial.players).filter(player => player.isOnPitch).length,
  22,
);
const secondActivePlayer = first.core.input.home.lineup.startingXI.find(
  (id): id is string => Boolean(id) && id !== playerInId,
)!;
assert.ok(secondActivePlayer);
assert.equal(MatchEngineV2.applyCommand(first, {
  type: 'SUBSTITUTION',
  atSecond: first.core.state.second,
  side: 'HOME',
  playerOutId: secondActivePlayer,
  playerInId: playerOutId,
}), false);

// League rules end at full time, allow a draw and never start penalties.
const finalSnapshot = MatchEngineV2.advanceTo(first, 120 * 60);
assert.equal(finalSnapshot.isFinished, true);
assert.equal(finalSnapshot.phase, 'FINISHED');
assert.equal(finalSnapshot.result.decidedByPenalties, false);
assert.equal(finalSnapshot.result.penaltyScore, undefined);
assert.ok(MatchEngineV2.finalize(first));
assert.ok(finalSnapshot.result.finalState.firstHalfAddedTimeSeconds >= 60);
assert.ok(finalSnapshot.result.finalState.secondHalfAddedTimeSeconds >= 60);
assert.equal(
  finalSnapshot.result.finalState.addedTimeSeconds,
  finalSnapshot.result.finalState.firstHalfAddedTimeSeconds + finalSnapshot.result.finalState.secondHalfAddedTimeSeconds,
);
assert.equal(
  finalSnapshot.result.finalState.second,
  90 * 60 + finalSnapshot.result.finalState.addedTimeSeconds,
);

// Optional AI coaching uses the same command lifecycle and an isolated,
// deterministic RNG stream. It must not accept human coach commands for the
// side owned by AI.
const aiInput = makeLeagueInput(282);
aiInput.coaching = {
  aiSides: ['AWAY'],
  coachAttributes: {
    AWAY: { experience: 82, decisionMaking: 86, motivation: 78, training: 74 },
  },
};
const aiFirst = MatchEngineV2.createMatch(aiInput);
const aiSecond = MatchEngineV2.createMatch(aiInput);
const aiFirstAt25 = MatchEngineV2.advanceTo(aiFirst, 25 * 60);
const aiSecondAt25 = MatchEngineV2.advanceTo(aiSecond, 25 * 60);
assert.ok(aiFirstAt25.coachState.AWAY.instructionMemory.issueCount > 0);
assert.ok(aiFirstAt25.coachState.AWAY.shoutMemory.issueCount > 0);
assert.deepEqual(aiSecondAt25.result.events, aiFirstAt25.result.events);
assert.deepEqual(aiSecondAt25.coachState.AWAY, aiFirstAt25.coachState.AWAY);
assert.equal(MatchEngineV2.applyCommand(aiFirst, {
  type: 'COACH_SHOUT',
  atSecond: aiFirstAt25.second,
  side: 'AWAY',
  shoutId: 'PRAISE',
}), false);
assert.equal(aiFirst.commandLog.at(-1)?.reason, 'SIDE_CONTROLLED_BY_AI');

// Critical incidents wake the AI before its routine review. The event cursor
// consumes each incident once, while the two-minute cooldown prevents a burst
// of contradictory commands from one stoppage in play.
const redCardSecond = aiFirst.core.state.second;
aiFirst.core.state.events.push({
  id: 'coach-reaction-red-card',
  second: redCardSecond,
  minute: 26,
  side: 'AWAY',
  type: MatchEventType.RED_CARD,
  playerId: aiFirst.core.input.away.lineup.startingXI[1]!,
  text: 'Synthetic red card used only by the coach reaction self-test.',
});
const afterRedCardReaction = MatchEngineV2.advanceTo(aiFirst, redCardSecond + aiFirst.core.config.tickSeconds);
assert.equal(afterRedCardReaction.coachState.AWAY.lastDecisionReason, 'RED_CARD');
assert.equal(afterRedCardReaction.coachPresentation.AWAY.decisionReasonLabel, 'Reakcja po czerwonej kartce');
const redCardReactionMinute = afterRedCardReaction.coachState.AWAY.lastReactiveDecisionMinute;

// An injury substitution receives its own immediate review once the reaction
// cooldown has elapsed. It does not depend on the normal AI timetable.
MatchEngineV2.advanceTo(aiFirst, aiFirst.core.state.second + 3 * 60);
const injurySubSecond = aiFirst.core.state.second;
aiFirst.core.state.events.push({
  id: 'coach-reaction-forced-substitution',
  second: injurySubSecond,
  minute: 29,
  side: 'AWAY',
  type: MatchEventType.SUBSTITUTION,
  playerId: aiFirst.core.input.away.lineup.startingXI[2]!,
  secondaryPlayerId: aiFirst.core.input.away.lineup.startingXI[3]!,
  text: 'Synthetic forced substitution used only by the coach reaction self-test.',
  detail: { reason: 'INJURY' },
});
const afterForcedChange = MatchEngineV2.advanceTo(aiFirst, injurySubSecond + aiFirst.core.config.tickSeconds);
assert.equal(afterForcedChange.coachState.AWAY.lastDecisionReason, 'FORCED_SUBSTITUTION');
assert.ok(afterForcedChange.coachState.AWAY.lastReactiveDecisionMinute > redCardReactionMinute);

// Sustained opponent dominance has no source event, so it uses statistical
// thresholds and a separate twelve-minute cooldown.
MatchEngineV2.advanceTo(aiFirst, 42 * 60);
aiFirst.core.state.stats.HOME.shots = aiFirst.core.state.stats.AWAY.shots + 8;
aiFirst.core.state.stats.HOME.shotsOnTarget = aiFirst.core.state.stats.AWAY.shotsOnTarget + 5;
aiFirst.core.state.momentum = 48;
const dominanceSecond = aiFirst.core.state.second;
const afterDominanceReaction = MatchEngineV2.advanceTo(aiFirst, dominanceSecond + aiFirst.core.config.tickSeconds);
assert.equal(afterDominanceReaction.coachState.AWAY.lastDecisionReason, 'OPPONENT_DOMINANCE');
const dominanceReactionMinute = afterDominanceReaction.coachState.AWAY.lastDominanceReactionMinute;
MatchEngineV2.advanceTo(aiFirst, aiFirst.core.state.second + 5 * 60);
assert.equal(aiFirst.coachState.AWAY.lastDominanceReactionMinute, dominanceReactionMinute);

// Invalid lineups fail before any simulation state is created.
const invalidInput = makeLeagueInput(303);
invalidInput.home.lineup = {
  ...invalidInput.home.lineup,
  startingXI: [
    invalidInput.home.lineup.startingXI[0],
    invalidInput.home.lineup.startingXI[0],
    ...invalidInput.home.lineup.startingXI.slice(2),
  ],
};
assert.throws(() => MatchEngineV2.createMatch(invalidInput), /duplicate starter/);

console.log('MatchEngineV2CoreTests: OK', {
  finalScore: `${finalSnapshot.result.homeScore}:${finalSnapshot.result.awayScore}`,
  events: finalSnapshot.result.events.length,
  acceptedCommands: first.commandLog.filter(entry => entry.accepted).length,
  rejectedCommands: first.commandLog.filter(entry => !entry.accepted).length,
});
