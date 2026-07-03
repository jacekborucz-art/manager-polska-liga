
import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PlayerPosition, ViewState } from '../../types';
import type { Player } from '../../types';
import { FinanceService } from '../../services/FinanceService';
import { MailService } from '../../services/MailService';
import { PlayerCareerService } from '../../services/PlayerCareerService';
import { SportingDirectorService } from '../../services/SportingDirectorService';
import { PlayerContractMindflowService, ContractMindsetState } from '../../services/PlayerContractMindflowService';
import { PlayerMoraleService } from '../../services/PlayerMoraleService';
import {
  BoardYouthContractService,
  YouthStage,
  YouthStage1Result,
  YouthQuizSession,
  YouthQuizResult,
} from '../../services/BoardYouthContractService';

const MINDSET_LABELS: Record<ContractMindsetState, string> = {
  SUPER_HAPPY: 'BARDZO SZCZĘŚLIWY',
  HAPPY_TO_STAY: 'CHCE ZOSTAĆ',
  OPEN_TO_RENEWAL: 'OTWARTY NA ROZMOWY',
  EXPECTING_BETTER_TERMS: 'OCZEKUJE LEPSZYCH WARUNKÓW',
  LOSING_PATIENCE: 'TRACI CIERPLIWOŚĆ',
  TESTING_MARKET: 'SONDUJE RYNEK',
  READY_TO_LEAVE: 'GOTÓW ODEJŚĆ',
  PRECONTRACT_READY: 'GOTÓW NA PREKONTRAKT',
};

export const ContractManagementView: React.FC = () => {
  const {
    viewedPlayerId, players, reserves, clubs, navigateTo, coaches,
    currentDate, setPlayers, setReserves, setClubs, lineups, updateLineup, setMessages, addFinanceLog, contractManagementInitialMode
  } = useGame();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [boardDecision, setBoardDecision] = useState<{status: string, reason: string, woz: number} | null>(null);

  const [managementMode, setManagementMode] = useState<'RELEASE' | 'NEGOTIATE'>(contractManagementInitialMode);
  const [salaryStep, setSalaryStep] = useState(5000);
  const [bonusStep, setBonusStep] = useState(5000);
  const [offerSalary, setOfferSalary] = useState(0);
  const [offerBonus, setOfferBonus] = useState(0);
  const [offerGoalBonus, setOfferGoalBonus] = useState(0);
  const [offerAssistBonus, setOfferAssistBonus] = useState(0);
  const [offerCleanSheetBonus, setOfferCleanSheetBonus] = useState(0);
  const [goalBonusEnabled, setGoalBonusEnabled] = useState(true);
  const [assistBonusEnabled, setAssistBonusEnabled] = useState(true);
  const [cleanSheetBonusEnabled, setCleanSheetBonusEnabled] = useState(true);
  const [offerYears, setOfferYears] = useState(1);
  const [negotiationMessage, setNegotiationMessage] = useState<string | null>(null);
  const [counterOffer, setCounterOffer] = useState<{
    salary: number;
    bonus: number;
    goalBonus?: number;
    assistBonus?: number;
    cleanSheetBonus?: number;
  } | null>(null);
  const [isOfferSent, setIsOfferSent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [renewalVeto, setRenewalVeto] = useState<string | null>(null);

  const [youthStage, setYouthStage] = useState<YouthStage>(null);
  const [youthStage1Result, setYouthStage1Result] = useState<YouthStage1Result | null>(null);
  const [youthInterviewSession, setYouthInterviewSession] = useState<YouthQuizSession | null>(null);
  const [youthInterviewResult, setYouthInterviewResult] = useState<YouthQuizResult | null>(null);
  const [pendingOfferSquad, setPendingOfferSquad] = useState<Player[] | null>(null);

  const data = useMemo(() => {
    if (!viewedPlayerId) return null;
    for (const clubId in players) {
      const player = players[clubId].find(p => p.id === viewedPlayerId);
      if (player) return { player, club: clubs.find(c => c.id === clubId)!, isReserve: false };
    }
    const reservePlayer = reserves.find(p => p.id === viewedPlayerId);
    if (reservePlayer) {
      const club = clubs.find(c => c.id === reservePlayer.clubId);
      if (club) return { player: reservePlayer, club, isReserve: true };
    }
    return null;
  }, [viewedPlayerId, players, reserves, clubs]);

  // FIX: Dependency changed to viewedPlayerId to prevent reset on state update
  React.useEffect(() => {
    if (data?.player) {
      setManagementMode(contractManagementInitialMode);
      const rememberedRaise = data.player.contractRaiseRequest;
      setOfferSalary(rememberedRaise?.salary ?? data.player.annualSalary);
      setOfferBonus(rememberedRaise?.bonus ?? 0);
      setOfferGoalBonus(data.player.goalBonus ?? 0);
      setOfferAssistBonus(data.player.assistBonus ?? 0);
      setOfferCleanSheetBonus(data.player.cleanSheetBonus ?? 0);
      setGoalBonusEnabled(!!data.player.goalBonus);
      setAssistBonusEnabled(!!data.player.assistBonus);
      setCleanSheetBonusEnabled(!!data.player.cleanSheetBonus);
      setOfferYears(rememberedRaise?.years ?? 1);
      setNegotiationMessage(null);
      setCounterOffer(null);
      setIsOfferSent(false);
      setShowSuccessModal(false);
      setRenewalVeto(null);
    }
  }, [viewedPlayerId, contractManagementInitialMode]);

  if (!data) return null;
  const { player, club, isReserve } = data;
  const returnTarget = isReserve ? ViewState.RESERVES_VIEW : ViewState.SQUAD_VIEW;

  const squad = isReserve ? reserves : (players[club.id] || []);
  const penaltyAmount = Math.floor(player.annualSalary * 0.4);
  const isSquadTooSmall = squad.length <= 24;

  const updateContractPlayer = (updater: (player: Player) => Player) => {
    if (isReserve) {
      setReserves(prev => prev.map(p => p.id === player.id ? updater(p) : p));
      return;
    }

    setPlayers(prev => ({
      ...prev,
      [club.id]: (prev[club.id] || []).map(p => p.id === player.id ? updater(p) : p)
    }));
  };

  const isLocked = player.boardLockoutUntil && new Date(currentDate) < new Date(player.boardLockoutUntil);
  const lockDateLabel = player.boardLockoutUntil ? new Date(player.boardLockoutUntil).toLocaleDateString('pl-PL') : "";
  const pendingTransferClub = player.transferPendingClubId
    ? clubs.find(c => c.id === player.transferPendingClubId)
    : null;
  const hasPendingTransfer = !!player.transferPendingClubId && !!player.transferReportDate;
  const pendingTransferFeeLabel = player.transferPendingFee === 0
    ? 'wolny transfer po wygaśnięciu kontraktu'
    : player.transferPendingFee
      ? `kwota transferu: ${player.transferPendingFee.toLocaleString('pl-PL')} PLN`
      : 'transfer uzgodniony';
  const contractMindflow = useMemo(() => {
    const interestedClubs = (player.interestedClubs || [])
      .map(clubId => clubs.find(candidate => candidate.id === clubId))
      .filter((candidate): candidate is typeof clubs[number] => !!candidate);

    return PlayerContractMindflowService.evaluate({
      player,
      currentClub: club,
      currentSquad: squad,
      currentDate,
      interestedClubs,
    });
  }, [player, club, squad, currentDate, clubs]);
  const isGoalBonusApplicable = player.position === PlayerPosition.FWD || player.position === PlayerPosition.MID;
  const isAssistBonusApplicable = player.position === PlayerPosition.FWD || player.position === PlayerPosition.MID;
  const isCleanSheetBonusApplicable = player.position === PlayerPosition.GK;
  const submittedGoalBonus = isGoalBonusApplicable && goalBonusEnabled ? offerGoalBonus : undefined;
  const submittedAssistBonus = isAssistBonusApplicable && assistBonusEnabled ? offerAssistBonus : undefined;
  const submittedCleanSheetBonus = isCleanSheetBonusApplicable && cleanSheetBonusEnabled ? offerCleanSheetBonus : undefined;
  const expectedGoalBonus = contractMindflow.contractExpectations.expectedGoalBonus;
  const expectedAssistBonus = contractMindflow.contractExpectations.expectedAssistBonus;
  const expectedCleanSheetBonus = contractMindflow.contractExpectations.expectedCleanSheetBonus;
  const goalBonusMax = Math.max(25_000, expectedGoalBonus * 2, offerGoalBonus);
  const assistBonusMax = Math.max(18_000, expectedAssistBonus * 2, offerAssistBonus);
  const cleanSheetBonusMax = Math.max(25_000, expectedCleanSheetBonus * 2, offerCleanSheetBonus);

  React.useEffect(() => {
    if (!data?.player) return;
    const expectations = contractMindflow.contractExpectations;
    if (data.player.position === PlayerPosition.GK) {
      setOfferCleanSheetBonus(data.player.cleanSheetBonus ?? expectations.expectedCleanSheetBonus);
      setCleanSheetBonusEnabled((data.player.cleanSheetBonus ?? expectations.expectedCleanSheetBonus) > 0);
      setOfferGoalBonus(0);
      setOfferAssistBonus(0);
      setGoalBonusEnabled(false);
      setAssistBonusEnabled(false);
      return;
    }
    if (data.player.position === PlayerPosition.DEF) {
      setOfferGoalBonus(0);
      setOfferAssistBonus(0);
      setOfferCleanSheetBonus(0);
      setGoalBonusEnabled(false);
      setAssistBonusEnabled(false);
      setCleanSheetBonusEnabled(false);
      return;
    }
    setOfferGoalBonus(data.player.goalBonus ?? expectations.expectedGoalBonus);
    setOfferAssistBonus(data.player.assistBonus ?? expectations.expectedAssistBonus);
    setOfferCleanSheetBonus(0);
    setGoalBonusEnabled((data.player.goalBonus ?? expectations.expectedGoalBonus) > 0);
    setAssistBonusEnabled((data.player.assistBonus ?? expectations.expectedAssistBonus) > 0);
    setCleanSheetBonusEnabled(false);
  }, [viewedPlayerId, contractMindflow.contractExpectations, data?.player]);
  const directorRenewalAdvisory = useMemo(() => {
    if (!club.sportingDirector || managementMode !== 'NEGOTIATE') return [];
    return SportingDirectorService.getContractRenewalAdvisory({
      club,
      player,
      squad,
      salary: offerSalary,
      years: offerYears,
    });
  }, [club, player, squad, managementMode, offerSalary, offerYears]);

  const requestBoardApproval = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const decision = FinanceService.evaluateReleaseRequest(player, club, squad);
      setBoardDecision(decision);
      setIsProcessing(false);
      
      const boardMail = MailService.generateBoardDecisionMail(player, club, decision);
      setMessages(prev => [boardMail, ...prev]);

      if (decision.status === 'VETO') {
        setClubs(prev => prev.map(c => c.id === club.id ? { ...c, reputation: Math.max(1, c.reputation - 0.2) } : c));
      }
      
      if (decision.status === 'SOFT_BLOCK' || decision.status === 'VETO') {
        const lockoutDate = new Date(currentDate);
        lockoutDate.setMonth(lockoutDate.getMonth() + (decision.status === 'VETO' ? 6 : 3));
        
        updateContractPlayer(p => ({ ...p, boardLockoutUntil: lockoutDate.toISOString() }));
      }
    }, 1500);
  };

  const handleSendOffer = () => {
    if (!data) return;
    const { player, club } = data;

    setIsProcessing(true);
    setNegotiationMessage(null);

    setTimeout(() => {
      // VETO ZARZĄDU przy przedłużeniu kontraktu
      const squad = isReserve ? reserves : (players[club.id] || []);
      const hasExceptionalContractApproval = (club.boardExceptionalContractApprovals ?? 0) > 0;

      // --- SYSTEM AWANSU MŁODEGO ZAWODNIKA ---
      const isYouthPromotion = !hasExceptionalContractApproval
        && player.age <= 21
        && player.annualSalary < 150_000
        && offerSalary > player.annualSalary * 2;

      if (isYouthPromotion) {
        const coachExperience = club.coachId ? (coaches[club.coachId]?.attributes.experience ?? 10) : 10;
        const stage1 = BoardYouthContractService.evaluateYouthInvestmentWorthiness(player, squad, club, coachExperience);

        setIsProcessing(false);
        setPendingOfferSquad(squad);
        setYouthStage1Result(stage1);

        if (!stage1.worthInvesting) {
          const lockoutDate = new Date(currentDate);
          lockoutDate.setMonth(lockoutDate.getMonth() + 6);
          updateContractPlayer(p => ({ ...p, boardYouthContractLockoutUntil: lockoutDate.toISOString() }));
          setYouthStage('STAGE1_REJECT');
        } else {
          setYouthStage('STAGE1_PASSED');
        }
        return;
      }

      if (!hasExceptionalContractApproval) {
        const directorCheck = club.sportingDirector
          ? SportingDirectorService.evaluateContractRenewalDecision({
              club,
              player,
              squad,
              salary: offerSalary,
              years: offerYears,
              bonus: offerBonus,
            })
          : { blocked: false, reason: '' };
        if (directorCheck.blocked) {
          setIsProcessing(false);
          setRenewalVeto(directorCheck.reason);
          return;
        }
        const boardCheck = FinanceService.evaluateRenewalBoardDecision(player, offerSalary, offerBonus, squad, club);
        if (!boardCheck.approved) {
          setIsProcessing(false);
          setRenewalVeto(boardCheck.reason);
          return;
        }
      }

      setIsOfferSent(true);

      const freshMindflow = PlayerContractMindflowService.evaluate({
        player,
        currentClub: club,
        currentSquad: squad,
        currentDate,
        interestedClubs: (player.interestedClubs || [])
          .map(clubId => clubs.find(candidate => candidate.id === clubId))
          .filter((candidate): candidate is typeof clubs[number] => !!candidate),
      });
      const mindflowDecision = PlayerContractMindflowService.evaluateRenewalOffer(freshMindflow, {
        salary: offerSalary,
        bonus: offerBonus,
        years: offerYears,
        goalBonus: submittedGoalBonus,
        assistBonus: submittedAssistBonus,
        cleanSheetBonus: submittedCleanSheetBonus,
      });

      if (!mindflowDecision.accepted) {
        const nextStep = (player.negotiationStep || 0) + 1;
        let lockoutDateStr: string | null = null;

        if (!mindflowDecision.demands || nextStep >= 3) {
          const d = new Date(currentDate);
          d.setDate(d.getDate() + 14);
          lockoutDateStr = d.toISOString();
        }

        updateContractPlayer(p => ({
            ...p,
            negotiationStep: nextStep,
            negotiationLockoutUntil: lockoutDateStr,
            isNegotiationPermanentBlocked: mindflowDecision.offerQuality === 'INSULTING' && nextStep >= 2
              ? true
              : p.isNegotiationPermanentBlocked,
            isUntouchable: mindflowDecision.offerQuality === 'INSULTING' && nextStep >= 2
              ? false
              : p.isUntouchable
          }));

        setCounterOffer(nextStep >= 3 ? null : mindflowDecision.demands);
        setNegotiationMessage(nextStep >= 3
          ? "Chyba się jednak nie dogadamy. Próbowaliśmy kilka razy, ale Twoje oferty są nieakceptowalne. Do widzenia."
          : mindflowDecision.reason);
        setIsProcessing(false);
        return;
      }

      const playerDemand = FinanceService.calculatePlayerBonusDemand(player, offerSalary, club.reputation);

      if (FinanceService.isOfferInsulting(offerBonus, playerDemand)) {
        updateContractPlayer(p => ({ ...p, isNegotiationPermanentBlocked: true, isUntouchable: false }));
        setNegotiationMessage("Nie traktujecie mnie powaznie wiec nie będziemy o niczym rozmawiac. Do widzenia!");
        setCounterOffer(null);
        setIsProcessing(false);
        return;
      }

      const newEndDate = new Date(currentDate.getFullYear() + offerYears, 5, 30).toISOString();
      const decision = FinanceService.evaluateContractLogic(
        player, 
        offerSalary, 
        offerBonus, 
        newEndDate, 
        currentDate, 
        club.reputation,
        FinanceService.getClubTier(club)
      );

      setCounterOffer(decision.demands);

      if (decision.accepted) {
        const lockoutDate = new Date(currentDate);
        lockoutDate.setMonth(lockoutDate.getMonth() + 6);

        updateContractPlayer(p => ({ 
            ...PlayerMoraleService.applyContractSigningMindflowReset(p, currentDate),
            annualSalary: offerSalary, 
            contractEndDate: newEndDate,
            goalBonus: submittedGoalBonus,
            assistBonus: submittedAssistBonus,
            cleanSheetBonus: submittedCleanSheetBonus,
            negotiationStep: 0,
            contractLockoutUntil: lockoutDate.toISOString() 
          }));
        setClubs(prev => prev.map(c => c.id === club.id ? { 
          ...c, 
          budget: c.budget - offerBonus,
          signingBonusPool: Math.max(0, c.signingBonusPool - offerBonus),
          boardExceptionalContractApprovals: hasExceptionalContractApproval
            ? Math.max(0, (c.boardExceptionalContractApprovals ?? 0) - 1)
            : c.boardExceptionalContractApprovals
        } : c));
        
        setNegotiationMessage(decision.reason);
        setShowSuccessModal(true);
      } else {
        const nextStep = (player.negotiationStep || 0) + 1;
        
        let lockoutDateStr: string | null = null;
        if (!decision.demands || nextStep >= 3) {
          const d = new Date(currentDate);
          d.setDate(d.getDate() + 14);
          lockoutDateStr = d.toISOString();
        }
        const permanentBreakdown = !decision.demands || nextStep >= 3;

        updateContractPlayer(p => ({ 
            ...p, 
            negotiationStep: nextStep,
            negotiationLockoutUntil: lockoutDateStr,
            isNegotiationPermanentBlocked: permanentBreakdown ? true : p.isNegotiationPermanentBlocked,
            isUntouchable: permanentBreakdown ? false : p.isUntouchable
          }));

        if (nextStep >= 3) {
          setNegotiationMessage("Chyba się jednak nie dogadamy. Próbowaliśmy kilka razy, ale Twoje oferty są nieakceptowalne. Do widzenia.");
          setCounterOffer(null);
        } else {
          setNegotiationMessage(decision.reason);
        }
      }
      setIsProcessing(false);
    }, 1200);
  };

  const proceedWithYouthApprovedOffer = (squad: Player[]) => {
    if (!data) return;
    const { player, club } = data;
    setYouthStage(null);
    setYouthStage1Result(null);
    setYouthInterviewSession(null);
    setYouthInterviewResult(null);
    setPendingOfferSquad(null);
    setIsProcessing(true);

    setTimeout(() => {
      setIsOfferSent(true);

      const freshMindflow = PlayerContractMindflowService.evaluate({
        player,
        currentClub: club,
        currentSquad: squad,
        currentDate,
        interestedClubs: (player.interestedClubs || [])
          .map(clubId => clubs.find(candidate => candidate.id === clubId))
          .filter((candidate): candidate is typeof clubs[number] => !!candidate),
      });
      const mindflowDecision = PlayerContractMindflowService.evaluateRenewalOffer(freshMindflow, {
        salary: offerSalary,
        bonus: offerBonus,
        years: offerYears,
        goalBonus: submittedGoalBonus,
        assistBonus: submittedAssistBonus,
        cleanSheetBonus: submittedCleanSheetBonus,
      });

      if (!mindflowDecision.accepted) {
        const nextStep = (player.negotiationStep || 0) + 1;
        let lockoutDateStr: string | null = null;
        if (!mindflowDecision.demands || nextStep >= 3) {
          const d = new Date(currentDate);
          d.setDate(d.getDate() + 14);
          lockoutDateStr = d.toISOString();
        }
        updateContractPlayer(p => ({
          ...p,
          negotiationStep: nextStep,
          negotiationLockoutUntil: lockoutDateStr,
          isNegotiationPermanentBlocked: mindflowDecision.offerQuality === 'INSULTING' && nextStep >= 2 ? true : p.isNegotiationPermanentBlocked,
          isUntouchable: mindflowDecision.offerQuality === 'INSULTING' && nextStep >= 2 ? false : p.isUntouchable,
        }));
        setCounterOffer(nextStep >= 3 ? null : mindflowDecision.demands);
        setNegotiationMessage(nextStep >= 3
          ? 'Chyba się jednak nie dogadamy. Próbowaliśmy kilka razy, ale Twoje oferty są nieakceptowalne. Do widzenia.'
          : mindflowDecision.reason);
        setIsProcessing(false);
        return;
      }

      const playerDemand = FinanceService.calculatePlayerBonusDemand(player, offerSalary, club.reputation);
      if (FinanceService.isOfferInsulting(offerBonus, playerDemand)) {
        updateContractPlayer(p => ({ ...p, isNegotiationPermanentBlocked: true, isUntouchable: false }));
        setNegotiationMessage('Nie traktujecie mnie poważnie więc nie będziemy o niczym rozmawiać. Do widzenia!');
        setCounterOffer(null);
        setIsProcessing(false);
        return;
      }

      const newEndDate = new Date(currentDate.getFullYear() + offerYears, 5, 30).toISOString();
      const decision = FinanceService.evaluateContractLogic(
        player, offerSalary, offerBonus, newEndDate, currentDate, club.reputation, FinanceService.getClubTier(club)
      );

      setCounterOffer(decision.demands);

      if (decision.accepted) {
        const lockoutDate = new Date(currentDate);
        lockoutDate.setMonth(lockoutDate.getMonth() + 6);
        updateContractPlayer(p => ({
          ...PlayerMoraleService.applyContractSigningMindflowReset(p, currentDate),
          annualSalary: offerSalary,
          contractEndDate: newEndDate,
          goalBonus: submittedGoalBonus,
          assistBonus: submittedAssistBonus,
          cleanSheetBonus: submittedCleanSheetBonus,
          negotiationStep: 0,
          contractLockoutUntil: lockoutDate.toISOString(),
        }));
        setClubs(prev => prev.map(c => c.id === club.id ? {
          ...c,
          budget: c.budget - offerBonus,
          signingBonusPool: Math.max(0, c.signingBonusPool - offerBonus),
        } : c));
        setNegotiationMessage(decision.reason);
        setShowSuccessModal(true);
      } else {
        const nextStep = (player.negotiationStep || 0) + 1;
        let lockoutDateStr: string | null = null;
        if (!decision.demands || nextStep >= 3) {
          const d = new Date(currentDate);
          d.setDate(d.getDate() + 14);
          lockoutDateStr = d.toISOString();
        }
        const permanentBreakdown = !decision.demands || nextStep >= 3;
        updateContractPlayer(p => ({
          ...p,
          negotiationStep: nextStep,
          negotiationLockoutUntil: lockoutDateStr,
          isNegotiationPermanentBlocked: permanentBreakdown ? true : p.isNegotiationPermanentBlocked,
          isUntouchable: permanentBreakdown ? false : p.isUntouchable,
        }));
        setNegotiationMessage(nextStep >= 3
          ? 'Chyba się jednak nie dogadamy. Próbowaliśmy kilka razy, ale Twoje oferty są nieakceptowalne. Do widzenia.'
          : decision.reason);
        if (nextStep >= 3) setCounterOffer(null);
      }
      setIsProcessing(false);
    }, 800);
  };

  const handleYouthInterviewAnswer = (questionId: number, answerId: 'a' | 'b' | 'c') => {
    if (!data || !youthInterviewSession) return;
    const { player, club } = data;
    const squad = pendingOfferSquad || [];

    const updatedSession = BoardYouthContractService.submitAnswer(youthInterviewSession, questionId, answerId);
    setYouthInterviewSession(updatedSession);

    if (updatedSession.isComplete) {
      const quizScore = BoardYouthContractService.calculateQuizScore(updatedSession, player, squad);
      const probability = BoardYouthContractService.calculateApprovalProbability(player, squad, club, quizScore, updatedSession.profile);
      const approved = probability >= 55;
      const ownerMessage = BoardYouthContractService.buildOwnerMessage(approved, probability, updatedSession.profile);
      const result: YouthQuizResult = {
        quizScore,
        scoreLabel: BoardYouthContractService.getScoreLabel(quizScore),
        profile: updatedSession.profile,
        approved,
        approvalProbability: probability,
        ownerMessage,
      };
      setYouthInterviewResult(result);

      if (!approved) {
        const lockoutDate = new Date(currentDate);
        lockoutDate.setMonth(lockoutDate.getMonth() + 6);
        updateContractPlayer(p => ({ ...p, boardYouthContractLockoutUntil: lockoutDate.toISOString() }));
        setYouthStage('INTERVIEW_REJECTED');
      } else {
        setYouthStage('INTERVIEW_APPROVED');
      }
    }
  };

  const handleReleasePlayer = () => {
    if (!boardDecision || (boardDecision.status !== 'APPROVED' && boardDecision.status !== 'WARNING')) return;

    const previousBudget = club.budget; // Saldo PRZED zmianą
    setClubs(prev => prev.map(c => c.id === club.id ? { ...c, budget: c.budget - penaltyAmount } : c));
    
    // 💼 Log zwolnienia zawodnika z poprzednim saldem
    addFinanceLog(
      club.id,
      `Zwolnienie: ${player.firstName} ${player.lastName}`,
      -penaltyAmount,
      currentDate,
      previousBudget
    );
    
   const playerToRelease = squad.find(p => p.id === viewedPlayerId)!;
    
    // AKTUALIZACJA HISTORII - TUTAJ WSTAW TEN KOD
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const updatedHistory = PlayerCareerService.movePlayer(
      playerToRelease,
      { clubName: 'BEZ KLUBU', clubId: 'FREE_AGENTS' },
      currentYear,
      currentMonth,
      { clubName: club.name, clubId: club.id }
    );

    const releasedPlayer = { 
      ...PlayerCareerService.resetClubStatsForNewEntry(playerToRelease), 
      clubId: 'FREE_AGENTS', 
      annualSalary: 0, 
      contractEndDate: '', 
      marketValue: 0,
      negotiationStep: 0,
      isNegotiationPermanentBlocked: false,
      history: updatedHistory // Podpinamy nową historię
    };

    if (isReserve) {
      setReserves(prev => prev.filter(p => p.id !== viewedPlayerId));
      setPlayers(prev => ({
        ...prev,
        'FREE_AGENTS': [...(prev['FREE_AGENTS'] || []), releasedPlayer]
      }));
    } else {
      setPlayers(prev => ({
        ...prev,
        [club.id]: (prev[club.id] || []).filter(p => p.id !== viewedPlayerId),
        'FREE_AGENTS': [...(prev['FREE_AGENTS'] || []), releasedPlayer]
      }));
    }

    if (lineups[club.id]) {
      const old = lineups[club.id];
      updateLineup(club.id, {
        ...old,
        startingXI: old.startingXI.map(id => id === viewedPlayerId ? null : id),
        bench: old.bench.filter(id => id !== viewedPlayerId),
        reserves: old.reserves.filter(id => id !== viewedPlayerId)
      });
    }
    navigateTo(returnTarget);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
      case 'WARNING': return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
      case 'SOFT_BLOCK': return 'text-orange-500 border-orange-500/30 bg-orange-500/5';
      case 'VETO': return 'text-red-500 border-red-500/30 bg-red-500/5';
      default: return 'text-slate-400 border-white/10';
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950/35 flex items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[110px] opacity-[0.07] bg-blue-600" />
        <div className="absolute inset-0 bg-[url('https://i.ibb.co/JwgrBtvC/biuro2-1.png')] bg-cover bg-center opacity-42 brightness-110" />
      </div>

      <div className="max-w-5xl w-full bg-slate-900/72 border border-white/8 rounded-[50px] backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden flex flex-col h-[96vh]">
        
        <div className="p-10 border-b border-white/5 bg-white/[0.035] flex justify-between items-center shrink-0">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-black/40 flex items-center justify-center text-3xl shadow-inner">🏛️</div>
              <div>
                 <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Panel Kontraktowy • {club.name}</span>
                 <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mt-1">{player.firstName} {player.lastName}</h2>
              </div>
           </div>
           <button 
             onClick={() => navigateTo(returnTarget)} 
             className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all active:scale-95 shadow-lg"
           >
             Powrót do kadry
           </button>
        </div>

        <div className="flex-1 p-10 flex gap-10 overflow-hidden">
           <div className="w-80 space-y-6 shrink-0">
              <div className="p-8 bg-black/40 rounded-[40px] border border-white/5 text-center relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50" />
                 <span className="text-[8px] font-black text-slate-500 uppercase block mb-4 tracking-[0.3em]">AKTUALNE WARUNKI</span>
                 <h3 className="text-2xl font-black text-white uppercase italic leading-tight">{player.lastName}</h3>
                 <p className="text-[10px] font-bold text-slate-400 mt-1">{player.overallRating} OVR • {player.age} lat</p>
                 <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-slate-600 uppercase">Pensja:</span>
                       <span className="text-xs font-black text-emerald-400 font-mono">{player.annualSalary.toLocaleString()} PLN</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-slate-600 uppercase">Wygasa:</span>
                       <span className="text-xs font-black text-white italic">{new Date(player.contractEndDate).getFullYear()}</span>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-black/40 rounded-[40px] border border-white/5 shadow-lg">
                 <span className="text-[8px] font-black text-slate-500 uppercase block mb-2 tracking-widest">BUDŻET KLUBU</span>
                 <span className="text-xl font-black text-emerald-400 font-mono italic tabular-nums">{club.budget.toLocaleString()} <span className="text-[10px] opacity-50">PLN</span></span>
              </div>

              <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl text-center">
                 <p className="text-[9px] text-slate-500 font-medium italic leading-relaxed">
                   "W negocjacjach liczy się cierpliwość. Zawodnik po 3 odrzuconych ofertach zakończy rozmowy na dłuższy czas."
                 </p>
              </div>
           </div>

           <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 shrink-0">
                 <button 
                    onClick={() => { setManagementMode('NEGOTIATE'); setBoardDecision(null); }}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${managementMode === 'NEGOTIATE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                 >
                    NEGOCJUJ KONTRAKT
                 </button>
                 <button 
                    onClick={() => setManagementMode('RELEASE')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${managementMode === 'RELEASE' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                 >
                    ROZWIĄŻ UMOWĘ
                 </button>
              </div>

              {managementMode === 'RELEASE' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-white/5 rounded-[50px] text-center gap-8">
                   {!boardDecision ? (
                      isLocked ? (
                        <div className="space-y-4 animate-pulse">
                           <div className="text-6xl">⏳</div>
                           <h4 className="text-2xl font-black text-red-500 uppercase italic">Zablokowane</h4>
                           <p className="text-sm text-slate-500">Zarząd odrzucił poprzedni wniosek. Spróbuj ponownie po {lockDateLabel}.</p>
                        </div>
                      ) : (
                        <>
                           <div className="text-5xl">📄</div>
                           <div className="max-w-md">
                              <h4 className="text-2xl font-black text-white uppercase italic">Wniosek do Zarządu</h4>
                              <p className="text-sm text-slate-400 mt-2">Rozwiązanie kontraktu kosztuje 40% rocznej pensji: <b>{penaltyAmount.toLocaleString()} PLN</b>.</p>
                           </div>
                           {isSquadTooSmall ? (
                              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase">
                                 Blokada: Minimalna kadra (24 zawodników)
                              </div>
                           ) : (
                              <button onClick={requestBoardApproval} disabled={isProcessing} className="px-16 py-6 rounded-[30px] bg-red-600 hover:bg-red-500 text-white font-black italic uppercase text-lg shadow-2xl border-b-8 border-red-900 transition-all active:scale-95">
                                 {isProcessing ? 'ANALIZA FINANSOWA...' : 'WYŚLIJ PROŚBĘ O ZWOLNIENIE'}
                              </button>
                           )}
                        </>
                      )
                   ) : (
                      <div className={`flex-1 w-full p-8 rounded-[40px] border-2 flex flex-col gap-6 ${getStatusColor(boardDecision.status)}`}>
                         <div className="flex justify-between items-center">
                            <h4 className="text-3xl font-black italic uppercase">{boardDecision.status}</h4>
                            <span className="text-2xl font-black font-mono">{Math.round(boardDecision.woz)}/100</span>
                         </div>
                         <p className="text-lg italic text-white flex-1 flex items-center justify-center">"{boardDecision.reason}"</p>
                         <div className="flex gap-4">
                            <button onClick={() => setBoardDecision(null)} className="flex-1 py-4 rounded-2xl bg-black/20 text-[10px] font-black uppercase">Anuluj</button>
                            {(boardDecision.status === 'APPROVED' || boardDecision.status === 'WARNING') && (
                               <button onClick={handleReleasePlayer} className="flex-[2] py-4 rounded-2xl bg-red-600 text-white font-black uppercase italic border-b-4 border-red-800">POTWIERDŹ ZWOLNIENIE ❌</button>
                            )}
                         </div>
                      </div>
                   )}
                </div>
              ) : (
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[50px] p-8 flex flex-col gap-6 relative overflow-y-auto custom-scrollbar">
                   
                   { hasPendingTransfer && !isOfferSent ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 animate-fade-in py-12">
                         <span className="text-7xl">🚫</span>
                         <h4 className="text-3xl font-black text-amber-400 uppercase italic">Transfer uzgodniony</h4>
                         <p className="text-slate-300 italic text-lg max-w-md">
                            {player.firstName} {player.lastName} podpisał kontrakt z {pendingTransferClub?.name ?? player.transferPendingClubId}
                            {' '}i przechodzi do nich
                            {player.transferReportDate ? ` (${new Date(player.transferReportDate).toLocaleDateString('pl-PL')}).` : '.'}
                            {' '}Szczegóły: {pendingTransferFeeLabel}.
                         </p>
                         <button onClick={() => navigateTo(returnTarget)} className="mt-4 px-10 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">Powrót do kadry</button>
                      </div>
                   ) : (player.isNegotiationPermanentBlocked || (player.negotiationStep || 0) >= 3 || (player.negotiationLockoutUntil && new Date(currentDate) < new Date(player.negotiationLockoutUntil))) && !isOfferSent ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 animate-fade-in py-12">
                         <span className="text-7xl">⛔</span>
                         <h4 className="text-3xl font-black text-red-500 uppercase italic">Rozmowy Wstrzymane</h4>
                         <p className="text-slate-300 italic text-lg max-w-sm">
                            {player.isNegotiationPermanentBlocked 
                               ? "Nie traktujecie mnie powaznie wiec nie będziemy o niczym rozmawiac. Do widzenia!" 
                               : (player.negotiationStep >= 3 
                                  ? "Wykorzystałeś wszystkie próby w tym sezonie." 
                                  : `Zawodnik musi przemyśleć poprzednią ofertę. Powrót do rozmów możliwy po ${new Date(player.negotiationLockoutUntil!).toLocaleDateString()}.`
                               )
                            }
                         </p>
                         <button onClick={() => navigateTo(returnTarget)} className="mt-4 px-10 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">Powrót do kadry</button>
                      </div>
                   ) : (
                      <>
                        <div className="rounded-[28px] border border-blue-500/20 bg-blue-500/5 p-5">
                           <div className="flex items-center justify-between gap-3">
                              <span className="text-[10px] font-black italic uppercase tracking-tighter text-blue-300">Mindflow zawodnika</span>
                              <span className="text-[10px] font-black italic uppercase tracking-tighter text-white bg-blue-500/15 border border-blue-400/20 px-3 py-1 rounded-full">
                                 {MINDSET_LABELS[contractMindflow.mindset.state]}
                              </span>
                           </div>
                           <div className="mt-4 grid grid-cols-4 gap-3">
                              {[
                                 ['Komfort', contractMindflow.currentClubSituation.totalStayComfort],
                                 ['Zaufanie', contractMindflow.mindset.clubTrust],
                                 ['Rynek', contractMindflow.mindset.marketOpenness],
                                 ['Prekontrakt', contractMindflow.mindset.preContractReadiness],
                              ].map(([label, value]) => (
                                 <div key={label} className="rounded-2xl bg-black/25 border border-white/5 px-3 py-2">
                                    <span className="block text-[8px] font-black italic uppercase tracking-tighter text-slate-500">{label}</span>
                                    <span className="text-sm font-black text-white font-mono">{Math.round(Number(value))}/100</span>
                                 </div>
                              ))}
                           </div>
                           <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] text-slate-300">
                              <div className="rounded-2xl bg-black/20 border border-white/5 p-3">
                                 <span className="block font-black italic uppercase tracking-tighter text-slate-500 mb-1">Widełki pensji</span>
                                 <span className="font-black text-emerald-300 font-mono">
                                    {contractMindflow.contractExpectations.minimumSalary.toLocaleString('pl-PL')} - {contractMindflow.contractExpectations.premiumSalary.toLocaleString('pl-PL')} PLN
                                 </span>
                              </div>
                              <div className="rounded-2xl bg-black/20 border border-white/5 p-3">
                                 <span className="block font-black italic uppercase tracking-tighter text-slate-500 mb-1">Oczekiwany kontrakt</span>
                                 <span className="font-black text-white">
                                    {contractMindflow.contractExpectations.preferredYears} lata, rola: {contractMindflow.contractExpectations.expectedRole}
                                 </span>
                              </div>
                           </div>
                           <div className="mt-3 rounded-2xl bg-black/20 border border-white/5 p-3 text-[10px]">
                              <span className="block font-black italic uppercase tracking-tighter text-slate-500 mb-2">Premie oczekiwane przez agenta</span>
                              {player.position === PlayerPosition.GK ? (
                                 <span className="font-black text-violet-300 font-mono">
                                    Czyste konto: {expectedCleanSheetBonus.toLocaleString('pl-PL')} PLN
                                 </span>
                              ) : player.position === PlayerPosition.DEF ? (
                                 <span className="font-black text-slate-400 italic">
                                    Brak premii ofensywnych - dla obrońcy nie są kluczowym warunkiem.
                                 </span>
                              ) : (
                                 <span className="font-black text-white font-mono">
                                    Gol: <span className="text-amber-300">{expectedGoalBonus.toLocaleString('pl-PL')} PLN</span>
                                    <span className="text-slate-600 px-2">/</span>
                                    Asysta: <span className="text-sky-300">{expectedAssistBonus.toLocaleString('pl-PL')} PLN</span>
                                 </span>
                              )}
                           </div>
                           {contractMindflow.mindset.explanation.length > 0 && (
                              <p className="mt-4 text-[11px] text-blue-100/80 italic leading-relaxed">
                                 {contractMindflow.mindset.explanation.slice(0, 2).join(' ')}
                              </p>
                           )}
                        </div>

                        {club.sportingDirector && directorRenewalAdvisory.length > 0 && (
                           <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/5 p-5">
                              <div className="flex items-center justify-between gap-3">
                                 <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.35em]">Glos Dyrektora Sportowego</span>
                                 <span className="text-[10px] font-black text-slate-500 uppercase">Struktura plac</span>
                              </div>
                              <div className="mt-4 space-y-2 text-sm text-amber-100">
                                 {directorRenewalAdvisory.map((note, index) => (
                                    <p key={`${index}_${note}`}>• {note}</p>
                                 ))}
                              </div>
                           </div>
                        )}

                        <div className="flex justify-between items-end shrink-0">
                           <div>
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">OFERTA KONTRAKTOWA</span>
                              <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mt-1">Zaproponuj warunki</h4>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[8px] font-black text-slate-600 uppercase mb-1">PROCES NEGOCJACJI</span>
                              <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                 PRÓBA {player.negotiationStep || 0} / 3
                              </span>
                           </div>
                        </div>

                        <div className="space-y-8 shrink-0">
                           <div className="space-y-2">
                              <div className="flex justify-between items-end px-1">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Długość Nowej Umowy</span>
                                 <span className="text-2xl font-black italic text-white">{offerYears} <span className="text-[11px] text-slate-500">{offerYears === 1 ? 'ROK' : offerYears < 5 ? 'LATA' : 'LAT'}</span></span>
                              </div>
                              <input
                                 type="range" min={1} max={5} step={1}
                                 value={offerYears} onChange={(e) => setOfferYears(parseInt(e.target.value))}
                                 className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
                              />
                              <div className="flex justify-between px-1 pt-0.5">
                                 {[1, 2, 3, 4, 5].map(y => (
                                    <span key={y} className={`text-[8px] font-black italic uppercase tracking-tighter ${offerYears === y ? 'text-white' : 'text-slate-600'}`}>{y}</span>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-2">
                              <div className="flex justify-between items-end px-1">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nowa Pensja Roczna</span>
                                 <div className="text-right">
                                    <span className="text-2xl font-black text-blue-400 font-mono italic">{(Math.round(offerSalary / salaryStep) * salaryStep).toLocaleString('pl-PL')}</span>
                                    <span className="text-[10px] text-slate-600 ml-2 font-black">PLN / ROK</span>
                                 </div>
                              </div>
                              <input
                                 type="range" min={Math.floor(player.annualSalary * 0.5)} max={Math.floor(player.annualSalary * 3)} step={salaryStep}
                                 value={offerSalary} onChange={(e) => setOfferSalary(parseInt(e.target.value))}
                                 className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                              <div className="flex gap-1 pt-1">
                                 {[1000, 2500, 5000, 10000, 100000, 250000, 500000].map(v => (
                                    <button key={v} onClick={() => setSalaryStep(v)}
                                       className={`flex-1 py-1 rounded text-[10px] font-black italic uppercase tracking-tighter border transition-all active:scale-95
                                          ${salaryStep === v ? 'bg-blue-600/40 border-blue-400/60 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                                       {v >= 1000000 ? `${v/1000000}M` : v >= 1000 ? `${v/1000}k` : v}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-2">
                              <div className="flex justify-between items-end px-1">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jednorazowy Bonus za podpis</span>
                                    <span className="text-[8px] font-black text-emerald-500 uppercase mt-1">Dostępna pula: {club.signingBonusPool.toLocaleString('pl-PL')} PLN</span>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-2xl font-black text-emerald-400 font-mono italic">{(Math.round(offerBonus / bonusStep) * bonusStep).toLocaleString('pl-PL')}</span>
                                    <span className="text-[10px] text-slate-600 ml-2 font-black">PLN</span>
                                 </div>
                              </div>
                              <input
                                 type="range" min={0} max={club.signingBonusPool} step={bonusStep}
                                 value={offerBonus} onChange={(e) => setOfferBonus(parseInt(e.target.value))}
                                 className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />
                              <div className="flex gap-1 pt-1">
                                 {[1000, 2500, 5000, 10000, 100000, 250000, 500000].map(v => (
                                    <button key={v} onClick={() => setBonusStep(v)}
                                       className={`flex-1 py-1 rounded text-[10px] font-black italic uppercase tracking-tighter border transition-all active:scale-95
                                          ${bonusStep === v ? 'bg-emerald-600/40 border-emerald-400/60 text-emerald-300' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                                       {v >= 1000000 ? `${v/1000000}M` : v >= 1000 ? `${v/1000}k` : v}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {isCleanSheetBonusApplicable && (
                              <div className="space-y-2 rounded-3xl border border-violet-500/20 bg-violet-500/5 p-4">
                                 <label className="flex items-center justify-between gap-3 cursor-pointer">
                                    <span className="text-[10px] font-black italic uppercase tracking-tighter text-violet-300">Bonus za czyste konto</span>
                                    <span className="flex items-center gap-2 text-[9px] font-black italic uppercase tracking-tighter text-slate-400">
                                       <input
                                          type="checkbox"
                                          checked={cleanSheetBonusEnabled}
                                          onChange={(e) => setCleanSheetBonusEnabled(e.target.checked)}
                                          className="h-4 w-4 accent-violet-500"
                                       />
                                       {cleanSheetBonusEnabled ? 'Włączony' : 'Wyłączony'}
                                    </span>
                                 </label>
                                 {cleanSheetBonusEnabled ? (
                                    <>
                                       <div className="flex justify-between items-end px-1">
                                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Żądanie agenta: {expectedCleanSheetBonus.toLocaleString('pl-PL')} PLN</span>
                                          <span className="text-xl font-black text-violet-300 font-mono italic">{offerCleanSheetBonus.toLocaleString('pl-PL')} PLN</span>
                                       </div>
                                       <input
                                          type="range" min={0} max={cleanSheetBonusMax} step={500}
                                          value={offerCleanSheetBonus} onChange={(e) => setOfferCleanSheetBonus(parseInt(e.target.value))}
                                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                       />
                                    </>
                                 ) : (
                                    <p className="text-[10px] text-slate-500 italic">Premia za czyste konto nie będzie częścią oferty.</p>
                                 )}
                              </div>
                           )}

                           {(isGoalBonusApplicable || isAssistBonusApplicable) && (
                              <div className="grid grid-cols-2 gap-3">
                                 {isGoalBonusApplicable && (
                                    <div className="space-y-2 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4">
                                       <label className="flex items-center justify-between gap-3 cursor-pointer">
                                          <span className="text-[10px] font-black italic uppercase tracking-tighter text-amber-300">Bonus za gola</span>
                                          <input
                                             type="checkbox"
                                             checked={goalBonusEnabled}
                                             onChange={(e) => setGoalBonusEnabled(e.target.checked)}
                                             className="h-4 w-4 accent-amber-500"
                                          />
                                       </label>
                                       {goalBonusEnabled ? (
                                          <>
                                             <div className="flex justify-between items-end px-1">
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Agent: {expectedGoalBonus.toLocaleString('pl-PL')} PLN</span>
                                                <span className="text-lg font-black text-amber-300 font-mono italic">{offerGoalBonus.toLocaleString('pl-PL')}</span>
                                             </div>
                                             <input
                                                type="range" min={0} max={goalBonusMax} step={500}
                                                value={offerGoalBonus} onChange={(e) => setOfferGoalBonus(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                             />
                                          </>
                                       ) : (
                                          <p className="text-[10px] text-slate-500 italic">Bez premii za gole.</p>
                                       )}
                                    </div>
                                 )}
                                 {isAssistBonusApplicable && (
                                    <div className="space-y-2 rounded-3xl border border-sky-500/20 bg-sky-500/5 p-4">
                                       <label className="flex items-center justify-between gap-3 cursor-pointer">
                                          <span className="text-[10px] font-black italic uppercase tracking-tighter text-sky-300">Bonus za asystę</span>
                                          <input
                                             type="checkbox"
                                             checked={assistBonusEnabled}
                                             onChange={(e) => setAssistBonusEnabled(e.target.checked)}
                                             className="h-4 w-4 accent-sky-500"
                                          />
                                       </label>
                                       {assistBonusEnabled ? (
                                          <>
                                             <div className="flex justify-between items-end px-1">
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Agent: {expectedAssistBonus.toLocaleString('pl-PL')} PLN</span>
                                                <span className="text-lg font-black text-sky-300 font-mono italic">{offerAssistBonus.toLocaleString('pl-PL')}</span>
                                             </div>
                                             <input
                                                type="range" min={0} max={assistBonusMax} step={500}
                                                value={offerAssistBonus} onChange={(e) => setOfferAssistBonus(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                             />
                                          </>
                                       ) : (
                                          <p className="text-[10px] text-slate-500 italic">Bez premii za asysty.</p>
                                       )}
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>

                        <div className="mt-4 pb-4">
                           {negotiationMessage && (
                              <div className="space-y-4 mb-6">
                                 <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-sm italic text-slate-200 animate-slide-up flex gap-4 items-start shadow-xl">
                                    <span className="text-2xl">💬</span>
                                    <div className="flex-1">
                                       <p>"{negotiationMessage}"</p>
                                       {isOfferSent && !showSuccessModal && (
                                          <button 
                                             onClick={() => setIsOfferSent(false)}
                                             className="mt-3 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                                          >
                                             &larr; Skoryguj ofertę i spróbuj ponownie
                                          </button>
                                       )}
                                    </div>
                                 </div>
                                 
                                 {counterOffer && (
                                    <div className="p-6 bg-blue-600/10 border border-blue-500/30 rounded-3xl animate-slide-up flex flex-col gap-3 shadow-inner group">
                                       <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Wymagania Agenta:</span>
                                          <button 
                                             onClick={() => {
                                                setOfferSalary(counterOffer.salary);
                                                setOfferBonus(counterOffer.bonus);
                                                if (counterOffer.goalBonus !== undefined) {
                                                   setOfferGoalBonus(counterOffer.goalBonus);
                                                   setGoalBonusEnabled(true);
                                                }
                                                if (counterOffer.assistBonus !== undefined) {
                                                   setOfferAssistBonus(counterOffer.assistBonus);
                                                   setAssistBonusEnabled(true);
                                                }
                                                if (counterOffer.cleanSheetBonus !== undefined) {
                                                   setOfferCleanSheetBonus(counterOffer.cleanSheetBonus);
                                                   setCleanSheetBonusEnabled(true);
                                                }
                                                setIsOfferSent(false);
                                             }}
                                             className="text-[8px] font-black bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 transition-all shadow-lg active:scale-95"
                                          >
                                             ZASTOSUJ ŻĄDANIA AGENTA ✅
                                          </button>
                                       </div>
                                       <div className="flex justify-between items-center">
                                          <div className="flex flex-col">
                                             <span className="text-[8px] text-slate-500 uppercase font-bold">Pensja roczna:</span>
                                             <span className="text-sm font-black text-white font-mono">{counterOffer.salary.toLocaleString()} PLN</span>
                                          </div>
                                          <div className="flex flex-col text-right">
                                             <span className="text-[8px] text-slate-500 uppercase font-bold">Bonus za podpis:</span>
                                             <span className="text-sm font-black text-emerald-400 font-mono">{counterOffer.bonus.toLocaleString()} PLN</span>
                                          </div>
                                       </div>
                                       {(counterOffer.goalBonus || counterOffer.assistBonus || counterOffer.cleanSheetBonus) && (
                                          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                                             {counterOffer.goalBonus ? (
                                                <div className="flex flex-col">
                                                   <span className="text-[8px] text-slate-500 uppercase font-bold">Gol:</span>
                                                   <span className="text-xs font-black text-amber-300 font-mono">{counterOffer.goalBonus.toLocaleString()} PLN</span>
                                                </div>
                                             ) : null}
                                             {counterOffer.assistBonus ? (
                                                <div className="flex flex-col">
                                                   <span className="text-[8px] text-slate-500 uppercase font-bold">Asysta:</span>
                                                   <span className="text-xs font-black text-sky-300 font-mono">{counterOffer.assistBonus.toLocaleString()} PLN</span>
                                                </div>
                                             ) : null}
                                             {counterOffer.cleanSheetBonus ? (
                                                <div className="flex flex-col">
                                                   <span className="text-[8px] text-slate-500 uppercase font-bold">Czyste konto:</span>
                                                   <span className="text-xs font-black text-violet-300 font-mono">{counterOffer.cleanSheetBonus.toLocaleString()} PLN</span>
                                                </div>
                                             ) : null}
                                          </div>
                                       )}
                                       <p className="text-[9px] text-slate-500 italic mt-1">"To są nasze ostateczne warunki w tej turze negocjacji."</p>
                                    </div>
                                 )}
                              </div>
                           )}
                           
                           {/* Przycisk akcji głównej */}
                           { (!isOfferSent || isProcessing) && (
                              <button 
                                 onClick={handleSendOffer} 
                                 disabled={isProcessing || (offerBonus > club.signingBonusPool && club.signingBonusPool > 0)}
                                 className="w-full py-6 rounded-[30px] bg-emerald-600 hover:bg-emerald-500 text-white font-black italic text-xl uppercase tracking-tighter transition-all shadow-2xl border-b-8 border-emerald-900 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30"
                              >
                                 {isProcessing ? 'PRZESYŁANIE OFERTY...' : 'ZŁÓŻ OFERTĘ KONTRAKTOWĄ 📝'}
                              </button>
                           )}

                           { isOfferSent && !isProcessing && !showSuccessModal && (
                              <div className="flex gap-4">
                                 <button 
                                    onClick={() => navigateTo(returnTarget)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
                                 >
                                    Wróć później
                                 </button>
                                 <button 
                                    onClick={() => setIsOfferSent(false)}
                                    className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase italic tracking-tighter shadow-lg border-b-4 border-blue-800 active:scale-95"
                                 >
                                    RENEGOCJUJ WARUNKI ✍️
                                 </button>
                              </div>
                           )}
                        </div>
                      </>
                   )}
                </div>
              )}
           </div>
        </div>

      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-[50px] shadow-[0_0_100px_rgba(16,185,129,0.3)] p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
            <div className="w-28 h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-6xl shadow-2xl animate-bounce">
              🖋️
            </div>
            <div>
              <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">UMOWA PODPISANA!</h3>
              <div className="h-px w-12 bg-emerald-500/50 mx-auto my-4" />
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "{negotiationMessage}"
              </p>
            </div>
            <div className="w-full space-y-3">
              <div className="flex justify-between p-5 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nowa Pensja:</span>
                 <span className="text-sm font-black text-emerald-400 font-mono">{offerSalary.toLocaleString()} PLN</span>
              </div>
              <div className="flex justify-between p-5 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Długość:</span>
                 <span className="text-sm font-black text-white italic">{offerYears} {offerYears === 1 ? 'ROK' : (offerYears < 5 ? 'LATA' : 'LAT')}</span>
              </div>
            </div>
            <button 
              onClick={() => navigateTo(returnTarget)}
              className="w-full py-6 bg-emerald-600 text-white font-black uppercase italic rounded-3xl hover:bg-emerald-500 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.2)] active:scale-95 border-b-8 border-emerald-800 text-xl tracking-tighter"
            >
              POWRÓT DO KADRY 🏁
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 22px; width: 22px; border-radius: 50%; background: #fff; cursor: pointer; border: 4px solid currentColor; box-shadow: 0 0 15px rgba(0,0,0,0.5); }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>

      {renewalVeto && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fade-in p-6">
          <div className="max-w-md w-full p-10 rounded-[40px] border-2 border-red-500 bg-slate-900 shadow-[0_0_100px_rgba(239,68,68,0.2)] text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-5xl shadow-inner">🏛️</div>
            <h3 className="text-2xl font-black uppercase italic text-red-500 tracking-tighter">VETO ZARZĄDU</h3>
            <p className="text-slate-300 italic font-medium leading-relaxed">"{renewalVeto}"</p>
            <button
              onClick={() => setRenewalVeto(null)}
              className="mt-4 w-full py-5 bg-red-600 text-white font-black uppercase rounded-2xl hover:bg-red-500 transition-all shadow-xl border-b-4 border-red-900 active:scale-95"
            >
              SKORYGUJ OFERTĘ
            </button>
          </div>
        </div>
      )}

      {/* YOUTH STAGE1 REJECT */}
      {youthStage === 'STAGE1_REJECT' && youthStage1Result && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-6">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-red-500/60 rounded-[40px] shadow-[0_0_80px_rgba(239,68,68,0.15)] p-10 flex flex-col gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl mx-auto mb-4">🏛️</div>
              <h3 className="text-xl font-black uppercase italic text-red-400 tracking-tighter">ZARZĄD ODMAWIA ROZMÓW</h3>
              <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Brak rekomendacji dla inwestycji</p>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">DYREKTOR SPORTOWY</p>
                <p className="text-slate-300 text-sm italic leading-relaxed">"{youthStage1Result.directorNote}"</p>
              </div>
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">TRENER</p>
                <p className="text-slate-300 text-sm italic leading-relaxed">"{youthStage1Result.coachNote}"</p>
              </div>
            </div>
            <p className="text-slate-500 text-xs text-center">Kolejna rozmowa z zarządem o tym zawodniku możliwa za 6 miesięcy.</p>
            <button
              onClick={() => { setYouthStage(null); setYouthStage1Result(null); }}
              className="w-full py-5 bg-red-600 text-white font-black uppercase rounded-2xl hover:bg-red-500 transition-all shadow-xl border-b-4 border-red-900 active:scale-95"
            >
              ROZUMIEM
            </button>
          </div>
        </div>
      )}

      {/* YOUTH STAGE1 PASSED — pokaż opinie przed decyzją właściciela */}
      {youthStage === 'STAGE1_PASSED' && youthStage1Result && data && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-6">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-cyan-500/40 rounded-[40px] shadow-[0_0_80px_rgba(6,182,212,0.1)] p-10 flex flex-col gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl mx-auto mb-4">📋</div>
              <h3 className="text-xl font-black uppercase italic text-cyan-400 tracking-tighter">OPINIA SZTABU</h3>
              <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Sztab rekomenduje inwestycję</p>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">DYREKTOR SPORTOWY</p>
                <p className="text-slate-300 text-sm italic leading-relaxed">"{youthStage1Result.directorNote}"</p>
              </div>
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">TRENER</p>
                <p className="text-slate-300 text-sm italic leading-relaxed">"{youthStage1Result.coachNote}"</p>
              </div>
            </div>
            <button
              onClick={() => {
                const { player, club } = data;
                const squad = pendingOfferSquad || [];
                const preDecision = BoardYouthContractService.evaluateStage2PreDecision(player, squad, club);
                if (preDecision === 'IMMEDIATE_APPROVE') {
                  setYouthStage('STAGE2_APPROVE');
                } else if (preDecision === 'IMMEDIATE_REJECT') {
                  const lockoutDate = new Date(currentDate);
                  lockoutDate.setMonth(lockoutDate.getMonth() + 6);
                  updateContractPlayer(p => ({ ...p, boardYouthContractLockoutUntil: lockoutDate.toISOString() }));
                  setYouthStage('STAGE2_REJECT');
                } else {
                  const session = BoardYouthContractService.createQuizSession(player, squad);
                  setYouthInterviewSession(session);
                  setYouthStage('INTERVIEW');
                }
              }}
              className="w-full py-5 bg-cyan-600 text-white font-black uppercase rounded-2xl hover:bg-cyan-500 transition-all shadow-xl border-b-4 border-cyan-800 active:scale-95"
            >
              PRZEJDŹ DO WŁAŚCICIELA →
            </button>
          </div>
        </div>
      )}

      {/* YOUTH STAGE2 IMMEDIATE APPROVE */}
      {youthStage === 'STAGE2_APPROVE' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-6">
          <div className="max-w-md w-full bg-slate-900 border-2 border-emerald-500/50 rounded-[40px] shadow-[0_0_80px_rgba(16,185,129,0.15)] p-10 flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl">🏛️</div>
            <h3 className="text-xl font-black uppercase italic text-emerald-400 tracking-tighter">WŁAŚCICIEL ZATWIERDZA</h3>
            <p className="text-slate-300 italic leading-relaxed text-sm">Właściciel docenił potencjał zawodnika i zatwierdza kontrakt bez dodatkowego wywiadu.</p>
            {youthStage1Result && (
              <div className="bg-slate-800/60 border border-white/5 rounded-2xl p-4 w-full text-left">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">OPINIA DS</p>
                <p className="text-slate-400 text-xs italic">"{youthStage1Result.directorNote}"</p>
              </div>
            )}
            <button
              onClick={() => { if (pendingOfferSquad) proceedWithYouthApprovedOffer(pendingOfferSquad); }}
              className="w-full py-5 bg-emerald-600 text-white font-black uppercase rounded-2xl hover:bg-emerald-500 transition-all shadow-xl border-b-4 border-emerald-800 active:scale-95"
            >
              ZŁÓŻ OFERTĘ ZAWODNIKOWI →
            </button>
          </div>
        </div>
      )}

      {/* YOUTH STAGE2 IMMEDIATE REJECT */}
      {youthStage === 'STAGE2_REJECT' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-6">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/60 rounded-[40px] shadow-[0_0_80px_rgba(239,68,68,0.15)] p-10 flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">🏛️</div>
            <h3 className="text-xl font-black uppercase italic text-red-400 tracking-tighter">WŁAŚCICIEL ODRZUCA</h3>
            <p className="text-slate-300 italic leading-relaxed text-sm">Właściciel po analizie sytuacji finansowej i sportowej postanowił nie zatwierdzać tak dużego kontraktu na tym etapie.</p>
            <p className="text-slate-500 text-xs">Kolejna rozmowa z zarządem o tym zawodniku możliwa za 6 miesięcy.</p>
            <button
              onClick={() => { setYouthStage(null); setYouthStage1Result(null); }}
              className="w-full py-5 bg-red-600 text-white font-black uppercase rounded-2xl hover:bg-red-500 transition-all shadow-xl border-b-4 border-red-900 active:scale-95"
            >
              ROZUMIEM
            </button>
          </div>
        </div>
      )}

      {/* YOUTH INTERVIEW — QUIZ */}
      {(youthStage === 'INTERVIEW' || youthStage === 'INTERVIEW_APPROVED' || youthStage === 'INTERVIEW_REJECTED') && youthInterviewSession && data && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl p-8 flex flex-col gap-6 max-h-[95vh] overflow-y-auto custom-scrollbar">

            {/* Header */}
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WYWIAD Z WŁAŚCICIELEM</p>
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mt-1">OCENA INWESTYCJI</h3>
              {!youthInterviewResult && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                    <span>PYTANIE {youthInterviewSession.currentIndex + 1} / {youthInterviewSession.selectedQuestions.length}</span>
                    <span>{Math.round((youthInterviewSession.currentIndex / youthInterviewSession.selectedQuestions.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full">
                    <div
                      className="h-1 bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(youthInterviewSession.currentIndex / youthInterviewSession.selectedQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stage1 context */}
            {youthStage1Result && !youthInterviewResult && (
              <div className="flex gap-3">
                <div className="flex-1 bg-slate-800/40 border border-white/5 rounded-xl p-3">
                  <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">DS</p>
                  <p className="text-slate-400 text-[11px] italic leading-snug line-clamp-2">"{youthStage1Result.directorNote}"</p>
                </div>
                <div className="flex-1 bg-slate-800/40 border border-white/5 rounded-xl p-3">
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">TRENER</p>
                  <p className="text-slate-400 text-[11px] italic leading-snug line-clamp-2">"{youthStage1Result.coachNote}"</p>
                </div>
              </div>
            )}

            {/* Active question */}
            {!youthInterviewResult && youthInterviewSession.currentIndex < youthInterviewSession.selectedQuestions.length && (() => {
              const q = youthInterviewSession.selectedQuestions[youthInterviewSession.currentIndex];
              return (
                <div className="flex flex-col gap-4">
                  <p className="text-white font-semibold text-base leading-relaxed">{q.text}</p>
                  <div className="flex flex-col gap-3">
                    {q.answers.map(answer => (
                      <button
                        key={answer.id}
                        onClick={() => handleYouthInterviewAnswer(q.id, answer.id)}
                        className="w-full py-4 px-5 text-left bg-slate-800/60 border border-white/10 rounded-2xl text-slate-300 text-sm font-medium hover:bg-slate-700/80 hover:border-blue-500/50 hover:text-white transition-all active:scale-[0.99]"
                      >
                        <span className="text-blue-400 font-black mr-2 uppercase">{answer.id})</span> {answer.text}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Interview result */}
            {youthInterviewResult && (
              <div className="flex flex-col gap-5">
                <div className={`text-center p-6 rounded-3xl border-2 ${youthInterviewResult.approved ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: youthInterviewResult.approved ? '#34d399' : '#f87171' }}>
                    {youthInterviewResult.approved ? 'WŁAŚCICIEL WYRAŻA ZGODĘ' : 'WŁAŚCICIEL ODMAWIA'}
                  </p>
                  <p className="text-white font-bold text-base italic leading-relaxed mt-2">"{youthInterviewResult.ownerMessage}"</p>
                </div>


                {!youthInterviewResult.approved && (
                  <p className="text-slate-500 text-xs text-center">Kolejna rozmowa z właścicielem o tym zawodniku możliwa za 6 miesięcy.</p>
                )}

                <button
                  onClick={() => {
                    if (youthInterviewResult.approved && pendingOfferSquad) {
                      proceedWithYouthApprovedOffer(pendingOfferSquad);
                    } else {
                      setYouthStage(null);
                      setYouthStage1Result(null);
                      setYouthInterviewSession(null);
                      setYouthInterviewResult(null);
                      setPendingOfferSquad(null);
                    }
                  }}
                  className={`w-full py-5 font-black uppercase rounded-2xl transition-all shadow-xl active:scale-95 border-b-4 ${
                    youthInterviewResult.approved
                      ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800 text-white'
                      : 'bg-red-600 hover:bg-red-500 border-red-900 text-white'
                  }`}
                >
                  {youthInterviewResult.approved ? 'ZŁÓŻ OFERTĘ ZAWODNIKOWI →' : 'ROZUMIEM'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
