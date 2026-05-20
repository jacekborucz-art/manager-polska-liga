import { useState } from 'react';
import { DebriefComment } from '../../data/postmatch_debrief_pl';
import {
  DebriefEffect,
  DebriefContext,
  DebriefMatchStage,
  getCommentsForContext,
  calculateDebriefEffect,
  getDebriefContextLabel,
  getDebriefAccentColor,
} from '../../services/PostMatchDebriefService';

interface PostMatchDebriefModalProps {
  isOpen: boolean;
  onClose: (effect: DebriefEffect) => void;
  context: DebriefContext;
  userScore: number;
  oppScore: number;
  userSide: 'HOME' | 'AWAY';
  homeClubName: string;
  awayClubName: string;
  sessionSeed: number;
  matchStage?: DebriefMatchStage;
  userPenaltyScore?: number;
  oppPenaltyScore?: number;
}

type Phase = 'SELECTING' | 'REACTING';

export const PostMatchDebriefModal = ({
  isOpen,
  onClose,
  context,
  userScore,
  oppScore,
  userSide,
  homeClubName,
  awayClubName,
  sessionSeed,
  matchStage = 'LEAGUE',
  userPenaltyScore,
  oppPenaltyScore,
}: PostMatchDebriefModalProps) => {
  const [phase, setPhase] = useState<Phase>('SELECTING');
  const [reactionText, setReactionText] = useState('');
  const [pendingEffect, setPendingEffect] = useState<DebriefEffect | null>(null);

  if (!isOpen) return null;

  const comments: DebriefComment[] = getCommentsForContext(context, matchStage);
  const accent = getDebriefAccentColor(context);
  const contextLabel = getDebriefContextLabel(context, matchStage);

  const leftClubName  = userSide === 'HOME' ? homeClubName : awayClubName;
  const rightClubName = userSide === 'HOME' ? awayClubName : homeClubName;
  const leftScore     = userSide === 'HOME' ? userScore    : oppScore;
  const rightScore    = userSide === 'HOME' ? oppScore     : userScore;
  const hasPenaltyScore = userPenaltyScore !== undefined && oppPenaltyScore !== undefined;

  const handleSelect = (option: DebriefComment, index: number) => {
    const effect = calculateDebriefEffect(option.hiddenType, context, sessionSeed, index);
    setReactionText(effect.reactionText);
    setPendingEffect(effect);
    setPhase('REACTING');
  };

  const handleContinue = () => {
    if (pendingEffect) onClose(pendingEffect);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 animate-fade-in p-4">
      <div className="w-full max-w-5xl max-h-[96vh] mx-4 bg-slate-900/65 border border-white/10 rounded-[44px] shadow-[0_50px_100px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col relative">

        {/* ── GRADIENT BAR GÓRNY ── */}
        <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${accent.via} to-transparent`} />

        {/* ── TŁO GLOW ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent.glow} 0%, transparent 60%)` }} />

        {/* ── NAGŁÓWEK ── */}
        <div className="relative flex flex-col items-center gap-2 px-10 pt-7 pb-5 border-b border-white/5">
          <span className="text-4xl font-black text-white uppercase tracking-[0.3em]">ODPRAWA POMECZOWA</span>
          <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">PRZEMÓW DO DRUŻYNY</span>
        </div>

        {/* ── FAZA WYBORU ── */}
        {phase === 'SELECTING' && (
          <div className="relative flex flex-col">
            <div className="px-10 pt-5 pb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                KOMENTARZ DO SZATNI
              </span>
            </div>
            <div className="px-6 pb-7 grid grid-cols-2 gap-2">
              {comments.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt, idx)}
                  className="w-full text-left px-5 py-3 rounded-2xl bg-white/[0.03] border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-slate-300 text-sm font-medium leading-snug hover:bg-yellow-500/15 hover:border-t-yellow-400/50 hover:border-x-yellow-400/30 hover:border-b-yellow-900/60 hover:text-yellow-100 transition-all active:translate-y-[2px]"
                  style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── FAZA REAKCJI ── */}
        {phase === 'REACTING' && (
          <div className="relative flex flex-col items-center gap-8 px-10 py-12">
            <div className="text-5xl drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">💬</div>
            <p className="text-center text-lg font-bold text-white italic leading-relaxed drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              {reactionText}
            </p>
            <button
              onClick={handleContinue}
              className="mt-2 min-w-[220px] py-3.5 px-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-black italic uppercase tracking-tighter text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.12)] hover:bg-emerald-600/30 flex items-center justify-center gap-3 group"
            >
              <span>STUDIO POMECZOWE</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
