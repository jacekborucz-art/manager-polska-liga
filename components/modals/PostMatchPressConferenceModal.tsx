import React, { useMemo, useState } from 'react';
import { MatchSummary } from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import {
  PostMatchConferenceAnswer,
  PostMatchConferenceOutcome,
  PostMatchPressConferenceService,
} from '../../services/PostMatchPressConferenceService';
import { ConferenceScene } from './PreMatchPressConferenceModal';

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
  const homeLogo = getClubLogo(summary.homeClub.id);
  const awayLogo = getClubLogo(summary.awayClub.id);

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-7 backdrop-blur-xl animate-fade-in">
      <div className="relative h-[min(920px,calc(100vh-56px))] w-[min(1660px,calc(100vw-64px))] overflow-hidden rounded-[48px]">
        <ConferenceScene />

        <div className="relative z-10 grid h-full grid-cols-[500px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col justify-between px-14 pb-12 pt-11">
            <div>
              <div className="flex items-center gap-3 text-[15px] font-semibold tracking-normal text-cyan-100">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-60 animate-ping" />
                  <span className="relative m-[3px] h-1.5 w-1.5 rounded-full bg-red-400" />
                </span>
                Konferencja prasowa
              </div>
              <p className="mt-2 text-sm font-normal tracking-normal text-blue-200/60">Po meczu</p>
            </div>

            <div className="mb-2 max-w-[345px]">
              <div className="flex items-center justify-between gap-5">
                <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                  {homeLogo && <img src={homeLogo} alt={`Herb ${summary.homeClub.name}`} className="h-14 w-14 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.5)]" />}
                  <span className="mt-2 max-w-full truncate text-sm font-medium tracking-normal text-slate-200">{summary.homeClub.name}</span>
                </div>

                <div className="shrink-0 font-mono text-[35px] font-semibold tracking-tight text-white">
                  {summary.homeScore} <span className="font-light text-slate-500">:</span> {summary.awayScore}
                </div>

                <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                  {awayLogo && <img src={awayLogo} alt={`Herb ${summary.awayClub.name}`} className="h-14 w-14 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.5)]" />}
                  <span className="mt-2 max-w-full truncate text-sm font-medium tracking-normal text-slate-200">{summary.awayClub.name}</span>
                </div>
              </div>

              {(summary.homePenaltyScore !== undefined && summary.awayPenaltyScore !== undefined) && (
                <p className="mt-2 text-center text-xs font-normal tracking-normal text-slate-400">
                  Rzuty karne: {summary.homePenaltyScore} : {summary.awayPenaltyScore}
                </p>
              )}

              <div className="mt-7 flex items-end gap-3">
                <span className="text-5xl font-light leading-none tracking-normal text-white">
                  {String(questionIndex + 1).padStart(2, '0')}
                </span>
                <span className="pb-1 text-lg font-normal tracking-normal text-blue-200/45">
                  / {String(conference.questions.length).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                {conference.questions.map((item, index) => (
                  <span
                    key={item.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${index <= questionIndex ? 'bg-cyan-300' : 'bg-white/15'}`}
                  />
                ))}
              </div>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col pb-28 pl-14 pr-16 pt-12">
            <header className="shrink-0 pr-8">
              <p className="text-sm font-medium tracking-normal text-cyan-300/80">{pressOutlet} · {question.journalist}</p>
              <h2 className="mt-2 max-w-[990px] text-[40px] font-semibold leading-[1.12] tracking-[-0.025em] text-white">
                Konferencja prasowa po meczu z {opponentName}
              </h2>
            </header>

            <section className="mt-9 flex min-h-0 flex-1 flex-col">
              <div className="shrink-0">
                <div className="flex items-center gap-3 text-[13px] font-medium tracking-normal text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.75)]" />
                  {pressOutlet} · {question.journalist}
                </div>
                <p className="mt-3 max-w-[1020px] text-[27px] font-semibold leading-[1.3] tracking-[-0.015em] text-slate-50">
                  {question.text}
                </p>
              </div>

              <div className="mt-7 min-h-0 flex-1 overflow-y-auto pr-3 post-conference-scrollbar">
                {question.answers.map((answer, answerIndex) => (
                  <button
                    key={answer.id}
                    onClick={() => handleAnswer(answer)}
                    className="group relative flex min-h-[76px] w-full items-center border-b border-white/10 py-4 text-left transition-colors duration-200 first:border-t hover:border-cyan-300/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/60"
                  >
                    <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-cyan-400/12 to-transparent transition-[width] duration-300 group-hover:w-full" />
                    <span className="relative w-14 shrink-0 text-[14px] font-medium tracking-normal text-cyan-300/70 transition-colors group-hover:text-cyan-200">
                      {String(answerIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="relative pr-12 text-[17px] font-medium leading-[1.45] tracking-normal text-slate-200 transition-colors group-hover:text-white">
                      {answer.text}
                    </span>
                    <span className="relative ml-auto mr-2 text-xl font-light text-cyan-300/0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-300/80">→</span>
                  </button>
                ))}
              </div>
            </section>
          </main>
        </div>

        <button
          type="button"
          onClick={handleLeaveConference}
          className="group absolute bottom-10 right-14 z-20 flex w-[360px] items-center overflow-hidden rounded-xl border border-white/15 bg-[#061225]/55 px-5 py-4 text-left text-[16px] font-semibold tracking-normal text-slate-200 shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition-all duration-200 hover:border-rose-300/40 hover:bg-[#241225]/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
        >
          <span className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-rose-300/70 via-fuchsia-400/35 to-transparent transition-all duration-200 group-hover:inset-x-3" />
          <span className="relative">Opuść konferencję prasową</span>
          <span className="relative ml-auto text-rose-300 transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>

      <style>{`
        .post-conference-scrollbar::-webkit-scrollbar { width: 3px; }
        .post-conference-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .post-conference-scrollbar::-webkit-scrollbar-thumb { background: rgba(125, 211, 252, 0.18); border-radius: 10px; }
      `}</style>
    </div>
  );
};
