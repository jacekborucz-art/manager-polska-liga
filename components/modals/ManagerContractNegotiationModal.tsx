import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ManagerContractDurationYears } from '../../types';
import { ManagerContractService } from '../../services/ManagerContractService';
import { getClubLogo } from '../../resources/ClubLogoAssets';

const money = (value: number): string => `${Math.round(value).toLocaleString('pl-PL')} PLN / rok`;

const ContractOfficeScene: React.FC<{ primary: string; secondary: string }> = ({ primary, secondary }) => (
  <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 1500 900" preserveAspectRatio="none">
    <defs>
      <linearGradient id="contract-shell" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#030b13" />
        <stop offset="0.52" stopColor="#030812" />
        <stop offset="1" stopColor="#01040a" />
      </linearGradient>
      <linearGradient id="club-ribbon" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={primary} stopOpacity="0.78" />
        <stop offset="0.55" stopColor={secondary} stopOpacity="0.44" />
        <stop offset="1" stopColor={primary} stopOpacity="0.04" />
      </linearGradient>
      <pattern id="contract-grid" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.2" fill="#76d7ef" opacity="0.12" />
      </pattern>
      <filter id="contract-glow"><feGaussianBlur stdDeviation="16" /></filter>
    </defs>
    <rect width="1500" height="900" rx="44" fill="url(#contract-shell)" />
    <rect width="1500" height="900" rx="44" fill="url(#contract-grid)" />
    <path d="M0 0H560L390 900H0Z" fill="url(#club-ribbon)" opacity="0.2" />
    <path d="M0 0H210L76 900H0Z" fill={primary} opacity="0.09" />
    <path d="M147 0L25 900M233 0L112 900" stroke={secondary} strokeOpacity="0.3" strokeWidth="2" />
    <g transform="translate(75 170) rotate(-5 250 290)" opacity="0.1">
      <rect x="10" y="10" width="470" height="600" rx="24" fill="#ddecf5" />
      <path d="M78 100H405M78 150H362M78 215H410M78 260H392M78 325H410M78 370H340" stroke="#0c2a3f" strokeWidth="11" strokeLinecap="round" />
      <path d="M220 505c55-45 112-53 184-18M262 535c47-25 91-29 139-12" fill="none" stroke={primary} strokeWidth="10" strokeLinecap="round" />
      <circle cx="91" cy="510" r="38" fill="none" stroke={secondary} strokeWidth="8" />
    </g>
    <rect x="360" width="1140" height="900" fill="#01050c" opacity="0.78" />
    <g transform="translate(1110 470)" fill="none" stroke="#7dd3fc" strokeOpacity="0.12">
      <rect width="315" height="205" rx="18" strokeWidth="4" />
      <path d="M157 0v205M0 102h315M0 45h65v114H0M315 45h-65v114h65" strokeWidth="3" />
      <circle cx="157" cy="102" r="42" strokeWidth="3" />
    </g>
    <circle cx="1340" cy="94" r="125" fill={primary} opacity="0.1" filter="url(#contract-glow)" />
    <path d="M520 1H1498M520 898H1498" stroke={primary} strokeOpacity="0.72" strokeWidth="3" />
  </svg>
);

export const ManagerContractNegotiationModal: React.FC = () => {
  const {
    managerContractNegotiation: negotiation,
    clubs,
    managerProfile,
    submitManagerContractProposal,
    signAgreedManagerContract,
    closeManagerContractNegotiation,
  } = useGame();
  const club = negotiation ? clubs.find(candidate => candidate.id === negotiation.clubId) : undefined;
  const [targetId, setTargetId] = useState('');
  const [duration, setDuration] = useState<ManagerContractDurationYears>(2);
  const [annualSalary, setAnnualSalary] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!negotiation) return;
    setTargetId(negotiation.clubTerms.target.id);
    setDuration(negotiation.clubTerms.durationYears);
    setAnnualSalary(negotiation.clubTerms.annualSalary);
  }, [negotiation?.id, negotiation?.clubTerms.target.id, negotiation?.clubTerms.durationYears, negotiation?.clubTerms.annualSalary]);

  const selectedTarget = negotiation?.availableTargets.find(target => target.id === targetId) ?? negotiation?.clubTerms.target;
  const targetSalary = useMemo(() => {
    if (!club || !selectedTarget) return 0;
    return ManagerContractService.calculateSalaryForTarget(club, clubs, managerProfile, selectedTarget);
  }, [club, clubs, managerProfile, selectedTarget]);
  const salaryLeverage = useMemo(
    () => club ? ManagerContractService.getManagerSalaryLeverage(club, managerProfile) : null,
    [club, managerProfile]
  );

  const selectTarget = (nextTargetId: string) => {
    const nextTarget = negotiation?.availableTargets.find(target => target.id === nextTargetId);
    if (!club || !nextTarget) return;
    setTargetId(nextTargetId);
    setAnnualSalary(ManagerContractService.calculateSalaryForTarget(club, clubs, managerProfile, nextTarget));
  };

  if (!negotiation || !club) return null;
  const primary = club.colorsHex?.[0] || '#12b8d6';
  const secondary = club.colorsHex?.[1] || '#f5b91b';
  const logo = getClubLogo(club.id);
  const agreed = negotiation.status === 'AGREED' ? negotiation.agreedTerms : null;
  const displayed = agreed ?? negotiation.clubTerms;
  const heading = negotiation.source === 'RENEWAL'
    ? 'Przedłużenie współpracy'
    : negotiation.source === 'RENEGOTIATION'
      ? 'Renegocjacja kontraktu'
      : 'Oferta kontraktu';
  const responseTone = negotiation.lastResponseType === 'VETO' || negotiation.lastResponseType === 'FAILED'
    ? {
        label: negotiation.lastResponseType === 'VETO' ? 'Veto zarządu' : 'Negocjacje zakończone',
        border: 'border-red-400/35',
        background: 'bg-red-950/35',
        labelColor: 'text-red-300',
      }
    : negotiation.lastResponseType === 'COUNTER'
      ? { label: 'Kontroferta klubu', border: 'border-amber-300/30', background: 'bg-amber-950/25', labelColor: 'text-amber-200' }
      : negotiation.lastResponseType === 'ACCEPTED'
        ? { label: 'Porozumienie', border: 'border-emerald-300/30', background: 'bg-emerald-950/25', labelColor: 'text-emerald-300' }
        : null;

  const submit = () => {
    if (!selectedTarget || busy) return;
    setBusy(true);
    submitManagerContractProposal(selectedTarget.id, duration, annualSalary);
    window.setTimeout(() => setBusy(false), 280);
  };

  const sign = () => {
    if (busy) return;
    setBusy(true);
    signAgreedManagerContract();
  };

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-[#010307]/92 p-5 backdrop-blur-xl">
      <section className="relative h-[min(920px,calc(100vh-38px))] w-[min(1540px,calc(100vw-42px))] overflow-hidden rounded-[42px] border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,0.75)]">
        <ContractOfficeScene primary={primary} secondary={secondary} />
        <div className="relative z-10 grid h-full grid-cols-[370px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-r border-white/10 bg-[#020711]/55 px-11 py-10">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/15 bg-black/35 p-3 shadow-2xl backdrop-blur-md">
                {logo ? <img src={logo} alt={club.name} className="h-full w-full object-contain" /> : <span className="text-3xl text-white">{club.name.slice(0, 2)}</span>}
              </div>
              <div>
                <p className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: secondary }}>Zarząd klubu</p>
                <h2 className="mt-1 text-2xl font-semibold leading-tight text-white">{club.name}</h2>
              </div>
            </div>

            <div className="mt-12 rounded-[24px] border border-white/15 bg-[#020812]/95 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.62)] backdrop-blur-md">
              <p className="text-xs font-medium text-slate-400">Aktualna propozycja klubu</p>
              <p className="mt-3 text-xl font-semibold text-white">{displayed.target.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{displayed.target.description}</p>
              <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                <div className="flex justify-between gap-4"><span className="text-slate-500">Długość</span><strong className="text-white">{displayed.durationYears} {displayed.durationYears === 1 ? 'rok' : 'lata'}</strong></div>
                <div className="flex justify-between gap-4"><span className="text-slate-500">Wynagrodzenie</span><strong className="text-right text-white">{money(displayed.annualSalary)}</strong></div>
                {displayed.salaryReviewAfterOneSeason && (
                  <div className="flex justify-between gap-4"><span className="text-slate-500">Przegląd stawki</span><strong className="text-right text-amber-200">Po 1 sezonie</strong></div>
                )}
                <div className="flex justify-between gap-4"><span className="text-slate-500">Do</span><strong className="text-white">{new Date(displayed.endDate).toLocaleDateString('pl-PL')}</strong></div>
              </div>
            </div>

            <div className="mt-auto rounded-2xl border-l-2 bg-[#020812]/90 px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.4)]" style={{ borderColor: secondary }}>
              <p className="text-xs font-medium text-slate-400">Stanowisko</p>
              <p className="mt-1 text-base font-semibold text-white">Trener pierwszego zespołu</p>
            </div>
          </aside>

          <main className="relative min-h-0 overflow-y-auto bg-[#020711]/78 px-12 py-10 custom-scrollbar">
            <button type="button" onClick={closeManagerContractNegotiation} className="absolute right-8 top-7 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-xl text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Zamknij">✕</button>
            <p className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: secondary }}>Biuro kontraktowe · {heading}</p>
            <h1 className="mt-2 pr-14 text-[42px] font-semibold leading-tight tracking-[-0.03em] text-white">Ustal warunki współpracy</h1>
            {responseTone ? (
              <div className={`mt-5 max-w-4xl rounded-[18px] border px-5 py-4 backdrop-blur-md ${responseTone.border} ${responseTone.background}`}>
                <p className={`text-[11px] font-black italic uppercase tracking-tighter ${responseTone.labelColor}`}>{responseTone.label}</p>
                <p className="mt-2 text-[15px] font-medium leading-6 text-slate-100">{negotiation.message}</p>
              </div>
            ) : (
              <p className="mt-3 max-w-3xl text-[16px] leading-7 text-slate-300">{negotiation.message}</p>
            )}

            {negotiation.status === 'NEGOTIATING' && (
              <>
                <div className="mt-8 flex items-end justify-between gap-5 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Twój deklarowany cel</p>
                    <h3 className="mt-1 text-xl font-black italic uppercase tracking-tighter text-white">Ustal cel na sezon</h3>
                  </div>
                  <div className="flex rounded-xl border border-white/10 bg-[#01040a]/90 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    {([1, 2, 3] as ManagerContractDurationYears[]).map(years => (
                      <button key={years} type="button" onClick={() => setDuration(years)} className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${duration === years ? 'text-white shadow-lg' : 'text-slate-500 hover:text-white'}`} style={duration === years ? { background: `linear-gradient(135deg, ${primary}, ${secondary})` } : undefined}>{years} {years === 1 ? 'rok' : 'lata'}</button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Cel na sezon">
                  {negotiation.availableTargets.map(target => {
                    const selected = target.id === selectedTarget?.id;
                    return (
                      <button
                        key={target.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => selectTarget(target.id)}
                        className={`group flex min-h-[82px] items-start gap-4 rounded-[14px] border px-4 py-3.5 text-left transition-colors ${selected ? 'border-white/35 bg-[#0b1725]/98 shadow-[0_10px_28px_rgba(0,0,0,0.5)]' : 'border-white/10 bg-[#040a12]/95 hover:border-white/25 hover:bg-[#08111d]/95'}`}
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border text-sm font-black text-white transition ${selected ? 'border-white/55 shadow-[0_0_16px_rgba(255,255,255,0.2)]' : 'border-slate-500/70 bg-black/45'}`}
                          style={selected ? { background: `linear-gradient(135deg, ${primary}, ${secondary})` } : undefined}
                          aria-hidden="true"
                        >
                          {selected ? '✓' : ''}
                        </span>
                        <span className="min-w-0">
                          <strong className="block text-[16px] font-semibold text-white">{target.label}</strong>
                          <span className="mt-1 block text-[13px] leading-5 text-slate-400">{target.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-[20px] border border-white/12 bg-[#01050c]/95 px-6 py-5 shadow-[0_14px_36px_rgba(0,0,0,0.5)] backdrop-blur-md">
                  <div>
                    <p className="text-xs text-slate-500">Proponowane wynagrodzenie</p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAnnualSalary(value => Math.max(ManagerContractService.MANAGER_SALARY_NEGOTIATION_STEP, value - ManagerContractService.MANAGER_SALARY_NEGOTIATION_STEP))}
                        className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/15 bg-white/5 text-xl font-black italic uppercase tracking-tighter text-white transition hover:border-white/35 hover:bg-white/10"
                        aria-label="Zmniejsz wynagrodzenie o 100 tysięcy złotych"
                      >−</button>
                      <p className="min-w-[250px] text-center text-2xl font-semibold text-white">{money(annualSalary || targetSalary)}</p>
                      <button
                        type="button"
                        onClick={() => setAnnualSalary(value => Math.min(100_000_000, value + ManagerContractService.MANAGER_SALARY_NEGOTIATION_STEP))}
                        className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/15 bg-white/5 text-xl font-black italic uppercase tracking-tighter text-white transition hover:border-white/35 hover:bg-white/10"
                        aria-label="Zwiększ wynagrodzenie o 100 tysięcy złotych"
                      >+</button>
                    </div>
                    {salaryLeverage && (
                      <p className={`mt-2 text-[12px] font-black italic uppercase tracking-tighter ${salaryLeverage.isDiscountedOffer ? 'text-amber-300' : 'text-emerald-300'}`}>
                        {salaryLeverage.isDiscountedOffer
                          ? 'Oferta uwzględnia mniejsze doświadczenie · renegocjacja możliwa po roku pracy'
                          : 'Doświadczenie trenera wzmacnia pozycję w negocjacjach finansowych'}
                      </p>
                    )}
                  </div>
                  <button type="button" onClick={submit} disabled={busy} className="rounded-[16px] px-9 py-4 text-sm font-black italic uppercase tracking-tighter text-white shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition hover:scale-[1.02] disabled:opacity-50" style={{ background: `linear-gradient(120deg, ${primary}, ${secondary})` }}>Przedstaw propozycję</button>
                </div>
              </>
            )}

            {agreed && (
              <div className="mt-10 rounded-[28px] border border-emerald-300/25 bg-emerald-950/25 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-lg">
                <p className="text-sm font-semibold text-emerald-300">Porozumienie osiągnięte</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">{agreed.target.label}</h3>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{agreed.target.description}</p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[['Czas umowy', `${agreed.durationYears} ${agreed.durationYears === 1 ? 'rok' : 'lata'}`], ['Wynagrodzenie', money(agreed.annualSalary)], ['Koniec umowy', new Date(agreed.endDate).toLocaleDateString('pl-PL')]].map(([label, value]) => <div key={label} className="border-l border-white/15 pl-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>)}
                </div>
                <button type="button" onClick={sign} disabled={busy} className="mt-10 w-full rounded-[18px] py-5 text-base font-black italic uppercase tracking-tighter text-white shadow-2xl transition hover:brightness-110 disabled:opacity-50" style={{ background: `linear-gradient(100deg, ${primary}, ${secondary})` }}>Podpisz kontrakt</button>
              </div>
            )}

            {negotiation.status === 'FAILED' && (
              <div className="mt-12 rounded-[26px] border border-red-300/20 bg-red-950/20 p-9 backdrop-blur-md">
                <p className="text-sm font-semibold text-red-300">Rozmowy zakończone</p>
                <p className="mt-3 text-2xl font-semibold text-white">Klub nie zaakceptował warunków.</p>
                <button type="button" onClick={closeManagerContractNegotiation} className="mt-8 rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Wyjdź z negocjacji</button>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};
