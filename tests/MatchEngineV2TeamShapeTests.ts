import assert from 'node:assert/strict';
import { PlayerPosition } from '../types';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
  MatchEngineV2SpatialService,
  MatchEngineV2TeamPhaseService,
  MatchEngineV2TeamShapeService,
  type MatchEngineV2PlayerSpatialState,
  type MatchEngineV2TeamPhase,
} from '../services/match/engines/v2';

const sample = CupSampleMatchFactory.makeInput(442, 'EQUAL');
const runtime = MatchEngineV2.createMatch({
  seed: 'team_shape_442_v_442',
  home: sample.home,
  away: sample.away,
  environment: sample.environment,
  rules: LEAGUE_MATCH_RULES_V2,
  config: { tickSeconds: 5, calibrationMode: false },
});

const initial = MatchEngineV2.snapshot(runtime).spatial;
assert.equal(Object.values(initial.players).filter(player => player.isOnPitch).length, 22);
assert.notEqual(initial.teamContexts[runtime.core.state.possession].phase, 'DEFENSIVE_SHAPE');
assert.equal(
  initial.teamContexts[runtime.core.state.possession === 'HOME' ? 'AWAY' : 'HOME'].phase,
  'DEFENSIVE_SHAPE',
);

const homePlayers = Object.values(initial.players).filter(player => player.side === 'HOME' && player.isOnPitch);
const targetSet = (phase: MatchEngineV2TeamPhase) => homePlayers.map(player => ({
  player,
  target: MatchEngineV2TeamShapeService.targetForPlayer({
    player,
    ball: { x: 34, y: 70 },
    phase,
    tactic: runtime.core.input.home.tactic,
    instructions: runtime.core.input.home.instructions,
    isPresser: false,
  }),
}));

const buildUpTargets = targetSet('BUILD_UP');
const attackTargets = targetSet('ATTACK');
const finalThirdTargets = targetSet('FINAL_THIRD');

const averageOutfieldY = (targets: ReturnType<typeof targetSet>): number => {
  const outfield = targets.filter(item => item.player.role !== PlayerPosition.GK);
  return outfield.reduce((sum, item) => sum + item.target.point.y, 0) / outfield.length;
};

assert.ok(averageOutfieldY(buildUpTargets) < averageOutfieldY(attackTargets));
assert.ok(averageOutfieldY(attackTargets) < averageOutfieldY(finalThirdTargets));

finalThirdTargets.forEach(({ player, target }) => {
  assert.ok(target.point.x >= player.movementZone.minX && target.point.x <= player.movementZone.maxX);
  assert.ok(target.point.y >= player.movementZone.minY && target.point.y <= player.movementZone.maxY);
});

const homeGoalkeeperTarget = finalThirdTargets.find(item => item.player.role === PlayerPosition.GK)?.target.point;
assert.ok(homeGoalkeeperTarget);
assert.ok(homeGoalkeeperTarget.y <= 11, 'Bramkarz musi pozostać w bezpiecznej strefie przy własnej bramce.');

const averageLineY = (
  targets: ReturnType<typeof targetSet>,
  role: MatchEngineV2PlayerSpatialState['role'],
): number => {
  const line = targets.filter(item => item.player.role === role);
  return line.reduce((sum, item) => sum + item.target.point.y, 0) / line.length;
};

assert.ok(averageLineY(attackTargets, 'DEF') < averageLineY(attackTargets, 'MID'));
assert.ok(averageLineY(attackTargets, 'MID') < averageLineY(attackTargets, 'FWD'));

// A pure target solver must return exactly the same result for the same state.
assert.deepEqual(targetSet('ATTACK'), attackTargets);

const originalPossession = runtime.core.state.possession;
const newPossession = originalPossession === 'HOME' ? 'AWAY' : 'HOME';
runtime.core.state.possession = newPossession;
runtime.core.state.ballZone = 'MIDFIELD';
runtime.core.state.second = 5;
MatchEngineV2SpatialService.synchronize(runtime.spatial, runtime.core);

assert.equal(runtime.spatial.teamContexts[newPossession].phase, 'TRANSITION_ATTACK');
assert.equal(runtime.spatial.teamContexts[originalPossession].phase, 'TRANSITION_DEFEND');
assert.ok(
  Object.values(runtime.spatial.players).filter(player =>
    player.side === originalPossession && player.isOnPitch && player.movementIntent === 'PRESS'
  ).length <= 2,
  'Po stracie do piłki może jednocześnie doskoczyć najwyżej dwóch graczy.',
);

runtime.core.state.second = 5 + MatchEngineV2TeamPhaseService.transitionDurationSeconds + 1;
MatchEngineV2SpatialService.synchronize(runtime.spatial, runtime.core);
assert.equal(runtime.spatial.teamContexts[newPossession].phase, 'ATTACK');
assert.equal(runtime.spatial.teamContexts[originalPossession].phase, 'DEFENSIVE_SHAPE');

Object.values(runtime.spatial.players).filter(player => player.isOnPitch).forEach(player => {
  assert.ok(player.position.x >= 0 && player.position.x <= runtime.spatial.pitchWidth);
  assert.ok(player.position.y >= 0 && player.position.y <= runtime.spatial.pitchLength);
  if (player.role !== PlayerPosition.GK) {
    assert.ok(player.position.x >= player.movementZone.minX && player.position.x <= player.movementZone.maxX);
    assert.ok(player.position.y >= player.movementZone.minY && player.position.y <= player.movementZone.maxY);
  }
});

console.log('Match Engine V2 team phase and 4-4-2 shape tests passed.');
