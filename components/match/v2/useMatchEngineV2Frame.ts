import { useEffect, useRef, useState } from 'react';
import {
  MatchEngineV2FrameControllerService,
  type MatchEngineV2Frame,
  type MatchEngineV2FrameController,
  type MatchEngineV2PlaybackState,
  type MatchEngineV2Snapshot,
} from '../../../services/match/engines/v2';

type ControllerRef = {
  matchKey: string;
  controller: MatchEngineV2FrameController;
};

const currentTime = (): number =>
  typeof performance !== 'undefined' ? performance.now() : 0;

/**
 * Browser-only frame sampling for the SVG view. The hook never advances the
 * authoritative engine. It interpolates immutable snapshots and asks the host
 * to pause separately when a stored goal replay is displayed.
 */
export const useMatchEngineV2Frame = (
  snapshot: MatchEngineV2Snapshot,
  playback: MatchEngineV2PlaybackState,
  matchKey: string,
): MatchEngineV2Frame => {
  const controllerRef = useRef<ControllerRef | null>(null);
  if (
    !controllerRef.current ||
    controllerRef.current.matchKey !== matchKey ||
    snapshot.second < controllerRef.current.controller.lastSnapshotSecond
  ) {
    controllerRef.current = {
      matchKey,
      controller: MatchEngineV2FrameControllerService.create(snapshot, currentTime()),
    };
  }

  const [frame, setFrame] = useState<MatchEngineV2Frame>(() =>
    MatchEngineV2FrameControllerService.read(controllerRef.current!.controller, snapshot)
  );
  const snapshotRef = useRef(snapshot);
  const playbackRef = useRef(playback);
  snapshotRef.current = snapshot;
  playbackRef.current = playback;

  useEffect(() => {
    const controller = controllerRef.current!.controller;
    let animationFrame = 0;
    let cancelled = false;

    const sample = (wallClockMs: number) => {
      if (cancelled) return;
      // The match clock updates React state every 100 ms, but restarting the
      // requestAnimationFrame loop at the same frequency produced a visible
      // cadence and occasionally dropped the final frame of an action. Stable
      // refs let one uninterrupted browser loop consume the newest snapshot.
      const currentSnapshot = snapshotRef.current;
      const currentPlayback = playbackRef.current;
      const nextFrame = MatchEngineV2FrameControllerService.advance(
        controller,
        currentSnapshot,
        currentPlayback,
        wallClockMs,
      );
      setFrame(nextFrame);
      if (
        typeof requestAnimationFrame !== 'undefined' &&
        MatchEngineV2FrameControllerService.needsAnimation(controller, currentPlayback)
      ) {
        animationFrame = requestAnimationFrame(sample);
      }
    };

    sample(currentTime());
    return () => {
      cancelled = true;
      if (animationFrame && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(animationFrame);
    };
  }, [matchKey, playback.paused, playback.renderMode, playback.transmissionMode, playback.goalReplays]);

  useEffect(() => {
    if (!playback.paused) return;
    // While paused the continuous RAF loop is intentionally asleep. Refresh a
    // single frame when tactics or a substitution produces a new snapshot so
    // the static view still reflects that command immediately.
    setFrame(MatchEngineV2FrameControllerService.advance(
      controllerRef.current!.controller,
      snapshot,
      playback,
      currentTime(),
    ));
  }, [matchKey, playback, snapshot]);

  return frame;
};
