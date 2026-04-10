import React from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, WCQPlayoffPath, WCQPlayoffMatchResult } from '../../types';
import worldCupBg from '../../Graphic/themes/worldcup.png';

const GLASS = "bg-slate-950/50 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl relative overflow-hidden";
const GLOSS = "absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none";

const PATH_COLORS: Record<string, { label: string; badge: string; winner: string }> = {
  A: { label: 'text-amber-400',  badge: 'border-amber-400/30 bg-amber-400/10 text-amber-400',   winner: 'bg-amber-400/15 border-amber-400/40 text-amber-200' },
  B: { label: 'text-sky-400',    badge: 'border-sky-400/30 bg-sky-400/10 text-sky-400',         winner: 'bg-sky-400/15 border-sky-400/40 text-sky-200' },
  C: { label: 'text-emerald-400',badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400', winner: 'bg-emerald-400/15 border-emerald-400/40 text-emerald-200' },
  D: { label: 'text-rose-400',   badge: 'border-rose-400/30 bg-rose-400/10 text-rose-400',      winner: 'bg-rose-400/15 border-rose-400/40 text-rose-200' },
};

interface Props {
  mode: 'SF' | 'FINAL';
}

export const WCQPlayoffResultsView: React.FC<Props> = ({ mode }) => {
  const { wcqPlayoffState, advanceDay, navigateTo } = useGame();

  if (!wcqPlayoffState) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        Brak danych baraży.
      </div>
    );
  }

  const { paths } = wcqPlayoffState;
  const isFinal = mode === 'FINAL';

  const title = isFinal
    ? 'Baraże MŚ 2026 — Finały'
    : 'Baraże MŚ 2026 — Półfinały';

  const subtitle = isFinal
    ? '20 marca 2026 · Wyłoniono 4 kwalifikantów na Mistrzostwa Świata'
    : '17 marca 2026 · Wyłoniono finalistów 4 ścieżek';

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative">

      {/* TŁO */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${worldCupBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.22)'
          }}
        />
        <div className="absolute inset-0 bg-slate-950/72" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-5 gap-4 overflow-auto">

        {/* HEADER */}
        <div className={GLASS + " p-5 flex items-center justify-between shrink-0"}>
          <div className={GLOSS} />
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shrink-0">
              {isFinal ? '🎟️' : '⚽'}
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.5em]">
                UEFA · Kwalifikacje Mistrzostw Świata 2026
              </p>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mt-0.5">
                {title}
              </h1>
              <p className="text-slate-500 text-[10px] mt-1">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => { advanceDay(); navigateTo(ViewState.DASHBOARD); }}
            className="px-8 py-4 bg-white hover:bg-white/90 text-slate-900 font-black italic uppercase tracking-widest rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 text-sm shrink-0"
          >
            KONTYNUUJ →
          </button>
        </div>

        {/* ŚCIEŻKI */}
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          {(['A', 'B', 'C', 'D'] as const).map(label => {
            const path = paths.find(p => p.pathLabel === label);
            if (!path) return null;
            const colors = PATH_COLORS[label];

            return (
              <div key={label} className={GLASS + " p-5 flex flex-col gap-3"}>
                <div className={GLOSS} />

                {/* Nagłówek */}
                <div className="flex items-center gap-3 pb-2 border-b border-white/[0.07]">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-lg ${colors.badge}`}>
                    {label}
                  </div>
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
                    Ścieżka {label}
                  </span>
                </div>

                {/* Wyniki SF */}
                {!isFinal && <SFResults path={path} colors={colors} />}

                {/* Kompletne wyniki (finał) */}
                {isFinal && <FullPathResults path={path} colors={colors} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── SF RESULTS ───────────────────────────────────────────────────────────────

const SFResults: React.FC<{ path: WCQPlayoffPath; colors: typeof PATH_COLORS['A'] }> = ({ path, colors }) => (
  <>
    <MatchResult
      label="Półfinał 1"
      result={path.sf1Result}
      winner={path.sf1Winner}
      colors={colors}
    />
    <MatchResult
      label="Półfinał 2"
      result={path.sf2Result}
      winner={path.sf2Winner}
      colors={colors}
    />
    {path.finalHome && path.finalAway && (
      <div className="mt-auto pt-2 border-t border-white/[0.06]">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 text-center">
          Finał ścieżki · 20 marca 2026
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-right text-xs font-black uppercase text-white tracking-wide">
            {path.finalHome}
          </div>
          <span className="text-slate-600 text-xs font-black shrink-0">vs</span>
          <div className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-left text-xs font-black uppercase text-white tracking-wide">
            {path.finalAway}
          </div>
        </div>
      </div>
    )}
  </>
);

// ─── FULL PATH RESULTS (SF + FINAL) ───────────────────────────────────────────

const FullPathResults: React.FC<{ path: WCQPlayoffPath; colors: typeof PATH_COLORS['A'] }> = ({ path, colors }) => (
  <>
    <MatchResult
      label="Półfinał 1"
      result={path.sf1Result}
      winner={path.sf1Winner}
      colors={colors}
      compact
    />
    <MatchResult
      label="Półfinał 2"
      result={path.sf2Result}
      winner={path.sf2Winner}
      colors={colors}
      compact
    />
    {path.finalResult && (
      <MatchResult
        label="Finał ścieżki"
        result={path.finalResult}
        winner={path.qualifier}
        colors={colors}
        isFinal
      />
    )}
    {path.qualifier && (
      <div className={`mt-auto px-4 py-3 rounded-2xl border text-center ${colors.winner}`}>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-70 mb-1">
          🎟️ Awans na MŚ 2026
        </p>
        <p className="text-base font-black uppercase tracking-wide">
          {path.qualifier}
        </p>
      </div>
    )}
  </>
);

// ─── MATCH RESULT ROW ─────────────────────────────────────────────────────────

interface MatchResultProps {
  label: string;
  result?: WCQPlayoffMatchResult;
  winner?: string;
  colors: typeof PATH_COLORS['A'];
  compact?: boolean;
  isFinal?: boolean;
}

const MatchResult: React.FC<MatchResultProps> = ({ label, result, winner, colors, compact, isFinal }) => {
  if (!result) return null;

  const homeWon = result.homeGoals > result.awayGoals;
  const awayWon = result.awayGoals > result.homeGoals;

  return (
    <div className={`bg-white/[0.03] rounded-2xl px-4 ${compact ? 'py-2.5' : 'py-3'} flex flex-col gap-1.5`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isFinal ? colors.label : 'text-slate-500'}`}>
        {label}
      </p>
      <div className="flex items-center gap-2">
        {/* Gospodarz */}
        <div className={`flex-1 flex items-center justify-end gap-2 min-w-0`}>
          {winner === result.homeTeam && (
            <span className={`text-[8px] font-black uppercase tracking-wider shrink-0 ${colors.label}`}>✓</span>
          )}
          <span className={`text-xs font-black uppercase tracking-wide truncate ${homeWon ? 'text-white' : 'text-slate-400'}`}>
            {result.homeTeam}
          </span>
        </div>

        {/* Wynik */}
        <div className={`shrink-0 px-2.5 py-1 rounded-lg font-black text-sm tabular-nums ${
          homeWon || awayWon ? 'bg-white/[0.08] text-white' : 'bg-white/[0.05] text-slate-400'
        }`}>
          {result.homeGoals} : {result.awayGoals}
        </div>

        {/* Gość */}
        <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
          <span className={`text-xs font-black uppercase tracking-wide truncate ${awayWon ? 'text-white' : 'text-slate-400'}`}>
            {result.awayTeam}
          </span>
          {winner === result.awayTeam && (
            <span className={`text-[8px] font-black uppercase tracking-wider shrink-0 ${colors.label}`}>✓</span>
          )}
        </div>
      </div>
    </div>
  );
};
