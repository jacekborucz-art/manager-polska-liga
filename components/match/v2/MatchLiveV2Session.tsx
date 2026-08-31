import { useEffect, useRef, useState } from 'react';
import type { UserCoachInstructionId, UserCoachShoutId } from '../../../types';
import {
  MatchEngineV2,
  MatchEngineV2PlaybackService,
  type MatchEngineV2PlaybackSpeed,
  type MatchEngineV2PlaybackState,
  type MatchEngineV2Runtime,
  type MatchEngineV2Snapshot,
  type MatchEngineV2TacticalPatch,
} from '../../../services/match/engines/v2';
import type { CupTeamSide } from '../../../services/match/engines/cupV2';
import { MatchEngineV2SubstitutionOverlay, MatchEngineV2TacticsOverlay } from './MatchEngineV2ControlOverlays';
import { MatchLiveV2Prototype } from './MatchLiveV2Prototype';

type MatchLiveV2SessionProps = {
  runtime: MatchEngineV2Runtime;
  managedSide?: CupTeamSide;
  initialPlayback?: Partial<Pick<MatchEngineV2PlaybackState,
    'paused' | 'speed' | 'sceneSpeed' | 'renderMode' | 'transmissionMode' | 'goalReplays'
  >>;
  homeLogo?: string;
  awayLogo?: string;
  homeColor?: string;
  awayColor?: string;
  onSnapshot?: (snapshot: MatchEngineV2Snapshot) => void;
  onExit?: () => void;
};

type OpenPanel = 'TACTICS' | 'SUBSTITUTIONS' | null;

export const getMatchV2PrimaryControlLabel = (
  hasStarted: boolean,
  halfTimePending: boolean,
  paused: boolean,
): string => halfTimePending
  ? 'II POŁOWA'
  : !hasStarted
    ? 'ROZPOCZNIJ MECZ'
    : paused
      ? 'WZNÓW'
      : 'PAUZA';

/**
 * Owns only the prototype match session and its presentation controls. Every
 * football decision is still sent through MatchEngineV2.applyCommand, so React
 * cannot silently edit lineups, tactical state, event history or RNG streams.
 */
export const MatchLiveV2Session = ({
  runtime,
  managedSide = 'HOME',
  initialPlayback,
  homeLogo,
  awayLogo,
  homeColor = '#3b82f6',
  awayColor = '#f43f5e',
  onSnapshot,
  onExit,
}: MatchLiveV2SessionProps) => {
  const makePlayback = (): MatchEngineV2PlaybackState => ({
    ...MatchEngineV2PlaybackService.create(initialPlayback),
    paused: initialPlayback?.paused ?? true,
  });
  const [snapshot, setSnapshot] = useState(() => MatchEngineV2.snapshot(runtime));
  const [playback, setPlayback] = useState<MatchEngineV2PlaybackState>(makePlayback);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(() => initialPlayback?.paused === false);
  const [halfTimePending, setHalfTimePending] = useState(false);
  const playbackRef = useRef(playback);
  const replayActiveRef = useRef(false);
  const panelRef = useRef<OpenPanel>(null);
  const wasPausedBeforePanelRef = useRef(true);
  const halfTimePendingRef = useRef(false);
  const lastTickRef = useRef(Date.now());

  const commitPlayback = (next: MatchEngineV2PlaybackState) => {
    playbackRef.current = next;
    setPlayback(next);
  };

  const commitSnapshot = () => {
    const next = MatchEngineV2.snapshot(runtime);
    setSnapshot(next);
    onSnapshot?.(next);
    return next;
  };

  useEffect(() => {
    // 250 ms keeps the authoritative advance (and the full-snapshot rerender
    // it triggers) responsive to pause/tactics without recomputing and
    // rerendering the whole 1920x1080 tree 10 times a second, which is what
    // made quiet play look jerky once match minutes started passing in
    // roughly a second of real time. The separate SVG frame hook still
    // animates a visible scene at browser frame rate on its own.
    const timer = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0, now - lastTickRef.current);
      lastTickRef.current = now;
      const current = playbackRef.current;
      if (current.paused || replayActiveRef.current || panelRef.current) return;

      const maximumSecond = runtime.rules.normalTimeSeconds + runtime.rules.extraTimeSeconds + 30 * 60;
      let next = MatchEngineV2PlaybackService.advance(current, elapsed, maximumSecond);
      if (next.targetSecond > runtime.core.state.second && runtime.core.state.phase !== 'FINISHED') {
        const phaseBeforeAdvance = runtime.core.state.phase;
        let requestedEngineSecond = next.targetSecond;
        if (phaseBeforeAdvance === 'FIRST_HALF') {
          const regulationBoundary = Math.floor(runtime.rules.normalTimeSeconds / 2);
          if (runtime.core.state.second < regulationBoundary) {
            requestedEngineSecond = Math.min(requestedEngineSecond, regulationBoundary);
          } else if (runtime.core.state.firstHalfAddedTimeSeconds === 0) {
            // One tick beyond regulation lets the core calculate stoppage time,
            // after which every later request can be capped at the exact whistle.
            requestedEngineSecond = Math.min(
              requestedEngineSecond,
              regulationBoundary + runtime.core.config.tickSeconds,
            );
          } else {
            requestedEngineSecond = Math.min(
              requestedEngineSecond,
              regulationBoundary + runtime.core.state.firstHalfAddedTimeSeconds,
            );
          }
        }
        const requestWasCapped = requestedEngineSecond < next.targetSecond;
        const nextSnapshot = MatchEngineV2.advanceTo(runtime, requestedEngineSecond);
        setSnapshot(nextSnapshot);
        onSnapshot?.(nextSnapshot);
        const reachedHalfTime = phaseBeforeAdvance === 'FIRST_HALF' && nextSnapshot.phase === 'SECOND_HALF';
        if (reachedHalfTime) {
          // Core half-time preparation is already deterministic. The session
          // now creates a real user-controlled break before any second-half
          // action can be requested from the engine.
          halfTimePendingRef.current = true;
          setHalfTimePending(true);
          next = {
            ...next,
            exactSecond: nextSnapshot.second,
            targetSecond: nextSnapshot.second,
            paused: true,
          };
        } else if (nextSnapshot.isFinished) {
          next = MatchEngineV2PlaybackService.setPaused(next, true);
        } else if (requestWasCapped) {
          next = {
            ...next,
            exactSecond: nextSnapshot.second,
            targetSecond: nextSnapshot.second,
          };
        }
      }
      commitPlayback(next);
    }, 250);
    return () => window.clearInterval(timer);
  }, [onSnapshot, runtime]);

  const openControlPanel = (panel: Exclude<OpenPanel, null>) => {
    wasPausedBeforePanelRef.current = playbackRef.current.paused;
    panelRef.current = panel;
    setOpenPanel(panel);
    commitPlayback(MatchEngineV2PlaybackService.setPaused(playbackRef.current, true));
  };

  const closeControlPanel = () => {
    panelRef.current = null;
    setOpenPanel(null);
    if (!wasPausedBeforePanelRef.current && !snapshot.isFinished) {
      commitPlayback(MatchEngineV2PlaybackService.setPaused(playbackRef.current, false));
    }
  };

  const applyCommand = (command: Parameters<typeof MatchEngineV2.applyCommand>[1]): boolean => {
    const accepted = MatchEngineV2.applyCommand(runtime, command);
    commitSnapshot();
    return accepted;
  };

  const applyTacticalPatch = (patch: MatchEngineV2TacticalPatch): boolean => {
    const accepted = applyCommand({
      type: 'UPDATE_INSTRUCTIONS',
      atSecond: runtime.core.state.second,
      side: managedSide,
      patch,
    });
    setStatusMessage(accepted ? 'NOWE USTAWIENIA TAKTYCZNE ZOSTAŁY PRZYJĘTE' : 'NIE UDAŁO SIĘ ZMIENIĆ TAKTYKI');
    return accepted;
  };

  const issueInstruction = (instructionId: UserCoachInstructionId | null): boolean => {
    const accepted = applyCommand({
      type: 'TOUCHLINE_INSTRUCTION',
      atSecond: runtime.core.state.second,
      side: managedSide,
      instructionId,
    });
    setStatusMessage(accepted ? 'POLECENIE ZOSTAŁO PRZEKAZANE DRUŻYNIE' : 'ZAWODNICY NIE SĄ JESZCZE GOTOWI NA KOLEJNE POLECENIE');
    return accepted;
  };

  const issueShout = (shoutId: UserCoachShoutId | null): boolean => {
    const accepted = applyCommand({
      type: 'COACH_SHOUT',
      atSecond: runtime.core.state.second,
      side: managedSide,
      shoutId,
    });
    setStatusMessage(accepted ? 'OKRZYK TRENERA DOTARŁ DO ZAWODNIKÓW' : 'NA KOLEJNY OKRZYK TRZEBA JESZCZE POCZEKAĆ');
    return accepted;
  };

  const applySubstitution = (playerOutId: string, playerInId: string): boolean => {
    const accepted = applyCommand({
      type: 'SUBSTITUTION',
      atSecond: runtime.core.state.second,
      side: managedSide,
      playerOutId,
      playerInId,
    });
    setStatusMessage(accepted ? 'ZMIANA ZOSTAŁA ZATWIERDZONA' : 'SILNIK ODRZUCIŁ NIEDOZWOLONĄ ZMIANĘ');
    return accepted;
  };

  const setSpeed = (speed: MatchEngineV2PlaybackSpeed) =>
    commitPlayback(MatchEngineV2PlaybackService.setSpeed(playbackRef.current, speed));
  const setSceneSpeed = (sceneSpeed: MatchEngineV2PlaybackSpeed) =>
    commitPlayback(MatchEngineV2PlaybackService.setSceneSpeed(playbackRef.current, sceneSpeed));
  const togglePrimaryControl = () => {
    if (snapshot.isFinished) return;
    if (!hasStarted) setHasStarted(true);
    if (halfTimePendingRef.current) {
      halfTimePendingRef.current = false;
      setHalfTimePending(false);
      commitPlayback(MatchEngineV2PlaybackService.setPaused(playbackRef.current, false));
      return;
    }
    commitPlayback(MatchEngineV2PlaybackService.setPaused(playbackRef.current, !playbackRef.current.paused));
  };
  const primaryControlLabel = getMatchV2PrimaryControlLabel(hasStarted, halfTimePending, playback.paused);
  const managedTeam = managedSide === 'HOME' ? runtime.core.input.home : runtime.core.input.away;
  const managedColor = managedSide === 'HOME' ? homeColor : awayColor;

  return (
    <>
      <MatchLiveV2Prototype
        snapshot={snapshot}
        playback={playback}
        home={runtime.core.input.home}
        away={runtime.core.input.away}
        homeLogo={homeLogo}
        awayLogo={awayLogo}
        homeColor={homeColor}
        awayColor={awayColor}
        managedSide={managedSide}
        onTogglePause={togglePrimaryControl}
        onSetSpeed={setSpeed}
        onSetSceneSpeed={setSceneSpeed}
        onToggleRenderMode={() => commitPlayback(MatchEngineV2PlaybackService.setRenderMode(
          playbackRef.current,
          playbackRef.current.renderMode === 'INTERACTIVE' ? 'CLASSIC' : 'INTERACTIVE',
        ))}
        onSetTransmissionMode={mode => commitPlayback(MatchEngineV2PlaybackService.setTransmissionMode(
          playbackRef.current,
          mode,
        ))}
        onToggleGoalReplays={() => commitPlayback(MatchEngineV2PlaybackService.setGoalReplays(
          playbackRef.current,
          !playbackRef.current.goalReplays,
        ))}
        onOpenTactics={() => openControlPanel('TACTICS')}
        onOpenSubstitutions={() => openControlPanel('SUBSTITUTIONS')}
        onReplayStateChange={active => { replayActiveRef.current = active; }}
        isHalfTime={halfTimePending}
        primaryControlLabel={primaryControlLabel}
        onExit={onExit}
      />

      {openPanel === 'TACTICS' && (
        <MatchEngineV2TacticsOverlay
          team={managedTeam}
          coachSummary={snapshot.coachPresentation[managedSide].summary}
          activeInstructionId={snapshot.coachState[managedSide].activeInstruction?.id ?? null}
          activeShoutId={snapshot.coachState[managedSide].activeShout?.id ?? null}
          statusMessage={statusMessage}
          accent={managedColor}
          onApplyPatch={applyTacticalPatch}
          onIssueInstruction={issueInstruction}
          onIssueShout={issueShout}
          onClose={closeControlPanel}
        />
      )}
      {openPanel === 'SUBSTITUTIONS' && (
        <MatchEngineV2SubstitutionOverlay
          team={managedTeam}
          side={managedSide}
          snapshot={snapshot}
          maxSubstitutions={runtime.rules.maxSubstitutions}
          statusMessage={statusMessage}
          accent={managedColor}
          onApply={applySubstitution}
          onClose={closeControlPanel}
        />
      )}
    </>
  );
};
