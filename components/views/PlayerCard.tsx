import React, { useMemo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, HealthStatus, PlayerAttributes, TransferOfferStatus, PlayerCareerStatsSnapshot, IndividualTalkType, LoanOfferDuration, PlayerPosition, PlayerSeasonHistoryEntry } from '../../types';
import { REGION_NATIONALITY_LABEL } from '../../constants';     
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { FreeAgentNegotiationService } from '../../services/FreeAgentNegotiationService';
import { PlayerCareerService } from '../../services/PlayerCareerService';
import { INDIVIDUAL_TALK_OPTIONS, IndividualTalkResult, PlayerMoraleService } from '../../services/PlayerMoraleService';

export const PlayerCard: React.FC = () => {
 const { viewedPlayerId, players, reserves, clubs, navigateTo, navigateWithoutHistory, previousViewState, userTeamId, toggleTransferList, toggleLoanAvailability, toggleUntouchable, setSquadRole, currentDate, transferOffers, isResigned, setContractManagementInitialMode, conductIndividualTalk, pendingOpenTalk, setPendingOpenTalk, submitLoanOffer } = useGame();
  const [showPricePanel, setShowPricePanel] = useState(false);
  const [transferPrice, setTransferPrice] = useState(0);
  const [priceStep, setPriceStep] = useState(50000);
  const [isTalkPanelOpen, setIsTalkPanelOpen] = useState(false);
  const [talkResult, setTalkResult] = useState<IndividualTalkResult | null>(null);
  const [showLoanOfferPanel, setShowLoanOfferPanel] = useState(false);
  const [loanOfferFee, setLoanOfferFee] = useState(0);
  const [loanWageCoverage, setLoanWageCoverage] = useState(60);
  const [loanDuration, setLoanDuration] = useState<LoanOfferDuration>('SEASON');
  const [loanFeedback, setLoanFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [showAllCareer, setShowAllCareer] = useState(false);
  useEffect(() => {
    if (pendingOpenTalk) {
      setIsTalkPanelOpen(true);
      setPendingOpenTalk(false);
    }
  }, [pendingOpenTalk]);
  const button3DStyle: React.CSSProperties = {
    boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
  };
  const lightButton3DStyle: React.CSSProperties = {
    boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
  };

  const data = useMemo(() => {
    if (!viewedPlayerId) return null;
   for (const clubId in players) {
      const player = players[clubId].find(p => p.id === viewedPlayerId);
      if (player) {
        let clubData = clubs.find(c => c.id === clubId);
        
        if (clubId === 'FREE_AGENTS') {
          clubData = {
            id: 'FREE_AGENTS',
            name: 'Bezrobotny',
            shortName: 'FREE',
            leagueId: 'NONE',
            colorsHex: ['#475569', '#1e293b'], 
            stadiumName: 'Brak',
            stadiumCapacity: 0,
            reputation: 0,
            isDefaultActive: true,
            rosterIds: [],
            stats: { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 0, form: [] },
            budget: 0, boardStrictness: 0, signingBonusPool: 0, transferBudget: 0
          };
        }
        return { player, club: clubData!, isReserve: false };
      }
    }
    const reservePlayer = reserves.find(p => p.id === viewedPlayerId);
    if (reservePlayer) {
      const clubData = clubs.find(c => c.id === reservePlayer.clubId);
      return { player: reservePlayer, club: clubData!, isReserve: true };
    }
    return null;
  }, [viewedPlayerId, players, reserves, clubs]);

  if (!data) return null;
 const isMatchContext = previousViewState === ViewState.MATCH_LIVE || previousViewState === ViewState.MATCH_LIVE_CUP;
  const { player, club, isReserve } = data;
  const isContractLocked = player.contractLockoutUntil && new Date(currentDate) < new Date(player.contractLockoutUntil);
  const PLN_TO_EUR = 4.25;
  const isPolishClub = club.leagueId.startsWith('L_PL_');
  const isTransferLocked = player.transferLockoutUntil && new Date(currentDate) < new Date(player.transferLockoutUntil);
  const visibleInterestedClubs = (player.interestedClubs || []).filter(clubId => clubId !== player.clubId);
  const pendingTransferClub = player.transferPendingClubId
    ? clubs.find(c => c.id === player.transferPendingClubId)
    : null;
  const hasPendingTransfer = !!player.transferPendingClubId && !!player.transferReportDate;
  const isLoanedPlayer = !!player.loan;
  const pendingTransferFeeLabel = player.transferPendingFee === 0
    ? 'Wolny transfer po wygaśnięciu kontraktu'
    : player.transferPendingFee
      ? `Kwota: ${player.transferPendingFee.toLocaleString('pl-PL')} PLN`
      : 'Transfer uzgodniony';
  const loanStartDate = player.loan ? new Date(player.loan.startDate) : null;
  const loanEndDate = player.loan ? new Date(player.loan.endDate) : null;
  const loanStartLabel = loanStartDate && !Number.isNaN(loanStartDate.getTime())
    ? loanStartDate.toLocaleDateString('pl-PL')
    : '-';
  const loanEndLabel = loanEndDate && !Number.isNaN(loanEndDate.getTime())
    ? loanEndDate.toLocaleDateString('pl-PL')
    : '-';
  const hasUserTransferAgreement = !!(userTeamId && transferOffers.find(offer =>
    offer.playerId === player.id &&
    offer.buyerClubId === userTeamId &&
    (
      offer.status === TransferOfferStatus.PLAYER_NEGOTIATION ||
      offer.status === TransferOfferStatus.AGREED_PRECONTRACT
    )
  ));
  const canSubmitLoanOffer = !!userTeamId &&
    !isReserve &&
    !isResigned &&
    player.clubId !== userTeamId &&
    player.clubId !== 'FREE_AGENTS' &&
    player.isAvailableForLoan &&
    !isLoanedPlayer &&
    !hasPendingTransfer &&
    !hasUserTransferAgreement;
  const estimatedMonthlyLoanWageCost = Math.round((((player.annualSalary || 0) / 12) * loanWageCoverage) / 100);
  const estimatedLoanTotalCost = estimatedMonthlyLoanWageCost + loanOfferFee;
  const roundedEstimatedLoanTotalCost = Math.ceil(estimatedLoanTotalCost / 5000) * 5000;
  const playerPositionLabel: Record<PlayerPosition, string> = {
    [PlayerPosition.GK]: 'Bramkarz',
    [PlayerPosition.DEF]: 'Obrońca',
    [PlayerPosition.MID]: 'Pomocnik',
    [PlayerPosition.FWD]: 'Napastnik',
  };
  const clubLogoUrl = club.logoFile
    ? new URL(`../../Graphic/logo/${club.logoFile}`, import.meta.url).href
    : null;
  const blockedReturnViews = new Set<ViewState>([
    ViewState.PLAYER_CARD,
    ViewState.TRANSFER_OFFER,
    ViewState.TRANSFER_PLAYER_NEGOTIATION,
    ViewState.FREE_AGENT_NEGOTIATION
  ]);
  const closeTarget = previousViewState && !blockedReturnViews.has(previousViewState)
    ? previousViewState
    : ViewState.DASHBOARD;

  const healthInfo = PlayerPresentationService.getHealthDisplay(player);
  const condColor = PlayerPresentationService.getConditionColorClass(player.condition);
  const playerMorale = PlayerMoraleService.ensurePlayerState(player);
  const moraleInfo = PlayerMoraleService.getInfo(playerMorale.morale);
  const canTalk = PlayerMoraleService.canTalk(playerMorale, currentDate);
  const nextTalkDate = PlayerMoraleService.getNextTalkDate(playerMorale);
  const promisedMinutesDeadline = playerMorale.promisedMinutesUntil ? new Date(playerMorale.promisedMinutesUntil) : null;
  const minutesDemandDeadline = playerMorale.minutesDemandUntil ? new Date(playerMorale.minutesDemandUntil) : null;
  const roleDemandDeadline = playerMorale.roleDemandUntil ? new Date(playerMorale.roleDemandUntil) : null;
  const transferListDemandDeadline = playerMorale.transferListDemandUntil ? new Date(playerMorale.transferListDemandUntil) : null;
  const hasActiveTransferListDemand = !!transferListDemandDeadline && !Number.isNaN(transferListDemandDeadline.getTime());
  const activeFreeAgentLockoutUntil = useMemo(() => {
    return FreeAgentNegotiationService.getClubLockoutUntil(player, userTeamId, currentDate);
  }, [player, userTeamId, currentDate]);

  const AttrBar = ({ label, value, change }: { label: string, value: number, change?: number }) => {
    let colorClass = "bg-slate-700";
    let glowClass = "";
    if (value >= 80) { colorClass = "bg-emerald-400"; glowClass = "shadow-[0_0_12px_rgba(52,211,153,0.6)]"; }
    else if (value >= 65) { colorClass = "bg-blue-400"; }
    else if (value >= 50) { colorClass = "bg-amber-400"; }
    else if (value > 0) { colorClass = "bg-red-500"; }

    return (
      <div className="group flex flex-col gap-[2px] mb-1">
        <div className="flex justify-between items-center px-1">
           <span className="text-[8px] font-black italic text-white uppercase tracking-tighter drop-shadow">{label}</span>
           <div className="flex items-center gap-1">
             {change !== undefined && change > 0 && <span className="text-emerald-400 text-[8px] font-black leading-none">▲</span>}
             {change !== undefined && change < 0 && <span className="text-rose-400 text-[8px] font-black leading-none">▼</span>}
             <span className={`text-[11px] font-black font-mono drop-shadow ${value >= 80 ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
           </div>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
           <div className={`h-full transition-all duration-1000 ${colorClass} ${glowClass}`} style={{ width: `${value}%` }} />
        </div>
      </div>
    );
  };

  const attrs = player.attributes || {} as PlayerAttributes;
  const seasonalChanges = player.stats?.seasonalChanges || {};
  const formatCareerDate = (month: number | null, year: number | null) => {
    if (!month || !year) return 'obecnie';
    return `${String(month).padStart(2, '0')}/${year}`;
  };
  const formatTransferFee = (fee?: number) => {
    if (!fee) return '—';
    if (fee >= 1_000_000) return `${(fee / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (fee >= 1_000) return `${Math.round(fee / 1_000)}K`;
    return fee.toString();
  };
  const handleIndividualTalk = (talkType: IndividualTalkType) => {
    const result = conductIndividualTalk(player.id, talkType);
    if (result) {
      setTalkResult(result);
    }
  };
  const handleSubmitLoanOffer = () => {
    const result = submitLoanOffer(player.id, {
      loanFee: loanOfferFee,
      wageCoveragePercent: loanWageCoverage,
      loanDuration,
    });

    setLoanFeedback({ ok: result.ok, message: result.message });

    if (result.ok) {
      setShowLoanOfferPanel(false);
    }
  };
  const careerRows = useMemo(() => {
    const baseHistory = [...(player.history || [])];
    if (baseHistory.length === 0 && player.clubId && player.clubId !== 'FREE_AGENTS') {
      const d = new Date(currentDate);
      baseHistory.push({
        clubId: player.clubId,
        clubName: isReserve ? `${club.name} II` : club.name,
        fromYear: d.getFullYear(),
        fromMonth: d.getMonth() + 1,
        toYear: null,
        toMonth: null
      });
    }
    const seasonHistory: PlayerSeasonHistoryEntry[] = player.seasonHistory || [];
    const clubsWithSeasonHistory = new Set(seasonHistory.map(s => s.clubId));
    const historyRows = baseHistory
      .filter(entry => {
        if (entry.toYear === null && entry.clubId !== player.clubId && clubsWithSeasonHistory.has(entry.clubId)) return false;
        return true;
      })
      .map((entry, index) => {
        const isLoanEntry = entry.isLoan === true;
        const isCurrentClubEntry = entry.toYear === null && entry.clubId === player.clubId;
        const isReserveEntry = entry.clubName.endsWith(' II');
        const statsSnapshot: PlayerCareerStatsSnapshot | null = isCurrentClubEntry
          ? (isLoanEntry && player.loan
              ? PlayerCareerService.buildLoanStatsSnapshot(player)
              : isReserveEntry && player.reserveStats
              ? {
                  matchesPlayed: player.reserveStats.matches,
                  goals: player.reserveStats.goals,
                  assists: player.reserveStats.assists,
                  yellowCards: player.reserveStats.yellowCards ?? 0,
                  redCards: player.reserveStats.redCards ?? 0,
                  averageRating: player.reserveStats.matches > 0
                    ? parseFloat((player.reserveStats.totalRatingPoints / player.reserveStats.matches).toFixed(1))
                    : null
                }
              : PlayerCareerService.buildStatsSnapshot(player))
          : entry.statsSnapshot || null;
        return {
          key: `${entry.clubId}-${entry.fromYear}-${entry.fromMonth}-${index}`,
          clubId: entry.clubId,
          clubName: entry.clubId === 'FREE_AGENTS' ? 'Bez klubu' : (isReserve && isCurrentClubEntry && !entry.clubName.endsWith(' II')) ? `${entry.clubName} II` : entry.clubName,
          transferFee: entry.transferFee,
          isLoanEntry,
          isCurrentClubEntry,
          periodLabel: `${formatCareerDate(entry.fromMonth, entry.fromYear)} - ${formatCareerDate(entry.toMonth, entry.toYear)}`,
          statsSnapshot,
          sortKey: isCurrentClubEntry ? 9999999 : entry.fromYear * 12 + (entry.fromMonth || 1)
        };
      });
    const seasonRows = seasonHistory.map(s => ({
      key: `season-${s.clubId}-${s.season}-${s.fromYear}-${s.fromMonth}`,
      clubId: s.clubId,
      clubName: s.clubName,
      transferFee: undefined as number | undefined,
      isLoanEntry: s.isLoan || false,
      isCurrentClubEntry: false,
      periodLabel: `${formatCareerDate(s.fromMonth, s.fromYear)} - ${formatCareerDate(s.toMonth, s.toYear)}`,
      statsSnapshot: {
        matchesPlayed: s.matchesPlayed,
        goals: s.goals,
        assists: s.assists,
        yellowCards: s.yellowCards,
        redCards: s.redCards,
        averageRating: s.averageRating
      } as PlayerCareerStatsSnapshot,
      sortKey: s.fromYear * 12 + (s.fromMonth || 1)
    }));
    return [...historyRows, ...seasonRows].sort((a, b) => b.sortKey - a.sortKey);
  }, [clubs, player, club, currentDate, isReserve]);



  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 animate-fade-in overflow-y-auto custom-scrollbar" style={{ backgroundImage: "url('../Graphic/themes/playercard.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#020617' }}>
      <div className="fixed inset-0 bg-black/70 pointer-events-none" />

      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-10" style={{ background: club.colorsHex[0] }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-5" style={{ background: club.colorsHex[1] }} />
      </div>

      <div className="relative w-fit bg-slate-900/[0.35] rounded-none border border-transparent overflow-hidden flex flex-col md:flex-row md:items-center" style={{maxHeight:'925px', zoom: 1.44}}>
        <button
          onClick={() => navigateWithoutHistory(closeTarget)}
          className="absolute left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-900 text-lg font-black transition-all hover:scale-105 active:translate-y-[2px] border-t border-x border-b border-t-white/80 border-x-white/40 border-b-slate-400/60"
          style={lightButton3DStyle}
          aria-label="Zamknij kartę"
          title="Zamknij kartę"
        >
          ×
        </button>
        
           <div className="w-full md:w-[305px] relative flex flex-col items-center justify-between p-6 border-r border-white/5 overflow-hidden overflow-y-auto custom-scrollbar">
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
              <span className="text-[30rem] font-black italic select-none">{player.position}</span>
           </div>

           <div className="relative z-10 text-center w-full bg-slate-900/[0.15] rounded-xl p-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60">Profil Zawodnika PZPN</span>
              </div>
              {player.isOnTransferList && (
                <div className="mb-4 animate-pulse">
                   <span className="bg-amber-500 text-black text-[10px] font-black px-4 py-1 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                     LISTA TRANSFEROWA
                   </span>
                </div>
              )}
              {player.isAvailableForLoan && !player.loan && (
                <div className="mb-4">
                   <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black italic uppercase tracking-tighter px-4 py-1 rounded-full border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                     DOSTĘPNY DO WYPOŻYCZENIA
                   </span>
                </div>
              )}
              {player.isUntouchable && !player.isOnTransferList && (
                <div className="mb-4">
                   <span className="bg-rose-600 text-white text-[10px] font-black italic uppercase tracking-tighter px-4 py-1 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.45)]">
                     NIE NA SPRZEDAŻ
                   </span>
                </div>
              )}
              {hasPendingTransfer && (
                <div className="mb-4">
                   <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-4 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                     TRS • TRANSFER UZGODNIONY
                   </span>
                </div>
              )}

              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-[0.85] mb-1 drop-shadow-2xl">
                 {player.firstName}<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-400 to-slate-600">{player.lastName}</span>
              </h2>

              {(player.nationalStats?.matchesPlayed ?? 0) >= 1 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/30 border border-red-500/30 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-300">Kadra Narodowa</span>
                  <span className="text-[10px] font-black text-white font-mono">{player.nationalStats!.matchesPlayed}/{player.nationalStats!.goals}</span>
                </div>
              )}
              {player.loan && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/30 mb-1">
                  <span className="text-[9px] font-black italic uppercase tracking-tighter text-cyan-300">Wypożyczenie</span>
                  <span className="text-[10px] font-black text-white font-mono">{loanEndLabel}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 mt-2">
                 <div className={`px-4 py-1 rounded-xl border-2 font-black italic tracking-tighter text-lg ${PlayerPresentationService.getPositionBadgeClass(player.position)}`}>
                    {player.position}
                 </div>
                 <div className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                    {player.age} lat • {player.nationalityCountry || REGION_NATIONALITY_LABEL[player.nationality] || player.nationality}
                 </div>
              </div>
           </div>

           <div className="relative z-10 group mt-4 mb-4">
              <div className="absolute inset-[-15px] bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-36 h-36 rounded-full border-4 border-white/5 flex flex-col items-center justify-center shadow-2xl relative bg-slate-950 overflow-hidden">
                 <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, ${club.colorsHex[0]}, transparent)` }} />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Rating</span>
                 <span className="text-6xl font-black text-white italic tracking-tighter leading-none relative z-10 drop-shadow-lg">{player.overallRating}</span>
                 <div className="absolute bottom-4 h-1 w-12 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" />
              </div>
           </div>

           <div className="relative z-10 w-full flex flex-col gap-2">
            <div className="flex items-center justify-between p-3 bg-black/25 rounded-[20px] border border-white/5">
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status Kontraktu</span>
                    <span className="text-xs font-black text-white italic uppercase tracking-tight">
                       {club.id === 'FREE_AGENTS' ? 'Wolny Agent' : isReserve ? `${club.name} II` : club.name}
                    </span>
                 </div>
                 <div className="w-10 h-10 rounded-xl flex flex-col overflow-hidden border border-white/20 shadow-lg">
                    {club.id === 'FREE_AGENTS' ? (
                      <div className="flex-1 bg-slate-700 flex items-center justify-center text-xs">🚫</div>
                    ) : (
                      <>
                        <div style={{ backgroundColor: club.colorsHex[0] }} className="flex-1" />
                        <div style={{ backgroundColor: club.colorsHex[1] || club.colorsHex[0] }} className="flex-1" />
                      </>
                    )}
                 </div>
              </div>

              <div className="p-3 bg-black/25 rounded-[20px] border border-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Morale zawodnika</span>
                    <span className={`text-xs font-black italic uppercase tracking-tighter ${moraleInfo.colorClass}`}>{moraleInfo.label}</span>
                  </div>
                  {player.clubId === userTeamId && !isMatchContext && (
                    <button
                      onClick={() => { setIsTalkPanelOpen(true); setTalkResult(null); }}
                      disabled={!canTalk}
                      className={`px-3 py-1.5 rounded-[12px] text-[8px] font-black italic uppercase tracking-tighter border-t border-x border-b border-b-black/60 transition-all active:translate-y-[2px]
                        ${canTalk
                          ? 'bg-emerald-500/10 border-t-emerald-400/40 border-x-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20'
                          : 'bg-slate-800 border-t-slate-600 border-x-slate-700 text-slate-500 cursor-not-allowed'}`}
                      style={button3DStyle}
                    >
                      {canTalk ? 'Rozmowa' : nextTalkDate ? `Od ${nextTalkDate.toLocaleDateString('pl-PL')}` : 'Blokada'}
                    </button>
                  )}
                </div>
                {promisedMinutesDeadline && !Number.isNaN(promisedMinutesDeadline.getTime()) && (
                  <div className="mt-2 rounded-[12px] border border-amber-500/30 bg-amber-500/10 px-2 py-1.5">
                    <span className="block text-[7px] font-black italic uppercase tracking-tighter text-amber-300">
                      Obiecane minuty do {promisedMinutesDeadline.toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                )}
                {minutesDemandDeadline && !Number.isNaN(minutesDemandDeadline.getTime()) && (
                  <div className="mt-2 rounded-[12px] border border-orange-500/30 bg-orange-500/10 px-2 py-1.5">
                    <span className="block text-[7px] font-black italic uppercase tracking-tighter text-orange-300">
                      Domaga się występów do {minutesDemandDeadline.toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                )}
                {roleDemandDeadline && !Number.isNaN(roleDemandDeadline.getTime()) && playerMorale.requestedSquadRole && (
                  <div className="mt-2 rounded-[12px] border border-violet-500/30 bg-violet-500/10 px-2 py-1.5">
                    <span className="block text-[7px] font-black italic uppercase tracking-tighter text-violet-300">
                      Domaga się statusu: {playerMorale.requestedSquadRole === 'KEY_PLAYER' ? 'kluczowy zawodnik' : 'podstawowa jedenastka'} do {roleDemandDeadline.toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                )}
                {transferListDemandDeadline && !Number.isNaN(transferListDemandDeadline.getTime()) && (
                  <div className="mt-2 rounded-[12px] border border-red-500/30 bg-red-500/10 px-2 py-1.5">
                    <span className="block text-[7px] font-black italic uppercase tracking-tighter text-red-300">
                      Prosi o listę transferową do {transferListDemandDeadline.toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                )}
              </div>

              {player.loan && (
                <div className="p-3 bg-cyan-500/10 rounded-[20px] border border-cyan-500/25">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[8px] font-black italic uppercase tracking-tighter text-cyan-300">Status wypożyczenia</span>
                      <span className="text-xs font-black italic uppercase tracking-tighter text-white">
                        {player.loan.parentClubName} → {player.loan.destinationClubName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[7px] font-black italic uppercase tracking-tighter text-cyan-300">Okres</span>
                      <span className="text-[10px] font-black text-white font-mono">{loanStartLabel} - {loanEndLabel}</span>
                    </div>
                  </div>
                </div>
              )}

           </div>
        </div>



       

        <div className="flex-1 p-4 overflow-hidden flex gap-4">

          {/* ÅšRODKOWY PANEL: atrybuty + statystyki + zdrowie */}
          <div className="w-[480px] flex-shrink-0 flex flex-col gap-3 overflow-hidden">

            {/* BOX ATRYBUTÃ“W */}
            <div className="flex-1 bg-transparent rounded-[24px] border border-white/5 p-5 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <AttrBar label="Szybkość" value={attrs.pace} change={seasonalChanges['pace']} />
                  <AttrBar label="Siła" value={attrs.strength} change={seasonalChanges['strength']} />
                  <AttrBar label="Kondycja" value={attrs.stamina} change={seasonalChanges['stamina']} />
                  <AttrBar label="Obrona" value={attrs.defending} change={seasonalChanges['defending']} />
                  <AttrBar label="Podania" value={attrs.passing} change={seasonalChanges['passing']} />
                  <AttrBar label="Atak" value={attrs.attacking} change={seasonalChanges['attacking']} />
                  <AttrBar label="Wykończenie" value={attrs.finishing} change={seasonalChanges['finishing']} />
                  <AttrBar label="Technika" value={attrs.technique} change={seasonalChanges['technique']} />
                  <AttrBar label="Drybling" value={attrs.dribbling} change={seasonalChanges['dribbling']} />
                  <AttrBar label="Wizja" value={attrs.vision} change={seasonalChanges['vision']} />
                  <AttrBar label="Ustawianie się" value={attrs.positioning} change={seasonalChanges['positioning']} />
                </div>
                <div>
                  {player.position === 'GK'
                    ? <AttrBar label="Bramkarstwo" value={attrs.goalkeeping} change={seasonalChanges['goalkeeping']} />
                    : <AttrBar label="Główki" value={attrs.heading} change={seasonalChanges['heading']} />
                  }
                  <AttrBar label="Talent" value={attrs.talent} />
                  <AttrBar label="Liderstwo" value={attrs.leadership} change={seasonalChanges['leadership']} />
                  <AttrBar label="Mentalność" value={attrs.mentality} change={seasonalChanges['mentality']} />
                  <AttrBar label="Pracowitość" value={attrs.workRate} change={seasonalChanges['workRate']} />
                  <AttrBar label="Agresja" value={attrs.aggression} change={seasonalChanges['aggression']} />
                  <AttrBar label="Rzuty Wolne" value={attrs.freeKicks} change={seasonalChanges['freeKicks']} />
                  <AttrBar label="Rzuty Karne" value={attrs.penalties} change={seasonalChanges['penalties']} />
                  <AttrBar label="Rzuty Rożne" value={attrs.corners} change={seasonalChanges['corners']} />
                  <AttrBar label="Dośrodkowania" value={attrs.crossing} change={seasonalChanges['crossing']} />
                </div>
              </div>
            </div>

            {/* STATYSTYKI SEZONOWE — tabela */}
            <div className="flex-shrink-0">
              <div className="overflow-hidden rounded-[10px] border border-white/20">
                <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="px-2 py-1.5 text-[8px] font-black italic uppercase tracking-tighter text-slate-400 drop-shadow border-b border-r border-white/20" style={{ minWidth: '90px' }}>Rozgrywki</th>
                      <th className="px-2 py-1.5 text-center text-[8px] font-black italic uppercase tracking-tighter text-white drop-shadow border-b border-r border-white/20">M</th>
                      <th className="px-2 py-1.5 text-center text-[11px] drop-shadow border-b border-r border-white/20">⚽</th>
                      <th className="px-2 py-1.5 text-center text-[8px] font-black italic uppercase tracking-tighter text-sky-400 drop-shadow border-b border-r border-white/20">A</th>
                      <th className="px-2 py-1.5 text-center text-[11px] drop-shadow border-b border-r border-white/20">🟨</th>
                      <th className="px-2 py-1.5 text-center text-[11px] drop-shadow border-b border-white/20">🟥</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rows: { label: string; labelClass: string; m: number; g: number; a: number; y: number; r: number }[] = [];
                      rows.push({ label: 'Liga', labelClass: 'text-emerald-400', m: player.stats.matchesPlayed, g: player.stats.goals, a: player.stats.assists, y: player.stats.yellowCards, r: player.stats.redCards });
                      if (player.reserveStats) rows.push({ label: 'Rezerwy', labelClass: 'text-violet-400', m: player.reserveStats.matches, g: player.reserveStats.goals, a: player.reserveStats.assists, y: player.reserveStats.yellowCards ?? 0, r: player.reserveStats.redCards ?? 0 });
                      if ((player.cupStats?.matchesPlayed ?? 0) >= 1) rows.push({ label: 'Puchar PL', labelClass: 'text-orange-400', m: player.cupStats!.matchesPlayed, g: player.cupStats!.goals, a: player.cupStats!.assists, y: player.cupStats!.yellowCards, r: player.cupStats!.redCards });
                      if ((player.euroStats?.matchesPlayed ?? 0) >= 1) rows.push({ label: 'Europejskie', labelClass: 'text-blue-400', m: player.euroStats!.matchesPlayed, g: player.euroStats!.goals, a: player.euroStats!.assists, y: player.euroStats!.yellowCards, r: player.euroStats!.redCards });
                      if ((player.nationalStats?.matchesPlayed ?? 0) >= 1) rows.push({ label: 'Reprezentacja', labelClass: 'text-red-400', m: player.nationalStats!.matchesPlayed, g: player.nationalStats!.goals, a: player.nationalStats!.assists, y: player.nationalStats!.yellowCards, r: player.nationalStats!.redCards });
                      return rows.map((row, i) => (
                        <tr key={row.label} className={i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800'}>
                          <td className={`px-2 py-1.5 text-[9px] font-black italic uppercase tracking-tighter drop-shadow border-r border-white/20 ${row.labelClass} ${i < rows.length - 1 ? 'border-b border-white/10' : ''}`}>{row.label}</td>
                          <td className={`px-2 py-1.5 text-center text-[11px] font-black font-mono text-white drop-shadow border-r border-white/20 ${i < rows.length - 1 ? 'border-b border-white/10' : ''}`}>{row.m}</td>
                          <td className={`px-2 py-1.5 text-center text-[11px] font-black font-mono text-emerald-400 drop-shadow border-r border-white/20 ${i < rows.length - 1 ? 'border-b border-white/10' : ''}`}>{row.g}</td>
                          <td className={`px-2 py-1.5 text-center text-[11px] font-black font-mono text-sky-400 drop-shadow border-r border-white/20 ${i < rows.length - 1 ? 'border-b border-white/10' : ''}`}>{row.a}</td>
                          <td className={`px-2 py-1.5 text-center text-[11px] font-black font-mono text-yellow-400 drop-shadow border-r border-white/20 ${i < rows.length - 1 ? 'border-b border-white/10' : ''}`}>{row.y}</td>
                          <td className={`px-2 py-1.5 text-center text-[11px] font-black font-mono text-red-500 drop-shadow ${i < rows.length - 1 ? 'border-b border-white/10' : ''}`}>{row.r}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* STAN ZDROWIA */}
            <div className="flex-shrink-0 flex flex-col gap-2">
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] flex items-center gap-3 drop-shadow">
                <span className="w-8 h-px bg-rose-500/30" /> Stan Zdrowia
              </h3>
              <div className="flex gap-2">
                <div className="bg-transparent p-3 rounded-[20px] border border-white/5 flex items-center justify-between flex-1">
                  <div>
                    <span className="block text-[8px] font-black text-white uppercase tracking-widest mb-1 drop-shadow">Dostępność</span>
                    <span className={`text-xs font-black uppercase italic drop-shadow ${healthInfo.colorClass}`}>{healthInfo.text}</span>
                  </div>
                  {player.health.status === HealthStatus.INJURED && player.health.injury?.injuryDate && (
                    <div className="text-right border-l border-white/5 pl-3">
                      <span className="block text-[8px] font-black text-white uppercase tracking-widest mb-1 drop-shadow">Data urazu</span>
                      <span className="text-[10px] font-black text-white font-mono italic drop-shadow">
                        {new Date(player.health.injury.injuryDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                  )}
                  {player.health.status === HealthStatus.INJURED && (
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse border border-red-500/20">🏥</div>
                  )}
                </div>
                <div className="bg-transparent p-3 rounded-[20px] border border-white/5 flex flex-col justify-center flex-1">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest drop-shadow">Kondycja / Limit Energii</span>
                    <div className="flex items-center gap-2">
                      {player.fatigueDebt > 0 && (
                        <span className="text-[10px] font-black text-red-500 uppercase italic drop-shadow">SPADEK {Math.round(player.fatigueDebt)}%</span>
                      )}
                      <span className="text-xs font-black font-mono text-white drop-shadow">{Math.round(player.condition)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-red-900/20 rounded-full overflow-hidden border border-white/5 relative">
                    {/* Czerwona strefa dÅ‚ugu */}
                    <div className="absolute inset-0 bg-black/60" style={{ left: `${100 - (player.fatigueDebt || 0)}%` }} />
                    {/* Pasek kondycji */}
                    <div className={`h-full ${condColor} transition-all duration-1000 relative z-10`} style={{ width: `${player.condition}%` }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
          {/* PRAWY PANEL: historia + kontrakt i wynagrodzenie */}
          <div className="w-[400px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            <div className="rounded-[18px] border border-white/20 px-3 py-2" style={{ backgroundColor: 'rgba(30,41,59,0.92)' }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-5 bg-sky-400" />
                <h3 className="text-[9px] font-semibold uppercase tracking-[0.28em] text-sky-300 drop-shadow">
                  Przebieg Kariery
                </h3>
              </div>
              {careerRows.length > 0 ? (
                <>
                <div className="overflow-hidden rounded-[10px]" style={{ border: '1px solid rgba(180,140,60,0.5)' }}>
                  <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(180,140,60,0.22)' }}>
                        <th className="px-2 py-1 font-medium uppercase tracking-wide text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>Okres</th>
                        <th className="px-2 py-1 font-medium uppercase tracking-wide text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>Klub</th>
                        <th className="px-1.5 py-1 text-center font-medium uppercase tracking-wide text-[7px] drop-shadow" style={{ color: '#fbbf24', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>CENA</th>
                        <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>M</th>
                        <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#6ee7b7', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{ '\u26BD' }</th>
                        <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#7dd3fc', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{ '\uD83D\uDC5F' }</th>
                        <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#fde047', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{ '\uD83D\uDFE8' }</th>
                        <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#f87171', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{ '\uD83D\uDFE5' }</th>
                        <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.6)' }}>{ '\uD83D\uDCCA' }</th>
                      </tr>
                    </thead>
                    <tbody>
                      {careerRows.slice(0, 3).map(({ key, clubName, transferFee, isLoanEntry, isCurrentClubEntry, periodLabel, statsSnapshot }) => (
                        <tr key={key} style={{ backgroundColor: isCurrentClubEntry ? (isLoanEntry ? 'rgba(34,211,238,0.14)' : 'rgba(96,165,250,0.15)') : 'transparent' }}>
                          <td className="px-2 py-1 font-normal text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>
                            {periodLabel}
                          </td>
                          <td className="px-2 py-1 font-normal text-[7px] drop-shadow" style={{ color: '#ffffff', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>
                            <span className="block max-w-[92px] truncate">
                              {clubName}
                            </span>
                            {isLoanEntry && (
                              <span className="mt-0.5 inline-block rounded bg-cyan-500/15 px-1 py-[1px] text-[5px] font-black italic uppercase tracking-tighter text-cyan-300">
                                Wypożyczenie
                              </span>
                            )}
                          </td>
                          <td className="px-1.5 py-1 text-center font-normal text-[7px] drop-shadow" style={{ color: '#fbbf24', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{formatTransferFee(transferFee)}</td>
                          <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#ffffff', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.matchesPlayed : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#6ee7b7', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.goals : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#7dd3fc', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.assists : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#fde047', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.yellowCards : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#f87171', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.redCards : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#ffffff', borderBottom: '1px solid rgba(180,140,60,0.35)' }}>
                            {statsSnapshot?.averageRating !== null && statsSnapshot?.averageRating !== undefined
                              ? statsSnapshot.averageRating.toFixed(1)
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {careerRows.length > 3 && (
                  <button
                    onClick={() => setShowAllCareer(true)}
                    className="mt-1.5 w-full text-center text-[7px] font-semibold uppercase tracking-widest py-1 rounded-[8px] transition-colors"
                    style={{ color: '#fbbf24', backgroundColor: 'rgba(180,140,60,0.10)', border: '1px solid rgba(180,140,60,0.35)' }}
                  >
                    Zobacz więcej ({careerRows.length - 3})
                  </button>
                )}
                </>
              ) : (
                <div className="rounded-[10px] border border-dashed border-white/30 px-2 py-4 text-center font-normal text-[7px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Brak historii
                </div>
              )}
            </div>
            {showAllCareer && (
              <div className="fixed inset-0 z-[350] flex items-center justify-center p-4" onClick={() => setShowAllCareer(false)}>
                <div className="absolute inset-0 bg-black/80" />
                <div className="relative rounded-[18px] border p-4 w-[520px] max-h-[75vh] overflow-y-auto custom-scrollbar" style={{ backgroundColor: 'rgba(15,23,42,0.98)', border: '1px solid rgba(180,140,60,0.5)' }} onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-px w-5 bg-sky-400" />
                      <h3 className="text-[9px] font-semibold uppercase tracking-[0.28em] text-sky-300">Pełna Historia Kariery</h3>
                    </div>
                    <button onClick={() => setShowAllCareer(false)} className="text-white/50 hover:text-white text-[12px] leading-none">✕</button>
                  </div>
                  <div className="overflow-hidden rounded-[10px]" style={{ border: '1px solid rgba(180,140,60,0.5)' }}>
                    <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(180,140,60,0.22)' }}>
                          <th className="px-2 py-1 font-medium uppercase tracking-wide text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>Okres</th>
                          <th className="px-2 py-1 font-medium uppercase tracking-wide text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>Klub</th>
                          <th className="px-1.5 py-1 text-center font-medium uppercase tracking-wide text-[7px] drop-shadow" style={{ color: '#fbbf24', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>CENA</th>
                          <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>M</th>
                          <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#6ee7b7', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{'⚽'}</th>
                          <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#7dd3fc', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{'👟'}</th>
                          <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#fde047', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{'🟨'}</th>
                          <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#f87171', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{'🟥'}</th>
                          <th className="px-1.5 py-1 text-center font-medium text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.6)' }}>{'📊'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {careerRows.map(({ key, clubName, transferFee, isLoanEntry, isCurrentClubEntry, periodLabel, statsSnapshot }) => (
                          <tr key={key} style={{ backgroundColor: isCurrentClubEntry ? (isLoanEntry ? 'rgba(34,211,238,0.14)' : 'rgba(96,165,250,0.15)') : 'transparent' }}>
                            <td className="px-2 py-1 font-normal text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{periodLabel}</td>
                            <td className="px-2 py-1 font-normal text-[7px] drop-shadow" style={{ color: '#ffffff', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>
                              <span className="block max-w-[92px] truncate">{clubName}</span>
                              {isLoanEntry && (
                                <span className="mt-0.5 inline-block rounded bg-cyan-500/15 px-1 py-[1px] text-[5px] font-black italic uppercase tracking-tighter text-cyan-300">Wypożyczenie</span>
                              )}
                            </td>
                            <td className="px-1.5 py-1 text-center font-normal text-[7px] drop-shadow" style={{ color: '#fbbf24', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{formatTransferFee(transferFee)}</td>
                            <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#ffffff', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.matchesPlayed : '—'}</td>
                            <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#6ee7b7', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.goals : '—'}</td>
                            <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#7dd3fc', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.assists : '—'}</td>
                            <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#fde047', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.yellowCards : '—'}</td>
                            <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#f87171', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.redCards : '—'}</td>
                            <td className="px-1.5 py-1 text-center font-normal text-[8px] drop-shadow" style={{ color: '#ffffff', borderBottom: '1px solid rgba(180,140,60,0.35)' }}>
                              {statsSnapshot?.averageRating !== null && statsSnapshot?.averageRating !== undefined ? statsSnapshot.averageRating.toFixed(1) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] flex items-center gap-3 drop-shadow">
                <span className="w-8 h-px bg-amber-400/30" /> Kontrakt i Wynagrodzenie
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-transparent p-3 rounded-[20px] border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                <div>
                  <span className="block text-[8px] font-black text-white uppercase tracking-widest mb-1 drop-shadow">Roczne Wynagrodzenie</span>
                  <span className="text-sm font-black text-emerald-400 font-mono italic drop-shadow">
                    {isPolishClub
                      ? <>{player.annualSalary ? player.annualSalary.toLocaleString('pl-PL') : '0'} <span className="text-[10px] opacity-60 ml-1">PLN</span></>
                      : <>{player.annualSalary ? Math.round(player.annualSalary / PLN_TO_EUR).toLocaleString('pl-PL') : '0'} <span className="opacity-60 ml-1">€</span></>
                    }
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">💰</div>
              </div>
              <div className="bg-transparent p-3 rounded-[20px] border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                <div>
                  <span className="block text-[8px] font-black text-white uppercase tracking-widest mb-1 drop-shadow">
                    {club.id === 'FREE_AGENTS' ? 'Status' : 'Kontrakt DO'}
                  </span>
                  <span className="text-sm font-black text-white italic uppercase drop-shadow">
                    {club.id === 'FREE_AGENTS'
                      ? 'Brak Kontraktu'
                      : player.contractEndDate
                        ? new Date(player.contractEndDate).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
                        : 'Brak danych'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                  {club.id === 'FREE_AGENTS' ? '🚫' : '📅'}
                </div>
              </div>
              {hasPendingTransfer && (
                <div className="bg-transparent p-3 rounded-[20px] border border-emerald-500/20 flex items-center justify-between group hover:border-emerald-500/40 transition-colors">
                  <div>
                    <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1 drop-shadow">Zaplanowany transfer</span>
                    <span className="text-sm font-black text-white italic uppercase drop-shadow">
                      {pendingTransferClub?.name ?? player.transferPendingClubId}
                    </span>
                    <p className="text-[8px] font-black text-amber-400 uppercase drop-shadow tracking-widest mt-1">
                      {player.transferReportDate ? `Data przejścia: ${new Date(player.transferReportDate).toLocaleDateString('pl-PL')}` : 'Transfer uzgodniony'}
                    </p>
                    <p className="text-[8px] font-black text-emerald-300 uppercase drop-shadow tracking-widest mt-1">
                      {pendingTransferFeeLabel}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                    TRS
                  </div>
                </div>
              )}
              {player.loan && (
                <div className="bg-transparent p-3 rounded-[20px] border border-cyan-500/20 flex items-center justify-between group hover:border-cyan-500/40 transition-colors">
                  <div>
                    <span className="block text-[8px] font-black italic uppercase tracking-tighter text-cyan-300 mb-1 drop-shadow">Wypożyczenie</span>
                    <span className="text-sm font-black text-white italic uppercase drop-shadow">
                      {player.loan.destinationClubName}
                    </span>
                    <p className="text-[8px] font-black text-slate-300 uppercase drop-shadow tracking-widest mt-1">
                      Klub macierzysty: {player.loan.parentClubName}
                    </p>
                    <p className="text-[8px] font-black text-cyan-300 uppercase drop-shadow tracking-widest mt-1">
                      {loanStartLabel} - {loanEndLabel}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-300 border border-cyan-500/20 shadow-inner">
                    WYP
                  </div>
                </div>
              )}
              <div className="bg-transparent p-3 rounded-[20px] border border-emerald-500/20 flex items-center justify-between group hover:border-emerald-500/40 transition-all shadow-lg">
                <div>
                  <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1 drop-shadow">Cena Rynkowa</span>
                  <span className="text-lg font-black text-emerald-400 font-mono italic tabular-nums leading-none drop-shadow">
                    {isPolishClub
                      ? <>{player.marketValue ? player.marketValue.toLocaleString('pl-PL') : '0'} <span className="text-xs opacity-60 ml-1">PLN</span></>
                      : <>{player.marketValue ? Math.round(player.marketValue / PLN_TO_EUR).toLocaleString('pl-PL') : '0'} <span className="opacity-60 ml-1">€</span></>
                    }
                  </span>
                  <p className="text-[7px] text-white uppercase mt-1 font-bold tracking-tighter drop-shadow"></p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-500 border border-emerald-500/20 shadow-inner">
                  🏷️
                </div>
              </div>
            </div>

            {/* â”€â”€ ZAINTERESOWANIE TRANSFEROWE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                WyÅ›wietla kluby AI, ktÃ³re aktualnie obserwujÄ… tego zawodnika.
                Lista jest aktualizowana raz na miesiÄ…c przez AiScoutingService.
                W przyszÅ‚oÅ›ci: klikniÄ™cie klubu â†’ zÅ‚oÅ¼enie/odrzucenie oferty transferowej.
            â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {visibleInterestedClubs.length > 0 && (
              <div className="flex flex-col gap-1 mt-1">
                <h3 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em] flex items-center gap-3 drop-shadow">
                  <span className="w-8 h-px bg-violet-400/30" /> Zainteresowanie Transferowe
                </h3>
                <p className="text-[9px] font-black text-white/80 drop-shadow">
                  {visibleInterestedClubs.map(clubId => clubs.find(c => c.id === clubId)?.name).filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {player.clubId === userTeamId && !isMatchContext && (
              <div
                className="bg-slate-900/70 border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/70 rounded-[16px] p-3 mt-1 drop-shadow-lg"
                style={button3DStyle}
              >
                <p className="text-[10px] font-black italic uppercase tracking-widest text-slate-300 mb-2">Rola w zespole</p>
                <div className="flex gap-2">
                  {([
                    { value: null, label: 'Brak' },
                    { value: 'STARTER', label: 'Podstawowa 11' },
                    { value: 'KEY_PLAYER', label: 'Kluczowy' },
                  ] as const).map(opt => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setSquadRole(player.id, opt.value)}
                      className={`flex-1 py-2.5 rounded-[12px] font-black italic uppercase tracking-tighter text-[9px] border-t border-x border-b border-b-black/60 transition-all active:translate-y-[2px] drop-shadow
                        ${(player.squadRole ?? null) === opt.value
                          ? opt.value === 'KEY_PLAYER'
                            ? 'bg-rose-600 border-t-rose-300 border-x-rose-500 text-white shadow-[0_0_16px_rgba(225,29,72,0.35)]'
                            : opt.value === 'STARTER'
                            ? 'bg-blue-600 border-t-blue-300 border-x-blue-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.35)]'
                            : 'bg-slate-500 border-t-slate-200 border-x-slate-400 text-white shadow-[0_0_14px_rgba(148,163,184,0.25)]'
                          : 'bg-slate-800/45 border-t-slate-600/50 border-x-slate-700/40 text-slate-500 opacity-60 grayscale hover:opacity-85 hover:text-slate-300 hover:bg-slate-700/55'}`}
                      style={button3DStyle}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {player.clubId === userTeamId && !isMatchContext && (
              <div
                className="bg-slate-900/70 border-t border-x border-b border-t-white/10 border-x-white/5 border-b-black/70 rounded-[16px] p-3 mt-1 drop-shadow-lg"
                style={button3DStyle}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-300">Status transferowy</p>
                    <p className={`text-[8px] font-black italic uppercase tracking-tighter ${player.isUntouchable ? 'text-rose-300' : 'text-slate-500'}`}>
                      {player.isUntouchable
                        ? 'Tylko oferty wyjątkowe'
                        : player.isAvailableForLoan
                          ? 'Dostępny do wypożyczenia'
                          : 'Standardowe zapytania'}
                    </p>
                  </div>
                  <button
                    disabled={hasPendingTransfer}
                    onClick={() => toggleUntouchable(player.id)}
                    className={`min-w-[120px] py-2.5 px-3 rounded-[12px] font-black italic uppercase tracking-tighter text-[9px] border-t border-x border-b border-b-black/60 transition-all active:translate-y-[2px] drop-shadow
                      ${hasPendingTransfer
                        ? 'bg-slate-800 border-t-slate-600 border-x-slate-700 text-slate-600 opacity-50 cursor-not-allowed'
                        : player.isUntouchable
                        ? 'bg-rose-600 border-t-rose-300 border-x-rose-500 text-white shadow-[0_0_16px_rgba(225,29,72,0.35)]'
                        : 'bg-slate-800/45 border-t-slate-600/50 border-x-slate-700/40 text-slate-400 hover:bg-rose-600/20 hover:text-rose-200 hover:border-t-rose-400/40 hover:border-x-rose-500/20'}`}
                    style={button3DStyle}
                  >
                    {player.isUntouchable ? 'Odblokuj oferty' : 'Nie na sprzedaż'}
                  </button>
                </div>
                <button
                  disabled={hasPendingTransfer || isLoanedPlayer || player.isUntouchable}
                  onClick={() => toggleLoanAvailability(player.id)}
                  className={`w-full mt-2 py-2.5 px-3 rounded-[12px] font-black italic uppercase tracking-tighter text-[9px] border-t border-x border-b border-b-black/60 transition-all active:translate-y-[2px] drop-shadow
                    ${hasPendingTransfer || isLoanedPlayer || player.isUntouchable
                      ? 'bg-slate-800 border-t-slate-600 border-x-slate-700 text-slate-600 opacity-50 cursor-not-allowed'
                      : player.isAvailableForLoan
                        ? 'bg-cyan-600/25 border-t-cyan-300/60 border-x-cyan-500/30 text-cyan-200 hover:bg-cyan-600/35'
                        : 'bg-slate-800/45 border-t-slate-600/50 border-x-slate-700/40 text-slate-400 hover:bg-cyan-600/20 hover:text-cyan-200 hover:border-t-cyan-400/40 hover:border-x-cyan-500/20'}`}
                  style={button3DStyle}
                >
                  {player.isAvailableForLoan ? 'Zdejmij z wypożyczeń' : 'Dostępny do wypożyczenia'}
                </button>
              </div>
            )}

            {player.clubId === userTeamId && !isMatchContext && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    setContractManagementInitialMode('RELEASE');
                    navigateTo(ViewState.CONTRACT_MANAGEMENT);
                  }}
                  className="group relative h-12 bg-red-600/10 border-t border-x border-b border-t-red-400/40 border-x-red-500/20 border-b-black/60 rounded-[18px] flex items-center justify-center gap-3 transition-all hover:bg-red-600/20 hover:border-t-red-400/60 hover:border-x-red-500/40 active:translate-y-[2px]"
                  style={button3DStyle}
                >
                  <span className="text-xl group-hover:rotate-12 transition-transform">📄</span>
                  <div className="text-left">
                  
                    <span className="text-[11px] font-black text-white italic uppercase">ROZWIĄŻ KONTRAKT</span>
                  </div>
                </button>
                <button
                  disabled={isContractLocked || hasPendingTransfer}
                  onClick={() => {
                    setContractManagementInitialMode('NEGOTIATE');
                    navigateTo(ViewState.CONTRACT_MANAGEMENT);
                  }}
                  className={`group relative h-12 rounded-[18px] flex items-center justify-center gap-3 transition-all border-t border-x border-b border-b-black/60 active:translate-y-[2px]
                    ${isContractLocked || hasPendingTransfer
                      ? 'bg-slate-800 border-t-slate-600 border-x-slate-700 opacity-50 cursor-not-allowed'
                      : 'bg-blue-600/10 border-t-blue-400/40 border-x-blue-500/20 hover:bg-blue-600/20 hover:border-t-blue-400/60 hover:border-x-blue-500/40'
                    }`}
                  style={button3DStyle}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {isContractLocked || hasPendingTransfer ? '⏳' : '✍️'}
                  </span>
                  <div className="text-left">
                    <span className="block text-[8px] font-black uppercase tracking-widest drop-shadow">
                      {hasPendingTransfer ? 'TRANSFER' : isContractLocked ? 'BLOKADA CZASOWA' : 'NOWY KONTRAKT'}
                    </span>
                    <span className="text-[6px] font-black text-white italic uppercase drop-shadow">
                      {hasPendingTransfer ? 'DO INNEGO KLUBU' : isContractLocked ? 'UMOWA NIEDAWNO PODPISANA' : ''}
                    </span>
                  </div>
                </button>
              </div>
            )}

            {player.clubId === userTeamId && !isMatchContext && (
              <div className="mt-1">
                {showPricePanel && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPricePanel(false)}>
                    <div className="w-80 bg-slate-900/60 border border-amber-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md" onClick={e => e.stopPropagation()}>
                      <div className="text-[10px] font-black italic uppercase tracking-tighter text-amber-400 mb-4">Ustaw cenę</div>
                      <div className="text-center text-white text-[18px] font-black italic uppercase tracking-tighter mb-1">
                        {transferPrice.toLocaleString('pl-PL')} <span className="text-slate-400 text-[11px]">PLN</span>
                      </div>
                      <input
                        type="number"
                        value={transferPrice}
                        onChange={e => setTransferPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-[11px] font-black italic uppercase tracking-tighter text-right mb-3"
                      />
                      <div className="flex items-center gap-2 mb-5">
                        <button onClick={() => setTransferPrice(p => Math.max(0, p - priceStep))}
                          className="w-10 h-10 rounded-lg bg-red-900/40 border-t border-x border-b border-t-red-400/40 border-x-red-500/20 border-b-black/60 text-red-400 text-[18px] font-black italic uppercase tracking-tighter active:translate-y-[2px] hover:bg-red-900/70 flex items-center justify-center shrink-0"
                          style={button3DStyle}>
                          −
                        </button>
                        <select
                          value={priceStep}
                          onChange={e => setPriceStep(Number(e.target.value))}
                          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white text-[10px] font-black italic uppercase tracking-tighter text-center">
                          <option value={10000}>10 000</option>
                          <option value={50000}>50 000</option>
                          <option value={100000}>100 000</option>
                          <option value={250000}>250 000</option>
                          <option value={500000}>500 000</option>
                        </select>
                        <button onClick={() => setTransferPrice(p => p + priceStep)}
                          className="w-10 h-10 rounded-lg bg-emerald-900/40 border-t border-x border-b border-t-emerald-400/40 border-x-emerald-500/20 border-b-black/60 text-emerald-400 text-[18px] font-black italic uppercase tracking-tighter active:translate-y-[2px] hover:bg-emerald-900/70 flex items-center justify-center shrink-0"
                          style={button3DStyle}>
                          +
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowPricePanel(false)}
                          className="flex-1 py-2.5 rounded-[14px] font-black italic uppercase tracking-tighter text-[9px] bg-slate-700 border-t border-x border-b border-t-slate-500 border-x-slate-600 border-b-black/60 text-slate-400 active:translate-y-[2px]"
                          style={button3DStyle}>
                          Anuluj
                        </button>
                        <button onClick={() => { toggleTransferList(player.id, transferPrice); setShowPricePanel(false); }}
                          className="flex-1 py-2.5 rounded-[14px] font-black italic uppercase tracking-tighter text-[9px] bg-amber-600/20 border-t border-x border-b border-t-amber-400/50 border-x-amber-500/25 border-b-black/60 text-amber-500 active:translate-y-[2px]"
                          style={button3DStyle}>
                          Wystaw
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  disabled={hasPendingTransfer || isLoanedPlayer || (player.squadRole === 'KEY_PLAYER' && !hasActiveTransferListDemand)}
                  onClick={() => {
                    if (player.isOnTransferList) {
                      toggleTransferList(player.id);
                    } else {
                      setTransferPrice(player.marketValue || 1_000_000);
                      setShowPricePanel(true);
                    }
                  }}
                  className={`w-full py-2.5 rounded-[18px] font-black italic uppercase tracking-widest text-[10px] transition-all border-t border-x border-b border-b-black/60 active:translate-y-[2px] drop-shadow
                    ${hasPendingTransfer || isLoanedPlayer || (player.squadRole === 'KEY_PLAYER' && !hasActiveTransferListDemand)
                      ? hasPendingTransfer
                        ? "relative bg-slate-800 border-t-slate-600 border-x-slate-700 text-transparent opacity-60 cursor-not-allowed after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-slate-300 after:content-['TRANSFER_UZGODNIONY']"
                        : isLoanedPlayer
                          ? "relative bg-slate-800 border-t-slate-600 border-x-slate-700 text-transparent opacity-60 cursor-not-allowed after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-cyan-300 after:content-['WYPOŻYCZONY']"
                        : 'bg-slate-800 border-t-slate-600 border-x-slate-700 text-slate-600 opacity-50 cursor-not-allowed'
                      : player.isOnTransferList
                      ? 'bg-slate-800 border-t-slate-500 border-x-slate-600 text-slate-400 hover:bg-slate-700'
                      : 'bg-amber-600/20 border-t-amber-400/50 border-x-amber-500/25 text-amber-500 hover:bg-amber-600/30'}`}
                  style={button3DStyle}
                >
                  {player.isOnTransferList ? '❌ Zdejmij z listy transferowej' : '📥 Wystaw na listę transferową'}
                </button>
              </div>
            )}

            {player.clubId !== userTeamId && !isMatchContext && (
              <div className="mt-1">
                {player.clubId === 'FREE_AGENTS' ? (
                  <button
                    disabled={!!activeFreeAgentLockoutUntil}
                    onClick={() => {
                      navigateWithoutHistory(ViewState.FREE_AGENT_NEGOTIATION);
                    }}
                    className={`w-full py-3 rounded-[20px] font-black italic uppercase tracking-widest text-xs transition-all active:translate-y-[2px] border-t border-x border-b border-b-black/60
                      ${activeFreeAgentLockoutUntil
                        ? 'bg-slate-800 border-t-slate-600 border-x-slate-700 text-slate-500 opacity-70 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-t-emerald-300/60 border-x-emerald-500/40 hover:scale-[1.02]'}`}
                    style={button3DStyle}
                  >
                    {activeFreeAgentLockoutUntil
                      ? `Kontakt możliwy po ${new Date(activeFreeAgentLockoutUntil).toLocaleDateString('pl-PL')}`
                      : "OTWÓRZ BIURO NEGOCJACJI 🤝"}
                  </button>
                ) : !isResigned ? (
                  <div className="space-y-2">
                    <button
                      disabled={!!isTransferLocked || hasUserTransferAgreement || hasPendingTransfer || isLoanedPlayer}
                      onClick={() => navigateWithoutHistory(ViewState.TRANSFER_OFFER)}
                      className={`w-full py-3 rounded-[20px] font-black italic uppercase tracking-widest text-xs transition-all active:translate-y-[2px] border-t border-x border-b border-b-black/60 ${
                        (isTransferLocked || hasUserTransferAgreement || hasPendingTransfer || isLoanedPlayer)
                          ? 'bg-slate-800 border-t-slate-600 border-x-slate-700 text-slate-500 opacity-70 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500 text-white border-t-blue-300/60 border-x-blue-500/40 hover:scale-[1.02]'
                      }`}
                      style={button3DStyle}
                    >
                      {isLoanedPlayer ? `WYPOŻYCZONY DO ${loanEndLabel}` : 'ZŁÓŻ OFERTĘ TRANSFEROWĄ 💰'}
                    </button>

                    {canSubmitLoanOffer && (
                      <>
                        {/* PANEL OFERTY WYPOŻYCZENIA OD KLUBU AI
                            Ta sekcja jest widoczna tylko dla zawodników z klubów AI,
                            którzy mają ustawiony status "Dostępny do wypożyczenia".
                            Samo kliknięcie nie przenosi zawodnika od razu: formularz
                            wysyła ofertę do logiki w GameContext, gdzie sprawdzane są:
                            limit kadry gracza, budżet, oczekiwania klubu AI oraz zgoda zawodnika. */}
                        <button
                          onClick={() => {
                            setShowLoanOfferPanel(true);
                            setLoanFeedback(null);
                          }}
                          className="w-full py-3 rounded-[20px] font-black italic uppercase tracking-tighter text-xs transition-all active:translate-y-[2px] border-t border-x border-b border-b-black/60 bg-cyan-600/20 border-t-cyan-300/50 border-x-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30 hover:text-white hover:scale-[1.02] shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                          style={button3DStyle}
                        >
                          ZŁÓŻ OFERTĘ WYPOŻYCZENIA
                        </button>
                      </>
                    )}

                  </div>
                ) : null}
              </div>
            )}
          </div>

        </div>
      </div>

      {showLoanOfferPanel && canSubmitLoanOffer && (
        <div
          className="fixed inset-0 z-[255] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          onClick={() => setShowLoanOfferPanel(false)}
        >
          {/* MODAL NEGOCJACJI WYPOŻYCZENIA
              Ten formularz jest celowo poza główną kartą zawodnika. Karta ma już gęsty układ
              ze statystykami, historią kariery i akcjami, więc duży formularz w środku rozpychał
              widok i psuł proporcje. Modal pozwala prowadzić negocjacje nad kartą, bez wpływu
              na jej szerokość, wysokość oraz przewijanie.

              Logika nadal korzysta z tych samych stanów:
              - loanDuration określa długość wypożyczenia,
              - loanWageCoverage określa procent pensji pokrywany przez klub gracza,
              - loanOfferFee określa jednorazową opłatę dla klubu AI,
              - handleSubmitLoanOffer wysyła komplet warunków do GameContext.

              Dzięki temu zmieniamy tylko prezentację UI, a nie mechanikę akceptacji oferty. */}
          <div
            className="relative w-[680px] max-w-[94vw] max-h-[88vh] overflow-y-auto custom-scrollbar rounded-[34px] border border-cyan-300/30 bg-slate-950/80 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.10)]"
            style={{
              ...button3DStyle,
              backgroundImage: "linear-gradient(145deg, rgba(8,47,73,0.84), rgba(2,6,23,0.97)), url('../Graphic/themes/playercard.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_38%)] pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-5 mb-6">
              <div className="flex min-w-0 items-center gap-4">
                {clubLogoUrl && (
                  <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center p-1">
                    <img
                      src={clubLogoUrl}
                      alt={club.name}
                      className="max-h-full max-w-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-black italic uppercase tracking-tighter text-cyan-200 leading-none mb-2">
                    Biuro wypożyczeń
                  </p>
                  <h3 className="text-[30px] sm:text-[38px] font-black italic uppercase tracking-tighter text-white leading-none drop-shadow">
                    {player.firstName} {player.lastName}
                  </h3>
                  <p className="mt-3 text-[14px] sm:text-[16px] font-black italic uppercase tracking-tighter text-cyan-50 leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
                    {club.name} <span className="text-slate-400">•</span> <span className="text-red-300">{playerPositionLabel[player.position]}</span> <span className="text-slate-400">•</span> <span className="text-amber-300">OVR {player.overallRating}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLoanOfferPanel(false)}
                className="h-12 w-12 shrink-0 rounded-[18px] border-t border-x border-b border-t-white/25 border-x-white/10 border-b-black/70 bg-white/5 text-white text-2xl font-black italic uppercase tracking-tighter transition-all hover:bg-white/12 active:translate-y-[2px]"
                style={button3DStyle}
              >
                ×
              </button>
            </div>

            <div className="relative z-10 grid gap-5">
              {/* DŁUGOŚĆ WYPOŻYCZENIA
                  ROUND oznacza krótszy ruch do końca rundy, a SEASON klasyczne wypożyczenie
                  do końca sezonu. GameContext zamienia ten wybór na konkretną datę końcową,
                  dlatego UI nie wpisuje dat ręcznie i nie rozjeżdża kalendarza gry. */}
              <section className="rounded-[24px] border border-white/10 bg-black/28 p-4">
                <p className="mb-3 text-[12px] font-black italic uppercase tracking-tighter text-cyan-300">
                  Długość wypożyczenia
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: 'ROUND', label: 'Do końca rundy' },
                    { value: 'SEASON', label: 'Do końca sezonu' },
                  ] as const).map(option => (
                    <button
                      key={option.value}
                      onClick={() => setLoanDuration(option.value)}
                      className={`min-h-[54px] rounded-[20px] border-t border-x border-b border-b-black/70 px-3 text-[12px] font-black italic uppercase tracking-tighter transition-all active:translate-y-[2px] ${
                        loanDuration === option.value
                          ? 'bg-cyan-400 text-slate-950 border-t-cyan-100 border-x-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.32)]'
                          : 'bg-white/[0.05] text-slate-400 border-t-white/15 border-x-white/10 hover:bg-cyan-500/12 hover:text-cyan-100'
                      }`}
                      style={loanDuration === option.value ? lightButton3DStyle : button3DStyle}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* POKRYCIE PENSJI
                  Suwak zapisuje procent pensji, który klub gracza deklaruje płacić podczas
                  wypożyczenia. Wyższy procent poprawia siłę oferty, ale zwiększa miesięczny
                  koszt po stronie gracza. */}
              <section className="rounded-[24px] border border-white/10 bg-black/28 p-4">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <p className="text-[12px] font-black italic uppercase tracking-tighter text-cyan-300">
                    Pokrycie pensji
                  </p>
                  <p className="text-[28px] font-black italic uppercase tracking-tighter text-white leading-none">
                    {loanWageCoverage}%
                  </p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={loanWageCoverage}
                  onChange={e => setLoanWageCoverage(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <p className="mt-3 text-[10px] font-black italic uppercase tracking-tighter text-slate-400">
                  Miesięcznie: {estimatedMonthlyLoanWageCost.toLocaleString('pl-PL')} PLN
                </p>
              </section>

              {/* OPŁATA DLA KLUBU
                  To jednorazowa kwota płacona klubowi AI za samo wypożyczenie. Przyciski minus
                  i plus dają szybki skok o 50 000 PLN, a pole liczbowe pozwala wpisać dokładną
                  kwotę, gdy gracz chce złożyć bardziej precyzyjną propozycję. */}
              <section className="rounded-[24px] border border-white/10 bg-black/28 p-4">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <p className="text-[12px] font-black italic uppercase tracking-tighter text-cyan-300">
                    Opłata dla klubu
                  </p>
                  <p className="text-[28px] font-black italic uppercase tracking-tighter text-white leading-none">
                    {loanOfferFee.toLocaleString('pl-PL')} PLN
                  </p>
                </div>
                <div className="grid grid-cols-[64px_1fr_64px] gap-3">
                  <button
                    onClick={() => setLoanOfferFee(value => Math.max(0, value - 50000))}
                    className="h-14 rounded-[20px] bg-red-900/42 border-t border-x border-b border-t-red-300/35 border-x-red-500/25 border-b-black/70 text-red-200 text-3xl font-black italic uppercase tracking-tighter active:translate-y-[2px] hover:bg-red-800/55"
                    style={button3DStyle}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={loanOfferFee}
                    onChange={e => setLoanOfferFee(Math.max(0, Number(e.target.value)))}
                    className="h-14 min-w-0 rounded-[20px] bg-slate-950/72 border border-white/12 px-5 text-right text-white text-[18px] font-black italic uppercase tracking-tighter outline-none focus:border-cyan-300/60"
                  />
                  <button
                    onClick={() => setLoanOfferFee(value => value + 50000)}
                    className="h-14 rounded-[20px] bg-emerald-900/42 border-t border-x border-b border-t-emerald-300/35 border-x-emerald-500/25 border-b-black/70 text-emerald-200 text-3xl font-black italic uppercase tracking-tighter active:translate-y-[2px] hover:bg-emerald-800/55"
                    style={button3DStyle}
                  >
                    +
                  </button>
                </div>
              </section>

              <div className="flex items-center justify-between gap-4 rounded-[22px] border border-cyan-200/16 bg-slate-950/58 px-5 py-4">
                <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400">
                  Koszt startowy
                </span>
                <span className="text-[20px] font-black italic uppercase tracking-tighter text-cyan-200 leading-none">
                  {roundedEstimatedLoanTotalCost.toLocaleString('pl-PL')} PLN
                </span>
              </div>

              <button
                onClick={handleSubmitLoanOffer}
                className="min-h-[58px] rounded-[22px] bg-cyan-400 text-slate-950 border-t border-x border-b border-t-cyan-50 border-x-cyan-200 border-b-black/75 text-[14px] font-black italic uppercase tracking-tighter transition-all active:translate-y-[2px] hover:bg-cyan-200 shadow-[0_0_34px_rgba(34,211,238,0.32)]"
                style={lightButton3DStyle}
              >
                Wyślij ofertę wypożyczenia
              </button>
            </div>
          </div>
        </div>
      )}

      {loanFeedback && (
        <div
          className="fixed inset-0 z-[320] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
          onClick={() => setLoanFeedback(null)}
        >
          {/* POPUP ODPOWIEDZI NA OFERTĘ WYPOŻYCZENIA
              Komunikat po wysłaniu oferty jest oddzielony od modala negocjacji, żeby informacja
              o blokadzie zarządu, braku budżetu albo akceptacji nie wyglądała jak część formularza.
              To okno ma wyższy z-index niż modal wypożyczenia, więc zawsze pojawia się na wierzchu
              i wymaga świadomego zamknięcia przez gracza. */}
          <div
            className={`relative w-[560px] max-w-[92vw] rounded-[28px] border p-6 shadow-[0_24px_70px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)] ${
              loanFeedback.ok
                ? 'border-emerald-300/38 bg-emerald-950/82'
                : 'border-red-300/38 bg-red-950/82'
            }`}
            style={{
              ...button3DStyle,
              backgroundImage: loanFeedback.ok
                ? "linear-gradient(145deg, rgba(6,78,59,0.78), rgba(2,6,23,0.9)), url('../Graphic/themes/playercard.png')"
                : "linear-gradient(145deg, rgba(127,29,29,0.78), rgba(2,6,23,0.9)), url('../Graphic/themes/playercard.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%)] pointer-events-none" />
            <div className="relative z-10">
              <p className={`mb-3 text-[12px] font-black italic uppercase tracking-tighter leading-none ${
                loanFeedback.ok ? 'text-emerald-200' : 'text-red-200'
              }`}>
                {loanFeedback.ok ? 'Oferta wypożyczenia' : 'Oferta zablokowana'}
              </p>
              <p className="text-[18px] font-black italic uppercase tracking-tighter text-white leading-snug drop-shadow">
                {loanFeedback.message}
              </p>
              <button
                onClick={() => setLoanFeedback(null)}
                className={`mt-6 min-h-[48px] w-full rounded-[18px] border-t border-x border-b border-b-black/70 text-[12px] font-black italic uppercase tracking-tighter transition-all active:translate-y-[2px] ${
                  loanFeedback.ok
                    ? 'bg-emerald-300 text-emerald-950 border-t-emerald-50 border-x-emerald-200 hover:bg-emerald-200'
                    : 'bg-red-300 text-red-950 border-t-red-50 border-x-red-200 hover:bg-red-200'
                }`}
                style={lightButton3DStyle}
              >
                Rozumiem
              </button>
            </div>
          </div>
        </div>
      )}

      {isTalkPanelOpen && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/75 backdrop-blur-sm p-6" onClick={() => setIsTalkPanelOpen(false)}>
          <div className="w-[980px] max-w-[94vw] max-h-[88vh] overflow-y-auto custom-scrollbar bg-slate-950/95 border border-white/10 rounded-[34px] shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-6 mb-7">
              <div>
                <div className="text-sm font-black italic uppercase tracking-tighter text-emerald-400">Indywidualna rozmowa</div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mt-1">
                  {player.firstName} {player.lastName}
                </h3>
              </div>
              <button
                onClick={() => setIsTalkPanelOpen(false)}
                className="w-12 h-12 rounded-2xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-2xl font-black border-t border-x border-b border-t-white/20 border-x-white/10 border-b-black/60 transition-all active:translate-y-[2px]"
                style={button3DStyle}
              >
                ×
              </button>
            </div>

            {!canTalk && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-base font-black italic uppercase tracking-tighter mb-6 leading-snug">
                Kolejna rozmowa będzie możliwa {nextTalkDate ? nextTalkDate.toLocaleDateString('pl-PL') : 'za kilka dni'}.
              </div>
            )}

            {talkResult && (
              <div className={`p-6 rounded-3xl border mb-6 ${talkResult.isPositive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
                <div className="text-sm font-black italic uppercase tracking-tighter mb-2">Odpowiedź zawodnika</div>
                <p className="text-lg font-black italic uppercase tracking-tighter leading-relaxed">{talkResult.reactionText}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {INDIVIDUAL_TALK_OPTIONS.map(option => (
                <button
                  key={option.type}
                  disabled={!canTalk || !!talkResult}
                  onClick={() => handleIndividualTalk(option.type)}
                  className={`text-left min-h-[132px] p-6 rounded-3xl border-t border-x border-b border-b-black/60 transition-all active:translate-y-[2px]
                    ${!canTalk || !!talkResult
                      ? 'bg-slate-900 border-t-slate-700 border-x-slate-800 opacity-50 cursor-not-allowed'
                      : 'bg-white/[0.03] border-t-white/20 border-x-white/10 hover:bg-white/[0.06] hover:border-t-emerald-400/40 hover:border-x-emerald-500/20'}`}
                  style={button3DStyle}
                >
                  <span className="block text-lg font-black italic uppercase tracking-tighter text-white mb-3 leading-tight">{option.title}</span>
                  <span className="block text-sm font-bold text-slate-400 leading-snug">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};
