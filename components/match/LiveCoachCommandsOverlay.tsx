import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { MatchContext, MatchLiveState, UserCoachInstructionId, UserCoachShoutId } from '../../types';
import { LiveCoachCommandRuntimeService } from '../../services/LiveCoachCommandRuntimeService';
import { CoachCommandsPanel } from './CoachCommandsPanel';

export const LiveCoachCommandsOverlay = ({
  matchState,
  setMatchState,
  ctx,
  userSide,
  hidden = false,
}: {
  matchState: MatchLiveState;
  setMatchState: Dispatch<SetStateAction<MatchLiveState | null>>;
  ctx: MatchContext;
  userSide: 'HOME' | 'AWAY';
  hidden?: boolean;
}) => {
  const [aiBubble, setAiBubble] = useState<{ text: string; fading: boolean } | null>(null);
  const lastAnnouncementRef = useRef<string | null>(null);

  useEffect(() => {
    lastAnnouncementRef.current = null;
    setAiBubble(null);
  }, [matchState.fixtureId]);

  useEffect(() => {
    const announcement = matchState.aiCoachShoutAnnouncement;
    if (!announcement || announcement.id === lastAnnouncementRef.current) return;
    lastAnnouncementRef.current = announcement.id;
    setAiBubble({ text: announcement.text, fading: false });
    const fadeTimer = window.setTimeout(() => {
      setAiBubble(current => current ? { ...current, fading: true } : null);
    }, 1600);
    const removeTimer = window.setTimeout(() => setAiBubble(null), 2000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [matchState.aiCoachShoutAnnouncement?.id]);

  const handleInstruction = (id: UserCoachInstructionId | null) => {
    setMatchState(previous => previous
      ? { ...previous, ...LiveCoachCommandRuntimeService.issueUserInstruction(previous, id) }
      : previous
    );
  };

  const handleShout = (id: UserCoachShoutId | null) => {
    setMatchState(previous => previous
      ? {
          ...previous,
          ...LiveCoachCommandRuntimeService.issueUserShout({ state: previous, id, ctx, userSide }),
        }
      : previous
    );
  };

  return (
    <>
      <CoachCommandsPanel
        hidden={hidden}
        selectedInstructionId={matchState.userCoachInstruction?.id ?? null}
        instructionStartsMinute={matchState.userCoachInstruction?.startsMinute}
        instructionExpiryMinute={matchState.userCoachInstruction?.expiryMinute}
        selectedShoutId={matchState.userCoachShout?.id ?? null}
        currentMinute={matchState.minute}
        onInstructionSelect={handleInstruction}
        onShoutSelect={handleShout}
      />
      {aiBubble && !hidden && !matchState.isFinished && (
        <div
          className={`pointer-events-none fixed top-20 z-[440] max-w-[240px] transition-all duration-[400ms] ${
            userSide === 'HOME' ? 'right-6' : 'left-6'
          } ${aiBubble.fading ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'}`}
        >
          <div className="relative rounded-2xl border border-amber-200/55 bg-slate-950/95 px-4 py-3 text-center text-[11px] font-black italic uppercase tracking-tighter text-amber-100 shadow-[0_14px_38px_rgba(0,0,0,0.65),0_0_22px_rgba(251,191,36,0.16)] backdrop-blur-xl">
            <div className="mb-1 text-[8px] font-black italic uppercase tracking-tighter text-amber-400">TRENER AI</div>
            „{aiBubble.text}!”
            <div className={`absolute top-full h-0 w-0 border-x-[8px] border-x-transparent border-t-[9px] border-t-amber-200/55 ${
              userSide === 'HOME' ? 'right-6' : 'left-6'
            }`} />
          </div>
        </div>
      )}
    </>
  );
};
