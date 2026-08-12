import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PlayerPosition, ViewState } from '../../types';
import { FreeAgentNegotiationService } from '../../services/FreeAgentNegotiationService';
import { FinanceService } from '@/services/FinanceService';
import { BoardBudgetRequestService, BoardRequestResult } from '../../services/BoardBudgetRequestService';
import { ManagerNegotiationInfluenceService } from '../../services/ManagerNegotiationInfluenceService';
import { FreeAgentContractPackageService } from '../../services/FreeAgentContractPackageService';

const sanitizeAgentInterestMessage = (message: string): string => {
  const normalized = message.toLowerCase();
  const revealsReputationThreshold =
    normalized.includes('reputacji co najmniej') ||
    /klub(?:u|ami)? o reputacji\s+\d+/i.test(message) ||
    /reputacji\s+\d+\+/i.test(message);

  return revealsReputationThreshold
    ? 'Na ten moment agent nie chce rozpoczynać rozmów w tym kierunku.'
    : message;
};

const OFFER_MONEY_STEP = 10_000;

const POSITION_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'BRAMKARZ',
  [PlayerPosition.DEF]: 'OBROŃCA',
  [PlayerPosition.MID]: 'POMOCNIK',
  [PlayerPosition.FWD]: 'NAPASTNIK',
};

const normalizeOfferMoney = (value: number): number =>
  Math.max(0, Math.round((Number.isFinite(value) ? value : 0) / OFFER_MONEY_STEP) * OFFER_MONEY_STEP);

export const FreeAgentNegotiationView: React.FC = () => {
  const {
    viewedPlayerId,
    players,
    clubs,
    navigateTo,
    userTeamId,
    currentDate,
    setPendingNegotiations,
    updatePlayer,
    pendingNegotiations,
    setClubs,
    managerProfile,
  } = useGame();

  const player = useMemo(
    () => (players['FREE_AGENTS'] || []).find(p => p.id === viewedPlayerId),
    [players, viewedPlayerId]
  );
  const myClub = useMemo(
    () => clubs.find(c => c.id === userTeamId),
    [clubs, userTeamId]
  );
  const mySquad = useMemo(
    () => (userTeamId ? players[userTeamId] || [] : []),
    [players, userTeamId]
  );
  const leaguePlayers = useMemo(() => {
    if (!myClub) return [];
    const leagueClubIds = new Set(
      clubs.filter(club => club.leagueId === myClub.leagueId).map(club => club.id)
    );
    return Object.entries(players)
      .filter(([clubId]) => leagueClubIds.has(clubId))
      .flatMap(([, squad]) => squad);
  }, [clubs, myClub, players]);
  const demandPeriodKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  const agentDemands = useMemo(
    () => player && myClub
      ? FreeAgentNegotiationService.calculateContractDemands(player, myClub, mySquad, leaguePlayers, currentDate, managerProfile)
      : null,
    [player, myClub, mySquad, leaguePlayers, demandPeriodKey, managerProfile]
  );

  const spendableTransferBudget = myClub?.transferBudget || 0;

  const [salary, setSalary] = useState(() => {
    const suggested = agentDemands?.salary ?? (player ? player.overallRating * 1800 : 50000);
    return normalizeOfferMoney(suggested);
  });
  const [bonus, setBonus] = useState(() => normalizeOfferMoney(agentDemands?.bonus ?? 25000));
  const [years, setYears] = useState(() => agentDemands?.years ?? 2);
  const [goalBonus, setGoalBonus] = useState(() => agentDemands?.goalBonus ?? 0);
  const [assistBonus, setAssistBonus] = useState(() => agentDemands?.assistBonus ?? 0);
  const [cleanSheetBonus, setCleanSheetBonus] = useState(() => agentDemands?.cleanSheetBonus ?? 0);
  const [isSending, setIsSending] = useState(false);
  const [agentReaction, setAgentReaction] = useState<{ type: string; msg: string } | null>(null);
  const [boardVeto, setBoardVeto] = useState<{ msg: string } | null>(null);
  const [extraBudget, setExtraBudget] = useState(0);
  const [boardRequestResult, setBoardRequestResult] = useState<BoardRequestResult | null>(null);

  useEffect(() => {
    if (!agentDemands) return;
    setSalary(normalizeOfferMoney(agentDemands.salary));
    setBonus(normalizeOfferMoney(agentDemands.bonus));
    setYears(agentDemands.years);
    setGoalBonus(agentDemands.goalBonus ?? 0);
    setAssistBonus(agentDemands.assistBonus ?? 0);
    setCleanSheetBonus(agentDemands.cleanSheetBonus ?? 0);
  }, [player?.id, myClub?.id, agentDemands?.salary, agentDemands?.bonus, agentDemands?.years]);

  const agentInterest = useMemo(() => {
    if (!player || !myClub) return { interested: true, message: '' };
    if (player.transferPendingClubId) {
      const destination = clubs.find(club => club.id === player.transferPendingClubId);
      return {
        interested: false,
        message: `Zawodnik podpisał już umowę z klubem ${destination?.name ?? 'inny klub'}.`,
      };
    }
    return FreeAgentNegotiationService.evaluateInitialInterest(player, myClub, mySquad, managerProfile);
  }, [player, myClub, mySquad, managerProfile, clubs]);

  const isAlreadyNegotiating = useMemo(() => {
    if (!player) return false;
    return pendingNegotiations.some(n => n.playerId === player.id);
  }, [pendingNegotiations, player?.id]);

  const activeClubLockoutUntil = useMemo(() => {
    if (!player) return null;
    return FreeAgentNegotiationService.getClubLockoutUntil(player, myClub?.id, currentDate);
  }, [player, myClub?.id, currentDate]);

  if (!player || !myClub) return null;

  const isInterested = agentInterest.interested;
  const visibleAgentInterestMessage = sanitizeAgentInterestMessage(agentInterest.message);
  const availableBudget = spendableTransferBudget;
  const guaranteedContractValue = FinanceService.calculateFreeAgentContractCommitment(salary, years, bonus);
  const currentSeasonCostPreview = FinanceService.calculateFreeAgentCurrentSeasonCost(salary, bonus);
  const isOfferWithinBudget = currentSeasonCostPreview <= availableBudget;
  const remainingBudget = Math.max(0, availableBudget - currentSeasonCostPreview);
  const budgetShortfall = Math.max(0, currentSeasonCostPreview - availableBudget);
  const budgetUsagePercent = availableBudget > 0
    ? Math.min(100, (currentSeasonCostPreview / availableBudget) * 100)
    : currentSeasonCostPreview > 0 ? 100 : 0;
  const goalBonusMax = Math.max(5_000, (agentDemands?.goalBonus ?? 0) * 2, goalBonus);
  const assistBonusMax = Math.max(5_000, (agentDemands?.assistBonus ?? 0) * 2, assistBonus);
  const cleanSheetBonusMax = Math.max(5_000, (agentDemands?.cleanSheetBonus ?? 0) * 2, cleanSheetBonus);
  const boardRequestsUsed = myClub.boardBudgetRequestsThisSeason ?? 0;
  const canRequestBoard = !isOfferWithinBudget && boardRequestsUsed < 2;

  /*
   * Salary, signing bonus and contract length are deliberately independent inputs.
   * Earlier versions preserved one hidden package total, which caused one slider to
   * move another value. The UI now changes only the field touched by the user; the
   * guaranteed cost below is a transparent summary, never an allocation controller.
   */
  const handleSalaryChange = (requestedSalary: number) => setSalary(normalizeOfferMoney(requestedSalary));
  const handleSigningBonusChange = (requestedBonus: number) => setBonus(normalizeOfferMoney(requestedBonus));
  const handleContractYearsChange = (nextYears: number) => setYears(nextYears);

  const handleBoardRequest = () => {
    const shortfall = currentSeasonCostPreview - availableBudget;
    const result = BoardBudgetRequestService.evaluateBoardRequest(player, myClub, mySquad, shortfall);
    setBoardRequestResult(result);
    setClubs(prev => prev.map(c => c.id === myClub.id
      ? { ...c, boardBudgetRequestsThisSeason: (c.boardBudgetRequestsThisSeason ?? 0) + 1 }
      : c
    ));
  };

  const handleBoardRequestConfirm = () => {
    if (boardRequestResult && boardRequestResult.grantedAmount > 0) {
      const grantedAmount = boardRequestResult.grantedAmount;
      setExtraBudget(previousAmount => previousAmount + grantedAmount);
      /*
       * A board grant must become real club money. Keeping it only in local view
       * state made an accepted offer fail later when the contract was finalized.
       */
      setClubs(previousClubs => previousClubs.map(club => club.id === myClub.id
        ? { ...club, transferBudget: club.transferBudget + grantedAmount }
        : club
      ));
    }
    setBoardRequestResult(null);
  };

  const handleConfirm = () => {
    if (!isInterested) return;

    if (activeClubLockoutUntil) {
      setBoardVeto({
        msg: 'TEN ZAWODNIK NIE CHCE WRACAC DO ROZMOW Z TWOIM KLUBEM PO POPRZEDNICH NEGOCJACJACH. SPROBUJ PONOWNIE ZA KILKA MIESIECY.',
      });
      return;
    }

    if (mySquad.length >= 30) {
      setBoardVeto({
        msg: 'ZARZAD NIE ZEZWALA NA ZATRUDNIENIE. NAJPIERW ZWOLNIJ MIEJSCE W KADRZE.',
      });
      return;
    }

    const avgSquadSalary = mySquad.length > 0
      ? mySquad.reduce((sum, squadPlayer) => sum + squadPlayer.annualSalary, 0) / mySquad.length
      : 120000;

    const currentSeasonCost = FinanceService.calculateFreeAgentCurrentSeasonCost(salary, bonus);
    if (currentSeasonCost > availableBudget) {
      setBoardVeto({ msg: `Koszt kontraktu w bieżącym sezonie (${currentSeasonCost.toLocaleString('pl-PL')} PLN) przekracza dostępny budżet transferowy (${availableBudget.toLocaleString('pl-PL')} PLN).` });
      return;
    }

    const boardCheck = FinanceService.evaluateFASigningBoardDecision(player, salary, bonus, mySquad, myClub);
    if (!boardCheck.approved) {
      setBoardVeto({ msg: boardCheck.reason });
      return;
    }

    setIsSending(true);

    const managerInfluence = ManagerNegotiationInfluenceService.calculate(managerProfile);
    const fallbackExpectedSalary = FinanceService.calculateFAExpectations(
      player,
      myClub.reputation,
      avgSquadSalary,
    ) * managerInfluence.expectationMultiplier;
    const expectedGuaranteedPackage = agentDemands
      ? FreeAgentContractPackageService.calculateTotal(agentDemands.salary, agentDemands.years, agentDemands.bonus)
      : fallbackExpectedSalary * years;
    const offeredGuaranteedPackage = FreeAgentContractPackageService.calculateTotal(salary, years, bonus);
    const ratio = offeredGuaranteedPackage / Math.max(1, expectedGuaranteedPackage);

    let reaction = { type: 'GOOD', msg: 'Dziekujemy. Przeanalizujemy warunki i wrocimy z odpowiedzia.' };
    if (ratio < 0.45) {
      reaction = {
        type: 'INSULT',
        msg: 'Ta oferta jest zbyt niska. Konczymy rozmowy z tym klubem na 3 miesiace.',
      };
    } else if (ratio < 0.7) {
      reaction = {
        type: 'WEAK',
        msg: 'Oferta nie jest zbyt atrakcyjna. Potrzebujemy czasu na analize.',
      };
    }

    setTimeout(() => {
      setAgentReaction(reaction);

      if (reaction.type === 'INSULT') {
        const lockoutDate = new Date(currentDate);
        lockoutDate.setMonth(lockoutDate.getMonth() + 3);

        updatePlayer('FREE_AGENTS', player.id, {
          freeAgentLockoutUntil: null,
          isNegotiationPermanentBlocked: false,
          freeAgentClubLockouts: FreeAgentNegotiationService.buildClubLockouts(
            player.freeAgentClubLockouts,
            myClub.id,
            lockoutDate.toISOString()
          ),
        });
      }

      if (reaction.type !== 'INSULT') {
        const newNegotiation = FreeAgentNegotiationService.createNegotiationEntry(
          player,
          myClub,
          salary,
          bonus,
          years,
          currentDate,
          mySquad,
          agentDemands?.goalBonus !== undefined ? goalBonus || undefined : undefined,
          agentDemands?.assistBonus !== undefined ? assistBonus || undefined : undefined,
          agentDemands?.cleanSheetBonus !== undefined ? cleanSheetBonus || undefined : undefined,
          agentDemands ?? undefined
        );
        setPendingNegotiations(prev => [...prev, newNegotiation]);
      }

      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-4 animate-fade-in overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://i.ibb.co/JwgrBtvC/biuro2-1.png')] bg-cover bg-center opacity-20" />

      <div className="negotiation-shell max-w-6xl max-h-[calc(100vh-32px)] overflow-hidden w-full bg-slate-900/90 border border-white/10 rounded-[42px] backdrop-blur-3xl shadow-2xl px-7 py-5 flex flex-col gap-4 relative z-10">
        <header className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Biuro Negocjacji</span>
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mt-0.5">
              {player.firstName} {player.lastName}
            </h2>
            <p className="text-[10px] font-black italic text-slate-500 uppercase tracking-tighter mt-1">
              {POSITION_LABELS[player.position]} | {player.overallRating} OVR | {player.age} LAT | WOLNY AGENT
            </p>
          </div>
          <button
            onClick={() => navigateTo(ViewState.JOB_MARKET)}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all"
          >
            Anuluj
          </button>
        </header>

        {isInterested && agentDemands && (
          <section className="bg-amber-500/5 border border-amber-400/20 rounded-[24px] p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h3 className="font-black italic uppercase tracking-tighter text-sm text-amber-300">
                Oczekiwania agenta
              </h3>
              <span className="font-black italic uppercase tracking-tighter text-[10px] text-slate-500">
                Punkt wyjścia do negocjacji
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="bg-black/25 rounded-xl px-3 py-2">
                <span className="font-black italic uppercase tracking-tighter block text-[9px] text-slate-500">Kontrakt</span>
                <strong className="font-black italic uppercase tracking-tighter text-sm text-white">{agentDemands.years} {agentDemands.years === 1 ? 'rok' : 'lata'}</strong>
              </div>
              <div className="bg-black/25 rounded-xl px-3 py-2">
                <span className="font-black italic uppercase tracking-tighter block text-[9px] text-slate-500">Pensja roczna</span>
                <strong className="font-black italic uppercase tracking-tighter text-sm text-emerald-400">{agentDemands.salary.toLocaleString('pl-PL')} PLN</strong>
              </div>
              <div className="bg-black/25 rounded-xl px-3 py-2">
                <span className="font-black italic uppercase tracking-tighter block text-[9px] text-slate-500">Za podpis</span>
                <strong className="font-black italic uppercase tracking-tighter text-sm text-blue-400">{agentDemands.bonus.toLocaleString('pl-PL')} PLN</strong>
              </div>
              <div className="bg-black/25 rounded-xl px-3 py-2">
                <span className="font-black italic uppercase tracking-tighter block text-[9px] text-slate-500">Za gola</span>
                <strong className="font-black italic uppercase tracking-tighter text-sm text-amber-400">{agentDemands.goalBonus !== undefined ? `${agentDemands.goalBonus.toLocaleString('pl-PL')} PLN` : 'Nie dotyczy'}</strong>
              </div>
              <div className="bg-black/25 rounded-xl px-3 py-2">
                <span className="font-black italic uppercase tracking-tighter block text-[9px] text-slate-500">Za asystę</span>
                <strong className="font-black italic uppercase tracking-tighter text-sm text-sky-400">{agentDemands.assistBonus !== undefined ? `${agentDemands.assistBonus.toLocaleString('pl-PL')} PLN` : 'Nie dotyczy'}</strong>
              </div>
              <div className="bg-black/25 rounded-xl px-3 py-2">
                <span className="font-black italic uppercase tracking-tighter block text-[9px] text-slate-500">Czyste konto</span>
                <strong className="font-black italic uppercase tracking-tighter text-sm text-violet-400">{agentDemands.cleanSheetBonus !== undefined ? `${agentDemands.cleanSheetBonus.toLocaleString('pl-PL')} PLN` : 'Nie dotyczy'}</strong>
              </div>
            </div>
          </section>
        )}

        {isInterested && (
          <section className={`rounded-[24px] border p-4 ${
            isOfferWithinBudget
              ? 'border-emerald-400/25 bg-emerald-500/5'
              : 'border-red-400/30 bg-red-500/5'
          }`}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm text-white font-black italic uppercase tracking-tighter">Dostępna pula na kontrakt</h3>
                <p className="mt-1 text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">
                  Z bieżącego budżetu klub pokrywa pierwszy rok pensji oraz bonus za podpis
                </p>
              </div>
              <strong className="text-xl text-emerald-400 font-black italic uppercase tracking-tighter">
                {availableBudget.toLocaleString('pl-PL')} PLN
              </strong>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-black/30 px-4 py-2.5">
                <span className="block text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Pensja za pierwszy rok</span>
                <strong className="text-sm text-emerald-300 font-black italic uppercase tracking-tighter">
                  {salary.toLocaleString('pl-PL')} PLN
                </strong>
              </div>
              <div className="rounded-xl bg-black/30 px-4 py-2.5">
                <span className="block text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Jednorazowy bonus za podpis</span>
                <strong className="text-sm text-blue-300 font-black italic uppercase tracking-tighter">
                  {bonus.toLocaleString('pl-PL')} PLN
                </strong>
              </div>
              <div className="rounded-xl bg-black/30 px-4 py-2.5">
                <span className="block text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">
                  {isOfferWithinBudget ? 'Pozostanie w puli' : 'Brakuje do złożenia oferty'}
                </span>
                <strong className={`text-sm font-black italic uppercase tracking-tighter ${isOfferWithinBudget ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(isOfferWithinBudget ? remainingBudget : budgetShortfall).toLocaleString('pl-PL')} PLN
                </strong>
              </div>
            </div>

            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/40">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${isOfferWithinBudget ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>
            <p className="mt-2 text-[8px] text-slate-400 font-black italic uppercase tracking-tighter">
              Obciążenie bieżącego budżetu: {salary.toLocaleString('pl-PL')} PLN + {bonus.toLocaleString('pl-PL')} PLN = {currentSeasonCostPreview.toLocaleString('pl-PL')} PLN. Pełna wartość {years}-letniej umowy dla zawodnika: {guaranteedContractValue.toLocaleString('pl-PL')} PLN.
            </p>
          </section>
        )}

        <div className="grid min-h-0 grid-cols-1 gap-6 md:grid-cols-2">
          {!isInterested ? (
            <div className="col-span-2 bg-red-600/10 border-2 border-red-600/30 p-12 rounded-[40px] text-center animate-pulse">
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
                MOJ KLIENT NIE JEST ZAINTERESOWANY
              </h3>
              <p className="font-black italic uppercase tracking-tighter text-slate-400 text-lg max-w-2xl mx-auto">
                "{visibleAgentInterestMessage || 'Na ten moment agent nie chce rozpoczynać rozmów w tym kierunku.'}"
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <span className="block text-[10px] text-slate-300 font-black italic uppercase tracking-tighter">Pensja roczna</span>
                      <span className="mt-1 block text-[8px] text-slate-600 font-black italic uppercase tracking-tighter">Zmiana pensji nie zmienia bonusu za podpis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSalaryChange(salary - OFFER_MONEY_STEP)}
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[10px] text-slate-300 transition-colors hover:bg-white/10 font-black italic uppercase tracking-tighter"
                      >
                        − 10 000
                      </button>
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
                      <input
                        type="number"
                        min="0"
                        step={OFFER_MONEY_STEP}
                        value={salary}
                        onChange={event => setSalary(Math.max(0, parseInt(event.target.value, 10) || 0))}
                        className="bg-transparent border-none outline-none text-xl font-black text-emerald-400 font-mono italic w-32 text-right"
                      />
                        <span className="text-xs text-slate-500 font-black italic uppercase tracking-tighter">PLN</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSalaryChange(salary + OFFER_MONEY_STEP)}
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[10px] text-slate-300 transition-colors hover:bg-white/10 font-black italic uppercase tracking-tighter"
                      >
                        + 10 000
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <span className="block text-[10px] text-slate-300 font-black italic uppercase tracking-tighter">Bonus za podpis</span>
                      <span className="mt-1 block text-[8px] text-slate-600 font-black italic uppercase tracking-tighter">Zmiana bonusu nie zmienia pensji rocznej</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSigningBonusChange(bonus - OFFER_MONEY_STEP)}
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[10px] text-slate-300 transition-colors hover:bg-white/10 font-black italic uppercase tracking-tighter"
                      >
                        − 10 000
                      </button>
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
                      <input
                        type="number"
                        min="0"
                        step={OFFER_MONEY_STEP}
                        value={bonus}
                        onChange={event => setBonus(Math.max(0, parseInt(event.target.value, 10) || 0))}
                        className="bg-transparent border-none outline-none text-xl font-black text-blue-400 font-mono italic w-32 text-right"
                      />
                        <span className="text-xs text-slate-500 font-black italic uppercase tracking-tighter">PLN</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSigningBonusChange(bonus + OFFER_MONEY_STEP)}
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[10px] text-slate-300 transition-colors hover:bg-white/10 font-black italic uppercase tracking-tighter"
                      >
                        + 10 000
                      </button>
                    </div>
                  </div>
                </div>

                {agentDemands?.cleanSheetBonus !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bonus za czyste konto</span>
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
                        <input
                          type="number"
                          value={cleanSheetBonus}
                          onChange={e => setCleanSheetBonus(Math.min(parseInt(e.target.value, 10) || 0, cleanSheetBonusMax))}
                          className="bg-transparent border-none outline-none text-xl font-black text-violet-400 font-mono italic w-32 text-right"
                        />
                        <span className="text-xs font-black text-slate-500">PLN</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={cleanSheetBonusMax}
                      step="500"
                      value={cleanSheetBonus}
                      onChange={e => setCleanSheetBonus(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[8px] font-bold text-slate-600 uppercase">Brak</span>
                      <span className="text-[8px] font-bold text-slate-600 uppercase">Max: {cleanSheetBonusMax.toLocaleString('pl-PL')}</span>
                    </div>
                  </div>
                )}
                {agentDemands?.goalBonus !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bonus za gola</span>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
                          <input
                            type="number"
                            value={goalBonus}
                            onChange={e => setGoalBonus(Math.min(parseInt(e.target.value, 10) || 0, goalBonusMax))}
                            className="bg-transparent border-none outline-none text-xl font-black text-amber-400 font-mono italic w-32 text-right"
                          />
                          <span className="text-xs font-black text-slate-500">PLN</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={goalBonusMax}
                        step="500"
                        value={goalBonus}
                        onChange={e => setGoalBonus(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between px-1">
                        <span className="text-[8px] font-bold text-slate-600 uppercase">Brak</span>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">Max: {goalBonusMax.toLocaleString('pl-PL')}</span>
                      </div>
                    </div>
                )}
                {agentDemands?.assistBonus !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bonus za asyste</span>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
                          <input
                            type="number"
                            value={assistBonus}
                            onChange={e => setAssistBonus(Math.min(parseInt(e.target.value, 10) || 0, assistBonusMax))}
                            className="bg-transparent border-none outline-none text-xl font-black text-sky-400 font-mono italic w-32 text-right"
                          />
                          <span className="text-xs font-black text-slate-500">PLN</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={assistBonusMax}
                        step="500"
                        value={assistBonus}
                        onChange={e => setAssistBonus(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                      <div className="flex justify-between px-1">
                        <span className="text-[8px] font-bold text-slate-600 uppercase">Brak</span>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">Max: {assistBonusMax.toLocaleString('pl-PL')}</span>
                      </div>
                    </div>
                )}
              </div>

              <div className="space-y-5 bg-black/20 p-5 rounded-[28px] border border-white/5">
                <div className="flex items-center justify-between gap-3">
                  <span className="block text-[10px] text-slate-500 font-black italic uppercase tracking-tighter">
                    Długość kontraktu
                  </span>
                  <strong className="text-lg text-white font-black italic uppercase tracking-tighter">
                    {years} {years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}
                  </strong>
                </div>

                <div className="px-2">
                  <div className="relative h-8">
                    <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-slate-800" />
                    <div
                      className="absolute left-0 top-3 h-1 rounded-full bg-emerald-500 transition-[width] duration-200"
                      style={{ width: `${((years - 1) / 4) * 100}%` }}
                    />
                    {[1, 2, 3, 4, 5].map((yearOption, index) => (
                      <span
                        key={yearOption}
                        className={`pointer-events-none absolute top-[7px] h-4 w-4 -translate-x-1/2 rounded-full border-2 transition-all ${
                          years === yearOption
                            ? 'scale-125 border-white bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]'
                            : years > yearOption
                              ? 'border-emerald-400 bg-emerald-500'
                              : 'border-slate-600 bg-slate-900'
                        }`}
                        style={{ left: `${index * 25}%` }}
                      />
                    ))}
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={years}
                      onChange={event => handleContractYearsChange(parseInt(event.target.value, 10))}
                      aria-label="Długość kontraktu w latach"
                      className="absolute inset-0 z-10 h-8 w-full cursor-pointer opacity-0"
                    />
                  </div>
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map(yearOption => (
                      <button
                        key={yearOption}
                        type="button"
                        onClick={() => handleContractYearsChange(yearOption)}
                        className={`w-5 text-center text-[10px] transition-colors font-black italic uppercase tracking-tighter ${
                          years === yearOption ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {yearOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/30 px-4 py-3">
                    <span className="font-black italic uppercase tracking-tighter block text-[9px] text-slate-500">Koszt w tym sezonie</span>
                    <strong className="font-black italic uppercase tracking-tighter text-sm text-amber-400">{currentSeasonCostPreview.toLocaleString('pl-PL')} PLN</strong>
                  </div>
                  <div className="rounded-xl bg-black/30 px-4 py-3">
                    <span className="font-black italic uppercase tracking-tighter block text-[9px] text-slate-500">Budżet po podpisaniu</span>
                    <strong className={`font-black italic uppercase tracking-tighter text-sm ${currentSeasonCostPreview <= availableBudget ? 'text-emerald-400' : 'text-red-400'}`}>
                      {FinanceService.calculateRemainingContractBudget(availableBudget, salary, years, bonus).toLocaleString('pl-PL')} PLN
                    </strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {isInterested && extraBudget > 0 && (
          <p className="text-center text-emerald-400 text-[11px] font-black italic uppercase tracking-tighter">
            Zarząd przyznał dodatkowe {extraBudget.toLocaleString('pl-PL')} PLN — budżet rozszerzony
          </p>
        )}

        <button
          onClick={isOfferWithinBudget ? handleConfirm : handleBoardRequest}
          disabled={isSending || !isInterested || isAlreadyNegotiating || (!isOfferWithinBudget && !canRequestBoard)}
          className={`w-full py-4 rounded-[24px] font-black italic uppercase tracking-tighter text-xl transition-all shadow-2xl border-b-[6px] active:scale-95 ${
            (!isInterested || isAlreadyNegotiating || (!isOfferWithinBudget && !canRequestBoard))
              ? 'bg-slate-800 border-slate-900 text-slate-500 cursor-not-allowed'
              : !isOfferWithinBudget
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800'
          }`}
        >
          {isSending
            ? 'PRZESYŁANIE OFERTY...'
            : isAlreadyNegotiating
              ? 'OFERTA W ANALIZIE...'
              : !isInterested
                ? 'BRAK ZAINTERESOWANIA'
                : !isOfferWithinBudget
                  ? canRequestBoard
                    ? (
                      <>
                        PROŚBA DO ZARZĄDU O DODATKOWY BUDŻET
                        <span className="mt-1 block text-xs text-amber-200 font-black italic uppercase tracking-tighter">
                          Brakuje {budgetShortfall.toLocaleString('pl-PL')} PLN • pozostałe wnioski: {2 - boardRequestsUsed}
                        </span>
                      </>
                    )
                    : (
                      <>
                        BUDŻET PRZEKROCZONY
                        <span className="mt-1 block text-xs text-slate-400 font-black italic uppercase tracking-tighter">
                          Zmniejsz ofertę o {budgetShortfall.toLocaleString('pl-PL')} PLN
                        </span>
                      </>
                    )
                  : 'WYŚLIJ OFERTĘ DO AGENTA'}
        </button>

        {isAlreadyNegotiating && (
          <p className="text-center text-amber-500 text-[11px] font-black uppercase tracking-widest animate-pulse mt-2">
            "Zapoznajemy sie z otrzymana oferta. Skontaktujemy sie z Panstwem w ciagu kilku dni."
          </p>
        )}
      </div>

      {agentReaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-6">
          <div className={`max-w-md w-full p-10 rounded-[40px] border-2 shadow-2xl text-center flex flex-col items-center gap-6 ${agentReaction.type === 'INSULT' ? 'border-red-500 bg-red-950/20' : 'border-emerald-500 bg-slate-900'}`}>
            <h3 className="text-2xl font-black uppercase italic text-white">Odpowiedz Agenta</h3>
            <p className="text-slate-300 italic">"{agentReaction.msg}"</p>
            <button
              onClick={() => navigateTo(ViewState.DASHBOARD)}
              className="mt-4 w-full py-4 bg-white text-black font-black uppercase rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              Zrozumialem
            </button>
          </div>
        </div>
      )}

      {boardRequestResult && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-lg animate-fade-in p-6">
          <div className={`max-w-md w-full p-10 rounded-[40px] border-2 shadow-2xl text-center flex flex-col items-center gap-6 ${
            boardRequestResult.result === 'REJECTED' ? 'border-red-500 bg-red-950/20' :
            boardRequestResult.result === 'PARTIAL' ? 'border-amber-500 bg-amber-950/20' :
            'border-emerald-500 bg-emerald-950/20'
          }`}>
            <h3 className={`text-2xl font-black uppercase italic tracking-tighter ${
              boardRequestResult.result === 'REJECTED' ? 'text-red-400' :
              boardRequestResult.result === 'PARTIAL' ? 'text-amber-400' :
              'text-emerald-400'
            }`}>
              {boardRequestResult.result === 'REJECTED' ? 'ZARZĄD ODMAWIA' :
               boardRequestResult.result === 'PARTIAL' ? 'CZĘŚCIOWE DOFINANSOWANIE' :
               'ZARZĄD ZATWIERDZA'}
            </h3>
            <p className="text-slate-300 italic leading-relaxed">"{boardRequestResult.message}"</p>
            <button
              onClick={handleBoardRequestConfirm}
              className="mt-4 w-full py-4 bg-white text-black font-black uppercase rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}

      {boardVeto && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fade-in p-6">
          <div className="max-w-md w-full p-10 rounded-[40px] border-2 border-red-500 bg-slate-900 shadow-[0_0_100px_rgba(239,68,68,0.2)] text-center flex flex-col items-center gap-6">
            <h3 className="text-2xl font-black uppercase italic text-red-500 tracking-tighter">VETO ZARZADU</h3>
            <p className="text-slate-300 italic font-medium leading-relaxed">"{boardVeto.msg}"</p>
            <button
              onClick={() => setBoardVeto(null)}
              className="mt-4 w-full py-5 bg-red-600 text-white font-black uppercase rounded-2xl hover:bg-red-500 transition-all shadow-xl border-b-4 border-red-900 active:scale-95"
            >
              SKORYGUJE OFERTE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
