import { useState } from 'react';
import { createPortal } from 'react-dom';
import { TalkOption } from '../../data/halftime_talks_pl';
import type { Player } from '../../types';
import {
  TalkEffect,
  getScoreContext,
  getTalksForContext,
  getFriendlyTalksForContext,
  calculateTalkEffect,
  calculateFriendlyTalkEffect,
} from '../../services/HalftimeTalkService';
import type { LeagueMotivationContext } from '../../services/LeagueMotivationContextService';
import { getLeagueMotivationContextLabel } from '../../services/LeagueMotivationContextService';

const JerseyIcon = ({ primary, secondary, size = "w-10 h-10" }: { primary: string, secondary: string, size?: string }) => (
  <div className="relative">
    <div className="absolute inset-[-10px] rounded-full blur-2xl opacity-40" style={{ backgroundColor: primary }} />
    <div className={`relative ${size} flex items-center justify-center p-1`}>
      <svg viewBox="0 0 24 30" className="w-full h-full drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" fill={primary} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
        <path d="M7 2L2 5v4l3 1v10h14V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" />
        <path d="M12 4L10 6L12 8L14 6L12 4Z" fill={secondary} fillOpacity="0.6" />
        <path d="M5 20h6v9H5z" fill={secondary} />
        <path d="M13 20h6v9h-6z" fill={secondary} />
      </svg>
    </div>
  </div>
);

interface HalftimeTalkModalProps {
  isOpen: boolean;
  onClose: (effect: TalkEffect) => void;
  userScore: number;
  oppScore: number;
  userSide: 'HOME' | 'AWAY';
  homeClubName: string;
  awayClubName: string;
  homeClubColors: string[];
  awayClubColors: string[];
  homeKitPrimary: string;
  homeKitSecondary: string;
  awayKitPrimary: string;
  awayKitSecondary: string;
  userShots: number;
  userShotsOnTarget: number;
  userCorners: number;
  userFouls: number;
  userYellowCards: number;
  oppShots: number;
  oppShotsOnTarget: number;
  oppCorners: number;
  oppFouls: number;
  oppYellowCards: number;
  userPossession: number;
  momentumEndOf1st: number;
  avgFatigue: number;
  sessionSeed: number;
  isFriendly?: boolean;
  playersOnPitch?: Player[];
  leagueMotivationContext?: LeagueMotivationContext | null;
}

type Phase = 'SELECTING' | 'REACTING';

export const HalftimeTalkModal = ({
  isOpen,
  onClose,
  userScore,
  oppScore,
  userSide,
  homeClubName,
  awayClubName,
  homeClubColors,
  awayClubColors,
  homeKitPrimary,
  homeKitSecondary,
  awayKitPrimary,
  awayKitSecondary,
  userShots,
  userShotsOnTarget,
  userCorners,
  userFouls,
  userYellowCards,
  oppShots,
  oppShotsOnTarget,
  oppCorners,
  oppFouls,
  oppYellowCards,
  userPossession,
  momentumEndOf1st,
  avgFatigue,
  sessionSeed,
  isFriendly = false,
  playersOnPitch = [],
  leagueMotivationContext = null,
}: HalftimeTalkModalProps) => {
  const [phase, setPhase] = useState<Phase>('SELECTING');
  const [reactionText, setReactionText] = useState('');
  const [pendingEffect, setPendingEffect] = useState<TalkEffect | null>(null);

  if (!isOpen) return null;

  const context = getScoreContext(userScore, oppScore);
  const talks: TalkOption[] = isFriendly ? getFriendlyTalksForContext(context) : getTalksForContext(context, leagueMotivationContext);
  const leagueMotivationLabel = getLeagueMotivationContextLabel(leagueMotivationContext);

  const handleSelect = (option: TalkOption, index: number) => {
    const effect = isFriendly
      ? calculateFriendlyTalkEffect(
          option.hiddenType,
          context,
          momentumEndOf1st,
          avgFatigue,
          userShots,
          sessionSeed,
          index,
          playersOnPitch
        )
      : calculateTalkEffect(
          option.hiddenType,
          context,
          momentumEndOf1st,
          avgFatigue,
          userShots,
          sessionSeed,
          index
        );
    setReactionText(effect.reactionText);
    setPendingEffect(effect);
    setPhase('REACTING');
  };

  const handleContinue = () => {
    if (pendingEffect) onClose(pendingEffect);
  };

  const userClubName = userSide === 'HOME' ? homeClubName : awayClubName;
  const oppClubName  = userSide === 'HOME' ? awayClubName : homeClubName;

  // Scoreboard oriented by side: HOME always on the left, AWAY on the right
  const leftClubName  = userSide === 'HOME' ? userClubName : oppClubName;
  const rightClubName = userSide === 'HOME' ? oppClubName  : userClubName;
  const leftScore     = userSide === 'HOME' ? userScore    : oppScore;
  const rightScore    = userSide === 'HOME' ? oppScore     : userScore;

  const leftKitPrimary    = homeKitPrimary;
  const leftKitSecondary  = homeKitSecondary;
  const rightKitPrimary   = awayKitPrimary;
  const rightKitSecondary = awayKitSecondary;

  const getContextLabel = (): string => {
    if (context === 'DRAW_LOW')     return 'Remis bez bramek';
    if (context === 'DRAW_HIGH')    return 'Remis';
    if (context === 'LOSING_ONE')   return 'Przegrywamy o bramkę';
    if (context === 'LOSING_HIGH')  return 'Wyraźnie przegrywamy';
    if (context === 'WINNING_ONE')  return 'Prowadzimy jedną bramką';
    return 'Mecz mamy pod kontrolą';
  };

  const getContextAccent = (): string => {
    if (context === 'LOSING_HIGH')  return 'via-red-500';
    if (context === 'LOSING_ONE')   return 'via-orange-500';
    if (context === 'DRAW_LOW')     return 'via-slate-400';
    if (context === 'DRAW_HIGH')    return 'via-yellow-500';
    if (context === 'WINNING_ONE')  return 'via-emerald-500';
    return 'via-emerald-400';
  };

  const getContextColor = (): string => {
    if (context === 'LOSING_HIGH')  return 'text-red-400 border-red-500/40 bg-red-500/10';
    if (context === 'LOSING_ONE')   return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
    if (context === 'DRAW_LOW')     return 'text-slate-300 border-slate-500/40 bg-slate-500/10';
    if (context === 'DRAW_HIGH')    return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
    if (context === 'WINNING_ONE')  return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    return 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10';
  };

  const getContextGlow = (): string => {
    if (context === 'LOSING_HIGH')  return 'rgba(239,68,68,0.08)';
    if (context === 'LOSING_ONE')   return 'rgba(249,115,22,0.08)';
    if (context === 'DRAW_LOW')     return 'rgba(148,163,184,0.05)';
    if (context === 'DRAW_HIGH')    return 'rgba(234,179,8,0.08)';
    if (context === 'WINNING_ONE')  return 'rgba(52,211,153,0.08)';
    return 'rgba(52,211,153,0.10)';
  };

  const getContextBadge = (): string => {
    if (context === 'LOSING_HIGH' || context === 'LOSING_ONE') return 'bg-red-600';
    if (context === 'DRAW_LOW'    || context === 'DRAW_HIGH')  return 'bg-yellow-600';
    return 'bg-emerald-600';
  };

  const getContextAccentColor = (): string => {
    if (context === 'LOSING_HIGH') return 'text-red-400';
    if (context === 'LOSING_ONE')  return 'text-orange-400';
    if (context === 'DRAW_LOW')    return 'text-slate-400';
    if (context === 'DRAW_HIGH')   return 'text-yellow-400';
    if (context === 'WINNING_ONE') return 'text-emerald-400';
    return 'text-emerald-400';
  };

  const getMoodLabel = (): string => {
    if (context === 'LOSING_HIGH') {
      if (momentumEndOf1st > 15)  return 'Jesteśmy pod presją wyniku';
      if (momentumEndOf1st < -15) return 'Przeciwnik wyraźnie dominuje nad nami';
      return 'Tracimy kontrolę';
    }
    if (context === 'LOSING_ONE') {
      if (momentumEndOf1st > 15)  return 'Walczymy o wyrównanie';
      if (momentumEndOf1st < -15) return 'Jesteśmy pod ciągłą presją';
      return 'Przegrywamy o bramkę';
    }
    if (context === 'WINNING_HIGH') {
      if (momentumEndOf1st < -15) return 'Utrzymujemy wynik';
      return 'Dominujemy';
    }
    if (context === 'WINNING_ONE') {
      if (momentumEndOf1st > 15)  return 'Posiadamy lekką przewagę';
      if (momentumEndOf1st < -15) return 'Bronimy prowadzenia';
      return 'Prowadzimy';
    }
    if (momentumEndOf1st > 40)  return 'Dominujemy';
    if (momentumEndOf1st > 15)  return 'Posiadamy lekką przewagę';
    if (momentumEndOf1st < -40) return 'Jesteśmy pod ciągłą presją';
    if (momentumEndOf1st < -15) return 'Przeciwnik lekko przeważa';
    return 'Wyrównany mecz';
  };

  const getMoodColor = (): string => {
    if (context === 'LOSING_HIGH') return 'text-red-400';
    if (context === 'LOSING_ONE')  return 'text-orange-400';
    if (context === 'WINNING_HIGH' || context === 'WINNING_ONE') return 'text-emerald-400';
    if (momentumEndOf1st > 15)  return 'text-emerald-400';
    if (momentumEndOf1st < -15) return 'text-red-400';
    return 'text-slate-300';
  };

  const statPct = (uNum: number, oNum: number): { u: number; o: number } => {
    const total = uNum + oNum;
    if (total === 0) return { u: 50, o: 50 };
    return { u: Math.round((uNum / total) * 100), o: Math.round((oNum / total) * 100) };
  };

  const oppPossession = 100 - userPossession;
  const userKitPrimary   = userSide === 'HOME' ? homeKitPrimary   : awayKitPrimary;
  const userKitSecondary = userSide === 'HOME' ? homeKitSecondary : awayKitSecondary;
  const oppKitPrimary    = userSide === 'HOME' ? awayKitPrimary   : homeKitPrimary;
  const oppKitSecondary  = userSide === 'HOME' ? awayKitSecondary : homeKitSecondary;
  const userShotsOff = userShots - userShotsOnTarget;
  const oppShotsOff  = oppShots  - oppShotsOnTarget;

  const statsRows = [
    { label: 'POSIADANIE',  uVal: `${userPossession}%`,  oVal: `${oppPossession}%`,   uNum: userPossession,    oNum: oppPossession,    ...statPct(userPossession, oppPossession) },
    { label: 'STRZAŁY',     uVal: `${userShots}`,         oVal: `${oppShots}`,          uNum: userShots,          oNum: oppShots,          ...statPct(userShots, oppShots) },
    { label: 'CELNE',       uVal: `${userShotsOnTarget}`, oVal: `${oppShotsOnTarget}`,  uNum: userShotsOnTarget,  oNum: oppShotsOnTarget,  ...statPct(userShotsOnTarget, oppShotsOnTarget) },
    { label: 'NIECELNE',    uVal: `${userShotsOff}`,      oVal: `${oppShotsOff}`,       uNum: userShotsOff,       oNum: oppShotsOff,       ...statPct(userShotsOff, oppShotsOff) },
    { label: 'ROŻNE',       uVal: `${userCorners}`,       oVal: `${oppCorners}`,        uNum: userCorners,        oNum: oppCorners,        ...statPct(userCorners, oppCorners) },
    { label: 'FAULE',       uVal: `${userFouls}`,         oVal: `${oppFouls}`,          uNum: userFouls,          oNum: oppFouls,          ...statPct(userFouls, oppFouls) },
    { label: 'KARTKI',      uVal: `${userYellowCards}`,   oVal: `${oppYellowCards}`,    uNum: userYellowCards,    oNum: oppYellowCards,    ...statPct(userYellowCards, oppYellowCards) },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-auto animate-fade-in">
      <div className="w-full max-w-[1080px] mx-4 bg-slate-900/70 border border-white/10 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative">

        {/* ── GRADIENT BAR GÓRNY ── */}
        <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${getContextAccent()} to-transparent`} />

        {/* ── TŁO GLOW ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${getContextGlow()} 0%, transparent 60%)` }} />

        {/* ── HEADER ── */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/5 flex flex-col gap-3">

          <div className="flex justify-center">
            <div className={`inline-flex items-center rounded-full px-4 py-1 ${getContextBadge()}`}>
              <span className="text-[9px] font-black italic uppercase tracking-[0.25em] text-white">{leagueMotivationLabel ?? 'PRZERWA'}</span>
            </div>
          </div>

          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none text-center whitespace-nowrap">
            STATYSTYKI <span className={getContextAccentColor()}>I POŁOWY</span>
          </h1>

          <div className="flex items-center gap-3 mt-1 px-4 py-3 rounded-2xl" style={{ background: `linear-gradient(90deg, ${homeKitPrimary}40 0%, rgba(15,23,42,0.2) 50%, ${awayKitPrimary}40 100%)` }}>
            <div className="flex-1 flex items-center gap-3">
              <JerseyIcon primary={leftKitPrimary} secondary={leftKitSecondary} size="w-[52px] h-[52px]" />
              <div className="text-[28px] font-black italic uppercase tracking-tighter text-white leading-tight">{leftClubName}</div>
            </div>
            <div className="flex flex-col items-center px-4 shrink-0">
              <div className="text-[3.2rem] font-black italic text-white tracking-tighter leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                {leftScore}<span className="text-white/20 mx-2">:</span>{rightScore}
              </div>
            </div>
            <div className="flex-1 flex items-center justify-end gap-3">
              <div className="text-[28px] font-black italic uppercase tracking-tighter text-white leading-tight text-right">{rightClubName}</div>
              <JerseyIcon primary={rightKitPrimary} secondary={rightKitSecondary} size="w-[52px] h-[52px]" />
            </div>
          </div>

        </div>

        {/* ── STATYSTYKI I POŁOWY ── */}
        <div className="relative px-8 py-5 border-b border-white/5">
          <div className="flex flex-col gap-3">
            {statsRows.map((row, idx) => {
              const leftBarColor  = idx % 2 === 0 ? homeKitPrimary  : homeKitSecondary;
              const rightBarColor = idx % 2 === 0 ? awayKitPrimary  : awayKitSecondary;
              const leftVal  = userSide === 'HOME' ? row.uVal : row.oVal;
              const rightVal = userSide === 'HOME' ? row.oVal : row.uVal;
              const leftPct  = userSide === 'HOME' ? row.u    : row.o;
              const rightPct = userSide === 'HOME' ? row.o    : row.u;
              return (
                <div key={row.label} className="flex items-center gap-[14px]">
                  <span className="w-[55px] text-right text-[1.44rem] font-black italic leading-none text-white">
                    {leftVal}
                  </span>
                  <div className="flex-1 flex items-center h-[18px] overflow-hidden rounded-l-full bg-white/[0.04]" style={{ direction: 'rtl' }}>
                    <div className="h-full rounded-l-full transition-all" style={{ width: `${leftPct}%`, backgroundColor: leftBarColor }} />
                  </div>
                  <span className="text-[9.5px] font-black text-white/70 uppercase tracking-widest shrink-0 w-[110px] text-center">
                    {row.label}
                  </span>
                  <div className="flex-1 h-[18px] overflow-hidden rounded-r-full bg-white/[0.04]">
                    <div className="h-full rounded-r-full transition-all" style={{ width: `${rightPct}%`, backgroundColor: rightBarColor }} />
                  </div>
                  <span className="w-[55px] text-left text-[1.44rem] font-black italic leading-none text-white">
                    {rightVal}
                  </span>
                </div>
              );
            })}

          </div>
        </div>

        {/* ── FAZA WYBORU ── */}
        {phase === 'SELECTING' && (
          <div className="relative flex flex-col">
            <div className="flex flex-col items-center gap-3 px-8 pt-5 pb-2">
              <span className="text-sm font-black italic uppercase tracking-tighter text-cyan-400">{isFriendly ? 'ROZMOWA W SPARINGU' : 'ROZMOWA MOTYWACYJNA'}</span>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            </div>
            <div className="px-8 pb-5 grid grid-cols-2 gap-3">
              {talks.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt, idx)}
                  className="w-full text-left rounded-2xl border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 bg-white/[0.03] px-5 py-3.5 transition-all duration-150 hover:bg-yellow-500/15 hover:border-t-yellow-400/50 hover:border-x-yellow-400/30 hover:border-b-yellow-900/60 active:translate-y-[2px]"
                  style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  <p className="text-sm font-normal italic uppercase tracking-tighter text-white leading-snug">
                    {opt.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── FAZA REAKCJI ── */}
        {phase === 'REACTING' && (
          <div className="relative flex flex-col items-center px-8 py-8 gap-6">
            <div className="text-center">
              <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500 mb-3">REAKCJA SZATNI</div>
              <p className="text-xl font-black italic uppercase tracking-tighter text-white leading-snug">{reactionText}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/5 w-full">
              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">NASTRÓJ</span>
              <span className={`text-sm font-black italic uppercase tracking-tighter ${getMoodColor()}`}>{getMoodLabel()}</span>
            </div>
            <button
              onClick={handleContinue}
              className={`w-full py-4 rounded-2xl font-black italic uppercase tracking-tighter text-sm text-white transition-all duration-200 border-t border-x border-b active:translate-y-[2px]
                ${context === 'LOSING_HIGH' || context === 'LOSING_ONE'
                  ? 'bg-red-600/80 hover:bg-red-500 border-t-red-400/60 border-x-red-500/30 border-b-black/60'
                  : context === 'WINNING_HIGH' || context === 'WINNING_ONE'
                  ? 'bg-emerald-600/80 hover:bg-emerald-500 border-t-emerald-400/60 border-x-emerald-500/30 border-b-black/60'
                  : 'bg-yellow-600/80 hover:bg-yellow-500 border-t-yellow-400/60 border-x-yellow-500/30 border-b-black/60'
                }`}
              style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
            >
              II POŁOWA
            </button>
          </div>
        )}

      </div>
    </div>
  , document.body);
};
