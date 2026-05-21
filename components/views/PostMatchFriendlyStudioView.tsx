import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, MatchEventType, PlayerPerformance } from '../../types';
import { KitSelectionService } from '../../services/KitSelectionService';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { PostMatchCommentSelector } from '../../PolishCupEngine/PostMatchCommentSelector';

const GLASS_PANEL = "bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]";

export const PostMatchFriendlyStudioView: React.FC = () => {
  const { lastMatchSummary, navigateTo, advanceDay, players, coaches, managerProfile, userTeamId } = useGame();
  const [showExpertModal, setShowExpertModal] = useState(false);

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
  const expertComment = useMemo(() => PostMatchCommentSelector.selectComment(lastMatchSummary), [lastMatchSummary]);
  const kitSelection = useMemo(() => KitSelectionService.selectOptimalKits(homeClub, awayClub), [homeClub, awayClub]);

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

  const getContrastText = (bgHex: string, secondaryHex: string): string => {
    const parse = (hex: string) => { const h = hex.replace('#', ''); return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) }; };
    const lum = ({ r, g, b }: { r: number; g: number; b: number }) => 0.299 * r + 0.587 * g + 0.114 * b;
    const bgL = lum(parse(bgHex)); const secL = lum(parse(secondaryHex));
    if (Math.abs(bgL - secL) > 60) return secondaryHex;
    return bgL > 128 ? '#000000' : '#ffffff';
  };
  const isColorDark = (hex: string): boolean => { const h = hex.replace('#', ''); return (0.299 * parseInt(h.substring(0, 2), 16) + 0.587 * parseInt(h.substring(2, 4), 16) + 0.114 * parseInt(h.substring(4, 6), 16)) < 80; };

  const KitIcon = ({ shirt, shorts }: { shirt: string; shorts: string }) => (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 24 24" className={`w-[48px] h-[48px] ${isColorDark(shirt) ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]' : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]'}`}>
        <path d="M7 2L2 5v4l3 1v10h14V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={shirt} />
        <path d="M12 4L10 6L12 8L14 6L12 4Z" fill={shorts} fillOpacity="0.9" />
        <path d="M7 2L2 5v4l3 1V6.5L8.3 5l1.7 2.3h4L15.7 5 19 6.5V10l3-1V5l-5-3-2 2-2-2-2 2-2-2z" fill={shorts} fillOpacity="0.35" />
        <path d="M12 7.2v11.8" stroke={getContrastText(shirt, shorts)} strokeWidth="1" strokeOpacity="0.8" />
      </svg>
      <svg viewBox="0 0 28 18" className={`-mt-2 w-[32px] h-[20px] ${isColorDark(shorts) ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]' : 'drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]'}`}>
        <path d="M4 2h20l2 4-3 10H16l-2-6-2 6H5L2 6z" fill={shorts} stroke={getContrastText(shirt, shorts)} strokeWidth="0.8" strokeOpacity="0.15" strokeLinejoin="round" />
        <path d="M14 3v12" stroke={getContrastText(shirt, shorts)} strokeWidth="0.8" strokeOpacity="0.7" />
      </svg>
    </div>
  );

  const StatBar = ({ label, homeVal, awayVal, hColor, aColor, isPercent = false }: { label: string; homeVal: number; awayVal: number; hColor: string; aColor: string; isPercent?: boolean }) => {
    const total = homeVal + awayVal;
    const hPerc = total === 0 ? 50 : (homeVal / total) * 100;
    const aPerc = 100 - hPerc;
    const colorDistance = KitSelectionService.getColorDistance(hColor, aColor);
    const finalAColor = colorDistance < 150 ? (awayClub.colorsHex[1] || '#475569') : aColor;
    return (
      <div className="w-full space-y-1">
        <div className="h-8 w-full flex rounded-2xl overflow-hidden border border-white/10 bg-black/20 relative">
          <div style={{ width: `${hPerc}%`, backgroundColor: hColor, opacity: 0.6 }}
               className="h-full transition-all duration-1000 flex items-center pl-4">
            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-lg z-10">
              <span className="text-[10px] font-black text-white">{homeVal}{isPercent ? '%' : ''}</span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic drop-shadow-[0_2px_4px_rgba(0,0,0,1)] opacity-100">{label}</span>
          </div>
          <div style={{ width: `${aPerc}%`, backgroundColor: finalAColor, opacity: 0.6 }}
               className="h-full transition-all duration-1000 flex items-center justify-end pr-4">
            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-lg z-10">
              <span className="text-[10px] font-black text-white">{awayVal}{isPercent ? '%' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayerRow = (p: PlayerPerformance, side: 'LEFT' | 'RIGHT', isSub: boolean = false) => {
    const isMOTM = motm?.playerId === p.playerId;
    const rating = p.rating || 6.0;
    return (
      <div key={p.playerId} className={`flex items-center gap-3 py-0 px-2 mb-0 transition-all rounded-lg ${isMOTM ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5 border border-transparent'} ${isSub ? 'opacity-60 bg-white/[0.01]' : ''}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black border shrink-0 ${PlayerPresentationService.getPositionBadgeClass(p.position)}`}>
          {p.position}
        </div>
        <div className={`flex-1 min-w-0 ${side === 'RIGHT' ? 'text-right' : 'text-left'}`}>
          <span className={`block text-xs font-bold uppercase truncate ${isMOTM ? 'text-amber-400' : (isSub ? 'text-slate-400' : 'text-slate-200')}`}>
            {getFormattedName(p)}
          </span>
        </div>
        <div className="w-6 flex items-center justify-center">
          {isMOTM && <span className="text-amber-400 text-sm animate-pulse">⭐</span>}
        </div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${isMOTM ? 'bg-amber-500 text-black' : 'bg-black/40 text-white border border-white/10'}`}>
          {rating.toFixed(1)}
        </div>
      </div>
    );
  };

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
           <div className="flex flex-col gap-3 w-full">
              {/* Row 2: Names + Score aligned */}
              <div className="flex items-center gap-8 w-full">
                <div className="flex-1 flex items-center justify-end gap-6 min-w-0">
                  <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter text-right break-words leading-none flex-1">
                    {homeClub.name}
                  </h2>
                  <KitIcon shirt={kitSelection.home.primary} shorts={kitSelection.home.secondary} />
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="text-8xl font-black text-white">
                    {homeScore} <span className="text-slate-700">:</span> {awayScore}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {isPenalties && (
                      <span className="px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[11px] font-black text-amber-400 uppercase tracking-widest">
                        {`KARNE ${homePenaltyScore}:${awayPenaltyScore}`}
                      </span>
                    )}
                    {attendance > 0 && (
                      <p className="text-[13px] font-black italic uppercase tracking-tighter text-teal-400">Widzów: {attendance.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-start gap-6 min-w-0">
                  <KitIcon shirt={kitSelection.away.primary} shorts={kitSelection.away.secondary} />
                  <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter text-left break-words leading-none flex-1">
                    {awayClub.name}
                  </h2>
                </div>
              </div>

              {/* Row 3: Events tickers */}
              <div className="flex gap-8 w-full">
                <div className="flex-1 flex justify-end">{renderSideEvents('HOME')}</div>
                <div className="shrink-0" style={{ width: 'fit-content', minWidth: '120px' }} />
                <div className="flex-1 flex justify-start">{renderSideEvents('AWAY')}</div>
              </div>
           </div>
        </div>

        {/* ── MAIN WORKSPACE ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex gap-6 min-h-0">

          {/* Home players */}
          <div className={`${GLASS_PANEL} w-80 rounded-[45px] p-6 flex flex-col shrink-0`}>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 text-center">
              {homeClub.id === userTeamId
                ? `${managerProfile?.firstName ?? ''} ${managerProfile?.lastName ?? ''}`
                : (() => { const c = coaches[homeClub.coachId ?? '']; return c ? `${c.firstName} ${c.lastName}` : homeClub.shortName; })()}
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="space-y-0">
                <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-2">Pierwszy Skład</span>
                {sortedData.homeStarters.map(p => renderPlayerRow(p, 'LEFT'))}
                {sortedData.homeSubs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.03]">
                    <span className="block text-[8px] font-black text-amber-500/70 uppercase tracking-widest text-center mb-1">Zmiany</span>
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mb-2" />
                    {sortedData.homeSubs.map(p => renderPlayerRow(p, 'LEFT', true))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Centre: stats + expert comment */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className={`${GLASS_PANEL} p-10 rounded-[55px] flex flex-col justify-center space-y-4 shrink-0`}>
               <h3 className="text-[13px] font-black text-slate-300 uppercase tracking-[0.4em] text-center mb-2">STATYSTYKI MECZU</h3>
               <StatBar label="Posiadanie Piłki" homeVal={Math.round(homeStats.possession)} awayVal={Math.round(awayStats.possession)} hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} isPercent />
               <StatBar label="Strzały ogółem"   homeVal={homeStats.shots}          awayVal={awayStats.shots}         hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Strzały celne"    homeVal={homeStats.shotsOnTarget}  awayVal={awayStats.shotsOnTarget} hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Rzuty rożne"      homeVal={homeStats.corners}        awayVal={awayStats.corners}       hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Przewinienia"     homeVal={homeStats.fouls}          awayVal={awayStats.fouls}         hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Żółte kartki"     homeVal={homeStats.yellowCards}    awayVal={awayStats.yellowCards}   hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Czerwone kartki"  homeVal={homeStats.redCards}       awayVal={awayStats.redCards}      hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
            </div>

            {/* Commentary Panel */}
            <div className={`${GLASS_PANEL} flex-1 rounded-[55px] p-10 relative overflow-hidden group`}>
               <div className="absolute right-[-20px] bottom-[-20px] text-9xl font-black italic text-white/[0.03] select-none pointer-events-none">STUDIO</div>
               <div className="flex items-center gap-6 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 border-2 border-emerald-400 flex items-center justify-center font-black text-2xl text-white italic shadow-lg">H</div>
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">ANALIZA EKSPERCKA</h4>
                    <p className="text-xs font-black text-white italic">Tomasz Hajto</p>
                  </div>
                  <button
                    onClick={() => setShowExpertModal(true)}
                    className="ml-auto px-4 py-2 rounded-xl bg-emerald-600/20 border-t border-x border-b border-t-emerald-400/30 border-x-emerald-500/20 border-b-black/60 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] hover:bg-emerald-500/30 transition-all active:translate-y-[2px]"
                    style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                  >czytaj więcej ↗</button>
               </div>
               <p className="text-xl text-slate-300 italic leading-relaxed font-medium relative max-w-3xl line-clamp-4">
                 <span className="text-emerald-500/50 text-6xl font-serif absolute -left-10 -top-4">"</span>
                 {expertComment}
                 <span className="text-emerald-500/50 text-6xl font-serif absolute -right-6 bottom-[-20px]">"</span>
               </p>
            </div>
          </div>

          {/* Away players */}
          <div className={`${GLASS_PANEL} w-80 rounded-[45px] p-6 flex flex-col shrink-0`}>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 text-center">
              {awayClub.id === userTeamId
                ? `${managerProfile?.firstName ?? ''} ${managerProfile?.lastName ?? ''}`
                : (() => { const c = coaches[awayClub.coachId ?? '']; return c ? `${c.firstName} ${c.lastName}` : awayClub.shortName; })()}
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="space-y-0">
                <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 mr-2 text-right">Pierwszy Skład</span>
                {sortedData.awayStarters.map(p => renderPlayerRow(p, 'RIGHT'))}
                {sortedData.awaySubs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.03]">
                    <span className="block text-[8px] font-black text-amber-500/70 uppercase tracking-widest text-center mb-1">Zmiany</span>
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mb-2" />
                    {sortedData.awaySubs.map(p => renderPlayerRow(p, 'RIGHT', true))}
                  </div>
                )}
              </div>
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

      {/* EXPERT COMMENT MODAL */}
      {showExpertModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 animate-fade-in"
          onClick={() => setShowExpertModal(false)}
        >
          <div
            className={`${GLASS_PANEL} relative rounded-[40px] p-12 max-w-2xl w-full`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-5 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 border-2 border-emerald-400 flex items-center justify-center font-black text-2xl text-white italic shadow-lg">H</div>
              <div>
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">ANALIZA EKSPERCKA</h4>
                <p className="text-xs font-black text-white italic">Tomasz Hajto</p>
              </div>
              <button
                onClick={() => setShowExpertModal(false)}
                className="ml-auto w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all text-2xl font-light text-slate-400"
              >&times;</button>
            </div>
            <div className="overflow-y-auto custom-scrollbar max-h-[60vh] pr-2">
              <p className="text-lg text-slate-200 italic leading-relaxed font-medium">
                <span className="text-emerald-500/50 text-5xl font-serif not-italic align-bottom leading-none mr-1">"</span>
                {expertComment}
                <span className="text-emerald-500/50 text-5xl font-serif not-italic align-bottom leading-none ml-1">"</span>
              </p>
            </div>
          </div>
        </div>
      )}

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
