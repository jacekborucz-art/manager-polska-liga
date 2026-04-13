import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, HealthStatus, PlayerAttributes, TransferOfferStatus, PlayerCareerStatsSnapshot } from '../../types';
import { REGION_NATIONALITY_LABEL } from '../../constants';     
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { FreeAgentNegotiationService } from '../../services/FreeAgentNegotiationService';
import { PlayerCareerService } from '../../services/PlayerCareerService';

export const PlayerCard: React.FC = () => {
 const { viewedPlayerId, players, reserves, clubs, navigateTo, navigateWithoutHistory, previousViewState, userTeamId, toggleTransferList, currentDate, transferOffers, isResigned, setContractManagementInitialMode } = useGame();
  const [showPricePanel, setShowPricePanel] = useState(false);
  const [transferPrice, setTransferPrice] = useState(0);
  const [priceStep, setPriceStep] = useState(50000);

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
        return { player, club: clubData! };
      }
    }
    const reservePlayer = reserves.find(p => p.id === viewedPlayerId);
    if (reservePlayer) {
      const clubData = clubs.find(c => c.id === reservePlayer.clubId);
      return { player: reservePlayer, club: clubData! };
    }
    return null;
  }, [viewedPlayerId, players, reserves, clubs]);

  if (!data) return null;
 const isMatchContext = previousViewState === ViewState.MATCH_LIVE || previousViewState === ViewState.MATCH_LIVE_CUP;
  const { player, club } = data;
  const isContractLocked = player.contractLockoutUntil && new Date(currentDate) < new Date(player.contractLockoutUntil);
  const isTransferLocked = player.transferLockoutUntil && new Date(currentDate) < new Date(player.transferLockoutUntil);
  const visibleInterestedClubs = (player.interestedClubs || []).filter(clubId => clubId !== player.clubId);
  const pendingTransferClub = player.transferPendingClubId
    ? clubs.find(c => c.id === player.transferPendingClubId)
    : null;
  const hasPendingTransfer = !!player.transferPendingClubId && !!player.transferReportDate;
  const hasUserTransferAgreement = !!(userTeamId && transferOffers.find(offer =>
    offer.playerId === player.id &&
    offer.buyerClubId === userTeamId &&
    (
      offer.status === TransferOfferStatus.PLAYER_NEGOTIATION ||
      offer.status === TransferOfferStatus.AGREED_PRECONTRACT
    )
  ));
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
  const careerRows = useMemo(() => {
    const baseHistory = [...(player.history || [])];
    if (baseHistory.length === 0 && player.clubId && player.clubId !== 'FREE_AGENTS') {
      const d = new Date(currentDate);
      baseHistory.push({
        clubId: player.clubId,
        clubName: club.name,
        fromYear: d.getFullYear(),
        fromMonth: d.getMonth() + 1,
        toYear: null,
        toMonth: null
      });
    }
    return baseHistory
      .map((entry, index) => {
        const isCurrentClubEntry = entry.toYear === null && entry.clubId === player.clubId;
        const statsSnapshot: PlayerCareerStatsSnapshot | null = isCurrentClubEntry
          ? PlayerCareerService.buildStatsSnapshot(player)
          : entry.statsSnapshot || null;

        return {
          key: `${entry.clubId}-${entry.fromYear}-${entry.fromMonth}-${index}`,
          entry,
          isCurrentClubEntry,
          periodLabel: `${formatCareerDate(entry.fromMonth, entry.fromYear)} - ${formatCareerDate(entry.toMonth, entry.toYear)}`,
          statsSnapshot
        };
      })
      .reverse();
  }, [clubs, player, club, currentDate]);



  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 animate-fade-in overflow-y-auto custom-scrollbar" style={{ backgroundImage: "url('graphic/themes/playercard.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#020617' }}>
      <div className="fixed inset-0 bg-black/70 pointer-events-none" />

      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-10" style={{ background: club.colorsHex[0] }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-5" style={{ background: club.colorsHex[1] }} />
      </div>

      <div className="w-fit bg-slate-900/[0.35] rounded-none border border-transparent overflow-hidden flex flex-col md:flex-row md:items-center" style={{maxHeight:'925px', zoom: 1.44}}>
        
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
              
              <div className="flex items-center justify-center gap-4 mt-2">
                 <div className={`px-4 py-1 rounded-xl border-2 font-black italic tracking-tighter text-lg ${PlayerPresentationService.getPositionBadgeClass(player.position)}`}>
                    {player.position}
                 </div>
                 <div className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                    {player.age} lat • {REGION_NATIONALITY_LABEL[player.nationality] ?? player.nationality}
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
                       {club.id === 'FREE_AGENTS' ? 'Wolny Agent' : player.id.startsWith('RES_') ? `${club.name} II` : club.name}
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

<button 
                onClick={() => navigateWithoutHistory(closeTarget)}
                className="w-full py-2.5 rounded-[20px] bg-white text-slate-900 font-black italic uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xl"
              >
                Zamknij Kartę &times;
              </button>
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

            {/* STATYSTYKI SEZONOWE */}
            <div className="flex-shrink-0 flex flex-col gap-2">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] flex items-center gap-3 drop-shadow">
                <span className="w-8 h-px bg-emerald-500/30" /> Statystyki Sezonowe
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: 'Mecze', val: player.stats.matchesPlayed, icon: '📅' },
                  { label: 'Gole', val: player.stats.goals, icon: '⚽', color: 'text-emerald-400' },
                  { label: 'Asysty', val: player.stats.assists, icon: '👟', color: 'text-blue-400' },
                  { label: 'Żółte', val: player.stats.yellowCards, icon: '🟨', color: 'text-amber-400' },
                  { label: 'Czerwone', val: player.stats.redCards, icon: '🟥', color: 'text-red-500' },
                ].map((s, i) => (
                  <div key={i} className="bg-transparent p-2 rounded-2xl border border-white/5 text-center group hover:border-white/10 transition-all">
                    <span className="text-sm mb-0.5 block transform group-hover:scale-125 transition-transform">{s.icon}</span>
                    <span className={`text-lg font-black font-mono block drop-shadow ${s.color || 'text-white'}`}>{s.val}</span>
                    <span className="text-[7px] font-black text-white uppercase tracking-widest drop-shadow">{s.label}</span>
                  </div>
                ))}
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
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            <div className="rounded-[18px] border border-white/20 px-3 py-2" style={{ backgroundColor: 'rgba(30,41,59,0.92)' }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-5 bg-sky-400" />
                <h3 className="text-[9px] font-black uppercase tracking-[0.28em] text-sky-300 drop-shadow">
                  Przebieg Kariery
                </h3>
              </div>
              {careerRows.length > 0 ? (
                <div className="overflow-hidden rounded-[10px]" style={{ border: '1px solid rgba(180,140,60,0.5)' }}>
                  <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(180,140,60,0.22)' }}>
                        <th className="px-2 py-1 font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#fff', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>Okres</th>
                        <th className="px-2 py-1 font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#fff', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>Klub</th>
                        <th className="px-1.5 py-1 text-center font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#fff', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>M</th>
                        <th className="px-1.5 py-1 text-center font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#6ee7b7', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{ '\u26BD' }</th>
                        <th className="px-1.5 py-1 text-center font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#7dd3fc', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{ '\uD83D\uDC5F' }</th>
                        <th className="px-1.5 py-1 text-center font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#fde047', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{ '\uD83D\uDFE8' }</th>
                        <th className="px-1.5 py-1 text-center font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#f87171', borderBottom: '1px solid rgba(180,140,60,0.6)', borderRight: '1px solid rgba(180,140,60,0.6)' }}>{ '\uD83D\uDFE5' }</th>
                        <th className="px-1.5 py-1 text-center font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#fff', borderBottom: '1px solid rgba(180,140,60,0.6)' }}>{ '\uD83D\uDCCA' }</th>
                      </tr>
                    </thead>
                    <tbody>
                      {careerRows.slice(0, 6).map(({ key, entry, isCurrentClubEntry, periodLabel, statsSnapshot }) => (
                        <tr key={key} style={{ backgroundColor: isCurrentClubEntry ? 'rgba(96,165,250,0.15)' : 'transparent' }}>
                          <td className="px-2 py-1 font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>
                            {periodLabel}
                          </td>
                          <td className="px-2 py-1 font-black italic uppercase tracking-tighter text-[7px] drop-shadow" style={{ color: '#ffffff', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>
                            <span className="block max-w-[92px] truncate">
                              {entry.clubId === 'FREE_AGENTS' ? 'Bez klubu' : entry.clubName}
                            </span>
                          </td>
                          <td className="px-1.5 py-1 text-center font-black italic tracking-tighter text-[8px] drop-shadow" style={{ color: '#ffffff', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.matchesPlayed : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-black italic tracking-tighter text-[8px] drop-shadow" style={{ color: '#6ee7b7', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.goals : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-black italic tracking-tighter text-[8px] drop-shadow" style={{ color: '#7dd3fc', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.assists : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-black italic tracking-tighter text-[8px] drop-shadow" style={{ color: '#fde047', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.yellowCards : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-black italic tracking-tighter text-[8px] drop-shadow" style={{ color: '#f87171', borderBottom: '1px solid rgba(180,140,60,0.35)', borderRight: '1px solid rgba(180,140,60,0.35)' }}>{statsSnapshot ? statsSnapshot.redCards : '—'}</td>
                          <td className="px-1.5 py-1 text-center font-black italic tracking-tighter text-[8px] drop-shadow" style={{ color: '#ffffff', borderBottom: '1px solid rgba(180,140,60,0.35)' }}>
                            {statsSnapshot?.averageRating !== null && statsSnapshot?.averageRating !== undefined
                              ? statsSnapshot.averageRating.toFixed(1)
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-[10px] border border-dashed border-white/30 px-2 py-4 text-center font-black italic uppercase tracking-tighter text-[7px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Brak historii
                </div>
              )}
            </div>

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
                    {player.annualSalary ? (() => { const s = player.annualSalary; const step = s >= 1_000_000 ? 100_000 : s >= 100_000 ? 10_000 : 5_000; return (Math.round(s / step) * step).toLocaleString('pl-PL'); })() : '0'} <span className="text-[10px] opacity-60 ml-1">PLN</span>
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
                      {player.transferReportDate ? `Data przejscia: ${new Date(player.transferReportDate).toLocaleDateString('pl-PL')}` : 'Transfer uzgodniony'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                    TRS
                  </div>
                </div>
              )}
              <div className="bg-transparent p-3 rounded-[20px] border border-emerald-500/20 flex items-center justify-between group hover:border-emerald-500/40 transition-all shadow-lg">
                <div>
                  <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1 drop-shadow">Cena Rynkowa</span>
                  <span className="text-lg font-black text-emerald-400 font-mono italic tabular-nums leading-none drop-shadow">
                    {player.marketValue ? player.marketValue.toLocaleString('pl-PL') : '0'} <span className="text-xs opacity-60 ml-1">PLN</span>
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
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    setContractManagementInitialMode('RELEASE');
                    navigateTo(ViewState.CONTRACT_MANAGEMENT);
                  }}
                  className="group relative h-12 bg-red-600/10 border border-red-500/20 rounded-[18px] flex items-center justify-center gap-3 transition-all hover:bg-red-600/20 hover:border-red-500/40 active:scale-95 shadow-xl"
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
                  className={`group relative h-12 rounded-[18px] flex items-center justify-center gap-3 transition-all
                    ${isContractLocked || hasPendingTransfer
                      ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'
                      : 'bg-blue-600/10 border-blue-500/20 hover:bg-blue-600/20 hover:border-blue-500/40 active:scale-95 shadow-xl'
                    }`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {isContractLocked || hasPendingTransfer ? '⏳' : '✍️'}
                  </span>
                  <div className="text-left">
                    <span className="block text-[8px] font-black uppercase tracking-widest drop-shadow">
                      {hasPendingTransfer ? 'TRANSFER' : isContractLocked ? 'BLOKADA CZASOWA' : 'NOWE WARUNKI'}
                    </span>
                    <span className="text-[6px] font-black text-white italic uppercase drop-shadow">
                      {hasPendingTransfer ? 'DO INNEGO KLUBU' : isContractLocked ? 'UMOWA NIEDAWNO PODPISANA' : 'PRZEDŁUŻ UMOWĘ'}
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
                          className="w-10 h-10 rounded-lg bg-red-900/40 border border-red-500/30 text-red-400 text-[18px] font-black italic uppercase tracking-tighter active:scale-95 hover:bg-red-900/70 flex items-center justify-center shrink-0">
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
                          className="w-10 h-10 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-[18px] font-black italic uppercase tracking-tighter active:scale-95 hover:bg-emerald-900/70 flex items-center justify-center shrink-0">
                          +
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowPricePanel(false)}
                          className="flex-1 py-2.5 rounded-[14px] font-black italic uppercase tracking-tighter text-[9px] bg-slate-700 border border-slate-600 text-slate-400 active:scale-95">
                          Anuluj
                        </button>
                        <button onClick={() => { toggleTransferList(player.id, transferPrice); setShowPricePanel(false); }}
                          className="flex-1 py-2.5 rounded-[14px] font-black italic uppercase tracking-tighter text-[9px] bg-amber-600/20 border border-amber-500/40 text-amber-500 active:scale-95">
                          Wystaw
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  disabled={hasPendingTransfer}
                  onClick={() => {
                    if (player.isOnTransferList) {
                      toggleTransferList(player.id);
                    } else {
                      setTransferPrice(player.marketValue || 1_000_000);
                      setShowPricePanel(true);
                    }
                  }}
                  className={`w-full py-2.5 rounded-[18px] font-black italic uppercase tracking-widest text-[10px] transition-all border-2 active:scale-95 drop-shadow
                    ${hasPendingTransfer
                      ? "relative bg-slate-800 border-slate-700 text-transparent opacity-60 cursor-not-allowed after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-slate-300 after:content-['TRANSFER_UZGODNIONY']"
                      : player.isOnTransferList
                      ? 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                      : 'bg-amber-600/20 border-amber-500/40 text-amber-500 hover:bg-amber-600/30'}`}
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
                    className={`w-full py-3 rounded-[20px] font-black italic uppercase tracking-widest text-xs transition-all shadow-2xl border-b-4
                      ${activeFreeAgentLockoutUntil
                        ? 'bg-slate-800 border-slate-900 text-slate-500 opacity-70 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800 hover:scale-[1.02] active:scale-95'}`}
                  >
                    {activeFreeAgentLockoutUntil
                      ? `Kontakt możliwy po ${new Date(activeFreeAgentLockoutUntil).toLocaleDateString('pl-PL')}`
                      : "OTWÓRZ BIURO NEGOCJACJI 🤝"}
                  </button>
                ) : !isResigned ? (
                  <button
                    disabled={!!isTransferLocked || hasUserTransferAgreement || hasPendingTransfer}
                    onClick={() => navigateWithoutHistory(ViewState.TRANSFER_OFFER)}
                    className={`w-full py-3 rounded-[20px] font-black italic uppercase tracking-widest text-xs transition-all shadow-2xl border-b-4 ${
                      (isTransferLocked || hasUserTransferAgreement || hasPendingTransfer)
                        ? 'bg-slate-800 border-slate-900 text-slate-500 opacity-70 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800 hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    ZŁÓŻ OFERTĘ TRANSFEROWĄ 💰
                  </button>
                ) : null}
              </div>
            )}
          </div>

        </div>
      </div>

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


