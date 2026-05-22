import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { IncomingOfferStatus, LoanOfferDuration, TransferTiming, ViewState, Player } from '../../types';
import { FinanceService } from '../../services/FinanceService';
import { IncomingTransferService } from '../../services/IncomingTransferService';
import { SportingDirectorService } from '../../services/SportingDirectorService';

const COUNTER_STEPS = [5_000, 10_000, 20_000, 50_000, 100_000];

const REPUTATION_LABELS: Record<number, string> = {
  1: '★☆☆☆☆',
  2: '★★☆☆☆',
  3: '★★★☆☆',
  4: '★★★★☆',
  5: '★★★★★',
};

export const IncomingOfferView: React.FC = () => {
  const {
    viewedIncomingOfferId,
    incomingOffers,
    players,
    clubs,
    leagues,
    userTeamId,
    currentDate,
    navigateWithoutHistory,
    respondToIncomingOffer,
    confirmIncomingTransfer,
    setTransferNewsActiveTab,
  } = useGame();

  const offer = useMemo(
    () => incomingOffers.find(o => o.id === viewedIncomingOfferId) ?? null,
    [incomingOffers, viewedIncomingOfferId]
  );

  const data = useMemo(() => {
    if (!offer || !userTeamId) return null;

    let player = null as Player | null;
    for (const clubId in players) {
      const found = players[clubId].find(p => p.id === offer.playerId);
      if (found) { player = found; break; }
    }
    if (!player) return null;

    const sellerClub = clubs.find(c => c.id === userTeamId) ?? null;
    const buyerClub = clubs.find(c => c.id === offer.buyerClubId) ?? null;
    if (!sellerClub || !buyerClub) return null;

    const buyerLeague = leagues.find(l => l.id === buyerClub.leagueId);
    const marketValue = FinanceService.calculateMarketValue(
      player,
      sellerClub.reputation,
      FinanceService.getClubTier(sellerClub),
      sellerClub.country
    );

    return { player, sellerClub, buyerClub, buyerLeague, marketValue };
  }, [offer, userTeamId, players, clubs, leagues]);

  const [counterFee, setCounterFee] = useState<number>(() => offer?.fee ?? 0);
  const [counterStep, setCounterStep] = useState<number>(50_000);
  const [showCounter, setShowCounter] = useState(false);
  const [loanCounterFee, setLoanCounterFee] = useState<number>(() => offer?.loanFee ?? offer?.fee ?? 0);
  const [loanCounterCoverage, setLoanCounterCoverage] = useState<number>(() => offer?.wageCoveragePercent ?? 50);
  const [loanCounterDuration, setLoanCounterDuration] = useState<LoanOfferDuration>(() => offer?.loanDuration ?? 'SEASON');

  if (!offer || !data) return null;

  const { player, sellerClub, buyerClub, buyerLeague, marketValue } = data;

  const isLoanOffer = offer.kind === 'LOAN';
  const timingLabel = isLoanOffer
    ? IncomingTransferService.getLoanDurationLabel(offer.loanDuration)
    : IncomingTransferService.getTimingLabel(offer.timing);
  const repLabel = REPUTATION_LABELS[Math.round(buyerClub.reputation)] ?? '★☆☆☆☆';

  const isPendingResponse =
    offer.status === IncomingOfferStatus.EMAIL_SENT ||
    offer.status === IncomingOfferStatus.REMINDER_SENT;

  const isAICountered = offer.status === IncomingOfferStatus.AI_COUNTERED;

  const isNegotiating = offer.status === IncomingOfferStatus.NEGOTIATION_IN_PROGRESS;

  const isAwaiting = offer.status === IncomingOfferStatus.AWAITING_CONFIRMATION;

  const isCounterPending = offer.status === IncomingOfferStatus.COUNTER_PENDING_AI;
  const isLoanedPlayer = !!player.loan;
  const loanEndDate = player.loan ? new Date(player.loan.endDate) : null;
  const loanEndLabel = loanEndDate && !Number.isNaN(loanEndDate.getTime())
    ? loanEndDate.toLocaleDateString('pl-PL')
    : '-';
  const loanBlockMessage = player.loan
    ? `${player.firstName} ${player.lastName} jest wypożyczony do ${player.loan.destinationClubName} do ${loanEndLabel}. Sprzedaż będzie możliwa dopiero po zakończeniu wypożyczenia.`
    : '';

  const handleAccept = () => {
    if (isLoanedPlayer) return;
    respondToIncomingOffer(offer.id, 'accept');
  };

  const handleReject = () => {
    respondToIncomingOffer(offer.id, 'reject');
  };

  const handleSubmitCounter = () => {
    if (isLoanedPlayer) return;
    respondToIncomingOffer(offer.id, 'counter', counterFee);
    setShowCounter(false);
  };

  const handleSubmitLoanCounter = () => {
    if (isLoanedPlayer || !isLoanOffer) return;
    respondToIncomingOffer(offer.id, 'counter', loanCounterFee, {
      loanFee: loanCounterFee,
      wageCoveragePercent: loanCounterCoverage,
      loanDuration: loanCounterDuration,
    });
    setShowCounter(false);
  };

  const handleConfirm = () => {
    if (isLoanedPlayer) return;
    confirmIncomingTransfer(offer.id, true);
  };

  const handleRejectConfirm = () => {
    confirmIncomingTransfer(offer.id, false);
  };

  const currentDisplayFee = isLoanOffer
    ? (offer.loanFee ?? offer.fee)
    : isAICountered ? (offer.aiCounterFee ?? offer.fee) : offer.fee;
  const loanEndDateLabel = offer.loanEndDate ? new Date(offer.loanEndDate).toLocaleDateString('pl-PL') : '-';
  const buyerCountryLabel = buyerClub.country ?? buyerLeague?.name ?? buyerClub.leagueId;
  const directorAdvisory = !isLoanOffer && sellerClub.sportingDirector
    ? SportingDirectorService.getIncomingSaleAdvisory({
        club: sellerClub,
        player,
        squad: players[userTeamId] || [],
        fee: currentDisplayFee,
      })
    : [];
  const loanCounterEndDate = IncomingTransferService.resolveLoanEndDate(currentDate, loanCounterDuration);
  const loanCounterTotalCost = IncomingTransferService.calculateLoanTotalCost(
    player,
    loanCounterFee,
    loanCounterCoverage,
    offer.loanStartDate || currentDate,
    loanCounterEndDate
  );

  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://i.ibb.co/JwgrBtvC/biuro2-1.png')] bg-cover bg-center opacity-20" />
      <div
        className="absolute inset-0 bg-black/35"
        style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' }}
      />

      <div
        className="relative z-10 w-full max-w-4xl bg-slate-900/62 border border-white/10 rounded-[42px] shadow-[0_40px_120px_rgba(0,0,0,0.55)] overflow-hidden"
        style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' }}
      >

        {/* Header */}
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">
              {isLoanOffer ? 'Oferta Wypożyczenia' : 'Oferta Transferowa'}
            </span>
            <h1 className="text-3xl font-black italic uppercase tracking-tight mt-2">
              {player.firstName} {player.lastName}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
              {player.position} · {player.overallRating} OVR · wiek {player.age}
            </p>
          </div>
          <button
            onClick={() => {
              setTransferNewsActiveTab('incoming');
              navigateWithoutHistory(ViewState.TRANSFER_NEWS);
            }}
            className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-xs"
          >
            Zamknij
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">

          {/* Lewa kolumna — dane */}
          <div className="space-y-4">

            {/* Nacisk zarządu */}
            {offer.boardPressure && (
              <div className="rounded-[20px] border border-red-500/40 bg-red-500/10 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-red-400 mb-1">Nacisk Zarządu</p>
                <p className="text-xs text-red-300 leading-relaxed">
                  Zarząd rozważa sprzedaż. Odrzucenie oferty może negatywnie wpłynąć na zaufanie zarządu.
                </p>
              </div>
            )}

            {/* Kupujący klub */}
            <div className="rounded-[28px] border border-white/10 bg-black/10 p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500 mb-4">
                {isLoanOffer ? 'Klub wypożyczający' : 'Kupujący Klub'}
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Klub</span>
                  <span className="font-black text-white text-right">{buyerClub.name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Kraj</span>
                  <span className="font-black text-slate-200 text-right">{buyerCountryLabel}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Reputacja</span>
                  <span className="font-black text-amber-400 text-right">{repLabel}</span>
                </div>
              </div>
            </div>

            {/* Zawodnik */}
            <div className="rounded-[28px] border border-white/10 bg-black/10 p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500 mb-4">Zawodnik</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">OVR</span>
                  <span className="font-black text-white text-right">{player.overallRating}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Wiek</span>
                  <span className="font-black text-white text-right">{player.age} lat</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Wartość rynkowa</span>
                  <span className="font-black text-emerald-400 text-right">{marketValue.toLocaleString('pl-PL')} PLN</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Kontrakt do</span>
                  <span className="font-black text-white text-right">
                    {new Date(player.contractEndDate).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Prawa kolumna — oferta + akcje */}
          <div className="space-y-4">

            {/* Szczegóły oferty */}
            <div className="rounded-[28px] border border-white/10 bg-black/10 p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500 mb-4">Oferta</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">{isLoanOffer ? 'Opłata za wypożyczenie' : 'Proponowana kwota'}</span>
                  <span className="font-black text-2xl text-amber-400 text-right">
                    {currentDisplayFee.toLocaleString('pl-PL')} PLN
                  </span>
                </div>
                {isAICountered && offer.counterFee && (
                  <div className="flex justify-between gap-4 text-xs">
                    <span className="text-slate-500">Nasza kontra</span>
                    <span className="text-slate-400 text-right">{offer.counterFee.toLocaleString('pl-PL')} PLN</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">{isLoanOffer ? 'Okres' : 'Termin przejścia'}</span>
                  <span className="font-black text-white text-right">{timingLabel}</span>
                </div>
                {isLoanOffer && (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Koniec wypożyczenia</span>
                      <span className="font-black text-white text-right">{loanEndDateLabel}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Pokrycie kontraktu</span>
                      <span className="font-black text-white text-right">{offer.wageCoveragePercent ?? 0}%</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Szacowany koszt AI</span>
                      <span className="font-black text-slate-200 text-right">{(offer.loanTotalCost ?? currentDisplayFee).toLocaleString('pl-PL')} PLN</span>
                    </div>
                  </>
                )}
                {!isLoanOffer && offer.negotiationRound > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Runda negocjacji</span>
                    <span className="font-black text-slate-300 text-right">{offer.negotiationRound} / 3</span>
                  </div>
                )}
              </div>
            </div>

            {isLoanOffer && offer.loanNegotiationNote && (
              <div className="rounded-[24px] border border-cyan-400/30 bg-cyan-500/10 p-4 shadow-[0_20px_70px_rgba(6,182,212,0.10)]">
                <p className="mb-2 text-[11px] font-black italic uppercase tracking-tighter text-cyan-300 whitespace-nowrap">Odpowiedź klubu</p>
                <p className="text-[12px] font-black italic uppercase tracking-tighter leading-relaxed text-cyan-100">{offer.loanNegotiationNote}</p>
              </div>
            )}

            {sellerClub.sportingDirector && directorAdvisory.length > 0 && (
              <div className="rounded-[20px] border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-amber-400 mb-2">Glos dyrektora sportowego</p>
                <div className="space-y-2 text-xs text-amber-100 leading-relaxed">
                  {directorAdvisory.map((note, index) => (
                    <p key={`${index}_${note}`}>• {note}</p>
                  ))}
                </div>
              </div>
            )}

            {isLoanedPlayer && (
              <div className="rounded-[20px] border border-cyan-500/35 bg-cyan-500/10 p-4">
                <p className="text-[9px] font-black italic uppercase tracking-tighter text-cyan-300 mb-2">Oferta zablokowana</p>
                <p className="text-xs text-cyan-100 leading-relaxed">{loanBlockMessage}</p>
              </div>
            )}

            {/* Stany terminalne */}
            {offer.status === IncomingOfferStatus.EXPIRED && (
              <div className="rounded-[20px] border border-slate-500/40 bg-slate-500/10 p-4 text-center">
                <p className="text-xs text-slate-400">Oferta wygasła z powodu braku odpowiedzi.</p>
              </div>
            )}
            {offer.status === IncomingOfferStatus.REJECTED_BY_MANAGER && (
              <div className="rounded-[20px] border border-red-500/30 bg-red-500/10 p-4 text-center">
                <p className="text-xs text-red-300">Oferta została odrzucona.</p>
              </div>
            )}
            {offer.status === IncomingOfferStatus.PLAYER_REFUSED && (
              <div className="rounded-[20px] border border-orange-500/30 bg-orange-500/10 p-4 text-center space-y-3">
                <p className="text-xs text-orange-300">
                  {isLoanOffer
                    ? `Zawodnik nie chce wypożyczenia do ${buyerClub.name}.`
                    : `Zawodnik odmówił rozmów z ${buyerClub.name}.`}
                </p>
                {isLoanOffer && offer.loanPlayerCanBeForced && (
                  <button
                    onClick={handleConfirm}
                    disabled={isLoanedPlayer}
                    className="w-full py-3 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Wyślij mimo odmowy
                  </button>
                )}
              </div>
            )}
            {offer.status === IncomingOfferStatus.COMPLETED && (
              <div className="rounded-[20px] border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
                <p className="text-xs text-emerald-400 font-black">{isLoanOffer ? 'Wypożyczenie zakończone pomyślnie.' : 'Transfer zakończony pomyślnie.'}</p>
              </div>
            )}
            {offer.status === IncomingOfferStatus.REJECTED_AT_CONFIRM && (
              <div className="rounded-[20px] border border-slate-500/40 bg-slate-500/10 p-4 text-center">
                <p className="text-xs text-slate-400">
                  {isLoanOffer && offer.loanNegotiationResult === 'AI_REJECTED_COUNTER'
                    ? offer.loanNegotiationNote ?? 'Klub odrzucił kontrofertę wypożyczenia.'
                    : 'Transfer odrzucony na etapie zatwierdzenia.'}
                </p>
              </div>
            )}

            {/* Oczekiwanie na odpowiedź AI */}
            {isCounterPending && (
              <div className="rounded-[20px] border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 mb-1">W toku</p>
                <p className="text-xs text-amber-200">{buyerClub.name} rozpatruje naszą kontrofertę. Odpowiedź jutro.</p>
              </div>
            )}

            {/* Negocjacje z zawodnikiem w tle */}
            {isNegotiating && (
              <div className="rounded-[20px] border border-blue-500/30 bg-blue-500/10 p-4 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Negocjacje trwają</p>
                <p className="text-xs text-blue-200">
                  {buyerClub.name} negocjuje bezpośrednio z {player.firstName} {player.lastName}.
                  Poinformujemy Pana o wynikach w ciągu 2-3 dni.
                </p>
              </div>
            )}

            {/* Zatwierdzenie transferu */}
            {isAwaiting && (
              <div className="rounded-[20px] border border-emerald-500/40 bg-emerald-500/10 p-5 space-y-4">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Zawodnik się zgodził</p>
                <p className="text-xs text-emerald-200 leading-relaxed">
                  {player.firstName} {player.lastName} zaakceptował warunki {buyerClub.name}.
                  {isLoanOffer
                    ? `Warunki wypożyczenia zostały zaakceptowane. Koniec: ${loanEndDateLabel}.`
                    : `Kwota transferu: ${offer.fee.toLocaleString('pl-PL')} PLN.`}
                  {' '}Czy zatwierdza Pan tę decyzję?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={isLoanedPlayer}
                    className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    {isLoanOffer ? 'Zatwierdź wypożyczenie' : 'Zatwierdź transfer'}
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/15 transition-colors"
                  >
                    Odrzuć
                  </button>
                </div>
              </div>
            )}

            {/* Główne przyciski akcji */}
            {(isPendingResponse || isAICountered) && !showCounter && (
              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  disabled={isLoanedPlayer}
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  {isLoanedPlayer ? 'Zawodnik wypożyczony' : isLoanOffer ? 'Akceptuj wypożyczenie' : 'Akceptuj ofertę'}
                </button>
                {isLoanOffer && offer.negotiationRound < 1 && (
                  <button
                    onClick={() => {
                      setLoanCounterFee(currentDisplayFee);
                      setLoanCounterCoverage(offer.wageCoveragePercent ?? 50);
                      setLoanCounterDuration(offer.loanDuration ?? 'SEASON');
                      setShowCounter(true);
                    }}
                    disabled={isLoanedPlayer}
                    className="w-full whitespace-nowrap py-4 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-black italic uppercase tracking-tighter text-[13px] hover:bg-cyan-500/30 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Negocjuj wypożyczenie
                  </button>
                )}
                {!isLoanOffer && offer.negotiationRound < 3 && (
                  <button
                    onClick={() => {
                      setCounterFee(currentDisplayFee);
                      setShowCounter(true);
                    }}
                    disabled={isLoanedPlayer}
                    className="w-full py-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black uppercase tracking-widest text-xs hover:bg-amber-500/30 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Podbij cenę ({offer.negotiationRound + 1}/3)
                  </button>
                )}
                <button
                  onClick={handleReject}
                  className="w-full py-4 rounded-2xl bg-white/8 border border-white/10 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-white/12 transition-colors"
                >
                  Odrzuć ofertę{offer.boardPressure ? ' (kara: -8 zaufania zarządu)' : ''}
                </button>
              </div>
            )}

            {/*
              PANEL NEGOCJACJI WYPOŻYCZENIA
              Ta sekcja jest osobna od klasycznej kontroferty transferowej, bo wypożyczenie ma trzy niezależne warunki:
              1. opłatę za wypożyczenie, czyli jednorazową kwotę dla klubu macierzystego,
              2. procent pokrycia pensji, który wpływa na realny koszt po stronie klubu AI,
              3. długość wypożyczenia, która może obniżyć albo podnieść całkowite ryzyko finansowe.
              Po wysłaniu kontroferty AI ocenia ją natychmiast w GameContext przez IncomingTransferService.evaluateLoanCounterOffer.
              Wynik wraca do tej samej oferty jako finalne warunki do zaakceptowania albo jako odrzucenie negocjacji.
            */}
            {showCounter && isLoanOffer && (
              <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/30 bg-slate-950/55 p-5 shadow-[0_28px_90px_rgba(8,145,178,0.18)] backdrop-blur-xl space-y-5">
                <div className="absolute inset-0 bg-[url('https://i.ibb.co/JwgrBtvC/biuro2-1.png')] bg-cover bg-center opacity-[0.07]" />
                <div className="relative space-y-5">
                  <div>
                    <p className="text-[13px] font-black italic uppercase tracking-tighter text-cyan-200 whitespace-nowrap">Negocjacje wypożyczenia</p>
                    <p className="mt-1 text-[10px] font-black italic uppercase tracking-tighter text-slate-400">Zmień warunki i sprawdź natychmiastową reakcję klubu.</p>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-400 whitespace-nowrap">Opłata</span>
                      <span className="text-[18px] font-black italic uppercase tracking-tighter text-amber-300 whitespace-nowrap">{loanCounterFee.toLocaleString('pl-PL')} PLN</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 10_000, 25_000, 50_000].map(step => (
                        <button
                          key={step}
                          onClick={() => setLoanCounterFee(Math.max(0, (offer.loanFee ?? offer.fee ?? 0) + step))}
                          className="whitespace-nowrap rounded-2xl bg-white/8 px-3 py-2 text-[10px] font-black italic uppercase tracking-tighter text-slate-200 transition-colors hover:bg-white/15"
                        >
                          {step === 0 ? 'Bazowa' : `+${(step / 1000).toFixed(0)}k`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black italic uppercase tracking-tighter text-slate-400 whitespace-nowrap">Pokrycie pensji</span>
                      <span className="text-[18px] font-black italic uppercase tracking-tighter text-emerald-300 whitespace-nowrap">{loanCounterCoverage}%</span>
                    </div>
                    <input
                      type="range"
                      min={25}
                      max={100}
                      step={5}
                      value={loanCounterCoverage}
                      onChange={(e) => setLoanCounterCoverage(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: 'ROUND', label: 'Do końca rundy' },
                      { value: 'SEASON', label: 'Do końca sezonu' },
                    ] as Array<{ value: LoanOfferDuration; label: string }>).map(option => (
                      <button
                        key={option.value}
                        onClick={() => setLoanCounterDuration(option.value)}
                        className={`whitespace-nowrap rounded-2xl border px-3 py-3 text-[11px] font-black italic uppercase tracking-tighter transition-colors ${
                          loanCounterDuration === option.value
                            ? 'border-cyan-300/60 bg-cyan-400/20 text-cyan-100'
                            : 'border-white/10 bg-white/8 text-slate-400 hover:bg-white/12'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[22px] border border-amber-300/20 bg-amber-500/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black italic uppercase tracking-tighter text-amber-200 whitespace-nowrap">Szacowany koszt AI</span>
                      <span className="text-[17px] font-black italic uppercase tracking-tighter text-amber-300 whitespace-nowrap">{loanCounterTotalCost.toLocaleString('pl-PL')} PLN</span>
                    </div>
                    <p className="mt-2 text-[10px] font-black italic uppercase tracking-tighter text-amber-100/80">Koniec: {new Date(loanCounterEndDate).toLocaleDateString('pl-PL')}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitLoanCounter}
                      disabled={isLoanedPlayer}
                      className="flex-1 whitespace-nowrap rounded-2xl bg-cyan-500 px-5 py-3 text-[12px] font-black italic uppercase tracking-tighter text-white transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Wyślij kontrofertę
                    </button>
                    <button
                      onClick={() => setShowCounter(false)}
                      className="whitespace-nowrap rounded-2xl bg-white/10 px-5 py-3 text-[12px] font-black italic uppercase tracking-tighter text-slate-300 transition-colors hover:bg-white/15"
                    >
                      Wróć
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Panel podbijania ceny */}
            {showCounter && !isLoanOffer && (
              <div className="rounded-[28px] border border-amber-500/30 bg-amber-500/5 p-5 space-y-4">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-amber-400">Twoja kontroferta</p>

                {/* Wybór kroku */}
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Krok zmiany</p>
                  <div className="flex gap-2 flex-wrap">
                    {COUNTER_STEPS.map(step => (
                      <button
                        key={step}
                        onClick={() => setCounterStep(step)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-colors ${
                          counterStep === step
                            ? 'bg-amber-500 text-white'
                            : 'bg-white/8 text-slate-400 hover:bg-white/12'
                        }`}
                      >
                        {step >= 1000 ? `${step / 1000}k` : step}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Przyciski +/- i kwota */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCounterFee(prev => Math.max(currentDisplayFee, prev - counterStep))}
                    className="w-12 h-12 rounded-2xl bg-white/8 text-white font-black text-xl hover:bg-white/15 transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-black text-white">{counterFee.toLocaleString('pl-PL')}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">PLN</p>
                  </div>
                  <button
                    onClick={() => setCounterFee(prev => prev + counterStep)}
                    className="w-12 h-12 rounded-2xl bg-white/8 text-white font-black text-xl hover:bg-white/15 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitCounter}
                    disabled={isLoanedPlayer}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Wyślij kontrofertę
                  </button>
                  <button
                    onClick={() => setShowCounter(false)}
                    className="px-5 py-3 rounded-2xl bg-white/8 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-white/12 transition-colors"
                  >
                    Wróć
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
