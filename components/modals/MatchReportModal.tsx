
import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import { PlayerPosition, Player } from '../../types';
import { TacticRepository } from '../../resources/tactics_db';
import { KitSelectionService } from '../../services/KitSelectionService';
import bojo2Pitch from '../../Graphic/themes/bojo2.png';

interface MatchReportModalProps {
  matchId: string | null;
  onClose: () => void;
}

const GLASS_PANEL = "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]";

const GOALKEEPER_KIT_POOL = ['#facc15', '#fb923c', '#f472b6', '#881337', '#dc2626', '#16a34a'];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const pickGoalkeeperColor = (seed: string, blocked: string[]): string => {
  const viable = GOALKEEPER_KIT_POOL.filter(c =>
    blocked.every(b => KitSelectionService.getColorDistance(c, b) > 120)
  );
  const pool = viable.length > 0 ? viable : GOALKEEPER_KIT_POOL;
  return pool[hashString(seed) % pool.length];
};

const getContrastText = (bgHex: string, secondaryHex: string): string => {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return { r, g, b };
  };
  const lum = ({ r, g, b }: { r: number; g: number; b: number }) => 0.299 * r + 0.587 * g + 0.114 * b;
  const bgL = lum(parse(bgHex));
  const secL = lum(parse(secondaryHex));
  if (Math.abs(bgL - secL) > 60) return secondaryHex;
  return bgL > 128 ? '#000000' : '#ffffff';
};

const getPitchSlotTop = (isHome: boolean, slotY: number): string =>
  `${isHome ? 55 + slotY * 32 : 45 - slotY * 32}%`;

const PitchKit: React.FC<{
  player?: Player | null;
  left: string;
  top: string;
  primary: string;
  secondary: string;
  trim: string;
  isMom?: boolean;
}> = ({ player, left, top, primary, secondary, trim, isMom }) => {
  const shirtText = getContrastText(primary, secondary);
  const label = player ? `${player.firstName.charAt(0)}. ${player.lastName}` : '?';
  return (
    <div
      className="absolute z-20 flex flex-col items-center gap-0"
      style={{ left, top, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 24 24" className={`w-[28px] h-[28px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] ${isMom ? 'filter drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]' : ''}`}>
          <path d="M7 2L2 5v4l3 1v10h14V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={primary} />
          <path d="M12 4L10 6L12 8L14 6L12 4Z" fill={secondary} fillOpacity="0.9" />
          <path d="M7 2L2 5v4l3 1V6.5L8.3 5l1.7 2.3h4L15.7 5 19 6.5V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={secondary} fillOpacity="0.35" />
          <path d="M12 7.2v11.8" stroke={trim} strokeWidth="1" strokeOpacity="0.8" />
          {isMom && <circle cx="12" cy="2.5" r="2" fill="#fbbf24" />}
        </svg>
        <svg viewBox="0 0 28 18" className="-mt-0.5 w-[14px] h-[8px] drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]">
          <path d="M4 2h20l2 4-3 10H16l-2-6-2 6H5L2 6z" fill={secondary} stroke={trim} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M14 3v12" stroke={trim} strokeWidth="0.8" strokeOpacity="0.7" />
        </svg>
      </div>
      <div className={`mt-[2px] max-w-[64px] rounded border px-[3px] py-[1px] text-center shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${isMom ? 'bg-amber-500/90 border-amber-300' : 'bg-black/85 border-white/10'}`}>
        <span className={`block truncate text-[6.5px] font-black uppercase tracking-[0.1em] ${isMom ? 'text-black' : 'text-white'}`}>
          {label}
        </span>
      </div>
    </div>
  );
};

const getCompetitionName = (comp: string) => {
  if (comp.includes('L_PL_1')) return 'Ekstraklasa';
  if (comp.includes('L_PL_2')) return '1. Liga';
  if (comp.includes('L_PL_3')) return '2. Liga';
  if (comp === 'UEFA_SUPER_CUP') return 'Superpuchar Europy';
  if (comp.includes('CUP')) return 'Puchar Polski';
  if (comp.includes('SUPER')) return 'Superpuchar';
  return comp;
};

const POSITION_ORDER: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

export const MatchReportModal: React.FC<MatchReportModalProps> = ({ matchId, onClose }) => {
  const { clubs, players } = useGame();

  const match = useMemo(
    () => (matchId ? MatchHistoryService.getAll().find(m => m.matchId === matchId) ?? null : null),
    [matchId]
  );

  const homeClub = useMemo(
    () => (match ? clubs.find(c => c.id === match.homeTeamId) ?? null : null),
    [match, clubs]
  );

  const awayClub = useMemo(
    () => (match ? clubs.find(c => c.id === match.awayTeamId) ?? null : null),
    [match, clubs]
  );

  const homePlayers = useMemo(
    () => (homeClub ? players[homeClub.id] ?? [] : []),
    [homeClub, players]
  );

  const awayPlayers = useMemo(
    () => (awayClub ? players[awayClub.id] ?? [] : []),
    [awayClub, players]
  );

  const motmId = useMemo(() => {
    if (!match?.ratings) return null;
    let bestId: string | null = null;
    let bestRating = 0;
    Object.entries(match.ratings).forEach(([id, r]) => {
      if (r > bestRating) { bestRating = r; bestId = id; }
    });
    return bestId;
  }, [match]);

  if (!matchId || !match || !homeClub || !awayClub) return null;

  // Buduje chronologiczną listę zdarzeń dla drużyny (gole + kartki razem po minucie)
  const buildEvents = (teamId: string) => {
    const events: { minute: number; icon: string; name: string; extra?: string }[] = [];

    match.goals
      .filter(g => g.teamId === teamId && !g.isMiss && !g.varDisallowed)
      .forEach(g => events.push({
        minute: g.minute,
        icon: '⚽',
        name: g.playerName,
        extra: g.isPenalty ? '(k)' : undefined
      }));

    match.cards
      .filter(c => c.teamId === teamId)
      .forEach(c => events.push({
        minute: c.minute,
        icon: c.type === 'YELLOW' ? '🟨' : '🟥',
        name: c.playerName
      }));

    return events.sort((a, b) => a.minute - b.minute);
  };

  const homeEvents = buildEvents(homeClub.id);
  const awayEvents = buildEvents(awayClub.id);

  const renderColorKit = (colors: string[], rotate?: string) => (
    <div className={`w-14 h-14 rounded-xl flex flex-col overflow-hidden border-2 border-white/20 shadow-xl shrink-0 ${rotate || ''}`}>
      <div style={{ backgroundColor: colors[0] }} className="flex-1" />
      <div style={{ backgroundColor: colors[1] || colors[0] }} className="flex-1" />
    </div>
  );

  const renderTeamEvents = (events: ReturnType<typeof buildEvents>, align: 'left' | 'right') => (
    <div className={`flex flex-wrap gap-x-4 gap-y-0.5 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      {events.map((e, i) => (
        <span key={i} className="text-[10px] font-black text-white uppercase italic whitespace-nowrap">
          {align === 'right'
            ? <>{e.name}{e.extra ? ` ${e.extra}` : ''} {e.minute}' {e.icon}</>
            : <>{e.icon} {e.minute}' {e.name}{e.extra ? ` ${e.extra}` : ''}</>
          }
        </span>
      ))}
    </div>
  );

  const renderLineup = (side: 'home' | 'away') => {
    const lineupIds = side === 'home' ? (match.homeLineup ?? []) : (match.awayLineup ?? []);
    const teamPlayers = side === 'home' ? homePlayers : awayPlayers;
    const clubId = side === 'home' ? homeClub.id : awayClub.id;
    const subs = match.substitutions?.filter(s => s.teamId === clubId) ?? [];
    const injuries = match.injuries?.filter(i => i.teamId === clubId) ?? [];

    if (lineupIds.length === 0) {
      return (
        <div className="flex items-center justify-center opacity-30 py-8">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Brak danych składu</span>
        </div>
      );
    }

    const sorted = lineupIds
      .map(id => teamPlayers.find(p => p.id === id))
      .filter(Boolean)
      .sort((a, b) => (POSITION_ORDER[a!.position] ?? 9) - (POSITION_ORDER[b!.position] ?? 9));

    return (
      <div className="space-y-[2px]">
        {sorted.map(player => {
          if (!player) return null;
          const rating = match.ratings?.[player.id];
          const isMOTM = motmId === player.id;
          const playerGoals = match.goals.filter(g => g.playerId === player.id && !g.isMiss && !g.varDisallowed);
          const yellowCards = match.cards.filter(c => c.playerId === player.id && c.type === 'YELLOW');
          const redCard = match.cards.find(c => c.playerId === player.id && (c.type === 'RED' || c.type === 'SECOND_YELLOW'));
          const injury = injuries.find(i => i.playerId === player.id);
          const subOut = subs.find(s => s.playerOutId === player.id);
          const subIn = subs.find(s => s.playerInId === player.id);
          const displayName = `${player.firstName.charAt(0)}. ${player.lastName}`;

          const isRedCarded = !!redCard;

          return (
            <div
              key={player.id}
              className={`flex items-center gap-1.5 px-1.5 py-[4px] rounded-md transition-all ${
                isMOTM
                  ? 'bg-amber-500/15 border border-amber-500/30'
                  : isRedCarded
                    ? 'bg-red-900/10 border border-red-900/20 opacity-50'
                    : 'border border-transparent hover:bg-white/5'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-black shrink-0 border ${
                player.position === PlayerPosition.GK ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : player.position === PlayerPosition.DEF ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : player.position === PlayerPosition.MID ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/20 border-red-500/40 text-red-300'
              }`}>
                {player.position}
              </div>

              <span className={`flex-1 text-[9px] font-bold uppercase truncate ${
                isMOTM ? 'text-amber-300' : isRedCarded ? 'text-slate-500 line-through' : 'text-slate-200'
              }`}>
                {displayName}
              </span>

              <div className="flex items-center gap-0.5 shrink-0">
                {isMOTM && <span className="text-amber-400 text-[9px]">⭐</span>}
                {playerGoals.map((g, i) => (
                  <span key={i} title={`Gol ${g.minute}'`} className="text-[9px]">⚽</span>
                ))}
                {yellowCards.map((c, i) => (
                  <span key={i} title={`Żółta ${c.minute}'`} className="text-[9px]">🟨</span>
                ))}
                {redCard && <span title={`Czerwona ${redCard.minute}'`} className="text-[9px]">🟥</span>}
                {injury && <span title={`Kontuzja ${injury.minute}'`} className="text-[8px] font-black text-red-400">✚</span>}
                {subOut && <span title={`Zmiana wyj. ${subOut.minute}'`} className="text-[7px] text-slate-500">↓{subOut.minute}'</span>}
                {subIn && <span title={`Wejście ${subIn.minute}'`} className="text-[7px] text-emerald-400">↑{subIn.minute}'</span>}
              </div>

              {rating !== undefined ? (
                <div className={`w-7 h-6 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${isMOTM ? 'bg-amber-500 text-black' : 'bg-black/40 text-white border border-white/10'}`}>
                  {rating.toFixed(1)}
                </div>
              ) : (
                <div className="w-7 h-6 rounded flex items-center justify-center text-[9px] font-black shrink-0 bg-black/20 text-slate-600 border border-white/5">
                  –
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderPitch = () => {
    const homeTactic = match.homeTacticId ? TacticRepository.getById(match.homeTacticId) : null;
    const awayTactic = match.awayTacticId ? TacticRepository.getById(match.awayTacticId) : null;

    const homeXI = (match.homeLineup ?? [])
      .map(id => homePlayers.find(p => p.id === id) ?? null);
    const awayXI = (match.awayLineup ?? [])
      .map(id => awayPlayers.find(p => p.id === id) ?? null);

    const homePrimary = homeClub.colorsHex[0] ?? '#1d4ed8';
    const homeSecondary = homeClub.colorsHex[1] ?? homeClub.colorsHex[0] ?? '#93c5fd';
    const awayPrimary = awayClub.colorsHex[0] ?? '#dc2626';
    const awaySecondary = awayClub.colorsHex[1] ?? awayClub.colorsHex[0] ?? '#fca5a5';

    const homeGKColor = pickGoalkeeperColor(`${homeClub.id}-gk`, [homePrimary, homeSecondary, awayPrimary, awaySecondary]);
    const awayGKColor = pickGoalkeeperColor(`${awayClub.id}-gk`, [homePrimary, homeSecondary, awayPrimary, awaySecondary]);

    const homeFormation = homeTactic?.name ?? '–';
    const awayFormation = awayTactic?.name ?? '–';

    return (
      <div className="flex flex-col items-center gap-1 h-full">
        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest shrink-0">{homeFormation}</span>
        <div className="relative w-full flex-1 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <img src={bojo2Pitch} alt="boisko" className="absolute inset-0 w-full h-full object-fill" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none" />
          <div className="absolute inset-0">
            {homeTactic && homeTactic.slots.map((slot, i) => {
              const player = homeXI[i] ?? null;
              const isGK = slot.role === PlayerPosition.GK;
              const primary = isGK ? homeGKColor : homePrimary;
              const secondary = isGK ? '#111827' : homeSecondary;
              const trim = getContrastText(primary, secondary);
              return (
                <PitchKit
                  key={`h-${i}`}
                  player={player}
                  isMom={!!player && motmId === player.id}
                  left={`${slot.x * 100}%`}
                  top={
                    isGK
                      ? `calc(${getPitchSlotTop(true, slot.y)} + 40px)`
                      : slot.role === PlayerPosition.DEF
                        ? `calc(${getPitchSlotTop(true, slot.y)} + 25px)`
                        : slot.role === PlayerPosition.MID
                          ? `calc(${getPitchSlotTop(true, slot.y)} - 5px)`
                          : `calc(${getPitchSlotTop(true, slot.y)} - 30px)`
                  }
                  primary={primary}
                  secondary={secondary}
                  trim={trim}
                />
              );
            })}

            {awayTactic && awayTactic.slots.map((slot, i) => {
              const player = awayXI[i] ?? null;
              const isGK = slot.role === PlayerPosition.GK;
              const primary = isGK ? awayGKColor : awayPrimary;
              const secondary = isGK ? '#111827' : awaySecondary;
              const trim = getContrastText(primary, secondary);
              return (
                <PitchKit
                  key={`a-${i}`}
                  player={player}
                  isMom={!!player && motmId === player.id}
                  left={`${slot.x * 100}%`}
                  top={
                    isGK
                      ? `calc(${getPitchSlotTop(false, slot.y)} - 40px)`
                      : slot.role === PlayerPosition.DEF
                        ? `calc(${getPitchSlotTop(false, slot.y)} - 23px)`
                        : slot.role === PlayerPosition.MID
                          ? `calc(${getPitchSlotTop(false, slot.y)} + 5px)`
                          : `calc(${getPitchSlotTop(false, slot.y)} + 30px)`
                  }
                  primary={primary}
                  secondary={secondary}
                  trim={trim}
                />
              );
            })}
          </div>
        </div>
        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest shrink-0">{awayFormation}</span>
      </div>
    );
  };

  const weatherText = match.weather
    ? `${match.weather.description} ${match.weather.tempC}°C`
    : '–';

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`${GLASS_PANEL} w-full max-w-6xl max-h-[92vh] rounded-[40px] flex flex-col overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white/5 border-b border-white/5 px-8 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black italic text-white uppercase tracking-tighter">Raport Meczowy</h2>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">{getCompetitionName(match.competition)} · {match.date}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Match conditions row */}
          <div className="px-8 py-3 flex items-center gap-6 border-b border-white/5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Stadion</span>
              <span className="text-[10px] font-black text-slate-300 uppercase italic">{match.venue || homeClub.stadiumName}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Widzów</span>
              <span className="text-[10px] font-black text-emerald-400 tabular-nums">{match.attendance?.toLocaleString() ?? '–'}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Pogoda</span>
              <span className="text-[10px] font-black text-slate-300">{weatherText}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Sędzia</span>
              <span className="text-[10px] font-black text-slate-300 uppercase italic">{match.refereeName ?? '–'}</span>
            </div>
          </div>

          {/* Score panel — nazwy druzyn wyrownane, wynik bez tla */}
          <div className="px-8 pt-5 pb-3">
            {/* Row 1: kity + nazwy + wynik (zawsze wyrownane) */}
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                <span className="text-2xl font-black italic text-white uppercase tracking-tighter text-right leading-none truncate">{homeClub.name}</span>
                {renderColorKit(homeClub.colorsHex, '-rotate-3')}
              </div>

              <div className="flex flex-col items-center shrink-0 gap-1">
                <span className="text-6xl font-black text-white tabular-nums tracking-tight">
                  {match.homeScore} <span className="text-slate-600">:</span> {match.awayScore}
                </span>
                {match.isExtraTime && (
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Po dogrywce</span>
                )}
                {match.homePenaltyScore !== undefined && (
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Karne: {match.homePenaltyScore} – {match.awayPenaltyScore}
                  </span>
                )}
              </div>

              <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
                {renderColorKit(awayClub.colorsHex, 'rotate-3')}
                <span className="text-2xl font-black italic text-white uppercase tracking-tighter text-left leading-none truncate">{awayClub.name}</span>
              </div>
            </div>

            {/* Row 2: wydarzenia chronologiczne (nie przesuwaja nazw) */}
            <div className="flex items-start gap-4 mt-2">
              <div className="flex-1 flex justify-end">
                {renderTeamEvents(homeEvents, 'right')}
              </div>
              <div className="shrink-0" style={{ minWidth: '180px' }} />
              <div className="flex-1 flex justify-start">
                {renderTeamEvents(awayEvents, 'left')}
              </div>
            </div>
          </div>

          {/* Lineup + Pitch + Lineup */}
          <div className="px-8 pb-6 grid gap-3" style={{ gridTemplateColumns: '200px 1fr 200px' }}>
            <div className={`${GLASS_PANEL} rounded-[20px] p-3`}>
              <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 text-center">
                {homeClub.shortName}
              </h3>
              {renderLineup('home')}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ minHeight: '420px' }}>
              {renderPitch()}
            </div>

            <div className={`${GLASS_PANEL} rounded-[20px] p-3`}>
              <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 text-center">
                {awayClub.shortName}
              </h3>
              {renderLineup('away')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
