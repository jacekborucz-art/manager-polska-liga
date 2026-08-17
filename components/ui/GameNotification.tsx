import React from 'react';
import { useGame } from '../../context/GameContext';

export const GameNotification: React.FC = () => {
  const { gameNotification, clearGameNotification } = useGame();

  if (!gameNotification) return null;

  const toneStyles = {
    success: {
      badge: 'text-emerald-300',
      glow: 'from-emerald-500/30 via-emerald-400/10 to-transparent',
      accent: 'bg-emerald-400',
      border: 'border-emerald-400/20'
    },
    info: {
      badge: 'text-sky-300',
      glow: 'from-sky-500/30 via-sky-400/10 to-transparent',
      accent: 'bg-sky-400',
      border: 'border-sky-400/20'
    },
    warning: {
      badge: 'text-amber-300',
      glow: 'from-amber-500/30 via-amber-400/10 to-transparent',
      accent: 'bg-amber-400',
      border: 'border-amber-400/20'
    },
    error: {
      badge: 'text-rose-300',
      glow: 'from-rose-500/30 via-rose-400/10 to-transparent',
      accent: 'bg-rose-400',
      border: 'border-rose-400/20'
    }
  }[gameNotification.tone] || {
    badge: 'text-sky-300',
    glow: 'from-sky-500/30 via-sky-400/10 to-transparent',
    accent: 'bg-sky-400',
    border: 'border-sky-400/20'
  };

  if (gameNotification.display === 'modal') {
    return (
      <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/80 px-5 py-8 backdrop-blur-xl">
        <div className={`relative w-full max-w-3xl overflow-hidden rounded-[36px] border bg-slate-950/95 shadow-[0_45px_120px_rgba(0,0,0,0.80)] ${toneStyles.border}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${toneStyles.glow} opacity-70`} />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" viewBox="0 0 800 560" aria-hidden>
            <path d="M-40 110 C170 10 560 30 850 155" fill="none" stroke="#fb7185" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="12 14" />
            <circle cx="720" cy="475" r="145" fill="none" stroke="#ffffff" strokeOpacity="0.10" strokeWidth="2" />
            <circle cx="720" cy="475" r="92" fill="none" stroke="#fb7185" strokeOpacity="0.12" strokeWidth="2" />
          </svg>

          <div className="relative px-9 py-8 sm:px-12 sm:py-10">
            <div className="flex items-start gap-5">
              <div className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-rose-300/25 bg-rose-500/10 shadow-[0_0_25px_rgba(244,63,94,0.18)]">
                <span className="text-2xl" aria-hidden>⚑</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[10px] font-black uppercase tracking-[0.34em] ${toneStyles.badge}`}>
                  Oficjalna decyzja zarządu
                </div>
                <h2 className="mt-2 text-3xl font-black italic tracking-tight text-white sm:text-4xl">
                  {gameNotification.title}
                </h2>
              </div>
            </div>

            <div className="mt-7 rounded-[26px] border border-white/10 bg-black/25 px-7 py-6 shadow-inner">
              <p className="whitespace-pre-line text-[15px] font-medium leading-7 text-slate-200 sm:text-base">
                {gameNotification.message}
              </p>
            </div>

            <div className="mt-7 flex justify-end">
              <button
                onClick={clearGameNotification}
                className="rounded-[18px] border border-rose-300/30 bg-rose-500/15 px-8 py-3 text-xs font-black uppercase tracking-[0.18em] text-rose-100 transition-all hover:-translate-y-0.5 hover:border-rose-200/60 hover:bg-rose-500/25"
              >
                Przyjmuję do wiadomości
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[1400] flex justify-center px-4">
      <div className={`pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-[30px] border bg-slate-950/88 shadow-[0_40px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl ${toneStyles.border}`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${toneStyles.glow} opacity-80`} />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

        <div className="relative flex items-start gap-4 p-5 sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] border border-white/10 bg-white/5 shadow-inner">
            <div className={`h-3 w-3 rounded-full ${toneStyles.accent} shadow-[0_0_18px_currentColor]`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className={`text-[10px] font-black uppercase tracking-[0.38em] ${toneStyles.badge}`}>
              Centrum klubu
            </div>
            <h3 className="mt-2 text-xl font-black uppercase italic tracking-tight text-white sm:text-2xl">
              {gameNotification.title}
            </h3>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-300 sm:text-[15px]">
              {gameNotification.message}
            </p>
            {gameNotification.onAction && (
              <button
                onClick={() => { gameNotification.onAction!(); clearGameNotification(); }}
                className="mt-3 text-[11px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                {gameNotification.actionLabel ?? 'Przejdz do skladu →'}
              </button>
            )}
          </div>

          <button
            onClick={clearGameNotification}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-black text-slate-300 transition-all hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            X
          </button>
        </div>
      </div>
    </div>
  );
};
