import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState } from '../../types';
import worldCupBg from '../../Graphic/themes/worldcup.png';

const GLASS = "bg-slate-950/50 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl relative overflow-hidden";
const GLOSS = "absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none";

const REVEAL_DELAY_MS = 380; // ms per team reveal

const NT_FLAG_CODE_MAP: Record<string, string> = {
  Albania: 'AL', Andora: 'AD', Armenia: 'AM', Austria: 'AT', Azerbejdżan: 'AZ',
  Belgia: 'BE', Białoruś: 'BY', 'Bośnia i Hercegowina': 'BA', Bułgaria: 'BG', Chorwacja: 'HR',
  Cypr: 'CY', Czarnogóra: 'ME', Czechy: 'CZ', Dania: 'DK', Estonia: 'EE',
  Finlandia: 'FI', Francja: 'FR', Gibraltar: 'GI', Grecja: 'GR', Gruzja: 'GE',
  Hiszpania: 'ES', Holandia: 'NL', Irlandia: 'IE', Islandia: 'IS', Izrael: 'IL',
  Kazachstan: 'KZ', Kosovo: 'XK', Liechtenstein: 'LI', Litwa: 'LT', Luksemburg: 'LU',
  Łotwa: 'LV', 'Macedonia Północna': 'MK', Malta: 'MT', Mołdawia: 'MD', Niemcy: 'DE',
  Norwegia: 'NO', Polska: 'PL', Portugalia: 'PT', Rumunia: 'RO', 'San Marino': 'SM',
  Serbia: 'RS', Słowacja: 'SK', Słowenia: 'SI', Szkocja: 'GB-SCT', Szwajcaria: 'CH',
  Szwecja: 'SE', Turcja: 'TR', Ukraina: 'UA', Walia: 'GB-WLS', Węgry: 'HU',
  Włochy: 'IT', 'Wyspy Owcze': 'FO', Anglia: 'GB-ENG', 'Irlandia Północna': 'GB-NIR',
};

function getNTFlagCode(name: string): string | null {
  return NT_FLAG_CODE_MAP[name]?.toLowerCase() ?? null;
}

/** Kolejność odsłaniania slotów: [pathIdx, slot] */
const REVEAL_ORDER: Array<[number, 'sf1Home' | 'sf1Away' | 'sf2Home' | 'sf2Away']> = [
  [0, 'sf1Home'], [0, 'sf1Away'],
  [1, 'sf1Home'], [1, 'sf1Away'],
  [2, 'sf1Home'], [2, 'sf1Away'],
  [3, 'sf1Home'], [3, 'sf1Away'],
  [0, 'sf2Home'], [0, 'sf2Away'],
  [1, 'sf2Home'], [1, 'sf2Away'],
  [2, 'sf2Home'], [2, 'sf2Away'],
  [3, 'sf2Home'], [3, 'sf2Away'],
];

export const WCQPlayoffDrawView: React.FC = () => {
  const { wcqPlayoffState, advanceDay, navigateTo } = useGame();
  const [revealCount, setRevealCount] = useState(0);
  const [drawStarted, setDrawStarted] = useState(false);

  const allRevealed = revealCount >= REVEAL_ORDER.length;

  // Opóźniony start + sekwencja odsłaniania
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setDrawStarted(true);
    }, 600);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!drawStarted || allRevealed) return;
    const t = setTimeout(() => {
      setRevealCount(prev => prev + 1);
    }, REVEAL_DELAY_MS);
    return () => clearTimeout(t);
  }, [drawStarted, revealCount, allRevealed]);

  if (!wcqPlayoffState) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        Brak danych losowania.
      </div>
    );
  }

  const { paths } = wcqPlayoffState;

  const isRevealed = (pathIdx: number, slot: 'sf1Home' | 'sf1Away' | 'sf2Home' | 'sf2Away'): boolean => {
    const idx = REVEAL_ORDER.findIndex(([pi, s]) => pi === pathIdx && s === slot);
    return idx < revealCount;
  };

  const PATH_LABELS: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const PATH_COLORS: Record<string, string> = {
    A: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    B: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
    C: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    D: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  };

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
            filter: 'brightness(0.25)'
          }}
        />
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-5 gap-4 overflow-auto max-w-[1540px] mx-auto w-full">

        {/* HEADER */}
        <div className={GLASS + " p-5 flex items-center justify-between shrink-0"}>
          <div className={GLOSS} />
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shrink-0">
              🌐
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.5em]">
                UEFA · Kwalifikacje Mistrzostw Świata 2026
              </p>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mt-0.5">
                Baraże MŚ 2026 — Losowanie
              </h1>
              <p className="text-slate-500 text-[10px] mt-1">
                29 listopada 2025 · 16 drużyn · 4 ścieżki · mecze w marcu 2026
              </p>
            </div>
          </div>

          {allRevealed && (
            <button
              onClick={() => { advanceDay(); navigateTo(ViewState.DASHBOARD); }}
              className="px-8 py-4 bg-white hover:bg-white/90 text-slate-900 font-black italic uppercase tracking-widest rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 text-sm shrink-0"
            >
              KONTYNUUJ →
            </button>
          )}
        </div>

        {/* ŚCIEŻKI A-D */}
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          {PATH_LABELS.map((label, pathIdx) => {
            const path = paths.find(p => p.pathLabel === label);
            if (!path) return null;
            const colorClass = PATH_COLORS[label];

            return (
              <div key={label} className={GLASS + " p-5 flex flex-col gap-3"}>
                <div className={GLOSS} />

                {/* Nagłówek ścieżki */}
                <div className="flex items-center justify-center pb-2 border-b border-white/[0.07]">
                  <div className={`h-10 px-5 rounded-xl border flex items-center justify-center text-sm font-black italic uppercase tracking-tighter ${colorClass}`}>
                    ŚCIEŻKA {label}
                  </div>
                </div>

                {/* Półfinał 1 */}
                <div className="bg-white/[0.03] rounded-2xl px-5 py-4 flex flex-col gap-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Półfinał 1</p>
                  <MatchupRow
                    home={path.sf1Home}
                    away={path.sf1Away}
                    homeRevealed={isRevealed(pathIdx, 'sf1Home')}
                    awayRevealed={isRevealed(pathIdx, 'sf1Away')}
                  />
                </div>

                {/* Półfinał 2 */}
                <div className="bg-white/[0.03] rounded-2xl px-5 py-4 flex flex-col gap-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Półfinał 2</p>
                  <MatchupRow
                    home={path.sf2Home}
                    away={path.sf2Away}
                    homeRevealed={isRevealed(pathIdx, 'sf2Home')}
                    awayRevealed={isRevealed(pathIdx, 'sf2Away')}
                  />
                </div>

                {/* Finał */}
                <div className="mt-auto pt-2 border-t border-white/[0.06] flex items-center justify-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300">
                    → Finał ścieżki · 20 marca 2026 ←
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* LEGENDA */}
        <div className={GLASS + " p-3 flex items-center justify-center gap-6 shrink-0"}>
          <div className={GLOSS} />
          <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.35em]">
            🏆 Losowanie UEFA · Pot 1 (wyższy ranking) = gospodarz półfinału
          </span>
          <span className="text-slate-600 text-[9px]">•</span>
          <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.35em]">
            Zwycięzcy 4 finałów awansują na Mistrzostwa Świata 2026
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── HELPER COMPONENT ──────────────────────────────────────────────────────────

interface MatchupRowProps {
  home: string;
  away: string;
  homeRevealed: boolean;
  awayRevealed: boolean;
}

const MatchupRow: React.FC<MatchupRowProps> = ({ home, away, homeRevealed, awayRevealed }) => (
  <div className="flex items-center gap-2">
    <TeamSlot name={home} revealed={homeRevealed} align="right" />
    <span className="text-slate-600 text-xs font-black shrink-0">vs</span>
    <TeamSlot name={away} revealed={awayRevealed} align="left" />
  </div>
);

interface TeamSlotProps {
  name: string;
  revealed: boolean;
  align: 'left' | 'right';
}

const TeamSlot: React.FC<TeamSlotProps> = ({ name, revealed, align }) => {
  const flagCode = getNTFlagCode(name);
  const flag = flagCode ? (
    <img
      src={`https://flagcdn.com/w40/${flagCode}.png`}
      alt={name}
      className="h-5 w-7 object-cover rounded-sm border border-white/10 shrink-0"
    />
  ) : (
    <div className="h-5 w-7 rounded-sm border border-white/10 bg-white/10 flex items-center justify-center text-[8px] font-black text-slate-300 shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );

  return (
    <div
      className={`
        flex-1 min-h-[44px] px-2 py-2 rounded-xl border text-2xl font-black italic uppercase tracking-tighter
        transition-all duration-500 flex items-center gap-3 min-w-0
        ${align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}
        ${revealed
          ? 'bg-transparent border-transparent text-white opacity-100 translate-y-0'
          : 'bg-transparent border-transparent text-transparent opacity-40 translate-y-1'
        }
      `}
    >
      {revealed ? (
        align === 'right' ? (
          <>
            <span className="truncate">{name}</span>
            {flag}
          </>
        ) : (
          <>
            {flag}
            <span className="truncate">{name}</span>
          </>
        )
      ) : (
        <span className="w-full text-center">— — —</span>
      )}
    </div>
  );
};
