import React from 'react';

export type PlayerMindflowTheme = 'ROLE' | 'TRANSFER';

interface PlayerMindflowAnswer {
  id: string;
  text: string;
}

interface PlayerMindflowConversationModalProps {
  theme: PlayerMindflowTheme;
  playerName: string;
  playerLastName: string;
  title: string;
  subtitle: string;
  moodLabel: string;
  currentStep: number;
  totalSteps: number;
  score: number;
  progress: number;
  question?: string;
  answers?: PlayerMindflowAnswer[];
  lastReaction?: string | null;
  result?: {
    title: string;
    summary: string;
    score: number;
    targetScore: number;
    moraleDelta: number;
    isPositive: boolean;
  } | null;
  onAnswer: (answerId: string) => void;
  onEndConversation: () => void;
  onClose: () => void;
}

const THEMES: Record<PlayerMindflowTheme, {
  accentText: string;
  gradient: string;
  glow: string;
  questionBox: string;
  answerHover: string;
  progressBar: string;
}> = {
  ROLE: {
    accentText: 'text-violet-400',
    gradient: 'via-violet-500',
    glow: 'rgba(139,92,246,0.08)',
    questionBox: 'border-violet-500/25 bg-violet-500/10',
    answerHover: 'hover:bg-violet-500/15 hover:border-t-violet-400/50 hover:border-x-violet-400/30 hover:border-b-violet-900/60',
    progressBar: 'bg-violet-500',
  },
  TRANSFER: {
    accentText: 'text-amber-400',
    gradient: 'via-amber-500',
    glow: 'rgba(245,158,11,0.08)',
    questionBox: 'border-amber-500/25 bg-amber-500/10',
    answerHover: 'hover:bg-amber-500/15 hover:border-t-amber-400/50 hover:border-x-amber-400/30 hover:border-b-amber-900/60',
    progressBar: 'bg-amber-500',
  },
};

export const PlayerMindflowConversationModal: React.FC<PlayerMindflowConversationModalProps> = ({
  theme,
  playerName,
  playerLastName,
  title,
  subtitle,
  moodLabel,
  currentStep,
  totalSteps,
  score,
  progress,
  question,
  answers = [],
  lastReaction,
  result,
  onAnswer,
  onEndConversation,
  onClose,
}) => {
  const accent = THEMES[theme];

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[40px] border border-white/10 bg-slate-900/70 shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
        <div className={`absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent ${accent.gradient} to-transparent`} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent.glow} 0%, transparent 60%)` }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className={`select-none whitespace-nowrap text-[110px] font-black italic uppercase tracking-tighter opacity-[0.035] ${accent.accentText}`}>
            {playerLastName}
          </span>
        </div>

        <header className="relative border-b border-white/5 px-8 pb-5 pt-8">
          <div className="flex justify-center">
            <span className={`text-[9px] font-black italic uppercase tracking-[0.25em] ${accent.accentText}`}>
              {subtitle}
            </span>
          </div>
          <h1 className="mt-2 text-center text-3xl font-black italic uppercase tracking-tighter text-white">
            ROZMOWA<br />
            <span className={accent.accentText}>{title}</span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
              ZAWODNIK: <span className="text-white">{playerName}</span>
            </span>
            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
              NASTRÓJ: <span className={accent.accentText}>{moodLabel}</span>
            </span>
          </div>
          {!result && (
            <>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full transition-all duration-500 ${accent.progressBar}`} style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[9px] font-black italic uppercase tracking-tighter text-slate-500">
                <span>ETAP {currentStep} / {totalSteps}</span>
                <span>PRZEBIEG ROZMOWY: {score} PKT</span>
              </div>
            </>
          )}
        </header>

        <div className="custom-scrollbar relative overflow-y-auto">
          {result ? (
            <div className="flex flex-col items-center gap-6 px-8 py-10 text-center">
              <div>
                <span className={`text-[9px] font-black italic uppercase tracking-[0.25em] ${result.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  WYNIK ROZMOWY
                </span>
                <h2 className="mt-3 text-3xl font-black italic uppercase tracking-tighter text-white">{result.title}</h2>
                <p className="mt-4 text-base font-black italic uppercase tracking-tighter leading-relaxed text-slate-200">{result.summary}</p>
                <p className="mt-5 text-xs font-black italic uppercase tracking-tighter text-slate-500">
                  WYNIK: {result.score} / {result.targetScore} PKT · ZMIANA MORALE: {result.moraleDelta > 0 ? '+' : ''}{result.moraleDelta}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`w-full rounded-2xl border-x border-b border-t px-6 py-4 text-sm font-black italic uppercase tracking-tighter text-white transition-all duration-200 active:translate-y-[2px] ${
                  result.isPositive
                    ? 'border-x-emerald-500/30 border-b-black/60 border-t-emerald-400/60 bg-emerald-600/80 hover:bg-emerald-500'
                    : 'border-x-red-500/30 border-b-black/60 border-t-red-400/60 bg-red-600/80 hover:bg-red-500'
                }`}
                style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              >
                ZAMKNIJ ROZMOWĘ
              </button>
            </div>
          ) : (
            <div className="px-8 py-6">
              {lastReaction && (
                <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center">
                  <span className="text-[9px] font-black italic uppercase tracking-[0.2em] text-slate-500">REAKCJA ZAWODNIKA</span>
                  <p className="mt-2 text-sm font-black italic uppercase tracking-tighter leading-relaxed text-white">{lastReaction}</p>
                </div>
              )}
              {question && (
                <>
                  <div className={`rounded-2xl border p-5 text-center ${accent.questionBox}`}>
                    <span className={`text-[9px] font-black italic uppercase tracking-[0.2em] ${accent.accentText}`}>{playerLastName}</span>
                    <p className="mt-3 text-lg font-black italic uppercase tracking-tighter leading-relaxed text-white">{question}</p>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {answers.map(answer => (
                      <button
                        key={answer.id}
                        onClick={() => onAnswer(answer.id)}
                        className={`w-full rounded-2xl border-x border-b border-t border-x-white/10 border-b-black/60 border-t-white/20 bg-white/[0.03] px-5 py-3.5 text-left transition-all duration-150 active:translate-y-[2px] ${accent.answerHover}`}
                        style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                      >
                        <span className="text-sm font-normal italic uppercase tracking-tighter leading-snug text-white">{answer.text}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-6 border-t border-white/5 pt-4">
                <button
                  onClick={onEndConversation}
                  className="mx-auto block w-full max-w-[420px] rounded-2xl border-x border-b border-t border-x-white/10 border-b-black/60 border-t-white/20 bg-transparent py-3 text-xs font-black italic uppercase tracking-tighter text-slate-500 transition-all duration-150 hover:bg-red-500/10 hover:text-red-300 active:translate-y-[2px]"
                  style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  ZAKOŃCZ ROZMOWĘ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};
