import React, { useEffect, useMemo, useState } from 'react';
import { Coach, PlayerPosition } from '../../types';
import {
  ReserveCoachAnalysisReport,
  ReserveCoachCandle,
  ReserveCoachGrowthPoint,
  ReserveCoachTalentAnalysis,
} from '../../services/ReserveCoachAnalysisService';
import { getClubLogo } from '../../resources/ClubLogoAssets';

interface ReserveCoachAnalysisModalProps {
  report: ReserveCoachAnalysisReport;
  coach: Coach | null;
  clubId?: string;
  clubName: string;
  clubColors?: string[];
  onClose: () => void;
  onOpenPlayer: (playerId: string) => void;
}

const POSITION_LABEL: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'BR',
  [PlayerPosition.DEF]: 'OBR',
  [PlayerPosition.MID]: 'POM',
  [PlayerPosition.FWD]: 'NAP',
};

const POSITION_COLOR: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: '#facc15',
  [PlayerPosition.DEF]: '#3b82f6',
  [PlayerPosition.MID]: '#10b981',
  [PlayerPosition.FWD]: '#f43f5e',
};

const scoreColor = (score: number): string => (
  score >= 78 ? '#34d399' : score >= 58 ? '#fbbf24' : '#fb7185'
);

const decisionClass = (decision: string): string => {
  if (decision === 'WŁĄCZYĆ DO I ZESPOŁU') return 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200';
  if (decision === 'PLAN NAPRAWCZY') return 'border-rose-400/35 bg-rose-500/15 text-rose-200';
  if (decision === 'WYPOŻYCZYĆ') return 'border-sky-400/35 bg-sky-500/15 text-sky-200';
  return 'border-amber-400/35 bg-amber-500/15 text-amber-200';
};

const MetricDial: React.FC<{ label: string; value: string; note: string; accent: string }> = ({ label, value, note, accent }) => (
  <div className="relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0b1427] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_30px_rgba(0,0,0,0.25)]">
    <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent, boxShadow: `0 0 20px ${accent}` }} />
    <p className="font-black italic uppercase tracking-tighter text-[9px] text-slate-300">{label}</p>
    <div className="mt-1 flex items-end justify-between gap-3">
      <p className="font-black italic uppercase tracking-tighter text-2xl leading-none text-white">{value}</p>
      <p className="font-black italic uppercase tracking-tighter truncate text-[8px] text-slate-300">{note}</p>
    </div>
  </div>
);

const ScoreBar: React.FC<{ label: string; value: number; detail: string }> = ({ label, value, detail }) => (
  <div>
    <div className="mb-1 flex items-center justify-between gap-3">
      <span className="font-black italic uppercase tracking-tighter text-[9px] text-slate-200">{label}</span>
      <span className="font-black italic uppercase tracking-tighter text-[9px]" style={{ color: scoreColor(value) }}>{detail}</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(3, value)}%`, backgroundColor: scoreColor(value), boxShadow: `0 0 14px ${scoreColor(value)}88` }}
      />
    </div>
  </div>
);

const TalentDonut: React.FC<{ report: ReserveCoachAnalysisReport }> = ({ report }) => {
  const segments = [
    { position: PlayerPosition.GK, label: 'BR' },
    { position: PlayerPosition.DEF, label: 'OBR' },
    { position: PlayerPosition.MID, label: 'POM' },
    { position: PlayerPosition.FWD, label: 'NAP' },
  ];
  const total = Math.max(1, Object.values(report.positionDistribution).reduce((sum, count) => sum + count, 0));
  const circumference = 2 * Math.PI * 44;
  let used = 0;

  return (
    <div className="grid h-full grid-cols-[150px_1fr] items-center gap-3">
      <svg viewBox="0 0 150 150" className="h-[145px] w-[145px]" role="img" aria-label="Rozkład pozycji w kadrze rezerw">
        <defs>
          <filter id="reserveDonutGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="75" cy="75" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="15" />
        {segments.map(segment => {
          const value = report.positionDistribution[segment.position];
          const length = circumference * value / total;
          const offset = -used;
          used += length;
          return (
            <circle
              key={segment.position}
              cx="75"
              cy="75"
              r="44"
              fill="none"
              stroke={POSITION_COLOR[segment.position]}
              strokeWidth="15"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={offset}
              transform="rotate(-90 75 75)"
              filter="url(#reserveDonutGlow)"
            />
          );
        })}
        <circle cx="75" cy="75" r="31" fill="#07101f" stroke="rgba(255,255,255,0.08)" />
        <text x="75" y="72" textAnchor="middle" fill="#ffffff" fontSize="22" className="font-black italic uppercase tracking-tighter">{total}</text>
        <text x="75" y="89" textAnchor="middle" fill="#cbd5e1" fontSize="8" className="font-black italic uppercase tracking-tighter">ZAWODNIKÓW</text>
      </svg>
      <div className="space-y-2">
        {segments.map(segment => (
          <div key={segment.position} className="flex items-center justify-between border-b border-white/[0.05] pb-1.5">
            <span className="flex items-center gap-2 font-black italic uppercase tracking-tighter text-[9px] text-slate-200">
              <i className="h-2 w-2 rounded-sm" style={{ backgroundColor: POSITION_COLOR[segment.position] }} />
              {segment.label}
            </span>
            <span className="font-black italic uppercase tracking-tighter text-[11px] text-white">{report.positionDistribution[segment.position]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CandleChart: React.FC<{ candles: ReserveCoachCandle[] }> = ({ candles }) => {
  const width = 380;
  const height = 150;
  const chartTop = 14;
  const chartBottom = 124;
  const y = (value: number) => chartBottom - ((value - 4) / 6) * (chartBottom - chartTop);
  const estimated = candles.every(candle => candle.estimated);

  return (
    <div className="h-full">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-black italic uppercase tracking-tighter text-[9px] text-slate-300">Dyspozycja meczowa</p>
        <p className={`font-black italic uppercase tracking-tighter text-[8px] ${estimated ? 'text-amber-400' : 'text-emerald-400'}`}>
          {estimated ? 'Estymacja trenera' : 'Oceny z meczów'}
        </p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[150px] w-full" role="img" aria-label="Wykres świecowy dyspozycji meczowej">
        <defs>
          <linearGradient id="reserveCandleBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0e1e36" />
            <stop offset="1" stopColor="#060c18" />
          </linearGradient>
          <pattern id="reserveCandleGrid" width="28" height="22" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 22" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={width} height="136" rx="12" fill="url(#reserveCandleBg)" stroke="rgba(255,255,255,0.08)" />
        <rect x="0" y="0" width={width} height="136" rx="12" fill="url(#reserveCandleGrid)" />
        {[5, 6, 7, 8, 9].map(value => (
          <g key={value}>
            <line x1="28" x2="370" y1={y(value)} y2={y(value)} stroke="rgba(148,163,184,0.08)" />
            <text x="8" y={y(value) + 3} fill="#94a3b8" fontSize="8" className="font-black italic uppercase tracking-tighter">{value.toFixed(1)}</text>
          </g>
        ))}
        {candles.map((candle, index) => {
          const x = 54 + index * 53;
          const rising = candle.close >= candle.open;
          const color = rising ? '#34d399' : '#fb7185';
          const top = Math.min(y(candle.open), y(candle.close));
          const bodyHeight = Math.max(3, Math.abs(y(candle.close) - y(candle.open)));
          return (
            <g key={`${candle.label}-${index}`} opacity={candle.estimated ? 0.72 : 1}>
              <line x1={x} x2={x} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="2" />
              <rect x={x - 8} y={top} width="16" height={bodyHeight} rx="3" fill={rising ? color : '#3f1424'} stroke={color} />
              <text x={x} y="148" textAnchor="middle" fill="#cbd5e1" fontSize="8" className="font-black italic uppercase tracking-tighter">{candle.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const GrowthCurveChart: React.FC<{ points: ReserveCoachGrowthPoint[]; uncertainty: number }> = ({ points, uncertainty }) => {
  const width = 380;
  const height = 150;
  const minValue = Math.max(1, Math.floor(Math.min(...points.map(point => point.low)) - 2));
  const maxValue = Math.min(99, Math.ceil(Math.max(...points.map(point => point.high)) + 2));
  const range = Math.max(1, maxValue - minValue);
  const x = (month: number) => 28 + month / 12 * 332;
  const y = (value: number) => 124 - (value - minValue) / range * 102;
  const linePoints = points.map(point => `${x(point.month)},${y(point.value)}`).join(' ');
  const bandPoints = [
    ...points.map(point => `${x(point.month)},${y(point.high)}`),
    ...[...points].reverse().map(point => `${x(point.month)},${y(point.low)}`),
  ].join(' ');

  return (
    <div className="h-full">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-black italic uppercase tracking-tighter text-[9px] text-slate-300">Krzywa rozwoju · 12 miesięcy</p>
        <p className="font-black italic uppercase tracking-tighter text-[8px] text-cyan-300">Pasmo błędu ±{uncertainty}%</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[150px] w-full" role="img" aria-label="Paraboliczna prognoza rozwoju talentu">
        <defs>
          <linearGradient id="reserveGrowthBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#071c2b" />
            <stop offset="1" stopColor="#07101f" />
          </linearGradient>
          <linearGradient id="reserveGrowthBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0.28" />
            <stop offset="1" stopColor="#2563eb" stopOpacity="0.04" />
          </linearGradient>
          <filter id="reserveGrowthGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width={width} height="136" rx="12" fill="url(#reserveGrowthBg)" stroke="rgba(255,255,255,0.08)" />
        {[0, 3, 6, 9, 12].map(month => (
          <g key={month}>
            <line x1={x(month)} x2={x(month)} y1="12" y2="128" stroke="rgba(148,163,184,0.08)" />
            <text x={x(month)} y="148" textAnchor="middle" fill="#cbd5e1" fontSize="8" className="font-black italic uppercase tracking-tighter">{month}M</text>
          </g>
        ))}
        <polygon points={bandPoints} fill="url(#reserveGrowthBand)" />
        <polyline points={linePoints} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" filter="url(#reserveGrowthGlow)" />
        {points.map(point => (
          <g key={point.month}>
            <circle cx={x(point.month)} cy={y(point.value)} r="4" fill="#020617" stroke="#67e8f9" strokeWidth="2" />
            <text x={x(point.month)} y={y(point.value) - 9} textAnchor="middle" fill="#e2e8f0" fontSize="8" className="font-black italic uppercase tracking-tighter">{point.value.toFixed(1)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const TalentPitch: React.FC<{
  report: ReserveCoachAnalysisReport;
  selectedPlayerId: string;
}> = ({ report, selectedPlayerId }) => (
  <svg viewBox="0 0 420 430" className="h-full max-h-[430px] w-full" role="img" aria-label="Mapa pozycji i kierunków ruchu talentów rezerw">
    <defs>
      <linearGradient id="reservePitchSurface" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#073526" />
        <stop offset="0.5" stopColor="#062d22" />
        <stop offset="1" stopColor="#041c18" />
      </linearGradient>
      <pattern id="reservePitchStripes" width="420" height="70" patternUnits="userSpaceOnUse">
        <rect width="420" height="35" fill="rgba(255,255,255,0.018)" />
      </pattern>
      <filter id="reservePitchGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <marker id="reserveMoveArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#67e8f9" />
      </marker>
    </defs>
    {/*
      The pitch surface uses square corners and a grass-coloured outline so that
      the SVG edge blends into the playing field instead of looking like a second,
      decorative frame around it.
    */}
    <rect x="10" y="10" width="400" height="410" fill="url(#reservePitchSurface)" stroke="#073526" strokeWidth="2" />
    <rect x="10" y="10" width="400" height="410" fill="url(#reservePitchStripes)" />
    <g fill="none" stroke="rgba(167,243,208,0.35)" strokeWidth="1.5">
      <rect x="28" y="28" width="364" height="374" />
      <line x1="28" x2="392" y1="215" y2="215" />
      <circle cx="210" cy="215" r="48" />
      <circle cx="210" cy="215" r="3" fill="rgba(167,243,208,0.5)" />
      <rect x="102" y="28" width="216" height="72" />
      <rect x="150" y="28" width="120" height="28" />
      <path d="M 160 100 A 56 56 0 0 0 260 100" />
      <rect x="102" y="330" width="216" height="72" />
      <rect x="150" y="374" width="120" height="28" />
      <path d="M 160 330 A 56 56 0 0 1 260 330" />
    </g>
    {/*
      The report keeps positioning data for every analysed talent, but the pitch is
      intentionally a focused player card. Rendering only the active marker avoids
      turning the tactical preview into a crowded team formation and ensures that
      the movement arrow always describes the player selected in the ranking.
    */}
    {report.pitchMarkers.filter(marker => marker.playerId === selectedPlayerId).map(marker => {
      const x = 28 + marker.x / 100 * 364;
      const y = 28 + marker.y / 100 * 374;
      const moveX = 28 + marker.moveX / 100 * 364;
      const moveY = 28 + marker.moveY / 100 * 374;
      const color = POSITION_COLOR[marker.position];
      return (
        <g key={marker.playerId}>
          {/* Goalkeepers retain their position marker, but do not receive a suggested movement arrow. */}
          {marker.position !== PlayerPosition.GK && (
            <path
              d={`M ${x} ${y - 5} Q ${(x + moveX) / 2 + 8} ${(y + moveY) / 2} ${moveX} ${moveY}`}
              fill="none"
              stroke="#67e8f9"
              strokeWidth="2.6"
              strokeDasharray="5 4"
              opacity="1"
              markerEnd="url(#reserveMoveArrow)"
            />
          )}
          <circle cx={x} cy={y} r="24" fill="none" stroke={color} strokeWidth="2" opacity="0.55" filter="url(#reservePitchGlow)" />
          <circle cx={x} cy={y} r="16" fill="#07101f" stroke={color} strokeWidth="3" />
          <text x={x} y={y + 3} textAnchor="middle" fill="#ffffff" fontSize="8" className="font-black italic uppercase tracking-tighter">{POSITION_LABEL[marker.position]}</text>
          <rect x={x - 34} y={y + 20} width="68" height="16" rx="6" fill="rgba(2,6,23,0.88)" stroke="rgba(255,255,255,0.10)" />
          <text x={x} y={y + 31} textAnchor="middle" fill="#ffffff" fontSize="7" className="font-black italic uppercase tracking-tighter">{marker.shortName}</text>
        </g>
      );
    })}
  </svg>
);

const getVisibleStats = (talent: ReserveCoachTalentAnalysis) => {
  const stats = talent.player.reserveStats;
  if (stats) return stats;
  return {
    matches: talent.player.stats.matchesPlayed,
    goals: talent.player.stats.goals,
    assists: talent.player.stats.assists,
    yellowCards: talent.player.stats.yellowCards,
    redCards: talent.player.stats.redCards,
  };
};

export const ReserveCoachAnalysisModal: React.FC<ReserveCoachAnalysisModalProps> = ({
  report,
  coach,
  clubId,
  clubName,
  clubColors,
  onClose,
  onOpenPlayer,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(report.talents[0]?.player.id ?? '');

  useEffect(() => {
    if (!report.talents.some(talent => talent.player.id === selectedPlayerId)) {
      setSelectedPlayerId(report.talents[0]?.player.id ?? '');
    }
  }, [report, selectedPlayerId]);

  const selected = useMemo(
    () => report.talents.find(talent => talent.player.id === selectedPlayerId) ?? report.talents[0] ?? null,
    [report.talents, selectedPlayerId],
  );
  const stats = selected ? getVisibleStats(selected) : null;
  const clubLogo = clubId ? getClubLogo(clubId) : undefined;
  const clubPrimaryColor = clubColors?.[0] ?? '#0e7490';
  const clubSecondaryColor = clubColors?.[1] ?? '#2563eb';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#01040b]/95 p-5 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative flex h-[94vh] max-h-[1015px] w-full max-w-[1760px] flex-col overflow-hidden rounded-[30px] border border-cyan-300/20 bg-[#050b16] font-sans shadow-[0_50px_160px_rgba(0,0,0,0.9),0_0_70px_rgba(8,145,178,0.10)] [&_*]:!font-sans [&_*]:!not-italic [&_*]:!tracking-normal"
        onClick={event => event.stopPropagation()}
      >
        {/*
          The report keeps its original dimensions and hierarchy, while a scoped
          typography override replaces the condensed italic display treatment with
          a regular sans-serif face and normal letter spacing for easier scanning.
        */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-70" viewBox="0 0 1760 1015" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="reserveReportFrame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0e7490" stopOpacity="0.28" />
              <stop offset="0.45" stopColor="#1d4ed8" stopOpacity="0.05" />
              <stop offset="1" stopColor="#f59e0b" stopOpacity="0.12" />
            </linearGradient>
            <pattern id="reserveReportDots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(103,232,249,0.10)" />
            </pattern>
            <linearGradient id="reserveClubBand" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={clubPrimaryColor} stopOpacity="0" />
              <stop offset="0.35" stopColor={clubPrimaryColor} stopOpacity="0.22" />
              <stop offset="0.72" stopColor={clubSecondaryColor} stopOpacity="0.18" />
              <stop offset="1" stopColor={clubSecondaryColor} stopOpacity="0" />
            </linearGradient>
            <radialGradient id="reserveClubHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor={clubPrimaryColor} stopOpacity="0.18" />
              <stop offset="1" stopColor={clubSecondaryColor} stopOpacity="0" />
            </radialGradient>
          </defs>
          {/*
            Club identity is rendered as a low-contrast SVG layer beneath the full
            report. The broad bands use the saved club palette, while the optional
            crest remains a watermark and never competes with foreground data.
          */}
          <ellipse cx="1325" cy="515" rx="520" ry="470" fill="url(#reserveClubHalo)" />
          <path d="M-180 790 L1080 185 H1600 L340 790 Z" fill="url(#reserveClubBand)" opacity="0.42" />
          <path d="M160 1015 L1430 365 H1840 L570 1015 Z" fill="none" stroke={clubSecondaryColor} strokeWidth="90" strokeOpacity="0.055" />
          {clubLogo && (
            <image
              href={clubLogo}
              x="1130"
              y="220"
              width="500"
              height="500"
              preserveAspectRatio="xMidYMid meet"
              opacity="0.075"
            />
          )}
          <path d="M0 0 H1760 V180 C1420 110 1120 230 780 140 C470 58 260 120 0 70 Z" fill="url(#reserveReportFrame)" />
          <rect width="1760" height="1015" fill="url(#reserveReportDots)" />
          <path d="M1220 1015 L1760 600 V1015 Z" fill="rgba(14,116,144,0.05)" stroke="rgba(34,211,238,0.10)" />
        </svg>

        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#071224] px-7 py-4">
          <div className="flex items-center gap-5">
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/25 bg-cyan-500/10">
              <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden="true">
                <defs><linearGradient id="reserveHeaderIcon" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#22d3ee" /><stop offset="1" stopColor="#2563eb" /></linearGradient></defs>
                <path d="M8 43V14h40v29M14 37l9-10 7 6 12-15" fill="none" stroke="url(#reserveHeaderIcon)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="23" cy="27" r="3" fill="#67e8f9" />
                <circle cx="30" cy="33" r="3" fill="#60a5fa" />
                <circle cx="42" cy="18" r="3" fill="#fbbf24" />
              </svg>
            </div>
            <div>
              <p className="font-black italic uppercase tracking-tighter text-[9px] text-cyan-400">Centrum rozwoju talentów · raport tygodniowy</p>
              <h2 className="font-black italic uppercase tracking-tighter text-3xl leading-none text-white">Analiza trenera rezerw</h2>
              <p className="mt-1 font-black italic uppercase tracking-tighter text-[9px] text-slate-300">
                {clubName} · tydzień {report.generatedForWeek} · {coach ? `${coach.firstName} ${coach.lastName}` : 'brak przypisanego trenera'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="font-black italic uppercase tracking-tighter rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-[10px] text-slate-100 transition-colors hover:bg-white/10 hover:text-white"
            >
              Zamknij
            </button>
          </div>
        </header>

        <div className="relative z-10 grid shrink-0 grid-cols-4 gap-3 px-6 py-3">
          <MetricDial label="Jakość analizy" value={`${report.coachQuality}/100`} note="Atrybuty trenera" accent="#22d3ee" />
          <MetricDial label="Talenty wysokiej klasy" value={String(report.metrics.highPotential)} note="Wśród analizowanej ósemki" accent="#fbbf24" />
          <MetricDial label="Gotowi do próby" value={String(report.metrics.firstTeamReady)} note="Pierwszy zespół" accent="#34d399" />
          <MetricDial label="Wymagają interwencji" value={String(report.metrics.interventionNeeded)} note={`Rozwój kadry ${report.metrics.averageDevelopment >= 0 ? '+' : ''}${report.metrics.averageDevelopment}`} accent="#fb7185" />
        </div>

        <main className="relative z-10 grid min-h-0 flex-1 grid-cols-[0.92fr_1.2fr_0.95fr] gap-3 px-6 pb-3">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#091224]">
            <div className="border-b border-white/10 bg-white/[0.025] px-4 py-3">
              <p className="font-black italic uppercase tracking-tighter text-[9px] text-amber-400">Ranking obserwacyjny</p>
              <h3 className="font-black italic uppercase tracking-tighter text-lg leading-none text-white">Najważniejsze talenty</h3>
            </div>
            <div className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto p-2">
              {report.talents.map((talent, index) => {
                const active = talent.player.id === selected?.player.id;
                return (
                  <button
                    key={talent.player.id}
                    type="button"
                    onClick={() => setSelectedPlayerId(talent.player.id)}
                    className={`grid w-full grid-cols-[34px_1fr_auto] items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${active ? 'border-cyan-300/35 bg-cyan-500/12' : 'border-white/[0.06] bg-black/15 hover:border-white/15 hover:bg-white/[0.04]'}`}
                  >
                    <span className="font-black italic uppercase tracking-tighter flex h-8 w-8 items-center justify-center rounded-lg text-[10px] text-white" style={{ backgroundColor: `${POSITION_COLOR[talent.player.position]}33`, border: `1px solid ${POSITION_COLOR[talent.player.position]}88` }}>
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="font-black italic uppercase tracking-tighter block truncate text-[11px] text-white">{talent.player.firstName} {talent.player.lastName}</span>
                      <span className="font-black italic uppercase tracking-tighter mt-0.5 block truncate text-[8px]" style={{ color: scoreColor(talent.potentialScore) }}>
                        {POSITION_LABEL[talent.player.position]} · {talent.player.age} lat · {talent.potentialLabel}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="font-black italic uppercase tracking-tighter block text-lg leading-none" style={{ color: scoreColor(talent.potentialScore) }}>{Math.round(talent.potentialScore)}</span>
                      <span className="font-black italic uppercase tracking-tighter text-[7px] text-slate-300">POT</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-white/10 bg-black/20 p-3">
              <p className="font-black italic uppercase tracking-tighter text-[9px] leading-relaxed text-slate-200">{report.executiveSummary}</p>
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#091224]">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-transparent px-5 py-3">
                  <div className="min-w-0">
                    <p className="font-black italic uppercase tracking-tighter text-[8px] text-cyan-400">Profil rozwojowy #{report.talents.findIndex(talent => talent.player.id === selected.player.id) + 1}</p>
                    <h3 className="font-black italic uppercase tracking-tighter truncate text-xl leading-none text-white">{selected.player.firstName} {selected.player.lastName}</h3>
                    <p className="font-black italic uppercase tracking-tighter mt-1 text-[8px] text-slate-300">{POSITION_LABEL[selected.player.position]} · {selected.player.age} lat · OVR {selected.perceivedOverall} · TAL {selected.perceivedTalent}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenPlayer(selected.player.id)}
                    className="font-black italic uppercase tracking-tighter shrink-0 rounded-lg border border-cyan-300/25 bg-cyan-500/10 px-3 py-2 text-[8px] text-cyan-200 hover:bg-cyan-500/20"
                  >
                    Karta zawodnika
                  </button>
                </div>
                <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      ['M', stats?.matches ?? 0],
                      ['G', stats?.goals ?? 0],
                      ['A', stats?.assists ?? 0],
                      ['ŚR.', selected.averageRating?.toFixed(2) ?? '–'],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-lg border border-white/[0.07] bg-black/20 p-2 text-center">
                        <p className="font-black italic uppercase tracking-tighter text-[7px] text-slate-300">{label}</p>
                        <p className="font-black italic uppercase tracking-tighter mt-0.5 text-sm text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-3">
                    <ScoreBar label="Gotowość sportowa" value={selected.readinessScore} detail={`${selected.readinessScore} · ${selected.readinessLabel}`} />
                    <ScoreBar label="Forma" value={selected.formScore} detail={`${selected.formScore}/100`} />
                    <ScoreBar label="Aklimatyzacja" value={selected.adaptationScore} detail={`${selected.adaptationScore} · ${selected.adaptationLabel}`} />
                    <ScoreBar label="Zachowanie na boisku" value={selected.behaviorScore} detail={`${selected.behaviorScore} · ${selected.behaviorLabel}`} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                      <p className="font-black italic uppercase tracking-tighter text-[8px] text-slate-300">Priorytet treningowy</p>
                      <p className="font-black italic uppercase tracking-tighter mt-1 text-[12px] text-cyan-200">{selected.focusLabel}</p>
                      <p className="font-black italic uppercase tracking-tighter mt-1 text-[8px] text-slate-300">Trend pozycyjny {selected.developmentTrend >= 0 ? '+' : ''}{selected.developmentTrend}</p>
                    </div>
                    <div className={`rounded-xl border p-3 ${decisionClass(selected.decision)}`}>
                      <p className="font-black italic uppercase tracking-tighter text-[8px] opacity-70">Decyzja kariery</p>
                      <p className="font-black italic uppercase tracking-tighter mt-1 text-[11px]">{selected.decision}</p>
                      <p className="font-black italic uppercase tracking-tighter mt-1 text-[8px] opacity-70">{selected.horizon}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/20 p-3">
                    <p className="font-black italic uppercase tracking-tighter text-[8px] text-amber-400">Obserwacja trenera</p>
                    <p className="font-black italic uppercase tracking-tighter mt-1 text-[9px] leading-relaxed text-slate-100">{selected.observation}</p>
                    <p className="font-black italic uppercase tracking-tighter mt-2 border-l-2 border-cyan-400 pl-2 text-[9px] leading-relaxed text-cyan-100">{selected.recommendation}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="font-black italic uppercase tracking-tighter text-sm text-slate-300">Brak zawodników do analizy</p>
              </div>
            )}
          </section>

          {/*
            The SVG already provides the pitch surface and its own touchline frame.
            Keeping this container transparent removes the redundant second panel
            that previously looked like an extra background and border under it.
          */}
          <section className="flex min-h-0 flex-col overflow-hidden bg-transparent">
            <div className="flex items-center px-4 py-3">
              <div>
                <p className="font-black italic uppercase tracking-tighter text-[8px] text-emerald-400">Model zachowania pozycyjnego</p>
                <h3 className="font-black italic uppercase tracking-tighter text-lg leading-none text-white">Mapa zawodnika</h3>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-2">
              <TalentPitch report={report} selectedPlayerId={selected?.player.id ?? ''} />
            </div>
          </section>
        </main>

        {selected && (
          <section className="relative z-10 grid h-[205px] shrink-0 grid-cols-[0.72fr_1.15fr_1.15fr] gap-3 border-t border-white/10 bg-[#040914] px-6 py-3">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#08111f] px-4 py-2">
              <p className="font-black italic uppercase tracking-tighter text-[9px] text-slate-300">Struktura kadry</p>
              <TalentDonut report={report} />
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#08111f] px-4 py-2">
              <CandleChart candles={selected.candles} />
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#08111f] px-4 py-2">
              <GrowthCurveChart points={selected.growthCurve} uncertainty={report.uncertaintyPercent} />
            </div>
          </section>
        )}

        <footer className="relative z-10 flex shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#030711] px-7 py-2">
          <p className="font-black italic uppercase tracking-tighter text-[8px] text-slate-300">Analiza łączy trening, mecze, rozwój, formę, zachowanie, gotowość i aklimatyzację.</p>
          <p className="font-black italic uppercase tracking-tighter text-[8px] text-slate-300">Minimum 5% niepewności pozostaje niezależnie od klasy trenera.</p>
        </footer>
      </div>
    </div>
  );
};
