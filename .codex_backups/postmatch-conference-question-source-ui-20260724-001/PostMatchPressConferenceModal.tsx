import React, { useMemo, useState } from 'react';
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
  PROVOCATIVE: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
  NEUTRAL: 'border-white/10 bg-white/[0.04] text-slate-200',
  AGGRESSIVE: 'border-red-400/20 bg-red-500/10 text-red-100',
  MOCKING: 'border-purple-400/20 bg-purple-500/10 text-purple-100',
  FRIENDLY: 'border-blue-400/20 bg-blue-500/10 text-blue-100',
};

export const PostMatchPressConferenceModal: React.FC<Props> = ({ summary, onClose, onComplete }) => {
  const conference = useMemo(() => PostMatchPressConferenceService.generate(summary), [summary]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<PostMatchConferenceAnswer[]>([]);
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
    onComplete?.(nextOutcome);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <header className="border-b border-white/10 bg-gradient-to-r from-blue-950/80 via-slate-950 to-slate-950 px-8 py-6">
          <div className="text-[10px] font-black italic uppercase tracking-tighter text-blue-300">Konferencja prasowa po meczu</div>
          <h2 className="mt-2 text-3xl font-black italic uppercase tracking-tighter text-white">{conference.headline}</h2>
          <div className="mt-4 flex gap-2">
            {conference.questions.map((item, index) => (
              <div key={item.id} className={`h-1.5 flex-1 rounded-full ${index <= questionIndex ? 'bg-blue-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </header>

        <section className="space-y-5 px-8 py-7">
          <div className={`rounded-2xl border px-5 py-4 text-sm font-black italic uppercase tracking-tighter ${TONE_CLASS[question.tone]}`}>
            {TONE_LABELS[question.tone]}
          </div>

          <div>
            <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
              Pytanie {questionIndex + 1} / {conference.questions.length} · {question.journalist}
            </div>
            <p className="mt-3 text-xl font-black italic uppercase tracking-tighter text-white">{question.text}</p>
          </div>

          <div className="grid gap-3">
            {question.answers.map(answer => (
              <button
                key={answer.id}
                onClick={() => handleAnswer(answer)}
                className="rounded-2xl border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 bg-white/[0.04] px-5 py-4 text-left text-sm font-black italic uppercase tracking-tighter text-slate-200 transition-all duration-150 hover:-translate-y-[1px] hover:border-t-blue-300/50 hover:border-x-blue-400/30 hover:border-b-blue-950/70 hover:bg-blue-500/10 hover:text-white active:translate-y-[2px]"
                style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                {answer.text}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
