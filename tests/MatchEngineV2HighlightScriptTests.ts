import assert from 'node:assert/strict';
import { MatchEventType } from '../types';
import { CupSampleMatchFactory } from '../services/match/engines/cupV2';
import {
  LEAGUE_MATCH_RULES_V2,
  MATCH_ENGINE_V2_CORNER_RESTART_SCRIPTS,
  MATCH_ENGINE_V2_FOUL_SCRIPTS,
  MATCH_ENGINE_V2_FREE_KICK_RESTART_SCRIPTS,
  MATCH_ENGINE_V2_GOAL_SCRIPTS,
  MATCH_ENGINE_V2_HIGHLIGHT_SCRIPTS,
  MATCH_ENGINE_V2_MISS_SCRIPTS,
  MATCH_ENGINE_V2_OFFSIDE_SCRIPTS,
  MATCH_ENGINE_V2_SAVE_SCRIPTS,
  MatchEngineV2,
  MatchEngineV2HighlightScriptService,
  MatchEngineV2PlaybackService,
  type MatchEngineV2HighlightOutcome,
  type MatchEngineV2VisualCue,
} from '../services/match/engines/v2';

// GOAL/SAVE/MISS each hold 5 generic open-play scenarios plus 2 corner- and
// 3 free-kick-specific ones (see cornerShotFamilies/freeKickShotFamilies) —
// 10 total per outcome, restricted to only the matching subset by cue.setPieceKind.
assert.equal(MATCH_ENGINE_V2_GOAL_SCRIPTS.length, 10, 'Pięć ogólnych scenariuszy gola plus dwa rożne i trzy wolne.');
assert.equal(MATCH_ENGINE_V2_OFFSIDE_SCRIPTS.length, 10);
assert.equal(MATCH_ENGINE_V2_MISS_SCRIPTS.length, 10, 'Pięć ogólnych scenariuszy niecelnego strzału plus dwa rożne i trzy wolne.');
assert.equal(MATCH_ENGINE_V2_SAVE_SCRIPTS.length, 10, 'Pięć ogólnych scenariuszy obrony plus dwa rożne i trzy wolne.');
assert.equal(MATCH_ENGINE_V2_FOUL_SCRIPTS.length, 26);
assert.equal(MATCH_ENGINE_V2_CORNER_RESTART_SCRIPTS.length, 3, 'Trzy autorskie scenariusze rożnego bez strzału (krótko rozegrany, wybicie, wybicie i kontra).');
assert.equal(MATCH_ENGINE_V2_FREE_KICK_RESTART_SCRIPTS.length, 2, 'Dwa autorskie scenariusze wolnego bez strzału (krótkie rozegranie, wybicie i odzyskanie).');

const allScripts = Object.values(MATCH_ENGINE_V2_HIGHLIGHT_SCRIPTS).flat();
assert.equal(allScripts.length, 71);
assert.equal(new Set(allScripts.map(script => script.id)).size, 71, 'Każdy scenariusz musi mieć unikalny identyfikator.');
allScripts.forEach(script => {
  // BOX_ONE_TWO (autorski scenariusz gola) ma sześć kroków — wymiana podań 1-2.
  assert.ok(script.steps.length >= 2 && script.steps.length <= 6);
  script.steps.forEach((scriptStep, index) => {
    assert.ok(scriptStep.start.x >= 0 && scriptStep.start.x <= 68);
    assert.ok(scriptStep.start.y >= 0 && scriptStep.start.y <= 105);
    assert.ok(scriptStep.end.x >= 0 && scriptStep.end.x <= 68);
    assert.ok(scriptStep.end.y >= 0 && scriptStep.end.y <= 105);
    assert.ok(scriptStep.durationMs >= 350);
    const next = script.steps[index + 1];
    if (next) assert.deepEqual(scriptStep.end, next.start, `${script.id}: piłka nie może przeskakiwać między scenami.`);
  });
});

const sample = CupSampleMatchFactory.makeInput(120120, 'EQUAL');
const runtime = MatchEngineV2.createMatch({
  seed: 'match-engine-v2-script-catalog',
  home: sample.home,
  away: sample.away,
  environment: sample.environment,
  rules: LEAGUE_MATCH_RULES_V2,
});
const snapshot = MatchEngineV2.snapshot(runtime);
const homeAttacker = Object.values(snapshot.spatial.players).find(player => player.side === 'HOME' && player.role === 'FWD')!;
const awayDefender = Object.values(snapshot.spatial.players).find(player => player.side === 'AWAY' && player.role === 'DEF')!;

const terminal = (
  outcome: MatchEngineV2HighlightOutcome,
  sequence: number,
  setPieceKind?: 'CORNER' | 'FREE_KICK_WIDE' | 'FREE_KICK_DIRECT',
): MatchEngineV2VisualCue => ({
  id: `terminal_${outcome}_${sequence}`,
  sourceEventId: `event_${outcome}_${sequence}`,
  sequenceId: `sequence_${outcome}_${sequence}`,
  sourceEventType:
    outcome === 'GOAL' ? MatchEventType.GOAL :
    outcome === 'OFFSIDE' ? MatchEventType.OFFSIDE :
    outcome === 'SAVE' ? MatchEventType.SAVE :
    outcome === 'FOUL' ? MatchEventType.FOUL :
    outcome === 'CORNER_RESTART' ? MatchEventType.CORNER_TAKEN :
    outcome === 'FREE_KICK_RESTART' ? MatchEventType.FREE_KICK :
    MatchEventType.SHOT,
  kind:
    outcome === 'GOAL' ? 'GOAL' :
    outcome === 'SAVE' ? 'SAVE' :
    outcome === 'FOUL' ? 'FOUL' :
    outcome === 'OFFSIDE' || outcome === 'CORNER_RESTART' || outcome === 'FREE_KICK_RESTART' ? 'RESTART' : 'SHOT',
  atSecond: 600 + sequence,
  side: outcome === 'FOUL' ? 'AWAY' : 'HOME',
  actorId: outcome === 'FOUL' ? awayDefender.playerId : homeAttacker.playerId,
  secondaryPlayerId: outcome === 'FOUL' ? homeAttacker.playerId : undefined,
  setPieceKind,
  start: { x: 34, y: 82 },
  end: { x: 34, y: 104 },
  durationMs: 800,
});

const terminals = (['GOAL', 'OFFSIDE', 'MISS', 'SAVE', 'FOUL', 'CORNER_RESTART', 'FREE_KICK_RESTART'] as const).map((outcome, index) => terminal(outcome, index));
let sawAttackingGroupBehavior = false;
let sawDefendingGroupBehavior = false;
terminals.forEach(sourceCue => {
  const firstSelection = MatchEngineV2HighlightScriptService.selectScript(sourceCue);
  const secondSelection = MatchEngineV2HighlightScriptService.selectScript(sourceCue);
  assert.equal(firstSelection?.id, secondSelection?.id, 'Ten sam zapis meczu musi wybrać ten sam scenariusz.');

  const presentation = MatchEngineV2HighlightScriptService.materialize(sourceCue, snapshot);
  assert.equal(presentation.length, firstSelection?.steps.length);
  assert.ok(presentation.every(cue => cue.scriptedHighlight));
  assert.ok(presentation.every(cue => cue.side === 'HOME'), 'Scena faulu również ma pokazywać atak drużyny faulowanej.');
  assert.equal(presentation.at(-1)?.sourceEventId, sourceCue.sourceEventId);
  const terminalScene = presentation.at(-1)!;
  if (sourceCue.sourceEventType === MatchEventType.SAVE) {
    const goalkeeper = snapshot.spatial.players[terminalScene.secondaryPlayerId ?? ''];
    assert.equal(goalkeeper?.side, 'AWAY');
    assert.equal(goalkeeper?.role, 'GK');
    assert.ok(terminalScene.end.y < 105, 'Obroniony strzał nie może wyglądać jak piłka wpadająca do bramki.');
  }
  if (sourceCue.sourceEventType === MatchEventType.SHOT) {
    assert.ok(terminalScene.end.x === 18 || terminalScene.end.x === 50, 'Niecelny strzał powinien minąć światło bramki.');
  }
  if (sourceCue.sourceEventType === MatchEventType.FOUL) assert.deepEqual(terminalScene.end, terminalScene.start);
  if (sourceCue.sourceEventType === MatchEventType.FOUL) {
    assert.ok(!terminalScene.commentaryTemplate?.includes('STRZELA'), 'Faul nie może być opisany jak strzał.');
  }
  if (sourceCue.sourceEventType === MatchEventType.OFFSIDE) {
    assert.ok(terminalScene.commentaryTemplate?.includes('spalone'), 'Spalone musi mieć własny komentarz, nie tekst strzału.');
  }
  if (sourceCue.sourceEventType === MatchEventType.GOAL) {
    assert.equal(
      terminalScene.actorId,
      sourceCue.actorId,
      'Strzelec w scenie musi zostać tym samym zawodnikiem, który naprawdę strzelił gola w meczu — nawet w wieloetapowym, ręcznie napisanym scenariuszu.',
    );
  }
  presentation.forEach((cue, index) => {
    assert.equal(cue.highlightSceneIndex, index + 1);
    assert.equal(cue.highlightSceneCount, presentation.length);
    assert.ok(cue.actorId);
    assert.ok(cue.commentaryTemplate, `Krok ${index + 1} scenariusza ${firstSelection?.id} musi mieć komentarz.`);
    if (cue.attackingGroupBehavior) sawAttackingGroupBehavior = true;
    if (cue.defendingGroupBehavior) sawDefendingGroupBehavior = true;
    (cue.supportingRuns ?? []).forEach(run => {
      assert.ok(
        snapshot.spatial.players[run.playerId],
        `Dodatkowy bieg w kroku ${index + 1} scenariusza ${firstSelection?.id} wskazuje na nieistniejącego zawodnika.`,
      );
      assert.notEqual(run.playerId, cue.actorId, 'Zawodnik wykonujący dodatkowy bieg nie może być jednocześnie aktorem tego samego kroku.');
      assert.notEqual(run.playerId, cue.secondaryPlayerId, 'Zawodnik wykonujący dodatkowy bieg nie może być jednocześnie odbiorcą tego samego kroku.');
    });
    if ((cue.kind === 'PASS' || cue.kind === 'CROSS') && cue.secondaryPlayerId) {
      assert.notEqual(cue.actorId, cue.secondaryPlayerId, 'Zawodnik nie może podać piłki sam do siebie.');
    }
    const next = presentation[index + 1];
    if (next) assert.deepEqual(cue.end, next.start, 'Piłka musi kontynuować lot z poprzedniego punktu.');
  });
});

// Exercise every one of the hand-authored scenarios for an outcome directly
// (a single fixed cue only ever hits whichever one its hash selects), so a
// mistake specific to one of them cannot hide behind the others passing.
const verifyAuthoredScenarioIdentity = (
  outcome: 'GOAL' | 'SAVE' | 'MISS',
  expectedScriptCount: number,
): void => {
  const seenScriptIds = new Set<string>();
  for (let sample = 0; sample < 60 && seenScriptIds.size < expectedScriptCount; sample += 1) {
    const cue = terminal(outcome, sample);
    const script = MatchEngineV2HighlightScriptService.selectScript(cue);
    if (!script || seenScriptIds.has(script.id)) continue;
    seenScriptIds.add(script.id);
    const presentation = MatchEngineV2HighlightScriptService.materialize(cue, snapshot);
    const finalScene = presentation.at(-1)!;
    assert.equal(finalScene.actorId, cue.actorId, `${script.id}: strzelec musi zostać tym samym zawodnikiem przez cały scenariusz.`);
    if (outcome === 'SAVE') {
      const goalkeeper = snapshot.spatial.players[finalScene.secondaryPlayerId ?? ''];
      assert.equal(goalkeeper?.role, 'GK', `${script.id}: obronę musi zapisywać prawdziwy bramkarz drużyny broniącej.`);
    }
    const sameSideOtherActorIds = new Set(
      presentation
        .filter(sceneCue => sceneCue.actorId && sceneCue.actorId !== finalScene.actorId)
        .map(sceneCue => sceneCue.actorId),
    );
    presentation.forEach(sceneCue => {
      (sceneCue.supportingRuns ?? []).forEach(run => {
        assert.ok(snapshot.spatial.players[run.playerId], `${script.id}: dodatkowy bieg wskazuje na nieistniejącego zawodnika.`);
      });
    });
    // BOX_ONE_TWO explicitly needs two distinct midfielders (A1 podaje do A2).
    if (script.id === 'BOX_ONE_TWO') {
      assert.ok(sameSideOtherActorIds.size >= 1, 'BOX_ONE_TWO musi zaangażować przynajmniej jednego innego pomocnika niż strzelec.');
    }
  }
  assert.equal(
    seenScriptIds.size,
    expectedScriptCount,
    `Test musi sprawdzić każdy z ${expectedScriptCount} autorskich scenariuszy dla wyniku ${outcome} przynajmniej raz.`,
  );
};

// A cue with no setPieceKind only ever reaches the 5 untagged (generic
// open-play) scripts in each pool — the corner/free-kick ones below are only
// reachable through a cue that actually carries a matching setPieceKind.
const GENERIC_SHOT_SCRIPT_COUNT = 5;
verifyAuthoredScenarioIdentity('GOAL', GENERIC_SHOT_SCRIPT_COUNT);
verifyAuthoredScenarioIdentity('SAVE', GENERIC_SHOT_SCRIPT_COUNT);
verifyAuthoredScenarioIdentity('MISS', GENERIC_SHOT_SCRIPT_COUNT);
assert.ok(sawAttackingGroupBehavior, 'Przynajmniej jeden krok musi mieć zachowanie grupowe drużyny atakującej.');
assert.ok(sawDefendingGroupBehavior, 'Przynajmniej jeden krok musi mieć zachowanie grupowe drużyny broniącej.');

// Same identity checks, but for the corner/free-kick-tagged scripts, reached
// only when the terminal cue actually carries the matching setPieceKind.
const verifyAuthoredSetPieceScenarioIdentity = (
  outcome: 'GOAL' | 'SAVE' | 'MISS',
  setPieceKind: 'CORNER' | 'FREE_KICK_WIDE',
  requiredSetPieceKind: 'CORNER' | 'FREE_KICK',
  expectedScriptCount: number,
): void => {
  const seenScriptIds = new Set<string>();
  for (let sample = 0; sample < 60 && seenScriptIds.size < expectedScriptCount; sample += 1) {
    // selectScript hashes `${sourceEventId}:${sequenceId}:${outcome}`. stableHash's
    // lowest bit is a plain XOR checksum of its input bytes (Math.imul by an odd
    // FNV prime never touches bit 0), so varying `sample` inside BOTH id fields at
    // once (as terminal() does) correlates their digit parity closely enough that
    // it very rarely flips that bit — collapsing a 2-way selection to one constant
    // outcome. Keeping sourceEventId fixed and varying only sequenceId (still a
    // real, distinct value per sample) restores a normal spread; this is purely a
    // property of this synthetic probe, not of real match event ids.
    const cue = { ...terminal(outcome, 1000, setPieceKind), sequenceId: `sequence_${outcome}_${setPieceKind}_probe_${sample}` };
    const script = MatchEngineV2HighlightScriptService.selectScript(cue);
    if (!script || seenScriptIds.has(script.id)) continue;
    assert.equal(script.requiredSetPieceKind, requiredSetPieceKind, `${script.id}: musi być otagowany jako ${requiredSetPieceKind}.`);
    seenScriptIds.add(script.id);
    const presentation = MatchEngineV2HighlightScriptService.materialize(cue, snapshot);
    const finalScene = presentation.at(-1)!;
    assert.equal(finalScene.actorId, cue.actorId, `${script.id}: strzelec musi zostać tym samym zawodnikiem przez cały scenariusz.`);
    if (outcome === 'SAVE') {
      const goalkeeper = snapshot.spatial.players[finalScene.secondaryPlayerId ?? ''];
      assert.equal(goalkeeper?.role, 'GK', `${script.id}: obronę musi zapisywać prawdziwy bramkarz drużyny broniącej.`);
    }
    presentation.forEach(sceneCue => {
      (sceneCue.supportingRuns ?? []).forEach(run => {
        assert.ok(snapshot.spatial.players[run.playerId], `${script.id}: dodatkowy bieg wskazuje na nieistniejącego zawodnika.`);
      });
    });
  }
  assert.equal(
    seenScriptIds.size,
    expectedScriptCount,
    `Test musi sprawdzić każdy z ${expectedScriptCount} autorskich scenariuszy stałego fragmentu (${requiredSetPieceKind}/${outcome}) przynajmniej raz.`,
  );
};

(['GOAL', 'SAVE', 'MISS'] as const).forEach(outcome => {
  verifyAuthoredSetPieceScenarioIdentity(outcome, 'CORNER', 'CORNER', 2);
  verifyAuthoredSetPieceScenarioIdentity(outcome, 'FREE_KICK_WIDE', 'FREE_KICK', 3);
});

// The CORNER_RESTART/FREE_KICK_RESTART pools have no shot to verify against
// a fixed actorId (see freeKickRestartFamilies), so this only checks that
// selectScript actually reaches every one of them and that every named run
// still resolves to a real player.
const verifyAuthoredRestartScenarioCoverage = (
  outcome: 'CORNER_RESTART' | 'FREE_KICK_RESTART',
  expectedScriptCount: number,
): void => {
  const seenScriptIds = new Set<string>();
  for (let sample = 0; sample < 60 && seenScriptIds.size < expectedScriptCount; sample += 1) {
    // See the comment in verifyAuthoredSetPieceScenarioIdentity above — the
    // FREE_KICK_RESTART pool has only 2 scripts, so this fixed-sourceEventId
    // probing is required here too (CORNER_RESTART's pool of 3 would happen
    // to be fine either way, but keeping both loops consistent is simpler).
    const cue = { ...terminal(outcome, 2000), sequenceId: `sequence_${outcome}_probe_${sample}` };
    const script = MatchEngineV2HighlightScriptService.selectScript(cue);
    if (!script || seenScriptIds.has(script.id)) continue;
    seenScriptIds.add(script.id);
    const presentation = MatchEngineV2HighlightScriptService.materialize(cue, snapshot);
    presentation.forEach(sceneCue => {
      (sceneCue.supportingRuns ?? []).forEach(run => {
        assert.ok(snapshot.spatial.players[run.playerId], `${script.id}: dodatkowy bieg wskazuje na nieistniejącego zawodnika.`);
      });
    });
  }
  assert.equal(
    seenScriptIds.size,
    expectedScriptCount,
    `Test musi sprawdzić każdy z ${expectedScriptCount} autorskich scenariuszy wyniku ${outcome} przynajmniej raz.`,
  );
};

verifyAuthoredRestartScenarioCoverage('CORNER_RESTART', MATCH_ENGINE_V2_CORNER_RESTART_SCRIPTS.length);
verifyAuthoredRestartScenarioCoverage('FREE_KICK_RESTART', MATCH_ENGINE_V2_FREE_KICK_RESTART_SCRIPTS.length);

// A standalone restart with no resulting shot: only ALL_ACTIONS should surface it.
const restartOnly: MatchEngineV2VisualCue = {
  id: 'terminal_corner_only',
  sourceEventId: 'event_corner_only',
  sourceEventType: MatchEventType.CORNER,
  kind: 'RESTART',
  atSecond: 700,
  side: 'HOME',
  actorId: homeAttacker.playerId,
  start: { x: 0.5, y: 104.5 },
  end: { x: 34, y: 92 },
  durationMs: 1100,
};
const lowXgMiss: MatchEngineV2VisualCue = {
  id: 'terminal_low_xg_miss',
  sourceEventId: 'event_low_xg_miss',
  sourceEventType: MatchEventType.SHOT,
  kind: 'SHOT',
  atSecond: 710,
  side: 'HOME',
  actorId: homeAttacker.playerId,
  start: { x: 34, y: 82 },
  end: { x: 34, y: 104 },
  durationMs: 800,
  xG: 0.08,
};
const highXgMiss: MatchEngineV2VisualCue = { ...lowXgMiss, id: 'terminal_high_xg_miss', sourceEventId: 'event_high_xg_miss', atSecond: 720, xG: 0.55 };
const postMiss: MatchEngineV2VisualCue = { ...lowXgMiss, id: 'terminal_post_miss', sourceEventId: 'event_post_miss', sourceEventType: MatchEventType.SHOT_POST, atSecond: 730, xG: 0.05 };
const penaltyMiss: MatchEngineV2VisualCue = { ...lowXgMiss, id: 'terminal_penalty_miss', sourceEventId: 'event_penalty_miss', sourceEventType: MatchEventType.PENALTY_MISSED, atSecond: 740, xG: 0.76 };
const lowXgSave: MatchEngineV2VisualCue = {
  id: 'terminal_low_xg_save',
  sourceEventId: 'event_low_xg_save',
  sourceEventType: MatchEventType.SAVE,
  kind: 'SAVE',
  atSecond: 750,
  side: 'HOME',
  actorId: homeAttacker.playerId,
  secondaryPlayerId: awayDefender.playerId,
  start: { x: 34, y: 82 },
  end: { x: 34, y: 101.5 },
  durationMs: 800,
  xG: 0.10,
};
const highXgSave: MatchEngineV2VisualCue = { ...lowXgSave, id: 'terminal_high_xg_save', sourceEventId: 'event_high_xg_save', atSecond: 760, xG: 0.62 };
const tieringCues = [...terminals, restartOnly, lowXgMiss, highXgMiss, postMiss, penaltyMiss, lowXgSave, highXgSave];

const allActions = MatchEngineV2HighlightScriptService.selectTerminalCues('ALL_ACTIONS', tieringCues);
assert.equal(allActions.length, 14, 'WSZYSTKIE AKCJE pokazują każdy z siedmiu wyników (w tym rozegrany rożny/wolny bez strzału) plus siedem nowych sytuacji strzałowych/restartów.');
assert.ok(allActions.some(cue => cue.id === restartOnly.id), 'Samodzielny rzut rożny bez strzału musi być widoczny w trybie WSZYSTKIE AKCJE.');

const keyMoments = MatchEngineV2HighlightScriptService.selectTerminalCues('KEY_MOMENTS', tieringCues);
const keyMomentIds = keyMoments.map(cue => cue.id).sort();
assert.deepEqual(
  keyMomentIds,
  [terminals[0].id, highXgMiss.id, highXgSave.id, postMiss.id, penaltyMiss.id].sort(),
  'KLUCZOWE ma pokazywać tylko gole, karne, słupek/poprzeczkę oraz szanse i obrony z wysokim xG.',
);
assert.ok(!keyMomentIds.includes(lowXgMiss.id), 'Niecelny strzał o niskim xG nie jest kluczowy.');
assert.ok(!keyMomentIds.includes(lowXgSave.id), 'Obrona przy niskim xG nie jest kluczowa.');
assert.ok(!keyMomentIds.includes(restartOnly.id), 'Sam rzut rożny bez strzału nie jest kluczowy.');
assert.ok(!keyMomentIds.includes(terminals[5].id), 'Rozegrany rzut rożny bez strzału nie jest kluczowy.');
assert.ok(!keyMomentIds.includes(terminals[6].id), 'Rozegrany rzut wolny bez strzału nie jest kluczowy.');

const commentaryOnly = MatchEngineV2HighlightScriptService.selectTerminalCues('COMMENTARY_ONLY', tieringCues);
assert.equal(commentaryOnly.length, 0, 'TYLKO KOMENTARZ nie pokazuje żadnej sceny.');

const fullMatch = MatchEngineV2HighlightScriptService.selectTerminalCues('FULL_MATCH', tieringCues);
assert.deepEqual(fullMatch, tieringCues, 'PEŁNY MECZ musi zachować wszystkie zapisane zdarzenia piłkarskie.');

const playback = MatchEngineV2PlaybackService.create({ transmissionMode: 'ALL_ACTIONS' });
assert.deepEqual(MatchEngineV2PlaybackService.selectVisibleCues(playback, tieringCues), allActions);

console.log('MatchEngineV2HighlightScriptTests: OK', {
  total: allScripts.length,
  goals: MATCH_ENGINE_V2_GOAL_SCRIPTS.length,
  offsides: MATCH_ENGINE_V2_OFFSIDE_SCRIPTS.length,
  misses: MATCH_ENGINE_V2_MISS_SCRIPTS.length,
  saves: MATCH_ENGINE_V2_SAVE_SCRIPTS.length,
  fouls: MATCH_ENGINE_V2_FOUL_SCRIPTS.length,
  cornerRestarts: MATCH_ENGINE_V2_CORNER_RESTART_SCRIPTS.length,
  freeKickRestarts: MATCH_ENGINE_V2_FREE_KICK_RESTART_SCRIPTS.length,
});
