import React from 'react';
import { Check, FastForward, Pause, Play, RotateCcw, Shirt, SkipForward, SlidersHorizontal } from 'lucide-react';
import { type Club, type Player, type PlayerLiveInstructions, type PlayerPosition, type TacticalInstructions } from '../../types';
import type {
  CupV2KitUi,
  CupV2LiveUiState,
  CupV2PitchPlayerNode,
  CupV2PlayerLiveCard,
  CupV2TeamStatsUi,
  CupV2UiSide,
} from './CupV2LiveUiTypes';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const statRows: Array<{ key: keyof CupV2TeamStatsUi; label: string; format?: (value: number) => string }> = [
  { key: 'possession', label: 'PIŁ', format: value => `${value}%` },
  { key: 'shots', label: 'STRZ' },
  { key: 'shotsOnTarget', label: 'CEL' },
  { key: 'xG', label: 'XG', format: value => value.toFixed(2) },
  { key: 'corners', label: 'RÓŻ' },
  { key: 'offsides', label: 'SPA' },
  { key: 'fouls', label: 'FAU' },
  { key: 'yellowCards', label: 'ŻK' },
  { key: 'redCards', label: 'CK' },
];

const initials = (club: Club): string => club.shortName.slice(0, 3).toUpperCase();

const positionRank: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

const positionLabel = (position: PlayerPosition | string): string => {
  if (position === 'GK') return 'BR';
  if (position === 'DEF') return 'OBR';
  if (position === 'MID') return 'POM';
  if (position === 'FWD') return 'NAP';
  return String(position);
};

const sortPlayersForList = (players: CupV2PlayerLiveCard[]): CupV2PlayerLiveCard[] =>
  [...players].sort((a, b) =>
    (positionRank[a.position] ?? 9) - (positionRank[b.position] ?? 9) ||
    a.position.localeCompare(b.position) ||
    b.rating - a.rating ||
    a.shortName.localeCompare(b.shortName)
  );

const conditionColor = (value: number): string => {
  if (value >= 80) return 'bg-emerald-400';
  if (value >= 65) return 'bg-lime-300';
  if (value >= 50) return 'bg-amber-300';
  return 'bg-rose-400';
};

const textShadow = { textShadow: '0 1px 4px rgba(0,0,0,0.85)' };

const PlayerStatusMarks: React.FC<{ player: CupV2PlayerLiveCard }> = ({ player }) => (
  <div className="flex min-w-[40px] items-center justify-end gap-0.5">
    {player.goals > 0 && (
      <span title="Bramki" className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-black">
        ⚽{player.goals > 1 ? player.goals : ''}
      </span>
    )}
    {player.assists > 0 && (
      <span title="Asysty" className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-300 px-1 text-[9px] font-black text-slate-950">
        A{player.assists > 1 ? player.assists : ''}
      </span>
    )}
    {player.yellowCards > 0 && <span title="Żółta kartka" className="h-4 w-2.5 rounded-[2px] bg-yellow-300" />}
    {player.redCards > 0 && <span title="Czerwona kartka" className="h-4 w-2.5 rounded-[2px] bg-red-500" />}
    {player.injury && (
      <span title="Kontuzja" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
        +
      </span>
    )}
  </div>
);

export const CupV2PlayerKitIconSvg: React.FC<{
  node: CupV2PitchPlayerNode;
  size?: number;
}> = ({ node, size = 38 }) => (
  <div className="relative flex flex-col items-center" style={{ width: size + 36 }}>
    {node.redCards > 0 && (
      <span
        title="Czerwona kartka — zawodnik wykluczony, brak zmiany"
        className="absolute -right-1 top-0 z-10 h-4 w-2.5 rounded-[2px] bg-red-500 shadow-[0_0_6px_rgba(0,0,0,0.7)]"
      />
    )}
    <svg
      viewBox="0 0 72 78"
      width={size}
      height={Math.round(size * 1.08)}
      className={cx('overflow-visible drop-shadow-[0_8px_12px_rgba(0,0,0,0.65)]', node.redCards > 0 && 'opacity-45 grayscale')}
    >
      <defs>
        <linearGradient id={`shirtShade-${node.id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="48%" stopColor={node.kit.primary} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>
        <filter id={`activeKitGlow-${node.id}`} x="-55%" y="-55%" width="210%" height="210%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="36" cy="73" rx="19" ry="4" fill="rgba(0,0,0,0.4)" />
      <path
        d="M17 7 L5 17 L12 29 L20 25 L20 49 L52 49 L52 25 L60 29 L67 17 L55 7 L46 3 C43 8 29 8 26 3 Z"
        fill={node.kit.primary}
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="1.8"
        filter={node.isActiveEvent ? `url(#activeKitGlow-${node.id})` : undefined}
      />
      <path d="M17 7 L5 17 L12 29 L20 25 L20 49 L52 49 L52 25 L60 29 L67 17 L55 7 L46 3 C43 8 29 8 26 3 Z" fill={`url(#shirtShade-${node.id})`} opacity="0.55" />
      {node.kit.shirtSecondary && <path d="M32 8 H40 V49 H32 Z" fill={node.kit.shirtSecondary} opacity="0.72" />}
      <text x="36" y="34" textAnchor="middle" fontSize="16" fontWeight="900" fill={node.kit.text} stroke={node.kit.text === '#ffffff' ? '#111827' : '#ffffff'} strokeWidth="0.65">
        {node.overall}
      </text>
      <path d="M21 49 H34 V69 H18 Z" fill={node.kit.secondary} stroke="rgba(255,255,255,0.56)" strokeWidth="1.4" />
      <path d="M38 49 H51 L54 69 H38 Z" fill={node.kit.secondary} stroke="rgba(255,255,255,0.56)" strokeWidth="1.4" />
    </svg>
    <span
      className={cx('mt-0.5 w-full truncate text-center text-[8px] font-black uppercase tracking-tighter', node.isActiveEvent ? 'text-emerald-100' : 'text-white')}
      style={textShadow}
    >
      {node.shortName}
    </span>
  </div>
);

export const CupV2MatchHeaderSvg: React.FC<{ state: CupV2LiveUiState }> = ({ state }) => {
  const { header } = state;
  const clockDisplay = header.isFinished
    ? 'KONIEC'
    : `${String(Math.floor(state.currentSecond / 60)).padStart(2, '0')}:${String(state.currentSecond % 60).padStart(2, '0')}`;
  const teamBlock = (team: typeof header.home, align: 'left' | 'right') => (
    <div className={cx('relative z-10 flex w-[38%] items-center gap-5', align === 'right' && 'flex-row-reverse text-right')}>
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-full opacity-35 blur-2xl" style={{ backgroundColor: team.kit.primary }} />
        {team.logo ? (
          <img src={team.logo} alt={team.club.name} className="relative h-16 w-16 object-contain drop-shadow-2xl" />
        ) : (
          <span className="relative font-black text-white">{initials(team.club)}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[clamp(24px,2.25vw,42px)] font-black uppercase leading-none tracking-tighter text-white" style={textShadow}>
          {team.club.name}
        </div>
      </div>
    </div>
  );

  return (
    <header className="relative h-[190px] shrink-0 overflow-hidden border-b border-white/10 bg-[#050913] px-9 py-4 shadow-[0_16px_55px_rgba(0,0,0,0.5)]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 190" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id="cupHeaderCenter" cx="50%" cy="6%" r="82%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.22" />
            <stop offset="46%" stopColor="#0f172a" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
          </radialGradient>
          <linearGradient id="cupHeaderLine" x1="0" x2="1">
            <stop offset="0%" stopColor={header.home.kit.primary} stopOpacity="0.55" />
            <stop offset="50%" stopColor="#fb315e" stopOpacity="0.82" />
            <stop offset="100%" stopColor={header.away.kit.primary} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect width="1600" height="190" fill="url(#cupHeaderCenter)" />
        <path d="M0 150 C230 104 425 135 618 110 C786 88 1003 89 1185 114 C1350 137 1460 113 1600 80 V190 H0 Z" fill="#020617" opacity="0.68" />
        <path d="M110 40 H1490" stroke="url(#cupHeaderLine)" strokeWidth="2" opacity="0.45" />
        <path d="M235 158 H1365" stroke="url(#cupHeaderLine)" strokeWidth="5" strokeLinecap="round" opacity="0.56" />
        <circle cx="800" cy="88" r="58" fill="#030712" stroke="#fb315e" strokeWidth="4" opacity="0.96" />
      </svg>
      <div className="absolute left-1/2 top-2 z-0 -translate-x-1/2 truncate text-center text-3xl font-black uppercase tracking-[0.48em] text-white/10">
        {header.title}
      </div>
      <div className="relative z-20 flex h-full items-center justify-between gap-8">
        {teamBlock(header.home, 'left')}
        <div className="flex min-w-[280px] flex-col items-center justify-center gap-2 pt-2">
          <div className="flex items-center gap-4 rounded-2xl border border-white/12 bg-black/80 px-7 py-2 shadow-[0_0_42px_rgba(0,0,0,0.55)]">
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.3em] text-white/35">{initials(header.home.club)}</span>
            <span className="font-mono text-6xl font-black tabular-nums leading-none text-white">{header.home.score}</span>
            <span className="font-mono text-3xl font-black leading-none text-white/25">:</span>
            <span className="font-mono text-6xl font-black tabular-nums leading-none text-white">{header.away.score}</span>
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.3em] text-white/35">{initials(header.away.club)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-emerald-400/30 bg-black px-4 py-1 shadow-[inset_0_0_14px_rgba(0,0,0,0.85)]">
              <span className="font-mono text-xl font-bold tabular-nums text-emerald-400 [text-shadow:0_0_9px_rgba(52,211,153,0.7)]">
                {clockDisplay}
              </span>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-tighter text-slate-300">
              {header.phaseLabel}
            </div>
          </div>
          <div className="flex w-64 items-center gap-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-tighter text-white/45">{Math.round(header.home.momentum)}%</span>
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full" style={{ width: `${header.home.momentum}%`, backgroundColor: header.home.kit.primary }} />
              <div className="h-full" style={{ width: `${header.away.momentum}%`, backgroundColor: header.away.kit.primary }} />
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-tighter text-white/45">{Math.round(header.away.momentum)}%</span>
          </div>
          {header.home.penaltyScore !== undefined && header.away.penaltyScore !== undefined && (
            <div className="mt-1 rounded-full bg-amber-400/18 px-4 py-1 text-[10px] font-black uppercase tracking-tighter text-amber-200">
              Karne {header.home.penaltyScore}:{header.away.penaltyScore}
            </div>
          )}
          {header.winnerLabel && <div className="mt-1 rounded-full bg-emerald-400 px-5 py-1 text-[10px] font-black uppercase tracking-tighter text-slate-950">{header.winnerLabel}</div>}
          <div className="mt-2 max-w-[360px] truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{header.venue}</div>
        </div>
        {teamBlock(header.away, 'right')}
      </div>
    </header>
  );
};

export const CupV2PitchSvg: React.FC<{
  state: CupV2LiveUiState;
  userSide: CupV2UiSide;
  substitutionOutId?: string;
  onPlayerClick?: (playerId: string) => void;
}> = ({ state, userSide, substitutionOutId, onPlayerClick }) => {
  const latestComment = state.recentEvents[0];
  const commentSide = latestComment?.side;
  const commentKit = commentSide === 'HOME' ? state.header.home.kit : commentSide === 'AWAY' ? state.header.away.kit : undefined;
  const [goalFlash, setGoalFlash] = React.useState<{ id: string; kit?: CupV2KitUi } | null>(null);
  React.useEffect(() => {
    if (!latestComment?.isGoal || goalFlash?.id === latestComment.id) return;
    setGoalFlash({ id: latestComment.id, kit: commentKit });
    const timeout = window.setTimeout(() => {
      setGoalFlash(current => (current?.id === latestComment.id ? null : current));
    }, 4000);
    return () => window.clearTimeout(timeout);
  }, [latestComment?.id, latestComment?.isGoal]);
  return (
  <div className="relative flex min-h-[320px] flex-1 items-center justify-center overflow-hidden">
  <section className="relative mx-auto aspect-[7/10] h-full max-w-full overflow-hidden rounded-2xl bg-[#061f10] shadow-[0_20px_70px_rgba(0,0,0,0.38)]">
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 1000" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="pitchGrass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0b3320" />
          <stop offset="52%" stopColor="#082818" />
          <stop offset="100%" stopColor="#031c0f" />
        </linearGradient>
        <radialGradient id="pitchCenterGlow" cx="50%" cy="50%" r="72%">
          <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.34" />
        </radialGradient>
        <linearGradient id="pitchLightBand" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="700" height="1000" fill="url(#pitchGrass)" />
      <rect x="40" y="30" width="620" height="940" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" />
      <line x1="40" y1="500" x2="660" y2="500" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
      <circle cx="350" cy="500" r="80" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
      <circle cx="350" cy="500" r="5" fill="rgba(255,255,255,0.5)" />
      <rect x="175" y="30" width="350" height="180" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
      <rect x="253" y="30" width="194" height="82" fill="none" stroke="rgba(255,255,255,0.26)" strokeWidth="1.5" />
      <path d="M270 210 A80 80 0 0 0 430 210" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <rect x="175" y="790" width="350" height="180" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
      <rect x="253" y="888" width="194" height="82" fill="none" stroke="rgba(255,255,255,0.26)" strokeWidth="1.5" />
      <path d="M270 790 A80 80 0 0 1 430 790" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <rect x="300" y="23" width="100" height="14" rx="5" fill="rgba(255,255,255,0.1)" />
      <rect x="300" y="963" width="100" height="14" rx="5" fill="rgba(255,255,255,0.1)" />
      <rect width="700" height="1000" fill="url(#pitchCenterGlow)" />
      <rect width="700" height="1000" fill="url(#pitchLightBand)" />
      <ellipse cx="350" cy={state.activePlayerId ? 500 : 520} rx="170" ry="160" fill="#34d399" opacity="0.05" />
    </svg>
    <div className="absolute inset-0">
      {state.pitchNodes.map(node => {
        const isOwn = node.side === userSide;
        const isSelectedOut = substitutionOutId === node.id;
        const isSelectable = isOwn && onPlayerClick && node.redCards === 0;
        return (
          <div
            key={node.id}
            onClick={isSelectable ? () => onPlayerClick(node.id) : undefined}
            className={cx(
              'absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500',
              isSelectable && 'cursor-pointer'
            )}
            style={{ left: `${node.x * 90 + 5}%`, top: `${node.y * 90 + 5}%` }}
          >
            {node.isActiveEvent && <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-emerald-100/70 bg-emerald-300/10" />}
            {isSelectedOut && <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose-400 bg-rose-500/15" />}
            <CupV2PlayerKitIconSvg node={node} />
          </div>
        );
      })}
    </div>
    {goalFlash && (
      <div className="pointer-events-none absolute inset-x-4 top-[36%] z-[40] -translate-y-1/2 animate-pulse">
        <div
          className="rounded-[16px] border-4 px-6 py-4 text-center backdrop-blur-xl"
          style={{
            borderColor: goalFlash.kit ? goalFlash.kit.secondary : 'rgba(255,255,255,0.6)',
            backgroundColor: goalFlash.kit ? `${goalFlash.kit.primary}ee` : 'rgba(15,23,42,0.92)',
            boxShadow: `0 0 80px ${goalFlash.kit ? goalFlash.kit.primary : '#000'}aa`,
          }}
        >
          <p className="text-4xl font-black uppercase leading-none tracking-tighter" style={{ color: goalFlash.kit ? goalFlash.kit.text : '#ffffff' }}>
            GOL!
          </p>
        </div>
      </div>
    )}
    {latestComment && !state.isHalfTime && !state.isFinished && !state.isShootout && (
      <div className="pointer-events-none absolute inset-x-4 top-1/2 z-[35] -translate-y-1/2">
        <div
          key={latestComment.id}
          className="rounded-[14px] px-5 py-2.5 text-center backdrop-blur-xl animate-slide-up"
          style={{
            backgroundColor: commentKit ? `${commentKit.primary}cc` : 'rgba(15,23,42,0.85)',
            border: `2px solid ${commentKit ? commentKit.secondary : 'rgba(255,255,255,0.15)'}99`,
            boxShadow: `0 0 40px ${commentKit ? commentKit.primary : '#000'}44`,
          }}
        >
          <p
            className="line-clamp-2 text-sm font-bold uppercase leading-snug tracking-tight"
            style={{ color: commentKit ? commentKit.text : '#ffffff' }}
          >
            {latestComment.text}
          </p>
        </div>
      </div>
    )}
    {state.isHalfTime && (
      <div className="absolute inset-x-12 top-1/2 z-20 -translate-y-1/2 bg-slate-950/82 px-8 py-5 text-center shadow-2xl backdrop-blur-xl">
        <div className="text-2xl font-black uppercase tracking-tighter text-amber-200">PRZERWA</div>
        <div className="mt-1 text-sm font-black uppercase tracking-tighter text-slate-300">Statystyki pokazują pierwszą połowę.</div>
      </div>
    )}
  </section>
  </div>
  );
};

const PlayerRow: React.FC<{
  player: CupV2PlayerLiveCard;
  kit: CupV2KitUi;
  selectedOutId?: string;
  selectedInId?: string;
  onContextMenu?: (event: React.MouseEvent) => void;
  onClick?: () => void;
}> = ({ player, kit, selectedOutId, selectedInId, onContextMenu, onClick }) => {
  const isOut = selectedOutId === player.id;
  const isIn = selectedInId === player.id;
  return (
    <div
      onContextMenu={onContextMenu ? event => { event.preventDefault(); onContextMenu(event); } : undefined}
      onClick={onClick}
      className={cx(
        'grid grid-cols-[28px_minmax(128px,1fr)_42px_26px_30px_38px_44px] items-center gap-1.5 border-b border-white/[0.055] px-1 py-1.5 text-[10px] transition-colors',
        player.isActiveEvent && 'bg-emerald-300/10',
        isOut && 'bg-rose-400/14',
        isIn && 'bg-emerald-400/14',
        player.redCards > 0 && 'opacity-55',
        onClick && 'cursor-pointer hover:bg-white/[0.06]',
        onContextMenu && !onClick && 'cursor-context-menu hover:bg-white/[0.06]'
      )}
    >
      <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">{positionLabel(player.position)}</span>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="inline-flex h-5 min-w-6 items-center justify-center rounded-[5px] px-1 text-[10px] font-black" style={{ backgroundColor: kit.primary, color: kit.text }}>
            {player.overall}
          </span>
          <span className="truncate text-[11px] font-bold uppercase tracking-tighter text-white" title={player.name}>{player.shortName}</span>
        </div>
        {(player.substitutedOnMinute || player.substitutedOffMinute || isOut || isIn) && (
          <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-tighter text-slate-400">
            {isOut ? 'SCHODZI' : isIn ? 'WCHODZI' : player.substitutedOnMinute ? `OD ${player.substitutedOnMinute}'` : `DO ${player.substitutedOffMinute}'`}
          </div>
        )}
      </div>
      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className={cx('h-full rounded-full', conditionColor(player.fatigue))} style={{ width: `${clamp(player.fatigue, 0, 100)}%` }} />
        </div>
        <div className="mt-0.5 text-right text-[8px] font-semibold uppercase tracking-tighter text-slate-400">{Math.round(player.fatigue)}%</div>
      </div>
      <span className="text-right font-black uppercase tracking-tighter text-cyan-100">{player.rating ? player.rating.toFixed(1) : '-'}</span>
      <span className="text-right font-black uppercase tracking-tighter text-white">{player.goals}/{player.assists}</span>
      <span className="text-right font-black uppercase tracking-tighter text-white">{player.shots}/{player.shotsOnTarget}</span>
      <div className="flex justify-end">
        <PlayerStatusMarks player={player} />
      </div>
    </div>
  );
};

const PlayerSection: React.FC<{
  title: string;
  players: CupV2PlayerLiveCard[];
  kit: CupV2KitUi;
  selectedOutId?: string;
  selectedInId?: string;
  onPlayerContextMenu?: (playerId: string, event: React.MouseEvent) => void;
  onPlayerClick?: (playerId: string) => void;
}> = ({ title, players, kit, selectedOutId, selectedInId, onPlayerContextMenu, onPlayerClick }) => {
  if (players.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between px-1 text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
        <span>{title}</span>
        <span>{players.length}</span>
      </div>
      {sortPlayersForList(players).map(player => (
        <PlayerRow
          key={player.id}
          player={player}
          kit={kit}
          selectedOutId={selectedOutId}
          selectedInId={selectedInId}
          onContextMenu={onPlayerContextMenu && player.redCards === 0 ? event => onPlayerContextMenu(player.id, event) : undefined}
          onClick={onPlayerClick ? () => onPlayerClick(player.id) : undefined}
        />
      ))}
    </div>
  );
};

export const CupV2TeamPlayerList: React.FC<{
  title: string;
  players: CupV2PlayerLiveCard[];
  kit: CupV2KitUi;
  selectedOutId?: string;
  selectedInId?: string;
  isOwnTeam?: boolean;
  onPlayerContextMenu?: (playerId: string, event: React.MouseEvent) => void;
  onBenchPlayerClick?: (playerId: string) => void;
}> = ({ title, players, kit, selectedOutId, selectedInId, isOwnTeam, onPlayerContextMenu, onBenchPlayerClick }) => {
  const onPitch = players.filter(player => player.isOnPitch);
  const bench = players.filter(player => !player.isOnPitch && player.isBench && !player.hasLeftPitch);
  const unavailable = players.filter(player => !player.isOnPitch && (player.isStarter || player.hasLeftPitch));

  return (
    <aside className="min-h-0 overflow-hidden bg-slate-950/42 backdrop-blur-sm">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="truncate text-sm font-black uppercase tracking-tighter text-white">{title}</div>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter text-slate-400">
          <Shirt size={13} />
          <span>SKŁAD</span>
        </div>
      </div>
      <div className="grid grid-cols-[28px_minmax(128px,1fr)_42px_26px_30px_38px_44px] gap-1.5 border-y border-white/[0.07] px-1 py-1 text-[8px] font-semibold uppercase tracking-tighter text-slate-500">
        <span>POZ</span>
        <span>ZAWODNIK</span>
        <span className="text-right">KON</span>
        <span className="text-right">OC</span>
        <span className="text-right">G/A</span>
        <span className="text-right">STR</span>
        <span className="text-right">ZDARZ</span>
      </div>
      <div className="h-[calc(100%-58px)] overflow-y-auto px-2 py-2">
        <PlayerSection
          title="Pierwszy skład"
          players={onPitch}
          kit={kit}
          selectedOutId={selectedOutId}
          selectedInId={selectedInId}
          onPlayerContextMenu={isOwnTeam ? onPlayerContextMenu : undefined}
        />
        <PlayerSection
          title="Ławka"
          players={bench}
          kit={kit}
          selectedOutId={selectedOutId}
          selectedInId={selectedInId}
          onPlayerClick={isOwnTeam && selectedOutId ? onBenchPlayerClick : undefined}
        />
        <PlayerSection title="Zeszli / niedostępni" players={unavailable} kit={kit} selectedOutId={selectedOutId} selectedInId={selectedInId} />
      </div>
    </aside>
  );
};

export const CupV2MatchStatsStrip: React.FC<{ state: CupV2LiveUiState }> = ({ state }) => (
  <section className="bg-slate-950/48 px-3 py-2 backdrop-blur-sm">
    <div className="grid grid-cols-9 gap-2">
      {statRows.map(row => {
        const homeValue = state.stats.HOME[row.key];
        const awayValue = state.stats.AWAY[row.key];
        const total = Math.max(1, Number(homeValue) + Number(awayValue));
        const homePct = row.key === 'possession' ? Number(homeValue) : clamp((Number(homeValue) / total) * 100, 0, 100);
        return (
          <div key={row.key} className="min-w-0">
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter text-white">
              <span>{row.format ? row.format(Number(homeValue)) : homeValue}</span>
              <span className="truncate px-1 text-center text-[8px] text-slate-500">{row.label}</span>
              <span>{row.format ? row.format(Number(awayValue)) : awayValue}</span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="absolute left-0 top-0 h-full rounded-full bg-cyan-300" style={{ width: `${homePct}%` }} />
              <div className="absolute right-0 top-0 h-full rounded-full bg-rose-400" style={{ width: `${100 - homePct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  </section>
);


const selectClass = 'h-8 rounded-lg border border-white/10 bg-slate-950/86 px-2 text-[10px] font-black uppercase tracking-tighter text-white outline-none focus:border-cyan-300/70';

export const CupV2TacticsRailLeft: React.FC<{
  state: CupV2LiveUiState;
  selectedFormation: string;
  onFormationChange: (value: string) => void;
  onInstructionChange: <K extends keyof TacticalInstructions>(key: K, value: TacticalInstructions[K]) => void;
}> = ({ state, selectedFormation, onFormationChange, onInstructionChange }) => (
  <section className="min-h-0 overflow-y-auto space-y-3 rounded-2xl bg-slate-950/52 p-3 backdrop-blur-md">
    <div className="mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">
      <SlidersHorizontal size={13} /> Taktyka
    </div>
    <div>
      <label className="block text-[8px] font-bold uppercase tracking-tighter text-slate-400">Formacja
        <select value={selectedFormation} onChange={event => onFormationChange(event.target.value)} className={cx(selectClass, 'mt-1 w-full')}>
          {state.tactical.availableFormations.map(option => <option className="bg-slate-900 text-white" key={option.id} value={option.id}>{option.name}</option>)}
        </select>
      </label>
      <div className="mt-1 text-[9px] font-semibold uppercase tracking-tighter text-slate-400">Zmiany {state.tactical.substitutionsUsed}/{state.tactical.substitutionsLimit}</div>
    </div>
    <label className="block text-[8px] font-bold uppercase tracking-tighter text-slate-400">Nastawienie
      <select value={state.tactical.instructions.mindset} onChange={event => onInstructionChange('mindset', event.target.value as TacticalInstructions['mindset'])} className={cx(selectClass, 'mt-1 w-full')}>
        <option className="bg-slate-900 text-white" value="DEFENSIVE">Ostrożnie</option>
        <option className="bg-slate-900 text-white" value="NEUTRAL">Równo</option>
        <option className="bg-slate-900 text-white" value="OFFENSIVE">Atak</option>
      </select>
    </label>
    <label className="block text-[8px] font-bold uppercase tracking-tighter text-slate-400">Tempo
      <select value={state.tactical.instructions.tempo} onChange={event => onInstructionChange('tempo', event.target.value as TacticalInstructions['tempo'])} className={cx(selectClass, 'mt-1 w-full')}>
        <option className="bg-slate-900 text-white" value="SLOW">Wolne</option>
        <option className="bg-slate-900 text-white" value="NORMAL">Normal</option>
        <option className="bg-slate-900 text-white" value="FAST">Szybkie</option>
      </select>
    </label>
    <label className="block text-[8px] font-bold uppercase tracking-tighter text-slate-400">Intensywność
      <select value={state.tactical.instructions.intensity} onChange={event => onInstructionChange('intensity', event.target.value as TacticalInstructions['intensity'])} className={cx(selectClass, 'mt-1 w-full')}>
        <option className="bg-slate-900 text-white" value="CAUTIOUS">Niska</option>
        <option className="bg-slate-900 text-white" value="NORMAL">Normal</option>
        <option className="bg-slate-900 text-white" value="AGGRESSIVE">Wysoka</option>
      </select>
    </label>
    <label className="block text-[8px] font-bold uppercase tracking-tighter text-slate-400">Podania
      <select value={state.tactical.instructions.passing} onChange={event => onInstructionChange('passing', event.target.value as TacticalInstructions['passing'])} className={cx(selectClass, 'mt-1 w-full')}>
        <option className="bg-slate-900 text-white" value="SHORT">Krótkie</option>
        <option className="bg-slate-900 text-white" value="MIXED">Mix</option>
        <option className="bg-slate-900 text-white" value="LONG">Długie</option>
      </select>
    </label>
  </section>
);

export const CupV2TacticsRailRight: React.FC<{
  state: CupV2LiveUiState;
  onInstructionChange: <K extends keyof TacticalInstructions>(key: K, value: TacticalInstructions[K]) => void;
}> = ({ state, onInstructionChange }) => (
  <section className="min-h-0 overflow-y-auto space-y-3 rounded-2xl bg-slate-950/52 p-3 backdrop-blur-md">
    <div className="mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">
      <SlidersHorizontal size={13} /> Ustawienia
    </div>
    <label className="block text-[8px] font-bold uppercase tracking-tighter text-slate-400">Pressing
      <select value={state.tactical.instructions.pressing} onChange={event => onInstructionChange('pressing', event.target.value as TacticalInstructions['pressing'])} className={cx(selectClass, 'mt-1 w-full')}>
        <option className="bg-slate-900 text-white" value="NORMAL">Nie</option>
        <option className="bg-slate-900 text-white" value="PRESSING">Tak</option>
      </select>
    </label>
    <label className="block text-[8px] font-bold uppercase tracking-tighter text-slate-400">Kontra
      <select value={state.tactical.instructions.counterAttack ?? 'NORMAL'} onChange={event => onInstructionChange('counterAttack', event.target.value as TacticalInstructions['counterAttack'])} className={cx(selectClass, 'mt-1 w-full')}>
        <option className="bg-slate-900 text-white" value="NORMAL">Nie</option>
        <option className="bg-slate-900 text-white" value="COUNTER">Tak</option>
      </select>
    </label>
    <label className="block text-[8px] font-bold uppercase tracking-tighter text-slate-400">Krycie
      <select value={state.tactical.instructions.marking ?? 'ZONE'} onChange={event => onInstructionChange('marking', event.target.value as TacticalInstructions['marking'])} className={cx(selectClass, 'mt-1 w-full')}>
        <option className="bg-slate-900 text-white" value="ZONE">Strefa</option>
        <option className="bg-slate-900 text-white" value="MAN">Ind.</option>
        <option className="bg-slate-900 text-white" value="NONE">Luźne</option>
      </select>
    </label>
    <div className="mt-1 text-[8px] font-semibold uppercase tracking-tighter text-slate-500">
      PPM na zawodniku na boisku = polecenia indywidualne. Klik na zawodnika na boisku = zmiana.
    </div>
  </section>
);

const instructionAccent: Record<string, string> = {
  passing: '#38bdf8',
  tempo: '#facc15',
  mindset: '#fb7185',
  pressing: '#a78bfa',
  marking: '#34d399',
};

function playerInstructionGroup<K extends keyof PlayerLiveInstructions>(
  title: string,
  keyName: K,
  accent: string,
  instruction: PlayerLiveInstructions,
  options: Array<{ value: PlayerLiveInstructions[K] | null; label: string }>,
  onChange: (key: K, value: PlayerLiveInstructions[K] | null) => void,
) {
  return (
    <div className="space-y-1 rounded-[8px] border p-2" style={{ borderColor: `${accent}55`, background: `${accent}14` }}>
      <span className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: accent }}>{title}</span>
      <div className="grid grid-cols-2 gap-1">
        {options.map(option => {
          const active = (instruction[keyName] ?? null) === option.value;
          return (
            <button
              key={`${String(keyName)}-${option.value ?? 'auto'}`}
              type="button"
              onClick={() => onChange(keyName, option.value)}
              className={cx('h-7 rounded-[5px] px-1 text-[9px] font-bold uppercase tracking-tighter transition', active ? 'text-slate-950' : 'bg-white/[0.06] text-slate-200 hover:bg-white/[0.12]')}
              style={active ? { backgroundColor: accent } : undefined}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const CupV2PlayerInstructionMenu: React.FC<{
  x: number;
  y: number;
  player: Player;
  captainId: string | null;
  penaltyTakerId: string | null;
  freeKickTakerId: string | null;
  instruction: PlayerLiveInstructions;
  onRoleChange: (role: 'captain' | 'penalty' | 'freeKick', value: string) => void;
  onInstructionChange: <K extends keyof PlayerLiveInstructions>(key: K, value: PlayerLiveInstructions[K] | null) => void;
  onClear: () => void;
  onClose: () => void;
}> = ({ x, y, player, captainId, penaltyTakerId, freeKickTakerId, instruction, onRoleChange, onInstructionChange, onClear, onClose }) => {
  const menuWidth = 260;
  const left = typeof window === 'undefined' ? x : Math.max(12, Math.min(x, window.innerWidth - menuWidth - 12));
  const top = typeof window === 'undefined' ? y : Math.max(12, Math.min(y, window.innerHeight - 380));

  return (
    <>
      <div
        className="fixed inset-0 z-[1190]"
        onClick={onClose}
        onContextMenu={event => { event.preventDefault(); onClose(); }}
      />
      <div
        className="fixed z-[1200] w-[260px] rounded-[10px] border border-white/15 bg-slate-950/97 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl"
        style={{ left, top }}
        onClick={event => event.stopPropagation()}
        onContextMenu={event => event.preventDefault()}
      >
        <div className="mb-2 border-b border-white/10 pb-2">
          <span className="block truncate text-[12px] font-bold uppercase tracking-tighter text-white">{player.firstName.charAt(0)}. {player.lastName}</span>
          <span className="text-[8px] font-semibold uppercase tracking-tighter text-slate-400">Instrukcje indywidualne</span>
        </div>
        <div className="mb-2 grid grid-cols-3 gap-1">
          <button type="button" onClick={() => onRoleChange('captain', captainId === player.id ? '' : player.id)} className={cx('flex items-center justify-center gap-0.5 rounded-[5px] px-1 py-1.5 text-[9px] font-bold uppercase tracking-tighter', captainId === player.id ? 'bg-yellow-300 text-slate-950' : 'bg-white/[0.06] text-slate-300')}>
            {captainId === player.id && <Check size={10} />} C
          </button>
          <button type="button" onClick={() => onRoleChange('penalty', penaltyTakerId === player.id ? '' : player.id)} className={cx('flex items-center justify-center gap-0.5 rounded-[5px] px-1 py-1.5 text-[9px] font-bold uppercase tracking-tighter', penaltyTakerId === player.id ? 'bg-emerald-300 text-slate-950' : 'bg-white/[0.06] text-slate-300')}>
            {penaltyTakerId === player.id && <Check size={10} />} PK
          </button>
          <button type="button" onClick={() => onRoleChange('freeKick', freeKickTakerId === player.id ? '' : player.id)} className={cx('flex items-center justify-center gap-0.5 rounded-[5px] px-1 py-1.5 text-[9px] font-bold uppercase tracking-tighter', freeKickTakerId === player.id ? 'bg-sky-300 text-slate-950' : 'bg-white/[0.06] text-slate-300')}>
            {freeKickTakerId === player.id && <Check size={10} />} FK
          </button>
        </div>
        <div className="space-y-2">
          {playerInstructionGroup('Podania', 'passing', instructionAccent.passing, instruction, [
            { value: null, label: 'Drużynowo' },
            { value: 'SHORT', label: 'Krótkie' },
            { value: 'MIXED', label: 'Mieszane' },
            { value: 'LONG', label: 'Długie' },
          ], onInstructionChange)}
          {playerInstructionGroup('Tempo', 'tempo', instructionAccent.tempo, instruction, [
            { value: null, label: 'Drużynowo' },
            { value: 'SLOW', label: 'Wolniej' },
            { value: 'NORMAL', label: 'Normalnie' },
            { value: 'FAST', label: 'Szybciej' },
          ], onInstructionChange)}
          {playerInstructionGroup('Nastawienie', 'mindset', instructionAccent.mindset, instruction, [
            { value: null, label: 'Drużynowo' },
            { value: 'DEFENSIVE', label: 'Ostrożnie' },
            { value: 'NEUTRAL', label: 'Neutralnie' },
            { value: 'OFFENSIVE', label: 'Atakuj' },
          ], onInstructionChange)}
          {playerInstructionGroup('Pressing', 'pressing', instructionAccent.pressing, instruction, [
            { value: null, label: 'Drużynowo' },
            { value: 'NORMAL', label: 'Nie' },
            { value: 'PRESSING', label: 'Tak' },
          ], onInstructionChange)}
          {playerInstructionGroup('Krycie', 'marking', instructionAccent.marking, instruction, [
            { value: null, label: 'Drużynowo' },
            { value: 'ZONE', label: 'Strefa' },
            { value: 'MAN', label: 'Ind.' },
            { value: 'NONE', label: 'Luźne' },
          ], onInstructionChange)}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="mt-2 w-full rounded-lg bg-white/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-tighter text-slate-200 transition hover:bg-white/[0.12]"
        >
          Wyczyść instrukcje
        </button>
      </div>
    </>
  );
};

export const CupV2PlaybackControls: React.FC<{
  isPaused: boolean;
  speed: number;
  isFinished: boolean;
  onTogglePause: () => void;
  onSpeed: (speed: number) => void;
  onSkip: () => void;
  onFinish: () => void;
}> = ({ isPaused, speed, isFinished, onTogglePause, onSpeed, onSkip, onFinish }) => (
  <div className="flex items-center justify-end gap-2">
    <button onClick={onTogglePause} disabled={isFinished} className="flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-[10px] font-black uppercase tracking-tighter text-slate-950 transition hover:bg-slate-200 disabled:opacity-40">
      {isPaused ? <Play size={14} /> : <Pause size={14} />}
      {isPaused ? 'Wznów' : 'Pauza'}
    </button>
    {[1, 2, 4].map(item => (
      <button key={item} onClick={() => onSpeed(item)} className={cx('flex h-9 items-center gap-1.5 rounded-lg px-3 text-[10px] font-black uppercase tracking-tighter transition', speed === item ? 'bg-cyan-300 text-slate-950' : 'bg-white/[0.07] text-slate-200 hover:bg-white/[0.12]')}>
        <FastForward size={13} /> x{item}
      </button>
    ))}
    <button onClick={onSkip} disabled={isFinished} className="flex h-9 items-center gap-1.5 rounded-lg bg-white/[0.07] px-3 text-[10px] font-black uppercase tracking-tighter text-slate-200 transition hover:bg-white/[0.12] disabled:opacity-40">
      <SkipForward size={14} /> +5'
    </button>
    <button onClick={onFinish} disabled={!isFinished} className="flex h-9 items-center gap-1.5 rounded-lg bg-rose-500/22 px-4 text-[10px] font-black uppercase tracking-tighter text-rose-100 transition hover:bg-rose-500/32 disabled:opacity-40">
      <RotateCcw size={14} /> Zakończ mecz
    </button>
  </div>
);
