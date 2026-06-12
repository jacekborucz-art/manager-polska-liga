import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState } from '../../types';

/* ============================================================
   CoachCard 2.0 — "Tablica Taktyczna"
   Cała karta stylizowana na trenerską tablicę taktyczną:
   kredowe boisko w tle, animowany radar atrybutów,
   interaktywne mini-boiska taktyk, liczniki i animacje wejścia.
   Wszystkie zmienne / pola danych pozostały bez zmian.
   ============================================================ */

const FORMATION_MAP: Record<string, number[]> = {
  '4-3-3 Atak':          [4, 3, 3],
  '3-4-3':               [3, 4, 3],
  'Wysoki Pressing':     [4, 3, 3],
  'Total Football':      [4, 3, 3],
  '4-1-2-1-2':           [4, 1, 2, 1, 2],
  '4-4-2':               [4, 4, 2],
  '4-3-3 Zrównoważona':  [4, 3, 3],
  '3-5-2':               [3, 5, 2],
  '4-5-1':               [4, 5, 1],
  '4-2-3-1':             [4, 2, 3, 1],
  '5-3-2':               [5, 3, 2],
  '5-4-1':               [5, 4, 1],
  '5-3-2 Blok':          [5, 3, 2],
  '4-4-2 Kontratak':     [4, 4, 2],
  'Niski Blok':          [5, 4, 1],
  '4-5-1 Defensywna':    [4, 5, 1],
  '3-6-1':               [3, 6, 1],
};

/* ---------- pomocnicze ---------- */

const attrColor = (v: number) =>
  v >= 80 ? '#34d399' : v >= 60 ? '#60a5fa' : v >= 40 ? '#facc15' : '#fb7185';

/** Animowany licznik (count-up) */
const CountUp: React.FC<{ value: number; duration?: number; format?: (n: number) => string }> = ({
  value,
  duration = 1100,
  format = (n) => Math.round(n).toString(),
}) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{format(n)}</>;
};

/* ---------- SVG: kredowe boisko w tle karty ---------- */

const ChalkboardBackdrop: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 700" aria-hidden>
    <defs>
      <radialGradient id="cc-board" cx="50%" cy="35%" r="90%">
        <stop offset="0%" stopColor="#10362a" />
        <stop offset="60%" stopColor="#0b2820" />
        <stop offset="100%" stopColor="#06160f" />
      </radialGradient>
      <filter id="cc-chalk" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
      </filter>
    </defs>
    <rect width="1000" height="700" fill="url(#cc-board)" />
    {/* kredowe linie boiska */}
    <g stroke="#e8f5e9" strokeOpacity="0.07" strokeWidth="3" fill="none" filter="url(#cc-chalk)">
      <rect x="60" y="40" width="880" height="620" rx="4" />
      <line x1="60" y1="350" x2="940" y2="350" />
      <circle cx="500" cy="350" r="95" />
      <rect x="330" y="40" width="340" height="120" />
      <rect x="330" y="540" width="340" height="120" />
      <rect x="410" y="40" width="180" height="50" />
      <rect x="410" y="610" width="180" height="50" />
    </g>
    {/* kredowe notatki trenera: strzałki i znaki */}
    <g stroke="#e8f5e9" strokeOpacity="0.05" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#cc-chalk)">
      <path d="M150 560 C 240 480, 300 470, 380 410" />
      <path d="M380 410 l -18 2 m 18 -2 l -6 17" />
      <path d="M820 180 C 740 240, 700 260, 640 330" />
      <path d="M640 330 l 17 -4 m -17 4 l 4 -17" />
      <path d="M200 160 l 26 26 m 0 -26 l -26 26" />
      <path d="M790 520 l 26 26 m 0 -26 l -26 26" />
      <circle cx="265" cy="300" r="14" />
      <circle cx="730" cy="430" r="14" />
    </g>
  </svg>
);

/* ---------- SVG: radar 4 atrybutów ---------- */

const AttributeRadar: React.FC<{
  values: { label: string; value: number }[];
  hovered: number | null;
}> = ({ values, hovered }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 250);
    return () => clearTimeout(t);
  }, []);

  const C = 100, R = 78;
  // 4 osie: góra, prawo, dół, lewo
  const angle = (i: number) => -Math.PI / 2 + (i * Math.PI) / 2;
  const pt = (i: number, r: number) => `${C + Math.cos(angle(i)) * r},${C + Math.sin(angle(i)) * r}`;
  const poly = values.map((v, i) => pt(i, (v.value / 100) * R)).join(' ');
  const grid = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="cc-radar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {grid.map((g) => (
        <polygon
          key={g}
          points={values.map((_, i) => pt(i, R * g)).join(' ')}
          fill="none"
          stroke="#e8f5e9"
          strokeOpacity={0.1}
          strokeWidth="1"
        />
      ))}
      {values.map((_, i) => (
        <line key={i} x1={C} y1={C} x2={pt(i, R).split(',')[0]} y2={pt(i, R).split(',')[1]} stroke="#e8f5e9" strokeOpacity="0.08" />
      ))}
      <g style={{ transformOrigin: '100px 100px', transform: mounted ? 'scale(1)' : 'scale(0)', transition: 'transform 900ms cubic-bezier(.2,1.4,.4,1)' }}>
        <polygon points={poly} fill="url(#cc-radar)" fillOpacity="0.25" stroke="url(#cc-radar)" strokeWidth="2.5" strokeLinejoin="round" />
        {values.map((v, i) => {
          const [x, y] = pt(i, (v.value / 100) * R).split(',').map(Number);
          const active = hovered === i;
          return (
            <circle
              key={v.label}
              cx={x} cy={y}
              r={active ? 7 : 4.5}
              fill={attrColor(v.value)}
              stroke="#06160f"
              strokeWidth="2"
              style={{ transition: 'r 200ms ease' }}
            />
          );
        })}
      </g>
    </svg>
  );
};

/* ---------- SVG: mini-boisko taktyki ---------- */

const TacticPitch: React.FC<{ tactic: string; accent: string; delay: number }> = ({ tactic, accent, delay }) => {
  const rows = FORMATION_MAP[tactic] || [4, 4, 2];
  const W = 120, H = 160;
  const gkY = 142;
  const topY = 22;
  const rowCount = rows.length;
  const rowStep = rowCount > 1 ? (gkY - 26 - topY) / (rowCount - 1) : 0;

  // pozycje zawodników (do narysowania linii podań na hover)
  const players: { x: number; y: number }[] = [{ x: W / 2, y: gkY }];
  rows.forEach((count, rowIndex) => {
    const y = gkY - 26 - rowIndex * rowStep;
    for (let i = 0; i < count; i++) players.push({ x: (W / (count + 1)) * (i + 1), y });
  });
  const path = players.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
      <defs>
        <linearGradient id={`cc-grass-${accent.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#155e3b" />
          <stop offset="100%" stopColor="#0c3a24" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} rx="10" fill={`url(#cc-grass-${accent.replace('#', '')})`} />
      {/* pasy trawy */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="0" y={i * (H / 4)} width={W} height={H / 8} fill="#ffffff" opacity="0.025" />
      ))}
      {/* linie boiska */}
      <g stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.2" fill="none">
        <rect x="6" y="6" width={W - 12} height={H - 12} rx="6" />
        <line x1="6" y1={H / 2} x2={W - 6} y2={H / 2} />
        <circle cx={W / 2} cy={H / 2} r="13" />
        <rect x={W / 2 - 26} y={H - 26} width="52" height="20" />
        <rect x={W / 2 - 26} y="6" width="52" height="20" />
      </g>
      {/* linia podań — rysuje się po najechaniu (sterowane klasą grupy) */}
      <path d={path} fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="500" strokeDashoffset="500" className="cc-passline" />
      {/* bramkarz */}
      <circle cx={W / 2} cy={gkY} r="5" fill="#facc15" stroke="#06160f" strokeWidth="1.5" className="cc-player" style={{ animationDelay: `${delay}ms` }} />
      {/* zawodnicy */}
      {rows.flatMap((count, rowIndex) => {
        const y = gkY - 26 - rowIndex * rowStep;
        const r = count >= 6 ? 4 : 5;
        return Array.from({ length: count }, (_, i) => (
          <circle
            key={`${rowIndex}-${i}`}
            cx={(W / (count + 1)) * (i + 1)}
            cy={y}
            r={r}
            fill={accent}
            stroke="#06160f"
            strokeWidth="1.5"
            className="cc-player"
            style={{ animationDelay: `${delay + 80 + rowIndex * 120 + i * 50}ms` }}
          />
        ));
      })}
    </svg>
  );
};

/* ---------- pasek atrybutu ---------- */

const StatBar: React.FC<{
  label: string;
  value: number;
  index: number;
  onHover: (i: number | null) => void;
}> = ({ label, value, index, onHover }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300 + index * 120);
    return () => clearTimeout(t);
  }, [index]);
  const color = attrColor(value);
  return (
    <div
      className="mb-4 cursor-default group/stat"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex justify-between mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/stat:text-white transition-colors">
        <span>{label}</span>
        <span style={{ color }} className="tabular-nums">
          <CountUp value={value} />
        </span>
      </div>
      <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: mounted ? `${value}%` : '0%',
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 10px ${color}55`,
            transition: 'width 1100ms cubic-bezier(.25,1,.3,1)',
          }}
        >
          <div className="cc-shine absolute inset-0" />
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */

const CoachCardContent: React.FC<{
  coach: any;
  currentClub: any;
  currentNT: any;
  onClose: () => void;
}> = ({ coach, currentClub, currentNT, onClose }) => {
  const [hoveredAttr, setHoveredAttr] = useState<number | null>(null);

  const clubLogoUrl = currentClub?.logoFile
    ? new URL(`../../Graphic/logo/${currentClub.logoFile}`, import.meta.url).href
    : null;

  const contractEnd = coach.contractEndDate ? new Date(coach.contractEndDate) : null;
  const contractEndLabel = contractEnd && !Number.isNaN(contractEnd.getTime())
    ? contractEnd.toLocaleDateString('pl-PL')
    : 'Brak danych';
  const annualSalary = typeof coach.annualSalary === 'number' && coach.annualSalary > 0 ? coach.annualSalary : null;
  const expPoints = typeof coach.expPoints === 'number' ? coach.expPoints : 1;

  const attributes = [
    { label: 'Doświadczenie', value: coach.attributes.experience },
    { label: 'Motywacja',     value: coach.attributes.motivation },
    { label: 'Decyzyjność',   value: coach.attributes.decisionMaking },
    { label: 'Trening',       value: coach.attributes.training },
  ];

  const tactics = [
    { label: 'Ofensywna',  tactic: coach.favoriteTactics.offensive,  color: 'text-orange-400', accent: '#f97316' },
    { label: 'Neutralna',  tactic: coach.favoriteTactics.neutral,    color: 'text-blue-400',   accent: '#60a5fa' },
    { label: 'Defensywna', tactic: coach.favoriteTactics.defensive,  color: 'text-teal-400',   accent: '#2dd4bf' },
  ];

  const cupLabel: Record<string, string> = {
    'WINNER':  '🏆 Zdobywca',
    'FINAL':   'Finalista',
    'SEMI':    '1/2 finału',
    'QUARTER': '1/4 finału',
    'R8':      '1/8 finału',
    'R16':     '1/16',
    'R32':     '1/32',
    'R64':     '1/64',
    'NONE':    '—',
  };
  const leagueLabel: Record<string, string> = {
    'L_PL_1': 'Ekstraklasa',
    'L_PL_2': '1. Liga',
    'L_PL_3': '2. Liga',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 font-black italic uppercase tracking-tighter">
      {/* lokalne style animacji */}
      <style>{`
        @keyframes cc-pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes cc-rise { from { transform: translateY(18px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes cc-card-in { from { transform: scale(.94) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes cc-spin { to { transform: rotate(360deg); } }
        @keyframes cc-shine-sweep { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(220%) skewX(-20deg); } }
        .cc-player { transform-origin: center; transform-box: fill-box; animation: cc-pop 480ms cubic-bezier(.2,1.6,.4,1) both; }
        .cc-rise { animation: cc-rise 600ms cubic-bezier(.2,.9,.3,1) both; }
        .cc-card-in { animation: cc-card-in 520ms cubic-bezier(.2,.9,.3,1) both; }
        .cc-ring { animation: cc-spin 24s linear infinite; transform-origin: center; }
        .cc-shine { background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%); transform: translateX(-120%) skewX(-20deg); }
        .group\\/stat:hover .cc-shine, .cc-logo-card:hover .cc-shine { animation: cc-shine-sweep 900ms ease; }
        .cc-tactic:hover .cc-passline { transition: stroke-dashoffset 1100ms ease; stroke-dashoffset: 0 !important; }
        .cc-tactic .cc-passline { transition: stroke-dashoffset 300ms ease; }
        .cc-row { transition: background 200ms ease, transform 200ms ease; }
        .cc-row:hover { background: rgba(255,255,255,.06) !important; transform: translateX(3px); }
        @media (prefers-reduced-motion: reduce) {
          .cc-player, .cc-rise, .cc-card-in, .cc-ring { animation: none !important; }
          .cc-passline { stroke-dashoffset: 0 !important; }
        }
      `}</style>

      {/* tło: tablica taktyczna */}
      <div className="absolute inset-0 bg-black/85" />

      <div className="cc-card-in max-w-4xl w-full rounded-[40px] border border-emerald-400/15 shadow-[0_0_80px_rgba(16,185,129,0.15)] flex overflow-hidden h-[700px] relative z-10">
        <ChalkboardBackdrop />

        {/* ===== LEWA KOLUMNA — PROFIL ===== */}
        <div className="w-1/3 relative z-10 bg-black/35 backdrop-blur-sm p-8 flex flex-col items-center border-r border-white/10">

          {/* avatar z animowanym pierścieniem */}
          <div className="cc-rise relative w-36 h-36 flex items-center justify-center" style={{ animationDelay: '80ms' }}>
            <svg viewBox="0 0 144 144" className="absolute inset-0 cc-ring" aria-hidden>
              <circle cx="72" cy="72" r="66" fill="none" stroke="#34d399" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="10 14" strokeLinecap="round" />
            </svg>
            <svg viewBox="0 0 144 144" className="absolute inset-0" aria-hidden>
              <circle cx="72" cy="72" r="58" fill="none" stroke="#facc15" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" />
            </svg>
            <div className="w-28 h-28 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-white/10 flex items-center justify-center text-5xl shadow-inner">
              👨‍💼
            </div>
          </div>

          <h2 className="cc-rise text-2xl text-white text-center mt-5 leading-tight" style={{ animationDelay: '160ms' }}>
            {coach.firstName}<br />{coach.lastName}
          </h2>
          <span className="cc-rise text-emerald-400 mt-2 text-xs tracking-[0.25em]" style={{ animationDelay: '220ms' }}>
            {coach.nationalityFlag} • {coach.age} lat
          </span>

          {/* klub */}
          <div className="cc-rise cc-logo-card mt-8 w-full p-5 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center gap-3 relative overflow-hidden hover:border-emerald-400/40 hover:bg-white/[0.08] transition-all duration-300"
            style={{ animationDelay: '300ms' }}>
            <div className="cc-shine absolute inset-0 pointer-events-none" />
            <span className="block text-[8px] text-emerald-400/70 tracking-[0.35em] self-start">Obecny Klub</span>
            {clubLogoUrl
              ? <img src={clubLogoUrl} alt="" className="w-16 h-16 object-contain drop-shadow-[0_0_14px_rgba(255,255,255,0.25)]" />
              : <div className="w-16 h-16 flex items-center justify-center text-3xl">🏟️</div>
            }
            <span className="text-sm text-white text-center">{currentClub?.name || currentNT?.name || 'Bezrobotny'}</span>
          </div>

          {/* kontrakt / pensja / exp */}
          <div className="cc-rise mt-4 w-full p-5 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-3" style={{ animationDelay: '380ms' }}>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" />
              </svg>
              <div>
                <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Kontrakt do</span>
                <span className="text-sm text-white tabular-nums">{contractEndLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="9" /><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.1 0-2-.4-2.5-1.2M12 6.5v11" />
              </svg>
              <div>
                <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Pensja roczna</span>
                <span className="text-sm text-emerald-400 tabular-nums">
                  {annualSalary !== null
                    ? <><CountUp value={annualSalary} duration={1400} format={(n) => Math.round(n).toLocaleString('pl-PL')} /> PLN / rok</>
                    : 'Brak danych'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#facc15" aria-hidden>
                <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
              </svg>
              <div>
                <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Punkty EXP</span>
                <span className="text-sm text-yellow-400 tabular-nums">
                  <CountUp value={expPoints} format={(n) => n.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} />
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="cc-rise mt-auto w-full py-4 bg-white text-black text-xs hover:scale-[1.04] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] active:scale-[0.98] transition-all rounded-2xl tracking-[0.25em]"
            style={{ animationDelay: '460ms' }}
          >
            Zamknij
          </button>
        </div>

        {/* ===== PRAWA KOLUMNA — STATYSTYKI ===== */}
        <div className="flex-1 relative z-10 p-9 overflow-y-auto custom-scrollbar bg-black/20 backdrop-blur-[2px]">

          {/* atrybuty + radar */}
          <div className="cc-rise" style={{ animationDelay: '200ms' }}>
            <h3 className="text-xs text-yellow-500 tracking-[0.4em] mb-6 flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <polyline points="3 17 9 11 13 15 21 7" /><polyline points="15 7 21 7 21 13" />
              </svg>
              Atrybuty Trenerskie
            </h3>
            <div className="flex gap-8 items-center">
              <div className="w-44 h-44 shrink-0">
                <AttributeRadar values={attributes} hovered={hoveredAttr} />
              </div>
              <div className="flex-1 grid grid-cols-1 gap-x-10">
                {attributes.map((a, i) => (
                  <StatBar key={a.label} label={a.label} value={a.value} index={i} onHover={setHoveredAttr} />
                ))}
              </div>
            </div>
          </div>

          {/* taktyki */}
          <div className="cc-rise" style={{ animationDelay: '320ms' }}>
            <h3 className="text-xs text-yellow-500 tracking-[0.4em] mt-12 mb-6 flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /><circle cx="12" cy="12" r="3" />
              </svg>
              Ulubione Taktyki
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-12">
              {tactics.map(({ label, tactic, color, accent }, i) => (
                <div
                  key={label}
                  className="cc-tactic group p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.08] cursor-default"
                  style={{ ['--accent' as any]: accent }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px -8px ${accent}40, 0 0 0 1px ${accent}50`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <span className={`text-[9px] tracking-[0.35em] ${color}`}>{label}</span>
                  <TacticPitch tactic={tactic} accent={accent} delay={500 + i * 200} />
                  <span className="text-[10px] text-white text-center">{tactic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* historia kariery */}
          <div className="cc-rise" style={{ animationDelay: '420ms' }}>
            <h3 className="text-xs text-yellow-500 tracking-[0.4em] mt-12 mb-4 flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
              </svg>
              Historia Kariery
            </h3>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left py-2.5 px-3 text-slate-500 tracking-[0.2em] font-black">Od</th>
                    <th className="text-left py-2.5 px-3 text-slate-500 tracking-[0.2em] font-black">Klub</th>
                    <th className="text-center py-2.5 px-3 text-green-500 tracking-[0.2em] font-black">W</th>
                    <th className="text-center py-2.5 px-3 text-yellow-500 tracking-[0.2em] font-black">R</th>
                    <th className="text-center py-2.5 px-3 text-red-500 tracking-[0.2em] font-black">P</th>
                  </tr>
                </thead>
                <tbody>
                  {coach.history.map((h: any, i: number) => {
                    const matchingStats = (coach.seasonStats || []).filter((s: any) =>
                      s.season >= h.fromYear && (h.toYear === null || s.season < h.toYear)
                    );
                    const totalW = matchingStats.reduce((acc: number, s: any) => acc + s.wins, 0);
                    const totalD = matchingStats.reduce((acc: number, s: any) => acc + s.draws, 0);
                    const totalL = matchingStats.reduce((acc: number, s: any) => acc + s.losses, 0);
                    const hasStats = matchingStats.length > 0;
                    return (
                      <tr key={i} className={`cc-row border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap tabular-nums">{h.fromMonth}/{h.fromYear}</td>
                        <td className="py-2.5 px-3 text-white">{h.clubName}</td>
                        <td className="py-2.5 px-3 text-center text-green-400 tabular-nums">{hasStats ? totalW : '—'}</td>
                        <td className="py-2.5 px-3 text-center text-yellow-400 tabular-nums">{hasStats ? totalD : '—'}</td>
                        <td className="py-2.5 px-3 text-center text-red-400 tabular-nums">{hasStats ? totalL : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* statystyki sezonów */}
          {coach.seasonStats && coach.seasonStats.length > 0 && (
            <div className="cc-rise" style={{ animationDelay: '500ms' }}>
              <h3 className="text-xs text-yellow-500 tracking-[0.4em] mt-12 mb-4 flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <line x1="5" y1="20" x2="5" y2="12" /><line x1="12" y1="20" x2="12" y2="6" /><line x1="19" y1="20" x2="19" y2="10" />
                </svg>
                Statystyki Sezonów
              </h3>
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left py-2.5 px-3 text-slate-500 tracking-[0.2em] font-black">Sezon</th>
                      <th className="text-left py-2.5 px-3 text-slate-500 tracking-[0.2em] font-black">Liga</th>
                      <th className="text-center py-2.5 px-2 text-slate-500 tracking-[0.2em] font-black">#</th>
                      <th className="text-center py-2.5 px-2 text-green-500 tracking-[0.2em] font-black">W</th>
                      <th className="text-center py-2.5 px-2 text-yellow-500 tracking-[0.2em] font-black">R</th>
                      <th className="text-center py-2.5 px-2 text-red-500 tracking-[0.2em] font-black">P</th>
                      <th className="text-center py-2.5 px-2 text-slate-500 tracking-[0.2em] font-black">Bramki</th>
                      <th className="text-left py-2.5 px-3 text-amber-500 tracking-[0.2em] font-black">Puchar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...coach.seasonStats].reverse().map((s: any, i: number) => {
                      const gd = s.goalsFor - s.goalsAgainst;
                      return (
                        <tr key={i} className={`cc-row border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                          <td className="py-2.5 px-3 text-white whitespace-nowrap tabular-nums">{s.season}/{s.season + 1}</td>
                          <td className="py-2.5 px-3 text-slate-300">{leagueLabel[s.leagueId] || s.leagueId}</td>
                          <td className="py-2.5 px-2 text-center text-slate-400 tabular-nums">#{s.finalRank}</td>
                          <td className="py-2.5 px-2 text-center text-green-400 tabular-nums">{s.wins}</td>
                          <td className="py-2.5 px-2 text-center text-yellow-400 tabular-nums">{s.draws}</td>
                          <td className="py-2.5 px-2 text-center text-red-400 tabular-nums">{s.losses}</td>
                          <td className="py-2.5 px-2 text-center text-white whitespace-nowrap tabular-nums">
                            {s.goalsFor}:{s.goalsAgainst}{' '}
                            <span className={gd >= 0 ? 'text-green-400' : 'text-red-400'}>({gd >= 0 ? '+' : ''}{gd})</span>
                          </td>
                          <td className="py-2.5 px-3 text-amber-400">{cupLabel[s.cupReached]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CoachCard: React.FC = () => {
  const { viewedCoachId, coaches, clubs, nationalTeams, navigateTo, previousViewState } = useGame();
  const coach = viewedCoachId ? coaches[viewedCoachId] : null;

  if (!coach) return null;

  const currentClub = clubs.find(c => c.id === coach.currentClubId);
  const currentNT = !currentClub && coach.currentNationalTeamId
    ? nationalTeams.find(t => t.id === coach.currentNationalTeamId)
    : undefined;

  return (
    <CoachCardContent
      coach={coach}
      currentClub={currentClub}
      currentNT={currentNT}
      onClose={() => navigateTo(previousViewState || ViewState.DASHBOARD)}
    />
  );
};
