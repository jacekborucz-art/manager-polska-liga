import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, MatchEventType, PlayerPerformance } from '../../types';
import { KitSelectionService } from '../../services/KitSelectionService';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { PostMatchCommentSelector } from '../../PolishCupEngine/PostMatchCommentSelector';

const GLASS_PANEL = "bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]";

export const PostMatchFriendlyStudioView: React.FC = () => {
  const { lastMatchSummary, navigateTo, advanceDay, players } = useGame();

  if (!lastMatchSummary) return null;

  const {
    homeClub, awayClub,
    homeScore, awayScore,
    homeStats, awayStats,
    homePlayers, awayPlayers,
    homeGoals, awayGoals,
    homePenaltyScore, awayPenaltyScore,
    timeline, attendance = 0,
  } = lastMatchSummary;

  const isPenalties = homePenaltyScore !== undefined && ((homePenaltyScore ?? 0) > 0 || (awayPenaltyScore ?? 0) > 0);
  const isExtraTime = timeline.some(e => e.minute > 90);

  const motm = useMemo(() => PostMatchCommentSelector.calculateMOTM(lastMatchSummary), [lastMatchSummary]);

  const sortedData = useMemo(() => {
    const priority: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
    const sortFn = (a: PlayerPerformance, b: PlayerPerformance) => priority[a.position] - priority[b.position];
    return {
      homeStarters: [...homePlayers.slice(0, 11)].sort(sortFn),
      homeSubs:     [...homePlayers.slice(11)].sort(sortFn),
      awayStarters: [...awayPlayers.slice(0, 11)].sort(sortFn),
      awaySubs:     [...awayPlayers.slice(11)].sort(sortFn),
    };
  }, [homePlayers, awayPlayers]);

  const getFormattedName = (perf: PlayerPerformance) => {
    const clubId = perf.playerId.split('_')[1] + '_' + perf.playerId.split('_')[2];
    const clubPlayers = players[clubId] || Object.values(players).flat();
    const original = clubPlayers.find(p => p.id === perf.playerId);
    const initial = original ? original.firstName.charAt(0) : perf.name.charAt(0);
    return `${initial}. ${perf.name}`;
  };

  const getEventFormattedName = (playerName: string, side: 'HOME' | 'AWAY') => {
    if (playerName.includes('.')) return playerName;
    const perfList = side === 'HOME' ? homePlayers : awayPlayers;
    const perf = perfList.find(p => p.name === playerName);
    if (!perf) return playerName;
    const clubId = side === 'HOME' ? homeClub.id : awayClub.id;
    const original = (players[clubId] || []).find(p => p.id === perf.playerId);
    return original ? `${original.firstName.charAt(0)}. ${playerName}` : playerName;
  };

  // ── Stat bar with club-coloured fills ──────────────────────────────────────
  const StatBar = ({
    label, homeVal, awayVal, isPercent = false,
  }: { label: string; homeVal: number; awayVal: number; isPercent?: boolean }) => {
    const total = homeVal + awayVal || 1;
    const hPerc = (homeVal / total) * 100;
    const hColor = homeClub.colorsHex[0];
    const aColorRaw = awayClub.colorsHex[0];
    const colorDist = KitSelectionService.getColorDistance(hColor, aColorRaw);
    const aColor = colorDist < 150 ? (awayClub.colorsHex[1] || '#475569') : aColorRaw;
    return (
      <div className="w-full">
        <div className="h-12 w-full flex rounded-2xl overflow-hidden border border-white/10 bg-black/20 relative">
          <div style={{ width: `${hPerc}%`, backgroundColor: hColor, opacity: 0.6 }}
               className="h-full transition-all duration-1000 flex items-center pl-4">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-lg z-10">
              <span className="text-[10px] font-black text-white">{homeVal}{isPercent ? '%' : ''}</span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{label}</span>
          </div>
          <div style={{ width: `${100 - hPerc}%`, backgroundColor: aColor, opacity: 0.6 }}
               className="h-full transition-all duration-1000 flex items-center justify-end pr-4">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-lg z-10">
              <span className="text-[10px] font-black text-white">{awayVal}{isPercent ? '%' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Player row with rating badge ────────────────────────────────────────────
  const renderPlayerRow = (p: PlayerPerformance, side: 'LEFT' | 'RIGHT', isSub = false) => {
    const isMOTM = motm?.playerId === p.playerId;
    const rating = p.rating ?? 6.0;
    return (
      <div key={p.playerId}
           className={`flex items-center gap-3 p-2 mb-1 transition-all rounded-lg
             ${isMOTM ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5 border border-transparent'}
             ${isSub ? 'opacity-40 grayscale-[0.6] bg-white/[0.01]' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border shrink-0
          ${PlayerPresentationService.getPositionBadgeClass(p.position)}`}>
          {p.position}
        </div>
        <div className={`flex-1 min-w-0 ${side === 'RIGHT' ? 'text-right' : 'text-left'}`}>
          <span className={`block text-xs font-bold uppercase truncate
            ${isMOTM ? 'text-amber-400' : isSub ? 'text-slate-400' : 'text-slate-200'}`}>
            {getFormattedName(p)}
          </span>
        </div>
        <div className="w-6 flex items-center justify-center">
          {isMOTM && <span className="text-amber-400 text-sm animate-pulse">⭐</span>}
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0
          ${isMOTM ? 'bg-amber-500 text-black' : 'bg-black/40 text-white border border-white/10'}`}>
          {rating.toFixed(1)}
        </div>
      </div>
    );
  };

  // ── Side event ticker ───────────────────────────────────────────────────────
  const renderSideEvents = (side: 'HOME' | 'AWAY') => {
    const events = timeline.filter(e => e.teamSide === side);
    if (events.length === 0) return null;
    return (
      <div className={`flex flex-wrap gap-x-4 gap-y-1 max-w-full ${side === 'HOME' ? 'justify-end pr-24' : 'justify-start pl-24'}`}>
        {events.map((e, i) => {
          let icon = '•', color = 'text-slate-400';
          if (e.type === MatchEventType.GOAL || e.type === MatchEventType.PENALTY_SCORED) { icon = '⚽'; color = 'text-white'; }
          else if (e.type === MatchEventType.YELLOW_CARD) { icon = '🟨'; color = 'text-amber-400'; }
          else if (e.type === MatchEventType.RED_CARD) { icon = '🟥'; color = 'text-red-500'; }
          else if (e.type === MatchEventType.INJURY_LIGHT || e.type === MatchEventType.INJURY_SEVERE) {
            icon = '✚'; color = e.type === MatchEventType.INJURY_SEVERE ? 'text-red-600 font-bold' : 'text-slate-300';
          }
          const name = getEventFormattedName(e.playerName, side);
          if (e.varDisallowed) {
            return (
              <span key={i} className="text-[10px] font-black uppercase italic text-slate-500 flex items-center gap-1">
                {side === 'HOME'
                  ? <><s>{name} ({e.minute}')</s>&nbsp;⚽(VAR)</>
                  : <>⚽(VAR)&nbsp;<s>{name} ({e.minute}')</s></>}
              </span>
            );
          }
          return (
            <span key={i} className={`text-[10px] font-black uppercase italic ${color} flex items-center gap-1`}>
              {side === 'HOME' ? `${name} (${e.minute}') ${icon}` : `${icon} ${name} (${e.minute}')`}
            </span>
          );
        })}
      </div>
    );
  };

  const handleContinue = () => {
    advanceDay();
    navigateTo(ViewState.DASHBOARD);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black font-sans">

      {/* CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 blur-[4px]"
          style={{ backgroundImage: `url('https://i.ibb.co/3yYVGzG8/Stadion-Po-Meczu.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950" />
      </div>

      <div className="relative z-10 w-full max-w-[1800px] h-full flex flex-col gap-6 animate-fade-in">

        {/* ── SCORE HEADER ────────────────────────────────────────────────────── */}
        <div className={`${GLASS_PANEL} rounded-[40px] p-10 flex flex-col items-center justify-center shrink-0`}>
          <div className="flex items-center gap-8 w-full">

            {/* Home side */}
            <div className="flex-1 flex flex-col items-end gap-3 min-w-0">
              <div className="flex items-center gap-6 justify-end w-full">
                <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter text-right break-words leading-none flex-1">
                  {homeClub.name}
                </h2>
                <div className="w-16 h-16 rounded-2xl flex flex-col overflow-hidden border-2 border-white/20 shadow-2xl shrink-0 transform -rotate-3">
                  <div style={{ backgroundColor: homeClub.colorsHex[0] }} className="flex-1" />
                  <div style={{ backgroundColor: homeClub.colorsHex[1] || homeClub.colorsHex[0] }} className="flex-1" />
                </div>
              </div>
              {renderSideEvents('HOME')}
            </div>

            {/* Score centre */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="bg-black/40 px-12 py-5 rounded-[35px] border border-white/10 text-8xl font-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                {homeScore} <span className="text-slate-700">:</span> {awayScore}
              </div>
              <div className="flex flex-col items-center gap-1">
                {isExtraTime && (
                  <span className="px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[11px] font-black text-amber-400 uppercase tracking-widest">
                    {isPenalties ? `KARNE ${homePenaltyScore}:${awayPenaltyScore}` : 'PO DOGRYWCE'}
                  </span>
                )}
                <div className="bg-green-500/10 px-4 py-1 rounded-full border border-green-500/20">
                  <span className="text-[13px] font-black text-green-400 tracking-[0.3em] uppercase">SPARING • KONIEC</span>
                </div>
              </div>
            </div>

            {/* Away side */}
            <div className="flex-1 flex flex-col items-start gap-3 min-w-0">
              <div className="flex items-center gap-6 justify-start w-full">
                <div className="w-16 h-16 rounded-2xl flex flex-col overflow-hidden border-2 border-white/20 shadow-2xl shrink-0 transform rotate-3">
                  <div style={{ backgroundColor: awayClub.colorsHex[0] }} className="flex-1" />
                  <div style={{ backgroundColor: awayClub.colorsHex[1] || awayClub.colorsHex[0] }} className="flex-1" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter text-left break-words leading-none flex-1">
                  {awayClub.name}
                </h2>
              </div>
              {renderSideEvents('AWAY')}
            </div>

          </div>
        </div>

        {/* ── MAIN WORKSPACE ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex gap-6 min-h-0">

          {/* Home players */}
          <div className={`${GLASS_PANEL} w-80 rounded-[45px] p-6 flex flex-col shrink-0`}>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 text-center">
              RAPORT: {homeClub.shortName}
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-2">Pierwszy Skład</span>
              {sortedData.homeStarters.map(p => renderPlayerRow(p, 'LEFT'))}
              {sortedData.homeSubs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-2">Zmiennicy</span>
                  {sortedData.homeSubs.map(p => renderPlayerRow(p, 'LEFT', true))}
                </div>
              )}
            </div>
          </div>

          {/* Centre: stats */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className={`${GLASS_PANEL} p-10 rounded-[55px] flex flex-col justify-center space-y-4`}>
              <div className="flex justify-between items-center mb-2 px-4">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Stadion</p>
                  <p className="text-sm font-black text-white uppercase italic">{homeClub.stadiumName}</p>
                </div>
                {attendance > 0 && (
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Widzów</p>
                    <p className="text-sm font-black text-green-400 tabular-nums">{attendance.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <StatBar label="Posiadanie Piłki" homeVal={Math.round(homeStats.possession)} awayVal={Math.round(awayStats.possession)} isPercent />
              <StatBar label="Strzały ogółem"  homeVal={homeStats.shots}          awayVal={awayStats.shots} />
              <StatBar label="Strzały celne"   homeVal={homeStats.shotsOnTarget}  awayVal={awayStats.shotsOnTarget} />
              <StatBar label="Rzuty rożne"     homeVal={homeStats.corners}        awayVal={awayStats.corners} />
              <StatBar label="Przewinienia"    homeVal={homeStats.fouls}          awayVal={awayStats.fouls} />
            </div>
          </div>

          {/* Away players */}
          <div className={`${GLASS_PANEL} w-80 rounded-[45px] p-6 flex flex-col shrink-0`}>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 text-center">
              RAPORT: {awayClub.shortName}
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 mr-2 text-right">Pierwszy Skład</span>
              {sortedData.awayStarters.map(p => renderPlayerRow(p, 'RIGHT'))}
              {sortedData.awaySubs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 mr-2 text-right">Zmiennicy</span>
                  {sortedData.awaySubs.map(p => renderPlayerRow(p, 'RIGHT', true))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <div className="h-24 flex items-center justify-end px-12 bg-slate-900/20 border border-white/5 rounded-[35px] backdrop-blur-3xl shadow-2xl shrink-0">
          <button
            onClick={handleContinue}
            className="group relative px-16 py-5 rounded-[20px] bg-white/5 border border-white/20 text-white font-black italic uppercase tracking-tighter text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl backdrop-blur-md flex items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            POWRÓT DO CENTRUM 🏁
          </button>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};
