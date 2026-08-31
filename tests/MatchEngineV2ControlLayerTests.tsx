import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MatchEngineV2SubstitutionOverlay,
  MatchEngineV2TacticsOverlay,
  MatchLiveV2Session,
  getMatchV2PrimaryControlLabel,
} from '../components/match/v2';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
} from '../services/match/engines/v2';

const sample = CupSampleMatchFactory.makeInput(933, 'EQUAL');
const runtime = MatchEngineV2.createMatch({
  seed: 'match-engine-v2-control-layer',
  home: sample.home,
  away: sample.away,
  environment: sample.environment,
  rules: LEAGUE_MATCH_RULES_V2,
});

const tacticalAccepted = MatchEngineV2.applyCommand(runtime, {
  type: 'UPDATE_INSTRUCTIONS',
  atSecond: 0,
  side: 'HOME',
  patch: {
    tempo: 'FAST',
    mindset: 'OFFENSIVE',
    intensity: 'AGGRESSIVE',
    passing: 'SHORT',
    pressing: 'PRESSING',
    counterAttack: 'COUNTER',
    marking: 'MAN',
  },
});
assert.equal(tacticalAccepted, true);
assert.equal(runtime.core.input.home.instructions.tempo, 'FAST');
assert.equal(runtime.core.input.home.instructions.counterAttack, 'COUNTER');
assert.equal(runtime.core.input.home.instructions.marking, 'MAN');

// Touchline communication is intentionally unavailable before the first full
// minute. Advancing through the public API verifies the same timing rule used
// by the interactive controller.
MatchEngineV2.advanceTo(runtime, 60);

const instructionAccepted = MatchEngineV2.applyCommand(runtime, {
  type: 'TOUCHLINE_INSTRUCTION',
  atSecond: runtime.core.state.second,
  side: 'HOME',
  instructionId: 'KEEP_BALL',
});
assert.equal(instructionAccepted, true);

const shoutAccepted = MatchEngineV2.applyCommand(runtime, {
  type: 'COACH_SHOUT',
  atSecond: runtime.core.state.second,
  side: 'HOME',
  shoutId: 'MOTIVATE',
});
assert.equal(shoutAccepted, true);

const playerOutId = runtime.core.input.home.lineup.startingXI[1]!;
const playerInId = runtime.core.input.home.lineup.bench[0];
const substitutionAccepted = MatchEngineV2.applyCommand(runtime, {
  type: 'SUBSTITUTION',
  atSecond: runtime.core.state.second,
  side: 'HOME',
  playerOutId,
  playerInId,
});
assert.equal(substitutionAccepted, true);
assert.ok(runtime.core.input.home.lineup.startingXI.includes(playerInId));
assert.equal(runtime.core.state.substitutionsUsed.HOME, 1);

const illegalReturn = MatchEngineV2.applyCommand(runtime, {
  type: 'SUBSTITUTION',
  atSecond: runtime.core.state.second,
  side: 'HOME',
  playerOutId: playerInId,
  playerInId: playerOutId,
});
assert.equal(illegalReturn, false, 'Zawodnik, który zszedł, nie może wrócić z ławki.');
assert.equal(runtime.commandLog.at(-1)?.reason, 'ILLEGAL_SUBSTITUTION');

const snapshot = MatchEngineV2.snapshot(runtime);
const noOperation = () => true;
const tacticsMarkup = renderToStaticMarkup(
  <MatchEngineV2TacticsOverlay
    team={runtime.core.input.home}
    coachSummary={snapshot.coachPresentation.HOME.summary}
    accent="#2563eb"
    onApplyPatch={noOperation}
    onIssueInstruction={noOperation}
    onIssueShout={noOperation}
    onClose={() => undefined}
  />,
);
assert.ok(tacticsMarkup.includes('CENTRUM TAKTYCZNE 2.0'));
assert.ok(tacticsMarkup.includes('PRESSING'));
assert.ok(tacticsMarkup.includes('KONTRAATAK'));
assert.ok(tacticsMarkup.includes('KRYCIE'));
assert.ok(tacticsMarkup.includes('POLECENIA Z LINII'));
assert.ok(tacticsMarkup.includes('OKRZYKI TRENERA'));

const substitutionMarkup = renderToStaticMarkup(
  <MatchEngineV2SubstitutionOverlay
    team={runtime.core.input.home}
    side="HOME"
    snapshot={snapshot}
    maxSubstitutions={runtime.rules.maxSubstitutions}
    accent="#2563eb"
    onApply={noOperation}
    onClose={() => undefined}
  />,
);
assert.ok(substitutionMarkup.includes('PANEL ZMIAN 2.0'));
assert.ok(substitutionMarkup.includes('BOISKO — ZAWODNIK SCHODZĄCY'));
assert.ok(substitutionMarkup.includes('ŁAWKA — ZAWODNIK WCHODZĄCY'));
assert.ok(substitutionMarkup.includes('WYKORZYSTANO 1 Z 5'));

// The complete controller remains context-free. A server render catches any
// accidental useGame dependency before the prototype is routed into the app.
const sessionMarkup = renderToStaticMarkup(
  <MatchLiveV2Session runtime={runtime} managedSide="HOME" />,
);
assert.ok(sessionMarkup.includes('TAKTYKA I POLECENIA'));
assert.ok(sessionMarkup.includes('ZMIANY'));
assert.ok(sessionMarkup.includes('ROZPOCZNIJ MECZ'));
assert.equal((sessionMarkup.match(/data-player-token=/g) ?? []).length, 22);
assert.equal(getMatchV2PrimaryControlLabel(false, false, true), 'ROZPOCZNIJ MECZ');
assert.equal(getMatchV2PrimaryControlLabel(true, false, true), 'WZNÓW');
assert.equal(getMatchV2PrimaryControlLabel(true, false, false), 'PAUZA');
assert.equal(getMatchV2PrimaryControlLabel(true, true, true), 'II POŁOWA');

const halfTimeSample = CupSampleMatchFactory.makeInput(934, 'EQUAL');
const halfTimeRuntime = MatchEngineV2.createMatch({
  seed: 'match-engine-v2-half-time-control',
  home: halfTimeSample.home,
  away: halfTimeSample.away,
  environment: halfTimeSample.environment,
  rules: LEAGUE_MATCH_RULES_V2,
});
MatchEngineV2.advanceTo(halfTimeRuntime, 45 * 60 + 5);
const halfTimeBoundary = 45 * 60 + halfTimeRuntime.core.state.firstHalfAddedTimeSeconds;
const halfTimeSnapshot = MatchEngineV2.advanceTo(halfTimeRuntime, halfTimeBoundary);
assert.equal(halfTimeSnapshot.phase, 'SECOND_HALF');
assert.equal(halfTimeSnapshot.second, halfTimeBoundary);

console.log('MatchEngineV2ControlLayerTests: OK', {
  commands: runtime.commandLog.length,
  substitutionsUsed: runtime.core.state.substitutionsUsed.HOME,
  tacticsBytes: tacticsMarkup.length,
  substitutionsBytes: substitutionMarkup.length,
  sessionPlayers: 22,
});
