
import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, MatchEventType, PlayerPerformance, MatchResult, MatchSummaryEvent, ClubKitPattern } from '../../types';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { PostMatchCommentSelector } from '../../PolishCupEngine/PostMatchCommentSelector';
import { KitSelectionService } from '../../services/KitSelectionService';
import { DebugLoggerService } from '../../services/DebugLoggerService';
import { MatchReportModalPolishLeague } from '../modals/MatchReportModalPolishLeague';
import { KitPreview } from '../common/KitPreview';

// Zwiększona przezroczystość paneli dla lepszej widoczności tła
const GLASS_PANEL = "bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]";

export const PostMatchStudioView: React.FC = () => {
  const { lastMatchSummary, navigateTo, roundResults, currentDate, advanceDay, clubs, players, managerProfile, userTeamId, coaches, leagueSchedules } = useGame();
  const [pageIndex, setPageIndex] = useState(1);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [reportMatchId, setReportMatchId] = useState<string | null>(null);

  if (!lastMatchSummary) return null;

  const { 
    homeClub, awayClub, homeScore, awayScore, homeStats, awayStats,
    homePlayers, awayPlayers, timeline, attendance = 0,
    homeGoals, awayGoals, refereeName, refereeRating
  } = lastMatchSummary;

  const currentRoundResults = useMemo(() => {
    const todayKey = currentDate.toDateString();
    const yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = yesterdayDate.toDateString();

    // DEBUG
    DebugLoggerService.separator('PostMatchStudioView');
    DebugLoggerService.log('STUDIO', `roundResults keys: ${Object.keys(roundResults).join(', ')}`);
    DebugLoggerService.log('STUDIO', `currentDate=${todayKey} | today entry=${roundResults[todayKey]?.league1Results?.length ?? 'null'} | yesterday entry=${roundResults[yesterdayKey]?.league1Results?.length ?? 'null'}`);
    Object.entries(roundResults).forEach(([key, val]) => {
      DebugLoggerService.log('STUDIO', `  dateKey=${key} L1=${val.league1Results.length} L2=${val.league2Results.length} L3=${val.league3Results.length}`);
      val.league1Results.forEach((r, i) => DebugLoggerService.log('STUDIO', `    L1[${i}]: ${r.homeTeamName} vs ${r.awayTeamName} ${r.homeScore}:${r.awayScore}`));
    });

    if (roundResults[todayKey]) return roundResults[todayKey];
    // Fallback: advanceDay mogło przesunąć datę przed meczem (wyniki pod poprzednim dniem)
    return roundResults[yesterdayKey] || null;
  }, [roundResults, currentDate]);

  const motm = useMemo(() => PostMatchCommentSelector.calculateMOTM(lastMatchSummary), [lastMatchSummary]);
  const expertComment = useMemo(() => PostMatchCommentSelector.selectComment(lastMatchSummary), [lastMatchSummary]);
  const kitSelection = useMemo(
    () => lastMatchSummary.kits ?? KitSelectionService.selectOptimalKits(homeClub, awayClub),
    [lastMatchSummary.kits, homeClub, awayClub]
  );
  const refereeRatingColor =
    refereeRating === undefined
      ? 'text-slate-300'
      : refereeRating >= 7.5
        ? 'text-emerald-300'
        : refereeRating >= 6
          ? 'text-amber-300'
          : 'text-rose-300';

  const currentRoundNumber = useMemo(() => {
    const schedule = leagueSchedules[1];
    if (!schedule) return null;
    const today = currentDate.getTime();
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yest = yesterday.getTime();
    for (const md of schedule.matchdays) {
      const s = new Date(md.start).getTime();
      const e = new Date(md.end).getTime();
      if ((yest >= s && yest <= e) || (today >= s && today <= e)) return md.roundNumber;
    }
    const completed = schedule.matchdays.filter(md => new Date(md.end).getTime() < today);
    return completed.length > 0 ? completed[completed.length - 1].roundNumber : null;
  }, [leagueSchedules, currentDate]);

 const sortedData = useMemo(() => {
    const priority: Record<string, number> = { 'GK': 0, 'DEF': 1, 'MID': 2, 'FWD': 3 };
    
    const sortFn = (a: PlayerPerformance, b: PlayerPerformance) => priority[a.position] - priority[b.position];

    return {
      homeStarters: [...homePlayers.slice(0, 11)].sort(sortFn),
      homeSubs: [...homePlayers.slice(11)].sort(sortFn),
      awayStarters: [...awayPlayers.slice(0, 11)].sort(sortFn),
      awaySubs: [...awayPlayers.slice(11)].sort(sortFn)
    };
  }, [homePlayers, awayPlayers]);


  // Pobieranie inicjału imienia z globalnej bazy graczy dla list zawodników
  const getFormattedName = (perf: PlayerPerformance) => {
    const clubPlayers = players[perf.playerId.split('_')[1] + '_' + perf.playerId.split('_')[2]] || Object.values(players).flat();
    const originalPlayer = clubPlayers.find(p => p.id === perf.playerId);
    const initial = originalPlayer ? originalPlayer.firstName.charAt(0) : perf.name.charAt(0);
    return `${initial}. ${perf.name}`;
  };

  // Pobieranie inicjału imienia dla zdarzeń w tickerze (gole, kartki, kontuzje)
  const getEventFormattedName = (playerName: string, side: 'HOME' | 'AWAY') => {
    if (playerName.includes('.')) return playerName; // Już sformatowane

    const perfList = side === 'HOME' ? homePlayers : awayPlayers;
    const perf = perfList.find(p => p.name === playerName);
    if (!perf) return playerName;

    const clubId = side === 'HOME' ? homeClub.id : awayClub.id;
    const originalPlayer = (players[clubId] || []).find(p => p.id === perf.playerId);
    
    if (!originalPlayer) return playerName;
    return `${originalPlayer.firstName.charAt(0)}. ${playerName}`;
  };

  const getGoalFormattedName = (
    goal: { playerName: string; scorerId?: string; isOwnGoal?: boolean; ownGoalPlayerId?: string },
    side: 'HOME' | 'AWAY'
  ) => {
    if (goal.playerName.includes('.')) return goal.playerName;

    const clubId = side === 'HOME' ? homeClub.id : awayClub.id;
    const playerIdForLookup = goal.isOwnGoal ? goal.ownGoalPlayerId : goal.scorerId;
    const originalPlayer = playerIdForLookup
      ? (players[clubId] || []).find(p => p.id === playerIdForLookup) || Object.values(players).flat().find(p => p.id === playerIdForLookup)
      : null;

    if (originalPlayer) return `${originalPlayer.firstName.charAt(0)}. ${originalPlayer.lastName}`;
    return getEventFormattedName(goal.playerName, side);
  };

  const handleReturnToDashboard = () => {
    advanceDay();
    navigateTo(ViewState.DASHBOARD);
  };

  const getContrastText = (bgHex: string, secondaryHex: string): string => {
    const parse = (hex: string) => { const h = hex.replace('#', ''); return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) }; };
    const lum = ({ r, g, b }: { r: number; g: number; b: number }) => 0.299 * r + 0.587 * g + 0.114 * b;
    const bgL = lum(parse(bgHex)); const secL = lum(parse(secondaryHex));
    if (Math.abs(bgL - secL) > 60) return secondaryHex;
    return bgL > 128 ? '#000000' : '#ffffff';
  };
  const isColorDark = (hex: string): boolean => { const h = hex.replace('#', ''); return (0.299 * parseInt(h.substring(0, 2), 16) + 0.587 * parseInt(h.substring(2, 4), 16) + 0.114 * parseInt(h.substring(4, 6), 16)) < 80; };

  const KitIcon = ({ shirt, shirtSecondary, shorts, pattern }: { shirt: string; shirtSecondary?: string; shorts: string; pattern?: ClubKitPattern }) => (
    <div className="flex flex-col items-center">
      <KitPreview shirt={shirt} shirtSecondary={shirtSecondary} shorts={shorts} socks={shorts} pattern={pattern} className={`h-[68px] w-[58px] ${isColorDark(shirt) ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]' : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]'}`} />
    </div>
  );

  // Komponent dla wykresu słupkowego - liczby w czarnych kółeczkach
  const StatBar = ({ label, homeVal, awayVal, hColor, aColor, isPercent = false }: { label: string, homeVal: number, awayVal: number, hColor: string, aColor: string, isPercent?: boolean }) => {
    const total = homeVal + awayVal;
    const hPerc = total === 0 ? 50 : (homeVal / total) * 100;
    const aPerc = 100 - hPerc;

    const colorDistance = KitSelectionService.getColorDistance(hColor, aColor);
    const finalAColor = colorDistance < 150 ? (awayClub.colorsHex[1] || '#475569') : aColor;

    return (
      <div className="w-full space-y-1">
        <div className="h-8 w-full flex rounded-2xl overflow-hidden border border-white/10 bg-black/20 relative">
          {/* Home Bar */}
          <div
            style={{ width: `${hPerc}%`, backgroundColor: hColor, opacity: 0.6 }}
            className="h-full transition-all duration-1000 flex items-center pl-4"
          >
            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center border border-white/20 shadow-lg z-10">
              <span className="text-[10px] font-black text-white">{homeVal}{isPercent ? '%' : ''}</span>
            </div>
          </div>
          
          {/* Label Overlay (Centered) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic drop-shadow-[0_2px_4px_rgba(0,0,0,1)] opacity-100">
               {label}
             </span>
          </div>

          {/* Away Bar */}
          <div
            style={{ width: `${aPerc}%`, backgroundColor: finalAColor, opacity: 0.6 }}
            className="h-full transition-all duration-1000 flex items-center justify-end pr-4"
          >
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
    const goalEvents = (side === 'HOME' ? homeGoals : awayGoals)
      .filter(g => !g.isMiss)
      .map(g => ({
        minute: g.minute,
        type: MatchEventType.GOAL,
        playerName: getGoalFormattedName(g, side),
        varDisallowed: g.varDisallowed,
        isOwnGoal: g.isOwnGoal,
      }));

    const timelineEvents = timeline
      .filter(e => e.teamSide === side)
      .filter(e => {
        if (e.type !== MatchEventType.GOAL && e.type !== MatchEventType.PENALTY_SCORED) return true;
        return e.varDisallowed === true;
      })
      .map(e => ({
        minute: e.minute,
        type: e.type,
        playerName: getEventFormattedName(e.playerName, side),
        varDisallowed: e.varDisallowed,
        isOwnGoal: e.isOwnGoal,
      }));

    const events = [...goalEvents, ...timelineEvents].sort((a, b) => a.minute - b.minute);
    if (events.length === 0) return null;

    return (
      <div className={`flex flex-wrap gap-x-4 gap-y-1 max-w-full ${side === 'HOME' ? 'justify-end pr-24' : 'justify-start pl-24'}`}>
        {events.map((e, i) => {
          let icon = '•';
          let color = 'text-slate-400';
          
          if (e.type === MatchEventType.GOAL || e.type === MatchEventType.PENALTY_SCORED) {
            icon = '⚽'; color = e.isOwnGoal ? 'text-orange-400' : 'text-white';
          } else if (e.type === MatchEventType.YELLOW_CARD) {
            icon = '🟨'; color = 'text-amber-400';
          } else if (e.type === MatchEventType.RED_CARD) {
            icon = '🟥'; color = 'text-red-500';
          } else if (e.type === MatchEventType.INJURY_LIGHT || e.type === MatchEventType.INJURY_SEVERE) {
            icon = '✚'; color = e.type === MatchEventType.INJURY_SEVERE ? 'text-red-600 font-bold' : 'text-slate-300';
          }

          if (e.varDisallowed) {
            return (
              <span key={i} className="text-[10px] font-black uppercase italic text-slate-500 flex items-center gap-1">
                {side === 'HOME'
                  ? <><s>{e.playerName} ({e.minute}'{e.isOwnGoal ? ' sam' : ''})</s>&nbsp;⚽(VAR)</>
                  : <>⚽(VAR)&nbsp;<s>{e.playerName} ({e.minute}'{e.isOwnGoal ? ' sam' : ''})</s></>}
              </span>
            );
          }

          return (
            <span key={i} className={`text-[10px] font-black uppercase italic ${color} flex items-center gap-1`}>
              {side === 'HOME'
                ? <>{e.playerName} ({e.minute}'{e.isOwnGoal ? <span className="text-orange-300"> sam</span> : null}) {icon}</>
                : <>{icon} {e.playerName} ({e.minute}'{e.isOwnGoal ? <span className="text-orange-300"> sam</span> : null})</>}
            </span>
          );
        })}
      </div>
    );
  };
  const renderResultRow = (result: MatchResult, idx: number) => {
    const homeClubData = clubs.find(c => c.name === result.homeTeamName);
    const awayClubData = clubs.find(c => c.name === result.awayTeamName);
    const homeLogo = homeClubData?.logoFile ? new URL(`../../Graphic/logo/${homeClubData.logoFile}`, import.meta.url).href : null;
    const awayLogo = awayClubData?.logoFile ? new URL(`../../Graphic/logo/${awayClubData.logoFile}`, import.meta.url).href : null;
    const hc = result.homeColors[0] || '#ffffff';
    const ac = result.awayColors[0] || '#ffffff';
    return (
    <div
      key={idx}
      onClick={() => result.matchId ? setReportMatchId(result.matchId) : undefined}
      className={`flex items-center justify-between py-1 px-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500 group ${result.matchId ? 'cursor-pointer' : ''}`}
      style={{ background: `linear-gradient(to right, ${hc}40, transparent 45%, transparent 55%, ${ac}40)` }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `linear-gradient(to right, ${hc}60, transparent 45%, transparent 55%, ${ac}60)`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = `linear-gradient(to right, ${hc}40, transparent 45%, transparent 55%, ${ac}40)`; }}
    >
       <div className="flex items-center gap-3 flex-1 min-w-0">
          {homeLogo
            ? <img src={homeLogo} alt="" className="w-6 h-6 object-contain shrink-0" />
            : <div className="flex flex-col w-1 h-6 rounded-full overflow-hidden shrink-0 shadow-md">
                <div className="flex-1" style={{ backgroundColor: result.homeColors[0] }} />
                <div className="flex-1" style={{ backgroundColor: result.homeColors[1] || result.homeColors[0] }} />
              </div>
          }
          <span className="text-[11px] font-black text-slate-300 truncate uppercase italic group-hover:text-white transition-colors">{result.homeTeamName}</span>
       </div>

       <div className="mx-4">
          <div className="text-[16px] font-black not-italic uppercase tracking-tight text-emerald-400 group-hover:scale-110 transition-transform">
             {result.homeScore} : {result.awayScore}
          </div>
       </div>

       <div className="flex items-center gap-3 flex-1 min-w-0 flex-row-reverse text-right">
          {awayLogo
            ? <img src={awayLogo} alt="" className="w-6 h-6 object-contain shrink-0" />
            : <div className="flex flex-col w-1 h-6 rounded-full overflow-hidden shrink-0 shadow-md">
                <div className="flex-1" style={{ backgroundColor: result.awayColors[0] }} />
                <div className="flex-1" style={{ backgroundColor: result.awayColors[1] || result.awayColors[0] }} />
              </div>
          }
          <span className="text-[11px] font-black text-slate-300 truncate uppercase italic group-hover:text-white transition-colors">{result.awayTeamName}</span>
       </div>
    </div>
    );
  };

  const renderResultsSection = (title: string, results: MatchResult[], color: string, leagueId: string) => {
    const standings = [...clubs]
      .filter(c => c.leagueId === leagueId)
      .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);

    const leagueLogoMap: Record<string, string> = {
      'L_PL_1': 'ekstraklasa.png',
      'L_PL_2': '1liga_pl.png',
      'L_PL_3': '2liga_pl.png',
    };
    const leagueLogoFile = leagueLogoMap[leagueId];
    const leagueLogoUrl = leagueLogoFile ? new URL(`../../Graphic/logo/leagues/${leagueLogoFile}`, import.meta.url).href : null;

    return (
    <div className="flex-1 bg-slate-900/40 rounded-[40px] border border-white/5 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden">
       <div className="px-8 py-5 border-b border-white/5 flex justify-end items-center relative overflow-hidden min-h-[72px]">
          {leagueLogoUrl && (
            <img src={leagueLogoUrl} alt={title} className="absolute inset-0 w-full h-full object-contain object-left scale-[0.904] origin-left" />
          )}
          {!leagueLogoUrl && <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">{title}</h3>}
          <div className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] relative z-10" style={{ color }} />
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-1">
          {results && results.length > 0 ? (
            results.map((r, i) => renderResultRow(r, i))
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
               <span className="text-4xl mb-4">📡</span>
               <p className="text-[9px] font-black uppercase tracking-widest text-center">Dane w drodze...</p>
            </div>
          )}
          <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mt-2" />

          {/* TABELA */}
          <div className="h-[8px] shrink-0" />
          {standings.length > 0 && (
            <div>
              <p className="text-[11px] font-black italic uppercase tracking-tighter text-slate-200 text-center mb-0 rounded-md py-[1px]" style={{ backgroundImage: 'linear-gradient(to right, transparent, #ef444420, #ffffff15, #ef444420, transparent)' }}>Tabela</p>
              <div className="h-px mb-1" style={{ backgroundImage: 'linear-gradient(to right, transparent, #ef4444aa, #ffffffaa, #ef4444aa, transparent)' }} />
              <div className="flex text-[7px] font-black italic uppercase tracking-tighter text-white px-2 mb-1">
                <span className="w-6 shrink-0 whitespace-nowrap">#</span>
                <span className="flex-1 min-w-0">Drużyna</span>
                <span className="w-7 shrink-0 text-center whitespace-nowrap">M</span>
                <span className="w-16 shrink-0 text-center whitespace-nowrap">Z-R-P</span>
                <span className="w-14 shrink-0 text-center whitespace-nowrap">Br</span>
                <span className="w-8 shrink-0 text-center whitespace-nowrap">Pkt</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-1" />
              {standings.map((club, idx) => {
                let rowClass = 'text-slate-400';
                if (leagueId === 'L_PL_1') {
                  if (idx === 0) rowClass = 'bg-teal-500/70 text-black';
                  else if (idx <= 2) rowClass = 'bg-slate-500/70 text-black';
                  else if (idx <= 14) rowClass = 'bg-black/50 text-slate-400';
                  else rowClass = 'bg-red-600/70 text-white';
                } else if (leagueId === 'L_PL_2') {
                  if (idx <= 1) rowClass = 'bg-teal-500/70 text-black';
                  else if (idx <= 5) rowClass = 'bg-slate-500/70 text-black';
                  else if (idx <= 14) rowClass = 'bg-black/50 text-slate-400';
                  else rowClass = 'bg-red-600/70 text-white';
                } else if (leagueId === 'L_PL_3') {
                  if (idx <= 1) rowClass = 'bg-teal-500/70 text-black';
                  else if (idx <= 5) rowClass = 'bg-slate-500/70 text-black';
                  else if (idx <= 11) rowClass = 'bg-black/50 text-slate-400';
                  else if (idx <= 13) rowClass = 'bg-orange-500/70 text-white';
                  else rowClass = 'bg-red-600/70 text-white';
                } else {
                  rowClass = club.id === userTeamId ? 'bg-white/5 text-white' : 'text-slate-400';
                }
                return (
                <div key={club.id} className={`flex items-center text-[12px] font-black italic uppercase tracking-tighter px-2 py-[1px] rounded-lg ${rowClass} ${club.id === userTeamId ? '!text-amber-400' : ''}`}>
                  <span className="w-6 shrink-0 whitespace-nowrap">{idx + 1}</span>
                  <span className="flex-1 min-w-0 truncate">{club.name}</span>
                  <span className="w-7 shrink-0 text-center whitespace-nowrap">{club.stats.played}</span>
                  <span className="w-16 shrink-0 text-center whitespace-nowrap">{club.stats.wins}-{club.stats.draws}-{club.stats.losses}</span>
                  <span className="w-14 shrink-0 text-center whitespace-nowrap">{club.stats.goalsFor}:{club.stats.goalsAgainst}</span>
                  <span className="w-8 shrink-0 text-center whitespace-nowrap">{club.stats.points}</span>
                </div>
                );
              })}
            </div>
          )}
       </div>
    </div>
    );
  };

  const renderPage1 = () => (
    <div className="animate-fade-in flex flex-col gap-6 w-full h-full min-h-0">
        {/* HEADER: SCORE & EXTENDED TICKER */}
        <div className={`${GLASS_PANEL} rounded-[40px] p-10 flex flex-col items-center justify-center shrink-0`}>
           <div className="flex flex-col gap-3 w-full">
              {/* Row 1: Stadium info */}
              <div className="text-center">
                <p className="text-sm font-black text-white uppercase italic">{homeClub.stadiumName}</p>
                <p className="text-[13px] font-black italic uppercase tracking-tighter text-teal-400">Widzów: {attendance.toLocaleString()}</p>
                <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mt-2" />
              </div>

              {/* Row 2: Names + Score aligned */}
              <div className="flex items-center gap-8 w-full">
                <div className="flex-1 flex items-center justify-end gap-6 min-w-0">
                  <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter text-right break-words leading-none flex-1">
                    {homeClub.name}
                  </h2>
                  <KitIcon shirt={kitSelection.home.primary} shirtSecondary={kitSelection.home.shirtSecondary} shorts={kitSelection.home.secondary} pattern={kitSelection.home.pattern} />
                </div>

                <div className="text-8xl font-black text-white shrink-0">
                  {homeScore} <span className="text-slate-700">:</span> {awayScore}
                </div>

                <div className="flex-1 flex items-center justify-start gap-6 min-w-0">
                  <KitIcon shirt={kitSelection.away.primary} shirtSecondary={kitSelection.away.shirtSecondary} shorts={kitSelection.away.secondary} pattern={kitSelection.away.pattern} />
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

        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Home Players List */}
            <div className={`${GLASS_PANEL} w-80 rounded-[45px] p-6 flex flex-col shrink-0`}>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 text-center">
              {homeClub.id === userTeamId
                ? `${managerProfile?.firstName ?? ''} ${managerProfile?.lastName ?? ''}`
                : (() => { const c = coaches[homeClub.coachId ?? '']; return c ? `${c.firstName} ${c.lastName}` : ''; })()}
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

          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Stats Panel with Thick Bars */}
            <div className={`${GLASS_PANEL} p-10 rounded-[55px] flex flex-col justify-center space-y-4 shrink-0`}>
               <h3 className="text-[13px] font-black text-slate-300 uppercase tracking-[0.4em] text-center mb-2">STATYSTYKI MECZU</h3>
               <StatBar label="Posiadanie Piłki" homeVal={Math.round(homeStats.possession)} awayVal={Math.round(awayStats.possession)} hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} isPercent />
               <StatBar label="Strzały ogółem" homeVal={homeStats.shots} awayVal={awayStats.shots} hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Strzały celne" homeVal={homeStats.shotsOnTarget} awayVal={awayStats.shotsOnTarget} hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Rzuty rożne" homeVal={homeStats.corners} awayVal={awayStats.corners} hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Przewinienia" homeVal={homeStats.fouls} awayVal={awayStats.fouls} hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Żółte kartki" homeVal={homeStats.yellowCards} awayVal={awayStats.yellowCards} hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               <StatBar label="Czerwone kartki" homeVal={homeStats.redCards} awayVal={awayStats.redCards} hColor={kitSelection.home.primary} aColor={kitSelection.away.primary} />
               {refereeName && refereeRating !== undefined && (
                 <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-slate-950/45 px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)]">
                   <div className="min-w-0">
                     <div className="text-[8px] font-black italic uppercase tracking-tighter text-cyan-300/80">Sędzia główny</div>
                     <div className="truncate text-sm font-black italic uppercase tracking-tighter text-white">{refereeName}</div>
                   </div>
                   <div className="shrink-0 text-right">
                     <div className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Ocena</div>
                     <div className={`text-2xl font-black italic uppercase tracking-tighter tabular-nums ${refereeRatingColor}`}>{refereeRating.toFixed(1)}</div>
                   </div>
                 </div>
               )}
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

          {/* Away Players List */}
        <div className={`${GLASS_PANEL} w-80 rounded-[45px] p-6 flex flex-col shrink-0`}>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 text-center">
              {awayClub.id === userTeamId
                ? `${managerProfile?.firstName ?? ''} ${managerProfile?.lastName ?? ''}`
                : (() => { const c = coaches[awayClub.coachId ?? '']; return c ? `${c.firstName} ${c.lastName}` : ''; })()}
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

        {/* FOOTER 1 */}
        <div className="h-24 flex items-center justify-between px-12 bg-slate-900/20 border border-white/5 rounded-[35px] backdrop-blur-3xl shadow-2xl shrink-0">
           <div className="flex items-center gap-6">
              <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" />
                 <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">KROK 1: ANALIZA SPOTKANIA</span>
           </div>
           
           <button
             onClick={() => setPageIndex(2)}
             className="group relative px-12 py-4 bg-white/5 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 hover:bg-white/10 transition-all rounded-2xl active:translate-y-[2px]"
             style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
           >
              <span className="relative z-10 text-white font-black italic uppercase tracking-widest text-sm">
                RAPORT LIGOWY &rarr;
              </span>
           </button>
        </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="animate-fade-in flex flex-col gap-4 w-full h-full min-h-0 relative">
       {/* 1. ROUND HEADER */}
       <div className="bg-slate-900/40 border border-white/10 rounded-[45px] py-3 px-8 backdrop-blur-3xl shadow-2xl flex items-center justify-center relative shrink-0">
          <button
            onClick={() => setPageIndex(1)}
            className="absolute left-6 px-6 py-2 rounded-2xl bg-white/5 border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 text-slate-400 font-black italic uppercase tracking-widest text-[10px] transition-all hover:bg-white/10 hover:text-white active:scale-95 active:translate-y-[2px]"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}
          >
            &larr; WRÓĆ DO ANALIZY
          </button>
          <div className="text-center">
             <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">WYNIKI SPOTKAŃ</h2>
             <p className="text-blue-500 text-xs font-black uppercase tracking-[0.4em] mt-2">
                KOLEJKA {currentRoundNumber ?? ''} • {currentDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
             </p>
          </div>
       </div>

       {/* 2. THREE LEAGUE PANELS */}
       <div className="flex-1 flex gap-6 min-h-0">
          {renderResultsSection("Ekstraklasa", currentRoundResults?.league1Results || [], "#fbbf24", "L_PL_1")}
          {renderResultsSection("1. Liga", currentRoundResults?.league2Results || [], "#3b82f6", "L_PL_2")}
          {renderResultsSection("2. Liga", currentRoundResults?.league3Results || [], "#10b981", "L_PL_3")}
       </div>

       {/* X BUTTON — top-right corner */}
       <button
         onClick={handleReturnToDashboard}
         className="absolute top-0 right-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-slate-300 hover:bg-white/20 hover:text-white transition-all active:scale-95 z-10 text-lg font-black"
       >
         ✕
       </button>

    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black font-sans">
      
      {/* 1. CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 blur-[4px]" 
          style={{ backgroundImage: `url('https://i.ibb.co/3yYVGzG8/Stadion-Po-Meczu.png')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950" />
      </div>

      <div className="relative z-10 w-full max-w-[1800px] h-full flex flex-col gap-6">
        {pageIndex === 1 ? renderPage1() : renderPage2()}
      </div>

      <MatchReportModalPolishLeague matchId={reportMatchId} onClose={() => setReportMatchId(null)} />

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
            {/* Header */}
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
            {/* Text with scrollbar */}
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
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};
