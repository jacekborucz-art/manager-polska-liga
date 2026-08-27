import React, { useMemo } from 'react';
import type { StaffMember } from '../../types';
import {
  PostMatchMediaDecision,
  PostMatchMediaDecisionService,
} from '../../services/PostMatchMediaDecisionService';

interface Props {
  matchId: string;
  managerName: string;
  assistant?: StaffMember | null;
  onDecision: (decision: PostMatchMediaDecision) => void;
}

export const PostMatchMediaDecisionModal: React.FC<Props> = ({
  matchId,
  managerName,
  assistant,
  onDecision,
}) => {
  const reporter = useMemo(
    () => PostMatchMediaDecisionService.getJournalist(matchId),
    [matchId]
  );
  const assistantName = assistant ? `${assistant.firstName} ${assistant.lastName}` : '';

  return (
    <div className="fixed inset-0 z-[1800] flex items-center justify-center bg-[#01040b]/88 p-8 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-[920px] overflow-hidden rounded-[34px] border border-cyan-300/20 bg-[#071225] shadow-[0_35px_120px_rgba(0,0,0,0.72),0_0_55px_rgba(34,211,238,0.08)]">
        <div className="absolute inset-0 opacity-35" style={{ background: 'radial-gradient(circle at 82% 0%, rgba(34,211,238,0.2), transparent 35%), linear-gradient(135deg, rgba(15,23,42,0.15), rgba(2,6,23,0.95))' }} />
        <div className="relative px-10 py-9 sm:px-14 sm:py-12">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">🎙️</div>
            <div className="min-w-0">
              <p className="font-black italic uppercase tracking-tighter text-[11px] text-cyan-300">{reporter.outlet}</p>
              <p className="font-black italic uppercase tracking-tighter mt-1 text-lg text-white">{reporter.journalist}</p>
              <p className="font-black italic uppercase tracking-tighter mt-1 text-[10px] text-slate-400">Pytanie do trenera: {managerName}</p>
            </div>
          </div>

          <h2 className="font-black italic uppercase tracking-tighter mt-10 max-w-[760px] text-[34px] leading-[1.08] text-white sm:text-[42px]">
            Czy weźmie Pan udział w konferencji prasowej?
          </h2>
          <p className="font-black italic uppercase tracking-tighter mt-4 text-[11px] leading-relaxed text-slate-300">
            Dziennikarze oczekują na pomeczowy komentarz. Decyzja może wpłynąć na media, szatnię i ocenę pracy trenera.
          </p>

          <div className="mt-10 grid gap-3">
            <button
              type="button"
              onClick={() => onDecision('ATTEND')}
              className="group flex min-h-[76px] items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-7 text-left transition-all hover:border-emerald-200/55 hover:bg-emerald-400/18"
            >
              <span className="font-black italic uppercase tracking-tighter text-base text-emerald-100">Tak — wezmę udział w konferencji</span>
              <span className="ml-auto text-2xl text-emerald-300 transition-transform group-hover:translate-x-1">→</span>
            </button>

            <button
              type="button"
              onClick={() => onDecision('IGNORE')}
              className="group flex min-h-[76px] items-center rounded-2xl border border-rose-300/20 bg-rose-400/8 px-7 text-left transition-all hover:border-rose-200/50 hover:bg-rose-400/15"
            >
              <span className="font-black italic uppercase tracking-tighter text-base text-rose-100">Nie — zignoruj dziennikarzy</span>
              <span className="ml-auto text-2xl text-rose-300 transition-transform group-hover:translate-x-1">→</span>
            </button>

            {assistant && (
              <button
                type="button"
                onClick={() => onDecision('DELEGATE')}
                className="group flex min-h-[76px] items-center rounded-2xl border border-amber-300/20 bg-amber-400/8 px-7 text-left transition-all hover:border-amber-200/50 hover:bg-amber-400/15"
              >
                <span>
                  <span className="font-black italic uppercase tracking-tighter block text-base text-amber-100">Wyślij asystenta</span>
                  <span className="font-black italic uppercase tracking-tighter mt-1 block text-[10px] text-amber-200/60">{assistantName}</span>
                </span>
                <span className="ml-auto text-2xl text-amber-300 transition-transform group-hover:translate-x-1">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
