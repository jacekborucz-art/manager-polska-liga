import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import {
  ViewState, MatchEventType, PlayerPerformance, CompetitionType, MatchStatus,
} from '../types';
import { PlayerPresentationService } from '../services/PlayerPresentationService';
import { PostMatchCommentSelector } from '../PolishCupEngine/PostMatchCommentSelector';
import { KitSelectionService } from '../services/KitSelectionService';
import ligaMistrzowBg from '../Graphic/themes/Liga_mistrzow.png';
import ligaEuropaBg from '../Graphic/themes/LigaEuropa.png';
import ligaKonferencjiBg from '../Graphic/themes/Liga_konferencji.png';
import { getClubLogo } from '../resources/ClubLogoAssets';

const GLASS_PANEL = "bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]";

const CL_COMPS: CompetitionType[] = [
  CompetitionType.CL_R1Q, CompetitionType.CL_R1Q_RETURN,
  CompetitionType.CL_R2Q, CompetitionType.CL_R2Q_RETURN,
  CompetitionType.CL_GROUP_STAGE,
  CompetitionType.CL_R16, CompetitionType.CL_R16_RETURN,
  CompetitionType.CL_QF, CompetitionType.CL_QF_RETURN,
  CompetitionType.CL_SF, CompetitionType.CL_SF_RETURN,
  CompetitionType.CL_FINAL,
];

const EL_COMPS: CompetitionType[] = [
  CompetitionType.EL_R1Q, CompetitionType.EL_R1Q_RETURN,
  CompetitionType.EL_R2Q, CompetitionType.EL_R2Q_RETURN,
  CompetitionType.EL_GROUP_STAGE,
  CompetitionType.EL_R16, CompetitionType.EL_R16_RETURN,
  CompetitionType.EL_QF, CompetitionType.EL_QF_RETURN,
  CompetitionType.EL_SF, CompetitionType.EL_SF_RETURN,
  CompetitionType.EL_FINAL,
];

const CONF_COMPS: CompetitionType[] = [
  CompetitionType.CONF_R1Q, CompetitionType.CONF_R1Q_RETURN,
  CompetitionType.CONF_R2Q, CompetitionType.CONF_R2Q_RETURN,
  CompetitionType.CONF_GROUP_STAGE,
  CompetitionType.CONF_R16, CompetitionType.CONF_R16_RETURN,
  CompetitionType.CONF_QF, CompetitionType.CONF_QF_RETURN,
  CompetitionType.CONF_SF, CompetitionType.CONF_SF_RETURN,
  CompetitionType.CONF_FINAL,
];

export const PostMatchEuropeanStudioView: React.FC = () => {
  const { lastMatchSummary, navigateTo, fixtures, clubs, currentDate, advanceDay, players } = useGame();
  const [pageIndex, setPageIndex] = useState(1);
  const [showExpertModal, setShowExpertModal] = useState(false);

  if (!lastMatchSummary) return null;

  const {
    homeClub, awayClub, homeScore, awayScore, homeStats, awayStats,
    homePlayers, awayPlayers, timeline, attendance = 0,
  } = lastMatchSummary;

  // Detect competition from fixtures
  const matchFixture = useMemo(
    () => fixtures.find(f => f.id === lastMatchSummary.matchId) ?? null,
    [fixtures, lastMatchSummary.matchId],
  );
  const compType = matchFixture?.leagueId;
  const isCL   = compType ? (CL_COMPS as string[]).includes(compType as string) : false;
  const isEL   = compType ? (EL_COMPS as string[]).includes(compType as string) : false;
  const isCONF = compType ? (CONF_COMPS as string[]).includes(compType as string) : false;

  // Theme
  const bgImage   = isEL ? ligaEuropaBg : isCONF ? ligaKonferencjiBg : ligaMistrzowBg;
  const accentCls = isEL ? 'text-orange-400' : isCONF ? 'text-cyan-400' : 'text-amber-400';
  const accentBg  = isEL ? 'bg-orange-400/10 border-orange-400/20' : isCONF ? 'bg-cyan-400/10 border-cyan-400/20' : 'bg-amber-400/10 border-amber-400/20';
  const accentGlow = isEL ? 'shadow-[0_0_10px_rgba(251,146,60,1)]' : isCONF ? 'shadow-[0_0_10px_rgba(34,211,238,1)]' : 'shadow-[0_0_10px_rgba(251,191,36,1)]';
  const compLabel = isEL ? 'UEFA Europa League' : isCONF ? 'UEFA Liga Konferencji' : 'UEFA Champions League';
  const compIcon  = isEL ? '🟠' : isCONF ? '🔵' : '⭐';

  // Round label
  const roundLabel = (() => {
    if (!compType) return 'Studio Pomeczowe';
    const map: Partial<Record<CompetitionType, string>> = {
      [CompetitionType.CL_R1Q]: '1. Runda Preeliminacyjna',
      [CompetitionType.CL_R1Q_RETURN]: '1. Runda Preeliminacyjna — Rewanż',
      [CompetitionType.CL_R2Q]: '2. Runda Preeliminacyjna',
      [CompetitionType.CL_R2Q_RETURN]: '2. Runda Preeliminacyjna — Rewanż',
      [CompetitionType.CL_GROUP_STAGE]: 'Faza Grupowa',
      [CompetitionType.CL_R16]: '1/8 Finału',
      [CompetitionType.CL_R16_RETURN]: '1/8 Finału — Rewanż',
      [CompetitionType.CL_QF]: '1/4 Finału',
      [CompetitionType.CL_QF_RETURN]: '1/4 Finału — Rewanż',
      [CompetitionType.CL_SF]: '1/2 Finału',
      [CompetitionType.CL_SF_RETURN]: '1/2 Finału — Rewanż',
      [CompetitionType.CL_FINAL]: 'FINAŁ',
      [CompetitionType.EL_R1Q]: '1. Runda Preeliminacyjna',
      [CompetitionType.EL_R1Q_RETURN]: '1. Runda Preeliminacyjna — Rewanż',
      [CompetitionType.EL_R2Q]: '2. Runda Preeliminacyjna',
      [CompetitionType.EL_R2Q_RETURN]: '2. Runda Preeliminacyjna — Rewanż',
      [CompetitionType.EL_GROUP_STAGE]: 'Faza Grupowa',
      [CompetitionType.EL_R16]: '1/8 Finału',
      [CompetitionType.EL_R16_RETURN]: '1/8 Finału — Rewanż',
      [CompetitionType.EL_QF]: '1/4 Finału',
      [CompetitionType.EL_QF_RETURN]: '1/4 Finału — Rewanż',
      [CompetitionType.EL_SF]: '1/2 Finału',
      [CompetitionType.EL_SF_RETURN]: '1/2 Finału — Rewanż',
      [CompetitionType.EL_FINAL]: 'FINAŁ',
      [CompetitionType.CONF_R1Q]: '1. Runda Preeliminacyjna',
      [CompetitionType.CONF_R1Q_RETURN]: '1. Runda Preeliminacyjna — Rewanż',
      [CompetitionType.CONF_R2Q]: '2. Runda Preeliminacyjna',
      [CompetitionType.CONF_R2Q_RETURN]: '2. Runda Preeliminacyjna — Rewanż',
      [CompetitionType.CONF_GROUP_STAGE]: 'Faza Grupowa',
      [CompetitionType.CONF_R16]: '1/8 Finału',
      [CompetitionType.CONF_R16_RETURN]: '1/8 Finału — Rewanż',
      [CompetitionType.CONF_QF]: '1/4 Finału',
      [CompetitionType.CONF_QF_RETURN]: '1/4 Finału — Rewanż',
      [CompetitionType.CONF_SF]: '1/2 Finału',
      [CompetitionType.CONF_SF_RETURN]: '1/2 Finału — Rewanż',
      [CompetitionType.CONF_FINAL]: 'FINAŁ',
    };
    return map[compType] ?? 'Studio Pomeczowe';
  })();

  // Today's European results for page 2
  const todayEuropeanResults = useMemo(() => {
    const dateStr = currentDate.toDateString();
    const allEuroComps = [...CL_COMPS, ...EL_COMPS, ...CONF_COMPS] as string[];
    return fixtures.filter(f =>
      f.date.toDateString() === dateStr &&
      f.status === MatchStatus.FINISHED &&
      allEuroComps.includes(f.leagueId as string),
    );
  }, [fixtures, currentDate]);

  const getClub = (id: string) => clubs.find(c => c.id === id);

  const motm = useMemo(() => PostMatchCommentSelector.calculateMOTM(lastMatchSummary), [lastMatchSummary]);
  const expertComment = useMemo(() => PostMatchCommentSelector.selectComment(lastMatchSummary), [lastMatchSummary]);

  const sortedData = useMemo(() => {
    const priority: Record<string, number> = { 'GK': 0, 'DEF': 1, 'MID': 2, 'FWD': 3 };
    const sortFn = (a: PlayerPerformance, b: PlayerPerformance) => priority[a.position] - priority[b.position];
    return {
      homeStarters: [...homePlayers.slice(0, 11)].sort(sortFn),
      homeSubs: [...homePlayers.slice(11)].sort(sortFn),
      awayStarters: [...awayPlayers.slice(0, 11)].sort(sortFn),
      awaySubs: [...awayPlayers.slice(11)].sort(sortFn),
    };
  }, [homePlayers, awayPlayers]);

  const getFormattedName = (perf: PlayerPerformance) => {
    const clubPlayers = players[perf.playerId.split('_')[1] + '_' + perf.playerId.split('_')[2]] || Object.values(players).flat();
    const originalPlayer = clubPlayers.find(p => p.id === perf.playerId);
    const initial = originalPlayer ? originalPlayer.firstName.charAt(0) : perf.name.charAt(0);
    return `${initial}. ${perf.name}`;
  };

  const getEventFormattedName = (playerName: string, side: 'HOME' | 'AWAY') => {
    if (playerName.includes('.')) return playerName;
    const perfList = side === 'HOME' ? homePlayers : awayPlayers;
    const perf = perfList.find(p => p.name === playerName);
    if (!perf) return playerName;
    const clubId = side === 'HOME' ? homeClub.id : awayClub.id;
    const originalPlayer = (players[clubId] || []).find(p => p.id === perf.playerId);
    if (!originalPlayer) return playerName;
    return `${originalPlayer.firstName.charAt(0)}. ${playerName}`;
  };

  const handleReturnToDashboard = () => {
    advanceDay();
    navigateTo(ViewState.DASHBOARD);
  };

  const StatBar = ({ label, homeVal, awayVal, hColor, aColor, isPercent = false }: {
    label: string; homeVal: number; awayVal: number; hColor: string; aColor: string; isPercent?: boolean;
  }) => {
    const total = homeVal + awayVal;
    const hPerc = total === 0 ? 50 : (homeVal / total) * 100;
    const aPerc = 100 - hPerc;
    const colorDistance = KitSelectionService.getColorDistance(hColor, aColor);
    const finalAColor = colorDistance < 150 ? (awayClub.colorsHex[1] || '#475569') : aColor;

    return (
      <div className="w-full space-y-1">
        <div className="h-12 w-full flex rounded-2xl overflow-hidden border border-white/10 bg-black/20 relative">
          <div
            style={{ width: `${hPerc}%`, backgroundColor: hColor, opacity: 0.6 }}
            className="h-full transition-all duration-1000 flex items-center pl-4"
          >
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-lg z-10">
              <span className="text-[10px] font-black text-white">{homeVal}{isPercent ? '%' : ''}</span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic drop-shadow-[0_2px_4px_rgba(0,0,0,1)] opacity-100">{label}</span>
          </div>
          <div
            style={{ width: `${aPerc}%`, backgroundColor: finalAColor, opacity: 0.6 }}
            className="h-full transition-all duration-1000 flex items-center justify-end pr-4"
          >
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-lg z-10">
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
      <div key={p.playerId} className={`flex items-center gap-3 py-[3px] px-2 mb-0 transition-all rounded-lg ${isMOTM ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5 border border-transparent'} ${isSub ? 'opacity-40 grayscale-[0.6] bg-white/[0.01]' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border shrink-0 ${PlayerPresentationService.getPositionBadgeClass(p.position)}`}>
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
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${isMOTM ? 'bg-amber-500 text-black' : 'bg-black/40 text-white border border-white/10'}`}>
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
          let icon = '•';
          let color = 'text-slate-400';
          if (e.type === MatchEventType.GOAL || e.type === MatchEventType.PENALTY_SCORED) {
            icon = '⚽'; color = 'text-white';
          } else if (e.type === MatchEventType.YELLOW_CARD) {
            icon = '🟨'; color = 'text-amber-400';
          } else if (e.type === MatchEventType.RED_CARD) {
            icon = '🟥'; color = 'text-red-500';
          } else if (e.type === MatchEventType.INJURY_LIGHT || e.type === MatchEventType.INJURY_SEVERE) {
            icon = '✚'; color = e.type === MatchEventType.INJURY_SEVERE ? 'text-red-600 font-bold' : 'text-slate-300';
          }
          const formattedEventName = getEventFormattedName(e.playerName, side);
          if (e.varDisallowed) {
            return (
              <span key={i} className="text-[10px] font-black uppercase italic text-slate-500 flex items-center gap-1">
                {side === 'HOME'
                  ? <><s>{formattedEventName} ({e.minute}')</s>&nbsp;⚽(VAR)</>
                  : <>⚽(VAR)&nbsp;<s>{formattedEventName} ({e.minute}')</s></>}
              </span>
            );
          }
          return (
            <span key={i} className={`text-[10px] font-black uppercase italic ${color} flex items-center gap-1`}>
              {side === 'HOME' ? `${formattedEventName} (${e.minute}') ${icon}` : `${icon} ${formattedEventName} (${e.minute}')`}
            </span>
          );
        })}
      </div>
    );
  };

  const renderPage1 = () => (
    <div className="animate-fade-in flex flex-col gap-6 w-full h-full min-h-0">

      {/* HEADER: competition badge + score */}
      <div className={`${GLASS_PANEL} rounded-[40px] p-10 flex flex-col items-center justify-center shrink-0`}>
        {/* Competition label */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`text-xs font-black uppercase tracking-[0.4em] ${accentCls}`}>{compIcon} {compLabel} · {roundLabel}</span>
        </div>

        <div className="flex items-center gap-8 w-full">
          {/* Home Side */}
          <div className="flex-1 flex flex-col items-end gap-3 min-w-0">
            <div className="flex items-center gap-6 justify-end w-full">
              <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter text-right break-words leading-none flex-1">
                {homeClub.name}
              </h2>
              {getClubLogo(homeClub.id)
                ? <img src={getClubLogo(homeClub.id)} alt={homeClub.name} className="w-16 h-16 object-contain shrink-0 drop-shadow-2xl transform -rotate-3" />
                : <div className="w-16 h-16 rounded-2xl flex flex-col overflow-hidden border-2 border-white/20 shadow-2xl shrink-0 transform -rotate-3">
                    <div style={{ backgroundColor: homeClub.colorsHex[0] }} className="flex-1" />
                    <div style={{ backgroundColor: homeClub.colorsHex[1] || homeClub.colorsHex[0] }} className="flex-1" />
                  </div>
              }
            </div>
            {renderSideEvents('HOME')}
          </div>

          {/* Score Center */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-black/40 px-12 py-5 rounded-[35px] border border-white/10 text-8xl font-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] shrink-0">
              {homeScore} <span className="text-slate-700">:</span> {awayScore}
            </div>
            <div className={`px-4 py-1 rounded-full border ${accentBg}`}>
              <span className={`text-[14px] font-black tracking-[0.3em] uppercase ${accentCls}`}>KONIEC SPOTKANIA</span>
            </div>
          </div>

          {/* Away Side */}
          <div className="flex-1 flex flex-col items-start gap-3 min-w-0">
            <div className="flex items-center gap-6 justify-start w-full">
              {getClubLogo(awayClub.id)
                ? <img src={getClubLogo(awayClub.id)} alt={awayClub.name} className="w-16 h-16 object-contain shrink-0 drop-shadow-2xl transform rotate-3" />
                : <div className="w-16 h-16 rounded-2xl flex flex-col overflow-hidden border-2 border-white/20 shadow-2xl shrink-0 transform rotate-3">
                    <div style={{ backgroundColor: awayClub.colorsHex[0] }} className="flex-1" />
                    <div style={{ backgroundColor: awayClub.colorsHex[1] || awayClub.colorsHex[0] }} className="flex-1" />
                  </div>
              }
              <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter text-left break-words leading-none flex-1">
                {awayClub.name}
              </h2>
            </div>
            {renderSideEvents('AWAY')}
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Home Players */}
        <div className={`${GLASS_PANEL} w-80 rounded-[45px] p-6 flex flex-col shrink-0`}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 text-center">RAPORT: {homeClub.shortName}</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="space-y-0">
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
        </div>

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Stats */}
          <div className={`${GLASS_PANEL} p-10 rounded-[55px] flex flex-col justify-center space-y-4 shrink-0`}>
            <div className="flex justify-between items-center mb-2 px-4">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Stadion</p>
                <p className="text-sm font-black text-white uppercase italic">{homeClub.stadiumName}</p>
              </div>
              <div className="flex gap-10">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Widzów</p>
                  <p className="text-sm font-black text-emerald-400 tabular-nums">{attendance.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <StatBar label="Posiadanie Piłki" homeVal={Math.round(homeStats.possession)} awayVal={Math.round(awayStats.possession)} hColor={homeClub.colorsHex[0]} aColor={awayClub.colorsHex[0]} isPercent />
            <StatBar label="Strzały ogółem" homeVal={homeStats.shots} awayVal={awayStats.shots} hColor={homeClub.colorsHex[0]} aColor={awayClub.colorsHex[0]} />
            <StatBar label="Strzały celne" homeVal={homeStats.shotsOnTarget} awayVal={awayStats.shotsOnTarget} hColor={homeClub.colorsHex[0]} aColor={awayClub.colorsHex[0]} />
            <StatBar label="Rzuty rożne" homeVal={homeStats.corners} awayVal={awayStats.corners} hColor={homeClub.colorsHex[0]} aColor={awayClub.colorsHex[0]} />
            <StatBar label="Przewinienia" homeVal={homeStats.fouls} awayVal={awayStats.fouls} hColor={homeClub.colorsHex[0]} aColor={awayClub.colorsHex[0]} />
          </div>

          {/* Expert Comment */}
          <div className={`${GLASS_PANEL} flex-1 rounded-[55px] p-10 relative overflow-hidden group`}>
            <div className="absolute right-[-20px] bottom-[-20px] text-9xl font-black italic text-white/[0.03] select-none pointer-events-none">STUDIO</div>
            <div className="flex items-center gap-6 mb-8">
              <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-2xl text-white italic shadow-lg ${accentBg}`}>
                {compIcon}
              </div>
              <div>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${accentCls}`}>ANALIZA EKSPERCKA</h4>
                <p className="text-xs font-black text-white italic">Tomasz Hajto</p>
              </div>
              <button
                onClick={() => setShowExpertModal(true)}
                className={`ml-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${accentBg} ${accentCls} hover:opacity-80`}
              >czytaj więcej ↗</button>
            </div>
            <p className="text-xl text-slate-300 italic leading-relaxed font-medium relative max-w-3xl line-clamp-4">
              <span className={`${accentCls} opacity-50 text-6xl font-serif absolute -left-10 -top-4`}>"</span>
              {expertComment}
              <span className={`${accentCls} opacity-50 text-6xl font-serif absolute -right-6 bottom-[-20px]`}>"</span>
            </p>
          </div>
        </div>

        {/* Away Players */}
        <div className={`${GLASS_PANEL} w-80 rounded-[45px] p-6 flex flex-col shrink-0`}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 text-center">RAPORT: {awayClub.shortName}</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="space-y-0">
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
      </div>

      {/* FOOTER 1 */}
      <div className="h-24 flex items-center justify-between px-12 bg-slate-900/20 border border-white/5 rounded-[35px] backdrop-blur-3xl shadow-2xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <div className={`w-2 h-2 rounded-full ${isEL ? 'bg-orange-500' : isCONF ? 'bg-cyan-500' : 'bg-amber-500'} ${accentGlow}`} />
            <div className="w-2 h-2 rounded-full bg-white/10" />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">KROK 1: ANALIZA SPOTKANIA</span>
        </div>
        <button
          onClick={() => setPageIndex(2)}
          className="group relative px-12 py-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl active:scale-95"
        >
          <span className="relative z-10 text-white font-black italic uppercase tracking-widest text-sm">
            WYNIKI EUROPEJSKIE &rarr;
          </span>
        </button>
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="animate-fade-in flex flex-col gap-6 w-full h-full min-h-0">
      {/* Header */}
      <div className="bg-slate-900/40 border border-white/10 rounded-[45px] p-12 backdrop-blur-3xl shadow-2xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-10">
          <div className={`w-20 h-20 rounded-3xl border flex items-center justify-center text-4xl shadow-inner transform -rotate-3 ${accentBg}`}>
            {compIcon}
          </div>
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">WYNIKI EUROPEJSKIE</h2>
            <p className={`text-xs font-black uppercase tracking-[0.4em] mt-4 ${accentCls}`}>
              {compLabel.toUpperCase()} · {currentDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="bg-black/20 border border-white/10 rounded-[30px] px-10 py-6 flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Mecze dnia</span>
          <span className={`text-sm font-black italic uppercase tracking-widest ${accentCls}`}>{todayEuropeanResults.length} spotkań</span>
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 bg-slate-900/40 rounded-[40px] border border-white/5 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2">
          {todayEuropeanResults.length > 0 ? todayEuropeanResults.map(fixture => {
            const home = getClub(fixture.homeTeamId);
            const away = getClub(fixture.awayTeamId);
            if (!home || !away) return null;
            const isMyMatch = fixture.id === lastMatchSummary.matchId;
            const hasPens = fixture.homePenaltyScore !== undefined;
            return (
              <div
                key={fixture.id}
                className={`flex items-center justify-between px-6 py-4 rounded-3xl border transition-colors ${isMyMatch ? 'bg-white/[0.08] border-white/20' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                  <span className={`text-sm font-black uppercase italic tracking-tight text-right truncate max-w-[200px] ${isMyMatch ? 'text-white' : 'text-slate-300'}`}>
                    {home.name}
                  </span>
                  <div className="w-3 h-6 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: home.colorsHex[0] }} />
                </div>
                <div className="w-28 flex flex-col items-center shrink-0 mx-4">
                  <span className="text-lg font-black text-white font-mono tracking-tighter tabular-nums">
                    {fixture.homeScore} : {fixture.awayScore}
                  </span>
                  {hasPens && (
                    <span className="text-[8px] text-rose-400 font-black uppercase tracking-widest">
                      k. {fixture.homePenaltyScore}:{fixture.awayPenaltyScore}
                    </span>
                  )}
                  {isMyMatch && (
                    <span className={`text-[8px] font-black uppercase tracking-widest ${accentCls}`}>TWÓJ MECZ</span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0 justify-start">
                  <div className="w-3 h-6 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: away.colorsHex[0] }} />
                  <span className={`text-sm font-black uppercase italic tracking-tight truncate max-w-[200px] ${isMyMatch ? 'text-white' : 'text-slate-300'}`}>
                    {away.name}
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
              <span className="text-4xl mb-4">{compIcon}</span>
              <p className="text-[9px] font-black uppercase tracking-widest text-center">Brak wyników na dziś</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer 2 */}
      <div className="h-24 shrink-0 flex items-center justify-between px-12 bg-slate-900/40 border border-white/10 rounded-[35px] backdrop-blur-3xl shadow-2xl">
        <button
          onClick={() => setPageIndex(1)}
          className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black italic uppercase tracking-widest text-[10px] transition-all hover:bg-white/10 hover:text-white active:scale-95"
        >
          &larr; ANALIZA MECZU
        </button>
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className={`w-2 h-2 rounded-full ${isEL ? 'bg-orange-500' : isCONF ? 'bg-cyan-500' : 'bg-amber-500'} ${accentGlow}`} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">KROK 2: WYNIKI EUROPEJSKIE</span>
        </div>
        <button
          onClick={handleReturnToDashboard}
          className="group relative px-16 py-5 rounded-[20px] bg-white/5 border border-white/20 text-white font-black italic uppercase tracking-tighter text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl backdrop-blur-md flex items-center gap-4 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          POWRÓT DO CENTRUM 🏁
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black font-sans">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-[4px]"
          style={{ filter: 'brightness(0.35)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950" />
      </div>

      <div className="relative z-10 w-full max-w-[1800px] h-full flex flex-col gap-6">
        {pageIndex === 1 ? renderPage1() : renderPage2()}
      </div>

      {/* Expert Comment Modal */}
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
              <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-2xl text-white italic shadow-lg ${accentBg}`}>
                {compIcon}
              </div>
              <div>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${accentCls}`}>ANALIZA EKSPERCKA</h4>
                <p className="text-xs font-black text-white italic">Tomasz Hajto</p>
              </div>
              <button
                onClick={() => setShowExpertModal(false)}
                className="ml-auto w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all text-2xl font-light text-slate-400"
              >&times;</button>
            </div>
            <div className="overflow-y-auto custom-scrollbar max-h-[60vh] pr-2">
              <p className="text-lg text-slate-200 italic leading-relaxed font-medium">
                <span className={`${accentCls} opacity-50 text-5xl font-serif not-italic align-bottom leading-none mr-1`}>"</span>
                {expertComment}
                <span className={`${accentCls} opacity-50 text-5xl font-serif not-italic align-bottom leading-none ml-1`}>"</span>
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
