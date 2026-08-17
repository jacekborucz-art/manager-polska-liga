import { useState, useMemo, useEffect } from 'react';
import { Newspaper } from '../../types';
import { INTERVIEW_POOL, InterviewAnswer, InterviewQuestion, InterviewScore, ManagerProfileScore } from '../../data/media_interviews_pl';
import { NEWSPAPER_DISPLAY_NAMES, MediaInterviewService } from '../../services/MediaInterviewService';
import { ConferenceScene } from './PreMatchPressConferenceModal';

export interface MediaInterviewResult {
  totalScore: InterviewScore;
  totalRelationshipDelta: number;
  newspaper: Newspaper;
  totalProfileScore: ManagerProfileScore;
}

interface MediaInterviewModalProps {
  isOpen: boolean;
  onClose: (result: MediaInterviewResult) => void;
  newspaper: Newspaper;
  questionIds: string[];
  placeholders: Record<string, string>;
}

type Phase = 'QUESTIONING' | 'SUMMARY';

const applyPlaceholders = (text: string, ph: Record<string, string>): string =>
  Object.entries(ph).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), text);

const ACCENT: Record<Newspaper, { color: string; glow: string }> = {
  [Newspaper.GAZETA_SPORTOWA]:   { color: '#FACC15', glow: 'rgba(250,204,21,0.7)' },
  [Newspaper.DWIE_BRAMKI]:       { color: '#60A5FA', glow: 'rgba(96,165,250,0.7)' },
  [Newspaper.PILKA_NOZNA]:       { color: '#34D399', glow: 'rgba(52,211,153,0.7)' },
  [Newspaper.FUTBOL_NAD_WISLA]:  { color: '#22D3EE', glow: 'rgba(34,211,238,0.7)' },
  [Newspaper.DZIENNIK_SPORTOWY]: { color: '#A78BFA', glow: 'rgba(167,139,250,0.7)' },
};


export const MediaInterviewModal = ({
  isOpen,
  onClose,
  newspaper,
  questionIds,
  placeholders,
}: MediaInterviewModalProps) => {
  const [phase, setPhase] = useState<Phase>('QUESTIONING');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<InterviewAnswer[]>([]);

  const questions = useMemo(() => {
    const pool = INTERVIEW_POOL[newspaper] ?? [];
    return questionIds
      .map(id => pool.find(q => q.id === id))
      .filter((q): q is InterviewQuestion => q !== undefined);
  }, [questionIds, newspaper]);

  const questionTexts = useMemo(() =>
    questions.map(q => {
      const v = q.questionVariants[Math.floor(Math.random() * q.questionVariants.length)];
      return applyPlaceholders(v, placeholders);
    }),
    [questions, placeholders]
  );

  const totalScore = useMemo(() =>
    MediaInterviewService.calculateTotalScore(selectedAnswers),
    [selectedAnswers]
  );

  const totalRelationshipDelta = useMemo(() =>
    selectedAnswers.reduce((sum, a) => sum + a.relationshipDelta, 0),
    [selectedAnswers]
  );

  const totalProfileScore = useMemo(() =>
    MediaInterviewService.sumProfileScore(selectedAnswers),
    [selectedAnswers]
  );

  useEffect(() => {
    if (isOpen) {
      setPhase('QUESTIONING');
      setCurrentIndex(0);
      setSelectedAnswers([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const accent = ACCENT[newspaper];
  const displayName = NEWSPAPER_DISPLAY_NAMES[newspaper];
  const currentQuestion = questions[currentIndex];
  const currentQuestionText = questionTexts[currentIndex];

  const handleAnswer = (answer: InterviewAnswer) => {
    const newAnswers = [...selectedAnswers, answer];
    setSelectedAnswers(newAnswers);
    if (currentIndex + 1 >= questions.length) {
      setPhase('SUMMARY');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleConfirm = () => {
    onClose({ totalScore, totalRelationshipDelta, newspaper, totalProfileScore });
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-7 backdrop-blur-xl animate-fade-in">
      <div className="relative h-[min(920px,calc(100vh-56px))] w-[min(1660px,calc(100vw-64px))] overflow-hidden rounded-[48px]">
        <ConferenceScene />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(90deg, rgba(0, 4, 13, 0.42) 0%, rgba(0, 3, 11, 0.72) 42%, rgba(0, 2, 8, 0.86) 100%)',
          }}
        />

        <div className="relative z-10 grid h-full grid-cols-[500px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col justify-between px-14 pb-12 pt-11">
            <div>
              <div className="flex items-center gap-3 text-[15px] font-semibold tracking-normal text-cyan-100">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inset-0 rounded-full opacity-60 animate-ping" style={{ backgroundColor: accent.color }} />
                  <span className="relative m-[3px] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent.color }} />
                </span>
                Wywiad prasowy
              </div>
              <p className="mt-2 text-sm font-normal tracking-normal text-blue-200/60">Rozmowa indywidualna</p>
            </div>

            <div className="mb-2 max-w-[345px]">
              <p className="text-[13px] font-medium tracking-normal" style={{ color: accent.color }}>{displayName}</p>
              <p className="mt-2 text-[27px] font-semibold leading-tight tracking-[-0.02em] text-white">
                Pytania o klub, drużynę i bieżące wydarzenia
              </p>

              <div className="mt-8 flex items-end gap-3">
                <span className="text-5xl font-light leading-none tracking-normal text-white">
                  {phase === 'SUMMARY' ? String(questions.length).padStart(2, '0') : String(currentIndex + 1).padStart(2, '0')}
                </span>
                <span className="pb-1 text-lg font-normal tracking-normal text-blue-200/45">
                  / {String(questions.length).padStart(2, '0')}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                {questions.map((item, index) => (
                  <span
                    key={item.id}
                    className="h-1.5 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor: index <= currentIndex || phase === 'SUMMARY' ? accent.color : 'rgba(255,255,255,0.15)',
                      boxShadow: index === currentIndex && phase === 'QUESTIONING' ? `0 0 12px ${accent.glow}` : 'none',
                    }}
                  />
                ))}
              </div>

              <p className="mt-4 text-sm font-normal leading-relaxed tracking-normal text-slate-300/65">
                Odpowiadaj zgodnie z kierunkiem, w jakim chcesz budować swój wizerunek w mediach.
              </p>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col pb-12 pl-14 pr-16 pt-12">
            <header className="shrink-0 pr-8">
              <p className="text-sm font-medium tracking-normal" style={{ color: accent.color }}>{displayName}</p>
              <h2 className="mt-2 max-w-[970px] text-[40px] font-semibold leading-[1.12] tracking-[-0.025em] text-white">
                {phase === 'SUMMARY' ? 'Wywiad zakończony' : `Wywiad dla ${displayName}`}
              </h2>
            </header>

            {phase === 'QUESTIONING' && currentQuestion && (
              <section className="mt-9 flex min-h-0 flex-1 flex-col">
                <div className="shrink-0">
                  <div className="flex items-center gap-3 text-[13px] font-medium tracking-normal text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.75)]" />
                    Pytanie redakcji
                  </div>
                  <p className="mt-3 max-w-[1020px] text-[27px] font-semibold leading-[1.3] tracking-[-0.015em] text-slate-50">
                    {currentQuestionText}
                  </p>
                </div>

                <div className="mt-7 min-h-0 flex-1 overflow-y-auto pr-3 media-interview-scrollbar">
                  {currentQuestion.answers.map((answer, answerIndex) => (
                    <button
                      key={answer.id}
                      onClick={() => handleAnswer(answer)}
                      className={`group relative flex min-h-[76px] w-full items-center border-b border-white/10 py-4 text-left transition-colors duration-200 first:border-t hover:border-cyan-300/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/60 ${answerIndex % 2 === 0 ? 'bg-white/[0.012]' : 'bg-cyan-950/[0.035]'}`}
                    >
                      <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-cyan-400/12 to-transparent transition-[width] duration-300 group-hover:w-full" />
                      <span className="relative w-14 shrink-0 text-[14px] font-medium tracking-normal transition-colors group-hover:text-cyan-100" style={{ color: accent.color }}>
                        {String(answerIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="relative pr-12 text-[17px] font-medium leading-[1.45] tracking-normal text-slate-200 transition-colors group-hover:text-white">
                        {applyPlaceholders(answer.text, placeholders)}
                      </span>
                      <span className="relative ml-auto mr-2 text-xl font-light text-cyan-300/0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-300/80">→</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {phase === 'SUMMARY' && (
              <section className="flex flex-1 flex-col justify-center pb-24">
                <div className="max-w-[820px] border-l-2 pl-7" style={{ borderColor: accent.color }}>
                  <p className="text-[31px] font-semibold leading-tight tracking-[-0.02em] text-white">
                    Dziękujemy za udzielenie wywiadu.
                  </p>
                  <p className="mt-4 text-[17px] font-normal leading-relaxed tracking-normal text-slate-300/75">
                    Redakcja zakończyła rozmowę. Twoje wypowiedzi zostaną uwzględnione w relacjach z mediami i profilu trenera.
                  </p>
                </div>
              </section>
            )}
          </main>
        </div>

        {phase === 'SUMMARY' && (
          <button
            type="button"
            onClick={handleConfirm}
            className="group absolute bottom-10 right-14 z-20 flex w-[360px] items-center overflow-hidden rounded-xl border border-white/15 bg-[#061225]/70 px-5 py-4 text-left text-[16px] font-semibold tracking-normal text-slate-200 shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition-all duration-200 hover:border-cyan-300/40 hover:bg-[#0A2039]/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            <span className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-cyan-300/70 via-blue-400/35 to-transparent transition-all duration-200 group-hover:inset-x-3" />
            <span className="relative">Zakończ wywiad</span>
            <span className="relative ml-auto text-cyan-300 transition-transform group-hover:translate-x-1">→</span>
          </button>
        )}
      </div>

      <style>{`
        .media-interview-scrollbar::-webkit-scrollbar { width: 3px; }
        .media-interview-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .media-interview-scrollbar::-webkit-scrollbar-thumb { background: rgba(125, 211, 252, 0.18); border-radius: 10px; }
      `}</style>
    </div>
  );
};
