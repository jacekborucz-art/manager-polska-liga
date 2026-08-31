import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MatchEventType } from '../types';
import { getMatchEngineV2SceneLabel, MatchLiveV2Prototype } from '../components/match/v2';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MatchEngineV2,
  MatchEngineV2PlaybackService,
} from '../services/match/engines/v2';

const sample = CupSampleMatchFactory.makeInput(907, 'EQUAL');
const runtime = MatchEngineV2.createMatch({
  seed: 'match-live-v2-svg-render',
  home: sample.home,
  away: sample.away,
  environment: sample.environment,
  rules: LEAGUE_MATCH_RULES_V2,
});
const kickoff = MatchEngineV2.snapshot(runtime);
const interactivePlayback = MatchEngineV2PlaybackService.create({
  renderMode: 'INTERACTIVE',
  transmissionMode: 'KEY_MOMENTS',
  goalReplays: true,
});

const baseCue = {
  id: 'scene-label',
  sourceEventId: 'scene-label-event',
  sourceEventType: MatchEventType.CORNER,
  kind: 'RESTART' as const,
  atSecond: 10,
  side: 'HOME' as const,
  start: { x: 20, y: 80 },
  end: { x: 0.5, y: 104.5 },
  durationMs: 1000,
};
assert.equal(getMatchEngineV2SceneLabel(baseCue), 'RZUT ROŻNY');
assert.equal(getMatchEngineV2SceneLabel({ ...baseCue, sourceEventType: MatchEventType.THROW_IN }), 'AUT');
assert.equal(getMatchEngineV2SceneLabel({ ...baseCue, sourceEventType: MatchEventType.OFFSIDE }), 'SPALONY');
assert.equal(getMatchEngineV2SceneLabel({ ...baseCue, sourceEventType: MatchEventType.DRIBBLING, kind: 'DRIBBLE' }), 'RAJD Z PIŁKĄ');
assert.equal(getMatchEngineV2SceneLabel({ ...baseCue, sourceEventType: MatchEventType.FREE_KICK_DANGEROUS, setPieceKind: 'FREE_KICK_DIRECT' }), 'RZUT WOLNY');
assert.equal(getMatchEngineV2SceneLabel({ ...baseCue, sourceEventType: MatchEventType.PENALTY_AWARDED, setPieceKind: 'PENALTY' }), 'RZUT KARNY');

// The prototype deliberately renders without GameContext. If a future edit
// accidentally adds useGame here, this server render fails with the same error
// that previously appeared during lineup selection.
const interactiveMarkup = renderToStaticMarkup(
  <MatchLiveV2Prototype
    snapshot={kickoff}
    playback={interactivePlayback}
    home={runtime.core.input.home}
    away={runtime.core.input.away}
    homeColor="#2563eb"
    awayColor="#e11d48"
  />,
);

assert.equal((interactiveMarkup.match(/data-player-token=/g) ?? []).length, 22);
assert.ok(interactiveMarkup.includes('SKŁAD GOSPODARZY'));
assert.ok(interactiveMarkup.includes('SKŁAD GOŚCI'));
assert.ok(interactiveMarkup.includes('WIDOK INTERAKTYWNY'));
assert.ok(interactiveMarkup.includes('KLUCZOWE AKCJE'));
assert.ok(interactiveMarkup.includes('POWTÓRKI WŁ.'));
assert.ok(interactiveMarkup.includes('data-pitch-state="TACTICAL_IDLE"'));
assert.equal(interactiveMarkup.includes('data-football="true"'), false, 'Poza kluczową sceną boisko ma pokazywać wyłącznie ustawienie taktyczne bez piłki.');
assert.ok(interactiveMarkup.includes('OCZEKIWANIE NA KLUCZOWĄ AKCJĘ'));
assert.equal(interactiveMarkup.includes('marker-end='), false, 'Tor piłki nie może być przedstawiany strzałką.');
assert.ok(interactiveMarkup.includes('data-momentum-bar="true"'), 'Widok powinien zawierać pasek momentum.');
assert.ok(interactiveMarkup.includes(kickoff.displayClock.label));
assert.ok(interactiveMarkup.includes(sample.home.name));
assert.ok(interactiveMarkup.includes(sample.away.name));

const minuteTwenty = MatchEngineV2.advanceTo(runtime, 20 * 60);
const classicMarkup = renderToStaticMarkup(
  <MatchLiveV2Prototype
    snapshot={minuteTwenty}
    playback={{ ...interactivePlayback, renderMode: 'CLASSIC', transmissionMode: 'COMMENTARY_ONLY' }}
    home={runtime.core.input.home}
    away={runtime.core.input.away}
  />,
);
const halfTimeMarkup = renderToStaticMarkup(
  <MatchLiveV2Prototype
    snapshot={kickoff}
    playback={{ ...interactivePlayback, paused: true }}
    home={sample.home}
    away={sample.away}
    isHalfTime
    primaryControlLabel="II POŁOWA"
  />,
);
assert.ok(halfTimeMarkup.includes('data-half-time="active"'));
assert.ok(halfTimeMarkup.includes('PRZERWA'));
assert.ok(halfTimeMarkup.includes('II POŁOWA'));
assert.ok(classicMarkup.includes('KOMENTARZ MECZOWY'));
assert.ok(classicMarkup.includes('TYLKO KOMENTARZ'));
assert.equal(classicMarkup.includes('class="v2-ball"'), false, 'Tryb klasyczny nie powinien animować piłki.');

const fullMatchMarkup = renderToStaticMarkup(
  <MatchLiveV2Prototype
    snapshot={kickoff}
    playback={{ ...interactivePlayback, transmissionMode: 'FULL_MATCH' }}
    home={sample.home}
    away={sample.away}
  />,
);
assert.ok(fullMatchMarkup.includes('PEŁNY MECZ'));
assert.ok(fullMatchMarkup.includes('data-pitch-state="FULL_MATCH"'));
assert.equal(fullMatchMarkup.includes('data-football="true"'), true, 'Pełny mecz zachowuje ciągły widok piłki.');

console.log('MatchLiveV2PrototypeRenderTests: OK', {
  kickoffPlayers: 22,
  interactiveBytes: interactiveMarkup.length,
  classicBytes: classicMarkup.length,
});
