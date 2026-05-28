import { useState, useMemo, useEffect } from 'react';
import { Newspaper } from '../../types';
import { INTERVIEW_POOL, InterviewAnswer, InterviewQuestion, InterviewScore, ManagerProfileScore } from '../../data/media_interviews_pl';
import { NEWSPAPER_DISPLAY_NAMES, MediaInterviewService } from '../../services/MediaInterviewService';

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

const ACCENT: Record<Newspaper, { text: string; via: string; glow: string; hover: string; btn: string }> = {
  [Newspaper.GAZETA_SPORTOWA]:   { text: 'text-yellow-400',  via: 'via-yellow-500',  glow: 'rgba(234,179,8,0.07)',   hover: 'hover:bg-yellow-500/15 hover:border-t-yellow-400/50 hover:border-x-yellow-400/30 hover:border-b-yellow-900/60',   btn: 'bg-yellow-600/80 hover:bg-yellow-500 border-t-yellow-400/60 border-x-yellow-500/30 border-b-black/60' },
  [Newspaper.DWIE_BRAMKI]:       { text: 'text-blue-400',    via: 'via-blue-500',    glow: 'rgba(59,130,246,0.07)',  hover: 'hover:bg-blue-500/15 hover:border-t-blue-400/50 hover:border-x-blue-400/30 hover:border-b-blue-900/60',           btn: 'bg-blue-600/80 hover:bg-blue-500 border-t-blue-400/60 border-x-blue-500/30 border-b-black/60' },
  [Newspaper.PILKA_NOZNA]:       { text: 'text-emerald-400', via: 'via-emerald-500', glow: 'rgba(52,211,153,0.07)',  hover: 'hover:bg-emerald-500/15 hover:border-t-emerald-400/50 hover:border-x-emerald-400/30 hover:border-b-emerald-900/60', btn: 'bg-emerald-600/80 hover:bg-emerald-500 border-t-emerald-400/60 border-x-emerald-500/30 border-b-black/60' },
  [Newspaper.FUTBOL_NAD_WISLA]:  { text: 'text-cyan-400',    via: 'via-cyan-500',    glow: 'rgba(6,182,212,0.07)',   hover: 'hover:bg-cyan-500/15 hover:border-t-cyan-400/50 hover:border-x-cyan-400/30 hover:border-b-cyan-900/60',           btn: 'bg-cyan-600/80 hover:bg-cyan-500 border-t-cyan-400/60 border-x-cyan-500/30 border-b-black/60' },
  [Newspaper.DZIENNIK_SPORTOWY]: { text: 'text-violet-400',  via: 'via-violet-500',  glow: 'rgba(139,92,246,0.07)', hover: 'hover:bg-violet-500/15 hover:border-t-violet-400/50 hover:border-x-violet-400/30 hover:border-b-violet-900/60',  btn: 'bg-violet-600/80 hover:bg-violet-500 border-t-violet-400/60 border-x-violet-500/30 border-b-black/60' },
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
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm">
      <div className="w-full max-w-[900px] mx-4 bg-slate-900/70 border border-white/10 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar">

        {/* GRADIENT BAR */}
        <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${accent.via} to-transparent`} />

        {/* TŁO GLOW */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent.glow} 0%, transparent 60%)` }} />

        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-[110px] font-black italic uppercase tracking-tighter select-none -rotate-12 whitespace-nowrap opacity-[0.04] ${accent.text}`}>
            {displayName}
          </span>
        </div>

        {/* HEADER */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/5 flex flex-col gap-2">
          <div className="flex justify-center">
            <span className={`text-[9px] font-black italic uppercase tracking-[0.25em] ${accent.text}`}>
              {displayName}
            </span>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none text-center">
            WYWIAD<br />
            <span className={accent.text}>DLA {displayName}</span>
          </h1>
          {phase === 'QUESTIONING' && (
            <div className="flex justify-center mt-1">
              <span className="text-[9px] font-black italic uppercase tracking-[0.2em] text-slate-500">
                PYTANIE {currentIndex + 1} / {questions.length}
              </span>
            </div>
          )}
        </div>

        {/* FAZA PYTAŃ */}
        {phase === 'QUESTIONING' && currentQuestion && (
          <div className="relative flex flex-col">
            <div className="px-8 pt-5 pb-4">
              <p className={`text-lg font-black italic uppercase tracking-tighter ${accent.text} leading-snug text-center`}>
                {currentQuestionText}
              </p>
            </div>

            <div className="px-8 pb-6 flex flex-col gap-3">
              {currentQuestion.answers.map(answer => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswer(answer)}
                  className={`w-full rounded-2xl border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 bg-white/[0.03] px-5 py-3.5 text-left transition-all duration-150 group ${accent.hover} active:translate-y-[2px]`}
                  style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  <p className="text-sm font-normal italic uppercase tracking-tighter text-white group-hover:text-white leading-snug">
                    {applyPlaceholders(answer.text, placeholders)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAZA PODSUMOWANIA */}
        {phase === 'SUMMARY' && (
          <div className="relative flex flex-col items-center px-8 py-12 gap-8">
            <p className="text-xl font-black italic uppercase tracking-tighter text-white text-center leading-snug">
              Dziękujemy za udzielenie wywiadu.
            </p>

            <button
              onClick={handleConfirm}
              className={`w-full py-4 rounded-2xl font-black italic uppercase tracking-tighter text-sm text-white transition-all duration-200 border-t border-x border-b active:translate-y-[2px] ${accent.btn}`}
              style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
            >
              ZAKOŃCZ WYWIAD
            </button>
          </div>
        )}

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};
