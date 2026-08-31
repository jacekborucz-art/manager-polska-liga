# Match Engine V2

This folder is the competition-neutral foundation for the new live match engine.
It deliberately does not replace the current league view yet.

## Current guarantees

- Creating a runtime does not simulate any future match ticks.
- A match can only move forward in deterministic, fixed-size ticks.
- League and knockout behavior comes from an explicit rules object.
- Tactical commands carry an authoritative match second and cannot rewrite history.
- Touchline instructions and coach shouts reuse the existing response matrices and expire automatically.
- Optional AI coaches use the same command vocabulary with deterministic, coach-quality-scaled decisions.
- AI review is brought forward after a red card, injury substitution or sustained opponent dominance, with cooldowns preventing command spam.
- Manual substitutions are validated inside the engine.
- Snapshots include formation-aware player and ball coordinates for a 105 x 68 metre pitch.
- Authoritative report events are projected into a bounded, deterministic SVG cue buffer.
- Regulation time is followed by calculated added time before league full time or cup extra time.
- Fouls award the opposing side an attributed free kick or penalty instead of also becoming a turnover.
- The legacy match engine remains the default and unchanged while this prototype is tested.
- A per-fixture registry routes only an explicit 2.0 choice from the league pre-match studio to the prototype session.
- Missing or stale selections always fall back to 1.0; loading or starting a game clears the temporary choice.
- The opening side has a real player standing over the ball at the centre spot.
- Goalkeepers use a protected goal-area envelope instead of following the generic possession block.
- The authoritative carrier survives between actions, so a receiver can become the next passer or dribbler.
- Pass, direct pass, dribble and cross decisions combine player attributes, tactics and deterministic RNG.
- Quiet play advances at 1 real second per match minute; a shown scene freezes authoritative time completely until it finishes.
- Three transmission tiers control scene density: ALL_ACTIONS (every shot, foul, corner, free kick, penalty), KEY_MOMENTS (goals, penalties, and only the misses/saves whose xG or post/bar contact made them dangerous), COMMENTARY_ONLY (no scene, text log only).
- Between scenes every player marker rests on its own formation slot instead of continuously walking; a scene still runs full choreography for whoever it involves.
- An authored highlight step can name a group behavior for each side (e.g. DEFENSIVE_LINE_RETREAT, TEAM_PUSH_FORWARD) so the other 19-20 players move like the scenario actually calls for, not one generic formula for every scene; a step naming neither still falls back to that generic flow.
- An authored step's commentaryTemplate ({actor}/{receiver} placeholders, filled in with real names by the view) syncs the shown text to the scene currently playing instead of only the final authoritative event.

## Public modules

- `MatchEngineV2Types.ts` defines neutral input, rules, commands, snapshots and spatial state.
- `MatchEngineV2Rules.ts` contains league and knockout rule presets plus validation.
- `MatchEngineV2.ts` owns create, advance, command, snapshot and finalize operations.
- `MatchEngineV2SpatialService.ts` projects authoritative match state onto bounded pitch coordinates.
- `MatchEngineV2TrajectoryService.ts` samples deterministic ball and player paths for SVG frames.
- `MatchEngineV2PlaybackService.ts` converts wall-clock time into match time and owns presentation-only modes.
- `MatchEngineV2FrameControllerService.ts` interpolates snapshot positions, queues visual cues and replays stored goal sequences without advancing simulation.
- `MatchEngineV2GroupBehaviorService.ts` is a named registry of pure, presentation-only movement patterns for the players not directly involved in the current scripted scene.
- `MatchEngineV2CoachService.ts` owns isolated human/AI command state, projects bounded effects into the core and exposes detached Polish presentation data.
- `components/match/v2/MatchLiveV2Prototype.tsx` renders the first context-free 1920 x 1080 SVG shell for interactive and classic presentation modes.
- `components/match/v2/useMatchEngineV2Frame.ts` samples browser animation frames only while visible movement is active.
- `components/match/v2/MatchEngineV2ControlOverlays.tsx` renders SVG tactical, touchline, shout and substitution controls.
- `components/match/v2/MatchLiveV2Session.tsx` owns prototype playback and routes every user decision through the authoritative command API.
- `services/match/MatchEngineRegistry.ts` owns the safe 1.0 fallback and per-fixture engine definitions.
- `components/match/LeagueMatchEngineRouter.tsx` is the single league live-view routing boundary.
- `components/views/MatchLiveV2LeagueView.tsx` adapts real league fixtures, squads, coaches, lineups and kits into one isolated V2 runtime.

## Player attribution

Possession actions now identify a passer, receiver and pressing opponent. The
selection uses role suitability, technical and mental attributes, movement,
fitness and deterministic RNG. Completed passes and turnovers are recorded in
the event stream and aggregated into individual match statistics.

One possession can now expose a coherent sequence of pass/cross, control,
dribble, tackle/interception, shot, keeper outcome, block and rebound. Rare
attacking rebounds may create a lower-xG follow-up shot. Every item keeps the
same sequence id so a renderer and a goal replay can follow authoritative data.

## Scene-based SVG presentation

The spatial projection chains consecutive cue endpoints, while the frame
controller moves the carrier with a dribble and sends the receiver toward a
pass or cross. Formation tracks converge on each player's own anchor slot
whenever no scene is active, so the pitch reads as a tactical shape between
actions instead of continuously walking players; a scene still takes over full
choreography for whoever it involves, starting from exactly where that marker
was already resting. A standalone restart with no authored script (a corner or
free kick that never produced a shot) still gets a scene: the frame controller
falls back to the single authoritative cue, and the existing structured-restart
shaping lines up both teams for it. The football is a multi-panel SVG ball
with deterministic rotation, height and shadow rather than a generic glowing
dot. Active players and receivers receive subtle action rings.

Each player also owns an invisible tactical work rectangle derived from the
default formation slot and role. Ball-oriented support, pressing, recovery and
personal deterministic movement are clamped to that area. Kick-off and stopped
goal celebrations are explicit temporary exceptions. Goalkeepers retain their
smaller protected goal area.

The session pauses at the exact first-half boundary and requires an explicit
second-half start. A live goal blocks authoritative advancement for four real
seconds while the SVG shows a team-colour banner and a short five-player
celebration; an optional stored replay starts afterwards. The header exposes
the authoritative -100..100 momentum value without altering it.

## Important limitation

The prototype can now be launched voluntarily from the normal league pre-match
studio. Its runtime remains disposable in Stage 8: leaving the view discards
the test match and returns the fixture to Engine 1.0. Full table, player, finance,
history and post-match studio persistence belongs to the shared Stage 9
finalization service and is intentionally not duplicated inside this view.

## Verification

Run:

```bash
npm run test:match-engine-v2-core
npm run test:match-engine-v2-actions
npm run test:match-engine-v2-action-chain
npm run test:match-engine-v2-rules
npm run test:match-engine-v2-coach-balance
npm run test:match-engine-v2-frames
npm run test:match-engine-v2-highlights
npm run test:match-engine-v2-controls
npm run test:match-engine-v2-registry
npm run test:match-live-v2-svg
npm run test:cup-v2-live
npm run test:cup-v2-shadow-audit
npm run build
```
