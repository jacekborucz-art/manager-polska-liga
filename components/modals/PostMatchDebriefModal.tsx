import { useState } from 'react';
import { DebriefComment } from '../../data/postmatch_debrief_pl';
import {
  DebriefEffect,
  DebriefContext,
  DebriefMatchStage,
  getCommentsForContext,
  calculateDebriefEffect,
  getDebriefContextLabel,
} from '../../services/PostMatchDebriefService';
import type { LeagueMotivationContext } from '../../services/LeagueMotivationContextService';
import { getLeagueMotivationContextLabel } from '../../services/LeagueMotivationContextService';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { LockerRoomBriefingScene } from './PreMatchBriefingModal';

interface PostMatchDebriefModalProps {
  isOpen: boolean;
  onClose: (effect: DebriefEffect) => void;
  context: DebriefContext;
  userScore: number;
  oppScore: number;
  userSide: 'HOME' | 'AWAY';
  homeClubName: string;
  awayClubName: string;
  homeClubId?: string;
  awayClubId?: string;
  homeClubColors?: string[];
  awayClubColors?: string[];
  sessionSeed: number;
  matchStage?: DebriefMatchStage;
  userPenaltyScore?: number;
  oppPenaltyScore?: number;
  leagueMotivationContext?: LeagueMotivationContext | null;
}

type Phase = 'SELECTING' | 'REACTING';

const WIN_CONTEXTS: DebriefContext[] = [
  'BIG_WIN',
  'WIN_STRONG',
  'WIN_WEAK',
  'WIN_NORMAL',
  'WIN_FROM_BEHIND',
  'WIN_BAD_SECOND_HALF',
  'PENALTY_WIN',
];

const LOSS_CONTEXTS: DebriefContext[] = [
  'BIG_LOSS',
  'LOSS_STRONG',
  'LOSS_WEAK',
  'LOSS_AFTER_LEADING',
  'LOSS_BAD_SECOND_HALF',
  'LAST_MIN_LOSS',
  'NARROW_LOSS',
  'RED_CARD_LOSS',
  'PENALTY_LOSS',
];

const getContextColor = (context: DebriefContext): string => {
  if (context === 'BIG_WIN' || context === 'WIN_STRONG') return '#FACC15';
  if (WIN_CONTEXTS.includes(context)) return '#34D399';
  if (context === 'BIG_LOSS' || context === 'LOSS_WEAK' || context === 'RED_CARD_LOSS') return '#F87171';
  if (LOSS_CONTEXTS.includes(context) || context === 'DRAW_LAST_MIN_AGAINST') return '#FB923C';
  if (context === 'DRAW_LAST_MIN_FOR' || context === 'DRAW_STRONG' || context === 'DRAW_FROM_BEHIND') return '#60A5FA';
  return '#94A3B8';
};

export const PostMatchDebriefModal = ({
  isOpen,
  onClose,
  context,
  userScore,
  oppScore,
  userSide,
  homeClubName,
  awayClubName,
  homeClubId,
  awayClubId,
  homeClubColors = ['#1e293b'],
  awayClubColors = ['#1e293b'],
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
  const contextLabel = getLeagueMotivationContextLabel(leagueMotivationContext) ?? getDebriefContextLabel(context, matchStage);
  const contextColor = getContextColor(context);

  const leftClubName = userSide === 'HOME' ? homeClubName : awayClubName;
  const rightClubName = userSide === 'HOME' ? awayClubName : homeClubName;
  const leftClubId = userSide === 'HOME' ? homeClubId : awayClubId;
  const rightClubId = userSide === 'HOME' ? awayClubId : homeClubId;
  const leftClubColor = userSide === 'HOME' ? homeClubColors[0] : awayClubColors[0];
  const rightClubColor = userSide === 'HOME' ? awayClubColors[0] : homeClubColors[0];
  const leftClubLogo = leftClubId ? getClubLogo(leftClubId) : undefined;
  const rightClubLogo = rightClubId ? getClubLogo(rightClubId) : undefined;
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
    <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-[#010307]/90 p-7 backdrop-blur-xl animate-fade-in">
      <div className="relative h-[min(920px,calc(100vh-56px))] w-[min(1660px,calc(100vw-64px))] overflow-hidden rounded-[48px]">
        <LockerRoomBriefingScene
          userColor={leftClubColor ?? '#1e293b'}
          opponentColor={rightClubColor ?? '#1e293b'}
          scenarioColor={contextColor}
        />

        <div className="relative z-10 grid h-full grid-cols-[500px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col justify-between px-14 pb-12 pt-11">
            <div>
              <div className="flex items-center gap-3 text-[15px] font-semibold tracking-normal text-cyan-100">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inset-0 rounded-full opacity-60 animate-ping" style={{ backgroundColor: contextColor }} />
                  <span className="relative m-[3px] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: contextColor }} />
                </span>
                Odprawa pomeczowa
              </div>
              <p className="mt-2 text-sm font-normal tracking-normal text-blue-200/60">Po ostatnim gwizdku</p>
            </div>

            <div className="mb-2 max-w-[325px]">
              <p className="text-sm font-medium leading-relaxed tracking-normal" style={{ color: contextColor }}>{contextLabel}</p>
              <p className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.02em] text-white">
                Czas podsumować spotkanie
              </p>
              <p className="mt-4 text-sm font-normal leading-relaxed tracking-normal text-slate-300/65">
                Zawodnicy czekają w szatni na Twoją ocenę meczu.
              </p>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col pb-11 pl-14 pr-16 pt-10">
            <header className="shrink-0">
              <p className="text-sm font-medium tracking-normal text-cyan-300/80">Rozmowa z zespołem</p>
              <h1 className="mt-1 text-[38px] font-semibold leading-tight tracking-[-0.025em] text-white">Przemów do drużyny</h1>

              <div className="mt-6 flex items-center border-b border-white/10 pb-6">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {leftClubLogo && (
                    <img
                      src={leftClubLogo}
                      alt={`Herb ${leftClubName}`}
                      className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.5)]"
                    />
                  )}
                  <span className="min-w-0 text-[25px] font-semibold leading-tight tracking-[-0.02em] text-white">{leftClubName}</span>
                </div>

                <div className="mx-7 flex shrink-0 items-baseline gap-3 font-mono text-white">
                  <span className="text-[42px] font-semibold leading-none">{userScore}</span>
                  {hasPenaltyScore && <span className="text-lg text-slate-500">({userPenaltyScore})</span>}
                  <span className="text-2xl font-light text-slate-600">:</span>
                  {hasPenaltyScore && <span className="text-lg text-slate-500">({oppPenaltyScore})</span>}
                  <span className="text-[42px] font-semibold leading-none">{oppScore}</span>
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-end gap-4 text-right">
                  <span className="min-w-0 text-[25px] font-semibold leading-tight tracking-[-0.02em] text-white">{rightClubName}</span>
                  {rightClubLogo && (
                    <img
                      src={rightClubLogo}
                      alt={`Herb ${rightClubName}`}
                      className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.5)]"
                    />
                  )}
                </div>
              </div>
            </header>

            {phase === 'SELECTING' && (
              <section className="mt-4 min-h-0 flex-1">
                <div className="grid h-full min-h-0 grid-cols-2 gap-x-9 overflow-y-auto pr-3 debrief-scrollbar">
                  {comments.map((option, index) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option, index)}
                      className="group relative flex min-h-[86px] items-center border-b border-white/10 py-4 text-left transition-colors duration-200 hover:border-cyan-300/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/60"
                    >
                      <span className="absolute inset-y-2 left-0 w-0 rounded-r-full bg-gradient-to-r from-cyan-400/12 to-transparent transition-[width] duration-300 group-hover:w-full" />
                      <span className="relative w-12 shrink-0 text-[13px] font-medium tracking-normal text-cyan-300/65 transition-colors group-hover:text-cyan-200">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="relative pr-7 text-[16px] font-medium leading-[1.42] tracking-normal text-slate-200 transition-colors group-hover:text-white">
                        {option.text}
                      </span>
                      <span className="relative ml-auto text-lg font-light text-cyan-300/0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-300/80">→</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {phase === 'REACTING' && pendingEffect && (
              <section className="flex min-h-0 flex-1 flex-col justify-center pb-8 pt-10">
                <p className="text-sm font-medium tracking-normal text-cyan-300/75">Reakcja szatni</p>
                <p className="mt-4 max-w-[940px] text-[31px] font-semibold leading-[1.34] tracking-[-0.018em] text-white">{reactionText}</p>

                <div className="mt-10 flex items-center gap-4 border-y border-white/10 py-5">
                  <span className="text-sm font-normal tracking-normal text-slate-500">Ocena sytuacji</span>
                  <span className="text-lg font-semibold tracking-normal" style={{ color: contextColor }}>{contextLabel}</span>
                </div>

                <button
                  onClick={handleContinue}
                  className="group absolute bottom-10 right-14 flex w-[420px] items-center overflow-hidden rounded-xl border border-white/15 bg-[#061225]/55 px-5 py-4 text-left text-[17px] font-semibold tracking-normal text-white shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition-all duration-200 hover:border-cyan-300/45 hover:bg-[#0A1D36]/75 hover:shadow-[0_14px_34px_rgba(0,0,0,0.36),0_0_20px_rgba(34,211,238,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  <span className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-cyan-300/75 via-blue-400/45 to-transparent transition-all duration-200 group-hover:inset-x-3 group-hover:from-cyan-200" />
                  <span className="relative">Przejdź do studia pomeczowego</span>
                  <span className="relative ml-auto text-cyan-300 transition-transform group-hover:translate-x-1">→</span>
                </button>
              </section>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .debrief-scrollbar::-webkit-scrollbar { width: 3px; }
        .debrief-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .debrief-scrollbar::-webkit-scrollbar-thumb { background: rgba(125, 211, 252, 0.18); border-radius: 10px; }
      `}</style>
    </div>
  );
};
