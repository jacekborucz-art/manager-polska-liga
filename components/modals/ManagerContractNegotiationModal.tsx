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
        <stop offset="0" stopColor="#071827" />
        <stop offset="0.52" stopColor="#09111f" />
        <stop offset="1" stopColor="#050913" />
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
    <path d="M0 0H560L390 900H0Z" fill="url(#club-ribbon)" opacity="0.34" />
    <path d="M0 0H210L76 900H0Z" fill={primary} opacity="0.15" />
    <path d="M147 0L25 900M233 0L112 900" stroke={secondary} strokeOpacity="0.3" strokeWidth="2" />
    <g transform="translate(75 170) rotate(-5 250 290)" opacity="0.22">
      <rect x="10" y="10" width="470" height="600" rx="24" fill="#ddecf5" />
      <path d="M78 100H405M78 150H362M78 215H410M78 260H392M78 325H410M78 370H340" stroke="#0c2a3f" strokeWidth="11" strokeLinecap="round" />
      <path d="M220 505c55-45 112-53 184-18M262 535c47-25 91-29 139-12" fill="none" stroke={primary} strokeWidth="10" strokeLinecap="round" />
      <circle cx="91" cy="510" r="38" fill="none" stroke={secondary} strokeWidth="8" />
    </g>
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
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!negotiation) return;
    setTargetId(negotiation.clubTerms.target.id);
    setDuration(negotiation.clubTerms.durationYears);
  }, [negotiation?.id, negotiation?.clubTerms.target.id, negotiation?.clubTerms.durationYears]);

  const selectedTarget = negotiation?.availableTargets.find(target => target.id === targetId) ?? negotiation?.clubTerms.target;
  const proposedSalary = useMemo(() => {
    if (!club || !selectedTarget) return 0;
    return ManagerContractService.calculateSalaryForTarget(club, clubs, managerProfile, selectedTarget);
  }, [club, clubs, managerProfile, selectedTarget]);

  if (!negotiation || !club) return null;
  const primary = club.colorsHex?.[0] || '#12b8d6';
  const secondary = club.colorsHex?.[1] || '#f5b91b';
  const logo = getClubLogo(club.id);
  const agreed = negotiation.status === 'AGREED' ? negotiation.agreedTerms : null;
  const displayed = agreed ?? negotiation.clubTerms;
  const heading = negotiation.source === 'RENEWAL' ? 'Przedłużenie współpracy' : 'Oferta kontraktu';
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
    submitManagerContractProposal(selectedTarget.id, duration);
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
          <aside className="flex min-h-0 flex-col border-r border-white/10 px-11 py-10">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/15 bg-black/35 p-3 shadow-2xl backdrop-blur-md">
                {logo ? <img src={logo} alt={club.name} className="h-full w-full object-contain" /> : <span className="text-3xl text-white">{club.name.slice(0, 2)}</span>}
              </div>
              <div>
                <p className="text-[12px] font-black italic uppercase tracking-tighter" style={{ color: secondary }}>Zarząd klubu</p>
                <h2 className="mt-1 text-2xl font-semibold leading-tight text-white">{club.name}</h2>
              </div>
            </div>

            <div className="mt-12 rounded-[24px] border border-white/12 bg-[#06111d]/88 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <p className="text-xs font-medium text-slate-400">Aktualna propozycja klubu</p>
              <p className="mt-3 text-xl font-semibold text-white">{displayed.target.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{displayed.target.description}</p>
              <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                <div className="flex justify-between gap-4"><span className="text-slate-500">Długość</span><strong className="text-white">{displayed.durationYears} {displayed.durationYears === 1 ? 'rok' : 'lata'}</strong></div>
                <div className="flex justify-between gap-4"><span className="text-slate-500">Wynagrodzenie</span><strong className="text-right text-white">{money(displayed.annualSalary)}</strong></div>
                <div className="flex justify-between gap-4"><span className="text-slate-500">Do</span><strong className="text-white">{new Date(displayed.endDate).toLocaleDateString('pl-PL')}</strong></div>
              </div>
            </div>

            <div className="mt-auto rounded-2xl border-l-2 bg-black/20 px-5 py-4" style={{ borderColor: secondary }}>
              <p className="text-xs font-medium text-slate-400">Stanowisko</p>
              <p className="mt-1 text-base font-semibold text-white">Trener pierwszego zespołu</p>
            </div>
          </aside>

          <main className="relative min-h-0 overflow-y-auto px-12 py-10 custom-scrollbar">
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
                    <h3 className="mt-1 text-xl font-semibold text-white">Wybierz ambicję na sezon</h3>
                  </div>
                  <div className="flex rounded-xl border border-white/10 bg-black/25 p-1">
                    {([1, 2, 3] as ManagerContractDurationYears[]).map(years => (
                      <button key={years} type="button" onClick={() => setDuration(years)} className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${duration === years ? 'text-white shadow-lg' : 'text-slate-500 hover:text-white'}`} style={duration === years ? { background: `linear-gradient(135deg, ${primary}, ${secondary})` } : undefined}>{years} {years === 1 ? 'rok' : 'lata'}</button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {negotiation.availableTargets.map((target, index) => {
                    const selected = target.id === selectedTarget?.id;
                    return (
                      <button key={target.id} type="button" onClick={() => setTargetId(target.id)} className={`group relative min-h-[110px] overflow-hidden rounded-[18px] border p-5 text-left transition-all duration-300 ${selected ? 'translate-x-1 border-white/35 bg-white/11 shadow-[0_14px_36px_rgba(0,0,0,0.28)]' : index % 2 ? 'border-white/8 bg-[#101827]/65 hover:border-white/20' : 'border-white/8 bg-[#071522]/72 hover:border-white/20'}`}>
                        <span className="absolute bottom-0 left-0 h-1 transition-all" style={{ width: selected ? '100%' : '0%', background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
                        <span className="text-[11px] font-semibold text-slate-500">CEL {String(index + 1).padStart(2, '0')}</span>
                        <strong className="mt-1 block text-[17px] font-semibold text-white">{target.label}</strong>
                        <span className="mt-1.5 block text-[13px] leading-5 text-slate-400">{target.description}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-[20px] border border-white/10 bg-black/30 px-6 py-5 backdrop-blur-md">
                  <div>
                    <p className="text-xs text-slate-500">Stawka wynikająca z wybranego celu</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{money(proposedSalary)}</p>
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
