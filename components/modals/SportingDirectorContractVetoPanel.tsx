import React, { useState } from 'react';
import {
  SportingDirectorContractVetoAction,
  SportingDirectorContractVetoState,
} from '../../types';

interface SportingDirectorContractVetoPanelProps {
  state: SportingDirectorContractVetoState;
  directorName: string;
  ownerName: string;
  onAction: (action: SportingDirectorContractVetoAction) => void;
}

/*
 * This component is intentionally presentation-only. The persisted `stage` is
 * the sole navigation source; local React state is used only for the destructive
 * ultimatum confirmation overlay. Business probabilities and outcomes remain in
 * SportingDirectorContractAppealService, so closing this mail cannot reroll them.
 *
 * Rendered flow:
 * EXPLANATION -> COUNTER_ARGUMENT -> RESOLVED
 *                                  -> APPEAL_FAILED -> WITHDRAW or ULTIMATUM
 */

const formatPln = (value: number): string => `${Math.round(value).toLocaleString('pl-PL')} PLN`;

const actionClass = 'font-black italic uppercase tracking-tighter w-full rounded-2xl border px-5 py-4 text-left text-[12px] transition-all hover:-translate-y-0.5 active:translate-y-0';

export const SportingDirectorContractVetoPanel: React.FC<SportingDirectorContractVetoPanelProps> = ({
  state,
  directorName,
  ownerName,
  onAction,
}) => {
  const [confirmUltimatum, setConfirmUltimatum] = useState(false);

  const facts = [
    { label: 'Pensja roczna', value: formatPln(state.salary), tone: 'text-cyan-200' },
    { label: 'Średnia pensja kadry', value: formatPln(state.averageSalary), tone: 'text-slate-100' },
    { label: 'Najwyższa pensja', value: formatPln(state.highestSalary), tone: 'text-amber-200' },
    { label: 'Pensja względem średniej', value: `${state.salaryRatio.toFixed(2)}×`, tone: state.salaryRatio > 2.2 ? 'text-red-300' : 'text-emerald-300' },
    { label: 'Fundusz płac po transferze', value: formatPln(state.wageBillAfter), tone: 'text-slate-100' },
    { label: 'Łączne zobowiązanie', value: formatPln(state.totalCommitment), tone: 'text-amber-200' },
    { label: 'Użycie budżetu transferowego', value: `${(state.budgetUsage * 100).toFixed(1)}%`, tone: state.budgetUsage > 0.7 ? 'text-red-300' : 'text-emerald-300' },
    { label: 'Kontrakt', value: `${state.years} ${state.years === 1 ? 'rok' : state.years < 5 ? 'lata' : 'lat'}`, tone: 'text-slate-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-red-400/30 bg-red-500/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black italic uppercase tracking-tighter text-[10px] text-red-300">Weto miękkie · kontrakt oczekuje</p>
            <h3 className="font-black italic uppercase tracking-tighter mt-1 text-2xl text-white">{state.playerName} · {state.position} · {state.playerOverall} OVR</h3>
          </div>
          <span className="font-black italic uppercase tracking-tighter rounded-full border border-red-300/30 bg-red-500/15 px-4 py-2 text-[10px] text-red-200">
            Decyzja dyrektora
          </span>
        </div>
        <p className="font-black italic uppercase tracking-tighter mt-5 text-sm leading-relaxed text-red-100">{state.reason}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {facts.map(fact => (
          <div key={fact.label} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="font-black italic uppercase tracking-tighter text-[8px] text-slate-500">{fact.label}</p>
            <p className={`font-black italic uppercase tracking-tighter mt-1 text-sm ${fact.tone}`}>{fact.value}</p>
          </div>
        ))}
      </div>

      {/* Round one: choose the argument that best matches the visible veto facts. */}
      {state.stage === 'EXPLANATION' && (
        <div className="rounded-[24px] border border-sky-400/20 bg-sky-500/5 p-6">
          <p className="font-black italic uppercase tracking-tighter text-[10px] text-sky-300">Rozmowa z dyrektorem · pierwsza runda</p>
          <h4 className="font-black italic uppercase tracking-tighter mt-1 text-xl text-white">Jak uzasadnisz ten transfer?</h4>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <button onClick={() => onAction('SPORTING_QUALITY')} className={`${actionClass} border-emerald-400/25 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15`}>
              Ten zawodnik wyraźnie podniesie jakość pierwszego składu
            </button>
            <button onClick={() => onAction('POSITION_NEED')} className={`${actionClass} border-cyan-400/25 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/15`}>
              Nie mamy wystarczającej obsady tej pozycji
            </button>
            <button onClick={() => onAction('MARKET_OPPORTUNITY')} className={`${actionClass} border-amber-400/25 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15`}>
              To wyjątkowa okazja na rynku wolnych agentów
            </button>
            <button onClick={() => onAction('MANAGER_TRUST')} className={`${actionClass} border-violet-400/25 bg-violet-500/10 text-violet-100 hover:bg-violet-500/15`}>
              Proszę zaufać mojej ocenie sportowej
            </button>
          </div>
          <button onClick={() => onAction('WITHDRAW')} className="font-black italic uppercase tracking-tighter mt-4 text-[10px] text-slate-500 transition-colors hover:text-white">
            Wycofaj się z transferu
          </button>
        </div>
      )}

      {/* Round two: react to the director; this action triggers the appeal roll. */}
      {state.stage === 'COUNTER_ARGUMENT' && (
        <div className="rounded-[24px] border border-amber-400/25 bg-amber-500/5 p-6">
          <p className="font-black italic uppercase tracking-tighter text-[10px] text-amber-300">{directorName} odpowiada</p>
          <p className="font-black italic uppercase tracking-tighter mt-3 text-base leading-relaxed text-white">„{state.directorResponse}”</p>
          <p className="font-black italic uppercase tracking-tighter mt-6 text-[10px] text-slate-400">Ostatnia odpowiedź trenera</p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <button onClick={() => onAction('USE_DATA')} className={`${actionClass} border-cyan-400/25 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/15`}>
              Przedstaw dane sportowe i potrzeby pozycji
            </button>
            <button onClick={() => onAction('OFFER_COMPROMISE')} className={`${actionClass} border-emerald-400/25 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15`}>
              Zaproponuj ograniczenie innych kosztów kadry
            </button>
            <button onClick={() => onAction('TAKE_RESPONSIBILITY')} className={`${actionClass} border-violet-400/25 bg-violet-500/10 text-violet-100 hover:bg-violet-500/15`}>
              Weź pełną odpowiedzialność za decyzję
            </button>
          </div>
        </div>
      )}

      {/* A failed appeal leaves only withdrawal or the high-risk escalation. */}
      {state.stage === 'APPEAL_FAILED' && (
        <div className="rounded-[24px] border border-red-400/30 bg-red-950/25 p-6">
          <p className="font-black italic uppercase tracking-tighter text-[10px] text-red-300">Dyrektor podtrzymuje weto</p>
          <p className="font-black italic uppercase tracking-tighter mt-3 text-base leading-relaxed text-white">„{state.appealSummary}”</p>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <button onClick={() => onAction('WITHDRAW')} className={`${actionClass} border-slate-400/20 bg-slate-500/10 text-slate-200 hover:bg-slate-500/15`}>
              Zaakceptuj decyzję i wycofaj transfer
            </button>
            <button
              disabled={!state.ultimatumAvailable}
              onClick={() => setConfirmUltimatum(true)}
              className={`${actionClass} ${state.ultimatumAvailable ? 'border-red-400/40 bg-red-600/20 text-red-100 hover:bg-red-600/30' : 'cursor-not-allowed border-white/5 bg-white/5 text-slate-600'}`}
            >
              {state.ultimatumAvailable ? 'Postaw ultimatum właścicielowi klubu' : 'Ultimatum niedostępne przez 12 miesięcy'}
            </button>
          </div>
        </div>
      )}

      {/* The owner escalation can fire the manager, so it requires confirmation. */}
      {confirmUltimatum && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-[32px] border-2 border-red-500 bg-[#0a1220] p-8 shadow-[0_0_100px_rgba(239,68,68,0.28)]">
            <p className="font-black italic uppercase tracking-tighter text-[10px] text-red-300">Decyzja nieodwracalna</p>
            <h3 className="font-black italic uppercase tracking-tighter mt-2 text-3xl text-white">Kontrakt albo odchodzę</h3>
            <p className="font-black italic uppercase tracking-tighter mt-5 text-sm leading-relaxed text-slate-200">
              {ownerName} może zatwierdzić kontrakt albo natychmiast zwolnić trenera za próbę szantażu. Wynik zależy od pozycji trenera, charakteru właściciela, dyrektora sportowego oraz zapisanego RNG.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmUltimatum(false)} className="font-black italic uppercase tracking-tighter rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs text-slate-300 hover:bg-white/10">
                Wróć do rozmowy
              </button>
              <button onClick={() => { setConfirmUltimatum(false); onAction('ULTIMATUM'); }} className="font-black italic uppercase tracking-tighter rounded-2xl border border-red-300/30 bg-red-600 px-5 py-4 text-xs text-white hover:bg-red-500">
                Potwierdź ultimatum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
