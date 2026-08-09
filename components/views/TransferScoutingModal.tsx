import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  PlayerAttributes,
  Player,
  PlayerPosition,
  Region,
  TransferLikelihood,
  TransferLikelihoodFilter,
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
  { key: 'goalkeeping', label: 'Bramkarstwo' },
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
                const stars = TransferScoutingService.getScoutStars(scout);
                return (
                  <button key={scout.id} onClick={() => {
                    setSelectedScoutId(scout.id);
                    setFilters(active ? { ...createDefaultFilters(), ...active.filters } : createDefaultFilters());
                  }} className={`w-full rounded-xl border p-3 text-left transition-all ${selectedScoutId === scout.id ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/5 bg-white/[0.025] hover:bg-white/[0.05]'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-white font-black italic uppercase tracking-tighter">{scout.firstName} {scout.lastName}</p>
                        <p className="mt-0.5 text-[10px] text-amber-300 font-black italic uppercase tracking-tighter">{'★'.repeat(stars)}<span className="text-slate-700">{'★'.repeat(5 - stars)}</span></p>
                      </div>
                      {active && <span className="rounded bg-emerald-500/15 px-2 py-1 text-[8px] text-emerald-300 font-black italic uppercase tracking-tighter">Wysłany</span>}
                    </div>
                    <p className="mt-2 text-[9px] text-slate-500 font-black italic uppercase tracking-tighter">Ocena {scout.judgment} · Zasięg {scout.reach} · Szybkość {scout.speed}</p>
                    <p className="mt-1 text-[9px] text-slate-400 font-black italic uppercase tracking-tighter">{scout.weeklySalary.toLocaleString('pl-PL')} PLN / tydz.</p>
                  </button>
                );
              })}
            </div>

            <div className="my-5 border-t border-white/10" />
            <h3 className="mb-3 text-[11px] text-slate-400 font-black italic uppercase tracking-tighter">Rynek skautów</h3>
            <div className="space-y-2">
              {transferScoutMarket.map(scout => {
                const stars = TransferScoutingService.getScoutStars(scout);
                const limitReached = employedTransferScouts.length >= TransferScoutingService.getMaxScouts();
                return (
                  <div key={scout.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] text-white font-black italic uppercase tracking-tighter">{scout.firstName} {scout.lastName}</p>
                        <p className="text-[9px] text-amber-300 font-black italic uppercase tracking-tighter">{'★'.repeat(stars)}<span className="text-slate-700">{'★'.repeat(5 - stars)}</span></p>
                        <p className="mt-1 text-[8px] text-slate-500 font-black italic uppercase tracking-tighter">{scout.nationality} · {scout.weeklySalary.toLocaleString('pl-PL')} PLN / tydz.</p>
                      </div>
                      <button disabled={limitReached} onClick={() => {
                        const result = hireTransferScout(scout.id);
                        if (result.ok) setSelectedScoutId(scout.id);
                        showGameNotification({ title: result.ok ? 'Skaut zatrudniony' : 'Nie można zatrudnić', message: result.message, tone: result.ok ? 'success' : 'warning' });
                      }} className="shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2 py-1.5 text-[8px] text-emerald-300 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-30 font-black italic uppercase tracking-tighter">Zatrudnij</button>
                    </div>
                    <p className="mt-2 text-[8px] text-slate-600 font-black italic uppercase tracking-tighter">Opłata: {(scout.weeklySalary * 4).toLocaleString('pl-PL')} PLN</p>
                  </div>
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
                const result = fireTransferScout(selectedScout.id);
                showGameNotification({ title: result.ok ? 'Skaut zwolniony' : 'Nie można zwolnić', message: result.message, tone: 'warning' });
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
                      <input list="transfer-scout-nationalities" value={filters.nationalityCountry ?? ''} onChange={event => setFilters(previous => ({ ...previous, nationalityCountry: event.target.value, region: event.target.value ? undefined : previous.region }))} placeholder="Np. Brazylia" className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-[10px] text-white outline-none placeholder:text-slate-700 font-black italic uppercase tracking-tighter" />
                      <datalist id="transfer-scout-nationalities">{playerIndex.nationalities.map(country => <option key={country} value={country} />)}</datalist>
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
                    <h4 className="mb-2 text-[10px] text-slate-400 font-black italic uppercase tracking-tighter">Wymagane atrybuty od–do</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {ATTRIBUTE_OPTIONS.map(attribute => {
                        const range = filters.attributes[attribute.key];
                        return (
                          <div key={attribute.key} className={`grid grid-cols-[1fr_58px_58px] items-center gap-2 rounded-xl border p-2 ${range ? 'border-amber-400/20 bg-amber-500/[0.05]' : 'border-white/5 bg-white/[0.02]'}`}>
                            <label className="flex items-center gap-2 text-[9px] text-slate-300 font-black italic uppercase tracking-tighter"><input type="checkbox" checked={!!range} onChange={event => setFilters(previous => {
                              const attributes = { ...previous.attributes };
                              if (event.target.checked) attributes[attribute.key] = { min: 1, max: 99 }; else delete attributes[attribute.key];
                              return { ...previous, attributes };
                            })} />{attribute.label}</label>
                            <input type="number" min={1} max={99} disabled={!range} value={range?.min ?? 1} onChange={event => setFilters(previous => ({ ...previous, attributes: { ...previous.attributes, [attribute.key]: { min: Number(event.target.value), max: previous.attributes[attribute.key]?.max ?? 99 } } }))} className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-center text-[9px] text-white outline-none font-black italic uppercase tracking-tighter" />
                            <input type="number" min={1} max={99} disabled={!range} value={range?.max ?? 99} onChange={event => setFilters(previous => ({ ...previous, attributes: { ...previous.attributes, [attribute.key]: { min: previous.attributes[attribute.key]?.min ?? 1, max: Number(event.target.value) } } }))} className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-center text-[9px] text-white outline-none font-black italic uppercase tracking-tighter" />
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
