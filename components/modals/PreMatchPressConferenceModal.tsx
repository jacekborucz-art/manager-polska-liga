import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Club } from '../../types';
import {
  PreMatchPressConferenceService,
  PressConferenceAnswer,
  PressConferenceFixture,
} from '../../services/PreMatchPressConferenceService';

interface Props {
  fixture: PressConferenceFixture;
  userClub: Club;
  opponent: Club;
}

export const PreMatchPressConferenceModal: React.FC<Props> = ({ fixture, userClub, opponent }) => {
  const { clubs, fixtures, completePreMatchPressConference } = useGame();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<PressConferenceAnswer[]>([]);
  const conference = useMemo(
    () => PreMatchPressConferenceService.generate(fixture, userClub, opponent, clubs, fixtures),
    [clubs, fixture, fixtures, opponent, userClub],
  );
  const question = conference.questions[questionIndex];

  const handleAnswer = (answer: PressConferenceAnswer) => {
    const nextAnswers = [...selectedAnswers, answer];
    if (questionIndex < conference.questions.length - 1) {
      setSelectedAnswers(nextAnswers);
      setQuestionIndex(current => current + 1);
      return;
    }
    completePreMatchPressConference(fixture.id, nextAnswers);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <header className="border-b border-white/10 bg-gradient-to-r from-blue-950/80 via-slate-950 to-slate-950 px-8 py-6">
          <div className="text-[10px] font-black italic uppercase tracking-tighter text-blue-300">Konferencja prasowa przed meczem</div>
          <h2 className="mt-2 text-3xl font-black italic uppercase tracking-tighter text-white">{conference.headline}</h2>
          <div className="mt-4 flex gap-2">
            {conference.questions.map((item, index) => (
              <div key={item.id} className={`h-1.5 flex-1 rounded-full ${index <= questionIndex ? 'bg-blue-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </header>

        <section className="space-y-5 bg-gradient-to-b from-slate-950 via-[#071127] to-[#050b1b] px-8 py-7 shadow-[inset_0_1px_0_rgba(147,197,253,0.08)]">
          {questionIndex === 0 && conference.opponentStatement && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-amber-100">
              {conference.opponentStatement}
            </div>
          )}
          <div className="rounded-2xl border border-amber-300/35 bg-gradient-to-r from-amber-500/15 via-yellow-400/[0.08] to-transparent px-5 py-4 shadow-[inset_4px_0_0_rgba(251,191,36,0.75),0_8px_24px_rgba(0,0,0,0.18)]">
            <div className="text-[10px] font-black italic uppercase tracking-tighter text-amber-300">
              Pytanie {questionIndex + 1} / {conference.questions.length} · {question.journalist}
            </div>
            <p className="mt-3 text-xl font-black italic uppercase tracking-tighter leading-snug text-amber-50">{question.text}</p>
          </div>

          <div className="h-px rounded-full bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />

          <div className="grid gap-3">
            {question.answers.map((answer, answerIndex) => (
              <button
                key={answer.id}
                onClick={() => handleAnswer(answer)}
                className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-black italic uppercase tracking-tighter text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_12px_rgba(0,0,0,0.22)] transition-all duration-150 hover:-translate-y-[1px] hover:border-cyan-300/70 hover:bg-cyan-500/20 hover:text-white active:translate-y-[1px] ${
                  answerIndex % 2 === 0
                    ? 'border-blue-400/25 bg-[#0b1d3b]'
                    : 'border-cyan-400/20 bg-[#122640]'
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-[10px] font-black italic uppercase tracking-tighter text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950">
                  {answerIndex + 1}
                </span>
                <span className="font-black italic uppercase tracking-tighter leading-snug">{answer.text}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
