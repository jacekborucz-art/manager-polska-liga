import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';
import {
  PlayerAttributes,
  Player,
  PlayerPosition,
  Region,
  TransferLikelihood,
  TransferLikelihoodFilter,
  TransferScout,
  TransferScoutContractYears,
  TransferScoutingContractStatus,
  TransferScoutingFilters,
} from '../../types';
import { TransferScoutingService } from '../../services/TransferScoutingService';

interface TransferScoutingModalProps {
  onClose: () => void;
}

const ATTRIBUTE_OPTIONS: { key: keyof PlayerAttributes; label: string }[] = [
  { key: 'pace', label: 'Szybkość' },
  { key: 'strength', label: 'Siła' },
  { key: 'stamina', label: 'Kondycja' },
  { key: 'defending', label: 'Obrona' },
  { key: 'passing', label: 'Podania' },
  { key: 'attacking', label: 'Atak' },
  { key: 'finishing', label: 'Wykończenie' },
  { key: 'technique', label: 'Technika' },
  { key: 'vision', label: 'Wizja' },
  { key: 'dribbling', label: 'Drybling' },
  { key: 'heading', label: 'Gra głową' },
  { key: 'positioning', label: 'Ustawienie' },
  { key: 'goalkeeping', label: 'Bramkarstwo' },
  { key: 'freeKicks', label: 'Rzuty wolne' },
  { key: 'talent', label: 'Talent' },
  { key: 'penalties', label: 'Rzuty karne' },
  { key: 'corners', label: 'Rzuty rożne' },
  { key: 'aggression', label: 'Agresja' },
  { key: 'crossing', label: 'Dośrodkowania' },
  { key: 'leadership', label: 'Przywództwo' },
  { key: 'mentality', label: 'Mentalność' },
  { key: 'workRate', label: 'Pracowitość' },
];

const LIKELIHOOD_LABELS: Record<TransferLikelihood, string> = {
  LOW: 'Mało prawdopodobny',
  MEDIUM: 'Średnio prawdopodobny',
  LIKELY: 'Prawdopodobny',
  CERTAIN: 'Pewny',
};

const LIKELIHOOD_FILTER_OPTIONS: { value: TransferLikelihoodFilter; label: string }[] = [
  { value: 'ANY', label: 'Każda' },
  { value: 'LOW', label: 'Mało prawdopodobny' },
  { value: 'MEDIUM', label: 'Średnio prawdopodobny' },
  { value: 'LIKELY', label: 'Prawdopodobny' },
  { value: 'CERTAIN', label: 'Pewny' },
];

const CONTRACT_STATUS_OPTIONS: { value: TransferScoutingContractStatus; label: string }[] = [
  { value: 'FREE_AGENT', label: 'Wolny agent' },
  { value: 'EXPIRING', label: 'Wygasający kontrakt' },
  { value: 'VALID', label: 'Ważny kontrakt' },
];

const REGIONS: { value: Region; label: string }[] = [
  { value: Region.POLAND, label: 'Polska' },
  { value: Region.BALKANS, label: 'Bałkany' },
  { value: Region.CZ_SK, label: 'Czechy i Słowacja' },
  { value: Region.IBERIA, label: 'Iberia' },
  { value: Region.GERMANY, label: 'Niemcy' },
  { value: Region.FRANCE, label: 'Francja' },
  { value: Region.EX_USSR, label: 'Europa Wschodnia' },
  { value: Region.SCANDINAVIA, label: 'Skandynawia' },
  { value: Region.SSA, label: 'Afryka Subsaharyjska' },
  { value: Region.BRAZIL, label: 'Brazylia' },
  { value: Region.ARGENTINA, label: 'Argentyna' },
  { value: Region.NORTH_AMERICA, label: 'Ameryka Północna' },
  { value: Region.ARABIA, label: 'Kraje arabskie' },
  { value: Region.JAPAN, label: 'Japonia' },
  { value: Region.KOREA, label: 'Korea' },
  { value: Region.OCEANIA, label: 'Oceania' },
];

const SCOUT_SKILLS: { key: 'judgment' | 'reach' | 'speed' | 'experience'; label: string; description: string }[] = [
  { key: 'judgment', label: 'Ocena zawodników', description: 'Trafność wyboru kandydatów' },
  { key: 'reach', label: 'Zasięg kontaktów', description: 'Dostęp do ukrytych zawodników' },
  { key: 'speed', label: 'Tempo raportu', description: 'Czas wykonania zadania' },
  { key: 'experience', label: 'Doświadczenie', description: 'Dokładność informacji rynkowych' },
];

const POSITION_LABELS: Record<PlayerPosition, string> = {
  [PlayerPosition.GK]: 'Bramkarze',
  [PlayerPosition.DEF]: 'Obrońcy',
  [PlayerPosition.MID]: 'Pomocnicy',
  [PlayerPosition.FWD]: 'Napastnicy',
};

const getScoutProfile = (scout: TransferScout): string => {
  const strongest = SCOUT_SKILLS.reduce((best, skill) => scout[skill.key] > scout[best.key] ? skill : best);
  if (strongest.key === 'judgment') return 'Analityk talentu';
  if (strongest.key === 'reach') return 'Łowca kontaktów';
  if (strongest.key === 'speed') return 'Szybki raport';
  return 'Ekspert rynku';
};

const getScoutSpecialty = (scout: TransferScout): string => {
  const specialties: string[] = [];
  if (scout.regionalSpecialty) {
    specialties.push(REGIONS.find(region => region.value === scout.regionalSpecialty)?.label ?? scout.regionalSpecialty);
  }
  if (scout.positionSpecialty) specialties.push(POSITION_LABELS[scout.positionSpecialty]);
  return specialties.length > 0 ? `Specjalizacja: ${specialties.join(' · ')}` : 'Profil uniwersalny';
};

const getScoutReputationStars = (scout: TransferScout): string =>
  `${'★'.repeat(scout.reputation)}${'☆'.repeat(5 - scout.reputation)}`;

const scoutAttrColor = (value: number): string =>
  value >= 17 ? '#34d399' : value >= 13 ? '#60a5fa' : value >= 9 ? '#facc15' : value >= 5 ? '#fb923c' : '#fb7185';

const ScoutAttributeRadar: React.FC<{ scout: TransferScout }> = ({ scout }) => {
  const center = 70;
  const radius = 50;
  const values = SCOUT_SKILLS.map(skill => scout[skill.key]);
  const point = (index: number, value: number) => {
    const angle = -Math.PI / 2 + index * Math.PI / 2;
    const distance = radius * value / 20;
    return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
  };
  const gridPoint = (index: number, scale: number) => {
    const angle = -Math.PI / 2 + index * Math.PI / 2;
    return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
  };

  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="transfer-scout-radar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {[0.33, 0.66, 1].map(scale => (
        <polygon key={scale} points={values.map((_, index) => gridPoint(index, scale)).join(' ')} fill="none" stroke="#e0f2fe" strokeOpacity="0.1" />
      ))}
      {values.map((_, index) => {
        const [x, y] = gridPoint(index, 1).split(',');
        return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="#e0f2fe" strokeOpacity="0.07" />;
      })}
      <polygon points={values.map((value, index) => point(index, value)).join(' ')} fill="url(#transfer-scout-radar)" fillOpacity="0.22" stroke="url(#transfer-scout-radar)" strokeWidth="2" strokeLinejoin="round" />
      {values.map((value, index) => {
        const [x, y] = point(index, value).split(',');
        return <circle key={SCOUT_SKILLS[index].key} cx={x} cy={y} r="4" fill={scoutAttrColor(value)} stroke="#050b14" strokeWidth="1.5" />;
      })}
    </svg>
  );
};

const ScoutQualityPreview: React.FC<{ scout: TransferScout; marketScout: boolean; left: number; top: number }> = ({ scout, marketScout, left, top }) => {
  const nationality = REGIONS.find(region => region.value === scout.nationality)?.label ?? scout.nationality;
  const initials = `${scout.firstName[0] ?? '?'}${scout.lastName[0] ?? '?'}`.toUpperCase();

  return (
    <div
      className="pointer-events-none fixed z-[120] w-[390px] overflow-hidden rounded-[28px] border border-sky-400/15 bg-gradient-to-b from-[#13233a]/[0.98] via-[#0a1626]/[0.98] to-[#050b14]/[0.98] p-5 shadow-[0_0_60px_rgba(56,189,248,0.16),0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-md"
      style={{ left, top }}
      role="tooltip"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(125,211,252,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,.5) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
      <div className="relative z-10">
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            <svg viewBox="0 0 64 64" className="absolute inset-0 h-16 w-16" aria-hidden>
              <circle cx="32" cy="32" r="29" fill="none" stroke="#facc15" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="6 9" strokeLinecap="round" />
            </svg>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gradient-to-b from-slate-700 to-slate-900 shadow-inner">
              <span className="text-base font-black italic tracking-tighter text-white">{initials}</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black italic uppercase tracking-[0.22em] text-yellow-400">Skaut transferowy</p>
            <h4 className="mt-1 truncate text-xl font-black italic uppercase tracking-tighter text-white">{scout.firstName} {scout.lastName}</h4>
            <p className="mt-0.5 text-[9px] font-black italic uppercase tracking-tighter text-slate-400">{scout.age} lat · {nationality} · {getScoutProfile(scout)}</p>
            <p className="mt-1 text-[12px] font-black italic uppercase tracking-[0.08em] text-amber-300"><span className="mr-2 text-[7px] text-slate-500">Reputacja</span>{getScoutReputationStars(scout)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[118px_minmax(0,1fr)] items-center gap-4">
          <div>
            <div className="h-[118px] w-[118px]"><ScoutAttributeRadar scout={scout} /></div>
            <p className="mt-1 text-center text-[7px] font-black italic uppercase tracking-tighter text-slate-500">Profil kompetencji</p>
          </div>
          <div className="space-y-2">
            {SCOUT_SKILLS.map(skill => {
              const value = scout[skill.key];
              const color = scoutAttrColor(value);
              return (
                <div key={skill.key} className="rounded-xl border border-white/5 bg-black/25 px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[8px] font-black italic uppercase tracking-tighter text-slate-300">{skill.label}</p>
                      <p className="truncate text-[6px] font-black italic uppercase tracking-tighter text-slate-600">{skill.description}</p>
                    </div>
                    <p className="shrink-0 text-[10px] font-black italic tabular-nums" style={{ color }}>{value}<span className="text-slate-600">/20</span></p>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${value / 20 * 100}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, boxShadow: `0 0 8px ${color}66` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[8px] font-black italic uppercase tracking-tighter text-cyan-300">{getScoutSpecialty(scout)}</p>
          <div className="mt-1 flex items-center justify-between gap-3 text-[8px] font-black italic uppercase tracking-tighter text-slate-400">
            <span>{(scout.contract?.weeklySalary ?? scout.weeklySalary).toLocaleString('pl-PL')} PLN / tydz.</span>
            {marketScout
              ? <span className="text-amber-300">Oczekiwania kontraktowe</span>
              : <span className="text-amber-300">Do {scout.contract?.endDate ?? 'bezterminowo'}</span>}
          </div>
          <p className="mt-2 text-[7px] font-black italic uppercase tracking-tighter leading-relaxed text-slate-500">Dodatkowa szansa przekonania odnalezionego zawodnika do rozpoczęcia rozmów: <span className="text-emerald-300">{TransferScoutingService.getScoutPersuasionChance(scout.reputation)}%</span>.</p>
        </div>
      </div>
    </div>
  );
};

const ScoutPreviewAnchor: React.FC<{ scout: TransferScout; marketScout?: boolean; children: React.ReactNode }> = ({ scout, marketScout = false, children }) => {
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  const showPreview = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const previewWidth = 390;
    const previewHeight = 420;
    const gap = 12;
    const left = rect.right + gap + previewWidth <= window.innerWidth - 16
      ? rect.right + gap
      : Math.max(16, rect.left - previewWidth - gap);
    const top = Math.max(16, Math.min(rect.top, window.innerHeight - previewHeight - 16));
    setPosition({ left, top });
  };

  return (
    <div
      onMouseEnter={event => showPreview(event.currentTarget)}
      onMouseLeave={() => setPosition(null)}
      onFocus={event => showPreview(event.currentTarget)}
      onBlur={() => setPosition(null)}
    >
      {children}
      {position && createPortal(<ScoutQualityPreview scout={scout} marketScout={marketScout} {...position} />, document.body)}
    </div>
  );
};

const createDefaultFilters = (): TransferScoutingFilters => ({
  position: undefined,
  region: undefined,
  nationalityCountry: '',
  ageMin: 16,
  ageMax: 35,
  contractStatus: 'VALID',
  likelihood: 'ANY',
  attributes: {},
});

export const TransferScoutingModal: React.FC<TransferScoutingModalProps> = React.memo(({ onClose }) => {
  const {
    players,
    clubs,
    userTeamId,
    currentDate,
    employedTransferScouts,
    transferScoutMarket,
    transferScoutingAssignments,
    transferScoutingReports,
    discoveredTransferPlayerIds,
    hireTransferScout,
    fireTransferScout,
    startTransferScoutingAssignment,
    cancelTransferScoutingAssignment,
    showGameNotification,
    viewPlayerDetails,
  } = useGame();
  const [selectedScoutId, setSelectedScoutId] = useState('');
  const [filters, setFilters] = useState<TransferScoutingFilters>(createDefaultFilters);
  const [cancelScoutId, setCancelScoutId] = useState<string | null>(null);
  const [hireScoutId, setHireScoutId] = useState<string | null>(null);
  const [contractYears, setContractYears] = useState<TransferScoutContractYears>(2);
  const [contractWeeklySalary, setContractWeeklySalary] = useState(0);
  const [fireScoutId, setFireScoutId] = useState<string | null>(null);

  const playerIndex = useMemo(() => {
    const byId = new Map<string, Player>();
    const nationalities = new Set<string>();
    Object.values(players).forEach(squad => squad.forEach(player => {
      byId.set(player.id, player);
      if (player.nationalityCountry) nationalities.add(player.nationalityCountry);
    }));
    return {
      byId,
      nationalities: Array.from(nationalities).sort((left, right) => left.localeCompare(right, 'pl')),
    };
  }, [players]);

  useEffect(() => {
    if (selectedScoutId && employedTransferScouts.some(scout => scout.id === selectedScoutId)) return;
    setSelectedScoutId(employedTransferScouts[0]?.id ?? '');
  }, [employedTransferScouts, selectedScoutId]);

  useEffect(() => {
    const assignment = transferScoutingAssignments.find(entry => entry.scoutId === selectedScoutId);
    if (assignment) setFilters({ ...createDefaultFilters(), ...assignment.filters });
  }, [selectedScoutId, transferScoutingAssignments]);

  const selectedScout = employedTransferScouts.find(scout => scout.id === selectedScoutId) ?? null;
  const selectedAssignment = selectedScout
    ? transferScoutingAssignments.find(assignment => assignment.scoutId === selectedScout.id) ?? null
    : null;
  const previewCost = selectedScout ? TransferScoutingService.getAssignmentCost(selectedScout, filters) : 0;
  const previewDays = selectedScout ? TransferScoutingService.getAssignmentDays(selectedScout, filters) : 0;
  const userClub = clubs.find(club => club.id === userTeamId) ?? null;
  const hireScout = hireScoutId ? transferScoutMarket.find(scout => scout.id === hireScoutId) ?? null : null;
  const contractOffer = { durationYears: contractYears, weeklySalary: contractWeeklySalary };
  const contractPenalty = hireScout
    ? TransferScoutingService.buildScoutContract(hireScout, contractOffer, currentDate).earlyTerminationPenalty
    : 0;
  const roundedWeeklySalary = Math.max(0, Math.round(contractWeeklySalary / 500) * 500);
  const roundedMonthlySalary = Math.round(roundedWeeklySalary * 52 / 12 / 1_000) * 1_000;
  const contractAttempts = hireScout?.contractNegotiation?.clubId === userTeamId
    ? hireScout.contractNegotiation.attempts
    : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" onClick={onClose}>
      <div className="flex h-[92vh] w-[96vw] max-w-[1700px] flex-col overflow-hidden rounded-[30px] border border-amber-400/20 bg-slate-950 shadow-[0_40px_120px_rgba(0,0,0,0.85)]" onClick={event => event.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-amber-500/[0.04] px-7 py-5">
          <div>
            <h2 className="text-2xl text-white font-black italic uppercase tracking-tighter">Centrum <span className="text-amber-300">scoutingu</span></h2>
            <p className="mt-1 text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Wyszukiwanie istniejących i ukrytych zawodników na rynku transferowym</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Zatrudnieni skauci</p>
              <p className="text-lg text-amber-300 font-black italic uppercase tracking-tighter">{employedTransferScouts.length} / {TransferScoutingService.getMaxScouts()}</p>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white font-black italic uppercase tracking-tighter">✕</button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[330px_minmax(470px,1fr)_minmax(390px,0.9fr)]">
          <section className="min-h-0 overflow-y-auto border-r border-white/10 p-5 custom-scrollbar">
            <h3 className="mb-3 text-[11px] text-slate-400 font-black italic uppercase tracking-tighter">Mój dział skautingu</h3>
            <div className="space-y-2">
              {employedTransferScouts.length === 0 && <p className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-[10px] text-slate-600 font-black italic uppercase tracking-tighter">Zatrudnij pierwszego skauta z rynku poniżej.</p>}
              {employedTransferScouts.map(scout => {
                const active = transferScoutingAssignments.find(assignment => assignment.scoutId === scout.id);
                return (
                  <ScoutPreviewAnchor key={scout.id} scout={scout}>
                    <button onClick={() => {
                      setSelectedScoutId(scout.id);
                      setFilters(active ? { ...createDefaultFilters(), ...active.filters } : createDefaultFilters());
                    }} className={`w-full rounded-xl border p-3 text-left transition-all ${active ? `border-cyan-400/45 bg-cyan-500/15 shadow-[inset_3px_0_0_rgba(34,211,238,0.75)] ${selectedScoutId === scout.id ? 'ring-1 ring-amber-400/60' : ''}` : selectedScoutId === scout.id ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/5 bg-white/[0.025] hover:bg-white/[0.05]'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] text-white font-black italic uppercase tracking-tighter">{scout.firstName} {scout.lastName}</p>
                          <p className="mt-0.5 text-[8px] text-cyan-300 font-black italic uppercase tracking-tighter">{getScoutProfile(scout)}</p>
                        </div>
                        {active && <span className="rounded border border-amber-400/30 bg-amber-500/15 px-2 py-1 text-[8px] text-amber-300 font-black italic uppercase tracking-tighter">Wysłany</span>}
                      </div>
                      <p className="mt-2 truncate text-[7px] text-slate-400 font-black italic uppercase tracking-tighter">{getScoutSpecialty(scout)}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">{(scout.contract?.weeklySalary ?? scout.weeklySalary).toLocaleString('pl-PL')} PLN / tydz. · do {scout.contract?.endDate ?? '—'}</p>
                        <span className="text-[7px] text-slate-600 font-black italic uppercase tracking-tighter">Najedź, aby zobaczyć profil</span>
                      </div>
                    </button>
                  </ScoutPreviewAnchor>
                );
              })}
            </div>

            <div className="my-5 border-t border-white/10" />
            <div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-[11px] text-slate-400 font-black italic uppercase tracking-tighter">Rynek skautów</h3><span className="text-[8px] text-amber-300 font-black italic uppercase tracking-tighter">{transferScoutMarket.length} dostępnych</span></div>
            <div className="space-y-2">
              {transferScoutMarket.map(scout => {
                const limitReached = employedTransferScouts.length >= TransferScoutingService.getMaxScouts();
                return (
                  <ScoutPreviewAnchor key={scout.id} scout={scout} marketScout>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-sky-400/20 hover:bg-white/[0.04]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] text-white font-black italic uppercase tracking-tighter">{scout.firstName} {scout.lastName}</p>
                          <p className="text-[8px] text-cyan-300 font-black italic uppercase tracking-tighter">{getScoutProfile(scout)}</p>
                        </div>
                        <button disabled={limitReached} onClick={() => {
                          setHireScoutId(scout.id);
                          setContractYears(2);
                          setContractWeeklySalary(scout.contractNegotiation?.clubId === userTeamId
                            ? scout.contractNegotiation.demandedWeeklySalary
                            : scout.weeklySalary);
                        }} className="shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2 py-1.5 text-[8px] text-emerald-300 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-30 font-black italic uppercase tracking-tighter">Zatrudnij</button>
                      </div>
                      <p className="mt-2 truncate text-[7px] text-slate-400 font-black italic uppercase tracking-tighter">{getScoutSpecialty(scout)}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-[7px] text-slate-600 font-black italic uppercase tracking-tighter">Od {scout.weeklySalary.toLocaleString('pl-PL')} PLN / tydz.</p>
                        <span className="text-[8px] text-amber-300 font-black italic uppercase tracking-tighter">{getScoutReputationStars(scout)}</span>
                      </div>
                    </div>
                  </ScoutPreviewAnchor>
                );
              })}
            </div>
          </section>

          <section className="min-h-0 overflow-y-auto border-r border-white/10 p-6 custom-scrollbar">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[13px] text-white font-black italic uppercase tracking-tighter">Nowe zadanie</h3>
                <p className="mt-1 text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Określ profil poszukiwanego zawodnika</p>
              </div>
              {selectedScout && !selectedAssignment && <button onClick={() => {
                setFireScoutId(selectedScout.id);
              }} className="rounded-lg px-3 py-2 text-[8px] text-rose-400 hover:bg-rose-500/10 font-black italic uppercase tracking-tighter">Zwolnij skauta</button>}
            </div>

            {!selectedScout ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-[11px] text-slate-600 font-black italic uppercase tracking-tighter">Wybierz lub zatrudnij skauta.</div>
            ) : (
              <>
                <fieldset disabled={!!selectedAssignment} className="space-y-5 disabled:opacity-60">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Pozycja
                      <select value={filters.position ?? ''} onChange={event => setFilters(previous => ({ ...previous, position: event.target.value ? event.target.value as PlayerPosition : undefined }))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-[10px] text-white outline-none font-black italic uppercase tracking-tighter">
                        <option value="">Dowolna</option><option value={PlayerPosition.GK}>Bramkarz</option><option value={PlayerPosition.DEF}>Obrońca</option><option value={PlayerPosition.MID}>Pomocnik</option><option value={PlayerPosition.FWD}>Napastnik</option>
                      </select>
                    </label>
                    <label className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Region
                      <select value={filters.region ?? ''} onChange={event => setFilters(previous => ({ ...previous, region: event.target.value ? event.target.value as Region : undefined, nationalityCountry: event.target.value ? '' : previous.nationalityCountry }))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-[10px] text-white outline-none font-black italic uppercase tracking-tighter">
                        <option value="">Dowolny region</option>{REGIONS.map(region => <option key={region.value} value={region.value}>{region.label}</option>)}
                      </select>
                    </label>
                    <label className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Narodowość zamiast regionu
                      <select value={filters.nationalityCountry ?? ''} onChange={event => setFilters(previous => ({ ...previous, nationalityCountry: event.target.value, region: event.target.value ? undefined : previous.region }))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-[10px] text-white outline-none font-black italic uppercase tracking-tighter">
                        <option value="">Dowolna narodowość</option>
                        {playerIndex.nationalities.map(country => <option key={country} value={country}>{country}</option>)}
                      </select>
                    </label>
                    <label className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Szansa transferu
                      <select value={filters.likelihood} onChange={event => setFilters(previous => ({ ...previous, likelihood: event.target.value as TransferLikelihoodFilter }))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-[10px] text-white outline-none font-black italic uppercase tracking-tighter">
                        {LIKELIHOOD_FILTER_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <label className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Wiek od<input type="number" min={16} max={43} value={filters.ageMin} onChange={event => setFilters(previous => ({ ...previous, ageMin: Number(event.target.value) }))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-[10px] text-white outline-none font-black italic uppercase tracking-tighter" /></label>
                    <label className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Wiek do<input type="number" min={16} max={43} value={filters.ageMax} onChange={event => setFilters(previous => ({ ...previous, ageMax: Number(event.target.value) }))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-[10px] text-white outline-none font-black italic uppercase tracking-tighter" /></label>
                    <label className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Status kontraktu
                      <select value={filters.contractStatus} onChange={event => setFilters(previous => ({ ...previous, contractStatus: event.target.value as TransferScoutingContractStatus }))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-[10px] text-white outline-none font-black italic uppercase tracking-tighter">
                        {CONTRACT_STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
                  </div>

                  <div>
                    <h4 className="mb-1.5 text-[10px] text-slate-400 font-black italic uppercase tracking-tighter">Wymagane atrybuty od–do</h4>
                    <div className="grid grid-cols-2 gap-x-6 border-y border-white/10">
                      {[0, 1].map(column => (
                        <div key={`attribute-header-${column}`} className="grid grid-cols-[minmax(0,1fr)_42px_42px] items-center gap-1 border-b border-white/10 py-1 text-[7px] text-slate-600 font-black italic uppercase tracking-tighter">
                          <span>Atrybut</span><span className="text-center">Od</span><span className="text-center">Do</span>
                        </div>
                      ))}
                      {ATTRIBUTE_OPTIONS.map(attribute => {
                        const range = filters.attributes[attribute.key];
                        return (
                          <div key={attribute.key} className="grid min-h-8 grid-cols-[minmax(0,1fr)_42px_42px] items-center gap-1 border-b border-white/5 py-0.5">
                            <label className={`flex min-w-0 items-center gap-1.5 truncate text-[8px] font-black italic uppercase tracking-tighter ${range ? 'text-amber-300' : 'text-slate-400'}`}><input type="checkbox" checked={!!range} className="h-3 w-3 shrink-0 accent-amber-400" onChange={event => setFilters(previous => {
                              const attributes = { ...previous.attributes };
                              if (event.target.checked) attributes[attribute.key] = { min: 1, max: 99 }; else delete attributes[attribute.key];
                              return { ...previous, attributes };
                            })} />{attribute.label}</label>
                            <input aria-label={`${attribute.label} od`} type="number" min={1} max={99} disabled={!range} value={range?.min ?? 1} onChange={event => setFilters(previous => ({ ...previous, attributes: { ...previous.attributes, [attribute.key]: { min: Number(event.target.value), max: previous.attributes[attribute.key]?.max ?? 99 } } }))} className="h-6 w-full border-b border-white/10 bg-transparent px-0.5 text-center text-[8px] text-white outline-none focus:border-amber-400/60 disabled:text-slate-800 font-black italic uppercase tracking-tighter" />
                            <input aria-label={`${attribute.label} do`} type="number" min={1} max={99} disabled={!range} value={range?.max ?? 99} onChange={event => setFilters(previous => ({ ...previous, attributes: { ...previous.attributes, [attribute.key]: { min: previous.attributes[attribute.key]?.min ?? 1, max: Number(event.target.value) } } }))} className="h-6 w-full border-b border-white/10 bg-transparent px-0.5 text-center text-[8px] text-white outline-none focus:border-amber-400/60 disabled:text-slate-800 font-black italic uppercase tracking-tighter" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </fieldset>

                {selectedAssignment ? (
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                    <p className="text-[11px] text-emerald-300 font-black italic uppercase tracking-tighter">Skaut pracuje nad raportem</p>
                    <p className="mt-1 text-[9px] text-slate-400 font-black italic uppercase tracking-tighter">Zakończenie: {selectedAssignment.completionDate} · koszt {selectedAssignment.cost.toLocaleString('pl-PL')} PLN</p>
                    <button type="button" onClick={() => setCancelScoutId(selectedScout.id)} className="mt-3 w-full rounded-xl border border-rose-500/30 bg-rose-500/15 py-2.5 text-[9px] text-rose-300 hover:bg-rose-500/25 font-black italic uppercase tracking-tighter">Odwołaj skauta</button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3"><p className="text-[9px] text-slate-400 font-black italic uppercase tracking-tighter">Czas: {previewDays} dni</p><p className="text-[9px] text-amber-300 font-black italic uppercase tracking-tighter">Koszt: {previewCost.toLocaleString('pl-PL')} PLN</p></div>
                    <button type="button" onClick={() => {
                      const result = startTransferScoutingAssignment(selectedScout.id, filters);
                      showGameNotification({ title: result.ok ? 'Skaut wysłany' : 'Nie można rozpocząć', message: result.message, tone: result.ok ? 'success' : 'warning' });
                    }} className="w-full rounded-xl border border-amber-400/35 bg-amber-500/20 py-3 text-[10px] text-amber-200 hover:bg-amber-500/30 font-black italic uppercase tracking-tighter">Wyślij skauta</button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="min-h-0 overflow-y-auto p-5 custom-scrollbar">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-[12px] text-white font-black italic uppercase tracking-tighter">Raporty</h3><span className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Odkryci: {discoveredTransferPlayerIds.length}</span></div>
            {transferScoutingReports.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-[10px] text-slate-600 font-black italic uppercase tracking-tighter">Pierwszy raport pojawi się po zakończeniu zadania.</div> : (
              <div className="space-y-4">{transferScoutingReports.map(report => (
                <div key={report.id} className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
                  <div className="mb-3"><p className="text-[11px] text-white font-black italic uppercase tracking-tighter">{report.scoutName}</p><p className="text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">{report.completedDate} · {report.candidates.length} kandydatów</p></div>
                  {report.candidates.length === 0 ? <p className="text-[9px] text-slate-600 font-black italic uppercase tracking-tighter">Brak zawodników spełniających kryteria.</p> : (
                    <div className="space-y-2">{report.candidates.map(candidate => {
                      const player = playerIndex.byId.get(candidate.playerId);
                      if (!player) return null;
                      const likelihoodColor = candidate.likelihood === 'CERTAIN' ? 'text-emerald-300' : candidate.likelihood === 'LIKELY' ? 'text-cyan-300' : candidate.likelihood === 'MEDIUM' ? 'text-amber-300' : 'text-rose-300';
                      return (
                        <button key={candidate.playerId} onClick={() => { onClose(); viewPlayerDetails(candidate.playerId); }} className="w-full rounded-xl border border-white/5 bg-slate-900/70 p-3 text-left hover:border-white/15 hover:bg-slate-900">
                          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[11px] text-white font-black italic uppercase tracking-tighter">{player.firstName} {player.lastName}</p><p className="mt-0.5 text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">{player.position} · {player.age} lat · {player.nationalityCountry ?? player.nationality}</p></div><span className="shrink-0 text-[10px] text-emerald-300 font-black italic uppercase tracking-tighter">{candidate.matchScore}% dopasowania</span></div>
                          <p className={`mt-2 text-[9px] ${likelihoodColor} font-black italic uppercase tracking-tighter`}>Transfer: {LIKELIHOOD_LABELS[candidate.likelihood]} · {candidate.probabilityMin}–{candidate.probabilityMax}%</p>
                          <p className="mt-1 text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">Wartość: {candidate.estimatedMarketValue.min.toLocaleString('pl-PL')}–{candidate.estimatedMarketValue.max.toLocaleString('pl-PL')} PLN</p>
                          <p className="mt-1 text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">Pensja roczna: {candidate.estimatedAnnualSalary.min.toLocaleString('pl-PL')}–{candidate.estimatedAnnualSalary.max.toLocaleString('pl-PL')} PLN</p>
                        </button>
                      );
                    })}</div>
                  )}
                </div>
              ))}</div>
            )}
          </section>
        </div>
      </div>

      {hireScout && userClub && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 px-4" onClick={() => setHireScoutId(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-sky-400/20 bg-gradient-to-b from-[#13233a] to-[#050b14] shadow-[0_30px_80px_rgba(0,0,0,0.75)]" onClick={event => event.stopPropagation()}>
            <div className="border-b border-white/10 p-6 text-center">
              <p className="text-[9px] text-amber-300 font-black italic uppercase tracking-tighter">Negocjacje ze skautem</p>
              <h3 className="mt-1 text-2xl text-white font-black italic uppercase tracking-tighter">{hireScout.firstName} {hireScout.lastName}</h3>
              <p className="mt-1 text-[13px] text-amber-300 font-black italic uppercase tracking-[0.1em]">{getScoutReputationStars(hireScout)}</p>
              <p className="mt-1 text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">Reputacja {hireScout.reputation}/5 · runda {Math.min(3, contractAttempts + 1)}/3 · oczekuje od {(hireScout.contractNegotiation?.demandedWeeklySalary ?? hireScout.weeklySalary).toLocaleString('pl-PL')} PLN tygodniowo</p>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Okres kontraktu
                  <select value={contractYears} onChange={event => setContractYears(Number(event.target.value) as TransferScoutContractYears)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-[10px] text-white outline-none font-black italic uppercase tracking-tighter">
                    <option value={1}>1 rok</option><option value={2}>2 lata</option><option value={3}>3 lata</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Pensja tygodniowa
                  <input type="number" min={500} step={500} value={contractWeeklySalary} onChange={event => setContractWeeklySalary(Math.max(0, Number(event.target.value)))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-[10px] text-white outline-none font-black italic uppercase tracking-tighter" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/5 bg-black/25 p-3">
                  <p className="text-[7px] text-slate-500 font-black italic uppercase tracking-tighter">Pensja</p>
                  <p className="mt-1 text-[10px] text-white font-black italic uppercase tracking-tighter">{roundedWeeklySalary.toLocaleString('pl-PL')} tyg. · {roundedMonthlySalary.toLocaleString('pl-PL')} mies.</p>
                </div>
                <div className="rounded-xl border border-rose-400/15 bg-rose-500/[0.07] p-3">
                  <p className="text-[7px] text-rose-300/70 font-black italic uppercase tracking-tighter">Maks. kara</p>
                  <p className="mt-1 text-[10px] text-rose-300 font-black italic uppercase tracking-tighter">{contractPenalty.toLocaleString('pl-PL')} PLN</p>
                </div>
              </div>

              <p className="text-[8px] leading-relaxed text-slate-400 font-black italic uppercase tracking-tighter">Masz maksymalnie trzy oferty. Zbyt niska propozycja może wywołać kontrofertę albo natychmiast zerwać rozmowy. Renomowany skaut zwykle odrzuci słaby klub, ale czasem może zrobić wyjątek.</p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button onClick={() => setHireScoutId(null)} className="rounded-xl border border-white/10 bg-white/5 py-3 text-[9px] text-slate-400 hover:bg-white/10 font-black italic uppercase tracking-tighter">Anuluj</button>
                <button onClick={() => {
                  const result = hireTransferScout(hireScout.id, contractOffer);
                  if (result.ok) {
                    setSelectedScoutId(hireScout.id);
                    setHireScoutId(null);
                  } else if (result.status === 'COUNTER' && result.counterWeeklySalary) {
                    setContractWeeklySalary(result.counterWeeklySalary);
                  } else if (result.status === 'WALKED_AWAY') {
                    setHireScoutId(null);
                  }
                  const cooldownMessage = result.status === 'WALKED_AWAY' && result.unavailableUntil
                    ? `${result.message} Nie będzie dostępny na rynku do ${result.unavailableUntil}.`
                    : result.message;
                  showGameNotification({
                    title: result.ok ? 'Kontrakt podpisany' : result.status === 'COUNTER' ? 'Kontroferta skauta' : result.status === 'WALKED_AWAY' ? 'Rozmowy zerwane' : 'Oferta odrzucona',
                    message: cooldownMessage,
                    tone: result.ok ? 'success' : 'warning',
                  });
                }} className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 py-3 text-[9px] text-emerald-200 hover:bg-emerald-500/30 font-black italic uppercase tracking-tighter">Złóż ofertę {Math.min(3, contractAttempts + 1)}/3</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fireScoutId && (() => {
        const scout = employedTransferScouts.find(entry => entry.id === fireScoutId);
        if (!scout) return null;
        const penalty = TransferScoutingService.getEarlyTerminationPenalty(scout, currentDate);
        return (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 px-4" onClick={() => setFireScoutId(null)}>
            <div className="w-full max-w-md rounded-[28px] border border-rose-400/25 bg-slate-950 p-7 text-center shadow-2xl" onClick={event => event.stopPropagation()}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 text-2xl text-rose-300">!</div>
              <h3 className="mt-5 text-xl text-white font-black italic uppercase tracking-tighter">Rozwiązać kontrakt?</h3>
              <p className="mt-2 text-[11px] text-slate-300 font-black italic uppercase tracking-tighter">{scout.firstName} {scout.lastName}</p>
              <p className="mt-1 text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">Umowa do {scout.contract?.endDate ?? 'brak daty końcowej'}</p>
              <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4">
                <p className="text-[8px] text-rose-300/70 font-black italic uppercase tracking-tighter">Kara za wcześniejsze zwolnienie</p>
                <p className="mt-1 text-lg text-rose-300 font-black italic uppercase tracking-tighter">{penalty.toLocaleString('pl-PL')} PLN</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => setFireScoutId(null)} className="rounded-xl border border-white/10 bg-white/5 py-3 text-[9px] text-slate-400 hover:bg-white/10 font-black italic uppercase tracking-tighter">Zostaw w klubie</button>
                <button onClick={() => {
                  const result = fireTransferScout(scout.id);
                  if (result.ok) setFireScoutId(null);
                  showGameNotification({ title: result.ok ? 'Kontrakt rozwiązany' : 'Nie można zwolnić', message: result.message, tone: 'warning' });
                }} className="rounded-xl border border-rose-500/30 bg-rose-500/20 py-3 text-[9px] text-rose-200 hover:bg-rose-500/30 font-black italic uppercase tracking-tighter">Zwolnij i zapłać</button>
              </div>
            </div>
          </div>
        );
      })()}

      {cancelScoutId && (() => {
        const assignment = transferScoutingAssignments.find(entry => entry.scoutId === cancelScoutId);
        const scout = employedTransferScouts.find(entry => entry.id === cancelScoutId);
        if (!assignment || !scout) return null;
        return (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 px-4" onClick={event => event.stopPropagation()}>
            <div className="w-full max-w-md rounded-[28px] border border-amber-400/25 bg-slate-950 p-7 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-2xl text-amber-300">!</div>
              <h3 className="mt-5 text-xl text-white font-black italic uppercase tracking-tighter">Odwołać skauta?</h3>
              <p className="mt-2 text-[11px] text-slate-300 font-black italic uppercase tracking-tighter">{scout.firstName} {scout.lastName}</p>
              <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-[10px] text-amber-200 font-black italic uppercase tracking-tighter">Koszt zadania {assignment.cost.toLocaleString('pl-PL')} PLN nie zostanie zwrócony.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => setCancelScoutId(null)} className="rounded-xl border border-white/10 bg-white/5 py-3 text-[9px] text-slate-400 hover:bg-white/10 font-black italic uppercase tracking-tighter">Zostaw na misji</button>
                <button onClick={() => {
                  const result = cancelTransferScoutingAssignment(scout.id);
                  setCancelScoutId(null);
                  showGameNotification({ title: result.ok ? 'Skaut odwołany' : 'Nie można odwołać', message: result.message, tone: 'warning' });
                }} className="rounded-xl border border-rose-500/30 bg-rose-500/20 py-3 text-[9px] text-rose-200 hover:bg-rose-500/30 font-black italic uppercase tracking-tighter">Odwołaj</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
});

TransferScoutingModal.displayName = 'TransferScoutingModal';
