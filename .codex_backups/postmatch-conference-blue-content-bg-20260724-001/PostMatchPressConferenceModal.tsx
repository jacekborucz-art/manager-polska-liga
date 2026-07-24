import React, { useMemo, useState } from 'react';
import { MatchSummary } from '../../types';
import {
  PostMatchConferenceAnswer,
  PostMatchConferenceOutcome,
  PostMatchPressConferenceService,
} from '../../services/PostMatchPressConferenceService';

interface Props {
  summary: MatchSummary;
  onClose: () => void;
  onComplete?: (outcome: PostMatchConferenceOutcome) => void;
}

const PRESS_OUTLETS = [
  'Przegląd Sportowy',
  'Piłka Nożna',
  'Sportowe Fakty',
  'Canal+ Sport',
  'TVP Sport',
  'Meczyki.pl',
  'Goal.pl',
];

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

export const PostMatchPressConferenceModal: React.FC<Props> = ({ summary, onClose, onComplete }) => {
  const conference = useMemo(() => PostMatchPressConferenceService.generate(summary), [summary]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<PostMatchConferenceAnswer[]>([]);
  const question = conference.questions[questionIndex];
  const opponentName = summary.homeClub.id === summary.userTeamId ? summary.awayClub.name : summary.homeClub.name;
  const pressOutlet = PRESS_OUTLETS[stableHash(`${summary.matchId}_${question.id}_${question.journalist}`) % PRESS_OUTLETS.length];

  const finishConference = (answers: PostMatchConferenceAnswer[]) => {
    const nextOutcome = PostMatchPressConferenceService.summarize(answers);
    setSelectedAnswers(answers);
    onComplete?.(nextOutcome);
    onClose();
  };

  const handleAnswer = (answer: PostMatchConferenceAnswer) => {
    const nextAnswers = [...selectedAnswers, answer];
    if (questionIndex < conference.questions.length - 1) {
      setSelectedAnswers(nextAnswers);
      setQuestionIndex(current => current + 1);
      return;
    }

    finishConference(nextAnswers);
  };

  const handleLeaveConference = () => {
    finishConference(selectedAnswers);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <header className="border-b border-white/10 bg-gradient-to-r from-blue-950/80 via-slate-950 to-slate-950 px-8 py-6">
          <div className="text-[10px] font-black italic uppercase tracking-tighter text-blue-300">
            {pressOutlet} · {question.journalist}
          </div>
          <h2 className="mt-2 text-3xl font-black italic uppercase tracking-tighter text-white">
            Konferencja prasowa po meczu z {opponentName}
          </h2>
          <div className="mt-4 flex gap-2">
            {conference.questions.map((item, index) => (
              <div key={item.id} className={`h-1.5 flex-1 rounded-full ${index <= questionIndex ? 'bg-blue-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </header>

        <section className="space-y-5 px-8 py-7">
          <div>
            <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
              Pytanie {questionIndex + 1} / {conference.questions.length} · {pressOutlet} · {question.journalist}
            </div>
            <p className="mt-3 rounded-2xl border border-yellow-400/25 bg-yellow-500/10 px-5 py-4 text-xl font-black italic uppercase tracking-tighter text-yellow-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {question.text}
            </p>
          </div>

          <div className="h-px rounded-full bg-gradient-to-r from-transparent via-yellow-300/55 to-transparent shadow-[0_0_14px_rgba(250,204,21,0.18)]" />

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

          <button
            type="button"
            onClick={handleLeaveConference}
            className="w-full rounded-2xl border-t border-x border-b border-t-rose-300/30 border-x-rose-400/20 border-b-black/60 bg-rose-500/10 px-5 py-3 text-center text-xs font-black italic uppercase tracking-tighter text-rose-200 transition-all duration-150 hover:-translate-y-[1px] hover:bg-rose-500/20 hover:text-white active:translate-y-[2px]"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          >
            Opuść konferencję prasową
          </button>
        </section>
      </div>
    </div>
  );
};
