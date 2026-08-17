import React, { useState } from 'react';
import { useModalClose } from '../ui/useModalClose';
import { Player } from '../../types';
import {
  PlayerTransferRequestDialogService,
  TransferRequestDialogResult,
  TransferRequestDialogSession,
  TransferRequestManagerChoice,
} from '../../services/PlayerTransferRequestDialogService';
import { PlayerConversationScene } from './IndividualPlayerTalkModal';
import { PlayerConversationIdentity } from './PlayerConversationIdentity';

interface PlayerTransferRequestModalProps {
  player: Player;
  clubKitColors: string[];
  currentDate: Date;
  sessionSeed: number;
  onResolve: (result: TransferRequestDialogResult) => void;
  onClose: () => void;
}

type ModalStep = 'STEP_CHOICE' | 'STEP_DIALOG' | 'STEP_RESULT';

const computeSeasonEnd = (currentDate: Date): Date => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  return month < 6 ? new Date(year, 5, 30) : new Date(year + 1, 5, 30);
};

interface ChoiceOption {
  choice: TransferRequestManagerChoice;
  marker: string;
  label: string;
  labelColor: string;
  markerStyle: string;
  hoverBorder: string;
}

const CHOICE_OPTIONS: ChoiceOption[] = [
  {
    choice: 'PROMISE_CONTRACT',
    marker: 'A',
    label: 'Obiecaj lepszy kontrakt',
    labelColor: 'text-emerald-300',
    markerStyle: 'border-emerald-300/35 text-emerald-300',
    hoverBorder: 'hover:border-emerald-300/40',
  },
  {
    choice: 'LIST_IMMEDIATELY',
    marker: 'B',
    label: 'Wystaw natychmiast na listę transferową',
    labelColor: 'text-orange-300',
    markerStyle: 'border-orange-300/35 text-orange-300',
    hoverBorder: 'hover:border-orange-300/40',
  },
  {
    choice: 'ALLOW_END_OF_SEASON',
    marker: 'C',
    label: 'Zgoda na odejście po sezonie',
    labelColor: 'text-sky-300',
    markerStyle: 'border-sky-300/35 text-sky-300',
    hoverBorder: 'hover:border-sky-300/40',
  },
  {
    choice: 'REFUSE_IMPORTANT',
    marker: 'D',
    label: 'Odmów: jesteś zbyt ważny',
    labelColor: 'text-amber-300',
    markerStyle: 'border-amber-300/35 text-amber-300',
    hoverBorder: 'hover:border-amber-300/40',
  },
  {
    choice: 'REFUSE_NO_TALK',
    marker: 'E',
    label: 'Odmów rozmowy',
    labelColor: 'text-rose-300',
    markerStyle: 'border-rose-300/35 text-rose-300',
    hoverBorder: 'hover:border-rose-300/40',
  },
];

export const PlayerTransferRequestModal: React.FC<PlayerTransferRequestModalProps> = ({
  player,
  clubKitColors,
  currentDate,
  sessionSeed,
  onResolve,
  onClose,
}) => {
  const { closeModal, exitClass } = useModalClose(onClose);
  const [step, setStep] = useState<ModalStep>('STEP_CHOICE');
  const [session, setSession] = useState<TransferRequestDialogSession | null>(null);
  const [result, setResult] = useState<TransferRequestDialogResult | null>(null);
  const [chosenChoice, setChosenChoice] = useState<TransferRequestManagerChoice | null>(null);

  const playerName = `${player.firstName} ${player.lastName}`;
  const seasonEnd = computeSeasonEnd(currentDate);

  const handleChoiceSelect = (choice: TransferRequestManagerChoice) => {
    setChosenChoice(choice);

    if (choice === 'REFUSE_NO_TALK' || choice === 'LIST_IMMEDIATELY') {
      const finalResult = PlayerTransferRequestDialogService.finish(
        null,
        player,
        choice,
        currentDate,
        seasonEnd,
        sessionSeed,
      );
      setResult(finalResult);
      setStep('STEP_RESULT');
      onResolve(finalResult);
      return;
    }

    setSession(PlayerTransferRequestDialogService.createSession(choice));
    setStep('STEP_DIALOG');
  };

  const handleAnswer = (answerId: string) => {
    if (!session || !chosenChoice) return;
    const nextSession = PlayerTransferRequestDialogService.answer(session, answerId);
    setSession(nextSession);

    if (nextSession.currentQuestionIndex >= nextSession.questions.length) {
      const finalResult = PlayerTransferRequestDialogService.finish(
        nextSession,
        player,
        chosenChoice,
        currentDate,
        seasonEnd,
        sessionSeed,
      );
      setResult(finalResult);
      setStep('STEP_RESULT');
      onResolve(finalResult);
    }
  };

  const handleAbortDialog = () => {
    if (!session || !chosenChoice) return;
    const finalResult = PlayerTransferRequestDialogService.finish(
      null,
      player,
      'REFUSE_NO_TALK',
      currentDate,
      seasonEnd,
      sessionSeed,
    );
    setResult(finalResult);
    setStep('STEP_RESULT');
    onResolve(finalResult);
  };

  const currentQuestion = session ? session.questions[session.currentQuestionIndex] : null;
  const totalQuestions = session?.questions.length ?? 0;
  const answeredCount = session?.currentQuestionIndex ?? 0;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const reactionTone = result?.reaction === 'AGREED'
    ? 'text-emerald-300'
    : result?.reaction === 'THINKING'
      ? 'text-amber-300'
      : 'text-rose-300';
  const reactionDot = result?.reaction === 'AGREED'
    ? 'bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.75)]'
    : result?.reaction === 'THINKING'
      ? 'bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.72)]'
      : 'bg-rose-300 shadow-[0_0_12px_rgba(253,164,175,0.72)]';
  const reactionLabel = result?.reaction === 'AGREED'
    ? 'Zawodnik akceptuje'
    : result?.reaction === 'THINKING'
      ? 'Zawodnik zastanawia się'
      : 'Zawodnik odmawia';

  return (
    <div className={`fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-7 backdrop-blur-xl ${exitClass}`}>
      <div className="relative h-[min(920px,calc(100vh-56px))] w-[min(1660px,calc(100vw-64px))] overflow-hidden rounded-[48px]">
        <PlayerConversationScene />

        <div className="relative z-10 grid h-full grid-cols-[500px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col justify-between px-14 pb-12 pt-11">
            <div>
              <div className="flex items-center gap-3 text-[15px] font-semibold tracking-normal text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-orange-300 shadow-[0_0_12px_rgba(253,186,116,0.72)]" />
                Rozmowa z zawodnikiem
              </div>
              <p className="mt-2 text-sm font-normal tracking-normal text-orange-200/55">Prośba transferowa</p>
            </div>

            <div className="mb-2 max-w-[335px]">
              <PlayerConversationIdentity
                playerName={playerName}
                overall={player.overallRating}
                position={player.position}
                age={player.age}
                kitColors={clubKitColors}
              />

              {step === 'STEP_DIALOG' && (
                <>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-light leading-none tracking-normal text-white">
                      {String(Math.min(answeredCount + 1, totalQuestions)).padStart(2, '0')}
                    </span>
                    <span className="pb-1 text-xl font-normal tracking-normal text-cyan-100/40">
                      / {String(totalQuestions).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-orange-300 transition-[width] duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </>
              )}

            </div>
          </aside>

          <main className="flex min-h-0 flex-col pb-11 pl-14 pr-16 pt-12">
            <header className="shrink-0 pr-8">
              <p className="text-sm font-medium tracking-normal text-orange-300/85">Przyszłość zawodnika w klubie</p>
              <h1 className="mt-2 max-w-[980px] text-[42px] font-semibold leading-[1.12] tracking-[-0.025em] text-white">
                {step === 'STEP_CHOICE' && 'Odpowiedz na prośbę transferową'}
                {step === 'STEP_DIALOG' && 'Porozmawiaj o swojej decyzji'}
                {step === 'STEP_RESULT' && 'Podsumowanie rozmowy'}
              </h1>
            </header>

            {step === 'STEP_CHOICE' && (
              <section className="mt-7 flex min-h-0 flex-1 flex-col">
                <p className="shrink-0 text-[17px] font-normal leading-relaxed tracking-normal text-slate-300/70">
                  Wybierz sposób odpowiedzi na prośbę zawodnika
                </p>

                <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-3 custom-scrollbar">
                  {CHOICE_OPTIONS.map(option => (
                    <button
                      key={option.choice}
                      type="button"
                      onClick={() => handleChoiceSelect(option.choice)}
                      className={`group relative flex min-h-[78px] w-full items-center border-b border-white/10 py-4 text-left transition-colors duration-200 first:border-t focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-300/60 ${option.hoverBorder}`}
                    >
                      <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-orange-400/10 to-transparent transition-[width] duration-300 group-hover:w-full" />
                      <span className={`relative mr-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold ${option.markerStyle}`}>
                        {option.marker}
                      </span>
                      <span className="relative min-w-0 pr-12">
                        <span className={`block text-[18px] font-semibold leading-snug tracking-[-0.01em] ${option.labelColor}`}>
                          {option.label}
                        </span>
                      </span>
                      <span className="relative ml-auto mr-2 text-xl font-light text-orange-300/0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-orange-300/80">→</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="group ml-auto mt-4 flex min-w-[280px] shrink-0 items-center justify-between border-b border-white/20 py-3 text-left text-[15px] font-medium text-slate-300/60 transition-colors hover:border-white/40 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Zamknij bez rozmowy
                  <span className="text-lg font-light text-slate-300/50 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </section>
            )}

            {step === 'STEP_DIALOG' && session && (
              <section className="mt-7 flex min-h-0 flex-1 flex-col">
                {session.lastReaction && (
                  <blockquote className="mb-5 max-w-[1020px] border-l-2 border-orange-300/55 py-1 pl-5">
                    <p className="text-[13px] font-medium tracking-normal text-orange-200/65">Ostatnia reakcja zawodnika</p>
                    <p className="mt-2 text-[16px] font-normal leading-relaxed tracking-normal text-slate-200/85">„{session.lastReaction}”</p>
                  </blockquote>
                )}

                {currentQuestion && (
                  <>
                    <div className="shrink-0">
                      <div className="flex items-center gap-3 text-[13px] font-medium tracking-normal text-orange-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-300 shadow-[0_0_12px_rgba(253,186,116,0.72)]" />
                        {player.lastName}
                      </div>
                      <p className="mt-3 max-w-[1030px] text-[27px] font-semibold leading-[1.32] tracking-[-0.015em] text-slate-50">
                        {currentQuestion.playerText}
                      </p>
                    </div>

                    <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-3 custom-scrollbar">
                      {currentQuestion.answers.map((answer, answerIndex) => (
                        <button
                          key={answer.id}
                          type="button"
                          onClick={() => handleAnswer(answer.id)}
                          className="group relative flex min-h-[82px] w-full items-center border-b border-white/10 py-4 text-left transition-colors duration-200 first:border-t hover:border-orange-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-300/60"
                        >
                          <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-orange-400/10 to-transparent transition-[width] duration-300 group-hover:w-full" />
                          <span className="relative w-14 shrink-0 text-[14px] font-medium tracking-normal text-orange-200/60">
                            {String(answerIndex + 1).padStart(2, '0')}
                          </span>
                          <span className="relative pr-12 text-[17px] font-medium leading-[1.45] tracking-normal text-slate-200 transition-colors group-hover:text-white">
                            {answer.text}
                          </span>
                          <span className="relative ml-auto mr-2 text-xl font-light text-orange-300/0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-orange-300/80">→</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleAbortDialog}
                  className="group ml-auto mt-4 flex min-w-[320px] shrink-0 items-center justify-between border-b border-rose-300/25 py-3 text-left text-[15px] font-medium text-slate-300/65 transition-colors hover:border-rose-300/60 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/50"
                >
                  Zakończ rozmowę przedwcześnie
                  <span className="text-lg font-light text-rose-300/60 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </section>
            )}

            {step === 'STEP_RESULT' && result && (
              <section className="mt-7 flex min-h-0 flex-1 flex-col overflow-y-auto pr-3 custom-scrollbar">
                <div className="max-w-[1000px]">
                  <div className={`flex items-center gap-3 text-[13px] font-medium ${reactionTone}`}>
                    <span className={`h-2 w-2 rounded-full ${reactionDot}`} />
                    {reactionLabel}
                  </div>
                  <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.02em] text-white">{result.title}</h2>
                  <p className="mt-5 max-w-[980px] text-[22px] font-normal leading-[1.48] tracking-[-0.01em] text-slate-200">
                    {result.summary}
                  </p>

                  {result.promiseMade && (
                    <div className="mt-7 border-l-2 border-emerald-300/60 py-1 pl-5">
                      <p className="text-[13px] font-medium text-emerald-300">Obietnica kontraktowa zapisana</p>
                      <p className="mt-2 text-[17px] font-medium text-slate-100">
                        Zawodnik oczekuje podwyżki o <span className="text-emerald-300">+{result.promiseMade.salaryRaisePct}%</span>.
                      </p>
                      <p className="mt-1 text-[13px] font-normal text-slate-400/70">
                        Termin realizacji: koniec sezonu
                      </p>
                    </div>
                  )}

                  {result.allowAfterSeasonFlag && (
                    <div className="mt-7 border-l-2 border-sky-300/60 py-1 pl-5">
                      <p className="text-[13px] font-medium text-sky-300">Obietnica odejścia po sezonie</p>
                      <p className="mt-2 text-[17px] font-medium text-slate-100">
                        Musisz wystawić zawodnika na listę po zakończeniu sezonu.
                      </p>
                      <p className="mt-1 text-[13px] font-normal text-slate-400/70">
                        Termin realizacji: 30 czerwca
                      </p>
                    </div>
                  )}

                  {result.listImmediatelyFlag && (
                    <div className="mt-7 border-l-2 border-orange-300/60 py-1 pl-5">
                      <p className="text-[13px] font-medium text-orange-300">Lista transferowa zaktualizowana</p>
                      <p className="mt-2 text-[17px] font-medium text-slate-100">
                        Zawodnik jest od razu dostępny do transferu.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="group ml-auto mt-auto flex min-w-[310px] shrink-0 items-center justify-between border-b border-orange-300/35 py-4 text-left text-[17px] font-medium text-slate-100 transition-colors hover:border-orange-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60"
                >
                  Zamknij rozmowę
                  <span className="text-xl font-light text-orange-300/75 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
