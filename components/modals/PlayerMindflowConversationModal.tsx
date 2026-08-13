import React from 'react';
import { PlayerPosition } from '../../types';
import { useModalClose } from '../ui/useModalClose';
import { PlayerConversationScene } from './IndividualPlayerTalkModal';
import { PlayerConversationIdentity } from './PlayerConversationIdentity';

export type PlayerMindflowTheme = 'ROLE' | 'TRANSFER';

interface PlayerMindflowAnswer {
  id: string;
  text: string;
}

interface PlayerMindflowConversationModalProps {
  theme: PlayerMindflowTheme;
  playerName: string;
  playerLastName: string;
  overall: number;
  playerPosition: PlayerPosition;
  playerAge: number;
  clubKitColors: string[];
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
    hideMeta?: boolean;
  } | null;
  onAnswer: (answerId: string) => void;
  onEndConversation: () => void;
  onClose: () => void;
}

const THEMES: Record<PlayerMindflowTheme, {
  label: string;
  accentText: string;
  accentMuted: string;
  accentDot: string;
  accentLine: string;
  answerHover: string;
}> = {
  ROLE: {
    label: 'Rozmowa o roli w drużynie',
    accentText: 'text-violet-300',
    accentMuted: 'text-violet-200/60',
    accentDot: 'bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,0.75)]',
    accentLine: 'bg-violet-300',
    answerHover: 'hover:border-violet-300/40',
  },
  TRANSFER: {
    label: 'Rozmowa o przyszłości',
    accentText: 'text-amber-300',
    accentMuted: 'text-amber-200/60',
    accentDot: 'bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.72)]',
    accentLine: 'bg-amber-300',
    answerHover: 'hover:border-amber-300/40',
  },
};
export const PlayerMindflowConversationModal: React.FC<PlayerMindflowConversationModalProps> = ({
  theme,
  playerName,
  playerLastName,
  overall,
  playerPosition,
  playerAge,
  clubKitColors,
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
  const { closeModal, exitClass } = useModalClose(onClose);
  const accent = THEMES[theme];

  return (
    <div className={`fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-7 backdrop-blur-xl ${exitClass}`}>
      <div className="relative h-[min(920px,calc(100vh-56px))] w-[min(1660px,calc(100vw-64px))] overflow-hidden rounded-[48px]">
        <PlayerConversationScene />

        <div className="relative z-10 grid h-full grid-cols-[500px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col justify-between px-14 pb-12 pt-11">
            <div>
              <div className="flex items-center gap-3 text-[15px] font-semibold tracking-normal text-emerald-100">
                <span className={`h-2 w-2 rounded-full ${accent.accentDot}`} />
                Rozmowa z zawodnikiem
              </div>
              <p className={`mt-2 text-sm font-normal tracking-normal ${accent.accentMuted}`}>{accent.label}</p>
            </div>

            <div className="mb-2 max-w-[335px]">
              <PlayerConversationIdentity
                playerName={playerName}
                overall={overall}
                position={playerPosition}
                age={playerAge}
                kitColors={clubKitColors}
              />

              {!result && (
                <>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-light leading-none tracking-normal text-white">
                      {String(currentStep).padStart(2, '0')}
                    </span>
                    <span className="pb-1 text-xl font-normal tracking-normal text-cyan-100/40">
                      / {String(totalSteps).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${accent.accentLine}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}

              <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm font-normal text-slate-300/65">
                <div className="flex justify-between gap-4">
                  <span>Nastrój</span>
                  <span className={accent.accentText}>{moodLabel}</span>
                </div>
                {!result && (
                  <div className="flex justify-between gap-4">
                    <span>Przebieg rozmowy</span>
                    <span className="text-slate-100">{score} pkt</span>
                  </div>
                )}
              </div>

              <p className="mt-5 text-sm font-normal leading-relaxed tracking-normal text-slate-300/55">
                Odpowiedzi wpływają na nastawienie zawodnika, jego zaufanie i końcowy wynik rozmowy.
              </p>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col pb-11 pl-14 pr-16 pt-12">
            <header className="shrink-0 pr-8">
              <p className={`text-sm font-medium tracking-normal ${accent.accentText}`}>{subtitle}</p>
              <h1 className="mt-2 max-w-[980px] text-[42px] font-semibold leading-[1.12] tracking-[-0.025em] text-white">
                {result ? 'Podsumowanie rozmowy' : title}
              </h1>
            </header>

            {result ? (
              <section className="flex min-h-0 flex-1 flex-col justify-center pb-8">
                <div className="max-w-[980px]">
                  <div className={`flex items-center gap-3 text-[13px] font-medium ${result.isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
                    <span className={`h-2 w-2 rounded-full ${result.isPositive ? 'bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.75)]' : 'bg-rose-300 shadow-[0_0_12px_rgba(253,164,175,0.72)]'}`} />
                    Wynik rozmowy
                  </div>
                  <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.02em] text-white">{result.title}</h2>
                  <p className="mt-6 max-w-[980px] text-[23px] font-normal leading-[1.5] tracking-[-0.01em] text-slate-200">
                    {result.summary}
                  </p>
                  {!result.hideMeta && (
                    <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-sm font-normal text-slate-300/65">
                      <span>
                        Wynik <strong className="ml-2 font-semibold text-slate-100">{result.score} / {result.targetScore} pkt</strong>
                      </span>
                      <span>
                        Zmiana morale{' '}
                        <strong className={`ml-2 font-semibold ${result.moraleDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {result.moraleDelta > 0 ? '+' : ''}{result.moraleDelta}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="group ml-auto mt-14 flex min-w-[310px] items-center justify-between border-b border-emerald-300/35 py-4 text-left text-[17px] font-medium text-slate-100 transition-colors hover:border-emerald-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
                >
                  Zamknij rozmowę
                  <span className="text-xl font-light text-emerald-300/75 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </section>
            ) : (
              <section className="mt-7 flex min-h-0 flex-1 flex-col">
                {lastReaction && (
                  <blockquote className="mb-5 max-w-[1020px] border-l-2 border-cyan-300/55 py-1 pl-5">
                    <p className="text-[13px] font-medium tracking-normal text-cyan-200/65">Ostatnia reakcja zawodnika</p>
                    <p className="mt-2 text-[16px] font-normal leading-relaxed tracking-normal text-slate-200/85">„{lastReaction}”</p>
                  </blockquote>
                )}

                {question && (
                  <>
                    <div className="shrink-0">
                      <div className={`flex items-center gap-3 text-[13px] font-medium tracking-normal ${accent.accentText}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${accent.accentDot}`} />
                        {playerLastName}
                      </div>
                      <p className="mt-3 max-w-[1030px] text-[27px] font-semibold leading-[1.32] tracking-[-0.015em] text-slate-50">
                        {question}
                      </p>
                    </div>

                    <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-3 custom-scrollbar">
                      {answers.map((answer, answerIndex) => (
                        <button
                          key={answer.id}
                          type="button"
                          onClick={() => onAnswer(answer.id)}
                          className={`group relative flex min-h-[82px] w-full items-center border-b border-white/10 py-4 text-left transition-colors duration-200 first:border-t focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/60 ${accent.answerHover}`}
                        >
                          <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-cyan-400/10 to-transparent transition-[width] duration-300 group-hover:w-full" />
                          <span className={`relative w-14 shrink-0 text-[14px] font-medium tracking-normal ${accent.accentMuted}`}>
                            {String(answerIndex + 1).padStart(2, '0')}
                          </span>
                          <span className="relative pr-12 text-[17px] font-medium leading-[1.45] tracking-normal text-slate-200 transition-colors group-hover:text-white">
                            {answer.text}
                          </span>
                          <span className={`relative ml-auto mr-2 text-xl font-light opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-80 ${accent.accentText}`}>→</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={onEndConversation}
                  className="group ml-auto mt-4 flex min-w-[280px] shrink-0 items-center justify-between border-b border-rose-300/25 py-3 text-left text-[15px] font-medium text-slate-300/65 transition-colors hover:border-rose-300/60 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/50"
                >
                  Zakończ rozmowę
                  <span className="text-lg font-light text-rose-300/60 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
