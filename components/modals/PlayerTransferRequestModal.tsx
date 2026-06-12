// ═════════════════════════════════════════════════════════════════════════════
// PlayerTransferRequestModal
//
// Modal dialogu trenera z zawodnikiem po odebraniu prośby o listę transferową.
//
// ── KROKI UI ──────────────────────────────────────────────────────────────────
//   STEP_CHOICE  — 4 przyciski (A, B, C, D) z opisem konsekwencji każdej ścieżki
//   STEP_DIALOG  — pytanie gracza + 3 opcje odpowiedzi (ścieżki A, B, C)
//                  (dla D: przejście do STEP_RESULT jest natychmiastowe)
//   STEP_RESULT  — finalna reakcja gracza + zmiana morale + podsumowanie
//
// ── LOGIKA ────────────────────────────────────────────────────────────────────
//   Cała logika (scoring, obliczanie reakcji, obietnice) jest w:
//     services/PlayerTransferRequestDialogService.ts
//
//   Wynik przekazywany do GameContext przez prop onResolve.
//   GameContext.resolvePlayerTransferRequestDialog stosuje wszystkie zmiany.
//
// ── SEZON END DATE ────────────────────────────────────────────────────────────
//   Obliczany wewnętrznie z currentDate (30 czerwca bieżącego lub następnego roku).
//   Używany jako deadline obietnic ścieżki A i B.
//   Zmień komputację w computeSeasonEnd() jeśli zmieni się kalendarz sezonu.
//
// ── POWIĄZANE PLIKI ───────────────────────────────────────────────────────────
//   services/PlayerTransferRequestDialogService.ts → cała logika
//   components/views/PlayerCard.tsx                → setIsTransferRequestDialogOpen
//   context/GameContext.tsx                        → resolvePlayerTransferRequestDialog
// ═════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useModalClose } from '../ui/useModalClose';
import { Player } from '../../types';
import {
  PlayerTransferRequestDialogService,
  TransferRequestDialogResult,
  TransferRequestDialogSession,
  TransferRequestManagerChoice,
} from '../../services/PlayerTransferRequestDialogService';

interface PlayerTransferRequestModalProps {
  player: Player;
  currentDate: Date;
  sessionSeed: number;
  onResolve: (result: TransferRequestDialogResult) => void;
  onClose: () => void;
}

type ModalStep = 'STEP_CHOICE' | 'STEP_DIALOG' | 'STEP_RESULT';

/**
 * Oblicza koniec sezonu z bieżącej daty.
 * Sezon w polskim kalendarzu kończy się 30 czerwca.
 * Jeśli jesteśmy w lipcu lub później — koniec jest w przyszłym roku.
 * Kalibracja: zmień logikę poniżej jeśli zmieni się struktura sezonu.
 */
const computeSeasonEnd = (currentDate: Date): Date => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 = styczeń
  return month < 6
    ? new Date(year, 5, 30)       // Jan–Cze → 30 czerwca tego roku
    : new Date(year + 1, 5, 30);  // Lip–Gru → 30 czerwca następnego roku
};

/** Definicja jednego przycisku wyboru ścieżki (STEP_CHOICE). */
interface ChoiceOption {
  choice: TransferRequestManagerChoice;
  label: string;
  description: string;
  /** Krótkie ostrzeżenie o konsekwencjach — wyświetlane czerwonym tekstem. */
  warning: string;
  accentColor: string;
  borderColor: string;
  hoverBg: string;
  labelColor: string;
}

/** Konfiguracja 4 ścieżek wyświetlanych w STEP_CHOICE.
 *  Zmień teksty tutaj, żeby dostosować UX — logika zostaje bez zmian. */
const CHOICE_OPTIONS: ChoiceOption[] = [
  {
    choice: 'PROMISE_CONTRACT',
    label: 'A — Obiecaj lepszy kontrakt',
    description: 'Składasz obietnicę podwyżki. Gracz wybiera oczekiwany %, który pamiętasz do końca sezonu.',
    warning: 'Niespełniona obietnica: morale −8, coachTrust −30, konflikt +25',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    hoverBg: 'hover:bg-emerald-500/10',
    labelColor: 'text-emerald-300',
  },
  {
    choice: 'ALLOW_END_OF_SEASON',
    label: 'B — Zgoda na odejście po sezonie',
    description: 'Dajesz zgodę — ale dopiero po zakończeniu sezonu. Musisz wystawić go na listę w terminie.',
    warning: 'Niespełniona obietnica: morale −6, coachTrust −25, konflikt +20',
    accentColor: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    hoverBg: 'hover:bg-sky-500/10',
    labelColor: 'text-sky-300',
  },
  {
    choice: 'REFUSE_IMPORTANT',
    label: 'C — Odmów: jesteś zbyt ważny',
    description: 'Odmawiasz, ale tłumaczysz powód. Gracz pyta o dwie sprawy — odpowiedz dobrze.',
    warning: 'Zły dialog: morale −5, coachTrust −8, konflikt +15',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    hoverBg: 'hover:bg-amber-500/10',
    labelColor: 'text-amber-300',
  },
  {
    choice: 'REFUSE_NO_TALK',
    label: 'D — Odmów rozmowy',
    description: 'Ignorujesz prośbę bez wyjaśnienia. Natychmiastowe negatywne skutki — brak dialogu.',
    warning: 'Natychmiast: morale −6, coachTrust −20, konflikt +15',
    accentColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    hoverBg: 'hover:bg-red-500/10',
    labelColor: 'text-red-300',
  },
];

export const PlayerTransferRequestModal: React.FC<PlayerTransferRequestModalProps> = ({
  player,
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

  /** Wywołane po kliknięciu jednej z 4 ścieżek. */
  const handleChoiceSelect = (choice: TransferRequestManagerChoice) => {
    setChosenChoice(choice);

    if (choice === 'REFUSE_NO_TALK') {
      // Ścieżka D: bez dialogu — od razu oblicz wynik
      const finalResult = PlayerTransferRequestDialogService.finish(
        null,
        player,
        choice,
        currentDate,
        seasonEnd,
        sessionSeed
      );
      setResult(finalResult);
      setStep('STEP_RESULT');
      onResolve(finalResult);
    } else {
      // Ścieżki A, B, C: utwórz sesję sub-dialogu
      const newSession = PlayerTransferRequestDialogService.createSession(choice);
      setSession(newSession);
      setStep('STEP_DIALOG');
    }
  };

  /** Wywołane po wyborze jednej z odpowiedzi w sub-dialogu. */
  const handleAnswer = (answerId: string) => {
    if (!session || !chosenChoice) return;

    const nextSession = PlayerTransferRequestDialogService.answer(session, answerId);
    setSession(nextSession);

    // Wszystkie pytania odpowiedziane → finalizuj
    if (nextSession.currentQuestionIndex >= nextSession.questions.length) {
      const finalResult = PlayerTransferRequestDialogService.finish(
        nextSession,
        player,
        chosenChoice,
        currentDate,
        seasonEnd,
        sessionSeed
      );
      setResult(finalResult);
      setStep('STEP_RESULT');
      onResolve(finalResult);
    }
  };

  /** Przerwanie rozmowy przed końcem (ścieżki A, B, C — nieukończony dialog). */
  const handleAbortDialog = () => {
    if (!session || !chosenChoice) return;

    // Traktuj przerwanie jak REFUSE_NO_TALK — skutki negatywne
    const finalResult = PlayerTransferRequestDialogService.finish(
      null,
      player,
      'REFUSE_NO_TALK',
      currentDate,
      seasonEnd,
      sessionSeed
    );
    setResult(finalResult);
    setStep('STEP_RESULT');
    onResolve(finalResult);
  };

  const currentQuestion = session ? session.questions[session.currentQuestionIndex] : null;
  const totalQuestions = session ? session.questions.length : 0;
  const answeredCount = session ? session.currentQuestionIndex : 0;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // ── Kolor przewodni — odróżnia ten modal od ROLE (violet) i TRANSFER (amber) ─
  const accentText = 'text-orange-400';
  const accentGradient = 'via-orange-500';
  const accentGlow = 'rgba(249,115,22,0.08)';
  const questionBox = 'border-orange-500/25 bg-orange-500/10';
  const answerHover = 'hover:bg-orange-500/15 hover:border-t-orange-400/50 hover:border-x-orange-400/30 hover:border-b-orange-900/60';
  const progressBar = 'bg-orange-500';

  const isPositive = result
    ? result.reaction === 'AGREED' || result.reaction === 'THINKING'
    : false;

  return (
    <div className={`fixed inset-0 z-[1200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md ${exitClass}`}>
      <div className="relative flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[40px] border border-white/10 bg-slate-900/70 shadow-[0_50px_100px_rgba(0,0,0,0.9)]">

        {/* Linia gradientu u góry */}
        <div className={`absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent ${accentGradient} to-transparent`} />

        {/* Glow w tle */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentGlow} 0%, transparent 60%)` }}
        />

        {/* Watermark z nazwiskiem zawodnika */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className={`select-none whitespace-nowrap text-[110px] font-black italic uppercase tracking-tighter opacity-[0.035] ${accentText}`}>
            {player.lastName}
          </span>
        </div>

        {/* Nagłówek */}
        <header className="relative border-b border-white/5 px-8 pb-5 pt-8">
          <div className="flex justify-center">
            <span className={`text-[9px] font-black italic uppercase tracking-[0.25em] ${accentText}`}>
              PLAYER TRANSFER REQUEST DIALOG
            </span>
          </div>
          <h1 className="mt-2 text-center text-3xl font-black italic uppercase tracking-tighter text-white">
            ROZMOWA<br />
            <span className={accentText}>O PRZYSZŁOŚCI TRANSFEROWEJ</span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
              ZAWODNIK: <span className="text-white">{playerName}</span>
            </span>
            {step === 'STEP_DIALOG' && (
              <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
                ETAP: <span className={accentText}>{answeredCount + 1} / {totalQuestions}</span>
              </span>
            )}
          </div>

          {/* Pasek postępu (tylko w sub-dialogu) */}
          {step === 'STEP_DIALOG' && (
            <>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full transition-all duration-500 ${progressBar}`} style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[9px] font-black italic uppercase tracking-tighter text-slate-500">
                <span>PYTANIE {answeredCount + 1} / {totalQuestions}</span>
                <span>WYNIK DIALOGU: {session?.score ?? 0} PKT</span>
              </div>
            </>
          )}
        </header>

        {/* Treść modalu */}
        <div className="custom-scrollbar relative overflow-y-auto">

          {/* ── KROK 1: Wybór ścieżki ─────────────────────────────────────────── */}
          {step === 'STEP_CHOICE' && (
            <div className="px-8 py-6">
              <p className="mb-5 text-center text-[10px] font-black italic uppercase tracking-[0.15em] text-slate-400">
                Wybierz sposób odpowiedzi na prośbę zawodnika
              </p>
              <div className="grid gap-3">
                {CHOICE_OPTIONS.map(opt => (
                  <button
                    key={opt.choice}
                    onClick={() => handleChoiceSelect(opt.choice)}
                    className={`w-full rounded-2xl border ${opt.borderColor} border-b-black/60 bg-white/[0.03] px-5 py-4 text-left transition-all duration-150 active:translate-y-[2px] ${opt.hoverBg}`}
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    <span className={`block text-sm font-black italic uppercase tracking-tighter ${opt.labelColor}`}>
                      {opt.label}
                    </span>
                    <span className="mt-1 block text-[11px] font-normal italic text-slate-400 uppercase tracking-tight">
                      {opt.description}
                    </span>
                    <span className="mt-1.5 block text-[9px] font-black italic uppercase tracking-tight text-red-400/70">
                      ⚠ {opt.warning}
                    </span>
                  </button>
                ))}
              </div>

              {/* Przycisk anulowania bez konsekwencji (tylko gdy gracz ma niskie napięcie) */}
              <div className="mt-6 border-t border-white/5 pt-4">
                <button
                  onClick={closeModal}
                  className="mx-auto block w-full max-w-[420px] rounded-2xl border-x border-b border-t border-x-white/10 border-b-black/60 border-t-white/20 bg-transparent py-3 text-xs font-black italic uppercase tracking-tighter text-slate-500 transition-all duration-150 hover:bg-white/5 hover:text-slate-300 active:translate-y-[2px]"
                  style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  ZAMKNIJ BEZ ROZMOWY
                </button>
              </div>
            </div>
          )}

          {/* ── KROK 2: Sub-dialog (pytania i odpowiedzi) ───────────────────────── */}
          {step === 'STEP_DIALOG' && session && (
            <div className="px-8 py-6">

              {/* Reakcja gracza po poprzedniej odpowiedzi */}
              {session.lastReaction && (
                <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center">
                  <span className="text-[9px] font-black italic uppercase tracking-[0.2em] text-slate-500">REAKCJA ZAWODNIKA</span>
                  <p className="mt-2 text-sm font-black italic uppercase tracking-tighter leading-relaxed text-white">{session.lastReaction}</p>
                </div>
              )}

              {/* Pytanie gracza */}
              {currentQuestion && (
                <>
                  <div className={`rounded-2xl border p-5 text-center ${questionBox}`}>
                    <span className={`text-[9px] font-black italic uppercase tracking-[0.2em] ${accentText}`}>{player.lastName}</span>
                    <p className="mt-3 text-lg font-black italic uppercase tracking-tighter leading-relaxed text-white">
                      {currentQuestion.playerText}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {currentQuestion.answers.map(answer => (
                      <button
                        key={answer.id}
                        onClick={() => handleAnswer(answer.id)}
                        className={`w-full rounded-2xl border-x border-b border-t border-x-white/10 border-b-black/60 border-t-white/20 bg-white/[0.03] px-5 py-3.5 text-left transition-all duration-150 active:translate-y-[2px] ${answerHover}`}
                        style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                      >
                        <span className="text-sm font-normal italic uppercase tracking-tighter leading-snug text-white">
                          {answer.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Przycisk przerwania dialogu */}
              <div className="mt-6 border-t border-white/5 pt-4">
                <button
                  onClick={handleAbortDialog}
                  className="mx-auto block w-full max-w-[420px] rounded-2xl border-x border-b border-t border-x-white/10 border-b-black/60 border-t-white/20 bg-transparent py-3 text-xs font-black italic uppercase tracking-tighter text-slate-500 transition-all duration-150 hover:bg-red-500/10 hover:text-red-300 active:translate-y-[2px]"
                  style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  ZAKOŃCZ ROZMOWĘ PRZEDWCZEŚNIE
                </button>
              </div>
            </div>
          )}

          {/* ── KROK 3: Wynik ────────────────────────────────────────────────────── */}
          {step === 'STEP_RESULT' && result && (
            <div className="flex flex-col items-center gap-6 px-8 py-10 text-center">

              {/* Odznaka reakcji */}
              <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                result.reaction === 'AGREED' ? 'border-emerald-400 bg-emerald-500/20' :
                result.reaction === 'THINKING' ? 'border-amber-400 bg-amber-500/20' :
                'border-red-400 bg-red-500/20'
              }`}>
                <span className={`text-2xl font-black ${
                  result.reaction === 'AGREED' ? 'text-emerald-400' :
                  result.reaction === 'THINKING' ? 'text-amber-400' :
                  'text-red-400'
                }`}>
                  {result.reaction === 'AGREED' ? '✓' : result.reaction === 'THINKING' ? '?' : '✗'}
                </span>
              </div>

              {/* Reakcja gracza */}
              <div>
                <span className={`text-[9px] font-black italic uppercase tracking-[0.25em] ${
                  result.reaction === 'AGREED' ? 'text-emerald-400' :
                  result.reaction === 'THINKING' ? 'text-amber-400' :
                  'text-red-400'
                }`}>
                  {result.reaction === 'AGREED' ? 'ZAWODNIK AKCEPTUJE' :
                   result.reaction === 'THINKING' ? 'ZAWODNIK ZASTANAWIA SIĘ' :
                   'ZAWODNIK ODMAWIA'}
                </span>
                <h2 className="mt-3 text-3xl font-black italic uppercase tracking-tighter text-white">
                  {result.title}
                </h2>
                <p className="mt-4 text-base font-black italic uppercase tracking-tighter leading-relaxed text-slate-200">
                  {result.summary}
                </p>
              </div>

              {/* Statystyki wynikowe */}
              <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <span className="block text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Zmiana morale</span>
                    <span className={`mt-1 block text-xl font-black italic ${result.moraleDelta > 0 ? 'text-emerald-400' : result.moraleDelta < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {result.moraleDelta > 0 ? '+' : ''}{result.moraleDelta}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black italic uppercase tracking-tighter text-slate-500">
                      {result.reaction === 'THINKING' ? 'Odpowiedź za' : 'Czas odpowiedzi'}
                    </span>
                    <span className={`mt-1 block text-xl font-black italic ${accentText}`}>
                      {result.reaction === 'THINKING' && result.responseDelayDays !== null
                        ? `${result.responseDelayDays} dni`
                        : 'Teraz'}
                    </span>
                  </div>
                </div>

                {/* Obietnica kontraktowa */}
                {result.promiseMade && (
                  <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <span className="block text-[8px] font-black italic uppercase tracking-tighter text-emerald-400">
                      Obietnica kontraktowa zapisana
                    </span>
                    <span className="mt-1 block text-sm font-black italic text-white">
                      Zawodnik oczekuje podwyżki o <span className="text-emerald-300">+{result.promiseMade.salaryRaisePct}%</span>
                    </span>
                    <span className="block text-[8px] font-normal italic text-slate-400 mt-1">
                      Deadline: koniec sezonu · Niespełnienie = konflikt +25, zaufanie −30
                    </span>
                  </div>
                )}

                {/* Flaga odejścia po sezonie */}
                {result.allowAfterSeasonFlag && (
                  <div className="mt-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3">
                    <span className="block text-[8px] font-black italic uppercase tracking-tighter text-sky-400">
                      Obietnica odejścia po sezonie
                    </span>
                    <span className="mt-1 block text-sm font-black italic text-white">
                      Musisz wystawić zawodnika na listę po zakończeniu sezonu.
                    </span>
                    <span className="block text-[8px] font-normal italic text-slate-400 mt-1">
                      Deadline: 30 czerwca · Niespełnienie = konflikt +20, zaufanie −25
                    </span>
                  </div>
                )}
              </div>

              {/* Przycisk zamknięcia */}
              <button
                onClick={closeModal}
                className={`w-full rounded-2xl border-x border-b border-t px-6 py-4 text-sm font-black italic uppercase tracking-tighter text-white transition-all duration-200 active:translate-y-[2px] ${
                  isPositive
                    ? 'border-x-emerald-500/30 border-b-black/60 border-t-emerald-400/60 bg-emerald-600/80 hover:bg-emerald-500'
                    : 'border-x-red-500/30 border-b-black/60 border-t-red-400/60 bg-red-600/80 hover:bg-red-500'
                }`}
                style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              >
                ZAMKNIJ ROZMOWĘ
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};
