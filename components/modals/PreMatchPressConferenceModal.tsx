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
  const { clubs, completePreMatchPressConference } = useGame();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<PressConferenceAnswer[]>([]);
  const conference = useMemo(
    () => PreMatchPressConferenceService.generate(fixture, userClub, opponent, clubs),
    [clubs, fixture, opponent, userClub],
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md">
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

        <section className="space-y-5 px-8 py-7">
          {questionIndex === 0 && conference.opponentStatement && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm font-black italic uppercase tracking-tighter text-amber-100">
              {conference.opponentStatement}
            </div>
          )}
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
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left text-sm font-black italic uppercase tracking-tighter text-slate-200 transition-all hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white"
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
