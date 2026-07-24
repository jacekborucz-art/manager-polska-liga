import React, { useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { MysteryAgentService } from '../../services/MysteryAgentService';
import { ViewState } from '../../types';

type AgentIconName = 'profile' | 'calendar' | 'flag' | 'star' | 'pen' | 'contract' | 'ball' | 'boot' | 'wallet' | 'send' | 'board' | 'close' | 'grid' | 'attempts';

const DISPLAY_FONT = 'font-black italic uppercase tracking-tighter';
const PANEL_GLASS = 'relative overflow-hidden rounded-[20px] border border-blue-300/25 bg-slate-950/54 shadow-[inset_0_1px_0_rgba(147,197,253,0.18),0_0_0_1px_rgba(37,99,235,0.08),0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-2xl';
const CELL_GLASS = 'relative overflow-hidden rounded-[16px] border border-blue-300/20 bg-slate-950/48 shadow-[inset_0_1px_0_rgba(147,197,253,0.14),0_0_0_1px_rgba(37,99,235,0.06),0_14px_40px_rgba(0,0,0,0.28)]';

const AgentSvgBackground: React.FC = () => (
  <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <radialGradient id="agent-bg-blue" cx="20%" cy="16%" r="68%">
        <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.30" />
        <stop offset="42%" stopColor="#0f172a" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#020617" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="agent-bg-teal" cx="80%" cy="36%" r="54%">
        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.13" />
        <stop offset="100%" stopColor="#020617" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="agent-bg-scan" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
        <stop offset="42%" stopColor="#60a5fa" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <pattern id="agent-grid" width="42" height="42" patternUnits="userSpaceOnUse">
        <path d="M42 0H0V42" fill="none" stroke="#93c5fd" strokeOpacity="0.055" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="1600" height="900" fill="#020817" />
    <rect width="1600" height="900" fill="url(#agent-bg-blue)" />
    <rect width="1600" height="900" fill="url(#agent-bg-teal)" />
    <rect width="1600" height="900" fill="url(#agent-grid)" />
    <path d="M-120 760C210 620 300 300 620 258C892 222 1010 390 1215 292C1366 219 1440 80 1720 62V900H-120Z" fill="#0b1227" fillOpacity="0.54" />
    <path d="M0 118H1600" stroke="#ffffff" strokeOpacity="0.10" />
    <path d="M150 110H1420" stroke="#60a5fa" strokeOpacity="0.18" />
    <path d="M1040 -80L1710 590" stroke="url(#agent-bg-scan)" strokeWidth="180" strokeLinecap="round" opacity="0.33" />
  </svg>
);

const PanelGloss: React.FC = () => (
  <>
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
    <div className="pointer-events-none absolute -left-24 -top-32 h-56 w-72 rotate-12 rounded-full bg-blue-400/12 blur-3xl" />
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-55" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="panel-gloss" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="48%" stopColor="#ffffff" stopOpacity="0.11" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M-180 92C20 12 190 42 370 0C470 -22 560 -54 760 -34" fill="none" stroke="url(#panel-gloss)" strokeWidth="54" />
    </svg>
  </>
);

const AgentIcon: React.FC<{ name: AgentIconName; className?: string }> = ({ name, className = 'h-6 w-6' }) => {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {name === 'profile' && <><circle cx="12" cy="8" r="3.2" {...common} /><path d="M5.7 19c1.2-3.4 4-5 6.3-5s5.1 1.6 6.3 5" {...common} /></>}
      {name === 'calendar' && <><rect x="4" y="5" width="16" height="15" rx="2.5" {...common} /><path d="M8 3.5v3M16 3.5v3M4 10h16" {...common} /></>}
      {name === 'flag' && <><path d="M6 20V5.5M6 6c3-2 5 .9 8.2-.7 1.2-.6 2.3-.7 3.8-.3v8.4c-1.5-.4-2.6-.3-3.8.3C11 15.3 9 12.4 6 14.4" {...common} /></>}
      {name === 'star' && <path d="M12 3.8l2.4 5 5.5.8-4 3.9 1 5.5-4.9-2.6L7.1 19l1-5.5-4-3.9 5.5-.8L12 3.8Z" {...common} />}
      {name === 'pen' && <><path d="M4 19.5l4.6-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 19.5Z" {...common} /><path d="M13.6 6.5l3.9 3.9M4 20h16" {...common} /></>}
      {name === 'contract' && <><path d="M7 3.8h7l3 3v13.4H7V3.8Z" {...common} /><path d="M14 4v4h4M9.5 11h5M9.5 14h5M9.5 17h3.5" {...common} /></>}
      {name === 'ball' && <><circle cx="12" cy="12" r="8.4" {...common} /><path d="M12 8.5l3.1 2.2-1.2 3.7h-3.8l-1.2-3.7L12 8.5ZM12 8.5V3.7M15.1 10.7l4.3-1.4M13.9 14.4l2.7 3.8M10.1 14.4l-2.7 3.8M8.9 10.7 4.6 9.3" {...common} /></>}
      {name === 'boot' && <><path d="M4 15.2c4.9.2 8.7-1.7 11-6.6l2.2 1.1-1.5 5.1 4.3 1.7v2.2H5c-1.2 0-1.8-.6-1-3.5Z" {...common} /><path d="M8 18.7v1.6M13 18.7v1.6M18 18.7v1.6" {...common} /></>}
      {name === 'wallet' && <><rect x="3.8" y="7" width="16.5" height="11.5" rx="2.5" {...common} /><path d="M6 7V5.5l9-2.2 1.4 3.7M16 12.5h4.3M16 12.5a1.5 1.5 0 1 0 0 3" {...common} /></>}
      {name === 'send' && <><path d="M20 4 4 11.5l6.7 2.1L13 20l7-16Z" {...common} /><path d="M10.7 13.6 20 4" {...common} /></>}
      {name === 'board' && <><circle cx="8" cy="8" r="2.2" {...common} /><circle cx="16" cy="8" r="2.2" {...common} /><path d="M4.5 18c.7-3 2.4-4.5 5.2-4.5M14.3 13.5c2.8 0 4.5 1.5 5.2 4.5M10.5 18c.4-2.2 1.2-3.4 1.5-3.4s1.1 1.2 1.5 3.4" {...common} /></>}
      {name === 'close' && <><circle cx="12" cy="12" r="8.6" {...common} /><path d="m9 9 6 6M15 9l-6 6" {...common} /></>}
      {name === 'grid' && <><rect x="4" y="4" width="6" height="6" rx="1.3" {...common} /><rect x="14" y="4" width="6" height="6" rx="1.3" {...common} /><rect x="4" y="14" width="6" height="6" rx="1.3" {...common} /><rect x="14" y="14" width="6" height="6" rx="1.3" {...common} /></>}
      {name === 'attempts' && <><path d="M10 3h4M12 3v6M8 21h8M7 21l3.5-8M17 21l-3.5-8" {...common} /><path d="M8.7 13h6.6l2.5 5.3H6.2L8.7 13Z" {...common} /></>}
    </svg>
  );
};

export const MysteryAgentNegotiationView: React.FC = () => {
  const {
    mysteryAgentOffer,
    clubs,
    userTeamId,
    players,
    navigateTo,
    submitMysteryAgentOffer,
    requestMysteryAgentBoardFunds,
    declineMysteryAgentOffer,
  } = useGame();

  const userClub = useMemo(() => clubs.find(club => club.id === userTeamId) ?? null, [clubs, userTeamId]);
  const userSquad = useMemo(() => userTeamId ? players[userTeamId] || [] : [], [players, userTeamId]);
  const highestSalary = useMemo(
    () => Math.max(80_000, ...userSquad.map(player => player.annualSalary || 0)),
    [userSquad]
  );

  const initialSalary = mysteryAgentOffer?.askingSalary ?? highestSalary;
  const initialSigningFee = mysteryAgentOffer?.askingSigningFee ?? Math.round(highestSalary * 0.75);

  const [salary, setSalary] = useState(initialSalary);
  const [signingFee, setSigningFee] = useState(initialSigningFee);
  const [years, setYears] = useState(3);
  const [goalBonus, setGoalBonus] = useState(0);
  const [assistBonus, setAssistBonus] = useState(0);
  const [cleanSheetBonus, setCleanSheetBonus] = useState(0);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultTone, setResultTone] = useState<'info' | 'success' | 'error'>('info');

  if (!mysteryAgentOffer || !userClub) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 p-6 text-white">
        <AgentSvgBackground />
        <div className="relative z-10 flex min-h-[calc(100vh-48px)] items-center justify-center">
          <div className={`${PANEL_GLASS} w-full max-w-lg p-8 text-center`}>
            <PanelGloss />
            <h1 className={`${DISPLAY_FONT} relative z-10 text-[clamp(2rem,5vw,3.5rem)] leading-none text-white`}>
              Brak aktywnych rozmów
            </h1>
            <button
              onClick={() => navigateTo(ViewState.DASHBOARD)}
              className={`${DISPLAY_FONT} relative z-10 mt-6 inline-flex h-12 items-center justify-center rounded-full border border-blue-200/45 bg-white px-7 text-sm text-slate-950 shadow-[0_12px_30px_rgba(59,130,246,0.16)]`}
            >
              Wróć
            </button>
          </div>
        </div>
      </div>
    );
  }

  const player = mysteryAgentOffer.player;
  const isGK = player.position === 'GK';
  const availableBudget = userClub.transferBudget + (mysteryAgentOffer.boardSupportAmount ?? 0);
  const contract = {
    signingFee,
    salary,
    years,
    goalBonus: isGK ? undefined : goalBonus || undefined,
    assistBonus: isGK ? undefined : assistBonus || undefined,
    cleanSheetBonus: isGK ? cleanSheetBonus || undefined : undefined,
  };
  const totalCost = MysteryAgentService.getTotalCost(contract);
  const missingBudget = Math.max(0, totalCost - availableBudget);
  const attemptsLeft = Math.max(0, mysteryAgentOffer.maxAttempts - mysteryAgentOffer.attemptsUsed);
  const maxSalary = Math.max(mysteryAgentOffer.askingSalary * 2, highestSalary * 3, salary);
  const maxSigningFee = Math.max(mysteryAgentOffer.askingSigningFee * 2, highestSalary * 3, signingFee);

  const handleSubmit = () => {
    const result = submitMysteryAgentOffer(contract);
    setResultMessage(result.message);
    setResultTone(result.accepted ? 'success' : result.ended ? 'error' : 'info');
  };

  const handleBoardRequest = () => {
    const result = requestMysteryAgentBoardFunds(contract);
    setResultMessage(result.message);
    setResultTone(result.approved ? 'success' : result.ended ? 'error' : 'info');
  };

  const isEnded = mysteryAgentOffer.status !== 'ACTIVE';
  const positionLabel = player.position;
  const nationality = player.nationalityCountry || player.nationality;

  return (
    <div className="agent-offer-shell relative min-h-screen overflow-hidden bg-slate-950 px-4 py-5 text-slate-50 sm:px-7 lg:px-10">
      <AgentSvgBackground />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[1500px] flex-col">
        <header className="mb-6 shrink-0 border-b border-blue-200/15 pb-5">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className={`${DISPLAY_FONT} whitespace-nowrap text-[clamp(0.72rem,1.1vw,0.95rem)] leading-none text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]`}>
                Tajemniczy agent
              </p>
              <h1 className={`${DISPLAY_FONT} mt-2 whitespace-nowrap text-[clamp(2.15rem,5.2vw,4.75rem)] leading-[0.86] text-white drop-shadow-[0_8px_22px_rgba(0,0,0,0.6)]`}>
                Propozycja agenta
              </h1>
            </div>
            <button
              onClick={() => navigateTo(ViewState.DASHBOARD)}
              className={`${DISPLAY_FONT} group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-blue-300/24 bg-blue-400/7 px-5 text-xs text-white shadow-[inset_0_1px_0_rgba(147,197,253,0.16),0_16px_45px_rgba(0,0,0,0.30)] backdrop-blur-xl transition hover:border-blue-300/45 hover:bg-blue-400/12`}
            >
              <AgentIcon name="grid" className="h-4 w-4 text-blue-200 transition group-hover:text-blue-100" />
              Dashboard
            </button>
          </div>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(430px,0.82fr)_minmax(580px,1fr)]">
          <section className={`${PANEL_GLASS} p-5 sm:p-6`}>
            <PanelGloss />
            <div className="relative z-10 flex h-full min-h-0 flex-col">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] border border-blue-300/50 bg-gradient-to-br from-blue-500/22 to-slate-950/58 text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_38px_rgba(37,99,235,0.20)]">
                  <AgentIcon name="profile" className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <p className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Klient agenta
                  </p>
                  <h2 className={`${DISPLAY_FONT} mt-2 whitespace-nowrap text-[clamp(1.55rem,2.35vw,2.25rem)] leading-none text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]`}>
                    {player.firstName} {player.lastName}
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-[18px] border border-blue-300/20 bg-slate-950/38 shadow-[inset_0_1px_0_rgba(147,197,253,0.10)]">
                <InfoBox icon="calendar" label="Wiek" value={`${player.age} lat`} />
                <InfoBox icon="profile" label="Pozycja" value={positionLabel} />
                <InfoBox icon="flag" label="Narodowość" value={nationality} />
                <InfoBox icon="star" label="Overall" value="Ukryty" accent />
              </div>

              <div className={`${CELL_GLASS} mt-5 p-5`}>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-300/40 bg-amber-300/8 text-amber-300">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.8 6.2C6.5 8 5.3 10 5.3 12.7c0 2.1 1.1 3.6 3.1 3.6 1.6 0 2.7-1.1 2.7-2.6 0-1.4-.9-2.4-2.2-2.5.1-1.4.8-2.6 2.2-3.8L8.8 6.2Zm7.1 0c-2.3 1.8-3.5 3.8-3.5 6.5 0 2.1 1.1 3.6 3.1 3.6 1.6 0 2.7-1.1 2.7-2.6 0-1.4-.9-2.4-2.2-2.5.1-1.4.8-2.6 2.2-3.8l-2.3-1.2Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className={`${DISPLAY_FONT} text-[clamp(1.02rem,1.42vw,1.42rem)] leading-[1.18] text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.22)]`}>
                      "{mysteryAgentOffer.lastAgentMessage}"
                    </p>
                    <p className="mt-4 text-[clamp(0.73rem,0.88vw,0.86rem)] leading-relaxed text-slate-300">
                      Agent przekazał podstawowe informacje o zawodniku. Szczegółowy raport sportowy nie jest jeszcze dostępny.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <MetricBox icon="attempts" label="Próby" value={`${attemptsLeft}/${mysteryAgentOffer.maxAttempts}`} />
                <MetricBox icon="wallet" label="Budżet" value={`${availableBudget.toLocaleString('pl-PL')} PLN`} />
              </div>
            </div>
          </section>

          <section className={`${PANEL_GLASS} p-5 sm:p-6`}>
            <PanelGloss />
            <div className="relative z-10 flex h-full min-h-0 flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <MoneyControl
                  icon="pen"
                  label="Kwota za podpis"
                  value={signingFee}
                  max={maxSigningFee}
                  step={5_000}
                  tone="blue"
                  onChange={setSigningFee}
                />
                <MoneyControl
                  icon="contract"
                  label="Kwota kontraktu"
                  value={salary}
                  max={maxSalary}
                  step={5_000}
                  tone="emerald"
                  onChange={setSalary}
                />
              </div>

              <div className={`${CELL_GLASS} p-5`}>
                <div className="relative z-10 flex items-center gap-3">
                  <AgentIcon name="calendar" className="h-6 w-6 shrink-0 text-blue-300" />
                  <p className={`${DISPLAY_FONT} whitespace-nowrap text-base text-slate-300`}>
                    Długość kontraktu
                  </p>
                </div>
                <div className="relative z-10 mt-4 grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map(yearOption => (
                    <button
                      key={yearOption}
                      onClick={() => setYears(yearOption)}
                      disabled={isEnded}
                      className={`${DISPLAY_FONT} h-12 rounded-[12px] border text-lg transition ${
                        years === yearOption
                          ? 'border-blue-300/80 bg-gradient-to-b from-blue-500/72 to-blue-700/56 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_12px_28px_rgba(37,99,235,0.35)]'
                          : 'border-blue-300/12 bg-blue-400/6 text-slate-400 shadow-[inset_0_1px_0_rgba(147,197,253,0.08)] hover:border-blue-300/35 hover:bg-blue-400/10'
                      }`}
                    >
                      {yearOption}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {isGK ? (
                  <MoneyControl
                    icon="star"
                    label="Bonus za czyste konto"
                    value={cleanSheetBonus}
                    max={50_000}
                    step={500}
                    tone="violet"
                    onChange={setCleanSheetBonus}
                  />
                ) : (
                  <>
                    <MoneyControl
                      icon="ball"
                      label="Bonus bramkowy"
                      value={goalBonus}
                      max={50_000}
                      step={500}
                      tone="blue"
                      onChange={setGoalBonus}
                    />
                    <MoneyControl
                      icon="boot"
                      label="Bonus za asystę"
                      value={assistBonus}
                      max={35_000}
                      step={500}
                      tone="sky"
                      onChange={setAssistBonus}
                    />
                  </>
                )}
              </div>

              <div className={`${CELL_GLASS} p-5`}>
                <div className="relative z-10 flex items-center justify-between gap-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <AgentIcon name="wallet" className="h-7 w-7 shrink-0 text-slate-300" />
                    <span className={`${DISPLAY_FONT} whitespace-nowrap text-base text-slate-400`}>
                      Łączny pakiet
                    </span>
                  </div>
                  <span className={`${DISPLAY_FONT} whitespace-nowrap text-[clamp(1.42rem,2.05vw,2rem)] leading-none text-white`}>
                    {totalCost.toLocaleString('pl-PL')} PLN
                  </span>
                </div>
                {(missingBudget > 0 || mysteryAgentOffer.boardSupportAmount) && (
                  <div className="relative z-10 mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-black uppercase tracking-wide">
                    {missingBudget > 0 && <span className="whitespace-nowrap text-red-300">Brakuje {missingBudget.toLocaleString('pl-PL')} PLN</span>}
                    {mysteryAgentOffer.boardSupportAmount ? (
                      <span className="whitespace-nowrap text-emerald-300">Zarząd dołożył {mysteryAgentOffer.boardSupportAmount.toLocaleString('pl-PL')} PLN</span>
                    ) : null}
                  </div>
                )}
              </div>

              {resultMessage && (
                <div className={`${CELL_GLASS} p-4 ${
                  resultTone === 'success'
                    ? 'border-emerald-400/35 bg-emerald-950/25 text-emerald-100'
                    : resultTone === 'error'
                      ? 'border-red-400/35 bg-red-950/25 text-red-100'
                      : 'border-amber-400/35 bg-amber-950/25 text-amber-100'
                }`}>
                  <p className={`${DISPLAY_FONT} relative z-10 text-[clamp(0.95rem,1.15vw,1.15rem)] leading-tight`}>
                    {resultMessage}
                  </p>
                </div>
              )}

              <div className="mt-auto grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(160px,0.48fr)]">
                <button
                  onClick={handleSubmit}
                  disabled={isEnded}
                  className={`${DISPLAY_FONT} inline-flex h-16 items-center justify-center gap-3 rounded-[12px] border border-emerald-200/35 bg-gradient-to-b from-emerald-400/90 to-emerald-700/82 px-5 text-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_16px_38px_rgba(16,185,129,0.22)] transition hover:brightness-110 disabled:border-blue-300/10 disabled:bg-none disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none`}
                >
                  <AgentIcon name="send" className="h-6 w-6 shrink-0" />
                  Wyślij ofertę
                </button>
                <button
                  onClick={handleBoardRequest}
                  disabled={isEnded || missingBudget <= 0 || mysteryAgentOffer.boardRequestUsed}
                  className={`${DISPLAY_FONT} inline-flex h-16 items-center justify-center gap-2 rounded-[12px] border border-blue-300/16 bg-blue-950/24 px-5 text-base text-blue-100 shadow-[inset_0_1px_0_rgba(147,197,253,0.10)] transition hover:border-blue-300/34 hover:bg-blue-500/20 disabled:text-slate-500 disabled:opacity-70`}
                >
                  <AgentIcon name="board" className="h-6 w-6 shrink-0" />
                  Do zarządu
                </button>
                <button
                  onClick={declineMysteryAgentOffer}
                  disabled={isEnded}
                  className={`${DISPLAY_FONT} inline-flex h-13 items-center justify-center gap-3 rounded-[12px] border border-red-400/45 bg-red-950/18 px-5 text-sm text-red-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-red-900/28 disabled:opacity-45 md:col-span-2`}
                >
                  <AgentIcon name="close" className="h-5 w-5 shrink-0" />
                  Zrezygnuj z rozmów
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <style>{`
        .agent-offer-shell {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .agent-offer-shell input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(96,165,250,0.95), rgba(96,165,250,0.52), rgba(255,255,255,0.22));
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.22), 0 0 0 1px rgba(255,255,255,0.13);
          outline: none;
        }

        .agent-offer-shell input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 2px solid rgba(191,219,254,0.86);
          background: linear-gradient(180deg, #60a5fa, #2563eb);
          box-shadow: 0 8px 20px rgba(37,99,235,0.42), inset 0 1px 0 rgba(255,255,255,0.45);
          cursor: pointer;
        }

        .agent-offer-shell input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 2px solid rgba(191,219,254,0.86);
          background: linear-gradient(180deg, #60a5fa, #2563eb);
          box-shadow: 0 8px 20px rgba(37,99,235,0.42), inset 0 1px 0 rgba(255,255,255,0.45);
          cursor: pointer;
        }

        .agent-offer-shell input[type="number"]::-webkit-outer-spin-button,
        .agent-offer-shell input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .agent-offer-shell input[type="number"] {
          appearance: textfield;
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

const InfoBox: React.FC<{ icon: AgentIconName; label: string; value: string; accent?: boolean }> = ({ icon, label, value, accent }) => (
  <div className="relative min-w-0 border-blue-200/12 p-4 odd:border-r [&:nth-child(-n+2)]:border-b">
    <div className="flex items-center gap-3">
      <AgentIcon name={icon} className="h-6 w-6 shrink-0 text-blue-300" />
      <div className="min-w-0">
        <p className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className={`${DISPLAY_FONT} mt-1 whitespace-nowrap text-[clamp(0.95rem,1.18vw,1.22rem)] leading-none ${accent ? 'text-amber-300' : 'text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

const MetricBox: React.FC<{ icon: AgentIconName; label: string; value: string }> = ({ icon, label, value }) => (
  <div className={`${CELL_GLASS} min-h-[88px] p-4`}>
    <div className="relative z-10 flex h-full items-center gap-4">
      <AgentIcon name={icon} className="h-7 w-7 shrink-0 text-blue-300" />
      <div className="min-w-0">
        <p className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className={`${DISPLAY_FONT} mt-1 whitespace-nowrap text-[clamp(1.05rem,1.25vw,1.35rem)] leading-none text-white`}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

const MoneyControl: React.FC<{
  icon: AgentIconName;
  label: string;
  value: number;
  max: number;
  step: number;
  tone: 'blue' | 'emerald' | 'sky' | 'violet';
  onChange: (value: number) => void;
}> = ({ icon, label, value, max, step, tone, onChange }) => {
  const toneClass = {
    blue: 'text-blue-300',
    emerald: 'text-emerald-300',
    sky: 'text-sky-300',
    violet: 'text-violet-300',
  }[tone];

  return (
    <div className={`${CELL_GLASS} min-h-[132px] p-5`}>
      <div className="relative z-10 flex items-start gap-4">
        <AgentIcon name={icon} className="mt-1 h-8 w-8 shrink-0 text-slate-300" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <span className={`${DISPLAY_FONT} max-w-[128px] whitespace-nowrap text-[clamp(0.78rem,0.9vw,0.98rem)] leading-tight text-slate-300`}>
              {label}
            </span>
            <div className="flex h-10 min-w-[160px] items-center justify-end gap-2 rounded-[10px] border border-blue-300/18 bg-black/35 px-3 shadow-[inset_0_1px_0_rgba(147,197,253,0.08)]">
              <input
                type="number"
                value={value}
                min={0}
                max={max}
                step={step}
                onChange={event => onChange(Math.max(0, Math.min(max, parseInt(event.target.value, 10) || 0)))}
                className={`${DISPLAY_FONT} w-[104px] bg-transparent text-right text-lg leading-none outline-none ${toneClass}`}
              />
              <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-wide text-slate-400">PLN</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={max}
            step={step}
            value={value}
            onChange={event => onChange(parseInt(event.target.value, 10) || 0)}
            className="mt-5 w-full"
          />
        </div>
      </div>
    </div>
  );
};
