import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, Player, Club, Lineup, Tactic, NationalTeam, StaffRole, StaffMember, TransferOfferStatus, IncomingOfferStatus } from '../../types';
import { STAFF_ROLE_ATTRS } from '../../services/StaffGenerationService';
import { TacticRepository } from '../../resources/tactics_db';
import { LineupService } from '../../services/LineupService';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { TeamResultsModal } from '../modals/TeamResultsModal';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { getClubKitVariantsForClub } from '../../resources/PlayerCardAssets';
import { KitPreview } from '../common/KitPreview';
import bojoPitch from '../../Graphic/themes/bojo.png';

const ROLE_LABELS: Record<string, string> = {
  [StaffRole.ASSISTANT_COACH]:  'Asystent trenera',
  [StaffRole.GOALKEEPER_COACH]: 'Trener bramkarzy',
  [StaffRole.FITNESS_COACH]:    'Trener fizyczny',
  [StaffRole.VIDEO_ANALYST]:    'Analityk video',
  [StaffRole.PHYSIOTHERAPIST]:  'Fizjoterapeuta',
  [StaffRole.CLUB_DOCTOR]:      'Lekarz klubowy',
};

const STAFF_ROLE_ORDER: StaffRole[] = [
  StaffRole.ASSISTANT_COACH,
  StaffRole.GOALKEEPER_COACH,
  StaffRole.FITNESS_COACH,
  StaffRole.VIDEO_ANALYST,
  StaffRole.PHYSIOTHERAPIST,
  StaffRole.CLUB_DOCTOR,
];

const staffAttrColor = (v: number) =>
  v >= 17 ? '#34d399' : v >= 13 ? '#60a5fa' : v >= 9 ? '#facc15' : v >= 5 ? '#fb923c' : '#fb7185';

const MONTHS_PL = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];

const REGION_LABELS: Record<string, string> = {
  POLAND: 'Polska',
  ENGLAND: 'Anglia',
  GERMANY: 'Niemcy',
  FRANCE: 'Francja',
  SPAIN: 'Hiszpania',
  ITALY: 'Włochy',
  BALKANS: 'Bałkany',
  CZ_SK: 'Czechy/Słowacja',
  SCANDINAVIA: 'Skandynawia',
  EX_USSR: 'WNP',
  BALTIC: 'Kraje bałtyckie',
  ROMANIA: 'Rumunia',
};

const isDarkKitColor = (hex: string) => {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 70;
};

const TOP_BUTTON_SHADOW = {
  boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
};

type ClubTransferModalEntry = {
  id: string;
  date: Date;
  playerId: string;
  playerName: string;
  type: string;
  fee?: number;
};

const formatTransferDate = (date: Date) => {
  if (Number.isNaN(date.getTime())) return '--.--.----';
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTransferFee = (fee?: number) => {
  if (!fee || fee <= 0) return '';
  return `${fee.toLocaleString('pl-PL')} PLN`;
};

const getTransferDisplayLabel = (entry: ClubTransferModalEntry) => {
  const feeLabel = formatTransferFee(entry.fee);
  if (entry.type === 'Zwolniony') return 'ZWOLNIONY';
  if (entry.type === 'Wypożyczenie') return feeLabel || 'WYPOŻYCZENIE';
  return feeLabel || 'WOLNY TRANSFER';
};

const StaffChalkboardBackdrop: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 700" aria-hidden>
    <defs>
      <radialGradient id="club-staff-board" cx="50%" cy="35%" r="90%">
        <stop offset="0%" stopColor="#10362a" />
        <stop offset="60%" stopColor="#0b2820" />
        <stop offset="100%" stopColor="#06160f" />
      </radialGradient>
      <filter id="club-staff-chalk" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
      </filter>
    </defs>
    <rect width="1000" height="700" fill="url(#club-staff-board)" />
    <g stroke="#e8f5e9" strokeOpacity="0.07" strokeWidth="3" fill="none" filter="url(#club-staff-chalk)">
      <rect x="60" y="40" width="880" height="620" rx="4" />
      <line x1="60" y1="350" x2="940" y2="350" />
      <circle cx="500" cy="350" r="95" />
      <rect x="330" y="40" width="340" height="120" />
      <rect x="330" y="540" width="340" height="120" />
      <rect x="410" y="40" width="180" height="50" />
      <rect x="410" y="610" width="180" height="50" />
    </g>
    <g stroke="#e8f5e9" strokeOpacity="0.05" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#club-staff-chalk)">
      <path d="M150 560 C 240 480, 300 470, 380 410" />
      <path d="M380 410 l -18 2 m 18 -2 l -6 17" />
      <path d="M820 180 C 740 240, 700 260, 640 330" />
      <path d="M640 330 l 17 -4 m -17 4 l 4 -17" />
      <path d="M200 160 l 26 26 m 0 -26 l -26 26" />
      <path d="M790 520 l 26 26 m 0 -26 l -26 26" />
      <circle cx="265" cy="300" r="14" />
      <circle cx="730" cy="430" r="14" />
    </g>
  </svg>
);

const StaffAttributeRadar: React.FC<{ values: { label: string; value: number }[] }> = ({ values }) => {
  const C = 100;
  const R = 78;
  const count = values.length || 1;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / count;
  const pt = (i: number, r: number) => `${C + Math.cos(angle(i)) * r},${C + Math.sin(angle(i)) * r}`;
  const poly = values.map((v, i) => pt(i, (v.value / 20) * R)).join(' ');

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="club-staff-radar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon key={g} points={values.map((_, i) => pt(i, R * g)).join(' ')} fill="none" stroke="#e8f5e9" strokeOpacity="0.1" strokeWidth="1" />
      ))}
      {values.map((_, i) => {
        const [x, y] = pt(i, R).split(',').map(Number);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#e8f5e9" strokeOpacity="0.08" />;
      })}
      <polygon points={poly} fill="url(#club-staff-radar)" fillOpacity="0.25" stroke="url(#club-staff-radar)" strokeWidth="2.5" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = pt(i, (v.value / 20) * R).split(',').map(Number);
        return <circle key={v.label} cx={x} cy={y} r="4.5" fill={staffAttrColor(v.value)} stroke="#06160f" strokeWidth="2" />;
      })}
    </svg>
  );
};

export const ClubDetails: React.FC = () => {
   const {
     viewedClubId,
     clubs,
     players,
     getOrGenerateSquad,
     lineups,
     updateLineup,
     navigateTo,
     viewPlayerDetails,
     coaches,
     viewCoachDetails,
     currentDate,
     previousViewState,
     nationalTeams,
     staffMembers,
     transferOffers,
     incomingOffers,
     aiTransferLog,
   } = useGame();
  
  const [startingXI, setStartingXI] = useState<Player[]>([]);
  const [bench, setBench] = useState<Player[]>([]);
  const [reserves, setReserves] = useState<Player[]>([]);
  const [currentTactic, setCurrentTactic] = useState<Tactic | null>(null);
  const [currentLineup, setCurrentLineup] = useState<Lineup | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const nationalTeamByPlayerId = useMemo(() => {
    const map = new Map<string, NationalTeam>();
    nationalTeams.forEach(nt => {
      nt.squadPlayerIds.forEach(id => map.set(id, nt));
    });
    return map;
  }, [nationalTeams]);

  const club = useMemo(() => clubs.find(c => c.id === viewedClubId), [clubs, viewedClubId]);

  const allPlayers = useMemo(() => Object.values(players).flat(), [players]);

  const seasonStart = useMemo(() => {
    const date = new Date(currentDate);
    return date.getMonth() >= 6
      ? new Date(date.getFullYear(), 6, 1)
      : new Date(date.getFullYear() - 1, 6, 1);
  }, [currentDate]);

  const clubTransferActivity = useMemo(() => {
    if (!club) return { incoming: [] as ClubTransferModalEntry[], outgoing: [] as ClubTransferModalEntry[] };

    const incoming: ClubTransferModalEntry[] = [];
    const outgoing: ClubTransferModalEntry[] = [];
    const added = new Set<string>();
    const playerName = (player: Player) => `${player.lastName} ${player.firstName}`.trim();
    const addEntry = (direction: 'incoming' | 'outgoing', entry: ClubTransferModalEntry) => {
      const key = `${direction}_${entry.id}`;
      if (added.has(key)) return;
      added.add(key);
      (direction === 'incoming' ? incoming : outgoing).push(entry);
    };

    const completedOfferFees = new Map<string, number>();
    transferOffers
      .filter(offer => offer.status === TransferOfferStatus.COMPLETED)
      .forEach(offer => {
        completedOfferFees.set(`${offer.playerId}::${offer.sellerClubId}::${offer.buyerClubId}`, offer.fee);
      });

    const incomingOfferFees = new Map<string, number>();
    incomingOffers
      .filter(offer => offer.status === IncomingOfferStatus.COMPLETED)
      .forEach(offer => {
        incomingOfferFees.set(`${offer.playerId}::${offer.buyerClubId}`, offer.kind === 'LOAN' ? (offer.loanFee ?? offer.fee) : offer.fee);
      });

    const aiLogFees = new Map<string, number>();
    aiTransferLog
      .filter(entry => entry.status === 'TRANSFER_SIGNED')
      .forEach(entry => {
        aiLogFees.set(`${entry.playerName}::${entry.fromClubId ?? entry.fromClub}::${entry.toClubId ?? entry.toClub}`, entry.fee ?? 0);
      });

    allPlayers.forEach(player => {
      const history = player.history || [];
      if (history.length < 2) return;

      for (let i = 1; i < history.length; i++) {
        const entry = history[i];
        const previousEntry = history[i - 1];
        if (!entry.fromYear || !entry.fromMonth) continue;

        const entryDate = new Date(entry.fromYear, entry.fromMonth - 1, 1);
        if (entryDate < seasonStart) continue;

        const baseFee =
          entry.transferFee ??
          completedOfferFees.get(`${player.id}::${previousEntry.clubId}::${entry.clubId}`) ??
          incomingOfferFees.get(`${player.id}::${entry.clubId}`) ??
          aiLogFees.get(`${playerName(player)}::${previousEntry.clubId}::${entry.clubId}`) ??
          aiLogFees.get(`${playerName(player)}::${previousEntry.clubName}::${entry.clubName}`);

        if (entry.isLoan) {
          if (entry.clubId === club.id) {
            addEntry('incoming', {
              id: `${player.id}_${i}_loan_in`,
              date: entryDate,
              playerId: player.id,
              playerName: playerName(player),
              type: 'Wypożyczenie',
              fee: baseFee,
            });
          }
          if (entry.parentClubId === club.id || previousEntry.clubId === club.id) {
            addEntry('outgoing', {
              id: `${player.id}_${i}_loan_out`,
              date: entryDate,
              playerId: player.id,
              playerName: playerName(player),
              type: 'Wypożyczenie',
              fee: baseFee,
            });
          }
          continue;
        }

        if (entry.clubId === 'FREE_AGENTS') {
          if (previousEntry.clubId === club.id) {
            addEntry('outgoing', {
              id: `${player.id}_${i}_released`,
              date: entryDate,
              playerId: player.id,
              playerName: playerName(player),
              type: 'Zwolniony',
            });
          }
          continue;
        }

        if (entry.clubId === club.id) {
          addEntry('incoming', {
            id: `${player.id}_${i}_in`,
            date: entryDate,
            playerId: player.id,
            playerName: playerName(player),
            type: previousEntry.clubId === 'FREE_AGENTS' ? 'Wolny transfer' : 'Kupno',
            fee: previousEntry.clubId === 'FREE_AGENTS' ? undefined : baseFee,
          });
        }

        if (previousEntry.clubId === club.id) {
          addEntry('outgoing', {
            id: `${player.id}_${i}_out`,
            date: entryDate,
            playerId: player.id,
            playerName: playerName(player),
            type: 'Sprzedaż',
            fee: baseFee,
          });
        }
      }
    });

    const sortEntries = (a: ClubTransferModalEntry, b: ClubTransferModalEntry) =>
      b.date.getTime() - a.date.getTime() || a.playerName.localeCompare(b.playerName);

    return {
      incoming: incoming.sort(sortEntries),
      outgoing: outgoing.sort(sortEntries),
    };
  }, [aiTransferLog, allPlayers, club, incomingOffers, seasonStart, transferOffers]);

  const getMoraleInfo = (morale: number): { stars: number; color: string; label: string } => {
    if (morale <= 20) return { stars: 1, color: 'text-red-500', label: 'Bardzo niskie' };
    if (morale <= 35) return { stars: 2, color: 'text-orange-400', label: 'Niskie' };
    if (morale <= 64) return { stars: 3, color: 'text-white', label: 'Neutralne' };
    if (morale <= 79) return { stars: 4, color: 'text-green-400', label: 'Wysokie' };
    return { stars: 5, color: 'text-yellow-400', label: 'Bardzo wysokie' };
  };

  const clubCoach = useMemo(() => {
    if (!club || !club.coachId) return null;
    return coaches[club.coachId];
  }, [club, coaches]);

  const clubStaff = useMemo(() => {
    if (!club?.staffIds) return [];
    return club.staffIds.map(id => staffMembers[id]).filter(Boolean);
  }, [club, staffMembers]);

  const selectedStaffMember = useMemo(() => {
    if (!selectedStaffId) return null;
    return staffMembers[selectedStaffId] ?? null;
  }, [selectedStaffId, staffMembers]);

  const clubKitVariants = useMemo(() => club ? getClubKitVariantsForClub(club).slice(0, 3) : [], [club]);

  useEffect(() => {
    if (viewedClubId) {
      const allPlayers = getOrGenerateSquad(viewedClubId);
      let lineup = lineups[viewedClubId];
      if (!lineup) {
        lineup = LineupService.autoPickLineup(viewedClubId, allPlayers);
        updateLineup(viewedClubId, lineup);
      }
      setCurrentLineup(lineup);
      setCurrentTactic(TacticRepository.getById(lineup.tacticId));

      const sXI = lineup.startingXI.map(id => allPlayers.find(p => p.id === id)).filter(Boolean) as Player[];
      const sBench = PlayerPresentationService.sortPlayers(lineup.bench.map(id => allPlayers.find(p => p.id === id)).filter(Boolean) as Player[]);
      const sRes = PlayerPresentationService.sortPlayers(lineup.reserves.map(id => allPlayers.find(p => p.id === id)).filter(Boolean) as Player[]);

      setStartingXI(sXI);
      setBench(sBench);
      setReserves(sRes);
    }
  }, [viewedClubId, getOrGenerateSquad, lineups, updateLineup]);

  if (!club) return <div className="h-screen flex items-center justify-center text-slate-500 font-black uppercase tracking-widest">Klub nie znaleziony...</div>;

  const handleBack = () => {
    if (previousViewState === ViewState.MATCH_HISTORY_BROWSER) {
      navigateTo(ViewState.MATCH_HISTORY_BROWSER);
    } else if (club.leagueId === 'L_PL_4') {
      navigateTo(ViewState.HIDDEN_LEAGUE);
    } else if (club.leagueId === 'L_SA' || club.leagueId === 'L_CL' || club.leagueId === 'L_EL' || club.leagueId === 'L_CONF' || club.leagueId === 'L_AFRICA' || club.leagueId === 'L_ASIA' || club.leagueId === 'L_NA' || previousViewState === ViewState.EUROPEAN_CLUBS) {
      navigateTo(ViewState.EUROPEAN_CLUBS);
    } else {
      navigateTo(ViewState.LEAGUE_TABLES);
    }
  };

  const closeStaffModal = () => {
    setSelectedStaffId(null);
    setIsStaffModalOpen(false);
  };

  const formatContractEnd = (contractEndDate?: string | null) => {
    if (!contractEndDate) return '-';

    return new Date(contractEndDate)
      .toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })
      .replace('.', '');
  };

  const formatLoanEnd = (player: Player): string => {
    if (!player.loan) return '-';
    const date = new Date(player.loan.endDate);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderPlayerRow = (player: Player, label: string, rowIndex: number) => {
    const healthInfo = PlayerPresentationService.getHealthDisplay(player);
    const condColor = PlayerPresentationService.getConditionColorClass(player.condition);
    const playerMoraleInfo = getMoraleInfo(player.morale ?? 50);

    const isNegotiationBlocked = player.isNegotiationPermanentBlocked;
    const isCooldownActive = player.negotiationLockoutUntil && new Date(currentDate) < new Date(player.negotiationLockoutUntil);
    const hasAttemptsUsed = (player.negotiationStep || 0) > 0 && !isNegotiationBlocked && !isCooldownActive;
    
    return (
      <tr 
        key={`${label}-${player.id}-${rowIndex}`} 
        onClick={() => viewPlayerDetails(player.id)}
        className="group relative h-14 border-b border-white/5 transition-all cursor-pointer hover:bg-white/[0.03]"
      >
        <td className="pl-6 w-12 relative z-10">
           <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{label}</span>
        </td>
        <td className={`w-14 font-mono font-black text-[10px] relative z-10 ${PlayerPresentationService.getPositionColorClass(player.position)}`}>
          {player.position}
        </td>
      <td className="relative z-10">
           <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white uppercase italic group-hover:text-blue-400 transition-colors">
                {player.lastName ? <>{player.lastName} <span className="opacity-40 font-medium text-[10px]">{player.firstName}</span></> : player.firstName}
              </span>

{player.isOnTransferList && (
        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[7px] font-black rounded-sm border border-amber-500/30 shadow-sm animate-pulse">
          LISTA
        </span>
      )}
      {/* Badge zainteresowania — widoczny również w kadrach innych klubów */}
      {player.loan && (
        <span
          title={`Wypożyczony z ${player.loan.parentClubName} do ${player.loan.destinationClubName}\nDo: ${formatLoanEnd(player)}`}
          className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[7px] font-black italic uppercase tracking-tighter rounded-sm border border-cyan-500/30 shadow-sm cursor-help"
        >
          WYP
        </span>
      )}
      {player.interestedClubs && player.interestedClubs.filter(id => id !== player.clubId).length > 0 && (
        <span
          title={`Zainteresowane kluby:\n${player.interestedClubs.filter(id => id !== player.clubId).map(id => clubs.find(c => c.id === id)?.name ?? id).join('\n')}`}
          className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[7px] font-black rounded-sm border border-blue-500/30 shadow-sm cursor-help"
        >
          INT
        </span>
      )}
      {nationalTeamByPlayerId.has(player.id) && (
        <span
          title={`Powołany do reprezentacji: ${nationalTeamByPlayerId.get(player.id)?.name ?? ''}`}
          className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[7px] font-black rounded-sm border border-purple-500/30 shadow-sm cursor-help"
        >
          REP
        </span>
      )}

              {isNegotiationBlocked && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[6px] font-black rounded-sm border border-red-500/30">⛔</span>
              )}
              {isCooldownActive && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 text-[6px] font-black rounded-sm border border-amber-500/30">⏳</span>
              )}
              {hasAttemptsUsed && (
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[6px] font-black rounded-sm border border-blue-500/30">📝</span>
              )}
           </div>
        </td>
        <td className="w-16 text-center relative z-10">
          <div className="flex items-center justify-center gap-0.5" title={`Morale: ${playerMoraleInfo.label}`}>
            {Array.from({ length: playerMoraleInfo.stars }).map((_, i) => (
              <span key={i} className="text-[10px] leading-none text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.35)]">★</span>
            ))}
          </div>
        </td>
        <td className="w-10 text-center relative z-10 font-mono text-[13px] text-slate-500">{player.stats.matchesPlayed}</td>
        <td className="w-10 text-center relative z-10 font-mono text-[13px] text-emerald-500 font-bold">{player.stats.goals}</td>
        <td className="w-10 text-center relative z-10 font-mono text-[13px] text-blue-400">{player.stats.assists}</td>
        <td className="w-10 text-center relative z-10 font-mono text-[13px] text-amber-500">{player.stats.yellowCards}</td>
        <td className="w-16 text-center relative z-10">
           <span className="text-xs font-black text-slate-400 font-mono italic">{player.overallRating}</span>
        </td>
         <td className="w-16 text-center relative z-10">
           <span className="text-sm font-black text-blue-400 font-mono italic">
              {player.stats.ratingHistory && player.stats.ratingHistory.length > 0 
                ? (player.stats.ratingHistory.reduce((a, b) => a + b, 0) / player.stats.ratingHistory.length).toFixed(1)
                : '-'}
           </span>
        </td>
        <td className="w-28 text-center relative z-10">
           <span className={`text-[9px] font-black uppercase tracking-widest ${healthInfo.colorClass}`}>{healthInfo.text}</span>
        </td>
        <td className="pr-6 w-24 relative z-10">
           <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
              <div className={`h-full ${condColor} transition-all duration-1000`} style={{ width: `${player.condition}%` }} />
           </div>
        </td>
        <td className="px-6 w-28 text-center relative z-10">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-wide">
             {formatContractEnd(player.contractEndDate)}
           </span>
        </td>
      </tr>
    );
  };

  const renderTransferColumn = (title: string, entries: ClubTransferModalEntry[], accentClass: string) => (
    <div className="min-h-0 flex-1 rounded-3xl border border-white/10 bg-black/20 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 bg-white/[0.03]">
        <h3 className={`text-[11px] font-black italic uppercase tracking-tighter ${accentClass}`}>{title}</h3>
      </div>
      <div className="max-h-[520px] overflow-y-auto custom-scrollbar">
        {entries.length === 0 ? (
          <div className="px-5 py-10 text-center text-[10px] font-black italic uppercase tracking-tighter text-slate-600">
            Brak ruchów transferowych
          </div>
        ) : entries.map((entry, index) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => viewPlayerDetails(entry.playerId)}
            className={`grid w-full grid-cols-[88px_minmax(0,1fr)_170px] items-center gap-3 border-b border-white/5 px-5 py-3 text-left transition-colors hover:bg-white/[0.06] ${
              index % 2 === 0 ? 'bg-white/[0.015]' : 'bg-white/[0.045]'
            }`}
          >
            <span className="font-mono text-[10px] font-black text-slate-500">{formatTransferDate(entry.date)}</span>
            <span className="min-w-0 truncate text-[12px] font-black italic uppercase tracking-tighter text-white">
              {entry.playerName}
            </span>
            <span className={`text-right text-[10px] font-black italic uppercase tracking-tighter ${
              entry.fee && entry.fee > 0 ? 'font-mono not-italic tracking-normal text-emerald-300' : 'text-slate-300'
            }`}>
              {getTransferDisplayLabel(entry)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-3rem)] max-w-[1600px] mx-auto flex flex-col gap-4 animate-fade-in relative" style={{ paddingTop: '80px' }}>
      
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20 transition-all duration-1000"
          style={{ background: club.colorsHex[0] }}
        />
        <div className="absolute left-10 bottom-[-10%] text-[25rem] font-black italic text-white/[0.02] select-none pointer-events-none">
           {club.shortName}
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative shrink-0">
         {getClubLogo(club.id) && (
            <div className="absolute left-4 top-1/2 z-50 pointer-events-none" style={{ transform: 'translateY(calc(-55% + 10px))' }}>
               <img src={getClubLogo(club.id)} alt={club.name} className="w-[150px] h-[150px] object-contain transform -rotate-6 drop-shadow-2xl opacity-80" />
            </div>
         )}
         <div className="flex items-center justify-between px-8 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-3xl shadow-2xl" style={{ paddingTop: '28px', paddingBottom: '28px' }}>
         <div className="flex items-center">
            {!getClubLogo(club.id) && (
               <div className="relative z-10 shrink-0 mr-6">
                  <div className="w-16 h-16 rounded-2xl flex flex-col overflow-hidden border border-white/20 shadow-2xl transform -rotate-3">
                     <div className="flex-1" style={{ backgroundColor: club.colorsHex[0] }} />
                     <div className="flex-1" style={{ backgroundColor: club.colorsHex[1] || club.colorsHex[0] }} />
                  </div>
               </div>
            )}
            <div className={getClubLogo(club.id) ? "pl-[132px]" : ""}>
               <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                 {club.name}
               </h1>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">REPUTACJA:</span>
                      <div className="flex gap-0.5">
                        {Array.from({length: 10}).map((_, i) => (
                           <div key={i} className={`w-1.5 h-3 rounded-sm ${i < club.reputation ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/5'}`} />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

       <div className="flex gap-4">
            {(() => {
              const info = getMoraleInfo(club.morale ?? 50);
              return (
                <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">MORALE:</span>
                  <div className="flex items-center gap-0.5" title={`Morale: ${info.label}`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-[13px] leading-none ${i < info.stars ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.35)]' : 'text-white/10'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
            <button
              onClick={() => setIsResultsModalOpen(true)}
              className="px-8 py-4 rounded-[20px] bg-blue-600/10 border-t border-x border-b border-t-blue-400/40 border-x-blue-500/20 border-b-black/60 text-[10px] font-black italic uppercase tracking-tighter text-blue-300 transition-all hover:bg-blue-600/20 active:translate-y-[2px]"
              style={TOP_BUTTON_SHADOW}
            >
              Terminarz
            </button>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-8 py-4 rounded-[20px] bg-emerald-500/10 border-t border-x border-b border-t-emerald-400/45 border-x-emerald-500/20 border-b-black/60 text-[10px] font-black italic uppercase tracking-tighter text-emerald-300 transition-all hover:bg-emerald-500/20 active:translate-y-[2px]"
              style={TOP_BUTTON_SHADOW}
            >
              Transfery
            </button>
            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="px-8 py-4 rounded-[20px] bg-yellow-500/15 border-t border-x border-b border-t-yellow-400/50 border-x-yellow-500/25 border-b-black/60 text-[10px] font-black italic uppercase tracking-tighter text-yellow-300 transition-all hover:bg-yellow-500/25 active:translate-y-[2px]"
              style={TOP_BUTTON_SHADOW}
            >
              Sztab
            </button>
            <button
              onClick={handleBack}
              className="px-8 py-4 rounded-[20px] bg-white/10 border-t border-x border-b border-t-white/40 border-x-white/20 border-b-black/60 text-[10px] font-black italic uppercase tracking-tighter text-white transition-all hover:bg-white/15 active:translate-y-[2px]"
              style={TOP_BUTTON_SHADOW}
            >
              Powrót
            </button>
         </div>
      </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="w-80 flex flex-col gap-5 shrink-0">
           <div className="p-5 bg-slate-900/40 rounded-[35px] border border-white/5 backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
              <div className="absolute right-[-18px] bottom-[-18px] text-8xl opacity-[0.03] rotate-12 pointer-events-none">▥</div>
              <div className="grid grid-cols-3 gap-3">
                {clubKitVariants.map((variant, idx) => (
                  <div
                    key={variant.id ?? `${variant.hex}-${idx}`}
                    className="flex min-h-[132px] flex-col items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-2 py-3"
                  >
                    <KitPreview
                      shirt={variant.hex}
                      shirtSecondary={variant.shirtSecondaryHex}
                      shorts={variant.secondaryHex ?? variant.hex}
                      socks={variant.socksHex ?? variant.secondaryHex ?? variant.hex}
                      pattern={variant.pattern}
                      className={`h-20 w-20 ${isDarkKitColor(variant.hex) ? 'drop-shadow-[0_0_14px_rgba(255,255,255,0.35)]' : ''}`}
                    />
                    <span className="max-w-full truncate text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-400">
                      {idx === 0 ? 'DOM' : idx === 1 ? 'WYJAZD' : 'REZERWA'}
                    </span>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-8 bg-slate-900/40 rounded-[35px] border border-white/5 backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
              <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-[0.03] rotate-12 pointer-events-none">🏟️</div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Infrastruktura</h3>
              
              <div className="space-y-6">
                 <div>
                    <span className="block text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">STADION GŁÓWNY</span>
                    <span className="text-lg font-black text-white italic uppercase tracking-tight leading-tight block">{club.stadiumName}</span>
                 </div>
                 <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">POJEMNOŚĆ</span>
                    <span className="text-3xl font-black font-mono text-emerald-400 tabular-nums">{club.stadiumCapacity.toLocaleString()}</span>
                 </div>
              </div>
           </div>

           {currentTactic && currentLineup && (
             <div className="flex-1 bg-slate-900/40 rounded-[35px] border border-white/5 backdrop-blur-2xl flex flex-col p-6 overflow-hidden shadow-2xl relative">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Taktyka</h3>
                <div className="flex-1 relative rounded-2xl border border-white/10 overflow-hidden shadow-inner bg-[#064e3b]">
                   {/* Paski murawy */}
                   <div className="absolute inset-0 opacity-20" style={{ 
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10%, #059669 10%, #059669 20%)',
                      backgroundSize: '100% 100%'
                   }} />

                   {/* Gotowa grafika boiska */}
                   <img src={bojoPitch} alt="boisko" className="absolute inset-0 w-full h-full object-fill opacity-60" />
                   
                   {currentTactic.slots.map((slot, idx) => {
                      const pId = currentLineup.startingXI[idx];
                      if (!pId) return null;
                      return (
                        <div 
                           key={idx}
                           className="absolute w-4 h-4 rounded-full border border-white/50 shadow-lg"
                           style={{ 
                             left: `${slot.x * 100}%`, 
                             top: `calc(${slot.y * 100}% - 22px)`,
                             transform: 'translate(-50%, -50%)',
                             backgroundColor: club.colorsHex[0]
                           }}
                        />
                      );
                   })}
                </div>
                <div className="mt-4 text-center">
                   <span className="text-xs font-black text-emerald-500 italic uppercase tracking-tighter">{currentTactic.name}</span>
                </div>
             </div>
           )}
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
           <div className="flex-1 bg-slate-900/30 rounded-[40px] border border-white/5 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden">
              <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Kadra Zespołu</h3>
                 <div className="flex gap-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">11 WYJŚCIOWA</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">9 REZERWOWYCH</span>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md">
                       <tr className="text-[8px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                           <th className="py-3 pl-6">TYP</th>
                           <th className="py-3">POZ</th>
                           <th className="py-3">NAZWISKO</th>
                           <th className="py-3 text-center w-16 text-[10px] opacity-60">MOR</th>
                            <th className="py-3 text-center w-10 text-[10px] opacity-60">ME</th>
                          <th className="py-3 text-center w-10 text-[10px] opacity-60">⚽</th>
                          <th className="py-3 text-center w-10 text-[10px] opacity-60">AS</th>
                          <th className="py-3 text-center w-10 text-[10px] opacity-60">🟨</th>
                          <th className="py-3 text-center w-10 text-[10px] opacity-60">ŚOC</th>
                          <th className="py-3 text-center">OVR</th>
                           <th className="py-3 text-center">NOTA</th> 
                          <th className="py-3 text-center">ZDROWIE</th>
                         
                          <th className="py-3 pr-6">FORMA</th>
                          <th className="py-3 px-6 w-28 text-center">KONTRAKT DO</th>
                       </tr>
                    </thead>
                    <tbody>
                       {startingXI.map((p, index) => renderPlayerRow(p, 'START', index))}
                        <tr className="bg-black/20"><td colSpan={14} className="py-2 px-6 text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Ławka rezerwowych</td></tr>
                        {bench.map((p, index) => renderPlayerRow(p, 'SUB', index))}
                        <tr className="bg-black/20"><td colSpan={14} className="py-2 px-6 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Pozostali zawodnicy</td></tr>
                       {reserves.map((p, index) => renderPlayerRow(p, 'RES', index))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      <TeamResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        club={club}
      />

      {isTransferModalOpen && (
        <div
          className="fixed inset-0 z-[320] flex items-start justify-center bg-black/75 px-8 pb-8 pt-[120px] backdrop-blur-lg"
          onClick={() => setIsTransferModalOpen(false)}
        >
          <div
            className="relative flex max-h-[calc(100vh-152px)] w-full max-w-5xl flex-col overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/95 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-8 py-6">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Transfery</h2>
                <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-slate-500">
                  {club.name} · bieżący sezon
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 text-lg font-black text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="relative z-10 grid min-h-0 grid-cols-2 gap-5 p-6">
              {renderTransferColumn('Przyszli', clubTransferActivity.incoming, 'text-emerald-300')}
              {renderTransferColumn('Odeszli', clubTransferActivity.outgoing, 'text-rose-300')}
            </div>

            <div className="relative z-10 border-t border-white/10 px-8 py-4">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-[10px] font-black italic uppercase tracking-tighter text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {isStaffModalOpen && (() => {
        const ROLE_COLORS: Record<string, string> = {
          'Trener Główny':       'text-amber-400',
          [ROLE_LABELS[StaffRole.ASSISTANT_COACH]]:  'text-blue-400',
          [ROLE_LABELS[StaffRole.GOALKEEPER_COACH]]: 'text-emerald-400',
          [ROLE_LABELS[StaffRole.FITNESS_COACH]]:    'text-orange-400',
          [ROLE_LABELS[StaffRole.VIDEO_ANALYST]]:    'text-violet-400',
          [ROLE_LABELS[StaffRole.PHYSIOTHERAPIST]]:  'text-cyan-400',
          [ROLE_LABELS[StaffRole.CLUB_DOCTOR]]:      'text-rose-400',
        };
        type StaffModalPerson =
          | { type: 'coach'; id: string; firstName: string; lastName: string }
          | { type: 'staff'; id: string; firstName: string; lastName: string };
        const sections: { label: string; names: StaffModalPerson[] }[] = [];
        if (clubCoach) {
          sections.push({
            label: 'Trener Główny',
            names: [{ type: 'coach', id: clubCoach.id, firstName: clubCoach.firstName, lastName: clubCoach.lastName }],
          });
        }
        STAFF_ROLE_ORDER.forEach(role => {
          const members = clubStaff.filter(s => s.role === role);
          if (members.length > 0) {
            sections.push({
              label: ROLE_LABELS[role],
              names: members.map(m => ({ type: 'staff', id: m.id, firstName: m.firstName, lastName: m.lastName })),
            });
          }
        });
        const formatStaffContractEnd = (member: StaffMember) => {
          const d = new Date(member.contractEndDate);
          if (Number.isNaN(d.getTime())) return '-';
          return `${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
        };
        const getStaffIcon = (member: StaffMember) => {
          if (member.role === StaffRole.CLUB_DOCTOR) return '⚕';
          if (member.role === StaffRole.PHYSIOTHERAPIST) return '+';
          return '👨‍💼';
        };
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '120px 32px 32px' }} onClick={closeStaffModal}>
            <div
              style={{ position: 'relative', width: '100%', maxWidth: selectedStaffMember ? '896px' : '576px', maxHeight: 'calc(100vh - 152px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              className={`bg-slate-900/90 rounded-[40px] border border-white/10 shadow-2xl transition-all duration-300 ${selectedStaffMember ? 'h-[760px]' : ''}`}
              onClick={e => e.stopPropagation()}
            >
              {/* Glass gloss watermark */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none z-0" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-0" />

              {!selectedStaffMember ? (
                <>
              <div className="relative z-10 px-8 py-6 border-b border-white/5 bg-white/[0.03] shrink-0 text-center">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Sztab Szkoleniowy</h2>
                <div className="flex items-center justify-center gap-3 mt-2">
                  {getClubLogo(club.id) && (
                    <img src={getClubLogo(club.id)!} alt={club.name} className="w-10 h-10 object-contain drop-shadow-lg" />
                  )}
                  <p className="text-3xl font-black uppercase italic tracking-tighter text-white whitespace-nowrap">{club.name}</p>
                </div>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto py-6 px-8">
                {sections.length === 0 && (
                  <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest py-8">Brak danych sztabu</p>
                )}
                {sections.map((section, sIdx) => {
                  const rows: StaffModalPerson[][] =
                    section.names.length > 4
                      ? [section.names.slice(0, Math.ceil(section.names.length / 2)), section.names.slice(Math.ceil(section.names.length / 2))]
                      : [section.names];
                  return (
                    <React.Fragment key={section.label}>
                      <div className="text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <span className={`text-[12px] font-black uppercase tracking-[0.3em] ${ROLE_COLORS[section.label] ?? 'text-white/85'}`}>{section.label}</span>
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                        </div>
                        {rows.map((row, rIdx) => (
                          <div key={rIdx} className="flex justify-center flex-wrap gap-x-5 mt-2">
                            {row.map(person => (
                              <button
                                key={person.id}
                                type="button"
                                onClick={() => {
                                  if (person.type === 'coach') {
                                    closeStaffModal();
                                    viewCoachDetails(person.id);
                                    return;
                                  }
                                  setSelectedStaffId(person.id);
                                }}
                                className="text-[13px] font-black uppercase italic text-white tracking-tight hover:text-emerald-300 transition-colors cursor-pointer"
                              >
                                {person.lastName} <span className="font-medium opacity-50 text-[11px]">{person.firstName}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                      {sIdx < sections.length - 1 && (
                        <div className="h-px bg-yellow-500/30 my-4" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="relative z-10 px-8 py-4 border-t border-white/5 shrink-0">
                <button
                  onClick={closeStaffModal}
                  className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all"
                >
                  Zamknij
                </button>
              </div>
                </>
              ) : (
                <div className="relative z-10 flex-1 flex overflow-hidden bg-slate-950/90 font-black italic uppercase tracking-tighter">
                  <style>{`
                    @keyframes club-staff-rise { from { transform: translateY(18px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    @keyframes club-staff-spin { to { transform: rotate(360deg); } }
                    @keyframes club-staff-shine-sweep { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(220%) skewX(-20deg); } }
                    .club-staff-rise { animation: club-staff-rise 600ms cubic-bezier(.2,.9,.3,1) both; }
                    .club-staff-ring { animation: club-staff-spin 24s linear infinite; transform-origin: center; }
                    .club-staff-shine { background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%); transform: translateX(-120%) skewX(-20deg); }
                    .group\\/club-staff-stat:hover .club-staff-shine, .club-staff-info-card:hover .club-staff-shine { animation: club-staff-shine-sweep 900ms ease; }
                    @media (prefers-reduced-motion: reduce) {
                      .club-staff-rise, .club-staff-ring { animation: none !important; }
                    }
                  `}</style>
                  <StaffChalkboardBackdrop />
                  <div className="w-1/3 relative z-10 bg-black/35 backdrop-blur-sm p-8 flex flex-col items-center border-r border-white/10">
                    <button onClick={() => setSelectedStaffId(null)} className="absolute left-6 top-6 text-[11px] text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08)_inset]">
                      ← Lista
                    </button>
                    <button onClick={closeStaffModal} className="absolute right-6 top-6 text-slate-600 hover:text-white transition-colors text-lg">×</button>
                    <div className="club-staff-rise relative w-36 h-36 flex items-center justify-center mt-10" style={{ animationDelay: '80ms' }}>
                      <svg viewBox="0 0 144 144" className="absolute inset-0 club-staff-ring" aria-hidden>
                        <circle cx="72" cy="72" r="66" fill="none" stroke="#34d399" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="10 14" strokeLinecap="round" />
                      </svg>
                      <svg viewBox="0 0 144 144" className="absolute inset-0" aria-hidden>
                        <circle cx="72" cy="72" r="58" fill="none" stroke="#facc15" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" />
                      </svg>
                      <div className="w-28 h-28 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-white/10 flex items-center justify-center text-5xl shadow-inner not-italic">
                        {getStaffIcon(selectedStaffMember)}
                      </div>
                    </div>
                    <span className="club-staff-rise text-[11px] text-yellow-500 tracking-[0.35em] mt-5 text-center" style={{ animationDelay: '150ms' }}>{ROLE_LABELS[selectedStaffMember.role]}</span>
                    <span className="club-staff-rise text-[25px] text-white mt-2 text-center leading-tight" style={{ animationDelay: '190ms' }}>{selectedStaffMember.firstName}<br />{selectedStaffMember.lastName}</span>
                    <span className="text-[12px] text-slate-400 mt-0.5">{REGION_LABELS[selectedStaffMember.nationality] ?? selectedStaffMember.nationality} · {selectedStaffMember.age} lat</span>
                    <div className="club-staff-rise club-staff-info-card mt-8 w-full p-5 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-3 relative overflow-hidden hover:border-emerald-400/40 hover:bg-white/[0.08] transition-all duration-300" style={{ animationDelay: '330ms' }}>
                      <div className="club-staff-shine absolute inset-0 pointer-events-none" />
                      <div className="relative flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" aria-hidden>
                          <rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" />
                        </svg>
                        <div>
                          <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Kontrakt do</span>
                          <span className="text-sm text-white tabular-nums">{formatStaffContractEnd(selectedStaffMember)}</span>
                        </div>
                      </div>
                      <div className="relative flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" aria-hidden>
                          <circle cx="12" cy="12" r="9" /><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.1 0-2-.4-2.5-1.2M12 6.5v11" />
                        </svg>
                        <div>
                          <span className="block text-[8px] text-slate-500 tracking-[0.3em]">Pensja roczna</span>
                          <span className="text-sm text-emerald-400 tabular-nums">{selectedStaffMember.salary.toLocaleString('pl-PL')} PLN / rok</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 relative z-10 p-9 overflow-y-auto custom-scrollbar bg-black/20 backdrop-blur-[2px]">
                    <div className="club-staff-rise" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-xs text-yellow-500 tracking-[0.4em] mb-6 flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                          <polyline points="3 17 9 11 13 15 21 7" /><polyline points="15 7 21 7 21 13" />
                        </svg>
                        Atrybuty sztabu
                      </h3>
                      <div className="flex gap-8 items-center">
                        <div className="w-44 h-44 shrink-0">
                          <StaffAttributeRadar values={(STAFF_ROLE_ATTRS[selectedStaffMember.role] ?? []).map(({ key, label }) => ({ label, value: selectedStaffMember.attributes[key] ?? 0 }))} />
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-x-10">
                          {(STAFF_ROLE_ATTRS[selectedStaffMember.role] ?? []).map(({ key, label }) => {
                            const val = selectedStaffMember.attributes[key] ?? 0;
                            const color = staffAttrColor(val);
                            return (
                              <div key={key} className="mb-4 cursor-default group/club-staff-stat">
                                <div className="flex justify-between mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/club-staff-stat:text-white transition-colors">
                                  <span>{label}</span>
                                  <span style={{ color }} className="tabular-nums">{val}</span>
                                </div>
                                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                                  <div
                                    className="h-full rounded-full relative overflow-hidden"
                                    style={{
                                      width: `${(val / 20) * 100}%`,
                                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                                      boxShadow: `0 0 10px ${color}55`,
                                    }}
                                  >
                                    <div className="club-staff-shine absolute inset-0" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="px-8 pt-4 pb-4 mt-2 bg-gradient-to-br from-yellow-900/60 via-yellow-800/40 to-amber-900/50 border-t border-yellow-600/30">
                      <div className="text-[11px] font-black italic uppercase tracking-tighter text-yellow-400/80 mb-2 text-center">Informacje o kontrakcie</div>
                      <div className="border-b border-white/20 mb-3" />
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300/60 mb-1">Zarobki roczne</div>
                          <span className="text-[15px] font-black italic tracking-tighter text-white">{selectedStaffMember.salary.toLocaleString('pl-PL')} PLN</span>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300/60 mb-1">Kontrakt do</div>
                          <span className="text-[15px] font-black italic tracking-tighter text-white">{formatStaffContractEnd(selectedStaffMember)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-8 pt-4 pb-7 border-t border-amber-800/30 bg-gradient-to-br from-amber-950/50 via-stone-900/60 to-orange-950/40">
                      <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-300 mb-2 text-center">Historia kariery</div>
                      <div className="border-b border-white/20 mb-3" />
                      {selectedStaffMember.history.length === 0 ? (
                        <span className="text-[12px] italic text-slate-600">Brak historii</span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {selectedStaffMember.history.map((h, i) => (
                            <div key={`${h.clubId}-${h.fromYear}-${i}`} className="flex items-center justify-between gap-4">
                              <span className="text-[14px] font-black italic uppercase tracking-tighter text-white">{h.clubName}</span>
                              <span className="text-[11px] italic text-slate-200 text-right">
                                {MONTHS_PL[(h.fromMonth ?? 1) - 1]} {h.fromYear} — {h.toYear ? `${MONTHS_PL[(h.toMonth ?? 1) - 1]} ${h.toYear}` : 'obecnie'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <style>{`
        .custom-scrollbar table thead th:nth-child(8) { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};
