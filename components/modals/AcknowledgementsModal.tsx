import React, { useEffect, useRef, useState } from 'react';
import { SoccerBall } from '../ui/SoccerBall';

interface AcknowledgementsModalProps {
  onClose: () => void;
}

const TESTERS = [
  'PJ BRO',
  'Gerard Horwath',
  'Kacper Kiełek',
  'Tomasz Czapla',
  'Damian Kula',
  'Krystian Andryańczyk',
  'Paweł Bajon',
] as const;

// Alternating cool colors make adjacent names easier to follow without adding boxes.
const TESTER_TEXT_COLORS = ['text-emerald-300', 'text-cyan-300'] as const;
const VISIBLE_BEFORE_AUTO_EXIT_MS = 11_000;
const FADE_DURATION_MS = 1_500;

/**
 * Third and final screen in the startup sequence. Its visual structure mirrors
 * the legal and screen-requirements modals: one translucent panel, one subtle
 * border and unboxed text. It fades out automatically, while any mouse click or
 * Escape starts the same slow exit immediately and then reveals the main menu.
 */
export const AcknowledgementsModal: React.FC<AcknowledgementsModalProps> = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);
  const autoExitTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const closeWithFade = React.useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosing(true);
    if (autoExitTimeoutRef.current !== null) window.clearTimeout(autoExitTimeoutRef.current);
    closeTimeoutRef.current = window.setTimeout(onClose, FADE_DURATION_MS);
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeWithFade();
    };
    window.addEventListener('keydown', handleEscape);
    autoExitTimeoutRef.current = window.setTimeout(closeWithFade, VISIBLE_BEFORE_AUTO_EXIT_MS);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      if (autoExitTimeoutRef.current !== null) window.clearTimeout(autoExitTimeoutRef.current);
      if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current);
    };
  }, [closeWithFade]);

  return (
    <div
      className={`fixed inset-0 z-[90] flex cursor-pointer items-center justify-center bg-black/60 p-6 backdrop-blur-sm ${isClosing ? 'acknowledgements-slow-out pointer-events-none' : 'acknowledgements-slow-in'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="acknowledgements-title"
      onClick={closeWithFade}
    >
      <div
        className="relative mx-6 w-full max-w-3xl rounded-[24px] border border-white/10 bg-slate-900/40 p-10 text-center"
        style={{ fontFamily: "'Archivo', sans-serif" }}
      >
        <h2 id="acknowledgements-title" className="font-black italic uppercase tracking-tighter text-[34px] text-amber-400">
          Podziękowania
        </h2>
        <div className="mx-auto mt-4 h-px w-full bg-amber-500/30" />

        <section className="mt-6">
          <h3 className="font-black italic uppercase tracking-tighter text-[20px] text-emerald-400">Testerzy</h3>
          <ul className="mx-auto mt-4 flex w-fit flex-col items-start gap-2.5">
            {TESTERS.map((tester, index) => {
              const testerColor = TESTER_TEXT_COLORS[index % TESTER_TEXT_COLORS.length];
              return (
                <li key={tester} className="flex items-center gap-3">
                  <SoccerBall className="h-5 w-5 shrink-0 opacity-90" />
                  <span className={`font-black italic uppercase tracking-tighter text-[15px] ${testerColor}`}>
                    {tester}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="font-black italic uppercase tracking-tighter text-[20px] text-cyan-300">DataPack</h3>
          <div className="mt-2 flex items-center justify-center gap-3">
            <SoccerBall className="h-5 w-5 shrink-0 opacity-90" />
            <p className="font-black italic uppercase tracking-tighter text-[15px] text-slate-200">Tomasz Czapla</p>
          </div>
        </section>

        <p className="font-black italic uppercase tracking-tighter mx-auto mt-7 max-w-2xl text-[13px] leading-relaxed text-slate-400">
          Podziękowania dla wszystkich innych osób, które wspierają ten projekt open-source.
        </p>
        <p className="font-black italic uppercase tracking-tighter mt-5 text-[9px] text-white/30">
          Kliknij, aby przejść do menu
        </p>
      </div>

      <style>{`
        @keyframes acknowledgements-slow-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes acknowledgements-slow-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .acknowledgements-slow-in {
          animation: acknowledgements-slow-in ${FADE_DURATION_MS}ms ease-in-out both;
        }
        .acknowledgements-slow-out {
          animation: acknowledgements-slow-out ${FADE_DURATION_MS}ms ease-in-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .acknowledgements-slow-in,
          .acknowledgements-slow-out { animation-duration: 1ms !important; }
        }
      `}</style>
    </div>
  );
};
