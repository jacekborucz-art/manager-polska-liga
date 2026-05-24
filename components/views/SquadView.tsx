import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PortalScaleWrapper } from '../GameScaler';
import { useGame } from '../../context/GameContext';
import { ViewState, PlayerPosition, Player, HealthStatus, InjurySeverity, NationalTeam, CompetitionType, MatchStatus, Fixture, StaffRole } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TacticRepository } from '../../resources/tactics_db';
import { LineupService } from '../../services/LineupService';
import { PlayerPresentationService } from '../../services/PlayerPresentationService';
import { TeamAnalysisService } from '../../services/TeamAnalysisService';
import szatnia from '../../Graphic/themes/szatnia.png';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import { TeamAnalysisModal } from './TeamAnalysisModal';
import { WeeklyMotivationModal } from '../modals/WeeklyMotivationModal';
import { WeeklyMotivationService } from '../../services/WeeklyMotivationService';
import { STAFF_ROLE_ATTRS } from '../../services/StaffGenerationService';
import { PlayerCareerService } from '../../services/PlayerCareerService';
import { MotivationTalkOption } from '../../data/weekly_motivation_talks_pl';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import { MotivationTalkResult } from '../../services/WeeklyMotivationService';
import { PlayerMoraleService } from '../../services/PlayerMoraleService';
import { generatePlayerReport } from '../../services/TrainingAssistantService';

export const SquadView: React.FC = () => {
  const { players, userTeamId, clubs, setClubs, navigateTo, lineups, updateLineup, viewPlayerDetails, currentDate,
          reserves, setReserves, setPlayers, applyWeeklyMotivation, sessionSeed, nationalTeams, fixtures, leagues,
          coaches, staffMembers, managerProfile, fireStaffMember, extendStaffContract, negotiateStaffContract,
          toggleTransferList, toggleLoanAvailability, terminateLoanEarly, toggleUntouchable, setSquadRole, setPendingOpenTalk, seasonNumber } = useGame();
  
  const myClub = useMemo(() => clubs.find(c => c.id === userTeamId), [clubs, userTeamId]);
  const myPlayers = userTeamId ? players[userTeamId] : [];
  const myLineup = userTeamId ? lineups[userTeamId] : null;
  const allLeaguePlayers = useMemo(() => Object.values(players).flat(), [players]);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; playerId: string; loc: 'START' | 'BENCH' | 'RES' } | null>(null);
  const [reportPlayer, setReportPlayer] = useState<Player | null>(null);
  const [reportModalPos, setReportModalPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [reportDragging, setReportDragging] = useState<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string | null, index?: number, loc: 'START' | 'BENCH' | 'RES' } | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isMotivationOpen, setIsMotivationOpen] = useState(false);
  const [roleSubmenuOpen, setRoleSubmenuOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);
  const [staffActionMsg, setStaffActionMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [staffFireConfirmOpen, setStaffFireConfirmOpen] = useState(false);
  const [staffNegotiationOpen, setStaffNegotiationOpen] = useState(false);
  const [staffNegPhase, setStaffNegPhase] = useState<'proposal' | 'counter' | 'result'>('proposal');
  const [staffNegProposedSalary, setStaffNegProposedSalary] = useState(0);
  const [staffNegProposedYears, setStaffNegProposedYears] = useState(1);
  const [staffNegCounterSalary, setStaffNegCounterSalary] = useState(0);
  const [staffNegCounterYears, setStaffNegCounterYears] = useState(1);
  const [staffNegResultMsg, setStaffNegResultMsg] = useState('');
  const [staffNegResultOk, setStaffNegResultOk] = useState(false);
  const [staffNegSalaryStr, setStaffNegSalaryStr] = useState('');
  const [activeTab, setActiveTab] = useState<'SQUAD' | 'CONTRACT' | 'MORALE' | 'SCHEDULE' | 'TABLE' | 'LOANS'>('SQUAD');
  const [loanDetailsPlayerId, setLoanDetailsPlayerId] = useState<string | null>(null);
  const loanDetailsPlayer = useMemo(
    () => loanDetailsPlayerId ? allLeaguePlayers.find(player => player.id === loanDetailsPlayerId) ?? null : null,
    [allLeaguePlayers, loanDetailsPlayerId]
  );
  const [scheduleSeasonFilter, setScheduleSeasonFilter] = useState<number | null>(null);

  const REGION_LABELS: Record<string, string> = {
    POLAND: 'Polska', ENGLAND: 'Anglia', GERMANY: 'Niemcy', FRANCE: 'Francja',
    SPAIN: 'Hiszpania', ITALY: 'Włochy', BALKANS: 'Bałkany', CZ_SK: 'Czechy/Słowacja',
    SCANDINAVIA: 'Skandynawia', EX_USSR: 'WNP', BALTIC: 'Kraje bałtyckie', ROMANIA: 'Rumunia',
  };
  const cachedReport = useMemo(
    () => reportPlayer ? generatePlayerReport(reportPlayer, myPlayers, allLeaguePlayers) : null,
    [allLeaguePlayers, myPlayers, reportPlayer]
  );

  const assistants = useMemo(() =>
    (myClub?.staffIds ?? [])
      .map(id => staffMembers[id])
      .filter(s => !!s && s.role === StaffRole.ASSISTANT_COACH),
    [myClub, staffMembers]
  );
  const hasAssistant = assistants.length > 0;

  const getAverageRatingBadgeClass = (rating: number | null): string => {
    if (rating === null) return 'bg-slate-700 border-slate-500 text-slate-200';
    if (rating < 6.0) return 'bg-red-600 border-red-400 text-white';
    if (rating <= 6.9) return 'bg-orange-500 border-orange-300 text-white';
    return 'bg-emerald-600 border-emerald-400 text-white';
  };

  const getOverallBadgeClass = (overall: number): string => {
    if (overall >= 75) return 'border-emerald-300 bg-emerald-500 text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.35)]';
    if (overall >= 65) return 'border-yellow-300 bg-yellow-400 text-slate-950 shadow-[0_0_14px_rgba(250,204,21,0.32)]';
    if (overall >= 55) return 'border-blue-300 bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,0.32)]';
    return 'border-red-300 bg-red-600 text-white shadow-[0_0_14px_rgba(220,38,38,0.32)]';
  };

  const getMoraleIcon = (morale: number = 50): string => {
    if (morale <= 19) return '⭐';
    if (morale <= 39) return '⭐⭐';
    if (morale <= 59) return '⭐⭐⭐';
    if (morale <= 79) return '⭐⭐⭐⭐';
    return '⭐⭐⭐⭐⭐';
  };

  const formatContractSalary = (salary?: number | null): string => {
    if (!salary || salary <= 0) return '-';
    return `${salary.toLocaleString('pl-PL')} PLN`;
  };

  const formatMarketValue = (value?: number | null): string => {
    if (!value || value <= 0) return '-';
    return `${value.toLocaleString('pl-PL')} PLN`;
  };

  const formatContractEnd = (contractEndDate?: string | null): string => {
    if (!contractEndDate) return '-';
    const date = new Date(contractEndDate);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatLoanEnd = (player: Player): string => {
    if (!player.loan) return '-';
    const date = new Date(player.loan.endDate);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatLoanDate = (isoDate?: string): string => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getLoanDaysLeft = (isoDate?: string): number | null => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return null;
    return Math.max(0, Math.ceil((date.getTime() - currentDate.getTime()) / 86_400_000));
  };

  const getLoanMatches = (player: Player): number => {
    return Math.max(0, (player.stats.matchesPlayed ?? 0) - (player.loan?.reportBaselineMatches ?? player.stats.matchesPlayed ?? 0));
  };

  const getLoanMinutes = (player: Player): number => {
    return Math.max(0, (player.stats.minutesPlayed ?? 0) - (player.loan?.reportBaselineMinutes ?? player.stats.minutesPlayed ?? 0));
  };

  const getLoanAverageRating = (player: Player): string => {
    const baseline = player.loan?.reportBaselineRatingCount ?? (player.stats.ratingHistory?.length ?? 0);
    const ratings = (player.stats.ratingHistory || []).slice(baseline);
    if (ratings.length === 0) return '-';
    return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2);
  };

  const getContractRemainingInfo = (contractEndDate?: string | null): { label: string; className: string } => {
    if (!contractEndDate) return { label: 'Brak danych', className: 'text-slate-500' };
    const end = new Date(contractEndDate);
    if (Number.isNaN(end.getTime())) return { label: 'Brak danych', className: 'text-slate-500' };
    const today = currentDate instanceof Date ? currentDate : new Date(currentDate);
    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
    if (daysLeft < 0) return { label: 'Wygasł', className: 'text-red-400' };
    if (daysLeft <= 180) return { label: `${daysLeft} dni`, className: 'text-red-400' };
    if (daysLeft <= 365) return { label: `${Math.ceil(daysLeft / 30)} mies.`, className: 'text-amber-400' };
    return { label: `${Math.ceil(daysLeft / 365)} lata`, className: 'text-emerald-400' };
  };

  const getSquadRoleInfo = (role?: Player['squadRole']): { label: string; className: string } => {
    if (role === 'KEY_PLAYER') return { label: 'Kluczowy', className: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-300' };
    if (role === 'STARTER') return { label: 'Podstawowa 11', className: 'border-blue-400/30 bg-blue-500/10 text-blue-300' };
    return { label: 'Brak', className: 'border-slate-500/20 bg-slate-500/10 text-slate-500' };
  };

  const getPositionBadgeClass = (position: string): string => {
    if (position === 'GK') return 'bg-yellow-500 border-yellow-300 text-slate-950 shadow-[0_0_16px_rgba(250,204,21,0.28)]';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position) || position.startsWith('DEF')) {
      return 'bg-blue-600 border-blue-300 text-white shadow-[0_0_16px_rgba(59,130,246,0.28)]';
    }
    if (['MID', 'CM', 'CDM', 'CAM', 'LM', 'RM'].includes(position) || position.startsWith('MID')) {
      return 'bg-emerald-600 border-emerald-300 text-white shadow-[0_0_16px_rgba(16,185,129,0.28)]';
    }
    return 'bg-red-600 border-red-300 text-white shadow-[0_0_16px_rgba(239,68,68,0.28)]';
  };

  const getPositionRowTintClass = (position: string): string => {
    if (position === 'GK') return 'bg-yellow-500/[0.08] hover:bg-yellow-500/[0.12]';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position) || position.startsWith('DEF')) {
      return 'bg-blue-500/[0.08] hover:bg-blue-500/[0.12]';
    }
    if (['MID', 'CM', 'CDM', 'CAM', 'LM', 'RM'].includes(position) || position.startsWith('MID')) {
      return 'bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12]';
    }
    return 'bg-red-500/[0.08] hover:bg-red-500/[0.12]';
  };

  const getPositionLabelClass = (label: string): string => {
    if (label === 'SUB' || label === 'RES') return 'bg-slate-700/70 border-slate-500/50 text-slate-200';
    if (label === 'GK') return 'bg-yellow-500/25 border-yellow-300/40 text-yellow-200';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(label) || label.startsWith('DEF')) {
      return 'bg-blue-500/25 border-blue-300/40 text-blue-200';
    }
    if (['MID', 'CM', 'CDM', 'CAM', 'LM', 'RM'].includes(label) || label.startsWith('MID')) {
      return 'bg-emerald-500/25 border-emerald-300/40 text-emerald-200';
    }
    return 'bg-red-500/25 border-red-300/40 text-red-200';
  };

  const getMoraleInfo = (morale: number): { label: string; color: string; barColor: string; bg: string; border: string; description: string } => {
    if (morale <= 20) return { label: 'BARDZO NISKIE', color: 'text-red-500', barColor: 'bg-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', description: 'Szatnia podzielona. Brak wiary w sukces.' };
    if (morale <= 35) return { label: 'NISKIE', color: 'text-orange-400', barColor: 'bg-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', description: 'Nastroje wyraźnie przygnębione. Drużyna potrzebuje pozytywnego impulsu, aby odwrócić trend.' };
    if (morale <= 64) return { label: 'NEUTRALNE', color: 'text-white', barColor: 'bg-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', description: 'Stabilna atmosfera w szatni.' };
    if (morale <= 79) return { label: 'WYSOKIE', color: 'text-green-400', barColor: 'bg-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', description: 'Pozytywna atmosfera w szatni.' };
    return { label: 'BARDZO WYSOKIE', color: 'text-yellow-400', barColor: 'bg-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', description: 'Znakomite morale! Drużyna jest w stanie szczytowej gotowości.' };
  };

  const leagueClubs = useMemo(() => myClub ? clubs.filter(c => c.leagueId === myClub.leagueId) : [], [clubs, myClub]);
  const leaguePosition = useMemo(() => {
    if (!myClub) return 0;
    const sorted = [...leagueClubs].sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
    return sorted.findIndex(c => c.id === myClub.id) + 1;
  }, [leagueClubs, myClub]);

  const mySchedule = useMemo(() => {
    if (!userTeamId) return [];
    return [...fixtures]
      .filter(f =>
        (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId) &&
        !String(f.leagueId).endsWith('_DRAW')
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [fixtures, userTeamId]);

  const allMatchHistory = useMemo(() => MatchHistoryService.getAll(), [seasonNumber]);

  const pastScheduleSeasons = useMemo(() => {
    if (!userTeamId) return [];
    const seasonMap = new Map<number, number>();
    allMatchHistory.forEach(m => {
      if (m.season >= seasonNumber) return;
      if (m.homeTeamId !== userTeamId && m.awayTeamId !== userTeamId) return;
      const year = new Date(m.date).getFullYear();
      const existing = seasonMap.get(m.season);
      if (existing === undefined || year < existing) seasonMap.set(m.season, year);
    });
    return [...seasonMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([season, minYear]) => ({ season, label: `${minYear}/${String(minYear + 1).slice(-2)}` }));
  }, [allMatchHistory, userTeamId, seasonNumber]);

  const getCompLabel = (leagueId: string): string => {
    if (leagueId === CompetitionType.POLISH_CUP) return 'PUCHAR POLSKI';
    if (leagueId === CompetitionType.SUPER_CUP) return 'SUPERPUCHAR';
    if (leagueId === CompetitionType.UEFA_SUPER_CUP) return 'UEFA SUPER';
    if (leagueId === CompetitionType.FRIENDLY) return 'SPARINGI';
    if (leagueId.startsWith('CL_')) return 'LM';
    if (leagueId.startsWith('EL_')) return 'LE';
    if (leagueId.startsWith('CONF_')) return 'KONF';
    if (leagueId.startsWith('WC')) return 'MŚ';
    if (leagueId.startsWith('PLAYOFF') || leagueId.startsWith('PROMOTION') || leagueId.startsWith('RELEGATION')) return 'BARAŻE';
    if (leagueId === 'L_PL_1') return 'EKSTRAKLASA';
    if (leagueId === 'L_PL_2') return '1. LIGA';
    if (leagueId === 'L_PL_3') return '2. LIGA';
    if (leagueId === 'L_PL_4') return '3. LIGA';
    const league = leagues.find(l => l.id === leagueId);
    return league ? league.name.toUpperCase() : 'LIGA';
  };

  const neutralTypes: string[] = [
    CompetitionType.SUPER_CUP, CompetitionType.UEFA_SUPER_CUP,
    CompetitionType.CL_FINAL, CompetitionType.EL_FINAL, CompetitionType.CONF_FINAL,
  ];

  const getVenueInfo = (f: Fixture): { label: string; color: string } => {
    if (f.neutralVenue || neutralTypes.includes(f.leagueId as string)) {
      return { label: 'NEUTRALNY', color: 'text-amber-400' };
    }
    if (f.homeTeamId === userTeamId) return { label: 'DOM', color: 'text-emerald-400' };
    return { label: 'WYJAZD', color: 'text-sky-400' };
  };

  const nationalTeamByPlayerId = useMemo(() => {
    const map = new Map<string, NationalTeam>();
    nationalTeams.forEach(nt => {
      nt.squadPlayerIds.forEach(id => map.set(id, nt));
    });
    return map;
  }, [nationalTeams]);

  const canMotivate = useMemo(() => myClub ? WeeklyMotivationService.canMotivate(myClub, currentDate) : false, [myClub, currentDate]);
  const motivationPanelText = canMotivate
    ? 'Druzyna jest gotowa na kolejna rozmowe motywacyjna.'
    : 'Regularny kontakt z szatnia ma znaczenie. Jesli atmosfera zacznie sie psuc, kapitan da Ci o tym znac w wiadomosci.';

  const handleMotivationConfirm = (talk: MotivationTalkOption, result: MotivationTalkResult) => {
    applyWeeklyMotivation(result.moraleDelta);
    setIsMotivationOpen(false);
  };

  const moveToReserves = (player: Player) => {
    if (!userTeamId || !myLineup) return;

    const slotIndex = myLineup.startingXI.indexOf(player.id);

    // Jeśli zawodnik był w XI — szukamy zastępcy z rezerw taktycznych
    let replacementId: string | null = null;
    if (slotIndex >= 0) {
      const slotRole = currentTactic.slots[slotIndex]?.role;
      const availableReserves = myLineup.reserves
        .map(id => myPlayers.find(p => p.id === id))
        .filter((p): p is Player =>
          !!p &&
          (p.suspensionMatches || 0) === 0 &&
          !(p.health.status === HealthStatus.INJURED &&
            (p.health.injury?.severity === InjurySeverity.SEVERE ||
              (p.health.injury?.daysRemaining ?? 0) > 2)) &&
          p.condition >= 60
        );
      replacementId = (
        availableReserves.find(p => p.position === slotRole) ??
        availableReserves[0] ??
        null
      )?.id ?? null;
    }

    const removedFromReserves = new Set([player.id, ...(replacementId ? [replacementId] : [])]);

    const newLineup = {
      ...myLineup,
      startingXI: myLineup.startingXI.map(id => (id === player.id ? replacementId : id)),
      bench: myLineup.bench.filter(id => id !== player.id),
      reserves: myLineup.reserves.filter(id => !removedFromReserves.has(id)),
    };

    updateLineup(userTeamId, newLineup);
    setPlayers(prev => ({ ...prev, [userTeamId]: prev[userTeamId].filter(p => p.id !== player.id) }));
    const clubData = clubs.find(c => c.id === userTeamId);
    let updatedPlayer = player;
    if (clubData) {
      const d = currentDate instanceof Date ? currentDate : new Date(currentDate);
      const newHistory = PlayerCareerService.reopenOrCreateEntry(
        player.history || [],
        player,
        { clubId: userTeamId, clubName: `${clubData.name} II` },
        d.getFullYear(),
        d.getMonth() + 1
      );
      updatedPlayer = { ...player, history: newHistory };
    }
    setReserves(prev => [...prev, updatedPlayer]);
  };

  const currentTactic = useMemo(() => {
    return myLineup ? TacticRepository.getById(myLineup.tacticId) : TacticRepository.getDefault();
  }, [myLineup]);

  const getPlayerById = (id: string | null) => id ? myPlayers.find(p => p.id === id) : null;

  const formatPitchPlayerName = (player: Player) => {
    const firstInitial = player.firstName.trim().charAt(0);
    return firstInitial ? `${firstInitial}. ${player.lastName}` : player.lastName;
  };

  const handlePlayerClick = (pId: string | null, loc: 'START' | 'BENCH' | 'RES', index?: number) => {
    if (!myLineup || !userTeamId) return;

    if (selectedSlot === null) {
      const clickedPlayer = pId ? myPlayers.find(p => p.id === pId) : null;
      if (clickedPlayer && loc === 'RES') {
         // Sprawdź zawieszenia
         if ((clickedPlayer.suspensionMatches || 0) > 0) {
            return;
         }
         // Sprawdź kontuzje (SEVERE lub daysRemaining > 2)
         if (clickedPlayer.health.status === HealthStatus.INJURED && (clickedPlayer.health.injury?.severity === InjurySeverity.SEVERE || (clickedPlayer.health.injury?.daysRemaining ?? 0) > 2)) {
            return;
         }
         // Sprawdź przemęczenie (kondycja < 60)
         if (clickedPlayer.condition < 60) {
            return;
         }
      }
      setSelectedSlot({ id: pId, index, loc });
    } else {
      const sourcePlayer = selectedSlot.id ? myPlayers.find(p => p.id === selectedSlot.id) : null;
      
      // Walidacja przy wstawianiu zawodnika z Rezerw do składu
      if (sourcePlayer && selectedSlot.loc === 'RES' && loc !== 'RES') {
         if ((sourcePlayer.suspensionMatches || 0) > 0) {
            setSelectedSlot(null);
            return;
         }
         if (sourcePlayer.health.status === HealthStatus.INJURED && (sourcePlayer.health.injury?.severity === InjurySeverity.SEVERE || (sourcePlayer.health.injury?.daysRemaining ?? 0) > 2)) {
            setSelectedSlot(null);
            return;
         }
         // Sprawdź przemęczenie (kondycja < 60)
         if (sourcePlayer.condition < 60) {
            setSelectedSlot(null);
            return;
         }
      }
      // Walidacja klikniętego zawodnika z Rezerw wstawianego do XI/ławki (slot wybrany wcześniej)
      if (loc === 'RES' && selectedSlot.loc !== 'RES') {
         const clickedTarget = pId ? myPlayers.find(p => p.id === pId) : null;
         if (clickedTarget) {
            if ((clickedTarget.suspensionMatches || 0) > 0) {
               setSelectedSlot(null);
               return;
            }
            if (clickedTarget.health.status === HealthStatus.INJURED && (clickedTarget.health.injury?.severity === InjurySeverity.SEVERE || (clickedTarget.health.injury?.daysRemaining ?? 0) > 2)) {
               setSelectedSlot(null);
               return;
            }
            if (clickedTarget.condition < 60) {
               setSelectedSlot(null);
               return;
            }
         }
      }

      // Wykonaj uniwersalną zamianę
      const newLineup = LineupService.swapPlayers(
        myLineup, 
        selectedSlot.id, 
        pId, 
        selectedSlot.loc === 'START' ? selectedSlot.index : undefined, 
        loc === 'START' ? index : undefined
      );
      updateLineup(userTeamId, newLineup);
      fixSpecialRoles(newLineup.startingXI);
      setSelectedSlot(null);
    }
  };

  const handlePlayerDoubleClick = (playerId: string) => {
    viewPlayerDetails(playerId);
  };

  const handleTacticChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!myLineup || !userTeamId) return;
    const newLineup = { ...myLineup, tacticId: e.target.value };
    updateLineup(userTeamId, newLineup);
  };

  const fixSpecialRoles = (newStartingXI: (string | null)[]) => {
    if (!userTeamId || !myClub) return;
    const xiIds = newStartingXI.filter((id): id is string => id !== null);
    const xiPlayers = myPlayers.filter(p => xiIds.includes(p.id));
    if (xiPlayers.length === 0) return;
    setClubs(prev => prev.map(c => {
      if (c.id !== userTeamId) return c;
      const captainId = c.captainId && xiIds.includes(c.captainId)
        ? c.captainId
        : [...xiPlayers].sort((a, b) => b.attributes.leadership - a.attributes.leadership)[0]?.id ?? null;
      const penaltyTakerId = c.penaltyTakerId && xiIds.includes(c.penaltyTakerId)
        ? c.penaltyTakerId
        : [...xiPlayers].sort((a, b) => b.attributes.finishing - a.attributes.finishing)[0]?.id ?? null;
      const freeKickTakerId = c.freeKickTakerId && xiIds.includes(c.freeKickTakerId)
        ? c.freeKickTakerId
        : [...xiPlayers].sort((a, b) => b.attributes.freeKicks - a.attributes.freeKicks)[0]?.id ?? null;
      return { ...c, captainId, penaltyTakerId, freeKickTakerId };
    }));
  };

  const handleAutoPick = () => {
    if(!userTeamId) return;
    if (!hasAssistant) return;
    const newLineup = { ...LineupService.autoPickLineup(userTeamId, myPlayers, currentTactic.id) };
    updateLineup(userTeamId, newLineup);
    fixSpecialRoles(newLineup.startingXI);
  };

  const benchPlayers = useMemo(() => {
    if (!myLineup) return [];
    const pObjs = myLineup.bench.map(id => getPlayerById(id)).filter(Boolean) as Player[];
    return PlayerPresentationService.sortPlayers(pObjs).map(p => p.id);
  }, [myLineup?.bench, myPlayers]);

  const reservePlayersSorted = useMemo(() => {
    if (!myLineup) return [];
    const pObjs = myLineup.reserves.map(id => getPlayerById(id)).filter(Boolean) as Player[];
    return PlayerPresentationService.sortPlayers(pObjs).map(p => p.id);
  }, [myLineup?.reserves, myPlayers]);

  const teamAnalysisReport = useMemo(() => {
    if (!myClub || myPlayers.length === 0) return null;
    return TeamAnalysisService.analyzeSquad(myClub, myPlayers, currentDate);
  }, [myClub, myPlayers, currentDate]);

  if (!myLineup || !userTeamId || !myClub) return null;

  const getPositionGroup = (role: string): string => {
    if (role === 'GK') return 'GK';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(role) || role.startsWith('DEF')) return 'DEF';
    if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(role) || role.startsWith('MID')) return 'MID';
    return 'FWD';
  };

  const renderPlayerRow = (pId: string | null, label: string, loc: 'START' | 'BENCH' | 'RES', index?: number) => {
    const isContractTab = activeTab === 'CONTRACT';
    const player = pId ? getPlayerById(pId) : null;
    const isSelected = selectedSlot?.loc === loc && (loc === 'START' ? selectedSlot.index === index : selectedSlot.id === pId);
    const selectedRole = selectedSlot?.loc === 'START' && selectedSlot.index !== undefined ? currentTactic.slots[selectedSlot.index]?.role : null;
    const isHighlighted = !isSelected && selectedRole && (loc === 'BENCH' || loc === 'RES') && player
      && !(( player.suspensionMatches || 0) > 0)
      && !(player.health.status === HealthStatus.INJURED && (player.health.injury?.severity === InjurySeverity.SEVERE || (player.health.injury?.daysRemaining ?? 0) > 2))
      && !(player.condition < 60)
      && getPositionGroup(player.position) === getPositionGroup(selectedRole);

    if (!player && loc === 'START') {
      return (
        <tr 
          key={`empty-${index}`}
          onClick={() => handlePlayerClick(null, 'START', index)}
          className={`group h-16 border-b border-white/5 cursor-pointer transition-all animate-pulse
            ${isSelected ? 'bg-red-500/30 ring-2 ring-inset ring-red-500' : 'bg-red-500/5 hover:bg-red-500/10'}`}
        >
          <td className="pl-6 w-12 text-[10px] font-black text-red-500/50 uppercase tracking-tighter">{label}</td>
          <td className="w-6 text-center text-slate-700">
            <span className="inline-flex items-center justify-center text-[10px] font-black">→</span>
          </td>
          <td colSpan={isContractTab ? 9 : 8} className="px-4 text-[11px] font-black text-red-500 italic uppercase tracking-widest">
            &gt; WSTAW ZAWODNIKA &lt;
          </td>
        </tr>
      );
    }

    if (!player) return null;

    const healthInfo = PlayerPresentationService.getHealthDisplay(player);
    const condColor = PlayerPresentationService.getConditionColorClass(player.condition);
    const pendingTransferClub = player.transferPendingClubId
      ? clubs.find(c => c.id === player.transferPendingClubId)
      : null;
    const hasPendingTransfer = !!player.transferPendingClubId && !!player.transferReportDate;
    const pendingTransferFeeLabel = player.transferPendingFee === 0
      ? 'Wolny transfer po wygaśnięciu kontraktu'
      : player.transferPendingFee
        ? `Kwota: ${player.transferPendingFee.toLocaleString('pl-PL')} PLN`
        : 'Transfer uzgodniony';
    const isSuspended = (player.suspensionMatches || 0) > 0;
    const isSevereInjured = player.health.status === HealthStatus.INJURED && player.health.injury?.severity === InjurySeverity.SEVERE;
    const isOverfatigued = player.condition < 60;
    const isOutOfPosition = loc === 'START' && getPositionGroup(player.position) !== getPositionGroup(label);
    const averageRating = player.stats?.ratingHistory?.length
      ? player.stats.ratingHistory.reduce((a, b) => a + b, 0) / player.stats.ratingHistory.length
      : null;
    const moralePlayer = PlayerMoraleService.ensurePlayerState(player);
    const playerMoraleInfo = PlayerMoraleService.getInfo(moralePlayer.morale);
    const effectiveOverall = PlayerMoraleService.getEffectiveOverall(moralePlayer);
    const contractRemaining = getContractRemainingInfo(player.contractEndDate);
    const squadRoleInfo = getSquadRoleInfo(player.squadRole);

    return (
      <tr
        key={`${loc}-${player.id}-${index ?? 0}`}
        onClick={() => handlePlayerClick(player.id, loc, index)}
        onDoubleClick={() => handlePlayerDoubleClick(player.id)}
        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, playerId: player.id, loc }); }}
        className={`group relative h-14 border-b border-white/5 transition-all cursor-pointer
          ${isSelected ? 'bg-blue-600/20 ring-1 ring-inset ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : isHighlighted ? 'bg-emerald-500/10 ring-1 ring-inset ring-emerald-400/60 shadow-[0_0_16px_rgba(52,211,153,0.15)]' : isOutOfPosition ? 'bg-red-950/30 ring-2 ring-inset ring-red-500 shadow-[0_0_18px_rgba(239,68,68,0.2)]' : getPositionRowTintClass(player.position)}
          ${(isSuspended || isSevereInjured || isOverfatigued) ? 'opacity-30 grayscale' : ''}`}
      >
        <td className="w-12 relative z-10 overflow-hidden">
           <span className={`absolute inset-y-0 left-0 inline-flex w-10 items-center justify-center rounded-r-md border text-[8px] font-black uppercase tracking-tight ${getPositionLabelClass(label)}`}>
             {label}
           </span>
        </td>
        <td className="w-6 relative z-10 text-center">
          <span className="inline-flex items-center justify-center text-slate-500/80">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
              <path d="M3 8h8m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </td>
        <td className="w-14 relative z-10">
          <span className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-full border px-1.5 font-mono text-[9px] font-black leading-none tracking-tight ${getPositionBadgeClass(player.position)}`}>
            {player.position}
          </span>
        </td>
        <td className="relative z-10 w-52">
           <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className={`text-sm font-black uppercase italic tracking-tight transition-colors ${(isSuspended || isSevereInjured || isOverfatigued) ? 'text-slate-500' : 'text-white group-hover:text-blue-400'}`}>
                  {player.lastName}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${(isSuspended || isSevereInjured || isOverfatigued) ? 'text-slate-400' : 'text-white'}`}>{player.firstName}</span>
              </div>
              {myClub?.captainId === player.id && (
                <span className="w-5 h-5 rounded-full bg-blue-900 border border-blue-400 flex items-center justify-center text-[9px] font-black text-white shrink-0" title="Kapitan">C</span>
              )}
              {myClub?.penaltyTakerId === player.id && (
                <span className="px-1.5 py-0.5 bg-emerald-900/60 text-emerald-400 text-[8px] font-black rounded border border-emerald-500/40 shrink-0 leading-none" title="Egzekutor karnych">PK</span>
              )}
              {myClub?.freeKickTakerId === player.id && (
                <span className="px-1.5 py-0.5 bg-amber-900/60 text-amber-400 text-[8px] font-black rounded border border-amber-500/40 shrink-0 leading-none" title="Egzekutor wolnych">FK</span>
              )}
              {player.isOnTransferList && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[8px] font-black rounded border border-amber-500/30 shadow-sm shrink-0 leading-none">
                     LISTA
                </span>
              )}
              {player.isAvailableForLoan && !player.loan && (
                <span
                  title="Dostępny do wypożyczenia"
                  className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[8px] font-black italic uppercase tracking-tighter rounded border border-cyan-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  LOAN
                </span>
              )}
              {hasPendingTransfer && (
                <span
                  title={`Transfer do ${pendingTransferClub?.name ?? player.transferPendingClubId}${player.transferReportDate ? `\nData przejścia: ${new Date(player.transferReportDate).toLocaleDateString('pl-PL')}` : ''}\n${pendingTransferFeeLabel}`}
                  className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded border border-emerald-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  TRS
                </span>
              )}
              {/* Badge zainteresowania transferowego — pojawia się gdy ≥1 klub AI obserwuje zawodnika */}
              {player.loan && (
                <span
                  title={`Wypożyczony z ${player.loan.parentClubName} do ${player.loan.destinationClubName}\nDo: ${formatLoanEnd(player)}`}
                  className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[8px] font-black italic uppercase tracking-tighter rounded border border-cyan-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  WYP
                </span>
              )}
              {player.interestedClubs && player.interestedClubs.filter(id => id !== player.clubId).length > 0 && (
                <span
                  title={`Zainteresowane kluby:\n${player.interestedClubs.filter(id => id !== player.clubId).map(id => clubs.find(c => c.id === id)?.name ?? id).join('\n')}`}
                  className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black rounded border border-blue-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  INT
                </span>
              )}
              {nationalTeamByPlayerId.has(player.id) && (
                <span
                  title={`Powołany do reprezentacji: ${nationalTeamByPlayerId.get(player.id)?.name ?? ''}`}
                  className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] font-black rounded border border-purple-500/30 shadow-sm shrink-0 leading-none cursor-help"
                >
                  REP
                </span>
              )}
           </div>
        </td>
        {isContractTab ? (
          <>
            <td className="relative z-10 px-3 w-16 text-center">
              <span className="text-[13px] font-black italic tracking-tighter text-slate-200 whitespace-nowrap">{player.age}</span>
            </td>
            <td className="relative z-10 px-4 w-44 text-center">
              <span className="text-[13px] font-black italic tracking-tighter text-yellow-300 whitespace-nowrap">{formatContractSalary(player.annualSalary)}</span>
            </td>
            <td className="relative z-10 px-4 w-32 text-center">
              <span className="text-[12px] font-black italic tracking-tighter text-slate-200 whitespace-nowrap">{formatContractEnd(player.contractEndDate)}</span>
            </td>
            <td className="relative z-10 px-4 w-32 text-center">
              <span className={`inline-flex min-w-[80px] items-center justify-center rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black italic uppercase tracking-tighter ${contractRemaining.className}`}>
                {contractRemaining.label}
              </span>
            </td>
            <td className="relative z-10 px-4 w-36 text-center">
              <span className={`inline-flex min-w-[108px] items-center justify-center rounded-md border px-2 py-1 text-[10px] font-black italic uppercase tracking-tighter ${squadRoleInfo.className}`}>
                {squadRoleInfo.label}
              </span>
            </td>
            <td className="relative z-10 px-4 w-36 text-center">
              <span className="text-[13px] font-black italic tracking-tighter text-emerald-300 whitespace-nowrap">{formatMarketValue(player.marketValue)}</span>
            </td>
            <td className="relative z-10 pr-6 w-20 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-[13px] font-black italic tracking-tighter leading-none ${getOverallBadgeClass(player.overallRating)}`}>
                {player.overallRating}
              </span>
            </td>
          </>
        ) : (
          <>
        <td className="relative z-10 px-2 w-36">
          <div className="flex gap-[6px]">
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-slate-300 leading-none">{player.stats.matchesPlayed}</span>
            </div>
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-emerald-400 leading-none">{player.stats.goals}</span>
            </div>
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-blue-400 leading-none">{player.stats.assists}</span>
            </div>
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-yellow-400 leading-none">{player.stats.yellowCards}</span>
            </div>
            <div className="flex flex-col items-center w-[22px]">
              <span className="text-[12px] font-black font-mono text-red-500 leading-none">{player.stats.redCards}</span>
            </div>
          </div>
        </td>
        <td className="relative z-10 px-3">
          <div className="flex gap-[6px]">
            {([
              player.attributes.pace,
              player.attributes.passing,
              player.attributes.defending,
              player.attributes.attacking,
              player.attributes.leadership,
              player.attributes.aggression,
            ] as number[]).map((val, i) => (
              <div key={i} className="flex items-center justify-center w-[22px]">
                <span className={`text-[12px] font-black font-mono leading-none ${val >= 75 ? 'text-emerald-400' : val >= 55 ? 'text-amber-400' : 'text-red-400'}`}>{val}</span>
              </div>
            ))}
          </div>
        </td>
        <td className="w-20 text-center relative z-10">
           <span
             className={`inline-flex min-w-[54px] items-center justify-center text-[11px] leading-none ${playerMoraleInfo.colorClass}`}
             title={`Morale: ${playerMoraleInfo.label}${effectiveOverall !== player.overallRating ? ` / Gotowość: ${effectiveOverall}` : ''}`}
           >
             {getMoraleIcon(moralePlayer.morale)}
           </span>
        </td>
        <td className="w-24 text-center relative z-10">
           <span className={`text-[10px] font-black uppercase tracking-widest ${healthInfo.colorClass}`}>{healthInfo.text}</span>
        </td>

{/* TUTAJ WSTAW TEN KOD - Kolumna średniej oceny w wierszu */}
     <td className="w-16 text-center relative z-10">
           <span className={`inline-flex min-w-[44px] items-center justify-center rounded-md border px-2 py-1 text-sm font-black font-mono italic ${getAverageRatingBadgeClass(averageRating)}`}>
              {averageRating !== null ? averageRating.toFixed(1) : '-'}
           </span>
        </td>

        <td className="pr-6 w-32 relative z-10">
           <div className="flex items-center gap-3">
             <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
               {/* Warstwa długu przemęczenia - czerwony sufit */}
                <div className="absolute inset-0 bg-red-600/40" style={{ left: `${100 - (player.fatigueDebt || 0)}%` }} />
                {/* Pasek kondycji */}
                <div className={`h-full ${condColor} transition-all duration-1000 relative z-10`} style={{ width: `${player.condition}%` }} />
             </div>
             <div className="flex flex-col items-end min-w-[32px]">
                <span className="text-[10px] font-black font-mono text-white leading-none">{Math.round(player.condition)}%</span>
                {player.fatigueDebt > 5 && (
                  <span className="text-[7px] font-black text-red-500 leading-none mt-0.5">-{Math.round(player.fatigueDebt)}</span>
                )}
             </div>
           </div>
        </td>
          </>
        )}

      </tr>
    );
  };

  const handleContextAction = (action: 'captain' | 'penalty' | 'freekick' | 'reserves' | 'talk' | 'transferList' | 'loanAvailable' | 'untouchable' | 'roleNone' | 'roleStarter' | 'roleKey') => {
    if (!contextMenu || !userTeamId || !myClub) return;
    if (action === 'talk') {
      setPendingOpenTalk(true);
      viewPlayerDetails(contextMenu.playerId);
      setContextMenu(null);
      return;
    }
    if (action === 'transferList') {
      toggleTransferList(contextMenu.playerId);
      setContextMenu(null);
      return;
    }
    if (action === 'loanAvailable') {
      toggleLoanAvailability(contextMenu.playerId);
      setContextMenu(null);
      return;
    }
    if (action === 'untouchable') {
      toggleUntouchable(contextMenu.playerId);
      setContextMenu(null);
      return;
    }
    if (action === 'roleNone') { setSquadRole(contextMenu.playerId, null); setContextMenu(null); return; }
    if (action === 'roleStarter') { setSquadRole(contextMenu.playerId, 'STARTER'); setContextMenu(null); return; }
    if (action === 'roleKey') { setSquadRole(contextMenu.playerId, 'KEY_PLAYER'); setContextMenu(null); return; }
    if (action === 'reserves') {
      const player = myPlayers.find(p => p.id === contextMenu.playerId);
      if (player) moveToReserves(player);
      setContextMenu(null);
      return;
    }
    setClubs(prev => prev.map(c => c.id !== userTeamId ? c : {
      ...c,
      captainId:       action === 'captain'   ? contextMenu.playerId : c.captainId,
      penaltyTakerId:  action === 'penalty'   ? contextMenu.playerId : c.penaltyTakerId,
      freeKickTakerId: action === 'freekick'  ? contextMenu.playerId : c.freeKickTakerId,
    }));
    setContextMenu(null);
  };

  const handleOpenAssistantReport = () => {
    if (!contextMenu) return;
    const player = myPlayers.find(p => p.id === contextMenu.playerId);
    if (!player) return;

    setReportPlayer(player);
    setReportModalPos({
      x: Math.max(0, window.innerWidth / 2 - 610),
      y: Math.max(20, window.innerHeight / 2 - 320),
    });
    setContextMenu(null);
  };

  return (
    <div className="h-screen w-full flex flex-col pt-9 px-6 pb-3 animate-fade-in overflow-hidden relative font-sans text-slate-100">
      
      {/* 1. KINETYCZNE TŁO (BEZ ZMIAN URL) */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
       <div 
  className="absolute inset-0 bg-cover bg-center opacity-[0.15] mix-blend-screen scale-110"
  style={{ backgroundImage: `url(${szatnia})` }}
/>
        <div 
          className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[180px] opacity-25 animate-pulse-slow transition-all duration-[3000ms]" 
          style={{ background: myClub.colorsHex[0] }} 
        />
        <div className="absolute left-[-5%] bottom-[-5%] text-[30rem] font-black italic text-white/[0.015] select-none pointer-events-none tracking-tighter">{myClub.shortName}</div>
      </div>

      {/* 2. BROADCAST HEADER */}
      <header className="relative overflow-visible flex items-center justify-between px-10 py-[4px] bg-slate-900/40 rounded-[40px] border border-white/10 backdrop-blur-3xl shrink-0 shadow-2xl mb-6">
         {/* Club logo / colors — floats over everything */}
         {getClubLogo(myClub.id) ? (
           <div className="absolute left-6 top-1/2 -translate-y-1/2" style={{ zIndex: 9999, pointerEvents: 'none' }}>
             <div className="absolute inset-[-10px] rounded-3xl blur-xl opacity-20" style={{ backgroundColor: myClub.colorsHex[0] }} />
             <img
               src={getClubLogo(myClub.id)}
               alt={myClub.name}
               className="w-[172px] h-[172px] object-contain drop-shadow-2xl relative"
               style={{ transform: 'rotate(-12deg)' }}
             />
           </div>
         ) : (
           <div className="absolute left-6 top-1/2 -translate-y-1/2 group" style={{ zIndex: 9999 }}>
             <div className="absolute inset-[-10px] rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: myClub.colorsHex[0] }} />
             <div className="w-20 h-20 rounded-[28px] flex flex-col overflow-hidden border-2 border-white/20 shadow-2xl transform group-hover:rotate-6 transition-transform duration-500 relative">
               <div style={{ backgroundColor: myClub.colorsHex[0] }} className="flex-1" />
               <div style={{ backgroundColor: myClub.colorsHex[1] || myClub.colorsHex[0] }} className="flex-1" />
             </div>
           </div>
         )}
         <div className="flex items-center gap-8">
            <div className="w-[140px] shrink-0" />
            <div>
               <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-2xl">Zarządzanie <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Kadrą</span></h1>
               <div className="flex items-center gap-8 mt-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] px-4 py-1 rounded-full bg-white/5 border border-white/10" style={{ color: myClub.colorsHex[0] }}>{myClub.name.toUpperCase()}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">TAKTYKI</span>
                    <select 
                      value={currentTactic.id} 
                      onChange={handleTacticChange} 
                      className="bg-black/60 border border-white/10 text-white text-[13px] font-black uppercase rounded-2xl px-8 py-3 hover:border-blue-500/50 transition-all cursor-pointer outline-none focus:ring-4 focus:ring-blue-500/10 shadow-2xl min-w-[240px] appearance-none italic"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1rem' }}
                    >
                      {TacticRepository.getAll().map(t => <option key={t.id} value={t.id} className="bg-slate-950">{t.name}</option>)}
                    </select>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-5">
            <button
              onClick={() => canMotivate && setIsMotivationOpen(true)}
              className={`relative group px-8 py-5 rounded-[24px] text-[11px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] overflow-hidden border-t border-x border-b ${
                canMotivate
                  ? 'bg-violet-600/10 border-t-violet-400/40 border-x-violet-500/20 border-b-black/60 text-violet-300 hover:bg-violet-600/20 cursor-pointer'
                  : 'bg-white/[0.02] border-t-white/10 border-x-white/5 border-b-black/40 text-slate-600 cursor-not-allowed'
              }`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              title={canMotivate ? 'Przeprowadź tygodniową rozmowę motywacyjną' : 'Dostępne raz na tydzień'}
            >
              <span className="relative z-10 flex items-center gap-2">💬 MOTYWACJA{!canMotivate && <span className="text-[8px] normal-case not-italic font-bold text-slate-600">· użyta</span>}</span>
              {canMotivate && <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
            <button
              onClick={() => setIsStaffOpen(true)}
              className="relative group px-8 py-5 rounded-[24px] bg-cyan-600/10 border-t border-x border-b border-t-cyan-400/40 border-x-cyan-500/20 border-b-black/60 text-[11px] font-black uppercase italic tracking-widest text-cyan-300 hover:bg-cyan-600/20 transition-all active:translate-y-[2px] overflow-hidden"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              <span className="relative z-10 flex items-center gap-2">👥 SZTAB</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => setIsAnalysisOpen(true)}
              disabled={!hasAssistant}
              className="relative group px-8 py-5 rounded-[24px] bg-emerald-600/10 border-t border-x border-b border-t-emerald-400/40 border-x-emerald-500/20 border-b-black/60 text-[11px] font-black uppercase italic tracking-widest text-emerald-300 hover:bg-emerald-600/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:translate-y-[2px] overflow-hidden"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
               <span className="relative z-10 flex items-center gap-3">ANALIZA DRUŻYNY</span>
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button onClick={handleAutoPick} disabled={!hasAssistant} className="relative group px-10 py-5 rounded-[24px] bg-blue-600/10 border-t border-x border-b border-t-blue-400/40 border-x-blue-500/20 border-b-black/60 text-[11px] font-black uppercase italic tracking-widest text-blue-400 hover:bg-blue-600/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:translate-y-[2px] overflow-hidden" style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
               <span className="relative z-10 flex items-center gap-3">🪄 AUTO WYBÓR</span>
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="w-px h-12 bg-white/10 mx-2" />
            <button onClick={() => navigateTo(ViewState.DASHBOARD)} className="px-10 py-5 rounded-[24px] bg-white text-slate-900 font-black uppercase italic tracking-widest text-xs hover:scale-105 transition-all active:translate-y-[2px] border-t border-x border-b border-t-white/80 border-x-white/40 border-b-slate-400/60" style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)' }}>&larr; POWRÓT</button>
         </div>
      </header>

      {/* 3. MAIN TACTICAL WORKSPACE */}
      <div className="flex-1 flex gap-8 min-h-0">
        
        {/* LEFT: THE PITCH (LEVEL PRO VIZ) */}
        <div className="w-[45%] bg-slate-900/40 rounded-[50px] border border-white/10 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden flex items-center justify-center p-12 shrink-0 group">
           {/* Internal Pitch Lighting */}
           <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />

           <div className="w-full h-full max-w-[550px] aspect-[2/3.2] relative rounded-none border-0 overflow-hidden shadow-[0_100px_150px_rgba(0,0,0,0.8)] transform perspective-[1500px] rotateX(15deg)" style={{ backgroundColor: 'rgba(5, 61, 1, 0.65)' }}>
              {/* Pitch Markings SVG */}
              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 150" fill="none" stroke="white" strokeWidth="0.8">
                 <rect x="2" y="2" width="96" height="146" />
                 <line x1="2" y1="75" x2="98" y2="75" />
                 <circle cx="50" cy="75" r="15" />
                 <circle cx="50" cy="75" r="1" fill="white" />
                 {/* Top Box */}
                 <rect x="20" y="2" width="60" height="25" />
                 <rect x="35" y="2" width="30" height="10" />
                 <path d="M 35 27 Q 50 35 65 27" />
                 {/* Bottom Box */}
                 <rect x="20" y="123" width="60" height="25" />
                 <rect x="35" y="138" width="30" height="10" />
                 <path d="M 35 123 Q 50 115 65 123" />
              </svg>

              {currentTactic.slots.map((slot, idx) => {
                const playerId = myLineup.startingXI[idx];
                const player = getPlayerById(playerId);
                const isSelected = selectedSlot?.loc === 'START' && selectedSlot.index === idx;
                const isOutOfPosition = player && player.position !== slot.role;
                
                return (
                  <div 
                     key={idx}
                     onClick={() => handlePlayerClick(playerId, 'START', idx)}
                     className="absolute flex flex-col items-center justify-center cursor-pointer transition-all duration-700 hover:scale-125 z-20"
                     style={{ 
                        left: `${slot.x * 100}%`, 
                        top: `${slot.y * 100}%`, 
                        transform: 'translate(-50%, -50%) rotateX(-15deg)',
                        filter: isSelected ? 'drop-shadow(0 0 20px rgba(255,255,255,0.4))' : 'none'
                     }}
                  >
                    {/* Role Tag */}
                    <div className={`absolute -top-[20px] whitespace-nowrap px-[10px] py-[2px] rounded-none shadow-2xl text-[9px] font-black border transition-all duration-500
                       ${!player ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : `bg-black/80 border-white/20 ${
                         slot.role === PlayerPosition.GK ? 'text-yellow-400' :
                         slot.role === PlayerPosition.DEF ? 'text-blue-400' :
                         slot.role === PlayerPosition.MID ? 'text-emerald-400' :
                         'text-red-400'
                       }`}`}>
                       {!player ? 'WSTAW' : slot.role}
                    </div>
                    
                    {/* Position Warning Glow */}
                    {isOutOfPosition && (
                      <div className="absolute inset-0 w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/30 blur-md animate-pulse -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
                    )}

                    {/* Tactical Node */}
                    <div
                       className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-[3px] transition-all duration-500 overflow-hidden
                         ${isSelected ? 'scale-110' : ''}
                         ${!player ? 'border-dashed border-rose-500/40 bg-rose-950/20' : ''}
                         ${isOutOfPosition && !isSelected ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : ''}
                       `}
                       style={isSelected ? { background: '#ffffff', borderColor: '#ffffff' } : player ? { borderColor: myClub.colorsHex[1] || myClub.colorsHex[0] } : {}}
                    >
                       {/* Kit layers: shirt (top 3/4) + shorts (bottom 1/4) */}
                       {player && !isSelected && (
                         <>
                           <div className="absolute inset-0" style={{ backgroundColor: myClub.colorsHex[0], bottom: '25%' }} />
                           <div className="absolute left-0 right-0 bottom-0 h-[25%]" style={{ backgroundColor: myClub.colorsHex[1] || myClub.colorsHex[0] }} />
                         </>
                       )}

                       <span
                         className={`text-xl font-black italic relative z-10 ${isSelected ? 'text-slate-900' : (player ? 'text-white' : 'text-rose-500')}`}
                         style={player && !isSelected ? { textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)' } : {}}
                       >
                         {player ? player.overallRating : '!'}
                       </span>

                       {/* Mini Energy Bar inside Node */}
                       {player && (
                         <div className="absolute bottom-0 left-0 w-full h-1 bg-black/40 z-10">
                            <div className={`h-full ${PlayerPresentationService.getConditionColorClass(player.condition)}`} style={{ width: `${player.condition}%` }} />
                         </div>
                       )}
                    </div>

                    {/* Name Label */}
                    <div className="-mt-[7px]">
                       <span className={`text-[10px] font-black uppercase italic tracking-widest whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${!player ? 'text-rose-400' : (isOutOfPosition ? 'text-amber-200' : 'text-white')}`}>
                          {player ? formatPitchPlayerName(player) : 'ZAWODNIKA'}
                       </span>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

{/* RIGHT: SQUAD MANAGEMENT (GLASS LISTS) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto custom-scrollbar">

          {/* TABS */}
          <div className="shrink-0 flex gap-2 px-1">
            <button
              onClick={() => setActiveTab('SQUAD')}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'SQUAD' ? 'bg-blue-500/20 border-t-blue-400/50 border-x-blue-500/25 border-b-black/60 text-blue-300' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >SKŁAD</button>
            <button
              onClick={() => setActiveTab('CONTRACT')}
              className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'CONTRACT' ? 'bg-yellow-500/20 border-t-yellow-400/50 border-x-yellow-500/25 border-b-black/60 text-yellow-300' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >STATUS KONTRAKTU</button>
            <button
              onClick={() => setActiveTab('MORALE')}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'MORALE' ? `${getMoraleInfo(myClub.morale ?? 50).bg} border-t-white/30 border-x-white/15 border-b-black/60 ${getMoraleInfo(myClub.morale ?? 50).color}` : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >MORALE</button>
            <button
              onClick={() => setActiveTab('SCHEDULE')}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'SCHEDULE' ? 'bg-amber-500/20 border-t-amber-400/50 border-x-amber-500/25 border-b-black/60 text-amber-300' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >TERMINARZ</button>
            <button
              onClick={() => setActiveTab('TABLE')}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'TABLE' ? 'bg-white/15 border-t-white/40 border-x-white/20 border-b-black/60 text-white' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >TABELA</button>
            <button
              onClick={() => setActiveTab('LOANS')}
              className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase italic tracking-widest transition-all active:translate-y-[2px] border-t border-x border-b ${activeTab === 'LOANS' ? 'bg-cyan-500/20 border-t-cyan-400/50 border-x-cyan-500/25 border-b-black/60 text-cyan-300' : 'bg-white/5 border-t-white/20 border-x-white/10 border-b-black/60 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >WYPOŻYCZENIA</button>
          </div>

          {activeTab === 'MORALE' && (() => {
            const morale = myClub.morale ?? 50;
            const info = getMoraleInfo(morale);
            const form = myClub.stats.form || [];
            const moraleRows = [...myPlayers]
              .map(player => {
                const moralePlayer = PlayerMoraleService.ensurePlayerState(player);
                const moraleInfo = PlayerMoraleService.getInfo(moralePlayer.morale);
                const canTalkPlayer = PlayerMoraleService.canTalk(moralePlayer, currentDate);
                const nextTalkDate = PlayerMoraleService.getNextTalkDate(moralePlayer);
                const promisedMinutesUntil = moralePlayer.promisedMinutesUntil ? new Date(moralePlayer.promisedMinutesUntil) : null;
                const minutesDemandUntil = moralePlayer.minutesDemandUntil ? new Date(moralePlayer.minutesDemandUntil) : null;
                const roleDemandUntil = moralePlayer.roleDemandUntil ? new Date(moralePlayer.roleDemandUntil) : null;
                const transferListDemandUntil = moralePlayer.transferListDemandUntil ? new Date(moralePlayer.transferListDemandUntil) : null;
                return {
                  player: moralePlayer,
                  moraleInfo,
                  canTalkPlayer,
                  nextTalkDate,
                  promisedMinutesUntil,
                  minutesDemandUntil,
                  roleDemandUntil,
                  transferListDemandUntil,
                  effectiveOverall: PlayerMoraleService.getEffectiveOverall(moralePlayer),
                  personalityLabel: PlayerMoraleService.getPersonalityLabel(moralePlayer.moralePersonality),
                };
              })
              .sort((a, b) => (a.player.morale ?? 50) - (b.player.morale ?? 50) || b.effectiveOverall - a.effectiveOverall);
            const lowMoraleCount = moraleRows.filter(row => (row.player.morale ?? 50) < 40).length;
            const talksReadyCount = moraleRows.filter(row => row.canTalkPlayer).length;
            const activePromisesCount = moraleRows.filter(row => !!row.promisedMinutesUntil || !!row.minutesDemandUntil || !!row.roleDemandUntil || !!row.transferListDemandUntil).length;
            return (
              <div className="shrink-0 flex flex-col gap-4">

                {/* MAIN MORALE CARD */}
                <div className={`rounded-[40px] border ${info.border} ${info.bg} backdrop-blur-3xl p-10 flex flex-col gap-6`}>
                  <div className="flex flex-col gap-1">
                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">MORALE DRUŻYNY</div>
                    <div className={`text-4xl font-black italic uppercase tracking-tight ${info.color}`}>{info.label}</div>
                  </div>

                  {/* BAR */}
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full ${info.barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${morale}%` }}
                    />
                  </div>

                  {/* LEVELS LEGEND */}
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                    <span className="text-red-500">Bardzo niskie</span>
                    <span className="text-orange-400">Niskie</span>
                    <span className="text-white">Neutralne</span>
                    <span className="text-green-400">Wysokie</span>
                    <span className="text-yellow-400">Bardzo wysokie</span>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-4">{info.description}</p>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-slate-950/35 backdrop-blur-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Indywidualne morale</div>
                      <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-300 mt-1">
                        Niskie morale: <span className={lowMoraleCount > 0 ? 'text-orange-400' : 'text-emerald-400'}>{lowMoraleCount}</span> / rozmowy dostępne: <span className="text-violet-300">{talksReadyCount}</span> / obietnice minut: <span className="text-yellow-300">{activePromisesCount}</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Kliknij zawodnika, aby otworzyć kartę i rozmowę</span>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl">
                        <tr className="border-b border-white/10">
                          <th className="px-5 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Zawodnik</th>
                          <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Pozycja</th>
                          <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">OVR</th>
                          <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Got.</th>
                          <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Morale</th>
                          <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Charakter</th>
                          <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Rozmowa</th>
                          <th className="px-5 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Obietnica</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {moraleRows.map(row => {
                          const moraleValue = row.player.morale ?? 50;
                          const moraleBarWidth = `${moraleValue}%`;
                          const nextTalkText = row.nextTalkDate ? row.nextTalkDate.toLocaleDateString('pl-PL') : '-';
                          const promiseText = row.roleDemandUntil && row.player.requestedSquadRole
                            ? `Status: ${row.player.requestedSquadRole === 'KEY_PLAYER' ? 'kluczowy' : 'starter'} do ${row.roleDemandUntil.toLocaleDateString('pl-PL')}`
                            : row.minutesDemandUntil
                              ? `Minuty do ${row.minutesDemandUntil.toLocaleDateString('pl-PL')}`
                              : row.transferListDemandUntil
                                ? `Transfer do ${row.transferListDemandUntil.toLocaleDateString('pl-PL')}`
                              : row.promisedMinutesUntil
                                ? `Obietnica do ${row.promisedMinutesUntil.toLocaleDateString('pl-PL')}`
                                : 'Brak';
                          return (
                            <tr
                              key={row.player.id}
                              onClick={() => viewPlayerDetails(row.player.id)}
                              className="group cursor-pointer bg-white/[0.015] hover:bg-white/[0.05] transition-colors"
                            >
                              <td className="px-5 py-3">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black italic uppercase tracking-tighter text-white group-hover:text-blue-300">{row.player.lastName}</span>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{row.player.firstName}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={`inline-flex min-w-[34px] justify-center rounded-md border px-2 py-1 text-[9px] font-black italic uppercase tracking-tighter ${getPositionBadgeClass(row.player.position)}`}>{row.player.position}</span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className="text-[12px] font-black italic tracking-tighter text-slate-300">{row.player.overallRating}</span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={`text-[12px] font-black italic tracking-tighter ${row.effectiveOverall > row.player.overallRating ? 'text-emerald-400' : row.effectiveOverall < row.player.overallRating ? 'text-red-400' : 'text-slate-300'}`}>{row.effectiveOverall}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className={`text-[9px] font-black italic uppercase tracking-tighter ${row.moraleInfo.colorClass}`}>{row.moraleInfo.label}</span>
                                    <span className="text-[9px] font-black italic tracking-tighter text-slate-400">{moraleValue}</span>
                                  </div>
                                  <div className="h-1.5 w-32 rounded-full bg-black/40 overflow-hidden border border-white/5">
                                    <div className={`h-full ${row.moraleInfo.barClass}`} style={{ width: moraleBarWidth }} />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[9px] font-black italic uppercase tracking-tighter text-slate-300">{row.personalityLabel}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-md border px-2 py-1 text-[8px] font-black italic uppercase tracking-tighter ${row.canTalkPlayer ? 'border-violet-400/40 bg-violet-500/15 text-violet-200' : 'border-slate-500/20 bg-slate-500/10 text-slate-500'}`}>
                                  {row.canTalkPlayer ? 'Dostępna' : `Od ${nextTalkText}`}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-[9px] font-black italic uppercase tracking-tighter ${row.promisedMinutesUntil || row.minutesDemandUntil || row.roleDemandUntil || row.transferListDemandUntil ? 'text-yellow-300' : 'text-slate-600'}`}>{promiseText}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FORMA CONTEXT */}
                <div className="rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 flex flex-col gap-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Ostatnie wyniki</div>
                  <div className="flex gap-2">
                    {form.length === 0 && <span className="text-[10px] text-slate-600 italic">Brak rozegranych meczów</span>}
                    {form.map((r, i) => (
                      <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black border
                        ${r === 'W' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' :
                          r === 'R' ? 'bg-slate-500/20 border-slate-500/30 text-slate-400' :
                          'bg-red-500/20 border-red-500/30 text-red-400'}`}
                      >{r === 'W' ? 'W' : r === 'R' ? 'R' : 'P'}</div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Rozmowy motywacyjne</div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${canMotivate ? 'text-violet-300' : 'text-slate-500'}`}>
                      {canMotivate ? 'Dostępna rozmowa' : 'Rozmowa w cooldownie'}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                    Status: <span className="text-slate-300">Szatnia obserwuje reakcje sztabu</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {motivationPanelText}
                  </p>
                </div>


              </div>
            );
          })()}

          {activeTab === 'TABLE' && (() => {
            const sorted = [...leagueClubs].sort((a, b) =>
              b.stats.points - a.stats.points ||
              b.stats.goalDifference - a.stats.goalDifference ||
              b.stats.goalsFor - a.stats.goalsFor
            );
            const leagueName = getCompLabel(myClub.leagueId);
            const total = sorted.length;
            const isEkstraklasa = myClub.leagueId === 'L_PL_1';
            const isL3 = myClub.leagueId === 'L_PL_3';
            return (
              <div className="shrink-0 bg-slate-900/40 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Tabela</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-md border text-[9px] font-black italic uppercase tracking-tighter text-white bg-red-600 border-red-600">{leagueName}</span>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-4 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-8">#</th>
                      <th className="px-4 py-2 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Klub</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-10">M</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-10">W</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-10">R</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-10">P</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-16">G</th>
                      <th className="px-3 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-12">+/-</th>
                      <th className="px-4 py-2 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-14">PKT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((club, idx) => {
                      const pos = idx + 1;
                      const isUser = club.id === userTeamId;
                      const logo = getClubLogo(club.id);
                      const gd = club.stats.goalDifference;

                      const isCL              = isEkstraklasa && pos === 1;
                      const isConf            = isEkstraklasa && pos >= 2 && pos <= 3;
                      const isPromotion       = !isEkstraklasa && pos <= 2;
                      const isPlayoff         = !isEkstraklasa && pos >= 3 && pos <= 6;
                      const isRelegationPO    = isL3 && pos >= 13 && pos <= 14;
                      const isRelegation      = isL3 ? pos > total - 4 : pos > total - 3;

                      const blue  = 'inset 0 1px 0 rgba(96,165,250,0.3)';
                      const red   = 'inset 0 1px 0 rgba(248,113,113,0.3)';
                      const orange = 'inset 0 1px 0 rgba(251,146,60,0.35)';
                      const separatorStyle: React.CSSProperties = isEkstraklasa
                        ? (pos === 2 || pos === 4 ? { boxShadow: blue } : pos === total - 2 ? { boxShadow: red } : {})
                        : isL3
                          ? (pos === 3 || pos === 7 ? { boxShadow: blue } : pos === 13 ? { boxShadow: orange } : pos === 15 ? { boxShadow: red } : {})
                          : (pos === 3 || pos === 7 ? { boxShadow: blue } : pos === total - 2 ? { boxShadow: red } : {});

                      const rowBg = isUser
                        ? 'bg-emerald-500/15 border-l-2 border-l-emerald-400'
                        : isCL
                          ? 'bg-cyan-500/[0.07] border-l-2 border-l-cyan-400/60'
                          : isConf
                            ? 'bg-green-500/[0.07] border-l-2 border-l-green-400/60'
                            : isPromotion
                              ? 'bg-yellow-500/[0.07] border-l-2 border-l-yellow-400/60'
                              : isPlayoff
                                ? 'bg-cyan-500/[0.07] border-l-2 border-l-cyan-400/60'
                                : isRelegationPO
                                  ? 'bg-orange-500/[0.07] border-l-2 border-l-orange-400/60'
                                  : isRelegation
                                    ? 'bg-red-500/[0.07] border-l-2 border-l-red-400/60'
                                    : 'hover:bg-white/[0.02]';

                      const posColor = 'text-white';
                      return (
                        <tr key={club.id} className={`border-b border-white/[0.04] transition-colors ${rowBg}`} style={separatorStyle}>
                          <td className="px-4 py-2.5 text-center align-middle">
                            <span className={`text-[11px] font-black italic tracking-tighter ${posColor}`}>{pos}.</span>
                          </td>
                          <td className="px-4 py-2.5 align-middle">
                            <div className="flex items-center gap-3">
                              {logo ? (
                                <img src={logo} alt={club.shortName} className="w-5 h-5 object-contain shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 shrink-0 flex flex-col">
                                  <div className="flex-1" style={{ backgroundColor: club.colorsHex[0] }} />
                                  <div className="flex-1" style={{ backgroundColor: club.colorsHex[1] || club.colorsHex[0] }} />
                                </div>
                              )}
                              <span className={`text-[11px] font-black italic uppercase tracking-tighter ${isUser ? 'text-yellow-400' : 'text-white'}`}>{club.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-slate-300">{club.stats.played}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-emerald-400">{club.stats.wins}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-slate-400">{club.stats.draws}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-red-400">{club.stats.losses}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className="text-[11px] font-black italic tracking-tighter text-slate-300">{club.stats.goalsFor}:{club.stats.goalsAgainst}</span></td>
                          <td className="px-3 py-2.5 text-center align-middle"><span className={`text-[11px] font-black italic tracking-tighter ${gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-slate-500'}`}>{gd > 0 ? `+${gd}` : gd}</span></td>
                          <td className="px-4 py-2.5 text-center align-middle"><span className={`text-[13px] font-black italic tracking-tighter ${isUser ? 'text-emerald-300' : 'text-white'}`}>{club.stats.points}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-6 py-3 border-t border-white/5 flex items-center gap-6">
                  {isEkstraklasa ? (
                    <>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" />Liga Mistrzów</span>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-green-400"><span className="w-2 h-2 rounded-full bg-green-400" />Puchar Konferencji</span>
                    </>
                  ) : isL3 ? (
                    <>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-400" />Awans bezpośredni</span>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" />Baraże awansowe</span>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-400" />Baraże o utrzymanie</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-400" />Awans bezpośredni</span>
                      <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" />Baraże</span>
                    </>
                  )}
                  <span className="flex items-center gap-2 text-[8px] font-black italic uppercase tracking-tighter text-red-400"><span className="w-2 h-2 rounded-full bg-red-400" />Spadek</span>
                </div>
              </div>
            );
          })()}

          {activeTab === 'LOANS' && (() => {
            const loanedOutPlayers = allLeaguePlayers
              .filter(player => player.loan?.parentClubId === userTeamId)
              .sort((a, b) => {
                const aDays = getLoanDaysLeft(a.loan?.endDate) ?? 9999;
                const bDays = getLoanDaysLeft(b.loan?.endDate) ?? 9999;
                return aDays - bDays || b.overallRating - a.overallRating || a.lastName.localeCompare(b.lastName);
              });

            return (
              <div className="shrink-0 bg-slate-900/40 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-[9px] font-black italic uppercase tracking-tighter text-slate-500">Wypożyczeni zawodnicy</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-md border text-[9px] font-black italic uppercase tracking-tighter text-cyan-200 bg-cyan-500/10 border-cyan-500/30">
                    {loanedOutPlayers.length}
                  </span>
                </div>

                {loanedOutPlayers.length === 0 ? (
                  <div className="min-h-[260px] flex items-center justify-center">
                    <span className="text-[13px] font-black italic uppercase tracking-tighter text-slate-500">
                      BRAK ZAWODNIKÓW NA WYPOŻYCZENIU.
                    </span>
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="px-5 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Zawodnik</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Poz.</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">OVR</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">M</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Min</th>
                        <th className="px-3 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Śr.</th>
                        <th className="px-5 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Klub</th>
                        <th className="px-4 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Od</th>
                        <th className="px-4 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Do</th>
                        <th className="px-4 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Dni</th>
                        <th className="px-4 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Pensja</th>
                        <th className="px-5 py-3 text-right text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Opłata</th>
                        <th className="px-5 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Status</th>
                        <th className="px-5 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Akcja</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanedOutPlayers.map(player => {
                        const destinationClub = clubs.find(club => club.id === player.loan?.destinationClubId);
                        const destinationLogo = destinationClub ? getClubLogo(destinationClub.id) : null;
                        const daysLeft = getLoanDaysLeft(player.loan?.endDate);
                        const isReturningSoon = daysLeft !== null && daysLeft <= 30;
                        const loanFee = player.loan?.loanFee ?? 0;
                        const loanMatches = getLoanMatches(player);
                        const loanMinutes = getLoanMinutes(player);
                        const loanAverageRating = getLoanAverageRating(player);
                        return (
                          <tr
                            key={player.id}
                            onClick={() => viewPlayerDetails(player.id)}
                            className="group cursor-pointer border-b border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.05] transition-colors"
                          >
                            <td className="px-5 py-3">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black italic uppercase tracking-tighter text-white group-hover:text-cyan-300">{player.lastName}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{player.firstName}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`inline-flex min-w-[34px] justify-center rounded-md border px-2 py-1 text-[9px] font-black italic uppercase tracking-tighter ${getPositionBadgeClass(player.position)}`}>{player.position}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`inline-flex min-w-[34px] justify-center rounded-md border px-2 py-1 text-[10px] font-black italic uppercase tracking-tighter ${getOverallBadgeClass(player.overallRating)}`}>{player.overallRating}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{loanMatches}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`text-[10px] font-black italic tracking-tighter ${loanMinutes < 90 ? 'text-orange-300' : 'text-cyan-300'}`}>{loanMinutes}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{loanAverageRating}</span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                {destinationLogo ? (
                                  <img src={destinationLogo} alt={destinationClub?.name ?? player.loan?.destinationClubName ?? ''} className="w-6 h-6 object-contain shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 shrink-0" />
                                )}
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-200">{player.loan?.destinationClubName ?? destinationClub?.name ?? '-'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{formatLoanDate(player.loan?.startDate)}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{formatLoanDate(player.loan?.endDate)}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[11px] font-black italic tracking-tighter ${isReturningSoon ? 'text-amber-300' : 'text-cyan-300'}`}>{daysLeft ?? '-'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[10px] font-black italic tracking-tighter text-slate-300">{player.loan?.wageCoveragePercent ?? 0}%</span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <span className="text-[10px] font-black italic tracking-tighter text-emerald-300">{loanFee.toLocaleString('pl-PL')} PLN</span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex rounded-md border px-2 py-1 text-[8px] font-black italic uppercase tracking-tighter ${
                                player.loan?.forcedByClub
                                  ? 'border-orange-400/40 bg-orange-500/15 text-orange-200'
                                  : isReturningSoon
                                    ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                                    : 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
                              }`}>
                                {player.loan?.forcedByClub ? 'Wymuszone' : isReturningSoon ? 'Wraca wkrótce' : 'Aktywne'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setLoanDetailsPlayerId(player.id);
                                  }}
                                  className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-[8px] font-black italic uppercase tracking-tighter text-cyan-200 transition-colors hover:bg-cyan-500/20 hover:text-cyan-100"
                                >
                                  Szczegóły
                                </button>
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (window.confirm(`Skrócić wypożyczenie zawodnika ${player.firstName} ${player.lastName}? Zawodnik wróci natychmiast do kadry.`)) {
                                      terminateLoanEarly(player.id);
                                    }
                                  }}
                                  className="rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-[8px] font-black italic uppercase tracking-tighter text-amber-200 transition-colors hover:bg-amber-500/20 hover:text-amber-100"
                                >
                                  Skróć
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })()}

          {activeTab === 'SCHEDULE' && (() => {
            const isLeagueBadge = (label: string) =>
              !['PUCHAR POLSKI','SUPERPUCHAR','UEFA SUPER','LM','LE','KONF','SPARINGI','BARAŻE','MŚ'].includes(label);
            const compCupColors: Record<string, string> = {
              'PUCHAR POLSKI': 'text-red-600 bg-white border-white',
              'SUPERPUCHAR': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
              'UEFA SUPER': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
              'LM': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
              'LE': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
              'KONF': 'text-green-400 bg-green-500/10 border-green-500/30',
              'SPARINGI': 'text-slate-400 bg-slate-500/10 border-slate-500/30',
              'BARAŻE': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
              'MŚ': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            };
            const pastMatches = scheduleSeasonFilter !== null
              ? allMatchHistory
                  .filter(m => m.season === scheduleSeasonFilter && (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              : [];
            return (
              <div className="shrink-0 bg-slate-900/40 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden">
                {pastScheduleSeasons.length > 0 && (
                  <div className="flex gap-2 px-6 py-3 border-b border-white/10">
                    <button
                      onClick={() => setScheduleSeasonFilter(null)}
                      className={`text-[8px] font-black italic uppercase tracking-tighter px-3 py-1 rounded-md border transition-colors ${scheduleSeasonFilter === null ? 'bg-red-600 border-red-600 text-white' : 'border-white/20 text-slate-400 hover:border-white/40'}`}
                    >BIEŻĄCY</button>
                    {pastScheduleSeasons.map(({ season, label }) => (
                      <button
                        key={season}
                        onClick={() => setScheduleSeasonFilter(season)}
                        className={`text-[8px] font-black italic uppercase tracking-tighter px-3 py-1 rounded-md border transition-colors ${scheduleSeasonFilter === season ? 'bg-red-600 border-red-600 text-white' : 'border-white/20 text-slate-400 hover:border-white/40'}`}
                      >{label}</button>
                    ))}
                  </div>
                )}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-6 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-28">Data</th>
                      <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-28">Miejsce</th>
                      <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-36">Rozgrywki</th>
                      <th className="px-6 py-3 text-center text-[8px] font-black italic uppercase tracking-tighter text-slate-500 w-20">Wynik</th>
                      <th className="px-4 py-3 text-left text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Przeciwnik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleSeasonFilter === null ? (
                      <>
                        {mySchedule.length === 0 && (
                          <tr><td colSpan={5} className="py-12 text-center text-[10px] font-black italic uppercase tracking-tighter opacity-20">Brak meczów w terminarzu</td></tr>
                        )}
                        {mySchedule.map((f, i) => {
                          const isHome = f.homeTeamId === userTeamId;
                          const opponentId = isHome ? f.awayTeamId : f.homeTeamId;
                          const opponent = clubs.find(c => c.id === opponentId);
                          const venue = getVenueInfo(f);
                          const compLabel = getCompLabel(f.leagueId as string);
                          const isLeague = isLeagueBadge(compLabel);
                          const compCls = isLeague
                            ? 'text-white bg-red-600 border-red-600'
                            : (compCupColors[compLabel] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30');
                          const isFinished = f.status === MatchStatus.FINISHED;
                          const isPast = new Date(f.date) < currentDate;
                          const histEntry = !isFinished && isPast
                            ? MatchHistoryService.getAll().find(e => e.matchId === f.id)
                            : undefined;
                          const isDisplayFinished = isFinished || !!histEntry;
                          const myScore = isHome
                            ? (f.homeScore ?? histEntry?.homeScore ?? null)
                            : (f.awayScore ?? histEntry?.awayScore ?? null);
                          const oppScore = isHome
                            ? (f.awayScore ?? histEntry?.awayScore ?? null)
                            : (f.homeScore ?? histEntry?.homeScore ?? null);
                          const resultColor = isDisplayFinished
                            ? myScore! > oppScore! ? 'text-emerald-400' : myScore! < oppScore! ? 'text-red-400' : 'text-slate-300'
                            : 'text-slate-600';
                          const logo = opponent ? getClubLogo(opponent.id) : null;
                          const d = new Date(f.date);
                          const dateStr = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
                          const isNext = !isPast && (i === 0 || new Date(mySchedule[i-1].date) < currentDate);
                          return (
                            <tr
                              key={f.id}
                              className={`border-b border-white/[0.04] transition-colors ${isNext ? 'bg-amber-500/[0.06] border-l-2 border-l-amber-500/50' : isPast ? 'opacity-50' : 'hover:bg-white/[0.02]'}`}
                            >
                              <td className="px-6 py-2.5 align-middle whitespace-nowrap">
                                <span className="text-[11px] font-black italic uppercase tracking-tighter font-mono text-slate-300">{dateStr}</span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <span className={`text-[10px] font-black italic uppercase tracking-tighter ${venue.color}`}>{venue.label}</span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[8px] font-black italic uppercase tracking-tighter ${compCls}`}>
                                  {compLabel}
                                </span>
                              </td>
                              <td className="px-6 py-2.5 text-center align-middle">
                                <span className={`text-[13px] font-black italic tracking-tighter font-mono ${resultColor}`}>
                                  {isDisplayFinished ? `${myScore}:${oppScore}` : '-:-'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <div className="flex items-center gap-3">
                                  {logo ? (
                                    <img src={logo} alt={opponent?.name ?? ''} className="w-6 h-6 object-contain shrink-0" />
                                  ) : opponent ? (
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 flex flex-col">
                                      <div className="flex-1" style={{ backgroundColor: opponent.colorsHex[0] }} />
                                      <div className="flex-1" style={{ backgroundColor: opponent.colorsHex[1] || opponent.colorsHex[0] }} />
                                    </div>
                                  ) : null}
                                  <span className="text-[11px] font-black italic uppercase tracking-tighter text-white">{opponent?.name ?? opponentId}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        {pastMatches.length === 0 && (
                          <tr><td colSpan={5} className="py-12 text-center text-[10px] font-black italic uppercase tracking-tighter opacity-20">Brak meczów w historii</td></tr>
                        )}
                        {pastMatches.map((m) => {
                          const isHome = m.homeTeamId === userTeamId;
                          const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
                          const opponent = clubs.find(c => c.id === opponentId);
                          const compLabel = getCompLabel(m.competition);
                          const isLeague = isLeagueBadge(compLabel);
                          const compCls = isLeague
                            ? 'text-white bg-red-600 border-red-600'
                            : (compCupColors[compLabel] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/30');
                          const myScore = isHome ? m.homeScore : m.awayScore;
                          const oppScore = isHome ? m.awayScore : m.homeScore;
                          const resultColor = myScore > oppScore ? 'text-emerald-400' : myScore < oppScore ? 'text-red-400' : 'text-slate-300';
                          const isNeutral = neutralTypes.includes(m.competition);
                          const venueLabel = isNeutral ? 'NEUTRALNY' : (isHome ? 'DOM' : 'WYJAZD');
                          const venueColor = isNeutral ? 'text-amber-400' : (isHome ? 'text-emerald-400' : 'text-sky-400');
                          const logo = opponent ? getClubLogo(opponent.id) : null;
                          const d = new Date(m.date);
                          const dateStr = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
                          return (
                            <tr key={m.matchId} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-2.5 align-middle whitespace-nowrap">
                                <span className="text-[11px] font-black italic uppercase tracking-tighter font-mono text-slate-300">{dateStr}</span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <span className={`text-[10px] font-black italic uppercase tracking-tighter ${venueColor}`}>{venueLabel}</span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[8px] font-black italic uppercase tracking-tighter ${compCls}`}>
                                  {compLabel}
                                </span>
                              </td>
                              <td className="px-6 py-2.5 text-center align-middle">
                                <span className={`text-[13px] font-black italic tracking-tighter font-mono ${resultColor}`}>
                                  {myScore}:{oppScore}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 align-middle">
                                <div className="flex items-center gap-3">
                                  {logo ? (
                                    <img src={logo} alt={opponent?.name ?? ''} className="w-6 h-6 object-contain shrink-0" />
                                  ) : opponent ? (
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 flex flex-col">
                                      <div className="flex-1" style={{ backgroundColor: opponent.colorsHex[0] }} />
                                      <div className="flex-1" style={{ backgroundColor: opponent.colorsHex[1] || opponent.colorsHex[0] }} />
                                    </div>
                                  ) : null}
                                  <span className="text-[11px] font-black italic uppercase tracking-tighter text-white">{opponent?.name ?? opponentId}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {(activeTab === 'SQUAD' || activeTab === 'CONTRACT') && <>

           {/* STARTING XI LIST */}
           <div className="shrink-0 bg-slate-900/40 rounded-[50px] border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden relative">
              <div className="px-8 py-3 border-b border-white/10 flex items-center bg-white/5 relative z-10">
                 <div className="w-1.5 h-5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>
              <div className="overflow-hidden relative z-10">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="pl-6 w-12 py-2" />
                        <th className="w-6 py-2" />
                        <th className="w-14 py-2" />
                        <th className="w-52 py-2">
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Zawodnik</span>
                        </th>
                        {activeTab === 'CONTRACT' ? (
                          <>
                            <th className="px-3 w-16 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Wiek</span>
                            </th>
                            <th className="px-4 w-44 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Wynagrodzenie</span>
                            </th>
                            <th className="px-4 w-32 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Kontrakt do</span>
                            </th>
                            <th className="px-4 w-32 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Pozostało</span>
                            </th>
                            <th className="px-4 w-36 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Rola w zespole</span>
                            </th>
                            <th className="px-4 w-36 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">Cena rynkowa</span>
                            </th>
                            <th className="pr-6 w-20 py-2 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-500">OVR</span>
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="px-2 w-36 py-2">
                              <div className="flex gap-[6px]">
                                {([['M','text-slate-400'],['G','text-emerald-600'],['A','text-blue-600'],['ŻK','text-yellow-600'],['CK','text-red-700']] as [string,string][]).map(([lbl,cls]) => (
                                  <div key={lbl} className={`w-[22px] text-center text-[8px] font-black uppercase tracking-tighter ${cls}`}>{lbl}</div>
                                ))}
                              </div>
                            </th>
                            <th className="px-3 py-2">
                              <div className="flex gap-[6px]">
                                {(['PAC','PAS','DEF','ATK','LDR','AGR'] as const).map(lbl => (
                                  <div key={lbl} className="w-[22px] text-center text-[8px] font-black uppercase tracking-tighter text-slate-400">{lbl}</div>
                                ))}
                              </div>
                            </th>
                            <th className="w-20 text-center py-2">
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Morale</span>
                            </th>
                            <th className="w-24 text-center py-2">
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Zdrowie</span>
                            </th>
                            <th className="w-16 text-center py-2">
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Ocena</span>
                            </th>
                            <th className="pr-6 w-32 py-2">
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Kondycja</span>
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                       {myLineup.startingXI.map((pid, idx) => renderPlayerRow(pid, currentTactic.slots[idx].role, 'START', idx))}
                    </tbody>
                 </table>
              </div>
           </div>
           
           {/* BENCH */}
           <div className="shrink-0 bg-slate-800/60 rounded-[45px] border border-white/[0.07] backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden relative">
              <div className="px-6 py-4 border-b border-white/10 bg-black/20 flex justify-between items-center relative z-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Ławka</h3>
                 <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                    <span className="text-[10px] font-black font-mono text-blue-400">{benchPlayers.length} / 9</span>
                 </div>
              </div>
              <div className="overflow-hidden relative z-10">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="pl-6 w-12" />
                        <th className="w-6" />
                        <th className="w-14" />
                        <th className="w-52" />
                        {activeTab === 'CONTRACT' ? (
                          <>
                            <th className="px-3 w-16 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Wiek</span>
                            </th>
                            <th className="px-4 w-44 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Wynagrodzenie</span>
                            </th>
                            <th className="px-4 w-32 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Kontrakt do</span>
                            </th>
                            <th className="px-4 w-32 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Pozostało</span>
                            </th>
                            <th className="px-4 w-36 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Rola w zespole</span>
                            </th>
                            <th className="px-4 w-36 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Cena rynkowa</span>
                            </th>
                            <th className="pr-6 w-20 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">OVR</span>
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="px-2 w-36" />
                            <th className="px-3 py-1">
                              <div className="flex gap-[6px]">
                                {(['PAC','PAS','DEF','ATK','LDR','AGR'] as const).map(lbl => (
                                  <div key={lbl} className="w-[22px] text-center text-[8px] font-black uppercase tracking-tighter text-slate-600">{lbl}</div>
                                ))}
                              </div>
                            </th>
                            <th className="w-20" />
                            <th className="w-24" />
                            <th className="w-16" />
                            <th className="pr-6 w-32" />
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {benchPlayers.map((pid, index) => renderPlayerRow(pid, 'SUB', 'BENCH', index))}
                      {benchPlayers.length === 0 && (
                        <tr><td colSpan={11} className="py-10 text-center opacity-10 font-black uppercase italic text-xs tracking-widest">Pusta Ławka</td></tr>
                      )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* RESERVES */}
           <div className="shrink-0 bg-slate-900/40 rounded-[45px] border border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col overflow-hidden relative">
              <div className="px-6 py-4 border-b border-white/10 bg-black/20 flex justify-between items-center relative z-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Rezerwy</h3>
                 <span className="text-[10px] font-black font-mono text-slate-700 uppercase tracking-widest">KADRA: {reservePlayersSorted.length}</span>
              </div>
              <div className="overflow-hidden relative z-10">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="pl-6 w-12" />
                        <th className="w-6" />
                        <th className="w-14" />
                        <th className="w-52" />
                        {activeTab === 'CONTRACT' ? (
                          <>
                            <th className="px-3 w-16 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Wiek</span>
                            </th>
                            <th className="px-4 w-44 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Wynagrodzenie</span>
                            </th>
                            <th className="px-4 w-32 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Kontrakt do</span>
                            </th>
                            <th className="px-4 w-32 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Pozostało</span>
                            </th>
                            <th className="px-4 w-36 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Rola w zespole</span>
                            </th>
                            <th className="px-4 w-36 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">Cena rynkowa</span>
                            </th>
                            <th className="pr-6 w-20 py-1 text-center">
                              <span className="text-[8px] font-black italic uppercase tracking-tighter text-slate-600">OVR</span>
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="px-2 w-36" />
                            <th className="px-3 py-1">
                              <div className="flex gap-[6px]">
                                {(['PAC','PAS','DEF','ATK','LDR','AGR'] as const).map(lbl => (
                                  <div key={lbl} className="w-[22px] text-center text-[8px] font-black uppercase tracking-tighter text-slate-600">{lbl}</div>
                                ))}
                              </div>
                            </th>
                            <th className="w-20" />
                            <th className="w-24" />
                            <th className="w-16" />
                            <th className="pr-6 w-32" />
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {reservePlayersSorted.map((pid, index) => renderPlayerRow(pid, 'RES', 'RES', index))}
                      {reservePlayersSorted.length === 0 && (
                        <tr><td colSpan={11} className="py-10 text-center opacity-10 font-black uppercase italic text-xs tracking-widest">Brak zawodników</td></tr>
                      )}
                    </tbody>
                 </table>
              </div>
           </div>

          </>}

        </div>
</div>

      {/* FOOTER DIAGNOSTIC BAR */}
      <footer className="mt-6 h-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl flex items-center justify-between px-12 shrink-0 shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 opacity-[0.03] animate-ticker" style={{ backgroundImage: 'linear-gradient(90deg, transparent, white, transparent)', backgroundSize: '200% 100%' }} />
         <div className="flex gap-12 text-[7px] font-black text-slate-600 uppercase tracking-[0.6em] relative z-10">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> Taktyki gotowe</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Optymalizacja składu</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Gotowi do gry</span>
         </div>
         <div className="text-[8px] font-black text-blue-500 uppercase tracking-widest relative z-10 italic">PZPN</div>
      </footer>

      {contextMenu && (
        <div
          className="fixed z-[9999] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 min-w-[220px]"
          style={{ top: contextMenu.y + 320 > window.innerHeight ? Math.max(0, contextMenu.y - 320) : contextMenu.y, left: contextMenu.x + 240 > window.innerWidth ? Math.max(0, contextMenu.x - 240) : contextMenu.x }}
          onMouseLeave={() => { setContextMenu(null); setRoleSubmenuOpen(false); }}
        >
          <button onClick={() => handleContextAction('talk')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/10 transition-colors">
            Rozmowa z zawodnikiem
          </button>
          <div className="my-1 border-t border-white/10" />
          {contextMenu.loc === 'START' && (
            <button onClick={() => handleContextAction('captain')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
              Mianuj Kapitana
            </button>
          )}
          <button onClick={() => handleContextAction('penalty')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
            Wyznacz do karnych
          </button>
          <button onClick={() => handleContextAction('freekick')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
            Wyznacz do wolnych
          </button>
          <div className="my-1 border-t border-white/10" />
          <button onClick={handleOpenAssistantReport} disabled={!hasAssistant} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed text-blue-300 hover:bg-blue-500/10 transition-colors">
            Raport Asystenta
          </button>
          <div className="my-1 border-t border-white/10" />
          <div
            onMouseEnter={() => setRoleSubmenuOpen(true)}
            onMouseLeave={() => setRoleSubmenuOpen(false)}
          >
            <button className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors flex items-center justify-between">
              Rola w zespole
              <span className="text-[9px] text-slate-500">▶</span>
            </button>
            {roleSubmenuOpen && (
              <div className="bg-slate-800/50">
                <button onClick={() => handleContextAction('roleNone')} className="w-full pl-8 pr-4 py-2 text-left text-[10px] uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-colors">
                  Brak
                </button>
                <button onClick={() => handleContextAction('roleStarter')} className="w-full pl-8 pr-4 py-2 text-left text-[10px] uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-colors">
                  Podstawowa
                </button>
                <button onClick={() => handleContextAction('roleKey')} className="w-full pl-8 pr-4 py-2 text-left text-[10px] uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-colors">
                  Kluczowy
                </button>
              </div>
            )}
          </div>
          <div className="my-1 border-t border-white/10" />
          {(() => { const cp = myPlayers.find(p => p.id === contextMenu.playerId); return (
          <>
          <button onClick={() => handleContextAction('transferList')} disabled={!!cp?.isUntouchable || !!cp?.loan || !!cp?.transferPendingClubId} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            {cp?.isOnTransferList ? 'Usuń z listy' : 'Wystaw na listę'}
          </button>
          <button onClick={() => handleContextAction('loanAvailable')} disabled={!!cp?.isUntouchable || !!cp?.loan || !!cp?.transferPendingClubId} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            {cp?.isAvailableForLoan ? 'Zdejmij z wypożyczeń' : 'Dostępny do wypożyczenia'}
          </button>
          </>
          ); })()}
          <button onClick={() => handleContextAction('untouchable')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
            Nie na sprzedaż
          </button>
          <div className="my-1 border-t border-white/10" />
          <button onClick={() => handleContextAction('reserves')} className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-widest text-amber-400 hover:bg-amber-500/10 transition-colors">
            Przenieś do rezerw
          </button>
        </div>
      )}

      {reportPlayer && cachedReport && createPortal(<PortalScaleWrapper>{(() => {
        const report = cachedReport;
        const posColor = reportPlayer.position === 'GK' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
          : reportPlayer.position === 'DEF' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
          : reportPlayer.position === 'MID' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          : 'bg-rose-500/20 border-rose-500/40 text-rose-400';
        const effColor = report.positionEffectivenessScore >= 78 ? 'text-emerald-400' : report.positionEffectivenessScore >= 68 ? 'text-amber-400' : 'text-rose-400';
        const seasonStats = [
          { label: 'Mecze', value: String(reportPlayer.stats.matchesPlayed), color: 'text-white' },
          { label: 'Minuty', value: String(reportPlayer.stats.minutesPlayed), color: 'text-white' },
          { label: 'Bramki', value: String(reportPlayer.stats.goals), color: 'text-white' },
          { label: 'Asysty', value: String(reportPlayer.stats.assists), color: 'text-white' },
          { label: 'Żółte kartki', value: String(reportPlayer.stats.yellowCards), color: 'text-amber-400' },
          { label: 'Czerwone kartki', value: String(reportPlayer.stats.redCards), color: 'text-rose-400' },
          ...(reportPlayer.position === 'GK' ? [{ label: 'Czyste konta', value: String(reportPlayer.stats.cleanSheets), color: 'text-emerald-400' }] : []),
        ];

        return (
          <div
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
            onClick={() => { if (!reportDragging) setReportPlayer(null); }}
            onMouseMove={e => {
              if (!reportDragging) return;
              setReportModalPos({
                x: reportDragging.originX + (e.clientX - reportDragging.startX),
                y: reportDragging.originY + (e.clientY - reportDragging.startY),
              });
            }}
            onMouseUp={() => setReportDragging(null)}
            onMouseLeave={() => setReportDragging(null)}
          >
            <div
              className="fixed flex w-[1220px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] flex-col gap-5 overflow-y-auto rounded-[36px] border border-white/10 bg-slate-950 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
              style={{ left: reportModalPos.x, top: reportModalPos.y }}
              onClick={e => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between select-none border-b border-white/10 pb-5"
                style={{ cursor: reportDragging ? 'grabbing' : 'grab' }}
                onMouseDown={e => {
                  e.preventDefault();
                  setReportDragging({ startX: e.clientX, startY: e.clientY, originX: reportModalPos.x, originY: reportModalPos.y });
                }}
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-blue-500/30 bg-blue-600/20 text-3xl">🧠</div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${posColor}`}>{reportPlayer.position}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">OVR {reportPlayer.overallRating}</span>
                      <span className="text-slate-700">•</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{reportPlayer.age} lat</span>
                      <span className="text-slate-700">•</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${reportPlayer.attributes.talent >= 75 ? 'text-emerald-400' : reportPlayer.attributes.talent >= 60 ? 'text-amber-400' : 'text-slate-500'}`}>Talent {reportPlayer.attributes.talent}</span>
                    </div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">{reportPlayer.firstName} {reportPlayer.lastName}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/50">
                    Raport Indywidualny • {assistants[0] ? `${assistants[0].firstName} ${assistants[0].lastName}` : 'Asystent'}
                  </span>
                  <button onClick={() => setReportPlayer(null)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-black text-slate-400 transition-all hover:bg-white/10 hover:text-white">✕</button>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[286px_1fr_273px]">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Statystyki Sezonowe</span>
                    <div className="grid grid-cols-2 gap-2">
                      {seasonStats.map((stat, index) => (
                        <div key={`${stat.label}-${index}`} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-tight">{stat.label}</span>
                          <span className={`text-[13px] font-black tabular-nums ${stat.color}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 rounded-2xl border border-rose-500/20 bg-rose-950/30 p-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400">Słabe Strony</span>
                    {report.weakAttributes.length > 0 ? report.weakAttributes.map(attr => (
                      <div key={attr.attr} className="flex items-center justify-between">
                        <span className="text-[12px] font-black italic uppercase tracking-tighter text-rose-300">{attr.label}</span>
                        <span className="text-[13px] font-black tabular-nums text-rose-400">{attr.value}</span>
                      </div>
                    )) : (
                      <p className="text-[10px] font-black italic uppercase tracking-tighter text-rose-300/50">Brak wyraźnych słabości</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Mocne Strony</span>
                    {report.strongAttributes.length > 0 ? report.strongAttributes.map(attr => (
                      <div key={attr.attr} className="flex items-center justify-between">
                        <span className="text-[12px] font-black italic uppercase tracking-tighter text-emerald-300">{attr.label}</span>
                        <span className="text-[13px] font-black tabular-nums text-emerald-400">{attr.value}</span>
                      </div>
                    )) : (
                      <p className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-300/50">Brak wyraźnych atutów</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Ocena Ogólna</span>
                    <p className="text-[13px] font-black italic uppercase tracking-tighter leading-relaxed text-white">{report.overallAssessment}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Skuteczność na Pozycji</span>
                    <p className="text-[13px] font-black italic uppercase tracking-tighter leading-relaxed text-white">{report.positionEffectivenessText}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Ocena Asystenta</span>
                    <p className="text-[13px] font-black italic uppercase tracking-tighter leading-relaxed text-white">{report.trainingRecommendationText}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-2.5">
                      <span className="text-center text-[9px] font-black uppercase tracking-widest leading-tight text-slate-500">Wartość</span>
                      <span className={`text-[13px] font-black italic uppercase tracking-tighter ${report.valueColor}`}>{report.valueForTeam}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-2.5">
                      <span className="text-center text-[9px] font-black uppercase tracking-widest leading-tight text-slate-500">Potencjał</span>
                      <span className={`text-[13px] font-black italic uppercase tracking-tighter ${report.potentialColor}`}>{report.developmentPotential}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-2.5">
                      <span className="text-center text-[9px] font-black uppercase tracking-widest leading-tight text-slate-500">Poz. Eff.</span>
                      <span className={`text-[13px] font-black italic uppercase tracking-tighter ${effColor}`}>{report.positionEffectivenessScore}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Rekomendacje</span>
                    <div className="flex flex-col gap-1 rounded-xl bg-black/30 p-2.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Fokus Indywidualny</span>
                      <span className="text-[13px] font-black italic uppercase tracking-tighter text-blue-300">{report.recommendedFocusLabel}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl bg-black/30 p-2.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Program Drużynowy</span>
                      <span className="text-[13px] font-black italic uppercase tracking-tighter text-blue-300">{report.recommendedCycleName}</span>
                    </div>
                  </div>

                  <div className="flex-1 rounded-2xl border border-amber-500/20 bg-amber-950/30 p-4">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Opłacalność Inwestycji</span>
                    <p className="text-[13px] font-black italic uppercase tracking-tighter leading-relaxed text-amber-200">{report.investmentText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}</PortalScaleWrapper>, document.body)}

      {isAnalysisOpen && myClub && teamAnalysisReport && (
        <TeamAnalysisModal
          club={myClub}
          report={teamAnalysisReport}
          onClose={() => setIsAnalysisOpen(false)}
          assistantName={assistants[0] ? `${assistants[0].firstName} ${assistants[0].lastName}` : undefined}
        />
      )}

      {isMotivationOpen && myClub && (
        <WeeklyMotivationModal
          club={myClub}
          leaguePosition={leaguePosition}
          teamCount={leagueClubs.length}
          seed={(sessionSeed ?? 1) + (myClub.stats.played ?? 0) * 37 + currentDate.getTime()}
          onConfirm={handleMotivationConfirm}
          onClose={() => setIsMotivationOpen(false)}
        />
      )}

      {isStaffOpen && myClub && (() => {
        const isUserClub = myClub.id === userTeamId;
        const coachName = isUserClub && managerProfile
          ? `${managerProfile.firstName} ${managerProfile.lastName}`
          : myClub.coachId && coaches[myClub.coachId]
            ? `${coaches[myClub.coachId].firstName} ${coaches[myClub.coachId].lastName}`
            : null;
        const clubStaff = (myClub.staffIds ?? []).map(id => staffMembers[id]).filter(Boolean);
        const grouped: Partial<Record<StaffRole, typeof clubStaff>> = {};
        clubStaff.forEach(s => {
          if (!grouped[s.role]) grouped[s.role] = [];
          grouped[s.role]!.push(s);
        });
        const assistants = grouped[StaffRole.ASSISTANT_COACH] ?? [];
        const gkCoaches  = grouped[StaffRole.GOALKEEPER_COACH] ?? [];
        const fitness    = grouped[StaffRole.FITNESS_COACH] ?? [];
        const analysts   = grouped[StaffRole.VIDEO_ANALYST] ?? [];
        const physios    = grouped[StaffRole.PHYSIOTHERAPIST] ?? [];
        const doctors    = grouped[StaffRole.CLUB_DOCTOR] ?? [];

        const ROLE_LABELS: Record<StaffRole, string> = {
          [StaffRole.ASSISTANT_COACH]: 'Asystent trenera',
          [StaffRole.GOALKEEPER_COACH]: 'Trener bramkarzy',
          [StaffRole.FITNESS_COACH]: 'Trener przygotowania motorycznego',
          [StaffRole.VIDEO_ANALYST]: 'Analityk video',
          [StaffRole.PHYSIOTHERAPIST]: 'Fizjoterapeuta',
          [StaffRole.CLUB_DOCTOR]: 'Lekarz klubowy',
        };
        const MONTHS_PL = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];

        const selectedMember = selectedStaffId ? clubStaff.find(s => s.id === selectedStaffId) ?? null : null;

        const StaffCard = ({ m, nameColor }: { m: typeof clubStaff[0]; nameColor: string }) => (
          <div
            className="flex flex-col items-center gap-0.5 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => { setSelectedStaffId(m.id); setIsStaffMenuOpen(false); setStaffActionMsg(null); setStaffFireConfirmOpen(false); setStaffNegotiationOpen(false); }}
          >
            <span className={`text-[17px] font-black italic uppercase tracking-tighter whitespace-nowrap ${nameColor}`}>{m.firstName} {m.lastName}</span>
          </div>
        );

        const Band = ({ label, labelColor, nameColor, bg, children }: { label: string; labelColor: string; nameColor: string; bg: string; children: React.ReactNode }) => (
          <div className={`w-full flex flex-col items-center gap-3 py-6 px-8 ${bg}`}>
            <span className={`text-[12px] font-black italic uppercase tracking-tighter ${labelColor}`}>{label}</span>
            <div className="flex items-start justify-center gap-14 flex-wrap">{children}</div>
          </div>
        );

        return createPortal(
          <PortalScaleWrapper>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={() => { setIsStaffOpen(false); setSelectedStaffId(null); }}>

            {/* KARTA SZCZEGÓŁÓW */}
            {selectedMember && (
              <div
                className="relative w-[460px] bg-slate-950/70 rounded-[32px] shadow-[0_50px_120px_rgba(0,0,0,0.95)] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* nagłówek karty */}
                <div className="flex flex-col items-center pt-8 pb-6 px-8 bg-slate-900/40 border-b border-white/6 relative">
                  {/* dropdown menu */}
                  <div className="absolute left-6 top-6">
                    <button
                      onClick={e => { e.stopPropagation(); setIsStaffMenuOpen(p => !p); setStaffActionMsg(null); }}
                      className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08)_inset] active:shadow-[0_1px_4px_rgba(0,0,0,0.6)] active:translate-y-px select-none"
                    >
                      ⚙ Akcje
                    </button>
                    {isStaffMenuOpen && (
                      <div className="absolute left-0 top-9 z-50 w-52 rounded-xl border border-white/10 bg-slate-900/95 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.06)_inset] overflow-hidden">
                        {/* Przedłuż kontrakt */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setIsStaffMenuOpen(false);
                            if (selectedMember.lastNegotiationDate) {
                              const lastNeg = new Date(selectedMember.lastNegotiationDate);
                              const unlockDate = new Date(lastNeg);
                              unlockDate.setMonth(unlockDate.getMonth() + 6);
                              const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
                              if (now < unlockDate) {
                                const uf = `${String(unlockDate.getDate()).padStart(2,'0')}.${String(unlockDate.getMonth()+1).padStart(2,'0')}.${unlockDate.getFullYear()}`;
                                setStaffActionMsg({ text: `Negocjacje zablokowane do ${uf}.`, ok: false });
                                return;
                              }
                            }
                            const attrVals = Object.values(selectedMember.attributes);
                            const avg = attrVals.length > 0 ? attrVals.reduce((a, b) => a + b, 0) / attrVals.length : 8;
                            const raise = 1.08 + (avg / 20) * 0.12 + (Math.random() - 0.5) * 0.06;
                            const propSalary = Math.round((selectedMember.salary * raise) / 10_000) * 10_000;
                            const propYears = avg >= 15 ? 3 : avg >= 10 ? 2 : Math.random() < 0.5 ? 2 : 1;
                            setStaffNegProposedSalary(propSalary);
                            setStaffNegProposedYears(propYears);
                            setStaffNegCounterSalary(propSalary);
                            setStaffNegCounterYears(propYears);
                            setStaffNegPhase('proposal');
                            setStaffNegotiationOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[12px] font-black italic uppercase tracking-tighter text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
                        >
                          Przedłuż kontrakt
                        </button>
                        {/* Zwolnij */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setIsStaffMenuOpen(false);
                            setStaffFireConfirmOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[12px] font-black italic uppercase tracking-tighter text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors border-t border-white/6"
                        >
                          Zwolnij
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-500">{ROLE_LABELS[selectedMember.role]}</span>
                  <span className="text-[24px] font-black italic uppercase tracking-tighter text-white mt-1 whitespace-nowrap">{selectedMember.firstName} {selectedMember.lastName}</span>
                  <span className="text-[12px] text-slate-400 mt-0.5">{REGION_LABELS[selectedMember.nationality] ?? selectedMember.nationality} · {selectedMember.age} lat</span>
                  <button onClick={() => { setSelectedStaffId(null); setIsStaffMenuOpen(false); setStaffActionMsg(null); setStaffFireConfirmOpen(false); setStaffNegotiationOpen(false); }} className="absolute right-6 top-6 text-slate-600 hover:text-white transition-colors text-lg">✕</button>
                  {/* komunikat akcji */}
                  {staffActionMsg && (
                    <div className={`mt-3 px-4 py-2 rounded-lg text-[11px] font-black italic uppercase tracking-tighter ${staffActionMsg.ok ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>
                      {staffActionMsg.text}
                    </div>
                  )}
                </div>
                {/* atrybuty */}
                <div className="px-8 pt-5 pb-3 bg-gradient-to-br from-amber-950/50 via-stone-900/60 to-orange-950/40">
                  <div className="flex flex-col gap-2">
                    {STAFF_ROLE_ATTRS[selectedMember.role].map(({ key, label }) => {
                      const val = selectedMember.attributes[key] ?? 0;
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 w-52 shrink-0">{label}</span>
                          <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${(val / 20) * 100}%` }} />
                          </div>
                          <span className="text-[13px] font-black italic text-white w-6 text-right">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* zarobki + kontrakt */}
                <div className="px-8 pt-4 pb-4 mt-2 bg-gradient-to-br from-yellow-900/60 via-yellow-800/40 to-amber-900/50 border-t border-yellow-600/30">
                  <div className="text-[11px] font-black italic uppercase tracking-tighter text-yellow-400/80 mb-2 text-center">Informacje o kontrakcie</div>
                  <div className="border-b border-white/20 mb-3" />
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300/60 mb-1">Zarobki roczne</div>
                      <span className="text-[15px] font-black italic tracking-tighter text-white">{selectedMember.salary.toLocaleString('pl-PL')} PLN</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-300/60 mb-1">Kontrakt do</div>
                      <span className="text-[15px] font-black italic tracking-tighter text-white">
                        {(() => { const d = new Date(selectedMember.contractEndDate); return `${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; })()}
                      </span>
                    </div>
                  </div>
                </div>
                {/* historia */}
                <div className="px-8 pt-4 pb-7 border-t border-amber-800/30 bg-gradient-to-br from-amber-950/50 via-stone-900/60 to-orange-950/40">
                  <div className="text-[10px] font-black italic uppercase tracking-tighter text-slate-300 mb-2 text-center">Historia kariery</div>
                  <div className="border-b border-white/20 mb-3" />
                  {selectedMember.history.length === 0 ? (
                    <span className="text-[12px] italic text-slate-600">Brak historii</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedMember.history.map((h, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[14px] font-black italic uppercase tracking-tighter text-white">{h.clubName}</span>
                          <span className="text-[11px] italic text-slate-200">
                            {MONTHS_PL[(h.fromMonth ?? 1) - 1]} {h.fromYear} — {h.toYear ? `${MONTHS_PL[(h.toMonth ?? 1) - 1]} ${h.toYear}` : 'obecnie'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* modal potwierdzenia zwolnienia */}
                {staffFireConfirmOpen && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/85 rounded-[32px]" onClick={e => e.stopPropagation()}>
                    <div className="px-8 py-8 flex flex-col items-center gap-4 max-w-[340px] text-center">
                      <span className="text-[13px] font-black italic uppercase tracking-tighter text-red-400">Potwierdzenie zwolnienia</span>
                      <span className="text-[18px] font-black italic uppercase tracking-tighter text-white">{selectedMember.firstName} {selectedMember.lastName}</span>
                      <div className="border-b border-white/15 w-full" />
                      <span className="text-[12px] italic text-slate-300">Kwota odprawy:</span>
                      <span className="text-[24px] font-black italic tracking-tighter text-yellow-400">{Math.round((selectedMember.salary / 12) * 3).toLocaleString('pl-PL')} PLN</span>
                      <span className="text-[11px] italic text-slate-500">(3 miesięczne pensje)</span>
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => setStaffFireConfirmOpen(false)}
                          className="px-5 py-2 rounded-xl text-[12px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                        >
                          Anuluj
                        </button>
                        <button
                          onClick={() => {
                            const result = fireStaffMember(selectedMember.id);
                            setStaffFireConfirmOpen(false);
                            setStaffActionMsg({ text: result.message, ok: result.success });
                            if (result.success) setSelectedStaffId(null);
                          }}
                          className="px-5 py-2 rounded-xl text-[12px] font-black italic uppercase tracking-tighter text-white border border-red-700/60 bg-red-900/70 hover:bg-red-800/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                        >
                          Potwierdź zwolnienie
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* modal negocjacji kontraktu */}
                {staffNegotiationOpen && (() => {
                  const boardMaxSalary = (rep: number) => rep <= 3 ? 80_000 : rep <= 6 ? 150_000 : rep <= 9 ? 250_000 : rep <= 14 ? 500_000 : 1_200_000;
                  const clubRep = myClub?.reputation ?? 5;
                  const contractEndFormatted = (years: number) => {
                    const d = new Date(selectedMember.contractEndDate);
                    d.setFullYear(d.getFullYear() + years);
                    return `${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
                  };
                  return (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 rounded-[32px]" onClick={e => e.stopPropagation()}>
                      <div className="px-8 py-7 flex flex-col items-center gap-3 w-full max-w-[360px] text-center">
                        <span className="text-[13px] font-black italic uppercase tracking-tighter text-yellow-400">Negocjacje kontraktu</span>
                        <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">{ROLE_LABELS[selectedMember.role]}</span>
                        <span className="text-[18px] font-black italic uppercase tracking-tighter text-white">{selectedMember.firstName} {selectedMember.lastName}</span>
                        <div className="border-b border-white/15 w-full" />
                        <div className="flex gap-6 w-full justify-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Obecne wynagrodzenie</span>
                            <span className="text-[13px] font-black italic tracking-tighter text-slate-300">{selectedMember.salary.toLocaleString('pl-PL')} PLN</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Kontrakt do</span>
                            <span className="text-[13px] font-black italic tracking-tighter text-slate-300">{(() => { const d = new Date(selectedMember.contractEndDate); return `${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; })()}</span>
                          </div>
                        </div>
                        <div className="border-b border-white/10 w-full" />

                        {staffNegPhase === 'proposal' && (
                          <>
                            <div className="border-b border-white/15 w-full" />
                            <span className="text-[11px] italic text-slate-400 mt-1">Dziękuję za spotkanie. Moja propozycja na przedłużenie kontraktu to:</span>
                            <div className="flex gap-6 mt-1">
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Wynagrodzenie</span>
                                <span className="text-[20px] font-black italic tracking-tighter text-yellow-400">{staffNegProposedSalary.toLocaleString('pl-PL')} PLN</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 mb-0.5">Czas kontraktu</span>
                                <span className="text-[20px] font-black italic tracking-tighter text-white">{staffNegProposedYears} {staffNegProposedYears === 1 ? 'rok' : 'lata'}</span>
                                <span className="text-[10px] italic text-slate-500">do {contractEndFormatted(staffNegProposedYears)}</span>
                              </div>
                            </div>
                            <div className="border-b border-white/15 w-full" />
                            <div className="flex gap-3 mt-1">
                              <button onClick={() => setStaffNegotiationOpen(false)} className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Anuluj</button>
                              <button onClick={() => setStaffNegPhase('counter')} className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Negocjuj</button>
                              <button
                                onClick={() => { negotiateStaffContract(selectedMember.id, staffNegProposedSalary, staffNegProposedYears); setStaffNegotiationOpen(false); setStaffActionMsg({ text: 'Kontrakt przedłużony.', ok: true }); }}
                                className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-white border border-yellow-700/60 bg-yellow-800/60 hover:bg-yellow-700/70 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                              >
                                Akceptuj
                              </button>
                            </div>
                          </>
                        )}

                        {staffNegPhase === 'counter' && (
                          <>
                            <span className="text-[11px] italic text-slate-400 mt-1">Twoja propozycja:</span>
                            <div className="flex flex-col gap-3 w-full mt-1">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Wynagrodzenie (PLN/rok)</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setStaffNegCounterSalary(v => Math.max(0, v - 10_000))} className="w-8 h-8 rounded-lg border border-white/15 bg-slate-800/80 text-white font-black text-lg hover:bg-slate-700/80 transition-colors flex items-center justify-center">−</button>
                                  <input
                                    type="text"
                                    value={staffNegSalaryStr || staffNegCounterSalary.toLocaleString('pl-PL') + ' PLN'}
                                    onFocus={() => setStaffNegSalaryStr(String(staffNegCounterSalary))}
                                    onChange={e => setStaffNegSalaryStr(e.target.value.replace(/[^0-9]/g, ''))}
                                    onBlur={() => { const v = parseInt(staffNegSalaryStr, 10); if (!isNaN(v)) setStaffNegCounterSalary(v); setStaffNegSalaryStr(''); }}
                                    className="text-[16px] font-black italic tracking-tighter text-yellow-400 min-w-[150px] text-center bg-transparent border-b border-yellow-700/60 outline-none"
                                  />
                                  <button onClick={() => setStaffNegCounterSalary(v => v + 10_000)} className="w-8 h-8 rounded-lg border border-white/15 bg-slate-800/80 text-white font-black text-lg hover:bg-slate-700/80 transition-colors flex items-center justify-center">+</button>
                                </div>
                              </div>
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500">Czas kontraktu</span>
                                <div className="flex gap-2">
                                  {[1, 2, 3].map(y => (
                                    <button key={y} onClick={() => setStaffNegCounterYears(y)} className={`px-4 py-2 rounded-lg text-[12px] font-black italic uppercase tracking-tighter border transition-colors ${staffNegCounterYears === y ? 'border-yellow-500/60 bg-yellow-800/50 text-yellow-300' : 'border-white/15 bg-slate-800/60 text-slate-400 hover:text-white'}`}>
                                      {y} {y === 1 ? 'rok' : 'lata'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 mt-3">
                              <button onClick={() => setStaffNegPhase('proposal')} className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Wróć</button>
                              <button
                                onClick={() => {
                                  const counterSal = Math.round(staffNegCounterSalary / 10_000) * 10_000;
                                  const maxSal = boardMaxSalary(clubRep);
                                  if (counterSal > maxSal) {
                                    setStaffNegResultMsg(`Zarząd zablokował ofertę — maksymalne wynagrodzenie dla tego klubu to ${maxSal.toLocaleString('pl-PL')} PLN.`);
                                    setStaffNegResultOk(false);
                                    setStaffNegPhase('result');
                                    return;
                                  }
                                  const staffAccepts = counterSal >= staffNegProposedSalary * 0.80 && staffNegCounterYears >= staffNegProposedYears - 1;
                                  if (!staffAccepts) {
                                    setStaffNegResultMsg('Pracownik odrzucił ofertę — proponowana kwota lub czas kontraktu są zbyt niskie.');
                                    setStaffNegResultOk(false);
                                    setStaffNegPhase('result');
                                    return;
                                  }
                                  negotiateStaffContract(selectedMember.id, counterSal, staffNegCounterYears);
                                  setStaffNegResultMsg(`Kontrakt przedłużony. Nowe wynagrodzenie: ${counterSal.toLocaleString('pl-PL')} PLN, czas: ${staffNegCounterYears} ${staffNegCounterYears === 1 ? 'rok' : 'lata'}.`);
                                  setStaffNegResultOk(true);
                                  setStaffNegPhase('result');
                                }}
                                className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-white border border-yellow-700/60 bg-yellow-800/60 hover:bg-yellow-700/70 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]"
                              >
                                Złóż ofertę
                              </button>
                            </div>
                          </>
                        )}

                        {staffNegPhase === 'result' && (
                          <>
                            <div className={`mt-2 px-5 py-3 rounded-xl text-[12px] font-black italic uppercase tracking-tighter ${staffNegResultOk ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>
                              {staffNegResultMsg}
                            </div>
                            <button onClick={() => setStaffNegotiationOpen(false)} className="mt-3 px-6 py-2 rounded-xl text-[11px] font-black italic uppercase tracking-tighter text-slate-300 border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.06)_inset]">Zamknij</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* LISTA SZTABU */}
            {!selectedMember && (
              <div
                className="relative w-[800px] bg-slate-950 rounded-[36px] shadow-[0_50px_120px_rgba(0,0,0,0.95)] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-center gap-4 pt-7 pb-5 bg-slate-950 relative">
                  {getClubLogo(myClub.id) && (
                    <img src={getClubLogo(myClub.id)!} alt="" className="w-10 h-10 object-contain" />
                  )}
                  <div className="text-center">
                    <div className="text-[20px] font-black italic uppercase tracking-tighter text-white">{myClub.name}</div>
                    <div className="text-[22px] font-black italic uppercase tracking-tighter text-white mt-0.5">Sztab szkoleniowy</div>
                  </div>
                  <button onClick={() => setIsStaffOpen(false)} className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors text-lg">✕</button>
                </div>

                {coachName && (
                  <div className="w-full flex flex-col items-center gap-1 py-7 bg-gradient-to-b from-yellow-900/60 to-yellow-950/40">
                    <span className="text-[12px] font-black italic uppercase tracking-tighter text-yellow-400">Trener</span>
                    <span className="text-[28px] font-black italic uppercase tracking-tighter text-yellow-100 mt-1">{coachName}</span>
                  </div>
                )}

                {assistants.length > 0 && (
                  <Band label="Asystent trenera" labelColor="text-slate-300" nameColor="text-slate-100" bg="bg-gradient-to-b from-slate-700/40 to-slate-800/30">
                    {assistants.map(m => <StaffCard key={m.id} m={m} nameColor="text-slate-100" />)}
                  </Band>
                )}

                {(gkCoaches.length > 0 || fitness.length > 0 || analysts.length > 0) && (
                  <div className="w-full py-6 px-8 bg-gradient-to-b from-blue-950/50 to-blue-950/30">
                    <div className="flex items-start justify-center gap-20">
                      {gkCoaches.length > 0 && (
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-[12px] font-black italic uppercase tracking-tighter text-blue-300">Trener bramkarzy</span>
                          <div className="flex flex-col items-center gap-2">{gkCoaches.map(m => <StaffCard key={m.id} m={m} nameColor="text-blue-100" />)}</div>
                        </div>
                      )}
                      {fitness.length > 0 && (
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-[12px] font-black italic uppercase tracking-tighter text-blue-300">Przygotowanie motoryczne</span>
                          <div className="flex flex-col items-center gap-2">{fitness.map(m => <StaffCard key={m.id} m={m} nameColor="text-blue-100" />)}</div>
                        </div>
                      )}
                      {analysts.length > 0 && (
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-[12px] font-black italic uppercase tracking-tighter text-blue-300">Analityk video</span>
                          <div className="flex flex-col items-center gap-2">{analysts.map(m => <StaffCard key={m.id} m={m} nameColor="text-blue-100" />)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(physios.length > 0 || doctors.length > 0) && (
                  <div className="w-full py-6 px-8 bg-gradient-to-b from-emerald-950/50 to-emerald-950/30">
                    <div className="flex items-start justify-center gap-24">
                      {physios.length > 0 && (
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-[12px] font-black italic uppercase tracking-tighter text-emerald-300">Fizjoterapeuci</span>
                          <div className="flex flex-col items-center gap-2">{physios.map(m => <StaffCard key={m.id} m={m} nameColor="text-emerald-100" />)}</div>
                        </div>
                      )}
                      {doctors.length > 0 && (
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-[12px] font-black italic uppercase tracking-tighter text-emerald-300">Lekarz klubowy</span>
                          <div className="flex flex-col items-center gap-2">{doctors.map(m => <StaffCard key={m.id} m={m} nameColor="text-emerald-100" />)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          </PortalScaleWrapper>,
          document.body
        );
      })()}

      {/*
        MODAL SZCZEGÓŁÓW WYPOŻYCZENIA
        Ten panel jest celowo umieszczony w SquadView, bo zakładka WYPOŻYCZENIA jest miejscem,
        w którym gracz zarządza wypożyczonymi zawodnikami. Wiersz tabeli daje szybki skrót,
        ale modal pokazuje pełny kontekst jednej umowy: terminy, finanse, status oraz archiwum
        miesięcznych raportów zapisanych w player.loan.monthlyReports.

        Ważne założenie danych:
        - raporty miesięczne są zapisywane w GameContext przy generowaniu maila sztabu,
        - mail może zostać usunięty, ale historia w loan.monthlyReports zostaje,
        - najnowszy raport jest zawsze pierwszy, więc poniżej nie sortujemy agresywnie danych,
          tylko ufamy kolejności zapisu i pokazujemy ostatnie miesiące w naturalnej kolejności.
      */}
      {loanDetailsPlayer?.loan && createPortal(
        <PortalScaleWrapper>
        {(() => {
          const player = loanDetailsPlayer;
          const loan = player.loan!;
          const destinationClub = clubs.find(club => club.id === loan.destinationClubId);
          const destinationLogo = destinationClub ? getClubLogo(destinationClub.id) : null;
          const daysLeft = getLoanDaysLeft(loan.endDate);
          const reports = loan.monthlyReports ?? [];
          const totalReportMinutes = reports.reduce((sum, report) => sum + report.minutes, 0);
          const totalReportMatches = reports.reduce((sum, report) => sum + report.matches, 0);
          const lastReport = reports[0] ?? null;
          const ratedReports = reports.filter(report => report.averageRating !== null);
          const detailAverageRating = ratedReports.length > 0
            ? ratedReports.reduce((sum, report) => sum + (report.averageRating ?? 0), 0) / ratedReports.length
            : null;

          return (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-6">
              <div className="absolute inset-0 bg-[url('https://i.ibb.co/JwgrBtvC/biuro2-1.png')] bg-cover bg-center opacity-10" />
              <div className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-[40px] border border-cyan-300/20 bg-slate-950/72 shadow-[0_45px_140px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
                <div className="border-b border-white/10 bg-white/[0.04] px-8 py-6 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-5 min-w-0">
                    {destinationLogo ? (
                      <img src={destinationLogo} alt={loan.destinationClubName} className="h-16 w-16 object-contain shrink-0" />
                    ) : (
                      <div className="h-16 w-16 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[12px] font-black italic uppercase tracking-tighter text-cyan-300 whitespace-nowrap">Szczegóły wypożyczenia</p>
                      <h2 className="text-[32px] font-black italic uppercase tracking-tighter text-white truncate">
                        {player.firstName} {player.lastName}
                      </h2>
                      <p className="text-[12px] font-black italic uppercase tracking-tighter text-slate-400 truncate">
                        {loan.destinationClubName} / {player.position} / OVR {player.overallRating}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLoanDetailsPlayerId(null)}
                    className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 text-[16px] font-black italic uppercase tracking-tighter text-white transition-colors hover:bg-white/20"
                  >
                    X
                  </button>
                </div>

                <div className="custom-scrollbar max-h-[calc(88vh-110px)] overflow-y-auto p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Od', value: formatLoanDate(loan.startDate), color: 'text-slate-100' },
                      { label: 'Do', value: formatLoanDate(loan.endDate), color: 'text-slate-100' },
                      { label: 'Dni', value: `${daysLeft ?? '-'}`, color: daysLeft !== null && daysLeft <= 30 ? 'text-amber-300' : 'text-cyan-300' },
                      { label: 'Status', value: loan.forcedByClub ? 'Wymuszone' : 'Aktywne', color: loan.forcedByClub ? 'text-orange-300' : 'text-emerald-300' },
                    ].map(item => (
                      <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">{item.label}</p>
                        <p className={`mt-1 text-[22px] font-black italic uppercase tracking-tighter ${item.color} whitespace-nowrap`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-5">
                      <p className="mb-4 text-[12px] font-black italic uppercase tracking-tighter text-emerald-300 whitespace-nowrap">Warunki finansowe</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 whitespace-nowrap">Pokrycie pensji</span>
                          <span className="text-[16px] font-black italic uppercase tracking-tighter text-white whitespace-nowrap">{loan.wageCoveragePercent ?? 0}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[11px] font-black italic uppercase tracking-tighter text-slate-400 whitespace-nowrap">Opłata</span>
                          <span className="text-[16px] font-black italic uppercase tracking-tighter text-emerald-200 whitespace-nowrap">{(loan.loanFee ?? 0).toLocaleString('pl-PL')} PLN</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/10 p-5">
                      <p className="mb-4 text-[12px] font-black italic uppercase tracking-tighter text-cyan-300 whitespace-nowrap">Podsumowanie raportów</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">Raporty</p>
                          <p className="text-[22px] font-black italic uppercase tracking-tighter text-white whitespace-nowrap">{reports.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">Mecze</p>
                          <p className="text-[22px] font-black italic uppercase tracking-tighter text-white whitespace-nowrap">{totalReportMatches}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">Minuty</p>
                          <p className="text-[22px] font-black italic uppercase tracking-tighter text-cyan-200 whitespace-nowrap">{totalReportMinutes}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {lastReport && (
                    <div className="rounded-[28px] border border-amber-300/20 bg-amber-500/10 p-5">
                      <p className="text-[12px] font-black italic uppercase tracking-tighter text-amber-300 whitespace-nowrap">Ostatni sygnał sztabu</p>
                      <p className="mt-2 text-[16px] font-black italic uppercase tracking-tighter text-amber-100">
                        {lastReport.monthLabel}: {lastReport.status}, {lastReport.minutes} min, rozwój: {lastReport.developmentNote}
                      </p>
                    </div>
                  )}

                  <div className="rounded-[30px] border border-white/10 bg-black/25 overflow-hidden">
                    <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between gap-4">
                      <p className="text-[13px] font-black italic uppercase tracking-tighter text-white whitespace-nowrap">Historia miesięcznych raportów</p>
                      <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">
                        Śr. ocena: {detailAverageRating === null ? '-' : detailAverageRating.toFixed(2)}
                      </p>
                    </div>

                    {reports.length === 0 ? (
                      <div className="min-h-[170px] flex items-center justify-center px-6">
                        <p className="text-[14px] font-black italic uppercase tracking-tighter text-slate-500 text-center">
                          BRAK MIESIĘCZNYCH RAPORTÓW DLA TEGO WYPOŻYCZENIA.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {reports.map(report => (
                          <div key={report.id} className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_1.4fr] gap-4 px-5 py-4 items-center bg-white/[0.018]">
                            <div className="min-w-0">
                              <p className="text-[13px] font-black italic uppercase tracking-tighter text-white truncate">{report.monthLabel}</p>
                              <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 whitespace-nowrap">{formatLoanDate(report.date)}</p>
                            </div>
                            <p className="text-[13px] font-black italic uppercase tracking-tighter text-slate-200 whitespace-nowrap">{report.matches} M</p>
                            <p className={`text-[13px] font-black italic uppercase tracking-tighter whitespace-nowrap ${report.minutes < 90 ? 'text-orange-300' : 'text-cyan-300'}`}>{report.minutes} MIN</p>
                            <p className="text-[13px] font-black italic uppercase tracking-tighter text-slate-200 whitespace-nowrap">{report.averageRating === null ? '-' : report.averageRating.toFixed(2)}</p>
                            <div className="min-w-0">
                              <p className={`text-[12px] font-black italic uppercase tracking-tighter truncate ${report.developmentChanged ? 'text-emerald-300' : 'text-slate-300'}`}>
                                {report.developmentChanged ? `${report.previousOverall}→${report.nextOverall}` : 'OVR bez zmian'}
                              </p>
                              <p className="text-[10px] font-black italic uppercase tracking-tighter text-slate-500 truncate">{report.status} / {report.developmentNote}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => viewPlayerDetails(player.id)}
                      className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 text-[12px] font-black italic uppercase tracking-tighter text-cyan-100 transition-colors hover:bg-cyan-500/20"
                    >
                      Karta zawodnika
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Skrócić wypożyczenie zawodnika ${player.firstName} ${player.lastName}? Zawodnik wróci natychmiast do kadry.`)) {
                          terminateLoanEarly(player.id);
                          setLoanDetailsPlayerId(null);
                        }
                      }}
                      className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-5 py-3 text-[12px] font-black italic uppercase tracking-tighter text-amber-100 transition-colors hover:bg-amber-500/20"
                    >
                      Skróć wypożyczenie
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        </PortalScaleWrapper>,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }

        @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-ticker { animation: ticker 20s linear infinite; }

        .clip-path-arc-top { clip-path: inset(50% 0 0 0); }
      `}</style>
    </div>
  );
};
