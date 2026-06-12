import React, { useMemo } from 'react';
import { useModalClose } from '../ui/useModalClose';
import { AiFriendlyMatchReport, PlayerPosition, InjurySeverity, Player } from '../../types';
import { useGame } from '../../context/GameContext';
import { KitSelectionService } from '../../services/KitSelectionService';
import { TacticRepository } from '../../resources/tactics_db';
import bojo2Pitch from '../../Graphic/themes/bojo2.png';

interface Props {
  report: AiFriendlyMatchReport;
  onClose: () => void;
}

const GOALKEEPER_KIT_POOL = ['#facc15','#16a34a','#f97316','#881337','#0891b2','#1d4ed8','#111111','#f5f0dc'];

const pickGoalkeeperColor = (blocked: string[]): string => {
  const scored = GOALKEEPER_KIT_POOL.map(c => ({
    color: c,
    minDist: Math.min(...blocked.map(b => KitSelectionService.getColorDistance(c, b)))
  }));
  scored.sort((a, b) => b.minDist - a.minDist);
  return scored[0].color;
};

const getContrastText = (bgHex: string, secondaryHex: string): string => {
  const parse = (hex: string) => { const h = hex.replace('#', ''); return { r: parseInt(h.substring(0,2),16), g: parseInt(h.substring(2,4),16), b: parseInt(h.substring(4,6),16) }; };
  const lum = ({ r, g, b }: { r:number; g:number; b:number }) => 0.299*r + 0.587*g + 0.114*b;
  const bgL = lum(parse(bgHex)); const secL = lum(parse(secondaryHex));
  if (Math.abs(bgL - secL) > 60) return secondaryHex;
  return bgL > 128 ? '#000000' : '#ffffff';
};

const PitchKit: React.FC<{ player?: Player | null; left: string; top: string; primary: string; secondary: string; trim: string; isRedCarded?: boolean; }> = ({ player, left, top, primary, secondary, trim, isRedCarded }) => {
  if (!player) return null;
  const label = `${player.firstName.charAt(0)}. ${player.lastName}`;
  return (
    <div className="absolute z-20 flex flex-col items-center gap-0" style={{ left, top, transform: 'translate(-50%, -50%)', filter: isRedCarded ? 'grayscale(1)' : undefined, opacity: isRedCarded ? 0.35 : undefined }}>
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 24 24" className="w-[38px] h-[38px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          <path d="M7 2L2 5v4l3 1v10h14V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={primary} />
          <path d="M12 4L10 6L12 8L14 6L12 4Z" fill={secondary} fillOpacity="0.9" />
          <path d="M7 2L2 5v4l3 1V6.5L8.3 5l1.7 2.3h4L15.7 5 19 6.5V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={secondary} fillOpacity="0.35" />
          <path d="M12 7.2v11.8" stroke={trim} strokeWidth="1" strokeOpacity="0.8" />
        </svg>
        <svg viewBox="0 0 28 18" className="-mt-0.5 w-[19px] h-[11px] drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]">
          <path d="M4 2h20l2 4-3 10H16l-2-6-2 6H5L2 6z" fill={secondary} stroke={trim} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M14 3v12" stroke={trim} strokeWidth="0.8" strokeOpacity="0.7" />
        </svg>
      </div>
      <div className="mt-[2px] max-w-[86px] rounded border border-white/10 px-[3px] py-[1px] text-center bg-black/85 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
        <span className="block truncate text-[9px] font-black uppercase tracking-[0.1em] text-white not-italic">{label}</span>
      </div>
    </div>
  );
};

const getPitchSlotTop = (isHome: boolean, slotY: number): string =>
  `${isHome ? 55 + slotY * 32 : 45 - slotY * 32}%`;

function calcAttendance(homeRep: number, awayRep: number, pairId: string): number {
  const seed = pairId.split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) | 0, 0);
  const noise = Math.abs(seed) % 200;
  const repComponent = Math.min(300, (homeRep + awayRep) * 8);
  return Math.min(500, Math.max(50, 50 + noise + repComponent));
}

const POS_ORDER: Partial<Record<string, number>> = {
  [PlayerPosition.GK]: 0,
  [PlayerPosition.DEF]: 1,
  [PlayerPosition.MID]: 2,
  [PlayerPosition.FWD]: 3,
};

export const AiFriendlyMatchDetailModal: React.FC<Props> = ({ report, onClose }) => {
  const { closeModal, exitClass } = useModalClose(onClose);
  const { clubs, players } = useGame();

  const homeClub = clubs.find(c => c.id === report.homeTeamId);
  const awayClub = clubs.find(c => c.id === report.awayTeamId);

  const homePlayers = players[report.homeTeamId] || [];
  const awayPlayers = players[report.awayTeamId] || [];
  const allPlayersFlat = [...homePlayers, ...awayPlayers];

  const getPlayer = (id: string) => allPlayersFlat.find(p => p.id === id);

  const attendance = useMemo(() =>
    calcAttendance(homeClub?.reputation ?? 5, awayClub?.reputation ?? 5, report.pairId),
    [homeClub, awayClub, report.pairId]
  );

  const homeGoals = report.scorers.filter(s => s.teamId === report.homeTeamId && !s.isMiss);
  const awayGoals = report.scorers.filter(s => s.teamId === report.awayTeamId && !s.isMiss);
  const homeRedCards = report.cards.filter(c => c.teamId === report.homeTeamId && c.type === 'RED_CARD');
  const awayRedCards = report.cards.filter(c => c.teamId === report.awayTeamId && c.type === 'RED_CARD');
  const homeSevereInjuries = report.injuries.filter(i => i.teamId === report.homeTeamId && i.severity === InjurySeverity.SEVERE);
  const awaySevereInjuries = report.injuries.filter(i => i.teamId === report.awayTeamId && i.severity === InjurySeverity.SEVERE);

  const subsOutIds = new Set(report.substitutions.map(s => s.playerOutId));
  const subsInIds = new Set(report.substitutions.map(s => s.playerInId));

  const kits = homeClub && awayClub ? KitSelectionService.selectOptimalKits(homeClub, awayClub) : null;
  const homePrimary = kits?.home.primary ?? '#1a3a6e';
  const homeSecondary = kits?.home.secondary ?? '#ffffff';
  const awayPrimary = kits?.away.primary ?? '#c0392b';
  const awaySecondary = kits?.away.secondary ?? '#ffffff';
  const homeGKColor = kits ? pickGoalkeeperColor([homePrimary, homeSecondary, awayPrimary, awaySecondary]) : '#facc15';
  const awayGKColor = kits ? pickGoalkeeperColor([homePrimary, homeSecondary, awayPrimary, awaySecondary, homeGKColor]) : '#16a34a';

  const sortByPosition = (ids: string[]) =>
    [...ids].sort((a, b) => {
      const pa = getPlayer(a);
      const pb = getPlayer(b);
      return (POS_ORDER[pa?.position ?? ''] ?? 2) - (POS_ORDER[pb?.position ?? ''] ?? 2);
    });

  const homeAllIds = Object.keys(report.ratings).filter(id => homePlayers.some(p => p.id === id));
  const homeFinalXI = sortByPosition(homeAllIds.filter(id => !subsOutIds.has(id)));
  const homeSubsOff = sortByPosition(homeAllIds.filter(id => subsOutIds.has(id)));

  const awayAllIds = Object.keys(report.ratings).filter(id => awayPlayers.some(p => p.id === id));
  const awayFinalXI = sortByPosition(awayAllIds.filter(id => !subsOutIds.has(id)));
  const awaySubsOff = sortByPosition(awayAllIds.filter(id => subsOutIds.has(id)));

  const homeTactic = TacticRepository.getById(report.homeTacticId);
  const awayTactic = TacticRepository.getById(report.awayTacticId);

  const events = [
    ...report.scorers.map(s => ({ kind: 'GOAL' as const, minute: s.minute, data: s })),
    ...report.cards.map(c => ({ kind: 'CARD' as const, minute: c.minute, data: c })),
    ...report.substitutions.map(s => ({ kind: 'SUB' as const, minute: s.minute, data: s })),
    ...report.injuries.map(i => ({ kind: 'INJURY' as const, minute: i.minute, data: i })),
  ].sort((a, b) => a.minute - b.minute);

  const matchDate = report.date instanceof Date ? report.date : new Date(report.date);
  const dateStr = matchDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

  const playerGoals = (playerId: string, teamId: string) =>
    report.scorers.filter(s => s.playerId === playerId && s.teamId === teamId && !s.isMiss).length;
  const playerAssists = (playerId: string) =>
    report.scorers.filter(s => s.assistId === playerId && !s.isMiss).length;
  const playerCardsFor = (playerId: string) =>
    report.cards.filter(c => c.playerId === playerId);

  const shortName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length < 2) return fullName;
    return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
  };

  const getRatingColor = (r: number) => {
    if (r >= 7.5) return 'text-emerald-400';
    if (r >= 6.5) return 'text-amber-400';
    if (r >= 5.0) return 'text-slate-300';
    return 'text-rose-400';
  };

  const renderPlayerRow = (id: string, teamId: string, dimmed = false) => {
    const p = getPlayer(id);
    const rating = report.ratings[id];
    const goals = playerGoals(id, teamId);
    const assists = playerAssists(id);
    const pCards = playerCardsFor(id);
    const isSubIn = subsInIds.has(id);
    const isSubOut = subsOutIds.has(id);
    return (
      <div key={id} className={`flex items-center gap-1.5 px-2 py-1.5 border-b border-white/[0.06] ${dimmed ? 'opacity-40' : ''}`}>
        {isSubIn && <span className="text-[10px] text-emerald-400 shrink-0 font-black">↑</span>}
        {isSubOut && <span className="text-[10px] text-rose-400 shrink-0 font-black">↓</span>}
        {!isSubIn && !isSubOut && <span className="w-[10px] shrink-0" />}
        <span className="text-[8px] text-slate-600 w-6 shrink-0">{p?.position ?? '?'}</span>
        <span className="flex-1 text-sm text-slate-300 truncate">
          {p ? `${p.firstName[0]}. ${p.lastName}` : id}
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          {goals > 0 && <span className="text-[8px]">⚽{goals > 1 ? `×${goals}` : ''}</span>}
          {assists > 0 && <span className="text-[8px] text-sky-400 font-black">A</span>}
          {pCards.map((c, i) => (
            <span key={i} className="text-[8px]">{c.type === 'YELLOW_CARD' ? '🟨' : '🟥'}</span>
          ))}
        </div>
        {rating !== undefined && (
          <span className={`text-[10px] font-black w-7 text-right shrink-0 ${getRatingColor(rating)}`}>{rating.toFixed(1)}</span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-[1100] flex items-center justify-center p-4 ${exitClass}`}
      onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
    >
      <div className="relative w-full max-w-[76vw] max-h-[90vh] bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col font-black italic uppercase tracking-tighter">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 shrink-0">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-green-400">Sparing — Raport</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{dateStr}</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Score panel */}
        <div className="shrink-0 flex items-center justify-between gap-6 px-6 py-8 border-b border-white/5">

          {/* Home */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {homeClub?.logoFile
              ? <img src={new URL(`../../Graphic/logo/${homeClub.logoFile}`, import.meta.url).href} alt="" className="w-20 h-20 object-contain shrink-0" />
              : <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex flex-col shrink-0">
                  <div className="flex-1" style={{ backgroundColor: homeClub?.colorsHex[0] ?? '#555' }} />
                  <div className="flex-1" style={{ backgroundColor: homeClub?.colorsHex[1] ?? homeClub?.colorsHex[0] ?? '#333' }} />
                </div>
            }
            <div className="min-w-0">
              <div className="text-4xl font-black uppercase italic tracking-tighter text-white leading-tight whitespace-nowrap">{homeClub?.name ?? report.homeTeamId}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                {homeGoals.map((s, i) => (
                  <span key={i} className="text-[10px] text-slate-300">⚽ {shortName(s.playerName)} {s.minute}'{s.isPenalty ? ' (k.)' : ''}</span>
                ))}
                {homeRedCards.map((c, i) => (
                  <span key={i} className="text-[10px] text-rose-400">🟥 {shortName(c.playerName)} {c.minute}'</span>
                ))}
                {homeSevereInjuries.map((inj, i) => (
                  <span key={i} className="text-[10px] text-orange-400">🩹 {shortName(inj.playerName)}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="text-6xl font-black tabular-nums text-white leading-none tracking-tight">
              {report.homeScore}–{report.awayScore}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">+{report.extraTime}'</div>
          </div>

          {/* Away */}
          <div className="flex items-center gap-4 flex-1 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <div className="text-4xl font-black uppercase italic tracking-tighter text-white leading-tight whitespace-nowrap">{awayClub?.name ?? report.awayTeamId}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 justify-end">
                {awayGoals.map((s, i) => (
                  <span key={i} className="text-[10px] text-slate-300">⚽ {shortName(s.playerName)} {s.minute}'{s.isPenalty ? ' (k.)' : ''}</span>
                ))}
                {awayRedCards.map((c, i) => (
                  <span key={i} className="text-[10px] text-rose-400">🟥 {shortName(c.playerName)} {c.minute}'</span>
                ))}
                {awaySevereInjuries.map((inj, i) => (
                  <span key={i} className="text-[10px] text-orange-400">🩹 {shortName(inj.playerName)}</span>
                ))}
              </div>
            </div>
            {awayClub?.logoFile
              ? <img src={new URL(`../../Graphic/logo/${awayClub.logoFile}`, import.meta.url).href} alt="" className="w-20 h-20 object-contain shrink-0" />
              : <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex flex-col shrink-0">
                  <div className="flex-1" style={{ backgroundColor: awayClub?.colorsHex[0] ?? '#555' }} />
                  <div className="flex-1" style={{ backgroundColor: awayClub?.colorsHex[1] ?? awayClub?.colorsHex[0] ?? '#333' }} />
                </div>
            }
          </div>
        </div>

        {/* Info bar */}
        <div className="shrink-0 flex items-center justify-center gap-8 px-8 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[9px] text-slate-500">
            👥 {attendance.toLocaleString('pl-PL')} widzów
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Home lineup */}
          <div className="flex-1 min-w-0 overflow-y-auto border-r border-white/5 p-4">
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">
              {homeClub?.shortName ?? homeClub?.name}
            </div>
            <div className="">
              {homeFinalXI.map(id => renderPlayerRow(id, report.homeTeamId))}
              {homeSubsOff.length > 0 && <div className="mt-5 mb-3 border-t border-cyan-500/30" />}
              {homeSubsOff.map(id => renderPlayerRow(id, report.homeTeamId, true))}
            </div>
          </div>

          {/* Pitch */}
          <div className="w-[510px] shrink-0 relative overflow-hidden self-center aspect-[25/36]">
            <img src={bojo2Pitch} alt="" className="absolute inset-0 w-full h-full object-fill" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute inset-0">
              {homeTactic?.slots.map((slot, i) => {
                const id = report.homeStartingXI[i];
                if (!id) return null;
                const p = homePlayers.find(pl => pl.id === id);
                const isGK = slot.role === PlayerPosition.GK;
                const primary = isGK ? homeGKColor : homePrimary;
                const secondary = isGK ? homeGKColor : homeSecondary;
                const trim = getContrastText(primary, secondary);
                const isRed = report.cards.some(c => c.playerId === id && c.type === 'RED_CARD');
                const top = isGK
                  ? `calc(${getPitchSlotTop(true, slot.y)} + 55px)`
                  : slot.role === PlayerPosition.DEF
                    ? `calc(${getPitchSlotTop(true, slot.y)} + 25px)`
                    : slot.role === PlayerPosition.MID
                      ? `calc(${getPitchSlotTop(true, slot.y)} - 5px)`
                      : `calc(${getPitchSlotTop(true, slot.y)} - 45px)`;
                return <PitchKit key={`h-${i}`} player={p} left={`${slot.x * 100}%`} top={top} primary={primary} secondary={secondary} trim={trim} isRedCarded={isRed} />;
              })}
              {awayTactic?.slots.map((slot, i) => {
                const id = report.awayStartingXI[i];
                if (!id) return null;
                const p = awayPlayers.find(pl => pl.id === id);
                const isGK = slot.role === PlayerPosition.GK;
                const primary = isGK ? awayGKColor : awayPrimary;
                const secondary = isGK ? awayGKColor : awaySecondary;
                const trim = getContrastText(primary, secondary);
                const isRed = report.cards.some(c => c.playerId === id && c.type === 'RED_CARD');
                const top = isGK
                  ? `calc(${getPitchSlotTop(false, slot.y)} - 55px)`
                  : slot.role === PlayerPosition.DEF
                    ? `calc(${getPitchSlotTop(false, slot.y)} - 23px)`
                    : slot.role === PlayerPosition.MID
                      ? `calc(${getPitchSlotTop(false, slot.y)} + 5px)`
                      : `calc(${getPitchSlotTop(false, slot.y)} + 45px)`;
                return <PitchKit key={`a-${i}`} player={p} left={`${slot.x * 100}%`} top={top} primary={primary} secondary={secondary} trim={trim} isRedCarded={isRed} />;
              })}
            </div>
          </div>

          {/* Away lineup */}
          <div className="flex-1 min-w-0 overflow-y-auto border-l border-white/5 p-4">
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">
              {awayClub?.shortName ?? awayClub?.name}
            </div>
            <div className="">
              {awayFinalXI.map(id => renderPlayerRow(id, report.awayTeamId))}
              {awaySubsOff.length > 0 && <div className="mt-5 mb-3 border-t border-cyan-500/30" />}
              {awaySubsOff.map(id => renderPlayerRow(id, report.awayTeamId, true))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
