import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ViewState, EventKind, CompetitionType, Club, MailMessage, MailType } from '../../types';
import { CalendarEngine } from '../../services/CalendarEngine';
import stadionBg from '../../Graphic/themes/stadion.png';
import { Card } from '../ui/Card';
import { LineupService } from '../../services/LineupService';
import { MailDetailsModal } from '../modals/MailDetailsModal';
import { FinanceHistoryModal } from '../modals/FinanceHistoryModal';
import { BoardModal } from '../modals/BoardModal';
import { WinterCampLocationModal, WinterCampProgramModal } from '../modals/WinterCampModal';
import { SummerCampLocationModal, SummerCampProgramModal } from '../modals/SummerCampModal';
import { getAssistantSuggestion } from '../../services/WinterCampService';
import { getSummerAssistantSuggestion } from '../../services/SummerCampService';
import { WinterCampLocation, WinterCampProgram, WinterCampIntensity, SummerCampLocation, SummerCampProgram, SummerCampIntensity } from '../../types';
import { getClubLogo } from '../../resources/ClubLogoAssets';
import saveButton from '../../Graphic/buttons/save.png';
import { exportSaveToFile } from '../../services/SaveGameService';
import { MatchHistoryService } from '../../services/MatchHistoryService';
import edytorButton from '../../Graphic/buttons/edytor.png';
import instrukcjaButton from '../../Graphic/buttons/instrukcja.png';
import winnerPolishImg from '../../Graphic/cup/winnerpolish.png';
import awansEkstImg from '../../Graphic/cup/awans-do-ekst.png';
import awans1LigiImg from '../../Graphic/cup/awans-do-1ligi.png';

export const Dashboard: React.FC = () => {
  const { 
    currentDate, 
    advanceDay, 
    jumpToDate, 
    jumpToNextEvent,
    navigateTo, 
    userTeamId, 
    clubs, 
    nextEvent,
    viewClubDetails,
    lineups,
    players,
    isJumping,
    managerProfile,
    seasonNumber,
    seasonTemplate,
    messages,
    markMessageRead,

   processBackgroundCupMatches,
   processCLMatchDay,
   coaches,
   viewCoachDetails,
   viewPlayerDetails,
   nationalTeams,
    fixtures,
    confirmSeasonEnd,
    setElHistoryInitialRound,
    setConfHistoryInitialRound,
    incomingOffers,
    isResigned,
    resignFromClub,
    getSaveState,
    winterCampInvitePending,
    winterCampProgramPending,
    clearWinterCampInvitePending,
    clearWinterCampProgramPending,
    saveWinterCampLocation,
    saveWinterCampProgram,
    summerCampInvitePending,
    summerCampProgramPending,
    clearSummerCampInvitePending,
    clearSummerCampProgramPending,
    saveSummerCampLocation,
    saveSummerCampProgram,
    wcState,
    seasonCelebration,
    clearSeasonCelebration,
  } = useGame();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedMail, setSelectedMail] = useState<MailMessage | null>(null);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [activeMailboxTab, setActiveMailboxTab] = useState<'main' | 'transfers'>('main');
  const [isWinterCampLocationOpen, setIsWinterCampLocationOpen] = useState(false);
  const [isWinterCampProgramOpen, setIsWinterCampProgramOpen] = useState(false);
  const [isSummerCampLocationOpen, setIsSummerCampLocationOpen] = useState(false);
  const [isSummerCampProgramOpen, setIsSummerCampProgramOpen] = useState(false);
  const handleSaveGame = () => { exportSaveToFile(getSaveState()); };

  useEffect(() => {
    setIsProcessing(false);
  }, [currentDate]);

  useEffect(() => {
    if (winterCampInvitePending) setIsWinterCampLocationOpen(true);
  }, [winterCampInvitePending]);

  useEffect(() => {
    if (winterCampProgramPending) setIsWinterCampProgramOpen(true);
  }, [winterCampProgramPending]);

  useEffect(() => {
    if (summerCampInvitePending) setIsSummerCampLocationOpen(true);
  }, [summerCampInvitePending]);

  useEffect(() => {
    if (summerCampProgramPending) setIsSummerCampProgramOpen(true);
  }, [summerCampProgramPending]);

  const myClub = clubs.find(c => c.id === userTeamId);
  const isWorldCupTournamentOpen = Boolean(
    wcState &&
    currentDate.getFullYear() === wcState.year &&
    (
      currentDate.getMonth() > 5 ||
      (currentDate.getMonth() === 5 && currentDate.getDate() >= 2)
    )
  );

  const seasonYearLabel = useMemo(() => {
    if (!seasonTemplate) return "2025/26";
    const startYear = seasonTemplate.seasonStartYear;
    return `${startYear}/${String(startYear + 1).slice(2)}`;
  }, [seasonTemplate]);

  const userRank = useMemo(() => {
    if (!userTeamId || !myClub) return 1;
    const leagueClubs = clubs.filter(c => c.leagueId === myClub.leagueId);
    const sorted = [...leagueClubs].sort((a, b) => {
      if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
      if (b.stats.goalDifference !== a.stats.goalDifference) return b.stats.goalDifference - a.stats.goalDifference;
      return b.stats.goalsFor - a.stats.goalsFor;
    });
    return sorted.findIndex(c => c.id === userTeamId) + 1;
  }, [clubs, userTeamId, myClub]);

  const sortedLeague = useMemo(() => {
    if (!myClub) return [];
    return [...clubs.filter(c => c.leagueId === myClub.leagueId)].sort((a, b) =>
      b.stats.points - a.stats.points ||
      b.stats.goalDifference - a.stats.goalDifference ||
      b.stats.goalsFor - a.stats.goalsFor
    );
  }, [clubs, myClub]);

  const lastMatches = useMemo(() => {
    if (!userTeamId) return [];
    return MatchHistoryService.getTeamHistory(userTeamId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [userTeamId, currentDate]);

const boardConfidence = useMemo(() => {
    if (!myClub) return 50;
    const resultScore = (myClub.stats.wins * 4) - (myClub.stats.losses * 6);
    if (myClub.leagueId === 'NONE') {
      const base = 100 - (myClub.reputation * 2);
      const total = base + resultScore + (myClub.europeanBonusPoints ?? 0) + (myClub.sportingDirectorBoardInfluence ?? 0);
      return Math.min(99, Math.max(5, total));
    }
    const rankImpact = (18 - userRank) * 2;
    const total = 75 + resultScore + rankImpact - (myClub.reputation * 2) + (myClub.europeanBonusPoints ?? 0) + (myClub.sportingDirectorBoardInfluence ?? 0);
    return Math.min(100, Math.max(5, total));
  }, [myClub, userRank]);

  const isTransferWindowOpen = useMemo(() => {
    if (!myClub) return false;
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    // Letnie: 1 lipca (m6, d1) — 8 września (m8, d8) włącznie
    const isSummer =
      (month === 6 && day >= 1) ||
      month === 7 ||
      (month === 8 && day <= 8);

    // Zimowe: 12 stycznia (m0, d12) — 13 lutego (m1, d13) włącznie
    const isWinter =
      (month === 0 && day >= 12) ||
      (month === 1 && day <= 13);

    return isSummer || isWinter;
  }, [myClub, currentDate]);

  useEffect(() => {


    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const lineupValidation = useMemo(() => {
    if (!userTeamId || !lineups[userTeamId]) return { valid: false, error: "Brak zdefiniowanego składu" };
    const squad = players[userTeamId] || [];
    return LineupService.validateLineup(lineups[userTeamId], squad);
  }, [lineups, userTeamId, players]);

  const actionConfig = useMemo(() => {
    const todayEvent = (seasonTemplate && userTeamId)
      ? CalendarEngine.getPrimaryEventForDate(currentDate, seasonTemplate, fixtures, userTeamId, clubs)
      : null;

    // ── Zakończenie sezonu ─────────────────────────────────────────────────
    if (todayEvent?.slot.competition === CompetitionType.OFF_SEASON) {
      return {
        text: 'NOWY SEZON 🏆',
        action: confirmSeasonEnd,
        isMatch: false,
        disabled: isJumping,
        info: 'Zakończenie sezonu — przejdź do kolejnego!',
      };
    }

    // ── Rezygnacja — gracz tylko obserwuje ───────────────────────────────
    if (isResigned) {
      return { text: isJumping ? 'PRZETWARZANIE...' : 'NASTĘPNY DZIEŃ', action: advanceDay, isMatch: false, disabled: isJumping };
    }

    // ── Zdarzenia gracza (participation === 'player') ─────────────────────
    if (todayEvent?.participation === 'player') {
      switch (todayEvent.kind) {

        // ── Liga ────────────────────────────────────────────────────────────
        case EventKind.MATCH_LEAGUE:
          return {
            text: lineupValidation.valid ? 'DZIEŃ MECZOWY ⚽' : 'BŁĄD SKŁADU ⚠️',
            action: () => lineupValidation.valid
              ? navigateTo(ViewState.PRE_MATCH_STUDIO)
              : navigateTo(ViewState.SQUAD_VIEW),
            isMatch: true,
            disabled: isJumping,
            error: lineupValidation.valid ? null : lineupValidation.error,
          };

        case EventKind.MATCH_FRIENDLY:
          return {
            text: lineupValidation.valid ? 'SPARING ⚽' : 'BŁĄD SKŁADU ⚠️',
            action: () => lineupValidation.valid
              ? navigateTo(ViewState.PRE_MATCH_FRIENDLY_STUDIO)
              : navigateTo(ViewState.SQUAD_VIEW),
            isMatch: true,
            disabled: isJumping,
            error: lineupValidation.valid ? null : lineupValidation.error,
          };

        // ── Superpuchar Polski ───────────────────────────────────────────────
        case EventKind.MATCH_SUPER_CUP:
          return {
            text: 'SUPERPUCHAR POLSKI ✨',
            action: () => navigateTo(ViewState.PRE_MATCH_CUP_STUDIO),
            isMatch: true,
            disabled: isJumping,
          };

        // ── Puchar Polski — mecz ─────────────────────────────────────────────
        case EventKind.MATCH_POLISH_CUP:
          return {
            text: lineupValidation.valid ? 'PUCHAR POLSKI 🏆' : 'BŁĄD SKŁADU ⚠️',
            action: () => lineupValidation.valid
              ? navigateTo(ViewState.PRE_MATCH_CUP_STUDIO)
              : navigateTo(ViewState.SQUAD_VIEW),
            isMatch: true,
            disabled: isJumping,
            error: lineupValidation.valid ? null : lineupValidation.error,
          };

        // ── Liga Mistrzów / Liga Europy / Liga Konferencji — mecz ───────
        case EventKind.MATCH_EURO: {
          const isUEFASuperCup = todayEvent.slot.competition === CompetitionType.UEFA_SUPER_CUP;
          if (isUEFASuperCup) {
            return {
              text: '⭐ SUPERPUCHAR EUROPY',
              action: advanceDay,
              isMatch: false,
              disabled: isJumping,
            };
          }
          const isCLFinal = todayEvent.slot.competition === CompetitionType.CL_FINAL;
          const isELComp = todayEvent.slot.competition === CompetitionType.EL_R1Q ||
                           todayEvent.slot.competition === CompetitionType.EL_R1Q_RETURN ||
                           todayEvent.slot.competition === CompetitionType.EL_R2Q ||
                           todayEvent.slot.competition === CompetitionType.EL_R2Q_RETURN ||
                           todayEvent.slot.competition === CompetitionType.EL_GROUP_STAGE ||
                           todayEvent.slot.competition === CompetitionType.EL_R16 ||
                           todayEvent.slot.competition === CompetitionType.EL_R16_RETURN ||
                           todayEvent.slot.competition === CompetitionType.EL_QF ||
                           todayEvent.slot.competition === CompetitionType.EL_QF_RETURN ||
                           todayEvent.slot.competition === CompetitionType.EL_SF ||
                           todayEvent.slot.competition === CompetitionType.EL_SF_RETURN ||
                           todayEvent.slot.competition === CompetitionType.EL_FINAL;
          const isCONFComp = todayEvent.slot.competition === CompetitionType.CONF_R1Q ||
                             todayEvent.slot.competition === CompetitionType.CONF_R1Q_RETURN ||
                             todayEvent.slot.competition === CompetitionType.CONF_R2Q ||
                             todayEvent.slot.competition === CompetitionType.CONF_R2Q_RETURN ||
                             todayEvent.slot.competition === CompetitionType.CONF_GROUP_STAGE ||
                             todayEvent.slot.competition === CompetitionType.CONF_R16 ||
                             todayEvent.slot.competition === CompetitionType.CONF_R16_RETURN ||
                             todayEvent.slot.competition === CompetitionType.CONF_QF ||
                             todayEvent.slot.competition === CompetitionType.CONF_QF_RETURN ||
                             todayEvent.slot.competition === CompetitionType.CONF_SF ||
                             todayEvent.slot.competition === CompetitionType.CONF_SF_RETURN ||
                             todayEvent.slot.competition === CompetitionType.CONF_FINAL;
          return {
            text: isCLFinal ? 'FINAŁ LIGI MISTRZÓW ⭐' : isCONFComp ? '🟢 LIGA KONFERENCJI' : isELComp ? '🟠 LIGA EUROPY' : 'LIGA MISTRZÓW ⭐',
            action: () => {
              navigateTo(isCLFinal ? ViewState.PRE_MATCH_CL_STUDIO : isCONFComp ? ViewState.PRE_MATCH_CONF_STUDIO : isELComp ? ViewState.PRE_MATCH_EL_STUDIO : ViewState.PRE_MATCH_CL_STUDIO);
            },
            isMatch: true,
            disabled: isJumping,
          };
        }

        // ── Puchar Polski — losowanie ────────────────────────────────────────
        case EventKind.CUP_DRAW:
          return {
            text: '🏆 LOSOWANIE PUCHARU POLSKI',
            action: advanceDay,
            isMatch: false,
            disabled: isJumping,
          };

        // ── Liga Mistrzów / Ligi Europy — losowanie ──────────────────────────
        case EventKind.PLAYOFF_DRAW:
          return {
            text:
              todayEvent.slot.competition === CompetitionType.PLAYOFF_DRAW_CEREMONY
                ? 'BARAŻE • OGŁOSZENIE PAR'
                : todayEvent.slot.competition === CompetitionType.RELEGATION_PLAYOFF_1
                  ? 'BARAŻE O UTRZYMANIE • 1. MECZE'
                  : todayEvent.slot.competition === CompetitionType.RELEGATION_PLAYOFF_2
                    ? 'BARAŻE O UTRZYMANIE • REWANŻE'
                    : todayEvent.slot.competition === CompetitionType.PROMOTION_PLAYOFF_31_MAY
                      ? 'BARAŻE AWANSOWE • PÓŁFINAŁY'
                      : todayEvent.slot.competition === CompetitionType.PROMOTION_PLAYOFF_4_JUNE
                        ? 'BARAŻE AWANSOWE • FINAŁY'
                        : 'BARAŻE',
            action: advanceDay,
            isMatch: false,
            disabled: isJumping,
          };

        case EventKind.CL_DRAW:
          return {
            text: todayEvent.slot.competition === CompetitionType.EL_R1Q_DRAW
              ? '🟠 LOSOWANIE LIGI EUROPY'
              : todayEvent.slot.competition === CompetitionType.EL_R2Q_DRAW
                ? '🟠 LOSOWANIE LE: RUNDA 2 PREELIMINACYJNA'
                : todayEvent.slot.competition === CompetitionType.EL_GROUP_DRAW
                  ? '🟠 LOSOWANIE LE: FAZA GRUPOWA'
                  : todayEvent.slot.competition === CompetitionType.EL_R16_DRAW
                  ? '🟠 LOSOWANIE LE: 1/8 FINAŁU'
                  : todayEvent.slot.competition === CompetitionType.EL_QF_DRAW
                    ? '🟠 LOSOWANIE LE: 1/4 FINAŁU'
                    : todayEvent.slot.competition === CompetitionType.EL_SF_DRAW
                      ? '🟠 LOSOWANIE LE: 1/2 FINAŁU'
                      : todayEvent.slot.competition === CompetitionType.EL_FINAL_DRAW
                        ? '🟠 OGŁOSZENIE FINALISTÓW LE'
                        : todayEvent.slot.competition === CompetitionType.CONF_R1Q_DRAW
                          ? '🟢 LOSOWANIE LIGI KONFERENCJI'                          : todayEvent.slot.competition === CompetitionType.CONF_R2Q_DRAW
                            ? '🟢 LOSOWANIE LK: RUNDA 2 PREELIMINACYJNA'                          : todayEvent.slot.competition === CompetitionType.CONF_GROUP_DRAW
                              ? '🟢 LOSOWANIE LK: FAZA GRUPOWA'                              : todayEvent.slot.competition === CompetitionType.CONF_R16_DRAW
                                ? '🟢 LOSOWANIE LK: 1/8 FINAŁU'                                : todayEvent.slot.competition === CompetitionType.CONF_QF_DRAW
                                  ? '🟢 LOSOWANIE LK: 1/4 FINAŁU'
                                  : todayEvent.slot.competition === CompetitionType.CONF_SF_DRAW
                                    ? '🟢 LOSOWANIE LK: 1/2 FINAŁU'
                                    : todayEvent.slot.competition === CompetitionType.CONF_FINAL_DRAW
                                      ? '🟢 OGŁOSZENIE FINALISTÓW LK'
                                      : '⭐ LOSOWANIE LIGI MISTRZÓW',
            action: advanceDay,
            isMatch: false,
            disabled: isJumping,
          };

        default:
          break;
      }
    }

    // ── Zdarzenia tła (participation === 'background') ────────────────────
    if (todayEvent?.participation === 'background') {
      // ── Reprezentacja — losowanie baraży lub mecze ─────────────────────
      if (todayEvent.kind === EventKind.NATIONAL_TEAM_MATCH) {
        if (todayEvent.targetView === ViewState.WCQ_PLAYOFF_DRAW_VIEW) {
          return {
            text: '🎯 LOSOWANIE BARAŻY MŚ 2026',
            action: advanceDay,
            isMatch: false,
            disabled: isJumping,
            info: 'Losowanie par playoff MŚ 2026',
          };
        }
        if (todayEvent.targetView === ViewState.WCQ_PLAYOFF_RESULTS_SF) {
          return {
            text: '🌍 BARAŻE MŚ 2026 – PÓŁFINAŁY',
            action: advanceDay,
            isMatch: false,
            disabled: isJumping,
          };
        }
        if (todayEvent.targetView === ViewState.WCQ_PLAYOFF_RESULTS_FINAL) {
          return {
            text: '🌍 BARAŻE MŚ 2026 – FINAŁY',
            action: advanceDay,
            isMatch: false,
            disabled: isJumping,
          };
        }
        return {
          text: '🇵🇱 MECZE REPREZENTACJI',
          action: advanceDay,
          isMatch: false,
          disabled: isJumping,
        };
      }
      if (todayEvent.slot.competition === CompetitionType.SUPER_CUP) {
        return {
          text: 'SUPERPUCHAR POLSKI ✨ (wyniki)',
          action: () => { processBackgroundCupMatches(); navigateTo(ViewState.SCORE_RESULTS_POLISH_CUP); },
          isMatch: false,
          disabled: isJumping,
          info: 'Symulacja wyników',
        };
      }
      if (todayEvent.slot.competition === CompetitionType.POLISH_CUP) {
        return {
          text: 'PUCHAR POLSKI 🏆 (wyniki)',
          action: () => { processBackgroundCupMatches(); navigateTo(ViewState.SCORE_RESULTS_POLISH_CUP); },
          isMatch: false,
          disabled: isJumping,
          info: 'Symulacja wyników',
        };
      }
      // ── Liga Mistrzów — mecze (gracz nie uczestniczy) ────────────────────
      const CL_MATCH_COMPS = [
        CompetitionType.CL_R1Q, CompetitionType.CL_R1Q_RETURN,
        CompetitionType.CL_R2Q, CompetitionType.CL_R2Q_RETURN,
        CompetitionType.CL_GROUP_STAGE,
        CompetitionType.CL_R16, CompetitionType.CL_R16_RETURN,
        CompetitionType.CL_QF, CompetitionType.CL_QF_RETURN,
        CompetitionType.CL_SF, CompetitionType.CL_SF_RETURN,
      ];
      if ((CL_MATCH_COMPS as string[]).includes(todayEvent.slot.competition as string)) {
        return {
          text: '⭐ LIGA MISTRZÓW – WYNIKI',
          action: () => { processCLMatchDay(); navigateTo(ViewState.POST_MATCH_CL_STUDIO); },
          isMatch: false,
          disabled: isJumping,
          info: 'Wyniki meczów Ligi Mistrzów',
        };
      }
      // ── Liga Europy — mecze (gracz nie uczestniczy) ──────────────────────
      if (todayEvent.slot.competition === CompetitionType.EL_R1Q ||
          todayEvent.slot.competition === CompetitionType.EL_R1Q_RETURN ||
          todayEvent.slot.competition === CompetitionType.EL_R2Q ||
          todayEvent.slot.competition === CompetitionType.EL_R2Q_RETURN ||
          todayEvent.slot.competition === CompetitionType.EL_GROUP_STAGE ||
          todayEvent.slot.competition === CompetitionType.EL_R16 ||
          todayEvent.slot.competition === CompetitionType.EL_R16_RETURN ||
          todayEvent.slot.competition === CompetitionType.EL_QF ||
          todayEvent.slot.competition === CompetitionType.EL_QF_RETURN ||
          todayEvent.slot.competition === CompetitionType.EL_SF ||
          todayEvent.slot.competition === CompetitionType.EL_SF_RETURN ||
          todayEvent.slot.competition === CompetitionType.EL_FINAL) {
        const elRoundKey =
          todayEvent.slot.competition === CompetitionType.EL_R1Q || todayEvent.slot.competition === CompetitionType.EL_R1Q_RETURN ? 'R1Q' :
          todayEvent.slot.competition === CompetitionType.EL_R2Q || todayEvent.slot.competition === CompetitionType.EL_R2Q_RETURN ? 'R2Q' :
          todayEvent.slot.competition === CompetitionType.EL_GROUP_STAGE ? 'GS' :
          todayEvent.slot.competition === CompetitionType.EL_R16 || todayEvent.slot.competition === CompetitionType.EL_R16_RETURN ? 'R16' :
          todayEvent.slot.competition === CompetitionType.EL_QF || todayEvent.slot.competition === CompetitionType.EL_QF_RETURN ? 'QF' :
          todayEvent.slot.competition === CompetitionType.EL_SF || todayEvent.slot.competition === CompetitionType.EL_SF_RETURN ? 'SF' :
          todayEvent.slot.competition === CompetitionType.EL_FINAL ? 'FINAL' : 'R1Q';
        return {
          text: '🟠 LIGA EUROPY – WYNIKI',
          action: elRoundKey === 'FINAL'
            ? () => { processCLMatchDay(); navigateTo(ViewState.POST_MATCH_CL_STUDIO); }
            : () => { processCLMatchDay(); setElHistoryInitialRound(elRoundKey); navigateTo(ViewState.EL_HISTORY); },
          isMatch: false,
          disabled: isJumping,
          info: 'Wyniki meczów Ligi Europy',
        };
      }
      // ── Liga Konferencji — mecze (gracz nie uczestniczy) ─────────────────
      if (todayEvent.slot.competition === CompetitionType.CONF_R1Q ||
          todayEvent.slot.competition === CompetitionType.CONF_R1Q_RETURN ||
          todayEvent.slot.competition === CompetitionType.CONF_R2Q ||
          todayEvent.slot.competition === CompetitionType.CONF_R2Q_RETURN ||
          todayEvent.slot.competition === CompetitionType.CONF_GROUP_STAGE ||
          todayEvent.slot.competition === CompetitionType.CONF_R16 ||
          todayEvent.slot.competition === CompetitionType.CONF_R16_RETURN ||
          todayEvent.slot.competition === CompetitionType.CONF_QF ||
          todayEvent.slot.competition === CompetitionType.CONF_QF_RETURN ||
          todayEvent.slot.competition === CompetitionType.CONF_SF ||
          todayEvent.slot.competition === CompetitionType.CONF_SF_RETURN ||
          todayEvent.slot.competition === CompetitionType.CONF_FINAL) {
        const confRoundKey =
          todayEvent.slot.competition === CompetitionType.CONF_R1Q || todayEvent.slot.competition === CompetitionType.CONF_R1Q_RETURN ? 'R1Q' :
          todayEvent.slot.competition === CompetitionType.CONF_R2Q || todayEvent.slot.competition === CompetitionType.CONF_R2Q_RETURN ? 'R2Q' :
          todayEvent.slot.competition === CompetitionType.CONF_GROUP_STAGE ? 'GS' :
          todayEvent.slot.competition === CompetitionType.CONF_R16 || todayEvent.slot.competition === CompetitionType.CONF_R16_RETURN ? 'R16' :
          todayEvent.slot.competition === CompetitionType.CONF_QF || todayEvent.slot.competition === CompetitionType.CONF_QF_RETURN ? 'QF' :
          todayEvent.slot.competition === CompetitionType.CONF_SF || todayEvent.slot.competition === CompetitionType.CONF_SF_RETURN ? 'SF' :
          todayEvent.slot.competition === CompetitionType.CONF_FINAL ? 'FINAL' : 'R1Q';
        const confRoundLabel =
          todayEvent.slot.competition === CompetitionType.CONF_R16 || todayEvent.slot.competition === CompetitionType.CONF_R16_RETURN ? '1/8 FINAŁU' :
          todayEvent.slot.competition === CompetitionType.CONF_QF || todayEvent.slot.competition === CompetitionType.CONF_QF_RETURN ? '1/4 FINAŁU' :
          todayEvent.slot.competition === CompetitionType.CONF_SF || todayEvent.slot.competition === CompetitionType.CONF_SF_RETURN ? '1/2 FINAŁU' :
          todayEvent.slot.competition === CompetitionType.CONF_FINAL ? 'FINAŁ' : '';
        return {
          text: confRoundLabel ? `🟢 LK ${confRoundLabel} – WYNIKI` : '🟢 LIGA KONFERENCJI – WYNIKI',
          action: confRoundKey === 'FINAL'
            ? () => { processCLMatchDay(); navigateTo(ViewState.POST_MATCH_CONF_STUDIO); }
            : () => { processCLMatchDay(); setConfHistoryInitialRound(confRoundKey); navigateTo(ViewState.CONF_HISTORY); },
          isMatch: false,
          disabled: isJumping,
          info: 'Wyniki meczów Ligi Konferencji',
        };
      }
    }

    // ── Domyślnie: przesuń dzień ───────────────────────────────────────────
    return { text: isJumping ? 'PRZETWARZANIE...' : 'NASTĘPNY DZIEŃ', action: advanceDay, isMatch: false, disabled: isJumping };
  }, [currentDate, advanceDay, navigateTo, lineupValidation, isJumping,
      processBackgroundCupMatches, processCLMatchDay, fixtures, userTeamId, confirmSeasonEnd, seasonTemplate, clubs, setElHistoryInitialRound, setConfHistoryInitialRound]);

  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    // Filtrowanie klubów
    const filteredClubs = clubs
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(c => ({ ...c, searchType: 'CLUB' }));

    // -> tutaj wstaw kod
    // Filtrowanie piłkarzy
    const filteredPlayers = Object.values(players)
      .flat()
      .filter(p =>
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(p => ({ ...p, searchType: 'PLAYER' }));

    // Filtrowanie reprezentacji
    const filteredNationalTeams = nationalTeams
      .filter(nt => nt.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(nt => ({ ...nt, searchType: 'NATIONAL_TEAM' }));

    // Filtrowanie trenerów
    const filteredCoaches = Object.values(coaches)
      .filter(c =>
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(c => ({ ...c, searchType: 'COACH' }));

    return [...filteredClubs, ...filteredNationalTeams, ...filteredPlayers, ...filteredCoaches].slice(0, 10);
  }, [searchTerm, clubs, coaches, players, nationalTeams]);

  const getMailIcon = (type: MailType) => {
    switch (type) {
      case MailType.BOARD: return '🏛️';
      case MailType.FANS: return '📣';
      case MailType.STAFF: return '🩺';
      case MailType.MEDIA: return '📰';
      default: return '📧';
    }
  };

  const getMailColor = (type: MailType) => {
    switch (type) {
      case MailType.BOARD: return 'bg-amber-600/20 text-amber-400 border-amber-500/20';
      case MailType.FANS: return 'bg-rose-600/20 text-rose-400 border-rose-500/20';
      case MailType.STAFF: return 'bg-blue-600/20 text-blue-400 border-blue-500/20';
      case MailType.MEDIA: return 'bg-emerald-600/20 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-500/20';
    }
  };

  const isTransferOfferMail = (mail: MailMessage) => {
    if (mail.metadata?.type === 'INCOMING_TRANSFER_OFFER') {
      return true;
    }

    const content = `${mail.subject} ${mail.body} ${mail.sender} ${mail.role}`.toLowerCase();
    return (
      content.includes('oferta transferowa') ||
      content.includes('oficjalna oferta transferowa') ||
      content.includes('oferta za zawodnika') ||
      content.includes('oferta za ') ||
      content.includes('zatwierdz transfer') ||
      content.includes('zatwierdź transfer')
    );
  };

  const transferMessages = useMemo(
    () => messages.filter(isTransferOfferMail),
    [messages]
  );

  const mainMessages = useMemo(
    () => messages.filter(mail => !isTransferOfferMail(mail)),
    [messages]
  );

  const activeMailboxMessages = activeMailboxTab === 'transfers' ? transferMessages : mainMessages;
  const unreadMainMessagesCount = mainMessages.filter(mail => !mail.isRead).length;
  const unreadTransferMessagesCount = transferMessages.filter(mail => !mail.isRead).length;
  const unreadActiveMailboxMessagesCount = activeMailboxMessages.filter(mail => !mail.isRead).length;
  const clubPrimary = myClub?.colorsHex[0] ?? '#2563eb';
  const clubSecondary = myClub?.colorsHex[1] ?? '#0f172a';

  type DashboardActionIcon =
    | 'squad'
    | 'reserves'
    | 'training'
    | 'competitions'
    | 'calendar'
    | 'hospital'
    | 'stats'
    | 'world'
    | 'history'
    | 'academy'
    | 'jobs'
    | 'finance'
    | 'board'
    | 'editor'
    | 'save'
    | 'manual'
    | 'resign'
    | 'exit';

  type DashboardSvgButtonProps = {
    label: string;
    icon: DashboardActionIcon;
    onClick: () => void;
    disabled?: boolean;
    tone?: string;
    size?: 'large' | 'wide' | 'small';
  };

  const renderDashboardActionIcon = (icon: DashboardActionIcon, color: string) => {
    const common = {
      fill: 'none',
      stroke: color,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      strokeWidth: 2.4,
    };

    switch (icon) {
      case 'squad':
        return (
          <>
            <circle cx="18" cy="31" r="7" {...common} fill={color} fillOpacity="0.25" />
            <path d="M8 61 Q8 41 14 41 Q18 45 22 41 Q28 41 28 61 Z" {...common} fill={color} fillOpacity="0.20" />
            <circle cx="48" cy="31" r="7" {...common} fill={color} fillOpacity="0.25" />
            <path d="M38 61 Q38 41 44 41 Q48 45 52 41 Q58 41 58 61 Z" {...common} fill={color} fillOpacity="0.20" />
            <circle cx="79" cy="31" r="7" {...common} fill={color} fillOpacity="0.25" />
            <path d="M69 61 Q69 41 75 41 Q79 45 83 41 Q89 41 89 61 Z" {...common} fill={color} fillOpacity="0.20" />
          </>
        );
      case 'reserves':
        return (
          <>
            <path d="M21 21l9-6 7 5 7-5 9 6-4 11-5-2v24H30V30l-5 2-4-11z" {...common} />
            <path d="M48 35l8-5 7 5 8-5 6 8-3 8-5-2v19H55V44l-4 2-3-11z" stroke={color} strokeOpacity="0.48" fill="none" strokeWidth="2" />
          </>
        );
      case 'training':
        return (
          <>
            <path d="M27 24l10 28h20l10-28" {...common} />
            <path d="M34 38h26M29 52h36" {...common} />
            <path d="M66 17l9 9M74 16l-9 10" stroke={color} strokeOpacity="0.55" strokeWidth="2" />
          </>
        );
      case 'competitions':
        return (
          <>
            <path d="M31 18h34v9c0 14-8 23-17 23s-17-9-17-23v-9z" {...common} />
            <path d="M31 25H20c1 11 6 17 14 19M65 25h11c-1 11-6 17-14 19M48 50v10M38 62h20" {...common} />
          </>
        );
      case 'calendar':
        return (
          <>
            <rect x="20" y="22" width="56" height="44" rx="8" {...common} />
            <path d="M30 16v12M66 16v12M21 36h54" {...common} />
            <path d="M34 49h8M47 49h8M60 49h4M34 59h8M47 59h8" stroke={color} strokeOpacity="0.55" strokeWidth="2" />
          </>
        );
      case 'hospital':
        return (
          <>
            <path d="M48 18l26 12v16c0 15-11 24-26 30-15-6-26-15-26-30V30l26-12z" {...common} />
            <path d="M48 34v22M37 45h22" {...common} />
            <path d="M23 61c7-9 12 10 19 0s11 9 19 0 10 4 12 1" stroke={color} strokeOpacity="0.45" strokeWidth="2" fill="none" />
          </>
        );
      case 'stats':
        return (
          <>
            <path d="M20 65h56" {...common} />
            <path d="M28 57V41M42 57V30M56 57V37M70 57V23" {...common} />
            <path d="M25 34l15-10 16 8 18-15" stroke={color} strokeOpacity="0.55" strokeWidth="2" fill="none" />
          </>
        );
      case 'world':
        return (
          <>
            <circle cx="48" cy="43" r="25" {...common} />
            <path d="M23 43h50M48 18c8 8 11 40 0 50M48 18c-8 8-11 40 0 50" {...common} />
            <path d="M68 23l6-6M75 16l2 8-8-2" stroke={color} strokeOpacity="0.55" strokeWidth="2" fill="none" />
          </>
        );
      case 'history':
        return (
          <>
            <path d="M25 28c7-8 18-12 30-8 14 4 22 19 18 33S54 75 40 71c-8-2-14-7-18-13" {...common} />
            <path d="M22 28v17h17M48 33v16l13 8" {...common} />
          </>
        );
      case 'academy':
        return (
          <>
            <path d="M48 18l25 13-25 13-25-13 25-13z" {...common} />
            <path d="M31 41v14c8 9 26 9 34 0V41" {...common} />
            <path d="M70 34v18M64 62l6-10 6 10" stroke={color} strokeOpacity="0.50" strokeWidth="2" fill="none" />
          </>
        );
      case 'jobs':
        return (
          <>
            <rect x="20" y="28" width="56" height="38" rx="8" {...common} />
            <path d="M37 28v-7h22v7M20 43h56M43 47h10" {...common} />
          </>
        );
      case 'finance':
        return (
          <>
            <ellipse cx="40" cy="34" rx="18" ry="9" {...common} />
            <path d="M22 34v20c0 5 8 9 18 9s18-4 18-9V34M22 44c0 5 8 9 18 9s18-4 18-9" {...common} />
            <path d="M62 58l8-11 8 5" stroke={color} strokeOpacity="0.55" strokeWidth="2" fill="none" />
          </>
        );
      case 'board':
        return (
          <>
            <path d="M48 17l27 13v8H21v-8l27-13zM27 38v27M42 38v27M57 38v27M72 38v27M20 65h56" {...common} />
            <path d="M48 26h.1" stroke={color} strokeWidth="5" />
          </>
        );
      case 'editor':
        return (
          <>
            <path d="M59 21L66 28L32 62L22 67L25 55Z" {...common} fill={color} fillOpacity="0.12" />
            <path d="M59 21L66 28L62 24Z" {...common} fill={color} fillOpacity="0.30" />
            <path d="M56 24L30 58" stroke={color} strokeOpacity="0.30" strokeWidth="1.5" fill="none" />
            <path d="M72 20l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" stroke={color} strokeOpacity="0.55" strokeWidth="1.5" fill={color} fillOpacity="0.15" />
          </>
        );
      case 'save':
        return (
          <>
            <path d="M20 18H66L76 28V70H20Z" {...common} fill={color} fillOpacity="0.08" />
            <rect x="26" y="18" width="34" height="22" rx="1" {...common} fill={color} fillOpacity="0.15" />
            <rect x="52" y="21" width="5" height="10" rx="1" {...common} fill={color} fillOpacity="0.35" />
            <rect x="28" y="50" width="40" height="14" rx="2" {...common} fill={color} fillOpacity="0.15" />
            <path d="M34 57h12" stroke={color} strokeOpacity="0.45" strokeWidth="2" fill="none" />
          </>
        );
      case 'manual':
        return (
          <>
            <path d="M48 22C44 20 32 18 18 22V68C32 64 44 66 48 68Z" {...common} fill={color} fillOpacity="0.10" />
            <path d="M48 22C52 20 64 18 78 22V68C64 64 52 66 48 68Z" {...common} fill={color} fillOpacity="0.10" />
            <path d="M48 22V68" {...common} />
            <path d="M18 68C32 64 44 66 48 68C52 66 64 68 78 68" {...common} />
            <path d="M24 32h18M24 40h18M24 48h14" stroke={color} strokeOpacity="0.38" strokeWidth="1.5" fill="none" />
            <path d="M54 32h18M54 40h18M54 48h14" stroke={color} strokeOpacity="0.38" strokeWidth="1.5" fill="none" />
          </>
        );
      case 'resign':
        return (
          <>
            <path d="M32 70V16" {...common} />
            <path d="M32 16C52 13 64 20 70 26C62 34 50 37 32 36Z" {...common} fill={color} fillOpacity="0.15" />
            <path d="M36 22C50 20 62 24 68 26" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
          </>
        );
      case 'exit':
        return (
          <>
            <path d="M60 30A22 22 0 1 1 36 30" {...common} />
            <path d="M48 14V40" {...common} />
          </>
        );
      default:
        return null;
    }
  };

  const DashboardSvgButton = ({ label, icon, onClick, disabled = false, tone, size = 'small' }: DashboardSvgButtonProps) => {
    const accent = tone ?? clubPrimary;
    const sizeClass =
      size === 'large'
        ? 'col-span-3 h-[108px]'
        : size === 'wide'
          ? 'col-span-2 h-[92px]'
          : 'h-[92px]';
    const labelClass = size === 'small' ? 'text-[10px]' : 'text-[13px]';
    const iconBoxClass = size === 'small' ? 'w-14 h-14' : 'w-20 h-20';

    return (
      <div className={`group relative ${sizeClass}`}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative w-full h-full overflow-hidden rounded-[22px] border border-white/[0.08] bg-slate-950/58 text-left shadow-[0_14px_34px_rgba(0,0,0,0.34)] transition-all duration-300
          hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900/70 hover:shadow-[0_22px_52px_rgba(0,0,0,0.54)]
          active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-30
        `}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d="M0 18 Q0 0 18 0 H82 Q100 0 100 18 V82 Q100 100 82 100 H18 Q0 100 0 82 Z" fill="#020617" fillOpacity="0.84" />
          <path d="M0 18 Q0 0 18 0 H82 Q100 0 100 18 V82 Q100 100 82 100 H18 Q0 100 0 82 Z" fill={accent} fillOpacity="0.10" />
          <path d="M0 64 C22 50 42 51 62 40 C78 31 88 22 100 18 V100 H0 Z" fill={accent} fillOpacity="0.12" />
          <path d="M7 24 C29 10 67 12 93 26" fill="none" stroke={accent} strokeOpacity="0.42" strokeWidth="1.4" strokeDasharray="8 8" className="dashboard-action-signal" />
          <path d="M10 78 C31 90 69 90 90 73" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
          <rect x="4" y="4" width="92" height="92" rx="17" fill="none" stroke="#ffffff" strokeOpacity="0.08" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.09] via-transparent to-black/35 opacity-70 transition-opacity group-hover:opacity-100" />
        <div className="absolute left-4 right-4 top-2 h-px opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className={`${iconBoxClass} shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2`}>
            <svg viewBox="0 0 96 84" className="h-full w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]" aria-hidden>
              <rect x="5" y="5" width="86" height="74" rx="20" fill="#020617" fillOpacity="0.42" stroke={accent} strokeOpacity="0.25" />
              {renderDashboardActionIcon(icon, accent)}
            </svg>
          </div>
        </div>
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none z-[200] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
        <div
          className="relative px-4 py-2.5 rounded-2xl border whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, rgba(2,6,23,0.97) 0%, rgba(15,23,42,0.95) 100%)',
            borderColor: `${accent}70`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 18px ${accent}30`,
          }}
        >
          <div className="absolute inset-x-3 top-0 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
          <span className="text-xs font-black italic uppercase tracking-tighter text-white drop-shadow">
            {label}
          </span>
          <div className="mt-1.5 h-[2px] w-full rounded-full" style={{ background: `linear-gradient(90deg, ${accent}cc, transparent)` }} />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${accent}70` }} />
        </div>
      </div>
      </div>
    );
  };


  return (
    <>
    {/* ── GLOBAL BACKGROUND — outside animated container so fixed works correctly ── */}
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Stadium image — full visibility */}
        <img
          src={stadionBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.4 }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-slate-950/70" />
        {/* Club color glows */}
        <div 
          className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[180px] opacity-[0.25] animate-pulse-slow transition-all duration-1000"
          style={{ background: myClub?.colorsHex[0] || '#1e293b' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-[0.15] animate-pulse-slow transition-all duration-1000"
          style={{ background: myClub?.colorsHex[1] || '#0f172a' }}
        />
    </div>

    <div className="h-[1080px] max-w-[1920px] mx-auto flex flex-col gap-4 animate-fade-in overflow-hidden relative pr-2 z-10">

      {(isJumping || isProcessing) && (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
           <div className="bg-slate-900 border border-white/10 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-xs font-black text-white uppercase tracking-widest">PRZETWARZANIE DANYCH...</span>
           </div>
        </div>
      )}

      {selectedMail && (
        <MailDetailsModal 
          mail={selectedMail} 
          onClose={() => {
            markMessageRead(selectedMail.id);
            setSelectedMail(null);
          }} 
        />
      )}

      {myClub && (
        <FinanceHistoryModal
          isOpen={isFinanceModalOpen}
          onClose={() => setIsFinanceModalOpen(false)}
          club={myClub}
        />
      )}

      {isBoardModalOpen && myClub && (
        <BoardModal
          club={myClub}
          confidence={boardConfidence}
          rank={userRank}
          fixtures={fixtures}
          onClose={() => setIsBoardModalOpen(false)}
        />
      )}

      {isWinterCampLocationOpen && myClub?.winterCamp && (
        <WinterCampLocationModal
          prices={myClub.winterCamp.locationPrices}
          spaCost={myClub.winterCamp.spaCost}
          clubBudget={myClub.budget}
          onConfirm={(location, cost, spaOption) => {
            saveWinterCampLocation(location, cost, spaOption);
            clearWinterCampInvitePending();
            setIsWinterCampLocationOpen(false);
          }}
        />
      )}

      {isWinterCampProgramOpen && myClub?.winterCamp && (
        <WinterCampProgramModal
          campLocation={myClub.winterCamp.location!}
          assistantSuggestion={getAssistantSuggestion(players[userTeamId ?? ''] ?? [], myClub)}
          onConfirm={(program, intensity) => {
            saveWinterCampProgram(program, intensity);
            clearWinterCampProgramPending();
            setIsWinterCampProgramOpen(false);
          }}
        />
      )}

      {isSummerCampLocationOpen && myClub?.summerCamp && (
        <SummerCampLocationModal
          prices={myClub.summerCamp.locationPrices}
          spaCost={myClub.summerCamp.spaCost}
          clubBudget={myClub.budget}
          onConfirm={(location, cost, spaOption) => {
            saveSummerCampLocation(location, cost, spaOption);
            clearSummerCampInvitePending();
            setIsSummerCampLocationOpen(false);
          }}
        />
      )}

      {isSummerCampProgramOpen && myClub?.summerCamp && (
        <SummerCampProgramModal
          campLocation={myClub.summerCamp.location!}
          assistantSuggestion={getSummerAssistantSuggestion(players[userTeamId ?? ''] ?? [], myClub)}
          onConfirm={(program, intensity) => {
            saveSummerCampProgram(program, intensity);
            clearSummerCampProgramPending();
            setIsSummerCampProgramOpen(false);
          }}
        />
      )}

      <div className="relative flex items-center justify-between px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-2xl shrink-0 z-[100] shadow-2xl overflow-hidden">
         <div className="absolute inset-y-0 w-1/3 separator-scan pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />
         <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <span className="text-lg font-black italic uppercase tracking-tighter text-white leading-none">
                 {managerProfile ? `${managerProfile.firstName} ${managerProfile.lastName}` : 'NOWY MANAGER'}
              </span>
              <span className="text-sm font-black italic uppercase tracking-tighter bg-red-600 text-white px-2 py-0.5 rounded">
                {myClub?.leagueId === 'L_PL_1' ? 'Ekstraklasa' : myClub?.leagueId === 'L_PL_2' ? 'I Liga' : myClub?.leagueId === 'L_PL_3' ? 'II Liga' : myClub?.leagueId === 'L_PL_4' ? 'III Liga' : 'Ekstraklasa'}
              </span>
              <span className="text-sm font-black italic uppercase tracking-tighter text-blue-400">SEZON {seasonNumber} ({seasonYearLabel})</span>
            </div>
         </div>

         <div ref={searchRef} className="relative flex-1 max-w-xl mx-12">
            <div className={`
              flex items-center gap-4 px-6 py-2.5 rounded-2xl border transition-all duration-500
              ${isSearchFocused 
                ? 'bg-slate-900 border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full scale-[1.01]' 
                : 'bg-black/40 border-white/5 w-full'}
            `}>
              <span className="text-sm opacity-40">🔍</span>
              <input 
                type="text"
                placeholder="Wyszukaj dowolny klub, piłkarza lub ligę..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="bg-transparent border-none outline-none text-xs font-bold text-white placeholder-slate-600 w-full"
              />
            </div>

            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-slate-950/95 border border-white/10 rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-3xl z-[200] overflow-hidden animate-slide-down">
                 <div className="p-4 border-b border-white/5 bg-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Baza danych PZPN</span>
                 </div>
                 <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {searchResults.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.searchType === 'CLUB') viewClubDetails(item.id);
                        else if (item.searchType === 'PLAYER') viewPlayerDetails(item.id);
                        else if (item.searchType === 'NATIONAL_TEAM') navigateTo(ViewState.EUROPEAN_CLUBS);
                        else viewCoachDetails(item.id);
                        setIsSearchFocused(false);
                        setSearchTerm('');
                      }}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 group"
                    >
                      <div className="flex items-center gap-5">
                          {item.searchType === 'CLUB' ? (
                            <div className="flex flex-col w-2 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-lg">
                              <div style={{ backgroundColor: item.colorsHex[0] }} className="flex-1" />
                              <div style={{ backgroundColor: item.colorsHex[1] }} className="flex-1" />
                            </div>
                          ) : item.searchType === 'NATIONAL_TEAM' ? (
                            <div className="flex flex-col w-2 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-lg">
                              <div style={{ backgroundColor: item.colorsHex[0] }} className="flex-1" />
                              <div style={{ backgroundColor: item.colorsHex[1] }} className="flex-1" />
                            </div>
                          ) : item.searchType === 'PLAYER' ? (
                            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-lg border border-emerald-500/20 shadow-lg shrink-0">
                               ⚽
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-lg border border-blue-500/20 shadow-lg shrink-0">
                               👨‍💼
                            </div>
                          )}
                          <div className="text-left">
                            <span className="block text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase italic">
                              {item.searchType === 'CLUB' || item.searchType === 'NATIONAL_TEAM' ? item.name : `${item.firstName} ${item.lastName}`}
                            </span>
                            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                {item.searchType === 'CLUB'
                                  ? `Stadion: ${item.stadiumName}`
                                  : item.searchType === 'NATIONAL_TEAM'
                                    ? `${item.continent} • Reputacja: ${item.reputation}`
                                    : item.searchType === 'PLAYER'
                                      ? `Pozycja: ${item.position} • Ocena: ${item.overallRating}`
                                      : `${item.nationalityFlag} ${item.nationality} • Doświadczenie: ${item.attributes.experience}`}
                            </span>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[7px] font-black px-2 py-0.5 rounded border ${item.searchType === 'CLUB' || item.searchType === 'NATIONAL_TEAM' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : item.searchType === 'PLAYER' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5'}`}>
                           {item.searchType}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-[-10px]">
                          <span className="text-xs">→</span>
                        </div>
                      </div>
                    </button>
                  ))}
                 </div>
              </div>
            )}
         </div>
      </div>
      
      <div className="relative h-44 rounded-[40px] overflow-hidden shadow-2xl border border-white/10 shrink-0 z-10 group">
        <div className="absolute inset-0 z-0">
           <div 
             className="absolute inset-0 opacity-40 transition-transform duration-[3000ms] group-hover:scale-110" 
             style={{ background: `linear-gradient(135deg, ${myClub?.colorsHex[0]} 0%, ${myClub?.colorsHex[1] || '#000'} 100%)` }} 
           />
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-3xl" />
           <div className="absolute right-10 bottom-[-20%] text-[14rem] font-black italic text-white/[0.03] select-none pointer-events-none">
              {myClub?.shortName}
           </div>
        </div>

        <div className="relative z-10 px-12 h-full flex items-center justify-between gap-10">
           <div className="flex-1">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 backdrop-blur-md">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Centrum Klubowe</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-2xl">
                 {formatDate(currentDate)}
              </h2>
           </div>

           {nextEvent && nextEvent.opponentClubId && (() => {
             const opponent = clubs.find(c => c.id === nextEvent.opponentClubId);
             const isHome = nextEvent.isHome;
             const roundLabel = nextEvent.kind === EventKind.MATCH_LEAGUE
               ? `Kolejka ${(myClub?.stats.played ?? 0) + 1}`
               : nextEvent.label;
             const dateLabel = nextEvent.startDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
             return (
               <div className="hidden lg:flex flex-col relative overflow-hidden rounded-[28px] border border-white/[0.08] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] min-w-[300px] transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] hover:scale-[1.02] cursor-default"
                 style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.80) 100%)` }}
               >
                 {/* top accent bar with club color */}
                 <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[28px]"
                   style={{ background: `linear-gradient(90deg, transparent, ${myClub?.colorsHex[0] ?? '#3b82f6'}, transparent)` }} />
                 {/* inner glow */}
                 <div className="absolute inset-0 rounded-[28px] pointer-events-none"
                   style={{ boxShadow: `inset 0 0 60px ${myClub?.colorsHex[0] ?? '#3b82f6'}15` }} />

                 <div className="px-6 pt-5 pb-4 flex flex-col gap-4 relative z-10">
                   {/* header */}
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: myClub?.colorsHex[0] ?? '#3b82f6' }} />
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Następny Mecz</span>
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                       style={{
                         color: '#ffffff',
                         borderColor: `${myClub?.colorsHex[0] ?? '#3b82f6'}60`,
                         background: `${myClub?.colorsHex[0] ?? '#3b82f6'}55`,
                         textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                       }}>
                       {roundLabel}
                     </span>
                   </div>

                   {/* teams row */}
                   <div className="flex items-center gap-3">
                     {/* home team */}
                     <div className="flex flex-col items-center gap-1.5 flex-1">
                       {getClubLogo(myClub?.id || '') ? (
                         <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                           <img src={getClubLogo(myClub?.id || '')} alt={myClub?.name} className="w-full h-full object-contain drop-shadow-lg" />
                         </div>
                       ) : (
                         <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-inner flex flex-col shrink-0">
                           <div className="flex-1" style={{ backgroundColor: myClub?.colorsHex[0] ?? '#334155' }} />
                           <div className="flex-1" style={{ backgroundColor: myClub?.colorsHex[1] ?? '#1e293b' }} />
                         </div>
                       )}
                       <span className="text-[10px] font-black italic uppercase text-white text-center leading-tight line-clamp-2">{myClub?.name}</span>
                     </div>

                     {/* VS */}
                     <div className="flex flex-col items-center gap-0.5 shrink-0 px-1">
                       <div className="w-px h-4 bg-white/10" />
                       <span className="text-xs font-black italic text-white/20">VS</span>
                       <div className="w-px h-4 bg-white/10" />
                     </div>

                     {/* away team */}
                     <div className="flex flex-col items-center gap-1.5 flex-1">
                       {getClubLogo(opponent?.id || '') ? (
                         <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                           <img src={getClubLogo(opponent?.id || '')} alt={opponent?.name} className="w-full h-full object-contain drop-shadow-lg" />
                         </div>
                       ) : (
                         <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-inner flex flex-col shrink-0">
                           <div className="flex-1" style={{ backgroundColor: opponent?.colorsHex[0] ?? '#334155' }} />
                           <div className="flex-1" style={{ backgroundColor: opponent?.colorsHex[1] ?? '#1e293b' }} />
                         </div>
                       )}
                       <span className="text-[10px] font-black italic uppercase text-white text-center leading-tight line-clamp-2">{opponent?.name}</span>
                     </div>
                   </div>

                   {/* date footer */}
                   <div className="border-t border-white/[0.06] pt-3 flex items-center justify-center gap-2">
                     <svg className="w-3 h-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{dateLabel}</span>
                     {isHome !== undefined && (
                       <>
                         <span className="h-1 w-1 rounded-full bg-white/15" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">{isHome ? 'DOM' : 'WYJAZD'}</span>
                       </>
                     )}
                   </div>
                 </div>
               </div>
             );
           })()}

           {wcState && !wcState.knockoutComplete && (
             <button
               onClick={() => navigateTo(isWorldCupTournamentOpen ? ViewState.WORLD_CUP : ViewState.WC_DRAW)}
               disabled={isJumping}
               className="hidden lg:flex min-w-[260px] h-[100px] flex-col items-center justify-center rounded-[30px] border border-amber-400/30 bg-amber-500/15 px-8 text-center shadow-[0_16px_45px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/60 hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
             >
               <span className="font-black italic uppercase tracking-tighter text-[9px] text-amber-200/80">
                 Mistrzostwa Świata
               </span>
               <span className="font-black italic uppercase tracking-tighter text-2xl leading-none text-white drop-shadow-lg">
                 Mundial
               </span>
               <span className="mt-2 text-[8px] font-black uppercase tracking-[0.28em] text-amber-100/50">
                 {isWorldCupTournamentOpen ? 'TURNIEJ' : 'LOSOWANIE'}
               </span>
             </button>
           )}

           <div className="shrink-0 flex flex-col items-center gap-2">
              <button 
                onClick={() => { setIsProcessing(true); setTimeout(actionConfig.action, 0); }}
                disabled={actionConfig.disabled}
                className={`
                  relative group px-14 py-6 rounded-[32px] transition-all duration-500 transform active:translate-y-[2px]
                  flex flex-col items-center justify-center border-t border-x border-b
                  ${actionConfig.isMatch
                    ? (actionConfig.error
                      ? 'bg-red-600 border-t-red-400/60 border-x-red-500/30 border-b-black/60 text-white'
                      : 'bg-emerald-600 border-t-emerald-400/60 border-x-emerald-500/30 border-b-black/60 text-white')
                    : 'bg-white border-t-white/40 border-x-white/20 border-b-black/60 text-slate-900'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                style={{ boxShadow: actionConfig.isMatch && !actionConfig.error ? `0 4px 0 rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 40px ${myClub?.colorsHex[0]}66` : '0 4px 0 rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)' }}
              >
                <span className="text-2xl font-black italic uppercase tracking-tighter relative z-10 text-center leading-tight">
                   {actionConfig.text}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 opacity-60 relative z-10`}>
                   {actionConfig.error ? 'NAPRAW SKŁAD' : (actionConfig.info || 'DALEJ')}
                </span>
                {actionConfig.isMatch && !actionConfig.error && (
                  <div className="absolute inset-0 rounded-[30px] animate-ping opacity-20 bg-emerald-400 pointer-events-none" />
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
              </button>
              {actionConfig.error && (
                 <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">{actionConfig.error}</span>
              )}
           </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 z-0">
        <div className="w-80 flex flex-col gap-4 shrink-0 rounded-[26px] bg-slate-950/50 border border-white/[0.06] backdrop-blur-md p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] relative">
          <Card className="rounded-[28px] border border-white/[0.08] bg-slate-950/48 backdrop-blur-2xl relative group shrink-0 overflow-hidden shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: clubPrimary }} />
            <div className="absolute right-[-8px] bottom-[-22px] text-8xl font-black italic text-white/[0.025] select-none pointer-events-none">
              {myClub?.shortName}
            </div>
            <div className="relative z-10 p-2">
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-base text-white leading-tight truncate font-black italic uppercase tracking-tighter text-center w-full">
                  {isResigned ? 'BEZ KLUBU' : myClub?.name}
                </h3>
                {isResigned ? (
                  <div className="w-16 h-16 flex items-center justify-center text-2xl">👨‍💼</div>
                ) : getClubLogo(myClub?.id || '') ? (
                  <div className="w-16 h-16 shrink-0 transition-transform group-hover:-rotate-2">
                    <img
                      src={getClubLogo(myClub?.id || '')}
                      alt={myClub?.name}
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-[22px] flex flex-col overflow-hidden border border-white/20 shadow-2xl shrink-0">
                    <div className="flex-1" style={{ backgroundColor: clubPrimary }} />
                    <div className="flex-1" style={{ backgroundColor: clubSecondary }} />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="relative z-10 grid w-full grid-cols-3 gap-2">
            <DashboardSvgButton
              label="Kadra"
              icon="squad"
              size="large"
              tone={clubPrimary}
              onClick={() => navigateTo(ViewState.SQUAD_VIEW)}
              disabled={isJumping || isResigned}
            />
            <DashboardSvgButton
              label="Trening"
              icon="training"
              tone="#38bdf8"
              onClick={() => navigateTo(ViewState.TRAINING_VIEW)}
              disabled={isJumping || isResigned}
            />
            <DashboardSvgButton
              label="Rezerwy"
              icon="reserves"
              tone="#818cf8"
              onClick={() => navigateTo(ViewState.RESERVES_VIEW)}
              disabled={isJumping || isResigned}
            />
            <DashboardSvgButton
              label="Zarząd"
              icon="board"
              tone="#f59e0b"
              onClick={() => setIsBoardModalOpen(true)}
              disabled={isJumping || isResigned}
            />
            <DashboardSvgButton
              label="Szpital"
              icon="hospital"
              tone="#fb7185"
              onClick={() => navigateTo(ViewState.HOSPITAL_VIEW)}
              disabled={isJumping || isResigned}
            />
            <DashboardSvgButton
              label="Akademia"
              icon="academy"
              tone="#a3e635"
              onClick={() => navigateTo(ViewState.ACADEMY_VIEW)}
              disabled={isJumping || isResigned}
            />
            <DashboardSvgButton
              label="Rozgrywki"
              icon="competitions"
              tone="#facc15"
              onClick={() => navigateTo(ViewState.LEAGUE_TABLES)}
              disabled={isJumping}
            />
            <DashboardSvgButton
              label="Kalendarz"
              icon="calendar"
              tone="#22d3ee"
              onClick={() => navigateTo(ViewState.CALENDAR_DEBUG)}
              disabled={isJumping || isResigned}
            />
            <DashboardSvgButton
              label="Statystyki"
              icon="stats"
              tone="#60a5fa"
              onClick={() => navigateTo(ViewState.LEAGUE_STATS)}
              disabled={isJumping}
            />
            <DashboardSvgButton
              label="Europa"
              icon="world"
              tone="#f87171"
              onClick={() => navigateTo(ViewState.EUROPEAN_CLUBS)}
              disabled={isJumping}
            />
            <DashboardSvgButton
              label="Historia"
              icon="history"
              tone="#c084fc"
              onClick={() => navigateTo(ViewState.MATCH_HISTORY_BROWSER)}
              disabled={isJumping}
            />
            <DashboardSvgButton
              label="Rynek pracy"
              icon="jobs"
              tone="#f97316"
              onClick={() => navigateTo(ViewState.JOB_MARKET)}
              disabled={isJumping}
            />
            <DashboardSvgButton
              label="Finanse"
              icon="finance"
              tone="#2dd4bf"
              onClick={() => setIsFinanceModalOpen(true)}
              disabled={isJumping || isResigned}
            />
            <div className="col-span-3 relative h-px my-1 overflow-hidden">
              <div className="absolute inset-0 bg-yellow-400/25" />
              <div className="absolute inset-y-0 w-1/3 separator-scan" style={{ background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.85), transparent)' }} />
            </div>
            <DashboardSvgButton
              label="Edytor"
              icon="editor"
              tone="#a78bfa"
              onClick={() => navigateTo(ViewState.EDITOR)}
            />
            <DashboardSvgButton
              label="Zapis gry"
              icon="save"
              tone="#4ade80"
              onClick={handleSaveGame}
            />
            <DashboardSvgButton
              label="Instrukcja"
              icon="manual"
              tone="#fb923c"
              onClick={() => navigateTo(ViewState.GAME_MANUAL)}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 h-[800px]">
          <Card className="flex-1 rounded-[32px] border border-white/[0.08] bg-slate-950/48 flex flex-col overflow-hidden backdrop-blur-xl shadow-[0_28px_80px_rgba(0,0,0,0.55)] relative h-full">
            {/* Internal Glass Gloss Background for Mailbox */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551290464-67296061329c?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-[0.025] mix-blend-overlay grayscale" />
                 <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent z-10" />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,transparent_50%,rgba(2,6,23,0.34)_100%)]" />
                 <svg className="absolute inset-0 h-full w-full opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                   <path d="M2 12 C25 4 70 5 98 16" fill="none" stroke={clubPrimary} strokeOpacity="0.28" strokeWidth="0.35" strokeDasharray="4 4" />
                   <path d="M0 88 C32 95 68 95 100 86" fill="none" stroke={clubSecondary} strokeOpacity="0.25" strokeWidth="0.35" strokeDasharray="4 4" />
                 </svg>
              </div>

              
              <div className="relative z-10 flex flex-col h-full min-h-0">
                 <div className="px-7 py-5 border-b border-white/[0.07] bg-black/20 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="block text-[8px] text-emerald-300/70 font-black italic uppercase tracking-tighter">Centrum wiadomości</span>
                    <h3 className="text-sm text-white font-black italic uppercase tracking-tighter">Skrzynka pocztowa</h3>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-[16px] border border-white/[0.08] bg-slate-950/55 p-1 shadow-inner">
                    <button
                      onClick={() => setActiveMailboxTab('main')}
                      className={`rounded-[12px] px-4 py-2 text-[10px] transition-all font-black italic uppercase tracking-tighter ${
                        activeMailboxTab === 'main'
                          ? 'bg-white text-slate-950 shadow-lg'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      Główna ({unreadMainMessagesCount})
                    </button>
                    <button
                      onClick={() => setActiveMailboxTab('transfers')}
                      className={`rounded-[12px] px-4 py-2 text-[10px] transition-all font-black italic uppercase tracking-tighter ${
                        activeMailboxTab === 'transfers'
                          ? 'bg-amber-400 text-slate-950 shadow-lg'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      Transfery ({unreadTransferMessagesCount})
                    </button>
                  </div>
                </div>
                {unreadActiveMailboxMessagesCount > 0 && (
                   <span className="text-[9px] text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-inner font-black italic uppercase tracking-tighter">
                     {unreadActiveMailboxMessagesCount} NOWE
                   </span>
                )}
              </div>
              
               <div className="h-[700px] overflow-y-auto custom-scrollbar p-5 space-y-2.5">
                 {activeMailboxMessages.length > 0 ? (
                   activeMailboxMessages.map(mail => (
                    <div 
                      key={mail.id}
                      onClick={() => setSelectedMail(mail)}
                      className={`group relative min-h-[84px] p-4 rounded-[22px] border transition-all cursor-pointer overflow-hidden shadow-lg
                        ${mail.isRead ? 'bg-white/[0.025] border-white/[0.05] opacity-65' : 'bg-white/[0.055] border-white/[0.10] hover:border-white/20 hover:bg-white/[0.085]'}
                      `}
                    >
                       <svg className="absolute inset-0 h-full w-full opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                         <path d="M2 25 C28 11 71 11 98 26" fill="none" stroke={mail.isRead ? '#ffffff' : clubPrimary} strokeOpacity="0.20" strokeWidth="0.6" strokeDasharray="5 5" />
                         <path d="M4 96 H96" stroke={mail.isRead ? '#ffffff' : clubPrimary} strokeOpacity="0.20" strokeWidth="0.8" />
                       </svg>
                       <div className="absolute right-[-18px] bottom-[-24px] text-7xl opacity-[0.025] rotate-12 group-hover:rotate-0 transition-transform">
                         {getMailIcon(mail.type)}
                       </div>
                       <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-xl border shrink-0 shadow-inner group-hover:scale-105 transition-transform ${getMailColor(mail.type)}`}>
                             {getMailIcon(mail.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-center gap-4 mb-1">
                                <span className={`text-[9px] truncate font-black italic uppercase tracking-tighter ${mail.isRead ? 'text-slate-500' : 'text-blue-300'}`}>
                                   {mail.sender.toUpperCase()}
                                </span>
                                <span className="text-[8px] text-slate-600 shrink-0 font-black italic uppercase tracking-tighter">
                                   {mail.date.toLocaleDateString()}
                                </span>
                             </div>
                             <h4 className={`text-sm text-white mb-1 truncate font-black italic uppercase tracking-tighter ${mail.isRead ? 'opacity-75' : ''}`}>
                                {mail.subject}
                             </h4>
                             <p className="text-[11px] text-slate-400 leading-relaxed font-medium line-clamp-1 italic">
                                {mail.body}
                             </p>
                          </div>
                          {!mail.isRead && (
                             <div className="w-2 h-12 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,1)]" />
                          )}
                       </div>
                    </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
                      <span className="text-6xl mb-4">📭</span>
                      <p className="text-sm text-center font-black italic uppercase tracking-tighter">Twoja skrzynka pocztowa jest obecnie pusta</p>
                   </div>
                 )}
         </div>
           </div> {/* Zamknięcie dla <div className="relative z-10 flex flex-col h-full"> */}
           </Card>
        </div>

        <div className="w-[320px] flex flex-col gap-3 shrink-0 rounded-[28px] border border-white/[0.08] bg-slate-950/55 p-3 backdrop-blur-xl shadow-[0_24px_65px_rgba(0,0,0,0.48)]">
          <div className="flex flex-col overflow-hidden rounded-[20px] border border-white/[0.06] bg-black/20">
            <div className="px-3 py-2 border-b border-white/[0.06] shrink-0">
              <span className="text-[10px] font-black italic uppercase tracking-tighter text-emerald-300/80 block text-center">Tabela ligowa</span>
            </div>
            <div className="grid grid-cols-[22px_1fr_28px_36px_36px] gap-x-1 px-2 py-1 border-b border-white/[0.04] shrink-0">
              <span className="text-[9px] font-black text-slate-600 text-center">#</span>
              <span className="text-[9px] font-black text-slate-600">Klub</span>
              <span className="text-[9px] font-black text-slate-600 text-center">M</span>
              <span className="text-[9px] font-black text-slate-600 text-center">+/-</span>
              <span className="text-[9px] font-black text-slate-600 text-center">PKT</span>
            </div>
            <div>
              {(() => {
                const lid = myClub?.leagueId ?? '';
                const seps: { afterIdx: number; color: string }[] =
                  lid === 'L_PL_1'
                    ? [{ afterIdx: 0, color: '#facc15' }, { afterIdx: 14, color: '#f87171' }]
                    : lid === 'L_PL_2'
                    ? [{ afterIdx: 1, color: '#60a5fa' }, { afterIdx: 5, color: '#60a5fa' }, { afterIdx: 14, color: '#f87171' }]
                    : lid === 'L_PL_3'
                    ? [{ afterIdx: 1, color: '#60a5fa' }, { afterIdx: 5, color: '#60a5fa' }, { afterIdx: 11, color: '#60a5fa' }, { afterIdx: 13, color: '#f87171' }]
                    : [];
                return sortedLeague.map((club, idx) => {
                  const isUser = club.id === userTeamId;
                  const gd = club.stats.goalDifference;
                  const sep = seps.find(s => s.afterIdx === idx);
                  return (
                    <React.Fragment key={club.id}>
                      <div className={`grid grid-cols-[22px_1fr_28px_36px_36px] gap-x-1 px-2 py-1 items-center border-b border-white/[0.03] ${isUser ? 'bg-emerald-500/15 border-l-2 border-l-emerald-400' : ''}`}>
                        <span className="text-[9px] font-black text-slate-500 text-center">{idx + 1}</span>
                        <div className="flex items-center gap-1 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: club.colorsHex[0] }} />
                          <span className={`text-[10px] font-black italic uppercase truncate ${isUser ? 'text-emerald-300' : 'text-white/80'}`}>{(() => { const p = club.name.split(' '); return p.length > 1 ? `${p[0]} ${p[1].slice(0, 3)}` : p[0]; })()}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 text-center">{club.stats.played}</span>
                        <span className={`text-[9px] font-black text-center ${gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-slate-400'}`}>{gd > 0 ? `+${gd}` : gd}</span>
                        <span className={`text-[11px] font-black text-center ${isUser ? 'text-emerald-300' : 'text-white'}`}>{club.stats.points}</span>
                      </div>
                      {sep && (
                        <div className="h-px mx-2 my-0.5 rounded-full" style={{ backgroundColor: sep.color, opacity: 0.35 }} />
                      )}
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          </div>
          <div className="rounded-[18px] border border-yellow-400/[0.12] bg-slate-800/30 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/[0.06]">
              <span className="text-[10px] font-black italic uppercase tracking-tighter text-yellow-400/90 block text-center">Ostatnie mecze</span>
            </div>
            <div>
              {lastMatches.length === 0 ? (
                <div className="text-[9px] text-slate-600 italic text-center py-3">Brak rozegranych meczów</div>
              ) : lastMatches.map((m) => {
                const isHome = m.homeTeamId === userTeamId;
                const userGoals = isHome ? m.homeScore : m.awayScore;
                const oppGoals = isHome ? m.awayScore : m.homeScore;
                const oppId = isHome ? m.awayTeamId : m.homeTeamId;
                const oppClub = clubs.find(c => c.id === oppId);
                const oppName = oppClub?.name ?? oppId;
                const oppDisplay = oppName;
                const d = new Date(m.date);
                const dateStr = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}`;
                let result: 'W' | 'R' | 'P';
                let rowCls: string;
                let bgCls: string;
                if (userGoals > oppGoals) { result = 'W'; rowCls = 'text-emerald-400'; bgCls = 'bg-emerald-500/[0.08]'; }
                else if (userGoals < oppGoals) { result = 'P'; rowCls = 'text-red-400'; bgCls = 'bg-red-500/[0.08]'; }
                else { result = 'R'; rowCls = 'text-white/70'; bgCls = ''; }
                return (
                  <div key={m.matchId} className={`grid grid-cols-[44px_14px_1fr_32px] items-center gap-1 px-3 py-0.5 border-b border-white/[0.03] ${rowCls} ${bgCls}`}>
                    <span className="text-[9px] font-black italic text-slate-500">{dateStr}</span>
                    <span className="text-[9px] font-black italic">({result})</span>
                    <span className="text-[9px] font-black italic uppercase truncate">{oppDisplay}</span>
                    <span className="text-[9px] font-black italic text-right">{userGoals}-{oppGoals}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 mt-auto">
            <div className="flex-1 min-w-0">
              <DashboardSvgButton
                label="Rezygnacja"
                icon="resign"
                tone="#f59e0b"
                onClick={() => !isResigned && setShowResignConfirm(true)}
                disabled={isResigned}
              />
            </div>
            <div className="flex-1 min-w-0">
              <DashboardSvgButton
                label="Zakończ grę"
                icon="exit"
                tone="#ef4444"
                onClick={() => setShowExitConfirm(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.1); } }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
        @keyframes dashboard-signal-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -32; } }
        .group:hover .dashboard-action-signal { animation: dashboard-signal-flow 1.2s linear infinite; }
        @keyframes separator-scan-kf { 0% { left: -34%; } 100% { left: 120%; } }
        .separator-scan { position: absolute; top: 0; bottom: 0; width: 34%; animation: separator-scan-kf 2.6s ease-in-out infinite; }
      `}</style>

      {showResignConfirm && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 flex flex-col items-center gap-6 shadow-2xl w-80">
            <span className="text-4xl">🏳️</span>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest text-white mb-2">REZYGNACJA Z KLUBU</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Ta decyzja jest nieodwracalna</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setShowResignConfirm(false)}
                className="flex-1 py-3 rounded-[20px] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all">
                ANULUJ
              </button>
              <button onClick={() => { resignFromClub(); setShowResignConfirm(false); }}
                className="flex-1 py-3 rounded-[20px] bg-amber-600 border border-amber-400 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-500 transition-all">
                REZYGNUJĘ
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 flex flex-col items-center gap-6 shadow-2xl w-80">
            <span className="text-4xl">🚪</span>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest text-white mb-2">WYJŚCIE Z GRY</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Niezapisany postęp zostanie utracony</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-[20px] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all">
                ANULUJ
              </button>
              <button onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-[20px] bg-red-600 border border-red-400 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-500 transition-all">
                WYJDŹ
              </button>
            </div>
          </div>
        </div>
      )}

      {seasonCelebration && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85" onClick={clearSeasonCelebration}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img
              src={seasonCelebration === 'championship' ? winnerPolishImg : seasonCelebration === 'promotion-ekst' ? awansEkstImg : awans1LigiImg}
              alt="Obwieszczenie sezonu"
              className="max-w-[520px] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={clearSeasonCelebration}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white text-xl font-black flex items-center justify-center hover:bg-black/90 transition-colors"
            >✕</button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
