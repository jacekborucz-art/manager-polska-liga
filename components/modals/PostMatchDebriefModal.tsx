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
import type { LeagueMotivationContext } from '../../services/LeagueMotivationContextService';
import { getLeagueMotivationContextLabel } from '../../services/LeagueMotivationContextService';

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
  leagueMotivationContext?: LeagueMotivationContext | null;
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
  leagueMotivationContext = null,
}: PostMatchDebriefModalProps) => {
  const [phase, setPhase] = useState<Phase>('SELECTING');
  const [reactionText, setReactionText] = useState('');
  const [pendingEffect, setPendingEffect] = useState<DebriefEffect | null>(null);

  if (!isOpen) return null;

  const comments: DebriefComment[] = getCommentsForContext(context, matchStage, leagueMotivationContext);
  const accent = getDebriefAccentColor(context);
  const contextLabel = getLeagueMotivationContextLabel(leagueMotivationContext) ?? getDebriefContextLabel(context, matchStage);

  const leftClubName  = userSide === 'HOME' ? homeClubName : awayClubName;
  const rightClubName = userSide === 'HOME' ? awayClubName : homeClubName;
  const leftScore     = userScore;
  const rightScore    = oppScore;
  const hasPenaltyScore = userPenaltyScore !== undefined && oppPenaltyScore !== undefined;
  const leftPenaltyScore  = userPenaltyScore;
  const rightPenaltyScore = oppPenaltyScore;

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
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[1080px] mx-4 bg-slate-900/70 border border-white/10 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative">

        {/* GRADIENT BAR */}
        <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${accent.via} to-transparent`} />

        {/* TŁO GLOW */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent.glow} 0%, transparent 60%)` }} />

        {/* HEADER */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/5 flex flex-col gap-3">
          <div className="flex justify-center">
            <div className={`inline-flex items-center rounded-full px-4 py-1 ${accent.badge}`}>
              <span className="text-[9px] font-black italic uppercase tracking-[0.25em]">
                {contextLabel}
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none text-center">
            ODPRAWA<br />
            <span className={accent.badge.split(' ')[0]}>POMECZOWA</span>
          </h1>

          {/* WYNIK */}
          <div className="flex items-center gap-3 mt-1 px-4 py-3 rounded-2xl bg-white/[0.03]">
            <div className="flex-1">
              <div className="text-[37.5px] font-black italic uppercase tracking-tighter text-white leading-tight">{leftClubName}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-4xl font-black font-mono tracking-tight text-white">{leftScore}</span>
              {hasPenaltyScore && (
                <span className="text-lg font-black font-mono tracking-tight text-slate-500">({leftPenaltyScore})</span>
              )}
              <span className="text-2xl font-light text-slate-500">:</span>
              {hasPenaltyScore && (
                <span className="text-lg font-black font-mono tracking-tight text-slate-500">({rightPenaltyScore})</span>
              )}
              <span className="text-4xl font-black font-mono tracking-tight text-white">{rightScore}</span>
            </div>
            <div className="flex-1 text-right">
              <div className="text-[37.5px] font-black italic uppercase tracking-tighter text-white leading-tight">{rightClubName}</div>
            </div>
          </div>
        </div>

        {/* FAZA WYBORU */}
        {phase === 'SELECTING' && (
          <div className="relative flex flex-col">
            <div className="flex flex-col items-center gap-3 px-8 pt-5 pb-2">
              <span className="text-sm font-black italic uppercase tracking-tighter text-cyan-400">
                PRZEMÓW DO DRUŻYNY
              </span>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            </div>

            <div className="overflow-y-auto custom-scrollbar max-h-[420px] px-8 pb-7 grid grid-cols-1 gap-3 md:grid-cols-2">
              {comments.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt, idx)}
                  className="w-full rounded-2xl border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 bg-white/[0.03] px-5 py-3.5 text-left transition-all duration-150 group hover:bg-yellow-500/15 hover:border-t-yellow-400/50 hover:border-x-yellow-400/30 hover:border-b-yellow-900/60 active:translate-y-[2px]"
                  style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  <p className="text-sm font-normal italic uppercase tracking-tighter text-white group-hover:text-white leading-snug">
                    {opt.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAZA REAKCJI */}
        {phase === 'REACTING' && (
          <div className="relative flex flex-col items-center px-8 py-8 gap-6">
            <div className="text-center">
              <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500 mb-3">
                REAKCJA SZATNI
              </div>
              <p className="text-xl font-black italic uppercase tracking-tighter text-white leading-snug">
                {reactionText}
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-2xl font-black italic uppercase tracking-tighter text-sm text-white transition-all duration-200 border-t border-x border-b border-t-emerald-400/60 border-x-emerald-500/30 border-b-black/60 bg-emerald-600/80 hover:bg-emerald-500 active:translate-y-[2px]"
              style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
            >
              STUDIO POMECZOWE
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
