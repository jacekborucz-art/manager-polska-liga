import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { MatchEventType, ViewState } from '../../types';

const CROWD_AUDIO_MUTED_STORAGE_KEY = 'fm_live_match_crowd_muted';
const CROWD_VOLUME = 0.16;
const GOAL_SOUND_VOLUME = 0.72;
const NEGATIVE_REACTION_VOLUME = 0.68;
const GOAL_SOUND_URL = new URL('../../sounds/goal.mp3', import.meta.url).href;
const CROWD_SOUND_URL = new URL('../../sounds/kibice.MP3', import.meta.url).href;
const NEGATIVE_REACTION_SOUND_URL = new URL('../../sounds/missed penalty_var.MP3', import.meta.url).href;
const activeEventSounds = new Set<HTMLAudioElement>();

const LIVE_MATCH_VIEWS = new Set<ViewState>([
  ViewState.MATCH_LIVE,
  ViewState.MATCH_LIVE_CUP,
  ViewState.MATCH_LIVE_PLAYOFF,
  ViewState.MATCH_LIVE_FRIENDLY,
  ViewState.MATCH_LIVE_CL,
  ViewState.MATCH_LIVE_EL,
  ViewState.MATCH_LIVE_CONF,
]);

type BrowserWindowWithAudioContext = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

interface MatchAudioSnapshot {
  fixtureId: string;
  minute: number;
  period: number;
  speed: number;
  isPaused: boolean;
  isHalfTime: boolean;
  isFinished: boolean;
}

const getAudioContextConstructor = () => {
  const browserWindow = window as BrowserWindowWithAudioContext;
  return window.AudioContext ?? browserWindow.webkitAudioContext;
};

/**
 * Generates a short referee-whistle pattern. A single whistle is used for
 * kick-offs and penalties, two for half-time and three for full-time.
 */
const playRefereeWhistle = (whistleCount: 1 | 2 | 3): void => {
  const AudioContextConstructor = getAudioContextConstructor();
  if (!AudioContextConstructor) return;

  const audioContext = new AudioContextConstructor();
  const masterGain = audioContext.createGain();
  const whistleFilter = audioContext.createBiquadFilter();

  masterGain.gain.value = 0.58;
  whistleFilter.type = 'bandpass';
  whistleFilter.frequency.value = 3150;
  whistleFilter.Q.value = 0.85;
  whistleFilter.connect(masterGain);
  masterGain.connect(audioContext.destination);

  const firstWhistleAt = audioContext.currentTime + 0.035;
  const spacing = 0.34;
  const whistleDuration = whistleCount === 3 ? 0.23 : 0.28;

  for (let index = 0; index < whistleCount; index += 1) {
    const startsAt = firstWhistleAt + index * spacing;
    const endsAt = startsAt + whistleDuration;
    const envelope = audioContext.createGain();
    const carrier = audioContext.createOscillator();
    const overtone = audioContext.createOscillator();
    const overtoneGain = audioContext.createGain();
    const trill = audioContext.createOscillator();
    const trillDepth = audioContext.createGain();
    const baseFrequency = 2840 + (index % 2) * 90;

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(baseFrequency, startsAt);
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(baseFrequency * 1.94, startsAt);
    overtoneGain.gain.value = 0.18;

    trill.type = 'sine';
    trill.frequency.value = 30;
    trillDepth.gain.value = 165;
    trill.connect(trillDepth);
    trillDepth.connect(carrier.frequency);

    envelope.gain.setValueAtTime(0.0001, startsAt);
    envelope.gain.exponentialRampToValueAtTime(0.13, startsAt + 0.012);
    envelope.gain.setValueAtTime(0.115, endsAt - 0.055);
    envelope.gain.exponentialRampToValueAtTime(0.0001, endsAt);

    carrier.connect(envelope);
    overtone.connect(overtoneGain);
    overtoneGain.connect(envelope);
    envelope.connect(whistleFilter);

    carrier.start(startsAt);
    overtone.start(startsAt);
    trill.start(startsAt);
    carrier.stop(endsAt);
    overtone.stop(endsAt);
    trill.stop(endsAt);
  }

  void audioContext.resume().catch(() => undefined);

  const totalDurationMs = ((whistleCount - 1) * spacing + whistleDuration) * 1000;
  window.setTimeout(() => {
    whistleFilter.disconnect();
    masterGain.disconnect();
    void audioContext.close().catch(() => undefined);
  }, totalDurationMs + 180);
};

const stopActiveEventSounds = (): void => {
  activeEventSounds.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeEventSounds.clear();
};

const playEventSound = (url: string, volume: number): void => {
  const audio = new Audio(url);
  audio.preload = 'auto';
  audio.volume = volume;
  activeEventSounds.add(audio);

  const releaseAudio = () => {
    activeEventSounds.delete(audio);
    audio.removeEventListener('ended', releaseAudio);
    audio.removeEventListener('error', releaseAudio);
  };

  audio.addEventListener('ended', releaseAudio);
  audio.addEventListener('error', releaseAudio);
  void audio.play().catch(releaseAudio);
};

const playGoalCelebration = (): void => playEventSound(GOAL_SOUND_URL, GOAL_SOUND_VOLUME);
const playDisallowedGoalReaction = (): void => playEventSound(NEGATIVE_REACTION_SOUND_URL, NEGATIVE_REACTION_VOLUME);
const playMissedPenaltyReaction = (): void => playEventSound(NEGATIVE_REACTION_SOUND_URL, NEGATIVE_REACTION_VOLUME);

/** Plays the supplied twenty-second stadium recording as a continuous match loop. */
const startCrowdAmbience = (): (() => void) | null => {
  const audio = new Audio(CROWD_SOUND_URL);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  let fadeFrame = 0;
  const fadeStartedAt = performance.now();

  const fadeIn = (timestamp: number) => {
    const progress = Math.min(1, (timestamp - fadeStartedAt) / 1200);
    audio.volume = CROWD_VOLUME * progress;
    if (progress < 1) fadeFrame = window.requestAnimationFrame(fadeIn);
  };

  void audio.play()
    .then(() => {
      fadeFrame = window.requestAnimationFrame(fadeIn);
    })
    .catch(() => undefined);

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    window.cancelAnimationFrame(fadeFrame);
    audio.pause();
    audio.currentTime = 0;
  };
};

export const LiveMatchCrowdAudio: React.FC = () => {
  const { viewState, activeMatchState } = useGame();
  const previousMatchStateRef = useRef<MatchAudioSnapshot | null>(null);
  const emittedTransitionCuesRef = useRef(new Set<string>());
  const knownPenaltyLogsRef = useRef(new Set<string>());
  const knownMissedPenaltyLogsRef = useRef(new Set<string>());
  const knownGoalLogsRef = useRef(new Set<string>());
  const knownDisallowedGoalLogsRef = useRef(new Set<string>());
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return window.localStorage.getItem(CROWD_AUDIO_MUTED_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const isLiveMatchView = LIVE_MATCH_VIEWS.has(viewState);
  const shouldPlay = isLiveMatchView && !!activeMatchState && !activeMatchState.isFinished && !isMuted;

  useEffect(() => {
    if (!shouldPlay) return undefined;
    return startCrowdAmbience() ?? undefined;
  }, [shouldPlay, activeMatchState?.fixtureId]);

  useEffect(() => {
    if (isMuted || !isLiveMatchView || activeMatchState?.speed === 5) {
      stopActiveEventSounds();
    }
  }, [activeMatchState?.speed, isLiveMatchView, isMuted]);

  useEffect(() => {
    if (!isLiveMatchView || !activeMatchState) {
      previousMatchStateRef.current = null;
      emittedTransitionCuesRef.current.clear();
      knownPenaltyLogsRef.current.clear();
      knownMissedPenaltyLogsRef.current.clear();
      knownGoalLogsRef.current.clear();
      knownDisallowedGoalLogsRef.current.clear();
      return;
    }

    const currentSnapshot: MatchAudioSnapshot = {
      fixtureId: activeMatchState.fixtureId,
      minute: activeMatchState.minute,
      period: activeMatchState.period,
      speed: activeMatchState.speed,
      isPaused: activeMatchState.isPaused,
      isHalfTime: activeMatchState.isHalfTime,
      isFinished: activeMatchState.isFinished,
    };
    const previousSnapshot = previousMatchStateRef.current;

    if (!previousSnapshot || previousSnapshot.fixtureId !== currentSnapshot.fixtureId) {
      previousMatchStateRef.current = currentSnapshot;
      emittedTransitionCuesRef.current.clear();
      knownPenaltyLogsRef.current = new Set(
        activeMatchState.logs
          .filter(log => log.type === MatchEventType.PENALTY_AWARDED)
          .map(log => log.id),
      );
      knownMissedPenaltyLogsRef.current = new Set(
        activeMatchState.logs
          .filter(log => log.type === MatchEventType.PENALTY_MISSED)
          .map(log => log.id),
      );
      knownGoalLogsRef.current = new Set(
        activeMatchState.logs
          .filter(log => log.type === MatchEventType.GOAL || log.type === MatchEventType.PENALTY_SCORED)
          .map(log => log.id),
      );
      knownDisallowedGoalLogsRef.current = new Set(
        activeMatchState.logs
          .filter(log => log.id.startsWith('VAR_DISALLOWED_'))
          .map(log => log.id),
      );
      return;
    }

    const emitTransitionCue = (cueName: string, whistleCount: 1 | 2 | 3) => {
      const cueKey = `${currentSnapshot.fixtureId}:${cueName}`;
      if (emittedTransitionCuesRef.current.has(cueKey)) return;
      emittedTransitionCuesRef.current.add(cueKey);
      if (!isMuted) playRefereeWhistle(whistleCount);
    };

    if (
      previousSnapshot.isPaused
      && !currentSnapshot.isPaused
      && currentSnapshot.period === 1
      && currentSnapshot.minute === 0
    ) {
      emitTransitionCue('FIRST_HALF_START', 1);
    }

    if (
      !previousSnapshot.isHalfTime
      && currentSnapshot.isHalfTime
      && currentSnapshot.period === 2
    ) {
      emitTransitionCue('HALF_TIME', 2);
    }

    if (
      previousSnapshot.isHalfTime
      && !currentSnapshot.isHalfTime
      && currentSnapshot.period === 2
      && !currentSnapshot.isFinished
    ) {
      emitTransitionCue('SECOND_HALF_START', 1);
    }

    if (!previousSnapshot.isFinished && currentSnapshot.isFinished) {
      emitTransitionCue('FULL_TIME', 3);
    }

    activeMatchState.logs.forEach(log => {
      if (
        log.type !== MatchEventType.PENALTY_AWARDED
        || knownPenaltyLogsRef.current.has(log.id)
      ) return;

      knownPenaltyLogsRef.current.add(log.id);
      if (!isMuted && currentSnapshot.speed !== 5) playRefereeWhistle(1);
    });

    activeMatchState.logs.forEach(log => {
      if (log.type === MatchEventType.PENALTY_MISSED && !knownMissedPenaltyLogsRef.current.has(log.id)) {
        knownMissedPenaltyLogsRef.current.add(log.id);
        if (!isMuted && currentSnapshot.speed !== 5) playMissedPenaltyReaction();
      }

      const isGoal = log.type === MatchEventType.GOAL || log.type === MatchEventType.PENALTY_SCORED;
      if (isGoal && !knownGoalLogsRef.current.has(log.id)) {
        knownGoalLogsRef.current.add(log.id);
        if (!isMuted && currentSnapshot.speed !== 5) playGoalCelebration();
      }

      if (log.id.startsWith('VAR_DISALLOWED_') && !knownDisallowedGoalLogsRef.current.has(log.id)) {
        knownDisallowedGoalLogsRef.current.add(log.id);
        if (!isMuted && currentSnapshot.speed !== 5) playDisallowedGoalReaction();
      }
    });

    previousMatchStateRef.current = currentSnapshot;
  }, [activeMatchState, isLiveMatchView, isMuted]);

  if (!isLiveMatchView || !activeMatchState || activeMatchState.isFinished) return null;

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      window.localStorage.setItem(CROWD_AUDIO_MUTED_STORAGE_KEY, nextMuted ? '1' : '0');
    } catch {
      // The control still works for the current match if storage is unavailable.
    }
  };

  const controlLabel = isMuted ? 'Włącz dźwięki meczu' : 'Wycisz dźwięki meczu';

  return (
    <button
      type="button"
      onClick={toggleSound}
      className={`fixed bottom-5 right-5 z-[88] flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 ${
        isMuted
          ? 'border-slate-500/40 bg-slate-950/75 text-slate-400 hover:text-white'
          : 'border-cyan-300/45 bg-cyan-950/75 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.2)] hover:text-white'
      }`}
      aria-label={controlLabel}
      title={controlLabel}
    >
      {isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
    </button>
  );
};
