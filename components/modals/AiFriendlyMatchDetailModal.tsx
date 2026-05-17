import React, { useMemo } from 'react';
import { AiFriendlyMatchReport, PlayerPosition } from '../../types';
import { useGame } from '../../context/GameContext';

interface Props {
  report: AiFriendlyMatchReport;
  onClose: () => void;
}

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

  const subsInIds = new Set(report.substitutions.map(s => s.playerInId));

  const sortByPosition = (ids: string[]) =>
    [...ids].sort((a, b) => {
      const pa = getPlayer(a);
      const pb = getPlayer(b);
      return (POS_ORDER[pa?.position ?? ''] ?? 2) - (POS_ORDER[pb?.position ?? ''] ?? 2);
    });

  const homePlayedIds = sortByPosition(
    Object.keys(report.ratings).filter(id => homePlayers.some(p => p.id === id))
  );
  const awayPlayedIds = sortByPosition(
    Object.keys(report.ratings).filter(id => awayPlayers.some(p => p.id === id))
  );

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

  const getRatingColor = (r: number) => {
    if (r >= 7.5) return 'text-emerald-400';
    if (r >= 6.5) return 'text-amber-400';
    if (r >= 5.0) return 'text-slate-300';
    return 'text-rose-400';
  };

  const renderPlayerRow = (id: string, teamId: string) => {
    const p = getPlayer(id);
    const rating = report.ratings[id];
    const goals = playerGoals(id, teamId);
    const assists = playerAssists(id);
    const pCards = playerCardsFor(id);
    const isSub = subsInIds.has(id);
    return (
      <div key={id} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl ${isSub ? 'opacity-65' : ''}`}>
        <span className="text-[8px] text-slate-600 w-6 shrink-0 font-bold">{p?.position ?? '?'}</span>
        <span className="flex-1 text-[10px] font-bold text-slate-300 truncate">
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
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/75 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 shrink-0">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-green-400">Sparing — Raport</div>
            <div className="text-[11px] font-bold text-slate-400 mt-0.5">{dateStr}</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Score panel */}
        <div className="shrink-0 flex items-center justify-center gap-10 py-8 border-b border-white/5">
          <div className="flex flex-col items-center gap-2 min-w-[150px]">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 flex flex-col">
              <div className="flex-1" style={{ backgroundColor: homeClub?.colorsHex[0] ?? '#555' }} />
              <div className="flex-1" style={{ backgroundColor: homeClub?.colorsHex[1] ?? homeClub?.colorsHex[0] ?? '#333' }} />
            </div>
            <div className="text-[11px] font-black uppercase italic text-white text-center leading-tight">{homeClub?.name ?? report.homeTeamId}</div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="text-6xl font-black tabular-nums text-white leading-none tracking-tight">
              {report.homeScore}–{report.awayScore}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">+{report.extraTime}'</div>
          </div>

          <div className="flex flex-col items-center gap-2 min-w-[150px]">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 flex flex-col">
              <div className="flex-1" style={{ backgroundColor: awayClub?.colorsHex[0] ?? '#555' }} />
              <div className="flex-1" style={{ backgroundColor: awayClub?.colorsHex[1] ?? awayClub?.colorsHex[0] ?? '#333' }} />
            </div>
            <div className="text-[11px] font-black uppercase italic text-white text-center leading-tight">{awayClub?.name ?? report.awayTeamId}</div>
          </div>
        </div>

        {/* Info bar */}
        <div className="shrink-0 flex items-center justify-center gap-8 px-8 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            👥 {attendance.toLocaleString('pl-PL')} widzów
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Home lineup */}
          <div className="w-[210px] shrink-0 overflow-y-auto border-r border-white/5 p-4">
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">
              {homeClub?.shortName ?? homeClub?.name}
            </div>
            <div className="space-y-0.5">
              {homePlayedIds.map(id => renderPlayerRow(id, report.homeTeamId))}
            </div>
          </div>

          {/* Events timeline */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">Zdarzenia</div>
            {events.length === 0 && (
              <p className="text-[10px] text-slate-600 text-center mt-8">Brak zdarzeń do wyświetlenia</p>
            )}
            <div className="space-y-1.5">
              {events.map((ev, idx) => {
                const isHome = ev.data.teamId === report.homeTeamId;
                const rowBase = `flex items-center gap-2 text-[10px]`;
                const bubbleBase = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl border flex-1`;

                let icon = '';
                let label = '';
                let bubbleStyle = '';

                if (ev.kind === 'GOAL') {
                  const g = ev.data;
                  icon = g.isMiss ? '✗' : g.isPenalty ? '⚽(k.)' : '⚽';
                  label = g.isMiss
                    ? `${g.playerName} (niestrz.)`
                    : `${g.playerName}${g.assistName ? ` (as. ${g.assistName})` : ''}`;
                  bubbleStyle = g.isMiss
                    ? 'bg-slate-800/50 border-slate-700/40 text-slate-500'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
                } else if (ev.kind === 'CARD') {
                  const c = ev.data;
                  icon = c.type === 'YELLOW_CARD' ? '🟨' : '🟥';
                  label = c.playerName;
                  bubbleStyle = c.type === 'YELLOW_CARD'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300';
                } else if (ev.kind === 'SUB') {
                  const s = ev.data;
                  icon = '↕';
                  label = `↑ ${s.playerInName}  ↓ ${s.playerOutName}`;
                  bubbleStyle = 'bg-sky-500/10 border-sky-500/20 text-sky-300';
                } else {
                  const i = ev.data;
                  icon = '🩹';
                  label = `${i.playerName} (${i.severity === 'SEVERE' ? 'ciężka' : 'lekka'}, ${i.days}d)`;
                  bubbleStyle = 'bg-orange-500/10 border-orange-500/20 text-orange-300';
                }

                return (
                  <div key={idx} className={`${rowBase} ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                    <span className="text-[8px] font-black text-slate-600 w-6 text-center shrink-0">{ev.minute}'</span>
                    <div className={`${bubbleBase} ${bubbleStyle} ${isHome ? '' : 'justify-end'}`}>
                      <span className="shrink-0">{icon}</span>
                      <span className="font-bold truncate">{label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Away lineup */}
          <div className="w-[210px] shrink-0 overflow-y-auto border-l border-white/5 p-4">
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">
              {awayClub?.shortName ?? awayClub?.name}
            </div>
            <div className="space-y-0.5">
              {awayPlayedIds.map(id => renderPlayerRow(id, report.awayTeamId))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
