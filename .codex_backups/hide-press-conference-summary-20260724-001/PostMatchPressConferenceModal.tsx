import React, { useMemo, useState } from 'react';
import { MessageCircle, Mic2, Newspaper, X } from 'lucide-react';
import { MatchSummary } from '../../types';
import {
  PostMatchConferenceAnswer,
  PostMatchConferenceJournalistTone,
  PostMatchConferenceOutcome,
  PostMatchPressConferenceService,
} from '../../services/PostMatchPressConferenceService';

interface Props {
  summary: MatchSummary;
  onClose: () => void;
  onComplete?: (outcome: PostMatchConferenceOutcome) => void;
}

const TONE_LABELS: Record<PostMatchConferenceJournalistTone, string> = {
  PROVOCATIVE: 'prowokujące',
  NEUTRAL: 'neutralne',
  AGGRESSIVE: 'agresywne',
  MOCKING: 'szydercze',
  FRIENDLY: 'przyjazne',
};

const TONE_CLASS: Record<PostMatchConferenceJournalistTone, string> = {
  PROVOCATIVE: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  NEUTRAL: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
  AGGRESSIVE: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  MOCKING: 'border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-200',
  FRIENDLY: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
};

export const PostMatchPressConferenceModal: React.FC<Props> = ({ summary, onClose, onComplete }) => {
  const conference = useMemo(() => PostMatchPressConferenceService.generate(summary), [summary]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<PostMatchConferenceAnswer[]>([]);
  const [outcome, setOutcome] = useState<PostMatchConferenceOutcome | null>(null);
  const question = conference.questions[questionIndex];

  const handleAnswer = (answer: PostMatchConferenceAnswer) => {
    const nextAnswers = [...selectedAnswers, answer];
    if (questionIndex < conference.questions.length - 1) {
      setSelectedAnswers(nextAnswers);
      setQuestionIndex(current => current + 1);
      return;
    }

    const nextOutcome = PostMatchPressConferenceService.summarize(nextAnswers);
    setSelectedAnswers(nextAnswers);
    setOutcome(nextOutcome);
    onComplete?.(nextOutcome);
  };

  const impactValue = (value: number): string => `${value > 0 ? '+' : ''}${value}`;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[34px] border border-cyan-400/20 bg-slate-950 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_82%_20%,rgba(59,130,246,0.14),transparent_30%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

        <header className="relative border-b border-cyan-400/15 bg-gradient-to-r from-slate-950 via-blue-950/55 to-slate-950 px-8 py-6">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-white"
            aria-label="Zamknij konferencję"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_30px_rgba(8,145,178,0.18)]">
              <Mic2 size={26} />
            </div>
            <div className="min-w-0 pr-14">
              <div className="text-[10px] font-black italic uppercase tracking-tighter text-cyan-300">Konferencja prasowa po meczu</div>
              <h2 className="mt-2 truncate text-3xl font-black italic uppercase tracking-tighter text-white">{conference.headline}</h2>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            {conference.questions.map((item, index) => (
              <div key={item.id} className={`h-1.5 flex-1 rounded-full ${index <= questionIndex ? 'bg-cyan-400' : 'bg-white/10'}`} />
            ))}
          </div>
        </header>

        {!outcome ? (
          <section className="relative grid gap-6 px-8 py-7">
            <div className="grid grid-cols-3 gap-3">
              <div className={`rounded-2xl border px-4 py-3 ${conference.controversies.penaltyNoCall ? 'border-rose-400/30 bg-rose-400/10 text-rose-200' : 'border-white/10 bg-white/[0.03] text-slate-500'}`}>
                <div className="text-[9px] font-black italic uppercase tracking-tighter">Niepodyktowany karny</div>
              </div>
              <div className={`rounded-2xl border px-4 py-3 ${conference.controversies.varDisallowedEqualizer ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-white/[0.03] text-slate-500'}`}>
                <div className="text-[9px] font-black italic uppercase tracking-tighter">Anulowana bramka VAR</div>
              </div>
              <div className={`rounded-2xl border px-4 py-3 ${conference.controversies.userRedCard ? 'border-red-400/30 bg-red-400/10 text-red-200' : 'border-white/10 bg-white/[0.03] text-slate-500'}`}>
                <div className="text-[9px] font-black italic uppercase tracking-tighter">Czerwona kartka gracza</div>
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-400/15 bg-slate-900/50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
                    Pytanie {questionIndex + 1} / {conference.questions.length} · {question.journalist}
                  </div>
                  <div className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[9px] font-black italic uppercase tracking-tighter ${TONE_CLASS[question.tone]}`}>
                    {TONE_LABELS[question.tone]}
                  </div>
                </div>
                <MessageCircle className="shrink-0 text-cyan-300/70" size={30} />
              </div>

              <p className="text-2xl font-black italic uppercase tracking-tighter leading-tight text-white">{question.text}</p>
            </div>

            <div className="grid gap-3">
              {question.answers.map(answer => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswer(answer)}
                  className="group rounded-2xl border border-cyan-400/15 bg-white/[0.04] px-5 py-4 text-left transition-all hover:border-cyan-300/60 hover:bg-cyan-500/10 active:translate-y-[1px]"
                >
                  <div className="text-sm font-black italic uppercase tracking-tighter text-slate-200 transition-colors group-hover:text-white">{answer.text}</div>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="relative px-8 py-8">
            <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-7">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15 text-emerald-200">
                  <Newspaper size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-300">Podsumowanie konferencji</div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Przekaz poszedł w świat</h3>
                </div>
              </div>
              <p className="text-base font-black italic uppercase tracking-tighter leading-relaxed text-slate-100">{outcome.summary}</p>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Sędzia</div>
                <div className="text-xl font-black italic uppercase tracking-tighter text-cyan-200">{impactValue(outcome.refereeTrustDelta)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Drużyna</div>
                <div className="text-xl font-black italic uppercase tracking-tighter text-emerald-200">{impactValue(outcome.teamMoraleDelta)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Rywal</div>
                <div className="text-xl font-black italic uppercase tracking-tighter text-amber-200">{impactValue(outcome.opponentRespectDelta)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Media</div>
                <div className="text-xl font-black italic uppercase tracking-tighter text-fuchsia-200">{impactValue(outcome.mediaDramaDelta)}</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-2xl border-t border-x border-b border-t-emerald-300/30 border-x-emerald-400/20 border-b-black/70 bg-emerald-500/90 px-6 py-4 text-sm font-black italic uppercase tracking-tighter text-white transition-all hover:bg-emerald-400 active:translate-y-[2px]"
              style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.55), 0 12px 28px rgba(16,185,129,0.20), inset 0 1px 0 rgba(255,255,255,0.28)' }}
            >
              Zakończ konferencję
            </button>
          </section>
        )}
      </div>
    </div>
  );
};
