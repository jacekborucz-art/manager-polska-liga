import { useState } from 'react';
import {
  BriefingScenario,
  BriefingEffect,
  detectScenario,
  calculateBriefingEffect,
  getBriefingsForScenario,
  getSilenceEffect,
} from '../../services/PreMatchBriefingService';

interface PreMatchBriefingModalProps {
  isOpen: boolean;
  onClose: (effect: BriefingEffect) => void;
  userClubName: string;
  oppClubName: string;
  userRep: number;
  oppRep: number;
  sessionSeed: number;
}

type Phase = 'SELECTING' | 'REACTING';

export const PreMatchBriefingModal = ({
  isOpen,
  onClose,
  userClubName,
  oppClubName,
  userRep,
  oppRep,
  sessionSeed,
}: PreMatchBriefingModalProps) => {
  const [phase, setPhase] = useState<Phase>('SELECTING');
  const [reactionText, setReactionText] = useState('');
  const [pendingEffect, setPendingEffect] = useState<BriefingEffect | null>(null);

  if (!isOpen) return null;

  const scenario: BriefingScenario = detectScenario(userRep, oppRep);
  const availableBriefings = getBriefingsForScenario(scenario);

  const handleSelect = (index: number) => {
    const speech = availableBriefings[index];
    if (!speech) return;

    const effect = calculateBriefingEffect(
      speech.hiddenType,
      scenario,
      sessionSeed,
      speech.originalIndex
    );
    setReactionText(effect.reactionText);
    setPendingEffect(effect);
    setPhase('REACTING');
  };

  const handleSilence = () => {
    const effect = getSilenceEffect();
    setReactionText(effect.reactionText);
    setPendingEffect(effect);
    setPhase('REACTING');
  };

  const handleConfirm = () => {
    if (pendingEffect) onClose(pendingEffect);
  };

  const getScenarioAccentColor = (): string => {
    if (scenario === 'UNDERDOG')  return 'text-red-400';
    if (scenario === 'FAVORITE')  return 'text-emerald-400';
    return 'text-yellow-400';
  };

  const getScenarioGradient = (): string => {
    if (scenario === 'UNDERDOG')  return 'via-red-500';
    if (scenario === 'FAVORITE')  return 'via-emerald-500';
    return 'via-yellow-500';
  };

  const getScenarioGlow = (): string => {
    if (scenario === 'UNDERDOG')  return 'rgba(239,68,68,0.07)';
    if (scenario === 'FAVORITE')  return 'rgba(52,211,153,0.07)';
    return 'rgba(234,179,8,0.07)';
  };

  const getScenarioBadge = (): string => {
    if (scenario === 'UNDERDOG')  return 'border-red-500/40 bg-red-500/10 text-red-400';
    if (scenario === 'FAVORITE')  return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
    return 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400';
  };

  const getScenarioLabel = (): string => {
    if (scenario === 'UNDERDOG')  return 'JESTEŚ OUTSIDEREM';
    if (scenario === 'FAVORITE')  return 'JESTEŚ FAWORYTEM';
    return 'RÓWNORZĘDNA WALKA';
  };

  const getRepLabel = (rep: number): string => {
    if (rep >= 9)  return 'EKSTRAKLASA';
    if (rep >= 7)  return 'I LIGA';
    if (rep >= 5)  return 'II LIGA';
    if (rep >= 3)  return 'III LIGA';
    return 'IV LIGA';
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85">
      <div className="w-full max-w-[1080px] mx-4 bg-slate-900/70 border border-white/10 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative">

        {/* GRADIENT BAR */}
        <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${getScenarioGradient()} to-transparent`} />

        {/* TŁO GLOW */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${getScenarioGlow()} 0%, transparent 60%)` }} />

        {/* HEADER */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">PUCHAR POLSKI</span>
            <span className={`text-[8px] font-black italic uppercase tracking-tighter border px-3 py-1 rounded-full ${getScenarioBadge()}`}>
              {getScenarioLabel()}
            </span>
          </div>

          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
            ODPRAWA<br />
            <span className={getScenarioAccentColor()}>PRZEDMECZOWA</span>
          </h1>

          {/* MECZ */}
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1">
              <div className="text-[7px] font-black italic uppercase tracking-tighter text-slate-500">{getRepLabel(userRep)}</div>
              <div className="text-base font-black italic uppercase tracking-tighter text-white leading-tight">{userClubName}</div>
            </div>
            <div className="text-xl font-black italic uppercase tracking-tighter text-white/20">VS</div>
            <div className="flex-1 text-right">
              <div className="text-[7px] font-black italic uppercase tracking-tighter text-slate-500">{getRepLabel(oppRep)}</div>
              <div className="text-base font-black italic uppercase tracking-tighter text-white leading-tight">{oppClubName}</div>
            </div>
          </div>
        </div>

        {/* FAZA WYBORU */}
        {phase === 'SELECTING' && (
          <div className="relative flex flex-col">
            <div className="px-8 pt-5 pb-2">
              <span className="text-[14px] font-black italic uppercase tracking-tighter text-slate-400">
                PRZEMOWA DO DRUŻYNY
              </span>
            </div>

            <div className="overflow-y-auto custom-scrollbar max-h-[420px] px-8 pb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {availableBriefings.map((speech, index) => (
                <button
                  key={speech.id}
                  onClick={() => handleSelect(index)}
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-3.5 text-left transition-all duration-150 group hover:bg-yellow-500/15 hover:border-yellow-400/70"
                >
                  <p className="text-sm font-normal italic uppercase tracking-tighter text-white group-hover:text-white leading-snug">
                    {speech.text}
                  </p>
                </button>
              ))}
            </div>

            {/* MILCZENIE */}
            <div className="px-8 pb-7 pt-2 border-t border-white/5 mt-1">
              <button
                onClick={handleSilence}
                className="mx-auto block w-full max-w-[420px] py-3 rounded-2xl border border-white/8 bg-transparent hover:bg-white/[0.04] transition-all duration-150"
              >
                <span className="text-xs font-normal italic uppercase tracking-tighter text-slate-500 hover:text-slate-300">
                  BEZ KOMENTARZA
                </span>
              </button>
            </div>
          </div>
        )}

        {/* FAZA REAKCJI */}
        {phase === 'REACTING' && pendingEffect && (
          <div className="relative flex flex-col px-8 py-8 gap-6">
            <div>
              <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500 mb-3">
                REAKCJA SZATNI
              </div>
              <p className="text-xl font-black italic uppercase tracking-tighter text-white leading-snug">
                {reactionText}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">NASTAWIENIE</span>
              <span className={`text-sm font-black italic uppercase tracking-tighter ${getScenarioAccentColor()}`}>
                {pendingEffect.label}
              </span>
            </div>

            <button
              onClick={handleConfirm}
              className={`w-full py-4 rounded-2xl font-black italic uppercase tracking-tighter text-sm text-white transition-all duration-200
                ${scenario === 'UNDERDOG'
                  ? 'bg-red-600/80 hover:bg-red-500 border border-red-500/40'
                  : scenario === 'FAVORITE'
                  ? 'bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-500/40'
                  : 'bg-yellow-600/80 hover:bg-yellow-500 border border-yellow-500/40'
                }`}
            >
              NA BOISKO
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
